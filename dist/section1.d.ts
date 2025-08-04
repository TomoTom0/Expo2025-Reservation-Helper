import type { ReservationConfig, ElementSearchResult, Dependencies } from '../types/index.js';
declare const insert_style: () => void;
declare const prepare_filter: (val_search: string) => {
    include: RegExp;
    exclude: RegExp[] | null;
};
declare const init_page: () => void;
declare const judge_init: () => boolean;
declare const judge_entrance_init: () => boolean;
declare const init_entrance_page: (dependencies?: Dependencies) => void;
declare function getRandomWaitTime(minTime: number, randomRange: number, config: ReservationConfig): number;
declare function waitForElement(selector: string, timeout: number, config: ReservationConfig): Promise<Element>;
declare function waitForAnyElement(selectors: Record<string, string>, timeout: number, selectorTexts: Record<string, string>, config: ReservationConfig): Promise<ElementSearchResult>;
declare function clickElement(element: Element, config: ReservationConfig): Promise<void>;
export { insert_style, prepare_filter, init_page, judge_init, judge_entrance_init, init_entrance_page, getRandomWaitTime, waitForElement, waitForAnyElement, clickElement };
