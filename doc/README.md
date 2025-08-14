# doc/ ディレクトリ

v1.0.0対応の技術文書・設計文書・参考情報を整理しています。

## 📁 ディレクトリ構成

### `dev/` - 開発者向け技術文書
- **`v1.0.0-architecture.md`** - システム全体のアーキテクチャ
- **`v1.0.0-status.md`** - 機能実装状況・品質指標
- **`module-dependencies.md`** - モジュール依存関係マップ
- **`build-rsync-workflow.md`** - ビルド・デプロイ手順
- **`css-management-refactoring.md`** - CSS管理戦略
- **`specification-corrections.md`** - 仕様修正記録

### `design/` - 設計文書
- **`acompany_ticket.md`** - 同行者機能設計
- **`additional-req-visiting.md`** - 追加要求仕様
- **`visiting-reservation.md`** - 入場予約設計
- **`_archive/`** - 古い設計文書保存

### `info/` - 一次情報・参考資料
- **`calendar-html-structure.md`** - DOM構造分析

### `usage/` - 利用者向け文書（将来予定）
- 詳細な使用方法・トラブルシューティング等

## 📄 ルート文書

### テスト関連
- **`test-plan-comprehensive.md`** - 包括的テスト計画
- **`integration-test-design.md`** - 統合テスト設計

## 🎯 v1.0.0での整理内容

### ✅ 実施済み
- 削除済み機能（時間帯監視）関連文書の整理
- 古いパス構造（src-modules/ → ts/modules/）の更新
- v1.0.0対応技術文書の新規作成
- 一次情報と整理済み情報の分離

### 🗑️ 移動・削除済み
- `implementation-status.md` → `./tmp/`（全面書き直し）
- `phase4-implementation-plan.md` → `./tmp/`（完了済み計画）
- `unit-test-analysis.md` → `./tmp/`（古い構造前提）
- `time-slot-monitoring-design.md` → `design/_archive/`

## 📋 文書作成・更新の方針

### 技術文書（dev/）
- ソースコードの詳細理解に基づく記述
- アーキテクチャ・依存関係の明確化
- 実装品質・テスト状況の客観的記録

### 設計文書（design/）
- 機能要求・仕様の設計思想
- 古い設計は `_archive/` で歴史保存
- 現行有効設計の維持

### 一次情報（info/）
- DOM構造・API仕様等の生データ
- 技術調査結果・分析データ
- 将来参照価値の高い情報

## 🔄 継続的改善

文書は実装の変更に合わせて継続的に更新し、v1.0.0以降も最新状態を維持します。