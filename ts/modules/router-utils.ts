/**
 * Next.js Router操作ユーティリティ
 * Content Script環境でのCSP制限を回避してPage ContextのRouterにアクセス
 */

import { loggers } from '../utils/logger';
const logger = loggers.automation;

/**
 * Page ContextのNext.js Routerの存在確認
 * CSP制限を回避してonclick属性経由でアクセス
 * @returns Router存在確認の結果オブジェクト
 */
export function checkNextRouter(): { exists: boolean; type: string } | null {
    try {
        logger.info('Router存在確認 - CSP制限回避方式');
        
        // Content Script contextでの確認
        logger.debug('Content Script - window.next', { next: (window as any).next });
        
        // DOM操作でPage contextの情報取得
        const testDiv = document.createElement('div');
        testDiv.id = 'router-test';
        testDiv.style.display = 'none';
        
        // onclick属性経由でPage contextにアクセス
        testDiv.setAttribute('onclick', 'this.dataset.router = JSON.stringify({exists: !!window.next?.router, type: typeof window.next?.router})');
        document.body.appendChild(testDiv);
        
        // クリックイベントを発火
        testDiv.click();
        
        const result = testDiv.dataset['router'];
        document.body.removeChild(testDiv);
        
        logger.debug('Page context Router情報', { result });
        
        if (result) {
            const routerInfo = JSON.parse(result);
            if (routerInfo.exists) {
                logger.info('Page contextでRouter存在確認');
                return routerInfo;
            }
        }
        
        logger.warn('Page contextでRouter未発見');
        return null;
        
    } catch (e) {
        logger.error('Router存在確認エラー', e);
        return null;
    }
}

/**
 * Next.js Router.push()を実行
 * CSP制限を回避してPage ContextのRouter.push()を呼び出し
 * @param url 遷移先URL
 * @returns 実行成功の可否
 */
export function executeRouterPush(url: string): boolean {
    try {
        logger.info('Router.push()実行開始', { url });
        
        // Router存在確認
        const routerInfo = checkNextRouter();
        if (!routerInfo?.exists) {
            logger.error('Router が存在しません');
            return false;
        }
        
        // CSP制限回避方式でRouter.push()実行
        const pushDiv = document.createElement('div');
        pushDiv.style.display = 'none';
        pushDiv.setAttribute('onclick', `window.next?.router?.push('${url}')`);
        document.body.appendChild(pushDiv);
        pushDiv.click();
        document.body.removeChild(pushDiv);
        
        logger.info('Router.push()実行完了', { url });
        return true;
        
    } catch (e) {
        logger.error('Router.push()実行エラー', e);
        return false;
    }
}

/**
 * Next.js Router操作の総合ユーティリティ
 */
export const RouterUtils = {
    /**
     * Router存在確認
     */
    check: checkNextRouter,
    
    /**
     * Router.push()実行
     */
    push: executeRouterPush,
    
    /**
     * Router情報の詳細ログ出力
     */
    logInfo(): void {
        const routerInfo = checkNextRouter();
        logger.info('Next.js Router情報', {
            exists: routerInfo?.exists || false,
            type: routerInfo?.type || 'unknown',
            contentScriptNext: (window as any).next
        });
    }
};