// ==UserScript==
// @name         yt-Expo2025-Reservation-Helper
// @namespace    http://staybrowser.com/
// @version      0.3
// @description  help expo2025 ticket site
// @author       TomoTom0 https://github.com/TomoTom0
// @match        https://ticket.expo2025.or.jp/event_search/*
// @grant       none
// @run-at       document-end
// ==/UserScript==

// Section 1からのimport
import {
    insert_style,
    prepare_filter, 
    init_page,
    judge_init,
    judge_entrance_init,
    init_entrance_page,
    getRandomWaitTime,
    waitForElement,
    waitForAnyElement,
    clickElement
} from './section1';

// Section 2からのimport
import {
    entranceReservationState,
    timeSlotState,
    multiTargetManager,
    pageLoadingState,
    reloadCountdownState,
    calendarWatchState
} from './section2';

// Section 3からのimport
import {
    createCacheManager
} from './section3';

// Section 4からのimport
import {
    timeSlotSelectors,
    generateUniqueTdSelector,
    getTdPositionInfo,
    findSameTdElement,
    extractTdStatus,
    initTimeSlotMonitoring,
    waitForCalendar
} from './section4';

// Section 5からのimport
import {
    setCacheManager,
    setExternalFunctions,
    startTimeSlotTableObserver,
    waitForTimeSlotTable,
    checkTimeSlotTableExistsSync,
    analyzeAndAddMonitorButtons,
    analyzeTimeSlots,
    extractTimeSlotInfo,
    generateSelectorForElement,
    addMonitorButtonsToFullSlots,
    getMonitorButtonText,
    updateAllMonitorButtonPriorities,
    createMonitorButton,
    handleMonitorButtonClick,
    startSlotMonitoring,
    checkSlotAvailabilityAndReload,
    findTargetSlotInPage,
    terminateMonitoring,
    checkTargetElementExists,
    checkTimeSlotTableExistsAsync,
    validatePageLoaded,
    checkMaxReloads
} from './section5';

// Section 6からのimport
import {
    setCacheManagerForSection6,
    getCurrentSelectedCalendarDate,
    clickCalendarDate,
    tryClickCalendarForTimeSlot,
    showErrorMessage,
    resetMonitoringUI,
    selectTimeSlotAndStartReservation,
    stopSlotMonitoring,
    getCurrentEntranceConfig,
    resetPreviousSelection,
    disableOtherMonitorButtons,
    enableAllMonitorButtons,
    disableAllMonitorButtons,
    clearExistingMonitorButtons,
    getCurrentTableContent,
    shouldUpdateMonitorButtons,
    restoreSelectionAfterUpdate,
    updateMainButtonDisplay,
    getCurrentMode,
    updateStatusBadge,
    getTargetDisplayInfo,
    startReloadCountdown,
    stopReloadCountdown,
    setPageLoadingState,
    isInterruptionAllowed,
    restoreFromCache
} from './section6';

// Section 7からのimport
import {
    createEntranceReservationUI,
    updateMonitoringTargetsDisplay,
    getCurrentReservationTarget,
    checkVisitTimeButtonState,
    checkTimeSlotSelected,
    canStartReservation,
    checkInitialState,
    startCalendarWatcher,
    handleCalendarChange,
    removeAllMonitorButtons,
    entranceReservationHelper
} from './section7';

// Section 8からのimport
import './section8';
