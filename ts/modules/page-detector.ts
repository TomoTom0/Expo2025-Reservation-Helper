/**
 * ページ検知・判定モジュール
 * 万博予約サイトの各ページを識別し、適切な処理を決定
 */

// ページタイプの定義
export type PageType = 
    | 'reservation_time'    // 時間選択ページ
    | 'confirmation'        // 確認ページ
    | 'pavilion_search'     // パビリオン検索ページ
    | 'unknown';           // 不明・非対応ページ

// ページ情報の構造
export interface PageInfo {
    type: PageType;
    url: string;
    pavilionCode?: string;
    ticketId?: string;
    isReady: boolean;
    title: string;
}

// URL パターンの定義
const URL_PATTERNS = {
    RESERVATION_TIME: /\/event_time\/\?.*event_id=([^&]+)/,
    CONFIRMATION: /\/confirm\//,
    PAVILION_SEARCH: /\/pavilion\/search/
} as const;

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
} as const;

export class PageDetector {
    private currentUrl: string;
    private currentTitle: string;

    constructor() {
        this.currentUrl = window.location.href;
        this.currentTitle = document.title;
    }

    /**
     * 現在のページタイプを検知
     */
    detectPageType(): PageType {
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
    isReservationPage(): boolean {
        return this.detectPageType() === 'reservation_time';
    }

    /**
     * 確認ページかどうか判定
     */
    isConfirmationPage(): boolean {
        return this.detectPageType() === 'confirmation';
    }

    /**
     * パビリオン検索ページかどうか判定
     */
    isPavilionSearchPage(): boolean {
        return this.detectPageType() === 'pavilion_search';
    }

    /**
     * ページ情報を抽出
     */
    extractPageInfo(): PageInfo {
        const pageType = this.detectPageType();
        const baseInfo: PageInfo = {
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
    private extractReservationPageInfo(): Partial<PageInfo> {
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
    private checkReservationPageReady(): boolean {
        const selectors = SELECTORS.RESERVATION_TIME;
        
        // 必要な要素が存在するかチェック
        const timeRadios = document.querySelectorAll(selectors.timeRadios);
        const submitButton = document.querySelector(selectors.submitButton);
        
        return timeRadios.length > 0 && submitButton !== null;
    }

    /**
     * 確認ページの準備状態をチェック
     */
    private checkConfirmationPageReady(): boolean {
        const selectors = SELECTORS.CONFIRMATION;
        return document.querySelector(selectors.confirmButton) !== null;
    }

    /**
     * パビリオン検索ページの準備状態をチェック
     */
    private checkPavilionSearchPageReady(): boolean {
        const selectors = SELECTORS.PAVILION_SEARCH;
        return document.querySelector(selectors.searchForm) !== null;
    }

    /**
     * ページが変更されたかチェック
     */
    hasPageChanged(): boolean {
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
    async waitForPageType(expectedType: PageType, timeout: number = 10000): Promise<boolean> {
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
    async waitForPageReady(timeout: number = 10000): Promise<boolean> {
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
    logPageInfo(): void {
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
let pageDetectorInstance: PageDetector | null = null;

/**
 * PageDetectorのシングルトンインスタンスを取得
 */
export function getPageDetector(): PageDetector {
    if (!pageDetectorInstance) {
        pageDetectorInstance = new PageDetector();
    }
    return pageDetectorInstance;
}

/**
 * PageDetectorインスタンスをリセット（ページ変更時用）
 */
export function resetPageDetector(): void {
    pageDetectorInstance = null;
}