/**
 * v1.0.0対応テストセットアップ
 * TypeScript + webpack統合後の新しい構造に対応したテスト環境
 * 
 * @version v1.0.0
 * @testEnvironment jsdom
 */

// === Global Mocks ===

/**
 * Web Audio API Mock
 * AudioPlayer.tsの音声機能テスト用
 */
global.AudioContext = class MockAudioContext {
    constructor() {
        this.currentTime = Date.now() / 1000;
        this.destination = { connect: jest.fn() };
    }
    
    createOscillator() {
        return {
            type: 'square',
            frequency: { value: 440 },
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
        };
    }
    
    createGain() {
        return {
            gain: {
                setValueAtTime: jest.fn(),
                exponentialRampToValueAtTime: jest.fn()
            },
            connect: jest.fn()
        };
    }
};

global.webkitAudioContext = global.AudioContext;

/**
 * Chrome Extension API Mock
 * 拡張機能のstorage API等のモック
 */
global.chrome = {
    storage: {
        local: {
            get: jest.fn((keys, callback) => {
                // 基本的な設定を返す
                const mockData = {
                    'ytomo-efficiency-mode': JSON.stringify({ enabled: true }),
                    'ytomo-notification-sound': JSON.stringify({ enabled: true })
                };
                callback(mockData);
            }),
            set: jest.fn((obj, callback) => callback && callback()),
            remove: jest.fn((keys, callback) => callback && callback())
        }
    },
    runtime: {
        getURL: jest.fn(path => `chrome-extension://mock-id/${path}`)
    }
};

// === DOM Environment Setup ===

/**
 * 万博サイト環境のシミュレーション
 * 実際のURL構造を模したlocation設定
 */
Object.defineProperty(window, 'location', {
    value: {
        href: 'https://ticket.expo2025.or.jp/ticket_visiting_reservation?reserve_id=test123',
        origin: 'https://ticket.expo2025.or.jp',
        hostname: 'ticket.expo2025.or.jp',
        pathname: '/ticket_visiting_reservation',
        search: '?reserve_id=test123',
        reload: jest.fn()
    },
    writable: true
});

/**
 * localStorage Mock (改良版)
 * 実際のlocalStorage挙動を忠実に再現
 */
const localStorageMock = (() => {
    let store = {
        // デフォルト設定値
        'ytomo-efficiency-mode': JSON.stringify({ enabled: true }),
        'ytomo-notification-sound': JSON.stringify({ enabled: true })
    };
    
    return {
        getItem: jest.fn(key => store[key] || null),
        setItem: jest.fn((key, value) => { 
            store[key] = value.toString(); 
        }),
        removeItem: jest.fn(key => { 
            delete store[key]; 
        }),
        clear: jest.fn(() => { 
            store = {}; 
        }),
        key: jest.fn(index => Object.keys(store)[index] || null),
        get length() { 
            return Object.keys(store).length; 
        },
        // テスト用ヘルパー
        __getMockStore: () => store,
        __setMockStore: (newStore) => { store = newStore; }
    };
})();

Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
});

/**
 * MutationObserver Mock
 * DOM変更監視機能のモック
 */
global.MutationObserver = class MockMutationObserver {
    constructor(callback) {
        this.callback = callback;
        this.isObserving = false;
    }
    
    observe(target, options) { 
        this.isObserving = true;
        this.target = target;
        this.options = options;
    }
    
    disconnect() { 
        this.isObserving = false;
    }
    
    takeRecords() { 
        return []; 
    }
    
    // テスト用ヘルパー: 変更を手動でトリガー
    __triggerChange(mutations = []) {
        if (this.callback && this.isObserving) {
            this.callback(mutations, this);
        }
    }
};

/**
 * setTimeout/setInterval Mock (Jest内蔵のタイマーモックを使用)
 */
jest.useFakeTimers();

/**
 * URL constructor Mock
 * URL操作のテスト用
 */
if (typeof URL === 'undefined') {
    global.URL = class MockURL {
        constructor(url) {
            const parts = url.split('?');
            this.href = url;
            this.pathname = parts[0].replace(/^https?:\/\/[^\/]+/, '');
            this.searchParams = new Map();
            
            if (parts[1]) {
                parts[1].split('&').forEach(param => {
                    const [key, value] = param.split('=');
                    this.searchParams.set(key, decodeURIComponent(value || ''));
                });
            }
        }
    };
}

// === Test Utilities ===

/**
 * DOM テストヘルパー
 * 実際の万博サイト構造を模したDOM生成
 */
