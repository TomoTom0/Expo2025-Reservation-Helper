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
     * チケットサイトかどうかをチェック
     */
    static isTicketSite(): boolean {
        return window.location.hostname === 'ticket.expo2025.or.jp';
    }

    /**
     * 入場予約ページかどうかをチェック
     */
    static isEntranceReservationPage(): boolean {
        return window.location.pathname === '/ticket_visiting_reservation/';
    }

    /**
     * パビリオン検索ページかどうかをチェック
     */
    static isPavilionSearchPage(): boolean {
        return window.location.pathname === '/event_search/';
    }

    /**
     * チケット選択ページかどうかをチェック
     */
    static isTicketSelectionPage(): boolean {
        return window.location.pathname === '/ticket_selection/';
    }

    /**
     * 代理チケットページかどうかをチェック
     */
    static isAgentTicketPage(): boolean {
        return window.location.pathname === '/agent_ticket/';
    }

    /**
     * ytomoページかどうかをチェック
     * ドメインの次のパス部分が「ytomo」であるかどうかで判定
     * スマホでのスラッシュ自動追加に対応
     */
    static isYtomoPage(): boolean {
        const pathname = window.location.pathname.toLowerCase();
        const pathSegments = pathname.split('/').filter(segment => segment.length > 0);

        // パスの最初のセグメントが「ytomo」であるかチェック
        return pathSegments.length > 0 && pathSegments[0] === 'ytomo';
    }

    /**
     * 待機室ページかどうかをチェック
     */
    static isWaitingRoomPage(): boolean {
        return window.location.hostname === 'tktwaitingroom.expo2025.or.jp';
    }
}

// URL判定とページタイプ識別
export const identify_page_type = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        const hostname = urlObj.hostname;
        const pathSegments = pathname.toLowerCase().split('/').filter(segment => segment.length > 0);

        if (hostname === 'tktwaitingroom.expo2025.or.jp') {
            return "waiting_room";
        } else if (pathname === '/ticket_visiting_reservation/') {
            return "entrance_reservation";
        } else if (pathname === '/event_search/') {
            return "pavilion_reservation";
        } else if (pathname === '/ticket_selection/') {
            return "ticket_selection";
        } else if (pathname === '/agent_ticket/') {
            return "agent_ticket";
        } else if (pathSegments.length > 0 && pathSegments[0] === 'ytomo') {
            return "ytomo_page";
        }
    } catch (error) {
        logger.error('URL解析エラー', error);
    }

    return null;
}