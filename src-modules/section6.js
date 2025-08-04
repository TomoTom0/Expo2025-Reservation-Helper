// Section 2からのimport
import { 
    multiTargetManager, 
    entranceReservationState, 
    timeSlotState,
    reloadCountdownState,
    calendarWatchState,
    pageLoadingState
} from './section2.ts';

// Section 4からのimport
import {
    timeSlotSelectors,
    generateUniqueTdSelector,
    extractTdStatus,
    waitForCalendar,
    findSameTdElement
} from './section4.js';

// Section 5からのimport
import {
    updateAllMonitorButtonPriorities,
    analyzeTimeSlots,
    checkTimeSlotTableExistsSync,
    checkTimeSlotTableExistsAsync,
    waitForTimeSlotTable,
    startSlotMonitoring
} from './section5.js';


// 【6. カレンダー・UI状態管理】
// ============================================================================

// 依存注入用の参照
let cacheManager = null;
let entranceReservationHelper = null;
let canStartReservation = null;

// cacheManagerを設定するヘルパー関数
export const setCacheManagerForSection6 = (cm) => {
    cacheManager = cm;
};

// entranceReservationHelperを設定するヘルパー関数
export const setEntranceReservationHelper = (helper) => {
    entranceReservationHelper = helper;
};

// canStartReservationを設定するヘルパー関数
export const setCanStartReservation = (fn) => {
    canStartReservation = fn;
};

// 時間帯表示のためのカレンダー自動クリック機能
// 現在選択されているカレンダー日付を取得
function getCurrentSelectedCalendarDate() {
    try {
        // 安定したセレクタで選択済み要素を検索
        const selectedSelectors = [
            '[aria-pressed="true"] time[datetime]',
            '[class*="selector_date"] time[datetime]'
        ];
        
        for (const selector of selectedSelectors) {
            const timeElement = document.querySelector(selector);
            if (timeElement) {
                const datetime = timeElement.getAttribute('datetime');
                // console.log(`📅 現在選択中のカレンダー日付: ${datetime} (${selector})`);
                return datetime;
            }
        }
        
        // さらなるフォールバック: 任意のaria-pressed="true"要素内のtime要素
        const anySelected = document.querySelectorAll('[aria-pressed="true"]');
        for (const el of anySelected) {
            const timeElement = el.querySelector('time[datetime]');
            if (timeElement) {
                const datetime = timeElement.getAttribute('datetime');
                console.log(`📅 現在選択中のカレンダー日付（フォールバック）: ${datetime}`);
                return datetime;
            }
        }
        
        console.log('⚠️ 選択中のカレンダー日付が見つかりません');
        
        // デバッグ: 利用可能なカレンダー要素を表示
        const allCalendarElements = document.querySelectorAll('[role="button"][aria-pressed]');
        console.log(`📅 利用可能なカレンダー要素数: ${allCalendarElements.length}`);
        allCalendarElements.forEach((el, i) => {
            const pressed = el.getAttribute('aria-pressed');
            const timeEl = el.querySelector('time');
            const datetime = timeEl ? timeEl.getAttribute('datetime') : 'N/A';
            console.log(`  ${i + 1}. aria-pressed="${pressed}" datetime="${datetime}"`);
        });
        
        return null;
    } catch (error) {
        console.error('❌ カレンダー日付取得エラー:', error);
        return null;
    }
}

