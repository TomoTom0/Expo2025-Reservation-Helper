/**
 * チケット統合管理ストア
 * 既存TicketManagerの全機能を移植
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TicketData, ScheduleData } from '@/types/api'
import { loggers } from '@/utils/logger'

const logger = loggers.tickets
import { determinePavilionReservationType, getAllPavilionReservationStatus } from '@/utils/pavilionReservationTypes'

export const useTicketsStore = defineStore('tickets', () => {
  // State
  const tickets = ref<Map<string, TicketData>>(new Map())
  const selectedTicketIds = ref<Set<string>>(new Set())
  const selectedEntranceDates = ref<Map<string, string>>(new Map()) // ticketId -> scheduleId mapping for persistence
  const isLoading = ref(false)
  const isInitialized = ref(false)
  const availableDates = ref<string[]>([])
  const todayStr = ref<string>(getTodayString())
  
  // Getters (computed)
  const ticketsArray = computed(() => Array.from(tickets.value.values()))
  
  const selectedTickets = computed(() => 
    ticketsArray.value.filter(ticket => 
      ticket.schedules?.some(schedule => schedule.selected)
    )
  )

  const selectedTicketCount = computed(() => {
    // 入場予約が選択されているチケットの数
    return ticketsArray.value.filter(ticket => 
      ticket.schedules?.some(schedule => schedule.selected)
    ).length
  })

  const ownTickets = computed(() => 
    ticketsArray.value.filter(ticket => ticket.isOwn)
  )

  const externalTickets = computed(() => 
    ticketsArray.value.filter(ticket => !ticket.isOwn)
  )

  // 選択済み入場予約からパビリオン予約情報を取得
  const selectedPavilionReservationInfo = computed(() => {
    const selectedSchedules = ticketsArray.value.flatMap(ticket => 
      ticket.schedules?.filter(schedule => schedule.selected) || []
    )
    
    if (selectedSchedules.length === 0) {
      return null
    }
    
    // 最初の選択済みスケジュールの予約情報を取得（同じになるはず）
    const firstSelected = selectedSchedules[0]
    if (!firstSelected.pavilionReservationType || !firstSelected.pavilionReservationStatus) {
      return null
    }
    
    // 現在有効な予約種類を特定
    const activeReservationType = Object.entries(firstSelected.pavilionReservationStatus)
      .find(([type, status]) => status.periodStatus === 'active')
    
    return {
      activeType: activeReservationType?.[0] || null,
      activeChannel: firstSelected.pavilionReservationType,
      isActive: firstSelected.pavilionReservationActive || false,
      allStatus: firstSelected.pavilionReservationStatus
    }
  })
  
  // Helper function for date
  function getTodayString(): string {
    const today = new Date()
    return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  }

  // Actions - TicketManagerから完全移行
  
  /**
   * スケジュールデータに有効フラグとパビリオン予約種類情報を付与
   */
  const processSchedules = (schedules: any[]): ScheduleData[] => {
    if (!Array.isArray(schedules)) return []
    
    return schedules.map(schedule => {
      
      // schedule_nameから時刻情報を抽出（例: "9:00-" → "9:00"）
      let timeStart = undefined
      if (schedule.schedule_name) {
        const timeMatch = schedule.schedule_name.match(/(\d{1,2}:\d{2})/)
        if (timeMatch) {
          timeStart = timeMatch[1]
        }
      }
      
      const scheduleData: ScheduleData = {
        entrance_date: schedule.entrance_date || '',
        use_state: schedule.use_state || 0,
        schedule_name: schedule.schedule_name,
        time_start: timeStart,
        time_end: schedule.time_end,
        reservation_type: schedule.reservation_type,
        // 有効フラグを付与: 未使用または当日入場済みは有効
        isEffective: schedule.use_state === 0 || 
                     (schedule.use_state === 1 && schedule.entrance_date === todayStr.value)
      }
      
      // パビリオン予約種類情報を付与
      if (scheduleData.entrance_date) {
        const pavilionReservation = determinePavilionReservationType(scheduleData.entrance_date)
        scheduleData.pavilionReservationType = pavilionReservation.channel
        scheduleData.pavilionReservationActive = pavilionReservation.isActive
        
        // 全ての予約区分の状況も付与
        const allStatus = getAllPavilionReservationStatus(scheduleData.entrance_date)
        scheduleData.pavilionReservationStatus = {}
        
        for (const [type, status] of Object.entries(allStatus)) {
          scheduleData.pavilionReservationStatus[type] = {
            periodStatus: status.periodStatus,
            submissionStatus: status.submissionStatus,
            winningInfo: status.winningInfo
          }
        }
      }
      
      return scheduleData
    }).sort((a, b) => {
      // 入場日時順でソート
      const dateTimeA = `${a.entrance_date}${a.time_start || '0000'}`
      const dateTimeB = `${b.entrance_date}${b.time_start || '0000'}`
      return dateTimeA.localeCompare(dateTimeB)
    })
  }

  /**
   * 全チケット情報を初期化・取得
   */
  const loadAllTickets = async (): Promise<TicketData[]> => {
    logger.info('全チケット情報取得開始')
    setLoading(true)
    
    try {
      // 自分のチケットを最優先で読み込み
      let ownTickets: TicketData[] = []
      try {
        ownTickets = await loadOwnTickets()
        logger.info(`自分のチケット取得完了: ${ownTickets.length}個`)
        
        // 自分のチケットを追加
        for (const ticket of ownTickets) {
          tickets.value.set(ticket.ticket_id, ticket)
        }
      } catch (error) {
        logger.error('自分のチケット取得エラー', error)
      }

      // 外部チケットを取得（エラーがあっても自分のチケットには影響しない）
      try {
        const cachedTickets = await loadCachedExternalTickets()
        logger.info(`外部チケット取得完了: ${cachedTickets.length}個`)
        
        // キャッシュされた外部チケットを追加
        for (const ticket of cachedTickets) {
          tickets.value.set(ticket.ticket_id, ticket)
        }
      } catch (error) {
        logger.error('外部チケット取得エラー（自分のチケットは正常）', error)
      }

      logger.info(`チケット統合管理完了: ${tickets.value.size}個のチケット読み込み完了`)
    
    // デバッグ: チケットデータの詳細を出力
    logger.debug('チケットデータ詳細', {
      todayStr: todayStr.value,
      tickets: Array.from(tickets.value.values()).map(ticket => ({
        ticket_id: ticket.ticket_id,
        isOwn: ticket.isOwn,
        schedulesCount: ticket.schedules?.length || 0,
        schedules: ticket.schedules?.map(schedule => ({
          entrance_date: schedule.entrance_date,
          use_state: schedule.use_state,
          isEffective: schedule.isEffective,
          schedule_name: schedule.schedule_name
        }))
      }))
    })
      
      // 利用可能日付を抽出
      const dates = await extractAvailableDates()
      availableDates.value = dates
      
      
      return Array.from(tickets.value.values())
    } finally {
      setLoading(false)
    }
  }

  /**
   * 自分のチケット取得
   */
  const loadOwnTickets = async (): Promise<TicketData[]> => {
    try {
      const response = await fetch('/api/d/my/tickets/?count=1', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
          'X-Api-Lang': 'ja'
        },
        credentials: 'same-origin'
      })

      if (!response.ok) {
        throw new Error(`API応答エラー: ${response.status}`)
      }

      const data = await response.json()
      
      if (!data.list || !Array.isArray(data.list)) {
        logger.warn('チケットデータが期待する形式ではありません', data)
        return []
      }

      return data.list.map((ticket: any) => ({
        ticket_id: ticket.ticket_id || ticket.simple_ticket_id || '',
        isOwn: true,
        label: ticket.item_name || 'チケット',
        schedules: processSchedules(ticket.schedules || [])
      }))
      
    } catch (error) {
      logger.error('自分のチケット取得API エラー', error)
      return []
    }
  }

  /**
   * キャッシュされた外部チケット読み込み
   */
  const loadCachedExternalTickets = async (): Promise<TicketData[]> => {
    const externalTicketIds = await getCachedExternalTicketIds()
    const externalTickets: TicketData[] = []
    
    for (const {ticketId, label} of externalTicketIds) {
      const ticketData = await loadExternalTicketData(ticketId, label)
      if (ticketData) {
        externalTickets.push(ticketData)
      }
    }
    
    return externalTickets
  }

  /**
   * キャッシュから外部チケットIDを収集
   */
  const getCachedExternalTicketIds = async (): Promise<Array<{ticketId: string, label: string}>> => {
    const externalTickets: Array<{ticketId: string, label: string}> = []

    try {
      // 監視キャッシュから取得
      const monitoringCache = localStorage.getItem('expo_monitoring_cache')
      if (monitoringCache) {
        const data = JSON.parse(monitoringCache)
        if (data.externalTickets) {
          for (const [ticketId, info] of Object.entries(data.externalTickets)) {
            externalTickets.push({
              ticketId,
              label: (info as any).label || '外部チケット'
            })
          }
        }
      }

      // パビリオン予約キャッシュから取得
      const pavilionCache = localStorage.getItem('expo_pavilion_reservation_cache')
      if (pavilionCache) {
        const data = JSON.parse(pavilionCache)
        if (data.externalTickets) {
          for (const [ticketId, info] of Object.entries(data.externalTickets)) {
            // 重複チェック
            if (!externalTickets.find(t => t.ticketId === ticketId)) {
              externalTickets.push({
                ticketId,
                label: (info as any).label || '外部チケット'
              })
            }
          }
        }
      }
    } catch (error) {
      logger.error('キャッシュからの外部チケットID取得エラー', error)
    }

    return externalTickets
  }

  /**
   * 外部チケットの詳細データを取得
   */
  const loadExternalTicketData = async (ticketId: string, label: string, channel?: string): Promise<TicketData | null> => {
    try {
      const channels = channel ? [channel] : ['5', '4', '3', '2']
      
      for (const testChannel of channels) {
        try {
          const response = await fetch(`/api/d/proxy_tickets/${ticketId}/add_check?registered_channel=${testChannel}`, {
            credentials: 'include'
          })
          
          if (response.ok) {
            const data = await response.json()
            
            const ticketData: TicketData = {
              ticket_id: data.ticket_id,
              isOwn: false,
              label: label,
              schedules: processSchedules(data.schedules || [])
            }

            logger.info('外部チケット取得成功', { ticketId, testChannel });
            return ticketData
          }
        } catch (error) {
          logger.warn('外部チケット取得失敗', { ticketId, testChannel, error })
        }
      }
      
      // どのchannelでも取得できない場合は最小限のデータを作成
      logger.warn('外部チケット詳細取得失敗、最小限データで作成', { ticketId });
      return {
        ticket_id: ticketId,
        isOwn: false,
        label: label,
        schedules: []
      }
      
    } catch (error) {
      logger.error('外部チケット取得エラー', { ticketId, error })
      return null
    }
  }

  /**
   * 利用可能日付を抽出
   */
  const extractAvailableDates = async (): Promise<string[]> => {
    const dates = new Set<string>()
    
    for (const ticket of ticketsArray.value) {
      if (ticket.schedules && Array.isArray(ticket.schedules)) {
        const effectiveSchedules = ticket.schedules.filter(schedule => schedule.isEffective)
        
        for (const schedule of effectiveSchedules) {
          if (schedule.entrance_date) {
            dates.add(schedule.entrance_date)
          }
        }
      }
    }
    
    const sortedDates = Array.from(dates).sort((a, b) => {
      if (/^\d{8}$/.test(a) && /^\d{8}$/.test(b)) {
        return a.localeCompare(b)
      } else {
        const dateA = new Date(a)
        const dateB = new Date(b)
        return dateA.getTime() - dateB.getTime()
      }
    })
    
    return sortedDates
  }

  // Legacy actions for compatibility
  const setTickets = (newTickets: TicketData[]) => {
    tickets.value.clear()
    newTickets.forEach(ticket => {
      tickets.value.set(ticket.ticket_id, ticket)
    })
  }

  const addTicket = (ticket: TicketData) => {
    tickets.value.set(ticket.ticket_id, ticket)
  }

  const selectTicket = (ticketId: string, selected: boolean) => {
    if (selected) {
      selectedTicketIds.value.add(ticketId)
    } else {
      selectedTicketIds.value.delete(ticketId)
    }
  }

  const selectAllTickets = () => {
    ticketsArray.value.forEach(ticket => {
      selectedTicketIds.value.add(ticket.ticket_id)
    })
  }

  const deselectAllTickets = () => {
    selectedTicketIds.value.clear()
  }

  const setAvailableDates = (dates: string[]) => {
    availableDates.value = dates
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
  }

  // 入場日時選択の永続化機能
  const saveSelectedEntranceDate = (ticketId: string, scheduleId: string) => {
    selectedEntranceDates.value.set(ticketId, scheduleId)
    logger.debug('入場日時選択を保存', { ticketId, scheduleId })
  }

  const removeSelectedEntranceDate = (ticketId: string) => {
    selectedEntranceDates.value.delete(ticketId)
    logger.debug('入場日時選択を削除', { ticketId });
  }

  const restoreSelectedEntranceDates = () => {
    let restoredCount = 0
    
    // selectedEntranceDatesがMapでない場合はMapに変換  
    if (!(selectedEntranceDates.value instanceof Map)) {
      selectedEntranceDates.value = new Map()
    }
    
    try {
      // 復元前にtickets.valueが空でないことを確認
      if (tickets.value.size === 0) {
        logger.warn('チケットデータが未ロードのため復元をスキップ');
        return
      }
      
      for (const [ticketId, scheduleId] of selectedEntranceDates.value.entries()) {
        const ticket = tickets.value.get(ticketId)
        if (ticket && ticket.schedules) {
          const schedule = ticket.schedules.find(s => 
            s.entrance_date + (s.time_start || '') === scheduleId
          )
          if (schedule) {
            schedule.selected = true
            restoredCount++
            logger.debug('復元', { ticketId, scheduleId });
          } else {
            // 見つからないスケジュールIDは削除
            selectedEntranceDates.value.delete(ticketId)
            logger.debug('無効な選択を削除', { ticketId, scheduleId });
          }
        } else {
          // 存在しないチケットの選択は削除
          selectedEntranceDates.value.delete(ticketId)
          logger.debug('存在しないチケットの選択を削除', { ticketId });
        }
      }
      
      if (restoredCount > 0) {
        logger.info('入場日時選択状態復元完了', { restoredCount });
      }
    } catch (error) {
      logger.error('入場日時復元エラー', error)
      selectedEntranceDates.value = new Map()
    }
  }

  // 初期化メソッド
  const init = async (): Promise<void> => {
    logger.info('チケットストア初期化開始')
    await loadAllTickets()
    restoreSelectedEntranceDates()
    isInitialized.value = true
    logger.info('チケットストア初期化完了')
  }

  return {
    // State
    tickets,
    selectedTicketIds,
    selectedEntranceDates,
    isLoading,
    isInitialized,
    availableDates,
    
    // Getters
    ticketsArray,
    selectedTickets,
    selectedTicketCount,
    ownTickets,
    externalTickets,
    selectedPavilionReservationInfo,
    
    // Actions
    init,
    loadAllTickets,
    loadOwnTickets,
    loadCachedExternalTickets,
    setTickets,
    addTicket,
    selectTicket,
    selectAllTickets,
    deselectAllTickets,
    setAvailableDates,
    setLoading,
    extractAvailableDates,
    saveSelectedEntranceDate,
    removeSelectedEntranceDate,
    restoreSelectedEntranceDates
  }
}, {
  persist: {
    key: 'ytomo-tickets-store',
    pick: ['selectedEntranceDates'], // 入場日時選択のみ永続化
    serializer: {
      serialize: (data: any) => {
        // MapをObjectに変換してシリアライズ
        const serialized = { ...data }
        if (serialized['selectedEntranceDates'] instanceof Map) {
          serialized['selectedEntranceDates'] = Object.fromEntries(serialized['selectedEntranceDates'])
        }
        return JSON.stringify(serialized)
      },
      deserialize: (data: string) => {
        const parsed = JSON.parse(data)
        // ObjectをMapに復元
        if (parsed['selectedEntranceDates'] && typeof parsed['selectedEntranceDates'] === 'object') {
          parsed['selectedEntranceDates'] = new Map(Object.entries(parsed['selectedEntranceDates']))
        }
        return parsed
      }
    }
  }
})