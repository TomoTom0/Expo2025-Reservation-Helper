/**
 * 入場予約状態管理システム - Entrance Reservation State Manager
 * 
 * 【責務】
 * - 入場予約の実行状態管理（IDLE/RESERVATION_RUNNING）
 * - 予約対象の統一管理（時間帯・場所・DOM selector）
 * - 効率モード（00秒/30秒タイミング）制御
 * - 通知音設定・FAB UI状態の一元管理
 * - changeダイアログ出現・タイミング調整管理
 * - リロードカウントダウン・ページローディング状態
 * 
 * 【統一状態管理の中核】
 * このクラスはアプリケーション全体の状態を統一管理し、
 * FAB UI・オーバーレイ・自動処理システムとの整合性を保つ
 * 
 * @version v1.0.0
 * @architecture Singleton pattern with unified state management
 */

// 必要なimport
import { timeSlotSelectors, generateUniqueTdSelector } from './entrance-page-dom-utils';
import { getCurrentSelectedCalendarDate } from './entrance-page-core';
import { UnifiedAutomationManager, CancellationError } from './unified-automation-manager';
// processing-overlayへの依存を削除（循環依存解決）
import type { ReservationConfig, ReservationResult } from '../types/index.js';
import { loggers } from '../utils/logger';

const logger = loggers.automation;

// ============================================================================
// 型定義
// ============================================================================

/**
 * 実行状態（排他的）
 * アプリケーション全体で同時に実行できる処理は1つのみ
 */
export enum ExecutionState {
    IDLE = 'idle',                          // 待機状態：何も実行していない
    RESERVATION_RUNNING = 'reservation_running' // 予約実行状態：予約処理実行中
}

/**
 * 優先実行モード
 * 複数の実行可能アクションがある場合の優先度決定
 */
export enum PriorityMode {
    AUTO = 'auto',                          // 自動判定（予約優先）
    FORCE_RESERVATION = 'force_reservation' // 予約強制実行（満員でも試行）
}

/**
 * 位置管理の定数
 * 万博入場予約画面の東西エリア選択テーブル構造に対応
 * - テーブルの1列目（index=0）が東エリア
 * - テーブルの2列目（index=1）が西エリア
 */
const LOCATION_MAP: Record<number, 'east' | 'west'> = {
    0: 'east',  // 0番目のtd = 東エリア
    1: 'west'   // 1番目のtd = 西エリア
} as const;

/** 東西からテーブル列インデックスへの逆引きマップ */
const LOCATION_TO_INDEX: Record<'east' | 'west', number> = {
    'east': 0,  // 東エリア → 1列目
    'west': 1   // 西エリア → 2列目
} as const;

/**
 * 予約対象（単一）
 * ユーザーが選択した入場予約の対象情報
 */
export interface ReservationTarget {
    timeSlot: string;        // 時間帯表示文字列 例: '11:00-', '14:30-'
    locationIndex: number;   // 位置インデックス: 0(東) or 1(西)
    selector: string;        // DOMセレクタ文字列（ユニークなtd要素特定用）
    isValid: boolean;        // 対象の有効性フラグ
}

/**
 * 予約成功情報
 * 予約が成功した際の詳細情報を保存
 */
export interface ReservationSuccess {
    timeSlot: string;        // 成功した時間帯 例: '11:00-'
    locationIndex: number;   // 成功した場所: 0(東) or 1(西)
    successTime: Date;       // 予約成功時刻（ログ・通知用）
}



// ============================================================================
// 位置管理ヘルパークラス
// ============================================================================

/**
 * 位置管理ヘルパークラス
 * 東西エリアとテーブルインデックスの相互変換ユーティリティ
 * DOM操作や表示用文字列生成に使用
 */
export class LocationHelper {
    /**
     * テーブル列インデックスから東西エリアを取得
     * @param index テーブル列インデックス (0 or 1)
     * @returns 'east' | 'west'
     */
    static getLocationFromIndex(index: number): 'east' | 'west' {
        return LOCATION_MAP[index] || 'east'; // 不正値はデフォルトで東
    }
    
    /**
     * 東西エリアからテーブル列インデックスを取得
     * @param location 'east' | 'west'
     * @returns テーブル列インデックス (0 or 1)
     */
    static getIndexFromLocation(location: 'east' | 'west'): number {
        return LOCATION_TO_INDEX[location];
    }
    