// 指定された日付のカレンダーをクリック
async function clickCalendarDate(targetDate) {
    console.log(`📅 指定日付のカレンダークリックを試行: ${targetDate}`);
    
    try {
        // 指定日付のカレンダー要素を検索（実際のHTML構造に基づく）
        const timeElement = document.querySelector(`time[datetime="${targetDate}"]`);
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
        const targetElement = timeElement.closest('div[role="button"]');
        
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
        
        // クリック結果を待機
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // クリック成功確認
        const isNowSelected = targetElement.getAttribute('aria-pressed') === 'true' ||
                            targetElement.classList.contains('selected') ||
                            targetElement.querySelector('time')?.getAttribute('datetime') === targetDate;
        
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

async function tryClickCalendarForTimeSlot() {
    console.log('📅 時間帯表示のためのカレンダークリックを試行中...');
    
    // 監視対象確認（情報表示のみ）
    if (multiTargetManager.hasTargets()) {
        const targetTexts = multiTargetManager.getTargets().map(t => t.timeText).join(', ');
        console.log(`🎯 監視対象: ${targetTexts} (${multiTargetManager.getCount()}個)`);
    }
    
    // 1. カレンダー要素を検索
    const calendarSelectors = [
        '.style_main__calendar__HRSsz',
        '[class*="calendar"]',
        'button[role="button"]:has(.style_main__calendar__HRSsz)',
        'div[class*="calendar"] button'
    ];
    
    let calendarElement = null;
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
    
    let clickableDate = null;
    
    // 現在選択されている日付を探す（これのみが対象）
    for (const selector of dateSelectors) {
        const dates = document.querySelectorAll(selector);
        for (const date of dates) {
            if (date.classList.contains('selected') || 
                date.classList.contains('active') ||
                date.getAttribute('aria-selected') === 'true') {
                clickableDate = date;
                console.log(`📅 現在選択中の日付を発見: ${date.textContent.trim()}`);
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
        console.log(`🖱️ 日付をクリック: "${clickableDate.textContent.trim()}"`);
        
        // マウスイベントを発火
        const clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
        });
        
        clickableDate.dispatchEvent(clickEvent);
        
        // 少し待機してクリック結果を確認
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        console.log('✅ カレンダー日付のクリックを実行しました');
        return true;
        
    } catch (error) {
        console.error('❌ カレンダークリック中にエラー:', error);
        return false;
    }
}

// エラー表示機能
function showErrorMessage(message) {
    // 既存のエラーメッセージがあれば削除
    const existingError = document.getElementById('ytomo-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    // エラーメッセージ要素を作成
    const errorDiv = document.createElement('div');
    errorDiv.id = 'ytomo-error-message';
    errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #ff4444;
        color: white;
        padding: 15px;
        border-radius: 5px;
        font-size: 14px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    errorDiv.innerHTML = `
        <div style="font-weight: bold; margin-bottom: 5px;">⚠️ 監視エラー</div>
        <div>${message}</div>
        <button onclick="this.parentElement.remove()" style="
            background: transparent;
            border: 1px solid white;
            color: white;
            padding: 5px 10px;
            margin-top: 10px;
            border-radius: 3px;
            cursor: pointer;
        ">閉じる</button>
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
function resetMonitoringUI() {
    // すべての監視ボタンを有効化
    enableAllMonitorButtons();
    
    // 選択中の監視ボタンを元に戻す
    const selectedButtons = document.querySelectorAll('.ext-ytomo.monitor-btn');
    selectedButtons.forEach(button => {
        const span = button.querySelector('span');
        if (span && span.innerText.startsWith('監視')) {
            span.innerText = '満員';
            button.style.background = 'rgb(255, 140, 0)';
            button.disabled = false;
        }
    });
}

// 時間帯を自動選択して予約開始
async function selectTimeSlotAndStartReservation(slotInfo) {
    const location = multiTargetManager.getLocationFromSelector(slotInfo.targetInfo.tdSelector);
    console.log(`🎯 時間帯を自動選択します: ${location}${slotInfo.timeText}`);
    
    // クリック対象のdl要素を探す
    let clickTarget = null;
    
    // TD要素の場合はdl要素を探す
    if (slotInfo.element.tagName === 'TD') {
        clickTarget = slotInfo.element.querySelector('div[role="button"] dl');
        if (clickTarget) {
            console.log('🔧 TD要素内のdl要素を発見しました');
        } else {
            console.error('❌ TD要素内にdl要素が見つかりません');
            return;
        }
    } else {
        // TD以外の場合はdl要素を探す
        clickTarget = slotInfo.element.querySelector('dl');
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
    
    // 選択状態確認のため少し待つ
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // 選択状態を確認（ボタン要素の状態をチェック）
    const buttonElement = slotInfo.element.querySelector('div[role="button"]');
    const isSelected = buttonElement && (
        Array.from(buttonElement.classList).some(className => className.includes('style_active__')) || 
        buttonElement.getAttribute('aria-pressed') === 'true'
    );
    console.log(`🔍 時間帯選択状態確認: ${isSelected ? '選択済み' : '未選択'}`);
    
    if (!isSelected) {
        console.warn(`⚠️ 時間帯が選択されていません。再試行します`);
        // 再試行 - dl要素を再度クリック
        clickTarget.click();
        await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 少し待ってから予約処理開始
    setTimeout(async () => {
        console.log('🚀 予約処理を開始します');
        
        // 予約開始前に時間帯選択を最終確認
        const finalButtonElement = slotInfo.element.querySelector('div[role="button"]');
        const finalCheck = finalButtonElement && (
            Array.from(finalButtonElement.classList).some(className => className.includes('style_active__')) || 
            finalButtonElement.getAttribute('aria-pressed') === 'true'
        );
        console.log(`🔍 予約開始前最終確認: 時間帯選択=${finalCheck ? '✅選択済み' : '❌未選択'}`);
        
        if (!finalCheck) {
            console.error(`❌ 時間帯が選択されていないため予約処理を中止します`);
            return;
        }
        
        // 監視停止
        stopSlotMonitoring();
        
        // 通常の予約処理を開始
        const config = getCurrentEntranceConfig();
        if (config) {
            entranceReservationState.isRunning = true;
            const result = await entranceReservationHelper(config);
            
            if (result.success) {
                cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                console.log('✅ 予約が成功しました！');
            }
        }
    }, 1000);
}

// 監視停止（監視対象選択は維持）
function stopSlotMonitoring() {
    timeSlotState.isMonitoring = false;
    
    // 監視継続フラグをクリア（手動停止なので継続させない）
    cacheManager.clearMonitoringFlag();
    
    // リロードカウントダウンも確実に停止
    stopReloadCountdown();
    
    // 監視対象が設定されている場合は選択状態に戻す
    if (multiTargetManager.hasTargets()) {
        timeSlotState.mode = 'selecting';
    } else {
        timeSlotState.mode = 'idle';
    }
    
    if (timeSlotState.monitoringInterval) {
        clearInterval(timeSlotState.monitoringInterval);
        timeSlotState.monitoringInterval = null;
    }
    
    // 監視ボタンを有効化（操作可能に戻す）
    enableAllMonitorButtons();
    
    // メインボタンの表示を更新
    updateMainButtonDisplay();
    
    console.log('⏹️ 時間帯監視を停止しました（監視対象選択は維持）');
}

// 現在の設定を取得（ヘルパー関数）
function getCurrentEntranceConfig() {
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

// 前の選択をリセット
function resetPreviousSelection() {
    // すべての監視対象をクリア
    multiTargetManager.clearAll();
    
    // ボタンの表示を「満員」に戻す
    updateAllMonitorButtonPriorities();
}

// 他の監視ボタンを無効化（複数監視対象対応版）
function disableOtherMonitorButtons(selectedTimeText, selectedTdSelector) {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        const targetTime = button.getAttribute('data-target-time');
        const buttonTd = button.closest('td[data-gray-out]');
        const buttonTdSelector = buttonTd ? generateUniqueTdSelector(buttonTd) : '';
        
        // 同じ時間+位置でない場合は無効化
        if (!(targetTime === selectedTimeText && buttonTdSelector === selectedTdSelector)) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.disabled = true;
        }
    });
}

// 全ての監視ボタンを有効化
function enableAllMonitorButtons() {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span');
        
        // すべてのボタンを有効化
        button.style.opacity = '1';
        button.style.cursor = 'pointer';
        button.disabled = false;
        
        // 監視対象のボタンは緑色を維持
        if (span && span.innerText.startsWith('監視')) {
            button.style.background = 'rgb(0, 104, 33)';
        }
        
        // ツールチップをクリア
        button.title = '';
    });
    console.log('✅ すべての監視ボタンを有効化しました（選択中も含む）');
}

// 全ての監視ボタンを無効化（監視実行中用）
function disableAllMonitorButtons() {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
        button.disabled = true;
        
        // ツールチップで理由を表示
        button.title = '監視実行中のため操作できません';
    });
    console.log('🔒 すべての監視ボタンを無効化しました（監視実行中）');
}

// 既存の監視ボタンをクリア（日付変更時など）
function clearExistingMonitorButtons() {
    const existingButtons = document.querySelectorAll('.monitor-btn');
    console.log(`${existingButtons.length}個の既存監視ボタンをクリアします`);
    existingButtons.forEach(button => {
        button.remove();
    });
}

// 現在のテーブル内容を取得（変化検出用）
function getCurrentTableContent() {
    const tables = document.querySelectorAll('table');
    let content = '';
    
    tables.forEach(table => {
        const timeSlots = table.querySelectorAll('td div[role="button"]');
        timeSlots.forEach(slot => {
            const timeText = slot.querySelector('dt span')?.textContent?.trim();
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
function shouldUpdateMonitorButtons() {
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
    const buttonTimeTexts = Array.from(existingButtons).map(btn => btn.getAttribute('data-target-time'));
    
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
function restoreSelectionAfterUpdate() {
    if (!multiTargetManager.hasTargets()) return;
    
    const targets = multiTargetManager.getTargets();
    const targetTexts = targets.map(t => t.timeText).join(', ');
    console.log(`選択状態を復元中: ${targetTexts}`);
    
    // 該当する時間帯の監視ボタンを探して選択状態にする
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    let restoredCount = 0;
    
    targets.forEach(target => {
        monitorButtons.forEach(button => {
            const buttonTargetTime = button.getAttribute('data-target-time');
            const buttonTdElement = button.closest('td[data-gray-out]');
            const buttonTdSelector = buttonTdElement ? generateUniqueTdSelector(buttonTdElement) : '';
            
            // 時間+位置で一致するかチェック
            if (buttonTargetTime === target.timeText && buttonTdSelector === target.tdSelector) {
                const span = button.querySelector('span');
                if (span) {
                    // 監視対象リストでの位置を取得
                    const allTargets = multiTargetManager.getTargets();
                    const targetIndex = allTargets.findIndex(
                        t => t.timeText === target.timeText && t.tdSelector === target.tdSelector
                    );
                    
                    if (targetIndex >= 0) {
                        const priority = targetIndex + 1;
                        span.innerText = `監視${priority}`;
                    } else {
                        span.innerText = '監視1'; // フォールバック
                    }
                    button.style.background = 'rgb(0, 104, 33)';
                    restoredCount++;
                    
                    console.log(`✅ 選択状態を復元しました: ${target.timeText}`);
                }
            }
        });
    });
    
    if (restoredCount === 0) {
        console.log(`⚠️ 対象時間帯が見つからないため選択状態をリセット: ${targetTexts}`);
        // 対象時間帯がない場合は状態をリセット
        multiTargetManager.clearAll();
        timeSlotState.mode = 'idle';
        cacheManager.clearTargetSlots();
    }
    
    updateMainButtonDisplay();
}

// メインボタンの表示更新（FAB形式対応）
function updateMainButtonDisplay(forceMode = null) {
    const fabButton = document.querySelector('#ytomo-main-fab');
    const statusBadge = document.querySelector('#ytomo-status-badge');
    
    if (fabButton && statusBadge) {
        const span = fabButton.querySelector('span');
        if (span) {
            const currentMode = forceMode || getCurrentMode();
            
            // デバッグ情報
            const targetTexts = multiTargetManager.hasTargets() ? multiTargetManager.getTargets().map(t => t.timeText).join(', ') : 'なし';
            // console.log(`🔄 FAB更新: mode=${currentMode}, targetSlots=${targetTexts}, stateMode=${timeSlotState.mode}, isMonitoring=${timeSlotState.isMonitoring}`);
            // console.log(`🔍 getCurrentMode判定: loading=${pageLoadingState?.isLoading}, monitoring=${timeSlotState.isMonitoring}, reservationRunning=${entranceReservationState.isRunning}, hasTargets=${multiTargetManager.hasTargets()}, modeSelecting=${timeSlotState.mode === 'selecting'}`);
            
            switch (currentMode) {
                case 'monitoring':
                    // 監視実行中 - 中断可能かどうかで表示を区別
                    if (!isInterruptionAllowed()) {
                        // 中断不可期間（リロード直前）
                        span.innerText = '継続\n中断';
                        fabButton.style.background = 'rgb(220, 53, 69) !important'; // 赤色
                        fabButton.style.opacity = '0.6 !important';
                        fabButton.style.cursor = 'not-allowed !important';
                        fabButton.title = '監視継続中断（リロード直前のため中断不可）';
                        fabButton.disabled = true;
                    } else {
                        // 通常の中断可能期間
                        span.innerText = '監視\n中断';
                        fabButton.style.background = 'rgb(255, 140, 0) !important'; // オレンジ色
                        fabButton.style.opacity = '0.9 !important';
                        fabButton.style.cursor = 'pointer !important';
                        fabButton.title = '監視中断（クリックで監視を停止）';
                        fabButton.disabled = false;
                    }
                    updateStatusBadge('monitoring');
                    break;
                    
                case 'reservation-running':
                    // 予約実行中
                    span.innerText = '予約\n中断';
                    fabButton.style.background = 'rgb(255, 140, 0) !important'; // オレンジ色
                    fabButton.style.opacity = '0.9 !important'; // 通常の透明度
                    fabButton.style.cursor = 'pointer !important';
                    fabButton.title = '予約中断';
                    fabButton.disabled = false; // 有効化
                    updateStatusBadge('reservation-running');
                    break;
                    
                case 'selecting':
                    // 監視対象設定済み、開始待ち
                    console.log(`✅ selecting ケース実行: 監視予約開始として有効化`);
                    span.innerText = '監視予約\n開始';
                    fabButton.style.setProperty('background', 'rgb(0, 104, 33)', 'important'); // 強制適用
                    fabButton.style.setProperty('opacity', '0.9', 'important');
                    fabButton.style.setProperty('cursor', 'pointer', 'important');
                    fabButton.style.setProperty('pointer-events', 'auto', 'important');
                    fabButton.title = '監視予約開始';
                    fabButton.disabled = false; // 有効化
                    fabButton.removeAttribute('disabled'); // HTML属性も削除
                    // クラスによる干渉も除去
                    fabButton.classList.remove('disabled');
                    updateStatusBadge('selecting');
                    break;
                    
                case 'found-available':
                    // 利用可能検出後
                    span.innerText = '予約\n実行中';
                    fabButton.style.background = 'rgb(0, 200, 0) !important'; // 明るい緑色
                    fabButton.style.opacity = '0.6 !important'; // より透明に
                    fabButton.style.cursor = 'not-allowed !important';
                    fabButton.title = '見つかりました！予約try中...';
                    fabButton.disabled = true; // 実行中は無効化
                    updateStatusBadge('found-available');
                    break;
                    
                case 'loading':
                    // 読み込み中
                    span.innerText = '読み込み\n中';
                    fabButton.style.background = 'rgb(108, 117, 125) !important'; // グレー色
                    fabButton.style.opacity = '0.6 !important'; // より透明に
                    fabButton.style.cursor = 'not-allowed !important';
                    fabButton.title = '情報読み込み中...';
                    fabButton.disabled = true; // 読み込み中は無効化
                    updateStatusBadge('loading');
                    break;
                    
                case 'idle':
                default:
                    console.log(`🔄 idle ケース実行`);
                    // 監視対象が設定されている場合は selecting モードになるはずだが、
                    // 念のため idle でも監視対象の有無を確認
                    if (multiTargetManager.hasTargets()) {
                        // 監視対象設定済み - selectingモードに移行すべき
                        console.log(`✅ idle内で監視対象検出: 監視予約開始として有効化`);
                        span.innerText = '監視予約\n開始';
                        fabButton.style.background = 'rgb(0, 104, 33) !important'; // 緑色
                        fabButton.style.opacity = '0.9 !important';
                        fabButton.style.cursor = 'pointer !important';
                        fabButton.title = '監視予約開始';
                        fabButton.disabled = false; // 有効化
                        fabButton.removeAttribute('disabled'); // HTML属性も削除
                        fabButton.style.pointerEvents = 'auto !important'; // クリック有効化
                        updateStatusBadge('selecting');
                    } else {
                        // 通常の予約開始 - 条件に応じてdisabled状態を制御
                        span.innerText = '予約\n開始';
                        
                        const canStart = canStartReservation();
                        
                        if (canStart) {
                            // 予約開始可能
                            fabButton.style.background = 'rgb(0, 104, 33) !important'; // 緑色
                            fabButton.style.opacity = '0.9 !important';
                            fabButton.style.cursor = 'pointer !important';
                            fabButton.title = '予約開始';
                            fabButton.disabled = false; // 有効化
                            fabButton.removeAttribute('disabled'); // HTML属性も削除
                            fabButton.style.pointerEvents = 'auto !important'; // クリック有効化
                            updateStatusBadge('idle');
                        } else {
                            // 条件未満足 - disabled状態
                            const selectedDate = getCurrentSelectedCalendarDate();
                            const hasTimeSlotTable = checkTimeSlotTableExistsSync();
                            
                            if (!selectedDate || !hasTimeSlotTable) {
                                // カレンダー未選択または時間帯テーブル未表示
                                fabButton.title = '待機中（カレンダーで日付を選択してください）';
                            } else {
                                // テーブルはあるが他の条件が満たされていない
                                fabButton.title = '時間帯を選択し、来場日時設定ボタンが有効になるまでお待ちください';
                            }
                            
                            fabButton.style.background = 'rgb(128, 128, 128) !important'; // グレー色
                            fabButton.style.opacity = '0.9 !important';
                            fabButton.style.cursor = 'not-allowed !important';
                            fabButton.disabled = true; // 無効化
                            fabButton.setAttribute('disabled', 'disabled'); // HTML属性も設定
                            fabButton.style.pointerEvents = 'none !important'; // CSS レベルでもクリック無効化
                            updateStatusBadge('waiting');
                        }
                    }
                    break;
            }
        }
    }
}

// 現在のモードを取得するヘルパー関数
function getCurrentMode() {
    if (pageLoadingState && pageLoadingState.isLoading) {
        return 'loading';
    } else if (timeSlotState.isMonitoring) {
        return 'monitoring';
    } else if (entranceReservationState.isRunning) {
        return 'reservation-running';
    } else if (multiTargetManager.hasTargets() && timeSlotState.mode === 'selecting') {
        return 'selecting';
    } else {
        return 'idle';
    }
}

// ステータスバッジの更新
function updateStatusBadge(mode) {
    const statusBadge = document.querySelector('#ytomo-status-badge');
    if (!statusBadge) return;
    
    let message = '';
    let bgColor = 'rgba(0, 0, 0, 0.8)';
    
    switch (mode) {
        case 'monitoring':
            message = '監視実行中';
            if (reloadCountdownState.secondsRemaining !== null) {
                if (reloadCountdownState.secondsRemaining <= 3) {
                    message = `監視中\nリロード: ${reloadCountdownState.secondsRemaining}秒`;
                    bgColor = 'rgba(255, 0, 0, 0.9)'; // 赤色（中断不可）
                } else {
                    message = `監視中\nリロード: ${reloadCountdownState.secondsRemaining}秒`;
                    bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
                }
            } else {
                bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
            }
            break;
            
        case 'reservation-running':
            // 経過時間と回数を表示
            const elapsedMinutes = entranceReservationState.startTime ? 
                Math.floor((Date.now() - entranceReservationState.startTime) / 60000) : 0;
            const attempts = entranceReservationState.attempts;
            message = `予約実行中\n${elapsedMinutes}分 ${attempts}回`;
            bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
            break;
            
        case 'selecting':
            message = '監視準備完了';
            bgColor = 'rgba(0, 104, 33, 0.9)'; // 緑色
            break;
            
        case 'found-available':
            message = '空きあり検出！\n予約実行中';
            bgColor = 'rgba(0, 200, 0, 0.9)'; // 明るい緑色
            break;
            
        case 'loading':
            message = '情報読み込み中...';
            bgColor = 'rgba(108, 117, 125, 0.9)'; // グレー色
            break;
            
        case 'idle':
        default:
            message = '待機中';
            bgColor = 'rgba(0, 0, 0, 0.8)'; // 黒色
            break;
    }
    
    if (message) {
        statusBadge.innerText = message;
        statusBadge.style.background = bgColor;
        statusBadge.style.display = 'block';
        statusBadge.style.whiteSpace = 'pre-line'; // 改行を有効にする
    } else {
        statusBadge.style.display = 'none';
    }
}

// 監視/予約対象の表示情報を取得（簡潔版）
function getTargetDisplayInfo() {
    const targets = multiTargetManager.getTargets();
    if (targets.length === 0) {
        return '不明';
    }
    
    const selectedDate = getCurrentSelectedCalendarDate();
    
    // 各監視対象の東西を個別に判定（東/西時間の形式で統一）
    if (targets.length > 1) {
        const timeLocationTexts = targets.map(target => {
            const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
            return `${location}${target.timeText || '不明'}`;
        }).join('\n');
        
        if (selectedDate) {
            const date = new Date(selectedDate);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return `${dateStr}\n${timeLocationTexts}`;
        } else {
            return timeLocationTexts;
        }
    } else {
        // 単一監視対象の場合
        const target = targets[0];
        const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
        const timeText = target.timeText || '不明';
        
        if (selectedDate) {
            const date = new Date(selectedDate);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return `${dateStr} ${location}${timeText}`;
        } else {
            return `${location}${timeText}`;
        }
    }
}

// カウントダウン開始関数
function startReloadCountdown(seconds = 30) {
    stopReloadCountdown(); // 既存のカウントダウンを停止
    
    reloadCountdownState.totalSeconds = seconds;
    reloadCountdownState.secondsRemaining = seconds;
    reloadCountdownState.startTime = Date.now();
    
    console.log(`🔄 リロードカウントダウン開始: ${seconds}秒`);
    
    // 即座に一度UI更新
    updateMainButtonDisplay();
    
    reloadCountdownState.countdownInterval = setInterval(() => {
        reloadCountdownState.secondsRemaining--;
        
        // UI更新（カウントダウン表示のみ）
        updateMainButtonDisplay();
        
        if (reloadCountdownState.secondsRemaining <= 0) {
            stopReloadCountdown();
            // カウントダウン完了でリロード実行
            console.log('🔄 カウントダウン完了によりページをリロードします...');
            window.location.reload();
        }
    }, 1000);
}

// カウントダウン停止関数
function stopReloadCountdown() {
    if (reloadCountdownState.countdownInterval) {
        clearInterval(reloadCountdownState.countdownInterval);
        reloadCountdownState.countdownInterval = null;
    }
    // リロードタイマーも停止
    if (reloadCountdownState.reloadTimer) {
        clearTimeout(reloadCountdownState.reloadTimer);
        reloadCountdownState.reloadTimer = null;
        console.log('🛑 リロードタイマーを停止しました');
    }
    reloadCountdownState.secondsRemaining = null;
    reloadCountdownState.startTime = null;
}

// ページ読み込み状態を設定
function setPageLoadingState(isLoading) {
    pageLoadingState.isLoading = isLoading;
    if (isLoading) {
        pageLoadingState.startTime = Date.now();
    } else {
        pageLoadingState.startTime = null;
    }
    updateMainButtonDisplay();
}

// 中断操作が許可されているかチェック
function isInterruptionAllowed() {
    // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
    const isCountdownActive = reloadCountdownState.secondsRemaining !== null && reloadCountdownState.secondsRemaining !== undefined;
    const isNearReload = isCountdownActive && reloadCountdownState.secondsRemaining <= 3;
    
    // console.log(`🔍 中断可否チェック: countdown=${reloadCountdownState.secondsRemaining}, active=${isCountdownActive}, nearReload=${isNearReload}`);
    
    return !isNearReload;
}

// ページ読み込み時のキャッシュ復元
async function restoreFromCache() {
    const cached = cacheManager.loadTargetSlots();
    if (!cached) return;
    
    console.log('🔄 キャッシュから複数監視状態を復元中...');
    
    // カレンダー読み込み完了を待機
    const hasCalendar = await waitForCalendar();
    if (!hasCalendar) {
        console.log('❌ カレンダーの読み込みがタイムアウトしました');
        cacheManager.clearTargetSlots();
        return;
    }
    
    // キャッシュされた日付と現在の日付を比較
    if (cached.selectedDate) {
        const currentSelectedDate = getCurrentSelectedCalendarDate();
        console.log(`📅 比較 - キャッシュ日付: ${cached.selectedDate}, 現在日付: ${currentSelectedDate}`);
        
        if (currentSelectedDate !== cached.selectedDate) {
            console.log('📅 日付が一致しません。キャッシュされた日付に移動します...');
            const calendarClicked = await clickCalendarDate(cached.selectedDate);
            
            if (!calendarClicked) {
                console.log('❌ 指定日付へのカレンダークリックに失敗しました');
                console.log('🗑️ 復元不可のためキャッシュをクリアします');
                cacheManager.clearTargetSlots();
                return;
            }
            
            // 日付クリック後、テーブル表示を待機
            console.log('⏰ 日付変更後の時間帯テーブル表示を待機中...');
            const tableAppeared = await waitForTimeSlotTable(8000);
            if (!tableAppeared) {
                console.log('❌ 日付変更後もテーブルが表示されませんでした');
                console.log('🗑️ 復元不可のためキャッシュをクリアします');
                cacheManager.clearTargetSlots();
                return;
            }
        } else {
            console.log('✅ カレンダー日付は一致しています');
        }
    } else {
        console.log('⚠️ キャッシュに日付情報がありません（古いキャッシュ）');
    }
    
    // 時間帯テーブルの存在確認と必要に応じてカレンダークリック
    const hasTable = await checkTimeSlotTableExistsAsync();
    if (!hasTable) {
        console.log('⏰ 時間帯テーブルが見つからないため、現在選択中の日付をクリックします');
        const calendarClicked = await tryClickCalendarForTimeSlot();
        if (calendarClicked) {
            // カレンダークリック後、テーブル表示を待機
            const tableAppeared = await waitForTimeSlotTable(5000);
            if (!tableAppeared) {
                console.log('❌ カレンダークリック後もテーブルが表示されませんでした');
                console.log('🗑️ 復元不可のためキャッシュをクリアします');
                cacheManager.clearTargetSlots();
                return;
            }
        } else {
            console.log('❌ カレンダークリックに失敗しました');
            console.log('🗑️ 復元不可のためキャッシュをクリアします');
            cacheManager.clearTargetSlot();
            return;
        }
    }
    
    // UI更新を遅延実行（DOM完成後）
    setTimeout(() => {
        // 該当する監視ボタンを探して復元
        let restoredCount = 0;
        const allMonitorButtons = document.querySelectorAll('.monitor-btn');
        
        console.log(`📋 復元対象監視ターゲット: ${cached.targets?.length || 0}個`);
        
        // 優先順位順に処理（最優先から順番にチェック）
        const availableTargets = [];
        
        // 各監視対象について状態をチェック
        cached.targets?.forEach((targetData, index) => {
            const location = multiTargetManager.getLocationFromSelector(targetData.tdSelector);
            const priority = index + 1;
            console.log(`📍 復元対象を処理中: ${priority}.${location}${targetData.timeText}`);
            
            // まず同一td要素を見つける
            const tdElement = findSameTdElement(targetData);
            if (!tdElement) {
                console.log(`❌ td要素が見つかりません: ${location}${targetData.timeText}`);
                return;
            }
            
            // td要素の現在の状態をチェック
            const currentStatus = extractTdStatus(tdElement);
            if (currentStatus && currentStatus.status === 'available') {
                console.log(`🎉 監視対象が空きありに変化！: ${priority}.${location}${targetData.timeText}`);
                availableTargets.push({
                    ...targetData,
                    priority,
                    location,
                    tdElement,
                    currentStatus
                });
            } else {
                // まだ満員の場合、監視ボタンを探す
                let targetButton = null;
                allMonitorButtons.forEach(button => {
                    const buttonTime = button.getAttribute('data-target-time');
                    const buttonTd = button.closest('td[data-gray-out]');
                    const buttonTdSelector = buttonTd ? generateUniqueTdSelector(buttonTd) : '';
                    
                    // 時間+位置で一致するかチェック
                    if (buttonTime === targetData.timeText && buttonTdSelector === targetData.tdSelector) {
                        targetButton = button;
                    }
                });
            
            if (targetButton) {
                console.log(`📍 復元対象の監視ボタンを発見: ${location}${targetData.timeText}`);
                
                // 状態復元（複数監視対象対応）
                const restoredSlotInfo = {
                    timeText: targetData.timeText,
                    tdSelector: targetData.tdSelector,
                    positionInfo: targetData.positionInfo,
                    status: targetData.status
                };
                
                // 複数監視対象マネージャーに追加
                const added = multiTargetManager.addTarget(restoredSlotInfo);
                if (added) {
                    // ボタンの表示を更新
                    const span = targetButton.querySelector('span');
                    if (span) {
                        // 監視対象での優先順位を取得
                        const allTargets = multiTargetManager.getTargets();
                        const targetIndex = allTargets.findIndex(
                            t => t.timeText === targetData.timeText && t.tdSelector === targetData.tdSelector
                        );
                        
                        if (targetIndex >= 0) {
                            const priority = targetIndex + 1;
                            span.innerText = `監視${priority}`;
                        } else {
                            span.innerText = '監視1'; // フォールバック
                        }
                        targetButton.style.background = 'rgb(0, 104, 33)';
                        targetButton.disabled = false; // クリックで解除可能
                    }
                    
                    restoredCount++;
                    console.log(`✅ 監視状態を復元: ${location}${targetData.timeText}`);
                } else {
                    console.log(`⚠️ 監視対象の追加に失敗: ${location}${targetData.timeText}`);
                }
            } else {
                console.log(`⚠️ 復元対象の監視ボタンが見つかりません: ${location}${targetData.timeText}`);
            }
            }
        });
        
        // 空きありの監視対象が見つかった場合は優先順位で自動選択
        if (availableTargets.length > 0) {
            // 最優先（priority最小）の監視対象を選択
            const topPriority = availableTargets.sort((a, b) => a.priority - b.priority)[0];
            console.log(`🎉🚀 最優先の空きあり監視対象を発見！自動選択開始: ${topPriority.priority}.${topPriority.location}${topPriority.timeText}`);
            
            // 監視継続フラグをクリア（自動選択するため）
            cacheManager.clearMonitoringFlag();
            
            // 空きありになった要素を自動選択して予約開始
            const slotInfo = {
                element: topPriority.currentStatus.element, // div[role="button"]要素
                timeText: topPriority.currentStatus.timeText,
                status: topPriority.currentStatus.status,
                targetInfo: topPriority
            };
            
            // 監視状態とキャッシュをクリア
            cacheManager.clearTargetSlots();
            multiTargetManager.clearAll();
            
            setTimeout(async () => {
                await selectTimeSlotAndStartReservation(slotInfo);
            }, 1000);
            
            return; // 復元処理終了
        }
        
        // 復元結果の処理
        if (restoredCount > 0) {
            timeSlotState.retryCount = cached.retryCount || 0;
            timeSlotState.mode = 'selecting';
            
            // メインボタンの表示更新
            updateMainButtonDisplay();
            
            console.log(`✅ ${restoredCount}個の監視状態を復元完了 (試行回数: ${cached.retryCount})`);
            
            // 監視継続フラグをチェックして監視を再開
            const shouldContinueMonitoring = cacheManager.getAndClearMonitoringFlag();
            if (shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。監視を自動再開します...');
                setTimeout(() => {
                    startSlotMonitoring();
                }, 3000); // DOM安定化を待ってから監視開始
            } else {
                console.log('🛑 監視継続フラグが無効または期限切れです。監視は再開されません');
            }
        } else {
            // 復元できた対象がない場合
            console.log('❌ 復元できた監視対象がありません');
            
            const shouldContinueMonitoring = cacheManager.getAndClearMonitoringFlag();
            if (shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。カレンダー自動クリックを試行します...');
                
                // カレンダー日付をクリックして時間帯テーブルを表示させる
                if (cached.selectedDate) {
                    clickCalendarDate(cached.selectedDate).then(calendarClicked => {
                        if (calendarClicked) {
                            console.log('📅 カレンダー自動クリック成功。監視対象復元を再試行します...');
                            
                            // 少し待ってから再試行
                            setTimeout(async () => {
                            // 全ての監視対象について再試行
                            let retryRestoredCount = 0;
                            
                            cached.targets?.forEach(targetData => {
                                const retryTargetElement = findSameTdElement(targetData);
                                const retryStatus = extractTdStatus(retryTargetElement);
                                
                                if (retryStatus) {
                                    const retrySlotInfo = {
                                        timeText: targetData.timeText,
                                        tdSelector: targetData.tdSelector,
                                        positionInfo: targetData.positionInfo,
                                        status: retryStatus.status
                                    };
                                    
                                    const added = multiTargetManager.addTarget(retrySlotInfo);
                                    if (added) {
                                        retryRestoredCount++;
                                    }
                                }
                            });
                            
                            if (retryRestoredCount > 0) {
                                timeSlotState.mode = 'selecting';
                                console.log(`✅ ${retryRestoredCount}個の監視対象を再試行で復元成功`);
                                updateMainButtonDisplay();
                                startSlotMonitoring();
                            } else {
                                console.log('❌ 再試行でも監視対象が見つかりません。キャッシュをクリアします');
                                cacheManager.clearTargetSlots();
                                multiTargetManager.clearAll();
                                timeSlotState.mode = 'idle';
                                timeSlotState.retryCount = 0;
                                updateMainButtonDisplay();
                            }
                        }, 2000);
                        } else {
                            console.log('❌ カレンダー自動クリック失敗。キャッシュをクリアします');
                            clearTargetAndState();
                        }
                    });
                } else {
                    console.log('❌ 保存された日付情報がありません。キャッシュをクリアします');
                    clearTargetAndState();
                }
            } else {
                console.log('🗑️ 監視継続フラグが無効です。古いキャッシュをクリアします');
                clearTargetAndState();
            }
            
            // キャッシュクリアのヘルパー関数
            function clearTargetAndState() {
                cacheManager.clearTargetSlots();
                multiTargetManager.clearAll();
                timeSlotState.mode = 'idle';
                timeSlotState.retryCount = 0;
                updateMainButtonDisplay();
                console.log('✅ キャッシュクリア完了');
            }
        }
    }, 2000);
}

// エクスポート
export {
    getCurrentSelectedCalendarDate,
    clickCalendarDate,
    tryClickCalendarForTimeSlot,
    showErrorMessage,
    resetMonitoringUI,
    selectTimeSlotAndStartReservation,
    stopSlotMonitoring,
    getCurrentEntranceConfig,
    resetPreviousSelection,
    disableOtherMonitorButtons,
    enableAllMonitorButtons,
    disableAllMonitorButtons,
    clearExistingMonitorButtons,
    getCurrentTableContent,
    shouldUpdateMonitorButtons,
    restoreSelectionAfterUpdate,
    updateMainButtonDisplay,
    getCurrentMode,
    updateStatusBadge,
    getTargetDisplayInfo,
    startReloadCountdown,
    stopReloadCountdown,
    setPageLoadingState,
    isInterruptionAllowed,
    restoreFromCache
};

// ============================================================================
