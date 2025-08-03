/**
 * ページタイプ検出クラス
 */
import type { PageType } from '@/types';
export declare class PageDetector {
    /**
     * 現在のURLからページタイプを判定
     */
    static detectPageType(url?: string): PageType;
    /**
     * パビリオン予約ページかどうか判定
     */
    static isPavilionPage(url?: string): boolean;
    /**
     * 入場予約ページかどうか判定
     */
    static isEntrancePage(url?: string): boolean;
    /**
     * ページ初期化可能かどうか判定（パビリオン）
     */
    static canInitializePavilionPage(): boolean;
    /**
     * ページ初期化可能かどうか判定（入場予約）
     */
    static canInitializeEntrancePage(): boolean;
    /**
     * URL変更を監視
     */
    static observeUrlChanges(callback: (newUrl: string, oldUrl: string) => void): () => void;
}
//# sourceMappingURL=page-detector.d.ts.map