// entrance-page-stateからのimport（もう使用しません）

// 入場予約状態管理システムからのimport
import { entranceReservationStateManager } from './entrance-reservation-state-manager';

// entrance-page-dom-utilsからのimport
import {
    timeSlotSelectors
} from './entrance-page-dom-utils';



// UI更新ヘルパー関数は外部関数として設定される

// 型定義のインポート
import type { 
    CacheManager
} from '../types/index.js';

// 【5. 時間帯分析システム】
// ============================================================================

// cacheManagerを設定するヘルパー関数（互換性のため保持）
export const setCacheManager = (_cm: CacheManager): void => {
    // 必要に応じて使用
};




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




















// エクスポート
export {
    checkTimeSlotTableExistsSync,
    getCurrentSelectedCalendarDate,
    waitForValidCalendarDate,
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









// 時間帯を自動選択して予約開始


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