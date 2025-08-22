# 大阪万博2025 公式API完全仕様書

## 概要

公式サイトのJavaScriptファイル解析により発見した、パビリオン検索・時間帯取得・予約実行のためのAPI完全仕様。

**最新更新**: 2025-08-22 - チケット管理・抽選カレンダーAPI追加

## 必須ヘッダー（全API共通）

```typescript
headers: {
    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
    'X-Api-Lang': 'ja'  // 日本語レスポンス取得の必須要件
}
```

## 1. パビリオン検索API

### エンドポイント
```
GET /api/d/events
```

### パラメータ
```typescript
// 基本構造
const apiUrl = `/api/d/events?${ticketIdsParam}${eventNameParam}${entranceDateParam}${paginationParam}&channel=${lotteryParam}`;

// 各パラメータ
const ticketIdsParam = searchParams.ticketIds.map(id => `ticket_ids[]=${id}`).join('&');
const eventNameParam = query ? `&event_name=${encodeURIComponent(query)}` : '';
const entranceDateParam = `&entrance_date=${entranceDate}`;  // 常に必要
const paginationParam = `&count=1&limit=999&event_type=${eventType}&next_token=`;
```

### 実際の例
```
/api/d/events?ticket_ids[]=NCSQCZ9PC6&event_name=%E6%97%A5%E6%9C%AC&entrance_date=20250826&count=1&limit=999&event_type=0&next_token=&channel=4
```

## 2. パビリオン詳細・時間帯取得API

### エンドポイント
```
GET /api/d/events/{event_code}
```

### パラメータ
```typescript
// URL構造: /api/d/events/{event_code}?{ticketIdsParam}{entranceDateParam}&channel={lotteryParam}
const apiUrl = `/api/d/events/${eventCode}?${ticketIdsParam}${entranceDateParam}&channel=${lotteryParam}`;
```

### 実際の例
```
/api/d/events/H1H9?ticket_ids[]=NCSQCZ9PC6&entrance_date=20250826&channel=4
```

### レスポンス構造
```typescript
interface EventDetailResponse {
    event_schedules: EventSchedule[];  // 時間帯情報
    // その他のイベント詳細情報
}

interface EventSchedule {
    start_time: string;     // 開始時間
    schedule_name: string;  // スケジュール名
    // その他のスケジュール情報
}
```

## 3. 特定時間帯のスケジュール詳細取得API

### エンドポイント
```
GET /api/d/schedules/{date}/{time}/{event_code}
```

### パラメータ
```typescript
// 例: /api/d/schedules/20250826/1400/H1H9
const apiUrl = `/api/d/schedules/${date}/${time}/${eventCode}`;
```

### 実際の例
```
/api/d/schedules/20250826/1400/H1H9
```

### 用途
- 特定時間帯の詳細情報取得
- 空き状況の確認
- 予約可能性の判定

## 4. 予約リスト取得API（事前準備）

### エンドポイント
```
GET /api/d/{lottery_type}/pre_list
```

### lottery_type の種類
```typescript
// Rt()関数による分岐
const lotteryType = (channel: string) => {
    switch(channel) {
        case '4': return 'fast_lotteries';      // fastタイプ
        case '2': return 'day_lotteries';       // 7日前抽選
        case '3': return 'month_lotteries';     // 2ヶ月前抽選
        default: return undefined;
    }
};
```

### パラメータ
```typescript
const apiUrl = `/api/d/${lotteryType}/pre_list?${ticketIdsParam}${entranceDateParam}`;
```

### 実際の例
```
/api/d/fast_lotteries/pre_list?ticket_ids[]=NCSQCZ9PC6&entrance_date=20250826
```

### レスポンス構造
```typescript
interface PreListResponse {
    list: PreListItem[];
}

interface PreListItem {
    entrance_date: string;  // 入場日
    start_time: string;     // 開始時間
    event_code: string;     // イベントコード
    priority: number;       // 優先度
    id: string;            // リストID（予約実行時に使用）
}
```

