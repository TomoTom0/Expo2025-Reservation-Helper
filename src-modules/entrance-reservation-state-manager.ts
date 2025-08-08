/**
 * 入場予約状態管理システム
 * 入場予約・監視の状態と対象を管理
 */

// 必要なimport
import { timeSlotSelectors, generateUniqueTdSelector, extractTdStatus } from './entrance-page-dom-utils';
import { getCurrentSelectedCalendarDate } from './entrance-page-ui';

// ============================================================================
// 型定義
// ============================================================================

// 実行状態（排他的）
export enum ExecutionState {
    IDLE = 'idle',
    RESERVATION_RUNNING = 'reservation_running',
    MONITORING_RUNNING = 'monitoring_running'
}

// 優先実行モード
export enum PriorityMode {
    AUTO = 'auto',                          // 自動判定（予約優先）
    FORCE_RESERVATION = 'force_reservation', // 予約強制実行
    FORCE_MONITORING = 'force_monitoring'    // 監視強制実行
}

// 位置管理の定数
const LOCATION_MAP: Record<number, 'east' | 'west'> = {
    0: 'east',  // 0番目のtd = 東
    1: 'west'   // 1番目のtd = 西
} as const;

const LOCATION_TO_INDEX: Record<'east' | 'west', number> = {
    'east': 0,
    'west': 1
} as const;

// 予約対象（単一）
export interface ReservationTarget {
    timeSlot: string;        // '11:00-'
    locationIndex: number;   // 0 or 1
    selector: string;        // DOM selector
    isValid: boolean;
}

// 予約成功情報
export interface ReservationSuccess {
    timeSlot: string;        // '11:00-'
    locationIndex: number;   // 0 or 1
    successTime: Date;       // 成功時刻
}

// 監視対象（複数可能）
export interface MonitoringTarget {
    timeSlot: string;        // '09:00-'
    locationIndex: number;   // 0 or 1
    selector: string;        // DOM selector
    priority: number;        // 監視優先順位（1, 2, 3...）
    status: 'full' | 'available';
}

// ============================================================================
// 位置管理ヘルパークラス
// ============================================================================

export class LocationHelper {
    // indexから東西を取得
    static getLocationFromIndex(index: number): 'east' | 'west' {
        return LOCATION_MAP[index] || 'east';
    }
    
    // 東西からindexを取得
    static getIndexFromLocation(location: 'east' | 'west'): number {
        return LOCATION_TO_INDEX[location];
    }
    
    // tdSelectorからindexを抽出
    static getIndexFromSelector(selector: string): number {
        if (!selector || typeof selector !== 'string') {
            console.warn('⚠️ LocationHelper.getIndexFromSelector: 無効なselector:', selector);
            return 0; // デフォルトは東
        }
        
        const cellMatch = selector.match(/td:nth-child\((\d+)\)/);
        if (cellMatch && cellMatch[1]) {
            return parseInt(cellMatch[1]) - 1; // nth-childは1ベース、indexは0ベース
        }
        return 0; // デフォルトは東
    }
    
    // DOM要素からindexを取得
    static getIndexFromElement(tdElement: HTMLTableCellElement): number {
        const row = tdElement.parentElement as HTMLTableRowElement;
        return Array.from(row.children).indexOf(tdElement);
    }
    
    // 同じ時間帯の比較用キー生成
    static generateTimeLocationKey(timeSlot: string, locationIndex: number): string {
        return `${timeSlot}_${locationIndex}`;
    }
    
    // ログ表示用のヘルパー
    static formatTargetInfo(timeSlot: string, locationIndex: number): string {
        const location = LocationHelper.getLocationFromIndex(locationIndex);
        return `${location}${timeSlot}`; // 例: "east11:00-" or "west09:00-"
    }
}

// ============================================================================
// 入場予約状態管理クラス
// ============================================================================

export class EntranceReservationStateManager {
    // 実行状態
    private executionState: ExecutionState = ExecutionState.IDLE;
    
    // 対象管理
    private reservationTarget: ReservationTarget | null = null;
    private monitoringTargets: MonitoringTarget[] = [];
    
    // 予約成功情報
    private reservationSuccess: ReservationSuccess | null = null;
    
    // 選択されたカレンダー日付
    private selectedCalendarDate: string | null = null;
    
