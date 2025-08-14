/**
 * CacheManager Unit Test
 * キャッシュ管理機能の単体テスト
 * 
 * @version v1.0.0
 * @testTarget CacheManager (cache-manager.ts)
 */

const { TestExports } = require('../../../ts/modules/test-exports');
const { createCacheManager } = TestExports;

describe('CacheManager', () => {
    let cacheManager;
    let originalLocation;
    
    beforeEach(() => {
        // フェイクタイマーを設定
        jest.useFakeTimers('modern');
        
        // CacheManagerインスタンスを作成
        cacheManager = createCacheManager();
        
        // localStorageをクリア
        localStorage.clear();
        
        // window.locationをテスト用に設定
        originalLocation = window.location;
        delete window.location;
        window.location = {
            href: 'https://ticket.expo2025.or.jp/ticket_visiting_reservation?reserve_id=test123',
            origin: 'https://ticket.expo2025.or.jp',
            pathname: '/ticket_visiting_reservation',
            search: '?reserve_id=test123'
        };
        
        // Console出力を抑制
        TestConsole.silence();
    });

    afterEach(() => {
        // タイマーのクリーンアップ
        try {
            if (jest.isMockFunction(setTimeout)) {
                jest.runOnlyPendingTimers();
            }
        } catch (e) {
            // フェイクタイマーが無効な場合は無視
        }
        jest.useRealTimers();
        
        // window.locationを復元
        window.location = originalLocation;
        
        // localStorageをクリア
        localStorage.clear();
        
        // Console spy復元
        TestConsole.restore();
    });

    describe('基本構築とキー生成', () => {
        test('CacheManagerが正常に作成される', () => {
            expect(cacheManager).toBeDefined();
            expect(typeof cacheManager.generateKey).toBe('function');
            expect(typeof cacheManager.saveTargetSlots).toBe('function');
            expect(typeof cacheManager.loadTargetSlot).toBe('function');
        });

        test('generateKey: 基本的なキー生成', () => {
            const key = cacheManager.generateKey();
            expect(key).toBe('expo2025_entrance_test123');
        });

        test('generateKey: サフィックス付きキー生成', () => {
            const key = cacheManager.generateKey('target_slot');
            expect(key).toBe('expo2025_entrance_test123_target_slot');
        });

        test('generateKey: reserve_idがない場合のデフォルト', () => {
            // reserve_idがないURLに変更
            window.location.href = 'https://ticket.expo2025.or.jp/ticket_visiting_reservation';
            window.location.search = '';
            
            const key = cacheManager.generateKey();
            expect(key).toBe('expo2025_entrance_default');
        });

        test('generateKey: 異なるreserve_idでの動作', () => {
            window.location.href = 'https://ticket.expo2025.or.jp/ticket_visiting_reservation?reserve_id=xyz789';
            window.location.search = '?reserve_id=xyz789';
            
            const key = cacheManager.generateKey('test');
            expect(key).toBe('expo2025_entrance_xyz789_test');
        });
    });

    describe('単一キャッシュ機能', () => {
        test('loadTargetSlot: キャッシュが存在しない場合はnull', () => {
            const result = cacheManager.loadTargetSlot();
            expect(result).toBeNull();
        });

        test('loadTargetSlot: 有効なキャッシュの読み込み', () => {
            // テスト用キャッシュデータを作成
            const testData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                selectedDate: '2025-04-15',
                timestamp: Date.now(), // 現在時刻
                url: window.location.href,
                retryCount: 0
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(testData)
            );
            
            const result = cacheManager.loadTargetSlot();
            expect(result).not.toBeNull();
            expect(result.timeSlot).toBe('11:00-');
            expect(result.locationIndex).toBe(0);
            expect(result.selectedDate).toBe('2025-04-15');
        });

        test('loadTargetSlot: 24時間を超えた古いキャッシュは削除', () => {
            // 25時間前のタイムスタンプ
            const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000);
            const testData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                timestamp: oldTimestamp
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(testData)
            );
            
            const result = cacheManager.loadTargetSlot();
            expect(result).toBeNull();
            
            // キャッシュが削除されていることを確認
            const cachedData = localStorage.getItem(cacheManager.generateKey('target_slot'));
            expect(cachedData).toBeNull();
        });

        test('loadTargetSlot: 不正なJSONの処理', () => {
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                'invalid json'
            );
            
            const result = cacheManager.loadTargetSlot();
            expect(result).toBeNull();
        });

        test('clearTargetSlot: キャッシュクリア', () => {
            // テストデータを設定
            const testData = { timeSlot: '11:00-', timestamp: Date.now() };
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(testData)
            );
            
            // キャッシュが存在することを確認
            expect(localStorage.getItem(cacheManager.generateKey('target_slot'))).not.toBeNull();
            
            // クリア実行
            cacheManager.clearTargetSlot();
            
            // キャッシュが削除されていることを確認
            expect(localStorage.getItem(cacheManager.generateKey('target_slot'))).toBeNull();
        });
    });

    describe('複数キャッシュ機能', () => {
        test('loadTargetSlots: 複数キャッシュが存在しない場合はnull', () => {
            const result = cacheManager.loadTargetSlots();
            expect(result).toBeNull();
        });

        test('loadTargetSlots: 有効な複数キャッシュの読み込み', () => {
            // テスト用複数キャッシュデータ
            const testData = {
                targets: [
                    { timeSlot: '11:00-', locationIndex: 0 },
                    { timeSlot: '14:30-', locationIndex: 1 }
                ],
                selectedDate: '2025-04-15',
                timestamp: Date.now(),
                url: window.location.href,
                retryCount: 0
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slots'), 
                JSON.stringify(testData)
            );
            
            const result = cacheManager.loadTargetSlots();
            expect(result).not.toBeNull();
            expect(result.targets).toHaveLength(2);
            expect(result.targets[0].timeSlot).toBe('11:00-');
            expect(result.targets[1].timeSlot).toBe('14:30-');
            expect(result.selectedDate).toBe('2025-04-15');
        });

        test('loadTargetSlots: 古い複数キャッシュは削除', () => {
            const oldTimestamp = Date.now() - (25 * 60 * 60 * 1000);
            const testData = {
                targets: [{ timeSlot: '11:00-', locationIndex: 0 }],
                timestamp: oldTimestamp
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slots'), 
                JSON.stringify(testData)
            );
            
            const result = cacheManager.loadTargetSlots();
            expect(result).toBeNull();
        });

        test('loadTargetSlots: 後方互換性 - 単一キャッシュを複数形式に変換', () => {
            // 古い単一キャッシュのみ存在する場合
            const singleCacheData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                selectedDate: '2025-04-15',
                timestamp: Date.now(),
                url: window.location.href,
                retryCount: 0
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(singleCacheData)
            );
            
            const result = cacheManager.loadTargetSlots();
            expect(result).not.toBeNull();
            expect(result.targets).toHaveLength(1);
            expect(result.targets[0].timeSlot).toBe('11:00-');
            expect(result.selectedDate).toBe('2025-04-15');
        });

        test('clearTargetSlots: 複数キャッシュのクリア', () => {
            // 新旧両方のキャッシュを設定
            localStorage.setItem(cacheManager.generateKey('target_slots'), '{"test": "data"}');
            localStorage.setItem(cacheManager.generateKey('target_slot'), '{"old": "data"}');
            
            cacheManager.clearTargetSlots();
            
            // 両方のキャッシュが削除されていることを確認
            expect(localStorage.getItem(cacheManager.generateKey('target_slots'))).toBeNull();
            expect(localStorage.getItem(cacheManager.generateKey('target_slot'))).toBeNull();
        });
    });

    describe('保存機能', () => {
        test('saveTargetSlots: 空の保存処理（実装なし）', () => {
            expect(() => {
                cacheManager.saveTargetSlots();
            }).not.toThrow();
        });

        test('saveTargetSlot: 後方互換性メソッド', () => {
            expect(() => {
                cacheManager.saveTargetSlot({ timeSlot: '11:00-' });
            }).not.toThrow();
        });
    });

    describe('試行回数管理', () => {
        test('updateRetryCount: 試行回数の更新', () => {
            // 既存キャッシュを設定
            const testData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                timestamp: Date.now(),
                retryCount: 0
            };
            
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(testData)
            );
            
            // わずかに時間を進める
            jest.advanceTimersByTime(1);
            
            // 試行回数を更新
            cacheManager.updateRetryCount(5);
            
            // 更新されたデータを確認
            const result = cacheManager.loadTargetSlot();
            expect(result).not.toBeNull();
            expect(result.retryCount).toBe(5);
            expect(result.timestamp).toBeGreaterThanOrEqual(testData.timestamp);
        });

        test('updateRetryCount: キャッシュが存在しない場合', () => {
            expect(() => {
                cacheManager.updateRetryCount(3);
            }).not.toThrow();
        });
    });

    describe('エラーハンドリング', () => {
        test('localStorage エラー時の処理', () => {
            // localStorageのmockを破損させる
            const originalGetItem = localStorage.getItem;
            localStorage.getItem = jest.fn(() => { throw new Error('Storage error'); });
            
            const result = cacheManager.loadTargetSlot();
            expect(result).toBeNull();
            
            // 元に戻す
            localStorage.getItem = originalGetItem;
        });

        test('JSON.parse エラー時の処理', () => {
            localStorage.setItem(cacheManager.generateKey('target_slot'), '{broken json}');
            
            const result = cacheManager.loadTargetSlot();
            expect(result).toBeNull();
        });

        test('clearTargetSlots エラー時の処理', () => {
            const originalRemoveItem = localStorage.removeItem;
            localStorage.removeItem = jest.fn(() => { throw new Error('Remove error'); });
            
            expect(() => {
                cacheManager.clearTargetSlots();
            }).not.toThrow();
            
            // 元に戻す
            localStorage.removeItem = originalRemoveItem;
        });
    });

    describe('統合動作テスト', () => {
        test('キャッシュのライフサイクル全体', () => {
            // 1. 初期状態：キャッシュなし
            expect(cacheManager.loadTargetSlot()).toBeNull();
            
            // 2. キャッシュデータ作成（手動で localStorage に保存）
            const testData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                selectedDate: '2025-04-15',
                timestamp: Date.now(),
                retryCount: 0
            };
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(testData)
            );
            
            // 3. キャッシュ読み込み確認
            const loaded = cacheManager.loadTargetSlot();
            expect(loaded).not.toBeNull();
            expect(loaded.timeSlot).toBe('11:00-');
            
            // 4. 試行回数更新
            cacheManager.updateRetryCount(3);
            const updated = cacheManager.loadTargetSlot();
            expect(updated.retryCount).toBe(3);
            
            // 5. キャッシュクリア
            cacheManager.clearTargetSlot();
            expect(cacheManager.loadTargetSlot()).toBeNull();
        });

        test('複数キャッシュと単一キャッシュの統合動作', () => {
            // 単一キャッシュを設定
            const singleData = {
                timeSlot: '11:00-',
                locationIndex: 0,
                timestamp: Date.now()
            };
            localStorage.setItem(
                cacheManager.generateKey('target_slot'), 
                JSON.stringify(singleData)
            );
            
            // 複数形式で読み込み（後方互換性）
            const multiResult = cacheManager.loadTargetSlots();
            expect(multiResult.targets).toHaveLength(1);
            expect(multiResult.targets[0].timeSlot).toBe('11:00-');
            
            // 複数キャッシュをクリア（新旧両方削除）
            cacheManager.clearTargetSlots();
            expect(cacheManager.loadTargetSlot()).toBeNull();
            expect(cacheManager.loadTargetSlots()).toBeNull();
        });
    });
});