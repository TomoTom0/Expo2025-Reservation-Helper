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

/***/ 24:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DT: () => (/* binding */ createEntranceReservationUI),
/* harmony export */   FX: () => (/* binding */ entranceReservationHelper),
/* harmony export */   N9: () => (/* binding */ canStartReservation),
/* harmony export */   TP: () => (/* binding */ setCacheManagerForSection7),
/* harmony export */   yT: () => (/* binding */ updateMonitoringTargetsDisplay)
/* harmony export */ });
/* unused harmony exports getCurrentReservationTarget, checkVisitTimeButtonState, checkTimeSlotSelected, checkInitialState, startCalendarWatcher, handleCalendarChange, removeAllMonitorButtons */
/* harmony import */ var _section1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(702);
/* harmony import */ var _section2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(915);
/* harmony import */ var _section4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(369);
/* harmony import */ var _section5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(482);
/* harmony import */ var _section6_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(383);
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
            if ((0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .isInterruptionAllowed */ .Is)()) {
              _context.n = 3;
              break;
            }
            console.log('⚠️ リロード直前のため中断できません');
            showStatus('リロード直前のため中断できません', 'red');
            return _context.a(2);
          case 3:
            if (!_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.isMonitoring) {
              _context.n = 4;
              break;
            }
            console.log('監視を中断します');
            (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .stopSlotMonitoring */ .XG)();
            // ステータスは中断を示すメッセージを表示（消さない）
            showStatus('監視中断', 'orange');
            (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
            return _context.a(2);
          case 4:
            if (!_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning) {
              _context.n = 5;
              break;
            }
            console.log('予約処理を中断します');
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop = true;
            showStatus('予約処理を中断中...', 'orange');
            return _context.a(2);
          case 5:
            if (!(_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.hasTargets() && _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.mode === 'selecting')) {
              _context.n = 7;
              break;
            }
            // 即座にUI更新してから監視開始
            (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
            _context.n = 6;
            return (0,_section5_js__WEBPACK_IMPORTED_MODULE_3__/* .startSlotMonitoring */ .fp)();
          case 6:
            return _context.a(2);
          case 7:
            // 通常の予約処理
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning = true;
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop = false;
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.startTime = Date.now();
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.attempts = 0;
            showStatus('予約処理実行中...', 'blue');
            (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
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
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning = false;
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.startTime = null;
            _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.attempts = 0;
            (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
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
  var targets = _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getTargets();

  // 予約実行中の場合は予約対象を表示
  if (_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.isRunning && reservationTarget) {
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
    var location = _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);
    var priority = index + 1;
    return "".concat(priority, ".").concat(location).concat(target.timeText);
  });
  targetsDisplay.innerText = "\u76E3\u8996\u5BFE\u8C61:\n".concat(targetTexts.join('\n'));
  targetsDisplay.style.display = 'block';
  targetsDisplay.style.background = 'linear-gradient(135deg, rgba(255, 140, 0, 0.9), rgba(255, 180, 0, 0.9))';

  // 詳細なツールチップ
  var detailText = targets.map(function (target, index) {
    var location = _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);
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
  var tdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_2__/* .generateUniqueTdSelector */ .sN)(tdElement);
  var location = _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.getLocationFromSelector(tdSelector);
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
  var selectedTimeSlot = document.querySelector(_section4_js__WEBPACK_IMPORTED_MODULE_2__/* .timeSlotSelectors */ .eN.selectedSlot);
  if (!selectedTimeSlot) {
    console.log('⚠️ 時間帯が選択されていません');
    return false;
  }

  // 選択された時間帯が満員でないかチェック
  var status = (0,_section4_js__WEBPACK_IMPORTED_MODULE_2__/* .extractTdStatus */ .SE)(selectedTimeSlot.closest('td'));
  if (status && status.isFull) {
    console.log('⚠️ 選択された時間帯は満員です');
    return false;
  }
  console.log("\u2705 \u6642\u9593\u5E2F\u9078\u629E\u6E08\u307F: ".concat((status === null || status === void 0 ? void 0 : status.timeText) || 'unknown'));
  return true;
}

// 予約開始可能かどうかの総合判定
function canStartReservation() {
  var hasTimeSlotTable = (0,_section5_js__WEBPACK_IMPORTED_MODULE_3__/* .checkTimeSlotTableExistsSync */ .H5)();
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
  var selectedDate = (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY)();
  var hasTimeSlotTable = (0,_section5_js__WEBPACK_IMPORTED_MODULE_3__/* .checkTimeSlotTableExistsSync */ .H5)();
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
    (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateStatusBadge */ .pW)(canStart ? 'idle' : 'waiting');
  } else {
    // カレンダー未選択または時間帯テーブル未表示の場合は待機中のまま
    console.log('⏳ カレンダー未選択または時間帯テーブル未表示 - 待機中を維持');
    (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateStatusBadge */ .pW)('idle');
  }
}

// カレンダー変更を監視して監視ボタンを再設置
function startCalendarWatcher() {
  if (_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.isWatching) return;
  _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.isWatching = true;
  _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate = (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY)();
  console.log('📅 カレンダー変更監視を開始');

  // MutationObserverでカレンダー変更・時間帯選択・ボタン状態変更を検出
  _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.observer = new MutationObserver(function (mutations) {
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
  _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.observer.observe(observeTarget, {
    attributes: true,
    subtree: true,
    attributeFilter: ['aria-pressed', 'class', 'disabled']
  });
}

// カレンダー変更・状態変更時の処理
function handleCalendarChange() {
  var newSelectedDate = (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY)();
  var calendarDateChanged = newSelectedDate !== _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate;
  if (calendarDateChanged) {
    console.log("\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u65E5\u4ED8\u5909\u66F4\u3092\u691C\u51FA: ".concat(_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate, " \u2192 ").concat(newSelectedDate));

    // 監視実行中は日付変更を無視
    if (_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.isMonitoring) {
      console.log('⚠️ 監視実行中のため日付変更を無視します');
      return;
    }
    _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .calendarWatchState */ .ri.currentSelectedDate = newSelectedDate;

    // 既存の監視状態をクリア（日付が変わったため）
    if (_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.hasTargets() && !_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.isMonitoring) {
      console.log('📅 日付変更により監視対象をクリア');
      _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .multiTargetManager */ ._t.clearAll();
      _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotState */ .Pf.mode = 'idle';
      cacheManager.clearTargetSlots();
    }

    // 監視ボタンを再設置
    setTimeout(function () {
      removeAllMonitorButtons();
      (0,_section5_js__WEBPACK_IMPORTED_MODULE_3__/* .analyzeAndAddMonitorButtons */ .wj)();

      // FABボタンの状態も更新
      (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
      console.log('🔄 監視ボタンとFABを再設置しました');
    }, 1000); // 時間帯テーブル更新を待つ
  } else {
    // 日付は変わっていない - 監視ボタンの再設置は不要
    console.log('📅 日付変更なし - FABボタンの状態のみ更新');

    // FABボタンの状態のみ更新（監視ボタンは再設置しない）
    (0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp)();
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
          if (!(attempts < maxAttempts && !_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop)) {
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
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .waitForElement */ .xk)(selectors.submit, timeouts.waitForSubmit, config);
        case 3:
          submitButton = _context2.v;
          if (!_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
            _context2.n = 4;
            break;
          }
          return _context2.a(3, 22);
        case 4:
          console.log('submitボタンが見つかりました。クリックします。');

          // submit押下時に回数を更新
          _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.attempts = attempts;
          _context2.n = 5;
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(submitButton, config);
        case 5:
          console.log('2. レスポンスを待機中...');
          responseSelectors = {
            change: selectors.change,
            success: selectors.success,
            failure: selectors.failure
          };
          _context2.n = 6;
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .waitForAnyElement */ .Dr)(responseSelectors, timeouts.waitForResponse, selectorTexts, config);
        case 6:
          response = _context2.v;
          console.log("\u30EC\u30B9\u30DD\u30F3\u30B9\u691C\u51FA: ".concat(response.key));
          if (!_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
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
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(response.element, config);
        case 8:
          console.log('success/failureを待機中...');
          finalSelectors = {
            success: selectors.success,
            failure: selectors.failure
          };
          _context2.n = 9;
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .waitForAnyElement */ .Dr)(finalSelectors, timeouts.waitForResponse, selectorTexts, config);
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
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .waitForElement */ .xk)(selectors.close, timeouts.waitForClose, config);
        case 11:
          closeButton = _context2.v;
          _context2.n = 12;
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(closeButton, config);
        case 12:
          _context2.n = 13;
          return new Promise(function (resolve) {
            return setTimeout(resolve, (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .getRandomWaitTime */ .I1)(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config));
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
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .waitForElement */ .xk)(selectors.close, timeouts.waitForClose, config);
        case 16:
          _closeButton = _context2.v;
          _context2.n = 17;
          return (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .clickElement */ .jp)(_closeButton, config);
        case 17:
          _context2.n = 18;
          return new Promise(function (resolve) {
            return setTimeout(resolve, (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .getRandomWaitTime */ .I1)(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config));
          });
        case 18:
          _context2.n = 21;
          break;
        case 19:
          _context2.p = 19;
          _t2 = _context2.v;
          console.error("\u30A8\u30E9\u30FC\u304C\u767A\u751F\u3057\u307E\u3057\u305F (\u8A66\u884C ".concat(attempts, "):"), _t2.message);
          if (!_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
            _context2.n = 20;
            break;
          }
          return _context2.a(3, 22);
        case 20:
          _context2.n = 21;
          return new Promise(function (resolve) {
            return setTimeout(resolve, (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .getRandomWaitTime */ .I1)(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config));
          });
        case 21:
          _context2.n = 1;
          break;
        case 22:
          if (!_section2_js__WEBPACK_IMPORTED_MODULE_1__/* .entranceReservationState */ .CG.shouldStop) {
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

/***/ 369:
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
/* harmony import */ var _section5_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(482);
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
// Section 5からのimport


// 【4. DOM要素セレクタ・検索】
// ============================================================================

// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
var timeSlotSelectors = {
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
  var row = tdElement.parentElement;
  var rowIndex = Array.from(row.parentElement.children).indexOf(row);
  var cellIndex = Array.from(row.children).indexOf(tdElement);

  // 設計書に基づく固定DOM構造での一意セレクタ
  return "table tr:nth-child(".concat(rowIndex + 1, ") td:nth-child(").concat(cellIndex + 1, ")[data-gray-out]");
}
function getTdPositionInfo(tdElement) {
  var row = tdElement.parentElement;
  var rowIndex = Array.from(row.parentElement.children).indexOf(row);
  var cellIndex = Array.from(row.children).indexOf(tdElement);
  return {
    rowIndex: rowIndex,
    cellIndex: cellIndex
  };
}
function findSameTdElement(targetInfo) {
  // 1. セレクタベースでの検索を優先
  if (targetInfo.tdSelector) {
    var element = document.querySelector(targetInfo.tdSelector);
    if (element) {
      return element;
    }
  }

  // 2. フォールバック: 位置情報による検索
  if (targetInfo.positionInfo && targetInfo.positionInfo.rowIndex !== undefined && targetInfo.positionInfo.cellIndex !== undefined) {
    var table = document.querySelector(timeSlotSelectors.timeSlotContainer);
    if (table) {
      var rows = table.querySelectorAll('tr');
      if (rows[targetInfo.positionInfo.rowIndex]) {
        var cells = rows[targetInfo.positionInfo.rowIndex].querySelectorAll('td[data-gray-out]');
        if (cells[targetInfo.positionInfo.cellIndex]) {
          return cells[targetInfo.positionInfo.cellIndex];
        }
      }
    }
  }
  return null;
}
function extractTdStatus(tdElement) {
  if (!tdElement) return null;
  var buttonDiv = tdElement.querySelector('div[role="button"]');
  if (!buttonDiv) return null;
  var timeSpan = buttonDiv.querySelector('dt span');
  var timeText = timeSpan ? timeSpan.textContent.trim() : '';

  // 満員判定
  var isDisabled = buttonDiv.hasAttribute('data-disabled') && buttonDiv.getAttribute('data-disabled') === 'true';
  var hasFullIcon = buttonDiv.querySelector(timeSlotSelectors.fullIcon);
  var isFull = isDisabled && hasFullIcon;

  // 利用可能判定
  var hasLowIcon = buttonDiv.querySelector(timeSlotSelectors.lowIcon);
  var hasHighIcon = buttonDiv.querySelector(timeSlotSelectors.highIcon);
  var isAvailable = !isDisabled && (hasLowIcon || hasHighIcon);

  // 選択済み判定
  var isSelected = buttonDiv.getAttribute('aria-pressed') === 'true';
  var status = 'unknown';
  if (isFull) status = 'full';else if (isSelected) status = 'selected';else if (isAvailable) status = 'available';
  return {
    timeText: timeText,
    status: status,
    isFull: isFull,
    isAvailable: isAvailable,
    isSelected: isSelected,
    element: tdElement,
    buttonDiv: buttonDiv
  };
}

// 時間帯監視機能の初期化
function initTimeSlotMonitoring() {
  return _initTimeSlotMonitoring.apply(this, arguments);
} // カレンダーの動的待機
function _initTimeSlotMonitoring() {
  _initTimeSlotMonitoring = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var hasCalendar;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          console.log('時間帯監視機能を初期化中...');

          // カレンダーの存在確認
          _context.n = 1;
          return waitForCalendar();
        case 1:
          hasCalendar = _context.v;
          if (hasCalendar) {
            _context.n = 2;
            break;
          }
          console.log('カレンダーが見つかりません');
          return _context.a(2);
        case 2:
          // DOM変化監視を開始（時間帯テーブルの動的生成を検出）
          (0,_section5_js__WEBPACK_IMPORTED_MODULE_0__/* .startTimeSlotTableObserver */ .cD)();
          console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
        case 3:
          return _context.a(2);
      }
    }, _callee);
  }));
  return _initTimeSlotMonitoring.apply(this, arguments);
}
function waitForCalendar() {
  return _waitForCalendar.apply(this, arguments);
} // エクスポート
function _waitForCalendar() {
  _waitForCalendar = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var timeout,
      startTime,
      checkInterval,
      calendar,
      tables,
      _iterator,
      _step,
      table,
      dateElements,
      _args2 = arguments,
      _t;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          timeout = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 10000;
          startTime = Date.now();
          checkInterval = 500;
          console.log('カレンダーの出現を待機中...');
        case 1:
          if (!(Date.now() - startTime < timeout)) {
            _context2.n = 12;
            break;
          }
          // :has()のフォールバック - カレンダーテーブルを検索
          calendar = document.querySelector('table:has(time[datetime])');
          if (calendar) {
            _context2.n = 8;
            break;
          }
          // :has()がサポートされていない場合のフォールバック
          calendar = document.querySelector('[class*="calendar_table"]');
          if (calendar) {
            _context2.n = 8;
            break;
          }
          tables = document.querySelectorAll('table');
          _iterator = _createForOfIteratorHelper(tables);
          _context2.p = 2;
          _iterator.s();
        case 3:
          if ((_step = _iterator.n()).done) {
            _context2.n = 5;
            break;
          }
          table = _step.value;
          if (!(table.querySelectorAll('time[datetime]').length > 0)) {
            _context2.n = 4;
            break;
          }
          calendar = table;
          return _context2.a(3, 5);
        case 4:
          _context2.n = 3;
          break;
        case 5:
          _context2.n = 7;
          break;
        case 6:
          _context2.p = 6;
          _t = _context2.v;
          _iterator.e(_t);
        case 7:
          _context2.p = 7;
          _iterator.f();
          return _context2.f(7);
        case 8:
          if (!calendar) {
            _context2.n = 10;
            break;
          }
          // カレンダー要素内の日付要素も確認
          dateElements = calendar.querySelectorAll('time[datetime]');
          if (!(dateElements.length > 0)) {
            _context2.n = 9;
            break;
          }
          console.log("\u30AB\u30EC\u30F3\u30C0\u30FC\u3092\u691C\u51FA\u3057\u307E\u3057\u305F\uFF08\u65E5\u4ED8\u8981\u7D20: ".concat(dateElements.length, "\u500B\uFF09"));
          return _context2.a(2, true);
        case 9:
          console.log('カレンダー要素はあるが、日付要素がまだ読み込まれていません');
        case 10:
          _context2.n = 11;
          return new Promise(function (resolve) {
            return setTimeout(resolve, checkInterval);
          });
        case 11:
          _context2.n = 1;
          break;
        case 12:
          console.log('カレンダーの待機がタイムアウトしました');
          return _context2.a(2, false);
      }
    }, _callee2, null, [[2, 6, 7, 8]]);
  }));
  return _waitForCalendar.apply(this, arguments);
}


// ============================================================================

/***/ }),

/***/ 383:
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
/* harmony import */ var _section2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(915);
/* harmony import */ var _section4_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(369);
/* harmony import */ var _section5_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(482);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// Section 2からのimport


// Section 4からのimport


// Section 5からのimport


// 【6. カレンダー・UI状態管理】
// ============================================================================

// 依存注入用の参照
var cacheManager = null;
var entranceReservationHelper = null;
var canStartReservation = null;

// cacheManagerを設定するヘルパー関数
var setCacheManagerForSection6 = function setCacheManagerForSection6(cm) {
  cacheManager = cm;
};

// entranceReservationHelperを設定するヘルパー関数
var setEntranceReservationHelper = function setEntranceReservationHelper(helper) {
  entranceReservationHelper = helper;
};

