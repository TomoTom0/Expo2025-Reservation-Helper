// entrance-page-stateからのimport（もう使用しません）
// import { timeSlotState } from './entrance-page-state';

// 入場予約状態管理システムからのimport
import { LocationHelper, ExecutionState, entranceReservationStateManager } from './entrance-reservation-state-manager';

// entrance-page-dom-utilsからのimport
import {
    timeSlotSelectors,
    generateUniqueTdSelector,
    findSameTdElement,
    extractTdStatus
} from './entrance-page-dom-utils';

// entrance-page-fabからのimport
import { processingOverlay } from './processing-overlay';
import { entranceReservationHelper } from './entrance-page-fab';

// entrance-page-ui-helpersからのimport
import { updateMainButtonDisplay as updateMainButtonDisplayHelper } from './entrance-page-ui-helpers';

// entrance-page-ui-helpersからのimport（enableAllMonitorButtonsはこのファイル内で定義済み）

// UI更新ヘルパー関数は外部関数として設定される

// 型定義のインポート
import type { 
    TimeSlotInfo,
    TimeSlotTarget,
    CacheManager
} from '../types/index.js';

// 【5. 時間帯監視・分析システム】
// ============================================================================

// 依存注入用のcacheManager参照
let cacheManager: CacheManager | null = null;

// cacheManagerを設定するヘルパー関数
export const setCacheManager = (cm: CacheManager): void => {
    cacheManager = cm;
};

// WindowにtimeSlotCheckTimeoutプロパティを追加
declare global {
    interface Window {
        timeSlotCheckTimeout?: number;
    }
}

// 時間帯テーブルの動的生成を監視（ループ防止版）
function startTimeSlotTableObserver(): void {
    console.log('時間帯テーブルの動的生成監視を開始');
    
    let isProcessing = false; // 処理中フラグでループ防止
    let lastTableContent = ''; // 前回のテーブル内容を記録
    
    // MutationObserverで DOM変化を監視（フィルタリング強化版）
    const observer = new MutationObserver((mutations) => {
        if (isProcessing) {
            console.log('⏭️ 処理中のため変更を無視');
            return;
        }
        
        let hasRelevantChange = false;
        
        mutations.forEach((mutation) => {
            // console.log(`📊 DOM変更検出: type=${mutation.type}, target=${mutation.target.tagName}`, mutation);
            
            if (mutation.type === 'childList') {
                const addedNodes = Array.from(mutation.addedNodes);
                const removedNodes = Array.from(mutation.removedNodes);
                
                // 監視ボタン関連の変更は無視
                const isMonitorButtonChange = [...addedNodes, ...removedNodes].some(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        return element.classList?.contains('monitor-btn') ||
                               element.querySelector?.('.monitor-btn');
                    }
                    return false;
                });
                
                if (isMonitorButtonChange) {
                    console.log('🚫 監視ボタン関連の変更を無視');
                    return;
                }
                
                // 時間帯テーブル関連の変更のみ検出
                const hasTableChange = [...addedNodes, ...removedNodes].some(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as Element;
                        const isRelevant = element.tagName === 'TABLE' || 
                               element.tagName === 'TD' ||
                               element.tagName === 'IMG' || // アイコン変更も検出
                               (element.querySelector && (
                                   element.querySelector('table') ||
                                   element.querySelector('td[data-gray-out]') ||
                                   element.querySelector('div[role="button"]:not(.monitor-btn)') ||
                                   element.querySelector('img[src*="calendar_ng.svg"]') ||
                                   element.querySelector('img[src*="ico_scale"]')
                               ));
                        
                        if (isRelevant) {
                            // console.log(`🔍 テーブル関連の変更を検出: ${element.tagName}`, element);
                        }
                        return isRelevant;
                    }
                    return false;
                });
                
                if (hasTableChange) {
                    hasRelevantChange = true;
                }
            } else if (mutation.type === 'attributes') {
                // 属性変更も監視（data-disabled、src等）
                const target = mutation.target as Element;
                const attrName = mutation.attributeName;
                
                if (target.nodeType === Node.ELEMENT_NODE) {
                    const isRelevantAttr = (
                        (attrName === 'data-disabled' && target.tagName === 'DIV' && target.getAttribute('role') === 'button') ||
                        (attrName === 'src' && target.tagName === 'IMG') ||
                        (attrName === 'aria-pressed' && target.tagName === 'DIV' && target.getAttribute('role') === 'button')
                    );
                    
                    if (isRelevantAttr) {
                        // console.log(`🔄 属性変更を検出: ${attrName}=${target.getAttribute(attrName)}`, target);
                        hasRelevantChange = true;
                    }
                }
            }
        });
        
        if (hasRelevantChange) {
            // デバウンス処理
            clearTimeout(window.timeSlotCheckTimeout);
            window.timeSlotCheckTimeout = window.setTimeout(() => {
                // 現在のテーブル内容をチェック
                const currentTableContent = getCurrentTableContent();
                if (currentTableContent === lastTableContent) {
                    console.log('📋 テーブル内容に変化なし、処理をスキップ');
                    return;
                }
                
                // console.log('🔍 有効な時間帯テーブル変更を検出');
                isProcessing = true;
                
                const hasTimeSlot = checkTimeSlotTableExistsSync();
                if (hasTimeSlot) {
                    // 現在の監視ボタンの状態をチェック
                    if (shouldUpdateMonitorButtons()) {
                        console.log('🎯 監視ボタンの更新が必要です');
                        
                        setTimeout(() => {
                            // 差分更新処理（不要なボタン削除と新規ボタン追加）
                            analyzeAndAddMonitorButtons();
                            
                            // 選択状態を復元
                            setTimeout(() => {
                                restoreSelectionAfterUpdate();
                                
                                // テーブル内容を記録
                                lastTableContent = getCurrentTableContent();
                                isProcessing = false;
                            }, 200);
                        }, 300);
                    } else {
                        console.log('✅ 監視ボタンは既に適切に配置されています');
                        lastTableContent = getCurrentTableContent();
                        isProcessing = false;
                    }
                } else {
                    isProcessing = false;
                }
            }, 800);
        }
    });
    
    // 監視範囲を限定（属性変更も監視）
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['data-disabled', 'src', 'aria-pressed']
    });
    
    // 初回チェック
    setTimeout(() => {
        if (checkTimeSlotTableExistsSync()) {
            // console.log('既存の時間帯テーブルを検出');
            isProcessing = true;
            analyzeAndAddMonitorButtons(); // 差分更新で処理
            lastTableContent = getCurrentTableContent();
            isProcessing = false;
        }
    }, 1000);
    
    console.log('継続的な時間帯テーブル監視を開始しました（ループ防止版）');
}

