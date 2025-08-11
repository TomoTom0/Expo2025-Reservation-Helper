// pavilion-search-pageからのimport
import {
    getRandomWaitTime,
    waitForElement,
    waitForAnyElement,
    clickElement
} from './pavilion-search-page';

// entrance-page-stateからのimport
import { 
    entranceReservationState, 
    calendarWatchState,
    loadFABVisibility,
    updateFABVisibility
} from './entrance-page-state';

// entrance-page-dom-utilsからのimport
import {
    timeSlotSelectors,
    generateUniqueTdSelector,
    extractTdStatus
} from './entrance-page-dom-utils';

// entrance-page-monitorからのimport
import {
    checkTimeSlotTableExistsSync,
    analyzeAndAddMonitorButtons,
    startSlotMonitoring
} from './entrance-page-core';

// unified-stateからのimport
import { LocationHelper, ExecutionState, entranceReservationStateManager } from './entrance-reservation-state-manager';

// Section 6からのimport  
import {
    updateStatusBadge,
    isInterruptionAllowed
} from './entrance-page-core';

// UI更新ヘルパーからのimport
import { updateMainButtonDisplay } from './entrance-page-ui-helpers';
import {
    getCurrentSelectedCalendarDate,
    stopSlotMonitoring
} from './entrance-page-core';

// 型定義のインポート
import type { 
    ReservationConfig,
    CacheManager,
    ReservationResult
} from '../types/index.js';

// 【7. FAB・メインUI】
// ============================================================================

// 依存注入用のcacheManager参照
let cacheManager: CacheManager | null = null;

// cacheManagerを設定するヘルパー関数
export const setCacheManagerForSection7 = (cm: CacheManager): void => {
    cacheManager = cm;
};

// ステータス表示用のヘルパー関数
function showStatus(message: string, color: string = 'white'): void {
    const statusBadge = document.querySelector('#ytomo-status-badge') as HTMLElement;
    if (!statusBadge) return;
    
    statusBadge.innerText = message;
    statusBadge.style.background = color === 'green' ? 'rgba(0, 128, 0, 0.9)' :
                                  color === 'red' ? 'rgba(255, 0, 0, 0.9)' :
                                  color === 'orange' ? 'rgba(255, 140, 0, 0.9)' :
                                  color === 'blue' ? 'rgba(0, 104, 33, 0.9)' :
                                  'rgba(0, 0, 0, 0.8)';
    statusBadge.classList.remove('js-hide');
    
    // 一定時間後に自動で隠す（エラー、成功、中断メッセージ以外）
    if (color !== 'red' && color !== 'green' && color !== 'orange') {
        setTimeout(() => {
            statusBadge.classList.add('js-hide');
        }, 3000);
    }
}

