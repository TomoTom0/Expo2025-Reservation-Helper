/**
 * /ytomoメニュー拡張機能
 * 
 * 【責務】
 * - 通常ページでの#child_menu_2に/ytomoメニュー項目を追加
 * - メニュー項目クリックでの/ytomoページ移動
 * 
 * @version v1.0.0
 */

import { loggers } from '../utils/logger';
const logger = loggers.ui;

/**
 * /ytomoメニュー項目としてのliを作成
 */
function createYtomoMenuItem(): HTMLLIElement {
    const li = document.createElement('li');
    li.id = 'ytomo-extension-child-menu-2-navigation-item'; // 識別用ID
    
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    
    const span = document.createElement('span');
    span.setAttribute('data-message-code', 'SW_GP_DL_001_0201');
    span.className = 'style_renderer__ip0Pm';
    span.textContent = 'YTomo';
    
    button.appendChild(span);
    li.appendChild(button);
    
    // クリックイベント
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const targetUrl = `${window.location.protocol}//${window.location.hostname}/ytomo`;
        logger.info('YTomoメニューから移動', { targetUrl });
        window.location.href = targetUrl;
    });
    
    return li;
}

/**
 * #child_menu_2の存在をチェックし、/ytomoメニュー項目を追加
 */
function enhanceChildMenu2(): void {
    const childMenu2 = document.getElementById('child_menu_2');
    if (!childMenu2) {
        return;
    }

    // 既存のYTomoメニュー項目がないかチェック（IDによる確実な判定）
    const existingYtomoItem = childMenu2.querySelector('#ytomo-extension-child-menu-2-navigation-item');

    if (existingYtomoItem) {
        logger.debug('YTomoメニュー項目は既に存在します');
        return;
    }

    // /ytomoメニュー項目を作成
    const ytomoMenuItem = createYtomoMenuItem();

    // 最初の子要素として挿入
    if (childMenu2.firstChild) {
        childMenu2.insertBefore(ytomoMenuItem, childMenu2.firstChild);
    } else {
        childMenu2.appendChild(ytomoMenuItem);
    }

    logger.info('YTomoメニュー項目を追加', {
        position: '#child_menu_2の最初の子要素',
        childCount: childMenu2.children.length
    });
}

/**
 * MutationObserverでDOM変更を監視し、#child_menu_2が追加されたら拡張
 */
function observeForChildMenu2(): void {
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    const element = node as Element;
                    
                    // 追加されたノード自体が#child_menu_2の場合
                    if (element.id === 'child_menu_2') {
                        logger.debug('#child_menu_2の追加を検知');
                        setTimeout(() => enhanceChildMenu2(), 100);
                    }
                    
                    // 追加されたノードの子要素に#child_menu_2がある場合
                    const childMenu2 = element.querySelector('#child_menu_2');
                    if (childMenu2) {
                        logger.debug('#child_menu_2の追加を検知（子要素内）');
                        setTimeout(() => enhanceChildMenu2(), 100);
                    }
                }
            });
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    logger.debug('MutationObserver開始: #child_menu_2の動的追加を監視');
}

/**
 * /ytomoメニュー拡張の初期化
 */
export function initializeYtomoMenuEnhancer(): void {
    try {
        logger.info('YTomoメニュー拡張機能初期化開始');
        
        // 即座にチェック
        enhanceChildMenu2();
        
        // DOM変更の監視開始（動的に追加される場合に対応）
        observeForChildMenu2();
        
        logger.info('YTomoメニュー拡張機能初期化完了');
        
    } catch (error) {
        logger.error('/ytomoメニュー拡張機能初期化エラー', error);
    }
}