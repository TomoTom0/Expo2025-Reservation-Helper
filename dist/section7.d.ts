export function setCacheManagerForSection7(cm: any): void;
export function createEntranceReservationUI(config: any): void;
export function updateMonitoringTargetsDisplay(): void;
export function getCurrentReservationTarget(): string;
export function checkVisitTimeButtonState(): boolean;
export function checkTimeSlotSelected(): boolean;
export function canStartReservation(): boolean;
export function checkInitialState(): void;
export function startCalendarWatcher(): void;
export function handleCalendarChange(): void;
export function removeAllMonitorButtons(): void;
export function entranceReservationHelper(config: any): Promise<{
    success: boolean;
    attempts: number;
    cancelled?: undefined;
} | {
    success: boolean;
    attempts: number;
    cancelled: boolean;
}>;
