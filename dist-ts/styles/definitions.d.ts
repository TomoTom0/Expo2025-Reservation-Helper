/**
 * スタイル定義と管理
 */
export declare class StyleManager {
    private static readonly STYLE_ID;
    private static readonly CSS_DEFINITIONS;
    /**
     * スタイルをページに注入
     */
    static injectStyles(): void;
    /**
     * スタイルを削除
     */
    static removeStyles(): void;
    /**
     * 動的スタイル追加
     */
    static addCustomStyle(css: string, id?: string): void;
}
//# sourceMappingURL=definitions.d.ts.map