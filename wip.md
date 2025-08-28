# WIP - 作業中のタスク

## 完了した機能

### パビリオン予約自動化システム ✅

#### 当日パビリオン予約ダイアログ ✅
- パビリオン検索ページでFABサブボタン押下により当日予約ダイアログを表示
- 万博API（expo.ebii.net/api/data）を利用してパビリオン情報を取得
- CORS対策として Chrome拡張機能とUserScript両方に対応

#### 監視・即時予約システム ✅
- **即時予約**: 空き時間帯クリック → 予約ページを開き自動で時間選択・申込実行
- **監視予約**: 満員時間帯クリック → 監視対象に追加、定期的にAPI確認して空きが出れば自動予約
- **監視スケジューラー**: 毎分00,15,30,45秒での定期実行（設定変更可能）
- **順序管理**: 監視対象の選択順序を保持し、同時空発生時の優先度制御

#### UI仕様 ✅
- **ヘッダー**: タイトル + 更新ボタン（右上）
- **制御エリア**: 空きのみトグルボタン（ON/OFF切り替え、色で状態表示）
- **パビリオンリスト**: 
  - 空き時間帯：🟢空きあり 🟡残りわずか（クリックで即時予約）
  - 満員時間帯：🔴（クリックで監視対象選択、選択状態を視覚表示）
  - **選択ボタン**（空きのみOFF時のみ表示）：パビリオンの満員時間を一括選択
- **フッター**: 
  - 閉じるボタン + 空きのみボタン
  - **選択解除ボタン**（空きのみOFF時のみ表示）：全監視対象をクリア
  - **監視開始ボタン**（空きのみOFF時のみ表示）：監視機能を開始/停止

#### 技術実装 ✅
- **4つの新しいモジュール**:
  - `monitoring-scheduler.ts`: 設定可能な監視タイミング制御
  - `monitoring-cache.ts`: 順序ベースの監視対象管理
  - `monitoring-service.ts`: API監視と自動予約実行
  - `immediate-reservation.ts`: 即時予約機能
- **正しいURL実装**: `expoTable.js`を参照した完全なパラメータ指定
- **SCSSスタイリング**: インラインスタイルを廃止、適切なCSS設計
- **リダイレクト異常検知**: ページタイトル完全一致での異常判定と元ページ復旧

#### 確認済み仕様
- **遷移先URL**: `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${pavilionCode}&screen_id=108&lottery=5&entrance_date=${formatDateToYMD()}`
- **ticketIds取得**: URLパラメータ`id`から取得
- **監視タイミング**: 毎分00,15,30,45秒（容易に変更可能）
- **異常復旧**: タイトル不一致時に元のパビリオン検索ページに自動復帰

## 完了した作業

### Vue.js移行プロジェクト 🚧 **[進行中]**

#### 現在の実装状況
**既存main-dialog-fab.tsからVue.jsへの移行作業中（未完了）**

#### 完了した項目
1. **既存実装の分析**
   - main-dialog-fab.tsのHTML生成ロジックを詳細に分析 ✅
   - buildTicketTabUI()とbuildPavilionTabUI()の構造を把握 ✅
   - 既存SCSSスタイルファイルの移植対象を特定 ✅

2. **基本構造の準備**
   - **MainDialog.vue**: 基本テンプレート構造のみ（機能未実装） 🔄
   - **TicketTab.vue**: ファイル存在のみ（中身未確認） ❓
   - **PavilionTab.vue**: ファイル存在のみ（中身未確認） ❓

3. **状態管理の準備**
   - **Pinia Store**: 基本的な状態変数のみ定義 🔄
   - **Composables**: 一部API呼び出し機能のみ移植済み 🔄
   - **Manager統合**: 未実装（ManagerとStoreが併存状態） ❌

#### **重要な問題点**
- **Manager → Store移行**: **全く完了していない**
- **既存Managerクラス**: まだ実際の機能を担っている
- **Vue.jsコンポーネント**: 見た目だけでロジック未実装
- **統合テスト**: 未実施

#### **次に必要な作業**
1. **Manager機能の完全Store移行** ⭐ **最優先**
2. **VueコンポーネントとManagerの統合**  
3. **既存機能の1対1移植完了**
4. **統合テストと動作確認**