// canStartReservationを設定するヘルパー関数
var setCanStartReservation = function setCanStartReservation(fn) {
  canStartReservation = fn;
};

// 時間帯表示のためのカレンダー自動クリック機能
// 現在選択されているカレンダー日付を取得
function getCurrentSelectedCalendarDate() {
  try {
    // 安定したセレクタで選択済み要素を検索
    var selectedSelectors = ['[aria-pressed="true"] time[datetime]', '[class*="selector_date"] time[datetime]'];
    for (var _i = 0, _selectedSelectors = selectedSelectors; _i < _selectedSelectors.length; _i++) {
      var selector = _selectedSelectors[_i];
      var timeElement = document.querySelector(selector);
      if (timeElement) {
        var datetime = timeElement.getAttribute('datetime');
        // console.log(`📅 現在選択中のカレンダー日付: ${datetime} (${selector})`);
        return datetime;
      }
    }

    // さらなるフォールバック: 任意のaria-pressed="true"要素内のtime要素
    var anySelected = document.querySelectorAll('[aria-pressed="true"]');
    var _iterator = _createForOfIteratorHelper(anySelected),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var el = _step.value;
        var _timeElement = el.querySelector('time[datetime]');
        if (_timeElement) {
          var _datetime = _timeElement.getAttribute('datetime');
          console.log("\uD83D\uDCC5 \u73FE\u5728\u9078\u629E\u4E2D\u306E\u30AB\u30EC\u30F3\u30C0\u30FC\u65E5\u4ED8\uFF08\u30D5\u30A9\u30FC\u30EB\u30D0\u30C3\u30AF\uFF09: ".concat(_datetime));
          return _datetime;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    console.log('⚠️ 選択中のカレンダー日付が見つかりません');

    // デバッグ: 利用可能なカレンダー要素を表示
    var allCalendarElements = document.querySelectorAll('[role="button"][aria-pressed]');
    console.log("\uD83D\uDCC5 \u5229\u7528\u53EF\u80FD\u306A\u30AB\u30EC\u30F3\u30C0\u30FC\u8981\u7D20\u6570: ".concat(allCalendarElements.length));
    allCalendarElements.forEach(function (el, i) {
      var pressed = el.getAttribute('aria-pressed');
      var timeEl = el.querySelector('time');
      var datetime = timeEl ? timeEl.getAttribute('datetime') : 'N/A';
      console.log("  ".concat(i + 1, ". aria-pressed=\"").concat(pressed, "\" datetime=\"").concat(datetime, "\""));
    });
    return null;
  } catch (error) {
    console.error('❌ カレンダー日付取得エラー:', error);
    return null;
  }
}

// 指定された日付のカレンダーをクリック
function clickCalendarDate(_x) {
  return _clickCalendarDate.apply(this, arguments);
}
function _clickCalendarDate() {
  _clickCalendarDate = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(targetDate) {
    var _targetElement$queryS, timeElement, allCalendarElements, targetElement, clickEvent, isNowSelected, _t;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.p = _context.n) {
        case 0:
          console.log("\uD83D\uDCC5 \u6307\u5B9A\u65E5\u4ED8\u306E\u30AB\u30EC\u30F3\u30C0\u30FC\u30AF\u30EA\u30C3\u30AF\u3092\u8A66\u884C: ".concat(targetDate));
          _context.p = 1;
          // 指定日付のカレンダー要素を検索（実際のHTML構造に基づく）
          timeElement = document.querySelector("time[datetime=\"".concat(targetDate, "\"]"));
          if (timeElement) {
            _context.n = 2;
            break;
          }
          console.log("\u274C \u6307\u5B9A\u65E5\u4ED8\u306Etime\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(targetDate));

          // デバッグ: 利用可能なカレンダー要素を表示
          allCalendarElements = document.querySelectorAll('time[datetime]');
          console.log("\uD83D\uDD0D \u5229\u7528\u53EF\u80FD\u306A\u30AB\u30EC\u30F3\u30C0\u30FC\u8981\u7D20\u6570: ".concat(allCalendarElements.length));
          allCalendarElements.forEach(function (el, i) {
            if (i < 5) {
              // 最初の5個だけ表示
              var datetime = el.getAttribute('datetime');
              console.log("  [".concat(i, "] datetime=\"").concat(datetime, "\" (").concat(el.tagName, ")"));
            }
          });
          return _context.a(2, false);
        case 2:
          // time要素の親のdivボタンを取得
          targetElement = timeElement.closest('div[role="button"]');
          if (targetElement) {
            _context.n = 3;
            break;
          }
          console.log("\u274C \u6307\u5B9A\u65E5\u4ED8\u306E\u30DC\u30BF\u30F3\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(targetDate));
          return _context.a(2, false);
        case 3:
          if (!(targetElement.getAttribute('tabindex') === '-1' || targetElement.hasAttribute('data-pointer-none'))) {
            _context.n = 4;
            break;
          }
          console.log("\u274C \u6307\u5B9A\u65E5\u4ED8\u306F\u30AF\u30EA\u30C3\u30AF\u4E0D\u53EF\u3067\u3059: ".concat(targetDate));
          return _context.a(2, false);
        case 4:
          // クリック実行
          console.log("\uD83D\uDDB1\uFE0F \u65E5\u4ED8\u3092\u30AF\u30EA\u30C3\u30AF: ".concat(targetDate));
          clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          targetElement.dispatchEvent(clickEvent);

          // クリック結果を待機
          _context.n = 5;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 1500);
          });
        case 5:
          // クリック成功確認
          isNowSelected = targetElement.getAttribute('aria-pressed') === 'true' || targetElement.classList.contains('selected') || ((_targetElement$queryS = targetElement.querySelector('time')) === null || _targetElement$queryS === void 0 ? void 0 : _targetElement$queryS.getAttribute('datetime')) === targetDate;
          if (!isNowSelected) {
            _context.n = 6;
            break;
          }
          console.log('✅ カレンダー日付のクリックが成功しました');
          return _context.a(2, true);
        case 6:
          console.log('⚠️ カレンダークリックは実行されましたが、選択状態の確認ができません');
          return _context.a(2, true);
        case 7:
          _context.n = 9;
          break;
        case 8:
          _context.p = 8;
          _t = _context.v;
          console.error('❌ カレンダー日付クリックエラー:', _t);
          return _context.a(2, false);
        case 9:
          return _context.a(2);
      }
    }, _callee, null, [[1, 8]]);
  }));
  return _clickCalendarDate.apply(this, arguments);
}
function tryClickCalendarForTimeSlot() {
  return _tryClickCalendarForTimeSlot.apply(this, arguments);
} // エラー表示機能
function _tryClickCalendarForTimeSlot() {
  _tryClickCalendarForTimeSlot = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    var targetTexts, calendarSelectors, calendarElement, _i2, _calendarSelectors, selector, dateSelectors, clickableDate, _i3, _dateSelectors, _selector, dates, _iterator2, _step2, date, clickEvent, _t2, _t3;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          console.log('📅 時間帯表示のためのカレンダークリックを試行中...');

          // 監視対象確認（情報表示のみ）
          if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
            targetTexts = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets().map(function (t) {
              return t.timeText;
            }).join(', ');
            console.log("\uD83C\uDFAF \u76E3\u8996\u5BFE\u8C61: ".concat(targetTexts, " (").concat(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount(), "\u500B)"));
          }

          // 1. カレンダー要素を検索
          calendarSelectors = ['.style_main__calendar__HRSsz', '[class*="calendar"]', 'button[role="button"]:has(.style_main__calendar__HRSsz)', 'div[class*="calendar"] button'];
          calendarElement = null;
          _i2 = 0, _calendarSelectors = calendarSelectors;
        case 1:
          if (!(_i2 < _calendarSelectors.length)) {
            _context2.n = 3;
            break;
          }
          selector = _calendarSelectors[_i2];
          calendarElement = document.querySelector(selector);
          if (!calendarElement) {
            _context2.n = 2;
            break;
          }
          console.log("\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u8981\u7D20\u3092\u767A\u898B: ".concat(selector));
          return _context2.a(3, 3);
        case 2:
          _i2++;
          _context2.n = 1;
          break;
        case 3:
          if (calendarElement) {
            _context2.n = 4;
            break;
          }
          console.log('❌ カレンダー要素が見つかりません');
          return _context2.a(2, false);
        case 4:
          // 2. 現在選択されている日付のみを検索
          dateSelectors = ['.style_main__calendar__HRSsz button', '.style_main__calendar__HRSsz [role="button"]', '[class*="calendar"] button:not([disabled])', '[class*="date"]:not([disabled])'];
          clickableDate = null; // 現在選択されている日付を探す（これのみが対象）
          _i3 = 0, _dateSelectors = dateSelectors;
        case 5:
          if (!(_i3 < _dateSelectors.length)) {
            _context2.n = 14;
            break;
          }
          _selector = _dateSelectors[_i3];
          dates = document.querySelectorAll(_selector);
          _iterator2 = _createForOfIteratorHelper(dates);
          _context2.p = 6;
          _iterator2.s();
        case 7:
          if ((_step2 = _iterator2.n()).done) {
            _context2.n = 9;
            break;
          }
          date = _step2.value;
          if (!(date.classList.contains('selected') || date.classList.contains('active') || date.getAttribute('aria-selected') === 'true')) {
            _context2.n = 8;
            break;
          }
          clickableDate = date;
          console.log("\uD83D\uDCC5 \u73FE\u5728\u9078\u629E\u4E2D\u306E\u65E5\u4ED8\u3092\u767A\u898B: ".concat(date.textContent.trim()));
          return _context2.a(3, 9);
        case 8:
          _context2.n = 7;
          break;
        case 9:
          _context2.n = 11;
          break;
        case 10:
          _context2.p = 10;
          _t2 = _context2.v;
          _iterator2.e(_t2);
        case 11:
          _context2.p = 11;
          _iterator2.f();
          return _context2.f(11);
        case 12:
          if (!clickableDate) {
            _context2.n = 13;
            break;
          }
          return _context2.a(3, 14);
        case 13:
          _i3++;
          _context2.n = 5;
          break;
        case 14:
          if (clickableDate) {
            _context2.n = 15;
            break;
          }
          console.log('❌ ユーザーが選択した日付が見つかりません');
          console.log('💡 現在選択中の日付のみクリック可能です');
          return _context2.a(2, false);
        case 15:
          _context2.p = 15;
          console.log("\uD83D\uDDB1\uFE0F \u65E5\u4ED8\u3092\u30AF\u30EA\u30C3\u30AF: \"".concat(clickableDate.textContent.trim(), "\""));

          // マウスイベントを発火
          clickEvent = new MouseEvent('click', {
            view: window,
            bubbles: true,
            cancelable: true
          });
          clickableDate.dispatchEvent(clickEvent);

          // 少し待機してクリック結果を確認
          _context2.n = 16;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 1000);
          });
        case 16:
          console.log('✅ カレンダー日付のクリックを実行しました');
          return _context2.a(2, true);
        case 17:
          _context2.p = 17;
          _t3 = _context2.v;
          console.error('❌ カレンダークリック中にエラー:', _t3);
          return _context2.a(2, false);
      }
    }, _callee2, null, [[15, 17], [6, 10, 11, 12]]);
  }));
  return _tryClickCalendarForTimeSlot.apply(this, arguments);
}
function showErrorMessage(message) {
  // 既存のエラーメッセージがあれば削除
  var existingError = document.getElementById('ytomo-error-message');
  if (existingError) {
    existingError.remove();
  }

  // エラーメッセージ要素を作成
  var errorDiv = document.createElement('div');
  errorDiv.id = 'ytomo-error-message';
  errorDiv.style.cssText = "\n        position: fixed;\n        top: 20px;\n        right: 20px;\n        background: #ff4444;\n        color: white;\n        padding: 15px;\n        border-radius: 5px;\n        font-size: 14px;\n        z-index: 9999;\n        max-width: 300px;\n        box-shadow: 0 4px 6px rgba(0,0,0,0.1);\n    ";
  errorDiv.innerHTML = "\n        <div style=\"font-weight: bold; margin-bottom: 5px;\">\u26A0\uFE0F \u76E3\u8996\u30A8\u30E9\u30FC</div>\n        <div>".concat(message, "</div>\n        <button onclick=\"this.parentElement.remove()\" style=\"\n            background: transparent;\n            border: 1px solid white;\n            color: white;\n            padding: 5px 10px;\n            margin-top: 10px;\n            border-radius: 3px;\n            cursor: pointer;\n        \">\u9589\u3058\u308B</button>\n    ");
  document.body.appendChild(errorDiv);

  // 10秒後に自動削除
  setTimeout(function () {
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
  var selectedButtons = document.querySelectorAll('.ext-ytomo.monitor-btn');
  selectedButtons.forEach(function (button) {
    var span = button.querySelector('span');
    if (span && span.innerText.startsWith('監視')) {
      span.innerText = '満員';
      button.style.background = 'rgb(255, 140, 0)';
      button.disabled = false;
    }
  });
}

// 時間帯を自動選択して予約開始
function selectTimeSlotAndStartReservation(_x2) {
  return _selectTimeSlotAndStartReservation.apply(this, arguments);
} // 監視停止（監視対象選択は維持）
function _selectTimeSlotAndStartReservation() {
  _selectTimeSlotAndStartReservation = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(slotInfo) {
    var location, clickTarget, clickEvent, buttonElement, isSelected;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(slotInfo.targetInfo.tdSelector);
          console.log("\uD83C\uDFAF \u6642\u9593\u5E2F\u3092\u81EA\u52D5\u9078\u629E\u3057\u307E\u3059: ".concat(location).concat(slotInfo.timeText));

          // クリック対象のdl要素を探す
          clickTarget = null; // TD要素の場合はdl要素を探す
          if (!(slotInfo.element.tagName === 'TD')) {
            _context4.n = 3;
            break;
          }
          clickTarget = slotInfo.element.querySelector('div[role="button"] dl');
          if (!clickTarget) {
            _context4.n = 1;
            break;
          }
          console.log('🔧 TD要素内のdl要素を発見しました');
          _context4.n = 2;
          break;
        case 1:
          console.error('❌ TD要素内にdl要素が見つかりません');
          return _context4.a(2);
        case 2:
          _context4.n = 4;
          break;
        case 3:
          // TD以外の場合はdl要素を探す
          clickTarget = slotInfo.element.querySelector('dl');
          if (clickTarget) {
            _context4.n = 4;
            break;
          }
          console.error('❌ 要素内にdl要素が見つかりません');
          return _context4.a(2);
        case 4:
          // 時間帯を確実に選択
          console.log("\uD83D\uDDB1\uFE0F dl\u8981\u7D20\u3092\u30AF\u30EA\u30C3\u30AF\u3057\u307E\u3059: ".concat(clickTarget.tagName));

          // 複数の方法で確実にクリック
          try {
            // まず通常のクリック
            clickTarget.click();

            // さらにイベントディスパッチでクリック
            clickEvent = new MouseEvent('click', {
              bubbles: true,
              cancelable: true,
              view: window
            });
            clickTarget.dispatchEvent(clickEvent);
            console.log("\u2705 dl\u8981\u7D20\u306E\u30AF\u30EA\u30C3\u30AF\u5B8C\u4E86");
          } catch (error) {
            console.error("\u274C dl\u8981\u7D20\u30AF\u30EA\u30C3\u30AF\u30A8\u30E9\u30FC:", error);
          }

          // 選択状態確認のため少し待つ
          _context4.n = 5;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 500);
          });
        case 5:
          // 選択状態を確認（ボタン要素の状態をチェック）
          buttonElement = slotInfo.element.querySelector('div[role="button"]');
          isSelected = buttonElement && (Array.from(buttonElement.classList).some(function (className) {
            return className.includes('style_active__');
          }) || buttonElement.getAttribute('aria-pressed') === 'true');
          console.log("\uD83D\uDD0D \u6642\u9593\u5E2F\u9078\u629E\u72B6\u614B\u78BA\u8A8D: ".concat(isSelected ? '選択済み' : '未選択'));
          if (isSelected) {
            _context4.n = 6;
            break;
          }
          console.warn("\u26A0\uFE0F \u6642\u9593\u5E2F\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002\u518D\u8A66\u884C\u3057\u307E\u3059");
          // 再試行 - dl要素を再度クリック
          clickTarget.click();
          _context4.n = 6;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 300);
          });
        case 6:
          // 少し待ってから予約処理開始
          setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
            var finalButtonElement, finalCheck, config, result;
            return _regenerator().w(function (_context3) {
              while (1) switch (_context3.n) {
                case 0:
                  console.log('🚀 予約処理を開始します');

                  // 予約開始前に時間帯選択を最終確認
                  finalButtonElement = slotInfo.element.querySelector('div[role="button"]');
                  finalCheck = finalButtonElement && (Array.from(finalButtonElement.classList).some(function (className) {
                    return className.includes('style_active__');
                  }) || finalButtonElement.getAttribute('aria-pressed') === 'true');
                  console.log("\uD83D\uDD0D \u4E88\u7D04\u958B\u59CB\u524D\u6700\u7D42\u78BA\u8A8D: \u6642\u9593\u5E2F\u9078\u629E=".concat(finalCheck ? '✅選択済み' : '❌未選択'));
                  if (finalCheck) {
                    _context3.n = 1;
                    break;
                  }
                  console.error("\u274C \u6642\u9593\u5E2F\u304C\u9078\u629E\u3055\u308C\u3066\u3044\u306A\u3044\u305F\u3081\u4E88\u7D04\u51E6\u7406\u3092\u4E2D\u6B62\u3057\u307E\u3059");
                  return _context3.a(2);
                case 1:
                  // 監視停止
                  stopSlotMonitoring();

                  // 通常の予約処理を開始
                  config = getCurrentEntranceConfig();
                  if (!config) {
                    _context3.n = 3;
                    break;
                  }
                  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.isRunning = true;
                  _context3.n = 2;
                  return entranceReservationHelper(config);
                case 2:
                  result = _context3.v;
                  if (result.success) {
                    cacheManager.clearTargetSlots(); // 成功時はキャッシュクリア
                    cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア
                    console.log('✅ 予約が成功しました！');
                  }
                case 3:
                  return _context3.a(2);
              }
            }, _callee3);
          })), 1000);
        case 7:
          return _context4.a(2);
      }
    }, _callee4);
  }));
  return _selectTimeSlotAndStartReservation.apply(this, arguments);
}
function stopSlotMonitoring() {
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring = false;

  // 監視継続フラグをクリア（手動停止なので継続させない）
  cacheManager.clearMonitoringFlag();

  // リロードカウントダウンも確実に停止
  stopReloadCountdown();

  // 監視対象が設定されている場合は選択状態に戻す
  if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';
  } else {
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
  }
  if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval) {
    clearInterval(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval);
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval = null;
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
  var allMonitorButtons = document.querySelectorAll('.monitor-btn');
  allMonitorButtons.forEach(function (button) {
    var targetTime = button.getAttribute('data-target-time');
    var buttonTd = button.closest('td[data-gray-out]');
    var buttonTdSelector = buttonTd ? generateUniqueTdSelector(buttonTd) : '';

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
  var allMonitorButtons = document.querySelectorAll('.monitor-btn');
  allMonitorButtons.forEach(function (button) {
    var span = button.querySelector('span');

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
  var allMonitorButtons = document.querySelectorAll('.monitor-btn');
  allMonitorButtons.forEach(function (button) {
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
  var existingButtons = document.querySelectorAll('.monitor-btn');
  console.log("".concat(existingButtons.length, "\u500B\u306E\u65E2\u5B58\u76E3\u8996\u30DC\u30BF\u30F3\u3092\u30AF\u30EA\u30A2\u3057\u307E\u3059"));
  existingButtons.forEach(function (button) {
    button.remove();
  });
}

// 現在のテーブル内容を取得（変化検出用）
function getCurrentTableContent() {
  var tables = document.querySelectorAll('table');
  var content = '';
  tables.forEach(function (table) {
    var timeSlots = table.querySelectorAll('td div[role="button"]');
    timeSlots.forEach(function (slot) {
      var _slot$querySelector;
      var timeText = (_slot$querySelector = slot.querySelector('dt span')) === null || _slot$querySelector === void 0 || (_slot$querySelector = _slot$querySelector.textContent) === null || _slot$querySelector === void 0 ? void 0 : _slot$querySelector.trim();
      var disabled = slot.getAttribute('data-disabled');
      var pressed = slot.getAttribute('aria-pressed');
      if (timeText && (timeText.includes(':') || timeText.includes('時'))) {
        content += "".concat(timeText, "-").concat(disabled, "-").concat(pressed, "|");
      }
    });
  });
  return content;
}

// 監視ボタンの更新が必要かチェック
function shouldUpdateMonitorButtons() {
  var analysis = (0,_section5_js__WEBPACK_IMPORTED_MODULE_2__/* .analyzeTimeSlots */ .bU)();
  var existingButtons = document.querySelectorAll('.monitor-btn');
  console.log("\u6E80\u54E1\u6642\u9593\u5E2F\u6570: ".concat(analysis.full.length, ", \u65E2\u5B58\u30DC\u30BF\u30F3\u6570: ").concat(existingButtons.length));

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
  var fullTimeTexts = analysis.full.map(function (slot) {
    return slot.timeText;
  });
  var buttonTimeTexts = Array.from(existingButtons).map(function (btn) {
    return btn.getAttribute('data-target-time');
  });
  var missingButtons = fullTimeTexts.filter(function (time) {
    return !buttonTimeTexts.includes(time);
  });
  var extraButtons = buttonTimeTexts.filter(function (time) {
    return !fullTimeTexts.includes(time);
  });
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
  if (!_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) return;
  var targets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
  var targetTexts = targets.map(function (t) {
    return t.timeText;
  }).join(', ');
  console.log("\u9078\u629E\u72B6\u614B\u3092\u5FA9\u5143\u4E2D: ".concat(targetTexts));

  // 該当する時間帯の監視ボタンを探して選択状態にする
  var monitorButtons = document.querySelectorAll('.monitor-btn');
  var restoredCount = 0;
  targets.forEach(function (target) {
    monitorButtons.forEach(function (button) {
      var buttonTargetTime = button.getAttribute('data-target-time');
      var buttonTdElement = button.closest('td[data-gray-out]');
      var buttonTdSelector = buttonTdElement ? (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(buttonTdElement) : '';

      // 時間+位置で一致するかチェック
      if (buttonTargetTime === target.timeText && buttonTdSelector === target.tdSelector) {
        var span = button.querySelector('span');
        if (span) {
          // 監視対象リストでの位置を取得
          var allTargets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
          var targetIndex = allTargets.findIndex(function (t) {
            return t.timeText === target.timeText && t.tdSelector === target.tdSelector;
          });
          if (targetIndex >= 0) {
            var priority = targetIndex + 1;
            span.innerText = "\u76E3\u8996".concat(priority);
          } else {
            span.innerText = '監視1'; // フォールバック
          }
          button.style.background = 'rgb(0, 104, 33)';
          restoredCount++;
          console.log("\u2705 \u9078\u629E\u72B6\u614B\u3092\u5FA9\u5143\u3057\u307E\u3057\u305F: ".concat(target.timeText));
        }
      }
    });
  });
  if (restoredCount === 0) {
    console.log("\u26A0\uFE0F \u5BFE\u8C61\u6642\u9593\u5E2F\u304C\u898B\u3064\u304B\u3089\u306A\u3044\u305F\u3081\u9078\u629E\u72B6\u614B\u3092\u30EA\u30BB\u30C3\u30C8: ".concat(targetTexts));
    // 対象時間帯がない場合は状態をリセット
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
    cacheManager.clearTargetSlots();
  }
  updateMainButtonDisplay();
}

// メインボタンの表示更新（FAB形式対応）
function updateMainButtonDisplay() {
  var forceMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  var fabButton = document.querySelector('#ytomo-main-fab');
  var statusBadge = document.querySelector('#ytomo-status-badge');
  if (fabButton && statusBadge) {
    var span = fabButton.querySelector('span');
    if (span) {
      var currentMode = forceMode || getCurrentMode();

      // デバッグ情報
      var targetTexts = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets() ? _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets().map(function (t) {
        return t.timeText;
      }).join(', ') : 'なし';
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
          console.log("\u2705 selecting \u30B1\u30FC\u30B9\u5B9F\u884C: \u76E3\u8996\u4E88\u7D04\u958B\u59CB\u3068\u3057\u3066\u6709\u52B9\u5316");
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
          console.log("\uD83D\uDD04 idle \u30B1\u30FC\u30B9\u5B9F\u884C");
          // 監視対象が設定されている場合は selecting モードになるはずだが、
          // 念のため idle でも監視対象の有無を確認
          if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
            // 監視対象設定済み - selectingモードに移行すべき
            console.log("\u2705 idle\u5185\u3067\u76E3\u8996\u5BFE\u8C61\u691C\u51FA: \u76E3\u8996\u4E88\u7D04\u958B\u59CB\u3068\u3057\u3066\u6709\u52B9\u5316");
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
            var canStart = canStartReservation();
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
              var selectedDate = getCurrentSelectedCalendarDate();
              var hasTimeSlotTable = (0,_section5_js__WEBPACK_IMPORTED_MODULE_2__/* .checkTimeSlotTableExistsSync */ .H5)();
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
  if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD && _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.isLoading) {
    return 'loading';
  } else if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring) {
    return 'monitoring';
  } else if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.isRunning) {
    return 'reservation-running';
  } else if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets() && _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode === 'selecting') {
    return 'selecting';
  } else {
    return 'idle';
  }
}

// ステータスバッジの更新
function updateStatusBadge(mode) {
  var statusBadge = document.querySelector('#ytomo-status-badge');
  if (!statusBadge) return;
  var message = '';
  var bgColor = 'rgba(0, 0, 0, 0.8)';
  switch (mode) {
    case 'monitoring':
      message = '監視実行中';
      if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== null) {
        if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining <= 3) {
          message = "\u76E3\u8996\u4E2D\n\u30EA\u30ED\u30FC\u30C9: ".concat(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining, "\u79D2");
          bgColor = 'rgba(255, 0, 0, 0.9)'; // 赤色（中断不可）
        } else {
          message = "\u76E3\u8996\u4E2D\n\u30EA\u30ED\u30FC\u30C9: ".concat(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining, "\u79D2");
          bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
        }
      } else {
        bgColor = 'rgba(255, 140, 0, 0.9)'; // オレンジ色
      }
      break;
    case 'reservation-running':
      // 経過時間と回数を表示
      var elapsedMinutes = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.startTime ? Math.floor((Date.now() - _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.startTime) / 60000) : 0;
      var attempts = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .entranceReservationState */ .CG.attempts;
      message = "\u4E88\u7D04\u5B9F\u884C\u4E2D\n".concat(elapsedMinutes, "\u5206 ").concat(attempts, "\u56DE");
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
  var targets = multiTargetManager.getTargets();
  if (targets.length === 0) {
    return '不明';
  }
  var selectedDate = getCurrentSelectedCalendarDate();

  // 各監視対象の東西を個別に判定（東/西時間の形式で統一）
  if (targets.length > 1) {
    var timeLocationTexts = targets.map(function (target) {
      var location = multiTargetManager.getLocationFromSelector(target.tdSelector);
      return "".concat(location).concat(target.timeText || '不明');
    }).join('\n');
    if (selectedDate) {
      var date = new Date(selectedDate);
      var dateStr = "".concat(date.getMonth() + 1, "/").concat(date.getDate());
      return "".concat(dateStr, "\n").concat(timeLocationTexts);
    } else {
      return timeLocationTexts;
    }
  } else {
    // 単一監視対象の場合
    var target = targets[0];
    var location = multiTargetManager.getLocationFromSelector(target.tdSelector);
    var timeText = target.timeText || '不明';
    if (selectedDate) {
      var _date = new Date(selectedDate);
      var _dateStr = "".concat(_date.getMonth() + 1, "/").concat(_date.getDate());
      return "".concat(_dateStr, " ").concat(location).concat(timeText);
    } else {
      return "".concat(location).concat(timeText);
    }
  }
}

// カウントダウン開始関数
function startReloadCountdown() {
  var seconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
  stopReloadCountdown(); // 既存のカウントダウンを停止

  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.totalSeconds = seconds;
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining = seconds;
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.startTime = Date.now();
  console.log("\uD83D\uDD04 \u30EA\u30ED\u30FC\u30C9\u30AB\u30A6\u30F3\u30C8\u30C0\u30A6\u30F3\u958B\u59CB: ".concat(seconds, "\u79D2"));

  // 即座に一度UI更新
  updateMainButtonDisplay();
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval = setInterval(function () {
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining--;

    // UI更新（カウントダウン表示のみ）
    updateMainButtonDisplay();
    if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining <= 0) {
      stopReloadCountdown();
      // カウントダウン完了でリロード実行
      console.log('🔄 カウントダウン完了によりページをリロードします...');
      window.location.reload();
    }
  }, 1000);
}

// カウントダウン停止関数
function stopReloadCountdown() {
  if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval) {
    clearInterval(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval);
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.countdownInterval = null;
  }
  // リロードタイマーも停止
  if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.reloadTimer) {
    clearTimeout(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.reloadTimer);
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.reloadTimer = null;
    console.log('🛑 リロードタイマーを停止しました');
  }
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining = null;
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.startTime = null;
}

// ページ読み込み状態を設定
function setPageLoadingState(isLoading) {
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.isLoading = isLoading;
  if (isLoading) {
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.startTime = Date.now();
  } else {
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .pageLoadingState */ .VD.startTime = null;
  }
  updateMainButtonDisplay();
}

// 中断操作が許可されているかチェック
function isInterruptionAllowed() {
  // リロード直前3秒間は中断不可（時間を短縮して中断可能期間を延長）
  var isCountdownActive = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== null && _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining !== undefined;
  var isNearReload = isCountdownActive && _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .reloadCountdownState */ .u6.secondsRemaining <= 3;

  // console.log(`🔍 中断可否チェック: countdown=${reloadCountdownState.secondsRemaining}, active=${isCountdownActive}, nearReload=${isNearReload}`);

  return !isNearReload;
}

// ページ読み込み時のキャッシュ復元
function restoreFromCache() {
  return _restoreFromCache.apply(this, arguments);
} // エクスポート
function _restoreFromCache() {
  _restoreFromCache = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee7() {
    var cached, hasCalendar, currentSelectedDate, calendarClicked, tableAppeared, hasTable, _calendarClicked, _tableAppeared;
    return _regenerator().w(function (_context7) {
      while (1) switch (_context7.n) {
        case 0:
          cached = cacheManager.loadTargetSlots();
          if (cached) {
            _context7.n = 1;
            break;
          }
          return _context7.a(2);
        case 1:
          console.log('🔄 キャッシュから複数監視状態を復元中...');

          // カレンダー読み込み完了を待機
          _context7.n = 2;
          return (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .waitForCalendar */ .Xz)();
        case 2:
          hasCalendar = _context7.v;
          if (hasCalendar) {
            _context7.n = 3;
            break;
          }
          console.log('❌ カレンダーの読み込みがタイムアウトしました');
          cacheManager.clearTargetSlots();
          return _context7.a(2);
        case 3:
          if (!cached.selectedDate) {
            _context7.n = 10;
            break;
          }
          currentSelectedDate = getCurrentSelectedCalendarDate();
          console.log("\uD83D\uDCC5 \u6BD4\u8F03 - \u30AD\u30E3\u30C3\u30B7\u30E5\u65E5\u4ED8: ".concat(cached.selectedDate, ", \u73FE\u5728\u65E5\u4ED8: ").concat(currentSelectedDate));
          if (!(currentSelectedDate !== cached.selectedDate)) {
            _context7.n = 8;
            break;
          }
          console.log('📅 日付が一致しません。キャッシュされた日付に移動します...');
          _context7.n = 4;
          return clickCalendarDate(cached.selectedDate);
        case 4:
          calendarClicked = _context7.v;
          if (calendarClicked) {
            _context7.n = 5;
            break;
          }
          console.log('❌ 指定日付へのカレンダークリックに失敗しました');
          console.log('🗑️ 復元不可のためキャッシュをクリアします');
          cacheManager.clearTargetSlots();
          return _context7.a(2);
        case 5:
          // 日付クリック後、テーブル表示を待機
          console.log('⏰ 日付変更後の時間帯テーブル表示を待機中...');
          _context7.n = 6;
          return (0,_section5_js__WEBPACK_IMPORTED_MODULE_2__/* .waitForTimeSlotTable */ .il)(8000);
        case 6:
          tableAppeared = _context7.v;
          if (tableAppeared) {
            _context7.n = 7;
            break;
          }
          console.log('❌ 日付変更後もテーブルが表示されませんでした');
          console.log('🗑️ 復元不可のためキャッシュをクリアします');
          cacheManager.clearTargetSlots();
          return _context7.a(2);
        case 7:
          _context7.n = 9;
          break;
        case 8:
          console.log('✅ カレンダー日付は一致しています');
        case 9:
          _context7.n = 11;
          break;
        case 10:
          console.log('⚠️ キャッシュに日付情報がありません（古いキャッシュ）');
        case 11:
          _context7.n = 12;
          return (0,_section5_js__WEBPACK_IMPORTED_MODULE_2__/* .checkTimeSlotTableExistsAsync */ .gW)();
        case 12:
          hasTable = _context7.v;
          if (hasTable) {
            _context7.n = 17;
            break;
          }
          console.log('⏰ 時間帯テーブルが見つからないため、現在選択中の日付をクリックします');
          _context7.n = 13;
          return tryClickCalendarForTimeSlot();
        case 13:
          _calendarClicked = _context7.v;
          if (!_calendarClicked) {
            _context7.n = 16;
            break;
          }
          _context7.n = 14;
          return (0,_section5_js__WEBPACK_IMPORTED_MODULE_2__/* .waitForTimeSlotTable */ .il)(5000);
        case 14:
          _tableAppeared = _context7.v;
          if (_tableAppeared) {
            _context7.n = 15;
            break;
          }
          console.log('❌ カレンダークリック後もテーブルが表示されませんでした');
          console.log('🗑️ 復元不可のためキャッシュをクリアします');
          cacheManager.clearTargetSlots();
          return _context7.a(2);
        case 15:
          _context7.n = 17;
          break;
        case 16:
          console.log('❌ カレンダークリックに失敗しました');
          console.log('🗑️ 復元不可のためキャッシュをクリアします');
          cacheManager.clearTargetSlot();
          return _context7.a(2);
        case 17:
          // UI更新を遅延実行（DOM完成後）
          setTimeout(function () {
            var _cached$targets, _cached$targets2;
            // 該当する監視ボタンを探して復元
            var restoredCount = 0;
            var allMonitorButtons = document.querySelectorAll('.monitor-btn');
            console.log("\uD83D\uDCCB \u5FA9\u5143\u5BFE\u8C61\u76E3\u8996\u30BF\u30FC\u30B2\u30C3\u30C8: ".concat(((_cached$targets = cached.targets) === null || _cached$targets === void 0 ? void 0 : _cached$targets.length) || 0, "\u500B"));

            // 優先順位順に処理（最優先から順番にチェック）
            var availableTargets = [];

            // 各監視対象について状態をチェック
            (_cached$targets2 = cached.targets) === null || _cached$targets2 === void 0 || _cached$targets2.forEach(function (targetData, index) {
              var location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(targetData.tdSelector);
              var priority = index + 1;
              console.log("\uD83D\uDCCD \u5FA9\u5143\u5BFE\u8C61\u3092\u51E6\u7406\u4E2D: ".concat(priority, ".").concat(location).concat(targetData.timeText));

              // まず同一td要素を見つける
              var tdElement = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(targetData);
              if (!tdElement) {
                console.log("\u274C td\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(location).concat(targetData.timeText));
                return;
              }

              // td要素の現在の状態をチェック
              var currentStatus = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(tdElement);
              if (currentStatus && currentStatus.status === 'available') {
                console.log("\uD83C\uDF89 \u76E3\u8996\u5BFE\u8C61\u304C\u7A7A\u304D\u3042\u308A\u306B\u5909\u5316\uFF01: ".concat(priority, ".").concat(location).concat(targetData.timeText));
                availableTargets.push(_objectSpread(_objectSpread({}, targetData), {}, {
                  priority: priority,
                  location: location,
                  tdElement: tdElement,
                  currentStatus: currentStatus
                }));
              } else {
                // まだ満員の場合、監視ボタンを探す
                var targetButton = null;
                allMonitorButtons.forEach(function (button) {
                  var buttonTime = button.getAttribute('data-target-time');
                  var buttonTd = button.closest('td[data-gray-out]');
                  var buttonTdSelector = buttonTd ? (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(buttonTd) : '';

                  // 時間+位置で一致するかチェック
                  if (buttonTime === targetData.timeText && buttonTdSelector === targetData.tdSelector) {
                    targetButton = button;
                  }
                });
                if (targetButton) {
                  console.log("\uD83D\uDCCD \u5FA9\u5143\u5BFE\u8C61\u306E\u76E3\u8996\u30DC\u30BF\u30F3\u3092\u767A\u898B: ".concat(location).concat(targetData.timeText));

                  // 状態復元（複数監視対象対応）
                  var restoredSlotInfo = {
                    timeText: targetData.timeText,
                    tdSelector: targetData.tdSelector,
                    positionInfo: targetData.positionInfo,
                    status: targetData.status
                  };

                  // 複数監視対象マネージャーに追加
                  var added = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.addTarget(restoredSlotInfo);
                  if (added) {
                    // ボタンの表示を更新
                    var span = targetButton.querySelector('span');
                    if (span) {
                      // 監視対象での優先順位を取得
                      var allTargets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
                      var targetIndex = allTargets.findIndex(function (t) {
                        return t.timeText === targetData.timeText && t.tdSelector === targetData.tdSelector;
                      });
                      if (targetIndex >= 0) {
                        var _priority = targetIndex + 1;
                        span.innerText = "\u76E3\u8996".concat(_priority);
                      } else {
                        span.innerText = '監視1'; // フォールバック
                      }
                      targetButton.style.background = 'rgb(0, 104, 33)';
                      targetButton.disabled = false; // クリックで解除可能
                    }
                    restoredCount++;
                    console.log("\u2705 \u76E3\u8996\u72B6\u614B\u3092\u5FA9\u5143: ".concat(location).concat(targetData.timeText));
                  } else {
                    console.log("\u26A0\uFE0F \u76E3\u8996\u5BFE\u8C61\u306E\u8FFD\u52A0\u306B\u5931\u6557: ".concat(location).concat(targetData.timeText));
                  }
                } else {
                  console.log("\u26A0\uFE0F \u5FA9\u5143\u5BFE\u8C61\u306E\u76E3\u8996\u30DC\u30BF\u30F3\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(location).concat(targetData.timeText));
                }
              }
            });

            // 空きありの監視対象が見つかった場合は優先順位で自動選択
            if (availableTargets.length > 0) {
              // 最優先（priority最小）の監視対象を選択
              var topPriority = availableTargets.sort(function (a, b) {
                return a.priority - b.priority;
              })[0];
              console.log("\uD83C\uDF89\uD83D\uDE80 \u6700\u512A\u5148\u306E\u7A7A\u304D\u3042\u308A\u76E3\u8996\u5BFE\u8C61\u3092\u767A\u898B\uFF01\u81EA\u52D5\u9078\u629E\u958B\u59CB: ".concat(topPriority.priority, ".").concat(topPriority.location).concat(topPriority.timeText));

              // 監視継続フラグをクリア（自動選択するため）
              cacheManager.clearMonitoringFlag();

              // 空きありになった要素を自動選択して予約開始
              var slotInfo = {
                element: topPriority.currentStatus.element,
                // div[role="button"]要素
                timeText: topPriority.currentStatus.timeText,
                status: topPriority.currentStatus.status,
                targetInfo: topPriority
              };

              // 監視状態とキャッシュをクリア
              cacheManager.clearTargetSlots();
              _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
              setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
                return _regenerator().w(function (_context5) {
                  while (1) switch (_context5.n) {
                    case 0:
                      _context5.n = 1;
                      return selectTimeSlotAndStartReservation(slotInfo);
                    case 1:
                      return _context5.a(2);
                  }
                }, _callee5);
              })), 1000);
              return; // 復元処理終了
            }

            // 復元結果の処理
            if (restoredCount > 0) {
              _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = cached.retryCount || 0;
              _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';

              // メインボタンの表示更新
              updateMainButtonDisplay();
              console.log("\u2705 ".concat(restoredCount, "\u500B\u306E\u76E3\u8996\u72B6\u614B\u3092\u5FA9\u5143\u5B8C\u4E86 (\u8A66\u884C\u56DE\u6570: ").concat(cached.retryCount, ")"));

              // 監視継続フラグをチェックして監視を再開
              var shouldContinueMonitoring = cacheManager.getAndClearMonitoringFlag();
              if (shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。監視を自動再開します...');
                setTimeout(function () {
                  (0,_section5_js__WEBPACK_IMPORTED_MODULE_2__/* .startSlotMonitoring */ .fp)();
                }, 3000); // DOM安定化を待ってから監視開始
              } else {
                console.log('🛑 監視継続フラグが無効または期限切れです。監視は再開されません');
              }
            } else {
              // キャッシュクリアのヘルパー関数
              var clearTargetAndState = function clearTargetAndState() {
                cacheManager.clearTargetSlots();
                _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
                _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
                _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
                updateMainButtonDisplay();
                console.log('✅ キャッシュクリア完了');
              };
              // 復元できた対象がない場合
              console.log('❌ 復元できた監視対象がありません');
              var _shouldContinueMonitoring = cacheManager.getAndClearMonitoringFlag();
              if (_shouldContinueMonitoring) {
                console.log('🔄 監視継続フラグが有効です。カレンダー自動クリックを試行します...');

                // カレンダー日付をクリックして時間帯テーブルを表示させる
                if (cached.selectedDate) {
                  clickCalendarDate(cached.selectedDate).then(function (calendarClicked) {
                    if (calendarClicked) {
                      console.log('📅 カレンダー自動クリック成功。監視対象復元を再試行します...');

                      // 少し待ってから再試行
                      setTimeout(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee6() {
                        var _cached$targets3;
                        var retryRestoredCount;
                        return _regenerator().w(function (_context6) {
                          while (1) switch (_context6.n) {
                            case 0:
                              // 全ての監視対象について再試行
                              retryRestoredCount = 0;
                              (_cached$targets3 = cached.targets) === null || _cached$targets3 === void 0 || _cached$targets3.forEach(function (targetData) {
                                var retryTargetElement = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(targetData);
                                var retryStatus = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(retryTargetElement);
                                if (retryStatus) {
                                  var retrySlotInfo = {
                                    timeText: targetData.timeText,
                                    tdSelector: targetData.tdSelector,
                                    positionInfo: targetData.positionInfo,
                                    status: retryStatus.status
                                  };
                                  var added = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.addTarget(retrySlotInfo);
                                  if (added) {
                                    retryRestoredCount++;
                                  }
                                }
                              });
                              if (retryRestoredCount > 0) {
                                _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';
                                console.log("\u2705 ".concat(retryRestoredCount, "\u500B\u306E\u76E3\u8996\u5BFE\u8C61\u3092\u518D\u8A66\u884C\u3067\u5FA9\u5143\u6210\u529F"));
                                updateMainButtonDisplay();
                                (0,_section5_js__WEBPACK_IMPORTED_MODULE_2__/* .startSlotMonitoring */ .fp)();
                              } else {
                                console.log('❌ 再試行でも監視対象が見つかりません。キャッシュをクリアします');
                                cacheManager.clearTargetSlots();
                                _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
                                _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
                                _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
                                updateMainButtonDisplay();
                              }
                            case 1:
                              return _context6.a(2);
                          }
                        }, _callee6);
                      })), 2000);
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
            }
          }, 2000);
        case 18:
          return _context7.a(2);
      }
    }, _callee7);
  }));
  return _restoreFromCache.apply(this, arguments);
}


// ============================================================================

/***/ }),

