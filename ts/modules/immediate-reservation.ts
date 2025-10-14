/**
 * 即時予約機能
 * 空き時間帯での即座予約実行
 */

import { PavilionReservationCache } from './pavilion-reservation-cache';
import { loggers } from '../utils/logger';
const logger = loggers.automation;

// 即時予約データ
export interface ImmediateReservationData {
    pavilionCode: string;
    pavilionName: string;
    timeSlot: string;
    timeDisplay: string;
    type: 'immediate';
    status: 'pending' | 'executing' | 'completed' | 'failed';
    timestamp: number;
}

export class ImmediateReservationService {
    
    /**
     * 即時予約を実行
     */
    static async executeReservation(
        pavilionCode: string, 
        pavilionName: string, 
        timeSlot: string, 
        timeDisplay: string
    ): Promise<boolean> {
        
        logger.info('即時予約実行開始', { pavilionName, timeDisplay });
        
        try {
            // 1. 通常の予約キャッシュ形式に変換して保存
            const cacheData = {
                pavilionCode,
                pavilionName,
                selectedTimeSlot: timeSlot,
                selectedTimeDisplay: timeDisplay,
                isAvailable: true,
                timestamp: Date.now(),
                status: 'pending' as const
            };
            
            PavilionReservationCache.saveReservationData(pavilionCode, cacheData);
            
            // ページ復帰システムは無効化
            
            // 3. 予約ページに遷移
            // expoTable.jsを参照した正しいURL実装
            const ticketIds = new URLSearchParams(window.location.search).get('id') || '';
            const formatDateToYMD = () => {
                const date = new Date();
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}${m}${d}`;
            };
            
            const reservationUrl = `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${pavilionCode}&screen_id=108&lottery=5&entrance_date=${formatDateToYMD()}`;
            window.location.href = reservationUrl;
            
            logger.info('予約ページに遷移', { reservationUrl });
            logger.info('自動操作が開始されます');
            
            return true;
            
        } catch (error) {
            logger.error('即時予約実行エラー', error);
            return false;
        }
    }
    
    /**
     * 即時予約可能性をチェック
     */
    static canExecuteImmediate(isAvailable: boolean): boolean {
        return isAvailable === true;
    }
    
    /**
     * 即時予約の説明メッセージ
     */
    static getExecutionMessage(pavilionName: string, timeDisplay: string): string {
        return `${pavilionName} ${timeDisplay} の予約ページを開き、自動で時間選択・申込を実行します。`;
    }
}

/**
 * 即時予約実行（ショートカット関数）
 */
export async function executeImmediateReservation(
    pavilionCode: string,
    pavilionName: string, 
    timeSlot: string,
    timeDisplay: string
): Promise<boolean> {
    
    return await ImmediateReservationService.executeReservation(
        pavilionCode,
        pavilionName,
        timeSlot,
        timeDisplay
    );
}

/**
 * 即時予約可能判定（ショートカット関数）
 */
export function canExecuteImmediateReservation(isAvailable: boolean): boolean {
    return ImmediateReservationService.canExecuteImmediate(isAvailable);
}

// デバッグ用グローバル公開
if (typeof window !== 'undefined') {
    (window as any).executeImmediateReservation = executeImmediateReservation;
    (window as any).debugImmediateReservation = (pavilionCode: string, timeSlot: string) => {
        logger.debug('即時予約デバッグ実行');
        return executeImmediateReservation(
            pavilionCode,
            `テストパビリオン${pavilionCode}`,
            timeSlot,
            timeSlot
        );
    };
}