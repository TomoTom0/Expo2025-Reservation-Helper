/**
 * 状態管理オブジェクトモジュール
 * アプリケーション全体の状態管理を提供
 */

// 入場予約実行状態
export let entranceReservationState = {
    isRunning: false,
    shouldStop: false,
    startTime: null,
    attempts: 0
};

// 時間帯監視機能の状態管理
export let timeSlotState = {
    mode: 'idle',  // idle, selecting, monitoring, trying
    targetSlots: [],   // 複数選択対象の時間帯情報配列
    monitoringInterval: null,  // 監視用インターバル
    isMonitoring: false,
    retryCount: 0,
    maxRetries: 100,
    reloadInterval: 30000  // 30秒間隔
};

// 複数監視対象管理のヘルパー関数
export const multiTargetManager = {
    // 監視対象を追加
    addTarget(slotInfo) {
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
    removeTarget(timeText, tdSelector) {
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
    clearAll() {
        const count = timeSlotState.targetSlots.length;
        timeSlotState.targetSlots = [];
        console.log(`✅ すべての監視対象をクリア (${count}個)`);
    },
    
    // 監視対象が存在するかチェック
    hasTargets() {
        return timeSlotState.targetSlots.length > 0;
    },
    
    // 特定の監視対象が選択済みかチェック（時間+位置）
    isSelected(timeText, tdSelector) {
        return timeSlotState.targetSlots.some(
            slot => slot.timeText === timeText && slot.tdSelector === tdSelector
        );
    },
    
    // 監視対象のリストを取得
    getTargets() {
        return [...timeSlotState.targetSlots];
    },
    
    // 監視対象の数を取得
    getCount() {
        return timeSlotState.targetSlots.length;
    },
    
    // tdSelectorから位置情報（東西）を推定
    getLocationFromSelector(tdSelector) {
        if (!tdSelector) return '不明';
        
        // nth-child の値から東西を推定
        // 同じ時間の場合、0番目が東、1番目が西という仕様
        const cellMatch = tdSelector.match(/td:nth-child\((\d+)\)/);
        if (cellMatch) {
            const cellIndex = parseInt(cellMatch[1]) - 1; // nth-childは1ベース
            if (cellIndex === 0) return '東';
            if (cellIndex === 1) return '西';
        }
        
        return '不明';
    }
};

// ページ読み込み状態管理
export const pageLoadingState = {
    isLoading: false,
    startTime: null
};

// リロードカウントダウン状態管理
export const reloadCountdownState = {
    countdownInterval: null,
    secondsRemaining: null,
    startTime: null,
    totalSeconds: 30
};

// カレンダー監視状態管理
export const calendarWatchState = {
    observer: null,
    currentSelectedDate: null,
    isWatching: false
};

// 状態操作用ヘルパー関数
export function setPageLoadingState(isLoading) {
    pageLoadingState.isLoading = isLoading;
    pageLoadingState.startTime = isLoading ? Date.now() : null;
}

export function getCurrentMode() {
    if (timeSlotState.isMonitoring) return 'monitoring';
    if (timeSlotState.mode === 'trying') return 'trying';
    if (multiTargetManager.hasTargets()) return 'targets-selected';
    return 'idle';
}