/**
 * 初期化管理クラス
 */
export interface InitializationCallbacks {
    onPavilionPageReady?: () => void;
    onEntrancePageReady?: () => void;
    onUnknownPage?: () => void;
}
export declare class Initializer {
    private static readonly INIT_CHECK_INTERVAL;
    private static readonly MAX_INIT_ATTEMPTS;
    /**
     * ページタイプに基づいた初期化トリガー
     */
    static triggerInitialization(url: string, callbacks: InitializationCallbacks): void;
    /**
     * パビリオンページの準備完了を待機
     */
    private static waitForPavilionPageReady;
    /**
     * 入場予約ページの準備完了を待機
     */
    private static waitForEntrancePageReady;
    /**
     * URL変更監視と自動初期化
     */
    static setupAutoInitialization(callbacks: InitializationCallbacks): () => void;
}
//# sourceMappingURL=initializer.d.ts.map