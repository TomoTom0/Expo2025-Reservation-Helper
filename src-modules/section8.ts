// 各sectionからのimport
import { init_page, judge_init, judge_entrance_init, init_entrance_page } from './section1';
import { reloadCountdownState } from './section2';
import { createCacheManager } from './section3';
import { setCacheManager, setExternalFunctions } from './section5';
import { 
    getCurrentSelectedCalendarDate, getCurrentTableContent, shouldUpdateMonitorButtons,
    restoreSelectionAfterUpdate, enableAllMonitorButtons,
    updateMainButtonDisplay, selectTimeSlotAndStartReservation, startReloadCountdown,
    resetMonitoringUI, showErrorMessage, tryClickCalendarForTimeSlot, setPageLoadingState,
    disableAllMonitorButtons, restoreFromCache, setCacheManagerForSection6, setEntranceReservationHelper,
    setUpdateMonitoringTargetsDisplay
} from './section6';
import { 
    updateMonitoringTargetsDisplay, createEntranceReservationUI, setCacheManagerForSection7,
    entranceReservationHelper
} from './section7';
import { initTimeSlotMonitoring } from './section4';

// 統一状態管理システムのimport
import { UnifiedStateManager } from './unified-state';

// 型定義のインポート
import type { CacheManager } from '../types/index.js';

// 【8. ページ判定・初期化】
// ============================================================================

// cacheManagerの初期化
const cacheManager: CacheManager = createCacheManager({
    getCurrentSelectedCalendarDateFn: getCurrentSelectedCalendarDate
});

// 統一状態管理システムの初期化
const unifiedStateManager = new UnifiedStateManager();

// ページ初期化時に既存データを移行
const initializeUnifiedStateManager = (): void => {
    try {
        // 既存システムからの状態移行
        unifiedStateManager.migrateFromExisting();
        console.log('✅ 統一状態管理システム初期化完了');
    } catch (error) {
        console.error('⚠️ 統一状態管理システム初期化エラー:', error);
    }
};

// section5、section6、section7にcacheManagerを設定
setCacheManager(cacheManager);
setCacheManagerForSection6(cacheManager);
setCacheManagerForSection7(cacheManager);

// section6に必要な関数を注入
setEntranceReservationHelper(entranceReservationHelper);
setUpdateMonitoringTargetsDisplay(updateMonitoringTargetsDisplay);

// section5.jsに外部関数を注入（showStatusは一時的に除外）
setExternalFunctions({
    getCurrentTableContent,
    shouldUpdateMonitorButtons,
    restoreSelectionAfterUpdate,
    // showStatus, // 内部関数のため一時的に除外
    enableAllMonitorButtons,
    updateMainButtonDisplay,
    updateMonitoringTargetsDisplay,
    disableAllMonitorButtons,
    selectTimeSlotAndStartReservation,
    startReloadCountdown,
    reloadCountdownState,
    resetMonitoringUI,
    showErrorMessage,
    tryClickCalendarForTimeSlot,
    unifiedStateManager // 統一状態管理システムを外部関数に注入
});

// URL判定とページタイプ識別
const identify_page_type = (url: string): string | null => {
    if (url.includes("ticket.expo2025.or.jp/event_search/")) {
        return "pavilion_reservation";
    } else if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
        return "entrance_reservation";
    }
    return null;
}

// ページ遷移時の初期化トリガー
const trigger_init = (url_record: string): void => {
    const page_type = identify_page_type(url_record);
    
    if (page_type === "pavilion_reservation") {
        const interval_judge = setInterval(() => {
            if (judge_init()) {
                clearInterval(interval_judge);
                init_page();
                console.log("ytomo extension loaded (pavilion reservation)");
            }
        }, 500);
    } else if (page_type === "entrance_reservation") {
        const interval_judge = setInterval(() => {
            if (judge_entrance_init()) {
                clearInterval(interval_judge);
                init_entrance_page({
                    setPageLoadingStateFn: setPageLoadingState,
                    createEntranceReservationUIFn: createEntranceReservationUI,
                    initTimeSlotMonitoringFn: initTimeSlotMonitoring,
                    restoreFromCacheFn: restoreFromCache
                });
                
                // 入場予約ページ初期化後に統一状態管理システムを初期化
                setTimeout(() => {
                    initializeUnifiedStateManager();
                }, 1000);
                
                console.log("ytomo extension loaded (entrance reservation)");
            }
        }, 500);
    }
}

try {
    // urlの変更をMutationObserverで監視する
    const url = window.location.href;
    trigger_init(url);

    let url_record = url;
    const observer = new MutationObserver(() => {
        const new_url = window.location.href;
        if (new_url !== url_record) {
            url_record = new_url;
            trigger_init(url_record);
        }
    });
    observer.observe(document, {
        childList: true,
        subtree: true
    });
}
catch (e) {
    // エラー時の処理
    console.error("ytomo extension error", e);
    // alert(e);
}

// TypeScript環境では module.exports は使用しない
// 必要に応じてES6のexportを使用する



