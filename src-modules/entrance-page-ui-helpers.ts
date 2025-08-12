/**
 * 入場予約UI更新ヘルパー関数
 * 循環参照を避けるために独立したモジュールとして分離
 */

import { entranceReservationStateManager } from './entrance-reservation-state-manager';

// メインFABボタンの表示を更新（統一システムに委譲）
export function updateMainButtonDisplay(): void {
    // カウントダウン中はログを削減
    if (!false) {
        // ログ削減: 頻繁に呼ばれるため削除
    }
    entranceReservationStateManager.updateFabDisplay();
}

// 監視ボタンを無効化
export function disableAllMonitorButtons(): void {
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    monitorButtons.forEach((button: Element) => {
        const htmlButton = button as HTMLButtonElement;
        htmlButton.disabled = true;
        htmlButton.classList.add('js-disabled');
        htmlButton.classList.remove('js-enabled');
    });
}

// 監視ボタンを有効化
export function enableAllMonitorButtons(): void {
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    monitorButtons.forEach((button: Element) => {
        const htmlButton = button as HTMLButtonElement;
        htmlButton.disabled = false;
        htmlButton.classList.add('js-enabled');
        htmlButton.classList.remove('js-disabled');
    });
}

