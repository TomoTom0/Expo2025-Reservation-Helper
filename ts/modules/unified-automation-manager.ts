/**
 * 統一自動処理管理システム
 * 
 * 全ての自動処理（予約、効率モード待機）を統一管理し、
 * AbortController による即座中断を実現
 */

// 型定義のインポート
import type { ReservationConfig, ReservationResult } from '../types/index.js';
import { processingOverlay } from './processing-overlay';
import { loggers } from '../utils/logger';

const logger = loggers.automation;

// カスタム例外クラス
export class CancellationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CancellationError';
    }
}

// 統一自動処理管理クラス
export class UnifiedAutomationManager {
    private controller: AbortController | null = null;
    private currentProcess: 'idle' | 'reservation' | 'efficiency-wait' = 'idle';
    private stateManager: any; // EntranceReservationStateManager への循環参照回避

    constructor(stateManager: any) {
        this.stateManager = stateManager;
        logger.info('統一自動処理管理システム初期化', { success: !!this.stateManager });
    }

    // ============================================================================
    // 統一処理実行フレームワーク
    // ============================================================================

    /**
     * 中断可能な処理実行フレームワーク
     * @param processType 処理タイプ
     * @param executor 実行する処理関数
     * @returns 処理結果
     */
    private async runWithCancellation<T>(
        processType: 'reservation' | 'efficiency-wait',
        executor: (signal: AbortSignal) => Promise<T>
    ): Promise<T> {
        this.currentProcess = processType;
        this.controller = new AbortController();

        try {
            logger.info('統一自動処理開始', { processType });
            
            // 誤動作防止オーバーレイを表示（efficiency-waitは除外）
            if (processType !== 'efficiency-wait') {
                processingOverlay.show(processType);
            }
            
            return await executor(this.controller.signal);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                const cancellationError = new CancellationError(`${processType} was cancelled`);
                logger.info('統一自動処理中断', { processType });
                throw cancellationError;
            }
            logger.error('統一自動処理エラー', { processType, error });
            throw error;
        } finally {
            // 誤動作防止オーバーレイを非表示
            if (processType !== 'efficiency-wait') {
                processingOverlay.hide();
            }
            this.cleanup();
        }
    }

    /**
     * 統一予約処理実行
     * @param config 予約設定
     * @returns 予約結果
     */
    async executeReservationProcess(config: ReservationConfig): Promise<ReservationResult> {
        return await this.runWithCancellation('reservation', async (signal) => {
            return await this.reservationLoop(config, signal);
        });
    }


    /**
     * 統一効率モード待機処理実行
     * @param targetTime 目標時刻
     * @returns Promise<void>
     */
    async executeEfficiencyWait(targetTime: Date): Promise<void> {
        return await this.runWithCancellation('efficiency-wait', async (signal) => {
            await this.waitForTargetTime(targetTime, signal);
        });
    }

    // ============================================================================
    // 中断可能待機システム
    // ============================================================================

    /**
     * 中断可能待機（100ms間隔で中断チェック）
     * @param ms 待機時間（ミリ秒）
     * @param signal 中断シグナル
     */
    async waitWithCancellation(ms: number, signal: AbortSignal): Promise<void> {
        const checkInterval = 100; // 100ms間隔でチェック
        const endTime = Date.now() + ms;

        while (Date.now() < endTime) {
            this.throwIfAborted(signal);

            const remainingMs = endTime - Date.now();
            const waitMs = Math.min(checkInterval, remainingMs);

            if (waitMs <= 0) break;

            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }

    /**
     * 効率モード用精密待機（タイミング精度維持）
     * @param targetTime 目標時刻
     * @param signal 中断シグナル
     */
    async waitForTargetTime(targetTime: Date, signal: AbortSignal): Promise<void> {
        const totalWaitMs = targetTime.getTime() - Date.now();
        
        if (totalWaitMs <= 0) {
            return; // 既に目標時刻を過ぎている
        }

        if (totalWaitMs > 1000) {
            // 長時間待機は100ms間隔で分割
            const longWaitMs = totalWaitMs - 100; // 最後100msは精密待機
            logger.info('統一効率モード待機', { waitSeconds: Math.floor(longWaitMs/1000) });
            await this.waitWithCancellation(longWaitMs, signal);
        }

        // 最終精密調整（100ms以下）
        const finalWaitMs = targetTime.getTime() - Date.now();
        if (finalWaitMs > 0) {
            // 短時間は通常のsetTimeoutで精度を保つ
            await new Promise(resolve => setTimeout(resolve, finalWaitMs));
        }
    }

    // ============================================================================
    // DOM操作の中断対応（Phase 3で実装）
    // ============================================================================

    /**
     * 中断可能なDOM要素待機
     * @param selector セレクター
     * @param timeout タイムアウト時間
     * @param signal 中断シグナル
     * @returns 見つかったHTMLElement
     */
    async waitForElementWithCancellation(
        selector: string,
        timeout: number,
        signal: AbortSignal
    ): Promise<HTMLElement> {
        const checkInterval = 100;
        const endTime = Date.now() + timeout;

        while (Date.now() < endTime) {
            this.throwIfAborted(signal);

            const element = document.querySelector(selector) as HTMLElement;
            if (element) {
                return element;
            }

            const remainingTime = endTime - Date.now();
            const waitTime = Math.min(checkInterval, remainingTime);
            if (waitTime > 0) {
                await this.waitWithCancellation(waitTime, signal);
            }
        }

        throw new Error(`要素が見つかりません: ${selector}`);
    }

    /**
     * 中断可能な複数要素待機
     * @param selectors セレクター辞書
     * @param timeout タイムアウト時間
     * @param signal 中断シグナル
     * @param selectorTexts テキスト条件辞書
     * @returns 見つかった要素情報
     */
    async waitForAnyElementWithCancellation(
        selectors: Record<string, string>,
        timeout: number,
        signal: AbortSignal,
        selectorTexts: Record<string, string> = {}
    ): Promise<{ key: string, element: HTMLElement }> {
        const checkInterval = 100;
        const endTime = Date.now() + timeout;

        while (Date.now() < endTime) {
            this.throwIfAborted(signal);

            // 全てのセレクターをチェック
            for (const [key, selector] of Object.entries(selectors)) {
                const elements = document.querySelectorAll(selector);
                
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i] as HTMLElement;
                    if (selectorTexts[key]) {
                        if (element.textContent && element.textContent.includes(selectorTexts[key])) {
                            return { key, element };
                        }
                    } else {
                        if (element) {
                            return { key, element };
                        }
                    }
                }
            }

            const remainingTime = endTime - Date.now();
            const waitTime = Math.min(checkInterval, remainingTime);
            if (waitTime > 0) {
                await this.waitWithCancellation(waitTime, signal);
            }
        }

        throw new Error(`いずれの要素も見つかりません: ${Object.keys(selectors).join(', ')}`);
    }

    // ============================================================================
    // 処理実装（将来のPhase 3で実装予定）
    // ============================================================================

    /**
     * 統一予約処理ループ（Phase 3で実装）
     */
    private async reservationLoop(config: ReservationConfig, signal: AbortSignal): Promise<ReservationResult> {
        const { selectors, selectorTexts, timeouts } = config;
        let attempts = 0;
        
        logger.info('統一予約処理ループを開始');
        
        while (true) {
            attempts++;
            logger.debug('試行回数', { attempts });
            
            // 中断チェック
            this.throwIfAborted(signal);
            
            // 対象一貫性検証
            if (this.stateManager && this.stateManager.validateTargetConsistency) {
                if (!this.stateManager.validateTargetConsistency()) {
                    logger.error('予約対象が変更されたため処理を中断');
                    throw new Error('TargetConsistencyError');
                }
            }
            
            // 状態表示更新
            const statusDiv = document.getElementById('reservation-status');
            if (statusDiv) {
                statusDiv.innerText = `試行中... (${attempts}回目)`;
            }
            
            try {
                logger.debug('submitボタンを待機中');
                const submitButton = await this.waitForElementWithCancellation(
                    selectors.submit, 
                    timeouts.waitForSubmit, 
                    signal
                );
                
                // 中断チェック
                this.throwIfAborted(signal);
                
                // 試行回数を状態管理に記録
                if (this.stateManager && this.stateManager.setAttempts) {
                    this.stateManager.setAttempts(attempts);
                }
                
                // 効率モード対応のsubmitクリック実行
                logger.debug('submitボタンをクリック');
                await this.executeEfficiencyTimingSubmit(submitButton, config, signal);
                
                logger.debug('レスポンスを待機中');
                const responseSelectors = {
                    change: selectors.change,
                    success: selectors.success,
                    failure: selectors.failure
                };
                
                const response = await this.waitForAnyElementWithCancellation(
                    responseSelectors, 
                    timeouts.waitForResponse, 
                    signal,
                    selectorTexts
                );
                
                console.log(`レスポンス検出: ${response.key}`);
                
                if (response.key === 'change') {
                    console.log('変更ボタンをクリックして最終結果を待機...');
                    
                    // changeダイアログ出現を記録
                    if (this.stateManager && this.stateManager.markChangeDialogAppeared) {
                        console.log('🔄 changeダイアログ記録を実行...');
                        this.stateManager.markChangeDialogAppeared();
                        console.log('🔄 changeダイアログ記録完了');
                    } else {
                        console.log('⚠️ stateManagerまたはmarkChangeDialogAppeared関数が見つからない');
                    }
                    
                    await this.executeFixedDelayClick(response.element, config, signal);
                    
                    console.log('success/failureを待機中...');
                    const finalSelectors = {
                        success: selectors.success,
                        failure: selectors.failure
                    };
                    
                    console.log(`⏰ 最大${timeouts.waitForResponse / 1000}秒間待機開始...`);
                    const startTime = Date.now();
                    
                    const finalResponse = await this.waitForAnyElementWithCancellation(
                        finalSelectors, 
                        timeouts.waitForResponse, 
                        signal,
                        selectorTexts
                    );
                    
                    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
                    console.log(`✅ 最終レスポンス検出: ${finalResponse.key} (${elapsedTime}秒後)`);
                    
                    if (finalResponse.key === 'success') {
                        console.log('🎉 予約成功！処理を終了します。');
                        return { success: true, attempts };
                    } else {
                        console.log('予約失敗。closeボタンをクリックして再試行します。');
                        const closeButton = await this.waitForElementWithCancellation(
                            selectors.close, 
                            timeouts.waitForClose, 
                            signal
                        );
                        await this.executeFixedDelayClick(closeButton, config, signal);
                        await this.waitWithCancellation(
                            this.getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange), 
                            signal
                        );
                    }
                } else if (response.key === 'success') {
                    console.log('🎉 予約成功！処理を終了します。');
                    return { success: true, attempts };
                } else if (response.key === 'failure') {
                    console.log('予約失敗。closeボタンをクリックして再試行します。');
                    const closeButton = await this.waitForElementWithCancellation(
                        selectors.close, 
                        timeouts.waitForClose, 
                        signal
                    );
                    await this.executeFixedDelayClick(closeButton, config, signal);
                    await this.waitWithCancellation(
                        this.getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange), 
                        signal
                    );
                }
                
            } catch (error: any) {
                // 中断エラーは上位に伝播
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new CancellationError('予約処理が中断されました');
                }
                
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`エラーが発生しました (試行 ${attempts}):`, errorMessage);
                
                // タイムアウトエラーは異常終了
                if (errorMessage.includes('いずれの要素も見つかりません') || errorMessage.includes('要素が見つかりませんでした')) {
                    console.error('🚨 予約処理異常終了: 3分待っても成功/失敗の結果が返りませんでした');
                    return { success: false, attempts, abnormalTermination: true };
                }
                
                // リトライ待機
                await this.waitWithCancellation(
                    this.getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange), 
                    signal
                );
            }
        }
        
        // このコードは実行されない（while(true)のため）
        return { success: false, attempts };
    }


    /**
     * 効率モード対応submitクリック実行（統一処理内部用）
     */
    private async executeEfficiencyTimingSubmit(submitButton: HTMLElement, config: ReservationConfig, signal: AbortSignal): Promise<void> {
        const isEfficiencyMode = this.stateManager && this.stateManager.isEfficiencyModeEnabled ? 
            this.stateManager.isEfficiencyModeEnabled() : false;
        
        // ログ削減: デバッグ情報は不要
        
        if (!isEfficiencyMode) {
            // 通常モード: そのままクリック
            console.log('⚡ 通常モード: 効率待機なしでクリック実行');
            await this.executeStandardClick(submitButton, config, signal);
            return;
        }
        
        // changeダイアログが既に出現している場合は即座押下
        const hasChangeDialogAppeared = this.stateManager && this.stateManager.hasChangeDialogAppeared ?
            this.stateManager.hasChangeDialogAppeared() : false;
        
        if (hasChangeDialogAppeared) {
            // changeダイアログが既に出現済み: submitは即座押下（changeでタイミング調整）
            console.log('⚡ 効率モード: changeダイアログ出現済みのため即座押下');
            await this.executeStandardClick(submitButton, config, signal);
            return;
        }
        
        // 効率モード: 目標時間（00秒/30秒）への調整待機
        console.log('🚀 統一効率モード: submit標的時刻調整開始');
        
        // 効率モードで現在時刻から新しく目標時刻を計算
        if (!this.stateManager || !this.stateManager.calculateNext00or30Seconds) {
            console.error('⚠️ calculateNext00or30Secondsメソッドが利用できません');
            await this.executeStandardClick(submitButton, config, signal);
            return;
        }
        
        // 毎回新しく計算して最新の目標時刻を取得
        const nextTarget = this.stateManager.calculateNext00or30Seconds();
        console.log('🔄 効率モード: 最新の目標時刻を計算');
        
        // 計算した目標時刻を保存
        this.stateManager.setNextSubmitTarget(nextTarget);
        const waitMs = nextTarget.getTime() - Date.now();
        
        console.log(`🎯 統一効率モード待機: 目標時刻 ${nextTarget.toLocaleTimeString()}`);
        console.log(`🎯 待機時間: ${Math.floor(waitMs/1000)}秒`);
        
        if (waitMs < 0) {
            console.warn('⚠️ 目標時刻が過去になっています - 即座実行');
        } else if (waitMs < 15000) {
            console.warn(`⚠️ 待機時間が15秒未満: ${Math.floor(waitMs/1000)}秒`);
        }
        
        await this.waitForTargetTime(nextTarget, signal);
        
        // 標的時刻でsubmitクリック実行
        console.log(`🚀 submitクリック実行 (${new Date().toLocaleTimeString()})`);
        await this.executeStandardClick(submitButton, config, signal);
        
        // submitクリック後、次のサイクル用の目標時刻を即座に更新
        if (this.stateManager && this.stateManager.updateNextSubmitTarget) {
            this.stateManager.updateNextSubmitTarget();
            console.log('⚡ 効率モード: submitクリック後に次回目標時刻を更新');
        }
    }

    /**
     * 効率モード対応changeダイアログクリック実行（統一処理内部用）
     */
    private async executeFixedDelayClick(element: HTMLElement, config: ReservationConfig, signal: AbortSignal): Promise<void> {
        const isEfficiencyMode = this.stateManager && this.stateManager.isEfficiencyModeEnabled ? 
            this.stateManager.isEfficiencyModeEnabled() : false;
        
        // 効率モードかつchangeダイアログのタイミング調整が必要な場合のみ時間調整
        const needsTimingAdjustment = this.stateManager && this.stateManager.needsChangeDialogTimingAdjustment ? 
            this.stateManager.needsChangeDialogTimingAdjustment() : false;
        
        console.log(`🔍 効率モード: ${isEfficiencyMode}, changeダイアログタイミング調整必要: ${needsTimingAdjustment}`);
        
        if (isEfficiencyMode && needsTimingAdjustment) {
            // 効率モード: changeダイアログのタイミング調整が記録されている場合のみ00秒/30秒調整
            console.log('🚀 統一効率モード: changeダイアログ標的時刻調整開始');
            
            // 効率モードで現在時刻から新しく目標時刻を計算
            if (!this.stateManager || !this.stateManager.calculateNext00or30Seconds) {
                console.error('⚠️ calculateNext00or30Secondsメソッドが利用できません');
                await this.executeStandardClick(element, config, signal);
                return;
            }
            
            // 毎回新しく計算して最新の目標時刻を取得
            const nextTarget = this.stateManager.calculateNext00or30Seconds();
            console.log('🔄 効率モード: changeダイアログ用最新目標時刻を計算');
            
            const waitMs = nextTarget.getTime() - Date.now();
            
            console.log(`🎯 統一効率モード待機(change): 目標時刻 ${nextTarget.toLocaleTimeString()}`);
            console.log(`🎯 待機時間(change): ${Math.floor(waitMs/1000)}秒`);
            
            if (waitMs < 0) {
                console.warn('⚠️ 目標時刻が過去になっています - 即座実行');
            } else if (waitMs < 15000) {
                console.warn(`⚠️ 待機時間が15秒未満: ${Math.floor(waitMs/1000)}秒`);
            }
            
            await this.waitForTargetTime(nextTarget, signal);
            
            console.log(`🚀 changeダイアログクリック実行 (${new Date().toLocaleTimeString()})`);
            
            // タイミング調整完了を記録
            if (this.stateManager && this.stateManager.markChangeDialogTimingAdjusted) {
                this.stateManager.markChangeDialogTimingAdjusted();
            }
        } else if (isEfficiencyMode) {
            // 効率モードだがchangeダイアログのタイミング調整が不要な場合は通常の固定待機
            const randomDelay = 1500 + Math.random() * 1500; // 1500~3000ms
            console.log(`⏳ 効率モード固定待機(changeダイアログ記録なし): ${Math.round(randomDelay)}ms`);
            
            await this.waitWithCancellation(randomDelay, signal);
        }
        
        // 通常のクリック処理
        await this.executeStandardClick(element, config, signal);
    }

    /**
     * 標準クリック実行（統一処理内部用）
     */
    private async executeStandardClick(element: HTMLElement, config: ReservationConfig, signal: AbortSignal): Promise<void> {
        // 中断チェック
        this.throwIfAborted(signal);
        
        // クリック実行
        element.click();
        
        // クリック後の待機
        const delay = this.getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange);
        await this.waitWithCancellation(delay, signal);
    }

    /**
     * ランダム待機時間計算（統一処理内部用）
     */
    private getRandomWaitTime(minTime: number, randomRange: number): number {
        return minTime + Math.floor(Math.random() * randomRange);
    }

    // ============================================================================
    // ユーティリティメソッド
    // ============================================================================

    /**
     * 即座中断
     */
    abort(): void {
        if (this.controller) {
            console.log('🛑 統一自動処理を即座中断');
            this.controller.abort();
        }
    }

    /**
     * 現在の処理状態取得
     */
    getCurrentProcess(): string {
        return this.currentProcess;
    }

    /**
     * 処理実行中かどうか
     */
    isRunning(): boolean {
        return this.currentProcess !== 'idle' && this.controller !== null;
    }

    /**
     * 中断チェック（AbortSignal使用）
     * @param signal 中断シグナル
     */
    private throwIfAborted(signal: AbortSignal): void {
        if (signal.aborted) {
            throw new Error('AbortError');
        }
    }

    /**
     * 処理終了時のクリーンアップ
     */
    private cleanup(): void {
        this.currentProcess = 'idle';
        this.controller = null;
        console.log('🧹 統一自動処理クリーンアップ完了');
    }
}