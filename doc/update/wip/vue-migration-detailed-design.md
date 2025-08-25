# Vue.js移行 詳細設計書

## 1. 現行システム分析

### 1.1 MainDialogFabImpl の主要機能分析

#### クラス構造
```typescript
export class MainDialogFabImpl implements MainDialogFab {
    private ytFabButton: HTMLElement | null = null;
    private mainDialogContainer: HTMLElement | null = null;
    private ticketManager!: TicketManager;
    private reactiveTicketManager!: ReactiveTicketManager;
    private pavilionManager!: PavilionManager;
    private lastSearchResults: any[] = [];
    private isAvailableOnlyFilterActive: boolean = false;
    private dataPreloadPromise: Promise<void> | null = null;
}
```

#### 主要メソッド分析
1. **initialize()** - システム初期化とイベント設定
2. **showMainDialog()** - ダイアログ表示とデータロード
3. **hideMainDialog()** - ダイアログ非表示
4. **addYTFabButton()** - FABボタンDOM追加
5. **setupReactiveUIUpdaters()** - リアクティブUI更新設定

#### 現行のHTML生成パターン
- 文字列テンプレートによるHTML構築
- innerHTML による DOM 挿入
- addEventListener による イベントバインディング

### 1.2 依存システム分析

#### 外部依存
- `TicketManager` - チケットデータ管理
- `ReactiveTicketManager` - リアクティブ状態管理
- `PavilionManager` - パビリオンデータ管理
- `PageChecker` - ページ判定
- その他のutilityモジュール

## 2. Vue.js 実装設計

### 2.1 ファイル構成

```
ts/
├── components/
│   ├── MainDialog.vue          # メインダイアログSFC
│   ├── TicketTab.vue          # チケットタブSFC
│   ├── PavilionTab.vue        # パビリオンタブSFC
│   └── shared/
│       ├── FilterControls.vue # フィルタコントロール
│       └── LoadingSpinner.vue # ローディング表示
├── modules/
│   ├── vue-dialog-manager.ts  # Vue instance管理
│   ├── vue-dialog-init.ts     # 初期化処理
│   └── composables/
│       ├── useTickets.ts      # チケット状態管理
│       ├── usePavilions.ts    # パビリオン状態管理
│       └── useDialog.ts       # ダイアログ状態管理
└── types/
    └── vue-dialog.d.ts        # Vue関連型定義
```

### 2.2 MainDialog.vue 設計

#### Template構造
```vue
<template>
  <div v-if="isVisible" class="yt-main-dialog-overlay" @click="handleOverlayClick">
    <div class="yt-main-dialog" @click.stop>
      <!-- ヘッダー -->
      <div class="yt-main-dialog-header">
        <div class="yt-main-dialog-title">
          大阪万博2025予約支援ツール
          <span class="yt-version">v{{ version }}</span>
        </div>
        <button class="yt-close-button" @click="closeDialog">×</button>
      </div>
      
      <!-- タブナビゲーション -->
      <div class="yt-tab-nav">
        <button 
          v-for="tab in tabs" 
          :key="tab.id"
          :class="['yt-tab-button', { active: activeTab === tab.id }]"
          @click="setActiveTab(tab.id)"
        >
          {{ tab.label }}
        </button>
      </div>
      
      <!-- タブコンテンツ -->
      <div class="yt-tab-content">
        <TicketTab v-if="activeTab === 'ticket'" />
        <PavilionTab v-if="activeTab === 'pavilion'" />
      </div>
    </div>
  </div>
</template>
```

#### Script設計 (Composition API)
```typescript
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useDialog } from '@/composables/useDialog'
import { useTickets } from '@/composables/useTickets'
import { usePavilions } from '@/composables/usePavilions'
import TicketTab from './TicketTab.vue'
import PavilionTab from './PavilionTab.vue'

// Props
interface Props {
  initialTab?: string
}
const props = withDefaults(defineProps<Props>(), {
  initialTab: 'ticket'
})

// Emits
const emit = defineEmits<{
  close: []
}>()

// Composables
const { isVisible, version, closeDialog } = useDialog()
const { loadTickets } = useTickets()
const { searchPavilions } = usePavilions()

// State
const activeTab = ref(props.initialTab)
const tabs = [
  { id: 'ticket', label: 'チケット管理' },
  { id: 'pavilion', label: 'パビリオン検索' }
]

// Methods
const setActiveTab = (tabId: string) => {
  activeTab.value = tabId
}

const handleOverlayClick = () => {
  closeDialog()
  emit('close')
}

// Lifecycle
onMounted(async () => {
  // データの初期ロード
  await Promise.allSettled([
    loadTickets(),
    // 必要に応じて他の初期化処理
  ])
})
</script>
```

### 2.3 Composables設計

#### useDialog.ts
```typescript
import { ref, computed } from 'vue'

const isVisible = ref(false)
const version = ref('0.5.4') // version.datから読み込み

export const useDialog = () => {
  const showDialog = () => {
    isVisible.value = true
  }
  
  const closeDialog = () => {
    isVisible.value = false
  }
  
  return {
    isVisible: readonly(isVisible),
    version: readonly(version),
    showDialog,
    closeDialog
  }
}
```

