/**
 * 自動予約開始の共通処理
 * 空き時間帯ボタン押下と監視状態からの自動予約開始を統一
 */

import { PavilionReservationCache } from './pavilion-reservation-cache';

/**
 * 自動予約を開始する共通関数
 * @param pavilionCode パビリオンコード
 * @param pavilionName パビリオン名
 * @param timeSlot 時間スロット（例: "1000"）
 * @param timeDisplay 表示用時間（例: "10:00"）
 * @returns 成功時true、失敗時false
 */
export async function startAutomationReservation(
    pavilionCode: string,
    pavilionName: string,
    timeSlot: string,
    timeDisplay: string
): Promise<boolean> {
    console.log('🚀 自動予約開始:', pavilionName, timeDisplay);
    
    try {
        // 遷移先URLを構築
        const ticketIds = new URLSearchParams(window.location.search).get('id') || '';
        
        // 現在のパビリオン検索画面からentrance_dateを取得
        const entranceDate = new URLSearchParams(window.location.search).get('entrance_date') || (() => {
            const date = new Date();
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}${m}${d}`;
        })();
        
        // 動作確認のため一時的に三日前予約に変更
        const reservationUrl = `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${pavilionCode}&screen_id=108&lottery=4&entrance_date=${entranceDate}`;

        // 予約データを保存
        const cacheData = {
            pavilionCode,
            pavilionName,
            selectedTimeSlot: timeSlot,
            selectedTimeDisplay: timeDisplay,
            isAvailable: true,
            timestamp: Date.now(),
            status: 'pending' as const,
            reservationUrl: reservationUrl
        };
        
        PavilionReservationCache.saveReservationData(pavilionCode, cacheData);
        
        // 予約ページに遷移
        window.location.href = reservationUrl;
        
        console.log('✅ 予約ページに遷移:', reservationUrl);
        console.log('🤖 自動操作が開始されます');
        
        return true;
        
    } catch (error) {
        console.error('❌ 自動予約開始エラー:', error);
        return false;
    }
}