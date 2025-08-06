// 各sectionからのimport
import { init_page, judge_init, judge_entrance_init, init_entrance_page } from './section1';
import { reloadCountdownState } from './section2';
import { createCacheManager } from './section3';
import { setCacheManager, setExternalFunctions } from './section5';
import { 
    getCurrentSelectedCalendarDate, getCurrentTableContent, shouldUpdateMonitorButtons,
    restoreSelectionAfterUpdate, enableAllMonitorButtons,
    updateMainButtonDisplay, selectTimeSlotAndStartReservation, scheduleReload, startReloadCountdown,
    stopReloadCountdown, resetMonitoringUI, showErrorMessage, tryClickCalendarForTimeSlot, setPageLoadingState,
    disableAllMonitorButtons, restoreFromCache, setCacheManagerForSection6, setEntranceReservationHelper,
    setUpdateMonitoringTargetsDisplay
} from './section6';
import { 
    updateMonitoringTargetsDisplay, createEntranceReservationUI, setCacheManagerForSection7,
    entranceReservationHelper, waitForTimeSlotTable
} from './section7';
import { initTimeSlotMonitoring } from './section4';

// 統一状態管理システムのimport
import { UnifiedStateManager } from './unified-state';

// 型定義のインポート
import type { CacheManager } from '../types/index.js';

// Window型の拡張（beforeunloadハンドラー削除により不要）

// 【8. ページ判定・初期化】
// ============================================================================

// beforeunloadハンドラーは不要なので削除

// cacheManagerの初期化
const cacheManager: CacheManager = createCacheManager({
    getCurrentSelectedCalendarDateFn: getCurrentSelectedCalendarDate
});

// 統一状態管理システムの初期化
const unifiedStateManager = new UnifiedStateManager();
let isUnifiedStateManagerInitialized = false; // 重複初期化防止フラグ

// ページ初期化の重複実行防止
let currentPageType: string | null = null;
let isPageInitializing = false;

// ページ初期化時に既存データを移行
const initializeUnifiedStateManager = (): void => {
    if (isUnifiedStateManagerInitialized) {
        console.log('🔄 統一状態管理システムは既に初期化済みです');
        return;
    }
    
    try {
        // 既存システムからの状態移行
        unifiedStateManager.migrateFromExisting();
        isUnifiedStateManagerInitialized = true;
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
    scheduleReload,
    startReloadCountdown,
    stopReloadCountdown,
    reloadCountdownState,
    resetMonitoringUI,
    showErrorMessage,
    tryClickCalendarForTimeSlot,
    unifiedStateManager // 統一状態管理システムを外部関数に注入
});

// URL判定とページタイプ識別
const identify_page_type = (url: string): string | null => {
    console.log(`🔍 ページタイプ識別中: ${url}`);
    
    // より厳密なURL判定
    if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
        console.log(`✅ 入場予約ページとして識別`);
        return "entrance_reservation";
    } else if (url.includes("ticket.expo2025.or.jp/event_search/")) {
        console.log(`✅ パビリオン予約ページとして識別`);
        return "pavilion_reservation";
    }
    
    console.log(`❌ 対象外ページ`);
    return null;
}

// ページ遷移時の初期化トリガー
const trigger_init = (url_record: string): void => {
    const page_type = identify_page_type(url_record);
    
    // 同じページタイプで初期化中の場合はスキップ
    if (currentPageType === page_type && isPageInitializing) {
        console.log(`⏸️ 同じページタイプ (${page_type}) で初期化中のためスキップします`);
        return;
    }
    
    // 前回と異なるページタイプの場合は状態をリセット
    if (currentPageType !== page_type) {
        console.log(`🔄 ページタイプ変更: ${currentPageType} -> ${page_type}`);
        currentPageType = page_type;
        isPageInitializing = false;
        
        // ページ遷移時に既存のFABボタンをクリーンアップ
        const existingFab = document.getElementById('ytomo-fab-container');
        if (existingFab) {
            existingFab.remove();
            console.log('🗑️ ページ遷移により既存の入場予約FABボタンを削除しました');
        }
        
        const existingPavilionFab = document.getElementById('ytomo-pavilion-fab-container');
        if (existingPavilionFab) {
            existingPavilionFab.remove();
            console.log('🗑️ ページ遷移により既存のパビリオンFABボタンを削除しました');
        }
    }
    
    if (page_type === "pavilion_reservation") {
        if (isPageInitializing) return;
        isPageInitializing = true;
        
        const interval_judge = setInterval(() => {
            if (judge_init()) {
                clearInterval(interval_judge);
                init_page();
                isPageInitializing = false;
                console.log("ytomo extension loaded (pavilion reservation)");
            }
        }, 500);
    } else if (page_type === "entrance_reservation") {
        if (isPageInitializing) return;
        isPageInitializing = true;
        
        const interval_judge = setInterval(() => {
            if (judge_entrance_init()) {
                clearInterval(interval_judge);
                init_entrance_page({
                    setPageLoadingStateFn: setPageLoadingState,
                    createEntranceReservationUIFn: createEntranceReservationUI,
                    initTimeSlotMonitoringFn: initTimeSlotMonitoring,
                    restoreFromCacheFn: restoreFromCache
                });
                
                // 入場予約ページ初期化後に統一状態管理システムを初期化（動的待機）
                waitForTimeSlotTable(() => {
                    initializeUnifiedStateManager();
                });
                
                // beforeunloadハンドラーは削除済み
                
                // 必要に応じて状態同期を実行（頻度を下げて負荷軽減）
                setInterval(() => {
                    // 初期化済みの場合はスキップ
                    if (isUnifiedStateManagerInitialized) return;
                    
                    const selectedSlot = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
                    if (selectedSlot && unifiedStateManager && !unifiedStateManager.hasReservationTarget()) {
                        console.log('🔄 選択状態の後続同期を実行');
                        initializeUnifiedStateManager();
                    }
                }, 5000); // 頻度を2秒から5秒に下げる
                
                isPageInitializing = false;
                console.log("ytomo extension loaded (entrance reservation)");
            }
        }, 500);
    } else {
        // 対象外のページの場合はログ出力のみ
        console.log(`🔍 対象外ページ: ${url_record}`);
        console.log("ytomo extension: no action needed for this page");
        currentPageType = null;
        isPageInitializing = false;
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



