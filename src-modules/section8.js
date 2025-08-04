// 各sectionからのimport
import { init_page, judge_init, judge_entrance_init, init_entrance_page } from './section1.js';
import { reloadCountdownState } from './section2.js';
import { createCacheManager } from './section3.js';
import { setCacheManager, setExternalFunctions } from './section5.js';
import { 
    getCurrentSelectedCalendarDate, getCurrentTableContent, shouldUpdateMonitorButtons,
    restoreSelectionAfterUpdate, enableAllMonitorButtons,
    updateMainButtonDisplay, selectTimeSlotAndStartReservation, startReloadCountdown,
    resetMonitoringUI, showErrorMessage, tryClickCalendarForTimeSlot, setPageLoadingState,
    disableAllMonitorButtons, restoreFromCache, setCacheManagerForSection6, setEntranceReservationHelper,
    setCanStartReservation
} from './section6.js';
import { 
    updateMonitoringTargetsDisplay, createEntranceReservationUI, setCacheManagerForSection7,
    entranceReservationHelper, canStartReservation
} from './section7.js';
import { initTimeSlotMonitoring } from './section4.js';

// 【8. ページ判定・初期化】
// ============================================================================

// cacheManagerの初期化
const cacheManager = createCacheManager({
    getCurrentSelectedCalendarDateFn: getCurrentSelectedCalendarDate
});

// section5、section6、section7にcacheManagerを設定
setCacheManager(cacheManager);
setCacheManagerForSection6(cacheManager);
setCacheManagerForSection7(cacheManager);

// section6に必要な関数を注入
setEntranceReservationHelper(entranceReservationHelper);
setCanStartReservation(canStartReservation);

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
    tryClickCalendarForTimeSlot
});

// URL判定とページタイプ識別
const identify_page_type = (url) => {
    if (url.includes("ticket.expo2025.or.jp/event_search/")) {
        return "pavilion_reservation";
    } else if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
        return "entrance_reservation";
    }
    return null;
}

// ページ遷移時の初期化トリガー
const trigger_init = (url_record) => {
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

// テスト用エクスポート（Node.js環境でのみ有効）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // パビリオン検索機能
        prepare_filter,
        
        // 時間帯監視機能
        generateUniqueTdSelector,
        getTdPositionInfo,
        findSameTdElement,
        extractTdStatus,
        
        // FAB UI機能
        createEntranceReservationUI,
        updateMainButtonDisplay,
        updateMonitoringTargetsDisplay,
        
        // カレンダー監視機能
        startCalendarWatcher,
        handleCalendarChange,
        getCurrentSelectedCalendarDate,
        
        // キャッシュ機能
        cacheManager,
        
        // 状態管理オブジェクト
        multiTargetManager,
        timeSlotState,
        entranceReservationState,
        calendarWatchState,
        
        // セレクタ定義
        timeSlotSelectors,
        
        // ページ機能
        init_page,
        init_entrance_page,
        identify_page_type,
        trigger_init,
        
        // Unit Test用追加関数 (Phase 1)
        extractTimeSlotInfo,
        getMonitorButtonText,
        getCurrentMode,
        getRandomWaitTime,
        generateSelectorForElement,
        
        // Unit Test用追加関数 (Phase 2)
        generateUniqueTdSelector,
        getTdPositionInfo,
        findSameTdElement,
        extractTdStatus,
        
        // Unit Test用追加関数 (Phase 3)
        checkTimeSlotTableExistsSync,
        validatePageLoaded,
        canStartReservation,
        isInterruptionAllowed,
        checkTimeSlotSelected,
        checkVisitTimeButtonState
    };
}



