/**
 * 統一状態管理システム
 * 予約・監視の状態と対象を一元管理
 */

// 必要なimport
import { timeSlotSelectors, generateUniqueTdSelector, extractTdStatus } from './section4';
import { multiTargetManager, entranceReservationState, timeSlotState } from './section2';
import { getCurrentSelectedCalendarDate } from './section6';

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
// 統一状態管理クラス
// ============================================================================

export class UnifiedStateManager {
    // 実行状態
    private executionState: ExecutionState = ExecutionState.IDLE;
    
    // 対象管理
    private reservationTarget: ReservationTarget | null = null;
    private monitoringTargets: MonitoringTarget[] = [];
    
    // 優先度設定
    private priorityMode: PriorityMode = PriorityMode.AUTO;
    
    // デバッグフラグ
    private debugMode: boolean = true;
    
    // ============================================================================
    // 実行状態管理
    // ============================================================================
    
    getExecutionState(): ExecutionState {
        return this.executionState;
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
                break;
            case ExecutionState.MONITORING_RUNNING:
                this.log('⏹️ 監視処理を停止');
                break;
        }
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
    
    clearReservationTarget(): void {
        if (this.reservationTarget) {
            const info = LocationHelper.formatTargetInfo(
                this.reservationTarget.timeSlot, 
                this.reservationTarget.locationIndex
            );
            this.reservationTarget = null;
            this.log(`🗑️ 予約対象クリア: ${info}`);
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
            return true;
        }
        
        return false;
    }
    
    clearMonitoringTargets(): void {
        const count = this.monitoringTargets.length;
        this.monitoringTargets = [];
        this.log(`🗑️ 全監視対象クリア (${count}個)`);
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
        
        // 4. 来場日時ボタンの有効性確認
        const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq') as HTMLButtonElement;
        if (!visitTimeButton || visitTimeButton.disabled) {
            return false;
        }
        
        // 5. カレンダー選択確認
        const selectedDate = getCurrentSelectedCalendarDate();
        if (!selectedDate) {
            return false;
        }
        
        return true;
    }
    
    canStartMonitoring(): boolean {
        return this.monitoringTargets.length > 0;
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
                    // 予約優先のため監視対象をクリア
                    if (canMonitor) {
                        this.log('🔄 予約優先のため監視対象をクリア');
                        this.clearMonitoringTargets();
                    }
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
    
    // 既存のmultiTargetManagerから監視対象を移行
    migrateFromExisting(): void {
        this.log('🔄 既存システムから状態を移行中...');
        
        // 監視対象の移行
        const existingTargets = multiTargetManager.getTargets();
        existingTargets.forEach((target, index) => {
            const locationIndex = LocationHelper.getIndexFromSelector(target.tdSelector);
            this.monitoringTargets.push({
                timeSlot: target.timeText,
                locationIndex,
                selector: target.tdSelector,
                priority: index + 1,
                status: 'full'
            });
        });
        
        // 手動選択された予約対象を検出
        const selectedSlot = document.querySelector(timeSlotSelectors.selectedSlot);
        if (selectedSlot) {
            const tdElement = selectedSlot.closest('td[data-gray-out]') as HTMLTableCellElement;
            if (tdElement) {
                const timeText = this.extractTimeTextFromElement(selectedSlot);
                const locationIndex = LocationHelper.getIndexFromElement(tdElement);
                const selector = generateUniqueTdSelector(tdElement);
                
                this.reservationTarget = {
                    timeSlot: timeText,
                    locationIndex,
                    selector,
                    isValid: true
                };
            }
        }
        
        // 実行状態の移行
        if (entranceReservationState.isRunning) {
            this.executionState = ExecutionState.RESERVATION_RUNNING;
        } else if (timeSlotState.isMonitoring) {
            this.executionState = ExecutionState.MONITORING_RUNNING;
        }
        
        this.log(`✅ 移行完了: 予約対象=${this.reservationTarget ? '1' : '0'}, 監視対象=${this.monitoringTargets.length}`);
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
    
    // ============================================================================
    // デバッグ・ログ
    // ============================================================================
    
    private log(message: string): void {
        if (this.debugMode) {
            console.log(`[UnifiedState] ${message}`);
        }
    }
    
    // DOM要素から時間テキストを抽出
    private extractTimeTextFromElement(element: Element): string {
        const timeSpan = element.querySelector('dt span');
        return timeSpan?.textContent?.trim() || 'unknown';
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