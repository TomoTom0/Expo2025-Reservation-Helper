/**
 * FAB (Floating Action Button) 管理クラス
 */

import type { ComponentState, MonitoringState, EntranceReservationState } from '@/types';

export interface FABCallbacks {
  onMainButtonClick: () => void;
}

export class FABButton {
  private fabContainer?: HTMLDivElement;
  private fabButton?: HTMLButtonElement;
  private fabIcon?: HTMLSpanElement;
  private statusDisplay?: HTMLDivElement;
  private monitoringTargetsDisplay?: HTMLDivElement;
  private callbacks: FABCallbacks;

  constructor(callbacks: FABCallbacks) {
    this.callbacks = callbacks;
  }

  /**
   * FABボタンを作成
   */
  createFAB(): void {
    // 既存のFABがあれば削除
    this.removeFAB();

    // FABコンテナを作成（右下固定）
    this.fabContainer = document.createElement('div');
    this.fabContainer.id = 'ytomo-fab-container';
    this.fabContainer.style.cssText = `
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 10000 !important;
      display: flex !important;
      flex-direction: column !important;
      gap: 12px !important;
      align-items: flex-end !important;
      pointer-events: auto !important;
    `;

    // メインFABボタンを作成
    this.fabButton = document.createElement('button');
    this.fabButton.id = 'ytomo-main-fab';
    this.fabButton.classList.add('ext-ytomo');
    this.fabButton.style.cssText = `
      width: 56px !important;
      height: 56px !important;
      border-radius: 50% !important;
      background: rgb(0, 104, 33) !important;
      color: white !important;
      border: none !important;
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2) !important;
      border: 3px solid rgba(255, 255, 255, 0.2) !important;
      cursor: pointer !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
      font-size: 14px !important;
      font-weight: bold !important;
      transition: all 0.3s ease !important;
      position: relative !important;
      overflow: hidden !important;
      pointer-events: auto !important;
      opacity: 0.9 !important;
    `;

    // FABボタンのテキスト/アイコン
    this.fabIcon = document.createElement('span');
    this.fabIcon.classList.add('ext-ytomo');
    this.fabIcon.style.cssText = `
      font-size: 12px !important;
      text-align: center !important;
      line-height: 1.2 !important;
      white-space: nowrap !important;
      pointer-events: none !important;
    `;
    this.fabIcon.innerText = '待機中';
    this.fabButton.appendChild(this.fabIcon);

    // 初期状態で無効化
    this.fabButton.disabled = true;
    this.fabButton.style.opacity = '0.6';
    this.fabButton.style.cursor = 'not-allowed';

    // ホバー効果
    this.fabButton.addEventListener('mouseenter', () => {
      if (!this.fabButton?.disabled) {
        this.fabButton.style.transform = 'scale(1.15)';
        this.fabButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)';
      }
    });