function createEntranceReservationUI(): void {
    // 既存のFABがあれば削除
    const existingFab = document.getElementById('ytomo-fab-container');
    if (existingFab) {
        existingFab.remove();
    }

    // FABコンテナを作成（右下固定）
    const fabContainer = document.createElement('div');
    fabContainer.id = 'ytomo-fab-container';
    fabContainer.style.cssText = `
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
    const fabButton = document.createElement('button');
    fabButton.id = 'ytomo-main-fab';
    fabButton.classList.add('ext-ytomo', 'ytomo-fab', 'ytomo-fab-disabled');

    // FABボタンのステータス表示
    const fabIcon = document.createElement('span');
    fabIcon.classList.add('ext-ytomo', 'ytomo-fab-status');
    fabIcon.style.cssText = `
        font-size: 12px !important;
        text-align: center !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        pointer-events: none !important;
    `;
    fabIcon.innerText = '待機中';
    fabButton.appendChild(fabIcon);
    
    // FABボタンにrelative positionを設定（折りたたみボタン配置用）
    fabButton.style.position = 'relative';
    
    // 初期状態は ytomo-fab-disabled クラスで制御

    // ホバー効果（強化版）
    fabButton.addEventListener('mouseenter', () => {
        fabButton.style.transform = 'scale(1.15)';
        fabButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)';
        fabButton.style.borderWidth = '4px';
    });

    fabButton.addEventListener('mouseleave', () => {
        fabButton.style.transform = 'scale(1)';
        fabButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)';
        fabButton.style.borderWidth = '3px';
    });

    // 予約対象情報表示エリア（新規追加）
    const reservationTargetDisplay = document.createElement('div');
    reservationTargetDisplay.id = 'ytomo-reservation-target';
    reservationTargetDisplay.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.95), rgba(0, 86, 179, 0.95)) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 12px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        text-align: center !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        min-width: 80px !important;
        max-width: 120px !important;
        display: none !important;
        white-space: pre-line !important;
        overflow: visible !important;
        text-overflow: clip !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    `;
    reservationTargetDisplay.title = '予約対象（クリックで詳細表示）';
    
    // 監視対象表示エリア（目立つ表示）
    const monitoringTargetsDisplay = document.createElement('div');
    monitoringTargetsDisplay.id = 'ytomo-monitoring-targets';
    monitoringTargetsDisplay.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 104, 33, 0.95), rgba(0, 150, 50, 0.95)) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 12px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        text-align: center !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        min-width: 80px !important;
        max-width: 120px !important;
        display: none !important;
        white-space: pre-line !important;
        overflow: visible !important;
        text-overflow: clip !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    `;
    monitoringTargetsDisplay.title = 'クリックで詳細表示';
    
    // ホバー効果
    monitoringTargetsDisplay.addEventListener('mouseenter', () => {
        monitoringTargetsDisplay.style.transform = 'scale(1.05)';
        monitoringTargetsDisplay.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.4)';
    });
    
    monitoringTargetsDisplay.addEventListener('mouseleave', () => {
        monitoringTargetsDisplay.style.transform = 'scale(1)';
        monitoringTargetsDisplay.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
    });

    // ステータス表示（コンパクト）
    const statusBadge = document.createElement('div');
    statusBadge.id = 'ytomo-status-badge';
    statusBadge.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9)) !important;
        color: white !important;
        padding: 8px 16px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        white-space: pre-line !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2) !important;
        border: 2px solid rgba(255, 255, 255, 0.15) !important;
        display: none !important;
        pointer-events: none !important;
        text-align: center !important;
        line-height: 1.3 !important;
    `;
    statusBadge.innerText = '待機中';

    // メインFABボタンにイベントリスナーを設定
    fabButton.addEventListener('click', async (event) => {
        // disabled状態の場合はクリックを完全に無視
        if (fabButton.disabled || fabButton.hasAttribute('disabled')) {
            // ボタンdisabledのためクリック無視
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        
        // 追加のstyle確認（CSS disabled状態もチェック）
        if (fabButton.style.pointerEvents === 'none') {
            // pointer-events:noneのためクリック無視
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        
        // 中断不可期間のチェック
        if (!isInterruptionAllowed()) {
            // リロード直前のため中断不可
            showStatus('リロード直前のため中断できません', 'red');
            return;
        }
        
        // クールタイム中の予約再開中止処理
        if (fabButton.hasAttribute('data-cooldown-cancel')) {
            if (confirm('予約の自動再開を中止しますか？\n\n手動での予約開始は引き続き可能です。')) {
                entranceReservationStateManager.endReservationCooldown();
                showStatus('予約再開を中止しました', 'orange');
                updateMainButtonDisplay();
            }
            return;
        }
        
        // 実行中の場合は中断処理（入場予約状態管理システム使用）
        if (entranceReservationStateManager.isMonitoringRunning()) {
            stopMonitoringProcess();
            return;
        }
        
        if (entranceReservationStateManager.isReservationRunning()) {
            stopReservationProcess();
            return;
        }
        
        // 入場予約状態管理システムを使用した監視開始判定
        const preferredAction = entranceReservationStateManager.getPreferredAction();
        // FABクリック処理開始
        
        if (preferredAction === 'monitoring') {
            await startMonitoringProcess();
        } else if (preferredAction === 'reservation') {
            await startReservationProcess();
        } else {
            console.log('⚠️ 入場予約状態管理システム: 実行可能なアクションなし');
        }
        
        return;
    });

    // 監視中断処理
    function stopMonitoringProcess(): void {
        console.log('⏹️ 監視を中断');
        stopSlotMonitoring();
        showStatus('監視中断', 'orange');
        updateMainButtonDisplay();
    }

    // 予約中断処理
    function stopReservationProcess(): void {
        console.log('⏹️ 予約を中断');
        entranceReservationStateManager.setShouldStop(true);
        showStatus('予約処理を中断中...', 'orange');
        
        // 中断フラグ設定後、UIを即座に更新
        updateMainButtonDisplay();
    }

    // 監視開始処理
    async function startMonitoringProcess(): Promise<void> {
        console.log('📡 入場予約状態管理システムによる監視開始');
        
        // 状態変更前の確認
        console.log(`🔍 [FAB] 監視開始前の状態: ${entranceReservationStateManager.getExecutionState()}`);
        console.log(`🔍 [FAB] 監視対象数: ${entranceReservationStateManager.getMonitoringTargetCount()}`);
        console.log(`🔍 [FAB] 監視開始可能: ${entranceReservationStateManager.canStartMonitoring()}`);
        
        // 実行状態を監視中に変更
        const startSuccess = entranceReservationStateManager.startMonitoring();
        console.log(`🔍 [FAB] startMonitoring結果: ${startSuccess}`);
        console.log(`🔍 [FAB] 監視開始後の状態: ${entranceReservationStateManager.getExecutionState()}`);
        
        // 即座にUI更新してから監視開始
        updateMainButtonDisplay();
        await startSlotMonitoring();
    }

    // 予約開始処理
    async function startReservationProcess(): Promise<void> {
        console.log('🚀 入場予約状態管理システムによる予約開始');
        
        // 入場予約状態管理システムで予約実行開始
        entranceReservationStateManager.setExecutionState(ExecutionState.RESERVATION_RUNNING);
        entranceReservationStateManager.startReservationExecution();
        
        showStatus('予約処理実行中...', 'blue');
        updateMainButtonDisplay();
        updateMonitoringTargetsDisplay(); // 予約対象を表示
        
        // 設定オブジェクトを作成
        const config: ReservationConfig = {
            selectors: {
                submit: "#__next > div > div > main > div > div.style_main__add_cart_button__DCOw8 > button",
                change: "body > div > div > div > div > div > div > button",
                success: "#reservation_modal_title",
                failure: "#reservation_fail_modal_title",
                close: "body > div.style_buy-modal__1JZtS > div > div > div > div > ul > li > a"
            },
            selectorTexts: {
                change: "来場日時を変更する"
            },
            timeouts: {
                waitForSubmit: 5000,
                waitForResponse: 60000,
                waitForClose: 3000,
                retryInterval: 1000
            },
            randomSettings: {
                minCheckInterval: 500,
                checkRandomRange: 200,
                minClickDelay: 500,
                clickRandomRange: 200,
                minRetryDelay: 1000,
                retryRandomRange: 300
            }
        };
        
        // 予約開始前に予約対象情報を保存（成功時のUI更新用）
        const reservationTarget = entranceReservationStateManager.getReservationTarget();
        console.log('🔍 予約開始前の対象情報:', reservationTarget);
        
        try {
            const result = await entranceReservationHelper(config);
            console.log('🔍 entranceReservationHelper戻り値:', result);
            if (result.success) {
                showStatus(`🎉 予約成功！(${result.attempts}回試行)`, 'green');
                
                // 予約開始前に保存した対象情報で成功情報を設定
                if (reservationTarget) {
                    entranceReservationStateManager.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                    updateMainButtonDisplay(); // FAB表示更新
                    console.log('✅ 予約成功UI更新完了');
                } else {
                    console.warn('⚠️ 予約開始前の対象情報がnullのためUI更新をスキップ');
                }
                
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                    cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                }
            } else {
                if (result.cancelled) {
                    showStatus(`⏹️ 予約中断 (${result.attempts}回試行)`, 'orange');
                    console.log('⏹️ ユーザーにより予約が中断されました');
                } else if (result.abnormalTermination) {
                    showStatus(`🚨 異常終了 (${result.attempts}回試行) - システム停止`, 'red');
                    console.log('🚨 予約処理が異常終了しました。システムを停止します');
                } else if (result.cooldownStarted) {
                    showStatus(`予約失敗 (${result.attempts}回試行) - クールタイム開始`, 'orange');
                    console.log('🛑 100回試行後、クールタイムが開始されました');
                } else {
                    showStatus(`予約失敗 (${result.attempts}回試行)`, 'red');
                }
            }
        } catch (error) {
            console.error('予約処理エラー:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            showStatus(`エラー: ${errorMessage}`, 'red');
        } finally {
            // 入場予約状態管理システムで予約実行終了
            entranceReservationStateManager.stop();
            
            updateMainButtonDisplay();
            updateMonitoringTargetsDisplay(); // 予約終了時に表示更新
        }
    }
    
    // disabled状態でのクリックを確実に防ぐため、キャプチャーフェーズでも処理
    fabButton.addEventListener('click', (event) => {
        if (fabButton.disabled || fabButton.hasAttribute('disabled') || fabButton.style.pointerEvents === 'none') {
            console.log('🚫 キャプチャーフェーズでdisabledクリックを阻止');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        
        return; // 明示的なreturnを追加
    }, true); // useCapture = true


    // FABコンテナに要素を追加（上から順：予約対象→監視対象→ステータス→ボタン）
    // 効率モードトグルボタン
    const efficiencyToggleButton = document.createElement('button');
    efficiencyToggleButton.className = 'ytomo-efficiency-toggle';
    
    // 効率モード状態に応じた初期表示
    function updateEfficiencyToggleButton() {
        const isEnabled = entranceReservationStateManager.isEfficiencyModeEnabled();
        efficiencyToggleButton.innerText = isEnabled ? '効率ON' : '効率OFF';
        efficiencyToggleButton.classList.toggle('efficiency-enabled', isEnabled);
        efficiencyToggleButton.classList.toggle('efficiency-disabled', !isEnabled);
    }
    updateEfficiencyToggleButton();
    
    // 効率モードトグル処理
    efficiencyToggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        entranceReservationStateManager.toggleEfficiencyMode();
        updateEfficiencyToggleButton();
    });
    
    // ホバー効果はCSSで制御

    fabContainer.appendChild(reservationTargetDisplay);
    fabContainer.appendChild(monitoringTargetsDisplay);
    fabContainer.appendChild(statusBadge);
    fabContainer.appendChild(efficiencyToggleButton);
    fabContainer.appendChild(fabButton);

    // DOMに追加（body直下）
    document.body.appendChild(fabContainer);

    // 効率モード設定を読み込み
    entranceReservationStateManager.loadEfficiencyModeSettings();
    updateEfficiencyToggleButton(); // ボタン表示を更新

    // 自動選択イベントリスナーを設定
    window.addEventListener('entrance-auto-select', async (event: any) => {
        console.log('🎯 自動選択イベントを受信:', event.detail);
        const slot = event.detail?.slot;
        if (!slot?.targetInfo) {
            console.error('❌ 自動選択: スロット情報が無効');
            return;
        }
        
        try {
            // 監視を停止
            if (entranceReservationStateManager.isMonitoringRunning()) {
                console.log('🛑 監視を停止');
                stopSlotMonitoring();
            }
            
            // 該当監視対象を削除
            const timeSlot = slot.targetInfo.timeSlot;
            const locationIndex = slot.targetInfo.locationIndex;
            entranceReservationStateManager.removeMonitoringTarget(timeSlot, locationIndex);
            
            // 1. 時間帯要素をクリックして選択状態にする
            console.log(`🖱️ 自動選択: 時間帯をクリック ${timeSlot}`);
            const timeSlotElement = document.querySelector(slot.targetInfo.selector);
            if (timeSlotElement) {
                const buttonElement = timeSlotElement.querySelector('div[role="button"]') as HTMLElement;
                if (buttonElement && buttonElement.getAttribute('data-disabled') !== 'true') {
                    buttonElement.click();
                    console.log(`✅ 時間帯選択完了: ${timeSlot}`);
                    
                    // 2. 選択後、少し待ってから内部的に自動予約を開始
                    setTimeout(async () => {
                        console.log('🚀 内部的に自動予約を開始');
                        if (entranceReservationStateManager.canStartReservation()) {
                            await startReservationProcess();
                        } else {
                            console.error('❌ 予約開始条件が満たされていません');
                        }
                    }, 100);
                } else {
                    console.error(`❌ 時間帯ボタンが見つからないか無効: ${timeSlot}`);
                }
            } else {
                console.error(`❌ 時間帯要素が見つからない: ${slot.targetInfo.selector}`);
            }
            
        } catch (error) {
            console.error('❌ 自動選択処理エラー:', error);
        }
    });
    
    // FAB表示状態を初期化・適用
    loadFABVisibility();
    updateFABVisibility();
    
    // 初期状態を判定してFABを更新
    waitForTimeSlotTable(() => {
        checkInitialState();
    });
    
    // 時間帯クリックハンドラーを設定（選択解除機能付き）
    waitForTimeSlotTable(() => {
        setupTimeSlotClickHandlers();
    });
    
    // カレンダー変更監視は別途初期化処理で開始（キャッシュ復元後）
}