    // 優先度設定
    private priorityMode: PriorityMode = PriorityMode.AUTO;
    
    // 予約実行情報（旧entranceReservationStateから統合）
    private reservationExecution = {
        shouldStop: false,
        startTime: null as number | null,
        attempts: 0
    };
    
    // 監視実行情報（旧timeSlotStateから統合）
    private monitoringExecution = {
        retryCount: 0,
        maxRetries: 100,
        reloadInterval: 30000,
        monitoringInterval: null as number | null
    };
    
    // デバッグフラグ（本番環境では詳細ログを抑制）
    private debugMode: boolean = true;
    
    // ============================================================================
    // 実行状態管理
    // ============================================================================
    
    getExecutionState(): ExecutionState {
        return this.executionState;
    }
    
    setExecutionState(state: ExecutionState): void {
        this.executionState = state;
        if (this.debugMode) {
            console.log(`[UnifiedState] 実行状態変更: ${state}`);
        }
    }
    
    startReservation(): boolean {
        if (this.executionState !== ExecutionState.IDLE) {
            this.log('⚠️ 予約開始失敗: 他の処理が実行中');
            return false;
        }
        
        if (!this.canStartReservation()) {
            this.log('⚠️ 予約開始失敗: 条件未満足');
            return false;
        }
        
        this.executionState = ExecutionState.RESERVATION_RUNNING;
        this.log('🚀 予約処理を開始');
        return true;
    }
    
    startMonitoring(): boolean {
        if (this.executionState !== ExecutionState.IDLE) {
            this.log('⚠️ 監視開始失敗: 他の処理が実行中');
            return false;
        }
        
        if (!this.canStartMonitoring()) {
            this.log('⚠️ 監視開始失敗: 監視対象なし');
            return false;
        }
        
        this.executionState = ExecutionState.MONITORING_RUNNING;
        this.log('👁️ 監視処理を開始');
        return true;
    }
    
    stop(): void {
        const prevState = this.executionState;
        this.executionState = ExecutionState.IDLE;
        
        switch (prevState) {
            case ExecutionState.RESERVATION_RUNNING:
                this.log('⏹️ 予約処理を停止');
                // 予約実行情報をリセット
                this.reservationExecution.shouldStop = false;
                this.reservationExecution.startTime = null;
                this.reservationExecution.attempts = 0;
                break;
            case ExecutionState.MONITORING_RUNNING:
                this.log('⏹️ 監視処理を停止');
                // 監視インターバルをクリア
                if (this.monitoringExecution.monitoringInterval) {
                    clearInterval(this.monitoringExecution.monitoringInterval);
                    this.monitoringExecution.monitoringInterval = null;
                }
                break;
        }
    }
    
    // ============================================================================
    // 予約実行情報管理（旧entranceReservationStateから統合）
    // ============================================================================
    
    // 予約実行開始
    startReservationExecution(): void {
        this.reservationExecution.shouldStop = false;
        this.reservationExecution.startTime = Date.now();
        this.reservationExecution.attempts = 0;
        this.log('🚀 予約実行情報を初期化');
    }
    
    // 予約中断フラグ設定
    setShouldStop(shouldStop: boolean): void {
        this.reservationExecution.shouldStop = shouldStop;
        this.log(`🛑 予約中断フラグ: ${shouldStop}`);
    }
    
    // 予約中断フラグ取得
    getShouldStop(): boolean {
        return this.reservationExecution.shouldStop;
    }
    
    // 試行回数増加
    incrementAttempts(): void {
        this.reservationExecution.attempts++;
        this.log(`🔄 予約試行回数: ${this.reservationExecution.attempts}`);
    }
    
    // 試行回数取得
    getAttempts(): number {
        return this.reservationExecution.attempts;
    }
    
    // 予約開始時刻取得
    getReservationStartTime(): number | null {
        return this.reservationExecution.startTime;
    }
    
    // 予約実行中かどうか
    isReservationRunning(): boolean {
        return this.executionState === ExecutionState.RESERVATION_RUNNING;
    }
    
    // ============================================================================
    // 監視実行情報管理（旧timeSlotStateから統合）
    // ============================================================================
    
