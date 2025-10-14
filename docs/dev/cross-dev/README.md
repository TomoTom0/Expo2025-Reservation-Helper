# iOS/PC共通Chrome拡張機能 開発ガイド

## 概要

本ドキュメントは、**iPhoneとPC（Windows）で共通動作するChrome拡張機能（Safari拡張機能互換）**を開発するための包括的なガイドです。実際のプロジェクト（Expo2025予約補助拡張機能）で実践されている設計方針、実装パターン、環境構築手順を体系化しています。

**対象読者**:
- iOS SafariとPC Chromeで動作する拡張機能を開発したいエンジニア
- Content Script形式の拡張機能を設計・実装する開発者
- クロスプラットフォームな状態管理・UI実装のベストプラクティスを知りたい方

**本ドキュメントの特徴**:
- ソースコードを見なくても理解できる独立したガイド
- 実装時の「なぜそうするのか」の根拠を明確化
- iOS Safari特有の制約と対応方法を網羅
- 実際のコード例と設定を多数掲載

---

## ドキュメント構成

### 基礎編

1. **[プラットフォーム対応状況](./01-platform-support.md)**
   - サポートブラウザ、Manifest V3対応状況、iOS Safari特有の制約

2. **[プロジェクト構成の特徴](./02-project-architecture.md)**
   - UserScript形式での統合、Chrome Storage API不使用設計、モジュール構成

3. **[ログシステム](./03-logging-system.md)**
   - カスタムLogger実装、ビルド時ログレベル制御、運用方針

4. **[スタイリングとレスポンシブデザイン](./04-styling-responsive.md)**
   - SCSS採用理由、メディアクエリ戦略、アクセシビリティ対応

### 実装編

5. **[iOS特有の実装：タッチ操作対応](./05-ios-touch-handling.md)**
   - タッチ操作が必要な理由、`@touchend.prevent`パターン、動的要素への対応

6. **[fetch/API操作と認証管理](./06-api-authentication.md)**
   - CORS対応、`authenticatedFetch`実装、認証エラー処理、API利用モード

### 運用編

7. **[インストール・配布方法](./07-installation.md)**
   - iOS Safari（Stayアプリ）、PC Chrome、配布パッケージ作成

8. **[ベストプラクティス](./08-best-practices.md)**
   - 避けるべき実装、推奨実装、コーディング規約、テスト方針

---

## クイックスタート

### 新規プロジェクトを始める場合

1. [プラットフォーム対応状況](./01-platform-support.md)を読んで、iOS/PC共通開発の基本を理解
2. [プロジェクト構成の特徴](./02-project-architecture.md)で、UserScript形式とPinia+localStorageの設計を確認
3. [ログシステム](./03-logging-system.md)と[スタイリング](./04-styling-responsive.md)で開発環境を構築

### 既存プロジェクトに実装を追加する場合

- **タッチ操作を追加したい**: [iOS特有の実装：タッチ操作対応](./05-ios-touch-handling.md)
- **API連携を実装したい**: [fetch/API操作と認証管理](./06-api-authentication.md)
- **配布方法を知りたい**: [インストール・配布方法](./07-installation.md)
- **コーディング規約を確認したい**: [ベストプラクティス](./08-best-practices.md)

---

## まとめ

本プロジェクトの**iOS/PC共通開発の核心**:

1. **UserScript形式統合** → 単一ファイル配布、iOS/PC互換性
2. **Chrome Storage API不使用** → Pinia + localStorage（同期的、確実）
3. **カスタムLoggerシステム** → ビルド時ログレベル制御
4. **タッチ操作対応** → `@touchend.prevent`でiOS最適化
5. **レスポンシブデザイン** → メディアクエリ3段階（400px/600px/768px）
6. **authenticatedFetch** → 統一API呼び出し、認証管理
7. **TypeScript + Vue.js** → 型安全性、UI再利用性
8. **webpack単一バンドル** → chunk分割なし、minimize無効（可読性維持）

この方針により、**iPhoneとPCで同一コードベースから動作する拡張機能**を実現しています。

---

**更新日**: 2025-10-06  
**プロジェクトバージョン**: 1.3.0
