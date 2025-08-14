# 時間帯選択・監視機能の設計提案

## 概要
入場予約における時間帯選択と満員時の監視機能を追加する。

## アーキテクチャ設計

### 1. 状態管理
```js
const timeSlotState = {
    mode: 'idle',  // idle, selecting, monitoring, trying
    targetSlot: null,  // 選択対象の時間帯情報
    monitoringInterval: null,  // 監視用インターバル
    isMonitoring: false,
    retryCount: 0,
    maxRetries: 100,
    reloadInterval: 30000  // 30秒間隔
};
```

### 2. 時間帯情報の構造
```js
const timeSlotInfo = {
    element: HTMLElement,  // td要素
    timeText: string,      // "9:00-", "11:00-"
    status: string,        // 'available', 'full', 'selected'
    iconType: string,      // 'low', 'high', 'ng'
    selector: string       // 要素特定用セレクタ
};
```

### 3. セレクタ定義
```js
const timeSlotSelectors = {
    // 時間帯選択エリア
    timeSlotContainer: "table",  // 時間帯テーブル
    timeSlotCells: "td[data-gray-out] div[role='button']",
    
    // 状態判定
    availableSlots: "td[data-gray-out] div[role='button']:not([data-disabled='true'])",
    fullSlots: "td[data-gray-out] div[role='button'][data-disabled='true']",
    selectedSlot: "td[data-gray-out] div[role='button'].style_active__JTpSq",
    
    // アイコン判定
    lowIcon: "img[src*='ico_scale_low.svg']",
    highIcon: "img[src*='ico_scale_high.svg']", 
    fullIcon: "img[src*='calendar_ng.svg']"
};
```

## 機能別実装設計

### 1. 時間帯検出・ボタン追加機能
```js
function analyzeTimeSlots() {
    // 全時間帯を取得して状態分析
    // 利用可能・満員・選択中を分類
    return {
        available: [], // 利用可能な時間帯
        full: [],      // 満員の時間帯
        selected: []   // 現在選択中
    };
}

function addMonitorButtonsToFullSlots() {
    // 満員時間帯のtd要素に監視ボタンを追加
    // 既存の時間帯ボタンの下に配置
    // クリックイベントリスナー設定
}

function createMonitorButton(timeText, tdElement) {
    // 個別監視ボタンの作成
    // 時間帯情報をdata属性に設定
    // 適切なスタイリング適用
}
```

### 2. キャッシュ機能
```js
const cacheManager = {
    save(key, data) {
        // localStorage に保存
        // セッション管理用のタイムスタンプ付与
    },
    
    load(key) {
        // キャッシュデータの復元
        // 有効期限チェック
    },
    
    clear(key) {
        // キャッシュクリア
    }
};
```

### 3. 監視機能
```js
async function startSlotMonitoring(targetSlot) {
    // ページ再読み込み監視開始
    // 定期的な可用性チェック
    // 利用可能になったら自動選択
}

function checkSlotAvailability(targetSlot) {
    // 指定時間帯の現在状態確認
    // DOM要素の変化検出
}
```

### 4. 統合UI設計

#### A. 満員時間帯への直接ボタン追加
```html
<!-- 各満員td要素に追加されるボタン -->
<td data-gray-out="">
    <div role="button" class="style_main__button__Z4RWX" data-disabled="true">
        <dl><dt><span>9:00-</span></dt><dd><img src="/asset/img/calendar_ng.svg" alt="満員です"></dd></dl>
    </div>
    <!-- ↓ 追加ボタン -->
    <button class="ext-ytomo monitor-btn" data-target-time="9:00-">
        <span class="ext-ytomo">📡監視</span>
    </button>
</td>
```

#### B. メイン制御UI
```html
<!-- 既存の制御エリアに追加 -->
<div id="entrance-reservation-controls">
    <!-- 既存の繰り返しtryボタン -->
    <button class="basic-btn type2 no-after ext-ytomo" id="main-try-btn">
        <span class="ext-ytomo">繰り返し予約try</span>
    </button>
    
    <!-- 監視状態表示 -->
    <div class="monitoring-status" style="display:none;">
        <span id="monitoring-target">監視中: 9:00-</span>
        <span id="reload-count">再読み込み: 5回</span>
    </div>
</div>
```

## 処理フロー設計

### Phase 1: 初期化と分析
```
1. ページ読み込み検出
2. 時間帯テーブル存在確認
3. 全時間帯の状態分析
4. UI要素の挿入
5. キャッシュデータの復元（あれば）
```

### Phase 2: ユーザー操作
```
A. 即座実行パス:
   1. 利用可能時間帯を直接クリック選択
   2. メイン「繰り返し予約try」ボタンで開始
   3. 通常の繰り返しtry実行

B. 監視パス:
   1. 満員時間帯の「📡監視」ボタンをクリック
   2. 対象時間帯情報をキャッシュ保存
   3. メインボタンが「繰り返し読み込みand try」に変更
   4. 監視モードに移行
```

### Phase 3: 監視・自動処理
```
1. 定期的なページ再読み込み (30秒間隔)
2. 対象時間帯の可用性チェック
3. 利用可能になったら自動選択
4. 通常の繰り返しtry自動開始
5. 最大試行回数での自動停止
```

## 技術的考慮事項

### 1. セレクタの堅牢性
- 複数の判定方法を組み合わせ
- フォールバック機能
- 定期的な検証

### 2. パフォーマンス対策
- 効率的なDOM監視
- 不要な処理の最小化
- メモリリークの防止

### 3. BAN対策の強化
- 再読み込み間隔のランダム化
- アクセス頻度の制限
- 人間らしいタイミング調整

### 4. エラーハンドリング
- ネットワークエラー対応
- DOM構造変化への対応
- 無限ループの防止

## 段階的実装計画

### Step 1: 基盤機能
- [ ] 時間帯検出ロジック
- [ ] キャッシュ機能
- [ ] 基本UI作成

### Step 2: 監視機能
- [ ] ページ再読み込み機能
- [ ] 可用性チェック
- [ ] 自動選択機能

### Step 3: 統合・最適化
- [ ] 既存機能との統合
- [ ] エラーハンドリング強化
- [ ] パフォーマンス最適化

### Step 4: テスト・検証
- [ ] オフラインテスト追加
- [ ] 実環境テスト
- [ ] 最終調整

## UI/UX設計

### ボタン状態の変化
```
通常時: "繰り返し予約try"
監視設定後: "繰り返し読み込みand try"
監視実行中: "監視中 (対象: 9:00-) 停止"
利用可能検出後: "見つかりました！予約try中..."
```

### 監視ボタンの表示制御
```
満員時間帯: "📡監視" (小さなボタン)
監視対象設定後: "✅選択中" (状態表示)
他の満員時間帯: "📡監視" (複数選択不可で無効化)
```

### 状態表示
- 現在のモード表示
- 監視対象時間帯
- 試行回数カウンタ
- 最終実行時刻

この設計で実装を進めますか？特に修正や追加したい点はありますか？