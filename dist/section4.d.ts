import type { TimeSlotSelectors, TdStatus, TimeSlotTarget } from '../types/index.js';
declare const timeSlotSelectors: TimeSlotSelectors;
declare function generateUniqueTdSelector(tdElement: HTMLTableCellElement): string;
declare function getTdPositionInfo(tdElement: HTMLTableCellElement): {
    rowIndex: number;
    cellIndex: number;
};
declare function findSameTdElement(targetInfo: TimeSlotTarget): HTMLTableCellElement | null;
declare function extractTdStatus(tdElement: HTMLTableCellElement): TdStatus | null;
declare function initTimeSlotMonitoring(): Promise<void>;
declare function waitForCalendar(timeout?: number): Promise<boolean>;
export { timeSlotSelectors, generateUniqueTdSelector, getTdPositionInfo, findSameTdElement, extractTdStatus, initTimeSlotMonitoring, waitForCalendar };
