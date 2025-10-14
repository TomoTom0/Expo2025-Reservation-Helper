/**
 * アプリケーションルーター - App Router
 * 
 * 【責務】
 * - URLベースのページタイプ判定と適切なモジュール初期化
 * - 統一キャッシュ管理システムの初期化・依存注入
 * - FAB UIのライフサイクル管理（作成・クリーンアップ）
 * - ページ遷移時の状態管理システム同期
 * 
 * 【アーキテクチャ】
 * - シングルトンエントリーポイント: main.tsから呼び出される
 * - 依存注入パターン: 各モジュールにキャッシュ管理を注入
 * - ライフサイクル管理: URL変更検知でページ移行を追跡
 * 
 * @version v1.0.0 - 統一状態管理版
 * @architecture Module Router with Dependency Injection
 */

// ==================== モジュールインポート ====================
// パビリオン検索ページモジュール
import { init_page, judge_init } from './pavilion-search-page';
// 入場予約ページ初期化モジュール
import { judge_entrance_init, init_entrance_page } from './entrance-page-init';
// キャッシュ管理システム
import { createCacheManager } from './cache-manager';
import { setCacheManager } from './entrance-page-core';
import { 
    setPageLoadingState,                   // ページ読み込み状態設定
    restoreFromCache,                      // キャッシュからの状態復元
    setCacheManagerForSection6,            // Section 6へのキャッシュ管理注入
    setEntranceReservationHelper           // 予約ヘルパー設定
} from './entrance-page-core';
import { getCurrentSelectedCalendarDate } from './entrance-page-core'; // カレンダー日付取得
import { 
    createEntranceReservationUI,           // 入場予約FAB UI作成
    setCacheManagerForSection7,            // Section 7へのキャッシュ管理注入
    entranceReservationHelper,             // 予約ヘルパーメイン処理
    waitForTimeSlotTable                   // 時間帯テーブル待機
} from './entrance-page-fab';
// 同行者チケット機能モジュール
import { 
    initCompanionTicketFeature,            // 同行者機能初期化
    initializeTicketSelectionPage,         // チケット選択ページ初期化
    initializeAgentTicketPage              // 代理チケットページ初期化
} from './companion-ticket-page';

// メインダイアログFABモジュール
import { initializeMainDialogFab } from './main-dialog-fab';

// 待機室ページモジュール
import { judge_waiting_room_init, init_waiting_room_page } from './waiting-room-page';

// /ytomoメニュー拡張機能
import { initializeYtomoMenuEnhancer } from './ytomo-menu-enhancer';

// 統一状態管理システム（アプリケーションの中核）
import { entranceReservationStateManager } from './entrance-reservation-state-manager';

// TypeScript型定義
import type { CacheManager } from '../types/index.js';
import { loggers } from '../utils/logger';
const logger = loggers.ui;

// ==================== グローバル変数・型定義 ====================

// ============================================================================
// メインアプリケーションルーターシステム - Section 8
// 【機能】
// - URLベースのページタイプ判定・モジュールルーティング
// - 統一キャッシュ管理システムの初期化・依存注入
// - ページ遷移時のFAB UIライフサイクル管理
// - モバイル対応のクリーンアップ処理
// ============================================================================

/**
 * 全FABをクリーンアップする統一関数
 * ページ遷移時に既存FABを削除してUI競合を防止
 * 
 * 【削除対象】
 * - ytomo-fab-container: 入場予約FAB
 * - ytomo-pavilion-fab-container: パビリオン検索FAB  
 * - ytomo-ticket-selection-fab-container: チケット選択FAB
 */
