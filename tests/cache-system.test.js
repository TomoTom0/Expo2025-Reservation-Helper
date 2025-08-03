/**
 * キャッシュ・永続化システムのテスト
 * 実際のindex.jsのcacheManager機能をテスト
 */

const { cacheManager, multiTargetManager } = require('../src/index.js');

describe('キャッシュ・永続化システム', () => {
    beforeEach(() => {
        // localStorage をクリア
        localStorage.clear();
        // multiTargetManager状態をクリア
        multiTargetManager.clearAll();
    });

    describe('キー生成機能', () => {
        test('ベースキーの生成', () => {
            const baseKey = cacheManager.generateKey();
            expect(baseKey).toBe('expo2025_entrance_test123');
        });

        test('サフィックス付きキーの生成', () => {
            const key = cacheManager.generateKey('target_slots');
            expect(key).toBe('expo2025_entrance_test123_target_slots');
        });

        test('複数サフィックスキーの一意性', () => {
            const key1 = cacheManager.generateKey('target_slots');
            const key2 = cacheManager.generateKey('monitoring_flag');
            expect(key1).not.toBe(key2);
            expect(key1).toContain('target_slots');
            expect(key2).toContain('monitoring_flag');
        });
    });

    describe('監視対象保存・復元機能', () => {
        test('空配列の保存拒否', () => {
            // multiTargetManagerが空の場合は何も保存しない
            cacheManager.saveTargetSlots();
            const key = cacheManager.generateKey('target_slots');
            // setItemが呼ばれていないことを確認
            expect(localStorage.setItem).not.toHaveBeenCalledWith(key, expect.any(String));
        });

        test('監視対象の保存', () => {
            // multiTargetManagerに監視対象を追加
            const target1 = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 0 },
                status: 'full'
            };
            
            const target2 = {
                timeText: '11:00-',
                tdSelector: 'table tr:nth-child(2) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 1, cellIndex: 0 },
                status: 'full'
            };

            multiTargetManager.addTarget(target1);
            multiTargetManager.addTarget(target2);

            // 保存実行
            cacheManager.saveTargetSlots();

            // localStorageのsetItemが呼ばれているか確認
            const key = cacheManager.generateKey('target_slots');
            expect(localStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));
            
            // 実際に保存されたデータを取得
            const saveCall = localStorage.setItem.mock.calls.find(call => call[0] === key);
            const data = JSON.parse(saveCall[1]);
            expect(data.targets).toHaveLength(2);
            expect(data.targets[0].timeText).toBe('9:00-');
            expect(data.targets[1].timeText).toBe('11:00-');
            expect(data.timestamp).toBeDefined();
            expect(data.url).toBeDefined();
        });

        test('監視対象の復元', () => {
            // まず保存
            const target = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 0 },
                status: 'full'
            };

            multiTargetManager.addTarget(target);
            cacheManager.saveTargetSlots();

            // multiTargetManagerをクリア
            multiTargetManager.clearAll();
            expect(multiTargetManager.getCount()).toBe(0);

            // 保存されたデータを模擬的にgetItemから返すように設定
            const key = cacheManager.generateKey('target_slots');
            const savedData = {
                targets: [target],
                selectedDate: '2025-03-15',
                timestamp: Date.now(),
                url: window.location.href,
                retryCount: 0
            };
            localStorage.getItem.mockImplementation((k) => {
                return k === key ? JSON.stringify(savedData) : null;
            });

            // 復元実行
            const cached = cacheManager.loadTargetSlots();
            expect(cached).not.toBe(null);
            expect(cached.targets).toHaveLength(1);
            expect(cached.targets[0].timeText).toBe('9:00-');
            expect(cached.targets[0].tdSelector).toBe('table tr:nth-child(1) td:nth-child(1)[data-gray-out]');
        });
    });

    describe('キャッシュ期限管理', () => {
        test('有効期限内データの復元', () => {
            const target = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 0 },
                status: 'full'
            };

            // 有効期限内のデータを模擬的に設定
            const key = cacheManager.generateKey('target_slots');
            const validData = {
                targets: [target],
                selectedDate: '2025-03-15',
                timestamp: Date.now(), // 現在時刻（有効期限内）
                url: window.location.href,
                retryCount: 0
            };
            localStorage.getItem.mockImplementation((k) => {
                return k === key ? JSON.stringify(validData) : null;
            });

            // すぐに復元（有効期限内）
            const cached = cacheManager.loadTargetSlots();
            expect(cached).not.toBe(null);
            expect(cached.targets).toHaveLength(1);
        });

        test('期限切れデータの自動削除', () => {
            // 手動で期限切れデータを作成
            const key = cacheManager.generateKey('target_slots');
            const expiredData = {
                targets: [{ timeText: '9:00-', tdSelector: 'test' }],
                selectedDate: '2025-03-15',
                timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25時間前
                url: window.location.href,
                retryCount: 0
            };

            // 期限切れデータを模擬的に設定
            localStorage.getItem.mockImplementation((k) => {
                return k === key ? JSON.stringify(expiredData) : null;
            });

            // 復元試行
            const cached = cacheManager.loadTargetSlots();

            // 期限切れのため復元されず、removeItemが呼ばれる
            expect(cached).toBe(null);
            expect(localStorage.removeItem).toHaveBeenCalledWith(key);
        });
    });

    describe('キャッシュクリア機能', () => {
        test('監視対象キャッシュのクリア', () => {
            const key = cacheManager.generateKey('target_slots');

            // クリア実行
            cacheManager.clearTargetSlots();

            // removeItemが呼ばれることを確認
            expect(localStorage.removeItem).toHaveBeenCalledWith(key);
        });
    });

    describe('監視継続フラグ機能', () => {
        test('監視フラグの設定と取得', () => {
            // フラグ設定
            cacheManager.setMonitoringFlag(true);

            const key = cacheManager.generateKey('monitoring_flag');
            // setItemが呼ばれたことを確認
            expect(localStorage.setItem).toHaveBeenCalledWith(key, expect.any(String));

            // 保存されたデータを確認
            const saveCall = localStorage.setItem.mock.calls.find(call => call[0] === key);
            const data = JSON.parse(saveCall[1]);
            expect(data.isMonitoring).toBe(true);
            expect(data.timestamp).toBeDefined();
        });

        test('監視フラグの取得とクリア', () => {
            const key = cacheManager.generateKey('monitoring_flag');
            const flagData = {
                isMonitoring: true,
                timestamp: Date.now()
            };

            // 有効なフラグデータを模擬的に設定
            localStorage.getItem.mockImplementation((k) => {
                return k === key ? JSON.stringify(flagData) : null;
            });

            // フラグ取得（同時にクリアされる）
            const shouldContinue = cacheManager.getAndClearMonitoringFlag();
            expect(shouldContinue).toBe(true);

            // removeItemが呼ばれることを確認
            expect(localStorage.removeItem).toHaveBeenCalledWith(key);
        });

        test('期限切れ監視フラグの処理', () => {
            // 手動で期限切れフラグを作成
            const key = cacheManager.generateKey('monitoring_flag');
            const expiredFlag = {
                isMonitoring: true,
                timestamp: Date.now() - 65 * 1000 // 65秒前（期限切れ）
            };

            // 期限切れフラグを模擬的に設定
            localStorage.getItem.mockImplementation((k) => {
                return k === key ? JSON.stringify(expiredFlag) : null;
            });

            // フラグ取得（期限切れなのでfalse）
            const shouldContinue = cacheManager.getAndClearMonitoringFlag();
            expect(shouldContinue).toBe(false);

            // removeItemが呼ばれることを確認
            expect(localStorage.removeItem).toHaveBeenCalledWith(key);
        });

        test('監視フラグの手動クリア', () => {
            const key = cacheManager.generateKey('monitoring_flag');

            cacheManager.clearMonitoringFlag();
            // removeItemが呼ばれることを確認
            expect(localStorage.removeItem).toHaveBeenCalledWith(key);
        });
    });

    describe('エラーハンドリング', () => {
        test('不正なJSONデータの処理', () => {
            const key = cacheManager.generateKey('target_slots');
            
            // 不正なJSONを模擬的に設定
            localStorage.getItem.mockImplementation((k) => {
                return k === key ? 'invalid json data' : null;
            });

            // エラーが発生しても例外を投げずにnullを返す
            const cached = cacheManager.loadTargetSlots();
            expect(cached).toBe(null);
        });

        test('存在しないキャッシュの読み込み', () => {
            // デフォルト設定（null返却）のまま実行
            const cached = cacheManager.loadTargetSlots();
            expect(cached).toBe(null);
        });
    });
});