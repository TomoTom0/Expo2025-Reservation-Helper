# 入場予約API実証分析結果

## 動作確認済みAPI

### 1. 入場予約スケジュール取得API
**エンドポイント**:
```
GET /api/d/schedules/{year}/{month}
```

**確認済みパラメータ**:
- `{year}`: 年（例: 2025）
- `{month}`: 月（例: 8）
- `ticket_ids[]`: チケットID配列（オプション、例: `?ticket_ids[]=NCSQCZ9PC6`）

## 実証済みレスポンス構造

### 基本構造
```javascript
{
  "year": "2025",
  "month": "08", 
  "states": {
    // 日付別データ
  }
}
```

### データ階層
```
states
├── "28" (日付)
│   ├── "1" (東ゲート)
│   │   ├── "0700": {"schedule_name": "9:00-", "time_state": 4}
│   │   ├── "0900": {"schedule_name": "10:00-", "time_state": 4}
│   │   ├── "1000": {"schedule_name": "11:00-", "time_state": 4}
│   │   ├── "1100": {"schedule_name": "12:00-", "time_state": 4}
│   │   └── "1600": {"schedule_name": "17:00-", "time_state": 4}
│   ├── "2" (西ゲート)
│   │   └── [同様の時間帯構造]
│   └── "date_state": 2
├── "29" (日付)
├── "30" (日付) 
└── "31" (日付)
```

## 確認済み値の定義

### ゲート区分
- `"1"`: 東ゲート
- `"2"`: 西ゲート

### 時間帯
- `"0700"`: 9:00-の時間帯
- `"0900"`: 10:00-の時間帯  
- `"1000"`: 11:00-の時間帯
- `"1100"`: 12:00-の時間帯
- `"1600"`: 17:00-の時間帯

### 空き状況（time_state）
実際の値で確認済み:
- `0`: 空きあり（29日12:00東ゲート等で確認）
- `1`: 残り少ない（29日17:00東ゲート等で確認）
- `2`: 満席（29日11:00東ゲート等で確認）
- `4`: 利用不可（28日全時間帯で確認）

### 日付状態（date_state）
- `1`: 通常営業日（29, 30, 31日で確認）
- `2`: 特別状態（28日で確認）

## 動作確認結果

### テストケース1: ticket_ids無し
**リクエスト**: `GET /api/d/schedules/2025/8`  
**結果**: 200 OK、4059文字のレスポンス

### テストケース2: ticket_ids指定  
**リクエスト**: `GET /api/d/schedules/2025/8?ticket_ids[]=NCSQCZ9PC6`  
**結果**: 200 OK、4059文字のレスポンス（同一内容）

## 要件対応確認

### 要件1: 月単位で請求して日付単位の空き情報取得 ✅
- 月単位リクエスト: `/api/d/schedules/{year}/{month}`
- 日付別情報: `states[日付]`で各日の情報を取得可能

### 要件2: 日付単位で取得して時間帯単位の空き情報取得 ✅  
- 特定日指定: `states["29"]`等で日付指定
- 時間帯別空き情報: `states["29"]["1"]["1000"]`等で時間帯・ゲート別の`time_state`を取得可能
- 東西ゲート別対応: `"1"`(東)と`"2"`(西)で区別

## 実証データ例

### 8月29日の実際の空き状況
**東ゲート（"1"）**:
- 9:00-(0700): time_state=2（満席）
- 10:00-(0900): time_state=2（満席）  
- 11:00-(1000): time_state=2（満席）
- 12:00-(1100): time_state=0（空きあり）
- 17:00-(1600): time_state=1（残り少ない）

**西ゲート（"2"）**:
- 9:00-(0700): time_state=2（満席）
- 10:00-(0900): time_state=2（満席）
- 11:00-(1000): time_state=1（残り少ない）  
- 12:00-(1100): time_state=0（空きあり）
- 17:00-(1600): time_state=2（満席）

## 技術仕様

- **HTTPステータス**: 200 OK
- **レスポンス形式**: JSON
- **文字エンコーディング**: UTF-8  
- **レスポンスサイズ**: 4,059文字（2025年8月データ）
- **パラメータの影響**: `ticket_ids[]`パラメータの有無によらず同一レスポンス

### 2. 既存入場予約取得API
**エンドポイント**: `GET /api/d/my/tickets/?count=1`

**実証済みレスポンス構造**:
```javascript
{
  list: [
    {
      ticket_id: "NCSQCZ9PC6",
      item_name: "Season Pass",
      schedules: [
        {
          user_visiting_reservation_id: 26387867,  // 予約ID
          use_state: 0,                           // 0:未使用, 1:使用済み
          entrance_date: "20250901",              // YYYYMMDD形式
          gate_type: 1,                           // 1:東, 2:西
          schedule_name: "11:00-"                 // 時間帯
        }
      ]
    }
  ]
}
```

### 3. 入場予約変更申請API 
**エンドポイント**: `PUT /api/d/user_visiting_reservations`

**重要**: このAPIは**予約変更申請**であり、**変更確約ではない**

**確認済みパラメータ**:
```javascript
{
  user_visiting_reservation_ids: [26387867],
  start_time: "1000",        // HHMM形式
  gate_type: "1",            // "1":東, "2":西  
  entrance_date: "20250901"  // YYYYMMDD形式
}
```

**レスポンス**:
```javascript
{
  entrance_date: "20250901",
  start_time: "1000", 
  doing: false  // false:申請処理完了, true:処理中
}
```

**実証された動作**:
- **200 OK**: 申請受理
- **`doing: false`**: 申請処理完了  
- **実際の変更**: 空きがある場合のみ実行
- **空きなしの場合**: 申請成功だが変更されず

