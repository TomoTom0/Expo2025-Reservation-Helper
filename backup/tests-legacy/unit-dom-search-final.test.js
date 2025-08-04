const { 
    generateUniqueTdSelector,
    getTdPositionInfo,
    extractTdStatus
} = require('../src/index.js');

describe('Phase 2: DOM検索系', () => {
    describe('generateUniqueTdSelector', () => {
        test('基本機能テスト', () => {
            const mockTd = {
                parentElement: {
                    parentElement: {
                        children: [{}, {}]
                    },
                    children: [{}, {}]
                }
            };

            // Array.fromのモック
            const originalArrayFrom = Array.from;
            Array.from = jest.fn()
                .mockReturnValueOnce([{}, mockTd.parentElement])
                .mockReturnValueOnce([{}, mockTd]);

            mockTd.parentElement.parentElement.children.indexOf = jest.fn().mockReturnValue(1);
            mockTd.parentElement.children.indexOf = jest.fn().mockReturnValue(1);

            const result = generateUniqueTdSelector(mockTd);
            expect(result).toBe('table tr:nth-child(2) td:nth-child(2)[data-gray-out]');

            Array.from = originalArrayFrom;
        });
    });

    describe('getTdPositionInfo', () => {
        test('位置情報を正確に取得', () => {
            const mockTd = {
                parentElement: {
                    parentElement: { children: [{}, {}, {}] },
                    children: [{}, {}]
                }
            };

            const originalArrayFrom = Array.from;
            Array.from = jest.fn()
                .mockReturnValueOnce([{}, {}, mockTd.parentElement])
                .mockReturnValueOnce([{}, mockTd]);

            mockTd.parentElement.parentElement.children.indexOf = jest.fn().mockReturnValue(2);
            mockTd.parentElement.children.indexOf = jest.fn().mockReturnValue(1);

            const result = getTdPositionInfo(mockTd);
            expect(result).toEqual({ rowIndex: 2, cellIndex: 1 });

            Array.from = originalArrayFrom;
        });
    });

    describe('extractTdStatus', () => {
        test('null要素の処理', () => {
            expect(extractTdStatus(null)).toBe(null);
        });

        test('ボタン要素がない場合', () => {
            const mockTd = {
                querySelector: jest.fn().mockReturnValue(null)
            };
            expect(extractTdStatus(mockTd)).toBe(null);
        });

        test('基本的な状態抽出', () => {
            const mockButton = {
                hasAttribute: jest.fn().mockReturnValue(false),
                getAttribute: jest.fn().mockReturnValue('false'),
                querySelector: jest.fn().mockImplementation((sel) => {
                    if (sel === 'dt span') return { textContent: '10:00～10:30' };
                    return null;
                })
            };

            const mockTd = {
                querySelector: jest.fn().mockReturnValue(mockButton)
            };

            const result = extractTdStatus(mockTd);
            expect(result.timeText).toBe('10:00～10:30');
            expect(result.status).toBe('unknown');
        });
    });
});