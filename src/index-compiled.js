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

/***/ 618:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  entranceReservationHelper: () => (/* binding */ entranceReservationHelper),
  init_entrance_page: () => (/* binding */ init_entrance_page),
  judge_entrance_init: () => (/* binding */ judge_entrance_init),
  trigger_init: () => (/* binding */ trigger_init)
});

;// ./src-modules/core/utils.js
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
/**
 * コアユーティリティモジュール
 * 基本機能・ユーティリティ関数を提供
 */

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
var utils_prepare_filter = function prepare_filter(val_search) {
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
  _waitForElement = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee(selector) {
    var timeout,
      config,
      _args = arguments;
    return _regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          timeout = _args.length > 1 && _args[1] !== undefined ? _args[1] : 5000;
          config = _args.length > 2 ? _args[2] : undefined;
          return _context.a(2, new Promise(function (resolve, reject) {
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
    }, _callee);
  }));
  return _waitForElement.apply(this, arguments);
}
function waitForAnyElement(_x2) {
  return _waitForAnyElement.apply(this, arguments);
}
function _waitForAnyElement() {
  _waitForAnyElement = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee2(selectors) {
    var timeout,
      selectorTexts,
      config,
      _args2 = arguments;
    return _regenerator().w(function (_context2) {
      while (1) switch (_context2.n) {
        case 0:
          timeout = _args2.length > 1 && _args2[1] !== undefined ? _args2[1] : 10000;
          selectorTexts = _args2.length > 2 && _args2[2] !== undefined ? _args2[2] : {};
          config = _args2.length > 3 ? _args2[3] : undefined;
          return _context2.a(2, new Promise(function (resolve, reject) {
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
    }, _callee2);
  }));
  return _waitForAnyElement.apply(this, arguments);
}
function clickElement(_x3, _x4) {
  return _clickElement.apply(this, arguments);
}

// URL判定とページタイプ識別
function _clickElement() {
  _clickElement = _asyncToGenerator(/*#__PURE__*/_regenerator().m(function _callee3(element, config) {
    var delay;
    return _regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          element.click();
          delay = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
          _context3.n = 1;
          return new Promise(function (resolve) {
            return setTimeout(resolve, delay);
          });
        case 1:
          return _context3.a(2);
      }
    }, _callee3);
  }));
  return _clickElement.apply(this, arguments);
}
var identify_page_type = function identify_page_type(url) {
  if (url.includes("ticket.expo2025.or.jp/event_search/")) {
    return "pavilion";
  } else if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
    return "entrance";
  } else {
    return null;
  }
};

// Unit Test用追加の純粋関数
function utils_extractTimeSlotInfo(text) {
  if (!text || typeof text !== 'string') {
    return null;
  }
  var match = text.match(/(\d{1,2}:\d{2})～(\d{1,2}:\d{2})/);
  if (match) {
    return {
      startTime: match[1],
      endTime: match[2],
      fullText: match[0]
    };
  }
  return null;
}
function utils_generateSelectorForElement(element) {
  if (!element) {
    throw new Error('要素が指定されていません');
  }
  var selector = element.tagName.toLowerCase();
  if (element.id) {
    selector += "#".concat(element.id);
  }
  if (element.className) {
    var classes = element.className.split(' ').filter(function (cls) {
      return cls.trim();
    });
    if (classes.length > 0) {
      selector += '.' + classes.join('.');
    }
  }
  return selector;
}
;// ./src-modules/state/manager.js
function _toConsumableArray(r) { return _arrayWithoutHoles(r) || _iterableToArray(r) || manager_unsupportedIterableToArray(r) || _nonIterableSpread(); }
function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function manager_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return manager_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? manager_arrayLikeToArray(r, a) : void 0; } }
function _iterableToArray(r) { if ("undefined" != typeof Symbol && null != r[Symbol.iterator] || null != r["@@iterator"]) return Array.from(r); }
function _arrayWithoutHoles(r) { if (Array.isArray(r)) return manager_arrayLikeToArray(r); }
function manager_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * 状態管理オブジェクトモジュール
 * アプリケーション全体の状態管理を提供
 */

// 入場予約実行状態
var manager_entranceReservationState = {
  isRunning: false,
  shouldStop: false,
  startTime: null,
  attempts: 0
};

