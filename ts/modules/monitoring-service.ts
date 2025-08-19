/**
 * 監視サービス
 * API呼び出し・空き検知・自動予約実行
 */

import { getMonitoringScheduler, ScheduleConfig } from './monitoring-scheduler';
import { MonitoringCacheManager, MonitoringTarget } from './monitoring-cache';
import { PavilionReservationCache } from './pavilion-reservation-cache';

// API応答の型定義
interface PavilionAvailability {
    pavilionCode: string;
    pavilionName: string;
    timeSlots: {
        time: string;
        available: boolean;
        capacity: number;
        reserved: number;
    }[];
}

// 監視結果
interface MonitoringResult {
    success: boolean;
    checkedTargets: number;
    foundAvailable: MonitoringTarget | null;
    error?: string;
}

export class MonitoringService {
    private scheduler = getMonitoringScheduler();
    private isRunning: boolean = false;

    /**
     * 監視を開始
     */
    async startMonitoring(): Promise<boolean> {
        if (this.isRunning) {
            console.log('⚠️ 監視は既に実行中です');
            return false;
        }

        const targets = MonitoringCacheManager.getTargets();
        if (targets.length === 0) {
            console.log('⚠️ 監視対象がありません');
            return false;
        }

        this.isRunning = true;
        
        // 監視状態を更新
        MonitoringCacheManager.updateMonitoringState({
            isActive: true,
            targets,
            nextCheck: this.scheduler.getNextExecutionTime().getTime()
        });

        // スケジューラーを開始
        this.scheduler.start(async () => {
            await this.performMonitoringCheck();
        });

        console.log('🚀 パビリオン監視開始:', targets.length, '件');
        return true;
    }

    /**
     * 監視を停止
     */
    stopMonitoring(): void {
        if (!this.isRunning) {
            console.log('⚠️ 監視は実行されていません');
            return;
        }

        this.scheduler.stop();
        this.isRunning = false;

        // 監視状態を更新
        MonitoringCacheManager.updateMonitoringState({
            isActive: false,
            nextCheck: 0
        });

        console.log('⏹️ パビリオン監視停止');
    }

    /**
     * 監視チェックを実行
     */
    private async performMonitoringCheck(): Promise<MonitoringResult> {
        
        try {
            const targets = MonitoringCacheManager.getTargets();
            
            if (targets.length === 0) {
                console.log('📋 監視対象がないため監視を停止します');
                this.stopMonitoring();
                return {
                    success: false,
                    checkedTargets: 0,
                    foundAvailable: null,
                    error: '監視対象なし'
                };
            }

            console.log(`🔍 監視チェック開始 (${targets.length}件)`);

            // 各監視対象をチェック
            for (const target of targets) {
                const isAvailable = await this.checkTargetAvailability(target);
                
                if (isAvailable) {
                    console.log('🎯 空きを発見:', target);
                    
                    // 自動予約を実行
                    await this.executeReservation(target);
                    
                    // 監視対象から削除
                    MonitoringCacheManager.removeTarget(target.pavilionCode, target.timeSlot);
                    
                    // 監視状態を更新
                    const currentState = MonitoringCacheManager.getMonitoringState();
                    MonitoringCacheManager.updateMonitoringState({
                        lastCheck: Date.now(),
                        checkCount: currentState.checkCount + 1,
                        nextCheck: this.scheduler.getNextExecutionTime().getTime()
                    });

                    return {
                        success: true,
                        checkedTargets: targets.length,
                        foundAvailable: target
                    };
                }
            }

            // 空きなしの場合
            console.log('📋 空きなし、監視継続');
            
            // 監視状態を更新
            const currentState = MonitoringCacheManager.getMonitoringState();
            MonitoringCacheManager.updateMonitoringState({
                lastCheck: Date.now(),
                checkCount: currentState.checkCount + 1,
                nextCheck: this.scheduler.getNextExecutionTime().getTime()
            });

            return {
                success: true,
                checkedTargets: targets.length,
                foundAvailable: null
            };

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ 監視チェックエラー:', errorMessage);

            // エラー時も状態更新
            const currentState = MonitoringCacheManager.getMonitoringState();
            MonitoringCacheManager.updateMonitoringState({
                lastCheck: Date.now(),
                checkCount: currentState.checkCount + 1,
                nextCheck: this.scheduler.getNextExecutionTime().getTime()
            });

            return {
                success: false,
                checkedTargets: 0,
                foundAvailable: null,
                error: errorMessage
            };
        }
    }

    /**
     * 特定対象の空き状況をチェック
     */
    private async checkTargetAvailability(target: MonitoringTarget): Promise<boolean> {
        try {
            const availability = await this.fetchPavilionAvailability(target.pavilionCode);
            
            if (!availability) {
                console.warn('⚠️ API応答なし:', target.pavilionCode);
                return false;
            }

            // 該当時間帯の空き状況をチェック
            const targetSlot = availability.timeSlots.find(slot => 
                slot.time === target.timeSlot
            );

            if (!targetSlot) {
                console.warn('⚠️ 該当時間帯なし:', target.timeSlot);
                return false;
            }

            console.log(`📊 ${target.pavilionName} ${target.timeSlot}: ${targetSlot.available ? '空きあり' : '満員'}`);
            return targetSlot.available;

        } catch (error) {
            console.error('❌ 空き状況チェックエラー:', target.pavilionCode, error);
            return false;
        }
    }

