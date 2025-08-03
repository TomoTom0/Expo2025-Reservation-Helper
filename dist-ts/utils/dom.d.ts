/**
 * DOM操作ユーティリティ
 */
import type { ElementSearchOptions, ElementCreationConfig } from '@/types';
export declare class DOMUtils {
    /**
     * 要素を待機して取得
     */
    static waitForElement<T extends HTMLElement = HTMLElement>(selector: string, options?: ElementSearchOptions): Promise<T | null>;
    /**
     * 複数の要素を取得
     */
    static getElements<T extends HTMLElement = HTMLElement>(selector: string, parent?: HTMLElement | Document): T[];
    /**
     * 要素作成
     */
    static createElement<T extends HTMLElement = HTMLElement>(config: ElementCreationConfig): T;
    /**
     * 要素の挿入
     */
    static insertElement(element: HTMLElement, parent: HTMLElement, position?: 'append' | 'prepend' | 'after' | 'before', reference?: HTMLElement): void;
    /**
     * ボタン作成（万博拡張用スタイル）
     */
    static createExtensionButton(config: {
        text: string;
        onClick: () => void;
        className?: string[];
        disabled?: boolean;
    }): HTMLButtonElement;
    /**
     * 検索入力フィールド作成
     */
    static createSearchInput(config: {
        placeholder: string;
        onInput: (value: string) => void;
        className?: string[];
    }): HTMLInputElement;
    /**
     * Flexコンテナ作成
     */
    static createFlexContainer(className?: string[]): HTMLDivElement;
    /**
     * 要素の表示/非表示切り替え
     */
    static toggleVisibility(element: HTMLElement, visible: boolean): void;
    /**
     * 要素のクリーンアップ
     */
    static cleanup(selector: string, parent?: HTMLElement | Document): void;
    /**
     * スクロール位置を保持しながらの処理実行
     */
    static preserveScroll<T>(callback: () => Promise<T>): Promise<T>;
    /**
     * 要素が画面内に表示されているかチェック
     */
    static isElementVisible(element: HTMLElement): boolean;
    /**
     * デバウンス処理
     */
    static debounce<T extends (...args: any[]) => void>(func: T, wait: number): (...args: Parameters<T>) => void;
}
//# sourceMappingURL=dom.d.ts.map