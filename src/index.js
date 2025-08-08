// ==UserScript==
// @name         yt-Expo2025-Reservation-Helper
// @namespace    http://staybrowser.com/
// @version      0.5.4
// @description  大阪万博2025予約支援ツール: パビリオン検索補助, 入場予約監視自動化, 同行者追加自動化
// @author       TomoTom0 https://github.com/TomoTom0
// @match        https://ticket.expo2025.or.jp/*
// @grant       none
// @run-at       document-end
// ==/UserScript==


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

/***/ 56:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {



/* istanbul ignore next  */
function setAttributesWithoutAttributes(styleElement) {
  var nonce =  true ? __webpack_require__.nc : 0;
  if (nonce) {
    styleElement.setAttribute("nonce", nonce);
  }
}
module.exports = setAttributesWithoutAttributes;

/***/ }),

/***/ 72:
/***/ ((module) => {



var stylesInDOM = [];
function getIndexByIdentifier(identifier) {
  var result = -1;
  for (var i = 0; i < stylesInDOM.length; i++) {
    if (stylesInDOM[i].identifier === identifier) {
      result = i;
      break;
    }
  }
  return result;
}
function modulesToDom(list, options) {
  var idCountMap = {};
  var identifiers = [];
  for (var i = 0; i < list.length; i++) {
    var item = list[i];
    var id = options.base ? item[0] + options.base : item[0];
    var count = idCountMap[id] || 0;
    var identifier = "".concat(id, " ").concat(count);
    idCountMap[id] = count + 1;
    var indexByIdentifier = getIndexByIdentifier(identifier);
    var obj = {
      css: item[1],
      media: item[2],
      sourceMap: item[3],
      supports: item[4],
      layer: item[5]
    };
    if (indexByIdentifier !== -1) {
      stylesInDOM[indexByIdentifier].references++;
      stylesInDOM[indexByIdentifier].updater(obj);
    } else {
      var updater = addElementStyle(obj, options);
      options.byIndex = i;
      stylesInDOM.splice(i, 0, {
        identifier: identifier,
        updater: updater,
        references: 1
      });
    }
    identifiers.push(identifier);
  }
  return identifiers;
}
function addElementStyle(obj, options) {
  var api = options.domAPI(options);
  api.update(obj);
  var updater = function updater(newObj) {
    if (newObj) {
      if (newObj.css === obj.css && newObj.media === obj.media && newObj.sourceMap === obj.sourceMap && newObj.supports === obj.supports && newObj.layer === obj.layer) {
        return;
      }
      api.update(obj = newObj);
    } else {
      api.remove();
    }
  };
  return updater;
}
module.exports = function (list, options) {
  options = options || {};
  list = list || [];
  var lastIdentifiers = modulesToDom(list, options);
  return function update(newList) {
    newList = newList || [];
    for (var i = 0; i < lastIdentifiers.length; i++) {
      var identifier = lastIdentifiers[i];
      var index = getIndexByIdentifier(identifier);
      stylesInDOM[index].references--;
    }
    var newLastIdentifiers = modulesToDom(newList, options);
    for (var _i = 0; _i < lastIdentifiers.length; _i++) {
      var _identifier = lastIdentifiers[_i];
      var _index = getIndexByIdentifier(_identifier);
      if (stylesInDOM[_index].references === 0) {
        stylesInDOM[_index].updater();
        stylesInDOM.splice(_index, 1);
      }
    }
    lastIdentifiers = newLastIdentifiers;
  };
};

/***/ }),

/***/ 113:
/***/ ((module) => {



/* istanbul ignore next  */
function styleTagTransform(css, styleElement) {
  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css;
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild);
    }
    styleElement.appendChild(document.createTextNode(css));
  }
}
module.exports = styleTagTransform;

/***/ }),

/***/ 115:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SE: () => (/* binding */ extractTdStatus),
/* harmony export */   Xz: () => (/* binding */ waitForCalendar),
/* harmony export */   Yz: () => (/* binding */ initTimeSlotMonitoring),
/* harmony export */   e0: () => (/* binding */ findSameTdElement),
/* harmony export */   eN: () => (/* binding */ timeSlotSelectors),
/* harmony export */   sN: () => (/* binding */ generateUniqueTdSelector)
/* harmony export */ });
/* unused harmony export getTdPositionInfo */
// ============================================================================
// 【入場予約DOM操作ユーティリティ】 
// ============================================================================
// 循環参照解決のための基盤モジュール
// DOM操作、セレクタ定義、基本的な待機関数を提供
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
    // 選択状態判定
    const isSelected = buttonDiv.classList.contains('selected') ||
        buttonDiv.hasAttribute('aria-selected') ||
        buttonDiv.getAttribute('aria-pressed') === 'true';
    // ステータス判定
    let status;
    if (isSelected) {
        status = 'selected';
    }
    else if (isFull) {
        status = 'full';
    }
    else if (isAvailable) {
        status = 'available';
    }
    else {
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
async function waitForCalendar(timeout = 10000) {
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
async function initTimeSlotMonitoring() {
    console.log('時間帯監視機能を初期化中...');
    // カレンダーの存在確認
    const hasCalendar = await waitForCalendar();
    if (!hasCalendar) {
        console.log('カレンダーが見つかりません');
        return;
    }
    // DOM変化監視を開始（時間帯テーブルの動的生成を検出）
    // startTimeSlotTableObserverを動的importで取得（循環参照回避）
    const { startTimeSlotTableObserver } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 429));
    startTimeSlotTableObserver();
    console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
}


/***/ }),

/***/ 213:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Is: () => (/* binding */ isInterruptionAllowed),
/* harmony export */   MM: () => (/* binding */ setCacheManagerForSection6),
/* harmony export */   XG: () => (/* binding */ stopSlotMonitoring),
/* harmony export */   XP: () => (/* binding */ setEntranceReservationHelper),
/* harmony export */   ZK: () => (/* binding */ setPageLoadingState),
/* harmony export */   Zu: () => (/* binding */ restoreFromCache),
/* harmony export */   pW: () => (/* binding */ updateStatusBadge),
/* harmony export */   qy: () => (/* binding */ setUpdateMonitoringTargetsDisplay),
/* harmony export */   rY: () => (/* binding */ getCurrentSelectedCalendarDate),
/* harmony export */   vp: () => (/* binding */ updateMainButtonDisplay)
/* harmony export */ });
/* unused harmony exports clickCalendarDate, tryClickCalendarForTimeSlot, showErrorMessage, resetMonitoringUI, selectTimeSlotAndStartReservation, getCurrentEntranceConfig, resetPreviousSelection, disableOtherMonitorButtons, enableAllMonitorButtons, disableAllMonitorButtons, clearExistingMonitorButtons, getCurrentTableContent, shouldUpdateMonitorButtons, restoreSelectionAfterUpdate, getCurrentMode, getTargetDisplayInfo, scheduleReload, startReloadCountdown, stopReloadCountdown */
/* harmony import */ var _entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(115);
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(461);
/* harmony import */ var _entrance_page_monitor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(429);
// entrance-page-stateからのimport
// import { 
// entranceReservationState, // 統合により不要
// reloadCountdownState, // EntranceReservationStateManagerに統合済み
// pageLoadingState // EntranceReservationStateManagerに統合済み
// } from './entrance-page-state';
// entrance-page-dom-utilsからのimport

// 入場予約状態管理システムからのimport

// Section 5からのimport

// 【6. カレンダー・UI状態管理】
// ============================================================================
// 依存注入用の参照
let cacheManager = null;
let entranceReservationHelper = null;
let updateMonitoringTargetsDisplayFn = null;
// cacheManagerを設定するヘルパー関数
const setCacheManagerForSection6 = (cm) => {
    cacheManager = cm;
};
// entranceReservationHelperを設定するヘルパー関数
const setEntranceReservationHelper = (helper) => {
    entranceReservationHelper = helper;
};
// updateMonitoringTargetsDisplayを設定するヘルパー関数
const setUpdateMonitoringTargetsDisplay = (fn) => {
    updateMonitoringTargetsDisplayFn = fn;
};
// 時間帯表示のためのカレンダー自動クリック機能
// 現在選択されているカレンダー日付を取得（動的待機対応）
function getCurrentSelectedCalendarDate() {
    try {
        let hasNADatetime = false;
        // 安定したセレクタで選択済み要素を検索
        const selectedSelectors = [
            '[aria-pressed="true"] time[datetime]',
            '[class*="selector_date"] time[datetime]'
        ];
        for (const selector of selectedSelectors) {
            const timeElement = document.querySelector(selector);
            if (timeElement) {
                const datetime = timeElement.getAttribute('datetime');
                if (datetime && datetime !== 'N/A') {
                    // console.log(`📅 現在選択中のカレンダー日付: ${datetime} (${selector})`);
                    return datetime;
                }
                else if (datetime === 'N/A') {
                    hasNADatetime = true;
                    console.log(`📅 datetime="N/A"を検出 - DOM更新待機中...`);
                }
            }
        }
        // さらなるフォールバック: 任意のaria-pressed="true"要素内のtime要素
        const anySelected = document.querySelectorAll('[aria-pressed="true"]');
        for (const el of anySelected) {
            const timeElement = el.querySelector('time[datetime]');
            if (timeElement) {
                const datetime = timeElement.getAttribute('datetime');
                if (datetime && datetime !== 'N/A') {
                    console.log(`📅 現在選択中のカレンダー日付（フォールバック）: ${datetime}`);
                    return datetime;
                }
                else if (datetime === 'N/A') {
                    hasNADatetime = true;
                }
            }
        }
        // datetime="N/A"が検出された場合は後で再試行される可能性があることを示す
        if (hasNADatetime) {
            console.log('⚠️ datetime="N/A"のため日付取得を待機中...');
        }
        else {
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
        }
        return null;
    }
    catch (error) {
        console.error('❌ カレンダー日付取得エラー:', error);
        return null;
    }
}
// 動的待機版のカレンダー日付取得（強化版）
async function waitForValidCalendarDate(maxRetries = 30, interval = 200) {
    console.log('📅 カレンダー日付取得の動的待機を開始...');
    for (let i = 0; i < maxRetries; i++) {
        // まずtime要素の存在を確認
        const timeElements = document.querySelectorAll('time[datetime]');
        if (timeElements.length === 0) {
            console.log(`⏳ time要素がまだ存在しません (${i + 1}/${maxRetries}) - さらに待機`);
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
        // クリック結果を待機（短縮）
        await new Promise(resolve => setTimeout(resolve, 300));
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
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx && _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets()) {
        const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
        const targetTexts = targets.map((t) => t.timeSlot).join(', ');
        console.log(`🎯 監視対象: ${targetTexts} (${targets.length}個)`);
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
        // 少し待機してクリック結果を確認（短縮）
        await new Promise(resolve => setTimeout(resolve, 200));
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
            button.classList.remove('monitoring-status');
            button.classList.add('full-status');
            button.disabled = false;
        }
    });
}
// 時間帯を自動選択して予約開始
async function selectTimeSlotAndStartReservation(slotInfo) {
    const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .LocationHelper */ .Qs.getLocationFromIndex(_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .LocationHelper */ .Qs.getIndexFromSelector(slotInfo.targetInfo.tdSelector));
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
    // 選択状態確認のため少し待つ（短縮）
    await new Promise(resolve => setTimeout(resolve, 100));
    // 選択状態を確認（ボタン要素の状態をチェック）
    const buttonElement = slotInfo.element.querySelector('div[role="button"]');
    const isSelected = buttonElement && (Array.from(buttonElement.classList).some(className => className.includes('style_active__')) ||
        buttonElement.getAttribute('aria-pressed') === 'true');
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
        const selectedTimeSlot = document.querySelector(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotSelectors */ .eN.selectedSlot);
        const finalCheck = !!selectedTimeSlot;
        console.log(`🔍 予約開始前最終確認: 時間帯選択=${finalCheck ? '✅選択済み' : '❌未選択'}`);
        if (selectedTimeSlot) {
            const tdElement = selectedTimeSlot.closest('td');
            const status = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .extractTdStatus */ .SE)(tdElement);
            console.log(`🔍 選択された時間帯: ${status?.timeText || 'unknown'} (満員: ${status?.isFull ? 'はい' : 'いいえ'})`);
        }
        if (!finalCheck) {
            console.error(`❌ 時間帯が選択されていないため予約処理を中止します`);
            return;
        }
        // 監視停止
        stopSlotMonitoring();
        // 通常の予約処理を開始（入場予約状態管理システム使用）
        const config = getCurrentEntranceConfig();
        if (config && entranceReservationHelper) {
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.setExecutionState(_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .ExecutionState */ .si.RESERVATION_RUNNING);
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.startReservationExecution();
            const result = await entranceReservationHelper(config);
            if (result.success) {
                // 入場予約状態管理に予約成功情報を設定
                if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                    const reservationTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getReservationTarget();
                    if (reservationTarget) {
                        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                        updateMainButtonDisplay(); // FAB表示更新
                    }
                }
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                    cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                }
                console.log('✅ 予約が成功しました！');
            }
        }
    }, 1000);
}
// 監視停止（監視対象選択は維持）
function stopSlotMonitoring() {
    // 入場予約状態管理システムの実行状態を停止
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.stop();
    }
    // 監視継続フラグをクリア（手動停止なので継続させない）
    if (cacheManager) {
        cacheManager.clearMonitoringFlag();
    }
    // リロードカウントダウンも確実に停止
    stopReloadCountdown();
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
    if (entranceReservationStateManager) {
        entranceReservationStateManager.clearAllTargets();
    }
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
        // 監視対象のボタンは赤色を維持
        if (span && span.innerText.startsWith('監視')) {
            button.classList.remove('full-status');
            button.classList.add('monitoring-status');
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
    if (!entranceReservationStateManager || !entranceReservationStateManager.hasMonitoringTargets())
        return;
    const targets = entranceReservationStateManager.getMonitoringTargets();
    const targetTexts = targets.map((t) => t.timeSlot).join(', ');
    console.log(`選択状態を復元中: ${targetTexts}`);
    // 該当する時間帯の監視ボタンを探して選択状態にする
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    let restoredCount = 0;
    targets.forEach((target) => {
        monitorButtons.forEach(button => {
            const buttonTargetTime = button.getAttribute('data-target-time') || '';
            const buttonTdElement = button.closest('td[data-gray-out]');
            const buttonTdSelector = buttonTdElement ? generateUniqueTdSelector(buttonTdElement) : '';
            // 時間+位置で一致するかチェック
            if (buttonTargetTime === target.timeSlot && buttonTdSelector === target.selector) {
                const span = button.querySelector('span');
                if (span) {
                    // 監視対象リストでの位置を取得（入場予約状態管理の優先度を使用）
                    const priority = target.priority;
                    span.innerText = `監視${priority}`;
                    button.classList.remove('full-status');
                    button.classList.add('monitoring-status');
                    restoredCount++;
                    console.log(`✅ 選択状態を復元しました: ${target.timeSlot}`);
                }
            }
        });
    });
    if (restoredCount === 0) {
        console.log(`⚠️ 対象時間帯が見つからないため選択状態をリセット: ${targetTexts}`);
        // 対象時間帯がない場合は状態をリセット
        if (entranceReservationStateManager) {
            entranceReservationStateManager.clearAllTargets();
            entranceReservationStateManager.stop(); // 実行状態もIDLEにリセット
        }
        if (cacheManager) {
            cacheManager.clearTargetSlots();
        }
    }
    updateMainButtonDisplay();
}
// メインボタンの表示更新（FAB形式対応）
// FAB更新の状態管理
let lastFabState = '';
// 現在のFAB状態を文字列として取得
function getCurrentFabState() {
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx)
        return 'no-manager';
    const mode = getCurrentMode();
    const executionState = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getExecutionState();
    const hasReservation = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.hasReservationTarget();
    const hasMonitoring = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets();
    // 監視対象の実際の内容を含める
    const monitoringTargets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
    const monitoringContent = monitoringTargets
        .map((target) => `${target.locationIndex}:${target.timeSlot}`)
        .sort()
        .join('|');
    return `${mode}-${executionState}-${hasReservation}-${hasMonitoring}-${monitoringContent}`;
}
function updateMainButtonDisplay(forceMode = null, isCountdownUpdate = false) {
    // 状態変更がない場合は更新をスキップ（forceMode時は除く）
    if (!forceMode && !isCountdownUpdate) {
        const currentState = getCurrentFabState();
        if (currentState === lastFabState) {
            return; // 状態変更なし、更新不要
        }
        lastFabState = currentState;
    }
    const fabButton = document.querySelector('#ytomo-main-fab');
    const statusBadge = document.querySelector('#ytomo-status-badge');
    const reservationTargetDisplay = document.querySelector('#ytomo-reservation-target');
    const monitoringTargetsDisplay = document.querySelector('#ytomo-monitoring-targets');
    if (fabButton && statusBadge) {
        const span = fabButton.querySelector('span');
        if (span) {
            // 入場予約状態管理システムを取得
            if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                console.warn('⚠️ EntranceReservationStateManager が利用できないため、FAB更新を中止');
                return;
            }
            // 対象情報の表示更新（カウントダウン中は既存の表示を維持）
            if (!isCountdownUpdate) {
                const targetInfo = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getFabTargetDisplayInfo();
                // 予約対象情報の表示更新（ログを簡素化）
                if (reservationTargetDisplay) {
                    if (targetInfo.hasTarget && targetInfo.targetType === 'reservation') {
                        reservationTargetDisplay.style.display = 'block';
                        reservationTargetDisplay.innerHTML = targetInfo.displayText;
                    }
                    else {
                        reservationTargetDisplay.style.display = 'none';
                    }
                }
                // 監視対象情報の表示更新
                if (monitoringTargetsDisplay) {
                    if (targetInfo.hasTarget && targetInfo.targetType === 'monitoring') {
                        monitoringTargetsDisplay.style.display = 'block';
                        monitoringTargetsDisplay.innerHTML = targetInfo.displayText;
                        console.log(`[FAB] 監視対象innerHTML設定: "${targetInfo.displayText}"`);
                        console.log(`[FAB] 実際のinnerHTML: "${monitoringTargetsDisplay.innerHTML}"`);
                        console.log(`[FAB] white-space設定: "${getComputedStyle(monitoringTargetsDisplay).whiteSpace}"`);
                    }
                    else {
                        monitoringTargetsDisplay.style.display = 'none';
                    }
                }
            }
            const currentMode = forceMode || getCurrentMode();
            // 入場予約状態管理システムから状態を取得
            const preferredAction = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getPreferredAction();
            const hasReservationTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.hasReservationTarget();
            const hasMonitoringTargets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets();
            const executionState = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getExecutionState();
            // 詳細ログは重要な状態変更時のみ出力
            if (!isCountdownUpdate && (currentMode !== 'monitoring' || executionState !== 'monitoring_running')) {
                console.log(`🔄 FAB更新: mode=${currentMode}, preferredAction=${preferredAction}, reservation=${hasReservationTarget}, monitoring=${hasMonitoringTargets}, execution=${executionState}`);
                // デバッグ用: 予約対象設定の詳細情報
                if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.hasReservationTarget()) {
                    const target = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getReservationTarget();
                    console.log(`📍 予約対象詳細: ${target?.timeSlot} (位置: ${target?.locationIndex}, 有効: ${target?.isValid})`);
                    // canStartReservation()の各条件をチェック
                    const canStart = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.canStartReservation();
                    console.log(`🔍 予約開始可能性: ${canStart}`);
                    if (!canStart) {
                        // DOM状態を詳細確認
                        const selectedSlot = document.querySelector(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotSelectors */ .eN.selectedSlot);
                        const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq');
                        const selectedDate = getCurrentSelectedCalendarDate();
                        console.log(`🔍 DOM状態確認:`);
                        console.log(`  - 選択スロット: ${selectedSlot ? 'あり' : 'なし'}`);
                        console.log(`  - 来場日時ボタン: ${visitTimeButton ? (visitTimeButton.disabled ? '無効' : '有効') : 'なし'}`);
                        console.log(`  - 選択日付: ${selectedDate || 'なし'}`);
                    }
                }
            }
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
                    // CSSクラスベースでの管理に統一
                    fabButton.className = fabButton.className.replace(/ytomo-fab-\w+/g, '');
                    fabButton.classList.add('ytomo-fab-enabled');
                    fabButton.title = '監視予約開始';
                    fabButton.disabled = false; // 有効化
                    fabButton.removeAttribute('disabled'); // HTML属性も削除
                    // デバッグ: 実際の状態をログ出力
                    console.log(`🔧 FABボタン状態確認: text="${span.innerText}", class="${fabButton.className}", disabled=${fabButton.disabled}, title="${fabButton.title}"`);
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
                    // 入場予約状態管理システム経由での処理（既にentranceReservationStateManagerは取得済み）
                    console.log(`🔍 入場予約状態管理 優先アクション: ${preferredAction}`);
                    if (preferredAction === 'reservation') {
                        span.innerText = '予約\n開始';
                        // CSSクラスによる状態管理
                        fabButton.className = fabButton.className.replace(/ytomo-fab-\w+/g, '');
                        fabButton.classList.add('ytomo-fab-enabled');
                        fabButton.title = '予約開始';
                        fabButton.disabled = false;
                    }
                    else if (preferredAction === 'monitoring') {
                        span.innerText = '監視予約\n開始';
                        fabButton.className = fabButton.className.replace(/ytomo-fab-\w+/g, '');
                        fabButton.classList.add('ytomo-fab-enabled');
                        fabButton.title = '監視予約開始';
                        fabButton.disabled = false;
                    }
                    else {
                        span.innerText = '待機中';
                        fabButton.className = fabButton.className.replace(/ytomo-fab-\w+/g, '');
                        fabButton.classList.add('ytomo-fab-disabled');
                        fabButton.title = '待機中（条件未満足）';
                        fabButton.disabled = true;
                    }
                    // 入場予約状態管理システムでのステータスバッジ更新
                    if (preferredAction === 'reservation' || preferredAction === 'monitoring') {
                        updateStatusBadge('idle');
                    }
                    else {
                        updateStatusBadge('waiting');
                    }
                    break;
            }
        }
    }
}
// 現在のモードを取得するヘルパー関数（予約優先ロジック組み込み）
function getCurrentMode() {
    // 入場予約状態管理システムを取得（必須）
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
        console.warn('⚠️ EntranceReservationStateManager が利用できません');
        return 'idle';
    }
    // ページローディング状態の確認
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.isPageLoading()) {
        return 'loading';
    }
    // 入場予約状態管理システムの実行状態を確認
    const executionState = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getExecutionState();
    switch (executionState) {
        case 'reservation_running':
            return 'reservation-running';
        case 'monitoring_running':
            return 'monitoring';
        case 'idle':
            // 推奨アクションを確認
            const preferredAction = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getPreferredAction();
            switch (preferredAction) {
                case 'reservation':
                    return 'idle'; // 予約可能状態
                case 'monitoring':
                    return 'selecting'; // 監視準備完了
                default:
                    return 'idle';
            }
        default:
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
            const remainingSeconds = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getReloadSecondsRemaining();
            if (remainingSeconds !== null && remainingSeconds !== undefined) {
                if (remainingSeconds <= 3) {
                    message = `監視中\nリロード: ${remainingSeconds}秒`;
                    bgColor = 'rgba(255, 0, 0, 0.9)'; // 赤色（中断不可）
                }
                else {
                    message = `監視中\nリロード: ${remainingSeconds}秒`;
                    bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
                }
            }
            else {
                bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
            }
            break;
        case 'reservation-running':
            // 経過時間と回数を表示（入場予約状態管理システムから取得）
            const startTime = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getReservationStartTime();
            const elapsedMinutes = startTime ?
                Math.floor((Date.now() - startTime) / 60000) : 0;
            const attempts = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getAttempts();
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
    if (!entranceReservationStateManager) {
        return '不明';
    }
    const targets = entranceReservationStateManager.getMonitoringTargets();
    if (targets.length === 0) {
        return '不明';
    }
    const selectedDate = getCurrentSelectedCalendarDate();
    // 各監視対象の東西を個別に判定（東/西時間の形式で統一）
    if (targets.length > 1) {
        const timeLocationTexts = targets.map((target) => {
            const location = LocationHelper.getLocationFromIndex(target.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            return `${locationText}${target.timeSlot || '不明'}`;
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
        const location = LocationHelper.getLocationFromIndex(target.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        const timeText = target.timeSlot || '不明';
        if (selectedDate) {
            const date = new Date(selectedDate);
            const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
            return `${dateStr} ${locationText}${timeText}`;
        }
        else {
            return `${locationText}${timeText}`;
        }
    }
}
// 統一されたリロードスケジュール関数
function scheduleReload(seconds = 30) {
    console.log(`🔄 統一リロードスケジュール開始: ${seconds}秒`);
    // 入場予約状態管理システムでリロードカウントダウンを開始
    if (entranceReservationStateManager) {
        entranceReservationStateManager.scheduleReload(seconds);
        console.log(`📊 リロードスケジュール時の状態: ${entranceReservationStateManager.getExecutionState()}`);
    }
    // 監視継続フラグを設定（リロード5秒前）
    const flagDelay = Math.max(0, (seconds - 5) * 1000);
    setTimeout(() => {
        if (cacheManager) {
            cacheManager.setMonitoringFlag(true);
            console.log(`🏃 監視継続フラグ設定（scheduleReload）`);
        }
    }, flagDelay);
    // 即座に一度UI更新
    updateMainButtonDisplay();
}
// 下位互換のためのstartReloadCountdown関数（scheduleReloadのエイリアス）
function startReloadCountdown(seconds = 30) {
    scheduleReload(seconds);
}
// カウントダウン停止関数
function stopReloadCountdown() {
    // 呼び出し元を特定するためのスタックトレース
    const stack = new Error().stack;
    const caller = stack?.split('\n')[2]?.trim() || 'unknown';
    console.log(`🛑 stopReloadCountdown() 呼び出し元: ${caller}`);
    // 入場予約状態管理システムでリロードカウントダウンを停止
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.stopReloadCountdown();
    }
}
// ページ読み込み状態を設定
function setPageLoadingState(isLoading) {
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.setPageLoadingState(isLoading);
    }
    updateMainButtonDisplay();
}
// 中断操作が許可されているかチェック
function isInterruptionAllowed() {
    // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
        const isNearReload = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.isNearReload();
        // console.log(`🔍 中断可否チェック: nearReload=${isNearReload}`);
        return !isNearReload;
    }
    return true; // フォールバック：統合システムが利用できない場合は中断を許可
}
// ページ読み込み時のキャッシュ復元
async function restoreFromCache() {
    if (!cacheManager)
        return;
    // 監視継続フラグをチェック（監視の自動再開用）
    const shouldContinueMonitoring = cacheManager.getAndClearMonitoringFlag();
    const cached = cacheManager.loadTargetSlots();
    if (!cached)
        return;
    console.log('🔄 キャッシュから複数監視状態を復元中...');
    if (shouldContinueMonitoring) {
        console.log('✅ 監視継続フラグ: 有効 - 監視を自動再開します');
    }
    else {
        console.log('⚠️ 監視継続フラグ: 無効 - 監視は手動開始待ちです');
    }
    // カレンダー読み込み完了を待機（短縮: 5秒）
    const hasCalendar = await (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .waitForCalendar */ .Xz)(5000);
    if (!hasCalendar) {
        console.log('❌ カレンダーの読み込みがタイムアウトしました');
        cacheManager.clearTargetSlots();
        return;
    }
    // キャッシュされた日付と現在の日付を比較
    if (cached.selectedDate) {
        // 動的待機で正しい日付を取得
        const currentSelectedDate = await waitForValidCalendarDate();
        console.log(`📅 比較 - キャッシュ日付: ${cached.selectedDate}, 現在日付: ${currentSelectedDate}`);
        // 入場予約状態管理システムにキャッシュされた日付を設定
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.setSelectedCalendarDate(cached.selectedDate);
            console.log(`📅 入場予約状態管理にキャッシュ日付を設定: ${cached.selectedDate}`);
        }
        if (currentSelectedDate !== cached.selectedDate) {
            console.log('📅 日付が一致しません。キャッシュされた日付に移動します...');
            const calendarClicked = await clickCalendarDate(cached.selectedDate);
            if (!calendarClicked) {
                console.log('❌ 指定日付へのカレンダークリックに失敗しました');
                console.log('🗑️ 復元不可のためキャッシュをクリアします');
                cacheManager.clearTargetSlots();
                return;
            }
            // 日付クリック後、テーブル表示を待機（短縮: 3秒）
            console.log('⏰ 日付変更後の時間帯テーブル表示を待機中...');
            const tableAppeared = await (0,_entrance_page_monitor__WEBPACK_IMPORTED_MODULE_2__/* .waitForTimeSlotTable */ .il)(3000);
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
        console.log('📋 キャッシュ内容詳細:', cached);
    }
    // 時間帯テーブルの存在確認を短縮実行
    const hasTable = await Promise.race([
        (0,_entrance_page_monitor__WEBPACK_IMPORTED_MODULE_2__/* .checkTimeSlotTableExistsAsync */ .gW)(),
        new Promise(resolve => setTimeout(() => resolve(false), 200)) // 200msでタイムアウト
    ]);
    if (!hasTable) {
        console.log('⏰ 時間帯テーブルが見つからないため、現在選択中の日付をクリックします');
        const calendarClicked = await tryClickCalendarForTimeSlot();
        if (calendarClicked) {
            // カレンダークリック後、テーブル表示を待機（短縮: 2秒）
            const tableAppeared = await (0,_entrance_page_monitor__WEBPACK_IMPORTED_MODULE_2__/* .waitForTimeSlotTable */ .il)(2000);
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
    // UI更新を最短遅延実行（DOM完成後）
    setTimeout(() => {
        // 該当する監視ボタンを探して復元
        let restoredCount = 0;
        const allMonitorButtons = document.querySelectorAll('.monitor-btn');
        console.log(`📋 復元対象監視ターゲット: ${cached.targets?.length || 0}個`);
        // 優先順位順に処理（最優先から順番にチェック）
        const availableTargets = [];
        // 各監視対象について状態をチェック
        cached.targets?.forEach((targetData, index) => {
            const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .LocationHelper */ .Qs.getIndexFromSelector(targetData.tdSelector);
            const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .LocationHelper */ .Qs.getLocationFromIndex(locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            const priority = index + 1;
            console.log(`📍 復元対象を処理中: ${priority}.${locationText}${targetData.timeText}`);
            // まず同一td要素を見つける
            const tdElement = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .findSameTdElement */ .e0)(targetData);
            if (!tdElement) {
                console.log(`❌ td要素が見つかりません: ${locationText}${targetData.timeText}`);
                return;
            }
            // td要素の現在の状態をチェック
            const currentStatus = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .extractTdStatus */ .SE)(tdElement);
            if (currentStatus && currentStatus.isAvailable) {
                console.log(`🎉 監視対象が空きありに変化！: ${priority}.${locationText}${targetData.timeText}`);
                availableTargets.push({
                    ...targetData,
                    priority,
                    location: locationText,
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
                    const buttonTdSelector = buttonTd ? (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .generateUniqueTdSelector */ .sN)(buttonTd) : '';
                    // 時間+位置で一致するかチェック
                    if (buttonTime === targetData.timeText && buttonTdSelector === targetData.tdSelector) {
                        targetButton = button;
                    }
                });
                if (targetButton) {
                    console.log(`📍 復元対象の監視ボタンを発見: ${location}${targetData.timeText}`);
                    // 状態復元（複数監視対象対応）
                    // const restoredSlotInfo = {
                    //     timeText: targetData.timeText,
                    //     tdSelector: targetData.tdSelector,
                    //     positionInfo: targetData.positionInfo,
                    //     status: targetData.status
                    // };
                    // 入場予約状態管理システムに追加（一元管理）
                    let added = false;
                    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                        const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .LocationHelper */ .Qs.getIndexFromSelector(targetData.tdSelector);
                        added = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.addMonitoringTarget(targetData.timeText, locationIndex, targetData.tdSelector);
                        console.log(`📡 入場予約状態管理への復元: ${added ? '成功' : '失敗'} - ${location}${targetData.timeText}`);
                    }
                    if (added && targetButton) {
                        // ボタンの表示を更新
                        const span = targetButton.querySelector('span');
                        if (span) {
                            // 監視対象での優先順位を取得（入場予約状態管理から）
                            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                                const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
                                const target = targets.find((t) => t.timeSlot === targetData.timeText && t.selector === targetData.tdSelector);
                                if (target) {
                                    span.innerText = `監視${target.priority}`;
                                }
                                else {
                                    span.innerText = '監視1'; // フォールバック
                                }
                            }
                            else {
                                span.innerText = '監視1'; // フォールバック
                            }
                            targetButton.classList.remove('full-status');
                            targetButton.classList.add('monitoring-status');
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
            // 空きあり監視対象を発見
            const topPriority = availableTargets.sort((a, b) => a.priority - b.priority)[0];
            console.log(`🎉 最優先の空きあり監視対象を発見: ${topPriority.priority}.${topPriority.location}${topPriority.timeText}`);
            // 監視中に空きが見つかったら自動で予約処理に移行
            console.log(`🎉 空きが見つかりました！自動で予約処理を開始します: ${topPriority.location}${topPriority.timeText}`);
            // 入場予約状態管理で予約対象に設定
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.setReservationTarget(topPriority.timeText, topPriority.locationIndex, topPriority.tdSelector);
                console.log('✅ 予約対象に設定完了');
            }
            // 予約処理を自動開始
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.startReservation();
            }
            updateMainButtonDisplay();
            // 時間帯を選択して予約開始（監視対象から予約対象に移行した正当な処理）
            if (selectTimeSlotAndStartReservation) {
                console.log(`✅ 監視対象から予約対象に移行、自動選択を実行: ${topPriority.location}${topPriority.timeText}`);
                // tdSelectorから実際のDOM要素を取得
                const tdElement = document.querySelector(topPriority.tdSelector);
                if (tdElement) {
                    selectTimeSlotAndStartReservation({
                        element: tdElement,
                        timeText: topPriority.timeText,
                        targetInfo: {
                            tdSelector: topPriority.tdSelector
                        },
                        locationIndex: topPriority.locationIndex
                    });
                }
                else {
                    console.error(`❌ TD要素が見つかりません: ${topPriority.tdSelector}`);
                }
            }
            else {
                console.log(`⚠️ selectTimeSlotAndStartReservation関数が利用できません`);
            }
            return; // 復元処理終了
        }
        // 復元結果の処理
        if (restoredCount > 0) {
            // EntranceReservationStateManagerに統合されているため、リトライ回数の設定は不要
            // 実行状態は監視対象が存在する場合はIDLEのまま（監視開始可能状態）
            // メインボタンの表示更新
            updateMainButtonDisplay();
            // FAB監視対象表示の更新
            if (updateMonitoringTargetsDisplayFn) {
                updateMonitoringTargetsDisplayFn();
            }
            console.log(`✅ ${restoredCount}個の監視状態を復元完了 (試行回数: ${cached.retryCount})`);
            // 入場予約状態管理の状態確認
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.debugInfo();
            }
            // 監視継続フラグをチェックして監視を再開（既に取得済みの値を使用）
            if (shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。監視を自動再開します...');
                // 入場予約状態管理システムの実行状態を監視中に設定
                if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.startMonitoring();
                    console.log('📡 入場予約状態管理システム: 監視実行状態に設定');
                }
                // FABボタン表示を即座に更新
                updateMainButtonDisplay();
                setTimeout(() => {
                    (0,_entrance_page_monitor__WEBPACK_IMPORTED_MODULE_2__/* .startSlotMonitoring */ .fp)();
                }, 3000); // DOM安定化を待ってから監視開始
            }
            else {
                console.log('🛑 監視継続フラグが無効または期限切れです。監視は再開されません');
                // 手動リロード時: 監視対象が復元されている場合の処理
                if (restoredCount > 0) {
                    console.log('🔄 手動リロード後: 監視対象が復元されました');
                    // FABボタン表示を更新
                    updateMainButtonDisplay();
                }
                else {
                    console.log('🔄 手動リロード後: 監視対象がありません（IDLE状態）');
                }
            }
        }
        else {
            // 復元できた対象がない場合
            console.log('❌ 復元できた監視対象がありません');
            // 既に取得済みの監視継続フラグを使用
            if (shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。カレンダー自動クリックを試行します...');
                // キャッシュクリアのヘルパー関数
                const clearTargetAndState = () => {
                    if (cacheManager) {
                        cacheManager.clearTargetSlots();
                    }
                    // 入場予約状態管理をクリア
                    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.clearAllTargets();
                        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.stop(); // IDLE状態に設定
                    }
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
                                    const retryTargetElement = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .findSameTdElement */ .e0)(targetData);
                                    if (!retryTargetElement)
                                        return;
                                    const retryStatus = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .extractTdStatus */ .SE)(retryTargetElement);
                                    if (retryStatus) {
                                        // 入場予約状態管理に追加
                                        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                                            const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .LocationHelper */ .Qs.getIndexFromSelector(targetData.tdSelector);
                                            const added = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.addMonitoringTarget(targetData.timeText, locationIndex, targetData.tdSelector);
                                            if (added) {
                                                retryRestoredCount++;
                                            }
                                        }
                                    }
                                });
                                if (retryRestoredCount > 0) {
                                    console.log(`✅ ${retryRestoredCount}個の監視対象を再試行で復元成功`);
                                    updateMainButtonDisplay();
                                    (0,_entrance_page_monitor__WEBPACK_IMPORTED_MODULE_2__/* .startSlotMonitoring */ .fp)();
                                }
                                else {
                                    console.log('❌ 再試行でも監視対象が見つかりません。キャッシュをクリアします');
                                    clearTargetAndState();
                                }
                            }, 800); // 再試行待機時間を短縮
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
                // 入場予約状態管理システムもクリア
                if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.clearAllTargets();
                    console.log('📡 入場予約状態管理システムもクリアしました');
                }
                // EntranceReservationStateManagerで統合管理されているため、個別設定は不要
                updateMainButtonDisplay();
                console.log('✅ キャッシュクリア完了');
            }
        }
        // キャッシュ復元処理完了後、入場予約状態管理システムの状態を最終確認（1回のみ）
        setTimeout(() => {
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx) {
                console.log('🔄 キャッシュ復元後の入場予約状態管理状態確認');
                const hasTargets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets();
                const preferredAction = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationStateManager */ .xx.getPreferredAction();
                console.log(`📡 復元後状態: hasTargets=${hasTargets}, preferredAction=${preferredAction}`);
                // FABボタン表示を最終更新（1回のみ）
                if (hasTargets && preferredAction === 'none') {
                    console.log('⚠️ 監視対象があるのにpreferredAction=noneのため、状態不整合を検出');
                }
                updateMainButtonDisplay();
            }
        }, 100); // 復元完了後の最終確認のみ
    }, 500); // キャッシュ復元UI更新の高速化
}
// 注意: checkReservationConditions関数は削除されました
// 予約開始条件は入場予約状態管理システム（EntranceReservationStateManager.canStartReservation）で判定されます
// エクスポート