    /**
     * パビリオン空き情報をAPI取得
     */
    private async fetchPavilionAvailability(pavilionCode: string): Promise<PavilionAvailability | null> {
        try {
            const url = `https://expo.ebii.net/data?pavilion=${pavilionCode}`;
            
            console.log('🌐 API呼び出し:', url);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`API応答エラー: ${response.status}`);
            }

            const data = await response.json();
            
            // API応答をPavilionAvailability形式に変換
            return this.transformApiResponse(data, pavilionCode);

        } catch (error) {
            console.error('❌ API呼び出しエラー:', error);
            return null;
        }
    }

    /**
     * API応答を内部形式に変換
     */
    private transformApiResponse(apiData: any, pavilionCode: string): PavilionAvailability {
        // TODO: 実際のAPI応答形式に合わせて実装
        // 現在は仮実装
        return {
            pavilionCode,
            pavilionName: apiData.pavilionName || `パビリオン${pavilionCode}`,
            timeSlots: apiData.timeSlots || []
        };
    }

    /**
     * 自動予約を実行
     */
    private async executeReservation(target: MonitoringTarget): Promise<void> {
        console.log('🤖 自動予約実行開始:', target);

        try {
            // 予約データを作成
            const reservationData = {
                pavilionCode: target.pavilionCode,
                pavilionName: target.pavilionName,
                selectedTimeSlot: target.timeSlot,
                selectedTimeDisplay: target.timeSlot,
                isAvailable: true,
                timestamp: Date.now(),
                status: 'pending' as const
            };

            // キャッシュに保存
            PavilionReservationCache.saveReservationData(target.pavilionCode, reservationData);

            // 元ページURLをsessionStorageに保存（リダイレクト異常復旧用）
            sessionStorage.setItem('expo_original_page_url', window.location.href);
            console.log(`💾 元ページURL保存（監視）: ${window.location.href}`);

            // 予約ページを開く
            // expoTable.jsを参照した正しいURL実装
            const ticketIds = new URLSearchParams(window.location.search).get('id') || '';
            const formatDateToYMD = () => {
                const date = new Date();
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}${m}${d}`;
            };
            
            const reservationUrl = `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${target.pavilionCode}&screen_id=108&lottery=5&entrance_date=${formatDateToYMD()}`;
            window.open(reservationUrl, '_blank');

            console.log('✅ 予約ページオープン:', reservationUrl);
            
            // 監視成功通知を送信
            this.sendNotificationToDialog('info', `監視成功: ${target.pavilionName} ${target.timeSlot} の空きを検知し予約開始`);

        } catch (error) {
            console.error('❌ 自動予約実行エラー:', error);
            throw error;
        }
    }

    /**
     * 監視状態を取得
     */
    getMonitoringStatus(): {
        isRunning: boolean;
        targetCount: number;
        stats: any;
        nextCheck: string;
    } {
        const stats = MonitoringCacheManager.getMonitoringStats();
        const nextCheck = this.scheduler.isActive() ? 
            this.scheduler.getNextExecutionTime().toLocaleTimeString() : '停止中';

        return {
            isRunning: this.isRunning,
            targetCount: stats.totalTargets,
            stats,
            nextCheck
        };
    }

    /**
     * スケジュール設定を更新
     */
    updateSchedule(config: Partial<ScheduleConfig>): void {
        this.scheduler.updateConfig(config);
    }

    /**
     * 手動チェック実行
     */
    async triggerManualCheck(): Promise<MonitoringResult> {
        console.log('🔄 手動チェック実行');
        return await this.performMonitoringCheck();
    }

    /**
     * ダイアログに通知を送信
     */
    private sendNotificationToDialog(type: 'success' | 'error' | 'warning' | 'info', message: string): void {
        try {
            // グローバル関数が利用可能な場合に通知を送信
            if (typeof (window as any).showReservationNotification === 'function') {
                (window as any).showReservationNotification(type, message);
                console.log(`📢 監視通知送信: [${type}] ${message}`);
            } else {
                console.log('⚠️ 通知関数が利用できません');
            }
        } catch (error) {
            console.log(`❌ 通知送信エラー: ${error}`);
        }
    }
}

// グローバルインスタンス
let monitoringServiceInstance: MonitoringService | null = null;

/**
 * 監視サービスのシングルトンインスタンスを取得
 */
export function getMonitoringService(): MonitoringService {
    if (!monitoringServiceInstance) {
        monitoringServiceInstance = new MonitoringService();
    }
    return monitoringServiceInstance;
}

/**
 * 監視開始（ショートカット関数）
 */
export async function startPavilionMonitoring(): Promise<boolean> {
    const service = getMonitoringService();
    return await service.startMonitoring();
}

/**
 * 監視停止（ショートカット関数）
 */
export function stopPavilionMonitoring(): void {
    const service = getMonitoringService();
    service.stopMonitoring();
}

/**
 * 監視状況確認（ショートカット関数）
 */
export function getMonitoringStatus(): any {
    const service = getMonitoringService();
    return service.getMonitoringStatus();
}

// デバッグ用グローバル公開
if (typeof window !== 'undefined') {
    (window as any).startPavilionMonitoring = startPavilionMonitoring;
    (window as any).stopPavilionMonitoring = stopPavilionMonitoring;
    (window as any).getMonitoringStatus = getMonitoringStatus;
    (window as any).debugMonitoringStatus = () => {
        console.group('🔍 監視サービス状況');
        console.log(getMonitoringStatus());
        MonitoringCacheManager.debugInfo();
        console.groupEnd();
    };
}