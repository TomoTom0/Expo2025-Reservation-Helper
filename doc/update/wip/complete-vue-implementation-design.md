# 完全Vue移行実装設計書

## 1. 実装アプローチ

### 1.1 段階的移行戦略
現行システムの複雑さを踏まえ、以下の3段階で移行：

1. **Phase 1**: 環境構築とコア機能移植
2. **Phase 2**: 業務ロジック完全移植  
3. **Phase 3**: 最適化と統合テスト

### 1.2 機能完全性の保証
現行システムの全機能を100%移植するため、メソッド単位での詳細マッピングを実施。

## 2. Vue.js アーキテクチャ設計

### 2.1 コンポーネント階層
```
MainDialog.vue (ルートコンポーネント)
├── DialogHeader.vue (ヘッダー・タブナビ)
├── TicketTab.vue (チケット管理タブ)
│   ├── TicketControls.vue (簡易選択・追加フォーム)
│   ├── TicketList.vue (チケット一覧)
│   └── EntranceDateSelector.vue (入場日選択)
├── PavilionTab.vue (パビリオンタブ)
│   ├── SearchControls.vue (検索フォーム)
│   ├── PavilionList.vue (パビリオン一覧)
│   │   └── PavilionItem.vue (個別パビリオン)
│   │       └── TimeSlotButtons.vue (時間帯ボタン群)
│   └── ReservationFab.vue (予約実行FAB)
└── ReservationOverlay.vue (予約実行オーバーレイ)
```

### 2.2 状態管理設計（Pinia使用）
```typescript
// stores/mainDialog.ts
export const useMainDialogStore = defineStore('mainDialog', {
  state: () => ({
    isVisible: false,
    activeTab: 'ticket',
    version: '0.5.4'
  })
})

// stores/tickets.ts
export const useTicketsStore = defineStore('tickets', {
  state: () => ({
    tickets: [] as TicketData[],
    selectedTicketIds: new Set<string>(),
    isLoading: false,
    availableDates: [] as string[]
  })
})

// stores/pavilions.ts
export const usePavilionsStore = defineStore('pavilions', {
  state: () => ({
    searchResults: [] as any[],
    selectedTimeSlots: [] as any[],
    isAvailableOnlyFilter: false,
    isLoading: false
  })
})
```

## 3. 現行機能の完全移植マッピング

### 3.1 チケット管理機能移植

#### 現行メソッド → Vue実装
```typescript
// 現行: MainDialogFabImpl.handleAddTicket()
// Vue: composables/useTicketActions.ts
export const useTicketActions = () => {
  const ticketsStore = useTicketsStore()
  const ticketManager = inject('ticketManager')
  
  const addTicket = async (ticketId: string, label: string, channel: number) => {
    try {
      await ticketManager.addTicket(ticketId, label, channel === 5)
      await loadAllTickets()
      // UI更新は reactive store で自動実行
    } catch (error) {
      console.error('チケット追加エラー:', error)
      throw error
    }
  }
  
  return { addTicket }
}

// 現行: MainDialogFabImpl.updateTicketSelection()
// Vue: stores/tickets.ts + watcher
watch(() => ticketsStore.selectedTicketIds, (newIds) => {
  // チケット選択状態のUI同期は自動実行
}, { deep: true })

// 現行: MainDialogFabImpl.restoreEntranceSelectionFromCache()
// Vue: composables/useTicketCache.ts
export const useTicketCache = () => {
  const restoreEntranceSelection = () => {
    const cachedDate = localStorage.getItem('ytomo_entrance_selection')
    if (cachedDate) {
      // Pinia store に復元
    }
  }
  
  return { restoreEntranceSelection }
}
```

### 3.2 パビリオン管理機能移植

