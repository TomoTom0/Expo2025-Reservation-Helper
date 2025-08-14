/**
 * Module Interactions Integration Test
 * モジュール間連携の統合テスト
 * 
 * @version v1.0.0
 * @testType Integration
 */

const { TestExports } = require('../../../ts/modules/test-exports');
const { 
    EntranceReservationStateManager, 
    UnifiedAutomationManager,
    ProcessingOverlay,
    AudioPlayer,
    createCacheManager,
    ExecutionState
} = TestExports;

describe('Module Interactions Integration Tests', () => {
    let stateManager;
    let automationManager; 
    let overlay;
    let cacheManager;
    
    beforeEach(() => {
        // フェイクタイマーを設定
        jest.useFakeTimers('modern');
        
        // モジュールインスタンスを作成
        stateManager = new EntranceReservationStateManager();
        automationManager = new UnifiedAutomationManager(stateManager);
        overlay = new ProcessingOverlay();
        cacheManager = createCacheManager();
        
        // テスト用DOM環境を設定
        TestDOMHelper.createTimeSlotTable();
        TestDOMHelper.createCalendar();
        TestDOMHelper.createVisitTimeButton();
        
        // Console出力を抑制
        TestConsole.silence();
    });

    afterEach(() => {
        // クリーンアップ
        try {
            if (jest.isMockFunction(setTimeout)) {
                jest.runOnlyPendingTimers();
            }
        } catch (e) {
            // フェイクタイマーが無効な場合は無視
        }
        jest.useRealTimers();
        
        if (overlay) overlay.destroy();
        TestDOMHelper.cleanup();
        localStorage.clear();
        TestConsole.restore();
    });

    describe('StateManager ↔ UnifiedAutomationManager 連携', () => {
        test('状態管理システムと自動処理管理の基本連携', () => {
            // StateManagerの初期状態確認
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(automationManager.isRunning()).toBe(false);
            expect(automationManager.getCurrentProcess()).toBe('idle');
        });

        test('予約対象設定後の状態連携', () => {
            // 予約対象を設定
            stateManager.setReservationTarget('11:00-', 0, 'tr:nth-child(2) > td:nth-child(1)');
            stateManager.setSelectedCalendarDate('2025-04-15');
            
            // 状態の確認
            expect(stateManager.hasReservationTarget()).toBe(true);
            expect(stateManager.getReservationTarget().timeSlot).toBe('11:00-');
            expect(stateManager.getReservationTarget().locationIndex).toBe(0);
            
            // FAB表示情報の確認
            const displayInfo = stateManager.getFabTargetDisplayInfo();
            expect(displayInfo.hasTarget).toBe(true);
            expect(displayInfo.targetType).toBe('reservation');
            expect(displayInfo.displayText).toContain('4/15');
            expect(displayInfo.displayText).toContain('東11:00-');
        });

        test('実行状態の変更と管理システムの連携', () => {
            // 実行状態を変更
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            
            expect(stateManager.getExecutionState()).toBe(ExecutionState.RESERVATION_RUNNING);
            expect(stateManager.isReservationRunning()).toBe(true);
            
            // 停止処理
            stateManager.stop();
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(stateManager.isReservationRunning()).toBe(false);
        });

        test('中断処理の連携動作', () => {
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            
            // UnifiedAutomationManagerで中断
            automationManager.abort();
            
            // 中断後の状態確認
            expect(automationManager.isRunning()).toBe(false);
        });
    });

    describe('StateManager ↔ ProcessingOverlay 連携', () => {
        test('予約実行時のオーバーレイ表示連携', () => {
            // 予約対象設定
            stateManager.setReservationTarget('11:00-', 0, 'test-selector');
            stateManager.setSelectedCalendarDate('2025-04-15');
            
            // オーバーレイ表示
            overlay.show('reservation');
            
            expect(overlay.isVisible()).toBe(true);
            
            // オーバーレイのメッセージ確認
            const messageText = document.querySelector('.processing-message-text');
            expect(messageText.textContent).toBe('予約実行中...');
        });

        test('同行者処理時のオーバーレイ表示', () => {
            overlay.show('companion');
            
            expect(overlay.isVisible()).toBe(true);
            
            // 同行者用メッセージの確認
            const messageText = document.querySelector('.processing-message-text');
            expect(messageText.textContent).toBe('同行者追加処理実行中...');
            
            // 中断ボタンの確認
            const abortButton = document.getElementById('ytomo-processing-abort-button');
            expect(abortButton).not.toBeNull();
        });

        test('カウントダウン表示とタイミング連携', () => {
            overlay.show('reservation');
            
            // カウントダウン表示
            overlay.updateCountdown('10秒後に予約開始');
            const countdownText = document.querySelector('.processing-countdown-text');
            expect(countdownText.textContent).toBe('10秒後に予約開始');
            
            // 警告カウントダウン
            overlay.updateCountdown('3秒', true);
            expect(countdownText.className).toContain('warning');
            
            // カウントダウンクリア
            overlay.clearCountdown();
            expect(countdownText.textContent).toBe('');
        });
    });

    describe('StateManager ↔ AudioPlayer 連携', () => {
        test('通知音設定とAudioPlayerの連携', () => {
            // 通知音が有効な状態で成功音再生
            expect(stateManager.isNotificationSoundEnabled()).toBe(true);
            
            expect(() => {
                AudioPlayer.playSuccessSound();
            }).not.toThrow();
            
            // 通知音を無効化
            const newState = stateManager.toggleNotificationSound();
            expect(newState).toBe(false);
            expect(stateManager.isNotificationSoundEnabled()).toBe(false);
            
            // 無効状態でも音声再生は可能（制御は別レイヤー）
            expect(() => {
                AudioPlayer.playSuccessSound();
            }).not.toThrow();
        });

        test('予約成功時の音声通知フロー', () => {
            // 予約対象設定
            stateManager.setReservationTarget('11:00-', 0, 'test-selector');
            
            // 予約成功を設定
            stateManager.setReservationSuccess('11:00-', 0);
            
            expect(stateManager.hasReservationSuccess()).toBe(true);
            const success = stateManager.getReservationSuccess();
            expect(success.timeSlot).toBe('11:00-');
            expect(success.locationIndex).toBe(0);
            
            // 音声再生（実際のワークフローでは成功時に自動実行）
            if (stateManager.isNotificationSoundEnabled()) {
                expect(() => {
                    AudioPlayer.playSuccessSound();
                }).not.toThrow();
            }
        });
    });

    describe('StateManager ↔ CacheManager 連携', () => {
        test('予約対象のキャッシュ連携', () => {
            // テスト用のキャッシュデータを作成
            const testCacheData = {
                timeSlot: '14:30-',
                locationIndex: 1,
                selectedDate: '2025-04-15',
                timestamp: Date.now(),
                retryCount: 0
            };
            
            // キャッシュに保存
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(testCacheData)
            );
            
            // キャッシュから読み込み
            const cachedData = cacheManager.loadTargetSlot();
            expect(cachedData).not.toBeNull();
            expect(cachedData.timeSlot).toBe('14:30-');
            expect(cachedData.locationIndex).toBe(1);
            
            // StateManagerにキャッシュデータを適用（手動）
            if (cachedData) {
                stateManager.setReservationTarget(
                    cachedData.timeSlot,
                    cachedData.locationIndex,
                    'cached-selector'
                );
                stateManager.setSelectedCalendarDate(cachedData.selectedDate);
            }
            
            // 適用後の状態確認
            expect(stateManager.hasReservationTarget()).toBe(true);
            const target = stateManager.getReservationTarget();
            expect(target.timeSlot).toBe('14:30-');
            expect(target.locationIndex).toBe(1);
        });

        test('試行回数管理とStateManagerの連携', () => {
            // キャッシュデータ設定
            const testData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                timestamp: Date.now(),
                retryCount: 0
            };
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(testData)
            );
            
            // 試行回数を更新
            cacheManager.updateRetryCount(3);
            
            // 更新されたデータの確認
            const updatedData = cacheManager.loadTargetSlot();
            expect(updatedData.retryCount).toBe(3);
            
            // StateManagerの試行回数と連携
            stateManager.incrementAttempts();
            stateManager.incrementAttempts();
            stateManager.incrementAttempts();
            
            expect(stateManager.getAttempts()).toBe(3);
        });
    });

    describe('複数モジュール統合連携', () => {
        test('完全な予約フロー統合テスト', () => {
            // 1. 初期設定
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(automationManager.getCurrentProcess()).toBe('idle');
            expect(overlay.isVisible()).toBe(false);
            
            // 2. 予約対象設定
            stateManager.setReservationTarget('11:00-', 0, 'test-selector');
            stateManager.setSelectedCalendarDate('2025-04-15');
            
            expect(stateManager.hasReservationTarget()).toBe(true);
            
            // 3. オーバーレイ表示
            overlay.show('reservation');
            expect(overlay.isVisible()).toBe(true);
            
            // 4. 実行状態変更
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            expect(stateManager.isReservationRunning()).toBe(true);
            
            // 5. カウントダウン表示
            overlay.updateCountdown('予約開始まで5秒');
            const countdownText = document.querySelector('.processing-countdown-text');
            expect(countdownText.textContent).toBe('予約開始まで5秒');
            
            // 6. 予約成功
            stateManager.setReservationSuccess('11:00-', 0);
            
            expect(stateManager.hasReservationSuccess()).toBe(true);
            expect(stateManager.hasReservationTarget()).toBe(false); // 成功時にクリア
            
            // 7. 成功音再生
            if (stateManager.isNotificationSoundEnabled()) {
                expect(() => AudioPlayer.playSuccessSound()).not.toThrow();
            }
            
            // 8. 停止・クリーンアップ
            stateManager.stop();
            overlay.clearCountdown();
            overlay.hide();
            
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(overlay.isVisible()).toBe(false);
        });

        test('エラー処理と復旧の統合フロー', () => {
            // 1. 予約対象設定
            stateManager.setReservationTarget('11:00-', 0, 'test-selector');
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            overlay.show('reservation');
            
            // 2. エラー発生シミュレーション
            try {
                throw new Error('Network error');
            } catch (error) {
                // エラーログ
                console.error('予約処理エラー:', error);
            }
            
            // 3. 停止処理
            automationManager.abort();
            stateManager.stop();
            overlay.hide();
            
            // 4. 状態復旧確認
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(automationManager.isRunning()).toBe(false);
            expect(overlay.isVisible()).toBe(false);
            
            // 5. 予約対象は保持される
            expect(stateManager.hasReservationTarget()).toBe(true);
        });
    });

    describe('パフォーマンス・メモリ管理統合', () => {
        test('連続実行時のメモリリーク防止', () => {
            // 複数回の実行サイクル
            for (let i = 0; i < 5; i++) {
                // 設定
                stateManager.setReservationTarget(`${10 + i}:00-`, 0, `selector-${i}`);
                overlay.show('reservation');
                stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
                
                // カウントダウン
                overlay.updateCountdown(`テスト${i + 1}回目`);
                
                // クリーンアップ
                overlay.clearCountdown();
                overlay.hide();
                stateManager.stop();
                stateManager.clearReservationTarget();
            }
            
            // 最終状態確認
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(stateManager.hasReservationTarget()).toBe(false);
            expect(overlay.isVisible()).toBe(false);
        });

        test('DOM要素の適切なクリーンアップ', () => {
            // 複数のオーバーレイ作成・破棄
            const overlays = [];
            
            for (let i = 0; i < 3; i++) {
                const newOverlay = new ProcessingOverlay();
                newOverlay.show('reservation');
                overlays.push(newOverlay);
            }
            
            // 全て破棄
            overlays.forEach(ov => ov.destroy());
            
            // DOM要素が適切にクリーンアップされていることを確認
            const remainingOverlays = document.querySelectorAll('[id*="ytomo-processing-overlay"]');
            expect(remainingOverlays.length).toBeLessThanOrEqual(1); // 元のoverlayのみ
        });
    });
});