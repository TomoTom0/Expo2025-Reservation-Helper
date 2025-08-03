/**
 * Integration Test ヘルパー関数
 * 状態管理統合テスト用の共通基盤
 */

/**
 * 状態オブジェクトの初期化とモック設定
 */
function setupStateObjects() {
    const indexModule = require('../src/index.js');
    
    const stateObjects = {
        timeSlotState: indexModule.timeSlotState || {
            mode: 'idle',
            isMonitoring: false,
            retryCount: 0,
            maxRetries: 100,
            reloadInterval: 30000,
            monitoringInterval: null
        },
        entranceReservationState: indexModule.entranceReservationState || {
            isRunning: false,
            shouldStop: false,
            startTime: null,
            attempts: 0
        },
        multiTargetManager: indexModule.multiTargetManager || {
            addTarget: jest.fn(),
            removeTarget: jest.fn(),
            clearAll: jest.fn(),
            hasTargets: jest.fn(() => false),
            isSelected: jest.fn(() => false),
            getTargets: jest.fn(() => []),
            getCount: jest.fn(() => 0)
        },
        cacheManager: indexModule.cacheManager || {
            saveTargetSlots: jest.fn(),
            loadTargetSlots: jest.fn(() => null),
            clearTargetSlots: jest.fn(),
            setMonitoringFlag: jest.fn(),
            getAndClearMonitoringFlag: jest.fn(() => false),
            clearMonitoringFlag: jest.fn()
        },
        calendarWatchState: indexModule.calendarWatchState || {
            observer: null,
            currentSelectedDate: null,
            isWatching: false
        }
    };

    return stateObjects;
}

/**
 * 状態オブジェクトを初期状態にリセット
 */
function resetAllStates(stateObjects) {
    // timeSlotState リセット
    if (stateObjects.timeSlotState) {
        stateObjects.timeSlotState.mode = 'idle';
        stateObjects.timeSlotState.isMonitoring = false;
        stateObjects.timeSlotState.retryCount = 0;
        if (stateObjects.timeSlotState.monitoringInterval) {
            clearInterval(stateObjects.timeSlotState.monitoringInterval);
            stateObjects.timeSlotState.monitoringInterval = null;
        }
    }

    // entranceReservationState リセット
    if (stateObjects.entranceReservationState) {
        stateObjects.entranceReservationState.isRunning = false;
        stateObjects.entranceReservationState.shouldStop = false;
        stateObjects.entranceReservationState.startTime = null;
        stateObjects.entranceReservationState.attempts = 0;
    }

    // multiTargetManager リセット
    if (stateObjects.multiTargetManager) {
        if (stateObjects.multiTargetManager.clearAll && stateObjects.multiTargetManager.clearAll.mockClear) {
            stateObjects.multiTargetManager.clearAll.mockClear();
        }
        if (stateObjects.multiTargetManager.hasTargets && stateObjects.multiTargetManager.hasTargets.mockReturnValue) {
            stateObjects.multiTargetManager.hasTargets.mockReturnValue(false);
        }
        if (stateObjects.multiTargetManager.getTargets && stateObjects.multiTargetManager.getTargets.mockReturnValue) {
            stateObjects.multiTargetManager.getTargets.mockReturnValue([]);
        }
        if (stateObjects.multiTargetManager.getCount && stateObjects.multiTargetManager.getCount.mockReturnValue) {
            stateObjects.multiTargetManager.getCount.mockReturnValue(0);
        }
    }

    // cacheManager リセット
    if (stateObjects.cacheManager) {
        Object.keys(stateObjects.cacheManager).forEach(key => {
            if (stateObjects.cacheManager[key] && typeof stateObjects.cacheManager[key].mockClear === 'function') {
                stateObjects.cacheManager[key].mockClear();
            }
        });
        if (stateObjects.cacheManager.loadTargetSlots && stateObjects.cacheManager.loadTargetSlots.mockReturnValue) {
            stateObjects.cacheManager.loadTargetSlots.mockReturnValue(null);
        }
        if (stateObjects.cacheManager.getAndClearMonitoringFlag && stateObjects.cacheManager.getAndClearMonitoringFlag.mockReturnValue) {
            stateObjects.cacheManager.getAndClearMonitoringFlag.mockReturnValue(false);
        }
    }

    // calendarWatchState リセット
    if (stateObjects.calendarWatchState) {
        stateObjects.calendarWatchState.observer = null;
        stateObjects.calendarWatchState.currentSelectedDate = null;
        stateObjects.calendarWatchState.isWatching = false;
    }
}

/**
 * カレンダーとタイムスロットテーブルのモックDOM作成
 */
function setupCalendarAndTimeSlotTable() {
    const calendarHTML = `
        <div class="calendar-container">
            <button aria-pressed="true">
                <time datetime="2025-04-15">15</time>
            </button>
            <button aria-pressed="false">
                <time datetime="2025-04-16">16</time>
            </button>
        </div>
    `;

    const timeSlotHTML = `
        <table>
            <tr>
                <td data-gray-out="false">
                    <div role="button" data-disabled="false" aria-pressed="false">
                        <dt><span>10:00～10:30</span></dt>
                        <img src="ico_scale_low.svg" alt="空きあり">
                    </div>
                </td>
                <td data-gray-out="false">
                    <div role="button" data-disabled="true" aria-pressed="false">
                        <dt><span>11:00～11:30</span></dt>
                        <img src="calendar_ng.svg" alt="満員">
                    </div>
                </td>
            </tr>
        </table>
    `;

    document.body.innerHTML = calendarHTML + timeSlotHTML;
    return { calendarHTML, timeSlotHTML };
}

