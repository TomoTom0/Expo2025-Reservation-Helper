// ============================================================================
// 【2. 状態管理オブジェクト】
// ============================================================================

import type { 
    EntranceReservationState, 
    CalendarWatchState 
} from '../types/index.js';
import { loggers } from '../utils/logger';
const logger = loggers.ui;

let entranceReservationState: EntranceReservationState = {
    isRunning: false,
    shouldStop: false,
    startTime: null,
    attempts: 0
};





// カレンダー検知状態管理
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
        logger.warn('FAB表示状態の読み込みに失敗', { error: e });
    }
}

function saveFABVisibility(isVisible: boolean): void {
    try {
        fabVisibilityState.isVisible = isVisible;
        localStorage.setItem(fabVisibilityState.cacheKey, JSON.stringify(isVisible));
    } catch (e) {
        logger.warn('FAB表示状態の保存に失敗', { error: e });
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
        fabContainer.classList.toggle('js-hide', !fabVisibilityState.isVisible);
    }
    
    // パビリオン予約FAB
    const pavilionFabContainer = document.getElementById('ytomo-pavilion-fab-container');
    if (pavilionFabContainer) {
        pavilionFabContainer.classList.toggle('js-hide', !fabVisibilityState.isVisible);
    }
    
    // チケット選択画面FAB
    const ticketSelectionFabContainer = document.getElementById('ytomo-ticket-selection-fab-container');
    if (ticketSelectionFabContainer) {
        ticketSelectionFabContainer.classList.toggle('js-hide', !fabVisibilityState.isVisible);
    }
}


// エクスポート
export {
    entranceReservationState,
    calendarWatchState,
    fabVisibilityState,
    loadFABVisibility,
    saveFABVisibility,
    toggleFABVisibility,
    updateFABVisibility
};
