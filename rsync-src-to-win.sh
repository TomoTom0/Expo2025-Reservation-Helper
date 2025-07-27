#!/bin/bash

# Chrome拡張としてWindows側にsrcフォルダを同期するスクリプト

set -e

# デフォルト設定
DRY_RUN=false
VERBOSE=false
DEST_BASE="$HOME/user/Mine/_chex"
SRC_DIR="src"
DEST_NAME="src_expo2025-extension"

# ヘルプ表示
show_help() {
    cat << EOF
Usage: $0 [OPTIONS]

Chrome拡張のsrcフォルダをWindows側に同期します

OPTIONS:
    -n, --dry-run       ドライラン（実際には同期しない）
    -v, --verbose       詳細出力
    -d, --dest DIR      同期先ベースディレクトリ (default: $DEST_BASE)
    -s, --src DIR       同期元ディレクトリ (default: $SRC_DIR)
    --dest-name NAME    同期先フォルダ名 (default: $DEST_NAME)
    -h, --help          このヘルプを表示

EXAMPLES:
    $0 -n               # ドライラン
    $0 -v               # 詳細出力で実行
    $0 -n -v            # ドライラン + 詳細出力
    $0 -d ~/test        # 同期先を変更

EOF
}

# 引数解析
while [[ $# -gt 0 ]]; do
    case $1 in
        -n|--dry-run)
            DRY_RUN=true
            shift
            ;;
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -d|--dest)
            DEST_BASE="$2"
            shift 2
            ;;
        -s|--src)
            SRC_DIR="$2"
            shift 2
            ;;
        --dest-name)
            DEST_NAME="$2"
            shift 2
            ;;
        -h|--help)
            show_help
            exit 0
            ;;
        *)
            echo "未知のオプション: $1" >&2
            show_help
            exit 1
            ;;
    esac
done

# パス設定
DEST_PATH="${DEST_BASE}/${DEST_NAME}"

# rsyncオプション構築
RSYNC_OPTS="-a"
if [[ "$VERBOSE" == "true" ]]; then
    RSYNC_OPTS="${RSYNC_OPTS}v"
fi
if [[ "$DRY_RUN" == "true" ]]; then
    RSYNC_OPTS="${RSYNC_OPTS} --dry-run"
fi
RSYNC_OPTS="${RSYNC_OPTS} --delete"

# 実行前の情報表示
echo "=== Chrome拡張同期スクリプト ==="
echo "同期元: $(pwd)/${SRC_DIR}/"
echo "同期先: ${DEST_PATH}/"
echo "オプション: ${RSYNC_OPTS}"
if [[ "$DRY_RUN" == "true" ]]; then
    echo "⚠️  ドライランモード（実際には同期しません）"
fi
echo ""

# 同期元の存在確認
if [[ ! -d "$SRC_DIR" ]]; then
    echo "❌ エラー: 同期元ディレクトリが見つかりません: $SRC_DIR" >&2
    exit 1
fi

# 同期先ディレクトリ作成
if [[ "$DRY_RUN" != "true" ]]; then
    mkdir -p "$DEST_PATH"
    echo "📁 同期先ディレクトリを作成: $DEST_PATH"
fi

# rsync実行
echo "🔄 rsync実行中..."
rsync $RSYNC_OPTS "${SRC_DIR}/" "${DEST_PATH}/"

# 結果表示
if [[ "$DRY_RUN" == "true" ]]; then
    echo ""
    echo "✅ ドライラン完了"
    echo "💡 実際に同期するには -n オプションを外してください"
else
    echo ""
    echo "✅ Chrome拡張ファイルを同期しました"
    echo "📂 同期先: ${DEST_PATH}"
    echo "🔧 Chromeの拡張機能管理で上記フォルダを読み込んでください"
fi