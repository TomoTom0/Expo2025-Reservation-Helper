# インストール・配布方法

## 1. iOS Safari向けインストール（Stayアプリ利用）

iOSでは、拡張機能を直接インストールできないため、**Stayアプリ**を使用してUserScriptとして読み込みます。

### 1.1 なぜStayアプリを使うのか

| 理由 | 説明 |
|------|------|
| **App Store審査不要** | 独自のiOSアプリを作成せずに配布可能 |
| **UserScript形式** | 本プロジェクトの単一ファイル形式と完全互換 |
| **更新が容易** | GitHubのRaw URLを指定すれば自動更新可能 |
| **無料** | Stayアプリ自体は無料で利用可能 |

### 1.2 インストール手順（ユーザー向け）

#### ステップ1: Stayアプリをインストール

1. App Storeから[Stay](https://apps.apple.com/jp/app/stay-for-safari/id1591620171)をインストール

#### ステップ2: GitHubから拡張機能URLを取得

2. Safariで以下のリンクを開く:
   ```
   https://github.com/TomoTom0/Expo2025-Reservation-Helper/blob/main/src/index.js
   ```

3. ファイル内容直上右上の**三点メニュー**をタップ → 「**View**」を選択

4. 遷移先のURL（Raw URL）をコピー:
   ```
   https://raw.githubusercontent.com/TomoTom0/Expo2025-Reservation-Helper/main/src/index.js
   ```

#### ステップ3: Stayアプリにリンクを追加

5. Stayアプリを開く → 右上の「**+**」ボタン → 「**Link**」を選択

6. 「ペーストを許可」→ 「Continue」をタップでURLを貼り付け
   - ペースト許可が出ない場合、手動で貼り付け

7. 右上の「**作成**」をタップして戻る

#### ステップ4: Safari拡張機能として有効化

8. Safariを開く → アドレスバー左側をタップ → 「**拡張機能を管理**」

9. 「**Stay**」をオンにする

#### ステップ5: 動作確認

10. 大阪万博予約サイト（`https://ticket.expo2025.or.jp/`）にアクセス

11. 拡張機能のボタンが表示されることを確認

### 1.3 アップデート手順（ユーザー向け）

- **手順2〜4を再度実行**（既存の機能を削除せずに更新される）
- GitHubのRaw URLを再度Stayに追加すると、最新版が取得される

---

## 2. PC Chrome向けインストール

### 2.1 インストール手順（ユーザー向け）

#### ステップ1: リリースパッケージをダウンロード

1. [GitHub Releases](https://github.com/TomoTom0/Expo2025-Reservation-Helper/releases)から最新の`src.zip`をダウンロード

2. ダウンロードしたファイルを展開

#### ステップ2: Chrome拡張機能管理画面を開く

3. Chromeを開き、以下のいずれかの方法で拡張機能管理画面を開く:
   - アドレスバーに`chrome://extensions/`と入力してEnter
   - Chrome右上メニュー → 拡張機能 → 拡張機能を管理

#### ステップ3: デベロッパーモードを有効化

4. 右上の「**デベロッパーモード**」トグルをオン

#### ステップ4: 拡張機能を読み込む

5. 「**パッケージ化されていない拡張機能を読み込む**」をクリック

6. 展開した`src`フォルダを選択

#### ステップ5: 動作確認

7. 大阪万博予約サイト（`https://ticket.expo2025.or.jp/`）にアクセスして動作確認

### 2.2 アップデート手順（ユーザー向け）

1. 最新の`src.zip`をダウンロードして展開し、**既存のファイルを上書き**

2. Chrome拡張機能管理画面で「Expo2025予約補助」の**更新アイコン（回転矢印）**をクリック

3. 開いている万博サイトのページを**リロード**

---

## 3. 配布パッケージの作成（開発者向け）

### 3.1 ビルドとパッケージング

```bash
# 1. ビルド実行
mise run build-rsync

# 2. srcフォルダをzip圧縮
cd /home/tomo/work/app/Expo2025-Reservation-Helper
zip -r src.zip src/

# 3. GitHubリリースにアップロード
gh release create v1.3.0 src.zip \
  --title "v1.3.0" \
  --notes "## 更新内容
- 機能A追加
- バグB修正
- パフォーマンス改善

## インストール方法
### iOS Safari
README.mdの手順参照

### PC Chrome
src.zipをダウンロードして展開し、chrome://extensions/ から読み込み"
```

### 3.2 バージョン管理

```bash
# 1. version.datを更新
echo "1.3.0" > version.dat

# 2. package.jsonも同期
# 手動で package.json の "version": "1.3.0" を更新

# 3. manifest.jsonも同期
# 手動で src/manifest.json の "version": "1.3.0" を更新
```

### 3.3 リリースチェックリスト

- [ ] `version.dat`更新
- [ ] `package.json`のバージョン更新
- [ ] `src/manifest.json`のバージョン更新
- [ ] ビルド実行（`mise run build-rsync`）
- [ ] iOS Safariで動作確認
- [ ] PC Chromeで動作確認
- [ ] `src.zip`作成
- [ ] GitHubリリース作成
- [ ] README.mdの更新（必要に応じて）

---

## 4. 配布時の注意点

### 4.1 iOS Safari（Stayアプリ）

**利点**:
- App Store審査不要
- 更新が容易（URLを再度追加するだけ）
- ユーザーはアプリストアから簡単にStayを入手可能

**欠点**:
- Stayアプリへの依存
- 一般ユーザーには手順がやや複雑
- Stayアプリの仕様変更リスク

### 4.2 PC Chrome

**利点**:
- 標準的な拡張機能形式
- デベロッパーモードで簡単にインストール可能

**欠点**:
- Chrome Web Storeに公開していないため、デベロッパーモード必須
- 更新は手動（自動更新なし）

### 4.3 Chrome Web Store公開について

本プロジェクトは**Chrome Web Storeに公開していません**。

**理由**:
- 審査プロセスが煩雑
- 大阪万博公式サイトの規約上、非公式ツールの公開が問題になる可能性
- デベロッパーモード配布で十分

**代替案**:
- GitHubリリースでの配布を継続
- README.mdでインストール手順を詳細に記載

---

**次のセクション**: [08-development-workflow.md](./08-development-workflow.md) - 開発ワークフロー