    /**
     * DOMセレクタ文字列からテーブル列インデックスを抽出
     * CSSセレクタの nth-child() 部分をパースしてインデックスを得る
     * @param selector CSSセレクタ文字列 例: "tr:nth-child(2) > td:nth-child(1)"
     * @returns テーブル列インデックス (0 or 1)
     */
    static getIndexFromSelector(selector: string): number {
        if (!selector || typeof selector !== 'string') {
            logger.warn('LocationHelper.getIndexFromSelector: 無効なselector', { selector });
            return 0; // デフォルトは東エリア
        }
        
        // "td:nth-child(N)" パターンを抽出
        const cellMatch = selector.match(/td:nth-child\((\d+)\)/);
        if (cellMatch && cellMatch[1]) {
            return parseInt(cellMatch[1]) - 1; // nth-childは1ベース、配列indexは0ベース
        }
        return 0; // パース失敗時は東エリアデフォルト
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

/**
 * 入場予約状態管理クラス
 * アプリケーション全体の中核シングルトン状態管理システム
 * 
 * 【設計原則】
 * - Single Source of Truth: すべての状態をこのクラスで一元管理
 * - 原子性: 状態変更は原子的に実行、中途半端な状態を回避
 * - 一貫性: FAB UI・overlay・自動処理との状態同期を保証
 * - 中断可能: すべての長時間処理は中断可能に設計
 */
export class EntranceReservationStateManager {
    // ==================== 実行状態管理 ====================
    /** 現在の実行状態（IDLE/RESERVATION_RUNNING） */
    private executionState: ExecutionState = ExecutionState.IDLE;
    
    /** 開始時対象キャッシュ（予約処理中の整合性検証用） */
    private initialTargetCache: {
        reservationTarget: ReservationTarget | null;
        timestamp: number;
    } | null = null;
    
    /** 統一自動処理管理システム（効率モード・予約処理・中断制御） */
    private automationManager: UnifiedAutomationManager;
    
    /**
     * コンストラクタ
     * シングルトンインスタンスとして初期化される
     */
    constructor() {
        // 統一自動処理管理を初期化（中断可能な非同期処理管理）
        this.automationManager = new UnifiedAutomationManager(this);
        
        // localStorageから保存された設定を復元
        this.loadNotificationSoundSettings();
        
        logger.info('統一状態管理システム初期化完了');
    }
    
    // ==================== 対象情報管理 ====================
    /** 現在の予約対象（時間帯・位置・セレクタ） */
    private reservationTarget: ReservationTarget | null = null;
    
    /** 予約成功情報（成功後の表示・通知用） */
    private reservationSuccess: ReservationSuccess | null = null;
    
    /** ユーザーが選択したカレンダー日付 (YYYY-MM-DD形式) */
    private selectedCalendarDate: string | null = null;
    
    /** 優先度モード（現在は予約のみサポート） */
    private priorityMode: PriorityMode = PriorityMode.AUTO;
    
    // ==================== 予約実行状態管理 ====================
    /** 予約実行情報（旧entranceReservationStateから統合） */
    private reservationExecution = {
        shouldStop: false,              // 中断フラグ（ユーザーが中断ボタンを押した場合）
        startTime: null as number | null, // 予約開始時刻（タイムアウト判定用）
        attempts: 0                     // 予約試行回数（サイクルカウンタ）
    };

    // ==================== 効率モード管理 ====================
    /** 効率モード設定管理（目標秒タイミング制御） */
    private efficiencyMode = {
        enabled: true, // 常時有効に設定（v1.0.0ではデフォルト有効）
        targetSecond: 35, // デフォルト目標秒（35秒）
        nextSubmitTarget: null as Date | null,     // 次のsubmit目標時刻
        updateTimer: null as number | null         // FABボタン更新タイマー
    };
    
    /** changeダイアログ検出・調整管理（予約サイトの「change」ダイアログ対策） */
    private changeDialogState = {
        hasAppeared: false,             // 一度でもchangeダイアログが表示されたか
        needsTimingAdjustment: false    // タイミング調整が必要か（00/30秒タイミング用）
    };
    
    // ==================== リロード・ページ状態管理 ====================
    /** リロードカウントダウン状態管理（旧reloadCountdownStateから統合） */
    private reloadCountdown = {
        totalSeconds: 30,                           // カウントダウン総秒数
        secondsRemaining: null as number | null,    // 残り秒数（nullは停止中）
        startTime: null as number | null,           // カウントダウン開始時刻
        countdownInterval: null as number | null,   // カウントダウン表示更新用タイマー
        reloadTimer: null as number | null          // リロード実行用タイマー
    };
    
    /** ページ読み込み状態管理（旧pageLoadingStateから統合） */
    private pageLoading = {
        isLoading: false,                    // ページ読み込み中フラグ
        startTime: null as number | null,    // 読み込み開始時刻
        timeout: 10000                       // タイムアウト時間（10秒）
    };
    
    // ==================== デバッグ・通知設定 ====================
    /** デバッグログ出力フラグ（v1.0.0では開発用に有効） */
    private debugMode: boolean = true;
    
    /** 予約成功時の8bitスタイル音声通知設定 */
    private notificationSound = {
        enabled: true // デフォルトで有効（ユーザーがoverlayで切り替え可能）
    };
    // ============================================================================
    // 実行状態管理 API
    // 【主要メソッド】
    // - getExecutionState() / setExecutionState(): 現在状態の取得・設定
    // - startReservation(): 予約処理開始
    // - stop(): すべての処理を停止
    // - canStartReservation(): 予約開始可能性判定
    // ============================================================================
    
    /**
     * 現在の実行状態を取得
     * @returns 現在の実行状態
     */
    getExecutionState(): ExecutionState {
        return this.executionState;
    }
    
    /**
     * 実行状態を設定
     * デバッグモード時は状態変更ログを出力
     * @param state 設定する実行状態
     */
    setExecutionState(state: ExecutionState): void {
        this.executionState = state;
        if (this.debugMode) {
            logger.info('実行状態変更', { state });
        }
    }
    
    /**
     * 予約処理を開始
     * 
     * 【機能】
     * - 初回開始時: 予約開始条件チェック + ターゲットキャッシュ保存
     * - 継続サイクル: 実行中でも継続可能（リロード後の再開始など）
     * - 効率モード: 次の00/30秒ターゲット計算 + 更新タイマー開始
     * 
     * @returns 開始成功時true、失敗時false
     */
    startReservation(): boolean {
        // 初回のみ条件チェック（2サイクル目以降は実行中でも継続）
        if (this.executionState !== ExecutionState.RESERVATION_RUNNING && 
            this.executionState !== ExecutionState.IDLE) {
            this.log('予約開始失敗: 他の処理が実行中', 'warn');
            return false;
        }
        
        // 初回のみ予約開始条件チェック
        if (this.executionState === ExecutionState.IDLE && !this.canStartReservation()) {
            this.log('予約開始失敗: 条件未満足', 'warn');
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
            this.log('初回予約開始: 試行回数を初期化', 'debug');
            
            // 初回開始時の対象をキャッシュに保存
            this.saveInitialTargets();
        }
        
        // 【毎回更新】効率モード目標時刻とタイマー
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
            this.log('効率モード: 目標時刻を再計算', 'debug');
            this.startEfficiencyModeUpdateTimer();
        }
        
        const cycleType = this.reservationExecution.attempts === 0 ? '初回' : `${this.reservationExecution.attempts}サイクル目継続`;
        this.log('予約処理を開始', 'debug', { cycleType });
        return true;
    }
    
    

    /**
     * すべての処理を停止しIDLE状態に戻す
     * 
     * 【停止対象】
     * - 予約実行情報のリセット
     * - 初回開始時ターゲットキャッシュのクリア
     * - 効率モード更新タイマーの停止
     */
    stop(): void {
        const prevState = this.executionState;
        this.executionState = ExecutionState.IDLE;
        
        // 初回開始時対象キャッシュをクリア
        this.clearInitialTargets();
        
        // 効率モードタイマーを停止
        this.stopEfficiencyModeUpdateTimer();
        
        switch (prevState) {
            case ExecutionState.RESERVATION_RUNNING:
                this.log('予約処理を停止', 'info');
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
    
    /**
     * 予約中断フラグを設定
     * ユーザーが中断ボタンを押した際に呼び出される
     * 
     * 【中断メカニズム】
     * 1. shouldStopフラグを設定
     * 2. UnifiedAutomationManagerで実行中の場合は即座中断
     * 3. 状態変更は予約処理ループ完了後に実行
     * 
     * @param shouldStop true:中断、false:継続
     */
    setShouldStop(shouldStop: boolean): void {
        this.reservationExecution.shouldStop = shouldStop;
        this.log('予約中断フラグ', 'warn', { shouldStop });
        
        // 統一自動処理管理での即座中断処理
        if (shouldStop && this.automationManager.isRunning()) {
            this.log('統一自動処理管理での即座中断を実行', 'warn');
            this.automationManager.abort();
        }
        
        // 注意: 状態変更はRESERVATION_RUNNINGのまま維持
        // 予約処理ループが中断を検知して終了するまで待機
    }

    // ============================================================================
    // 開始時対象キャッシュ管理（検証用）
    // ============================================================================
    
    /**
     * 初回予約開始時の対象をキャッシュに保存
     * 予約処理中にユーザーが別の時間帯を選択した場合の検知用
     */
    private saveInitialTargets(): void {
        this.initialTargetCache = {
            reservationTarget: this.reservationTarget ? { ...this.reservationTarget } : null,
            timestamp: Date.now()
        };
        
        logger.info('初回開始時対象をキャッシュに保存', { reservationTarget: this.initialTargetCache.reservationTarget });
    }
    
    /**
     * 予約対象の一貫性を検証
     * 予約処理中にユーザーが別の時間帯を選択した場合の検出
     * 
     * 【検証項目】
     * - 予約対象の時間帯一致性
     * - 予約対象の位置一致性
     * 
     * @returns true:一貫性OK、false:不一致検知（処理中断が必要）
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
                logger.error('予約対象が変更されました！', { initial: initialReservation, current: currentReservation });
                return false;
            }
        } else if (initialReservation !== currentReservation) {
            // 片方がnullで片方が存在する場合
            logger.error('予約対象の存在状態が変更されました！', { initial: initialReservation, current: currentReservation });
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
        logger.info('初回開始時対象キャッシュをクリア');
    }
    
    // ============================================================================
    // 統一自動処理管理へのアクセスメソッド（Phase 2で追加）
    // ============================================================================

    /**
     * 統一効率モード待機処理を実行
     * UnifiedAutomationManager経由で中断可能な待機を実行
     * 
     * @param targetTime 目標時刻（00秒または30秒のタイミング）
     * @returns Promise<void> 中断時はCancellationErrorをthrow
     */
    async executeUnifiedEfficiencyWait(targetTime: Date): Promise<void> {
        return await this.automationManager.executeEfficiencyWait(targetTime);
    }

    /**
     * 統一中断可能待機
     * AbortSignalを使用して中断可能な待機を実行
     * 
     * @param ms 待機時間（ミリ秒）
     * @param signal 中断シグナル（AbortControllerから生成）
     * @returns Promise<void> 中断時はCancellationErrorをthrow
     */
    async executeUnifiedWaitWithCancellation(ms: number, signal: AbortSignal): Promise<void> {
        return await this.automationManager.waitWithCancellation(ms, signal);
    }

    /**
     * 統一予約処理を実行
     * UnifiedAutomationManager経由で予約処理を実行
     * 
     * @param config 予約設定オブジェクト（対象時間帯・位置など）
     * @returns Promise<ReservationResult> 予約結果（成功/失敗/エラー）
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
        this.log('予約試行回数', 'debug', { attempts: this.reservationExecution.attempts });
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
        
        this.log('リロードカウントダウン開始', 'debug', { seconds });
        
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
        
        this.log('リロードカウントダウン停止', 'debug');
    }
    
    
    // ============================================================================
    // ページ読み込み状態管理（旧pageLoadingStateから統合）
    // ============================================================================
    
    // ページ読み込み状態を設定
    setPageLoadingState(isLoading: boolean): void {
        this.pageLoading.isLoading = isLoading;
        if (isLoading) {
            this.pageLoading.startTime = Date.now();
            this.log('ページ読み込み開始', 'debug');
        } else {
            this.pageLoading.startTime = null;
            this.log('ページ読み込み完了', 'debug');
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
                this.log('予約対象設定失敗: DOM要素が見つからない', 'warn');
                return;
            }
        }
        
        this.reservationTarget = {
            timeSlot,
            locationIndex,
            selector,
            isValid: true
        };
        
        
        const targetInfo = LocationHelper.formatTargetInfo(timeSlot, locationIndex);
        this.log('予約対象設定', 'info', { targetInfo });
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
            this.log('予約対象クリア', 'debug', { info });
            
            // 解除後の状態復帰ログ出力
            const preferredAction = this.getPreferredAction();
            this.log('予約対象解除後の状態', 'debug', { preferredAction });
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
            // 過剰ログ防止のため削除
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
        this.log('優先度モード変更', 'debug', { mode });
    }
    
    // ============================================================================
    // 既存システムとの互換性
    // ============================================================================
    
    
    
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
            const displayText = `${dateText}\n予約成功🎉\n${locationText}${this.reservationSuccess.timeSlot}`;
            logger.info('FAB予約成功表示テキスト', { displayText });
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
        
        this.log('全対象クリア', 'debug', { reservationCount });
    }
    
    // カレンダー日付の設定・取得
    setSelectedCalendarDate(date: string): void {
        this.selectedCalendarDate = date;
        this.log('カレンダー日付設定', 'debug', { date });
        
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
        const targetInfo = LocationHelper.formatTargetInfo(timeSlot, locationIndex);
        this.log('予約成功情報設定', 'info', { targetInfo });
        
        // 成功時は予約対象をクリア
        this.reservationTarget = null;
        this.log('予約成功により対象をクリア', 'info');
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
            this.log('予約成功情報クリア', 'debug', { info });
        }
    }
    
    // ============================================================================
    // デバッグ・ログ
    // ============================================================================
    
    private log(message: string, level: 'debug' | 'info' | 'warn' | 'error' = 'debug', data?: any): void {
        if (this.debugMode) {
            logger[level](message, data);
        }
    }
    
    
    
    // ============================================================================
    // FAB表示制御統一メソッド（UI分散問題の解決）
    // ============================================================================
    
    // FAB表示を更新（全UI制御をここに集約）
    updateFabDisplay(): void {
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (!fabContainer) {
            logger.debug('統一FAB更新: FABコンテナが見つかりません');
            return;
        }
        
        const mainButton = fabContainer.querySelector('.ytomo-fab') as HTMLButtonElement;
        if (!mainButton) {
            logger.debug('統一FAB更新: メインボタンが見つかりません');
            return;
        }
        
        const span = mainButton.querySelector('.ytomo-fab-status') as HTMLElement;
        if (!span) {
            logger.debug('統一FAB更新: .ytomo-fab-statusエレメントが見つかりません');
            return;
        }
        
        // 統一システムから状態とテキストを取得
        const executionState = this.getExecutionState();
        const fabText = this.getFabButtonText();
        const preferredAction = this.getPreferredAction();
        
        // 予約実行中のdisabled問題デバッグ用（効率モードタイマー実行中はログ削減）
        if (executionState === ExecutionState.RESERVATION_RUNNING && !this.efficiencyMode.updateTimer) {
            logger.debug('FAB更新: 予約実行中', { executionState, disabledBefore: mainButton.disabled });
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
                    logger.debug('FAB更新: 予約実行中のdisabled設定完了', { disabled: mainButton.disabled });
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
                        logger.debug('FAB更新: IDLE状態でdisabled=true設定', { executionState });
                    }
                }
                break;
        }
        
        
        // 【システム連動】オーバーレイ表示中はFABボタンを強制有効化
        const processingOverlay = document.getElementById('ytomo-processing-overlay');
        if (processingOverlay && !processingOverlay.classList.contains('hidden')) {
            if (mainButton.disabled) {
                mainButton.disabled = false;
                logger.debug('システム連動: オーバーレイ表示中につき中断ボタンを強制有効化');
            }
        }
        
        // 予約対象表示も更新
        this.updateTargetDisplay();
    }
    
    // 予約対象の表示を更新
    private updateTargetDisplay(): void {
        const reservationTargetElement = document.getElementById('ytomo-reservation-target');
        
        if (!reservationTargetElement) {
            logger.debug('対象表示更新: 予約対象要素が見つかりません');
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
                    logger.debug('予約対象表示更新: 表示', { displayText: displayInfo.displayText });
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
        logger.info('統一状態デバッグ情報', {
            executionState: this.executionState,
            priorityMode: this.priorityMode,
            reservationTarget: this.reservationTarget,
            canStartReservation: this.canStartReservation(),
            preferredAction: this.getPreferredAction()
        });
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
            this.log('効率モード有効化', 'info');
        } else {
            this.efficiencyMode.nextSubmitTarget = null;
            this.saveEfficiencyModeSettings();
            this.log('効率モード無効化', 'info');
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
    
    // 次の目標時刻を計算（デフォルト35秒）
    calculateNext00or30Seconds(): Date {
        const now = new Date();
        const currentSeconds = now.getSeconds();
        const nextTarget = new Date(now);
        
        // デフォルトの目標秒を使用（35秒）
        const targetSecond = this.efficiencyMode.targetSecond || 35;
        
        let targetMinutes = nextTarget.getMinutes();
        
        // 0-2秒で0秒側に比重のあるランダム時間を生成（二次分布）
        const randomBuffer = Math.pow(Math.random(), 2) * 2; // 0～2秒、0側に比重
        const targetSeconds = targetSecond + randomBuffer;
        
        // 現在の秒が目標秒を過ぎている場合は次の分にする
        if (currentSeconds >= targetSecond) {
            targetMinutes += 1;
        }
        
        // 目標時刻を設定
        const candidateTarget = new Date(now);
        candidateTarget.setMinutes(targetMinutes);
        candidateTarget.setSeconds(Math.floor(targetSeconds));
        candidateTarget.setMilliseconds((targetSeconds % 1) * 1000); // 小数部をミリ秒に
        
        const remainingMs = candidateTarget.getTime() - now.getTime();
        
        // 15秒未満の場合は次の分に変更
        if (remainingMs < 15000) { // 15秒 = 15000ms
            candidateTarget.setMinutes(candidateTarget.getMinutes() + 1);
            this.log('効率モード: 猶予時間が短いため次の分に変更', 'debug', { remainingSeconds: Math.floor(remainingMs/1000) });
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
            logger.warn('統一自動処理が実行中でないため待機をスキップ');
            return false;
        }
        
        try {
            // UnifiedAutomationManagerの中断可能待機を使用
            // Phase 2で実装予定: 現在は基本的な待機のみ
            const waitMs = targetTime.getTime() - Date.now();
            if (waitMs > 0) {
                logger.info('統一効率モード待機', { waitSeconds: Math.floor(waitMs/1000) });
                await new Promise(resolve => setTimeout(resolve, waitMs));
            }
            return true;
        } catch (error) {
            if (error instanceof CancellationError) {
                logger.info('効率モード待機が中断されました');
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
                logger.debug('効率モード: 目標時刻自動更新');
            }
            this.updateFabDisplay();
        }, 1000);
        
        logger.info('効率モードFAB更新タイマー開始');
    }
    
    // 効率モードFAB更新タイマー停止
    private stopEfficiencyModeUpdateTimer(): void {
        if (this.efficiencyMode.updateTimer) {
            clearInterval(this.efficiencyMode.updateTimer);
            this.efficiencyMode.updateTimer = null;
            logger.info('効率モードFAB更新タイマー停止');
        }
    }
    
    
    // 目標秒を設定
    setTargetSecond(second: number): void {
        if (second >= 0 && second <= 59) {
            this.efficiencyMode.targetSecond = second;
            this.saveEfficiencyModeSettings();
            
            // 次回の目標時刻を再計算
            if (this.efficiencyMode.enabled) {
                this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
                this.log('目標秒を更新', 'info', { targetSecond: second });
            }
        } else {
            logger.warn('無効な目標秒', { second });
        }
    }

    // 現在の目標秒を取得
    getTargetSecond(): number {
        return this.efficiencyMode.targetSecond;
    }

    // 効率モード設定保存
    private saveEfficiencyModeSettings(): void {
        try {
            localStorage.setItem('ytomo-efficiency-mode', JSON.stringify({
                enabled: this.efficiencyMode.enabled,
                targetSecond: this.efficiencyMode.targetSecond
            }));
        } catch (error) {
            logger.error('効率モード設定保存エラー', { error });
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
                    this.efficiencyMode.targetSecond = settings.targetSecond || 35; // デフォルト35秒
                    this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
                }
            }
        } catch (error) {
            logger.error('効率モード設定読み込みエラー', { error });
        }
    }
    
    // ============================================================================
    // 通知音設定管理
    // ============================================================================
    
    // 通知音の有効/無効を切り替え
    toggleNotificationSound(): boolean {
        this.notificationSound.enabled = !this.notificationSound.enabled;
        this.saveNotificationSoundSettings();
        this.log('通知音設定変更', 'info', { enabled: this.notificationSound.enabled });
        return this.notificationSound.enabled;
    }
    
    // 通知音が有効かどうか
    isNotificationSoundEnabled(): boolean {
        return this.notificationSound.enabled;
    }
    
    // 通知音設定を保存
    private saveNotificationSoundSettings(): void {
        try {
            localStorage.setItem('ytomo-notification-sound', JSON.stringify({
                enabled: this.notificationSound.enabled
            }));
        } catch (error) {
            logger.error('通知音設定保存エラー', { error });
        }
    }
    
    // 通知音設定を読み込み
    loadNotificationSoundSettings(): void {
        try {
            const saved = localStorage.getItem('ytomo-notification-sound');
            if (saved) {
                const settings = JSON.parse(saved);
                this.notificationSound.enabled = settings.enabled !== false; // デフォルトは有効
            }
        } catch (error) {
            logger.error('通知音設定読み込みエラー', { error });
        }
    }
    
    // ============================================================================
    // changeダイアログ管理
    // ============================================================================
    
    // changeダイアログが表示されたことを記録
    markChangeDialogAppeared(): void {
        logger.debug('markChangeDialogAppeared: 現在の状態', { hasAppeared: this.changeDialogState.hasAppeared, needsTimingAdjustment: this.changeDialogState.needsTimingAdjustment });
        
        if (this.changeDialogState.hasAppeared) {
            // 2回目以降の出現：タイミング調整が必要
            this.changeDialogState.needsTimingAdjustment = true;
            logger.debug('changeダイアログ2回目以降の出現を検出 - タイミング調整が必要');
        } else {
            // 最初の出現：タイミング調整は不要
            this.changeDialogState.hasAppeared = true;
            this.changeDialogState.needsTimingAdjustment = false;
            logger.debug('changeダイアログ初回出現を検出 - タイミング調整はスキップ');
        }
    }
    
    // changeダイアログが出現したかどうか
    hasChangeDialogAppeared(): boolean {
        return this.changeDialogState.hasAppeared;
    }
    
    // changeダイアログのタイミング調整が必要か
    needsChangeDialogTimingAdjustment(): boolean {
        const result = this.changeDialogState.hasAppeared && this.changeDialogState.needsTimingAdjustment;
        logger.debug('needsChangeDialogTimingAdjustment', { hasAppeared: this.changeDialogState.hasAppeared, needsTimingAdjustment: this.changeDialogState.needsTimingAdjustment, result });
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
        
        logger.debug('changeダイアログ待機時間計算', { waitSeconds, currentSeconds: seconds, currentMilliseconds: milliseconds, targetSeconds: targetSeconds % 60 });
        return waitMs;
    }
    
    // changeダイアログのタイミング調整完了を記録
    markChangeDialogTimingAdjusted(): void {
        this.changeDialogState.needsTimingAdjustment = false;
        logger.debug('changeダイアログのタイミング調整完了');
    }
    
    // リロード時にchangeダイアログ状態をリセット（リロードするまで必ずchangeは出るため）
    resetChangeDialogState(): void {
        this.changeDialogState.hasAppeared = false;
        this.changeDialogState.needsTimingAdjustment = false;
        logger.debug('changeダイアログ状態をリセット');
    }
    
}

// 入場予約状態管理システムのシングルトンインスタンス
export const entranceReservationStateManager = new EntranceReservationStateManager();