/**
 * Jest テスト環境セットアップ
 * jsdom環境でのDOM操作テストのための初期設定
 */

// jsdom環境での基本的なブラウザAPI設定
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://ticket.expo2025.or.jp/ticket_visiting_reservation?reserve_id=test123',
    origin: 'https://ticket.expo2025.or.jp',
    pathname: '/ticket_visiting_reservation',
    search: '?reserve_id=test123'
  },
  writable: true
});

// localStorage モック
const localStorageMock = {
  getItem: jest.fn(() => null), // デフォルトでnullを返す
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  key: jest.fn(),
  length: 0
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// console のスパイ設定（テスト出力をクリーンに）
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// DOM操作のためのヘルパー関数
global.createMockDOM = () => {
  document.body.innerHTML = '';
  return document;
};

// MutationObserver モック
global.MutationObserver = class {
  constructor(callback) {
    this.callback = callback;
  }
  
  observe() {
    // モック実装
  }
  
  disconnect() {
    // モック実装
  }
};

// URL constructor モック
global.URL = class {
  constructor(url) {
    const parts = url.split('?');
    this.href = url;
    this.pathname = parts[0].replace(/^https?:\/\/[^\/]+/, '');
    this.searchParams = new Map();
    
    if (parts[1]) {
      parts[1].split('&').forEach(param => {
        const [key, value] = param.split('=');
        this.searchParams.set(key, value);
      });
    }
  }
};

// テスト実行前のクリーンアップ
beforeEach(() => {
  document.body.innerHTML = '';
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

// テスト実行後のクリーンアップ
afterEach(() => {
  jest.clearAllMocks();
});