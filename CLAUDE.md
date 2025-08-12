日本語で回答する。

## done

すでに大阪万博でパビリオンの当日予約、三日前予約での補助機能は実装している。
また入場予約補助機能も実装済み。統一自動処理管理システムによる効率的な予約処理を提供。

## wip

スタイル設計の大幅リファクタリング実装中。
TypeScript内の直接スタイル設定(cssText, style.property)をSCSSクラス切り替えに変更し、過剰な!important使用(247個)を削減する。

詳細設計:
- FABボタンシステム: 状態管理をstate-idle, state-enabled等のクラス切り替えに変更
- Processing Overlay: z-index制御をクラスベースに変更  
- ボタン状態管理: opacity, cursor等の直接設定をbtn-state-enabled等のクラスに統一
- !important削減: 新規要素には不要、247個→20個程度に削減
- 一貫したCSS設計パターン確立でメンテナンス性向上

## プロジェクト概要

大阪万博2025の予約支援ブラウザ拡張機能。
パビリオン検索・予約・監視・同行者管理・入場予約の自動化を提供。

## build

- buildは`mise run build-rsync`で行う。これで拡張機能のwindowsへの同期も行われる