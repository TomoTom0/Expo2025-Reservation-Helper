/**
 * 入場予約状態管理システム
 * 入場予約の状態と対象を管理
 */

// 必要なimport
import { timeSlotSelectors, generateUniqueTdSelector } from './entrance-page-dom-utils';
import { getCurrentSelectedCalendarDate } from './entrance-page-core';
import { UnifiedAutomationManager, CancellationError } from './unified-automation-manager';
// processing-overlayへの依存を削除（循環依存解決）
import type { ReservationConfig, ReservationResult } from '../types/index.js';

// ============================================================================
// 型定義
// ============================================================================

// 実行状態（排他的）
export enum ExecutionState {
    IDLE = 'idle',
    RESERVATION_RUNNING = 'reservation_running'
}

// 優先実行モード
export enum PriorityMode {
    AUTO = 'auto',                          // 自動判定（予約優先）
    FORCE_RESERVATION = 'force_reservation' // 予約強制実行
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
    
    // 開始時対象キャッシュ（検証用）
    private initialTargetCache: {
        reservationTarget: ReservationTarget | null;
        timestamp: number;
    } | null = null;
    
    // 統一自動処理管理（Phase 1で追加）
    private automationManager: UnifiedAutomationManager;
    
    constructor() {
        // 統一自動処理管理を初期化
        this.automationManager = new UnifiedAutomationManager(this);
        console.log('📋 統一状態管理システム初期化完了');
    }
    
    // 対象管理
    private reservationTarget: ReservationTarget | null = null;
    
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

    
    
    // 効率モード設定管理（常時有効）
    private efficiencyMode = {
        enabled: true, // 常時有効に設定
        nextSubmitTarget: null as Date | null,
        updateTimer: null as number | null // FABボタン更新タイマー
    };
    
    // changeダイアログ検出・調整管理
    private changeDialogState = {
        hasAppeared: false,  // 一度でもchangeダイアログが表示されたか
        needsTimingAdjustment: false  // タイミング調整が必要か
    };
    
    // リロードカウントダウン状態管理（旧reloadCountdownStateから統合）
    private reloadCountdown = {
        totalSeconds: 30,
        secondsRemaining: null as number | null,
        startTime: null as number | null,
        countdownInterval: null as number | null,
        reloadTimer: null as number | null
    };
    
    // ページ読み込み状態管理（旧pageLoadingStateから統合）
    private pageLoading = {
        isLoading: false,
        startTime: null as number | null,
        timeout: 10000
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
        // 初回のみ条件チェック（2サイクル目以降は実行中でも継続）
        if (this.executionState !== ExecutionState.RESERVATION_RUNNING && 
            this.executionState !== ExecutionState.IDLE) {
            this.log('⚠️ 予約開始失敗: 他の処理が実行中');
            return false;
        }
        
        // 初回のみ予約開始条件チェック
        if (this.executionState === ExecutionState.IDLE && !this.canStartReservation()) {
            this.log('⚠️ 予約開始失敗: 条件未満足');
            return false;
        }
        
        // 【初回のみ初期化】試行回数（IDLE→RUNNINGの場合のみ）
        if (this.executionState === ExecutionState.IDLE) {
            // changeダイアログ状態をリセット（新しい予約処理開始時）
            this.resetChangeDialogState();
        }
        const isFirstTime = this.executionState === ExecutionState.IDLE;
        
        // 実行状態設定
        this.executionState = ExecutionState.RESERVATION_RUNNING;
        
        // 【毎回初期化】各サイクル固有の情報
        this.reservationExecution.shouldStop = false;
        this.reservationExecution.startTime = Date.now();
        
        if (isFirstTime) {
            this.reservationExecution.attempts = 0;
            this.log('🔄 初回予約開始: 試行回数を初期化');
            
            // 初回開始時の対象をキャッシュに保存
            this.saveInitialTargets();
        }
        
        // 【毎回更新】効率モード目標時刻とタイマー
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
            this.log('⚡ 効率モード: 目標時刻を再計算');
            this.startEfficiencyModeUpdateTimer();
        }
        
