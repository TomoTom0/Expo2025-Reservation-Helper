# 公式API仕様による画面遷移・パビリオン検索手法

## 概要

大阪万博2025公式サイトのAPI仕様とNext.js Router操作を詳細解析し、拡張機能から確実に動作する画面遷移とパビリオン検索手法を確立。

## 1. パビリオン検索API

### 1.1 エンドポイント
```
/api/d/events
```

### 1.2 必須ヘッダー
```typescript
headers: {
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
    'X-Api-Lang': 'ja'  // 日本語レスポンス取得の鍵
}
```

**重要**: `X-Api-Lang: ja`ヘッダーが日本語レスポンス取得の必須要件。公式サイトのapp-page.jsで発見：
```javascript
t.defaultApi.defaults.headers.common["X-Api-Lang"] = e
```

### 1.3 パラメータ構造

#### 基本構造
```typescript
const apiUrl = `/api/d/events?${ticketIdsParam}${eventNameParam}${entranceDateParam}${paginationParam}&channel=${lotteryParam}`;
```

#### 各パラメータ詳細

**ticket_ids[]** (必須)
```typescript
const ticketIdsParam = searchParams.ticketIds.map(id => `ticket_ids[]=${id}`).join('&');
// 例: ticket_ids[]=NCSQCZ9PC6
```

**event_name** (検索時のみ)
```typescript
const eventNameParam = query ? `&event_name=${encodeURIComponent(query)}` : '';
// 例: &event_name=%E6%97%A5%E6%9C%AC
```

**entrance_date** (重要: 常に含める)
```typescript
const entranceDate = searchParams.entranceDate || '20250826';
const entranceDateParam = `&entrance_date=${entranceDate}`;
// 例: &entrance_date=20250826
```

**ページネーション**
```typescript
const paginationParam = `&count=1&limit=999&event_type=${searchParams.eventType}&next_token=`;
// 例: &count=1&limit=999&event_type=0&next_token=
```

**channel** (抽選タイプ)
```typescript
const lotteryParam = new URLSearchParams(window.location.search).get('lottery') || '1';
// 例: &channel=4 (fast)、&channel=1 (someday)
```

### 1.4 実際のAPIリクエスト例

**空検索（全件取得）**
```
/api/d/events?ticket_ids[]=NCSQCZ9PC6&entrance_date=20250826&count=1&limit=999&event_type=0&next_token=&channel=4
```

**日本語検索**
```
/api/d/events?ticket_ids[]=NCSQCZ9PC6&event_name=%E6%97%A5%E6%9C%AC&entrance_date=20250826&count=1&limit=999&event_type=0&next_token=&channel=4
```

## 2. Next.js Router制御

### 2.1 問題: Content Script vs Page Context

拡張機能のContent ScriptからNext.js Routerにアクセスする際、Isolated Worldの制限により`window.next.router`に直接アクセスできない。

### 2.2 解決策: CSP制限回避テクニック

**onclick属性を利用したPage Contextアクセス**

```typescript
export function executeRouterPush(url: string): boolean {
    try {
        // CSP制限回避方式でRouter.push()実行
        const pushDiv = document.createElement('div');
        pushDiv.style.display = 'none';
        pushDiv.setAttribute('onclick', `window.next?.router?.push('${url}')`);
        document.body.appendChild(pushDiv);
        pushDiv.click();
        document.body.removeChild(pushDiv);
        
        console.log('✅ Router.push()実行完了:', url);
        return true;
        
    } catch (e) {
        console.error('❌ Router.push()実行エラー:', e);
        return false;
    }
}
```

### 2.3 Router存在確認

