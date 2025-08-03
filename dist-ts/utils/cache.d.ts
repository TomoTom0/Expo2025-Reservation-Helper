/**
 * キャッシュ管理ユーティリティ
 */
export declare class CacheManager {
    private storage;
    private readonly keyPrefix;
    constructor(prefix?: string);
    /**
     * 値をキャッシュに保存
     */
    set<T>(key: string, value: T, expiryMs?: number): void;
    /**
     * キャッシュから値を取得
     */
    get<T>(key: string): T | null;
    /**
     * キャッシュエントリを削除
     */
    clear(key: string): void;
    /**
     * すべてのキャッシュをクリア
     */
    clearAll(): void;
    /**
     * キャッシュエントリが存在するかチェック
     */
    has(key: string): boolean;
    /**
     * キャッシュエントリのタイムスタンプを取得
     */
    getTimestamp(key: string): number | null;
    /**
     * キャッシュエントリの残り有効時間を取得（ミリ秒）
     */
    getTimeToExpiry(key: string): number | null;
    /**
     * 期限切れエントリをクリーンアップ
     */
    cleanup(): void;
    /**
     * キャッシュ統計情報を取得
     */
    getStats(): {
        totalEntries: number;
        validEntries: number;
        expiredEntries: number;
        memoryUsage: number;
    };
    /**
     * フルキー生成
     */
    private getFullKey;
    /**
     * メモリ使用量の概算
     */
    private estimateMemoryUsage;
}
export declare const globalCache: CacheManager;
//# sourceMappingURL=cache.d.ts.map