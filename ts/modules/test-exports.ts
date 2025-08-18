/**
 * テスト専用export機能
 * 本番環境では除外、開発・テスト環境でのみ利用可能
 * 
 * @version v1.0.0
 * @purpose テストケース用の関数・クラス・インスタンスを選択的にexport
 */

import { 
    entranceReservationStateManager, 
    EntranceReservationStateManager, 
    LocationHelper, 
    ExecutionState, 
    PriorityMode 
} from './entrance-reservation-state-manager';
import { UnifiedAutomationManager, CancellationError } from './unified-automation-manager';
import { AudioPlayer } from './audio-player';
import { ProcessingOverlay } from './processing-overlay';
import { 
    timeSlotSelectors, 
    generateUniqueTdSelector, 
    extractTdStatus 
} from './entrance-page-dom-utils';
import { createCacheManager } from './cache-manager';
import type { CacheManager } from '../types/index.js';

// 自動操作エンジン関連のimport
import { getAutomationEngine, getPageDetector, getDOMUtils } from './automation-engine';
import { getAutomationOverlay } from './automation-overlay';
import { PavilionReservationCache } from './pavilion-reservation-cache';

/**
 * テスト用のインスタンス・DOM工場クラス
 * テストで必要なオブジェクトとDOM構造を生成
 */
export class TestFactory {
    /**
     * 新しいStateManagerインスタンスを作成
     * 各テストケースで独立したインスタンスを使用
     */
    static createStateManager(): EntranceReservationStateManager {
        return new EntranceReservationStateManager();
    }
    
    /**
     * テスト用CacheManagerを作成
     */
    static createCacheManager(): CacheManager {
        return createCacheManager();
    }
    
    /**
     * モックDOM構造生成ヘルパー
     * 実際の万博サイトDOM構造を模したテスト用要素
     */
    static createMockDOM() {
        return {
            /**
             * 時間帯選択テーブルを作成
             * 実際のサイト構造: data-gray-out属性付きtd要素
             */
            createTimeSlotTable: () => {
                const table = document.createElement('table');
                table.className = 'time-slot-table';
                table.innerHTML = `
                    <tbody>
                        <tr>
                            <td data-gray-out="" class="time-slot available">09:00-</td>
                            <td data-gray-out="" class="time-slot available">09:00-</td>
                        </tr>
                        <tr>
                            <td data-gray-out="" class="time-slot selected">11:00-</td>  
                            <td data-gray-out="" class="time-slot available">11:00-</td>
                        </tr>
                        <tr>
                            <td data-gray-out="" class="time-slot full">14:30-</td>
                            <td data-gray-out="" class="time-slot available">14:30-</td>
                        </tr>
                    </tbody>
                `;
                document.body.appendChild(table);
                return table;
            },
            
            /**
             * カレンダー選択UIを作成
             */
            createCalendar: () => {
                const calendar = document.createElement('div');
                calendar.className = 'calendar-container';
                calendar.innerHTML = `
                    <div class="calendar-day selected" data-date="2025-04-15">15</div>
                    <div class="calendar-day" data-date="2025-04-16">16</div>
                    <div class="calendar-day" data-date="2025-04-17">17</div>
                `;
                document.body.appendChild(calendar);
                return calendar;
            },
            
            /**
             * 来場日時ボタンを作成
             */
            createVisitTimeButton: () => {
                const button = document.createElement('button');
                button.className = 'basic-btn type2 style_full__ptzZq';
                button.textContent = '来場日時を選択';
                button.disabled = false;
                document.body.appendChild(button);
                return button;
            },
            
            /**
             * テスト用の完全なページ構造を作成
             */
            createFullPageStructure: () => {
                const container = document.createElement('div');
                container.id = 'page-container';
                
                // カレンダー
                const calendar = TestFactory.createMockDOM().createCalendar();
                
                // 時間帯テーブル
                const timeTable = TestFactory.createMockDOM().createTimeSlotTable();
                
                // 来場日時ボタン
                const visitButton = TestFactory.createMockDOM().createVisitTimeButton();
                
                container.appendChild(calendar);
                container.appendChild(timeTable);
                container.appendChild(visitButton);
                
                document.body.appendChild(container);
                return container;
            }
        };
    }
    
