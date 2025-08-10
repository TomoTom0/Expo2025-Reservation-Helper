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

// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
export const timeSlotSelectors: TimeSlotSelectors = {
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
export function generateUniqueTdSelector(tdElement: HTMLTableCellElement): string {
    // td要素の親要素（tr）内での位置を取得
    const row = tdElement.parentElement as HTMLTableRowElement;
    const rowIndex = Array.from(row.parentElement!.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    // 設計書に基づく固定DOM構造での一意セレクタ
    return `table tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})[data-gray-out]`;
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
                const cells = rows[targetInfo.positionInfo.rowIndex].querySelectorAll('td[data-gray-out]');
                if (cells[targetInfo.positionInfo.cellIndex]) {
                    return cells[targetInfo.positionInfo.cellIndex] as HTMLTableCellElement;
                }
            }
        }
    }
    
    return null;
}

export function extractTdStatus(tdElement: HTMLTableCellElement): TdStatus | null {
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
    
    // 選択状態判定
    const isSelected = buttonDiv.classList.contains('selected') || 
                      buttonDiv.hasAttribute('aria-selected') ||
                      buttonDiv.getAttribute('aria-pressed') === 'true';
    
    // ステータス判定
    let status: 'full' | 'available' | 'selected' | 'unknown';
    if (isSelected) {
        status = 'selected';
    } else if (isFull) {
        status = 'full';
    } else if (isAvailable) {
        status = 'available';
    } else {
        status = 'unknown';
    }
    
    return {
        timeText,
        isFull,
        isAvailable,
        isSelected,
        status,
        element: buttonDiv,
        tdElement
    };
}

// カレンダーの動的待機（time要素の存在も確認）
export async function waitForCalendar(timeout: number = 10000): Promise<boolean> {
    const startTime = Date.now();
    const checkInterval = 100; // 待機間隔を長めに設定
    
    console.log('カレンダーとtime要素の出現を待機中...');
    
    while (Date.now() - startTime < timeout) {
        // time[datetime]要素が実際に存在するかを確認
        const timeElements = document.querySelectorAll('time[datetime]');
        
        if (timeElements.length > 0) {
            console.log(`✅ カレンダーとtime要素が見つかりました (${timeElements.length}個のtime要素)`);
            
            // 追加待機: time要素が見つかってもすぐに使用せず、少し待つ
            await new Promise(resolve => setTimeout(resolve, 200));
            return true;
        }
        
        // デバッグ: 現在の状況を確認
        const tables = document.querySelectorAll('table');
        const buttons = document.querySelectorAll('[role="button"]');
        
        if (tables.length > 0 || buttons.length > 10) {
            console.log(`⏳ DOM要素は存在するがtime要素がまだ生成されていません (table: ${tables.length}, button: ${buttons.length})`);
        }
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.log('⏰ カレンダー待機がタイムアウトしました');
    
    // デバッグ情報
    const allTables = document.querySelectorAll('table');
    const allButtons = document.querySelectorAll('[role="button"]');
    const allTimeElements = document.querySelectorAll('time');
    console.log(`🔍 最終状態: table=${allTables.length}, button=${allButtons.length}, time=${allTimeElements.length}`);
    
    return false;
}

// 時間帯監視機能の初期化
export async function initTimeSlotMonitoring(): Promise<void> {
    console.log('時間帯監視機能を初期化中...');
    
    // カレンダーの存在確認
    const hasCalendar = await waitForCalendar();
    if (!hasCalendar) {
        console.log('カレンダーが見つかりません');
        return;
    }
    
    // DOM変化監視を開始（時間帯テーブルの動的生成を検出）
    // startTimeSlotTableObserverを動的importで取得（循環参照回避）
    const { startTimeSlotTableObserver } = await import('./entrance-page-core');
    startTimeSlotTableObserver();
    
    console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
}