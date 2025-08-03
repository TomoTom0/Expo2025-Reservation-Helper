/**
 * DOM要素セレクタ・検索モジュール
 * DOM操作・セレクタ・要素検索機能を提供
 */

// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
export const timeSlotSelectors = {
    // 時間帯選択エリア
    timeSlotContainer: "table",
    timeSlotCells: "td[data-gray-out] div[role='button']",
    
    // 状態判定 - 設計書の構造に基づく正確な定義
    availableSlots: "td[data-gray-out] div[role='button']:not([data-disabled='true'])",
    fullSlots: "td[data-gray-out] div[role='button'][data-disabled='true']",
    selectedSlot: "td[data-gray-out] div[role='button'][aria-pressed='true']",
    
    // アイコン判定 - img要素は div[role='button'] 内の dd 要素内に存在
    lowIcon: "img[src*='ico_scale_low.svg']",
    highIcon: "img[src*='ico_scale_high.svg']", 
    fullIcon: "img[src*='calendar_ng.svg']"
};

// td要素の一意特定機能
export function generateUniqueTdSelector(tdElement) {
    // td要素の親要素（tr）内での位置を取得
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    // 設計書に基づく固定DOM構造での一意セレクタ
    return `table tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})[data-gray-out]`;
}

export function getTdPositionInfo(tdElement) {
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    return { rowIndex, cellIndex };
}

export function findSameTdElement(targetInfo) {
    // 1. セレクタベースでの検索を優先
    if (targetInfo.tdSelector) {
        const element = document.querySelector(targetInfo.tdSelector);
        if (element) {
            return element;
        }
    }
    
    // 2. フォールバック: 位置情報による検索
    if (targetInfo.positionInfo && 
        targetInfo.positionInfo.rowIndex !== undefined && 
        targetInfo.positionInfo.cellIndex !== undefined) {
        const table = document.querySelector(timeSlotSelectors.timeSlotContainer);
        if (table) {
            const rows = table.querySelectorAll('tr');
            if (rows[targetInfo.positionInfo.rowIndex]) {
                const cells = rows[targetInfo.positionInfo.rowIndex].querySelectorAll('td[data-gray-out]');
                if (cells[targetInfo.positionInfo.cellIndex]) {
                    return cells[targetInfo.positionInfo.cellIndex];
                }
            }
        }
    }
    
    return null;
}

export function extractTdStatus(tdElement) {
    if (!tdElement) return null;
    
    const buttonDiv = tdElement.querySelector('div[role="button"]');
    if (!buttonDiv) return null;
    
    const timeSpan = buttonDiv.querySelector('dt span');
    const timeText = timeSpan ? timeSpan.textContent.trim() : '';
    
    // 満員判定
    const isDisabled = buttonDiv.hasAttribute('data-disabled') && buttonDiv.getAttribute('data-disabled') === 'true';
    const hasFullIcon = buttonDiv.querySelector(timeSlotSelectors.fullIcon);
    const isFull = isDisabled && hasFullIcon;
    
    // 利用可能判定
    const hasLowIcon = buttonDiv.querySelector(timeSlotSelectors.lowIcon);
    const hasHighIcon = buttonDiv.querySelector(timeSlotSelectors.highIcon);
    const isAvailable = !isDisabled && (hasLowIcon || hasHighIcon);
    
    // 選択済み判定
    const isSelected = buttonDiv.getAttribute('aria-pressed') === 'true';
    
    let status = 'unknown';
    if (isFull) status = 'full';
    else if (isSelected) status = 'selected';
    else if (isAvailable) status = 'available';
    
    return {
        timeText,
        status,
        isFull,
        isAvailable,
        isSelected,
        element: tdElement,
        buttonDiv
    };
}

// 時間帯監視機能の初期化
export async function initTimeSlotMonitoring() {
    console.log('時間帯監視機能を初期化中...');
    
    // カレンダーの存在確認
    const hasCalendar = await waitForCalendar();
    if (!hasCalendar) {
        console.log('カレンダーが見つかりません');
        return;
    }
    
    // DOM変化監視を開始（時間帯テーブルの動的生成を検出）
    // Note: startTimeSlotTableObserverは monitor/timeSlot.js で定義される
    if (typeof startTimeSlotTableObserver === 'function') {
        startTimeSlotTableObserver();
    }
    
    console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
}

// カレンダーの動的待機
export async function waitForCalendar(timeout = 10000) {
    const startTime = Date.now();
    const checkInterval = 500;
    
    console.log('カレンダーの出現を待機中...');
    
    while (Date.now() - startTime < timeout) {
        // :has()のフォールバック - カレンダーテーブルを検索
        let calendar = document.querySelector('table:has(time[datetime])');
        if (!calendar) {
            // :has()がサポートされていない場合のフォールバック
            calendar = document.querySelector('[class*="calendar_table"]');
            if (!calendar) {
                const tables = document.querySelectorAll('table');
                for (const table of tables) {
                    if (table.querySelectorAll('time[datetime]').length > 0) {
                        calendar = table;
                        break;
                    }
                }
            }
        }
        
        if (calendar) {
            // カレンダー要素内の日付要素も確認
            const dateElements = calendar.querySelectorAll('time[datetime]');
            if (dateElements.length > 0) {
                console.log(`カレンダーを検出しました（日付要素: ${dateElements.length}個）`);
                return true;
            } else {
                console.log('カレンダー要素はあるが、日付要素がまだ読み込まれていません');
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.log('カレンダーの待機がタイムアウトしました');
    return false;
}