## 5. パビリオン時間帯予約実行API ✅実装完了・動作確認済み

### エンドポイント
```
POST /api/d/user_event_reservations
```

### リクエストボディ
```typescript
interface ReservationRequest {
    ticket_ids: string[];       // チケットID配列
    entrance_date: string;      // 入場日（YYYYMMDD）
    start_time: string;         // 開始時間（HHMM）
    event_code: string;         // パビリオンコード
    registered_channel: string; // 登録チャンネル（lottery値）
}

// ✅ 正しいregistered_channel設定（検証済み）
const getRegisteredChannel = (lotteryParam: string) => {
    return lotteryParam; // lottery値をそのまま使用
};
```

### 実際のリクエスト例（動作確認済み）
```json
{
    "ticket_ids": ["NCSQCZ9PC6"],
    "entrance_date": "20250826",
    "start_time": "1730",
    "event_code": "I90F",
    "registered_channel": "4"
}
```

### レスポンス例
**成功時**: 予約情報オブジェクト
**満席時（422）**:
```json
{
    "error": {
        "name": "schedule_out_of_stock",
        "message": "指定されたプログラムの在庫が確保できませんでした。"
    }
}
```

### 実装時の重要ポイント ⚠️
1. **registered_channel**: lottery URLパラメータ値をそのまま使用
2. **パラメータ形式**: 全て文字列形式で送信
3. **エラーハンドリング**: 422は満席の正常なビジネスエラー

## 6. 複数パビリオン予約（優先度設定）API

### エンドポイント
```
POST /api/d/{lottery_type}
PUT /api/d/{lottery_type}/{list_id}
```

### 新規作成時（POST）
```typescript
interface MultiReservationRequest {
    ticket_ids: string[];
    event_code_1: string;     // 第1希望パビリオン
    event_code_2?: string;    // 第2希望パビリオン
    event_code_3?: string;    // 第3希望パビリオン
    event_code_4?: string;    // 第4希望パビリオン
    start_time_1: string;     // 第1希望時間
    start_time_2?: string;    // 第2希望時間
    start_time_3?: string;    // 第3希望時間
    start_time_4?: string;    // 第4希望時間
    entrance_date: string;    // somedayとemptyタイプの場合
    entrance_date_1?: string; // fastタイプの場合
    entrance_date_2?: string;
    entrance_date_3?: string;
    entrance_date_4?: string;
}
```

### 更新時（PUT）
```typescript
interface UpdateReservationRequest extends MultiReservationRequest {
    lock_version: number;  // 排他制御用バージョン
}
```

## 7. カレンダー・抽選情報取得API

### エンドポイント
```
GET /api/d/lottery_calendars
```

### パラメータ
```typescript
const apiUrl = `/api/d/lottery_calendars?entrance_date=${entranceDate}`;
```

### 実際の例
```
/api/d/lottery_calendars?entrance_date=20250826
```

### レスポンス構造
```typescript
interface LotteryCalendarResponse {
    seven_days_ago_lottery: LotteryInfo;   // 7日前抽選情報
    two_months_ago_lottery: LotteryInfo;   // 2ヶ月前抽選情報
    empty_frame_reservation: string;       // 空き枠予約状態
}
```

## 8. 入場スケジュール表示範囲取得API

### エンドポイント
```
GET /api/d/entrance_schedule_disp_range
```

### 用途
- fastタイプでの表示可能日付範囲取得

### レスポンス構造
```typescript
interface ScheduleRangeResponse {
    entrance_date_from: string;  // 表示開始日
    entrance_date_to: string;    // 表示終了日
}
```

## 9. チケット管理API 🆕

### エンドポイント
```
GET /api/d/my/tickets/
```

### パラメータ
```typescript
const apiUrl = `/api/d/my/tickets/?count=1`;
```

### 用途
- ログイン認証状態の確認
- 保有チケット一覧の取得
- 入場予約状況の詳細確認