    // 監視実行中かどうか
    isMonitoringRunning(): boolean {
        return this.executionState === ExecutionState.MONITORING_RUNNING;
    }
    
    // リトライ回数増加
    incrementRetryCount(): void {
        this.monitoringExecution.retryCount++;
        this.log(`🔄 監視リトライ回数: ${this.monitoringExecution.retryCount}`);
    }
    
    // リトライ回数取得
    getRetryCount(): number {
        return this.monitoringExecution.retryCount;
    }
    
    // リトライ回数リセット
    resetRetryCount(): void {
        this.monitoringExecution.retryCount = 0;
        this.log('🔄 監視リトライ回数をリセット');
    }
    
    // 最大リトライ回数取得
    getMaxRetries(): number {
        return this.monitoringExecution.maxRetries;
    }
    
    // 監視インターバル設定
    setMonitoringInterval(intervalId: number): void {
        this.monitoringExecution.monitoringInterval = intervalId;
        this.log(`⏰ 監視インターバル設定: ${intervalId}`);
    }
    
    // 監視インターバルクリア
    clearMonitoringInterval(): void {
        if (this.monitoringExecution.monitoringInterval) {
            clearInterval(this.monitoringExecution.monitoringInterval);
            this.monitoringExecution.monitoringInterval = null;
            this.log('⏰ 監視インターバルをクリア');
        }
    }
    
    // 監視インターバル取得
    getMonitoringInterval(): number | null {
        return this.monitoringExecution.monitoringInterval;
    }
    
    // ============================================================================
    // 対象管理
    // ============================================================================
    
    setReservationTarget(timeSlot: string, locationIndex: number, selector?: string): void {
        // selectorが未指定の場合は生成
        if (!selector) {
            const selectedSlot = document.querySelector(timeSlotSelectors.selectedSlot);
            if (selectedSlot) {
                const tdElement = selectedSlot.closest('td[data-gray-out]') as HTMLTableCellElement;
                selector = generateUniqueTdSelector(tdElement);
            } else {
                this.log('⚠️ 予約対象設定失敗: DOM要素が見つからない');
                return;
            }
        }
        
        this.reservationTarget = {
            timeSlot,
            locationIndex,
            selector,
            isValid: true
        };
        
        this.log(`✅ 予約対象設定: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)}`);
    }
    
    // 指定した時間帯・位置が現在の予約対象かどうかを判定
    isReservationTarget(timeSlot: string, locationIndex: number): boolean {
        if (!this.reservationTarget) return false;
        return this.reservationTarget.timeSlot === timeSlot && 
               this.reservationTarget.locationIndex === locationIndex;
    }
    
    // 指定した時間帯・位置が現在の監視対象かどうかを判定
    isMonitoringTarget(timeSlot: string, locationIndex: number): boolean {
        return this.monitoringTargets.some(target => 
            target.timeSlot === timeSlot && target.locationIndex === locationIndex
        );
    }
    
    clearReservationTarget(): void {
        if (this.reservationTarget) {
            const info = LocationHelper.formatTargetInfo(
                this.reservationTarget.timeSlot, 
                this.reservationTarget.locationIndex
            );
            this.reservationTarget = null;
            this.log(`🗑️ 予約対象クリア: ${info}`);
            
            // 解除後の状態復帰ログ出力
            const hasMonitoringTargets = this.hasMonitoringTargets();
            const canMonitor = this.canStartMonitoring();
            const preferredAction = this.getPreferredAction();
            this.log(`🔄 予約対象解除後の状態:`);
            this.log(`  - 監視対象数: ${this.monitoringTargets.length}`);
            this.log(`  - 監視開始可能: ${canMonitor}`);
            this.log(`  - 推奨アクション: ${preferredAction}`);
            
            if (hasMonitoringTargets && preferredAction === 'monitoring') {
                this.log(`✅ 監視対象が残っているため「監視予約開始」状態に復帰`);
            } else if (hasMonitoringTargets && preferredAction !== 'monitoring') {
                this.log(`⚠️ 監視対象があるが推奨アクションが${preferredAction}になっています`);
            }
        }
    }
    