#### 検索・表示機能
```typescript
// 現行: MainDialogFabImpl.handlePavilionSearch()
// Vue: composables/usePavilionSearch.ts
export const usePavilionSearch = () => {
  const pavilionsStore = usePavilionsStore()
  const pavilionManager = inject('pavilionManager')
  
  const search = async (searchTerm: string = '') => {
    pavilionsStore.isLoading = true
    try {
      let pavilions
      if (searchTerm.trim()) {
        pavilions = await pavilionManager.searchPavilions(searchTerm)
      } else {
        pavilions = await pavilionManager.loadFavoritePavilions()
      }
      
      // 時間帯情報を取得（現行と同じロジック）
      const allPavilionIds = pavilions.map(p => p.id)
      const timeSlotsMap = await fetchTimeSlotsForPavilionIds(allPavilionIds)
      
      // パビリオンに時間帯情報を設定
      for (const pavilion of pavilions) {
        pavilion.timeSlots = timeSlotsMap.get(pavilion.id) || []
        pavilion.dateStatus = determineAvailabilityStatus(pavilion.timeSlots)
      }
      
      pavilionsStore.searchResults = pavilions
    } finally {
      pavilionsStore.isLoading = false
    }
  }
  
  return { search }
}
```

#### 予約実行システム移植
```typescript
// 現行: MainDialogFabImpl.handleMakeReservation()
// Vue: composables/useReservationExecution.ts
export const useReservationExecution = () => {
  const pavilionsStore = usePavilionsStore()
  const overlayStore = useOverlayStore()
  
  const executeReservation = async () => {
    const selectedTimeSlots = pavilionManager.getSelectedTimeSlots()
    const selectedTickets = ticketManager.getSelectedTickets()
    
    if (selectedTimeSlots.length === 0) {
      showNotification('時間帯を選択してください', 'error')
      return
    }
    
    if (selectedTimeSlots.length === 1) {
      await executeSingleReservation(selectedTimeSlots[0], selectedTickets)
    } else {
      await executeSequentialReservations(selectedTimeSlots, selectedTickets)
    }
  }
  
  // 現行の複雑な予約実行ロジックを完全移植
  const executeSingleReservation = async (timeSlot: any, tickets: any[]) => {
    // MainDialogFabImpl.executeSingleReservation() のロジックを移植
    overlayStore.showProcessingOverlay('予約実行中...')
    try {
      const result = await pavilionManager.makeReservation(
        timeSlot.pavilionId,
        timeSlot.timeSlot,
        tickets,
        getRegisteredChannel()
      )
      
      if (result.success) {
        showReservationSuccess(result)
      } else {
        showReservationError(result.message)
      }
    } finally {
      overlayStore.hideOverlay()
    }
  }
  
  // 現行の監視モード・順次予約も完全移植
  const executeSequentialReservations = async (timeSlots: any[], tickets: any[]) => {
    // MainDialogFabImpl.executeSequentialReservations() の複雑ロジックを移植
    // - 監視モード vs 順次予約モード
    // - リアルタイム空き状況チェック
    // - 進行状況オーバーレイ表示
  }
  
  return { executeReservation }
}
```

### 3.3 UI状態管理完全移植

#### リアクティブシステム統合
```typescript
// 現行: MainDialogFabImpl.setupReactiveUIUpdaters()
// Vue: composables/useReactiveIntegration.ts
export const useReactiveIntegration = () => {
  const ticketsStore = useTicketsStore()
  const pavilionsStore = usePavilionsStore()
  const reactiveTicketManager = inject('reactiveTicketManager')
  
  onMounted(() => {
    // 現行のReactiveTicketManagerとPinia storeを同期
    reactiveTicketManager.registerUIUpdaters({
      ticketSelection: () => {
        // Pinia store更新 → Vue自動再描画
        ticketsStore.syncFromManager()
        updateTicketTabCount()
        updatePavilionTabDates()
        updateReservationButton()
      },
      ticketList: () => {
        ticketsStore.syncTicketList()
      }
    })
  })
  
  return {}
}
```

## 4. コンポーネント詳細実装

