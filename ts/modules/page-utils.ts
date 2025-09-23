/**
 * ページ関連のユーティリティ関数
 * 循環import回避のための共通モジュール
 */

import { loggers } from '../utils/logger';
const logger = loggers.automation;

/**
 * ページチェッカー
 */
export class PageChecker {
    /**
     * URLからホスト名とパス名を取得
     */
    private static getUrlInfo(url?: string): { hostname: string; pathname: string } {
        if (url) {
            const urlObj = new URL(url);
            return { hostname: urlObj.hostname, pathname: urlObj.pathname };
        }
        return { hostname: window.location.hostname, pathname: window.location.pathname };
    }

    /**
     * チケットサイトかどうかをチェック
     */
    static isTicketSite(url?: string): boolean {
        const { hostname } = this.getUrlInfo(url);
        return hostname === 'ticket.expo2025.or.jp';
    }

    /**
     * 入場予約ページかどうかをチェック
     */
    static isEntranceReservationPage(url?: string): boolean {
        const { pathname } = this.getUrlInfo(url);
        return pathname === '/ticket_visiting_reservation/';
    }

    /**
     * パビリオン検索ページかどうかをチェック
     */
    static isPavilionSearchPage(url?: string): boolean {
        const { pathname } = this.getUrlInfo(url);
        return pathname === '/event_search/';
    }

    /**
     * チケット選択ページかどうかをチェック
     */
    static isTicketSelectionPage(url?: string): boolean {
        const { pathname } = this.getUrlInfo(url);
        return pathname === '/ticket_selection/';
    }

    /**
     * 代理チケットページかどうかをチェック
     */
    static isAgentTicketPage(url?: string): boolean {
        const { pathname } = this.getUrlInfo(url);
        return pathname === '/agent_ticket/';
    }

    /**
     * ytomoページかどうかをチェック
     * ドメインの次のパス部分が「ytomo」であるかどうかで判定
     * スマホでのスラッシュ自動追加に対応
     */
    static isYtomoPage(url?: string): boolean {
        const { pathname } = this.getUrlInfo(url);
        const pathSegments = pathname.toLowerCase().split('/').filter(segment => segment.length > 0);
        return pathSegments.length > 0 && pathSegments[0] === 'ytomo';
    }

    /**
     * 待機室ページかどうかをチェック
     */
    static isWaitingRoomPage(url?: string): boolean {
        const { hostname } = this.getUrlInfo(url);
        return hostname === 'tktwaitingroom.expo2025.or.jp';
    }

    /**
     * ページタイプを取得
     */
    static getPageType(url?: string): string | null {
        if (this.isWaitingRoomPage(url)) return 'waiting_room';
        if (this.isEntranceReservationPage(url)) return 'entrance_reservation';
        if (this.isPavilionSearchPage(url)) return 'pavilion_reservation';
        if (this.isTicketSelectionPage(url)) return 'ticket_selection';
        if (this.isAgentTicketPage(url)) return 'agent_ticket';
        if (this.isYtomoPage(url)) return 'ytomo_page';
        return null;
    }

    /**
     * 指定されたページタイプかどうかをチェック
     */
    static isPageType(pageType: string, url?: string): boolean {
        return this.getPageType(url) === pageType;
    }
}

