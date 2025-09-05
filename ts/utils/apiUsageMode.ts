/**
 * API利用モード管理
 * 
 * 設定値による動作制御を統一管理
 */

import { loggers } from './logger'

const logger = loggers.ui

export type ApiUsageMode = 'full' | 'suppressed' | 'none'

/**
 * 現在のAPI利用モードを取得
 */
export function getApiUsageMode(): ApiUsageMode {
  const mode = localStorage.getItem('ytomo-api-usage-mode') || 'none'
  return mode as ApiUsageMode
}

/**
 * API利用が完全に無効化されているかを判定
 */
export function isApiUsageDisabled(): boolean {
  return getApiUsageMode() === 'none'
}

/**
 * API利用が抑制されているかを判定（suppressed または none）
 */
export function isApiUsageSuppressed(): boolean {
  const mode = getApiUsageMode()
  return mode === 'suppressed' || mode === 'none'
}

/**
 * API利用モード変更時のログ出力
 */
export function logApiUsageModeChange(newMode: ApiUsageMode): void {
  logger.info('API利用モード変更', { newMode })
  
  if (newMode === 'none') {
    logger.warn('API利用が完全に無効化されました - 全機能が制限されます')
  } else if (newMode === 'suppressed') {
    logger.info('API利用が抑制されました - 一部機能が制限されます')
  } else {
    logger.info('API利用が有効化されました - 全機能が利用可能です')
  }
}

/**
 * API利用なしモード用の統一エラー
 */
export class ApiUsageDisabledError extends Error {
  constructor(message: string = 'API利用が無効化されています') {
    super(message)
    this.name = 'ApiUsageDisabledError'
  }
}