### 4.1 MainDialog.vue
```vue
<template>
  <div
    v-if="dialogStore.isVisible"
    class="ytomo-dialog-overlay"
    @click="handleOverlayClick"
  >
    <div class="ytomo-dialog ytomo-main-dialog" @click.stop>
      <DialogHeader />
      <div class="ytomo-tab-content">
        <TicketTab v-show="dialogStore.activeTab === 'ticket'" />
        <PavilionTab v-show="dialogStore.activeTab === 'pavilion'" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useMainDialogStore } from '@/stores/mainDialog'
import { useTickets } from '@/composables/useTickets'
import { usePavilions } from '@/composables/usePavilions'
import { useReactiveIntegration } from '@/composables/useReactiveIntegration'

const dialogStore = useMainDialogStore()
const { loadAllTickets } = useTickets()
const { initializePavilionData } = usePavilions()

// 現行のESCキー・オーバーレイクリック処理を移植
const handleKeydown = (e: KeyboardEvent) => {
  if (e.key === 'Escape' && dialogStore.isVisible) {
    dialogStore.hide()
  }
}

const handleOverlayClick = () => {
  dialogStore.hide()
}

onMounted(async () => {
  document.addEventListener('keydown', handleKeydown)
  
  // 現行の並列初期化処理を移植
  const [ticketResult, pavilionResult] = await Promise.allSettled([
    loadAllTickets(),
    initializePavilionData()
  ])
  
  // エラーハンドリングも現行と同様に実装
  if (ticketResult.status === 'rejected') {
    console.error('チケットタブ初期化エラー:', ticketResult.reason)
  }
  if (pavilionResult.status === 'rejected') {
    console.error('パビリオンタブ初期化エラー:', pavilionResult.reason)
  }
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// リアクティブシステム統合
useReactiveIntegration()
</script>
```

### 4.2 PavilionItem.vue
```vue
<template>
  <div
    class="ytomo-pavilion-item"
    :class="{ 'full-pavilion': pavilion.dateStatus === 2 }"
    :data-pavilion-id="pavilion.id"
  >
    <div class="ytomo-pavilion-header">
      <button
        class="ytomo-star-button"
        :class="{ favorite: pavilion.isFavorite }"
        @click="toggleFavorite"
      >
        {{ pavilion.isFavorite ? '⭐' : '☆' }}
      </button>
      
      <label class="ytomo-pavilion-checkbox-container">
        <input
          type="checkbox"
          class="ytomo-pavilion-checkbox"
          @change="handleCheckboxChange"
        >
      </label>
      
      <span class="ytomo-pavilion-name">{{ pavilion.name }}</span>
      
      <button
        class="ytomo-expand-button"
        @click="toggleExpanded"
      >
        {{ isExpanded ? '▲' : '▼' }}
      </button>
    </div>
    
    <div
      v-show="isExpanded"
      class="ytomo-time-slots"
      :id="`time-slots-${pavilion.id}`"
    >
      <TimeSlotButtons
        :time-slots="pavilion.timeSlots"
        :pavilion-id="pavilion.id"
        @slot-selected="handleSlotSelected"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { usePavilionActions } from '@/composables/usePavilionActions'
import TimeSlotButtons from './TimeSlotButtons.vue'

interface Props {
  pavilion: any
}

const props = defineProps<Props>()
const isExpanded = ref(false)

const { toggleFavorite: toggleFav, selectTimeSlot } = usePavilionActions()

const toggleFavorite = () => {
  toggleFav(props.pavilion.id, props.pavilion.name)
}

const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

// 現行のチェックボックス変更処理を移植
const handleCheckboxChange = (e: Event) => {
  const target = e.target as HTMLInputElement
  const isChecked = target.checked
  
  // 現行のMainDialogFabImpl.handlePavilionCheckboxChange()ロジックを移植
  const timeSlots = props.pavilion.timeSlots || []
  
  if (isChecked) {
    // 全時間帯を選択
    timeSlots.forEach((slot: any) => {
      if (slot.available) {
        selectTimeSlot(props.pavilion.id, slot)
      }
    })
  } else {
    // 全時間帯の選択を解除
    timeSlots.forEach((slot: any) => {
      selectTimeSlot(props.pavilion.id, slot, false)
    })
  }
}

const handleSlotSelected = (timeSlot: any) => {
  selectTimeSlot(props.pavilion.id, timeSlot)
}
</script>
```

## 5. 複雑機能の移植戦略

