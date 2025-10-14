日本語で回答する。

## プロジェクト概要

大阪万博2025の予約支援ブラウザ拡張機能。
パビリオン検索・予約・監視・同行者管理・入場予約の自動化を提供。

妄想に基づく実装は絶対にするな。
事前に使用を調査し、その結果をドキュメントに記載して、根拠として実装する。

## build

- buildは`mise run build-rsync`で行う。これで拡張機能のwindowsへの同期も行われる

- styleはscssとクラス名やタグ名およびそれらを用いた階層構造で指定する

## log

log出力はcustomのlogger.infoなどを用いる。
debug, info, warn, error, tempの5段階がある。
デフォルトのlogレベルはwarnであり、buildの際にLOG_LEVEL=INFOなどで指定できる。
一時的にlogを出力したい場合はtempを用いる。
確認できたの値は削除するなり適切なログレベルに変更するなりする。

console.logなどは用いない。
