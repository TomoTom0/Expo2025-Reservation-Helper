# 大阪・関西万博2025 予約API 利用ガイド

## 概要
非公式の万博予約状況確認サイト（https://expo.ebii.net/）が提供するAPIを解析し、パビリオン予約情報を取得する方法をまとめました。

## APIエンドポイント

### 1. `/api/add` - 簡潔な予約状況API
```
URL: https://expo.ebii.net/api/add
Method: GET
Content-Type: application/json
```

**レスポンス形式:**
```json
{
    "Q0H4": [{"t": "1845", "s": 1}],
    "HWH0": [
        {"t": "1830", "s": 1},
        {"t": "1930", "s": 1}
    ],
    "H1H9": [{"t": "1750", "s": 1}],
    "C7R0": [{"t": "1830", "s": 1}]
}
```

**用途:** 予約可能な時間枠のみを取得

### 2. `/api/data` - 詳細なパビリオン情報API
```
URL: https://expo.ebii.net/api/data
Method: GET
Content-Type: application/json
Size: 約21KB
```

**レスポンス形式:**
```json
[
  {
    "c": "Q0H4",
    "n": "Dynamic！ふとももシアター",
    "u": "",
    "s": [
      {"t": "1815", "s": 2},
      {"t": "1830", "s": 2},
      {"t": "1845", "s": 2}
    ]
  }
]
```

**用途:** 全パビリオンの詳細情報を取得

## データ構造の説明

### 共通フィールド
- `t`: 時間枠（HHMM形式、例: "1845" = 18:45）
- `s`: ステータス値
  - `0`: 空きあり（StatusAvailableIcon）
  - `1`: 残りわずか（StatusFewLeftIcon）
  - `2`: 満席（StatusFullIcon）
  - その他: 枠なし（StatusNoSlotsIcon）

### `/api/data`の詳細フィールド
- `c`: パビリオンコード（例: "Q0H4", "HWH0"）
- `n`: パビリオン名（日本語）
- `u`: 公式サイトURL（空文字の場合もあり）
- `s`: 時間枠とステータスの配列

## 利用方法

### 1. curlでの取得例
```bash
# 簡潔な予約状況を取得
curl -s https://expo.ebii.net/api/add > reservation_status.json

# 詳細なパビリオン情報を取得
curl -s https://expo.ebii.net/api/data > pavilion_details.json
```

### 2. 特定パビリオンの検索
```bash
# Q0H4（Dynamic！ふとももシアター）の情報を検索
grep "Q0H4" pavilion_details.json
```

### 3. 空きありパビリオンの抽出
```bash
# ステータス0（空きあり）の時間枠を検索
grep '"s":0' pavilion_details.json
```

## パビリオンコードマッピング

### 主要パビリオン
| コード | パビリオン名 |
|--------|-------------|
| Q0H4 | Dynamic！ふとももシアター |
| HWH0 | 飯田グループ×大阪公立大学共同出展館 |
| H1H9 | 日本館 |
| C7R0 | オランダパビリオン |
| H5H9 | 大阪ヘルスケアパビリオン(XD HALL)モンスターハンター |
| HQH0 | GUNDAM NEXT FUTURE PAVILION |
| I300 | シグネチャーパビリオン 宮田裕章「Better Co-Being」 |

### 完全なマッピング
詳細なパビリオンコードマッピングは `doc/info/expoService.js` の `names` オブジェクトを参照してください。

## データ更新頻度
- リアルタイム更新（具体的な更新間隔は不明）
- 当日の予約状況を反映

## 注意事項
1. **非公式API**: 公式ではないため、仕様変更や停止のリスクあり
2. **利用制限**: レート制限等の詳細は不明
3. **データ精度**: 公式サイトとの差異の可能性あり
4. **利用倫理**: 過度なアクセスは避ける

## 実装例

### JavaScript
```javascript
async function fetchExpoData(detailed = false) {
    const url = detailed ? 
        'https://expo.ebii.net/api/data' : 
        'https://expo.ebii.net/api/add';
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API取得エラー:', error);
        throw error;
    }
}

// 使用例
const reservationStatus = await fetchExpoData(false);
const pavilionDetails = await fetchExpoData(true);
```

### Python
```python
import requests
import json

def fetch_expo_data(detailed=False):
    url = 'https://expo.ebii.net/api/data' if detailed else 'https://expo.ebii.net/api/add'
    
    try:
        response = requests.get(url)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as e:
        print(f'API取得エラー: {e}')
        raise

# 使用例
reservation_status = fetch_expo_data(False)
pavilion_details = fetch_expo_data(True)
```

## 活用例
1. **予約状況監視**: 定期的にAPIを呼び出して空き状況をチェック
2. **通知システム**: 希望パビリオンに空きが出た際の通知
3. **データ分析**: 時間帯別・パビリオン別の混雑傾向分析
4. **ダッシュボード**: リアルタイム予約状況の可視化

---
*最終更新: 2025-08-16*