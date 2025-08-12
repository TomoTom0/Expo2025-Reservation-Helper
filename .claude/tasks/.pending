# 保留中の作業内容

## TypeScript分割実装+1ファイルコンパイル調査 - 2025-08-02

### 背景
現在は全ての機能をindex.js 1ファイルに記述しているが、管理性向上のため以下の方針を検討:
- 機能別にTypeScriptファイルで分割実装
- 最終的に1ファイルにminify+compileして出力
- Chrome拡張として動作する形式を維持

### 調査項目

#### 1. ビルドツール候補
- **Webpack**: Chrome拡張向けの設定、TypeScript対応
- **Rollup**: 軽量、Tree Shaking、単一ファイル出力に適している
- **esbuild**: 高速、TypeScript対応、minify機能
- **Vite**: 開発体験、TypeScript、プラグインエコシステム
- **Parcel**: ゼロ配置、自動最適化

#### 2. TypeScript設定
- `tsconfig.json`設定（target, module, outDir等）
- 型定義ファイル（Chrome拡張API、DOM型）
- strictモード設定
- source map生成（デバッグ用）

#### 3. ファイル分割構造案
```
src/
├── types/
│   ├── index.ts          # 共通型定義
│   ├── chrome-ext.ts     # Chrome拡張型
│   └── dom.ts           # DOM関連型
├── utils/
│   ├── cache-manager.ts  # キャッシュ管理
│   ├── selectors.ts     # セレクタ定義
│   └── dom-utils.ts     # DOM操作ユーティリティ
├── components/
│   ├── calendar.ts      # カレンダー操作
│   ├── time-slots.ts    # 時間帯監視
│   ├── fab-ui.ts        # FABボタンUI
│   └── status-badge.ts  # ステータス表示
├── managers/
│   ├── multi-target.ts  # 複数監視対象管理
│   ├── countdown.ts     # カウントダウン管理
│   └── state.ts         # 状態管理
├── services/
│   ├── monitoring.ts    # 監視サービス
│   ├── reservation.ts   # 予約処理
│   └── auto-reload.ts   # 自動リロード
└── index.ts             # エントリーポイント
```

#### 4. ビルド設定調査
- **入力**: 複数TypeScriptファイル
- **出力**: 単一minified JavaScript
- **要件**:
  - Chrome拡張Content Script形式
  - 外部依存なし（self-contained）
  - minify + uglify
  - TypeScript型チェック
  - 開発時のwatch mode

#### 5. パッケージマネージャー
- npm vs yarn vs pnpm
- 開発依存関係の管理
- scriptsの設定（build, dev, watch）

#### 6. Chrome拡張特有の考慮事項
- Content Security Policy (CSP) 対応
- manifest.json との整合性
- インジェクション方式の維持
- hot reload / 開発体験

#### 7. 具体的な実装パターン
```typescript
// types/index.ts
export interface MonitoringTarget {
  timeText: string;
  tdSelector: string;
  positionInfo: PositionInfo;
  status: string;
}

// managers/multi-target.ts
import { MonitoringTarget } from '../types';

export class MultiTargetManager {
  private targets: MonitoringTarget[] = [];
  
  addTarget(target: MonitoringTarget): boolean {
    // 実装
  }
}

// index.ts
import { MultiTargetManager } from './managers/multi-target';
import { CalendarManager } from './components/calendar';
// ...

// 既存の関数型実装をクラス化または名前空間化
```

#### 8. 移行戦略
- Phase 1: ビルド環境構築
- Phase 2: 型定義の整備
- Phase 3: 段階的な機能分割（カレンダー→監視→UI→...）
- Phase 4: テストの整備
- Phase 5: 既存index.jsとの並行運用

#### 9. メリット・デメリット
**メリット**:
- コードの可読性・保守性向上
- TypeScriptによる型安全性
- 機能別のテスト容易性
- 開発者体験の向上
- 再利用性の向上

**デメリット**:
- ビルド設定の複雑化
- 開発フローの変更
- デバッグの複雑化
- ビルド時間の増加

#### 10. 推奨調査手順
1. esbuild + TypeScript の簡単なPoC実装
2. 既存の一部機能（カレンダー管理）を分割してテスト
3. ビルド設定の最適化
4. 開発ワークフローの確立
5. 全体移行の判断

### 注意事項
- 既存の動作に影響を与えないよう注意
- 段階的な移行で安全性を確保
- ビルド産物のサイズ増加に注意
- Chrome拡張の制限事項を考慮

---

## 監視ボタン押下からカウントダウン開始までの遅延問題 - 2025-08-09

### 問題の詳細
- **症状**: 監視ボタンを押下してからカウントダウンが開始するまで約1秒の遅延がある
- **期待動作**: ボタン押下後即座にカウントダウンが開始される

### 原因分析
監視開始フローに不要な遅延が含まれている：

1. **監視ボタン押下** → `startSlotMonitoring()`呼び出し
2. **500ms待機** → `setTimeout(..., 500)` 
3. **監視チェック処理** → `checkSlotAvailabilityAndReload()`
4. **バリデーション** → 複数のチェック処理
5. **カウントダウン開始** → `scheduleReload()`呼び出し

### 修正案
**現在のシーケンシャル処理:**
```
ボタン押下 → 500ms待機 → 処理実行 → カウントダウン開始
```

