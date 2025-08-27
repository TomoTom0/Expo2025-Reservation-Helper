/**
 * カスタムLogger - 統一されたログ管理システム
 * 
 * ログレベル制御:
 * - BUILD_LOG_LEVEL = 'WARN' の場合、WARN と ERROR のみが出力される
 * - INFO や DEBUG は BUILD_LOG_LEVEL が INFO 以下に設定された場合のみ出力
 * - 優先度: ERROR(0) > WARN(1) > INFO(2) > DEBUG(3)
 */

export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

interface LoggerConfig {
  level: LogLevel
  module: string
  enabled: boolean
}

// ログレベルの優先度定義
const LOG_PRIORITIES: Record<LogLevel, number> = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
}

// ビルド時のログレベル設定（デフォルト: WARN）
// WARN以上（WARN, ERROR）のみが出力される
const BUILD_LOG_LEVEL: LogLevel = 'WARN'

// グローバルログ設定（ビルド時設定で初期化）
let globalLogLevel: LogLevel = BUILD_LOG_LEVEL
let globalEnabled: boolean = true

/**
 * グローバルログ設定を変更
 */
export const setGlobalLogLevel = (level: LogLevel): void => {
  globalLogLevel = level
}

export const setGlobalLogEnabled = (enabled: boolean): void => {
  globalEnabled = enabled
}

/**
 * カスタムLoggerクラス
 */
export class CustomLogger {
  private timers = new Map<string, number>()

  constructor(private config: LoggerConfig) {}

  /**
   * ログレベルチェック - 出力すべきかどうか判定
   * ビルド時のログレベル以上（優先度が同じか高い）のみ出力
   */
  private shouldLog(level: LogLevel): boolean {
    if (!globalEnabled || !this.config.enabled) {
      return false
    }
    
    // ビルド時設定との比較：ビルド時レベル以上のみ出力
    const buildLevelPriority = LOG_PRIORITIES[BUILD_LOG_LEVEL]
    const messagePriority = LOG_PRIORITIES[level]
    
    // messagePriority <= buildLevelPriority で、より重要なログのみ通す
    return messagePriority <= buildLevelPriority
  }

  /**
   * 呼び出し元の関数名を取得
   */
  private getCallerFunction(): string {
    try {
      const stack = new Error().stack
      if (!stack) return ''
      
      // スタックトレースから呼び出し元を特定
      // 0: Error作成箇所, 1: getCallerFunction, 2: formatMessage, 3: output, 4: 実際の呼び出し元
      const lines = stack.split('\n')
      const callerLine = lines[5] // output -> ログメソッド -> 実際の呼び出し元
      
      if (callerLine) {
        // 関数名を抽出 (at functionName または at Object.functionName の形式)
        const match = callerLine.match(/at (?:Object\.)?([^.\s(]+)/)
        if (match && match[1]) {
          return match[1]
        }
      }
    } catch (error) {
      // スタックトレース取得に失敗した場合は無視
    }
    return ''
  }

  /**
   * ログフォーマット統一
   */
  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toLocaleTimeString('ja-JP', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    })
    
    const functionName = this.getCallerFunction()
    const functionPart = functionName ? `:${functionName}` : ''
    
    return `[${timestamp}] [${level}] [${this.config.module}${functionPart}] ${message}`
  }

  /**
   * 実際のログ出力
   */
  private output(level: LogLevel, message: string, data?: any): void {
    if (!this.shouldLog(level)) {
      return
    }

    const formattedMessage = this.formatMessage(level, message)
    
    switch (level) {
      case 'ERROR':
        if (data) {
          console.error(formattedMessage, data)
        } else {
          console.error(formattedMessage)
        }
        break
      case 'WARN':
        if (data) {
          console.warn(formattedMessage, data)
        } else {
          console.warn(formattedMessage)
        }
        break
      case 'INFO':
      case 'DEBUG':
        if (data) {
          console.log(formattedMessage, data)
        } else {
          console.log(formattedMessage)
        }
        break
    }
  }

  // パブリックログメソッド
  error(message: string, data?: any): void {
    this.output('ERROR', message, data)
  }

  warn(message: string, data?: any): void {
    this.output('WARN', message, data)
  }

  info(message: string, data?: any): void {
    this.output('INFO', message, data)
  }

  debug(message: string, data?: any): void {
    this.output('DEBUG', message, data)
  }

  /**
   * パフォーマンス測定開始
   */
  time(label: string): void {
    this.timers.set(label, performance.now())
    this.debug(`⏱️ 計測開始: ${label}`)
  }

  /**
   * パフォーマンス測定終了
   */
  timeEnd(label: string): void {
    const startTime = this.timers.get(label)
    if (startTime === undefined) {
      this.warn(`⏱️ 未知のタイマーラベル: ${label}`)
      return
    }
    
    const elapsed = performance.now() - startTime
    this.timers.delete(label)
    this.info(`⏱️ 計測完了: ${label} = ${elapsed.toFixed(2)}ms`)
  }

  /**
   * 条件付きログ - 条件がtrueの場合のみ出力
   */
  conditionalLog(level: LogLevel, condition: boolean, message: string, data?: any): void {
    if (condition) {
      this.output(level, message, data)
    }
  }
}

/**
 * Loggerインスタンス作成ファクトリ
 * 注意: levelパラメータは互換性のために残しているが、実際の制御はBUILD_LOG_LEVELで行われる
 */
export const createLogger = (module: string, level: LogLevel = BUILD_LOG_LEVEL): CustomLogger => {
  return new CustomLogger({
    level,
    module,
    enabled: true
  })
}

/**
 * よく使用されるモジュール用の事前定義Logger
 */
export const loggers = {
  tickets: createLogger('TICKETS'),
  pavilions: createLogger('PAVILIONS'), 
  automation: createLogger('AUTOMATION'),
  monitoring: createLogger('MONITORING'),
  ui: createLogger('UI')
} as const