// ============================================================================


/***/ }),

/***/ 270:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   A: () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(601);
/* harmony import */ var _node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(314);
/* harmony import */ var _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1__);
// Imports


var ___CSS_LOADER_EXPORT___ = _node_modules_css_loader_dist_runtime_api_js__WEBPACK_IMPORTED_MODULE_1___default()((_node_modules_css_loader_dist_runtime_noSourceMaps_js__WEBPACK_IMPORTED_MODULE_0___default()));
// Module
___CSS_LOADER_EXPORT___.push([module.id, `button.ext-ytomo{height:40px;width:auto;min-width:60px;padding:0px 8px;background:#006821 !important;color:#fff}button.ext-ytomo.no-after:after{background:rgba(0,0,0,0) none repeat 0 0/auto auto padding-box border-box scroll}button.ext-ytomo.btn-done{background:#4a4c4a !important}button.ext-ytomo:hover{background:#02862b}.pavilion-sub-btn{color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:12px;white-space:nowrap;transition:all .2s ease}.pavilion-sub-btn.btn-enabled{background:#006821 !important;cursor:pointer !important;opacity:1 !important}.pavilion-sub-btn.btn-enabled:hover{background:#02862b !important;transform:scale(1.05) !important}.pavilion-sub-btn.btn-disabled,.pavilion-sub-btn.btn-loading{background:gray !important;cursor:not-allowed !important;opacity:.6 !important}.pavilion-sub-btn.btn-disabled:hover,.pavilion-sub-btn.btn-loading:hover{background:gray !important;transform:scale(1) !important}button.ext-ytomo.pavilion-sub-btn.btn-disabled,button.ext-ytomo.pavilion-sub-btn.btn-loading{background:gray !important;cursor:not-allowed !important;opacity:.6 !important}button.ext-ytomo.pavilion-sub-btn.btn-disabled:hover,button.ext-ytomo.pavilion-sub-btn.btn-loading:hover{background:gray !important;transform:scale(1) !important}.safe-none,.ytomo-none,.filter-none{display:none}button.ext-ytomo.monitor-btn{height:auto;min-height:20px;width:auto;min-width:35px;padding:1px 4px;color:#fff !important;margin-left:8px;font-size:10px;border:none !important;border-radius:2px;cursor:pointer !important;display:inline-block;vertical-align:middle;position:relative;z-index:10 !important;pointer-events:auto !important;opacity:1 !important;visibility:visible !important}button.ext-ytomo.monitor-btn.full-status{background:#228b22 !important}button.ext-ytomo.monitor-btn.full-status:hover{background:#32cd32 !important}button.ext-ytomo.monitor-btn.monitoring-status{background:#dc3545 !important}button.ext-ytomo.monitor-btn.monitoring-status:hover{background:#ff4554 !important}button.ext-ytomo.monitor-btn:disabled{cursor:not-allowed !important;opacity:.4 !important}button.ext-ytomo.monitor-btn:disabled.full-status{background:rgba(34,139,34,.3) !important;color:hsla(0,0%,100%,.7) !important}button.ext-ytomo.monitor-btn:disabled.monitoring-status{background:rgba(220,53,69,.3) !important;color:hsla(0,0%,100%,.7) !important}button.ext-ytomo.monitor-btn:disabled:not(.full-status):not(.monitoring-status){background:rgba(128,128,128,.5) !important;color:hsla(0,0%,100%,.7) !important}button.ext-ytomo.pavilion-sub-btn.ytomo-date-button.date-selected{border:2px solid #4caf50;box-shadow:0 0 8px rgba(76,175,80,.6)}div.div-flex{display:flex;justify-content:center;margin:5px}.js-show{display:block}.js-hide{display:none}.js-visible{visibility:visible}.js-invisible{visibility:hidden}.js-enabled{pointer-events:auto;opacity:1}.js-disabled{pointer-events:none;opacity:.6}.js-green{background:#228b22;color:#fff}.js-red{background:#dc3545;color:#fff}.js-gray{background:gray;color:#fff}.ytomo-header li.fab-toggle-li{display:inline-block;margin-right:8px}.ytomo-header li.fab-toggle-li button.fab-toggle-button{background:none;border:none;cursor:pointer;padding:0;color:#fff;transition:all .2s ease;display:flex;align-items:center;justify-content:center}.ytomo-header li.fab-toggle-li button.fab-toggle-button:hover{color:#ddd}.ytomo-header li.fab-toggle-li button.fab-toggle-button figure.fab-toggle-figure{width:auto;height:24px;display:flex;align-items:center;justify-content:center;padding:0 4px}.ytomo-pavilion-fab button.ytomo-fab{position:relative}.ytomo-pavilion-fab button.ytomo-fab:hover{transform:scale(1.15);box-shadow:0 8px 25px rgba(0,0,0,.5),0 4px 12px rgba(0,0,0,.3);border-width:4px}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-expand-icon{font-size:8px;line-height:1;margin-bottom:1px;opacity:.8}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-brand-text{font-size:7px;font-weight:normal;line-height:1;margin-bottom:2px;opacity:.7}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-counts-text{font-size:12px;font-weight:bold;line-height:1}.ytomo-pavilion-fab .pavilion-sub-actions-container{display:none;flex-direction:column;gap:8px;align-items:flex-end;margin-bottom:8px}.ytomo-pavilion-fab .pavilion-sub-actions-container.expanded{display:flex}.ytomo-pavilion-fab .pavilion-sub-actions-container button.pavilion-sub-btn.base-style{color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3);transition:all .2s ease}.ytomo-companion-dialog{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;box-sizing:border-box}.ytomo-companion-dialog .dialog-content{background:#fff;border-radius:12px;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.3)}@media(max-width: 768px){.ytomo-companion-dialog .dialog-content{max-width:95vw;max-height:85vh;padding:16px;border-radius:8px}}.ytomo-companion-dialog .dialog-content .input-row{display:flex;gap:8px;margin-bottom:12px}@media(max-width: 480px){.ytomo-companion-dialog .dialog-content .input-row{flex-direction:column;gap:12px}}.ytomo-companion-dialog .dialog-content .input-row input{padding:12px 8px;border:1px solid #ddd;border-radius:4px;font-size:16px}.ytomo-companion-dialog .dialog-content .input-row input:focus{outline:none;border-color:#4caf50;box-shadow:0 0 0 2px rgba(76,175,80,.2)}.ytomo-companion-dialog .dialog-content .input-row button{padding:12px 16px;background:#4caf50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;white-space:nowrap;min-width:60px}.ytomo-companion-dialog .dialog-content .input-row button:hover{background:#45a049}.ytomo-companion-dialog .dialog-content .input-row button:active{background:#3d8b40}.ytomo-fab{width:56px !important;height:56px !important;border-radius:50% !important;color:#fff !important;border:none !important;box-shadow:0 6px 20px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.2) !important;border:3px solid hsla(0,0%,100%,.2) !important;display:flex !important;align-items:center !important;justify-content:center !important;font-size:14px !important;font-weight:bold !important;transition:all .3s ease !important;position:relative !important;overflow:hidden !important;pointer-events:auto !important}.ytomo-fab-enabled{background:#006821 !important;opacity:.9 !important;cursor:pointer !important;pointer-events:auto !important}.ytomo-fab-disabled{background:gray !important;opacity:.6 !important;cursor:not-allowed !important;pointer-events:none !important}.ytomo-fab-monitoring{background:#ff8c00 !important;opacity:.9 !important;cursor:pointer !important;pointer-events:auto !important}.ytomo-fab-running{background:#dc3545 !important;opacity:.6 !important;cursor:not-allowed !important;pointer-events:none !important}.ytomo-fab-container{position:fixed !important;bottom:20px !important;right:20px !important;z-index:9999 !important;display:flex !important;flex-direction:column-reverse !important;align-items:center !important;gap:12px !important;pointer-events:none !important}.ytomo-fab-container.visible{display:flex !important}.ytomo-fab-container.hidden{display:none !important}.ytomo-fab-content{position:relative !important;display:flex !important;flex-direction:column-reverse !important;align-items:center !important;gap:8px !important;opacity:0 !important;transform:scale(0.8) translateY(10px) !important;transition:all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;pointer-events:none !important}.ytomo-fab-content.expanded{opacity:1 !important;transform:scale(1) translateY(0) !important;pointer-events:auto !important}.ytomo-sub-fab{width:45px !important;height:32px !important;border-radius:16px !important;background:rgba(0,104,33,.9) !important;color:#fff !important;border:none !important;font-size:11px !important;font-weight:bold !important;cursor:pointer !important;transition:all .2s ease !important;box-shadow:0 2px 8px rgba(0,0,0,.3) !important;display:flex !important;align-items:center !important;justify-content:center !important;pointer-events:auto !important}.ytomo-sub-fab:hover{background:rgba(2,134,43,.9) !important;transform:scale(1.1) !important;box-shadow:0 4px 12px rgba(0,0,0,.4) !important}.ytomo-sub-fab:active{transform:scale(0.95) !important}.ytomo-pavilion-fab-container{position:fixed !important;bottom:24px !important;right:24px !important;z-index:10000 !important;display:flex !important;flex-direction:column !important;gap:12px !important;align-items:flex-end !important;pointer-events:auto !important}.ytomo-fab-inner-content{display:flex !important;flex-direction:column !important;align-items:center !important;justify-content:center !important;height:100% !important;pointer-events:none !important}input.ext-tomo.search{height:50px;min-width:200px;max-width:min(300px,100%);font-family:quicksand;font-size:16px;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield;border:1px solid #222426;border-radius:25px;box-shadow:0 1px 0 0 #ccc;padding:0 0 0 10px;flex:1 1}.ytomo-icon.expand-icon{font-size:8px !important;line-height:1 !important;color:#fff !important;font-weight:bold !important;text-align:center !important;pointer-events:none !important}.ytomo-icon.countdown-text{font-size:6px !important;line-height:1 !important;color:#fff !important;font-weight:bold !important;text-align:center !important;margin-top:1px !important;pointer-events:none !important}.ytomo-toggle.toggle-li{position:fixed !important;bottom:10px !important;left:10px !important;z-index:1000 !important;list-style:none !important;margin:0 !important;padding:0 !important}.ytomo-toggle.toggle-button{width:50px !important;height:30px !important;background:rgba(255,140,0,.8) !important;border:none !important;border-radius:15px !important;cursor:pointer !important;transition:all .3s ease !important;display:flex !important;align-items:center !important;justify-content:center !important;font-size:12px !important;font-weight:bold !important;position:relative !important;overflow:hidden !important}.ytomo-toggle.toggle-button.enabled{color:#fff}.ytomo-toggle.toggle-button.disabled{color:#ddd}.ytomo-toggle.toggle-figure{width:100% !important;height:100% !important;margin:0 !important;padding:0 !important;border:none !important;background:rgba(0,0,0,0) !important;pointer-events:none !important}.ytomo-dialog.overlay{position:fixed !important;top:0 !important;left:0 !important;width:100% !important;height:100% !important;background-color:rgba(0,0,0,.5) !important;z-index:10000 !important;display:flex !important;justify-content:center !important;align-items:center !important}.ytomo-dialog.container{background:#fff !important;border-radius:8px !important;padding:20px !important;max-width:400px !important;width:90% !important;max-height:70vh !important;overflow-y:auto !important;box-shadow:0 4px 12px rgba(0,0,0,.3) !important}.ytomo-dialog.title{margin:0 0 16px 0 !important;color:#333 !important;font-size:18px !important;font-weight:bold !important}.ytomo-dialog.button-group{display:flex !important;justify-content:flex-end !important;gap:10px !important;margin-top:20px !important}.ytomo-dialog.primary-button{background:#006821 !important;color:#fff !important;border:none !important;padding:10px 20px !important;border-radius:4px !important;cursor:pointer !important;font-size:14px !important}.ytomo-dialog.primary-button:hover{background:#02862b !important}.ytomo-dialog.primary-button:disabled{background:gray !important;cursor:not-allowed !important}.ytomo-dialog.secondary-button{background:rgba(0,0,0,0) !important;color:#666 !important;border:1px solid #ccc !important;padding:10px 20px !important;border-radius:4px !important;cursor:pointer !important;font-size:14px !important}.ytomo-dialog.secondary-button:hover{background:#f5f5f5 !important}.ytomo-progress.counter{display:inline-block !important;margin-left:8px !important;padding:2px 6px !important;background:rgba(0,0,0,.3) !important;border-radius:10px !important;font-size:10px !important;color:#fff !important;font-weight:bold !important}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


/***/ }),

/***/ 278:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   calendarWatchState: () => (/* binding */ calendarWatchState),
/* harmony export */   createFABToggleButton: () => (/* binding */ createFABToggleButton),
/* harmony export */   entranceReservationState: () => (/* binding */ entranceReservationState),
/* harmony export */   fabVisibilityState: () => (/* binding */ fabVisibilityState),
/* harmony export */   loadFABVisibility: () => (/* binding */ loadFABVisibility),
/* harmony export */   saveFABVisibility: () => (/* binding */ saveFABVisibility),
/* harmony export */   toggleFABVisibility: () => (/* binding */ toggleFABVisibility),
/* harmony export */   updateFABVisibility: () => (/* binding */ updateFABVisibility)
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
// timeSlotStateはEntranceReservationStateManagerに統合済み
// let timeSlotState: TimeSlotState = {
//     mode: 'idle',  // idle, selecting, monitoring, trying
//     targetSlots: [],   // 複数選択対象の時間帯情報配列
//     monitoringInterval: null,  // 監視用インターバル
//     isMonitoring: false,
//     retryCount: 0,
//     maxRetries: 100,
//     reloadInterval: 30000  // 30秒間隔
// };
// ページ読み込み状態管理（EntranceReservationStateManagerに統合済み）
// const pageLoadingState: PageLoadingState = {
//     isLoading: false,
//     startTime: null,
//     timeout: 10000
// };
// リロードカウントダウン状態管理（EntranceReservationStateManagerに統合済み）
// const reloadCountdownState: ReloadCountdownState = {
//     isActive: false,
//     timeLeft: 0,
//     intervalId: null,
//     onComplete: null,
//     totalSeconds: 30,
//     secondsRemaining: null,
//     startTime: null,
//     countdownInterval: null,
//     reloadTimer: null
// };
// カレンダー監視状態管理
const calendarWatchState = {
    isWatching: false,
    observer: null,
    currentSelectedDate: null
};
const fabVisibilityState = {
    isVisible: true, // デフォルトは表示
    cacheKey: 'ytomo-fab-visibility'
};
// FAB表示状態管理機能
function loadFABVisibility() {
    try {
        const saved = localStorage.getItem(fabVisibilityState.cacheKey);
        if (saved !== null) {
            fabVisibilityState.isVisible = JSON.parse(saved);
        }
    }
    catch (e) {
        console.warn('FAB表示状態の読み込みに失敗しました:', e);
    }
}
function saveFABVisibility(isVisible) {
    try {
        fabVisibilityState.isVisible = isVisible;
        localStorage.setItem(fabVisibilityState.cacheKey, JSON.stringify(isVisible));
    }
    catch (e) {
        console.warn('FAB表示状態の保存に失敗しました:', e);
    }
}
function toggleFABVisibility() {
    const newVisibility = !fabVisibilityState.isVisible;
    saveFABVisibility(newVisibility);
    updateFABVisibility();
}
function updateFABVisibility() {
    // 入場予約FAB
    const fabContainer = document.getElementById('ytomo-fab-container');
    if (fabContainer) {
        fabContainer.classList.toggle('js-hide', !fabVisibilityState.isVisible);
    }
    // パビリオン予約FAB
    const pavilionFabContainer = document.getElementById('ytomo-pavilion-fab-container');
    if (pavilionFabContainer) {
        pavilionFabContainer.classList.toggle('js-hide', !fabVisibilityState.isVisible);
    }
    // チケット選択画面FAB
    const ticketSelectionFabContainer = document.getElementById('ytomo-ticket-selection-fab-container');
    if (ticketSelectionFabContainer) {
        ticketSelectionFabContainer.classList.toggle('js-hide', !fabVisibilityState.isVisible);
    }
}
// ヘッダーにFAB表示切替ボタンを追加
function createFABToggleButton() {
    // 既存のボタンがあるかチェック
    const existingButton = document.getElementById('ytomo-fab-toggle-btn');
    if (existingButton) {
        return; // 既に存在する場合は何もしない
    }
    // 買い物アイコンを探す（HTMLから判明した安定セレクタ使用）
    const shoppingIcon = document.querySelector('li[data-type="cart"]');
    // 買い物アイコンが見つからない場合、ヘッダー内の右端要素を探す
    let targetElement = shoppingIcon;
    if (!targetElement) {
        console.log('🛒 買い物アイコンが見つかりません。ヘッダー右端要素を探索中...');
        // ヘッダー要素を探す
        const headerSelectors = [
            '.style_sp_title_box__oK11Q',
            '.pc-none',
            'div[class*="style_sp_title_box"]',
            'div[class*="title_box"]',
            'header',
            'div:has(.style_site_heading__W80I0)',
            '.style_site_heading__W80I0'
        ];
        let headerElement = null;
        for (const selector of headerSelectors) {
            try {
                headerElement = document.querySelector(selector);
                if (headerElement) {
                    console.log(`📋 ヘッダー要素発見: ${selector}`);
                    break;
                }
            }
            catch (e) {
                continue;
            }
        }
        if (headerElement) {
            // ヘッダー内の右端にありそうな要素を探す
            const rightElements = headerElement.querySelectorAll('a, button, span, div');
            for (let i = rightElements.length - 1; i >= 0; i--) {
                const el = rightElements[i];
                const rect = el.getBoundingClientRect();
                if (rect.width > 20 && rect.height > 20) {
                    targetElement = el;
                    console.log(`🎯 右端要素を買い物アイコン候補として使用: ${el.tagName}`);
                    break;
                }
            }
        }
    }
    if (!targetElement) {
        console.warn('買い物アイコンまたは配置基準要素が見つかりません');
        return;
    }
    // 既存のアイコンデザインに合わせたli要素を作成
    const toggleLi = document.createElement('li');
    toggleLi.id = 'ytomo-fab-toggle-li';
    const toggleButton = document.createElement('button');
    toggleButton.id = 'ytomo-fab-toggle-btn';
    toggleButton.type = 'button';
    toggleButton.tabIndex = 0;
    const toggleFigure = document.createElement('div');
    toggleFigure.className = 'style_header_shortcut__figure__gNkUJ';
    // 既存のヘッダーアイコン構造に合わせてDOM要素を作成
    // 既存のヘッダーアイコンのスタイルを継承
    toggleLi.className = 'fab-toggle-li';
    toggleButton.className = 'fab-toggle-button';
    toggleFigure.className = 'fab-toggle-figure style_header_shortcut__figure__gNkUJ';
    // DOM構造を組み立て
    toggleFigure.appendChild(toggleButton);
    toggleLi.appendChild(toggleFigure);
    // YT背景 + 前景アイコンの重ね表示
    function updateButtonIcon() {
        const iconSvg = fabVisibilityState.isVisible
            ? `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                 <path d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
               </svg>` // eye
            : `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                 <path d="M11.83,9L15,12.16C15,12.11 15,12.05 15,12A3,3 0 0,0 12,9C11.94,9 11.89,9 11.83,9M7.53,9.8L9.08,11.35C9.03,11.56 9,11.77 9,12A3,3 0 0,0 12,15C12.22,15 12.44,14.97 12.65,14.92L14.2,16.47C13.53,16.8 12.79,17 12,17A5,5 0 0,1 7,12C7,11.21 7.2,10.47 7.53,9.8M2,4.27L4.28,6.55L4.73,7C3.08,8.3 1.78,10 1,12C2.73,16.39 7,19.5 12,19.5C13.55,19.5 15.03,19.2 16.38,18.66L16.81,19.09L19.73,22L21,20.73L3.27,3M12,7A5,5 0 0,1 17,12C17,12.64 16.87,13.26 16.64,13.82L19.57,16.75C21.07,15.5 22.27,13.86 23,12C21.27,7.61 17,4.5 12,4.5C10.6,4.5 9.26,4.75 8,5.2L10.17,7.35C10.76,7.13 11.37,7 12,7Z" />
               </svg>`; // eye-off
        toggleButton.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center;">
                ${iconSvg}
                <span style="font-size: 8px; font-weight: bold; margin-top: 2px;">YTomo</span>
            </div>
        `;
        toggleButton.title = fabVisibilityState.isVisible ? 'FABを非表示にする' : 'FABを表示する';
    }
    updateButtonIcon();
    // クリックイベント
    toggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleFABVisibility();
        updateButtonIcon();
    });
    // 買い物アイコンの親ul要素を取得してその中に挿入
    const parentUl = targetElement.parentElement;
    if (parentUl && parentUl.tagName.toLowerCase() === 'ul') {
        // YTomoヘッダークラスを追加
        parentUl.classList.add('ytomo-header');
        // 買い物アイコンの直前に挿入
        parentUl.insertBefore(toggleLi, targetElement);
    }
    else {
        console.warn('ul要素が見つかりません。body直下に追加します');
        document.body.appendChild(toggleLi);
    }
}
// エクスポート



