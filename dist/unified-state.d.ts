/**
 * 統一状態管理システム
 * 予約・監視の状態と対象を一元管理
 */
export declare enum ExecutionState {
    IDLE = "idle",
    RESERVATION_RUNNING = "reservation_running",
    MONITORING_RUNNING = "monitoring_running"
}
export declare enum PriorityMode {
    AUTO = "auto",// 自動判定（予約優先）
    FORCE_RESERVATION = "force_reservation",// 予約強制実行
    FORCE_MONITORING = "force_monitoring"
}
export interface ReservationTarget {
    timeSlot: string;
    locationIndex: number;
    selector: string;
    isValid: boolean;
}
export interface MonitoringTarget {
    timeSlot: string;
    locationIndex: number;
    selector: string;
    priority: number;
    status: 'full' | 'available';
}
export declare class LocationHelper {
    static getLocationFromIndex(index: number): 'east' | 'west';
    static getIndexFromLocation(location: 'east' | 'west'): number;
    static getIndexFromSelector(selector: string): number;
    static getIndexFromElement(tdElement: HTMLTableCellElement): number;
    static generateTimeLocationKey(timeSlot: string, locationIndex: number): string;
    static formatTargetInfo(timeSlot: string, locationIndex: number): string;
}
export declare class UnifiedStateManager {
    private executionState;
    private reservationTarget;
    private monitoringTargets;
    private priorityMode;
    private debugMode;
    getExecutionState(): ExecutionState;
    startReservation(): boolean;
    startMonitoring(): boolean;
    stop(): void;
    setReservationTarget(timeSlot: string, locationIndex: number, selector?: string): void;
    clearReservationTarget(): void;
    addMonitoringTarget(timeSlot: string, locationIndex: number, selector: string): boolean;
    removeMonitoringTarget(timeSlot: string, locationIndex: number): boolean;
    clearMonitoringTargets(): void;
    canStartReservation(): boolean;
    canStartMonitoring(): boolean;
    canInterrupt(): boolean;
    getPreferredAction(): 'reservation' | 'monitoring' | 'none';
    setPriorityMode(mode: PriorityMode): void;
    migrateFromExisting(): void;
    getFabButtonState(): 'enabled' | 'disabled' | 'running' | 'monitoring';
    getFabButtonText(): string;
    getReservationTarget(): ReservationTarget | null;
    getMonitoringTargets(): MonitoringTarget[];
    hasReservationTarget(): boolean;
    hasMonitoringTargets(): boolean;
    getMonitoringTargetCount(): number;
    private log;
    private extractTimeTextFromElement;
    debugInfo(): void;
}
