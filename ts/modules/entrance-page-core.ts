// entrance-page-stateからのimport（もう使用しません）

// 入場予約状態管理システムからのimport
import { LocationHelper, entranceReservationStateManager } from './entrance-reservation-state-manager';

// entrance-page-dom-utilsからのimport
import {
    timeSlotSelectors,
    generateUniqueTdSelector,
    extractTdStatus
} from './entrance-page-dom-utils';

// entrance-page-fabからのimport
import { entranceReservationHelper } from './entrance-page-fab';

// audio-playerからのimport
import { AudioPlayer } from './audio-player';



// UI更新ヘルパー関数は外部関数として設定される

// 型定義のインポート
import type { 
    TimeSlotInfo,
    CacheManager
} from '../types/index.js';

// 【5. 時間帯分析システム】
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

// 時間帯テーブルの動的生成を検出（ループ防止版）
function startTimeSlotTableObserver(): void {
    console.log('時間帯テーブルの動的生成検出を開始');
    
    let isProcessing = false; // 処理中フラグでループ防止
    let lastTableContent = ''; // 前回のテーブル内容を記録
    
    // MutationObserverで DOM変化を検知
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
                                   element.querySelector('div[role="button"]') ||
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
                // 属性変更も検知（data-disabled、src等）
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
                
                // テーブル内容を記録
                lastTableContent = getCurrentTableContent();
                isProcessing = false;
            }, 800);
        }
    });
    
    // 検知範囲を限定（属性変更も検知）
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
            lastTableContent = getCurrentTableContent();
            isProcessing = false;
        }
    }, 1000);
    
    console.log('継続的な時間帯テーブル検知を開始しました（ループ防止版）');
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

















// エクスポート
export {
    startTimeSlotTableObserver,
    waitForTimeSlotTable,
    checkTimeSlotTableExistsSync,
    analyzeTimeSlots,
    extractTimeSlotInfo,
    generateSelectorForElement,
    getCurrentSelectedCalendarDate,
    waitForValidCalendarDate,
    clickCalendarDate,
    tryClickCalendarForTimeSlot,
    showErrorMessage,
    restoreSelectionAfterUpdate,
    selectTimeSlotAndStartReservation,
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
// FAB更新の状態管理（統一状態管理システムで管理）

// 現在のFAB状態を文字列として取得
export function getCurrentFabState(): string {
    if (!entranceReservationStateManager) return 'no-manager';
    
    const mode = getCurrentMode();
    const executionState = entranceReservationStateManager.getExecutionState();
    const hasReservation = entranceReservationStateManager.hasReservationTarget();
    return `${mode}-${executionState}-${hasReservation}`;
}

// FAB表示更新は統一状態管理システムで直接処理

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
        case 'idle':
            // 推奨アクションを確認
            const preferredAction = entranceReservationStateManager.getPreferredAction();
            switch (preferredAction) {
                case 'reservation':
                    return 'idle'; // 予約可能状態
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
            message = '準備完了';
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
        
        // 効率モードの5秒前警告（予約実行中）
        if (mode === 'reservation-running' && entranceReservationStateManager.isEfficiencyModeEnabled()) {
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
        // 統一状態管理システムによる更新
        entranceReservationStateManager.updateFabDisplay();
    }
}

// 前の選択をリセット
export function resetPreviousSelection(): void {
    // すべての対象をクリア
    if (entranceReservationStateManager) {
        entranceReservationStateManager.clearAllTargets();
    }
}






// 統一されたリロードスケジュール関数
export function scheduleReload(seconds: number = 30): void {
    console.log(`🔄 統一リロードスケジュール開始: ${seconds}秒`);
    
    
    // 入場予約状態管理システムでリロードカウントダウンを開始
    if (entranceReservationStateManager) {
        entranceReservationStateManager.scheduleReload(seconds);
        console.log(`📊 リロードスケジュール時の状態: ${entranceReservationStateManager.getExecutionState()}`);
    }
    
    
    // 即座に一度UI更新
    entranceReservationStateManager.updateFabDisplay();
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
    entranceReservationStateManager.updateFabDisplay();
}

// 中断操作が許可されているかチェック
export function isInterruptionAllowed(): boolean {
    // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
    if (entranceReservationStateManager) {
        const isNearReload = false;
        // console.log(`🔍 中断可否チェック: nearReload=${isNearReload}`);
        return !isNearReload;
    }
    return true; // フォールバック：統合システムが利用できない場合は中断を許可
}

// ページ読み込み時のキャッシュ復元
export async function restoreFromCache(): Promise<void> {
    if (!cacheManagerSection6) return;
    
    
    const cached = cacheManagerSection6.loadTargetSlots();
    if (!cached) return;
    
    console.log('🔄 キャッシュから状態を復元中...');
    
    // キャッシュされた日付と現在のカレンダー日付を比較し、必要に応じて日付移動を実行
    if (cached.selectedDate && cached.targets && cached.targets.length > 0) {
        const currentSelectedDate = getCurrentSelectedCalendarDate();
        
        console.log(`📅 日付比較: キャッシュ=${cached.selectedDate}, 現在=${currentSelectedDate}`);
        
        if (cached.selectedDate !== currentSelectedDate) {
            console.log(`📅 キャッシュされた日付への移動が必要: ${cached.selectedDate}`);
            
            // カレンダーが利用可能になるまで待機
            const calendarReady = await waitForCalendar(5000);
            if (!calendarReady) {
                console.error('❌ カレンダーの準備完了を待機中にタイムアウトしました');
                return;
            }
            
            // 指定日付のカレンダーをクリック
            const dateClickSuccess = await clickCalendarDate(cached.selectedDate);
            if (!dateClickSuccess) {
                console.error(`❌ キャッシュされた日付への移動に失敗: ${cached.selectedDate}`);
                return;
            }
            
            console.log(`✅ キャッシュされた日付に移動完了: ${cached.selectedDate}`);
            
            // 日付移動後、時間帯テーブルが更新されるまで待機
            const tableReady = await waitForTimeSlotTable(5000);
            if (!tableReady) {
                console.error('❌ 時間帯テーブルの更新完了を待機中にタイムアウトしました');
                return;
            }
        }
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
        
        // メインボタンの表示更新
        entranceReservationStateManager.updateFabDisplay();
        
        console.log('✅ キャッシュ復元完了');
        
    }, 200);
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
            // 50回に1回だけログ出力（過剰ログ防止）
            if ((i + 1) % 50 === 0) {
                console.log(`⏳ time要素待機中 (${i + 1}/${maxRetries})`);
            }
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


// 日付変更後の選択状態復元
function restoreSelectionAfterUpdate(): void {
    
    
    entranceReservationStateManager.updateFabDisplay();
}


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
                        entranceReservationStateManager.updateFabDisplay(); // FAB表示更新
                        
                        // 通知音が有効な場合は成功音を再生
                        const soundEnabled = entranceReservationStateManager.isNotificationSoundEnabled();
                        console.log(`🔍 予約成功時の通知音設定チェック: ${soundEnabled ? '有効' : '無効'}`);
                        
                        if (soundEnabled) {
                            console.log('🎵 予約成功 - 通知音を再生');
                            try {
                                AudioPlayer.playSuccessSound();
                                console.log('✅ 通知音再生完了');
                            } catch (error) {
                                console.error('❌ 通知音再生エラー:', error);
                            }
                        } else {
                            console.log('🔇 予約成功 - 通知音は無効のため再生なし');
                        }
                    }
                }
                
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                }
                console.log('✅ 予約が成功しました！');
            }
        }
    }, 1000);
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