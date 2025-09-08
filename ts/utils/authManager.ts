/**
 * 認証管理ユーティリティ
 * API 401エラーの検知とログインページリダイレクト、定期的な認証状態確認を管理
 */

import { loggers } from './logger'
import { redirectToLogin } from './auth'
import { isApiUsageDisabled, isApiUsageSuppressed } from './apiUsageMode'
import { PageChecker } from '../modules/page-utils'

const logger = loggers.ui

interface AuthCheckResponse {
  isAuthenticated: boolean
  userInfo?: any
}

class AuthManager {
  private static instance: AuthManager
  private authCheckInterval: number | null = null
  private readonly AUTH_CHECK_INTERVAL = 10 * 60 * 1000 // 10分
  private lastAuthCheck: number = 0
  private isRedirecting: boolean = false

  private constructor() {}

  public static getInstance(): AuthManager {
    if (!AuthManager.instance) {
      AuthManager.instance = new AuthManager()
    }
    return AuthManager.instance
  }

  /**
   * 認証管理を開始
   */
  public startAuthMonitoring(): void {
    // 待機室ページでは認証監視を無効化
    if (PageChecker.isWaitingRoomPage()) {
      logger.info('待機室ページのため認証監視をスキップ')
      return
    }
    
    // API利用なしモードでは認証監視を無効化
    if (isApiUsageDisabled()) {
      logger.info('API利用なしモードのため認証監視をスキップ')
      return
    }
    
    // API利用抑制モードかつytomoページ以外では認証監視を無効化
    if (isApiUsageSuppressed() && !PageChecker.isYtomoPage()) {
      logger.info('API利用抑制モードかつytomoページ以外のため認証監視をスキップ')
      return
    }
    
    logger.info('認証監視開始')
    
    // 即座に認証状態をチェック
    this.checkAuthStatus()
    
    // 定期チェックを開始
    this.authCheckInterval = window.setInterval(() => {
      this.checkAuthStatus()
    }, this.AUTH_CHECK_INTERVAL)
  }

  /**
   * 認証管理を停止
   */
  public stopAuthMonitoring(): void {
    if (this.authCheckInterval) {
      clearInterval(this.authCheckInterval)
      this.authCheckInterval = null
      logger.info('認証監視停止')
    }
  }

  /**
   * API レスポンスが401エラーかどうかをチェック
   */
  public async handleApiResponse(response: Response): Promise<Response> {
    if (response.status === 401) {
      logger.warn('API 401エラー検知', {
        url: response.url,
        status: response.status,
        statusText: response.statusText
      })
      
      await this.handleAuthError()
    }
    
    return response
  }

  /**
   * APIベースURLを取得
   */
  private getApiBaseUrl(): string {
    // 本番環境では常にticket.expo2025.or.jpを使用
    return 'https://ticket.expo2025.or.jp'
  }

  /**
   * fetch リクエストをインターセプトして401エラーを自動処理
   */
  public async authenticatedFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    // API利用なしモードではエラーを即座に返す
    if (isApiUsageDisabled()) {
      const error = new Error('API利用が無効化されています') as any
      error.isApiDisabled = true
      logger.info('API利用なしモードのためAPI呼び出しを拒否', { url: input.toString() })
      throw error
    }
    
    // API利用抑制モードかつytomoページ以外では呼び出しを拒否
    if (isApiUsageSuppressed() && !PageChecker.isYtomoPage()) {
      const error = new Error('API利用が抑制されています（ytomoページ以外）') as any
      error.isApiSuppressed = true
      logger.info('API利用抑制モードかつytomoページ以外のためAPI呼び出しを拒否', { url: input.toString() })
      throw error
    }
    
