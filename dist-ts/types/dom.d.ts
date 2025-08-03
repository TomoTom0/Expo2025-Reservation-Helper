/**
 * DOM操作関連の型定義
 */
export interface ElementSearchOptions {
    timeout?: number;
    retryInterval?: number;
    required?: boolean;
    parent?: HTMLElement;
}
export interface DOMObserverOptions {
    childList?: boolean;
    subtree?: boolean;
    attributes?: boolean;
    attributeFilter?: string[];
    attributeOldValue?: boolean;
    characterData?: boolean;
    characterDataOldValue?: boolean;
}
export interface ElementPosition {
    rowIndex: number;
    cellIndex: number;
    selector: string;
}
export interface StyleInjectionOptions {
    id?: string;
    prepend?: boolean;
    parent?: HTMLElement;
}
export interface EventListenerConfig {
    element: HTMLElement;
    eventType: string;
    handler: EventListener;
    options?: boolean | AddEventListenerOptions;
}
export interface ElementCreationConfig {
    tag: string;
    className?: string[];
    id?: string;
    textContent?: string;
    innerHTML?: string;
    attributes?: Record<string, string>;
    style?: Partial<CSSStyleDeclaration>;
    parent?: HTMLElement;
    position?: 'append' | 'prepend' | 'after' | 'before';
    referenceElement?: HTMLElement;
}
export interface SelectorGenerationConfig {
    useId?: boolean;
    useClass?: boolean;
    usePosition?: boolean;
    maxDepth?: number;
    includeAttributes?: string[];
}
//# sourceMappingURL=dom.d.ts.map