### 5.1 監視・自動予約システム
```typescript
// composables/useMonitoringSystem.ts
export const useMonitoringSystem = () => {
  const isMonitoring = ref(false)
  const monitoringInterval = ref<number | null>(null)
  
  const startMonitoring = (timeSlots: any[], tickets: any[]) => {
    if (isMonitoring.value) return
    
    isMonitoring.value = true
    
    // 現行のcheckAllSlotsAvailability()ロジックを移植
    const checkLoop = async () => {
      try {
        const availableSlot = await checkAllSlotsAvailability(timeSlots, tickets)
        if (availableSlot) {
          // 空きを発見 → 即座に予約実行
          const result = await executeReservation(availableSlot, tickets)
          stopMonitoring()
          showMonitoringResult(result)
          return
        }
        
        // 次回チェックをスケジュール
        if (isMonitoring.value) {
          monitoringInterval.value = window.setTimeout(checkLoop, 2000)
        }
      } catch (error) {
        console.error('監視エラー:', error)
        stopMonitoring()
      }
    }
    
    checkLoop()
  }
  
  const stopMonitoring = () => {
    isMonitoring.value = false
    if (monitoringInterval.value) {
      clearTimeout(monitoringInterval.value)
      monitoringInterval.value = null
    }
  }
  
  return { startMonitoring, stopMonitoring, isMonitoring }
}
```

### 5.2 キャッシュ・永続化システム
```typescript
// composables/useDataPersistence.ts
export const useDataPersistence = () => {
  const saveEntranceSelection = (date: string) => {
    localStorage.setItem('ytomo_entrance_selection', date)
  }
  
  const restoreEntranceSelection = (): string | null => {
    return localStorage.getItem('ytomo_entrance_selection')
  }
  
  const saveSearchState = (state: any) => {
    localStorage.setItem('ytomo_pavilion_search_state', JSON.stringify(state))
  }
  
  const restoreSearchState = (): any | null => {
    const saved = localStorage.getItem('ytomo_pavilion_search_state')
    return saved ? JSON.parse(saved) : null
  }
  
  return {
    saveEntranceSelection,
    restoreEntranceSelection,
    saveSearchState,
    restoreSearchState
  }
}
```

## 6. パフォーマンス最適化

### 6.1 事前読み込み機能移植
```typescript
// composables/useDataPreloading.ts
export const useDataPreloading = () => {
  const preloadPromise = ref<Promise<void> | null>(null)
  
  const startPreload = () => {
    if (preloadPromise.value) return preloadPromise.value
    
    console.log('🚀 Vue: データ事前読み込み開始')
    
    preloadPromise.value = preloadData()
    return preloadPromise.value
  }
  
  const preloadData = async () => {
    try {
      const ticketManager = inject('ticketManager')
      
      // 現行と同じ並列読み込み
      const preloadPromises = [
        ticketManager.loadAllTickets(),
        // 他の重い処理
      ]
      
      await Promise.allSettled(preloadPromises)
      console.log('✅ Vue: データ事前読み込み完了')
    } catch (error) {
      console.warn('⚠️ Vue: 事前読み込みエラー:', error)
    }
  }
  
  return { startPreload, preloadPromise }
}
```

## 7. 統合・テスト戦略

### 7.1 段階的統合テスト
1. **単体コンポーネントテスト**: Vue Test Utilsで各コンポーネントを個別テスト
2. **統合テスト**: 現行システムとの連携動作確認
3. **E2Eテスト**: 実際のブラウザ環境での全機能テスト
4. **iPhone互換性テスト**: Safari/WebViewでの動作確認

### 7.2 移行検証項目
- [ ] 全チケット管理機能の動作確認
- [ ] 全パビリオン検索・予約機能の動作確認
- [ ] 監視・自動予約システムの動作確認
- [ ] キャッシュ・永続化機能の動作確認
- [ ] エラーハンドリング・ログ機能の動作確認
- [ ] パフォーマンス（初期化時間、メモリ使用量）確認
- [ ] iPhone Safari互換性確認

## 8. 実装工数見積り

### Phase 1: 環境構築 (2日)
- Vue.js/Pinia環境設定
- webpack設定更新
- 基本コンポーネント骨格作成

### Phase 2: 機能移植 (5-7日)
- チケット管理機能完全移植
- パビリオン検索・表示機能移植
- 予約実行システム移植
- 監視・自動予約システム移植

### Phase 3: 統合・最適化 (3-4日)
- 既存システムとの統合
- パフォーマンス最適化
- 全機能テスト・デバッグ

**総工数: 10-13日程度**

現行システムの複雑さを考慮すると、完全な機能移植にはかなりの工数が必要だが、iPhone互換性問題の解決という明確な目標があるため、投資価値は高い。