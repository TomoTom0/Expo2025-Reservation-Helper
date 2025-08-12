// 各モジュールからのimport
import { init_page, judge_init } from './pavilion-search-page';
import { judge_entrance_init, init_entrance_page } from './entrance-page-init';
import { createFABToggleButton } from './entrance-page-state';
import { createCacheManager } from './cache-manager';
import { setCacheManager } from './entrance-page-core';
import { 
    setPageLoadingState,
    restoreFromCache, setCacheManagerForSection6, setEntranceReservationHelper
} from './entrance-page-core';
import { getCurrentSelectedCalendarDate } from './entrance-page-core';
import { 
    createEntranceReservationUI, setCacheManagerForSection7,
    entranceReservationHelper, waitForTimeSlotTable
} from './entrance-page-fab';
import { initCompanionTicketFeature, initializeTicketSelectionPage, initializeAgentTicketPage } from './companion-ticket-page'; // 同行者追加機能

// 入場予約状態管理システムのimport
import { entranceReservationStateManager } from './entrance-reservation-state-manager';


// 型定義のインポート
import type { CacheManager } from '../types/index.js';

// Window型の拡張（beforeunloadハンドラー削除により不要）

// 【8. ページ判定・初期化】
// ============================================================================

// beforeunloadハンドラーは不要なので削除

// 全FABをクリーンアップする統一関数
function cleanupAllFABs(): void {
    console.log('🧹 全FABをクリーンアップ開始');
    
    const fabSelectors = [
        'ytomo-fab-container',                    // 入場予約FAB
        'ytomo-pavilion-fab-container',           // パビリオンFAB  
        'ytomo-ticket-selection-fab-container'    // チケット選択FAB
    ];
    
    let removedCount = 0;
    
    fabSelectors.forEach(id => {
        const fab = document.getElementById(id);
        if (fab) {
            fab.remove();
            removedCount++;
            console.log(`🗑️ ${id} を削除しました`);
        }
    });
    
    if (removedCount === 0) {
        console.log('🧹 クリーンアップ対象のFABは見つかりませんでした');
    } else {
        console.log(`🧹 FABクリーンアップ完了: ${removedCount}個削除`);
        
        // スマホ向けの追加処理: DOMの確実な更新を待つ
        if (isMobileDevice()) {
            setTimeout(() => {
                // 残存FABの再チェックと強制削除
                fabSelectors.forEach(id => {
                    const remainingFab = document.getElementById(id);
                    if (remainingFab) {
                        remainingFab.style.display = 'none';
                        remainingFab.remove();
                        console.log(`📱 スマホ向け遅延削除: ${id}`);
                    }
                });
            }, 100);
        }
    }
}

// モバイルデバイス判定（簡易版）
function isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
}

// cacheManagerの初期化
const cacheManager: CacheManager = createCacheManager({
    getCurrentSelectedCalendarDateFn: getCurrentSelectedCalendarDate
});

// 入場予約状態管理システムの初期化フラグ
let isUnifiedStateManagerInitialized = false; // 重複初期化防止フラグ

// ページ初期化の重複実行防止
let currentPageType: string | null = null;
let isPageInitializing = false;

// ページ初期化時に既存データを移行
const initializeUnifiedStateManager = (): void => {
    if (isUnifiedStateManagerInitialized) {
        console.log('🔄 入場予約状態管理システムは既に初期化済みです');
        return;
    }
    
    try {
        // 状態管理システム初期化
        isUnifiedStateManagerInitialized = true;
        console.log('✅ 入場予約状態管理システム初期化完了');
    } catch (error) {
        console.error('⚠️ 入場予約状態管理システム初期化エラー:', error);
    }
};

// entrance-page-ui、entrance-page-fabにcacheManagerを設定
setCacheManager(cacheManager);
setCacheManagerForSection6(cacheManager);
setCacheManagerForSection7(cacheManager);

// entrance-page-uiに必要な関数を注入
setEntranceReservationHelper(entranceReservationHelper);

// 依存注入は削除済み - 各モジュールで直接インポートを使用

// URL判定とページタイプ識別
const identify_page_type = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        if (pathname === '/ticket_visiting_reservation/') {
            return "entrance_reservation";
        } else if (pathname === '/event_search/') {
            return "pavilion_reservation";
        } else if (pathname === '/ticket_selection/') {
            return "ticket_selection";
        } else if (pathname === '/agent_ticket/') {
            return "agent_ticket";
        }
    } catch (error) {
        console.error(`URL解析エラー: ${error}`);
    }
    
    return null;
}

