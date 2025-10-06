# iOS特有の実装：タッチ操作対応

## 1. なぜタッチ操作対応が必要か

iOSデバイスでは、マウスクリックイベント（`click`）とタッチイベント（`touchstart`, `touchend`等）の挙動が異なります。

### 1.1 主な問題

| 問題 | 原因 | 影響 |
|------|------|------|
| **クリック遅延** | iOSは`click`イベントに約300msの遅延がある | UI応答性の低下 |
| **イベント伝播の違い** | タッチとクリックで`preventDefault()`の効果が異なる | 意図しない二重実行 |
| **動的要素の反応不良** | JavaScriptで生成した要素がタッチに反応しない場合がある | ボタンが押せない |

---

## 2. タッチ操作対応の実装パターン

### パターン1: Vue.jsでの`@touchend`併用

Vueコンポーネント内では、`@click`と`@touchend.prevent`を併用します。

```vue
<template>
  <button
    class="ytomo-date-button"
    @click="handleDateSelection(date)"
    @touchend.prevent="handleDateSelection(date)"
  >
    {{ formatDate(date) }}
  </button>
</template>

<script setup lang="ts">
const handleDateSelection = (date: string) => {
  // タッチでもクリックでも同じ処理
  console.log('Selected:', date)
}
</script>
```

**重要ポイント**:
- `@touchend.prevent`により、iOS Safariでの即座の応答を実現
- `.prevent`修飾子で、後続の`click`イベントの発火を防ぎ二重実行を回避
- PCでは`@click`のみが動作し、iOSでは`@touchend`が優先

**実際の使用箇所**:
```vue
<!-- ts/components/TicketTab.vue -->
<button
  @click="handleDateSelection(date)"
  @touchend.prevent="handleDateSelection(date)"
>
  {{ formatDate(date) }}
</button>

<button
  @click="handleEntranceDateSelection(schedule, ticket, $event)"
  @touchend.prevent="handleEntranceDateSelection(schedule, ticket, $event)"
>
  予約
</button>
```

### パターン2: 動的生成要素へのTouchEvent付与

JavaScriptで動的生成した要素にクリックイベントを付与する場合、iOSではTouchEventも明示的にディスパッチする必要があります。

```typescript
// ts/modules/companion-ticket-page.ts
const clickTarget = document.querySelector('.some-button') as HTMLElement

if (clickTarget) {
  // iOS対応: TouchEventをディスパッチ
  if ('ontouchstart' in window) {
    clickTarget.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }))
  }

  // 通常のクリック
  clickTarget.click()
}
```

**なぜこうするのか**:
- `'ontouchstart' in window`でタッチ対応デバイスを検出
- `TouchEvent`を明示的にディスパッチすることで、iOSでの動作を保証
- `bubbles: true`でイベント伝播を有効化（親要素のイベントリスナーも反応）

---

## 3. 実装上の注意点

### 3.1 preventDefault()の使い分け

| イベント | 使用 | 理由 |
|---------|------|------|
| `@touchend.prevent` | **常に使用** | 後続の`click`イベントをキャンセルし二重実行を防止 |
| `@touchstart.prevent` | **使用しない** | ページスクロールを妨げるため |
| `@touchmove.prevent` | **特定の場合のみ** | ドラッグ操作を実装する場合のみ使用 |

### 3.2 二重実行防止の確認

```typescript
// 正しい実装例
<button
  @click="handleClick"
  @touchend.prevent="handleClick"
>
  クリック
</button>

// 間違った実装例（二重実行される）
<button
  @click="handleClick"
  @touchend="handleClick"  // ← .preventが無いため、clickも発火
>
  クリック
</button>
```

### 3.3 デバッグ方法

iOS Safariのデバッグ機能（Mac経由）でタッチイベントの発火を確認:

1. iOSデバイスをMacに接続
2. Mac Safari → 開発 → [デバイス名] → [ページ]
3. コンソールでイベント発火を監視:
   ```javascript
   document.addEventListener('touchend', (e) => console.log('touchend', e))
   document.addEventListener('click', (e) => console.log('click', e))
   ```

---

## 4. タッチ操作対応のチェックリスト

- [ ] すべてのボタンに`@touchend.prevent`を追加
- [ ] タッチ可能要素は最低44x44px（指で押しやすいサイズ）
- [ ] 動的生成要素には`TouchEvent`ディスパッチを実装
- [ ] スクロール可能エリアで`@touchstart.prevent`を使わない
- [ ] iOS実機でタッチ操作をテスト

---

**次のセクション**: [06-api-authentication.md](./06-api-authentication.md) - fetch/API操作と認証管理
