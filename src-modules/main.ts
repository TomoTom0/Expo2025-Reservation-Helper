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

// すべてのモジュールをimport（副作用importも含む）
import './pavilion-search-page';
import './entrance-page-init';
import './entrance-page-state';
import './cache-manager';
import './entrance-page-dom-utils';
import './entrance-page-monitor';
import './entrance-page-ui';
import './entrance-page-fab';
import './app-router';
import './companion-ticket-page'; // 同行者追加機能