## 現在の作業

### 完了した項目

#### リダイレクト異常判定ロジックの修正 ✅

#### 問題の特定
実際のログ分析により判明した問題：
```
📍 ページ検知: reservation_time - https://ticket.expo2025.or.jp/event_time/?...
⚠️ ページ復帰情報がないため、リダイレクト検知をスキップ  ← 問題1
⏳ ページ準備完了を待機中... （15秒間待機）              ← 問題2
```

#### 根本的な誤解の修正
1. **問題1**: ページ復帰情報がないのは当然で、リダイレクト判定スキップは不要
2. **問題2**: ページが安定しているのに期待する要素（時間ラジオボタン、submitボタン）がない → **これこそが異常リダイレクト**

#### 正しい判定ロジック
```typescript
// 現在（間違い）：ページ復帰情報がないからリダイレクト判定スキップ
if (!pageReturnInfo) {
    this.log('⚠️ リダイレクト検知をスキップ');
    return;
}

// 正しい判定：ページが安定した時点で要素存在チェック
const pageInfo = this.pageDetector.extractPageInfo();
if (pageInfo.type === 'reservation_time' && !pageInfo.isReady) {
    // ページタイプは正しく検知されたが必要な要素がない = 異常リダイレクト
    throw new Error('異常リダイレクト検知');
}
```

#### 修正すべき箇所
1. **AutomationEngine.checkRedirectAbnormality()**: 不要なスキップ条件を削除
2. **PageDetector.checkReservationPageReady()**: 要素が見つからない場合の即座判定
3. **15秒待機の削除**: ページ準備判定で即座に異常リダイレクト検知

#### 期待される動作
- ページ安定化（500ms x4回）完了
- 期待する要素の存在チェック
- 要素なし → 即座に異常リダイレクト判定 → 元ページ復帰
- 要素あり → 自動予約処理継続

#### 完了した最適化項目
- **console.log削減**: 重複ログ出力を削減、状態変化時のみ出力
- **UI表示制御**: 監視関連ボタンを「空きのみOFF」時のみ表示
- **URL修正**: 正しいパラメータでの予約ページ遷移

#### 完了した項目
- **リダイレクト異常対応の改良**: pending/processing状態を統一的に扱う最適化 ✅
- **予約結果通知システム**: 高さ固定・説明文置換式の通知UI実装 ✅

## 現在のバグ修正

### お気に入り取得時のフィルター機能不具合 🔄
- [ ] お気に入り取得後にフィルター（空きのみ表示）が機能しない問題を修正

## 次のタスク：高度な予約機能実装

### 1. 時間帯選択時のタイムスタンプ記録 ✅
- [x] 時間帯ボタン選択時に`data-time-selected`属性にunixtime追加
- [x] 選択解除時に属性削除  
- [x] パビリオンチェックボックス選択時の昇順タイムスタンプ設定

### 2. 順次予約機能 ✅
- [x] 複数選択時の順次予約処理実装
- [x] 誤操作防止オーバーレイの拡張
- [x] 順次予約専用オーバーレイ（進捗・キャンセル機能）
- [x] 選択順序保持（タイムスタンプベース）
- [x] 最初の成功で即座終了
- [x] 間隔設定ドロップダウン（1,5,15,30,60秒）
- [x] 1,5秒間隔の180回制限実装（15秒間隔に自動切り替え）
- [x] **循環処理**: 対象が1週したら最初の要素から繰り返し（成功まで継続）

### 3. 監視モード ✅
- [x] 予約/監視モード切り替えUI（オーバーレイ内ボタン）
- [x] 監視モード時の定期更新処理（空き状況チェック）
- [x] 空き検出→自動予約機能
- [x] 監視間隔設定（5,15,30,60秒）
- [x] 5,15秒間隔の180回制限実装（30秒間隔に自動切り替え）
- [x] **循環処理**: 対象が1週したら最初の要素から繰り返し

### 調査項目
1. 時間帯ボタンの選択処理メソッド
2. 誤操作防止オーバーレイの現在の実装
3. 予約処理の現在の流れ
4. タイムスタンプ管理の方法

