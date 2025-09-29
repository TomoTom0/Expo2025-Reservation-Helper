# 保留中の問題

## パビリオンタブで時間帯の残り僅か判定が正しくない

### 問題
- 現在の実装: `unavailableReason === 2` で `availabilityStatus = 'limited'` として残り僅か判定
- 公式JS (`event_time.js` 110-116行目) でも同じ定義: `STOCK_NOT_ENOUGH = 2`
- しかし実際の動作では正しく判定されていない

### 現在の実装
```typescript
// ts/stores/pavilions.ts
if (unavailableReason === 1) {
  availabilityStatus = 'full'  // STOCK_NONE = 満員
} else if (unavailableReason === 2) {
  availabilityStatus = 'limited'  // STOCK_NOT_ENOUGH = 残りわずか
} else {
  availabilityStatus = 'available'  // RESERVABLE = 空きあり
}
```

### 調査が必要な点
1. APIレスポンスで実際に `unavailableReason = 2` が返ってきているか
2. CSSクラス `limited` が正しく適用されているか
3. 公式サイトでの残りわずか表示ロジックとの差異
4. パビリオンデータの取得・変換処理での情報欠損

### 次のステップ
- 実際のAPIレスポンスをログ出力して `unavailableReason` 値を確認
- 公式サイトの残りわずか表示とExtensionの表示を比較
- 必要に応じて判定ロジックを修正