**改善後の並行処理:**
```
ボタン押下 → 即座にカウントダウン開始 + 並行して監視処理実行
```

### 具体的な実装変更
1. `startSlotMonitoring()`で即座に`scheduleReload()`を呼び出し
2. カウントダウン開始後に並行して監視チェック処理を実行
3. 500ms遅延を削除または大幅短縮（50-100ms程度）

### 影響範囲
- `entrance-page-monitor.ts`の`startSlotMonitoring()`関数
- カウントダウンUI更新タイミング
- 監視処理の実行順序

### 優先度
中（ユーザー体験の改善）

---

## 自動テストシステムの検討と実装 - 2025-08-12

### 背景
現在のプロジェクトは手動テストに依存しており、以下の課題がある：
- コード変更時の回帰テストが困難
- 複雑な機能（監視→予約移行、効率モード等）の動作保証が不十分
- ブラウザ間・デバイス間の互換性検証が困難
- リファクタリング時の安全性確保が困難

### 必要な自動テストの種類

#### 1. Unit Test（単体テスト）
- **対象**: 各関数・クラス・モジュールの個別機能
- **ツール候補**: Jest, Vitest, Mocha + Chai
- **優先対象**:
  - DOM操作ユーティリティ関数
  - 状態管理ロジック
  - セレクタ生成・要素検出機能
  - キャッシュ管理機能
  - 時刻計算・カウントダウン機能

#### 2. Integration Test（統合テスト）
- **対象**: モジュール間の連携動作
- **重要フロー**:
  - 入場予約: 監視対象設定→監視実行→状態変化検出→予約実行
  - 同行者追加: チケット選択→画面遷移→チケットID入力→追加実行
  - 効率モード: 時刻計算→待機→タイミング調整→クリック実行
  - キャッシュ復元: 保存→リロード→復元→状態継続

#### 3. E2E Test（エンドツーエンドテスト）
- **対象**: 実際のブラウザでの完全な動作フロー
- **ツール候補**: Playwright, Puppeteer, Cypress
- **テストシナリオ**:
  - パビリオン検索→入場予約画面→予約実行
  - 満員時間帯監視→空き検出→自動予約
  - 同行者チケット管理→複数追加→完了確認
  - エラー発生時の適切な回復動作

#### 4. Cross-Browser Test（ブラウザ互換性テスト）
- **対象ブラウザ**: Chrome, Firefox, Safari, Edge
- **対象デバイス**: Desktop, Mobile (iPhone Safari, Android Chrome)
- **重点項目**:
  - iPhone Safariでの同行者ボタン押下問題
  - React入力フィールドの値認識
  - CSS/SCSS表示の一貫性
  - JavaScript実行環境の違い

### 実装アプローチ

#### Phase 1: Unit Test基盤構築
- テスト環境セットアップ（Jest/Vitest）
- TypeScript設定の統合
- モックオブジェクトの準備（DOM, localStorage等）
- 主要関数の基本テスト実装

#### Phase 2: Integration Test実装
- テストデータ・シナリオの設計
- DOM操作テストの自動化
- 状態遷移テストの実装
- キャッシュ・永続化テストの実装

#### Phase 3: E2E Test環境構築
- Playwright/Puppeteerの導入検討
- テスト用万博サイト環境の準備（必要に応じて）
- CI/CD統合の検討（GitHub Actions等）
- テスト実行自動化の設定

#### Phase 4: 継続的品質保証
- Pre-commit hookでの自動テスト実行
- Pull Request時の自動テスト実行
- 定期的な回帰テスト実行
- テストカバレッジ監視

### 技術的考慮事項

#### Chrome拡張機能特有の課題
- Content Script環境でのテスト実行
- DOM注入タイミングの制御
- 拡張機能APIのモック化
- セキュリティ制限下でのテスト実行

#### 万博サイト依存の課題
- 外部サイトDOM構造の変更リスク
- ネットワーク接続に依存するテスト
- サイト負荷を避けたテスト設計
- テスト用データ・環境の準備

### 優先度・実装順序

#### 高優先度（即座実装）
- Unit Test: DOM操作・状態管理の基本機能
- 現在の手動テストの自動化

#### 中優先度（近日実装）
- Integration Test: 主要フローの動作保証
- ブラウザ互換性テストの部分実装

#### 低優先度（将来実装）
- 完全なE2Eテスト環境
- CI/CD統合・自動化

### 期待効果

#### 開発効率向上
- リファクタリング時の安全性確保
- 機能追加時の回帰バグ防止
- コード品質の継続的な向上

#### 信頼性向上
- ユーザー環境での動作保証
- エッジケース・エラーケースの事前発見
- 長期運用時の安定性確保

### 実装コスト見積もり
- **Phase 1**: 2-3日（Unit Test基盤）
- **Phase 2**: 3-5日（Integration Test）
- **Phase 3**: 5-7日（E2E Test環境）
- **Phase 4**: 2-3日（CI/CD統合）

**総計**: 12-18日程度の実装期間を想定

### 注意事項
- 万博サイトの利用規約・負荷配慮
- テスト実行時のサイトへの影響最小化
- 実際のユーザーデータ・操作への影響回避
- テスト環境の適切な分離