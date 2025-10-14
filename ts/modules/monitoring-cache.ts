/**
 * 監視対象キャッシュ管理
 * 順序ベースの監視対象データ管理
 */
import { loggers } from '../utils/logger';
const logger = loggers.monitoring;

// 監視対象データ
export interface MonitoringTarget {
    pavilionCode: string;
    timeSlot: string;
    pavilionName: string;
    order: number;      // 選択順序（1,2,3...）
    addedAt: number;    // 追加時刻（順序決定用）
}

// 監視状態
export interface MonitoringState {
    targets: MonitoringTarget[];
    isActive: boolean;
    lastCheck: number;
    nextCheck: number;
    checkCount: number;
}

// キャッシュキー
const CACHE_KEYS = {
    MONITORING_TARGETS: 'pavilion_monitoring_targets',
    MONITORING_STATE: 'pavilion_monitoring_state'
} as const;

export class MonitoringCacheManager {
    
    /**
     * 監視対象を追加
     */
    static addTarget(pavilionCode: string, timeSlot: string, pavilionName: string): boolean {
        try {
            const targets = this.getTargets();
            
            // 既に存在するかチェック
            const exists = targets.some(t => 
                t.pavilionCode === pavilionCode && t.timeSlot === timeSlot
            );
            
            if (exists) {
                logger.warn('既に監視対象に追加済み', { pavilionCode, timeSlot });
                return false;
            }
            
            // 新しい順序番号を決定
            const maxOrder = targets.length > 0 ? Math.max(...targets.map(t => t.order)) : 0;
            
            const newTarget: MonitoringTarget = {
                pavilionCode,
                timeSlot,
                pavilionName,
                order: maxOrder + 1,
                addedAt: Date.now()
            };
            
            targets.push(newTarget);
            this.saveTargets(targets);
            
            logger.info('監視対象追加', newTarget);
            return true;
            
        } catch (error) {
            logger.error('監視対象追加エラー', { error });
            return false;
        }
    }
    
    /**
     * 監視対象を削除
     */
    static removeTarget(pavilionCode: string, timeSlot: string): boolean {
        try {
            const targets = this.getTargets();
            const initialLength = targets.length;
            
            const filteredTargets = targets.filter(t => 
                !(t.pavilionCode === pavilionCode && t.timeSlot === timeSlot)
            );
            
            if (filteredTargets.length === initialLength) {
                logger.warn('削除対象が見つかりません', { pavilionCode, timeSlot });
                return false;
            }
            
            // 順序を再調整
            const reorderedTargets = filteredTargets
                .sort((a, b) => a.order - b.order)
                .map((target, index) => ({
                    ...target,
                    order: index + 1
                }));
            
            this.saveTargets(reorderedTargets);
            
            logger.info('監視対象削除', { pavilionCode, timeSlot });
            return true;
            
        } catch (error) {
            logger.error('監視対象削除エラー', { error });
            return false;
        }
    }
    
    /**
     * 監視対象を切り替え（追加/削除）
     */
    static toggleTarget(pavilionCode: string, timeSlot: string, pavilionName: string): boolean {
        const exists = this.hasTarget(pavilionCode, timeSlot);
        
        if (exists) {
            return this.removeTarget(pavilionCode, timeSlot);
        } else {
            return this.addTarget(pavilionCode, timeSlot, pavilionName);
        }
    }
    
    /**
     * 監視対象が存在するかチェック
     */
    static hasTarget(pavilionCode: string, timeSlot: string): boolean {
        const targets = this.getTargets();
        return targets.some(t => 
            t.pavilionCode === pavilionCode && t.timeSlot === timeSlot
        );
    }
    
    /**
     * 全監視対象を取得（順序順）
     */
    static getTargets(): MonitoringTarget[] {
        try {
            const data = sessionStorage.getItem(CACHE_KEYS.MONITORING_TARGETS);
            if (!data) return [];
            
            const targets = JSON.parse(data) as MonitoringTarget[];
            return targets.sort((a, b) => a.order - b.order);
            
        } catch (error) {
            logger.error('監視対象取得エラー', { error });
            return [];
        }
    }
    
    /**
     * 優先順位最上位の監視対象を取得
     */
    static getTopPriorityTarget(): MonitoringTarget | null {
        const targets = this.getTargets();
        return targets.length > 0 ? targets[0] : null;
    }
    
    /**
     * 特定パビリオンの監視対象を取得
     */
    static getTargetsByPavilion(pavilionCode: string): MonitoringTarget[] {
        const targets = this.getTargets();
        return targets.filter(t => t.pavilionCode === pavilionCode);
    }
    
    /**
     * 監視対象をクリア
     */
    static clearTargets(): void {
        sessionStorage.removeItem(CACHE_KEYS.MONITORING_TARGETS);
        logger.info('全監視対象クリア');
    }
    
    /**
     * 監視状態を取得
     */
    static getMonitoringState(): MonitoringState {
        try {
            const data = sessionStorage.getItem(CACHE_KEYS.MONITORING_STATE);
            if (!data) {
                return {
                    targets: [],
                    isActive: false,
                    lastCheck: 0,
                    nextCheck: 0,
                    checkCount: 0
                };
            }
            
            return JSON.parse(data) as MonitoringState;
            
        } catch (error) {
            logger.error('監視状態取得エラー', { error });
            return {
                targets: [],
                isActive: false,
                lastCheck: 0,
                nextCheck: 0,
                checkCount: 0
            };
        }
    }
    
    /**
     * 監視状態を更新
     */
    static updateMonitoringState(updates: Partial<MonitoringState>): void {
        try {
            const currentState = this.getMonitoringState();
            const newState = { ...currentState, ...updates };
            
            sessionStorage.setItem(CACHE_KEYS.MONITORING_STATE, JSON.stringify(newState));
            
        } catch (error) {
            logger.error('監視状態更新エラー', { error });
        }
    }
    
    /**
     * 監視統計を取得
     */
    static getMonitoringStats(): {
        totalTargets: number;
        activeMonitoring: boolean;
        lastCheckTime: string;
        checkCount: number;
    } {
        const targets = this.getTargets();
        const state = this.getMonitoringState();
        
        return {
            totalTargets: targets.length,
            activeMonitoring: state.isActive,
            lastCheckTime: state.lastCheck > 0 ? 
                new Date(state.lastCheck).toLocaleTimeString() : '未実行',
            checkCount: state.checkCount
        };
    }
    
    /**
     * 監視対象を保存（内部用）
     */
    private static saveTargets(targets: MonitoringTarget[]): void {
        sessionStorage.setItem(CACHE_KEYS.MONITORING_TARGETS, JSON.stringify(targets));
    }
    
    /**
     * デバッグ情報を出力
     */
    static debugInfo(): void {
        const targets = this.getTargets();
        const state = this.getMonitoringState();
        const stats = this.getMonitoringStats();
        
        logger.debug('監視キャッシュ デバッグ情報', {
            targets,
            state,
            stats
        });
    }
}

// デバッグ用グローバル公開
if (typeof window !== 'undefined') {
    (window as any).debugMonitoringCache = () => MonitoringCacheManager.debugInfo();
    (window as any).clearMonitoringTargets = () => MonitoringCacheManager.clearTargets();
}