// 時間帯テーブルの動的待機
async function waitForTimeSlotTable(timeout: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 50; // 50msで高速チェック
    
    console.log('時間帯テーブルの出現を待機中...');
    
    while (Date.now() - startTime < timeout) {
        if (checkTimeSlotTableExistsSync()) {
            console.log('時間帯テーブルを検出しました');
            return true;
        }
        
        // ランダム待機時間で次のチェック
        const waitTime = checkInterval + Math.floor(Math.random() * 200);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    console.log(`時間帯テーブルの待機がタイムアウトしました (${timeout}ms)`);
    return false;
}

// 時間帯テーブルの存在確認（同期版）
function checkTimeSlotTableExistsSync(): boolean {
    // 実際の時間帯要素をチェック（時間を含むもの）
    const allElements = document.querySelectorAll(timeSlotSelectors.timeSlotCells);
    const actualTimeSlots: Element[] = [];
    
    allElements.forEach(el => {
        const text = el.textContent?.trim();
        // 時間帯の形式をチェック（例: "9:00-", "11:00-", "13時"など）
        if (text && (text.includes(':') && text.includes('-') || text.includes('時'))) {
            actualTimeSlots.push(el);
        }
    });
    
    if (actualTimeSlots.length > 0) {
        // ログを削除
        // console.log(`✅ 実際の時間帯要素を${actualTimeSlots.length}個検出`);
        return true;
    }
    
    // console.log('❌ 実際の時間帯要素が見つかりません（カレンダー日付のみ）');
    return false;
}

// 時間帯分析とボタン追加のメイン処理
function analyzeAndAddMonitorButtons(): void {
    const analysis = analyzeTimeSlots();
    console.log('時間帯分析結果:', {
        available: analysis.available.length,
        full: analysis.full.length,
        selected: analysis.selected.length
    });
    
    // 既存のボタンとの差分を計算（時間+位置で判定）
    const existingButtons = document.querySelectorAll('.monitor-btn');
    const existingSlots = Array.from(existingButtons).map(btn => {
        const timeText = btn.getAttribute('data-target-time') || '';
        const tdElement = btn.closest('td[data-gray-out]') as HTMLTableCellElement;
        const tdSelector = tdElement ? generateUniqueTdSelector(tdElement) : '';
        return { timeText, tdSelector };
    });
    
    console.log(`📋 差分計算: 既存ボタン数=${existingButtons.length}個 vs 満員時間帯数=${analysis.full.length}個`);
    
    // 不要なボタンを削除（時間+位置で判定）
    let removedCount = 0;
    existingButtons.forEach(button => {
        const timeText = button.getAttribute('data-target-time') || '';
        const tdElement = button.closest('td[data-gray-out]') as HTMLTableCellElement;
        const tdSelector = tdElement ? generateUniqueTdSelector(tdElement) : '';
        
        // 監視対象として設定済みの場合は削除しない（状態変化を追跡するため）
        const isMonitoringTarget = false; // 監視機能は無効化済み
        
        if (isMonitoringTarget) {
            console.log(`🎯 監視対象のため保持: ${timeText} (状態変化を追跡中)`);
            
            // 監視対象の状態が変わった場合はボタンテキストを更新
            const currentTd = button.closest('td[data-gray-out]') as HTMLTableCellElement;
            const currentStatus = extractTdStatus(currentTd);
            if (currentStatus && currentStatus.isAvailable) {
                const span = button.querySelector('span') as HTMLSpanElement;
                if (span) {
                    span.innerText = '空きあり';
                    (button as HTMLElement).classList.add('btn-success-highlight');
                    console.log(`✅ 監視対象が空きありに変化: ${timeText}`);
                }
            }
        } else {
            // 現在の満員時間帯に対応するものがあるかチェック
            const stillExists = analysis.full.some(slot => {
                const slotTdElement = slot.element.closest('td[data-gray-out]') as HTMLTableCellElement;
                const slotTdSelector = generateUniqueTdSelector(slotTdElement);
                return slot.timeText === timeText && slotTdSelector === tdSelector;
            });
            
            if (!stillExists) {
                console.log(`🗑️ 不要な監視ボタンを削除: ${timeText} (位置も不一致)`);
                button.remove();
                removedCount++;
            }
        }
    });
    
    // 新しい満員時間帯にボタンを追加（時間+位置で判定）
    const newFullSlots = analysis.full.filter(slot => {
        const slotTdElement = slot.element.closest('td[data-gray-out]') as HTMLTableCellElement;
        const slotTdSelector = generateUniqueTdSelector(slotTdElement);
        return !existingSlots.some(existing => 
            existing.timeText === slot.timeText && existing.tdSelector === slotTdSelector
        );
    });
    
    if (newFullSlots.length > 0) {
        console.log(`${newFullSlots.length}個の新しい満員時間帯に監視ボタンを追加します`);
        addMonitorButtonsToFullSlots(newFullSlots);
    }
    
    // 結果サマリー
    if (analysis.full.length === 0) {
        console.log('現在満員の時間帯はありません');
        if (existingButtons.length > 0) {
            console.log(`${existingButtons.length}個の既存ボタンを削除しました`);
        }
    } else if (newFullSlots.length === 0 && removedCount === 0) {
        console.log('監視ボタンは既に適切に配置されています');
    } else {
        console.log(`✅ 監視ボタン更新完了: 削除=${removedCount}個, 追加=${newFullSlots.length}個`);
    }
}

// 時間帯の分析結果の型定義
interface AnalysisResult {
    available: TimeSlotInfo[];
    full: TimeSlotInfo[];
    selected: TimeSlotInfo[];
}

// 全時間帯の状態分析
function analyzeTimeSlots(): AnalysisResult {
    const available: TimeSlotInfo[] = [];
    const full: TimeSlotInfo[] = [];
    const selected: TimeSlotInfo[] = [];
    
    // 全てのtd要素を取得（時間帯テーブル内）
    const allTdElements = document.querySelectorAll(timeSlotSelectors.timeSlotContainer + ' td[data-gray-out]');
    
    // console.log(`📊 時間帯分析開始: ${allTdElements.length}個のtd要素を確認`);
    
    allTdElements.forEach(tdElement => {
        const status = extractTdStatus(tdElement as HTMLTableCellElement);
        if (status && status.timeText) {
            const isFull = status.isFull;
            const isAvailable = status.isAvailable;
            const isSelected = status.element.getAttribute('aria-pressed') === 'true';
            
            let statusType = 'unknown';
            if (isFull) {
                statusType = 'full';
            } else if (isSelected) {
                statusType = 'selected';
            } else if (isAvailable) {
                statusType = 'available';
            }
            
            // console.log(`📊 ${status.timeText}: ${statusType} (満員:${isFull}, 利用可能:${isAvailable}, 選択:${isSelected})`);
            
            const timeInfo: TimeSlotInfo = {
                element: status.element,
                tdElement: status.tdElement,
                timeText: status.timeText,
                isAvailable: isAvailable,
                isFull: isFull,
                tdSelector: generateUniqueTdSelector(status.tdElement)
            };
            
            if (statusType === 'full') {
                full.push(timeInfo);
            } else if (statusType === 'selected') {
                selected.push(timeInfo);
            } else if (statusType === 'available') {
                available.push(timeInfo);
            }
        }
    });
    
    // console.log(`📊 分析結果: 利用可能=${available.length}, 満員=${full.length}, 選択=${selected.length}`);
    
    return { available, full, selected };
}

// 時間帯要素から情報を抽出
function extractTimeSlotInfo(buttonElement: HTMLElement): TimeSlotInfo | null {
    const tdElement = buttonElement.closest('td') as HTMLTableCellElement;
    if (!tdElement) return null;
    
    // 時間テキストを取得
    const timeSpan = buttonElement.querySelector('dt span') as HTMLSpanElement;
    const timeText = timeSpan ? timeSpan.textContent?.trim() || '' : '';
    
    // デバッグ用：要素の状態を詳細表示
    const dataDisabled = buttonElement.getAttribute('data-disabled');
    const ariaPressed = buttonElement.getAttribute('aria-pressed');
    
    // アイコンによる満員判定（calendar_ng.svgが最も確実）
    const fullIcon = buttonElement.querySelector('img[src*="calendar_ng.svg"]');
    const lowIcon = buttonElement.querySelector('img[src*="ico_scale_low.svg"]');
    const highIcon = buttonElement.querySelector('img[src*="ico_scale_high.svg"]');
    
    let iconType = 'unknown';
    let isAvailable = false;
    let isFull = false;
    
    // アイコンベースでの判定
    if (fullIcon) {
        iconType = 'full';
        isFull = true;
    } else if (highIcon) {
        iconType = 'high';
        isAvailable = true;
    } else if (lowIcon) {
        iconType = 'low';
        isAvailable = true;
    }
    
    // data-disabled属性での追加確認
    if (dataDisabled === 'true') {
        isFull = true;
        isAvailable = false;
    }
    
    // デバッグ情報
    console.log(`時間帯解析: ${timeText} - isFull: ${isFull}, isAvailable: ${isAvailable}, iconType: ${iconType}, disabled: ${dataDisabled}, pressed: ${ariaPressed}, hasFullIcon: ${!!fullIcon}`);
    
    return {
        element: buttonElement,
        tdElement: tdElement,
        timeText: timeText,
        isAvailable: isAvailable,
        isFull: isFull,
        tdSelector: generateSelectorForElement(buttonElement)
    };
}

// 要素のセレクタを生成（フォールバック用）
function generateSelectorForElement(element: HTMLElement): string {
    const timeSpan = element.querySelector('dt span') as HTMLSpanElement;
    const timeText = timeSpan ? timeSpan.textContent?.trim() || '' : '';
    return `td[data-gray-out] div[role='button'] dt span:contains('${timeText}')`;
}

// 満員時間帯にモニタリングボタンを追加（監視機能削除により無効化）
function addMonitorButtonsToFullSlots(_fullSlots: TimeSlotInfo[]): void {
    // 監視機能は削除されました - 満員時間帯も直接予約可能になったため監視不要
    return;
}

// 監視ボタンのテキストを決定（優先順位表示）
function getMonitorButtonText(slotInfo: TimeSlotInfo): string {
    const tdElement = slotInfo.element.closest('td[data-gray-out]') as HTMLTableCellElement;
    const tdSelector = generateUniqueTdSelector(tdElement);
    
    // 既に監視対象として選択されているかチェック
    const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
    const isSelected = false || false;
    
    if (isSelected) {
        // 監視対象リストでの位置を取得（1ベース）
        const targets: any[] = []; // 監視機能は無効化済み
        const targetIndex = targets.findIndex(
            (target: any) => target.timeSlot === slotInfo.timeText && target.locationIndex === locationIndex
        );
        
        if (targetIndex >= 0) {
            const priority = targetIndex + 1; // 1ベースの優先順位
            return `監視${priority}`;
        }
    }
    
    return '満員';
}

// すべての監視ボタンの優先順位を更新
function updateAllMonitorButtonPriorities(): void {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    const targets: any[] = []; // 監視機能は無効化済み
    
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span') as HTMLSpanElement;
        const timeText = button.getAttribute('data-target-time') || '';
        
        if (span && timeText) {
            // このボタンの時間帯と位置情報を特定
            const tdElement = button.closest('td[data-gray-out]') as HTMLTableCellElement;
            if (tdElement) {
                const tdSelector = generateUniqueTdSelector(tdElement);
                
                // 監視対象リストでの位置を検索
                const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
                const targetIndex = targets.findIndex(
                    (target: any) => target.timeSlot === timeText && target.locationIndex === locationIndex
                );
                
                if (targetIndex >= 0) {
                    // 監視対象として選択されている場合、優先順位を表示
                    const priority = targetIndex + 1;
                    span.innerText = `監視${priority}`;
                    (button as HTMLElement).classList.remove('full-status');
                    (button as HTMLElement).classList.add('monitoring-status');
                } else {
                    // 監視対象でない場合は「満員」
                    span.innerText = '満員';
                    (button as HTMLElement).classList.remove('monitoring-status');
                    (button as HTMLElement).classList.add('full-status');
                }
            }
        }
    });
    
    console.log(`✅ すべての監視ボタンの優先順位を更新しました (${targets.length}個の監視対象)`);
}

// 個別監視ボタンの作成（満員要素のみ）
function createMonitorButton(slotInfo: TimeSlotInfo): void {
    const { element, timeText } = slotInfo;
    
    // 満員要素以外にはボタンを追加しない
    if (!slotInfo.isFull) {
        console.log(`満員ではないためボタンを追加しません: ${timeText} (isFull: ${slotInfo.isFull})`);
        return;
    }
    
    // dt要素を探す
    const dtElement = element.querySelector('dt');
    if (!dtElement) {
        console.log(`dt要素が見つかりません: ${timeText}`);
        return;
    }
    
    // 既にボタンが存在するかチェック
    const existingButton = dtElement.querySelector('.monitor-btn');
    if (existingButton) {
        console.log(`監視ボタンは既に存在します: ${timeText}`);
        return;
    }
    
    // 監視ボタンを作成（満員要素のクリック制限を回避）
    const monitorButton = document.createElement('button');
    monitorButton.classList.add('ext-ytomo', 'monitor-btn');
    monitorButton.setAttribute('data-target-time', timeText);
    
    // ボタンテキストとイベントリスナー
    const buttonSpan = document.createElement('span');
    buttonSpan.classList.add('ext-ytomo');
    
    // 優先順位形式でボタンテキストを設定
    const buttonText = getMonitorButtonText(slotInfo);
    buttonSpan.innerText = buttonText;
    monitorButton.appendChild(buttonSpan);
    
    // クリックイベント（確実な処理のため）
    monitorButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        
        const tdElement = slotInfo.element.closest('td[data-gray-out]') as HTMLTableCellElement;
        const tdSelector = generateUniqueTdSelector(tdElement);
        const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
        const location = LocationHelper.getLocationFromIndex(locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        console.log(`🖱️ 監視ボタンクリック検出: ${locationText}${slotInfo.timeText}`);
        
        // ボタン要素の確認
        const span = monitorButton.querySelector('span') as HTMLSpanElement;
        console.log(`現在のボタンテキスト: "${span?.innerText}"`);
        console.log(`ボタンdisabled状態: ${monitorButton.disabled}`);
        
        handleMonitorButtonClick(slotInfo, monitorButton);
    }, true); // useCapture = true で確実にキャッチ
    
    // マウスイベントも制御
    monitorButton.addEventListener('mousedown', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    });
    
    // ダブルクリック防止
    monitorButton.addEventListener('dblclick', (event) => {
        event.preventDefault();
        event.stopPropagation();
    });
    
    monitorButton.addEventListener('mouseup', (event) => {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
    });
    
    // 初期状態のクラス設定（満員状態）
    const initialButtonText = getMonitorButtonText(slotInfo);
    if (initialButtonText.startsWith('監視')) {
        monitorButton.classList.add('monitoring-status');
    } else {
        monitorButton.classList.add('full-status');
    }
    
    // dt要素内に追加（spanの後）
    dtElement.appendChild(monitorButton);
    
    // 満員時間帯に監視ボタンを追加完了
}