/***/ }),

/***/ 314:
/***/ ((module) => {



/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
module.exports = function (cssWithMappingToString) {
  var list = [];

  // return the list of modules as css string
  list.toString = function toString() {
    return this.map(function (item) {
      var content = "";
      var needLayer = typeof item[5] !== "undefined";
      if (item[4]) {
        content += "@supports (".concat(item[4], ") {");
      }
      if (item[2]) {
        content += "@media ".concat(item[2], " {");
      }
      if (needLayer) {
        content += "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {");
      }
      content += cssWithMappingToString(item);
      if (needLayer) {
        content += "}";
      }
      if (item[2]) {
        content += "}";
      }
      if (item[4]) {
        content += "}";
      }
      return content;
    }).join("");
  };

  // import a list of modules into the list
  list.i = function i(modules, media, dedupe, supports, layer) {
    if (typeof modules === "string") {
      modules = [[null, modules, undefined]];
    }
    var alreadyImportedModules = {};
    if (dedupe) {
      for (var k = 0; k < this.length; k++) {
        var id = this[k][0];
        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }
    for (var _k = 0; _k < modules.length; _k++) {
      var item = [].concat(modules[_k]);
      if (dedupe && alreadyImportedModules[item[0]]) {
        continue;
      }
      if (typeof layer !== "undefined") {
        if (typeof item[5] === "undefined") {
          item[5] = layer;
        } else {
          item[1] = "@layer".concat(item[5].length > 0 ? " ".concat(item[5]) : "", " {").concat(item[1], "}");
          item[5] = layer;
        }
      }
      if (media) {
        if (!item[2]) {
          item[2] = media;
        } else {
          item[1] = "@media ".concat(item[2], " {").concat(item[1], "}");
          item[2] = media;
        }
      }
      if (supports) {
        if (!item[4]) {
          item[4] = "".concat(supports);
        } else {
          item[1] = "@supports (".concat(item[4], ") {").concat(item[1], "}");
          item[4] = supports;
        }
      }
      list.push(item);
    }
  };
  return list;
};

/***/ }),

/***/ 429:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   H5: () => (/* binding */ checkTimeSlotTableExistsSync),
/* harmony export */   S9: () => (/* binding */ setCacheManager),
/* harmony export */   fp: () => (/* binding */ startSlotMonitoring),
/* harmony export */   gW: () => (/* binding */ checkTimeSlotTableExistsAsync),
/* harmony export */   il: () => (/* binding */ waitForTimeSlotTable),
/* harmony export */   startTimeSlotTableObserver: () => (/* binding */ startTimeSlotTableObserver),
/* harmony export */   wj: () => (/* binding */ analyzeAndAddMonitorButtons)
/* harmony export */ });
/* unused harmony exports analyzeTimeSlots, extractTimeSlotInfo, generateSelectorForElement, addMonitorButtonsToFullSlots, getMonitorButtonText, updateAllMonitorButtonPriorities, createMonitorButton, handleMonitorButtonClick, checkSlotAvailabilityAndReload, findTargetSlotInPageUnified, terminateMonitoring, checkTargetElementExists, checkMonitoringTargetExists, validatePageLoaded, checkMaxReloads */
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(461);
/* harmony import */ var _entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(115);
// entrance-page-stateからのimport（もう使用しません）
// import { timeSlotState } from './entrance-page-state';
// 入場予約状態管理システムからのimport

// entrance-page-dom-utilsからのimport

// 【5. 時間帯監視・分析システム】
// ============================================================================
// 依存注入用の外部関数参照
let externalFunctions = {};
let isInitialized = false;
// REQUIRED_FUNCTIONS配列は削除済み - 直接インポートを使用
// 依存注入は削除 - 直接インポートを使用
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
// getExternalFunction は削除 - 直接インポートを使用
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
            // console.log('既存の時間帯テーブルを検出');
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
function checkTimeSlotTableExistsSync() {
    // 実際の時間帯要素をチェック（時間を含むもの）
    const allElements = document.querySelectorAll(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotCells);
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
        const tdSelector = tdElement ? (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement) : '';
        return { timeText, tdSelector };
    });
    console.log(`📋 差分計算: 既存ボタン数=${existingButtons.length}個 vs 満員時間帯数=${analysis.full.length}個`);
    // 不要なボタンを削除（時間+位置で判定）
    let removedCount = 0;
    existingButtons.forEach(button => {
        const timeText = button.getAttribute('data-target-time') || '';
        const tdElement = button.closest('td[data-gray-out]');
        const tdSelector = tdElement ? (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement) : '';
        // 監視対象として設定済みの場合は削除しない（状態変化を追跡するため）
        const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getIndexFromSelector(tdSelector);
        const isMonitoringTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx?.isMonitoringTarget(timeText, locationIndex) || false;
        if (isMonitoringTarget) {
            console.log(`🎯 監視対象のため保持: ${timeText} (状態変化を追跡中)`);
            // 監視対象の状態が変わった場合はボタンテキストを更新
            const currentTd = button.closest('td[data-gray-out]');
            const currentStatus = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(currentTd);
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
                const slotTdSelector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(slotTdElement);
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
        const slotTdSelector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(slotTdElement);
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
    const allTdElements = document.querySelectorAll(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotContainer + ' td[data-gray-out]');
    // console.log(`📊 時間帯分析開始: ${allTdElements.length}個のtd要素を確認`);
    allTdElements.forEach(tdElement => {
        const status = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(tdElement);
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
            // console.log(`📊 ${status.timeText}: ${statusType} (満員:${isFull}, 利用可能:${isAvailable}, 選択:${isSelected})`);
            const timeInfo = {
                element: status.element,
                tdElement: status.tdElement,
                timeText: status.timeText,
                isAvailable: isAvailable,
                isFull: isFull,
                tdSelector: (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(status.tdElement)
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
    // console.log(`📊 分析結果: 利用可能=${available.length}, 満員=${full.length}, 選択=${selected.length}`);
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
    const tdSelector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
    // 既に監視対象として選択されているかチェック
    const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getIndexFromSelector(tdSelector);
    const isSelected = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx?.isMonitoringTarget(slotInfo.timeText, locationIndex) || false;
    if (isSelected) {
        // 監視対象リストでの位置を取得（1ベース）
        const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx?.getMonitoringTargets() || [];
        const targetIndex = targets.findIndex((target) => target.timeSlot === slotInfo.timeText && target.locationIndex === locationIndex);
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
    const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx?.getMonitoringTargets() || [];
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span');
        const timeText = button.getAttribute('data-target-time') || '';
        if (span && timeText) {
            // このボタンの時間帯と位置情報を特定
            const tdElement = button.closest('td[data-gray-out]');
            if (tdElement) {
                const tdSelector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
                // 監視対象リストでの位置を検索
                const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getIndexFromSelector(tdSelector);
                const targetIndex = targets.findIndex((target) => target.timeSlot === timeText && target.locationIndex === locationIndex);
                if (targetIndex >= 0) {
                    // 監視対象として選択されている場合、優先順位を表示
                    const priority = targetIndex + 1;
                    span.innerText = `監視${priority}`;
                    button.classList.remove('full-status');
                    button.classList.add('monitoring-status');
                }
                else {
                    // 監視対象でない場合は「満員」
                    span.innerText = '満員';
                    button.classList.remove('monitoring-status');
                    button.classList.add('full-status');
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
        const tdSelector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
        const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getIndexFromSelector(tdSelector);
        const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        console.log(`🖱️ 監視ボタンクリック検出: ${locationText}${slotInfo.timeText}`);
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
    // 初期状態のクラス設定（満員状態）
    const initialButtonText = getMonitorButtonText(slotInfo);
    if (initialButtonText.startsWith('監視')) {
        monitorButton.classList.add('monitoring-status');
    }
    else {
        monitorButton.classList.add('full-status');
    }
    // dt要素内に追加（spanの後）
    dtElement.appendChild(monitorButton);
    // 満員時間帯に監視ボタンを追加完了
}
// 監視ボタンクリック処理（選択・解除切り替え）
function handleMonitorButtonClick(slotInfo, buttonElement) {
    const tdElement = slotInfo.element.closest('td[data-gray-out]');
    const tdSelector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
    const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getIndexFromSelector(tdSelector);
    const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(locationIndex);
    const locationText = location === 'east' ? '東' : '西';
    // 監視ボタンがクリックされました
    // 監視実行中は操作不可
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.isMonitoringRunning()) {
        // 監視実行中のため操作不可
        return;
    }
    const buttonSpan = buttonElement.querySelector('span');
    const currentText = buttonSpan.innerText;
    const isCurrentlySelected = currentText.startsWith('監視'); // '監視1', '監視2' etc.
    // 現在の状態確認完了
    if (isCurrentlySelected) {
        // 現在選択中の場合は解除
        // 監視対象を解除
        // 入場予約状態管理システムから削除
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
            const unifiedRemoved = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.removeMonitoringTarget(slotInfo.timeText, locationIndex);
            if (unifiedRemoved) {
                console.log(`✅ 入場予約状態管理から監視対象を削除: ${locationText}${slotInfo.timeText}`);
            }
            else {
                console.log(`⚠️ 入場予約状態管理からの削除失敗: ${locationText}${slotInfo.timeText}`);
            }
        }
        else {
            // 入場予約状態管理システムが利用できません
        }
        // ボタンの表示を元に戻す
        buttonSpan.innerText = '満員';
        buttonElement.classList.remove('monitoring-status');
        buttonElement.classList.add('full-status');
        buttonElement.style.opacity = '1';
        buttonElement.style.cursor = 'pointer';
        buttonElement.disabled = false;
        // 監視対象がすべてなくなった場合の処理
        if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx || !_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets()) {
            // EntranceReservationStateManagerで統合管理されているため、個別設定不要
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
        // 監視対象を解除完了
    }
    else {
        // 現在未選択の場合は選択
        // 監視対象を追加
        // 選択状態を設定（td要素の一意特定情報を追加）
        // TypeScript用の変数（削除予定）
        // const targetSlotInfo: TimeSlotTarget = {
        //     ...slotInfo,
        //     // td要素の一意特定情報を追加
        //     tdSelector: generateUniqueTdSelector(tdElement),
        //     positionInfo: getTdPositionInfo(tdElement)
        // };
        // 入場予約状態管理システムに追加（一元管理）
        let added = false;
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
            added = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.addMonitoringTarget(slotInfo.timeText, locationIndex, tdSelector);
            if (added) {
                console.log(`✅ 入場予約状態管理に監視対象を追加: ${locationText}${slotInfo.timeText}`);
            }
            else {
                console.log(`⚠️ 入場予約状態管理への追加失敗（既に選択済み）: ${locationText}${slotInfo.timeText}`);
                return;
            }
        }
        else {
            // 入場予約状態管理システムが利用できません
            return;
        }
        if (!added)
            return; // 追加失敗時は処理を中止
        // EntranceReservationStateManagerで統合管理されているため、個別設定不要
        // キャッシュに保存（すべての監視対象を保存）
        if (cacheManager) {
            cacheManager.saveTargetSlots();
        }
        // ボタンの表示を変更（優先順位表示）
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
            const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
            const target = targets.find((t) => t.timeSlot === slotInfo.timeText && t.selector === tdSelector);
            const priority = target ? target.priority : targets.length;
            buttonSpan.innerText = `監視${priority}`;
        }
        else {
            buttonSpan.innerText = '監視1'; // フォールバック
        }
        buttonElement.classList.remove('full-status');
        buttonElement.classList.add('monitoring-status');
        buttonElement.style.opacity = '1';
        buttonElement.style.cursor = 'pointer';
        buttonElement.disabled = false; // クリックで解除できるように
        // メインボタンの表示を更新
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
            const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
            const targetCount = targets.length;
            console.log(`🔄 監視対象設定後のFAB更新を実行: targetSlots=${targetCount}個`);
            console.log('📊 入場予約状態管理の監視対象一覧:', targets.map((t) => `${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(t.locationIndex) === 'east' ? '東' : '西'}${t.timeSlot}`));
        }
        safeCall('updateMainButtonDisplay');
        // 監視対象表示も更新
        safeCall('updateMonitoringTargetsDisplay');
        // 更新後の状態も確認
        setTimeout(() => {
            const fabButton = document.querySelector('#ytomo-main-fab');
            console.log(`🔍 FAB更新後の状態: disabled=${fabButton?.disabled}, hasDisabledAttr=${fabButton?.hasAttribute('disabled')}, text="${fabButton?.textContent?.trim()}"`);
        }, 100);
        // 時間帯を監視対象に設定完了
    }
}
// 満員時間帯の可用性監視を開始
async function startSlotMonitoring() {
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx || !_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets()) {
        console.log('❌ 監視対象時間帯が設定されていません');
        return;
    }
    // 入場予約状態管理で監視開始
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.startMonitoring()) {
        console.log('✅ 入場予約状態管理で監視を開始しました');
    }
    else {
        console.log('⚠️ 入場予約状態管理での監視開始に失敗しました (状態確認が必要)');
    }
    safeCall('updateMainButtonDisplay'); // 即座にボタン表示を更新
    // 監視実行中は全ての監視ボタンを無効化
    safeCall('disableAllMonitorButtons');
    const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
    const targetTexts = targets.map((t) => {
        const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(t.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        return `${locationText}${t.timeSlot}`;
    }).join(', ');
    console.log(`🔄 時間帯監視を開始: ${targetTexts} (${targets.length}個)`);
    // 監視は一回のチェック→リロード→新しいページで再開のサイクル
    // 定期インターバルは不要（リロード間隔と同じため無意味）
    setTimeout(() => {
        checkSlotAvailabilityAndReload();
    }, 500);
}
// 時間帯の可用性チェックとページ再読み込み
async function checkSlotAvailabilityAndReload() {
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx || _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getExecutionState() !== _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .ExecutionState */ .si.MONITORING_RUNNING) {
        return;
    }
    // バリデーションチェック
    if (!validatePageLoaded())
        return;
    if (!(await checkTimeSlotTableExistsAsync()))
        return;
    // 複数監視対象の存在チェック
    const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
    for (const target of targets) {
        if (!checkMonitoringTargetExists(target))
            return;
    }
    if (!checkMaxReloads(_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getRetryCount()))
        return;
    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.incrementRetryCount();
    if (cacheManager) {
        cacheManager.updateRetryCount(_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getRetryCount());
    }
    const targetTexts = targets.map((t) => t.timeSlot).join(', ');
    console.log(`🔍 可用性チェック (${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getRetryCount()}回目): ${targetTexts}`);
    // 現在の時間帯をチェック
    const currentSlot = findTargetSlotInPageUnified();
    console.log(`📊 監視チェック結果: currentSlot=${!!currentSlot}, status=${currentSlot?.status}`);
    if (currentSlot && currentSlot.status === 'available') {
        const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(currentSlot.targetInfo.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        console.log(`🎉🎉 対象時間帯が利用可能になりました！: ${locationText}${currentSlot.targetInfo.timeSlot}`);
        console.log(`  → 監視を終了し、自動選択+予約を開始します`);
        // ボタン表示を更新（見つかりましたモード）
        safeCall('updateMainButtonDisplay', 'found-available');
        // 自動選択
        await safeCall('selectTimeSlotAndStartReservation', currentSlot);
        return;
    }
    // まだ満員の場合はページリロード
    console.log('⏳ すべての監視対象がまだ満員です。ページを再読み込みします...');
    // BAN対策：設定されたリロード間隔にランダム要素を追加
    const baseInterval = 30000; // 30000ms (30秒) - EntranceReservationStateManagerで管理されている値
    const randomVariation = Math.random() * 5000; // 0-5秒のランダム要素
    const totalWaitTime = baseInterval + randomVariation;
    const displaySeconds = Math.ceil(totalWaitTime / 1000);
    // カウントダウンとリロードを統一実行
    safeCall('scheduleReload', displaySeconds);
}
// 入場予約状態管理対応版の監視対象検索関数
function findTargetSlotInPageUnified() {
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx || !_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets()) {
        return null;
    }
    const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
    // 複数監視対象をチェック
    for (const target of targets) {
        // selectorが保存されている場合はそれを使用、ない場合は検索
        let targetTd = null;
        if (target.selector) {
            targetTd = document.querySelector(target.selector);
        }
        else {
            // selectorがない場合は、時間帯とlocationIndexから要素を検索
            const timeElements = document.querySelectorAll('.time-text');
            for (const timeEl of timeElements) {
                if (timeEl.textContent?.includes(target.timeSlot)) {
                    const tdElement = timeEl.closest('td[data-gray-out]');
                    if (tdElement) {
                        const elementIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getIndexFromElement(tdElement);
                        if (elementIndex === target.locationIndex) {
                            targetTd = tdElement;
                            break;
                        }
                    }
                }
            }
        }
        if (targetTd) {
            // 同一td要素の現在の状態を取得
            const currentStatus = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(targetTd);
            const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(target.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            // 詳細なデバッグ情報を出力
            const buttonElement = targetTd.querySelector('div[role="button"]');
            const dataDisabled = buttonElement?.getAttribute('data-disabled');
            const fullIcon = buttonElement?.querySelector('img[src*="calendar_ng.svg"]');
            const lowIcon = buttonElement?.querySelector('img[src*="ico_scale_low.svg"]');
            const highIcon = buttonElement?.querySelector('img[src*="ico_scale_high.svg"]');
            console.log(`🔍 監視対象要素を発見: ${locationText}${target.timeSlot}`);
            console.log(`  - 現在状態: isAvailable=${currentStatus?.isAvailable}, isFull=${currentStatus?.isFull}`);
            console.log(`  - data-disabled: ${dataDisabled}`);
            console.log(`  - 満員アイコン: ${!!fullIcon}, 低混雑: ${!!lowIcon}, 高空き: ${!!highIcon}`);
            // 利用可能になったかチェック
            if (currentStatus && currentStatus.isAvailable) {
                console.log(`🎉 監視対象要素が利用可能になりました！: ${locationText}${target.timeSlot}`);
                console.log(`  → 監視を終了して自動選択を開始します`);
                return { ...currentStatus, targetInfo: target, status: 'available' };
            }
            else if (currentStatus && currentStatus.isFull) {
                console.log(`⏳ 監視対象要素はまだ満員: ${locationText}${target.timeSlot}`);
            }
            else {
                console.log(`❓ 監視対象要素の状態が不明: ${locationText}${target.timeSlot} (isAvailable: ${currentStatus?.isAvailable}, isFull: ${currentStatus?.isFull})`);
            }
        }
        else {
            // 要素が見つからない場合
            const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(target.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            console.log(`❌ 監視対象要素が見つかりません: ${locationText}${target.timeSlot}`);
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
    // 入場予約状態管理システムでインターバル停止と状態リセット
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.clearMonitoringInterval();
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.stop();
    }
    // UI状態リセット
    safeCall('resetMonitoringUI');
    safeCall('updateMainButtonDisplay', 'idle');
    // エラー表示
    safeCall('showErrorMessage', errorMessage);
    // 入場予約状態管理で監視停止
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.stop();
        console.log('🛑 入場予約状態管理で監視を停止しました');
    }
    // 入場予約状態管理をクリア
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.clearAllTargets();
    }
    // リトライ回数もEntranceReservationStateManagerでリセット
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.resetRetryCount();
    }
}
// 監視バリデーション関数群
function checkTargetElementExists(targetInfo) {
    const element = findSameTdElement(targetInfo);
    if (!element) {
        terminateMonitoring('ERROR_TARGET_NOT_FOUND', `監視対象の時間帯 ${targetInfo.timeText} が見つかりません`);
        return false;
    }
    return true;
}
// 入場予約状態管理用の監視対象存在チェック
function checkMonitoringTargetExists(target) {
    // MonitoringTargetをTimeSlotTarget形式に変換
    const targetInfo = {
        timeText: target.timeSlot,
        tdSelector: target.selector
    };
    const element = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(targetInfo);
    if (!element) {
        terminateMonitoring('ERROR_TARGET_NOT_FOUND', `監視対象の時間帯 ${target.timeSlot} が見つかりません`);
        return false;
    }
    return true;
}
async function checkTimeSlotTableExistsAsync() {
    const table = document.querySelector(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotContainer);
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

/***/ 461:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Qs: () => (/* binding */ LocationHelper),
/* harmony export */   si: () => (/* binding */ ExecutionState),
/* harmony export */   xx: () => (/* binding */ entranceReservationStateManager)
/* harmony export */ });
/* unused harmony exports PriorityMode, EntranceReservationStateManager */
/* harmony import */ var _entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(115);
/* harmony import */ var _entrance_page_ui__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(213);
/**
 * 入場予約状態管理システム
 * 入場予約・監視の状態と対象を管理
 */
// 必要なimport


// ============================================================================
// 型定義
// ============================================================================
// 実行状態（排他的）
var ExecutionState;
(function (ExecutionState) {
    ExecutionState["IDLE"] = "idle";
    ExecutionState["RESERVATION_RUNNING"] = "reservation_running";
    ExecutionState["MONITORING_RUNNING"] = "monitoring_running";
})(ExecutionState || (ExecutionState = {}));
// 優先実行モード
var PriorityMode;
(function (PriorityMode) {
    PriorityMode["AUTO"] = "auto";
    PriorityMode["FORCE_RESERVATION"] = "force_reservation";
    PriorityMode["FORCE_MONITORING"] = "force_monitoring"; // 監視強制実行
})(PriorityMode || (PriorityMode = {}));
// 位置管理の定数
const LOCATION_MAP = {
    0: 'east', // 0番目のtd = 東
    1: 'west' // 1番目のtd = 西
};
const LOCATION_TO_INDEX = {
    'east': 0,
    'west': 1
};
// ============================================================================
// 位置管理ヘルパークラス
// ============================================================================
class LocationHelper {
    // indexから東西を取得
    static getLocationFromIndex(index) {
        return LOCATION_MAP[index] || 'east';
    }
    // 東西からindexを取得
    static getIndexFromLocation(location) {
        return LOCATION_TO_INDEX[location];
    }
    // tdSelectorからindexを抽出
    static getIndexFromSelector(selector) {
        if (!selector || typeof selector !== 'string') {
            console.warn('⚠️ LocationHelper.getIndexFromSelector: 無効なselector:', selector);
            return 0; // デフォルトは東
        }
        const cellMatch = selector.match(/td:nth-child\((\d+)\)/);
        if (cellMatch && cellMatch[1]) {
            return parseInt(cellMatch[1]) - 1; // nth-childは1ベース、indexは0ベース
        }
        return 0; // デフォルトは東
    }
    // DOM要素からindexを取得
    static getIndexFromElement(tdElement) {
        const row = tdElement.parentElement;
        return Array.from(row.children).indexOf(tdElement);
    }
    // 同じ時間帯の比較用キー生成
    static generateTimeLocationKey(timeSlot, locationIndex) {
        return `${timeSlot}_${locationIndex}`;
    }
    // ログ表示用のヘルパー
    static formatTargetInfo(timeSlot, locationIndex) {
        const location = LocationHelper.getLocationFromIndex(locationIndex);
        return `${location}${timeSlot}`; // 例: "east11:00-" or "west09:00-"
    }
}
// ============================================================================
// 入場予約状態管理クラス
// ============================================================================
class EntranceReservationStateManager {
    constructor() {
        // 実行状態
        this.executionState = ExecutionState.IDLE;
        // 対象管理
        this.reservationTarget = null;
        this.monitoringTargets = [];
        // 予約成功情報
        this.reservationSuccess = null;
        // 選択されたカレンダー日付
        this.selectedCalendarDate = null;
        // 優先度設定
        this.priorityMode = PriorityMode.AUTO;
        // 予約実行情報（旧entranceReservationStateから統合）
        this.reservationExecution = {
            shouldStop: false,
            startTime: null,
            attempts: 0
        };
        // 監視実行情報（旧timeSlotStateから統合）
        this.monitoringExecution = {
            retryCount: 0,
            maxRetries: 100,
            reloadInterval: 30000,
            monitoringInterval: null
        };
        // リロードカウントダウン状態管理（旧reloadCountdownStateから統合）
        this.reloadCountdown = {
            totalSeconds: 30,
            secondsRemaining: null,
            startTime: null,
            countdownInterval: null,
            reloadTimer: null
        };
        // ページ読み込み状態管理（旧pageLoadingStateから統合）
        this.pageLoading = {
            isLoading: false,
            startTime: null,
            timeout: 10000
        };
        // デバッグフラグ（本番環境では詳細ログを抑制）
        this.debugMode = true;
    }
    // ============================================================================
    // 実行状態管理
    // ============================================================================
    getExecutionState() {
        return this.executionState;
    }
    setExecutionState(state) {
        this.executionState = state;
        if (this.debugMode) {
            console.log(`[UnifiedState] 実行状態変更: ${state}`);
        }
    }
    startReservation() {
        if (this.executionState !== ExecutionState.IDLE) {
            this.log('⚠️ 予約開始失敗: 他の処理が実行中');
            return false;
        }
        if (!this.canStartReservation()) {
            this.log('⚠️ 予約開始失敗: 条件未満足');
            return false;
        }
        this.executionState = ExecutionState.RESERVATION_RUNNING;
        this.log('🚀 予約処理を開始');
        return true;
    }
    startMonitoring() {
        if (this.executionState !== ExecutionState.IDLE) {
            this.log('⚠️ 監視開始失敗: 他の処理が実行中');
            return false;
        }
        if (!this.canStartMonitoring()) {
            this.log('⚠️ 監視開始失敗: 監視対象なし');
            return false;
        }
        this.executionState = ExecutionState.MONITORING_RUNNING;
        this.log('👁️ 監視処理を開始');
        return true;
    }
    stop() {
        const prevState = this.executionState;
        this.executionState = ExecutionState.IDLE;
        switch (prevState) {
            case ExecutionState.RESERVATION_RUNNING:
                this.log('⏹️ 予約処理を停止');
                // 予約実行情報をリセット
                this.reservationExecution.shouldStop = false;
                this.reservationExecution.startTime = null;
                this.reservationExecution.attempts = 0;
                break;
            case ExecutionState.MONITORING_RUNNING:
                this.log('⏹️ 監視処理を停止');
                // 監視インターバルをクリア
                if (this.monitoringExecution.monitoringInterval) {
                    clearInterval(this.monitoringExecution.monitoringInterval);
                    this.monitoringExecution.monitoringInterval = null;
                }
                break;
        }
    }
    // ============================================================================
    // 予約実行情報管理（旧entranceReservationStateから統合）
    // ============================================================================
    // 予約実行開始
    startReservationExecution() {
        this.reservationExecution.shouldStop = false;
        this.reservationExecution.startTime = Date.now();
        this.reservationExecution.attempts = 0;
        this.log('🚀 予約実行情報を初期化');
    }
    // 予約中断フラグ設定
    setShouldStop(shouldStop) {
        this.reservationExecution.shouldStop = shouldStop;
        this.log(`🛑 予約中断フラグ: ${shouldStop}`);
    }
    // 予約中断フラグ取得
    getShouldStop() {
        return this.reservationExecution.shouldStop;
    }
    // 試行回数増加
    incrementAttempts() {
        this.reservationExecution.attempts++;
        this.log(`🔄 予約試行回数: ${this.reservationExecution.attempts}`);
    }
    // 試行回数取得
    getAttempts() {
        return this.reservationExecution.attempts;
    }
    // 予約開始時刻取得
    getReservationStartTime() {
        return this.reservationExecution.startTime;
    }
    // 予約実行中かどうか
    isReservationRunning() {
        return this.executionState === ExecutionState.RESERVATION_RUNNING;
    }
    // ============================================================================
    // 監視実行情報管理（旧timeSlotStateから統合）
    // ============================================================================
    // 監視実行中かどうか
    isMonitoringRunning() {
        return this.executionState === ExecutionState.MONITORING_RUNNING;
    }
    // リトライ回数増加
    incrementRetryCount() {
        this.monitoringExecution.retryCount++;
        this.log(`🔄 監視リトライ回数: ${this.monitoringExecution.retryCount}`);
    }
    // リトライ回数取得
    getRetryCount() {
        return this.monitoringExecution.retryCount;
    }
    // リトライ回数リセット
    resetRetryCount() {
        this.monitoringExecution.retryCount = 0;
        this.log('🔄 監視リトライ回数をリセット');
    }
    // 最大リトライ回数取得
    getMaxRetries() {
        return this.monitoringExecution.maxRetries;
    }
    // 監視インターバル設定
    setMonitoringInterval(intervalId) {
        this.monitoringExecution.monitoringInterval = intervalId;
        this.log(`⏰ 監視インターバル設定: ${intervalId}`);
    }
    // 監視インターバルクリア
    clearMonitoringInterval() {
        if (this.monitoringExecution.monitoringInterval) {
            clearInterval(this.monitoringExecution.monitoringInterval);
            this.monitoringExecution.monitoringInterval = null;
            this.log('⏰ 監視インターバルをクリア');
        }
    }
    // 監視インターバル取得
    getMonitoringInterval() {
        return this.monitoringExecution.monitoringInterval;
    }
    // ============================================================================
    // リロードカウントダウン管理（旧reloadCountdownStateから統合）
    // ============================================================================
    // リロードカウントダウン開始
    scheduleReload(seconds) {
        // 既存のカウントダウンをクリア
        this.stopReloadCountdown();
        this.reloadCountdown.totalSeconds = seconds;
        this.reloadCountdown.secondsRemaining = seconds;
        this.reloadCountdown.startTime = Date.now();
        this.log(`⏰ リロードカウントダウン開始: ${seconds}秒`);
        // リロードタイマー設定
        this.reloadCountdown.reloadTimer = window.setTimeout(() => {
            window.location.reload();
        }, seconds * 1000);
        // カウントダウンインターバル設定
        this.reloadCountdown.countdownInterval = window.setInterval(() => {
            if (this.reloadCountdown.secondsRemaining !== null) {
                this.reloadCountdown.secondsRemaining--;
                // FAB表示更新（グローバル関数を呼び出し）
                try {
                    if (typeof window !== 'undefined' && window.updateMainButtonDisplay) {
                        window.updateMainButtonDisplay(null, true);
                    }
                }
                catch (error) {
                    console.warn('UI更新の呼び出しに失敗:', error);
                }
                if (this.reloadCountdown.secondsRemaining <= 0) {
                    // カウントダウン完了
                    if (this.reloadCountdown.countdownInterval) {
                        clearInterval(this.reloadCountdown.countdownInterval);
                        this.reloadCountdown.countdownInterval = null;
                    }
                    this.reloadCountdown.secondsRemaining = null;
                }
            }
        }, 1000);
    }
    // リロードカウントダウン停止
    stopReloadCountdown() {
        if (this.reloadCountdown.countdownInterval) {
            clearInterval(this.reloadCountdown.countdownInterval);
            this.reloadCountdown.countdownInterval = null;
        }
        if (this.reloadCountdown.reloadTimer) {
            clearTimeout(this.reloadCountdown.reloadTimer);
            this.reloadCountdown.reloadTimer = null;
        }
        this.reloadCountdown.secondsRemaining = null;
        this.reloadCountdown.startTime = null;
        this.log('⏰ リロードカウントダウン停止');
    }
    // カウントダウン中かどうか
    isReloadCountdownActive() {
        return this.reloadCountdown.secondsRemaining !== null && this.reloadCountdown.secondsRemaining !== undefined;
    }
    // 残り秒数取得
    getReloadSecondsRemaining() {
        return this.reloadCountdown.secondsRemaining;
    }
    // リロード直前（3秒以内）かどうか
    isNearReload() {
        return this.isReloadCountdownActive() &&
            this.reloadCountdown.secondsRemaining !== null &&
            this.reloadCountdown.secondsRemaining <= 3;
    }
    // ============================================================================
    // ページ読み込み状態管理（旧pageLoadingStateから統合）
    // ============================================================================
    // ページ読み込み状態を設定
    setPageLoadingState(isLoading) {
        this.pageLoading.isLoading = isLoading;
        if (isLoading) {
            this.pageLoading.startTime = Date.now();
            this.log('📄 ページ読み込み開始');
        }
        else {
            this.pageLoading.startTime = null;
            this.log('📄 ページ読み込み完了');
        }
    }
    // ページ読み込み中かどうか
    isPageLoading() {
        return this.pageLoading.isLoading;
    }
    // ページ読み込み開始時刻取得
    getPageLoadingStartTime() {
        return this.pageLoading.startTime;
    }
    // ページ読み込みタイムアウト値取得
    getPageLoadingTimeout() {
        return this.pageLoading.timeout;
    }
    // ============================================================================
    // 対象管理
    // ============================================================================
    setReservationTarget(timeSlot, locationIndex, selector) {
        // selectorが未指定の場合は生成
        if (!selector) {
            const selectedSlot = document.querySelector(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotSelectors */ .eN.selectedSlot);
            if (selectedSlot) {
                const tdElement = selectedSlot.closest('td[data-gray-out]');
                selector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .generateUniqueTdSelector */ .sN)(tdElement);
            }
            else {
                this.log('⚠️ 予約対象設定失敗: DOM要素が見つからない');
                return;
            }
        }
        this.reservationTarget = {
            timeSlot,
            locationIndex,
            selector,
            isValid: true
        };
        this.log(`✅ 予約対象設定: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)}`);
    }
    // 指定した時間帯・位置が現在の予約対象かどうかを判定
    isReservationTarget(timeSlot, locationIndex) {
        if (!this.reservationTarget)
            return false;
        return this.reservationTarget.timeSlot === timeSlot &&
            this.reservationTarget.locationIndex === locationIndex;
    }
    // 指定した時間帯・位置が現在の監視対象かどうかを判定
    isMonitoringTarget(timeSlot, locationIndex) {
        return this.monitoringTargets.some(target => target.timeSlot === timeSlot && target.locationIndex === locationIndex);
    }
    clearReservationTarget() {
        if (this.reservationTarget) {
            const info = LocationHelper.formatTargetInfo(this.reservationTarget.timeSlot, this.reservationTarget.locationIndex);
            this.reservationTarget = null;
            this.log(`🗑️ 予約対象クリア: ${info}`);
            // 解除後の状態復帰ログ出力
            const hasMonitoringTargets = this.hasMonitoringTargets();
            const canMonitor = this.canStartMonitoring();
            const preferredAction = this.getPreferredAction();
            this.log(`🔄 予約対象解除後の状態:`);
            this.log(`  - 監視対象数: ${this.monitoringTargets.length}`);
            this.log(`  - 監視開始可能: ${canMonitor}`);
            this.log(`  - 推奨アクション: ${preferredAction}`);
            if (hasMonitoringTargets && preferredAction === 'monitoring') {
                this.log(`✅ 監視対象が残っているため「監視予約開始」状態に復帰`);
            }
            else if (hasMonitoringTargets && preferredAction !== 'monitoring') {
                this.log(`⚠️ 監視対象があるが推奨アクションが${preferredAction}になっています`);
            }
        }
    }
    addMonitoringTarget(timeSlot, locationIndex, selector) {
        const key = LocationHelper.generateTimeLocationKey(timeSlot, locationIndex);
        const existing = this.monitoringTargets.find(target => LocationHelper.generateTimeLocationKey(target.timeSlot, target.locationIndex) === key);
        if (existing) {
            this.log(`⚠️ 監視対象は既に存在: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)}`);
            return false;
        }
        const newTarget = {
            timeSlot,
            locationIndex,
            selector,
            priority: this.monitoringTargets.length + 1,
            status: 'full' // 通常満員の時間帯を監視対象にする
        };
        this.monitoringTargets.push(newTarget);
        this.log(`✅ 監視対象追加: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)} (優先度: ${newTarget.priority})`);
        // キャッシュに同期
        this.syncToCache();
        return true;
    }
    removeMonitoringTarget(timeSlot, locationIndex) {
        const key = LocationHelper.generateTimeLocationKey(timeSlot, locationIndex);
        const initialLength = this.monitoringTargets.length;
        this.monitoringTargets = this.monitoringTargets.filter(target => LocationHelper.generateTimeLocationKey(target.timeSlot, target.locationIndex) !== key);
        if (this.monitoringTargets.length < initialLength) {
            // 優先度を再計算
            this.monitoringTargets.forEach((target, index) => {
                target.priority = index + 1;
            });
            this.log(`✅ 監視対象削除: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)} (残り: ${this.monitoringTargets.length})`);
            // キャッシュに同期
            this.syncToCache();
            return true;
        }
        return false;
    }
    clearMonitoringTargets() {
        const count = this.monitoringTargets.length;
        this.monitoringTargets = [];
        this.log(`🗑️ 全監視対象クリア (${count}個)`);
        // キャッシュに同期
        this.syncToCache();
    }
    // ============================================================================
    // 状態判定
    // ============================================================================
    canStartReservation() {
        // 1. 予約対象の存在確認
        if (!this.reservationTarget || !this.reservationTarget.isValid) {
            return false;
        }
        // 2. 時間帯選択状態の確認
        const selectedSlot = document.querySelector(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotSelectors */ .eN.selectedSlot);
        if (!selectedSlot) {
            return false;
        }
        // 3. 選択時間帯の満員状態確認
        const tdElement = selectedSlot.closest('td[data-gray-out]');
        if (tdElement) {
            const status = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_0__/* .extractTdStatus */ .SE)(tdElement);
            if (status?.isFull) {
                return false;
            }
        }
        // 4. 来場日時ボタンの有効性確認（一時的に緩和）
        const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq');
        if (!visitTimeButton || visitTimeButton.disabled) {
            console.log(`⚠️ 来場日時ボタンが無効: exists=${!!visitTimeButton}, disabled=${visitTimeButton?.disabled}`);
            // 時間帯選択直後は来場日時ボタンの更新が遅延することがあるため、一時的に許可
            // return false;
        }
        // 5. カレンダー選択確認
        const selectedDate = (0,_entrance_page_ui__WEBPACK_IMPORTED_MODULE_1__/* .getCurrentSelectedCalendarDate */ .rY)();
        if (!selectedDate) {
            return false;
        }
        return true;
    }
    canStartMonitoring() {
        const result = this.monitoringTargets.length > 0;
        if (!result) {
            this.log(`❌ 監視開始不可: 監視対象数=${this.monitoringTargets.length}`);
        }
        return result;
    }
    canInterrupt() {
        return this.executionState !== ExecutionState.IDLE;
    }
    // ============================================================================
    // 優先度判定
    // ============================================================================
    getPreferredAction() {
        const canReserve = this.canStartReservation();
        const canMonitor = this.canStartMonitoring();
        switch (this.priorityMode) {
            case PriorityMode.FORCE_RESERVATION:
                return canReserve ? 'reservation' : 'none';
            case PriorityMode.FORCE_MONITORING:
                return canMonitor ? 'monitoring' : 'none';
            case PriorityMode.AUTO:
            default:
                // 予約優先（両方可能な場合は予約を選択）
                if (canReserve) {
                    return 'reservation';
                }
                if (canMonitor)
                    return 'monitoring';
                return 'none';
        }
    }
    setPriorityMode(mode) {
        this.priorityMode = mode;
        this.log(`🔧 優先度モード変更: ${mode}`);
    }
    // ============================================================================
    // 既存システムとの互換性
    // ============================================================================
    // 既存のmultiTargetManagerから監視対象を移行（現在は不要）
    migrateFromExisting() {
        this.log('🔄 既存システムから状態を移行中... (スキップ - 既にmultiTargetManagerは削除済み)');
    }
    // ============================================================================
    // UI連携用メソッド
    // ============================================================================
    getFabButtonState() {
        switch (this.executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                return 'running';
            case ExecutionState.MONITORING_RUNNING:
                return 'monitoring';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                return preferredAction !== 'none' ? 'enabled' : 'disabled';
        }
    }
    // FAB部分での予約対象情報表示用
    getFabTargetDisplayInfo() {
        console.log(`[UnifiedState] getFabTargetDisplayInfo 呼び出し - 予約対象: ${this.hasReservationTarget()}, 監視対象: ${this.hasMonitoringTargets()}`);
        // カレンダー選択日付を取得（MM/DD形式）
        const getDisplayDate = () => {
            if (this.selectedCalendarDate) {
                // YYYY-MM-DD形式からMM/DD形式に変換
                const parts = this.selectedCalendarDate.split('-');
                if (parts.length === 3) {
                    return `${parts[1]}/${parts[2]}`;
                }
            }
            // フォールバック: 現在日付
            const today = new Date();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            return `${month}/${day}`;
        };
        // 予約成功がある場合は成功情報を最優先表示
        if (this.hasReservationSuccess() && this.reservationSuccess) {
            const location = LocationHelper.getLocationFromIndex(this.reservationSuccess.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            const dateText = getDisplayDate();
            const displayText = `予約成功🎉(${dateText})\n${locationText}${this.reservationSuccess.timeSlot}`;
            console.log(`[UnifiedState] FAB予約成功表示テキスト: "${displayText}"`);
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'reservation'
            };
        }
        // 予約対象がある場合は予約情報を優先表示
        if (this.hasReservationTarget() && this.reservationTarget) {
            const location = LocationHelper.getLocationFromIndex(this.reservationTarget.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            const dateText = getDisplayDate();
            const displayText = `予約対象(${dateText})\n${locationText}${this.reservationTarget.timeSlot}`;
            console.log(`[UnifiedState] FAB予約対象表示テキスト: "${displayText}"`);
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'reservation'
            };
        }
        // 監視対象がある場合は監視対象を表示
        if (this.hasMonitoringTargets() && this.monitoringTargets.length > 0) {
            console.log(`[UnifiedState] getFabTargetDisplayInfo: 監視対象数=${this.monitoringTargets.length}`);
            console.log(`[UnifiedState] 監視対象詳細:`, this.monitoringTargets);
            // 優先度順にソート（priority昇順）
            const sortedTargets = [...this.monitoringTargets].sort((a, b) => a.priority - b.priority);
            const dateText = getDisplayDate();
            // 監視対象の表示（1件でも複数件でも統一形式）
            const targetTexts = sortedTargets.map(target => {
                const location = LocationHelper.getLocationFromIndex(target.locationIndex);
                const locationText = location === 'east' ? '東' : '西';
                const result = `${locationText}${target.timeSlot}`;
                console.log(`[UnifiedState] 監視対象→表示: ${JSON.stringify(target)} → "${result}"`);
                return result;
            });
            console.log(`[UnifiedState] targetTexts配列:`, targetTexts);
            const displayText = `監視対象(${dateText})\n${targetTexts.join('\n')}`;
            console.log(`[UnifiedState] FAB表示テキスト: "${displayText}"`);
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'monitoring'
            };
        }
        return {
            hasTarget: false,
            displayText: '',
            targetType: 'none'
        };
    }
    getFabButtonText() {
        switch (this.executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                return '予約\n中断';
            case ExecutionState.MONITORING_RUNNING:
                return '監視\n中断';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                switch (preferredAction) {
                    case 'reservation': return '予約\n開始';
                    case 'monitoring': return '監視\n開始';
                    default: return '待機中';
                }
        }
    }
    // ============================================================================
    // ゲッター
    // ============================================================================
    getReservationTarget() {
        return this.reservationTarget;
    }
    getMonitoringTargets() {
        return [...this.monitoringTargets];
    }
    hasReservationTarget() {
        return this.reservationTarget !== null && this.reservationTarget.isValid;
    }
    hasMonitoringTargets() {
        return this.monitoringTargets.length > 0;
    }
    getMonitoringTargetCount() {
        return this.monitoringTargets.length;
    }
    // 全ての対象をクリア（監視・予約両方）
    clearAllTargets() {
        const reservationCount = this.reservationTarget ? 1 : 0;
        const monitoringCount = this.monitoringTargets.length;
        this.reservationTarget = null;
        this.monitoringTargets = [];
        this.log(`🗑️ 全対象クリア - 予約: ${reservationCount}個, 監視: ${monitoringCount}個`);
    }
    // カレンダー日付の設定・取得
    setSelectedCalendarDate(date) {
        this.selectedCalendarDate = date;
        this.log(`📅 カレンダー日付設定: ${date}`);
    }
    getSelectedCalendarDate() {
        return this.selectedCalendarDate;
    }
    // 予約成功情報の設定・取得
    setReservationSuccess(timeSlot, locationIndex) {
        this.reservationSuccess = {
            timeSlot,
            locationIndex,
            successTime: new Date()
        };
        this.log(`🎉 予約成功情報設定: ${LocationHelper.formatTargetInfo(timeSlot, locationIndex)}`);
        // 成功時は予約対象と監視対象をクリア
        this.reservationTarget = null;
        this.monitoringTargets = [];
        this.log(`✅ 予約成功により対象をクリア`);
    }
    getReservationSuccess() {
        return this.reservationSuccess;
    }
    hasReservationSuccess() {
        return this.reservationSuccess !== null;
    }
    clearReservationSuccess() {
        if (this.reservationSuccess) {
            const info = LocationHelper.formatTargetInfo(this.reservationSuccess.timeSlot, this.reservationSuccess.locationIndex);
            this.reservationSuccess = null;
            this.log(`🗑️ 予約成功情報クリア: ${info}`);
        }
    }
    // ============================================================================
    // デバッグ・ログ
    // ============================================================================
    log(message) {
        if (this.debugMode) {
            console.log(`[UnifiedState] ${message}`);
        }
    }
    // キャッシュ同期
    syncToCache() {
        try {
            // cacheManagerが利用可能な場合のみ同期
            if (typeof window !== 'undefined' && window.cacheManager) {
                const cacheManager = window.cacheManager;
                // 現在の監視対象をキャッシュに保存
                const cacheData = this.monitoringTargets.map(target => ({
                    timeText: target.timeSlot,
                    tdSelector: target.selector,
                    locationIndex: target.locationIndex,
                    priority: target.priority
                }));
                cacheManager.saveTargetSlots(cacheData);
                this.log(`🔄 キャッシュ同期完了: ${cacheData.length}個の監視対象`);
            }
        }
        catch (error) {
            console.warn('⚠️ キャッシュ同期に失敗:', error);
        }
    }
    // デバッグ情報の出力
    debugInfo() {
        console.group('[UnifiedState] デバッグ情報');
        console.log('実行状態:', this.executionState);
        console.log('優先度モード:', this.priorityMode);
        console.log('予約対象:', this.reservationTarget);
        console.log('監視対象:', this.monitoringTargets);
        console.log('予約可能:', this.canStartReservation());
        console.log('監視可能:', this.canStartMonitoring());
        console.log('推奨アクション:', this.getPreferredAction());
        console.groupEnd();
    }
}
// 入場予約状態管理システムのシングルトンインスタンス
const entranceReservationStateManager = new EntranceReservationStateManager();


