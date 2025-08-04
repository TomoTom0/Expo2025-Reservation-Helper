(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["YtomoExtension"] = factory();
	else
		root["YtomoExtension"] = factory();
})(this, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ 114:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var _section1__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(448);
/* harmony import */ var _section2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(897);
/* harmony import */ var _section3__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(682);
/* harmony import */ var _section5__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(628);
/* harmony import */ var _section6__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(117);
/* harmony import */ var _section7__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(523);
/* harmony import */ var _section4__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(915);
/* module decorator */ module = __webpack_require__.hmd(module);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// 各sectionからのimport








// 【8. ページ判定・初期化】
// ============================================================================

// cacheManagerの初期化
var cacheManager = (0,_section3__WEBPACK_IMPORTED_MODULE_2__/* .createCacheManager */ .K)({
  getCurrentSelectedCalendarDateFn: _section6__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY
});

// section5、section6、section7にcacheManagerを設定
(0,_section5__WEBPACK_IMPORTED_MODULE_3__/* .setCacheManager */ .S9)(cacheManager);
(0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .setCacheManagerForSection6 */ .MM)(cacheManager);
(0,_section7__WEBPACK_IMPORTED_MODULE_5__/* .setCacheManagerForSection7 */ .TP)(cacheManager);

// section6に必要な関数を注入
(0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .setEntranceReservationHelper */ .XP)(_section7__WEBPACK_IMPORTED_MODULE_5__/* .entranceReservationHelper */ .FX);
(0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .setCanStartReservation */ .po)(_section7__WEBPACK_IMPORTED_MODULE_5__/* .canStartReservation */ .N9);

// section5.jsに外部関数を注入（showStatusは一時的に除外）
(0,_section5__WEBPACK_IMPORTED_MODULE_3__/* .setExternalFunctions */ .po)({
  getCurrentTableContent: _section6__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentTableContent */ .dm,
  shouldUpdateMonitorButtons: _section6__WEBPACK_IMPORTED_MODULE_4__/* .shouldUpdateMonitorButtons */ .iG,
  restoreSelectionAfterUpdate: _section6__WEBPACK_IMPORTED_MODULE_4__/* .restoreSelectionAfterUpdate */ .Il,
  // showStatus, // 内部関数のため一時的に除外
  enableAllMonitorButtons: _section6__WEBPACK_IMPORTED_MODULE_4__/* .enableAllMonitorButtons */ .Ak,
  updateMainButtonDisplay: _section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp,
  updateMonitoringTargetsDisplay: _section7__WEBPACK_IMPORTED_MODULE_5__/* .updateMonitoringTargetsDisplay */ .yT,
  disableAllMonitorButtons: _section6__WEBPACK_IMPORTED_MODULE_4__/* .disableAllMonitorButtons */ .PT,
  selectTimeSlotAndStartReservation: _section6__WEBPACK_IMPORTED_MODULE_4__/* .selectTimeSlotAndStartReservation */ .rG,
  startReloadCountdown: _section6__WEBPACK_IMPORTED_MODULE_4__/* .startReloadCountdown */ .PH,
  reloadCountdownState: _section2__WEBPACK_IMPORTED_MODULE_1__/* .reloadCountdownState */ .u6,
  resetMonitoringUI: _section6__WEBPACK_IMPORTED_MODULE_4__/* .resetMonitoringUI */ .oH,
  showErrorMessage: _section6__WEBPACK_IMPORTED_MODULE_4__/* .showErrorMessage */ .f1,
  tryClickCalendarForTimeSlot: _section6__WEBPACK_IMPORTED_MODULE_4__/* .tryClickCalendarForTimeSlot */ .oy
});

// URL判定とページタイプ識別
var identify_page_type = function identify_page_type(url) {
  if (url.includes("ticket.expo2025.or.jp/event_search/")) {
    return "pavilion_reservation";
  } else if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
    return "entrance_reservation";
  }
  return null;
};

// ページ遷移時の初期化トリガー
var trigger_init = function trigger_init(url_record) {
  var page_type = identify_page_type(url_record);
  if (page_type === "pavilion_reservation") {
    var interval_judge = setInterval(function () {
      if ((0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .judge_init */ .v8)()) {
        clearInterval(interval_judge);
        (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .init_page */ .Xs)();
        console.log("ytomo extension loaded (pavilion reservation)");
      }
    }, 500);
  } else if (page_type === "entrance_reservation") {
    var _interval_judge = setInterval(function () {
      if ((0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .judge_entrance_init */ .Q2)()) {
        clearInterval(_interval_judge);
        (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .init_entrance_page */ .ig)({
          setPageLoadingStateFn: _section6__WEBPACK_IMPORTED_MODULE_4__/* .setPageLoadingState */ .ZK,
          createEntranceReservationUIFn: _section7__WEBPACK_IMPORTED_MODULE_5__/* .createEntranceReservationUI */ .DT,
          initTimeSlotMonitoringFn: _section4__WEBPACK_IMPORTED_MODULE_6__/* .initTimeSlotMonitoring */ .Yz,
          restoreFromCacheFn: _section6__WEBPACK_IMPORTED_MODULE_4__/* .restoreFromCache */ .Zu
        });
        console.log("ytomo extension loaded (entrance reservation)");
      }
    }, 500);
  }
};
try {
  // urlの変更をMutationObserverで監視する
  var url = window.location.href;
  trigger_init(url);
  var url_record = url;
  var observer = new MutationObserver(function () {
    var new_url = window.location.href;
    if (new_url !== url_record) {
      url_record = new_url;
      trigger_init(url_record);
    }
  });
  observer.observe(document, {
    childList: true,
    subtree: true
  });
} catch (e) {
  // エラー時の処理
  console.error("ytomo extension error", e);
  // alert(e);
}

// テスト用エクスポート（Node.js環境でのみ有効）
if ( true && module.exports) {
  module.exports = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({
    // パビリオン検索機能
    prepare_filter: prepare_filter,
    // 時間帯監視機能
    generateUniqueTdSelector: generateUniqueTdSelector,
    getTdPositionInfo: getTdPositionInfo,
    findSameTdElement: findSameTdElement,
    extractTdStatus: extractTdStatus,
    // FAB UI機能
    createEntranceReservationUI: _section7__WEBPACK_IMPORTED_MODULE_5__/* .createEntranceReservationUI */ .DT,
    updateMainButtonDisplay: _section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp,
    updateMonitoringTargetsDisplay: _section7__WEBPACK_IMPORTED_MODULE_5__/* .updateMonitoringTargetsDisplay */ .yT,
    // カレンダー監視機能
    startCalendarWatcher: startCalendarWatcher,
    handleCalendarChange: handleCalendarChange,
    getCurrentSelectedCalendarDate: _section6__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY,
    // キャッシュ機能
    cacheManager: cacheManager,
    // 状態管理オブジェクト
    multiTargetManager: multiTargetManager,
    timeSlotState: timeSlotState,
    entranceReservationState: entranceReservationState,
    calendarWatchState: calendarWatchState,
    // セレクタ定義
    timeSlotSelectors: timeSlotSelectors,
    // ページ機能
    init_page: _section1__WEBPACK_IMPORTED_MODULE_0__/* .init_page */ .Xs,
    init_entrance_page: _section1__WEBPACK_IMPORTED_MODULE_0__/* .init_entrance_page */ .ig,
    identify_page_type: identify_page_type,
    trigger_init: trigger_init,
    // Unit Test用追加関数 (Phase 1)
    extractTimeSlotInfo: extractTimeSlotInfo,
    getMonitorButtonText: getMonitorButtonText,
    getCurrentMode: getCurrentMode,
    getRandomWaitTime: getRandomWaitTime,
    generateSelectorForElement: generateSelectorForElement
  }, "generateUniqueTdSelector", generateUniqueTdSelector), "getTdPositionInfo", getTdPositionInfo), "findSameTdElement", findSameTdElement), "extractTdStatus", extractTdStatus), "checkTimeSlotTableExistsSync", checkTimeSlotTableExistsSync), "validatePageLoaded", validatePageLoaded), "canStartReservation", _section7__WEBPACK_IMPORTED_MODULE_5__/* .canStartReservation */ .N9), "isInterruptionAllowed", isInterruptionAllowed), "checkTimeSlotSelected", checkTimeSlotSelected), "checkVisitTimeButtonState", checkVisitTimeButtonState);
}

/***/ }),

/***/ 117:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Ak: () => (/* binding */ enableAllMonitorButtons),
/* harmony export */   Il: () => (/* binding */ restoreSelectionAfterUpdate),
/* harmony export */   Is: () => (/* binding */ isInterruptionAllowed),
/* harmony export */   MM: () => (/* binding */ setCacheManagerForSection6),
/* harmony export */   PH: () => (/* binding */ startReloadCountdown),
/* harmony export */   PT: () => (/* binding */ disableAllMonitorButtons),
/* harmony export */   XG: () => (/* binding */ stopSlotMonitoring),
/* harmony export */   XP: () => (/* binding */ setEntranceReservationHelper),
/* harmony export */   ZK: () => (/* binding */ setPageLoadingState),
/* harmony export */   Zu: () => (/* binding */ restoreFromCache),
/* harmony export */   dm: () => (/* binding */ getCurrentTableContent),
/* harmony export */   f1: () => (/* binding */ showErrorMessage),
/* harmony export */   iG: () => (/* binding */ shouldUpdateMonitorButtons),
/* harmony export */   oH: () => (/* binding */ resetMonitoringUI),
/* harmony export */   oy: () => (/* binding */ tryClickCalendarForTimeSlot),
/* harmony export */   pW: () => (/* binding */ updateStatusBadge),
/* harmony export */   po: () => (/* binding */ setCanStartReservation),
/* harmony export */   rG: () => (/* binding */ selectTimeSlotAndStartReservation),
/* harmony export */   rY: () => (/* binding */ getCurrentSelectedCalendarDate),
/* harmony export */   vp: () => (/* binding */ updateMainButtonDisplay)
/* harmony export */ });
/* unused harmony exports clickCalendarDate, getCurrentEntranceConfig, resetPreviousSelection, disableOtherMonitorButtons, clearExistingMonitorButtons, getCurrentMode, getTargetDisplayInfo, stopReloadCountdown */
/* harmony import */ var _section2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(897);
/* harmony import */ var _section4__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(915);
/* harmony import */ var _section5__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(628);
// Section 2からのimport

// Section 4からのimport

// Section 5からのimport

