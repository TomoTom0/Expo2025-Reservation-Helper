/**
 * 入場予約UI更新ヘルパー関数
 * 循環参照を避けるために独立したモジュールとして分離
 */

import { entranceReservationStateManager, ExecutionState } from './entrance-reservation-state-manager';

// メインFABボタンの表示を更新
export function updateMainButtonDisplay(): void {
    const fabContainer = document.getElementById('ytomo-fab-container');
    if (!fabContainer) return;
    
    const mainButton = fabContainer.querySelector('.ytomo-fab') as HTMLButtonElement;
    if (!mainButton) return;
    
    // 状態管理システムから現在の状態を取得
    const executionState = entranceReservationStateManager.getExecutionState();
    const preferredAction = entranceReservationStateManager.getPreferredAction();
    
    const span = mainButton.querySelector('.ytomo-fab-inner-content') as HTMLElement;
    if (!span) return;
    
    // 実行状態に応じてボタン表示を更新
    switch (executionState) {
        case ExecutionState.MONITORING_RUNNING:
            // カウントダウン表示中は状態管理システムに任せる（上書き防止）
            if (!entranceReservationStateManager.isReloadCountdownActive()) {
                span.innerText = '監視実行中';
            }
            mainButton.className = mainButton.className.replace(/ytomo-fab-\w+/g, '');
            mainButton.classList.add('ytomo-fab-monitoring');
            mainButton.title = '監視中断';
            mainButton.disabled = false;
            break;
            
        case ExecutionState.RESERVATION_RUNNING:
            span.innerText = '予約実行中';
            mainButton.className = mainButton.className.replace(/ytomo-fab-\w+/g, '');
            mainButton.classList.add('ytomo-fab-running');
            mainButton.title = '予約実行中';
            mainButton.disabled = true;
            break;
            
        case ExecutionState.IDLE:
        default:
            if (preferredAction === 'monitoring') {
                span.innerText = '監視\n開始';
                mainButton.className = mainButton.className.replace(/ytomo-fab-\w+/g, '');
                mainButton.classList.add('ytomo-fab-enabled');
                mainButton.title = '監視開始';
                mainButton.disabled = false;
            } else if (preferredAction === 'reservation') {
                span.innerText = '予約\n開始';
                mainButton.className = mainButton.className.replace(/ytomo-fab-\w+/g, '');
                mainButton.classList.add('ytomo-fab-enabled');
                mainButton.title = '予約開始';
                mainButton.disabled = false;
            } else {
                span.innerText = '待機中';
                mainButton.className = mainButton.className.replace(/ytomo-fab-\w+/g, '');
                mainButton.classList.add('ytomo-fab-idle');
                mainButton.title = '対象選択待ち';
                mainButton.disabled = true;
            }
            break;
    }
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
    console.log(`🎯 監視対象表示更新: ${targets.length}個の対象`);
    // TODO: 具体的な表示更新処理を実装
}