    this.fabButton.addEventListener('mouseleave', () => {
      this.fabButton!.style.transform = 'scale(1)';
      this.fabButton!.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)';
    });

    // クリックイベント
    this.fabButton.addEventListener('click', () => {
      if (!this.fabButton?.disabled) {
        this.callbacks.onMainButtonClick();
      }
    });

    // ステータス表示を作成
    this.statusDisplay = document.createElement('div');
    this.statusDisplay.id = 'ytomo-status-display';
    this.statusDisplay.style.cssText = `
      background: rgba(0, 0, 0, 0.8) !important;
      color: white !important;
      padding: 8px 12px !important;
      border-radius: 20px !important;
      font-size: 12px !important;
      white-space: nowrap !important;
      max-width: 200px !important;
      text-align: center !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      backdrop-filter: blur(10px) !important;
    `;
    this.statusDisplay.innerText = '待機中';

    // 監視対象表示を作成
    this.monitoringTargetsDisplay = document.createElement('div');
    this.monitoringTargetsDisplay.id = 'ytomo-monitoring-targets';
    this.monitoringTargetsDisplay.style.cssText = `
      background: rgba(255, 140, 0, 0.9) !important;
      color: white !important;
      padding: 6px 10px !important;
      border-radius: 15px !important;
      font-size: 11px !important;
      font-weight: bold !important;
      white-space: nowrap !important;
      max-width: 180px !important;
      text-align: center !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      display: none !important;
    `;

    // FABコンテナに要素を追加（上から順：監視対象→ステータス→ボタン）
    this.fabContainer.appendChild(this.monitoringTargetsDisplay);
    this.fabContainer.appendChild(this.statusDisplay);
    this.fabContainer.appendChild(this.fabButton);

    // ドキュメントに追加
    document.body.appendChild(this.fabContainer);

    console.log('✅ FAB形式の予約UIを作成しました');
  }

  /**
   * FABボタンの状態を更新
   */
  updateFABState(
    currentMode: ComponentState,
    monitoringState?: MonitoringState,
    reservationState?: EntranceReservationState
  ): void {
    if (!this.fabButton || !this.fabIcon || !this.statusDisplay) return;

    let buttonText = '待機中';
    let statusText = '待機中';
    let buttonColor = 'rgb(0, 104, 33)';
    let isEnabled = false;

    switch (currentMode) {
      case 'idle':
        buttonText = '予約開始';
        statusText = '予約可能';
        buttonColor = 'rgb(0, 104, 33)';
        isEnabled = true;
        break;

      case 'loading':
        buttonText = '処理中';
        statusText = '処理中...';
        buttonColor = 'rgb(70, 130, 180)';
        isEnabled = false;
        break;

      case 'processing':
        if (reservationState?.isRunning) {
          buttonText = '予約中';
          const attempts = reservationState.attempts;
          const elapsedMinutes = reservationState.startTime ? 
            Math.floor((Date.now() - reservationState.startTime) / 60000) : 0;
          statusText = `予約処理中 (${attempts}回, ${elapsedMinutes}分)`;
          buttonColor = 'rgb(34, 139, 34)';
          isEnabled = true; // 停止可能
        }
        break;

      case 'monitoring':
        if (monitoringState?.isMonitoring) {
          buttonText = '監視中';
          const attempts = monitoringState.attempts;
          const elapsedMinutes = monitoringState.startTime ? 
            Math.floor((Date.now() - monitoringState.startTime) / 60000) : 0;
          statusText = `時間帯監視中 (${attempts}回, ${elapsedMinutes}分)`;
          buttonColor = 'rgb(255, 69, 0)';
          isEnabled = false; // 個別停止のみ
        }
        break;

      case 'error':
        buttonText = 'エラー';
        statusText = 'エラー発生';
        buttonColor = 'rgb(220, 20, 60)';
        isEnabled = true;
        break;
    }

    // ボタン状態更新
    this.fabIcon.innerText = buttonText;
    this.fabButton.style.background = `${buttonColor} !important`;
    this.fabButton.disabled = !isEnabled;
    
    if (isEnabled) {
      this.fabButton.style.opacity = '0.9';
      this.fabButton.style.cursor = 'pointer';
    } else {
      this.fabButton.style.opacity = '0.6';
      this.fabButton.style.cursor = 'not-allowed';
    }

    // ステータス表示更新
    this.statusDisplay.innerText = statusText;
  }

  /**
   * 監視対象表示を更新
   */
  updateMonitoringTargets(targets: string[]): void {
    if (!this.monitoringTargetsDisplay) return;

    if (targets.length === 0) {
      this.monitoringTargetsDisplay.style.display = 'none';
    } else {
      this.monitoringTargetsDisplay.style.display = 'block';
      const targetsText = targets.length === 1 
        ? `監視中: ${targets[0]}`
        : `監視中: ${targets.length}件`;
      this.monitoringTargetsDisplay.innerText = targetsText;
    }
  }

  /**
   * FABボタンを削除
   */
  removeFAB(): void {
    const existingFab = document.getElementById('ytomo-fab-container');
    if (existingFab) {
      existingFab.remove();
    }
    
    this.fabContainer = undefined;
    this.fabButton = undefined;
    this.fabIcon = undefined;
    this.statusDisplay = undefined;
    this.monitoringTargetsDisplay = undefined;
  }

  /**
   * FABボタンが作成済みかチェック
   */
  isCreated(): boolean {
    return !!(this.fabContainer && this.fabButton);
  }
}