/**
 * メインアプリケーションクラス
 */
export interface AppConfig {
    debug?: boolean;
    enablePavilionFeatures?: boolean;
    enableEntranceFeatures?: boolean;
}
export declare class App {
    private pavilionService?;
    private entranceService?;
    private urlObserverCleanup?;
    private config;
    constructor(config?: AppConfig);
    /**
     * アプリケーション開始
     */
    start(): Promise<void>;
    /**
     * パビリオン機能初期化
     */
    private initializePavilionFeatures;
    /**
     * 入場予約機能初期化
     */
    private initializeEntranceFeatures;
    /**
     * アプリケーション停止
     */
    stop(): Promise<void>;
    /**
     * 現在の状態取得
     */
    getStatus(): {
        pavilionService: (import("../types").PavilionState & {
            initialized: boolean;
        }) | undefined;
        entranceService: {
            initialized: boolean;
            reservationState: import("../types").EntranceReservationState;
            monitoringState: import("../types").MonitoringState;
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
            config: import("../types").EntranceReservationConfig;
        } | undefined;
        config: Required<AppConfig>;
    };
    /**
     * デバッグログ出力
     */
    private log;
}
//# sourceMappingURL=app.d.ts.map