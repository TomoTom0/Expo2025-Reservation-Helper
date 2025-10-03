# 現在作業中のタスク

## 🔧 入場予約実行時の選択チケット情報スナップショット実装 (作業中)

### 実装内容
- 入場予約開始時に選択チケット情報をstoreに保存
  - 選択チケットのid
  - 予約id（新規の場合はnull）
  - もともとの予約日時東西（新規の場合はnull）
- 実際の入場予約API呼び出し時はスナップショットを使用
- UI表示の動的切り替え
  - 予約実行前：選択チケットの情報
  - 予約実行中：storeのスナップショット情報
  - 対象エリア：左上エリア、予約情報エリア、時間帯テーブル元の日付部分

### 作業状況
- [x] ブランチ作成: feature/entrance-reservation-snapshot
- [x] タスク管理更新
- [x] 要件をtmp/wip/に保存
- [x] 実装のための調査完了（調査結果: tmp/wip/entrance-reservation-snapshot-investigation.md）
- [x] スナップショットstate追加
- [x] executeReservation修正（スナップショット作成）
- [x] callActualReservationAPI修正（スナップショット使用）
- [x] UI表示の動的切り替え実装
- [x] ビルド成功
- [ ] テスト・動作確認

### 課題
- 入場予約実行中にチケットタブで選択を変更すると、予約APIに影響が出る問題を解決

## 📝 メモ
- 指示原文: tmp/wip/entrance-reservation-snapshot.md
