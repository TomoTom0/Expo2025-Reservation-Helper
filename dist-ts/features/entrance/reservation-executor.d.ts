/**
 * 入場予約実行エンジン
 */
import type { EntranceReservationConfig, EntranceReservationState, TimeSlotInfo } from '@/types';
export declare class ReservationExecutor {
    private config;
    private state;
    constructor(config: EntranceReservationConfig);
    /**
     * 予約実行開始
     */
    startReservation(timeSlot?: TimeSlotInfo): Promise<boolean>;
    /**
     * 予約処理の実行
     */
    private executeReservationProcess;
    /**
     * 訪問時間ボタンの状態確認
     */
    private checkVisitTimeButtonState;
    /**
     * 時間帯選択
     */
    private selectTimeSlot;
    /**
     * 予約確定処理
     */
    private confirmReservation;
    /**
     * リトライ前の待機
     */
    private waitBeforeRetry;
    /**
     * 予約処理停止
     */
    stopReservation(): void;
    /**
     * 現在の状態取得
     */
    getState(): EntranceReservationState;
    /**
     * 予約処理中かどうか
     */
    isRunning(): boolean;
    /**
     * 予約統計情報
     */
    getStats(): {
        isRunning: boolean;
        attempts: number;
        elapsedTimeMs: number;
        elapsedMinutes: number;
        lastError: string | undefined;
    };
    /**
     * 予約可能状態チェック
     */
    canStartReservation(): Promise<{
        canStart: boolean;
        reason?: string;
    }>;
}
//# sourceMappingURL=reservation-executor.d.ts.map