        const cycleType = this.reservationExecution.attempts === 0 ? '初回' : `${this.reservationExecution.attempts}サイクル目継続`;
        this.log(`🚀 予約処理を開始 (${cycleType})`);
        return true;
    }
    
    

    stop(): void {
        const prevState = this.executionState;
        this.executionState = ExecutionState.IDLE;
        
        // 初回開始時対象キャッシュをクリア
        this.clearInitialTargets();
        
        // 効率モードタイマーを停止
        this.stopEfficiencyModeUpdateTimer();
        
        switch (prevState) {
            case ExecutionState.RESERVATION_RUNNING:
                this.log('⏹️ 予約処理を停止');
                // 予約実行情報をリセット
                this.reservationExecution.shouldStop = false;
                this.reservationExecution.startTime = null;
                this.reservationExecution.attempts = 0;
                break;
        }
    }
    
    // ============================================================================
    // 予約実行情報管理（旧entranceReservationStateから統合）
    // ============================================================================
    
    // 削除: startReservationExecution()はstartReservation()に統合
    
    // 予約中断フラグ設定
    setShouldStop(shouldStop: boolean): void {
        this.reservationExecution.shouldStop = shouldStop;
        this.log(`🛑 予約中断フラグ: ${shouldStop}`);
        
        // Phase 1: 統一自動処理管理での中断処理を追加
        if (shouldStop && this.automationManager.isRunning()) {
            this.log('🛑 統一自動処理管理での即座中断を実行');
            this.automationManager.abort();
        }
        
        // 中断フラグのみ設定、状態変更は予約処理完了後に行う
        // （予約処理ループが完了するまで RESERVATION_RUNNING 状態を維持）
    }

    // ============================================================================
    // 開始時対象キャッシュ管理（検証用）
    // ============================================================================
    
    /**
     * 初回開始時の対象を保存
     */
    private saveInitialTargets(): void {
        this.initialTargetCache = {
            reservationTarget: this.reservationTarget ? { ...this.reservationTarget } : null,
            timestamp: Date.now()
        };
        
        console.log('💾 初回開始時対象をキャッシュに保存');
        console.log('💾 予約対象:', this.initialTargetCache.reservationTarget);
    }
    
    /**
     * 現在の対象が初回開始時と一致するかを検証
     * @returns true: 一致, false: 不一致（処理中断が必要）
     */
    validateTargetConsistency(): boolean {
        if (!this.initialTargetCache) {
            // キャッシュがない場合は検証不要
            return true;
        }
        
        // 予約対象の検証
        const initialReservation = this.initialTargetCache.reservationTarget;
        const currentReservation = this.reservationTarget;
        
        if (initialReservation && currentReservation) {
            if (initialReservation.timeSlot !== currentReservation.timeSlot || 
                initialReservation.locationIndex !== currentReservation.locationIndex) {
                console.error('🚨 予約対象が変更されました！');
                console.error('🚨 初回:', initialReservation);
                console.error('🚨 現在:', currentReservation);
                return false;
            }
        } else if (initialReservation !== currentReservation) {
            // 片方がnullで片方が存在する場合
            console.error('🚨 予約対象の存在状態が変更されました！');
            console.error('🚨 初回:', initialReservation);
            console.error('🚨 現在:', currentReservation);
            return false;
        }
        
        
        // すべての検証をパス
        return true;
    }
    
    /**
     * 対象キャッシュをクリア
     */
    private clearInitialTargets(): void {
        this.initialTargetCache = null;
        console.log('🗑️ 初回開始時対象キャッシュをクリア');
    }
    
    // ============================================================================
    // 統一自動処理管理へのアクセスメソッド（Phase 2で追加）
    // ============================================================================

    /**
     * 統一効率モード待機処理実行
     * @param targetTime 目標時刻
     * @returns Promise<void>
     */
    async executeUnifiedEfficiencyWait(targetTime: Date): Promise<void> {
        return await this.automationManager.executeEfficiencyWait(targetTime);
    }

    /**
     * 統一中断可能待機
     * @param ms 待機時間（ミリ秒）
     * @param signal 中断シグナル
     * @returns Promise<void>
     */
    async executeUnifiedWaitWithCancellation(ms: number, signal: AbortSignal): Promise<void> {
        return await this.automationManager.waitWithCancellation(ms, signal);
    }

    /**
     * 統一予約処理実行
     * @param config 予約設定
     * @returns Promise<ReservationResult>
     */
    async executeUnifiedReservationProcess(config: ReservationConfig): Promise<ReservationResult> {
        return await this.automationManager.executeReservationProcess(config);
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
    // 特殊実行情報管理（スタブ）
    // ============================================================================
    
    
    
    // ============================================================================
    // リロードカウントダウン管理（旧reloadCountdownStateから統合）
    // ============================================================================
    
    // リロードカウントダウン開始
    scheduleReload(seconds: number): void {
        // 既存のカウントダウンをクリア
        this.stopReloadCountdown();
        
        this.reloadCountdown.totalSeconds = seconds;
        this.reloadCountdown.secondsRemaining = seconds;
        this.reloadCountdown.startTime = Date.now();
        
        this.log(`⏰ リロードカウントダウン開始: ${seconds}秒`);
        
        // リロードタイマー設定
        this.reloadCountdown.reloadTimer = window.setTimeout(() => {
            window.location.reload();
        }, seconds * 1000);
        
        // カウントダウンインターバル設定
        this.reloadCountdown.countdownInterval = window.setInterval(() => {
            if (this.reloadCountdown.secondsRemaining !== null) {
                this.reloadCountdown.secondsRemaining--;
                
                // 統一FAB表示更新システムを使用
                this.updateFabDisplay();
                
                if (this.reloadCountdown.secondsRemaining <= 0) {
                    // カウントダウン完了
                    if (this.reloadCountdown.countdownInterval) {
                        clearInterval(this.reloadCountdown.countdownInterval);
                        this.reloadCountdown.countdownInterval = null;
                    }
                    this.reloadCountdown.secondsRemaining = null;
                }
            }
        }, 1000);
    }
    
    // リロードカウントダウン停止
    stopReloadCountdown(): void {
        if (this.reloadCountdown.countdownInterval) {
            clearInterval(this.reloadCountdown.countdownInterval);
            this.reloadCountdown.countdownInterval = null;
        }
        
        if (this.reloadCountdown.reloadTimer) {
            clearTimeout(this.reloadCountdown.reloadTimer);
            this.reloadCountdown.reloadTimer = null;
        }
        
        this.reloadCountdown.secondsRemaining = null;
        this.reloadCountdown.startTime = null;
        
        this.log('⏰ リロードカウントダウン停止');
    }
    
    
    // ============================================================================
    // ページ読み込み状態管理（旧pageLoadingStateから統合）
    // ============================================================================
    
    // ページ読み込み状態を設定
    setPageLoadingState(isLoading: boolean): void {
        this.pageLoading.isLoading = isLoading;
        if (isLoading) {
            this.pageLoading.startTime = Date.now();
            this.log('📄 ページ読み込み開始');
        } else {
            this.pageLoading.startTime = null;
            this.log('📄 ページ読み込み完了');
        }
    }
    
    // ページ読み込み中かどうか
    isPageLoading(): boolean {
        return this.pageLoading.isLoading;
    }
    
    // ページ読み込み開始時刻取得
    getPageLoadingStartTime(): number | null {
        return this.pageLoading.startTime;
    }
    
    // ページ読み込みタイムアウト値取得
    getPageLoadingTimeout(): number {
        return this.pageLoading.timeout;
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
    
    
    clearReservationTarget(): void {
        if (this.reservationTarget) {
            const info = LocationHelper.formatTargetInfo(
                this.reservationTarget.timeSlot, 
                this.reservationTarget.locationIndex
            );
            this.reservationTarget = null;
            this.log(`🗑️ 予約対象クリア: ${info}`);
            
            // 解除後の状態復帰ログ出力
            const preferredAction = this.getPreferredAction();
            this.log(`🔄 予約対象解除後の状態:`);
            this.log(`  - 推奨アクション: ${preferredAction}`);
        }
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
            // 時間帯未選択（ログ削減）
            return false;
        }
        
        // 予約対象あり（ログ削減）
        
        // 3. 選択時間帯の確認（満員制限は撤廃）
        
        // 4. 来場日時ボタンの有効性確認
        const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq') as HTMLButtonElement;
        if (!visitTimeButton || visitTimeButton.disabled) {
            console.log(`⚠️ 来場日時ボタンが無効: exists=${!!visitTimeButton}, disabled=${visitTimeButton?.disabled}`);
            console.log(`📵 すでに予約取得済みまたは予約不可能な状態のため予約開始を阻止`);
            return false;
        }
        
        // 5. カレンダー選択確認
        const selectedDate = getCurrentSelectedCalendarDate();
        if (!selectedDate) {
            return false;
        }
        
        return true;
    }
    
    
    canInterrupt(): boolean {
        return this.executionState !== ExecutionState.IDLE;
    }
    
    // ============================================================================
    // 優先度判定
    // ============================================================================
    
    getPreferredAction(): 'reservation' | 'none' {
        const canReserve = this.canStartReservation();
        // 特殊機能は削除されました - 満員時間帯も直接予約可能
        
        // 満員時間帯予約制限解除により、特殊機能は不要になりました
        // 常に予約のみを返すように変更
        return canReserve ? 'reservation' : 'none';
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
    
    getFabButtonState(): 'enabled' | 'disabled' | 'running' {
        switch (this.executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                return 'running';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                return preferredAction !== 'none' ? 'enabled' : 'disabled';
        }
    }
    
    // FAB部分での予約対象情報表示用
    getFabTargetDisplayInfo(): { hasTarget: boolean; displayText: string; targetType: 'reservation' | 'none' } {
        // カウントダウン中・効率モードタイマー実行中はログを削減
        if (!false && !this.efficiencyMode.updateTimer) {
            // ログ削減: 頻繁に呼ばれるため削除
        }
        // カレンダー選択日付を取得（M/D形式、0paddingなし）
        const getDisplayDate = (): string => {
            if (this.selectedCalendarDate) {
                // YYYY-MM-DD形式からM/D形式に変換（0paddingを除去）
                const parts = this.selectedCalendarDate.split('-');
                if (parts.length === 3) {
                    const month = parseInt(parts[1], 10).toString();
                    const day = parseInt(parts[2], 10).toString();
                    return `${month}/${day}`;
                }
            }
            // フォールバック: 現在日付（0paddingなし）
            const today = new Date();
            const month = (today.getMonth() + 1).toString();
            const day = today.getDate().toString();
            return `${month}/${day}`;
        };

        // 予約成功がある場合は成功情報を最優先表示
        if (this.hasReservationSuccess() && this.reservationSuccess) {
            const location = LocationHelper.getLocationFromIndex(this.reservationSuccess.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            const dateText = getDisplayDate();
            const displayText = `${dateText}\n予約成功🎉${locationText}${this.reservationSuccess.timeSlot}`;
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
            const displayText = `${dateText}\n${locationText}${this.reservationTarget.timeSlot}`;
            
            // 効率モードタイマー実行中はログ削減
            if (!this.efficiencyMode.updateTimer) {
                // ログ削減: 頻繁に呼ばれるため削除
            }
            
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'reservation'
            };
        }
        
        // 監視対象がある場合は監視対象を表示 - 監視機能削除済み
        
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
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                switch (preferredAction) {
                    case 'reservation': return '予約\n開始';
                            default: return '待機中';
                }
            default:
                return '待機中';
        }
    }
    
    // ============================================================================
    // ゲッター
    // ============================================================================
    
    getReservationTarget(): ReservationTarget | null {
        return this.reservationTarget;
    }
    
    

    getInitialTargetCache(): typeof this.initialTargetCache {
        return this.initialTargetCache;
    }
    
    hasReservationTarget(): boolean {
        return this.reservationTarget !== null && this.reservationTarget.isValid;
    }
    
    
    
    // 全ての対象をクリア
    clearAllTargets(): void {
        const reservationCount = this.reservationTarget ? 1 : 0;
        
        this.reservationTarget = null;
        
        this.log(`🗑️ 全対象クリア - 予約: ${reservationCount}個`);
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
        
        // 成功時は予約対象をクリア
        this.reservationTarget = null;
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
    
    
    
    // ============================================================================
    // FAB表示制御統一メソッド（UI分散問題の解決）
    // ============================================================================
    
    // FAB表示を更新（全UI制御をここに集約）
    updateFabDisplay(): void {
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (!fabContainer) {
            console.log('🔍 [統一FAB更新] FABコンテナが見つかりません');
            return;
        }
        
        const mainButton = fabContainer.querySelector('.ytomo-fab') as HTMLButtonElement;
        if (!mainButton) {
            console.log('🔍 [統一FAB更新] メインボタンが見つかりません');
            return;
        }
        
        const span = mainButton.querySelector('.ytomo-fab-status') as HTMLElement;
        if (!span) {
            console.log('🔍 [統一FAB更新] .ytomo-fab-statusエレメントが見つかりません');
            return;
        }
        
        // 統一システムから状態とテキストを取得
        const executionState = this.getExecutionState();
        const fabText = this.getFabButtonText();
        const preferredAction = this.getPreferredAction();
        
        // 予約実行中のdisabled問題デバッグ用（効率モードタイマー実行中はログ削減）
        if (executionState === ExecutionState.RESERVATION_RUNNING && !this.efficiencyMode.updateTimer) {
            console.log(`🔍 [FAB更新] 予約実行中: state=${executionState}, disabled設定前=${mainButton.disabled}`);
        }
        
        // FAB更新ログを削減（問題時のみ出力）
        
        // 実行状態に応じてボタン表示を更新
        switch (executionState) {
                
                
            case ExecutionState.RESERVATION_RUNNING:
                span.innerText = fabText;
                
                // ステータスバッジは効率モード実行中表示のみ（カウントダウンなし）
                this.updateStatusBadgeFromUnified('reservation-running', '効率予約実行中');
                
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                mainButton.classList.add('ytomo-fab-running');
                mainButton.title = '予約中断';
                mainButton.disabled = false; // 中断可能
                // ログ削減: 頻繁に呼ばれるため削除
                
                // 効率モードタイマー実行中はログ削減
                if (!this.efficiencyMode.updateTimer) {
                    console.log(`🔍 [FAB更新] 予約実行中のdisabled設定完了: disabled=${mainButton.disabled}`);
                }
                break;
                
            case ExecutionState.IDLE:
            default:
                span.innerText = fabText;
                
                // 既存のupdateStatusBadge関数を使用  
                const statusMode = preferredAction === 'reservation' ? 'idle-reservation' : 'idle';
                this.updateStatusBadgeFromUnified(statusMode);
                
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                
                if (preferredAction === 'reservation') {
                    mainButton.classList.add('state-enabled', 'state-reservation');
                    mainButton.title = '予約開始';
                    mainButton.disabled = false;
                } else {
                    mainButton.classList.add('state-idle');
                    mainButton.title = '対象選択待ち';
                    mainButton.disabled = true;
                    
                    // 効率モードタイマー実行中はログ削減
                    if (!this.efficiencyMode.updateTimer) {
                        console.log(`🔍 [FAB更新] IDLE状態でdisabled=true設定: state=${executionState}`);
                    }
                }
                break;
        }
        
        
        // 【システム連動】オーバーレイ表示中はFABボタンを強制有効化
        const processingOverlay = document.getElementById('ytomo-processing-overlay');
        if (processingOverlay && !processingOverlay.classList.contains('hidden')) {
            if (mainButton.disabled) {
                mainButton.disabled = false;
                console.log('🛡️ [システム連動] オーバーレイ表示中につき中断ボタンを強制有効化');
            }
        }
        
        // 予約対象表示も更新
        this.updateTargetDisplay();
    }
    
    // 予約対象の表示を更新
    private updateTargetDisplay(): void {
        const reservationTargetElement = document.getElementById('ytomo-reservation-target');
        
        if (!reservationTargetElement) {
            console.log('🔍 [対象表示更新] 予約対象要素が見つかりません');
            return;
        }
        
        const displayInfo = this.getFabTargetDisplayInfo();
        
        // 予約対象表示エリアの更新
        if (reservationTargetElement) {
            if (displayInfo.hasTarget && displayInfo.targetType === 'reservation') {
                reservationTargetElement.innerHTML = displayInfo.displayText.replace(/\n/g, '<br>');
                reservationTargetElement.classList.remove('hidden');
                reservationTargetElement.classList.add('visible');
                
                // カウントダウン中・効率モードタイマー実行中はログを削減
                if (!false && !this.efficiencyMode.updateTimer) {
                    console.log(`🔍 [予約対象表示更新] 表示: "${displayInfo.displayText}"`);
                }
            } else {
                reservationTargetElement.classList.remove('visible');
                reservationTargetElement.classList.add('hidden');
                reservationTargetElement.innerHTML = '';
            }
        }
        
    }
    
    // デバッグ情報の出力
    debugInfo(): void {
        console.group('[UnifiedState] デバッグ情報');
        console.log('実行状態:', this.executionState);
        console.log('優先度モード:', this.priorityMode);
        console.log('予約対象:', this.reservationTarget);
        console.log('予約可能:', this.canStartReservation());
        console.log('推奨アクション:', this.getPreferredAction());
        console.groupEnd();
    }
    
    // 既存のupdateStatusBadge関数を呼び出すヘルパー
    private updateStatusBadgeFromUnified(mode: string, customText?: string): void {
        // 循環依存を避けるため、DOM直接操作で簡易実装
        const statusBadge = document.querySelector('#ytomo-status-badge') as HTMLElement;
        if (!statusBadge) return;
        
        // 既存の状態クラスをクリア
        statusBadge.className = statusBadge.className.replace(/ytomo-status-\w+/g, '').trim();
        
        switch (mode) {
            case 'reservation-running':
                statusBadge.classList.add('ytomo-status-reservation');
                if (customText) {
                    statusBadge.innerText = customText;
                } else {
                    statusBadge.innerText = '効率予約実行中';
                }
                statusBadge.classList.remove('js-hide');
                break;
            case 'idle-reservation':
                statusBadge.classList.add('ytomo-status-waiting');
                statusBadge.innerText = '予約可能';
                statusBadge.classList.remove('js-hide');
                break;
            case 'idle':
            default:
                statusBadge.classList.add('ytomo-status-waiting');
                statusBadge.innerText = '対象選択待ち';
                statusBadge.classList.remove('js-hide');
                break;
        }
    }
    
    // ============================================================================
    // UI更新処理（自己完結型）
    // ============================================================================
    
    // 削除: updateCountdownDisplay()は統一FAB更新システム(updateFabDisplay)に統合済み
    
    // ============================================================================
    // 効率モード管理
    // ============================================================================
    
    // 効率モードの有効/無効を切り替え
    toggleEfficiencyMode(): boolean {
        this.efficiencyMode.enabled = !this.efficiencyMode.enabled;
        
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
            this.saveEfficiencyModeSettings();
            this.log('🚀 効率モード有効化');
        } else {
            this.efficiencyMode.nextSubmitTarget = null;
            this.saveEfficiencyModeSettings();
            this.log('⏸️ 効率モード無効化');
        }
        
        return this.efficiencyMode.enabled;
    }
    
    // 効率モードの状態を取得（常にtrueを返す - 内部的に常時有効）
    isEfficiencyModeEnabled(): boolean {
        return true; // 効率モードは常に有効
    }
    
    // 次のsubmit標的時刻を取得
    getNextSubmitTarget(): Date | null {
        return this.efficiencyMode.nextSubmitTarget;
    }
    
    // 次のsubmit標的時刻を設定
    setNextSubmitTarget(target: Date): void {
        this.efficiencyMode.nextSubmitTarget = target;
    }
    
    // 次の00秒/30秒を計算（15秒未満の場合は次の目標時刻を選択）
    calculateNext00or30Seconds(): Date {
        const now = new Date();
        const currentSeconds = now.getSeconds();
        const nextTarget = new Date(now);
        
        let targetSeconds: number;
        let targetMinutes = nextTarget.getMinutes();
        
        // 0-2秒で0秒側に比重のあるランダム時間を生成（二次分布）
        const randomBuffer = Math.pow(Math.random(), 2) * 2; // 0～2秒、0側に比重
        
        if (currentSeconds < 30) {
            // 今の分の30秒 + ランダムバッファを候補とする
            targetSeconds = 30 + randomBuffer;
        } else {
            // 次の分の00秒 + ランダムバッファを候補とする
            targetMinutes += 1;
            targetSeconds = randomBuffer;
        }
        
        // 候補時刻までの猶予を計算
        const candidateTarget = new Date(now);
        candidateTarget.setMinutes(targetMinutes);
        candidateTarget.setSeconds(Math.floor(targetSeconds));
        candidateTarget.setMilliseconds((targetSeconds % 1) * 1000); // 小数部をミリ秒に
        
        const remainingMs = candidateTarget.getTime() - now.getTime();
        
        // 15秒未満の場合は30秒後に変更
        if (remainingMs < 15000) { // 15秒 = 15000ms
            candidateTarget.setSeconds(candidateTarget.getSeconds() + 30);
            this.log(`⚡ 効率モード: 猶予${Math.floor(remainingMs/1000)}秒は短いため30秒後に変更`);
        }
        
        return candidateTarget;
    }
    
    // 次の標的時刻を更新（submit後に呼び出し）
    updateNextSubmitTarget(): void {
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
        }
    }
    
    // Phase 1: 統一自動処理管理での効率モード待機（中断可能）
    async waitForEfficiencyTarget(targetTime: Date): Promise<boolean> {
        if (!this.automationManager.isRunning()) {
            console.log('⚠️ 統一自動処理が実行中でないため待機をスキップ');
            return false;
        }
        
        try {
            // UnifiedAutomationManagerの中断可能待機を使用
            // Phase 2で実装予定: 現在は基本的な待機のみ
            const waitMs = targetTime.getTime() - Date.now();
            if (waitMs > 0) {
                console.log(`🎯 統一効率モード待機: ${Math.floor(waitMs/1000)}秒 (統一管理)`);
                await new Promise(resolve => setTimeout(resolve, waitMs));
            }
            return true;
        } catch (error) {
            if (error instanceof CancellationError) {
                console.log('⏹️ 効率モード待機が中断されました');
                return false;
            }
            throw error;
        }
    }
    
    // 効率モードFAB更新タイマー開始
    private startEfficiencyModeUpdateTimer(): void {
        // 既存タイマーがあれば停止
        this.stopEfficiencyModeUpdateTimer();
        
        // 1秒間隔でFABボタン更新と目標時刻チェック
        this.efficiencyMode.updateTimer = window.setInterval(() => {
            // 目標時刻が過去になっていたら次の目標時刻に更新
            if (this.efficiencyMode.nextSubmitTarget && 
                this.efficiencyMode.nextSubmitTarget.getTime() <= Date.now()) {
                this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
                console.log('⚡ 効率モード: 目標時刻自動更新');
            }
            this.updateFabDisplay();
        }, 1000);
        
        console.log('⚡ 効率モードFAB更新タイマー開始');
    }
    
    // 効率モードFAB更新タイマー停止
    private stopEfficiencyModeUpdateTimer(): void {
        if (this.efficiencyMode.updateTimer) {
            clearInterval(this.efficiencyMode.updateTimer);
            this.efficiencyMode.updateTimer = null;
            console.log('⚡ 効率モードFAB更新タイマー停止');
        }
    }
    
    
    // 効率モード設定保存
    private saveEfficiencyModeSettings(): void {
        try {
            localStorage.setItem('ytomo-efficiency-mode', JSON.stringify({
                enabled: this.efficiencyMode.enabled
            }));
        } catch (error) {
            console.error('効率モード設定保存エラー:', error);
        }
    }
    
    // 効率モード設定読み込み
    loadEfficiencyModeSettings(): void {
        try {
            const saved = localStorage.getItem('ytomo-efficiency-mode');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.enabled) {
                    this.efficiencyMode.enabled = true;
                    this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
                }
            }
        } catch (error) {
            console.error('効率モード設定読み込みエラー:', error);
        }
    }
    
    // ============================================================================
    // changeダイアログ管理
    // ============================================================================
    
    // changeダイアログが表示されたことを記録
    markChangeDialogAppeared(): void {
        console.log(`🔄 [markChangeDialogAppeared] 現在の状態: hasAppeared=${this.changeDialogState.hasAppeared}, needsTimingAdjustment=${this.changeDialogState.needsTimingAdjustment}`);
        this.changeDialogState.hasAppeared = true;
        this.changeDialogState.needsTimingAdjustment = true;
        console.log('🔄 changeダイアログ出現を検出 - 毎回タイミング調整が必要');
    }
    
    // changeダイアログが出現したかどうか
    hasChangeDialogAppeared(): boolean {
        return this.changeDialogState.hasAppeared;
    }
    
    // changeダイアログのタイミング調整が必要か
    needsChangeDialogTimingAdjustment(): boolean {
        const result = this.changeDialogState.hasAppeared && this.changeDialogState.needsTimingAdjustment;
        console.log(`🔄 [needsChangeDialogTimingAdjustment] hasAppeared=${this.changeDialogState.hasAppeared}, needsTimingAdjustment=${this.changeDialogState.needsTimingAdjustment}, result=${result}`);
        return result;
    }
    
    // changeダイアログのタイミング調整用待機時間を計算
    calculateChangeDialogWaitTime(): number {
        if (!this.needsChangeDialogTimingAdjustment()) {
            return 0;
        }
        
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        
        // 現在時刻から次の00秒または30秒までの時間を計算
        let targetSeconds: number;
        if (seconds < 30) {
            targetSeconds = 30;
        } else {
            targetSeconds = 60; // 次の分の00秒
        }
        
        const waitMs = ((targetSeconds - seconds) * 1000) - milliseconds;
        const waitSeconds = Math.max(0, Math.floor(waitMs / 1000));
        
        console.log(`🔄 changeダイアログ待機時間計算: ${waitSeconds}秒 (現在: ${seconds}.${String(milliseconds).padStart(3, '0')}秒 → 目標: ${targetSeconds % 60}秒)`);
        return waitMs;
    }
    
    // changeダイアログのタイミング調整完了を記録
    markChangeDialogTimingAdjusted(): void {
        this.changeDialogState.needsTimingAdjustment = false;
        console.log('🔄 changeダイアログのタイミング調整完了');
    }
    
    // リロード時にchangeダイアログ状態をリセット（リロードするまで必ずchangeは出るため）
    resetChangeDialogState(): void {
        this.changeDialogState.hasAppeared = false;
        this.changeDialogState.needsTimingAdjustment = false;
        console.log('🔄 changeダイアログ状態をリセット');
    }
    
}

// 入場予約状態管理システムのシングルトンインスタンス
export const entranceReservationStateManager = new EntranceReservationStateManager();