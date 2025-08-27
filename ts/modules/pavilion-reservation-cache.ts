/**
 * パビリオン予約キャッシュ管理モジュール
 * sessionStorageを使用した予約データの保存・取得
 */

import {
    ReservationCacheData,
    AutomationState,
    UserPreferences,
    CACHE_KEYS,
    DEFAULT_USER_PREFERENCES,
    ReservationDataUtils,
    generateReservationKey
} from './reservation-data';
import { loggers } from '../utils/logger';
const logger = loggers.automation;

export class PavilionReservationCache {
    /**
     * sessionStorageへの安全な保存
     */
    private static setItem(key: string, value: any): boolean {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(key, serialized);
            return true;
        } catch (error) {
            logger.error('キャッシュ保存エラー', { error });
            return false;
        }
    }

    /**
     * sessionStorageからの安全な取得
     */
    private static getItem<T>(key: string): T | null {
        try {
            const item = sessionStorage.getItem(key);
            if (!item) return null;
            return JSON.parse(item) as T;
        } catch (error) {
            logger.error('キャッシュ読み込みエラー', { error });
            return null;
        }
    }

    /**
     * sessionStorageからの削除
     */
    private static removeItem(key: string): void {
        try {
            sessionStorage.removeItem(key);
        } catch (error) {
            logger.error('キャッシュ削除エラー', { error });
        }
    }

    // ============ 予約データ管理 ============

    /**
     * 予約データを保存（パビリオンコード+時間スロットで一意キー生成）
     */
    static saveReservationData(pavilionCode: string, data: ReservationCacheData): boolean {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, data.selectedTimeSlot);
        allData[key] = data;
        
        const success = this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        if (success) {
            logger.info('予約データ保存', { key, timeDisplay: data.selectedTimeDisplay });
        }
        return success;
    }

    /**
     * 特定パビリオン+時間スロットの予約データを取得
     */
    static getReservationData(pavilionCode: string, timeSlot: string): ReservationCacheData | null {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, timeSlot);
        const data = allData[key];
        
        if (!data) return null;
        
        // データ有効性チェック
        if (!ReservationDataUtils.isValidReservationData(data)) {
            logger.warn('無効な予約データ', { key });
            this.removeReservationData(pavilionCode, timeSlot);
            return null;
        }
        
        // 期限チェック
        if (ReservationDataUtils.isDataExpired(data.timestamp)) {
            logger.warn('期限切れデータ', { key });
            this.removeReservationData(pavilionCode, timeSlot);
            return null;
        }
        
        return data;
    }

    /**
     * 特定パビリオンの全時間スロット予約データを取得
     */
    static getReservationDataByPavilion(pavilionCode: string): ReservationCacheData[] {
        const allData = this.getAllReservationData();
        const results: ReservationCacheData[] = [];
        
        for (const [key, data] of Object.entries(allData)) {
            if (data.pavilionCode === pavilionCode) {
                // データ有効性・期限チェック
                if (ReservationDataUtils.isValidReservationData(data) && 
                    !ReservationDataUtils.isDataExpired(data.timestamp)) {
                    results.push(data);
                } else {
                    // 無効なデータは削除
                    delete allData[key];
                }
            }
        }
        
        // 無効データがあった場合は更新
        if (Object.keys(allData).length !== Object.keys(this.getAllReservationData()).length) {
            this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        }
        
        return results;
    }

    /**
     * 全ての予約データを取得
     */
    static getAllReservationData(): Record<string, ReservationCacheData> {
        return this.getItem<Record<string, ReservationCacheData>>(CACHE_KEYS.RESERVATION_DATA) || {};
    }

    /**
     * 特定の予約データを削除
     */
    static removeReservationData(pavilionCode: string, timeSlot: string): void {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, timeSlot);
        delete allData[key];
        this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        logger.info('予約データ削除', { key });
    }

    /**
     * 特定パビリオンの全予約データを削除
     */
    static removeReservationDataByPavilion(pavilionCode: string): void {
        const allData = this.getAllReservationData();
        let deletedCount = 0;
        
        for (const key of Object.keys(allData)) {
            if (allData[key].pavilionCode === pavilionCode) {
                delete allData[key];
                deletedCount++;
            }
        }
        
        if (deletedCount > 0) {
            this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
            logger.info('パビリオン予約データ削除', { pavilionCode, deletedCount });
        }
    }

    /**
     * 全ての予約データをクリア
     */
    static clearAllReservationData(): void {
        this.removeItem(CACHE_KEYS.RESERVATION_DATA);
        logger.info('全予約データクリア');
    }

    /**
     * 予約データの状態を更新
     */
    static updateReservationStatus(pavilionCode: string, timeSlot: string, status: ReservationCacheData['status']): boolean {
        const data = this.getReservationData(pavilionCode, timeSlot);
        if (!data) return false;
        
        data.status = status;
        data.timestamp = Date.now(); // タイムスタンプ更新
        
        return this.saveReservationData(pavilionCode, data);
    }

    // ============ 自動操作状態管理 ============

    /**
     * 自動操作状態を保存
     */
    static saveAutomationState(state: AutomationState): boolean {
        const success = this.setItem(CACHE_KEYS.AUTOMATION_STATE, state);
        if (success) {
            logger.info('自動操作状態保存', { currentStep: state.currentStep });
        }
        return success;
    }

    /**
     * 自動操作状態を取得
     */
    static getAutomationState(): AutomationState | null {
        return this.getItem<AutomationState>(CACHE_KEYS.AUTOMATION_STATE);
    }

    /**
     * 自動操作状態をクリア
     */
    static clearAutomationState(): void {
        this.removeItem(CACHE_KEYS.AUTOMATION_STATE);
        logger.info('自動操作状態クリア');
    }

    // ============ ユーザー設定管理 ============

    /**
     * ユーザー設定を保存
     */
    static saveUserPreferences(preferences: UserPreferences): boolean {
        return this.setItem(CACHE_KEYS.USER_PREFERENCES, preferences);
    }

    /**
     * ユーザー設定を取得
     */
    static getUserPreferences(): UserPreferences {
        const saved = this.getItem<UserPreferences>(CACHE_KEYS.USER_PREFERENCES);
        return { ...DEFAULT_USER_PREFERENCES, ...saved };
    }

    // ============ ユーティリティ ============

    /**
     * キャッシュサイズを取得（概算）
     */
    static getCacheSize(): number {
        try {
            let total = 0;
            for (const key of Object.values(CACHE_KEYS)) {
                const item = sessionStorage.getItem(key);
                if (item) {
                    total += item.length;
                }
            }
            return total;
        } catch {
            return 0;
        }
    }

    /**
     * 期限切れデータを一括削除
     */
    static cleanupExpiredData(): void {
        const allData = this.getAllReservationData();
        let cleanedCount = 0;
        
        for (const [pavilionCode, data] of Object.entries(allData)) {
            if (ReservationDataUtils.isDataExpired(data.timestamp)) {
                delete allData[pavilionCode];
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
            logger.info('期限切れデータ削除', { cleanedCount });
        }
    }

    /**
     * デバッグ用: 全キャッシュ内容を表示
     */
    static debugLogAllCache(): void {
        logger.debug('パビリオン予約キャッシュ内容', {
            reservationData: this.getAllReservationData(),
            automationState: this.getAutomationState(),
            userPreferences: this.getUserPreferences(),
            cacheSize: this.getCacheSize()
        });
    }

    /**
     * 時間選択UIとの連携用: 選択データをキャッシュに保存
     */
    static saveSelectedTimeFromUI(pavilionCode: string, pavilionName: string, timeSlot: string, isAvailable: boolean): boolean {
        const reservationData = ReservationDataUtils.createReservationData(
            pavilionCode,
            pavilionName,
            timeSlot,
            isAvailable
        );
        
        return this.saveReservationData(pavilionCode, reservationData);
    }

    /**
     * 選択された予約データ一覧を取得（処理待ち状態のもの）
     */
    static getPendingReservations(): ReservationCacheData[] {
        const allData = this.getAllReservationData();
        return Object.values(allData).filter(data => data.status === 'pending');
    }

    /**
     * 現在処理中の予約データを取得
     */
    static getProcessingReservation(): ReservationCacheData | null {
        const allData = this.getAllReservationData();
        return Object.values(allData).find(data => data.status === 'processing') || null;
    }
}