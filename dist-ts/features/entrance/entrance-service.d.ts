/**
 * 入場予約機能のメインサービス
 */
import type { EntranceReservationConfig, EntranceReservationState, MonitoringState } from '@/types';
export declare class EntranceService {
    private config;
    private reservationState;
    private monitoringState;
    private initialized;
    private monitoringEngine;
    private reservationExecutor;
    private uiManager?;
    constructor(config: EntranceReservationConfig);
    /**
     * サービス初期化
     */
    initialize(): Promise<void>;
    /**
     * 予約開始処理
     */
    private handleStartReservation;
    /**
     * 予約停止処理
     */
    private handleStopReservation;
    /**
     * 監視開始処理
     */
    private handleStartMonitoring;
    /**
     * 監視停止処理
     */
    private handleStopMonitoring;
    /**
     * イベントリスナー設定
     */
    private setupEventListeners;
    /**
     * 時間帯利用可能時の処理
     */
    private handleTimeSlotAvailable;
    /**
     * 監視エラー処理
     */
    private handleMonitoringError;
    /**
     * UI状態更新
     */
    private updateUIState;
    /**
     * キャッシュから状態復元
     */
    private restoreFromCache;
    /**
     * クリーンアップ
     */
    cleanup(): Promise<void>;
    /**
     * 現在の状態を取得
     */
    getStatus(): {
        initialized: boolean;
        reservationState: EntranceReservationState;
        monitoringState: MonitoringState;
        monitoringStats: {
            isMonitoring: boolean;
            targetTimeSlot: string | null;
            attempts: number;
            retryCount: number;
            elapsedTimeMs: number;
            elapsedMinutes: number;
        };
        reservationStats: {
            isRunning: boolean;
            attempts: number;
            elapsedTimeMs: number;
            elapsedMinutes: number;
            lastError: string | undefined;
        };
        config: EntranceReservationConfig;
    };
    /**
     * デバッグ情報出力
     */
    debug(): void;
    /**
     * デバッグログ出力
     */
    private log;
}
//# sourceMappingURL=entrance-service.d.ts.map