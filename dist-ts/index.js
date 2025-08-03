/******/ (() => { // webpackBootstrap
/******/ 	"use strict";

;// ./src-ts/core/page-detector.ts
/**
 * ページタイプ検出クラス
 */
class PageDetector {
    /**
     * 現在のURLからページタイプを判定
     */
    static detectPageType(url = window.location.href) {
        if (url.includes('event_search')) {
            return 'pavilion_reservation';
        }
        if (url.includes('ticket_visiting_reservation')) {
            return 'entrance_reservation';
        }
        return 'unknown';
    }
    /**
     * パビリオン予約ページかどうか判定
     */
    static isPavilionPage(url) {
        return this.detectPageType(url) === 'pavilion_reservation';
    }
    /**
     * 入場予約ページかどうか判定
     */
    static isEntrancePage(url) {
        return this.detectPageType(url) === 'entrance_reservation';
    }
    /**
     * ページ初期化可能かどうか判定（パビリオン）
     */
    static canInitializePavilionPage() {
        // パビリオン検索ページの必要な要素が存在するかチェック
        const searchArea = document.querySelector('div.style_search__7HKSe');
        return !!searchArea;
    }
    /**
     * ページ初期化可能かどうか判定（入場予約）
     */
    static canInitializeEntrancePage() {
        // 入場予約ページの必要な要素が存在するかチェック
        const timeSlotTable = document.querySelector('table');
        const mainContent = document.querySelector('#__next');
        return !!(timeSlotTable && mainContent);
    }
    /**
     * URL変更を監視
     */
    static observeUrlChanges(callback) {
        let currentUrl = window.location.href;
        const observer = new MutationObserver(() => {
            const newUrl = window.location.href;
            if (newUrl !== currentUrl) {
                const oldUrl = currentUrl;
                currentUrl = newUrl;
                callback(newUrl, oldUrl);
            }
        });
        observer.observe(document, {
            childList: true,
            subtree: true
        });
        // クリーンアップ関数を返す
        return () => observer.disconnect();
    }
}

;// ./src-ts/core/initializer.ts
/**
 * 初期化管理クラス
 */

class Initializer {
    /**
     * ページタイプに基づいた初期化トリガー
     */
    static triggerInitialization(url, callbacks) {
        const pageType = PageDetector.detectPageType(url);
        switch (pageType) {
            case 'pavilion_reservation':
                this.waitForPavilionPageReady(() => {
                    callbacks.onPavilionPageReady?.();
                    console.log('ytomo extension loaded (pavilion reservation)');
                });
                break;
            case 'entrance_reservation':
                this.waitForEntrancePageReady(() => {
                    callbacks.onEntrancePageReady?.();
                    console.log('ytomo extension loaded (entrance reservation)');
                });
                break;
            default:
                callbacks.onUnknownPage?.();
                break;
        }
    }
    /**
     * パビリオンページの準備完了を待機
     */
    static waitForPavilionPageReady(callback) {
        let attempts = 0;
        const checkReady = () => {
            attempts++;
            if (PageDetector.canInitializePavilionPage()) {
                callback();
                return;
            }
            if (attempts < this.MAX_INIT_ATTEMPTS) {
                setTimeout(checkReady, this.INIT_CHECK_INTERVAL);
            }
            else {
                console.warn('パビリオンページの初期化がタイムアウトしました');
            }
        };
        checkReady();
    }
    /**
     * 入場予約ページの準備完了を待機
     */
    static waitForEntrancePageReady(callback) {
        let attempts = 0;
        const checkReady = () => {
            attempts++;
            if (PageDetector.canInitializeEntrancePage()) {
                callback();
                return;
            }
            if (attempts < this.MAX_INIT_ATTEMPTS) {
                setTimeout(checkReady, this.INIT_CHECK_INTERVAL);
            }
            else {
                console.warn('入場予約ページの初期化がタイムアウトしました');
            }
        };
        checkReady();
    }
    /**
     * URL変更監視と自動初期化
     */
    static setupAutoInitialization(callbacks) {
        // 初回実行
        this.triggerInitialization(window.location.href, callbacks);
        // URL変更監視
        return PageDetector.observeUrlChanges((newUrl) => {
            this.triggerInitialization(newUrl, callbacks);
        });
    }
}
Initializer.INIT_CHECK_INTERVAL = 500; // 500ms間隔でチェック
Initializer.MAX_INIT_ATTEMPTS = 20; // 最大10秒間試行

;// ./src-ts/utils/dom.ts
/**
 * DOM操作ユーティリティ
 */
class DOMUtils {
    /**
     * 要素を待機して取得
     */
    static async waitForElement(selector, options = {}) {
        const { timeout = 10000, retryInterval = 100, required = false, parent = document } = options;
        const startTime = Date.now();
        return new Promise((resolve, reject) => {
            const check = () => {
                const element = parent.querySelector(selector);
                if (element) {
                    resolve(element);
                    return;
                }
                if (Date.now() - startTime > timeout) {
                    if (required) {
                        reject(new Error(`Required element not found: ${selector}`));
                    }
                    else {
                        resolve(null);
                    }
                    return;
                }
                setTimeout(check, retryInterval);
            };
            check();
        });
    }
    /**
     * 複数の要素を取得
     */
    static getElements(selector, parent = document) {
        return Array.from(parent.querySelectorAll(selector));
    }
    /**
     * 要素作成
     */
    static createElement(config) {
        const element = document.createElement(config.tag);
        // 基本属性設定
        if (config.id)
            element.id = config.id;
        if (config.className)
            element.className = config.className.join(' ');
        if (config.textContent)
            element.textContent = config.textContent;
        if (config.innerHTML)
            element.innerHTML = config.innerHTML;
        // カスタム属性設定
        if (config.attributes) {
            Object.entries(config.attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
            });
        }
        // スタイル設定
        if (config.style) {
            Object.assign(element.style, config.style);
        }
        // 親要素への追加
        if (config.parent) {
            this.insertElement(element, config.parent, config.position, config.referenceElement);
        }
        return element;
    }
    /**
     * 要素の挿入
     */
    static insertElement(element, parent, position = 'append', reference) {
        switch (position) {
            case 'append':
                parent.appendChild(element);
                break;
            case 'prepend':
                parent.insertBefore(element, parent.firstChild);
                break;
            case 'after':
                if (reference) {
                    reference.parentNode?.insertBefore(element, reference.nextSibling);
                }
                break;
            case 'before':
                if (reference) {
                    reference.parentNode?.insertBefore(element, reference);
                }
                break;
        }
    }
    /**
     * ボタン作成（万博拡張用スタイル）
     */
    static createExtensionButton(config) {
        const button = this.createElement({
            tag: 'button',
            className: [
                'basic-btn',
                'type2',
                'no-after',
                'ext-ytomo',
                ...(config.className || [])
            ]
        });
        this.createElement({
            tag: 'span',
            className: ['ext-ytomo'],
            textContent: config.text,
            parent: button
        });
        // スタイル調整
        Object.assign(button.style, {
            height: 'auto',
            minHeight: '40px',
            width: 'auto',
            minWidth: '60px',
            padding: '0px 8px',
            color: 'white',
            margin: '5px'
        });
        if (config.disabled) {
            button.disabled = true;
            button.classList.add('btn-done');
        }
        button.addEventListener('click', config.onClick);
        return button;
    }
    /**
     * 検索入力フィールド作成
     */
    static createSearchInput(config) {
        const input = this.createElement({
            tag: 'input',
            className: ['ext-tomo', 'search', ...(config.className || [])],
            attributes: {
                type: 'text',
                placeholder: config.placeholder
            }
        });
        input.addEventListener('input', (e) => {
            const target = e.target;
            config.onInput(target.value);
        });
        return input;
    }
    /**
     * Flexコンテナ作成
     */
    static createFlexContainer(className = ['div-flex']) {
        return this.createElement({
            tag: 'div',
            className
        });
    }
    /**
     * 要素の表示/非表示切り替え
     */
    static toggleVisibility(element, visible) {
        if (visible) {
            element.classList.remove('ytomo-none', 'filter-none', 'safe-none');
        }
        else {
            element.classList.add('ytomo-none');
        }
    }
    /**
     * 要素のクリーンアップ
     */
    static cleanup(selector, parent = document) {
        const elements = this.getElements(selector, parent);
        elements.forEach(element => element.remove());
    }
    /**
     * スクロール位置を保持しながらの処理実行
     */
    static async preserveScroll(callback) {
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        try {
            const result = await callback();
            window.scrollTo(scrollX, scrollY);
            return result;
        }
        catch (error) {
            window.scrollTo(scrollX, scrollY);
            throw error;
        }
    }
    /**
     * 要素が画面内に表示されているかチェック
     */
    static isElementVisible(element) {
        const rect = element.getBoundingClientRect();
        return rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth;
    }
    /**
     * デバウンス処理
     */
    static debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = window.setTimeout(() => func(...args), wait);
        };
    }
}

;// ./src-ts/features/pavilion/ui-components.ts
/**
 * パビリオン機能のUIコンポーネント
 */

