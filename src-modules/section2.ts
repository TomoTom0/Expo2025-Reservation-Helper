// ============================================================================
// 【2. 状態管理オブジェクト】
// ============================================================================

import type { 
    EntranceReservationState, 
    TimeSlotState, 
    TimeSlotTarget,
    MultiTargetManager, 
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

// 複数監視対象管理のヘルパー関数
const multiTargetManager: MultiTargetManager = {
    // 監視対象を追加
    addTarget(slotInfo: TimeSlotTarget): boolean {
        // 時間+位置（東西）で一意性を判定
        const existingIndex = timeSlotState.targetSlots.findIndex(
            slot => slot.timeText === slotInfo.timeText && 
                   slot.tdSelector === slotInfo.tdSelector
        );
        
        if (existingIndex === -1) {
            timeSlotState.targetSlots.push(slotInfo);
            // 位置情報を含めたログ出力
            const locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
            console.log(`✅ 監視対象を追加: ${slotInfo.timeText} ${locationInfo} (総数: ${timeSlotState.targetSlots.length})`);
            return true;
        } else {
            const locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
            console.log(`⚠️ 監視対象は既に選択済み: ${slotInfo.timeText} ${locationInfo}`);
            return false;
        }
    },
    
    // 監視対象を削除（時間+位置で特定）
    removeTarget(timeText: string, tdSelector: string): boolean {
        const initialLength = timeSlotState.targetSlots.length;
        timeSlotState.targetSlots = timeSlotState.targetSlots.filter(
            slot => !(slot.timeText === timeText && slot.tdSelector === tdSelector)
        );
        
        // 削除された場合の処理
        if (timeSlotState.targetSlots.length < initialLength) {
            const locationInfo = this.getLocationFromSelector(tdSelector);
            console.log(`✅ 監視対象を削除: ${timeText} ${locationInfo} (残り: ${timeSlotState.targetSlots.length})`);
            return true;
        }
        return false;
    },
    
    // 監視対象をすべてクリア
    clearAll(): void {
        const count = timeSlotState.targetSlots.length;
        timeSlotState.targetSlots = [];
        console.log(`✅ すべての監視対象をクリア (${count}個)`);
    },
    
    // 監視対象が存在するかチェック
    hasTargets(): boolean {
        return timeSlotState.targetSlots.length > 0;
    },
    
    // 特定の監視対象が選択済みかチェック（時間+位置）
    isSelected(timeText: string, tdSelector: string): boolean {
        return timeSlotState.targetSlots.some(
            slot => slot.timeText === timeText && slot.tdSelector === tdSelector
        );
    },
    
    // 監視対象のリストを取得
    getTargets(): TimeSlotTarget[] {
        return [...timeSlotState.targetSlots];
    },
    
    // 監視対象の数を取得
    getCount(): number {
        return timeSlotState.targetSlots.length;
    },
    
    // tdSelectorから位置情報（東西）を推定
    getLocationFromSelector(tdSelector: string): string {
        if (!tdSelector) return '不明';
        
        // nth-child の値から東西を推定
        // 同じ時間の場合、0番目が東、1番目が西という仕様
        const cellMatch = tdSelector.match(/td:nth-child\((\d+)\)/);
        if (cellMatch && cellMatch[1]) {
            const cellIndex = parseInt(cellMatch[1]) - 1; // nth-childは1ベース
            if (cellIndex === 0) return '東';
            if (cellIndex === 1) return '西';
        }
        
        return '不明';
    }
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
    multiTargetManager,
    pageLoadingState,
    reloadCountdownState,
    calendarWatchState
};
