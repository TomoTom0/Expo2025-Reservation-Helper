/**
 * パビリオンフィルタエンジン
 */
import type { PavilionItem } from '@/types';
export declare class PavilionFilterEngine {
    private currentFilter;
    private safeFilterActive;
    private allItems;
    /**
     * すべてのパビリオンアイテムを取得・キャッシュ
     */
    refreshAllItems(): Promise<PavilionItem[]>;
    /**
     * LI要素からパビリオン情報を抽出
     */
    private extractPavilionItem;
    /**
     * 検索フィルタを適用
     */
    applySearchFilter(searchText: string): number;
    /**
     * 空きのみフィルタを切り替え
     */
    toggleSafeFilter(): boolean;
    /**
     * すべてのフィルタをクリア
     */
    clearAllFilters(): void;
    /**
     * 表示状態を更新
     */
    private updateVisibility;
    /**
     * 現在表示されているアイテム数を取得
     */
    getVisibleItemCount(): number;
    /**
     * 現在表示されているアイテムを取得
     */
    getVisibleItems(): PavilionItem[];
    /**
     * 空きのあるアイテムのみを取得
     */
    getAvailableItems(): PavilionItem[];
    /**
     * フィルタ状態の取得
     */
    getFilterStatus(): {
        hasSearchFilter: boolean;
        safeFilterActive: boolean;
        totalItems: number;
        visibleItems: number;
        availableItems: number;
    };
    /**
     * アイテムリストをコピー用テキストに変換
     */
    generateCopyText(onlyVisible?: boolean): string;
    /**
     * デバッグ情報出力
     */
    debugInfo(): void;
}
//# sourceMappingURL=filter-engine.d.ts.map