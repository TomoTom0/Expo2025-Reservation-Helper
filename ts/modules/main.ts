/**
 * メインエントリーポイント
 * 各sectionモジュールをimportすることで、webpackで統合されたバンドルを作成
 */

import { loggers } from '@/utils/logger';
const logger = loggers.ui;

// すべてのモジュールをimport（副作用importも含む）
import './pavilion-search-page';
import './entrance-page-init';
import './entrance-page-state';
import './cache-manager';
import './entrance-page-dom-utils';
import './entrance-page-core';
import './entrance-page-fab';
import './app-router';
import './companion-ticket-page'; // 同行者追加機能
import './automation-init'; // 自動操作エンジン初期化
import './main-dialog-fab'; // メインダイアログFAB

// 新しい監視・即時予約機能
import './monitoring-scheduler';
import './monitoring-cache';
import './monitoring-service';
import './immediate-reservation';
import './notification-system'; // グローバル通知システム
import './page-return-system'; // ページ復帰システム

// テスト環境・開発環境でのみtest-exportsをimport
// 本番環境では webpack の tree shaking で除外される
if (process.env['NODE_ENV'] === 'development' || process.env['NODE_ENV'] === 'test') {
    import('./test-exports').then(() => {
        logger.info('テスト用exports読み込み完了');
    }).catch(err => {
        logger.warn('テスト用exports読み込み失敗', err);
    });
}

// Vue.js統合は各MainDialogFabで直接実行

// グローバル予約結果通知チェック（すべてのページで動作）
const checkGlobalReservationResult = (): void => {
    try {
        // 失敗通知チェック（既存）
        const failureInfoStr = sessionStorage.getItem('expo_reservation_failure');
        if (failureInfoStr) {
            const failureInfo = JSON.parse(failureInfoStr);
            
            // グローバル通知システムで表示
            if (typeof (window as any).showReservationNotification === 'function') {
                (window as any).showReservationNotification(
                    'error',
                    `予約に失敗しました: ${failureInfo.pavilionName} ${failureInfo.timeDisplay}～（${failureInfo.reason}）`,
                    false // 自動非表示しない
                );
                logger.info('グローバル失敗通知を表示しました');
            }
            
            // 表示完了後、sessionStorageをクリア
            sessionStorage.removeItem('expo_reservation_failure');
        }
        
        // 結果通知チェック（新規）
        const resultInfoStr = sessionStorage.getItem('expo_reservation_result');
        if (resultInfoStr) {
            const resultInfo = JSON.parse(resultInfoStr);
            
            // グローバル通知システムで表示
            if (typeof (window as any).showReservationNotification === 'function') {
                (window as any).showReservationNotification(
                    resultInfo.type,
                    resultInfo.message,
                    false // 自動非表示しない
                );
                logger.info('グローバル結果通知を表示しました', { type: resultInfo.type, message: resultInfo.message });
            }
            
            // 表示完了後、sessionStorageをクリア
            sessionStorage.removeItem('expo_reservation_result');
        }
    } catch (error) {
        logger.error('グローバル結果通知チェックエラー', error);
    }
};

// DOMContentLoaded時にグローバル予約結果通知をチェック
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            checkGlobalReservationResult();
        }, 1000); // グローバル通知システムの初期化を待つ
    });
} else {
    // DOMが既に読み込まれている場合は即座に実行
    setTimeout(() => {
        checkGlobalReservationResult();
    }, 1000);
}
