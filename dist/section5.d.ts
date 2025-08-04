import type { TimeSlotInfo, TimeSlotTarget, CacheManager } from '../types/index.js';
export declare const setExternalFunctions: (funcs: Record<string, any>) => void;
export declare const setCacheManager: (cm: CacheManager) => void;
declare global {
    interface Window {
        timeSlotCheckTimeout?: number;
    }
}
declare function startTimeSlotTableObserver(): void;
declare function waitForTimeSlotTable(timeout?: number): Promise<boolean>;
declare function checkTimeSlotTableExistsSync(): boolean;
declare function analyzeAndAddMonitorButtons(): void;
interface AnalysisResult {
    available: TimeSlotInfo[];
    full: TimeSlotInfo[];
    selected: TimeSlotInfo[];
}
declare function analyzeTimeSlots(): AnalysisResult;
declare function extractTimeSlotInfo(buttonElement: HTMLElement): TimeSlotInfo | null;
declare function generateSelectorForElement(element: HTMLElement): string;
declare function addMonitorButtonsToFullSlots(fullSlots: TimeSlotInfo[]): void;
declare function getMonitorButtonText(slotInfo: TimeSlotInfo): string;
declare function updateAllMonitorButtonPriorities(): void;
declare function createMonitorButton(slotInfo: TimeSlotInfo): void;
declare function handleMonitorButtonClick(slotInfo: TimeSlotInfo, buttonElement: HTMLButtonElement): void;
declare function startSlotMonitoring(): Promise<void>;
declare function checkSlotAvailabilityAndReload(): Promise<void>;
declare function findTargetSlotInPage(): any;
declare function terminateMonitoring(errorCode: string, errorMessage: string): void;
declare function checkTargetElementExists(targetInfo: TimeSlotTarget): boolean;
declare function checkTimeSlotTableExistsAsync(): Promise<boolean>;
declare function validatePageLoaded(): boolean;
declare function checkMaxReloads(currentCount: number): boolean;
export { startTimeSlotTableObserver, waitForTimeSlotTable, checkTimeSlotTableExistsSync, analyzeAndAddMonitorButtons, analyzeTimeSlots, extractTimeSlotInfo, generateSelectorForElement, addMonitorButtonsToFullSlots, getMonitorButtonText, updateAllMonitorButtonPriorities, createMonitorButton, handleMonitorButtonClick, startSlotMonitoring, checkSlotAvailabilityAndReload, findTargetSlotInPage, terminateMonitoring, checkTargetElementExists, checkTimeSlotTableExistsAsync, validatePageLoaded, checkMaxReloads };
