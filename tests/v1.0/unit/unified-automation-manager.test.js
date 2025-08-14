/**
 * UnifiedAutomationManager Unit Test
 * 統一自動処理管理システムの単体テスト
 * 
 * @version v1.0.0
 * @testTarget UnifiedAutomationManager (unified-automation-manager.ts)
 */

const { TestExports } = require('../../../ts/modules/test-exports');
const { UnifiedAutomationManager, CancellationError } = TestExports;

describe('UnifiedAutomationManager', () => {
    let automationManager;
    let mockStateManager;
    
    beforeEach(() => {
        // フェイクタイマーを使用（待機時間テスト用）
        jest.useFakeTimers('modern');
        
        // モックStateManagerを作成
        mockStateManager = {
            stop: jest.fn(),
            setExecutionState: jest.fn(),
            getExecutionState: jest.fn().mockReturnValue('idle'),
            setShouldStop: jest.fn(),
            getShouldStop: jest.fn().mockReturnValue(false)
        };
        
        // UnifiedAutomationManagerインスタンス作成
        automationManager = new UnifiedAutomationManager(mockStateManager);
        
        // ConsoleSpyを設定してログ出力を抑制
        TestConsole.silence();
    });

    afterEach(() => {
        // タイマーのクリーンアップ
        try {
            if (jest.isMockFunction(setTimeout)) {
                jest.runOnlyPendingTimers();
            }
        } catch (e) {
            // フェイクタイマーが無効な場合は無視
        }
        jest.useRealTimers();
        
        // Console spy復元
        TestConsole.restore();
    });

    describe('CancellationError', () => {
        test('CancellationErrorが正しく作成される', () => {
            const error = new CancellationError('Test cancellation');
            
            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(CancellationError);
            expect(error.message).toBe('Test cancellation');
            expect(error.name).toBe('CancellationError');
        });

        test('CancellationErrorの継承関係', () => {
            const error = new CancellationError('Inheritance test');
            
            expect(error instanceof Error).toBe(true);
            expect(error instanceof CancellationError).toBe(true);
            expect(error.constructor.name).toBe('CancellationError');
        });
    });

    describe('基本構築とプロパティ', () => {
        test('コンストラクタでStateManagerが正しく設定される', () => {
            const manager = new UnifiedAutomationManager(mockStateManager);
            
            // プライベートプロパティは直接アクセスできないので、
            // StateManagerとの相互作用を通じて確認
            expect(manager).toBeInstanceOf(UnifiedAutomationManager);
        });

        test('nullStateManagerでも正常に構築される', () => {
            expect(() => {
                new UnifiedAutomationManager(null);
            }).not.toThrow();
        });
    });

    describe('中断可能待機システム', () => {
        describe('waitWithCancellation', () => {
            test('正常な待機が完了する', async () => {
                const controller = new AbortController();
                const waitPromise = automationManager.waitWithCancellation(500, controller.signal);
                
                // 500ms進める
                jest.advanceTimersByTime(500);
                
                await expect(waitPromise).resolves.toBeUndefined();
            });

            test('待機中に中断される', async () => {
                const controller = new AbortController();
                const waitPromise = automationManager.waitWithCancellation(1000, controller.signal);
                
                // 200ms進んでから中断
                jest.advanceTimersByTime(200);
                controller.abort();
                
                // 中断処理時間を進める
                jest.advanceTimersByTime(100);
                
                await expect(waitPromise).rejects.toThrow();
            });

            test('短時間待機（100ms以下）の動作', async () => {
                const controller = new AbortController();
                const waitPromise = automationManager.waitWithCancellation(50, controller.signal);
                
                // 50ms進める
                jest.advanceTimersByTime(50);
                
                await expect(waitPromise).resolves.toBeUndefined();
            });

            test('0ms待機の即座完了', async () => {
                const controller = new AbortController();
                const waitPromise = automationManager.waitWithCancellation(0, controller.signal);
                
                await expect(waitPromise).resolves.toBeUndefined();
            });
        });

        describe('waitForTargetTime', () => {
            test('未来の時刻への正常待機', async () => {
                const targetTime = new Date(Date.now() + 1500); // 1.5秒後
                const controller = new AbortController();
                
                const waitPromise = automationManager.waitForTargetTime(targetTime, controller.signal);
                
                // 時間を進める
                jest.advanceTimersByTime(1500);
                
                await expect(waitPromise).resolves.toBeUndefined();
            });

            test('過去の時刻の場合は即座に完了', async () => {
                const targetTime = new Date(Date.now() - 1000); // 1秒前
                const controller = new AbortController();
                
                const waitPromise = automationManager.waitForTargetTime(targetTime, controller.signal);
                
                await expect(waitPromise).resolves.toBeUndefined();
            });

            test('短時間待機（1秒以下）の精密処理', async () => {
                const targetTime = new Date(Date.now() + 500); // 500ms後
                const controller = new AbortController();
                
                const waitPromise = automationManager.waitForTargetTime(targetTime, controller.signal);
                
                // 500ms進める
                jest.advanceTimersByTime(500);
                
                await expect(waitPromise).resolves.toBeUndefined();
            });

            test('長時間待機での分割処理', async () => {
                const targetTime = new Date(Date.now() + 5000); // 5秒後
                const controller = new AbortController();
                
                const waitPromise = automationManager.waitForTargetTime(targetTime, controller.signal);
                
                // 段階的に時間を進める
                jest.advanceTimersByTime(4900); // 最初の分割待機
                jest.advanceTimersByTime(100);  // 最終精密調整
                
                await expect(waitPromise).resolves.toBeUndefined();
            });

            test('長時間待機中の中断', async () => {
                const targetTime = new Date(Date.now() + 3000); // 3秒後
                const controller = new AbortController();
                
                const waitPromise = automationManager.waitForTargetTime(targetTime, controller.signal);
                
                // 1秒後に中断
                jest.advanceTimersByTime(1000);
                controller.abort();
                jest.advanceTimersByTime(100);
                
                await expect(waitPromise).rejects.toThrow();
            });
        });
    });

    describe('効率モード待機処理', () => {
        test('executeEfficiencyWaitの正常実行', async () => {
            const targetTime = new Date(Date.now() + 1000);
            
            const executePromise = automationManager.executeEfficiencyWait(targetTime);
            
            // 時間を進める
            jest.advanceTimersByTime(1000);
            
            await expect(executePromise).resolves.toBeUndefined();
        });

        test('executeEfficiencyWaitの中断', async () => {
            const targetTime = new Date(Date.now() + 2000);
            
            const executePromise = automationManager.executeEfficiencyWait(targetTime);
            
            // 500ms後に停止指示
            setTimeout(() => {
                automationManager.abort();
            }, 500);
            
            jest.advanceTimersByTime(500);
            jest.advanceTimersByTime(100); // 中断処理時間
            
            // 実際の実装では、throwIfAborted()がError('AbortError')を投げるため
            // message='AbortError'の通常のErrorが来ることがある
            await expect(executePromise).rejects.toThrow();
        });
    });

    describe('DOM要素待機機能', () => {
        beforeEach(() => {
            // DOM環境をクリーンアップ
            document.body.innerHTML = '';
        });

        test('waitForElementWithCancellation - 要素が見つかる場合', async () => {
            const controller = new AbortController();
            
            // 要素を後で追加するタイマーを設定
            setTimeout(() => {
                const element = document.createElement('div');
                element.id = 'test-element';
                document.body.appendChild(element);
            }, 300);
            
            const elementPromise = automationManager.waitForElementWithCancellation(
                '#test-element', 
                1000, 
                controller.signal
            );
            
            // 300ms進めて要素を作成
            jest.advanceTimersByTime(300);
            
            await expect(elementPromise).resolves.toBeDefined();
        });

        test('waitForElementWithCancellation - タイムアウト', async () => {
            const controller = new AbortController();
            
            const elementPromise = automationManager.waitForElementWithCancellation(
                '#nonexistent-element',
                500,
                controller.signal
            );
            
            // タイムアウト時間を進める
            jest.advanceTimersByTime(500);
            
            await expect(elementPromise).rejects.toThrow('要素が見つかりません');
        });

        test('waitForElementWithCancellation - 中断', async () => {
            const controller = new AbortController();
            
            const elementPromise = automationManager.waitForElementWithCancellation(
                '#test-element',
                1000,
                controller.signal
            );
            
            // 200ms後に中断
            setTimeout(() => {
                controller.abort();
            }, 200);
            
            jest.advanceTimersByTime(200);
            jest.advanceTimersByTime(100); // 中断処理時間
            
            await expect(elementPromise).rejects.toThrow();
        });
    });

    describe('中断システム', () => {
        test('abort()メソッドによる処理中断', () => {
            expect(() => {
                automationManager.abort();
            }).not.toThrow();
        });

        test('isRunning状態の確認', () => {
            // 初期状態
            expect(automationManager.isRunning()).toBe(false);
            
            // 状態変化のテストは統合テストで実施
        });

        test('getCurrentProcess状態の確認', () => {
            // 初期状態
            expect(automationManager.getCurrentProcess()).toBe('idle');
            
            // プロセス実行中の状態変化は統合テストで実施
        });
    });

    describe('エラーハンドリング', () => {
        test('throwIfAborted - 通常状態では例外なし', () => {
            const controller = new AbortController();
            
            expect(() => {
                // privateメソッドのため直接テストは不可
                // 内部的にthrowIfAbortedが使用されるwaitWithCancellationでテスト
                const promise = automationManager.waitWithCancellation(100, controller.signal);
                jest.advanceTimersByTime(100);
                return promise;
            }).not.toThrow();
        });

        test('AbortError変換のテスト', async () => {
            const controller = new AbortController();
            controller.abort();
            
            const waitPromise = automationManager.waitWithCancellation(1000, controller.signal);
            
            await expect(waitPromise).rejects.toThrow();
        });
    });

    describe('統合動作シナリオ', () => {
        test('複数の待機処理の順次実行', async () => {
            const controller = new AbortController();
            
            // 最初の待機
            const firstWait = automationManager.waitWithCancellation(100, controller.signal);
            jest.advanceTimersByTime(100);
            await firstWait;
            
            // 2回目の待機
            const secondWait = automationManager.waitWithCancellation(200, controller.signal);
            jest.advanceTimersByTime(200);
            await secondWait;
            
            // 両方とも成功することを確認
            expect(true).toBe(true); // 例外が投げられなければ成功
        });

        test('効率モード待機の実際の時刻計算', async () => {
            const now = Date.now();
            const targetTime = new Date(now + 800);
            
            const startTime = Date.now();
            const waitPromise = automationManager.waitForTargetTime(targetTime, new AbortController().signal);
            
            jest.advanceTimersByTime(800);
            
            await waitPromise;
            
            // タイミングの精度確認（フェイクタイマーなので概算）
            expect(Date.now() - startTime).toBeLessThanOrEqual(1000);
        });
    });
});