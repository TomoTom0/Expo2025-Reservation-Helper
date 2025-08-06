// ============================================================================
// 【2. 状態管理オブジェクト】
// ============================================================================

import type { 
    EntranceReservationState, 
    TimeSlotState, 
    PageLoadingState, 
    ReloadCountdownState, 
    CalendarWatchState 
} from '../types/index.js';

let entranceReservationState: EntranceReservationState = {
    isRunning: false,
    shouldStop: false,
    startTime: null,
    attempts: 0
};

// 時間帯監視機能の状態管理
let timeSlotState: TimeSlotState = {
    mode: 'idle',  // idle, selecting, monitoring, trying
    targetSlots: [],   // 複数選択対象の時間帯情報配列
    monitoringInterval: null,  // 監視用インターバル
    isMonitoring: false,
    retryCount: 0,
    maxRetries: 100,
    reloadInterval: 30000  // 30秒間隔
};


// ページ読み込み状態管理
const pageLoadingState: PageLoadingState = {
    isLoading: false,
    startTime: null,
    timeout: 10000
};

// リロードカウントダウン状態管理
const reloadCountdownState: ReloadCountdownState = {
    isActive: false,
    timeLeft: 0,
    intervalId: null,
    onComplete: null,
    totalSeconds: 30,
    secondsRemaining: null,
    startTime: null,
    countdownInterval: null,
    reloadTimer: null
};

// カレンダー監視状態管理
const calendarWatchState: CalendarWatchState = {
    isWatching: false,
    observer: null,
    currentSelectedDate: null
};

// エクスポート
export {
    entranceReservationState,
    timeSlotState,
    pageLoadingState,
    reloadCountdownState,
    calendarWatchState
};
