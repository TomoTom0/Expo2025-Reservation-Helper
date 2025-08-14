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
    createCacheManager
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