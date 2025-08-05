// Section 1からのimport
import {
    getRandomWaitTime,
    waitForElement,
    waitForAnyElement,
    clickElement
} from './section1';

// Section 2からのimport
import { 
    multiTargetManager, 
    entranceReservationState, 
    timeSlotState,
    calendarWatchState
} from './section2';

// Section 4からのimport
import {
    timeSlotSelectors,
    generateUniqueTdSelector,
    extractTdStatus
} from './section4';

// Section 5からのimport
import {
    checkTimeSlotTableExistsSync,
    analyzeAndAddMonitorButtons,
    startSlotMonitoring,
    getExternalFunction
} from './section5';

// unified-stateからのimport
import { LocationHelper } from './unified-state';

// Section 6からのimport  
import {
    getCurrentSelectedCalendarDate,
    updateMainButtonDisplay,
    updateStatusBadge,
    stopSlotMonitoring,
    isInterruptionAllowed
} from './section6';

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
    statusBadge.style.display = 'block';
    
    // 一定時間後に自動で隠す（エラー、成功、中断メッセージ以外）
    if (color !== 'red' && color !== 'green' && color !== 'orange') {
        setTimeout(() => {
            statusBadge.style.display = 'none';
        }, 3000);
    }
}

function createEntranceReservationUI(config: ReservationConfig): void {
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

    // FABボタンのテキスト/アイコン
    const fabIcon = document.createElement('span');
    fabIcon.classList.add('ext-ytomo');
    fabIcon.style.cssText = `
        font-size: 12px !important;
        text-align: center !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        pointer-events: none !important;
    `;
    fabIcon.innerText = '待機中';
    fabButton.appendChild(fabIcon);
    
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
        min-width: 120px !important;
        max-width: 200px !important;
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
        min-width: 120px !important;
        max-width: 200px !important;
        display: none !important;
        white-space: pre-line !important;
        overflow: visible !important;
        text-overflow: clip !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    `;
    monitoringTargetsDisplay.title = '監視対象一覧（クリックで詳細表示）';
    
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
            console.log('⚠️ ボタンがdisabledのためクリックを無視します');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        
        // 追加のstyle確認（CSS disabled状態もチェック）
        if (fabButton.style.pointerEvents === 'none') {
            console.log('⚠️ pointer-events:noneのためクリックを無視します');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        
        // 中断不可期間のチェック
        if (!isInterruptionAllowed()) {
            console.log('⚠️ リロード直前のため中断できません');
            showStatus('リロード直前のため中断できません', 'red');
            return;
        }
        
        // 実行中の場合は中断処理
        if (timeSlotState.isMonitoring) {
            console.log('監視を中断します');
            stopSlotMonitoring();
            // ステータスは中断を示すメッセージを表示（消さない）
            showStatus('監視中断', 'orange');
            updateMainButtonDisplay();
            return;
        }
        
        if (entranceReservationState.isRunning) {
            console.log('予約処理を中断します');
            entranceReservationState.shouldStop = true;
            showStatus('予約処理を中断中...', 'orange');
            return;
        }
        
        // 統一状態管理システムを使用した監視開始判定
        const unifiedStateManager = getExternalFunction('unifiedStateManager');
        if (unifiedStateManager) {
            const preferredAction = unifiedStateManager.getPreferredAction();
            console.log(`🔧 FABクリック: preferredAction=${preferredAction}`);
            
            if (preferredAction === 'monitoring') {
                console.log('📡 統一状態管理システムによる監視開始');
                // 実行状態を監視中に変更
                unifiedStateManager.startMonitoring();
                // 即座にUI更新してから監視開始
                updateMainButtonDisplay();
                await startSlotMonitoring();
                return;
            } else if (preferredAction === 'reservation') {
                console.log('🚀 統一状態管理システムによる予約開始');
                // 予約処理は下の通常処理で実行
            } else {
                console.log('⚠️ 統一状態管理システム: 実行可能なアクションなし');
                return;
            }
        } else {
            // フォールバック: 従来の判定
            if (multiTargetManager.hasTargets() && timeSlotState.mode === 'selecting') {
                console.log('📡 従来システムによる監視開始');
                updateMainButtonDisplay();
                await startSlotMonitoring();
                return;
            }
        }
        
        // 通常の予約処理
        entranceReservationState.isRunning = true;
        entranceReservationState.shouldStop = false;
        entranceReservationState.startTime = Date.now();
        entranceReservationState.attempts = 0;
        showStatus('予約処理実行中...', 'blue');
        updateMainButtonDisplay();
        updateMonitoringTargetsDisplay(); // 予約対象を表示
        
        try {
            const result = await entranceReservationHelper(config);
            if (result.success) {
                showStatus(`🎉 予約成功！(${result.attempts}回試行)`, 'green');
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                    cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                }
            } else {
                showStatus(`予約失敗 (${result.attempts}回試行)`, 'red');
            }
        } catch (error) {
            console.error('予約処理エラー:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            showStatus(`エラー: ${errorMessage}`, 'red');
        } finally {
            entranceReservationState.isRunning = false;
            entranceReservationState.startTime = null;
            entranceReservationState.attempts = 0;
            updateMainButtonDisplay();
            updateMonitoringTargetsDisplay(); // 予約終了時に表示更新
        }
        
        return; // 明示的なreturnを追加
    });
    
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
    fabContainer.appendChild(reservationTargetDisplay);
    fabContainer.appendChild(monitoringTargetsDisplay);
    fabContainer.appendChild(statusBadge);
    fabContainer.appendChild(fabButton);

    // DOMに追加（body直下）
    document.body.appendChild(fabContainer);

    console.log('✅ FAB形式の予約UIを作成しました');
    
    // 初期状態を判定してFABを更新
    waitForTimeSlotTable(() => {
        checkInitialState();
    });
    
    // カレンダー変更監視を開始
    startCalendarWatcher();
    
    // 時間帯クリックハンドラーを設定（選択解除機能付き）
    waitForTimeSlotTable(() => {
        setupTimeSlotClickHandlers();
    });
}

// 監視対象表示を更新
function updateMonitoringTargetsDisplay(): void {
    const targetsDisplay = document.querySelector('#ytomo-monitoring-targets') as HTMLElement;
    if (!targetsDisplay) return;

    // 予約実行中の対象を取得
    const reservationTarget = getCurrentReservationTarget();
    const targets = multiTargetManager.getTargets();
    
    // 予約実行中の場合は予約対象を表示
    if (entranceReservationState.isRunning && reservationTarget) {
        targetsDisplay.innerText = `予約対象:\n${reservationTarget}`;
        targetsDisplay.style.display = 'block';
        targetsDisplay.style.background = 'linear-gradient(135deg, rgba(0, 104, 33, 0.9), rgba(0, 150, 50, 0.9))';
        targetsDisplay.title = `現在予約実行中の対象: ${reservationTarget}`;
        return;
    }
    
    // 監視対象がない場合は非表示
    if (targets.length === 0) {
        targetsDisplay.style.display = 'none';
        return;
    }
    
    // 監視対象を東西+時間形式で表示
    const targetTexts = targets.map((target, index) => {
        const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
        const priority = index + 1;
        return `${priority}.${location}${target.timeText}`;
    });
    
    targetsDisplay.innerText = `監視対象:\n${targetTexts.join('\n')}`;
    targetsDisplay.style.display = 'block';
    targetsDisplay.style.background = 'linear-gradient(135deg, rgba(255, 140, 0, 0.9), rgba(255, 180, 0, 0.9))';
    
    // 詳細なツールチップ
    const detailText = targets.map((target, index) => {
        const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
        const priority = index + 1;
        return `${priority}. ${location}${target.timeText}`;
    }).join('\n');
    
    targetsDisplay.title = `監視対象 (${targets.length}個):\n${detailText}\n\nクリックで詳細表示`;
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
    const location = multiTargetManager.getLocationFromSelector(tdSelector);
    
    return `${location}${timeText}`;
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
        const fabIcon = fabButton?.querySelector('span') as HTMLSpanElement;
        
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
                    
                    // 統一状態管理システムの同期
                    const unifiedStateManager = getExternalFunction('unifiedStateManager');
                    if (unifiedStateManager && ariaPressed === 'true') {
                        // 新しい選択を検出した場合
                        const tdElement = element.closest('td[data-gray-out]') as HTMLTableCellElement;
                        if (tdElement) {
                            const timeText = element.querySelector('dt span')?.textContent?.trim();
                            const locationIndex = LocationHelper.getIndexFromElement(tdElement);
                            
                            if (timeText) {
                                console.log(`🔄 統一状態管理に予約対象を同期: ${timeText}`);
                                unifiedStateManager.setReservationTarget(timeText, locationIndex);
                                // FABボタン表示を更新
                                updateMainButtonDisplay();
                            }
                        }
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
    
    if (calendarDateChanged) {
        console.log(`📅 カレンダー日付変更を検出: ${calendarWatchState.currentSelectedDate} → ${newSelectedDate}`);
        
        // 監視実行中は日付変更を無視
        if (timeSlotState.isMonitoring) {
            console.log('⚠️ 監視実行中のため日付変更を無視します');
            return;
        }
        
        calendarWatchState.currentSelectedDate = newSelectedDate;
        
        // 既存の監視状態をクリア（日付が変わったため）
        // 統一状態管理システムからもクリア
        const unifiedStateManager = getExternalFunction('unifiedStateManager');
        if (unifiedStateManager) {
            const hasReservationTarget = unifiedStateManager.hasReservationTarget();
            const hasMonitoringTargets = unifiedStateManager.hasMonitoringTargets();
            
            if (hasReservationTarget || hasMonitoringTargets) {
                console.log('📅 日付変更により統一状態管理システムの対象をクリア');
                unifiedStateManager.clearReservationTarget();
                unifiedStateManager.clearMonitoringTargets();
            }
        }
        
        if (multiTargetManager.hasTargets() && !timeSlotState.isMonitoring) {
            console.log('📅 日付変更により従来システムの監視対象をクリア');
            multiTargetManager.clearAll();
            timeSlotState.mode = 'idle';
            if (cacheManager) {
                cacheManager.clearTargetSlots();
            }
        }
        
        // 予約対象がクリアされたため、即座にFAB表示を更新
        updateMainButtonDisplay();
        
        // 監視ボタンを再設置
        setTimeout(() => {
            removeAllMonitorButtons();
            analyzeAndAddMonitorButtons();
            
            // 監視ボタン設置後も再度FABボタンの状態を更新
            updateMainButtonDisplay();
            
            console.log('🔄 監視ボタンとFABを再設置しました');
        }, 1000); // 時間帯テーブル更新を待つ
    } else {
        // 日付は変わっていない - FABボタンの状態のみ更新
        console.log('📅 日付変更なし - FABボタンの状態のみ更新');
        
        // 統一状態管理システムを取得して状態同期
        const unifiedStateManager = getExternalFunction('unifiedStateManager');
        if (unifiedStateManager) {
            // 公式サイトによる選択解除があった場合の状態同期
            const selectedSlot = document.querySelector(timeSlotSelectors.selectedSlot);
            if (!selectedSlot && unifiedStateManager.hasReservationTarget()) {
                // DOM上に選択がないが統一状態管理に予約対象がある場合はクリア
                console.log('🔄 公式サイトによる選択解除を検出 - 統一状態管理を同期');
                unifiedStateManager.clearReservationTarget();
                // UI更新を確実に実行
                updateMainButtonDisplay();
            }
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

// 時間帯テーブルの準備を待つ
function waitForTimeSlotTable(callback: () => void): void {
    const checkInterval = 50; // 50ms間隔で高速チェック
    const maxAttempts = 100; // 最大5秒待機（50ms × 100 = 5000ms）
    let attempts = 0;
    
    const checkTableReady = () => {
        attempts++;
        
        // 時間帯テーブルの存在確認
        const timeSlotButtons = document.querySelectorAll('td[data-gray-out] div[role="button"]');
        
        if (timeSlotButtons.length > 0) {
            console.log(`✅ 時間帯テーブル準備完了 (${timeSlotButtons.length}個の時間帯を検出)`);
            callback();
        } else if (attempts >= maxAttempts) {
            console.log('⚠️ 時間帯テーブルの準備がタイムアウト - 強制実行');
            callback();
        } else {
            console.log(`🔍 時間帯テーブル待機中... (${attempts}/${maxAttempts})`);
            setTimeout(checkTableReady, checkInterval);
        }
    };
    
    checkTableReady();
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
        
        console.log(`🖱️ クリックハンドラー呼び出し: ${target.tagName}.${target.className}, id="${target.id}"`);
        
        // 時間帯のdiv[role="button"]または子要素がクリックされた場合
        const actualTarget = target.closest('td[data-gray-out] div[role="button"]') as HTMLElement;
        
        if (!actualTarget) {
            console.log(`🔍 時間帯要素なし、処理終了`);
            return;
        }
        
        console.log(`✅ 時間帯クリック判定成功: ${actualTarget.tagName}.${actualTarget.className}`);
        
        // 時間帯のdiv[role="button"]がクリックされた場合
        const tdElement = actualTarget.closest('td[data-gray-out]') as HTMLTableCellElement;
        if (!tdElement) {
            console.log('❌ td要素が見つからない');
            return;
        }
        
        // actualTargetから時間テキストを取得
        const timeText = actualTarget.querySelector('dt span')?.textContent?.trim();
        if (!timeText) {
            console.log('❌ 時間テキストが見つからない');
            return;
        }
            
            // 統一状態管理システムを取得
            const unifiedStateManager = getExternalFunction('unifiedStateManager');
            const locationIndex = LocationHelper.getIndexFromElement(tdElement);
            
            console.log(`🖱️ 時間帯クリック検出: ${timeText} (位置: ${locationIndex})`);
            
            if (unifiedStateManager) {
                // 統一状態管理で現在の選択状態を確認
                const isCurrentlyReservationTarget = unifiedStateManager.isReservationTarget(timeText, locationIndex);
                
                console.log(`🔍 現在の予約対象状態: ${isCurrentlyReservationTarget}`);
                
                if (isCurrentlyReservationTarget) {
                    // 既に予約対象として設定済みの場合は選択解除
                    console.log(`🔄 選択解除: ${timeText} - 公式サイト仕様を利用`);
                    
                    // イベントを停止（デフォルト動作を防ぐ）
                    event.preventDefault();
                    event.stopPropagation();
                    
                    // 公式サイトの仕様を利用：現在選択中のカレンダー日付ボタンをクリック
                    const currentSelectedCalendarButton = document.querySelector('[role="button"][aria-pressed="true"]') as HTMLElement;
                    if (currentSelectedCalendarButton && currentSelectedCalendarButton.querySelector('time[datetime]')) {
                        console.log('📅 カレンダー日付ボタンをプログラムでクリックして選択解除');
                        currentSelectedCalendarButton.click();
                        
                        // 統一状態管理からも予約対象を削除
                        setTimeout(() => {
                            unifiedStateManager.clearReservationTarget();
                            updateMainButtonDisplay();
                            console.log('✅ 公式サイト仕様による選択解除完了');
                        }, 100);
                    } else {
                        console.log('⚠️ カレンダー日付ボタンが見つからないため、直接削除');
                        // フォールバック: 直接削除
                        unifiedStateManager.clearReservationTarget();
                        updateMainButtonDisplay();
                        console.log('✅ フォールバック予約対象解除完了');
                    }
                    
                } else {
                    // 新規選択または別の時間帯への変更
                    console.log(`✅ 新規選択: ${timeText}`);
                    
                    // 統一状態管理に予約対象を設定（既存の予約対象は自動的に置き換え）
                    setTimeout(() => {
                        unifiedStateManager.setReservationTarget(timeText, locationIndex);
                        updateMainButtonDisplay();
                        console.log(`✅ 統一状態管理に予約対象設定: ${timeText} (位置: ${locationIndex})`);
                    }, 100);
                }
        } else {
            // 統一状態管理が利用できない場合はDOMベースの判定
            const isCurrentlySelected = actualTarget.getAttribute('aria-pressed') === 'true';
            console.log(`⚠️ 統一状態管理なし、DOM判定: ${isCurrentlySelected}`);
            
            if (!isCurrentlySelected) {
                // 通常の選択処理（何もしない、デフォルト動作に任せる）
                setTimeout(() => {
                    updateMainButtonDisplay();
                }, 100);
            }
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
    
    while (attempts < maxAttempts && !entranceReservationState.shouldStop) {
        attempts++;
        console.log(`試行回数: ${attempts}`);
        
        const statusDiv = document.getElementById('reservation-status');
        if (statusDiv) {
            statusDiv.innerText = `試行中... (${attempts}回目)`;
        }
        
        try {
            console.log('1. submitボタンを待機中...');
            const submitButton = await waitForElement(selectors.submit, timeouts.waitForSubmit, config);
            
            if (entranceReservationState.shouldStop) break;
            
            console.log('submitボタンが見つかりました。クリックします。');
            
            // submit押下時に回数を更新
            entranceReservationState.attempts = attempts;
            
            await clickElement(submitButton, config);
            
            console.log('2. レスポンスを待機中...');
            const responseSelectors = {
                change: selectors.change,
                success: selectors.success,
                failure: selectors.failure
            };
            
            const response = await waitForAnyElement(responseSelectors, timeouts.waitForResponse, selectorTexts, config);
            console.log(`レスポンス検出: ${response.key}`);
            
            if (entranceReservationState.shouldStop) break;
            
            if (response.key === 'change') {
                console.log('changeボタンをクリックします。');
                await clickElement(response.element, config);
                
                console.log('success/failureを待機中...');
                const finalSelectors = {
                    success: selectors.success,
                    failure: selectors.failure
                };
                
                const finalResponse = await waitForAnyElement(finalSelectors, timeouts.waitForResponse, selectorTexts, config);
                console.log(`最終レスポンス検出: ${finalResponse.key}`);
                
                if (finalResponse.key === 'success') {
                    console.log('🎉 予約成功！処理を終了します。');
                    return { success: true, attempts };
                } else {
                    console.log('予約失敗。closeボタンをクリックして再試行します。');
                    const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                    await clickElement(closeButton, config);
                    await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
                }
            } else if (response.key === 'success') {
                console.log('🎉 予約成功！処理を終了します。');
                return { success: true, attempts };
            } else if (response.key === 'failure') {
                console.log('予約失敗。closeボタンをクリックして再試行します。');
                const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                await clickElement(closeButton, config);
                await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
            }
            
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`エラーが発生しました (試行 ${attempts}):`, errorMessage);
            if (entranceReservationState.shouldStop) break;
            await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
        }
    }
    
    if (entranceReservationState.shouldStop) {
        console.log('ユーザーによってキャンセルされました。');
        return { success: false, attempts, cancelled: true };
    }
    
    console.log(`最大試行回数 (${maxAttempts}) に達しました。処理を終了します。`);
    return { success: false, attempts };
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
    entranceReservationHelper
};

// ============================================================================
