/**
 * 待機室ページ機能
 * 
 * 【責務】
 * - tktwaitingroom.expo2025.or.jpページでの機能拡張
 * - [#headerparagraph]直後に/ytomoへのURL移動ボタンを追加
 * 
 * @version v1.0.0
 */

import { loggers } from '../utils/logger';
const logger = loggers.ui;

/**
 * 待機室ページの初期化可能判定
 */
export function judge_waiting_room_init(): boolean {
    // ページの基本要素が存在するかチェック
    return document.body !== null && (
        document.getElementById('headerparagraph') !== null ||
        document.getElementById('child_menu_2') !== null
    );
}

/**
 * /ytomoへの移動ボタンを作成
 */
function createYtomoNavigationButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.id = 'ytomo-navigation-button';
    button.textContent = 'YTomo';
    button.style.cssText = `
        background: linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 12px 24px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        margin: 16px 0;
        box-shadow: 0 2px 8px rgba(44, 90, 160, 0.3);
        transition: all 0.2s ease;
        display: inline-flex;
        align-items: center;
        gap: 8px;
    `;
    
    // ホバーエフェクト
    button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 12px rgba(44, 90, 160, 0.4)';
    });
    
    button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = '0 2px 8px rgba(44, 90, 160, 0.3)';
    });
    
    // クリックイベント
    button.addEventListener('click', () => {
        // 現在のURLから基本URLを抽出
        const currentUrl = new URL(window.location.href);
        const baseUrl = `${currentUrl.protocol}//${currentUrl.hostname.replace('tktwaitingroom.', 'ticket.')}`;
        const targetUrl = `${baseUrl}/ytomo`;
        
        logger.info('YTomoページへ移動', { targetUrl });
        window.location.href = targetUrl;
    });
    
    return button;
}

/**
 * メニュー項目としてのliを作成
 */
function createYtomoMenuListItem(): HTMLLIElement {
    const li = document.createElement('li');
    
    const button = document.createElement('button');
    button.type = 'button';
    button.tabIndex = -1;
    
    const span = document.createElement('span');
    span.textContent = '/ytomo移行';
    span.className = 'style_renderer__ip0Pm'; // 参考の例に合わせてクラスを設定
    
    button.appendChild(span);
    li.appendChild(button);
    
    // クリックイベント
    button.addEventListener('click', () => {
        // 現在のURLから基本URLを抽出
        const currentUrl = new URL(window.location.href);
        const baseUrl = `${currentUrl.protocol}//${currentUrl.hostname.replace('tktwaitingroom.', 'ticket.')}`;
        const targetUrl = `${baseUrl}/ytomo`;
        
        logger.info('/ytomoメニューから移動', { targetUrl });
        window.location.href = targetUrl;
    });
    
    return li;
}

/**
 * 待機室ページの初期化処理
 */
export function init_waiting_room_page(): void {
    try {
        logger.info('待機室ページ初期化開始');
        
        // #child_menu_2が存在する場合の処理を優先
        const childMenu2 = document.getElementById('child_menu_2');
        if (childMenu2) {
            // 既存のメニュー項目がないかチェック
            const existingMenuItems = childMenu2.querySelectorAll('li');
            const existingYtomoItem = Array.from(existingMenuItems).find(li => {
                const span = li.querySelector('span');
                return span && span.textContent?.includes('/ytomo');
            });
            
            if (!existingYtomoItem) {
                // /ytomoメニュー項目を作成
                const ytomoMenuItem = createYtomoMenuListItem();
                
                // 最初の子要素として挿入
                if (childMenu2.firstChild) {
                    childMenu2.insertBefore(ytomoMenuItem, childMenu2.firstChild);
                } else {
                    childMenu2.appendChild(ytomoMenuItem);
                }
                
                logger.info('/ytomoメニュー項目を追加', {
                    position: '#child_menu_2の最初の子要素'
                });
            } else {
                logger.debug('/ytomoメニュー項目は既に存在します');
            }
        }
        
        // #headerparagraphも存在する場合の従来の処理
        const headerParagraph = document.getElementById('headerparagraph');
        if (headerParagraph) {
            // 既存のボタンがないかチェック
            const existingButton = document.getElementById('ytomo-navigation-button');
            if (!existingButton) {
                // /ytomoナビゲーションボタンを作成
                const navigationButton = createYtomoNavigationButton();
                
                // #headerparagraphの直後に挿入
                if (headerParagraph.nextSibling) {
                    headerParagraph.parentNode?.insertBefore(navigationButton, headerParagraph.nextSibling);
                } else {
                    headerParagraph.parentNode?.appendChild(navigationButton);
                }
                
                logger.info('#headerparagraph直後にボタンを追加');
            } else {
                logger.debug('/ytomoボタンは既に存在します');
            }
        }
        
        if (!childMenu2 && !headerParagraph) {
            logger.warn('#child_menu_2も#headerparagraphも見つかりません');
            return;
        }
        
        logger.info('待機室ページ初期化完了');
        
    } catch (error) {
        logger.error('待機室ページ初期化エラー', error);
    }
}