### 技術的課題
1. DOM属性管理の最適な方法
2. 定期処理のメモリリーク対策
3. 180回制限のカウンター管理
4. 監視モード時のパフォーマンス考慮

## 新しい修正項目

### main dialogチケット選択機能削除 ❌
- **問題**: チケット押下での選択機能が不要（入場予約選択で連動するため）
- **対応**: チケットタブでの個別選択機能を無効化
- **優先度**: 中

### スマホでの入場予約表示問題 📱
- **問題**: スマホで入場予約ごとの予約可能判断が失敗して表示されない
- **調査**: 予約可能判定ロジックの確認
- **優先度**: 高

### 当日予約の「1:あり」表示問題 🔢
- **問題**: 予約がないのに「1:あり」と表示される
- **調査**: 予約状況の取得・表示ロジック確認
- **優先度**: 中

## 現在の作業：Vue.jsコンポーネントの分散状態管理システム実装

### 📊 入場予約選択システムの分散状態管理 ✅ **完了**
**実装内容**: 中央集権的な状態管理から分散状態管理への移行

#### ✅ 完了した作業
1. **型定義更新** ✅
   - [x] `ScheduleData`に`selected?: boolean`フラグを追加
   - [x] 各入場予約（schedule）に個別選択状態を管理

2. **ボタン動作の分散化** ✅
   - [x] **日付ボタン**: その日付の全スケジュールを一括選択/解除
   - [x] **入場日時ボタン**: 個別スケジュールの選択状態をトグル
   - [x] **入場日付制限**: 選択時に他日付のスケジュールを自動解除

3. **UI選択状態の反映** ✅
   - [x] `isScheduleSelected()`: 個別スケジュールの選択状態表示
   - [x] `isDateSelected()`: 日付ボタンの選択状態（全スケジュール選択時のみ）
   - [x] ボタンのCSSクラス（`.selected`）による視覚的フィードバック

4. **最遅入場日時表示機能** ✅
   - [x] 選択された入場予約から最も遅い日時を自動計算
   - [x] パビリオンタブタイトル下に「MM/DD HH:MM」形式で表示
   - [x] 両コンポーネント（MainDialog.vue、PavilionTab.vue）で利用可能

5. **表示形式の統一** ✅
   - [x] ScheduleNameの末尾「-」除去処理を全箇所に適用
   - [x] 日付フォーマットを`formatDate()`と統一（0paddingなし）
   - [x] 不要な入場日のみ表示を削除

#### 技術的実装詳細
- **分散状態管理**: `schedule.selected`フラグによる個別管理
- **計算プロパティ**: `selectedSchedules`、`latestEntranceDateTime`
- **型安全性**: 適切なTypeScript型定義とimport
- **UI統一**: 全コンポーネントで一貫したスタイルと動作

### 🚧 次の作業：PavilionTab.vue機能実装
**状況**: パビリオンタブは基本構造のみで、実際の機能はまだ未実装

#### 実装予定項目
- [ ] パビリオン検索機能の完全移植
- [ ] 時間帯選択とお気に入り機能
- [ ] 予約実行システムの統合
- [ ] 監視機能の移植

## 現在のバグ調査：チケット表示が常に0の問題

### 🔍 調査結果
- **症状**: APIから4個のチケット読み込み成功するが、MainDialogで「現在のチケット数: 0」と表示
- **ログ確認**: `✅ チケット統合管理: 4個のチケットを読み込み完了` → `📋 現在のチケット数: 0`
- **推定原因**: `filteredTickets`のフィルタリング条件で全て除外されている

### 🔍 復元処理調査結果
**復元処理の問題点**:
1. **チケットデータ未ロード時の復元実行**: `restoreSelectedEntranceDates()`が`tickets.value`が空でも実行される可能性
2. **Vueリアクティビティの問題**: `schedule.selected = true`の直接変更がネストオブジェクトで検出されない可能性
3. **復元タイミング**: `loadAllTickets()`直後の復元実行順序に問題がある可能性

**復元処理とチケット表示の関係**: 復元処理は`selected`プロパティのみを変更し、`filteredTickets`は`isEffective`でフィルタリングするため、直接的な因果関係は不明

### 🎯 次の調査項目
- `filteredTickets`の計算ロジック詳細確認
- `isEffective`プロパティの値と計算過程の検証
- ストア初期化タイミングとVueコンポーネントマウント順序の確認

