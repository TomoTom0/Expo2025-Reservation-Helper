// ============================================================================
// 【入場予約DOM操作ユーティリティ】 
// ============================================================================
// 循環参照解決のための基盤モジュール
// DOM操作、セレクタ定義、基本的な待機関数を提供

// 型定義のインポート
import type { 
    TimeSlotSelectors,
    TdStatus,
    TimeSlotTarget
} from '../types/index.js';
import { loggers } from '../utils/logger';
const logger = loggers.ui;

// 統一時間帯状態判定関数をimport
import { detectTimeslotStatus } from './timeslot-status-detector';

// テーブルセレクタ辞書
export const tableSelectors = {
    timeSlotTable: "table[class*='style_main__timetable__']",
    calendarTable: "table[class*='style_main__calendar__']"
};

// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
export const timeSlotSelectors: TimeSlotSelectors = {
    // 時間帯選択エリア
    timeSlotContainer: tableSelectors.timeSlotTable,
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
export function generateUniqueTdSelector(tdElement: HTMLTableCellElement): string {
    // td要素の親要素（tr）内での位置を取得
    const row = tdElement.parentElement as HTMLTableRowElement;
    const rowIndex = Array.from(row.parentElement!.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    // 時間帯テーブル専用の固有セレクタ
    return `${tableSelectors.timeSlotTable} tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`;
}

export function getTdPositionInfo(tdElement: HTMLTableCellElement): { rowIndex: number; cellIndex: number } {
    const row = tdElement.parentElement as HTMLTableRowElement;
    const rowIndex = Array.from(row.parentElement!.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    return { rowIndex, cellIndex };
}

export function findSameTdElement(targetInfo: TimeSlotTarget): HTMLTableCellElement | null {
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
                // 時間帯セルのみを対象（data-gray-out属性の有無に関係なく）
                const allCells = rows[targetInfo.positionInfo.rowIndex].querySelectorAll('td');
                const cells = Array.from(allCells).filter(cell => 
                    cell.querySelector('div[role="button"]')
                ) as HTMLTableCellElement[];
                if (cells[targetInfo.positionInfo.cellIndex]) {
                    return cells[targetInfo.positionInfo.cellIndex] as HTMLTableCellElement;
                }
            }
        }
    }
    
    return null;
}

export function extractTdStatus(tdElement: HTMLTableCellElement): TdStatus | null {
    // 統一状態判定関数を使用
    const result = detectTimeslotStatus(tdElement);
    if (!result) return null;
    
    // DOM構造: .btnDivまたはdiv[role="button"]のどちらでも対応
    const buttonDiv = (tdElement.querySelector('.btnDiv') || tdElement.querySelector('div[role="button"]')) as HTMLElement;
    if (!buttonDiv) return null;
    
    return {
        timeText: result.timeText,
        isFull: result.isFull,
        isAvailable: result.isAvailable,
        isSelected: result.isSelected,
        status: result.statusType,
        element: buttonDiv,
        tdElement
    };
}

// カレンダーの動的待機（time要素の存在も確認）
export async function waitForCalendar(timeout: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 100; // 待機間隔を長めに設定
    
    logger.debug('カレンダーとtime要素の出現を待機中');
    
    while (Date.now() - startTime < timeout) {
        // time[datetime]要素が実際に存在するかを確認
        const timeElements = document.querySelectorAll('time[datetime]');
        
        if (timeElements.length > 0) {
            logger.debug('カレンダーとtime要素が見つかりました', { timeElementCount: timeElements.length });
            
            // 追加待機: time要素が見つかってもすぐに使用せず、少し待つ
            await new Promise(resolve => setTimeout(resolve, 200));
            return true;
        }
        
        // デバッグ: 現在の状況を確認
        const tables = document.querySelectorAll('table');
        const buttons = document.querySelectorAll('[role="button"]');
        
        if (tables.length > 0 || buttons.length > 10) {
            // DOM要素待機中（ログ削減）
        }
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    logger.warn('カレンダー待機がタイムアウトしました');
    
    // デバッグ情報
    const allTables = document.querySelectorAll('table');
    const allButtons = document.querySelectorAll('[role="button"]');
    const allTimeElements = document.querySelectorAll('time');
    logger.debug('最終状態', { 
        tableCount: allTables.length, 
        buttonCount: allButtons.length, 
        timeElementCount: allTimeElements.length 
    });
    
    return false;
}

