/**
 * ページ復帰システム
 * URLの直接保存ではなく、ページタイプと必要なパラメータを構造化して保存し、
 * 適切な手続きを経て元のページに復帰する
 */

import { getPageDetector } from './page-detector';
import { loggers } from '../utils/logger';

const logger = loggers.ui;

export interface PageInfo {
    pageType: string;
    parameters: Record<string, string>;
    timestamp: number;
}

export interface PageReturnConfig {
    pageType: string;
    targetUrl: string;
    requiredParams: string[];
}

class PageReturnSystem {
    private static readonly STORAGE_KEY = 'expo_page_return_info';
    
    /**
     * 現在のページ情報を解析して保存
     */
    static saveCurrentPageInfo(): PageInfo | null {
        try {
            const pageInfo = this.analyzeCurrentPage();
            if (pageInfo) {
                sessionStorage.setItem(this.STORAGE_KEY, JSON.stringify(pageInfo));
                logger.info('ページ情報を保存', pageInfo);
                return pageInfo;
            }
            return null;
        } catch (error) {
            logger.error('ページ情報保存エラー', error);
            return null;
        }
    }
    
    /**
     * 保存されたページ情報を取得
     */
    static getSavedPageInfo(): PageInfo | null {
        try {
            const saved = sessionStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
            return null;
        } catch (error) {
            logger.error('ページ情報取得エラー', error);
            return null;
        }
    }
    
    /**
     * 保存された情報に基づいてページに復帰
     */
    static async returnToSavedPage(): Promise<boolean> {
        const pageInfo = this.getSavedPageInfo();
        if (!pageInfo) {
            logger.warn('復帰用ページ情報がありません');
            return false;
        }
        
        try {
            const success = await this.executePageReturn(pageInfo);
            if (success) {
                // 復帰成功時は情報をクリア
                sessionStorage.removeItem(this.STORAGE_KEY);
                logger.info('ページ復帰完了');
            }
            return success;
        } catch (error) {
            logger.error('ページ復帰エラー', error);
            return false;
        }
    }
    
    /**
     * 現在のページを解析してPageInfoを生成
     */
    private static analyzeCurrentPage(): PageInfo | null {
        const url = window.location.href;
        const urlParams = new URLSearchParams(window.location.search);
        
        logger.debug('ページ解析中', { url });
        
        // 既存のページ検知システムを使用
        const pageDetector = getPageDetector();
        const pageInfo = pageDetector.extractPageInfo();
        
        logger.debug('既存システムでのページタイプ', { pageType: pageInfo.type });
        
        if (pageInfo.type === 'pavilion_search') {
            logger.info('パビリオン検索ページと判定');
            return {
                pageType: 'pavilion_search',
                parameters: {
                    id: urlParams.get('id') || '',
                    originalUrl: url
                },
                timestamp: Date.now()
            };
        }
        
        logger.warn('未対応のページタイプです', { url, detectedType: pageInfo.type });
        return null;
    }
    
    /**
     * ページタイプに応じた復帰手続きを実行
     */
    private static async executePageReturn(pageInfo: PageInfo): Promise<boolean> {
        logger.info('ページ復帰開始', { pageType: pageInfo.pageType, parameters: pageInfo.parameters });
        
        switch (pageInfo.pageType) {
            case 'pavilion_search':
                return await this.returnToPavilionSearch(pageInfo.parameters);
                
            default:
                logger.error('未対応のページタイプ', { pageType: pageInfo.pageType });
                return false;
        }
    }
    
    /**
     * パビリオン検索画面への復帰手続き
     */
    private static async returnToPavilionSearch(params: Record<string, string>): Promise<boolean> {
        try {
            const id = params['id'];
            if (!id) {
                logger.error('パビリオン検索復帰: idパラメータが不足');
                return false;
            }
            
            // まずチケット選択画面に遷移
            const ticketSelectionUrl = `https://ticket.expo2025.or.jp/ticket_selection/?screen_id=018&lottery=4&id=${id}`;
            logger.info('チケット選択画面に遷移', { ticketSelectionUrl });
            
            window.location.href = ticketSelectionUrl;
            
            // ページ遷移するので、ここでは成功とする
            // 実際の成功確認は遷移先で行う必要がある
            return true;
            
        } catch (error) {
            logger.error('パビリオン検索復帰エラー', error);
            return false;
        }
    }
    
    /**
     * 保存された情報をクリア
     */
    static clearSavedPageInfo(): void {
        sessionStorage.removeItem(this.STORAGE_KEY);
        logger.info('ページ復帰情報をクリア');
    }
}

export { PageReturnSystem };