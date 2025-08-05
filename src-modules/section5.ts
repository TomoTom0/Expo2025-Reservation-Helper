// Section 2からのimport
import {
    multiTargetManager,
    timeSlotState,
    reloadCountdownState
} from './section2';

// 統一状態管理システムからのimport
import { LocationHelper } from './unified-state';

// Section 4からのimport
import {
    timeSlotSelectors,
    generateUniqueTdSelector,
    findSameTdElement,
    extractTdStatus
} from './section4';

// 型定義のインポート
import type { 
    TimeSlotInfo,
    TimeSlotTarget,
    CacheManager,
    SafeCallFunction
} from '../types/index.js';

// 【5. 時間帯監視・分析システム】
// ============================================================================

// 依存注入用の外部関数参照
let externalFunctions: Record<string, any> = {};
let isInitialized: boolean = false;

// 必要な外部関数のリスト
const REQUIRED_FUNCTIONS: string[] = [
    'getCurrentTableContent',
    'shouldUpdateMonitorButtons', 
    'restoreSelectionAfterUpdate',
    // 'showStatus', // 内部関数のため一時的に除外
    'enableAllMonitorButtons',
    'updateMainButtonDisplay',
    'updateMonitoringTargetsDisplay',
    'disableAllMonitorButtons',
    'selectTimeSlotAndStartReservation',
    'startReloadCountdown',
    'reloadCountdownState',
    'resetMonitoringUI',
    'showErrorMessage',
    'tryClickCalendarForTimeSlot',
    'unifiedStateManager' // 統一状態管理システムを追加
];

// 外部関数を設定するヘルパー関数
export const setExternalFunctions = (funcs: Record<string, any>): void => {
    // 必要な関数がすべて存在するかチェック
    for (const funcName of REQUIRED_FUNCTIONS) {
        if (typeof funcs[funcName] !== 'function' && typeof funcs[funcName] !== 'object') {
            console.warn(`Warning: Required function/object ${funcName} not provided or not a function`);
        }
    }
    externalFunctions = funcs;
    isInitialized = true;
    console.log('✅ Section 5: External functions initialized');
};

// 安全な外部関数呼び出し
const safeCall: SafeCallFunction = (funcName: string, ...args: any[]): any => {
    if (!isInitialized) {
        throw new Error('External functions not initialized in Section 5');
    }
    if (typeof externalFunctions[funcName] !== 'function') {
        throw new Error(`Function ${funcName} not available in Section 5`);
    }
    return externalFunctions[funcName](...args);
};