// 【6. カレンダー・UI状態管理】
// ============================================================================
// 依存注入用の参照
let cacheManager = null;
let entranceReservationHelper = null;
let canStartReservation = null;
// cacheManagerを設定するヘルパー関数
const setCacheManagerForSection6 = (cm) => {
    cacheManager = cm;
};
// entranceReservationHelperを設定するヘルパー関数
const setEntranceReservationHelper = (helper) => {
    entranceReservationHelper = helper;
};
// canStartReservationを設定するヘルパー関数
const setCanStartReservation = (fn) => {
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
    }
    catch (error) {
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
        }
        else {
            console.log('⚠️ カレンダークリックは実行されましたが、選択状態の確認ができません');
            return true; // 実行は成功したとして進行
        }
    }
    catch (error) {
        console.error('❌ カレンダー日付クリックエラー:', error);
        return false;
    }
}
async function tryClickCalendarForTimeSlot() {
    console.log('📅 時間帯表示のためのカレンダークリックを試行中...');
    // 監視対象確認（情報表示のみ）
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
        const targetTexts = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets().map(t => t.timeText).join(', ');
        console.log(`🎯 監視対象: ${targetTexts} (${_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount()}個)`);
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
                console.log(`📅 現在選択中の日付を発見: ${date.textContent?.trim()}`);
                break;
            }
        }
        if (clickableDate)
            break;
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
        // 少し待機してクリック結果を確認
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ カレンダー日付のクリックを実行しました');
        return true;
    }
    catch (error) {
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
    const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(slotInfo.targetInfo.tdSelector);
    console.log(`🎯 時間帯を自動選択します: ${location}${slotInfo.timeText}`);
    // クリック対象のdl要素を探す
    let clickTarget = null;
    // TD要素の場合はdl要素を探す
    if (slotInfo.element.tagName === 'TD') {
        clickTarget = slotInfo.element.querySelector('div[role="button"] dl');
        if (clickTarget) {
            console.log('🔧 TD要素内のdl要素を発見しました');
        }
        else {
            console.error('❌ TD要素内にdl要素が見つかりません');
            return;
        }
    }
    else {
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
    }
    catch (error) {
        console.error(`❌ dl要素クリックエラー:`, error);
    }
    // 選択状態確認のため少し待つ
    await new Promise(resolve => setTimeout(resolve, 500));
    // 選択状態を確認（ボタン要素の状態をチェック）
    const buttonElement = slotInfo.element.querySelector('div[role="button"]');
    const isSelected = buttonElement && (Array.from(buttonElement.classList).some(className => className.includes('style_active__')) ||
        buttonElement.getAttribute('aria-pressed') === 'true');
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
        const finalCheck = finalButtonElement && (Array.from(finalButtonElement.classList).some(className => className.includes('style_active__')) ||
            finalButtonElement.getAttribute('aria-pressed') === 'true');
        console.log(`🔍 予約開始前最終確認: 時間帯選択=${finalCheck ? '✅選択済み' : '❌未選択'}`);
        if (!finalCheck) {
            console.error(`❌ 時間帯が選択されていないため予約処理を中止します`);
            return;
        }
        // 監視停止
        stopSlotMonitoring();
        // 通常の予約処理を開始
        const config = getCurrentEntranceConfig();
        if (config && entranceReservationHelper) {
            _section2__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.isRunning = true;
            const result = await entranceReservationHelper(config);
            if (result.success && cacheManager) {
                cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                console.log('✅ 予約が成功しました！');
            }
        }
    }, 1000);
}
// 監視停止（監視対象選択は維持）
function stopSlotMonitoring() {
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring = false;
    // 監視継続フラグをクリア（手動停止なので継続させない）
    if (cacheManager) {
        cacheManager.clearMonitoringFlag();
    }
    // リロードカウントダウンも確実に停止
    stopReloadCountdown();
    // 監視対象が設定されている場合は選択状態に戻す
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';
    }
    else {
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
    }
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval) {
        clearInterval(_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval);
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval = null;
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
        const targetTime = button.getAttribute('data-target-time') || '';
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
    const analysis = (0,_section5__WEBPACK_IMPORTED_MODULE_2__/* .analyzeTimeSlots */ .bU)();
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
function restoreSelectionAfterUpdate() {
    if (!_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets())
        return;
    const targets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
    const targetTexts = targets.map(t => t.timeText).join(', ');
    console.log(`選択状態を復元中: ${targetTexts}`);
    // 該当する時間帯の監視ボタンを探して選択状態にする
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    let restoredCount = 0;
    targets.forEach(target => {
        monitorButtons.forEach(button => {
            const buttonTargetTime = button.getAttribute('data-target-time') || '';
            const buttonTdElement = button.closest('td[data-gray-out]');
            const buttonTdSelector = buttonTdElement ? (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(buttonTdElement) : '';
            // 時間+位置で一致するかチェック
            if (buttonTargetTime === target.timeText && buttonTdSelector === target.tdSelector) {
                const span = button.querySelector('span');
                if (span) {
                    // 監視対象リストでの位置を取得
                    const allTargets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
                    const targetIndex = allTargets.findIndex(t => t.timeText === target.timeText && t.tdSelector === target.tdSelector);
                    if (targetIndex >= 0) {
                        const priority = targetIndex + 1;
                        span.innerText = `監視${priority}`;
                    }
                    else {
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
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
        if (cacheManager) {
            cacheManager.clearTargetSlots();
        }
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
            const targetTexts = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets() ? _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets().map(t => t.timeText).join(', ') : 'なし';
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
                    }
                    else {
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
                    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
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
                    }
                    else {
                        // 通常の予約開始 - 条件に応じてdisabled状態を制御
                        span.innerText = '予約\n開始';
                        const canStart = canStartReservation ? canStartReservation() : false;
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
                        }
                        else {
                            // 条件未満足 - disabled状態
                            const selectedDate = getCurrentSelectedCalendarDate();
                            const hasTimeSlotTable = (0,_section5__WEBPACK_IMPORTED_MODULE_2__/* .checkTimeSlotTableExistsSync */ .H5)();
                            if (!selectedDate || !hasTimeSlotTable) {
                                // カレンダー未選択または時間帯テーブル未表示
                                fabButton.title = '待機中（カレンダーで日付を選択してください）';
                            }
                            else {
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
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD && _section2__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.isLoading) {
        return 'loading';
    }
    else if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring) {
        return 'monitoring';
    }
    else if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.isRunning) {
        return 'reservation-running';
    }
    else if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets() && _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode === 'selecting') {
        return 'selecting';
    }
    else {
        return 'idle';
    }
}
// ステータスバッジの更新
function updateStatusBadge(mode) {
    const statusBadge = document.querySelector('#ytomo-status-badge');
    if (!statusBadge)
        return;
    let message = '';
    let bgColor = 'rgba(0, 0, 0, 0.8)';
    switch (mode) {
        case 'monitoring':
            message = '監視実行中';
            if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== null && _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== undefined) {
                if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining <= 3) {
                    message = `監視中\nリロード: ${_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining}秒`;
                    bgColor = 'rgba(255, 0, 0, 0.9)'; // 赤色（中断不可）
                }
                else {
                    message = `監視中\nリロード: ${_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining}秒`;
                    bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
                }
            }
            else {
                bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
            }
            break;
        case 'reservation-running':
            // 経過時間と回数を表示
            const elapsedMinutes = _section2__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.startTime ?
                Math.floor((Date.now() - _section2__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.startTime) / 60000) : 0;
            const attempts = _section2__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.attempts;
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
        case 'waiting':
            message = '待機中';
            bgColor = 'rgba(128, 128, 128, 0.9)'; // グレー色
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
    }
    else {
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
        }
        else {
            return timeLocationTexts;
        }
    }
    else {
        // 単一監視対象の場合
        const target = targets[0];
        const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
        const timeText = target.timeText || '不明';
        if (selectedDate) {
            const date = new Date(selectedDate);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return `${dateStr} ${location}${timeText}`;
        }
        else {
            return `${location}${timeText}`;
        }
    }
}
// カウントダウン開始関数
function startReloadCountdown(seconds = 30) {
    stopReloadCountdown(); // 既存のカウントダウンを停止
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.totalSeconds = seconds;
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining = seconds;
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.startTime = Date.now();
    console.log(`🔄 リロードカウントダウン開始: ${seconds}秒`);
    // 即座に一度UI更新
    updateMainButtonDisplay();
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval = window.setInterval(() => {
        if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== null) {
            _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining--;
            // UI更新（カウントダウン表示のみ）
            updateMainButtonDisplay();
            if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining <= 0) {
                stopReloadCountdown();
                // カウントダウン完了でリロード実行
                console.log('🔄 カウントダウン完了によりページをリロードします...');
                window.location.reload();
            }
        }
    }, 1000);
}
// カウントダウン停止関数
function stopReloadCountdown() {
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval) {
        clearInterval(_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval);
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval = null;
    }
    // リロードタイマーも停止
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.reloadTimer) {
        clearTimeout(_section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.reloadTimer);
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.reloadTimer = null;
        console.log('🛑 リロードタイマーを停止しました');
    }
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining = null;
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.startTime = null;
}
// ページ読み込み状態を設定
function setPageLoadingState(isLoading) {
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.isLoading = isLoading;
    if (isLoading) {
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.startTime = Date.now();
    }
    else {
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.startTime = null;
    }
    updateMainButtonDisplay();
}
// 中断操作が許可されているかチェック
function isInterruptionAllowed() {
    // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
    const isCountdownActive = _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== null && _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== undefined;
    const isNearReload = isCountdownActive && _section2__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining <= 3;
    // console.log(`🔍 中断可否チェック: countdown=${reloadCountdownState.secondsRemaining}, active=${isCountdownActive}, nearReload=${isNearReload}`);
    return !isNearReload;
}
// ページ読み込み時のキャッシュ復元
async function restoreFromCache() {
    if (!cacheManager)
        return;
    const cached = cacheManager.loadTargetSlots();
    if (!cached)
        return;
    console.log('🔄 キャッシュから複数監視状態を復元中...');
    // カレンダー読み込み完了を待機
    const hasCalendar = await (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .waitForCalendar */ .Xz)();
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
            const tableAppeared = await (0,_section5__WEBPACK_IMPORTED_MODULE_2__/* .waitForTimeSlotTable */ .il)(8000);
            if (!tableAppeared) {
                console.log('❌ 日付変更後もテーブルが表示されませんでした');
                console.log('🗑️ 復元不可のためキャッシュをクリアします');
                cacheManager.clearTargetSlots();
                return;
            }
        }
        else {
            console.log('✅ カレンダー日付は一致しています');
        }
    }
    else {
        console.log('⚠️ キャッシュに日付情報がありません（古いキャッシュ）');
    }
    // 時間帯テーブルの存在確認と必要に応じてカレンダークリック
    const hasTable = await (0,_section5__WEBPACK_IMPORTED_MODULE_2__/* .checkTimeSlotTableExistsAsync */ .gW)();
    if (!hasTable) {
        console.log('⏰ 時間帯テーブルが見つからないため、現在選択中の日付をクリックします');
        const calendarClicked = await tryClickCalendarForTimeSlot();
        if (calendarClicked) {
            // カレンダークリック後、テーブル表示を待機
            const tableAppeared = await (0,_section5__WEBPACK_IMPORTED_MODULE_2__/* .waitForTimeSlotTable */ .il)(5000);
            if (!tableAppeared) {
                console.log('❌ カレンダークリック後もテーブルが表示されませんでした');
                console.log('🗑️ 復元不可のためキャッシュをクリアします');
                cacheManager.clearTargetSlots();
                return;
            }
        }
        else {
            console.log('❌ カレンダークリックに失敗しました');
            console.log('🗑️ 復元不可のためキャッシュをクリアします');
            cacheManager.clearTargetSlots();
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
            const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(targetData.tdSelector);
            const priority = index + 1;
            console.log(`📍 復元対象を処理中: ${priority}.${location}${targetData.timeText}`);
            // まず同一td要素を見つける
            const tdElement = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(targetData);
            if (!tdElement) {
                console.log(`❌ td要素が見つかりません: ${location}${targetData.timeText}`);
                return;
            }
            // td要素の現在の状態をチェック
            const currentStatus = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(tdElement);
            if (currentStatus && currentStatus.isAvailable) {
                console.log(`🎉 監視対象が空きありに変化！: ${priority}.${location}${targetData.timeText}`);
                availableTargets.push({
                    ...targetData,
                    priority,
                    location,
                    tdElement,
                    currentStatus
                });
            }
            else {
                // まだ満員の場合、監視ボタンを探す
                let targetButton = null;
                allMonitorButtons.forEach(button => {
                    const buttonTime = button.getAttribute('data-target-time') || '';
                    const buttonTd = button.closest('td[data-gray-out]');
                    const buttonTdSelector = buttonTd ? (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(buttonTd) : '';
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
                    const added = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.addTarget(restoredSlotInfo);
                    if (added) {
                        // ボタンの表示を更新
                        const span = targetButton.querySelector('span');
                        if (span) {
                            // 監視対象での優先順位を取得
                            const allTargets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
                            const targetIndex = allTargets.findIndex(t => t.timeText === targetData.timeText && t.tdSelector === targetData.tdSelector);
                            if (targetIndex >= 0) {
                                const priority = targetIndex + 1;
                                span.innerText = `監視${priority}`;
                            }
                            else {
                                span.innerText = '監視1'; // フォールバック
                            }
                            targetButton.style.background = 'rgb(0, 104, 33)';
                            targetButton.disabled = false; // クリックで解除可能
                        }
                        restoredCount++;
                        console.log(`✅ 監視状態を復元: ${location}${targetData.timeText}`);
                    }
                    else {
                        console.log(`⚠️ 監視対象の追加に失敗: ${location}${targetData.timeText}`);
                    }
                }
                else {
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
            if (cacheManager) {
                cacheManager.clearMonitoringFlag();
            }
            // 空きありになった要素を自動選択して予約開始
            const slotInfo = {
                element: topPriority.currentStatus.element, // div[role="button"]要素
                timeText: topPriority.currentStatus.timeText,
                status: 'available',
                targetInfo: topPriority
            };
            // 監視状態とキャッシュをクリア
            if (cacheManager) {
                cacheManager.clearTargetSlots();
            }
            _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
            setTimeout(async () => {
                await selectTimeSlotAndStartReservation(slotInfo);
            }, 1000);
            return; // 復元処理終了
        }
        // 復元結果の処理
        if (restoredCount > 0) {
            _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = cached.retryCount || 0;
            _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';
            // メインボタンの表示更新
            updateMainButtonDisplay();
            console.log(`✅ ${restoredCount}個の監視状態を復元完了 (試行回数: ${cached.retryCount})`);
            // 監視継続フラグをチェックして監視を再開
            const shouldContinueMonitoring = cacheManager?.getAndClearMonitoringFlag();
            if (shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。監視を自動再開します...');
                setTimeout(() => {
                    (0,_section5__WEBPACK_IMPORTED_MODULE_2__/* .startSlotMonitoring */ .fp)();
                }, 3000); // DOM安定化を待ってから監視開始
            }
            else {
                console.log('🛑 監視継続フラグが無効または期限切れです。監視は再開されません');
            }
        }
        else {
            // 復元できた対象がない場合
            console.log('❌ 復元できた監視対象がありません');
            const shouldContinueMonitoring = cacheManager?.getAndClearMonitoringFlag();
            if (shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。カレンダー自動クリックを試行します...');
                // キャッシュクリアのヘルパー関数
                const clearTargetAndState = () => {
                    if (cacheManager) {
                        cacheManager.clearTargetSlots();
                    }
                    _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
                    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
                    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
                    updateMainButtonDisplay();
                    console.log('✅ キャッシュクリア完了');
                };
                // カレンダー日付をクリックして時間帯テーブルを表示させる
                if (cached.selectedDate) {
                    clickCalendarDate(cached.selectedDate).then(calendarClicked => {
                        if (calendarClicked) {
                            console.log('📅 カレンダー自動クリック成功。監視対象復元を再試行します...');
                            // 少し待ってから再試行
                            setTimeout(async () => {
                                // 全ての監視対象について再試行
                                let retryRestoredCount = 0;
                                cached.targets?.forEach((targetData) => {
                                    const retryTargetElement = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(targetData);
                                    const retryStatus = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(retryTargetElement);
                                    if (retryStatus) {
                                        const retrySlotInfo = {
                                            timeText: targetData.timeText,
                                            tdSelector: targetData.tdSelector,
                                            positionInfo: targetData.positionInfo,
                                            status: retryStatus.isFull ? 'full' : retryStatus.isAvailable ? 'available' : 'unknown'
                                        };
                                        const added = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.addTarget(retrySlotInfo);
                                        if (added) {
                                            retryRestoredCount++;
                                        }
                                    }
                                });
                                if (retryRestoredCount > 0) {
                                    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';
                                    console.log(`✅ ${retryRestoredCount}個の監視対象を再試行で復元成功`);
                                    updateMainButtonDisplay();
                                    (0,_section5__WEBPACK_IMPORTED_MODULE_2__/* .startSlotMonitoring */ .fp)();
                                }
                                else {
                                    console.log('❌ 再試行でも監視対象が見つかりません。キャッシュをクリアします');
                                    clearTargetAndState();
                                }
                            }, 2000);
                        }
                        else {
                            console.log('❌ カレンダー自動クリック失敗。キャッシュをクリアします');
                            clearTargetAndState();
                        }
                    });
                }
                else {
                    console.log('❌ 保存された日付情報がありません。キャッシュをクリアします');
                    clearTargetAndState();
                }
            }
            else {
                console.log('🗑️ 監視継続フラグが無効です。古いキャッシュをクリアします');
                if (cacheManager) {
                    cacheManager.clearTargetSlots();
                }
                _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
                _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
                _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
                updateMainButtonDisplay();
                console.log('✅ キャッシュクリア完了');
            }
        }
    }, 2000);
}
// エクスポート

// ============================================================================


/***/ }),

