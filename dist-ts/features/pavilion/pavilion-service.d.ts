/**
 * パビリオン機能のメインサービス
 */
import type { PavilionConfig, PavilionState } from '@/types';
export declare class PavilionService {
    private config;
    private state;
    private initialized;
    private uiComponents?;
    private filterEngine;
    private isLoadingAll;
    constructor(config: PavilionConfig);
    /**
     * サービス初期化
     */
    initialize(): Promise<void>;
    /**
     * すべて読み込み処理
     */
    private handleLoadAll;
    /**
     * 空きのみフィルタ処理
     */
    private handleFilterSafe;
    /**
     * 読み込みなしフィルタ処理
     */
    private handleFilterWithoutLoad;
    /**
     * 一覧コピー処理
     */
    private handleCopyList;
    /**
     * 検索入力処理（デバウンス付き）
     */
    private handleSearchInput;
    /**
     * 自動的にすべて読み込み
     */
    private loadMoreAuto;
    /**
     * データを再読み込み
     */
    private refreshData;
    /**
     * フィルタエンジンの状態から内部状態を更新
     */
    private updateStateFromFilter;
    /**
     * クリーンアップ
     */
    cleanup(): Promise<void>;
    /**
     * 現在の状態を取得
     */
    getStatus(): PavilionState & {
        initialized: boolean;
    };
    /**
     * デバッグ情報出力
     */
    debug(): void;
    /**
     * デバッグログ出力
     */
    private log;
}
//# sourceMappingURL=pavilion-service.d.ts.map