// 安全な外部オブジェクト参照
export const getExternalFunction = (name: string): any => {
    if (!isInitialized) {
        console.warn('External functions not initialized in Section 5');
        return null;
    }
    return externalFunctions[name] || null;
};

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
                const currentTableContent = safeCall('getCurrentTableContent');
                if (currentTableContent === lastTableContent) {
                    console.log('📋 テーブル内容に変化なし、処理をスキップ');
                    return;
                }
                
                // console.log('🔍 有効な時間帯テーブル変更を検出');
                isProcessing = true;
                
                const hasTimeSlot = checkTimeSlotTableExistsSync();
                if (hasTimeSlot) {
                    // 現在の監視ボタンの状態をチェック
                    if (safeCall('shouldUpdateMonitorButtons')) {
                        console.log('🎯 監視ボタンの更新が必要です');
                        
                        setTimeout(() => {
                            // 差分更新処理（不要なボタン削除と新規ボタン追加）
                            analyzeAndAddMonitorButtons();
                            
                            // 選択状態を復元
                            setTimeout(() => {
                                safeCall('restoreSelectionAfterUpdate');
                                
                                // テーブル内容を記録
                                lastTableContent = safeCall('getCurrentTableContent');
                                isProcessing = false;
                            }, 200);
                        }, 300);
                    } else {
                        console.log('✅ 監視ボタンは既に適切に配置されています');
                        lastTableContent = safeCall('getCurrentTableContent');
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
            console.log('既存の時間帯テーブルを検出');
            isProcessing = true;
            analyzeAndAddMonitorButtons(); // 差分更新で処理
            lastTableContent = safeCall('getCurrentTableContent');
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
        const isMonitoringTarget = multiTargetManager.isSelected(timeText, tdSelector);
        
        if (isMonitoringTarget) {
            console.log(`🎯 監視対象のため保持: ${timeText} (状態変化を追跡中)`);
            
            // 監視対象の状態が変わった場合はボタンテキストを更新
            const currentTd = button.closest('td[data-gray-out]') as HTMLTableCellElement;
            const currentStatus = extractTdStatus(currentTd);
            if (currentStatus && currentStatus.isAvailable) {
                const span = button.querySelector('span') as HTMLSpanElement;
                if (span) {
                    span.innerText = '空きあり';
                    (button as HTMLElement).style.background = 'rgb(0, 200, 0)'; // より明るい緑
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
    
    console.log(`📊 時間帯分析開始: ${allTdElements.length}個のtd要素を確認`);
    
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
            
            console.log(`📊 ${status.timeText}: ${statusType} (満員:${isFull}, 利用可能:${isAvailable}, 選択:${isSelected})`);
            
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
    
    console.log(`📊 分析結果: 利用可能=${available.length}, 満員=${full.length}, 選択=${selected.length}`);
    
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

// 満員時間帯にモニタリングボタンを追加
function addMonitorButtonsToFullSlots(fullSlots: TimeSlotInfo[]): void {
    fullSlots.forEach(slotInfo => {
        createMonitorButton(slotInfo);
    });
}

// 監視ボタンのテキストを決定（優先順位表示）
function getMonitorButtonText(slotInfo: TimeSlotInfo): string {
    const tdElement = slotInfo.element.closest('td[data-gray-out]') as HTMLTableCellElement;
    const tdSelector = generateUniqueTdSelector(tdElement);
    
    // 既に監視対象として選択されているかチェック
    const isSelected = multiTargetManager.isSelected(slotInfo.timeText, tdSelector);
    
    if (isSelected) {
        // 監視対象リストでの位置を取得（1ベース）
        const targets = multiTargetManager.getTargets();
        const targetIndex = targets.findIndex(
            target => target.timeText === slotInfo.timeText && target.tdSelector === tdSelector
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
    const targets = multiTargetManager.getTargets();
    
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span') as HTMLSpanElement;
        const timeText = button.getAttribute('data-target-time') || '';
        
        if (span && timeText) {
            // このボタンの時間帯と位置情報を特定
            const tdElement = button.closest('td[data-gray-out]') as HTMLTableCellElement;
            if (tdElement) {
                const tdSelector = generateUniqueTdSelector(tdElement);
                
                // 監視対象リストでの位置を検索
                const targetIndex = targets.findIndex(
                    target => target.timeText === timeText && target.tdSelector === tdSelector
                );
                
                if (targetIndex >= 0) {
                    // 監視対象として選択されている場合、優先順位を表示
                    const priority = targetIndex + 1;
                    span.innerText = `監視${priority}`;
                    (button as HTMLElement).style.background = 'rgb(0, 104, 33)';
                } else {
                    // 監視対象でない場合は「満員」
                    span.innerText = '満員';
                    (button as HTMLElement).style.background = 'rgb(255, 140, 0)';
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
    monitorButton.style.cssText = `
        height: auto;
        min-height: 20px;
        width: auto;
        min-width: 35px;
        padding: 1px 4px;
        background: rgb(255, 140, 0) !important;
        color: white !important;
        margin-left: 8px;
        font-size: 10px;
        border: none !important;
        border-radius: 2px;
        cursor: pointer !important;
        display: inline-block;
        vertical-align: middle;
        position: relative;
        z-index: 9999 !important;
        pointer-events: auto !important;
        opacity: 1 !important;
        visibility: visible !important;
    `;
    
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
        const location = multiTargetManager.getLocationFromSelector(tdSelector);
        console.log(`🖱️ 監視ボタンクリック検出: ${location}${slotInfo.timeText}`);
        
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
    
    // dt要素内に追加（spanの後）
    dtElement.appendChild(monitorButton);
    
    console.log(`満員時間帯に監視ボタンを追加しました: ${timeText}`);
}

// 監視ボタンクリック処理（選択・解除切り替え）
function handleMonitorButtonClick(slotInfo: TimeSlotInfo, buttonElement: HTMLButtonElement): void {
    const tdElement = slotInfo.element.closest('td[data-gray-out]') as HTMLTableCellElement;
    const tdSelector = generateUniqueTdSelector(tdElement);
    const location = multiTargetManager.getLocationFromSelector(tdSelector);
    console.log(`監視ボタンがクリックされました: ${location}${slotInfo.timeText}`);
    
    // 監視実行中は操作不可
    if (timeSlotState.isMonitoring) {
        console.log('⚠️ 監視実行中のため操作できません');
        return;
    }
    
    const buttonSpan = buttonElement.querySelector('span') as HTMLSpanElement;
    const currentText = buttonSpan.innerText;
    const isCurrentlySelected = currentText.startsWith('監視'); // '監視1', '監視2' etc.
    
    console.log(`現在の状態: ${isCurrentlySelected ? '選択中' : '未選択'} (テキスト: "${currentText}")`);
    
    if (isCurrentlySelected) {
        // 現在選択中の場合は解除
        console.log(`監視対象を解除します: ${location}${slotInfo.timeText}`);
        
        // 複数対象管理から削除（時間+位置で特定）
        multiTargetManager.removeTarget(slotInfo.timeText, tdSelector);
        
        // 統一状態管理システムからも削除
        const unifiedStateManager = getExternalFunction('unifiedStateManager');
        if (unifiedStateManager) {
            const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
            
            const unifiedRemoved = unifiedStateManager.removeMonitoringTarget(slotInfo.timeText, locationIndex);
            if (unifiedRemoved) {
                console.log(`✅ 統一状態管理からも監視対象を削除: ${location}${slotInfo.timeText}`);
            } else {
                console.log(`⚠️ 統一状態管理からの削除失敗: ${location}${slotInfo.timeText}`);
            }
        } else {
            console.log('⚠️ 統一状態管理システムが利用できません');
        }
        
        // ボタンの表示を元に戻す
        buttonSpan.innerText = '満員';
        buttonElement.style.background = 'rgb(255, 140, 0)';
        buttonElement.style.opacity = '1';
        buttonElement.style.cursor = 'pointer';
        buttonElement.disabled = false;
        
        // 監視対象がすべてなくなった場合の処理
        if (!multiTargetManager.hasTargets()) {
            timeSlotState.mode = 'idle';
            timeSlotState.retryCount = 0;
            
            // キャッシュをクリア
            if (cacheManager) {
                cacheManager.clearTargetSlots();
                cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
            }
            
            // 他のボタンを有効化
            safeCall('enableAllMonitorButtons');
        } else {
            // キャッシュを更新（残りの監視対象で）
            if (cacheManager) {
                cacheManager.saveTargetSlots();
            }
            
            // 残りのボタンの優先順位を更新
            updateAllMonitorButtonPriorities();
        }
        
        // メインボタンの表示を更新
        safeCall('updateMainButtonDisplay');
        
        // 監視対象表示も更新
        safeCall('updateMonitoringTargetsDisplay');
        
        console.log(`✅ 監視対象を解除しました: ${location}${slotInfo.timeText}`);
    } else {
        // 現在未選択の場合は選択
        console.log(`監視対象を追加します: ${location}${slotInfo.timeText}`);
        
        // 選択状態を設定（td要素の一意特定情報を追加）
        // TypeScript用の変数（削除予定）
        // const targetSlotInfo: TimeSlotTarget = {
        //     ...slotInfo,
        //     // td要素の一意特定情報を追加
        //     tdSelector: generateUniqueTdSelector(tdElement),
        //     positionInfo: getTdPositionInfo(tdElement)
        // };
        
        // 統一状態管理システムに追加（一元管理）
        const unifiedStateManager = getExternalFunction('unifiedStateManager');
        let added = false;
        if (unifiedStateManager) {
            const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
            added = unifiedStateManager.addMonitoringTarget(slotInfo.timeText, locationIndex, tdSelector);
            if (added) {
                console.log(`✅ 統一状態管理に監視対象を追加: ${location}${slotInfo.timeText}`);
            } else {
                console.log(`⚠️ 統一状態管理への追加失敗（既に選択済み）: ${location}${slotInfo.timeText}`);
                return;
            }
        } else {
            console.log('⚠️ 統一状態管理システムが利用できません');
            return;
        }
        
        if (!added) return; // 追加失敗時は処理を中止
        
        timeSlotState.mode = 'selecting';
        timeSlotState.retryCount = 0;
        
        // キャッシュに保存（すべての監視対象を保存）
        if (cacheManager) {
            cacheManager.saveTargetSlots();
        }
        
        // ボタンの表示を変更（優先順位表示）
        if (unifiedStateManager) {
            const targets = unifiedStateManager.getMonitoringTargets();
            const target = targets.find((t: any) => t.timeSlot === slotInfo.timeText && t.selector === tdSelector);
            const priority = target ? target.priority : targets.length;
            buttonSpan.innerText = `監視${priority}`;
        } else {
            buttonSpan.innerText = '監視1'; // フォールバック
        }
        buttonElement.style.background = 'rgb(0, 104, 33)';
        buttonElement.style.opacity = '1';
        buttonElement.style.cursor = 'pointer';
        buttonElement.disabled = false; // クリックで解除できるように
        
        // メインボタンの表示を更新
        if (unifiedStateManager) {
            const targetCount = unifiedStateManager.getMonitoringTargets().length;
            console.log(`🔄 監視対象設定後のFAB更新を実行: targetSlots=${targetCount}個, mode=${timeSlotState.mode}`);
        }
        safeCall('updateMainButtonDisplay');
        
        // 監視対象表示も更新
        safeCall('updateMonitoringTargetsDisplay');
        
        // 更新後の状態も確認
        setTimeout(() => {
            const fabButton = document.querySelector('#ytomo-main-fab') as HTMLButtonElement;
            console.log(`🔍 FAB更新後の状態: disabled=${fabButton?.disabled}, hasDisabledAttr=${fabButton?.hasAttribute('disabled')}, text="${fabButton?.textContent?.trim()}"`);
        }, 100);
        
        console.log(`✅ 時間帯 ${location}${slotInfo.timeText} を監視対象に設定しました`);
    }
}

// 満員時間帯の可用性監視を開始
async function startSlotMonitoring(): Promise<void> {
    if (!multiTargetManager.hasTargets()) {
        console.log('❌ 監視対象時間帯が設定されていません');
        return;
    }
    
    // 即座に状態更新（UI応答性向上）
    timeSlotState.mode = 'monitoring';
    timeSlotState.isMonitoring = true;
    safeCall('updateMainButtonDisplay'); // 即座にボタン表示を更新
    
    // 監視実行中は全ての監視ボタンを無効化
    safeCall('disableAllMonitorButtons');
    
    const targetCount = multiTargetManager.getCount();
    const targetTexts = multiTargetManager.getTargets().map(t => {
        const location = multiTargetManager.getLocationFromSelector(t.tdSelector);
        return `${location}${t.timeText}`;
    }).join(', ');
    console.log(`🔄 時間帯監視を開始: ${targetTexts} (${targetCount}個)`);
    
    // 定期的な可用性チェック
    timeSlotState.monitoringInterval = window.setInterval(async () => {
        await checkSlotAvailabilityAndReload();
    }, timeSlotState.reloadInterval + Math.random() * 5000); // ランダム性追加
    
    // 即座に一回チェック（短縮）
    setTimeout(() => {
        checkSlotAvailabilityAndReload();
    }, 500);
}

// 時間帯の可用性チェックとページ再読み込み
async function checkSlotAvailabilityAndReload(): Promise<void> {
    if (!timeSlotState.isMonitoring || !multiTargetManager.hasTargets()) {
        return;
    }
    
    // バリデーションチェック
    if (!validatePageLoaded()) return;
    if (!(await checkTimeSlotTableExistsAsync())) return;
    
    // 複数監視対象の存在チェック
    const targets = multiTargetManager.getTargets();
    for (const target of targets) {
        if (!checkTargetElementExists(target)) return;
    }
    if (!checkMaxReloads(timeSlotState.retryCount)) return;
    
    timeSlotState.retryCount++;
    if (cacheManager) {
        cacheManager.updateRetryCount(timeSlotState.retryCount);
    }
    
    const targetTexts = targets.map(t => t.timeText).join(', ');
    console.log(`🔍 可用性チェック (${timeSlotState.retryCount}回目): ${targetTexts}`);
    
    // 現在の時間帯をチェック
    const currentSlot = findTargetSlotInPage();
    
    console.log(`📊 監視チェック結果: currentSlot=${!!currentSlot}, status=${currentSlot?.status}`);
    
    if (currentSlot && currentSlot.status === 'available') {
        const location = multiTargetManager.getLocationFromSelector(currentSlot.targetInfo.tdSelector);
        console.log(`🎉🎉 対象時間帯が利用可能になりました！: ${location}${currentSlot.targetInfo.timeText}`);
        console.log(`  → 監視を終了し、自動選択+予約を開始します`);
        
        // ボタン表示を更新（見つかりましたモード）
        safeCall('updateMainButtonDisplay', 'found-available');
        
        // 自動選択
        await safeCall('selectTimeSlotAndStartReservation', currentSlot);
        return;
    }
    
    // まだ満員の場合はページリロード
    console.log('⏳ すべての監視対象がまだ満員です。ページを再読み込みします...');
    
    // リロード前に監視継続フラグを設定
    const flagTimestamp = Date.now();
    if (cacheManager) {
        cacheManager.setMonitoringFlag(true);
    }
    console.log(`🏃 監視継続フラグ設定時刻: ${new Date(flagTimestamp).toLocaleTimeString()}`);
    
    // BAN対策：設定されたリロード間隔にランダム要素を追加
    const baseInterval = timeSlotState.reloadInterval; // 30000ms (30秒)
    const randomVariation = Math.random() * 5000; // 0-5秒のランダム要素
    const totalWaitTime = baseInterval + randomVariation;
    const displaySeconds = Math.ceil(totalWaitTime / 1000);
    
    // カウントダウン開始（即座にUI更新）
    safeCall('startReloadCountdown', displaySeconds);
    
    // リロードタイマーを保存（中断時に停止するため）
    reloadCountdownState.reloadTimer = window.setTimeout(() => {
        console.log('🔄 監視継続のためページをリロードします...');
        // カウントダウンを停止してからリロード実行
        safeCall('stopReloadCountdown');
        window.location.reload();
    }, totalWaitTime) as any;
}

// ページ内で対象時間帯を検索（複数対象の状態変化をチェック）
function findTargetSlotInPage(): any {
    const targets = multiTargetManager.getTargets();
    if (targets.length === 0) return null;
    
    // 複数監視対象をチェック
    for (const target of targets) {
        // 監視開始時に保存した要素特定情報を使用して同一td要素を検索
        const targetTd = findSameTdElement(target);
        
        if (targetTd) {
            // 同一td要素の現在の状態を取得
            const currentStatus = extractTdStatus(targetTd);
            const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
            
            // 詳細なデバッグ情報を出力
            const buttonElement = targetTd.querySelector('div[role="button"]');
            const dataDisabled = buttonElement?.getAttribute('data-disabled');
            const fullIcon = buttonElement?.querySelector('img[src*="calendar_ng.svg"]');
            const lowIcon = buttonElement?.querySelector('img[src*="ico_scale_low.svg"]');
            const highIcon = buttonElement?.querySelector('img[src*="ico_scale_high.svg"]');
            
            console.log(`🔍 監視対象要素を発見: ${location}${target.timeText}`);
            console.log(`  - 現在状態: isAvailable=${currentStatus?.isAvailable}, isFull=${currentStatus?.isFull}`);
            console.log(`  - data-disabled: ${dataDisabled}`);
            console.log(`  - 満員アイコン: ${!!fullIcon}, 低混雑: ${!!lowIcon}, 高空き: ${!!highIcon}`);
            
            // 利用可能になったかチェック
            if (currentStatus && currentStatus.isAvailable) {
                console.log(`🎉 監視対象要素が利用可能になりました！: ${location}${target.timeText}`);
                console.log(`  → 監視を終了して自動選択を開始します`);
                return { ...currentStatus, targetInfo: target, status: 'available' };
            } else if (currentStatus && currentStatus.isFull) {
                console.log(`⏳ 監視対象要素はまだ満員: ${location}${target.timeText}`);
            } else {
                console.log(`❓ 監視対象要素の状態が不明: ${location}${target.timeText} (isAvailable: ${currentStatus?.isAvailable}, isFull: ${currentStatus?.isFull})`);
            }
        } else {
            // 要素が見つからない場合
            const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
            console.log(`❌ 監視対象要素が見つかりません: ${location}${target.timeText}`);
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
    
    // インターバル停止
    if (timeSlotState.monitoringInterval) {
        clearInterval(timeSlotState.monitoringInterval);
        timeSlotState.monitoringInterval = null;
    }
    
    // UI状態リセット
    safeCall('resetMonitoringUI');
    safeCall('updateMainButtonDisplay', 'idle');
    
    // エラー表示
    safeCall('showErrorMessage', errorMessage);
    
    // 状態初期化
    timeSlotState.mode = 'idle';
    timeSlotState.isMonitoring = false;
    multiTargetManager.clearAll();
    timeSlotState.retryCount = 0;
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

async function checkTimeSlotTableExistsAsync(): Promise<boolean> {
    const table = document.querySelector(timeSlotSelectors.timeSlotContainer);
    if (!table) {
        // テーブルが見つからない場合、カレンダークリックを試行
        console.log('⚠️ 時間帯テーブルが見つからないため、カレンダークリックを試行します');
        const calendarClicked = await safeCall('tryClickCalendarForTimeSlot');
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
    findTargetSlotInPage,
    terminateMonitoring,
    checkTargetElementExists,
    checkTimeSlotTableExistsAsync,
    validatePageLoaded,
    checkMaxReloads
};

// ============================================================================