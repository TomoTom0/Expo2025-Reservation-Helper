// 統一処理移行により個別importは不要

// 音声再生用import
import { AudioPlayer } from './audio-player';
import { loggers } from '../utils/logger';

const logger = loggers.tickets;

// entrance-page-stateからのimport
import { processingOverlay } from './processing-overlay';
import { 
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

import {
    checkTimeSlotTableExistsSync
} from './entrance-page-core';

// unified-stateからのimport
import { LocationHelper, entranceReservationStateManager, ExecutionState } from './entrance-reservation-state-manager';

// Section 6からのimport  
import {
    isInterruptionAllowed
} from './entrance-page-core';

// UI更新ヘルパーからのimport
import {
    getCurrentSelectedCalendarDate,
    waitForValidCalendarDate
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
    // 既存の状態クラスを削除
    statusBadge.className = statusBadge.className.replace(/ytomo-status-\w+/g, '').trim();
    
    // 新しい状態クラスを追加
    const statusClass = color === 'red' ? 'ytomo-status-countdown-warning' :
                       color === 'orange' ? 'ytomo-status-warning' :
                       color === 'blue' ? 'ytomo-status-reservation' :
                       'ytomo-status-waiting';
    statusBadge.classList.add(statusClass);
    statusBadge.classList.remove('js-hide');
    
    // 一定時間後に状態管理システムに更新を委譲（エラー、成功、中断メッセージ以外）
    if (color !== 'red' && color !== 'green' && color !== 'orange') {
        setTimeout(() => {
            // 状態管理システムによる更新に委譲
            if (entranceReservationStateManager) {
                entranceReservationStateManager.updateFabDisplay();
            }
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
    fabContainer.className = 'ytomo-fab-container z-normal';


    // メインFABボタンを作成
    const fabButton = document.createElement('button');
    fabButton.id = 'ytomo-main-fab';
    fabButton.classList.add('ext-ytomo', 'ytomo-fab', 'state-idle');

    // FABボタンのステータス表示
    const fabIcon = document.createElement('span');
    fabIcon.classList.add('ext-ytomo', 'ytomo-fab-status', 'ytomo-fab-inner-content');
    fabIcon.innerText = '待機中';
    fabButton.appendChild(fabIcon);
    
    // 初期状態はytomo-fabクラスで制御
    fabButton.className = 'ytomo-fab state-idle';

    // 予約対象情報表示エリア（新規追加）
    const reservationTargetDisplay = document.createElement('div');
    reservationTargetDisplay.id = 'ytomo-reservation-target';
    reservationTargetDisplay.className = 'ytomo-reservation-target-display hidden';
    reservationTargetDisplay.title = '予約対象（クリックで詳細表示）';
    
    
    // ホバー効果はCSSで実装済み

    // ステータス表示（コンパクト）
    const statusBadge = document.createElement('div');
    statusBadge.id = 'ytomo-status-badge';
    statusBadge.className = '';
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
        
        // 追加のクラス確認（CSS disabled状態もチェック）
        if (fabButton.classList.contains('pointer-events-none')) {
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
        
        
        
        if (entranceReservationStateManager.isReservationRunning()) {
            stopReservationProcess();
            return;
        }
        
        // 入場予約状態管理システムを使用した開始判定
        const preferredAction = entranceReservationStateManager.getPreferredAction();
        // FABクリック処理開始
        
        if (preferredAction === 'reservation') {
            await startReservationProcess();
        } else {
            logger.warn('入場予約状態管理システム: 実行可能なアクションなし');
        }
        
        return;
    });


    // 予約中断処理
    function stopReservationProcess(): void {
        logger.info('予約を中断');
        entranceReservationStateManager.setShouldStop(true);
        showStatus('予約処理を中断中...', 'orange');
        
        // 中断フラグ設定後、UIを即座に更新
        entranceReservationStateManager.updateFabDisplay();
    }


    // 予約開始処理
    async function startReservationProcess(): Promise<void> {
        logger.info('入場予約状態管理システムによる予約開始');
        
        // DOM状態から予約対象を同期（予約開始前に必須）
        syncReservationTargetFromDOM();
        
        // 統一予約開始処理
        if (!entranceReservationStateManager.startReservation()) {
            logger.error('予約開始に失敗しました');
            showStatus('予約開始失敗', 'red');
            return;
        }
        
        logger.info('予約開始成功、FABボタン状態更新中');
        
        // デバッグ: 実行状態を確認
        const currentState = entranceReservationStateManager.getExecutionState();
        logger.info('予約開始後実行状態', { currentState });
        
        // 予約に切り替わった場合にオーバーレイを更新
        processingOverlay.show('reservation');
        
        showStatus('予約処理実行中...', 'blue');
        entranceReservationStateManager.updateFabDisplay();
        
        // デバッグ: FABボタンの現在の状態を確認
        const mainButton = document.getElementById('ytomo-main-fab') as HTMLButtonElement;
        if (mainButton) {
            logger.debug('FABボタン状態(予約開始後)', { disabled: mainButton.disabled, title: mainButton.title });
        }
        // 予約対象表示は統一システムで管理
        
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
        logger.info('予約開始前の対象情報', reservationTarget);
        
        try {
            const result = await entranceReservationHelper(config);
            logger.debug('entranceReservationHelper戻り値', result);
            if (result.success) {
                showStatus(`🎉 予約成功！(${result.attempts}回試行)`, 'green');
                
                // 予約開始前に保存した対象情報で成功情報を設定
                if (reservationTarget) {
                    entranceReservationStateManager.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                    entranceReservationStateManager.updateFabDisplay(); // FAB表示更新
                    
                    // 通知音が有効な場合は成功音を再生
                    const soundEnabled = entranceReservationStateManager.isNotificationSoundEnabled();
                    logger.debug('予約成功時の通知音設定チェック', { soundEnabled });
                    
                    if (soundEnabled) {
                        logger.info('予約成功 - 通知音を再生');
                        try {
                            AudioPlayer.playSuccessSound();
                            logger.info('通知音再生完了');
                        } catch (error) {
                            logger.error('通知音再生エラー', { error: error instanceof Error ? error.message : String(error) });
                        }
                    } else {
                        logger.debug('予約成功 - 通知音は無効のため再生なし');
                    }
                    
                    logger.info('予約成功UI更新完了');
                } else {
                    logger.warn('予約開始前の対象情報がnullのためUI更新をスキップ');
                }
                
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                }
            } else {
                if (result.cancelled) {
                    showStatus(`⏹️ 予約中断 (${result.attempts}回試行)`, 'orange');
                    logger.info('ユーザーにより予約が中断');
                } else if (result.abnormalTermination) {
                    showStatus(`🚨 異常終了 (${result.attempts}回試行) - システム停止`, 'red');
                    logger.error('予約処理が異常終了 - システムを停止');
                } else {
                    showStatus(`予約失敗 (${result.attempts}回試行)`, 'red');
                }
            }
        } catch (error) {
            logger.error('予約処理エラー', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            if (errorMessage === 'TargetConsistencyError') {
                showStatus('🚨 予約対象変更のため中断', 'red');
            } else {
                showStatus(`エラー: ${errorMessage}`, 'red');
            }
        } finally {
            // 入場予約状態管理システムで予約実行終了
            entranceReservationStateManager.stop();
            
            entranceReservationStateManager.updateFabDisplay();
            // 予約終了時の表示更新は統一システムで管理
        }
    }
    
    // disabled状態でのクリックを確実に防ぐため、キャプチャーフェーズでも処理
    fabButton.addEventListener('click', (event) => {
        if (fabButton.disabled || fabButton.hasAttribute('disabled') || fabButton.classList.contains('pointer-events-none')) {
            logger.debug('キャプチャーフェーズでdisabledクリックを阻止');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        
        return; // 明示的なreturnを追加
    }, true); // useCapture = true


    // FABコンテナに要素を追加（上から順：予約対象→ステータス→ボタン）
    // 効率モードトグルボタン（非表示 - 効率モードは常時ON）
    const efficiencyToggleButton = document.createElement('button');
    efficiencyToggleButton.className = 'ytomo-efficiency-toggle js-hide'; // 非表示に設定
    
    // 効率モード状態に応じた初期表示（非表示のため更新不要）
    function updateEfficiencyToggleButton() {
        // 効率モード常時ONのため表示更新不要
        return;
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
        logger.debug('自動選択イベントを受信', event.detail);
        const slot = event.detail?.slot;
        if (!slot?.targetInfo) {
            logger.error('自動選択: スロット情報が無効');
            return;
        }
        
        try {
                
            
            // オーバーレイを確実に非表示にして状態をリセット
            logger.debug('予約移行 - オーバーレイ状態をリセット');
            processingOverlay.hide();
            
            // 1. 時間帯要素をクリックして選択状態にする
            logger.info('自動選択 - 時間帯をクリック', { timeSlot: slot.targetInfo.timeSlot });
            const timeSlotElement = document.querySelector(slot.targetInfo.selector);
            if (timeSlotElement) {
                const buttonElement = timeSlotElement.querySelector('div[role="button"]') as HTMLElement;
                if (buttonElement) {
                    // 満員時間帯も強制選択可能（data-disabled属性に関係なく）
                    buttonElement.click();
                    logger.info('時間帯選択完了', { timeSlot: slot.targetInfo.timeSlot });
                    
                    // 2. 選択後、少し待ってから内部的に自動予約を開始
                    setTimeout(async () => {
                        logger.info('内部的に自動予約を開始');
                        if (entranceReservationStateManager.canStartReservation()) {
                            await startReservationProcess();
                        } else {
                            logger.error('予約開始条件が満たされていない');
                        }
                    }, 100);
                } else {
                    logger.error('時間帯ボタンが見つからないか無効', { timeSlot: slot.targetInfo.timeSlot });
                }
            } else {
                logger.error('時間帯要素が見つからない', { selector: slot.targetInfo.selector });
            }
            
        } catch (error) {
            logger.error('自動選択処理エラー', { error: error instanceof Error ? error.message : String(error) });
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
    
    // カレンダー変更検知は別途初期化処理で開始（キャッシュ復元後）
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
        logger.warn('来場日時設定ボタンが見つからない');
        return false;
    }
    
    const isDisabled = visitTimeButton.hasAttribute('disabled') || visitTimeButton.disabled;
    logger.debug('来場日時設定ボタン状態', { isDisabled });
    
    return !isDisabled;
}

// 時間帯が選択されているかチェック
function checkTimeSlotSelected(): boolean {
    // 選択された時間帯（aria-pressed="true"）をチェック
    const selectedTimeSlot = document.querySelector(timeSlotSelectors.selectedSlot);
    
    if (!selectedTimeSlot) {
        logger.warn('時間帯が選択されていない');
        return false;
    }
    
    // 選択された時間帯が満員でないかチェック
    const tdElement = selectedTimeSlot.closest('td');
    if (!tdElement) return false;
    const status = extractTdStatus(tdElement);
    
    logger.debug('時間帯選択済み', { timeText: status?.timeText || 'unknown' });
    return true;
}

// 予約開始可能かどうかの総合判定
function canStartReservation(): boolean {
    const hasTimeSlotTable = checkTimeSlotTableExistsSync();
    const isTimeSlotSelected = checkTimeSlotSelected();
    const isVisitTimeButtonEnabled = checkVisitTimeButtonState();
    
    logger.debug('予約開始条件チェック');
    logger.debug('時間帯テーブル状態', { hasTimeSlotTable });
    logger.debug('時間帯選択状態', { isTimeSlotSelected });
    logger.debug('来場日時ボタン有効状態', { isVisitTimeButtonEnabled });
    
    return hasTimeSlotTable && isTimeSlotSelected && isVisitTimeButtonEnabled;
}

// 初期状態をチェックしてFABを適切に設定
function checkInitialState(): void {
    logger.debug('初期状態をチェック中');
    
    // 【統一システム連動】統一システムが責任を持つ場合はスキップ
    const currentState = entranceReservationStateManager.getExecutionState();
    const preferredAction = entranceReservationStateManager.getPreferredAction();
    
    if (currentState !== ExecutionState.IDLE) {
        logger.debug('統一システム実行中 - 初期状態チェックをスキップ', { currentState });
        return;
    }
    
    if (preferredAction === 'reservation') {
        logger.debug('統一システムがアクション決定済み - 初期状態チェックをスキップ', { preferredAction });
        return;
    }
    
    // 【統一システム完全委譲】FABボタン状態は統一システムが一元管理
    logger.debug('FABボタン状態は統一システムに完全委譲');
    
    // 統一システムに状態更新を要求
    entranceReservationStateManager.updateFabDisplay();
}

// カレンダー変更を検知してボタンを再設置
function startCalendarWatcher(): void {
    if (calendarWatchState.isWatching) return;
    
    calendarWatchState.isWatching = true;
    calendarWatchState.currentSelectedDate = getCurrentSelectedCalendarDate();
    
    // 初期化時に入場予約状態管理にも現在の選択日付を設定
    if (calendarWatchState.currentSelectedDate) {
        entranceReservationStateManager.setSelectedCalendarDate(calendarWatchState.currentSelectedDate);
        logger.debug('初期化時の選択日付を設定', { selectedDate: calendarWatchState.currentSelectedDate });
    }
    
    logger.debug('カレンダー変更検知を開始');
    
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
                    logger.debug('時間帯選択変更検出', { ariaPressed });
                    
                    // 入場予約状態管理システムの同期（初期化中は除外）
                    if (ariaPressed === 'true' && !calendarWatchState.isInitializing) {
                        // 選択状態変更を検出 - DOM状態から予約対象を同期
                        logger.debug('時間帯選択状態を検出');
                        setTimeout(() => {
                            syncReservationTargetFromDOM();
                            entranceReservationStateManager.updateFabDisplay();
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
                    logger.debug('来場日時ボタン状態変更検出', { disabled: element.hasAttribute('disabled') });
                    shouldUpdate = true;
                }
            }
        });
        
        if (shouldUpdate) {
            // DOM更新完了を待ってから処理
            waitForTimeSlotTable(async () => {
                await handleCalendarChange();
            });
        }
    });
    
    // カレンダー要素全体を検知
    const observeTarget = document.body;
    calendarWatchState.observer.observe(observeTarget, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-pressed', 'class', 'disabled']
    });
}

// カレンダー変更・状態変更時の処理
async function handleCalendarChange(): Promise<void> {
    // 動的待機で日付を取得（遷移中の場合は適切に待機）
    const newSelectedDate = await waitForValidCalendarDate(3000, 100);
    const calendarDateChanged = newSelectedDate !== calendarWatchState.currentSelectedDate;
    
    // 入場予約状態管理の管理している日付とも比較
    const stateManagerSelectedDate = entranceReservationStateManager.getSelectedCalendarDate();
    const actualDateChanged = newSelectedDate !== stateManagerSelectedDate;
    
    if (calendarDateChanged) {
        logger.debug('カレンダー日付変更を検出', { oldDate: calendarWatchState.currentSelectedDate, newDate: newSelectedDate });
        
        
        calendarWatchState.currentSelectedDate = newSelectedDate;
        
        // 入場予約状態管理にも日付を設定
        if (newSelectedDate) {
            entranceReservationStateManager.setSelectedCalendarDate(newSelectedDate);
        }
        
        // 実際に日付が変更された場合のみ状態をクリア
        if (actualDateChanged) {
            logger.debug('実際の日付変更確認', { oldDate: stateManagerSelectedDate, newDate: newSelectedDate });
            
            const hasReservationTarget = entranceReservationStateManager.hasReservationTarget();
            
            if (hasReservationTarget) {
                logger.debug('日付変更により予約対象をクリア');
                entranceReservationStateManager.clearReservationTarget();
            }
        } else {
            logger.debug('同じ日付への再クリック');
        }
        
        
        // 予約対象がクリアされたため、即座にFAB表示を更新
        entranceReservationStateManager.updateFabDisplay();
        
    } else {
        // 日付は変わっていない - FABボタンの状態のみ更新
        logger.debug('日付変更なし - FABボタンの状態のみ更新');
        
        // 入場予約状態管理システムを取得して状態同期
        // 公式サイトによる選択解除があった場合の状態同期
        const selectedSlot = document.querySelector(timeSlotSelectors.selectedSlot);
        if (!selectedSlot && entranceReservationStateManager.hasReservationTarget()) {
            // DOM上に選択がないが入場予約状態管理に予約対象がある場合はクリア
            logger.debug('公式サイトによる選択解除を検出 - 入場予約状態管理を同期');
            entranceReservationStateManager.clearReservationTarget();
            // UI更新を確実に実行
            entranceReservationStateManager.updateFabDisplay();
        }
        
        // FABボタンの状態を更新
        entranceReservationStateManager.updateFabDisplay();
    }
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
            
            logger.debug('DOM状態から予約対象を同期', { timeText, locationIndex });
            entranceReservationStateManager.setReservationTarget(timeText, locationIndex, selector);
        }
    } else {
        // 選択状態の要素がない場合は予約対象をクリア
        logger.debug('選択状態なし - 予約対象をクリア');
        entranceReservationStateManager.clearReservationTarget();
    }
}

