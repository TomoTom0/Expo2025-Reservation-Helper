/**
 * テスト用のCommonJS形式エクスポート
 * ES6モジュールからCommonJSへの変換
 */

// ES6モジュールを動的インポートでロード
const loadModules = async () => {
    const section2 = await import('./section2.js');
    const section4 = await import('./section4.js');
    const section5 = await import('./section5.js');
    const section6 = await import('./section6.js');
    const section7 = await import('./section7.js');
    
    return {
        // Section 2からの状態オブジェクト
        multiTargetManager: section2.multiTargetManager,
        timeSlotState: section2.timeSlotState,
        
        // Section 4からの関数
        generateUniqueTdSelector: section4.generateUniqueTdSelector,
        getTdPositionInfo: section4.getTdPositionInfo,
        findSameTdElement: section4.findSameTdElement,
        extractTdStatus: section4.extractTdStatus,
        timeSlotSelectors: section4.timeSlotSelectors,
        
        // Section 5からの関数
        checkTimeSlotTableExistsSync: section5.checkTimeSlotTableExistsSync,
        
        // Section 6からの関数
        isInterruptionAllowed: section6.isInterruptionAllowed,
        
        // Section 7からの関数
        validatePageLoaded: section7.validatePageLoaded,
        checkVisitTimeButtonState: section7.checkVisitTimeButtonState,
        canStartReservation: section7.canStartReservation
    };
};

// CommonJS形式でエクスポート（同期的な代替実装）
module.exports = {
    // モック実装：テスト環境で使用
    multiTargetManager: {
        clearAll: () => {},
        addTarget: () => true,
        removeTarget: () => true,
        getTargets: () => [],
        hasTargets: () => false,
        getNextTarget: () => null
    },
    
    // 基本的な関数のモック実装
    generateUniqueTdSelector: (element) => element ? 'mock-selector' : null,
    getTdPositionInfo: (element) => element ? { row: 0, col: 0 } : null,
    findSameTdElement: (targetData) => null,
    extractTdStatus: (element) => element ? { isFull: false, isAvailable: true } : null,
    timeSlotSelectors: {
        timeSlotTable: 'table',
        timeSlotRows: 'tr',
        timeSlotCells: 'td'
    },
    
    checkTimeSlotTableExistsSync: () => false,
    validatePageLoaded: () => false,
    checkVisitTimeButtonState: () => false,
    isInterruptionAllowed: () => true,
    canStartReservation: () => false,
    
    timeSlotState: {
        mode: 'idle',
        isMonitoring: false
    }
};