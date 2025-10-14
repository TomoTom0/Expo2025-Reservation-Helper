# クロスプラットフォーム開発のベストプラクティス

## 1. 避けるべき実装

| 避けるべき内容 | 理由 | 代替案 |
|--------------|------|--------|
| **Chrome Storage API** | iOSで問題が起きる可能性があり、Content Scriptからの利用は非効率 | Pinia + localStorage |
| **非同期ストレージ（IndexedDB）** | Pinia pluginが非対応、データ競合リスク | localStorage（同期的） |
| **バックグラウンドページ** | iOS非対応（非永続的のみ許可） | Content Scriptのみで実装 |
| **`console.log`直接使用** | ログレベル制御不可、本番環境でログが残る | カスタムLogger |
| **インラインスタイル** | 保守性低下、レスポンシブ対応困難 | SCSS + クラス階層 |
| **クリックイベントのみ** | iOSで300ms遅延 | `@touchend.prevent`併用 |
| **固定幅・固定フォントサイズ** | モバイルで見づらい | メディアクエリでレスポンシブ化 |

---

## 2. 推奨する実装

| 推奨内容 | 理由 |
|---------|------|
| **TypeScript** | 型安全性、iOS/PC共通コード品質向上、リファクタリング容易 |
| **Vue.js SFC** | UIコンポーネント再利用性、モバイル/PC両対応が容易 |
| **Pinia + persistedstate** | 状態管理の一元化、localStorage永続化、シンプルなAPI |
| **カスタムLogger** | ビルド時ログレベル制御、本番/開発切り替え容易 |
| **単一ファイルバンドル** | 配布・管理が容易、UserScript互換性、iOS Safari対応 |
| **SCSS + BEM風命名** | 保守性向上、レスポンシブ対応、クラス名の衝突回避 |
| **`@touchend.prevent`併用** | iOS Safariでの即座の応答、二重実行防止 |
| **メディアクエリ3段階** | 400px/600px/768pxでモバイル/タブレット/PC対応 |

---

## 3. コーディング規約

### 3.1 TypeScript

```typescript
// ✅ 良い例: 型を明示的に定義
interface TicketData {
  ticket_id: string
  item_name: string
  schedules: ScheduleData[]
}

function fetchTickets(): Promise<TicketData[]> {
  // ...
}

// ❌ 悪い例: any型の乱用
function fetchTickets(): Promise<any> {
  // ...
}
```

### 3.2 Vue.js

```vue
<!-- ✅ 良い例: Composition API + TypeScript -->
<script setup lang="ts">
import { ref, computed } from 'vue'

const tickets = ref<TicketData[]>([])
const filteredTickets = computed(() => {
  return tickets.value.filter(t => t.item_name.includes('通期'))
})
</script>

<!-- ❌ 悪い例: Options API + 型なし -->
<script>
export default {
  data() {
    return {
      tickets: []
    }
  }
}
</script>
```

### 3.3 Logger

```typescript
// ✅ 良い例: カスタムLogger使用
import { loggers } from '@/utils/logger'
const logger = loggers.tickets

logger.info('チケット取得完了', { count: tickets.length })
logger.error('API呼び出しエラー', error)

// ❌ 悪い例: console.log直接使用
console.log('チケット取得完了', tickets.length)
console.error('エラー', error)
```

### 3.4 CSS/SCSS

```scss
// ✅ 良い例: BEM風命名 + レスポンシブ
.ytomo-ticket-item {
  padding: 16px;
  font-size: 16px;

  &__header {
    font-weight: bold;
  }

  @media (max-width: 600px) {
    padding: 12px;
    font-size: 14px;
  }
}

// ❌ 悪い例: 汎用的なクラス名 + 固定サイズ
.item {
  padding: 16px;
  font-size: 16px;
}
```

---

## 4. テスト方針

### 4.1 単体テスト

**対象**: ビジネスロジック（`ts/modules/*.ts`, `ts/services/*.ts`）

```typescript
// tests/v1.0/unit/auth.test.ts
import { authenticatedFetch } from '@/utils/authManager'

describe('authenticatedFetch', () => {
  it('should include credentials in fetch', async () => {
    // テストコード
  })

  it('should handle 401 error', async () => {
    // テストコード
  })
})
```

