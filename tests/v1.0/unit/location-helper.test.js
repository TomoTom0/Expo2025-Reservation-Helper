/**
 * LocationHelper Unit Test
 * 位置管理ヘルパークラスの単体テスト
 * 
 * @version v1.0.0
 * @testTarget LocationHelper (entrance-reservation-state-manager.ts)
 */

const { TestExports } = require('../../../ts/modules/test-exports');
const { LocationHelper } = TestExports;

describe('LocationHelper', () => {
    describe('index <-> location 変換', () => {
        test('getLocationFromIndex: 0 -> east', () => {
            expect(LocationHelper.getLocationFromIndex(0)).toBe('east');
        });

        test('getLocationFromIndex: 1 -> west', () => {
            expect(LocationHelper.getLocationFromIndex(1)).toBe('west');
        });

        test('getLocationFromIndex: 無効値 -> east (default)', () => {
            expect(LocationHelper.getLocationFromIndex(2)).toBe('east');
            expect(LocationHelper.getLocationFromIndex(-1)).toBe('east');
            expect(LocationHelper.getLocationFromIndex(999)).toBe('east');
        });

        test('getIndexFromLocation: east -> 0', () => {
            expect(LocationHelper.getIndexFromLocation('east')).toBe(0);
        });

        test('getIndexFromLocation: west -> 1', () => {
            expect(LocationHelper.getIndexFromLocation('west')).toBe(1);
        });

        test('index <-> location 往復変換', () => {
            // 0 -> east -> 0
            const location0 = LocationHelper.getLocationFromIndex(0);
            expect(LocationHelper.getIndexFromLocation(location0)).toBe(0);
            
            // 1 -> west -> 1
            const location1 = LocationHelper.getLocationFromIndex(1);
            expect(LocationHelper.getIndexFromLocation(location1)).toBe(1);
        });
    });

    describe('CSS selector 解析', () => {
        test('getIndexFromSelector: nth-child解析', () => {
            expect(LocationHelper.getIndexFromSelector('td:nth-child(1)')).toBe(0);
            expect(LocationHelper.getIndexFromSelector('td:nth-child(2)')).toBe(1);
        });

        test('getIndexFromSelector: 複雑なセレクタ', () => {
            const selector1 = 'tr:nth-child(3) > td:nth-child(1)';
            expect(LocationHelper.getIndexFromSelector(selector1)).toBe(0);
            
            const selector2 = 'table > tbody > tr:nth-child(2) > td:nth-child(2)';
            expect(LocationHelper.getIndexFromSelector(selector2)).toBe(1);
        });

        test('getIndexFromSelector: 無効セレクタ -> 0 (default)', () => {
            expect(LocationHelper.getIndexFromSelector('')).toBe(0);
            expect(LocationHelper.getIndexFromSelector('invalid')).toBe(0);
            expect(LocationHelper.getIndexFromSelector('td:nth-child()')).toBe(0);
            expect(LocationHelper.getIndexFromSelector(null)).toBe(0);
            expect(LocationHelper.getIndexFromSelector(undefined)).toBe(0);
        });

        test('getIndexFromSelector: 大きなnth-child値', () => {
            expect(LocationHelper.getIndexFromSelector('td:nth-child(10)')).toBe(9);
            expect(LocationHelper.getIndexFromSelector('td:nth-child(100)')).toBe(99);
        });
    });

    describe('DOM要素からindex取得', () => {
        beforeEach(() => {
            // テーブル構造を作成
            const table = TestDOMHelper.createTimeSlotTable();
        });

        test('getIndexFromElement: 実際のDOM要素', () => {
            const row = document.querySelector('tr');
            const firstTd = row.children[0];
            const secondTd = row.children[1];
            
            expect(LocationHelper.getIndexFromElement(firstTd)).toBe(0);
            expect(LocationHelper.getIndexFromElement(secondTd)).toBe(1);
        });

        test('getIndexFromElement: 複数行での動作', () => {
            const rows = document.querySelectorAll('tr');
            const secondRowFirstTd = rows[1].children[0];
            const secondRowSecondTd = rows[1].children[1];
            
            expect(LocationHelper.getIndexFromElement(secondRowFirstTd)).toBe(0);
            expect(LocationHelper.getIndexFromElement(secondRowSecondTd)).toBe(1);
        });
    });

    describe('表示用文字列生成', () => {
        test('formatTargetInfo: 正常ケース', () => {
            expect(LocationHelper.formatTargetInfo('11:00-', 0)).toBe('east11:00-');
            expect(LocationHelper.formatTargetInfo('14:30-', 1)).toBe('west14:30-');
            expect(LocationHelper.formatTargetInfo('09:00-', 0)).toBe('east09:00-');
        });

        test('formatTargetInfo: 異なる時間帯フォーマット', () => {
            expect(LocationHelper.formatTargetInfo('09:30-', 0)).toBe('east09:30-');
            expect(LocationHelper.formatTargetInfo('16:00-', 1)).toBe('west16:00-');
        });

        test('formatTargetInfo: エッジケース', () => {
            expect(LocationHelper.formatTargetInfo('', 0)).toBe('east');
            expect(LocationHelper.formatTargetInfo('test', 1)).toBe('westtest');
        });
    });

    describe('時間帯・位置キー生成', () => {
        test('generateTimeLocationKey: 一意キー生成', () => {
            expect(LocationHelper.generateTimeLocationKey('11:00-', 0)).toBe('11:00-_0');
            expect(LocationHelper.generateTimeLocationKey('14:30-', 1)).toBe('14:30-_1');
        });

        test('generateTimeLocationKey: 一意性確認', () => {
            const key1 = LocationHelper.generateTimeLocationKey('11:00-', 0);
            const key2 = LocationHelper.generateTimeLocationKey('11:00-', 1);
            const key3 = LocationHelper.generateTimeLocationKey('14:30-', 0);
            
            expect(key1).not.toBe(key2);
            expect(key1).not.toBe(key3);
            expect(key2).not.toBe(key3);
        });

        test('generateTimeLocationKey: 同じ条件で同じキー', () => {
            const key1 = LocationHelper.generateTimeLocationKey('11:00-', 0);
            const key2 = LocationHelper.generateTimeLocationKey('11:00-', 0);
            
            expect(key1).toBe(key2);
        });
    });

    describe('統合動作テスト', () => {
        test('全メソッドの連携動作', () => {
            const timeSlot = '11:00-';
            const index = 0;
            const selector = 'td:nth-child(1)';
            
            // セレクタからindex取得
            const extractedIndex = LocationHelper.getIndexFromSelector(selector);
            expect(extractedIndex).toBe(index);
            
            // indexからlocation取得
            const location = LocationHelper.getLocationFromIndex(extractedIndex);
            expect(location).toBe('east');
            
            // 表示用文字列生成
            const displayText = LocationHelper.formatTargetInfo(timeSlot, extractedIndex);
            expect(displayText).toBe('east11:00-');
            
            // 一意キー生成
            const key = LocationHelper.generateTimeLocationKey(timeSlot, extractedIndex);
            expect(key).toBe('11:00-_0');
        });
    });
});