/***/ 482:
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
/* harmony import */ var _section2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(915);
/* harmony import */ var _section4_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(369);
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
// Section 2からのimport


// Section 4からのimport


// 【5. 時間帯監視・分析システム】
// ============================================================================

// 依存注入用の外部関数参照
var externalFunctions = {};
var isInitialized = false;

// 必要な外部関数のリスト
var REQUIRED_FUNCTIONS = ['getCurrentTableContent', 'shouldUpdateMonitorButtons', 'restoreSelectionAfterUpdate',
// 'showStatus', // 内部関数のため一時的に除外
'enableAllMonitorButtons', 'updateMainButtonDisplay', 'updateMonitoringTargetsDisplay', 'disableAllMonitorButtons', 'selectTimeSlotAndStartReservation', 'startReloadCountdown', 'reloadCountdownState', 'resetMonitoringUI', 'showErrorMessage', 'tryClickCalendarForTimeSlot'];

// 外部関数を設定するヘルパー関数
var setExternalFunctions = function setExternalFunctions(funcs) {
  // 必要な関数がすべて存在するかチェック
  for (var _i = 0, _REQUIRED_FUNCTIONS = REQUIRED_FUNCTIONS; _i < _REQUIRED_FUNCTIONS.length; _i++) {
    var funcName = _REQUIRED_FUNCTIONS[_i];
    if (typeof funcs[funcName] !== 'function' && _typeof(funcs[funcName]) !== 'object') {
      console.warn("Warning: Required function/object ".concat(funcName, " not provided or not a function"));
    }
  }
  externalFunctions = funcs;
  isInitialized = true;
  console.log('✅ Section 5: External functions initialized');
};

