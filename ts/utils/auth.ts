/**
 * 認証状態確認ユーティリティ
 * verified-api-analysis.mdの実証結果に基づく実装
 */

import { loggers } from '@/utils/logger'

const logger = loggers.ui

/**
 * ログイン状態確認とリダイレクト処理
 * verified-api-analysis.mdの実証結果に基づく完全な実装
 * 
 * @param redirectOnUnauthorized - 401エラー時に自動リダイレクトするか
 * @returns ログイン状態 (401エラーでリダイレクトした場合は戻り値なし)
 */
export async function checkLoginStatus(redirectOnUnauthorized: boolean = false): Promise<boolean> {
  logger.info('ログイン状態確認開始')
  
  try {
    const response = await fetch('/api/d/my/tickets/?count=1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8'
      },
      credentials: 'include'
    })

    if (response.status === 401) {
      logger.warn('未ログイン状態検出 (401 Unauthorized)')
      
      if (redirectOnUnauthorized) {
        redirectToLogin()
        return false // 実際にはリダイレクトされるため、この行は実行されない
      }
      
      return false
    }

    const isLoggedIn = response.status === 200
    
    if (isLoggedIn) {
      logger.info('ログイン済み確認完了')
    } else {
      logger.info('ログイン状態不明', { 
        status: response.status, 
        statusText: response.statusText 
      })
    }
    
    return isLoggedIn
  } catch (error) {
    logger.error('ログイン状態確認エラー - 未ログインとして扱います', error)
    return false
  }
}

/**
 * ログインページにリダイレクト
 * 現在のURL（pathname + search + hash）を戻り先として指定
 * verified-api-analysis.mdの実証パターンに基づく実装
 */
export function redirectToLogin(): void {
  logger.info('ログインページへリダイレクト開始')
  
  try {
    // 現在のパスを戻り先として取得
    const currentPath = window.location.pathname + window.location.search + window.location.hash
    logger.info('現在のパス取得', { currentPath })
    
    // 戻り先URLをエンコード
    const encodedReturnPath = encodeURIComponent(currentPath)
    logger.debug('戻り先URLエンコード', { encodedReturnPath })
    
    // ログインページURL構築
    const loginUrl = `/api/d/expo_login?return_path=${encodedReturnPath}`
    logger.info('ログインページURL構築完了', { loginUrl })
    
    // リダイレクト実行（履歴に残らない）
    window.location.replace(loginUrl)
    logger.info('ログインページリダイレクト実行完了')
    
  } catch (error) {
    logger.error('ログインページリダイレクトエラー', error)
    // フォールバック: 戻り先指定なしでリダイレクト
    window.location.replace('/api/d/expo_login')
  }
}

/**
 * ログイン状態確認とリダイレクトの統合処理
 * 未ログイン時は自動的にリダイレクト実行
 */
export async function checkLoginAndRedirect(): Promise<boolean> {
  return await checkLoginStatus(true)
}