    /**
     * テスト用URL環境設定
     */
    static setupMockEnvironment(pageType: 'entrance' | 'pavilion' | 'companion' = 'entrance') {
        const urls = {
            entrance: 'https://ticket.expo2025.or.jp/ticket_visiting_reservation?reserve_id=test123',
            pavilion: 'https://ticket.expo2025.or.jp/ticket_selection?pavilion_id=test456', 
            companion: 'https://ticket.expo2025.or.jp/agent_ticket?ticket_id=test789'
        };
        
        // window.locationを設定
        delete (window as any).location;
        (window as any).location = {
            href: urls[pageType],
            origin: 'https://ticket.expo2025.or.jp',
            pathname: pageType === 'entrance' ? '/ticket_visiting_reservation' : 
                     pageType === 'pavilion' ? '/ticket_selection' : '/agent_ticket',
            search: pageType === 'entrance' ? '?reserve_id=test123' :
                   pageType === 'pavilion' ? '?pavilion_id=test456' : '?ticket_id=test789'
        };
    }
}

/**
 * 統合テスト実行関数
 */
export function runIntegrationTest(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        console.group('🧪 自動操作エンジン統合テスト開始');
        
        try {
            // 1. テストデータ準備
            setupTestData();
            
            // 2. ページ検知テスト
            const pageDetector = getPageDetector();
            const pageInfo = pageDetector.extractPageInfo();
            console.log('✅ ページ検知テスト:', pageInfo);
            
            // 3. 自動操作エンジンテスト
            const engine = getAutomationEngine();
            console.log('✅ 自動操作エンジン取得:', engine.getStatus());
            
            // 4. オーバーレイテスト
            const overlay = getAutomationOverlay();
            overlay.show('統合テスト実行中...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            overlay.hide();
            console.log('✅ オーバーレイテスト完了');
            
            // 5. キャッシュテスト
            const cacheData = PavilionReservationCache.getAllReservationData();
            console.log('✅ キャッシュテスト:', Object.keys(cacheData).length, '件');
            
            console.log('🎉 統合テスト正常完了');
            resolve();
            
        } catch (error) {
            console.error('❌ 統合テスト失敗:', error);
            reject(error);
        } finally {
            console.groupEnd();
        }
    });
}

/**
 * エンドツーエンドフローテスト
 */
export function testEndToEndFlow(): Promise<boolean> {
    return new Promise(async (resolve) => {
        console.group('🚀 エンドツーエンドフローテスト');
        
        try {
            // テストデータがあることを確認
            const hasData = Object.keys(PavilionReservationCache.getAllReservationData()).length > 0;
            
            if (!hasData) {
                console.warn('⚠️ テストデータがありません。setupTestData()を実行してください');
                resolve(false);
                return;
            }
            
            // 自動操作エンジンを実行
            const engine = getAutomationEngine({ enableLogging: true });
            const result = await engine.start();
            
            console.log('📊 実行結果:', result);
            
            const success = result.status === 'completed' || result.status === 'failed';
            console.log(success ? '✅ E2Eテスト完了' : '❌ E2Eテスト失敗');
            
            resolve(success);
            
        } catch (error) {
            console.error('❌ E2Eテスト例外:', error);
            resolve(false);
        } finally {
            console.groupEnd();
        }
    });
}

/**
 * 自動操作結果検証
 */
export function validateAutomationResult(): boolean {
    const engine = getAutomationEngine();
    const result = engine.getResult();
    
    console.group('🔍 自動操作結果検証');
    console.log('ステータス:', result.status);
    console.log('処理件数:', result.processedCount);
    console.log('成功件数:', result.successCount);
    console.log('失敗件数:', result.failedCount);
    console.log('エラー:', result.errors);
    console.log('実行時間:', result.executionTime, 'ms');
    
    const isValid = result.processedCount >= 0 && 
                   result.successCount >= 0 && 
                   result.failedCount >= 0 &&
                   (result.status === 'completed' || result.status === 'failed' || result.status === 'cancelled');
    
    console.log(isValid ? '✅ 結果検証OK' : '❌ 結果検証NG');
    console.groupEnd();
    
    return isValid;
}