// 監視対象表示を更新（統一システムに完全委譲）
function updateMonitoringTargetsDisplay(): void {
    console.log('🔄 [updateMonitoringTargetsDisplay] 統一システムに委譲');
    entranceReservationStateManager.updateFabDisplay();
}

// 現在の予約対象時間帯を取得
function getCurrentReservationTarget(): string | null {
    // 選択された時間帯を探す
    const selectedSlot = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
    if (!selectedSlot) return null;
    
    const timeSpan = selectedSlot.querySelector('dt span');
    if (!timeSpan) return null;
    
    const timeText = timeSpan.textContent.trim();
    
    // 東西判定
    const tdElement = selectedSlot.closest('td[data-gray-out]') as HTMLTableCellElement;
    const tdSelector = generateUniqueTdSelector(tdElement);
    const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
    const location = LocationHelper.getLocationFromIndex(locationIndex);
    const locationText = location === 'east' ? '東' : '西';
    
    return `${locationText}${timeText}`;
}

// 来場日時設定ボタンの状態をチェック
function checkVisitTimeButtonState(): boolean {
    const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq') as HTMLButtonElement;
    
    if (!visitTimeButton) {
        console.log('⚠️ 来場日時設定ボタンが見つかりません');
        return false;
    }
    
    const isDisabled = visitTimeButton.hasAttribute('disabled') || visitTimeButton.disabled;
    console.log(`🔘 来場日時設定ボタン: ${isDisabled ? '無効' : '有効'}`);
    
    return !isDisabled;
}

