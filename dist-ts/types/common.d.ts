/**
 * 共通型定義
 */
export type PageType = 'pavilion_reservation' | 'entrance_reservation' | 'unknown';
export interface BaseConfig {
    enable: boolean;
    debug?: boolean;
}
export interface WaitTimeConfig {
    minTime: number;
    randomRange: number;
    banPreventionDelay: number;
}
export interface CacheEntry<T> {
    value: T;
    timestamp: number;
    expiry?: number;
}
export interface UserScriptMeta {
    name: string;
    namespace: string;
    version: string;
    description: string;
    author: string;
    match: string[];
    grant: string;
    runAt: string;
}
export interface ElementSelector {
    selector: string;
    required?: boolean;
    timeout?: number;
}
export type ComponentState = 'idle' | 'loading' | 'processing' | 'monitoring' | 'error';
export interface StateManager<T> {
    get(): T;
    set(state: Partial<T>): void;
    reset(): void;
    subscribe(callback: (state: T) => void): () => void;
}
//# sourceMappingURL=common.d.ts.map