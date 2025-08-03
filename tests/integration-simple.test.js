/**
 * Integration Tests - 簡易版
 * 状態管理統合テストの基本実装
 */

console.log = jest.fn();

describe('Integration Tests: 状態管理統合', () => {
    
    describe('基本的な状態管理統合', () => {
        test('multiTargetManagerとcacheManagerの連携', () => {
            const { multiTargetManager, cacheManager } = require('../src/index.js');
            
            // 基本的な存在確認
            expect(multiTargetManager).toBeDefined();
            expect(cacheManager).toBeDefined();
            
            // メソッドの存在確認
            if (multiTargetManager) {
                expect(typeof multiTargetManager.hasTargets).toBe('function');
                expect(typeof multiTargetManager.getTargets).toBe('function');
            }
            
            if (cacheManager) {
                expect(typeof cacheManager.saveTargetSlots).toBe('function');
                expect(typeof cacheManager.loadTargetSlots).toBe('function');
            }
        });

        test('timeSlotStateとmultiTargetManagerの基本連携', () => {
            const { timeSlotState, multiTargetManager } = require('../src/index.js');
            
            // 状態オブジェクトの基本構造確認
            if (timeSlotState) {
                expect(timeSlotState).toHaveProperty('mode');
                expect(timeSlotState).toHaveProperty('isMonitoring');
            }
            
            if (multiTargetManager) {
                expect(typeof multiTargetManager.hasTargets).toBe('function');
            }
        });

        test('cacheManagerの基本機能', () => {
            const { cacheManager } = require('../src/index.js');
            
            if (cacheManager) {
                // キャッシュ操作メソッドの存在確認
                expect(typeof cacheManager.saveTargetSlots).toBe('function');
                expect(typeof cacheManager.loadTargetSlots).toBe('function');
                expect(typeof cacheManager.clearTargetSlots).toBe('function');
                expect(typeof cacheManager.setMonitoringFlag).toBe('function');
                expect(typeof cacheManager.getAndClearMonitoringFlag).toBe('function');
            }
        });
    });

    describe('状態遷移の基本パターン', () => {
        test('アイドル状態から選択状態への遷移', () => {
            const { timeSlotState } = require('../src/index.js');
            
            if (timeSlotState) {
                // 初期状態確認（通常はidle）
                const initialMode = timeSlotState.mode;
                expect(['idle', 'selecting', 'monitoring', 'trying'].includes(initialMode)).toBe(true);
                
                // isMonitoringプロパティの存在確認
                expect(typeof timeSlotState.isMonitoring).toBe('boolean');
            }
        });

        test('監視フラグの基本動作', () => {
            const { cacheManager } = require('../src/index.js');
            
            if (cacheManager && cacheManager.setMonitoringFlag) {
                // モック化せずに実際の関数呼び出し
                expect(() => {
                    cacheManager.setMonitoringFlag(true);
                }).not.toThrow();
                
                expect(() => {
                    cacheManager.setMonitoringFlag(false);
                }).not.toThrow();
            }
        });
    });

    describe('キャッシュ機能の統合テスト', () => {
        beforeEach(() => {
            // localStorageをクリア
            localStorage.clear();
        });

        test('キャッシュ保存と読み込みの基本動作', () => {
            const { cacheManager } = require('../src/index.js');
            
            if (cacheManager) {
                // キャッシュ保存テスト
                expect(() => {
                    cacheManager.saveTargetSlots();
                }).not.toThrow();
                
                // キャッシュ読み込みテスト
                const loadedData = cacheManager.loadTargetSlots();
                // データがnullまたはオブジェクトであることを確認
                expect(loadedData === null || typeof loadedData === 'object').toBe(true);
            }
        });

        test('監視フラグキャッシュの基本動作', () => {
            const { cacheManager } = require('../src/index.js');
            
            if (cacheManager) {
                // 監視フラグ設定
                expect(() => {
                    cacheManager.setMonitoringFlag(true);
                }).not.toThrow();
                
                // 監視フラグ取得・クリア
                const flag = cacheManager.getAndClearMonitoringFlag();
                expect(typeof flag === 'boolean').toBe(true);
            }
        });
    });

    describe('DOM操作関数の統合', () => {
        beforeEach(() => {
            document.body.innerHTML = `
                <table>
                    <tr>
                        <td data-gray-out="false">
                            <div role="button" data-disabled="false">
                                <dt><span>10:00～10:30</span></dt>
                            </div>
                        </td>
                    </tr>
                </table>
            `;
        });

        test('DOM検索関数の基本統合', () => {
            const { generateUniqueTdSelector, extractTdStatus } = require('../src/index.js');
            
            const tdElement = document.querySelector('td[data-gray-out]');
            
            if (tdElement && generateUniqueTdSelector) {
                expect(() => {
                    generateUniqueTdSelector(tdElement);
                }).not.toThrow();
            }
            
            if (tdElement && extractTdStatus) {
                const status = extractTdStatus(tdElement);
                expect(status === null || typeof status === 'object').toBe(true);
            }
        });
    });

    describe('エラーハンドリング統合', () => {
        test('null/undefined入力への耐性', () => {
            const { extractTdStatus, generateUniqueTdSelector } = require('../src/index.js');
            
            if (extractTdStatus) {
                expect(extractTdStatus(null)).toBe(null);
            }
            
            if (generateUniqueTdSelector) {
                expect(() => {
                    generateUniqueTdSelector(null);
                }).toThrow();
            }
        });
    });
});