// 安全な外部関数呼び出し
function safeCall(funcName) {
  var _externalFunctions;
  if (!isInitialized) {
    throw new Error('External functions not initialized in Section 5');
  }
  if (typeof externalFunctions[funcName] !== 'function') {
    throw new Error("Function ".concat(funcName, " not available in Section 5"));
  }
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }
  return (_externalFunctions = externalFunctions)[funcName].apply(_externalFunctions, args);
}

// 安全な外部オブジェクト参照
function safeRef(objName) {
  if (!isInitialized) {
    throw new Error('External functions not initialized in Section 5');
  }
  if (!externalFunctions[objName]) {
    throw new Error("Object ".concat(objName, " not available in Section 5"));
  }
  return externalFunctions[objName];
}

// 依存注入用のcacheManager参照（既存）
var cacheManager = null;

// cacheManagerを設定するヘルパー関数（既存）
var setCacheManager = function setCacheManager(cm) {
  cacheManager = cm;
};

// 時間帯テーブルの動的生成を監視（ループ防止版）
function startTimeSlotTableObserver() {
  console.log('時間帯テーブルの動的生成監視を開始');
  var isProcessing = false; // 処理中フラグでループ防止
  var lastTableContent = ''; // 前回のテーブル内容を記録

  // MutationObserverで DOM変化を監視（フィルタリング強化版）
  var observer = new MutationObserver(function (mutations) {
    if (isProcessing) {
      console.log('⏭️ 処理中のため変更を無視');
      return;
    }
    var hasRelevantChange = false;
    mutations.forEach(function (mutation) {
      // console.log(`📊 DOM変更検出: type=${mutation.type}, target=${mutation.target.tagName}`, mutation);

      if (mutation.type === 'childList') {
        var addedNodes = Array.from(mutation.addedNodes);
        var removedNodes = Array.from(mutation.removedNodes);

        // 監視ボタン関連の変更は無視
        var isMonitorButtonChange = [].concat(addedNodes, removedNodes).some(function (node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            var _node$classList, _node$querySelector;
            return ((_node$classList = node.classList) === null || _node$classList === void 0 ? void 0 : _node$classList.contains('monitor-btn')) || ((_node$querySelector = node.querySelector) === null || _node$querySelector === void 0 ? void 0 : _node$querySelector.call(node, '.monitor-btn'));
          }
          return false;
        });
        if (isMonitorButtonChange) {
          console.log('🚫 監視ボタン関連の変更を無視');
          return;
        }

        // 時間帯テーブル関連の変更のみ検出
        var hasTableChange = [].concat(addedNodes, removedNodes).some(function (node) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            var isRelevant = node.tagName === 'TABLE' || node.tagName === 'TD' || node.tagName === 'IMG' ||
            // アイコン変更も検出
            node.querySelector && (node.querySelector('table') || node.querySelector('td[data-gray-out]') || node.querySelector('div[role="button"]:not(.monitor-btn)') || node.querySelector('img[src*="calendar_ng.svg"]') || node.querySelector('img[src*="ico_scale"]'));
            if (isRelevant) {
              // console.log(`🔍 テーブル関連の変更を検出: ${node.tagName}`, node);
            }
            return isRelevant;
          }
          return false;
        });
        if (hasTableChange) {
          hasRelevantChange = true;
        }
      } else if (mutation.type === 'attributes') {
        // 属性変更も監視（data-disabled、src等）
        var target = mutation.target;
        var attrName = mutation.attributeName;
        if (target.nodeType === Node.ELEMENT_NODE) {
          var isRelevantAttr = attrName === 'data-disabled' && target.tagName === 'DIV' && target.getAttribute('role') === 'button' || attrName === 'src' && target.tagName === 'IMG' || attrName === 'aria-pressed' && target.tagName === 'DIV' && target.getAttribute('role') === 'button';
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
      window.timeSlotCheckTimeout = setTimeout(function () {
        // 現在のテーブル内容をチェック
        var currentTableContent = safeCall('getCurrentTableContent');
        if (currentTableContent === lastTableContent) {
          console.log('📋 テーブル内容に変化なし、処理をスキップ');
          return;
        }

        // console.log('🔍 有効な時間帯テーブル変更を検出');
        isProcessing = true;
        var hasTimeSlot = checkTimeSlotTableExistsSync();
        if (hasTimeSlot) {
          // 現在の監視ボタンの状態をチェック
          if (safeCall('shouldUpdateMonitorButtons')) {
            console.log('🎯 監視ボタンの更新が必要です');
            setTimeout(function () {
              // 差分更新処理（不要なボタン削除と新規ボタン追加）
              analyzeAndAddMonitorButtons();

              // 選択状態を復元
              setTimeout(function () {
                safeCall('restoreSelectionAfterUpdate');

                // テーブル内容を記録
                lastTableContent = safeCall('getCurrentTableContent');
                isProcessing = false;
              }, 200);
            }, 300);
          } else {
            console.log('✅ 監視ボタンは既に適切に配置されています');
            lastTableContent = safeCall('getCurrentTableContent');
            isProcessing = false;
          }
        } else {
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
  setTimeout(function () {
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
function waitForTimeSlotTable() {
  return _waitForTimeSlotTable.apply(this, arguments);
} // 時間帯テーブルの存在確認（同期版 - async版は後で定義）
function _waitForTimeSlotTable() {
  _waitForTimeSlotTable = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
    var timeout,
      startTime,
      checkInterval,
      _loop,
      _ret,
      _args2 = arguments;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          timeout = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : 10000;
          startTime = Date.now();
          checkInterval = 500;
          console.log('時間帯テーブルの出現を待機中...');
          _loop = /*#__PURE__*/_regenerator().m(function _loop() {
            var waitTime;
            return _regenerator().w(function (_context) {
              while (1) switch (_context.n) {
                case 0:
                  if (!checkTimeSlotTableExistsSync()) {
                    _context.n = 1;
                    break;
                  }
                  console.log('時間帯テーブルを検出しました');
                  return _context.a(2, {
                    v: true
                  });
                case 1:
                  // ランダム待機時間で次のチェック
                  waitTime = checkInterval + Math.floor(Math.random() * 200);
                  _context.n = 2;
                  return new Promise(function (resolve) {
                    return setTimeout(resolve, waitTime);
                  });
                case 2:
                  return _context.a(2);
              }
            }, _loop);
          });
        case 1:
          if (!(Date.now() - startTime < timeout)) {
            _context2.n = 4;
            break;
          }
          return _context2.d(_regeneratorValues(_loop()), 2);
        case 2:
          _ret = _context2.v;
          if (!_ret) {
            _context2.n = 3;
            break;
          }
          return _context2.a(2, _ret.v);
        case 3:
          _context2.n = 1;
          break;
        case 4:
          console.log("\u6642\u9593\u5E2F\u30C6\u30FC\u30D6\u30EB\u306E\u5F85\u6A5F\u304C\u30BF\u30A4\u30E0\u30A2\u30A6\u30C8\u3057\u307E\u3057\u305F (".concat(timeout, "ms)"));
          return _context2.a(2, false);
      }
    }, _callee);
  }));
  return _waitForTimeSlotTable.apply(this, arguments);
}
function checkTimeSlotTableExistsSync() {
  // 実際の時間帯要素をチェック（時間を含むもの）
  var allElements = document.querySelectorAll(_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotCells);
  var actualTimeSlots = [];
  allElements.forEach(function (el) {
    var _el$textContent;
    var text = (_el$textContent = el.textContent) === null || _el$textContent === void 0 ? void 0 : _el$textContent.trim();
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
  var analysis = analyzeTimeSlots();
  console.log('時間帯分析結果:', {
    available: analysis.available.length,
    full: analysis.full.length,
    selected: analysis.selected.length
  });

  // 既存のボタンとの差分を計算（時間+位置で判定）
  var existingButtons = document.querySelectorAll('.monitor-btn');
  var existingSlots = Array.from(existingButtons).map(function (btn) {
    var timeText = btn.getAttribute('data-target-time');
    var tdElement = btn.closest('td[data-gray-out]');
    var tdSelector = tdElement ? (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement) : '';
    return {
      timeText: timeText,
      tdSelector: tdSelector
    };
  });
  console.log("\uD83D\uDCCB \u5DEE\u5206\u8A08\u7B97: \u65E2\u5B58\u30DC\u30BF\u30F3\u6570=".concat(existingButtons.length, "\u500B vs \u6E80\u54E1\u6642\u9593\u5E2F\u6570=").concat(analysis.full.length, "\u500B"));

  // 不要なボタンを削除（時間+位置で判定）
  var removedCount = 0;
  existingButtons.forEach(function (button) {
    var timeText = button.getAttribute('data-target-time');
    var tdElement = button.closest('td[data-gray-out]');
    var tdSelector = tdElement ? (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement) : '';

    // 監視対象として設定済みの場合は削除しない（状態変化を追跡するため）
    var isMonitoringTarget = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.isSelected(timeText, tdSelector);
    if (isMonitoringTarget) {
      console.log("\uD83C\uDFAF \u76E3\u8996\u5BFE\u8C61\u306E\u305F\u3081\u4FDD\u6301: ".concat(timeText, " (\u72B6\u614B\u5909\u5316\u3092\u8FFD\u8DE1\u4E2D)"));

      // 監視対象の状態が変わった場合はボタンテキストを更新
      var currentTd = button.closest('td[data-gray-out]');
      var currentStatus = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(currentTd);
      if (currentStatus && currentStatus.status === 'available') {
        var span = button.querySelector('span');
        if (span) {
          span.innerText = '空きあり';
          button.style.background = 'rgb(0, 200, 0)'; // より明るい緑
          console.log("\u2705 \u76E3\u8996\u5BFE\u8C61\u304C\u7A7A\u304D\u3042\u308A\u306B\u5909\u5316: ".concat(timeText));
        }
      }
    } else {
      // 現在の満員時間帯に対応するものがあるかチェック
      var stillExists = analysis.full.some(function (slot) {
        var slotTdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(slot.element.closest('td[data-gray-out]'));
        return slot.timeText === timeText && slotTdSelector === tdSelector;
      });
      if (!stillExists) {
        console.log("\uD83D\uDDD1\uFE0F \u4E0D\u8981\u306A\u76E3\u8996\u30DC\u30BF\u30F3\u3092\u524A\u9664: ".concat(timeText, " (\u4F4D\u7F6E\u3082\u4E0D\u4E00\u81F4)"));
        button.remove();
        removedCount++;
      }
    }
  });

  // 新しい満員時間帯にボタンを追加（時間+位置で判定）
  var newFullSlots = analysis.full.filter(function (slot) {
    var slotTdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(slot.element.closest('td[data-gray-out]'));
    return !existingSlots.some(function (existing) {
      return existing.timeText === slot.timeText && existing.tdSelector === slotTdSelector;
    });
  });
  if (newFullSlots.length > 0) {
    console.log("".concat(newFullSlots.length, "\u500B\u306E\u65B0\u3057\u3044\u6E80\u54E1\u6642\u9593\u5E2F\u306B\u76E3\u8996\u30DC\u30BF\u30F3\u3092\u8FFD\u52A0\u3057\u307E\u3059"));
    addMonitorButtonsToFullSlots(newFullSlots);
  }

  // 結果サマリー
  if (analysis.full.length === 0) {
    console.log('現在満員の時間帯はありません');
    if (existingButtons.length > 0) {
      console.log("".concat(existingButtons.length, "\u500B\u306E\u65E2\u5B58\u30DC\u30BF\u30F3\u3092\u524A\u9664\u3057\u307E\u3057\u305F"));
    }
  } else if (newFullSlots.length === 0 && removedCount === 0) {
    console.log('監視ボタンは既に適切に配置されています');
  } else {
    console.log("\u2705 \u76E3\u8996\u30DC\u30BF\u30F3\u66F4\u65B0\u5B8C\u4E86: \u524A\u9664=".concat(removedCount, "\u500B, \u8FFD\u52A0=").concat(newFullSlots.length, "\u500B"));
  }
}

// 全時間帯の状態分析
function analyzeTimeSlots() {
  var available = [];
  var full = [];
  var selected = [];

  // 全てのtd要素を取得（時間帯テーブル内）
  var allTdElements = document.querySelectorAll(_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotContainer + ' td[data-gray-out]');
  console.log("\uD83D\uDCCA \u6642\u9593\u5E2F\u5206\u6790\u958B\u59CB: ".concat(allTdElements.length, "\u500B\u306Etd\u8981\u7D20\u3092\u78BA\u8A8D"));
  allTdElements.forEach(function (tdElement) {
    var status = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(tdElement);
    if (status && status.timeText) {
      console.log("\uD83D\uDCCA ".concat(status.timeText, ": ").concat(status.status, " (\u6E80\u54E1:").concat(status.isFull, ", \u5229\u7528\u53EF\u80FD:").concat(status.isAvailable, ", \u9078\u629E:").concat(status.isSelected, ")"));
      var timeInfo = {
        element: status.buttonDiv,
        tdElement: tdElement,
        timeText: status.timeText,
        status: status.status,
        selector: (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement)
      };
      if (status.status === 'full') {
        full.push(timeInfo);
      } else if (status.status === 'selected') {
        selected.push(timeInfo);
      } else if (status.status === 'available') {
        available.push(timeInfo);
      }
    }
  });
  console.log("\uD83D\uDCCA \u5206\u6790\u7D50\u679C: \u5229\u7528\u53EF\u80FD=".concat(available.length, ", \u6E80\u54E1=").concat(full.length, ", \u9078\u629E=").concat(selected.length));
  return {
    available: available,
    full: full,
    selected: selected
  };
}

// 時間帯要素から情報を抽出
function extractTimeSlotInfo(buttonElement) {
  var tdElement = buttonElement.closest('td');
  if (!tdElement) return null;

  // 時間テキストを取得
  var timeSpan = buttonElement.querySelector('dt span');
  var timeText = timeSpan ? timeSpan.textContent.trim() : '';

  // デバッグ用：要素の状態を詳細表示
  var dataDisabled = buttonElement.getAttribute('data-disabled');
  var ariaPressed = buttonElement.getAttribute('aria-pressed');
  var hasActiveClass = Array.from(buttonElement.classList).some(function (className) {
    return className.includes('style_active__');
  });

  // アイコンによる満員判定（calendar_ng.svgが最も確実）
  var fullIcon = buttonElement.querySelector('img[src*="calendar_ng.svg"]');
  var lowIcon = buttonElement.querySelector('img[src*="ico_scale_low.svg"]');
  var highIcon = buttonElement.querySelector('img[src*="ico_scale_high.svg"]');
  var iconType = 'unknown';
  var status = 'unknown';

  // アイコンベースでの判定
  if (fullIcon) {
    iconType = 'full';
    status = 'full';
  } else if (highIcon) {
    iconType = 'high';
    status = 'available';
  } else if (lowIcon) {
    iconType = 'low';
    status = 'available';
  }

  // data-disabled属性での追加確認
  if (dataDisabled === 'true') {
    status = 'full';
  }

  // 選択状態の確認
  if (hasActiveClass || ariaPressed === 'true') {
    status = 'selected';
  }

  // デバッグ情報
  console.log("\u6642\u9593\u5E2F\u89E3\u6790: ".concat(timeText, " - status: ").concat(status, ", iconType: ").concat(iconType, ", disabled: ").concat(dataDisabled, ", pressed: ").concat(ariaPressed, ", hasFullIcon: ").concat(!!fullIcon));
  return {
    element: buttonElement,
    tdElement: tdElement,
    timeText: timeText,
    status: status,
    iconType: iconType,
    selector: generateSelectorForElement(buttonElement)
  };
}

// 要素のセレクタを生成（フォールバック用）
function generateSelectorForElement(element) {
  var timeSpan = element.querySelector('dt span');
  var timeText = timeSpan ? timeSpan.textContent.trim() : '';
  return "td[data-gray-out] div[role='button'] dt span:contains('".concat(timeText, "')");
}

// 満員時間帯にモニタリングボタンを追加
function addMonitorButtonsToFullSlots(fullSlots) {
  fullSlots.forEach(function (slotInfo) {
    createMonitorButton(slotInfo);
  });
}

// 監視ボタンのテキストを決定（優先順位表示）
function getMonitorButtonText(slotInfo) {
  var tdElement = slotInfo.element.closest('td[data-gray-out]');
  var tdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);

  // 既に監視対象として選択されているかチェック
  var isSelected = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.isSelected(slotInfo.timeText, tdSelector);
  if (isSelected) {
    // 監視対象リストでの位置を取得（1ベース）
    var targets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
    var targetIndex = targets.findIndex(function (target) {
      return target.timeText === slotInfo.timeText && target.tdSelector === tdSelector;
    });
    if (targetIndex >= 0) {
      var priority = targetIndex + 1; // 1ベースの優先順位
      return "\u76E3\u8996".concat(priority);
    }
  }
  return '満員';
}

// すべての監視ボタンの優先順位を更新
function updateAllMonitorButtonPriorities() {
  var allMonitorButtons = document.querySelectorAll('.monitor-btn');
  var targets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
  allMonitorButtons.forEach(function (button) {
    var span = button.querySelector('span');
    var timeText = button.getAttribute('data-target-time');
    if (span && timeText) {
      // このボタンの時間帯と位置情報を特定
      var tdElement = button.closest('td[data-gray-out]');
      if (tdElement) {
        var tdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);

        // 監視対象リストでの位置を検索
        var targetIndex = targets.findIndex(function (target) {
          return target.timeText === timeText && target.tdSelector === tdSelector;
        });
        if (targetIndex >= 0) {
          // 監視対象として選択されている場合、優先順位を表示
          var priority = targetIndex + 1;
          span.innerText = "\u76E3\u8996".concat(priority);
          button.style.background = 'rgb(0, 104, 33)';
        } else {
          // 監視対象でない場合は「満員」
          span.innerText = '満員';
          button.style.background = 'rgb(255, 140, 0)';
        }
      }
    }
  });
  console.log("\u2705 \u3059\u3079\u3066\u306E\u76E3\u8996\u30DC\u30BF\u30F3\u306E\u512A\u5148\u9806\u4F4D\u3092\u66F4\u65B0\u3057\u307E\u3057\u305F (".concat(targets.length, "\u500B\u306E\u76E3\u8996\u5BFE\u8C61)"));
}

// 個別監視ボタンの作成（満員要素のみ）
function createMonitorButton(slotInfo) {
  var element = slotInfo.element,
    timeText = slotInfo.timeText,
    status = slotInfo.status;

  // 満員要素以外にはボタンを追加しない
  if (status !== 'full') {
    console.log("\u6E80\u54E1\u3067\u306F\u306A\u3044\u305F\u3081\u30DC\u30BF\u30F3\u3092\u8FFD\u52A0\u3057\u307E\u305B\u3093: ".concat(timeText, " (status: ").concat(status, ")"));
    return;
  }

  // dt要素を探す
  var dtElement = element.querySelector('dt');
  if (!dtElement) {
    console.log("dt\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(timeText));
    return;
  }

  // 既にボタンが存在するかチェック
  var existingButton = dtElement.querySelector('.monitor-btn');
  if (existingButton) {
    console.log("\u76E3\u8996\u30DC\u30BF\u30F3\u306F\u65E2\u306B\u5B58\u5728\u3057\u307E\u3059: ".concat(timeText));
    return;
  }

  // 監視ボタンを作成（満員要素のクリック制限を回避）
  var monitorButton = document.createElement('button');
  monitorButton.classList.add('ext-ytomo', 'monitor-btn');
  monitorButton.setAttribute('data-target-time', timeText);
  monitorButton.style.cssText = "\n        height: auto;\n        min-height: 20px;\n        width: auto;\n        min-width: 35px;\n        padding: 1px 4px;\n        background: rgb(255, 140, 0) !important;\n        color: white !important;\n        margin-left: 8px;\n        font-size: 10px;\n        border: none !important;\n        border-radius: 2px;\n        cursor: pointer !important;\n        display: inline-block;\n        vertical-align: middle;\n        position: relative;\n        z-index: 9999 !important;\n        pointer-events: auto !important;\n        opacity: 1 !important;\n        visibility: visible !important;\n    ";

  // ボタンテキストとイベントリスナー
  var buttonSpan = document.createElement('span');
  buttonSpan.classList.add('ext-ytomo');

  // 優先順位形式でボタンテキストを設定
  var buttonText = getMonitorButtonText(slotInfo);
  buttonSpan.innerText = buttonText;
  monitorButton.appendChild(buttonSpan);

  // クリックイベント（確実な処理のため）
  monitorButton.addEventListener('click', function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    var tdElement = slotInfo.element.closest('td[data-gray-out]');
    var tdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
    var location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(tdSelector);
    console.log("\uD83D\uDDB1\uFE0F \u76E3\u8996\u30DC\u30BF\u30F3\u30AF\u30EA\u30C3\u30AF\u691C\u51FA: ".concat(location).concat(slotInfo.timeText));

    // ボタン要素の確認
    var span = monitorButton.querySelector('span');
    console.log("\u73FE\u5728\u306E\u30DC\u30BF\u30F3\u30C6\u30AD\u30B9\u30C8: \"".concat(span === null || span === void 0 ? void 0 : span.innerText, "\""));
    console.log("\u30DC\u30BF\u30F3disabled\u72B6\u614B: ".concat(monitorButton.disabled));
    handleMonitorButtonClick(slotInfo, monitorButton);
  }, true); // useCapture = true で確実にキャッチ

  // マウスイベントも制御
  monitorButton.addEventListener('mousedown', function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  });

  // ダブルクリック防止
  monitorButton.addEventListener('dblclick', function (event) {
    event.preventDefault();
    event.stopPropagation();
  });
  monitorButton.addEventListener('mouseup', function (event) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
  });

  // 親要素の無効化は行わず、イベント制御のみで対応
  // （選択中ボタンのクリックを可能にするため）

  // dt要素内に追加（spanの後）
  dtElement.appendChild(monitorButton);
  console.log("\u6E80\u54E1\u6642\u9593\u5E2F\u306B\u76E3\u8996\u30DC\u30BF\u30F3\u3092\u8FFD\u52A0\u3057\u307E\u3057\u305F: ".concat(timeText));
}

// 監視ボタンクリック処理（選択・解除切り替え）
function handleMonitorButtonClick(slotInfo, buttonElement) {
  var tdElement = slotInfo.element.closest('td[data-gray-out]');
  var tdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(tdElement);
  var location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(tdSelector);
  console.log("\u76E3\u8996\u30DC\u30BF\u30F3\u304C\u30AF\u30EA\u30C3\u30AF\u3055\u308C\u307E\u3057\u305F: ".concat(location).concat(slotInfo.timeText));

  // 監視実行中は操作不可
  if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring) {
    console.log('⚠️ 監視実行中のため操作できません');
    // ユーザーにフィードバックを提供
    // safeCall('showStatus', '監視実行中のため操作できません', 'orange'); // showStatusは内部関数のため一時的に無効化
    return;
  }
  var buttonSpan = buttonElement.querySelector('span');
  var currentText = buttonSpan.innerText;
  var isCurrentlySelected = currentText.startsWith('監視'); // '監視1', '監視2' etc.

  console.log("\u73FE\u5728\u306E\u72B6\u614B: ".concat(isCurrentlySelected ? '選択中' : '未選択', " (\u30C6\u30AD\u30B9\u30C8: \"").concat(currentText, "\")"));
  if (isCurrentlySelected) {
    // 現在選択中の場合は解除
    console.log("\u76E3\u8996\u5BFE\u8C61\u3092\u89E3\u9664\u3057\u307E\u3059: ".concat(location).concat(slotInfo.timeText));

    // 複数対象管理から削除（時間+位置で特定）
    var _tdElement = slotInfo.element.closest('td[data-gray-out]');
    var _tdSelector = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(_tdElement);
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.removeTarget(slotInfo.timeText, _tdSelector);

    // ボタンの表示を元に戻す
    buttonSpan.innerText = '満員';
    buttonElement.style.background = 'rgb(255, 140, 0)';
    buttonElement.style.opacity = '1';
    buttonElement.style.cursor = 'pointer';
    buttonElement.disabled = false;

    // 監視対象がすべてなくなった場合の処理
    if (!_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
      _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
      _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;

      // キャッシュをクリア
      cacheManager.clearTargetSlots();
      cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア

      // 他のボタンを有効化
      safeCall('enableAllMonitorButtons');
    } else {
      // キャッシュを更新（残りの監視対象で）
      cacheManager.saveTargetSlots();

      // 残りのボタンの優先順位を更新
      updateAllMonitorButtonPriorities();
    }

    // メインボタンの表示を更新
    safeCall('updateMainButtonDisplay');

    // 監視対象表示も更新
    safeCall('updateMonitoringTargetsDisplay');
    console.log("\u2705 \u76E3\u8996\u5BFE\u8C61\u3092\u89E3\u9664\u3057\u307E\u3057\u305F: ".concat(location).concat(slotInfo.timeText));
  } else {
    // 現在未選択の場合は選択
    console.log("\u76E3\u8996\u5BFE\u8C61\u3092\u8FFD\u52A0\u3057\u307E\u3059: ".concat(location).concat(slotInfo.timeText));

    // 既存の選択をリセットする処理を削除（複数選択を許可）

    // 選択状態を設定（td要素の一意特定情報を追加）
    var _tdElement2 = slotInfo.element.closest('td[data-gray-out]');
    var targetSlotInfo = _objectSpread(_objectSpread({}, slotInfo), {}, {
      // td要素の一意特定情報を追加
      tdSelector: (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .generateUniqueTdSelector */ .sN)(_tdElement2),
      positionInfo: (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .getTdPositionInfo */ .AL)(_tdElement2)
    });

    // 複数対象管理に追加
    var added = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.addTarget(targetSlotInfo);
    if (!added) {
      console.log('⚠️ 既に選択済みの時間帯です');
      return;
    }
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'selecting';
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;

    // キャッシュに保存（すべての監視対象を保存）
    cacheManager.saveTargetSlots();

    // ボタンの表示を変更（優先順位表示）
    var priority = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount(); // 追加後の順位
    buttonSpan.innerText = "\u76E3\u8996".concat(priority);
    buttonElement.style.background = 'rgb(0, 104, 33)';
    buttonElement.style.opacity = '1';
    buttonElement.style.cursor = 'pointer';
    buttonElement.disabled = false; // クリックで解除できるように

    // 複数選択対応：他のボタンを無効化しない
    // disableOtherMonitorButtons(slotInfo.timeText); // この行をコメントアウト

    // メインボタンの表示を更新
    console.log("\uD83D\uDD04 \u76E3\u8996\u5BFE\u8C61\u8A2D\u5B9A\u5F8C\u306EFAB\u66F4\u65B0\u3092\u5B9F\u884C: targetSlots=".concat(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount(), "\u500B, mode=").concat(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode));
    safeCall('updateMainButtonDisplay');

    // 監視対象表示も更新
    safeCall('updateMonitoringTargetsDisplay');

    // 更新後の状態も確認
    setTimeout(function () {
      var _fabButton$textConten;
      var fabButton = document.querySelector('#ytomo-main-fab');
      console.log("\uD83D\uDD0D FAB\u66F4\u65B0\u5F8C\u306E\u72B6\u614B: disabled=".concat(fabButton === null || fabButton === void 0 ? void 0 : fabButton.disabled, ", hasDisabledAttr=").concat(fabButton === null || fabButton === void 0 ? void 0 : fabButton.hasAttribute('disabled'), ", text=\"").concat(fabButton === null || fabButton === void 0 || (_fabButton$textConten = fabButton.textContent) === null || _fabButton$textConten === void 0 ? void 0 : _fabButton$textConten.trim(), "\""));
    }, 100);
    console.log("\u2705 \u6642\u9593\u5E2F ".concat(location).concat(slotInfo.timeText, " \u3092\u76E3\u8996\u5BFE\u8C61\u306B\u8A2D\u5B9A\u3057\u307E\u3057\u305F"));
  }
}