// 時間帯テーブルの準備を待つ
function waitForTimeSlotTable(callback: () => void): void {
    // まず即座にチェック（最短の場合は遅延なし）
    const timeSlotButtons = document.querySelectorAll('td[data-gray-out] div[role="button"]');
    
    if (timeSlotButtons.length > 0) {
        logger.debug('時間帯テーブル準備済み - 即座に実行', { timeSlotCount: timeSlotButtons.length });
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
            logger.debug('時間帯テーブル準備完了', { timeSlotCount: timeSlotButtons.length, delay: attempts * checkInterval });
            callback();
        } else if (attempts >= maxAttempts) {
            logger.warn('時間帯テーブルの準備がタイムアウト - 強制実行');
            callback();
        } else {
            // 時間帯テーブル待機中（ログ削減）
            setTimeout(checkTableReady, checkInterval);
        }
    };
    
    logger.debug('時間帯テーブル待機開始');
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
                    entranceReservationStateManager.updateFabDisplay();
                }, 100);
            } else {
                // フォールバック: 直接削除
                entranceReservationStateManager.clearReservationTarget();
                entranceReservationStateManager.updateFabDisplay();
            }
            
        } else {
            // 新規選択または別の時間帯への変更
            
            // DOM上の選択状態から予約対象を同期
            setTimeout(() => {
                syncReservationTargetFromDOM();
                entranceReservationStateManager.updateFabDisplay();
            }, 100);
        }
    };
    
    // グローバルに保存（後でremoveするため）
    (window as any).timeSlotClickHandler = timeSlotClickHandler;
    
    // 捕獲フェーズでイベントをキャッチ
    document.addEventListener('click', timeSlotClickHandler, true);
    
    logger.info('公式サイト仕様を利用した時間帯選択解除ハンドラーを設定');
}