**確認必須**: API成功後、マイチケット情報で実際の変更を確認する必要がある

### 4. 入場予約削除API
**エンドポイント**: `DELETE /api/d/user_visiting_reservations/{id}`

**確認済みパラメータ**:
- `{id}`: 削除対象の予約ID（例: 26387867）

**レスポンス**:
```javascript
{
  doing: false  // false:削除申請完了, true:処理中
}
```

**実証された動作**:
- **200 OK**: 削除申請受理
- **`doing: false`**: 削除申請完了
- **実際の削除**: 申請が受理された場合のみ実行される
- **404 Not Found**: 存在しない予約IDまたは既に削除済み
- **422 Unprocessable Entity**: バリデーションエラー

**動作確認結果**: 
- **テスト実行**: 9/1 11:00-の予約（予約ID: 26387867）の削除申請が成功
- **削除確認**: API実行後、マイチケット情報から該当予約が実際に削除されていることを確認
- **レスポンス**: `{doing: false}` で削除申請完了

**確認必須**: API成功後、マイチケット情報で実際の削除を確認する必要がある

### 5. 新規入場予約作成API
**エンドポイント**: `POST /api/d/user_visiting_reservations`

**確認済みパラメータ**:
```javascript
{
  ticket_ids: ["NCSQCZ9PC6"],     // チケットID配列
  start_time: "1100",            // HHMM形式（12:00は1100）
  gate_type: "1",                // "1":東, "2":西
  entrance_date: "20250901"      // YYYYMMDD形式
}
```

**レスポンス**:
```javascript
{
  entrance_date: "20250901",
  start_time: "1100",
  user_visiting_reservation_ids: [29206404]  // 新規作成された予約ID配列
}
```

**実証された動作**:
- **200 OK**: 予約作成成功
- **新規予約ID取得**: `user_visiting_reservation_ids[0]`で取得可能
- **即座に反映**: API成功後すぐにマイチケット情報に反映
- **422 Unprocessable Entity**: 制限違反（満席、予約上限等）

**動作確認結果**:
- **テスト実行**: Season Pass (NCSQCZ9PC6) で 9/1 12:00- 東ゲート の新規予約作成
- **作成成功**: 予約ID 29206404 が正常に作成
- **予約数変化**: 未使用予約 2件→3件 に増加確認
- **レスポンス**: `{entrance_date: "20250901", start_time: "1100", user_visiting_reservation_ids: [29206404]}`

### 6. 新規予約可能性バリデーションAPI
**エンドポイント**: `POST /api/d/user_visiting_reservations`

**バリデーション専用パラメータ**:
```javascript
{
  ticket_ids: ["NCSQCZ9PC6"],
  validate_only: 1  // バリデーション専用フラグ
}
```

**実証された制限ルール**:
1. **Season Pass（通期パス）**: 
   - 最大3件まで予約可能
   - 使用済み予約があっても新規予約可能
   - バリデーション: 200 OK（予約可能時）

2. **通常チケット（First-Half, One-Day等）**:
   - 最大1件まで予約可能
   - **使用済み予約が1件でもあると新規予約不可**
   - バリデーション: 422 Error（制限時）

**動作確認結果**:
- **Season Pass (NCSQCZ9PC6)**: ✅ 200 OK - 新規予約可能
- **First-Half Period Ticket (WADG7CE39P)**: ❌ 422 Error - 使用済み予約があるため不可
- **One-Day Ticket (AGR8JEJ65S)**: ❌ 新規予約不可 - 未使用予約1件で上限達成

**確認必須**: バリデーションAPI成功後も、実際の予約作成時に満席等で失敗する可能性がある

### 7. ログイン状態確認とリダイレクト処理
**ログイン状態確認方法**: 既存APIの401エラーレスポンスを利用

**確認用API**: `GET /api/d/my/tickets/?count=1`
- **200 OK**: ログイン済み
- **401 Unauthorized**: 未ログイン

**ログインページリダイレクト**: `/api/d/expo_login`
- **基本形**: `window.location.replace("/api/d/expo_login")`
- **戻り先指定**: `window.location.replace("/api/d/expo_login?return_path=" + encodeURIComponent(currentPath))`

**実証された動作確認結果**:
- **ログイン済み確認**: APIが200 OKを返し、チケット情報が正常に取得される
- **未ログイン時リダイレクト**: 401エラー検出時に自動的にログインページに遷移
- **戻り先URL**: 現在のパス（pathname + search + hash）が適切にエンコードされてリダイレクト
- **リダイレクト方式**: `window.location.replace()` を使用（履歴に残らない）

**JavaScript実装パターン**:
```javascript
// ログイン状態確認
const checkLoginStatus = async () => {
    try {
        const response = await fetch('/api/d/my/tickets/?count=1', {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
            }
        });
        
        if (response.status === 401) {
            // 未ログイン -> リダイレクト
            const currentPath = window.location.pathname + window.location.search + window.location.hash;
            const encodedReturnPath = encodeURIComponent(currentPath);
            const loginUrl = `/api/d/expo_login?return_path=${encodedReturnPath}`;
            window.location.replace(loginUrl);
            return false;
        }
        
        return response.status === 200; // ログイン済み
    } catch (error) {
        return false; // エラー時は未ログインとして扱う
    }
};
```

**動作確認済みの完全なワークフロー**:
1. ログイン状態チェック実行
2. 401エラーの場合、現在URL取得・エンコード
3. ログインページにリダイレクト（戻り先URL付き）
4. ログイン完了後、元のページに自動復帰