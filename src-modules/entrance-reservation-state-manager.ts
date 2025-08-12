/**
 * 入場予約状態管理システム
 * 入場予約・監視の状態と対象を管理
 */

// 必要なimport
import { timeSlotSelectors, generateUniqueTdSelector, extractTdStatus } from './entrance-page-dom-utils';
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
    RESERVATION_RUNNING = 'reservation_running',
    MONITORING_RUNNING = 'monitoring_running',
    RESERVATION_COOLDOWN = 'reservation_cooldown'
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
    
    // 開始時対象キャッシュ（検証用）
    private initialTargetCache: {
        reservationTarget: ReservationTarget | null;
        monitoringTargets: MonitoringTarget[];
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
    
    // 予約クールタイム管理
    private reservationCooldown = {
        isActive: false,
        startTime: null as number | null,
        duration: 180000, // 3分（180秒）のクールタイム
        countdownInterval: null as number | null,
        remainingSeconds: null as number | null
    };
    
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
        
        // 初回開始時の対象をキャッシュに保存
        this.saveInitialTargets();
        
        // 効率モード有効時は目標時刻を再計算
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
            this.log('⚡ 効率モード: 監視開始時に目標時刻を再計算');
        }
        
        this.log('👁️ 監視処理を開始');
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
            monitoringTargets: this.monitoringTargets.map(target => ({ ...target })),
            timestamp: Date.now()
        };
        
        console.log('💾 初回開始時対象をキャッシュに保存');
        console.log('💾 予約対象:', this.initialTargetCache.reservationTarget);
        console.log('💾 監視対象:', this.initialTargetCache.monitoringTargets);
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
        
        // 監視対象の検証
        const initialMonitoring = this.initialTargetCache.monitoringTargets;
        const currentMonitoring = this.monitoringTargets;
        
        if (initialMonitoring.length !== currentMonitoring.length) {
            console.error('🚨 監視対象数が変更されました！');
            console.error('🚨 初回:', initialMonitoring.length, '個');
            console.error('🚨 現在:', currentMonitoring.length, '個');
            return false;
        }
        
        // 監視対象の詳細検証
        for (let i = 0; i < initialMonitoring.length; i++) {
            const initial = initialMonitoring[i];
            const current = currentMonitoring.find(t => 
                t.timeSlot === initial.timeSlot && t.locationIndex === initial.locationIndex);
            
            if (!current) {
                console.error('🚨 監視対象が削除されました！');
                console.error('🚨 削除された対象:', initial);
                return false;
            }
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
    
    // カウントダウン中かどうか
    isReloadCountdownActive(): boolean {
        return this.reloadCountdown.secondsRemaining !== null && this.reloadCountdown.secondsRemaining !== undefined;
    }
    
    // 残り秒数取得
    getReloadSecondsRemaining(): number | null {
        return this.reloadCountdown.secondsRemaining;
    }
    
    // リロード直前（3秒以内）かどうか
    isNearReload(): boolean {
        return this.isReloadCountdownActive() && 
               this.reloadCountdown.secondsRemaining !== null && 
               this.reloadCountdown.secondsRemaining <= 3;
    }
    
    // ============================================================================
    // 予約クールタイム管理
    // ============================================================================
    
    // クールタイム開始（100回試行後に呼び出される）
    startReservationCooldown(): void {
        // 効率モード中はクールタイム不要
        if (this.efficiencyMode.enabled) {
            console.log('⚡ 効率モード中のためクールタイムをスキップ');
            return;
        }
        
        this.reservationCooldown.isActive = true;
        this.reservationCooldown.startTime = Date.now();
        this.reservationCooldown.remainingSeconds = Math.floor(this.reservationCooldown.duration / 1000);
        
        // 実行状態は変更しない（手動操作を妨げないため）
        // this.executionState = ExecutionState.RESERVATION_COOLDOWN; // 削除
        
        console.log(`⏳ 予約クールタイム開始: ${this.reservationCooldown.remainingSeconds}秒 (手動操作は可能)`);
        
        // カウントダウンインターバル設定
        this.reservationCooldown.countdownInterval = window.setInterval(() => {
            if (this.reservationCooldown.remainingSeconds !== null) {
                this.reservationCooldown.remainingSeconds--;
                
                if (this.reservationCooldown.remainingSeconds <= 0) {
                    this.endReservationCooldown();
                } else {
                    // UI更新（ステータスバッジ）
                    this.updateCooldownDisplay();
                }
            }
        }, 1000);
        
        // 初回UI更新
        this.updateCooldownDisplay();
    }
    
    // クールタイム終了
    endReservationCooldown(): void {
        if (this.reservationCooldown.countdownInterval) {
            clearInterval(this.reservationCooldown.countdownInterval);
            this.reservationCooldown.countdownInterval = null;
        }
        
        this.reservationCooldown.isActive = false;
        this.reservationCooldown.startTime = null;
        this.reservationCooldown.remainingSeconds = null;
        
        // クールタイム終了（実行状態は既にIDLEのまま）
        
        console.log('✅ クールタイム終了 - 予約再開可能');
        
        // FABボタンを通常状態に戻す
        this.resetFABButtonFromCooldown();
        
        // 予約対象がある場合は自動的に予約再開
        if (this.hasReservationTarget()) {
            console.log('🔄 予約対象があるため予約を自動再開');
            this.startReservation();
            // 予約処理は外部のFABクリック処理に委譲
        }
    }
    
    // クールタイム中かどうか
    isReservationCooldownActive(): boolean {
        return this.reservationCooldown.isActive;
    }
    
    // 残りクールタイム秒数を取得
    getCooldownSecondsRemaining(): number | null {
        return this.reservationCooldown.remainingSeconds;
    }
    
    // クールタイム表示を更新
    private updateCooldownDisplay(): void {
        const remainingSeconds = this.reservationCooldown.remainingSeconds;
        if (remainingSeconds === null) return;
        
        // 段階別精度でカウントダウン表示
        let displayText: string;
        if (remainingSeconds > 60) {
            // 1分単位表示
            const minutes = Math.floor(remainingSeconds / 60);
            displayText = `予約待機中(${minutes}分)`;
        } else if (remainingSeconds > 10) {
            // 10秒単位表示
            const tens = Math.floor(remainingSeconds / 10) * 10;
            displayText = `予約待機中(${tens}秒)`;
        } else {
            // 1秒単位表示
            displayText = `予約待機中(${remainingSeconds}秒)`;
        }
        
        // ステータスバッジを更新
        this.updateStatusBadgeFromUnified('cooldown', displayText);
        
        // FABメインボタンの表示制御
        this.updateFABButtonForCooldown(remainingSeconds);
    }
    
    // クールタイム中のFABボタン表示を更新
    private updateFABButtonForCooldown(remainingSeconds: number): void {
        // 5秒前からは「予約再開中止」ボタンに変更
        const fabButton = document.querySelector('#ytomo-fab') as HTMLElement;
        if (!fabButton) return;
        
        if (remainingSeconds <= 5 && remainingSeconds > 0) {
            fabButton.textContent = '予約再開中止';
            fabButton.className = fabButton.className.replace(/cooldown-\w+/g, '').trim();
            fabButton.classList.add('cooldown-warning');
            fabButton.setAttribute('data-cooldown-cancel', 'true');
        } else {
            // 通常のクールタイム表示（手動操作可能状態）
            fabButton.textContent = '予約中断';
            fabButton.className = fabButton.className.replace(/cooldown-\w+/g, '').trim();
            fabButton.classList.add('cooldown-normal');
            fabButton.removeAttribute('data-cooldown-cancel');
        }
    }
    
    // クールタイム終了時にFABボタンを通常状態に戻す
    private resetFABButtonFromCooldown(): void {
        const fabButton = document.querySelector('#ytomo-fab') as HTMLElement;
        if (!fabButton) return;
        
        fabButton.removeAttribute('data-cooldown-cancel');
        fabButton.className = fabButton.className.replace(/cooldown-\w+/g, '').trim();
        // ボタンテキストは updateMainButtonDisplay() で更新される
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
        
        // 予約対象が変更された場合はクールタイムを解除
        if (this.isReservationCooldownActive()) {
            console.log('🔄 予約対象変更により予約再開待ち状態を解除');
            this.endReservationCooldown();
        }
        
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
            if (!this.isReloadCountdownActive()) {
                // 予約対象なし（ログ削減）
            }
            return false;
        }
        
        // 2. 時間帯選択状態の確認
        const selectedSlot = document.querySelector(timeSlotSelectors.selectedSlot);
        if (!selectedSlot) {
            // 時間帯未選択（ログ削減）
            return false;
        }
        
        // 予約対象あり（ログ削減）
        
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
    
    canStartMonitoring(): boolean {
        const result = this.monitoringTargets.length > 0;
        if (!this.isReloadCountdownActive()) {
            // 監視開始可否チェック（ログ削減）
        }
        if (!result && !this.efficiencyMode.updateTimer) {
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
        
        // デバッグログ追加（効率モードタイマー実行中はログ削減）
        if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
            // アクション判定（ログ削減）
            // ログ削減: 頻繁に呼ばれるため基本ログは削除
        }
        
        switch (this.priorityMode) {
            case PriorityMode.FORCE_RESERVATION:
                return canReserve ? 'reservation' : 'none';
                
            case PriorityMode.FORCE_MONITORING:
                return canMonitor ? 'monitoring' : 'none';
                
            case PriorityMode.AUTO:
            default:
                // 予約優先（両方可能な場合は予約を選択）
                if (canReserve) {
                    // 予約アクション選択（ログ削減）
                    if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                        // ログ削減: 戻り値ログを削除
                    }
                    return 'reservation';
                }
                if (canMonitor) {
                    // 監視アクション選択（ログ削減）
                    if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                        // ログ削減: 戻り値ログを削除
                    }
                    return 'monitoring';
                }
                // アクションなし（ログ削減）
                if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                    // ログ削減: 戻り値ログを削除
                }
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
    
    getFabButtonState(): 'enabled' | 'disabled' | 'running' | 'monitoring' | 'cooldown' {
        switch (this.executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                return 'running';
            case ExecutionState.MONITORING_RUNNING:
                return 'monitoring';
            case ExecutionState.RESERVATION_COOLDOWN:
                return 'cooldown';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                return preferredAction !== 'none' ? 'enabled' : 'disabled';
        }
    }
    
    // FAB部分での予約対象情報表示用
    getFabTargetDisplayInfo(): { hasTarget: boolean; displayText: string; targetType: 'reservation' | 'monitoring' | 'none' } {
        // カウントダウン中・効率モードタイマー実行中はログを削減
        if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
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
        
        // 監視対象がある場合は監視対象を表示
        if (this.hasMonitoringTargets() && this.monitoringTargets.length > 0) {
            if (!this.isReloadCountdownActive()) {
                // ログ削減: 頻繁に呼ばれるため削除
            }
            
            // 優先度順にソート（priority昇順）
            const sortedTargets = [...this.monitoringTargets].sort((a, b) => a.priority - b.priority);
            const dateText = getDisplayDate();
            
            // 監視対象の表示（1件でも複数件でも統一形式）
            const targetTexts = sortedTargets.map(target => {
                const location = LocationHelper.getLocationFromIndex(target.locationIndex);
                const locationText = location === 'east' ? '東' : '西';
                const result = `${locationText}${target.timeSlot}`;
                if (!this.isReloadCountdownActive()) {
                    // ログ削減: 頻繁に呼ばれるため削除
                }
                return result;
            });
            
            const displayText = `${dateText}\n${targetTexts.join('\n')}`;
            if (!this.isReloadCountdownActive()) {
                // ログ削減: 頻繁に呼ばれるため削除
            }
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
            case ExecutionState.RESERVATION_COOLDOWN:
                return 'クール\nタイム中';
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
    
    getInitialTargetCache(): typeof this.initialTargetCache {
        return this.initialTargetCache;
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
        const previousDate = this.selectedCalendarDate;
        this.selectedCalendarDate = date;
        this.log(`📅 カレンダー日付設定: ${date}`);
        
        // 日付が変更された場合はクールタイムを解除
        if (previousDate && previousDate !== date && this.isReservationCooldownActive()) {
            console.log(`🔄 日付変更 (${previousDate} → ${date}) により予約再開待ち状態を解除`);
            this.endReservationCooldown();
        }
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
                
                // 現在の監視対象をキャッシュに保存（キー名を復元時と統一）
                const cacheData = this.monitoringTargets.map(target => ({
                    timeSlot: target.timeSlot,    // 復元時と同じキー名を使用
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
            case ExecutionState.RESERVATION_COOLDOWN:
                // クールタイム中は中断不可
                span.innerText = 'クール\nタイム中';
                
                // 既存のupdateStatusBadge関数を使用
                this.updateStatusBadgeFromUnified('cooldown');
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                mainButton.classList.add('state-idle');
                mainButton.title = 'クールタイム中（中断不可）';
                mainButton.disabled = true;
                console.log(`🔍 [FAB更新] クールダウン状態でdisabled=true設定: state=${executionState}`);
                break;
                
            case ExecutionState.MONITORING_RUNNING:
                // メインボタンは基本テキストを表示
                span.innerText = fabText;
                
                // 既存のupdateStatusBadge関数を使用
                this.updateStatusBadgeFromUnified('monitoring');
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                mainButton.classList.add('ytomo-fab-monitoring');
                mainButton.title = '監視中断';
                mainButton.disabled = false;
                break;
                
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
                const statusMode = preferredAction === 'monitoring' ? 'idle-monitoring' :
                                 preferredAction === 'reservation' ? 'idle-reservation' : 'idle';
                this.updateStatusBadgeFromUnified(statusMode);
                
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                
                if (preferredAction === 'monitoring') {
                    mainButton.classList.add('state-enabled', 'state-monitoring');
                    mainButton.title = '監視開始';
                    mainButton.disabled = false;
                } else if (preferredAction === 'reservation') {
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
        
        // カウントダウン中は完了ログも削減
        if (!this.isReloadCountdownActive()) {
            // FAB更新完了ログを削減
        }
        
        // 【システム連動】オーバーレイ表示中はFABボタンを強制有効化
        const processingOverlay = document.getElementById('ytomo-processing-overlay');
        if (processingOverlay && !processingOverlay.classList.contains('hidden')) {
            if (mainButton.disabled) {
                mainButton.disabled = false;
                console.log('🛡️ [システム連動] オーバーレイ表示中につき中断ボタンを強制有効化');
            }
        }
        
        // 監視対象リスト表示も更新
        this.updateMonitoringTargetsDisplay();
    }
    
    // 監視対象リストの表示を更新
    private updateMonitoringTargetsDisplay(): void {
        const reservationTargetElement = document.getElementById('ytomo-reservation-target');
        const monitoringTargetsElement = document.getElementById('ytomo-monitoring-targets');
        
        if (!reservationTargetElement && !monitoringTargetsElement) {
            console.log('🔍 [対象表示更新] 予約対象・監視対象要素が見つかりません');
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
                if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                    console.log(`🔍 [予約対象表示更新] 表示: "${displayInfo.displayText}"`);
                }
            } else {
                reservationTargetElement.classList.remove('visible');
                reservationTargetElement.classList.add('hidden');
                reservationTargetElement.innerHTML = '';
            }
        }
        
        // 監視対象表示エリアの更新
        if (monitoringTargetsElement) {
            if (displayInfo.hasTarget && displayInfo.targetType === 'monitoring') {
                monitoringTargetsElement.innerHTML = displayInfo.displayText.replace(/\n/g, '<br>');
                // 表示状態の設定（背景色はSCSSで固定）
                monitoringTargetsElement.classList.remove('hidden');
                monitoringTargetsElement.classList.add('visible');
                
                // カウントダウン中はログを削減
                if (!this.isReloadCountdownActive()) {
                    console.log(`🔍 [監視対象表示更新] 表示: "${displayInfo.displayText}"`);
                }
            } else {
                monitoringTargetsElement.classList.remove('visible');
                monitoringTargetsElement.classList.add('hidden');
                monitoringTargetsElement.innerHTML = '';
            }
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
    
    // 既存のupdateStatusBadge関数を呼び出すヘルパー
    private updateStatusBadgeFromUnified(mode: string, customText?: string): void {
        // 循環依存を避けるため、DOM直接操作で簡易実装
        const statusBadge = document.querySelector('#ytomo-status-badge') as HTMLElement;
        if (!statusBadge) return;
        
        // 既存の状態クラスをクリア
        statusBadge.className = statusBadge.className.replace(/ytomo-status-\w+/g, '').trim();
        
        switch (mode) {
            case 'monitoring':
                statusBadge.classList.add('ytomo-status-monitoring');
                const prefix = this.isEfficiencyModeEnabled() ? '効率' : '';
                statusBadge.innerText = `${prefix}監視中`;
                statusBadge.classList.remove('js-hide');
                break;
            case 'reservation-running':
                statusBadge.classList.add('ytomo-status-reservation');
                if (customText) {
                    statusBadge.innerText = customText;
                } else {
                    statusBadge.innerText = '効率予約実行中';
                }
                statusBadge.classList.remove('js-hide');
                break;
            case 'cooldown':
                statusBadge.classList.add('ytomo-status-cooldown');
                statusBadge.innerText = customText || '予約待機中';
                statusBadge.classList.remove('js-hide');
                break;
            case 'idle-monitoring':
                statusBadge.classList.add('ytomo-status-waiting');
                statusBadge.innerText = '監視可能';
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