// 時間帯が選択されているかチェック
function checkTimeSlotSelected(): boolean {
    // 選択された時間帯（aria-pressed="true"）をチェック
    const selectedTimeSlot = document.querySelector(timeSlotSelectors.selectedSlot);
    
    if (!selectedTimeSlot) {
        console.log('⚠️ 時間帯が選択されていません');
        return false;
    }
    
    // 選択された時間帯が満員でないかチェック
    const tdElement = selectedTimeSlot.closest('td');
    if (!tdElement) return false;
    const status = extractTdStatus(tdElement);
    if (status && status.isFull) {
        console.log('⚠️ 選択された時間帯は満員です');
        return false;
    }
    
    console.log(`✅ 時間帯選択済み: ${status?.timeText || 'unknown'}`);
    return true;
}

// 予約開始可能かどうかの総合判定
function canStartReservation(): boolean {
    const hasTimeSlotTable = checkTimeSlotTableExistsSync();
    const isTimeSlotSelected = checkTimeSlotSelected();
    const isVisitTimeButtonEnabled = checkVisitTimeButtonState();
    
    console.log(`📊 予約開始条件チェック:`);
    console.log(`  - 時間帯テーブル: ${hasTimeSlotTable ? '✅' : '❌'}`);
    console.log(`  - 時間帯選択: ${isTimeSlotSelected ? '✅' : '❌'}`);
    console.log(`  - 来場日時ボタン有効: ${isVisitTimeButtonEnabled ? '✅' : '❌'}`);
    
    return hasTimeSlotTable && isTimeSlotSelected && isVisitTimeButtonEnabled;
}