    try {
      // 相対パスの場合、固定のAPIベースURLを使用
      let url: string
      if (typeof input === 'string' && input.startsWith('/api/')) {
        url = `${this.getApiBaseUrl()}${input}`
      } else {
        url = input.toString()
      }
      
      const response = await fetch(url, {
        credentials: 'include', // セッションクッキーを含める
        ...init
      })
      
      return await this.handleApiResponse(response)
    } catch (error) {
      logger.error('API呼び出しエラー', {
        url: input.toString(),
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }

  /**
   * 軽量なAPIで認証状態を確認
   */
  private async checkAuthStatus(): Promise<void> {
    const now = Date.now()
    
    // リダイレクト中は確認しない
    if (this.isRedirecting) {
      return
    }
    
    // 最後のチェックから5分未満の場合はスキップ（重複チェック防止）
    if (now - this.lastAuthCheck < 5 * 60 * 1000) {
      return
    }
    
    this.lastAuthCheck = now
    
    try {
      logger.debug('定期認証状態確認実行')
      
      // 既存で確認済みの軽量な認証確認API
      const response = await this.authenticatedFetch('/api/d/my/tickets/?count=1', {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      })
      
      if (response.status === 401) {
        logger.warn('定期認証確認で401エラー検知')
        await this.handleAuthError()
      } else if (response.ok) {
        logger.debug('認証状態正常')
      } else {
        logger.warn('認証確認API異常レスポンス', {
          status: response.status,
          statusText: response.statusText
        })
      }
    } catch (error) {
      logger.error('認証状態確認エラー', {
        error: error instanceof Error ? error.message : String(error)
      })
    }
  }

  /**
   * 認証エラー処理
   */
  private async handleAuthError(): Promise<void> {
    // API利用なしモードでは認証エラーを無視
    if (isApiUsageDisabled()) {
      logger.info('API利用なしモードのため認証エラーを無視')
      return
    }
    
    // API利用抑制モードかつytomoページ以外では認証エラーを無視
    if (isApiUsageSuppressed() && !PageChecker.isYtomoPage()) {
      logger.info('API利用抑制モードかつytomoページ以外のため認証エラーを無視')
      return
    }
    
    if (this.isRedirecting) {
      return // 既にリダイレクト処理中
    }
    
    this.isRedirecting = true
    
    try {
      logger.warn('認証エラー検知 - ログインページにリダイレクト')
      
      // 認証エラー通知（ユーザーに見える形で）
      this.showAuthErrorNotification()
      
      // 2秒後にリダイレクト（ユーザーが通知を確認できるように）
      setTimeout(() => {
        redirectToLogin()
      }, 2000)
      
    } catch (error) {
      logger.error('認証エラー処理中のエラー', {
        error: error instanceof Error ? error.message : String(error)
      })
      
      // エラーが発生してもリダイレクトは実行
      setTimeout(() => {
        redirectToLogin()
      }, 1000)
    }
  }

  /**
   * 認証エラー通知表示
   */
  private showAuthErrorNotification(): void {
    // 既存の通知があれば削除
    const existingNotification = document.getElementById('ytomo-auth-error-notification')
    if (existingNotification) {
      existingNotification.remove()
    }
    
    // 通知要素を作成
    const notification = document.createElement('div')
    notification.id = 'ytomo-auth-error-notification'
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc2626;
      color: white;
      padding: 16px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10005;
      font-size: 14px;
      font-weight: 600;
      max-width: 300px;
      animation: slideInFromRight 0.3s ease-out;
    `
    notification.textContent = 'セッションが期限切れです。ログインページにリダイレクトします...'
    
    // CSSアニメーションを追加
    if (!document.getElementById('ytomo-auth-notification-styles')) {
      const style = document.createElement('style')
      style.id = 'ytomo-auth-notification-styles'
      style.textContent = `
        @keyframes slideInFromRight {
          from {
            opacity: 0;
            transform: translateX(100%);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `
      document.head.appendChild(style)
    }
    
    document.body.appendChild(notification)
    
    logger.info('認証エラー通知表示')
  }

  /**
   * 現在の認証状態を取得（キャッシュベース）
   */
  public isAuthCheckRecent(): boolean {
    const now = Date.now()
    return (now - this.lastAuthCheck) < 2 * 60 * 1000 // 2分以内
  }
}

export const authManager = AuthManager.getInstance()

// fetch をオーバーライドして自動的に認証チェックを適用
export const authenticatedFetch = authManager.authenticatedFetch.bind(authManager)

// デフォルトエクスポート
export default authManager