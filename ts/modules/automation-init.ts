/**
 * 自動操作エンジンの初期化・自動起動モジュール
 * ページ読み込み時に自動操作が必要かチェックし、必要に応じて実行
 */

import { getPageDetector, resetPageDetector } from './page-detector';
import { getAutomationEngine } from './automation-engine';
import { PavilionReservationCache } from './pavilion-reservation-cache';

// 初期化状態の管理
let isInitialized = false;
let isAutomationRunning = false;

/**
 * 自動操作エンジンを初期化
 */
function initializeAutomation(): void {
    if (isInitialized) return;

    console.log('🤖 自動操作エンジン初期化開始');

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
    console.log('✅ 自動操作エンジン初期化完了');
}

/**
 * 自動操作が必要かチェックして開始
 */
async function checkAndStartAutomation(): Promise<void> {
    if (isAutomationRunning) {
        console.log('⏳ 自動操作は既に実行中です');
        return;
    }

    try {
        // ページタイプを検知
        const pageDetector = getPageDetector();
        const pageInfo = pageDetector.extractPageInfo();

        console.log(`📍 ページ検知: ${pageInfo.type} - ${pageInfo.url}`);

        // 自動操作対象ページかチェック
        if (!shouldStartAutomation(pageInfo.type)) {
            console.log(`ℹ️ ${pageInfo.type} ページでは自動操作不要`);
            return;
        }

        // キャッシュにデータがあるかチェック
        const hasReservationData = checkReservationDataAvailable(pageInfo);
        
        if (!hasReservationData) {
            console.log('📋 キャッシュに予約データがありません');
            return;
        }

        // 自動操作を開始
        await startAutomationSafely();

    } catch (error) {
        console.error('❌ 自動操作チェックエラー:', error);
    }
}

/**
 * 自動操作を安全に開始
 */
async function startAutomationSafely(): Promise<void> {
    if (isAutomationRunning) return;

    isAutomationRunning = true;
    console.log('🚀 自動操作開始');

    try {
        const engine = getAutomationEngine({
            enableLogging: true,
            continueOnError: true,
            maxRetries: 3
        });

        const result = await engine.start();
        
        console.log('📊 自動操作結果:', result);
        
        if (result.status === 'completed') {
            console.log('✅ 自動操作正常完了');
        } else if (result.status === 'failed') {
            console.warn('⚠️ 自動操作失敗:', result.errors);
        }

    } catch (error) {
        console.error('❌ 自動操作実行エラー:', error);
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
            console.log('🔄 ページ変更検知:', newUrl);
            
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
    console.log('🔧 デバッグ: 手動自動操作開始');
    startAutomationSafely();
}

/**
 * デバッグ用: 現在の状態を確認
 */
function debugAutomationStatus(): void {
    console.group('🔧 自動操作エンジン状態');
    console.log('初期化済み:', isInitialized);
    console.log('実行中:', isAutomationRunning);
    
    const pageDetector = getPageDetector();
    console.log('ページ情報:', pageDetector.extractPageInfo());
    
    const pendingReservations = PavilionReservationCache.getPendingReservations();
    console.log('待機中予約:', pendingReservations.length, pendingReservations);
    
    const processingReservation = PavilionReservationCache.getProcessingReservation();
    console.log('処理中予約:', processingReservation);
    
    console.groupEnd();
}

// グローバルに公開（デバッグ用）
(window as any).debugStartAutomation = debugStartAutomation;
(window as any).debugAutomationStatus = debugAutomationStatus;

// 自動初期化
initializeAutomation();