// 初期状態をチェックしてFABを適切に設定
function checkInitialState(): void {
    console.log('🔍 初期状態をチェック中...');
    
    // カレンダーで日付が選択されているかチェック
    const selectedDate = getCurrentSelectedCalendarDate();
    const hasTimeSlotTable = checkTimeSlotTableExistsSync();
    
    console.log(`📅 選択日付: ${selectedDate || 'なし'}`);
    console.log(`🗓️ 時間帯テーブル: ${hasTimeSlotTable ? 'あり' : 'なし'}`);
    
    if (selectedDate && hasTimeSlotTable) {
        // 時間帯テーブルがある場合、予約開始可能かチェック
        const canStart = canStartReservation();
        
        console.log(`✅ 日付選択済み、時間帯テーブル表示中 - ${canStart ? '予約開始可能' : '条件未満'}`);
        
        // FABボタンの状態を設定
        const fabButton = document.querySelector('#ytomo-main-fab') as HTMLButtonElement;
        const fabIcon = fabButton?.querySelector('.ytomo-fab-status') as HTMLSpanElement;
        
        if (fabButton && fabIcon) {
            // 常に「予約開始」と表示
            fabIcon.innerText = '予約\n開始';
            
            if (canStart) {
                // 予約開始可能
                fabButton.style.background = 'rgb(0, 104, 33) !important';
                fabButton.style.opacity = '0.9 !important';
                fabButton.style.cursor = 'pointer !important';
                fabButton.disabled = false;
                fabButton.title = '予約開始';
            } else {
                // 条件未満足 - disabled状態（グレー色）
                fabButton.style.background = 'rgb(128, 128, 128) !important';
                fabButton.style.opacity = '0.9 !important';
                fabButton.style.cursor = 'not-allowed !important';
                fabButton.disabled = true;
                fabButton.title = '時間帯を選択し、来場日時設定ボタンが有効になるまでお待ちください';
            }
        }
        
        // ステータスも更新
        updateStatusBadge(canStart ? 'idle' : 'waiting');
        
    } else {
        // カレンダー未選択または時間帯テーブル未表示の場合は待機中のまま
        console.log('⏳ カレンダー未選択または時間帯テーブル未表示 - 待機中を維持');
        updateStatusBadge('idle');
    }
}

// カレンダー変更を監視して監視ボタンを再設置
function startCalendarWatcher(): void {
    if (calendarWatchState.isWatching) return;
    
    calendarWatchState.isWatching = true;
    calendarWatchState.currentSelectedDate = getCurrentSelectedCalendarDate();
    
    // 初期化時に入場予約状態管理にも現在の選択日付を設定
    if (calendarWatchState.currentSelectedDate) {
        entranceReservationStateManager.setSelectedCalendarDate(calendarWatchState.currentSelectedDate);
        console.log(`📅 初期化時の選択日付を設定: ${calendarWatchState.currentSelectedDate}`);
    }
    
    console.log('📅 カレンダー変更監視を開始');
    
    // MutationObserverでカレンダー変更・時間帯選択・ボタン状態変更を検出
    calendarWatchState.observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // 1. カレンダーのaria-pressed属性の変更を検出
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'aria-pressed' || 
                 mutation.attributeName === 'class')) {
                const element = mutation.target as HTMLElement;
                if (element.matches && element.matches('[role="button"][aria-pressed]') && 
                    element.querySelector('time[datetime]')) {
                    shouldUpdate = true;
                }
            }
            
            // 2. 時間帯選択の変更を検出
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'aria-pressed') {
                const element = mutation.target as HTMLElement;
                if (element.matches && element.matches('td[data-gray-out] div[role="button"]')) {
                    const ariaPressed = element.getAttribute('aria-pressed');
                    console.log(`🔄 時間帯選択変更検出: ${ariaPressed}`);
                    
                    // 入場予約状態管理システムの同期（初期化中は除外）
                    if (ariaPressed === 'true' && !calendarWatchState.isInitializing) {
                        // 選択状態変更を検出 - DOM状態から予約対象を同期
                        console.log(`🔄 時間帯選択状態を検出`);
                        setTimeout(() => {
                            syncReservationTargetFromDOM();
                            updateMainButtonDisplay();
                        }, 50);
                    }
                    
                    shouldUpdate = true;
                }
            }
            
            // 3. 来場日時設定ボタンのdisabled属性変更を検出
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'disabled') {
                const element = mutation.target as HTMLElement;
                if (element.matches && element.matches('button.basic-btn.type2.style_full__ptzZq')) {
                    console.log(`🔄 来場日時ボタン状態変更検出: disabled=${element.hasAttribute('disabled')}`);
                    shouldUpdate = true;
                }
            }
        });
        
        if (shouldUpdate) {
            // DOM更新完了を待ってから処理
            waitForTimeSlotTable(() => {
                handleCalendarChange();
            });
        }
    });
    
    // カレンダー要素全体を監視
    const observeTarget = document.body;
    calendarWatchState.observer.observe(observeTarget, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-pressed', 'class', 'disabled']
    });
}

