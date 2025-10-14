/**
 * グローバル通知システム
 * ダイアログの状態に関係なく通知を表示できる永続的なシステム
 */
import { loggers } from '../utils/logger';
const logger = loggers.ui;

export interface NotificationOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    reason?: string;  // 失敗理由（満席/無効/その他）
    autoHide?: boolean;
    duration?: number;
}

class GlobalNotificationSystem {
    private notificationContainer: HTMLElement | null = null;
    private activeNotifications: Map<string, HTMLElement> = new Map();
    private recentNotifications: Map<string, number> = new Map(); // 重複チェック用

    /**
     * 通知システムを初期化
     */
    initialize(): void {
        if (this.notificationContainer) {
            return; // 既に初期化済み
        }

        // 通知コンテナを作成
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'ytomo-global-notifications';
        this.notificationContainer.className = 'ytomo-global-notification-container';
        
        // ページに追加
        document.body.appendChild(this.notificationContainer);
        
        logger.info('グローバル通知システム初期化完了');
    }

    /**
     * 通知を表示
     */
    show(options: NotificationOptions): string {
        if (!this.notificationContainer) {
            this.initialize();
        }

        // パビリオン予約結果は重複チェックをスキップ（異なる時間帯の結果を個別に表示するため）
        if (!options.message.includes('の予約が完了') && !options.message.includes('の予約に失敗')) {
            // 重複チェック（パビリオン予約以外の同じメッセージが短時間で複数回表示されることを防ぐ）
            const messageKey = `${options.type}:${options.message}`;
            const now = Date.now();
            const lastShown = this.recentNotifications.get(messageKey);

            if (lastShown && (now - lastShown) < 1000) { // 1秒以内の重複を防ぐ
                logger.debug('重複通知をスキップ', { message: options.message });
                return '';
            }

            this.recentNotifications.set(messageKey, now);

            // 古いエントリーをクリーンアップ（10秒以上古いものを削除）
            for (const [key, timestamp] of this.recentNotifications.entries()) {
                if (now - timestamp > 10000) {
                    this.recentNotifications.delete(key);
                }
            }
        }

        const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        
        // 通知要素を作成
        const notification = this.createNotificationElement(options, notificationId);
        
        // コンテナに追加
        this.notificationContainer!.appendChild(notification);
        this.activeNotifications.set(notificationId, notification);
        
        // アニメーション
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        
        // 自動非表示
        if (options.autoHide !== false) {
            const duration = options.duration || 5000;
            setTimeout(() => {
                this.hide(notificationId);
            }, duration);
        }
        
        logger.info('通知表示', { type: options.type, message: options.message });
        
        return notificationId;
    }

    /**
     * 通知を非表示
     */
    hide(notificationId: string): void {
        const notification = this.activeNotifications.get(notificationId);
        if (!notification) {
            return;
        }

        notification.classList.add('hide');
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.activeNotifications.delete(notificationId);
        }, 300);
    }

    /**
     * すべての通知をクリア
     */
    clearAll(): void {
        for (const notificationId of this.activeNotifications.keys()) {
            this.hide(notificationId);
        }
    }

    /**
     * 通知要素を作成
     */
    private createNotificationElement(options: NotificationOptions, notificationId: string): HTMLElement {
        const notification = document.createElement('div');
        notification.className = `ytomo-global-notification ${options.type}`;
        notification.setAttribute('data-notification-id', notificationId);
        
        // アイコンを設定
        const icon = this.getIconForType(options.type);
        
        // メッセージ要素
        const messageElement = document.createElement('span');
        messageElement.className = 'notification-message';
        messageElement.textContent = options.message;

        // 理由要素（エラー時のみ）
        let reasonElement: HTMLElement | null = null;
        if (options.reason && options.type === 'error') {
            reasonElement = document.createElement('div');
            reasonElement.className = 'notification-reason';
            reasonElement.textContent = `理由: ${options.reason}`;
        }

        // 閉じるボタン
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            this.hide(notificationId);
        });

        // 内容を組み立て
        notification.appendChild(document.createTextNode(icon + ' '));
        notification.appendChild(messageElement);
        if (reasonElement) {
            notification.appendChild(reasonElement);
        }
        notification.appendChild(closeButton);
        
        return notification;
    }

    /**
     * 通知タイプに応じたアイコンを取得
     */
    private getIconForType(type: string): string {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    }
}

// グローバルインスタンス
const globalNotificationSystem = new GlobalNotificationSystem();

// エクスポート
export { globalNotificationSystem };

// グローバル関数として公開
(window as any).showGlobalNotification = (options: NotificationOptions) => {
    return globalNotificationSystem.show(options);
};

// 既存の関数名でも使用可能にする
(window as any).showReservationNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, autoHide: boolean = true) => {
    return globalNotificationSystem.show({ type, message, autoHide });
};

// パビリオン予約結果専用関数
(window as any).showPavilionReservationResult = (success: boolean, pavilionName: string, timeSlot: string, errorMessage?: string) => {
    logger.temp('パビリオン予約結果通知表示', { success, pavilionName, timeSlot, errorMessage });

    if (success) {
        return globalNotificationSystem.show({
            type: 'success',
            message: `${pavilionName} ${timeSlot} の予約が完了しました`,
            autoHide: true,
            duration: 5000
        });
    } else {
        // 失敗理由を判定
        let reason = 'その他';
        if (errorMessage) {
            if (errorMessage.includes('満席') || errorMessage.includes('定員') || errorMessage.includes('売り切れ')) {
                reason = '満席';
            } else if (errorMessage.includes('無効') || errorMessage.includes('期限') || errorMessage.includes('expired')) {
                reason = '無効';
            }
        }

        return globalNotificationSystem.show({
            type: 'error',
            message: `${pavilionName} ${timeSlot} の予約に失敗しました`,
            reason: reason,
            autoHide: false  // エラーは手動で閉じるまで表示
        });
    }
};

// ページ読み込み時に自動初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        globalNotificationSystem.initialize();
    });
} else {
    // 既にDOMが読み込まれている場合は即座に初期化
    globalNotificationSystem.initialize();
}

logger.info('グローバル通知システムモジュール読み込み完了');