global.TestDOMHelper = {
    /**
     * 時間帯選択テーブルを作成
     * 実際のサイト: data-gray-out属性付きtd要素
     */
    createTimeSlotTable() {
        const table = document.createElement('table');
        table.className = 'time-slot-table';
        table.innerHTML = `
            <tbody>
                <tr>
                    <td data-gray-out="" class="time-slot available">09:00-</td>
                    <td data-gray-out="" class="time-slot available">09:00-</td>
                </tr>
                <tr>
                    <td data-gray-out="" class="time-slot selected">11:00-</td>  
                    <td data-gray-out="" class="time-slot available">11:00-</td>
                </tr>
                <tr>
                    <td data-gray-out="" class="time-slot full">14:30-</td>
                    <td data-gray-out="" class="time-slot available">14:30-</td>
                </tr>
            </tbody>
        `;
        document.body.appendChild(table);
        return table;
    },
    
    /**
     * カレンダー選択UIを作成
     */
    createCalendar() {
        const calendar = document.createElement('div');
        calendar.className = 'calendar-container';
        calendar.innerHTML = `
            <div class="calendar-day selected" data-date="2025-04-15">15</div>
            <div class="calendar-day" data-date="2025-04-16">16</div>
            <div class="calendar-day" data-date="2025-04-17">17</div>
        `;
        document.body.appendChild(calendar);
        return calendar;
    },
    
    /**
     * 来場日時ボタンを作成
     */
    createVisitTimeButton() {
        const button = document.createElement('button');
        button.className = 'basic-btn type2 style_full__ptzZq';
        button.textContent = '来場日時を選択';
        button.disabled = false;
        document.body.appendChild(button);
        return button;
    },
    
    /**
     * DOM要素を完全にクリア
     */
    cleanup() {
        document.body.innerHTML = '';
        document.head.innerHTML = '';
    },
    
    /**
     * 特定の要素を安全に削除
     */
    safeRemove(selector) {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    }
};

// === Console Management ===

/**
 * Console spy setup
 * テスト出力をクリーンに保つ
 */
const originalConsole = { ...console };

global.TestConsole = {
    silence() {
        jest.spyOn(console, 'log').mockImplementation(() => {});
        jest.spyOn(console, 'warn').mockImplementation(() => {});
        jest.spyOn(console, 'error').mockImplementation(() => {});
    },
    
    restore() {
        jest.restoreAllMocks();
    },
    
    capture() {
        const logs = [];
        jest.spyOn(console, 'log').mockImplementation((...args) => logs.push(['log', ...args]));
        jest.spyOn(console, 'warn').mockImplementation((...args) => logs.push(['warn', ...args]));
        jest.spyOn(console, 'error').mockImplementation((...args) => logs.push(['error', ...args]));
        return logs;
    }
};

// === Error Boundary ===

/**
 * 予期しないエラーをキャッチ
 */
global.addEventListener('error', (event) => {
    console.error('Uncaught error in test:', event.error);
});

global.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection in test:', event.reason);
});

// === Test Lifecycle ===

/**
 * 各テスト前の初期化
 */
beforeEach(() => {
    // DOM完全クリーンアップ
    document.body.innerHTML = '';
    document.head.innerHTML = '<title>Test</title>';
    
    // localStorage リセット（デフォルト値で初期化）
    localStorageMock.__setMockStore({
        'ytomo-efficiency-mode': JSON.stringify({ enabled: true }),
        'ytomo-notification-sound': JSON.stringify({ enabled: true })
    });
    
    // Mock 関数リセット
    jest.clearAllMocks();
    
    // Timer リセット
    jest.clearAllTimers();
    
    // Console spy デフォルト設定（詳細ログは抑制）
    TestConsole.silence();
});

/**
 * 各テスト後のクリーンアップ
 */
afterEach(() => {
    // DOM クリーンアップ
    TestDOMHelper.cleanup();
    
    // Console spy 復元
    TestConsole.restore();
    
    // Timer クリーンアップ（フェイクタイマーが有効な場合のみ）
    try {
        if (jest.isMockFunction(setTimeout)) {
            jest.runOnlyPendingTimers();
        }
    } catch (e) {
        // フェイクタイマーが無効な場合は無視
    }
    
    // 実タイマーに戻す（すでに実タイマーの場合も安全）
    jest.useRealTimers();
    
    // 全Mock復元
    jest.restoreAllMocks();
});

// === Test Timeout ===
jest.setTimeout(10000);

// テストセットアップ完了ログ
console.log('🧪 v1.0.0テスト環境セットアップ完了');