/***/ 448:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Dr: () => (/* binding */ waitForAnyElement),
/* harmony export */   I1: () => (/* binding */ getRandomWaitTime),
/* harmony export */   Q2: () => (/* binding */ judge_entrance_init),
/* harmony export */   Xs: () => (/* binding */ init_page),
/* harmony export */   ig: () => (/* binding */ init_entrance_page),
/* harmony export */   jp: () => (/* binding */ clickElement),
/* harmony export */   v8: () => (/* binding */ judge_init),
/* harmony export */   xk: () => (/* binding */ waitForElement)
/* harmony export */ });
/* unused harmony exports insert_style, prepare_filter */
// 【1. 基本機能・ユーティリティ】
// ============================================================================
// スタイルを挿入する関数
const insert_style = () => {
    const style = document.createElement("style");
    style.innerHTML = `
button.ext-ytomo {
    height: 40px;
    width: auto;
    min-width: 60px;
    padding: 0px 8px;
    background: rgb(0, 104, 33) !important;
    color: white;
}
button.no-after.ext-ytomo:after {
    background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;
}
button.ext-ytomo.btn-done {
    background: rgb(74, 76, 74) !important;
}
.ext-ytomo:hover {
    background: rgb(2, 134, 43);
}

.safe-none, .ytomo-none, .filter-none {
    display: none;
}

div.div-flex {
    display: flex;
    justify-content: center;
    margin: 5px;
}

input.ext-tomo.search {
    height: 50px;
    min-width: 200px;
    max-width: min(300px, 100%);
    font-family: quicksand;
    font-size: 16px;
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
    border: 1px solid #222426;
    border-radius: 25px;
    box-shadow: 0 1px 0 0 #ccc;
    padding: 0 0 0 10px;
    flex: 1 1;
}
    `;
    document.head.appendChild(style);
};
// 検索ワードを正規表現に変換する関数
// val_searchには以下の3種類に大別されるワードが含まれる
// 1. 通常の文字列
// 2. マイナス検索用文字列 (`-`から始まる)
// 3. phrase検索用文字列 (`"`で囲まれた文字列)
// また、*は0文字以上のワイルドカードとして扱う
// 区切り文字は以下の通り
// 1. 全角スペース, 半角スペース: ANDの意味
// 2. or, OR (前後に全角または半角の空白を伴う): ORの意味
// また、ANDやORを組み合わせる場合、半角括弧でその範囲を明示的にできる
const prepare_filter = (val_search) => {
    // 空の検索文字列の場合は全てにマッチする正規表現を返す
    if (!val_search.trim()) {
        return { include: /(?:)/, exclude: null };
    }
    // OR条件を一時的に特別なマーカーに置換（後で処理するため）
    const orReplaced = val_search.replace(/(?:\s+|^)(or|OR)(?:\s+|$)/g, ' \uFFFF ');
    // フレーズ検索（引用符で囲まれた部分）を抽出
    const phraseMatches = orReplaced.match(/"[^"]*"/g) || [];
    let remainingStr = orReplaced;
    const phrases = phraseMatches.map(phrase => {
        remainingStr = remainingStr.replace(phrase, '');
        return phrase.slice(1, -1).replace(/\*/g, '.*');
    });
    // 残りの部分から通常の単語とマイナス検索を抽出
    const tokens = remainingStr.split(/\s+/).filter(token => token);
    const includeTokens = [];
    const excludeTokens = [];
    tokens.forEach(token => {
        if (token === '\uFFFF') {
            // ORマーカー
            includeTokens.push(token);
        }
        else if (token.startsWith('-')) {
            // マイナス検索
            const cleaned = token.slice(1).replace(/\*/g, '.*');
            if (cleaned)
                excludeTokens.push(cleaned);
        }
        else {
            // 通常の検索
            const cleaned = token.replace(/\*/g, '.*');
            if (cleaned)
                includeTokens.push(cleaned);
        }
    });
    // フレーズをincludeTokensに追加
    phrases.forEach(phrase => {
        includeTokens.push(phrase);
    });
    // 括弧の処理（簡易的な実装）
    const processParentheses = (tokens) => {
        const stack = [[]];
        for (const token of tokens) {
            if (token === '(') {
                stack.push([]);
            }
            else if (token === ')') {
                if (stack.length > 1) {
                    const group = stack.pop();
                    stack[stack.length - 1].push(group);
                }
            }
            else {
                stack[stack.length - 1].push(token);
            }
        }
        return stack[0];
    };
    const groupedIncludes = processParentheses(includeTokens);
    // 正規表現の構築（順不同対応版）
    const buildRegex = (group) => {
        if (Array.isArray(group)) {
            const parts = group.map(item => Array.isArray(item) ? buildRegex(item) : item);
            // ORマーカーがあるかチェック
            const orIndex = parts.findIndex(part => part === '\uFFFF');
            if (orIndex > -1) {
                const left = buildRegex(parts.slice(0, orIndex));
                const right = buildRegex(parts.slice(orIndex + 1));
                return `(?:${left}|${right})`;
            }
            else {
                // AND条件の場合は順不同でマッチするように変更
                return parts.map((part) => `(?=.*${part})`).join('');
            }
        }
        return group;
    };
    const includePattern = buildRegex(groupedIncludes)
        .replace(/\uFFFF/g, '|')
        .replace(/\.\*/g, '[\\s\\S]*');
    // Safari対応：除外条件を別々にチェックする方式に変更
    const excludePatterns = excludeTokens.map(token => new RegExp(token.replace(/\.\*/g, '[\\s\\S]*'), 'i'));
    return {
        include: new RegExp(includePattern, 'i'),
        exclude: excludePatterns.length > 0 ? excludePatterns : null
    };
};
// ページ初期化処理
const init_page = () => {
    // すべて読み込みボタンの自動クリック処理
    const load_more_auto = async () => {
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const arr_btn = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        if (arr_btn.length > 0) {
            arr_btn[0].click();
            setTimeout(() => {
                scrollTo(scrollX, scrollY);
                load_more_auto();
            }, 500);
        }
        else {
            console.log("No more load more button");
        }
    };
    // ボタンのスタイルを生成する関数
    const get_btn_style = () => {
        const btn = document.createElement("button");
        btn.classList.add("basic-btn");
        btn.classList.add("type2");
        btn.classList.add("no-after");
        btn.classList.add("ext-ytomo");
        btn.style.height = "auto";
        btn.style.minHeight = "40px";
        btn.style.width = "auto";
        btn.style.minWidth = "60px";
        btn.style.padding = "0px 8px";
        // btn.style.background = "rgb(0, 104, 33)";
        btn.style.color = "white";
        btn.style.margin = "5px";
        return btn;
    };
    // 独自ボタン群を挿入する関数
    const insert_button = () => {
        // const btn_official_search = document.querySelector("button.style_search_btn__ZuOpx");
        const div_official_search = document.querySelector("div.style_search__7HKSe");
        const div_insert = document.createElement("div");
        div_insert.classList.add("div-flex");
        const div_insert2 = document.createElement("div");
        div_insert2.classList.add("div-flex");
        const btn_load_all = get_btn_style();
        btn_load_all.classList.add("btn-load-all");
        const span_load_all = document.createElement("span");
        span_load_all.classList.add("ext-ytomo");
        span_load_all.innerText = "すべて読み込み";
        btn_load_all.appendChild(span_load_all);
        const btn_filter_safe = get_btn_style();
        btn_filter_safe.classList.add("btn-filter-safe");
        const span_filter_safe = document.createElement("span");
        span_filter_safe.classList.add("ext-ytomo");
        span_filter_safe.innerText = "空きのみ";
        btn_filter_safe.appendChild(span_filter_safe);
        const btn_filter_without_load = get_btn_style();
        btn_filter_without_load.classList.add("btn-filter-without-load");
        const span_filter_without_load = document.createElement("span");
        span_filter_without_load.classList.add("ext-ytomo");
        span_filter_without_load.innerText = "絞込";
        btn_filter_without_load.appendChild(span_filter_without_load);
        const input_another_search = document.createElement("input");
        input_another_search.classList.add("ext-tomo");
        input_another_search.classList.add("search");
        input_another_search.setAttribute("type", "text");
        input_another_search.setAttribute("placeholder", "読み込みなし絞込");
        const btn_alert_to_copy = get_btn_style();
        btn_alert_to_copy.classList.add("btn-alert-to-copy");
        const span_alert_to_copy = document.createElement("span");
        span_alert_to_copy.classList.add("ext-ytomo");
        span_alert_to_copy.innerText = "一覧コピー";
        btn_alert_to_copy.appendChild(span_alert_to_copy);
        // btn_official_search.after(btn_filter_safe);
        // btn_official_search.after(btn_load_all);
        // btn_official_search.after(btn_filter_without_load);
        div_insert.appendChild(input_another_search);
        div_insert.appendChild(btn_filter_without_load);
        div_insert2.appendChild(btn_load_all);
        div_insert2.appendChild(btn_filter_safe);
        div_insert2.appendChild(btn_alert_to_copy);
        div_official_search.after(div_insert);
        div_official_search.after(div_insert2);
    };
    // const refresh_btn_ = () => {
    // }
    insert_style();
    insert_button();
    // 独自ボタンのクリックイベントハンドラ
    document.addEventListener("click", (event) => {
        if (event.target?.matches?.("button.ext-ytomo, button.ext-ytomo *")) {
            // event.preventDefault()
            // event.stopPropagation()
            const target = event.target?.closest?.("button.ext-ytomo");
            if (target.classList.contains("btn-load-all")) {
                // すべて読み込み
                target.disabled = true;
                load_more_auto().then(() => {
                    target.disabled = false;
                    target.classList.toggle("btn-done");
                });
            }
            else if (target.classList.contains("btn-filter-safe")) {
                // 空きあり絞り込み
                target.disabled = true;
                target.classList.toggle("btn-done");
                document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])").forEach((div) => {
                    div.classList.toggle("safe-none");
                });
                setTimeout(() => {
                    target.disabled = false;
                }, 500);
            }
            else if (target.classList.contains("btn-filter-without-load")) {
                // 入力値で絞り込み
                target.disabled = true;
                const input_another_search = document.querySelector("input.ext-tomo.search");
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC");
                const val_search = input_another_search?.value || '';
                const dic_regex_exp = prepare_filter(val_search);
                if (val_search.length > 0) {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("filter-none");
                        if (!((dic_regex_exp.include === null || dic_regex_exp.include.test(div.innerText))
                            && (dic_regex_exp.exclude === null || !dic_regex_exp.exclude.some((d) => d.test(div.innerText))))) {
                            div.classList.add("filter-none");
                        }
                    });
                }
                else {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("filter-none");
                    });
                }
                // setTimeout(() => {
                target.disabled = false;
                // }, 500)
            }
            else if (target.classList.contains("btn-alert-to-copy")) {
                // 一覧コピー
                target.disabled = true;
                // アラート起動
                // filter-none, ytomo-none, safe-noneを除外して表示
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC:not(.filter-none):not(.ytomo-none):not(.safe-none)");
                let arr_text = [];
                // div > button > span のテキストを取得
                arr_div_row.forEach((div) => {
                    const span = div.querySelector("button>span");
                    if (span) {
                        arr_text.push(span.innerText);
                    }
                });
                const text = arr_text.join("\n");
                try {
                    navigator.clipboard.writeText(text);
                }
                catch (e) {
                    alert(text);
                    // console.error("ytomo extension error", e);
                    // alert(e);
                }
                setTimeout(() => {
                    target.disabled = false;
                }, 500);
            }
        }
    });
};
// ページ初期化可能か判定
const judge_init = () => {
    const cand_btn = document.querySelector("button.style_search_btn__ZuOpx");
    return cand_btn !== null;
};
// 入場予約ページ初期化可能か判定
const judge_entrance_init = () => {
    const target_div = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
    return target_div !== null;
};
// 入場予約ページ初期化処理
const init_entrance_page = (dependencies = {}) => {
    const { setPageLoadingStateFn, createEntranceReservationUIFn, initTimeSlotMonitoringFn, restoreFromCacheFn } = dependencies;
    insert_style();
    // 入場予約機能の設定
    const entranceReservationConfig = {
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
    // 初期化開始時に即座に読み込み状態を設定
    if (setPageLoadingStateFn)
        setPageLoadingStateFn(true);
    // UIを即座に作成（読み込み状態表示のため）
    if (createEntranceReservationUIFn)
        createEntranceReservationUIFn(entranceReservationConfig);
    // 時間帯監視機能の初期化（動的待機）
    (async () => {
        if (initTimeSlotMonitoringFn)
            await initTimeSlotMonitoringFn();
        // キャッシュからの状態復元（カレンダー読み込み完了後に実行）
        if (restoreFromCacheFn)
            await restoreFromCacheFn();
        // 初期化完了時に読み込み状態を解除
        if (setPageLoadingStateFn)
            setPageLoadingStateFn(false);
    })();
    console.log("入場予約機能の初期化完了");
};
// 入場予約関連のヘルパー関数
function getRandomWaitTime(minTime, randomRange, config) {
    const { randomSettings } = config;
    const actualMinTime = minTime !== undefined ? minTime : randomSettings.minCheckInterval;
    const actualRandomRange = randomRange !== undefined ? randomRange : randomSettings.checkRandomRange;
    return actualMinTime + Math.floor(Math.random() * actualRandomRange);
}
async function waitForElement(selector, timeout = 5000, config) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            }
            else if (Date.now() - startTime > timeout) {
                reject(new Error(`要素が見つかりません: ${selector}`));
            }
            else {
                setTimeout(checkElement, getRandomWaitTime(config.randomSettings.minCheckInterval, config.randomSettings.checkRandomRange, config));
            }
        };
        checkElement();
    });
}
async function waitForAnyElement(selectors, timeout = 10000, selectorTexts = {}, config) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        const checkElements = () => {
            for (const [key, selector] of Object.entries(selectors)) {
                const elements = document.querySelectorAll(selector);
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if (selectorTexts[key]) {
                        if (element.textContent && element.textContent.includes(selectorTexts[key])) {
                            resolve({ key, element: element });
                            return;
                        }
                    }
                    else {
                        if (element) {
                            resolve({ key, element: element });
                            return;
                        }
                    }
                }
            }
            if (Date.now() - startTime > timeout) {
                reject(new Error(`いずれの要素も見つかりません: ${Object.keys(selectors).join(', ')}`));
            }
            else {
                setTimeout(checkElements, getRandomWaitTime(config.randomSettings.minCheckInterval, config.randomSettings.checkRandomRange, config));
            }
        };
        checkElements();
    });
}
async function clickElement(element, config) {
    element.click();
    const delay = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
    await new Promise(resolve => setTimeout(resolve, delay));
}
// エクスポート



