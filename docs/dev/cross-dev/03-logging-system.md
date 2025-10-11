# ログシステム

## 1. カスタムLogger実装

`console.log`は使用せず、**カスタムLoggerシステム**を採用。

### 1.1 ログレベル（優先度順）

| レベル | 優先度 | 用途 | ビルド時出力 |
|--------|--------|------|-------------|
| `TEMP` | -1 | 一時的なデバッグ | 常に出力 |
| `ERROR` | 0 | エラー | `LOG_LEVEL=WARN`以下で出力 |
| `WARN` | 1 | 警告 | `LOG_LEVEL=WARN`以下で出力（デフォルト） |
| `INFO` | 2 | 情報 | `LOG_LEVEL=INFO`以下で出力 |
| `DEBUG` | 3 | デバッグ詳細 | `LOG_LEVEL=DEBUG`で出力 |

### 1.2 ビルド時ログレベル制御

```typescript
// ts/utils/logger.ts
const BUILD_LOG_LEVEL: LogLevel = (process.env['LOG_LEVEL'] as LogLevel) || 'WARN'

const LOG_PRIORITIES: Record<LogLevel, number> = {
  TEMP: -1,  // ERRORより上位（常に出力）
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

private shouldLog(level: LogLevel): boolean {
  if (!globalEnabled || !this.config.enabled) {
    return false
  }

  const buildLevelPriority = LOG_PRIORITIES[BUILD_LOG_LEVEL]
  const messagePriority = LOG_PRIORITIES[level]

  // messagePriority <= buildLevelPriority で、より重要なログのみ通す
  return messagePriority <= buildLevelPriority
}
```

**仕組み**:
- ビルド時に`process.env.LOG_LEVEL`を環境変数から取得
- 実行時に各ログの優先度をチェックし、ビルド時設定以上のみ出力
- デフォルトは`WARN`（本番環境想定）

### 1.3 webpack DefinePluginでの環境変数注入

```javascript
// webpack.config.js
new webpack.DefinePlugin({
  'process.env.LOG_LEVEL': JSON.stringify(process.env.LOG_LEVEL || 'WARN')
})
```

### 1.4 ビルドコマンド例

```bash
# デフォルト（WARN以上のみ出力）
mise run build-rsync

# INFO以上を出力
LOG_LEVEL=INFO mise run build-rsync

# DEBUG含め全て出力
LOG_LEVEL=DEBUG mise run build-rsync
```

### 1.5 事前定義Loggerインスタンス

```typescript
// ts/utils/logger.ts
export const loggers = {
  tickets: createLogger('TICKETS'),
  pavilions: createLogger('PAVILIONS'),
  entranceReservation: createLogger('ENTRANCE'),
  automation: createLogger('AUTOMATION'),
  monitoring: createLogger('MONITORING'),
  ui: createLogger('UI')
} as const
```

### 1.6 使用例

```typescript
import { loggers } from '@/utils/logger';
const logger = loggers.ui;

// 本番環境（LOG_LEVEL=WARN）では出力されない
logger.info('グローバル失敗通知を表示しました');
logger.debug('詳細なデバッグ情報', { data: someData });

// 本番環境でも出力される
logger.warn('認証エラー検知');
logger.error('API呼び出しエラー', error);

// 常に出力される（確認後は削除または適切なレベルに変更）
logger.temp('一時的な確認用ログ', someValue);
```

## 2. ログ運用方針

| 用途 | ログレベル | 扱い |
|------|-----------|------|
| 本番環境出力 | `ERROR`, `WARN` | リリース時に残す |
| 開発時情報 | `INFO` | 必要に応じてビルド時指定 |
| 詳細デバッグ | `DEBUG` | 開発時のみ |
| 一時確認 | `TEMP` | **確認後は削除または適切なレベルに変更** |

### 2.1 ログフォーマット

```
[HH:MM:SS] [LEVEL] [MODULE:functionName] メッセージ
```

例:
```
[14:32:15] [INFO] [UI:checkGlobalReservationResult] グローバル失敗通知を表示しました
[14:32:20] [ERROR] [ENTRANCE:handleAuthError] API呼び出しエラー
```

### 2.2 呼び出し元関数名の自動取得

```typescript
private getCallerFunction(): string {
  try {
    const stack = new Error().stack
    if (!stack) return ''

    const lines = stack.split('\n')
    const callerLine = lines[5] // スタックトレースから取得

    if (callerLine) {
      const match = callerLine.match(/at (?:Object\.)?([^.\s(]+)/)
      if (match && match[1]) {
        return match[1]
      }
    }
  } catch (error) {
    // 失敗時は空文字
  }
  return ''
}
```

## 3. パフォーマンス測定

```typescript
logger.time('heavy-operation')
// 重い処理
logger.timeEnd('heavy-operation')
// 出力: [INFO] [MODULE] ⏱️ 計測完了: heavy-operation = 123.45ms
```

## 4. 条件付きログ

```typescript
logger.conditionalLog('INFO', isDebugMode, 'デバッグモード有効', { data })
// isDebugMode === true の場合のみ出力
```

---

**次のセクション**: [04-styling-responsive.md](./04-styling-responsive.md) - スタイリングとレスポンシブデザイン
