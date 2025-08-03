/**
 * 入場予約UI管理クラス
 */
import type { EntranceReservationConfig, TimeSlotInfo, MonitoringState, EntranceReservationState, ComponentState } from '@/types';
export interface EntranceUICallbacks {
    onStartReservation: () => Promise<void>;
    onStopReservation: () => void;
    onStartMonitoring: (timeSlot: TimeSlotInfo) => Promise<void>;
    onStopMonitoring: () => void;
}
export declare class EntranceUIManager {
    private config;
    private callbacks;
    private mainButton?;
    private statusBadge?;
    private monitorButtons;
    private errorMessageElement?;
    constructor(config: EntranceReservationConfig, callbacks: EntranceUICallbacks);
    /**
     * UI要素を作成・挿入
     */
    createUI(): Promise<void>;
    /**
     * メインボタン作成
     */
    private createMainButton;
    /**
     * 時間帯監視ボタン作成
     */
    private createTimeSlotMonitorButtons;
    /**
     * 時間帯分析
     */
    private analyzeTimeSlots;
    /**
     * 時間帯に監視ボタンを追加
     */
    private addMonitorButtonToSlot;
    /**
     * メインボタンクリック処理
     */
    private handleMainButtonClick;
    /**
     * 監視ボタンクリック処理
     */
    private handleMonitorButtonClick;
    /**
     * メインボタン表示更新
     */
    updateMainButton(state: ComponentState, reservationState?: EntranceReservationState, monitoringState?: MonitoringState): void;
    /**
     * 監視ボタン更新
     */
    updateMonitorButton(timeSlot: string, isMonitoring: boolean): void;
    /**
     * エラーメッセージ表示
     */
    showErrorMessage(message: string): void;
    /**
     * エラーメッセージクリア
     */
    clearErrorMessage(): void;
    /**
     * UI要素クリーンアップ
     */
    cleanup(): void;
    /**
     * td要素の一意セレクタ生成
     */
    private generateUniqueTdSelector;
    /**
     * td要素の行インデックス取得
     */
    private getTdRowIndex;
    /**
     * td要素の列インデックス取得
     */
    private getTdCellIndex;
}
//# sourceMappingURL=ui-manager.d.ts.map