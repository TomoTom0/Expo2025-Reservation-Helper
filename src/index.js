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

// Built: 2025/08/12 17:26:44


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

/***/ 269:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   vp: () => (/* binding */ updateMainButtonDisplay)
/* harmony export */ });
/* unused harmony exports disableAllMonitorButtons, enableAllMonitorButtons, updateMonitoringTargetsDisplay */
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(374);
/**
 * 入場予約UI更新ヘルパー関数
 * 循環参照を避けるために独立したモジュールとして分離
 */

// メインFABボタンの表示を更新（統一システムに委譲）
function updateMainButtonDisplay() {
    // カウントダウン中はログを削減
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.isReloadCountdownActive()) {
        // ログ削減: 頻繁に呼ばれるため削除
    }
    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.updateFabDisplay();
}
// 監視ボタンを無効化
function disableAllMonitorButtons() {
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    monitorButtons.forEach((button) => {
        const htmlButton = button;
        htmlButton.disabled = true;
        htmlButton.classList.add('js-disabled');
        htmlButton.classList.remove('js-enabled');
    });
}
// 監視ボタンを有効化
function enableAllMonitorButtons() {
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    monitorButtons.forEach((button) => {
        const htmlButton = button;
        htmlButton.disabled = false;
        htmlButton.classList.add('js-enabled');
        htmlButton.classList.remove('js-disabled');
    });
}
// 監視対象表示を更新
function updateMonitoringTargetsDisplay() {
    // 監視対象の表示更新ロジック
    const targets = entranceReservationStateManager.getMonitoringTargets();
    // カウントダウン中はログを削減（毎秒出力を避ける）
    if (!entranceReservationStateManager.isReloadCountdownActive()) {
        console.log(`🎯 監視対象表示更新: ${targets.length}個の対象`);
    }
    // TODO: 具体的な表示更新処理を実装
}


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
___CSS_LOADER_EXPORT___.push([module.id, `#ytomo-status-badge.countdown-warning{background:rgba(255,0,0,.9)}.ytomo-efficiency-toggle{width:45px;height:32px;border-radius:16px;color:#fff;border:none;font-size:10px;font-weight:bold;cursor:pointer;transition:all .2s ease;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;pointer-events:auto;margin-bottom:8px}.ytomo-efficiency-toggle.efficiency-enabled{background:rgba(255,140,0,.9)}.ytomo-efficiency-toggle.efficiency-disabled{background:rgba(128,128,128,.9)}.ytomo-efficiency-toggle:hover{transform:scale(1.1);box-shadow:0 4px 12px rgba(0,0,0,.4)}.ytomo-efficiency-toggle:active{transform:scale(0.95)}button.ext-ytomo{height:40px;width:auto;min-width:60px;padding:0px 8px;background:#006821;color:#fff}button.ext-ytomo.no-after:after{background:rgba(0,0,0,0) none repeat 0 0/auto auto padding-box border-box scroll}button.ext-ytomo.btn-done{background:#4a4c4a}button.ext-ytomo:hover{background:#02862b}.pavilion-sub-btn{color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:12px;white-space:nowrap;transition:all .2s ease}.pavilion-sub-btn.btn-enabled{background:#006821;cursor:pointer;opacity:1}.pavilion-sub-btn.btn-enabled:hover{background:#02862b;transform:scale(1.05)}.pavilion-sub-btn.btn-disabled,.pavilion-sub-btn.btn-loading{background:gray;cursor:not-allowed;opacity:.6}.pavilion-sub-btn.btn-disabled:hover,.pavilion-sub-btn.btn-loading:hover{background:gray;transform:scale(1)}button.ext-ytomo.pavilion-sub-btn.btn-disabled,button.ext-ytomo.pavilion-sub-btn.btn-loading{background:gray;cursor:not-allowed;opacity:.6}button.ext-ytomo.pavilion-sub-btn.btn-disabled:hover,button.ext-ytomo.pavilion-sub-btn.btn-loading:hover{background:gray;transform:scale(1)}.safe-none,.ytomo-none,.filter-none{display:none}button.ext-ytomo.monitor-btn{height:auto;min-height:20px;width:auto;min-width:35px;padding:1px 4px;color:#fff;margin-left:8px;font-size:10px;border:none;border-radius:2px;cursor:pointer;display:inline-block;vertical-align:middle;position:relative;z-index:10;pointer-events:auto;opacity:1;visibility:visible}button.ext-ytomo.monitor-btn.full-status{background:#228b22}button.ext-ytomo.monitor-btn.full-status:hover{background:#32cd32}button.ext-ytomo.monitor-btn.monitoring-status{background:#dc3545}button.ext-ytomo.monitor-btn.monitoring-status:hover{background:#ff4554}button.ext-ytomo.monitor-btn:disabled{cursor:not-allowed;opacity:.7}button.ext-ytomo.monitor-btn:disabled.full-status{background:rgba(34,139,34,.5);color:hsla(0,0%,100%,.9)}button.ext-ytomo.monitor-btn:disabled.monitoring-status{background:rgba(220,53,69,.5);color:hsla(0,0%,100%,.9)}button.ext-ytomo.monitor-btn:disabled:not(.full-status):not(.monitoring-status){background:rgba(128,128,128,.7);color:hsla(0,0%,100%,.9)}button.ext-ytomo.pavilion-sub-btn.ytomo-date-button.date-selected{border:2px solid #4caf50;box-shadow:0 0 8px rgba(76,175,80,.6)}div.div-flex{display:flex;justify-content:center;margin:5px}.js-show{display:block}.js-hide{display:none}.js-visible{visibility:visible}.js-invisible{visibility:hidden}.js-enabled{pointer-events:auto;opacity:1}.js-disabled{pointer-events:none;opacity:.6}.js-green{background:#228b22;color:#fff}.js-red{background:#dc3545;color:#fff}.js-gray{background:gray;color:#fff}.btn-success-highlight{background:#00c800;color:#fff}.status-bg-green{background:rgba(0,128,0,.9)}.status-bg-red{background:rgba(255,0,0,.9)}.status-bg-orange{background:rgba(255,140,0,.9)}.status-bg-blue{background:rgba(0,104,33,.9)}.status-bg-default{background:rgba(0,0,0,.8)}#ytomo-status-badge{background:linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9));color:#fff;padding:8px 16px;border-radius:20px;font-size:12px;font-weight:bold;white-space:pre-line;box-shadow:0 4px 12px rgba(0,0,0,.3),0 2px 6px rgba(0,0,0,.2);border:2px solid hsla(0,0%,100%,.15);pointer-events:none}#ytomo-status-badge.ytomo-status-waiting{background:linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(40, 40, 40, 0.9))}#ytomo-status-badge.ytomo-status-monitoring{background:linear-gradient(135deg, rgba(0, 104, 33, 0.9), rgba(0, 150, 50, 0.9))}#ytomo-status-badge.ytomo-status-monitoring.ytomo-status-countdown-warning{background:linear-gradient(135deg, rgba(255, 0, 0, 0.9), rgba(220, 53, 69, 0.9))}#ytomo-status-badge.ytomo-status-reservation{background:linear-gradient(135deg, rgba(255, 140, 0, 0.9), rgba(255, 165, 0, 0.9))}#ytomo-status-badge.ytomo-status-reservation.ytomo-status-countdown-warning{background:linear-gradient(135deg, rgba(255, 0, 0, 0.9), rgba(220, 53, 69, 0.9))}#ytomo-status-badge.ytomo-status-cooldown{background:linear-gradient(135deg, rgba(255, 107, 53, 0.9), rgba(255, 140, 0, 0.9))}.ytomo-header li.fab-toggle-li{display:inline-block;margin-right:8px}.ytomo-header li.fab-toggle-li button.fab-toggle-button{background:none;border:none;cursor:pointer;padding:0;color:#fff;transition:all .2s ease;display:flex;align-items:center;justify-content:center}.ytomo-header li.fab-toggle-li button.fab-toggle-button:hover{color:#ddd}.ytomo-header li.fab-toggle-li button.fab-toggle-button figure.fab-toggle-figure{width:auto;height:24px;display:flex;align-items:center;justify-content:center;padding:0 4px}.ytomo-pavilion-fab button.ytomo-fab{position:relative}.ytomo-pavilion-fab button.ytomo-fab:hover{transform:scale(1.15);box-shadow:0 8px 25px rgba(0,0,0,.5),0 4px 12px rgba(0,0,0,.3);border-width:4px}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-expand-icon{font-size:8px;line-height:1;margin-bottom:1px;opacity:.8}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-brand-text{font-size:7px;font-weight:normal;line-height:1;margin-bottom:2px;opacity:.7}.ytomo-pavilion-fab .ytomo-fab-inner-content .pavilion-fab-counts-text{font-size:12px;font-weight:bold;line-height:1}.ytomo-pavilion-fab .pavilion-sub-actions-container{display:none;flex-direction:column;gap:8px;align-items:flex-end;margin-bottom:8px}.ytomo-pavilion-fab .pavilion-sub-actions-container.expanded{display:flex}.ytomo-pavilion-fab .pavilion-sub-actions-container button.pavilion-sub-btn.base-style{color:#fff;border:none;border-radius:20px;padding:8px 16px;font-size:12px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.3);transition:all .2s ease}.ytomo-companion-dialog{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);display:flex;align-items:center;justify-content:center;z-index:99999;padding:20px;box-sizing:border-box}.ytomo-companion-dialog .dialog-content{background:#fff;border-radius:12px;padding:24px;width:100%;max-width:500px;max-height:90vh;overflow-y:auto;box-shadow:0 10px 40px rgba(0,0,0,.3)}@media(max-width: 768px){.ytomo-companion-dialog .dialog-content{max-width:95vw;max-height:85vh;padding:16px;border-radius:8px}}.ytomo-companion-dialog .dialog-content .input-row{display:flex;gap:8px;margin-bottom:12px}@media(max-width: 480px){.ytomo-companion-dialog .dialog-content .input-row{flex-direction:column;gap:12px}}.ytomo-companion-dialog .dialog-content .input-row input{padding:12px 8px;border:1px solid #ddd;border-radius:4px;font-size:16px}.ytomo-companion-dialog .dialog-content .input-row input:focus{outline:none;border-color:#4caf50;box-shadow:0 0 0 2px rgba(76,175,80,.2)}.ytomo-companion-dialog .dialog-content .input-row button{padding:12px 16px;background:#4caf50;color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:14px;white-space:nowrap;min-width:60px}.ytomo-companion-dialog .dialog-content .input-row button:hover{background:#45a049}.ytomo-companion-dialog .dialog-content .input-row button:active{background:#3d8b40}.ytomo-fab{width:56px;height:56px;border-radius:50%;color:#fff;border:none;box-shadow:0 6px 20px rgba(0,0,0,.4),0 2px 8px rgba(0,0,0,.2);border:3px solid hsla(0,0%,100%,.2);display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:bold;transition:all .3s ease;position:relative;overflow:hidden;pointer-events:auto}.ytomo-fab-enabled{background:#ff8c00;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab-disabled{background:gray;opacity:.6;cursor:not-allowed;pointer-events:none}.ytomo-fab-monitoring{background:#ff8c00;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab-running{background:#dc3545;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab.state-idle{background:gray;opacity:.6;cursor:not-allowed;pointer-events:none}.ytomo-fab.pointer-events-none{pointer-events:none}.ytomo-fab.pointer-events-auto{pointer-events:auto}.ytomo-fab.state-enabled{background:#ff8c00;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab.state-running{background:#dc3545;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab.state-monitoring{background:#006821;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab.state-reservation{background:#ff8c00;opacity:.9;cursor:pointer;pointer-events:auto}.ytomo-fab:hover{transform:scale(1.15);box-shadow:0 8px 25px rgba(0,0,0,.5),0 4px 12px rgba(0,0,0,.3)}.ytomo-fab.reservation-enabled{background:#006821;opacity:.9;cursor:pointer}.ytomo-fab.reservation-disabled{background:gray;opacity:.9;cursor:not-allowed}.ytomo-fab.cooldown-warning{background:#ff6b35}.ytomo-fab.cooldown-normal{background:#007bff}.ytomo-fab-container{position:fixed;bottom:24px;right:24px;z-index:10000;display:flex;flex-direction:column;align-items:flex-end;gap:12px;pointer-events:auto}.ytomo-fab-container.z-normal{z-index:10000}.ytomo-fab-container.z-above-overlay{z-index:100001}.ytomo-fab-container.visible{display:flex}.ytomo-fab-container.hidden{display:none}.ytomo-fab-content{position:relative;display:flex;flex-direction:column-reverse;align-items:center;gap:8px;opacity:0;transform:scale(0.8) translateY(10px);transition:all .3s cubic-bezier(0.175, 0.885, 0.32, 1.275);pointer-events:none}.ytomo-fab-content.expanded{opacity:1;transform:scale(1) translateY(0);pointer-events:auto}.ytomo-sub-fab{width:45px;height:32px;border-radius:16px;background:rgba(0,104,33,.9);color:#fff;border:none;font-size:11px;font-weight:bold;cursor:pointer;transition:all .2s ease;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;pointer-events:auto}.ytomo-sub-fab:hover{background:rgba(2,134,43,.9);transform:scale(1.1);box-shadow:0 4px 12px rgba(0,0,0,.4)}.ytomo-sub-fab:active{transform:scale(0.95)}.ytomo-pavilion-fab-container{position:fixed;bottom:24px;right:24px;z-index:10000;display:flex;flex-direction:column;gap:12px;align-items:flex-end;pointer-events:auto}.ytomo-fab-inner-content{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;pointer-events:none}.ytomo-reservation-target-display{background:linear-gradient(135deg, rgba(0, 123, 255, 0.95), rgba(0, 86, 179, 0.95));color:#fff;padding:8px 12px;border-radius:12px;font-size:12px;font-weight:bold;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.3);border:2px solid hsla(0,0%,100%,.3);min-width:80px;max-width:120px;white-space:pre-line;overflow:visible;text-overflow:clip;transition:all .3s ease;pointer-events:auto;cursor:pointer}.ytomo-reservation-target-display:hover{transform:scale(1.05);box-shadow:0 4px 14px rgba(0,0,0,.4)}.ytomo-reservation-target-display.hidden{display:none}.ytomo-reservation-target-display.visible{display:block}.ytomo-monitoring-targets-display{background:linear-gradient(135deg, rgba(0, 104, 33, 0.95), rgba(0, 150, 50, 0.95));color:#fff;padding:8px 12px;border-radius:12px;font-size:12px;font-weight:bold;text-align:center;box-shadow:0 3px 10px rgba(0,0,0,.3);border:2px solid hsla(0,0%,100%,.3);min-width:80px;max-width:120px;white-space:pre-line;overflow:visible;text-overflow:clip;transition:all .3s ease;pointer-events:auto;cursor:pointer}.ytomo-monitoring-targets-display:hover{transform:scale(1.05);box-shadow:0 4px 14px rgba(0,0,0,.4)}.ytomo-monitoring-targets-display.hidden{display:none}.ytomo-monitoring-targets-display.visible{display:block}input.ext-tomo.search{height:50px;min-width:200px;max-width:min(300px,100%);font-family:quicksand;font-size:16px;-webkit-appearance:textfield;-moz-appearance:textfield;appearance:textfield;border:1px solid #222426;border-radius:25px;box-shadow:0 1px 0 0 #ccc;padding:0 0 0 10px;flex:1 1}.ytomo-icon.expand-icon{font-size:8px;line-height:1;color:#fff;font-weight:bold;text-align:center;pointer-events:none}.ytomo-icon.countdown-text{font-size:6px;line-height:1;color:#fff;font-weight:bold;text-align:center;margin-top:1px;pointer-events:none}.ytomo-toggle.toggle-li{position:fixed;bottom:10px;left:10px;z-index:1000;list-style:none;margin:0;padding:0}.ytomo-toggle.toggle-button{width:50px;height:30px;background:rgba(255,140,0,.8);border:none;border-radius:15px;cursor:pointer;transition:all .3s ease;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:bold;position:relative;overflow:hidden}.ytomo-toggle.toggle-button.enabled{color:#fff}.ytomo-toggle.toggle-button.disabled{color:#ddd}.ytomo-toggle.toggle-figure{width:100%;height:100%;margin:0;padding:0;border:none;background:rgba(0,0,0,0);pointer-events:none}.ytomo-dialog.overlay{position:fixed;top:0;left:0;width:100%;height:100%;background-color:rgba(0,0,0,.5);z-index:10000;display:flex;justify-content:center;align-items:center}.ytomo-dialog.container{background:#fff;border-radius:8px;padding:20px;max-width:400px;width:90%;max-height:70vh;overflow-y:auto;box-shadow:0 4px 12px rgba(0,0,0,.3)}.ytomo-dialog.title{margin:0 0 16px 0;color:#333;font-size:18px;font-weight:bold}.ytomo-dialog.button-group{display:flex;justify-content:flex-end;gap:10px;margin-top:20px}.ytomo-dialog.primary-button{background:#006821;color:#fff;border:none;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px}.ytomo-dialog.primary-button:hover{background:#02862b}.ytomo-dialog.primary-button:disabled{background:gray;cursor:not-allowed}.ytomo-dialog.secondary-button{background:rgba(0,0,0,0);color:#666;border:1px solid #ccc;padding:10px 20px;border-radius:4px;cursor:pointer;font-size:14px}.ytomo-dialog.secondary-button:hover{background:#f5f5f5}.ytomo-progress.counter{display:inline-block;margin-left:8px;padding:2px 6px;background:rgba(0,0,0,.3);border-radius:10px;font-size:10px;color:#fff;font-weight:bold}#ytomo-monitoring-targets.monitoring-targets{background:rgba(255,140,0,.15);border:1px solid rgba(255,140,0,.3);border-radius:8px;padding:8px;margin:4px 0}#ytomo-monitoring-targets.reservation-target{background:rgba(0,104,33,.15);border:1px solid rgba(0,104,33,.3);border-radius:8px;padding:8px;margin:4px 0}.ytomo-error-message{position:fixed;top:20px;right:20px;background:#f44;color:#fff;padding:15px;border-radius:5px;box-shadow:0 2px 10px rgba(0,0,0,.3);z-index:10001;max-width:300px;font-size:14px;line-height:1.4}.ytomo-error-message .error-title{font-weight:bold;margin-bottom:5px}.ytomo-error-message .error-close-btn{margin-top:10px;padding:5px 10px;background:hsla(0,0%,100%,.2);border:none;border-radius:3px;color:#fff;cursor:pointer;font-size:12px}.ytomo-error-message .error-close-btn:hover{background:hsla(0,0%,100%,.3)}.ytomo-flex-column-center{display:flex;flex-direction:column;align-items:center}.ytomo-brand-text{font-size:8px;font-weight:bold;margin-top:2px}.ytomo-processing-overlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.3);z-index:100000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(1px);transition:all .3s ease;pointer-events:auto}.ytomo-processing-overlay.z-normal{z-index:100000}.ytomo-processing-overlay.z-below-fab{z-index:99999}.ytomo-processing-overlay.hidden{opacity:0;visibility:hidden;pointer-events:none}.ytomo-processing-overlay.visible{opacity:1;visibility:visible;pointer-events:auto}.ytomo-processing-overlay .processing-message-area{background:hsla(0,0%,100%,.95);border-radius:12px;padding:24px 32px;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.3);border:2px solid rgba(255,140,0,.3);max-width:400px;margin:20px}@media(max-width: 768px){.ytomo-processing-overlay .processing-message-area{padding:20px 24px;margin:16px;max-width:90vw}}.ytomo-processing-overlay .processing-message-text{font-size:20px;font-weight:bold;color:#333;margin-bottom:8px;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif}@media(max-width: 768px){.ytomo-processing-overlay .processing-message-text{font-size:18px;margin-bottom:6px}}.ytomo-processing-overlay .processing-target-text{font-size:16px;font-weight:600;color:#333;margin-bottom:12px;white-space:pre-line;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;text-align:center}@media(max-width: 768px){.ytomo-processing-overlay .processing-target-text{font-size:14px;margin-bottom:10px}}.ytomo-processing-overlay .processing-countdown-text{font-size:18px;font-weight:bold;color:#e67e00;margin-bottom:12px;font-family:"SF Mono","Monaco","Consolas",monospace;text-align:center;text-shadow:0 1px 2px rgba(0,0,0,.1)}@media(max-width: 768px){.ytomo-processing-overlay .processing-countdown-text{font-size:16px;margin-bottom:10px}}.ytomo-processing-overlay .processing-countdown-text.countdown-warning{color:#dc3545;animation:countdownPulse 1s ease-in-out infinite;text-shadow:0 0 8px rgba(220,53,69,.4)}.ytomo-processing-overlay .processing-warning-text{font-size:14px;color:#666;margin-bottom:16px;line-height:1.4;transition:all .3s ease}@media(max-width: 768px){.ytomo-processing-overlay .processing-warning-text{font-size:13px;margin-bottom:14px}}.ytomo-processing-overlay .processing-warning-text.warning-flash{color:#dc3545;font-weight:bold;transform:scale(1.05);animation:flash .5s ease-in-out 2}.ytomo-processing-overlay .processing-cancel-area{font-size:12px;color:#888;font-style:italic}@media(max-width: 768px){.ytomo-processing-overlay .processing-cancel-area{font-size:11px}}@keyframes flash{0%,100%{opacity:1}50%{opacity:.7}}@keyframes countdownPulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:.8;transform:scale(1.05)}}.ytomo-processing-overlay.efficiency-mode .processing-message-area{border-color:rgba(255,140,0,.5);background:linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(255, 248, 220, 0.95))}.ytomo-processing-overlay.efficiency-mode .processing-message-text{color:#e67e00}.ytomo-processing-overlay.monitoring-mode .processing-message-area{border-color:rgba(0,104,33,.5);background:linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(240, 255, 240, 0.95))}.ytomo-processing-overlay.monitoring-mode .processing-message-text{color:#004d1a}@media(prefers-reduced-motion: reduce){.ytomo-processing-overlay{transition:none}.ytomo-processing-overlay .processing-warning-text.warning-flash{animation:none;transform:none}}`, ""]);
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