class PavilionUIComponents {
    constructor(callbacks) {
        this.callbacks = callbacks;
    }
    /**
     * UI要素を挿入
     */
    async insertUI() {
        const searchArea = await DOMUtils.waitForElement('div.style_search__7HKSe', {
            timeout: 5000,
            required: true
        });
        if (!searchArea) {
            throw new Error('検索エリアが見つかりません');
        }
        // コンテナ作成
        this.searchContainer = DOMUtils.createFlexContainer();
        this.mainContainer = DOMUtils.createFlexContainer();
        // 検索入力フィールド作成
        this.searchInput = DOMUtils.createSearchInput({
            placeholder: '読み込みなし絞込',
            onInput: this.callbacks.onSearchInput
        });
        // 読み込みなし絞込ボタン
        this.filterWithoutLoadButton = DOMUtils.createExtensionButton({
            text: '絞込',
            onClick: () => {
                const searchText = this.searchInput?.value || '';
                this.callbacks.onFilterWithoutLoad(searchText);
            }
        });
        this.filterWithoutLoadButton.classList.add('btn-filter-without-load');
        // すべて読み込みボタン
        this.loadAllButton = DOMUtils.createExtensionButton({
            text: 'すべて読み込み',
            onClick: this.callbacks.onLoadAll
        });
        this.loadAllButton.classList.add('btn-load-all');
        // 空きのみボタン
        this.filterSafeButton = DOMUtils.createExtensionButton({
            text: '空きのみ',
            onClick: this.callbacks.onFilterSafe
        });
        this.filterSafeButton.classList.add('btn-filter-safe');
        // 一覧コピーボタン
        this.copyListButton = DOMUtils.createExtensionButton({
            text: '一覧コピー',
            onClick: this.callbacks.onCopyList
        });
        this.copyListButton.classList.add('btn-alert-to-copy');
        // レイアウト構築
        this.searchContainer.appendChild(this.searchInput);
        this.searchContainer.appendChild(this.filterWithoutLoadButton);
        this.mainContainer.appendChild(this.loadAllButton);
        this.mainContainer.appendChild(this.filterSafeButton);
        this.mainContainer.appendChild(this.copyListButton);
        // 検索エリアの後に挿入
        DOMUtils.insertElement(this.searchContainer, searchArea.parentElement, 'after', searchArea);
        DOMUtils.insertElement(this.mainContainer, searchArea.parentElement, 'after', searchArea);
    }
    /**
     * すべて読み込みボタンの状態更新
     */
    updateLoadAllButton(isLoading) {
        if (!this.loadAllButton)
            return;
        if (isLoading) {
            this.loadAllButton.disabled = true;
            this.loadAllButton.classList.add('btn-done');
            this.loadAllButton.querySelector('span').textContent = '読み込み中...';
        }
        else {
            this.loadAllButton.disabled = false;
            this.loadAllButton.classList.remove('btn-done');
            this.loadAllButton.querySelector('span').textContent = 'すべて読み込み';
        }
    }
    /**
     * 絞込ボタンの状態更新
     */
    updateFilterButton(isFiltering) {
        if (!this.filterWithoutLoadButton)
            return;
        if (isFiltering) {
            this.filterWithoutLoadButton.classList.add('btn-done');
            this.filterWithoutLoadButton.querySelector('span').textContent = '絞込中...';
        }
        else {
            this.filterWithoutLoadButton.classList.remove('btn-done');
            this.filterWithoutLoadButton.querySelector('span').textContent = '絞込';
        }
    }
    /**
     * 空きのみボタンの状態更新
     */
    updateSafeFilterButton(isActive) {
        if (!this.filterSafeButton)
            return;
        if (isActive) {
            this.filterSafeButton.classList.add('btn-done');
            this.filterSafeButton.querySelector('span').textContent = '解除';
        }
        else {
            this.filterSafeButton.classList.remove('btn-done');
            this.filterSafeButton.querySelector('span').textContent = '空きのみ';
        }
    }
    /**
     * 現在の検索テキスト取得
     */
    getSearchText() {
        return this.searchInput?.value || '';
    }
    /**
     * 検索テキスト設定
     */
    setSearchText(text) {
        if (this.searchInput) {
            this.searchInput.value = text;
        }
    }
    /**
     * UI要素をクリーンアップ
     */
    cleanup() {
        this.searchContainer?.remove();
        this.mainContainer?.remove();
        this.searchInput = undefined;
        this.loadAllButton = undefined;
        this.filterSafeButton = undefined;
        this.filterWithoutLoadButton = undefined;
        this.copyListButton = undefined;
        this.mainContainer = undefined;
        this.searchContainer = undefined;
    }
    /**
     * ボタンが存在するかチェック
     */
    isInitialized() {
        return !!(this.loadAllButton && this.filterSafeButton && this.filterWithoutLoadButton);
    }
}

;// ./src-ts/utils/filter.ts
/**
 * 検索フィルタ処理ユーティリティ
 */