function cleanupAllFABs(): void {
    logger.debug('全FABクリーンアップ開始 - ページ遷移時のUI競合防止');
    
    // クリーンアップ対象のFAB IDリスト
    const fabSelectors = [
        'ytomo-fab-container',                    // 入場予約メインFAB
        'ytomo-pavilion-fab-container',           // パビリオン検索FAB  
        'ytomo-ticket-selection-fab-container'    // 同行者チケット選択FAB
    ];
    
    let removedCount = 0;
    
    fabSelectors.forEach(id => {
        const fab = document.getElementById(id);
        if (fab) {
            fab.remove();
            removedCount++;
            logger.debug('FAB削除', { id });
        }
    });
    
    if (removedCount === 0) {
        logger.debug('クリーンアップ対象のFABは見つかりませんでした');
    } else {
        logger.debug('FABクリーンアップ完了', { removedCount });
        
        // スマホ向けの追加処理: DOMの確実な更新を待つ
        if (isMobileDevice()) {
            setTimeout(() => {
                // 残存FABの再チェックと強制削除
                fabSelectors.forEach(id => {
                    const remainingFab = document.getElementById(id);
                    if (remainingFab) {
                        remainingFab.style.display = 'none';
                        remainingFab.remove();
                        logger.debug('スマホ向け遅延削除', { id });
                    }
                });
            }, 100);
        }
    }
}

/**
 * モバイルデバイス判定（簡易版）
 * UserAgentと画面幅の組み合わせでモバイル環境を検知
 * 
 * 【用途】
 * - モバイル対応の遅延処理（DOM更新のタイミング調整）
 * - UIレスポンシブ対応の切り替え
 * 
 * @returns true:モバイルデバイス、false:デスクトップ
 */
function isMobileDevice(): boolean {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768); // タブレットサイズ以下をモバイル扱い
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
        logger.debug('入場予約状態管理システムは既に初期化済みです');
        return;
    }
    
    try {
        // 状態管理システム初期化
        isUnifiedStateManagerInitialized = true;
        logger.info('入場予約状態管理システム初期化完了');
    } catch (error) {
        logger.error('入場予約状態管理システム初期化エラー', { error });
    }
};

// entrance-page-ui、entrance-page-fabにcacheManagerを設定
setCacheManager(cacheManager);
setCacheManagerForSection6(cacheManager);
setCacheManagerForSection7(cacheManager);

// entrance-page-uiに必要な関数を注入
setEntranceReservationHelper(entranceReservationHelper);

// 各モジュールで直接インポートを使用

import { PageChecker } from './page-utils';

// ページ遷移時の初期化トリガー
const trigger_init = (url_record: string): void => {
    // PageCheckerを使用してページタイプを判定
    const current_page_type = PageChecker.getPageType(url_record);

    // 同じページタイプで初期化中の場合はスキップ
    if (currentPageType === current_page_type && isPageInitializing) {
        return;
    }

    // 同じページタイプでもFABが消えている場合は再作成
    if (currentPageType === current_page_type && !isPageInitializing) {
        if (current_page_type === 'ticket_selection') {
            const ticketSelectionFab = document.getElementById('ytomo-ticket-selection-fab-container');
            if (!ticketSelectionFab) {
                logger.debug('チケット選択FABが消失しているため再作成', { page_type: current_page_type });
            } else {
                logger.debug('チケット選択FABが既に存在します、スキップ', { page_type: current_page_type });
                return;
            }
        }
    }

    // 前回と異なるページタイプの場合は状態をリセット
    if (currentPageType !== current_page_type) {
        currentPageType = current_page_type;
        isPageInitializing = false;

        // ページ遷移時に既存のFABボタンをクリーンアップ
        cleanupAllFABs();
    }

    if (current_page_type === "pavilion_reservation") {
        if (isPageInitializing) return;
        isPageInitializing = true;
        
        const interval_judge = setInterval(() => {
            if (judge_init()) {
                clearInterval(interval_judge);
                init_page();
                isPageInitializing = false;
                logger.info('ytomo extension loaded (pavilion reservation)');
            }
        }, 500);
    } else if (current_page_type === "entrance_reservation") {
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
                
                
                // 必要に応じて状態同期を実行（頻度を下げて負荷軽減）
                setInterval(() => {
                    // 初期化済みの場合はスキップ
                    if (isUnifiedStateManagerInitialized) return;
                    
                    const selectedSlot = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
                    if (selectedSlot && entranceReservationStateManager && !entranceReservationStateManager.hasReservationTarget()) {
                        logger.debug('選択状態の後続同期を実行');
                        initializeUnifiedStateManager();
                    }
                }, 5000); // 頻度を2秒から5秒に下げる
                
                isPageInitializing = false;
                logger.info('ytomo extension loaded (entrance reservation)');
            }
        }, 500);
    } else if (current_page_type === "ticket_selection" || current_page_type === "agent_ticket") {
        if (isPageInitializing) return;
        isPageInitializing = true;
        
        // 同行者追加機能の初期化（DOM準備完了を待機）
        const interval_companion = setInterval(() => {
            if (document.body && (document.readyState === 'complete' || document.readyState === 'interactive')) {
                clearInterval(interval_companion);
                logger.info('ページを初期化', { page_type: current_page_type });

                // ページタイプ別初期化
                if (current_page_type === 'ticket_selection') {
                    initializeTicketSelectionPage();
                } else if (current_page_type === 'agent_ticket') {
                    initializeAgentTicketPage();
                } else {
                    // フォールバック（旧方式）
                    initCompanionTicketFeature();
                }
                isPageInitializing = false;
                logger.info('ytomo extension loaded', { page_type: current_page_type });
            }
        }, 500);
    } else if (current_page_type === "waiting_room") {
        if (isPageInitializing) return;
        isPageInitializing = true;
        
        // 待機室ページの初期化（DOM準備完了を待機）
        const interval_waiting_room = setInterval(() => {
            if (judge_waiting_room_init()) {
                clearInterval(interval_waiting_room);
                init_waiting_room_page();
                isPageInitializing = false;
                logger.info('ytomo extension loaded (waiting room)');
            }
        }, 500);
    } else {
        // 対象外のページの場合はログ出力のみ
        logger.debug('対象外ページ', { url_record });
        logger.debug('ytomo extension: no action needed for this page');
        currentPageType = null;
        isPageInitializing = false;
    }
}

