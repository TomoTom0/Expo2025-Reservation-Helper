/**
 * 入場予約関連の型定義
 */
import type { BaseConfig, ComponentState, WaitTimeConfig } from './common';
export interface EntranceReservationConfig extends BaseConfig {
    retryInterval: number;
    maxRetries: number;
    banPreventionDelay: number;
    enableTimeSlotMonitoring: boolean;
    autoSelectFirstAvailable: boolean;
    waitTimeConfig: WaitTimeConfig;
}
export interface TimeSlotInfo {
    timeText: string;
    status: 'available' | 'full' | 'unknown';
    tdSelector: string;
    rowIndex: number;
    cellIndex: number;
    buttonElement?: HTMLElement;
    priority?: number;
}
export interface MonitoringState {
    isMonitoring: boolean;
    targetSlot: TimeSlotInfo | null;
    retryCount: number;
    startTime: number | null;
    mode: ComponentState;
    attempts: number;
}
export interface EntranceReservationState {
    isRunning: boolean;
    startTime: number | null;
    attempts: number;
    lastError?: string;
}
export interface MultiTargetManager {
    targets: Map<string, TimeSlotInfo>;
    hasTargets(): boolean;
    addTarget(timeText: string, slotInfo: TimeSlotInfo): void;
    removeTarget(timeText: string): void;
    getTargets(): TimeSlotInfo[];
    clear(): void;
}
export interface PageLoadingState {
    isLoading: boolean;
    lastLoadTime: number;
}
export interface ReloadCountdownState {
    isActive: boolean;
    remainingSeconds: number;
    intervalId: number | null;
}
export interface CalendarWatchState {
    isWatching: boolean;
    currentDate: string | null;
    observerId: number | null;
}
export interface TimeSlotSelectors {
    table: string;
    timeSlotButtons: string;
    fullSlotButton: string;
    availableSlotButton: string;
    timeText: string;
    statusIcon: string;
}
export type MonitoringErrorCode = 'ERROR_TARGET_NOT_FOUND' | 'ERROR_TABLE_NOT_FOUND' | 'ERROR_WRONG_PAGE' | 'ERROR_PAGE_LOAD_FAILED' | 'ERROR_MAX_RETRIES_REACHED';
export interface MonitoringTerminationInfo {
    errorCode: MonitoringErrorCode;
    errorMessage: string;
    timestamp: number;
}
//# sourceMappingURL=entrance.d.ts.map