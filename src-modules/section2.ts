// ============================================================================
// 【2. 状態管理オブジェクト】
// ============================================================================

import type { 
    EntranceReservationState, 
    TimeSlotState, 
    PageLoadingState, 
    ReloadCountdownState, 
    CalendarWatchState 
} from '../types/index.js';

let entranceReservationState: EntranceReservationState = {
    isRunning: false,
    shouldStop: false,
    startTime: null,
    attempts: 0
};

// 時間帯監視機能の状態管理
let timeSlotState: TimeSlotState = {
    mode: 'idle',  // idle, selecting, monitoring, trying
    targetSlots: [],   // 複数選択対象の時間帯情報配列
    monitoringInterval: null,  // 監視用インターバル
    isMonitoring: false,
    retryCount: 0,
    maxRetries: 100,
    reloadInterval: 30000  // 30秒間隔
};


// ページ読み込み状態管理
const pageLoadingState: PageLoadingState = {
    isLoading: false,
    startTime: null,
    timeout: 10000
};

// リロードカウントダウン状態管理
const reloadCountdownState: ReloadCountdownState = {
    isActive: false,
    timeLeft: 0,
    intervalId: null,
    onComplete: null,
    totalSeconds: 30,
    secondsRemaining: null,
    startTime: null,
    countdownInterval: null,
    reloadTimer: null
};

// カレンダー監視状態管理
const calendarWatchState: CalendarWatchState = {
    isWatching: false,
    observer: null,
    currentSelectedDate: null
};

// FAB表示状態管理
interface FABVisibilityState {
    isVisible: boolean;
    cacheKey: string;
}

const fabVisibilityState: FABVisibilityState = {
    isVisible: true, // デフォルトは表示
    cacheKey: 'ytomo-fab-visibility'
};

// FAB表示状態管理機能
function loadFABVisibility(): void {
    try {
        const saved = localStorage.getItem(fabVisibilityState.cacheKey);
        if (saved !== null) {
            fabVisibilityState.isVisible = JSON.parse(saved);
        }
    } catch (e) {
        console.warn('FAB表示状態の読み込みに失敗しました:', e);
    }
}

function saveFABVisibility(isVisible: boolean): void {
    try {
        fabVisibilityState.isVisible = isVisible;
        localStorage.setItem(fabVisibilityState.cacheKey, JSON.stringify(isVisible));
    } catch (e) {
        console.warn('FAB表示状態の保存に失敗しました:', e);
    }
}

function toggleFABVisibility(): void {
    const newVisibility = !fabVisibilityState.isVisible;
    saveFABVisibility(newVisibility);
    updateFABVisibility();
}

function updateFABVisibility(): void {
    // 入場予約FAB
    const fabContainer = document.getElementById('ytomo-fab-container');
    if (fabContainer) {
        fabContainer.style.display = fabVisibilityState.isVisible ? 'flex' : 'none';
    }
    
    // パビリオン予約FAB
    const pavilionFabContainer = document.getElementById('ytomo-pavilion-fab-container');
    if (pavilionFabContainer) {
        pavilionFabContainer.style.display = fabVisibilityState.isVisible ? 'flex' : 'none';
    }
    
    // チケット選択画面FAB
    const ticketSelectionFabContainer = document.getElementById('ytomo-ticket-selection-fab-container');
    if (ticketSelectionFabContainer) {
        ticketSelectionFabContainer.style.display = fabVisibilityState.isVisible ? 'flex' : 'none';
    }
}