// 満員時間帯の可用性監視を開始
function startSlotMonitoring() {
  return _startSlotMonitoring.apply(this, arguments);
} // 時間帯の可用性チェックとページ再読み込み
function _startSlotMonitoring() {
  _startSlotMonitoring = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3() {
    var targetCount, targetTexts;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets()) {
            _context4.n = 1;
            break;
          }
          console.log('❌ 監視対象時間帯が設定されていません');
          return _context4.a(2);
        case 1:
          // 即座に状態更新（UI応答性向上）
          _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'monitoring';
          _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring = true;
          safeCall('updateMainButtonDisplay'); // 即座にボタン表示を更新

          // 監視実行中は全ての監視ボタンを無効化
          safeCall('disableAllMonitorButtons');
          targetCount = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getCount();
          targetTexts = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets().map(function (t) {
            var location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(t.tdSelector);
            return "".concat(location).concat(t.timeText);
          }).join(', ');
          console.log("\uD83D\uDD04 \u6642\u9593\u5E2F\u76E3\u8996\u3092\u958B\u59CB: ".concat(targetTexts, " (").concat(targetCount, "\u500B)"));

          // 定期的な可用性チェック
          _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval = setInterval(/*#__PURE__*/_asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
            return _regenerator().w(function (_context3) {
              while (1) switch (_context3.n) {
                case 0:
                  _context3.n = 1;
                  return checkSlotAvailabilityAndReload();
                case 1:
                  return _context3.a(2);
              }
            }, _callee2);
          })), _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.reloadInterval + Math.random() * 5000); // ランダム性追加

          // 即座に一回チェック（短縮）
          setTimeout(function () {
            checkSlotAvailabilityAndReload();
          }, 500);
        case 2:
          return _context4.a(2);
      }
    }, _callee3);
  }));
  return _startSlotMonitoring.apply(this, arguments);
}
function checkSlotAvailabilityAndReload() {
  return _checkSlotAvailabilityAndReload.apply(this, arguments);
} // ページ内で対象時間帯を検索（複数対象の状態変化をチェック）
function _checkSlotAvailabilityAndReload() {
  _checkSlotAvailabilityAndReload = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4() {
    var targets, _iterator2, _step2, target, targetTexts, currentSlot, location, flagTimestamp, baseInterval, randomVariation, totalWaitTime, displaySeconds, _t;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.p = _context5.n) {
        case 0:
          if (!(!_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring || !_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.hasTargets())) {
            _context5.n = 1;
            break;
          }
          return _context5.a(2);
        case 1:
          if (validatePageLoaded()) {
            _context5.n = 2;
            break;
          }
          return _context5.a(2);
        case 2:
          _context5.n = 3;
          return checkTimeSlotTableExistsAsync();
        case 3:
          if (_context5.v) {
            _context5.n = 4;
            break;
          }
          return _context5.a(2);
        case 4:
          // 複数監視対象の存在チェック
          targets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
          _iterator2 = _createForOfIteratorHelper(targets);
          _context5.p = 5;
          _iterator2.s();
        case 6:
          if ((_step2 = _iterator2.n()).done) {
            _context5.n = 8;
            break;
          }
          target = _step2.value;
          if (checkTargetElementExists(target)) {
            _context5.n = 7;
            break;
          }
          return _context5.a(2);
        case 7:
          _context5.n = 6;
          break;
        case 8:
          _context5.n = 10;
          break;
        case 9:
          _context5.p = 9;
          _t = _context5.v;
          _iterator2.e(_t);
        case 10:
          _context5.p = 10;
          _iterator2.f();
          return _context5.f(10);
        case 11:
          if (checkMaxReloads(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount)) {
            _context5.n = 12;
            break;
          }
          return _context5.a(2);
        case 12:
          _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount++;
          cacheManager.updateRetryCount(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount);
          targetTexts = targets.map(function (t) {
            return t.timeText;
          }).join(', ');
          console.log("\uD83D\uDD0D \u53EF\u7528\u6027\u30C1\u30A7\u30C3\u30AF (".concat(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount, "\u56DE\u76EE): ").concat(targetTexts));

          // 現在の時間帯をチェック
          currentSlot = findTargetSlotInPage();
          console.log("\uD83D\uDCCA \u76E3\u8996\u30C1\u30A7\u30C3\u30AF\u7D50\u679C: currentSlot=".concat(!!currentSlot, ", status=").concat(currentSlot === null || currentSlot === void 0 ? void 0 : currentSlot.status));
          if (!(currentSlot && currentSlot.status === 'available')) {
            _context5.n = 14;
            break;
          }
          location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(currentSlot.targetInfo.tdSelector);
          console.log("\uD83C\uDF89\uD83C\uDF89 \u5BFE\u8C61\u6642\u9593\u5E2F\u304C\u5229\u7528\u53EF\u80FD\u306B\u306A\u308A\u307E\u3057\u305F\uFF01: ".concat(location).concat(currentSlot.targetInfo.timeText));
          console.log("  \u2192 \u76E3\u8996\u3092\u7D42\u4E86\u3057\u3001\u81EA\u52D5\u9078\u629E+\u4E88\u7D04\u3092\u958B\u59CB\u3057\u307E\u3059");

          // ボタン表示を更新（見つかりましたモード）
          safeCall('updateMainButtonDisplay', 'found-available');

          // 自動選択
          _context5.n = 13;
          return safeCall('selectTimeSlotAndStartReservation', currentSlot);
        case 13:
          return _context5.a(2);
        case 14:
          // まだ満員の場合はページリロード
          console.log('⏳ すべての監視対象がまだ満員です。ページを再読み込みします...');

          // リロード前に監視継続フラグを設定
          flagTimestamp = Date.now();
          cacheManager.setMonitoringFlag(true);
          console.log("\uD83C\uDFC3 \u76E3\u8996\u7D99\u7D9A\u30D5\u30E9\u30B0\u8A2D\u5B9A\u6642\u523B: ".concat(new Date(flagTimestamp).toLocaleTimeString()));

          // BAN対策：設定されたリロード間隔にランダム要素を追加
          baseInterval = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.reloadInterval; // 30000ms (30秒)
          randomVariation = Math.random() * 5000; // 0-5秒のランダム要素
          totalWaitTime = baseInterval + randomVariation;
          displaySeconds = Math.ceil(totalWaitTime / 1000); // カウントダウン開始（即座にUI更新）
          safeCall('startReloadCountdown', displaySeconds);

          // リロードタイマーを保存（中断時に停止するため）
          safeRef('reloadCountdownState').reloadTimer = setTimeout(function () {
            console.log('🔄 監視継続のためページをリロードします...');
            window.location.reload();
          }, totalWaitTime);
        case 15:
          return _context5.a(2);
      }
    }, _callee4, null, [[5, 9, 10, 11]]);
  }));
  return _checkSlotAvailabilityAndReload.apply(this, arguments);
}
function findTargetSlotInPage() {
  var targets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
  if (targets.length === 0) return null;

  // 複数監視対象をチェック
  var _iterator = _createForOfIteratorHelper(targets),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var target = _step.value;
      // 監視開始時に保存した要素特定情報を使用して同一td要素を検索
      var targetTd = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(target);
      if (targetTd) {
        // 同一td要素の現在の状態を取得
        var currentStatus = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .extractTdStatus */ .SE)(targetTd);
        var location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);

        // 詳細なデバッグ情報を出力
        var buttonElement = targetTd.querySelector('div[role="button"]');
        var dataDisabled = buttonElement === null || buttonElement === void 0 ? void 0 : buttonElement.getAttribute('data-disabled');
        var fullIcon = buttonElement === null || buttonElement === void 0 ? void 0 : buttonElement.querySelector('img[src*="calendar_ng.svg"]');
        var lowIcon = buttonElement === null || buttonElement === void 0 ? void 0 : buttonElement.querySelector('img[src*="ico_scale_low.svg"]');
        var highIcon = buttonElement === null || buttonElement === void 0 ? void 0 : buttonElement.querySelector('img[src*="ico_scale_high.svg"]');
        console.log("\uD83D\uDD0D \u76E3\u8996\u5BFE\u8C61\u8981\u7D20\u3092\u767A\u898B: ".concat(location).concat(target.timeText));
        console.log("  - \u73FE\u5728\u72B6\u614B: ".concat(currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.status));
        console.log("  - data-disabled: ".concat(dataDisabled));
        console.log("  - \u6E80\u54E1\u30A2\u30A4\u30B3\u30F3: ".concat(!!fullIcon, ", \u4F4E\u6DF7\u96D1: ").concat(!!lowIcon, ", \u9AD8\u7A7A\u304D: ").concat(!!highIcon));

        // 利用可能になったかチェック
        if (currentStatus && currentStatus.status === 'available') {
          console.log("\uD83C\uDF89 \u76E3\u8996\u5BFE\u8C61\u8981\u7D20\u304C\u5229\u7528\u53EF\u80FD\u306B\u306A\u308A\u307E\u3057\u305F\uFF01: ".concat(location).concat(target.timeText));
          console.log("  \u2192 \u76E3\u8996\u3092\u7D42\u4E86\u3057\u3066\u81EA\u52D5\u9078\u629E\u3092\u958B\u59CB\u3057\u307E\u3059");
          return _objectSpread(_objectSpread({}, currentStatus), {}, {
            targetInfo: target
          });
        } else if (currentStatus && currentStatus.status === 'full') {
          console.log("\u23F3 \u76E3\u8996\u5BFE\u8C61\u8981\u7D20\u306F\u307E\u3060\u6E80\u54E1: ".concat(location).concat(target.timeText));
        } else {
          console.log("\u2753 \u76E3\u8996\u5BFE\u8C61\u8981\u7D20\u306E\u72B6\u614B\u304C\u4E0D\u660E: ".concat(location).concat(target.timeText, " (status: ").concat(currentStatus === null || currentStatus === void 0 ? void 0 : currentStatus.status, ")"));
        }
      } else {
        // 要素が見つからない場合
        var _location = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getLocationFromSelector(target.tdSelector);
        console.log("\u274C \u76E3\u8996\u5BFE\u8C61\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(_location).concat(target.timeText));
      }
    }

    // すべて満員または見つからない場合
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  console.log('⏳ すべての監視対象要素はまだ満員です');
  return null;
}