// 時間帯監視機能の状態管理
var manager_timeSlotState = {
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
var manager_multiTargetManager = {
  // 監視対象を追加
  addTarget: function addTarget(slotInfo) {
    // 時間+位置（東西）で一意性を判定
    var existingIndex = manager_timeSlotState.targetSlots.findIndex(function (slot) {
      return slot.timeText === slotInfo.timeText && slot.tdSelector === slotInfo.tdSelector;
    });
    if (existingIndex === -1) {
      manager_timeSlotState.targetSlots.push(slotInfo);
      // 位置情報を含めたログ出力
      var locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
      console.log("\u2705 \u76E3\u8996\u5BFE\u8C61\u3092\u8FFD\u52A0: ".concat(slotInfo.timeText, " ").concat(locationInfo, " (\u7DCF\u6570: ").concat(manager_timeSlotState.targetSlots.length, ")"));
      return true;
    } else {
      var _locationInfo = this.getLocationFromSelector(slotInfo.tdSelector);
      console.log("\u26A0\uFE0F \u76E3\u8996\u5BFE\u8C61\u306F\u65E2\u306B\u9078\u629E\u6E08\u307F: ".concat(slotInfo.timeText, " ").concat(_locationInfo));
      return false;
    }
  },
  // 監視対象を削除（時間+位置で特定）
  removeTarget: function removeTarget(timeText, tdSelector) {
    var initialLength = manager_timeSlotState.targetSlots.length;
    manager_timeSlotState.targetSlots = manager_timeSlotState.targetSlots.filter(function (slot) {
      return !(slot.timeText === timeText && slot.tdSelector === tdSelector);
    });

    // 削除された場合の処理
    if (manager_timeSlotState.targetSlots.length < initialLength) {
      var locationInfo = this.getLocationFromSelector(tdSelector);
      console.log("\u2705 \u76E3\u8996\u5BFE\u8C61\u3092\u524A\u9664: ".concat(timeText, " ").concat(locationInfo, " (\u6B8B\u308A: ").concat(manager_timeSlotState.targetSlots.length, ")"));
      return true;
    }
    return false;
  },
  // 監視対象をすべてクリア
  clearAll: function clearAll() {
    var count = manager_timeSlotState.targetSlots.length;
    manager_timeSlotState.targetSlots = [];
    console.log("\u2705 \u3059\u3079\u3066\u306E\u76E3\u8996\u5BFE\u8C61\u3092\u30AF\u30EA\u30A2 (".concat(count, "\u500B)"));
  },
  // 監視対象が存在するかチェック
  hasTargets: function hasTargets() {
    return manager_timeSlotState.targetSlots.length > 0;
  },
  // 特定の監視対象が選択済みかチェック（時間+位置）
  isSelected: function isSelected(timeText, tdSelector) {
    return manager_timeSlotState.targetSlots.some(function (slot) {
      return slot.timeText === timeText && slot.tdSelector === tdSelector;
    });
  },
  // 監視対象のリストを取得
  getTargets: function getTargets() {
    return _toConsumableArray(manager_timeSlotState.targetSlots);
  },
  // 監視対象の数を取得
  getCount: function getCount() {
    return manager_timeSlotState.targetSlots.length;
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
var manager_calendarWatchState = {
  observer: null,
  currentSelectedDate: null,
  isWatching: false
};

// 状態操作用ヘルパー関数
function manager_setPageLoadingState(isLoading) {
  pageLoadingState.isLoading = isLoading;
  pageLoadingState.startTime = isLoading ? Date.now() : null;
}
function manager_getCurrentMode() {
  if (manager_timeSlotState.isMonitoring) return 'monitoring';
  if (manager_timeSlotState.mode === 'trying') return 'trying';
  if (manager_multiTargetManager.hasTargets()) return 'targets-selected';
  return 'idle';
}
;// ./src-modules/pavilion/search.js
function search_regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return search_regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (search_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, search_regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, search_regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), search_regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", search_regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), search_regeneratorDefine2(u), search_regeneratorDefine2(u, o, "Generator"), search_regeneratorDefine2(u, n, function () { return this; }), search_regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (search_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function search_regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } search_regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { search_regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, search_regeneratorDefine2(e, r, n, t); }
function search_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function search_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { search_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { search_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * パビリオン検索機能モジュール
 * パビリオン予約サイトでの検索・フィルタリング機能を提供
 */



// ページ初期化処理
var init_page = function init_page() {
  // すべて読み込みボタンの自動クリック処理
  var _load_more_auto = /*#__PURE__*/function () {
    var _ref = search_asyncToGenerator(/*#__PURE__*/search_regenerator().m(function _callee() {
      var scrollX, scrollY, arr_btn;
      return search_regenerator().w(function (_context) {
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
        var dic_regex_exp = utils_prepare_filter(val_search);
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
;// ./src-modules/dom/selectors.js
function selectors_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = selectors_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function selectors_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return selectors_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? selectors_arrayLikeToArray(r, a) : void 0; } }
function selectors_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function selectors_regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return selectors_regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (selectors_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, selectors_regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, selectors_regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), selectors_regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", selectors_regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), selectors_regeneratorDefine2(u), selectors_regeneratorDefine2(u, o, "Generator"), selectors_regeneratorDefine2(u, n, function () { return this; }), selectors_regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (selectors_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function selectors_regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } selectors_regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { selectors_regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, selectors_regeneratorDefine2(e, r, n, t); }
function selectors_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function selectors_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { selectors_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { selectors_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * DOM要素セレクタ・検索モジュール
 * DOM操作・セレクタ・要素検索機能を提供
 */

// 時間帯セレクタ定義（設計書の固定DOM構造に基づく）
var selectors_timeSlotSelectors = {
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
function selectors_generateUniqueTdSelector(tdElement) {
  // td要素の親要素（tr）内での位置を取得
  var row = tdElement.parentElement;
  var rowIndex = Array.from(row.parentElement.children).indexOf(row);
  var cellIndex = Array.from(row.children).indexOf(tdElement);

  // 設計書に基づく固定DOM構造での一意セレクタ
  return "table tr:nth-child(".concat(rowIndex + 1, ") td:nth-child(").concat(cellIndex + 1, ")[data-gray-out]");
}
function selectors_getTdPositionInfo(tdElement) {
  var row = tdElement.parentElement;
  var rowIndex = Array.from(row.parentElement.children).indexOf(row);
  var cellIndex = Array.from(row.children).indexOf(tdElement);
  return {
    rowIndex: rowIndex,
    cellIndex: cellIndex
  };
}
function selectors_findSameTdElement(targetInfo) {
  // 1. セレクタベースでの検索を優先
  if (targetInfo.tdSelector) {
    var element = document.querySelector(targetInfo.tdSelector);
    if (element) {
      return element;
    }
  }

  // 2. フォールバック: 位置情報による検索
  if (targetInfo.positionInfo && targetInfo.positionInfo.rowIndex !== undefined && targetInfo.positionInfo.cellIndex !== undefined) {
    var table = document.querySelector(selectors_timeSlotSelectors.timeSlotContainer);
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
function selectors_extractTdStatus(tdElement) {
  if (!tdElement) return null;
  var buttonDiv = tdElement.querySelector('div[role="button"]');
  if (!buttonDiv) return null;
  var timeSpan = buttonDiv.querySelector('dt span');
  var timeText = timeSpan ? timeSpan.textContent.trim() : '';

  // 満員判定
  var isDisabled = buttonDiv.hasAttribute('data-disabled') && buttonDiv.getAttribute('data-disabled') === 'true';
  var hasFullIcon = buttonDiv.querySelector(selectors_timeSlotSelectors.fullIcon);
  var isFull = isDisabled && hasFullIcon;

  // 利用可能判定
  var hasLowIcon = buttonDiv.querySelector(selectors_timeSlotSelectors.lowIcon);
  var hasHighIcon = buttonDiv.querySelector(selectors_timeSlotSelectors.highIcon);
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
}

// カレンダーの動的待機
function _initTimeSlotMonitoring() {
  _initTimeSlotMonitoring = selectors_asyncToGenerator(/*#__PURE__*/selectors_regenerator().m(function _callee() {
    var hasCalendar;
    return selectors_regenerator().w(function (_context) {
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
          // Note: startTimeSlotTableObserverは monitor/timeSlot.js で定義される
          if (typeof startTimeSlotTableObserver === 'function') {
            startTimeSlotTableObserver();
          }
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
}
function _waitForCalendar() {
  _waitForCalendar = selectors_asyncToGenerator(/*#__PURE__*/selectors_regenerator().m(function _callee2() {
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
    return selectors_regenerator().w(function (_context2) {
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
          _iterator = selectors_createForOfIteratorHelper(tables);
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
;// ./src-modules/cache/manager.js
/**
 * キャッシュ・永続化システムモジュール
 * localStorage基盤のキャッシュ管理機能を提供
 */



// キャッシュ管理機能
var manager_cacheManager = {
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
      var targets = manager_multiTargetManager.getTargets();
      if (targets.length === 0) return;

      // 現在選択されているカレンダー日付を取得
      // Note: 実際の実装ではcalendar/watcherからimportする必要がある
      var selectedCalendarDate = this.getCurrentSelectedCalendarDate();
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
        retryCount: manager_timeSlotState.retryCount || 0
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
  },
  // getCurrentSelectedCalendarDateの参照を解決するための一時的な実装
  // 実際の実装では calendar/watcher から import する
  getCurrentSelectedCalendarDate: function getCurrentSelectedCalendarDate() {
    try {
      var selectedButton = document.querySelector('button[aria-pressed="true"]');
      if (selectedButton) {
        var timeElement = selectedButton.querySelector('time');
        if (timeElement && timeElement.getAttribute('datetime')) {
          return timeElement.getAttribute('datetime');
        }
      }
      return null;
    } catch (error) {
      console.error('getCurrentSelectedCalendarDate error:', error);
      return null;
    }
  }
};
;// ./src-modules/ui/fab.js
function fab_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = fab_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function fab_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return fab_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? fab_arrayLikeToArray(r, a) : void 0; } }
function fab_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * FAB・メインUIモジュール
 * 右下固定FABボタンと監視対象表示UI機能を提供
 */



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
  monitoringTargetsDisplay.style.cssText = "\n        background: linear-gradient(135deg, rgba(0, 104, 33, 0.95), rgba(0, 150, 50, 0.95)) !important;\n        color: white !important;\n        padding: 8px 12px !important;\n        border-radius: 12px !important;\n        font-size: 12px !important;\n        font-weight: bold !important;\n        text-align: center !important;\n        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;\n        border: 2px solid rgba(255, 255, 255, 0.3) !important;\n        min-width: 120px !important;\n        max-width: 200px !important;\n        display: none !important;\n        white-space: pre-line !important;\n        overflow: visible !important;\n        pointer-events: auto !important;\n    ";

  // リロードカウントダウン表示
  var countdownDisplay = document.createElement('div');
  countdownDisplay.id = 'ytomo-countdown';
  countdownDisplay.style.cssText = "\n        background: rgba(255, 165, 0, 0.9) !important;\n        color: white !important;\n        padding: 6px 10px !important;\n        border-radius: 8px !important;\n        font-size: 11px !important;\n        font-weight: bold !important;\n        text-align: center !important;\n        display: none !important;\n        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2) !important;\n        pointer-events: auto !important;\n    ";

  // UIコンポーネントを組み立て
  fabContainer.appendChild(countdownDisplay);
  fabContainer.appendChild(monitoringTargetsDisplay);
  fabContainer.appendChild(fabButton);

  // ページに追加
  document.body.appendChild(fabContainer);
  console.log('✅ 入場予約FAB UIを作成しました');
  return fabContainer;
}

// 監視対象表示の更新
function fab_updateMonitoringTargetsDisplay() {
  var targetsDisplay = document.getElementById('ytomo-monitoring-targets');
  if (!targetsDisplay) return;
  var targets = multiTargetManager.getTargets();
  if (targets.length === 0) {
    targetsDisplay.style.display = 'none';
    return;
  }

  // 監視対象を表示形式に変換
  var displayTexts = targets.map(function (target) {
    var locationInfo = multiTargetManager.getLocationFromSelector(target.tdSelector);
    return "".concat(target.timeText, " ").concat(locationInfo);
  });
  targetsDisplay.innerHTML = "\n        <div style=\"margin-bottom: 4px;\">\u76E3\u8996\u5BFE\u8C61: ".concat(targets.length, "\u500B</div>\n        <div style=\"font-size: 10px; opacity: 0.9;\">").concat(displayTexts.join('\n'), "</div>\n    ");
  targetsDisplay.style.display = 'block';
  console.log("\u76E3\u8996\u5BFE\u8C61\u8868\u793A\u3092\u66F4\u65B0: ".concat(targets.length, "\u500B"));
}

// メインボタン表示更新
function fab_updateMainButtonDisplay(mode) {
  var fabButton = document.getElementById('ytomo-main-fab');
  if (!fabButton) return;
  var span = fabButton.querySelector('span');
  if (!span) return;

  // ボタンの有効/無効状態を更新
  fabButton.disabled = false;
  fabButton.style.opacity = '0.9';
  fabButton.style.cursor = 'pointer';
  switch (mode) {
    case 'idle':
      span.textContent = '入場予約補助';
      fabButton.style.background = 'rgb(0, 104, 33)';
      break;
    case 'monitoring':
      span.textContent = '監視中...';
      fabButton.style.background = 'rgb(255, 165, 0)';
      break;
    case 'trying':
      span.textContent = '予約中...';
      fabButton.style.background = 'rgb(255, 0, 0)';
      break;
    case 'targets-selected':
      var count = multiTargetManager.getCount();
      span.textContent = "\u76E3\u8996\u5BFE\u8C61: ".concat(count, "\u500B");
      fabButton.style.background = 'rgb(0, 150, 0)';
      break;
    default:
      span.textContent = '入場予約補助';
      fabButton.style.background = 'rgb(0, 104, 33)';
  }
  console.log("\u30E1\u30A4\u30F3\u30DC\u30BF\u30F3\u8868\u793A\u3092\u66F4\u65B0: ".concat(mode));
}

// 来場日時ボタン状態確認
function fab_checkVisitTimeButtonState() {
  try {
    var _visitTimeButton$text;
    // 来場日時ボタンを検索
    var visitTimeButtons = document.querySelectorAll('button, div[role="button"]');
    var visitTimeButton = null;
    var _iterator = fab_createForOfIteratorHelper(visitTimeButtons),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var _btn$textContent;
        var btn = _step.value;
        var text = (_btn$textContent = btn.textContent) === null || _btn$textContent === void 0 ? void 0 : _btn$textContent.trim();
        if (text && text.includes('来場日時') && text.includes('選択')) {
          visitTimeButton = btn;
          break;
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    if (!visitTimeButton) {
      console.log('⚠️ 来場日時ボタンが見つかりません');
      return {
        exists: false,
        clickable: false
      };
    }

    // ボタンがクリック可能かチェック
    var isDisabled = visitTimeButton.disabled || visitTimeButton.getAttribute('disabled') === 'true' || visitTimeButton.getAttribute('aria-disabled') === 'true';
    var isClickable = !isDisabled;
    console.log("\u6765\u5834\u65E5\u6642\u30DC\u30BF\u30F3\u72B6\u614B: \u5B58\u5728=".concat(true, ", \u30AF\u30EA\u30C3\u30AF\u53EF\u80FD=", isClickable));
    return {
      exists: true,
      clickable: isClickable,
      element: visitTimeButton,
      text: (_visitTimeButton$text = visitTimeButton.textContent) === null || _visitTimeButton$text === void 0 ? void 0 : _visitTimeButton$text.trim()
    };
  } catch (error) {
    console.error('❌ 来場日時ボタン状態確認エラー:', error);
    return {
      exists: false,
      clickable: false
    };
  }
}

// リロードカウントダウン表示開始
function startReloadCountdown() {
  var seconds = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 30;
  var countdownDisplay = document.getElementById('ytomo-countdown');
  if (!countdownDisplay) return;
  var remainingSeconds = seconds;
  countdownDisplay.style.display = 'block';
  var interval = setInterval(function () {
    countdownDisplay.textContent = "\u30EA\u30ED\u30FC\u30C9: ".concat(remainingSeconds, "\u79D2");
    remainingSeconds--;
    if (remainingSeconds < 0) {
      clearInterval(interval);
      countdownDisplay.style.display = 'none';
    }
  }, 1000);

  // 初回表示
  countdownDisplay.textContent = "\u30EA\u30ED\u30FC\u30C9: ".concat(remainingSeconds, "\u79D2");
  return interval;
}

// エラー表示
function showErrorMessage(message) {
  var errorDiv = document.createElement('div');
  errorDiv.style.cssText = "\n        position: fixed !important;\n        top: 50% !important;\n        left: 50% !important;\n        transform: translate(-50%, -50%) !important;\n        background: rgba(255, 0, 0, 0.9) !important;\n        color: white !important;\n        padding: 20px !important;\n        border-radius: 8px !important;\n        font-size: 14px !important;\n        font-weight: bold !important;\n        text-align: center !important;\n        z-index: 20000 !important;\n        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5) !important;\n        max-width: 300px !important;\n    ";
  errorDiv.textContent = message;
  document.body.appendChild(errorDiv);

  // 5秒後に自動削除
  setTimeout(function () {
    errorDiv.remove();
  }, 5000);
}

// 入場予約実行判定
function fab_canStartReservation() {
  // 監視対象が存在するかチェック
  if (!multiTargetManager.hasTargets()) {
    console.log('❌ 監視対象が設定されていません');
    return false;
  }

  // すでに実行中でないかチェック
  if (entranceReservationState.isRunning) {
    console.log('❌ 既に入場予約が実行中です');
    return false;
  }

  // 監視中でないかチェック
  if (timeSlotState.isMonitoring) {
    console.log('❌ 時間帯監視が実行中です');
    return false;
  }
  console.log('✅ 入場予約実行可能');
  return true;
}

// 中断許可判定
function fab_isInterruptionAllowed() {
  return entranceReservationState.isRunning || timeSlotState.isMonitoring;
}

// Unit Test用のテキスト取得関数
function fab_getMonitorButtonText(timeText, status) {
  if (status === 'available') {
    return '空きあり';
  } else if (status === 'full') {
    return '監視';
  } else {
    return '監視';
  }
}
;// ./src-modules/calendar/watcher.js
function watcher_regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return watcher_regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (watcher_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, watcher_regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, watcher_regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), watcher_regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", watcher_regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), watcher_regeneratorDefine2(u), watcher_regeneratorDefine2(u, o, "Generator"), watcher_regeneratorDefine2(u, n, function () { return this; }), watcher_regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (watcher_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function watcher_regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } watcher_regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { watcher_regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, watcher_regeneratorDefine2(e, r, n, t); }
function watcher_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function watcher_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { watcher_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { watcher_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function watcher_createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = watcher_unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function watcher_unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return watcher_arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? watcher_arrayLikeToArray(r, a) : void 0; } }
function watcher_arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
/**
 * カレンダー監視・変更検出モジュール
 * カレンダー操作、日付変更監視、UI状態管理機能を提供
 */




// 現在選択されているカレンダー日付を取得
function watcher_getCurrentSelectedCalendarDate() {
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
    var _iterator = watcher_createForOfIteratorHelper(anySelected),
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

// カレンダー変更監視を開始
function _clickCalendarDate() {
  _clickCalendarDate = watcher_asyncToGenerator(/*#__PURE__*/watcher_regenerator().m(function _callee(targetDate) {
    var timeElement, allCalendarElements, targetElement, clickEvent, newSelectedDate, _t;
    return watcher_regenerator().w(function (_context) {
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

          // クリック結果を待機（時間帯テーブル表示まで）
          _context.n = 5;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 1500);
          });
        case 5:
          // 実際に日付が変更されたか確認
          newSelectedDate = watcher_getCurrentSelectedCalendarDate();
          if (!(newSelectedDate === targetDate)) {
            _context.n = 6;
            break;
          }
          console.log("\u2705 \u30AB\u30EC\u30F3\u30C0\u30FC\u65E5\u4ED8\u306E\u5909\u66F4\u304C\u6210\u529F: ".concat(targetDate));
          return _context.a(2, true);
        case 6:
          console.log("\u274C \u30AB\u30EC\u30F3\u30C0\u30FC\u65E5\u4ED8\u306E\u5909\u66F4\u304C\u5931\u6557: \u671F\u5F85=".concat(targetDate, ", \u5B9F\u969B=").concat(newSelectedDate));
          return _context.a(2, false);
        case 7:
          _context.n = 9;
          break;
        case 8:
          _context.p = 8;
          _t = _context.v;
          console.error('❌ カレンダークリックエラー:', _t);
          return _context.a(2, false);
        case 9:
          return _context.a(2);
      }
    }, _callee, null, [[1, 8]]);
  }));
  return _clickCalendarDate.apply(this, arguments);
}
function watcher_startCalendarWatcher() {
  console.log('📅 カレンダー変更監視を開始');

  // 既存の監視を停止
  if (calendarWatchState.observer) {
    calendarWatchState.observer.disconnect();
    console.log('既存のカレンダー監視を停止');
  }

  // 現在の選択日付を記録
  calendarWatchState.currentSelectedDate = watcher_getCurrentSelectedCalendarDate();
  console.log("\u521D\u671F\u9078\u629E\u65E5\u4ED8: ".concat(calendarWatchState.currentSelectedDate));

  // MutationObserverでカレンダー変更を監視
  calendarWatchState.observer = new MutationObserver(function (mutations) {
    var hasCalendarChange = false;
    mutations.forEach(function (mutation) {
      if (mutation.type === 'attributes' && mutation.attributeName === 'aria-pressed') {
        var target = mutation.target;
        if (target.getAttribute('role') === 'button' && target.querySelector('time[datetime]')) {
          hasCalendarChange = true;
          console.log("\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u5C5E\u6027\u5909\u66F4\u3092\u691C\u51FA: aria-pressed=".concat(target.getAttribute('aria-pressed')));
        }
      }
    });
    if (hasCalendarChange) {
      // デバウンス処理
      clearTimeout(window.calendarChangeTimeout);
      window.calendarChangeTimeout = setTimeout(function () {
        watcher_handleCalendarChange();
      }, 500);
    }
  });

  // カレンダー要素を監視対象に設定
  var calendarArea = document.querySelector('[class*="calendar"], table:has(time[datetime]), [role="button"]:has(time[datetime])');
  if (calendarArea) {
    calendarWatchState.observer.observe(calendarArea.closest('div') || document.body, {
      attributes: true,
      attributeFilter: ['aria-pressed'],
      subtree: true
    });
    calendarWatchState.isWatching = true;
    console.log('✅ カレンダー監視を開始しました');
  } else {
    console.log('⚠️ カレンダー要素が見つかりません');
  }
}

// カレンダー変更処理
function watcher_handleCalendarChange() {
  var newSelectedDate = watcher_getCurrentSelectedCalendarDate();
  var oldSelectedDate = calendarWatchState.currentSelectedDate;
  if (newSelectedDate !== oldSelectedDate) {
    console.log("\uD83D\uDCC5 \u30AB\u30EC\u30F3\u30C0\u30FC\u65E5\u4ED8\u5909\u66F4\u3092\u691C\u51FA: ".concat(oldSelectedDate, " \u2192 ").concat(newSelectedDate));

    // 日付変更時の処理
    if (multiTargetManager.hasTargets()) {
      console.log('📋 監視対象があるため、状態をクリアします');

      // キャッシュをクリア
      cacheManager.clearTargetSlots();

      // 監視対象をクリア
      multiTargetManager.clearAll();

      // UI状態をリセット
      if (typeof resetMonitoringUI === 'function') {
        resetMonitoringUI();
      }
      if (typeof watcher_updateMainButtonDisplay === 'function') {
        watcher_updateMainButtonDisplay('idle');
      }
      console.log('✅ 日付変更に伴う状態クリア完了');
    }

    // 現在の日付を更新
    calendarWatchState.currentSelectedDate = newSelectedDate;

    // ページローディング状態を設定
    setPageLoadingState(true);

    // 時間帯テーブルの再読み込み完了を待機
    setTimeout(function () {
      setPageLoadingState(false);
      console.log('📅 カレンダー変更処理完了');
    }, 2000);
  }
}

// 監視UI状態リセット
function resetMonitoringUI() {
  console.log('🔄 監視UI状態をリセット');

  // 監視ボタンを削除
  var monitorButtons = document.querySelectorAll('.monitor-btn');
  monitorButtons.forEach(function (btn) {
    return btn.remove();
  });
  console.log("\u524A\u9664\u3057\u305F\u76E3\u8996\u30DC\u30BF\u30F3\u6570: ".concat(monitorButtons.length));

  // 選択状態をクリア
  var selectedElements = document.querySelectorAll('[aria-pressed="true"]:not([role="button"]:has(time[datetime]))');
  selectedElements.forEach(function (el) {
    if (!el.querySelector('time[datetime]')) {
      el.setAttribute('aria-pressed', 'false');
    }
  });
}

// メインボタン表示更新
function watcher_updateMainButtonDisplay(mode) {
  console.log("\uD83D\uDD04 \u30E1\u30A4\u30F3\u30DC\u30BF\u30F3\u8868\u793A\u3092\u66F4\u65B0: ".concat(mode));
  var fabButton = document.querySelector('#ytomo-fab-button');
  if (!fabButton) return;
  var span = fabButton.querySelector('span');
  if (!span) return;
  switch (mode) {
    case 'idle':
      span.textContent = '入場予約補助';
      fabButton.style.background = 'rgb(0, 104, 33)';
      break;
    case 'monitoring':
      span.textContent = '監視中...';
      fabButton.style.background = 'rgb(255, 165, 0)';
      break;
    case 'trying':
      span.textContent = '予約中...';
      fabButton.style.background = 'rgb(255, 0, 0)';
      break;
    case 'targets-selected':
      var count = multiTargetManager.getCount();
      span.textContent = "\u76E3\u8996\u5BFE\u8C61: ".concat(count, "\u500B");
      fabButton.style.background = 'rgb(0, 150, 0)';
      break;
    default:
      span.textContent = '入場予約補助';
      fabButton.style.background = 'rgb(0, 104, 33)';
  }
}

// キャッシュからの状態復元
function restoreFromCache() {
  return _restoreFromCache.apply(this, arguments);
}

// ヘルパー関数（他のモジュールで定義される関数の一時的な実装）
function _restoreFromCache() {
  _restoreFromCache = watcher_asyncToGenerator(/*#__PURE__*/watcher_regenerator().m(function _callee2() {
    var hasTable, cachedData, currentDate, restoredCount, _iterator2, _step2, target, added, _t2;
    return watcher_regenerator().w(function (_context2) {
      while (1) switch (_context2.p = _context2.n) {
        case 0:
          console.log('📖 キャッシュからの状態復元を開始');
          _context2.p = 1;
          _context2.n = 2;
          return waitForTimeSlotTable(5000);
        case 2:
          hasTable = _context2.v;
          if (hasTable) {
            _context2.n = 3;
            break;
          }
          console.log('⚠️ 時間帯テーブルが見つからないため、復元をスキップします');
          return _context2.a(2);
        case 3:
          // キャッシュデータを読み込み
          cachedData = manager_cacheManager.loadTargetSlots();
          if (!(!cachedData || !cachedData.targets || cachedData.targets.length === 0)) {
            _context2.n = 4;
            break;
          }
          console.log('📖 復元するキャッシュデータがありません');
          return _context2.a(2);
        case 4:
          console.log("\uD83D\uDCD6 ".concat(cachedData.targets.length, "\u500B\u306E\u76E3\u8996\u5BFE\u8C61\u3092\u5FA9\u5143\u3057\u307E\u3059"));

          // カレンダー日付が一致するかチェック
          currentDate = watcher_getCurrentSelectedCalendarDate();
          if (!(cachedData.selectedDate && cachedData.selectedDate !== currentDate)) {
            _context2.n = 5;
            break;
          }
          console.log("\uD83D\uDCC5 \u65E5\u4ED8\u4E0D\u4E00\u81F4\u306E\u305F\u3081\u5FA9\u5143\u3092\u30B9\u30AD\u30C3\u30D7: \u30AD\u30E3\u30C3\u30B7\u30E5=".concat(cachedData.selectedDate, ", \u73FE\u5728=").concat(currentDate));
          manager_cacheManager.clearTargetSlots();
          return _context2.a(2);
        case 5:
          // 監視対象を復元
          restoredCount = 0;
          _iterator2 = watcher_createForOfIteratorHelper(cachedData.targets);
          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              target = _step2.value;
              added = manager_multiTargetManager.addTarget(target);
              if (added) {
                restoredCount++;
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
          console.log("\u2705 ".concat(restoredCount, "\u500B\u306E\u76E3\u8996\u5BFE\u8C61\u3092\u5FA9\u5143\u3057\u307E\u3057\u305F"));
          _context2.n = 7;
          break;
        case 6:
          _context2.p = 6;
          _t2 = _context2.v;
          console.error('❌ キャッシュ復元エラー:', _t2);
        case 7:
          return _context2.a(2);
      }
    }, _callee2, null, [[1, 6]]);
  }));
  return _restoreFromCache.apply(this, arguments);
}
function waitForTimeSlotTable() {
  return _waitForTimeSlotTable.apply(this, arguments);
}
function _waitForTimeSlotTable() {
  _waitForTimeSlotTable = watcher_asyncToGenerator(/*#__PURE__*/watcher_regenerator().m(function _callee3() {
    var timeout,
      startTime,
      table,
      _args3 = arguments;
    return watcher_regenerator().w(function (_context3) {
      while (1) switch (_context3.n) {
        case 0:
          timeout = _args3.length > 0 && _args3[0] !== undefined ? _args3[0] : 10000;
          // 実際の実装では monitor/timeSlot.js からimportする
          startTime = Date.now();
        case 1:
          if (!(Date.now() - startTime < timeout)) {
            _context3.n = 4;
            break;
          }
          table = document.querySelector('table td[data-gray-out]');
          if (!table) {
            _context3.n = 2;
            break;
          }
          return _context3.a(2, true);
        case 2:
          _context3.n = 3;
          return new Promise(function (resolve) {
            return setTimeout(resolve, 500);
          });
        case 3:
          _context3.n = 1;
          break;
        case 4:
          return _context3.a(2, false);
      }
    }, _callee3);
  }));
  return _waitForTimeSlotTable.apply(this, arguments);
}
;// ./src-modules/main/init.js
/* module decorator */ module = __webpack_require__.hmd(module);
function _typeof(o) { "@babel/helpers - typeof"; return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) { return typeof o; } : function (o) { return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o; }, _typeof(o); }
function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(_typeof(e) + " is not iterable"); }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == _typeof(i) ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != _typeof(t) || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != _typeof(i)) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function init_regenerator() { /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/babel/babel/blob/main/packages/babel-helpers/LICENSE */ var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return init_regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (init_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, init_regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, init_regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), init_regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", init_regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), init_regeneratorDefine2(u), init_regeneratorDefine2(u, o, "Generator"), init_regeneratorDefine2(u, n, function () { return this; }), init_regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (init_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function init_regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } init_regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { init_regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, init_regeneratorDefine2(e, r, n, t); }
function init_asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function init_asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { init_asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { init_asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
/**
 * メイン初期化モジュール
 * エントリーポイント・ページ判定・初期化機能を提供
 */








// 入場予約ページ初期化可能か判定
var judge_entrance_init = function judge_entrance_init() {
  var target_div = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
  return target_div !== null;
};

// 入場予約ページ初期化処理
var init_entrance_page = function init_entrance_page() {
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
  manager_setPageLoadingState(true);

  // UIを即座に作成（読み込み状態表示のため）
  createEntranceReservationUI(entranceReservationConfig);

  // 時間帯監視機能の初期化（動的待機）
  init_asyncToGenerator(/*#__PURE__*/init_regenerator().m(function _callee() {
    return init_regenerator().w(function (_context) {
      while (1) switch (_context.n) {
        case 0:
          _context.n = 1;
          return initTimeSlotMonitoring();
        case 1:
          _context.n = 2;
          return restoreFromCache();
        case 2:
          // 初期化完了時に読み込み状態を解除
          manager_setPageLoadingState(false);
        case 3:
          return _context.a(2);
      }
    }, _callee);
  }))();
  console.log("入場予約機能の初期化完了");
};

// 初期化トリガー（メインエントリーポイント）
var trigger_init = function trigger_init() {
  try {
    var url = window.location.href;
    var pageType = identify_page_type(url);
    console.log("\u30DA\u30FC\u30B8\u30BF\u30A4\u30D7: ".concat(pageType, ", URL: ").concat(url));
    if (pageType === "pavilion") {
      // パビリオン予約ページ
      if (judge_init()) {
        console.log("パビリオン予約ページを初期化します");
        init_page();
      } else {
        console.log("パビリオン予約ページの初期化条件が満たされていません");
      }
    } else if (pageType === "entrance") {
      // 入場予約ページ
      if (judge_entrance_init()) {
        console.log("入場予約ページを初期化します");
        init_entrance_page();
      } else {
        console.log("入場予約ページの初期化条件が満たされていません");
      }
    } else {
      console.log("対応していないページタイプです");
    }
  } catch (e) {
    console.error("ytomo extension error", e);
  }
};

// 入場予約ヘルパー関数の実装
function entranceReservationHelper(_x) {
  return _entranceReservationHelper.apply(this, arguments);
}

// UserScript実行時の自動初期化
function _entranceReservationHelper() {
  _entranceReservationHelper = init_asyncToGenerator(/*#__PURE__*/init_regenerator().m(function _callee2(config) {
    var attempts, maxAttempts, _loop, _ret, _t;
    return init_regenerator().w(function (_context3) {
      while (1) switch (_context3.p = _context3.n) {
        case 0:
          console.log('🎯 入場予約ヘルパー開始');
          attempts = 0;
          maxAttempts = 10;
          _context3.p = 1;
          _loop = /*#__PURE__*/init_regenerator().m(function _loop() {
            var submitButton, waitTime, successModal, failureModal, closeButton, retryWait;
            return init_regenerator().w(function (_context2) {
              while (1) switch (_context2.n) {
                case 0:
                  attempts++;
                  console.log("\u4E88\u7D04\u8A66\u884C ".concat(attempts, "/").concat(maxAttempts));

                  // 予約ボタンをクリック
                  submitButton = document.querySelector(config.selectors.submit);
                  if (!(submitButton && !submitButton.disabled)) {
                    _context2.n = 3;
                    break;
                  }
                  console.log('予約ボタンをクリック');
                  submitButton.click();

                  // レスポンス待機
                  waitTime = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
                  _context2.n = 1;
                  return new Promise(function (resolve) {
                    return setTimeout(resolve, waitTime);
                  });
                case 1:
                  // 結果確認
                  successModal = document.querySelector(config.selectors.success);
                  failureModal = document.querySelector(config.selectors.failure);
                  if (!successModal) {
                    _context2.n = 2;
                    break;
                  }
                  console.log('✅ 予約成功');
                  return _context2.a(2, {
                    v: {
                      success: true,
                      attempts: attempts
                    }
                  });
                case 2:
                  if (!failureModal) {
                    _context2.n = 3;
                    break;
                  }
                  console.log('❌ 予約失敗 - 再試行');
                  // 失敗モーダルを閉じる
                  closeButton = document.querySelector(config.selectors.close);
                  if (!closeButton) {
                    _context2.n = 3;
                    break;
                  }
                  closeButton.click();
                  _context2.n = 3;
                  return new Promise(function (resolve) {
                    return setTimeout(resolve, 1000);
                  });
                case 3:
                  // 次の試行まで待機
                  retryWait = getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config);
                  _context2.n = 4;
                  return new Promise(function (resolve) {
                    return setTimeout(resolve, retryWait);
                  });
                case 4:
                  return _context2.a(2);
              }
            }, _loop);
          });
        case 2:
          if (!(attempts < maxAttempts)) {
            _context3.n = 5;
            break;
          }
          return _context3.d(_regeneratorValues(_loop()), 3);
        case 3:
          _ret = _context3.v;
          if (!_ret) {
            _context3.n = 4;
            break;
          }
          return _context3.a(2, _ret.v);
        case 4:
          _context3.n = 2;
          break;
        case 5:
          console.log("\u274C \u6700\u5927\u8A66\u884C\u56DE\u6570 ".concat(maxAttempts, " \u306B\u9054\u3057\u307E\u3057\u305F"));
          return _context3.a(2, {
            success: false,
            attempts: attempts
          });
        case 6:
          _context3.p = 6;
          _t = _context3.v;
          console.error('❌ 入場予約ヘルパーエラー:', _t);
          return _context3.a(2, {
            success: false,
            attempts: attempts
          });
      }
    }, _callee2, null, [[1, 6]]);
  }));
  return _entranceReservationHelper.apply(this, arguments);
}
console.log('yt-Expo2025-Reservation-Helper v0.3 開始');

// ページ読み込み完了後に初期化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', trigger_init);
} else {
  trigger_init();
}

// テスト用エクスポート（Node.js環境でのみ有効）
if ( true && module.exports) {
  module.exports = _defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty(_defineProperty({
    // ページ機能
    init_page: init_page,
    init_entrance_page: init_entrance_page,
    identify_page_type: identify_page_type,
    trigger_init: trigger_init,
    judge_init: judge_init,
    judge_entrance_init: judge_entrance_init,
    entranceReservationHelper: entranceReservationHelper,
    // パビリオン検索機能
    prepare_filter: prepare_filter,
    // 時間帯監視機能
    generateUniqueTdSelector: generateUniqueTdSelector,
    getTdPositionInfo: getTdPositionInfo,
    findSameTdElement: findSameTdElement,
    extractTdStatus: extractTdStatus,
    // FAB UI機能
    createEntranceReservationUI: createEntranceReservationUI,
    updateMainButtonDisplay: updateMainButtonDisplay,
    updateMonitoringTargetsDisplay: updateMonitoringTargetsDisplay,
    // カレンダー監視機能
    startCalendarWatcher: startCalendarWatcher,
    handleCalendarChange: handleCalendarChange,
    getCurrentSelectedCalendarDate: getCurrentSelectedCalendarDate,
    // キャッシュ機能
    cacheManager: cacheManager,
    // 状態管理オブジェクト
    multiTargetManager: multiTargetManager,
    timeSlotState: timeSlotState,
    entranceReservationState: entranceReservationState,
    calendarWatchState: calendarWatchState,
    // セレクタ定義
    timeSlotSelectors: timeSlotSelectors,
    // Unit Test用追加関数 (Phase 1)
    extractTimeSlotInfo: extractTimeSlotInfo,
    getMonitorButtonText: getMonitorButtonText,
    getCurrentMode: getCurrentMode,
    getRandomWaitTime: getRandomWaitTime,
    generateSelectorForElement: generateSelectorForElement
  }, "generateUniqueTdSelector", generateUniqueTdSelector), "getTdPositionInfo", getTdPositionInfo), "findSameTdElement", findSameTdElement), "extractTdStatus", extractTdStatus), "checkTimeSlotTableExistsSync", checkTimeSlotTableExistsSync), "validatePageLoaded", validatePageLoaded), "canStartReservation", canStartReservation), "isInterruptionAllowed", isInterruptionAllowed), "checkTimeSlotSelected", checkTimeSlotSelected), "checkVisitTimeButtonState", checkVisitTimeButtonState);
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
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__(618);
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});