// カレンダー変更・状態変更時の処理
function handleCalendarChange(): void {
    const newSelectedDate = getCurrentSelectedCalendarDate();
    const calendarDateChanged = newSelectedDate !== calendarWatchState.currentSelectedDate;
    
    // 入場予約状態管理の管理している日付とも比較
    const stateManagerSelectedDate = entranceReservationStateManager.getSelectedCalendarDate();
    const actualDateChanged = newSelectedDate !== stateManagerSelectedDate;
    
    if (calendarDateChanged) {
        console.log(`📅 カレンダー日付変更を検出: ${calendarWatchState.currentSelectedDate} → ${newSelectedDate}`);
        
        // 監視実行中は日付変更を無視
        if (entranceReservationStateManager.isMonitoringRunning()) {
            console.log('⚠️ 監視実行中のため日付変更を無視します');
            return;
        }
        
        calendarWatchState.currentSelectedDate = newSelectedDate;
        
        // 入場予約状態管理にも日付を設定
        if (newSelectedDate) {
            entranceReservationStateManager.setSelectedCalendarDate(newSelectedDate);
        }
        
        // 実際に日付が変更された場合のみ監視状態をクリア
        if (actualDateChanged) {
            console.log(`📅 実際の日付変更確認: ${stateManagerSelectedDate} → ${newSelectedDate}`);
            
            const hasReservationTarget = entranceReservationStateManager.hasReservationTarget();
            const hasMonitoringTargets = entranceReservationStateManager.hasMonitoringTargets();
            
            if (hasReservationTarget || hasMonitoringTargets) {
                console.log('📅 日付変更により入場予約状態管理システムの対象をクリア');
                entranceReservationStateManager.clearReservationTarget();
                entranceReservationStateManager.clearMonitoringTargets();
            }
        } else {
            console.log('📅 同じ日付への再クリックのため監視対象は維持');
        }
        
        // 従来システムはもう使用しないため、このブロックは削除
        // if (multiTargetManager.hasTargets() && !timeSlotState.isMonitoring) {
        //     console.log('📅 日付変更により従来システムの監視対象をクリア');
        //     multiTargetManager.clearAll();
        //     timeSlotState.mode = 'idle';
        //     if (cacheManager) {
        //         cacheManager.clearTargetSlots();
        //     }
        // }
        
        // 予約対象がクリアされたため、即座にFAB表示を更新
        updateMainButtonDisplay();
        
        // 監視ボタンを再設置（動的待機を使用）
        waitForTimeSlotTable(() => {
            removeAllMonitorButtons();
            analyzeAndAddMonitorButtons();
            
            // 監視ボタン設置後も再度FABボタンの状態を更新
            updateMainButtonDisplay();
            
            console.log('🔄 監視ボタンとFABを再設置しました');
        });
    } else {
        // 日付は変わっていない - FABボタンの状態のみ更新
        console.log('📅 日付変更なし - FABボタンの状態のみ更新');
        
        // 入場予約状態管理システムを取得して状態同期
        // 公式サイトによる選択解除があった場合の状態同期
        const selectedSlot = document.querySelector(timeSlotSelectors.selectedSlot);
        if (!selectedSlot && entranceReservationStateManager.hasReservationTarget()) {
            // DOM上に選択がないが入場予約状態管理に予約対象がある場合はクリア
            console.log('🔄 公式サイトによる選択解除を検出 - 入場予約状態管理を同期');
            entranceReservationStateManager.clearReservationTarget();
            // UI更新を確実に実行
            updateMainButtonDisplay();
        }
        
        // FABボタンの状態を更新（監視ボタンは再設置しない）
        updateMainButtonDisplay();
    }
}

// 既存の監視ボタンをすべて削除
function removeAllMonitorButtons(): void {
    const existingButtons = document.querySelectorAll('.monitor-btn.ext-ytomo');
    existingButtons.forEach(button => button.remove());
    console.log(`🗑️ 既存の監視ボタンを${existingButtons.length}個削除しました`);
}

// DOM上の選択状態から予約対象を同期
function syncReservationTargetFromDOM(): void {

    // DOM上で選択状態の時間帯要素を取得
    const selectedElement = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
    
    if (selectedElement) {
        const tdElement = selectedElement.closest('td[data-gray-out]') as HTMLTableCellElement;
        const timeText = selectedElement.querySelector('dt span')?.textContent?.trim();
        
        if (tdElement && timeText) {
            const locationIndex = LocationHelper.getIndexFromElement(tdElement);
            const selector = generateUniqueTdSelector(tdElement);
            
            console.log(`🔄 DOM状態から予約対象を同期: ${timeText} (位置: ${locationIndex})`);
            entranceReservationStateManager.setReservationTarget(timeText, locationIndex, selector);
        }
    } else {
        // 選択状態の要素がない場合は予約対象をクリア
        console.log(`🔄 選択状態なし - 予約対象をクリア`);
        entranceReservationStateManager.clearReservationTarget();
    }
}

// 時間帯テーブルの準備を待つ
function waitForTimeSlotTable(callback: () => void): void {
    // まず即座にチェック（最短の場合は遅延なし）
    const timeSlotButtons = document.querySelectorAll('td[data-gray-out] div[role="button"]');
    
    if (timeSlotButtons.length > 0) {
        console.log(`✅ 時間帯テーブル準備済み (${timeSlotButtons.length}個の時間帯を検出) - 即座に実行`);
        callback();
        return;
    }
    
    // DOM要素が存在しない場合のみ動的待機を開始
    const checkInterval = 50; // 50ms間隔で高速チェック
    const maxAttempts = 100; // 最大5秒待機（50ms × 100 = 5000ms）
    let attempts = 0;
    
    const checkTableReady = () => {
        attempts++;
        
        // 時間帯テーブルの存在確認
        const timeSlotButtons = document.querySelectorAll('td[data-gray-out] div[role="button"]');
        
        if (timeSlotButtons.length > 0) {
            console.log(`✅ 時間帯テーブル準備完了 (${timeSlotButtons.length}個の時間帯を検出) - ${attempts * checkInterval}ms後`);
            callback();
        } else if (attempts >= maxAttempts) {
            console.log('⚠️ 時間帯テーブルの準備がタイムアウト - 強制実行');
            callback();
        } else {
            // 時間帯テーブル待機中（ログ削減）
            setTimeout(checkTableReady, checkInterval);
        }
    };
    
    console.log('🔍 時間帯テーブル待機開始...');
    setTimeout(checkTableReady, checkInterval);
}