    addMonitoringTarget(timeSlot: string, locationIndex: number, selector: string): boolean {
        const key = LocationHelper.generateTimeLocationKey(timeSlot, locationIndex);
        const existing = this.monitoringTargets.find(target => 
            LocationHelper.generateTimeLocationKey(target.timeSlot, target.locationIndex) === key
        );
        
        if (existing) {
            this.log(`⚠️ 監視対象は既に存在: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)}`);
            return false;
        }
        
        const newTarget: MonitoringTarget = {
            timeSlot,
            locationIndex,
            selector,
            priority: this.monitoringTargets.length + 1,
            status: 'full' // 通常満員の時間帯を監視対象にする
        };
        
        this.monitoringTargets.push(newTarget);
        this.log(`✅ 監視対象追加: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)} (優先度: ${newTarget.priority})`);
        
        // キャッシュに同期
        this.syncToCache();
        return true;
    }
    
    removeMonitoringTarget(timeSlot: string, locationIndex: number): boolean {
        const key = LocationHelper.generateTimeLocationKey(timeSlot, locationIndex);
        const initialLength = this.monitoringTargets.length;
        
        this.monitoringTargets = this.monitoringTargets.filter(target => 
            LocationHelper.generateTimeLocationKey(target.timeSlot, target.locationIndex) !== key
        );
        
        if (this.monitoringTargets.length < initialLength) {
            // 優先度を再計算
            this.monitoringTargets.forEach((target, index) => {
                target.priority = index + 1;
            });
            
            this.log(`✅ 監視対象削除: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)} (残り: ${this.monitoringTargets.length})`);
            
            // キャッシュに同期
            this.syncToCache();
            return true;
        }
        
        return false;
    }
    
    clearMonitoringTargets(): void {
        const count = this.monitoringTargets.length;
        this.monitoringTargets = [];
        this.log(`🗑️ 全監視対象クリア (${count}個)`);
        
        // キャッシュに同期
        this.syncToCache();
    }
    
    // ============================================================================
    // 状態判定
    // ============================================================================
    
    canStartReservation(): boolean {
        // 1. 予約対象の存在確認
        if (!this.reservationTarget || !this.reservationTarget.isValid) {
            return false;
        }
        
        // 2. 時間帯選択状態の確認
        const selectedSlot = document.querySelector(timeSlotSelectors.selectedSlot);
        if (!selectedSlot) {
            return false;
        }
        
        // 3. 選択時間帯の満員状態確認
        const tdElement = selectedSlot.closest('td[data-gray-out]') as HTMLTableCellElement;
        if (tdElement) {
            const status = extractTdStatus(tdElement);
            if (status?.isFull) {
                return false;
            }
        }
        
        // 4. 来場日時ボタンの有効性確認（一時的に緩和）
        const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq') as HTMLButtonElement;
        if (!visitTimeButton || visitTimeButton.disabled) {
            console.log(`⚠️ 来場日時ボタンが無効: exists=${!!visitTimeButton}, disabled=${visitTimeButton?.disabled}`);
            // 時間帯選択直後は来場日時ボタンの更新が遅延することがあるため、一時的に許可
            // return false;
        }
        
        // 5. カレンダー選択確認
        const selectedDate = getCurrentSelectedCalendarDate();
        if (!selectedDate) {
            return false;
        }
        
        return true;
    }
    
    canStartMonitoring(): boolean {
        const result = this.monitoringTargets.length > 0;
        if (!result) {
            this.log(`❌ 監視開始不可: 監視対象数=${this.monitoringTargets.length}`);
        }
        return result;
    }
    
    canInterrupt(): boolean {
        return this.executionState !== ExecutionState.IDLE;
    }
    
    // ============================================================================
    // 優先度判定
    // ============================================================================
    
    getPreferredAction(): 'reservation' | 'monitoring' | 'none' {
        const canReserve = this.canStartReservation();
        const canMonitor = this.canStartMonitoring();
        
        switch (this.priorityMode) {
            case PriorityMode.FORCE_RESERVATION:
                return canReserve ? 'reservation' : 'none';
                
            case PriorityMode.FORCE_MONITORING:
                return canMonitor ? 'monitoring' : 'none';
                
            case PriorityMode.AUTO:
            default:
                // 予約優先（両方可能な場合は予約を選択）
                if (canReserve) {
                    return 'reservation';
                }
                if (canMonitor) return 'monitoring';
                return 'none';
        }
    }
    
