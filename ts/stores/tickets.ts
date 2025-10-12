/**
 * チケット統合管理ストア
 * 既存TicketManagerの全機能を移植
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TicketData, ScheduleData } from '@/types/api'
import type { ReservationManagementData } from '@/types/reservationManagement'
import { loggers } from '@/utils/logger'
import { isApiUsageDisabled } from '@/utils/apiUsageMode'
import { authenticatedFetch } from '@/utils/authManager'
import { isSeasonPass } from '@/utils/ticketUtils'
import { 
  getEntranceSchedules, 
  getUserReservations, 
  type EntranceScheduleData 
} from '@/services/entranceReservationService'

const logger = loggers.tickets
import { determinePavilionReservationType, getAllPavilionReservationStatus } from '@/utils/pavilionReservationTypes'

export const useTicketsStore = defineStore('tickets', () => {
  // State
  const tickets = ref<Map<string, TicketData>>(new Map())
  const selectedEntranceDates = ref<Map<string, string>>(new Map()) // ticketId -> scheduleId mapping for persistence
  const isLoading = ref(false)
  const isInitialized = ref(false) // ストア初期化状態
  
  // 予約ID管理システム
  const reservationManagement = ref<Map<string, ReservationManagementData>>(new Map())
  
  // データの新鮮さ判定のcomputed（1時間以内）
  const isFresh = computed(() => {
    if (lastUpdateTime.value === 0) return false
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    return now - lastUpdateTime.value < oneHour
  })
  const availableDates = ref<string[]>([])
  const todayStr = ref<string>(getTodayString())
  const lastUpdateTime = ref<number>(0) // 最後の更新時刻（Unix時間）
  
  // パビリオン予約判定用の現在時刻（データ更新時に更新）
  const judgmentTime = ref<Date>(new Date())
  
  // パビリオン予約の静的情報を保持 (submissionStatus, winningInfo)
  const pavilionStaticInfo = ref<Map<string, {submissionStatus: string, winningInfo?: any}>>(new Map())
  
  // 入場予約スケジュールキャッシュ
  const entranceSchedules = ref<Map<string, EntranceScheduleData>>(new Map()) // key: "YYYY-MM"
  const entranceSchedulesUpdateTime = ref<Map<string, number>>(new Map()) // key: "YYYY-MM", value: timestamp
  
  // Getters (computed)
  // チケットにパビリオン予約情報を動的に付与するcomputed
  const ticketsArray = computed(() => {
    // judgmentTimeに依存させてデータ更新時に再計算
    const _ = judgmentTime.value
    
    return Array.from(tickets.value.values()).map(ticket => ({
      ...ticket,
      schedules: ticket.schedules?.map(schedule => {
        if (!schedule.entrance_date) return schedule
        
        // 現在時刻に基づいてパビリオン予約状況を動的計算
        const pavilionReservation = determinePavilionReservationType(schedule.entrance_date)
        const allStatus = getAllPavilionReservationStatus(schedule.entrance_date)
        
        const pavilionReservationStatus: any = {}
        for (const [type, status] of Object.entries(allStatus)) {
          const staticKey = `${schedule.entrance_date}_${type}`
          const staticInfo = pavilionStaticInfo.value.get(staticKey)
          
          pavilionReservationStatus[type] = {
            periodStatus: status.periodStatus, // 動的計算
            submissionStatus: staticInfo?.submissionStatus || 'none', // 静的保持
            winningInfo: staticInfo?.winningInfo // 静的保持
          }
        }
        
        return {
          ...schedule,
          pavilionReservationType: pavilionReservation.channel,
          pavilionReservationActive: pavilionReservation.isActive,
          pavilionReservationStatus: pavilionReservationStatus
        }
      })
    }))
  })
  
  const selectedTicketIds = computed(() => {
    const ticketIds = new Set<string>()

    // 予約管理システムから選択された予約IDを取得し、対応するチケットIDを特定
    for (const [reservationId, reservationData] of reservationManagement.value) {
      if (reservationData.isSelected) {
        ticketIds.add(reservationData.ticketId)
      }
    }

    return Array.from(ticketIds)
  })

  const selectedTickets = computed(() =>
    ticketsArray.value.filter(ticket => selectedTicketIds.value.includes(ticket.ticket_id))
  )

  const selectedTicketCount = computed(() => {
    // 入場予約が選択されているチケットの数
    return ticketsArray.value.filter(ticket => {
      // 既存の予約で選択されているかチェック
      const hasSelectedSchedule = ticket.schedules?.some(schedule => {
        const reservationId = schedule.user_visiting_reservation_id?.toString()
        if (!reservationId) return false
        const reservationData = reservationManagement.value.get(reservationId)
        return !!reservationData?.isSelected
      })

      // NEW予約枠で選択されているかチェック
      const newReservationId = `new-reservation-${ticket.ticket_id}`
      const newReservationData = reservationManagement.value.get(newReservationId)
      const hasSelectedNewSlot = !!newReservationData?.isSelected

      return hasSelectedSchedule || hasSelectedNewSlot
    }).length
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
      ticket.schedules?.filter(schedule => {
        const reservationId = schedule.user_visiting_reservation_id?.toString()
        if (!reservationId) return false
        const reservationData = reservationManagement.value.get(reservationId)
        return !!reservationData?.isSelected
      }) || []
    )
    
    if (selectedSchedules.length === 0) {
      return null
    }
    
    // 最初の選択済みスケジュールの予約情報を取得（computedで計算済み）
    const firstSelected = selectedSchedules[0]
    
    if (!firstSelected.pavilionReservationStatus) {
      return null
    }
    
    // 現在有効な予約種類を特定
    const activeReservationType = Object.entries(firstSelected.pavilionReservationStatus)
      .find(([type, status]) => (status as any)?.periodStatus === 'active')
    
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
  
  // todayStrを定期的に更新する関数
  function updateTodayString(): void {
    const newTodayStr = getTodayString()
    if (todayStr.value !== newTodayStr) {
      logger.info('日付変更を検出', { 
        old: todayStr.value, 
        new: newTodayStr 
      })
      todayStr.value = newTodayStr
    }
  }

  // Actions - TicketManagerから完全移行
  
  /**
   * スケジュールデータに有効フラグとパビリオン予約種類情報を付与
   * 通期パスの場合は空き枠を追加
   */
  const processSchedules = (schedules: any[], ticketData?: TicketData): ScheduleData[] => {
    if (!Array.isArray(schedules)) return []

    const result = schedules.map(schedule => {

      // schedule_nameから時刻情報を抽出（例: "9:00-" → "9:00"）
      let timeStart = undefined
      if (schedule.schedule_name) {
        const timeMatch = schedule.schedule_name.match(/(\d{1,2}:\d{2})/)
        if (timeMatch) {
          timeStart = timeMatch[1]
        }
      }

      const scheduleData: ScheduleData = {
        user_visiting_reservation_id: schedule.user_visiting_reservation_id,
        entrance_date: schedule.entrance_date || '',
        use_state: schedule.use_state || 0,
        gate_type: schedule.gate_type,
        schedule_name: schedule.schedule_name,
        time_start: timeStart,
        time_end: schedule.time_end,
        reservation_type: schedule.reservation_type,
        location_index: schedule.gate_type === 1 ? 0 : 1, // gate_type: 1=東(0), 2=西(1)
        // 有効フラグを付与: 未使用または当日入場済みは有効
        isEffective: (() => {
          const isUnused = schedule.use_state === 0
          const isTodayUsed = schedule.use_state === 1 && schedule.entrance_date === todayStr.value
          const result = isUnused || isTodayUsed

          // デバッグログ（詳細レベル）
          if (schedule.entrance_date) {
            logger.debug('isEffective判定', {
              entrance_date: schedule.entrance_date,
              use_state: schedule.use_state,
              today: todayStr.value,
              isUnused,
              isTodayUsed,
              result
            })
          }

          return result
        })()
      }

      // パビリオン予約情報はcomputedで動的計算するため、ここでは設定しない

      return scheduleData
    }).sort((a, b) => {
      // 入場日時順でソート
      const dateTimeA = `${a.entrance_date}${a.time_start || '0000'}`
      const dateTimeB = `${b.entrance_date}${b.time_start || '0000'}`
      return dateTimeA.localeCompare(dateTimeB)
    })

    // 通期パスの場合、有効な予約が3未満なら空き枠を1つ追加
    if (ticketData && isSeasonPass(ticketData)) {
      const effectiveCount = result.filter(s => s.isEffective === true).length
      if (effectiveCount < 3) {
        result.push({
          user_visiting_reservation_id: -1,
          use_state: 0,
          entrance_date: '',
          gate_type: 0,
          location_index: 0,
          schedule_name: 'NEW',
          time_start: '',
          selected: false,
          isEffective: false,
          pavilionReservationInfo: undefined
        })
        logger.debug('通期パス空き枠追加', {
          ticketId: ticketData.ticket_id,
          effectiveCount
        })
      }
    }

    return result
  }

  /**
   * パビリオン予約判定データをクリアして再計算を強制
   */
  const clearPavilionReservationCache = (): void => {
    logger.info('パビリオン予約判定キャッシュをクリア')
    tickets.value.forEach(ticket => {
      if (ticket.schedules) {
        ticket.schedules.forEach(schedule => {
          // パビリオン予約情報をクリア（次回processSchedules時に再計算される）
          delete schedule.pavilionReservationStatus
          delete schedule.pavilionReservationType
          delete schedule.pavilionReservationActive
        })
      }
    })
  }

  /**
   * 全チケット情報を初期化・取得
   */
  const loadAllTickets = async (): Promise<TicketData[]> => {
    
    logger.info('全チケット情報取得開始')
    setLoading(true)
    
    // データ更新時に判定時刻を更新
    judgmentTime.value = new Date()
    
    try {
      // 旧チケット情報を保存（選択状態等の保持用）
      const previousTickets = new Map(tickets.value)
      
      
      // 新チケット情報を一時変数に取得
      let newOwnTickets: TicketData[] = []
      try {
        newOwnTickets = await loadOwnTickets()
        logger.info(`自分のチケット取得完了: ${newOwnTickets.length}個`)
        
        // 新チケット情報に旧情報の状態を反映
        const processedTickets = new Map<string, TicketData>()
        
        for (const newTicket of newOwnTickets) {
          const previousTicket = previousTickets.get(newTicket.ticket_id)

          // パビリオン予約情報を付与
          if (newTicket.schedules) {
            newTicket.schedules = await Promise.all(newTicket.schedules.map(async (schedule: any) => {
              const pavilionType = determinePavilionReservationType(schedule)
              const pavilionStatus = await getAllPavilionReservationStatus(schedule)

              return {
                ...schedule,
                pavilionReservationType: pavilionType,
                pavilionReservationActive: pavilionType !== null,
                pavilionReservationStatus: pavilionStatus
              }
            }))
          }

          // 旧情報からselected状態を継承
          if (previousTicket && newTicket.schedules && previousTicket.schedules) {
            for (const newSchedule of newTicket.schedules) {
              const previousSchedule = previousTicket.schedules.find(s =>
                s.user_visiting_reservation_id === newSchedule.user_visiting_reservation_id &&
                s.entrance_date === newSchedule.entrance_date &&
                s.schedule_name === newSchedule.schedule_name &&
                s.gate_type === newSchedule.gate_type
              )

              // 同じ予約が見つかった場合はselected状態を継承
              if (previousSchedule) {
                newSchedule.selected = previousSchedule.selected
                if (newSchedule.selected) {
                  logger.debug(`予約ID ${newSchedule.user_visiting_reservation_id} のselected状態を継承`)
                }

              }
            }
          }

          processedTickets.set(newTicket.ticket_id, newTicket)
        }
        
        // 最後に一括でstoreに反映
        tickets.value = processedTickets

        // 全チケットのreservationManagement登録処理
        processedTickets.forEach(ticket => {
          ticket.schedules?.forEach(schedule => {
            if (schedule.user_visiting_reservation_id != null) {
              const reservationId = schedule.user_visiting_reservation_id.toString()
              const existing = getReservationManagement(reservationId)

              setReservationManagement(reservationId, {
                ticketId: ticket.ticket_id,
                entranceDate: schedule.entrance_date,
                reservationType: schedule.reservation_type,
                // 既存の選択状態・ロック状態・ラベルは保持
                isSelected: existing?.isSelected ?? false,
                isLocked: existing?.isLocked ?? false,
                userLabel: existing?.userLabel ?? ''
              })
            }
          })
        })

        logger.info('チケット情報を一括更新', { ticketCount: processedTickets.size })
      } catch (error: any) {
        // API利用制限の場合は情報ログとして記録
        if (error?.isApiDisabled || error?.isApiSuppressed) {
          logger.info('API利用制限のためチケット取得をスキップ')
        } else {
          logger.error('自分のチケット取得エラー', error)
        }
      }


      // 日付を最新に更新
      updateTodayString()

      // パビリオン予約当選情報を取得
      await fetchPavilionWinningInfo()

      // 更新時刻を記録
      lastUpdateTime.value = Date.now()

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
      const response = await authenticatedFetch('/api/d/my/tickets/?count=1', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
          'X-Api-Lang': 'ja'
        }
      })

      if (!response.ok) {
        throw new Error(`API応答エラー: ${response.status}`)
      }

      const data = await response.json()

      // APIレスポンス全体をログ出力してevent_schedulesの有無を確認
      logger.temp('チケットAPI応答内容', {
        dataKeys: Object.keys(data),
        listLength: data.list?.length,
        firstTicketKeys: data.list?.[0] ? Object.keys(data.list[0]) : [],
        hasEventSchedules: data.list?.[0]?.event_schedules !== undefined,
        eventSchedulesLength: data.list?.[0]?.event_schedules?.length
      })

      if (!data.list || !Array.isArray(data.list)) {
        logger.warn('チケットデータが期待する形式ではありません', data)
        return []
      }

      return data.list.map((ticket: any) => {
        // 各チケットのevent_schedulesの存在をログ
        if (ticket.event_schedules) {
          logger.temp(`チケット ${ticket.ticket_id} にevent_schedules発見`, {
            eventSchedulesCount: ticket.event_schedules.length,
            eventSchedules: ticket.event_schedules
          })
        }

        const ticketData: TicketData = {
          ticket_id: ticket.ticket_id || ticket.simple_ticket_id || '',
          isOwn: true,
          label: ticket.item_name || 'チケット',
          schedules: [],
          // event_schedulesをチケットデータに追加保存
          event_schedules: ticket.event_schedules || []
        }
        // processSchedulesにticketDataを渡して空き枠追加を判定
        ticketData.schedules = processSchedules(ticket.schedules || [], ticketData)

        return ticketData
      })
      
    } catch (error: any) {
      // API利用制限の場合は情報ログとして記録
      if (error?.isApiDisabled || error?.isApiSuppressed) {
        logger.info('API利用制限のためチケット取得をスキップ')
        return []
      }
      
      logger.error('自分のチケット取得API エラー', error)
      return []
    }
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
  /**
   * パビリオン予約当選情報を取得・更新
   */
  const fetchPavilionWinningInfo = async (): Promise<void> => {
    logger.info('🏛️ パビリオン予約当選情報取得開始')
    
    try {
      // 全チケットについて、event_schedulesとlotteries情報を更新
      for (const [ticketId, ticket] of tickets.value) {
        if (ticket.schedules) {
          for (const schedule of ticket.schedules) {
            // 抽選カレンダー情報を取得
            try {
              const calendarResponse = await authenticatedFetch(`/api/d/lottery_calendars?entrance_date=${schedule.entrance_date}`, {
                method: 'GET',
                headers: {
                  'Accept': 'application/json',
                  'X-Api-Lang': 'ja'
                }
              })
              
              if (calendarResponse.ok) {
                const calendarData = await calendarResponse.json()
                logger.debug(`${schedule.entrance_date}の抽選カレンダー情報取得成功`)
                
                // パビリオン予約状況を更新
                if (schedule.pavilionReservationStatus) {
                  // 実際の抽選状況でsubmissionStatusを更新する処理はここに追加
                  // 現在は期間判定のみ実装済み
                }
              }
            } catch (error) {
              logger.warn(`${schedule.entrance_date}の抽選カレンダー取得エラー:`, error)
            }
          }
        }
        
        // チケット自体のevent_schedulesを確認（既に予約済みのパビリオン情報）
        // 実際のAPIからevent_schedulesデータを取得する処理が必要
        // 現在のticketデータにevent_schedulesが含まれているかチェック
        if ((ticket as any).event_schedules) {
          const eventSchedules = (ticket as any).event_schedules
          logger.info(`${ticketId}: 予約済みパビリオン ${eventSchedules.length}件`)
          
          // event_schedulesの情報をpersistentなwinningInfoに変換
          for (const eventSchedule of eventSchedules) {
            if (ticket.schedules) {
              const matchingSchedule = ticket.schedules.find(s => s.entrance_date === eventSchedule.entrance_date)
              if (matchingSchedule?.pavilionReservationStatus) {
                // winning情報を設定（event_scheduleがあるということは当選済み）
                const reservationType = eventSchedule.lottery_type || '1' // デフォルトは当日予約
                const typeKey = getReservationTypeKey(reservationType)
                
                // 当選情報を静的ストレージに保存
                const staticKey = `${eventSchedule.entrance_date}_${typeKey}`
                pavilionStaticInfo.value.set(staticKey, {
                  submissionStatus: 'won',
                  winningInfo: {
                    eventName: eventSchedule.event_name,
                    scheduleName: eventSchedule.schedule_name,
                    startTime: eventSchedule.start_time,
                    endTime: eventSchedule.end_time,
                    useState: eventSchedule.use_state
                  }
                })
                
                logger.debug('パビリオン当選情報を保存', { staticKey, eventName: eventSchedule.event_name })
              }
            }
          }
        }
      }
      
      logger.info('✅ パビリオン予約当選情報取得完了')
      
    } catch (error: any) {
      // API利用制限の場合は情報ログとして記録
      if (error?.isApiDisabled || error?.isApiSuppressed) {
        logger.info('API利用制限のためパビリオン予約当選情報取得をスキップ')
      } else {
        logger.error('❌ パビリオン予約当選情報取得エラー:', error)
      }
    }
  }

  /**
   * 予約種別からキーを取得
   */
  const getReservationTypeKey = (lotteryType: string): string => {
    switch (lotteryType) {
      case '2': return '月'    // 2ヶ月前抽選
      case '3': return '週'    // 7日前抽選  
      case '4': return '3'     // 3日前予約
      case '5': return '1'     // 当日予約
      default: return '1'
    }
  }

  const loadExternalTicketData = async (ticketId: string, label: string, channel?: string): Promise<TicketData | null> => {
    try {
      const channels = channel ? [channel] : ['5', '4', '3', '2']
      
      for (const testChannel of channels) {
        try {
          const response = await authenticatedFetch(`/api/d/proxy_tickets/${ticketId}/add_check?registered_channel=${testChannel}`)
          
          if (response.ok) {
            const data = await response.json()

            const ticketData: TicketData = {
              ticket_id: data.ticket_id,
              isOwn: false,
              label: label,
              schedules: []
            }
            // processSchedulesにticketDataを渡して空き枠追加を判定
            ticketData.schedules = processSchedules(data.schedules || [], ticketData)

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
      
    } catch (error: any) {
      // API利用制限の場合は情報ログとして記録
      if (error?.isApiDisabled || error?.isApiSuppressed) {
        logger.info('API利用制限のため外部チケット取得をスキップ', { ticketId })
      } else {
        logger.error('外部チケット取得エラー', { ticketId, error })
      }
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
    // スケジュールデータがある場合は正しくprocessSchedulesを通す
    if (ticket.schedules && Array.isArray(ticket.schedules)) {
      const processedSchedules = processSchedules(ticket.schedules, ticket)
      ticket.schedules = processedSchedules

    }

    tickets.value.set(ticket.ticket_id, ticket)
  }

  // 個別チケットIDの情報更新
  const updateSingleTicket = async (ticketId: string, forceRefresh: boolean = false) => {
    logger.info('個別チケット情報更新開始', { ticketId, forceRefresh })
    
    try {
      // 該当チケットの最新情報を取得
      const userReservationsResponse = await getUserReservations()
      const updatedTicketData = userReservationsResponse.find(
        (ticket: any) => ticket.ticket_id === ticketId
      )
      
      if (updatedTicketData) {
        // 既存のチケット情報を取得してisOwnとlabelを保持
        const existingTicket = tickets.value.get(ticketId)
        const isOwn = existingTicket?.isOwn ?? true // デフォルトでtrue
        const label = existingTicket?.label

        const ticketWithPavilionInfo: TicketData = {
          ticket_id: updatedTicketData.ticket_id,
          item_name: updatedTicketData.item_name,
          isOwn: isOwn,
          label: label,
          schedules: []
        }

        // スケジュールデータを正しく処理してからパビリオン予約情報を追加
        const processedSchedules = processSchedules(updatedTicketData.schedules || [], ticketWithPavilionInfo)


        ticketWithPavilionInfo.schedules = await Promise.all(processedSchedules.map(async (schedule: any) => {
          const pavilionType = determinePavilionReservationType(schedule)
          const pavilionStatus = await getAllPavilionReservationStatus(schedule)

          return {
            ...schedule,
            pavilionReservationType: pavilionType,
            pavilionReservationActive: pavilionType !== null,
            pavilionReservationStatus: pavilionStatus
          }
        }))

        // 既存チケットを更新
        tickets.value.set(ticketId, ticketWithPavilionInfo)
        
        logger.info('個別チケット情報更新完了', { 
          ticketId,
          hasSchedules: (ticketWithPavilionInfo.schedules || []).length > 0
        })
      } else {
        logger.warn('指定されたチケットIDが見つかりません', { ticketId })
      }
      
    } catch (error: any) {
      // API利用制限の場合は情報ログとして記録
      if (error?.isApiDisabled || error?.isApiSuppressed) {
        logger.info('API利用制限のため個別チケット情報更新をスキップ', { ticketId })
      } else {
        logger.error('個別チケット情報更新エラー', { ticketId, error })
        throw error
      }
    }
  }

  const removeTicket = (ticketId: string) => {
    tickets.value.delete(ticketId)
    logger.info('チケットを削除しました', { ticketId })
  }

  const selectTicket = (ticketId: string, selected: boolean) => {
    // 廃止予定: 新しい予約管理システムを使用してください
    logger.warn('selectTicket is deprecated, use reservation management system instead', { ticketId, selected })
  }

  const selectAllTickets = () => {
    // 廃止予定: 新しい予約管理システムを使用してください
    logger.warn('selectAllTickets is deprecated, use reservation management system instead')
  }

  const deselectAllTickets = () => {
    // 廃止予定: 新しい予約管理システムを使用してください
    logger.warn('deselectAllTickets is deprecated, use reservation management system instead')
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
            // 旧システムの復元処理は無効化（reservationManagementで管理）
            // schedule.selected = true - 削除済み
            restoredCount++
            logger.debug('復元処理スキップ', { ticketId, scheduleId });
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

  /**
   * 入場予約スケジュール取得（キャッシュ機能付き）
   */
  const getEntranceScheduleData = async (year: number, month: number, forceUpdate: boolean = false): Promise<EntranceScheduleData | null> => {
    const key = `${year}-${String(month).padStart(2, '0')}`
    const now = Date.now()
    const oneHour = 60 * 60 * 1000
    
    // キャッシュチェック（1時間制限）
    const lastUpdate = entranceSchedulesUpdateTime.value.get(key) || 0
    const hasValidCache = entranceSchedules.value.has(key) && now - lastUpdate < oneHour
    
    if (!forceUpdate && hasValidCache) {
      logger.info(`入場スケジュール キャッシュ利用`, { key, age: Math.round((now - lastUpdate) / (1000 * 60)) })
      return entranceSchedules.value.get(key)!
    }
    
    try {
      logger.info('入場スケジュール API取得開始', { year, month, forceUpdate })
      
      // チケットIDを取得（実証結果: ticket_idsパラメータの有無によらず同一レスポンス）
      const ticketIds = Array.from(tickets.value.keys())
      logger.info('入場スケジュール取得', { ticketIds, ticketCount: ticketIds.length })
      
      // ticket_idsは空でも同じレスポンスが返されるため、そのまま呼び出し
      const scheduleData = await getEntranceSchedules(year, month, ticketIds)
      
      // キャッシュに保存
      entranceSchedules.value.set(key, scheduleData)
      entranceSchedulesUpdateTime.value.set(key, now)
      
      logger.info('入場スケジュール取得・キャッシュ完了', { 
        key, 
        datesCount: Object.keys(scheduleData.states).length 
      })
      
      return scheduleData
    } catch (error: any) {
      // API利用制限の場合は情報ログとして記録
      if (error?.isApiDisabled || error?.isApiSuppressed) {
        logger.info('API利用制限のため入場スケジュール取得をスキップ', { year, month })
      } else {
        logger.error('入場スケジュール取得エラー', { year, month, error })
      }
      return null
    }
  }
  
  /**
   * 当月から10月までの入場スケジュールを一括取得
   */
  const loadEntranceSchedulesRange = async (forceUpdate: boolean = false): Promise<void> => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1
    const endYear = 2025
    const endMonth = 10
    
    logger.info('入場スケジュール一括取得開始', { 
      from: `${currentYear}-${currentMonth}`, 
      to: `${endYear}-${endMonth}`,
      forceUpdate 
    })
    
    const promises = []
    
    // 当月から2025年10月まで
    let year = currentYear
    let month = currentMonth
    
    while (year < endYear || (year === endYear && month <= endMonth)) {
      promises.push(getEntranceScheduleData(year, month, forceUpdate))
      
      month++
      if (month > 12) {
        month = 1
        year++
      }
    }
    
    await Promise.all(promises)
    logger.info('入場スケジュール一括取得完了', { count: promises.length })
  }

  // 予約ID管理システム
  const setReservationManagement = (reservationId: string, data: Partial<ReservationManagementData>): void => {
    const existing = reservationManagement.value.get(reservationId)
    const now = Date.now()
    
    const newData: ReservationManagementData = {
      ticketId: existing?.ticketId || data.ticketId || '',
      isSelected: data.isSelected ?? existing?.isSelected ?? false,
      isLocked: data.isLocked ?? existing?.isLocked ?? false,
      userLabel: data.userLabel ?? existing?.userLabel ?? '',
      entranceDate: data.entranceDate ?? existing?.entranceDate ?? '',
      reservationType: data.reservationType ?? existing?.reservationType,
      createdAt: existing?.createdAt || now,
      updatedAt: now
    }
    
    reservationManagement.value.set(reservationId, newData)
    logger.debug('予約ID管理データ更新', { reservationId, data: newData })
  }

  const getReservationManagement = (reservationId: string): ReservationManagementData | undefined => {
    return reservationManagement.value.get(reservationId)
  }

  const getReservationsByTicketId = (ticketId: string): ReservationManagementData[] => {
    return Array.from(reservationManagement.value.values())
      .filter(reservation => reservation.ticketId === ticketId)
  }

  const toggleSelection = (reservationId: string): void => {
    const existing = reservationManagement.value.get(reservationId)
    if (existing) {
      setReservationManagement(reservationId, { isSelected: !existing.isSelected })
    }
  }

  const toggleLock = (reservationId: string, ticketId?: string): void => {
    const existing = reservationManagement.value.get(reservationId)
    const currentLocked = existing?.isLocked || false
    setReservationManagement(reservationId, { 
      isLocked: !currentLocked,
      ticketId: ticketId || existing?.ticketId || ''
    })
    logger.debug('ロック状態切り替え', { reservationId, ticketId, from: currentLocked, to: !currentLocked })
  }

  const updateLabel = (reservationId: string, label: string, ticketId?: string): void => {
    const existing = reservationManagement.value.get(reservationId)
    setReservationManagement(reservationId, { 
      userLabel: label,
      ticketId: ticketId || existing?.ticketId || ''
    })
  }

  const getSelectedReservationIds = (): string[] => {
    return Array.from(reservationManagement.value.entries())
      .filter(([_, data]) => data.isSelected)
      .map(([reservationId, _]) => reservationId)
  }

  const getLockedReservationIds = (): string[] => {
    return Array.from(reservationManagement.value.entries())
      .filter(([_, data]) => data.isLocked)
      .map(([reservationId, _]) => reservationId)
  }

  // 新規予約枠が選択されているかチェック
  const hasSelectedNewReservationSlot = (): boolean => {
    return Array.from(reservationManagement.value.values())
      .some(data => data.isSelected && data.isNewReservationSlot)
  }

  // 選択された新規予約枠の情報を取得
  const getSelectedNewReservationSlot = (): ReservationManagementData | undefined => {
    return Array.from(reservationManagement.value.values())
      .find(data => data.isSelected && data.isNewReservationSlot)
  }

  const removeReservationManagement = (reservationId: string): void => {
    reservationManagement.value.delete(reservationId)
    logger.debug('予約ID管理データ削除', { reservationId })
  }

  const clearAllReservationManagement = (): void => {
    reservationManagement.value.clear()
    logger.debug('全予約ID管理データクリア')
  }

  // チケット単体情報更新関数
  const updateTicketFromAPI = async (ticketId: string): Promise<TicketData | null> => {
    try {
      logger.info('チケット単体情報更新開始', { ticketId })
      
      const response = await authenticatedFetch(`/api/d/user_visiting_reservations?ticket_id=${ticketId}`)
      if (!response.ok) {
        logger.error('チケット情報取得失敗', { ticketId, status: response.status })
        return null
      }
      
      const apiData = await response.json()
      
      if (!apiData.data || apiData.data.length === 0) {
        logger.warn('チケット情報が空', { ticketId })
        return null
      }
      
      // 最初のチケットデータを使用（通常1件のはず）
      const ticketData = apiData.data[0]

      const updatedTicket: TicketData = {
        ticket_id: ticketData.ticket_id,
        item_name: ticketData.item_name,
        isOwn: true, // API取得したチケットは自分のもの
        schedules: []
      }
      // processSchedulesにticketDataを渡して空き枠追加を判定
      updatedTicket.schedules = processSchedules(ticketData.schedules || [], updatedTicket)
      
      // 既存のチケット情報を更新
      tickets.value.set(ticketId, updatedTicket)
      
      // 予約ID管理データを自動作成/更新
      updatedTicket.schedules?.forEach(schedule => {
        if (schedule.user_visiting_reservation_id != null) {
          const reservationId = schedule.user_visiting_reservation_id.toString()
          const existing = getReservationManagement(reservationId)
          
          setReservationManagement(reservationId, {
            ticketId: ticketId,
            entranceDate: schedule.entrance_date,
            reservationType: schedule.reservation_type,
            // 既存の選択状態・ロック状態・ラベルは保持
            isSelected: existing?.isSelected ?? false,
            isLocked: existing?.isLocked ?? false,
            userLabel: existing?.userLabel ?? ''
          })
        }
      })
      
      logger.info('チケット単体情報更新完了', { 
        ticketId, 
        schedulesCount: updatedTicket.schedules?.length || 0 
      })
      
      return updatedTicket
      
    } catch (error) {
      logger.error('チケット単体情報更新エラー', { ticketId, error })
      return null
    }
  }
  
  // 取得済みチケットデータでstoreを更新する関数
  const updateTicketFromData = (ticketData: any): void => {
    if (!ticketData || !ticketData.ticket_id) {
      logger.error('無効なチケットデータ', { ticketData })
      return
    }
    
    const ticketId = ticketData.ticket_id
    logger.info('チケットデータ直接更新開始', { ticketId })
    
    try {
      // 現在のチケットに関連する既存の予約IDを取得
      const existingReservationIds = Array.from(reservationManagement.value.entries())
        .filter(([_, data]) => data.ticketId === ticketId)
        .map(([reservationId, _]) => reservationId)
      
      // 更新後のチケット情報に含まれる予約IDを収集
      const updatedReservationIds = new Set<string>()
      
      // パビリオン予約情報を処理
      if (ticketData.schedules) {
        ticketData.schedules.forEach((schedule: any) => {
          if (schedule.user_visiting_reservation_id) {
            const reservationId = schedule.user_visiting_reservation_id.toString()
            updatedReservationIds.add(reservationId)
            
            const existing = reservationManagement.value.get(reservationId)
            
            // 予約ID管理データを設定/更新（既存の選択状態・ロック状態・ラベルは保持）
            setReservationManagement(reservationId, {
              ticketId: ticketId,
              entranceDate: schedule.entrance_date,
              reservationType: schedule.reservation_type,
              // 既存の選択状態・ロック状態・ラベルは保持
              isSelected: existing?.isSelected ?? false,
              isLocked: existing?.isLocked ?? false,
              userLabel: existing?.userLabel ?? ''
            })
          }
        })
      }
      
      // 更新後のチケット情報に含まれなくなった予約IDの選択状態を解除
      existingReservationIds.forEach(reservationId => {
        if (!updatedReservationIds.has(reservationId)) {
          const existingData = reservationManagement.value.get(reservationId)
          if (existingData?.isSelected) {
            logger.info('削除された予約IDの選択状態を解除', { 
              ticketId, 
              reservationId,
              wasSelected: existingData.isSelected 
            })
            // 選択状態のみ解除（ロック状態とラベルは保持）
            setReservationManagement(reservationId, { isSelected: false })
          }
        }
      })
      
      // チケットデータを直接更新（processSchedulesを通して isEffective を計算）
      if (ticketData.schedules && Array.isArray(ticketData.schedules)) {
        ticketData.schedules = processSchedules(ticketData.schedules, ticketData)
        logger.debug('updateTicketFromData: processSchedules実行済み', {
          ticketId,
          schedulesCount: ticketData.schedules.length
        })
      }
      
      tickets.value.set(ticketId, ticketData)
      lastUpdateTime.value = Date.now()
      
      logger.info('チケットデータ直接更新完了', { 
        ticketId, 
        schedulesCount: ticketData.schedules?.length || 0 
      })
      
    } catch (error) {
      logger.error('チケットデータ直接更新エラー', { ticketId, error })
    }
  }

  // 初期化メソッド - キャッシュ復元と新鮮さ判定を担当
  const init = async (): Promise<void> => {
    logger.info('チケットストア初期化開始', {
      isApiDisabled: isApiUsageDisabled(),
      isInitialized: isInitialized.value,
      lastUpdateTime: lastUpdateTime.value,
      isFresh: isFresh.value
    })

    // API利用なしモードでは初期化をスキップ
    if (isApiUsageDisabled()) {
      logger.info('API利用なしモードのためチケットストア初期化をスキップ')
      isInitialized.value = true
      return
    }

    // 既に初期化済みの場合は時間経過判定
    if (isInitialized.value) {
      logger.info('既に初期化済み - 時間経過判定を実行', {
        isFresh: isFresh.value,
        timeSinceUpdate: lastUpdateTime.value > 0 ? Math.round((Date.now() - lastUpdateTime.value) / (1000 * 60)) : 'N/A'
      })

      // 時間経過していれば更新
      if (!isFresh.value) {
        logger.info('データが古いため再取得を実行')
        judgmentTime.value = new Date()
        await loadAllTickets()
        await loadEntranceSchedulesRange(true)
      }
      return
    }

    // 初回初期化時も時間経過判定
    logger.info('初回初期化 - 時間経過判定を実行', {
      isFresh: isFresh.value,
      timeSinceUpdate: lastUpdateTime.value > 0 ? Math.round((Date.now() - lastUpdateTime.value) / (1000 * 60)) : 'N/A'
    })

    // データが古い場合のみ取得
    if (!isFresh.value) {
      logger.info('データが古いためチケット情報を取得')
      judgmentTime.value = new Date()
      await loadAllTickets()
      await loadEntranceSchedulesRange(true)
    } else {
      logger.info('データが新鮮のため取得をスキップ')
    }

    isInitialized.value = true
    logger.info('チケットストア初期化完了')
  }

  /**
   * 入場予約の変更可能性を判定
   * @param reservationId 予約ID
   * @returns 変更可能な場合true
   */
  const canModifyReservation = (reservationId: string): boolean => {
    // NEWスロット（新規予約用）の場合は常に変更可能
    if (reservationId.startsWith('new-reservation-')) {
      return true
    }

    // 既存予約の場合
    const reservationManagement = getReservationManagement(reservationId)

    // ロックされている場合は変更不可
    if (reservationManagement?.isLocked) {
      return false
    }

    // 予約情報を取得
    const { ticket, schedule } = getScheduleByReservationId(reservationId)

    // チケットが見つからない場合は変更不可
    if (!ticket || !schedule) {
      return false
    }

    // 自分のチケットでない場合は変更不可
    if (!ticket.isOwn) {
      return false
    }

    return true
  }

  /**
   * 複数の入場予約の変更可能性を判定
   * @param reservationIds 予約IDの配列
   * @returns 少なくとも1つが変更可能な場合true
   */
  const canModifyAnyReservation = (reservationIds: string[]): boolean => {
    return reservationIds.some(id => canModifyReservation(id))
  }

  /**
   * チケットタブ移動時のリフレッシュ
   */
  const refreshOnTabActivation = async (): Promise<void> => {
    logger.info('チケットタブ移動によるリフレッシュ開始', {
      lastUpdateTime: lastUpdateTime.value,
      isFresh: isFresh.value,
      timeSinceUpdate: lastUpdateTime.value > 0 ? Math.round((Date.now() - lastUpdateTime.value) / (1000 * 60)) : 'N/A'
    })

    // API利用なしモードではスキップ
    if (isApiUsageDisabled()) {
      logger.info('API利用なしモードのためリフレッシュをスキップ')
      return
    }

    // 時間経過判定：1時間以上経過している場合のみ取得
    if (isFresh.value) {
      logger.info('データが新鮮のため取得をスキップ', {
        timeSinceUpdate: Math.round((Date.now() - lastUpdateTime.value) / (1000 * 60))
      })
      return
    }

    // 判定時刻を更新
    judgmentTime.value = new Date()

    try {
      await loadAllTickets()
      await loadEntranceSchedulesRange(true)
      logger.info('チケットタブ移動によるリフレッシュ完了')
    } catch (error) {
      logger.error('チケットタブ移動時リフレッシュエラー', error)
      throw error
    }
  }

  /**
   * 予約IDから入場予約情報（チケット・スケジュール）を取得
   * @param reservationId 予約ID（実際の予約IDまたは新規予約用の特別ID）
   * @returns チケットと対応するスケジュール、または新規予約の場合は基本情報
   */
  function getScheduleByReservationId(reservationId: string): { ticket: TicketData | null, schedule: ScheduleData | null, isNewReservation: boolean } {
    // 新規予約IDパターンの場合
    if (reservationId.startsWith('new-reservation-')) {
      const ticketId = reservationId.replace('new-reservation-', '')
      const ticket = tickets.value.get(ticketId)
      if (ticket) {
        // 新規予約の場合はスケジュールは空データを返す
        const newSchedule: ScheduleData = {
          user_visiting_reservation_id: -1,
          entrance_date: '',
          schedule_name: 'NEW',
          use_state: 0,
          gate_type: 0,
          location_index: 0,
          time_start: '',
          selected: false,
          isEffective: false,
          pavilionReservationInfo: undefined
        }
        return { ticket, schedule: newSchedule, isNewReservation: true }
      }
      return { ticket: null, schedule: null, isNewReservation: true }
    }

    // 既存の予約IDの場合
    for (const ticket of tickets.value.values()) {
      if (ticket.schedules) {
        const schedule = ticket.schedules.find(s =>
          s.user_visiting_reservation_id?.toString() === reservationId
        )
        if (schedule) {
          return { ticket, schedule, isNewReservation: false }
        }
      }
    }

    return { ticket: null, schedule: null, isNewReservation: false }
  }

  // 入場予約データの更新
  const refreshEntranceData = async (year: number, month: number, options: {
    onStateRestore?: (selectedDate: string) => void,
    onLoadTimeSlots?: (dateString: string) => Promise<void>,
    onInitializeDefault?: () => void
  } = {}) => {
    logger.info('[TICKETS:refreshEntranceData] 入場予約データ更新開始')

    // 現在の月の入場スケジュールデータを強制更新
    logger.info('API呼び出し前のtickets状態', {
      ticketsSize: tickets.value.size,
      entranceSchedulesSize: entranceSchedules.value.size
    })

    await getEntranceScheduleData(year, month, true) // 強制更新

    // API呼び出し後の状態をログ
    logger.info('API呼び出し後のtickets状態', {
      ticketsSize: tickets.value.size,
      entranceSchedulesSize: entranceSchedules.value.size
    })

    logger.info('入場予約データ更新完了')
  }

  // 指定日の時間帯データを取得
  const getTimeSlotsForDate = (date: string) => {
    logger.info('指定日の時間帯データ取得', { date })

    try {
      // 日付をYYYYMMDD形式に変換
      const formattedDate = date.replace(/-/g, '')

      // 入場予約スケジュールを取得
      const year = parseInt(formattedDate.substring(0, 4))
      const month = parseInt(formattedDate.substring(4, 6))

      // キャッシュからデータを取得
      const cacheKey = `${year}-${String(month).padStart(2, '0')}`
      const scheduleData = entranceSchedules.value.get(cacheKey)

      if (!scheduleData) {
        logger.warn('入場スケジュールキャッシュがありません', { date, year, month, cacheKey })
        return null
      }

      logger.info('キャッシュからデータ取得', { date, year, month, cacheKey })

      // 指定日のスケジュールを検索（0埋め形式）
      const dayOfMonth = formattedDate.substring(6, 8) // "01", "29"
      const dayData = scheduleData?.states?.[dayOfMonth]

      logger.info('スケジュールデータ検索', {
        date,
        dayOfMonth,
        hasScheduleData: !!scheduleData,
        hasDayData: !!dayData,
        dayDataKeys: dayData ? Object.keys(dayData) : null
      })

      return dayData || null
    } catch (error) {
      logger.error('時間帯データ取得エラー', error)
      return null
    }
  }

  // time_stateから混雑状況を判定
  const getStatusFromTimeState = (timeState?: number): string => {
    // 0:空き, 1:残り少ない, 2:満席, 4:利用不可
    switch (timeState) {
      case 0: return 'low'   // 空き
      case 1: return 'high'  // 残り少ない
      case 2: return 'full'  // 満席
      case 4: return 'full'  // 利用不可（満席として扱う）
      default: return 'full' // 不明な場合は満席として扱う
    }
  }

  /**
   * 選択中の入場予約に未使用のパビリオンの当日予約または三日前予約があるかチェック
   */
  const hasUnusedPavilionReservationsInSelected = (): boolean => {
    const selectedReservationIds = getSelectedReservationIds()

    for (const reservationId of selectedReservationIds) {
      const reservationData = reservationManagement.value.get(reservationId)
      if (!reservationData) continue

      const ticketId = reservationData.ticketId
      const ticket = tickets.value.get(ticketId)
      if (!ticket || !ticket.schedules) continue

      // 選択中の入場予約を探す
      const schedule = ticket.schedules.find(s =>
        s.user_visiting_reservation_id?.toString() === reservationId
      )

      if (!schedule || !schedule.pavilionReservationStatus) continue

      // パビリオン予約ステータスをチェック（当日予約'1'または三日前予約'3'のみ）
      for (const [type, status] of Object.entries(schedule.pavilionReservationStatus)) {
        // 当日予約('1')または三日前予約('3')で、当選済み（winningInfo）があり、未使用（useState === 0）の予約があるかチェック
        if ((type === '1' || type === '3') && status.winningInfo && status.winningInfo.useState === 0) {
          logger.temp('未使用パビリオンの当日/三日前予約検出', {
            ticketId,
            reservationId,
            type: type === '1' ? '当日予約' : '三日前予約',
            pavilionName: status.winningInfo.eventName,
            time: status.winningInfo.startTime
          })
          return true
        }
      }
    }

    return false
  }

  return {
    // State
    tickets,
    selectedEntranceDates,
    isLoading,
    isInitialized,
    availableDates,
    entranceSchedules,
    lastUpdateTime,
    isFresh,
    reservationManagement,
    pavilionStaticInfo,
    
    // Getters
    ticketsArray,
    selectedTickets,
    selectedTicketIds,
    selectedTicketCount,
    ownTickets,
    externalTickets,
    selectedPavilionReservationInfo,
    
    // Actions
    init,
    refreshOnTabActivation,
    loadAllTickets,
    loadOwnTickets,
    fetchPavilionWinningInfo,
    getEntranceScheduleData,
    loadEntranceSchedulesRange,
    refreshEntranceData,
    getTimeSlotsForDate,
    getStatusFromTimeState,
    setTickets,
    addTicket,
    updateSingleTicket,
    removeTicket,
    selectTicket,
    selectAllTickets,
    deselectAllTickets,
    setAvailableDates,
    setLoading,
    extractAvailableDates,
    saveSelectedEntranceDate,
    removeSelectedEntranceDate,
    restoreSelectedEntranceDates,
    clearPavilionReservationCache,
    
    // 予約ID管理システム
    setReservationManagement,
    getReservationManagement,
    getReservationsByTicketId,
    toggleSelection,
    toggleLock,
    updateLabel,
    getSelectedReservationIds,
    getLockedReservationIds,
    hasSelectedNewReservationSlot,
    getSelectedNewReservationSlot,
    removeReservationManagement,
    clearAllReservationManagement,
    canModifyReservation,
    canModifyAnyReservation,

    // ヘルパーメソッド
    getScheduleByReservationId,
    hasUnusedPavilionReservationsInSelected,

    // チケット単体更新
    updateTicketFromAPI,
    updateTicketFromData
  }
}, {
  persist: {
    key: 'ytomo-tickets-store',
    pick: ['selectedEntranceDates', 'tickets', 'lastUpdateTime', 'entranceSchedules', 'entranceSchedulesUpdateTime', 'isInitialized', 'reservationManagement', 'pavilionStaticInfo'], // キャッシュ・初期化状態・予約ID管理・静的情報を永続化
    serializer: {
      serialize: (data: any) => {
        // MapをObjectに変換してシリアライズ
        const serialized = { ...data }
        if (serialized['selectedEntranceDates'] instanceof Map) {
          serialized['selectedEntranceDates'] = Object.fromEntries(serialized['selectedEntranceDates'])
        }
        if (serialized['tickets'] instanceof Map) {
          serialized['tickets'] = Object.fromEntries(serialized['tickets'])
        }
        if (serialized['entranceSchedules'] instanceof Map) {
          serialized['entranceSchedules'] = Object.fromEntries(serialized['entranceSchedules'])
        }
        if (serialized['entranceSchedulesUpdateTime'] instanceof Map) {
          serialized['entranceSchedulesUpdateTime'] = Object.fromEntries(serialized['entranceSchedulesUpdateTime'])
        }
        if (serialized['reservationManagement'] instanceof Map) {
          serialized['reservationManagement'] = Object.fromEntries(serialized['reservationManagement'])
        }
        if (serialized['pavilionStaticInfo'] instanceof Map) {
          serialized['pavilionStaticInfo'] = Object.fromEntries(serialized['pavilionStaticInfo'])
        }
        return JSON.stringify(serialized)
      },
      deserialize: (data: string) => {
        const parsed = JSON.parse(data)
        // ObjectをMapに復元
        if (parsed['selectedEntranceDates'] && typeof parsed['selectedEntranceDates'] === 'object') {
          parsed['selectedEntranceDates'] = new Map(Object.entries(parsed['selectedEntranceDates']))
        }
        if (parsed['tickets'] && typeof parsed['tickets'] === 'object') {
          parsed['tickets'] = new Map(Object.entries(parsed['tickets']))
        }
        if (parsed['entranceSchedules'] && typeof parsed['entranceSchedules'] === 'object') {
          parsed['entranceSchedules'] = new Map(Object.entries(parsed['entranceSchedules']))
        }
        if (parsed['entranceSchedulesUpdateTime'] && typeof parsed['entranceSchedulesUpdateTime'] === 'object') {
          parsed['entranceSchedulesUpdateTime'] = new Map(Object.entries(parsed['entranceSchedulesUpdateTime']))
        }
        if (parsed['reservationManagement'] && typeof parsed['reservationManagement'] === 'object') {
          parsed['reservationManagement'] = new Map(Object.entries(parsed['reservationManagement']))
        }
        if (parsed['pavilionStaticInfo'] && typeof parsed['pavilionStaticInfo'] === 'object') {
          parsed['pavilionStaticInfo'] = new Map(Object.entries(parsed['pavilionStaticInfo']))
        }
        return parsed
      }
    }
  }
})