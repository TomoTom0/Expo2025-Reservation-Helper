/**
 * 監視スケジューラー
 * 変更容易な監視タイミング制御
 */

import { loggers } from '../utils/logger';
const logger = loggers.monitoring;

// スケジュール設定の型定義
export interface ScheduleConfig {
    intervalType: 'fixed-seconds' | 'cron-like' | 'custom';
    fixedSeconds?: number[];        // [0, 15, 30, 45] など
    cronExpression?: string;        // "0,15,30,45 * * * * *"
    customFunction?: () => number;  // 次実行までのms返却
}

// スケジュール実行コールバック
export type ScheduleCallback = () => void | Promise<void>;

// デフォルト設定（毎分00,15,30,45秒）
const DEFAULT_CONFIG: ScheduleConfig = {
    intervalType: 'fixed-seconds',
    fixedSeconds: [0, 15, 30, 45]
};

export class MonitoringScheduler {
    private config: ScheduleConfig;
    private callback: ScheduleCallback | null = null;
    private timeoutId: NodeJS.Timeout | null = null;
    private isRunning: boolean = false;

    constructor(config: ScheduleConfig = DEFAULT_CONFIG) {
        this.config = { ...config };
    }

    /**
     * スケジューラーを開始
     */
    start(callback: ScheduleCallback): void {
        if (this.isRunning) {
            this.stop();
        }

        this.callback = callback;
        this.isRunning = true;
        this.scheduleNext();
        
        logger.info('監視スケジューラー開始', { config: this.getConfigDescription() });
    }

    /**
     * スケジューラーを停止
     */
    stop(): void {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        
        this.isRunning = false;
        this.callback = null;
        
        logger.info('監視スケジューラー停止');
    }

    /**
     * スケジュール設定を更新
     */
    updateConfig(newConfig: Partial<ScheduleConfig>): void {
        const wasRunning = this.isRunning;
        const oldCallback = this.callback;

        if (wasRunning) {
            this.stop();
        }

        this.config = { ...this.config, ...newConfig };
        
        logger.info('スケジューラー設定更新', { config: this.getConfigDescription() });

        if (wasRunning && oldCallback) {
            this.start(oldCallback);
        }
    }

    /**
     * 次回実行時刻を取得
     */
    getNextExecutionTime(): Date {
        const delay = this.calculateNextDelay();
        return new Date(Date.now() + delay);
    }

    /**
     * 現在の設定説明を取得
     */
    getConfigDescription(): string {
        switch (this.config.intervalType) {
            case 'fixed-seconds':
                return `毎分${this.config.fixedSeconds?.join(',')}秒`;
            case 'cron-like':
                return `Cron: ${this.config.cronExpression}`;
            case 'custom':
                return 'カスタム関数';
            default:
                return '不明な設定';
        }
    }

    /**
     * 実行中かどうか
     */
    isActive(): boolean {
        return this.isRunning;
    }

    /**
     * 手動実行トリガー
     */
    triggerManual(): void {
        if (this.callback) {
            logger.debug('手動実行トリガー');
            this.executeCallback();
        }
    }

    /**
     * 次回実行をスケジュール
     */
    private scheduleNext(): void {
        if (!this.isRunning) return;

        const delay = this.calculateNextDelay();
        
        this.timeoutId = setTimeout(() => {
            this.executeCallback();
            this.scheduleNext(); // 次回をスケジュール
        }, delay);

        const nextTime = new Date(Date.now() + delay);
        logger.debug('次回実行予定', { nextTime: nextTime.toLocaleTimeString() });
    }

    /**
     * 次回実行までの遅延時間を計算
     */
    private calculateNextDelay(): number {
        const now = new Date();

        switch (this.config.intervalType) {
            case 'fixed-seconds':
                return this.calculateFixedSecondsDelay(now);
            
            case 'cron-like':
                return this.calculateCronDelay(now);
            
            case 'custom':
                if (this.config.customFunction) {
                    return this.config.customFunction();
                }
                throw new Error('custom関数が設定されていません');
            
            default:
                throw new Error(`未対応のintervalType: ${this.config.intervalType}`);
        }
    }

    /**
     * 固定秒数での遅延計算
     */
    private calculateFixedSecondsDelay(now: Date): number {
        const currentSeconds = now.getSeconds();
        const targetSeconds = this.config.fixedSeconds || [0];
        
        // 現在時刻より後の最初のターゲット秒を見つける
        let nextTarget = targetSeconds.find(s => s > currentSeconds);
        
        if (nextTarget === undefined) {
            // 今分にターゲットがない場合は次の分の最初のターゲット
            nextTarget = targetSeconds[0] + 60;
        }
        
        return (nextTarget - currentSeconds) * 1000;
    }

    /**
     * Cron式での遅延計算（簡易実装）
     */
    private calculateCronDelay(now: Date): number {
        // 簡易実装: "秒,秒,秒 * * * * *" 形式のみ対応
        if (!this.config.cronExpression) {
            throw new Error('cronExpressionが設定されていません');
        }

        const parts = this.config.cronExpression.split(' ');
        if (parts.length !== 6) {
            throw new Error('Cron式の形式が不正です');
        }

        const secondsPart = parts[0];
        const targetSeconds = secondsPart.split(',').map(s => parseInt(s.trim()));
        
        // fixed-secondsと同じロジックを使用
        const currentSeconds = now.getSeconds();
        let nextTarget = targetSeconds.find(s => s > currentSeconds);
        
        if (nextTarget === undefined) {
            nextTarget = targetSeconds[0] + 60;
        }
        
        return (nextTarget - currentSeconds) * 1000;
    }

    /**
     * コールバック実行
     */
    private async executeCallback(): Promise<void> {
        if (!this.callback) return;

        try {
            logger.debug('監視チェック実行', { time: new Date().toLocaleTimeString() });
            await this.callback();
        } catch (error) {
            logger.error('監視チェックエラー', error);
        }
    }
}

// グローバルインスタンス
let schedulerInstance: MonitoringScheduler | null = null;

/**
 * スケジューラーのシングルトンインスタンスを取得
 */
export function getMonitoringScheduler(config?: ScheduleConfig): MonitoringScheduler {
    if (!schedulerInstance || config) {
        schedulerInstance = new MonitoringScheduler(config);
    }
    return schedulerInstance;
}

/**
 * スケジューラー設定を更新（デバッグ用）
 */
export function updateMonitoringSchedule(newConfig: Partial<ScheduleConfig>): void {
    const scheduler = getMonitoringScheduler();
    scheduler.updateConfig(newConfig);
}

/**
 * 手動実行トリガー（デバッグ用）
 */
export function triggerManualCheck(): void {
    const scheduler = getMonitoringScheduler();
    scheduler.triggerManual();
}

// グローバル公開（デバッグ用）
if (typeof window !== 'undefined') {
    (window as any).updateMonitoringSchedule = updateMonitoringSchedule;
    (window as any).triggerManualCheck = triggerManualCheck;
}