/***/ }),

/***/ 540:
/***/ ((module) => {



/* istanbul ignore next  */
function insertStyleElement(options) {
  var element = document.createElement("style");
  options.setAttributes(element, options.attributes);
  options.insert(element, options.options);
  return element;
}
module.exports = insertStyleElement;

/***/ }),

/***/ 601:
/***/ ((module) => {



module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ 659:
/***/ ((module) => {



var memo = {};

/* istanbul ignore next  */
function getTarget(target) {
  if (typeof memo[target] === "undefined") {
    var styleTarget = document.querySelector(target);

    // Special case to return head of iframe instead of iframe itself
    if (window.HTMLIFrameElement && styleTarget instanceof window.HTMLIFrameElement) {
      try {
        // This will throw an exception if access to iframe is blocked
        // due to cross-origin restrictions
        styleTarget = styleTarget.contentDocument.head;
      } catch (e) {
        // istanbul ignore next
        styleTarget = null;
      }
    }
    memo[target] = styleTarget;
  }
  return memo[target];
}

/* istanbul ignore next  */
function insertBySelector(insert, style) {
  var target = getTarget(insert);
  if (!target) {
    throw new Error("Couldn't find a style target. This probably means that the value for the 'insert' parameter is invalid.");
  }
  target.appendChild(style);
}
module.exports = insertBySelector;

/***/ }),

/***/ 825:
/***/ ((module) => {



/* istanbul ignore next  */
function apply(styleElement, options, obj) {
  var css = "";
  if (obj.supports) {
    css += "@supports (".concat(obj.supports, ") {");
  }
  if (obj.media) {
    css += "@media ".concat(obj.media, " {");
  }
  var needLayer = typeof obj.layer !== "undefined";
  if (needLayer) {
    css += "@layer".concat(obj.layer.length > 0 ? " ".concat(obj.layer) : "", " {");
  }
  css += obj.css;
  if (needLayer) {
    css += "}";
  }
  if (obj.media) {
    css += "}";
  }
  if (obj.supports) {
    css += "}";
  }
  var sourceMap = obj.sourceMap;
  if (sourceMap && typeof btoa !== "undefined") {
    css += "\n/*# sourceMappingURL=data:application/json;base64,".concat(btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))), " */");
  }

  // For old IE
  /* istanbul ignore if  */
  options.styleTagTransform(css, styleElement, options.options);
}
function removeStyleElement(styleElement) {
  // istanbul ignore if
  if (styleElement.parentNode === null) {
    return false;
  }
  styleElement.parentNode.removeChild(styleElement);
}

/* istanbul ignore next  */
function domAPI(options) {
  if (typeof document === "undefined") {
    return {
      update: function update() {},
      remove: function remove() {}
    };
  }
  var styleElement = options.insertStyleElement(options);
  return {
    update: function update(obj) {
      apply(styleElement, options, obj);
    },
    remove: function remove() {
      removeStyleElement(styleElement);
    }
  };
}
module.exports = domAPI;

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
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
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
/******/ 	/* webpack/runtime/nonce */
/******/ 	(() => {
/******/ 		__webpack_require__.nc = undefined;
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};

// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/injectStylesIntoStyleTag.js
var injectStylesIntoStyleTag = __webpack_require__(72);
var injectStylesIntoStyleTag_default = /*#__PURE__*/__webpack_require__.n(injectStylesIntoStyleTag);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleDomAPI.js
var styleDomAPI = __webpack_require__(825);
var styleDomAPI_default = /*#__PURE__*/__webpack_require__.n(styleDomAPI);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertBySelector.js
var insertBySelector = __webpack_require__(659);
var insertBySelector_default = /*#__PURE__*/__webpack_require__.n(insertBySelector);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/setAttributesWithoutAttributes.js
var setAttributesWithoutAttributes = __webpack_require__(56);
var setAttributesWithoutAttributes_default = /*#__PURE__*/__webpack_require__.n(setAttributesWithoutAttributes);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/insertStyleElement.js
var insertStyleElement = __webpack_require__(540);
var insertStyleElement_default = /*#__PURE__*/__webpack_require__.n(insertStyleElement);
// EXTERNAL MODULE: ./node_modules/style-loader/dist/runtime/styleTagTransform.js
var styleTagTransform = __webpack_require__(113);
var styleTagTransform_default = /*#__PURE__*/__webpack_require__.n(styleTagTransform);
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./src-styles/main.scss
var main = __webpack_require__(270);
;// ./src-styles/main.scss

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());
options.insert = insertBySelector_default().bind(null, "head");
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(main/* default */.A, options);




       /* harmony default export */ const src_styles_main = (main/* default */.A && main/* default */.A.locals ? main/* default */.A.locals : undefined);

;// ./src-modules/pavilion-search-page.ts
// 【1. 基本機能・ユーティリティ】
// ============================================================================
// スタイルのインポート

// SCSSファイルからスタイルが自動的にインポートされるため、insert_style関数は不要
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
            const orIndex = parts.findIndex((part) => part === '\uFFFF');
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
    // ヘッダーにFAB切替ボタンを追加（DOM構築完了を待つ）
    setTimeout(() => {
        Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 278)).then((entrancePageState) => {
            entrancePageState.createFABToggleButton();
        });
    }, 1000);
    // すべて読み込みボタンの自動クリック処理
    const load_more_auto = async () => {
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const arr_btn = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        console.log(`🔄 load_more_auto実行: もっと見るボタン${arr_btn.length}個`);
        if (arr_btn.length > 0) {
            // 件数変化をログ出力
            const beforeCounts = getItemCounts();
            console.log(`📊 クリック前の件数: ${beforeCounts.visible}/${beforeCounts.total}`);
            arr_btn[0].click();
            // 件数表示を継続的に更新（読み込み速度に影響しない）
            const updateInterval = setInterval(() => {
                if (window.updatePavilionCounts) {
                    window.updatePavilionCounts();
                }
            }, 200);
            setTimeout(() => {
                scrollTo(scrollX, scrollY);
                // 件数変化をログ出力
                const afterCounts = getItemCounts();
                console.log(`📊 クリック後の件数: ${afterCounts.visible}/${afterCounts.total}`);
                // 次の読み込みを即座に実行
                clearInterval(updateInterval);
                load_more_auto();
            }, 500);
        }
        else {
            console.log(`✅ load_more_auto完了: もっと見るボタンがありません`);
            // 完了時にも件数表示を更新
            if (window.updatePavilionCounts) {
                window.updatePavilionCounts();
                console.log(`📊 完了時の件数表示を更新`);
            }
        }
    };
    // 件数をカウントする関数
    const getItemCounts = () => {
        const allItems = document.querySelectorAll("div.style_search_item_row__moqWC");
        const visibleItems = document.querySelectorAll("div.style_search_item_row__moqWC:not(.safe-none):not(.ytomo-none):not(.filter-none)");
        return {
            total: allItems.length,
            visible: visibleItems.length
        };
    };
    // 空きありパビリオン数をカウントする関数
    const getAvailableItemCounts = () => {
        const allItems = document.querySelectorAll("div.style_search_item_row__moqWC");
        // 空きありのパビリオン（calendar_none.svgがないもの）
        const availableItems = document.querySelectorAll("div.style_search_item_row__moqWC:not(:has(img[src*=\"/asset/img/calendar_none.svg\"]))");
        return {
            total: allItems.length,
            available: availableItems.length
        };
    };
    // 「空きのみ」ボタンのテキストを更新する関数
    const updateFilterSafeButtonText = () => {
        const filterSafeButtons = document.querySelectorAll("button.btn-filter-safe");
        const counts = getAvailableItemCounts();
        filterSafeButtons.forEach((btn) => {
            const button = btn;
            const baseText = '空きのみ';
            const newText = `${baseText}(${counts.available})`;
            button.textContent = newText;
        });
    };
    // 「もっと見る」ボタンの存在をチェックする関数
    const hasMoreButton = () => {
        // 全ての「もっと見る」ボタンをチェック（disabled含む）
        const allMoreButtons = document.querySelectorAll("button.style_more_btn__ymb22");
        const enabledMoreButtons = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        console.log(`🔍 もっと見るボタンチェック: 全体${allMoreButtons.length}個, 有効${enabledMoreButtons.length}個`);
        allMoreButtons.forEach((btn, index) => {
            console.log(`  ボタン${index + 1}: disabled=${btn.hasAttribute('disabled')}, text="${btn.textContent?.trim()}"`);
        });
        // 有効な「もっと見る」ボタンがある場合のみtrue
        return enabledMoreButtons.length > 0;
    };
    // 「すべて読み込み」ボタンの状態を更新する関数
    const updateLoadAllButtonState = () => {
        const loadAllButtons = document.querySelectorAll("button.btn-load-all");
        const hasMore = hasMoreButton();
        const isLoading = document.querySelectorAll("button.btn-load-all.btn-loading").length > 0;
        console.log(`🔧 すべて読み込みボタン状態更新: もっと見るボタン=${hasMore ? 'あり' : 'なし'}, 実行中=${isLoading}`);
        loadAllButtons.forEach((btn, index) => {
            const button = btn;
            console.log(`  ボタン${index + 1}: 更新前 disabled=${button.disabled}, classes=${button.className}`);
            // 実行中の場合は強制的にdisabled状態にする
            if (isLoading) {
                button.disabled = true;
                button.classList.remove("btn-enabled");
                button.classList.add("btn-disabled");
                console.log(`  → 実行中のため無効化: disabled=${button.disabled}, classes=${button.className}`);
                return;
            }
            if (hasMore) {
                button.disabled = false;
                button.classList.remove("btn-done", "btn-disabled", "btn-loading");
                button.classList.add("btn-enabled");
                console.log(`  → 有効化: disabled=${button.disabled}, classes=${button.className}`);
            }
            else {
                button.disabled = true;
                button.classList.remove("btn-enabled", "btn-loading");
                button.classList.add("btn-done", "btn-disabled");
                console.log(`  → 無効化: disabled=${button.disabled}, classes=${button.className}`);
            }
        });
    };
    // パビリオン用FABボタンを作成する関数
    const createPavilionFAB = () => {
        // 既存のFABがあるかチェック
        const existingFab = document.getElementById('ytomo-pavilion-fab-container');
        if (existingFab) {
            return; // 既に存在する場合は何もしない
        }
        // FABコンテナを作成（右下固定、入場予約FABと同じスタイル）
        const fabContainer = document.createElement('div');
        fabContainer.id = 'ytomo-pavilion-fab-container';
        fabContainer.classList.add('ytomo-pavilion-fab-container', 'ytomo-pavilion-fab');
        // メインFABボタンを作成（入場予約FABと同じスタイル）
        const fabButton = document.createElement('button');
        fabButton.id = 'ytomo-pavilion-fab-button';
        fabButton.classList.add('ext-ytomo', 'ytomo-fab', 'ytomo-fab-enabled');
        // FABボタンの内容構造（縦配置）
        const fabContent = document.createElement('div');
        fabContent.classList.add('ytomo-fab-inner-content');
        // 展開/縮小アイコン（上部）
        const expandIcon = document.createElement('div');
        expandIcon.className = 'pavilion-fab-expand-icon';
        expandIcon.innerHTML = '▲'; // 初期は縮小状態（展開可能）
        // YTomoテキスト（中央）- 小さく控えめに
        const brandText = document.createElement('div');
        brandText.className = 'pavilion-fab-brand-text';
        brandText.innerText = 'YTomo';
        // 件数表示（下部）- 大きく目立つように
        const countsText = document.createElement('div');
        countsText.className = 'pavilion-fab-counts-text';
        countsText.innerText = '0/0'; // 初期値、後で更新
        // DOM構築
        fabContent.appendChild(expandIcon);
        fabContent.appendChild(brandText);
        fabContent.appendChild(countsText);
        fabButton.appendChild(fabContent);
        // FABボタンにrelative positionを設定
        fabButton.style.position = 'relative';
        // 件数表示を更新する関数（FABボタン内に表示）
        const updateCountsDisplay = () => {
            const counts = getItemCounts();
            countsText.innerText = `${counts.visible}/${counts.total}`;
            console.log(`📊 件数表示更新: ${counts.visible}/${counts.total}`);
            // 「空きのみ」ボタンのテキストも更新
            updateFilterSafeButtonText();
        };
        // サブアクションボタンコンテナ
        const subActionsContainer = document.createElement('div');
        subActionsContainer.id = 'pavilion-sub-actions';
        subActionsContainer.className = 'pavilion-sub-actions-container';
        // サブアクションボタンの作成
        const createSubButton = (text, className) => {
            const btn = document.createElement('button');
            btn.classList.add('ext-ytomo', 'pavilion-sub-btn', 'base-style', className, 'btn-enabled');
            btn.textContent = text;
            return btn;
        };
        const btnLoadAll = createSubButton('すべて読み込み', 'btn-load-all');
        const btnFilterSafe = createSubButton('空きのみ', 'btn-filter-safe');
        const btnAlertToCopy = createSubButton('一覧コピー', 'btn-alert-to-copy');
        // DOM構築
        subActionsContainer.appendChild(btnLoadAll);
        subActionsContainer.appendChild(btnFilterSafe);
        subActionsContainer.appendChild(btnAlertToCopy);
        fabContainer.appendChild(subActionsContainer);
        fabContainer.appendChild(fabButton);
        // FABの開閉制御（デフォルトで展開）
        let isExpanded = true; // デフォルトで展開状態
        // 初期状態を展開に設定
        subActionsContainer.classList.add('expanded');
        expandIcon.innerHTML = '▼'; // 展開状態（縮小可能）
        fabButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isExpanded = !isExpanded;
            if (isExpanded) {
                subActionsContainer.classList.add('expanded');
                expandIcon.innerHTML = '▼'; // 展開状態（縮小可能）
            }
            else {
                subActionsContainer.classList.remove('expanded');
                expandIcon.innerHTML = '▲'; // 縮小状態（展開可能）
                updateCountsDisplay(); // 閉じる時に件数を更新して表示
            }
        });
        // 初期件数表示
        updateCountsDisplay();
        document.body.appendChild(fabContainer);
        // FABに件数更新関数を公開
        window.updatePavilionCounts = updateCountsDisplay;
        // DOMの変化を監視してボタンの状態を自動更新
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            mutations.forEach((mutation) => {
                // 「もっと見る」ボタンの変化を検知
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'disabled' &&
                    mutation.target instanceof Element &&
                    mutation.target.classList.contains('style_more_btn__ymb22')) {
                    shouldUpdate = true;
                    console.log('📍 もっと見るボタンのdisabled属性変化を検知');
                }
                // 新しい「もっと見る」ボタンの追加/削除を検知
                if (mutation.type === 'childList') {
                    let shouldUpdateCounts = false;
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            const moreButtons = node.querySelectorAll('button.style_more_btn__ymb22');
                            if (moreButtons.length > 0) {
                                shouldUpdate = true;
                                console.log('📍 新しいもっと見るボタンの追加を検知');
                            }
                            // 検索アイテムの追加を検知
                            const searchItems = node.querySelectorAll('div.style_search_item_row__moqWC');
                            if (searchItems.length > 0) {
                                shouldUpdateCounts = true;
                                console.log('📍 新しい検索アイテムの追加を検知');
                            }
                        }
                    });
                    mutation.removedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            const moreButtons = node.querySelectorAll('button.style_more_btn__ymb22');
                            if (moreButtons.length > 0) {
                                shouldUpdate = true;
                                console.log('📍 もっと見るボタンの削除を検知');
                            }
                        }
                    });
                    if (shouldUpdateCounts) {
                        setTimeout(() => {
                            updateCountsDisplay();
                        }, 100);
                    }
                }
                // class属性の変化を検知（フィルタリング用）
                if (mutation.type === 'attributes' &&
                    mutation.attributeName === 'class' &&
                    mutation.target instanceof Element &&
                    mutation.target.classList.contains('style_search_item_row__moqWC')) {
                    setTimeout(() => {
                        updateCountsDisplay();
                    }, 50);
                }
            });
            if (shouldUpdate) {
                // 少し遅延を入れてDOM更新完了を待つ
                setTimeout(() => {
                    updateLoadAllButtonState();
                }, 100);
            }
        });
        // 監視開始
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled']
        });
        // 初期状態で「すべて読み込み」ボタンの状態を設定
        setTimeout(() => {
            updateLoadAllButtonState();
        }, 1000);
    };
    // const refresh_btn_ = () => {
    // }
    // 元の検索入力欄を追加する関数
    const insert_search_input = () => {
        const div_official_search = document.querySelector("div.style_search__7HKSe");
        const div_insert = document.createElement("div");
        div_insert.classList.add("div-flex");
        const input_another_search = document.createElement("input");
        input_another_search.classList.add("ext-tomo");
        input_another_search.classList.add("search");
        input_another_search.setAttribute("type", "text");
        input_another_search.setAttribute("placeholder", "読み込みなし絞込");
        const btn_filter_without_load = document.createElement("button");
        btn_filter_without_load.classList.add("basic-btn", "type2", "no-after", "ext-ytomo", "btn-filter-without-load");
        btn_filter_without_load.style.cssText = `
            height: auto;
            min-height: 40px;
            width: auto;
            min-width: 60px;
            padding: 0px 8px;
            color: white;
            margin: 5px;
            background: rgb(0, 104, 33) !important;
        `;
        const span_filter_without_load = document.createElement("span");
        span_filter_without_load.classList.add("ext-ytomo");
        span_filter_without_load.innerText = "絞込";
        btn_filter_without_load.appendChild(span_filter_without_load);
        div_insert.appendChild(input_another_search);
        div_insert.appendChild(btn_filter_without_load);
        if (div_official_search) {
            div_official_search.after(div_insert);
        }
    };
    insert_search_input();
    createPavilionFAB();
    // 状態更新関数をグローバルに公開
    window.updateLoadAllButtonState = updateLoadAllButtonState;
    // ページ読み込み完了後に状態をチェック（複数回、より頻繁に）
    const checkIntervals = [500, 1000, 2000, 3000, 5000];
    checkIntervals.forEach((delay, index) => {
        setTimeout(() => {
            console.log(`🕐 状態チェック${index + 1} (${delay}ms後)`);
            updateLoadAllButtonState();
            // 件数表示も更新
            if (window.updatePavilionCounts) {
                window.updatePavilionCounts();
            }
        }, delay);
    });
    // DOM Content Loadedイベント後にもチェック
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📋 DOMContentLoaded後の状態チェック');
            setTimeout(() => {
                updateLoadAllButtonState();
            }, 100);
        });
    }
    // 独自ボタンのクリックイベントハンドラ
    document.addEventListener("click", (event) => {
        if (event.target?.matches?.("button.ext-ytomo, button.ext-ytomo *, button.pavilion-sub-btn, button.pavilion-sub-btn *")) {
            const target = event.target?.closest?.("button.ext-ytomo, button.pavilion-sub-btn");
            if (target && target.classList.contains("btn-load-all")) {
                // すべて読み込み
                const button = target;
                console.log('🚀 すべて読み込み開始');
                console.log(`🔧 クリック対象ボタン:`, button);
                console.log(`🔧 実行前の状態: disabled=${button.disabled}, classes=${button.className}`);
                // 既に実行中の場合は何もしない
                if (button.classList.contains("btn-loading")) {
                    console.log('⚠️ すでに実行中のため無視');
                    return;
                }
                // 実行中は強制的にdisabled & 専用クラス設定
                button.disabled = true;
                button.classList.remove("btn-enabled");
                button.classList.add("btn-disabled", "btn-loading");
                console.log(`🔧 実行開始時の状態設定完了: disabled=${button.disabled}, classes=${button.className}`);
                console.log(`🔧 実際のHTML disabled属性:`, button.hasAttribute('disabled'));
                console.log(`🔧 computedStyle background:`, window.getComputedStyle(button).backgroundColor);
                // 強制的にCSS再適用
                button.style.background = 'rgb(128, 128, 128)';
                button.style.cursor = 'not-allowed';
                console.log(`🔧 強制スタイル適用後:`, button.style.cssText);
                // 他の「すべて読み込み」ボタンも同時に無効化
                document.querySelectorAll("button.btn-load-all").forEach((btn) => {
                    if (btn !== button) {
                        const otherBtn = btn;
                        otherBtn.disabled = true;
                        btn.classList.remove("btn-enabled");
                        btn.classList.add("btn-disabled", "btn-loading");
                    }
                });
                load_more_auto().then(() => {
                    console.log('✅ すべて読み込み完了');
                    // 全ての「すべて読み込み」ボタンのloading状態を解除
                    document.querySelectorAll("button.btn-load-all").forEach((btn) => {
                        const loadBtn = btn;
                        btn.classList.remove("btn-loading");
                        // loading解除と同時にdisabledも一旦解除
                        loadBtn.disabled = false;
                    });
                    // 処理完了後に正しい状態をチェック
                    setTimeout(() => {
                        updateLoadAllButtonState();
                    }, 100);
                });
            }
            else if (target && target.classList.contains("btn-filter-safe")) {
                // 空きあり絞り込み
                target.disabled = true;
                target.classList.toggle("btn-done");
                document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])").forEach((div) => {
                    div.classList.toggle("safe-none");
                });
                setTimeout(() => {
                    if (target) {
                        target.disabled = false;
                    }
                }, 500);
            }
            else if (target && target.classList.contains("btn-filter-without-load")) {
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
                if (target) {
                    target.disabled = false;
                }
            }
            else if (target && target.classList.contains("btn-alert-to-copy")) {
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


// EXTERNAL MODULE: ./src-modules/entrance-page-state.ts
var entrance_page_state = __webpack_require__(278);
// EXTERNAL MODULE: ./src-modules/entrance-reservation-state-manager.ts
var entrance_reservation_state_manager = __webpack_require__(461);
;// ./src-modules/cache-manager.ts
// entrance-page-stateからのimport
// import { timeSlotState } from './entrance-page-state'; // 統合により不要
// unified-stateからの直接インポート

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
                if (!entrance_reservation_state_manager/* entranceReservationStateManager */.xx)
                    return;
                const targets = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getMonitoringTargets();
                if (targets.length === 0)
                    return;
                // 現在選択されているカレンダー日付を取得
                const selectedCalendarDate = getCurrentSelectedCalendarDateFn ? getCurrentSelectedCalendarDateFn() : null;
                const data = {
                    targets: targets.map((target) => ({
                        timeText: target.timeSlot,
                        tdSelector: target.selector,
                        positionInfo: target.positionInfo || {},
                        status: target.status || 'unknown',
                        locationIndex: target.locationIndex
                    })),
                    selectedDate: selectedCalendarDate,
                    timestamp: Date.now(),
                    url: window.location.href,
                    retryCount: entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getRetryCount() || 0
                };
                localStorage.setItem(this.generateKey('target_slots'), JSON.stringify(data));
                const targetTexts = targets.map((t) => t.timeSlot).join(', ');
                console.log(`✅ 複数監視対象をキャッシュに保存: ${targetTexts} (${targets.length}個)`);
            }
            catch (error) {
                console.error('❌ 複数監視対象保存エラー:', error);
            }
        },
        // 後方互換性のため残す
        saveTargetSlot(_slotInfo) {
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
                const key = 'expo2025_monitoring_flag';
                localStorage.setItem(key, JSON.stringify(data));
                console.log(`🏃 監視継続フラグを設定: ${isActive}`);
                console.log(`🔑 フラグ保存キー: ${key}`);
                console.log(`💾 フラグ保存データ: ${JSON.stringify(data)}`);
                // 保存確認
                const saved = localStorage.getItem(key);
                console.log(`✅ フラグ保存確認: ${saved ? '成功' : '失敗'}`);
            }
            catch (error) {
                console.error('❌ 監視フラグ設定エラー:', error);
            }
        },
        // 監視継続フラグを取得し、即座にfalseに設定（暴走防止）
        getAndClearMonitoringFlag() {
            try {
                const key = 'expo2025_monitoring_flag';
                const data = localStorage.getItem(key);
                console.log(`🔑 フラグ取得キー: ${key}`);
                console.log(`📥 フラグ取得データ: ${data || 'null'}`);
                if (!data) {
                    console.log('❌ 監視継続フラグが見つかりません');
                    return false;
                }
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
                localStorage.removeItem('expo2025_monitoring_flag');
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

// EXTERNAL MODULE: ./src-modules/entrance-page-dom-utils.ts
var entrance_page_dom_utils = __webpack_require__(115);
// EXTERNAL MODULE: ./src-modules/entrance-page-monitor.ts
var entrance_page_monitor = __webpack_require__(429);
// EXTERNAL MODULE: ./src-modules/entrance-page-ui.ts
var entrance_page_ui = __webpack_require__(213);
;// ./src-modules/entrance-page-fab.ts
// pavilion-search-pageからのimport

// entrance-page-stateからのimport

// entrance-page-dom-utilsからのimport

// entrance-page-monitorからのimport

// unified-stateからのimport

// Section 6からのimport  

// 【7. FAB・メインUI】
// ============================================================================
// 依存注入用のcacheManager参照
let cacheManager = null;
// cacheManagerを設定するヘルパー関数
const setCacheManagerForSection7 = (cm) => {
    cacheManager = cm;
};
// ステータス表示用のヘルパー関数
function showStatus(message, color = 'white') {
    const statusBadge = document.querySelector('#ytomo-status-badge');
    if (!statusBadge)
        return;
    statusBadge.innerText = message;
    statusBadge.style.background = color === 'green' ? 'rgba(0, 128, 0, 0.9)' :
        color === 'red' ? 'rgba(255, 0, 0, 0.9)' :
            color === 'orange' ? 'rgba(255, 140, 0, 0.9)' :
                color === 'blue' ? 'rgba(0, 104, 33, 0.9)' :
                    'rgba(0, 0, 0, 0.8)';
    statusBadge.classList.remove('js-hide');
    // 一定時間後に自動で隠す（エラー、成功、中断メッセージ以外）
    if (color !== 'red' && color !== 'green' && color !== 'orange') {
        setTimeout(() => {
            statusBadge.classList.add('js-hide');
        }, 3000);
    }
}
function createEntranceReservationUI(config) {
    // 既存のFABがあれば削除
    const existingFab = document.getElementById('ytomo-fab-container');
    if (existingFab) {
        existingFab.remove();
    }
    // FABコンテナを作成（右下固定）
    const fabContainer = document.createElement('div');
    fabContainer.id = 'ytomo-fab-container';
    fabContainer.style.cssText = `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 10000 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        align-items: flex-end !important;
        pointer-events: auto !important;
    `;
    // メインFABボタンを作成
    const fabButton = document.createElement('button');
    fabButton.id = 'ytomo-main-fab';
    fabButton.classList.add('ext-ytomo', 'ytomo-fab', 'ytomo-fab-disabled');
    // FABボタンのテキスト/アイコン
    const fabIcon = document.createElement('span');
    fabIcon.classList.add('ext-ytomo');
    fabIcon.style.cssText = `
        font-size: 12px !important;
        text-align: center !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        pointer-events: none !important;
    `;
    fabIcon.innerText = '待機中';
    fabButton.appendChild(fabIcon);
    // FABボタンにrelative positionを設定（折りたたみボタン配置用）
    fabButton.style.position = 'relative';
    // 初期状態は ytomo-fab-disabled クラスで制御
    // ホバー効果（強化版）
    fabButton.addEventListener('mouseenter', () => {
        fabButton.style.transform = 'scale(1.15)';
        fabButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)';
        fabButton.style.borderWidth = '4px';
    });
    fabButton.addEventListener('mouseleave', () => {
        fabButton.style.transform = 'scale(1)';
        fabButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)';
        fabButton.style.borderWidth = '3px';
    });
    // 予約対象情報表示エリア（新規追加）
    const reservationTargetDisplay = document.createElement('div');
    reservationTargetDisplay.id = 'ytomo-reservation-target';
    reservationTargetDisplay.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 123, 255, 0.95), rgba(0, 86, 179, 0.95)) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 12px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        text-align: center !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        min-width: 80px !important;
        max-width: 120px !important;
        display: none !important;
        white-space: pre-line !important;
        overflow: visible !important;
        text-overflow: clip !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    `;
    reservationTargetDisplay.title = '予約対象（クリックで詳細表示）';
    // 監視対象表示エリア（目立つ表示）
    const monitoringTargetsDisplay = document.createElement('div');
    monitoringTargetsDisplay.id = 'ytomo-monitoring-targets';
    monitoringTargetsDisplay.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 104, 33, 0.95), rgba(0, 150, 50, 0.95)) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 12px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        text-align: center !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        min-width: 80px !important;
        max-width: 120px !important;
        display: none !important;
        white-space: pre-line !important;
        overflow: visible !important;
        text-overflow: clip !important;
        pointer-events: auto !important;
        cursor: pointer !important;
        transition: all 0.3s ease !important;
    `;
    monitoringTargetsDisplay.title = 'クリックで詳細表示';
    // ホバー効果
    monitoringTargetsDisplay.addEventListener('mouseenter', () => {
        monitoringTargetsDisplay.style.transform = 'scale(1.05)';
        monitoringTargetsDisplay.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.4)';
    });
    monitoringTargetsDisplay.addEventListener('mouseleave', () => {
        monitoringTargetsDisplay.style.transform = 'scale(1)';
        monitoringTargetsDisplay.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.3)';
    });
    // ステータス表示（コンパクト）
    const statusBadge = document.createElement('div');
    statusBadge.id = 'ytomo-status-badge';
    statusBadge.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9)) !important;
        color: white !important;
        padding: 8px 16px !important;
        border-radius: 20px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        white-space: pre-line !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3), 0 2px 6px rgba(0, 0, 0, 0.2) !important;
        border: 2px solid rgba(255, 255, 255, 0.15) !important;
        display: none !important;
        pointer-events: none !important;
        text-align: center !important;
        line-height: 1.3 !important;
    `;
    statusBadge.innerText = '待機中';
    // メインFABボタンにイベントリスナーを設定
    fabButton.addEventListener('click', async (event) => {
        // disabled状態の場合はクリックを完全に無視
        if (fabButton.disabled || fabButton.hasAttribute('disabled')) {
            // ボタンdisabledのためクリック無視
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        // 追加のstyle確認（CSS disabled状態もチェック）
        if (fabButton.style.pointerEvents === 'none') {
            // pointer-events:noneのためクリック無視
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        // 中断不可期間のチェック
        if (!(0,entrance_page_ui/* isInterruptionAllowed */.Is)()) {
            // リロード直前のため中断不可
            showStatus('リロード直前のため中断できません', 'red');
            return;
        }
        // 実行中の場合は中断処理（入場予約状態管理システム使用）
        if (entrance_reservation_state_manager/* entranceReservationStateManager */.xx.isMonitoringRunning()) {
            // 監視を中断
            (0,entrance_page_ui/* stopSlotMonitoring */.XG)();
            // ステータスは中断を示すメッセージを表示（消さない）
            showStatus('監視中断', 'orange');
            (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
            return;
        }
        if (entrance_reservation_state_manager/* entranceReservationStateManager */.xx.isReservationRunning()) {
            // スマホ用：現在の状態をアラート表示
            const startTime = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getReservationStartTime();
            const attempts = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getAttempts();
            const shouldStop = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getShouldStop();
            const debugInfo = `予約状態確認:
