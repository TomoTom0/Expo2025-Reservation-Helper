"use strict";
(this["webpackChunkYtomoExtension"] = this["webpackChunkYtomoExtension"] || []).push([[619],{

/***/ 619:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  PavilionReservationCache: () => (/* binding */ PavilionReservationCache)
});

;// ./ts/modules/reservation-data.ts
/**
 * 予約データ管理モジュール
 * 万博パビリオン予約の自動化で使用するデータ構造定義
 */
// キャッシュキーの定数
const CACHE_KEYS = {
    RESERVATION_DATA: 'expo2025_reservation_data',
    AUTOMATION_STATE: 'expo2025_automation_state',
    USER_PREFERENCES: 'expo2025_user_preferences'
};
// 予約データの一意キー生成
const generateReservationKey = (pavilionCode, timeSlot) => {
    return `${pavilionCode}_${timeSlot}`;
};
// デフォルト設定
const DEFAULT_USER_PREFERENCES = {
    autoCloseDialog: true,
    showDebugLogs: false,
    retryCount: 3,
    waitTimeout: 5000
};
// ユーティリティ関数
class ReservationDataUtils {
    /**
     * 時間文字列を表示用に変換
     * @param timeSlot "1000" -> "10:00"
     */
    static formatTimeSlot(timeSlot) {
        if (timeSlot.length !== 4)
            return timeSlot;
        return `${timeSlot.slice(0, 2)}:${timeSlot.slice(2)}`;
    }
    /**
     * 予約データの有効性チェック
     */
    static isValidReservationData(data) {
        return (typeof data === 'object' &&
            typeof data.pavilionCode === 'string' &&
            typeof data.pavilionName === 'string' &&
            typeof data.selectedTimeSlot === 'string' &&
            typeof data.selectedTimeDisplay === 'string' &&
            typeof data.isAvailable === 'boolean' &&
            typeof data.timestamp === 'number' &&
            typeof data.status === 'string');
    }
    /**
     * データの期限チェック（セッション内での有効性）
     */
    static isDataExpired(timestamp, maxAge = 24 * 60 * 60 * 1000) {
        return Date.now() - timestamp > maxAge;
    }
    /**
     * 予約データを作成
     */
    static createReservationData(pavilionCode, pavilionName, selectedTimeSlot, isAvailable) {
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

;// ./ts/modules/pavilion-reservation-cache.ts
/**
 * パビリオン予約キャッシュ管理モジュール
 * sessionStorageを使用した予約データの保存・取得
 */

class PavilionReservationCache {
    /**
     * sessionStorageへの安全な保存
     */
    static setItem(key, value) {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(key, serialized);
            return true;
        }
        catch (error) {
            console.error('❌ Cache save error:', error);
            return false;
        }
    }
    /**
     * sessionStorageからの安全な取得
     */
    static getItem(key) {
        try {
            const item = sessionStorage.getItem(key);
            if (!item)
                return null;
            return JSON.parse(item);
        }
        catch (error) {
            console.error('❌ Cache load error:', error);
            return null;
        }
    }
    /**
     * sessionStorageからの削除
     */
    static removeItem(key) {
        try {
            sessionStorage.removeItem(key);
        }
        catch (error) {
            console.error('❌ Cache remove error:', error);
        }
    }
    // ============ 予約データ管理 ============
    /**
     * 予約データを保存（パビリオンコード+時間スロットで一意キー生成）
     */
    static saveReservationData(pavilionCode, data) {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, data.selectedTimeSlot);
        allData[key] = data;
        const success = this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        if (success) {
            console.log(`💾 予約データ保存: ${key} - ${data.selectedTimeDisplay}`);
        }
        return success;
    }
    /**
     * 特定パビリオン+時間スロットの予約データを取得
     */
    static getReservationData(pavilionCode, timeSlot) {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, timeSlot);
        const data = allData[key];
        if (!data)
            return null;
        // データ有効性チェック
        if (!ReservationDataUtils.isValidReservationData(data)) {
            console.warn(`⚠️ 無効な予約データ: ${key}`);
            this.removeReservationData(pavilionCode, timeSlot);
            return null;
        }
        // 期限チェック
        if (ReservationDataUtils.isDataExpired(data.timestamp)) {
            console.warn(`⏰ 期限切れデータ: ${key}`);
            this.removeReservationData(pavilionCode, timeSlot);
            return null;
        }
        return data;
    }
    /**
     * 特定パビリオンの全時間スロット予約データを取得
     */
    static getReservationDataByPavilion(pavilionCode) {
        const allData = this.getAllReservationData();
        const results = [];
        for (const [key, data] of Object.entries(allData)) {
            if (data.pavilionCode === pavilionCode) {
                // データ有効性・期限チェック
                if (ReservationDataUtils.isValidReservationData(data) &&
                    !ReservationDataUtils.isDataExpired(data.timestamp)) {
                    results.push(data);
                }
                else {
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
    static getAllReservationData() {
        return this.getItem(CACHE_KEYS.RESERVATION_DATA) || {};
    }
    /**
     * 特定の予約データを削除
     */
    static removeReservationData(pavilionCode, timeSlot) {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, timeSlot);
        delete allData[key];
        this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        console.log(`🗑️ 予約データ削除: ${key}`);
    }
    /**
     * 特定パビリオンの全予約データを削除
     */
    static removeReservationDataByPavilion(pavilionCode) {
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
            console.log(`🗑️ パビリオン予約データ削除: ${pavilionCode} (${deletedCount}件)`);
        }
    }
    /**
     * 全ての予約データをクリア
     */
    static clearAllReservationData() {
        this.removeItem(CACHE_KEYS.RESERVATION_DATA);
        console.log('🧹 全予約データクリア');
    }
    /**
     * 予約データの状態を更新
     */
    static updateReservationStatus(pavilionCode, timeSlot, status) {
        const data = this.getReservationData(pavilionCode, timeSlot);
        if (!data)
            return false;
        data.status = status;
        data.timestamp = Date.now(); // タイムスタンプ更新
        return this.saveReservationData(pavilionCode, data);
    }
    // ============ 自動操作状態管理 ============
    /**
     * 自動操作状態を保存
     */
    static saveAutomationState(state) {
        const success = this.setItem(CACHE_KEYS.AUTOMATION_STATE, state);
        if (success) {
            console.log(`🤖 自動操作状態保存: ${state.currentStep}`);
        }
        return success;
    }
    /**
     * 自動操作状態を取得
     */
    static getAutomationState() {
        return this.getItem(CACHE_KEYS.AUTOMATION_STATE);
    }
    /**
     * 自動操作状態をクリア
     */
    static clearAutomationState() {
        this.removeItem(CACHE_KEYS.AUTOMATION_STATE);
        console.log('🧹 自動操作状態クリア');
    }
    // ============ ユーザー設定管理 ============
    /**
     * ユーザー設定を保存
     */
    static saveUserPreferences(preferences) {
        return this.setItem(CACHE_KEYS.USER_PREFERENCES, preferences);
    }
    /**
     * ユーザー設定を取得
     */
    static getUserPreferences() {
        const saved = this.getItem(CACHE_KEYS.USER_PREFERENCES);
        return { ...DEFAULT_USER_PREFERENCES, ...saved };
    }
    // ============ ユーティリティ ============
    /**
     * キャッシュサイズを取得（概算）
     */
    static getCacheSize() {
        try {
            let total = 0;
            for (const key of Object.values(CACHE_KEYS)) {
                const item = sessionStorage.getItem(key);
                if (item) {
                    total += item.length;
                }
            }
            return total;
        }
        catch {
            return 0;
        }
    }
    /**
     * 期限切れデータを一括削除
     */
    static cleanupExpiredData() {
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
            console.log(`🧹 期限切れデータ削除: ${cleanedCount}件`);
        }
    }
    /**
     * デバッグ用: 全キャッシュ内容を表示
     */
    static debugLogAllCache() {
        console.group('📋 パビリオン予約キャッシュ内容');
        console.log('予約データ:', this.getAllReservationData());
        console.log('自動操作状態:', this.getAutomationState());
        console.log('ユーザー設定:', this.getUserPreferences());
        console.log('キャッシュサイズ:', `${this.getCacheSize()} bytes`);
        console.groupEnd();
    }
    /**
     * 時間選択UIとの連携用: 選択データをキャッシュに保存
     */
    static saveSelectedTimeFromUI(pavilionCode, pavilionName, timeSlot, isAvailable) {
        const reservationData = ReservationDataUtils.createReservationData(pavilionCode, pavilionName, timeSlot, isAvailable);
        return this.saveReservationData(pavilionCode, reservationData);
    }
    /**
     * 選択された予約データ一覧を取得（処理待ち状態のもの）
     */
    static getPendingReservations() {
        const allData = this.getAllReservationData();
        return Object.values(allData).filter(data => data.status === 'pending');
    }
    /**
     * 現在処理中の予約データを取得
     */
    static getProcessingReservation() {
        const allData = this.getAllReservationData();
        return Object.values(allData).find(data => data.status === 'processing') || null;
    }
}


/***/ })

}]);