// ヘッダーにFAB表示切替ボタンを追加
export function createFABToggleButton(): void {
    // 既存のボタンがあるかチェック
    const existingButton = document.getElementById('ytomo-fab-toggle-btn');
    if (existingButton) {
        return; // 既に存在する場合は何もしない
    }
    
    // 買い物アイコンを探す（HTMLから判明した安定セレクタ使用）
    const shoppingIcon = document.querySelector('li[data-type="cart"]');
    
    // 買い物アイコンが見つからない場合、ヘッダー内の右端要素を探す
    let targetElement = shoppingIcon;
    if (!targetElement) {
        console.log('🛒 買い物アイコンが見つかりません。ヘッダー右端要素を探索中...');
        
        // ヘッダー要素を探す
        const headerSelectors = [
            '.style_sp_title_box__oK11Q',
            '.pc-none',
            'div[class*="style_sp_title_box"]',
            'div[class*="title_box"]',
            'header',
            'div:has(.style_site_heading__W80I0)',
            '.style_site_heading__W80I0'
        ];
        
        let headerElement: Element | null = null;
        for (const selector of headerSelectors) {
            try {
                headerElement = document.querySelector(selector);
                if (headerElement) {
                    console.log(`📋 ヘッダー要素発見: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }
        
        if (headerElement) {
            // ヘッダー内の右端にありそうな要素を探す
            const rightElements = headerElement.querySelectorAll('a, button, span, div');
            for (let i = rightElements.length - 1; i >= 0; i--) {
                const el = rightElements[i];
                const rect = el.getBoundingClientRect();
                if (rect.width > 20 && rect.height > 20) {
                    targetElement = el;
                    console.log(`🎯 右端要素を買い物アイコン候補として使用: ${el.tagName}`);
                    break;
                }
            }
        }
    }
    
    if (!targetElement) {
        console.warn('買い物アイコンまたは配置基準要素が見つかりません');
        return;
    }
    
    // 既存のアイコンデザインに合わせたli要素を作成
    const toggleLi = document.createElement('li');
    toggleLi.id = 'ytomo-fab-toggle-li';
    
    const toggleButton = document.createElement('button');
    toggleButton.id = 'ytomo-fab-toggle-btn';
    toggleButton.type = 'button';
    toggleButton.tabIndex = 0;
    
    const toggleFigure = document.createElement('div');
    toggleFigure.className = 'style_header_shortcut__figure__gNkUJ';
    
    // 既存のヘッダーアイコン構造に合わせてDOM要素を作成
    
    // 既存のヘッダーアイコンのスタイルを継承
    toggleLi.style.cssText = `
        display: inline-block !important;
        margin-right: 8px !important;
    `;
    
    toggleButton.style.cssText = `
        background: none !important;
        border: none !important;
        cursor: pointer !important;
        padding: 0 !important;
        color: white !important;
        transition: all 0.2s ease !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    
    toggleFigure.style.cssText = `
        width: auto !important;
        height: 24px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 0 4px !important;
    `;
    
    // DOM構造を組み立て
    toggleFigure.appendChild(toggleButton);
    toggleLi.appendChild(toggleFigure);
    
    // YT背景 + 前景アイコンの重ね表示
    function updateButtonIcon() {
        const iconSvg = fabVisibilityState.isVisible 
            ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                 <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
               </svg>` // eye
            : `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                 <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
               </svg>`; // eye-off
        
        toggleButton.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center;">
                ${iconSvg}
                <span style="font-size: 8px; font-weight: bold; margin-top: 2px;">YTomo</span>
            </div>
        `;
        toggleButton.title = fabVisibilityState.isVisible ? 'FABを非表示にする' : 'FABを表示する';
    }
    
    updateButtonIcon();
    
    // ホバー効果（既存のアイコンに合わせて控えめに）
    toggleButton.addEventListener('mouseenter', () => {
        toggleButton.style.color = '#ddd';
    });
    
    toggleButton.addEventListener('mouseleave', () => {
        toggleButton.style.color = 'white';
    });
    
    // クリックイベント
    toggleButton.addEventListener('click', (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFABVisibility();
        updateButtonIcon();
    });
    
    // 買い物アイコンの親ul要素を取得してその中に挿入
    const parentUl = targetElement.parentElement;
    if (parentUl && parentUl.tagName.toLowerCase() === 'ul') {
        // 買い物アイコンの直前に挿入
        parentUl.insertBefore(toggleLi, targetElement);
    } else {
        console.warn('ul要素が見つかりません。body直下に追加します');
        document.body.appendChild(toggleLi);
    }
}

// エクスポート
export {
    entranceReservationState,
    timeSlotState,
    pageLoadingState,
    reloadCountdownState,
    calendarWatchState,
    fabVisibilityState,
    loadFABVisibility,
    saveFABVisibility,
    toggleFABVisibility,
    updateFABVisibility
};