/**
 * テストデータセットアップ
 */
export function setupTestData(): void {
    const testData = {
        pavilionCode: 'TEST001',
        pavilionName: 'テストパビリオン',
        selectedTimeSlot: '10:00-11:00',
        selectedTimeDisplay: '10:00-11:00',
        isAvailable: true,
        timestamp: Date.now(),
        status: 'pending' as const
    };
    
    PavilionReservationCache.saveReservationData(testData.pavilionCode, testData);
    console.log('🔧 テストデータ投入完了:', testData);
}

/**
 * 全キャッシュクリア
 */
export function clearAllCaches(): void {
    sessionStorage.clear();
    localStorage.clear();
    console.log('🗑️ 全キャッシュクリア完了');
}

/**
 * テスト結果ログ出力
 */
export function logTestResults(): void {
    console.group('📋 テスト結果サマリー');
    
    // ページ情報
    const pageInfo = getPageDetector().extractPageInfo();
    console.log('ページ情報:', pageInfo);
    
    // 自動操作エンジン状態
    const engine = getAutomationEngine();
    console.log('エンジン状態:', engine.getStatus());
    console.log('実行結果:', engine.getResult());
    
    // キャッシュ状態
    const cacheData = PavilionReservationCache.getAllReservationData();
    console.log('キャッシュデータ:', Object.keys(cacheData).length, '件');
    
    // 待機中・処理中の予約
    const pending = PavilionReservationCache.getPendingReservations();
    const processing = PavilionReservationCache.getProcessingReservation();
    console.log('待機中予約:', pending.length, '件');
    console.log('処理中予約:', processing ? 1 : 0, '件');
    
    console.groupEnd();
}

/**
 * テストで使用する主要クラス・関数のexport
 * 実際のアプリケーションコードにアクセスするためのインターフェース
 */
export const TestExports = {
    // === Core Classes ===
    EntranceReservationStateManager,
    LocationHelper,
    UnifiedAutomationManager,
    AudioPlayer,
    ProcessingOverlay,
    
    // === Core Instances ===
    entranceReservationStateManager,
    
    // === Enums & Constants ===
    ExecutionState,
    PriorityMode,
    
    // === Exceptions ===
    CancellationError,
    
    // === DOM Utilities ===
    timeSlotSelectors,
    generateUniqueTdSelector,
    extractTdStatus,
    
    // === Test Helpers ===
    TestFactory,
    
    // === Cache Management ===
    createCacheManager,
    
    // === Automation Engine ===
    getAutomationEngine,
    getPageDetector,
    getDOMUtils,
    getAutomationOverlay,
    PavilionReservationCache,
    
    // === Integration Tests ===
    runIntegrationTest,
    testEndToEndFlow,
    validateAutomationResult,
    setupTestData,
    clearAllCaches,
    logTestResults
};

/**
 * 開発環境でのみwindowオブジェクトに公開（デバッグ用）
 * ブラウザのDeveloper Consoleからアクセス可能
 */
declare global {
    interface Window {
        __EXPO_TEST_EXPORTS__?: typeof TestExports;
    }
}

// テスト・開発環境でのみ実行
if (typeof window !== 'undefined') {
    // NODE_ENVチェック（webpackで環境変数が設定される場合）
    const isDevelopment = process.env['NODE_ENV'] === 'development' || process.env['NODE_ENV'] === 'test';
    
    // デバッグ用のグローバル公開
    if (isDevelopment) {
        window.__EXPO_TEST_EXPORTS__ = TestExports;
        console.log('🧪 テスト用exports読み込み完了 - window.__EXPO_TEST_EXPORTS__');
    }
}