class FilterEngine {
    /**
     * 検索文字列を正規表現フィルタに変換
     *
     * 対応する検索形式:
     * 1. 通常の文字列（AND検索）
     * 2. マイナス検索（-word で除外）
     * 3. フレーズ検索（"phrase" で完全一致）
     * 4. OR検索（word1 or word2）
     * 5. ワイルドカード（* で0文字以上）
     * 6. 括弧によるグループ化
     */
    static prepareFilter(searchText) {
        // 空の検索文字列の場合は全てにマッチ
        if (!searchText.trim()) {
            return { include: /(?:)/, exclude: null };
        }
        try {
            // OR条件を一時的に特別なマーカーに置換
            const orReplaced = searchText.replace(/(?:\s+|^)(or|OR)(?:\s+|$)/g, ' \uFFFF ');
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
                    // ORマーカーの処理は後で実装
                    return;
                }
                else if (token.startsWith('-') && token.length > 1) {
                    // マイナス検索
                    excludeTokens.push(token.slice(1).replace(/\*/g, '.*'));
                }
                else if (token && token !== '-') {
                    // 通常の単語
                    includeTokens.push(token.replace(/\*/g, '.*'));
                }
            });
            // 全ての包含条件（フレーズ + 通常の単語）
            const allIncludeTokens = [...phrases, ...includeTokens];
            // OR条件の処理
            const processedTokens = this.processOrConditions(orReplaced, allIncludeTokens);
            // 包含条件の正規表現生成
            const includeRegex = processedTokens.length > 0
                ? new RegExp(processedTokens.join('.*'), 'i')
                : /(?:)/; // 空の場合は全てにマッチ
            // 除外条件の正規表現生成
            const excludeRegex = excludeTokens.length > 0
                ? new RegExp(excludeTokens.join('|'), 'i')
                : null;
            return {
                include: includeRegex,
                exclude: excludeRegex
            };
        }
        catch (error) {
            console.warn('フィルタ処理エラー:', error);
            // エラー時は全てにマッチする安全なフィルタを返す
            return { include: /(?:)/, exclude: null };
        }
    }
    /**
     * OR条件の処理
     */
    static processOrConditions(searchText, tokens) {
        // 基本実装: OR条件を含む場合の特別処理
        if (searchText.includes('\uFFFF')) {
            // OR条件がある場合の処理（簡略化版）
            const parts = searchText.split('\uFFFF').map(part => part.trim()).filter(Boolean);
            const orGroup = parts.map(part => part.replace(/\*/g, '.*').replace(/"/g, '')).join('|');
            return orGroup ? [`(${orGroup})`] : tokens;
        }
        return tokens;
    }
    /**
     * フィルタ条件をテキストに適用
     */
    static applyFilter(text, criteria) {
        if (!text)
            return false;
        // 除外条件チェック
        if (criteria.exclude && criteria.exclude.test(text)) {
            return false;
        }
        // 包含条件チェック
        return criteria.include.test(text);
    }
    /**
     * 検索トークンを解析（デバッグ用）
     */
    static parseTokens(searchText) {
        const tokens = [];
        if (!searchText.trim())
            return tokens;
        // フレーズ検索の抽出
        const phraseMatches = searchText.match(/"[^"]*"/g) || [];
        phraseMatches.forEach(phrase => {
            tokens.push({
                type: 'phrase',
                value: phrase.slice(1, -1),
                regex: new RegExp(phrase.slice(1, -1).replace(/\*/g, '.*'), 'i')
            });
        });
        // 残りのトークンを解析
        let remaining = searchText.replace(/"[^"]*"/g, '');
        const words = remaining.split(/\s+/).filter(Boolean);
        words.forEach(word => {
            if (word.toLowerCase() === 'or') {
                tokens.push({ type: 'or', value: word });
            }
            else if (word.startsWith('-') && word.length > 1) {
                tokens.push({
                    type: 'exclude',
                    value: word.slice(1),
                    regex: new RegExp(word.slice(1).replace(/\*/g, '.*'), 'i')
                });
            }
            else {
                tokens.push({
                    type: 'include',
                    value: word,
                    regex: new RegExp(word.replace(/\*/g, '.*'), 'i')
                });
            }
        });
        return tokens;
    }
}

;// ./src-ts/features/pavilion/filter-engine.ts
/**
 * パビリオンフィルタエンジン
 */


class PavilionFilterEngine {
    constructor() {
        this.currentFilter = { include: /(?:)/, exclude: null };
        this.safeFilterActive = false;
        this.allItems = [];
    }
    /**
     * すべてのパビリオンアイテムを取得・キャッシュ
     */
    async refreshAllItems() {
        const items = [];
        // パビリオンリストのコンテナを取得
        const listItems = DOMUtils.getElements('li', document);
        for (const li of listItems) {
            try {
                const item = this.extractPavilionItem(li);
                if (item) {
                    items.push(item);
                }
            }
            catch (error) {
                console.warn('アイテム抽出エラー:', error);
            }
        }
        this.allItems = items;
        return items;
    }
    /**
     * LI要素からパビリオン情報を抽出
     */
    extractPavilionItem(liElement) {
        // タイトル要素を探す
        const titleElement = liElement.querySelector('h3, h2, .title, [class*="title"]');
        if (!titleElement)
            return null;
        const title = titleElement.textContent?.trim() || '';
        if (!title)
            return null;
        // 空き状況を判定
        const availabilityElement = liElement.querySelector('[class*="available"], [class*="status"], img[alt*="空き"], img[alt*="満員"]');
        let availability = '';
        let isAvailable = false;
        if (availabilityElement) {
            if (availabilityElement.tagName === 'IMG') {
                const imgElement = availabilityElement;
                availability = imgElement.alt || '';
                isAvailable = availability.includes('空き') || availability.includes('予約可能');
            }
            else {
                availability = availabilityElement.textContent?.trim() || '';
                isAvailable = availability.includes('空き') ||
                    availability.includes('予約可能') ||
                    availability.includes('◯') ||
                    !availability.includes('満員');
            }
        }
        // URLを取得
        const linkElement = liElement.querySelector('a');
        const url = linkElement?.href || '';
        return {
            element: liElement,
            title,
            availability,
            isAvailable,
            url
        };
    }
    /**
     * 検索フィルタを適用
     */
    applySearchFilter(searchText) {
        this.currentFilter = FilterEngine.prepareFilter(searchText);
        return this.updateVisibility();
    }
    /**
     * 空きのみフィルタを切り替え
     */
    toggleSafeFilter() {
        this.safeFilterActive = !this.safeFilterActive;
        this.updateVisibility();
        return this.safeFilterActive;
    }
    /**
     * すべてのフィルタをクリア
     */
    clearAllFilters() {
        this.currentFilter = { include: /(?:)/, exclude: null };
        this.safeFilterActive = false;
        this.updateVisibility();
    }
    /**
     * 表示状態を更新
     */
    updateVisibility() {
        let visibleCount = 0;
        for (const item of this.allItems) {
            let shouldShow = true;
            // 検索フィルタチェック
            if (this.currentFilter.include || this.currentFilter.exclude) {
                const searchText = `${item.title} ${item.availability}`;
                shouldShow = FilterEngine.applyFilter(searchText, this.currentFilter);
            }
            // 空きのみフィルタチェック
            if (shouldShow && this.safeFilterActive) {
                shouldShow = item.isAvailable;
            }
            // 表示/非表示を適用
            DOMUtils.toggleVisibility(item.element, shouldShow);
            if (shouldShow) {
                visibleCount++;
            }
        }
        return visibleCount;
    }
    /**
     * 現在表示されているアイテム数を取得
     */
    getVisibleItemCount() {
        return this.allItems.filter(item => !item.element.classList.contains('ytomo-none') &&
            !item.element.classList.contains('filter-none')).length;
    }
    /**
     * 現在表示されているアイテムを取得
     */
    getVisibleItems() {
        return this.allItems.filter(item => !item.element.classList.contains('ytomo-none') &&
            !item.element.classList.contains('filter-none'));
    }
    /**
     * 空きのあるアイテムのみを取得
     */
    getAvailableItems() {
        return this.allItems.filter(item => item.isAvailable);
    }
    /**
     * フィルタ状態の取得
     */
    getFilterStatus() {
        return {
            hasSearchFilter: this.currentFilter.include.source !== '(?:)',
            safeFilterActive: this.safeFilterActive,
            totalItems: this.allItems.length,
            visibleItems: this.getVisibleItemCount(),
            availableItems: this.getAvailableItems().length
        };
    }
    /**
     * アイテムリストをコピー用テキストに変換
     */
    generateCopyText(onlyVisible = true) {
        const items = onlyVisible ? this.getVisibleItems() : this.allItems;
        const lines = items.map(item => {
            const status = item.isAvailable ? '○' : '×';
            return `${status} ${item.title} - ${item.availability}${item.url ? ` (${item.url})` : ''}`;
        });
        const header = `パビリオン一覧 (${items.length}件)\n${'='.repeat(40)}`;
        const footer = `\n生成時刻: ${new Date().toLocaleString()}`;
        return [header, ...lines, footer].join('\n');
    }
    /**
     * デバッグ情報出力
     */
    debugInfo() {
        console.log('=== パビリオンフィルタエンジン デバッグ情報 ===');
        console.log('総アイテム数:', this.allItems.length);
        console.log('表示中アイテム数:', this.getVisibleItemCount());
        console.log('空きありアイテム数:', this.getAvailableItems().length);
        console.log('現在のフィルタ:', {
            include: this.currentFilter.include.source,
            exclude: this.currentFilter.exclude?.source || 'なし',
            safeFilter: this.safeFilterActive
        });
        console.log('表示中アイテム:', this.getVisibleItems().map(item => item.title));
    }
}

;// ./src-ts/features/pavilion/pavilion-service.ts
/**
 * パビリオン機能のメインサービス
 */



class PavilionService {
    constructor(config) {
        this.initialized = false;
        this.isLoadingAll = false;
        /**
         * 検索入力処理（デバウンス付き）
         */
        this.handleSearchInput = DOMUtils.debounce((searchText) => {
            if (searchText.length > 0) {
                this.handleFilterWithoutLoad(searchText);
            }
            else {
                // 検索テキストが空の場合はフィルタをクリア
                this.filterEngine.clearAllFilters();
                this.updateStateFromFilter();
            }
        }, 300);
        this.config = config;
        this.state = {
            isLoading: false,
            totalItems: 0,
            availableItems: 0,
            currentFilter: '',
            lastUpdate: Date.now()
        };
        this.filterEngine = new PavilionFilterEngine();
    }
    /**
     * サービス初期化
     */
    async initialize() {
        if (this.initialized) {
            console.warn('PavilionService は既に初期化されています');
            return;
        }
        try {
            this.log('初期化開始');
            // UI要素の挿入
            const callbacks = {
                onLoadAll: () => this.handleLoadAll(),
                onFilterSafe: () => this.handleFilterSafe(),
                onFilterWithoutLoad: (searchText) => this.handleFilterWithoutLoad(searchText),
                onCopyList: () => this.handleCopyList(),
                onSearchInput: (searchText) => this.handleSearchInput(searchText)
            };
            this.uiComponents = new PavilionUIComponents(callbacks);
            await this.uiComponents.insertUI();
            // 初期データ読み込み
            await this.refreshData();
            this.initialized = true;
            this.log('初期化完了');
        }
        catch (error) {
            console.error('PavilionService 初期化エラー:', error);
            throw error;
        }
    }
    /**
     * すべて読み込み処理
     */
    async handleLoadAll() {
        if (this.isLoadingAll)
            return;
        try {
            this.isLoadingAll = true;
            this.uiComponents?.updateLoadAllButton(true);
            this.log('すべて読み込み開始');
            await this.loadMoreAuto();
            await this.refreshData();
            this.log('すべて読み込み完了');
        }
        catch (error) {
            console.error('すべて読み込みエラー:', error);
        }
        finally {
            this.isLoadingAll = false;
            this.uiComponents?.updateLoadAllButton(false);
        }
    }
    /**
     * 空きのみフィルタ処理
     */
    handleFilterSafe() {
        const isActive = this.filterEngine.toggleSafeFilter();
        this.uiComponents?.updateSafeFilterButton(isActive);
        this.updateStateFromFilter();
        this.log(`空きのみフィルタ: ${isActive ? 'ON' : 'OFF'}`);
    }
    /**
     * 読み込みなしフィルタ処理
     */
    handleFilterWithoutLoad(searchText) {
        this.uiComponents?.updateFilterButton(true);
        try {
            const visibleCount = this.filterEngine.applySearchFilter(searchText);
            this.state.currentFilter = searchText;
            this.updateStateFromFilter();
            this.log(`絞込完了: ${visibleCount}件表示`);
        }
        catch (error) {
            console.error('絞込エラー:', error);
        }
        finally {
            this.uiComponents?.updateFilterButton(false);
        }
    }
    /**
     * 一覧コピー処理
     */
    async handleCopyList() {
        try {
            const copyText = this.filterEngine.generateCopyText(true);
            await navigator.clipboard.writeText(copyText);
            // 一時的にボタンテキストを変更してフィードバック
            const button = this.uiComponents?.['copyListButton'];
            if (button) {
                const originalText = button.querySelector('span')?.textContent;
                button.querySelector('span').textContent = 'コピー完了!';
                setTimeout(() => {
                    button.querySelector('span').textContent = originalText || '一覧コピー';
                }, 1500);
            }
            this.log('一覧をクリップボードにコピーしました');
        }
        catch (error) {
            console.error('コピーエラー:', error);
            alert('コピーに失敗しました');
        }
    }
    /**
     * 自動的にすべて読み込み
     */
    async loadMoreAuto() {
        return DOMUtils.preserveScroll(async () => {
            let hasMore = true;
            let attempts = 0;
            const maxAttempts = 100; // 無限ループ防止
            while (hasMore && attempts < maxAttempts) {
                const loadMoreButtons = DOMUtils.getElements('button.style_more_btn__ymb22:not([disabled])');
                if (loadMoreButtons.length > 0) {
                    loadMoreButtons[0].click();
                    attempts++;
                    // 次の読み込みを待機
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
                else {
                    hasMore = false;
                    this.log('すべての項目を読み込み完了');
                }
            }
            if (attempts >= maxAttempts) {
                console.warn('最大試行回数に達しました');
            }
        });
    }
    /**
     * データを再読み込み
     */
    async refreshData() {
        const items = await this.filterEngine.refreshAllItems();
        this.state.totalItems = items.length;
        this.state.availableItems = this.filterEngine.getAvailableItems().length;
        this.state.lastUpdate = Date.now();
    }
    /**
     * フィルタエンジンの状態から内部状態を更新
     */
    updateStateFromFilter() {
        const filterStatus = this.filterEngine.getFilterStatus();
        this.state.totalItems = filterStatus.totalItems;
        this.state.availableItems = filterStatus.availableItems;
        this.state.lastUpdate = Date.now();
    }
    /**
     * クリーンアップ
     */
    async cleanup() {
        this.log('クリーンアップ開始');
        this.uiComponents?.cleanup();
        this.uiComponents = undefined;
        this.isLoadingAll = false;
        this.initialized = false;
        this.log('クリーンアップ完了');
    }
    /**
     * 現在の状態を取得
     */
    getStatus() {
        return {
            ...this.state,
            initialized: this.initialized
        };
    }
    /**
     * デバッグ情報出力
     */
    debug() {
        this.log('=== PavilionService デバッグ情報 ===');
        this.log(JSON.stringify(this.getStatus(), null, 2));
        this.filterEngine.debugInfo();
    }
    /**
     * デバッグログ出力
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[PavilionService] ${message}`);
        }
    }
}

;// ./src-ts/utils/timing.ts
/**
 * タイミング制御ユーティリティ
 */
class TimingUtils {
    /**
     * ランダム待機時間を生成（BAN防止）
     */
    static getRandomWaitTime(config) {
        const { minTime, randomRange, banPreventionDelay } = config;
        const randomDelay = Math.random() * randomRange;
        return minTime + randomDelay + banPreventionDelay;
    }
    /**
     * 指定時間待機
     */
    static async wait(milliseconds) {
        return new Promise(resolve => setTimeout(resolve, milliseconds));
    }
    /**
     * ランダム待機
     */
    static async randomWait(config) {
        const waitTime = this.getRandomWaitTime(config);
        return this.wait(waitTime);
    }
    /**
     * タイムアウト付き実行
     */
    static async withTimeout(promise, timeoutMs, errorMessage) {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(new Error(errorMessage || `操作がタイムアウトしました (${timeoutMs}ms)`));
            }, timeoutMs);
        });
        return Promise.race([promise, timeoutPromise]);
    }
    /**
     * リトライ機能付き実行
     */
    static async withRetry(operation, maxRetries, retryDelay = 1000) {
        let lastError;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            }
            catch (error) {
                lastError = error;
                if (attempt < maxRetries) {
                    console.warn(`試行 ${attempt + 1} 失敗、${retryDelay}ms後にリトライ:`, error);
                    await this.wait(retryDelay);
                }
            }
        }
        throw lastError || new Error('リトライ上限に達しました');
    }
    /**
     * インターバル実行（停止可能）
     */
    static createInterval(callback, intervalMs) {
        const intervalId = setInterval(async () => {
            try {
                await callback();
            }
            catch (error) {
                console.error('インターバル実行エラー:', error);
            }
        }, intervalMs);
        return () => clearInterval(intervalId);
    }
    /**
     * ランダムインターバル実行
     */
    static createRandomInterval(callback, config) {
        let timeoutId;
        let stopped = false;
        const scheduleNext = () => {
            if (stopped)
                return;
            const nextInterval = this.getRandomWaitTime(config);
            timeoutId = window.setTimeout(async () => {
                if (stopped)
                    return;
                try {
                    await callback();
                }
                catch (error) {
                    console.error('ランダムインターバル実行エラー:', error);
                }
                scheduleNext();
            }, nextInterval);
        };
        scheduleNext();
        return () => {
            stopped = true;
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
        };
    }
    /**
     * デバウンス（重複実行防止）
     */
    static debounce(func, delayMs) {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = window.setTimeout(() => func(...args), delayMs);
        };
    }
    /**
     * スロットル（実行頻度制限）
     */
    static throttle(func, limitMs) {
        let lastExecution = 0;
        return (...args) => {
            const now = Date.now();
            if (now - lastExecution >= limitMs) {
                lastExecution = now;
                func(...args);
            }
        };
    }
}

