/**
 * グローバル通知システム
 * ダイアログの状態に関係なく通知を表示できる永続的なシステム
 */

export interface NotificationOptions {
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    autoHide?: boolean;
    duration?: number;
}

class GlobalNotificationSystem {
    private notificationContainer: HTMLElement | null = null;
    private activeNotifications: Map<string, HTMLElement> = new Map();

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
        
        console.log('✅ グローバル通知システム初期化完了');
    }

    /**
     * 通知を表示
     */
    show(options: NotificationOptions): string {
        if (!this.notificationContainer) {
            this.initialize();
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
        
        console.log(`📢 通知表示: [${options.type}] ${options.message}`);
        
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

// ページ読み込み時に自動初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        globalNotificationSystem.initialize();
    });
} else {
    // 既にDOMが読み込まれている場合は即座に初期化
    globalNotificationSystem.initialize();
}

console.log('✅ グローバル通知システムモジュール読み込み完了');