// 異常終了処理の統一関数
function terminateMonitoring(errorCode, errorMessage) {
  console.error("[\u76E3\u8996\u7570\u5E38\u7D42\u4E86] ".concat(errorCode, ": ").concat(errorMessage));

  // 状態クリア
  cacheManager.clearTargetSlots();
  cacheManager.clearMonitoringFlag(); // 監視継続フラグもクリア

  // インターバル停止
  if (_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval) {
    clearInterval(_section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval);
    _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.monitoringInterval = null;
  }

  // UI状態リセット
  safeCall('resetMonitoringUI');
  safeCall('updateMainButtonDisplay', 'idle');

  // エラー表示
  safeCall('showErrorMessage', errorMessage);

  // 状態初期化
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.mode = 'idle';
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.isMonitoring = false;
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.clearAll();
  _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount = 0;
}

// 監視バリデーション関数群
function checkTargetElementExists(targetInfo) {
  var element = (0,_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .findSameTdElement */ .e0)(targetInfo);
  if (!element) {
    terminateMonitoring('ERROR_TARGET_NOT_FOUND', "\u76E3\u8996\u5BFE\u8C61\u306E\u6642\u9593\u5E2F ".concat(targetInfo.timeText, " \u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093"));
    return false;
  }
  return true;
}
function checkTimeSlotTableExistsAsync() {
  return _checkTimeSlotTableExistsAsync.apply(this, arguments);
}
function _checkTimeSlotTableExistsAsync() {
  _checkTimeSlotTableExistsAsync = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5() {
    var table, calendarClicked, tableAppeared;
    return _regenerator().w(function (_context6) {
      while (1) switch (_context6.n) {
        case 0:
          table = document.querySelector(_section4_js__WEBPACK_IMPORTED_MODULE_1__/* .timeSlotSelectors */ .eN.timeSlotContainer);
          if (table) {
            _context6.n = 4;
            break;
          }
          // テーブルが見つからない場合、カレンダークリックを試行
          console.log('⚠️ 時間帯テーブルが見つからないため、カレンダークリックを試行します');
          _context6.n = 1;
          return safeCall('tryClickCalendarForTimeSlot');
        case 1:
          calendarClicked = _context6.v;
          if (!calendarClicked) {
            _context6.n = 3;
            break;
          }
          _context6.n = 2;
          return waitForTimeSlotTable(3000);
        case 2:
          tableAppeared = _context6.v;
          if (!tableAppeared) {
            _context6.n = 3;
            break;
          }
          console.log('✅ カレンダークリック後にテーブルが表示されました');
          return _context6.a(2, true);
        case 3:
          terminateMonitoring('ERROR_TABLE_NOT_FOUND', '時間帯選択テーブルが見つかりません（カレンダークリック後も表示されず）');
          return _context6.a(2, false);
        case 4:
          return _context6.a(2, true);
      }
    }, _callee5);
  }));
  return _checkTimeSlotTableExistsAsync.apply(this, arguments);
}
function validatePageLoaded() {
  // URL確認
  if (!window.location.href.includes('ticket_visiting_reservation')) {
    terminateMonitoring('ERROR_WRONG_PAGE', '予期しないページに遷移しました');
    return false;
  }

  // 基本要素の存在確認
  var mainContent = document.querySelector('#__next');
  if (!mainContent) {
    terminateMonitoring('ERROR_PAGE_LOAD_FAILED', 'ページの読み込みが完了していません');
    return false;
  }
  return true;
}
function checkMaxReloads(currentCount) {
  var MAX_RELOAD_COUNT = 100; // 50分間（30秒×100回）
  if (currentCount >= MAX_RELOAD_COUNT) {
    terminateMonitoring('ERROR_MAX_RETRIES_REACHED', "\u6700\u5927\u8A66\u884C\u56DE\u6570 ".concat(MAX_RELOAD_COUNT, " \u306B\u9054\u3057\u307E\u3057\u305F"));
    return false;
  }
  return true;
}