;// ./src-ts/utils/cache.ts
/**
 * キャッシュ管理ユーティリティ
 */
class CacheManager {
    constructor(prefix = 'expo2025_') {
        this.storage = new Map();
        this.keyPrefix = prefix;
    }
    /**
     * 値をキャッシュに保存
     */
    set(key, value, expiryMs) {
        const fullKey = this.getFullKey(key);
        const entry = {
            value,
            timestamp: Date.now()
        };
        if (expiryMs) {
            entry.expiry = Date.now() + expiryMs;
        }
        this.storage.set(fullKey, entry);
        // localStorage にも保存（ページリロード対応）
        try {
            localStorage.setItem(fullKey, JSON.stringify(entry));
        }
        catch (error) {
            console.warn('localStorage保存エラー:', error);
        }
    }
    /**
     * キャッシュから値を取得
     */
    get(key) {
        const fullKey = this.getFullKey(key);
        // メモリキャッシュを最初にチェック
        let entry = this.storage.get(fullKey);
        // メモリにない場合はlocalStorageから復元
        if (!entry) {
            try {
                const stored = localStorage.getItem(fullKey);
                if (stored) {
                    entry = JSON.parse(stored);
                    if (entry) {
                        this.storage.set(fullKey, entry);
                    }
                }
            }
            catch (error) {
                console.warn('localStorage読み込みエラー:', error);
            }
        }
        if (!entry)
            return null;
        // 有効期限チェック
        if (entry.expiry && Date.now() > entry.expiry) {
            this.clear(key);
            return null;
        }
        return entry.value;
    }
    /**
     * キャッシュエントリを削除
     */
    clear(key) {
        const fullKey = this.getFullKey(key);
        this.storage.delete(fullKey);
        try {
            localStorage.removeItem(fullKey);
        }
        catch (error) {
            console.warn('localStorage削除エラー:', error);
        }
    }
    /**
     * すべてのキャッシュをクリア
     */
    clearAll() {
        // メモリキャッシュクリア
        this.storage.clear();
        // localStorage からも削除
        try {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.keyPrefix)) {
                    keysToRemove.push(key);
                }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
        }
        catch (error) {
            console.warn('localStorage一括削除エラー:', error);
        }
    }
    /**
     * キャッシュエントリが存在するかチェック
     */
    has(key) {
        return this.get(key) !== null;
    }
    /**
     * キャッシュエントリのタイムスタンプを取得
     */
    getTimestamp(key) {
        const fullKey = this.getFullKey(key);
        const entry = this.storage.get(fullKey);
        return entry?.timestamp || null;
    }
    /**
     * キャッシュエントリの残り有効時間を取得（ミリ秒）
     */
    getTimeToExpiry(key) {
        const fullKey = this.getFullKey(key);
        const entry = this.storage.get(fullKey);
        if (!entry || !entry.expiry)
            return null;
        const remaining = entry.expiry - Date.now();
        return remaining > 0 ? remaining : 0;
    }
    /**
     * 期限切れエントリをクリーンアップ
     */
    cleanup() {
        const now = Date.now();
        const expiredKeys = [];
        for (const [key, entry] of this.storage.entries()) {
            if (entry.expiry && now > entry.expiry) {
                expiredKeys.push(key);
            }
        }
        expiredKeys.forEach(key => {
            this.storage.delete(key);
            try {
                localStorage.removeItem(key);
            }
            catch (error) {
                console.warn('期限切れエントリ削除エラー:', error);
            }
        });
        if (expiredKeys.length > 0) {
            console.log(`${expiredKeys.length}個の期限切れキャッシュエントリを削除しました`);
        }
    }
    /**
     * キャッシュ統計情報を取得
     */
    getStats() {
        const now = Date.now();
        let expiredCount = 0;
        let validCount = 0;
        for (const entry of this.storage.values()) {
            if (entry.expiry && now > entry.expiry) {
                expiredCount++;
            }
            else {
                validCount++;
            }
        }
        return {
            totalEntries: this.storage.size,
            validEntries: validCount,
            expiredEntries: expiredCount,
            memoryUsage: this.estimateMemoryUsage()
        };
    }
    /**
     * フルキー生成
     */
    getFullKey(key) {
        // URLパラメータを含むキーを生成（入場予約用）
        const urlParams = new URLSearchParams(window.location.search);
        const reserveId = urlParams.get('reserve_id') || 'default';
        return `${this.keyPrefix}${reserveId}_${key}`;
    }
    /**
     * メモリ使用量の概算
     */
    estimateMemoryUsage() {
        let totalSize = 0;
        for (const entry of this.storage.values()) {
            try {
                totalSize += JSON.stringify(entry).length * 2; // 文字あたり2バイトと仮定
            }
            catch (error) {
                // JSON化できない場合はスキップ
            }
        }
        return totalSize;
    }
}
// グローバルキャッシュマネージャーインスタンス
const globalCache = new CacheManager();

;// ./src-ts/features/entrance/monitoring-engine.ts
/**
 * 時間帯監視エンジン
 */