/***/ 364:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Is: () => (/* binding */ isInterruptionAllowed),
/* harmony export */   MM: () => (/* binding */ setCacheManagerForSection6),
/* harmony export */   S9: () => (/* binding */ setCacheManager),
/* harmony export */   XG: () => (/* binding */ stopSlotMonitoring),
/* harmony export */   XP: () => (/* binding */ setEntranceReservationHelper),
/* harmony export */   ZK: () => (/* binding */ setPageLoadingState),
/* harmony export */   Zu: () => (/* binding */ restoreFromCache),
/* harmony export */   fp: () => (/* binding */ startSlotMonitoring),
/* harmony export */   p4: () => (/* binding */ waitForValidCalendarDate),
/* harmony export */   qy: () => (/* binding */ setUpdateMonitoringTargetsDisplay),
/* harmony export */   rY: () => (/* binding */ getCurrentSelectedCalendarDate),
/* harmony export */   startTimeSlotTableObserver: () => (/* binding */ startTimeSlotTableObserver),
/* harmony export */   wj: () => (/* binding */ analyzeAndAddMonitorButtons)
/* harmony export */ });
/* unused harmony exports waitForTimeSlotTable, checkTimeSlotTableExistsSync, analyzeTimeSlots, extractTimeSlotInfo, generateSelectorForElement, addMonitorButtonsToFullSlots, getMonitorButtonText, updateAllMonitorButtonPriorities, createMonitorButton, handleMonitorButtonClick, checkSlotAvailabilityAndReload, findTargetSlotInPageUnified, terminateMonitoring, checkTargetElementExists, checkMonitoringTargetExists, checkTimeSlotTableExistsAsync, validatePageLoaded, checkMaxReloads, clickCalendarDate, tryClickCalendarForTimeSlot, showErrorMessage, resetMonitoringUI, enableAllMonitorButtons, getCurrentTableContent, shouldUpdateMonitorButtons, restoreSelectionAfterUpdate, selectTimeSlotAndStartReservation, getCurrentEntranceConfig, getCurrentFabState, getCurrentMode, updateStatusBadge, resetPreviousSelection, disableOtherMonitorButtons, disableAllMonitorButtons, clearExistingMonitorButtons, getTargetDisplayInfo, scheduleReload, clearMonitoringFlagTimer, startReloadCountdown, stopReloadCountdown */
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(374);
/* harmony import */ var _entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(638);
/* harmony import */ var _processing_overlay__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(624);
/* harmony import */ var _entrance_page_fab__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(982);
/* harmony import */ var _entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(269);
// entrance-page-stateからのimport（もう使用しません）
// import { timeSlotState } from './entrance-page-state';
// 入場予約状態管理システムからのimport

// entrance-page-dom-utilsからのimport

// entrance-page-fabからのimport


// entrance-page-ui-helpersからのimport

