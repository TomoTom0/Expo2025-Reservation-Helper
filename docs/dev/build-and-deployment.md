# ビルド・デプロイメント手順

## ビルド環境

### 必要なツール
- **Node.js**: v16+ (package.jsonの依存関係)
- **npm**: パッケージ管理・スクリプト実行
- **mise**: タスクランナー（mise.toml設定）
- **TypeScript**: v5.9.2（型チェック・コンパイル）
- **Webpack**: v5.101.0（バンドル・最適化）

### 環境設定
```bash
# 依存関係インストール
npm install

# TypeScript設定確認
npx tsc --version

# mise設定確認  
mise --version
```

## ビルドプロセス

### 通常ビルド
```bash
# mise経由（推奨）
mise run build

# npm直接
npm run build
```

### 開発ビルド
```bash
# 開発モード（ソースマップ付き）
npm run build:dev

# ウォッチモード（ファイル変更時自動ビルド）
npm run build:watch
```

### Windows同期込みビルド
```bash
# ビルド + Windows環境への同期
mise run build-rsync
```

## ビルド詳細フロー

### Step 1: TypeScript静的チェック
```bash
echo '🔍 TypeScript静的チェック実行中...'
npx tsc --noEmit
```
- **tsconfig.json**設定による型チェック
- **コンパイルエラー**があればビルド停止
- **未使用変数・import**の検出

### Step 2: Webpack バンドル
```bash
echo '🔨 webpack ビルド実行中...'
npm run build
```
- **エントリーポイント**: `ts/modules/main.ts`
- **出力先**: `src/index.js`（単一ファイル）
- **最適化**: production mode（圧縮・難読化）

### Step 3: 成果物確認
- **index.js**: バンドル済みJavaScript（~343KB）
- **src/manifest.json**: Chrome拡張機能マニフェスト
- **src/**: Chrome拡張機能完全パッケージ

## デプロイメント

### Chrome拡張機能デプロイ

#### 1. リリース準備
```bash
# バージョン更新（手動）
# package.json の version
# src/manifest.json の version

# 最終ビルド実行
mise run build-rsync
```

#### 2. リリースアセット作成
```bash
# Chrome用：srcディレクトリをzip化
cd /path/to/project
zip -r src.zip src/

# Safari用：index.jsを単体コピー
cp src/index.js ./index.js

# SHA256ハッシュ計算
sha256sum src.zip
sha256sum index.js
```

#### 3. GitHub Release作成
1. **タグ作成**: `v1.0.0`形式
2. **リリースノート**: `./tmp/release_notes_v1.0.0.md`使用
3. **アセット添付**: `src.zip`、`index.js`
4. **SHA256更新**: リリースノートに実際のハッシュ値記載

### Windows環境同期（開発用）

#### rsync-src-to-win.sh
```bash
#!/bin/bash
echo "=== Chrome拡張同期スクリプト ==="
echo "同期元: $(pwd)/src/"
echo "同期先: /home/tomo/user/Mine/_chex/src_expo2025-extension/"
echo "オプション: -a --delete"

# 同期先ディレクトリ作成
mkdir -p "/home/tomo/user/Mine/_chex/src_expo2025-extension"

# rsync実行
rsync -a --delete "$(pwd)/src/" "/home/tomo/user/Mine/_chex/src_expo2025-extension/"
```

## 品質保証

### ビルド前チェック
- [ ] **TypeScript型エラー**: ゼロ
- [ ] **ESLint警告**: ゼロ
- [ ] **テスト成功率**: 100%
- [ ] **未使用import**: 削除済み

### ビルド後検証
- [ ] **バンドルサイズ**: 適切（~343KB）
- [ ] **Chrome読み込み**: エラーなし
- [ ] **基本機能**: 動作確認
- [ ] **ソースマップ**: デバッグ可能（開発時）

### リリース前最終確認
- [ ] **バージョン番号**: 統一（package.json/manifest.json）
- [ ] **リリースノート**: SHA256更新済み
- [ ] **ブラウザ互換性**: Chrome/Safari動作確認
- [ ] **権限設定**: 最小権限（storage, activeTab）

## トラブルシューティング

### ビルドエラー対処

#### TypeScriptエラー
```bash
# 詳細エラー表示
npx tsc --noEmit --pretty

# 特定ファイルのチェック
npx tsc --noEmit ts/modules/specific-file.ts
```

#### Webpack エラー
```bash
# 詳細ログ出力
npm run build -- --verbose

# 開発モードで詳細確認
npm run build:dev
```

#### 依存関係問題
```bash
# node_modules再インストール
rm -rf node_modules package-lock.json
npm install
```

### よくある問題

#### 1. 循環依存エラー
**症状**: webpack ビルド時の循環依存警告
**対処**: `module-dependencies.md`参照、import構造見直し

#### 2. 型エラー
**症状**: tsc --noEmit で型チェックエラー  
**対処**: 型定義確認、`ts/types/index.d.ts` 更新

#### 3. バンドルサイズ増大
**症状**: index.js サイズ異常増加
**対処**: 未使用import削除、webpack bundle analyzer使用

## 継続的統合（将来予定）

### GitHub Actions設定
```yaml
# .github/workflows/build.yml (将来実装)
name: Build and Test
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: mise run build
      - run: npm test
```

### 自動デプロイ
- **タグ push**: GitHub Releaseの自動作成
- **アセット自動生成**: src.zip、index.js、SHA256
- **Chrome Web Store**: 将来的な自動申請