/***/ }),

/***/ 523:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DT: () => (/* binding */ createEntranceReservationUI),
/* harmony export */   FX: () => (/* binding */ entranceReservationHelper),
/* harmony export */   N9: () => (/* binding */ canStartReservation),
/* harmony export */   TP: () => (/* binding */ setCacheManagerForSection7),
/* harmony export */   yT: () => (/* binding */ updateMonitoringTargetsDisplay)
/* harmony export */ });
/* unused harmony exports getCurrentReservationTarget, checkVisitTimeButtonState, checkTimeSlotSelected, checkInitialState, startCalendarWatcher, handleCalendarChange, removeAllMonitorButtons */
/* harmony import */ var _section1__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(448);
/* harmony import */ var _section2__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(897);
/* harmony import */ var _section4__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(915);
/* harmony import */ var _section5__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(628);
/* harmony import */ var _section6__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(117);
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Section 1からのimport


// Section 2からのimport


// Section 4からのimport


// Section 5からのimport


// Section 6からのimport  


// 【7. FAB・メインUI】
// ============================================================================

// 依存注入用のcacheManager参照
var cacheManager = null;

// cacheManagerを設定するヘルパー関数
var setCacheManagerForSection7 = function setCacheManagerForSection7(cm) {
  cacheManager = cm;
};
function createEntranceReservationUI(config) {
  // 既存のFABがあれば削除
  var existingFab = document.getElementById('ytomo-fab-container');
  if (existingFab) {
    existingFab.remove();
  }

  // FABコンテナを作成（右下固定）
  var fabContainer = document.createElement('div');
  fabContainer.id = 'ytomo-fab-container';
  fabContainer.style.cssText = "\n        position: fixed !important;\n        bottom: 24px !important;\n        right: 24px !important;\n        z-index: 10000 !important;\n        display: flex !important;\n        flex-direction: column !important;\n        gap: 12px !important;\n        align-items: flex-end !important;\n        pointer-events: auto !important;\n    ";

  // メインFABボタンを作成
  var fabButton = document.createElement('button');
  fabButton.id = 'ytomo-main-fab';
  fabButton.classList.add('ext-ytomo');
  fabButton.style.cssText = "\n        width: 56px !important;\n        height: 56px !important;\n        border-radius: 50% !important;\n        background: rgb(0, 104, 33) !important;\n        color: white !important;\n        border: none !important;\n        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2) !important;\n        border: 3px solid rgba(255, 255, 255, 0.2) !important;\n        cursor: pointer !important;\n        display: flex !important;\n        align-items: center !important;\n        justify-content: center !important;\n        font-size: 14px !important;\n        font-weight: bold !important;\n        transition: all 0.3s ease !important;\n        position: relative !important;\n        overflow: hidden !important;\n        pointer-events: auto !important;\n        opacity: 0.9 !important;\n    ";

  // FABボタンのテキスト/アイコン
  var fabIcon = document.createElement('span');
  fabIcon.classList.add('ext-ytomo');
  fabIcon.style.cssText = "\n        font-size: 12px !important;\n        text-align: center !important;\n        line-height: 1.2 !important;\n        white-space: nowrap !important;\n        pointer-events: none !important;\n    ";
  fabIcon.innerText = '待機中';
  fabButton.appendChild(fabIcon);

  // 初期状態で無効化
  fabButton.disabled = true;
  fabButton.style.opacity = '0.6';
  fabButton.style.cursor = 'not-allowed';

  // ホバー効果（強化版）
  fabButton.addEventListener('mouseenter', function () {
    fabButton.style.transform = 'scale(1.15)';
    fabButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)';
    fabButton.style.borderWidth = '4px';
  });
  fabButton.addEventListener('mouseleave', function () {
    fabButton.style.transform = 'scale(1)';
    fabButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)';
    fabButton.style.borderWidth = '3px';
  });

  // 監視対象表示エリア（目立つ表示）
  var monitoringTargetsDisplay = document.createElement('div');
  monitoringTargetsDisplay.id = 'ytomo-monitoring-targets';
  monitoringTargetsDisplay.style.cssText = "\n        background: linear-gradient(135deg, rgba(0, 104, 33, 0.95), rgba(0, 150, 50, 0.95)) !important;\n        color: white !important;\n        padding: 8px 12px !important;\n        border-radius: 12px !important;\n        font-size: 12px !important;\n        font-weight: bold !important;\n        text-align: center !important;\n        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;\n        border: 2px solid rgba(255, 255, 255, 0.3) !important;\n        min-width: 120px !important;\n        max-width: 200px !important;\n        display: none !important;\n        white-space: pre-line !important;\n        overflow: visible !important;\n        text-overflow: clip !important;\n        pointer-events: auto !important;\n        cursor: pointer !important;\n        transition: all 0.3s ease !important;\n    ";
  monitoringTargetsDisplay.title = '監視対象一覧（クリックで詳細表示）';

  // ホバー効果
  monitoringTargetsDisplay.addEventListener('mouseenter', function () {
    monitoringTargetsDisplay.style.transform = 'scale(1.05)';
    monitoringTargetsDisplay.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.4)';
  });
  monitoringTargetsDisplay.addEventListener('mouseleave', function () {
    monitoringTargetsDisplay.style.transform = 'scale(1)';
    monitoringTargetsDisplay.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
  });

  // ステータス表示（コンパクト）
  var statusBadge = document.createElement('div');
  statusBadge.id = 'ytomo-status-badge';
  statusBadge.style.cssText = "\n        background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9)) !important;\n        color: white !important;\n        padding: 8px 16px !important;\n        border-radius: 20px !important;\n        font-size: 12px !important;\n        font-weight: bold !important;\n        white-space: pre-line !important;\n        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2) !important;\n        border: 2px solid rgba(255, 255, 255, 0.15) !important;\n        display: none !important;\n        pointer-events: none !important;\n        text-align: center !important;\n        line-height: 1.3 !important;\n    ";
  statusBadge.innerText = '待機中';

  // メインFABボタンにイベントリスナーを設定
  fabButton.addEventListener('click', /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(event) {
      var result, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            if (!(fabButton.disabled || fabButton.hasAttribute('disabled'))) {
              _context.n = 1;
              break;
            }
            console.log('⚠️ ボタンがdisabledのためクリックを無視します');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return _context.a(2, false);
          case 1:
            if (!(fabButton.style.pointerEvents === 'none')) {
              _context.n = 2;
              break;
            }
            console.log('⚠️ pointer-events:noneのためクリックを無視します');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return _context.a(2, false);
          case 2:
            if ((0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .isInterruptionAllowed */ .Is)()) {
              _context.n = 3;
              break;
            }
            console.log('⚠️ リロード直前のため中断できません');
            showStatus('リロード直前のため中断できません', 'red');
            return _context.a(2);
          case 3:
            if (!_section2__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.isMonitoring) {
              _context.n = 4;
              break;
            }
            console.log('監視を中断します');
            (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .stopSlotMonitoring */ .XG)();
            // ステータスは中断を示すメッセージを表示（消さない）
            showStatus('監視中断', 'orange');
            (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
            return _context.a(2);
          case 4:
            if (!_section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning) {
              _context.n = 5;
              break;
            }
            console.log('予約処理を中断します');
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop = true;
            showStatus('予約処理を中断中...', 'orange');
            return _context.a(2);
          case 5:
            if (!(_section2__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.hasTargets() && _section2__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.mode === 'selecting')) {
              _context.n = 7;
              break;
            }
            // 即座にUI更新してから監視開始
            (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
            _context.n = 6;
            return (0,_section5__WEBPACK_IMPORTED_MODULE_3__/* .startSlotMonitoring */ .fp)();
          case 6:
            return _context.a(2);
          case 7:
            // 通常の予約処理
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning = true;
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop = false;
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.startTime = Date.now();
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.attempts = 0;
            showStatus('予約処理実行中...', 'blue');
            (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
            updateMonitoringTargetsDisplay(); // 予約対象を表示
            _context.p = 8;
            _context.n = 9;
            return entranceReservationHelper(config);
          case 9:
            result = _context.v;
            if (result.success) {
              showStatus("\uD83C\uDF89 \u4E88\u7D04\u6210\u529F\uFF01(".concat(result.attempts, "\u56DE\u8A66\u884C)"), 'green');
              cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
              cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
            } else {
              showStatus("\u4E88\u7D04\u5931\u6557 (".concat(result.attempts, "\u56DE\u8A66\u884C)"), 'red');
            }
            _context.n = 11;
            break;
          case 10:
            _context.p = 10;
            _t = _context.v;
            console.error('予約処理エラー:', _t);
            showStatus("\u30A8\u30E9\u30FC: ".concat(_t.message), 'red');
          case 11:
            _context.p = 11;
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning = false;
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.startTime = null;
            _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.attempts = 0;
            (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
            updateMonitoringTargetsDisplay(); // 予約終了時に表示更新
            return _context.f(11);
          case 12:
            return _context.a(2);
        }
      }, _callee, null, [[8, 10, 11, 12]]);
    }));
    return function (_x) {
      return _ref.apply(this, arguments);
    };
  }());

  // disabled状態でのクリックを確実に防ぐため、キャプチャーフェーズでも処理
  fabButton.addEventListener('click', function (event) {
    if (fabButton.disabled || fabButton.hasAttribute('disabled') || fabButton.style.pointerEvents === 'none') {
      console.log('🚫 キャプチャーフェーズでdisabledクリックを阻止');
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      return false;
    }
  }, true); // useCapture = true

  // ステータス表示用のヘルパー関数
  function showStatus(message) {
    var color = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'white';
    statusBadge.innerText = message;
    statusBadge.style.background = color === 'green' ? 'rgba(0, 128, 0, 0.9)' : color === 'red' ? 'rgba(255, 0, 0, 0.9)' : color === 'orange' ? 'rgba(255, 140, 0, 0.9)' : color === 'blue' ? 'rgba(0, 104, 33, 0.9)' : 'rgba(0, 0, 0, 0.8)';
    statusBadge.style.display = 'block';

    // 一定時間後に自動で隠す（エラー、成功、中断メッセージ以外）
    if (color !== 'red' && color !== 'green' && color !== 'orange') {
      setTimeout(function () {
        statusBadge.style.display = 'none';
      }, 3000);
    }
  }

  // FABコンテナに要素を追加（上から順：監視対象→ステータス→ボタン）
  fabContainer.appendChild(monitoringTargetsDisplay);
  fabContainer.appendChild(statusBadge);
  fabContainer.appendChild(fabButton);

  // DOMに追加（body直下）
  document.body.appendChild(fabContainer);
  console.log('✅ FAB形式の予約UIを作成しました');

  // 初期状態を判定してFABを更新
  setTimeout(function () {
    checkInitialState();
  }, 500);

  // カレンダー変更監視を開始
  startCalendarWatcher();
}

