// ==UserScript==
// @name         yt-Expo2025-Reservation-Helper
// @namespace    http://staybrowser.com/
// @version      1.0.0-alpha
// @description  大阪万博2025予約支援ツール: パビリオン検索・予約・監視・同行者管理・入場予約の自動化
// @author       TomoTom0 https://github.com/TomoTom0
// @match        https://ticket.expo2025.or.jp/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @run-at       document-end
// ==/UserScript==

// Built: 2025/08/24 04:19:39


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

/***/ 31:
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
// カレンダー検知状態管理
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
            <div class="ytomo-flex-column-center">
                ${iconSvg}
                <span class="ytomo-brand-text">YTomo</span>
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

/***/ 38:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   eN: () => (/* binding */ timeSlotSelectors),
/* harmony export */   sN: () => (/* binding */ generateUniqueTdSelector)
/* harmony export */ });
/* unused harmony exports tableSelectors, getTdPositionInfo, findSameTdElement, extractTdStatus, waitForCalendar */
// ============================================================================
// 【入場予約DOM操作ユーティリティ】 
// ============================================================================
// 循環参照解決のための基盤モジュール
// DOM操作、セレクタ定義、基本的な待機関数を提供
// 統一時間帯状態判定関数をimport

// テーブルセレクタ辞書
const tableSelectors = {
    timeSlotTable: "table[class*='style_main__timetable__']",
    calendarTable: "table[class*='style_main__calendar__']"
};
// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
const timeSlotSelectors = {
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
function generateUniqueTdSelector(tdElement) {
    // td要素の親要素（tr）内での位置を取得
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    // 時間帯テーブル専用の固有セレクタ
    return `${tableSelectors.timeSlotTable} tbody tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})`;
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
                // 時間帯セルのみを対象（data-gray-out属性の有無に関係なく）
                const allCells = rows[targetInfo.positionInfo.rowIndex].querySelectorAll('td');
                const cells = Array.from(allCells).filter(cell => cell.querySelector('div[role="button"]'));
                if (cells[targetInfo.positionInfo.cellIndex]) {
                    return cells[targetInfo.positionInfo.cellIndex];
                }
            }
        }
    }
    return null;
}
function extractTdStatus(tdElement) {
    // 統一状態判定関数を使用
    const result = detectTimeslotStatus(tdElement);
    if (!result)
        return null;
    // DOM構造: .btnDivまたはdiv[role="button"]のどちらでも対応
    const buttonDiv = (tdElement.querySelector('.btnDiv') || tdElement.querySelector('div[role="button"]'));
    if (!buttonDiv)
        return null;
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
            // DOM要素待機中（ログ削減）
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


/***/ }),

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

/***/ 76:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MonitoringCacheManager: () => (/* binding */ MonitoringCacheManager)
/* harmony export */ });
/**
 * 監視対象キャッシュ管理
 * 順序ベースの監視対象データ管理
 */
// キャッシュキー
const CACHE_KEYS = {
    MONITORING_TARGETS: 'pavilion_monitoring_targets',
    MONITORING_STATE: 'pavilion_monitoring_state'
};
class MonitoringCacheManager {
    /**
     * 監視対象を追加
     */
    static addTarget(pavilionCode, timeSlot, pavilionName) {
        try {
            const targets = this.getTargets();
            // 既に存在するかチェック
            const exists = targets.some(t => t.pavilionCode === pavilionCode && t.timeSlot === timeSlot);
            if (exists) {
                console.log('⚠️ 既に監視対象に追加済み:', pavilionCode, timeSlot);
                return false;
            }
            // 新しい順序番号を決定
            const maxOrder = targets.length > 0 ? Math.max(...targets.map(t => t.order)) : 0;
            const newTarget = {
                pavilionCode,
                timeSlot,
                pavilionName,
                order: maxOrder + 1,
                addedAt: Date.now()
            };
            targets.push(newTarget);
            this.saveTargets(targets);
            console.log('✅ 監視対象追加:', newTarget);
            return true;
        }
        catch (error) {
            console.error('❌ 監視対象追加エラー:', error);
            return false;
        }
    }
    /**
     * 監視対象を削除
     */
    static removeTarget(pavilionCode, timeSlot) {
        try {
            const targets = this.getTargets();
            const initialLength = targets.length;
            const filteredTargets = targets.filter(t => !(t.pavilionCode === pavilionCode && t.timeSlot === timeSlot));
            if (filteredTargets.length === initialLength) {
                console.log('⚠️ 削除対象が見つかりません:', pavilionCode, timeSlot);
                return false;
            }
            // 順序を再調整
            const reorderedTargets = filteredTargets
                .sort((a, b) => a.order - b.order)
                .map((target, index) => ({
                ...target,
                order: index + 1
            }));
            this.saveTargets(reorderedTargets);
            console.log('🗑️ 監視対象削除:', pavilionCode, timeSlot);
            return true;
        }
        catch (error) {
            console.error('❌ 監視対象削除エラー:', error);
            return false;
        }
    }
    /**
     * 監視対象を切り替え（追加/削除）
     */
    static toggleTarget(pavilionCode, timeSlot, pavilionName) {
        const exists = this.hasTarget(pavilionCode, timeSlot);
        if (exists) {
            return this.removeTarget(pavilionCode, timeSlot);
        }
        else {
            return this.addTarget(pavilionCode, timeSlot, pavilionName);
        }
    }
    /**
     * 監視対象が存在するかチェック
     */
    static hasTarget(pavilionCode, timeSlot) {
        const targets = this.getTargets();
        return targets.some(t => t.pavilionCode === pavilionCode && t.timeSlot === timeSlot);
    }
    /**
     * 全監視対象を取得（順序順）
     */
    static getTargets() {
        try {
            const data = sessionStorage.getItem(CACHE_KEYS.MONITORING_TARGETS);
            if (!data)
                return [];
            const targets = JSON.parse(data);
            return targets.sort((a, b) => a.order - b.order);
        }
        catch (error) {
            console.error('❌ 監視対象取得エラー:', error);
            return [];
        }
    }
    /**
     * 優先順位最上位の監視対象を取得
     */
    static getTopPriorityTarget() {
        const targets = this.getTargets();
        return targets.length > 0 ? targets[0] : null;
    }
    /**
     * 特定パビリオンの監視対象を取得
     */
    static getTargetsByPavilion(pavilionCode) {
        const targets = this.getTargets();
        return targets.filter(t => t.pavilionCode === pavilionCode);
    }
    /**
     * 監視対象をクリア
     */
    static clearTargets() {
        sessionStorage.removeItem(CACHE_KEYS.MONITORING_TARGETS);
        console.log('🗑️ 全監視対象クリア');
    }
    /**
     * 監視状態を取得
     */
    static getMonitoringState() {
        try {
            const data = sessionStorage.getItem(CACHE_KEYS.MONITORING_STATE);
            if (!data) {
                return {
                    targets: [],
                    isActive: false,
                    lastCheck: 0,
                    nextCheck: 0,
                    checkCount: 0
                };
            }
            return JSON.parse(data);
        }
        catch (error) {
            console.error('❌ 監視状態取得エラー:', error);
            return {
                targets: [],
                isActive: false,
                lastCheck: 0,
                nextCheck: 0,
                checkCount: 0
            };
        }
    }
    /**
     * 監視状態を更新
     */
    static updateMonitoringState(updates) {
        try {
            const currentState = this.getMonitoringState();
            const newState = { ...currentState, ...updates };
            sessionStorage.setItem(CACHE_KEYS.MONITORING_STATE, JSON.stringify(newState));
        }
        catch (error) {
            console.error('❌ 監視状態更新エラー:', error);
        }
    }
    /**
     * 監視統計を取得
     */
    static getMonitoringStats() {
        const targets = this.getTargets();
        const state = this.getMonitoringState();
        return {
            totalTargets: targets.length,
            activeMonitoring: state.isActive,
            lastCheckTime: state.lastCheck > 0 ?
                new Date(state.lastCheck).toLocaleTimeString() : '未実行',
            checkCount: state.checkCount
        };
    }
    /**
     * 監視対象を保存（内部用）
     */
    static saveTargets(targets) {
        sessionStorage.setItem(CACHE_KEYS.MONITORING_TARGETS, JSON.stringify(targets));
    }
    /**
     * デバッグ情報を出力
     */
    static debugInfo() {
        console.group('🔍 監視キャッシュ デバッグ情報');
        const targets = this.getTargets();
        const state = this.getMonitoringState();
        const stats = this.getMonitoringStats();
        console.log('監視対象:', targets);
        console.log('監視状態:', state);
        console.log('統計情報:', stats);
        console.groupEnd();
    }
}
// デバッグ用グローバル公開
if (typeof window !== 'undefined') {
    window.debugMonitoringCache = () => MonitoringCacheManager.debugInfo();
    window.clearMonitoringTargets = () => MonitoringCacheManager.clearTargets();
}


/***/ }),

/***/ 79:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  si: () => (/* binding */ ExecutionState),
  Qs: () => (/* binding */ LocationHelper),
  xx: () => (/* binding */ entranceReservationStateManager)
});

// UNUSED EXPORTS: EntranceReservationStateManager, PriorityMode

// EXTERNAL MODULE: ./ts/modules/entrance-page-dom-utils.ts
var entrance_page_dom_utils = __webpack_require__(38);
// EXTERNAL MODULE: ./ts/modules/entrance-page-core.ts
var entrance_page_core = __webpack_require__(271);
// EXTERNAL MODULE: ./ts/modules/processing-overlay.ts
var processing_overlay = __webpack_require__(307);
;// ./ts/modules/unified-automation-manager.ts
/**
 * 統一自動処理管理システム
 *
 * 全ての自動処理（予約、効率モード待機）を統一管理し、
 * AbortController による即座中断を実現
 */

// カスタム例外クラス
class CancellationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'CancellationError';
    }
}
// 統一自動処理管理クラス
class UnifiedAutomationManager {
    constructor(stateManager) {
        this.controller = null;
        this.currentProcess = 'idle';
        this.stateManager = stateManager;
        console.log('🔧 統一自動処理管理システム初期化', this.stateManager ? '完了' : '失敗');
    }
    // ============================================================================
    // 統一処理実行フレームワーク
    // ============================================================================
    /**
     * 中断可能な処理実行フレームワーク
     * @param processType 処理タイプ
     * @param executor 実行する処理関数
     * @returns 処理結果
     */
    async runWithCancellation(processType, executor) {
        this.currentProcess = processType;
        this.controller = new AbortController();
        try {
            console.log(`🚀 統一自動処理開始: ${processType}`);
            // 誤動作防止オーバーレイを表示（efficiency-waitは除外）
            if (processType !== 'efficiency-wait') {
                processing_overlay/* processingOverlay */.O.show(processType);
            }
            return await executor(this.controller.signal);
        }
        catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
                const cancellationError = new CancellationError(`${processType} was cancelled`);
                console.log(`⏹️ 統一自動処理中断: ${processType}`);
                throw cancellationError;
            }
            console.error(`❌ 統一自動処理エラー: ${processType}`, error);
            throw error;
        }
        finally {
            // 誤動作防止オーバーレイを非表示
            if (processType !== 'efficiency-wait') {
                processing_overlay/* processingOverlay */.O.hide();
            }
            this.cleanup();
        }
    }
    /**
     * 統一予約処理実行
     * @param config 予約設定
     * @returns 予約結果
     */
    async executeReservationProcess(config) {
        return await this.runWithCancellation('reservation', async (signal) => {
            return await this.reservationLoop(config, signal);
        });
    }
    /**
     * 統一効率モード待機処理実行
     * @param targetTime 目標時刻
     * @returns Promise<void>
     */
    async executeEfficiencyWait(targetTime) {
        return await this.runWithCancellation('efficiency-wait', async (signal) => {
            await this.waitForTargetTime(targetTime, signal);
        });
    }
    // ============================================================================
    // 中断可能待機システム
    // ============================================================================
    /**
     * 中断可能待機（100ms間隔で中断チェック）
     * @param ms 待機時間（ミリ秒）
     * @param signal 中断シグナル
     */
    async waitWithCancellation(ms, signal) {
        const checkInterval = 100; // 100ms間隔でチェック
        const endTime = Date.now() + ms;
        while (Date.now() < endTime) {
            this.throwIfAborted(signal);
            const remainingMs = endTime - Date.now();
            const waitMs = Math.min(checkInterval, remainingMs);
            if (waitMs <= 0)
                break;
            await new Promise(resolve => setTimeout(resolve, waitMs));
        }
    }
    /**
     * 効率モード用精密待機（タイミング精度維持）
     * @param targetTime 目標時刻
     * @param signal 中断シグナル
     */
    async waitForTargetTime(targetTime, signal) {
        const totalWaitMs = targetTime.getTime() - Date.now();
        if (totalWaitMs <= 0) {
            return; // 既に目標時刻を過ぎている
        }
        if (totalWaitMs > 1000) {
            // 長時間待機は100ms間隔で分割
            const longWaitMs = totalWaitMs - 100; // 最後100msは精密待機
            console.log(`🎯 統一効率モード待機: ${Math.floor(longWaitMs / 1000)}秒`);
            await this.waitWithCancellation(longWaitMs, signal);
        }
        // 最終精密調整（100ms以下）
        const finalWaitMs = targetTime.getTime() - Date.now();
        if (finalWaitMs > 0) {
            // 短時間は通常のsetTimeoutで精度を保つ
            await new Promise(resolve => setTimeout(resolve, finalWaitMs));
        }
    }
    // ============================================================================
    // DOM操作の中断対応（Phase 3で実装）
    // ============================================================================
    /**
     * 中断可能なDOM要素待機
     * @param selector セレクター
     * @param timeout タイムアウト時間
     * @param signal 中断シグナル
     * @returns 見つかったHTMLElement
     */
    async waitForElementWithCancellation(selector, timeout, signal) {
        const checkInterval = 100;
        const endTime = Date.now() + timeout;
        while (Date.now() < endTime) {
            this.throwIfAborted(signal);
            const element = document.querySelector(selector);
            if (element) {
                return element;
            }
            const remainingTime = endTime - Date.now();
            const waitTime = Math.min(checkInterval, remainingTime);
            if (waitTime > 0) {
                await this.waitWithCancellation(waitTime, signal);
            }
        }
        throw new Error(`要素が見つかりません: ${selector}`);
    }
    /**
     * 中断可能な複数要素待機
     * @param selectors セレクター辞書
     * @param timeout タイムアウト時間
     * @param signal 中断シグナル
     * @param selectorTexts テキスト条件辞書
     * @returns 見つかった要素情報
     */
    async waitForAnyElementWithCancellation(selectors, timeout, signal, selectorTexts = {}) {
        const checkInterval = 100;
        const endTime = Date.now() + timeout;
        while (Date.now() < endTime) {
            this.throwIfAborted(signal);
            // 全てのセレクターをチェック
            for (const [key, selector] of Object.entries(selectors)) {
                const elements = document.querySelectorAll(selector);
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if (selectorTexts[key]) {
                        if (element.textContent && element.textContent.includes(selectorTexts[key])) {
                            return { key, element };
                        }
                    }
                    else {
                        if (element) {
                            return { key, element };
                        }
                    }
                }
            }
            const remainingTime = endTime - Date.now();
            const waitTime = Math.min(checkInterval, remainingTime);
            if (waitTime > 0) {
                await this.waitWithCancellation(waitTime, signal);
            }
        }
        throw new Error(`いずれの要素も見つかりません: ${Object.keys(selectors).join(', ')}`);
    }
    // ============================================================================
    // 処理実装（将来のPhase 3で実装予定）
    // ============================================================================
    /**
     * 統一予約処理ループ（Phase 3で実装）
     */
    async reservationLoop(config, signal) {
        const { selectors, selectorTexts, timeouts } = config;
        let attempts = 0;
        console.log('🚀 統一予約処理ループを開始します...');
        while (true) {
            attempts++;
            console.log(`試行回数: ${attempts}`);
            // 中断チェック
            this.throwIfAborted(signal);
            // 対象一貫性検証
            if (this.stateManager && this.stateManager.validateTargetConsistency) {
                if (!this.stateManager.validateTargetConsistency()) {
                    console.error('🚨 予約対象が変更されたため処理を中断します');
                    throw new Error('TargetConsistencyError');
                }
            }
            // 状態表示更新
            const statusDiv = document.getElementById('reservation-status');
            if (statusDiv) {
                statusDiv.innerText = `試行中... (${attempts}回目)`;
            }
            try {
                console.log('1. submitボタンを待機中...');
                const submitButton = await this.waitForElementWithCancellation(selectors.submit, timeouts.waitForSubmit, signal);
                // 中断チェック
                this.throwIfAborted(signal);
                // 試行回数を状態管理に記録
                if (this.stateManager && this.stateManager.setAttempts) {
                    this.stateManager.setAttempts(attempts);
                }
                // 効率モード対応のsubmitクリック実行
                console.log('2. submitボタンをクリック...');
                await this.executeEfficiencyTimingSubmit(submitButton, config, signal);
                console.log('3. レスポンスを待機中...');
                const responseSelectors = {
                    change: selectors.change,
                    success: selectors.success,
                    failure: selectors.failure
                };
                const response = await this.waitForAnyElementWithCancellation(responseSelectors, timeouts.waitForResponse, signal, selectorTexts);
                console.log(`レスポンス検出: ${response.key}`);
                if (response.key === 'change') {
                    console.log('変更ボタンをクリックして最終結果を待機...');
                    // changeダイアログ出現を記録
                    if (this.stateManager && this.stateManager.markChangeDialogAppeared) {
                        console.log('🔄 changeダイアログ記録を実行...');
                        this.stateManager.markChangeDialogAppeared();
                        console.log('🔄 changeダイアログ記録完了');
                    }
                    else {
                        console.log('⚠️ stateManagerまたはmarkChangeDialogAppeared関数が見つからない');
                    }
                    await this.executeFixedDelayClick(response.element, config, signal);
                    console.log('success/failureを待機中...');
                    const finalSelectors = {
                        success: selectors.success,
                        failure: selectors.failure
                    };
                    console.log(`⏰ 最大${timeouts.waitForResponse / 1000}秒間待機開始...`);
                    const startTime = Date.now();
                    const finalResponse = await this.waitForAnyElementWithCancellation(finalSelectors, timeouts.waitForResponse, signal, selectorTexts);
                    const elapsedTime = Math.round((Date.now() - startTime) / 1000);
                    console.log(`✅ 最終レスポンス検出: ${finalResponse.key} (${elapsedTime}秒後)`);
                    if (finalResponse.key === 'success') {
                        console.log('🎉 予約成功！処理を終了します。');
                        return { success: true, attempts };
                    }
                    else {
                        console.log('予約失敗。closeボタンをクリックして再試行します。');
                        const closeButton = await this.waitForElementWithCancellation(selectors.close, timeouts.waitForClose, signal);
                        await this.executeFixedDelayClick(closeButton, config, signal);
                        await this.waitWithCancellation(this.getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange), signal);
                    }
                }
                else if (response.key === 'success') {
                    console.log('🎉 予約成功！処理を終了します。');
                    return { success: true, attempts };
                }
                else if (response.key === 'failure') {
                    console.log('予約失敗。closeボタンをクリックして再試行します。');
                    const closeButton = await this.waitForElementWithCancellation(selectors.close, timeouts.waitForClose, signal);
                    await this.executeFixedDelayClick(closeButton, config, signal);
                    await this.waitWithCancellation(this.getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange), signal);
                }
            }
            catch (error) {
                // 中断エラーは上位に伝播
                if (error instanceof Error && error.name === 'AbortError') {
                    throw new CancellationError('予約処理が中断されました');
                }
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`エラーが発生しました (試行 ${attempts}):`, errorMessage);
                // タイムアウトエラーは異常終了
                if (errorMessage.includes('いずれの要素も見つかりません') || errorMessage.includes('要素が見つかりませんでした')) {
                    console.error('🚨 予約処理異常終了: 3分待っても成功/失敗の結果が返りませんでした');
                    return { success: false, attempts, abnormalTermination: true };
                }
                // リトライ待機
                await this.waitWithCancellation(this.getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange), signal);
            }
        }
        // このコードは実行されない（while(true)のため）
        return { success: false, attempts };
    }
    /**
     * 効率モード対応submitクリック実行（統一処理内部用）
     */
    async executeEfficiencyTimingSubmit(submitButton, config, signal) {
        const isEfficiencyMode = this.stateManager && this.stateManager.isEfficiencyModeEnabled ?
            this.stateManager.isEfficiencyModeEnabled() : false;
        // ログ削減: デバッグ情報は不要
        if (!isEfficiencyMode) {
            // 通常モード: そのままクリック
            console.log('⚡ 通常モード: 効率待機なしでクリック実行');
            await this.executeStandardClick(submitButton, config, signal);
            return;
        }
        // changeダイアログが既に出現している場合は即座押下
        const hasChangeDialogAppeared = this.stateManager && this.stateManager.hasChangeDialogAppeared ?
            this.stateManager.hasChangeDialogAppeared() : false;
        if (hasChangeDialogAppeared) {
            // changeダイアログが既に出現済み: submitは即座押下（changeでタイミング調整）
            console.log('⚡ 効率モード: changeダイアログ出現済みのため即座押下');
            await this.executeStandardClick(submitButton, config, signal);
            return;
        }
        // 効率モード: 目標時間（00秒/30秒）への調整待機
        console.log('🚀 統一効率モード: submit標的時刻調整開始');
        // 効率モードで現在時刻から新しく目標時刻を計算
        if (!this.stateManager || !this.stateManager.calculateNext00or30Seconds) {
            console.error('⚠️ calculateNext00or30Secondsメソッドが利用できません');
            await this.executeStandardClick(submitButton, config, signal);
            return;
        }
        // 毎回新しく計算して最新の目標時刻を取得
        const nextTarget = this.stateManager.calculateNext00or30Seconds();
        console.log('🔄 効率モード: 最新の目標時刻を計算');
        // 計算した目標時刻を保存
        this.stateManager.setNextSubmitTarget(nextTarget);
        const waitMs = nextTarget.getTime() - Date.now();
        console.log(`🎯 統一効率モード待機: 目標時刻 ${nextTarget.toLocaleTimeString()}`);
        console.log(`🎯 待機時間: ${Math.floor(waitMs / 1000)}秒`);
        if (waitMs < 0) {
            console.warn('⚠️ 目標時刻が過去になっています - 即座実行');
        }
        else if (waitMs < 15000) {
            console.warn(`⚠️ 待機時間が15秒未満: ${Math.floor(waitMs / 1000)}秒`);
        }
        await this.waitForTargetTime(nextTarget, signal);
        // 標的時刻でsubmitクリック実行
        console.log(`🚀 submitクリック実行 (${new Date().toLocaleTimeString()})`);
        await this.executeStandardClick(submitButton, config, signal);
        // submitクリック後、次のサイクル用の目標時刻を即座に更新
        if (this.stateManager && this.stateManager.updateNextSubmitTarget) {
            this.stateManager.updateNextSubmitTarget();
            console.log('⚡ 効率モード: submitクリック後に次回目標時刻を更新');
        }
    }
    /**
     * 効率モード対応changeダイアログクリック実行（統一処理内部用）
     */
    async executeFixedDelayClick(element, config, signal) {
        const isEfficiencyMode = this.stateManager && this.stateManager.isEfficiencyModeEnabled ?
            this.stateManager.isEfficiencyModeEnabled() : false;
        // 効率モードかつchangeダイアログのタイミング調整が必要な場合のみ時間調整
        const needsTimingAdjustment = this.stateManager && this.stateManager.needsChangeDialogTimingAdjustment ?
            this.stateManager.needsChangeDialogTimingAdjustment() : false;
        console.log(`🔍 効率モード: ${isEfficiencyMode}, changeダイアログタイミング調整必要: ${needsTimingAdjustment}`);
        if (isEfficiencyMode && needsTimingAdjustment) {
            // 効率モード: changeダイアログのタイミング調整が記録されている場合のみ00秒/30秒調整
            console.log('🚀 統一効率モード: changeダイアログ標的時刻調整開始');
            // 効率モードで現在時刻から新しく目標時刻を計算
            if (!this.stateManager || !this.stateManager.calculateNext00or30Seconds) {
                console.error('⚠️ calculateNext00or30Secondsメソッドが利用できません');
                await this.executeStandardClick(element, config, signal);
                return;
            }
            // 毎回新しく計算して最新の目標時刻を取得
            const nextTarget = this.stateManager.calculateNext00or30Seconds();
            console.log('🔄 効率モード: changeダイアログ用最新目標時刻を計算');
            const waitMs = nextTarget.getTime() - Date.now();
            console.log(`🎯 統一効率モード待機(change): 目標時刻 ${nextTarget.toLocaleTimeString()}`);
            console.log(`🎯 待機時間(change): ${Math.floor(waitMs / 1000)}秒`);
            if (waitMs < 0) {
                console.warn('⚠️ 目標時刻が過去になっています - 即座実行');
            }
            else if (waitMs < 15000) {
                console.warn(`⚠️ 待機時間が15秒未満: ${Math.floor(waitMs / 1000)}秒`);
            }
            await this.waitForTargetTime(nextTarget, signal);
            console.log(`🚀 changeダイアログクリック実行 (${new Date().toLocaleTimeString()})`);
            // タイミング調整完了を記録
            if (this.stateManager && this.stateManager.markChangeDialogTimingAdjusted) {
                this.stateManager.markChangeDialogTimingAdjusted();
            }
        }
        else if (isEfficiencyMode) {
            // 効率モードだがchangeダイアログのタイミング調整が不要な場合は通常の固定待機
            const randomDelay = 1500 + Math.random() * 1500; // 1500~3000ms
            console.log(`⏳ 効率モード固定待機(changeダイアログ記録なし): ${Math.round(randomDelay)}ms`);
            await this.waitWithCancellation(randomDelay, signal);
        }
        // 通常のクリック処理
        await this.executeStandardClick(element, config, signal);
    }
    /**
     * 標準クリック実行（統一処理内部用）
     */
    async executeStandardClick(element, config, signal) {
        // 中断チェック
        this.throwIfAborted(signal);
        // クリック実行
        element.click();
        // クリック後の待機
        const delay = this.getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange);
        await this.waitWithCancellation(delay, signal);
    }
    /**
     * ランダム待機時間計算（統一処理内部用）
     */
    getRandomWaitTime(minTime, randomRange) {
        return minTime + Math.floor(Math.random() * randomRange);
    }
    // ============================================================================
    // ユーティリティメソッド
    // ============================================================================
    /**
     * 即座中断
     */
    abort() {
        if (this.controller) {
            console.log('🛑 統一自動処理を即座中断');
            this.controller.abort();
        }
    }
    /**
     * 現在の処理状態取得
     */
    getCurrentProcess() {
        return this.currentProcess;
    }
    /**
     * 処理実行中かどうか
     */
    isRunning() {
        return this.currentProcess !== 'idle' && this.controller !== null;
    }
    /**
     * 中断チェック（AbortSignal使用）
     * @param signal 中断シグナル
     */
    throwIfAborted(signal) {
        if (signal.aborted) {
            throw new Error('AbortError');
        }
    }
    /**
     * 処理終了時のクリーンアップ
     */
    cleanup() {
        this.currentProcess = 'idle';
        this.controller = null;
        console.log('🧹 統一自動処理クリーンアップ完了');
    }
}

;// ./ts/modules/entrance-reservation-state-manager.ts
/**
 * 入場予約状態管理システム - Entrance Reservation State Manager
 *
 * 【責務】
 * - 入場予約の実行状態管理（IDLE/RESERVATION_RUNNING）
 * - 予約対象の統一管理（時間帯・場所・DOM selector）
 * - 効率モード（00秒/30秒タイミング）制御
 * - 通知音設定・FAB UI状態の一元管理
 * - changeダイアログ出現・タイミング調整管理
 * - リロードカウントダウン・ページローディング状態
 *
 * 【統一状態管理の中核】
 * このクラスはアプリケーション全体の状態を統一管理し、
 * FAB UI・オーバーレイ・自動処理システムとの整合性を保つ
 *
 * @version v1.0.0
 * @architecture Singleton pattern with unified state management
 */
// 必要なimport



// ============================================================================
// 型定義
// ============================================================================
/**
 * 実行状態（排他的）
 * アプリケーション全体で同時に実行できる処理は1つのみ
 */
var ExecutionState;
(function (ExecutionState) {
    ExecutionState["IDLE"] = "idle";
    ExecutionState["RESERVATION_RUNNING"] = "reservation_running"; // 予約実行状態：予約処理実行中
})(ExecutionState || (ExecutionState = {}));
/**
 * 優先実行モード
 * 複数の実行可能アクションがある場合の優先度決定
 */
var PriorityMode;
(function (PriorityMode) {
    PriorityMode["AUTO"] = "auto";
    PriorityMode["FORCE_RESERVATION"] = "force_reservation"; // 予約強制実行（満員でも試行）
})(PriorityMode || (PriorityMode = {}));
/**
 * 位置管理の定数
 * 万博入場予約画面の東西エリア選択テーブル構造に対応
 * - テーブルの1列目（index=0）が東エリア
 * - テーブルの2列目（index=1）が西エリア
 */
const LOCATION_MAP = {
    0: 'east', // 0番目のtd = 東エリア
    1: 'west' // 1番目のtd = 西エリア
};
/** 東西からテーブル列インデックスへの逆引きマップ */
const LOCATION_TO_INDEX = {
    'east': 0, // 東エリア → 1列目
    'west': 1 // 西エリア → 2列目
};
// ============================================================================
// 位置管理ヘルパークラス
// ============================================================================
/**
 * 位置管理ヘルパークラス
 * 東西エリアとテーブルインデックスの相互変換ユーティリティ
 * DOM操作や表示用文字列生成に使用
 */
class LocationHelper {
    /**
     * テーブル列インデックスから東西エリアを取得
     * @param index テーブル列インデックス (0 or 1)
     * @returns 'east' | 'west'
     */
    static getLocationFromIndex(index) {
        return LOCATION_MAP[index] || 'east'; // 不正値はデフォルトで東
    }
    /**
     * 東西エリアからテーブル列インデックスを取得
     * @param location 'east' | 'west'
     * @returns テーブル列インデックス (0 or 1)
     */
    static getIndexFromLocation(location) {
        return LOCATION_TO_INDEX[location];
    }
    /**
     * DOMセレクタ文字列からテーブル列インデックスを抽出
     * CSSセレクタの nth-child() 部分をパースしてインデックスを得る
     * @param selector CSSセレクタ文字列 例: "tr:nth-child(2) > td:nth-child(1)"
     * @returns テーブル列インデックス (0 or 1)
     */
    static getIndexFromSelector(selector) {
        if (!selector || typeof selector !== 'string') {
            console.warn('⚠️ LocationHelper.getIndexFromSelector: 無効なselector:', selector);
            return 0; // デフォルトは東エリア
        }
        // "td:nth-child(N)" パターンを抽出
        const cellMatch = selector.match(/td:nth-child\((\d+)\)/);
        if (cellMatch && cellMatch[1]) {
            return parseInt(cellMatch[1]) - 1; // nth-childは1ベース、配列indexは0ベース
        }
        return 0; // パース失敗時は東エリアデフォルト
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
/**
 * 入場予約状態管理クラス
 * アプリケーション全体の中核シングルトン状態管理システム
 *
 * 【設計原則】
 * - Single Source of Truth: すべての状態をこのクラスで一元管理
 * - 原子性: 状態変更は原子的に実行、中途半端な状態を回避
 * - 一貫性: FAB UI・overlay・自動処理との状態同期を保証
 * - 中断可能: すべての長時間処理は中断可能に設計
 */
class EntranceReservationStateManager {
    /**
     * コンストラクタ
     * シングルトンインスタンスとして初期化される
     */
    constructor() {
        // ==================== 実行状態管理 ====================
        /** 現在の実行状態（IDLE/RESERVATION_RUNNING） */
        this.executionState = ExecutionState.IDLE;
        /** 開始時対象キャッシュ（予約処理中の整合性検証用） */
        this.initialTargetCache = null;
        // ==================== 対象情報管理 ====================
        /** 現在の予約対象（時間帯・位置・セレクタ） */
        this.reservationTarget = null;
        /** 予約成功情報（成功後の表示・通知用） */
        this.reservationSuccess = null;
        /** ユーザーが選択したカレンダー日付 (YYYY-MM-DD形式) */
        this.selectedCalendarDate = null;
        /** 優先度モード（現在は予約のみサポート） */
        this.priorityMode = PriorityMode.AUTO;
        // ==================== 予約実行状態管理 ====================
        /** 予約実行情報（旧entranceReservationStateから統合） */
        this.reservationExecution = {
            shouldStop: false, // 中断フラグ（ユーザーが中断ボタンを押した場合）
            startTime: null, // 予約開始時刻（タイムアウト判定用）
            attempts: 0 // 予約試行回数（サイクルカウンタ）
        };
        // ==================== 効率モード管理 ====================
        /** 効率モード設定管理（毎分00秒/30秒のsubmitタイミング制御） */
        this.efficiencyMode = {
            enabled: true, // 常時有効に設定（v1.0.0ではデフォルト有効）
            nextSubmitTarget: null, // 次のsubmit目標時刻
            updateTimer: null // FABボタン更新タイマー
        };
        /** changeダイアログ検出・調整管理（予約サイトの「change」ダイアログ対策） */
        this.changeDialogState = {
            hasAppeared: false, // 一度でもchangeダイアログが表示されたか
            needsTimingAdjustment: false // タイミング調整が必要か（00/30秒タイミング用）
        };
        // ==================== リロード・ページ状態管理 ====================
        /** リロードカウントダウン状態管理（旧reloadCountdownStateから統合） */
        this.reloadCountdown = {
            totalSeconds: 30, // カウントダウン総秒数
            secondsRemaining: null, // 残り秒数（nullは停止中）
            startTime: null, // カウントダウン開始時刻
            countdownInterval: null, // カウントダウン表示更新用タイマー
            reloadTimer: null // リロード実行用タイマー
        };
        /** ページ読み込み状態管理（旧pageLoadingStateから統合） */
        this.pageLoading = {
            isLoading: false, // ページ読み込み中フラグ
            startTime: null, // 読み込み開始時刻
            timeout: 10000 // タイムアウト時間（10秒）
        };
        // ==================== デバッグ・通知設定 ====================
        /** デバッグログ出力フラグ（v1.0.0では開発用に有効） */
        this.debugMode = true;
        /** 予約成功時の8bitスタイル音声通知設定 */
        this.notificationSound = {
            enabled: true // デフォルトで有効（ユーザーがoverlayで切り替え可能）
        };
        // 統一自動処理管理を初期化（中断可能な非同期処理管理）
        this.automationManager = new UnifiedAutomationManager(this);
        // localStorageから保存された設定を復元
        this.loadNotificationSoundSettings();
        console.log('📋 統一状態管理システム初期化完了');
    }
    // ============================================================================
    // 実行状態管理 API
    // 【主要メソッド】
    // - getExecutionState() / setExecutionState(): 現在状態の取得・設定
    // - startReservation(): 予約処理開始
    // - stop(): すべての処理を停止
    // - canStartReservation(): 予約開始可能性判定
    // ============================================================================
    /**
     * 現在の実行状態を取得
     * @returns 現在の実行状態
     */
    getExecutionState() {
        return this.executionState;
    }
    /**
     * 実行状態を設定
     * デバッグモード時は状態変更ログを出力
     * @param state 設定する実行状態
     */
    setExecutionState(state) {
        this.executionState = state;
        if (this.debugMode) {
            console.log(`[UnifiedState] 実行状態変更: ${state}`);
        }
    }
    /**
     * 予約処理を開始
     *
     * 【機能】
     * - 初回開始時: 予約開始条件チェック + ターゲットキャッシュ保存
     * - 継続サイクル: 実行中でも継続可能（リロード後の再開始など）
     * - 効率モード: 次の00/30秒ターゲット計算 + 更新タイマー開始
     *
     * @returns 開始成功時true、失敗時false
     */
    startReservation() {
        // 初回のみ条件チェック（2サイクル目以降は実行中でも継続）
        if (this.executionState !== ExecutionState.RESERVATION_RUNNING &&
            this.executionState !== ExecutionState.IDLE) {
            this.log('⚠️ 予約開始失敗: 他の処理が実行中');
            return false;
        }
        // 初回のみ予約開始条件チェック
        if (this.executionState === ExecutionState.IDLE && !this.canStartReservation()) {
            this.log('⚠️ 予約開始失敗: 条件未満足');
            return false;
        }
        // 【初回のみ初期化】試行回数（IDLE→RUNNINGの場合のみ）
        if (this.executionState === ExecutionState.IDLE) {
            // changeダイアログ状態をリセット（新しい予約処理開始時）
            this.resetChangeDialogState();
        }
        const isFirstTime = this.executionState === ExecutionState.IDLE;
        // 実行状態設定
        this.executionState = ExecutionState.RESERVATION_RUNNING;
        // 【毎回初期化】各サイクル固有の情報
        this.reservationExecution.shouldStop = false;
        this.reservationExecution.startTime = Date.now();
        if (isFirstTime) {
            this.reservationExecution.attempts = 0;
            this.log('🔄 初回予約開始: 試行回数を初期化');
            // 初回開始時の対象をキャッシュに保存
            this.saveInitialTargets();
        }
        // 【毎回更新】効率モード目標時刻とタイマー
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
            this.log('⚡ 効率モード: 目標時刻を再計算');
            this.startEfficiencyModeUpdateTimer();
        }
        const cycleType = this.reservationExecution.attempts === 0 ? '初回' : `${this.reservationExecution.attempts}サイクル目継続`;
        this.log(`🚀 予約処理を開始 (${cycleType})`);
        return true;
    }
    /**
     * すべての処理を停止しIDLE状態に戻す
     *
     * 【停止対象】
     * - 予約実行情報のリセット
     * - 初回開始時ターゲットキャッシュのクリア
     * - 効率モード更新タイマーの停止
     */
    stop() {
        const prevState = this.executionState;
        this.executionState = ExecutionState.IDLE;
        // 初回開始時対象キャッシュをクリア
        this.clearInitialTargets();
        // 効率モードタイマーを停止
        this.stopEfficiencyModeUpdateTimer();
        switch (prevState) {
            case ExecutionState.RESERVATION_RUNNING:
                this.log('⏹️ 予約処理を停止');
                // 予約実行情報をリセット
                this.reservationExecution.shouldStop = false;
                this.reservationExecution.startTime = null;
                this.reservationExecution.attempts = 0;
                break;
        }
    }
    // ============================================================================
    // 予約実行情報管理（旧entranceReservationStateから統合）
    // ============================================================================
    // 削除: startReservationExecution()はstartReservation()に統合
    /**
     * 予約中断フラグを設定
     * ユーザーが中断ボタンを押した際に呼び出される
     *
     * 【中断メカニズム】
     * 1. shouldStopフラグを設定
     * 2. UnifiedAutomationManagerで実行中の場合は即座中断
     * 3. 状態変更は予約処理ループ完了後に実行
     *
     * @param shouldStop true:中断、false:継続
     */
    setShouldStop(shouldStop) {
        this.reservationExecution.shouldStop = shouldStop;
        this.log(`🛑 予約中断フラグ: ${shouldStop}`);
        // 統一自動処理管理での即座中断処理
        if (shouldStop && this.automationManager.isRunning()) {
            this.log('🛑 統一自動処理管理での即座中断を実行');
            this.automationManager.abort();
        }
        // 注意: 状態変更はRESERVATION_RUNNINGのまま維持
        // 予約処理ループが中断を検知して終了するまで待機
    }
    // ============================================================================
    // 開始時対象キャッシュ管理（検証用）
    // ============================================================================
    /**
     * 初回予約開始時の対象をキャッシュに保存
     * 予約処理中にユーザーが別の時間帯を選択した場合の検知用
     */
    saveInitialTargets() {
        this.initialTargetCache = {
            reservationTarget: this.reservationTarget ? { ...this.reservationTarget } : null,
            timestamp: Date.now()
        };
        console.log('💾 初回開始時対象をキャッシュに保存');
        console.log('💾 予約対象:', this.initialTargetCache.reservationTarget);
    }
    /**
     * 予約対象の一貫性を検証
     * 予約処理中にユーザーが別の時間帯を選択した場合の検出
     *
     * 【検証項目】
     * - 予約対象の時間帯一致性
     * - 予約対象の位置一致性
     *
     * @returns true:一貫性OK、false:不一致検知（処理中断が必要）
     */
    validateTargetConsistency() {
        if (!this.initialTargetCache) {
            // キャッシュがない場合は検証不要
            return true;
        }
        // 予約対象の検証
        const initialReservation = this.initialTargetCache.reservationTarget;
        const currentReservation = this.reservationTarget;
        if (initialReservation && currentReservation) {
            if (initialReservation.timeSlot !== currentReservation.timeSlot ||
                initialReservation.locationIndex !== currentReservation.locationIndex) {
                console.error('🚨 予約対象が変更されました！');
                console.error('🚨 初回:', initialReservation);
                console.error('🚨 現在:', currentReservation);
                return false;
            }
        }
        else if (initialReservation !== currentReservation) {
            // 片方がnullで片方が存在する場合
            console.error('🚨 予約対象の存在状態が変更されました！');
            console.error('🚨 初回:', initialReservation);
            console.error('🚨 現在:', currentReservation);
            return false;
        }
        // すべての検証をパス
        return true;
    }
    /**
     * 対象キャッシュをクリア
     */
    clearInitialTargets() {
        this.initialTargetCache = null;
        console.log('🗑️ 初回開始時対象キャッシュをクリア');
    }
    // ============================================================================
    // 統一自動処理管理へのアクセスメソッド（Phase 2で追加）
    // ============================================================================
    /**
     * 統一効率モード待機処理を実行
     * UnifiedAutomationManager経由で中断可能な待機を実行
     *
     * @param targetTime 目標時刻（00秒または30秒のタイミング）
     * @returns Promise<void> 中断時はCancellationErrorをthrow
     */
    async executeUnifiedEfficiencyWait(targetTime) {
        return await this.automationManager.executeEfficiencyWait(targetTime);
    }
    /**
     * 統一中断可能待機
     * AbortSignalを使用して中断可能な待機を実行
     *
     * @param ms 待機時間（ミリ秒）
     * @param signal 中断シグナル（AbortControllerから生成）
     * @returns Promise<void> 中断時はCancellationErrorをthrow
     */
    async executeUnifiedWaitWithCancellation(ms, signal) {
        return await this.automationManager.waitWithCancellation(ms, signal);
    }
    /**
     * 統一予約処理を実行
     * UnifiedAutomationManager経由で予約処理を実行
     *
     * @param config 予約設定オブジェクト（対象時間帯・位置など）
     * @returns Promise<ReservationResult> 予約結果（成功/失敗/エラー）
     */
    async executeUnifiedReservationProcess(config) {
        return await this.automationManager.executeReservationProcess(config);
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
    // 特殊実行情報管理（スタブ）
    // ============================================================================
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
                // 統一FAB表示更新システムを使用
                this.updateFabDisplay();
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
            const selectedSlot = document.querySelector(entrance_page_dom_utils/* timeSlotSelectors */.eN.selectedSlot);
            if (selectedSlot) {
                const tdElement = selectedSlot.closest('td[data-gray-out]');
                selector = (0,entrance_page_dom_utils/* generateUniqueTdSelector */.sN)(tdElement);
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
    clearReservationTarget() {
        if (this.reservationTarget) {
            const info = LocationHelper.formatTargetInfo(this.reservationTarget.timeSlot, this.reservationTarget.locationIndex);
            this.reservationTarget = null;
            this.log(`🗑️ 予約対象クリア: ${info}`);
            // 解除後の状態復帰ログ出力
            const preferredAction = this.getPreferredAction();
            this.log(`🔄 予約対象解除後の状態:`);
            this.log(`  - 推奨アクション: ${preferredAction}`);
        }
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
        const selectedSlot = document.querySelector(entrance_page_dom_utils/* timeSlotSelectors */.eN.selectedSlot);
        if (!selectedSlot) {
            // 時間帯未選択（ログ削減）
            return false;
        }
        // 予約対象あり（ログ削減）
        // 3. 選択時間帯の確認（満員制限は撤廃）
        // 4. 来場日時ボタンの有効性確認
        const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq');
        if (!visitTimeButton || visitTimeButton.disabled) {
            // 過剰ログ防止のため削除
            return false;
        }
        // 5. カレンダー選択確認
        const selectedDate = (0,entrance_page_core/* getCurrentSelectedCalendarDate */.rY)();
        if (!selectedDate) {
            return false;
        }
        return true;
    }
    canInterrupt() {
        return this.executionState !== ExecutionState.IDLE;
    }
    // ============================================================================
    // 優先度判定
    // ============================================================================
    getPreferredAction() {
        const canReserve = this.canStartReservation();
        // 特殊機能は削除されました - 満員時間帯も直接予約可能
        // 満員時間帯予約制限解除により、特殊機能は不要になりました
        // 常に予約のみを返すように変更
        return canReserve ? 'reservation' : 'none';
    }
    setPriorityMode(mode) {
        this.priorityMode = mode;
        this.log(`🔧 優先度モード変更: ${mode}`);
    }
    // ============================================================================
    // 既存システムとの互換性
    // ============================================================================
    // ============================================================================
    // UI連携用メソッド
    // ============================================================================
    getFabButtonState() {
        switch (this.executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                return 'running';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                return preferredAction !== 'none' ? 'enabled' : 'disabled';
        }
    }
    // FAB部分での予約対象情報表示用
    getFabTargetDisplayInfo() {
        // カウントダウン中・効率モードタイマー実行中はログを削減
        if ( true && !this.efficiencyMode.updateTimer) {
            // ログ削減: 頻繁に呼ばれるため削除
        }
        // カレンダー選択日付を取得（M/D形式、0paddingなし）
        const getDisplayDate = () => {
            if (this.selectedCalendarDate) {
                // YYYY-MM-DD形式からM/D形式に変換（0paddingを除去）
                const parts = this.selectedCalendarDate.split('-');
                if (parts.length === 3) {
                    const month = parseInt(parts[1], 10).toString();
                    const day = parseInt(parts[2], 10).toString();
                    return `${month}/${day}`;
                }
            }
            // フォールバック: 現在日付（0paddingなし）
            const today = new Date();
            const month = (today.getMonth() + 1).toString();
            const day = today.getDate().toString();
            return `${month}/${day}`;
        };
        // 予約成功がある場合は成功情報を最優先表示
        if (this.hasReservationSuccess() && this.reservationSuccess) {
            const location = LocationHelper.getLocationFromIndex(this.reservationSuccess.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            const dateText = getDisplayDate();
            const displayText = `${dateText}\n予約成功🎉\n${locationText}${this.reservationSuccess.timeSlot}`;
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
            const displayText = `${dateText}\n${locationText}${this.reservationTarget.timeSlot}`;
            // 効率モードタイマー実行中はログ削減
            if (!this.efficiencyMode.updateTimer) {
                // ログ削減: 頻繁に呼ばれるため削除
            }
            return {
                hasTarget: true,
                displayText: displayText,
                targetType: 'reservation'
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
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                switch (preferredAction) {
                    case 'reservation': return '予約\n開始';
                    default: return '待機中';
                }
            default:
                return '待機中';
        }
    }
    // ============================================================================
    // ゲッター
    // ============================================================================
    getReservationTarget() {
        return this.reservationTarget;
    }
    getInitialTargetCache() {
        return this.initialTargetCache;
    }
    hasReservationTarget() {
        return this.reservationTarget !== null && this.reservationTarget.isValid;
    }
    // 全ての対象をクリア
    clearAllTargets() {
        const reservationCount = this.reservationTarget ? 1 : 0;
        this.reservationTarget = null;
        this.log(`🗑️ 全対象クリア - 予約: ${reservationCount}個`);
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
        // 成功時は予約対象をクリア
        this.reservationTarget = null;
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
    // ============================================================================
    // FAB表示制御統一メソッド（UI分散問題の解決）
    // ============================================================================
    // FAB表示を更新（全UI制御をここに集約）
    updateFabDisplay() {
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (!fabContainer) {
            console.log('🔍 [統一FAB更新] FABコンテナが見つかりません');
            return;
        }
        const mainButton = fabContainer.querySelector('.ytomo-fab');
        if (!mainButton) {
            console.log('🔍 [統一FAB更新] メインボタンが見つかりません');
            return;
        }
        const span = mainButton.querySelector('.ytomo-fab-status');
        if (!span) {
            console.log('🔍 [統一FAB更新] .ytomo-fab-statusエレメントが見つかりません');
            return;
        }
        // 統一システムから状態とテキストを取得
        const executionState = this.getExecutionState();
        const fabText = this.getFabButtonText();
        const preferredAction = this.getPreferredAction();
        // 予約実行中のdisabled問題デバッグ用（効率モードタイマー実行中はログ削減）
        if (executionState === ExecutionState.RESERVATION_RUNNING && !this.efficiencyMode.updateTimer) {
            console.log(`🔍 [FAB更新] 予約実行中: state=${executionState}, disabled設定前=${mainButton.disabled}`);
        }
        // FAB更新ログを削減（問題時のみ出力）
        // 実行状態に応じてボタン表示を更新
        switch (executionState) {
            case ExecutionState.RESERVATION_RUNNING:
                span.innerText = fabText;
                // ステータスバッジは効率モード実行中表示のみ（カウントダウンなし）
                this.updateStatusBadgeFromUnified('reservation-running', '効率予約実行中');
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                mainButton.classList.add('ytomo-fab-running');
                mainButton.title = '予約中断';
                mainButton.disabled = false; // 中断可能
                // ログ削減: 頻繁に呼ばれるため削除
                // 効率モードタイマー実行中はログ削減
                if (!this.efficiencyMode.updateTimer) {
                    console.log(`🔍 [FAB更新] 予約実行中のdisabled設定完了: disabled=${mainButton.disabled}`);
                }
                break;
            case ExecutionState.IDLE:
            default:
                span.innerText = fabText;
                // 既存のupdateStatusBadge関数を使用  
                const statusMode = preferredAction === 'reservation' ? 'idle-reservation' : 'idle';
                this.updateStatusBadgeFromUnified(statusMode);
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                if (preferredAction === 'reservation') {
                    mainButton.classList.add('state-enabled', 'state-reservation');
                    mainButton.title = '予約開始';
                    mainButton.disabled = false;
                }
                else {
                    mainButton.classList.add('state-idle');
                    mainButton.title = '対象選択待ち';
                    mainButton.disabled = true;
                    // 効率モードタイマー実行中はログ削減
                    if (!this.efficiencyMode.updateTimer) {
                        console.log(`🔍 [FAB更新] IDLE状態でdisabled=true設定: state=${executionState}`);
                    }
                }
                break;
        }
        // 【システム連動】オーバーレイ表示中はFABボタンを強制有効化
        const processingOverlay = document.getElementById('ytomo-processing-overlay');
        if (processingOverlay && !processingOverlay.classList.contains('hidden')) {
            if (mainButton.disabled) {
                mainButton.disabled = false;
                console.log('🛡️ [システム連動] オーバーレイ表示中につき中断ボタンを強制有効化');
            }
        }
        // 予約対象表示も更新
        this.updateTargetDisplay();
    }
    // 予約対象の表示を更新
    updateTargetDisplay() {
        const reservationTargetElement = document.getElementById('ytomo-reservation-target');
        if (!reservationTargetElement) {
            console.log('🔍 [対象表示更新] 予約対象要素が見つかりません');
            return;
        }
        const displayInfo = this.getFabTargetDisplayInfo();
        // 予約対象表示エリアの更新
        if (reservationTargetElement) {
            if (displayInfo.hasTarget && displayInfo.targetType === 'reservation') {
                reservationTargetElement.innerHTML = displayInfo.displayText.replace(/\n/g, '<br>');
                reservationTargetElement.classList.remove('hidden');
                reservationTargetElement.classList.add('visible');
                // カウントダウン中・効率モードタイマー実行中はログを削減
                if ( true && !this.efficiencyMode.updateTimer) {
                    console.log(`🔍 [予約対象表示更新] 表示: "${displayInfo.displayText}"`);
                }
            }
            else {
                reservationTargetElement.classList.remove('visible');
                reservationTargetElement.classList.add('hidden');
                reservationTargetElement.innerHTML = '';
            }
        }
    }
    // デバッグ情報の出力
    debugInfo() {
        console.group('[UnifiedState] デバッグ情報');
        console.log('実行状態:', this.executionState);
        console.log('優先度モード:', this.priorityMode);
        console.log('予約対象:', this.reservationTarget);
        console.log('予約可能:', this.canStartReservation());
        console.log('推奨アクション:', this.getPreferredAction());
        console.groupEnd();
    }
    // 既存のupdateStatusBadge関数を呼び出すヘルパー
    updateStatusBadgeFromUnified(mode, customText) {
        // 循環依存を避けるため、DOM直接操作で簡易実装
        const statusBadge = document.querySelector('#ytomo-status-badge');
        if (!statusBadge)
            return;
        // 既存の状態クラスをクリア
        statusBadge.className = statusBadge.className.replace(/ytomo-status-\w+/g, '').trim();
        switch (mode) {
            case 'reservation-running':
                statusBadge.classList.add('ytomo-status-reservation');
                if (customText) {
                    statusBadge.innerText = customText;
                }
                else {
                    statusBadge.innerText = '効率予約実行中';
                }
                statusBadge.classList.remove('js-hide');
                break;
            case 'idle-reservation':
                statusBadge.classList.add('ytomo-status-waiting');
                statusBadge.innerText = '予約可能';
                statusBadge.classList.remove('js-hide');
                break;
            case 'idle':
            default:
                statusBadge.classList.add('ytomo-status-waiting');
                statusBadge.innerText = '対象選択待ち';
                statusBadge.classList.remove('js-hide');
                break;
        }
    }
    // ============================================================================
    // UI更新処理（自己完結型）
    // ============================================================================
    // 削除: updateCountdownDisplay()は統一FAB更新システム(updateFabDisplay)に統合済み
    // ============================================================================
    // 効率モード管理
    // ============================================================================
    // 効率モードの有効/無効を切り替え
    toggleEfficiencyMode() {
        this.efficiencyMode.enabled = !this.efficiencyMode.enabled;
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
            this.saveEfficiencyModeSettings();
            this.log('🚀 効率モード有効化');
        }
        else {
            this.efficiencyMode.nextSubmitTarget = null;
            this.saveEfficiencyModeSettings();
            this.log('⏸️ 効率モード無効化');
        }
        return this.efficiencyMode.enabled;
    }
    // 効率モードの状態を取得（常にtrueを返す - 内部的に常時有効）
    isEfficiencyModeEnabled() {
        return true; // 効率モードは常に有効
    }
    // 次のsubmit標的時刻を取得
    getNextSubmitTarget() {
        return this.efficiencyMode.nextSubmitTarget;
    }
    // 次のsubmit標的時刻を設定
    setNextSubmitTarget(target) {
        this.efficiencyMode.nextSubmitTarget = target;
    }
    // 次の00秒/30秒を計算（15秒未満の場合は次の目標時刻を選択）
    calculateNext00or30Seconds() {
        const now = new Date();
        const currentSeconds = now.getSeconds();
        const nextTarget = new Date(now);
        let targetSeconds;
        let targetMinutes = nextTarget.getMinutes();
        // 0-2秒で0秒側に比重のあるランダム時間を生成（二次分布）
        const randomBuffer = Math.pow(Math.random(), 2) * 2; // 0～2秒、0側に比重
        if (currentSeconds < 30) {
            // 今の分の30秒 + ランダムバッファを候補とする
            targetSeconds = 30 + randomBuffer;
        }
        else {
            // 次の分の00秒 + ランダムバッファを候補とする
            targetMinutes += 1;
            targetSeconds = randomBuffer;
        }
        // 候補時刻までの猶予を計算
        const candidateTarget = new Date(now);
        candidateTarget.setMinutes(targetMinutes);
        candidateTarget.setSeconds(Math.floor(targetSeconds));
        candidateTarget.setMilliseconds((targetSeconds % 1) * 1000); // 小数部をミリ秒に
        const remainingMs = candidateTarget.getTime() - now.getTime();
        // 15秒未満の場合は30秒後に変更
        if (remainingMs < 15000) { // 15秒 = 15000ms
            candidateTarget.setSeconds(candidateTarget.getSeconds() + 30);
            this.log(`⚡ 効率モード: 猶予${Math.floor(remainingMs / 1000)}秒は短いため30秒後に変更`);
        }
        return candidateTarget;
    }
    // 次の標的時刻を更新（submit後に呼び出し）
    updateNextSubmitTarget() {
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
        }
    }
    // Phase 1: 統一自動処理管理での効率モード待機（中断可能）
    async waitForEfficiencyTarget(targetTime) {
        if (!this.automationManager.isRunning()) {
            console.log('⚠️ 統一自動処理が実行中でないため待機をスキップ');
            return false;
        }
        try {
            // UnifiedAutomationManagerの中断可能待機を使用
            // Phase 2で実装予定: 現在は基本的な待機のみ
            const waitMs = targetTime.getTime() - Date.now();
            if (waitMs > 0) {
                console.log(`🎯 統一効率モード待機: ${Math.floor(waitMs / 1000)}秒 (統一管理)`);
                await new Promise(resolve => setTimeout(resolve, waitMs));
            }
            return true;
        }
        catch (error) {
            if (error instanceof CancellationError) {
                console.log('⏹️ 効率モード待機が中断されました');
                return false;
            }
            throw error;
        }
    }
    // 効率モードFAB更新タイマー開始
    startEfficiencyModeUpdateTimer() {
        // 既存タイマーがあれば停止
        this.stopEfficiencyModeUpdateTimer();
        // 1秒間隔でFABボタン更新と目標時刻チェック
        this.efficiencyMode.updateTimer = window.setInterval(() => {
            // 目標時刻が過去になっていたら次の目標時刻に更新
            if (this.efficiencyMode.nextSubmitTarget &&
                this.efficiencyMode.nextSubmitTarget.getTime() <= Date.now()) {
                this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
                console.log('⚡ 効率モード: 目標時刻自動更新');
            }
            this.updateFabDisplay();
        }, 1000);
        console.log('⚡ 効率モードFAB更新タイマー開始');
    }
    // 効率モードFAB更新タイマー停止
    stopEfficiencyModeUpdateTimer() {
        if (this.efficiencyMode.updateTimer) {
            clearInterval(this.efficiencyMode.updateTimer);
            this.efficiencyMode.updateTimer = null;
            console.log('⚡ 効率モードFAB更新タイマー停止');
        }
    }
    // 効率モード設定保存
    saveEfficiencyModeSettings() {
        try {
            localStorage.setItem('ytomo-efficiency-mode', JSON.stringify({
                enabled: this.efficiencyMode.enabled
            }));
        }
        catch (error) {
            console.error('効率モード設定保存エラー:', error);
        }
    }
    // 効率モード設定読み込み
    loadEfficiencyModeSettings() {
        try {
            const saved = localStorage.getItem('ytomo-efficiency-mode');
            if (saved) {
                const settings = JSON.parse(saved);
                if (settings.enabled) {
                    this.efficiencyMode.enabled = true;
                    this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
                }
            }
        }
        catch (error) {
            console.error('効率モード設定読み込みエラー:', error);
        }
    }
    // ============================================================================
    // 通知音設定管理
    // ============================================================================
    // 通知音の有効/無効を切り替え
    toggleNotificationSound() {
        this.notificationSound.enabled = !this.notificationSound.enabled;
        this.saveNotificationSoundSettings();
        this.log(`🔊 通知音設定変更: ${this.notificationSound.enabled ? '有効' : '無効'}`);
        return this.notificationSound.enabled;
    }
    // 通知音が有効かどうか
    isNotificationSoundEnabled() {
        return this.notificationSound.enabled;
    }
    // 通知音設定を保存
    saveNotificationSoundSettings() {
        try {
            localStorage.setItem('ytomo-notification-sound', JSON.stringify({
                enabled: this.notificationSound.enabled
            }));
        }
        catch (error) {
            console.error('通知音設定保存エラー:', error);
        }
    }
    // 通知音設定を読み込み
    loadNotificationSoundSettings() {
        try {
            const saved = localStorage.getItem('ytomo-notification-sound');
            if (saved) {
                const settings = JSON.parse(saved);
                this.notificationSound.enabled = settings.enabled !== false; // デフォルトは有効
            }
        }
        catch (error) {
            console.error('通知音設定読み込みエラー:', error);
        }
    }
    // ============================================================================
    // changeダイアログ管理
    // ============================================================================
    // changeダイアログが表示されたことを記録
    markChangeDialogAppeared() {
        console.log(`🔄 [markChangeDialogAppeared] 現在の状態: hasAppeared=${this.changeDialogState.hasAppeared}, needsTimingAdjustment=${this.changeDialogState.needsTimingAdjustment}`);
        if (this.changeDialogState.hasAppeared) {
            // 2回目以降の出現：タイミング調整が必要
            this.changeDialogState.needsTimingAdjustment = true;
            console.log('🔄 changeダイアログ2回目以降の出現を検出 - タイミング調整が必要');
        }
        else {
            // 最初の出現：タイミング調整は不要
            this.changeDialogState.hasAppeared = true;
            this.changeDialogState.needsTimingAdjustment = false;
            console.log('🔄 changeダイアログ初回出現を検出 - タイミング調整はスキップ');
        }
    }
    // changeダイアログが出現したかどうか
    hasChangeDialogAppeared() {
        return this.changeDialogState.hasAppeared;
    }
    // changeダイアログのタイミング調整が必要か
    needsChangeDialogTimingAdjustment() {
        const result = this.changeDialogState.hasAppeared && this.changeDialogState.needsTimingAdjustment;
        console.log(`🔄 [needsChangeDialogTimingAdjustment] hasAppeared=${this.changeDialogState.hasAppeared}, needsTimingAdjustment=${this.changeDialogState.needsTimingAdjustment}, result=${result}`);
        return result;
    }
    // changeダイアログのタイミング調整用待機時間を計算
    calculateChangeDialogWaitTime() {
        if (!this.needsChangeDialogTimingAdjustment()) {
            return 0;
        }
        const now = new Date();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        // 現在時刻から次の00秒または30秒までの時間を計算
        let targetSeconds;
        if (seconds < 30) {
            targetSeconds = 30;
        }
        else {
            targetSeconds = 60; // 次の分の00秒
        }
        const waitMs = ((targetSeconds - seconds) * 1000) - milliseconds;
        const waitSeconds = Math.max(0, Math.floor(waitMs / 1000));
        console.log(`🔄 changeダイアログ待機時間計算: ${waitSeconds}秒 (現在: ${seconds}.${String(milliseconds).padStart(3, '0')}秒 → 目標: ${targetSeconds % 60}秒)`);
        return waitMs;
    }
    // changeダイアログのタイミング調整完了を記録
    markChangeDialogTimingAdjusted() {
        this.changeDialogState.needsTimingAdjustment = false;
        console.log('🔄 changeダイアログのタイミング調整完了');
    }
    // リロード時にchangeダイアログ状態をリセット（リロードするまで必ずchangeは出るため）
    resetChangeDialogState() {
        this.changeDialogState.hasAppeared = false;
        this.changeDialogState.needsTimingAdjustment = false;
        console.log('🔄 changeダイアログ状態をリセット');
    }
}
// 入場予約状態管理システムのシングルトンインスタンス
const entranceReservationStateManager = new EntranceReservationStateManager();


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

/***/ 141:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   getMonitoringStatus: () => (/* binding */ getMonitoringStatus),
/* harmony export */   startPavilionMonitoring: () => (/* binding */ startPavilionMonitoring),
/* harmony export */   stopPavilionMonitoring: () => (/* binding */ stopPavilionMonitoring)
/* harmony export */ });
/* unused harmony exports MonitoringService, getMonitoringService */
/* harmony import */ var _monitoring_scheduler__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(723);
/* harmony import */ var _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(76);
/* harmony import */ var _pavilion_reservation_cache__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(619);
/**
 * 監視サービス
 * API呼び出し・空き検知・自動予約実行
 */



class MonitoringService {
    constructor() {
        this.scheduler = (0,_monitoring_scheduler__WEBPACK_IMPORTED_MODULE_0__/* .getMonitoringScheduler */ .Yq)();
        this.isRunning = false;
    }
    /**
     * 監視を開始
     */
    async startMonitoring() {
        if (this.isRunning) {
            console.log('⚠️ 監視は既に実行中です');
            return false;
        }
        const targets = _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.getTargets();
        if (targets.length === 0) {
            console.log('⚠️ 監視対象がありません');
            return false;
        }
        this.isRunning = true;
        // 監視状態を更新
        _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.updateMonitoringState({
            isActive: true,
            targets,
            nextCheck: this.scheduler.getNextExecutionTime().getTime()
        });
        // スケジューラーを開始
        this.scheduler.start(async () => {
            await this.performMonitoringCheck();
        });
        console.log('🚀 パビリオン監視開始:', targets.length, '件');
        return true;
    }
    /**
     * 監視を停止
     */
    stopMonitoring() {
        if (!this.isRunning) {
            console.log('⚠️ 監視は実行されていません');
            return;
        }
        this.scheduler.stop();
        this.isRunning = false;
        // 監視状態を更新
        _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.updateMonitoringState({
            isActive: false,
            nextCheck: 0
        });
        console.log('⏹️ パビリオン監視停止');
    }
    /**
     * 監視チェックを実行
     */
    async performMonitoringCheck() {
        try {
            const targets = _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.getTargets();
            if (targets.length === 0) {
                console.log('📋 監視対象がないため監視を停止します');
                this.stopMonitoring();
                return {
                    success: false,
                    checkedTargets: 0,
                    foundAvailable: null,
                    error: '監視対象なし'
                };
            }
            console.log(`🔍 監視チェック開始 (${targets.length}件)`);
            // 各監視対象をチェック
            for (const target of targets) {
                const isAvailable = await this.checkTargetAvailability(target);
                if (isAvailable) {
                    console.log('🎯 空きを発見:', target);
                    // 自動予約を実行
                    await this.executeReservation(target);
                    // 監視対象から削除
                    _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.removeTarget(target.pavilionCode, target.timeSlot);
                    // 監視状態を更新
                    const currentState = _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.getMonitoringState();
                    _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.updateMonitoringState({
                        lastCheck: Date.now(),
                        checkCount: currentState.checkCount + 1,
                        nextCheck: this.scheduler.getNextExecutionTime().getTime()
                    });
                    return {
                        success: true,
                        checkedTargets: targets.length,
                        foundAvailable: target
                    };
                }
            }
            // 空きなしの場合
            console.log('📋 空きなし、監視継続');
            // 監視状態を更新
            const currentState = _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.getMonitoringState();
            _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.updateMonitoringState({
                lastCheck: Date.now(),
                checkCount: currentState.checkCount + 1,
                nextCheck: this.scheduler.getNextExecutionTime().getTime()
            });
            return {
                success: true,
                checkedTargets: targets.length,
                foundAvailable: null
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            console.error('❌ 監視チェックエラー:', errorMessage);
            // エラー時も状態更新
            const currentState = _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.getMonitoringState();
            _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.updateMonitoringState({
                lastCheck: Date.now(),
                checkCount: currentState.checkCount + 1,
                nextCheck: this.scheduler.getNextExecutionTime().getTime()
            });
            return {
                success: false,
                checkedTargets: 0,
                foundAvailable: null,
                error: errorMessage
            };
        }
    }
    /**
     * 特定対象の空き状況をチェック
     */
    async checkTargetAvailability(target) {
        try {
            const availability = await this.fetchPavilionAvailability(target.pavilionCode);
            if (!availability) {
                console.warn('⚠️ API応答なし:', target.pavilionCode);
                return false;
            }
            // 該当時間帯の空き状況をチェック
            const targetSlot = availability.timeSlots.find(slot => slot.time === target.timeSlot);
            if (!targetSlot) {
                console.warn('⚠️ 該当時間帯なし:', target.timeSlot);
                return false;
            }
            console.log(`📊 ${target.pavilionName} ${target.timeSlot}: ${targetSlot.available ? '空きあり' : '満員'}`);
            return targetSlot.available;
        }
        catch (error) {
            console.error('❌ 空き状況チェックエラー:', target.pavilionCode, error);
            return false;
        }
    }
    /**
     * パビリオン空き情報をAPI取得
     */
    async fetchPavilionAvailability(pavilionCode) {
        try {
            const url = `https://expo.ebii.net/data?pavilion=${pavilionCode}`;
            console.log('🌐 API呼び出し:', url);
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error(`API応答エラー: ${response.status}`);
            }
            const data = await response.json();
            // API応答をPavilionAvailability形式に変換
            return this.transformApiResponse(data, pavilionCode);
        }
        catch (error) {
            console.error('❌ API呼び出しエラー:', error);
            return null;
        }
    }
    /**
     * API応答を内部形式に変換
     */
    transformApiResponse(apiData, pavilionCode) {
        // TODO: 実際のAPI応答形式に合わせて実装
        // 現在は仮実装
        return {
            pavilionCode,
            pavilionName: apiData.pavilionName || `パビリオン${pavilionCode}`,
            timeSlots: apiData.timeSlots || []
        };
    }
    /**
     * 自動予約を実行
     */
    async executeReservation(target) {
        console.log('🤖 自動予約実行開始:', target);
        try {
            // 予約データを作成
            const reservationData = {
                pavilionCode: target.pavilionCode,
                pavilionName: target.pavilionName,
                selectedTimeSlot: target.timeSlot,
                selectedTimeDisplay: target.timeSlot,
                isAvailable: true,
                timestamp: Date.now(),
                status: 'pending'
            };
            // キャッシュに保存
            _pavilion_reservation_cache__WEBPACK_IMPORTED_MODULE_2__.PavilionReservationCache.saveReservationData(target.pavilionCode, reservationData);
            // 予約ページを開く
            // expoTable.jsを参照した正しいURL実装
            const ticketIds = new URLSearchParams(window.location.search).get('id') || '';
            const formatDateToYMD = () => {
                const date = new Date();
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}${m}${d}`;
            };
            const reservationUrl = `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${target.pavilionCode}&screen_id=108&lottery=5&entrance_date=${formatDateToYMD()}`;
            window.location.href = reservationUrl;
            console.log('✅ 予約ページに遷移:', reservationUrl);
            // 監視成功通知を送信
            this.sendNotificationToDialog('info', `監視成功: ${target.pavilionName} ${target.timeSlot} の空きを検知し予約開始`);
        }
        catch (error) {
            console.error('❌ 自動予約実行エラー:', error);
            throw error;
        }
    }
    /**
     * 監視状態を取得
     */
    getMonitoringStatus() {
        const stats = _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.getMonitoringStats();
        const nextCheck = this.scheduler.isActive() ?
            this.scheduler.getNextExecutionTime().toLocaleTimeString() : '停止中';
        return {
            isRunning: this.isRunning,
            targetCount: stats.totalTargets,
            stats,
            nextCheck
        };
    }
    /**
     * スケジュール設定を更新
     */
    updateSchedule(config) {
        this.scheduler.updateConfig(config);
    }
    /**
     * 手動チェック実行
     */
    async triggerManualCheck() {
        console.log('🔄 手動チェック実行');
        return await this.performMonitoringCheck();
    }
    /**
     * ダイアログに通知を送信
     */
    sendNotificationToDialog(type, message) {
        try {
            // グローバル関数が利用可能な場合に通知を送信
            if (typeof window.showReservationNotification === 'function') {
                window.showReservationNotification(type, message);
                console.log(`📢 監視通知送信: [${type}] ${message}`);
            }
            else {
                console.log('⚠️ 通知関数が利用できません');
            }
        }
        catch (error) {
            console.log(`❌ 通知送信エラー: ${error}`);
        }
    }
}
// グローバルインスタンス
let monitoringServiceInstance = null;
/**
 * 監視サービスのシングルトンインスタンスを取得
 */
function getMonitoringService() {
    if (!monitoringServiceInstance) {
        monitoringServiceInstance = new MonitoringService();
    }
    return monitoringServiceInstance;
}
/**
 * 監視開始（ショートカット関数）
 */
async function startPavilionMonitoring() {
    const service = getMonitoringService();
    return await service.startMonitoring();
}
/**
 * 監視停止（ショートカット関数）
 */
function stopPavilionMonitoring() {
    const service = getMonitoringService();
    service.stopMonitoring();
}
/**
 * 監視状況確認（ショートカット関数）
 */
function getMonitoringStatus() {
    const service = getMonitoringService();
    return service.getMonitoringStatus();
}
// デバッグ用グローバル公開
if (typeof window !== 'undefined') {
    window.startPavilionMonitoring = startPavilionMonitoring;
    window.stopPavilionMonitoring = stopPavilionMonitoring;
    window.getMonitoringStatus = getMonitoringStatus;
    window.debugMonitoringStatus = () => {
        console.group('🔍 監視サービス状況');
        console.log(getMonitoringStatus());
        _monitoring_cache__WEBPACK_IMPORTED_MODULE_1__.MonitoringCacheManager.debugInfo();
        console.groupEnd();
    };
}


/***/ }),

/***/ 214:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   a: () => (/* binding */ identify_page_type),
/* harmony export */   v: () => (/* binding */ PageChecker)
/* harmony export */ });
/**
 * ページ関連のユーティリティ関数
 * 循環import回避のための共通モジュール
 */
/**
 * ページチェッカー
 */
class PageChecker {
    /**
     * チケットサイトかどうかをチェック
     */
    static isTicketSite() {
        return window.location.hostname === 'ticket.expo2025.or.jp';
    }
    /**
     * 入場予約ページかどうかをチェック
     */
    static isEntranceReservationPage() {
        return window.location.pathname === '/ticket_visiting_reservation/';
    }
    /**
     * パビリオン検索ページかどうかをチェック
     */
    static isPavilionSearchPage() {
        return window.location.pathname === '/event_search/';
    }
    /**
     * チケット選択ページかどうかをチェック
     */
    static isTicketSelectionPage() {
        return window.location.pathname === '/ticket_selection/';
    }
    /**
     * 代理チケットページかどうかをチェック
     */
    static isAgentTicketPage() {
        return window.location.pathname === '/agent_ticket/';
    }
}
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


/***/ }),

/***/ 271:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Is: () => (/* binding */ isInterruptionAllowed),
/* harmony export */   MM: () => (/* binding */ setCacheManagerForSection6),
/* harmony export */   S9: () => (/* binding */ setCacheManager),
/* harmony export */   XP: () => (/* binding */ setEntranceReservationHelper),
/* harmony export */   ZK: () => (/* binding */ setPageLoadingState),
/* harmony export */   Zu: () => (/* binding */ restoreFromCache),
/* harmony export */   p4: () => (/* binding */ waitForValidCalendarDate),
/* harmony export */   rY: () => (/* binding */ getCurrentSelectedCalendarDate)
/* harmony export */ });
/* unused harmony exports checkTimeSlotTableExistsSync, getCurrentEntranceConfig, getCurrentMode, updateStatusBadge, scheduleReload, stopReloadCountdown */
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(79);
/* harmony import */ var _entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(38);
/**
 * 入場予約ページコア機能モジュール
 *
 * 【責務】
 * - 時間帯テーブルの存在確認・待機処理
 * - カレンダー日付管理（選択日付の取得・検証）
 * - 中断可能性判定ユーティリティ
 * - ページ状態管理・キャッシュ連携
 *
 * 【アーキテクチャ】
 * - ユーティリティ関数群: DOM操作の基盤機能を提供
 * - 状態管理連携: EntranceReservationStateManagerとの統合
 * - 依存注入: CacheManagerのセッター関数を提供
 *
 * @version v1.0.0 - 統一状態管理版
 * @dependencies EntranceReservationStateManager, DOM Utils
 */
// ==================== 依存モジュール import ====================
// 統一状態管理システム

// DOM操作ユーティリティ

// ============================================================================
// 時間帯分析システム - Section 5
// 【機能】
// - 時間帯テーブルの存在確認・待機処理
// - カレンダー日付管理・検証ユーティリティ
// - 中断可能性判定・ページ状態管理
// - キャッシュ管理システム連携
// ============================================================================
/**
 * キャッシュ管理インスタンス設定関数
 * 互換性維持のため保持されているが、現在は未使用
 *
 * @param _cm キャッシュ管理インスタンス（未使用）
 */
const setCacheManager = (_cm) => {
    // TODO: 必要に応じてキャッシュ連携機能を実装
};
/**
 * 時間帯テーブルの動的待機処理
 * DOMが動的に読み込まれるまで高速ポーリングで待機
 *
 * 【特徴】
 * - 50ms間隔の高速チェック（レスポンシブな検知）
 * - ランダム待機時間でCPU負荷軽減
 * - タイムアウト機能で無限ループ防止
 *
 * @param timeout タイムアウト時間（ミリ秒、デフォルト: 10秒）
 * @returns テーブル検出成功時true、タイムアウト時false
 */
async function waitForTimeSlotTable(timeout = 10000) {
    const startTime = Date.now();
    const checkInterval = 50; // 50msで高速チェック（レスポンシブな検知）
    console.log('🔍 時間帯テーブルの動的読み込みを待機中...');
    // ポーリングループ: タイムアウトまで継続
    while (Date.now() - startTime < timeout) {
        // 時間帯テーブルの存在確認
        if (checkTimeSlotTableExistsSync()) {
            console.log('✅ 時間帯テーブル検出成功 - DOM要素が利用可能です');
            return true;
        }
        // CPU負荷軽減のためのランダム待機（ジッター防止）
        const waitTime = checkInterval + Math.floor(Math.random() * 200); // 50-250msのランダム間隔
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    // タイムアウト時のエラーログ
    console.error(`⚠️ 時間帯テーブル待機タイムアウト (${timeout}ms) - DOM要素が読み込まれませんでした`);
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
// エクスポート

// 【6. カレンダー・UI状態管理】（entrance-page-ui.tsから統合）
// ============================================================================
// 依存注入用の参照
let cacheManagerSection6 = null;
// cacheManagerを設定するヘルパー関数
const setCacheManagerForSection6 = (cm) => {
    cacheManagerSection6 = cm;
};
// entranceReservationHelperを設定するヘルパー関数（互換性のため保持）
const setEntranceReservationHelper = (helper) => {
    // 必要な場合は、entrance-page-coreに設定
    console.log('setEntranceReservationHelper called:', typeof helper);
};
// メインボタンの表示更新（FAB形式対応）
// FAB更新の状態管理（統一状態管理システムで管理）
// FAB表示更新は統一状態管理システムで直接処理
// 現在のモードを取得するヘルパー関数（予約優先ロジック組み込み）
function getCurrentMode() {
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
function updateStatusBadge(mode) {
    const statusBadge = document.querySelector('#ytomo-status-badge');
    if (!statusBadge)
        return;
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
                }
                else {
                    message = '効率予約実行中';
                    bgClass = 'status-bg-orange';
                }
            }
            else {
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
                }
                else {
                    statusBadge.classList.remove('countdown-warning');
                }
            }
        }
        else {
            statusBadge.classList.remove('countdown-warning');
        }
    }
    else {
        // 統一状態管理システムによる更新
        entranceReservationStateManager.updateFabDisplay();
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
    // 即座に一度UI更新
    entranceReservationStateManager.updateFabDisplay();
}
// カウントダウン停止関数
function stopReloadCountdown() {
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
function setPageLoadingState(isLoading) {
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.setPageLoadingState(isLoading);
    }
    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.updateFabDisplay();
}
// 中断操作が許可されているかチェック
function isInterruptionAllowed() {
    // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        const isNearReload = false;
        // console.log(`🔍 中断可否チェック: nearReload=${isNearReload}`);
        return !isNearReload;
    }
    return true; // フォールバック：統合システムが利用できない場合は中断を許可
}
// ページ読み込み時のキャッシュ復元
async function restoreFromCache() {
    if (!cacheManagerSection6)
        return;
    const cached = cacheManagerSection6.loadTargetSlots();
    if (!cached)
        return;
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
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.updateFabDisplay();
        console.log('✅ キャッシュ復元完了');
    }, 200);
}
// waitForCalendar関数を追加（restoreFromCacheで使用）
async function waitForCalendar(timeout) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
        const selectedDate = document.querySelector('[aria-pressed="true"] time[datetime]');
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
        if (hasNADatetime) {
            console.log('⚠️ datetime="N/A"のため日付取得を待機中...');
        }
        else {
            console.log('⚠️ 選択中のカレンダー日付が見つかりません');
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
// 時間帯を自動選択して予約開始
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
// ============================================================================


/***/ }),

/***/ 307:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   O: () => (/* binding */ processingOverlay)
/* harmony export */ });
/* unused harmony export ProcessingOverlay */
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(79);
/* harmony import */ var _page_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(214);
/**
 * 自動処理中の誤動作防止オーバーレイシステム
 *
 * 予約実行中に画面全体を薄いオーバーレイで覆い、
 * 中断ボタン以外の操作を防ぐことで誤動作を防止
 */


class ProcessingOverlay {
    constructor() {
        this.overlayElement = null;
        this.isActive = false;
        this.countdownTimer = null;
        this.currentProcessType = null;
        this.urlObserver = null;
        this.initializeOverlay();
        this.setupUrlWatcher();
    }
    /**
     * オーバーレイ要素を初期化
     */
    initializeOverlay() {
        // 既存のオーバーレイがある場合は削除
        const existingOverlay = document.getElementById('ytomo-processing-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
        // オーバーレイ要素を作成
        this.overlayElement = document.createElement('div');
        this.overlayElement.id = 'ytomo-processing-overlay';
        this.overlayElement.className = 'ytomo-processing-overlay hidden z-normal';
        // メッセージエリア
        const messageArea = document.createElement('div');
        messageArea.className = 'processing-message-area';
        const messageText = document.createElement('div');
        messageText.className = 'processing-message-text';
        messageText.textContent = '自動処理実行中...';
        // 対象情報表示用の要素を追加
        const targetText = document.createElement('div');
        targetText.className = 'processing-target-text';
        targetText.textContent = '';
        // カウントダウン表示要素を追加
        const countdownText = document.createElement('div');
        countdownText.className = 'processing-countdown-text';
        countdownText.textContent = '';
        const warningText = document.createElement('div');
        warningText.className = 'processing-warning-text';
        warningText.textContent = '誤動作防止';
        const cancelArea = document.createElement('div');
        cancelArea.className = 'processing-cancel-area';
        cancelArea.innerHTML = '右下のボタンで中断';
        messageArea.appendChild(messageText);
        messageArea.appendChild(targetText);
        messageArea.appendChild(countdownText);
        messageArea.appendChild(warningText);
        messageArea.appendChild(cancelArea);
        this.overlayElement.appendChild(messageArea);
        // クリックイベントを処理（オーバーレイクリックをブロック）
        this.overlayElement.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            // クリック音的フィードバック
            this.showClickWarning();
        });
        // 右クリック、中クリックもブロック
        this.overlayElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });
        this.overlayElement.addEventListener('auxclick', (e) => {
            e.preventDefault();
        });
        // キーボードイベントもブロック（ESCキー以外）
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
        // bodyに追加
        document.body.appendChild(this.overlayElement);
        console.log('🛡️ 自動処理誤動作防止オーバーレイを初期化');
    }
    /**
     * URL変化監視の設定（SPA対応）
     */
    setupUrlWatcher() {
        let currentUrl = window.location.href;
        // MutationObserverでDOM変化を監視（SPA遷移検出）
        this.urlObserver = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
                currentUrl = window.location.href;
                this.onUrlChanged();
            }
        });
        // body全体の変更を監視
        this.urlObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
        // popstateイベントでも監視（戻る・進むボタン対応）
        window.addEventListener('popstate', () => {
            this.onUrlChanged();
        });
        console.log('🌐 URL変化監視を設定');
    }
    /**
     * URL変化時の処理
     */
    onUrlChanged() {
        if (this.isActive && this.currentProcessType) {
            console.log('🌐 URL変化検出 - オーバーレイ状態確認中');
            // より長い遅延を設けて、意図的な画面遷移と区別
            setTimeout(() => {
                // 依然としてアクティブな場合のみ再初期化
                if (this.isActive && this.currentProcessType) {
                    console.log('🔄 オーバーレイを迅速再設定');
                    this.reinitializeOverlay();
                }
                else {
                    console.log('🚫 処理完了により再初期化をスキップ');
                }
            }, 500);
        }
    }
    /**
     * オーバーレイの迅速再初期化
     */
    reinitializeOverlay() {
        if (!this.isActive || !this.currentProcessType)
            return;
        console.log('🔄 オーバーレイ迅速再初期化中...');
        // 既存のオーバーレイを削除
        if (this.overlayElement) {
            this.overlayElement.remove();
        }
        // 新しいオーバーレイを初期化
        this.initializeOverlay();
        // 現在のプロセスタイプで再表示
        const processType = this.currentProcessType;
        this.isActive = false; // showメソッドが実行されるようにリセット
        this.show(processType);
        console.log('✅ オーバーレイ迅速再初期化完了');
    }
    /**
     * キーボードイベントハンドラー
     */
    handleKeyDown(e) {
        if (!this.isActive)
            return;
        // ESCキーは許可（中断操作として機能させる）
        if (e.key === 'Escape') {
            // FABボタンのクリックをシミュレート
            const fabButton = document.getElementById('ytomo-main-fab');
            if (fabButton) {
                fabButton.click();
                e.preventDefault();
            }
            return;
        }
        // 他のキー操作をブロック（F5更新なども含む）
        if (e.key === 'F5' || (e.ctrlKey && (e.key === 'r' || e.key === 'R'))) {
            e.preventDefault();
            this.showRefreshWarning();
            return;
        }
        // その他のキー操作もブロック
        e.preventDefault();
        this.showClickWarning();
    }
    /**
     * オーバーレイを表示（自動処理開始時）
     */
    show(processType = 'reservation') {
        if (!this.overlayElement || this.isActive)
            return;
        console.log(`🛡️ 誤動作防止オーバーレイ表示: ${processType}`);
        // メッセージをプロセスタイプに応じて更新
        const messageText = this.overlayElement.querySelector('.processing-message-text');
        const targetText = this.overlayElement.querySelector('.processing-target-text');
        if (processType === 'companion') {
            // 同行者追加処理用のメッセージ
            if (messageText)
                messageText.textContent = '同行者追加処理実行中...';
            if (targetText)
                targetText.textContent = '自動処理を中断する場合は中断ボタンをクリック';
        }
        else {
            // 予約処理用のメッセージ（既存）
            let targetInfo = '対象なし';
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx && _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getFabTargetDisplayInfo) {
                const displayInfo = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getFabTargetDisplayInfo();
                if (displayInfo && displayInfo.hasTarget && displayInfo.targetType === 'reservation') {
                    targetInfo = displayInfo.displayText;
                }
            }
            if (messageText)
                messageText.textContent = '予約実行中...';
            if (targetText)
                targetText.textContent = targetInfo;
        }
        // 通知音トグルボタンが存在しない場合は追加（入場予約画面でのみ）
        const currentPageType = (0,_page_utils__WEBPACK_IMPORTED_MODULE_1__/* .identify_page_type */ .a)(window.location.href);
        if (processType === 'reservation' && currentPageType === 'entrance_reservation') {
            const existingNotificationToggle = this.overlayElement.querySelector('#ytomo-notification-toggle');
            if (!existingNotificationToggle) {
                console.log('🔊 show()で通知音トグルボタンを追加中...');
                this.addNotificationToggleButton();
            }
        }
        // 表示アニメーション
        this.overlayElement.classList.remove('hidden');
        this.overlayElement.classList.add('visible');
        // FABボタンのz-indexを調整（オーバーレイより前面に）
        this.adjustFabButtonsForOverlay();
        if (processType === 'companion') {
            // 同行者処理の場合は専用中断ボタンを作成
            this.createAbortButton();
        }
        else {
            // 予約処理の場合は既存FABボタンを有効化
            this.ensureFabButtonsVisible();
        }
        this.isActive = true;
        this.currentProcessType = processType; // プロセスタイプを保存
        // カウントダウン監視開始
        this.startCountdownMonitoring();
    }
    /**
     * オーバーレイを非表示（自動処理終了時）
     */
    hide() {
        if (!this.overlayElement || !this.isActive)
            return;
        console.log('🛡️ 誤動作防止オーバーレイ非表示');
        // 非表示アニメーション
        this.overlayElement.classList.remove('visible');
        this.overlayElement.classList.add('hidden');
        // FABボタンのz-indexを元に戻す
        this.restoreFabButtonsFromOverlay();
        // 中断ボタンを削除
        this.removeAbortButton();
        this.isActive = false;
        this.currentProcessType = null; // プロセスタイプをクリア
        // カウントダウン監視停止
        this.stopCountdownMonitoring();
    }
    /**
     * オーバーレイクリック時の警告表示
     */
    showClickWarning() {
        const warningText = this.overlayElement?.querySelector('.processing-warning-text');
        if (!warningText)
            return;
        // 一時的に警告を強調
        warningText.classList.add('warning-flash');
        setTimeout(() => {
            warningText.classList.remove('warning-flash');
        }, 1000);
    }
    /**
     * ページ更新試行時の警告表示
     */
    showRefreshWarning() {
        const warningText = this.overlayElement?.querySelector('.processing-warning-text');
        if (!warningText)
            return;
        const originalText = warningText.textContent;
        warningText.textContent = '⚠️ 処理中のページ更新は危険です！中断してから更新してください';
        warningText.classList.add('warning-flash');
        setTimeout(() => {
            warningText.textContent = originalText;
            warningText.classList.remove('warning-flash');
        }, 3000);
    }
    /**
     * オーバーレイが表示中かどうか
     */
    isVisible() {
        return this.isActive;
    }
    /**
     * カウントダウン表示を更新
     * @param countdownText カウントダウン文字列
     * @param isWarning 警告状態かどうか
     */
    updateCountdown(countdownText, isWarning = false) {
        if (!this.overlayElement || !this.isActive)
            return;
        const countdownElement = this.overlayElement.querySelector('.processing-countdown-text');
        if (countdownElement) {
            countdownElement.textContent = countdownText;
            // 警告スタイルの切り替え
            if (isWarning) {
                countdownElement.classList.add('countdown-warning');
            }
            else {
                countdownElement.classList.remove('countdown-warning');
            }
        }
    }
    /**
     * カウントダウン表示をクリア
     */
    clearCountdown() {
        if (!this.overlayElement)
            return;
        const countdownElement = this.overlayElement.querySelector('.processing-countdown-text');
        if (countdownElement) {
            countdownElement.textContent = '';
            countdownElement.classList.remove('countdown-warning');
        }
    }
    /**
     * カウントダウン監視開始
     */
    startCountdownMonitoring() {
        if (this.countdownTimer)
            return; // 既に監視中
        this.countdownTimer = window.setInterval(() => {
            this.updateCountdownFromState();
        }, 1000); // 1秒ごとに更新
    }
    /**
     * カウントダウン監視停止
     */
    stopCountdownMonitoring() {
        if (this.countdownTimer) {
            clearInterval(this.countdownTimer);
            this.countdownTimer = null;
        }
    }
    /**
     * 状態管理からカウントダウン情報を取得して更新
     */
    updateCountdownFromState() {
        if (!this.isActive || !this.overlayElement)
            return;
        try {
            // 予約実行中の効率モードカウントダウン
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getExecutionState() === _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .ExecutionState */ .si.RESERVATION_RUNNING) {
                const nextTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getNextSubmitTarget();
                if (nextTarget) {
                    const now = new Date();
                    const remainingMs = nextTarget.getTime() - now.getTime();
                    if (remainingMs > 0) {
                        const remainingSec = Math.floor(remainingMs / 1000);
                        const countdownText = `次回: ${remainingSec}秒後`;
                        const isWarning = remainingSec <= 5;
                        this.updateCountdown(countdownText, isWarning);
                        return;
                    }
                }
            }
            // カウントダウン対象がない場合はクリア
            this.clearCountdown();
        }
        catch (error) {
            console.warn('カウントダウン更新エラー:', error);
        }
    }
    /**
     * 中断ボタンを作成
     */
    createAbortButton() {
        // 既存の中断ボタンがあれば削除
        const existingAbortButton = document.getElementById('ytomo-processing-abort-button');
        if (existingAbortButton) {
            existingAbortButton.remove();
        }
        // 中断ボタン作成
        const abortButton = document.createElement('button');
        abortButton.id = 'ytomo-processing-abort-button';
        abortButton.classList.add('ext-ytomo', 'ytomo-abort-button');
        abortButton.textContent = '中断';
        // インラインスタイル完全削除 - 全てSCSSで管理
        // クリックイベント
        abortButton.addEventListener('click', () => {
            this.handleAbortClick();
        });
        // bodyに追加
        document.body.appendChild(abortButton);
        console.log('🛑 処理中断ボタンを作成しました');
    }
    /**
     * 中断ボタンクリック処理
     */
    handleAbortClick() {
        console.log('🛑 処理中断ボタンがクリックされました');
        // 処理タイプに応じて中断処理を実行
        if (this.currentProcessType === 'companion') {
            // 同行者処理の中断（確認なし）
            this.abortCompanionProcess();
            this.hide();
        }
        else if (this.currentProcessType === 'reservation') {
            // 予約処理の中断（確認ダイアログあり）
            this.showCustomConfirm('処理を中断しますか？', () => {
                this.abortReservationProcess();
                this.hide();
            });
        }
    }
    /**
     * 同行者処理の中断
     */
    abortCompanionProcess() {
        console.log('🛑 同行者追加処理を中断中...');
        // companion-ticket-pageのプロセスマネージャーを停止
        try {
            // 適切なimportを使用するべきだが、現在はモジュール構造上の制約でwindow経由でアクセス
            // TODO: 将来的にはcompanion-ticket-pageから直接importするようにリファクタリングが必要
            const companionProcessManager = window.companionProcessManager;
            if (companionProcessManager && typeof companionProcessManager.stopProcess === 'function') {
                companionProcessManager.stopProcess();
                console.log('✅ 同行者追加処理を正常に中断しました');
            }
            else {
                console.warn('⚠️ companionProcessManagerが見つかりません');
            }
        }
        catch (error) {
            console.error('❌ 同行者処理中断でエラー:', error);
        }
    }
    /**
     * 予約処理の中断
     */
    abortReservationProcess() {
        console.log('🛑 予約処理を中断中...');
        // 既存の予約中断処理と連携
        try {
            const fabButton = document.getElementById('ytomo-main-fab');
            if (fabButton) {
                fabButton.click();
            }
        }
        catch (error) {
            console.error('❌ 予約処理中断でエラー:', error);
        }
    }
    /**
     * 中断ボタンを削除
     */
    removeAbortButton() {
        const abortButton = document.getElementById('ytomo-processing-abort-button');
        if (abortButton) {
            abortButton.remove();
            console.log('🛑 処理中断ボタンを削除しました');
        }
    }
    /**
     * FABボタンをオーバーレイより前面に調整
     */
    adjustFabButtonsForOverlay() {
        // 複数のFABコンテナIDを試行
        const fabContainerIds = [
            'ytomo-fab-container',
            'ytomo-ticket-selection-fab-container',
            'ytomo-pavilion-fab-container'
        ];
        fabContainerIds.forEach(id => {
            const fabContainer = document.getElementById(id);
            if (fabContainer) {
                fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-above-overlay';
                console.log(`🛡️ FABコンテナ "${id}" をオーバーレイより前面に調整`);
            }
        });
    }
    /**
     * FABボタンを確実に表示・有効化
     */
    ensureFabButtonsVisible() {
        // 複数のFABボタンIDを試行
        const fabButtonIds = [
            'ytomo-main-fab',
            'ytomo-ticket-selection-main-fab',
            'ytomo-pavilion-main-fab'
        ];
        let fabFound = false;
        fabButtonIds.forEach(id => {
            const fabButton = document.getElementById(id);
            if (fabButton) {
                fabButton.disabled = false;
                fabButton.style.display = 'flex';
                fabButton.style.visibility = 'visible';
                fabButton.style.opacity = '1';
                fabFound = true;
                console.log(`🛡️ [システム連動] FABボタン "${id}" を中断可能状態に設定`);
            }
        });
        if (!fabFound) {
            console.warn('⚠️ 中断用FABボタンが見つかりません - 全画面検索実行');
            // フォールバック：全画面でFABボタンを検索
            const allFabs = document.querySelectorAll('[id*="fab"]');
            allFabs.forEach(fab => {
                if (fab.id && (fab.id.includes('ytomo') || fab.id.includes('main'))) {
                    fab.disabled = false;
                    fab.style.display = 'flex';
                    fab.style.visibility = 'visible';
                    fab.style.opacity = '1';
                    console.log(`🛡️ [フォールバック] FABボタン "${fab.id}" を発見・有効化`);
                }
            });
        }
    }
    /**
     * FABボタンのz-indexを元に戻す
     */
    restoreFabButtonsFromOverlay() {
        const fabContainerIds = [
            'ytomo-fab-container',
            'ytomo-ticket-selection-fab-container',
            'ytomo-pavilion-fab-container'
        ];
        fabContainerIds.forEach(id => {
            const fabContainer = document.getElementById(id);
            if (fabContainer) {
                fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-normal';
            }
        });
    }
    /**
     * カスタム確認ダイアログ
     */
    showCustomConfirm(message, onConfirm) {
        const overlay = document.createElement('div');
        overlay.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100% !important;
            height: 100% !important;
            background: rgba(0, 0, 0, 0.5) !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            z-index: 100010 !important;
        `;
        const dialog = document.createElement('div');
        dialog.style.cssText = `
            background: white !important;
            border-radius: 8px !important;
            padding: 24px !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
            max-width: 400px !important;
            text-align: center !important;
        `;
        dialog.innerHTML = `
            <p style="margin: 0 0 16px 0; font-size: 16px; color: #333;">${message}</p>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button id="custom-confirm-cancel" style="padding: 8px 16px; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    キャンセル
                </button>
                <button id="custom-confirm-ok" style="padding: 8px 16px; background: #f44336; color: white; border: none; border-radius: 4px; cursor: pointer;">
                    中断する
                </button>
            </div>
        `;
        const cancelBtn = dialog.querySelector('#custom-confirm-cancel');
        const okBtn = dialog.querySelector('#custom-confirm-ok');
        const closeDialog = () => {
            document.body.removeChild(overlay);
        };
        cancelBtn.addEventListener('click', closeDialog);
        okBtn.addEventListener('click', () => {
            closeDialog();
            onConfirm();
        });
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                closeDialog();
            }
        });
        overlay.appendChild(dialog);
        document.body.appendChild(overlay);
    }
    /**
     * 通知音トグルボタンのクリック処理
     */
    handleNotificationToggle() {
        const isEnabled = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.toggleNotificationSound();
        console.log(`🔊 通知音設定変更: ${isEnabled ? '有効' : '無効'}`);
        // ボタンの表示を更新
        const toggleButton = document.getElementById('ytomo-notification-toggle');
        if (toggleButton) {
            this.updateNotificationToggleButton(toggleButton);
        }
    }
    /**
     * 通知音トグルボタンを動的に追加
     */
    addNotificationToggleButton() {
        if (!this.overlayElement)
            return;
        const messageArea = this.overlayElement.querySelector('.processing-message-area');
        if (!messageArea)
            return;
        console.log('🔊 通知音トグルボタンを動的に追加中...');
        const notificationToggle = document.createElement('button');
        notificationToggle.id = 'ytomo-notification-toggle';
        notificationToggle.className = 'notification-toggle-btn';
        // MDIアイコンとトグル状態を設定
        this.updateNotificationToggleButton(notificationToggle);
        // トグルボタンのクリックイベント
        notificationToggle.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleNotificationToggle();
        });
        // warningTextの後、cancelAreaの前に挿入
        const warningText = messageArea.querySelector('.processing-warning-text');
        const cancelArea = messageArea.querySelector('.processing-cancel-area');
        if (warningText && cancelArea) {
            messageArea.insertBefore(notificationToggle, cancelArea);
            console.log('✅ 通知音トグルボタンを動的に追加完了');
        }
        else {
            console.warn('⚠️ 挿入位置要素が見つかりません');
        }
    }
    /**
     * 通知音トグルボタンの表示を更新
     */
    updateNotificationToggleButton(button) {
        const isEnabled = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.isNotificationSoundEnabled();
        // シンプルなテキストアイコンを設定
        if (isEnabled) {
            button.innerHTML = '🔊';
            button.title = '通知音有効（クリックで無効化）';
            button.classList.remove('muted');
            button.classList.add('enabled');
        }
        else {
            button.innerHTML = '🔇';
            button.title = '通知音無効（クリックで有効化）';
            button.classList.remove('enabled');
            button.classList.add('muted');
        }
    }
    /**
     * オーバーレイを破棄
     */
    destroy() {
        if (this.overlayElement) {
            this.overlayElement.remove();
            this.overlayElement = null;
        }
        document.removeEventListener('keydown', this.handleKeyDown.bind(this));
        this.stopCountdownMonitoring();
        this.isActive = false;
        console.log('🛡️ 誤動作防止オーバーレイを破棄');
    }
}
// グローバルインスタンス
const processingOverlay = new ProcessingOverlay();


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

/***/ 357:
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
___CSS_LOADER_EXPORT___.push([module.id, `#ytomo-status-badge.countdown-warning{background:rgba(255,0,0,.9)}.ytomo-efficiency-toggle{width:45px;height:32px;border-radius:16px;color:#fff;border:none;font-size:10px;font-weight:bold;cursor:pointer;transition:all .2s ease;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;pointer-events:auto;margin-bottom:8px}.ytomo-efficiency-toggle.efficiency-enabled{background:rgba(255,140,0,.9)}.ytomo-efficiency-toggle.efficiency-disabled{background:rgba(128,128,128,.9)}.ytomo-efficiency-toggle:hover{transform:scale(1.1);box-shadow:0 4px 12px rgba(0,0,0,.4)}.ytomo-efficiency-toggle:active{transform:scale(0.95)}button.ext-ytomo{height:40px;width:auto;min-width:60px;padding:0px 8px;background:#006821;color:#fff}button.ext-ytomo.no-after:after{background:rgba(0,0,0,0) none repeat 0 0/auto auto padding-box border-box scroll}button.ext-ytomo.btn-done{background:#4a4c4a}button.ext-ytomo:hover{background:#02862b}.fab-sub-btn{color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:12px;white-space:nowrap;transition:all .2s ease}.fab-sub-btn.btn-enabled{background:#006821;cursor:pointer;opacity:1}.fab-sub-btn.btn-enabled:hover{background:#02862b;transform:scale(1.05)}.fab-sub-btn.btn-enabled.btn-done{background:#4a4c4a}.fab-sub-btn.btn-enabled.btn-done:hover{background:#606260}.fab-sub-btn.btn-disabled,.fab-sub-btn.btn-loading{background:gray;cursor:not-allowed;opacity:.6}.fab-sub-btn.btn-disabled:hover,.fab-sub-btn.btn-loading:hover{background:gray;transform:scale(1)}.fab-sub-btn:disabled{background:gray !important;cursor:not-allowed !important;opacity:.6 !important}.fab-sub-btn:disabled:hover{background:gray !important;transform:scale(1) !important}button.ext-ytomo.pavilion-sub-btn.btn-disabled,button.ext-ytomo.pavilion-sub-btn.btn-loading{background:gray;cursor:not-allowed;opacity:.6}button.ext-ytomo.pavilion-sub-btn.btn-disabled:hover,button.ext-ytomo.pavilion-sub-btn.btn-loading:hover{background:gray;transform:scale(1)}.safe-none,.ytomo-none,.filter-none{display:none}.fab-sub-btn span.button-count{font-family:"Courier New","Monaco",monospace;font-weight:bold;color:#ffeb3b;vertical-align:baseline}button.ext-ytomo.pavilion-sub-btn.ytomo-date-button.date-selected{border:2px solid #4caf50;box-shadow:0 0 8px rgba(76,175,80,.6)}div.div-flex{display:flex;justify-content:center;margin:5px}div.div-flex input.ext-tomo.search{flex:1;padding:8px 12px;border:1px solid #ddd;border-radius:4px;font-size:14px;margin-right:8px}div.div-flex input.ext-tomo.search:focus{outline:none;border-color:#006821;box-shadow:0 0 0 2px rgba(0,104,33,.2)}div.div-flex button.btn-filter-without-load{height:auto;min-height:40px;width:auto;min-width:60px;padding:0px 8px;color:#fff;margin:5px;background:#006821;border:none;border-radius:4px;cursor:pointer;font-size:14px}div.div-flex button.btn-filter-without-load:hover{background:#02862b}div.div-flex button.btn-filter-without-load:active{background:#005417}div.div-flex button.btn-filter-without-load:disabled{background:gray;cursor:not-allowed}.js-show{display:block}.js-hide{display:none}.js-visible{visibility:visible}.js-invisible{visibility:hidden}.js-enabled{pointer-events:auto;opacity:1}.js-disabled{pointer-events:none;opacity:.6}.js-green{background:#228b22;color:#fff}.js-red{background:#dc3545;color:#fff}.js-gray{background:gray;color:#fff}.btn-success-highlight{background:#00c800;color:#fff}.status-bg-green{background:rgba(0,128,0,.9)}.status-bg-red{background:rgba(255,0,0,.9)}.status-bg-orange{background:rgba(255,140,0,.9)}.status-bg-blue{background:rgba(0,104,33,.9)}.status-bg-default{background:rgba(0,0,0,.8)}#ytomo-status-badge{background:linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9));color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:bold;white-space:pre-line;box-shadow:0 4px 12px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.2);border:2px solid hsla(0,0%,100%,.15);pointer-events:none}#ytomo-status-badge.ytomo-status-waiting{background:linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9))}#ytomo-status-badge.ytomo-status-reservation{background:linear-gradient(135deg, rgba(255, 140, 0, 0.9), rgba(255, 165, 0, 0.9))}#ytomo-status-badge.ytomo-status-reservation.ytomo-status-countdown-warning{background:linear-gradient(135deg, rgba(255, 0, 0, 0.9), rgba(220, 53, 69, 0.9))}#ytomo-status-badge.ytomo-status-cooldown{background:linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(255, 140, 0, 0.9))}.ytomo-header li.fab-toggle-li{display:inline-block;margin-right:8px}.ytomo-header li.fab-toggle-li button.fab-toggle-button{background:none;border:none;cursor:pointer;padding:0;color:#fff;transition:all .2s ease;display:flex;align-items:center;justify-content:center}.ytomo-header li.fab-toggle-li button.fab-toggle-button:hover{color:#ddd}.ytomo-header li.fab-toggle-li button.fab-toggle-button figure.fab-toggle-figure{width:auto;height:24px;display:flex;align-items:center;justify-content:center;padding:0 4px}.ytomo-pavilion-fab button.ytomo-fab{position:relative}.ytomo-pavilion-fab button.ytomo-fab:hover{transform:scale(1.15);box-shadow:0 8px 25px rgba(0,0,0,.5),0 4px 12px rgba(0,0,0,.3);border-width:4px}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-expand-icon{font-size:8px;line-height:1;margin-bottom:1px;opacity:.8}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-brand-text{font-size:7px;font-weight:normal;line-height:1;margin-bottom:2px;opacity:.7}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-counts-text{font-size:12px;font-weight:bold;line-height:1}.ytomo-pavilion-fab .pavilion-sub-actions-container{display:none;flex-direction:column;gap:8px;align-items:flex-end;margin-bottom:8px}.ytomo-pavilion-fab .pavilion-sub-actions-container.expanded{display:flex}.ytomo-pavilion-fab .pavilion-sub-actions-container button.pavilion-sub-btn.base-style{color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3);transition:all .2s ease}.ytomo-companion-dialog{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;box-sizing:border-box}.ytomo-companion-dialog .dialog-content{background:#fff;border-radius:12px;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.3)}@media(max-width: 768px){.ytomo-companion-dialog .dialog-content{max-width:95vw;max-height:85vh;padding:16px;border-radius:8px}}.ytomo-companion-dialog .dialog-content .input-row{display:flex;gap:8px;margin-bottom:12px}@media(max-width: 480px){.ytomo-companion-dialog .dialog-content .input-row{flex-direction:column;gap:12px}}.ytomo-companion-dialog .dialog-content .input-row input{padding:12px 8px;border:1px solid #ddd;border-radius:4px;font-size:16px}.ytomo-companion-dialog .dialog-content .input-row input:focus{outline:none;border-color:#4caf50;box-shadow:0 0 0 2px rgba(76,175,80,.2)}.ytomo-companion-dialog .dialog-content .input-row button{padding:12px 16px;background:#4caf50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;white-space:nowrap;min-width:60px}.ytomo-companion-dialog .dialog-content .input-row button:hover{background:#45a049}.ytomo-companion-dialog .dialog-content .input-row button:active{background:#3d8b40}.ytomo-abort-button{position:fixed;bottom:100px;right:24px;z-index:100001;background:#f44336;color:#fff;border:none;border-radius:50%;width:64px;height:64px;font-size:12px;font-weight:bold;cursor:pointer;box-shadow:0 4px 12px rgba(244,67,54,.4);transition:all .3s ease;display:flex;align-items:center;justify-content:center}.ytomo-abort-button:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(244,67,54,.6)}.ytomo-abort-button:active{transform:scale(0.95)}.copy-ticket-btn{margin-left:8px;padding:6px;background:#f0f0f0;border:1px solid #ddd;border-radius:4px;cursor:pointer;display:flex;align-items:center;justify-content:center;min-width:32px;height:32px;transition:all .3s ease}.copy-ticket-btn:hover{background:#e0e0e0;border-color:#ccc}.copy-ticket-btn:active{transform:scale(0.95)}.copy-ticket-btn svg{color:#666;transition:all .3s ease}.copy-ticket-btn.copy-success{background:rgba(76,175,80,.1);border-color:#4caf50}.copy-ticket-btn.copy-success svg{color:#4caf50}.dialog-btn{padding:8px 16px;border:none;border-radius:4px;cursor:pointer;font-size:14px;font-weight:bold;transition:all .2s ease}.dialog-btn.btn-cancel{background:#666;color:#fff}.dialog-btn.btn-cancel:hover{background:#555}.dialog-btn.btn-delete{background:#f44336;color:#fff}.dialog-btn.btn-delete:hover{background:#d32f2f}.dialog-btn.btn-execute{background:#2196f3;color:#fff}.dialog-btn.btn-execute:hover{background:#1976d2}.dialog-btn.btn-execute.btn-disabled{background:#ccc;color:#666;cursor:not-allowed}.dialog-btn.btn-execute.btn-disabled:hover{background:#ccc}.ticket-row{display:flex;align-items:center;padding:8px;border-bottom:1px solid #eee;transition:background-color .2s ease;cursor:pointer}.ticket-row:last-child{border-bottom:none}.ticket-row.already-added{position:relative;opacity:.6;background:repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255, 140, 0, 0.1) 8px, rgba(255, 140, 0, 0.1) 16px)}.ticket-row.already-added::after{content:"追加済み";position:absolute;top:4px;right:40px;background:rgba(255,140,0,.9);color:#fff;font-size:10px;font-weight:bold;padding:2px 6px;border-radius:3px;pointer-events:none}.ticket-row.already-added input[type=checkbox]{opacity:.5;cursor:not-allowed}.ticket-row.already-added .copy-ticket-btn{opacity:1;background:#f8f8f8;border-color:#bbb}.ticket-row.already-added .copy-ticket-btn:hover{background:#e8e8e8;border-color:#999}.ytomo-fab{width:56px;height:56px;border-radius:50%;color:#fff;border:none;box-shadow:0 6px 20px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.2);border:3px solid hsla(0,0%,100%,.2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;transition:all .3s ease;position:relative;overflow:hidden;pointer-events:auto}.ytomo-fab-enabled{background:#ff8c00;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab-disabled{background:gray;opacity:.6;cursor:not-allowed;pointer-events:none}.ytomo-fab-running{background:#dc3545;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab.state-idle{background:gray;opacity:.6;cursor:not-allowed;pointer-events:none}.ytomo-fab.pointer-events-none{pointer-events:none}.ytomo-fab.pointer-events-auto{pointer-events:auto}.ytomo-fab.state-enabled{background:#ff8c00;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab.state-running{background:#dc3545;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab.state-reservation{background:#ff8c00;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab:hover{transform:scale(1.15);box-shadow:0 8px 25px rgba(0,0,0,.5),0 4px 12px rgba(0,0,0,.3)}.ytomo-fab.reservation-enabled{background:#006821;opacity:.9;cursor:pointer}.ytomo-fab.reservation-disabled{background:gray;opacity:.9;cursor:not-allowed}.ytomo-fab.cooldown-warning{background:#ff6b35}.ytomo-fab.cooldown-normal{background:#007bff}.ytomo-fab-container{position:fixed;bottom:100px;right:24px;z-index:10000;display:flex;flex-direction:column;align-items:flex-end;gap:12px;pointer-events:auto}.ytomo-fab-container.z-normal{z-index:10000}.ytomo-fab-container.z-above-overlay{z-index:100001}.ytomo-fab-container.visible{display:flex}.ytomo-fab-container.hidden{display:none}.ytomo-fab-content{position:relative;display:flex;flex-direction:column-reverse;align-items:center;gap:8px;opacity:0;transform:scale(0.8) translateY(10px);transition:all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);pointer-events:none}.ytomo-fab-content.expanded{opacity:1;transform:scale(1) translateY(0);pointer-events:auto}.ytomo-sub-fab{width:45px;height:32px;border-radius:16px;background:rgba(0,104,33,.9);color:#fff;border:none;font-size:11px;font-weight:bold;cursor:pointer;transition:all .2s ease;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;pointer-events:auto}.ytomo-sub-fab:hover{background:rgba(2,134,43,.9);transform:scale(1.1);box-shadow:0 4px 12px rgba(0,0,0,.4)}.ytomo-sub-fab:active{transform:scale(0.95)}.ytomo-pavilion-fab-container{position:fixed;bottom:100px;right:24px;z-index:10000;display:flex;flex-direction:column;gap:12px;align-items:flex-end;pointer-events:auto}.ytomo-ticket-selection-fab-container{position:fixed;bottom:100px;right:24px;z-index:10000;display:flex;flex-direction:column;gap:12px;align-items:flex-end;pointer-events:auto}.ytomo-ticket-selection-fab-container.z-normal{z-index:10000}.ytomo-ticket-selection-fab-container.z-above-overlay{z-index:100001}.ytomo-ticket-selection-fab-container #ytomo-companion-sub-buttons{display:flex;flex-direction:column;gap:8px;align-items:flex-end;transition:all .3s ease}.ytomo-fab-inner-content{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;pointer-events:none}.ytomo-reservation-target-display{background:linear-gradient(135deg, rgba(0, 123, 255, 0.95), rgba(0, 86, 179, 0.95));color:#fff;padding:8px 12px;border-radius:12px;font-size:12px;font-weight:bold;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.3);border:2px solid hsla(0,0%,100%,.3);min-width:80px;max-width:120px;white-space:pre-line;overflow:visible;text-overflow:clip;transition:all .3s ease;pointer-events:auto;cursor:pointer}.ytomo-reservation-target-display:hover{transform:scale(1.05);box-shadow:0 4px 14px rgba(0,0,0,.4)}.ytomo-reservation-target-display.hidden{display:none}.ytomo-reservation-target-display.visible{display:block}input.ext-tomo.search{height:50px;min-width:200px;max-width:min(300px,100%);font-family:quicksand;font-size:16px;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield;border:1px solid #222426;border-radius:25px;box-shadow:0 1px 0 0 #ccc;padding:0 0 0 10px;flex:1 1}.day-reservation-info-area{position:relative;min-height:50px}.day-reservation-description{margin:10px 0;color:#666;font-size:14px;line-height:1.5;text-align:center}.day-reservation-description.hidden{display:none}.day-reservation-notification{margin:10px 0}.day-reservation-notification.hidden{display:none}.day-reservation-notification .notification-content{padding:12px 16px;border-radius:8px;font-size:14px;font-weight:500;display:flex;align-items:center;justify-content:space-between;min-height:24px;position:relative}.day-reservation-notification .notification-content .notification-message{flex:1;margin-left:8px;margin-right:8px}.day-reservation-notification .notification-content .notification-close{background:none;border:none;font-size:18px;font-weight:bold;cursor:pointer;padding:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;opacity:.7;transition:opacity .2s ease}.day-reservation-notification .notification-content .notification-close:hover{opacity:1}.day-reservation-notification .notification-content.success{background-color:#d4edda;color:#155724;border:1px solid #c3e6cb}.day-reservation-notification .notification-content.success .notification-close{color:#155724}.day-reservation-notification .notification-content.error{background-color:#f8d7da;color:#721c24;border:1px solid #f5c6cb}.day-reservation-notification .notification-content.error .notification-close{color:#721c24}.day-reservation-notification .notification-content.warning{background-color:#fff3cd;color:#856404;border:1px solid #ffeaa7}.day-reservation-notification .notification-content.warning .notification-close{color:#856404}.day-reservation-notification .notification-content.info{background-color:#d1ecf1;color:#0c5460;border:1px solid #bee5eb}.day-reservation-notification .notification-content.info .notification-close{color:#0c5460}.ytomo-icon.expand-icon{font-size:8px;line-height:1;color:#fff;font-weight:bold;text-align:center;pointer-events:none}.ytomo-icon.countdown-text{font-size:6px;line-height:1;color:#fff;font-weight:bold;text-align:center;margin-top:1px;pointer-events:none}.ytomo-toggle.toggle-li{position:fixed;bottom:10px;left:10px;z-index:1000;list-style:none;margin:0;padding:0}.ytomo-toggle.toggle-button{width:50px;height:30px;background:rgba(255,140,0,.8);border:none;border-radius:15px;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;position:relative;overflow:hidden}.ytomo-toggle.toggle-button.enabled{color:#fff}.ytomo-toggle.toggle-button.disabled{color:#ddd}.ytomo-toggle.toggle-figure{width:100%;height:100%;margin:0;padding:0;border:none;background:rgba(0,0,0,0);pointer-events:none}.ytomo-dialog.overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.5);z-index:10000;display:flex;justify-content:center;align-items:center}.ytomo-dialog.container{background:#fff;border-radius:8px;padding:20px;max-width:400px;width:90%;max-height:70vh;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.3)}.ytomo-dialog.container.day-reservation{max-width:600px;max-height:80vh}.ytomo-dialog.title{margin:0 0 16px 0;color:#333;font-size:18px;font-weight:bold}.ytomo-dialog.button-group{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.ytomo-dialog.primary-button{background:#006821;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px}.ytomo-dialog.primary-button:hover{background:#02862b}.ytomo-dialog.primary-button:disabled{background:gray;cursor:not-allowed}.ytomo-dialog.secondary-button{background:rgba(0,0,0,0);color:#666;border:1px solid #ccc;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px}.ytomo-dialog.secondary-button:hover{background:#f5f5f5}.ytomo-progress.counter{display:inline-block;margin-left:8px;padding:2px 6px;background:rgba(0,0,0,.3);border-radius:10px;font-size:10px;color:#fff;font-weight:bold}.ytomo-dialog.clear-selection-button{background:#dc3545;color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:14px;font-weight:bold;cursor:pointer;transition:all .2s ease;white-space:nowrap}.ytomo-dialog.clear-selection-button:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgba(0,0,0,.2)}.ytomo-dialog.clear-selection-button:active{transform:translateY(0)}.ytomo-dialog.monitor-button{background:#fd7e14;color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:14px;font-weight:bold;cursor:pointer;transition:all .2s ease;white-space:nowrap}.ytomo-dialog.monitor-button:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgba(0,0,0,.2)}.ytomo-dialog.monitor-button:active{transform:translateY(0)}.pavilion-name-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}.pavilion-name-row .pavilion-name{flex:1;font-weight:bold;color:#333}.pavilion-select-all-btn{padding:2px 8px;font-size:11px;background-color:#007bff;color:#fff;border:none;border-radius:4px;cursor:pointer;transition:all .2s ease}.pavilion-select-all-btn:hover{background-color:#0056b3;transform:scale(1.05)}.pavilion-select-all-btn:active{transform:scale(0.95)}.ytomo-error-message{position:fixed;top:20px;right:20px;background:#f44;color:#fff;padding:15px;border-radius:5px;box-shadow:0 2px 10px rgba(0,0,0,.3);z-index:10001;max-width:300px;font-size:14px;line-height:1.4}.ytomo-error-message .error-title{font-weight:bold;margin-bottom:5px}.ytomo-error-message .error-close-btn{margin-top:10px;padding:5px 10px;background:hsla(0,0%,100%,.2);border:none;border-radius:3px;color:#fff;cursor:pointer;font-size:12px}.ytomo-error-message .error-close-btn:hover{background:hsla(0,0%,100%,.3)}.ytomo-flex-column-center{display:flex;flex-direction:column;align-items:center}.ytomo-brand-text{font-size:8px;font-weight:bold;margin-top:2px}.ytomo-dialog.overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:10000;padding:20px;box-sizing:border-box}.ytomo-dialog.container{background:#fff;border-radius:12px;padding:24px;max-width:800px;max-height:80vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.3);width:100%}@media(max-width: 600px){.ytomo-dialog.container{padding-bottom:60px;max-height:85vh}}.ytomo-dialog.header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;gap:8px}.ytomo-dialog.header .ytomo-dialog.title{flex-grow:1}.ytomo-dialog.title{margin:0;color:#333;font-size:24px;font-weight:bold}.ytomo-dialog.refresh-button{background:#006821;color:#fff;border:none;border-radius:50%;width:40px;height:40px;font-size:16px;cursor:pointer;transition:all .2s ease;display:flex;align-items:center;justify-content:center}.ytomo-dialog.refresh-button:hover{background:#02862b;transform:scale(1.1)}.ytomo-dialog.refresh-button:disabled{background:#ccc;cursor:not-allowed;transform:none}.ytomo-dialog.right-button-group{display:flex;gap:12px;align-items:center}.ytomo-dialog.available-only-toggle{background:#6c757d;color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:14px;font-weight:bold;cursor:pointer;transition:all .2s ease;white-space:nowrap}.ytomo-dialog.available-only-toggle.active{background:#006821;box-shadow:0 0 0 2px rgba(0,104,33,.3)}.ytomo-dialog.available-only-toggle:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgba(0,0,0,.2)}.ytomo-dialog.available-only-toggle:disabled{background:#ccc;cursor:not-allowed;transform:none;box-shadow:none}.ytomo-dialog.button-group{display:flex;gap:12px;justify-content:space-between;margin-top:24px}.ytomo-dialog.secondary-button{background:#6c757d;color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:14px;font-weight:bold;cursor:pointer;transition:all .2s ease;white-space:nowrap}.ytomo-dialog.secondary-button:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgba(0,0,0,.2)}.ytomo-dialog.monitor-button{background:#fd7e14;color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:14px;font-weight:bold;cursor:pointer;transition:all .2s ease;white-space:nowrap}.ytomo-dialog.monitor-button:hover{transform:translateY(-1px);box-shadow:0 4px 8px rgba(0,0,0,.2)}.day-reservation-description{color:#666;line-height:1.6;margin:0 0 20px 0}.pavilion-list{max-height:400px;overflow-y:auto;border:1px solid #ddd;border-radius:4px;margin-bottom:16px}.pavilion-list-empty{padding:20px;text-align:center;color:#666}.pavilion-item{display:flex;justify-content:space-between;align-items:center;padding:12px;border-bottom:1px solid #eee;transition:background-color .2s;cursor:pointer}.pavilion-item:hover{background-color:#f5f5f5}.pavilion-item:last-child{border-bottom:none}.pavilion-item.monitored{background-color:rgba(253,126,20,.1);border-left:4px solid #fd7e14}.pavilion-item.monitored:hover{background-color:rgba(253,126,20,.15)}.pavilion-info{flex:1}.pavilion-info .pavilion-name{font-weight:bold;margin-bottom:4px}.pavilion-info .pavilion-time-slots{font-size:12px;color:#666;display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;max-width:100%}@media(max-width: 600px){.pavilion-info .pavilion-time-slots{gap:6px;margin-top:6px}}.pavilion-info .pavilion-time-slots .pavilion-time-slot{font-size:12px;padding:4px 8px;border-radius:6px;border:1px solid rgba(0,0,0,0);min-width:60px;text-align:center;white-space:nowrap}@media(max-width: 600px){.pavilion-info .pavilion-time-slots .pavilion-time-slot{font-size:11px;padding:3px 6px;min-width:55px}}@media(max-width: 400px){.pavilion-info .pavilion-time-slots .pavilion-time-slot{font-size:10px;padding:2px 4px;min-width:50px}}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable{background:rgba(0,0,0,0);border-color:#dee2e6;cursor:pointer;transition:all .2s ease}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable:hover:not(.selected){background:#f8f9fa;border-color:#adb5bd;transform:translateY(-1px);box-shadow:0 2px 4px rgba(0,0,0,.1)}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable:active{transform:translateY(0);box-shadow:0 1px 2px rgba(0,0,0,.1)}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.selected{background:rgba(0,104,33,.25);border-color:#006821;border-width:2px;color:#006821;font-weight:bold}@media(max-width: 600px){.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.selected{background:rgba(0,104,33,.35);border-width:3px}}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.selected:hover{background:rgba(0,104,33,.3)}@media(max-width: 600px){.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.selected:hover{background:rgba(0,104,33,.4)}}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.selected:active{background:rgba(0,104,33,.35)}@media(max-width: 600px){.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.selected:active{background:rgba(0,104,33,.45)}}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable{background:rgba(0,0,0,0);border-color:#ffc107;color:#dc6c00}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable:hover:not(.selected){background:#fff3cd;border-color:#ffb300;transform:translateY(-1px);box-shadow:0 2px 4px rgba(255,193,7,.2)}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable.selected{background:rgba(255,193,7,.35);border-color:#ffc107;border-width:2px;color:#dc6c00;font-weight:bold}@media(max-width: 600px){.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable.selected{background:rgba(255,193,7,.45);border-width:3px}}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable.selected:hover{background:rgba(255,193,7,.4)}@media(max-width: 600px){.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable.selected:hover{background:rgba(255,193,7,.5)}}.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable.selected:active{background:rgba(255,193,7,.45)}@media(max-width: 600px){.pavilion-info .pavilion-time-slots .pavilion-time-slot.clickable.unavailable.selected:active{background:rgba(255,193,7,.55)}}.pavilion-button-area{display:flex;gap:8px;align-items:center}.pavilion-button-area .pavilion-reserve-button{padding:8px 16px;background-color:#006821;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:12px;transition:background-color .2s;white-space:nowrap}.pavilion-button-area .pavilion-reserve-button:hover:not(:disabled){background-color:#02862b}.pavilion-button-area .pavilion-reserve-button:disabled{background:#ccc;color:#666;cursor:not-allowed}.pavilion-button-area .pavilion-monitor-checkbox{margin-right:12px;transform:scale(1.2);accent-color:#fd7e14;flex-shrink:0}.pavilion-button-area .pavilion-no-slots{font-size:12px;color:#999}.ytomo-global-notification-container{position:fixed;top:20px;right:20px;z-index:20000;max-width:400px;width:100%;display:flex;flex-direction:column;gap:10px}@media(max-width: 600px){.ytomo-global-notification-container{top:10px;right:10px;left:10px;max-width:none}}.ytomo-global-notification{background:#fff;border-radius:8px;padding:16px;box-shadow:0 4px 12px rgba(0,0,0,.15);border-left:4px solid #ccc;display:flex;align-items:center;gap:12px;font-size:14px;font-weight:500;transform:translateX(100%);opacity:0;transition:all .3s ease}.ytomo-global-notification.show{transform:translateX(0);opacity:1}.ytomo-global-notification.hide{transform:translateX(100%);opacity:0}.ytomo-global-notification .notification-message{flex:1;line-height:1.4}.ytomo-global-notification .notification-close{background:none;border:none;font-size:18px;font-weight:bold;cursor:pointer;padding:0;width:20px;height:20px;display:flex;align-items:center;justify-content:center;opacity:.7;transition:opacity .2s ease}.ytomo-global-notification .notification-close:hover{opacity:1}.ytomo-global-notification.success{background-color:#d4edda;color:#155724;border-left-color:#28a745}.ytomo-global-notification.success .notification-close{color:#155724}.ytomo-global-notification.error{background-color:#f8d7da;color:#721c24;border-left-color:#dc3545}.ytomo-global-notification.error .notification-close{color:#721c24}.ytomo-global-notification.warning{background-color:#fff3cd;color:#856404;border-left-color:#ffc107}.ytomo-global-notification.warning .notification-close{color:#856404}.ytomo-global-notification.info{background-color:#d1ecf1;color:#0c5460;border-left-color:#17a2b8}.ytomo-global-notification.info .notification-close{color:#0c5460}.ytomo-processing-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.3);z-index:100000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(1px);transition:all .3s ease;pointer-events:auto}.ytomo-processing-overlay.z-normal{z-index:100000}.ytomo-processing-overlay.z-below-fab{z-index:99999}.ytomo-processing-overlay.hidden{opacity:0;visibility:hidden;pointer-events:none}.ytomo-processing-overlay.visible{opacity:1;visibility:visible;pointer-events:auto}.ytomo-processing-overlay .processing-message-area{background:hsla(0,0%,100%,.95);border-radius:12px;padding:24px 32px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.3);border:2px solid rgba(255,140,0,.3);max-width:400px;margin:20px}@media(max-width: 768px){.ytomo-processing-overlay .processing-message-area{padding:20px 24px;margin:16px;max-width:90vw}}.ytomo-processing-overlay .processing-message-text{font-size:20px;font-weight:bold;color:#333;margin-bottom:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}@media(max-width: 768px){.ytomo-processing-overlay .processing-message-text{font-size:18px;margin-bottom:6px}}.ytomo-processing-overlay .processing-target-text{font-size:16px;font-weight:600;color:#333;margin-bottom:12px;white-space:pre-line;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center}@media(max-width: 768px){.ytomo-processing-overlay .processing-target-text{font-size:14px;margin-bottom:10px}}.ytomo-processing-overlay .processing-countdown-text{font-size:18px;font-weight:bold;color:#e67e00;margin-bottom:12px;font-family:"SF Mono","Monaco","Consolas",monospace;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.1)}@media(max-width: 768px){.ytomo-processing-overlay .processing-countdown-text{font-size:16px;margin-bottom:10px}}.ytomo-processing-overlay .processing-countdown-text.countdown-warning{color:#dc3545;animation:countdownPulse 1s ease-in-out infinite;text-shadow:0 0 8px rgba(220,53,69,.4)}.ytomo-processing-overlay .processing-warning-text{font-size:14px;color:#666;margin-bottom:16px;line-height:1.4;transition:all .3s ease}@media(max-width: 768px){.ytomo-processing-overlay .processing-warning-text{font-size:13px;margin-bottom:14px}}.ytomo-processing-overlay .processing-warning-text.warning-flash{color:#dc3545;font-weight:bold;transform:scale(1.05);animation:flash .5s ease-in-out 2}.ytomo-processing-overlay .notification-toggle-btn{display:flex;align-items:center;justify-content:center;width:40px;height:40px;border:none;border-radius:50%;cursor:pointer;transition:all .2s ease;margin-bottom:16px;box-shadow:0 2px 6px rgba(0,0,0,.15);font-size:20px;line-height:1}@media(max-width: 768px){.ytomo-processing-overlay .notification-toggle-btn{width:36px;height:36px;margin-bottom:14px;font-size:18px}}.ytomo-processing-overlay .notification-toggle-btn:hover{transform:scale(1.05);box-shadow:0 4px 10px rgba(0,0,0,.2)}.ytomo-processing-overlay .notification-toggle-btn:active{transform:scale(0.95)}.ytomo-processing-overlay .notification-toggle-btn.enabled{background:#4caf50;color:#fff}.ytomo-processing-overlay .notification-toggle-btn.enabled:hover{background:#45a049}.ytomo-processing-overlay .notification-toggle-btn.muted{background:#f44336;color:#fff}.ytomo-processing-overlay .notification-toggle-btn.muted:hover{background:#e53935}.ytomo-processing-overlay .processing-cancel-area{font-size:12px;color:#888;font-style:italic}@media(max-width: 768px){.ytomo-processing-overlay .processing-cancel-area{font-size:11px}}@keyframes flash{0%,100%{opacity:1}50%{opacity:.7}}@keyframes countdownPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.8;transform:scale(1.05)}}.ytomo-processing-overlay.efficiency-mode .processing-message-area{border-color:rgba(255,140,0,.5);background:linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 248, 220, 0.95))}.ytomo-processing-overlay.efficiency-mode .processing-message-text{color:#e67e00}.ytomo-processing-overlay.monitoring-mode .processing-message-area{border-color:rgba(0,104,33,.5);background:linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 255, 240, 0.95))}.ytomo-processing-overlay.monitoring-mode .processing-message-text{color:#004d1a}@media(prefers-reduced-motion: reduce){.ytomo-processing-overlay{transition:none}.ytomo-processing-overlay .processing-warning-text.warning-flash{animation:none;transform:none}}.ytomo-dialog.overlay{position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.7);z-index:10000;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box}.ytomo-dialog.container.debug-dialog{background:#fff;border-radius:12px;padding:0;max-width:90%;max-height:85%;min-width:600px;box-shadow:0 8px 32px rgba(0,0,0,.3);display:flex;flex-direction:column;overflow:hidden}@media(max-width: 768px){.ytomo-dialog.container.debug-dialog{min-width:auto;max-width:95%;max-height:90%}}.ytomo-dialog.header{display:flex;align-items:center;justify-content:space-between;padding:20px 24px;border-bottom:1px solid #e0e0e0;background:#f8f9fa;border-radius:12px 12px 0 0}.ytomo-dialog.title{margin:0;font-size:20px;color:#333;font-weight:600}.ytomo-dialog.close-button{background:none;border:none;font-size:24px;cursor:pointer;color:#666;padding:5px;border-radius:4px}.ytomo-dialog.close-button:hover{background:rgba(0,0,0,.1)}.debug-content{padding:24px;overflow-y:auto;flex:1}.debug-section{margin-bottom:32px}.debug-section:last-child{margin-bottom:0}.debug-section h3{margin:0 0 12px 0;font-size:18px;color:#333;font-weight:600}.debug-section p{margin:0 0 16px 0;color:#666;line-height:1.5}.debug-input-group{display:flex;align-items:center;gap:12px;margin-bottom:20px;flex-wrap:wrap}.debug-input-group label{font-weight:500;color:#333;min-width:120px}.debug-input-group input{flex:1;min-width:200px;padding:10px 12px;border:2px solid #e0e0e0;border-radius:6px;font-size:14px;transition:border-color .2s ease}.debug-input-group input:focus{outline:none;border-color:#007bff}.debug-input-group input::placeholder{color:#999}.debug-input-group button{background:#007bff;color:#fff;border:none;padding:10px 20px;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .2s ease;white-space:nowrap}.debug-input-group button:hover:not(:disabled){background:#0056b3}.debug-input-group button:disabled{background:#6c757d;cursor:not-allowed}.debug-results-area h4{margin:0 0 12px 0;font-size:16px;color:#333;font-weight:600}.debug-results-display{background:#f8f9fa;border:1px solid #e0e0e0;border-radius:6px;padding:16px;font-family:"Courier New",Monaco,monospace;font-size:12px;line-height:1.4;max-height:300px;overflow-y:auto;white-space:pre-wrap;word-wrap:break-word;color:#333}.debug-results-display .json-key{color:#d73a49;font-weight:bold}.debug-results-display .json-string{color:#032f62}.debug-results-display .json-number{color:#005cc5}.debug-results-display .json-boolean{color:#e36209}.debug-results-display .json-null{color:#6f42c1}@media(max-width: 768px){.debug-input-group{flex-direction:column;align-items:stretch}.debug-input-group label{min-width:auto}.debug-input-group input{min-width:auto}.debug-input-group button{align-self:flex-start}.ytomo-dialog.container.debug-dialog{min-width:auto}.debug-content{padding:16px}}.ytomo-dialog.overlay{animation:fadeIn .2s ease-out}.ytomo-dialog.container.debug-dialog{animation:slideIn .3s ease-out}@keyframes fadeIn{from{opacity:0}to{opacity:1}}@keyframes slideIn{from{opacity:0;transform:translateY(-20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}.ytomo-dialog-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.6);display:flex;align-items:center;justify-content:center;z-index:10000;opacity:0;animation:fadeIn .2s ease-out forwards;overflow-y:auto}@keyframes fadeIn{to{opacity:1}}.ytomo-main-dialog{background:#fff;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.3);width:90vw;max-width:800px;min-width:600px;height:80vh;max-height:700px;min-height:500px;display:flex;flex-direction:column;overflow:hidden;transform:scale(0.9);animation:dialogAppear .2s ease-out forwards}@media(max-width: 768px){.ytomo-main-dialog{width:95vw;height:90vh;min-width:320px;min-height:400px}}@keyframes dialogAppear{to{transform:scale(1)}}.ytomo-dialog-header{background:linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);color:#fff;padding:16px 20px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid hsla(0,0%,100%,.1);flex-shrink:0}.ytomo-dialog-title{margin:0;font-size:18px;font-weight:600;display:flex;align-items:center;gap:8px}.ytomo-dialog-close{background:none;border:none;color:#000;font-size:24px;width:32px;height:32px;border-radius:6px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background-color .2s}.ytomo-dialog-close:hover{background-color:rgba(0,0,0,.1)}.ytomo-dialog-close:focus{outline:2px solid rgba(0,0,0,.5);outline-offset:2px}.ytomo-dialog-body{flex:1;display:flex;flex-direction:column;overflow:hidden;background:#f8fafc}.ytomo-tab-navigation{display:flex;background:#fff;border-bottom:1px solid #e2e8f0;flex-shrink:0}.ytomo-tab-button{flex:1;background:none;border:none;padding:16px 12px;font-size:14px;font-weight:500;color:#64748b;cursor:pointer;position:relative;transition:all .2s;border-bottom:3px solid rgba(0,0,0,0)}.ytomo-tab-button:hover{background-color:#f1f5f9;color:#475569}.ytomo-tab-button.active{color:#2c5aa0;background-color:#f8fafc;border-bottom-color:#2c5aa0}.ytomo-tab-button:focus{outline:2px solid #2c5aa0;outline-offset:-2px}.ytomo-tab-content{display:flex;flex-direction:column;gap:2px;align-items:center}.ytomo-tab-title{font-size:14px;font-weight:500}.ytomo-tab-dates{font-size:12px;color:#6b7280;line-height:1;min-height:14px}.ytomo-tab-count,.ytomo-tab-type{display:inline-block;margin-left:4px;font-size:12px;background:#e2e8f0;color:#475569;padding:2px 6px;border-radius:10px;min-width:18px;text-align:center;transition:all .2s}.ytomo-tab-button.active .ytomo-tab-count,.ytomo-tab-button.active .ytomo-tab-type{background:#2c5aa0;color:#fff}.ytomo-tab-content{flex:1;overflow:hidden;position:relative}.ytomo-tab-pane{position:absolute;top:0;left:0;width:100%;height:100%;opacity:0;transform:translateX(20px);transition:all .2s ease-out;overflow-y:auto;padding:20px;display:none}.ytomo-tab-pane.active{opacity:1;transform:translateX(0);display:block}.ytomo-loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;text-align:center}.ytomo-loading::before{content:"";width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#2c5aa0;border-radius:50%;animation:spin 1s linear infinite;margin-bottom:16px}.ytomo-loading p{margin:0;color:#64748b;font-size:14px}@keyframes spin{to{transform:rotate(360deg)}}.ytomo-tab-placeholder{text-align:center;padding:40px 20px}.ytomo-tab-placeholder h3{margin:0 0 16px 0;color:#2c5aa0;font-size:20px}.ytomo-tab-placeholder p{margin:0 0 24px 0;color:#64748b;font-size:14px}.ytomo-feature-preview{background:#fff;border-radius:8px;padding:20px;text-align:left;box-shadow:0 1px 3px rgba(0,0,0,.1);margin-top:20px}.ytomo-feature-preview h4{margin:0 0 12px 0;color:#374151;font-size:14px;font-weight:600}.ytomo-feature-preview ul{margin:0;padding-left:20px;color:#6b7280;font-size:13px;line-height:1.6}.ytomo-feature-preview li{margin-bottom:4px}.ytomo-yt-button{background:linear-gradient(135deg, #10b981 0%, #059669 100%);border:none;width:48px;height:48px;border-radius:50%;box-shadow:0 4px 12px rgba(16,185,129,.4);cursor:pointer;margin-bottom:12px;position:relative;transition:all .3s cubic-bezier(0.4, 0, 0.2, 1);overflow:hidden}.ytomo-yt-button:hover{transform:scale(1.1);box-shadow:0 6px 20px rgba(16,185,129,.5)}.ytomo-yt-button:active{transform:scale(0.95)}.ytomo-yt-button:focus{outline:3px solid rgba(16,185,129,.3);outline-offset:2px}.ytomo-yt-button .ytomo-fab-icon{color:#fff;font-size:14px;font-weight:700;letter-spacing:.5px;display:block;line-height:1}.ytomo-yt-button::before{content:"";position:absolute;top:50%;left:50%;width:0;height:0;background:hsla(0,0%,100%,.3);border-radius:50%;transform:translate(-50%, -50%);transition:width .6s,height .6s}.ytomo-yt-button:hover::before{width:100px;height:100px}@media(prefers-reduced-motion: reduce){.ytomo-dialog-overlay,.ytomo-main-dialog,.ytomo-tab-pane,.ytomo-tab-button,.ytomo-yt-button,.ytomo-loading::before{animation:none;transition:none}.ytomo-yt-button::before{transition:none}}@media(prefers-contrast: high){.ytomo-main-dialog{border:2px solid #000}.ytomo-tab-button.active{border-bottom-width:4px}.ytomo-dialog-close:focus,.ytomo-tab-button:focus,.ytomo-yt-button:focus{outline:3px solid #000}}.ytomo-main-dialog *:focus{outline:none !important}.ytomo-processing-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:flex-end;z-index:10001;padding-right:40px;pointer-events:auto;overflow-y:auto}.ytomo-processing-content{background:hsla(0,0%,100%,.7);border-radius:12px;padding:30px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.2);min-width:200px;pointer-events:auto;backdrop-filter:blur(1px)}.ytomo-processing-spinner{width:40px;height:40px;border:3px solid #e2e8f0;border-top-color:#2c5aa0;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 16px}.ytomo-processing-message{color:#374151;font-size:14px;font-weight:500}.ytomo-sequential-overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.3);display:flex;align-items:center;justify-content:flex-end;z-index:10002;padding-right:40px;pointer-events:auto;overflow-y:auto}.ytomo-sequential-content{background:hsla(0,0%,100%,.7);border-radius:12px;padding:30px;text-align:center;box-shadow:0 10px 40px rgba(0,0,0,.2);min-width:300px;max-width:400px;pointer-events:auto;backdrop-filter:blur(1px)}.ytomo-sequential-content h3{margin:0 0 20px 0;color:#374151;font-size:18px;font-weight:600}.ytomo-sequential-settings{margin-bottom:20px;text-align:left}.ytomo-sequential-settings label{display:block;margin-bottom:8px;color:#374151;font-size:14px;font-weight:500}.ytomo-mode-selection{margin-bottom:16px}.ytomo-mode-buttons{display:flex;gap:8px;margin-top:8px}.ytomo-mode-button{flex:1;padding:8px 16px;border:1px solid #d1d5db;border-radius:6px;background:#fff;color:#374151;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s}.ytomo-mode-button:hover{background:#f3f4f6;border-color:#9ca3af}.ytomo-mode-button.active{background:#2c5aa0;border-color:#2c5aa0;color:#fff}.ytomo-mode-button:focus{outline:2px solid #2c5aa0;outline-offset:2px}.ytomo-interval-setting{margin-top:12px}.ytomo-interval-dropdown{width:100%;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;background:#fff;font-size:14px;color:#374151;cursor:pointer}.ytomo-interval-dropdown:focus{outline:2px solid #2c5aa0;outline-offset:2px;border-color:#2c5aa0}.ytomo-sequential-progress{margin-bottom:20px}.ytomo-sequential-current{font-size:24px;font-weight:bold;color:#2c5aa0;margin-bottom:8px}.ytomo-sequential-target{font-size:16px;color:#374151;margin-bottom:8px;font-weight:500}.ytomo-sequential-countdown{font-size:14px;color:#6b7280;min-height:20px}.ytomo-sequential-controls{margin-top:20px}.ytomo-cancel-button{background:#dc3545;color:#fff;border:none;border-radius:6px;padding:10px 20px;font-size:14px;font-weight:500;cursor:pointer;transition:background-color .2s}.ytomo-cancel-button:hover{background:#c82333}.ytomo-dialog-overlay{color-scheme:light}.ytomo-main-dialog{color-scheme:light;background:#fff !important;color:#1f2937 !important}@media(prefers-color-scheme: dark)and (max-width: 0px){.ytomo-main-dialog{background:#1f2937;color:#f9fafb}.ytomo-dialog-body{background:#111827}.ytomo-tab-navigation{background:#374151;border-bottom-color:#4b5563}.ytomo-tab-button{color:#d1d5db}.ytomo-tab-button:hover{background-color:#4b5563;color:#f3f4f6}.ytomo-tab-button.active{background-color:#1f2937;color:#60a5fa;border-bottom-color:#60a5fa}.ytomo-tab-count,.ytomo-tab-type{background:#4b5563;color:#d1d5db}.ytomo-tab-button.active .ytomo-tab-count,.ytomo-tab-button.active .ytomo-tab-type{background:#60a5fa;color:#1f2937}.ytomo-feature-preview{background:#374151;border:1px solid #4b5563}.ytomo-loading::before{border-color:#4b5563;border-top-color:#60a5fa}}.ytomo-ticket-tab{padding:0 12px 20px 12px;height:100%;overflow-y:auto;color-scheme:light}@media(max-width: 768px){.ytomo-ticket-tab{padding:0 8px 16px 8px}}.ytomo-quick-select{background:#fff;border-radius:8px;padding:12px;box-shadow:0 1px 3px rgba(0,0,0,.1);border:1px solid #e2e8f0;flex-shrink:0;display:flex;align-items:center;gap:10px;flex-wrap:wrap}.ytomo-toggle-container{display:flex;align-items:center;cursor:pointer;user-select:none}.ytomo-toggle-input{display:none}.ytomo-toggle-slider{position:relative;width:44px;height:24px;background:#cbd5e1;border-radius:12px;transition:background-color .2s;margin-right:8px}.ytomo-toggle-slider::before{content:"";position:absolute;top:2px;left:2px;width:20px;height:20px;background:#fff;border-radius:50%;transition:transform .2s}.ytomo-toggle-input:checked+.ytomo-toggle-slider{background:#2c5aa0}.ytomo-toggle-input:checked+.ytomo-toggle-slider::before{transform:translateX(20px)}.ytomo-toggle-label{font-size:14px;font-weight:500;color:#374151}.ytomo-date-buttons{display:flex;flex-wrap:wrap;gap:8px;flex:1}.ytomo-date-button{background:#e0f2fe;border:1px solid #0891b2;border-radius:4px;padding:4px 8px;font-size:12px;color:#0c4a6e;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;gap:2px;align-items:center}.ytomo-date-button *{pointer-events:none}.ytomo-date-button:focus{outline:none;box-shadow:none}.ytomo-date-button:hover{background:#0ea5e9;color:#fff;transform:translateY(-1px);box-shadow:0 2px 4px rgba(14,165,233,.3)}.ytomo-date-button.selected{background:#0891b2;color:#fff;border-color:#164e63;outline:2px solid #164e63;outline-offset:-1px}.ytomo-date-button:active{transform:translateY(0);box-shadow:none}.ytomo-ticket-list{display:flex;flex-direction:column;gap:8px;margin-bottom:20px}.ytomo-ticket-item{background:#fff;border-radius:6px;border:1px solid #e2e8f0;overflow:hidden;transition:all .2s}.ytomo-ticket-item.hidden{display:none}.ytomo-ticket-item:hover{border-color:#cbd5e1;box-shadow:0 2px 4px rgba(0,0,0,.1)}.ytomo-ticket-item.selected{border-color:#2c5aa0;box-shadow:0 0 0 2px rgba(44,90,160,.2)}.ytomo-ticket-upper{background:#e2e8f0;padding:8px 12px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #cbd5e1}.ytomo-ticket-id{font-family:"Courier New",monospace;font-size:13px;font-weight:600;color:#374151;background:#e2e8f0;padding:2px 6px;border-radius:3px}.ytomo-me-tip{background:linear-gradient(135deg, #10b981 0%, #059669 100%);color:#fff;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.3px}.ytomo-label-tag{background:linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);color:#fff;padding:2px 6px;border-radius:10px;font-size:10px;font-weight:600}.ytomo-ticket-lower{padding:8px 12px;display:flex;flex-direction:column;gap:8px}.ytomo-entrance-dates{display:flex;flex-wrap:wrap;gap:6px}.ytomo-entrance-date-button{background:#e0f2fe;border:1px solid #0891b2;border-radius:4px;padding:4px 8px;font-size:12px;color:#0c4a6e;cursor:pointer;transition:all .2s;display:flex;flex-direction:column;gap:2px;align-items:center}.ytomo-entrance-date-button *{pointer-events:none}.ytomo-entrance-date-button:focus{outline:none;box-shadow:none}.ytomo-entrance-date-button:hover{background:#0284c7;color:#fff}.ytomo-entrance-date-button.selected{background:#0ea5e9;color:#fff;border-color:#164e63;outline:2px solid #164e63;outline-offset:-1px}.ytomo-entrance-date-button:active{transform:translateY(0);box-shadow:none}.ytomo-entrance-date-button.disabled,.ytomo-entrance-date-button:disabled{background:#e2e8f0;border-color:#94a3b8;color:#475569;cursor:not-allowed}.ytomo-entrance-date-button.disabled:hover,.ytomo-entrance-date-button:disabled:hover{background:#e2e8f0;color:#475569;transform:none;box-shadow:none}.ytomo-entrance-date-button .ytomo-reservation-status{background:hsla(0,0%,100%,.9);color:#0891b2;padding:2px 4px;border-radius:3px;font-size:9px;font-weight:500;line-height:1.1;text-align:center}.ytomo-entrance-date-button .ytomo-reservation-status:empty{background:rgba(0,0,0,0);padding:0}.ytomo-entrance-date-button:hover .ytomo-reservation-status{background:hsla(0,0%,100%,.95);color:#0ea5e9}.ytomo-entrance-date-button:hover .ytomo-reservation-status:empty{background:rgba(0,0,0,0)}.ytomo-entrance-date-button.selected .ytomo-reservation-status{background:hsla(0,0%,100%,.95);color:#0891b2}.ytomo-entrance-date-button.selected .ytomo-reservation-status:empty{background:rgba(0,0,0,0)}.ytomo-entrance-date-button.disabled .ytomo-reservation-status{background:hsla(0,0%,100%,.9);color:#475569}.ytomo-entrance-date-button.disabled .ytomo-reservation-status:empty{background:rgba(0,0,0,0)}.ytomo-reservation-types{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.ytomo-reservation-type{padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500}.ytomo-reservation-type.active{background:#dcfce7;color:#166534;border:1px solid #22c55e}.ytomo-reservation-type.inactive{background:#fef2f2;color:#991b1b;border:1px solid #ef4444}.ytomo-no-reservation-types{color:#6b7280;font-size:12px;font-style:italic}.ytomo-add-ticket{background:#fff;border-radius:8px;padding:16px;border:2px dashed #cbd5e1;margin-top:20px}.ytomo-add-ticket h4{margin:0 0 12px 0;color:#374151;font-size:14px;font-weight:600}.ytomo-add-ticket-form{display:flex;gap:8px;align-items:center;flex-wrap:wrap}@media(max-width: 768px){.ytomo-add-ticket-form{flex-direction:column;align-items:stretch;gap:12px}}.ytomo-input{flex:1;padding:8px 12px;border:1px solid #d1d5db;border-radius:6px;font-size:14px;transition:border-color .2s}.ytomo-input:focus{outline:none;border-color:#2c5aa0;box-shadow:0 0 0 3px rgba(44,90,160,.1)}.ytomo-input::placeholder{color:#9ca3af}.ytomo-input-inline{padding:4px 8px;border:1px solid #d1d5db;border-radius:4px;font-size:12px;transition:border-color .2s;background:#fff}.ytomo-input-inline:focus{outline:none;border-color:#2c5aa0;box-shadow:0 0 0 2px rgba(44,90,160,.1)}.ytomo-input-inline::placeholder{color:#9ca3af}.ytomo-button{padding:8px 16px;border:none;border-radius:6px;font-size:14px;font-weight:500;cursor:pointer;transition:all .2s;display:inline-flex;align-items:center;justify-content:center;white-space:nowrap}.ytomo-button.primary{background:linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);color:#fff}.ytomo-button.primary:hover{background:linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);transform:translateY(-1px);box-shadow:0 4px 12px rgba(44,90,160,.3)}.ytomo-button.primary:active{transform:translateY(0)}.ytomo-button.retry-button{background:linear-gradient(135deg, #f59e0b 0%, #d97706 100%);color:#fff;margin-top:12px}.ytomo-button.retry-button:hover{background:linear-gradient(135deg, #d97706 0%, #f59e0b 100%)}.ytomo-button:focus{outline:2px solid #2c5aa0;outline-offset:2px}.ytomo-button:disabled{opacity:.5;cursor:not-allowed;transform:none !important}.ytomo-empty-state{text-align:center;padding:40px 20px;color:#6b7280;font-style:italic}.ytomo-empty-state p{margin:0;font-size:14px}.ytomo-error{text-align:center;padding:40px 20px;color:#dc2626}.ytomo-error h3{margin:0 0 8px 0;font-size:16px;color:#dc2626}.ytomo-error p{margin:0;font-size:14px;color:#6b7280}.ytomo-ticket-tab .ytomo-loading{height:150px}.ytomo-ticket-list::-webkit-scrollbar{width:6px}.ytomo-ticket-list::-webkit-scrollbar-track{background:#f1f5f9;border-radius:3px}.ytomo-ticket-list::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.ytomo-ticket-list::-webkit-scrollbar-thumb:hover{background:#94a3b8}.ytomo-ticket-item{animation:slideIn .2s ease-out}@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}@media(prefers-reduced-motion: reduce){.ytomo-ticket-item,.ytomo-button,.ytomo-date-button,.ytomo-entrance-date-button,.ytomo-toggle-slider,.ytomo-input{animation:none;transition:none}}@media(prefers-contrast: high){.ytomo-ticket-item{border-width:3px}.ytomo-ticket-item.selected{border-width:4px}.ytomo-button:focus,.ytomo-input:focus,.ytomo-date-button:focus{outline:3px solid #000}}.ytomo-pavilion-tab{padding:0 20px 20px 20px;height:100%;display:flex;flex-direction:column;gap:16px;overflow-y:auto;color-scheme:light}.ytomo-search-controls{background:#fff;border-radius:8px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.1);border:1px solid #e2e8f0;flex-shrink:0;display:flex;gap:12px;align-items:center}@media(max-width: 600px){.ytomo-search-controls{flex-direction:column;align-items:stretch;gap:12px}}.ytomo-search-input-container{flex:1}.ytomo-search-input{width:100%;padding:10px 16px;border:1px solid #d1d5db;border-radius:8px;font-size:14px;transition:all .2s}.ytomo-search-input:focus{outline:none;border-color:#2c5aa0}.ytomo-search-input::placeholder{color:#9ca3af}.ytomo-control-buttons{display:flex;gap:8px;flex-shrink:0}@media(max-width: 600px){.ytomo-control-buttons{justify-content:center}}.ytomo-icon-button{width:40px;height:40px;border:1px solid #d1d5db;border-radius:8px;background:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;font-size:16px;position:relative}.ytomo-icon-button:hover{background:#f3f4f6;border-color:#9ca3af;transform:translateY(-1px)}.ytomo-icon-button:active{transform:translateY(0)}.ytomo-icon-button.active{background:#2c5aa0;border-color:#2c5aa0;color:#fff}.ytomo-icon-button.active:hover{background:#1a365d}.ytomo-icon-button .ytomo-count-badge{position:absolute;top:-8px;right:-8px;background:#f44;color:#fff;border-radius:10px;padding:2px 6px;font-size:10px;font-weight:bold;min-width:16px;text-align:center;line-height:1.2;pointer-events:none;z-index:10}.ytomo-icon-button:focus{outline:none}.ytomo-icon-button span{display:block;line-height:1}.ytomo-pavilion-list{flex:1;background:#fff;border-radius:8px;border:1px solid #e2e8f0}.ytomo-pavilion-item{background:#fff;border-bottom:1px solid #f1f5f9;transition:all .2s;color:#374151}.ytomo-pavilion-item:last-child{border-bottom:none}.ytomo-pavilion-item:hover{background:#f8fafc}.ytomo-pavilion-item.hidden{display:none}.ytomo-pavilion-header{display:flex;align-items:center;gap:12px;padding:16px;cursor:pointer}.ytomo-star-button{background:none;border:none;font-size:18px;cursor:pointer;transition:all .2s;padding:4px;border-radius:4px}.ytomo-star-button:hover{background:rgba(255,193,7,.1)}.ytomo-star-button.favorite{color:#ffc107}.ytomo-star-button:focus{outline:none}.ytomo-pavilion-checkbox-container{display:flex;align-items:center;cursor:pointer}.ytomo-pavilion-checkbox{width:16px;height:16px;cursor:pointer}.ytomo-pavilion-name{flex:1;font-size:15px;font-weight:500;color:#374151;line-height:1.4}.ytomo-expand-button{background:none;border:none;font-size:12px;color:#6b7280;cursor:pointer;padding:4px 8px;border-radius:4px;transition:all .2s}.ytomo-expand-button:hover{background:#f3f4f6;color:#374151}.ytomo-expand-button.expanded{background:#e2e8f0;color:#374151}.ytomo-expand-button:focus{outline:none}.ytomo-time-slots{padding:0 16px 16px 16px;display:flex;flex-wrap:wrap;gap:8px;transition:all .3s ease}.ytomo-time-slots.hidden{display:none}.ytomo-time-slot-button{padding:8px 12px;border-radius:6px;font-size:13px;font-weight:500;cursor:pointer;transition:all .2s;border:1px solid;min-width:80px;text-align:center;display:inline-block}.ytomo-time-slot-button *{pointer-events:none}.ytomo-time-slot-button.available{background:#dcfce7;border-color:#22c55e;color:#166534}.ytomo-time-slot-button.available:hover{background:#bbf7d0;color:#166534;transform:translateY(-1px);box-shadow:0 2px 8px rgba(34,197,94,.3)}.ytomo-time-slot-button.available.selected{background:#22c55e;color:#fff;box-shadow:0 2px 8px rgba(34,197,94,.3)}.ytomo-time-slot-button.unavailable{background:#fef2f2;border-color:#ef4444;color:#991b1b;cursor:pointer;opacity:1}.ytomo-time-slot-button.unavailable:hover{background:#fecaca;color:#991b1b;transform:translateY(-1px);box-shadow:0 2px 8px rgba(239,68,68,.3)}.ytomo-time-slot-button.unavailable.selected{background:#ef4444;color:#fff;box-shadow:0 2px 8px rgba(239,68,68,.3)}.ytomo-time-slot-button.rate-limited{background:#f3f4f6;border-color:#9ca3af;color:#6b7280;cursor:not-allowed;opacity:.6}.ytomo-time-slot-button.rate-limited:hover{background:#f3f4f6;color:#6b7280;transform:none;box-shadow:none}.ytomo-time-slot-button.rate-limited:disabled{cursor:not-allowed;pointer-events:none}.ytomo-time-slot-button:focus{outline:none}.ytomo-time-slot-button.hidden{display:none}.ytomo-reservation-controls{background:#fff;border-radius:8px;padding:16px;box-shadow:0 1px 3px rgba(0,0,0,.1);border:1px solid #e2e8f0;flex-shrink:0;display:flex;align-items:center;gap:16px;position:relative}@media(max-width: 600px){.ytomo-reservation-controls{flex-direction:column;align-items:stretch;gap:12px}}.ytomo-selected-info{flex:1;font-size:14px;color:#374151;font-weight:500}@media(max-width: 600px){.ytomo-selected-info{text-align:center}}.ytomo-reservation-controls .ytomo-button{padding:10px 20px;font-weight:600;white-space:nowrap}@media(max-width: 600px){.ytomo-reservation-controls .ytomo-button{width:100%}}#ot-sdk-btn-floating{display:none !important}.ytomo-result-display{position:fixed;top:20px;right:20px;padding:8px 12px;border-radius:6px;font-size:13px;font-weight:500;opacity:0;transform:translateY(-10px);transition:all .3s;pointer-events:none;max-width:300px;z-index:10001}.ytomo-result-display.show{opacity:1;transform:translateY(0)}.ytomo-result-display.success{background:#22c55e;color:#fff}.ytomo-result-display.error{background:#ef4444;color:#fff}.ytomo-result-display.info{background:#3b82f6;color:#fff}@media(max-width: 600px){.ytomo-result-display{position:static;transform:none;margin:8px 0 0 0;text-align:center}}.ytomo-pavilion-tab .ytomo-empty-state,.ytomo-pavilion-tab .ytomo-error{padding:40px 20px;text-align:center}.ytomo-pavilion-tab .ytomo-empty-state p{margin:0;color:#6b7280;font-size:14px}.ytomo-pavilion-tab .ytomo-error p{margin:0;color:#dc2626;font-size:14px}.ytomo-pavilion-tab .ytomo-loading{height:150px}.ytomo-pavilion-list::-webkit-scrollbar{width:6px}.ytomo-pavilion-list::-webkit-scrollbar-track{background:#f1f5f9;border-radius:3px}.ytomo-pavilion-list::-webkit-scrollbar-thumb{background:#cbd5e1;border-radius:3px}.ytomo-pavilion-list::-webkit-scrollbar-thumb:hover{background:#94a3b8}.ytomo-selected-dates-display{background:#fff;border-radius:8px;padding:12px 16px;box-shadow:0 1px 3px rgba(0,0,0,.1);border:1px solid #e2e8f0;flex-shrink:0;min-height:44px;display:flex;align-items:center}.ytomo-selected-dates-content{display:flex;align-items:center;gap:8px;width:100%}.ytomo-dates-label{font-size:14px;font-weight:600;color:#374151;flex-shrink:0}.ytomo-dates-text{font-size:14px;color:#2c5aa0;font-weight:500}.ytomo-dates-text:empty::before{content:"なし";color:#9ca3af;font-style:italic}.ytomo-status-fab{position:fixed;bottom:86px;right:20px;min-width:120px;min-height:50px;border:none;border-radius:6px;color:#fff;font-size:11px;font-weight:500;cursor:pointer;box-shadow:0 4px 12px rgba(0,0,0,.3);transition:all .3s ease;z-index:1001;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:8px 12px;line-height:1.2}.ytomo-status-fab.success{background:linear-gradient(135deg, #22c55e 0%, #16a34a 100%);box-shadow:0 4px 12px rgba(34,197,94,.4)}.ytomo-status-fab.error{background:linear-gradient(135deg, #ef4444 0%, #dc2626 100%);box-shadow:0 4px 12px rgba(239,68,68,.4)}.ytomo-status-fab.info{background:linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);box-shadow:0 4px 12px rgba(59,130,246,.4)}.ytomo-status-fab:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 6px 16px rgba(0,0,0,.4)}.ytomo-status-fab:active:not(:disabled){transform:translateY(0)}.ytomo-status-fab:focus{outline:none}.ytomo-reservation-fab{position:fixed;bottom:20px;right:20px;width:56px;height:56px;background:linear-gradient(135deg, #2c5aa0 0%, #1a365d 100%);border:none;border-radius:28px;color:#fff;font-size:24px;cursor:pointer;box-shadow:0 4px 16px rgba(44,90,160,.3);transition:all .3s ease;z-index:1000;display:flex;align-items:center;justify-content:center}.ytomo-reservation-fab:hover:not(:disabled){background:linear-gradient(135deg, #1a365d 0%, #2c5aa0 100%);transform:translateY(-2px);box-shadow:0 6px 20px rgba(44,90,160,.4)}.ytomo-reservation-fab:active:not(:disabled){transform:translateY(0);box-shadow:0 2px 8px rgba(44,90,160,.3)}.ytomo-reservation-fab:disabled{background:#94a3b8;cursor:not-allowed;box-shadow:0 2px 8px rgba(148,163,184,.3);opacity:.6}.ytomo-reservation-fab:focus{outline:none}.ytomo-pavilion-item{animation:slideIn .2s ease-out}@keyframes slideIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}.ytomo-time-slot-button.available:hover{animation:pulse .6s ease-in-out}@keyframes pulse{0%{transform:translateY(-1px)}50%{transform:translateY(-2px)}100%{transform:translateY(-1px)}}.ytomo-pavilion-tab input:focus,.ytomo-pavilion-tab button:focus{outline:none}@media(prefers-reduced-motion: reduce){.ytomo-pavilion-item,.ytomo-time-slot-button,.ytomo-icon-button,.ytomo-result-display,.ytomo-time-slots{animation:none;transition:none}.ytomo-time-slot-button.available:hover{animation:none;transform:none}}@media(prefers-contrast: high){.ytomo-pavilion-item{border-bottom-width:2px}.ytomo-time-slot-button{border-width:2px}.ytomo-icon-button.active{border-width:3px}.ytomo-pavilion-tab input:focus,.ytomo-pavilion-tab button:focus{outline:3px solid #000}}table[class*=style_main__timetable__] td[data-gray-out] div[role=button][data-disabled=true]{pointer-events:auto !important;cursor:pointer !important}`, ""]);
// Exports
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (___CSS_LOADER_EXPORT___);


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

/***/ 599:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   executeImmediateReservation: () => (/* binding */ executeImmediateReservation)
/* harmony export */ });
/* unused harmony exports ImmediateReservationService, canExecuteImmediateReservation */
/* harmony import */ var _pavilion_reservation_cache__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(619);
/**
 * 即時予約機能
 * 空き時間帯での即座予約実行
 */

class ImmediateReservationService {
    /**
     * 即時予約を実行
     */
    static async executeReservation(pavilionCode, pavilionName, timeSlot, timeDisplay) {
        console.log('🚀 即時予約実行開始:', pavilionName, timeDisplay);
        try {
            // 1. 通常の予約キャッシュ形式に変換して保存
            const cacheData = {
                pavilionCode,
                pavilionName,
                selectedTimeSlot: timeSlot,
                selectedTimeDisplay: timeDisplay,
                isAvailable: true,
                timestamp: Date.now(),
                status: 'pending'
            };
            _pavilion_reservation_cache__WEBPACK_IMPORTED_MODULE_0__.PavilionReservationCache.saveReservationData(pavilionCode, cacheData);
            // ページ復帰システムは無効化
            // 3. 予約ページに遷移
            // expoTable.jsを参照した正しいURL実装
            const ticketIds = new URLSearchParams(window.location.search).get('id') || '';
            const formatDateToYMD = () => {
                const date = new Date();
                const y = date.getFullYear();
                const m = String(date.getMonth() + 1).padStart(2, '0');
                const d = String(date.getDate()).padStart(2, '0');
                return `${y}${m}${d}`;
            };
            const reservationUrl = `https://ticket.expo2025.or.jp/event_time/?id=${ticketIds}&event_id=${pavilionCode}&screen_id=108&lottery=5&entrance_date=${formatDateToYMD()}`;
            window.location.href = reservationUrl;
            console.log('✅ 予約ページに遷移:', reservationUrl);
            console.log('🤖 自動操作が開始されます');
            return true;
        }
        catch (error) {
            console.error('❌ 即時予約実行エラー:', error);
            return false;
        }
    }
    /**
     * 即時予約可能性をチェック
     */
    static canExecuteImmediate(isAvailable) {
        return isAvailable === true;
    }
    /**
     * 即時予約の説明メッセージ
     */
    static getExecutionMessage(pavilionName, timeDisplay) {
        return `${pavilionName} ${timeDisplay} の予約ページを開き、自動で時間選択・申込を実行します。`;
    }
}
/**
 * 即時予約実行（ショートカット関数）
 */
async function executeImmediateReservation(pavilionCode, pavilionName, timeSlot, timeDisplay) {
    return await ImmediateReservationService.executeReservation(pavilionCode, pavilionName, timeSlot, timeDisplay);
}
/**
 * 即時予約可能判定（ショートカット関数）
 */
function canExecuteImmediateReservation(isAvailable) {
    return ImmediateReservationService.canExecuteImmediate(isAvailable);
}
// デバッグ用グローバル公開
if (typeof window !== 'undefined') {
    window.executeImmediateReservation = executeImmediateReservation;
    window.debugImmediateReservation = (pavilionCode, timeSlot) => {
        console.log('🔧 即時予約デバッグ実行');
        return executeImmediateReservation(pavilionCode, `テストパビリオン${pavilionCode}`, timeSlot, timeSlot);
    };
}


/***/ }),

/***/ 601:
/***/ ((module) => {



module.exports = function (i) {
  return i[1];
};

/***/ }),

/***/ 619:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  PavilionReservationCache: () => (/* binding */ PavilionReservationCache)
});

;// ./ts/modules/reservation-data.ts
/**
 * 予約データ管理モジュール
 * 万博パビリオン予約の自動化で使用するデータ構造定義
 */
// キャッシュキーの定数
const CACHE_KEYS = {
    RESERVATION_DATA: 'expo2025_reservation_data',
    AUTOMATION_STATE: 'expo2025_automation_state',
    USER_PREFERENCES: 'expo2025_user_preferences'
};
// 予約データの一意キー生成
const generateReservationKey = (pavilionCode, timeSlot) => {
    return `${pavilionCode}_${timeSlot}`;
};
// デフォルト設定
const DEFAULT_USER_PREFERENCES = {
    autoCloseDialog: true,
    showDebugLogs: false,
    retryCount: 3,
    waitTimeout: 5000
};
// ユーティリティ関数
class ReservationDataUtils {
    /**
     * 時間文字列を表示用に変換
     * @param timeSlot "1000" -> "10:00"
     */
    static formatTimeSlot(timeSlot) {
        if (timeSlot.length !== 4)
            return timeSlot;
        return `${timeSlot.slice(0, 2)}:${timeSlot.slice(2)}`;
    }
    /**
     * 予約データの有効性チェック
     */
    static isValidReservationData(data) {
        return (typeof data === 'object' &&
            typeof data.pavilionCode === 'string' &&
            typeof data.pavilionName === 'string' &&
            typeof data.selectedTimeSlot === 'string' &&
            typeof data.selectedTimeDisplay === 'string' &&
            typeof data.isAvailable === 'boolean' &&
            typeof data.timestamp === 'number' &&
            typeof data.status === 'string');
    }
    /**
     * データの期限チェック（セッション内での有効性）
     */
    static isDataExpired(timestamp, maxAge = 24 * 60 * 60 * 1000) {
        return Date.now() - timestamp > maxAge;
    }
    /**
     * 予約データを作成
     */
    static createReservationData(pavilionCode, pavilionName, selectedTimeSlot, isAvailable) {
        return {
            pavilionCode,
            pavilionName,
            selectedTimeSlot,
            selectedTimeDisplay: this.formatTimeSlot(selectedTimeSlot),
            isAvailable,
            timestamp: Date.now(),
            status: 'pending'
        };
    }
}

;// ./ts/modules/pavilion-reservation-cache.ts
/**
 * パビリオン予約キャッシュ管理モジュール
 * sessionStorageを使用した予約データの保存・取得
 */

class PavilionReservationCache {
    /**
     * sessionStorageへの安全な保存
     */
    static setItem(key, value) {
        try {
            const serialized = JSON.stringify(value);
            sessionStorage.setItem(key, serialized);
            return true;
        }
        catch (error) {
            console.error('❌ Cache save error:', error);
            return false;
        }
    }
    /**
     * sessionStorageからの安全な取得
     */
    static getItem(key) {
        try {
            const item = sessionStorage.getItem(key);
            if (!item)
                return null;
            return JSON.parse(item);
        }
        catch (error) {
            console.error('❌ Cache load error:', error);
            return null;
        }
    }
    /**
     * sessionStorageからの削除
     */
    static removeItem(key) {
        try {
            sessionStorage.removeItem(key);
        }
        catch (error) {
            console.error('❌ Cache remove error:', error);
        }
    }
    // ============ 予約データ管理 ============
    /**
     * 予約データを保存（パビリオンコード+時間スロットで一意キー生成）
     */
    static saveReservationData(pavilionCode, data) {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, data.selectedTimeSlot);
        allData[key] = data;
        const success = this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        if (success) {
            console.log(`💾 予約データ保存: ${key} - ${data.selectedTimeDisplay}`);
        }
        return success;
    }
    /**
     * 特定パビリオン+時間スロットの予約データを取得
     */
    static getReservationData(pavilionCode, timeSlot) {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, timeSlot);
        const data = allData[key];
        if (!data)
            return null;
        // データ有効性チェック
        if (!ReservationDataUtils.isValidReservationData(data)) {
            console.warn(`⚠️ 無効な予約データ: ${key}`);
            this.removeReservationData(pavilionCode, timeSlot);
            return null;
        }
        // 期限チェック
        if (ReservationDataUtils.isDataExpired(data.timestamp)) {
            console.warn(`⏰ 期限切れデータ: ${key}`);
            this.removeReservationData(pavilionCode, timeSlot);
            return null;
        }
        return data;
    }
    /**
     * 特定パビリオンの全時間スロット予約データを取得
     */
    static getReservationDataByPavilion(pavilionCode) {
        const allData = this.getAllReservationData();
        const results = [];
        for (const [key, data] of Object.entries(allData)) {
            if (data.pavilionCode === pavilionCode) {
                // データ有効性・期限チェック
                if (ReservationDataUtils.isValidReservationData(data) &&
                    !ReservationDataUtils.isDataExpired(data.timestamp)) {
                    results.push(data);
                }
                else {
                    // 無効なデータは削除
                    delete allData[key];
                }
            }
        }
        // 無効データがあった場合は更新
        if (Object.keys(allData).length !== Object.keys(this.getAllReservationData()).length) {
            this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        }
        return results;
    }
    /**
     * 全ての予約データを取得
     */
    static getAllReservationData() {
        return this.getItem(CACHE_KEYS.RESERVATION_DATA) || {};
    }
    /**
     * 特定の予約データを削除
     */
    static removeReservationData(pavilionCode, timeSlot) {
        const allData = this.getAllReservationData();
        const key = generateReservationKey(pavilionCode, timeSlot);
        delete allData[key];
        this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
        console.log(`🗑️ 予約データ削除: ${key}`);
    }
    /**
     * 特定パビリオンの全予約データを削除
     */
    static removeReservationDataByPavilion(pavilionCode) {
        const allData = this.getAllReservationData();
        let deletedCount = 0;
        for (const key of Object.keys(allData)) {
            if (allData[key].pavilionCode === pavilionCode) {
                delete allData[key];
                deletedCount++;
            }
        }
        if (deletedCount > 0) {
            this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
            console.log(`🗑️ パビリオン予約データ削除: ${pavilionCode} (${deletedCount}件)`);
        }
    }
    /**
     * 全ての予約データをクリア
     */
    static clearAllReservationData() {
        this.removeItem(CACHE_KEYS.RESERVATION_DATA);
        console.log('🧹 全予約データクリア');
    }
    /**
     * 予約データの状態を更新
     */
    static updateReservationStatus(pavilionCode, timeSlot, status) {
        const data = this.getReservationData(pavilionCode, timeSlot);
        if (!data)
            return false;
        data.status = status;
        data.timestamp = Date.now(); // タイムスタンプ更新
        return this.saveReservationData(pavilionCode, data);
    }
    // ============ 自動操作状態管理 ============
    /**
     * 自動操作状態を保存
     */
    static saveAutomationState(state) {
        const success = this.setItem(CACHE_KEYS.AUTOMATION_STATE, state);
        if (success) {
            console.log(`🤖 自動操作状態保存: ${state.currentStep}`);
        }
        return success;
    }
    /**
     * 自動操作状態を取得
     */
    static getAutomationState() {
        return this.getItem(CACHE_KEYS.AUTOMATION_STATE);
    }
    /**
     * 自動操作状態をクリア
     */
    static clearAutomationState() {
        this.removeItem(CACHE_KEYS.AUTOMATION_STATE);
        console.log('🧹 自動操作状態クリア');
    }
    // ============ ユーザー設定管理 ============
    /**
     * ユーザー設定を保存
     */
    static saveUserPreferences(preferences) {
        return this.setItem(CACHE_KEYS.USER_PREFERENCES, preferences);
    }
    /**
     * ユーザー設定を取得
     */
    static getUserPreferences() {
        const saved = this.getItem(CACHE_KEYS.USER_PREFERENCES);
        return { ...DEFAULT_USER_PREFERENCES, ...saved };
    }
    // ============ ユーティリティ ============
    /**
     * キャッシュサイズを取得（概算）
     */
    static getCacheSize() {
        try {
            let total = 0;
            for (const key of Object.values(CACHE_KEYS)) {
                const item = sessionStorage.getItem(key);
                if (item) {
                    total += item.length;
                }
            }
            return total;
        }
        catch {
            return 0;
        }
    }
    /**
     * 期限切れデータを一括削除
     */
    static cleanupExpiredData() {
        const allData = this.getAllReservationData();
        let cleanedCount = 0;
        for (const [pavilionCode, data] of Object.entries(allData)) {
            if (ReservationDataUtils.isDataExpired(data.timestamp)) {
                delete allData[pavilionCode];
                cleanedCount++;
            }
        }
        if (cleanedCount > 0) {
            this.setItem(CACHE_KEYS.RESERVATION_DATA, allData);
            console.log(`🧹 期限切れデータ削除: ${cleanedCount}件`);
        }
    }
    /**
     * デバッグ用: 全キャッシュ内容を表示
     */
    static debugLogAllCache() {
        console.group('📋 パビリオン予約キャッシュ内容');
        console.log('予約データ:', this.getAllReservationData());
        console.log('自動操作状態:', this.getAutomationState());
        console.log('ユーザー設定:', this.getUserPreferences());
        console.log('キャッシュサイズ:', `${this.getCacheSize()} bytes`);
        console.groupEnd();
    }
    /**
     * 時間選択UIとの連携用: 選択データをキャッシュに保存
     */
    static saveSelectedTimeFromUI(pavilionCode, pavilionName, timeSlot, isAvailable) {
        const reservationData = ReservationDataUtils.createReservationData(pavilionCode, pavilionName, timeSlot, isAvailable);
        return this.saveReservationData(pavilionCode, reservationData);
    }
    /**
     * 選択された予約データ一覧を取得（処理待ち状態のもの）
     */
    static getPendingReservations() {
        const allData = this.getAllReservationData();
        return Object.values(allData).filter(data => data.status === 'pending');
    }
    /**
     * 現在処理中の予約データを取得
     */
    static getProcessingReservation() {
        const allData = this.getAllReservationData();
        return Object.values(allData).find(data => data.status === 'processing') || null;
    }
}


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

/***/ 723:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Yq: () => (/* binding */ getMonitoringScheduler)
/* harmony export */ });
/* unused harmony exports MonitoringScheduler, updateMonitoringSchedule, triggerManualCheck */
/**
 * 監視スケジューラー
 * 変更容易な監視タイミング制御
 */
// デフォルト設定（毎分00,15,30,45秒）
const DEFAULT_CONFIG = {
    intervalType: 'fixed-seconds',
    fixedSeconds: [0, 15, 30, 45]
};
class MonitoringScheduler {
    constructor(config = DEFAULT_CONFIG) {
        this.callback = null;
        this.timeoutId = null;
        this.isRunning = false;
        this.config = { ...config };
    }
    /**
     * スケジューラーを開始
     */
    start(callback) {
        if (this.isRunning) {
            this.stop();
        }
        this.callback = callback;
        this.isRunning = true;
        this.scheduleNext();
        console.log('🕐 監視スケジューラー開始:', this.getConfigDescription());
    }
    /**
     * スケジューラーを停止
     */
    stop() {
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.isRunning = false;
        this.callback = null;
        console.log('⏹️ 監視スケジューラー停止');
    }
    /**
     * スケジュール設定を更新
     */
    updateConfig(newConfig) {
        const wasRunning = this.isRunning;
        const oldCallback = this.callback;
        if (wasRunning) {
            this.stop();
        }
        this.config = { ...this.config, ...newConfig };
        console.log('⚙️ スケジューラー設定更新:', this.getConfigDescription());
        if (wasRunning && oldCallback) {
            this.start(oldCallback);
        }
    }
    /**
     * 次回実行時刻を取得
     */
    getNextExecutionTime() {
        const delay = this.calculateNextDelay();
        return new Date(Date.now() + delay);
    }
    /**
     * 現在の設定説明を取得
     */
    getConfigDescription() {
        switch (this.config.intervalType) {
            case 'fixed-seconds':
                return `毎分${this.config.fixedSeconds?.join(',')}秒`;
            case 'cron-like':
                return `Cron: ${this.config.cronExpression}`;
            case 'custom':
                return 'カスタム関数';
            default:
                return '不明な設定';
        }
    }
    /**
     * 実行中かどうか
     */
    isActive() {
        return this.isRunning;
    }
    /**
     * 手動実行トリガー
     */
    triggerManual() {
        if (this.callback) {
            console.log('🔄 手動実行トリガー');
            this.executeCallback();
        }
    }
    /**
     * 次回実行をスケジュール
     */
    scheduleNext() {
        if (!this.isRunning)
            return;
        const delay = this.calculateNextDelay();
        this.timeoutId = setTimeout(() => {
            this.executeCallback();
            this.scheduleNext(); // 次回をスケジュール
        }, delay);
        const nextTime = new Date(Date.now() + delay);
        console.log(`⏰ 次回実行予定: ${nextTime.toLocaleTimeString()}`);
    }
    /**
     * 次回実行までの遅延時間を計算
     */
    calculateNextDelay() {
        const now = new Date();
        switch (this.config.intervalType) {
            case 'fixed-seconds':
                return this.calculateFixedSecondsDelay(now);
            case 'cron-like':
                return this.calculateCronDelay(now);
            case 'custom':
                if (this.config.customFunction) {
                    return this.config.customFunction();
                }
                throw new Error('custom関数が設定されていません');
            default:
                throw new Error(`未対応のintervalType: ${this.config.intervalType}`);
        }
    }
    /**
     * 固定秒数での遅延計算
     */
    calculateFixedSecondsDelay(now) {
        const currentSeconds = now.getSeconds();
        const targetSeconds = this.config.fixedSeconds || [0];
        // 現在時刻より後の最初のターゲット秒を見つける
        let nextTarget = targetSeconds.find(s => s > currentSeconds);
        if (nextTarget === undefined) {
            // 今分にターゲットがない場合は次の分の最初のターゲット
            nextTarget = targetSeconds[0] + 60;
        }
        return (nextTarget - currentSeconds) * 1000;
    }
    /**
     * Cron式での遅延計算（簡易実装）
     */
    calculateCronDelay(now) {
        // 簡易実装: "秒,秒,秒 * * * * *" 形式のみ対応
        if (!this.config.cronExpression) {
            throw new Error('cronExpressionが設定されていません');
        }
        const parts = this.config.cronExpression.split(' ');
        if (parts.length !== 6) {
            throw new Error('Cron式の形式が不正です');
        }
        const secondsPart = parts[0];
        const targetSeconds = secondsPart.split(',').map(s => parseInt(s.trim()));
        // fixed-secondsと同じロジックを使用
        const currentSeconds = now.getSeconds();
        let nextTarget = targetSeconds.find(s => s > currentSeconds);
        if (nextTarget === undefined) {
            nextTarget = targetSeconds[0] + 60;
        }
        return (nextTarget - currentSeconds) * 1000;
    }
    /**
     * コールバック実行
     */
    async executeCallback() {
        if (!this.callback)
            return;
        try {
            console.log('🔄 監視チェック実行:', new Date().toLocaleTimeString());
            await this.callback();
        }
        catch (error) {
            console.error('❌ 監視チェックエラー:', error);
        }
    }
}
// グローバルインスタンス
let schedulerInstance = null;
/**
 * スケジューラーのシングルトンインスタンスを取得
 */
function getMonitoringScheduler(config) {
    if (!schedulerInstance || config) {
        schedulerInstance = new MonitoringScheduler(config);
    }
    return schedulerInstance;
}
/**
 * スケジューラー設定を更新（デバッグ用）
 */
function updateMonitoringSchedule(newConfig) {
    const scheduler = getMonitoringScheduler();
    scheduler.updateConfig(newConfig);
}
/**
 * 手動実行トリガー（デバッグ用）
 */
function triggerManualCheck() {
    const scheduler = getMonitoringScheduler();
    scheduler.triggerManual();
}
// グローバル公開（デバッグ用）
if (typeof window !== 'undefined') {
    window.updateMonitoringSchedule = updateMonitoringSchedule;
    window.triggerManualCheck = triggerManualCheck;
}


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

/***/ }),

/***/ 851:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  DT: () => (/* binding */ createEntranceReservationUI),
  FX: () => (/* binding */ entranceReservationHelper),
  TP: () => (/* binding */ setCacheManagerForSection7),
  startCalendarWatcher: () => (/* binding */ startCalendarWatcher),
  il: () => (/* binding */ waitForTimeSlotTable)
});

// UNUSED EXPORTS: canStartReservation, checkInitialState, checkTimeSlotSelected, checkVisitTimeButtonState, getCurrentReservationTarget, handleCalendarChange

;// ./ts/modules/audio-player.ts
/**
 * 音声再生モジュール
 * UserScript環境での音声通知機能を提供
 */
class AudioPlayer {
    /**
     * 8ビット風成功音を再生
     * 自動予約成功時の通知音として使用
     */
    static playSuccessSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            // 8ビット風のメロディ
            const chiptune = [
                { freq: 523, duration: 100 }, // C5
                { freq: 659, duration: 100 }, // E5
                { freq: 784, duration: 100 }, // G5
                { freq: 1047, duration: 100 }, // C6
                { freq: 1319, duration: 200 }, // E6
                { freq: 1047, duration: 300 } // C6
            ];
            let currentTime = 0;
            chiptune.forEach((note) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    osc.type = 'square'; // 8ビット風の矩形波
                    osc.frequency.value = note.freq;
                    // 8ビット風の音量エンベロープ
                    gain.gain.setValueAtTime(0.6, audioContext.currentTime);
                    gain.gain.setValueAtTime(0.6, audioContext.currentTime + (note.duration / 1000) * 0.7);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (note.duration / 1000));
                    osc.start(audioContext.currentTime);
                    osc.stop(audioContext.currentTime + (note.duration / 1000));
                }, currentTime);
                currentTime += note.duration + 20;
            });
        }
        catch (error) {
            console.error('Success sound playback failed:', error);
        }
    }
    /**
     * 簡単なビープ音を再生
     * @param frequency 周波数 (Hz)
     * @param duration 持続時間 (ms)
     */
    static playBeep(frequency = 800, duration = 200) {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            // 音量フェードアウト（クリック音を防ぐ）
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        }
        catch (error) {
            console.error('Beep sound playback failed:', error);
        }
    }
    /**
     * Web Audio APIがサポートされているかチェック
     */
    static isAudioSupported() {
        return !!(window.AudioContext || window.webkitAudioContext);
    }
}

// EXTERNAL MODULE: ./ts/modules/processing-overlay.ts
var processing_overlay = __webpack_require__(307);
// EXTERNAL MODULE: ./ts/modules/entrance-page-state.ts
var entrance_page_state = __webpack_require__(31);
// EXTERNAL MODULE: ./ts/modules/entrance-page-dom-utils.ts
var entrance_page_dom_utils = __webpack_require__(38);
// EXTERNAL MODULE: ./ts/modules/entrance-page-core.ts
var entrance_page_core = __webpack_require__(271);
// EXTERNAL MODULE: ./ts/modules/entrance-reservation-state-manager.ts + 1 modules
var entrance_reservation_state_manager = __webpack_require__(79);
;// ./ts/modules/entrance-page-fab.ts
// 統一処理移行により個別importは不要
// 音声再生用import

// entrance-page-stateからのimport


// entrance-page-dom-utilsからのimport


// unified-stateからのimport

// Section 6からのimport  

// UI更新ヘルパーからのimport

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
    // 既存の状態クラスを削除
    statusBadge.className = statusBadge.className.replace(/ytomo-status-\w+/g, '').trim();
    // 新しい状態クラスを追加
    const statusClass = color === 'red' ? 'ytomo-status-countdown-warning' :
        color === 'orange' ? 'ytomo-status-warning' :
            color === 'blue' ? 'ytomo-status-reservation' :
                'ytomo-status-waiting';
    statusBadge.classList.add(statusClass);
    statusBadge.classList.remove('js-hide');
    // 一定時間後に状態管理システムに更新を委譲（エラー、成功、中断メッセージ以外）
    if (color !== 'red' && color !== 'green' && color !== 'orange') {
        setTimeout(() => {
            // 状態管理システムによる更新に委譲
            if (entrance_reservation_state_manager/* entranceReservationStateManager */.xx) {
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
            }
        }, 3000);
    }
}
function createEntranceReservationUI() {
    // 既存のFABがあれば削除
    const existingFab = document.getElementById('ytomo-fab-container');
    if (existingFab) {
        existingFab.remove();
    }
    // FABコンテナを作成（右下固定）
    const fabContainer = document.createElement('div');
    fabContainer.id = 'ytomo-fab-container';
    fabContainer.className = 'ytomo-fab-container z-normal';
    // メインFABボタンを作成
    const fabButton = document.createElement('button');
    fabButton.id = 'ytomo-main-fab';
    fabButton.classList.add('ext-ytomo', 'ytomo-fab', 'state-idle');
    // FABボタンのステータス表示
    const fabIcon = document.createElement('span');
    fabIcon.classList.add('ext-ytomo', 'ytomo-fab-status', 'ytomo-fab-inner-content');
    fabIcon.innerText = '待機中';
    fabButton.appendChild(fabIcon);
    // 初期状態はytomo-fabクラスで制御
    fabButton.className = 'ytomo-fab state-idle';
    // 予約対象情報表示エリア（新規追加）
    const reservationTargetDisplay = document.createElement('div');
    reservationTargetDisplay.id = 'ytomo-reservation-target';
    reservationTargetDisplay.className = 'ytomo-reservation-target-display hidden';
    reservationTargetDisplay.title = '予約対象（クリックで詳細表示）';
    // ホバー効果はCSSで実装済み
    // ステータス表示（コンパクト）
    const statusBadge = document.createElement('div');
    statusBadge.id = 'ytomo-status-badge';
    statusBadge.className = '';
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
        // 追加のクラス確認（CSS disabled状態もチェック）
        if (fabButton.classList.contains('pointer-events-none')) {
            // pointer-events:noneのためクリック無視
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        // 中断不可期間のチェック
        if (!(0,entrance_page_core/* isInterruptionAllowed */.Is)()) {
            // リロード直前のため中断不可
            showStatus('リロード直前のため中断できません', 'red');
            return;
        }
        if (entrance_reservation_state_manager/* entranceReservationStateManager */.xx.isReservationRunning()) {
            stopReservationProcess();
            return;
        }
        // 入場予約状態管理システムを使用した開始判定
        const preferredAction = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getPreferredAction();
        // FABクリック処理開始
        if (preferredAction === 'reservation') {
            await startReservationProcess();
        }
        else {
            console.log('⚠️ 入場予約状態管理システム: 実行可能なアクションなし');
        }
        return;
    });
    // 予約中断処理
    function stopReservationProcess() {
        console.log('⏹️ 予約を中断');
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setShouldStop(true);
        showStatus('予約処理を中断中...', 'orange');
        // 中断フラグ設定後、UIを即座に更新
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
    }
    // 予約開始処理
    async function startReservationProcess() {
        console.log('🚀 入場予約状態管理システムによる予約開始');
        // DOM状態から予約対象を同期（予約開始前に必須）
        syncReservationTargetFromDOM();
        // 統一予約開始処理
        if (!entrance_reservation_state_manager/* entranceReservationStateManager */.xx.startReservation()) {
            console.error('❌ 予約開始に失敗しました');
            showStatus('予約開始失敗', 'red');
            return;
        }
        console.log('🔄 予約開始成功、FABボタン状態更新中...');
        // デバッグ: 実行状態を確認
        const currentState = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getExecutionState();
        console.log(`🔄 [予約開始後] 実行状態: ${currentState}`);
        // 予約に切り替わった場合にオーバーレイを更新
        processing_overlay/* processingOverlay */.O.show('reservation');
        showStatus('予約処理実行中...', 'blue');
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
        // デバッグ: FABボタンの現在の状態を確認
        const mainButton = document.getElementById('ytomo-main-fab');
        if (mainButton) {
            console.log(`🔄 [予約開始後] FABボタン状態: disabled=${mainButton.disabled}, title="${mainButton.title}"`);
        }
        // 予約対象表示は統一システムで管理
        // 設定オブジェクトを作成
        const config = {
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
                waitForResponse: 60000,
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
        // 予約開始前に予約対象情報を保存（成功時のUI更新用）
        const reservationTarget = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getReservationTarget();
        console.log('🔍 予約開始前の対象情報:', reservationTarget);
        try {
            const result = await entranceReservationHelper(config);
            console.log('🔍 entranceReservationHelper戻り値:', result);
            if (result.success) {
                showStatus(`🎉 予約成功！(${result.attempts}回試行)`, 'green');
                // 予約開始前に保存した対象情報で成功情報を設定
                if (reservationTarget) {
                    entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                    entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay(); // FAB表示更新
                    // 通知音が有効な場合は成功音を再生
                    const soundEnabled = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.isNotificationSoundEnabled();
                    console.log(`🔍 予約成功時の通知音設定チェック: ${soundEnabled ? '有効' : '無効'}`);
                    if (soundEnabled) {
                        console.log('🎵 予約成功 - 通知音を再生');
                        try {
                            AudioPlayer.playSuccessSound();
                            console.log('✅ 通知音再生完了');
                        }
                        catch (error) {
                            console.error('❌ 通知音再生エラー:', error);
                        }
                    }
                    else {
                        console.log('🔇 予約成功 - 通知音は無効のため再生なし');
                    }
                    console.log('✅ 予約成功UI更新完了');
                }
                else {
                    console.warn('⚠️ 予約開始前の対象情報がnullのためUI更新をスキップ');
                }
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                }
            }
            else {
                if (result.cancelled) {
                    showStatus(`⏹️ 予約中断 (${result.attempts}回試行)`, 'orange');
                    console.log('⏹️ ユーザーにより予約が中断されました');
                }
                else if (result.abnormalTermination) {
                    showStatus(`🚨 異常終了 (${result.attempts}回試行) - システム停止`, 'red');
                    console.log('🚨 予約処理が異常終了しました。システムを停止します');
                }
                else {
                    showStatus(`予約失敗 (${result.attempts}回試行)`, 'red');
                }
            }
        }
        catch (error) {
            console.error('予約処理エラー:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage === 'TargetConsistencyError') {
                showStatus('🚨 予約対象変更のため中断', 'red');
            }
            else {
                showStatus(`エラー: ${errorMessage}`, 'red');
            }
        }
        finally {
            // 入場予約状態管理システムで予約実行終了
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.stop();
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
            // 予約終了時の表示更新は統一システムで管理
        }
    }
    // disabled状態でのクリックを確実に防ぐため、キャプチャーフェーズでも処理
    fabButton.addEventListener('click', (event) => {
        if (fabButton.disabled || fabButton.hasAttribute('disabled') || fabButton.classList.contains('pointer-events-none')) {
            console.log('🚫 キャプチャーフェーズでdisabledクリックを阻止');
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            return false;
        }
        return; // 明示的なreturnを追加
    }, true); // useCapture = true
    // FABコンテナに要素を追加（上から順：予約対象→ステータス→ボタン）
    // 効率モードトグルボタン（非表示 - 効率モードは常時ON）
    const efficiencyToggleButton = document.createElement('button');
    efficiencyToggleButton.className = 'ytomo-efficiency-toggle js-hide'; // 非表示に設定
    // 効率モード状態に応じた初期表示（非表示のため更新不要）
    function updateEfficiencyToggleButton() {
        // 効率モード常時ONのため表示更新不要
        return;
    }
    updateEfficiencyToggleButton();
    // 効率モードトグル処理
    efficiencyToggleButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.toggleEfficiencyMode();
        updateEfficiencyToggleButton();
    });
    // ホバー効果はCSSで制御
    fabContainer.appendChild(reservationTargetDisplay);
    fabContainer.appendChild(statusBadge);
    fabContainer.appendChild(efficiencyToggleButton);
    fabContainer.appendChild(fabButton);
    // DOMに追加（body直下）
    document.body.appendChild(fabContainer);
    // 効率モード設定を読み込み
    entrance_reservation_state_manager/* entranceReservationStateManager */.xx.loadEfficiencyModeSettings();
    updateEfficiencyToggleButton(); // ボタン表示を更新
    // 自動選択イベントリスナーを設定
    window.addEventListener('entrance-auto-select', async (event) => {
        console.log('🎯 自動選択イベントを受信:', event.detail);
        const slot = event.detail?.slot;
        if (!slot?.targetInfo) {
            console.error('❌ 自動選択: スロット情報が無効');
            return;
        }
        try {
            // オーバーレイを確実に非表示にして状態をリセット
            console.log('🛡️ 予約移行: オーバーレイ状態をリセット');
            processing_overlay/* processingOverlay */.O.hide();
            // 1. 時間帯要素をクリックして選択状態にする
            console.log(`🖱️ 自動選択: 時間帯をクリック ${slot.targetInfo.timeSlot}`);
            const timeSlotElement = document.querySelector(slot.targetInfo.selector);
            if (timeSlotElement) {
                const buttonElement = timeSlotElement.querySelector('div[role="button"]');
                if (buttonElement) {
                    // 満員時間帯も強制選択可能（data-disabled属性に関係なく）
                    buttonElement.click();
                    console.log(`✅ 時間帯選択完了: ${slot.targetInfo.timeSlot}`);
                    // 2. 選択後、少し待ってから内部的に自動予約を開始
                    setTimeout(async () => {
                        console.log('🚀 内部的に自動予約を開始');
                        if (entrance_reservation_state_manager/* entranceReservationStateManager */.xx.canStartReservation()) {
                            await startReservationProcess();
                        }
                        else {
                            console.error('❌ 予約開始条件が満たされていません');
                        }
                    }, 100);
                }
                else {
                    console.error(`❌ 時間帯ボタンが見つからないか無効: ${slot.targetInfo.timeSlot}`);
                }
            }
            else {
                console.error(`❌ 時間帯要素が見つからない: ${slot.targetInfo.selector}`);
            }
        }
        catch (error) {
            console.error('❌ 自動選択処理エラー:', error);
        }
    });
    // FAB表示状態を初期化・適用
    (0,entrance_page_state.loadFABVisibility)();
    (0,entrance_page_state.updateFABVisibility)();
    // 初期状態を判定してFABを更新
    waitForTimeSlotTable(() => {
        checkInitialState();
    });
    // 時間帯クリックハンドラーを設定（選択解除機能付き）
    waitForTimeSlotTable(() => {
        setupTimeSlotClickHandlers();
    });
    // カレンダー変更検知は別途初期化処理で開始（キャッシュ復元後）
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
    const selectedTimeSlot = document.querySelector(timeSlotSelectors.selectedSlot);
    if (!selectedTimeSlot) {
        console.log('⚠️ 時間帯が選択されていません');
        return false;
    }
    // 選択された時間帯が満員でないかチェック
    const tdElement = selectedTimeSlot.closest('td');
    if (!tdElement)
        return false;
    const status = extractTdStatus(tdElement);
    console.log(`✅ 時間帯選択済み: ${status?.timeText || 'unknown'}`);
    return true;
}
// 予約開始可能かどうかの総合判定
function canStartReservation() {
    const hasTimeSlotTable = checkTimeSlotTableExistsSync();
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
    // 【統一システム連動】統一システムが責任を持つ場合はスキップ
    const currentState = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getExecutionState();
    const preferredAction = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getPreferredAction();
    if (currentState !== entrance_reservation_state_manager/* ExecutionState */.si.IDLE) {
        console.log(`🔄 統一システム実行中 (${currentState}) - 初期状態チェックをスキップ`);
        return;
    }
    if (preferredAction === 'reservation') {
        console.log(`🔄 統一システムがアクション決定済み (${preferredAction}) - 初期状態チェックをスキップ`);
        return;
    }
    // 【統一システム完全委譲】FABボタン状態は統一システムが一元管理
    console.log('🔄 FABボタン状態は統一システムに完全委譲');
    // 統一システムに状態更新を要求
    entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
}
// カレンダー変更を検知してボタンを再設置
function startCalendarWatcher() {
    if (entrance_page_state.calendarWatchState.isWatching)
        return;
    entrance_page_state.calendarWatchState.isWatching = true;
    entrance_page_state.calendarWatchState.currentSelectedDate = (0,entrance_page_core/* getCurrentSelectedCalendarDate */.rY)();
    // 初期化時に入場予約状態管理にも現在の選択日付を設定
    if (entrance_page_state.calendarWatchState.currentSelectedDate) {
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setSelectedCalendarDate(entrance_page_state.calendarWatchState.currentSelectedDate);
        console.log(`📅 初期化時の選択日付を設定: ${entrance_page_state.calendarWatchState.currentSelectedDate}`);
    }
    console.log('📅 カレンダー変更検知を開始');
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
                            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
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
            waitForTimeSlotTable(async () => {
                await handleCalendarChange();
            });
        }
    });
    // カレンダー要素全体を検知
    const observeTarget = document.body;
    entrance_page_state.calendarWatchState.observer.observe(observeTarget, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-pressed', 'class', 'disabled']
    });
}
// カレンダー変更・状態変更時の処理
async function handleCalendarChange() {
    // 動的待機で日付を取得（遷移中の場合は適切に待機）
    const newSelectedDate = await (0,entrance_page_core/* waitForValidCalendarDate */.p4)(3000, 100);
    const calendarDateChanged = newSelectedDate !== entrance_page_state.calendarWatchState.currentSelectedDate;
    // 入場予約状態管理の管理している日付とも比較
    const stateManagerSelectedDate = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.getSelectedCalendarDate();
    const actualDateChanged = newSelectedDate !== stateManagerSelectedDate;
    if (calendarDateChanged) {
        console.log(`📅 カレンダー日付変更を検出: ${entrance_page_state.calendarWatchState.currentSelectedDate} → ${newSelectedDate}`);
        entrance_page_state.calendarWatchState.currentSelectedDate = newSelectedDate;
        // 入場予約状態管理にも日付を設定
        if (newSelectedDate) {
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setSelectedCalendarDate(newSelectedDate);
        }
        // 実際に日付が変更された場合のみ状態をクリア
        if (actualDateChanged) {
            console.log(`📅 実際の日付変更確認: ${stateManagerSelectedDate} → ${newSelectedDate}`);
            const hasReservationTarget = entrance_reservation_state_manager/* entranceReservationStateManager */.xx.hasReservationTarget();
            if (hasReservationTarget) {
                console.log('📅 日付変更により予約対象をクリア');
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearReservationTarget();
            }
        }
        else {
            console.log('📅 同じ日付への再クリック');
        }
        // 予約対象がクリアされたため、即座にFAB表示を更新
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
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
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
        }
        // FABボタンの状態を更新
        entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
    }
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
            // 時間帯テーブル待機中（ログ削減）
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
                    entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
                }, 100);
            }
            else {
                // フォールバック: 直接削除
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.clearReservationTarget();
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
            }
        }
        else {
            // 新規選択または別の時間帯への変更
            // DOM上の選択状態から予約対象を同期
            setTimeout(() => {
                syncReservationTargetFromDOM();
                entrance_reservation_state_manager/* entranceReservationStateManager */.xx.updateFabDisplay();
            }, 100);
        }
    };
    // グローバルに保存（後でremoveするため）
    window.timeSlotClickHandler = timeSlotClickHandler;
    // 捕獲フェーズでイベントをキャッチ
    document.addEventListener('click', timeSlotClickHandler, true);
    console.log('✅ 公式サイト仕様を利用した時間帯選択解除ハンドラーを設定しました');
}
// 統一自動処理管理に対応した予約処理（Phase 3で実装）
async function entranceReservationHelper(config) {
    console.log('🚀 統一自動処理管理による入場予約補助機能を開始します...');
    try {
        // 統一自動処理管理による予約処理実行
        const result = await entrance_reservation_state_manager/* entranceReservationStateManager */.xx.executeUnifiedReservationProcess(config);
        if (result.success) {
            console.log('🎉 統一予約処理成功！');
        }
        else if (result.cancelled) {
            console.log('⏹️ 統一予約処理がキャンセルされました');
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.stop();
        }
        else if (result.abnormalTermination) {
            console.error('🚨 統一予約処理異常終了');
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.setShouldStop(true);
        }
        return result;
    }
    catch (error) {
        if (error.name === 'CancellationError') {
            console.log('⏹️ 統一予約処理が中断されました');
            entrance_reservation_state_manager/* entranceReservationStateManager */.xx.stop();
            return { success: false, attempts: 0, cancelled: true };
        }
        else {
            console.error('❌ 統一予約処理でエラー:', error);
            throw error;
        }
    }
}
// Phase 3: 統一自動処理管理により予約処理ループを完全に置換完了
// ============================================================================
// ============================================================================
// エクスポート（統一処理移行により最小限に）
// ============================================================================
// 統一自動処理管理により個別関数は不要
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
// EXTERNAL MODULE: ./node_modules/css-loader/dist/cjs.js!./node_modules/sass-loader/dist/cjs.js!./ts/styles/main.scss
var main = __webpack_require__(357);
;// ./ts/styles/main.scss

      
      
      
      
      
      
      
      
      

var options = {};

options.styleTagTransform = (styleTagTransform_default());
options.setAttributes = (setAttributesWithoutAttributes_default());
options.insert = insertBySelector_default().bind(null, "head");
options.domAPI = (styleDomAPI_default());
options.insertStyleElement = (insertStyleElement_default());

var update = injectStylesIntoStyleTag_default()(main/* default */.A, options);




       /* harmony default export */ const styles_main = (main/* default */.A && main/* default */.A.locals ? main/* default */.A.locals : undefined);

;// ./ts/modules/pavilion-search-page.ts
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
        Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 31)).then((entrancePageState) => {
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
            const countText = counts.available.toString();
            // SCSSクラスで数字部分を装飾
            button.innerHTML = `${baseText} <span class="button-count">${countText}</span>`;
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
        // 状態が変化した時のみログ出力
        const currentState = { hasMore, isLoading, buttonCount: loadAllButtons.length };
        if (JSON.stringify(currentState) !== JSON.stringify(updateLoadAllButtonState.lastState)) {
            console.log(`🔧 すべて読み込みボタン状態更新: もっと見るボタン=${hasMore ? 'あり' : 'なし'}, 実行中=${isLoading}`);
            updateLoadAllButtonState.lastState = currentState;
        }
        loadAllButtons.forEach((btn) => {
            const button = btn;
            // 実行中の場合は強制的にdisabled状態にする
            if (isLoading) {
                button.disabled = true;
                button.classList.remove("btn-enabled");
                button.classList.add("btn-disabled");
                return;
            }
            if (hasMore) {
                button.disabled = false;
                button.classList.remove("btn-done", "btn-disabled", "btn-loading");
                button.classList.add("btn-enabled");
            }
            else {
                button.disabled = true;
                button.classList.remove("btn-enabled", "btn-loading");
                button.classList.add("btn-done", "btn-disabled");
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
        // FABボタンの位置設定はCSSで行う
        // 件数表示を更新する関数（FABボタン内に表示）
        const updateCountsDisplay = () => {
            const counts = getItemCounts();
            const newText = `${counts.visible}/${counts.total}`;
            // 件数が変化した時のみログ出力
            if (countsText.innerText !== newText) {
                console.log(`📊 件数表示更新: ${newText}`);
                countsText.innerText = newText;
            }
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
            btn.classList.add('ext-ytomo', 'fab-sub-btn', 'base-style', className, 'btn-enabled');
            btn.textContent = text;
            return btn;
        };
        const btnLoadAll = createSubButton('すべて読み込み', 'btn-load-all');
        const btnFilterSafe = createSubButton('空きのみ', 'btn-filter-safe');
        const btnAlertToCopy = createSubButton('一覧コピー', 'btn-alert-to-copy');
        const btnDayReservation = createSubButton('当日予約', 'btn-day-reservation');
        // DOM構築
        subActionsContainer.appendChild(btnLoadAll);
        subActionsContainer.appendChild(btnFilterSafe);
        subActionsContainer.appendChild(btnAlertToCopy);
        subActionsContainer.appendChild(btnDayReservation);
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
    // TODO: 適切なmodule構造で置き換えるべき
    window.updateLoadAllButtonState = updateLoadAllButtonState;
    // ページ読み込み完了後に状態をチェック（複数回、より頻繁に）
    const checkIntervals = [500, 1000, 2000, 3000, 5000];
    checkIntervals.forEach((delay, index) => {
        setTimeout(() => {
            // 最初と最後のチェックのみログ出力
            if (index === 0 || index === checkIntervals.length - 1) {
                console.log(`🕐 状態チェック${index + 1} (${delay}ms後)`);
            }
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
                // 失敗した予約の通知をチェック（ページ読み込み時）
                checkAndShowFailedReservationNotification();
            }, 100);
        });
    }
    else {
        // DOMが既に読み込まれている場合は即座に実行
        setTimeout(() => {
            updateLoadAllButtonState();
            // 失敗した予約の通知をチェック（ページ読み込み時）
            checkAndShowFailedReservationNotification();
        }, 100);
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
                // 現在のフィルター状態を判定（btn-doneクラスの有無で判定）
                const isCurrentlyFiltering = target.classList.contains("btn-done");
                // ボタン状態を切り替え
                target.classList.toggle("btn-done");
                // 全ての満員パビリオンに対して状態に応じて処理
                document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])")
                    .forEach((div) => {
                    if (isCurrentlyFiltering) {
                        // 現在フィルター中 → フィルター解除（表示）
                        div.classList.remove("safe-none");
                    }
                    else {
                        // 現在フィルター無し → フィルター適用（非表示）
                        div.classList.add("safe-none");
                    }
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
                    showErrorMessage('クリップボードエラー', 'クリップボードへのコピーに失敗しました。以下のテキストを手動でコピーしてください:\n\n' + text);
                    // console.error("ytomo extension error", e);
                }
                setTimeout(() => {
                    target.disabled = false;
                }, 500);
            }
            else if (target && target.classList.contains("btn-day-reservation")) {
                // 当日予約
                console.log('🎫 当日予約ボタンがクリックされました');
                showDayReservationDialog().catch(error => {
                    console.error('❌ 当日予約ダイアログエラー:', error);
                    showMobileErrorDialog('当日予約エラー', error);
                });
            }
        }
    });
};
// スマホエラー調査用ダイアログ（詳細情報表示）
const showMobileErrorDialog = (title, error) => {
    // 既存のエラーダイアログがある場合は削除
    const existingError = document.getElementById('mobile-error-dialog');
    if (existingError) {
        existingError.remove();
    }
    // エラー情報を詳細に収集
    const errorInfo = {
        message: error?.message || String(error),
        stack: error?.stack || 'スタックトレースなし',
        name: error?.name || 'Unknown',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        // Chrome拡張環境情報
        chromeAvailable: typeof chrome !== 'undefined',
        chromeRuntimeAvailable: typeof chrome !== 'undefined' && !!chrome.runtime,
        // UserScript環境情報
        gmInfoAvailable: typeof window.GM_info !== 'undefined',
        gmAvailable: typeof GM !== 'undefined',
        gmXmlHttpRequestAvailable: typeof GM_xmlhttpRequest !== 'undefined' || (typeof GM !== 'undefined' && !!GM?.xmlHttpRequest),
        // パフォーマンス情報
        performanceNow: performance.now(),
        // 接続情報
        connectionType: navigator.connection?.effectiveType || 'unknown',
        // メモリ情報（Chrome限定）
        memoryInfo: performance.memory ? {
            used: performance.memory.usedJSHeapSize,
            total: performance.memory.totalJSHeapSize,
            limit: performance.memory.jsHeapSizeLimit
        } : null
    };
    // ダイアログコンテナ
    const dialogOverlay = document.createElement('div');
    dialogOverlay.id = 'mobile-error-dialog';
    dialogOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
    `;
    // ダイアログ本体
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    // タイトル
    const titleElement = document.createElement('h3');
    titleElement.textContent = `🚨 ${title}`;
    titleElement.style.cssText = `
        margin: 0 0 15px 0;
        color: #d32f2f;
        font-size: 18px;
    `;
    // エラー詳細
    const detailsElement = document.createElement('pre');
    detailsElement.textContent = JSON.stringify(errorInfo, null, 2);
    detailsElement.style.cssText = `
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        font-size: 12px;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 300px;
        overflow-y: auto;
        margin: 10px 0;
    `;
    // ボタン群
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 15px;
        flex-wrap: wrap;
    `;
    // コピーボタン
    const copyButton = document.createElement('button');
    copyButton.textContent = '📋 エラー情報をコピー';
    copyButton.style.cssText = `
        flex: 1;
        min-width: 120px;
        padding: 10px;
        background: #2196f3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2));
            copyButton.textContent = '✅ コピー完了';
            setTimeout(() => {
                copyButton.textContent = '📋 エラー情報をコピー';
            }, 2000);
        }
        catch {
            // クリップボードAPIが使えない場合
            const textArea = document.createElement('textarea');
            textArea.value = JSON.stringify(errorInfo, null, 2);
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyButton.textContent = '✅ コピー完了';
        }
    });
    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.textContent = '❌ 閉じる';
    closeButton.style.cssText = `
        flex: 1;
        min-width: 120px;
        padding: 10px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    closeButton.addEventListener('click', () => {
        dialogOverlay.remove();
    });
    // DOM構築
    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(closeButton);
    dialog.appendChild(titleElement);
    dialog.appendChild(detailsElement);
    dialog.appendChild(buttonGroup);
    dialogOverlay.appendChild(dialog);
    document.body.appendChild(dialogOverlay);
    // タップで閉じる
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            dialogOverlay.remove();
        }
    });
    console.log('📱 スマホエラーダイアログ表示:', errorInfo);
};
// エラーメッセージ表示関数
const showErrorMessage = (title, message) => {
    // 既存のエラーメッセージがある場合は削除
    const existingError = document.getElementById('ytomo-error-message');
    if (existingError) {
        existingError.remove();
    }
    const errorDiv = document.createElement('div');
    errorDiv.id = 'ytomo-error-message';
    errorDiv.className = 'ytomo-error-message';
    const titleDiv = document.createElement('div');
    titleDiv.className = 'error-title';
    titleDiv.textContent = title;
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    const closeButton = document.createElement('button');
    closeButton.className = 'error-close-btn';
    closeButton.textContent = '閉じる';
    closeButton.addEventListener('click', () => {
        errorDiv.remove();
    });
    errorDiv.appendChild(titleDiv);
    errorDiv.appendChild(messageDiv);
    errorDiv.appendChild(closeButton);
    document.body.appendChild(errorDiv);
    // 10秒後に自動で消去
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
};
// 当日予約ダイアログ表示関数
const showDayReservationDialog = async () => {
    console.log('🎫 当日予約ダイアログを表示します');
    try {
        // 万博API 全体データを取得（フィルターは表示側で制御）
        const expoData = await fetchAllExpoReservationData();
        createDayReservationDialog(expoData, false); // デフォルトは空きのみモード
        // 失敗した予約の通知をチェック
        await checkAndShowFailedReservationNotification();
    }
    catch (error) {
        console.error('❌ 万博API データの取得に失敗:', error);
        showMobileErrorDialog('データ取得エラー', error);
    }
};
// 万博API 全体データ取得関数（空きなしも含む）
const fetchAllExpoReservationData = async () => {
    console.log('🌐 万博API から全体データを取得中...');
    try {
        let data;
        // UserScript環境を最優先で判定（GM_infoやGMオブジェクトで確実に識別）
        if (typeof window.GM_info !== 'undefined' || typeof GM !== 'undefined') {
            // UserScript環境: GM_xmlhttpRequestを使用
            data = await new Promise((resolve, reject) => {
                const request = GM_xmlhttpRequest || GM?.xmlHttpRequest;
                if (!request) {
                    reject(new Error('GM_xmlhttpRequest not available'));
                    return;
                }
                request({
                    method: 'GET',
                    url: 'https://expo.ebii.net/api/data',
                    onload: (response) => {
                        try {
                            const jsonData = JSON.parse(response.responseText);
                            resolve(jsonData);
                        }
                        catch (e) {
                            reject(new Error('Failed to parse JSON response'));
                        }
                    },
                    onerror: (error) => {
                        reject(new Error(`Request failed: ${error}`));
                    }
                });
            });
        }
        else if (typeof chrome !== 'undefined' && chrome.runtime) {
            // Chrome拡張機能環境: background scriptを経由
            const response = await new Promise((resolve, reject) => {
                let isResolved = false;
                // 10秒タイムアウト
                const timeout = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        reject(new Error('Chrome拡張API応答タイムアウト（10秒）- スマホ環境ではUserScript推奨'));
                    }
                }, 10000);
                try {
                    chrome.runtime.sendMessage({ action: 'fetchExpoData' }, (response) => {
                        if (isResolved)
                            return; // タイムアウト後は無視
                        clearTimeout(timeout);
                        isResolved = true;
                        // Chrome拡張APIエラーをチェック
                        if (chrome.runtime.lastError) {
                            reject(new Error(`Chrome拡張APIエラー: ${chrome.runtime.lastError.message}`));
                            return;
                        }
                        // 応答がundefinedの場合の処理
                        if (!response) {
                            reject(new Error('Chrome拡張APIから応答がありません（スマホ環境の可能性）'));
                            return;
                        }
                        resolve(response);
                    });
                }
                catch (error) {
                    if (!isResolved) {
                        clearTimeout(timeout);
                        isResolved = true;
                        reject(new Error(`Chrome拡張API呼び出しエラー: ${error}`));
                    }
                }
            });
            if (!response.success || !response.data) {
                const error = new Error(response.error || 'Chrome拡張API呼び出し失敗');
                error.context = {
                    environment: 'chrome-extension',
                    chromeRuntime: !!chrome?.runtime,
                    response: response
                };
                throw error;
            }
            data = response.data;
        }
        else {
            // サポートされていない環境
            throw new Error('この機能はChrome拡張機能またはUserScript環境でのみ利用可能です');
        }
        console.log('✅ 万博API 全体データ取得成功:', data.length, '件のパビリオン');
        // 全てのパビリオンを返す（フィルタリングなし）
        return data;
    }
    catch (error) {
        console.error('❌ 万博API 全体データ取得エラー:', error);
        throw error;
    }
};
// 当日予約ダイアログ作成関数
const createDayReservationDialog = (pavilionData, showAll = false) => {
    console.log('🏗️ 当日予約ダイアログを作成中...', pavilionData.length, '件のパビリオン');
    // 既存のダイアログがある場合は削除
    const existingDialog = document.getElementById('day-reservation-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    // ダイアログ全体のコンテナ
    const dialogOverlay = document.createElement('div');
    dialogOverlay.id = 'day-reservation-dialog';
    dialogOverlay.className = 'ytomo-dialog overlay';
    // ダイアログコンテンツ
    const dialogContent = document.createElement('div');
    dialogContent.className = 'ytomo-dialog container day-reservation';
    // ヘッダー
    const header = document.createElement('div');
    header.className = 'ytomo-dialog header';
    // タイトル
    const title = document.createElement('h2');
    title.className = 'ytomo-dialog title';
    title.textContent = '当日予約';
    // 更新ボタン（右上）
    const refreshButton = document.createElement('button');
    refreshButton.className = 'ytomo-dialog refresh-button';
    refreshButton.textContent = '🔄';
    refreshButton.title = '更新';
    refreshButton.addEventListener('click', async () => {
        refreshButton.disabled = true;
        refreshButton.textContent = '⏳';
        // 選択状態をクリア
        selectedTimes.clear();
        // キャッシュもクリア
        Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 619)).then(({ PavilionReservationCache }) => {
            PavilionReservationCache.clearAllReservationData();
        }).catch(error => {
            console.error('❌ キャッシュクリアエラー:', error);
        });
        try {
            // 常に全体データを取得してフィルターで制御
            const newData = await fetchAllExpoReservationData();
            dialogOverlay.remove();
            createDayReservationDialog(newData, showAll);
        }
        catch (error) {
            console.error('❌ データ更新エラー:', error);
            showMobileErrorDialog('更新エラー', error);
        }
        finally {
            refreshButton.disabled = false;
            refreshButton.textContent = '🔄';
        }
    });
    // 空きのみトグルボタン（更新ボタンの左に配置）
    const availableOnlyToggle = document.createElement('button');
    availableOnlyToggle.className = `ytomo-dialog available-only-toggle ${!showAll ? 'active' : ''}`;
    availableOnlyToggle.textContent = '空きのみ';
    availableOnlyToggle.title = '空きのあるパビリオンのみ表示';
    // 空きのみトグルイベント（フィルター切り替えのみ、データ再取得なし）
    availableOnlyToggle.addEventListener('click', () => {
        const isCurrentlyActive = availableOnlyToggle.classList.contains('active');
        const newShowAll = isCurrentlyActive; // activeの場合は全表示に切り替え
        // 選択状態をクリア
        selectedTimes.clear();
        // キャッシュもクリア
        Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 619)).then(({ PavilionReservationCache }) => {
            PavilionReservationCache.clearAllReservationData();
        }).catch(error => {
            console.error('❌ キャッシュクリアエラー:', error);
        });
        // 既存データでダイアログを再作成（フィルター適用）
        dialogOverlay.remove();
        createDayReservationDialog(pavilionData, newShowAll);
    });
    header.appendChild(title);
    header.appendChild(availableOnlyToggle);
    header.appendChild(refreshButton);
    // 説明文・通知エリア（同じ位置に配置）
    const infoArea = document.createElement('div');
    infoArea.className = 'day-reservation-info-area';
    // デフォルトの説明文
    const description = document.createElement('p');
    description.className = 'day-reservation-description';
    description.innerHTML = ``;
    // 通知エリア（初期は非表示）
    const notificationArea = document.createElement('div');
    notificationArea.className = 'day-reservation-notification hidden';
    infoArea.appendChild(description);
    infoArea.appendChild(notificationArea);
    // パビリオンリスト
    const pavilionList = document.createElement('div');
    pavilionList.className = 'pavilion-list';
    // パビリオンデータが空の場合
    if (pavilionData.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'pavilion-list-empty';
        noDataMessage.textContent = '現在予約可能なパビリオンはありません';
        pavilionList.appendChild(noDataMessage);
    }
    else {
        // パビリオンリストを作成（フィルター適用）
        const filteredData = showAll ? pavilionData : pavilionData.filter(pavilion => {
            // 空きのみモード: 空きありまたは残りわずかのパビリオンのみ表示
            return pavilion.s.some(slot => slot.s === 0 || slot.s === 1);
        });
        if (filteredData.length === 0) {
            const noDataMessage = document.createElement('div');
            noDataMessage.className = 'pavilion-list-empty';
            noDataMessage.textContent = showAll ? 'パビリオンデータがありません' : '現在予約可能なパビリオンはありません';
            pavilionList.appendChild(noDataMessage);
        }
        else {
            filteredData.forEach(pavilion => {
                const pavilionItem = createPavilionListItem(pavilion, showAll);
                pavilionList.appendChild(pavilionItem);
            });
        }
    }
    // ボタングループ
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'ytomo-dialog button-group';
    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.className = 'ytomo-dialog secondary-button';
    closeButton.textContent = '閉じる';
    closeButton.addEventListener('click', () => {
        dialogOverlay.remove();
    });
    // 右側ボタングループ
    const rightButtonGroup = document.createElement('div');
    rightButtonGroup.className = 'ytomo-dialog right-button-group';
    // 選択解除ボタン（監視開始の左）- 空きのみOFFの時のみ表示
    const clearSelectionButton = document.createElement('button');
    clearSelectionButton.className = 'ytomo-dialog clear-selection-button';
    clearSelectionButton.textContent = '選択解除';
    clearSelectionButton.title = '全ての監視対象を解除';
    clearSelectionButton.addEventListener('click', async () => {
        try {
            const { MonitoringCacheManager } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 76));
            MonitoringCacheManager.clearTargets();
            // 全ての選択状態を解除
            const selectedButtons = document.querySelectorAll('.pavilion-time-slot.selected');
            selectedButtons.forEach(button => {
                button.classList.remove('selected');
            });
            // 監視対象数を更新
            updateMonitoringCount();
            console.log('🗑️ 全監視対象を解除しました');
        }
        catch (error) {
            console.error('❌ 選択解除エラー:', error);
        }
    });
    // 監視ボタン（右下）- 空きのみOFFの時のみ表示
    const monitorButton = document.createElement('button');
    monitorButton.className = 'ytomo-dialog monitor-button';
    monitorButton.innerHTML = '監視';
    monitorButton.title = 'パビリオン監視を開始';
    monitorButton.addEventListener('click', async () => {
        try {
            const { startPavilionMonitoring, getMonitoringStatus } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 141));
            const status = getMonitoringStatus();
            if (status.isRunning) {
                // 監視停止
                const { stopPavilionMonitoring } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 141));
                stopPavilionMonitoring();
                monitorButton.textContent = '監視開始';
                monitorButton.style.background = '';
                console.log('⏹️ パビリオン監視停止');
            }
            else {
                // 監視開始
                const success = await startPavilionMonitoring();
                if (success) {
                    monitorButton.textContent = '監視停止';
                    monitorButton.style.background = '#FF6B35';
                    console.log('🚀 パビリオン監視開始');
                }
                else {
                    alert('監視対象が選択されていません。満員の時間帯を選択してから監視を開始してください。');
                }
            }
        }
        catch (error) {
            console.error('❌ 監視ボタンエラー:', error);
            alert(`監視処理でエラーが発生しました: ${error}`);
        }
    });
    // 空きのみOFFの時のみ監視関連ボタンを表示
    if (showAll) {
        rightButtonGroup.appendChild(clearSelectionButton);
        rightButtonGroup.appendChild(monitorButton);
    }
    buttonGroup.appendChild(closeButton);
    buttonGroup.appendChild(rightButtonGroup);
    // DOM構築
    dialogContent.appendChild(header);
    dialogContent.appendChild(infoArea);
    dialogContent.appendChild(pavilionList);
    dialogContent.appendChild(buttonGroup);
    dialogOverlay.appendChild(dialogContent);
    // ダイアログを表示
    document.body.appendChild(dialogOverlay);
    // 背景クリックで閉じる
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            dialogOverlay.remove();
        }
    });
    // 通知表示機能をグローバルに公開
    window.showReservationNotification = (type, message, autoHide = true) => {
        showReservationNotification(notificationArea, description, type, message, autoHide);
    };
    console.log('✅ 当日予約ダイアログ表示完了');
};
// 予約結果通知を表示する関数
const showReservationNotification = (notificationArea, description, type, message, autoHide = true) => {
    // 通知内容を構築
    const notificationContent = document.createElement('div');
    notificationContent.className = `notification-content ${type}`;
    const icon = getNotificationIcon(type);
    const messageElement = document.createElement('span');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '×';
    closeButton.title = '閉じる';
    notificationContent.appendChild(document.createTextNode(icon + ' '));
    notificationContent.appendChild(messageElement);
    notificationContent.appendChild(closeButton);
    // 通知エリアをクリアして新しい通知を追加
    notificationArea.innerHTML = '';
    notificationArea.appendChild(notificationContent);
    // 説明文を非表示にして通知を表示
    description.classList.add('hidden');
    notificationArea.classList.remove('hidden');
    // 閉じるボタンの処理
    const hideNotification = () => {
        notificationArea.classList.add('hidden');
        description.classList.remove('hidden');
    };
    closeButton.addEventListener('click', hideNotification);
    // 自動非表示
    if (autoHide) {
        setTimeout(() => {
            if (!notificationArea.classList.contains('hidden')) {
                hideNotification();
            }
        }, 8000); // 8秒後に自動非表示
    }
};
// 通知タイプに応じたアイコンを取得
const getNotificationIcon = (type) => {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return 'ℹ️';
    }
};
// テスト用のグローバル関数を公開
if (typeof window !== 'undefined') {
    window.testReservationNotification = () => {
        console.log('🧪 通知テスト実行');
        if (typeof window.showReservationNotification === 'function') {
            window.showReservationNotification('success', '予約完了: テストパビリオン 15:00～');
            setTimeout(() => {
                window.showReservationNotification('error', '予約失敗: ネットワークエラー');
            }, 2000);
            setTimeout(() => {
                window.showReservationNotification('warning', 'リダイレクト異常により元のページに復旧しました');
            }, 4000);
            setTimeout(() => {
                window.showReservationNotification('info', '監視成功: 日本館 1300 の空きを検知し予約開始');
            }, 6000);
        }
        else {
            console.error('❌ 通知関数が利用できません');
        }
    };
}
;
// パビリオンリストアイテム作成関数
const createPavilionListItem = (pavilion, showAll = false) => {
    const item = document.createElement('div');
    item.className = 'pavilion-item';
    // パビリオン情報エリア
    const infoArea = document.createElement('div');
    infoArea.className = 'pavilion-info';
    // パビリオン名行（名前 + 選択ボタン）
    const nameRow = document.createElement('div');
    nameRow.className = 'pavilion-name-row';
    // 選択ボタン（空きのみOFFの時のみ表示）
    const selectAllButton = document.createElement('button');
    selectAllButton.className = 'pavilion-select-all-btn';
    selectAllButton.textContent = '選択';
    selectAllButton.title = 'このパビリオンの満員時間をすべて監視対象に追加';
    // 選択ボタンのクリックイベント
    selectAllButton.addEventListener('click', () => {
        selectAllUnavailableSlots(pavilion, showAll);
    });
    // パビリオン名
    const name = document.createElement('div');
    name.className = 'pavilion-name';
    name.textContent = pavilion.n;
    // 空きのみOFFの時のみ選択ボタンを表示
    if (showAll) {
        nameRow.appendChild(selectAllButton);
    }
    nameRow.appendChild(name);
    // 時間枠情報
    const timeSlots = document.createElement('div');
    timeSlots.className = 'pavilion-time-slots';
    // 時間枠を個別のbutton要素で表示
    const allSlots = pavilion.s || [];
    if (allSlots.length > 0) {
        allSlots.forEach(slot => {
            const timeElement = createTimeSlotElement(slot, pavilion, showAll);
            if (timeElement) {
                timeSlots.appendChild(timeElement);
            }
        });
    }
    else {
        timeSlots.textContent = '時間枠情報なし';
    }
    infoArea.appendChild(nameRow);
    infoArea.appendChild(timeSlots);
    item.appendChild(infoArea);
    return item;
};
// ステータスアイコン取得関数
const getStatusIcon = (status) => {
    return status === 0 ? '🟢' : status === 1 ? '🟡' : '🔴';
};
// 選択状態管理（複数時間選択対応）
const selectedTimes = new Map(); // Map<pavilionCode, Set<timeSlot>>
// デバッグ用: 選択状況を確認
const getSelectedTimes = () => {
    const result = {};
    selectedTimes.forEach((timeSlots, pavilionCode) => {
        result[pavilionCode] = Array.from(timeSlots);
    });
    return result;
};
// デバッグ用: 選択状況をフォーマットして表示
const logSelectedTimes = () => {
    const selections = getSelectedTimes();
    if (Object.keys(selections).length === 0) {
        console.log('📋 時間選択状況: 選択なし');
        return;
    }
    console.log('📋 時間選択状況:');
    Object.entries(selections).forEach(([pavilionCode, timeSlots]) => {
        const times = timeSlots.map(slot => `${slot.slice(0, 2)}:${slot.slice(2)}`).join(', ');
        console.log(`  ${pavilionCode}: ${times} (${timeSlots.length}件)`);
    });
};
// キャッシュデバッグ機能
const debugCache = () => {
    Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 619)).then(({ PavilionReservationCache }) => {
        PavilionReservationCache.debugLogAllCache();
    }).catch(error => {
        console.error('❌ キャッシュデバッグエラー:', error);
    });
};
// キャッシュクリア機能
const clearCache = () => {
    Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 619)).then(({ PavilionReservationCache }) => {
        PavilionReservationCache.clearAllReservationData();
        console.log('🧹 パビリオン予約キャッシュをクリアしました');
    }).catch(error => {
        console.error('❌ キャッシュクリアエラー:', error);
    });
};
// グローバルに公開（デバッグ用）
window.getSelectedTimes = getSelectedTimes;
window.logSelectedTimes = logSelectedTimes;
window.debugCache = debugCache;
window.clearCache = clearCache;
// 時間枠クリック処理（空き/満員に応じた分岐処理）
const handleTimeSlotClick = (pavilionCode, timeSlot, buttonElement) => {
    const pavilionName = buttonElement.dataset['pavilionName'] || pavilionCode;
    const isAvailable = buttonElement.dataset['available'] === 'true';
    if (isAvailable) {
        // 空き時間帯: 即時予約実行
        handleImmediateReservation(pavilionCode, pavilionName, timeSlot, buttonElement);
    }
    else {
        // 満員時間帯: 監視対象選択/解除
        handleMonitoringSelection(pavilionCode, pavilionName, timeSlot, buttonElement);
    }
};
// 即時予約処理
const handleImmediateReservation = async (pavilionCode, pavilionName, timeSlot, buttonElement) => {
    const timeDisplay = `${timeSlot.slice(0, 2)}:${timeSlot.slice(2)}`;
    console.log('🚀 即時予約実行:', pavilionName, timeDisplay);
    try {
        // 即時予約機能を使用
        const { executeImmediateReservation } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 599));
        const success = await executeImmediateReservation(pavilionCode, pavilionName, timeSlot, timeDisplay);
        if (success) {
            // 成功時の視覚的フィードバック
            buttonElement.style.background = '#4CAF50';
            buttonElement.style.color = 'white';
            setTimeout(() => {
                buttonElement.style.background = '';
                buttonElement.style.color = '';
            }, 2000);
        }
    }
    catch (error) {
        console.error('❌ 即時予約エラー:', error);
        alert(`予約処理でエラーが発生しました: ${error}`);
    }
};
// 監視対象選択処理
const handleMonitoringSelection = async (pavilionCode, pavilionName, timeSlot, buttonElement) => {
    try {
        const { MonitoringCacheManager } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 76));
        const isCurrentlySelected = buttonElement.classList.contains('selected');
        const success = MonitoringCacheManager.toggleTarget(pavilionCode, timeSlot, pavilionName);
        if (success) {
            if (isCurrentlySelected) {
                // 選択解除
                buttonElement.classList.remove('selected');
                console.log(`🗑️ 監視対象解除: ${pavilionName} - ${timeSlot}`);
                console.log(`🔍 選択解除後のクラス: ${buttonElement.className}`);
            }
            else {
                // 選択追加
                buttonElement.classList.add('selected');
                console.log(`✅ 監視対象追加: ${pavilionName} - ${timeSlot}`);
                console.log(`🔍 選択後のクラス: ${buttonElement.className}`);
                console.log(`🔍 選択後のスタイル: background=${getComputedStyle(buttonElement).backgroundColor}, border=${getComputedStyle(buttonElement).borderColor}`);
            }
            // 監視対象数を更新
            updateMonitoringCount();
        }
    }
    catch (error) {
        console.error('❌ 監視対象選択エラー:', error);
    }
};
// 監視対象数更新
const updateMonitoringCount = async () => {
    try {
        const { MonitoringCacheManager } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 76));
        const targets = MonitoringCacheManager.getTargets();
        // 監視ボタンのテキストを更新
        const monitorButton = document.querySelector('.ytomo-dialog.monitor-button');
        if (monitorButton) {
            monitorButton.textContent = targets.length > 0 ? `監視開始 (${targets.length})` : '監視開始';
        }
    }
    catch (error) {
        console.error('❌ 監視対象数更新エラー:', error);
    }
};
// パビリオンの満員時間をすべて選択
const selectAllUnavailableSlots = async (pavilion, showAll) => {
    try {
        const { MonitoringCacheManager } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 76));
        const allSlots = pavilion.s || [];
        let addedCount = 0;
        for (const slot of allSlots) {
            const isAvailable = slot.s === 0 || slot.s === 1;
            // 満員時間のみ対象、または空きのみOFFの場合は全表示されている時間を対象
            if (!isAvailable || (showAll && !isAvailable)) {
                const success = MonitoringCacheManager.addTarget(pavilion.c, slot.t, pavilion.n);
                if (success) {
                    addedCount++;
                    // UI上のボタンも選択状態にする
                    const buttons = document.querySelectorAll('.pavilion-time-slot');
                    for (const btn of buttons) {
                        const btnElement = btn;
                        if (btnElement.dataset['pavilionCode'] === pavilion.c &&
                            btnElement.dataset['timeSlot'] === slot.t) {
                            btnElement.classList.add('selected');
                            break;
                        }
                    }
                }
            }
        }
        if (addedCount > 0) {
            console.log(`✅ ${pavilion.n} の満員時間 ${addedCount}件を監視対象に追加`);
            updateMonitoringCount();
        }
        else {
            console.log(`⚠️ ${pavilion.n} に追加可能な満員時間がありません`);
        }
    }
    catch (error) {
        console.error('❌ 一括選択エラー:', error);
    }
};
// 時間枠要素作成関数
const createTimeSlotElement = (slot, pavilion, showAll) => {
    const time = `${slot.t.slice(0, 2)}:${slot.t.slice(2)}`;
    const isAvailable = slot.s === 0 || slot.s === 1;
    // 空きのみON かつ 予約不可 → 表示しない
    if (!showAll && !isAvailable) {
        return null;
    }
    // 表示される時間枠はすべて選択可能（button要素）
    const button = document.createElement('button');
    button.className = `pavilion-time-slot clickable ${!isAvailable ? 'unavailable' : ''}`;
    button.innerHTML = `${getStatusIcon(slot.s)}${time}`;
    button.dataset['timeSlot'] = slot.t;
    button.dataset['pavilionCode'] = pavilion.c;
    button.dataset['pavilionName'] = pavilion.n;
    button.dataset['available'] = isAvailable.toString();
    // クリックイベント追加
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTimeSlotClick(pavilion.c, slot.t, button);
    });
    return button;
};
// 予約画面への遷移関数（Phase 3で使用予定）
const navigateToReservation = (pavilion) => {
    console.log('🎯 予約画面への遷移:', pavilion.n);
    // ダイアログを閉じる
    const dialog = document.getElementById('day-reservation-dialog');
    if (dialog) {
        dialog.remove();
    }
    // パビリオンコードを使って予約画面に遷移
    // 実際の予約画面のURLパターンを使用
};
// TypeScript unused警告回避のため一時的に使用
void navigateToReservation;
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
// 失敗した予約の通知をチェックして表示
const checkAndShowFailedReservationNotification = async () => {
    try {
        // sessionStorageから失敗情報をチェック（異常リダイレクト用）
        const failureInfoStr = sessionStorage.getItem('expo_reservation_failure');
        if (failureInfoStr) {
            const failureInfo = JSON.parse(failureInfoStr);
            // グローバル通知システムで表示
            if (typeof window.showReservationNotification === 'function') {
                window.showReservationNotification('error', `予約に失敗しました: ${failureInfo.pavilionName} ${failureInfo.timeDisplay}～（${failureInfo.reason}）`, false // 自動非表示しない
                );
                console.log('📢 異常リダイレクトによる失敗通知を表示しました');
            }
            // 表示完了後、sessionStorageをクリア
            sessionStorage.removeItem('expo_reservation_failure');
            return;
        }
        // 従来の失敗予約チェック（その他のエラー用）
        const { PavilionReservationCache } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 619));
        const allData = PavilionReservationCache.getAllReservationData();
        // 失敗状態の予約を検索
        const failedReservations = Object.values(allData).filter(data => data.status === 'failed');
        if (failedReservations.length > 0) {
            // 最新の失敗予約を表示
            const latestFailed = failedReservations.sort((a, b) => b.timestamp - a.timestamp)[0];
            // グローバル通知システムで表示
            if (typeof window.showReservationNotification === 'function') {
                window.showReservationNotification('error', `予約に失敗しました: ${latestFailed.pavilionName} ${latestFailed.selectedTimeDisplay}～`, false // 自動非表示しない
                );
                console.log('📢 失敗した予約の通知を表示しました');
            }
            // 通知を表示した予約データを削除（重複表示を防ぐ）
            PavilionReservationCache.removeReservationData(latestFailed.pavilionCode, latestFailed.selectedTimeSlot);
        }
    }
    catch (error) {
        console.error('❌ 失敗予約通知チェックエラー:', error);
    }
};
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


// EXTERNAL MODULE: ./ts/modules/entrance-page-state.ts
var entrance_page_state = __webpack_require__(31);
// EXTERNAL MODULE: ./ts/modules/entrance-page-dom-utils.ts
var entrance_page_dom_utils = __webpack_require__(38);
// EXTERNAL MODULE: ./ts/modules/entrance-page-core.ts
var entrance_page_core = __webpack_require__(271);
// EXTERNAL MODULE: ./ts/modules/entrance-page-fab.ts + 1 modules
var entrance_page_fab = __webpack_require__(851);
;// ./ts/modules/entrance-page-init.ts
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
    const { setPageLoadingStateFn, createEntranceReservationUIFn, restoreFromCacheFn } = dependencies;
    // ヘッダーにFAB切替ボタンを追加（DOM構築完了を待つ）
    setTimeout(() => {
        Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 31)).then((entrancePageState) => {
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
    // 時間帯テーブル初期化（動的待機）
    (async () => {
        // キャッシュからの状態復元（カレンダー読み込み完了後に実行）
        if (restoreFromCacheFn)
            await restoreFromCacheFn();
        // キャッシュ復元後にカレンダー変更を開始
        const { startCalendarWatcher } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 851));
        startCalendarWatcher();
        // 初期化完了時に読み込み状態を解除
        if (setPageLoadingStateFn)
            setPageLoadingStateFn(false);
    })();
    console.log("入場予約機能の初期化完了");
};

;// ./ts/modules/cache-manager.ts
// ============================================================================
// キャッシュ管理機能
const createCacheManager = (_dependencies = {}) => {
    return {
        // キー生成（URLベース）
        generateKey(suffix = '') {
            const url = new URL(window.location.href);
            const baseKey = `expo2025_entrance_${url.searchParams.get('reserve_id') || 'default'}`;
            return suffix ? `${baseKey}_${suffix}` : baseKey;
        },
        // 空の保存処理
        saveTargetSlots() {
            return;
        },
        // 後方互換性のため残す
        saveTargetSlot(_slotInfo) {
            this.saveTargetSlots();
        },
        // キャッシュ時間帯を読み込み
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
                console.log('📖 キャッシュから時間帯を読み込み:', parsed.timeSlot);
                return parsed;
            }
            catch (error) {
                console.error('❌ キャッシュ読み込みエラー:', error);
                return null;
            }
        },
        // 複数キャッシュを読み込み（後方互換性あり）
        loadTargetSlots() {
            try {
                // 新形式の複数キャッシュを確認
                const newData = localStorage.getItem(this.generateKey('target_slots'));
                if (newData) {
                    const parsed = JSON.parse(newData);
                    // 24時間以内のデータのみ有効
                    if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                        this.clearTargetSlots();
                        return null;
                    }
                    const targetTexts = parsed.targets?.map((t) => t.timeSlot).join(', ') || '不明';
                    console.log(`📖 複数キャッシュを読み込み: ${targetTexts} (${parsed.targets?.length || 0}個)`);
                    return parsed;
                }
                // 後方互換性：古い単一キャッシュを確認
                const oldData = this.loadTargetSlot();
                if (oldData) {
                    console.log('📖 単一キャッシュを複数形式に変換中...');
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
                console.error('❌ 複数キャッシュ読み込みエラー:', error);
                return null;
            }
        },
        // 複数キャッシュをクリア
        clearTargetSlots() {
            try {
                localStorage.removeItem(this.generateKey('target_slots'));
                localStorage.removeItem(this.generateKey('target_slot')); // 古い形式もクリア
                console.log('🗑️ 複数キャッシュをクリア');
            }
            catch (error) {
                console.error('❌ 複数キャッシュクリアエラー:', error);
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
    };
}; // createCacheManager の終了
// エクスポート

// ============================================================================

// EXTERNAL MODULE: ./ts/modules/processing-overlay.ts
var processing_overlay = __webpack_require__(307);
;// ./ts/modules/companion-ticket-page.ts
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
// 画面で追加済みのチケットIDを検出
function getAlreadyAddedTicketIds() {
    const addedTicketIds = new Set();
    try {
        // 直接的で効率的なセレクタ: チケットIDを直接取得
        const ticketIdElements = document.querySelectorAll('ul[data-list-type="myticket_send"] > li > div > dl > div:first-of-type > dd');
        ticketIdElements.forEach(dd => {
            const ticketId = dd.textContent?.trim();
            if (ticketId) {
                addedTicketIds.add(ticketId);
            }
        });
        console.log(`🔍 画面で検出された追加済みチケットID: ${Array.from(addedTicketIds).join(', ')}`);
    }
    catch (error) {
        console.error('追加済みチケットID検出エラー:', error);
    }
    return addedTicketIds;
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
        this.currentTimeoutId = null;
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
        // 同行者処理用オーバーレイを表示
        processing_overlay/* processingOverlay */.O.show('companion');
        this.processNext();
    }
    // 次のチケットID処理
    async processNext() {
        // 中断チェック
        if (!this.state.isRunning) {
            console.log('🛑 処理が中断されたため、次の処理をスキップします');
            return;
        }
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
                // 次の処理（待機時間後）
                this.currentTimeoutId = window.setTimeout(() => {
                    if (this.state.isRunning) { // 中断されていないかチェック
                        this.processNext();
                    }
                }, 1000 + Math.random() * 1000);
            }
            else {
                this.handleError(ticketId, '処理に失敗しました');
                // 失敗時は処理を中断
                console.log('❌ 同行者追加処理に失敗したため処理を中断します');
                this.completeProcess();
                return;
            }
        }
        catch (error) {
            this.handleError(ticketId, error instanceof Error ? error.message : '不明なエラー');
            // エラー時も処理を中断
            console.log('❌ 同行者追加処理でエラーが発生したため処理を中断します');
            this.completeProcess();
            return;
        }
    }
    // 個別チケットID処理（実際の同行者追加処理）
    async processTicketId(ticketId) {
        console.log(`🎫 チケットID ${ticketId} の処理開始`);
        try {
            // 中断チェック
            if (!this.state.isRunning) {
                console.log('🛑 処理が中断されたため、チケット処理を停止します');
                return false;
            }
            // Phase 1: チケット選択画面で同行者追加ボタンをクリック
            if (isTicketSelectionPage()) {
                const success = await this.clickCompanionAddButton();
                if (!success) {
                    throw new Error('同行者追加ボタンのクリックに失敗');
                }
                // 中断チェック
                if (!this.state.isRunning) {
                    console.log('🛑 処理が中断されたため、画面遷移後の処理を停止します');
                    return false;
                }
                // 画面遷移を待機
                await this.waitForPageTransition();
            }
            // 中断チェック
            if (!this.state.isRunning) {
                console.log('🛑 処理が中断されたため、チケットID入力前に処理を停止します');
                return false;
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
            // 中断チェック
            if (!this.state.isRunning) {
                console.log('🛑 処理が中断されたため、入力後の処理を停止します');
                return false;
            }
            // 入力後の安定化待機（UI更新を確実に待つ）
            console.log('⏳ 入力後の安定化待機中...');
            await new Promise(resolve => setTimeout(resolve, 1000));
            // 中断チェック
            if (!this.state.isRunning) {
                console.log('🛑 処理が中断されたため、安定化待機後の処理を停止します');
                return false;
            }
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
            // 中断チェック
            if (!this.state.isRunning) {
                console.log('🛑 処理が中断されたため、追加ボタンクリック前に処理を停止します');
                return false;
            }
            // 追加ボタンクリック
            const addSuccess = await this.clickAddButton();
            if (!addSuccess) {
                throw new Error('追加ボタンのクリックに失敗');
            }
            // 中断チェック
            if (!this.state.isRunning) {
                console.log('🛑 処理が中断されたため、処理完了待機前に停止します');
                return false;
            }
            try {
                const result = await this.waitForProcessingComplete();
                // 中断チェック
                if (!this.state.isRunning) {
                    console.log('🛑 処理が中断されたため、処理完了後の戻り処理を停止します');
                    return false;
                }
                if (result && this.state.queuedTicketIds.length === 0) {
                    // 成功かつ残りのチケットがない場合（最後のチケット）のみチケット選択画面に戻る
                    console.log('✅ 最後のチケット処理成功、チケット選択画面に戻ります');
                    await this.returnToTicketSelection();
                }
                else if (result) {
                    // 成功だが残りのチケットがある場合は戻らない
                    console.log(`✅ 同行者追加成功、残り${this.state.queuedTicketIds.length}件のため画面戻りはスキップ`);
                }
                else {
                    console.log('❌ 同行者追加失敗、次の処理へ');
                }
                return result;
            }
            catch (error) {
                console.error('❌ 処理完了待機でタイムアウト:', error);
                return false;
            }
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
    // Gemini推奨: 統一されたReact対応入力処理
    async performInput(inputField, ticketId) {
        try {
            console.log(`🎯 チケットID入力開始: "${ticketId}"`);
            console.log('⚛️ Gemini推奨: 統一React入力処理を実行中...');
            return await this.unifiedReactInput(inputField, ticketId);
        }
        catch (error) {
            console.error('❌ チケットID入力エラー:', error);
            return false;
        }
    }
    // Gemini推奨: 統一されたReact入力処理（最も信頼性が高い）
    async unifiedReactInput(inputField, value) {
        console.log('🔄 統一React入力処理開始');
        try {
            // Step 1: Native value setter (React wrappersをバイパス)
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            if (!nativeInputValueSetter) {
                console.error('❌ ネイティブvalueセッターが見つかりません');
                return false;
            }
            // Step 2: Focus the input
            inputField.focus();
            // Step 3: Set value using native setter
            nativeInputValueSetter.call(inputField, value);
            console.log(`📝 ネイティブセッターで値設定完了: "${value}"`);
            // Step 4: Find React Fiber instance for onChange
            const reactFiberKey = Object.keys(inputField).find(key => key.startsWith('__reactFiber$') || key.startsWith('__reactInternalInstance$'));
            if (reactFiberKey) {
                const fiberInstance = inputField[reactFiberKey];
                const onChange = fiberInstance?.memoizedProps?.onChange ||
                    fiberInstance?.pendingProps?.onChange;
                if (onChange && typeof onChange === 'function') {
                    console.log('⚛️ React onChange直接呼び出し実行中...');
                    onChange({ target: inputField, currentTarget: inputField });
                }
            }
            // Step 5: Dispatch input event (React標準の変更検知)
            const inputEvent = new Event('input', { bubbles: true });
            inputField.dispatchEvent(inputEvent);
            // Step 6: Brief wait for React state update
            await new Promise(resolve => setTimeout(resolve, 100));
            // Step 7: Verify success
            const success = inputField.value === value;
            console.log(`🔄 統一React入力結果: ${success ? '✅ 成功' : '❌ 失敗'}`);
            if (!success) {
                console.warn(`⚠️ 値の不一致: 期待="${value}", 実際="${inputField.value}"`);
            }
            return success;
        }
        catch (error) {
            console.error('❌ 統一React入力処理エラー:', error);
            return false;
        }
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
            return true; // クリック成功のみを返す（処理完了は上位で待機）
        }
        catch (error) {
            console.error('❌ 追加ボタンのクリックでエラー:', error);
            return false;
        }
    }
    // Gemini推奨: 処理完了を待機（明確な成功/失敗判定）
    async waitForProcessingComplete() {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;
        return new Promise((resolve, reject) => {
            const checkComplete = () => {
                // エラーメッセージをチェック（失敗）
                const errorMessage = document.querySelector('.style_main__error_message__oE5HC');
                if (errorMessage) {
                    const errorText = errorMessage.textContent?.trim() || '不明なエラー';
                    console.log(`❌ 処理エラー検出: ${errorText}`);
                    resolve(false); // 明確な失敗
                    return;
                }
                // 成功画面をチェック（成功）
                const successArea = document.querySelector('.style_main__head__LLhtg');
                const nextButton = document.querySelector('button.basic-btn.type2:not(.style_main__register_btn__FHBxM)');
                if (successArea || nextButton) {
                    console.log('✅ 処理成功を検出');
                    resolve(true); // 明確な成功
                    return;
                }
                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    console.warn('⚠️ 処理完了の確認がタイムアウトしました');
                    reject(new Error('処理完了タイムアウト')); // タイムアウトは失敗扱い
                    return;
                }
                setTimeout(checkComplete, checkInterval);
            };
            setTimeout(checkComplete, checkInterval);
        });
    }
    // 同行者追加成功後にチケット選択画面に戻る
    async returnToTicketSelection() {
        console.log('🔄 チケット選択画面への戻り処理開始');
        try {
            // 「次へ」ボタンを探してクリック
            const nextButton = await this.waitForElement('button.basic-btn.type2:not(.style_main__register_btn__FHBxM)', 5000);
            if (nextButton) {
                console.log('🔘 「次へ」ボタンをクリック');
                nextButton.click();
                // チケット選択画面への戻りを待機
                await this.waitForTicketSelectionPage();
            }
            else {
                console.warn('⚠️ 「次へ」ボタンが見つかりません');
            }
        }
        catch (error) {
            console.error('❌ チケット選択画面への戻りでエラー:', error);
        }
    }
    // チケット選択画面への戻りを待機
    async waitForTicketSelectionPage() {
        const maxWaitTime = 10000; // 10秒
        const checkInterval = 500;
        let elapsed = 0;
        return new Promise((resolve) => {
            const checkReturn = () => {
                // URLでチケット選択画面を確認
                if (isTicketSelectionPage()) {
                    console.log('✅ チケット選択画面への戻りを確認（URL判定）');
                    resolve();
                    return;
                }
                // 追加：チケット選択画面の特徴的な要素をチェック
                const ticketSelectionElements = [
                    '.style_main__ticket_list__OD9dG',
                    '.style_main__content__2xq7k',
                    '.col3', // チケット要素
                    'input[type="checkbox"][id*="ticket_"]' // チケットチェックボックス
                ];
                const ticketSelection = ticketSelectionElements.some(selector => document.querySelector(selector) !== null);
                if (ticketSelection) {
                    console.log('✅ チケット選択画面への戻りを確認（DOM要素判定）');
                    resolve();
                    return;
                }
                elapsed += checkInterval;
                if (elapsed >= maxWaitTime) {
                    console.warn('⚠️ チケット選択画面への戻りがタイムアウト');
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
        // オーバーレイを非表示
        processing_overlay/* processingOverlay */.O.hide();
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
            // 実行中のタイマーをクリア
            if (this.currentTimeoutId !== null) {
                clearTimeout(this.currentTimeoutId);
                this.currentTimeoutId = null;
                console.log('⏰ 待機中のタイマーを中断しました');
            }
            // オーバーレイを非表示
            processing_overlay/* processingOverlay */.O.hide();
        }
    }
    // 現在の状態取得
    getState() {
        return { ...this.state };
    }
}
// グローバルプロセスマネージャーインスタンス
const companionProcessManager = new CompanionProcessManager();
// グローバルアクセス用にwindowオブジェクトに登録
// TODO: 適切なmodule export/import構造で置き換えるべき
window.companionProcessManager = companionProcessManager;
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
        button.innerHTML = `${buttonLabel} <span class="button-count">${displayText}</span>`;
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
    fabContainer.classList.add('ytomo-ticket-selection-fab-container');
    // デフォルトで表示（js-hideクラスなし）
    // インラインスタイル完全削除 - 全てSCSSで管理
    // 子ボタンコンテナ（展開される部分）
    const subButtonsContainer = document.createElement('div');
    subButtonsContainer.id = 'ytomo-companion-sub-buttons';
    // 初期状態は展開（js-hideクラスなし）
    // インラインスタイル完全削除 - 全てSCSSで管理
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
            button.innerHTML = `選択 <span class="button-count">${formatted}</span>`;
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
                button.innerHTML = `選択 <span class="button-count">${formatted}</span>`;
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
            firstButton.innerHTML = `選択 <span class="button-count">${firstFormatted}</span>`;
            subButtonsContainer.appendChild(firstButton);
            // ボタン2: 2番目の日付
            const secondDate = availableDates[1];
            const secondFormatted = formatDateForLabel(secondDate);
            const secondButton = createSubFABButton('選択', () => {
                toggleNearestDateSelection(secondDate);
            });
            secondButton.classList.add('ytomo-date-button');
            // 日付部分を強調表示で追加
            secondButton.innerHTML = `選択 <span class="button-count">${secondFormatted}</span>`;
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
                    thirdButton.innerHTML = `選択 <span class="button-count">${thirdFormatted}</span>`;
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
    // インラインスタイル完全削除 - 全てSCSSで管理
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
    // ホバー効果はSCSSで管理
    // メインボタンクリック（展開/縮小）
    mainFabButton.addEventListener('click', () => {
        isExpanded = !isExpanded;
        if (isExpanded) {
            subButtonsContainer.classList.remove('js-hide');
        }
        else {
            subButtonsContainer.classList.add('js-hide');
        }
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
    button.classList.add('ext-ytomo', 'fab-sub-btn', 'btn-enabled');
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
        // チケット選択後、submitボタンの自動押下を実行
        setTimeout(() => autoSubmitTicketSelection(), 500);
    }
    // 選択状態変更後、日付ボタンの視覚状態を更新
    setTimeout(() => updateDateButtonStates(), 100);
}
/**
 * チケット選択後のsubmitボタン自動押下
 */
function autoSubmitTicketSelection() {
    console.log('🚀 submitボタン自動押下を実行');
    try {
        // submitボタンを検索（複数の可能なセレクタで）
        const submitSelectors = [
            'a.style_ticket_selection__submit__U0a_C.basic-btn.to-send.type2:not(.disabled)',
            'a.basic-btn.to-send.type2:not(.disabled)',
            'a[class*="submit"]:not(.disabled)',
            'a.basic-btn:not(.disabled)'
        ];
        let submitButton = null;
        for (const selector of submitSelectors) {
            submitButton = document.querySelector(selector);
            if (submitButton) {
                console.log(`✅ submitボタンを発見: ${selector}`);
                break;
            }
        }
        if (!submitButton) {
            console.warn('⚠️ submitボタンが見つかりません');
            // フォールバック: disabled状態のボタンも含めて検索
            const fallbackSelectors = [
                'a.style_ticket_selection__submit__U0a_C.basic-btn.to-send.type2',
                'a.basic-btn.to-send.type2',
                'a[class*="submit"]'
            ];
            for (const selector of fallbackSelectors) {
                submitButton = document.querySelector(selector);
                if (submitButton) {
                    console.log(`⚠️ disabled状態のsubmitボタンを発見: ${selector}`);
                    break;
                }
            }
        }
        if (submitButton) {
            // ボタンがdisabled状態かチェック
            const isDisabled = submitButton.classList.contains('disabled') ||
                submitButton.getAttribute('tabindex') === '-1' ||
                submitButton.disabled;
            if (isDisabled) {
                console.log('⏳ submitボタンがdisabled状態です。有効化を待機...');
                // disabled状態の場合、短時間待機してから再試行
                setTimeout(() => {
                    autoSubmitTicketSelection();
                }, 1000);
                return;
            }
            console.log('🎯 submitボタンをクリックします');
            // 誤動作防止オーバーレイを表示
            processing_overlay/* processingOverlay */.O.show('companion');
            processing_overlay/* processingOverlay */.O.updateCountdown('申込み処理中...', true);
            // クリック実行
            if (submitButton.tagName.toLowerCase() === 'a') {
                // aタグの場合はhref処理またはclick
                if (submitButton.getAttribute('href') && submitButton.getAttribute('href') !== '#') {
                    window.location.href = submitButton.getAttribute('href');
                }
                else {
                    submitButton.click();
                }
            }
            else {
                submitButton.click();
            }
            console.log('✅ submitボタンクリック完了');
            // 処理完了後オーバーレイを非表示（少し遅延）
            setTimeout(() => {
                processing_overlay/* processingOverlay */.O.hide();
            }, 2000);
        }
        else {
            console.error('❌ submitボタンが全く見つかりません');
            showCustomAlert('申込みボタンが見つかりません');
        }
    }
    catch (error) {
        console.error('❌ submitボタン自動押下エラー:', error);
        processing_overlay/* processingOverlay */.O.hide();
        showCustomAlert('申込み処理でエラーが発生しました');
    }
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
// 同行者追加画面ではFAB不要
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
            <button id="cancel-btn" class="dialog-btn btn-cancel">
                キャンセル
            </button>
            <button id="delete-selected-btn" class="dialog-btn btn-delete">
                削除
            </button>
            <button id="execute-btn" class="dialog-btn btn-execute btn-disabled" disabled>
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
            console.log(`🚀 ${selectedIds.length}件のチケットで同行者追加処理を開始します`);
            companionProcessManager.startProcess(selectedIds);
            dialog.closest('#ytomo-companion-dialog')?.remove();
        }
        else {
            // チェックされているが全て追加済みの場合と、何も選択していない場合を区別
            const allCheckboxes = document.querySelectorAll('#ticket-list input[type="checkbox"]:checked');
            if (allCheckboxes.length > 0) {
                showCustomAlert('選択されたチケットIDは全て追加済みです');
            }
            else {
                showCustomAlert('チケットIDを選択してください');
            }
        }
    });
    // ダイアログ開始時に実行ボタンの状態を初期化
    updateExecuteButtonState();
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
    // 画面で追加済みのチケットIDを取得
    const alreadyAddedTicketIds = getAlreadyAddedTicketIds();
    const listHTML = tickets.map(ticket => {
        const isAlreadyAdded = alreadyAddedTicketIds.has(ticket.id);
        const rowClass = isAlreadyAdded ? 'ticket-row already-added' : 'ticket-row';
        return `
            <div class="${rowClass}" data-ticket-id="${ticket.id}">
                <input type="checkbox" value="${ticket.id}" ${isAlreadyAdded ? 'disabled' : ''} style="margin-right: 8px;">
                <div style="flex: 1;">
                    <div style="font-weight: bold; color: #333;">${ticket.label}</div>
                    <div style="font-size: 12px; color: #999;">ID: ${ticket.id}</div>
                    ${ticket.lastUsed ? `<div style="font-size: 11px; color: #999;">最終使用: ${new Date(ticket.lastUsed).toLocaleString()}</div>` : ''}
                </div>
                <button class="copy-ticket-btn" data-ticket-id="${ticket.id}" title="チケットIDをコピー">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z" />
                    </svg>
                </button>
            </div>
        `;
    }).join('');
    listContainer.innerHTML = listHTML;
    // イベントリスナーを設定
    setupTicketRowEvents(listContainer);
    // 実行ボタンの初期状態を設定
    updateExecuteButtonState();
}
// チケット行のイベントリスナーを設定
function setupTicketRowEvents(container) {
    const ticketRows = container.querySelectorAll('.ticket-row');
    ticketRows.forEach(row => {
        const rowElement = row;
        const checkbox = rowElement.querySelector('input[type="checkbox"]');
        const copyButton = rowElement.querySelector('.copy-ticket-btn');
        if (!checkbox)
            return;
        // チェックボックスの変更イベント
        checkbox.addEventListener('change', () => {
            updateTicketRowSelection(checkbox);
            updateExecuteButtonState();
        });
        // コピーボタンのクリックイベント
        if (copyButton) {
            copyButton.addEventListener('click', (e) => {
                e.stopPropagation(); // 行クリックイベントを防ぐ
                const ticketId = copyButton.getAttribute('data-ticket-id');
                if (ticketId) {
                    copyTicketIdToClipboard(ticketId, copyButton);
                }
            });
        }
        // 行全体のクリックでチェックボックス切り替え
        rowElement.addEventListener('click', (e) => {
            // チェックボックスやコピーボタンをクリックした場合は重複処理を避ける
            if (e.target === checkbox || e.target === copyButton || copyButton?.contains(e.target))
                return;
            // 追加済みチケットの場合は操作を無効化
            if (rowElement.classList.contains('already-added'))
                return;
            checkbox.checked = !checkbox.checked;
            updateTicketRowSelection(checkbox);
            updateExecuteButtonState();
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
// クリップボードにチケットIDをコピー
function copyTicketIdToClipboard(ticketId, copyButton) {
    try {
        // モダンブラウザのClipboard API
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(ticketId).then(() => {
                showCopySuccessAnimation(ticketId, copyButton);
            }).catch((error) => {
                console.error('クリップボードコピーエラー:', error);
                fallbackCopyToClipboard(ticketId, copyButton);
            });
        }
        else {
            // フォールバック: 古いブラウザ対応
            fallbackCopyToClipboard(ticketId, copyButton);
        }
    }
    catch (error) {
        console.error('チケットIDコピーエラー:', error);
        showCustomAlert('コピーに失敗しました');
    }
}
// フォールバック: document.execCommand使用
function fallbackCopyToClipboard(ticketId, copyButton) {
    try {
        const textArea = document.createElement('textarea');
        textArea.value = ticketId;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textArea);
        if (successful) {
            showCopySuccessAnimation(ticketId, copyButton);
        }
        else {
            showCustomAlert('コピーに失敗しました');
        }
    }
    catch (error) {
        console.error('フォールバックコピーエラー:', error);
        showCustomAlert('コピーに失敗しました');
    }
}
// コピー成功アニメーション表示
function showCopySuccessAnimation(ticketId, copyButton) {
    console.log(`✅ チケットID "${ticketId}" をクリップボードにコピーしました`);
    // ボタンを成功状態に変更
    copyButton.classList.add('copy-success');
    // アイコンをチェックマークに変更
    const svgElement = copyButton.querySelector('svg');
    if (svgElement) {
        // 元のアイコンを保存
        const originalSvg = svgElement.cloneNode(true);
        // チェックマークアイコンに変更
        svgElement.innerHTML = '<path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />';
        // 1.5秒後に元に戻す
        setTimeout(() => {
            copyButton.classList.remove('copy-success');
            if (originalSvg && svgElement.parentNode) {
                svgElement.parentNode.replaceChild(originalSvg, svgElement);
            }
        }, 1500);
    }
}
// 実行ボタンの状態を更新
function updateExecuteButtonState() {
    const executeButton = document.querySelector('#execute-btn');
    if (!executeButton)
        return;
    const selectedTicketIds = getSelectedTicketIds();
    const hasValidSelection = selectedTicketIds.length > 0;
    if (hasValidSelection) {
        executeButton.disabled = false;
        executeButton.classList.remove('btn-disabled');
        executeButton.classList.add('btn-enabled');
    }
    else {
        executeButton.disabled = true;
        executeButton.classList.remove('btn-enabled');
        executeButton.classList.add('btn-disabled');
    }
}
// グローバルスコープでアクセス可能にする
// TODO: 適切なmodule構造で置き換えるべき
window.updateTicketRowSelection = updateTicketRowSelection;
// 選択されたチケットID取得
function getSelectedTicketIds() {
    const checkboxes = document.querySelectorAll('#ticket-list input[type="checkbox"]:checked');
    const selectedIds = Array.from(checkboxes).map(cb => cb.value);
    // 既に画面に表示されているチケットIDを除外
    const alreadyAddedTicketIds = getAlreadyAddedTicketIds();
    const filteredIds = selectedIds.filter(id => !alreadyAddedTicketIds.has(id));
    if (selectedIds.length !== filteredIds.length) {
        const excludedCount = selectedIds.length - filteredIds.length;
        console.log(`⚠️ 既に選択済みのチケット ${excludedCount}件を処理対象から除外しました`);
    }
    return filteredIds;
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

// EXTERNAL MODULE: ./ts/modules/page-utils.ts
var page_utils = __webpack_require__(214);
;// ./ts/modules/ticket-manager.ts
/**
 * チケット統合管理システム
 * 自分のチケット・他人のチケットID・入場予約・予約状況を統合管理
 */
/**
 * チケット統合管理システム
 */
class TicketManager {
    constructor(cacheManager) {
        this.tickets = new Map();
        this.selectedTicketIds = new Set();
        this.cacheManager = null;
        this.cacheManager = cacheManager || null;
    }
    /**
     * 全チケット情報を初期化・取得
     */
    async loadAllTickets() {
        console.log('🎫 チケット統合管理: 全チケット情報取得開始');
        try {
            // 並列実行で効率化
            const [ownTickets, cachedTickets] = await Promise.all([
                this.loadOwnTickets(),
                this.loadCachedExternalTickets()
            ]);
            // 自分のチケットを追加
            for (const ticket of ownTickets) {
                this.tickets.set(ticket.ticket_id, ticket);
            }
            // キャッシュされた外部チケットを追加
            for (const ticket of cachedTickets) {
                this.tickets.set(ticket.ticket_id, ticket);
            }
            console.log(`✅ チケット統合管理: ${this.tickets.size}個のチケットを読み込み完了`);
            return Array.from(this.tickets.values());
        }
        catch (error) {
            console.error('❌ チケット情報取得エラー:', error);
            return [];
        }
    }
    /**
     * 自分のチケット情報を取得
     */
    async loadOwnTickets() {
        console.log('🔍 自分のチケット情報取得中...');
        try {
            // デバッグダイアログ調査結果に基づくAPI実装
            const response = await fetch('/api/d/my/tickets/?count=1', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja'
                },
                credentials: 'same-origin'
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('🔍 自分のチケットAPI応答:', data);
            const tickets = [];
            // 調査結果: data.list配列にチケット情報が格納される
            if (data.list && Array.isArray(data.list)) {
                for (const ticket of data.list) {
                    const ticketData = {
                        ticket_id: ticket.ticket_id || ticket.simple_ticket_id || '',
                        label: ticket.item_name || 'チケット',
                        isOwn: true,
                        entranceDates: this.extractEntranceDates(ticket),
                        reservationTypes: this.extractReservationTypes(ticket),
                        entranceReservations: this.extractEntranceReservations(ticket),
                        reservationStatus: this.extractReservationStatus(ticket),
                        schedules: ticket.schedules || []
                    };
                    tickets.push(ticketData);
                    this.tickets.set(ticketData.ticket_id, ticketData);
                }
            }
            console.log(`✅ 自分のチケット: ${tickets.length}個取得`);
            return tickets;
        }
        catch (error) {
            console.error('❌ 自分のチケット取得エラー:', error);
            return [];
        }
    }
    /**
     * キャッシュされた外部チケットを取得
     */
    async loadCachedExternalTickets() {
        console.log('🔍 キャッシュされた外部チケット取得中...');
        const tickets = [];
        try {
            // 各キャッシュシステムから外部チケットIDを取得
            const externalTicketIds = await this.getCachedExternalTicketIds();
            console.log(`🔍 キャッシュから${externalTicketIds.length}個の外部チケットIDを発見`);
            // 各外部チケットの詳細情報を取得
            for (const { ticketId, label } of externalTicketIds) {
                try {
                    const ticketData = await this.loadExternalTicketData(ticketId, label);
                    if (ticketData) {
                        tickets.push(ticketData);
                    }
                }
                catch (error) {
                    console.warn(`⚠️ 外部チケット${ticketId}の取得に失敗:`, error);
                }
            }
            console.log(`✅ 外部チケット: ${tickets.length}個取得`);
            return tickets;
        }
        catch (error) {
            console.error('❌ 外部チケット取得エラー:', error);
            return [];
        }
    }
    /**
     * キャッシュから外部チケットIDを収集
     */
    async getCachedExternalTicketIds() {
        const externalTickets = [];
        try {
            // 監視キャッシュから取得
            const monitoringCache = localStorage.getItem('expo_monitoring_cache');
            if (monitoringCache) {
                const data = JSON.parse(monitoringCache);
                if (data.externalTickets) {
                    for (const [ticketId, info] of Object.entries(data.externalTickets)) {
                        externalTickets.push({
                            ticketId,
                            label: info.label || '外部チケット'
                        });
                    }
                }
            }
            // パビリオン予約キャッシュから取得
            const pavilionCache = localStorage.getItem('expo_pavilion_reservation_cache');
            if (pavilionCache) {
                const data = JSON.parse(pavilionCache);
                if (data.externalTickets) {
                    for (const [ticketId, info] of Object.entries(data.externalTickets)) {
                        // 重複チェック
                        if (!externalTickets.find(t => t.ticketId === ticketId)) {
                            externalTickets.push({
                                ticketId,
                                label: info.label || '外部チケット'
                            });
                        }
                    }
                }
            }
            // その他のキャッシュソースがあれば追加
        }
        catch (error) {
            console.error('❌ キャッシュからの外部チケットID取得エラー:', error);
        }
        return externalTickets;
    }
    /**
     * 外部チケットの詳細データを取得
     */
    async loadExternalTicketData(ticketId, label) {
        try {
            // 外部チケットの場合、入場予約情報のみ取得可能
            // チケット詳細は取得できないため、最小限の情報で構成
            const ticketData = {
                ticket_id: ticketId,
                label: label,
                isOwn: false,
                entranceDates: [], // 外部チケットの日付は不明
                reservationTypes: [], // 外部チケットの種別は不明
                entranceReservations: [],
                schedules: []
            };
            // 入場予約があるかチェック（可能であれば）
            try {
                const entranceReservations = await this.getEntranceReservationsForTicket(ticketId);
                ticketData.entranceReservations = entranceReservations;
            }
            catch (error) {
                console.warn(`⚠️ チケット${ticketId}の入場予約取得失敗:`, error);
            }
            return ticketData;
        }
        catch (error) {
            console.error(`❌ 外部チケット${ticketId}データ取得エラー:`, error);
            return null;
        }
    }
    /**
     * 指定チケットの入場予約を取得
     */
    async getEntranceReservationsForTicket(_ticketId) {
        // この機能は既存のAPI機能から実装する必要がある
        // 現在は空配列を返す（今後実装）
        return [];
    }
    /**
     * チケットから入場可能日付を抽出（調査結果に基づく）
     */
    extractEntranceDates(ticket) {
        const dates = [];
        try {
            // 調査結果: ticket.schedules配列から入場日付を取得
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                for (const schedule of ticket.schedules) {
                    if (schedule.entrance_date) {
                        // YYYYMMDD形式の日付
                        dates.push(schedule.entrance_date);
                    }
                }
            }
        }
        catch (error) {
            console.warn('⚠️ 入場日付抽出エラー:', error);
        }
        return dates;
    }
    /**
     * チケットから予約種類を抽出
     */
    extractReservationTypes(ticket) {
        const types = [];
        try {
            // チケット種別情報から予約種類を判定
            if (ticket.ticket_type) {
                // 実装は既存のビジネスロジックに基づく
                const type = this.determineReservationType(ticket.ticket_type);
                if (type) {
                    types.push(type);
                }
            }
        }
        catch (error) {
            console.warn('⚠️ 予約種類抽出エラー:', error);
        }
        return types;
    }
    /**
     * チケットから入場予約情報を抽出（調査結果に基づく）
     */
    extractEntranceReservations(ticket) {
        const reservations = [];
        try {
            // 調査結果: ticket.schedules配列から入場予約情報を取得
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                for (const schedule of ticket.schedules) {
                    const reservationData = {
                        date: schedule.entrance_date || '',
                        time: schedule.schedule_name || '', // 時間帯名
                        location: 'east', // デフォルト値（実際の位置情報は不明）
                        status: schedule.use_state === 0 ? 'confirmed' :
                            schedule.use_state === 1 ? 'cancelled' : 'pending'
                    };
                    reservations.push(reservationData);
                }
            }
        }
        catch (error) {
            console.warn('⚠️ 入場予約抽出エラー:', error);
        }
        return reservations;
    }
    /**
     * チケット種別から予約種類を判定
     */
    determineReservationType(ticketType) {
        // スマホでの表示問題修正：チケットが存在する場合は常にアクティブとして扱う
        console.log('🔍 チケット種別判定:', ticketType);
        if (!ticketType) {
            // チケット種別が不明でも、チケットが存在する限りアクティブとして扱う
            console.log('⚠️ チケット種別不明、デフォルト1日券として処理');
            return {
                type: '1日券',
                isActive: true
            };
        }
        // チケット種別に応じて判定（今後拡張可能）
        return {
            type: '1日券',
            isActive: true
        };
    }
    /**
     * チケットから予約状況を抽出（調査結果に基づく）
     */
    extractReservationStatus(ticket) {
        const statuses = [];
        try {
            // 調査結果: ticket.event_schedules配列からパビリオン予約状況を取得
            if (ticket.event_schedules && Array.isArray(ticket.event_schedules)) {
                for (const event of ticket.event_schedules) {
                    const status = {
                        pavilionId: event.event_code || '',
                        pavilionName: event.event_name || '',
                        date: event.entrance_date || '',
                        time: `${event.start_time}-${event.end_time}`,
                        status: event.use_state === 0 ? 'confirmed' :
                            event.use_state === 1 ? 'cancelled' : 'pending',
                        reservationType: event.registered_channel || '1日券'
                    };
                    statuses.push(status);
                }
            }
        }
        catch (error) {
            console.warn('⚠️ 予約状況抽出エラー:', error);
        }
        return statuses;
    }
    /**
     * 外部チケットIDを追加
     */
    async addExternalTicket(ticketId, label) {
        console.log(`🎫 外部チケット追加: ${ticketId} (${label})`);
        try {
            // 重複チェック
            if (this.tickets.has(ticketId)) {
                throw new Error('このチケットIDは既に登録されています');
            }
            // チケットIDの妥当性を検証
            await this.validateTicketId(ticketId);
            // チケットデータを作成
            const ticketData = await this.loadExternalTicketData(ticketId, label);
            if (!ticketData) {
                throw new Error('チケットデータの取得に失敗しました');
            }
            // メモリとキャッシュに保存
            this.tickets.set(ticketId, ticketData);
            await this.saveExternalTicketToCache(ticketId, label);
            console.log(`✅ 外部チケット追加完了: ${ticketId}`);
        }
        catch (error) {
            console.error('❌ 外部チケット追加エラー:', error);
            throw error;
        }
    }
    /**
     * チケットIDの妥当性を検証
     */
    async validateTicketId(ticketId) {
        // チケットIDの形式チェック
        if (!ticketId || ticketId.trim().length === 0) {
            throw new Error('チケットIDが空です');
        }
        // 必要に応じてAPIでチケットIDの存在確認
        // 現在は基本的な形式チェックのみ
    }
    /**
     * 外部チケットをキャッシュに保存
     */
    async saveExternalTicketToCache(ticketId, label) {
        try {
            // 監視キャッシュに保存
            const monitoringCache = localStorage.getItem('expo_monitoring_cache') || '{}';
            const monitoringData = JSON.parse(monitoringCache);
            if (!monitoringData.externalTickets) {
                monitoringData.externalTickets = {};
            }
            monitoringData.externalTickets[ticketId] = {
                label: label,
                addedAt: new Date().toISOString()
            };
            localStorage.setItem('expo_monitoring_cache', JSON.stringify(monitoringData));
            console.log(`💾 外部チケットをキャッシュに保存: ${ticketId}`);
        }
        catch (error) {
            console.error('❌ 外部チケットキャッシュ保存エラー:', error);
        }
    }
    /**
     * 日付別チケット選択
     */
    selectTicketsByDate(date, ownOnly = false) {
        console.log(`🗓️ 日付別チケット選択: ${date} (自分のみ: ${ownOnly})`);
        this.selectedTicketIds.clear();
        for (const [ticketId, ticket] of this.tickets) {
            // 自分のチケットのみの場合
            if (ownOnly && !ticket.isOwn) {
                continue;
            }
            // 指定日付の入場可能チケットを選択
            if (ticket.entranceDates.includes(date)) {
                this.selectedTicketIds.add(ticketId);
            }
        }
        console.log(`✅ ${this.selectedTicketIds.size}個のチケットを選択`);
    }
    /**
     * 選択済みチケットID一覧を取得（デバッグ用）
     */
    getSelectedTicketIds() {
        return this.selectedTicketIds;
    }
    /**
     * 選択済みチケット一覧を取得
     */
    getSelectedTickets() {
        const selectedTickets = [];
        for (const ticketId of this.selectedTicketIds) {
            const ticket = this.tickets.get(ticketId);
            if (ticket) {
                selectedTickets.push(ticket);
            }
        }
        return selectedTickets;
    }
    /**
     * 選択済みチケット数を取得
     */
    getSelectedTicketCount() {
        return this.selectedTicketIds.size;
    }
    /**
     * 選択されたチケットの入場予約から最も遅い入場時間を取得（律速時間）
     */
    getLatestEntranceTime(targetDate) {
        const selectedTickets = this.getSelectedTickets();
        let latestTime = null;
        for (const ticket of selectedTickets) {
            const entranceReservations = ticket.entranceReservations || [];
            for (const reservation of entranceReservations) {
                // 対象日付の入場予約のみを対象
                if (reservation.date === targetDate && reservation.status === 'confirmed') {
                    // 時間の比較（HH:MM形式）
                    if (!latestTime || reservation.time > latestTime) {
                        latestTime = reservation.time;
                    }
                }
            }
        }
        return latestTime;
    }
    /**
     * 全チケット一覧を取得
     */
    getAllTickets() {
        return Array.from(this.tickets.values());
    }
    /**
     * 利用可能な日付一覧を取得
     */
    getAvailableDates() {
        const dates = new Set();
        for (const ticket of this.tickets.values()) {
            // 予約種類が有効な場合のみ日付を追加
            if (ticket.reservationTypes.some(type => type.isActive)) {
                for (const date of ticket.entranceDates) {
                    dates.add(date);
                }
            }
        }
        return Array.from(dates).sort();
    }
    /**
     * 統合キャッシュデータを同期
     */
    syncCacheData() {
        console.log('🔄 チケット統合管理: キャッシュデータ同期');
        try {
            // CacheManagerとの同期処理
            if (this.cacheManager) {
                // 必要に応じて既存キャッシュシステムとの同期
                console.log('✅ キャッシュマネージャーとの同期完了');
            }
        }
        catch (error) {
            console.error('❌ キャッシュ同期エラー:', error);
        }
    }
    /**
     * チケット選択状態をクリア
     */
    clearSelection() {
        this.selectedTicketIds.clear();
        console.log('🧹 チケット選択状態をクリア');
    }
    /**
     * 特定チケットの選択状態を切り替え
     */
    toggleTicketSelection(ticketId) {
        if (this.selectedTicketIds.has(ticketId)) {
            this.selectedTicketIds.delete(ticketId);
            return false;
        }
        else {
            this.selectedTicketIds.add(ticketId);
            return true;
        }
    }
}
/**
 * グローバルチケットマネージャーインスタンス
 */
let globalTicketManager = null;
/**
 * チケットマネージャーを初期化・取得
 */
function getTicketManager(cacheManager) {
    if (!globalTicketManager) {
        globalTicketManager = new TicketManager(cacheManager);
    }
    return globalTicketManager;
}

;// ./ts/modules/reactive-system.ts
/**
 * リアクティブ状態管理システム
 * Vue Composition API風のProxyベースアプローチで自動UI更新を実現
 */
/**
 * リアクティブプロパティの変更を監視するクラス
 */
class ReactiveSystem {
    constructor(target, options = {}) {
        this.options = options;
        this.watchers = new Map();
        this.batchedUpdates = new Set();
        this.batchTimeout = null;
        this.target = this.createReactiveProxy(target);
    }
    /**
     * オブジェクトをリアクティブなProxyでラップ
     */
    createReactiveProxy(obj) {
        return new Proxy(obj, {
            set: (target, property, value, receiver) => {
                const oldValue = Reflect.get(target, property);
                const result = Reflect.set(target, property, value, receiver);
                // 値が実際に変更された場合のみ通知
                if (oldValue !== value) {
                    this.notifyWatchers(property, value, oldValue);
                }
                return result;
            },
            get: (target, property, receiver) => {
                const value = Reflect.get(target, property, receiver);
                // SetやMapオブジェクトの場合、メソッドをラップ
                if (value instanceof Set) {
                    return this.wrapSet(value, property);
                }
                else if (value instanceof Map) {
                    return this.wrapMap(value, property);
                }
                return value;
            }
        });
    }
    /**
     * Setオブジェクトのメソッドをラップしてリアクティブ化
     */
    wrapSet(set, propertyName) {
        const self = this;
        return new Proxy(set, {
            get(target, prop) {
                const value = target[prop];
                if (typeof value === 'function') {
                    // Set変更メソッドのみをラップ
                    if (prop === 'add' || prop === 'delete' || prop === 'clear') {
                        return function (...args) {
                            const oldSet = new Set(target); // 変更前の状態をコピー
                            const result = value.apply(target, args);
                            console.log(`🔄 Set ${prop} detected: ${propertyName}, size: ${oldSet.size} → ${target.size}`);
                            self.notifyWatchers(propertyName, target, oldSet);
                            return result;
                        };
                    }
                    // その他のメソッドは元のcontextで実行
                    return value.bind(target);
                }
                return value;
            }
        });
    }
    /**
     * Mapオブジェクトのメソッドをラップしてリアクティブ化
     */
    wrapMap(map, propertyName) {
        const self = this;
        return new Proxy(map, {
            get(target, prop) {
                const value = target[prop];
                if (typeof value === 'function') {
                    // Map変更メソッドのみをラップ
                    if (prop === 'set' || prop === 'delete' || prop === 'clear') {
                        return function (...args) {
                            const oldMap = new Map(target); // 変更前の状態をコピー
                            const result = value.apply(target, args);
                            console.log(`🔄 Map ${prop} detected: ${propertyName}, size: ${oldMap.size} → ${target.size}`);
                            self.notifyWatchers(propertyName, target, oldMap);
                            return result;
                        };
                    }
                    // その他のメソッド（values, keys, entries等）は元のcontextで実行
                    return value.bind(target);
                }
                return value;
            }
        });
    }
    /**
     * 特定プロパティの変更を監視
     */
    watch(property, callback) {
        const properties = Array.isArray(property) ? property : [property];
        properties.forEach(prop => {
            if (!this.watchers.has(prop)) {
                this.watchers.set(prop, []);
            }
            this.watchers.get(prop).push(callback);
        });
        // アンサブスクライブ関数を返す
        return () => {
            properties.forEach(prop => {
                const callbacks = this.watchers.get(prop);
                if (callbacks) {
                    const index = callbacks.indexOf(callback);
                    if (index > -1) {
                        callbacks.splice(index, 1);
                    }
                }
            });
        };
    }
    /**
     * 全プロパティの変更を監視
     */
    watchAll(callback) {
        return this.watch('*', callback);
    }
    /**
     * プロパティ変更時の通知
     */
    notifyWatchers(property, newValue, oldValue) {
        const callbacks = new Set();
        // 特定プロパティのウォッチャー
        const propertyCallbacks = this.watchers.get(property);
        if (propertyCallbacks) {
            propertyCallbacks.forEach(cb => callbacks.add(cb));
        }
        // 全体ウォッチャー
        const allCallbacks = this.watchers.get('*');
        if (allCallbacks) {
            allCallbacks.forEach(cb => callbacks.add(cb));
        }
        if (this.options.batch) {
            // バッチ更新
            callbacks.forEach(cb => this.batchedUpdates.add(cb));
            this.scheduleBatchUpdate();
        }
        else {
            // 即座に更新
            callbacks.forEach(cb => {
                try {
                    cb();
                }
                catch (error) {
                    console.error('ReactiveSystem watcher error:', error);
                }
            });
        }
        console.log(`🔄 Reactive: ${property} changed from`, oldValue, 'to', newValue);
    }
    /**
     * バッチ更新のスケジューリング
     */
    scheduleBatchUpdate() {
        if (this.batchTimeout) {
            return;
        }
        this.batchTimeout = window.setTimeout(() => {
            this.executeBatchUpdate();
            this.batchTimeout = null;
        }, 0);
    }
    /**
     * バッチ更新の実行
     */
    executeBatchUpdate() {
        const updates = Array.from(this.batchedUpdates);
        this.batchedUpdates.clear();
        updates.forEach(callback => {
            try {
                callback();
            }
            catch (error) {
                console.error('ReactiveSystem batch update error:', error);
            }
        });
        console.log(`🔄 Reactive: Executed ${updates.length} batched updates`);
    }
    /**
     * リアクティブオブジェクトを取得
     */
    getReactive() {
        return this.target;
    }
    /**
     * すべてのウォッチャーを削除
     */
    destroy() {
        this.watchers.clear();
        this.batchedUpdates.clear();
        if (this.batchTimeout) {
            clearTimeout(this.batchTimeout);
            this.batchTimeout = null;
        }
    }
}
/**
 * computed値を作成するヘルパー
 */
function computed(getter) {
    let cachedValue;
    let dirty = true;
    return () => {
        if (dirty) {
            cachedValue = getter();
            dirty = false;
        }
        return cachedValue;
    };
}
/**
 * リアクティブオブジェクトを作成するヘルパー関数
 */
function reactive(target, options) {
    return new ReactiveSystem(target, options);
}

;// ./ts/modules/reactive-ticket-manager.ts
/**
 * リアクティブチケット管理システム
 * TicketManagerをラップしてVue風の自動UI更新を提供
 */

class ReactiveTicketManager {
    constructor(ticketManager) {
        this.uiUpdaters = new Map();
        this.ticketManager = ticketManager;
        this.reactiveSystem = new ReactiveSystem(ticketManager, {
            batch: true // バッチ更新でパフォーマンス向上
        });
        this.setupUIUpdaters();
    }
    /**
     * UI更新関数を設定
     */
    setupUIUpdaters() {
        // チケット選択関連のUI更新をまとめて実行
        this.reactiveSystem.watch('selectedTicketIds', () => {
            console.log('🔄 ReactiveTicketManager: selectedTicketIds changed');
            this.executeUIUpdates('ticketSelection');
        });
        // チケット一覧関連のUI更新
        this.reactiveSystem.watch('tickets', () => {
            console.log('🔄 ReactiveTicketManager: tickets changed');
            this.executeUIUpdates('ticketList');
        });
    }
    /**
     * UI更新関数を登録
     */
    registerUIUpdater(key, updater) {
        this.uiUpdaters.set(key, updater);
        console.log(`✅ ReactiveTicketManager: UI updater registered for ${key}`);
    }
    /**
     * 複数のUI更新関数をまとめて登録
     */
    registerUIUpdaters(updaters) {
        Object.entries(updaters).forEach(([key, updater]) => {
            this.registerUIUpdater(key, updater);
        });
    }
    /**
     * UI更新を実行
     */
    executeUIUpdates(category) {
        const updater = this.uiUpdaters.get(category);
        if (updater) {
            try {
                updater();
                console.log(`✅ ReactiveTicketManager: UI updated for ${category}`);
            }
            catch (error) {
                console.error(`❌ ReactiveTicketManager: UI update error for ${category}:`, error);
            }
        }
    }
    /**
     * リアクティブなTicketManagerを取得
     */
    getReactiveManager() {
        return this.reactiveSystem.getReactive();
    }
    /**
     * 元のTicketManagerを取得（非リアクティブ）
     */
    getOriginalManager() {
        return this.ticketManager;
    }
    // TicketManagerの主要メソッドをプロキシ
    async loadAllTickets() {
        return this.getReactiveManager().loadAllTickets();
    }
    async addExternalTicket(ticketId, label) {
        return this.getReactiveManager().addExternalTicket(ticketId, label);
    }
    selectTicketsByDate(date, ownOnly) {
        this.getReactiveManager().selectTicketsByDate(date, ownOnly);
    }
    getSelectedTicketIds() {
        return this.getReactiveManager().getSelectedTicketIds();
    }
    getSelectedTickets() {
        return this.getReactiveManager().getSelectedTickets();
    }
    getSelectedTicketCount() {
        return this.getReactiveManager().getSelectedTicketCount();
    }
    getAllTickets() {
        return this.getReactiveManager().getAllTickets();
    }
    getAvailableDates() {
        return this.getReactiveManager().getAvailableDates();
    }
    clearSelection() {
        this.getReactiveManager().clearSelection();
    }
    toggleTicketSelection(ticketId) {
        return this.getReactiveManager().toggleTicketSelection(ticketId);
    }
    syncCacheData() {
        this.getReactiveManager().syncCacheData();
    }
    /**
     * リアクティブシステムを破棄
     */
    destroy() {
        this.reactiveSystem.destroy();
        this.uiUpdaters.clear();
        console.log('🧹 ReactiveTicketManager destroyed');
    }
}
/**
 * グローバルリアクティブチケットマネージャーインスタンス
 */
let globalReactiveTicketManager = null;
/**
 * リアクティブチケットマネージャーを初期化・取得
 */
function getReactiveTicketManager(ticketManager) {
    if (!globalReactiveTicketManager) {
        if (!ticketManager) {
            throw new Error('ReactiveTicketManager requires initial TicketManager instance');
        }
        globalReactiveTicketManager = new ReactiveTicketManager(ticketManager);
        console.log('🔄 ReactiveTicketManager initialized');
    }
    return globalReactiveTicketManager;
}

;// ./ts/modules/pavilion-manager.ts
/**
 * パビリオン統合管理システム
 * パビリオン検索・お気に入り・フィルター・予約実行を統合管理
 */
/**
 * パビリオン統合管理システム
 */
class PavilionManager {
    constructor() {
        this.pavilions = new Map();
        this.selectedTimeSlots = new Map();
        this.searchFilter = {
            query: '',
            showAvailableOnly: false
        };
        this.favoriteIds = new Set();
        this.loadFavoritesFromCache();
    }
    /**
     * 公式API仕様に従ってAPIのURLを構築
     */
    buildAPIUrl(query, ticketIds, entranceDate) {
        // デフォルト値の設定
        const defaultEntranceDate = entranceDate || new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString().slice(0, 10).replace(/-/g, ''); // 明日の日付
        const defaultChannel = '4'; // fastタイプ
        // URLパラメータを構築
        const ticketIdsParam = ticketIds.length > 0 ?
            ticketIds.map(id => `ticket_ids[]=${id}`).join('&') : '';
        const eventNameParam = query ? `&event_name=${encodeURIComponent(query)}` : '';
        const entranceDateParam = `&entrance_date=${defaultEntranceDate}`;
        const paginationParam = `&count=1&limit=999&event_type=0&next_token=`;
        const channelParam = `&channel=${defaultChannel}`;
        return `/api/d/events?${ticketIdsParam}${eventNameParam}${entranceDateParam}${paginationParam}${channelParam}`;
    }
    /**
     * 検索結果をパース（ref/index.jsから復元）
     */
    parseSearchResults(data) {
        const pavilions = [];
        try {
            if (data.list && Array.isArray(data.list)) {
                for (const item of data.list) {
                    const pavilion = this.parseEventItem(item);
                    if (pavilion) {
                        pavilions.push(pavilion);
                    }
                }
            }
        }
        catch (error) {
            console.error('❌ 検索結果パースエラー:', error);
        }
        return pavilions;
    }
    /**
     * イベント項目をパビリオンデータに変換（ref/index.jsから復元）
     */
    parseEventItem(item) {
        try {
            const pavilionId = item.event_code || item.id;
            if (!pavilionId)
                return null;
            const pavilion = {
                id: pavilionId,
                name: item.event_name || item.name || 'Unknown',
                description: item.description || '',
                isFavorite: this.favoriteIds.has(pavilionId),
                timeSlots: this.parseTimeSlots(item.time_slots || []),
                reservationStatus: this.determineReservationStatus(item),
                location: item.location || '',
                category: item.category || '',
                imageUrl: item.image_url || '',
                tags: item.tags || [],
                dateStatus: item.date_status // パビリオン単位の満員判定用
            };
            return pavilion;
        }
        catch (error) {
            console.error('❌ イベント項目パースエラー:', error);
            return null;
        }
    }
    /**
     * 時間帯データをパース（ref/index.jsから復元）
     */
    parseTimeSlots(timeSlots) {
        return timeSlots.map(slot => {
            try {
                return {
                    time: slot.start_time || slot.time || '',
                    endTime: slot.end_time || '',
                    available: slot.available !== false && slot.status !== 'full',
                    selected: false,
                    capacity: slot.capacity || 0,
                    reserved: slot.reserved || 0,
                    reservationType: slot.reservation_type || '1日券',
                    timeSlotId: slot.id || slot.time_slot_id || ''
                };
            }
            catch (error) {
                console.warn('⚠️ 時間帯パースエラー:', error);
                return {
                    time: '',
                    endTime: '',
                    available: false,
                    selected: false,
                    reservationType: '1日券'
                };
            }
        }).filter(slot => slot.time); // 有効な時間帯のみ
    }
    /**
     * 予約状況を判定（ref/index.jsから復元）
     */
    determineReservationStatus(item) {
        if (item.reservation_status) {
            return item.reservation_status;
        }
        // 時間帯の状況から判定
        const timeSlots = item.time_slots || [];
        const availableSlots = timeSlots.filter((slot) => slot.available !== false);
        if (availableSlots.length === 0) {
            return 'full';
        }
        else if (availableSlots.length < timeSlots.length / 2) {
            return 'limited';
        }
        else {
            return 'available';
        }
    }
    /**
     * パビリオン検索・取得
     */
    async searchPavilions(query = '', ticketIds = [], entranceDate) {
        console.log(`🏛️ パビリオン検索: "${query}" (チケット: ${ticketIds.length}個)`);
        console.log(`🔍 検索チケットIDs:`, ticketIds);
        try {
            // 公式API仕様に従ってURLパラメータを構築
            const apiUrl = this.buildAPIUrl(query, ticketIds, entranceDate);
            console.log(`🔍 APIエンドポイント:`, apiUrl);
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log('🔍 パビリオン検索API応答:', data);
            const pavilions = this.parseSearchResults(data);
            // メモリに保存
            for (const pavilion of pavilions) {
                this.pavilions.set(pavilion.id, pavilion);
            }
            console.log(`✅ パビリオン検索完了: ${pavilions.length}個取得`);
            return pavilions;
        }
        catch (error) {
            console.error('❌ パビリオン検索エラー:', error);
            throw error;
        }
    }
    /**
     * お気に入りパビリオンを読み込み
     */
    async loadFavoritePavilions() {
        console.log('⭐ お気に入りパビリオン読み込み');
        const favoriteIds = Array.from(this.favoriteIds);
        if (favoriteIds.length === 0) {
            console.log('⭐ お気に入りパビリオンはありません');
            return [];
        }
        try {
            // お気に入りIDでパビリオン詳細を取得
            const pavilions = [];
            for (const pavilionId of favoriteIds) {
                try {
                    const pavilion = await this.loadPavilionDetail(pavilionId);
                    if (pavilion) {
                        pavilion.isFavorite = true;
                        pavilions.push(pavilion);
                        this.pavilions.set(pavilionId, pavilion);
                    }
                }
                catch (error) {
                    console.warn(`⚠️ お気に入りパビリオン${pavilionId}の取得に失敗:`, error);
                }
            }
            console.log(`✅ お気に入りパビリオン: ${pavilions.length}個読み込み完了`);
            return pavilions;
        }
        catch (error) {
            console.error('❌ お気に入りパビリオン読み込みエラー:', error);
            return [];
        }
    }
    /**
     * パビリオン詳細情報を取得
     */
    async loadPavilionDetail(pavilionId) {
        try {
            const response = await fetch(`/api/d/events/${pavilionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Api-Lang': 'ja',
                    'Accept-Language': 'ja'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`パビリオン詳細APIエラー: ${response.status}`);
            }
            const data = await response.json();
            return this.parseEventItem(data);
        }
        catch (error) {
            console.error(`❌ パビリオン詳細取得エラー (${pavilionId}):`, error);
            return null;
        }
    }
    /**
     * データを再取得
     */
    async refreshPavilionData() {
        console.log('🔄 パビリオンデータ再取得');
        // 最後の検索条件で再検索
        return await this.searchPavilions(this.searchFilter.query, [], // チケットIDは外部から指定
        undefined // 入場日も外部から指定
        );
    }
    /**
     * 空き時間帯のみフィルター
     */
    filterAvailableOnly(pavilions) {
        return pavilions.map(pavilion => {
            const availableTimeSlots = pavilion.timeSlots.filter(slot => slot.available);
            if (availableTimeSlots.length === 0) {
                // 空き時間帯がない場合は除外
                return null;
            }
            return {
                ...pavilion,
                timeSlots: availableTimeSlots
            };
        }).filter(pavilion => pavilion !== null);
    }
    /**
     * お気に入りに追加
     */
    addToFavorites(pavilionId, name) {
        console.log(`⭐ お気に入り追加: ${name} (${pavilionId})`);
        this.favoriteIds.add(pavilionId);
        // パビリオンデータが存在する場合は更新
        const pavilion = this.pavilions.get(pavilionId);
        if (pavilion) {
            pavilion.isFavorite = true;
        }
        // キャッシュに保存
        this.saveFavoritesToCache();
    }
    /**
     * お気に入りから削除
     */
    removeFromFavorites(pavilionId) {
        console.log(`⭐ お気に入り削除: ${pavilionId}`);
        this.favoriteIds.delete(pavilionId);
        // パビリオンデータが存在する場合は更新
        const pavilion = this.pavilions.get(pavilionId);
        if (pavilion) {
            pavilion.isFavorite = false;
        }
        // キャッシュに保存
        this.saveFavoritesToCache();
    }
    /**
     * 時間帯選択
     */
    selectTimeSlot(pavilionId, timeSlot) {
        console.log(`🕐 時間帯選択: ${pavilionId} - ${timeSlot.time}`);
        const key = `${pavilionId}:${timeSlot.time}`;
        // 既に選択済みの場合は選択解除
        if (this.selectedTimeSlots.has(key)) {
            this.selectedTimeSlots.delete(key);
            timeSlot.selected = false;
            console.log(`🕐 時間帯選択解除: ${pavilionId} - ${timeSlot.time}`);
        }
        else {
            // 新規選択
            this.selectedTimeSlots.set(key, { ...timeSlot, selected: true });
            timeSlot.selected = true;
        }
    }
    /**
     * 選択済み時間帯を取得
     */
    getSelectedTimeSlots() {
        const selected = [];
        for (const [key, timeSlot] of this.selectedTimeSlots) {
            const [pavilionId] = key.split(':');
            selected.push({ pavilionId, timeSlot });
        }
        return selected;
    }
    /**
     * パビリオン予約実行
     */
    async makeReservation(pavilionId, timeSlot, selectedTickets, entranceDate, registeredChannel) {
        console.log(`🎯 予約実行開始: ${pavilionId} - ${timeSlot.time}`);
        try {
            const pavilion = this.pavilions.get(pavilionId);
            if (!pavilion) {
                throw new Error('パビリオン情報が見つかりません');
            }
            if (selectedTickets.length === 0) {
                throw new Error('チケットが選択されていません');
            }
            // 予約リクエストを構築
            const timeSlotForAPI = timeSlot.timeSlotId || timeSlot.time;
            console.log('🔍 時間帯データ確認:', { timeSlot, timeSlotForAPI });
            const request = {
                pavilionId: pavilionId,
                timeSlotId: timeSlotForAPI,
                ticketIds: selectedTickets.map(t => t.ticket_id)
            };
            // 予約API実行
            const result = await this.executeReservationAPI(request, entranceDate, registeredChannel);
            if (result.success) {
                // 成功時は選択状態をクリア
                this.clearSelectedTimeSlots();
                console.log(`✅ 予約成功: ${pavilion.name} - ${timeSlot.time}`);
            }
            else {
                console.log(`❌ 予約失敗: ${result.message}`);
            }
            return {
                ...result,
                details: {
                    pavilionName: pavilion.name,
                    timeSlot: timeSlot.time,
                    ticketCount: selectedTickets.length
                }
            };
        }
        catch (error) {
            console.error('❌ 予約実行エラー:', error);
            return {
                success: false,
                message: `予約に失敗しました: ${error}`,
                error: String(error)
            };
        }
    }
    /**
     * 予約API実行
     */
    async executeReservationAPI(request, entranceDate, registeredChannel) {
        try {
            const reservationData = {
                ticket_ids: request.ticketIds,
                entrance_date: entranceDate,
                start_time: request.timeSlotId,
                event_code: request.pavilionId,
                registered_channel: registeredChannel
            };
            console.log('🔍 予約APIリクエストデータ:', reservationData);
            console.log('🔍 JSON文字列:', JSON.stringify(reservationData));
            console.log('🔍 request元データ:', request);
            // CSRFトークンを取得
            const getCsrfToken = () => {
                // metaタグから取得
                const csrfMeta = document.querySelector('meta[name="csrf-token"]');
                if (csrfMeta) {
                    return csrfMeta.getAttribute('content');
                }
                // クッキーから取得
                const cookies = document.cookie.split(';');
                for (let cookie of cookies) {
                    const [name, value] = cookie.trim().split('=');
                    if (name === 'csrftoken' || name === '_token' || name === 'XSRF-TOKEN') {
                        return decodeURIComponent(value);
                    }
                }
                return null;
            };
            const csrfToken = getCsrfToken();
            console.log('🔐 CSRFトークン:', csrfToken);
            const headers = {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                'X-Api-Lang': 'ja',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };
            // CSRFトークンがあれば追加（現在は常にnullのためスキップ）
            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }
            const response = await fetch('/api/d/user_event_reservations', {
                method: 'POST',
                headers,
                credentials: 'same-origin',
                body: JSON.stringify(reservationData)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.log('🔍 エラーレスポンス詳細:', errorData);
                // 422はビジネスロジックエラー（満席、無効な選択等）
                if (response.status === 422 && errorData.error) {
                    const errorName = errorData.error.name || '';
                    // 既知のエラータイプを日本語に変換
                    if (errorName === 'schedule_out_of_stock') {
                        throw new Error('満席');
                    }
                    else if (errorName === 'select_ticket_valid_error') {
                        throw new Error('無効');
                    }
                    else {
                        // その他の場合は英語でそのまま表示
                        throw new Error(errorName || '予約エラー');
                    }
                }
                throw new Error(errorData.message || `API Error: ${response.status}`);
            }
            const data = await response.json();
            return {
                success: true,
                message: '予約が完了しました',
                reservationId: data.reservation_id || data.id,
                details: {
                    pavilionName: request.pavilionId,
                    timeSlot: request.timeSlotId,
                    ticketCount: request.ticketIds.length
                }
            };
        }
        catch (error) {
            return {
                success: false,
                message: `予約に失敗しました: ${error}`,
                error: String(error)
            };
        }
    }
    /**
     * 選択済み時間帯をクリア
     */
    clearSelectedTimeSlots() {
        this.selectedTimeSlots.clear();
        // パビリオンデータの選択状態もクリア
        for (const pavilion of this.pavilions.values()) {
            for (const timeSlot of pavilion.timeSlots) {
                timeSlot.selected = false;
            }
        }
        console.log('🧹 選択済み時間帯をクリア');
    }
    /**
     * 全パビリオンデータを取得
     */
    getAllPavilions() {
        return Array.from(this.pavilions.values());
    }
    /**
     * パビリオンの時間帯情報を取得
     */
    async getPavilionTimeSlots(eventCode, ticketIds = [], entranceDate) {
        try {
            // パビリオン詳細APIで時間帯情報を取得
            const ticketIdsParam = ticketIds.length > 0 ?
                ticketIds.map(id => `ticket_ids[]=${id}`).join('&') : '';
            const entranceDateParam = entranceDate ? `&entrance_date=${entranceDate}` : '';
            const channelParam = `&channel=4`;
            const apiUrl = `/api/d/events/${eventCode}?${ticketIdsParam}${entranceDateParam}${channelParam}`;
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            console.log(`🕐 パビリオン${eventCode}時間帯取得:`, data);
            console.log(`🔍 time_slots確認:`, data.time_slots);
            console.log(`🔍 event_schedules確認:`, data.event_schedules);
            console.log(`🔍 data全体のキー:`, Object.keys(data));
            // event_schedulesオブジェクトから時間帯情報を抽出
            const timeSlots = [];
            if (data.event_schedules && typeof data.event_schedules === 'object') {
                for (const [time, schedule] of Object.entries(data.event_schedules)) {
                    const scheduleData = schedule;
                    // time_statusで空き状況を判定（2=満席、1=空きあり等を想定）
                    const isAvailable = scheduleData.time_status !== 2;
                    timeSlots.push({
                        time: time, // キーが時間（例：1040, 1100）
                        endTime: scheduleData.end_time || '',
                        available: isAvailable,
                        selected: false,
                        capacity: scheduleData.capacity || 0,
                        reserved: scheduleData.reserved || 0,
                        reservationType: scheduleData.reservation_type || '1日券',
                        timeSlotId: scheduleData.schedule_code || time
                    });
                }
            }
            console.log(`✅ パビリオン${eventCode}時間帯取得完了: ${timeSlots.length}件`);
            return timeSlots;
        }
        catch (error) {
            console.error(`❌ パビリオン${eventCode}時間帯取得エラー:`, error);
            return [];
        }
    }
    /**
     * 検索フィルターを更新
     */
    updateSearchFilter(filter) {
        this.searchFilter = { ...this.searchFilter, ...filter };
        console.log('🔍 検索フィルター更新:', this.searchFilter);
    }
    /**
     * お気に入りをキャッシュから読み込み
     */
    loadFavoritesFromCache() {
        try {
            const favorites = localStorage.getItem('expo_favorite_pavilions');
            if (favorites) {
                const data = JSON.parse(favorites);
                if (Array.isArray(data)) {
                    this.favoriteIds = new Set(data);
                    console.log(`💾 お気に入り読み込み: ${this.favoriteIds.size}個`);
                }
            }
        }
        catch (error) {
            console.error('❌ お気に入り読み込みエラー:', error);
        }
    }
    /**
     * お気に入りをキャッシュに保存
     */
    saveFavoritesToCache() {
        try {
            const favorites = Array.from(this.favoriteIds);
            localStorage.setItem('expo_favorite_pavilions', JSON.stringify(favorites));
            console.log(`💾 お気に入り保存: ${favorites.length}個`);
        }
        catch (error) {
            console.error('❌ お気に入り保存エラー:', error);
        }
    }
    /**
     * 現在のデータ状況を取得
     */
    getStatus() {
        return {
            pavilionCount: this.pavilions.size,
            selectedCount: this.selectedTimeSlots.size,
            favoriteCount: this.favoriteIds.size
        };
    }
}
/**
 * グローバルパビリオンマネージャーインスタンス
 */
let globalPavilionManager = null;
/**
 * パビリオンマネージャーを初期化・取得
 */
function getPavilionManager() {
    if (!globalPavilionManager) {
        globalPavilionManager = new PavilionManager();
    }
    return globalPavilionManager;
}

;// ./ts/modules/main-dialog-fab.ts




/**
 * メインダイアログ用FAB「yt」ボタン実装
 * 既存のFABシステムに統合してメインダイアログを開くボタンを追加
 */
let mainDialogVisible = false;
/**
 * YTFABボタンの実装
 */
class MainDialogFabImpl {
    constructor() {
        this.ytFabButton = null;
        this.mainDialogContainer = null;
        this.lastSearchResults = [];
        this.isAvailableOnlyFilterActive = false;
        // 180回制限カウンター
        this.attemptCount = 0;
        this.FAST_INTERVAL_LIMIT = 180;
    }
    /**
     * メインダイアログFABシステムを初期化
     */
    initialize() {
        console.log('🎯 メインダイアログFAB初期化開始');
        // ticket.expo2025.or.jp でのみ動作
        if (!page_utils/* PageChecker */.v.isTicketSite()) {
            console.log('⚠️ チケットサイト以外では初期化をスキップ');
            return;
        }
        // チケットマネージャーを初期化
        this.ticketManager = getTicketManager();
        // リアクティブチケットマネージャーを初期化
        this.reactiveTicketManager = getReactiveTicketManager(this.ticketManager);
        // パビリオンマネージャーを初期化
        this.pavilionManager = getPavilionManager();
        // リアクティブUI更新を設定
        this.setupReactiveUIUpdaters();
        // 既存のFABコンテナを確認
        let fabContainer = document.getElementById('ytomo-fab-container');
        if (!fabContainer) {
            // FABコンテナがない場合は基本構造を作成
            this.createBasicFabContainer();
            fabContainer = document.getElementById('ytomo-fab-container');
        }
        if (fabContainer) {
            this.addYTFabButton();
            console.log('✅ メインダイアログFAB初期化完了');
        }
        else {
            console.error('❌ FABコンテナの作成に失敗');
        }
    }
    /**
     * 基本的なFABコンテナを作成（既存システムがない場合）
     */
    createBasicFabContainer() {
        const fabContainer = document.createElement('div');
        fabContainer.id = 'ytomo-fab-container';
        fabContainer.className = 'ytomo-fab-container z-normal';
        document.body.appendChild(fabContainer);
    }
    /**
     * YTボタンをFABシステムに追加
     */
    addYTFabButton() {
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (!fabContainer) {
            console.error('❌ FABコンテナが見つかりません');
            return;
        }
        // 既存のYTボタンを削除
        const existingYTButton = document.getElementById('ytomo-yt-fab');
        if (existingYTButton) {
            existingYTButton.remove();
        }
        // YTボタンを作成
        this.ytFabButton = document.createElement('button');
        this.ytFabButton.id = 'ytomo-yt-fab';
        this.ytFabButton.className = 'ytomo-sub-fab ytomo-yt-button';
        this.ytFabButton.innerHTML = `
            <span class="ytomo-fab-icon">YT</span>
        `;
        this.ytFabButton.title = 'メインダイアログを開く';
        // クリックイベントを設定
        this.ytFabButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMainDialog();
        });
        // FABコンテナに追加（メインFABボタンの手前に配置）
        const mainFab = fabContainer.querySelector('#ytomo-main-fab');
        if (mainFab) {
            fabContainer.insertBefore(this.ytFabButton, mainFab);
        }
        else {
            fabContainer.appendChild(this.ytFabButton);
        }
        console.log('✅ YTボタンをFABに追加');
    }
    /**
     * メインダイアログの表示切り替え
     */
    async toggleMainDialog() {
        if (mainDialogVisible) {
            this.hideMainDialog();
        }
        else {
            await this.showMainDialog();
        }
    }
    /**
     * メインダイアログを表示
     */
    async showMainDialog() {
        console.log('🎯 メインダイアログ表示');
        // 既存のダイアログを削除
        this.hideMainDialog();
        // チケットマネージャーにチケットデータをロード
        await this.reactiveTicketManager.loadAllTickets();
        // デバッグ: 読み込まれたチケットID一覧
        const loadedTickets = this.ticketManager.getAllTickets();
        console.log(`🎫 読み込まれたチケットID一覧:`, loadedTickets.map(t => `${t.ticket_id}(${t.isOwn ? '自分' : '他人'})`));
        // メインダイアログコンテナを作成
        this.mainDialogContainer = document.createElement('div');
        this.mainDialogContainer.id = 'ytomo-main-dialog';
        this.mainDialogContainer.className = 'ytomo-dialog-overlay';
        // ダイアログ内容を作成
        this.mainDialogContainer.innerHTML = `
            <div class="ytomo-dialog ytomo-main-dialog">
                <div class="ytomo-dialog-body">
                    <div class="ytomo-tab-navigation">
                        <button class="ytomo-tab-button active" data-tab="ticket">
                            チケット<span class="ytomo-tab-count" id="ticket-count"></span>
                        </button>
                        <button class="ytomo-tab-button" data-tab="pavilion">
                            <div class="ytomo-tab-content">
                                <div class="ytomo-tab-title">パビリオン</div>
                                <div class="ytomo-tab-dates" id="pavilion-tab-dates"></div>
                            </div>
                        </button>
                        <button class="ytomo-tab-button" data-tab="third">
                        </button>
                        <button class="ytomo-dialog-close" aria-label="閉じる">×</button>
                    </div>
                    <div class="ytomo-tab-content">
                        <div class="ytomo-tab-pane active" id="ticket-tab">
                            <div class="ytomo-loading">
                                <p>チケット情報を読み込み中...</p>
                            </div>
                        </div>
                        <div class="ytomo-tab-pane" id="pavilion-tab">
                            <div class="ytomo-loading">
                                <p>パビリオン情報を読み込み中...</p>
                            </div>
                        </div>
                        <div class="ytomo-tab-pane" id="third-tab">
                        </div>
                    </div>
                </div>
            </div>
        `;
        // DOMに追加
        document.body.appendChild(this.mainDialogContainer);
        // イベントリスナーを設定
        this.setupDialogEventListeners();
        this.setupPavilionTabEvents();
        // 表示状態を更新
        mainDialogVisible = true;
        // 初期化処理を開始
        this.initializeDialogContent();
    }
    /**
     * メインダイアログを非表示
     */
    hideMainDialog() {
        if (this.mainDialogContainer) {
            this.mainDialogContainer.remove();
            this.mainDialogContainer = null;
        }
        mainDialogVisible = false;
        console.log('🎯 メインダイアログ非表示');
    }
    /**
     * ダイアログのイベントリスナーを設定
     */
    setupDialogEventListeners() {
        if (!this.mainDialogContainer)
            return;
        // 閉じるボタン
        const closeButton = this.mainDialogContainer.querySelector('.ytomo-dialog-close');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                this.hideMainDialog();
            });
        }
        // オーバーレイクリックで閉じる
        this.mainDialogContainer.addEventListener('click', (e) => {
            if (e.target === this.mainDialogContainer) {
                this.hideMainDialog();
            }
        });
        // Escキーで閉じる
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && mainDialogVisible) {
                this.hideMainDialog();
            }
        });
        // タブ切り替え
        const tabButtons = this.mainDialogContainer.querySelectorAll('.ytomo-tab-button');
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const tabButton = target.closest('.ytomo-tab-button');
                const tabName = tabButton?.dataset['tab'];
                if (tabName) {
                    this.switchTab(tabName);
                }
            });
        });
    }
    /**
     * タブを切り替え
     */
    switchTab(tabName) {
        if (!this.mainDialogContainer)
            return;
        // タブボタンの状態を更新
        const tabButtons = this.mainDialogContainer.querySelectorAll('.ytomo-tab-button');
        tabButtons.forEach(button => {
            button.classList.remove('active');
            if (button.dataset['tab'] === tabName) {
                button.classList.add('active');
            }
        });
        // タブコンテンツの状態を更新
        const tabPanes = this.mainDialogContainer.querySelectorAll('.ytomo-tab-pane');
        tabPanes.forEach(pane => {
            pane.classList.remove('active');
            if (pane.id === `${tabName}-tab`) {
                pane.classList.add('active');
            }
        });
        console.log(`🔄 タブ切り替え: ${tabName}`);
        console.log(`🔍 タブ切り替え時のselectedTicketIds:`, Array.from(this.reactiveTicketManager.getSelectedTicketIds()));
    }
    /**
     * リアクティブUI更新を設定
     */
    setupReactiveUIUpdaters() {
        // チケット選択関連のUI更新をまとめて登録
        this.reactiveTicketManager.registerUIUpdaters({
            ticketSelection: () => {
                this.updateTicketSelection();
                this.updateTicketTabCount();
                this.updateSelectedInfo();
                this.updatePavilionTabSelectedDates();
                this.updateReservationButton();
            },
            ticketList: () => {
                // チケット一覧が変更された場合の更新
                // 必要に応じて実装
            }
        });
        console.log('✅ リアクティブUI更新システム設定完了');
    }
    /**
     * ダイアログ内容の初期化
     */
    async initializeDialogContent() {
        console.log('🔄 ダイアログ内容初期化開始');
        try {
            // チケットタブの初期化
            await this.initializeTicketTab();
            // パビリオンタブの初期化
            await this.initializePavilionTab();
            console.log('✅ ダイアログ内容初期化完了');
        }
        catch (error) {
            console.error('❌ ダイアログ内容初期化エラー:', error);
            // スマホ環境でのエラーアラート
            if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
                alert(`スマホ環境: 初期化エラー\n${error}`);
            }
        }
    }
    /**
     * チケットタブの初期化
     */
    async initializeTicketTab() {
        const ticketTab = this.mainDialogContainer?.querySelector('#ticket-tab');
        if (!ticketTab)
            return;
        console.log('🎫 チケットタブ初期化開始');
        // ローディング表示
        ticketTab.innerHTML = `
            <div class="ytomo-loading">
                <p>チケット情報を読み込み中...</p>
            </div>
        `;
        try {
            // チケットマネージャーからデータを取得
            const tickets = this.ticketManager.getAllTickets();
            console.log('🔍 チケットマネージャーデータ:', tickets);
            if (tickets.length === 0) {
                throw new Error('チケットデータが見つかりません');
            }
            const availableDates = await this.extractAvailableDates(tickets);
            // チケットタブUIを構築
            await this.buildTicketTabUI(ticketTab, tickets, availableDates);
            // タブカウント更新
            this.updateTicketTabCount();
            // キャッシュから入場予約選択を復元
            this.restoreEntranceSelectionFromCache();
            console.log('✅ チケットタブ初期化完了');
        }
        catch (error) {
            console.error('❌ チケットタブ初期化エラー:', error);
            // エラー表示
            ticketTab.innerHTML = `
                <div class="ytomo-error">
                    <h3>⚠️ チケット情報の取得に失敗しました</h3>
                    <p>ログインしているか確認してください</p>
                    <button class="ytomo-button retry-button">再試行</button>
                </div>
            `;
            // 再試行ボタンのイベント
            const retryButton = ticketTab.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.initializeTicketTab();
                });
            }
        }
    }
    /**
     * チケットタブUIを構築
     */
    async buildTicketTabUI(container, tickets, availableDates) {
        container.innerHTML = `
            <div class="ytomo-ticket-tab">
                <!-- チケット簡易選択エリア -->
                <div class="ytomo-quick-select">
                    <label class="ytomo-toggle-container">
                        <input type="checkbox" id="own-only-toggle" class="ytomo-toggle-input">
                        <span class="ytomo-toggle-slider"></span>
                        <span class="ytomo-toggle-label">自分</span>
                    </label>
                    ${this.buildDateButtons(availableDates)}
                </div>

                <!-- チケット一覧エリア -->
                <div class="ytomo-ticket-list" id="ticket-list-container">
                    ${await this.buildTicketList(tickets)}
                </div>

                <!-- チケットID追加（同様のレイアウト） -->
                <div class="ytomo-ticket-item ytomo-add-ticket-item">
                    <div class="ytomo-ticket-upper">
                        <input type="text" id="ticket-id-input" placeholder="チケットID" class="ytomo-input-inline">
                        <input type="text" id="ticket-label-input" placeholder="Label" class="ytomo-input-inline">
                        <button id="add-ticket-button" class="ytomo-button primary">Add</button>
                    </div>
                </div>
            </div>
        `;
        // イベントリスナーを設定
        this.setupTicketTabEventListeners(container);
    }
    /**
     * 日付ボタンを構築
     */
    buildDateButtons(dates) {
        return dates.map(date => {
            const formattedDate = this.formatDate(date);
            return `
                <button class="ytomo-date-button" data-date="${date}">
                    ${formattedDate}
                </button>
            `;
        }).join('');
    }
    /**
     * チケット一覧を構築（調査結果に基づく）
     */
    async buildTicketList(tickets) {
        if (tickets.length === 0) {
            return `
                <div class="ytomo-empty-state">
                    <p>チケットが見つかりませんでした</p>
                </div>
            `;
        }
        // 状態0の入場予約があるチケットのみ表示
        const validTickets = tickets.filter(ticket => {
            const schedules = ticket.schedules || [];
            return schedules.some((schedule) => schedule.use_state === 0);
        });
        if (validTickets.length === 0) {
            return `
                <div class="ytomo-empty-state">
                    <p>利用可能なチケットが見つかりませんでした</p>
                </div>
            `;
        }
        const ticketPromises = validTickets.map(async (ticket) => `
            <div class="ytomo-ticket-item" data-ticket-id="${ticket.ticket_id}">
                <!-- 上半分: チケットID、Me Tip、Label -->
                <div class="ytomo-ticket-upper">
                    <span class="ytomo-ticket-id">${ticket.ticket_id}</span>
                    <span class="ytomo-me-tip">Me</span>
                </div>
                <!-- 下半分: 入場日時ボタン（予約種類も含む） -->
                <div class="ytomo-ticket-lower">
                    <div class="ytomo-entrance-dates">
                        ${await this.buildEntranceDateButtons(ticket.schedules || [], ticket)}
                    </div>
                </div>
            </div>
        `);
        const ticketResults = await Promise.all(ticketPromises);
        return ticketResults.join('');
    }
    /**
     * 入場日時ボタンを構築（調査結果に基づく）
     */
    async buildEntranceDateButtons(schedules, ticket) {
        if (!Array.isArray(schedules) || schedules.length === 0) {
            return '<span class="ytomo-no-entrance-dates">入場予約なし</span>';
        }
        // 状態0（未使用）の入場予約のみ表示
        const unusedSchedules = schedules.filter(schedule => schedule.use_state === 0);
        if (unusedSchedules.length === 0) {
            return '<span class="ytomo-no-entrance-dates">利用可能な入場予約なし</span>';
        }
        const buttonPromises = unusedSchedules.map(async (schedule) => {
            // 抽選カレンダーデータを取得
            const lotteryData = await this.fetchLotteryCalendar(schedule.entrance_date);
            const reservationStatus = this.getReservationStatus(schedule, lotteryData, ticket);
            const isDisabled = reservationStatus.availableTypes.length === 0;
            return `
                <button class="ytomo-entrance-date-button${isDisabled ? ' disabled' : ''}" 
                        data-date="${schedule.entrance_date}" 
                        data-use-state="${schedule.use_state}"
                        data-available-types="${reservationStatus.availableTypes.join(',')}"
                        ${isDisabled ? 'disabled' : ''}>
                    <span class="ytomo-date-text">${this.formatDate(schedule.entrance_date)} ${schedule.schedule_name || ''}</span>
                    <div class="ytomo-reservation-status">
                        ${reservationStatus.statusText}
                    </div>
                </button>
            `;
        });
        const buttonResults = await Promise.all(buttonPromises);
        return buttonResults.join('');
    }
    /**
     * 入場予約の詳細な予約状況を取得
     */
    getReservationStatus(schedule, lotteryData, ticket) {
        const statuses = [];
        const availableTypes = [];
        console.log('🔍 予約種類判定開始:', { schedule, lotteryData, ticket });
        if (!lotteryData) {
            const debugInfo = {
                userAgent: navigator.userAgent,
                schedule: JSON.stringify(schedule),
                ticketId: ticket?.ticket_id,
                entranceDate: schedule?.entrance_date,
                fetchUrl: schedule?.entrance_date ? `/api/d/lottery_calendars?entrance_date=${schedule.entrance_date}` : 'undefined'
            };
            alert(`スマホ環境デバッグ: lotteryData取得失敗\n${JSON.stringify(debugInfo, null, 2)}`);
            return { statusText: '確認中...', availableTypes: [] };
        }
        // lotteryDataの構造をログ出力
        console.log('📊 lotteryData構造:', {
            on_the_day_reservation: lotteryData.on_the_day_reservation,
            empty_frame_reservation: lotteryData.empty_frame_reservation,
            seven_days_ago_lottery: lotteryData.seven_days_ago_lottery,
            two_months_ago_lottery: lotteryData.two_months_ago_lottery
        });
        const now = new Date();
        // 当日から3日後までの日付範囲チェック
        const isWithinAlwaysEnabledRange = (entranceDate) => {
            try {
                const entrance = new Date(entranceDate.substring(0, 4) + '-' +
                    entranceDate.substring(4, 6) + '-' +
                    entranceDate.substring(6, 8));
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const threeDaysLater = new Date(today);
                threeDaysLater.setDate(today.getDate() + 3);
                return entrance >= today && entrance <= threeDaysLater;
            }
            catch (error) {
                return false;
            }
        };
        const alwaysEnabled = isWithinAlwaysEnabledRange(schedule.entrance_date);
        console.log('🔄 Always Enable チェック:', { date: schedule.entrance_date, enabled: alwaysEnabled });
        const checkPeriod = (period) => {
            if (!period || !period.request_start || !period.request_end) {
                console.log('⚠️ 期間データなし:', period);
                // Always Enabled範囲の場合は強制的にopenにする
                return alwaysEnabled ?
                    { isOpen: true, isExpired: false, notStarted: false } :
                    { isOpen: false, isExpired: false, notStarted: false };
            }
            const start = new Date(period.request_start);
            const end = new Date(period.request_end);
            const result = {
                isOpen: now >= start && now <= end,
                isExpired: now > end,
                notStarted: now < start
            };
            // Always Enabled範囲の場合は強制的にopenにする
            if (alwaysEnabled && !result.isOpen) {
                result.isOpen = true;
                result.isExpired = false;
                result.notStarted = false;
                console.log('🔄 Always Enable適用: 期間外だが強制的にopen');
            }
            console.log('📅 期間チェック:', { period, start, end, now, result });
            return result;
        };
        const getStatusFromLottery = (lotteryArray, lotteryType, ticket) => {
            // 抽選データがある場合のみ処理
            if (lotteryArray?.length > 0) {
                const lottery = lotteryArray[0];
                // 申し込み状態を確認
                if (lottery.state === 0) {
                    return '提出';
                }
                // 当選判定: event_schedulesから実際の予約を確認
                if (lottery.state === 1 && ticket?.event_schedules?.length > 0) {
                    // registered_channelで予約種類を照合
                    const lotteryChannelMap = {
                        '7day': '2', // 7日前抽選
                        '2month': '1' // 2ヶ月前抽選
                    };
                    const expectedChannel = lotteryChannelMap[lotteryType];
                    const hasActualReservation = ticket.event_schedules.some((eventSchedule) => eventSchedule.entrance_date === schedule.entrance_date &&
                        eventSchedule.registered_channel === expectedChannel);
                    return hasActualReservation ? 'あり' : '落選';
                }
                else if (lottery.state === 1) {
                    // event_schedulesがない場合は申し込み済みとして扱う
                    return '提出';
                }
                else {
                    // その他の状態は落選
                    return '落選';
                }
            }
            return 'なし';
        };
        const processReservationType = (label, reservationStatus, period) => {
            if (period.isExpired) {
                // 期限後は「あり」のみ表示（落選・提出は表示しない）
                if (reservationStatus === 'あり') {
                    statuses.push(`${label}:あり`);
                }
            }
            else if (period.isOpen) {
                // 期限中は全状態表示
                if (reservationStatus === 'あり') {
                    statuses.push(`${label}:あり`);
                }
                else if (reservationStatus === '提出') {
                    statuses.push(`${label}:提出`);
                }
                else if (reservationStatus === '落選') {
                    statuses.push(`${label}:落選`);
                }
                else {
                    // 未申込で期限中
                    statuses.push(`${label}:なし`);
                    availableTypes.push(label);
                }
            }
            // 期限前（notStarted）は表示しない
        };
        // 表示順序: 1,3,週,月
        // 当日予約 - 左から1番目
        // 実際の予約を確認（registered_channel === '5' かつ entrance_date が一致、かつ未使用）
        const hasOnTheDayReservation = ticket?.event_schedules?.some((eventSchedule) => eventSchedule.entrance_date === schedule.entrance_date &&
            eventSchedule.registered_channel === '5' && // 当日予約のチャンネル
            eventSchedule.use_state === 0 // 未使用のみ
        );
        const onTheDayStatus = hasOnTheDayReservation ? 'あり' : 'なし';
        console.log('1️⃣ 当日予約:', {
            on_the_day_field: schedule.on_the_day,
            hasActualReservation: hasOnTheDayReservation,
            alwaysEnabled: alwaysEnabled,
            status: onTheDayStatus,
            eventSchedules: ticket?.event_schedules?.filter((es) => es.entrance_date === schedule.entrance_date)
        });
        processReservationType('1', onTheDayStatus, checkPeriod(lotteryData.on_the_day_reservation));
        // 空き枠予約 - 左から2番目
        // 実際の予約を確認（registered_channel === '4' かつ entrance_date が一致）
        const hasEmptyFrameReservation = ticket?.event_schedules?.some((eventSchedule) => eventSchedule.entrance_date === schedule.entrance_date &&
            eventSchedule.registered_channel === '4' // 空き枠予約のチャンネル
        );
        const emptyFrameStatus = hasEmptyFrameReservation ? 'あり' : 'なし';
        console.log('3️⃣ 空き枠予約:', {
            empty_frame_field: schedule.empty_frame,
            hasActualReservation: hasEmptyFrameReservation,
            alwaysEnabled: alwaysEnabled,
            status: emptyFrameStatus,
            eventSchedules: ticket?.event_schedules?.filter((es) => es.entrance_date === schedule.entrance_date)
        });
        processReservationType('3', emptyFrameStatus, checkPeriod(lotteryData.empty_frame_reservation));
        // 7日前抽選 - 左から3番目
        const dayStatus = getStatusFromLottery(schedule.lotteries?.day, '7day', ticket);
        console.log('📅 7日前抽選:', { lotteries_day: schedule.lotteries?.day, status: dayStatus });
        processReservationType('週', dayStatus, checkPeriod(lotteryData.seven_days_ago_lottery));
        // 2ヶ月前抽選 - 左から4番目
        const monthStatus = getStatusFromLottery(schedule.lotteries?.month, '2month', ticket);
        console.log('🗓️ 2ヶ月前抽選:', { lotteries_month: schedule.lotteries?.month, status: monthStatus });
        processReservationType('月', monthStatus, checkPeriod(lotteryData.two_months_ago_lottery));
        const result = {
            statusText: statuses.join(' '),
            availableTypes
        };
        console.log('✅ 予約種類判定結果:', result);
        return result;
    }
    /**
     * 入場予約選択をキャッシュに保存
     */
    saveEntranceSelectionToCache(date) {
        try {
            localStorage.setItem('ytomo_entrance_selection', date);
            console.log(`💾 入場予約選択をキャッシュに保存: ${date}`);
        }
        catch (error) {
            console.warn('⚠️ 入場予約選択キャッシュ保存失敗:', error);
        }
    }
    /**
     * 入場予約選択をキャッシュから削除
     */
    clearEntranceSelectionFromCache() {
        try {
            localStorage.removeItem('ytomo_entrance_selection');
            console.log('🗑️ 入場予約選択キャッシュをクリア');
        }
        catch (error) {
            console.warn('⚠️ 入場予約選択キャッシュクリア失敗:', error);
        }
    }
    /**
     * キャッシュから入場予約選択を復元
     */
    restoreEntranceSelectionFromCache() {
        try {
            const cachedDate = localStorage.getItem('ytomo_entrance_selection');
            if (!cachedDate)
                return;
            // キャッシュされた日付のボタンを探す
            const targetButton = this.mainDialogContainer?.querySelector(`.ytomo-entrance-date-button[data-date="${cachedDate}"]`);
            if (targetButton && !targetButton.disabled) {
                targetButton.classList.add('selected');
                console.log(`🔄 入場予約選択をキャッシュから復元: ${cachedDate}`);
            }
            else {
                // ボタンが見つからない、または無効化されている場合はキャッシュクリア
                this.clearEntranceSelectionFromCache();
                console.log(`🗑️ 入場予約選択復元失敗、キャッシュクリア: ${cachedDate}`);
            }
        }
        catch (error) {
            console.warn('⚠️ 入場予約選択復元失敗:', error);
        }
    }
    /**
     * 利用可能日付を抽出（調査結果に基づく）
     */
    async extractAvailableDates(tickets) {
        const dates = new Set();
        for (const ticket of tickets) {
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                const unusedSchedules = ticket.schedules.filter((schedule) => schedule.use_state !== 1);
                for (const schedule of unusedSchedules) {
                    if (schedule.entrance_date) {
                        // 利用可能な予約タイプがあるかチェック
                        const lotteryData = await this.fetchLotteryCalendar(schedule.entrance_date);
                        const reservationStatus = this.getReservationStatus(schedule, lotteryData, ticket);
                        if (reservationStatus.availableTypes.length > 0) {
                            dates.add(schedule.entrance_date);
                        }
                    }
                }
            }
        }
        return Array.from(dates).sort();
    }
    /**
     * 抽選カレンダーデータを取得
     */
    async fetchLotteryCalendar(entranceDate) {
        try {
            const response = await fetch(`/api/d/lottery_calendars?entrance_date=${entranceDate}`, {
                method: 'GET',
                headers: {
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja'
                },
                credentials: 'same-origin'
            });
            if (!response.ok)
                return null;
            const calendarData = await response.json();
            return calendarData.data || calendarData;
        }
        catch (error) {
            console.error('❌ 抽選カレンダー取得エラー:', error);
            return null;
        }
    }
    /**
     * 日付フォーマット（YYYYMMDD → M/D）
     */
    formatDate(dateStr) {
        try {
            // YYYYMMDD形式（例：20250826）をパース
            if (dateStr && dateStr.length === 8) {
                const year = dateStr.slice(0, 4);
                const month = dateStr.slice(4, 6);
                const day = dateStr.slice(6, 8);
                const date = new Date(`${year}-${month}-${day}`);
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }
            // それ以外の形式も試す
            const date = new Date(dateStr);
            if (!isNaN(date.getTime())) {
                return `${date.getMonth() + 1}/${date.getDate()}`;
            }
            return dateStr;
        }
        catch {
            return dateStr;
        }
    }
    /**
     * チケットタブのイベントリスナーを設定
     */
    setupTicketTabEventListeners(container) {
        // 自分のみトグル
        const ownOnlyToggle = container.querySelector('#own-only-toggle');
        if (ownOnlyToggle) {
            ownOnlyToggle.addEventListener('change', () => {
                this.handleOwnOnlyToggle(ownOnlyToggle.checked);
            });
        }
        // 日付ボタン
        const dateButtons = container.querySelectorAll('.ytomo-date-button');
        dateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const date = target.dataset['date'];
                if (date) {
                    this.handleDateSelection(date, ownOnlyToggle?.checked || false);
                }
            });
        });
        // 入場日時ボタン
        const entranceButtons = container.querySelectorAll('.ytomo-entrance-date-button');
        entranceButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                if (target.disabled)
                    return;
                const date = target.dataset['date'];
                if (!date)
                    return;
                const isCurrentlySelected = target.classList.contains('selected');
                if (isCurrentlySelected) {
                    // 現在選択中のボタンをクリック → 選択解除
                    target.classList.remove('selected');
                    console.log(`🎫 入場日時選択解除: ${date}`);
                    // キャッシュから削除
                    this.clearEntranceSelectionFromCache();
                }
                else {
                    // 未選択のボタンをクリック → 全ての入場予約ボタンを解除してから選択
                    const allEntranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-button.selected');
                    allEntranceButtons?.forEach(btn => {
                        btn.classList.remove('selected');
                    });
                    target.classList.add('selected');
                    console.log(`🎫 入場日時選択: ${date} (他の日付は自動解除)`);
                    // 選択をキャッシュに保存
                    this.saveEntranceSelectionToCache(date);
                }
            });
        });
        // チケットアイテムクリック
        const ticketItems = container.querySelectorAll('.ytomo-ticket-item:not(.ytomo-add-ticket-item)');
        ticketItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = e.target;
                const ticketItem = target.closest('.ytomo-ticket-item');
                const ticketId = ticketItem?.dataset['ticketId'];
                if (ticketId) {
                    // 入場予約ボタンやその子要素がクリックされた場合
                    const isEntranceButton = target.closest('.ytomo-entrance-date-btn');
                    if (isEntranceButton) {
                        // 入場予約ボタンの選択状態に応じてチケット選択を制御
                        const isButtonSelected = isEntranceButton.classList.contains('selected');
                        const selectedTickets = this.ticketManager.getSelectedTickets();
                        const isTicketSelected = selectedTickets.some(t => t.ticket_id === ticketId);
                        if (isButtonSelected && !isTicketSelected) {
                            // ボタン選択済み、チケット未選択 → チケット選択
                            this.reactiveTicketManager.toggleTicketSelection(ticketId);
                        }
                        else if (!isButtonSelected && isTicketSelected) {
                            // ボタン未選択、チケット選択済み → チケット選択解除
                            this.reactiveTicketManager.toggleTicketSelection(ticketId);
                        }
                    }
                    else {
                        // チケット個別選択は無効化（入場予約選択で連動するため）
                        console.log('🔒 チケット個別選択は無効化されています');
                    }
                    // UI更新はリアクティブシステムで自動実行される
                }
            });
        });
        // チケット追加ボタン
        const addButton = container.querySelector('#add-ticket-button');
        if (addButton) {
            addButton.addEventListener('click', () => {
                this.handleAddTicket();
            });
        }
        // Enter キーでチケット追加
        const ticketIdInput = container.querySelector('#ticket-id-input');
        const labelInput = container.querySelector('#ticket-label-input');
        [ticketIdInput, labelInput].forEach(input => {
            if (input) {
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        this.handleAddTicket();
                    }
                });
            }
        });
    }
    /**
     * 自分のみトグル処理
     */
    handleOwnOnlyToggle(ownOnly) {
        console.log(`🔄 自分のみトグル: ${ownOnly}`);
        // 表示フィルター処理
        this.filterTicketDisplay(ownOnly);
    }
    /**
     * 日付選択処理
     */
    handleDateSelection(date, ownOnly) {
        console.log(`📅 日付選択: ${date} (自分のみ: ${ownOnly})`);
        // 日付ボタンの選択状態を更新
        const dateButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-date-button');
        dateButtons?.forEach(button => {
            const buttonDate = button.dataset['date'];
            if (buttonDate === date) {
                button.classList.toggle('selected');
            }
            else {
                button.classList.remove('selected');
            }
        });
        // 対応する入場予約ボタンの選択状態も更新
        const entranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-button');
        const isDateSelected = this.mainDialogContainer?.querySelector(`.ytomo-date-button[data-date="${date}"]`)?.classList.contains('selected');
        entranceButtons?.forEach(button => {
            const buttonDate = button.dataset['date'];
            if (buttonDate === date) {
                if (isDateSelected) {
                    button.classList.add('selected');
                }
                else {
                    button.classList.remove('selected');
                }
            }
        });
        // UI更新はリアクティブシステムで自動実行される（チケット選択は入場予約ボタンで制御）
    }
    /**
     * チケット表示フィルター
     */
    filterTicketDisplay(ownOnly) {
        const ticketItems = this.mainDialogContainer?.querySelectorAll('.ytomo-ticket-item');
        ticketItems?.forEach(item => {
            const ticketId = item.dataset['ticketId'];
            const ticket = this.ticketManager.getAllTickets().find(t => t.ticket_id === ticketId);
            if (ticket) {
                if (ownOnly && !ticket.isOwn) {
                    item.classList.add('hidden');
                }
                else {
                    item.classList.remove('hidden');
                }
            }
        });
    }
    /**
     * チケット追加処理
     */
    async handleAddTicket() {
        const ticketIdInput = this.mainDialogContainer?.querySelector('#ticket-id-input');
        const labelInput = this.mainDialogContainer?.querySelector('#ticket-label-input');
        if (!ticketIdInput)
            return;
        const ticketId = ticketIdInput.value.trim();
        const label = labelInput?.value.trim() || '外部チケット';
        if (!ticketId) {
            alert('チケットIDを入力してください');
            return;
        }
        try {
            await this.reactiveTicketManager.addExternalTicket(ticketId, label);
            // 成功時はタブを再初期化
            await this.initializeTicketTab();
            // 入力をクリア
            ticketIdInput.value = '';
            if (labelInput)
                labelInput.value = '';
            console.log(`✅ チケット追加成功: ${ticketId}`);
        }
        catch (error) {
            console.error('❌ チケット追加エラー:', error);
            alert(`チケット追加に失敗しました: ${error}`);
        }
    }
    /**
     * チケット選択状態をUI更新
     */
    updateTicketSelection() {
        const selectedTickets = this.ticketManager.getSelectedTickets();
        const selectedIds = new Set(selectedTickets.map(t => t.ticket_id));
        // チケット項目の選択状態を更新
        const ticketItems = this.mainDialogContainer?.querySelectorAll('.ytomo-ticket-item');
        ticketItems?.forEach(item => {
            const ticketId = item.dataset['ticketId'];
            if (ticketId && selectedIds.has(ticketId)) {
                item.classList.add('selected');
            }
            else {
                item.classList.remove('selected');
            }
        });
    }
    /**
     * チケットタブカウントを更新
     */
    updateTicketTabCount() {
        const count = this.ticketManager.getSelectedTicketCount();
        const tabCount = this.mainDialogContainer?.querySelector('#ticket-count');
        if (tabCount) {
            tabCount.textContent = ` (${count})`;
        }
    }
    /**
     * パビリオンタブの初期化
     */
    async initializePavilionTab() {
        const pavilionTab = this.mainDialogContainer?.querySelector('#pavilion-tab');
        if (!pavilionTab)
            return;
        console.log('🏛️ パビリオンタブ初期化開始');
        // ローディング表示
        pavilionTab.innerHTML = `
            <div class="ytomo-loading">
                <p>パビリオン情報を読み込み中...</p>
            </div>
        `;
        try {
            // 選択チケットを取得
            const selectedTickets = this.ticketManager.getSelectedTickets();
            // 予約種類を判定
            const reservationType = this.determineReservationType(selectedTickets);
            // パビリオンタブUIを構築
            this.buildPavilionTabUI(pavilionTab, reservationType);
            console.log('✅ パビリオンタブ初期化完了');
        }
        catch (error) {
            console.error('❌ パビリオンタブ初期化エラー:', error);
            // エラー表示
            pavilionTab.innerHTML = `
                <div class="ytomo-error">
                    <h3>⚠️ パビリオン情報の取得に失敗しました</h3>
                    <p>チケットが選択されているか確認してください</p>
                    <button class="ytomo-button retry-button">再試行</button>
                </div>
            `;
            // 再試行ボタンのイベント
            const retryButton = pavilionTab.querySelector('.retry-button');
            if (retryButton) {
                retryButton.addEventListener('click', () => {
                    this.initializePavilionTab();
                });
            }
        }
    }
    /**
     * パビリオンタブUIを構築
     */
    buildPavilionTabUI(container, _reservationType) {
        container.innerHTML = `
            <div class="ytomo-pavilion-tab">
                <!-- 検索コントロールエリア -->
                <div class="ytomo-search-controls">
                    <div class="ytomo-search-input-container">
                        <input type="text" id="pavilion-search-input" placeholder="パビリオン名で検索" class="ytomo-search-input">
                    </div>
                    <div class="ytomo-control-buttons">
                        <button id="search-button" class="ytomo-icon-button" title="検索">
                            <span>🔍</span>
                        </button>
                        <button id="favorites-button" class="ytomo-icon-button" title="お気に入り">
                            <span>⭐</span>
                        </button>
                        <button id="filter-button" class="ytomo-icon-button" title="空きのみ表示">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M4.25 5.61C6.27 8.2 10 13 10 13v6c0 .55.45 1 1 1h2c.55 0 1-.45 1-1v-6s3.72-4.8 5.74-7.39c.51-.66.04-1.61-.79-1.61H5.04c-.83 0-1.3.95-.79 1.61z"/>
                            </svg>
                            <span id="available-count" class="ytomo-count-badge">0</span>
                        </button>
                        <button id="refresh-button" class="ytomo-icon-button" title="更新">
                            <span>🔄</span>
                        </button>
                    </div>
                </div>

                <!-- パビリオン一覧エリア -->
                <div class="ytomo-pavilion-list" id="pavilion-list-container">
                    <div class="ytomo-empty-state">
                        <p>🔍 検索ボタンを押してパビリオンを検索してください</p>
                    </div>
                </div>

                <!-- 予約実行FABボタン -->
                <button id="reservation-button" class="ytomo-reservation-fab" disabled title="予約実行">
                    📋
                </button>
                
                <!-- ステータスFAB（予約結果表示用） -->
                <button id="status-fab" class="ytomo-status-fab" style="display: none;">
                    📋
                </button>
                
                <!-- 予約結果表示（非表示） -->
                <div class="ytomo-result-display" id="result-display" style="display: none;"></div>
                
                <!-- 選択情報表示 -->
                <div class="ytomo-selected-info" id="selected-info"></div>
            </div>
        `;
        // イベントリスナーを設定
        this.setupPavilionTabEventListeners(container);
    }
    /**
     * 予約種類を判定
     */
    determineReservationType(tickets) {
        if (tickets.length === 0)
            return '1';
        // TODO: 実際の予約種類を判断する
        return '';
    }
    /**
     * パビリオンタブのイベントリスナーを設定
     */
    setupPavilionTabEventListeners(container) {
        // 検索ボタン
        const searchButton = container.querySelector('#search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.handlePavilionSearch();
            });
        }
        // お気に入りボタン
        const favoritesButton = container.querySelector('#favorites-button');
        if (favoritesButton) {
            favoritesButton.addEventListener('click', () => {
                this.handleLoadFavorites();
            });
        }
        // フィルターボタン
        const filterButton = container.querySelector('#filter-button');
        if (filterButton) {
            filterButton.addEventListener('click', () => {
                this.toggleAvailableOnlyFilter();
            });
        }
        // 更新ボタン
        const refreshButton = container.querySelector('#refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => {
                this.handleRefreshAllPavilions();
            });
        }
        // 予約ボタン
        const reservationButton = container.querySelector('#reservation-button');
        if (reservationButton) {
            reservationButton.addEventListener('click', () => {
                this.handleMakeReservation();
            });
        }
        // 検索入力でEnterキー
        const searchInput = container.querySelector('#pavilion-search-input');
        if (searchInput) {
            searchInput.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    this.handlePavilionSearch();
                }
            });
        }
    }
    /**
     * お気に入り読み込み処理
     */
    async handleLoadFavorites() {
        console.log('⭐ お気に入り読み込み');
        try {
            this.showPavilionLoading('お気に入りを読み込み中...');
            const { ticketIds, entranceDate } = this.getSearchParameters();
            const pavilions = await this.pavilionManager.loadFavoritePavilions();
            // お気に入りパビリオンは最初から全パビリオンの時間帯情報を取得
            const allPavilionIds = pavilions.map(p => p.id);
            const timeSlotsMap = await this.fetchTimeSlotsForPavilionIds(allPavilionIds, ticketIds, entranceDate);
            // 全パビリオンに時間帯情報を設定し、dateStatusを更新
            for (const pavilion of pavilions) {
                pavilion.timeSlots = timeSlotsMap.get(pavilion.id) || [];
                // 時間帯情報から満員状態を判定してdateStatusを設定
                const hasAvailableSlots = pavilion.timeSlots.some(slot => slot.available);
                if (!hasAvailableSlots && pavilion.timeSlots.length > 0) {
                    pavilion.dateStatus = 2; // 全て満員
                }
                else if (pavilion.timeSlots.length === 0) {
                    pavilion.dateStatus = 2; // 時間帯なし（満員扱い）
                }
                else {
                    pavilion.dateStatus = 1; // 空きあり
                }
            }
            // 検索結果を保存
            this.lastSearchResults = [...pavilions];
            this.displayPavilions(pavilions);
            // 空きパビリオン数を更新
            this.updateAvailableCount(pavilions);
            // お気に入り検索時はフィルタをOFFに設定
            this.isAvailableOnlyFilterActive = false;
            this.updateFilterButtonUI();
            this.applyStyleFilters();
            console.log(`✅ お気に入り読み込み完了: ${pavilions.length}個（時間帯情報付き）`);
        }
        catch (error) {
            console.error('❌ お気に入り読み込みエラー:', error);
            this.showPavilionError('お気に入りの読み込みに失敗しました');
        }
    }
    /**
     * 予約実行処理
     */
    async handleMakeReservation() {
        console.log('🎯 予約実行開始');
        const selectedTimeSlots = this.pavilionManager.getSelectedTimeSlots();
        if (selectedTimeSlots.length === 0) {
            this.showReservationResult('時間帯を選択してください', 'error');
            return;
        }
        const selectedTickets = this.ticketManager.getSelectedTickets();
        if (selectedTickets.length === 0) {
            this.showReservationResult('チケットを選択してください', 'error');
            return;
        }
        try {
            // 複数選択時は順次予約、単一選択時は単一予約
            if (selectedTimeSlots.length === 1) {
                await this.executeSingleReservation(selectedTimeSlots[0], selectedTickets);
            }
            else {
                await this.executeSequentialReservations(selectedTimeSlots, selectedTickets);
            }
        }
        catch (error) {
            console.error('❌ 予約実行エラー:', error);
            // errorオブジェクトからメッセージ部分のみ抽出
            const errorMessage = String(error).replace('Error: ', '');
            this.showReservationResult(`予約失敗: ${errorMessage}`, 'error');
        }
        finally {
            // 予約完了後にFABボタンを再有効化
            this.updateReservationButton();
            // オーバーレイを非表示
            this.hideProcessingOverlay();
        }
    }
    /**
     * 単一予約実行
     */
    async executeSingleReservation(selectedTimeSlot, selectedTickets) {
        const { pavilionId, timeSlot } = selectedTimeSlot;
        // 誤操作防止オーバーレイを表示
        this.showProcessingOverlay('予約を実行中...');
        // 予約実行中はFABボタンを無効化
        const reservationButton = this.mainDialogContainer?.querySelector('#reservation-button');
        if (reservationButton) {
            reservationButton.disabled = true;
        }
        // 登録チャンネルを取得
        const registeredChannel = this.getRegisteredChannelFromSelection();
        const entranceDate = this.getSearchParameters().entranceDate;
        if (!entranceDate) {
            this.showReservationResult('❗ 入場日が選択されていません', 'error');
            return;
        }
        // 予約を実行
        const result = await this.pavilionManager.makeReservation(pavilionId, timeSlot, selectedTickets, entranceDate, registeredChannel);
        if (result.success) {
            this.showReservationResult('予約成功', 'success');
            // パビリオン情報を再取得して表示を更新
            const pavilionName = this.lastSearchResults.find(p => p.id === pavilionId)?.name || pavilionId;
            const entranceDate = this.getSearchParameters().entranceDate;
            if (entranceDate) {
                const dateTimeInfo = `${this.formatDate(entranceDate)} ${this.formatTime(timeSlot.time)}`;
                // 3行のステータスFAB表示
                const statusFab = this.mainDialogContainer?.querySelector('.ytomo-status-fab');
                if (statusFab) {
                    statusFab.className = 'ytomo-status-fab success';
                    statusFab.innerHTML = `
                        <div>予約成功</div>
                        <div>${pavilionName}</div>
                        <div>${dateTimeInfo}</div>
                    `;
                }
            }
            console.log(`✅ 予約成功: ${pavilionId} ${timeSlot.time}`);
        }
        else {
            this.showReservationResult(`予約失敗: ${result.message}`, 'error');
        }
    }
    /**
     * 順次予約実行（複数選択時）
     */
    async executeSequentialReservations(selectedTimeSlots, selectedTickets) {
        // タイムスタンプ順でソート（選択順序を保持）
        const sortedTimeSlots = this.sortTimeSlotsByTimestamp(selectedTimeSlots);
        // 拡張オーバーレイを表示
        this.showSequentialReservationOverlay(sortedTimeSlots.length);
        // 予約実行中はFABボタンを無効化
        const reservationButton = this.mainDialogContainer?.querySelector('#reservation-button');
        if (reservationButton) {
            reservationButton.disabled = true;
        }
        let successCount = 0;
        let failureCount = 0;
        const results = [];
        // オーバーレイ表示後に初期モード取得（UI構築完了後）
        await new Promise(resolve => setTimeout(resolve, 100)); // DOM構築待機
        console.log(`🎯 順次実行開始`);
        // 実行処理（循環対応）
        let cycleCount = 0;
        while (successCount === 0) {
            cycleCount++;
            console.log(`🔄 循環 ${cycleCount} 回目開始`);
            for (let i = 0; i < sortedTimeSlots.length; i++) {
                const currentSlot = sortedTimeSlots[i];
                const { pavilionId, timeSlot } = currentSlot;
                try {
                    // オーバーレイの進行状況を更新
                    this.updateSequentialOverlay(i + 1, sortedTimeSlots.length, pavilionId, timeSlot.time, cycleCount);
                    // 各予約実行前にモードを確認（リアルタイム切り替え）
                    const currentMode = this.getCurrentMode();
                    let result;
                    if (currentMode === 'monitoring') {
                        // 監視モード：全対象を並列チェック
                        const availableSlot = await this.checkAllSlotsAvailability(sortedTimeSlots, selectedTickets);
                        if (availableSlot) {
                            console.log(`✅ 空きを検出！予約実行: ${availableSlot.pavilionId} ${availableSlot.timeSlot.time}`);
                            const registeredChannel = this.getRegisteredChannelFromSelection();
                            const entranceDate = this.getSearchParameters().entranceDate;
                            if (!entranceDate) {
                                throw new Error('入場日が選択されていません');
                            }
                            result = await this.pavilionManager.makeReservation(availableSlot.pavilionId, availableSlot.timeSlot, selectedTickets, entranceDate, registeredChannel);
                            // 監視モードでは最初に見つかった空きで予約実行後、結果に関わらず終了
                            results.push({
                                success: result.success,
                                pavilionId: availableSlot.pavilionId,
                                timeSlot: availableSlot.timeSlot.time,
                                message: result.message
                            });
                            if (result.success) {
                                successCount++;
                            }
                            else {
                                failureCount++;
                            }
                            break; // forループを抜けて次の循環へ
                        }
                        else {
                            console.log(`⏳ 監視継続: 全対象で空きなし`);
                            break; // forループを抜けて次の循環へ
                        }
                    }
                    else {
                        // 予約モード：直接予約実行
                        const registeredChannel = this.getRegisteredChannelFromSelection();
                        const entranceDate = this.getSearchParameters().entranceDate;
                        if (!entranceDate) {
                            throw new Error('入場日が選択されていません');
                        }
                        result = await this.pavilionManager.makeReservation(pavilionId, timeSlot, selectedTickets, entranceDate, registeredChannel);
                    }
                    results.push({
                        success: result.success,
                        pavilionId,
                        timeSlot: timeSlot.time,
                        message: result.message
                    });
                    if (result.success) {
                        successCount++;
                        console.log(`✅ 予約成功 ${i + 1}/${sortedTimeSlots.length}: ${pavilionId} ${timeSlot.time}`);
                        // 成功時は即座に終了（最初に成功した予約を取る）
                        this.showSequentialReservationResult(results, successCount, failureCount);
                        return;
                    }
                    else {
                        failureCount++;
                        console.log(`❌ 予約失敗 ${i + 1}/${sortedTimeSlots.length}: ${pavilionId} ${timeSlot.time} - ${result.message}`);
                    }
                    // 間隔調整（動的取得・180回制限チェック）
                    let currentInterval = this.getCurrentInterval();
                    // 高速間隔の180回制限チェック（モード別・リアルタイム判定）
                    const currentIntervalMode = this.getCurrentMode();
                    if (currentIntervalMode === 'monitoring') {
                        // 監視モード：5,15秒間隔の制限
                        if ((currentInterval === 5 || currentInterval === 15) && this.attemptCount >= this.FAST_INTERVAL_LIMIT) {
                            console.log(`⚠️ 監視モード ${currentInterval}秒間隔の180回制限に達しました。30秒間隔に自動変更します。`);
                            currentInterval = 30;
                            this.updateIntervalDropdown(30);
                        }
                    }
                    else {
                        // 予約モード：1,5秒間隔の制限
                        if ((currentInterval === 1 || currentInterval === 5) && this.attemptCount >= this.FAST_INTERVAL_LIMIT) {
                            console.log(`⚠️ 予約モード ${currentInterval}秒間隔の180回制限に達しました。15秒間隔に自動変更します。`);
                            currentInterval = 15;
                            this.updateIntervalDropdown(15);
                        }
                    }
                    this.attemptCount++;
                    await this.waitWithCountdown(currentInterval);
                }
                catch (error) {
                    failureCount++;
                    results.push({
                        success: false,
                        pavilionId,
                        timeSlot: timeSlot.time,
                        message: String(error)
                    });
                    console.error(`❌ 予約エラー ${i + 1}/${sortedTimeSlots.length}: ${pavilionId} ${timeSlot.time}`, error);
                }
            }
        }
        // 全て失敗した場合の結果表示
        this.showSequentialReservationResult(results, successCount, failureCount);
    }
    /**
     * タイムスタンプ順でソート（選択順序を保持）
     */
    sortTimeSlotsByTimestamp(timeSlots) {
        return timeSlots.map(slot => {
            // DOM要素からタイムスタンプを取得
            const button = this.mainDialogContainer?.querySelector(`.ytomo-time-slot-button[data-pavilion-id="${slot.pavilionId}"][data-time="${slot.timeSlot.time}"]`);
            const timestamp = button?.getAttribute('data-time-selected');
            return {
                ...slot,
                timestamp: timestamp ? parseInt(timestamp) : 0
            };
        }).sort((a, b) => a.timestamp - b.timestamp);
    }
    /**
     * 現在の間隔設定を取得
     */
    getCurrentInterval() {
        const dropdown = document.getElementById('ytomo-interval-select');
        return dropdown ? parseInt(dropdown.value) : 15;
    }
    /**
     * 間隔ドロップダウンを更新
     */
    updateIntervalDropdown(seconds) {
        const dropdown = document.getElementById('ytomo-interval-select');
        if (dropdown) {
            dropdown.value = seconds.toString();
        }
    }
    /**
     * 待機処理（カウントダウン付き）
     */
    async waitWithCountdown(seconds) {
        for (let i = seconds; i > 0; i--) {
            this.updateSequentialOverlayCountdown(i);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
    /**
     * 順次予約オーバーレイを表示
     */
    showSequentialReservationOverlay(totalCount) {
        this.hideProcessingOverlay();
        const overlay = document.createElement('div');
        overlay.id = 'ytomo-sequential-overlay';
        overlay.className = 'ytomo-sequential-overlay';
        overlay.innerHTML = `
            <div class="ytomo-sequential-content">
                <h3>順次予約実行中</h3>
                <div class="ytomo-sequential-settings">
                    <div class="ytomo-mode-selection">
                        <label>実行モード:</label>
                        <div class="ytomo-mode-buttons">
                            <button id="ytomo-reservation-mode" class="ytomo-mode-button active">予約モード</button>
                            <button id="ytomo-monitoring-mode" class="ytomo-mode-button">監視モード</button>
                        </div>
                    </div>
                    <div class="ytomo-interval-setting">
                        <label for="ytomo-interval-select">実行間隔:</label>
                        <select id="ytomo-interval-select" class="ytomo-interval-dropdown">
                            <option value="1">1秒</option>
                            <option value="5">5秒</option>
                            <option value="15" selected>15秒</option>
                            <option value="30">30秒</option>
                            <option value="60">60秒</option>
                        </select>
                    </div>
                </div>
                <div class="ytomo-sequential-progress">
                    <div class="ytomo-sequential-current">1/${totalCount}</div>
                    <div class="ytomo-sequential-target">準備中...</div>
                    <div class="ytomo-sequential-countdown"></div>
                </div>
                <div class="ytomo-sequential-controls">
                    <button id="ytomo-cancel-sequential" class="ytomo-cancel-button">キャンセル</button>
                </div>
            </div>
        `;
        overlay.style.zIndex = '10002';
        // イベントリスナー設定
        overlay.addEventListener('click', (e) => {
            const target = e.target;
            if (target.id === 'ytomo-cancel-sequential') {
                this.cancelSequentialReservation();
            }
            else if (target.id === 'ytomo-reservation-mode' || target.id === 'ytomo-monitoring-mode') {
                this.handleModeSwitch(target);
            }
            e.preventDefault();
            e.stopPropagation();
        });
        document.body.appendChild(overlay);
    }
    /**
     * 実行モード切り替え
     */
    handleModeSwitch(targetButton) {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (!overlay)
            return;
        const allModeButtons = overlay.querySelectorAll('.ytomo-mode-button');
        allModeButtons.forEach(btn => btn.classList.remove('active'));
        targetButton.classList.add('active');
        // モードに応じて間隔選択肢を更新
        this.updateIntervalOptionsForMode(targetButton.id === 'ytomo-monitoring-mode');
        // ヘッダーテキストを更新
        const header = overlay.querySelector('h3');
        if (header) {
            header.textContent = targetButton.id === 'ytomo-monitoring-mode' ? '監視モード実行中' : '順次予約実行中';
        }
    }
    /**
     * 現在の実行モードを取得
     */
    getCurrentMode() {
        const monitoringButton = document.getElementById('ytomo-monitoring-mode');
        const reservationButton = document.getElementById('ytomo-reservation-mode');
        console.log('🔍 モード判定デバッグ:');
        console.log('  - 監視ボタン存在:', !!monitoringButton);
        console.log('  - 監視ボタンactive:', monitoringButton?.classList.contains('active'));
        console.log('  - 予約ボタン存在:', !!reservationButton);
        console.log('  - 予約ボタンactive:', reservationButton?.classList.contains('active'));
        const mode = monitoringButton?.classList.contains('active') ? 'monitoring' : 'reservation';
        console.log('  - 判定結果:', mode);
        return mode;
    }
    /**
     * モードに応じて間隔選択肢を更新
     */
    updateIntervalOptionsForMode(isMonitoring) {
        const dropdown = document.getElementById('ytomo-interval-select');
        if (!dropdown)
            return;
        const currentValue = dropdown.value;
        dropdown.innerHTML = '';
        if (isMonitoring) {
            // 監視モード：5,15,30,60秒
            dropdown.innerHTML = `
                <option value="5">5秒</option>
                <option value="15">15秒</option>
                <option value="30">30秒</option>
                <option value="60">60秒</option>
            `;
            // 現在の値が利用可能なら維持、なければデフォルト15秒
            dropdown.value = ['5', '15', '30', '60'].includes(currentValue) ? currentValue : '15';
        }
        else {
            // 予約モード：1,5,15,30,60秒
            dropdown.innerHTML = `
                <option value="1">1秒</option>
                <option value="5">5秒</option>
                <option value="15">15秒</option>
                <option value="30">30秒</option>
                <option value="60">60秒</option>
            `;
            dropdown.value = currentValue || '15';
        }
    }
    /**
     * 全監視対象の空き状況を並列チェック（監視モード用）
     */
    async checkAllSlotsAvailability(timeSlots, selectedTickets) {
        try {
            const entranceDate = this.getSearchParameters().entranceDate;
            if (!entranceDate) {
                console.warn('入場日が選択されていません');
                return null;
            }
            const ticketIds = selectedTickets.map(t => t.ticket_id);
            // 監視対象のパビリオンIDsを抽出
            const pavilionIds = [...new Set(timeSlots.map(slot => slot.pavilionId))];
            console.log(`🔍 並列監視チェック開始: ${pavilionIds.length}件のパビリオン`);
            // 並列で全パビリオンの時間帯情報を取得
            const pavilionChecks = pavilionIds.map(async (pavilionId) => {
                try {
                    const apiTimeSlots = await this.pavilionManager.getPavilionTimeSlots(pavilionId, ticketIds, entranceDate);
                    return { pavilionId, apiTimeSlots };
                }
                catch (error) {
                    console.warn(`⚠️ パビリオン${pavilionId}の取得エラー:`, error);
                    return { pavilionId, apiTimeSlots: [] };
                }
            });
            const results = await Promise.all(pavilionChecks);
            // 監視対象の時間帯で空きがあるかチェック
            for (const monitoringSlot of timeSlots) {
                const pavilionResult = results.find(r => r.pavilionId === monitoringSlot.pavilionId);
                if (!pavilionResult)
                    continue;
                const targetSlot = pavilionResult.apiTimeSlots.find(slot => slot.time === monitoringSlot.timeSlot.time);
                if (targetSlot?.available) {
                    console.log(`✅ 空き発見: ${monitoringSlot.pavilionId} ${monitoringSlot.timeSlot.time}`);
                    return { pavilionId: monitoringSlot.pavilionId, timeSlot: monitoringSlot.timeSlot };
                }
            }
            console.log(`⏳ 全対象で空きなし`);
            return null;
        }
        catch (error) {
            console.warn('⚠️ 並列監視チェックエラー:', error);
            return null;
        }
    }
    /**
     * 順次予約をキャンセル
     */
    cancelSequentialReservation() {
        this.hideSequentialOverlay();
        this.showReservationResult('順次予約をキャンセルしました', 'info');
    }
    /**
     * 順次予約オーバーレイのカウントダウン更新
     */
    updateSequentialOverlayCountdown(seconds) {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (!overlay)
            return;
        const countdownDiv = overlay.querySelector('.ytomo-sequential-countdown');
        if (countdownDiv) {
            countdownDiv.textContent = `次まで ${seconds} 秒`;
        }
    }
    /**
     * 順次予約オーバーレイの進捗更新（旧名：updateSequentialOverlay）
     */
    updateSequentialOverlay(current, total, pavilionId, timeSlot, cycleCount = 1) {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (!overlay)
            return;
        const currentDiv = overlay.querySelector('.ytomo-sequential-current');
        const targetDiv = overlay.querySelector('.ytomo-sequential-target');
        if (currentDiv)
            currentDiv.textContent = `循環${cycleCount}回目: ${current}/${total}`;
        if (targetDiv) {
            const pavilionName = this.lastSearchResults.find(p => p.id === pavilionId)?.name || pavilionId;
            targetDiv.textContent = `${pavilionName} ${this.formatTime(timeSlot)}`;
        }
    }
    /**
     * 順次予約結果表示
     */
    showSequentialReservationResult(results, successCount, failureCount) {
        this.hideSequentialOverlay();
        if (successCount > 0) {
            const successResult = results.find(r => r.success);
            this.showReservationResult('予約成功', 'success');
            // ステータスFAB更新
            const pavilionName = this.lastSearchResults.find(p => p.id === successResult.pavilionId)?.name || successResult.pavilionId;
            const entranceDate = this.getSearchParameters().entranceDate;
            const dateTimeInfo = entranceDate ? `${this.formatDate(entranceDate)} ${this.formatTime(successResult.timeSlot)}` : '日時不明';
            const statusFab = this.mainDialogContainer?.querySelector('.ytomo-status-fab');
            if (statusFab) {
                statusFab.className = 'ytomo-status-fab success';
                statusFab.innerHTML = `
                    <div>予約成功</div>
                    <div>${pavilionName}</div>
                    <div>${dateTimeInfo}</div>
                `;
            }
        }
        else {
            this.showReservationResult(`全て失敗 (${failureCount}件)`, 'error');
        }
    }
    /**
     * 順次予約オーバーレイを非表示
     */
    hideSequentialOverlay() {
        const overlay = document.getElementById('ytomo-sequential-overlay');
        if (overlay) {
            overlay.remove();
        }
    }
    /**
     * パビリオン一覧を表示
     */
    displayPavilions(pavilions) {
        const container = this.mainDialogContainer?.querySelector('#pavilion-list-container');
        if (!container)
            return;
        if (pavilions.length === 0) {
            container.innerHTML = `
                <div class="ytomo-empty-state">
                    <p>パビリオンが見つかりませんでした</p>
                </div>
            `;
            return;
        }
        // オーバーレイを非表示
        this.hideProcessingOverlay();
        container.innerHTML = pavilions.map(pavilion => `
            <div class="ytomo-pavilion-item ${pavilion.dateStatus === 2 ? 'full-pavilion' : ''}" data-pavilion-id="${pavilion.id}">
                <div class="ytomo-pavilion-header">
                    <button class="ytomo-star-button ${pavilion.isFavorite ? 'favorite' : ''}" 
                            data-pavilion-id="${pavilion.id}" data-pavilion-name="${pavilion.name}">
                        ${pavilion.isFavorite ? '⭐' : '☆'}
                    </button>
                    <label class="ytomo-pavilion-checkbox-container">
                        <input type="checkbox" class="ytomo-pavilion-checkbox" data-pavilion-id="${pavilion.id}">
                    </label>
                    <span class="ytomo-pavilion-name">${pavilion.name}</span>
                    <button class="ytomo-expand-button" data-pavilion-id="${pavilion.id}">
                        ▼
                    </button>
                </div>
                <div class="ytomo-time-slots" id="time-slots-${pavilion.id}">
                    ${this.buildTimeSlotButtons(pavilion.timeSlots, pavilion.id)}
                </div>
            </div>
        `).join('');
        // イベントリスナーを設定
        this.setupPavilionItemEventListeners(container);
    }
    /**
     * 時間帯ボタンを構築
     */
    buildTimeSlotButtons(timeSlots, pavilionId) {
        // 時間帯を数値順でソート
        const sortedTimeSlots = [...timeSlots].sort((a, b) => {
            const timeA = parseInt(a.time);
            const timeB = parseInt(b.time);
            return timeA - timeB;
        });
        // 選択されている入場日の律速時間を取得
        const selectedDates = this.getSelectedEntranceDates();
        let latestEntranceTime = null;
        if (selectedDates.length === 1) {
            latestEntranceTime = this.ticketManager.getLatestEntranceTime(selectedDates[0]);
        }
        return sortedTimeSlots.map(slot => {
            const startTime = this.formatTime(slot.time);
            const endTime = slot.endTime ? this.formatTime(slot.endTime) : '';
            const timeDisplay = endTime ? `${startTime} - ${endTime}` : startTime;
            // 律速時間チェック：開始時間が律速時間以前の場合はdisabled
            let isDisabledByEntranceTime = false;
            if (latestEntranceTime) {
                const slotStartTime = this.formatTime(slot.time); // HH:MM形式
                isDisabledByEntranceTime = slotStartTime <= latestEntranceTime;
            }
            const disabledClass = isDisabledByEntranceTime ? 'rate-limited' : '';
            const disabledAttr = isDisabledByEntranceTime ? 'disabled' : '';
            return `
                <button class="ytomo-time-slot-button ${slot.available ? 'available' : 'unavailable'} ${slot.selected ? 'selected' : ''} ${disabledClass}"
                        data-pavilion-id="${pavilionId}"
                        data-time="${slot.time}"
                        ${disabledAttr}>
                    ${timeDisplay}
                </button>
            `;
        }).join('');
    }
    /**
     * 時間を「HH:MM」形式にフォーマット
     */
    formatTime(time) {
        if (!time)
            return '';
        // 4桁の数値文字列（例：1100）を「11:00」形式に変換
        if (/^\d{4}$/.test(time)) {
            const hours = time.substring(0, 2);
            const minutes = time.substring(2, 4);
            return `${hours}:${minutes}`;
        }
        // 既に「HH:MM」形式の場合はそのまま返す
        return time;
    }
    /**
     * パビリオン項目のイベントリスナーを設定
     */
    setupPavilionItemEventListeners(container) {
        // お気に入りボタン
        const starButtons = container.querySelectorAll('.ytomo-star-button');
        starButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const pavilionId = target.dataset['pavilionId'];
                const pavilionName = target.dataset['pavilionName'];
                if (pavilionId && pavilionName) {
                    this.toggleFavorite(pavilionId, pavilionName, target);
                }
            });
        });
        // パビリオンチェックボックス
        const pavilionCheckboxes = container.querySelectorAll('.ytomo-pavilion-checkbox');
        pavilionCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const target = e.target;
                const pavilionId = target.dataset['pavilionId'];
                if (pavilionId) {
                    this.handlePavilionCheckboxChange(pavilionId, target.checked);
                }
            });
        });
        // 時間帯ボタン
        const timeSlotButtons = container.querySelectorAll('.ytomo-time-slot-button');
        timeSlotButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const pavilionId = target.dataset['pavilionId'];
                const time = target.dataset['time'];
                if (pavilionId && time) {
                    this.selectTimeSlot(pavilionId, time, target);
                }
            });
        });
        // 展開ボタン
        const expandButtons = container.querySelectorAll('.ytomo-expand-button');
        expandButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const target = e.target;
                const pavilionId = target.dataset['pavilionId'];
                if (pavilionId) {
                    this.toggleTimeSlotDisplay(pavilionId, target);
                }
            });
        });
    }
    /**
     * お気に入り切り替え
     */
    toggleFavorite(pavilionId, pavilionName, button) {
        const isFavorite = button.classList.contains('favorite');
        if (isFavorite) {
            this.pavilionManager.removeFromFavorites(pavilionId);
            button.classList.remove('favorite');
            button.textContent = '☆';
        }
        else {
            this.pavilionManager.addToFavorites(pavilionId, pavilionName);
            button.classList.add('favorite');
            button.textContent = '⭐';
        }
    }
    /**
     * 時間帯選択
     */
    selectTimeSlot(pavilionId, time, button) {
        const isSelected = button.classList.contains('selected');
        // 時間帯情報を構築
        const timeSlot = {
            time: time,
            available: !button.disabled,
            selected: !isSelected,
            reservationType: '' // TODO: 実際の予約種類を取得
        };
        // パビリオンマネージャーで選択状態を更新
        this.pavilionManager.selectTimeSlot(pavilionId, timeSlot);
        // UI更新とタイムスタンプ記録
        if (isSelected) {
            // 選択解除：クラスとタイムスタンプ属性を削除
            button.classList.remove('selected');
            button.removeAttribute('data-time-selected');
        }
        else {
            // 選択：クラス追加とタイムスタンプ記録
            button.classList.add('selected');
            const currentTimestamp = Math.floor(Date.now() / 1000);
            button.setAttribute('data-time-selected', currentTimestamp.toString());
        }
        // 選択情報とボタン状態を更新
        this.updateSelectedInfo();
        this.updateReservationButton();
    }
    /**
     * パビリオンチェックボックス変更時の処理
     */
    handlePavilionCheckboxChange(pavilionId, isChecked) {
        const timeSlotContainer = this.mainDialogContainer?.querySelector(`#time-slots-${pavilionId}`);
        if (!timeSlotContainer)
            return;
        const timeSlotButtons = timeSlotContainer.querySelectorAll('.ytomo-time-slot-button');
        if (isChecked) {
            // チェック時：全ての時間帯を昇順で選択し、昇順タイムスタンプを付与
            let baseTimestamp = Math.floor(Date.now() / 1000);
            // 時間帯ボタンを時間順にソート
            const sortedButtons = Array.from(timeSlotButtons).sort((a, b) => {
                const timeA = parseInt(a.dataset['time'] || '0');
                const timeB = parseInt(b.dataset['time'] || '0');
                return timeA - timeB;
            });
            sortedButtons.forEach((button, index) => {
                if (!button.disabled) { // rate-limitedでない場合のみ選択
                    const time = button.dataset['time'];
                    if (time) {
                        // UI更新
                        button.classList.add('selected');
                        // 昇順タイムスタンプ（1秒刻み）
                        const timestamp = baseTimestamp + index;
                        button.setAttribute('data-time-selected', timestamp.toString());
                        // パビリオンマネージャーに通知
                        const timeSlot = {
                            time: time,
                            available: !button.classList.contains('unavailable'),
                            selected: true,
                            reservationType: ''
                        };
                        this.pavilionManager.selectTimeSlot(pavilionId, timeSlot);
                    }
                }
            });
        }
        else {
            // チェック解除時：全ての時間帯を解除
            timeSlotButtons.forEach(button => {
                const time = button.dataset['time'];
                if (time) {
                    // UI更新
                    button.classList.remove('selected');
                    button.removeAttribute('data-time-selected');
                    // パビリオンマネージャーに通知
                    const timeSlot = {
                        time: time,
                        available: !button.classList.contains('unavailable'),
                        selected: false,
                        reservationType: ''
                    };
                    this.pavilionManager.selectTimeSlot(pavilionId, timeSlot);
                }
            });
        }
        // 選択情報とボタン状態を更新
        this.updateSelectedInfo();
        this.updateReservationButton();
    }
    /**
     * 時間帯表示切り替え
     */
    toggleTimeSlotDisplay(pavilionId, button) {
        const timeSlotsContainer = this.mainDialogContainer?.querySelector(`#time-slots-${pavilionId}`);
        if (!timeSlotsContainer)
            return;
        const isExpanded = button.classList.contains('expanded');
        if (isExpanded) {
            timeSlotsContainer.classList.add('hidden');
            button.classList.remove('expanded');
            button.textContent = '▼';
        }
        else {
            timeSlotsContainer.classList.remove('hidden');
            button.classList.add('expanded');
            button.textContent = '▲';
        }
    }
    /**
     * 選択情報を更新
     */
    updateSelectedInfo() {
        const selectedInfo = this.mainDialogContainer?.querySelector('#selected-info');
        if (selectedInfo) {
            const parts = [];
            // 選択入場日表示は削除
            // 選択時間帯表示は削除（ステータスFABで表示）
            selectedInfo.textContent = parts.length > 0 ? parts.join(' | ') : '';
        }
        // パビリオンタブの選択入場日も更新
        this.updatePavilionTabSelectedDates();
    }
    /**
     * 予約ボタン状態を更新
     */
    updateReservationButton() {
        const reservationButton = this.mainDialogContainer?.querySelector('#reservation-button');
        const selectedTimeSlots = this.pavilionManager.getSelectedTimeSlots();
        const selectedTickets = this.ticketManager.getSelectedTickets();
        if (reservationButton) {
            const canReserve = selectedTimeSlots.length > 0 && selectedTickets.length > 0;
            reservationButton.disabled = !canReserve;
        }
    }
    /**
     * パビリオンローディング表示
     */
    showPavilionLoading(message) {
        const container = this.mainDialogContainer?.querySelector('#pavilion-list-container');
        console.log('🔄 showPavilionLoading:', message, 'container found:', !!container);
        if (container) {
            container.innerHTML = `
                <div class="ytomo-loading">
                    <p>${message}</p>
                </div>
            `;
        }
        // 誤操作防止オーバーレイも表示
        this.showProcessingOverlay(message);
    }
    /**
     * 誤操作防止オーバーレイを表示
     */
    showProcessingOverlay(message) {
        // 既存のオーバーレイを削除
        this.hideProcessingOverlay();
        const overlay = document.createElement('div');
        overlay.id = 'ytomo-main-dialog-overlay';
        overlay.className = 'ytomo-processing-overlay';
        overlay.innerHTML = `
            <div class="ytomo-processing-content">
                <div class="ytomo-processing-spinner"></div>
                <div class="ytomo-processing-message">${message}</div>
            </div>
        `;
        // ダイアログより上のz-indexで表示
        overlay.style.zIndex = '10001';
        // クリックをブロック
        overlay.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
        });
        document.body.appendChild(overlay);
    }
    /**
     * 誤操作防止オーバーレイを非表示
     */
    hideProcessingOverlay() {
        const existingOverlay = document.getElementById('ytomo-main-dialog-overlay');
        if (existingOverlay) {
            existingOverlay.remove();
        }
    }
    /**
     * パビリオンエラー表示
     */
    showPavilionError(message) {
        const container = this.mainDialogContainer?.querySelector('#pavilion-list-container');
        if (container) {
            container.innerHTML = `
                <div class="ytomo-error">
                    <p>${message}</p>
                </div>
            `;
        }
        // オーバーレイを非表示
        this.hideProcessingOverlay();
    }
    /**
     * 予約結果表示
     */
    showReservationResult(message, type) {
        console.log('🔍 予約結果表示:', message, type);
        const statusFab = document.querySelector('#status-fab');
        console.log('🔍 ステータスFAB要素:', statusFab);
        if (!statusFab) {
            console.warn('⚠️ #status-fab要素が見つかりません');
            return;
        }
        // 現在選択された時間帯情報を取得
        const selectedTimeSlots = this.pavilionManager.getSelectedTimeSlots();
        let pavilionName = '';
        let dateTimeInfo = '';
        if (selectedTimeSlots.length > 0) {
            const { pavilionId, timeSlot } = selectedTimeSlots[0];
            const pavilion = this.pavilionManager.getAllPavilions().find(p => p.id === pavilionId);
            pavilionName = pavilion?.name || pavilionId;
            // 日付と時間情報を取得
            const { entranceDate } = this.getSearchParameters();
            const formattedDate = entranceDate ? `${entranceDate.slice(4, 6)}/${entranceDate.slice(6, 8)}` : '';
            const formattedTime = timeSlot.time ? `${timeSlot.time.slice(0, 2)}:${timeSlot.time.slice(2)}` : '';
            dateTimeInfo = `${formattedDate} ${formattedTime}`;
        }
        // ステータスFABに3行構成で表示
        statusFab.style.display = 'flex';
        statusFab.className = `ytomo-status-fab ${type}`;
        statusFab.innerHTML = `
            <div>${message}</div>
            <div>${pavilionName}</div>
            <div>${dateTimeInfo}</div>
        `;
        console.log('🔍 ステータスFAB設定:', statusFab.className, message, pavilionName, dateTimeInfo);
        // 5秒後に自動非表示
        setTimeout(() => {
            statusFab.style.display = 'none';
            statusFab.className = 'ytomo-status-fab';
        }, 5000);
    }
    /**
     * パビリオンタブの選択入場日を更新
     */
    updatePavilionTabSelectedDates() {
        const tabDates = this.mainDialogContainer?.querySelector('#pavilion-tab-dates');
        // 選択された入場予約ボタンの日付を取得
        const selectedDates = new Set();
        // 複数のセレクタでチェック
        const selectors = [
            '.ytomo-entrance-date-btn.selected',
            '.ytomo-entrance-date-button.selected',
            '[data-date].selected'
        ];
        let selectedEntranceButtons;
        for (const selector of selectors) {
            selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll(selector);
            if (selectedEntranceButtons && selectedEntranceButtons.length > 0) {
                console.log(`🔍 入場予約ボタン発見: ${selector}, 件数: ${selectedEntranceButtons.length}`);
                break;
            }
        }
        if (!selectedEntranceButtons || selectedEntranceButtons.length === 0) {
            console.log(`⚠️ 選択済み入場予約ボタンが見つかりません`);
        }
        selectedEntranceButtons?.forEach(button => {
            const date = button.dataset['date'];
            console.log(`🔍 ボタンの日付データ:`, date);
            if (date) {
                selectedDates.add(date);
            }
        });
        const dateStr = selectedDates.size > 0 ?
            Array.from(selectedDates).map(date => this.formatDate(date)).join(', ') : '';
        // 律速時間（最も遅い入場時間）を取得
        let rateTimeStr = '';
        if (selectedDates.size === 1) {
            const targetDate = Array.from(selectedDates)[0];
            const latestTime = this.ticketManager.getLatestEntranceTime(targetDate);
            if (latestTime) {
                rateTimeStr = ` ${latestTime}`;
            }
        }
        // タブボタン下半分の表示（日付 + 律速時間）
        if (tabDates) {
            tabDates.textContent = dateStr + rateTimeStr;
        }
        console.log(`🗓️ パビリオンタブ日付更新: ${dateStr}`);
    }
    /**
     * 選択されている入場日付を取得
     */
    getSelectedEntranceDates() {
        const selectedDates = [];
        // 複数のセレクタでチェック
        const selectors = [
            '.ytomo-entrance-date-btn.selected',
            '.ytomo-entrance-date-button.selected',
            '[data-date].selected'
        ];
        let selectedEntranceButtons;
        for (const selector of selectors) {
            selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll(selector);
            if (selectedEntranceButtons && selectedEntranceButtons.length > 0) {
                break;
            }
        }
        selectedEntranceButtons?.forEach(button => {
            const date = button.dataset['date'];
            if (date) {
                selectedDates.push(date);
            }
        });
        return selectedDates;
    }
    /**
     * パビリオンタブのイベントリスナーを設定
     */
    setupPavilionTabEvents() {
        // 検索ボタン
        const searchButton = this.mainDialogContainer?.querySelector('#search-button');
        if (searchButton) {
            searchButton.addEventListener('click', () => this.handlePavilionSearch());
        }
        // フィルターボタン（空きのみ表示）
        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        if (filterButton) {
            filterButton.addEventListener('click', () => this.toggleAvailableOnlyFilter());
        }
        // 更新ボタン
        const refreshButton = this.mainDialogContainer?.querySelector('#refresh-button');
        if (refreshButton) {
            refreshButton.addEventListener('click', () => this.handleRefreshAllPavilions());
        }
        // お気に入りボタン
        const favoritesButton = this.mainDialogContainer?.querySelector('#favorites-button');
        if (favoritesButton) {
            favoritesButton.addEventListener('click', () => this.handleLoadFavorites());
        }
        // 検索入力でEnterキー
        const searchInput = this.mainDialogContainer?.querySelector('#pavilion-search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.handlePavilionSearch();
                }
            });
        }
        console.log('🎪 パビリオンタブイベントリスナー設定完了');
    }
    /**
     * 検索パラメータを取得
     */
    getSearchParameters() {
        const searchInput = this.mainDialogContainer?.querySelector('#pavilion-search-input');
        const query = searchInput?.value.trim() || '';
        const selectedTickets = this.reactiveTicketManager.getSelectedTickets();
        const ticketIds = selectedTickets.map(t => t.ticket_id);
        // 選択された入場予約ボタンから日付を取得
        const selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-btn.selected, .ytomo-entrance-date-button.selected');
        let entranceDate;
        selectedEntranceButtons?.forEach(button => {
            const date = button.dataset['date'];
            if (date && !entranceDate) {
                entranceDate = date;
            }
        });
        return { query, ticketIds, entranceDate };
    }
    /**
     * 選択された入場予約から対応するregistered_channelを取得
     */
    getRegisteredChannelFromSelection() {
        const selectedEntranceButtons = this.mainDialogContainer?.querySelectorAll('.ytomo-entrance-date-button.selected');
        if (selectedEntranceButtons && selectedEntranceButtons.length > 0) {
            const button = selectedEntranceButtons[0];
            const availableTypes = button.dataset['availableTypes']?.split(',') || [];
            // 表示ラベルから実際のregistered_channelへのマッピング
            const channelMapping = {
                '1': '5', // 当日予約
                '3': '4', // 空き枠予約
                '週': '3', // 7日前抽選
                '月': '2' // 2ヶ月前抽選
            };
            // 優先順位順にチェック
            for (const type of ['1', '3', '週', '月']) {
                if (availableTypes.includes(type)) {
                    return channelMapping[type];
                }
            }
        }
        // デフォルト - 本来ここには来ないはず（入場予約が選択されていない状態での予約実行）
        console.warn('⚠️ 入場予約が選択されていないため、デフォルトchannel値を使用');
        return '4';
    }
    /**
     * パビリオン一覧を検索
     */
    async searchPavilionList(query, ticketIds, entranceDate) {
        console.log(`🔍 パビリオン一覧検索: クエリ="${query}", チケット数=${ticketIds.length}, 入場日=${entranceDate}`);
        const pavilions = await this.pavilionManager.searchPavilions(query, ticketIds, entranceDate);
        console.log(`✅ パビリオン一覧検索完了: ${pavilions.length}件`);
        return pavilions;
    }
    /**
     * パビリオンIDリストから時間帯情報を取得
     */
    async fetchTimeSlotsForPavilionIds(pavilionIds, ticketIds, entranceDate) {
        console.log(`🕐 時間帯情報取得開始: ${pavilionIds.length}件のパビリオン`);
        const timeSlotsMap = new Map();
        // 並列実行でパフォーマンス向上（最大5件同時）
        const concurrency = Math.min(5, pavilionIds.length);
        const chunks = [];
        for (let i = 0; i < pavilionIds.length; i += concurrency) {
            chunks.push(pavilionIds.slice(i, i + concurrency));
        }
        for (const chunk of chunks) {
            const promises = chunk.map(async (pavilionId) => {
                try {
                    const timeSlots = await this.pavilionManager.getPavilionTimeSlots(pavilionId, ticketIds, entranceDate);
                    timeSlotsMap.set(pavilionId, timeSlots);
                }
                catch (error) {
                    console.warn(`⚠️ パビリオン${pavilionId}の時間帯取得失敗:`, error);
                    timeSlotsMap.set(pavilionId, []);
                }
            });
            await Promise.all(promises);
        }
        console.log(`✅ 時間帯情報取得完了: ${timeSlotsMap.size}件`);
        return timeSlotsMap;
    }
    /**
     * パビリオンの時間帯情報を一括取得
     */
    async fetchPavilionTimeSlots(pavilions, ticketIds, entranceDate) {
        // 満員パビリオン（date_status: 2）は時間帯情報を取得しない
        const availablePavilionIds = pavilions
            .filter(p => p.dateStatus !== 2)
            .map(p => p.id);
        console.log(`⏰ 時間帯取得対象: ${availablePavilionIds.length}/${pavilions.length}件（満員除外）`);
        // pavilionIds->時間帯情報の関数を利用
        const timeSlotsMap = await this.fetchTimeSlotsForPavilionIds(availablePavilionIds, ticketIds, entranceDate);
        // 取得した時間帯情報をパビリオンオブジェクトに設定
        for (const pavilion of pavilions) {
            if (pavilion.dateStatus === 2) {
                pavilion.timeSlots = []; // 満員パビリオンは空配列
            }
            else {
                pavilion.timeSlots = timeSlotsMap.get(pavilion.id) || [];
            }
        }
    }
    /**
     * パビリオン検索を実行
     */
    async handlePavilionSearch() {
        try {
            this.showPavilionLoading('パビリオンを検索中...');
            const { query, ticketIds, entranceDate } = this.getSearchParameters();
            // パビリオン一覧を検索
            const pavilions = await this.searchPavilionList(query, ticketIds, entranceDate);
            // 各パビリオンの時間帯情報を取得
            console.log('⏳ 時間帯情報取得開始...');
            this.showPavilionLoading(`時間帯情報を取得中... (${pavilions.length}件)`);
            await this.fetchPavilionTimeSlots(pavilions, ticketIds, entranceDate);
            console.log(`🔍 パビリオン検索完了: ${pavilions.length}件（時間帯情報付き）`);
            // 検索結果を保存（全パビリオン - フィルタで制御）
            this.lastSearchResults = [...pavilions];
            // 全パビリオンを表示（ローディング表示を置き換える）
            console.log('📄 パビリオン表示開始...');
            this.displayPavilions(pavilions);
            // 空きパビリオン数を更新
            this.updateAvailableCount(pavilions);
            // 検索直後は空きのみフィルタを自動ON
            this.isAvailableOnlyFilterActive = true;
            // フィルタボタンのUI状態を更新
            this.updateFilterButtonUI();
            // Styleフィルターを適用
            this.applyStyleFilters();
            console.log(`✅ パビリオン検索完了: ${pavilions.length}件表示（フィルタで空きのみ）`);
            console.log(`💾 検索結果保存: ${this.lastSearchResults.length}件（全パビリオン）`);
        }
        catch (error) {
            console.error('❌ パビリオン検索エラー:', error);
            this.showPavilionError(`検索に失敗しました: ${error}`);
            this.showReservationResult(`❌ 検索に失敗しました: ${error}`, 'error');
        }
    }
    /**
     * 更新ボタン: 全パビリオンの時間帯情報を取得
     */
    async handleRefreshAllPavilions() {
        try {
            this.showPavilionLoading('パビリオン情報を更新中...');
            const { ticketIds, entranceDate } = this.getSearchParameters();
            // 既存の検索結果から全パビリオンIdを取得
            const allPavilionIds = this.lastSearchResults.map(p => p.id);
            const timeSlotsMap = await this.fetchTimeSlotsForPavilionIds(allPavilionIds, ticketIds, entranceDate);
            // 既存のパビリオンに時間帯情報を設定
            for (const pavilion of this.lastSearchResults) {
                pavilion.timeSlots = timeSlotsMap.get(pavilion.id) || [];
            }
            console.log(`🔄 全パビリオン更新: ${this.lastSearchResults.length}件（満員も含む）`);
            // 全パビリオンを表示
            this.displayPavilions(this.lastSearchResults);
            // 空きパビリオン数を更新
            this.updateAvailableCount(this.lastSearchResults);
            // フィルタは現在の状態を維持（自動ON/OFFしない）
            this.applyStyleFilters();
            console.log(`✅ 全パビリオン更新完了: ${this.lastSearchResults.length}件表示`);
            console.log(`💾 検索結果: ${this.lastSearchResults.length}件（満員も含む）`);
        }
        catch (error) {
            console.error('❌ パビリオン更新エラー:', error);
            this.showPavilionError(`更新に失敗しました: ${error}`);
            this.showReservationResult(`❌ 更新に失敗しました: ${error}`, 'error');
        }
    }
    /**
     * 空きのみフィルターを切り替え
     */
    toggleAvailableOnlyFilter() {
        this.isAvailableOnlyFilterActive = !this.isAvailableOnlyFilterActive;
        console.log(`📂 空きのみフィルター: ${this.isAvailableOnlyFilterActive ? 'ON' : 'OFF'}`);
        console.log(`🔽 フィルター${this.isAvailableOnlyFilterActive ? '有効化' : '無効化'}`);
        // フィルタボタンのUI状態を更新
        this.updateFilterButtonUI();
        this.applyStyleFilters();
    }
    /**
     * フィルタボタンのUI状態を更新
     */
    updateFilterButtonUI() {
        const filterButton = this.mainDialogContainer?.querySelector('#filter-button');
        if (filterButton) {
            if (this.isAvailableOnlyFilterActive) {
                filterButton.classList.add('active');
            }
            else {
                filterButton.classList.remove('active');
            }
        }
    }
    /**
     * StyleベースのフィルターをDOM要素に適用
     */
    applyStyleFilters() {
        const pavilionItems = this.mainDialogContainer?.querySelectorAll('.ytomo-pavilion-item');
        if (!pavilionItems)
            return;
        pavilionItems.forEach(item => {
            const pavilionElement = item;
            // 空きのみフィルター
            if (this.isAvailableOnlyFilterActive) {
                // 満員パビリオン（dateStatus = 2）を非表示
                if (pavilionElement.classList.contains('full-pavilion')) {
                    pavilionElement.classList.add('hidden');
                }
                else {
                    pavilionElement.classList.remove('hidden');
                }
                // 時間帯ボタンは全て表示（満員も押下可能）
                const timeSlotButtons = pavilionElement.querySelectorAll('.ytomo-time-slot-button');
                timeSlotButtons.forEach(button => {
                    button.classList.remove('hidden');
                });
            }
            else {
                // フィルタ無効時は全て表示
                pavilionElement.classList.remove('hidden');
                // 全時間帯ボタンを表示
                const timeSlotButtons = pavilionElement.querySelectorAll('.ytomo-time-slot-button');
                timeSlotButtons.forEach(button => {
                    button.classList.remove('hidden');
                });
            }
        });
        console.log(`🎨 Styleフィルター適用: 空きのみ=${this.isAvailableOnlyFilterActive}`);
    }
    /**
     * 空きパビリオン数を更新
     */
    updateAvailableCount(pavilions) {
        // DOM要素ベースで空きパビリオン数を計算
        const pavilionItems = this.mainDialogContainer?.querySelectorAll('.ytomo-pavilion-item');
        let availableCount = 0;
        pavilionItems?.forEach(item => {
            const hasAvailableSlots = item.querySelector('.ytomo-time-slot-button.available');
            if (hasAvailableSlots) {
                availableCount++;
            }
        });
        const countBadge = this.mainDialogContainer?.querySelector('#available-count');
        if (countBadge) {
            countBadge.textContent = availableCount.toString();
        }
        console.log(`📊 空きパビリオン数: ${availableCount}/${pavilions.length} (styleベース)`);
    }
    /**
     * クリーンアップ
     */
    cleanup() {
        this.hideMainDialog();
        // リアクティブシステムを破棄
        this.reactiveTicketManager?.destroy();
        if (this.ytFabButton) {
            this.ytFabButton.remove();
            this.ytFabButton = null;
        }
        console.log('🧹 メインダイアログFABクリーンアップ完了');
    }
}
// グローバルインスタンス
const mainDialogFab = new MainDialogFabImpl();
/**
 * メインダイアログFABシステムを初期化
 */
function initializeMainDialogFab() {
    mainDialogFab.initialize();
}
/**
 * メインダイアログの表示状態を取得
 */
function isMainDialogVisible() {
    return mainDialogVisible;
}

// EXTERNAL MODULE: ./ts/modules/entrance-reservation-state-manager.ts + 1 modules
var entrance_reservation_state_manager = __webpack_require__(79);
;// ./ts/modules/app-router.ts
/**
 * アプリケーションルーター - App Router
 *
 * 【責務】
 * - URLベースのページタイプ判定と適切なモジュール初期化
 * - 統一キャッシュ管理システムの初期化・依存注入
 * - FAB UIのライフサイクル管理（作成・クリーンアップ）
 * - ページ遷移時の状態管理システム同期
 *
 * 【アーキテクチャ】
 * - シングルトンエントリーポイント: main.tsから呼び出される
 * - 依存注入パターン: 各モジュールにキャッシュ管理を注入
 * - ライフサイクル管理: URL変更検知でページ移行を追跡
 *
 * @version v1.0.0 - 統一状態管理版
 * @architecture Module Router with Dependency Injection
 */
// ==================== モジュールインポート ====================
// パビリオン検索ページモジュール

// 入場予約ページ初期化モジュール

// FAB状態管理

// キャッシュ管理システム



 // カレンダー日付取得

// 同行者チケット機能モジュール

// メインダイアログFABモジュール

// 統一状態管理システム（アプリケーションの中核）

// ==================== グローバル変数・型定義 ====================
// ============================================================================
// メインアプリケーションルーターシステム - Section 8
// 【機能】
// - URLベースのページタイプ判定・モジュールルーティング
// - 統一キャッシュ管理システムの初期化・依存注入
// - ページ遷移時のFAB UIライフサイクル管理
// - モバイル対応のクリーンアップ処理
// ============================================================================
/**
 * 全FABをクリーンアップする統一関数
 * ページ遷移時に既存FABを削除してUI競合を防止
 *
 * 【削除対象】
 * - ytomo-fab-container: 入場予約FAB
 * - ytomo-pavilion-fab-container: パビリオン検索FAB
 * - ytomo-ticket-selection-fab-container: チケット選択FAB
 */
function cleanupAllFABs() {
    console.log('🧹 全FABクリーンアップ開始 - ページ遷移時のUI競合防止');
    // クリーンアップ対象のFAB IDリスト
    const fabSelectors = [
        'ytomo-fab-container', // 入場予約メインFAB
        'ytomo-pavilion-fab-container', // パビリオン検索FAB  
        'ytomo-ticket-selection-fab-container' // 同行者チケット選択FAB
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
/**
 * モバイルデバイス判定（簡易版）
 * UserAgentと画面幅の組み合わせでモバイル環境を検知
 *
 * 【用途】
 * - モバイル対応の遅延処理（DOM更新のタイミング調整）
 * - UIレスポンシブ対応の切り替え
 *
 * @returns true:モバイルデバイス、false:デスクトップ
 */
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (window.innerWidth <= 768); // タブレットサイズ以下をモバイル扱い
}
// cacheManagerの初期化
const cacheManager = createCacheManager({
    getCurrentSelectedCalendarDateFn: entrance_page_core/* getCurrentSelectedCalendarDate */.rY
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
        // 状態管理システム初期化
        isUnifiedStateManagerInitialized = true;
        console.log('✅ 入場予約状態管理システム初期化完了');
    }
    catch (error) {
        console.error('⚠️ 入場予約状態管理システム初期化エラー:', error);
    }
};
// entrance-page-ui、entrance-page-fabにcacheManagerを設定
(0,entrance_page_core/* setCacheManager */.S9)(cacheManager);
(0,entrance_page_core/* setCacheManagerForSection6 */.MM)(cacheManager);
(0,entrance_page_fab/* setCacheManagerForSection7 */.TP)(cacheManager);
// entrance-page-uiに必要な関数を注入
(0,entrance_page_core/* setEntranceReservationHelper */.XP)(entrance_page_fab/* entranceReservationHelper */.FX);
// 各モジュールで直接インポートを使用
// URL判定とページタイプ識別（共通utilityに移動）

// ページ遷移時の初期化トリガー
const trigger_init = (url_record) => {
    const page_type = (0,page_utils/* identify_page_type */.a)(url_record);
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
                    setPageLoadingStateFn: entrance_page_core/* setPageLoadingState */.ZK,
                    createEntranceReservationUIFn: entrance_page_fab/* createEntranceReservationUI */.DT,
                    restoreFromCacheFn: entrance_page_core/* restoreFromCache */.Zu
                });
                // 入場予約ページ初期化後に入場予約状態管理システムを初期化（動的待機）
                (0,entrance_page_fab/* waitForTimeSlotTable */.il)(() => {
                    initializeUnifiedStateManager();
                });
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
        // メインダイアログFAB初期化（全ページ共通）
        initializeMainDialogFab();
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
// 即座に早期オーバーレイをチェック（DOM構築前でも実行可能）
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

;// ./ts/modules/page-detector.ts
/**
 * ページ検知・判定モジュール
 * 万博予約サイトの各ページを識別し、適切な処理を決定
 */
// URL パターンの定義
const URL_PATTERNS = {
    RESERVATION_TIME: /\/event_time\/\?.*event_id=([^&]+)/,
    CONFIRMATION: /\/confirm\//,
    PAVILION_SEARCH: /\/pavilion\/search/
};
// DOM セレクター定義
const SELECTORS = {
    RESERVATION_TIME: {
        timeRadios: 'input[type="radio"][name="date_picker"]',
        submitButton: '.basic-btn.type2',
        titleElement: '.style_title__44y_b'
    },
    CONFIRMATION: {
        confirmButton: '.confirm-button',
        backButton: '.back-button'
    },
    PAVILION_SEARCH: {
        searchForm: '.search-form',
        pavilionList: '.pavilion-list'
    }
};
class PageDetector {
    constructor() {
        this.currentUrl = window.location.href;
        this.currentTitle = document.title;
    }
    /**
     * 現在のページタイプを検知
     */
    detectPageType() {
        const url = this.currentUrl;
        if (URL_PATTERNS.RESERVATION_TIME.test(url)) {
            return 'reservation_time';
        }
        if (URL_PATTERNS.CONFIRMATION.test(url)) {
            return 'confirmation';
        }
        if (URL_PATTERNS.PAVILION_SEARCH.test(url)) {
            return 'pavilion_search';
        }
        return 'unknown';
    }
    /**
     * 予約時間選択ページかどうか判定
     */
    isReservationPage() {
        return this.detectPageType() === 'reservation_time';
    }
    /**
     * 確認ページかどうか判定
     */
    isConfirmationPage() {
        return this.detectPageType() === 'confirmation';
    }
    /**
     * パビリオン検索ページかどうか判定
     */
    isPavilionSearchPage() {
        return this.detectPageType() === 'pavilion_search';
    }
    /**
     * ページ情報を抽出
     */
    extractPageInfo() {
        const pageType = this.detectPageType();
        const baseInfo = {
            type: pageType,
            url: this.currentUrl,
            isReady: false,
            title: this.currentTitle
        };
        switch (pageType) {
            case 'reservation_time':
                return {
                    ...baseInfo,
                    ...this.extractReservationPageInfo(),
                    isReady: this.checkReservationPageReady()
                };
            case 'confirmation':
                return {
                    ...baseInfo,
                    isReady: this.checkConfirmationPageReady()
                };
            case 'pavilion_search':
                return {
                    ...baseInfo,
                    isReady: this.checkPavilionSearchPageReady()
                };
            default:
                return baseInfo;
        }
    }
    /**
     * 予約ページから情報抽出
     */
    extractReservationPageInfo() {
        const urlMatch = this.currentUrl.match(URL_PATTERNS.RESERVATION_TIME);
        const pavilionCode = urlMatch ? urlMatch[1] : undefined;
        // URLパラメータからticket IDを抽出
        const urlParams = new URLSearchParams(window.location.search);
        const ticketId = urlParams.get('id') || undefined;
        return {
            pavilionCode,
            ticketId
        };
    }
    /**
     * 予約ページの準備状態をチェック
     */
    checkReservationPageReady() {
        const selectors = SELECTORS.RESERVATION_TIME;
        // 必要な要素が存在するかチェック
        const timeRadios = document.querySelectorAll(selectors.timeRadios);
        const submitButton = document.querySelector(selectors.submitButton);
        return timeRadios.length > 0 && submitButton !== null;
    }
    /**
     * 確認ページの準備状態をチェック
     */
    checkConfirmationPageReady() {
        const selectors = SELECTORS.CONFIRMATION;
        return document.querySelector(selectors.confirmButton) !== null;
    }
    /**
     * パビリオン検索ページの準備状態をチェック
     */
    checkPavilionSearchPageReady() {
        const selectors = SELECTORS.PAVILION_SEARCH;
        return document.querySelector(selectors.searchForm) !== null;
    }
    /**
     * ページが変更されたかチェック
     */
    hasPageChanged() {
        const currentUrl = window.location.href;
        const currentTitle = document.title;
        if (currentUrl !== this.currentUrl || currentTitle !== this.currentTitle) {
            this.currentUrl = currentUrl;
            this.currentTitle = currentTitle;
            return true;
        }
        return false;
    }
    /**
     * 指定されたページタイプになるまで待機
     */
    async waitForPageType(expectedType, timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            if (this.detectPageType() === expectedType) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return false;
    }
    /**
     * ページの準備完了まで待機
     */
    async waitForPageReady(timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const pageInfo = this.extractPageInfo();
            if (pageInfo.isReady) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        return false;
    }
    /**
     * デバッグ用: 現在のページ情報をログ出力
     */
    logPageInfo() {
        const pageInfo = this.extractPageInfo();
        console.group('📍 ページ情報');
        console.log('タイプ:', pageInfo.type);
        console.log('URL:', pageInfo.url);
        console.log('準備状態:', pageInfo.isReady);
        console.log('タイトル:', pageInfo.title);
        if (pageInfo.pavilionCode) {
            console.log('パビリオンコード:', pageInfo.pavilionCode);
        }
        if (pageInfo.ticketId) {
            console.log('チケットID:', pageInfo.ticketId);
        }
        console.groupEnd();
    }
}
// シングルトンインスタンス
let pageDetectorInstance = null;
/**
 * PageDetectorのシングルトンインスタンスを取得
 */
function getPageDetector() {
    if (!pageDetectorInstance) {
        pageDetectorInstance = new PageDetector();
    }
    return pageDetectorInstance;
}
/**
 * PageDetectorインスタンスをリセット（ページ変更時用）
 */
function resetPageDetector() {
    pageDetectorInstance = null;
}

;// ./ts/modules/dom-utils.ts
/**
 * DOM操作ユーティリティモジュール
 * 万博予約ページでの自動操作に必要なDOM操作を提供
 */
class DOMUtils {
    /**
     * 要素が表示されるまで待機
     */
    async waitForElement(selector, timeout = 10000, checkVisibility = true) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector);
            if (element) {
                // 可視性チェック
                if (!checkVisibility || this.isElementVisible(element)) {
                    return {
                        success: true,
                        element
                    };
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return {
            success: false,
            error: `要素が見つかりません: ${selector} (${timeout}ms)`
        };
    }
    /**
     * 複数要素が表示されるまで待機
     */
    async waitForElements(selectors, timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const results = selectors.map(selector => {
                const element = document.querySelector(selector);
                return element && this.isElementVisible(element);
            });
            if (results.every(result => result)) {
                return { success: true };
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return {
            success: false,
            error: `一部の要素が見つかりません: ${selectors.join(', ')}`
        };
    }
    /**
     * 要素の可視性をチェック
     */
    isElementVisible(element) {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' &&
            style.visibility !== 'hidden' &&
            style.opacity !== '0' &&
            element.offsetWidth > 0 &&
            element.offsetHeight > 0;
    }
    /**
     * 指定時間の時間枠を選択
     */
    async selectTimeSlot(timeSlot) {
        try {
            // 時間ラジオボタンを取得
            const radioButtons = document.querySelectorAll('input[type="radio"][name="date_picker"]');
            if (radioButtons.length === 0) {
                return {
                    success: false,
                    error: '時間選択ラジオボタンが見つかりません'
                };
            }
            // 利用可能な時間オプションを収集
            const availableOptions = [];
            let targetRadio = null;
            for (const radio of radioButtons) {
                const value = radio.value;
                availableOptions.push(value);
                // 指定時間と一致するかチェック
                if (value === timeSlot) {
                    targetRadio = radio;
                }
            }
            if (!targetRadio) {
                return {
                    success: false,
                    error: `指定時間が見つかりません: ${timeSlot}`,
                    availableOptions
                };
            }
            // ラジオボタンが無効でないかチェック
            if (targetRadio.disabled) {
                return {
                    success: false,
                    error: `指定時間は選択できません: ${timeSlot}`,
                    availableOptions
                };
            }
            // ラジオボタンを選択
            targetRadio.checked = true;
            // changeイベントを発火
            const changeEvent = new Event('change', { bubbles: true });
            targetRadio.dispatchEvent(changeEvent);
            // clickイベントも発火（一部サイトで必要）
            const clickEvent = new Event('click', { bubbles: true });
            targetRadio.dispatchEvent(clickEvent);
            console.log(`⏰ 時間選択完了: ${timeSlot}`);
            return {
                success: true,
                selectedTime: timeSlot,
                availableOptions
            };
        }
        catch (error) {
            return {
                success: false,
                error: `時間選択エラー: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * 申込ボタンをクリック
     */
    async clickSubmitButton() {
        try {
            // 複数の可能なセレクタを試行
            const selectors = [
                '.basic-btn.type2',
                'button[class*="reservation_next_link"]',
                '.style_reservation_next_link__7gOxy',
                'button:contains("申込")',
                'button:contains("次へ")'
            ];
            for (const selector of selectors) {
                const button = document.querySelector(selector);
                if (button && this.isElementVisible(button) && !button.disabled) {
                    // スクロールして表示
                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // 少し待機してからクリック
                    await new Promise(resolve => setTimeout(resolve, 500));
                    button.click();
                    console.log(`🔘 申込ボタンクリック: ${selector}`);
                    return {
                        success: true,
                        element: button
                    };
                }
            }
            return {
                success: false,
                error: '申込ボタンが見つからないか、クリックできません'
            };
        }
        catch (error) {
            return {
                success: false,
                error: `申込ボタンクリックエラー: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    /**
     * ページの読み込み完了をチェック
     */
    async checkPageReady(expectedSelectors = [], timeout = 10000) {
        // document.readyStateチェック
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve(void 0);
                }
                else {
                    window.addEventListener('load', () => resolve(void 0), { once: true });
                }
            });
        }
        // 特定の要素が存在するかチェック
        if (expectedSelectors.length > 0) {
            const result = await this.waitForElements(expectedSelectors, timeout);
            return result.success;
        }
        return true;
    }
    /**
     * ページタイトルの変更を待機
     */
    async waitForTitleChange(expectedTitle, timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const currentTitle = document.title;
            if (typeof expectedTitle === 'string') {
                if (currentTitle.includes(expectedTitle)) {
                    return true;
                }
            }
            else {
                if (expectedTitle.test(currentTitle)) {
                    return true;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return false;
    }
    /**
     * URLの変更を待機
     */
    async waitForUrlChange(expectedUrl, timeout = 10000) {
        const startTime = Date.now();
        while (Date.now() - startTime < timeout) {
            const currentUrl = window.location.href;
            if (typeof expectedUrl === 'string') {
                if (currentUrl.includes(expectedUrl)) {
                    return true;
                }
            }
            else {
                if (expectedUrl.test(currentUrl)) {
                    return true;
                }
            }
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        return false;
    }
    /**
     * 要素にテキストが含まれているかチェック
     */
    checkElementContainsText(element, text) {
        return element.textContent?.includes(text) ?? false;
    }
    /**
     * フォームの入力状態をチェック
     */
    checkFormValid(formSelector) {
        const form = document.querySelector(formSelector);
        return form ? form.checkValidity() : false;
    }
    /**
     * エラーメッセージの存在をチェック
     */
    checkForErrorMessages() {
        const errorSelectors = [
            '.error-message',
            '.alert-danger',
            '.validation-error',
            '[class*="error"]',
            '[class*="invalid"]'
        ];
        const errors = [];
        errorSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const text = element.textContent?.trim();
                if (text) {
                    errors.push(text);
                }
            });
        });
        return errors;
    }
    /**
     * ページのスクリーンショット情報を取得（デバッグ用）
     */
    getPageDebugInfo() {
        return {
            url: window.location.href,
            title: document.title,
            readyState: document.readyState,
            timeRadios: document.querySelectorAll('input[type="radio"][name="date_picker"]').length,
            submitButtons: document.querySelectorAll('.basic-btn, button').length,
            errors: this.checkForErrorMessages(),
            timestamp: new Date().toISOString()
        };
    }
}
// シングルトンインスタンス
let domUtilsInstance = null;
/**
 * DOMUtilsのシングルトンインスタンスを取得
 */
function getDOMUtils() {
    if (!domUtilsInstance) {
        domUtilsInstance = new DOMUtils();
    }
    return domUtilsInstance;
}

// EXTERNAL MODULE: ./ts/modules/pavilion-reservation-cache.ts + 1 modules
var pavilion_reservation_cache = __webpack_require__(619);
;// ./ts/modules/automation-overlay.ts
/**
 * 自動操作オーバーレイUI
 * 自動操作中のユーザーフィードバックとコントロール
 */
class AutomationOverlay {
    constructor() {
        this.overlay = null;
        this.eventHandler = null;
        this.animationId = null;
        /**
         * キーボードイベント処理
         */
        this.handleKeyDown = (e) => {
            if (e.key === 'Escape' && this.state.visible && this.state.canCancel) {
                if (this.eventHandler) {
                    this.eventHandler('cancel');
                }
            }
        };
        this.state = {
            visible: false,
            status: 'idle',
            message: '',
            progress: 0,
            canCancel: true,
            details: []
        };
    }
    /**
     * オーバーレイを表示
     */
    show(initialMessage = '自動操作を開始しています...') {
        if (this.overlay) {
            this.hide();
        }
        this.createOverlay();
        this.updateState({
            visible: true,
            status: 'running',
            message: initialMessage,
            progress: 0,
            canCancel: true,
            details: []
        });
        // フェードインアニメーション
        this.overlay.style.opacity = '0';
        document.body.appendChild(this.overlay);
        requestAnimationFrame(() => {
            this.overlay.style.opacity = '1';
        });
        // 誤操作防止
        this.preventPageInteraction();
    }
    /**
     * オーバーレイを非表示
     */
    hide() {
        if (!this.overlay)
            return;
        // フェードアウトアニメーション
        this.overlay.style.opacity = '0';
        setTimeout(() => {
            if (this.overlay && this.overlay.parentNode) {
                this.overlay.parentNode.removeChild(this.overlay);
            }
            this.overlay = null;
            this.state.visible = false;
            this.restorePageInteraction();
        }, 300);
    }
    /**
     * 状態を更新
     */
    updateState(newState) {
        this.state = { ...this.state, ...newState };
        this.render();
    }
    /**
     * メッセージを更新
     */
    updateMessage(message, addToDetails = true) {
        if (addToDetails) {
            const timestamp = new Date().toLocaleTimeString();
            this.state.details.push(`[${timestamp}] ${message}`);
            // 詳細ログは最新10件まで保持
            if (this.state.details.length > 10) {
                this.state.details = this.state.details.slice(-10);
            }
        }
        this.updateState({ message });
    }
    /**
     * 進行状況を更新
     */
    updateProgress(progress) {
        this.updateState({ progress: Math.max(0, Math.min(100, progress)) });
    }
    /**
     * 実行結果を表示
     */
    showResult(result) {
        const isSuccess = result.status === 'completed';
        const message = isSuccess
            ? `✅ 自動操作完了 (${result.successCount}件成功)`
            : `❌ 自動操作失敗 (${result.failedCount}件失敗)`;
        this.updateState({
            status: result.status,
            message,
            progress: 100,
            canCancel: false
        });
        // 結果詳細を追加
        if (result.errors.length > 0) {
            result.errors.forEach(error => {
                this.updateMessage(`エラー: ${error}`, true);
            });
        }
        // 成功時は3秒後に自動で閉じる
        if (isSuccess) {
            setTimeout(() => this.hide(), 3000);
        }
    }
    /**
     * エラーを表示
     */
    showError(error, canRetry = true) {
        this.updateState({
            status: 'failed',
            message: `❌ エラー: ${error}`,
            progress: 0,
            canCancel: !canRetry
        });
        this.updateMessage(error, true);
    }
    /**
     * イベントハンドラーを設定
     */
    setEventHandler(handler) {
        this.eventHandler = handler;
    }
    /**
     * オーバーレイDOMを作成
     */
    createOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'automation-overlay';
        this.overlay.innerHTML = this.getOverlayHTML();
        // スタイルを適用
        this.applyStyles();
        // イベントリスナーを設定
        this.setupEventListeners();
    }
    /**
     * オーバーレイHTMLを取得
     */
    getOverlayHTML() {
        return `
            <div class="automation-overlay-backdrop">
                <div class="automation-overlay-content">
                    <div class="automation-overlay-header">
                        <h3 class="automation-overlay-title">
                            <span class="automation-icon">🤖</span>
                            パビリオン予約自動操作
                        </h3>
                        <button class="automation-overlay-close" data-action="close">×</button>
                    </div>
                    
                    <div class="automation-overlay-body">
                        <div class="automation-status">
                            <div class="automation-status-icon"></div>
                            <div class="automation-status-message"></div>
                        </div>
                        
                        <div class="automation-progress">
                            <div class="automation-progress-bar">
                                <div class="automation-progress-fill"></div>
                            </div>
                            <div class="automation-progress-text">0%</div>
                        </div>
                        
                        <div class="automation-details">
                            <div class="automation-details-title">処理詳細:</div>
                            <div class="automation-details-content"></div>
                        </div>
                    </div>
                    
                    <div class="automation-overlay-footer">
                        <button class="automation-btn automation-btn-cancel" data-action="cancel">
                            キャンセル
                        </button>
                        <button class="automation-btn automation-btn-retry" data-action="retry" style="display: none;">
                            再試行
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
    /**
     * スタイルを適用
     */
    applyStyles() {
        if (!this.overlay)
            return;
        const styles = `
            .automation-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 999999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                transition: opacity 0.3s ease;
            }
            
            .automation-overlay-backdrop {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
            }
            
            .automation-overlay-content {
                background: white;
                border-radius: 12px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                max-width: 500px;
                width: 100%;
                max-height: 80vh;
                overflow: hidden;
                animation: automation-scale-in 0.3s ease;
            }
            
            @keyframes automation-scale-in {
                from { transform: scale(0.9); opacity: 0; }
                to { transform: scale(1); opacity: 1; }
            }
            
            .automation-overlay-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 20px 24px 16px;
                border-bottom: 1px solid #eee;
            }
            
            .automation-overlay-title {
                margin: 0;
                font-size: 18px;
                font-weight: 600;
                color: #333;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            .automation-icon {
                font-size: 20px;
            }
            
            .automation-overlay-close {
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                color: #666;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background-color 0.2s;
            }
            
            .automation-overlay-close:hover {
                background: #f5f5f5;
            }
            
            .automation-overlay-body {
                padding: 20px 24px;
            }
            
            .automation-status {
                display: flex;
                align-items: center;
                gap: 12px;
                margin-bottom: 20px;
            }
            
            .automation-status-icon {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                position: relative;
            }
            
            .automation-status-icon.running {
                background: #2196F3;
                animation: automation-pulse 2s infinite;
            }
            
            .automation-status-icon.completed {
                background: #4CAF50;
            }
            
            .automation-status-icon.failed {
                background: #F44336;
            }
            
            @keyframes automation-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.5; }
            }
            
            .automation-status-message {
                font-size: 16px;
                color: #333;
                flex: 1;
            }
            
            .automation-progress {
                margin-bottom: 20px;
            }
            
            .automation-progress-bar {
                height: 8px;
                background: #eee;
                border-radius: 4px;
                overflow: hidden;
                margin-bottom: 8px;
            }
            
            .automation-progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #2196F3, #21CBF3);
                border-radius: 4px;
                transition: width 0.3s ease;
                width: 0%;
            }
            
            .automation-progress-text {
                text-align: right;
                font-size: 12px;
                color: #666;
            }
            
            .automation-details {
                background: #f8f9fa;
                border-radius: 6px;
                padding: 12px;
                max-height: 150px;
                overflow-y: auto;
            }
            
            .automation-details-title {
                font-size: 12px;
                font-weight: 600;
                color: #666;
                margin-bottom: 8px;
            }
            
            .automation-details-content {
                font-size: 12px;
                color: #333;
                line-height: 1.4;
            }
            
            .automation-details-content div {
                margin-bottom: 2px;
            }
            
            .automation-overlay-footer {
                padding: 16px 24px 20px;
                border-top: 1px solid #eee;
                display: flex;
                gap: 12px;
                justify-content: flex-end;
            }
            
            .automation-btn {
                padding: 8px 16px;
                border-radius: 6px;
                border: 1px solid #ddd;
                background: white;
                cursor: pointer;
                font-size: 14px;
                transition: all 0.2s;
            }
            
            .automation-btn:hover {
                background: #f5f5f5;
            }
            
            .automation-btn-cancel {
                color: #666;
            }
            
            .automation-btn-retry {
                background: #2196F3;
                color: white;
                border-color: #2196F3;
            }
            
            .automation-btn-retry:hover {
                background: #1976D2;
            }
        `;
        // スタイルシートを追加
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }
    /**
     * イベントリスナーを設定
     */
    setupEventListeners() {
        if (!this.overlay)
            return;
        this.overlay.addEventListener('click', (e) => {
            const target = e.target;
            const action = target.dataset['action'];
            if (action && this.eventHandler) {
                this.eventHandler(action);
            }
        });
        // ESCキーでキャンセル
        document.addEventListener('keydown', this.handleKeyDown);
    }
    /**
     * レンダリング
     */
    render() {
        if (!this.overlay)
            return;
        // ステータスアイコン
        const statusIcon = this.overlay.querySelector('.automation-status-icon');
        if (statusIcon) {
            statusIcon.className = `automation-status-icon ${this.state.status}`;
        }
        // ステータスメッセージ
        const statusMessage = this.overlay.querySelector('.automation-status-message');
        if (statusMessage) {
            statusMessage.textContent = this.state.message;
        }
        // 進行状況
        const progressFill = this.overlay.querySelector('.automation-progress-fill');
        const progressText = this.overlay.querySelector('.automation-progress-text');
        if (progressFill && progressText) {
            progressFill.style.width = `${this.state.progress}%`;
            progressText.textContent = `${Math.round(this.state.progress)}%`;
        }
        // 詳細ログ
        const detailsContent = this.overlay.querySelector('.automation-details-content');
        if (detailsContent) {
            detailsContent.innerHTML = this.state.details
                .map(detail => `<div>${this.escapeHtml(detail)}</div>`)
                .join('');
            // 自動スクロール
            detailsContent.scrollTop = detailsContent.scrollHeight;
        }
        // ボタン状態
        const cancelBtn = this.overlay.querySelector('.automation-btn-cancel');
        const retryBtn = this.overlay.querySelector('.automation-btn-retry');
        if (cancelBtn) {
            cancelBtn.style.display = this.state.canCancel ? 'inline-block' : 'none';
        }
        if (retryBtn) {
            retryBtn.style.display = this.state.status === 'failed' ? 'inline-block' : 'none';
        }
    }
    /**
     * HTMLエスケープ
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    /**
     * ページとの相互作用を防ぐ
     */
    preventPageInteraction() {
        document.body.style.overflow = 'hidden';
        document.body.style.pointerEvents = 'none';
        if (this.overlay) {
            this.overlay.style.pointerEvents = 'auto';
        }
    }
    /**
     * ページとの相互作用を復元
     */
    restorePageInteraction() {
        document.body.style.overflow = '';
        document.body.style.pointerEvents = '';
        // ESCキーリスナーを削除
        document.removeEventListener('keydown', this.handleKeyDown);
    }
    /**
     * デストラクタ
     */
    destroy() {
        this.hide();
        this.eventHandler = null;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}
// シングルトンインスタンス
let overlayInstance = null;
/**
 * オーバーレイのシングルトンインスタンスを取得
 */
function getAutomationOverlay() {
    if (!overlayInstance) {
        overlayInstance = new AutomationOverlay();
    }
    return overlayInstance;
}
/**
 * オーバーレイインスタンスを破棄
 */
function destroyAutomationOverlay() {
    if (overlayInstance) {
        overlayInstance.destroy();
        overlayInstance = null;
    }
}

;// ./ts/modules/automation-engine.ts
/**
 * 自動操作エンジン
 * 万博予約ページでの自動化処理を統括管理
 */


// test-exports用にexport




// デフォルト設定
const DEFAULT_CONFIG = {
    maxRetries: 3,
    stepDelay: 1000,
    pageTimeout: 15000,
    continueOnError: true,
    enableLogging: true
};
class AutomationEngine {
    constructor(config = {}) {
        this.status = 'idle';
        this.pageDetector = getPageDetector();
        this.domUtils = getDOMUtils();
        this.overlay = getAutomationOverlay();
        this.startTime = 0;
        this.processedCount = 0;
        this.successCount = 0;
        this.failedCount = 0;
        this.errors = [];
        this.currentReservation = null;
        this.config = { ...DEFAULT_CONFIG, ...config };
        // オーバーレイイベントハンドラーを設定
        this.overlay.setEventHandler((type) => {
            switch (type) {
                case 'cancel':
                    this.stop();
                    break;
                case 'retry':
                    this.start();
                    break;
                case 'close':
                    this.overlay.hide();
                    break;
            }
        });
    }
    /**
     * 自動操作を開始
     */
    async start() {
        if (this.status === 'running') {
            throw new Error('自動操作は既に実行中です');
        }
        this.log('🚀 自動操作エンジン開始');
        this.resetCounters();
        this.status = 'running';
        this.startTime = Date.now();
        // オーバーレイを表示
        this.overlay.show('自動操作を開始しています...');
        this.updateOverlayProgress(10, 'ページ情報を解析中...');
        try {
            // リダイレクト異常検知
            await this.checkRedirectAbnormality();
            // ページタイプを判定
            const pageInfo = this.pageDetector.extractPageInfo();
            this.log(`📍 現在のページ: ${pageInfo.type}`);
            this.updateOverlayProgress(20, `${pageInfo.type} ページを検知`);
            switch (pageInfo.type) {
                case 'reservation_time':
                    await this.handleReservationPage(pageInfo);
                    break;
                case 'confirmation':
                    await this.handleConfirmationPage(pageInfo);
                    break;
                case 'pavilion_search':
                    this.log('⚠️ パビリオン検索ページでは自動操作は不要です');
                    this.updateOverlayProgress(100, 'パビリオン検索ページでは自動操作不要');
                    break;
                default:
                    throw new Error(`未対応のページタイプ: ${pageInfo.type}`);
            }
            this.status = 'completed';
            this.log('✅ 自動操作完了');
            this.updateOverlayProgress(100, '自動操作が正常に完了しました');
            // 成功通知をグローバル表示
            this.showGlobalNotification('success', '予約処理が正常に完了しました');
        }
        catch (error) {
            this.status = 'failed';
            const errorMessage = error instanceof Error ? error.message : String(error);
            this.errors.push(errorMessage);
            this.log(`❌ 自動操作失敗: ${errorMessage}`);
            this.overlay.showError(errorMessage, true);
            // 失敗通知をグローバル表示
            if (errorMessage.includes('タイムアウト')) {
                this.showGlobalNotification('error', 'ページ準備がタイムアウトしました。サイトが混雑している可能性があります。');
            }
            else if (errorMessage.includes('選択に失敗')) {
                this.showGlobalNotification('error', '指定された時間帯の選択に失敗しました。時間帯が変更された可能性があります。');
            }
            else if (errorMessage.includes('異常リダイレクト')) {
                this.showGlobalNotification('error', `予約処理失敗: ${errorMessage}`);
                // 異常リダイレクトの場合は即座にオーバーレイを非表示
                this.overlay.hide();
                this.log('🚀 異常リダイレクト検知: オーバーレイを即座に非表示');
            }
            else {
                this.showGlobalNotification('error', `予約処理失敗: ${errorMessage}`);
            }
        }
        const result = this.getResult();
        // 成功時はオーバーレイに結果を表示、失敗時は既に表示済み
        if (this.status === 'completed') {
            this.overlay.showResult(result);
        }
        // オーバーレイを即座に非表示（異常リダイレクトの場合は既に非表示済み）
        if (!this.errors.some(error => error.includes('異常リダイレクト'))) {
            this.overlay.hide();
            this.log('🚀 処理完了: オーバーレイを即座に非表示');
        }
        // 自動予約処理完了時にリダイレクト判定フラグをクリア
        sessionStorage.removeItem('expo_redirect_validated');
        this.log('🧹 リダイレクト判定完了フラグをクリア');
        return result;
    }
    /**
     * 予約時間選択ページの処理
     */
    async handleReservationPage(pageInfo) {
        this.log('🎯 予約ページ処理開始');
        // パビリオンコードが取得できない場合はエラー
        if (!pageInfo.pavilionCode) {
            throw new Error('パビリオンコードが取得できません');
        }
        // キャッシュからこのパビリオンの予約データを取得
        const reservationData = await this.findMatchingReservation(pageInfo.pavilionCode);
        if (!reservationData) {
            throw new Error(`パビリオン ${pageInfo.pavilionCode} の予約データが見つかりません`);
        }
        this.currentReservation = reservationData;
        this.log(`📋 予約データ発見: ${reservationData.pavilionName} - ${reservationData.selectedTimeDisplay}`);
        this.updateOverlayProgress(25, `予約データ発見: ${reservationData.pavilionName}`);
        // ページの準備完了を待機
        await this.waitForPageReady();
        // 時間選択を実行
        await this.executeTimeSelection(reservationData);
        // 申込ボタンをクリック
        await this.executeSubmission();
        // 状態を更新
        pavilion_reservation_cache.PavilionReservationCache.updateReservationStatus(reservationData.pavilionCode, reservationData.selectedTimeSlot, 'processing');
        this.processedCount++;
        this.successCount++;
    }
    /**
     * 確認ページの処理
     */
    async handleConfirmationPage(_pageInfo) {
        this.log('📋 確認ページ処理開始');
        // 現在処理中の予約データを取得
        const processingReservation = pavilion_reservation_cache.PavilionReservationCache.getProcessingReservation();
        if (!processingReservation) {
            this.log('⚠️ 処理中の予約データがありません。手動操作の可能性があります。');
            return;
        }
        this.currentReservation = processingReservation;
        this.log(`📋 処理中の予約: ${processingReservation.pavilionName} - ${processingReservation.selectedTimeDisplay}`);
        this.updateOverlayProgress(25, `処理中の予約: ${processingReservation.pavilionName}`);
        // 確認ページの準備完了を待機
        await this.waitForPageReady();
        // 最終確認ボタンクリック
        await this.executeConfirmation();
        // 状態を完了に更新
        pavilion_reservation_cache.PavilionReservationCache.updateReservationStatus(processingReservation.pavilionCode, processingReservation.selectedTimeSlot, 'completed');
        this.processedCount++;
        this.successCount++;
        // 成功通知をグローバル表示
        this.showGlobalNotification('success', `予約完了: ${processingReservation.pavilionName} ${processingReservation.selectedTimeDisplay}～`);
    }
    /**
     * マッチする予約データを検索
     */
    async findMatchingReservation(pavilionCode) {
        // 該当パビリオンのpending状態の予約データを取得
        const pavilionReservations = pavilion_reservation_cache.PavilionReservationCache.getReservationDataByPavilion(pavilionCode);
        const pendingReservations = pavilionReservations.filter(data => data.status === 'pending');
        if (pendingReservations.length === 0) {
            return null;
        }
        // 複数ある場合は最初の1つを選択
        // TODO: 将来的にはユーザー選択や優先度設定を実装
        return pendingReservations[0];
    }
    /**
     * ページ準備完了まで待機
     */
    async waitForPageReady() {
        this.log('⏳ ページ準備完了を待機中...');
        this.updateOverlayProgress(30, 'ページ準備完了を待機中...');
        const isReady = await this.pageDetector.waitForPageReady(this.config.pageTimeout);
        if (!isReady) {
            throw new Error(`ページ準備がタイムアウトしました (${this.config.pageTimeout}ms)`);
        }
        this.log('✅ ページ準備完了');
        this.updateOverlayProgress(40, 'ページ準備完了');
    }
    /**
     * 時間選択を実行
     */
    async executeTimeSelection(reservationData) {
        this.log(`⏰ 時間選択実行: ${reservationData.selectedTimeDisplay}`);
        this.updateOverlayProgress(50, `時間選択中: ${reservationData.selectedTimeDisplay}`);
        const result = await this.domUtils.selectTimeSlot(reservationData.selectedTimeSlot);
        if (!result.success) {
            // 利用可能な時間オプションをログ出力
            if (result.availableOptions) {
                this.log(`📋 利用可能な時間: ${result.availableOptions.join(', ')}`);
            }
            throw new Error(result.error || '時間選択に失敗しました');
        }
        this.log(`✅ 時間選択完了: ${result.selectedTime}`);
        this.updateOverlayProgress(70, `時間選択完了: ${result.selectedTime}`);
        // 少し待機
        await this.delay(this.config.stepDelay);
    }
    /**
     * 申込ボタンクリック実行
     */
    async executeSubmission() {
        this.log('🔘 申込ボタンクリック実行');
        this.updateOverlayProgress(80, '申込ボタンをクリック中...');
        const result = await this.domUtils.clickSubmitButton();
        if (!result.success) {
            throw new Error(result.error || '申込ボタンクリックに失敗しました');
        }
        this.log('✅ 申込ボタンクリック完了');
        this.updateOverlayProgress(90, '申込ボタンクリック完了');
        // ページ遷移を待機
        await this.waitForPageTransition();
    }
    /**
     * 確認ボタンクリック実行
     */
    async executeConfirmation() {
        this.log('📋 最終確認ボタンクリック実行');
        this.updateOverlayProgress(95, '最終確認ボタンをクリック中...');
        // 確認ボタンを検索してクリック
        const confirmResult = await this.domUtils.waitForElement('.confirm-button, .final-submit', this.config.pageTimeout);
        if (!confirmResult.success || !confirmResult.element) {
            throw new Error('確認ボタンが見つかりません');
        }
        confirmResult.element.click();
        this.log('✅ 最終確認ボタンクリック完了');
        this.updateOverlayProgress(100, '予約処理完了');
        // 完了ページへの遷移を待機
        await this.delay(this.config.stepDelay * 2);
    }
    /**
     * ページ遷移を待機
     */
    async waitForPageTransition() {
        this.log('🔄 ページ遷移を待機中...');
        this.updateOverlayProgress(95, 'ページ遷移を待機中...');
        // URLまたはタイトルの変更を待機
        const urlChanged = await this.domUtils.waitForUrlChange(/confirm|complete/, this.config.pageTimeout);
        if (!urlChanged) {
            // エラーメッセージをチェック
            const errors = this.domUtils.checkForErrorMessages();
            if (errors.length > 0) {
                throw new Error(`予約エラー: ${errors.join(', ')}`);
            }
            this.log('⚠️ ページ遷移が検知されませんでしたが、処理を継続します');
        }
        else {
            this.log('✅ ページ遷移完了');
        }
    }
    /**
     * 自動操作を停止
     */
    stop() {
        if (this.status === 'running') {
            this.status = 'cancelled';
            this.log('🛑 自動操作をキャンセルしました');
        }
    }
    /**
     * 現在の状態を取得
     */
    getStatus() {
        return this.status;
    }
    /**
     * 実行結果を取得
     */
    getResult() {
        const executionTime = this.startTime ? Date.now() - this.startTime : 0;
        return {
            status: this.status,
            processedCount: this.processedCount,
            successCount: this.successCount,
            failedCount: this.failedCount,
            errors: [...this.errors],
            executionTime
        };
    }
    /**
     * カウンターをリセット
     */
    resetCounters() {
        this.processedCount = 0;
        this.successCount = 0;
        this.failedCount = 0;
        this.errors = [];
        this.currentReservation = null;
    }
    /**
     * 指定時間待機
     */
    async delay(ms) {
        await new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * オーバーレイの進行状況を更新
     */
    updateOverlayProgress(progress, message) {
        this.overlay.updateProgress(progress);
        this.overlay.updateMessage(message);
    }
    /**
     * ログ出力
     */
    log(message) {
        if (this.config.enableLogging) {
            const timestamp = new Date().toLocaleTimeString();
            console.log(`[${timestamp}] 🤖 ${message}`);
        }
    }
    /**
     * デバッグ情報を出力
     */
    debugInfo() {
        console.group('🔧 自動操作エンジン - デバッグ情報');
        console.log('状態:', this.status);
        console.log('設定:', this.config);
        console.log('実行結果:', this.getResult());
        console.log('現在の予約:', this.currentReservation);
        console.log('ページ情報:', this.pageDetector.extractPageInfo());
        console.log('DOM情報:', this.domUtils.getPageDebugInfo());
        console.groupEnd();
    }
    /**
     * グローバル通知を表示
     */
    showGlobalNotification(type, message) {
        try {
            // グローバル通知システムを使用
            if (typeof window.showReservationNotification === 'function') {
                window.showReservationNotification(type, message, false); // 自動非表示しない
                this.log(`📢 グローバル通知表示: [${type}] ${message}`);
            }
            else {
                this.log('⚠️ グローバル通知システムが利用できません');
                // フォールバック: sessionStorageに保存
                const notificationData = {
                    type,
                    message,
                    timestamp: Date.now()
                };
                sessionStorage.setItem('expo_reservation_result', JSON.stringify(notificationData));
            }
        }
        catch (error) {
            this.log(`❌ グローバル通知エラー: ${error}`);
        }
    }
    /**
     * リダイレクト異常検知（500ms間隔x4回で安定化を確認）
     */
    async checkRedirectAbnormality() {
        // 既にリダイレクト判定済みかチェック
        const isValidated = sessionStorage.getItem('expo_redirect_validated');
        if (isValidated === 'true') {
            this.log('✅ リダイレクト判定済みのためスキップ');
            return;
        }
        // 最新の予約データを取得（pending/processing状態を統一的に扱う）
        const reservationData = this.findLatestReservationData();
        if (!reservationData) {
            this.log('⚠️ 予約データが見つからないため、リダイレクト検知をスキップ');
            return;
        }
        // 期待タイトルを予約データから生成
        const expectedTitle = `${reservationData.pavilionName} ${reservationData.selectedTimeDisplay}～`;
        this.log('🔍 リダイレクト安定化チェック開始（500ms間隔、最大30回、4回連続安定まで）');
        // 500ms間隔で最大30回チェックして4回連続の安定化を確認
        let previousTitle = '';
        let previousUrl = '';
        let consecutiveStableCount = 0;
        let totalChecks = 0;
        const maxChecks = 30;
        while (consecutiveStableCount < 4 && totalChecks < maxChecks) {
            await this.delay(500);
            totalChecks++;
            const currentTitle = document.title;
            const currentUrl = window.location.href;
            this.log(`🔍 チェック${totalChecks}/${maxChecks}: タイトル="${currentTitle}", URL="${currentUrl}"`);
            if (totalChecks > 1 && currentTitle === previousTitle && currentUrl === previousUrl) {
                consecutiveStableCount++;
                this.log(`✅ 安定継続: ${consecutiveStableCount}/4回`);
            }
            else if (totalChecks > 1) {
                consecutiveStableCount = 0; // 変化があったらリセット
                this.log(`🔄 変化検出: 安定カウントをリセット`);
            }
            previousTitle = currentTitle;
            previousUrl = currentUrl;
        }
        this.log(`🔍 安定化チェック完了: 連続安定回数=${consecutiveStableCount}/4, 総チェック回数=${totalChecks}/${maxChecks}`);
        // 最終的なタイトル比較
        const finalTitle = document.title;
        this.log(`🔍 最終タイトル検証: 期待="${expectedTitle}", 実際="${finalTitle}"`);
        if (finalTitle !== expectedTitle && consecutiveStableCount >= 4) {
            this.log('❌ リダイレクト異常を検知: タイトルが一致せず、ページが安定している');
            // 予約データを失敗状態に更新
            const { PavilionReservationCache } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 619));
            PavilionReservationCache.updateReservationStatus(reservationData.pavilionCode, reservationData.selectedTimeSlot, 'failed');
            // 異常リダイレクト通知をポップアップ表示
            this.showGlobalNotification('warning', `異常リダイレクト検知: ${reservationData.pavilionName} ${reservationData.selectedTimeDisplay}～`);
            // 処理を中断
            throw new Error('異常リダイレクトを検知しました');
        }
        this.log('✅ リダイレクト検証OK: 正常なページです');
        // リダイレクト判定完了をsessionStorageに保存
        sessionStorage.setItem('expo_redirect_validated', 'true');
        this.log('💾 リダイレクト判定完了フラグを保存');
    }
    /**
     * 最新の予約データを取得（pending/processing状態を統一的に扱う）
     */
    findLatestReservationData() {
        // 1. まずprocessing状態を確認（処理中の予約が最優先）
        const processingReservation = pavilion_reservation_cache.PavilionReservationCache.getProcessingReservation();
        if (processingReservation) {
            this.log(`📋 処理中の予約データを使用: ${processingReservation.pavilionName}`);
            return processingReservation;
        }
        // 2. processing状態がない場合は、pending状態から最新のものを取得
        const allData = pavilion_reservation_cache.PavilionReservationCache.getAllReservationData();
        const activeData = Object.values(allData)
            .filter(data => data.status === 'pending' || data.status === 'processing')
            .sort((a, b) => b.timestamp - a.timestamp); // 最新順
        if (activeData.length > 0) {
            this.log(`📋 最新の予約データを使用: ${activeData[0].pavilionName} (${activeData[0].status})`);
            return activeData[0];
        }
        return null;
    }
}
// グローバルインスタンス
let automationEngineInstance = null;
/**
 * 自動操作エンジンのインスタンスを取得
 */
function getAutomationEngine(config) {
    if (!automationEngineInstance || config) {
        automationEngineInstance = new AutomationEngine(config);
    }
    return automationEngineInstance;
}
/**
 * 自動操作を開始（ショートカット関数）
 */
async function startAutomation(config) {
    const engine = getAutomationEngine(config);
    return await engine.start();
}
/**
 * 自動操作を停止（ショートカット関数）
 */
function stopAutomation() {
    if (automationEngineInstance) {
        automationEngineInstance.stop();
    }
}

;// ./ts/modules/automation-init.ts
/**
 * 自動操作エンジンの初期化・自動起動モジュール
 * ページ読み込み時に自動操作が必要かチェックし、必要に応じて実行
 */



// 初期化状態の管理
let isInitialized = false;
let isAutomationRunning = false;
/**
 * 自動操作エンジンを初期化
 */
function initializeAutomation() {
    if (isInitialized)
        return;
    console.log('🤖 自動操作エンジン初期化開始');
    // ページロード完了後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndStartAutomation);
    }
    else {
        // すでにロード完了している場合は即座に実行
        setTimeout(checkAndStartAutomation, 100);
    }
    // ページ変更時の監視（SPA対応）
    setupPageChangeListener();
    isInitialized = true;
    console.log('✅ 自動操作エンジン初期化完了');
}
/**
 * 自動操作が必要かチェックして開始
 */
async function checkAndStartAutomation() {
    if (isAutomationRunning) {
        console.log('⏳ 自動操作は既に実行中です');
        return;
    }
    try {
        // ページタイプを検知
        const pageDetector = getPageDetector();
        const pageInfo = pageDetector.extractPageInfo();
        console.log(`📍 ページ検知: ${pageInfo.type} - ${pageInfo.url}`);
        // 自動操作対象ページかチェック
        if (!shouldStartAutomation(pageInfo.type)) {
            console.log(`ℹ️ ${pageInfo.type} ページでは自動操作不要`);
            return;
        }
        // キャッシュにデータがあるかチェック
        const hasReservationData = checkReservationDataAvailable(pageInfo);
        if (!hasReservationData) {
            console.log('📋 キャッシュに予約データがありません');
            return;
        }
        // 自動操作を開始
        await startAutomationSafely();
    }
    catch (error) {
        console.error('❌ 自動操作チェックエラー:', error);
    }
}
/**
 * 自動操作を安全に開始
 */
async function startAutomationSafely() {
    if (isAutomationRunning)
        return;
    isAutomationRunning = true;
    console.log('🚀 自動操作開始');
    try {
        const engine = getAutomationEngine({
            enableLogging: true,
            continueOnError: true,
            maxRetries: 3
        });
        const result = await engine.start();
        console.log('📊 自動操作結果:', result);
        if (result.status === 'completed') {
            console.log('✅ 自動操作正常完了');
        }
        else if (result.status === 'failed') {
            console.warn('⚠️ 自動操作失敗:', result.errors);
        }
    }
    catch (error) {
        console.error('❌ 自動操作実行エラー:', error);
    }
    finally {
        isAutomationRunning = false;
    }
}
/**
 * 自動操作を開始すべきかチェック
 */
function shouldStartAutomation(pageType) {
    // 予約時間選択ページでのみ自動操作を実行
    return pageType === 'reservation_time';
}
/**
 * 予約データが利用可能かチェック
 */
function checkReservationDataAvailable(pageInfo) {
    // パビリオン検索ページは除外
    if (pageInfo.type === 'pavilion_search') {
        return false;
    }
    // 予約時間選択ページの場合、該当パビリオンのデータをチェック
    if (pageInfo.type === 'reservation_time' && pageInfo.pavilionCode) {
        const pavilionData = pavilion_reservation_cache.PavilionReservationCache.getReservationDataByPavilion(pageInfo.pavilionCode);
        const pendingData = pavilionData.filter(data => data.status === 'pending');
        return pendingData.length > 0;
    }
    // 確認ページの場合、処理中のデータをチェック
    if (pageInfo.type === 'confirmation') {
        const processingData = pavilion_reservation_cache.PavilionReservationCache.getProcessingReservation();
        return processingData !== null;
    }
    return false;
}
/**
 * ページ変更監視を設定（SPA対応）
 */
function setupPageChangeListener() {
    let currentUrl = window.location.href;
    // URL変更の監視
    const checkUrlChange = () => {
        const newUrl = window.location.href;
        if (newUrl !== currentUrl) {
            currentUrl = newUrl;
            console.log('🔄 ページ変更検知:', newUrl);
            // ページデテクターをリセット
            resetPageDetector();
            // 少し待ってから自動操作チェック
            setTimeout(checkAndStartAutomation, 1000);
        }
    };
    // pushState/replaceStateの監視
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    history.pushState = function (...args) {
        originalPushState.apply(history, args);
        setTimeout(checkUrlChange, 100);
    };
    history.replaceState = function (...args) {
        originalReplaceState.apply(history, args);
        setTimeout(checkUrlChange, 100);
    };
    // popstateイベントの監視
    window.addEventListener('popstate', () => {
        setTimeout(checkUrlChange, 100);
    });
    // 定期的なURLチェック（フォールバック）
    setInterval(checkUrlChange, 2000);
}
/**
 * デバッグ用: 手動で自動操作を実行
 */
function debugStartAutomation() {
    console.log('🔧 デバッグ: 手動自動操作開始');
    startAutomationSafely();
}
/**
 * デバッグ用: 現在の状態を確認
 */
function debugAutomationStatus() {
    console.group('🔧 自動操作エンジン状態');
    console.log('初期化済み:', isInitialized);
    console.log('実行中:', isAutomationRunning);
    const pageDetector = getPageDetector();
    console.log('ページ情報:', pageDetector.extractPageInfo());
    const pendingReservations = pavilion_reservation_cache.PavilionReservationCache.getPendingReservations();
    console.log('待機中予約:', pendingReservations.length, pendingReservations);
    const processingReservation = pavilion_reservation_cache.PavilionReservationCache.getProcessingReservation();
    console.log('処理中予約:', processingReservation);
    console.groupEnd();
}
// グローバルに公開（デバッグ用）
window.debugStartAutomation = debugStartAutomation;
window.debugAutomationStatus = debugAutomationStatus;
// 自動初期化
initializeAutomation();

// EXTERNAL MODULE: ./ts/modules/monitoring-scheduler.ts
var monitoring_scheduler = __webpack_require__(723);
// EXTERNAL MODULE: ./ts/modules/monitoring-cache.ts
var monitoring_cache = __webpack_require__(76);
// EXTERNAL MODULE: ./ts/modules/monitoring-service.ts
var monitoring_service = __webpack_require__(141);
// EXTERNAL MODULE: ./ts/modules/immediate-reservation.ts
var immediate_reservation = __webpack_require__(599);
;// ./ts/modules/notification-system.ts
/**
 * グローバル通知システム
 * ダイアログの状態に関係なく通知を表示できる永続的なシステム
 */
class GlobalNotificationSystem {
    constructor() {
        this.notificationContainer = null;
        this.activeNotifications = new Map();
    }
    /**
     * 通知システムを初期化
     */
    initialize() {
        if (this.notificationContainer) {
            return; // 既に初期化済み
        }
        // 通知コンテナを作成
        this.notificationContainer = document.createElement('div');
        this.notificationContainer.id = 'ytomo-global-notifications';
        this.notificationContainer.className = 'ytomo-global-notification-container';
        // ページに追加
        document.body.appendChild(this.notificationContainer);
        console.log('✅ グローバル通知システム初期化完了');
    }
    /**
     * 通知を表示
     */
    show(options) {
        if (!this.notificationContainer) {
            this.initialize();
        }
        const notificationId = `notification-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        // 通知要素を作成
        const notification = this.createNotificationElement(options, notificationId);
        // コンテナに追加
        this.notificationContainer.appendChild(notification);
        this.activeNotifications.set(notificationId, notification);
        // アニメーション
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });
        // 自動非表示
        if (options.autoHide !== false) {
            const duration = options.duration || 5000;
            setTimeout(() => {
                this.hide(notificationId);
            }, duration);
        }
        console.log(`📢 通知表示: [${options.type}] ${options.message}`);
        return notificationId;
    }
    /**
     * 通知を非表示
     */
    hide(notificationId) {
        const notification = this.activeNotifications.get(notificationId);
        if (!notification) {
            return;
        }
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
            this.activeNotifications.delete(notificationId);
        }, 300);
    }
    /**
     * すべての通知をクリア
     */
    clearAll() {
        for (const notificationId of this.activeNotifications.keys()) {
            this.hide(notificationId);
        }
    }
    /**
     * 通知要素を作成
     */
    createNotificationElement(options, notificationId) {
        const notification = document.createElement('div');
        notification.className = `ytomo-global-notification ${options.type}`;
        notification.setAttribute('data-notification-id', notificationId);
        // アイコンを設定
        const icon = this.getIconForType(options.type);
        // メッセージ要素
        const messageElement = document.createElement('span');
        messageElement.className = 'notification-message';
        messageElement.textContent = options.message;
        // 閉じるボタン
        const closeButton = document.createElement('button');
        closeButton.className = 'notification-close';
        closeButton.textContent = '×';
        closeButton.addEventListener('click', () => {
            this.hide(notificationId);
        });
        // 内容を組み立て
        notification.appendChild(document.createTextNode(icon + ' '));
        notification.appendChild(messageElement);
        notification.appendChild(closeButton);
        return notification;
    }
    /**
     * 通知タイプに応じたアイコンを取得
     */
    getIconForType(type) {
        switch (type) {
            case 'success': return '✅';
            case 'error': return '❌';
            case 'warning': return '⚠️';
            case 'info': return 'ℹ️';
            default: return 'ℹ️';
        }
    }
}
// グローバルインスタンス
const globalNotificationSystem = new GlobalNotificationSystem();
// エクスポート

// グローバル関数として公開
window.showGlobalNotification = (options) => {
    return globalNotificationSystem.show(options);
};
// 既存の関数名でも使用可能にする
window.showReservationNotification = (type, message, autoHide = true) => {
    return globalNotificationSystem.show({ type, message, autoHide });
};
// ページ読み込み時に自動初期化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        globalNotificationSystem.initialize();
    });
}
else {
    // 既にDOMが読み込まれている場合は即座に初期化
    globalNotificationSystem.initialize();
}
console.log('✅ グローバル通知システムモジュール読み込み完了');

;// ./ts/modules/page-return-system.ts
/**
 * ページ復帰システム
 * URLの直接保存ではなく、ページタイプと必要なパラメータを構造化して保存し、
 * 適切な手続きを経て元のページに復帰する
 */

class PageReturnSystem {
    /**
     * 現在のページ情報を解析して保存
     */
    static saveCurrentPageInfo() {
        try {
            const pageInfo = this.analyzeCurrentPage();
            if (pageInfo) {
                sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(pageInfo));
                console.log('📄 ページ情報を保存:', pageInfo);
                return pageInfo;
            }
            return null;
        }
        catch (error) {
            console.error('❌ ページ情報保存エラー:', error);
            return null;
        }
    }
    /**
     * 保存されたページ情報を取得
     */
    static getSavedPageInfo() {
        try {
            const saved = sessionStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
            return null;
        }
        catch (error) {
            console.error('❌ ページ情報取得エラー:', error);
            return null;
        }
    }
    /**
     * 保存された情報に基づいてページに復帰
     */
    static async returnToSavedPage() {
        const pageInfo = this.getSavedPageInfo();
        if (!pageInfo) {
            console.log('⚠️ 復帰用ページ情報がありません');
            return false;
        }
        try {
            const success = await this.executePageReturn(pageInfo);
            if (success) {
                // 復帰成功時は情報をクリア
                sessionStorage.removeItem(this.STORAGE_KEY);
                console.log('✅ ページ復帰完了');
            }
            return success;
        }
        catch (error) {
            console.error('❌ ページ復帰エラー:', error);
            return false;
        }
    }
    /**
     * 現在のページを解析してPageInfoを生成
     */
    static analyzeCurrentPage() {
        const url = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        console.log('🔍 ページ解析中:', url);
        // 既存のページ検知システムを使用
        const pageDetector = getPageDetector();
        const pageInfo = pageDetector.extractPageInfo();
        console.log('🔍 既存システムでのページタイプ:', pageInfo.type);
        if (pageInfo.type === 'pavilion_search') {
            console.log('✅ パビリオン検索ページと判定');
            return {
                pageType: 'pavilion_search',
                parameters: {
                    id: urlParams.get('id') || '',
                    originalUrl: url
                },
                timestamp: Date.now()
            };
        }
        console.log('⚠️ 未対応のページタイプです:', url, 'detected:', pageInfo.type);
        return null;
    }
    /**
     * ページタイプに応じた復帰手続きを実行
     */
    static async executePageReturn(pageInfo) {
        console.log(`🔄 ページ復帰開始: ${pageInfo.pageType}`, pageInfo.parameters);
        switch (pageInfo.pageType) {
            case 'pavilion_search':
                return await this.returnToPavilionSearch(pageInfo.parameters);
            default:
                console.error('❌ 未対応のページタイプ:', pageInfo.pageType);
                return false;
        }
    }
    /**
     * パビリオン検索画面への復帰手続き
     */
    static async returnToPavilionSearch(params) {
        try {
            const id = params['id'];
            if (!id) {
                console.error('❌ パビリオン検索復帰: idパラメータが不足');
                return false;
            }
            // まずチケット選択画面に遷移
            const ticketSelectionUrl = `https://ticket.expo2025.or.jp/ticket_selection/?screen_id=018&lottery=4&id=${id}`;
            console.log(`🎫 チケット選択画面に遷移: ${ticketSelectionUrl}`);
            window.location.href = ticketSelectionUrl;
            // ページ遷移するので、ここでは成功とする
            // 実際の成功確認は遷移先で行う必要がある
            return true;
        }
        catch (error) {
            console.error('❌ パビリオン検索復帰エラー:', error);
            return false;
        }
    }
    /**
     * 保存された情報をクリア
     */
    static clearSavedPageInfo() {
        sessionStorage.removeItem(this.STORAGE_KEY);
        console.log('🗑️ ページ復帰情報をクリア');
    }
}
PageReturnSystem.STORAGE_KEY = 'expo_page_return_info';


;// ./ts/modules/main.ts
/**
 * メインエントリーポイント
 * 各sectionモジュールをimportすることで、webpackで統合されたバンドルを作成
 */
// すべてのモジュールをimport（副作用importも含む）








 // 同行者追加機能
 // 自動操作エンジン初期化
 // メインダイアログFAB
// 新しい監視・即時予約機能




 // グローバル通知システム
 // ページ復帰システム
// テスト環境・開発環境でのみtest-exportsをimport
// 本番環境では webpack の tree shaking で除外される
if (false) // removed by dead control flow
{}
// グローバル予約結果通知チェック（すべてのページで動作）
const checkGlobalReservationResult = () => {
    try {
        // 失敗通知チェック（既存）
        const failureInfoStr = sessionStorage.getItem('expo_reservation_failure');
        if (failureInfoStr) {
            const failureInfo = JSON.parse(failureInfoStr);
            // グローバル通知システムで表示
            if (typeof window.showReservationNotification === 'function') {
                window.showReservationNotification('error', `予約に失敗しました: ${failureInfo.pavilionName} ${failureInfo.timeDisplay}～（${failureInfo.reason}）`, false // 自動非表示しない
                );
                console.log('📢 グローバル失敗通知を表示しました');
            }
            // 表示完了後、sessionStorageをクリア
            sessionStorage.removeItem('expo_reservation_failure');
        }
        // 結果通知チェック（新規）
        const resultInfoStr = sessionStorage.getItem('expo_reservation_result');
        if (resultInfoStr) {
            const resultInfo = JSON.parse(resultInfoStr);
            // グローバル通知システムで表示
            if (typeof window.showReservationNotification === 'function') {
                window.showReservationNotification(resultInfo.type, resultInfo.message, false // 自動非表示しない
                );
                console.log('📢 グローバル結果通知を表示しました:', resultInfo.type, resultInfo.message);
            }
            // 表示完了後、sessionStorageをクリア
            sessionStorage.removeItem('expo_reservation_result');
        }
    }
    catch (error) {
        console.error('❌ グローバル結果通知チェックエラー:', error);
    }
};
// DOMContentLoaded時にグローバル予約結果通知をチェック
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            checkGlobalReservationResult();
        }, 1000); // グローバル通知システムの初期化を待つ
    });
}
else {
    // DOMが既に読み込まれている場合は即座に実行
    setTimeout(() => {
        checkGlobalReservationResult();
    }, 1000);
}

/******/ 	return __webpack_exports__;
/******/ })()
;
});