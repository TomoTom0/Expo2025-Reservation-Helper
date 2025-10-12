/**
 * Redirect管理Store
 *
 * ytomoページ経由でのページ遷移を管理するストア。
 * redirect_codeを生成し、遷移先情報をキャッシュする。
 */

import { defineStore } from 'pinia'
import { loggers } from '@/utils/logger'

const logger = loggers.ui

// Redirect情報の型定義
export interface RedirectInfo {
  targetUrl: string
  timestamp: number
  pavilionId?: string
  pavilionName?: string
}

export const useRedirectStore = defineStore('redirect', () => {

  /**
   * ユニークなredirect_codeを生成
   * 形式: タイムスタンプ + ランダム文字列
   */
  const generateRedirectCode = (): string => {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `${timestamp}_${random}`
  }

  /**
   * Redirect情報をlocalStorageに保存
   */
  const saveRedirectInfo = (redirectCode: string, info: RedirectInfo): void => {
    try {
      const key = `redirect_${redirectCode}`
      localStorage.setItem(key, JSON.stringify(info))
      logger.info('Redirect情報を保存', { redirectCode, targetUrl: info.targetUrl })
    } catch (error) {
      logger.error('Redirect情報保存エラー', error)
      throw error
    }
  }

  /**
   * Redirect情報をlocalStorageから取得
   */
  const getRedirectInfo = (redirectCode: string): RedirectInfo | null => {
    try {
      const key = `redirect_${redirectCode}`
      const data = localStorage.getItem(key)

      if (!data) {
        logger.warn('Redirect情報が見つかりません', { redirectCode })
        return null
      }

      const info = JSON.parse(data) as RedirectInfo

      // 5分以上古い情報は無効
      const now = Date.now()
      if (now - info.timestamp > 5 * 60 * 1000) {
        logger.warn('Redirect情報が期限切れです', { redirectCode, age: now - info.timestamp })
        localStorage.removeItem(key)
        return null
      }

      logger.info('Redirect情報を取得', { redirectCode, targetUrl: info.targetUrl })
      return info

    } catch (error) {
      logger.error('Redirect情報取得エラー', error)
      return null
    }
  }

  /**
   * Redirect情報を削除（使用後のクリーンアップ）
   */
  const clearRedirectInfo = (redirectCode: string): void => {
    try {
      const key = `redirect_${redirectCode}`
      localStorage.removeItem(key)
      logger.info('Redirect情報を削除', { redirectCode })
    } catch (error) {
      logger.error('Redirect情報削除エラー', error)
    }
  }

  /**
   * 期限切れのRedirect情報をすべてクリーンアップ
   */
  const cleanupExpiredRedirects = (): void => {
    try {
      const now = Date.now()
      const keysToRemove: string[] = []

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && key.startsWith('redirect_')) {
          const data = localStorage.getItem(key)
          if (data) {
            try {
              const info = JSON.parse(data) as RedirectInfo
              if (now - info.timestamp > 5 * 60 * 1000) {
                keysToRemove.push(key)
              }
            } catch {
              // パースエラーの場合も削除対象
              keysToRemove.push(key)
            }
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key))

      if (keysToRemove.length > 0) {
        logger.info('期限切れRedirect情報をクリーンアップ', { count: keysToRemove.length })
      }

    } catch (error) {
      logger.error('Redirectクリーンアップエラー', error)
    }
  }

  // 初期化時にクリーンアップ実行
  cleanupExpiredRedirects()

  return {
    generateRedirectCode,
    saveRedirectInfo,
    getRedirectInfo,
    clearRedirectInfo,
    cleanupExpiredRedirects
  }
})