    setPriorityMode(mode: PriorityMode): void {
        this.priorityMode = mode;
        this.log(`🔧 優先度モード変更: ${mode}`);
    }
    
    // ============================================================================
    // 既存システムとの互換性
    // ============================================================================
    
    // 既存のmultiTargetManagerから監視対象を移行（現在は不要）
    migrateFromExisting(): void {
        this.log('🔄 既存システムから状態を移行中... (スキップ - 既にmultiTargetManagerは削除済み)');
    }
    
    
    // ============================================================================
    // UI連携用メソッド
    // ============================================================================
    
    getFabButtonState(): 'enabled' | 'disabled' | 'running' | 'monitoring' {
        switch (this.executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                return 'running';
            case ExecutionState.MONITORING_RUNNING:
                return 'monitoring';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                return preferredAction !== 'none' ? 'enabled' : 'disabled';
        }
    }
    
    // FAB部分での予約対象情報表示用
    getFabTargetDisplayInfo(): { hasTarget: boolean; displayText: string; targetType: 'reservation' | 'monitoring' | 'none' } {
        console.log(`[UnifiedState] getFabTargetDisplayInfo 呼び出し - 予約対象: ${this.hasReservationTarget()}, 監視対象: ${this.hasMonitoringTargets()}`);
        // カレンダー選択日付を取得（MM/DD形式）
        const getDisplayDate = (): string => {
            if (this.selectedCalendarDate) {
                // YYYY-MM-DD形式からMM/DD形式に変換
                const parts = this.selectedCalendarDate.split('-');
                if (parts.length === 3) {
                    return `${parts[1]}/${parts[2]}`;
                }
            }
            // フォールバック: 現在日付
            const today = new Date();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            return `${month}/${day}`;
        };

        // 予約成功がある場合は成功情報を最優先表示
        if (this.hasReservationSuccess() && this.reservationSuccess) {
            const location = LocationHelper.getLocationFromIndex(this.reservationSuccess.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            const dateText = getDisplayDate();
            const displayText = `予約成功🎉(${dateText})\n${locationText}${this.reservationSuccess.timeSlot}`;
            console.log(`[UnifiedState] FAB予約成功表示テキスト: "${displayText}"`);
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'reservation'
            };
        }

        // 予約対象がある場合は予約情報を優先表示
        if (this.hasReservationTarget() && this.reservationTarget) {
            const location = LocationHelper.getLocationFromIndex(this.reservationTarget.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            const dateText = getDisplayDate();
            const displayText = `予約対象(${dateText})\n${locationText}${this.reservationTarget.timeSlot}`;
            console.log(`[UnifiedState] FAB予約対象表示テキスト: "${displayText}"`);
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'reservation'
            };
        }
        
        // 監視対象がある場合は監視対象を表示
        if (this.hasMonitoringTargets() && this.monitoringTargets.length > 0) {
            console.log(`[UnifiedState] getFabTargetDisplayInfo: 監視対象数=${this.monitoringTargets.length}`);
            console.log(`[UnifiedState] 監視対象詳細:`, this.monitoringTargets);
            
            // 優先度順にソート（priority昇順）
            const sortedTargets = [...this.monitoringTargets].sort((a, b) => a.priority - b.priority);
            const dateText = getDisplayDate();
            
            // 監視対象の表示（1件でも複数件でも統一形式）
            const targetTexts = sortedTargets.map(target => {
                const location = LocationHelper.getLocationFromIndex(target.locationIndex);
                const locationText = location === 'east' ? '東' : '西';
                const result = `${locationText}${target.timeSlot}`;
                console.log(`[UnifiedState] 監視対象→表示: ${JSON.stringify(target)} → "${result}"`);
                return result;
            });
            
            console.log(`[UnifiedState] targetTexts配列:`, targetTexts);
            const displayText = `監視対象(${dateText})\n${targetTexts.join('\n')}`;
            console.log(`[UnifiedState] FAB表示テキスト: "${displayText}"`);
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'monitoring'
            };
        }
        
