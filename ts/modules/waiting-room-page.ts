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
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import MainDialog from '../components/MainDialog.vue';
import { PageChecker } from './page-utils';

const logger = loggers.ui;

// ytomoコンテンツの表示状態を管理
let isYtomoContentVisible = false;
let ytomoApp: any = null;

// 承認ボタン監視用
let buttonCheckInterval: NodeJS.Timeout | null = null;

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
    button.textContent = 'YTomo表示';
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
        toggleYtomoContent();
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
    span.textContent = '/ytomo表示';
    span.className = 'style_renderer__ip0Pm'; // 参考の例に合わせてクラスを設定
    
    button.appendChild(span);
    li.appendChild(button);
    
    // クリックイベント
    button.addEventListener('click', () => {
        toggleYtomoContent();
    });
    
    return li;
}

/**
 * #wrapperを折りたたんでytomoコンテンツを表示/非表示する
 */
function toggleYtomoContent(): void {
    try {
        const wrapper = document.getElementById('wrapper');
        if (!wrapper) {
            logger.warn('#wrapperが見つかりません');
            return;
        }

        if (!isYtomoContentVisible) {
            // ytomoコンテンツを表示
            showYtomoContent(wrapper);
        } else {
            // ytomoコンテンツを非表示
            hideYtomoContent(wrapper);
        }
    } catch (error) {
        logger.error('ytomoコンテンツ表示切り替えエラー', error);
    }
}

/**
 * ytomoコンテンツを表示
 */
function showYtomoContent(wrapper: HTMLElement): void {
    logger.info('ytomoコンテンツを表示開始');
    
    // #wrapperを折りたたみ
    wrapper.style.display = 'none';
    
    // ytomoコンテナがまだ存在しない場合は作成
    let ytomoContainer = document.getElementById('ytomo-content-container');
    if (!ytomoContainer) {
        ytomoContainer = document.createElement('div');
        ytomoContainer.id = 'ytomo-content-container';
        ytomoContainer.style.cssText = `
            width: 100%;
            min-height: 100vh;
            background: #f5f5f5;
            padding: 20px;
            box-sizing: border-box;
        `;
        
        // #wrapperの後に挿入
        wrapper.parentNode?.insertBefore(ytomoContainer, wrapper.nextSibling);
    }
    
    // MainDialogをytomoコンテナ内にマウント
    if (!ytomoApp) {
        const dialogContainer = document.createElement('div');
        dialogContainer.id = 'waiting-room-ytomo-dialog';
        dialogContainer.style.cssText = `
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        `;
        
        ytomoContainer.appendChild(dialogContainer);
        
        // Vueアプリを作成してMainDialogをマウント
        ytomoApp = createApp(MainDialog);
        
        // Piniaを設定
        const pinia = createPinia();
        ytomoApp.use(pinia);
        
        ytomoApp.mount(dialogContainer);
        
        // アプリマウント後にストアを初期化
        setTimeout(() => {
            try {
                // dynamic importでストアを取得
                import('../stores/mainDialog').then(({ useMainDialogStore }) => {
                    const mainDialogStore = useMainDialogStore();
                    mainDialogStore.showDialog(true);
                });
            } catch (error) {
                logger.warn('MainDialogStore初期化エラー', error);
            }
        }, 100);
    }
    
    ytomoContainer.style.display = 'block';
    isYtomoContentVisible = true;
    
    // ボタンのテキストを更新
    updateButtonTexts();
    
    logger.info('ytomoコンテンツ表示完了');
}

/**
 * ytomoコンテンツを非表示
 */
function hideYtomoContent(wrapper: HTMLElement): void {
    logger.info('ytomoコンテンツを非表示');
    
    // #wrapperを表示
    wrapper.style.display = '';
    
    // ytomoコンテナを非表示
    const ytomoContainer = document.getElementById('ytomo-content-container');
    if (ytomoContainer) {
        ytomoContainer.style.display = 'none';
    }
    
    isYtomoContentVisible = false;
    
    // ボタンのテキストを更新
    updateButtonTexts();
    
    logger.info('ytomoコンテンツ非表示完了');
}

/**
 * ボタンのテキストを現在の状態に応じて更新
 */
function updateButtonTexts(): void {
    // navigationボタンのテキスト更新
    const navigationButton = document.getElementById('ytomo-navigation-button') as HTMLButtonElement;
    if (navigationButton) {
        navigationButton.textContent = isYtomoContentVisible ? 'YTomo非表示' : 'YTomo表示';
    }
    
    // メニュー項目のテキスト更新
    const menuSpans = document.querySelectorAll('#child_menu_2 span');
    for (const span of menuSpans) {
        if (span.textContent?.includes('/ytomo') || span.textContent?.includes('YTomo')) {
            span.textContent = isYtomoContentVisible ? 'YTomo非表示' : '/ytomo表示';
            break;
        }
    }
}

/**
 * 承認ボタンの監視と自動押下
 */
function setupAutoConfirmButton(): void {
    const checkForConfirmButton = () => {
        const confirmButton = document.getElementById('buttonConfirmRedirect') as HTMLButtonElement;
        
        if (confirmButton && !confirmButton.disabled && confirmButton.offsetParent !== null) {
            logger.info('承認ボタン検出 - 自動押下を実行', {
                buttonText: confirmButton.textContent?.trim(),
                buttonVisible: confirmButton.offsetParent !== null,
                buttonDisabled: confirmButton.disabled
            });
            
            // ボタンをクリック
            confirmButton.click();
            
            // 監視を停止（一度押したら終了）
            if (buttonCheckInterval) {
                clearInterval(buttonCheckInterval);
                buttonCheckInterval = null;
                logger.info('承認ボタン自動押下完了 - 監視停止');
            }
        }
    };
    
    // 初回チェック
    setTimeout(checkForConfirmButton, 1000);
    
    // 定期チェック（1分間隔で最大300回 = 5時間）
    let checkCount = 0;
    const maxChecks = 300;
    
    buttonCheckInterval = setInterval(() => {
        // 待機室ページから移動していたら監視を停止
        if (!PageChecker.isWaitingRoomPage()) {
            if (buttonCheckInterval) {
                clearInterval(buttonCheckInterval);
                buttonCheckInterval = null;
            }
            logger.info('待機室ページから移動したため承認ボタン監視停止');
            return;
        }
        
        checkCount++;
        checkForConfirmButton();
        
        // 最大チェック回数に達したら停止
        if (checkCount >= maxChecks && buttonCheckInterval) {
            clearInterval(buttonCheckInterval);
            buttonCheckInterval = null;
            logger.info('承認ボタン監視タイムアウト', { checkCount });
        }
    }, 60000); // 1分間隔
    
    logger.info('承認ボタン自動押下監視開始', { maxChecks, interval: '1分' });
}


/**
 * 待機室ページの初期化処理
 * 
 * 【機能】承認ボタン自動押下のみ実行
 */
export function init_waiting_room_page(): void {
    logger.info('待機室ページ: 承認ボタン自動押下機能を開始');
    
    // DOM読み込み完了を待つ
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', setupAutoConfirmButton);
    } else {
        setupAutoConfirmButton();
    }
}