// 統一自動処理管理に対応した予約処理（Phase 3で実装）
async function entranceReservationHelper(config: ReservationConfig): Promise<ReservationResult> {
    logger.info('統一自動処理管理による入場予約補助機能を開始');
    
    try {
        // 統一自動処理管理による予約処理実行
        const result = await entranceReservationStateManager.executeUnifiedReservationProcess(config);
        
        if (result.success) {
            logger.info('統一予約処理成功');
        } else if (result.cancelled) {
            logger.info('統一予約処理がキャンセル');
            entranceReservationStateManager.stop();
        } else if (result.abnormalTermination) {
            logger.error('統一予約処理異常終了');
            entranceReservationStateManager.setShouldStop(true);
        }
        
        return result;
        
    } catch (error: any) {
        if (error.name === 'CancellationError') {
            logger.info('統一予約処理が中断');
            entranceReservationStateManager.stop();
            return { success: false, attempts: 0, cancelled: true };
        } else {
            logger.error('統一予約処理でエラー', { error: error instanceof Error ? error.message : String(error) });
            throw error;
        }
    }
}

// Phase 3: 統一自動処理管理により予約処理ループを完全に置換完了

// ============================================================================

// ============================================================================
// エクスポート（統一処理移行により最小限に）
// ============================================================================
// 統一自動処理管理により個別関数は不要

// エクスポート
export {
    createEntranceReservationUI,
    getCurrentReservationTarget,
    checkVisitTimeButtonState,
    checkTimeSlotSelected,
    canStartReservation,
    checkInitialState,
    startCalendarWatcher,
    handleCalendarChange,
    waitForTimeSlotTable,
    entranceReservationHelper
};

// ============================================================================