// 監視ボタンクリック処理（選択・解除切り替え）
function handleMonitorButtonClick(slotInfo: TimeSlotInfo, buttonElement: HTMLButtonElement): void {
    const tdElement = slotInfo.element.closest('td[data-gray-out]') as HTMLTableCellElement;
    const tdSelector = generateUniqueTdSelector(tdElement);
    const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
    const location = LocationHelper.getLocationFromIndex(locationIndex);
    const locationText = location === 'east' ? '東' : '西';
    // 監視ボタンがクリックされました
    
    // 監視実行中は操作不可
    if (false) {
        // 監視実行中のため操作不可
        return;
    }
    
    const buttonSpan = buttonElement.querySelector('span') as HTMLSpanElement;
    const currentText = buttonSpan.innerText;
    const isCurrentlySelected = currentText.startsWith('監視'); // '監視1', '監視2' etc.
    
    // 現在の状態確認完了
    
    if (isCurrentlySelected) {
        // 現在選択中の場合は解除
        // 監視対象を解除
        
        // 入場予約状態管理システムから削除
        if (entranceReservationStateManager) {
            // 監視機能は無効化済み - 監視対象削除不要
        } else {
            // 入場予約状態管理システムが利用できません
        }
        
        // ボタンの表示を元に戻す
        buttonSpan.innerText = '満員';
        buttonElement.classList.remove('monitoring-status');
        buttonElement.classList.add('full-status');
        buttonElement.classList.add('js-enabled');
        buttonElement.disabled = false;
        
        // 監視対象がすべてなくなった場合の処理
        if (!entranceReservationStateManager || !false) {
            // EntranceReservationStateManagerで統合管理されているため、個別設定不要
            
            // キャッシュをクリア
            if (cacheManager) {
                cacheManager.clearTargetSlots();
                cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
            }
            
            // 他のボタンを有効化
            enableAllMonitorButtons();
        } else {
            // キャッシュを更新（残りの監視対象で）
            if (cacheManager) {
                cacheManager.saveTargetSlots();
            }
            
            // 残りのボタンの優先順位を更新
            updateAllMonitorButtonPriorities();
        }
        
        // メインボタンの表示を更新
        updateMainButtonDisplayHelper();
        
        
        // 監視対象を解除完了
    } else {
        // 現在未選択の場合は選択
        // 監視対象を追加
        
        // 選択状態を設定（td要素の一意特定情報を追加）
        // TypeScript用の変数（削除予定）
        // const targetSlotInfo: TimeSlotTarget = {
        //     ...slotInfo,
        //     // td要素の一意特定情報を追加
        //     tdSelector: generateUniqueTdSelector(tdElement),
        //     positionInfo: getTdPositionInfo(tdElement)
        // };
        
        // 入場予約状態管理システムに追加（一元管理）
        let added = false;
        if (entranceReservationStateManager) {
            // 既に監視対象に含まれている場合は解除処理を行う
            const isAlreadyMonitoring = false; // 監視機能は無効化済み
            
            if (isAlreadyMonitoring) {
                console.log(`🗑️ 監視対象解除: ${locationText}${slotInfo.timeText}`);
                const removed = entranceReservationStateManager.removeMonitoringTarget(slotInfo.timeText, locationIndex);
                if (removed) {
                    // ボタンを満員状態に戻す
                    buttonSpan.innerText = '満員';
                    buttonElement.classList.remove('monitoring-status');
                    buttonElement.classList.add('full-status');
                    
                    // キャッシュ更新
                    if (cacheManager) {
                        cacheManager.saveTargetSlots();
                    }
                    
                    // メインボタン更新
                    updateMainButtonDisplayHelper();
                    console.log(`✅ 監視対象解除完了: ${locationText}${slotInfo.timeText}`);
                }
                return; // 解除処理完了
            }
            
            // 新規追加処理
            added = entranceReservationStateManager.addMonitoringTarget(slotInfo.timeText, locationIndex, tdSelector);
            if (added) {
                console.log(`✅ 入場予約状態管理に監視対象を追加: ${locationText}${slotInfo.timeText}`);
            } else {
                console.log(`⚠️ 入場予約状態管理への追加失敗: ${locationText}${slotInfo.timeText}`);
                return;
            }
        } else {
            // 入場予約状態管理システムが利用できません
            return;
        }
        
        if (!added) return; // 追加失敗時は処理を中止
        
        // EntranceReservationStateManagerで統合管理されているため、個別設定不要
        
        // キャッシュに保存（すべての監視対象を保存）
        if (cacheManager) {
            cacheManager.saveTargetSlots();
        }
        
        // ボタンの表示を変更（優先順位表示）
        if (entranceReservationStateManager) {
            const targets: any[] = []; // 監視機能は無効化済み
            const target = targets.find((t: any) => t.timeSlot === slotInfo.timeText && t.selector === tdSelector);
            const priority = target ? target.priority : targets.length;
            buttonSpan.innerText = `監視${priority}`;
        } else {
            buttonSpan.innerText = '監視1'; // フォールバック
        }
        buttonElement.classList.remove('full-status');
        buttonElement.classList.add('monitoring-status');
        buttonElement.classList.add('js-enabled');
        buttonElement.disabled = false; // クリックで解除できるように
        
        // メインボタンの表示を更新
        if (entranceReservationStateManager) {
            const targets: any[] = []; // 監視機能は無効化済み
            const targetCount = targets.length;
            console.log(`🔄 監視対象設定後のFAB更新を実行: targetSlots=${targetCount}個`);
            console.log('📊 入場予約状態管理の監視対象一覧:', targets.map((t: any) => `${LocationHelper.getLocationFromIndex(t.locationIndex) === 'east' ? '東' : '西'}${t.timeSlot}`));
        }
        updateMainButtonDisplayHelper();
        
        
        // 更新後の状態も確認
        setTimeout(() => {
            const fabButton = document.querySelector('#ytomo-main-fab') as HTMLButtonElement;
            console.log(`🔍 FAB更新後の状態: disabled=${fabButton?.disabled}, hasDisabledAttr=${fabButton?.hasAttribute('disabled')}, text="${fabButton?.textContent?.trim()}"`);
        }, 100);
        
        // 時間帯を監視対象に設定完了
    }
}

