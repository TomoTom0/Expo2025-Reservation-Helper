/**
 * ページ関連のユーティリティ関数
 * 循環import回避のための共通モジュール
 */

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
}

// URL判定とページタイプ識別
export const identify_page_type = (url: string): string | null => {
    try {
        const urlObj = new URL(url);
        const pathname = urlObj.pathname;
        
        if (pathname === '/ticket_visiting_reservation/') {
            return "entrance_reservation";
        } else if (pathname === '/event_search/') {
            return "pavilion_reservation";
        } else if (pathname === '/ticket_selection/') {
            return "ticket_selection";
        } else if (pathname === '/agent_ticket/') {
            return "agent_ticket";
        }
    } catch (error) {
        console.error(`URL解析エラー: ${error}`);
    }
    
    return null;
}