// 時間帯tdクリック処理を設定（公式サイト仕様を利用した選択解除機能付き）
function setupTimeSlotClickHandlers(): void {
    // 既存のハンドラーをクリア
    const existingHandler = (window as any).timeSlotClickHandler;
    if (existingHandler) {
        document.removeEventListener('click', existingHandler, true);
    }
    
    // 時間帯クリックハンドラーを設定
    const timeSlotClickHandler = (event: Event) => {
        const target = event.target as HTMLElement;
        
        // 時間帯のdiv[role="button"]または子要素がクリックされた場合のみ処理
        const actualTarget = target.closest('td[data-gray-out] div[role="button"]') as HTMLElement;
        
        if (!actualTarget) {
            // 時間帯要素でない場合は処理しない（ログも出力しない）
            return;
        }
        
        // 時間帯クリック判定成功
        
        // 時間帯のdiv[role="button"]がクリックされた場合
        const tdElement = actualTarget.closest('td[data-gray-out]') as HTMLTableCellElement;
        if (!tdElement) {
            return;
        }
        
        // actualTargetから時間テキストを取得
        const timeText = actualTarget.querySelector('dt span')?.textContent?.trim();
        if (!timeText) {
            return;
        }
            
        // 入場予約状態管理システムを取得
        const locationIndex = LocationHelper.getIndexFromElement(tdElement);
        
        // 入場予約状態管理で現在の選択状態を確認
        const isCurrentlyReservationTarget = entranceReservationStateManager.isReservationTarget(timeText, locationIndex);
        
        if (isCurrentlyReservationTarget) {
            // 既に予約対象として設定済みの場合は選択解除
            
            // イベントを停止（デフォルト動作を防ぐ）
            event.preventDefault();
            event.stopPropagation();
            
            // 公式サイトの仕様を利用：現在選択中のカレンダー日付ボタンをクリック
            const currentSelectedCalendarButton = document.querySelector('[role="button"][aria-pressed="true"]') as HTMLElement;
            if (currentSelectedCalendarButton && currentSelectedCalendarButton.querySelector('time[datetime]')) {
                currentSelectedCalendarButton.click();
                
                // 入場予約状態管理からも予約対象を削除
                setTimeout(() => {
                    entranceReservationStateManager.clearReservationTarget();
                    updateMainButtonDisplay();
                }, 100);
            } else {
                // フォールバック: 直接削除
                entranceReservationStateManager.clearReservationTarget();
                updateMainButtonDisplay();
            }
            
        } else {
            // 新規選択または別の時間帯への変更
            
            // DOM上の選択状態から予約対象を同期
            setTimeout(() => {
                syncReservationTargetFromDOM();
                updateMainButtonDisplay();
            }, 100);
        }
    };
    
    // グローバルに保存（後でremoveするため）
    (window as any).timeSlotClickHandler = timeSlotClickHandler;
    
    // 捕獲フェーズでイベントをキャッチ
    document.addEventListener('click', timeSlotClickHandler, true);
    
    console.log('✅ 公式サイト仕様を利用した時間帯選択解除ハンドラーを設定しました');
}

async function entranceReservationHelper(config: ReservationConfig): Promise<ReservationResult> {
    const { selectors, selectorTexts, timeouts } = config;
    let attempts = 0;
    const maxAttempts = 100;
    
    console.log('入場予約補助機能を開始します...');
    
    while (attempts < maxAttempts && !entranceReservationStateManager.getShouldStop()) {
        attempts++;
        console.log(`試行回数: ${attempts}`);
        
        const statusDiv = document.getElementById('reservation-status');
        if (statusDiv) {
            statusDiv.innerText = `試行中... (${attempts}回目)`;
        }
        
        try {
            console.log('1. submitボタンを待機中...');
            const submitButton = await waitForElement(selectors.submit, timeouts.waitForSubmit, config);
            
            if (entranceReservationStateManager.getShouldStop()) break;
            
            console.log('submitボタンが見つかりました。効率モードチェック中...');
            
            // submit押下時に回数を更新
            entranceReservationState.attempts = attempts;
            
            // 効率モード対応のsubmitクリック実行
            await executeSubmitWithEfficiencyTiming(submitButton as HTMLElement, config);
            
            console.log('2. レスポンスを待機中...');
            const responseSelectors = {
                change: selectors.change,
                success: selectors.success,
                failure: selectors.failure
            };
            
            const response = await waitForAnyElement(responseSelectors, timeouts.waitForResponse, selectorTexts, config);
            console.log(`レスポンス検出: ${response.key}`);
            
            if (entranceReservationStateManager.getShouldStop()) break;
            
            if (response.key === 'change') {
                console.log('changeボタンをクリックします。');
                await clickElementWithFixedDelay(response.element, config);
                
                console.log('success/failureを待機中...');
                
                const finalSelectors = {
                    success: selectors.success,
                    failure: selectors.failure
                };
                
                console.log(`⏰ 最大${timeouts.waitForResponse / 1000}秒間待機開始...`);
                const startTime = Date.now();
                
                try {
                    const finalResponse = await waitForAnyElement(finalSelectors, timeouts.waitForResponse, selectorTexts, config);
                    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
                    console.log(`✅ 最終レスポンス検出: ${finalResponse.key} (${elapsedTime}秒後)`);
                    
                    if (finalResponse.key === 'success') {
                        console.log('🎉 予約成功！処理を終了します。');
                        return { success: true, attempts };
                    } else {
                        console.log('予約失敗。closeボタンをクリックして再試行します。');
                        const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                        await clickElementWithFixedDelay(closeButton as HTMLElement, config);
                        await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
                    }
                } catch (waitError) {
                    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
                    console.error(`❌ ${elapsedTime}秒後にwaitForAnyElementでエラー:`, waitError);
                    throw waitError; // エラーを再スロー
                }
            } else if (response.key === 'success') {
                console.log('🎉 予約成功！処理を終了します。');
                return { success: true, attempts };
            } else if (response.key === 'failure') {
                console.log('予約失敗。closeボタンをクリックして再試行します。');
                const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                await clickElementWithFixedDelay(closeButton as HTMLElement, config);
                await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`エラーが発生しました (試行 ${attempts}):`, errorMessage);
            
            // 3分待っても結果が返らない場合（タイムアウト）は異常終了
            if (errorMessage.includes('いずれの要素も見つかりません') || errorMessage.includes('要素が見つかりませんでした')) {
                console.error('🚨 予約処理異常終了: 3分待っても成功/失敗の結果が返りませんでした');
                console.error('🛑 自動予約処理を完全停止します');
                entranceReservationStateManager.setShouldStop(true);
                return { success: false, attempts, abnormalTermination: true };
            }
            
            if (entranceReservationStateManager.getShouldStop()) break;
            await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
        }
    }
    
    if (entranceReservationStateManager.getShouldStop()) {
        console.log('ユーザーによってキャンセルされました。');
        // 中断時は状態をリセット
        entranceReservationStateManager.stop();
        return { success: false, attempts, cancelled: true };
    }
    
    console.log(`最大試行回数 (${maxAttempts}) に達しました。クールタイムを開始します。`);
    
    // クールタイム開始
    entranceReservationStateManager.startReservationCooldown();
    
    return { success: false, attempts, cooldownStarted: true };
}