// 監視対象表示を更新
function updateMonitoringTargetsDisplay() {
  var targetsDisplay = document.querySelector('#ytomo-monitoring-targets');
  if (!targetsDisplay) return;

  // 予約実行中の対象を取得
  var reservationTarget = getCurrentReservationTarget();
  var targets = _section2__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getTargets();

  // 予約実行中の場合は予約対象を表示
  if (_section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning && reservationTarget) {
    targetsDisplay.innerText = "\u4E88\u7D04\u5BFE\u8C61:\n".concat(reservationTarget);
    targetsDisplay.style.display = 'block';
    targetsDisplay.style.background = 'linear-gradient(135deg, rgba(0, 104, 33, 0.9), rgba(0, 150, 50, 0.9))';
    targetsDisplay.title = "\u73FE\u5728\u4E88\u7D04\u5B9F\u884C\u4E2D\u306E\u5BFE\u8C61: ".concat(reservationTarget);
    return;
  }

  // 監視対象がない場合は非表示
  if (targets.length === 0) {
    targetsDisplay.style.display = 'none';
    return;
  }

  // 監視対象を東西+時間形式で表示
  var targetTexts = targets.map(function (target, index) {
    var location = _section2__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);
    var priority = index + 1;
    return "".concat(priority, ".").concat(location).concat(target.timeText);
  });
  targetsDisplay.innerText = "\u76E3\u8996\u5BFE\u8C61:\n".concat(targetTexts.join('\n'));
  targetsDisplay.style.display = 'block';
  targetsDisplay.style.background = 'linear-gradient(135deg, rgba(255, 140, 0, 0.9), rgba(255, 180, 0, 0.9))';

  // 詳細なツールチップ
  var detailText = targets.map(function (target, index) {
    var location = _section2__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);
    var priority = index + 1;
    return "".concat(priority, ". ").concat(location).concat(target.timeText);
  }).join('\n');
  targetsDisplay.title = "\u76E3\u8996\u5BFE\u8C61 (".concat(targets.length, "\u500B):\n").concat(detailText, "\n\n\u30AF\u30EA\u30C3\u30AF\u3067\u8A73\u7D30\u8868\u793A");
}

// 現在の予約対象時間帯を取得
function getCurrentReservationTarget() {
  // 選択された時間帯を探す
  var selectedSlot = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
  if (!selectedSlot) return null;
  var timeSpan = selectedSlot.querySelector('dt span');
  if (!timeSpan) return null;
  var timeText = timeSpan.textContent.trim();

  // 東西判定
  var tdElement = selectedSlot.closest('td[data-gray-out]');
  var tdSelector = (0,_section4__WEBPACK_IMPORTED_MODULE_2__/* .generateUniqueTdSelector */ .sN)(tdElement);
  var location = _section2__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getLocationFromSelector(tdSelector);
  return "".concat(location).concat(timeText);
}

// 来場日時設定ボタンの状態をチェック
function checkVisitTimeButtonState() {
  var visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq');
  if (!visitTimeButton) {
    console.log('⚠️ 来場日時設定ボタンが見つかりません');
    return false;
  }
  var isDisabled = visitTimeButton.hasAttribute('disabled') || visitTimeButton.disabled;
  console.log("\uD83D\uDD18 \u6765\u5834\u65E5\u6642\u8A2D\u5B9A\u30DC\u30BF\u30F3: ".concat(isDisabled ? '無効' : '有効'));
  return !isDisabled;
}

// 時間帯が選択されているかチェック
function checkTimeSlotSelected() {
  // 選択された時間帯（aria-pressed="true"）をチェック
  var selectedTimeSlot = document.querySelector(_section4__WEBPACK_IMPORTED_MODULE_2__/* .timeSlotSelectors */ .eN.selectedSlot);
  if (!selectedTimeSlot) {
    console.log('⚠️ 時間帯が選択されていません');
    return false;
  }

  // 選択された時間帯が満員でないかチェック
  var status = (0,_section4__WEBPACK_IMPORTED_MODULE_2__/* .extractTdStatus */ .SE)(selectedTimeSlot.closest('td'));
  if (status && status.isFull) {
    console.log('⚠️ 選択された時間帯は満員です');
    return false;
  }
  console.log("\u2705 \u6642\u9593\u5E2F\u9078\u629E\u6E08\u307F: ".concat((status === null || status === void 0 ? void 0 : status.timeText) || 'unknown'));
  return true;
}

// 予約開始可能かどうかの総合判定
function canStartReservation() {
  var hasTimeSlotTable = (0,_section5__WEBPACK_IMPORTED_MODULE_3__/* .checkTimeSlotTableExistsSync */ .H5)();
  var isTimeSlotSelected = checkTimeSlotSelected();
  var isVisitTimeButtonEnabled = checkVisitTimeButtonState();
  console.log("\uD83D\uDCCA \u4E88\u7D04\u958B\u59CB\u6761\u4EF6\u30C1\u30A7\u30C3\u30AF:");
  console.log("  - \u6642\u9593\u5E2F\u30C6\u30FC\u30D6\u30EB: ".concat(hasTimeSlotTable ? '✅' : '❌'));
  console.log("  - \u6642\u9593\u5E2F\u9078\u629E: ".concat(isTimeSlotSelected ? '✅' : '❌'));
  console.log("  - \u6765\u5834\u65E5\u6642\u30DC\u30BF\u30F3\u6709\u52B9: ".concat(isVisitTimeButtonEnabled ? '✅' : '❌'));
  return hasTimeSlotTable && isTimeSlotSelected && isVisitTimeButtonEnabled;
}

// 初期状態をチェックしてFABを適切に設定
function checkInitialState() {
  console.log('🔍 初期状態をチェック中...');

  // カレンダーで日付が選択されているかチェック
  var selectedDate = (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY)();
  var hasTimeSlotTable = (0,_section5__WEBPACK_IMPORTED_MODULE_3__/* .checkTimeSlotTableExistsSync */ .H5)();
  console.log("\uD83D\uDCC5 \u9078\u629E\u65E5\u4ED8: ".concat(selectedDate || 'なし'));
  console.log("\uD83D\uDDD3\uFE0F \u6642\u9593\u5E2F\u30C6\u30FC\u30D6\u30EB: ".concat(hasTimeSlotTable ? 'あり' : 'なし'));
  if (selectedDate && hasTimeSlotTable) {
    // 時間帯テーブルがある場合、予約開始可能かチェック
    var canStart = canStartReservation();
    console.log("\u2705 \u65E5\u4ED8\u9078\u629E\u6E08\u307F\u3001\u6642\u9593\u5E2F\u30C6\u30FC\u30D6\u30EB\u8868\u793A\u4E2D - ".concat(canStart ? '予約開始可能' : '条件未満'));

    // FABボタンの状態を設定
    var fabButton = document.querySelector('#ytomo-main-fab');
    var fabIcon = fabButton === null || fabButton === void 0 ? void 0 : fabButton.querySelector('span');
    if (fabButton && fabIcon) {
      // 常に「予約開始」と表示
      fabIcon.innerText = '予約\n開始';
      if (canStart) {
        // 予約開始可能
        fabButton.style.background = 'rgb(0, 104, 33) !important';
        fabButton.style.opacity = '0.9 !important';
        fabButton.style.cursor = 'pointer !important';
        fabButton.disabled = false;
        fabButton.title = '予約開始';
      } else {
        // 条件未満足 - disabled状態（グレー色）
        fabButton.style.background = 'rgb(128, 128, 128) !important';
        fabButton.style.opacity = '0.9 !important';
        fabButton.style.cursor = 'not-allowed !important';
        fabButton.disabled = true;
        fabButton.title = '時間帯を選択し、来場日時設定ボタンが有効になるまでお待ちください';
      }
    }

    // ステータスも更新
    (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateStatusBadge */ .pW)(canStart ? 'idle' : 'waiting');
  } else {
    // カレンダー未選択または時間帯テーブル未表示の場合は待機中のまま
    console.log('⏳ カレンダー未選択または時間帯テーブル未表示 - 待機中を維持');
    (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateStatusBadge */ .pW)('idle');
  }
}

// カレンダー変更を監視して監視ボタンを再設置
function startCalendarWatcher() {
  if (_section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.isWatching) return;
  _section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.isWatching = true;
  _section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate = (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY)();
  console.log('📅 カレンダー変更監視を開始');

  // MutationObserverでカレンダー変更・時間帯選択・ボタン状態変更を検出
  _section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.observer = new MutationObserver(function (mutations) {
    var shouldUpdate = false;
    mutations.forEach(function (mutation) {
      // 1. カレンダーのaria-pressed属性の変更を検出
      if (mutation.type === 'attributes' && (mutation.attributeName === 'aria-pressed' || mutation.attributeName === 'class')) {
        var element = mutation.target;
        if (element.matches('[role="button"][aria-pressed]') && element.querySelector('time[datetime]')) {
          shouldUpdate = true;
        }
      }

      // 2. 時間帯選択の変更を検出
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-pressed') {
        var _element = mutation.target;
        if (_element.matches('td[data-gray-out] div[role="button"]')) {
          shouldUpdate = true;
        }
      }

      // 3. 来場日時設定ボタンのdisabled属性変更を検出
      if (mutation.type === 'attributes' && mutation.attributeName === 'disabled') {
        var _element2 = mutation.target;
        if (_element2.matches('button.basic-btn.type2.style_full__ptzZq')) {
          shouldUpdate = true;
        }
      }
    });
    if (shouldUpdate) {
      // 少し遅延して処理（DOM更新完了を待つ）
      setTimeout(function () {
        handleCalendarChange();
      }, 500);
    }
  });

  // カレンダー要素全体を監視
  var observeTarget = document.body;
  _section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.observer.observe(observeTarget, {
    attributes: true,
    subtree: true,
    attributeFilter: ['aria-pressed', 'class', 'disabled']
  });
}

