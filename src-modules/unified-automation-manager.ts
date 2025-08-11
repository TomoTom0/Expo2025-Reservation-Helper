/**
 * 統一自動処理管理システム
 * 
 * 全ての自動処理（予約、監視、効率モード待機）を統一管理し、
 * AbortController による即座中断を実現
 */

// 型定義のインポート
import type { ReservationConfig, ReservationResult } from '../types/index.js';

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
    private currentProcess: 'idle' | 'reservation' | 'monitoring' | 'efficiency-wait' = 'idle';
    private stateManager: any; // EntranceReservationStateManager への循環参照回避

    constructor(stateManager: any) {
        this.stateManager = stateManager;
        console.log('🔧 統一自動処理管理システム初期化', this.stateManager ? '完了' : '失敗');
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
        processType: 'reservation' | 'monitoring' | 'efficiency-wait',
        executor: (signal: AbortSignal) => Promise<T>
    ): Promise<T> {
        this.currentProcess = processType;
        this.controller = new AbortController();

        try {
            console.log(`🚀 統一自動処理開始: ${processType}`);
            return await executor(this.controller.signal);
        } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                const cancellationError = new CancellationError(`${processType} was cancelled`);
                console.log(`⏹️ 統一自動処理中断: ${processType}`);
                throw cancellationError;
            }
            console.error(`❌ 統一自動処理エラー: ${processType}`, error);
            throw error;
        } finally {
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
     * 統一監視処理実行（将来実装）
     */
    async executeMonitoringProcess(): Promise<void> {
        return await this.runWithCancellation('monitoring', async (signal) => {
            return await this.monitoringLoop(signal);
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
            console.log(`🎯 統一効率モード待機: ${Math.floor(longWaitMs/1000)}秒`);
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
    // DOM操作の中断対応（Phase 3で実装予定）
    // ============================================================================

    /*
    // Phase 3で実装予定: 中断可能なDOM要素待機
    private async waitForElementWithCancellation(
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

            await this.waitWithCancellation(checkInterval, signal);
        }

        throw new Error(`要素が見つかりません: ${selector}`);
    }
    */

    // ============================================================================
    // 処理実装（将来のPhase 3で実装予定）
    // ============================================================================

    /**
     * 予約処理ループ（Phase 3で実装予定）
     */
    private async reservationLoop(_config: ReservationConfig, _signal: AbortSignal): Promise<ReservationResult> {
        // Phase 3で entranceReservationHelper() から移植予定
        console.log('🚧 予約処理ループ - Phase 3で実装予定');
        
        // 暫定実装: 既存処理に委譲
        throw new Error('予約処理ループは Phase 3 で実装予定です');
    }

    /**
     * 監視処理ループ（将来実装予定）
     */
    private async monitoringLoop(_signal: AbortSignal): Promise<void> {
        // 将来の監視処理統一時に実装
        console.log('🚧 監視処理ループ - 将来実装予定');
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