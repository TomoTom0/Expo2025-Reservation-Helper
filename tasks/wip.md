# 現在作業中のタスク

## 🔧 パビリオン予約履歴表示機能の改善 (作業中)

### 実装内容
- パビリオン予約履歴をシンプルな3関数で管理
  - `addHistory`: 履歴に新規追加
  - `updateHistory`: 既存履歴のステータス更新
  - `deleteHistory`: 履歴から削除
- 予約履歴の表示制御
  - 初期: Running(1) + Waiting(1)のみ
  - 予約完了時に順次更新
  - 無限モード対応
- 実行3秒前からRunning表示と背景色変更
- FAB全体の色を状態に応じて変更
  - 実行中(Running): 青
  - 成功(Succeeded): 緑
  - 失敗(Failed): 赤（5秒後に黄色）
  - 待機中: 黄色
- 予約終了時にWaitingをCanceledに変更
  - 通常モード完了時
  - 予約成功時
  - 予約中断時

### 作業状況
- [x] ブランチ: feature/entrance-reservation-snapshot
- [x] 履歴管理を3関数に再設計（addHistory/updateHistory/deleteHistory）
- [x] 次の周期がない場合のWaiting表示問題を修正
- [x] 実行3秒前からRunning表示を実装
- [x] Canceled状態を型に追加
- [x] FAB全体の色を決定するcomputed property実装
- [x] 予約終了時のWaiting→Canceled変更実装
- [x] CSSクラス追加（fab-blue/green/red/yellow）
- [x] ビルド成功
- [ ] テスト・動作確認

### その他の修正
- [x] チケットタブの「+ パビリオン予約」表示を削除

## 📝 メモ
- 履歴更新はwatchではなく明示的なタイミングで実行
- 無限モードでは循環して予約を追加
- Runningの予約は実行完了まで継続、Waitingのみがキャンセルされる
