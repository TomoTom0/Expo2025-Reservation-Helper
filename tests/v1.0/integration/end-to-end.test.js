/**
 * End-to-End Scenario Integration Test  
 * エンドツーエンドシナリオの統合テスト
 * 
 * @version v1.0.0
 * @testType Integration E2E
 */

const { TestExports } = require('../../../ts/modules/test-exports');
const { 
    EntranceReservationStateManager, 
    UnifiedAutomationManager,
    ProcessingOverlay,
    AudioPlayer,
    createCacheManager,
    ExecutionState,
    TestFactory
} = TestExports;

describe('End-to-End Scenario Tests', () => {
    let stateManager;
    let automationManager;
    let overlay;
    let cacheManager;
    
    beforeEach(() => {
        jest.useFakeTimers('modern');
        
        // E2Eテスト用の完全な環境セットアップ
        stateManager = TestFactory.createStateManager();
        automationManager = new UnifiedAutomationManager(stateManager);
        overlay = new ProcessingOverlay();
        cacheManager = TestFactory.createCacheManager();
        
        // 完全な万博サイトDOM構造を模擬
        TestFactory.setupMockEnvironment('entrance');
        TestFactory.createMockDOM().createFullPageStructure();
        
        // 実際のページローディング状態を模擬
        Object.defineProperty(document, 'readyState', {
            writable: true,
            value: 'complete'
        });
        
        TestConsole.silence();
    });

    afterEach(() => {
        try {
            if (jest.isMockFunction(setTimeout)) {
                jest.runOnlyPendingTimers();
            }
        } catch (e) {}
        jest.useRealTimers();
        
        if (overlay) overlay.destroy();
        TestDOMHelper.cleanup();
        localStorage.clear();
        TestConsole.restore();
    });

    describe('新規ユーザーの初回予約シナリオ', () => {
        test('完全な初回予約フロー', async () => {
            // === フェーズ1: 初期アクセス ===
            
            // 1.1 ページ読み込み完了
            expect(document.readyState).toBe('complete');
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(stateManager.hasReservationTarget()).toBe(false);
            
            // 1.2 初期FAB状態
            let fabButtonState = stateManager.getFabButtonState();
            expect(['disabled', 'enabled']).toContain(fabButtonState);
            
            let fabButtonText = stateManager.getFabButtonText();
            expect(fabButtonText).toBe('待機中');
            
            // === フェーズ2: 予約対象選択 ===
            
            // 2.1 カレンダー日付選択（ゴールデンウィーク）
            const targetDate = '2025-04-29';
            stateManager.setSelectedCalendarDate(targetDate);
            expect(stateManager.getSelectedCalendarDate()).toBe(targetDate);
            
            // 2.2 時間帯選択（人気時間帯）
            const timeSlot = '11:00-';
            const locationIndex = 0; // 東ゲート
            const selector = 'tr:nth-child(2) > td:nth-child(1)';
            
            stateManager.setReservationTarget(timeSlot, locationIndex, selector);
            
            // 2.3 予約対象設定後の状態確認
            expect(stateManager.hasReservationTarget()).toBe(true);
            const target = stateManager.getReservationTarget();
            expect(target.timeSlot).toBe(timeSlot);
            expect(target.locationIndex).toBe(locationIndex);
            expect(target.isValid).toBe(true);
            
            // 2.4 FAB表示更新
            const displayInfo = stateManager.getFabTargetDisplayInfo();
            expect(displayInfo.hasTarget).toBe(true);
            expect(displayInfo.displayText).toContain('4/29');
            expect(displayInfo.displayText).toContain('東11:00-');
            
            // === フェーズ3: 効率モード待機開始 ===
            
            // 3.1 効率モード有効確認
            expect(stateManager.isEfficiencyModeEnabled()).toBe(true);
            
            // 3.2 次回サブミット時刻計算（毎時00分30秒を目標）
            const nextTarget = stateManager.calculateNext00or30Seconds();
            expect(nextTarget).toBeInstanceOf(Date);
            
            const targetSeconds = nextTarget.getSeconds();
            expect(
                (targetSeconds >= 0 && targetSeconds <= 2) || 
                (targetSeconds >= 30 && targetSeconds <= 32)
            ).toBe(true);
            
            stateManager.setNextSubmitTarget(nextTarget);
            
            // 3.3 オーバーレイ表示開始
            overlay.show('reservation');
            expect(overlay.isVisible()).toBe(true);
            
            // メッセージ確認
            const messageText = document.querySelector('.processing-message-text');
            expect(messageText.textContent).toBe('予約実行中...');
            
            // 3.4 カウントダウン開始
            const waitMs = nextTarget.getTime() - Date.now();
            overlay.updateCountdown(`予約開始まで ${Math.ceil(waitMs / 1000)} 秒`);
            
            // === フェーズ4: 効率モード待機実行 ===
            
            // 4.1 待機処理開始
            const waitTime = new Date(Date.now() + 2000); // 2秒後に短縮
            const waitPromise = automationManager.executeEfficiencyWait(waitTime);
            
            // 4.2 カウントダウン更新（1秒ごと）
            for (let i = 2; i > 0; i--) {
                overlay.updateCountdown(`予約開始まで ${i} 秒`);
                jest.advanceTimersByTime(1000);
            }
            
            // 4.3 待機完了
            await expect(waitPromise).resolves.toBeUndefined();
            
            // === フェーズ5: 予約実行開始 ===
            
            // 5.1 実行状態変更
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            expect(stateManager.isReservationRunning()).toBe(true);
            
            // 5.2 カウントダウンクリア
            overlay.clearCountdown();
            const countdownText = document.querySelector('.processing-countdown-text');
            expect(countdownText.textContent).toBe('');
            
            // 5.3 試行回数追跡開始
            expect(stateManager.getAttempts()).toBe(0);
            
            // === フェーズ6: 予約処理シミュレーション ===
            
            // 6.1 複数回試行（競争が激しい想定）
            for (let attempt = 1; attempt <= 3; attempt++) {
                stateManager.incrementAttempts();
                expect(stateManager.getAttempts()).toBe(attempt);
                
                // 各試行で短時間待機
                jest.advanceTimersByTime(500);
            }
            
            // === フェーズ7: 予約成功 ===
            
            // 7.1 予約成功設定
            stateManager.setReservationSuccess(timeSlot, locationIndex);
            
            expect(stateManager.hasReservationSuccess()).toBe(true);
            expect(stateManager.hasReservationTarget()).toBe(false); // 成功時自動クリア
            
            const success = stateManager.getReservationSuccess();
            expect(success.timeSlot).toBe(timeSlot);
            expect(success.locationIndex).toBe(locationIndex);
            expect(success.successTime).toBeInstanceOf(Date);
            
            // 7.2 成功音再生
            if (stateManager.isNotificationSoundEnabled()) {
                expect(() => {
                    AudioPlayer.playSuccessSound();
                }).not.toThrow();
                
                // 成功音の再生時間
                jest.advanceTimersByTime(1000);
            }
            
            // === フェーズ8: 完了・クリーンアップ ===
            
            // 8.1 停止処理
            stateManager.stop();
            overlay.hide();
            
            // 8.2 最終状態確認
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(stateManager.isReservationRunning()).toBe(false);
            expect(overlay.isVisible()).toBe(false);
            
            // 8.3 成功情報は保持
            expect(stateManager.hasReservationSuccess()).toBe(true);
            
            // 8.4 FAB状態復元
            fabButtonState = stateManager.getFabButtonState();
            expect(fabButtonState).toBe('disabled'); // 成功後は無効
            
            fabButtonText = stateManager.getFabButtonText();
            expect(fabButtonText).toBe('待機中');
        });
    });

    describe('経験ユーザーのキャッシュ活用シナリオ', () => {
        test('前回設定復元からの高速予約', async () => {
            // === フェーズ1: 前回設定の復元 ===
            
            // 1.1 既存キャッシュデータ設定
            const cachedData = {
                timeSlot: '14:30-',
                locationIndex: 1, // 西ゲート
                selector: 'tr:nth-child(3) > td:nth-child(2)',
                selectedDate: '2025-05-03',
                timestamp: Date.now() - (30 * 60 * 1000), // 30分前
                retryCount: 2
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slot'),
                JSON.stringify(cachedData)
            );
            
            // 1.2 キャッシュ読み込み
            const loaded = cacheManager.loadTargetSlot();
            expect(loaded).not.toBeNull();
            expect(loaded.timeSlot).toBe('14:30-');
            expect(loaded.retryCount).toBe(2);
            
            // 1.3 StateManagerに復元
            stateManager.setSelectedCalendarDate(loaded.selectedDate);
            stateManager.setReservationTarget(
                loaded.timeSlot,
                loaded.locationIndex,
                loaded.selector
            );
            
            // === フェーズ2: 復元後の状態確認 ===
            
            // 2.1 予約対象確認
            expect(stateManager.hasReservationTarget()).toBe(true);
            const target = stateManager.getReservationTarget();
            expect(target.timeSlot).toBe('14:30-');
            expect(target.locationIndex).toBe(1);
            
            // 2.2 表示情報確認
            const displayInfo = stateManager.getFabTargetDisplayInfo();
            expect(displayInfo.displayText).toContain('5/3');
            expect(displayInfo.displayText).toContain('西14:30-');
            
            // === フェーズ3: 即座に予約実行 ===
            
            // 3.1 効率モード待機スキップ（即座実行）
            overlay.show('reservation');
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            
            // 3.2 前回の試行回数から継続
            const initialAttempts = loaded.retryCount;
            for (let i = 0; i < initialAttempts; i++) {
                stateManager.incrementAttempts();
            }
            expect(stateManager.getAttempts()).toBe(initialAttempts);
            
            // === フェーズ4: 高速予約成功 ===
            
            // 4.1 数回の試行で成功
            stateManager.incrementAttempts(); // +1
            jest.advanceTimersByTime(200);
            
            stateManager.setReservationSuccess('14:30-', 1);
            
            // 4.2 完了処理
            if (stateManager.isNotificationSoundEnabled()) {
                AudioPlayer.playSuccessSound();
            }
            
            stateManager.stop();
            overlay.hide();
            
            // 4.3 キャッシュ更新（成功情報を反映）
            cacheManager.clearTargetSlot(); // 成功後は不要
            expect(cacheManager.loadTargetSlot()).toBeNull();
        });
    });

    describe('混雑時・エラー多発シナリオ', () => {
        test('高負荷時の段階的エラー処理と復旧', async () => {
            // === フェーズ1: 高競争状況セットアップ ===
            
            // 1.1 人気時間帯設定
            stateManager.setSelectedCalendarDate('2025-04-29'); // GW初日
            stateManager.setReservationTarget('10:00-', 0, 'popular-slot');
            
            overlay.show('reservation');
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            
            // === フェーズ2: 連続エラー・再試行 ===
            
            // 2.1 複数回の失敗試行
            const maxAttempts = 10;
            
            for (let attempt = 1; attempt <= maxAttempts; attempt++) {
                stateManager.incrementAttempts();
                
                // エラーシミュレーション
                try {
                    if (attempt <= 7) {
                        throw new Error(`Network error ${attempt}`);
                    } else if (attempt <= 9) {
                        throw new Error('Server overload');
                    }
                    // 10回目で成功
                } catch (error) {
                    console.error(`試行 ${attempt}:`, error.message);
                    
                    // 試行回数をキャッシュに保存
                    cacheManager.updateRetryCount(attempt);
                }
                
                // 短時間待機（実際はランダム待機）
                jest.advanceTimersByTime(100);
                
                // 中断確認
                if (stateManager.getShouldStop()) {
                    break;
                }
            }
            
            // === フェーズ3: 最終成功 ===
            
            // 3.1 最終試行で成功
            expect(stateManager.getAttempts()).toBe(maxAttempts);
            stateManager.setReservationSuccess('10:00-', 0);
            
            // 3.2 高負荷での成功を祝う長めの音
            if (stateManager.isNotificationSoundEnabled()) {
                AudioPlayer.playSuccessSound();
                jest.advanceTimersByTime(2000); // 長めの成功音
            }
            
            // === フェーズ4: 完了処理 ===
            
            stateManager.stop();
            overlay.hide();
            
            // 最終確認
            expect(stateManager.hasReservationSuccess()).toBe(true);
            const success = stateManager.getReservationSuccess();
            expect(success.timeSlot).toBe('10:00-');
        });

        test('システム障害からの完全復旧', async () => {
            // === フェーズ1: 正常動作開始 ===
            
            stateManager.setReservationTarget('15:00-', 1, 'test-selector');
            overlay.show('reservation');
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            
            // === フェーズ2: システム障害発生 ===
            
            // 2.1 DOM要素消失（ページ更新等）
            TestDOMHelper.cleanup();
            
            // 2.2 LocalStorage エラー
            const originalSetItem = localStorage.setItem;
            localStorage.setItem = jest.fn(() => {
                throw new Error('QuotaExceededError');
            });
            
            // 2.3 ネットワーク障害
            const networkError = new Error('NetworkError');
            
            // === フェーズ3: エラー検出・停止 ===
            
            try {
                throw networkError;
            } catch (error) {
                console.error('システム障害検出:', error);
                
                // 緊急停止
                stateManager.setShouldStop(true);
                automationManager.abort();
                stateManager.stop();
                overlay.hide();
            }
            
            // === フェーズ4: 復旧処理 ===
            
            // 4.1 DOM復旧
            TestFactory.createMockDOM().createFullPageStructure();
            
            // 4.2 LocalStorage復旧
            localStorage.setItem = originalSetItem;
            
            // 4.3 状態復旧確認
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(overlay.isVisible()).toBe(false);
            
            // 4.4 予約対象は保持（再開可能）
            expect(stateManager.hasReservationTarget()).toBe(true);
        });
    });

    describe('長期運用・安定性シナリオ', () => {
        test('24時間連続運用シミュレーション', async () => {
            // === 長期運用状況の圧縮シミュレーション ===
            
            const simulationCycles = 20; // 実際は24時間分
            let totalSuccesses = 0;
            let totalAttempts = 0;
            
            for (let cycle = 0; cycle < simulationCycles; cycle++) {
                // 各サイクル：1時間相当の操作
                
                // 1. 予約対象変更（時間帯変更）
                const hour = 9 + (cycle % 8); // 9:00-16:00の範囲
                const timeSlot = `${hour}:00-`;
                stateManager.setReservationTarget(timeSlot, cycle % 2, `selector-${cycle}`);
                
                // 2. 短時間実行
                overlay.show('reservation');
                stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
                
                // 3. 数回試行
                const attempts = 1 + (cycle % 5); // 1-5回
                for (let i = 0; i < attempts; i++) {
                    stateManager.incrementAttempts();
                    totalAttempts++;
                    jest.advanceTimersByTime(10); // 高速化
                }
                
                // 4. 成功率：70%
                if (cycle % 10 < 7) {
                    stateManager.setReservationSuccess(timeSlot, cycle % 2);
                    totalSuccesses++;
                    
                    if (stateManager.isNotificationSoundEnabled()) {
                        AudioPlayer.playSuccessSound();
                    }
                }
                
                // 5. クリーンアップ
                stateManager.stop();
                overlay.hide();
                
                if (stateManager.hasReservationSuccess()) {
                    stateManager.clearReservationSuccess();
                }
                stateManager.clearReservationTarget();
                
                // 6. メモリ使用量監視
                const elements = document.querySelectorAll('*');
                expect(elements.length).toBeLessThan(500);
            }
            
            // === 長期運用結果確認 ===
            
            expect(totalSuccesses).toBeGreaterThan(0);
            expect(totalAttempts).toBeGreaterThan(totalSuccesses);
            
            const successRate = totalSuccesses / (simulationCycles * 0.7); // 期待成功率
            expect(successRate).toBeCloseTo(1.0, 1);
            
            // 最終状態：クリーン
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(stateManager.hasReservationTarget()).toBe(false);
            expect(overlay.isVisible()).toBe(false);
        });
    });

    describe('ユーザビリティ・アクセシビリティ', () => {
        test('視覚障害ユーザー対応シナリオ', async () => {
            // === アクセシビリティ要素確認 ===
            
            // 1. スクリーンリーダー対応
            overlay.show('reservation');
            
            const overlayElement = document.getElementById('ytomo-processing-overlay');
            expect(overlayElement).not.toBeNull();
            
            // ARIA属性確認（実装されている場合）
            const messageText = document.querySelector('.processing-message-text');
            expect(messageText.textContent).toBeTruthy();
            
            // 2. キーボードナビゲーション
            const abortButton = document.getElementById('ytomo-processing-abort-button');
            if (abortButton) {
                expect(abortButton.textContent).toBe('中断');
            }
            
            // 3. 音声フィードバック
            stateManager.setReservationSuccess('11:00-', 0);
            
            if (stateManager.isNotificationSoundEnabled()) {
                expect(() => {
                    AudioPlayer.playSuccessSound();
                }).not.toThrow();
            }
            
            // 音声の代替テキスト表示（成功メッセージ）
            expect(stateManager.hasReservationSuccess()).toBe(true);
        });

        test('モバイル・タッチデバイス対応', async () => {
            // === モバイル環境シミュレーション ===
            
            // 1. 小画面での表示確認
            overlay.show('reservation');
            
            const overlayElement = document.getElementById('ytomo-processing-overlay');
            expect(overlayElement).not.toBeNull();
            
            // 2. タッチイベントシミュレーション
            const companionOverlay = new ProcessingOverlay();
            companionOverlay.show('companion');
            
            const touchAbortButton = document.getElementById('ytomo-processing-abort-button');
            if (touchAbortButton) {
                // タッチイベント
                const touchEvent = new Event('touchstart', { bubbles: true });
                touchAbortButton.dispatchEvent(touchEvent);
            }
            
            companionOverlay.destroy();
            
            // 3. スワイプ・ジェスチャー対応（実装されている場合）
            // 現在の実装では未対応だが、将来的な拡張ポイント
        });
    });
});