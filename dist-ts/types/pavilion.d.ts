/**
 * パビリオン関連の型定義
 */
import type { BaseConfig } from './common';
export interface FilterCriteria {
    include: RegExp;
    exclude: RegExp | null;
}
export interface PavilionItem {
    element: HTMLElement;
    title: string;
    availability: string;
    isAvailable: boolean;
    url?: string;
}
export interface FilterToken {
    type: 'include' | 'exclude' | 'phrase' | 'or';
    value: string;
    regex?: RegExp;
}
export interface PavilionConfig extends BaseConfig {
    autoLoadAll: boolean;
    enableSearch: boolean;
    enableCopy: boolean;
}
export interface PavilionState {
    isLoading: boolean;
    totalItems: number;
    availableItems: number;
    currentFilter: string;
    lastUpdate: number;
}
export interface ButtonConfig {
    text: string;
    className: string[];
    style?: Partial<CSSStyleDeclaration>;
    onClick: () => void;
}
export interface SearchInputConfig {
    placeholder: string;
    className: string[];
    onInput: (value: string) => void;
}
//# sourceMappingURL=pavilion.d.ts.map