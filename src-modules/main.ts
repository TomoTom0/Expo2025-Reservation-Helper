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

/**
 * メインエントリーポイント
 * 各sectionモジュールをimportすることで、webpackで統合されたバンドルを作成
 */

// すべてのsectionモジュールをimport（副作用importも含む）
import './section1';
import './section2';
import './section3';
import './section4';
import './section5';
import './section6';
import './section7';
import './section8';