// 満員時間帯の可用性監視を開始
async function startSlotMonitoring(): Promise<void> {
    if (!entranceReservationStateManager || !false) {
        console.log('❌ 監視対象時間帯が設定されていません');
        return;
    }
    
    // 状態確認（監視開始は呼び出し元で既に実行済み）
    const currentState = entranceReservationStateManager.getExecutionState();
    console.log(`📊 監視開始処理開始時の実行状態: ${currentState}`);
    
    if (currentState !== 'monitoring_running') {
        console.log('⚠️ 監視状態になっていません - 処理を中止');
        return;
    }
    
    // UI更新（監視開始状態を反映）- カウントダウン保護機能付き
    updateMainButtonDisplayHelper();
    
    
    // 誤動作防止オーバーレイを表示
    processingOverlay.show('monitoring');
    
    // 監視実行中は全ての監視ボタンを無効化
    disableAllMonitorButtons();
    
    // 対象一貫性検証
    if (!entranceReservationStateManager.validateTargetConsistency()) {
        console.error('🚨 監視対象が変更されたため処理を中断します');
        entranceReservationStateManager.stop();
        return;
    }
    
    const targets: any[] = []; // 監視機能は無効化済み
    const targetTexts = targets.map((t: any) => {
        const location = LocationHelper.getLocationFromIndex(t.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        return `${locationText}${t.timeSlot}`;
    }).join(', ');
    console.log(`🔄 時間帯監視を開始: ${targetTexts} (${targets.length}個)`);
    
    // 監視対象をキャッシュに保存（リロード後の復元用）
    if (cacheManagerSection6 && targets.length > 0) {
        try {
            const currentDate = getCurrentSelectedCalendarDate();
            if (currentDate) {
                // キャッシュに保存（統一状態管理システムから自動取得）
                
                cacheManagerSection6.saveTargetSlots();
                console.log(`💾 監視対象をキャッシュに保存: ${targets.length}個`);
            } else {
                console.log('⚠️ カレンダー日付が不明のためキャッシュ保存をスキップ');
            }
        } catch (error) {
            console.error('❌ 監視対象キャッシュ保存エラー:', error);
        }
    }
    
    // 監視は一回のチェック→リロード→新しいページで再開のサイクル
    // 定期インターバルは不要（リロード間隔と同じため無意味）
    setTimeout(() => {
        checkSlotAvailabilityAndReload();
    }, 500);
}

// 時間帯の可用性チェックとページ再読み込み
async function checkSlotAvailabilityAndReload(): Promise<void> {
    if (!entranceReservationStateManager || entranceReservationStateManager.getExecutionState() !== ExecutionState.MONITORING_RUNNING) {
        return;
    }
    
    // バリデーションチェック
    if (!validatePageLoaded()) return;
    if (!(await checkTimeSlotTableExistsAsync())) return;
    
    // 複数監視対象の存在チェック
    const targets: any[] = []; // 監視機能は無効化済み
    for (const target of targets) {
        if (!checkMonitoringTargetExists(target)) return;
    }
    if (!checkMaxReloads(entranceReservationStateManager.getRetryCount())) return;
    
    entranceReservationStateManager.incrementRetryCount();
    if (cacheManager) {
        cacheManager.updateRetryCount(entranceReservationStateManager.getRetryCount());
    }
    
    const targetTexts = targets.map((t: any) => t.timeSlot).join(', ');
    console.log(`🔍 可用性チェック (${entranceReservationStateManager.getRetryCount()}回目): ${targetTexts}`);
    
    // 現在の時間帯をチェック
    const currentSlot = findTargetSlotInPageUnified();
    
    console.log(`📊 監視チェック結果: currentSlot=${!!currentSlot}, status=${currentSlot?.status}`);
    
    if (currentSlot && currentSlot.status === 'available') {
        const location = LocationHelper.getLocationFromIndex(currentSlot.targetInfo.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        console.log(`🎉🎉 対象時間帯が利用可能になりました！: ${locationText}${currentSlot.targetInfo.timeSlot}`);
        
        // 自動リロードかどうかを判定（監視継続フラグの存在で判断）
        const isAutoReload = false || false;
        
        if (isAutoReload) {
            console.log(`  → 自動リロード: 監視を終了し、自動選択+予約を開始します`);
            
            // ボタン表示を更新（見つかりましたモード）
            window.dispatchEvent(new CustomEvent('entrance-ui-update', { 
                detail: { type: 'main-button', mode: 'found-available' } 
            }));
            
            // 自動選択
            window.dispatchEvent(new CustomEvent('entrance-auto-select', { 
                detail: { slot: currentSlot } 
            }));
        } else {
            console.log(`  → 手動リロード: ステータス表示+監視対象削除+予約対象化`);
            
            // ステータスバッジに空き検出を表示
            const statusBadge = document.querySelector('#ytomo-status-badge') as HTMLElement;
            if (statusBadge) {
                statusBadge.innerText = `監視対象に空きが出ました\n${locationText}${currentSlot.targetInfo.timeSlot}`;
                statusBadge.classList.remove('js-hide');
            }
            
            // 該当監視対象を削除
            entranceReservationStateManager?.removeMonitoringTarget(
                currentSlot.targetInfo.timeSlot, 
                currentSlot.targetInfo.locationIndex
            );
            
            // 優先度最高の空き時間帯を予約対象として自動選択（自動予約は行わない）
            await handleManualReloadAvailableSlot(currentSlot);
        }
        return;
    }
    
    // まだ満員の場合はページリロード
    console.log('⏳ すべての監視対象がまだ満員です。ページを再読み込みします...');
    
    let totalWaitTime: number;
    let displaySeconds: number;
    
    // 効率モード時は00秒/30秒に同期、通常時は従来のランダム要素付き
    if (entranceReservationStateManager.isEfficiencyModeEnabled()) {
        // 次の00秒または30秒までの時間を計算
        let nextTarget = entranceReservationStateManager.getNextSubmitTarget();
        if (nextTarget) {
            let remainingMs = nextTarget.getTime() - Date.now();
            
            // 15秒未満の場合は30秒加算
            if (remainingMs < 15000) {
                console.log(`⚡ 効率監視: 猶予${Math.floor(remainingMs/1000)}秒は短いため30秒加算`);
                remainingMs += 30000; // 単純に30秒(30000ms)加算
                console.log(`🕒 加算後猶予: ${Math.floor(remainingMs/1000)}秒`);
            }
            
            totalWaitTime = Math.max(1000, remainingMs); // 最低1秒
            displaySeconds = Math.floor(totalWaitTime / 1000);
        } else {
            // 標的時刻が設定されていない場合は通常処理
            const baseInterval = 30000;
            const randomVariation = Math.random() * 5000;
            totalWaitTime = baseInterval + randomVariation;
            displaySeconds = Math.floor(totalWaitTime / 1000);
        }
    } else {
        // 通常モード: BAN対策のランダム要素付き
        const baseInterval = 30000; // 30000ms (30秒)
        const randomVariation = Math.random() * 5000; // 0-5秒のランダム要素
        totalWaitTime = baseInterval + randomVariation;
        displaySeconds = Math.floor(totalWaitTime / 1000);
    }
    
    // カウントダウンとリロードを統一実行（フラグ保存処理付き）
    scheduleReload(displaySeconds);
}


// 入場予約状態管理対応版の監視対象検索関数
function findTargetSlotInPageUnified(): any {
    if (!entranceReservationStateManager || !false) {
        return null;
    }
    
    const targets: any[] = []; // 監視機能は無効化済み
    
    // 複数監視対象をチェック
    for (const target of targets) {
        // selectorが保存されている場合はそれを使用、ない場合は検索
        let targetTd: HTMLTableCellElement | null = null;
        if (target.selector) {
            targetTd = document.querySelector(target.selector) as HTMLTableCellElement;
        } else {
            // selectorがない場合は、時間帯とlocationIndexから要素を検索
            const timeElements = document.querySelectorAll('.time-text');
            for (const timeEl of timeElements) {
                if (timeEl.textContent?.includes(target.timeSlot)) {
                    const tdElement = timeEl.closest('td[data-gray-out]') as HTMLTableCellElement;
                    if (tdElement) {
                        const elementIndex = LocationHelper.getIndexFromElement(tdElement);
                        if (elementIndex === target.locationIndex) {
                            targetTd = tdElement;
                            break;
                        }
                    }
                }
            }
        }
        
        if (targetTd) {
            // 同一td要素の現在の状態を取得
            const currentStatus = extractTdStatus(targetTd);
            const location = LocationHelper.getLocationFromIndex(target.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            
            // 利用可能になったかチェック
            if (currentStatus && currentStatus.isAvailable) {
                console.log(`🎉 監視対象要素が利用可能になりました！: ${locationText}${target.timeSlot}`);
                console.log(`  → 監視を終了して自動選択を開始します`);
                return { ...currentStatus, targetInfo: target, status: 'available' };
            } else if (currentStatus && currentStatus.isFull) {
                console.log(`⏳ 監視対象要素はまだ満員: ${locationText}${target.timeSlot}`);
            } else {
                // 満員でも利用可能でもない場合（通常は満員状態での監視継続）
                if (currentStatus) {
                    console.log(`🔍 監視継続中: ${locationText}${target.timeSlot} (満員:${currentStatus.isFull}, 利用可能:${currentStatus.isAvailable}, 選択:${currentStatus.isSelected})`);
                } else {
                    console.log(`❓ 監視対象要素の状態が不明: ${locationText}${target.timeSlot} (status取得失敗)`);
                }
            }
        } else {
            // 要素が見つからない場合
            const location = LocationHelper.getLocationFromIndex(target.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            console.log(`❌ 監視対象要素が見つかりません: ${locationText}${target.timeSlot}`);
        }
    }
    
    // すべて満員または見つからない場合
    console.log('⏳ すべての監視対象要素はまだ満員です');
    return null;
}

// 異常終了処理の統一関数
function terminateMonitoring(errorCode: string, errorMessage: string): void {
    console.error(`[監視異常終了] ${errorCode}: ${errorMessage}`);
    
    // 状態クリア
    if (cacheManager) {
        cacheManager.clearTargetSlots();
        cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
    }
    
    // 入場予約状態管理システムでインターバル停止と状態リセット
    if (entranceReservationStateManager) {
        entranceReservationStateManager.clearMonitoringInterval();
        entranceReservationStateManager.stop();
    }
    
    // UI状態リセット
    resetMonitoringUI();
    updateMainButtonDisplayHelper();
    
    // エラー表示
    showErrorMessage(errorMessage);
    
    // 入場予約状態管理で監視停止
    if (entranceReservationStateManager) {
        entranceReservationStateManager.stop();
        console.log('🛑 入場予約状態管理で監視を停止しました');
    }
    
    // 入場予約状態管理をクリア
    if (entranceReservationStateManager) {
        entranceReservationStateManager.clearAllTargets();
    }
    
    // リトライ回数もEntranceReservationStateManagerでリセット
    if (entranceReservationStateManager) {
        entranceReservationStateManager.resetRetryCount();
    }
}

// 監視バリデーション関数群
function checkTargetElementExists(targetInfo: TimeSlotTarget): boolean {
    const element = findSameTdElement(targetInfo);
    if (!element) {
        terminateMonitoring('ERROR_TARGET_NOT_FOUND', 
            `監視対象の時間帯 ${targetInfo.timeText} が見つかりません`);
        return false;
    }
    return true;
}

// 入場予約状態管理用の監視対象存在チェック
function checkMonitoringTargetExists(target: any): boolean {
    // MonitoringTargetをTimeSlotTarget形式に変換
    const targetInfo = {
        timeText: target.timeSlot,
        tdSelector: target.selector
    };
    
    const element = findSameTdElement(targetInfo);
    if (!element) {
        terminateMonitoring('ERROR_TARGET_NOT_FOUND', 
            `監視対象の時間帯 ${target.timeSlot} が見つかりません`);
        return false;
    }
    return true;
}

async function checkTimeSlotTableExistsAsync(): Promise<boolean> {
    const table = document.querySelector(timeSlotSelectors.timeSlotContainer);
    if (!table) {
        // テーブルが見つからない場合、カレンダークリックを試行
        console.log('⚠️ 時間帯テーブルが見つからないため、カレンダークリックを試行します');
        const calendarClicked = await tryClickCalendarForTimeSlot();
        if (calendarClicked) {
            // カレンダークリック後、再度テーブルをチェック
            const tableAppeared = await waitForTimeSlotTable(3000);
            if (tableAppeared) {
                console.log('✅ カレンダークリック後にテーブルが表示されました');
                return true;
            }
        }
        
        terminateMonitoring('ERROR_TABLE_NOT_FOUND', 
            '時間帯選択テーブルが見つかりません（カレンダークリック後も表示されず）');
        return false;
    }
    return true;
}

function validatePageLoaded(): boolean {
    // URL確認
    if (!window.location.href.includes('ticket_visiting_reservation')) {
        terminateMonitoring('ERROR_WRONG_PAGE', 
            '予期しないページに遷移しました');
        return false;
    }
    
    // 基本要素の存在確認
    const mainContent = document.querySelector('#__next');
    if (!mainContent) {
        terminateMonitoring('ERROR_PAGE_LOAD_FAILED', 
            'ページの読み込みが完了していません');
        return false;
    }
    
    return true;
}

function checkMaxReloads(currentCount: number): boolean {
    const MAX_RELOAD_COUNT = 100; // 50分間（30秒×100回）
    if (currentCount >= MAX_RELOAD_COUNT) {
        terminateMonitoring('ERROR_MAX_RETRIES_REACHED', 
            `最大試行回数 ${MAX_RELOAD_COUNT} に達しました`);
        return false;
    }
    return true;
}

// 手動リロード時の空き時間帯処理
async function handleManualReloadAvailableSlot(_availableSlot: any): Promise<void> {
    try {
        console.log(`🎯 手動リロード: 優先度最高の空き時間帯を予約対象化`);
        
        // 利用可能な時間帯一覧を取得
        const availableSlots = getAllAvailableTimeSlots();
        if (availableSlots.length === 0) {
            console.log('⚠️ 利用可能な時間帯がありません');
            return;
        }
        
        // 優先度最高（最も早い時間）を選択
        const highestPrioritySlot = availableSlots[0];
        console.log(`🥇 最優先時間帯を選択: ${highestPrioritySlot.timeText}`);
        
        // 該当時間帯をクリックして予約対象に設定
        const targetElement = document.querySelector(highestPrioritySlot.tdSelector) as HTMLElement;
        if (targetElement) {
            const timeSlotButton = targetElement.querySelector('div[role="button"]') as HTMLElement;
            if (timeSlotButton) {
                console.log(`🖱️ 時間帯をクリック: ${highestPrioritySlot.timeText}`);
                timeSlotButton.click();
                
                // 少し待機してから状態を確認
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // 予約対象として設定されたことを確認
                const locationIndex = highestPrioritySlot.locationIndex || 0;
                entranceReservationStateManager?.setReservationTarget(
                    highestPrioritySlot.timeText, 
                    locationIndex, 
                    highestPrioritySlot.tdSelector
                );
                
                console.log(`✅ 予約対象に設定完了: ${highestPrioritySlot.timeText}`);
            }
        }
        
    } catch (error) {
        console.error('❌ 手動リロード処理エラー:', error);
    }
}

// 利用可能な全時間帯を取得
function getAllAvailableTimeSlots(): any[] {
    const slots: any[] = [];
    const allElements = document.querySelectorAll(timeSlotSelectors.timeSlotCells);
    
    allElements.forEach(element => {
        const status = extractTimeSlotInfo(element as HTMLElement);
        // 満員時間帯も予約対象として許可（強制選択機能）
        if (status && status.isAvailable) {
            const tdElement = element.closest('td[data-gray-out]') as HTMLTableCellElement;
            if (tdElement) {
                const locationIndex = Array.from(tdElement.parentElement?.children || []).indexOf(tdElement);
                slots.push({
                    timeText: status.timeText,
                    tdSelector: generateUniqueTdSelector(tdElement),
                    locationIndex: locationIndex,
                    element: element,
                    status: status
                });
            }
        }
    });
    
    // 時間順（早い時間が優先）でソート
    return slots.sort((a, b) => a.timeText.localeCompare(b.timeText));
}

// エクスポート
export {
    startTimeSlotTableObserver,
    waitForTimeSlotTable,
    checkTimeSlotTableExistsSync,
    analyzeAndAddMonitorButtons,
    analyzeTimeSlots,
    extractTimeSlotInfo,
    generateSelectorForElement,
    addMonitorButtonsToFullSlots,
    getMonitorButtonText,
    updateAllMonitorButtonPriorities,
    createMonitorButton,
    handleMonitorButtonClick,
    startSlotMonitoring,
    checkSlotAvailabilityAndReload,
    findTargetSlotInPageUnified,
    terminateMonitoring,
    checkTargetElementExists,
    checkMonitoringTargetExists,
    checkTimeSlotTableExistsAsync,
    validatePageLoaded,
    checkMaxReloads,
    getCurrentSelectedCalendarDate,
    waitForValidCalendarDate,
    clickCalendarDate,
    tryClickCalendarForTimeSlot,
    showErrorMessage,
    resetMonitoringUI,
    enableAllMonitorButtons,
    getCurrentTableContent,
    shouldUpdateMonitorButtons,
    restoreSelectionAfterUpdate,
    selectTimeSlotAndStartReservation,
    stopSlotMonitoring,
    getCurrentEntranceConfig
};

// 【6. カレンダー・UI状態管理】（entrance-page-ui.tsから統合）
// ============================================================================

// 依存注入用の参照
let cacheManagerSection6: CacheManager | null = null;

// cacheManagerを設定するヘルパー関数
export const setCacheManagerForSection6 = (cm: CacheManager): void => {
    cacheManagerSection6 = cm;
};

// entranceReservationHelperを設定するヘルパー関数（互換性のため保持）
export const setEntranceReservationHelper = (helper: Function): void => {
    // 必要な場合は、entrance-page-coreに設定
    console.log('setEntranceReservationHelper called:', typeof helper);
};


// メインボタンの表示更新（FAB形式対応）
// FAB更新の状態管理（削除済み - entrance-page-ui-helpersで管理）

// 現在のFAB状態を文字列として取得
export function getCurrentFabState(): string {
    if (!entranceReservationStateManager) return 'no-manager';
    
    const mode = getCurrentMode();
    const executionState = entranceReservationStateManager.getExecutionState();
    const hasReservation = entranceReservationStateManager.hasReservationTarget();
    const hasMonitoring = false;
    
    // 監視対象の実際の内容を含める
    const monitoringTargets: any[] = []; // 監視機能は無効化済み
    const monitoringContent = monitoringTargets
        .map((target: any) => `${target.locationIndex}:${target.timeSlot}`)
        .sort()
        .join('|');
    
    return `${mode}-${executionState}-${hasReservation}-${hasMonitoring}-${monitoringContent}`;
}

// 古いupdateMainButtonDisplay関数は削除され、entrance-page-ui-helpersの関数を使用

// 現在のモードを取得するヘルパー関数（予約優先ロジック組み込み）
export function getCurrentMode(): string {
    // 入場予約状態管理システムを取得（必須）
    if (!entranceReservationStateManager) {
        console.warn('⚠️ EntranceReservationStateManager が利用できません');
        return 'idle';
    }
    
    // ページローディング状態の確認
    if (entranceReservationStateManager.isPageLoading()) {
        return 'loading';
    }
    
    // 入場予約状態管理システムの実行状態を確認
    const executionState = entranceReservationStateManager.getExecutionState();
    
    switch (executionState) {
        case 'reservation_running':
            return 'reservation-running';
        case 'monitoring_running':
            return 'monitoring';
        case 'idle':
            // 推奨アクションを確認
            const preferredAction = entranceReservationStateManager.getPreferredAction();
            switch (preferredAction) {
                case 'reservation':
                    return 'idle'; // 予約可能状態
                case 'monitoring':
                    return 'selecting'; // 監視準備完了
                default:
                    return 'idle';
            }
        default:
            return 'idle';
    }
}

// ステータスバッジの更新
export function updateStatusBadge(mode: string): void {
    const statusBadge = document.querySelector('#ytomo-status-badge') as HTMLElement;
    if (!statusBadge) return;
    
    let message = '';
    let bgClass = 'status-bg-default';
    
    switch (mode) {
        case 'monitoring':
            const isEfficiencyEnabled = entranceReservationStateManager?.isEfficiencyModeEnabled();
            
            message = '監視実行中';
            const remainingSeconds = entranceReservationStateManager.getReloadSecondsRemaining();
            if (remainingSeconds !== null && remainingSeconds !== undefined) {
                if (remainingSeconds <= 3) {
                    message = `${isEfficiencyEnabled ? '効率' : ''}監視中`;
                    bgClass = 'status-bg-red'; // 赤色（中断不可）
                } else {
                    message = `${isEfficiencyEnabled ? '効率' : ''}監視中`;
                    bgClass = 'status-bg-orange'; // オレンジ色
                }
            } else {
                message = `${isEfficiencyEnabled ? '効率' : ''}監視実行中`;
                bgClass = 'status-bg-orange'; // オレンジ色
            }
            break;
            
        case 'reservation-running':
            // 効率モードON時は標的時刻カウントダウン、通常時は経過時間と回数
            if (entranceReservationStateManager.isEfficiencyModeEnabled()) {
                const nextTarget = entranceReservationStateManager.getNextSubmitTarget();
                if (nextTarget) {
                    const remainingMs = nextTarget.getTime() - Date.now();
                    const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
                    message = `効率予約実行中\n${remainingSeconds}秒後`;
                    bgClass = 'status-bg-orange'; // オレンジ色
                } else {
                    message = '効率予約実行中';
                    bgClass = 'status-bg-orange';
                }
            } else {
                // 通常モード: 経過時間と回数を表示
                const startTime = entranceReservationStateManager.getReservationStartTime();
                const elapsedMinutes = startTime ? 
                    Math.floor((Date.now() - startTime) / 60000) : 0;
                const attempts = entranceReservationStateManager.getAttempts();
                message = `予約実行中\n${elapsedMinutes}分 ${attempts}回`;
                bgClass = 'status-bg-orange'; // オレンジ色
            }
            break;
            
        case 'selecting':
            message = '監視準備完了';
            bgClass = 'status-bg-blue'; // 緑色
            break;
            
        case 'found-available':
            message = '空きあり検出！\n予約実行中';
            bgClass = 'status-bg-green'; // 明るい緑色
            break;
            
        case 'loading':
            message = '情報読み込み中...';
            bgClass = 'status-bg-default'; // グレー色
            break;
            
        case 'waiting':
            message = '待機中';
            bgClass = 'status-bg-default'; // グレー色
            break;
            
        case 'idle':
        default:
            message = '待機中';
            bgClass = 'status-bg-default'; // 黒色
            break;
    }
    
    if (message) {
        statusBadge.innerText = message;
        
        // 既存の背景色クラスを削除してから新しいクラスを追加
        statusBadge.className = statusBadge.className.replace(/status-bg-\w+/g, '');
        statusBadge.classList.add(bgClass);
        
        statusBadge.classList.remove('js-hide');
        
        // 効率モードの5秒前警告（予約実行中・監視中両方）
        if ((mode === 'reservation-running' || mode === 'monitoring') && entranceReservationStateManager.isEfficiencyModeEnabled()) {
            const nextTarget = entranceReservationStateManager.getNextSubmitTarget();
            if (nextTarget) {
                const remainingMs = nextTarget.getTime() - Date.now();
                const remainingSeconds = Math.max(0, Math.floor(remainingMs / 1000));
                if (remainingSeconds <= 5) {
                    statusBadge.classList.add('countdown-warning');
                } else {
                    statusBadge.classList.remove('countdown-warning');
                }
            }
        } else {
            statusBadge.classList.remove('countdown-warning');
        }
    } else {
        // 状態管理システムによる更新に委譲
        if (entranceReservationStateManager) {
            entranceReservationStateManager.updateFabDisplay();
        }
    }
}

// 前の選択をリセット
export function resetPreviousSelection(): void {
    // すべての監視対象をクリア
    if (entranceReservationStateManager) {
        entranceReservationStateManager.clearAllTargets();
    }
    
    // ボタンの表示を「満員」に戻す
    updateAllMonitorButtonPriorities();
}

// 他の監視ボタンを無効化（複数監視対象対応版）
export function disableOtherMonitorButtons(selectedTimeText: string, selectedTdSelector: string): void {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        const targetTime = button.getAttribute('data-target-time') || '';
        const buttonTd = button.closest('td[data-gray-out]') as HTMLTableCellElement;
        const buttonTdSelector = buttonTd ? generateUniqueTdSelector(buttonTd) : '';
        
        // 同じ時間+位置でない場合は無効化
        if (!(targetTime === selectedTimeText && buttonTdSelector === selectedTdSelector)) {
            (button as HTMLElement).classList.add('js-disabled');
            (button as HTMLButtonElement).disabled = true;
        }
    });
}

// 全ての監視ボタンを無効化（監視実行中用）
export function disableAllMonitorButtons(): void {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        (button as HTMLElement).classList.add('js-disabled');
        (button as HTMLButtonElement).disabled = true;
        
        // ツールチップで理由を表示
        (button as HTMLElement).title = '監視実行中のため操作できません';
    });
    console.log('🔒 すべての監視ボタンを無効化しました（監視実行中）');
}

