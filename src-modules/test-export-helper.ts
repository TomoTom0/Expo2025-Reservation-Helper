/**
 * テスト用のエクスポートヘルパー
 * TypeScriptモジュールからテストで必要な関数をCommonJS形式でエクスポート
 */

// 必要なモジュールをインポート
import { timeSlotState } from './entrance-page-state';
import { generateUniqueTdSelector, getTdPositionInfo, findSameTdElement, extractTdStatus, timeSlotSelectors } from './entrance-page-selectors';
import { checkTimeSlotTableExistsSync, validatePageLoaded } from './entrance-page-monitor';
import { isInterruptionAllowed } from './entrance-page-ui';
import { checkVisitTimeButtonState, canStartReservation } from './entrance-page-fab';

// CommonJS形式でエクスポート
module.exports = {
    // Section 2からの状態オブジェクト
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