import type { EntranceReservationState, TimeSlotState, PageLoadingState, ReloadCountdownState, CalendarWatchState } from '../types/index.js';
declare let entranceReservationState: EntranceReservationState;
declare let timeSlotState: TimeSlotState;
declare const pageLoadingState: PageLoadingState;
declare const reloadCountdownState: ReloadCountdownState;
declare const calendarWatchState: CalendarWatchState;
interface FABVisibilityState {
    isVisible: boolean;
    cacheKey: string;
}
declare const fabVisibilityState: FABVisibilityState;
declare function loadFABVisibility(): void;
declare function saveFABVisibility(isVisible: boolean): void;
declare function toggleFABVisibility(): void;
declare function updateFABVisibility(): void;
export declare function createFABToggleButton(): void;
export { entranceReservationState, timeSlotState, pageLoadingState, reloadCountdownState, calendarWatchState, fabVisibilityState, loadFABVisibility, saveFABVisibility, toggleFABVisibility, updateFABVisibility };