// 既存の監視ボタンをクリア（日付変更時など）
export function clearExistingMonitorButtons(): void {
    const existingButtons = document.querySelectorAll('.monitor-btn');
    console.log(`${existingButtons.length}個の既存監視ボタンをクリアします`);
    existingButtons.forEach(button => {
        button.remove();
    });
}

// 監視/予約対象の表示情報を取得（簡潔版）
export function getTargetDisplayInfo(): string {
    if (!entranceReservationStateManager) {
        return '不明';
    }
    
    const targets: any[] = []; // 監視機能は無効化済み
    if (targets.length === 0) {
        return '不明';
    }
    
    const selectedDate = document.querySelector('[aria-pressed="true"] time[datetime]') as HTMLTimeElement;
    
    // 各監視対象の東西を個別に判定（東/西時間の形式で統一）
    if (targets.length > 1) {
        const timeLocationTexts = targets.map((target: any) => {
            const location = LocationHelper.getLocationFromIndex(target.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            return `${locationText}${target.timeSlot || '不明'}`;
        }).join('\n');
        
        if (selectedDate) {
            const datetime = selectedDate.getAttribute('datetime');
            if (datetime) {
                const date = new Date(datetime);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                return `${dateStr}\n${timeLocationTexts}`;
            }
        }
        return timeLocationTexts;
    } else {
        // 単一監視対象の場合
        const target = targets[0];
        const location = LocationHelper.getLocationFromIndex(target.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        const timeText = target.timeSlot || '不明';
        
        if (selectedDate) {
            const datetime = selectedDate.getAttribute('datetime');
            if (datetime) {
                const date = new Date(datetime);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                return `${dateStr} ${locationText}${timeText}`;
            }
        }
        return `${locationText}${timeText}`;
    }
}

// 監視継続フラグ設定用タイマーID
let monitoringFlagTimerId: ReturnType<typeof setTimeout> | null = null;

// 統一されたリロードスケジュール関数
export function scheduleReload(seconds: number = 30): void {
    console.log(`🔄 統一リロードスケジュール開始: ${seconds}秒`);
    
    // 既存の監視継続フラグタイマーをクリア
    if (monitoringFlagTimerId !== null) {
        clearTimeout(monitoringFlagTimerId);
        monitoringFlagTimerId = null;
        console.log(`🗑️ 既存の監視継続フラグタイマーをクリア`);
    }
    
    // 入場予約状態管理システムでリロードカウントダウンを開始
    if (entranceReservationStateManager) {
        entranceReservationStateManager.scheduleReload(seconds);
        console.log(`📊 リロードスケジュール時の状態: ${entranceReservationStateManager.getExecutionState()}`);
    }
    
    // 監視継続フラグを設定（リロード5秒前）
    const flagDelay = Math.max(0, (seconds - 5) * 1000);
    monitoringFlagTimerId = setTimeout(() => {
        // 監視中断されていないかチェック
        if (entranceReservationStateManager && entranceReservationStateManager.getExecutionState() === 'monitoring_running') {
            if (cacheManagerSection6) {
                cacheManagerSection6.setMonitoringFlag(true);
                console.log(`🏃 監視継続フラグ設定（scheduleReload）`);
            }
        } else {
            console.log(`⚠️ 監視が中断されているため継続フラグ設定をスキップ`);
        }
        monitoringFlagTimerId = null;
    }, flagDelay);
    
    // 即座に一度UI更新
    updateMainButtonDisplayHelper();
}

// 監視継続フラグタイマーをクリア
export function clearMonitoringFlagTimer(): void {
    if (monitoringFlagTimerId !== null) {
        clearTimeout(monitoringFlagTimerId);
        monitoringFlagTimerId = null;
        console.log(`🗑️ 監視継続フラグタイマーを強制クリア`);
    }
}

// 下位互換のためのstartReloadCountdown関数（scheduleReloadのエイリアス）
export function startReloadCountdown(seconds: number = 30): void {
    scheduleReload(seconds);
}

// カウントダウン停止関数
export function stopReloadCountdown(): void {
    // 呼び出し元を特定するためのスタックトレース
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim() || 'unknown';
    console.log(`🛑 stopReloadCountdown() 呼び出し元: ${caller}`);
    
    // 入場予約状態管理システムでリロードカウントダウンを停止
    if (entranceReservationStateManager) {
        entranceReservationStateManager.stopReloadCountdown();
    }
}

// ページ読み込み状態を設定
export function setPageLoadingState(isLoading: boolean): void {
    if (entranceReservationStateManager) {
        entranceReservationStateManager.setPageLoadingState(isLoading);
    }
    updateMainButtonDisplayHelper();
}

// 中断操作が許可されているかチェック
export function isInterruptionAllowed(): boolean {
    // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
    if (entranceReservationStateManager) {
        const isNearReload = entranceReservationStateManager.isNearReload();
        // console.log(`🔍 中断可否チェック: nearReload=${isNearReload}`);
        return !isNearReload;
    }
    return true; // フォールバック：統合システムが利用できない場合は中断を許可
}

// ページ読み込み時のキャッシュ復元
export async function restoreFromCache(): Promise<void> {
    if (!cacheManagerSection6) return;
    
    // 監視継続フラグをチェック（監視の自動再開用）
    const shouldContinueMonitoring = cacheManagerSection6.getAndClearMonitoringFlag();
    
    const cached = cacheManagerSection6.loadTargetSlots();
    if (!cached) return;
    
    console.log('🔄 キャッシュから複数監視状態を復元中...');
    if (shouldContinueMonitoring) {
        console.log('✅ 監視継続フラグ: 有効 - 監視を自動再開します');
    } else {
        console.log('⚠️ 監視継続フラグ: 無効 - 監視は手動開始待ちです');
    }
    
    // キャッシュされた日付と現在のカレンダー日付を比較し、必要に応じて日付移動を実行
    if (cached.selectedDate && cached.targets && cached.targets.length > 0) {
        const currentSelectedDate = getCurrentSelectedCalendarDate();
        
        console.log(`📅 日付比較: キャッシュ=${cached.selectedDate}, 現在=${currentSelectedDate}`);
        
        if (cached.selectedDate !== currentSelectedDate) {
            console.log(`📅 監視対象の日付への移動が必要: ${cached.selectedDate}`);
            
            // カレンダーが利用可能になるまで待機
            const calendarReady = await waitForCalendar(5000);
            if (!calendarReady) {
                console.error('❌ カレンダーの準備完了を待機中にタイムアウトしました');
                return;
            }
            
            // 指定日付のカレンダーをクリック
            const dateClickSuccess = await clickCalendarDate(cached.selectedDate);
            if (!dateClickSuccess) {
                console.error(`❌ 監視対象の日付への移動に失敗: ${cached.selectedDate}`);
                return;
            }
            
            console.log(`✅ 監視対象の日付に移動完了: ${cached.selectedDate}`);
            
            // 日付移動後、時間帯テーブルが更新されるまで待機
            const tableReady = await waitForTimeSlotTable(5000);
            if (!tableReady) {
                console.error('❌ 時間帯テーブルの更新完了を待機中にタイムアウトしました');
                return;
            }
        }
    }
    
    // 監視対象を統一状態管理システムに復元
    if (cached.targets && cached.targets.length > 0) {
        console.log(`🔄 監視対象を統一状態管理システムに復元: ${cached.targets.length}個`);
        
        // 各監視対象を統一状態管理システムに追加
        for (const target of cached.targets) {
            try {
                const locationIndex = typeof target.locationIndex === 'number' ? target.locationIndex : 0;
                const timeSlot = target.timeSlot; // キャッシュ保存と復元でキー名統一済み
                
                console.log(`🔍 キャッシュデータ: timeSlot=${timeSlot}, locationIndex=${target.locationIndex} → 使用値=${locationIndex}`);
                
                entranceReservationStateManager.addMonitoringTarget(timeSlot, locationIndex, target.tdSelector || '');
                console.log(`✅ 監視対象追加: ${timeSlot} (位置: ${locationIndex})`);
            } catch (error) {
                console.error(`❌ 監視対象復元エラー: ${target.timeSlot}`, error);
            }
        }
        
        const totalTargets = 0; // 監視機能は無効化済み
        console.log(`🎯 統一状態管理システムに復元完了: ${totalTargets}個の監視対象`);
    }
    
    // カレンダー読み込み完了を待機（短縮: 5秒）
    const hasCalendar = await waitForCalendar(5000);
    if (!hasCalendar) {
        console.log('❌ カレンダーの読み込みがタイムアウトしました');
        cacheManagerSection6.clearTargetSlots();
        return;
    }
    
    // UI更新を最短遅延実行（DOM完成後）
    setTimeout(async () => {
        // 監視対象が復元された場合は監視ボタンを更新
        if (false) {
            console.log('🔄 監視対象復元 - 監視ボタンを更新中...');
            try {
                await analyzeAndAddMonitorButtons();
                console.log('✅ 監視ボタン更新完了');
                
                // キャッシュ復元後、監視対象復元のタイミングでFABの監視対象とともに満員ボタンの状態も復元
                restoreSelectionAfterUpdate();
                console.log('✅ 監視ボタン状態復元完了');
            } catch (error) {
                console.error('❌ 監視ボタン更新エラー:', error);
            }
        }
        
        // メインボタンの表示更新
        updateMainButtonDisplayHelper();
        
        // 監視継続フラグが有効な場合は自動監視再開
        if (shouldContinueMonitoring && false) {
            console.log('🚀 監視継続フラグが有効 - 監視を自動再開します');
            try {
                entranceReservationStateManager.startMonitoring();
                updateMainButtonDisplayHelper();
                await startSlotMonitoring();
            } catch (error) {
                console.error('❌ 監視自動再開エラー:', error);
            }
        }
        
        console.log('✅ キャッシュ復元完了');
        
    }, 200); // 監視ボタン更新のため遅延を少し延長
}

// waitForCalendar関数を追加（restoreFromCacheで使用）
async function waitForCalendar(timeout: number): Promise<boolean> {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const selectedDate = document.querySelector('[aria-pressed="true"] time[datetime]') as HTMLTimeElement;
        if (selectedDate?.getAttribute('datetime') && selectedDate.getAttribute('datetime') !== 'N/A') {
            return true;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
}

// ============================================================================
// 【UIファイルからの統合】カレンダー・UI状態管理機能
// ============================================================================

// 現在選択中のカレンダー日付を取得
function getCurrentSelectedCalendarDate(): string | null {
    try {
        let hasNADatetime = false;
        
        // 安定したセレクタで選択済み要素を検索
        const selectedSelectors = [
            '[aria-pressed="true"] time[datetime]',
            '[class*="selector_date"] time[datetime]'
        ];
        
        for (const selector of selectedSelectors) {
            const timeElement = document.querySelector(selector) as HTMLTimeElement;
            if (timeElement) {
                const datetime = timeElement.getAttribute('datetime');
                if (datetime && datetime !== 'N/A') {
                    return datetime;
                } else if (datetime === 'N/A') {
                    hasNADatetime = true;
                    console.log(`📅 datetime="N/A"を検出 - DOM更新待機中...`);
                }
            }
        }
        
        // さらなるフォールバック: 任意のaria-pressed="true"要素内のtime要素
        const anySelected = document.querySelectorAll('[aria-pressed="true"]');
        for (const el of anySelected) {
            const timeElement = el.querySelector('time[datetime]') as HTMLTimeElement;
            if (timeElement) {
                const datetime = timeElement.getAttribute('datetime');
                if (datetime && datetime !== 'N/A') {
                    console.log(`📅 現在選択中のカレンダー日付（フォールバック）: ${datetime}`);
                    return datetime;
                } else if (datetime === 'N/A') {
                    hasNADatetime = true;
                }
            }
        }
        
        if (hasNADatetime) {
            console.log('⚠️ datetime="N/A"のため日付取得を待機中...');
        } else {
            console.log('⚠️ 選択中のカレンダー日付が見つかりません');
        }
        
        return null;
    } catch (error) {
        console.error('❌ カレンダー日付取得エラー:', error);
        return null;
    }
}

// 動的待機版のカレンダー日付取得（強化版）
async function waitForValidCalendarDate(maxRetries: number = 30, interval: number = 200): Promise<string | null> {
    console.log('📅 カレンダー日付取得の動的待機を開始...');
    
    for (let i = 0; i < maxRetries; i++) {
        // まずtime要素の存在を確認
        const timeElements = document.querySelectorAll('time[datetime]');
        
        if (timeElements.length === 0) {
            console.log(`⏳ time要素がまだ存在しません (${i + 1}/${maxRetries}) - さらに待機`);
            await new Promise(resolve => setTimeout(resolve, interval));
            continue;
        }
        
        const date = getCurrentSelectedCalendarDate();
        if (date) {
            console.log(`📅 動的待機で日付取得成功: ${date} (${i + 1}回目)`);
            return date;
        }
        
        console.log(`⏳ 日付取得リトライ中 (${i + 1}/${maxRetries}) - time要素は${timeElements.length}個存在`);
        
        if (i < maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, interval));
        }
    }
    
    console.log(`⚠️ ${maxRetries}回の動的待機後も日付取得に失敗`);
    return null;
}

// 指定された日付のカレンダーをクリック
async function clickCalendarDate(targetDate: string): Promise<boolean> {
    console.log(`📅 指定日付のカレンダークリックを試行: ${targetDate}`);
    
    try {
        // 指定日付のカレンダー要素を検索（実際のHTML構造に基づく）
        const timeElement = document.querySelector(`time[datetime="${targetDate}"]`) as HTMLTimeElement;
        if (!timeElement) {
            console.log(`❌ 指定日付のtime要素が見つかりません: ${targetDate}`);
            
            // デバッグ: 利用可能なカレンダー要素を表示
            const allCalendarElements = document.querySelectorAll('time[datetime]');
            console.log(`🔍 利用可能なカレンダー要素数: ${allCalendarElements.length}`);
            allCalendarElements.forEach((el, i) => {
                if (i < 5) { // 最初の5個だけ表示
                    const datetime = el.getAttribute('datetime');
                    console.log(`  [${i}] datetime="${datetime}" (${el.tagName})`);
                }
            });
            
            return false;
        }
        
        // time要素の親のdivボタンを取得
        const targetElement = timeElement.closest('div[role="button"]') as HTMLElement;
        
        if (!targetElement) {
            console.log(`❌ 指定日付のボタン要素が見つかりません: ${targetDate}`);
            return false;
        }
        
        // クリック可能かチェック
        if (targetElement.getAttribute('tabindex') === '-1' || targetElement.hasAttribute('data-pointer-none')) {
            console.log(`❌ 指定日付はクリック不可です: ${targetDate}`);
            return false;
        }
        
        // クリック実行
        console.log(`🖱️ 日付をクリック: ${targetDate}`);
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        
        targetElement.dispatchEvent(clickEvent);
        
        // クリック結果を待機（短縮）
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // クリック成功確認
        const isNowSelected = targetElement.getAttribute('aria-pressed') === 'true' ||
                            targetElement.classList.contains('selected') ||
                            (targetElement.querySelector('time') as HTMLTimeElement)?.getAttribute('datetime') === targetDate;
        
        if (isNowSelected) {
            console.log('✅ カレンダー日付のクリックが成功しました');
            return true;
        } else {
            console.log('⚠️ カレンダークリックは実行されましたが、選択状態の確認ができません');
            return true; // 実行は成功したとして進行
        }
        
    } catch (error) {
        console.error('❌ カレンダー日付クリックエラー:', error);
        return false;
    }
}

// 時間帯表示のためのカレンダー自動クリック機能
async function tryClickCalendarForTimeSlot(): Promise<boolean> {
    console.log('📅 時間帯表示のためのカレンダークリックを試行中...');
    
    // 監視対象確認（情報表示のみ）
    if (entranceReservationStateManager && false) {
        const targets: any[] = []; // 監視機能は無効化済み
        const targetTexts = targets.map((t: any) => t.timeSlot).join(', ');
        console.log(`🎯 監視対象: ${targetTexts} (${targets.length}個)`);
    }
    
    // 1. カレンダー要素を検索
    const calendarSelectors = [
        '.style_main__calendar__HRSsz',
        '[class*="calendar"]',
        'button[role="button"]:has(.style_main__calendar__HRSsz)',
        'div[class*="calendar"] button'
    ];
    
    let calendarElement: Element | null = null;
    for (const selector of calendarSelectors) {
        calendarElement = document.querySelector(selector);
        if (calendarElement) {
            console.log(`📅 カレンダー要素を発見: ${selector}`);
            break;
        }
    }
    
    if (!calendarElement) {
        console.log('❌ カレンダー要素が見つかりません');
        return false;
    }
    
    // 2. 現在選択されている日付のみを検索
    const dateSelectors = [
        '.style_main__calendar__HRSsz button',
        '.style_main__calendar__HRSsz [role="button"]',
        '[class*="calendar"] button:not([disabled])',
        '[class*="date"]:not([disabled])'
    ];
    
    let clickableDate: Element | null = null;
    
    // 現在選択されている日付を探す（これのみが対象）
    for (const selector of dateSelectors) {
        const dates = document.querySelectorAll(selector);
        for (const date of dates) {
            if (date.classList.contains('selected') || 
                date.classList.contains('active') ||
                date.getAttribute('aria-selected') === 'true') {
                clickableDate = date;
                console.log(`📅 現在選択中の日付を発見: ${date.textContent?.trim()}`);
                break;
            }
        }
        if (clickableDate) break;
    }
    
    // ユーザーが選択した日付のみがクリック対象
    if (!clickableDate) {
        console.log('❌ ユーザーが選択した日付が見つかりません');
        console.log('💡 現在選択中の日付のみクリック可能です');
        return false;
    }
    
    // 3. 選択中の日付をクリック
    try {
        console.log(`🖱️ 日付をクリック: "${clickableDate.textContent?.trim()}"`);
        
        // マウスイベントを発火
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        
        clickableDate.dispatchEvent(clickEvent);
        
        // 少し待機してクリック結果を確認（短縮）
        await new Promise(resolve => setTimeout(resolve, 200));
        
        console.log('✅ カレンダー日付のクリックを実行しました');
        return true;
        
    } catch (error) {
        console.error('❌ カレンダークリック中にエラー:', error);
        return false;
    }
}

// エラー表示機能
function showErrorMessage(message: string): void {
    // 既存のエラーメッセージがあれば削除
    const existingError = document.getElementById('ytomo-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // エラーメッセージ要素を作成
    const errorDiv = document.createElement('div');
    errorDiv.id = 'ytomo-error-message';
    errorDiv.className = 'ytomo-error-message';
    
    errorDiv.innerHTML = `
        <div class="error-title">⚠️ 監視エラー</div>
        <div>${message}</div>
        <button class="error-close-btn" onclick="this.parentElement.remove()">閉じる</button>
    `;
    
    document.body.appendChild(errorDiv);
    
    // 10秒後に自動削除
    setTimeout(() => {
        if (errorDiv && errorDiv.parentElement) {
            errorDiv.remove();
        }
    }, 10000);
}

// 監視UI状態のリセット
function resetMonitoringUI(): void {
    // すべての監視ボタンを有効化
    enableAllMonitorButtons();
    
    // 選択中の監視ボタンを元に戻す
    const selectedButtons = document.querySelectorAll('.ext-ytomo.monitor-btn');
    selectedButtons.forEach(button => {
        const span = button.querySelector('span') as HTMLSpanElement;
        if (span && span.innerText.startsWith('監視')) {
            span.innerText = '満員';
            (button as HTMLElement).classList.remove('monitoring-status');
            (button as HTMLElement).classList.add('full-status');
            (button as HTMLButtonElement).disabled = false;
        }
    });
}

// 全ての監視ボタンを有効化
function enableAllMonitorButtons(): void {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span') as HTMLSpanElement;
        
        // すべてのボタンを有効化
        (button as HTMLElement).classList.remove('js-disabled');
        (button as HTMLElement).classList.add('js-enabled');
        (button as HTMLButtonElement).disabled = false;
        
        // 監視対象のボタンは赤色を維持
        if (span && span.innerText.startsWith('監視')) {
            (button as HTMLElement).classList.remove('full-status');
            (button as HTMLElement).classList.add('monitoring-status');
        }
        
        // ツールチップをクリア
        (button as HTMLElement).title = '';
    });
    console.log('✅ すべての監視ボタンを有効化しました（選択中も含む）');
}

