/**
 * パビリオン統合管理ストア
 * 既存PavilionManagerの全機能を移植
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PavilionData, TimeSlotSelection, TimeSlotData, ReservationResult } from '@/types/api'

export const usePavilionsStore = defineStore('pavilions', () => {
  // State
  const pavilions = ref<Map<string, PavilionData>>(new Map())
  const selectedTimeSlots = ref<TimeSlotSelection[]>([])
  const isAvailableOnlyFilter = ref(false)
  const isLoading = ref(false)
  const searchQuery = ref('')
  const lastSearchResults = ref<PavilionData[]>([])
  const favoriteIds = ref<Set<string>>(new Set())

  // Getters (computed)
  const allPavilions = computed(() => Array.from(pavilions.value.values()))
  
  const filteredPavilions = computed(() => {
    const results = allPavilions.value
    if (!isAvailableOnlyFilter.value) {
      return results
    }
    return results.filter(pavilion => 
      pavilion.dateStatus !== 2 && // 満員ではない
      pavilion.timeSlots.some(slot => slot.available) // 利用可能な時間帯がある
    )
  })

  const selectedTimeSlotsCount = computed(() => selectedTimeSlots.value.length)

  const availablePavilionsCount = computed(() => 
    allPavilions.value.filter(pavilion => 
      pavilion.dateStatus !== 2 && // 満員ではない
      pavilion.timeSlots.some(slot => slot.available) // 利用可能な時間帯がある
    ).length
  )

  const favoritePavilions = computed(() =>
    allPavilions.value.filter(pavilion => favoriteIds.value.has(pavilion.id))
  )

  // Actions - PavilionManagerから完全移行

  /**
   * 初期化処理
   */
  const initialize = () => {
    // favoriteIdsがSetでない場合はSetに変換（persist復元時の対応）
    if (!(favoriteIds.value instanceof Set)) {
      const idsArray = Array.isArray(favoriteIds.value) ? favoriteIds.value : []
      favoriteIds.value = new Set(idsArray)
    }
    console.log(`📋 お気に入り初期化: ${favoriteIds.value.size}件`)
  }

  /**
   * 公式API仕様に従ってAPIのURLを構築
   */
  const buildAPIUrl = (query: string, ticketIds: string[], entranceDate?: string): string => {
    // デフォルト値の設定
    const defaultEntranceDate = entranceDate || new Date(Date.now() + 24 * 60 * 60 * 1000)
      .toISOString().slice(0, 10).replace(/-/g, '') // 明日の日付
    const defaultChannel = '4' // fastタイプ
    
    // URLパラメータを構築
    const params = new URLSearchParams()
    
    // チケットID配列
    if (ticketIds.length > 0) {
      ticketIds.forEach(id => params.append('ticket_ids[]', id))
    }
    
    // イベント名検索
    if (query) {
      params.set('event_name', query)
    }
    
    // 入場日付
    params.set('entrance_date', defaultEntranceDate)
    
    // ページネーション・フィルタ設定
    params.set('count', '1')
    params.set('limit', '999')
    params.set('event_type', '0')
    params.set('next_token', '')
    params.set('channel', defaultChannel)
    
    return `/api/d/events?${params.toString()}`
  }

  /**
   * パビリオンIDから時間帯情報を取得（個別API呼び出し）
   */
  const getPavilionTimeSlots = async (pavilionId: string, ticketIds: string[] = [], entranceDate?: string): Promise<TimeSlotData[]> => {
    try {
      // 時間帯取得用の詳細APIを呼び出し
      const params = new URLSearchParams()
      if (ticketIds.length > 0) {
        ticketIds.forEach(id => params.append('ticket_ids[]', id))
      }
      if (entranceDate) {
        params.set('entrance_date', entranceDate)
      }
      params.set('count', '1')
      
      const timeslotUrl = `/api/d/events/${pavilionId}?${params.toString()}&channel=4`
      
      const response = await fetch(timeslotUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'X-Api-Lang': 'ja',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        console.warn(`⚠️ パビリオン${pavilionId}の時間帯取得失敗: ${response.status}`)
        return []
      }
      
      const data = await response.json()
      console.log(`🕐 パビリオン${pavilionId}時間帯取得:`, data)
      
      // event_schedulesオブジェクトから時間帯情報を抽出
      const timeSlots: TimeSlotData[] = []
      if (data.event_schedules && typeof data.event_schedules === 'object') {
        for (const [time, schedule] of Object.entries(data.event_schedules)) {
          const scheduleData = schedule as any
          
          // time_statusで空き状況を判定（2=満席、1=空きあり等を想定）
          const isAvailable = scheduleData.time_status !== 2
          
          timeSlots.push({
            time: time, // キーが時間（例：1040, 1100）
            endTime: scheduleData.end_time || '',
            available: isAvailable,
            selected: false,
            capacity: scheduleData.capacity || 0,
            reserved: scheduleData.reserved || 0,
            reservationType: scheduleData.reservation_type || '1日券',
            timeSlotId: scheduleData.schedule_code || time
          })
        }
      }
      
      console.log(`✅ パビリオン${pavilionId}時間帯パース完了: ${timeSlots.length}件`)
      return timeSlots
      
    } catch (error) {
      console.warn(`⚠️ パビリオン${pavilionId}の時間帯取得エラー:`, error)
      return []
    }
  }
  
  /**
   * パビリオンの時間帯情報を一括取得
   */
  const fetchPavilionTimeSlots = async (pavilions: PavilionData[], ticketIds: string[] = [], entranceDate?: string, includeFull: boolean = false): Promise<void> => {
    // 満員パビリオン（dateStatus: 2）は時間帯情報を取得しない（お気に入りの場合は例外）
    const availablePavilions = includeFull ? pavilions : pavilions.filter(p => p.dateStatus !== 2)
    
    console.log(`⏰ 時間帯取得対象: ${availablePavilions.length}/${pavilions.length}件（満員除外）`)
    
    // 並列実行でパフォーマンス向上（最大5件同時）
    const concurrency = Math.min(5, availablePavilions.length)
    const chunks: PavilionData[][] = []
    
    for (let i = 0; i < availablePavilions.length; i += concurrency) {
      chunks.push(availablePavilions.slice(i, i + concurrency))
    }
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (pavilion) => {
        const timeSlots = await getPavilionTimeSlots(pavilion.id, ticketIds, entranceDate)
        pavilion.timeSlots = timeSlots
        
        // 時間帯情報から満員状態を更新
        const hasAvailableSlots = timeSlots.some(slot => slot.available)
        if (!hasAvailableSlots && timeSlots.length > 0) {
          pavilion.dateStatus = 2 // 全て満員
        } else if (timeSlots.length === 0) {
          pavilion.dateStatus = 2 // 時間帯なし（満員扱い）
        } else {
          pavilion.dateStatus = 1 // 空きあり
        }
      })
      
      await Promise.all(promises)
    }
    
    // 満員パビリオンは空配列を設定
    pavilions.filter(p => p.dateStatus === 2).forEach(p => {
      p.timeSlots = []
    })
    
    console.log(`✅ 時間帯情報取得完了: ${pavilions.length}件`)
  }

  /**
   * 検索結果をパース（旧pavilion-manager.tsから完全移植）
   */
  const parseSearchResults = (data: any): PavilionData[] => {
    const pavilions: PavilionData[] = []
    
    try {
      if (data.list && Array.isArray(data.list)) {
        for (const item of data.list) {
          const pavilion = parseEventItem(item)
          if (pavilion) {
            pavilions.push(pavilion)
          }
        }
      }
    } catch (error) {
      console.error('❌ 検索結果パースエラー:', error)
    }
    
    return pavilions
  }


  /**
   * パビリオン検索実行
   */
  const searchPavilions = async (query: string = '', ticketIds: string[] = [], entranceDate?: string): Promise<PavilionData[]> => {
    console.log('🏛️ パビリオン検索開始:', { query, ticketIds: ticketIds.length, entranceDate })
    isLoading.value = true
    searchQuery.value = query
    
    // 検索開始時に古い結果をクリア
    pavilions.value.clear()
    lastSearchResults.value = []
    
    try {
      const apiUrl = buildAPIUrl(query, ticketIds, entranceDate)
      console.log('📡 API URL:', apiUrl)
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
          'X-Api-Lang': 'ja',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include'
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log('🔍 パビリオン検索API応答:', data)
      const pavilionResults = parseSearchResults(data)
      console.log(`✅ パビリオン一覧取得完了: ${pavilionResults.length}件`)
      
      // Step 2: 各パビリオンの時間帯情報を取得
      console.log('⏳ 時間帯情報取得開始...')
      await fetchPavilionTimeSlots(pavilionResults, ticketIds, entranceDate)
      
      // メモリに保存
      for (const pavilion of pavilionResults) {
        pavilions.value.set(pavilion.id, pavilion)
      }
      
      lastSearchResults.value = pavilionResults
      console.log(`🔍 パビリオン検索完了: ${pavilionResults.length}件（時間帯情報付き）`)
      return pavilionResults
    } catch (error) {
      console.error('❌ パビリオン検索エラー:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }


  /**
   * お気に入り読み込み処理  
   */
  const loadFavoritePavilions = async (): Promise<PavilionData[]> => {
    console.log('⭐ お気に入りパビリオン読み込み')
    isLoading.value = true

    try {
      if (favoriteIds.value.size === 0) {
        console.log('⭐ お気に入り未登録のため処理終了')
        return []
      }

      const favoriteIdArray = Array.from(favoriteIds.value)
      console.log(`🔍 お気に入りパビリオン検索中: ${favoriteIdArray.join(', ')}`)

      // お気に入りパビリオンの基本情報を取得
      const favoriteResults: PavilionData[] = []
      for (const favoriteId of favoriteIdArray) {
        try {
          const searchUrl = `/api/d/events/${favoriteId}`
          const response = await fetch(searchUrl, {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'X-Api-Lang': 'ja'
            },
            credentials: 'include'
          })
          
          if (response.ok) {
            const data = await response.json()
            if (data.event) {
              const pavilion = parseEventItem(data.event)
              if (pavilion) {
                favoriteResults.push(pavilion)
              }
            }
          }
        } catch (error) {
          console.warn(`⚠️ お気に入りパビリオン${favoriteId}の取得エラー:`, error)
        }
      }

      // 時間帯情報を一括取得
      if (favoriteResults.length > 0) {
        await fetchPavilionTimeSlots(favoriteResults, [], undefined, true)
      }
      
      // 結果を保存
      favoriteResults.forEach(pavilion => {
        pavilions.value.set(pavilion.id, pavilion)
      })

      lastSearchResults.value = favoriteResults
      return favoriteResults
    } catch (error) {
      console.error('❌ お気に入り読み込みエラー:', error)
      throw error
    } finally {
      isLoading.value = false
    }
  }

  /**
   * お気に入りに追加
   */
  const addToFavorites = (pavilionId: string, name: string) => {
    favoriteIds.value.add(pavilionId)
  }

  /**
   * お気に入りから削除
   */
  const removeFromFavorites = (pavilionId: string) => {
    favoriteIds.value.delete(pavilionId)
  }

  /**
   * 全お気に入りをクリア（デバッグ用）
   */
  const clearAllFavorites = () => {
    favoriteIds.value.clear()
    console.log(`🗑️ 全お気に入りクリア`)
  }


  /**
   * イベント項目をパビリオンデータに変換
   */
  const parseEventItem = (item: any): PavilionData | null => {
    try {
      const pavilionId = item.event_code || item.id
      if (!pavilionId) return null

      const pavilion: PavilionData = {
        id: pavilionId,
        name: item.event_name || item.name || 'Unknown',
        description: item.description || '',
        isFavorite: favoriteIds.value.has(pavilionId),
        timeSlots: parseTimeSlots(item.time_slots || []),
        reservationStatus: determineReservationStatus(item),
        location: item.location || '',
        category: item.category || '',
        imageUrl: item.image_url || '',
        tags: item.tags || [],
        dateStatus: item.date_status  // パビリオン単位の満員判定用
      }

      return pavilion
      
    } catch (error) {
      console.error('❌ イベント項目パースエラー:', error)
      return null
    }
  }

  /**
   * 時間帯データをパース（旧pavilion-manager.tsから完全移植）
   */
  const parseTimeSlots = (timeSlots: any[]): TimeSlotData[] => {
    if (!Array.isArray(timeSlots)) return []
    
    return timeSlots.map(slot => {
      try {
        return {
          time: slot.start_time || slot.time || '',
          endTime: slot.end_time || '',
          available: slot.available !== false && slot.status !== 'full',
          selected: false,
          capacity: slot.capacity || 0,
          reserved: slot.reserved || 0,
          reservationType: slot.reservation_type || '1日券',
          timeSlotId: slot.id || slot.time_slot_id || ''
        }
      } catch (error) {
        console.warn('⚠️ 時間帯パースエラー:', error)
        return {
          time: '',
          endTime: '',
          available: false,
          selected: false,
          capacity: 0,
          reserved: 0,
          reservationType: '1日券',
          timeSlotId: ''
        }
      }
    }).filter(slot => slot.time) // 空の時間帯は除外
  }

  /**
   * 予約状況を判定
   */
  const determineReservationStatus = (item: any): string => {
    if (item.date_status === 2) return 'full'
    if (item.available_slots > 0) return 'available'
    return 'limited'
  }

  /**
   * 空きのみフィルターの切り替え
   */
  const toggleAvailableOnlyFilter = () => {
    isAvailableOnlyFilter.value = !isAvailableOnlyFilter.value
  }

  /**
   * 時間帯選択を追加
   */
  const addSelectedTimeSlot = (selection: TimeSlotSelection): void => {
    selectedTimeSlots.value.push(selection)
    console.log('⏰ 時間帯選択追加:', selection)
  }

  /**
   * 時間帯選択を削除
   */
  const removeSelectedTimeSlot = (pavilionId: string, time: string): void => {
    const index = selectedTimeSlots.value.findIndex(
      s => s.pavilionId === pavilionId && s.timeSlot.time === time
    )
    if (index !== -1) {
      selectedTimeSlots.value.splice(index, 1)
      console.log('⏰ 時間帯選択削除:', { pavilionId, time })
    }
  }

  /**
   * 選択された時間帯をクリア
   */
  const clearSelectedTimeSlots = (): void => {
    selectedTimeSlots.value = []
    console.log('⏰ 時間帯選択クリア')
  }

  /**
   * パビリオンの全時間帯を選択
   */
  const selectAllTimeSlotsForPavilion = (pavilionId: string): void => {
    const pavilion = pavilions.value.get(pavilionId)
    if (!pavilion) return

    // 既存選択を削除
    selectedTimeSlots.value = selectedTimeSlots.value.filter(
      s => s.pavilionId !== pavilionId
    )

    // 利用可能な全時間帯を追加
    pavilion.timeSlots.forEach(timeSlot => {
      if (timeSlot.available) {
        selectedTimeSlots.value.push({
          pavilionId,
          pavilionName: pavilion.name,
          timeSlot,
          entranceDate: ''
        })
      }
    })

    console.log(`⏰ パビリオン全時間帯選択: ${pavilion.name}`)
  }

  /**
   * パビリオンの全時間帯選択を解除
   */
  const deselectAllTimeSlotsForPavilion = (pavilionId: string): void => {
    selectedTimeSlots.value = selectedTimeSlots.value.filter(
      s => s.pavilionId !== pavilionId
    )
    const pavilion = pavilions.value.get(pavilionId)
    console.log(`⏰ パビリオン全時間帯選択解除: ${pavilion?.name || pavilionId}`)
  }

  /**
   * 予約実行
   */
  const executeReservation = async (
    pavilionId: string, 
    timeSlot: TimeSlotData, 
    entranceDate: string, 
    registeredChannel: string
  ): Promise<ReservationResult> => {
    console.log('📋 予約実行開始:', { pavilionId, timeSlot, entranceDate, registeredChannel })

    try {
      // TODO: 実際の予約API呼び出しを実装
      // 現在はモックレスポンス
      await new Promise(resolve => setTimeout(resolve, 1000))

      return {
        success: false,
        message: '予約機能は未実装',
        details: {
          pavilionName: pavilions.value.get(pavilionId)?.name || '',
          timeSlot: timeSlot.time,
          ticketCount: 1
        }
      }
    } catch (error) {
      console.error('❌ 予約実行エラー:', error)
      return {
        success: false,
        message: '予約実行エラー',
        error: error instanceof Error ? error.message : String(error),
        details: {
          pavilionName: pavilions.value.get(pavilionId)?.name || '',
          timeSlot: timeSlot.time,
          ticketCount: 1
        }
      }
    }
  }

  return {
    // State
    pavilions,
    selectedTimeSlots,
    isAvailableOnlyFilter,
    isLoading,
    searchQuery,
    lastSearchResults,
    favoriteIds,

    // Computed
    allPavilions,
    filteredPavilions,
    selectedTimeSlotsCount,
    availablePavilionsCount,
    favoritePavilions,

    // Actions
    initialize,
    searchPavilions,
    loadFavoritePavilions,
    addToFavorites,
    removeFromFavorites,
    toggleAvailableOnlyFilter,
    addSelectedTimeSlot,
    removeSelectedTimeSlot,
    clearSelectedTimeSlots,
    selectAllTimeSlotsForPavilion,
    deselectAllTimeSlotsForPavilion,
    executeReservation,
    
    // Internal methods (for composable)
    buildAPIUrl,
    parseSearchResults,
    parseEventItem,
    parseTimeSlots
  }
}, {
  persist: {
    key: 'ytomo-pavilions-store',
    pick: ['isAvailableOnlyFilter', 'favoriteIds'],
    serializer: {
      serialize: (state: any) => {
        return JSON.stringify({
          ...state,
          favoriteIds: Array.from(state.favoriteIds || [])
        })
      },
      deserialize: (value: string) => {
        const parsed = JSON.parse(value)
        return {
          ...parsed,
          favoriteIds: new Set(parsed.favoriteIds || [])
        }
      }
    }
  }
})
