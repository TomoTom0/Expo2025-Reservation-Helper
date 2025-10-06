# fetch/API操作と認証管理

## 1. クロスオリジンAPI呼び出しの課題

Chrome拡張機能では、Content Scriptから直接APIを呼び出す際に**CORS（Cross-Origin Resource Sharing）**の制約に直面します。

### 1.1 主な問題と対応

| 問題 | 説明 | 対応 |
|------|------|------|
| **CORSエラー** | Content ScriptはWebページのコンテキストで実行されるため、異なるオリジンへのfetchが制限される | `host_permissions`でオリジンを許可 |
| **認証状態の維持** | ブラウザのセッションCookieを使用する必要がある | `credentials: 'include'`でCookieを送信 |
| **401エラー処理** | セッション切れ時の自動リダイレクト | `authenticatedFetch`で統一処理 |

---

## 2. manifest.jsonでのhost_permissions設定

```json
{
  "manifest_version": 3,
  "host_permissions": [
    "https://ticket.expo2025.or.jp/*",
    "https://tktwaitingroom.expo2025.or.jp/*",
    "https://expo.ebii.net/*"
  ]
}
```

**重要**: Content Scriptからfetchするオリジンはすべてここに記載する必要があります。

---

## 3. authenticatedFetch: 統一API呼び出し関数

本プロジェクトでは、`authManager.authenticatedFetch()`という統一的なfetchラッパーを使用します。

### 3.1 基本構造

```typescript
// ts/utils/authManager.ts
class AuthManager {
  public async authenticatedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // 1. API利用モードチェック（無効化されている場合はエラー）
    if (isApiUsageDisabled()) {
      throw new Error('API利用が無効化されています')
    }

    // 2. 相対パスの場合、固定のAPIベースURLを使用
    let url: string
    if (typeof input === 'string' && input.startsWith('/api/')) {
      url = `https://ticket.expo2025.or.jp${input}`
    } else {
      url = input.toString()
    }

    // 3. credentialsを必ず含める（セッションCookie送信）
    const response = await fetch(url, {
      credentials: 'include', // ★ これが重要
      ...init
    })

    // 4. 401エラーチェックと自動リダイレクト
    if (response.status === 401) {
      await this.handleAuthError() // ログインページへリダイレクト
    }

    return response
  }
}

export const authenticatedFetch = authManager.authenticatedFetch.bind(authManager)
```

### 3.2 使用例

```typescript
import { authenticatedFetch } from '@/utils/authManager'

// APIからチケット情報を取得
const response = await authenticatedFetch('/api/d/my/tickets/', {
  method: 'GET',
  headers: {
    'Accept': 'application/json'
  }
})

if (response.ok) {
  const tickets = await response.json()
  console.log('Tickets:', tickets)
}
```

### 3.3 なぜcredentials: 'include'が必要か

```typescript
// ❌ 間違い: セッションCookieが送信されない
const response = await fetch('/api/d/my/tickets/')

// ✅ 正しい: セッションCookieが送信される
const response = await fetch('/api/d/my/tickets/', {
  credentials: 'include'
})
```

**理由**:
- デフォルトでは、fetchは同一オリジンのリクエストのみCookieを送信
- Content Scriptから異なるオリジンにリクエストする場合、明示的に指定が必要
- `credentials: 'include'`により、認証済みセッションが維持される

---

## 4. 認証エラー処理フロー

```
1. API呼び出し実行
   ↓
2. レスポンス受信
   ↓
3. ステータスコード確認
   ↓ (401の場合)
4. 認証エラー通知表示（2秒間）
   ↓
5. ログインページへリダイレクト
```

### 4.1 認証エラー通知の実装

```typescript
// ts/utils/authManager.ts
private showAuthErrorNotification(): void {
  const notification = document.createElement('div')
  notification.id = 'ytomo-auth-error-notification'
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #dc2626;
    color: white;
    padding: 16px 20px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    z-index: 10005;
  `
  notification.textContent = 'セッションが期限切れです。ログインページにリダイレクトします...'
  document.body.appendChild(notification)

  setTimeout(() => {
    window.location.href = '/login' // リダイレクト
  }, 2000)
}
```

---

## 5. 定期的な認証状態確認

セッション切れを早期検知するため、10分ごとに軽量なAPIで認証状態を確認します。

```typescript
// ts/utils/authManager.ts
public startAuthMonitoring(): void {
  // 即座にチェック
  this.checkAuthStatus()

  // 10分ごとに定期チェック
  setInterval(() => {
    this.checkAuthStatus()
  }, 10 * 60 * 1000) // 10分
}

private async checkAuthStatus(): Promise<void> {
  try {
    const response = await this.authenticatedFetch('/api/d/my/tickets/?count=1', {
      method: 'GET'
    })

    if (response.status === 401) {
      await this.handleAuthError()
    }
  } catch (error) {
    console.error('認証確認エラー', error)
  }
}
```

**なぜ定期チェックが必要か**:
- ユーザーが長時間ページを開いたままの場合、セッションが切れる
- API呼び出し時に初めてエラーが発生するより、事前に検知して通知する方がUX向上
- 軽量なAPI（`?count=1`）で負荷を最小化

---

## 6. API利用モード

本プロジェクトでは、ユーザーがAPI利用レベルを選択できます（公式APIへの負荷軽減のため）。

| モード | 説明 | `authenticatedFetch`の挙動 |
|--------|------|---------------------------|
| **なし** | 拡張機能からのAPI呼び出しを完全に無効化 | 即座にエラーをthrow |
| **抑制** | 特定ページ（ytomoページ）以外ではAPI無効化 | ytomoページ以外ではエラー |
| **あり** | すべてのページでAPI利用可能 | 通常通り実行 |

### 6.1 API利用モードのチェック

```typescript
// ts/utils/apiUsageMode.ts
export const isApiUsageDisabled = (): boolean => {
  // localStorageから設定を取得
  const mode = localStorage.getItem('ytomo-api-usage-mode')
  return mode === 'none'
}

export const isApiUsageSuppressed = (): boolean => {
  const mode = localStorage.getItem('ytomo-api-usage-mode')
  return mode === 'suppressed'
}

// ts/utils/authManager.ts
public async authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  // API利用なしモードではエラーを即座に返す
  if (isApiUsageDisabled()) {
    const error = new Error('API利用が無効化されています') as any
    error.isApiDisabled = true
    throw error
  }

  // API利用抑制モードかつytomoページ以外では呼び出しを拒否
  if (isApiUsageSuppressed() && !PageChecker.isYtomoPage()) {
    const error = new Error('API利用が抑制されています（ytomoページ以外）') as any
    error.isApiSuppressed = true
    throw error
  }

  // ...
}
```

---

## 7. エラーハンドリングのベストプラクティス

```typescript
import { authenticatedFetch } from '@/utils/authManager'
import { loggers } from '@/utils/logger'

const logger = loggers.tickets

async function fetchTickets() {
  try {
    const response = await authenticatedFetch('/api/d/my/tickets/', {
      method: 'GET'
    })

    if (!response.ok) {
      logger.error('チケット取得失敗', {
        status: response.status,
        statusText: response.statusText
      })
      return []
    }

    const data = await response.json()
    return data.tickets

  } catch (error: any) {
    // API無効化エラーの場合は静かに失敗
    if (error.isApiDisabled || error.isApiSuppressed) {
      logger.info('API利用が無効化されているためスキップ')
      return []
    }

    // その他のエラーはログ出力
    logger.error('チケット取得エラー', error)
    throw error
  }
}
```

---

**次のセクション**: [07-installation.md](./07-installation.md) - インストール・配布方法
