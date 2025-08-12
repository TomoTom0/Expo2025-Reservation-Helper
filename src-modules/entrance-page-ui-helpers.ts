/**
 * 入場予約UI更新ヘルパー関数
 * 循環参照を避けるために独立したモジュールとして分離
 */

import { entranceReservationStateManager } from './entrance-reservation-state-manager';

// メインFABボタンの表示を更新（統一システムに委譲）
export function updateMainButtonDisplay(): void {
    // カウントダウン中はログを削減
    if (!entranceReservationStateManager.isReloadCountdownActive()) {
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

// 監視対象表示を更新
export function updateMonitoringTargetsDisplay(): void {
    // 監視対象の表示更新ロジック
    const targets = entranceReservationStateManager.getMonitoringTargets();
    
    // カウントダウン中はログを削減（毎秒出力を避ける）
    if (!entranceReservationStateManager.isReloadCountdownActive()) {
        console.log(`🎯 監視対象表示更新: ${targets.length}個の対象`);
    }
    // TODO: 具体的な表示更新処理を実装
}