// ページ遷移時の初期化トリガー
const trigger_init = (url_record: string): void => {
    const page_type = identify_page_type(url_record);
    
    // 同じページタイプで初期化中の場合はスキップ
    if (currentPageType === page_type && isPageInitializing) {
        return;
    }
    
    // 同じページタイプでもFABが消えている場合は再作成
    if (currentPageType === page_type && !isPageInitializing) {
        if (page_type === 'ticket_selection') {
            const ticketSelectionFab = document.getElementById('ytomo-ticket-selection-fab-container');
            if (!ticketSelectionFab) {
                console.log(`🔄 ${page_type}ページでチケット選択FABが消失しているため再作成します`);
            } else {
                console.log(`✅ ${page_type}ページでチケット選択FABが既に存在します、スキップ`);
                return;
            }
        }
    }
    
    // 前回と異なるページタイプの場合は状態をリセット
    if (currentPageType !== page_type) {
        currentPageType = page_type;
        isPageInitializing = false;
        
        // ページ遷移時に既存のFABボタンをクリーンアップ
        cleanupAllFABs();
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
                    restoreFromCacheFn: restoreFromCache
                });
                
                // 入場予約ページ初期化後に入場予約状態管理システムを初期化（動的待機）
                waitForTimeSlotTable(() => {
                    initializeUnifiedStateManager();
                });
                
                // beforeunloadハンドラーは削除済み
                
                // 必要に応じて状態同期を実行（頻度を下げて負荷軽減）
                setInterval(() => {
                    // 初期化済みの場合はスキップ
                    if (isUnifiedStateManagerInitialized) return;
                    
                    const selectedSlot = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
                    if (selectedSlot && entranceReservationStateManager && !entranceReservationStateManager.hasReservationTarget()) {
                        console.log('🔄 選択状態の後続同期を実行');
                        initializeUnifiedStateManager();
                    }
                }, 5000); // 頻度を2秒から5秒に下げる
                
                isPageInitializing = false;
                console.log("ytomo extension loaded (entrance reservation)");
            }
        }, 500);
    } else if (page_type === "ticket_selection" || page_type === "agent_ticket") {
        if (isPageInitializing) return;
        isPageInitializing = true;
        
        // 同行者追加機能の初期化（DOM準備完了を待機）
        const interval_companion = setInterval(() => {
            if (document.body && (document.readyState === 'complete' || document.readyState === 'interactive')) {
                clearInterval(interval_companion);
                console.log(`🎫 ${page_type}ページを初期化します`);
                // ヘッダートグルボタンを作成
                createFABToggleButton();
                
                // ページタイプ別初期化
                if (page_type === 'ticket_selection') {
                    initializeTicketSelectionPage();
                } else if (page_type === 'agent_ticket') {
                    initializeAgentTicketPage();
                } else {
                    // フォールバック（旧方式）
                    initCompanionTicketFeature();
                }
                isPageInitializing = false;
                console.log(`ytomo extension loaded (${page_type})`);
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

// DOM準備完了を待機してから初期化
function initializeExtension() {
    try {
        // SPA対応: URL変更を複数の方法で監視する
        console.log('🚀 ytomo extension 初期化開始');
        console.log(`🔗 現在のURL: ${window.location.href}`);
        console.log(`🔗 document.readyState: ${document.readyState}`);
        
        const url = window.location.href;
        trigger_init(url);

    let url_record = url;
    
    // 方法1: popstateイベント（ブラウザの戻る/進む）
    window.addEventListener('popstate', () => {
        const new_url = window.location.href;
        if (new_url !== url_record) {
            console.log(`🔄 popstate URL変更検出: ${url_record} -> ${new_url}`);
            url_record = new_url;
            setTimeout(() => trigger_init(url_record), 500);
        }
    });
    
    // 方法2: History APIのpushState/replaceStateを監視
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(state, title, url) {
        console.log(`📍 pushState called:`, arguments);
        originalPushState.apply(history, [state, title, url] as [any, string, string | URL | null | undefined]);
        setTimeout(() => {
            const new_url = window.location.href;
            if (new_url !== url_record) {
                console.log(`🔄 pushState URL変更検出: ${url_record} -> ${new_url}`);
                url_record = new_url;
                setTimeout(() => trigger_init(url_record), 500);
            }
        }, 100);
    };
    
    history.replaceState = function(state, title, url) {
        console.log(`📍 replaceState called:`, arguments);
        originalReplaceState.apply(history, [state, title, url] as [any, string, string | URL | null | undefined]);
        setTimeout(() => {
            const new_url = window.location.href;
            if (new_url !== url_record) {
                console.log(`🔄 replaceState URL変更検出: ${url_record} -> ${new_url}`);
                url_record = new_url;
                setTimeout(() => trigger_init(url_record), 500);
            }
        }, 100);
    };
    
    // 方法3: MutationObserver（DOM変更による補完的な検出）
    const observer = new MutationObserver(() => {
        const new_url = window.location.href;
        if (new_url !== url_record) {
            url_record = new_url;
            trigger_init(url_record);
        }
        
        // ページタイプごとのFABが意図せず削除された場合の自動復旧（サイレント）
        if (window.location.href.includes('ticket_selection')) {
            const ticketSelectionFab = document.getElementById('ytomo-ticket-selection-fab-container');
            if (!ticketSelectionFab) {
                setTimeout(() => trigger_init(window.location.href), 100); // 即座復旧
            }
        }
    });
    observer.observe(document.documentElement, {
        childList: true,
        subtree: true
    });
    
    // 方法4: 定期的なURL監視（フォールバック）
    setInterval(() => {
        const new_url = window.location.href;
        if (new_url !== url_record) {
            url_record = new_url;
            trigger_init(url_record);
        }
        
        // ページタイプごとのFAB存在チェックと自動復旧（定期監視、サイレント）
        if (window.location.href.includes('ticket_selection')) {
            const ticketSelectionFab = document.getElementById('ytomo-ticket-selection-fab-container');
            if (!ticketSelectionFab) {
                trigger_init(window.location.href);
            }
        }
    }, 2000); // 2秒間隔でFABチェック
    
        console.log('👀 SPA対応URL監視設定完了');
    }
    catch (e) {
        // エラー時の処理
        console.error("ytomo extension error", e);
        // alert(e);
    }
}

// 即座に早期オーバーレイをチェック（DOM構築前でも実行可能）

// DOM準備完了を待機して初期化実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
} else {
    // 既に読み込み完了している場合は即座に実行
    initializeExtension();
}

// TypeScript環境では module.exports は使用しない
// 必要に応じてES6のexportを使用する