// エクスポート


// ============================================================================

/***/ }),

/***/ 644:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   K: () => (/* binding */ createCacheManager)
/* harmony export */ });
/* harmony import */ var _section2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(915);
// Section 2からのimport


// ============================================================================
// キャッシュ管理機能
var createCacheManager = function createCacheManager() {
  var dependencies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var getCurrentSelectedCalendarDateFn = dependencies.getCurrentSelectedCalendarDateFn;
  return {
    // キー生成（URLベース）
    generateKey: function generateKey() {
      var suffix = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
      var url = new URL(window.location.href);
      var baseKey = "expo2025_entrance_".concat(url.searchParams.get('reserve_id') || 'default');
      return suffix ? "".concat(baseKey, "_").concat(suffix) : baseKey;
    },
    // 複数監視対象を保存
    saveTargetSlots: function saveTargetSlots() {
      try {
        var targets = _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .multiTargetManager */ ._t.getTargets();
        if (targets.length === 0) return;

        // 現在選択されているカレンダー日付を取得
        var selectedCalendarDate = getCurrentSelectedCalendarDateFn ? getCurrentSelectedCalendarDateFn() : null;
        var data = {
          targets: targets.map(function (target) {
            return {
              timeText: target.timeText,
              tdSelector: target.tdSelector,
              positionInfo: target.positionInfo,
              status: target.status
            };
          }),
          selectedDate: selectedCalendarDate,
          timestamp: Date.now(),
          url: window.location.href,
          retryCount: _section2_js__WEBPACK_IMPORTED_MODULE_0__/* .timeSlotState */ .Pf.retryCount || 0
        };
        localStorage.setItem(this.generateKey('target_slots'), JSON.stringify(data));
        var targetTexts = targets.map(function (t) {
          return t.timeText;
        }).join(', ');
        console.log("\u2705 \u8907\u6570\u76E3\u8996\u5BFE\u8C61\u3092\u30AD\u30E3\u30C3\u30B7\u30E5\u306B\u4FDD\u5B58: ".concat(targetTexts, " (").concat(targets.length, "\u500B)"));
      } catch (error) {
        console.error('❌ 複数監視対象保存エラー:', error);
      }
    },
    // 後方互換性のため残す
    saveTargetSlot: function saveTargetSlot(slotInfo) {
      this.saveTargetSlots();
    },
    // 監視対象時間帯を読み込み
    loadTargetSlot: function loadTargetSlot() {
      try {
        var data = localStorage.getItem(this.generateKey('target_slot'));
        if (!data) return null;
        var parsed = JSON.parse(data);
        // 24時間以内のデータのみ有効
        if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
          this.clearTargetSlot();
          return null;
        }
        console.log('📖 キャッシュから監視対象時間帯を読み込み:', parsed.timeText);
        return parsed;
      } catch (error) {
        console.error('❌ キャッシュ読み込みエラー:', error);
        return null;
      }
    },
    // 複数監視対象を読み込み（後方互換性あり）
    loadTargetSlots: function loadTargetSlots() {
      try {
        // 新形式の複数対象キャッシュを確認
        var newData = localStorage.getItem(this.generateKey('target_slots'));
        if (newData) {
          var _parsed$targets, _parsed$targets2;
          var parsed = JSON.parse(newData);
          // 24時間以内のデータのみ有効
          if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
            this.clearTargetSlots();
            return null;
          }
          var targetTexts = ((_parsed$targets = parsed.targets) === null || _parsed$targets === void 0 ? void 0 : _parsed$targets.map(function (t) {
            return t.timeText;
          }).join(', ')) || '不明';
          console.log("\uD83D\uDCD6 \u8907\u6570\u76E3\u8996\u5BFE\u8C61\u30AD\u30E3\u30C3\u30B7\u30E5\u3092\u8AAD\u307F\u8FBC\u307F: ".concat(targetTexts, " (").concat(((_parsed$targets2 = parsed.targets) === null || _parsed$targets2 === void 0 ? void 0 : _parsed$targets2.length) || 0, "\u500B)"));
          return parsed;
        }

        // 後方互換性：古い単一対象キャッシュを確認
        var oldData = this.loadTargetSlot();
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
      } catch (error) {
        console.error('❌ 複数監視対象読み込みエラー:', error);
        return null;
      }
    },
    // 複数監視対象をクリア
    clearTargetSlots: function clearTargetSlots() {
      try {
        localStorage.removeItem(this.generateKey('target_slots'));
        localStorage.removeItem(this.generateKey('target_slot')); // 古い形式もクリア
        console.log('🗑️ 複数監視対象キャッシュをクリア');
      } catch (error) {
        console.error('❌ 複数監視対象クリアエラー:', error);
      }
    },
    // 後方互換性のため残す
    clearTargetSlot: function clearTargetSlot() {
      this.clearTargetSlots();
    },
    // 試行回数を更新
    updateRetryCount: function updateRetryCount(count) {
      var cached = this.loadTargetSlot();
      if (cached) {
        cached.retryCount = count;
        cached.timestamp = Date.now();
        localStorage.setItem(this.generateKey('target_slot'), JSON.stringify(cached));
      }
    },
    // 監視継続フラグを設定（リロード前に呼び出し）
    setMonitoringFlag: function setMonitoringFlag() {
      var isActive = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
      try {
        var data = {
          isMonitoring: isActive,
          timestamp: Date.now()
        };
        localStorage.setItem(this.generateKey('monitoring_flag'), JSON.stringify(data));
        console.log("\uD83C\uDFC3 \u76E3\u8996\u7D99\u7D9A\u30D5\u30E9\u30B0\u3092\u8A2D\u5B9A: ".concat(isActive));
      } catch (error) {
        console.error('❌ 監視フラグ設定エラー:', error);
      }
    },
    // 監視継続フラグを取得し、即座にfalseに設定（暴走防止）
    getAndClearMonitoringFlag: function getAndClearMonitoringFlag() {
      try {
        var data = localStorage.getItem(this.generateKey('monitoring_flag'));
        if (!data) return false;
        var parsed = JSON.parse(data);
        // 60秒以内のフラグのみ有効（リロード直後でないと無効）
        // リロード間隔が30秒 + ランダム5秒 + ページロード時間 + 初期化時間を考慮
        var isRecent = Date.now() - parsed.timestamp < 60 * 1000;
        var shouldContinue = isRecent && parsed.isMonitoring;

        // フラグを即座にクリア（暴走防止）
        this.clearMonitoringFlag();
        var timeDiff = (Date.now() - parsed.timestamp) / 1000;
        console.log("\uD83D\uDD0D \u76E3\u8996\u7D99\u7D9A\u30D5\u30E9\u30B0\u30C1\u30A7\u30C3\u30AF: ".concat(shouldContinue, " (recent: ").concat(isRecent, ", flag: ").concat(parsed.isMonitoring, ", \u7D4C\u904E\u6642\u9593: ").concat(timeDiff.toFixed(1), "\u79D2)"));
        console.log("\uD83D\uDCC5 \u30D5\u30E9\u30B0\u8A2D\u5B9A\u6642\u523B: ".concat(new Date(parsed.timestamp).toLocaleTimeString(), ", \u73FE\u5728\u6642\u523B: ").concat(new Date().toLocaleTimeString()));
        return shouldContinue;
      } catch (error) {
        console.error('❌ 監視フラグ取得エラー:', error);
        return false;
      }
    },
    // 監視継続フラグをクリア
    clearMonitoringFlag: function clearMonitoringFlag() {
      try {
        localStorage.removeItem(this.generateKey('monitoring_flag'));
        console.log('🗑️ 監視継続フラグをクリア');
      } catch (error) {
        console.error('❌ 監視フラグクリアエラー:', error);
      }
    }
  };
}; // createCacheManager の終了

// エクスポート


// ============================================================================

/***/ }),

/***/ 702:
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
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// 【1. 基本機能・ユーティリティ】
// ============================================================================

// スタイルを挿入する関数
var insert_style = function insert_style() {
  var style = document.createElement("style");
  style.innerHTML = "\nbutton.ext-ytomo {\n    height: 40px;\n    width: auto;\n    min-width: 60px;\n    padding: 0px 8px;\n    background: rgb(0, 104, 33) !important;\n    color: white;\n}\nbutton.no-after.ext-ytomo:after {\n    background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;\n}\nbutton.ext-ytomo.btn-done {\n    background: rgb(74, 76, 74) !important;\n}\n.ext-ytomo:hover {\n    background: rgb(2, 134, 43);\n}\n\n.safe-none, .ytomo-none, .filter-none {\n    display: none;\n}\n\ndiv.div-flex {\n    display: flex;\n    justify-content: center;\n    margin: 5px;\n}\n\ninput.ext-tomo.search {\n    height: 50px;\n    min-width: 200px;\n    max-width: min(300px, 100%);\n    font-family: quicksand;\n    font-size: 16px;\n    -webkit-appearance: textfield;\n    -moz-appearance: textfield;\n    appearance: textfield;\n    border: 1px solid #222426;\n    border-radius: 25px;\n    box-shadow: 0 1px 0 0 #ccc;\n    padding: 0 0 0 10px;\n    flex: 1 1;\n}\n    ";
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
var prepare_filter = function prepare_filter(val_search) {
  // 空の検索文字列の場合は全てにマッチする正規表現を返す
  if (!val_search.trim()) {
    return {
      include: /(?:)/,
      exclude: null
    };
  }

  // OR条件を一時的に特別なマーカーに置換（後で処理するため）
  var orReplaced = val_search.replace(/(?:\s+|^)(or|OR)(?:\s+|$)/g, " \uFFFF ");

  // フレーズ検索（引用符で囲まれた部分）を抽出
  var phraseMatches = orReplaced.match(/"[^"]*"/g) || [];
  var remainingStr = orReplaced;
  var phrases = phraseMatches.map(function (phrase) {
    remainingStr = remainingStr.replace(phrase, '');
    return phrase.slice(1, -1).replace(/\*/g, '.*');
  });

  // 残りの部分から通常の単語とマイナス検索を抽出
  var tokens = remainingStr.split(/\s+/).filter(function (token) {
    return token;
  });
  var includeTokens = [];
  var excludeTokens = [];
  tokens.forEach(function (token) {
    if (token === "\uFFFF") {
      // ORマーカー
      includeTokens.push(token);
    } else if (token.startsWith('-')) {
      // マイナス検索
      var cleaned = token.slice(1).replace(/\*/g, '.*');
      if (cleaned) excludeTokens.push(cleaned);
    } else {
      // 通常の検索
      var _cleaned = token.replace(/\*/g, '.*');
      if (_cleaned) includeTokens.push(_cleaned);
    }
  });

  // フレーズをincludeTokensに追加
  phrases.forEach(function (phrase) {
    includeTokens.push(phrase);
  });

  // 括弧の処理（簡易的な実装）
  var processParentheses = function processParentheses(tokens) {
    var stack = [[]];
    var _iterator = _createForOfIteratorHelper(tokens),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var token = _step.value;
        if (token === '(') {
          stack.push([]);
        } else if (token === ')') {
          if (stack.length > 1) {
            var group = stack.pop();
            stack[stack.length - 1].push(group);
          }
        } else {
          stack[stack.length - 1].push(token);
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    return stack[0];
  };
  var groupedIncludes = processParentheses(includeTokens);

  // 正規表現の構築（順不同対応版）
  var _buildRegex = function buildRegex(group) {
    if (Array.isArray(group)) {
      var parts = group.map(function (item) {
        return Array.isArray(item) ? _buildRegex(item) : item;
      });

      // ORマーカーがあるかチェック
      var orIndex = parts.findIndex(function (part) {
        return part === "\uFFFF";
      });
      if (orIndex > -1) {
        var left = _buildRegex(parts.slice(0, orIndex));
        var right = _buildRegex(parts.slice(orIndex + 1));
        return "(?:".concat(left, "|").concat(right, ")");
      } else {
        // AND条件の場合は順不同でマッチするように変更
        return parts.map(function (part) {
          return "(?=.*".concat(part, ")");
        }).join('');
      }
    }
    return group;
  };
  var includePattern = _buildRegex(groupedIncludes).replace(/\uFFFF/g, '|').replace(/\.\*/g, '[\\s\\S]*');

  // Safari対応：除外条件を別々にチェックする方式に変更
  var excludePatterns = excludeTokens.map(function (token) {
    return new RegExp(token.replace(/\.\*/g, '[\\s\\S]*'), 'i');
  });
  return {
    include: new RegExp(includePattern, 'i'),
    exclude: excludePatterns.length > 0 ? excludePatterns : null
  };
};

// ページ初期化処理
var init_page = function init_page() {
  // すべて読み込みボタンの自動クリック処理
  var _load_more_auto = /*#__PURE__*/function () {
    var _ref = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee() {
      var scrollX, scrollY, arr_btn;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            scrollX = window.scrollX;
            scrollY = window.scrollY;
            arr_btn = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
            if (arr_btn.length > 0) {
              arr_btn[0].click();
              setTimeout(function () {
                scrollTo(scrollX, scrollY);
                _load_more_auto();
              }, 500);
            } else {
              console.log("No more load more button");
            }
          case 1:
            return _context.a(2);
        }
      }, _callee);
    }));
    return function load_more_auto() {
      return _ref.apply(this, arguments);
    };
  }();

  // ボタンのスタイルを生成する関数
  var get_btn_style = function get_btn_style() {
    var btn = document.createElement("button");
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
  var insert_button = function insert_button() {
    // const btn_official_search = document.querySelector("button.style_search_btn__ZuOpx");
    var div_official_search = document.querySelector("div.style_search__7HKSe");
    var div_insert = document.createElement("div");
    div_insert.classList.add("div-flex");
    var div_insert2 = document.createElement("div");
    div_insert2.classList.add("div-flex");
    var btn_load_all = get_btn_style();
    btn_load_all.classList.add("btn-load-all");
    var span_load_all = document.createElement("span");
    span_load_all.classList.add("ext-ytomo");
    span_load_all.innerText = "すべて読み込み";
    btn_load_all.appendChild(span_load_all);
    var btn_filter_safe = get_btn_style();
    btn_filter_safe.classList.add("btn-filter-safe");
    var span_filter_safe = document.createElement("span");
    span_filter_safe.classList.add("ext-ytomo");
    span_filter_safe.innerText = "空きのみ";
    btn_filter_safe.appendChild(span_filter_safe);
    var btn_filter_without_load = get_btn_style();
    btn_filter_without_load.classList.add("btn-filter-without-load");
    var span_filter_without_load = document.createElement("span");
    span_filter_without_load.classList.add("ext-ytomo");
    span_filter_without_load.innerText = "絞込";
    btn_filter_without_load.appendChild(span_filter_without_load);
    var input_another_search = document.createElement("input");
    input_another_search.classList.add("ext-tomo");
    input_another_search.classList.add("search");
    input_another_search.setAttribute("type", "text");
    input_another_search.setAttribute("placeholder", "読み込みなし絞込");
    var btn_alert_to_copy = get_btn_style();
    btn_alert_to_copy.classList.add("btn-alert-to-copy");
    var span_alert_to_copy = document.createElement("span");
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
  document.addEventListener("click", function (event) {
    if (event.target.matches("button.ext-ytomo, button.ext-ytomo *")) {
      // event.preventDefault()
      // event.stopPropagation()
      var target = event.target.closest("button.ext-ytomo");
      if (target.classList.contains("btn-load-all")) {
        // すべて読み込み
        target.disabled = true;
        _load_more_auto().then(function () {
          target.disabled = false;
          target.classList.toggle("btn-done");
        });
      } else if (target.classList.contains("btn-filter-safe")) {
        // 空きあり絞り込み
        target.disabled = true;
        target.classList.toggle("btn-done");
        document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])").forEach(function (div) {
          div.classList.toggle("safe-none");
        });
        setTimeout(function () {
          target.disabled = false;
        }, 500);
      } else if (target.classList.contains("btn-filter-without-load")) {
        // 入力値で絞り込み
        target.disabled = true;
        var input_another_search = document.querySelector("input.ext-tomo.search");
        var arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC");
        var val_search = input_another_search.value;
        var dic_regex_exp = prepare_filter(val_search);
        if (val_search.length > 0) {
          arr_div_row.forEach(function (div) {
            div.classList.remove("filter-none");
            if (!((dic_regex_exp.include === null || dic_regex_exp.include.test(div.innerText)) && (dic_regex_exp.exclude === null || !dic_regex_exp.exclude.some(function (d) {
              return d.test(div.innerText);
            })))) {
              div.classList.add("filter-none");
            }
          });
        } else {
          arr_div_row.forEach(function (div) {
            div.classList.remove("filter-none");
          });
        }

        // setTimeout(() => {
        target.disabled = false;
        // }, 500)
      } else if (target.classList.contains("btn-alert-to-copy")) {
        // 一覧コピー
        target.disabled = true;
        // アラート起動
        // filter-none, ytomo-none, safe-noneを除外して表示
        var _arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC:not(.filter-none):not(.ytomo-none):not(.safe-none)");
        var arr_text = [];
        // div > button > span のテキストを取得
        _arr_div_row.forEach(function (div) {
          var span = div.querySelector("button>span");
          if (span) {
            arr_text.push(span.innerText);
          }
        });
        var text = arr_text.join("\n");
        try {
          navigator.clipboard.writeText(text);
        } catch (e) {
          alert(text);
          // console.error("ytomo extension error", e);
          // alert(e);
        }
        setTimeout(function () {
          target.disabled = false;
        }, 500);
      }
    }
  });
};

