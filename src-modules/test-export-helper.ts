/**
 * テスト用のエクスポートヘルパー
 * TypeScriptモジュールからテストで必要な関数をCommonJS形式でエクスポート
 */

// 必要なモジュールをインポート
// import { timeSlotState } from './entrance-page-state'; // 統合により不要
import { generateUniqueTdSelector, getTdPositionInfo, findSameTdElement, extractTdStatus, timeSlotSelectors } from './entrance-page-dom-utils';
import { checkTimeSlotTableExistsSync, validatePageLoaded } from './entrance-page-core';
import { isInterruptionAllowed } from './entrance-page-core';
import { checkVisitTimeButtonState, canStartReservation } from './entrance-page-fab';

// 入場予約状態管理システムからのインポート
import { entranceReservationStateManager } from './entrance-reservation-state-manager';

// CommonJS形式でエクスポート
module.exports = {
    // 統合された状態管理システム
    entranceReservationStateManager,
    
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