### 4.2 統合テスト

**対象**: ストア連携、UI連携

```typescript
// tests/v1.0/integration/ticket-store.test.ts
import { useTicketsStore } from '@/stores/tickets'

describe('TicketsStore', () => {
  it('should load tickets from API', async () => {
    const store = useTicketsStore()
    await store.loadTickets()
    expect(store.tickets.size).toBeGreaterThan(0)
  })
})
```

### 4.3 手動テスト

**対象**: 実際のブラウザ（Chrome, Safari）で動作確認

**チェックリスト**:
- [ ] iOS Safariでタッチ操作が正常に動作
- [ ] PC Chromeでクリック操作が正常に動作
- [ ] レスポンシブデザインが正しく適用（400px/600px/768px）
- [ ] localStorageへの永続化が動作
- [ ] API呼び出しと認証が正常
- [ ] ログレベルがビルド設定通り

---

## 5. パフォーマンス最適化

### 5.1 避けるべきパターン

```typescript
// ❌ 悪い例: 頻繁なDOM操作
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div')
  div.textContent = `Item ${i}`
  document.body.appendChild(div) // 毎回reflow発生
}

// ✅ 良い例: DocumentFragmentを使用
const fragment = document.createDocumentFragment()
for (let i = 0; i < 1000; i++) {
  const div = document.createElement('div')
  div.textContent = `Item ${i}`
  fragment.appendChild(div)
}
document.body.appendChild(fragment) // reflow 1回のみ
```

### 5.2 Vue.jsのパフォーマンス

```vue
<!-- ✅ 良い例: v-showでDOMを再利用 -->
<template>
  <div v-show="isVisible">
    <HeavyComponent />
  </div>
</template>

<!-- ❌ 悪い例: v-ifで毎回再レンダリング -->
<template>
  <div v-if="isVisible">
    <HeavyComponent />
  </div>
</template>
```

---

## 6. セキュリティ

### 6.1 XSS対策

```typescript
// ✅ 良い例: Vue.jsのテンプレート構文（自動エスケープ）
<template>
  <div>{{ userInput }}</div>
</template>

// ❌ 悪い例: innerHTML直接使用
element.innerHTML = userInput
```

### 6.2 API認証情報の扱い

```typescript
// ✅ 良い例: credentials: 'include'でブラウザのCookieを使用
const response = await fetch('/api/tickets', {
  credentials: 'include'
})

// ❌ 悪い例: トークンをlocalStorageに保存
localStorage.setItem('auth_token', token) // XSSで盗まれる可能性
```

---

## 7. デバッグ

### 7.1 iOS Safariデバッグ

1. iOSデバイスをMacに接続
2. Mac Safari → 開発 → [デバイス名] → [ページ]
3. 開発者ツールでコンソール・DOM・ネットワーク確認

### 7.2 ログレベルによるデバッグ

```bash
# 開発時: DEBUG出力でデバッグ
LOG_LEVEL=DEBUG mise run build-rsync

# 本番時: WARNのみ出力
LOG_LEVEL=WARN mise run build-rsync
```

### 7.3 一時的なログ

```typescript
// 確認用の一時ログ
logger.temp('デバッグ中の値', { value: someValue })

// 確認完了後は削除または適切なレベルに変更
logger.debug('デバッグ中の値', { value: someValue })
```

---

## 8. Git運用

### 8.1 コミットメッセージ

```bash
# ✅ 良い例: プレフィックス + 簡潔な説明
git commit -m "feat: タッチ操作対応を追加"
git commit -m "fix: iOS Safariでボタンが反応しない問題を修正"
git commit -m "refactor: ログシステムをカスタムLoggerに統一"

# ❌ 悪い例: 曖昧な説明
git commit -m "update"
git commit -m "fix bug"
```

### 8.2 ブランチ戦略

```
main
 ├─ feature/touch-handling
 ├─ feature/responsive-design
 └─ bugfix/ios-click-issue
```

---

**次のセクション**: [README.md](./README.md) - 開発ガイド目次に戻る
