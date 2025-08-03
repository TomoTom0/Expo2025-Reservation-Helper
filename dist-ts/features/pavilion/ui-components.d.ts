/**
 * パビリオン機能のUIコンポーネント
 */
export interface PavilionUICallbacks {
    onLoadAll: () => void;
    onFilterSafe: () => void;
    onFilterWithoutLoad: (searchText: string) => void;
    onCopyList: () => void;
    onSearchInput: (searchText: string) => void;
}
export declare class PavilionUIComponents {
    private callbacks;
    private searchInput?;
    private loadAllButton?;
    private filterSafeButton?;
    private filterWithoutLoadButton?;
    private copyListButton?;
    private mainContainer?;
    private searchContainer?;
    constructor(callbacks: PavilionUICallbacks);
    /**
     * UI要素を挿入
     */
    insertUI(): Promise<void>;
    /**
     * すべて読み込みボタンの状態更新
     */
    updateLoadAllButton(isLoading: boolean): void;
    /**
     * 絞込ボタンの状態更新
     */
    updateFilterButton(isFiltering: boolean): void;
    /**
     * 空きのみボタンの状態更新
     */
    updateSafeFilterButton(isActive: boolean): void;
    /**
     * 現在の検索テキスト取得
     */
    getSearchText(): string;
    /**
     * 検索テキスト設定
     */
    setSearchText(text: string): void;
    /**
     * UI要素をクリーンアップ
     */
    cleanup(): void;
    /**
     * ボタンが存在するかチェック
     */
    isInitialized(): boolean;
}
//# sourceMappingURL=ui-components.d.ts.map