// 現在のテーブル内容を取得（変化検出用）
function getCurrentTableContent(): string {
    const tables = document.querySelectorAll('table');
    let content = '';
    
    tables.forEach(table => {
        const timeSlots = table.querySelectorAll('td div[role="button"]');
        timeSlots.forEach(slot => {
            const timeText = (slot.querySelector('dt span') as HTMLSpanElement)?.textContent?.trim();
            const disabled = slot.getAttribute('data-disabled');
            const pressed = slot.getAttribute('aria-pressed');
            
            if (timeText && (timeText.includes(':') || timeText.includes('時'))) {
                content += `${timeText}-${disabled}-${pressed}|`;
            }
        });
    });
    
    return content;
}

// 監視ボタンの更新が必要かチェック
function shouldUpdateMonitorButtons(): boolean {
    const analysis = analyzeTimeSlots();
    const existingButtons = document.querySelectorAll('.monitor-btn');
    
    console.log(`満員時間帯数: ${analysis.full.length}, 既存ボタン数: ${existingButtons.length}`);
    
    // 満員時間帯の数と既存ボタン数が異なる場合は更新が必要
    if (analysis.full.length !== existingButtons.length) {
        console.log('📊 満員時間帯数と監視ボタン数が不一致');
        return true;
    }
    
    // 満員時間帯がない場合はボタンも不要
    if (analysis.full.length === 0) {
        console.log('📭 満員時間帯なし、ボタン不要');
        return false;
    }
    
    // 各満員時間帯に対応するボタンが存在するかチェック
    const fullTimeTexts = analysis.full.map(slot => slot.timeText);
    const buttonTimeTexts = Array.from(existingButtons).map(btn => btn.getAttribute('data-target-time') || '');
    
    const missingButtons = fullTimeTexts.filter(time => !buttonTimeTexts.includes(time));
    const extraButtons = buttonTimeTexts.filter(time => !fullTimeTexts.includes(time));
    
    if (missingButtons.length > 0) {
        console.log('📌 不足している監視ボタン:', missingButtons);
        return true;
    }
    
    if (extraButtons.length > 0) {
        console.log('🗑️ 不要な監視ボタン:', extraButtons);
        return true;
    }
    
    console.log('✅ 監視ボタンは適切に配置されています');
    return false;
}

