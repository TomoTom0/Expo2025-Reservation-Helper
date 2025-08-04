// Section 5からのimport
import { startTimeSlotTableObserver } from './section5';

// 型定義のインポート
import type { 
    TimeSlotSelectors,
    TdStatus,
    TimeSlotTarget
} from '../types/index.js';

// 【4. DOM要素セレクタ・検索】
// ============================================================================

// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
const timeSlotSelectors: TimeSlotSelectors = {
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
function generateUniqueTdSelector(tdElement: HTMLTableCellElement): string {
    // td要素の親要素（tr）内での位置を取得
    const row = tdElement.parentElement as HTMLTableRowElement;
    const rowIndex = Array.from(row.parentElement!.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    // 設計書に基づく固定DOM構造での一意セレクタ
    return `table tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})[data-gray-out]`;
}

function getTdPositionInfo(tdElement: HTMLTableCellElement): { rowIndex: number; cellIndex: number } {
    const row = tdElement.parentElement as HTMLTableRowElement;
    const rowIndex = Array.from(row.parentElement!.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    return { rowIndex, cellIndex };
}

function findSameTdElement(targetInfo: TimeSlotTarget): HTMLTableCellElement | null {
    // 1. セレクタベースでの検索を優先
    if (targetInfo.tdSelector) {
        const element = document.querySelector(targetInfo.tdSelector) as HTMLTableCellElement;
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
                    return cells[targetInfo.positionInfo.cellIndex] as HTMLTableCellElement;
                }
            }
        }
    }
    
    return null;
}

function extractTdStatus(tdElement: HTMLTableCellElement): TdStatus | null {
    if (!tdElement) return null;
    
    const buttonDiv = tdElement.querySelector('div[role="button"]') as HTMLElement;
    if (!buttonDiv) return null;
    
    const timeSpan = buttonDiv.querySelector('dt span') as HTMLSpanElement;
    const timeText = timeSpan ? timeSpan.textContent?.trim() || '' : '';
    
    // 満員判定
    const isDisabled = buttonDiv.hasAttribute('data-disabled') && buttonDiv.getAttribute('data-disabled') === 'true';
    const hasFullIcon = buttonDiv.querySelector('img[src*="calendar_ng.svg"]');
    const isFull = isDisabled && !!hasFullIcon;
    
    // 利用可能判定
    const hasLowIcon = buttonDiv.querySelector('img[src*="ico_scale_low.svg"]');
    const hasHighIcon = buttonDiv.querySelector('img[src*="ico_scale_high.svg"]');
    const isAvailable = !isDisabled && !!(hasLowIcon || hasHighIcon);
    
    return {
        timeText,
        isFull,
        isAvailable,
        element: buttonDiv,
        tdElement
    };
}

// 時間帯監視機能の初期化
async function initTimeSlotMonitoring(): Promise<void> {
    console.log('時間帯監視機能を初期化中...');
    
    // カレンダーの存在確認
    const hasCalendar = await waitForCalendar();
    if (!hasCalendar) {
        console.log('カレンダーが見つかりません');
        return;
    }
    
    // DOM変化監視を開始（時間帯テーブルの動的生成を検出）
    startTimeSlotTableObserver();
    
    console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
}

// カレンダーの動的待機
async function waitForCalendar(timeout: number = 10000): Promise<boolean> {
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

// エクスポート
export {
    timeSlotSelectors,
    generateUniqueTdSelector,
    getTdPositionInfo,
    findSameTdElement,
    extractTdStatus,
    initTimeSlotMonitoring,
    waitForCalendar
};

// ============================================================================