// DOM準備完了を待機してから初期化
function initializeExtension() {
    try {
        // SPA対応: URL変更を複数の方法で監視する
        logger.info('ytomo extension 初期化開始');
        logger.debug('現在のURL', { url: window.location.href });
        logger.debug('document.readyState', { readyState: document.readyState });
        
        const url = window.location.href;
        trigger_init(url);

        // メインダイアログFAB初期化（全ページ共通）
        initializeMainDialogFab();
        
        // /ytomoメニュー拡張機能初期化（通常ページ共通）
        if (url.includes('ticket.expo2025.or.jp')) {
            initializeYtomoMenuEnhancer();
        }

    let url_record = url;
    
    // 方法1: popstateイベント（ブラウザの戻る/進む）
    window.addEventListener('popstate', () => {
        const new_url = window.location.href;
        if (new_url !== url_record) {
            logger.debug('popstate URL変更検出', { oldUrl: url_record, newUrl: new_url });
            url_record = new_url;
            setTimeout(() => trigger_init(url_record), 500);
        }
    });
    
    // 方法2: History APIのpushState/replaceStateを監視
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(state, title, url) {
        logger.debug('pushState called', { arguments });
        originalPushState.apply(history, [state, title, url] as [any, string, string | URL | null | undefined]);
        setTimeout(() => {
            const new_url = window.location.href;
            if (new_url !== url_record) {
                logger.debug('pushState URL変更検出', { oldUrl: url_record, newUrl: new_url });
                url_record = new_url;
                setTimeout(() => trigger_init(url_record), 500);
            }
        }, 100);
    };
    
    history.replaceState = function(state, title, url) {
        logger.debug('replaceState called', { arguments });
        originalReplaceState.apply(history, [state, title, url] as [any, string, string | URL | null | undefined]);
        setTimeout(() => {
            const new_url = window.location.href;
            if (new_url !== url_record) {
                logger.debug('replaceState URL変更検出', { oldUrl: url_record, newUrl: new_url });
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
    
        logger.info('SPA対応URL監視設定完了');
    }
    catch (e) {
        // エラー時の処理
        logger.error('ytomo extension error', { error: e });
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



