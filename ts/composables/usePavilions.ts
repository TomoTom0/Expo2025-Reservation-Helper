/**
 * パビリオン管理Composable
 * Storeベースの統合パビリオン管理
 */

import { computed } from 'vue'
import { usePavilionsStore } from '@/stores/pavilions'
import type { PavilionData, TimeSlotSelection, TimeSlotData, ReservationResult } from '@/types/api'

export const usePavilions = () => {
  const pavilionsStore = usePavilionsStore()

  // Computed properties
  const allPavilions = computed(() => pavilionsStore.allPavilions)
  const filteredPavilions = computed(() => pavilionsStore.filteredPavilions)
  const selectedTimeSlots = computed(() => pavilionsStore.selectedTimeSlots)
  const selectedTimeSlotsCount = computed(() => pavilionsStore.selectedTimeSlotsCount)
  const availablePavilionsCount = computed(() => pavilionsStore.availablePavilionsCount)
  const favoritePavilions = computed(() => pavilionsStore.favoritePavilions)
  const isAvailableOnlyFilter = computed(() => pavilionsStore.isAvailableOnlyFilter)
  const isLoading = computed(() => pavilionsStore.isLoading)
  const searchQuery = computed(() => pavilionsStore.searchQuery)

  // Actions - Storeのメソッドを直接委譲
  const searchPavilions = async (
    query: string, 
    ticketIds: string[] = [], 
    entranceDate?: string
  ): Promise<PavilionData[]> => {
    return await pavilionsStore.searchPavilions(query, ticketIds, entranceDate)
  }

  const loadFavoritePavilions = async (entranceDate?: string, ticketIds: string[] = []): Promise<PavilionData[]> => {
    return await pavilionsStore.loadFavoritePavilions(entranceDate, ticketIds)
  }

  const addToFavorites = (pavilionId: string, name: string): void => {
    pavilionsStore.addToFavorites(pavilionId, name)
  }

  const removeFromFavorites = (pavilionId: string): void => {
    pavilionsStore.removeFromFavorites(pavilionId)
  }

  // 時間帯選択機能
  const addSelectedTimeSlot = (selection: TimeSlotSelection): void => {
    pavilionsStore.addSelectedTimeSlot(selection)
  }

  const removeSelectedTimeSlot = (pavilionId: string, time: string): void => {
    pavilionsStore.removeSelectedTimeSlot(pavilionId, time)
  }

  const clearSelectedTimeSlots = (): void => {
    pavilionsStore.clearSelectedTimeSlots()
  }

  const selectAllTimeSlotsForPavilion = (pavilionId: string): void => {
    pavilionsStore.selectAllTimeSlotsForPavilion(pavilionId)
  }

  const deselectAllTimeSlotsForPavilion = (pavilionId: string): void => {
    pavilionsStore.deselectAllTimeSlotsForPavilion(pavilionId)
  }

  const executeReservation = async (
    pavilionId: string, 
    timeSlot: TimeSlotData, 
    entranceDate: string, 
    registeredChannel: string,
    ticketIds: string[] = []
  ): Promise<ReservationResult> => {
    return await pavilionsStore.executeReservation(pavilionId, timeSlot, entranceDate, registeredChannel, ticketIds)
  }

  const toggleAvailableOnlyFilter = (): void => {
    pavilionsStore.toggleAvailableOnlyFilter()
  }

  const refreshPavilionData = async (ticketIds: string[] = [], entranceDate?: string): Promise<PavilionData[]> => {
    // 前回の検索クエリで更新（選択リセットなし）
    const currentQuery = pavilionsStore.searchQuery
    return await pavilionsStore.refreshPavilions(currentQuery, ticketIds, entranceDate)
  }

  // ユーティリティ関数
  const getPavilionById = (pavilionId: string): PavilionData | undefined => {
    return pavilionsStore.pavilions.get(pavilionId)
  }

  const isTimeSlotSelected = (pavilionId: string, time: string): boolean => {
    return selectedTimeSlots.value.some(
      s => s.pavilionId === pavilionId && s.timeSlot.time === time
    )
  }

  const getSelectedTimeSlotsForPavilion = (pavilionId: string): TimeSlotSelection[] => {
    return selectedTimeSlots.value.filter(s => s.pavilionId === pavilionId)
  }

  // 初期化
  const init = async (): Promise<void> => {
    await pavilionsStore.init()
  }

  return {
    // State
    allPavilions,
    filteredPavilions,
    selectedTimeSlots,
    selectedTimeSlotsCount,
    availablePavilionsCount,
    favoritePavilions,
    isAvailableOnlyFilter,
    isLoading,
    searchQuery,
    
    // Actions
    init,
    searchPavilions,
    refreshPavilionData,
    loadFavoritePavilions,
    addToFavorites,
    removeFromFavorites,
    addSelectedTimeSlot,
    removeSelectedTimeSlot,
    clearSelectedTimeSlots,
    selectAllTimeSlotsForPavilion,
    deselectAllTimeSlotsForPavilion,
    executeReservation,
    toggleAvailableOnlyFilter,
    
    // Utilities
    getPavilionById,
    isTimeSlotSelected,
    getSelectedTimeSlotsForPavilion
  }
}