// カレンダー変更・状態変更時の処理
function handleCalendarChange() {
  var newSelectedDate = (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY)();
  var calendarDateChanged = newSelectedDate !== _section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate;
  if (calendarDateChanged) {
    console.log("\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u65E5\u4ED8\u5909\u66F4\u3092\u691C\u51FA: ".concat(_section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate, " \u2192 ").concat(newSelectedDate));

    // 監視実行中は日付変更を無視
    if (_section2__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.isMonitoring) {
      console.log('⚠️ 監視実行中のため日付変更を無視します');
      return;
    }
    _section2__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate = newSelectedDate;

    // 既存の監視状態をクリア（日付が変わったため）
    if (_section2__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.hasTargets() && !_section2__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.isMonitoring) {
      console.log('📅 日付変更により監視対象をクリア');
      _section2__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.clearAll();
      _section2__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.mode = 'idle';
      cacheManager.clearTargetSlots();
    }

    // 監視ボタンを再設置
    setTimeout(function () {
      removeAllMonitorButtons();
      (0,_section5__WEBPACK_IMPORTED_MODULE_3__/* .analyzeAndAddMonitorButtons */ .wj)();

      // FABボタンの状態も更新
      (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
      console.log('🔄 監視ボタンとFABを再設置しました');
    }, 1000); // 時間帯テーブル更新を待つ
  } else {
    // 日付は変わっていない - 監視ボタンの再設置は不要
    console.log('📅 日付変更なし - FABボタンの状態のみ更新');

    // FABボタンの状態のみ更新（監視ボタンは再設置しない）
    (0,_section6__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
  }
}

// 既存の監視ボタンをすべて削除
function removeAllMonitorButtons() {
  var existingButtons = document.querySelectorAll('.monitor-btn.ext-ytomo');
  existingButtons.forEach(function (button) {
    return button.remove();
  });
  console.log("\uD83D\uDDD1\uFE0F \u65E2\u5B58\u306E\u76E3\u8996\u30DC\u30BF\u30F3\u3092".concat(existingButtons.length, "\u500B\u524A\u9664\u3057\u307E\u3057\u305F"));
}
function entranceReservationHelper(_x2) {
  return _entranceReservationHelper.apply(this, arguments);
} // エクスポート
function _entranceReservationHelper() {
  _entranceReservationHelper = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(config) {
    var selectors, selectorTexts, timeouts, attempts, maxAttempts, statusDiv, submitButton, responseSelectors, response, finalSelectors, finalResponse, closeButton, _closeButton, _t2;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          selectors = config.selectors, selectorTexts = config.selectorTexts, timeouts = config.timeouts;
          attempts = 0;
          maxAttempts = 100;
          console.log('入場予約補助機能を開始します...');
        case 1:
          if (!(attempts < maxAttempts && !_section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop)) {
            _context2.n = 22;
            break;
          }
          attempts++;
          console.log("\u8A66\u884C\u56DE\u6570: ".concat(attempts));
          statusDiv = document.getElementById('reservation-status');
          if (statusDiv) {
            statusDiv.innerText = "\u8A66\u884C\u4E2D... (".concat(attempts, "\u56DE\u76EE)");
          }
          _context2.p = 2;
          console.log('1. submitボタンを待機中...');
          _context2.n = 3;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .waitForElement */ .xk)(selectors.submit, timeouts.waitForSubmit, config);
        case 3:
          submitButton = _context2.v;
          if (!_section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
            _context2.n = 4;
            break;
          }
          return _context2.a(3, 22);
        case 4:
          console.log('submitボタンが見つかりました。クリックします。');

          // submit押下時に回数を更新
          _section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.attempts = attempts;
          _context2.n = 5;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(submitButton, config);
        case 5:
          console.log('2. レスポンスを待機中...');
          responseSelectors = {
            change: selectors.change,
            success: selectors.success,
            failure: selectors.failure
          };
          _context2.n = 6;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .waitForAnyElement */ .Dr)(responseSelectors, timeouts.waitForResponse, selectorTexts, config);
        case 6:
          response = _context2.v;
          console.log("\u30EC\u30B9\u30DD\u30F3\u30B9\u691C\u51FA: ".concat(response.key));
          if (!_section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
            _context2.n = 7;
            break;
          }
          return _context2.a(3, 22);
        case 7:
          if (!(response.key === 'change')) {
            _context2.n = 14;
            break;
          }
          console.log('changeボタンをクリックします。');
          _context2.n = 8;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(response.element, config);
        case 8:
          console.log('success/failureを待機中...');
          finalSelectors = {
            success: selectors.success,
            failure: selectors.failure
          };
          _context2.n = 9;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .waitForAnyElement */ .Dr)(finalSelectors, timeouts.waitForResponse, selectorTexts, config);
        case 9:
          finalResponse = _context2.v;
          console.log("\u6700\u7D42\u30EC\u30B9\u30DD\u30F3\u30B9\u691C\u51FA: ".concat(finalResponse.key));
          if (!(finalResponse.key === 'success')) {
            _context2.n = 10;
            break;
          }
          console.log('🎉 予約成功！処理を終了します。');
          return _context2.a(2, {
            success: true,
            attempts: attempts
          });
        case 10:
          console.log('予約失敗。closeボタンをクリックして再試行します。');
          _context2.n = 11;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .waitForElement */ .xk)(selectors.close, timeouts.waitForClose, config);
        case 11:
          closeButton = _context2.v;
          _context2.n = 12;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(closeButton, config);
        case 12:
          _context2.n = 13;
          return new Promise(function (resolve) {
            return setTimeout(resolve, (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .getRandomWaitTime */ .I1)(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config));
          });
        case 13:
          _context2.n = 18;
          break;
        case 14:
          if (!(response.key === 'success')) {
            _context2.n = 15;
            break;
          }
          console.log('🎉 予約成功！処理を終了します。');
          return _context2.a(2, {
            success: true,
            attempts: attempts
          });
        case 15:
          if (!(response.key === 'failure')) {
            _context2.n = 18;
            break;
          }
          console.log('予約失敗。closeボタンをクリックして再試行します。');
          _context2.n = 16;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .waitForElement */ .xk)(selectors.close, timeouts.waitForClose, config);
        case 16:
          _closeButton = _context2.v;
          _context2.n = 17;
          return (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(_closeButton, config);
        case 17:
          _context2.n = 18;
          return new Promise(function (resolve) {
            return setTimeout(resolve, (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .getRandomWaitTime */ .I1)(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config));
          });
        case 18:
          _context2.n = 21;
          break;
        case 19:
          _context2.p = 19;
          _t2 = _context2.v;
          console.error("\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F (\u8A66\u884C ".concat(attempts, "):"), _t2.message);
          if (!_section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
            _context2.n = 20;
            break;
          }
          return _context2.a(3, 22);
        case 20:
          _context2.n = 21;
          return new Promise(function (resolve) {
            return setTimeout(resolve, (0,_section1__WEBPACK_IMPORTED_MODULE_0__/* .getRandomWaitTime */ .I1)(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config));
          });
        case 21:
          _context2.n = 1;
          break;
        case 22:
          if (!_section2__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
            _context2.n = 23;
            break;
          }
          console.log('ユーザーによってキャンセルされました。');
          return _context2.a(2, {
            success: false,
            attempts: attempts,
            cancelled: true
          });
        case 23:
          console.log("\u6700\u5927\u8A66\u884C\u56DE\u6570 (".concat(maxAttempts, ") \u306B\u9054\u3057\u307E\u3057\u305F\u3002\u51E6\u7406\u3092\u7D42\u4E86\u3057\u307E\u3059\u3002"));
          return _context2.a(2, {
            success: false,
            attempts: attempts
          });
      }
    }, _callee2, null, [[2, 19]]);
  }));
  return _entranceReservationHelper.apply(this, arguments);
}


// ============================================================================

/***/ }),

/***/ 628:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H5: () => (/* binding */ checkTimeSlotTableExistsSync),
/* harmony export */   S9: () => (/* binding */ setCacheManager),
/* harmony export */   bU: () => (/* binding */ analyzeTimeSlots),
/* harmony export */   cD: () => (/* binding */ startTimeSlotTableObserver),
/* harmony export */   fp: () => (/* binding */ startSlotMonitoring),
/* harmony export */   gW: () => (/* binding */ checkTimeSlotTableExistsAsync),
/* harmony export */   il: () => (/* binding */ waitForTimeSlotTable),
/* harmony export */   po: () => (/* binding */ setExternalFunctions),
/* harmony export */   wj: () => (/* binding */ analyzeAndAddMonitorButtons)
/* harmony export */ });
/* unused harmony exports extractTimeSlotInfo, generateSelectorForElement, addMonitorButtonsToFullSlots, getMonitorButtonText, updateAllMonitorButtonPriorities, createMonitorButton, handleMonitorButtonClick, checkSlotAvailabilityAndReload, findTargetSlotInPage, terminateMonitoring, checkTargetElementExists, validatePageLoaded, checkMaxReloads */
/* harmony import */ var _section2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(897);
/* harmony import */ var _section4__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(915);
// Section 2からのimport

// Section 4からのimport