// 日付変更後の選択状態復元
function restoreSelectionAfterUpdate(): void {
    if (!entranceReservationStateManager || !false) return;
    
    const targets: any[] = []; // 監視機能は無効化済み
    const targetTexts = targets.map((t: any) => t.timeSlot).join(', ');
    console.log(`選択状態を復元中: ${targetTexts}`);
    
    // 該当する時間帯の監視ボタンを探して選択状態にする  
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    console.log(`🔍 復元対象の監視ボタン数: ${monitorButtons.length}`);
    let restoredCount = 0;
    
    targets.forEach((target: any) => {
        console.log(`🔍 復元対象: ${target.timeSlot} (index: ${target.locationIndex}, selector: ${target.selector})`);
        let foundMatch = false;
        
        // 1. セレクタで直接検索（必須）
        if (target.selector) {
            const targetElement = document.querySelector(target.selector) as HTMLTableCellElement;
            if (targetElement) {
                // 2. 時間帯セレクタでの厳密な時間確認（追加検証）
                const timeSlotButton = targetElement.querySelector('div[role="button"] dt span');
                const actualTimeSlot = timeSlotButton ? timeSlotButton.textContent?.trim() || '' : '';
                const expectedTime = target.timeSlot;
                
                // 3. locationIndexの確認（追加検証）
                const buttonInTargetTd = targetElement.querySelector('.monitor-btn') as HTMLElement;
                if (buttonInTargetTd) {
                    const actualLocationIndex = parseInt(buttonInTargetTd.getAttribute('data-location-index') || '0');
                    
                    // セレクタ、時間、locationIndexの三重チェック
                    const selectorMatch = true; // セレクタで見つかっている
                    const timeMatch = actualTimeSlot === expectedTime; // 厳密一致
                    const indexMatch = actualLocationIndex === target.locationIndex;
                    
                    console.log(`🔍 検証結果: セレクタ=✅, 時間=${timeMatch ? '✅' : '❌'}(${actualTimeSlot}===${expectedTime}), index=${indexMatch ? '✅' : '❌'}(${actualLocationIndex}/${target.locationIndex})`);
                    
                    if (selectorMatch && timeMatch && indexMatch) {
                        foundMatch = true;
                        const span = buttonInTargetTd.querySelector('span') as HTMLSpanElement;
                        if (span) {
                            const priority = target.priority;
                            span.innerText = `監視${priority}`;
                            buttonInTargetTd.classList.remove('full-status');
                            buttonInTargetTd.classList.add('monitoring-status');
                            restoredCount++;
                            console.log(`✅ 完全一致で復元成功: ${target.timeSlot} (index: ${target.locationIndex})`);
                        }
                    } else {
                        console.log(`⚠️ 部分的不一致: セレクタは見つかったが時間またはindexが一致しません`);
                    }
                } else {
                    console.log(`⚠️ セレクタは見つかったが監視ボタンが存在しません`);
                }
            } else {
                console.log(`❌ セレクタで要素が見つかりません: ${target.selector}`);
            }
        } else {
            console.log(`❌ セレクタが保存されていません`);
        }
        
        if (!foundMatch) {
            console.log(`❌ 復元対象が見つかりません: ${target.timeSlot} (index: ${target.locationIndex}, selector: ${target.selector})`);
        }
    });
    
    if (restoredCount === 0) {
        console.log(`⚠️ 復元に失敗しましたが、監視対象はクリアしません: ${targetTexts}`);
        console.log(`💡 DOM構造変化によるセレクタ無効化の可能性があります`);
        console.log(`💡 次回の監視実行時に自動的にセレクタが更新されます`);
        // 注意: 復元失敗でも監視対象をクリアしない（DOM構造変化の場合があるため）
    } else {
        console.log(`✅ 復元完了: ${restoredCount}/${targets.length}個の監視対象を復元しました`);
    }
    
    
    updateMainButtonDisplayHelper();
}

