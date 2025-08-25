/**
 * チケット統合管理ストア
 * 既存TicketManagerの全機能を移植
 */

import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { TicketData, ScheduleData } from '@/types/api'

export const useTicketsStore = defineStore('tickets', () => {
  // State
  const tickets = ref<Map<string, TicketData>>(new Map())
  const selectedTicketIds = ref<Set<string>>(new Set())
  const isLoading = ref(false)
  const availableDates = ref<string[]>([])
  const todayStr = ref<string>(getTodayString())
  
  // Getters (computed)
  const allTickets = computed(() => Array.from(tickets.value.values()))
  
  const selectedTickets = computed(() => 
    allTickets.value.filter(ticket => selectedTicketIds.value.has(ticket.ticket_id))
  )

  const selectedTicketCount = computed(() => selectedTicketIds.value.size)

  const ownTickets = computed(() => 
    allTickets.value.filter(ticket => ticket.isOwn)
  )

  const externalTickets = computed(() => 
    allTickets.value.filter(ticket => !ticket.isOwn)
  )
  
  // Helper function for date
  function getTodayString(): string {
    const today = new Date()
    return `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`
  }

  // Actions - TicketManagerから完全移行
  
  /**
   * スケジュールデータに有効フラグを付与
   */
  const processSchedules = (schedules: any[]): ScheduleData[] => {
    if (!Array.isArray(schedules)) return []
    
    return schedules.map(schedule => ({
      entrance_date: schedule.entrance_date || '',
      use_state: schedule.use_state || 0,
      schedule_name: schedule.schedule_name,
      time_start: schedule.time_start,
      time_end: schedule.time_end,
      reservation_type: schedule.reservation_type,
      // 有効フラグを付与: 状態0または（当日かつ状態1:入場済みでも当日は有効）
      isEffective: schedule.use_state === 0 || 
                   (schedule.use_state === 1 && schedule.entrance_date === todayStr.value)
    }))
  }

  /**
   * 全チケット情報を初期化・取得
   */
  const loadAllTickets = async (): Promise<TicketData[]> => {
    console.log('🎫 チケット統合管理: 全チケット情報取得開始')
    setLoading(true)
    
    try {
      // 自分のチケットを最優先で読み込み
      let ownTickets: TicketData[] = []
      try {
        ownTickets = await loadOwnTickets()
        console.log(`✅ 自分のチケット: ${ownTickets.length}個取得完了`)
        
        // 自分のチケットを追加
        for (const ticket of ownTickets) {
          tickets.value.set(ticket.ticket_id, ticket)
        }
      } catch (error) {
        console.error('❌ 自分のチケット取得エラー:', error)
      }

      // 外部チケットを取得（エラーがあっても自分のチケットには影響しない）
      try {
        const cachedTickets = await loadCachedExternalTickets()
        console.log(`✅ 外部チケット: ${cachedTickets.length}個取得完了`)
        
        // キャッシュされた外部チケットを追加
        for (const ticket of cachedTickets) {
          tickets.value.set(ticket.ticket_id, ticket)
        }
      } catch (error) {
        console.error('❌ 外部チケット取得エラー（自分のチケットは正常）:', error)
      }

      console.log(`✅ チケット統合管理: ${tickets.value.size}個のチケットを読み込み完了`)
      
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
    console.log('🔍 自分のチケット情報取得中...')
    
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
        console.warn('⚠️ チケットデータが期待する形式ではありません:', data)
        return []
      }

      return data.list.map((ticket: any) => ({
        ticket_id: ticket.ticket_id || ticket.simple_ticket_id || '',
        isOwn: true,
        label: ticket.item_name || 'チケット',
        schedules: processSchedules(ticket.schedules || [])
      }))
      
    } catch (error) {
      console.error('❌ 自分のチケット取得API エラー:', error)
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
      console.error('❌ キャッシュからの外部チケットID取得エラー:', error)
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

            console.log(`✅ 外部チケット${ticketId}をchannel=${testChannel}で取得成功`)
            return ticketData
          }
        } catch (error) {
          console.warn(`⚠️ 外部チケット${ticketId}のchannel=${testChannel}取得失敗:`, error)
        }
      }
      
      // どのchannelでも取得できない場合は最小限のデータを作成
      console.log(`⚠️ 外部チケット${ticketId}の詳細取得失敗、最小限データで作成`)
      return {
        ticket_id: ticketId,
        isOwn: false,
        label: label,
        schedules: []
      }
      
    } catch (error) {
      console.error(`❌ 外部チケット${ticketId}の取得エラー:`, error)
      return null
    }
  }

  /**
   * 利用可能日付を抽出
   */
  const extractAvailableDates = async (): Promise<string[]> => {
    const dates = new Set<string>()
    
    for (const ticket of allTickets.value) {
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
    allTickets.value.forEach(ticket => {
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

  // 初期化メソッド
  const init = async (): Promise<void> => {
    console.log('🎫 チケットストア初期化開始')
    await loadAllTickets()
  }

  return {
    // State
    tickets,
    selectedTicketIds,
    isLoading,
    availableDates,
    
    // Getters
    allTickets,
    selectedTickets,
    selectedTicketCount,
    ownTickets,
    externalTickets,
    
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
    extractAvailableDates
  }
})