class TimeSlotMonitoringEngine {
    constructor() {
        this.MAX_RETRIES = 100;
        this.state = {
            isMonitoring: false,
            targetSlot: null,
            retryCount: 0,
            startTime: null,
            mode: 'idle',
            attempts: 0
        };
        this.selectors = {
            table: 'table',
            timeSlotButtons: 'td[data-gray-out] div[role="button"]',
            fullSlotButton: 'td[data-gray-out] div[role="button"][data-disabled="true"]',
            availableSlotButton: 'td[data-gray-out] div[role="button"]:not([data-disabled])',
            timeText: 'dt span',
            statusIcon: 'dd img'
        };
    }
    /**
     * 監視開始
     */
    async startMonitoring(targetSlot) {
        if (this.state.isMonitoring) {
            throw new Error('既に監視中です');
        }
        try {
            console.log(`時間帯監視開始: ${targetSlot.timeText}`);
            this.state = {
                isMonitoring: true,
                targetSlot,
                retryCount: 0,
                startTime: Date.now(),
                mode: 'monitoring',
                attempts: 0
            };
            // 監視対象情報をキャッシュに保存
            globalCache.set('monitoringTarget', targetSlot);
            globalCache.set('monitoringState', this.state);
            // 定期監視開始
            this.stopMonitoring = TimingUtils.createRandomInterval(() => this.performMonitoringCheck(), {
                minTime: 25000, // 25秒
                randomRange: 10000, // ±5秒
                banPreventionDelay: 0
            });
        }
        catch (error) {
            this.terminateMonitoring('ERROR_TARGET_NOT_FOUND', `監視開始エラー: ${error}`);
            throw error;
        }
    }
    /**
     * 監視停止
     */
    stopMonitoringManual() {
        console.log('手動監視停止');
        this.cleanupMonitoring();
    }
    /**
     * 監視チェック実行
     */
    async performMonitoringCheck() {
        if (!this.state.isMonitoring || !this.state.targetSlot) {
            return;
        }
        this.state.attempts++;
        this.state.retryCount++;
        console.log(`監視チェック実行 (${this.state.attempts}回目): ${this.state.targetSlot.timeText}`);
        try {
            // ページ状態検証
            if (!this.validatePageState()) {
                return; // エラー時は terminateMonitoring が呼ばれる
            }
            // 最大試行回数チェック
            if (this.state.retryCount >= this.MAX_RETRIES) {
                this.terminateMonitoring('ERROR_MAX_RETRIES_REACHED', `最大試行回数 ${this.MAX_RETRIES} に達しました`);
                return;
            }
            // 対象要素の状態確認
            const currentSlot = this.findTargetSlotInPage();
            if (!currentSlot) {
                this.terminateMonitoring('ERROR_TARGET_NOT_FOUND', `監視対象の時間帯 ${this.state.targetSlot.timeText} が見つかりません`);
                return;
            }
            // 状態変化チェック
            if (currentSlot.status === 'available') {
                console.log('🎉 利用可能な時間帯を検出!', currentSlot);
                this.handleAvailabilityDetected(currentSlot);
                return;
            }
            // 状態をキャッシュに保存
            globalCache.set('monitoringState', this.state);
            // 次回チェック前にページリロード
            await this.performPageReload();
        }
        catch (error) {
            console.error('監視チェックエラー:', error);
            this.terminateMonitoring('ERROR_PAGE_LOAD_FAILED', `監視エラー: ${error}`);
        }
    }
    /**
     * ページ状態検証
     */
    validatePageState() {
        // URL確認
        if (!window.location.href.includes('ticket_visiting_reservation')) {
            this.terminateMonitoring('ERROR_WRONG_PAGE', '予期しないページに遷移しました');
            return false;
        }
        // メインコンテンツ存在確認
        const mainContent = document.querySelector('#__next');
        if (!mainContent) {
            this.terminateMonitoring('ERROR_PAGE_LOAD_FAILED', 'ページの読み込みが完了していません');
            return false;
        }
        // テーブル存在確認
        const table = document.querySelector(this.selectors.table);
        if (!table) {
            this.terminateMonitoring('ERROR_TABLE_NOT_FOUND', '時間帯選択テーブルが見つかりません');
            return false;
        }
        return true;
    }
    /**
     * ページ内で対象時間帯を検索
     */
    findTargetSlotInPage() {
        if (!this.state.targetSlot)
            return null;
        try {
            // セレクタで要素を再検索
            const targetElement = document.querySelector(this.state.targetSlot.tdSelector);
            if (!targetElement)
                return null;
            // 現在の状態を抽出
            const status = this.extractSlotStatus(targetElement);
            return {
                ...this.state.targetSlot,
                status
            };
        }
        catch (error) {
            console.warn('対象時間帯検索エラー:', error);
            return null;
        }
    }
    /**
     * 時間帯の状態を抽出
     */
    extractSlotStatus(tdElement) {
        const buttonElement = tdElement.querySelector('div[role="button"]');
        if (!buttonElement)
            return 'unknown';
        // data-disabled属性チェック
        const isDisabled = buttonElement.hasAttribute('data-disabled');
        // アイコンで状態確認
        const iconElement = buttonElement.querySelector('img');
        if (iconElement) {
            const iconSrc = iconElement.src;
            if (iconSrc.includes('calendar_ng.svg')) {
                return 'full';
            }
            else if (iconSrc.includes('ico_scale_low.svg') || iconSrc.includes('ico_scale_high.svg')) {
                return 'available';
            }
        }
        // data-disabledが設定されていない場合は利用可能
        return isDisabled ? 'full' : 'available';
    }
    /**
     * 利用可能状態検出時の処理
     */
    handleAvailabilityDetected(availableSlot) {
        console.log('🚀 予約可能時間帯を検出、予約を開始します');
        // 監視停止
        this.cleanupMonitoring();
        // 予約実行イベントを発火
        const event = new CustomEvent('timeSlotAvailable', {
            detail: { timeSlot: availableSlot }
        });
        document.dispatchEvent(event);
    }
    /**
     * ページリロード実行
     */
    async performPageReload() {
        // BAN防止のためのランダム待機
        await TimingUtils.randomWait({
            minTime: 1000,
            randomRange: 2000,
            banPreventionDelay: 500
        });
        // ページリロード
        window.location.reload();
    }
    /**
     * 監視異常終了
     */
    terminateMonitoring(errorCode, errorMessage) {
        console.error(`[監視異常終了] ${errorCode}: ${errorMessage}`);
        const terminationInfo = {
            errorCode,
            errorMessage,
            timestamp: Date.now()
        };
        // 終了情報をキャッシュに保存
        globalCache.set('monitoringTermination', terminationInfo);
        // 監視クリーンアップ
        this.cleanupMonitoring();
        // エラーイベントを発火
        const event = new CustomEvent('monitoringError', {
            detail: terminationInfo
        });
        document.dispatchEvent(event);
    }
    /**
     * 監視クリーンアップ
     */
    cleanupMonitoring() {
        // インターバル停止
        this.stopMonitoring?.();
        this.stopMonitoring = undefined;
        // 状態リセット
        this.state = {
            isMonitoring: false,
            targetSlot: null,
            retryCount: 0,
            startTime: null,
            mode: 'idle',
            attempts: 0
        };
        // キャッシュクリア
        globalCache.clear('monitoringTarget');
        globalCache.clear('monitoringState');
    }
    /**
     * 現在の監視状態を取得
     */
    getMonitoringState() {
        return { ...this.state };
    }
    /**
     * 監視中かどうか
     */
    isCurrentlyMonitoring() {
        return this.state.isMonitoring;
    }
    /**
     * 監視統計情報
     */
    getStats() {
        const elapsedTime = this.state.startTime ? Date.now() - this.state.startTime : 0;
        return {
            isMonitoring: this.state.isMonitoring,
            targetTimeSlot: this.state.targetSlot?.timeText || null,
            attempts: this.state.attempts,
            retryCount: this.state.retryCount,
            elapsedTimeMs: elapsedTime,
            elapsedMinutes: Math.floor(elapsedTime / 60000)
        };
    }
}

;// ./src-ts/features/entrance/reservation-executor.ts
/**
 * 入場予約実行エンジン
 */



