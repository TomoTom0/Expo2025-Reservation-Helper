/**
 * 予約データ管理モジュール
 * 万博パビリオン予約の自動化で使用するデータ構造定義
 */

// 予約データの状態
export type ReservationStatus = 'pending' | 'processing' | 'completed' | 'failed';

// 予約キャッシュデータの型定義
export interface ReservationCacheData {
    pavilionCode: string;           // パビリオンコード
    pavilionName: string;           // パビリオン名
    selectedTimeSlot: string;       // 選択時間（例: "1000"）
    selectedTimeDisplay: string;    // 表示用時間（例: "10:00"）
    isAvailable: boolean;          // 予約可能フラグ
    timestamp: number;             // 保存時刻
    status: ReservationStatus;     // 処理状態
}

// 自動操作の状態
export interface AutomationState {
    isRunning: boolean;            // 自動操作実行中フラグ
    currentStep: string;           // 現在のステップ
    startTime: number;             // 開始時刻
    errorMessage?: string;         // エラーメッセージ
}

// ユーザー設定
export interface UserPreferences {
    autoCloseDialog: boolean;      // ダイアログ自動クローズ
    showDebugLogs: boolean;        // デバッグログ表示
    retryCount: number;            // リトライ回数
    waitTimeout: number;           // 待機タイムアウト(ms)
}

// キャッシュキーの定数
export const CACHE_KEYS = {
    RESERVATION_DATA: 'expo2025_reservation_data',
    AUTOMATION_STATE: 'expo2025_automation_state',
    USER_PREFERENCES: 'expo2025_user_preferences'
} as const;

// 予約データの一意キー生成
export const generateReservationKey = (pavilionCode: string, timeSlot: string): string => {
    return `${pavilionCode}_${timeSlot}`;
};

// デフォルト設定
export const DEFAULT_USER_PREFERENCES: UserPreferences = {
    autoCloseDialog: true,
    showDebugLogs: false,
    retryCount: 3,
    waitTimeout: 5000
};

// ユーティリティ関数
export class ReservationDataUtils {
    /**
     * 時間文字列を表示用に変換
     * @param timeSlot "1000" -> "10:00"
     */
    static formatTimeSlot(timeSlot: string): string {
        if (timeSlot.length !== 4) return timeSlot;
        return `${timeSlot.slice(0, 2)}:${timeSlot.slice(2)}`;
    }

    /**
     * 予約データの有効性チェック
     */
    static isValidReservationData(data: any): data is ReservationCacheData {
        return (
            typeof data === 'object' &&
            typeof data.pavilionCode === 'string' &&
            typeof data.pavilionName === 'string' &&
            typeof data.selectedTimeSlot === 'string' &&
            typeof data.selectedTimeDisplay === 'string' &&
            typeof data.isAvailable === 'boolean' &&
            typeof data.timestamp === 'number' &&
            typeof data.status === 'string'
        );
    }

    /**
     * データの期限チェック（セッション内での有効性）
     */
    static isDataExpired(timestamp: number, maxAge: number = 24 * 60 * 60 * 1000): boolean {
        return Date.now() - timestamp > maxAge;
    }

    /**
     * 予約データを作成
     */
    static createReservationData(
        pavilionCode: string,
        pavilionName: string,
        selectedTimeSlot: string,
        isAvailable: boolean
    ): ReservationCacheData {
        return {
            pavilionCode,
            pavilionName,
            selectedTimeSlot,
            selectedTimeDisplay: this.formatTimeSlot(selectedTimeSlot),
            isAvailable,
            timestamp: Date.now(),
            status: 'pending'
        };
    }
}