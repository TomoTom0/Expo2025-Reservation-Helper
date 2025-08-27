/**
 * パビリオン統合管理ストア
 * 既存PavilionManagerの全機能を移植
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { PavilionData, TimeSlotSelection, TimeSlotData, ReservationResult } from '@/types/api'
import { loggers } from '@/utils/logger'

const logger = loggers.pavilions

export const usePavilionsStore = defineStore('pavilions', () => {
  // State
  const pavilions = ref<Map<string, PavilionData>>(new Map())
  const selectedTimeSlots = ref<TimeSlotSelection[]>([])
  const isAvailableOnlyFilter = ref(false)
  const isLoading = ref(false)
  const isInitialized = ref(false)
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
  const init = async (): Promise<void> => {
    // favoriteIdsがSetでない場合はSetに変換（persist復元時の対応）
    if (!(favoriteIds.value instanceof Set)) {
      const idsArray = Array.isArray(favoriteIds.value) ? favoriteIds.value : []
      favoriteIds.value = new Set(idsArray)
    }
    logger.debug('お気に入り初期化', { favoriteCount: favoriteIds.value.size })
    isInitialized.value = true
    logger.info('パビリオンストア初期化完了')
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
   * パビリオンIDから時間帯情報と基本情報を取得（個別API呼び出し）
   */
  const getPavilionTimeSlots = async (pavilionId: string, ticketIds: string[] = [], entranceDate?: string): Promise<{ timeSlots: TimeSlotData[], pavilionName?: string }> => {
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
        logger.warn(`時間帯取得失敗 - ${pavilionId}: ${response.status}`)
        return { timeSlots: [], pavilionName: undefined }
      }
      
      const data = await response.json()
      logger.debug(`時間帯取得完了 - ${pavilionId}`, data)
      
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
      
      logger.debug('パビリオン時間帯パース完了', { pavilionId, timeSlotCount: timeSlots.length })
      
      // パビリオン名とタイムスロット情報を返す
      return {
        timeSlots,
        pavilionName: data.event_name || undefined
      }
      
    } catch (error) {
      logger.warn('パビリオンの時間帯取得エラー', { pavilionId, error: error instanceof Error ? error.message : String(error) })
      return { timeSlots: [], pavilionName: undefined }
    }
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
      logger.error('検索結果パースエラー', { error: error instanceof Error ? error.message : String(error) })
    }
    
    return pavilions
  }


  /**
   * パビリオン検索実行
   */
  const searchPavilions = async (query: string = '', ticketIds: string[] = [], entranceDate?: string): Promise<PavilionData[]> => {
    logger.info('パビリオン検索開始', { query, ticketIds: ticketIds.length, entranceDate })
    isLoading.value = true
    searchQuery.value = query
    
    // 検索時は選択状態をリセット（旧ソースからの変更仕様）
    clearSelectedTimeSlots()
    logger.debug('検索実行により選択状態をリセット')
    
    // 検索開始時に古い結果をクリア
    pavilions.value.clear()
    lastSearchResults.value = []
    
    try {
      const apiUrl = buildAPIUrl(query, ticketIds, entranceDate)
      logger.debug('API URL', { url: apiUrl })
      
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
      logger.debug('パビリオン検索API応答', data)
      const pavilionResults = parseSearchResults(data)
      logger.info('パビリオン一覧取得完了', { count: pavilionResults.length })
      
      // Step 2: 各パビリオンの時間帯情報を取得
      logger.debug('時間帯情報取得開始')
      const pavilionIds = pavilionResults.map(p => p.id)
      const timeSlotsMap = await getTimeSlotsForPavilions(pavilionIds, ticketIds, entranceDate)
      applyTimeSlotsToData(pavilionResults, timeSlotsMap)
      
      // メモリに保存
      for (const pavilion of pavilionResults) {
        pavilions.value.set(pavilion.id, pavilion)
      }
      
      lastSearchResults.value = pavilionResults
      logger.info('パビリオン検索完了', { count: pavilionResults.length, withTimeSlots: true })
      return pavilionResults
    } catch (error) {
      logger.error('パビリオン検索エラー', { error: error instanceof Error ? error.message : String(error) })
      throw error
    } finally {
      isLoading.value = false
    }
  }



  /**
   * pavilion IDsから時間帯情報をまとめて取得して返す関数（並列化版）
   */
  const getTimeSlotsForPavilions = async (pavilionIds: string[], ticketIds: string[] = [], entranceDate?: string): Promise<Map<string, { timeSlots: TimeSlotData[], pavilionName?: string }>> => {
    const results = new Map<string, { timeSlots: TimeSlotData[], pavilionName?: string }>()
    
    logger.debug('時間帯情報並列取得開始', { pavilionCount: pavilionIds.length })
    
    // 並列実行でパフォーマンス向上（最大5件同時）
    const concurrency = Math.min(5, pavilionIds.length)
    const chunks: string[][] = []
    
    for (let i = 0; i < pavilionIds.length; i += concurrency) {
      chunks.push(pavilionIds.slice(i, i + concurrency))
    }
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (pavilionId) => {
        try {
          const result = await getPavilionTimeSlots(pavilionId, ticketIds, entranceDate)
          return { pavilionId, timeSlots: result.timeSlots, pavilionName: result.pavilionName }
        } catch (error) {
          logger.warn('パビリオンの時間帯取得に失敗', { pavilionId, error: error instanceof Error ? error.message : String(error) })
          return { pavilionId, timeSlots: [], pavilionName: undefined }
        }
      })
      
      const chunkResults = await Promise.all(promises)
      chunkResults.forEach(({ pavilionId, timeSlots, pavilionName }) => {
        results.set(pavilionId, { timeSlots, pavilionName })
      })
    }
    
    logger.debug('時間帯情報並列取得完了', { resultCount: results.size })
    return results
  }

  /**
   * 既存のパビリオンデータに時間帯情報を設定する関数
   */
  const applyTimeSlotsToData = (pavilions: PavilionData[], timeSlotsMap: Map<string, { timeSlots: TimeSlotData[], pavilionName?: string }>): void => {
    pavilions.forEach(pavilion => {
      const data = timeSlotsMap.get(pavilion.id)
      const timeSlots = (data?.timeSlots || []).sort((a, b) => a.time.localeCompare(b.time))
      pavilion.timeSlots = timeSlots
      
      // パビリオン名が取得できた場合は更新
      if (data?.pavilionName) {
        pavilion.name = data.pavilionName
      }
      
      // 満員状態を更新
      const hasAvailableSlots = timeSlots.some(slot => slot.available)
      if (!hasAvailableSlots && timeSlots.length > 0) {
        pavilion.dateStatus = 2 // 全て満員
      } else if (timeSlots.length === 0) {
        pavilion.dateStatus = 2 // 時間帯なし（満員扱い）
      } else {
        pavilion.dateStatus = 1 // 空きあり
      }
    })
  }

  /**
   * お気に入り読み込み処理  
   */
  const loadFavoritePavilions = async (entranceDate?: string, ticketIds: string[] = []): Promise<PavilionData[]> => {
    logger.debug('お気に入りパビリオン読み込み')
    isLoading.value = true
    
    // お気に入り読み込み時も選択状態をリセット
    clearSelectedTimeSlots()
    logger.debug('お気に入り読み込みにより選択状態をリセット')

    try {
      if (favoriteIds.value.size === 0) {
        logger.debug('お気に入り未登録のため処理終了')
        return []
      }

      const favoriteIdArray = Array.from(favoriteIds.value)
      logger.debug('お気に入りパビリオン検索中', { favoriteIds: favoriteIdArray })

      // 1. 時間帯情報をまとめて取得
      const timeSlotsMap = await getTimeSlotsForPavilions(favoriteIdArray, ticketIds, entranceDate)
      
      // 2. 基本パビリオンデータを作成
      const favoriteResults: PavilionData[] = favoriteIdArray.map(id => ({
        id,
        name: `パビリオン ${id}`,
        description: '',
        isFavorite: true,
        timeSlots: [],
        reservationStatus: 'available',
        dateStatus: 1
      }))
      
      // 3. 取得した時間帯情報を適用
      applyTimeSlotsToData(favoriteResults, timeSlotsMap)
      
      logger.info('お気に入り取得完了', { count: favoriteResults.length })
      
      // 結果を保存
      favoriteResults.forEach(pavilion => {
        pavilions.value.set(pavilion.id, pavilion)
      })

      // allPavilionsを更新（computed propertyの再計算をトリガー）  
      lastSearchResults.value = favoriteResults
      logger.info('お気に入り読み込み完了', { count: favoriteResults.length })
      
      return favoriteResults
    } catch (error) {
      logger.error('お気に入り読み込みエラー', { error: error instanceof Error ? error.message : String(error) })
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
    logger.debug('全お気に入りクリア')
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
      logger.error('イベント項目パースエラー', { error: error instanceof Error ? error.message : String(error) })
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
        logger.warn('時間帯パースエラー', { error: error instanceof Error ? error.message : String(error) })
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
    logger.debug('時間帯選択追加', selection)
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
      logger.debug('時間帯選択削除', { pavilionId, time })
    }
  }

  /**
   * 選択された時間帯をクリア
   */
  const clearSelectedTimeSlots = (): void => {
    selectedTimeSlots.value = []
    logger.debug('時間帯選択クリア')
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

    logger.debug('パビリオン全時間帯選択', { pavilionName: pavilion.name })
  }

  /**
   * パビリオンの全時間帯選択を解除
   */
  const deselectAllTimeSlotsForPavilion = (pavilionId: string): void => {
    selectedTimeSlots.value = selectedTimeSlots.value.filter(
      s => s.pavilionId !== pavilionId
    )
    const pavilion = pavilions.value.get(pavilionId)
    logger.debug('パビリオン全時間帯選択解除', { pavilionName: pavilion?.name || pavilionId })
  }

  /**
   * 予約実行
   */
  const executeReservation = async (
    pavilionId: string, 
    timeSlot: TimeSlotData, 
    entranceDate: string, 
    registeredChannel: string,
    ticketIds: string[] = []
  ): Promise<ReservationResult> => {
    logger.info('予約実行開始', { pavilionId, timeSlot: timeSlot.time, entranceDate, registeredChannel, ticketCount: ticketIds.length })
    
    try {
      const requestBody = {
        ticket_ids: ticketIds,
        entrance_date: entranceDate,
        start_time: timeSlot.time,
        event_code: pavilionId,
        registered_channel: registeredChannel
      }
      
      logger.debug('予約API呼び出し', requestBody)
      
      const response = await fetch('/api/d/user_event_reservations', {
        method: 'POST',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
          'X-Api-Lang': 'ja',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      })
      
      const data = await response.json()
      logger.debug('予約API応答', { status: response.status, data })
      
      if (response.ok) {
        return {
          success: true,
          message: '予約に成功しました',
          data: data,
          details: {
            pavilionName: pavilions.value.get(pavilionId)?.name || '',
            timeSlot: timeSlot.time,
            ticketCount: ticketIds.length
          }
        }
      } else if (response.status === 422) {
        // 満席は正常なビジネスエラー
        const errorMessage = data.error?.message || '予約できませんでした'
        return {
          success: false,
          message: errorMessage,
          data: data,
          details: {
            pavilionName: pavilions.value.get(pavilionId)?.name || '',
            timeSlot: timeSlot.time,
            ticketCount: ticketIds.length
          }
        }
      } else {
        throw new Error(`HTTP ${response.status}: ${data.error?.message || response.statusText}`)
      }
      
    } catch (error) {
      logger.error('予約実行エラー', { error: error instanceof Error ? error.message : String(error) })
      return {
        success: false,
        message: '予約実行エラー',
        error: error instanceof Error ? error.message : String(error),
        details: {
          pavilionName: pavilions.value.get(pavilionId)?.name || '',
          timeSlot: timeSlot.time,
          ticketCount: ticketIds.length
        }
      }
    }
  }

  /**
   * 更新処理（選択リセットなし）
   */
  const refreshPavilions = async (query: string = '', ticketIds: string[] = [], entranceDate?: string): Promise<PavilionData[]> => {
    logger.debug('パビリオン更新開始', { refreshType: '時間帯情報のみ再取得' })
    isLoading.value = true
    
    try {
      // 既存の検索結果があることを確認
      if (lastSearchResults.value.length === 0) {
        logger.warn('既存の検索結果なし - 更新対象なし')
        return []
      }

      const existingPavilions = [...lastSearchResults.value]
      logger.debug('既存パビリオンの時間帯情報を更新', { count: existingPavilions.length })
      
      // 1. 時間帯情報をまとめて取得
      const pavilionIds = existingPavilions.map(p => p.id)
      const timeSlotsMap = await getTimeSlotsForPavilions(pavilionIds, ticketIds, entranceDate)
      
      // 2. 取得した時間帯情報を既存データに適用
      applyTimeSlotsToData(existingPavilions, timeSlotsMap)
      
      // 結果を保存（パビリオンメタデータは変更せず、時間帯情報のみ更新）
      existingPavilions.forEach(pavilion => {
        pavilions.value.set(pavilion.id, pavilion)
      })
      
      lastSearchResults.value = existingPavilions
      logger.info('パビリオン更新完了', { count: existingPavilions.length })
      return existingPavilions
    } catch (error) {
      logger.error('パビリオン更新エラー', { error: error instanceof Error ? error.message : String(error) })
      throw error
    } finally {
      isLoading.value = false
    }
  }

  return {
    // State
    pavilions,
    selectedTimeSlots,
    isAvailableOnlyFilter,
    isLoading,
    isInitialized,
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
    init,
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
    refreshPavilions,
    
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