class ReservationExecutor {
    constructor(config) {
        this.config = config;
        this.state = {
            isRunning: false,
            startTime: null,
            attempts: 0
        };
    }
    /**
     * 予約実行開始
     */
    async startReservation(timeSlot) {
        if (this.state.isRunning) {
            console.warn('既に予約処理が実行中です');
            return false;
        }
        try {
            console.log('入場予約処理開始');
            this.state = {
                isRunning: true,
                startTime: Date.now(),
                attempts: 0
            };
            // 状態をキャッシュに保存
            globalCache.set('reservationState', this.state);
            // 予約処理実行
            const success = await this.executeReservationProcess(timeSlot);
            if (success) {
                console.log('✅ 予約処理完了');
            }
            else {
                console.log('❌ 予約処理失敗');
            }
            return success;
        }
        catch (error) {
            console.error('予約処理エラー:', error);
            this.state.lastError = String(error);
            return false;
        }
        finally {
            this.state.isRunning = false;
            globalCache.set('reservationState', this.state);
        }
    }
    /**
     * 予約処理の実行
     */
    async executeReservationProcess(targetTimeSlot) {
        let currentAttempt = 0;
        const maxAttempts = this.config.maxRetries;
        while (currentAttempt < maxAttempts && this.state.isRunning) {
            this.state.attempts = ++currentAttempt;
            console.log(`予約試行 ${currentAttempt}/${maxAttempts}`);
            try {
                // 訪問時間ボタンの状態確認
                if (!await this.checkVisitTimeButtonState()) {
                    console.log('訪問時間が未選択、次回試行します');
                    await this.waitBeforeRetry();
                    continue;
                }
                // 時間帯選択
                const selectedTimeSlot = await this.selectTimeSlot(targetTimeSlot);
                if (!selectedTimeSlot) {
                    console.log('時間帯選択失敗、次回試行します');
                    await this.waitBeforeRetry();
                    continue;
                }
                // 予約確定処理
                const reservationSuccess = await this.confirmReservation();
                if (reservationSuccess) {
                    console.log('🎉 予約確定成功!');
                    return true;
                }
                console.log('予約確定失敗、次回試行します');
                await this.waitBeforeRetry();
            }
            catch (error) {
                console.error(`試行 ${currentAttempt} でエラー:`, error);
                await this.waitBeforeRetry();
            }
        }
        console.log('最大試行回数に達しました');
        return false;
    }
    /**
     * 訪問時間ボタンの状態確認
     */
    async checkVisitTimeButtonState() {
        try {
            const visitTimeButton = await DOMUtils.waitForElement('button[class*="visitTime"], button[class*="visit_time"], button:contains("訪問時間")', { timeout: 5000 });
            if (!visitTimeButton) {
                console.log('訪問時間ボタンが見つかりません');
                return false;
            }
            // ボタンが選択済みかチェック
            const isSelected = visitTimeButton.classList.contains('selected') ||
                visitTimeButton.classList.contains('active') ||
                visitTimeButton.getAttribute('aria-pressed') === 'true';
            if (!isSelected) {
                console.log('訪問時間を選択します');
                visitTimeButton.click();
                await TimingUtils.wait(1000);
            }
            return true;
        }
        catch (error) {
            console.error('訪問時間ボタン確認エラー:', error);
            return false;
        }
    }
    /**
     * 時間帯選択
     */
    async selectTimeSlot(targetTimeSlot) {
        try {
            // 利用可能な時間帯ボタンを検索
            const availableButtons = DOMUtils.getElements('td[data-gray-out] div[role="button"]:not([data-disabled])');
            if (availableButtons.length === 0) {
                console.log('利用可能な時間帯が見つかりません');
                return null;
            }
            let selectedButton;
            if (targetTimeSlot) {
                // 特定の時間帯を探す
                selectedButton = availableButtons.find(button => {
                    const timeText = button.querySelector('dt span')?.textContent?.trim();
                    return timeText === targetTimeSlot.timeText;
                }) || availableButtons[0];
            }
            else {
                // 最初の利用可能な時間帯を選択
                selectedButton = availableButtons[0];
            }
            // 時間帯情報を抽出
            const timeText = selectedButton.querySelector('dt span')?.textContent?.trim() || '';
            console.log(`時間帯を選択: ${timeText}`);
            // BAN防止の待機
            await TimingUtils.randomWait(this.config.waitTimeConfig);
            // クリック実行
            selectedButton.click();
            // クリック後の待機
            await TimingUtils.wait(1500);
            return {
                timeText,
                status: 'available',
                tdSelector: '', // 簡略化
                rowIndex: 0,
                cellIndex: 0,
                buttonElement: selectedButton
            };
        }
        catch (error) {
            console.error('時間帯選択エラー:', error);
            return null;
        }
    }
    /**
     * 予約確定処理
     */
    async confirmReservation() {
        try {
            // 予約確定ボタンを探す
            const confirmButton = await DOMUtils.waitForElement('button:contains("予約確定"), button:contains("確定"), button[class*="confirm"], button[class*="submit"]', { timeout: 5000 });
            if (!confirmButton) {
                console.log('予約確定ボタンが見つかりません');
                return false;
            }
            if (confirmButton.disabled) {
                console.log('予約確定ボタンが無効状態です');
                return false;
            }
            console.log('予約確定ボタンをクリック');
            // BAN防止の待機
            await TimingUtils.randomWait(this.config.waitTimeConfig);
            // 確定ボタンクリック
            confirmButton.click();
            // 処理完了待機
            await TimingUtils.wait(3000);
            // 成功判定（簡略化）
            const hasError = document.querySelector('.error, .alert-danger');
            const hasSuccess = document.querySelector('.success, .alert-success');
            const isSuccess = !hasError &&
                (!!hasSuccess ||
                    window.location.href.includes('complete') ||
                    window.location.href.includes('success'));
            return isSuccess;
        }
        catch (error) {
            console.error('予約確定エラー:', error);
            return false;
        }
    }
    /**
     * リトライ前の待機
     */
    async waitBeforeRetry() {
        await TimingUtils.wait(this.config.retryInterval);
    }
    /**
     * 予約処理停止
     */
    stopReservation() {
        console.log('予約処理を停止します');
        this.state.isRunning = false;
        globalCache.set('reservationState', this.state);
    }
    /**
     * 現在の状態取得
     */
    getState() {
        return { ...this.state };
    }
    /**
     * 予約処理中かどうか
     */
    isRunning() {
        return this.state.isRunning;
    }
    /**
     * 予約統計情報
     */
    getStats() {
        const elapsedTime = this.state.startTime ? Date.now() - this.state.startTime : 0;
        return {
            isRunning: this.state.isRunning,
            attempts: this.state.attempts,
            elapsedTimeMs: elapsedTime,
            elapsedMinutes: Math.floor(elapsedTime / 60000),
            lastError: this.state.lastError
        };
    }
    /**
     * 予約可能状態チェック
     */
    async canStartReservation() {
        try {
            // 基本ページ要素確認
            const mainContent = document.querySelector('#__next');
            if (!mainContent) {
                return { canStart: false, reason: 'ページが正しく読み込まれていません' };
            }
            // 時間帯テーブル確認
            const table = document.querySelector('table');
            if (!table) {
                return { canStart: false, reason: '時間帯選択テーブルが見つかりません' };
            }
            // 利用可能な時間帯確認
            const availableSlots = DOMUtils.getElements('td[data-gray-out] div[role="button"]:not([data-disabled])');
            if (availableSlots.length === 0) {
                return { canStart: false, reason: '利用可能な時間帯がありません' };
            }
            return { canStart: true };
        }
        catch (error) {
            return { canStart: false, reason: `確認エラー: ${error}` };
        }
    }
}

;// ./src-ts/features/entrance/ui-manager.ts
/**
 * 入場予約UI管理クラス
 */

class EntranceUIManager {
    constructor(config, callbacks) {
        this.monitorButtons = new Map();
        this.config = config;
        this.callbacks = callbacks;
    }
    /**
     * UI要素を作成・挿入
     */
    async createUI() {
        try {
            // メインボタンとステータス表示を作成
            await this.createMainButton();
            // 時間帯監視ボタンを作成
            if (this.config.enableTimeSlotMonitoring) {
                await this.createTimeSlotMonitorButtons();
            }
            console.log('入場予約UI作成完了');
        }
        catch (error) {
            console.error('入場予約UI作成エラー:', error);
            throw error;
        }
    }
    /**
     * メインボタン作成
     */
    async createMainButton() {
        // ボタン挿入位置を検索
        const targetArea = await DOMUtils.waitForElement('table, .main-content, #__next', { timeout: 10000 });
        if (!targetArea) {
            throw new Error('ボタン挿入位置が見つかりません');
        }
        // メインボタン作成
        this.mainButton = DOMUtils.createExtensionButton({
            text: '入場予約開始',
            onClick: () => this.handleMainButtonClick()
        });
        this.mainButton.id = 'ytomo-entrance-main-button';
        // ステータスバッジ作成
        this.statusBadge = DOMUtils.createElement({
            tag: 'span',
            className: ['ytomo-status-badge', 'idle'],
            textContent: ' 待機中'
        });
        // コンテナ作成
        const container = DOMUtils.createFlexContainer(['ytomo-entrance-container']);
        container.style.margin = '20px 0';
        container.style.padding = '15px';
        container.style.border = '2px solid #006821';
        container.style.borderRadius = '8px';
        container.style.backgroundColor = '#f8f9fa';
        // レイアウト構築
        container.appendChild(this.mainButton);
        container.appendChild(this.statusBadge);
        // 挿入
        DOMUtils.insertElement(container, targetArea, 'before');
    }
    /**
     * 時間帯監視ボタン作成
     */
    async createTimeSlotMonitorButtons() {
        // 満員の時間帯を検索
        const fullSlots = this.analyzeTimeSlots();
        if (fullSlots.length === 0) {
            console.log('満員の時間帯が見つかりません');
            return;
        }
        console.log(`${fullSlots.length}個の満員時間帯に監視ボタンを追加します`);
        // 各満員時間帯に監視ボタンを追加
        for (const slot of fullSlots) {
            this.addMonitorButtonToSlot(slot);
        }
    }
    /**
     * 時間帯分析
     */
    analyzeTimeSlots() {
        const fullSlots = [];
        const timeSlotButtons = DOMUtils.getElements('td[data-gray-out] div[role="button"][data-disabled="true"]');
        for (const button of timeSlotButtons) {
            try {
                const timeText = button.querySelector('dt span')?.textContent?.trim();
                if (!timeText)
                    continue;
                // アイコンで満員状態を確認
                const iconElement = button.querySelector('dd img');
                const isFull = iconElement?.src?.includes('calendar_ng.svg');
                if (isFull) {
                    const tdElement = button.closest('td[data-gray-out]');
                    if (tdElement) {
                        const slotInfo = {
                            timeText,
                            status: 'full',
                            tdSelector: this.generateUniqueTdSelector(tdElement),
                            rowIndex: this.getTdRowIndex(tdElement),
                            cellIndex: this.getTdCellIndex(tdElement),
                            buttonElement: button
                        };
                        fullSlots.push(slotInfo);
                    }
                }
            }
            catch (error) {
                console.warn('時間帯分析エラー:', error);
            }
        }
        return fullSlots;
    }
    /**
     * 時間帯に監視ボタンを追加
     */
    addMonitorButtonToSlot(slotInfo) {
        const monitorButton = DOMUtils.createElement({
            tag: 'button',
            className: ['ytomo-monitor-button'],
            textContent: '監視',
            attributes: {
                'data-time-slot': slotInfo.timeText
            }
        });
        monitorButton.addEventListener('click', () => {
            this.handleMonitorButtonClick(slotInfo, monitorButton);
        });
        // ボタンを時間帯要素に追加
        if (slotInfo.buttonElement) {
            slotInfo.buttonElement.parentElement?.appendChild(monitorButton);
            this.monitorButtons.set(slotInfo.timeText, monitorButton);
        }
    }
    /**
     * メインボタンクリック処理
     */
    async handleMainButtonClick() {
        try {
            if (this.mainButton?.textContent?.includes('停止')) {
                // 停止処理
                this.callbacks.onStopReservation();
            }
            else {
                // 開始処理
                await this.callbacks.onStartReservation();
            }
        }
        catch (error) {
            console.error('メインボタン処理エラー:', error);
            this.showErrorMessage(`操作エラー: ${error}`);
        }
    }
    /**
     * 監視ボタンクリック処理
     */
    async handleMonitorButtonClick(slotInfo, buttonElement) {
        try {
            if (buttonElement.textContent?.includes('停止')) {
                // 監視停止
                this.callbacks.onStopMonitoring();
            }
            else {
                // 監視開始
                await this.callbacks.onStartMonitoring(slotInfo);
            }
        }
        catch (error) {
            console.error('監視ボタン処理エラー:', error);
            this.showErrorMessage(`監視操作エラー: ${error}`);
        }
    }
    /**
     * メインボタン表示更新
     */
    updateMainButton(state, reservationState, monitoringState) {
        if (!this.mainButton || !this.statusBadge)
            return;
        let buttonText = '入場予約開始';
        let statusText = '待機中';
        let statusClass = 'idle';
        switch (state) {
            case 'loading':
                buttonText = '処理中...';
                statusText = '処理中';
                statusClass = 'loading';
                this.mainButton.disabled = true;
                break;
            case 'processing':
                if (reservationState?.isRunning) {
                    buttonText = '予約処理停止';
                    const attempts = reservationState.attempts;
                    const elapsedMinutes = reservationState.startTime ?
                        Math.floor((Date.now() - reservationState.startTime) / 60000) : 0;
                    statusText = `予約中 (${attempts}回試行, ${elapsedMinutes}分経過)`;
                    statusClass = 'reserving';
                }
                this.mainButton.disabled = false;
                break;
            case 'monitoring':
                if (monitoringState?.isMonitoring) {
                    buttonText = '監視中...';
                    const attempts = monitoringState.attempts;
                    const elapsedMinutes = monitoringState.startTime ?
                        Math.floor((Date.now() - monitoringState.startTime) / 60000) : 0;
                    statusText = `時間帯監視中 (${attempts}回, ${elapsedMinutes}分)`;
                    statusClass = 'monitoring';
                }
                this.mainButton.disabled = true;
                break;
            case 'error':
                buttonText = '入場予約開始';
                statusText = 'エラー発生';
                statusClass = 'error';
                this.mainButton.disabled = false;
                break;
            default:
                this.mainButton.disabled = false;
                break;
        }
        // ボタンテキスト更新
        const buttonSpan = this.mainButton.querySelector('span');
        if (buttonSpan) {
            buttonSpan.textContent = buttonText;
        }
        // ステータスバッジ更新
        this.statusBadge.textContent = statusText;
        this.statusBadge.className = `ytomo-status-badge ${statusClass}`;
    }
    /**
     * 監視ボタン更新
     */
    updateMonitorButton(timeSlot, isMonitoring) {
        const button = this.monitorButtons.get(timeSlot);
        if (!button)
            return;
        if (isMonitoring) {
            button.textContent = '停止';
            button.classList.add('monitoring');
        }
        else {
            button.textContent = '監視';
            button.classList.remove('monitoring');
        }
    }
    /**
     * エラーメッセージ表示
     */
    showErrorMessage(message) {
        // 既存のエラーメッセージを削除
        this.clearErrorMessage();
        // エラーメッセージ要素作成
        this.errorMessageElement = DOMUtils.createElement({
            tag: 'div',
            className: ['ytomo-error-message'],
            textContent: message
        });
        // メインボタンの後に挿入
        if (this.mainButton?.parentElement) {
            this.mainButton.parentElement.appendChild(this.errorMessageElement);
        }
        // 5秒後に自動削除
        setTimeout(() => this.clearErrorMessage(), 5000);
    }
    /**
     * エラーメッセージクリア
     */
    clearErrorMessage() {
        this.errorMessageElement?.remove();
        this.errorMessageElement = undefined;
    }
    /**
     * UI要素クリーンアップ
     */
    cleanup() {
        this.mainButton?.parentElement?.remove();
        this.clearErrorMessage();
        // 監視ボタンを削除
        for (const button of this.monitorButtons.values()) {
            button.remove();
        }
        this.monitorButtons.clear();
        this.mainButton = undefined;
        this.statusBadge = undefined;
    }
    /**
     * td要素の一意セレクタ生成
     */
    generateUniqueTdSelector(tdElement) {
        const table = tdElement.closest('table');
        if (!table)
            return '';
        const allTds = Array.from(table.querySelectorAll('td[data-gray-out]'));
        const index = allTds.indexOf(tdElement);
        return `table td[data-gray-out]:nth-child(${index + 1})`;
    }
    /**
     * td要素の行インデックス取得
     */
    getTdRowIndex(tdElement) {
        const row = tdElement.closest('tr');
        if (!row)
            return 0;
        const table = row.closest('table');
        if (!table)
            return 0;
        const rows = Array.from(table.querySelectorAll('tr'));
        return rows.indexOf(row);
    }
    /**
     * td要素の列インデックス取得
     */
    getTdCellIndex(tdElement) {
        const row = tdElement.closest('tr');
        if (!row)
            return 0;
        const cells = Array.from(row.querySelectorAll('td, th'));
        return cells.indexOf(tdElement);
    }
}

