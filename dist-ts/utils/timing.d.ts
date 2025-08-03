/**
 * タイミング制御ユーティリティ
 */
import type { WaitTimeConfig } from '@/types';
export declare class TimingUtils {
    /**
     * ランダム待機時間を生成（BAN防止）
     */
    static getRandomWaitTime(config: WaitTimeConfig): number;
    /**
     * 指定時間待機
     */
    static wait(milliseconds: number): Promise<void>;
    /**
     * ランダム待機
     */
    static randomWait(config: WaitTimeConfig): Promise<void>;
    /**
     * タイムアウト付き実行
     */
    static withTimeout<T>(promise: Promise<T>, timeoutMs: number, errorMessage?: string): Promise<T>;
    /**
     * リトライ機能付き実行
     */
    static withRetry<T>(operation: () => Promise<T>, maxRetries: number, retryDelay?: number): Promise<T>;
    /**
     * インターバル実行（停止可能）
     */
    static createInterval(callback: () => void | Promise<void>, intervalMs: number): () => void;
    /**
     * ランダムインターバル実行
     */
    static createRandomInterval(callback: () => void | Promise<void>, config: WaitTimeConfig): () => void;
    /**
     * デバウンス（重複実行防止）
     */
    static debounce<T extends (...args: any[]) => void>(func: T, delayMs: number): (...args: Parameters<T>) => void;
    /**
     * スロットル（実行頻度制限）
     */
    static throttle<T extends (...args: any[]) => void>(func: T, limitMs: number): (...args: Parameters<T>) => void;
}
//# sourceMappingURL=timing.d.ts.map