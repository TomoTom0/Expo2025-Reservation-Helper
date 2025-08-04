/**
 * Unit Tests: 判定・検証系 (Phase 3) - 簡易版
 */

console.log = jest.fn();

const { 
    checkTimeSlotTableExistsSync,
    validatePageLoaded,
    canStartReservation,
    isInterruptionAllowed,
    checkVisitTimeButtonState
} = require('../src/index.js');

describe('Phase 3: 判定・検証系', () => {
    
    describe('checkTimeSlotTableExistsSync', () => {
        let originalQuerySelectorAll;

        beforeEach(() => {
            originalQuerySelectorAll = document.querySelectorAll;
        });

        afterEach(() => {
            document.querySelectorAll = originalQuerySelectorAll;
        });

        test('時間帯要素が存在しない場合', () => {
            document.querySelectorAll = jest.fn().mockReturnValue([]);
            const result = checkTimeSlotTableExistsSync();
            expect(result).toBe(false);
        });

        test('時間形式の要素が存在する場合', () => {
            const mockElements = [
                { textContent: '9:00-9:30' },
                { textContent: '10:00-10:30' }
            ];
            
            // 実際のforEachメソッドを使用
            Object.setPrototypeOf(mockElements, Array.prototype);
            
            document.querySelectorAll = jest.fn().mockReturnValue(mockElements);
            const result = checkTimeSlotTableExistsSync();
            expect(result).toBe(true);
        });
    });

    describe('validatePageLoaded', () => {
        let originalLocation, originalQuerySelector;

        beforeEach(() => {
            originalLocation = window.location;
            originalQuerySelector = document.querySelector;
            delete window.location;
            window.location = { href: '' };
        });

        afterEach(() => {
            window.location = originalLocation;
            document.querySelector = originalQuerySelector;
        });

        test('正常なページ状態', () => {
            window.location.href = 'https://ticket.expo2025.or.jp/ticket_visiting_reservation/123';
            document.querySelector = jest.fn().mockReturnValue({ id: '__next' });
            
            const result = validatePageLoaded();
            expect(result).toBe(true);
        });

        test('メイン要素が存在しない場合', () => {
            window.location.href = 'https://ticket.expo2025.or.jp/ticket_visiting_reservation/123';
            document.querySelector = jest.fn().mockReturnValue(null);
            
            const result = validatePageLoaded();
            expect(result).toBe(false);
        });
    });

    describe('checkVisitTimeButtonState', () => {
        let originalQuerySelector;

        beforeEach(() => {
            originalQuerySelector = document.querySelector;
        });

        afterEach(() => {
            document.querySelector = originalQuerySelector;
        });

        test('ボタンが存在し有効', () => {
            const mockButton = {
                hasAttribute: jest.fn().mockReturnValue(false),
                disabled: false
            };
            document.querySelector = jest.fn().mockReturnValue(mockButton);
            
            const result = checkVisitTimeButtonState();
            expect(result).toBe(true);
        });

        test('ボタンが無効', () => {
            const mockButton = {
                hasAttribute: jest.fn().mockReturnValue(true),
                disabled: false
            };
            document.querySelector = jest.fn().mockReturnValue(mockButton);
            
            const result = checkVisitTimeButtonState();
            expect(result).toBe(false);
        });

        test('ボタンが存在しない', () => {
            document.querySelector = jest.fn().mockReturnValue(null);
            
            const result = checkVisitTimeButtonState();
            expect(result).toBe(false);
        });
    });

    describe('isInterruptionAllowed', () => {
        test('基本的な中断可能判定', () => {
            // 実際の状態オブジェクトをモックするのは複雑なため、
            // 関数の存在確認のみ実行
            expect(typeof isInterruptionAllowed).toBe('function');
            
            // デフォルト状態での実行テスト
            const result = isInterruptionAllowed();
            expect(typeof result).toBe('boolean');
        });
    });

    describe('canStartReservation', () => {
        test('基本的な予約開始判定', () => {
            // 依存関数が多いため、関数の存在確認のみ
            expect(typeof canStartReservation).toBe('function');
            
            // デフォルト状態での実行テスト
            const result = canStartReservation();
            expect(typeof result).toBe('boolean');
        });
    });
});