```typescript
export function checkNextRouter(): { exists: boolean; type: string } | null {
    try {
        const testDiv = document.createElement('div');
        testDiv.style.display = 'none';
        
        // onclick属性経由でPage contextにアクセス
        testDiv.setAttribute('onclick', 'this.dataset.router = JSON.stringify({exists: !!window.next?.router, type: typeof window.next?.router})');
        document.body.appendChild(testDiv);
        testDiv.click();
        
        const result = testDiv.dataset['router'];
        document.body.removeChild(testDiv);
        
        if (result) {
            const routerInfo = JSON.parse(result);
            if (routerInfo.exists) {
                return routerInfo;
            }
        }
        
        return null;
        
    } catch (e) {
        console.error('Router存在確認エラー:', e);
        return null;
    }
}
```

## 3. 統合ユーティリティ: router-utils.ts

### 3.1 モジュール構造

```typescript
/**
 * Next.js Router操作ユーティリティ
 * Content Script環境でのCSP制限を回避してPage ContextのRouterにアクセス
 */
export const RouterUtils = {
    /**
     * Router存在確認
     */
    check: checkNextRouter,
    
    /**
     * Router.push()実行
     */
    push: executeRouterPush,
    
    /**
     * Router情報の詳細ログ出力
     */
    logInfo(): void {
        const routerInfo = checkNextRouter();
        console.log('=== Next.js Router情報 ===');
        console.log('存在:', routerInfo?.exists || false);
        console.log('型:', routerInfo?.type || 'unknown');
    }
};
```

### 3.2 使用例

```typescript
import { RouterUtils } from './router-utils';

// Router存在確認
const routerInfo = RouterUtils.check();
if (routerInfo?.exists) {
    // 画面遷移実行
    const success = RouterUtils.push('/event_time/?id=NCSQCZ9PC6&event_id=H1H9');
}
```

## 4. 公式サイト解析による発見

### 4.1 言語設定メカニズム

**app-page.js（関数55448周辺）で発見**
```javascript
// axiosデフォルト設定
t.defaultApi.defaults.headers.common["X-Api-Lang"] = e

// その他の重要ヘッダー
t.defaultApi.defaults.headers.common.Authorization = "Bearer " + token
t.defaultApi.defaults.headers.common["X-Sell-Mode"] = sellMode
```

### 4.2 API構築ロジック

**event_search.js解析結果**
```javascript
// 公式サイトでのAPI URL構築
var f = "/api/d/events" + v + y + m + h + "&channel=" + V

// パラメータ詳細
// v: ticketIdsParam
// y: eventNameParam 
// m: entranceDateParam
// h: paginationParam
// V: lotteryParam
```

## 5. 実装時の注意点

### 5.1 重要な設定

1. **entrance_dateパラメータ**: 必ず含める（fastチャンネルでも必須）
2. **X-Api-Langヘッダー**: 日本語レスポンス取得に必須
3. **CSP制限**: onclick属性でのPage Contextアクセスが唯一の方法

### 5.2 エラー対処

**403エラーの主な原因**
- `entrance_date`パラメータの欠如
- `X-Api-Lang`ヘッダーの不足
- 不正な`channel`パラメータ（数値でなく文字列を指定）

**Router取得失敗の原因**
- Content Script環境での直接アクセス試行
- CSP制限によるinlineスクリプト実行不可

## 6. テスト方法

### 6.1 API検索テスト

```javascript
// デバッグダイアログでテスト実行
// 1. 空検索で全件取得確認
// 2. 「日本」検索で日本語レスポンス確認
// 3. limit=999で大量データ取得確認
```

### 6.2 Router遷移テスト

```javascript
// パビリオンコード「H1H9」でテスト
// 1. Router存在確認
// 2. Router.push()実行
// 3. URLパラメータ確認
```

## 7. 今後の拡張

### 7.1 他モジュールでの活用

- 入場予約自動化でのRouter操作
- 同行者管理での画面遷移
- 監視サービスでのページ更新

### 7.2 エラーハンドリング強化

- Router取得失敗時のフォールバック
- API呼び出し失敗時のリトライ機構
- ネットワークエラー対応

---

**作成日**: 2025-08-22  
**最終更新**: 2025-08-22  
**検証環境**: Chrome拡張機能 Manifest v3、Next.js 12.2.0  
**実装状況**: ✅ デバッグダイアログでの完全実装完了