// ============================================================================
// 効率モード対応関数
// ============================================================================

// 効率モード対応のsubmit実行（統一自動処理管理対応）
async function executeSubmitWithEfficiencyTiming(submitButton: HTMLElement, config: ReservationConfig): Promise<void> {
    const isEfficiencyMode = entranceReservationStateManager.isEfficiencyModeEnabled();
    
    if (!isEfficiencyMode) {
        // 通常モード: そのままクリック
        await clickElement(submitButton, config);
        return;
    }
    
    // 効率モード: 目標時間（00秒/30秒）への調整待機
    console.log('🚀 効率モード: submit標的時刻調整開始');
    
    // 次の00秒/30秒標的時刻を計算
    const nextTarget = entranceReservationStateManager.calculateNext00or30Seconds();
    
    try {
        // 統一自動処理管理による中断可能な効率モード待機
        console.log(`🎯 統一効率モード待機: 目標時刻 ${nextTarget.toLocaleTimeString()}`);
        await entranceReservationStateManager.executeUnifiedEfficiencyWait(nextTarget);
        
        // 標的時刻でsubmitクリック実行
        console.log(`🚀 submitクリック実行 (${new Date().toLocaleTimeString()})`);
        await clickElement(submitButton, config);
        
        // 次回標的時刻を更新
        entranceReservationStateManager.updateNextSubmitTarget();
        
    } catch (error: any) {
        if (error.name === 'CancellationError') {
            console.log('⏹️ 効率モード待機が中断されました');
            throw error; // 中断を上位に伝播
        } else {
            console.error('❌ 効率モード待機エラー:', error);
            throw error;
        }
    }
}

// 効率モード対応の固定待機付きクリック（change、closeボタン用、統一自動処理管理対応）
async function clickElementWithFixedDelay(element: HTMLElement, config: ReservationConfig): Promise<void> {
    const isEfficiencyMode = entranceReservationStateManager.isEfficiencyModeEnabled();
    
    if (isEfficiencyMode) {
        try {
            // 効率モード: 1.5-3秒の固定待機（中断可能）
            const randomDelay = 1500 + Math.random() * 1500; // 1500~3000ms
            console.log(`⏳ 効率モード固定待機: ${Math.round(randomDelay)}ms`);
            
            // 統一自動処理管理による中断可能な待機
            const controller = new AbortController();
            await entranceReservationStateManager.executeUnifiedWaitWithCancellation(randomDelay, controller.signal);
            
        } catch (error: any) {
            if (error.name === 'CancellationError' || error.message === 'AbortError') {
                console.log('⏹️ 効率モード固定待機が中断されました');
                throw error; // 中断を上位に伝播
            } else {
                console.error('❌ 効率モード固定待機エラー:', error);
                throw error;
            }
        }
    }
    
    // 通常のクリック処理
    await clickElement(element, config);
}

// エクスポート
export {
    createEntranceReservationUI,
    updateMonitoringTargetsDisplay,
    getCurrentReservationTarget,
    checkVisitTimeButtonState,
    checkTimeSlotSelected,
    canStartReservation,
    checkInitialState,
    startCalendarWatcher,
    handleCalendarChange,
    removeAllMonitorButtons,
    waitForTimeSlotTable,
    entranceReservationHelper
};

// ============================================================================