// 【5. 時間帯監視・分析システム】
// ============================================================================
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
                const currentTableContent = getCurrentTableContent();
                if (currentTableContent === lastTableContent) {
                    console.log('📋 テーブル内容に変化なし、処理をスキップ');
                    return;
                }
                // console.log('🔍 有効な時間帯テーブル変更を検出');
                isProcessing = true;
                const hasTimeSlot = checkTimeSlotTableExistsSync();
                if (hasTimeSlot) {
                    // 現在の監視ボタンの状態をチェック
                    if (shouldUpdateMonitorButtons()) {
                        console.log('🎯 監視ボタンの更新が必要です');
                        setTimeout(() => {
                            // 差分更新処理（不要なボタン削除と新規ボタン追加）
                            analyzeAndAddMonitorButtons();
                            // 選択状態を復元
                            setTimeout(() => {
                                restoreSelectionAfterUpdate();
                                // テーブル内容を記録
                                lastTableContent = getCurrentTableContent();
                                isProcessing = false;
                            }, 200);
                        }, 300);
                    }
                    else {
                        console.log('✅ 監視ボタンは既に適切に配置されています');
                        lastTableContent = getCurrentTableContent();
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
            lastTableContent = getCurrentTableContent();
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
                    button.classList.add('btn-success-highlight');
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
        buttonElement.classList.add('js-enabled');
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
            enableAllMonitorButtons();
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
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
        // 監視対象表示も更新
        (0,_entrance_page_fab__WEBPACK_IMPORTED_MODULE_3__/* .updateMonitoringTargetsDisplay */ .yT)();
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
            // 既に監視対象に含まれている場合は解除処理を行う
            const isAlreadyMonitoring = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets().some((target) => target.timeSlot === slotInfo.timeText && target.locationIndex === locationIndex);
            if (isAlreadyMonitoring) {
                console.log(`🗑️ 監視対象解除: ${locationText}${slotInfo.timeText}`);
                const removed = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.removeMonitoringTarget(slotInfo.timeText, locationIndex);
                if (removed) {
                    // ボタンを満員状態に戻す
                    buttonSpan.innerText = '満員';
                    buttonElement.classList.remove('monitoring-status');
                    buttonElement.classList.add('full-status');
                    // キャッシュ更新
                    if (cacheManager) {
                        cacheManager.saveTargetSlots();
                    }
                    // メインボタン更新
                    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
                    console.log(`✅ 監視対象解除完了: ${locationText}${slotInfo.timeText}`);
                }
                return; // 解除処理完了
            }
            // 新規追加処理
            added = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.addMonitoringTarget(slotInfo.timeText, locationIndex, tdSelector);
            if (added) {
                console.log(`✅ 入場予約状態管理に監視対象を追加: ${locationText}${slotInfo.timeText}`);
            }
            else {
                console.log(`⚠️ 入場予約状態管理への追加失敗: ${locationText}${slotInfo.timeText}`);
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
        buttonElement.classList.add('js-enabled');
        buttonElement.disabled = false; // クリックで解除できるように
        // メインボタンの表示を更新
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
            const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
            const targetCount = targets.length;
            console.log(`🔄 監視対象設定後のFAB更新を実行: targetSlots=${targetCount}個`);
            console.log('📊 入場予約状態管理の監視対象一覧:', targets.map((t) => `${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(t.locationIndex) === 'east' ? '東' : '西'}${t.timeSlot}`));
        }
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
        // 監視対象表示も更新
        (0,_entrance_page_fab__WEBPACK_IMPORTED_MODULE_3__/* .updateMonitoringTargetsDisplay */ .yT)();
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
    // 状態確認（監視開始は呼び出し元で既に実行済み）
    const currentState = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getExecutionState();
    console.log(`📊 監視開始処理開始時の実行状態: ${currentState}`);
    if (currentState !== 'monitoring_running') {
        console.log('⚠️ 監視状態になっていません - 処理を中止');
        return;
    }
    // UI更新（監視開始状態を反映）- カウントダウン保護機能付き
    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
    // 監視対象表示も更新
    (0,_entrance_page_fab__WEBPACK_IMPORTED_MODULE_3__/* .updateMonitoringTargetsDisplay */ .yT)();
    // 誤動作防止オーバーレイを表示
    _processing_overlay__WEBPACK_IMPORTED_MODULE_2__/* .processingOverlay */ .OB.show('monitoring');
    // 監視実行中は全ての監視ボタンを無効化
    disableAllMonitorButtons();
    // 対象一貫性検証
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.validateTargetConsistency()) {
        console.error('🚨 監視対象が変更されたため処理を中断します');
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.stop();
        return;
    }
    const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
    const targetTexts = targets.map((t) => {
        const location = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .LocationHelper */ .Qs.getLocationFromIndex(t.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        return `${locationText}${t.timeSlot}`;
    }).join(', ');
    console.log(`🔄 時間帯監視を開始: ${targetTexts} (${targets.length}個)`);
    // 監視対象をキャッシュに保存（リロード後の復元用）
    if (cacheManagerSection6 && targets.length > 0) {
        try {
            const currentDate = getCurrentSelectedCalendarDate();
            if (currentDate) {
                // キャッシュに保存（統一状態管理システムから自動取得）
                cacheManagerSection6.saveTargetSlots();
                console.log(`💾 監視対象をキャッシュに保存: ${targets.length}個`);
            }
            else {
                console.log('⚠️ カレンダー日付が不明のためキャッシュ保存をスキップ');
            }
        }
        catch (error) {
            console.error('❌ 監視対象キャッシュ保存エラー:', error);
        }
    }
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
        // 自動リロードかどうかを判定（監視継続フラグの存在で判断）
        const isAutoReload = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx?.isMonitoringRunning() || false;
        if (isAutoReload) {
            console.log(`  → 自動リロード: 監視を終了し、自動選択+予約を開始します`);
            // ボタン表示を更新（見つかりましたモード）
            window.dispatchEvent(new CustomEvent('entrance-ui-update', {
                detail: { type: 'main-button', mode: 'found-available' }
            }));
            // 自動選択
            window.dispatchEvent(new CustomEvent('entrance-auto-select', {
                detail: { slot: currentSlot }
            }));
        }
        else {
            console.log(`  → 手動リロード: ステータス表示+監視対象削除+予約対象化`);
            // ステータスバッジに空き検出を表示
            const statusBadge = document.querySelector('#ytomo-status-badge');
            if (statusBadge) {
                statusBadge.innerText = `監視対象に空きが出ました\n${locationText}${currentSlot.targetInfo.timeSlot}`;
                statusBadge.classList.remove('js-hide');
            }
            // 該当監視対象を削除
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx?.removeMonitoringTarget(currentSlot.targetInfo.timeSlot, currentSlot.targetInfo.locationIndex);
            // 優先度最高の空き時間帯を予約対象として自動選択（自動予約は行わない）
            await handleManualReloadAvailableSlot(currentSlot);
        }
        return;
    }
    // まだ満員の場合はページリロード
    console.log('⏳ すべての監視対象がまだ満員です。ページを再読み込みします...');
    let totalWaitTime;
    let displaySeconds;
    // 効率モード時は00秒/30秒に同期、通常時は従来のランダム要素付き
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.isEfficiencyModeEnabled()) {
        // 次の00秒または30秒までの時間を計算
        let nextTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getNextSubmitTarget();
        if (nextTarget) {
            let remainingMs = nextTarget.getTime() - Date.now();
            // 15秒未満の場合は30秒加算
            if (remainingMs < 15000) {
                console.log(`⚡ 効率監視: 猶予${Math.floor(remainingMs / 1000)}秒は短いため30秒加算`);
                remainingMs += 30000; // 単純に30秒(30000ms)加算
                console.log(`🕒 加算後猶予: ${Math.floor(remainingMs / 1000)}秒`);
            }
            totalWaitTime = Math.max(1000, remainingMs); // 最低1秒
            displaySeconds = Math.floor(totalWaitTime / 1000);
        }
        else {
            // 標的時刻が設定されていない場合は通常処理
            const baseInterval = 30000;
            const randomVariation = Math.random() * 5000;
            totalWaitTime = baseInterval + randomVariation;
            displaySeconds = Math.floor(totalWaitTime / 1000);
        }
    }
    else {
        // 通常モード: BAN対策のランダム要素付き
        const baseInterval = 30000; // 30000ms (30秒)
        const randomVariation = Math.random() * 5000; // 0-5秒のランダム要素
        totalWaitTime = baseInterval + randomVariation;
        displaySeconds = Math.floor(totalWaitTime / 1000);
    }
    // カウントダウンとリロードを統一実行（フラグ保存処理付き）
    scheduleReload(displaySeconds);
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
                // 満員でも利用可能でもない場合（通常は満員状態での監視継続）
                if (currentStatus) {
                    console.log(`🔍 監視継続中: ${locationText}${target.timeSlot} (満員:${currentStatus.isFull}, 利用可能:${currentStatus.isAvailable}, 選択:${currentStatus.isSelected})`);
                }
                else {
                    console.log(`❓ 監視対象要素の状態が不明: ${locationText}${target.timeSlot} (status取得失敗)`);
                }
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
    resetMonitoringUI();
    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
    // エラー表示
    showErrorMessage(errorMessage);
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
        const calendarClicked = await tryClickCalendarForTimeSlot();
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
// 手動リロード時の空き時間帯処理
async function handleManualReloadAvailableSlot(_availableSlot) {
    try {
        console.log(`🎯 手動リロード: 優先度最高の空き時間帯を予約対象化`);
        // 利用可能な時間帯一覧を取得
        const availableSlots = getAllAvailableTimeSlots();
        if (availableSlots.length === 0) {
            console.log('⚠️ 利用可能な時間帯がありません');
            return;
        }
        // 優先度最高（最も早い時間）を選択
        const highestPrioritySlot = availableSlots[0];
        console.log(`🥇 最優先時間帯を選択: ${highestPrioritySlot.timeText}`);
        // 該当時間帯をクリックして予約対象に設定
        const targetElement = document.querySelector(highestPrioritySlot.tdSelector);
        if (targetElement) {
            const timeSlotButton = targetElement.querySelector('div[role="button"]');
            if (timeSlotButton) {
                console.log(`🖱️ 時間帯をクリック: ${highestPrioritySlot.timeText}`);
                timeSlotButton.click();
                // 少し待機してから状態を確認
                await new Promise(resolve => setTimeout(resolve, 500));
                // 予約対象として設定されたことを確認
                const locationIndex = highestPrioritySlot.locationIndex || 0;
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx?.setReservationTarget(highestPrioritySlot.timeText, locationIndex, highestPrioritySlot.tdSelector);
                console.log(`✅ 予約対象に設定完了: ${highestPrioritySlot.timeText}`);
            }
        }
    }
    catch (error) {
        console.error('❌ 手動リロード処理エラー:', error);
    }
}
// 利用可能な全時間帯を取得
function getAllAvailableTimeSlots() {
    const slots = [];
    const allElements = document.querySelectorAll(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotCells);
    allElements.forEach(element => {
        const status = extractTimeSlotInfo(element);
        if (status && status.isAvailable && !status.isFull) {
            const tdElement = element.closest('td[data-gray-out]');
            if (tdElement) {
                const locationIndex = Array.from(tdElement.parentElement?.children || []).indexOf(tdElement);
                slots.push({
                    timeText: status.timeText,
                    tdSelector: (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement),
                    locationIndex: locationIndex,
                    element: element,
                    status: status
                });
            }
        }
    });
    // 時間順（早い時間が優先）でソート
    return slots.sort((a, b) => a.timeText.localeCompare(b.timeText));
}
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
// updateMonitoringTargetsDisplayを設定するヘルパー関数（互換性のため保持）
const setUpdateMonitoringTargetsDisplay = (fn) => {
    console.log('setUpdateMonitoringTargetsDisplay called:', typeof fn);
};
// メインボタンの表示更新（FAB形式対応）
// FAB更新の状態管理（削除済み - entrance-page-ui-helpersで管理）
// 現在のFAB状態を文字列として取得
function getCurrentFabState() {
    if (!entranceReservationStateManager)
        return 'no-manager';
    const mode = getCurrentMode();
    const executionState = entranceReservationStateManager.getExecutionState();
    const hasReservation = entranceReservationStateManager.hasReservationTarget();
    const hasMonitoring = entranceReservationStateManager.hasMonitoringTargets();
    // 監視対象の実際の内容を含める
    const monitoringTargets = entranceReservationStateManager.getMonitoringTargets();
    const monitoringContent = monitoringTargets
        .map((target) => `${target.locationIndex}:${target.timeSlot}`)
        .sort()
        .join('|');
    return `${mode}-${executionState}-${hasReservation}-${hasMonitoring}-${monitoringContent}`;
}
// 古いupdateMainButtonDisplay関数は削除され、entrance-page-ui-helpersの関数を使用
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
        case 'monitoring_running':
            return 'monitoring';
        case 'idle':
            // 推奨アクションを確認
            const preferredAction = entranceReservationStateManager.getPreferredAction();
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
    let bgClass = 'status-bg-default';
    switch (mode) {
        case 'monitoring':
            const isEfficiencyEnabled = entranceReservationStateManager?.isEfficiencyModeEnabled();
            message = '監視実行中';
            const remainingSeconds = entranceReservationStateManager.getReloadSecondsRemaining();
            if (remainingSeconds !== null && remainingSeconds !== undefined) {
                if (remainingSeconds <= 3) {
                    message = `${isEfficiencyEnabled ? '効率' : ''}監視中`;
                    bgClass = 'status-bg-red'; // 赤色（中断不可）
                }
                else {
                    message = `${isEfficiencyEnabled ? '効率' : ''}監視中`;
                    bgClass = 'status-bg-orange'; // オレンジ色
                }
            }
            else {
                message = `${isEfficiencyEnabled ? '効率' : ''}監視実行中`;
                bgClass = 'status-bg-orange'; // オレンジ色
            }
            break;
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
            message = '監視準備完了';
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
        // 効率モードの5秒前警告（予約実行中・監視中両方）
        if ((mode === 'reservation-running' || mode === 'monitoring') && entranceReservationStateManager.isEfficiencyModeEnabled()) {
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
        // 状態管理システムによる更新に委譲
        if (entranceReservationStateManager) {
            entranceReservationStateManager.updateFabDisplay();
        }
    }
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
            button.classList.add('js-disabled');
            button.disabled = true;
        }
    });
}
// 全ての監視ボタンを無効化（監視実行中用）
function disableAllMonitorButtons() {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        button.classList.add('js-disabled');
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
// 監視/予約対象の表示情報を取得（簡潔版）
function getTargetDisplayInfo() {
    if (!entranceReservationStateManager) {
        return '不明';
    }
    const targets = entranceReservationStateManager.getMonitoringTargets();
    if (targets.length === 0) {
        return '不明';
    }
    const selectedDate = document.querySelector('[aria-pressed="true"] time[datetime]');
    // 各監視対象の東西を個別に判定（東/西時間の形式で統一）
    if (targets.length > 1) {
        const timeLocationTexts = targets.map((target) => {
            const location = LocationHelper.getLocationFromIndex(target.locationIndex);
            const locationText = location === 'east' ? '東' : '西';
            return `${locationText}${target.timeSlot || '不明'}`;
        }).join('\n');
        if (selectedDate) {
            const datetime = selectedDate.getAttribute('datetime');
            if (datetime) {
                const date = new Date(datetime);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                return `${dateStr}\n${timeLocationTexts}`;
            }
        }
        return timeLocationTexts;
    }
    else {
        // 単一監視対象の場合
        const target = targets[0];
        const location = LocationHelper.getLocationFromIndex(target.locationIndex);
        const locationText = location === 'east' ? '東' : '西';
        const timeText = target.timeSlot || '不明';
        if (selectedDate) {
            const datetime = selectedDate.getAttribute('datetime');
            if (datetime) {
                const date = new Date(datetime);
                const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
                return `${dateStr} ${locationText}${timeText}`;
            }
        }
        return `${locationText}${timeText}`;
    }
}
// 監視継続フラグ設定用タイマーID
let monitoringFlagTimerId = null;
// 統一されたリロードスケジュール関数
function scheduleReload(seconds = 30) {
    console.log(`🔄 統一リロードスケジュール開始: ${seconds}秒`);
    // 既存の監視継続フラグタイマーをクリア
    if (monitoringFlagTimerId !== null) {
        clearTimeout(monitoringFlagTimerId);
        monitoringFlagTimerId = null;
        console.log(`🗑️ 既存の監視継続フラグタイマーをクリア`);
    }
    // 入場予約状態管理システムでリロードカウントダウンを開始
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.scheduleReload(seconds);
        console.log(`📊 リロードスケジュール時の状態: ${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getExecutionState()}`);
    }
    // 監視継続フラグを設定（リロード5秒前）
    const flagDelay = Math.max(0, (seconds - 5) * 1000);
    monitoringFlagTimerId = setTimeout(() => {
        // 監視中断されていないかチェック
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx && _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getExecutionState() === 'monitoring_running') {
            if (cacheManagerSection6) {
                cacheManagerSection6.setMonitoringFlag(true);
                console.log(`🏃 監視継続フラグ設定（scheduleReload）`);
            }
        }
        else {
            console.log(`⚠️ 監視が中断されているため継続フラグ設定をスキップ`);
        }
        monitoringFlagTimerId = null;
    }, flagDelay);
    // 即座に一度UI更新
    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
}
// 監視継続フラグタイマーをクリア
function clearMonitoringFlagTimer() {
    if (monitoringFlagTimerId !== null) {
        clearTimeout(monitoringFlagTimerId);
        monitoringFlagTimerId = null;
        console.log(`🗑️ 監視継続フラグタイマーを強制クリア`);
    }
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
    if (entranceReservationStateManager) {
        entranceReservationStateManager.stopReloadCountdown();
    }
}
// ページ読み込み状態を設定
function setPageLoadingState(isLoading) {
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.setPageLoadingState(isLoading);
    }
    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
}
// 中断操作が許可されているかチェック
function isInterruptionAllowed() {
    // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        const isNearReload = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.isNearReload();
        // console.log(`🔍 中断可否チェック: nearReload=${isNearReload}`);
        return !isNearReload;
    }
    return true; // フォールバック：統合システムが利用できない場合は中断を許可
}
// ページ読み込み時のキャッシュ復元
async function restoreFromCache() {
    if (!cacheManagerSection6)
        return;
    // 監視継続フラグをチェック（監視の自動再開用）
    const shouldContinueMonitoring = cacheManagerSection6.getAndClearMonitoringFlag();
    const cached = cacheManagerSection6.loadTargetSlots();
    if (!cached)
        return;
    console.log('🔄 キャッシュから複数監視状態を復元中...');
    if (shouldContinueMonitoring) {
        console.log('✅ 監視継続フラグ: 有効 - 監視を自動再開します');
    }
    else {
        console.log('⚠️ 監視継続フラグ: 無効 - 監視は手動開始待ちです');
    }
    // キャッシュされた日付と現在のカレンダー日付を比較し、必要に応じて日付移動を実行
    if (cached.selectedDate && cached.targets && cached.targets.length > 0) {
        const currentSelectedDate = getCurrentSelectedCalendarDate();
        console.log(`📅 日付比較: キャッシュ=${cached.selectedDate}, 現在=${currentSelectedDate}`);
        if (cached.selectedDate !== currentSelectedDate) {
            console.log(`📅 監視対象の日付への移動が必要: ${cached.selectedDate}`);
            // カレンダーが利用可能になるまで待機
            const calendarReady = await waitForCalendar(5000);
            if (!calendarReady) {
                console.error('❌ カレンダーの準備完了を待機中にタイムアウトしました');
                return;
            }
            // 指定日付のカレンダーをクリック
            const dateClickSuccess = await clickCalendarDate(cached.selectedDate);
            if (!dateClickSuccess) {
                console.error(`❌ 監視対象の日付への移動に失敗: ${cached.selectedDate}`);
                return;
            }
            console.log(`✅ 監視対象の日付に移動完了: ${cached.selectedDate}`);
            // 日付移動後、時間帯テーブルが更新されるまで待機
            const tableReady = await waitForTimeSlotTable(5000);
            if (!tableReady) {
                console.error('❌ 時間帯テーブルの更新完了を待機中にタイムアウトしました');
                return;
            }
        }
    }
    // 監視対象を統一状態管理システムに復元
    if (cached.targets && cached.targets.length > 0) {
        console.log(`🔄 監視対象を統一状態管理システムに復元: ${cached.targets.length}個`);
        // 各監視対象を統一状態管理システムに追加
        for (const target of cached.targets) {
            try {
                const locationIndex = typeof target.locationIndex === 'number' ? target.locationIndex : 0;
                const timeSlot = target.timeSlot; // キャッシュ保存と復元でキー名統一済み
                console.log(`🔍 キャッシュデータ: timeSlot=${timeSlot}, locationIndex=${target.locationIndex} → 使用値=${locationIndex}`);
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.addMonitoringTarget(timeSlot, locationIndex, target.tdSelector || '');
                console.log(`✅ 監視対象追加: ${timeSlot} (位置: ${locationIndex})`);
            }
            catch (error) {
                console.error(`❌ 監視対象復元エラー: ${target.timeSlot}`, error);
            }
        }
        const totalTargets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets().length;
        console.log(`🎯 統一状態管理システムに復元完了: ${totalTargets}個の監視対象`);
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
        // 監視対象が復元された場合は監視ボタンを更新
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets()) {
            console.log('🔄 監視対象復元 - 監視ボタンを更新中...');
            try {
                await analyzeAndAddMonitorButtons();
                console.log('✅ 監視ボタン更新完了');
                // キャッシュ復元後、監視対象復元のタイミングでFABの監視対象とともに満員ボタンの状態も復元
                restoreSelectionAfterUpdate();
                console.log('✅ 監視ボタン状態復元完了');
            }
            catch (error) {
                console.error('❌ 監視ボタン更新エラー:', error);
            }
        }
        // メインボタンの表示更新
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
        // 監視継続フラグが有効な場合は自動監視再開
        if (shouldContinueMonitoring && _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets()) {
            console.log('🚀 監視継続フラグが有効 - 監視を自動再開します');
            try {
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.startMonitoring();
                (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
                await startSlotMonitoring();
            }
            catch (error) {
                console.error('❌ 監視自動再開エラー:', error);
            }
        }
        console.log('✅ キャッシュ復元完了');
    }, 200); // 監視ボタン更新のため遅延を少し延長
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
// 時間帯表示のためのカレンダー自動クリック機能
async function tryClickCalendarForTimeSlot() {
    console.log('📅 時間帯表示のためのカレンダークリックを試行中...');
    // 監視対象確認（情報表示のみ）
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx && _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets()) {
        const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
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
    errorDiv.className = 'ytomo-error-message';
    errorDiv.innerHTML = `
        <div class="error-title">⚠️ 監視エラー</div>
        <div>${message}</div>
        <button class="error-close-btn" onclick="this.parentElement.remove()">閉じる</button>
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
// 全ての監視ボタンを有効化
function enableAllMonitorButtons() {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span');
        // すべてのボタンを有効化
        button.classList.remove('js-disabled');
        button.classList.add('js-enabled');
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
    if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx || !_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets())
        return;
    const targets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets();
    const targetTexts = targets.map((t) => t.timeSlot).join(', ');
    console.log(`選択状態を復元中: ${targetTexts}`);
    // 該当する時間帯の監視ボタンを探して選択状態にする  
    const monitorButtons = document.querySelectorAll('.monitor-btn');
    console.log(`🔍 復元対象の監視ボタン数: ${monitorButtons.length}`);
    let restoredCount = 0;
    targets.forEach((target) => {
        console.log(`🔍 復元対象: ${target.timeSlot} (index: ${target.locationIndex}, selector: ${target.selector})`);
        let foundMatch = false;
        // 1. セレクタで直接検索（必須）
        if (target.selector) {
            const targetElement = document.querySelector(target.selector);
            if (targetElement) {
                // 2. 時間帯セレクタでの厳密な時間確認（追加検証）
                const timeSlotButton = targetElement.querySelector('div[role="button"] dt span');
                const actualTimeSlot = timeSlotButton ? timeSlotButton.textContent?.trim() || '' : '';
                const expectedTime = target.timeSlot;
                // 3. locationIndexの確認（追加検証）
                const buttonInTargetTd = targetElement.querySelector('.monitor-btn');
                if (buttonInTargetTd) {
                    const actualLocationIndex = parseInt(buttonInTargetTd.getAttribute('data-location-index') || '0');
                    // セレクタ、時間、locationIndexの三重チェック
                    const selectorMatch = true; // セレクタで見つかっている
                    const timeMatch = actualTimeSlot === expectedTime; // 厳密一致
                    const indexMatch = actualLocationIndex === target.locationIndex;
                    console.log(`🔍 検証結果: セレクタ=✅, 時間=${timeMatch ? '✅' : '❌'}(${actualTimeSlot}===${expectedTime}), index=${indexMatch ? '✅' : '❌'}(${actualLocationIndex}/${target.locationIndex})`);
                    if (selectorMatch && timeMatch && indexMatch) {
                        foundMatch = true;
                        const span = buttonInTargetTd.querySelector('span');
                        if (span) {
                            const priority = target.priority;
                            span.innerText = `監視${priority}`;
                            buttonInTargetTd.classList.remove('full-status');
                            buttonInTargetTd.classList.add('monitoring-status');
                            restoredCount++;
                            console.log(`✅ 完全一致で復元成功: ${target.timeSlot} (index: ${target.locationIndex})`);
                        }
                    }
                    else {
                        console.log(`⚠️ 部分的不一致: セレクタは見つかったが時間またはindexが一致しません`);
                    }
                }
                else {
                    console.log(`⚠️ セレクタは見つかったが監視ボタンが存在しません`);
                }
            }
            else {
                console.log(`❌ セレクタで要素が見つかりません: ${target.selector}`);
            }
        }
        else {
            console.log(`❌ セレクタが保存されていません`);
        }
        if (!foundMatch) {
            console.log(`❌ 復元対象が見つかりません: ${target.timeSlot} (index: ${target.locationIndex}, selector: ${target.selector})`);
        }
    });
    if (restoredCount === 0) {
        console.log(`⚠️ 復元に失敗しましたが、監視対象はクリアしません: ${targetTexts}`);
        console.log(`💡 DOM構造変化によるセレクタ無効化の可能性があります`);
        console.log(`💡 次回の監視実行時に自動的にセレクタが更新されます`);
        // 注意: 復元失敗でも監視対象をクリアしない（DOM構造変化の場合があるため）
    }
    else {
        console.log(`✅ 復元完了: ${restoredCount}/${targets.length}個の監視対象を復元しました`);
    }
    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
}
/*
// キャッシュ復元後の可用性チェック（一時的に無効化）
function checkAvailabilityAfterCacheRestore(): void {
    if (!entranceReservationStateManager || !entranceReservationStateManager.hasMonitoringTargets()) {
        return;
    }
    
    console.log('🔍 キャッシュ復元後の監視対象可用性をチェック中...');
    
    const monitoringTargets = entranceReservationStateManager.getMonitoringTargets();
    let availableCount = 0;
    
    for (const target of monitoringTargets) {
        const tdElement = document.querySelector(target.selector) as HTMLTableCellElement;
        if (!tdElement) continue;
        
        const buttonElement = tdElement.querySelector('div[role="button"]') as HTMLElement;
        if (!buttonElement) continue;
        
        // 満員かどうか確認（data-disabled属性の有無で判定）
        const isDisabled = buttonElement.getAttribute('data-disabled') === 'true';
        const isAvailable = !isDisabled;
        
        if (isAvailable) {
            availableCount++;
            console.log(`✅ 空きあり検出: ${target.timeSlot} (位置: ${target.locationIndex})`);
        }
    }
    
    if (availableCount > 0) {
        console.log(`🎉 ${availableCount}個の監視対象に空きが出ています - 既存処理に委ねます`);
        
        // 既存の自動/手動リロード時の空き検出処理を呼び出す
        // これにより統一された空き検出・自動予約ロジックが動作する
        handleAvailabilityDetected();
    } else {
        console.log('📋 すべての監視対象が満員状態です');
    }
}

// 空き検出時の処理（既存の自動/手動リロード処理と統合）
function handleAvailabilityDetected(): void {
    console.log('🔄 キャッシュ復元後の空き検出 - 既存の自動予約処理を実行');
    
    if (!entranceReservationStateManager || !entranceReservationStateManager.hasMonitoringTargets()) {
        return;
    }
    
    // 優先度最高の空き監視対象を取得
    const monitoringTargets = entranceReservationStateManager.getMonitoringTargets();
    let highestPriorityAvailable: any = null;
    
    for (const target of monitoringTargets) {
        const tdElement = document.querySelector(target.selector) as HTMLTableCellElement;
        if (!tdElement) continue;
        
        const buttonElement = tdElement.querySelector('div[role="button"]') as HTMLElement;
        if (!buttonElement) continue;
        
        const isAvailable = buttonElement.getAttribute('data-disabled') !== 'true';
        if (isAvailable && (!highestPriorityAvailable || target.priority < highestPriorityAvailable.priority)) {
            highestPriorityAvailable = target;
        }
    }
    
    if (highestPriorityAvailable) {
        console.log(`🎯 優先度最高の空き時間帯を自動選択: ${highestPriorityAvailable.timeSlot}`);
        
        // 自動リロードかどうかを判定
        const isAutoReload = entranceReservationStateManager.isMonitoringRunning() || false;
        
        if (isAutoReload) {
            console.log(`  → 自動リロード相当: 監視を終了し、自動選択+予約を開始`);
            
            // ボタン表示を更新（見つかりましたモード）
            window.dispatchEvent(new CustomEvent('entrance-ui-update', {
                detail: { type: 'main-button', mode: 'found-available' }
            }));
            
            // 自動選択イベントを発火
            const slotInfo = {
                targetInfo: {
                    timeSlot: highestPriorityAvailable.timeSlot,
                    tdSelector: highestPriorityAvailable.selector,
                    locationIndex: highestPriorityAvailable.locationIndex
                },
                timeText: highestPriorityAvailable.timeSlot
            };
            
            window.dispatchEvent(new CustomEvent('entrance-auto-select', {
                detail: { slot: slotInfo }
            }));
        } else {
            console.log(`  → 手動リロード相当: ステータス表示+監視対象削除+予約対象化`);
            
            // 手動リロード時の処理（監視対象から予約対象への移行）
            updateMainButtonDisplayHelper();
        }
    }
}
*/
// 時間帯を自動選択して予約開始
async function selectTimeSlotAndStartReservation(slotInfo) {
    const location = LocationHelper.getLocationFromIndex(LocationHelper.getIndexFromSelector(slotInfo.targetInfo.tdSelector));
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
        const selectedTimeSlot = document.querySelector(timeSlotSelectors.selectedSlot);
        const finalCheck = !!selectedTimeSlot;
        console.log(`🔍 予約開始前最終確認: 時間帯選択=${finalCheck ? '✅選択済み' : '❌未選択'}`);
        if (selectedTimeSlot) {
            const tdElement = selectedTimeSlot.closest('td');
            const status = extractTdStatus(tdElement);
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
        if (config) {
            // 統一予約開始処理を使用
            entranceReservationStateManager.startReservation();
            const result = await entranceReservationHelper(config);
            if (result.success) {
                // 入場予約状態管理に予約成功情報を設定
                if (entranceReservationStateManager) {
                    const reservationTarget = entranceReservationStateManager.getReservationTarget();
                    if (reservationTarget) {
                        entranceReservationStateManager.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                        updateMainButtonDisplayHelper(); // FAB表示更新
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
    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.stop();
    }
    // 監視継続フラグをクリア（手動停止なので継続させない）
    if (cacheManager) {
        cacheManager.clearMonitoringFlag();
    }
    // 監視継続フラグタイマーをクリア（重要：中断後のフラグ設定を防ぐ）
    clearMonitoringFlagTimer();
    // リロードカウントダウンの停止（入場予約状態管理システムで管理）
    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.stopReloadCountdown();
    // 誤動作防止オーバーレイを非表示
    _processing_overlay__WEBPACK_IMPORTED_MODULE_2__/* .processingOverlay */ .OB.hide();
    // 監視ボタンを有効化（操作可能に戻す）
    enableAllMonitorButtons();
    // メインボタンの表示を更新
    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
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
// ============================================================================


/***/ }),

/***/ 374:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  si: () => (/* binding */ ExecutionState),
  Qs: () => (/* binding */ LocationHelper),
  xx: () => (/* binding */ entranceReservationStateManager)
});

// UNUSED EXPORTS: EntranceReservationStateManager, PriorityMode

// EXTERNAL MODULE: ./src-modules/entrance-page-dom-utils.ts + 1 modules
var entrance_page_dom_utils = __webpack_require__(638);
// EXTERNAL MODULE: ./src-modules/entrance-page-core.ts
var entrance_page_core = __webpack_require__(364);
// EXTERNAL MODULE: ./src-modules/processing-overlay.ts
var processing_overlay = __webpack_require__(624);
;// ./src-modules/unified-automation-manager.ts
/**
 * 統一自動処理管理システム
 *
 * 全ての自動処理（予約、監視、効率モード待機）を統一管理し、
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
                processing_overlay/* processingOverlay */.OB.show(processType);
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
                processing_overlay/* processingOverlay */.OB.hide();
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
     * 統一監視処理実行（将来実装）
     */
    async executeMonitoringProcess() {
        return await this.runWithCancellation('monitoring', async (signal) => {
            return await this.monitoringLoop(signal);
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
        const maxAttempts = 100;
        console.log('🚀 統一予約処理ループを開始します...');
        while (attempts < maxAttempts) {
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
        console.log(`最大試行回数 (${maxAttempts}) に達しました。クールタイムを開始します。`);
        // クールタイム開始（状態管理経由）
        if (this.stateManager && this.stateManager.startReservationCooldown) {
            this.stateManager.startReservationCooldown();
        }
        return { success: false, attempts, cooldownStarted: true };
    }
    /**
     * 監視処理ループ（将来実装予定）
     */
    async monitoringLoop(_signal) {
        // 将来の監視処理統一時に実装
        console.log('🚧 監視処理ループ - 将来実装予定');
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

;// ./src-modules/entrance-reservation-state-manager.ts
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
    ExecutionState["RESERVATION_COOLDOWN"] = "reservation_cooldown";
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
        // 開始時対象キャッシュ（検証用）
        this.initialTargetCache = null;
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
        // 効率モード設定管理（常時有効）
        this.efficiencyMode = {
            enabled: true, // 常時有効に設定
            nextSubmitTarget: null,
            updateTimer: null // FABボタン更新タイマー
        };
        // changeダイアログ検出・調整管理
        this.changeDialogState = {
            hasAppeared: false, // 一度でもchangeダイアログが表示されたか
            needsTimingAdjustment: false // タイミング調整が必要か
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
        // 予約クールタイム管理
        this.reservationCooldown = {
            isActive: false,
            startTime: null,
            duration: 180000, // 3分（180秒）のクールタイム
            countdownInterval: null,
            remainingSeconds: null
        };
        // 統一自動処理管理を初期化
        this.automationManager = new UnifiedAutomationManager(this);
        console.log('📋 統一状態管理システム初期化完了');
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
        // 初回開始時の対象をキャッシュに保存
        this.saveInitialTargets();
        // 効率モード有効時は目標時刻を再計算
        if (this.efficiencyMode.enabled) {
            this.efficiencyMode.nextSubmitTarget = this.calculateNext00or30Seconds();
            this.log('⚡ 効率モード: 監視開始時に目標時刻を再計算');
        }
        this.log('👁️ 監視処理を開始');
        return true;
    }
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
    // 削除: startReservationExecution()はstartReservation()に統合
    // 予約中断フラグ設定
    setShouldStop(shouldStop) {
        this.reservationExecution.shouldStop = shouldStop;
        this.log(`🛑 予約中断フラグ: ${shouldStop}`);
        // Phase 1: 統一自動処理管理での中断処理を追加
        if (shouldStop && this.automationManager.isRunning()) {
            this.log('🛑 統一自動処理管理での即座中断を実行');
            this.automationManager.abort();
        }
        // 中断フラグのみ設定、状態変更は予約処理完了後に行う
        // （予約処理ループが完了するまで RESERVATION_RUNNING 状態を維持）
    }
    // ============================================================================
    // 開始時対象キャッシュ管理（検証用）
    // ============================================================================
    /**
     * 初回開始時の対象を保存
     */
    saveInitialTargets() {
        this.initialTargetCache = {
            reservationTarget: this.reservationTarget ? { ...this.reservationTarget } : null,
            monitoringTargets: this.monitoringTargets.map(target => ({ ...target })),
            timestamp: Date.now()
        };
        console.log('💾 初回開始時対象をキャッシュに保存');
        console.log('💾 予約対象:', this.initialTargetCache.reservationTarget);
        console.log('💾 監視対象:', this.initialTargetCache.monitoringTargets);
    }
    /**
     * 現在の対象が初回開始時と一致するかを検証
     * @returns true: 一致, false: 不一致（処理中断が必要）
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
        // 監視対象の検証
        const initialMonitoring = this.initialTargetCache.monitoringTargets;
        const currentMonitoring = this.monitoringTargets;
        if (initialMonitoring.length !== currentMonitoring.length) {
            console.error('🚨 監視対象数が変更されました！');
            console.error('🚨 初回:', initialMonitoring.length, '個');
            console.error('🚨 現在:', currentMonitoring.length, '個');
            return false;
        }
        // 監視対象の詳細検証
        for (let i = 0; i < initialMonitoring.length; i++) {
            const initial = initialMonitoring[i];
            const current = currentMonitoring.find(t => t.timeSlot === initial.timeSlot && t.locationIndex === initial.locationIndex);
            if (!current) {
                console.error('🚨 監視対象が削除されました！');
                console.error('🚨 削除された対象:', initial);
                return false;
            }
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
     * 統一効率モード待機処理実行
     * @param targetTime 目標時刻
     * @returns Promise<void>
     */
    async executeUnifiedEfficiencyWait(targetTime) {
        return await this.automationManager.executeEfficiencyWait(targetTime);
    }
    /**
     * 統一中断可能待機
     * @param ms 待機時間（ミリ秒）
     * @param signal 中断シグナル
     * @returns Promise<void>
     */
    async executeUnifiedWaitWithCancellation(ms, signal) {
        return await this.automationManager.waitWithCancellation(ms, signal);
    }
    /**
     * 統一予約処理実行
     * @param config 予約設定
     * @returns Promise<ReservationResult>
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
    // 予約クールタイム管理
    // ============================================================================
    // クールタイム開始（100回試行後に呼び出される）
    startReservationCooldown() {
        // 効率モード中はクールタイム不要
        if (this.efficiencyMode.enabled) {
            console.log('⚡ 効率モード中のためクールタイムをスキップ');
            return;
        }
        this.reservationCooldown.isActive = true;
        this.reservationCooldown.startTime = Date.now();
        this.reservationCooldown.remainingSeconds = Math.floor(this.reservationCooldown.duration / 1000);
        // 実行状態は変更しない（手動操作を妨げないため）
        // this.executionState = ExecutionState.RESERVATION_COOLDOWN; // 削除
        console.log(`⏳ 予約クールタイム開始: ${this.reservationCooldown.remainingSeconds}秒 (手動操作は可能)`);
        // カウントダウンインターバル設定
        this.reservationCooldown.countdownInterval = window.setInterval(() => {
            if (this.reservationCooldown.remainingSeconds !== null) {
                this.reservationCooldown.remainingSeconds--;
                if (this.reservationCooldown.remainingSeconds <= 0) {
                    this.endReservationCooldown();
                }
                else {
                    // UI更新（ステータスバッジ）
                    this.updateCooldownDisplay();
                }
            }
        }, 1000);
        // 初回UI更新
        this.updateCooldownDisplay();
    }
    // クールタイム終了
    endReservationCooldown() {
        if (this.reservationCooldown.countdownInterval) {
            clearInterval(this.reservationCooldown.countdownInterval);
            this.reservationCooldown.countdownInterval = null;
        }
        this.reservationCooldown.isActive = false;
        this.reservationCooldown.startTime = null;
        this.reservationCooldown.remainingSeconds = null;
        // クールタイム終了（実行状態は既にIDLEのまま）
        console.log('✅ クールタイム終了 - 予約再開可能');
        // FABボタンを通常状態に戻す
        this.resetFABButtonFromCooldown();
        // 予約対象がある場合は自動的に予約再開
        if (this.hasReservationTarget()) {
            console.log('🔄 予約対象があるため予約を自動再開');
            this.startReservation();
            // 予約処理は外部のFABクリック処理に委譲
        }
    }
    // クールタイム中かどうか
    isReservationCooldownActive() {
        return this.reservationCooldown.isActive;
    }
    // 残りクールタイム秒数を取得
    getCooldownSecondsRemaining() {
        return this.reservationCooldown.remainingSeconds;
    }
    // クールタイム表示を更新
    updateCooldownDisplay() {
        const remainingSeconds = this.reservationCooldown.remainingSeconds;
        if (remainingSeconds === null)
            return;
        // 段階別精度でカウントダウン表示
        let displayText;
        if (remainingSeconds > 60) {
            // 1分単位表示
            const minutes = Math.floor(remainingSeconds / 60);
            displayText = `予約待機中(${minutes}分)`;
        }
        else if (remainingSeconds > 10) {
            // 10秒単位表示
            const tens = Math.floor(remainingSeconds / 10) * 10;
            displayText = `予約待機中(${tens}秒)`;
        }
        else {
            // 1秒単位表示
            displayText = `予約待機中(${remainingSeconds}秒)`;
        }
        // ステータスバッジを更新
        this.updateStatusBadgeFromUnified('cooldown', displayText);
        // FABメインボタンの表示制御
        this.updateFABButtonForCooldown(remainingSeconds);
    }
    // クールタイム中のFABボタン表示を更新
    updateFABButtonForCooldown(remainingSeconds) {
        // 5秒前からは「予約再開中止」ボタンに変更
        const fabButton = document.querySelector('#ytomo-fab');
        if (!fabButton)
            return;
        if (remainingSeconds <= 5 && remainingSeconds > 0) {
            fabButton.textContent = '予約再開中止';
            fabButton.className = fabButton.className.replace(/cooldown-\w+/g, '').trim();
            fabButton.classList.add('cooldown-warning');
            fabButton.setAttribute('data-cooldown-cancel', 'true');
        }
        else {
            // 通常のクールタイム表示（手動操作可能状態）
            fabButton.textContent = '予約中断';
            fabButton.className = fabButton.className.replace(/cooldown-\w+/g, '').trim();
            fabButton.classList.add('cooldown-normal');
            fabButton.removeAttribute('data-cooldown-cancel');
        }
    }
    // クールタイム終了時にFABボタンを通常状態に戻す
    resetFABButtonFromCooldown() {
        const fabButton = document.querySelector('#ytomo-fab');
        if (!fabButton)
            return;
        fabButton.removeAttribute('data-cooldown-cancel');
        fabButton.className = fabButton.className.replace(/cooldown-\w+/g, '').trim();
        // ボタンテキストは updateMainButtonDisplay() で更新される
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
        // 予約対象が変更された場合はクールタイムを解除
        if (this.isReservationCooldownActive()) {
            console.log('🔄 予約対象変更により予約再開待ち状態を解除');
            this.endReservationCooldown();
        }
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
            if (!this.isReloadCountdownActive()) {
                // 予約対象なし（ログ削減）
            }
            return false;
        }
        // 2. 時間帯選択状態の確認
        const selectedSlot = document.querySelector(entrance_page_dom_utils/* timeSlotSelectors */.eN.selectedSlot);
        if (!selectedSlot) {
            // 時間帯未選択（ログ削減）
            return false;
        }
        // 予約対象あり（ログ削減）
        // 3. 選択時間帯の満員状態確認
        const tdElement = selectedSlot.closest('td[data-gray-out]');
        if (tdElement) {
            const status = (0,entrance_page_dom_utils/* extractTdStatus */.SE)(tdElement);
            if (status?.isFull) {
                return false;
            }
        }
        // 4. 来場日時ボタンの有効性確認
        const visitTimeButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq');
        if (!visitTimeButton || visitTimeButton.disabled) {
            console.log(`⚠️ 来場日時ボタンが無効: exists=${!!visitTimeButton}, disabled=${visitTimeButton?.disabled}`);
            console.log(`📵 すでに予約取得済みまたは予約不可能な状態のため予約開始を阻止`);
            return false;
        }
        // 5. カレンダー選択確認
        const selectedDate = (0,entrance_page_core/* getCurrentSelectedCalendarDate */.rY)();
        if (!selectedDate) {
            return false;
        }
        return true;
    }
    canStartMonitoring() {
        const result = this.monitoringTargets.length > 0;
        if (!this.isReloadCountdownActive()) {
            // 監視開始可否チェック（ログ削減）
        }
        if (!result && !this.efficiencyMode.updateTimer) {
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
        // デバッグログ追加（効率モードタイマー実行中はログ削減）
        if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
            // アクション判定（ログ削減）
            // ログ削減: 頻繁に呼ばれるため基本ログは削除
        }
        switch (this.priorityMode) {
            case PriorityMode.FORCE_RESERVATION:
                return canReserve ? 'reservation' : 'none';
            case PriorityMode.FORCE_MONITORING:
                return canMonitor ? 'monitoring' : 'none';
            case PriorityMode.AUTO:
            default:
                // 予約優先（両方可能な場合は予約を選択）
                if (canReserve) {
                    // 予約アクション選択（ログ削減）
                    if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                        // ログ削減: 戻り値ログを削除
                    }
                    return 'reservation';
                }
                if (canMonitor) {
                    // 監視アクション選択（ログ削減）
                    if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                        // ログ削減: 戻り値ログを削除
                    }
                    return 'monitoring';
                }
                // アクションなし（ログ削減）
                if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                    // ログ削減: 戻り値ログを削除
                }
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
            case ExecutionState.RESERVATION_COOLDOWN:
                return 'cooldown';
            case ExecutionState.IDLE:
                const preferredAction = this.getPreferredAction();
                return preferredAction !== 'none' ? 'enabled' : 'disabled';
        }
    }
    // FAB部分での予約対象情報表示用
    getFabTargetDisplayInfo() {
        // カウントダウン中・効率モードタイマー実行中はログを削減
        if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
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
            const displayText = `${dateText}\n予約成功🎉${locationText}${this.reservationSuccess.timeSlot}`;
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
        // 監視対象がある場合は監視対象を表示
        if (this.hasMonitoringTargets() && this.monitoringTargets.length > 0) {
            if (!this.isReloadCountdownActive()) {
                // ログ削減: 頻繁に呼ばれるため削除
            }
            // 優先度順にソート（priority昇順）
            const sortedTargets = [...this.monitoringTargets].sort((a, b) => a.priority - b.priority);
            const dateText = getDisplayDate();
            // 監視対象の表示（1件でも複数件でも統一形式）
            const targetTexts = sortedTargets.map(target => {
                const location = LocationHelper.getLocationFromIndex(target.locationIndex);
                const locationText = location === 'east' ? '東' : '西';
                const result = `${locationText}${target.timeSlot}`;
                if (!this.isReloadCountdownActive()) {
                    // ログ削減: 頻繁に呼ばれるため削除
                }
                return result;
            });
            const displayText = `${dateText}\n${targetTexts.join('\n')}`;
            if (!this.isReloadCountdownActive()) {
                // ログ削減: 頻繁に呼ばれるため削除
            }
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
            case ExecutionState.RESERVATION_COOLDOWN:
                return 'クール\nタイム中';
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
    getInitialTargetCache() {
        return this.initialTargetCache;
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
        const previousDate = this.selectedCalendarDate;
        this.selectedCalendarDate = date;
        this.log(`📅 カレンダー日付設定: ${date}`);
        // 日付が変更された場合はクールタイムを解除
        if (previousDate && previousDate !== date && this.isReservationCooldownActive()) {
            console.log(`🔄 日付変更 (${previousDate} → ${date}) により予約再開待ち状態を解除`);
            this.endReservationCooldown();
        }
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
                // 現在の監視対象をキャッシュに保存（キー名を復元時と統一）
                const cacheData = this.monitoringTargets.map(target => ({
                    timeSlot: target.timeSlot, // 復元時と同じキー名を使用
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
            case ExecutionState.RESERVATION_COOLDOWN:
                // クールタイム中は中断不可
                span.innerText = 'クール\nタイム中';
                // 既存のupdateStatusBadge関数を使用
                this.updateStatusBadgeFromUnified('cooldown');
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                mainButton.classList.add('state-idle');
                mainButton.title = 'クールタイム中（中断不可）';
                mainButton.disabled = true;
                console.log(`🔍 [FAB更新] クールダウン状態でdisabled=true設定: state=${executionState}`);
                break;
            case ExecutionState.MONITORING_RUNNING:
                // メインボタンは基本テキストを表示
                span.innerText = fabText;
                // 既存のupdateStatusBadge関数を使用
                this.updateStatusBadgeFromUnified('monitoring');
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                mainButton.classList.add('ytomo-fab-monitoring');
                mainButton.title = '監視中断';
                mainButton.disabled = false;
                break;
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
                const statusMode = preferredAction === 'monitoring' ? 'idle-monitoring' :
                    preferredAction === 'reservation' ? 'idle-reservation' : 'idle';
                this.updateStatusBadgeFromUnified(statusMode);
                mainButton.className = mainButton.className.replace(/state-\w+/g, '');
                if (preferredAction === 'monitoring') {
                    mainButton.classList.add('state-enabled', 'state-monitoring');
                    mainButton.title = '監視開始';
                    mainButton.disabled = false;
                }
                else if (preferredAction === 'reservation') {
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
        // カウントダウン中は完了ログも削減
        if (!this.isReloadCountdownActive()) {
            // FAB更新完了ログを削減
        }
        // 【システム連動】オーバーレイ表示中はFABボタンを強制有効化
        const processingOverlay = document.getElementById('ytomo-processing-overlay');
        if (processingOverlay && !processingOverlay.classList.contains('hidden')) {
            if (mainButton.disabled) {
                mainButton.disabled = false;
                console.log('🛡️ [システム連動] オーバーレイ表示中につき中断ボタンを強制有効化');
            }
        }
        // 監視対象リスト表示も更新
        this.updateMonitoringTargetsDisplay();
    }
    // 監視対象リストの表示を更新
    updateMonitoringTargetsDisplay() {
        const reservationTargetElement = document.getElementById('ytomo-reservation-target');
        const monitoringTargetsElement = document.getElementById('ytomo-monitoring-targets');
        if (!reservationTargetElement && !monitoringTargetsElement) {
            console.log('🔍 [対象表示更新] 予約対象・監視対象要素が見つかりません');
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
                if (!this.isReloadCountdownActive() && !this.efficiencyMode.updateTimer) {
                    console.log(`🔍 [予約対象表示更新] 表示: "${displayInfo.displayText}"`);
                }
            }
            else {
                reservationTargetElement.classList.remove('visible');
                reservationTargetElement.classList.add('hidden');
                reservationTargetElement.innerHTML = '';
            }
        }
        // 監視対象表示エリアの更新
        if (monitoringTargetsElement) {
            if (displayInfo.hasTarget && displayInfo.targetType === 'monitoring') {
                monitoringTargetsElement.innerHTML = displayInfo.displayText.replace(/\n/g, '<br>');
                // 表示状態の設定（背景色はSCSSで固定）
                monitoringTargetsElement.classList.remove('hidden');
                monitoringTargetsElement.classList.add('visible');
                // カウントダウン中はログを削減
                if (!this.isReloadCountdownActive()) {
                    console.log(`🔍 [監視対象表示更新] 表示: "${displayInfo.displayText}"`);
                }
            }
            else {
                monitoringTargetsElement.classList.remove('visible');
                monitoringTargetsElement.classList.add('hidden');
                monitoringTargetsElement.innerHTML = '';
            }
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
    // 既存のupdateStatusBadge関数を呼び出すヘルパー
    updateStatusBadgeFromUnified(mode, customText) {
        // 循環依存を避けるため、DOM直接操作で簡易実装
        const statusBadge = document.querySelector('#ytomo-status-badge');
        if (!statusBadge)
            return;
        // 既存の状態クラスをクリア
        statusBadge.className = statusBadge.className.replace(/ytomo-status-\w+/g, '').trim();
        switch (mode) {
            case 'monitoring':
                statusBadge.classList.add('ytomo-status-monitoring');
                const prefix = this.isEfficiencyModeEnabled() ? '効率' : '';
                statusBadge.innerText = `${prefix}監視中`;
                statusBadge.classList.remove('js-hide');
                break;
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
            case 'cooldown':
                statusBadge.classList.add('ytomo-status-cooldown');
                statusBadge.innerText = customText || '予約待機中';
                statusBadge.classList.remove('js-hide');
                break;
            case 'idle-monitoring':
                statusBadge.classList.add('ytomo-status-waiting');
                statusBadge.innerText = '監視可能';
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
    // changeダイアログ管理
    // ============================================================================
    // changeダイアログが表示されたことを記録
    markChangeDialogAppeared() {
        console.log(`🔄 [markChangeDialogAppeared] 現在の状態: hasAppeared=${this.changeDialogState.hasAppeared}, needsTimingAdjustment=${this.changeDialogState.needsTimingAdjustment}`);
        this.changeDialogState.hasAppeared = true;
        this.changeDialogState.needsTimingAdjustment = true;
        console.log('🔄 changeダイアログ出現を検出 - 毎回タイミング調整が必要');
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

/***/ 624:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Eh: () => (/* binding */ checkAndShowEarlyOverlay),
/* harmony export */   OB: () => (/* binding */ processingOverlay)
/* harmony export */ });
/* unused harmony export ProcessingOverlay */
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(374);
/**
 * 自動処理中の誤動作防止オーバーレイシステム
 *
 * 予約実行中・監視中に画面全体を薄いオーバーレイで覆い、
 * 中断ボタン以外の操作を防ぐことで誤動作を防止
 */

class ProcessingOverlay {
    constructor() {
        this.overlayElement = null;
        this.isActive = false;
        this.countdownTimer = null;
        this.initializeOverlay();
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
        if (processType === 'monitoring') {
            // キャッシュから監視対象情報を取得（実行中の変動を避ける）
            let targetInfo = '対象なし';
            try {
                // キャッシュから直接読み込み
                const generateKey = (suffix = '') => {
                    const url = new URL(window.location.href);
                    const baseKey = `expo2025_entrance_${url.searchParams.get('reserve_id') || 'default'}`;
                    return suffix ? `${baseKey}_${suffix}` : baseKey;
                };
                const cachedData = localStorage.getItem(generateKey('target_slots'));
                console.log('🔍 [中央オーバーレイ] キャッシュデータ:', cachedData);
                if (cachedData) {
                    const parsed = JSON.parse(cachedData);
                    if (parsed.targets && parsed.targets.length > 0) {
                        // 日付情報を追加（0paddingを除去）
                        const dateInfo = parsed.selectedDate || '';
                        const dateDisplay = dateInfo ? dateInfo.split('-').slice(1).map((part) => parseInt(part, 10).toString()).join('/') : '';
                        const targets = parsed.targets.map((t) => {
                            const location = t.locationIndex === 0 ? '東' : '西';
                            return `${location}${t.timeSlot}`;
                        }).join(', ');
                        targetInfo = `${dateDisplay}\n${targets}`;
                        console.log('🔍 [中央オーバーレイ] キャッシュから対象情報取得:', targetInfo);
                    }
                }
                else {
                    // フォールバック: entranceReservationStateManagerから取得
                    if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx) {
                        const monitoringTargets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getMonitoringTargets() || [];
                        console.log('🔍 [中央オーバーレイ] フォールバック監視対象:', monitoringTargets);
                        if (monitoringTargets.length > 0) {
                            targetInfo = monitoringTargets.map((t) => {
                                const location = t.locationIndex === 0 ? '東' : '西';
                                return `${location}${t.timeSlot}`;
                            }).join(', ');
                        }
                    }
                }
            }
            catch (error) {
                console.error('🔍 [中央オーバーレイ] キャッシュ読み込みエラー:', error);
                targetInfo = '対象情報取得エラー';
            }
            // ログ削減: 最終テキストログを削除
            if (messageText)
                messageText.textContent = '監視実行中...';
            if (targetText)
                targetText.textContent = targetInfo;
        }
        else {
            // 予約対象の情報を取得
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
        // 表示アニメーション
        this.overlayElement.classList.remove('hidden');
        this.overlayElement.classList.add('visible');
        // FABボタンのz-indexを調整（オーバーレイより前面に）
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (fabContainer) {
            fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-above-overlay';
        }
        // 【システム連動】オーバーレイ表示中は必ずFABボタンを有効化（中断可能にする）
        const mainFabButton = document.getElementById('ytomo-main-fab');
        if (mainFabButton) {
            mainFabButton.disabled = false;
            console.log('🛡️ [システム連動] オーバーレイ表示につき中断ボタンを強制有効化');
        }
        this.isActive = true;
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
        const fabContainer = document.getElementById('ytomo-fab-container');
        if (fabContainer) {
            fabContainer.className = fabContainer.className.replace(/z-\w+/g, '').trim() + ' z-normal';
        }
        this.isActive = false;
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
            // 監視中のリロードカウントダウン
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getExecutionState() === _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .ExecutionState */ .si.MONITORING_RUNNING) {
                if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.isReloadCountdownActive()) {
                    const remainingSeconds = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationStateManager */ .xx.getReloadSecondsRemaining();
                    if (remainingSeconds !== null && remainingSeconds > 0) {
                        const countdownText = `リロード: ${remainingSeconds}秒後`;
                        const isWarning = remainingSeconds <= 5;
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
// 早期初期化関数（リロード直後の誤操作防止）
function checkAndShowEarlyOverlay() {
    try {
        // 監視フラグをチェック
        const flagData = localStorage.getItem('expo2025_monitoring_flag');
        if (!flagData)
            return;
        const parsed = JSON.parse(flagData);
        if (!parsed.isMonitoring)
            return;
        // フラグの有効期限チェック（10分以内）
        const elapsed = Date.now() - parsed.timestamp;
        if (elapsed > 10 * 60 * 1000) {
            localStorage.removeItem('expo2025_monitoring_flag');
            return;
        }
        console.log('🚨 リロード直後: 監視継続フラグを検出、即座にオーバーレイ表示');
        // 早期オーバーレイを表示
        const overlay = new ProcessingOverlay();
        overlay.show('monitoring');
        // 【システム連動】早期オーバーレイでもFABボタンを有効化
        setTimeout(() => {
            const mainFabButton = document.getElementById('ytomo-main-fab');
            if (mainFabButton) {
                mainFabButton.disabled = false;
                console.log('🚨 [早期システム連動] 中断ボタンを強制有効化');
            }
        }, 100);
        // 一定時間後に通常の初期化で引き継がれるまで維持
        setTimeout(() => {
            // 通常の初期化が完了していない場合のみ非表示
            if (!document.getElementById('ytomo-fab-container')) {
                console.log('🚨 早期オーバーレイ: 通常初期化が遅れているため維持継続');
            }
        }, 3000);
    }
    catch (error) {
        console.error('🚨 早期オーバーレイ表示エラー:', error);
    }
}
// グローバルインスタンス
const processingOverlay = new ProcessingOverlay();


/***/ }),

/***/ 638:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {


// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  SE: () => (/* binding */ extractTdStatus),
  e0: () => (/* binding */ findSameTdElement),
  sN: () => (/* binding */ generateUniqueTdSelector),
  Yz: () => (/* binding */ initTimeSlotMonitoring),
  eN: () => (/* binding */ timeSlotSelectors)
});

// UNUSED EXPORTS: getTdPositionInfo, tableSelectors, waitForCalendar

;// ./src-modules/timeslot-status-detector.ts
/**
 * 時間帯状態判定の統一関数
 * DOM要素を与えて状態を返すシンプルな共通関数
 */
/**
 * 時間帯セル（td要素）の状態を判定する統一関数
 * @param tdElement 時間帯のtd要素
 * @returns 状態情報またはnull
 */
function detectTimeslotStatus(tdElement) {
    if (!tdElement)
        return null;
    // DOM構造: .btnDivまたはdiv[role="button"]
    const buttonDiv = (tdElement.querySelector('.btnDiv') || tdElement.querySelector('div[role="button"]'));
    if (!buttonDiv) {
        console.log(`🔍 [統一関数] buttonDiv not found in td:`, tdElement.innerHTML.substring(0, 200));
        return null;
    }
    // 時間帯テキストを取得
    const timeSpan = buttonDiv.querySelector('dt span');
    const timeText = timeSpan ? timeSpan.textContent?.trim() || '' : '';
    // 詳細な判定: 属性とアイコンの両方を確認
    const isDisabledByAttr = buttonDiv.getAttribute('data-disabled') === 'true';
    const hasFullIcon = !!buttonDiv.querySelector('img[src*="/asset/img/calendar_ng.svg"], img[alt*="満員"], img[alt*="予約不可"]');
    const hasAvailableIcon = !!buttonDiv.querySelector('img[src*="/asset/img/ico_scale_low.svg"], img[src*="/asset/img/ico_scale_high.svg"], img[alt*="空いて"], img[alt*="混雑"]');
    const isSelected = buttonDiv.getAttribute('aria-pressed') === 'true';
    // 状態判定のロジック（analyzeTimeSlotsと同じ）
    const isFull = hasFullIcon || isDisabledByAttr;
    const isAvailable = !isDisabledByAttr && hasAvailableIcon;
    let statusType;
    if (isFull) {
        statusType = 'full';
    }
    else if (isSelected) {
        statusType = 'selected';
    }
    else if (isAvailable) {
        statusType = 'available';
    }
    else {
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
function detectTimeslotStatusFromButton(buttonElement) {
    if (!buttonElement)
        return null;
    const tdElement = buttonElement.closest('td');
    return detectTimeslotStatus(tdElement);
}

;// ./src-modules/entrance-page-dom-utils.ts
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
    const { startTimeSlotTableObserver } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 364));
    startTimeSlotTableObserver();
    console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
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

/***/ 982:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DT: () => (/* binding */ createEntranceReservationUI),
/* harmony export */   FX: () => (/* binding */ entranceReservationHelper),
/* harmony export */   TP: () => (/* binding */ setCacheManagerForSection7),
/* harmony export */   il: () => (/* binding */ waitForTimeSlotTable),
/* harmony export */   startCalendarWatcher: () => (/* binding */ startCalendarWatcher),
/* harmony export */   yT: () => (/* binding */ updateMonitoringTargetsDisplay)
/* harmony export */ });
/* unused harmony exports getCurrentReservationTarget, checkVisitTimeButtonState, checkTimeSlotSelected, canStartReservation, checkInitialState, handleCalendarChange, removeAllMonitorButtons */
/* harmony import */ var _processing_overlay__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(624);
/* harmony import */ var _entrance_page_state__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(278);
/* harmony import */ var _entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(638);
/* harmony import */ var _entrance_page_core__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(364);
/* harmony import */ var _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(374);
/* harmony import */ var _entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(269);
// Phase 3: 統一処理移行により個別importは不要
// entrance-page-stateからのimport


// entrance-page-dom-utilsからのimport

// entrance-page-monitorからのimport

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
    const statusClass = color === 'green' ? 'ytomo-status-monitoring' :
        color === 'red' ? 'ytomo-status-countdown-warning' :
            color === 'orange' ? 'ytomo-status-cooldown' :
                color === 'blue' ? 'ytomo-status-reservation' :
                    'ytomo-status-waiting';
    statusBadge.classList.add(statusClass);
    statusBadge.classList.remove('js-hide');
    // 一定時間後に状態管理システムに更新を委譲（エラー、成功、中断メッセージ以外）
    if (color !== 'red' && color !== 'green' && color !== 'orange') {
        setTimeout(() => {
            // 状態管理システムによる更新に委譲
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx) {
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.updateFabDisplay();
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
    // 監視対象表示エリア（目立つ表示）
    const monitoringTargetsDisplay = document.createElement('div');
    monitoringTargetsDisplay.id = 'ytomo-monitoring-targets';
    monitoringTargetsDisplay.className = 'ytomo-monitoring-targets-display hidden';
    monitoringTargetsDisplay.title = 'クリックで詳細表示';
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
        if (!(0,_entrance_page_core__WEBPACK_IMPORTED_MODULE_3__/* .isInterruptionAllowed */ .Is)()) {
            // リロード直前のため中断不可
            showStatus('リロード直前のため中断できません', 'red');
            return;
        }
        // クールタイム中の予約再開中止処理
        if (fabButton.hasAttribute('data-cooldown-cancel')) {
            if (confirm('予約の自動再開を中止しますか？\n\n手動での予約開始は引き続き可能です。')) {
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.endReservationCooldown();
                showStatus('予約再開を中止しました', 'orange');
                (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
            }
            return;
        }
        // 実行中の場合は中断処理（入場予約状態管理システム使用）
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.isMonitoringRunning()) {
            stopMonitoringProcess();
            return;
        }
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.isReservationRunning()) {
            stopReservationProcess();
            return;
        }
        // 入場予約状態管理システムを使用した監視開始判定
        const preferredAction = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getPreferredAction();
        // FABクリック処理開始
        if (preferredAction === 'monitoring') {
            await startMonitoringProcess();
        }
        else if (preferredAction === 'reservation') {
            await startReservationProcess();
        }
        else {
            console.log('⚠️ 入場予約状態管理システム: 実行可能なアクションなし');
        }
        return;
    });
    // 監視中断処理
    function stopMonitoringProcess() {
        console.log('⏹️ 監視を中断');
        (0,_entrance_page_core__WEBPACK_IMPORTED_MODULE_3__/* .stopSlotMonitoring */ .XG)();
        // 誤動作防止オーバーレイを非表示
        _processing_overlay__WEBPACK_IMPORTED_MODULE_0__/* .processingOverlay */ .OB.hide();
        showStatus('監視中断', 'orange');
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
    }
    // 予約中断処理
    function stopReservationProcess() {
        console.log('⏹️ 予約を中断');
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.setShouldStop(true);
        showStatus('予約処理を中断中...', 'orange');
        // 中断フラグ設定後、UIを即座に更新
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
    }
    // 監視開始処理
    async function startMonitoringProcess() {
        console.log('📡 入場予約状態管理システムによる監視開始');
        // 状態変更前の確認
        console.log(`🔍 [FAB] 監視開始前の状態: ${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getExecutionState()}`);
        console.log(`🔍 [FAB] 監視対象数: ${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getMonitoringTargetCount()}`);
        console.log(`🔍 [FAB] 監視開始可能: ${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.canStartMonitoring()}`);
        // 実行状態を監視中に変更
        const startSuccess = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.startMonitoring();
        console.log(`🔍 [FAB] startMonitoring結果: ${startSuccess}`);
        console.log(`🔍 [FAB] 監視開始後の状態: ${_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getExecutionState()}`);
        // 即座にUI更新してから監視開始
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
        await (0,_entrance_page_core__WEBPACK_IMPORTED_MODULE_3__/* .startSlotMonitoring */ .fp)();
    }
    // 予約開始処理
    async function startReservationProcess() {
        console.log('🚀 入場予約状態管理システムによる予約開始');
        // DOM状態から予約対象を同期（予約開始前に必須）
        syncReservationTargetFromDOM();
        // 統一予約開始処理
        if (!_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.startReservation()) {
            console.error('❌ 予約開始に失敗しました');
            showStatus('予約開始失敗', 'red');
            return;
        }
        console.log('🔄 予約開始成功、FABボタン状態更新中...');
        // デバッグ: 実行状態を確認
        const currentState = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getExecutionState();
        console.log(`🔄 [予約開始後] 実行状態: ${currentState}`);
        // 監視中から予約に切り替わった場合にオーバーレイを更新
        _processing_overlay__WEBPACK_IMPORTED_MODULE_0__/* .processingOverlay */ .OB.show('reservation');
        showStatus('予約処理実行中...', 'blue');
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
        // デバッグ: FABボタンの現在の状態を確認
        const mainButton = document.getElementById('ytomo-main-fab');
        if (mainButton) {
            console.log(`🔄 [予約開始後] FABボタン状態: disabled=${mainButton.disabled}, title="${mainButton.title}"`);
        }
        updateMonitoringTargetsDisplay(); // 予約対象を表示
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
        const reservationTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getReservationTarget();
        console.log('🔍 予約開始前の対象情報:', reservationTarget);
        try {
            const result = await entranceReservationHelper(config);
            console.log('🔍 entranceReservationHelper戻り値:', result);
            if (result.success) {
                showStatus(`🎉 予約成功！(${result.attempts}回試行)`, 'green');
                // 予約開始前に保存した対象情報で成功情報を設定
                if (reservationTarget) {
                    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.setReservationSuccess(reservationTarget.timeSlot, reservationTarget.locationIndex);
                    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)(); // FAB表示更新
                    console.log('✅ 予約成功UI更新完了');
                }
                else {
                    console.warn('⚠️ 予約開始前の対象情報がnullのためUI更新をスキップ');
                }
                if (cacheManager) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                    cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
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
                else if (result.cooldownStarted) {
                    showStatus(`予約失敗 (${result.attempts}回試行) - クールタイム開始`, 'orange');
                    console.log('🛑 100回試行後、クールタイムが開始されました');
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
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.stop();
            (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
            updateMonitoringTargetsDisplay(); // 予約終了時に表示更新
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
    // FABコンテナに要素を追加（上から順：予約対象→監視対象→ステータス→ボタン）
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
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.toggleEfficiencyMode();
        updateEfficiencyToggleButton();
    });
    // ホバー効果はCSSで制御
    fabContainer.appendChild(reservationTargetDisplay);
    fabContainer.appendChild(monitoringTargetsDisplay);
    fabContainer.appendChild(statusBadge);
    fabContainer.appendChild(efficiencyToggleButton);
    fabContainer.appendChild(fabButton);
    // DOMに追加（body直下）
    document.body.appendChild(fabContainer);
    // 効率モード設定を読み込み
    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.loadEfficiencyModeSettings();
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
            // 監視を停止
            if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.isMonitoringRunning()) {
                console.log('🛑 監視を停止');
                (0,_entrance_page_core__WEBPACK_IMPORTED_MODULE_3__/* .stopSlotMonitoring */ .XG)();
            }
            // 該当監視対象を削除
            const timeSlot = slot.targetInfo.timeSlot;
            const locationIndex = slot.targetInfo.locationIndex;
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.removeMonitoringTarget(timeSlot, locationIndex);
            // オーバーレイを確実に非表示にして状態をリセット
            console.log('🛡️ 監視→予約移行: オーバーレイ状態をリセット');
            _processing_overlay__WEBPACK_IMPORTED_MODULE_0__/* .processingOverlay */ .OB.hide();
            // 1. 時間帯要素をクリックして選択状態にする
            console.log(`🖱️ 自動選択: 時間帯をクリック ${timeSlot}`);
            const timeSlotElement = document.querySelector(slot.targetInfo.selector);
            if (timeSlotElement) {
                const buttonElement = timeSlotElement.querySelector('div[role="button"]');
                if (buttonElement && buttonElement.getAttribute('data-disabled') !== 'true') {
                    buttonElement.click();
                    console.log(`✅ 時間帯選択完了: ${timeSlot}`);
                    // 2. 選択後、少し待ってから内部的に自動予約を開始
                    setTimeout(async () => {
                        console.log('🚀 内部的に自動予約を開始');
                        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.canStartReservation()) {
                            await startReservationProcess();
                        }
                        else {
                            console.error('❌ 予約開始条件が満たされていません');
                        }
                    }, 100);
                }
                else {
                    console.error(`❌ 時間帯ボタンが見つからないか無効: ${timeSlot}`);
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
    (0,_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.loadFABVisibility)();
    (0,_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.updateFABVisibility)();
    // 初期状態を判定してFABを更新
    waitForTimeSlotTable(() => {
        checkInitialState();
    });
    // 時間帯クリックハンドラーを設定（選択解除機能付き）
    waitForTimeSlotTable(() => {
        setupTimeSlotClickHandlers();
    });
    // カレンダー変更監視は別途初期化処理で開始（キャッシュ復元後）
}
// 監視対象表示を更新（統一システムに完全委譲）
function updateMonitoringTargetsDisplay() {
    console.log('🔄 [updateMonitoringTargetsDisplay] 統一システムに委譲');
    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.updateFabDisplay();
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
    if (status && status.isFull) {
        console.log('⚠️ 選択された時間帯は満員です');
        return false;
    }
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
    const currentState = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getExecutionState();
    const preferredAction = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getPreferredAction();
    if (currentState !== _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .ExecutionState */ .si.IDLE) {
        console.log(`🔄 統一システム実行中 (${currentState}) - 初期状態チェックをスキップ`);
        return;
    }
    if (preferredAction === 'monitoring' || preferredAction === 'reservation') {
        console.log(`🔄 統一システムがアクション決定済み (${preferredAction}) - 初期状態チェックをスキップ`);
        return;
    }
    // 【統一システム完全委譲】FABボタン状態は統一システムが一元管理
    console.log('🔄 FABボタン状態は統一システムに完全委譲');
    // 統一システムに状態更新を要求
    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.updateFabDisplay();
}
// カレンダー変更を監視して監視ボタンを再設置
function startCalendarWatcher() {
    if (_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.isWatching)
        return;
    _entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.isWatching = true;
    _entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.currentSelectedDate = (0,_entrance_page_core__WEBPACK_IMPORTED_MODULE_3__/* .getCurrentSelectedCalendarDate */ .rY)();
    // 初期化時に入場予約状態管理にも現在の選択日付を設定
    if (_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.currentSelectedDate) {
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.setSelectedCalendarDate(_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.currentSelectedDate);
        console.log(`📅 初期化時の選択日付を設定: ${_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.currentSelectedDate}`);
    }
    console.log('📅 カレンダー変更監視を開始');
    // MutationObserverでカレンダー変更・時間帯選択・ボタン状態変更を検出
    _entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.observer = new MutationObserver((mutations) => {
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
                    if (ariaPressed === 'true' && !_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.isInitializing) {
                        // 選択状態変更を検出 - DOM状態から予約対象を同期
                        console.log(`🔄 時間帯選択状態を検出`);
                        setTimeout(() => {
                            syncReservationTargetFromDOM();
                            (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
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
    // カレンダー要素全体を監視
    const observeTarget = document.body;
    _entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.observer.observe(observeTarget, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-pressed', 'class', 'disabled']
    });
}
// カレンダー変更・状態変更時の処理
async function handleCalendarChange() {
    // 動的待機で日付を取得（遷移中の場合は適切に待機）
    const newSelectedDate = await (0,_entrance_page_core__WEBPACK_IMPORTED_MODULE_3__/* .waitForValidCalendarDate */ .p4)(3000, 100);
    const calendarDateChanged = newSelectedDate !== _entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.currentSelectedDate;
    // 入場予約状態管理の管理している日付とも比較
    const stateManagerSelectedDate = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.getSelectedCalendarDate();
    const actualDateChanged = newSelectedDate !== stateManagerSelectedDate;
    if (calendarDateChanged) {
        console.log(`📅 カレンダー日付変更を検出: ${_entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.currentSelectedDate} → ${newSelectedDate}`);
        // 監視実行中は日付変更を無視
        if (_entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.isMonitoringRunning()) {
            console.log('⚠️ 監視実行中のため日付変更を無視します');
            return;
        }
        _entrance_page_state__WEBPACK_IMPORTED_MODULE_1__.calendarWatchState.currentSelectedDate = newSelectedDate;
        // 入場予約状態管理にも日付を設定
        if (newSelectedDate) {
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.setSelectedCalendarDate(newSelectedDate);
        }
        // 実際に日付が変更された場合のみ監視状態をクリア
        if (actualDateChanged) {
            console.log(`📅 実際の日付変更確認: ${stateManagerSelectedDate} → ${newSelectedDate}`);
            const hasReservationTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.hasReservationTarget();
            const hasMonitoringTargets = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.hasMonitoringTargets();
            if (hasReservationTarget || hasMonitoringTargets) {
                console.log('📅 日付変更により入場予約状態管理システムの対象をクリア');
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.clearReservationTarget();
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.clearMonitoringTargets();
            }
        }
        else {
            console.log('📅 同じ日付への再クリックのため監視対象は維持');
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
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
        // 監視ボタンを再設置（動的待機を使用）
        waitForTimeSlotTable(() => {
            removeAllMonitorButtons();
            (0,_entrance_page_core__WEBPACK_IMPORTED_MODULE_3__/* .analyzeAndAddMonitorButtons */ .wj)();
            // 監視ボタン設置後も再度FABボタンの状態を更新
            (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
            console.log('🔄 監視ボタンとFABを再設置しました');
        });
    }
    else {
        // 日付は変わっていない - FABボタンの状態のみ更新
        console.log('📅 日付変更なし - FABボタンの状態のみ更新');
        // 入場予約状態管理システムを取得して状態同期
        // 公式サイトによる選択解除があった場合の状態同期
        const selectedSlot = document.querySelector(_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_2__/* .timeSlotSelectors */ .eN.selectedSlot);
        if (!selectedSlot && _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.hasReservationTarget()) {
            // DOM上に選択がないが入場予約状態管理に予約対象がある場合はクリア
            console.log('🔄 公式サイトによる選択解除を検出 - 入場予約状態管理を同期');
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.clearReservationTarget();
            // UI更新を確実に実行
            (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
        }
        // FABボタンの状態を更新（監視ボタンは再設置しない）
        (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
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
            const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .LocationHelper */ .Qs.getIndexFromElement(tdElement);
            const selector = (0,_entrance_page_dom_utils__WEBPACK_IMPORTED_MODULE_2__/* .generateUniqueTdSelector */ .sN)(tdElement);
            console.log(`🔄 DOM状態から予約対象を同期: ${timeText} (位置: ${locationIndex})`);
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.setReservationTarget(timeText, locationIndex, selector);
        }
    }
    else {
        // 選択状態の要素がない場合は予約対象をクリア
        console.log(`🔄 選択状態なし - 予約対象をクリア`);
        _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.clearReservationTarget();
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
        const locationIndex = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .LocationHelper */ .Qs.getIndexFromElement(tdElement);
        // 入場予約状態管理で現在の選択状態を確認
        const isCurrentlyReservationTarget = _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.isReservationTarget(timeText, locationIndex);
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
                    _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.clearReservationTarget();
                    (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
                }, 100);
            }
            else {
                // フォールバック: 直接削除
                _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.clearReservationTarget();
                (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
            }
        }
        else {
            // 新規選択または別の時間帯への変更
            // DOM上の選択状態から予約対象を同期
            setTimeout(() => {
                syncReservationTargetFromDOM();
                (0,_entrance_page_ui_helpers__WEBPACK_IMPORTED_MODULE_5__/* .updateMainButtonDisplay */ .vp)();
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
        const result = await _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.executeUnifiedReservationProcess(config);
        if (result.success) {
            console.log('🎉 統一予約処理成功！');
        }
        else if (result.cancelled) {
            console.log('⏹️ 統一予約処理がキャンセルされました');
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.stop();
        }
        else if (result.abnormalTermination) {
            console.error('🚨 統一予約処理異常終了');
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.setShouldStop(true);
        }
        else if (result.cooldownStarted) {
            console.log('⏰ 統一予約処理クールタイム開始');
        }
        return result;
    }
    catch (error) {
        if (error.name === 'CancellationError') {
            console.log('⏹️ 統一予約処理が中断されました');
            _entrance_reservation_state_manager__WEBPACK_IMPORTED_MODULE_4__/* .entranceReservationStateManager */ .xx.stop();
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
// エクスポート（Phase 3で統一処理移行により最小限に）
// ============================================================================
// Phase 3完了: 統一自動処理管理により個別関数は不要
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
// EXTERNAL MODULE: ./src-modules/entrance-reservation-state-manager.ts + 1 modules
var entrance_reservation_state_manager = __webpack_require__(374);
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
                        timeSlot: target.timeSlot, // 復元時と統一（timeText→timeSlot）
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
                console.log('📖 キャッシュから監視対象時間帯を読み込み:', parsed.timeSlot);
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
                    const targetTexts = parsed.targets?.map((t) => t.timeSlot).join(', ') || '不明';
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

// EXTERNAL MODULE: ./src-modules/entrance-page-dom-utils.ts + 1 modules
var entrance_page_dom_utils = __webpack_require__(638);
// EXTERNAL MODULE: ./src-modules/entrance-page-core.ts
var entrance_page_core = __webpack_require__(364);
// EXTERNAL MODULE: ./src-modules/entrance-page-fab.ts
var entrance_page_fab = __webpack_require__(982);
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
        // キャッシュ復元後にカレンダー変更監視を開始
        const { startCalendarWatcher } = await Promise.resolve(/* import() */).then(__webpack_require__.bind(__webpack_require__, 982));
        startCalendarWatcher();
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
    // 実際の入力処理（ReactのonChangeハンドラ直接呼び出し方式）
    async performInput(inputField, ticketId) {
        try {
            console.log(`🎯 チケットID入力開始: "${ticketId}"`);
            console.log('⚛️ ReactのonChangeハンドラ直接呼び出し方式を実行中...');
            // Method 1: ReactのonChangeハンドラを直接呼び出す (推奨方式)
            const reactSuccess = await this.setReactValueDirectly(inputField, ticketId);
            if (reactSuccess) {
                console.log('✅ React onChangeハンドラ直接呼び出しで成功');
                return true;
            }
            // Method 2: フォールバック - 従来の方法
            console.log('⚠️ React直接呼び出しが失敗、フォールバック処理中...');
            return await this.fallbackInputMethod(inputField, ticketId);
        }
        catch (error) {
            console.error('❌ チケットID入力エラー:', error);
            return false;
        }
    }
    // iPhone Safari IMEイベント完全シミュレーション（gemini -p最新推奨）
    async setReactValueDirectly(inputField, value) {
        console.log('🍎 iPhone Safari IMEイベントシーケンスシミュレーション開始');
        try {
            // 1. ネイティブのvalueプロパティセッターを取得
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (!nativeInputValueSetter) {
                console.error('❌ ネイティブInputValueSetterが取得できません');
                return false;
            }
            console.log('🎯 ネイティブセッター取得成功');
            // 2. フォーカス確立
            inputField.focus();
            console.log('🔍 フォーカス設定完了');
            // 3. Composition Event開始（IME入力開始）
            console.log('⌨️ CompositionStart発火中...');
            inputField.dispatchEvent(new CompositionEvent('compositionstart', {
                bubbles: true,
                cancelable: true,
            }));
            // 4. ネイティブセッター経由で値を設定
            console.log(`📝 ネイティブセッター経由で値設定中: "${value}"`);
            nativeInputValueSetter.call(inputField, value);
            // 5. inputイベント発火（Reactが変更を検知）
            console.log('📡 inputイベント発火中...');
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            // 6. Composition Event終了（IME入力確定）
            console.log('✅ CompositionEnd発火中...');
            inputField.dispatchEvent(new CompositionEvent('compositionend', {
                bubbles: true,
                cancelable: true,
                data: value, // ★ 確定した値をdataプロパティに設定
            }));
            // 7. changeイベント発火（念のため）
            console.log('🔄 changeイベント発火中...');
            inputField.dispatchEvent(new Event('change', { bubbles: true }));
            // 8. フォーカスを外す
            inputField.blur();
            console.log('👁️ フォーカス解除完了');
            // 9. 短い待機後に値を検証
            await new Promise(resolve => setTimeout(resolve, 200));
            const finalValue = inputField.value;
            const success = finalValue === value;
            if (success) {
                console.log('✅ iPhone Safari IMEシミュレーションで入力成功');
            }
            else {
                console.warn(`⚠️ 値の不一致: 期待="${value}", 実際="${finalValue}"`);
            }
            return success;
        }
        catch (error) {
            console.error('❌ iPhone Safari IMEシミュレーションエラー:', error);
            return false;
        }
    }
    // React onChange直接呼び出し方式（フォールバック用）
    async callReactOnChangeDirectly(inputField, value) {
        console.log('⚛️ React onChangeハンドラ直接呼び出し（フォールバック）');
        try {
            const fiberKey = Object.keys(inputField).find(key => key.startsWith('__reactFiber$'));
            if (!fiberKey) {
                console.warn('⚠️ React Fiberキーが見つかりません');
                return false;
            }
            const fiberInstance = inputField[fiberKey];
            const onChangeHandler = fiberInstance?.memoizedProps?.onChange;
            if (!onChangeHandler || typeof onChangeHandler !== 'function') {
                console.warn('⚠️ onChangeハンドラが見つかりません');
                return false;
            }
            const mockEvent = {
                target: { value: value },
                currentTarget: { value: value },
                type: 'change',
                bubbles: true
            };
            onChangeHandler(mockEvent);
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
            if (nativeInputValueSetter) {
                nativeInputValueSetter.call(inputField, value);
            }
            await new Promise(resolve => setTimeout(resolve, 100));
            const success = inputField.value === value;
            if (success) {
                console.log('✅ React直接呼び出しで成功');
            }
            return success;
        }
        catch (error) {
            console.error('❌ React直接呼び出しエラー:', error);
            return false;
        }
    }
    // フォールバック処理（多段階方式）
    async fallbackInputMethod(inputField, ticketId) {
        console.log('🔄 フォールバック入力処理開始');
        try {
            // Method 1: React onChange直接呼び出し方式
            console.log('🔄 Method 1: React直接呼び出し試行中...');
            const reactSuccess = await this.callReactOnChangeDirectly(inputField, ticketId);
            if (reactSuccess) {
                console.log('✅ React直接呼び出しで成功');
                return true;
            }
            // Method 2: 従来のpasteイベント方式
            console.log('🔄 Method 2: pasteイベント方式試行中...');
            inputField.focus();
            inputField.value = '';
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            const clipboardData = new DataTransfer();
            clipboardData.setData('text/plain', ticketId);
            const pasteEvent = new ClipboardEvent('paste', {
                bubbles: true,
                cancelable: true,
                clipboardData: clipboardData
            });
            inputField.dispatchEvent(pasteEvent);
            inputField.value = ticketId;
            inputField.dispatchEvent(new Event('input', { bubbles: true }));
            inputField.dispatchEvent(new Event('change', { bubbles: true }));
            inputField.dispatchEvent(new Event('blur', { bubbles: true }));
            const pasteSuccess = inputField.value === ticketId;
            console.log(`🔄 pasteイベント方式結果: ${pasteSuccess ? '成功' : '失敗'}`);
            return pasteSuccess;
        }
        catch (error) {
            console.error('❌ フォールバック入力エラー:', error);
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

// EXTERNAL MODULE: ./src-modules/processing-overlay.ts
var processing_overlay = __webpack_require__(624);
;// ./src-modules/app-router.ts
// 各モジュールからのimport









 // 同行者追加機能
// 入場予約状態管理システムのimport

// 早期オーバーレイのimport

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
(0,entrance_page_core/* setCacheManager */.S9)(cacheManager);
(0,entrance_page_core/* setCacheManagerForSection6 */.MM)(cacheManager);
(0,entrance_page_fab/* setCacheManagerForSection7 */.TP)(cacheManager);
// entrance-page-uiに必要な関数を注入
(0,entrance_page_core/* setEntranceReservationHelper */.XP)(entrance_page_fab/* entranceReservationHelper */.FX);
(0,entrance_page_core/* setUpdateMonitoringTargetsDisplay */.qy)(entrance_page_fab/* updateMonitoringTargetsDisplay */.yT);
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
                    setPageLoadingStateFn: entrance_page_core/* setPageLoadingState */.ZK,
                    createEntranceReservationUIFn: entrance_page_fab/* createEntranceReservationUI */.DT,
                    initTimeSlotMonitoringFn: entrance_page_dom_utils/* initTimeSlotMonitoring */.Yz,
                    restoreFromCacheFn: entrance_page_core/* restoreFromCache */.Zu
                });
                // 入場予約ページ初期化後に入場予約状態管理システムを初期化（動的待機）
                (0,entrance_page_fab/* waitForTimeSlotTable */.il)(() => {
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
// 即座に早期オーバーレイをチェック（DOM構築前でも実行可能）
(0,processing_overlay/* checkAndShowEarlyOverlay */.Eh)();
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