### レスポンス構造
```typescript
interface TicketResponse {
    list: Array<{
        id: string;                    // チケットID
        type: string;                  // チケットタイプ
        state: number;                 // チケット状態
        entrance_reservations?: Array<{
            entrance_date: string;     // 入場予約日
            state: number;             // 予約状態（1=使用済み）
        }>;
    }>;
}
```

### 実装例
```typescript
// ログイン認証とチケット取得
const response = await fetch('/api/d/my/tickets/?count=1', {
    headers: {
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'X-Api-Lang': 'ja'
    }
});
const data = await response.json();
```

## 10. 抽選カレンダーAPI（詳細版） 🆕

### エンドポイント
```
GET /api/d/lottery_calendars
```

### パラメータ
```typescript
const apiUrl = `/api/d/lottery_calendars?entrance_date=${entranceDate}`;
```

### 実際の例
```
/api/d/lottery_calendars?entrance_date=20250826
```

### 詳細レスポンス構造
```typescript
interface LotteryCalendarDetailResponse {
    two_months_ago_lottery?: {
        request_start: string;     // 申込開始日時（ISO 8601）
        request_end: string;       // 申込終了日時（ISO 8601）
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

### 期間判定ロジック
```typescript
const checkPeriod = (period: any) => {
    if (!period || !period.request_start || !period.request_end) return false;
    const start = new Date(period.request_start);
    const end = new Date(period.request_end);
    const now = new Date();
    return now >= start && now <= end;
};
```

## 11. ログアウトAPI

### エンドポイント
```
GET /api/d/expo_logout
```

### パラメータ
```typescript
const apiUrl = `/api/d/expo_logout?lang=${language}`;
```

## チャンネル（抽選タイプ）定数

```typescript
// 公式サイトのY.z8定数より
enum ChannelType {
    fast = '4',           // fast抽選
    seven_days_ago = '2', // 7日前抽選
    two_month_ago = '3',  // 2ヶ月前抽選
    someday = '1',        // someday抽選
    empty = '0'           // 空き枠
}
```

## エラーハンドリング ✅検証済み

### 一般的なエラーレスポンス
- **400**: パラメータ不正 - `registered_channel`の設定ミス等
- **404**: リソースが見つからない
- **409**: 競合エラー（既に予約済み等）
- **422**: ビジネスエラー（満席等） - 正常な処理結果
- **403**: 権限エラー（entrance_date未指定等）

### 実装で確認されたエラーパターン
1. **400 invalid_parameter**: `registered_channel`が不正 → lottery値をそのまま使用で解決
2. **422 schedule_out_of_stock**: 満席 → 正常なビジネスロジック

### 重要な注意点 ⚠️実装時必須
1. **entrance_dateパラメータ**: fastチャンネルでも必須
2. **X-Api-Langヘッダー**: 日本語レスポンス取得に必須
3. **registered_channel**: URLのlotteryパラメータ値をそのまま設定
4. **認証ヘッダー**: `Authorization: Bearer {token}`が必要な場合あり

## 実装時の推奨フロー

### パビリオン予約の基本フロー
1. **検索**: `/api/d/events` でパビリオン一覧取得
2. **詳細取得**: `/api/d/events/{event_code}` で時間帯情報取得
3. **スケジュール確認**: `/api/d/schedules/{date}/{time}/{event_code}` で詳細確認
4. **予約実行**: `/api/d/user_event_reservations` で予約

### 複数パビリオン予約フロー
1. **事前リスト取得**: `/api/d/{lottery_type}/pre_list` で既存予約確認
2. **新規作成/更新**: 既存があれば PUT、なければ POST

---

**作成日**: 2025-08-22  
**最終更新**: 2025-08-22  
**解析対象**: event_search.js, event_time.js, app-page.js  
**検証環境**: 大阪万博2025公式サイト  
**動作確認**: ✅ POST `/api/d/user_event_reservations` 実装完了・テスト済み