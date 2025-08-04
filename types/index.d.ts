// プロジェクト固有の型定義

// =========================================================================
// 状態管理オブジェクトの型定義
// =========================================================================

export interface EntranceReservationState {
  isRunning: boolean;
  shouldStop: boolean;
  startTime: number | null;
  attempts: number;
}

export interface TimeSlotState {
  mode: 'idle' | 'selecting' | 'monitoring' | 'trying';
  targetSlots: TimeSlotTarget[];
  monitoringInterval: number | null;
  isMonitoring: boolean;
  retryCount: number;
  maxRetries: number;
  reloadInterval: number;
}

export interface TimeSlotTarget {
  timeText: string;
  tdSelector: string;
  priority?: number;
  location?: string;
  positionInfo?: any;
  status?: any;
}

export interface MultiTargetManager {
  targets: TimeSlotTarget[];
  addTarget(target: TimeSlotTarget): boolean;
  removeTarget(timeText: string, tdSelector: string): boolean;
  clearAll(): void;
  hasTargets(): boolean;
  getTargets(): TimeSlotTarget[];
  getCount(): number;
  isSelected(timeText: string, tdSelector: string): boolean;
  getLocationFromSelector(tdSelector: string): string;
}

export interface PageLoadingState {
  isLoading: boolean;
  startTime: number | null;
  timeout: number;
}

export interface ReloadCountdownState {
  isActive: boolean;
  timeLeft: number;
  intervalId: number | null;
  onComplete: (() => void) | null;
}

export interface CalendarWatchState {
  isWatching: boolean;
  observer: MutationObserver | null;
  currentSelectedDate: string | null;
}

// =========================================================================
// DOM要素・セレクタの型定義
// =========================================================================

export interface TimeSlotSelectors {
  table: string;
  slots: string;
  selectedSlot: string;
  fullSlot: string;
  availableSlot: string;
  timeSpan: string;
}

export interface TimeSlotInfo {
  timeText: string;
  isAvailable: boolean;
  isFull: boolean;
  element: HTMLElement;
  tdElement: HTMLTableCellElement;
  tdSelector: string;
}

export interface TdStatus {
  timeText: string;
  isAvailable: boolean;
  isFull: boolean;
  element: HTMLElement;
  tdElement: HTMLTableCellElement;
}

// =========================================================================
// キャッシュ管理の型定義
// =========================================================================

export interface CacheManager {
  generateKey(suffix?: string): string;
  saveTargetSlots(): void;
  saveTargetSlot(slotInfo: any): void;
  loadTargetSlot(): any | null;
  loadTargetSlots(): any | null;
  clearTargetSlots(): void;
  clearTargetSlot(): void;
  updateRetryCount(count: number): void;
  setMonitoringFlag(isActive?: boolean): void;
  getAndClearMonitoringFlag(): boolean;
  clearMonitoringFlag(): void;
}

// =========================================================================
// 設定・コンフィグの型定義  
// =========================================================================

export interface ReservationConfig {
  selectors: {
    submit: string;
    change: string;
    success: string;
    failure: string;
    close: string;
  };
  selectorTexts: {
    change: string;
    success: string;
    failure: string;
  };
  timeouts: {
    waitForSubmit: number;
    waitForResponse: number;
    waitForClose: number;
  };
  randomSettings: {
    minClickDelay: number;
    clickRandomRange: number;
    minRetryDelay: number;
    retryRandomRange: number;
  };
}

// =========================================================================
// ユーティリティ関数の型定義
// =========================================================================

export interface Dependencies {
  [key: string]: any;
}

export type SafeCallFunction = (funcName: string, ...args: any[]) => any;

// =========================================================================
// イベント・結果の型定義
// =========================================================================

export interface ReservationResult {
  success: boolean;
  attempts: number;
  cancelled?: boolean;
}

export interface ElementSearchResult {
  key: string;
  element: HTMLElement;
}

// =========================================================================
// グローバル変数拡張
// =========================================================================

declare global {
  interface Window {
    // Chrome拡張のUserScript環境での拡張
    GM_info?: any;
  }
}