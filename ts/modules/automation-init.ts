/**
 * 自動操作エンジンの初期化・自動起動モジュール
 * ページ読み込み時に自動操作が必要かチェックし、必要に応じて実行
 */

import { getPageDetector, resetPageDetector } from './page-detector';
import { getAutomationEngine } from './automation-engine';
import { PavilionReservationCache } from './pavilion-reservation-cache';
import { loggers } from '../utils/logger';
import { PageChecker } from './page-utils';
import { isApiUsageSuppressed } from '../utils/apiUsageMode';

// 初期化状態の管理
let isInitialized = false;
let isAutomationRunning = false;

/**
 * 自動操作エンジンを初期化
 */
function initializeAutomation(): void {
    if (isInitialized) return;

    const logger = loggers.automation;
    
    // 待機室ページでは自動操作エンジンを初期化しない
    if (PageChecker.isWaitingRoomPage()) {
        logger.info('待機室ページのため自動操作エンジン初期化をスキップ');
        isInitialized = true;
        return;
    }
    
    // API利用抑制モードかつytomoページ以外では自動操作エンジンを初期化しない
    if (isApiUsageSuppressed() && !PageChecker.isYtomoPage()) {
        logger.info('API利用抑制モードかつytomoページ以外のため自動操作エンジン初期化をスキップ');
        isInitialized = true;
        return;
    }

    logger.info('自動操作エンジン初期化開始');

    // ページロード完了後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndStartAutomation);
    } else {
        // すでにロード完了している場合は即座に実行
        setTimeout(checkAndStartAutomation, 100);
    }

    // ページ変更時の監視（SPA対応）
    setupPageChangeListener();

    isInitialized = true;
    logger.info('自動操作エンジン初期化完了');
}

/**
 * 自動操作が必要かチェックして開始
 */
async function checkAndStartAutomation(): Promise<void> {
    if (isAutomationRunning) {
        const logger = loggers.automation;
        logger.warn('自動操作は既に実行中');
        return;
    }

    try {
        // ページタイプを検知
        const pageDetector = getPageDetector();
        const pageInfo = pageDetector.extractPageInfo();

        const logger = loggers.automation;
        logger.debug('ページ検知', { type: pageInfo.type, url: pageInfo.url });

        // 自動操作対象ページかチェック
        if (!shouldStartAutomation(pageInfo.type)) {
            logger.debug('ページでは自動操作不要', { pageType: pageInfo.type });
            return;
        }

        // キャッシュにデータがあるかチェック
        const hasReservationData = checkReservationDataAvailable(pageInfo);
        
        if (!hasReservationData) {
            logger.debug('キャッシュに予約データがない');
            return;
        }

        // 自動操作を開始
        await startAutomationSafely();

    } catch (error) {
        const logger = loggers.automation;
        logger.error('自動操作チェックエラー', { error: error instanceof Error ? error.message : String(error) });
    }
}

/**
 * 自動操作を安全に開始
 */
async function startAutomationSafely(): Promise<void> {
    if (isAutomationRunning) return;

    isAutomationRunning = true;
    const logger = loggers.automation;
    logger.info('自動操作開始');

    try {
        const engine = getAutomationEngine({
            enableLogging: true,
            continueOnError: true,
            maxRetries: 3
        });

        const result = await engine.start();
        
        logger.debug('自動操作結果', result);
        
        if (result.status === 'completed') {
            logger.info('自動操作正常完了');
        } else if (result.status === 'failed') {
            logger.warn('自動操作失敗', { errors: result.errors });
        }

    } catch (error) {
        logger.error('自動操作実行エラー', { error: error instanceof Error ? error.message : String(error) });
    } finally {
        isAutomationRunning = false;
    }
}

/**
 * 自動操作を開始すべきかチェック
 */
function shouldStartAutomation(pageType: string): boolean {
    // 予約時間選択ページでのみ自動操作を実行
    return pageType === 'reservation_time';
}

/**
 * 予約データが利用可能かチェック
 */
function checkReservationDataAvailable(pageInfo: any): boolean {
    // パビリオン検索ページは除外
    if (pageInfo.type === 'pavilion_search') {
        return false;
    }

    // 予約時間選択ページの場合、該当パビリオンのデータをチェック
    if (pageInfo.type === 'reservation_time' && pageInfo.pavilionCode) {
        const pavilionData = PavilionReservationCache.getReservationDataByPavilion(pageInfo.pavilionCode);
        const pendingData = pavilionData.filter(data => data.status === 'pending');
        return pendingData.length > 0;
    }

    // 確認ページの場合、処理中のデータをチェック
    if (pageInfo.type === 'confirmation') {
        const processingData = PavilionReservationCache.getProcessingReservation();
        return processingData !== null;
    }

    return false;
}

/**
 * ページ変更監視を設定（SPA対応）
 */
function setupPageChangeListener(): void {
    let currentUrl = window.location.href;

    // URL変更の監視
    const checkUrlChange = () => {
        const newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            currentUrl = newUrl;
            const logger = loggers.automation;
            logger.debug('ページ変更検知', { url: newUrl });
            
            // ページデテクターをリセット
            resetPageDetector();
            
            // 少し待ってから自動操作チェック
            setTimeout(checkAndStartAutomation, 1000);
        }
    };

    // pushState/replaceStateの監視
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function(...args) {
        originalPushState.apply(history, args);
        setTimeout(checkUrlChange, 100);
    };

    history.replaceState = function(...args) {
        originalReplaceState.apply(history, args);
        setTimeout(checkUrlChange, 100);
    };

    // popstateイベントの監視
    window.addEventListener('popstate', () => {
        setTimeout(checkUrlChange, 100);
    });

    // 定期的なURLチェック（フォールバック）
    setInterval(checkUrlChange, 2000);
}

/**
 * デバッグ用: 手動で自動操作を実行
 */
function debugStartAutomation(): void {
    const logger = loggers.automation;
    logger.debug('デバッグ - 手動自動操作開始');
    startAutomationSafely();
}

/**
 * デバッグ用: 現在の状態を確認
 */
function debugAutomationStatus(): void {
    const logger = loggers.automation;
    const pageDetector = getPageDetector();
    const pendingReservations = PavilionReservationCache.getPendingReservations();
    const processingReservation = PavilionReservationCache.getProcessingReservation();
    
    logger.debug('自動操作エンジン状態デバッグ', {
        isInitialized,
        isRunning: isAutomationRunning,
        pageInfo: pageDetector.extractPageInfo(),
        pendingReservations: { count: pendingReservations.length, data: pendingReservations },
        processingReservation
    });
}

// グローバルに公開（デバッグ用）
(window as any).debugStartAutomation = debugStartAutomation;
(window as any).debugAutomationStatus = debugAutomationStatus;

// 自動初期化
initializeAutomation();