// ページ初期化可能か判定
var judge_init = function judge_init() {
  var cand_btn = document.querySelector("button.style_search_btn__ZuOpx");
  return cand_btn !== null;
};

// 入場予約ページ初期化可能か判定
var judge_entrance_init = function judge_entrance_init() {
  var target_div = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
  return target_div !== null;
};

// 入場予約ページ初期化処理
var init_entrance_page = function init_entrance_page() {
  var dependencies = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var setPageLoadingStateFn = dependencies.setPageLoadingStateFn,
    createEntranceReservationUIFn = dependencies.createEntranceReservationUIFn,
    initTimeSlotMonitoringFn = dependencies.initTimeSlotMonitoringFn,
    restoreFromCacheFn = dependencies.restoreFromCacheFn;
  insert_style();

  // 入場予約機能の設定
  var entranceReservationConfig = {
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
  if (setPageLoadingStateFn) setPageLoadingStateFn(true);

  // UIを即座に作成（読み込み状態表示のため）
  if (createEntranceReservationUIFn) createEntranceReservationUIFn(entranceReservationConfig);

  // 時間帯監視機能の初期化（動的待機）
  _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2() {
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          if (!initTimeSlotMonitoringFn) {
            _context2.n = 1;
            break;
          }
          _context2.n = 1;
          return initTimeSlotMonitoringFn();
        case 1:
          if (!restoreFromCacheFn) {
            _context2.n = 2;
            break;
          }
          _context2.n = 2;
          return restoreFromCacheFn();
        case 2:
          // 初期化完了時に読み込み状態を解除
          if (setPageLoadingStateFn) setPageLoadingStateFn(false);
        case 3:
          return _context2.a(2);
      }
    }, _callee2);
  }))();
  console.log("入場予約機能の初期化完了");
};

// 入場予約関連のヘルパー関数
function getRandomWaitTime(minTime, randomRange, config) {
  var randomSettings = config.randomSettings;
  var actualMinTime = minTime !== undefined ? minTime : randomSettings.minCheckInterval;
  var actualRandomRange = randomRange !== undefined ? randomRange : randomSettings.checkRandomRange;
  return actualMinTime + Math.floor(Math.random() * actualRandomRange);
}
function waitForElement(_x) {
  return _waitForElement.apply(this, arguments);
}
function _waitForElement() {
  _waitForElement = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(selector) {
    var timeout,
      config,
      _args3 = arguments;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          timeout = _args3.length > 1 && _args3[1] !== undefined ? _args3[1] : 5000;
          config = _args3.length > 2 ? _args3[2] : undefined;
          return _context3.a(2, new Promise(function (resolve, reject) {
            var startTime = Date.now();
            var _checkElement = function checkElement() {
              var element = document.querySelector(selector);
              if (element) {
                resolve(element);
              } else if (Date.now() - startTime > timeout) {
                reject(new Error("\u8981\u7D20\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(selector)));
              } else {
                setTimeout(_checkElement, getRandomWaitTime(config.randomSettings.minCheckInterval, config.randomSettings.checkRandomRange, config));
              }
            };
            _checkElement();
          }));
      }
    }, _callee3);
  }));
  return _waitForElement.apply(this, arguments);
}
function waitForAnyElement(_x2) {
  return _waitForAnyElement.apply(this, arguments);
}
function _waitForAnyElement() {
  _waitForAnyElement = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee4(selectors) {
    var timeout,
      selectorTexts,
      config,
      _args4 = arguments;
    return _regenerator().w(function (_context4) {
      while (1) switch (_context4.n) {
        case 0:
          timeout = _args4.length > 1 && _args4[1] !== undefined ? _args4[1] : 10000;
          selectorTexts = _args4.length > 2 && _args4[2] !== undefined ? _args4[2] : {};
          config = _args4.length > 3 ? _args4[3] : undefined;
          return _context4.a(2, new Promise(function (resolve, reject) {
            var startTime = Date.now();
            var _checkElements = function checkElements() {
              for (var _i = 0, _Object$entries = Object.entries(selectors); _i < _Object$entries.length; _i++) {
                var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
                  key = _Object$entries$_i[0],
                  selector = _Object$entries$_i[1];
                var elements = document.querySelectorAll(selector);
                var _iterator2 = _createForOfIteratorHelper(elements),
                  _step2;
                try {
                  for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                    var element = _step2.value;
                    if (selectorTexts[key]) {
                      if (element.textContent && element.textContent.includes(selectorTexts[key])) {
                        resolve({
                          key: key,
                          element: element
                        });
                        return;
                      }
                    } else {
                      if (element) {
                        resolve({
                          key: key,
                          element: element
                        });
                        return;
                      }
                    }
                  }
                } catch (err) {
                  _iterator2.e(err);
                } finally {
                  _iterator2.f();
                }
              }
              if (Date.now() - startTime > timeout) {
                reject(new Error("\u3044\u305A\u308C\u306E\u8981\u7D20\u3082\u898B\u3064\u304B\u308A\u307E\u305B\u3093: ".concat(Object.keys(selectors).join(', '))));
              } else {
                setTimeout(_checkElements, getRandomWaitTime(config.randomSettings.minCheckInterval, config.randomSettings.checkRandomRange, config));
              }
            };
            _checkElements();
          }));
      }
    }, _callee4);
  }));
  return _waitForAnyElement.apply(this, arguments);
}
function clickElement(_x3, _x4) {
  return _clickElement.apply(this, arguments);
} // エクスポート
function _clickElement() {
  _clickElement = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee5(element, config) {
    var delay;
    return _regenerator().w(function (_context5) {
      while (1) switch (_context5.n) {
        case 0:
          element.click();
          delay = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
          _context5.n = 1;
          return new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          });
        case 1:
          return _context5.a(2);
      }
    }, _callee5);
  }));
  return _clickElement.apply(this, arguments);
}


/***/ }),

/***/ 915:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CG: () => (/* binding */ entranceReservationState),
/* harmony export */   Pf: () => (/* binding */ timeSlotState),
/* harmony export */   VD: () => (/* binding */ pageLoadingState),
/* harmony export */   _t: () => (/* binding */ multiTargetManager),
/* harmony export */   ri: () => (/* binding */ calendarWatchState),
/* harmony export */   u6: () => (/* binding */ reloadCountdownState)
/* harmony export */ });
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || _unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return _arrayLikeToArray(r); }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
// ============================================================================
// 【2. 状態管理オブジェクト】
// ============================================================================

var entranceReservationState = {
  isRunning: false,
  shouldStop: false,
  startTime: null,
  attempts: 0
};

// 時間帯監視機能の状態管理
var timeSlotState = {
  mode: 'idle',
  // idle, selecting, monitoring, trying
  targetSlots: [],
  // 複数選択対象の時間帯情報配列
  monitoringInterval: null,
  // 監視用インターバル
  isMonitoring: false,
  retryCount: 0,
  maxRetries: 100,
  reloadInterval: 30000 // 30秒間隔
};

// 複数監視対象管理のヘルパー関数
var multiTargetManager = {
  // 監視対象を追加
  addTarget: function addTarget(slotInfo) {
    // 時間+位置（東西）で一意性を判定
    var existingIndex = timeSlotState.targetSlots.findIndex(function (slot) {
      return slot.timeText === slotInfo.timeText && slot.tdSelector === slotInfo.tdSelector;
    });
    if (existingIndex === -1) {
      timeSlotState.targetSlots.push(slotInfo);
      // 位置情報を含めたログ出力
      var locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
      console.log("\u2705 \u76E3\u8996\u5BFE\u8C61\u3092\u8FFD\u52A0: ".concat(slotInfo.timeText, " ").concat(locationInfo, " (\u7DCF\u6570: ").concat(timeSlotState.targetSlots.length, ")"));
      return true;
    } else {
      var _locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
      console.log("\u26A0\uFE0F \u76E3\u8996\u5BFE\u8C61\u306F\u65E2\u306B\u9078\u629E\u6E08\u307F: ".concat(slotInfo.timeText, " ").concat(_locationInfo));
      return false;
    }
  },
  // 監視対象を削除（時間+位置で特定）
  removeTarget: function removeTarget(timeText, tdSelector) {
    var initialLength = timeSlotState.targetSlots.length;
    timeSlotState.targetSlots = timeSlotState.targetSlots.filter(function (slot) {
      return !(slot.timeText === timeText && slot.tdSelector === tdSelector);
    });

    // 削除された場合の処理
    if (timeSlotState.targetSlots.length < initialLength) {
      var locationInfo = this.getLocationFromSelector(tdSelector);
      console.log("\u2705 \u76E3\u8996\u5BFE\u8C61\u3092\u524A\u9664: ".concat(timeText, " ").concat(locationInfo, " (\u6B8B\u308A: ").concat(timeSlotState.targetSlots.length, ")"));
      return true;
    }
    return false;
  },
  // 監視対象をすべてクリア
  clearAll: function clearAll() {
    var count = timeSlotState.targetSlots.length;
    timeSlotState.targetSlots = [];
    console.log("\u2705 \u3059\u3079\u3066\u306E\u76E3\u8996\u5BFE\u8C61\u3092\u30AF\u30EA\u30A2 (".concat(count, "\u500B)"));
  },
  // 監視対象が存在するかチェック
  hasTargets: function hasTargets() {
    return timeSlotState.targetSlots.length > 0;
  },
  // 特定の監視対象が選択済みかチェック（時間+位置）
  isSelected: function isSelected(timeText, tdSelector) {
    return timeSlotState.targetSlots.some(function (slot) {
      return slot.timeText === timeText && slot.tdSelector === tdSelector;
    });
  },
  // 監視対象のリストを取得
  getTargets: function getTargets() {
    return _toConsumableArray(timeSlotState.targetSlots);
  },
  // 監視対象の数を取得
  getCount: function getCount() {
    return timeSlotState.targetSlots.length;
  },
  // tdSelectorから位置情報（東西）を推定
  getLocationFromSelector: function getLocationFromSelector(tdSelector) {
    if (!tdSelector) return '不明';

    // nth-child の値から東西を推定
    // 同じ時間の場合、0番目が東、1番目が西という仕様
    var cellMatch = tdSelector.match(/td:nth-child\((\d+)\)/);
    if (cellMatch) {
      var cellIndex = parseInt(cellMatch[1]) - 1; // nth-childは1ベース
      if (cellIndex === 0) return '東';
      if (cellIndex === 1) return '西';
    }
    return '不明';
  }
};

// ページ読み込み状態管理
var pageLoadingState = {
  isLoading: false,
  startTime: null
};

// リロードカウントダウン状態管理
var reloadCountdownState = {
  countdownInterval: null,
  secondsRemaining: null,
  startTime: null,
  totalSeconds: 30
};

// カレンダー監視状態管理
var calendarWatchState = {
  observer: null,
  currentSelectedDate: null,
  isWatching: false
};

// エクスポート


// ============================================================================
// 【3. キャッシュ・永続化システム】

/***/ }),

/***/ 989:
/***/ ((module, __unused_webpack___webpack_exports__, __webpack_require__) => {

/* harmony import */ var _section1_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(702);
/* harmony import */ var _section2_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(915);
/* harmony import */ var _section3_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(644);
/* harmony import */ var _section5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(482);
/* harmony import */ var _section6_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(383);
/* harmony import */ var _section7_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(24);
/* harmony import */ var _section4_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(369);
/* module decorator */ module = __webpack_require__.hmd(module);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
// 各sectionからのimport








// 【8. ページ判定・初期化】
// ============================================================================

// cacheManagerの初期化
var cacheManager = (0,_section3_js__WEBPACK_IMPORTED_MODULE_2__/* .createCacheManager */ .K)({
  getCurrentSelectedCalendarDateFn: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY
});

// section5、section6、section7にcacheManagerを設定
(0,_section5_js__WEBPACK_IMPORTED_MODULE_3__/* .setCacheManager */ .S9)(cacheManager);
(0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .setCacheManagerForSection6 */ .MM)(cacheManager);
(0,_section7_js__WEBPACK_IMPORTED_MODULE_5__/* .setCacheManagerForSection7 */ .TP)(cacheManager);

// section6に必要な関数を注入
(0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .setEntranceReservationHelper */ .XP)(_section7_js__WEBPACK_IMPORTED_MODULE_5__/* .entranceReservationHelper */ .FX);
(0,_section6_js__WEBPACK_IMPORTED_MODULE_4__/* .setCanStartReservation */ .po)(_section7_js__WEBPACK_IMPORTED_MODULE_5__/* .canStartReservation */ .N9);

// section5.jsに外部関数を注入（showStatusは一時的に除外）
(0,_section5_js__WEBPACK_IMPORTED_MODULE_3__/* .setExternalFunctions */ .po)({
  getCurrentTableContent: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentTableContent */ .dm,
  shouldUpdateMonitorButtons: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .shouldUpdateMonitorButtons */ .iG,
  restoreSelectionAfterUpdate: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .restoreSelectionAfterUpdate */ .Il,
  // showStatus, // 内部関数のため一時的に除外
  enableAllMonitorButtons: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .enableAllMonitorButtons */ .Ak,
  updateMainButtonDisplay: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp,
  updateMonitoringTargetsDisplay: _section7_js__WEBPACK_IMPORTED_MODULE_5__/* .updateMonitoringTargetsDisplay */ .yT,
  disableAllMonitorButtons: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .disableAllMonitorButtons */ .PT,
  selectTimeSlotAndStartReservation: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .selectTimeSlotAndStartReservation */ .rG,
  startReloadCountdown: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .startReloadCountdown */ .PH,
  reloadCountdownState: _section2_js__WEBPACK_IMPORTED_MODULE_1__/* .reloadCountdownState */ .u6,
  resetMonitoringUI: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .resetMonitoringUI */ .oH,
  showErrorMessage: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .showErrorMessage */ .f1,
  tryClickCalendarForTimeSlot: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .tryClickCalendarForTimeSlot */ .oy
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
      if ((0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .judge_init */ .v8)()) {
        clearInterval(interval_judge);
        (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .init_page */ .Xs)();
        console.log("ytomo extension loaded (pavilion reservation)");
      }
    }, 500);
  } else if (page_type === "entrance_reservation") {
    var _interval_judge = setInterval(function () {
      if ((0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .judge_entrance_init */ .Q2)()) {
        clearInterval(_interval_judge);
        (0,_section1_js__WEBPACK_IMPORTED_MODULE_0__/* .init_entrance_page */ .ig)({
          setPageLoadingStateFn: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .setPageLoadingState */ .ZK,
          createEntranceReservationUIFn: _section7_js__WEBPACK_IMPORTED_MODULE_5__/* .createEntranceReservationUI */ .DT,
          initTimeSlotMonitoringFn: _section4_js__WEBPACK_IMPORTED_MODULE_6__/* .initTimeSlotMonitoring */ .Yz,
          restoreFromCacheFn: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .restoreFromCache */ .Zu
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
    createEntranceReservationUI: _section7_js__WEBPACK_IMPORTED_MODULE_5__/* .createEntranceReservationUI */ .DT,
    updateMainButtonDisplay: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .updateMainButtonDisplay */ .vp,
    updateMonitoringTargetsDisplay: _section7_js__WEBPACK_IMPORTED_MODULE_5__/* .updateMonitoringTargetsDisplay */ .yT,
    // カレンダー監視機能
    startCalendarWatcher: startCalendarWatcher,
    handleCalendarChange: handleCalendarChange,
    getCurrentSelectedCalendarDate: _section6_js__WEBPACK_IMPORTED_MODULE_4__/* .getCurrentSelectedCalendarDate */ .rY,
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
    init_page: _section1_js__WEBPACK_IMPORTED_MODULE_0__/* .init_page */ .Xs,
    init_entrance_page: _section1_js__WEBPACK_IMPORTED_MODULE_0__/* .init_entrance_page */ .ig,
    identify_page_type: identify_page_type,
    trigger_init: trigger_init,
    // Unit Test用追加関数 (Phase 1)
    extractTimeSlotInfo: extractTimeSlotInfo,
    getMonitorButtonText: getMonitorButtonText,
    getCurrentMode: getCurrentMode,
    getRandomWaitTime: getRandomWaitTime,
    generateSelectorForElement: generateSelectorForElement
  }, "generateUniqueTdSelector", generateUniqueTdSelector), "getTdPositionInfo", getTdPositionInfo), "findSameTdElement", findSameTdElement), "extractTdStatus", extractTdStatus), "checkTimeSlotTableExistsSync", checkTimeSlotTableExistsSync), "validatePageLoaded", validatePageLoaded), "canStartReservation", _section7_js__WEBPACK_IMPORTED_MODULE_5__/* .canStartReservation */ .N9), "isInterruptionAllowed", isInterruptionAllowed), "checkTimeSlotSelected", checkTimeSlotSelected), "checkVisitTimeButtonState", checkVisitTimeButtonState);
}

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
/* harmony import */ var _section2_js__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(915);
/* harmony import */ var _section3_js__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(644);
/* harmony import */ var _section4_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(369);
/* harmony import */ var _section5_js__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(482);
/* harmony import */ var _section6_js__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(383);
/* harmony import */ var _section7_js__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(24);
/* harmony import */ var _section8_js__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(989);
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