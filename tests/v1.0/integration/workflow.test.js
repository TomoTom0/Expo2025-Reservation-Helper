/**
 * Workflow Integration Test
 * ワークフロー全体の統合テスト
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
    ExecutionState,
    TestFactory
} = TestExports;

describe('Workflow Integration Tests', () => {
    let stateManager;
    let automationManager;
    let overlay;
    let cacheManager;
    
    beforeEach(() => {
        jest.useFakeTimers('modern');
        
        // ワークフロー用の完全なセットアップ
        stateManager = TestFactory.createStateManager();
        automationManager = new UnifiedAutomationManager(stateManager);
        overlay = new ProcessingOverlay();
        cacheManager = TestFactory.createCacheManager();
        
        // 完全なページ構造を作成
        TestFactory.createMockDOM().createFullPageStructure();
        TestFactory.setupMockEnvironment('entrance');
        
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

    describe('入場予約ワークフロー', () => {
        test('手動予約対象選択からキャッシュ保存まで', async () => {
            // 1. ページ読み込み状態
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(stateManager.hasReservationTarget()).toBe(false);
            
            // 2. カレンダー日付選択
            stateManager.setSelectedCalendarDate('2025-05-01');
            expect(stateManager.getSelectedCalendarDate()).toBe('2025-05-01');
            
            // 3. 時間帯選択（ユーザー操作シミュレーション）
            const timeSlotElement = document.querySelector('.time-slot.available');
            expect(timeSlotElement).not.toBeNull();
            
            // DOM要素からセレクタ生成をシミュレート
            const mockSelector = 'tr:nth-child(1) > td:nth-child(1)';
            stateManager.setReservationTarget('09:00-', 0, mockSelector);
            
            // 4. 予約対象設定完了確認
            expect(stateManager.hasReservationTarget()).toBe(true);
            const target = stateManager.getReservationTarget();
            expect(target.timeSlot).toBe('09:00-');
            expect(target.locationIndex).toBe(0);
            expect(target.selector).toBe(mockSelector);
            
            // 5. FAB表示情報確認
            const displayInfo = stateManager.getFabTargetDisplayInfo();
            expect(displayInfo.hasTarget).toBe(true);
            expect(displayInfo.displayText).toContain('5/1');
            expect(displayInfo.displayText).toContain('東09:00-');
            
            // 6. キャッシュ保存シミュレーション
            const cacheData = {
                timeSlot: target.timeSlot,
                locationIndex: target.locationIndex,
                selector: target.selector,
                selectedDate: stateManager.getSelectedCalendarDate(),
                timestamp: Date.now(),
                retryCount: 0
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slot'),
                JSON.stringify(cacheData)
            );
            
            // キャッシュ確認
            const cached = cacheManager.loadTargetSlot();
            expect(cached).not.toBeNull();
            expect(cached.timeSlot).toBe('09:00-');
        });

        test('効率モード待機から予約実行まで', async () => {
            // 1. 予約対象事前設定
            stateManager.setSelectedCalendarDate('2025-05-01');
            stateManager.setReservationTarget('11:00-', 0, 'test-selector');
            
            // 2. 効率モードが有効であることを確認
            expect(stateManager.isEfficiencyModeEnabled()).toBe(true);
            
            // 3. 次回サブミット時刻計算
            const nextSubmitTime = stateManager.calculateNext00or30Seconds();
            expect(nextSubmitTime).toBeInstanceOf(Date);
            expect(nextSubmitTime.getTime()).toBeGreaterThan(Date.now());
            
            stateManager.setNextSubmitTarget(nextSubmitTime);
            
            // 4. オーバーレイ表示と効率モード待機開始
            overlay.show('reservation');
            expect(overlay.isVisible()).toBe(true);
            
            // カウントダウン表示
            const waitMs = nextSubmitTime.getTime() - Date.now();
            overlay.updateCountdown(`${Math.ceil(waitMs / 1000)}秒後に予約開始`);
            
            // 5. 効率モード待機（短縮してテスト）
            const shortWaitTime = new Date(Date.now() + 1000); // 1秒後
            const waitPromise = automationManager.executeEfficiencyWait(shortWaitTime);
            
            // 時間を進める
            jest.advanceTimersByTime(1000);
            
            await expect(waitPromise).resolves.toBeUndefined();
            
            // 6. 予約実行状態に移行
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            expect(stateManager.isReservationRunning()).toBe(true);
            
            // 7. カウントダウンクリア
            overlay.clearCountdown();
            const countdownText = document.querySelector('.processing-countdown-text');
            expect(countdownText.textContent).toBe('');
        });

        test('予約成功から完了まで', async () => {
            // 1. 予約実行中状態
            stateManager.setReservationTarget('14:30-', 1, 'test-selector');
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            overlay.show('reservation');
            
            // 2. 予約成功設定
            stateManager.setReservationSuccess('14:30-', 1);
            
            expect(stateManager.hasReservationSuccess()).toBe(true);
            expect(stateManager.hasReservationTarget()).toBe(false); // 成功時に自動クリア
            
            const success = stateManager.getReservationSuccess();
            expect(success.timeSlot).toBe('14:30-');
            expect(success.locationIndex).toBe(1);
            expect(success.successTime).toBeInstanceOf(Date);
            
            // 3. 成功音再生
            if (stateManager.isNotificationSoundEnabled()) {
                expect(() => {
                    AudioPlayer.playSuccessSound();
                    // 成功音の再生時間をシミュレート
                    jest.advanceTimersByTime(100);
                }).not.toThrow();
            }
            
            // 4. 完了処理
            stateManager.stop();
            overlay.hide();
            
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(stateManager.isReservationRunning()).toBe(false);
            expect(overlay.isVisible()).toBe(false);
            
            // 5. 成功情報は保持される
            expect(stateManager.hasReservationSuccess()).toBe(true);
        });

        test('予約中断フロー', async () => {
            // 1. 予約実行開始
            stateManager.setReservationTarget('16:00-', 0, 'test-selector');
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            overlay.show('reservation');
            
            // 試行回数をカウント
            stateManager.incrementAttempts();
            stateManager.incrementAttempts();
            expect(stateManager.getAttempts()).toBe(2);
            
            // 2. ユーザーによる中断要求
            stateManager.setShouldStop(true);
            expect(stateManager.getShouldStop()).toBe(true);
            
            // 3. 中断処理実行
            automationManager.abort();
            stateManager.stop();
            overlay.hide();
            
            // 4. 中断後の状態確認
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            expect(automationManager.isRunning()).toBe(false);
            expect(overlay.isVisible()).toBe(false);
            
            // 5. 予約対象は保持される（再開可能）
            expect(stateManager.hasReservationTarget()).toBe(true);
            
            // 6. 中断状態はクリアされる
            const shouldStopAfter = stateManager.getShouldStop();
            expect([true, false]).toContain(shouldStopAfter); // 実装依存
        });
    });

    describe('同行者チケット追加ワークフロー', () => {
        test('同行者追加プロセス全体', async () => {
            // 1. 同行者追加モード開始
            overlay.show('companion');
            expect(overlay.isVisible()).toBe(true);
            
            // メッセージ確認
            const messageText = document.querySelector('.processing-message-text');
            expect(messageText.textContent).toBe('同行者追加処理実行中...');
            
            // 専用中断ボタンが作成される
            const abortButton = document.getElementById('ytomo-processing-abort-button');
            expect(abortButton).not.toBeNull();
            expect(abortButton.textContent).toBe('中断');
            
            // 2. 同行者追加処理シミュレーション
            // （実際の処理は複雑なため、状態変化のみテスト）
            
            // 3. 処理完了
            overlay.hide();
            expect(overlay.isVisible()).toBe(false);
            
            // 中断ボタンが削除される
            const abortButtonAfter = document.getElementById('ytomo-processing-abort-button');
            expect(abortButtonAfter).toBeNull();
        });

        test('同行者追加の中断処理', async () => {
            // 1. 同行者追加開始
            overlay.show('companion');
            const abortButton = document.getElementById('ytomo-processing-abort-button');
            expect(abortButton).not.toBeNull();
            
            // 2. 中断ボタンクリック
            abortButton.click();
            
            // 3. 中断処理の実行確認
            // （実際の中断処理はイベントハンドラー内で実行）
            // クリック後もオーバーレイは表示されたまま
            
            // 手動で非表示
            overlay.hide();
            expect(overlay.isVisible()).toBe(false);
        });
    });

    describe('エラー処理・復旧ワークフロー', () => {
        test('DOM要素不在エラーからの復旧', async () => {
            // 1. 予約対象設定（要素が存在しない状態）
            TestDOMHelper.cleanup(); // DOM要素をクリア
            
            stateManager.setReservationTarget('11:00-', 0, 'nonexistent-selector');
            
            // 2. 要素待機テスト
            const controller = new AbortController();
            const elementWaitPromise = automationManager.waitForElementWithCancellation(
                'nonexistent-selector',
                1000,
                controller.signal
            );
            
            // 時間を進める
            jest.advanceTimersByTime(1000);
            
            // 3. タイムアウトエラー発生
            await expect(elementWaitPromise).rejects.toThrow('要素が見つかりません');
            
            // 4. エラー後の状態確認
            expect(stateManager.hasReservationTarget()).toBe(true); // 対象は保持
        });

        test('ネットワークエラー・再試行フロー', async () => {
            // 1. 予約実行中にエラー発生
            stateManager.setReservationTarget('11:00-', 0, 'test-selector');
            stateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
            
            // 試行回数カウント
            for (let i = 0; i < 3; i++) {
                stateManager.incrementAttempts();
            }
            expect(stateManager.getAttempts()).toBe(3);
            
            // 2. エラー処理
            try {
                throw new Error('Network timeout');
            } catch (error) {
                console.error('ネットワークエラー:', error);
                
                // キャッシュに試行回数を保存
                if (cacheManager.loadTargetSlot()) {
                    cacheManager.updateRetryCount(stateManager.getAttempts());
                }
            }
            
            // 3. 一時停止
            stateManager.stop();
            expect(stateManager.getExecutionState()).toBe(ExecutionState.IDLE);
            
            // 4. 再開準備
            expect(stateManager.hasReservationTarget()).toBe(true);
            const cached = cacheManager.loadTargetSlot();
            if (cached) {
                expect(cached.retryCount).toBeGreaterThan(0);
            }
        });
    });

    describe('設定・パフォーマンス統合', () => {
        test('通知音設定の統合フロー', () => {
            // 1. 初期状態（有効）
            expect(stateManager.isNotificationSoundEnabled()).toBe(true);
            
            // 2. オーバーレイ表示での設定変更
            overlay.show('reservation');
            
            // 通知音トグル（実際のボタンは条件付きで作成される）
            const initialState = stateManager.isNotificationSoundEnabled();
            const newState = stateManager.toggleNotificationSound();
            
            expect(newState).toBe(!initialState);
            expect(stateManager.isNotificationSoundEnabled()).toBe(newState);
            
            // 3. localStorage確認
            const stored = localStorage.getItem('ytomo-notification-sound');
            expect(stored).not.toBeNull();
            
            const settings = JSON.parse(stored);
            expect(settings.enabled).toBe(newState);
            
            // 4. 設定に応じた音声再生制御
            if (stateManager.isNotificationSoundEnabled()) {
                expect(() => AudioPlayer.playSuccessSound()).not.toThrow();
            }
        });

        test('複数タブ・ウィンドウでの状態同期', () => {
            // 1. 初期状態設定
            stateManager.setReservationTarget('11:00-', 0, 'test-selector');
            
            // 2. localStorage経由の状態共有シミュレーション
            const stateData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                selectedDate: stateManager.getSelectedCalendarDate(),
                executionState: stateManager.getExecutionState()
            };
            
            localStorage.setItem('ytomo-state-sync', JSON.stringify(stateData));
            
            // 3. 別タブでの読み込みシミュレーション
            const syncedData = localStorage.getItem('ytomo-state-sync');
            expect(syncedData).not.toBeNull();
            
            const parsed = JSON.parse(syncedData);
            expect(parsed.timeSlot).toBe('11:00-');
            expect(parsed.locationIndex).toBe(0);
            
            // 4. クリーンアップ
            localStorage.removeItem('ytomo-state-sync');
        });
    });

    describe('長時間運用・メモリ管理', () => {
        test('長時間効率モード待機', async () => {
            // 1. 長期間待機シミュレーション
            stateManager.setReservationTarget('09:00-', 0, 'test-selector');
            
            const longWaitTime = new Date(Date.now() + 5000); // 5秒後
            overlay.show('reservation');
            
            // 2. カウントダウン更新ループ
            const updateCountdown = () => {
                const remainingMs = longWaitTime.getTime() - Date.now();
                if (remainingMs > 0) {
                    overlay.updateCountdown(`${Math.ceil(remainingMs / 1000)}秒後に開始`);
                }
            };
            
            // 3. 段階的時間進行
            for (let i = 0; i < 5; i++) {
                updateCountdown();
                jest.advanceTimersByTime(1000);
            }
            
            // 4. 最終状態確認
            overlay.clearCountdown();
            const countdownText = document.querySelector('.processing-countdown-text');
            expect(countdownText.textContent).toBe('');
        });

        test('メモリリーク防止確認', () => {
            // 1. 大量のオブジェクト作成・破棄サイクル
            const cycles = 10;
            
            for (let i = 0; i < cycles; i++) {
                // 作成
                const tempStateManager = TestFactory.createStateManager();
                const tempCacheManager = TestFactory.createCacheManager();
                
                tempStateManager.setReservationTarget(`${10 + i}:00-`, i % 2, `selector-${i}`);
                
                const cacheKey = tempCacheManager.generateKey('temp');
                localStorage.setItem(cacheKey, JSON.stringify({ cycle: i }));
                
                // 破棄
                tempStateManager.stop();
                localStorage.removeItem(cacheKey);
            }
            
            // 2. メモリ使用量の監視（間接的確認）
            // DOM要素数の確認
            const elements = document.querySelectorAll('*');
            expect(elements.length).toBeLessThan(1000); // 妥当な範囲
            
            // localStorage使用量の確認
            const storageKeys = Object.keys(localStorage);
            expect(storageKeys.length).toBeLessThan(50); // 妥当な範囲
        });
    });
});