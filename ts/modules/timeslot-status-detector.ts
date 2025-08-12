/**
 * 時間帯状態判定の統一関数
 * DOM要素を与えて状態を返すシンプルな共通関数
 */

export interface TimeslotStatus {
    isAvailable: boolean;   // 利用可能（空きあり）
    isFull: boolean;        // 満員
    isSelected: boolean;    // 選択中
    statusType: 'full' | 'selected' | 'available' | 'unknown'; // analyzeTimeSlotsと同じ分類
    timeText: string;       // 時間帯テキスト
}

/**
 * 時間帯セル（td要素）の状態を判定する統一関数
 * @param tdElement 時間帯のtd要素
 * @returns 状態情報またはnull
 */
export function detectTimeslotStatus(tdElement: HTMLTableCellElement | null): TimeslotStatus | null {
    if (!tdElement) return null;
    
    // DOM構造: .btnDivまたはdiv[role="button"]
    const buttonDiv = (tdElement.querySelector('.btnDiv') || tdElement.querySelector('div[role="button"]')) as HTMLElement;
    if (!buttonDiv) {
        console.log(`🔍 [統一関数] buttonDiv not found in td:`, tdElement.innerHTML.substring(0, 200));
        return null;
    }
    
    // 時間帯テキストを取得
    const timeSpan = buttonDiv.querySelector('dt span') as HTMLSpanElement;
    const timeText = timeSpan ? timeSpan.textContent?.trim() || '' : '';
    
    // 詳細な判定: 属性とアイコンの両方を確認
    const isDisabledByAttr = buttonDiv.getAttribute('data-disabled') === 'true';
    const hasFullIcon = !!buttonDiv.querySelector('img[src*="/asset/img/calendar_ng.svg"], img[alt*="満員"], img[alt*="予約不可"]');
    const hasAvailableIcon = !!buttonDiv.querySelector('img[src*="/asset/img/ico_scale_low.svg"], img[src*="/asset/img/ico_scale_high.svg"], img[alt*="空いて"], img[alt*="混雑"]');
    const isSelected = buttonDiv.getAttribute('aria-pressed') === 'true';
    
    // 状態判定のロジック（analyzeTimeSlotsと同じ）
    const isFull = hasFullIcon || isDisabledByAttr;
    const isAvailable = !isDisabledByAttr && hasAvailableIcon;
    
    let statusType: 'full' | 'selected' | 'available' | 'unknown';
    if (isFull) {
        statusType = 'full';
    } else if (isSelected) {
        statusType = 'selected';
    } else if (isAvailable) {
        statusType = 'available';
    } else {
        statusType = 'unknown';
    }
    
    return {
        isAvailable,
        isFull,
        isSelected,
        statusType,
        timeText
    };
}

/**
 * 時間帯ボタン要素の状態を判定する関数
 * @param buttonElement 時間帯のbutton要素 (div[role="button"])
 * @returns 状態情報またはnull
 */
export function detectTimeslotStatusFromButton(buttonElement: HTMLElement | null): TimeslotStatus | null {
    if (!buttonElement) return null;
    
    const tdElement = buttonElement.closest('td') as HTMLTableCellElement;
    return detectTimeslotStatus(tdElement);
}