// 【5. 時間帯監視・分析システム】
// ============================================================================
// 依存注入用の外部関数参照
let externalFunctions = {};
let isInitialized = false;
// 必要な外部関数のリスト
const REQUIRED_FUNCTIONS = [
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
    'tryClickCalendarForTimeSlot'
];
// 外部関数を設定するヘルパー関数
const setExternalFunctions = (funcs) => {
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
const safeCall = (funcName, ...args) => {
    if (!isInitialized) {
        throw new Error('External functions not initialized in Section 5');
    }
    if (typeof externalFunctions[funcName] !== 'function') {
        throw new Error(`Function ${funcName} not available in Section 5`);
    }
    return externalFunctions[funcName](...args);
};
// 安全な外部オブジェクト参照
function safeRef(objName) {
    if (!isInitialized) {
        throw new Error('External functions not initialized in Section 5');
    }
    if (!externalFunctions[objName]) {
        throw new Error(`Object ${objName} not available in Section 5`);
    }
    return externalFunctions[objName];
}
// 依存注入用のcacheManager参照
let cacheManager = null;
// cacheManagerを設定するヘルパー関数
const setCacheManager = (cm) => {
    cacheManager = cm;
};
// 時間帯テーブルの動的生成を監視（ループ防止版）
function startTimeSlotTableObserver() {
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
                        const element = node;
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
                        const element = node;
                        const isRelevant = element.tagName === 'TABLE' ||
                            element.tagName === 'TD' ||
                            element.tagName === 'IMG' || // アイコン変更も検出
                            (element.querySelector && (element.querySelector('table') ||
                                element.querySelector('td[data-gray-out]') ||
                                element.querySelector('div[role="button"]:not(.monitor-btn)') ||
                                element.querySelector('img[src*="calendar_ng.svg"]') ||
                                element.querySelector('img[src*="ico_scale"]')));
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
            }
            else if (mutation.type === 'attributes') {
                // 属性変更も監視（data-disabled、src等）
                const target = mutation.target;
                const attrName = mutation.attributeName;
                if (target.nodeType === Node.ELEMENT_NODE) {
                    const isRelevantAttr = ((attrName === 'data-disabled' && target.tagName === 'DIV' && target.getAttribute('role') === 'button') ||
                        (attrName === 'src' && target.tagName === 'IMG') ||
                        (attrName === 'aria-pressed' && target.tagName === 'DIV' && target.getAttribute('role') === 'button'));
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
                    }
                    else {
                        console.log('✅ 監視ボタンは既に適切に配置されています');
                        lastTableContent = safeCall('getCurrentTableContent');
                        isProcessing = false;
                    }
                }
                else {
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
async function waitForTimeSlotTable(timeout = 10000) {
    const startTime = Date.now();
    const checkInterval = 500;
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
function checkTimeSlotTableExistsSync() {
    // 実際の時間帯要素をチェック（時間を含むもの）
    const allElements = document.querySelectorAll(_section4__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotCells);
    const actualTimeSlots = [];
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
function analyzeAndAddMonitorButtons() {
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
        const tdElement = btn.closest('td[data-gray-out]');
        const tdSelector = tdElement ? (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement) : '';
        return { timeText, tdSelector };
    });
    console.log(`📋 差分計算: 既存ボタン数=${existingButtons.length}個 vs 満員時間帯数=${analysis.full.length}個`);
    // 不要なボタンを削除（時間+位置で判定）
    let removedCount = 0;
    existingButtons.forEach(button => {
        const timeText = button.getAttribute('data-target-time') || '';
        const tdElement = button.closest('td[data-gray-out]');
        const tdSelector = tdElement ? (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement) : '';
        // 監視対象として設定済みの場合は削除しない（状態変化を追跡するため）
        const isMonitoringTarget = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.isSelected(timeText, tdSelector);
        if (isMonitoringTarget) {
            console.log(`🎯 監視対象のため保持: ${timeText} (状態変化を追跡中)`);
            // 監視対象の状態が変わった場合はボタンテキストを更新
            const currentTd = button.closest('td[data-gray-out]');
            const currentStatus = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(currentTd);
            if (currentStatus && currentStatus.isAvailable) {
                const span = button.querySelector('span');
                if (span) {
                    span.innerText = '空きあり';
                    button.style.background = 'rgb(0, 200, 0)'; // より明るい緑
                    console.log(`✅ 監視対象が空きありに変化: ${timeText}`);
                }
            }
        }
        else {
            // 現在の満員時間帯に対応するものがあるかチェック
            const stillExists = analysis.full.some(slot => {
                const slotTdElement = slot.element.closest('td[data-gray-out]');
                const slotTdSelector = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(slotTdElement);
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
        const slotTdElement = slot.element.closest('td[data-gray-out]');
        const slotTdSelector = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(slotTdElement);
        return !existingSlots.some(existing => existing.timeText === slot.timeText && existing.tdSelector === slotTdSelector);
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
    }
    else if (newFullSlots.length === 0 && removedCount === 0) {
        console.log('監視ボタンは既に適切に配置されています');
    }
    else {
        console.log(`✅ 監視ボタン更新完了: 削除=${removedCount}個, 追加=${newFullSlots.length}個`);
    }
}
// 全時間帯の状態分析
function analyzeTimeSlots() {
    const available = [];
    const full = [];
    const selected = [];
    // 全てのtd要素を取得（時間帯テーブル内）
    const allTdElements = document.querySelectorAll(_section4__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotContainer + ' td[data-gray-out]');
    console.log(`📊 時間帯分析開始: ${allTdElements.length}個のtd要素を確認`);
    allTdElements.forEach(tdElement => {
        const status = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(tdElement);
        if (status && status.timeText) {
            const isFull = status.isFull;
            const isAvailable = status.isAvailable;
            const isSelected = status.element.getAttribute('aria-pressed') === 'true';
            let statusType = 'unknown';
            if (isFull) {
                statusType = 'full';
            }
            else if (isSelected) {
                statusType = 'selected';
            }
            else if (isAvailable) {
                statusType = 'available';
            }
            console.log(`📊 ${status.timeText}: ${statusType} (満員:${isFull}, 利用可能:${isAvailable}, 選択:${isSelected})`);
            const timeInfo = {
                element: status.element,
                tdElement: status.tdElement,
                timeText: status.timeText,
                isAvailable: isAvailable,
                isFull: isFull,
                tdSelector: (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(status.tdElement)
            };
            if (statusType === 'full') {
                full.push(timeInfo);
            }
            else if (statusType === 'selected') {
                selected.push(timeInfo);
            }
            else if (statusType === 'available') {
                available.push(timeInfo);
            }
        }
    });
    console.log(`📊 分析結果: 利用可能=${available.length}, 満員=${full.length}, 選択=${selected.length}`);
    return { available, full, selected };
}
// 時間帯要素から情報を抽出
function extractTimeSlotInfo(buttonElement) {
    const tdElement = buttonElement.closest('td');
    if (!tdElement)
        return null;
    // 時間テキストを取得
    const timeSpan = buttonElement.querySelector('dt span');
    const timeText = timeSpan ? timeSpan.textContent?.trim() || '' : '';
    // デバッグ用：要素の状態を詳細表示
    const dataDisabled = buttonElement.getAttribute('data-disabled');
    const ariaPressed = buttonElement.getAttribute('aria-pressed');
    const hasActiveClass = Array.from(buttonElement.classList).some(className => className.includes('style_active__'));
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
    }
    else if (highIcon) {
        iconType = 'high';
        isAvailable = true;
    }
    else if (lowIcon) {
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
function generateSelectorForElement(element) {
    const timeSpan = element.querySelector('dt span');
    const timeText = timeSpan ? timeSpan.textContent?.trim() || '' : '';
    return `td[data-gray-out] div[role='button'] dt span:contains('${timeText}')`;
}
// 満員時間帯にモニタリングボタンを追加
function addMonitorButtonsToFullSlots(fullSlots) {
    fullSlots.forEach(slotInfo => {
        createMonitorButton(slotInfo);
    });
}
// 監視ボタンのテキストを決定（優先順位表示）
function getMonitorButtonText(slotInfo) {
    const tdElement = slotInfo.element.closest('td[data-gray-out]');
    const tdSelector = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
    // 既に監視対象として選択されているかチェック
    const isSelected = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.isSelected(slotInfo.timeText, tdSelector);
    if (isSelected) {
        // 監視対象リストでの位置を取得（1ベース）
        const targets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
        const targetIndex = targets.findIndex(target => target.timeText === slotInfo.timeText && target.tdSelector === tdSelector);
        if (targetIndex >= 0) {
            const priority = targetIndex + 1; // 1ベースの優先順位
            return `監視${priority}`;
        }
    }
    return '満員';
}
// すべての監視ボタンの優先順位を更新
function updateAllMonitorButtonPriorities() {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    const targets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span');
        const timeText = button.getAttribute('data-target-time') || '';
        if (span && timeText) {
            // このボタンの時間帯と位置情報を特定
            const tdElement = button.closest('td[data-gray-out]');
            if (tdElement) {
                const tdSelector = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
                // 監視対象リストでの位置を検索
                const targetIndex = targets.findIndex(target => target.timeText === timeText && target.tdSelector === tdSelector);
                if (targetIndex >= 0) {
                    // 監視対象として選択されている場合、優先順位を表示
                    const priority = targetIndex + 1;
                    span.innerText = `監視${priority}`;
                    button.style.background = 'rgb(0, 104, 33)';
                }
                else {
                    // 監視対象でない場合は「満員」
                    span.innerText = '満員';
                    button.style.background = 'rgb(255, 140, 0)';
                }
            }
        }
    });
    console.log(`✅ すべての監視ボタンの優先順位を更新しました (${targets.length}個の監視対象)`);
}
// 個別監視ボタンの作成（満員要素のみ）
function createMonitorButton(slotInfo) {
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
        const tdElement = slotInfo.element.closest('td[data-gray-out]');
        const tdSelector = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
        const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(tdSelector);
        console.log(`🖱️ 監視ボタンクリック検出: ${location}${slotInfo.timeText}`);
        // ボタン要素の確認
        const span = monitorButton.querySelector('span');
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
function handleMonitorButtonClick(slotInfo, buttonElement) {
    const tdElement = slotInfo.element.closest('td[data-gray-out]');
    const tdSelector = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
    const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(tdSelector);
    console.log(`監視ボタンがクリックされました: ${location}${slotInfo.timeText}`);
    // 監視実行中は操作不可
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring) {
        console.log('⚠️ 監視実行中のため操作できません');
        return;
    }
    const buttonSpan = buttonElement.querySelector('span');
    const currentText = buttonSpan.innerText;
    const isCurrentlySelected = currentText.startsWith('監視'); // '監視1', '監視2' etc.
    console.log(`現在の状態: ${isCurrentlySelected ? '選択中' : '未選択'} (テキスト: "${currentText}")`);
    if (isCurrentlySelected) {
        // 現在選択中の場合は解除
        console.log(`監視対象を解除します: ${location}${slotInfo.timeText}`);
        // 複数対象管理から削除（時間+位置で特定）
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.removeTarget(slotInfo.timeText, tdSelector);
        // ボタンの表示を元に戻す
        buttonSpan.innerText = '満員';
        buttonElement.style.background = 'rgb(255, 140, 0)';
        buttonElement.style.opacity = '1';
        buttonElement.style.cursor = 'pointer';
        buttonElement.disabled = false;
        // 監視対象がすべてなくなった場合の処理
        if (!_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
            _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
            _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
            // キャッシュをクリア
            if (cacheManager) {
                cacheManager.clearTargetSlots();
                cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
            }
            // 他のボタンを有効化
            safeCall('enableAllMonitorButtons');
        }
        else {
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
    }
    else {
        // 現在未選択の場合は選択
        console.log(`監視対象を追加します: ${location}${slotInfo.timeText}`);
        // 選択状態を設定（td要素の一意特定情報を追加）
        const targetSlotInfo = {
            ...slotInfo,
            // td要素の一意特定情報を追加
            tdSelector: (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement),
            positionInfo: (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .getTdPositionInfo */ .AL)(tdElement)
        };
        // 複数対象管理に追加
        const added = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.addTarget(targetSlotInfo);
        if (!added) {
            console.log('⚠️ 既に選択済みの時間帯です');
            return;
        }
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
        // キャッシュに保存（すべての監視対象を保存）
        if (cacheManager) {
            cacheManager.saveTargetSlots();
        }
        // ボタンの表示を変更（優先順位表示）
        const priority = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount(); // 追加後の順位
        buttonSpan.innerText = `監視${priority}`;
        buttonElement.style.background = 'rgb(0, 104, 33)';
        buttonElement.style.opacity = '1';
        buttonElement.style.cursor = 'pointer';
        buttonElement.disabled = false; // クリックで解除できるように
        // メインボタンの表示を更新
        console.log(`🔄 監視対象設定後のFAB更新を実行: targetSlots=${_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount()}個, mode=${_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode}`);
        safeCall('updateMainButtonDisplay');
        // 監視対象表示も更新
        safeCall('updateMonitoringTargetsDisplay');
        // 更新後の状態も確認
        setTimeout(() => {
            const fabButton = document.querySelector('#ytomo-main-fab');
            console.log(`🔍 FAB更新後の状態: disabled=${fabButton?.disabled}, hasDisabledAttr=${fabButton?.hasAttribute('disabled')}, text="${fabButton?.textContent?.trim()}"`);
        }, 100);
        console.log(`✅ 時間帯 ${location}${slotInfo.timeText} を監視対象に設定しました`);
    }
}
// 満員時間帯の可用性監視を開始
async function startSlotMonitoring() {
    if (!_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
        console.log('❌ 監視対象時間帯が設定されていません');
        return;
    }
    // 即座に状態更新（UI応答性向上）
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'monitoring';
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring = true;
    safeCall('updateMainButtonDisplay'); // 即座にボタン表示を更新
    // 監視実行中は全ての監視ボタンを無効化
    safeCall('disableAllMonitorButtons');
    const targetCount = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount();
    const targetTexts = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets().map(t => {
        const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(t.tdSelector);
        return `${location}${t.timeText}`;
    }).join(', ');
    console.log(`🔄 時間帯監視を開始: ${targetTexts} (${targetCount}個)`);
    // 定期的な可用性チェック
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval = window.setInterval(async () => {
        await checkSlotAvailabilityAndReload();
    }, _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.reloadInterval + Math.random() * 5000); // ランダム性追加
    // 即座に一回チェック（短縮）
    setTimeout(() => {
        checkSlotAvailabilityAndReload();
    }, 500);
}
// 時間帯の可用性チェックとページ再読み込み
async function checkSlotAvailabilityAndReload() {
    if (!_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring || !_section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
        return;
    }
    // バリデーションチェック
    if (!validatePageLoaded())
        return;
    if (!(await checkTimeSlotTableExistsAsync()))
        return;
    // 複数監視対象の存在チェック
    const targets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
    for (const target of targets) {
        if (!checkTargetElementExists(target))
            return;
    }
    if (!checkMaxReloads(_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount))
        return;
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount++;
    if (cacheManager) {
        cacheManager.updateRetryCount(_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount);
    }
    const targetTexts = targets.map(t => t.timeText).join(', ');
    console.log(`🔍 可用性チェック (${_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount}回目): ${targetTexts}`);
    // 現在の時間帯をチェック
    const currentSlot = findTargetSlotInPage();
    console.log(`📊 監視チェック結果: currentSlot=${!!currentSlot}, status=${currentSlot?.status}`);
    if (currentSlot && currentSlot.status === 'available') {
        const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(currentSlot.targetInfo.tdSelector);
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
    const baseInterval = _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.reloadInterval; // 30000ms (30秒)
    const randomVariation = Math.random() * 5000; // 0-5秒のランダム要素
    const totalWaitTime = baseInterval + randomVariation;
    const displaySeconds = Math.ceil(totalWaitTime / 1000);
    // カウントダウン開始（即座にUI更新）
    safeCall('startReloadCountdown', displaySeconds);
    // リロードタイマーを保存（中断時に停止するため）
    safeRef('reloadCountdownState').reloadTimer = setTimeout(() => {
        console.log('🔄 監視継続のためページをリロードします...');
        window.location.reload();
    }, totalWaitTime);
}
// ページ内で対象時間帯を検索（複数対象の状態変化をチェック）
function findTargetSlotInPage() {
    const targets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
    if (targets.length === 0)
        return null;
    // 複数監視対象をチェック
    for (const target of targets) {
        // 監視開始時に保存した要素特定情報を使用して同一td要素を検索
        const targetTd = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(target);
        if (targetTd) {
            // 同一td要素の現在の状態を取得
            const currentStatus = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(targetTd);
            const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);
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
            }
            else if (currentStatus && currentStatus.isFull) {
                console.log(`⏳ 監視対象要素はまだ満員: ${location}${target.timeText}`);
            }
            else {
                console.log(`❓ 監視対象要素の状態が不明: ${location}${target.timeText} (isAvailable: ${currentStatus?.isAvailable}, isFull: ${currentStatus?.isFull})`);
            }
        }
        else {
            // 要素が見つからない場合
            const location = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);
            console.log(`❌ 監視対象要素が見つかりません: ${location}${target.timeText}`);
        }
    }
    // すべて満員または見つからない場合
    console.log('⏳ すべての監視対象要素はまだ満員です');
    return null;
}
// 異常終了処理の統一関数
function terminateMonitoring(errorCode, errorMessage) {
    console.error(`[監視異常終了] ${errorCode}: ${errorMessage}`);
    // 状態クリア
    if (cacheManager) {
        cacheManager.clearTargetSlots();
        cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
    }
    // インターバル停止
    if (_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval) {
        clearInterval(_section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval);
        _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval = null;
    }
    // UI状態リセット
    safeCall('resetMonitoringUI');
    safeCall('updateMainButtonDisplay', 'idle');
    // エラー表示
    safeCall('showErrorMessage', errorMessage);
    // 状態初期化
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring = false;
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
    _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
}
// 監視バリデーション関数群
function checkTargetElementExists(targetInfo) {
    const element = (0,_section4__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(targetInfo);
    if (!element) {
        terminateMonitoring('ERROR_TARGET_NOT_FOUND', `監視対象の時間帯 ${targetInfo.timeText} が見つかりません`);
        return false;
    }
    return true;
}
async function checkTimeSlotTableExistsAsync() {
    const table = document.querySelector(_section4__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotContainer);
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
        terminateMonitoring('ERROR_TABLE_NOT_FOUND', '時間帯選択テーブルが見つかりません（カレンダークリック後も表示されず）');
        return false;
    }
    return true;
}
function validatePageLoaded() {
    // URL確認
    if (!window.location.href.includes('ticket_visiting_reservation')) {
        terminateMonitoring('ERROR_WRONG_PAGE', '予期しないページに遷移しました');
        return false;
    }
    // 基本要素の存在確認
    const mainContent = document.querySelector('#__next');
    if (!mainContent) {
        terminateMonitoring('ERROR_PAGE_LOAD_FAILED', 'ページの読み込みが完了していません');
        return false;
    }
    return true;
}
function checkMaxReloads(currentCount) {
    const MAX_RELOAD_COUNT = 100; // 50分間（30秒×100回）
    if (currentCount >= MAX_RELOAD_COUNT) {
        terminateMonitoring('ERROR_MAX_RETRIES_REACHED', `最大試行回数 ${MAX_RELOAD_COUNT} に達しました`);
        return false;
    }
    return true;
}
// エクスポート

// ============================================================================


/***/ }),

/***/ 682:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   K: () => (/* binding */ createCacheManager)
/* harmony export */ });
/* harmony import */ var _section2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(897);
// Section 2からのimport

// ============================================================================
// キャッシュ管理機能
const createCacheManager = (dependencies = {}) => {
    const { getCurrentSelectedCalendarDateFn } = dependencies;
    return {
        // キー生成（URLベース）
        generateKey(suffix = '') {
            const url = new URL(window.location.href);
            const baseKey = `expo2025_entrance_${url.searchParams.get('reserve_id') || 'default'}`;
            return suffix ? `${baseKey}_${suffix}` : baseKey;
        },
        // 複数監視対象を保存
        saveTargetSlots() {
            try {
                const targets = _section2__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
                if (targets.length === 0)
                    return;
                // 現在選択されているカレンダー日付を取得
                const selectedCalendarDate = getCurrentSelectedCalendarDateFn ? getCurrentSelectedCalendarDateFn() : null;
                const data = {
                    targets: targets.map((target) => ({
                        timeText: target.timeText,
                        tdSelector: target.tdSelector,
                        positionInfo: target.positionInfo,
                        status: target.status
                    })),
                    selectedDate: selectedCalendarDate,
                    timestamp: Date.now(),
                    url: window.location.href,
                    retryCount: _section2__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount || 0
                };
                localStorage.setItem(this.generateKey('target_slots'), JSON.stringify(data));
                const targetTexts = targets.map((t) => t.timeText).join(', ');
                console.log(`✅ 複数監視対象をキャッシュに保存: ${targetTexts} (${targets.length}個)`);
            }
            catch (error) {
                console.error('❌ 複数監視対象保存エラー:', error);
            }
        },
        // 後方互換性のため残す
        saveTargetSlot(slotInfo) {
            this.saveTargetSlots();
        },
        // 監視対象時間帯を読み込み
        loadTargetSlot() {
            try {
                const data = localStorage.getItem(this.generateKey('target_slot'));
                if (!data)
                    return null;
                const parsed = JSON.parse(data);
                // 24時間以内のデータのみ有効
                if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                    this.clearTargetSlot();
                    return null;
                }
                console.log('📖 キャッシュから監視対象時間帯を読み込み:', parsed.timeText);
                return parsed;
            }
            catch (error) {
                console.error('❌ キャッシュ読み込みエラー:', error);
                return null;
            }
        },
        // 複数監視対象を読み込み（後方互換性あり）
        loadTargetSlots() {
            try {
                // 新形式の複数対象キャッシュを確認
                const newData = localStorage.getItem(this.generateKey('target_slots'));
                if (newData) {
                    const parsed = JSON.parse(newData);
                    // 24時間以内のデータのみ有効
                    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                        this.clearTargetSlots();
                        return null;
                    }
                    const targetTexts = parsed.targets?.map((t) => t.timeText).join(', ') || '不明';
                    console.log(`📖 複数監視対象キャッシュを読み込み: ${targetTexts} (${parsed.targets?.length || 0}個)`);
                    return parsed;
                }
                // 後方互換性：古い単一対象キャッシュを確認
                const oldData = this.loadTargetSlot();
                if (oldData) {
                    console.log('📖 単一対象キャッシュを複数対象形式に変換中...');
                    return {
                        targets: [oldData],
                        selectedDate: oldData.selectedDate,
                        timestamp: oldData.timestamp,
                        url: oldData.url,
                        retryCount: oldData.retryCount
                    };
                }
                return null;
            }
            catch (error) {
                console.error('❌ 複数監視対象読み込みエラー:', error);
                return null;
            }
        },
        // 複数監視対象をクリア
        clearTargetSlots() {
            try {
                localStorage.removeItem(this.generateKey('target_slots'));
                localStorage.removeItem(this.generateKey('target_slot')); // 古い形式もクリア
                console.log('🗑️ 複数監視対象キャッシュをクリア');
            }
            catch (error) {
                console.error('❌ 複数監視対象クリアエラー:', error);
            }
        },
        // 後方互換性のため残す
        clearTargetSlot() {
            this.clearTargetSlots();
        },
        // 試行回数を更新
        updateRetryCount(count) {
            const cached = this.loadTargetSlot();
            if (cached) {
                cached.retryCount = count;
                cached.timestamp = Date.now();
                localStorage.setItem(this.generateKey('target_slot'), JSON.stringify(cached));
            }
        },
        // 監視継続フラグを設定（リロード前に呼び出し）
        setMonitoringFlag(isActive = true) {
            try {
                const data = {
                    isMonitoring: isActive,
                    timestamp: Date.now()
                };
                localStorage.setItem(this.generateKey('monitoring_flag'), JSON.stringify(data));
                console.log(`🏃 監視継続フラグを設定: ${isActive}`);
            }
            catch (error) {
                console.error('❌ 監視フラグ設定エラー:', error);
            }
        },
        // 監視継続フラグを取得し、即座にfalseに設定（暴走防止）
        getAndClearMonitoringFlag() {
            try {
                const data = localStorage.getItem(this.generateKey('monitoring_flag'));
                if (!data)
                    return false;
                const parsed = JSON.parse(data);
                // 60秒以内のフラグのみ有効（リロード直後でないと無効）
                // リロード間隔が30秒 + ランダム5秒 + ページロード時間 + 初期化時間を考慮
                const isRecent = Date.now() - parsed.timestamp < 60 * 1000;
                const shouldContinue = isRecent && parsed.isMonitoring;
                // フラグを即座にクリア（暴走防止）
                this.clearMonitoringFlag();
                const timeDiff = (Date.now() - parsed.timestamp) / 1000;
                console.log(`🔍 監視継続フラグチェック: ${shouldContinue} (recent: ${isRecent}, flag: ${parsed.isMonitoring}, 経過時間: ${timeDiff.toFixed(1)}秒)`);
                console.log(`📅 フラグ設定時刻: ${new Date(parsed.timestamp).toLocaleTimeString()}, 現在時刻: ${new Date().toLocaleTimeString()}`);
                return shouldContinue;
            }
            catch (error) {
                console.error('❌ 監視フラグ取得エラー:', error);
                return false;
            }
        },
        // 監視継続フラグをクリア
        clearMonitoringFlag() {
            try {
                localStorage.removeItem(this.generateKey('monitoring_flag'));
                console.log('🗑️ 監視継続フラグをクリア');
            }
            catch (error) {
                console.error('❌ 監視フラグクリアエラー:', error);
            }
        }
    };
}; // createCacheManager の終了
// エクスポート