/* 
// キャッシュ復元後の可用性チェック（一時的に無効化）
function checkAvailabilityAfterCacheRestore(): void {
    if (!entranceReservationStateManager || !false) {
        return;
    }
    
    console.log('🔍 キャッシュ復元後の監視対象可用性をチェック中...');
    
    const monitoringTargets: any[] = []; // 監視機能は無効化済み
    let availableCount = 0;
    
    for (const target of monitoringTargets) {
        const tdElement = document.querySelector(target.selector) as HTMLTableCellElement;
        if (!tdElement) continue;
        
        const buttonElement = tdElement.querySelector('div[role="button"]') as HTMLElement;
        if (!buttonElement) continue;
        
        // 満員かどうか確認（data-disabled属性の有無で判定）
        const isDisabled = buttonElement.getAttribute('data-disabled') === 'true';
        const isAvailable = !isDisabled;
        
        if (isAvailable) {
            availableCount++;
            console.log(`✅ 空きあり検出: ${target.timeSlot} (位置: ${target.locationIndex})`);
        }
    }
    
    if (availableCount > 0) {
        console.log(`🎉 ${availableCount}個の監視対象に空きが出ています - 既存処理に委ねます`);
        
        // 既存の自動/手動リロード時の空き検出処理を呼び出す
        // これにより統一された空き検出・自動予約ロジックが動作する
        handleAvailabilityDetected();
    } else {
        console.log('📋 すべての監視対象が満員状態です');
    }
}

// 空き検出時の処理（既存の自動/手動リロード処理と統合）
function handleAvailabilityDetected(): void {
    console.log('🔄 キャッシュ復元後の空き検出 - 既存の自動予約処理を実行');
    
    if (!entranceReservationStateManager || !false) {
        return;
    }
    
    // 優先度最高の空き監視対象を取得
    const monitoringTargets: any[] = []; // 監視機能は無効化済み
    let highestPriorityAvailable: any = null;
    
    for (const target of monitoringTargets) {
        const tdElement = document.querySelector(target.selector) as HTMLTableCellElement;
        if (!tdElement) continue;
        
        const buttonElement = tdElement.querySelector('div[role="button"]') as HTMLElement;
        if (!buttonElement) continue;
        
        const isAvailable = buttonElement.getAttribute('data-disabled') !== 'true';
        if (isAvailable && (!highestPriorityAvailable || target.priority < highestPriorityAvailable.priority)) {
            highestPriorityAvailable = target;
        }
    }
    
    if (highestPriorityAvailable) {
        console.log(`🎯 優先度最高の空き時間帯を自動選択: ${highestPriorityAvailable.timeSlot}`);
        
        // 自動リロードかどうかを判定
        const isAutoReload = false || false;
        
        if (isAutoReload) {
            console.log(`  → 自動リロード相当: 監視を終了し、自動選択+予約を開始`);
            
            // ボタン表示を更新（見つかりましたモード）
            window.dispatchEvent(new CustomEvent('entrance-ui-update', { 
                detail: { type: 'main-button', mode: 'found-available' } 
            }));
            
            // 自動選択イベントを発火
            const slotInfo = {
                targetInfo: {
                    timeSlot: highestPriorityAvailable.timeSlot,
                    tdSelector: highestPriorityAvailable.selector,
                    locationIndex: highestPriorityAvailable.locationIndex
                },
                timeText: highestPriorityAvailable.timeSlot
            };
            
            window.dispatchEvent(new CustomEvent('entrance-auto-select', { 
                detail: { slot: slotInfo } 
            }));
        } else {
            console.log(`  → 手動リロード相当: ステータス表示+監視対象削除+予約対象化`);
            
            // 手動リロード時の処理（監視対象から予約対象への移行）
            updateMainButtonDisplayHelper();
        }
    }
}
*/

// 時間帯を自動選択して予約開始
async function selectTimeSlotAndStartReservation(slotInfo: any): Promise<void> {
    const location = LocationHelper.getLocationFromIndex(LocationHelper.getIndexFromSelector(slotInfo.targetInfo.tdSelector));
    console.log(`🎯 時間帯を自動選択します: ${location}${slotInfo.timeText}`);
    
    // クリック対象のdl要素を探す
    let clickTarget: HTMLElement | null = null;
    
    // TD要素の場合はdl要素を探す
    if (slotInfo.element.tagName === 'TD') {
        clickTarget = slotInfo.element.querySelector('div[role="button"] dl') as HTMLElement;
        if (clickTarget) {
            console.log('🔧 TD要素内のdl要素を発見しました');
        } else {
            console.error('❌ TD要素内にdl要素が見つかりません');
            return;
        }
    } else {
        // TD以外の場合はdl要素を探す
        clickTarget = slotInfo.element.querySelector('dl') as HTMLElement;
        if (!clickTarget) {
            console.error('❌ 要素内にdl要素が見つかりません');
            return;
        }
    }
    
    // 時間帯を確実に選択
    console.log(`🖱️ dl要素をクリックします: ${clickTarget.tagName}`);
    
    // 複数の方法で確実にクリック
    try {
        // まず通常のクリック
        clickTarget.click();
        
        // さらにイベントディスパッチでクリック
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        clickTarget.dispatchEvent(clickEvent);
        
        console.log(`✅ dl要素のクリック完了`);
    } catch (error) {
        console.error(`❌ dl要素クリックエラー:`, error);
    }
    
    // 選択状態確認のため少し待つ（短縮）
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // 選択状態を確認（ボタン要素の状態をチェック）
    const buttonElement = slotInfo.element.querySelector('div[role="button"]') as HTMLElement;
    const isSelected = buttonElement && (
        Array.from(buttonElement.classList).some(className => className.includes('style_active__')) || 
        buttonElement.getAttribute('aria-pressed') === 'true'
    );
    console.log(`🔍 時間帯選択状態確認: ${isSelected ? '選択済み' : '未選択'}`);
    
    if (!isSelected) {
        console.warn(`⚠️ 時間帯が選択されていません。再試行します`);
        // 再試行 - dl要素を再度クリック
        clickTarget.click();
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // 少し待ってから予約処理開始
    setTimeout(async () => {
        console.log('🚀 予約処理を開始します');
        
        // 予約開始前に時間帯選択を最終確認（timeSlotSelectorsを使用）
        const selectedTimeSlot = document.querySelector(timeSlotSelectors.selectedSlot);
        const finalCheck = !!selectedTimeSlot;
        
        console.log(`🔍 予約開始前最終確認: 時間帯選択=${finalCheck ? '✅選択済み' : '❌未選択'}`);
        if (selectedTimeSlot) {
            const tdElement = selectedTimeSlot.closest('td');
            const status = extractTdStatus(tdElement as HTMLTableCellElement);
            console.log(`🔍 選択された時間帯: ${status?.timeText || 'unknown'} (満員: ${status?.isFull ? 'はい' : 'いいえ'})`);
        }
        
        if (!finalCheck) {
            console.error(`❌ 時間帯が選択されていないため予約処理を中止します`);
            return;
        }
        
        // 監視停止
        stopSlotMonitoring();
        
        // 通常の予約処理を開始（入場予約状態管理システム使用）
        const config = getCurrentEntranceConfig();
        if (config) {
            // 統一予約開始処理を使用
            entranceReservationStateManager.startReservation();
            const result = await entranceReservationHelper(config);
            
            if (result.success) {
                // 入場予約状態管理に予約成功情報を設定
                if (entranceReservationStateManager) {
                    const reservationTarget = entranceReservationStateManager.getReservationTarget();
                    if (reservationTarget) {
                        entranceReservationStateManager.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                        updateMainButtonDisplayHelper(); // FAB表示更新
                    }
                }
                
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                    cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                }
                console.log('✅ 予約が成功しました！');
            }
        }
    }, 1000);
}

// 監視停止（監視対象選択は維持）
function stopSlotMonitoring(): void {
    // 入場予約状態管理システムの実行状態を停止
    if (entranceReservationStateManager) {
        entranceReservationStateManager.stop();
    }
    
    // 監視継続フラグをクリア（手動停止なので継続させない）
    if (cacheManager) {
        cacheManager.clearMonitoringFlag();
    }
    
    // 監視継続フラグタイマーをクリア（重要：中断後のフラグ設定を防ぐ）
    clearMonitoringFlagTimer();
    
    // リロードカウントダウンの停止（入場予約状態管理システムで管理）
    entranceReservationStateManager.stopReloadCountdown();
    
    // 誤動作防止オーバーレイを非表示
    processingOverlay.hide();
    
    // 監視ボタンを有効化（操作可能に戻す）
    enableAllMonitorButtons();
    
    // メインボタンの表示を更新
    updateMainButtonDisplayHelper();
    
    console.log('⏹️ 時間帯監視を停止しました（監視対象選択は維持）');
}

// 現在の設定を取得（ヘルパー関数）
function getCurrentEntranceConfig(): any {
    // 既存の設定と同じものを返す
    return {
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
            waitForResponse: 10000,
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
}

// ============================================================================