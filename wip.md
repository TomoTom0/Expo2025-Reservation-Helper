# WIP - 作業中のタスク

## 完了した機能

### 当日パビリオン予約ダイアログ ✅
- パビリオン検索ページでFABサブボタン押下により当日予約ダイアログを表示
- 万博API（expo.ebii.net/api/data）を利用してパビリオン情報を取得
- CORS対策として Chrome拡張機能とUserScript両方に対応

#### UI仕様 ✅
- **ヘッダー**: タイトル + 更新ボタン（右上）
- **制御エリア**: 空きのみトグルボタン（ON/OFF切り替え、色で状態表示）
- **パビリオンリスト**: 
  - 各アイテムに予約ボタン（空きなし時はdisabled）
  - 全体表示時に監視チェックボックス（左端配置）
  - アイテム全体クリックでチェック可能、チェック時は背景色変更
- **フッター**: 閉じるボタン + 空きのみボタン + 監視ボタン
- **ボタンスタイル統一**: 全ボタンが円形の洗練されたスタイル

#### 技術実装 ✅
- Chrome拡張機能: background service workerでAPI アクセス
- UserScript: GM_xmlhttpRequestでCORS回避
- 空きのみ/全体表示の切り替え機能
- パビリオン情報: 名前、時間枠（🟢空きあり 🟡残りわずか ⚪空きなし）、予約ボタン
- 監視チェックボックス機能（UI実装済み、機能は後日実装予定）

## 現在の作業

### 予約自動化機能の詳細設計 🔄
パビリオン予約の自動化について詳細設計を進行中：

#### 確認済み仕様
- **遷移先URL**: `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${pavilionCode}&screen_id=108&lottery=5&entrance_date=${formatDateToYMD()}`
- **必要データ**: ticketIds（usp値）、pavilionCode、selectedTimeSlot、entranceDate
- **自動操作フロー**: 動的待機 → ページタイトル確認 → 時間選択確認・実行 → submit押下 → 結果確認

#### 詳細設計中の項目
1. **アーキテクチャ設計** ✅
   - コンポーネント構成の明確化
   - データフローの設計

2. **データ構造設計** ✅
   ```typescript
   interface ReservationCache {
     pavilionCode: string;      // event_id用
     pavilionName: string;      // 表示用
     ticketIds: string;         // usp値（id用）
     selectedTimeSlot: string;  // 選択時間枠
     entranceDate: string;      // 入場日（YYYY-MM-DD）
     targetUrl: string;         // 遷移先URL
     status: 'pending' | 'processing' | 'completed' | 'failed';
     timestamp: number;
   }
   ```

3. **設計検討事項** 📋
   - 詳細質問事項を `./tmp/reservation-automation-questions.md` に整理
   - UI配置、データ取得方法、自動操作の具体的仕様について要確認

## 次のステップ
1. 🔍 **設計質問の回答** - UI仕様、データ取得方法の確定
2. 🎨 **時間選択UI の実装**
3. 💾 **キャッシュ管理システムの実装**
4. 🤖 **自動操作エンジンの実装**
5. 🛡️ **エラーハンドリングの実装**