## 現在の作業：オーバーレイコンポーネントの独立化

### 🎯 問題点の特定
**問題**: ダイアログコンポーネント内にオーバーレイを配置すると、Teleportを使っても画面全体を正しく覆わない可能性がある

### 📋 実装方針の変更
**変更前**: PavilionTab.vue内にオーバーレイコンポーネントを配置
```vue
<template>
  <div class="ytomo-pavilion-tab">
    <!-- ダイアログ内容 -->
    <ProcessingOverlay />  <!-- ❌ ダイアログ内配置 -->
    <SequentialReservationOverlay />
  </div>
</template>
```

**変更後**: ルートレベルでオーバーレイを管理
- オーバーレイコンポーネントをアプリケーションルート（main.ts）で配置
- ストアを通じた完全な独立制御
- Teleportによる`document.body`への直接配置

### 🛠️ 作成済みファイル
1. **OverlaysStore**: `/ts/stores/overlays.ts` ✅
   - 誤操作防止オーバーレイの状態管理
   - 順次予約オーバーレイの状態管理
   - オーバーレイ表示/非表示制御メソッド

2. **ProcessingOverlay.vue**: `/ts/components/ProcessingOverlay.vue` ✅
   - シンプルなスピナー+メッセージ表示
   - Teleportによる`document.body`配置

3. **SequentialReservationOverlay.vue**: `/ts/components/SequentialReservationOverlay.vue` ✅
   - モード切替（予約/監視）
   - 間隔設定（1,5,15,30,60秒）
   - 進捗表示・カウントダウン
   - キャンセル機能

### 🔧 必要な修正作業
- [x] PavilionTab.vue内のオーバーレイコンポーネント配置を削除
- [x] MainDialog.vue内にオーバーレイコンポーネントを一時的に配置（同一Vueアプリ内での動作確認）
- [ ] **重要な構成問題**: 複数の独立したVueアプリではなく、App.vueを基軸とした単一Vueアプリ構成に変更が必要

### 🚨 発見された根本的な設計問題

#### 現在の不適切な構成
```typescript
// main-dialog-fab.ts
private vueDialogApp: App | null = null;  // MainDialog用アプリ
private vueFabApp: App | null = null;     // MainFab用アプリ
```

**問題点**:
1. **独立したVueアプリ**: MainDialogとMainFabが別々のVueアプリとして動作
2. **データ共有の複雑性**: 同じPiniaストアを使用するが、アプリが分離されているため管理が複雑
3. **非標準な構成**: Vue.jsの標準的なSPA構成ではない

#### 正しい構成（要修正）
```typescript
// 単一のVueアプリ
const app = createApp(App)  // App.vueが基軸
app.use(pinia)
app.mount('#app')
```

**App.vue内の構成**:
```vue
<template>
  <div id="app">
    <MainFab />
    <MainDialog />
    <ProcessingOverlay />
    <SequentialReservationOverlay />
  </div>
</template>
```

### ✅ 完了した修正作業
1. **App.vue作成**: 基軸となるルートコンポーネント ✅
2. **main-dialog-fab.ts改修**: 複数アプリから単一アプリ構成への変更 ✅
3. **全コンポーネント統合**: App.vue内でのコンポーネント管理 ✅
4. **ストア共有の簡素化**: 単一アプリ内での自然なストア共有 ✅

### 🔧 追加修正作業
- [x] **schedule_nameから時刻抽出**: APIデータの`time_start`が`undefined`の問題を修正
- [x] **デバッグログ削減**: 過剰なconsole.log出力を整理

## 🔄 進行中の作業：カスタムLogger設計・実装

### 📋 現在の問題
- **console.log乱用**: デバッグ目的で大量のconsole.logが散在している状態
- **ログレベル未分離**: エラー、警告、情報、デバッグが混在
- **本番環境での制御不可**: 不要なログが本番でも出力される
- **統一性の欠如**: ログフォーマットがバラバラで追跡しにくい