#### useTickets.ts  
```typescript
import { ref, computed } from 'vue'
import type { TicketManager } from '@/modules/ticket-manager'
import type { ReactiveTicketManager } from '@/modules/reactive-ticket-manager'

const tickets = ref([])
const selectedTickets = ref(new Set())
const isLoading = ref(false)

export const useTickets = (
  ticketManager: TicketManager,
  reactiveTicketManager: ReactiveTicketManager
) => {
  const loadTickets = async () => {
    isLoading.value = true
    try {
      await reactiveTicketManager.loadAllTickets()
      tickets.value = ticketManager.getAllTickets()
    } catch (error) {
      console.error('チケット読み込みエラー:', error)
    } finally {
      isLoading.value = false
    }
  }
  
  const filteredTickets = computed(() => {
    // 既存のフィルタリングロジック移植
    return tickets.value.filter(ticket => {
      // フィルタ条件実装
    })
  })
  
  return {
    tickets: readonly(tickets),
    selectedTickets,
    isLoading: readonly(isLoading),
    filteredTickets,
    loadTickets
  }
}
```

### 2.4 VueDialogManager設計

```typescript
import { createApp, App } from 'vue'
import type { TicketManager } from './ticket-manager'
import type { ReactiveTicketManager } from './reactive-ticket-manager'
import type { PavilionManager } from './pavilion-manager'
import MainDialog from '@/components/MainDialog.vue'

export class VueDialogManager {
  private app: App | null = null
  private mountElement: HTMLElement | null = null
  private ticketManager: TicketManager
  private reactiveTicketManager: ReactiveTicketManager
  private pavilionManager: PavilionManager
  
  constructor(
    ticketManager: TicketManager,
    reactiveTicketManager: ReactiveTicketManager,
    pavilionManager: PavilionManager
  ) {
    this.ticketManager = ticketManager
    this.reactiveTicketManager = reactiveTicketManager
    this.pavilionManager = pavilionManager
  }
  
  /**
   * Vueアプリケーションを初期化・マウント
   */
  async mount(): Promise<void> {
    if (this.app) {
      console.warn('既にマウント済みです')
      return
    }
    
    // マウント用DOM要素作成
    this.mountElement = document.createElement('div')
    this.mountElement.id = 'vue-main-dialog-root'
    document.body.appendChild(this.mountElement)
    
    // Vueアプリケーション作成
    this.app = createApp(MainDialog)
    
    // グローバルプロパティ設定
    this.app.config.globalProperties.$ticketManager = this.ticketManager
    this.app.config.globalProperties.$reactiveTicketManager = this.reactiveTicketManager
    this.app.config.globalProperties.$pavilionManager = this.pavilionManager
    
    // provide/inject設定
    this.app.provide('ticketManager', this.ticketManager)
    this.app.provide('reactiveTicketManager', this.reactiveTicketManager)
    this.app.provide('pavilionManager', this.pavilionManager)
    
    // マウント実行
    this.app.mount(this.mountElement)
    
    console.log('✅ Vue Main Dialog マウント完了')
  }
  
  /**
   * Vueアプリケーションを破棄
   */
  unmount(): void {
    if (this.app) {
      this.app.unmount()
      this.app = null
    }
    
    if (this.mountElement) {
      document.body.removeChild(this.mountElement)
      this.mountElement = null
    }
    
    console.log('✅ Vue Main Dialog アンマウント完了')
  }
  
  /**
   * ダイアログ表示
   */
  async showDialog(): Promise<void> {
    if (!this.app) {
      await this.mount()
    }
    
    // useDialogのshowDialog()を呼び出し
    // グローバルイベントまたはprovide/injectで連携
  }
  
  /**
   * ダイアログ非表示
   */
  hideDialog(): void {
    // useDialogのcloseDialog()を呼び出し
  }
}
```

### 2.5 webpack設定更新

#### webpack.config.jsへの追加
```javascript
const { VueLoaderPlugin } = require('vue-loader')

module.exports = {
  // 既存設定...
  
  resolve: {
    extensions: ['.ts', '.js', '.vue'], // .vue追加
    alias: {
      '@': path.resolve(__dirname, 'ts'), // エイリアス設定
      'vue': 'vue/dist/vue.esm-bundler.js' // Vue runtime選択
    }
  },
  
  plugins: [
    // 既存プラグイン...
    new VueLoaderPlugin() // Vue Loader Plugin追加
  ],
  
  module: {
    rules: [
      // 既存ルール...
      
      // Vue Single File Component
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      
      // Vue template内のTypeScript
      {
        test: /\.ts$/,
        loader: 'ts-loader',
        options: {
          appendTsSuffixTo: [/\.vue$/], // .vueファイル内のTS処理
        },
        exclude: /node_modules/
      }
    ]
  }
}
```

## 3. 移行手順詳細

### Step 1: 環境構築
1. package.json更新 (Vue依存関係追加)
2. webpack.config.js更新
3. tsconfig.json更新
4. vue-env.d.ts作成

### Step 2: コンポーネント作成
1. MainDialog.vue基本構造作成
2. TicketTab.vue作成
3. PavilionTab.vue作成
4. 共通コンポーネント作成

### Step 3: Composables実装
1. useDialog.ts実装
2. useTickets.ts実装
3. usePavilions.ts実装

### Step 4: 管理クラス実装
1. VueDialogManager.ts実装
2. vue-dialog-init.ts実装
3. 既存システムとの統合

### Step 5: 検証・テスト
1. 機能完全性テスト
2. パフォーマンステスト
3. クロスブラウザテスト

## 4. 考慮事項

### 4.1 既存システム互換性
- TicketManager/PavilionManager APIは変更せず活用
- ReactiveTicketManagerとの段階的統合
- 既存のイベントシステムとの連携

### 4.2 パフォーマンス
- Vue.jsバンドルサイズ最適化
- 必要最小限のVue機能のみ使用
- レンダリングパフォーマンス維持

### 4.3 TypeScript統合
- 厳密な型チェック維持
- Vue.js用型定義の適切な設定
- 既存型定義との連携

### 4.4 開発・保守性
- 既存コードパターンとの一貫性維持  
- ドキュメント・コメント充実
- デバッグ・ログ機能継承