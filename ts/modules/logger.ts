/**
 * ログ出力制御モジュール
 * ビルド環境に応じてログレベルを調整
 */

// ログレベル定義
export type LogLevel = 'error' | 'warn' | 'info' | 'debug';

// 環境変数に基づくデバッグモード判定
const isDebugMode = process.env['DEBUG_LOGS'] === 'true';

// プロダクションでは重要なログのみ表示
const productionLogLevels: LogLevel[] = ['error', 'warn'];
const developmentLogLevels: LogLevel[] = ['error', 'warn', 'info', 'debug'];

const allowedLevels = isDebugMode ? developmentLogLevels : productionLogLevels;

/**
 * 条件付きログ出力
 */
export class Logger {
    private prefix: string;

    constructor(prefix: string = '') {
        this.prefix = prefix;
    }

    private shouldLog(level: LogLevel): boolean {
        return allowedLevels.includes(level);
    }

    private formatMessage(message: string): string {
        if (this.prefix) {
            return `${this.prefix} ${message}`;
        }
        return message;
    }

    error(message: string): void {
        if (this.shouldLog('error')) {
            console.error(this.formatMessage(message));
        }
    }

    warn(message: string): void {
        if (this.shouldLog('warn')) {
            console.warn(this.formatMessage(message));
        }
    }

    info(message: string): void {
        if (this.shouldLog('info')) {
            console.log(this.formatMessage(message));
        }
    }

    debug(message: string): void {
        if (this.shouldLog('debug')) {
            console.log(this.formatMessage(message));
        }
    }

    // レガシー対応: 既存のlogメソッド（infoとして扱う）
    log(message: string): void {
        this.info(message);
    }
}

// デフォルトロガー
export const logger = new Logger();

// モジュール別ロガー作成用
export const createLogger = (prefix: string): Logger => new Logger(prefix);