/**
 * 監視対象データの作成
 */
function createMockTargetSlots() {
    return [
        {
            timeText: '10:00～10:30',
            tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
            positionInfo: { rowIndex: 0, cellIndex: 0 },
            timestamp: Date.now()
        },
        {
            timeText: '14:00～14:30',
            tdSelector: 'table tr:nth-child(1) td:nth-child(2)[data-gray-out]',
            positionInfo: { rowIndex: 0, cellIndex: 1 },
            timestamp: Date.now()
        }
    ];
}

/**
 * 状態整合性チェック用アサーション関数
 */
const stateAssertions = {
    /**
     * 監視状態の整合性チェック
     */
    expectMonitoringState(stateObjects, expectedState) {
        const { timeSlotState, multiTargetManager, cacheManager } = stateObjects;
        
        expect(timeSlotState.isMonitoring).toBe(expectedState.isMonitoring);
        expect(timeSlotState.mode).toBe(expectedState.mode);
        
        if (expectedState.hasTargets !== undefined) {
            expect(multiTargetManager.hasTargets()).toBe(expectedState.hasTargets);
        }
        
        if (expectedState.cacheSet) {
            expect(cacheManager.setMonitoringFlag).toHaveBeenCalledWith(true);
        }
        
        if (expectedState.cacheCleared) {
            expect(cacheManager.clearMonitoringFlag).toHaveBeenCalled();
        }
    },

    /**
     * 予約状態の整合性チェック
     */
    expectReservationState(stateObjects, expectedState) {
        const { entranceReservationState } = stateObjects;
        
        expect(entranceReservationState.isRunning).toBe(expectedState.isRunning);
        expect(entranceReservationState.shouldStop).toBe(expectedState.shouldStop);
        
        if (expectedState.attempts !== undefined) {
            expect(entranceReservationState.attempts).toBe(expectedState.attempts);
        }
    },

    /**
     * キャッシュ操作の整合性チェック
     */
    expectCacheOperations(stateObjects, expectedOperations) {
        const { cacheManager } = stateObjects;
        
        if (expectedOperations.saved) {
            expect(cacheManager.saveTargetSlots).toHaveBeenCalled();
        }
        
        if (expectedOperations.loaded) {
            expect(cacheManager.loadTargetSlots).toHaveBeenCalled();
        }
        
        if (expectedOperations.cleared) {
            expect(cacheManager.clearTargetSlots).toHaveBeenCalled();
        }
        
        if (expectedOperations.monitoringFlagSet) {
            expect(cacheManager.setMonitoringFlag).toHaveBeenCalledWith(true);
        }
        
        if (expectedOperations.monitoringFlagCleared) {
            expect(cacheManager.clearMonitoringFlag).toHaveBeenCalled();
        }
    },

    /**
     * 複数状態の同期チェック
     */
    expectStateSync(stateObjects, expectedSync) {
        if (expectedSync.monitoringToCache) {
            const { timeSlotState, cacheManager } = stateObjects;
            if (timeSlotState.isMonitoring) {
                expect(cacheManager.setMonitoringFlag).toHaveBeenCalledWith(true);
            }
        }
        
        if (expectedSync.targetsToCacheSync) {
            const { multiTargetManager, cacheManager } = stateObjects;
            if (multiTargetManager.hasTargets()) {
                expect(cacheManager.saveTargetSlots).toHaveBeenCalled();
            }
        }
    }
};

/**
 * 非同期処理のウェイト関数
 */
async function waitForStateChange(checkFn, timeout = 1000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        if (checkFn()) {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 10));
    }
    return false;
}

/**
 * タイムスタンプベースのキャッシュ期限切れシミュレーション
 */
function simulateCacheExpiry(stateObjects, minutesAgo = 61) {
    const expiredTimestamp = Date.now() - (minutesAgo * 60 * 1000);
    const expiredData = {
        targets: createMockTargetSlots(),
        timestamp: expiredTimestamp
    };
    
    stateObjects.cacheManager.loadTargetSlots.mockReturnValue(expiredData);
    stateObjects.cacheManager.getAndClearMonitoringFlag.mockReturnValue(false);
    
    return expiredData;
}

/**
 * 正常なキャッシュデータのシミュレーション
 */
function simulateValidCache(stateObjects, minutesAgo = 5) {
    const validTimestamp = Date.now() - (minutesAgo * 60 * 1000);
    const validData = {
        targets: createMockTargetSlots(),
        timestamp: validTimestamp
    };
    
    stateObjects.cacheManager.loadTargetSlots.mockReturnValue(validData);
    stateObjects.cacheManager.getAndClearMonitoringFlag.mockReturnValue(true);
    
    return validData;
}

module.exports = {
    setupStateObjects,
    resetAllStates,
    setupCalendarAndTimeSlotTable,
    createMockTargetSlots,
    stateAssertions,
    waitForStateChange,
    simulateCacheExpiry,
    simulateValidCache
};