### 🎯 設計要件
#### 基本機能
1. **ログレベル分離**: ERROR, WARN, INFO, DEBUG の4段階
2. **環境別制御**: 本番環境では ERROR, WARN のみ出力
3. **統一フォーマット**: `[LEVEL] [MODULE] メッセージ` 形式
4. **モジュール分類**: 各機能ごとのモジュール名で分類

#### 拡張機能
1. **条件付きログ**: 特定条件下でのみ出力するオプション
2. **パフォーマンス計測**: 処理時間測定機能
3. **ログ収集**: 将来的なログ分析のためのデータ蓄積

### 🏗️ 実装設計

#### 1. Logger基本構造
```typescript
// ts/utils/logger.ts
interface LoggerConfig {
  level: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'
  module: string
  enabled: boolean
}

class CustomLogger {
  constructor(private config: LoggerConfig) {}
  
  error(message: string, data?: any): void
  warn(message: string, data?: any): void  
  info(message: string, data?: any): void
  debug(message: string, data?: any): void
  
  // パフォーマンス測定
  time(label: string): void
  timeEnd(label: string): void
}
```

#### 2. モジュール別Logger作成
```typescript
// 各モジュールでの使用例
const logger = createLogger('PAVILION', 'DEBUG')
logger.info('パビリオン検索開始', { query, count: results.length })
logger.debug('API応答', responseData)
logger.error('検索エラー', error)
```

#### 3. 環境別設定
```typescript
// 本番: ERROR, WARN のみ
// 開発: 全レベル出力
const LOG_LEVEL = process.env.NODE_ENV === 'production' ? 'WARN' : 'DEBUG'
```

### 📝 実装計画
1. **Logger基本クラス作成** ⭐ **次のタスク**
2. **モジュール別Logger定義**
3. **既存console.log置き換え** (段階的実施)
4. **パフォーマンス測定機能追加**

### 🎯 置き換え対象モジュール
- **tickets.ts**: チケット管理関連
- **pavilions.ts**: パビリオン検索・時間帯取得
- **PavilionTab.vue**: UI操作・検索実行
- **automation-engine.ts**: 自動予約エンジン
- **monitoring-service.ts**: 監視サービス

## 過去の完了作業：Vue.jsコンポーネントのスタイル整理

### 🎨 スタイル定義の方針統一 ✅
**方針**: コンポーネント専用スタイルはVueのscoped styles、共通スタイルは外部SCSSで管理

#### 完了した作業
1. **TicketTab.vue専用スタイルの移行** ✅
2. **PavilionTab.vue専用スタイルの移行** ✅  
3. **共通スタイルの整理** ✅

## 最新の完了作業：チケットタブ入場日時ボタンの東西表示機能実装

### 🎯 実装内容 ✅
**課題**: チケットタブの入場日時ボタンで間の罫線が見づらく、東西情報が表示されていない

#### 完了した修正項目
1. **APIデータでの東西情報取得・保存** ✅
   - `ts/stores/tickets.ts:133`: `processSchedules()`関数を修正
   - `schedule.gate_type`から`location_index`を生成
   - `gate_type: 1` → `location_index: 0` (東)
   - `gate_type: 2` → `location_index: 1` (西)

2. **型定義の拡張** ✅
   - `ts/types/api.ts:15`: `ScheduleData`に`location_index?: number`プロパティを追加
   - 0: 東エリア, 1: 西エリア の仕様を明確化

3. **TicketTab.vueでの東西表示機能実装** ✅
   - `ts/components/TicketTab.vue:703`: `formatEntranceDateTimeWithLocation()`を修正
   - `schedule.location_index`から東西を正しく判定
   - 表示形式: "10月13日 東 9:00" のように東西情報を表示

4. **スケジュール間の罫線視認性改善** ✅
   - `.ytomo-schedule-divider`の色を`#e5e7eb` → `#d1d5db`に変更
   - マージンを微調整して罫線をより見やすく改善

### 🔧 技術実装詳細
- **データフロー**: API `gate_type` → Store処理 → Component表示
- **型安全性**: TypeScript型定義による適切な型チェック
- **表示ロジック**: 三項演算子による簡潔な東西判定
- **UI改善**: 視認性向上のためのCSS微調整

### ✅ 動作確認
- ビルド成功 (`mise run build-rsync`)
- TypeScript型チェック通過
- Windows環境への拡張機能同期完了