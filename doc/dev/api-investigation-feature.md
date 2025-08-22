# API調査機能実装仕様書

## 概要

パビリオン検索画面のデバッグダイアログに実装された、万博予約システムAPI調査機能の詳細仕様。

## 実装日

2025-08-22

## 参照資料

- `ref/myticket.js` - チケット管理API仕様
- `ref/ticket-selection.js` - チケット選択API仕様

## 実装機能

### 1. チケットIDすべての取得

#### API エンドポイント
```
GET /api/d/my/tickets/?count=1
```

#### 機能
- ログイン認証状態でのチケット一覧取得
- 各チケットのID、タイプ、状態を表示

#### 実装場所
`ts/modules/pavilion-search-page.ts:507-526`

#### 動作
1. ログイン状態の認証チェック
2. チケット情報API呼び出し
3. 取得したチケットデータの構造化表示
   - チケットID
   - チケットタイプ
   - チケット状態

### 2. 入場予約済みの来場日時とチケットIDの一覧

#### API エンドポイント
```
GET /api/d/my/tickets/?count=1
```

#### 機能
- 入場予約済みチケットの詳細情報表示
- 来場日時とチケットIDの対応関係を明確化

#### 実装場所
`ts/modules/pavilion-search-page.ts:528-551`

#### 動作
1. チケット情報取得
2. 入場予約データのフィルタリング
3. 日時・ID情報の構造化表示
   - 入場予約日時
   - 対応チケットID
   - 予約状態

### 3. 入場予約ごとのパビリオン予約状況

#### API エンドポイント
```
GET /api/d/lottery_calendars?entrance_date={date}
```

#### 機能
- 状態≠1の入場予約に限定した予約状況表示
- 予約タイプごとの詳細状態表示
- 個人予約状況（なし/提出/あり）とシステム状況（OPEN/CLOSED）の区別

#### 実装場所
`ts/modules/pavilion-search-page.ts:553-607`

#### 抽選期間判定ロジック

```typescript
const checkPeriod = (period: any) => {
    if (!period || !period.request_start || !period.request_end) return false;
    const start = new Date(period.request_start);
    const end = new Date(period.request_end);
    return now >= start && now <= end;
};
```

#### 期間タイプ
- `two_months_ago_lottery` - 2ヶ月前抽選
- `seven_days_ago_lottery` - 7日前抽選  
- `empty_frame_reservation` - 空き枠予約
- `on_the_day_reservation` - 当日予約

#### 表示形式
```
📅 日付: YYYY/MM/DD
🎫 チケットID: XXXXXXXXXX
┌ 2ヶ月前抽選: なし (CLOSED)
├ 7日前抽選: 提出 (OPEN)
├ 空き枠予約: あり (予約済み - 施設名 HH:MM-HH:MM)
└ 当日予約: なし (CLOSED)
```

## データ構造

### チケット情報レスポンス

```typescript
interface TicketResponse {
    list: Array<{
        id: string;
        type: string;
        state: number;
        entrance_reservations?: Array<{
            entrance_date: string;
            state: number;
        }>;
    }>;
}
```

### 抽選カレンダーレスポンス

```typescript
interface LotteryCalendarResponse {
    two_months_ago_lottery?: {
        request_start: string;
        request_end: string;
    };
    seven_days_ago_lottery?: {
        request_start: string;
        request_end: string;
    };
    empty_frame_reservation?: {
        request_start: string;
        request_end: string;
    };
    on_the_day_reservation?: {
        request_start: string;
        request_end: string;
    };
}
```

## エラーハンドリング

### 認証エラー
- 401 Unauthorized → ログイン状態確認メッセージ
- 403 Forbidden → アクセス権限確認メッセージ

### データ不足エラー
- チケットデータ未取得 → "チケットデータが見つかりませんでした"
- カレンダーデータ未取得 → "抽選カレンダーデータが見つかりませんでした"

### ネットワークエラー
- fetch失敗時の適切なエラーメッセージ表示

## 技術的特徴

### 1. 非同期処理
- async/await パターンでの安全なAPI呼び出し
- Promise.resolve()による確実な非同期処理

### 2. 動的DOM操作
- デバッグダイアログへの動的セクション追加
- リアルタイムなUI更新

### 3. 日付処理
- 正確な日付範囲検証
- タイムゾーン考慮した期間判定

## 改善点

### 今後の拡張可能性
1. **キャッシュ機能**: 取得済みデータの一時保存
2. **自動更新**: 定期的なデータ更新機能
3. **エクスポート機能**: CSV/JSON形式でのデータ出力
4. **通知機能**: 予約状況変化の自動通知

### パフォーマンス最適化
1. **バッチ処理**: 複数API呼び出しの最適化
2. **遅延読み込み**: 必要時のみデータ取得
3. **メモ化**: 計算結果の再利用

## セキュリティ考慮事項

- 認証トークンの適切な処理
- クロスサイトスクリプティング対策
- API呼び出し頻度制限の考慮