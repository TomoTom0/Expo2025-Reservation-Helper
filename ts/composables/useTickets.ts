/**
 * チケット管理Composable
 * Storeベースの統合チケット管理
 */

import { computed } from 'vue'
import { useTicketsStore } from '@/stores/tickets'
import type { TicketData } from '@/types/api'
import { loggers } from '@/utils/logger'

export const useTickets = () => {
  const ticketsStore = useTicketsStore()
  const logger = loggers.tickets

  // Computed properties
  const allTickets = computed(() => ticketsStore.ticketsArray)
  const selectedTickets = computed(() => ticketsStore.selectedTickets)
  const selectedTicketCount = computed(() => ticketsStore.selectedTicketCount)
  const ownTickets = computed(() => ticketsStore.ownTickets)
  const externalTickets = computed(() => ticketsStore.externalTickets)
  const isLoading = computed(() => ticketsStore.isLoading)
  const availableDates = computed(() => ticketsStore.availableDates)

  // Actions - Storeのメソッドを直接委譲
  const loadAllTickets = async (): Promise<TicketData[]> => {
    return await ticketsStore.loadAllTickets()
  }

  const addTicket = async (ticketId: string, label: string = '', channel: number = 4): Promise<void> => {
    try {
      logger.info('チケット追加', { ticketId, channel })
      
      // チケット一覧を再読み込み
      await loadAllTickets()
      
    } catch (error) {
      logger.error('チケット追加エラー', error)
      throw error
    }
  }

  const selectTicket = (ticketId: string, selected: boolean): void => {
    ticketsStore.selectTicket(ticketId, selected)
  }

  const selectAllTickets = (): void => {
    ticketsStore.selectAllTickets()
  }

  const deselectAllTickets = (): void => {
    ticketsStore.deselectAllTickets()
  }

  // キャッシュからの入場予約選択復元
  const restoreEntranceSelectionFromCache = (): string | null => {
    try {
      const cachedDate = localStorage.getItem('ytomo_entrance_selection')
      return cachedDate
    } catch (error) {
      logger.warn('入場選択キャッシュ復元エラー', error)
      return null
    }
  }

  const saveEntranceSelectionToCache = (date: string): void => {
    try {
      localStorage.setItem('ytomo_entrance_selection', date)
    } catch (error) {
      logger.warn('入場選択キャッシュ保存エラー', error)
    }
  }

  const loadFavoriteTickets = async (): Promise<void> => {
    logger.info('お気に入りチケット読み込み開始')
    await loadAllTickets()
  }

  return {
    // State
    allTickets,
    selectedTickets,
    selectedTicketCount,
    ownTickets,
    externalTickets,
    isLoading,
    availableDates,
    
    // Actions
    loadAllTickets,
    addTicket,
    selectTicket,
    selectAllTickets,
    deselectAllTickets,
    restoreEntranceSelectionFromCache,
    saveEntranceSelectionToCache,
    loadFavoriteTickets
  }
}