;// ./src-ts/features/entrance/entrance-service.ts
/**
 * 入場予約機能のメインサービス
 */




class EntranceService {
    constructor(config) {
        this.initialized = false;
        this.config = config;
        this.reservationState = {
            isRunning: false,
            startTime: null,
            attempts: 0
        };
        this.monitoringState = {
            isMonitoring: false,
            targetSlot: null,
            retryCount: 0,
            startTime: null,
            mode: 'idle',
            attempts: 0
        };
        this.monitoringEngine = new TimeSlotMonitoringEngine();
        this.reservationExecutor = new ReservationExecutor(config);
    }
    /**
     * サービス初期化
     */
    async initialize() {
        if (this.initialized) {
            console.warn('EntranceService は既に初期化されています');
            return;
        }
        try {
            this.log('初期化開始');
            // UIコールバック設定
            const callbacks = {
                onStartReservation: () => this.handleStartReservation(),
                onStopReservation: () => this.handleStopReservation(),
                onStartMonitoring: (timeSlot) => this.handleStartMonitoring(timeSlot),
                onStopMonitoring: () => this.handleStopMonitoring()
            };
            // UI管理初期化
            this.uiManager = new EntranceUIManager(this.config, callbacks);
            await this.uiManager.createUI();
            // イベントリスナー設定
            this.setupEventListeners();
            // キャッシュからの状態復元
            this.restoreFromCache();
            this.initialized = true;
            this.log('初期化完了');
        }
        catch (error) {
            console.error('EntranceService 初期化エラー:', error);
            throw error;
        }
    }
    /**
     * 予約開始処理
     */
    async handleStartReservation() {
        try {
            this.log('入場予約開始');
            this.updateUIState('loading');
            // 予約可能状態チェック
            const canStart = await this.reservationExecutor.canStartReservation();
            if (!canStart.canStart) {
                throw new Error(canStart.reason || '予約を開始できません');
            }
            // 予約実行
            this.updateUIState('processing');
            const success = await this.reservationExecutor.startReservation();
            if (success) {
                this.uiManager?.showErrorMessage('✅ 予約が完了しました！');
                this.updateUIState('idle');
            }
            else {
                throw new Error('予約処理が失敗しました');
            }
        }
        catch (error) {
            console.error('予約開始エラー:', error);
            this.uiManager?.showErrorMessage(`予約エラー: ${error}`);
            this.updateUIState('error');
        }
    }
    /**
     * 予約停止処理
     */
    handleStopReservation() {
        this.log('予約停止');
        this.reservationExecutor.stopReservation();
        this.updateUIState('idle');
    }
    /**
     * 監視開始処理
     */
    async handleStartMonitoring(timeSlot) {
        try {
            this.log(`時間帯監視開始: ${timeSlot.timeText}`);
            // 既存の監視を停止
            if (this.monitoringEngine.isCurrentlyMonitoring()) {
                this.monitoringEngine.stopMonitoringManual();
            }
            // 新しい監視を開始
            await this.monitoringEngine.startMonitoring(timeSlot);
            this.monitoringState = this.monitoringEngine.getMonitoringState();
            // UI更新
            this.updateUIState('monitoring');
            this.uiManager?.updateMonitorButton(timeSlot.timeText, true);
        }
        catch (error) {
            console.error('監視開始エラー:', error);
            this.uiManager?.showErrorMessage(`監視エラー: ${error}`);
        }
    }
    /**
     * 監視停止処理
     */
    handleStopMonitoring() {
        this.log('監視停止');
        const currentTarget = this.monitoringState.targetSlot;
        this.monitoringEngine.stopMonitoringManual();
        this.monitoringState = this.monitoringEngine.getMonitoringState();
        // UI更新
        this.updateUIState('idle');
        if (currentTarget) {
            this.uiManager?.updateMonitorButton(currentTarget.timeText, false);
        }
    }
    /**
     * イベントリスナー設定
     */
    setupEventListeners() {
        // 時間帯利用可能イベント
        document.addEventListener('timeSlotAvailable', (event) => {
            const timeSlot = event.detail.timeSlot;
            this.log(`利用可能時間帯検出: ${timeSlot.timeText}`);
            this.handleTimeSlotAvailable(timeSlot);
        });
        // 監視エラーイベント
        document.addEventListener('monitoringError', (event) => {
            const error = event.detail;
            this.log(`監視エラー: ${error.errorMessage}`);
            this.handleMonitoringError(error);
        });
    }
    /**
     * 時間帯利用可能時の処理
     */
    async handleTimeSlotAvailable(timeSlot) {
        this.log('利用可能時間帯を検出、自動予約を開始します');
        // 監視停止
        this.monitoringState = this.monitoringEngine.getMonitoringState();
        // 自動予約実行
        if (this.config.autoSelectFirstAvailable) {
            await this.reservationExecutor.startReservation(timeSlot);
        }
        this.updateUIState('processing');
    }
    /**
     * 監視エラー処理
     */
    handleMonitoringError(error) {
        this.monitoringState = this.monitoringEngine.getMonitoringState();
        this.uiManager?.showErrorMessage(`監視エラー: ${error.errorMessage}`);
        this.updateUIState('error');
    }
    /**
     * UI状態更新
     */
    updateUIState(state) {
        this.reservationState = this.reservationExecutor.getState();
        this.monitoringState = this.monitoringEngine.getMonitoringState();
        this.uiManager?.updateMainButton(state, this.reservationState, this.monitoringState);
    }
    /**
     * キャッシュから状態復元
     */
    restoreFromCache() {
        try {
            // 監視状態の復元
            const cachedMonitoringState = globalCache.get('monitoringState');
            const cachedTarget = globalCache.get('monitoringTarget');
            if (cachedMonitoringState && cachedTarget && cachedMonitoringState.isMonitoring) {
                this.log('キャッシュから監視状態を復元します');
                // 注意: ページリロード後の復元は複雑なため、ここでは状態の表示のみ
                this.monitoringState = cachedMonitoringState;
                this.updateUIState('monitoring');
            }
            // 予約状態の復元
            const cachedReservationState = globalCache.get('reservationState');
            if (cachedReservationState && cachedReservationState.isRunning) {
                this.log('キャッシュから予約状態を復元します');
                this.reservationState = cachedReservationState;
                this.updateUIState('processing');
            }
        }
        catch (error) {
            console.warn('キャッシュ復元エラー:', error);
        }
    }
    /**
     * クリーンアップ
     */
    async cleanup() {
        this.log('クリーンアップ開始');
        // 監視・予約停止
        this.monitoringEngine.stopMonitoringManual();
        this.reservationExecutor.stopReservation();
        // UI削除
        this.uiManager?.cleanup();
        this.uiManager = undefined;
        // キャッシュクリア
        globalCache.clear('monitoringTarget');
        globalCache.clear('monitoringState');
        globalCache.clear('reservationState');
        this.initialized = false;
        this.log('クリーンアップ完了');
    }
    /**
     * 現在の状態を取得
     */
    getStatus() {
        return {
            initialized: this.initialized,
            reservationState: this.reservationState,
            monitoringState: this.monitoringState,
            monitoringStats: this.monitoringEngine.getStats(),
            reservationStats: this.reservationExecutor.getStats(),
            config: this.config
        };
    }
    /**
     * デバッグ情報出力
     */
    debug() {
        this.log('=== EntranceService デバッグ情報 ===');
        this.log(JSON.stringify(this.getStatus(), null, 2));
    }
    /**
     * デバッグログ出力
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[EntranceService] ${message}`);
        }
    }
}

;// ./src-ts/styles/definitions.ts
/**
 * スタイル定義と管理
 */
class StyleManager {
    /**
     * スタイルをページに注入
     */
    static injectStyles() {
        // 既存のスタイルが存在する場合は削除
        const existingStyle = document.getElementById(this.STYLE_ID);
        if (existingStyle) {
            existingStyle.remove();
        }
        // 新しいスタイル要素を作成
        const styleElement = document.createElement('style');
        styleElement.id = this.STYLE_ID;
        styleElement.textContent = this.CSS_DEFINITIONS;
        // ヘッドに追加
        document.head.appendChild(styleElement);
    }
    /**
     * スタイルを削除
     */
    static removeStyles() {
        const styleElement = document.getElementById(this.STYLE_ID);
        if (styleElement) {
            styleElement.remove();
        }
    }
    /**
     * 動的スタイル追加
     */
    static addCustomStyle(css, id) {
        const styleId = id || `ytomo-custom-${Date.now()}`;
        const styleElement = document.createElement('style');
        styleElement.id = styleId;
        styleElement.textContent = css;
        document.head.appendChild(styleElement);
    }
}
StyleManager.STYLE_ID = 'ytomo-extension-styles';
StyleManager.CSS_DEFINITIONS = `
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

/* 時間帯監視機能のスタイル */
.ytomo-monitor-button {
    background: rgb(255, 140, 0) !important;
    color: white;
    font-size: 12px;
    padding: 2px 6px;
    margin: 2px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    min-width: 50px;
}

.ytomo-monitor-button:hover {
    background: rgb(255, 160, 30) !important;
}

.ytomo-monitor-button.monitoring {
    background: rgb(255, 69, 0) !important;
    animation: ytomo-pulse 1.5s infinite;
}

.ytomo-monitor-button.priority-high {
    background: rgb(220, 20, 60) !important;
}

.ytomo-monitor-button.priority-medium {
    background: rgb(255, 140, 0) !important;
}

.ytomo-monitor-button.priority-low {
    background: rgb(255, 215, 0) !important;
    color: black;
}

@keyframes ytomo-pulse {
    0% { opacity: 1; }
    50% { opacity: 0.6; }
    100% { opacity: 1; }
}

/* エラー表示スタイル */
.ytomo-error-message {
    background: rgb(220, 20, 60);
    color: white;
    padding: 10px;
    border-radius: 5px;
    margin: 10px 0;
    font-weight: bold;
    text-align: center;
}

/* 状態表示スタイル */
.ytomo-status-badge {
    display: inline-block;
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: bold;
    margin-left: 5px;
}

.ytomo-status-badge.idle {
    background: rgb(128, 128, 128);
    color: white;
}

.ytomo-status-badge.monitoring {
    background: rgb(255, 69, 0);
    color: white;
}

.ytomo-status-badge.reserving {
    background: rgb(34, 139, 34);
    color: white;
}

.ytomo-status-badge.loading {
    background: rgb(70, 130, 180);
    color: white;
}

/* カウントダウン表示 */
.ytomo-countdown {
    font-family: monospace;
    font-weight: bold;
    color: rgb(255, 140, 0);
}
`;

;// ./src-ts/core/app.ts
/**
 * メインアプリケーションクラス
 */




class App {
    constructor(config = {}) {
        this.config = {
            debug: false,
            enablePavilionFeatures: true,
            enableEntranceFeatures: true,
            ...config
        };
    }
    /**
     * アプリケーション開始
     */
    async start() {
        try {
            this.log('アプリケーション開始');
            // スタイル注入
            StyleManager.injectStyles();
            // 初期化コールバック設定
            const callbacks = {
                onPavilionPageReady: () => this.initializePavilionFeatures(),
                onEntrancePageReady: () => this.initializeEntranceFeatures(),
                onUnknownPage: () => this.log('未対応ページです')
            };
            // 自動初期化開始
            this.urlObserverCleanup = Initializer.setupAutoInitialization(callbacks);
            this.log('アプリケーション開始完了');
        }
        catch (error) {
            console.error('アプリケーション開始エラー:', error);
            throw error;
        }
    }
    /**
     * パビリオン機能初期化
     */
    async initializePavilionFeatures() {
        if (!this.config.enablePavilionFeatures) {
            this.log('パビリオン機能は無効化されています');
            return;
        }
        try {
            this.log('パビリオン機能初期化開始');
            this.pavilionService = new PavilionService({
                enable: true,
                autoLoadAll: true,
                enableSearch: true,
                enableCopy: true,
                debug: this.config.debug
            });
            await this.pavilionService.initialize();
            this.log('パビリオン機能初期化完了');
        }
        catch (error) {
            console.error('パビリオン機能初期化エラー:', error);
        }
    }
    /**
     * 入場予約機能初期化
     */
    async initializeEntranceFeatures() {
        if (!this.config.enableEntranceFeatures) {
            this.log('入場予約機能は無効化されています');
            return;
        }
        try {
            this.log('入場予約機能初期化開始');
            this.entranceService = new EntranceService({
                enable: true,
                retryInterval: 30000,
                maxRetries: 100,
                banPreventionDelay: 1000,
                enableTimeSlotMonitoring: true,
                autoSelectFirstAvailable: false,
                waitTimeConfig: {
                    minTime: 1000,
                    randomRange: 2000,
                    banPreventionDelay: 500
                },
                debug: this.config.debug
            });
            await this.entranceService.initialize();
            this.log('入場予約機能初期化完了');
        }
        catch (error) {
            console.error('入場予約機能初期化エラー:', error);
        }
    }
    /**
     * アプリケーション停止
     */
    async stop() {
        try {
            this.log('アプリケーション停止開始');
            // URL監視停止
            this.urlObserverCleanup?.();
            // サービス停止
            await this.pavilionService?.cleanup();
            await this.entranceService?.cleanup();
            this.log('アプリケーション停止完了');
        }
        catch (error) {
            console.error('アプリケーション停止エラー:', error);
        }
    }
    /**
     * 現在の状態取得
     */
    getStatus() {
        return {
            pavilionService: this.pavilionService?.getStatus(),
            entranceService: this.entranceService?.getStatus(),
            config: this.config
        };
    }
    /**
     * デバッグログ出力
     */
    log(message) {
        if (this.config.debug) {
            console.log(`[App] ${message}`);
        }
    }
}

;// ./src-ts/index.ts
/**
 * yt-Expo2025-Reservation-Helper
 * TypeScript版メインエントリーポイント
 *
 * @name         yt-Expo2025-Reservation-Helper
 * @namespace    http://staybrowser.com/
 * @version      0.3
 * @description  help expo2025 ticket site
 * @author       TomoTom0 https://github.com/TomoTom0
 * @match        https://ticket.expo2025.or.jp/event_search/*
 * @match        https://ticket.expo2025.or.jp/ticket_visiting_reservation/*
 * @grant       none
 * @run-at       document-end
 */

// グローバルなアプリケーションインスタンス
let app = null;
/**
 * アプリケーション開始
 */
async function startApplication() {
    try {
        console.log('[TypeScript版] ytomo extension 開始');
        app = new App({
            debug: false, // 本番環境では false
            enablePavilionFeatures: true,
            enableEntranceFeatures: true
        });
        await app.start();
    }
    catch (error) {
        console.error('[TypeScript版] アプリケーション開始エラー:', error);
    }
}
/**
 * アプリケーション停止（開発用）
 */
async function stopApplication() {
    if (app) {
        await app.stop();
        app = null;
        console.log('[TypeScript版] アプリケーション停止完了');
    }
}
/**
 * 現在のアプリケーション状態取得（開発用）
 */
function getApplicationStatus() {
    return app?.getStatus() || null;
}
// メイン実行
try {
    // DOM読み込み完了後に実行
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startApplication);
    }
    else {
        startApplication();
    }
    // 開発用: グローバルに関数を公開
    if (typeof window !== 'undefined') {
        window.ytomoExtension = {
            stop: stopApplication,
            getStatus: getApplicationStatus,
            restart: async () => {
                await stopApplication();
                await startApplication();
            }
        };
    }
}
catch (error) {
    console.error('[TypeScript版] ytomo extension エラー:', error);
}

/******/ })()
;