/**
 * Unit Tests: 純粋関数・重要ロジック (Phase 1)
 * 分割作業での依存関係の要となる関数群
 */

// console.logをモック化してテスト出力をクリーンに
console.log = jest.fn();

const indexModule = require('../src/index.js');
const { 
    extractTimeSlotInfo,
    getMonitorButtonText,
    getCurrentMode,
    getRandomWaitTime,
    identify_page_type,
    generateSelectorForElement
} = indexModule;

describe('【Unit Test Phase 1】純粋関数・重要ロジック', () => {

    describe('extractTimeSlotInfo() - DOM要素解析ロジック', () => {
        let mockButtonElement, mockTdElement, mockTimeSpan;

        beforeEach(() => {
            // DOM要素のモック作成
            mockTimeSpan = {
                textContent: '10:00～10:30'
            };
            
            mockTdElement = {
                getAttribute: jest.fn()
            };
            
            mockButtonElement = {
                closest: jest.fn().mockReturnValue(mockTdElement),
                querySelector: jest.fn(),
                getAttribute: jest.fn(),
                classList: []
            };
        });

        test('正常なボタン要素から時間帯情報を抽出', () => {
            // モック設定
            mockButtonElement.querySelector.mockImplementation((selector) => {
                if (selector === 'dt span') return mockTimeSpan;
                if (selector === 'img[src*="calendar_ng.svg"]') return null;
                if (selector === 'img[src*="ico_scale_low.svg"]') return { src: 'ico_scale_low.svg' };
                if (selector === 'img[src*="ico_scale_high.svg"]') return null;
                return null;
            });
            mockButtonElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-disabled') return 'false';
                if (attr === 'aria-pressed') return 'false';
                return null;
            });

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result).toEqual({
                element: mockButtonElement,
                tdElement: mockTdElement,
                timeText: '10:00～10:30',
                status: 'available',
                iconType: 'low',
                selector: expect.any(String)
            });
        });

        test('满员状态のボタン要素（calendar_ng.svgアイコン）', () => {
            mockButtonElement.querySelector.mockImplementation((selector) => {
                if (selector === 'dt span') return mockTimeSpan;
                if (selector === 'img[src*="calendar_ng.svg"]') return { src: 'calendar_ng.svg' };
                return null;
            });
            mockButtonElement.getAttribute.mockReturnValue('false');

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result.status).toBe('full');
            expect(result.iconType).toBe('full');
        });

        test('data-disabled="true"属性での満員判定', () => {
            mockButtonElement.querySelector.mockImplementation((selector) => {
                if (selector === 'dt span') return mockTimeSpan;
                if (selector === 'img[src*="ico_scale_high.svg"]') return { src: 'ico_scale_high.svg' };
                return null;
            });
            mockButtonElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-disabled') return 'true';
                if (attr === 'aria-pressed') return 'false';
                return null;
            });

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result.status).toBe('full'); // data-disabledが優先される
            expect(result.iconType).toBe('high');
        });

        test('選択状態のボタン要素（aria-pressed="true"）', () => {
            mockButtonElement.querySelector.mockImplementation((selector) => {
                if (selector === 'dt span') return mockTimeSpan;
                return null;
            });
            mockButtonElement.getAttribute.mockImplementation((attr) => {
                if (attr === 'data-disabled') return 'false';
                if (attr === 'aria-pressed') return 'true';
                return null;
            });

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result.status).toBe('selected');
        });

        test('選択状態のボタン要素（activeクラス）', () => {
            mockButtonElement.querySelector.mockImplementation((selector) => {
                if (selector === 'dt span') return mockTimeSpan;
                return null;
            });
            mockButtonElement.getAttribute.mockReturnValue('false');
            mockButtonElement.classList = ['some-class', 'style_active__abc123'];

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result.status).toBe('selected');
        });

        test('時間テキストが取得できない場合', () => {
            mockButtonElement.querySelector.mockImplementation((selector) => {
                if (selector === 'dt span') return null;
                return null;
            });

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result.timeText).toBe('');
            expect(result.status).toBe('unknown');
            expect(result.iconType).toBe('unknown');
        });

        test('td要素が見つからない場合', () => {
            mockButtonElement.closest.mockReturnValue(null);

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result).toBe(null);
        });

        test('アイコンが見つからない場合のデフォルト状態', () => {
            mockButtonElement.querySelector.mockImplementation((selector) => {
                if (selector === 'dt span') return mockTimeSpan;
                return null; // すべてのアイコンが見つからない
            });
            mockButtonElement.getAttribute.mockReturnValue('false');

            const result = extractTimeSlotInfo(mockButtonElement);

            expect(result.status).toBe('unknown');
            expect(result.iconType).toBe('unknown');
        });
    });

    describe('getRandomWaitTime() - 計算ロジック', () => {
        test('基本的なランダム時間生成', () => {
            const config = {
                randomSettings: {
                    minCheckInterval: 1000,
                    checkRandomRange: 500
                }
            };

            const result = getRandomWaitTime(undefined, undefined, config);

            expect(result).toBeGreaterThanOrEqual(1000);
            expect(result).toBeLessThan(1500);
        });

        test('明示的なパラメータを使用', () => {
            const config = {
                randomSettings: {
                    minCheckInterval: 1000,
                    checkRandomRange: 500  
                }
            };

            const result = getRandomWaitTime(2000, 300, config);

            expect(result).toBeGreaterThanOrEqual(2000);
            expect(result).toBeLessThan(2300);
        });

        test('minTime=0の場合', () => {
            const config = {
                randomSettings: {
                    minCheckInterval: 1000,
                    checkRandomRange: 500
                }
            };

            const result = getRandomWaitTime(0, 100, config);

            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(100);
        });

        test('randomRange=0の場合（固定値）', () => {
            const config = {
                randomSettings: {
                    minCheckInterval: 1000,
                    checkRandomRange: 500
                }
            };

            const result = getRandomWaitTime(1500, 0, config);

            expect(result).toBe(1500);
        });
    });

    describe('identify_page_type() - URL判定ロジック', () => {
        test('パビリオン予約ページのURL判定', () => {
            const url = 'https://ticket.expo2025.or.jp/event_search/pavilion123';
            const result = identify_page_type(url);
            expect(result).toBe('pavilion_reservation');
        });

        test('入場予約ページのURL判定', () => {
            const url = 'https://ticket.expo2025.or.jp/ticket_visiting_reservation/entrance456';
            const result = identify_page_type(url);
            expect(result).toBe('entrance_reservation');
        });

        test('その他のページURL判定', () => {
            const url = 'https://ticket.expo2025.or.jp/other_page/';
            const result = identify_page_type(url);
            expect(result).toBe(null);
        });

        test('完全に異なるドメインのURL判定', () => {
            const url = 'https://example.com/some_page/';
            const result = identify_page_type(url);
            expect(result).toBe(null);
        });

        test('空文字列のURL判定', () => {
            const url = '';
            const result = identify_page_type(url);
            expect(result).toBe(null);
        });
    });

    describe('generateSelectorForElement() - セレクタ生成', () => {
        test('時間テキストからセレクタ生成', () => {
            const mockElement = {
                querySelector: jest.fn().mockReturnValue({
                    textContent: '10:00～10:30'
                })
            };

            const result = generateSelectorForElement(mockElement);

            expect(result).toBe("td[data-gray-out] div[role='button'] dt span:contains('10:00～10:30')");
        });

        test('時間テキストが取得できない場合', () => {
            const mockElement = {
                querySelector: jest.fn().mockReturnValue(null)
            };

            const result = generateSelectorForElement(mockElement);

            expect(result).toBe("td[data-gray-out] div[role='button'] dt span:contains('')");
        });

        test('トリムされた時間テキスト', () => {
            const mockElement = {
                querySelector: jest.fn().mockReturnValue({
                    textContent: '  14:30～15:00  '
                })
            };

            const result = generateSelectorForElement(mockElement);

            expect(result).toBe("td[data-gray-out] div[role='button'] dt span:contains('14:30～15:00')");
        });
    });

    describe('getCurrentMode() - 状態判定ロジック', () => {
        // getCurrentModeは状態オブジェクトに依存するため、実際の状態オブジェクトを取得
        let pageLoadingState, timeSlotState, entranceReservationState, multiTargetManager;

        beforeEach(() => {
            // 実際の状態オブジェクトを取得
            pageLoadingState = indexModule.pageLoadingState || { isLoading: false };
            timeSlotState = indexModule.timeSlotState || { isMonitoring: false, mode: 'idle' };
            entranceReservationState = indexModule.entranceReservationState || { isRunning: false };
            multiTargetManager = indexModule.multiTargetManager || { 
                hasTargets: jest.fn().mockReturnValue(false)
            };

            // 初期状態にリセット
            if (pageLoadingState) pageLoadingState.isLoading = false;
            if (timeSlotState) {
                timeSlotState.isMonitoring = false;
                timeSlotState.mode = 'idle';
            }
            if (entranceReservationState) entranceReservationState.isRunning = false;
            if (multiTargetManager && multiTargetManager.hasTargets) {
                multiTargetManager.hasTargets = jest.fn().mockReturnValue(false);
            }
        });

        test('アイドル状態', () => {
            const result = getCurrentMode();
            expect(result).toBe('idle');
        });

        test('監視実行中状態', () => {
            if (timeSlotState) timeSlotState.isMonitoring = true;
            const result = getCurrentMode();
            expect(result).toBe('monitoring');
        });

        test('予約実行中状態', () => {
            if (entranceReservationState) entranceReservationState.isRunning = true;
            const result = getCurrentMode();
            expect(result).toBe('reservation-running');
        });

        test('監視対象選択中状態', () => {
            if (multiTargetManager && multiTargetManager.hasTargets) {
                multiTargetManager.hasTargets.mockReturnValue(true);
            }
            if (timeSlotState) timeSlotState.mode = 'selecting';
            const result = getCurrentMode();
            expect(result).toBe('selecting');
        });

        test('優先度テスト: 監視中が予約実行より優先', () => {
            if (timeSlotState) timeSlotState.isMonitoring = true;
            if (entranceReservationState) entranceReservationState.isRunning = true;
            const result = getCurrentMode();
            expect(result).toBe('monitoring');
        });

        // NOTE: pageLoadingStateへのアクセスが困難なため、
        // 該当テストはIntegration Testで実装予定
    });

    describe('getMonitorButtonText() - 表示テキスト生成', () => {
        // この関数は複雑なDOM操作とmultiTargetManagerに依存するため、
        // 真のUnit Testよりもintegration testに適している
        
        test('getMonitorButtonText関数の存在確認', () => {
            expect(typeof getMonitorButtonText).toBe('function');
        });

        // NOTE: この関数は以下の依存関係があるため完全なUnit Testが困難:
        // 1. generateUniqueTdSelector - 複雑なDOM構造解析
        // 2. multiTargetManager - グローバル状態管理オブジェクト  
        // 3. DOM要素の親子関係 - parentElement, children配列
        // Phase 2でDOM検索系テストとして別途実装予定
    });
});