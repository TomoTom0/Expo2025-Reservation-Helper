/**
 * テスト用のエクスポートヘルパー
 * TypeScriptモジュールからテストで必要な関数をCommonJS形式でエクスポート
 */

// 必要なモジュールをインポート
import { multiTargetManager, timeSlotState } from './section2';
import { generateUniqueTdSelector, getTdPositionInfo, findSameTdElement, extractTdStatus, timeSlotSelectors } from './section4';
import { checkTimeSlotTableExistsSync, validatePageLoaded } from './section5';
import { isInterruptionAllowed } from './section6';
import { checkVisitTimeButtonState, canStartReservation } from './section7';

// CommonJS形式でエクスポート
module.exports = {
    // Section 2からの状態オブジェクト
    multiTargetManager,
    timeSlotState,
    
    // Section 4からの関数
    generateUniqueTdSelector,
    getTdPositionInfo,
    findSameTdElement,
    extractTdStatus,
    timeSlotSelectors,
    
    // Section 5からの関数
    checkTimeSlotTableExistsSync,
    validatePageLoaded,
    
    // Section 6からの関数
    isInterruptionAllowed,
    
    // Section 7からの関数
    checkVisitTimeButtonState,
    canStartReservation
};