isRunning: ${entrance_reservation_state_manager/* entranceReservationStateManager */.xx.isReservationRunning()}
shouldStop: ${shouldStop}
startTime: ${startTime}
attempts: ${attempts}`;
            if (confirm(`[DEBUG] 予約処理を中断しますか？\n\n${debugInfo}`)) {
                // 予約処理を中断
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setShouldStop(true);
                showStatus('予約処理を中断中...', 'orange');
            }
            else {
                // 強制リセット（デバッグ用） - 統一状態管理システム経由
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.stop();
                alert('状態をリセットしました。もう一度お試しください。');
            }
            return;
        }
        // 入場予約状態管理システムを使用した監視開始判定
        const preferredAction = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getPreferredAction();
        // FABクリック処理開始
        if (preferredAction === 'monitoring') {
            console.log('📡 入場予約状態管理システムによる監視開始');
            // 実行状態を監視中に変更
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.startMonitoring();
            // 即座にUI更新してから監視開始
            (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
            await (0,entrance_page_monitor/* startSlotMonitoring */.fp)();
            return;
        }
        else if (preferredAction === 'reservation') {
            console.log('🚀 入場予約状態管理システムによる予約開始');
            // 予約処理は下の通常処理で実行
        }
        else {
            console.log('⚠️ 入場予約状態管理システム: 実行可能なアクションなし');
            return;
        }
        // 入場予約状態管理システムで予約実行開始
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setExecutionState(entrance_reservation_state_manager/* ExecutionState */.si.RESERVATION_RUNNING);
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.startReservationExecution();
        showStatus('予約処理実行中...', 'blue');
        (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
        updateMonitoringTargetsDisplay(); // 予約対象を表示
        try {
            const result = await entranceReservationHelper(config);
            if (result.success) {
                showStatus(`🎉 予約成功！(${result.attempts}回試行)`, 'green');
                // 入場予約状態管理に予約成功情報を設定
                const reservationTarget = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getReservationTarget();
                if (reservationTarget) {
                    entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                    (0,entrance_page_ui/* updateMainButtonDisplay */.vp)(); // FAB表示更新
                }
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                    cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                }
            }
            else {
                showStatus(`予約失敗 (${result.attempts}回試行)`, 'red');
            }
        }
        catch (error) {
            console.error('予約処理エラー:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            showStatus(`エラー: ${errorMessage}`, 'red');
        }
        finally {
            // 入場予約状態管理システムで予約実行終了
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.stop();
            (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
            updateMonitoringTargetsDisplay(); // 予約終了時に表示更新
        }
        return; // 明示的なreturnを追加
    });
    // disabled状態でのクリックを確実に防ぐため、キャプチャーフェーズでも処理
    fabButton.addEventListener('click', (event) => {
        if (fabButton.disabled || fabButton.hasAttribute('disabled') || fabButton.style.pointerEvents === 'none') {
            console.log('🚫 キャプチャーフェーズでdisabledクリックを阻止');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        return; // 明示的なreturnを追加
    }, true); // useCapture = true
    // FABコンテナに要素を追加（上から順：予約対象→監視対象→ステータス→ボタン）
    fabContainer.appendChild(reservationTargetDisplay);
    fabContainer.appendChild(monitoringTargetsDisplay);
    fabContainer.appendChild(statusBadge);
    fabContainer.appendChild(fabButton);
    // DOMに追加（body直下）
    document.body.appendChild(fabContainer);
    // FAB表示状態を初期化・適用
    (0,entrance_page_state.loadFABVisibility)();
    (0,entrance_page_state.updateFABVisibility)();
    // 初期状態を判定してFABを更新
    waitForTimeSlotTable(() => {
        checkInitialState();
    });
    // カレンダー変更監視を開始
    startCalendarWatcher();
    // 時間帯クリックハンドラーを設定（選択解除機能付き）
    waitForTimeSlotTable(() => {
        setupTimeSlotClickHandlers();
    });
}
// 監視対象表示を更新（入場予約状態管理システムに委譲）
function updateMonitoringTargetsDisplay() {
    // 入場予約状態管理システムのupdateMainButtonDisplay()に委譲
    // これにより重複表示を回避し、一貫した表示を実現
    (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
}
// 現在の予約対象時間帯を取得
function getCurrentReservationTarget() {
    // 選択された時間帯を探す
    const selectedSlot = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
    if (!selectedSlot)
        return null;
    const timeSpan = selectedSlot.querySelector('dt span');
    if (!timeSpan)
        return null;
    const timeText = timeSpan.textContent.trim();
    // 東西判定
    const tdElement = selectedSlot.closest('td[data-gray-out]');
    const tdSelector = generateUniqueTdSelector(tdElement);
    const locationIndex = LocationHelper.getIndexFromSelector(tdSelector);
    const location = LocationHelper.getLocationFromIndex(locationIndex);
    const locationText = location === 'east' ? '東' : '西';
    return `${locationText}${timeText}`;
}
// 来場日時設定ボタンの状態をチェック
function checkVisitTimeButtonState() {
    const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq');
    if (!visitTimeButton) {
        console.log('⚠️ 来場日時設定ボタンが見つかりません');
        return false;
    }
    const isDisabled = visitTimeButton.hasAttribute('disabled') || visitTimeButton.disabled;
    console.log(`🔘 来場日時設定ボタン: ${isDisabled ? '無効' : '有効'}`);
    return !isDisabled;
}
// 時間帯が選択されているかチェック
function checkTimeSlotSelected() {
    // 選択された時間帯（aria-pressed="true"）をチェック
    const selectedTimeSlot = document.querySelector(entrance_page_dom_utils/* timeSlotSelectors */.eN.selectedSlot);
    if (!selectedTimeSlot) {
        console.log('⚠️ 時間帯が選択されていません');
        return false;
    }
    // 選択された時間帯が満員でないかチェック
    const tdElement = selectedTimeSlot.closest('td');
    if (!tdElement)
        return false;
    const status = (0,entrance_page_dom_utils/* extractTdStatus */.SE)(tdElement);
    if (status && status.isFull) {
        console.log('⚠️ 選択された時間帯は満員です');
        return false;
    }
    console.log(`✅ 時間帯選択済み: ${status?.timeText || 'unknown'}`);
    return true;
}
// 予約開始可能かどうかの総合判定
function canStartReservation() {
    const hasTimeSlotTable = (0,entrance_page_monitor/* checkTimeSlotTableExistsSync */.H5)();
    const isTimeSlotSelected = checkTimeSlotSelected();
    const isVisitTimeButtonEnabled = checkVisitTimeButtonState();
    console.log(`📊 予約開始条件チェック:`);
    console.log(`  - 時間帯テーブル: ${hasTimeSlotTable ? '✅' : '❌'}`);
    console.log(`  - 時間帯選択: ${isTimeSlotSelected ? '✅' : '❌'}`);
    console.log(`  - 来場日時ボタン有効: ${isVisitTimeButtonEnabled ? '✅' : '❌'}`);
    return hasTimeSlotTable && isTimeSlotSelected && isVisitTimeButtonEnabled;
}
// 初期状態をチェックしてFABを適切に設定
function checkInitialState() {
    console.log('🔍 初期状態をチェック中...');
    // カレンダーで日付が選択されているかチェック
    const selectedDate = (0,entrance_page_ui/* getCurrentSelectedCalendarDate */.rY)();
    const hasTimeSlotTable = (0,entrance_page_monitor/* checkTimeSlotTableExistsSync */.H5)();
    console.log(`📅 選択日付: ${selectedDate || 'なし'}`);
    console.log(`🗓️ 時間帯テーブル: ${hasTimeSlotTable ? 'あり' : 'なし'}`);
    if (selectedDate && hasTimeSlotTable) {
        // 時間帯テーブルがある場合、予約開始可能かチェック
        const canStart = canStartReservation();
        console.log(`✅ 日付選択済み、時間帯テーブル表示中 - ${canStart ? '予約開始可能' : '条件未満'}`);
        // FABボタンの状態を設定
        const fabButton = document.querySelector('#ytomo-main-fab');
        const fabIcon = fabButton?.querySelector('span');
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
            }
            else {
                // 条件未満足 - disabled状態（グレー色）
                fabButton.style.background = 'rgb(128, 128, 128) !important';
                fabButton.style.opacity = '0.9 !important';
                fabButton.style.cursor = 'not-allowed !important';
                fabButton.disabled = true;
                fabButton.title = '時間帯を選択し、来場日時設定ボタンが有効になるまでお待ちください';
            }
        }
        // ステータスも更新
        (0,entrance_page_ui/* updateStatusBadge */.pW)(canStart ? 'idle' : 'waiting');
    }
    else {
        // カレンダー未選択または時間帯テーブル未表示の場合は待機中のまま
        console.log('⏳ カレンダー未選択または時間帯テーブル未表示 - 待機中を維持');
        (0,entrance_page_ui/* updateStatusBadge */.pW)('idle');
    }
}
// カレンダー変更を監視して監視ボタンを再設置
function startCalendarWatcher() {
    if (entrance_page_state.calendarWatchState.isWatching)
        return;
    entrance_page_state.calendarWatchState.isWatching = true;
    entrance_page_state.calendarWatchState.currentSelectedDate = (0,entrance_page_ui/* getCurrentSelectedCalendarDate */.rY)();
    console.log('📅 カレンダー変更監視を開始');
    // MutationObserverでカレンダー変更・時間帯選択・ボタン状態変更を検出
    entrance_page_state.calendarWatchState.observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            // 1. カレンダーのaria-pressed属性の変更を検出
            if (mutation.type === 'attributes' &&
                (mutation.attributeName === 'aria-pressed' ||
                    mutation.attributeName === 'class')) {
                const element = mutation.target;
                if (element.matches && element.matches('[role="button"][aria-pressed]') &&
                    element.querySelector('time[datetime]')) {
                    shouldUpdate = true;
                }
            }
            // 2. 時間帯選択の変更を検出
            if (mutation.type === 'attributes' &&
                mutation.attributeName === 'aria-pressed') {
                const element = mutation.target;
                if (element.matches && element.matches('td[data-gray-out] div[role="button"]')) {
                    const ariaPressed = element.getAttribute('aria-pressed');
                    console.log(`🔄 時間帯選択変更検出: ${ariaPressed}`);
                    // 入場予約状態管理システムの同期（初期化中は除外）
                    if (ariaPressed === 'true' && !entrance_page_state.calendarWatchState.isInitializing) {
                        // 選択状態変更を検出 - DOM状態から予約対象を同期
                        console.log(`🔄 時間帯選択状態を検出`);
                        setTimeout(() => {
                            syncReservationTargetFromDOM();
                            (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
                        }, 50);
                    }
                    shouldUpdate = true;
                }
            }
            // 3. 来場日時設定ボタンのdisabled属性変更を検出
            if (mutation.type === 'attributes' &&
                mutation.attributeName === 'disabled') {
                const element = mutation.target;
                if (element.matches && element.matches('button.basic-btn.type2.style_full__ptzZq')) {
                    console.log(`🔄 来場日時ボタン状態変更検出: disabled=${element.hasAttribute('disabled')}`);
                    shouldUpdate = true;
                }
            }
        });
        if (shouldUpdate) {
            // DOM更新完了を待ってから処理
            waitForTimeSlotTable(() => {
                handleCalendarChange();
            });
        }
    });
    // カレンダー要素全体を監視
    const observeTarget = document.body;
    entrance_page_state.calendarWatchState.observer.observe(observeTarget, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-pressed', 'class', 'disabled']
    });
}
// カレンダー変更・状態変更時の処理
function handleCalendarChange() {
    const newSelectedDate = (0,entrance_page_ui/* getCurrentSelectedCalendarDate */.rY)();
    const calendarDateChanged = newSelectedDate !== entrance_page_state.calendarWatchState.currentSelectedDate;
    if (calendarDateChanged) {
        console.log(`📅 カレンダー日付変更を検出: ${entrance_page_state.calendarWatchState.currentSelectedDate} → ${newSelectedDate}`);
        // 監視実行中は日付変更を無視
        if (entrance_reservation_state_manager/* entranceReservationStateManager */.xx.isMonitoringRunning()) {
            console.log('⚠️ 監視実行中のため日付変更を無視します');
            return;
        }
        entrance_page_state.calendarWatchState.currentSelectedDate = newSelectedDate;
        // 入場予約状態管理にも日付を設定
        if (newSelectedDate) {
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setSelectedCalendarDate(newSelectedDate);
        }
        // 既存の監視状態をクリア（日付が変わったため）
        // 入場予約状態管理システムからもクリア
        const hasReservationTarget = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.hasReservationTarget();
        const hasMonitoringTargets = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.hasMonitoringTargets();
        if (hasReservationTarget || hasMonitoringTargets) {
            console.log('📅 日付変更により入場予約状態管理システムの対象をクリア');
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearReservationTarget();
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearMonitoringTargets();
        }
        // 従来システムはもう使用しないため、このブロックは削除
        // if (multiTargetManager.hasTargets() && !timeSlotState.isMonitoring) {
        //     console.log('📅 日付変更により従来システムの監視対象をクリア');
        //     multiTargetManager.clearAll();
        //     timeSlotState.mode = 'idle';
        //     if (cacheManager) {
        //         cacheManager.clearTargetSlots();
        //     }
        // }
        // 予約対象がクリアされたため、即座にFAB表示を更新
        (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
        // 監視ボタンを再設置（動的待機を使用）
        waitForTimeSlotTable(() => {
            removeAllMonitorButtons();
            (0,entrance_page_monitor/* analyzeAndAddMonitorButtons */.wj)();
            // 監視ボタン設置後も再度FABボタンの状態を更新
            (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
            console.log('🔄 監視ボタンとFABを再設置しました');
        });
    }
    else {
        // 日付は変わっていない - FABボタンの状態のみ更新
        console.log('📅 日付変更なし - FABボタンの状態のみ更新');
        // 入場予約状態管理システムを取得して状態同期
        // 公式サイトによる選択解除があった場合の状態同期
        const selectedSlot = document.querySelector(entrance_page_dom_utils/* timeSlotSelectors */.eN.selectedSlot);
        if (!selectedSlot && entrance_reservation_state_manager/* entranceReservationStateManager */.xx.hasReservationTarget()) {
            // DOM上に選択がないが入場予約状態管理に予約対象がある場合はクリア
            console.log('🔄 公式サイトによる選択解除を検出 - 入場予約状態管理を同期');
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearReservationTarget();
            // UI更新を確実に実行
            (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
        }
        // FABボタンの状態を更新（監視ボタンは再設置しない）
        (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
    }
}
// 既存の監視ボタンをすべて削除
function removeAllMonitorButtons() {
    const existingButtons = document.querySelectorAll('.monitor-btn.ext-ytomo');
    existingButtons.forEach(button => button.remove());
    console.log(`🗑️ 既存の監視ボタンを${existingButtons.length}個削除しました`);
}
// DOM上の選択状態から予約対象を同期
function syncReservationTargetFromDOM() {
    // DOM上で選択状態の時間帯要素を取得
    const selectedElement = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
    if (selectedElement) {
        const tdElement = selectedElement.closest('td[data-gray-out]');
        const timeText = selectedElement.querySelector('dt span')?.textContent?.trim();
        if (tdElement && timeText) {
            const locationIndex = entrance_reservation_state_manager/* LocationHelper */.Qs.getIndexFromElement(tdElement);
            const selector = (0,entrance_page_dom_utils/* generateUniqueTdSelector */.sN)(tdElement);
            console.log(`🔄 DOM状態から予約対象を同期: ${timeText} (位置: ${locationIndex})`);
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setReservationTarget(timeText, locationIndex, selector);
        }
    }
    else {
        // 選択状態の要素がない場合は予約対象をクリア
        console.log(`🔄 選択状態なし - 予約対象をクリア`);
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearReservationTarget();
    }
}
// 時間帯テーブルの準備を待つ
function waitForTimeSlotTable(callback) {
    // まず即座にチェック（最短の場合は遅延なし）
    const timeSlotButtons = document.querySelectorAll('td[data-gray-out] div[role="button"]');
    if (timeSlotButtons.length > 0) {
        console.log(`✅ 時間帯テーブル準備済み (${timeSlotButtons.length}個の時間帯を検出) - 即座に実行`);
        callback();
        return;
    }
    // DOM要素が存在しない場合のみ動的待機を開始
    const checkInterval = 50; // 50ms間隔で高速チェック
    const maxAttempts = 100; // 最大5秒待機（50ms × 100 = 5000ms）
    let attempts = 0;
    const checkTableReady = () => {
        attempts++;
        // 時間帯テーブルの存在確認
        const timeSlotButtons = document.querySelectorAll('td[data-gray-out] div[role="button"]');
        if (timeSlotButtons.length > 0) {
            console.log(`✅ 時間帯テーブル準備完了 (${timeSlotButtons.length}個の時間帯を検出) - ${attempts * checkInterval}ms後`);
            callback();
        }
        else if (attempts >= maxAttempts) {
            console.log('⚠️ 時間帯テーブルの準備がタイムアウト - 強制実行');
            callback();
        }
        else {
            console.log(`🔍 時間帯テーブル待機中... (${attempts}/${maxAttempts})`);
            setTimeout(checkTableReady, checkInterval);
        }
    };
    console.log('🔍 時間帯テーブル待機開始...');
    setTimeout(checkTableReady, checkInterval);
}
// 時間帯tdクリック処理を設定（公式サイト仕様を利用した選択解除機能付き）
function setupTimeSlotClickHandlers() {
    // 既存のハンドラーをクリア
    const existingHandler = window.timeSlotClickHandler;
    if (existingHandler) {
        document.removeEventListener('click', existingHandler, true);
    }
    // 時間帯クリックハンドラーを設定
    const timeSlotClickHandler = (event) => {
        const target = event.target;
        // 時間帯のdiv[role="button"]または子要素がクリックされた場合のみ処理
        const actualTarget = target.closest('td[data-gray-out] div[role="button"]');
        if (!actualTarget) {
            // 時間帯要素でない場合は処理しない（ログも出力しない）
            return;
        }
        // 時間帯クリック判定成功
        // 時間帯のdiv[role="button"]がクリックされた場合
        const tdElement = actualTarget.closest('td[data-gray-out]');
        if (!tdElement) {
            return;
        }
        // actualTargetから時間テキストを取得
        const timeText = actualTarget.querySelector('dt span')?.textContent?.trim();
        if (!timeText) {
            return;
        }
        // 入場予約状態管理システムを取得
        const locationIndex = entrance_reservation_state_manager/* LocationHelper */.Qs.getIndexFromElement(tdElement);
        // 入場予約状態管理で現在の選択状態を確認
        const isCurrentlyReservationTarget = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.isReservationTarget(timeText, locationIndex);
        if (isCurrentlyReservationTarget) {
            // 既に予約対象として設定済みの場合は選択解除
            // イベントを停止（デフォルト動作を防ぐ）
            event.preventDefault();
            event.stopPropagation();
            // 公式サイトの仕様を利用：現在選択中のカレンダー日付ボタンをクリック
            const currentSelectedCalendarButton = document.querySelector('[role="button"][aria-pressed="true"]');
            if (currentSelectedCalendarButton && currentSelectedCalendarButton.querySelector('time[datetime]')) {
                currentSelectedCalendarButton.click();
                // 入場予約状態管理からも予約対象を削除
                setTimeout(() => {
                    entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearReservationTarget();
                    (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
                }, 100);
            }
            else {
                // フォールバック: 直接削除
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearReservationTarget();
                (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
            }
        }
        else {
            // 新規選択または別の時間帯への変更
            // DOM上の選択状態から予約対象を同期
            setTimeout(() => {
                syncReservationTargetFromDOM();
                (0,entrance_page_ui/* updateMainButtonDisplay */.vp)();
            }, 100);
        }
    };
    // グローバルに保存（後でremoveするため）
    window.timeSlotClickHandler = timeSlotClickHandler;
    // 捕獲フェーズでイベントをキャッチ
    document.addEventListener('click', timeSlotClickHandler, true);
    console.log('✅ 公式サイト仕様を利用した時間帯選択解除ハンドラーを設定しました');
}
async function entranceReservationHelper(config) {
    const { selectors, selectorTexts, timeouts } = config;
    let attempts = 0;
    const maxAttempts = 100;
    console.log('入場予約補助機能を開始します...');
    while (attempts < maxAttempts && !entrance_page_state.entranceReservationState.shouldStop) {
        attempts++;
        console.log(`試行回数: ${attempts}`);
        const statusDiv = document.getElementById('reservation-status');
        if (statusDiv) {
            statusDiv.innerText = `試行中... (${attempts}回目)`;
        }
        try {
            console.log('1. submitボタンを待機中...');
            const submitButton = await waitForElement(selectors.submit, timeouts.waitForSubmit, config);
            if (entrance_page_state.entranceReservationState.shouldStop)
                break;
            console.log('submitボタンが見つかりました。クリックします。');
            // submit押下時に回数を更新
            entrance_page_state.entranceReservationState.attempts = attempts;
            await clickElement(submitButton, config);
            console.log('2. レスポンスを待機中...');
            const responseSelectors = {
                change: selectors.change,
                success: selectors.success,
                failure: selectors.failure
            };
            const response = await waitForAnyElement(responseSelectors, timeouts.waitForResponse, selectorTexts, config);
            console.log(`レスポンス検出: ${response.key}`);
            if (entrance_page_state.entranceReservationState.shouldStop)
                break;
            if (response.key === 'change') {
                console.log('changeボタンをクリックします。');
                await clickElement(response.element, config);
                console.log('success/failureを待機中...');
                const finalSelectors = {
                    success: selectors.success,
                    failure: selectors.failure
                };
                const finalResponse = await waitForAnyElement(finalSelectors, timeouts.waitForResponse, selectorTexts, config);
                console.log(`最終レスポンス検出: ${finalResponse.key}`);
                if (finalResponse.key === 'success') {
                    console.log('🎉 予約成功！処理を終了します。');
                    return { success: true, attempts };
                }
                else {
                    console.log('予約失敗。closeボタンをクリックして再試行します。');
                    const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                    await clickElement(closeButton, config);
                    await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
                }
            }
            else if (response.key === 'success') {
                console.log('🎉 予約成功！処理を終了します。');
                return { success: true, attempts };
            }
            else if (response.key === 'failure') {
                console.log('予約失敗。closeボタンをクリックして再試行します。');
                const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                await clickElement(closeButton, config);
                await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error(`エラーが発生しました (試行 ${attempts}):`, errorMessage);
            if (entrance_page_state.entranceReservationState.shouldStop)
                break;
            await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
        }
    }
    if (entrance_page_state.entranceReservationState.shouldStop) {
        console.log('ユーザーによってキャンセルされました。');
        return { success: false, attempts, cancelled: true };
    }
    console.log(`最大試行回数 (${maxAttempts}) に達しました。処理を終了します。`);
    return { success: false, attempts };
}
// エクスポート

// ============================================================================

;// ./src-modules/entrance-page-init.ts
// ============================================================================
// 【入場予約画面初期化】
// ============================================================================
// 入場予約ページ初期化可能か判定
const judge_entrance_init = () => {
    const target_div = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
    return target_div !== null;
};
// 入場予約ページ初期化処理
const init_entrance_page = (dependencies = {}) => {
    const { setPageLoadingStateFn, createEntranceReservationUIFn, initTimeSlotMonitoringFn, restoreFromCacheFn } = dependencies;
    // ヘッダーにFAB切替ボタンを追加（DOM構築完了を待つ）
    setTimeout(() => {
        Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 278)).then((entrancePageState) => {
            entrancePageState.createFABToggleButton();
        });
    }, 1000);
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

;// ./src-modules/companion-ticket-page.ts
// ====================================================================================
// 【9. 同行者追加機能】- Companion Ticket Management
// ====================================================================================
// チケット選択画面での同行者追加操作自動化機能
// - チケットID管理・保存機能
// - FABダイアログによる一括操作
// - 同行者追加画面での自動処理
// URL検出と画面判定
function isTicketSelectionPage() {
    return window.location.href.includes('ticket_selection');
}
function isAgentTicketPage() {
    return window.location.href.includes('agent_ticket');
}
class CompanionTicketManager {
    constructor() {
        this.ticketIds = [];
        this.loadTicketIds();
    }
    // ローカルストレージからチケットID一覧を読み込み
    loadTicketIds() {
        try {
            const stored = localStorage.getItem(CompanionTicketManager.STORAGE_KEY);
            if (stored) {
                this.ticketIds = JSON.parse(stored);
                console.log(`✅ 保存済みチケットID ${this.ticketIds.length}件を読み込みました`);
            }
        }
        catch (error) {
            console.warn('チケットIDの読み込みに失敗:', error);
            this.ticketIds = [];
        }
    }
    // ローカルストレージに保存
    saveTicketIds() {
        try {
            localStorage.setItem(CompanionTicketManager.STORAGE_KEY, JSON.stringify(this.ticketIds));
        }
        catch (error) {
            console.error('チケットIDの保存に失敗:', error);
        }
    }
    // チケットID追加
    addTicketId(id, label) {
        if (!id.trim())
            return false;
        // 重複チェック
        if (this.ticketIds.some(ticket => ticket.id === id)) {
            console.log(`チケットID ${id} は既に登録済みです`);
            return false;
        }
        const now = Date.now();
        const defaultLabel = label?.trim() || new Date(now).toLocaleString('ja-JP', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
        const newTicket = {
            id: id.trim(),
            label: defaultLabel,
            addedAt: now
        };
        this.ticketIds.unshift(newTicket); // 先頭に追加（最新順）
        this.saveTicketIds();
        console.log(`✅ チケットID "${id}" を追加しました`);
        return true;
    }
    // チケットID削除
    removeTicketId(id) {
        const initialLength = this.ticketIds.length;
        this.ticketIds = this.ticketIds.filter(ticket => ticket.id !== id);
        if (this.ticketIds.length < initialLength) {
            this.saveTicketIds();
            console.log(`🗑️ チケットID "${id}" を削除しました`);
            return true;
        }
        return false;
    }
    // 全チケットID取得
    getAllTicketIds() {
        return [...this.ticketIds];
    }
    // 使用時刻更新
    markAsUsed(id) {
        const ticket = this.ticketIds.find(t => t.id === id);
        if (ticket) {
            ticket.lastUsed = Date.now();
            this.saveTicketIds();
        }
    }
    // キャッシュクリア
    clearAll() {
        this.ticketIds = [];
        localStorage.removeItem(CompanionTicketManager.STORAGE_KEY);
        console.log('🧹 全チケットIDをクリアしました');
    }
}
CompanionTicketManager.STORAGE_KEY = 'ytomo-companion-tickets';
// グローバルマネージャーインスタンス
const companionTicketManager = new CompanionTicketManager();
class CompanionProcessManager {
    constructor() {
        this.state = {
            isRunning: false,
            queuedTicketIds: [],
            successCount: 0,
            errorCount: 0,
            errors: []
        };
    }
    // 処理開始
    startProcess(ticketIds) {
        if (this.state.isRunning) {
            console.warn('同行者追加処理は既に実行中です');
            return;
        }
        this.state = {
            isRunning: true,
            queuedTicketIds: [...ticketIds],
            successCount: 0,
            errorCount: 0,
            errors: []
        };
        console.log(`🚀 同行者追加処理開始: ${ticketIds.length}件のチケットID`);
        this.processNext();
    }
    // 次のチケットID処理
    async processNext() {
        if (this.state.queuedTicketIds.length === 0) {
            this.completeProcess();
            return;
        }
        const ticketId = this.state.queuedTicketIds.shift();
        this.state.currentTicketId = ticketId;
        console.log(`📝 処理中: ${ticketId} (残り${this.state.queuedTicketIds.length}件)`);
        try {
            const success = await this.processTicketId(ticketId);
            if (success) {
                this.state.successCount++;
                companionTicketManager.markAsUsed(ticketId);
            }
            else {
                this.handleError(ticketId, '処理に失敗しました');
            }
        }
        catch (error) {
            this.handleError(ticketId, error instanceof Error ? error.message : '不明なエラー');
        }
        // 次の処理（待機時間後）
        setTimeout(() => this.processNext(), 1000 + Math.random() * 1000);
    }
    // 個別チケットID処理（実際の同行者追加処理）
    async processTicketId(ticketId) {
        console.log(`🎫 チケットID ${ticketId} の処理開始`);
        try {
            // Phase 1: チケット選択画面で同行者追加ボタンをクリック
            if (isTicketSelectionPage()) {
                const success = await this.clickCompanionAddButton();
                if (!success) {
                    throw new Error('同行者追加ボタンのクリックに失敗');
                }
                // 画面遷移を待機
                await this.waitForPageTransition();
            }
            // Phase 2: 同行者追加画面でチケットIDを入力
            if (!isAgentTicketPage()) {
                throw new Error('同行者追加画面への遷移に失敗');
            }
            // チケットID入力
            const inputSuccess = await this.inputTicketId(ticketId);
            if (!inputSuccess) {
                throw new Error('チケットID入力に失敗');
            }
            // 入力後の安定化待機（UI更新を確実に待つ）
            console.log('⏳ 入力後の安定化待機中...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 再度値を確認（フォーム状態の最終検証）
            const inputField = document.getElementById('agent_ticket_id_register');
            if (inputField && inputField.value !== ticketId) {
                console.warn(`⚠️ 最終検証で値の不一致を検出: "${inputField.value}" ≠ "${ticketId}"`);
                // 再入力を試行
                console.log('🔄 値の再設定を実行中...');
                inputField.value = ticketId;
                inputField.dispatchEvent(new Event('input', { bubbles: true }));
                inputField.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // 追加ボタンクリック
            const addSuccess = await this.clickAddButton();
            if (!addSuccess) {
                throw new Error('追加ボタンのクリックに失敗');
            }
            // 結果判定
            const result = await this.checkResult();
            return result;
        }
        catch (error) {
            console.error(`❌ チケットID ${ticketId} の処理エラー:`, error);
            return false;
        }
    }
    // 同行者追加ボタンをクリック（チケット選択画面、動的待機付き）
    async clickCompanionAddButton() {
        console.log('🔍 同行者追加ボタンを探しています...');
        // 複数のセレクタを試行
        const selectors = [
            'a.basic-btn.type1 span[data-message-code="SW_GP_DL_108_0042"]',
            'span[data-message-code="SW_GP_DL_108_0042"]',
            'a.basic-btn.type1',
            'a[href*="companion"]',
            'button:contains("同行者")',
            '*[data-message-code="SW_GP_DL_108_0042"]'
        ];
        for (const selector of selectors) {
            try {
                const element = await this.waitForElement(selector, 5000);
                if (element) {
                    // spanの場合は親のaタグをクリック
                    const clickTarget = element.tagName === 'SPAN' && element.parentElement
                        ? element.parentElement
                        : element;
                    console.log(`✅ セレクタ "${selector}" でボタンを発見:`, clickTarget);
                    // スマホ対応：タッチイベントも試行
                    clickTarget.click();
                    // タッチイベントも送信（スマホ用）
                    if ('ontouchstart' in window) {
                        clickTarget.dispatchEvent(new TouchEvent('touchstart', { bubbles: true }));
                        clickTarget.dispatchEvent(new TouchEvent('touchend', { bubbles: true }));
                    }
                    console.log('✅ 同行者追加ボタンをクリックしました');
                    return true;
                }
            }
            catch (error) {
                console.log(`⚠️ セレクタ "${selector}" では見つかりませんでした`);
            }
        }
        console.error('❌ 全てのセレクタで同行者追加ボタンが見つかりませんでした');
        return false;
    }
    // ページ遷移を待機
    async waitForPageTransition() {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;
        return new Promise((resolve, reject) => {
            const checkTransition = () => {
                if (isAgentTicketPage() && document.getElementById('agent_ticket_id_register')) {
                    console.log('✅ 同行者追加画面への遷移完了（入力欄も確認済み）');
                    resolve();
                    return;
                }
                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    reject(new Error('ページ遷移タイムアウト'));
                    return;
                }
                setTimeout(checkTransition, checkInterval);
            };
            setTimeout(checkTransition, checkInterval);
        });
    }
    // チケットID入力
    async inputTicketId(ticketId) {
        const inputField = document.getElementById('agent_ticket_id_register');
        if (!inputField) {
            // 他の可能なセレクタを試す
            const alternativeSelectors = [
                'input[placeholder*="チケットID"]',
                'input[aria-label*="チケットID"]',
                '.style_main__register_input__wHzkJ',
                'input[maxlength="10"]'
            ];
            for (const selector of alternativeSelectors) {
                const altInput = document.querySelector(selector);
                if (altInput) {
                    return this.performInput(altInput, ticketId);
                }
            }
            return false;
        }
        return this.performInput(inputField, ticketId);
    }
    // 実際の入力処理（スマホ特有問題対応版）
    async performInput(inputField, ticketId) {
        try {
            console.log(`🎯 チケットID入力開始: "${ticketId}"`);
            console.log('📱 スマートフォン対応入力処理を実行中...');
            // モバイル環境検知
            const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
                'ontouchstart' in window || navigator.maxTouchPoints > 0;
            console.log(`📱 モバイル環境: ${isMobile ? 'Yes' : 'No'}`);
            // Step 1: フィールドの完全初期化（モバイル強化版）
            await this.completeFieldReset(inputField);
            // Step 2: フォーカス確立（モバイル対応）
            await this.establishMobileFocus(inputField);
            // Step 3: React内部状態の強制変更（モバイル版）
            await this.setReactStateMobile(inputField, ticketId);
            // Step 4: タッチイベントシミュレーション（モバイル専用）
            if (isMobile) {
                await this.simulateTouchInput(inputField, ticketId);
            }
            // Step 5: 従来の入力メソッド（デスクトップ互換）
            await this.simulateTypingInput(inputField, ticketId);
            // Step 6: IME完了待機とvalidation（モバイル強化）
            await this.waitForInputStabilization();
            // Step 7: 最終値検証と補正
            const success = await this.validateAndCorrectFinalValue(inputField, ticketId);
            return success;
        }
        catch (error) {
            console.error('❌ スマホ対応チケットID入力エラー:', error);
            return false;
        }
    }
    // Step 1: フィールドの完全初期化（モバイル強化版）
    async completeFieldReset(inputField) {
        console.log('🧹 フィールド完全初期化（モバイル対応）');
        // 全ての方法で値をクリア
        inputField.value = '';
        inputField.textContent = '';
        inputField.innerHTML = '';
        inputField.setAttribute('value', '');
        inputField.removeAttribute('value');
        // React内部プロパティもクリア
        const reactFiberKey = Object.keys(inputField).find(key => key.startsWith('__reactFiber'));
        if (reactFiberKey) {
            try {
                const fiber = inputField[reactFiberKey];
                if (fiber && fiber.memoizedProps) {
                    fiber.memoizedProps.value = '';
                }
                if (fiber && fiber.pendingProps) {
                    fiber.pendingProps.value = '';
                }
            }
            catch (e) {
                console.warn('React fiber清除失敗:', e);
            }
        }
        // 各種イベントでクリア確定
        inputField.dispatchEvent(new Event('input', { bubbles: true }));
        inputField.dispatchEvent(new Event('change', { bubbles: true }));
        // モバイル用追加待機
        await new Promise(resolve => setTimeout(resolve, 200));
        console.log('✅ フィールド初期化完了');
    }
    // Step 2: フォーカス確立（モバイル対応）
    async establishMobileFocus(inputField) {
        console.log('🎯 フォーカス確立（モバイル対応）');
        // ブラウザの差異に対応するフォーカス処理
        inputField.focus();
        // iOS Safari対応: touchstartでフォーカスを強化
        if ('ontouchstart' in window) {
            const touchEvent = new TouchEvent('touchstart', {
                bubbles: true,
                cancelable: true,
                touches: [new Touch({
                        identifier: 0,
                        target: inputField,
                        clientX: inputField.offsetLeft + 10,
                        clientY: inputField.offsetTop + 10
                    })]
            });
            inputField.dispatchEvent(touchEvent);
        }
        // フォーカス確定待機
        await new Promise(resolve => setTimeout(resolve, 100));
        // フォーカス確認
        if (document.activeElement !== inputField) {
            console.warn('⚠️ フォーカス確立に失敗、再試行');
            inputField.click(); // フォールバック
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        console.log(`✅ フォーカス確立完了: ${document.activeElement === inputField}`);
    }
    // Step 3: React内部状態の強制変更（モバイル版）
    async setReactStateMobile(inputField, ticketId) {
        console.log('⚛️ React内部状態変更（モバイル強化版）');
        try {
            // ネイティブセッターを使用（モバイルブラウザ対応）
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(inputField, ticketId);
                console.log('📝 ネイティブ値セッター実行');
            }
            // React fiberの強制更新（モバイル対応）
            const reactKeys = Object.keys(inputField).filter(key => key.startsWith('__reactFiber') || key.startsWith('__reactInternalInstance') || key.startsWith('__reactEventHandlers'));
            for (const key of reactKeys) {
                try {
                    const reactInstance = inputField[key];
                    if (reactInstance) {
                        // フォース更新をスケジュール
                        if (reactInstance.stateNode) {
                            reactInstance.stateNode.value = ticketId;
                        }
                        if (reactInstance.memoizedState) {
                            reactInstance.memoizedState.value = ticketId;
                        }
                    }
                }
                catch (e) {
                    const errorMessage = e instanceof Error ? e.message : String(e);
                    console.log(`React ${key}更新スキップ:`, errorMessage);
                }
            }
            // React合成イベント発火（モバイル特化）
            const syntheticEvent = new Event('input', { bubbles: true });
            Object.defineProperty(syntheticEvent, 'target', { value: inputField, enumerable: true });
            Object.defineProperty(syntheticEvent, 'currentTarget', { value: inputField, enumerable: true });
            Object.defineProperty(syntheticEvent, 'nativeEvent', { value: syntheticEvent, enumerable: true });
            inputField.dispatchEvent(syntheticEvent);
            console.log('✅ React状態更新完了');
        }
        catch (error) {
            console.warn('⚠️ React状態更新失敗:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Step 4: タッチイベントシミュレーション（モバイル専用）
    async simulateTouchInput(inputField, ticketId) {
        console.log('👆 タッチ入力シミュレーション（モバイル専用）');
        // タッチ開始
        const touchStartEvent = new TouchEvent('touchstart', {
            bubbles: true,
            cancelable: true,
            touches: [new Touch({
                    identifier: 0,
                    target: inputField,
                    clientX: inputField.offsetLeft + 10,
                    clientY: inputField.offsetTop + 10
                })]
        });
        inputField.dispatchEvent(touchStartEvent);
        await new Promise(resolve => setTimeout(resolve, 50));
        // 一文字ずつタッチ入力
        for (let i = 0; i < ticketId.length; i++) {
            const char = ticketId[i];
            const currentValue = ticketId.substring(0, i + 1);
            // タッチによるキー入力
            const touchMoveEvent = new TouchEvent('touchmove', {
                bubbles: true,
                cancelable: true,
                touches: [new Touch({
                        identifier: 0,
                        target: inputField,
                        clientX: inputField.offsetLeft + 10 + i,
                        clientY: inputField.offsetTop + 10
                    })]
            });
            inputField.dispatchEvent(touchMoveEvent);
            // 値を段階的に設定
            inputField.value = currentValue;
            inputField.setAttribute('value', currentValue);
            // モバイル用inputイベント
            const mobileInputEvent = new Event('input', { bubbles: true });
            Object.defineProperty(mobileInputEvent, 'data', { value: char });
            Object.defineProperty(mobileInputEvent, 'inputType', { value: 'insertText' });
            inputField.dispatchEvent(mobileInputEvent);
            await new Promise(resolve => setTimeout(resolve, 30)); // モバイル用遅延
        }
        // タッチ終了
        const touchEndEvent = new TouchEvent('touchend', {
            bubbles: true,
            cancelable: true
        });
        inputField.dispatchEvent(touchEndEvent);
        console.log('✅ タッチ入力シミュレーション完了');
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    // Step 5: 従来の入力メソッド（デスクトップ互換）
    async simulateTypingInput(inputField, ticketId) {
        console.log('⌨️ タイピング入力シミュレーション');
        // 一文字ずつのキーボード入力シミュレーション
        for (let i = 0; i < ticketId.length; i++) {
            const char = ticketId[i];
            const currentValue = ticketId.substring(0, i + 1);
            // keydown
            const keydownEvent = new KeyboardEvent('keydown', {
                key: char,
                code: `Key${char.toUpperCase()}`,
                bubbles: true,
                cancelable: true
            });
            inputField.dispatchEvent(keydownEvent);
            // 値更新
            inputField.value = currentValue;
            // input（詳細プロパティ付き）
            const inputEvent = new Event('input', { bubbles: true });
            Object.defineProperty(inputEvent, 'target', { value: inputField, enumerable: true });
            Object.defineProperty(inputEvent, 'data', { value: char, enumerable: true });
            Object.defineProperty(inputEvent, 'inputType', { value: 'insertText', enumerable: true });
            inputField.dispatchEvent(inputEvent);
            // keyup
            const keyupEvent = new KeyboardEvent('keyup', {
                key: char,
                code: `Key${char.toUpperCase()}`,
                bubbles: true,
                cancelable: true
            });
            inputField.dispatchEvent(keyupEvent);
            await new Promise(resolve => setTimeout(resolve, 15));
        }
        // pasteイベントも実行（フォールバック）
        const clipboardData = new DataTransfer();
        clipboardData.setData('text/plain', ticketId);
        const pasteEvent = new ClipboardEvent('paste', {
            bubbles: true,
            cancelable: true,
            clipboardData: clipboardData
        });
        inputField.dispatchEvent(pasteEvent);
        console.log('✅ タイピング入力シミュレーション完了');
    }
    // Step 6: IME完了待機とvalidation（モバイル強化）
    async waitForInputStabilization() {
        console.log('⏳ 入力安定化待機（IME対応）');
        // IME完了やフォーム更新の完了を待機
        await new Promise(resolve => setTimeout(resolve, 800)); // モバイル環境での待機時間延長
        // 追加のUIスレッド安定化待機
        await new Promise(resolve => requestAnimationFrame(() => {
            requestAnimationFrame(resolve);
        }));
        console.log('✅ 入力安定化完了');
    }
    // Step 7: 最終値検証と補正
    async validateAndCorrectFinalValue(inputField, ticketId) {
        console.log('🔍 最終値検証と補正');
        let finalValue = inputField.value;
        console.log(`📊 最終値確認: "${finalValue}" (期待値: "${ticketId}")`);
        if (finalValue === ticketId) {
            console.log('✅ 入力値検証成功');
            // 完了イベント発火
            inputField.dispatchEvent(new Event('change', { bubbles: true }));
            inputField.dispatchEvent(new Event('blur', { bubbles: true }));
            inputField.dispatchEvent(new Event('focusout', { bubbles: true }));
            return true;
        }
        // 不一致の場合、強制補正を試行
        console.warn(`⚠️ 値の不一致検出、強制補正を実行: 実際="${finalValue}" 期待="${ticketId}"`);
        // 最後の手段: 全ての方法で強制的に値を設定
        inputField.value = ticketId;
        inputField.textContent = ticketId;
        inputField.setAttribute('value', ticketId);
        // DOM更新強制
        inputField.style.display = 'none';
        inputField.offsetHeight; // reflow強制
        inputField.style.display = '';
        // 全イベント再発火
        ['input', 'change', 'keyup', 'blur'].forEach(eventType => {
            inputField.dispatchEvent(new Event(eventType, { bubbles: true }));
        });
        // 最終確認
        await new Promise(resolve => setTimeout(resolve, 500));
        finalValue = inputField.value;
        const success = finalValue === ticketId;
        console.log(`🎯 強制補正結果: ${success ? '成功' : '失敗'} (最終値: "${finalValue}")`);
        return success;
    }
    // 追加ボタンをクリック（動的待機付き）
    async clickAddButton() {
        console.log('🔍 追加ボタンを探しています...');
        // 動的待機でボタンを取得（iPhone Safariでも確実）
        const addButton = await this.waitForElement('button.basic-btn.type2.style_main__register_btn__FHBxM', 15000 // 15秒待機（モバイル環境考慮）
        );
        if (!addButton) {
            console.error('❌ 追加ボタンが見つかりません（タイムアウト）');
            return false;
        }
        // disabled状態もリトライで確認
        let retryCount = 0;
        const maxRetries = 10;
        while (addButton.disabled && retryCount < maxRetries) {
            console.log(`⏳ 追加ボタンが無効化中... (${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 500));
            retryCount++;
        }
        if (addButton.disabled) {
            console.warn('⚠️ 追加ボタンが無効化されています');
            return false;
        }
        // タッチイベント対応のクリック
        try {
            addButton.click();
            console.log('✅ 追加ボタンをクリックしました');
            // 処理完了を待機
            await this.waitForProcessingComplete();
            return true;
        }
        catch (error) {
            console.error('❌ 追加ボタンのクリックでエラー:', error);
            return false;
        }
    }
    // 処理完了を待機
    async waitForProcessingComplete() {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;
        return new Promise((resolve) => {
            const checkComplete = () => {
                // エラーメッセージまたは成功画面の存在を確認
                const errorMessage = document.querySelector('.style_main__error_message__oE5HC');
                const successArea = document.querySelector('.style_main__head__LLhtg');
                const nextButton = document.querySelector('button.basic-btn.type2:not(.style_main__register_btn__FHBxM)');
                if (errorMessage || successArea || nextButton) {
                    resolve();
                    return;
                }
                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    console.warn('処理完了の確認がタイムアウトしました');
                    resolve();
                    return;
                }
                setTimeout(checkComplete, checkInterval);
            };
            setTimeout(checkComplete, checkInterval);
        });
    }
    // 結果判定
    async checkResult() {
        // エラーメッセージをチェック
        const errorMessages = document.querySelectorAll('.style_main__error_message__oE5HC');
        if (errorMessages.length > 0) {
            const errorTexts = Array.from(errorMessages).map(el => el.textContent?.trim()).join('; ');
            console.error(`❌ エラー: ${errorTexts}`);
            return false;
        }
        // 成功画面をチェック
        const successArea = document.querySelector('.style_main__head__LLhtg');
        const nextButton = document.querySelector('button.basic-btn.type2:not(.style_main__register_btn__FHBxM)');
        if (successArea && nextButton) {
            console.log('✅ チケット追加成功');
            // 「チケット選択画面に追加する」ボタンをクリック
            nextButton.click();
            // チケット選択画面への戻りを待機
            await this.waitForReturnToTicketSelection();
            return true;
        }
        console.warn('⚠️ 結果の判定ができませんでした');
        return false;
    }
    // チケット選択画面への戻りを待機
    async waitForReturnToTicketSelection() {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;
        return new Promise((resolve) => {
            const checkReturn = () => {
                if (isTicketSelectionPage()) {
                    console.log('✅ チケット選択画面に戻りました');
                    resolve();
                    return;
                }
                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    console.warn('チケット選択画面への戻りがタイムアウトしました');
                    resolve();
                    return;
                }
                setTimeout(checkReturn, checkInterval);
            };
            setTimeout(checkReturn, checkInterval);
        });
    }
    // 要素の動的待機（汎用）
    async waitForElement(selector, timeout = 10000) {
        const checkInterval = 200; // 200ms間隔でチェック
        let elapsed = 0;
        return new Promise((resolve) => {
            const checkElement = () => {
                const element = document.querySelector(selector);
                if (element) {
                    console.log(`✅ 要素が見つかりました: ${selector}`);
                    resolve(element);
                    return;
                }
                elapsed += checkInterval;
                if (elapsed >= timeout) {
                    console.warn(`⚠️ 要素待機タイムアウト: ${selector} (${timeout}ms)`);
                    resolve(null);
                    return;
                }
                setTimeout(checkElement, checkInterval);
            };
            checkElement(); // 即座にチェック開始
        });
    }
    // エラーハンドリング
    handleError(ticketId, message) {
        this.state.errorCount++;
        this.state.errors.push({
            ticketId,
            message,
            timestamp: Date.now()
        });
        console.error(`❌ チケットID ${ticketId}: ${message}`);
    }
    // 処理完了
    completeProcess() {
        const { successCount, errorCount } = this.state;
        console.log(`✅ 同行者追加処理完了: 成功${successCount}件, エラー${errorCount}件`);
        this.state.isRunning = false;
        this.state.currentTicketId = undefined;
        // チェック解除は initializeTicketSelectionPage でのみ実行する
        // （ユーザーの手動チェックを保護するため）
    }
    // 処理停止
    stopProcess() {
        if (this.state.isRunning) {
            console.log('🛑 同行者追加処理を停止しました');
            this.state.isRunning = false;
            this.state.currentTicketId = undefined;
            this.state.queuedTicketIds = [];
        }
    }
    // 現在の状態取得
    getState() {
        return { ...this.state };
    }
}
// グローバルプロセスマネージャーインスタンス
const companionProcessManager = new CompanionProcessManager();
// ページタイプごとの初期化関数
function initializeTicketSelectionPage() {
    // 既存のチケットチェックを全て外す（同行者追加後の自動チェックを防止）
    setTimeout(() => {
        uncheckAllTickets();
    }, 800); // 少し遅らせてDOMが安定してから実行
    createTicketSelectionFAB();
    // チケット選択変更の監視を開始（視覚フィードバック用）
    setTimeout(() => {
        startTicketSelectionMonitoring();
    }, 1500); // FAB作成後に開始
}
function initializeAgentTicketPage() {
    console.log('👥 同行者追加画面を初期化中...');
    // 現在のページがagent_ticketか確認
    if (!window.location.href.includes('agent_ticket')) {
        console.log('🚫 agent_ticketページではないため初期化をスキップ');
        return;
    }
    // 同行者追加画面ではFABは不要
    console.log('✅ 同行者追加画面の初期化完了（FAB作成なし）');
}
// FABダイアログ作成（画面に応じて切り替え）
function createCompanionTicketFAB() {
    // チケット選択画面の場合
    if (isTicketSelectionPage()) {
        initializeTicketSelectionPage();
        return;
    }
    // 同行者追加画面の場合
    if (isAgentTicketPage()) {
        initializeAgentTicketPage();
        return;
    }
}
// 日付ボタンのみを更新（既存FAB再利用時）
function updateDateButtonsOnly(subButtonsContainer) {
    console.log('🗓️ 日付ボタンのみ更新します');
    const tickets = getTicketElements();
    const availableDates = getAvailableDates(tickets);
    // 既存の日付ボタンをクリア
    const existingDateButtons = subButtonsContainer.querySelectorAll('.ytomo-date-button');
    existingDateButtons.forEach(btn => btn.remove());
    console.log(`🗑️ 既存の日付ボタン${existingDateButtons.length}個を削除`);
    if (availableDates.length === 0) {
        console.log('📅 利用可能な日付がないため、日付ボタンは作成しません');
        return;
    }
    // 同行者ボタンを保持（削除しない）
    const companionButton = subButtonsContainer.querySelector('.ytomo-sub-fab:not(.ytomo-date-button)');
    // 新しい日付ボタンを同行者ボタンの前に挿入
    availableDates.slice(0, 3).forEach((date, index) => {
        const formatted = formatDateForLabel(date);
        const buttonLabel = '選択';
        const button = createSubFABButton(buttonLabel, () => {
            if (index === 2 && availableDates.length > 3) {
                showDateSelectionDialog(availableDates);
            }
            else {
                toggleNearestDateSelection(date);
            }
        });
        button.classList.add('ytomo-date-button');
        if (index === 0)
            button.style.fontWeight = 'bold !important';
        const displayText = (index === 2 && availableDates.length > 3) ? '他' : formatted;
        button.innerHTML = `${buttonLabel} <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${displayText}</span>`;
        // 同行者ボタンの前に挿入
        if (companionButton) {
            subButtonsContainer.insertBefore(button, companionButton);
        }
        else {
            subButtonsContainer.appendChild(button);
        }
    });
    console.log(`✅ 日付ボタン更新完了: ${Math.min(availableDates.length, 3)}個のボタンを作成`);
}
// チケット選択画面用のFAB（展開可能）
function createTicketSelectionFAB() {
    // 既存FABコンテナがある場合は子ボタンのみ更新
    const existingFabContainer = document.getElementById('ytomo-ticket-selection-fab-container');
    if (existingFabContainer) {
        console.log('✅ 既存のチケット選択FABコンテナを再利用し、子ボタンを更新します');
        // 既存の子ボタンコンテナを取得
        const existingSubContainer = existingFabContainer.querySelector('#ytomo-companion-sub-buttons');
        if (existingSubContainer) {
            // 日付ボタンのみ更新（同行者ボタンは保持）
            updateDateButtonsOnly(existingSubContainer);
        }
        return;
    }
    // FAB展開状態管理（初期状態を展開に）
    let isExpanded = true;
    // チケット選択画面用FABコンテナ作成（パビリオン検索画面と同様の構造）
    const fabContainer = document.createElement('div');
    fabContainer.id = 'ytomo-ticket-selection-fab-container';
    fabContainer.classList.add('ytomo-companion-fab', 'ytomo-ticket-selection-page');
    // FAB作成ログ
    console.log('✨ チケット選択画面用同行者FABを作成しました:', fabContainer.id);
    fabContainer.style.cssText = `
        position: fixed !important;
        bottom: 100px !important;
        right: 24px !important;
        z-index: 9999 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        align-items: flex-end !important;
        pointer-events: auto !important;
    `;
    // 子ボタンコンテナ（展開される部分）
    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.id = 'ytomo-companion-sub-buttons';
    subButtonsContainer.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
        align-items: flex-end !important;
        transition: all 0.3s ease !important;
    `;
    // 同行者ボタン
    const companionButton = createSubFABButton('同行者チケット', () => {
        showCompanionTicketDialog();
    });
    // 日付ボタンを動的生成する関数
    const createDynamicDateButtons = () => {
        const tickets = getTicketElements();
        const availableDates = getAvailableDates(tickets);
        // 既存の日付ボタンをクリア
        const existingDateButtons = subButtonsContainer.querySelectorAll('.ytomo-date-button');
        existingDateButtons.forEach(btn => btn.remove());
        if (availableDates.length === 0) {
            return; // 日付がない場合はボタンを作らない
        }
        // 同行者ボタンを一時的に削除して最後に再追加
        if (companionButton.parentNode === subButtonsContainer) {
            subButtonsContainer.removeChild(companionButton);
        }
        if (availableDates.length === 1) {
            // 1種類のみの場合: 1個のボタン
            const date = availableDates[0];
            const formatted = formatDateForLabel(date);
            const button = createSubFABButton('選択', () => {
                toggleNearestDateSelection(date);
            });
            button.classList.add('ytomo-date-button');
            button.style.fontWeight = 'bold !important';
            // 日付部分を強調表示で追加
            button.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${formatted}</span>`;
            subButtonsContainer.appendChild(button);
        }
        else if (availableDates.length === 2) {
            // 2種類の場合: 2個のボタン
            availableDates.forEach((date, index) => {
                const formatted = formatDateForLabel(date);
                const button = createSubFABButton('選択', () => {
                    toggleNearestDateSelection(date);
                });
                button.classList.add('ytomo-date-button');
                if (index === 0)
                    button.style.fontWeight = 'bold !important';
                // 日付部分を強調表示で追加
                button.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${formatted}</span>`;
                subButtonsContainer.appendChild(button);
            });
        }
        else {
            // 3種類以上の場合: 3個のボタン
            // ボタン1: 1番目の日付
            const firstDate = availableDates[0];
            const firstFormatted = formatDateForLabel(firstDate);
            const firstButton = createSubFABButton('選択', () => {
                toggleNearestDateSelection(firstDate);
            });
            firstButton.classList.add('ytomo-date-button');
            firstButton.style.fontWeight = 'bold !important';
            // 日付部分を強調表示で追加
            firstButton.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${firstFormatted}</span>`;
            subButtonsContainer.appendChild(firstButton);
            // ボタン2: 2番目の日付
            const secondDate = availableDates[1];
            const secondFormatted = formatDateForLabel(secondDate);
            const secondButton = createSubFABButton('選択', () => {
                toggleNearestDateSelection(secondDate);
            });
            secondButton.classList.add('ytomo-date-button');
            // 日付部分を強調表示で追加
            secondButton.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${secondFormatted}</span>`;
            subButtonsContainer.appendChild(secondButton);
            // ボタン3: 3番目の日付（利用可能な場合）
            if (availableDates.length >= 3) {
                const thirdDate = availableDates[2];
                const thirdFormatted = formatDateForLabel(thirdDate);
                if (availableDates.length >= 4) {
                    // 4種類以上の場合: 「選択」部分と日付部分で異なる動作
                    const thirdButton = createSubFABButton('選択', () => {
                        // デフォルトは3番目の日付を選択
                        toggleNearestDateSelection(thirdDate);
                    });
                    thirdButton.classList.add('ytomo-date-button');
                    // 日付部分を強調表示で追加（クリック可能）
                    const dateSpan = document.createElement('span');
                    dateSpan.style.cssText = `
                        font-family: 'Courier New', 'Monaco', monospace !important;
                        font-weight: bold !important;
                        color: #ffeb3b !important;
                        vertical-align: baseline !important;
                        cursor: pointer !important;
                        text-decoration: underline !important;
                    `;
                    dateSpan.textContent = '他';
                    // 日付部分クリック時は日付選択ダイアログを開く
                    dateSpan.addEventListener('click', (e) => {
                        e.stopPropagation(); // 親ボタンのクリックを防ぐ
                        showDateSelectionDialog(availableDates);
                    });
                    thirdButton.innerHTML = '選択 ';
                    thirdButton.appendChild(dateSpan);
                    subButtonsContainer.appendChild(thirdButton);
                }
                else {
                    // 3種類の場合: 通常の3番目日付ボタン
                    const thirdButton = createSubFABButton('選択', () => {
                        toggleNearestDateSelection(thirdDate);
                    });
                    thirdButton.classList.add('ytomo-date-button');
                    // 日付部分を強調表示で追加
                    thirdButton.innerHTML = `選択 <span style="font-family: 'Courier New', 'Monaco', monospace; font-weight: bold; color: #ffeb3b; vertical-align: baseline;">${thirdFormatted}</span>`;
                    subButtonsContainer.appendChild(thirdButton);
                }
            }
        }
        // 同行者ボタンを最後に追加
        subButtonsContainer.appendChild(companionButton);
    };
    // DOM要素の準備を待機して初期更新を実行
    let retryCount = 0;
    const maxRetries = 10;
    const waitForTicketsAndUpdate = () => {
        const tickets = getTicketElements();
        if (tickets.length > 0) {
            console.log(`🎫 チケット${tickets.length}件を検出、日付ボタンを更新します`);
            createDynamicDateButtons();
        }
        else if (retryCount < maxRetries) {
            retryCount++;
            console.log(`⏳ チケット検出待機中... (${retryCount}/${maxRetries})`);
            setTimeout(waitForTicketsAndUpdate, 500);
        }
        else {
            console.warn('⚠️ チケット検出がタイムアウトしました');
        }
    };
    // 初期の同行者ボタン配置（日付ボタンが未生成の状態）
    subButtonsContainer.appendChild(companionButton);
    // 初期更新を開始
    setTimeout(waitForTicketsAndUpdate, 1000);
    // メインFABボタン作成（パビリオン検索FABと統一デザイン）
    const mainFabButton = document.createElement('button');
    mainFabButton.id = 'ytomo-ticket-selection-main-fab';
    mainFabButton.classList.add('ext-ytomo', 'ytomo-fab', 'ytomo-fab-enabled');
    // FABボタンにrelative positionを設定
    mainFabButton.style.position = 'relative';
    // FABボタンの内容構造（パビリオンFABと同じ構造）
    const fabContent = document.createElement('div');
    fabContent.style.cssText = `
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
        height: 100% !important;
        pointer-events: none !important;
    `;
    // 展開/縮小アイコン（上部）
    const expandIcon = document.createElement('div');
    expandIcon.style.cssText = `
        font-size: 8px !important;
        line-height: 1 !important;
        margin-bottom: 1px !important;
        opacity: 0.8 !important;
    `;
    // YTomoテキスト（中央）
    const brandText = document.createElement('div');
    brandText.style.cssText = `
        font-size: 7px !important;
        font-weight: normal !important;
        line-height: 1 !important;
        margin-bottom: 2px !important;
        opacity: 0.7 !important;
    `;
    brandText.innerText = 'YTomo';
    // 機能表示（下部）
    const functionText = document.createElement('div');
    functionText.style.cssText = `
        font-size: 9px !important;
        font-weight: bold !important;
        line-height: 1 !important;
        white-space: nowrap !important;
    `;
    functionText.innerText = 'チケット';
    // アイコン更新関数
    function updateMainButtonIcon() {
        expandIcon.innerHTML = isExpanded ? '▼' : '▲';
    }
    updateMainButtonIcon();
    // DOM構築
    fabContent.appendChild(expandIcon);
    fabContent.appendChild(brandText);
    fabContent.appendChild(functionText);
    mainFabButton.appendChild(fabContent);
    // ホバー効果（パビリオンFABと同じ）
    mainFabButton.addEventListener('mouseenter', () => {
        mainFabButton.style.transform = 'scale(1.15)';
        mainFabButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)';
        mainFabButton.style.borderWidth = '4px';
    });
    mainFabButton.addEventListener('mouseleave', () => {
        mainFabButton.style.transform = 'scale(1.0)';
        mainFabButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)';
        mainFabButton.style.borderWidth = '3px';
    });
    // メインボタンクリック（展開/縮小）
    mainFabButton.addEventListener('click', () => {
        isExpanded = !isExpanded;
        subButtonsContainer.style.display = isExpanded ? 'flex' : 'none';
        updateMainButtonIcon();
    });
    // DOM追加
    fabContainer.appendChild(subButtonsContainer);
    fabContainer.appendChild(mainFabButton);
    document.documentElement.appendChild(fabContainer);
}
// 子FABボタン作成ヘルパー関数（パビリオン検索画面と完全統一）
function createSubFABButton(label, onClick) {
    const button = document.createElement('button');
    button.classList.add('ext-ytomo', 'pavilion-sub-btn', 'btn-enabled');
    button.textContent = label;
    // インラインスタイル完全削除 - 全てSCSSで管理
    // クリックイベント
    button.addEventListener('click', onClick);
    return button;
}
// チケット要素を取得
function getTicketElements() {
    return Array.from(document.querySelectorAll('.col3'));
}
// チケットから来場日時を抽出（複数のセレクタを試行）
function extractVisitingDate(ticketElement) {
    try {
        // ランダムハッシュを避けて安定したセレクタを使用
        const selectors = [
            'dt[class*="style_visiting_date"] + dd span', // 来場日時dtの隣のdd内のspan
            'dd[class*="style_visiting_date"] span', // 来場日時dd内のspan
            'dl[class*="style_detail"] dd:nth-child(4) span', // 2番目のdiv(来場日時)のspan
            'dl dd:last-child span', // dl内の最後のdd内のspan
            '.col3 dl dd span' // フォールバック
        ];
        let dateText = null;
        for (const selector of selectors) {
            const dateElement = ticketElement.querySelector(selector);
            if (dateElement) {
                dateText = dateElement.textContent?.trim();
                // "未設定"でない場合は有効な日付テキストとみなす
                if (dateText && !dateText.includes('未設定')) {
                    break;
                }
            }
        }
        if (!dateText || dateText.includes('未設定')) {
            return null;
        }
        // "2025年8月17日(日) 10:00-" -> "2025-08-17" の形式に変換
        const match = dateText.match(/(\d{4})年(\d{1,2})月(\d{1,2})日/);
        if (!match) {
            return null;
        }
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // 月は0ベース
        const day = parseInt(match[3]);
        const date = new Date(year, month, day);
        return date;
    }
    catch (error) {
        console.error('日付抽出エラー:', error);
        return null;
    }
}
// チケットから日付のみを抽出する共通関数
function getTicketDateOnly(ticket) {
    const visitingDate = extractVisitingDate(ticket);
    if (!visitingDate)
        return null;
    // 時刻を無視して日付のみを返す
    return new Date(visitingDate.getFullYear(), visitingDate.getMonth(), visitingDate.getDate());
}
// 指定日付と一致するチケットを取得
function getTicketsByDate(tickets, targetDate) {
    const matchingTickets = [];
    for (const ticket of tickets) {
        const ticketDate = getTicketDateOnly(ticket);
        if (ticketDate && ticketDate.getTime() === targetDate.getTime()) {
            matchingTickets.push(ticket);
        }
    }
    return matchingTickets;
}
// 全てのチケットのチェックを外す（動的待機付き）
function uncheckAllTickets() {
    let retryCount = 0;
    const maxRetries = 5;
    const uncheckProcess = () => {
        const checkboxes = document.querySelectorAll('input[type="checkbox"][id*="ticket_"]');
        if (checkboxes.length === 0 && retryCount < maxRetries) {
            retryCount++;
            setTimeout(uncheckProcess, 300);
            return;
        }
        let uncheckedCount = 0;
        checkboxes.forEach((checkbox) => {
            if (checkbox.checked) {
                checkbox.click(); // チェックを外す
                uncheckedCount++;
            }
        });
        if (uncheckedCount > 0) {
            console.log(`✅ ${uncheckedCount}件のチケットチェックを外しました`);
        }
    };
    uncheckProcess();
}
// 指定日付のチケットがすべて選択されているかチェック
function isDateFullySelected(targetDate, tickets) {
    const targetDateTickets = getTicketsByDate(tickets, targetDate);
    if (targetDateTickets.length === 0) {
        return false;
    }
    // 対象日付の全チケットが選択されているかチェック
    const allSelected = targetDateTickets.every(ticket => {
        const parentLi = ticket.closest('li');
        const checkbox = parentLi?.querySelector('input[type="checkbox"]');
        return checkbox?.checked;
    });
    // 他の日付のチケットが選択されていないかチェック
    const otherTicketsSelected = tickets.some(ticket => {
        if (targetDateTickets.includes(ticket)) {
            return false; // 対象日付のチケットは除外
        }
        const parentLi = ticket.closest('li');
        const checkbox = parentLi?.querySelector('input[type="checkbox"]');
        return checkbox?.checked;
    });
    return allSelected && !otherTicketsSelected;
}
// 日付ボタンの選択状態を更新
function updateDateButtonStates() {
    const tickets = getTicketElements();
    const availableDates = getAvailableDates(tickets);
    // 全ての日付ボタンの選択状態を更新
    const dateButtons = document.querySelectorAll('.ytomo-date-button');
    dateButtons.forEach((button, index) => {
        const buttonElement = button;
        // ボタンに対応する日付を取得
        let targetDate = null;
        if (index < availableDates.length) {
            targetDate = availableDates[index];
        }
        else if (availableDates.length >= 4 && index === 2) {
            // 4種類以上の場合の3番目のボタンは特殊（日付選択ダイアログ）
            targetDate = availableDates[2];
        }
        if (!targetDate)
            return;
        // 選択状態をチェック
        const isSelected = isDateFullySelected(targetDate, tickets);
        // 選択状態に応じてCSSクラスを更新
        if (isSelected) {
            buttonElement.classList.add('date-selected');
        }
        else {
            buttonElement.classList.remove('date-selected');
        }
    });
}
// 利用可能な全ての日付を取得（重複除去・ソート済み）
function getAvailableDates(tickets) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // 時間をリセット
    const dateMap = new Map();
    for (const ticket of tickets) {
        const ticketDate = getTicketDateOnly(ticket);
        if (!ticketDate)
            continue;
        const diff = ticketDate.getTime() - today.getTime();
        if (diff >= 0) { // 今日以降の日付のみ
            dateMap.set(ticketDate.getTime(), ticketDate);
        }
    }
    // 日付順にソート
    const dates = Array.from(dateMap.values());
    dates.sort((a, b) => a.getTime() - b.getTime());
    return dates;
}
// 日付をラベル用にフォーマット（強調表示用）
function formatDateForLabel(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}/${day}`;
}
// 日付選択ダイアログを表示
function showDateSelectionDialog(availableDates) {
    // 既存のダイアログがあれば削除
    const existingDialog = document.getElementById('ytomo-date-selection-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    // ダイアログオーバーレイ作成
    const overlay = document.createElement('div');
    overlay.id = 'ytomo-date-selection-dialog';
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background-color: rgba(0, 0, 0, 0.5) !important;
        z-index: 99999 !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    `;
    // ダイアログコンテナ作成
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white !important;
        border-radius: 8px !important;
        padding: 20px !important;
        max-width: 400px !important;
        width: 90% !important;
        max-height: 70vh !important;
        overflow-y: auto !important;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
    `;
    // タイトル
    const title = document.createElement('h3');
    title.textContent = '日付を選択してください';
    title.style.cssText = `
        margin: 0 0 16px 0 !important;
        color: #333 !important;
        font-size: 18px !important;
    `;
    // 日付リスト容器
    const dateList = document.createElement('div');
    dateList.style.cssText = `
        margin-bottom: 20px !important;
    `;
    // 選択された日付を保持
    let selectedDate = null;
    // 各日付のラジオボタンを作成
    availableDates.forEach((date, index) => {
        const dateItem = document.createElement('div');
        dateItem.style.cssText = `
            margin-bottom: 8px !important;
            padding: 8px !important;
            border-radius: 4px !important;
            cursor: pointer !important;
            transition: background-color 0.2s !important;
        `;
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'date-selection';
        radio.value = date.getTime().toString();
        radio.id = `date-${index}`;
        const label = document.createElement('label');
        label.htmlFor = `date-${index}`;
        label.style.cssText = `
            cursor: pointer !important;
            margin-left: 8px !important;
            color: #333 !important;
        `;
        // 日付表示フォーマット
        const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
        const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
        const weekday = weekdays[date.getDay()];
        label.textContent = `${dateStr}(${weekday})`;
        // ラジオボタン選択時の処理
        radio.addEventListener('change', () => {
            if (radio.checked) {
                selectedDate = date;
                // 他の選択を視覚的にクリア
                document.querySelectorAll('#ytomo-date-selection-dialog .date-item').forEach(item => {
                    item.style.backgroundColor = 'transparent';
                });
                // 選択された項目をハイライト
                dateItem.style.backgroundColor = '#e3f2fd !important';
            }
        });
        // 項目全体をクリック可能にする
        dateItem.addEventListener('click', () => {
            radio.checked = true;
            radio.dispatchEvent(new Event('change'));
        });
        dateItem.className = 'date-item';
        dateItem.appendChild(radio);
        dateItem.appendChild(label);
        dateList.appendChild(dateItem);
    });
    // ボタン容器
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
        display: flex !important;
        justify-content: flex-end !important;
        gap: 10px !important;
    `;
    // キャンセルボタン
    const cancelButton = document.createElement('button');
    cancelButton.textContent = 'キャンセル';
    cancelButton.style.cssText = `
        padding: 8px 16px !important;
        border: 1px solid #ccc !important;
        background: white !important;
        border-radius: 4px !important;
        cursor: pointer !important;
    `;
    cancelButton.addEventListener('click', () => {
        overlay.remove();
    });
    // OKボタン
    const okButton = document.createElement('button');
    okButton.textContent = 'OK';
    okButton.style.cssText = `
        padding: 8px 16px !important;
        border: none !important;
        background: #007bff !important;
        color: white !important;
        border-radius: 4px !important;
        cursor: pointer !important;
    `;
    okButton.addEventListener('click', () => {
        if (selectedDate) {
            toggleNearestDateSelection(selectedDate);
            overlay.remove();
        }
        else {
            alert('日付を選択してください');
        }
    });
    // ダイアログ組み立て
    buttonContainer.appendChild(cancelButton);
    buttonContainer.appendChild(okButton);
    dialog.appendChild(title);
    dialog.appendChild(dateList);
    dialog.appendChild(buttonContainer);
    overlay.appendChild(dialog);
    // オーバーレイクリックで閉じる
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    document.body.appendChild(overlay);
}
// 直近日付選択機能（findNearestDateと同じロジックを使用）
function toggleNearestDateSelection(targetDate) {
    console.log('🗓️ 直近日付選択機能を実行');
    console.log(`🎯 指定された日付: ${targetDate.toDateString()}`);
    const tickets = getTicketElements();
    if (tickets.length === 0) {
        console.warn('⚠️ チケット要素が見つかりません');
        showCustomAlert('チケットが見つかりません');
        return;
    }
    // 共通関数を使用して対象日付のチケットを取得
    const targetDateTickets = getTicketsByDate(tickets, targetDate);
    const checkboxes = [];
    // 全チケットのチェックボックスを収集
    for (const ticket of tickets) {
        // .col3の親li要素内でチェックボックスを探す
        const parentLi = ticket.closest('li');
        const checkbox = parentLi?.querySelector('input[type="checkbox"]');
        if (checkbox) {
            checkboxes.push(checkbox);
        }
    }
    console.log(`📊 対象日付チケット数: ${targetDateTickets.length}`);
    if (targetDateTickets.length === 0) {
        console.warn('⚠️ 対象日付のチケットが見つかりません');
        showCustomAlert('対象日付のチケットが見つかりません');
        return;
    }
    // 現在の選択状態をチェック（新しい関数を使用）
    const isCurrentlyFullySelected = isDateFullySelected(targetDate, tickets);
    if (isCurrentlyFullySelected) {
        // 対象日付がすべて選択済みの場合は全て解除
        checkboxes.forEach((cb, index) => {
            if (cb.checked) {
                try {
                    cb.click();
                }
                catch (error) {
                    console.warn(`⚠️ [${index}] 解除クリック時エラー:`, error);
                    // フォールバック: 手動でchecked状態を変更
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
        console.log('✅ 直近日付選択を解除しました');
    }
    else {
        // 全て解除してから直近日付のみを選択
        checkboxes.forEach((cb, index) => {
            if (cb.checked) {
                try {
                    cb.click();
                }
                catch (error) {
                    console.warn(`⚠️ [${index}] 解除クリック時エラー:`, error);
                    // フォールバック: 手動でchecked状態を変更
                    cb.checked = false;
                    cb.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        });
        targetDateTickets.forEach((ticket, index) => {
            // .col3の親li要素内でチェックボックスを探す
            const parentLi = ticket.closest('li');
            const checkbox = parentLi?.querySelector('input[type="checkbox"]');
            if (checkbox) {
                try {
                    checkbox.click();
                }
                catch (error) {
                    console.warn(`⚠️ [${index}] クリック時エラー:`, error);
                    // フォールバック: 手動でchecked状態を変更
                    checkbox.checked = !checkbox.checked;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
            else {
                console.warn(`⚠️ [${index}] チェックボックスが見つかりません`);
            }
        });
        const dateStr = formatDateForLabel(targetDate);
        console.log(`✅ 対象日付(${dateStr})のチケット${targetDateTickets.length}件を選択しました`);
    }
    // 選択状態変更後、日付ボタンの視覚状態を更新
    setTimeout(() => updateDateButtonStates(), 100);
}
// チケット選択変更の監視を開始
function startTicketSelectionMonitoring() {
    console.log('👀 チケット選択監視を開始します');
    // MutationObserverでチェックボックスの変更を監視
    const observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        mutations.forEach((mutation) => {
            // チェックボックスの変更を検知
            if (mutation.type === 'attributes' && mutation.attributeName === 'checked') {
                const target = mutation.target;
                if (target.type === 'checkbox') {
                    shouldUpdate = true;
                }
            }
            // DOM構造の変更（チケット追加・削除）を検知
            if (mutation.type === 'childList') {
                const hasCheckboxes = Array.from(mutation.addedNodes).some(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node;
                        return element.querySelector('input[type="checkbox"]') !== null;
                    }
                    return false;
                });
                if (hasCheckboxes) {
                    shouldUpdate = true;
                }
            }
        });
        if (shouldUpdate) {
            // 短いdebounceで更新頻度を制御
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                updateDateButtonStates();
            }, 200);
        }
    });
    // チケットリスト全体を監視
    const ticketContainer = document.querySelector('ul.product-list, .ticket-list, main, body');
    if (ticketContainer) {
        observer.observe(ticketContainer, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['checked']
        });
        console.log('✅ チケット選択監視設定完了');
    }
    else {
        console.warn('⚠️ チケットコンテナが見つからないため監視を開始できませんでした');
    }
    // DOM変更イベントリスナーも追加（フォールバック）
    document.addEventListener('change', (event) => {
        const target = event.target;
        if (target.tagName === 'INPUT' && target.type === 'checkbox') {
            clearTimeout(updateTimeout);
            updateTimeout = setTimeout(() => {
                updateDateButtonStates();
            }, 200);
        }
    });
}
// デバウンス用のタイムアウト
let updateTimeout;
// 同行者追加画面ではFABは不要なため削除済み
// 同行者チケット管理ダイアログ表示
function showCompanionTicketDialog() {
    // 既存ダイアログ削除
    const existingDialog = document.getElementById('ytomo-companion-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    // モーダルオーバーレイ作成（レスポンシブ対応）
    const overlay = document.createElement('div');
    overlay.id = 'ytomo-companion-dialog';
    overlay.className = 'ytomo-companion-dialog';
    // ダイアログコンテンツ
    const dialog = document.createElement('div');
    dialog.className = 'dialog-content';
    // ダイアログ内容作成
    dialog.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h2 style="margin: 0 0 12px 0; color: #333; font-size: 18px;">🎫 同行者チケット管理</h2>
            <p style="margin: 0; color: #666; font-size: 14px;">チケットIDを管理して一括で同行者追加処理を行います</p>
        </div>
        
        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">新しいチケットID</label>
            <div class="input-row">
                <input type="text" id="new-ticket-id" placeholder="チケットIDを入力" 
                    inputmode="text" autocomplete="off" style="flex: 2;">
                <input type="text" id="new-ticket-label" placeholder="ラベル（任意）"
                    inputmode="text" autocomplete="off" style="flex: 1;">
                <button id="add-ticket-btn">追加</button>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <label style="display: block; margin-bottom: 8px; color: #333; font-weight: bold;">保存済みチケットID</label>
            <div id="ticket-list" style="max-height: 200px; overflow-y: auto; border: 1px solid #ddd; border-radius: 4px; padding: 8px;"></div>
        </div>

        <div style="display: flex; gap: 12px; justify-content: flex-end;">
            <button id="cancel-btn" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                キャンセル
            </button>
            <button id="delete-selected-btn" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                削除
            </button>
            <button id="execute-btn" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                同行者追加
            </button>
        </div>
    `;
    // ダイアログイベント設定
    setupDialogEvents(dialog);
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
    // DOM追加後にチケットリスト更新
    updateTicketList();
    // オーバーレイクリックで閉じる
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
            overlay.remove();
        }
    });
    // フォーカス設定
    const newTicketInput = dialog.querySelector('#new-ticket-id');
    if (newTicketInput) {
        newTicketInput.focus();
    }
}
// ダイアログイベント設定
function setupDialogEvents(dialog) {
    // 追加ボタン
    const addBtn = dialog.querySelector('#add-ticket-btn');
    const newTicketInput = dialog.querySelector('#new-ticket-id');
    const newLabelInput = dialog.querySelector('#new-ticket-label');
    // スマホ対応：複数の方法で値を取得・検証する関数
    const getInputValue = (input) => {
        // シンプルな値取得（スマホブラウザでも確実）
        return (input.value || '').trim();
    };
    // スマホ対応：入力フィールドの強制リセット
    const forceResetInput = (input) => {
        // 全方法で値をクリア
        input.value = '';
        input.textContent = '';
        input.innerHTML = '';
        input.setAttribute('value', '');
        input.removeAttribute('value');
        // イベント発火で確実にクリア
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    // スマホ対応：入力完了待機のための強化処理
    const handleAddTicket = async () => {
        console.log('🔄 チケット追加処理開始...');
        // 段階的待機：フォーカス→IME→入力完了
        await new Promise(resolve => setTimeout(resolve, 500)); // 初回待機を延長
        // リトライ機構で確実に値を取得
        let ticketId = '';
        let label = '';
        let retryCount = 0;
        const maxRetries = 5;
        while (retryCount < maxRetries) {
            ticketId = getInputValue(newTicketInput);
            label = getInputValue(newLabelInput);
            console.log(`🔍 入力値取得試行 ${retryCount + 1}:`, {
                ticketId: ticketId || '(空)',
                label: label || '(空)',
                inputValue: newTicketInput.value || '(空)',
                inputTextContent: newTicketInput.textContent || '(空)',
                labelInputValue: newLabelInput.value || '(空)',
                labelComputedContent: window.getComputedStyle(newLabelInput).getPropertyValue('content') || '(空)'
            });
            // チケットIDが取得できたら処理続行
            if (ticketId) {
                break;
            }
            // 取得できない場合は追加待機
            retryCount++;
            if (retryCount < maxRetries) {
                console.log(`⏳ 入力値が空のため ${200}ms 待機後リトライ...`);
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        if (ticketId) {
            console.log('📝 有効な入力値を確認、追加処理実行');
            if (companionTicketManager.addTicketId(ticketId, label)) {
                // 強制リセット（確実なクリア）
                forceResetInput(newTicketInput);
                forceResetInput(newLabelInput);
                // 再フォーカスでクリア確認
                newTicketInput.blur();
                newLabelInput.blur();
                await new Promise(resolve => setTimeout(resolve, 100));
                updateTicketList();
                console.log('✅ チケットID追加成功:', ticketId);
            }
            else {
                console.error('❌ チケットID追加失敗（無効または重複）:', ticketId);
                showCustomAlert('チケットIDが無効または既に登録済みです');
            }
        }
        else {
            console.error('❌ 入力値の取得に失敗しました（全リトライ終了）');
            showCustomAlert('チケットIDを入力してください');
        }
    };
    // 追加ボタンクリック（スマホ対応）
    addBtn?.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🖱️ 追加ボタンクリック');
        handleAddTicket();
    });
    // タッチイベントも追加（スマホ対応）
    addBtn?.addEventListener('touchend', (e) => {
        e.preventDefault();
        console.log('👆 追加ボタンタッチ');
        handleAddTicket();
    });
    // スマホ対応：入力完了イベント（IME対応）
    const setupInputEvents = (input) => {
        let isComposing = false;
        // IME変換開始
        input.addEventListener('compositionstart', () => {
            isComposing = true;
            console.log('🔤 IME変換開始');
        });
        // IME変換完了
        input.addEventListener('compositionend', () => {
            isComposing = false;
            console.log('✅ IME変換完了');
        });
        // Enterキー（IME完了後のみ）
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !isComposing) {
                console.log('⌨️ Enter押下');
                handleAddTicket();
            }
        });
        // フォーカス失失時の処理（スマホキーボード閉じる時）
        input.addEventListener('blur', () => {
            console.log('👁️ フォーカス離脱:', input.id, 'value:', input.value);
        });
    };
    // 両方の入力フィールドにイベント設定
    setupInputEvents(newTicketInput);
    setupInputEvents(newLabelInput);
    // キャンセルボタン
    dialog.querySelector('#cancel-btn')?.addEventListener('click', () => {
        dialog.closest('#ytomo-companion-dialog')?.remove();
    });
    // 削除ボタン
    dialog.querySelector('#delete-selected-btn')?.addEventListener('click', () => {
        const selectedIds = getSelectedTicketIds();
        if (selectedIds.length > 0) {
            showCustomConfirm(`選択された${selectedIds.length}件のチケットIDを削除しますか？`, () => {
                selectedIds.forEach(id => companionTicketManager.removeTicketId(id));
                updateTicketList();
            });
        }
        else {
            showCustomAlert('削除するチケットIDを選択してください');
        }
    });
    // 実行ボタン
    dialog.querySelector('#execute-btn')?.addEventListener('click', () => {
        const selectedIds = getSelectedTicketIds();
        if (selectedIds.length > 0) {
            companionProcessManager.startProcess(selectedIds);
            dialog.closest('#ytomo-companion-dialog')?.remove();
        }
        else {
            showCustomAlert('チケットIDを選択してください');
        }
    });
}
// チケットリスト表示更新
function updateTicketList() {
    const listContainer = document.querySelector('#ticket-list');
    if (!listContainer)
        return;
    const tickets = companionTicketManager.getAllTicketIds();
    if (tickets.length === 0) {
        listContainer.innerHTML = '<div style="color: #999; text-align: center; padding: 20px;">保存済みチケットIDがありません</div>';
        return;
    }
    const listHTML = tickets.map(ticket => `
        <div class="ticket-row" data-ticket-id="${ticket.id}" style="display: flex; align-items: center; padding: 8px; border-bottom: 1px solid #eee; last-child:border-bottom-none; transition: background-color 0.2s ease; cursor: pointer;">
            <input type="checkbox" value="${ticket.id}" style="margin-right: 8px;">
            <div style="flex: 1;">
                <div style="font-weight: bold; color: #333;">${ticket.label}</div>
                <div style="font-size: 12px; color: #999;">ID: ${ticket.id}</div>
                ${ticket.lastUsed ? `<div style="font-size: 11px; color: #999;">最終使用: ${new Date(ticket.lastUsed).toLocaleString()}</div>` : ''}
            </div>
        </div>
    `).join('');
    listContainer.innerHTML = listHTML;
    // イベントリスナーを設定
    setupTicketRowEvents(listContainer);
}
// チケット行のイベントリスナーを設定
function setupTicketRowEvents(container) {
    const ticketRows = container.querySelectorAll('.ticket-row');
    ticketRows.forEach(row => {
        const rowElement = row;
        const checkbox = rowElement.querySelector('input[type="checkbox"]');
        if (!checkbox)
            return;
        // チェックボックスの変更イベント
        checkbox.addEventListener('change', () => {
            updateTicketRowSelection(checkbox);
        });
        // 行全体のクリックでチェックボックス切り替え
        rowElement.addEventListener('click', (e) => {
            // チェックボックス自体をクリックした場合は重複処理を避ける
            if (e.target === checkbox)
                return;
            checkbox.checked = !checkbox.checked;
            updateTicketRowSelection(checkbox);
        });
    });
}
// チケット行の選択状態を更新
function updateTicketRowSelection(checkbox) {
    const ticketRow = checkbox.closest('.ticket-row');
    if (!ticketRow)
        return;
    if (checkbox.checked) {
        ticketRow.style.backgroundColor = '#e3f2fd';
        ticketRow.style.borderColor = '#2196f3';
    }
    else {
        ticketRow.style.backgroundColor = '';
        ticketRow.style.borderColor = '#eee';
    }
}
// グローバルスコープでアクセス可能にする
window.updateTicketRowSelection = updateTicketRowSelection;
// 選択されたチケットID取得
function getSelectedTicketIds() {
    const checkboxes = document.querySelectorAll('#ticket-list input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}
// カスタムアラート・確認ダイアログ
function showCustomAlert(message) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0,0,0,0.5) !important;
        z-index: 100000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white !important;
        border-radius: 8px !important;
        padding: 24px !important;
        max-width: 400px !important;
        width: 90% !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        text-align: center !important;
    `;
    dialog.innerHTML = `
        <div style="margin-bottom: 16px; color: #333; font-size: 16px;">${message}</div>
        <button id="alert-ok-btn" style="padding: 8px 24px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
            OK
        </button>
    `;
    dialog.querySelector('#alert-ok-btn')?.addEventListener('click', () => {
        overlay.remove();
    });
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}
function showCustomConfirm(message, onConfirm) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0,0,0,0.5) !important;
        z-index: 100000 !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
    `;
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white !important;
        border-radius: 8px !important;
        padding: 24px !important;
        max-width: 400px !important;
        width: 90% !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.3) !important;
        text-align: center !important;
    `;
    dialog.innerHTML = `
        <div style="margin-bottom: 16px; color: #333; font-size: 16px;">${message}</div>
        <div style="display: flex; gap: 12px; justify-content: center;">
            <button id="confirm-cancel-btn" style="padding: 8px 24px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                キャンセル
            </button>
            <button id="confirm-ok-btn" style="padding: 8px 24px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">
                OK
            </button>
        </div>
    `;
    dialog.querySelector('#confirm-cancel-btn')?.addEventListener('click', () => {
        overlay.remove();
    });
    dialog.querySelector('#confirm-ok-btn')?.addEventListener('click', () => {
        overlay.remove();
        onConfirm();
    });
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
}
// 初期化関数
function initCompanionTicketFeature() {
    console.log('🎫 同行者追加機能を初期化中...');
    console.log(`📍 現在のURL: ${window.location.href}`);
    console.log(`📍 document.readyState: ${document.readyState}`);
    console.log(`📍 document.body: ${document.body ? 'available' : 'null'}`);
    if (isTicketSelectionPage()) {
        console.log('📋 チケット選択画面を検出しました');
        createCompanionTicketFAB();
    }
    else if (isAgentTicketPage()) {
        console.log('🤝 同行者追加画面を検出しました');
        createCompanionTicketFAB(); // 進行状況FAB作成
    }
    else {
        console.log('❌ 対象外の画面です');
    }
    console.log('🎫 同行者追加機能初期化完了');
}

;// ./src-modules/app-router.ts
// 各モジュールからのimport








 // 同行者追加機能
// 入場予約状態管理システムのimport

// Window型の拡張（beforeunloadハンドラー削除により不要）
// 【8. ページ判定・初期化】
// ============================================================================
// beforeunloadハンドラーは不要なので削除
// 全FABをクリーンアップする統一関数
function cleanupAllFABs() {
    console.log('🧹 全FABをクリーンアップ開始');
    const fabSelectors = [
        'ytomo-fab-container', // 入場予約FAB
        'ytomo-pavilion-fab-container', // パビリオンFAB  
        'ytomo-ticket-selection-fab-container' // チケット選択FAB
    ];
    let removedCount = 0;
    fabSelectors.forEach(id => {
        const fab = document.getElementById(id);
        if (fab) {
            fab.remove();
            removedCount++;
            console.log(`🗑️ ${id} を削除しました`);
        }
    });
    if (removedCount === 0) {
        console.log('🧹 クリーンアップ対象のFABは見つかりませんでした');
    }
    else {
        console.log(`🧹 FABクリーンアップ完了: ${removedCount}個削除`);
        // スマホ向けの追加処理: DOMの確実な更新を待つ
        if (isMobileDevice()) {
            setTimeout(() => {
                // 残存FABの再チェックと強制削除
                fabSelectors.forEach(id => {
                    const remainingFab = document.getElementById(id);
                    if (remainingFab) {
                        remainingFab.style.display = 'none';
                        remainingFab.remove();
                        console.log(`📱 スマホ向け遅延削除: ${id}`);
                    }
                });
            }, 100);
        }
    }
}
// モバイルデバイス判定（簡易版）
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768);
}
// cacheManagerの初期化
const app_router_cacheManager = createCacheManager({
    getCurrentSelectedCalendarDateFn: entrance_page_ui/* getCurrentSelectedCalendarDate */.rY
});
// 入場予約状態管理システムの初期化フラグ
let isUnifiedStateManagerInitialized = false; // 重複初期化防止フラグ
// ページ初期化の重複実行防止
let currentPageType = null;
let isPageInitializing = false;
// ページ初期化時に既存データを移行
const initializeUnifiedStateManager = () => {
    if (isUnifiedStateManagerInitialized) {
        console.log('🔄 入場予約状態管理システムは既に初期化済みです');
        return;
    }
    try {
        // 既存システムからの状態移行
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.migrateFromExisting();
        isUnifiedStateManagerInitialized = true;
        console.log('✅ 入場予約状態管理システム初期化完了');
    }
    catch (error) {
        console.error('⚠️ 入場予約状態管理システム初期化エラー:', error);
    }
};
// entrance-page-monitor、entrance-page-ui、entrance-page-fabにcacheManagerを設定
(0,entrance_page_monitor/* setCacheManager */.S9)(app_router_cacheManager);
(0,entrance_page_ui/* setCacheManagerForSection6 */.MM)(app_router_cacheManager);
setCacheManagerForSection7(app_router_cacheManager);
// entrance-page-uiに必要な関数を注入
(0,entrance_page_ui/* setEntranceReservationHelper */.XP)(entranceReservationHelper);
(0,entrance_page_ui/* setUpdateMonitoringTargetsDisplay */.qy)(updateMonitoringTargetsDisplay);
// 依存注入は削除済み - 各モジュールで直接インポートを使用
// URL判定とページタイプ識別
const identify_page_type = (url) => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        if (pathname === '/ticket_visiting_reservation/') {
            return "entrance_reservation";
        }
        else if (pathname === '/event_search/') {
            return "pavilion_reservation";
        }
        else if (pathname === '/ticket_selection/') {
            return "ticket_selection";
        }
        else if (pathname === '/agent_ticket/') {
            return "agent_ticket";
        }
    }
    catch (error) {
        console.error(`URL解析エラー: ${error}`);
    }
    return null;
};
// ページ遷移時の初期化トリガー
const trigger_init = (url_record) => {
    const page_type = identify_page_type(url_record);
    // 同じページタイプで初期化中の場合はスキップ
    if (currentPageType === page_type && isPageInitializing) {
        return;
    }
    // 同じページタイプでもFABが消えている場合は再作成
    if (currentPageType === page_type && !isPageInitializing) {
        if (page_type === 'ticket_selection') {
            const ticketSelectionFab = document.getElementById('ytomo-ticket-selection-fab-container');
            if (!ticketSelectionFab) {
                console.log(`🔄 ${page_type}ページでチケット選択FABが消失しているため再作成します`);
            }
            else {
                console.log(`✅ ${page_type}ページでチケット選択FABが既に存在します、スキップ`);
                return;
            }
        }
    }
    // 前回と異なるページタイプの場合は状態をリセット
    if (currentPageType !== page_type) {
        currentPageType = page_type;
        isPageInitializing = false;
        // ページ遷移時に既存のFABボタンをクリーンアップ
        cleanupAllFABs();
    }
    if (page_type === "pavilion_reservation") {
        if (isPageInitializing)
            return;
        isPageInitializing = true;
        const interval_judge = setInterval(() => {
            if (judge_init()) {
                clearInterval(interval_judge);
                init_page();
                isPageInitializing = false;
                console.log("ytomo extension loaded (pavilion reservation)");
            }
        }, 500);
    }
    else if (page_type === "entrance_reservation") {
        if (isPageInitializing)
            return;
        isPageInitializing = true;
        const interval_judge = setInterval(() => {
            if (judge_entrance_init()) {
                clearInterval(interval_judge);
                init_entrance_page({
                    setPageLoadingStateFn: entrance_page_ui/* setPageLoadingState */.ZK,
                    createEntranceReservationUIFn: createEntranceReservationUI,
                    initTimeSlotMonitoringFn: entrance_page_dom_utils/* initTimeSlotMonitoring */.Yz,
                    restoreFromCacheFn: entrance_page_ui/* restoreFromCache */.Zu
                });
                // 入場予約ページ初期化後に入場予約状態管理システムを初期化（動的待機）
                waitForTimeSlotTable(() => {
                    initializeUnifiedStateManager();
                });
                // beforeunloadハンドラーは削除済み
                // 必要に応じて状態同期を実行（頻度を下げて負荷軽減）
                setInterval(() => {
                    // 初期化済みの場合はスキップ
                    if (isUnifiedStateManagerInitialized)
                        return;
                    const selectedSlot = document.querySelector('td[data-gray-out] div[role="button"][aria-pressed="true"]');
                    if (selectedSlot && entrance_reservation_state_manager/* entranceReservationStateManager */.xx && !entrance_reservation_state_manager/* entranceReservationStateManager */.xx.hasReservationTarget()) {
                        console.log('🔄 選択状態の後続同期を実行');
                        initializeUnifiedStateManager();
                    }
                }, 5000); // 頻度を2秒から5秒に下げる
                isPageInitializing = false;
                console.log("ytomo extension loaded (entrance reservation)");
            }
        }, 500);
    }
    else if (page_type === "ticket_selection" || page_type === "agent_ticket") {
        if (isPageInitializing)
            return;
        isPageInitializing = true;
        // 同行者追加機能の初期化（DOM準備完了を待機）
        const interval_companion = setInterval(() => {
            if (document.body && (document.readyState === 'complete' || document.readyState === 'interactive')) {
                clearInterval(interval_companion);
                console.log(`🎫 ${page_type}ページを初期化します`);
                // ヘッダートグルボタンを作成
                (0,entrance_page_state.createFABToggleButton)();
                // ページタイプ別初期化
                if (page_type === 'ticket_selection') {
                    initializeTicketSelectionPage();
                }
                else if (page_type === 'agent_ticket') {
                    initializeAgentTicketPage();
                }
                else {
                    // フォールバック（旧方式）
                    initCompanionTicketFeature();
                }
                isPageInitializing = false;
                console.log(`ytomo extension loaded (${page_type})`);
            }
        }, 500);
    }
    else {
        // 対象外のページの場合はログ出力のみ
        console.log(`🔍 対象外ページ: ${url_record}`);
        console.log("ytomo extension: no action needed for this page");
        currentPageType = null;
        isPageInitializing = false;
    }
};
// DOM準備完了を待機してから初期化
function initializeExtension() {
    try {
        // SPA対応: URL変更を複数の方法で監視する
        console.log('🚀 ytomo extension 初期化開始');
        console.log(`🔗 現在のURL: ${window.location.href}`);
        console.log(`🔗 document.readyState: ${document.readyState}`);
        const url = window.location.href;
        trigger_init(url);
        let url_record = url;
        // 方法1: popstateイベント（ブラウザの戻る/進む）
        window.addEventListener('popstate', () => {
            const new_url = window.location.href;
            if (new_url !== url_record) {
                console.log(`🔄 popstate URL変更検出: ${url_record} -> ${new_url}`);
                url_record = new_url;
                setTimeout(() => trigger_init(url_record), 500);
            }
        });
        // 方法2: History APIのpushState/replaceStateを監視
        const originalPushState = history.pushState;
        const originalReplaceState = history.replaceState;
        history.pushState = function (state, title, url) {
            console.log(`📍 pushState called:`, arguments);
            originalPushState.apply(history, [state, title, url]);
            setTimeout(() => {
                const new_url = window.location.href;
                if (new_url !== url_record) {
                    console.log(`🔄 pushState URL変更検出: ${url_record} -> ${new_url}`);
                    url_record = new_url;
                    setTimeout(() => trigger_init(url_record), 500);
                }
            }, 100);
        };
        history.replaceState = function (state, title, url) {
            console.log(`📍 replaceState called:`, arguments);
            originalReplaceState.apply(history, [state, title, url]);
            setTimeout(() => {
                const new_url = window.location.href;
                if (new_url !== url_record) {
                    console.log(`🔄 replaceState URL変更検出: ${url_record} -> ${new_url}`);
                    url_record = new_url;
                    setTimeout(() => trigger_init(url_record), 500);
                }
            }, 100);
        };
        // 方法3: MutationObserver（DOM変更による補完的な検出）
        const observer = new MutationObserver(() => {
            const new_url = window.location.href;
            if (new_url !== url_record) {
                url_record = new_url;
                trigger_init(url_record);
            }
            // ページタイプごとのFABが意図せず削除された場合の自動復旧（サイレント）
            if (window.location.href.includes('ticket_selection')) {
                const ticketSelectionFab = document.getElementById('ytomo-ticket-selection-fab-container');
                if (!ticketSelectionFab) {
                    setTimeout(() => trigger_init(window.location.href), 100); // 即座復旧
                }
            }
        });
        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
        // 方法4: 定期的なURL監視（フォールバック）
        setInterval(() => {
            const new_url = window.location.href;
            if (new_url !== url_record) {
                url_record = new_url;
                trigger_init(url_record);
            }
            // ページタイプごとのFAB存在チェックと自動復旧（定期監視、サイレント）
            if (window.location.href.includes('ticket_selection')) {
                const ticketSelectionFab = document.getElementById('ytomo-ticket-selection-fab-container');
                if (!ticketSelectionFab) {
                    trigger_init(window.location.href);
                }
            }
        }, 2000); // 2秒間隔でFABチェック
        console.log('👀 SPA対応URL監視設定完了');
    }
    catch (e) {
        // エラー時の処理
        console.error("ytomo extension error", e);
        // alert(e);
    }
}
// DOM準備完了を待機して初期化実行
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeExtension);
}
else {
    // 既に読み込み完了している場合は即座に実行
    initializeExtension();
}
// TypeScript環境では module.exports は使用しない
// 必要に応じてES6のexportを使用する

;// ./src-modules/main.ts
/**
 * メインエントリーポイント
 * 各sectionモジュールをimportすることで、webpackで統合されたバンドルを作成
 */
// すべてのモジュールをimport（副作用importも含む）









 // 同行者追加機能

/******/ 	return __webpack_exports__;
/******/ })()
;
});