// ============================================================================


/***/ }),

/***/ 897:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CG: () => (/* binding */ entranceReservationState),
/* harmony export */   Pf: () => (/* binding */ timeSlotState),
/* harmony export */   VD: () => (/* binding */ pageLoadingState),
/* harmony export */   _t: () => (/* binding */ multiTargetManager),
/* harmony export */   ri: () => (/* binding */ calendarWatchState),
/* harmony export */   u6: () => (/* binding */ reloadCountdownState)
/* harmony export */ });
// ============================================================================
// 【2. 状態管理オブジェクト】
// ============================================================================
let entranceReservationState = {
    isRunning: false,
    shouldStop: false,
    startTime: null,
    attempts: 0
};
// 時間帯監視機能の状態管理
let timeSlotState = {
    mode: 'idle', // idle, selecting, monitoring, trying
    targetSlots: [], // 複数選択対象の時間帯情報配列
    monitoringInterval: null, // 監視用インターバル
    isMonitoring: false,
    retryCount: 0,
    maxRetries: 100,
    reloadInterval: 30000 // 30秒間隔
};
// 複数監視対象管理のヘルパー関数
const multiTargetManager = {
    // 監視対象を追加
    addTarget(slotInfo) {
        // 時間+位置（東西）で一意性を判定
        const existingIndex = timeSlotState.targetSlots.findIndex(slot => slot.timeText === slotInfo.timeText &&
            slot.tdSelector === slotInfo.tdSelector);
        if (existingIndex === -1) {
            timeSlotState.targetSlots.push(slotInfo);
            // 位置情報を含めたログ出力
            const locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
            console.log(`✅ 監視対象を追加: ${slotInfo.timeText} ${locationInfo} (総数: ${timeSlotState.targetSlots.length})`);
            return true;
        }
        else {
            const locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
            console.log(`⚠️ 監視対象は既に選択済み: ${slotInfo.timeText} ${locationInfo}`);
            return false;
        }
    },
    // 監視対象を削除（時間+位置で特定）
    removeTarget(timeText, tdSelector) {
        const initialLength = timeSlotState.targetSlots.length;
        timeSlotState.targetSlots = timeSlotState.targetSlots.filter(slot => !(slot.timeText === timeText && slot.tdSelector === tdSelector));
        // 削除された場合の処理
        if (timeSlotState.targetSlots.length < initialLength) {
            const locationInfo = this.getLocationFromSelector(tdSelector);
            console.log(`✅ 監視対象を削除: ${timeText} ${locationInfo} (残り: ${timeSlotState.targetSlots.length})`);
            return true;
        }
        return false;
    },
    // 監視対象をすべてクリア
    clearAll() {
        const count = timeSlotState.targetSlots.length;
        timeSlotState.targetSlots = [];
        console.log(`✅ すべての監視対象をクリア (${count}個)`);
    },
    // 監視対象が存在するかチェック
    hasTargets() {
        return timeSlotState.targetSlots.length > 0;
    },
    // 特定の監視対象が選択済みかチェック（時間+位置）
    isSelected(timeText, tdSelector) {
        return timeSlotState.targetSlots.some(slot => slot.timeText === timeText && slot.tdSelector === tdSelector);
    },
    // 監視対象のリストを取得
    getTargets() {
        return [...timeSlotState.targetSlots];
    },
    // 監視対象の数を取得
    getCount() {
        return timeSlotState.targetSlots.length;
    },
    // tdSelectorから位置情報（東西）を推定
    getLocationFromSelector(tdSelector) {
        if (!tdSelector)
            return '不明';
        // nth-child の値から東西を推定
        // 同じ時間の場合、0番目が東、1番目が西という仕様
        const cellMatch = tdSelector.match(/td:nth-child\((\d+)\)/);
        if (cellMatch && cellMatch[1]) {
            const cellIndex = parseInt(cellMatch[1]) - 1; // nth-childは1ベース
            if (cellIndex === 0)
                return '東';
            if (cellIndex === 1)
                return '西';
        }
        return '不明';
    }
};
// ページ読み込み状態管理
const pageLoadingState = {
    isLoading: false,
    startTime: null,
    timeout: 10000
};
// リロードカウントダウン状態管理
const reloadCountdownState = {
    isActive: false,
    timeLeft: 0,
    intervalId: null,
    onComplete: null,
    totalSeconds: 30,
    secondsRemaining: null,
    startTime: null,
    countdownInterval: null,
    reloadTimer: null
};
// カレンダー監視状態管理
const calendarWatchState = {
    isWatching: false,
    observer: null,
    currentSelectedDate: null
};
// エクスポート



/***/ }),

/***/ 915:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AL: () => (/* binding */ getTdPositionInfo),
/* harmony export */   SE: () => (/* binding */ extractTdStatus),
/* harmony export */   Xz: () => (/* binding */ waitForCalendar),
/* harmony export */   Yz: () => (/* binding */ initTimeSlotMonitoring),
/* harmony export */   e0: () => (/* binding */ findSameTdElement),
/* harmony export */   eN: () => (/* binding */ timeSlotSelectors),
/* harmony export */   sN: () => (/* binding */ generateUniqueTdSelector)
/* harmony export */ });
/* harmony import */ var _section5__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(628);
// Section 5からのimport

// 【4. DOM要素セレクタ・検索】
// ============================================================================
// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
const timeSlotSelectors = {
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
function generateUniqueTdSelector(tdElement) {
    // td要素の親要素（tr）内での位置を取得
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    // 設計書に基づく固定DOM構造での一意セレクタ
    return `table tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})[data-gray-out]`;
}
function getTdPositionInfo(tdElement) {
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    return { rowIndex, cellIndex };
}
function findSameTdElement(targetInfo) {
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
function extractTdStatus(tdElement) {
    if (!tdElement)
        return null;
    const buttonDiv = tdElement.querySelector('div[role="button"]');
    if (!buttonDiv)
        return null;
    const timeSpan = buttonDiv.querySelector('dt span');
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
async function initTimeSlotMonitoring() {
    console.log('時間帯監視機能を初期化中...');
    // カレンダーの存在確認
    const hasCalendar = await waitForCalendar();
    if (!hasCalendar) {
        console.log('カレンダーが見つかりません');
        return;
    }
    // DOM変化監視を開始（時間帯テーブルの動的生成を検出）
    (0,_section5__WEBPACK_IMPORTED_MODULE_0__/* .startTimeSlotTableObserver */ .cD)();
    console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
}
// カレンダーの動的待機
async function waitForCalendar(timeout = 10000) {
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
            }
            else {
                console.log('カレンダー要素はあるが、日付要素がまだ読み込まれていません');
            }
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    console.log('カレンダーの待機がタイムアウトしました');
    return false;
}
// エクスポート

// ============================================================================


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/harmony module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.hmd = (module) => {
/******/ 			module = Object.create(module);
/******/ 			if (!module.children) module.children = [];
/******/ 			Object.defineProperty(module, 'exports', {
/******/ 				enumerable: true,
/******/ 				set: () => {
/******/ 					throw new Error('ES Modules may not assign module.exports or exports.*, Use ESM export syntax, instead: ' + module.id);
/******/ 				}
/******/ 			});
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _section2__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(897);
/* harmony import */ var _section3__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(682);
/* harmony import */ var _section4__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(915);
/* harmony import */ var _section5__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(628);
/* harmony import */ var _section6__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(117);
/* harmony import */ var _section7__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(523);
/* harmony import */ var _section8__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(114);
// ==UserScript==
// @name         yt-Expo2025-Reservation-Helper
// @namespace    http://staybrowser.com/
// @version      0.3
// @description  help expo2025 ticket site
// @author       TomoTom0 https://github.com/TomoTom0
// @match        https://ticket.expo2025.or.jp/event_search/*
// @grant       none
// @run-at       document-end
// ==/UserScript==

// Section 1からのimport


// Section 2からのimport


// Section 3からのimport


// Section 4からのimport


// Section 5からのimport


// Section 6からのimport


// Section 7からのimport


// Section 8からのimport

/******/ 	return __webpack_exports__;
/******/ })()
;
});