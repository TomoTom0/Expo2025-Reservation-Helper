/**
 * 時間帯監視エンジン
 */
import type { TimeSlotInfo, MonitoringState } from '@/types';
export declare class TimeSlotMonitoringEngine {
    private state;
    private stopMonitoring?;
    private readonly selectors;
    private readonly MAX_RETRIES;
    constructor();
    /**
     * 監視開始
     */
    startMonitoring(targetSlot: TimeSlotInfo): Promise<void>;
    /**
     * 監視停止
     */
    stopMonitoringManual(): void;
    /**
     * 監視チェック実行
     */
    private performMonitoringCheck;
    /**
     * ページ状態検証
     */
    private validatePageState;
    /**
     * ページ内で対象時間帯を検索
     */
    private findTargetSlotInPage;
    /**
     * 時間帯の状態を抽出
     */
    private extractSlotStatus;
    /**
     * 利用可能状態検出時の処理
     */
    private handleAvailabilityDetected;
    /**
     * ページリロード実行
     */
    private performPageReload;
    /**
     * 監視異常終了
     */
    private terminateMonitoring;
    /**
     * 監視クリーンアップ
     */
    private cleanupMonitoring;
    /**
     * 現在の監視状態を取得
     */
    getMonitoringState(): MonitoringState;
    /**
     * 監視中かどうか
     */
    isCurrentlyMonitoring(): boolean;
    /**
     * 監視統計情報
     */
    getStats(): {
        isMonitoring: boolean;
        targetTimeSlot: string | null;
        attempts: number;
        retryCount: number;
        elapsedTimeMs: number;
        elapsedMinutes: number;
    };
}
//# sourceMappingURL=monitoring-engine.d.ts.map