        return {
            hasTarget: false,
            displayText: '',
            targetType: 'none'
        };
    }
    
    getFabButtonText(): string {
        switch (this.executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                return '予約\n中断';
            case ExecutionState.MONITORING_RUNNING:
                return '監視\n中断';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                switch (preferredAction) {
                    case 'reservation': return '予約\n開始';
                    case 'monitoring': return '監視\n開始';
                    default: return '待機中';
                }
        }
    }
    
    // ============================================================================
    // ゲッター
    // ============================================================================
    
    getReservationTarget(): ReservationTarget | null {
        return this.reservationTarget;
    }
    
    getMonitoringTargets(): MonitoringTarget[] {
        return [...this.monitoringTargets];
    }
    
    hasReservationTarget(): boolean {
        return this.reservationTarget !== null && this.reservationTarget.isValid;
    }
    
    hasMonitoringTargets(): boolean {
        return this.monitoringTargets.length > 0;
    }
    
    getMonitoringTargetCount(): number {
        return this.monitoringTargets.length;
    }
    
    // 全ての対象をクリア（監視・予約両方）
    clearAllTargets(): void {
        const reservationCount = this.reservationTarget ? 1 : 0;
        const monitoringCount = this.monitoringTargets.length;
        
        this.reservationTarget = null;
        this.monitoringTargets = [];
        
        this.log(`🗑️ 全対象クリア - 予約: ${reservationCount}個, 監視: ${monitoringCount}個`);
    }
    
    // カレンダー日付の設定・取得
    setSelectedCalendarDate(date: string): void {
        this.selectedCalendarDate = date;
        this.log(`📅 カレンダー日付設定: ${date}`);
    }
    
    getSelectedCalendarDate(): string | null {
        return this.selectedCalendarDate;
    }
    
    // 予約成功情報の設定・取得
    setReservationSuccess(timeSlot: string, locationIndex: number): void {
        this.reservationSuccess = {
            timeSlot,
            locationIndex,
            successTime: new Date()
        };
        this.log(`🎉 予約成功情報設定: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)}`);
        
        // 成功時は予約対象と監視対象をクリア
        this.reservationTarget = null;
        this.monitoringTargets = [];
        this.log(`✅ 予約成功により対象をクリア`);
    }
    
    getReservationSuccess(): ReservationSuccess | null {
        return this.reservationSuccess;
    }
    
    hasReservationSuccess(): boolean {
        return this.reservationSuccess !== null;
    }
    
    clearReservationSuccess(): void {
        if (this.reservationSuccess) {
            const info = LocationHelper.formatTargetInfo(
                this.reservationSuccess.timeSlot, 
                this.reservationSuccess.locationIndex
            );
            this.reservationSuccess = null;
            this.log(`🗑️ 予約成功情報クリア: ${info}`);
        }
    }
    
    // ============================================================================
    // デバッグ・ログ
    // ============================================================================
    
    private log(message: string): void {
        if (this.debugMode) {
            console.log(`[UnifiedState] ${message}`);
        }
    }
    
    
    // キャッシュ同期
    private syncToCache(): void {
        try {
            // cacheManagerが利用可能な場合のみ同期
            if (typeof window !== 'undefined' && (window as any).cacheManager) {
                const cacheManager = (window as any).cacheManager;
                
                // 現在の監視対象をキャッシュに保存
                const cacheData = this.monitoringTargets.map(target => ({
                    timeText: target.timeSlot,
                    tdSelector: target.selector,
                    locationIndex: target.locationIndex,
                    priority: target.priority
                }));
                
                cacheManager.saveTargetSlots(cacheData);
                this.log(`🔄 キャッシュ同期完了: ${cacheData.length}個の監視対象`);
            }
        } catch (error) {
            console.warn('⚠️ キャッシュ同期に失敗:', error);
        }
    }
    
    // デバッグ情報の出力
    debugInfo(): void {
        console.group('[UnifiedState] デバッグ情報');
        console.log('実行状態:', this.executionState);
        console.log('優先度モード:', this.priorityMode);
        console.log('予約対象:', this.reservationTarget);
        console.log('監視対象:', this.monitoringTargets);
        console.log('予約可能:', this.canStartReservation());
        console.log('監視可能:', this.canStartMonitoring());
        console.log('推奨アクション:', this.getPreferredAction());
        console.groupEnd();
    }
}

// 入場予約状態管理システムのシングルトンインスタンス
export const entranceReservationStateManager = new EntranceReservationStateManager();