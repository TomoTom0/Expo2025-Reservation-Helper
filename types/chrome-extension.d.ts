// Chrome拡張・UserScript固有の型定義

// =========================================================================
// UserScript環境での拡張
// =========================================================================

declare global {
  // UserScript形式でのメタデータ
  interface UserScriptMetadata {
    name: string;
    namespace: string;
    version: string;
    description: string;
    author: string;
    match: string[];
    grant: string[];
    'run-at': string;
  }

  // MutationObserver のコールバック型を明確化
  type MutationCallback = (mutations: MutationRecord[], observer: MutationObserver) => void;

  // DOM関連のイベント型拡張  
  interface HTMLElement {
    // Chrome拡張でよく使用されるプロパティ
    innerText: string;
    textContent: string;
  }

  // カスタムイベント型
  interface CustomElementEvents {
    click: MouseEvent;
    change: Event;
    input: InputEvent;
  }
}

// =========================================================================  
// DOM拡張型定義（プロジェクト固有）
// =========================================================================

export interface ExtendedHTMLElement extends HTMLElement {
  // 大阪万博サイト固有の属性
  'data-gray-out'?: string;
  'aria-pressed'?: string;
  'role'?: string;
  'datetime'?: string;
}

export interface TimeSlotButton extends HTMLElement {
  'aria-pressed': 'true' | 'false';
  role: 'button';
}

export interface CalendarDateElement extends HTMLElement {
  datetime: string;
}

// =========================================================================
// ページ固有の型定義
// =========================================================================

export type PageType = 'pavilion_reservation' | 'entrance_reservation' | null;

export interface PageInfo {
  type: PageType;
  url: string;
  isReady: boolean;
}

// =========================================================================
// エラー型定義
// =========================================================================

export class TimeoutError extends Error {
  constructor(message: string, public timeout: number) {
    super(message);
    this.name = 'TimeoutError';
  }
}

export class ElementNotFoundError extends Error {
  constructor(message: string, public selector: string) {
    super(message);
    this.name = 'ElementNotFoundError';
  }
}

export class ReservationError extends Error {
  constructor(message: string, public attempts: number) {
    super(message);
    this.name = 'ReservationError';
  }
}

export {};