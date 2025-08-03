/**
 * キャッシュ・永続化システムのテスト
 * 元のindex.jsのcacheManager機能をテスト
 */

// モックキャッシュマネージャー（localStorage使用）
const mockCacheManager = {
    // キー生成（URLベース）
    generateKey(suffix = '') {
        // テスト用の固定URL
        const mockUrl = 'https://ticket.expo2025.or.jp/ticket_visiting_reservation?reserve_id=test123';
        const url = new URL(mockUrl);
        const baseKey = `expo2025_entrance_${url.searchParams.get('reserve_id') || 'default'}`;
        return suffix ? `${baseKey}_${suffix}` : baseKey;
    },
    
    // 複数監視対象を保存
    saveTargetSlots(targets = [], selectedDate = null) {
        try {
            if (targets.length === 0) return false;
            
            const data = {
                targets: targets.map(target => ({
                    timeText: target.timeText,
                    tdSelector: target.tdSelector,
                    positionInfo: target.positionInfo,
                    status: target.status
                })),
                selectedDate: selectedDate,
                savedAt: new Date().toISOString(),
                version: '1.0'
            };
            
            const key = this.generateKey('targetSlots');
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`💾 監視対象保存完了: ${targets.length}個 (${key})`);
            return true;
        } catch (error) {
            console.error('監視対象保存エラー:', error);
            return false;
        }
    },
    
    // 複数監視対象を復元
    restoreTargetSlots() {
        try {
            const key = this.generateKey('targetSlots');
            const stored = localStorage.getItem(key);
            
            if (!stored) {
                console.log('💾 保存された監視対象なし');
                return null;
            }
            
            const data = JSON.parse(stored);
            
            // バージョンチェック
            if (!data.version || data.version !== '1.0') {
                console.log('💾 キャッシュバージョン不一致、クリア');
                this.clearTargetSlots();
                return null;
            }
            
            // 有効期限チェック（24時間）
            const savedAt = new Date(data.savedAt);
            const now = new Date();
            const hoursDiff = (now - savedAt) / (1000 * 60 * 60);
            
            if (hoursDiff > 24) {
                console.log('💾 キャッシュ期限切れ、クリア');
                this.clearTargetSlots();
                return null;
            }
            
            console.log(`💾 監視対象復元完了: ${data.targets.length}個`);
            return data;
        } catch (error) {
            console.error('監視対象復元エラー:', error);
            this.clearTargetSlots();
            return null;
        }
    },
    
    // 監視対象キャッシュをクリア
    clearTargetSlots() {
        try {
            const key = this.generateKey('targetSlots');
            localStorage.removeItem(key);
            console.log('💾 監視対象キャッシュクリア完了');
            return true;
        } catch (error) {
            console.error('監視対象キャッシュクリアエラー:', error);
            return false;
        }
    },
    
    // 一般的なキャッシュ機能
    save(suffix, data) {
        try {
            const key = this.generateKey(suffix);
            const cacheData = {
                data: data,
                savedAt: new Date().toISOString(),
                version: '1.0'
            };
            localStorage.setItem(key, JSON.stringify(cacheData));
            return true;
        } catch (error) {
            console.error(`キャッシュ保存エラー (${suffix}):`, error);
            return false;
        }
    },
    
    // 一般的なキャッシュ復元
    restore(suffix, maxAgeHours = 24) {
        try {
            const key = this.generateKey(suffix);
            const stored = localStorage.getItem(key);
            
            if (!stored) return null;
            
            const cacheData = JSON.parse(stored);
            
            // 有効期限チェック
            const savedAt = new Date(cacheData.savedAt);
            const now = new Date();
            const hoursDiff = (now - savedAt) / (1000 * 60 * 60);
            
            if (hoursDiff > maxAgeHours) {
                this.clear(suffix);
                return null;
            }
            
            return cacheData.data;
        } catch (error) {
            console.error(`キャッシュ復元エラー (${suffix}):`, error);
            this.clear(suffix);
            return null;
        }
    },
    
    // 一般的なキャッシュクリア
    clear(suffix) {
        try {
            const key = this.generateKey(suffix);
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`キャッシュクリアエラー (${suffix}):`, error);
            return false;
        }
    },
    
    // 全キャッシュクリア
    clearAll() {
        try {
            const baseKey = this.generateKey();
            const keysToRemove = [];
            
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(baseKey)) {
                    keysToRemove.push(key);
                }
            }
            
            keysToRemove.forEach(key => localStorage.removeItem(key));
            console.log(`💾 全キャッシュクリア完了: ${keysToRemove.length}個`);
            return true;
        } catch (error) {
            console.error('全キャッシュクリアエラー:', error);
            return false;
        }
    }
};

// テストケース定義
const cacheSystemTests = [
    {
        name: 'キー生成テスト',
        cases: [
            {
                description: 'ベースキーの生成',
                test: () => {
                    const baseKey = mockCacheManager.generateKey();
                    return baseKey === 'expo2025_entrance_test123';
                }
            },
            {
                description: 'サフィックス付きキーの生成',
                test: () => {
                    const key = mockCacheManager.generateKey('targetSlots');
                    return key === 'expo2025_entrance_test123_targetSlots';
                }
            },
            {
                description: '複数サフィックスキーの一意性',
                test: () => {
                    const key1 = mockCacheManager.generateKey('targetSlots');
                    const key2 = mockCacheManager.generateKey('settings');
                    return key1 !== key2 && 
                           key1.includes('targetSlots') && 
                           key2.includes('settings');
                }
            }
        ]
    },
    {
        name: '監視対象保存・復元テスト',
        cases: [
            {
                description: '空配列の保存拒否',
                test: () => {
                    const result = mockCacheManager.saveTargetSlots([], '2025-03-15');
                    return result === false;
                }
            },
            {
                description: '監視対象の保存',
                test: () => {
                    const targets = [
                        {
                            timeText: '9:00-',
                            tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                            positionInfo: { rowIndex: 0, cellIndex: 0 },
                            status: 'full'
                        },
                        {
                            timeText: '11:00-',
                            tdSelector: 'table tr:nth-child(2) td:nth-child(1)[data-gray-out]',
                            positionInfo: { rowIndex: 1, cellIndex: 0 },
                            status: 'full'
                        }
                    ];
                    
                    const result = mockCacheManager.saveTargetSlots(targets, '2025-03-15');
                    return result === true;
                }
            },
            {
                description: '監視対象の復元',
                test: () => {
                    const restored = mockCacheManager.restoreTargetSlots();
                    
                    return restored && 
                           restored.targets.length === 2 &&
                           restored.targets[0].timeText === '9:00-' &&
                           restored.targets[1].timeText === '11:00-' &&
                           restored.selectedDate === '2025-03-15';
                }
            },
            {
                description: '復元データの完整性',
                test: () => {
                    const restored = mockCacheManager.restoreTargetSlots();
                    
                    const firstTarget = restored.targets[0];
                    return firstTarget.tdSelector && 
                           firstTarget.positionInfo &&
                           firstTarget.status === 'full' &&
                           restored.version === '1.0';
                }
            }
        ]
    },
    {
        name: 'キャッシュ期限管理テスト',
        cases: [
            {
                description: '有効期限内データの復元',
                test: () => {
                    // 現在時刻のデータを保存
                    const targets = [{
                        timeText: '9:00-',
                        tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                        positionInfo: { rowIndex: 0, cellIndex: 0 },
                        status: 'full'
                    }];
                    
                    mockCacheManager.saveTargetSlots(targets, '2025-03-15');
                    const restored = mockCacheManager.restoreTargetSlots();
                    
                    return restored !== null && restored.targets.length === 1;
                }
            },
            {
                description: '期限切れデータの自動削除',
                test: () => {
                    // 手動で期限切れデータを作成
                    const key = mockCacheManager.generateKey('targetSlots');
                    const expiredData = {
                        targets: [{ timeText: '9:00-' }],
                        selectedDate: '2025-03-15',
                        savedAt: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25時間前
                        version: '1.0'
                    };
                    
                    localStorage.setItem(key, JSON.stringify(expiredData));
                    const restored = mockCacheManager.restoreTargetSlots();
                    
                    // 期限切れのため null が返され、キャッシュがクリアされる
                    return restored === null && !localStorage.getItem(key);
                }
            },
            {
                description: 'バージョン不一致データの削除',
                test: () => {
                    const key = mockCacheManager.generateKey('targetSlots');
                    const oldVersionData = {
                        targets: [{ timeText: '9:00-' }],
                        selectedDate: '2025-03-15',
                        savedAt: new Date().toISOString(),
                        version: '0.9' // 古いバージョン
                    };
                    
                    localStorage.setItem(key, JSON.stringify(oldVersionData));
                    const restored = mockCacheManager.restoreTargetSlots();
                    
                    return restored === null && !localStorage.getItem(key);
                }
            }
        ]
    },
    {
        name: '一般キャッシュ機能テスト',
        cases: [
            {
                description: '任意データの保存・復元',
                test: () => {
                    const testData = {
                        setting1: 'value1',
                        setting2: 42,
                        setting3: true
                    };
                    
                    const saved = mockCacheManager.save('settings', testData);
                    const restored = mockCacheManager.restore('settings');
                    
                    return saved === true && 
                           restored &&
                           restored.setting1 === 'value1' &&
                           restored.setting2 === 42 &&
                           restored.setting3 === true;
                }
            },
            {
                description: '存在しないキャッシュの復元',
                test: () => {
                    const restored = mockCacheManager.restore('nonexistent');
                    return restored === null;
                }
            },
            {
                description: 'カスタム有効期限の動作',
                test: () => {
                    // 0.001時間（3.6秒）の期限で保存
                    const testData = { value: 'test' };
                    mockCacheManager.save('shortterm', testData);
                    
                    // 手動で古い時間を設定
                    const key = mockCacheManager.generateKey('shortterm');
                    const cacheData = JSON.parse(localStorage.getItem(key));
                    cacheData.savedAt = new Date(Date.now() - 4 * 1000).toISOString(); // 4秒前
                    localStorage.setItem(key, JSON.stringify(cacheData));
                    
                    // 0.001時間（3.6秒）以内での復元は失敗するはず
                    const restored = mockCacheManager.restore('shortterm', 0.001);
                    
                    return restored === null;
                }
            }
        ]
    },
    {
        name: 'キャッシュクリア機能テスト',
        cases: [
            {
                description: '個別キャッシュのクリア',
                test: () => {
                    // テストデータを保存
                    mockCacheManager.save('test1', { data: 'value1' });
                    mockCacheManager.save('test2', { data: 'value2' });
                    
                    // test1のみクリア
                    const cleared = mockCacheManager.clear('test1');
                    
                    // test1は消えて、test2は残っているはず
                    const restored1 = mockCacheManager.restore('test1');
                    const restored2 = mockCacheManager.restore('test2');
                    
                    return cleared === true && 
                           restored1 === null && 
                           restored2 !== null;
                }
            },
            {
                description: '監視対象キャッシュの個別クリア',
                test: () => {
                    const targets = [{
                        timeText: '9:00-',
                        tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                        positionInfo: { rowIndex: 0, cellIndex: 0 },
                        status: 'full'
                    }];
                    
                    mockCacheManager.saveTargetSlots(targets, '2025-03-15');
                    const cleared = mockCacheManager.clearTargetSlots();
                    const restored = mockCacheManager.restoreTargetSlots();
                    
                    return cleared === true && restored === null;
                }
            },
            {
                description: '全キャッシュのクリア',
                test: () => {
                    // 複数のキャッシュを保存
                    mockCacheManager.save('data1', { value: 'test1' });
                    mockCacheManager.save('data2', { value: 'test2' });
                    mockCacheManager.saveTargetSlots([{
                        timeText: '9:00-',
                        tdSelector: 'test',
                        positionInfo: { rowIndex: 0, cellIndex: 0 },
                        status: 'full'
                    }], '2025-03-15');
                    
                    // 全クリア
                    const cleared = mockCacheManager.clearAll();
                    
                    // 全て消えているはず
                    const restored1 = mockCacheManager.restore('data1');
                    const restored2 = mockCacheManager.restore('data2');
                    const restored3 = mockCacheManager.restoreTargetSlots();
                    
                    return cleared === true && 
                           restored1 === null && 
                           restored2 === null && 
                           restored3 === null;
                }
            }
        ]
    }
];

// テスト実行関数
function runCacheSystemTests() {
    let totalTests = 0;
    let passedTests = 0;
    const results = [];

    console.log('💾 キャッシュ・永続化システムテスト開始');
    console.log('═══════════════════════════════');

    // テスト開始前にクリーンアップ
    mockCacheManager.clearAll();

    cacheSystemTests.forEach(testSuite => {
        console.log(`\n📋 ${testSuite.name}`);
        console.log('─'.repeat(30));

        testSuite.cases.forEach(testCase => {
            totalTests++;
            
            try {
                const passed = testCase.test();

                if (passed) {
                    passedTests++;
                    console.log(`  ✅ ${testCase.description}`);
                    results.push({ ...testCase, status: 'PASS' });
                } else {
                    console.log(`  ❌ ${testCase.description}`);
                    results.push({ ...testCase, status: 'FAIL' });
                }
            } catch (error) {
                console.log(`  ⚠️ エラー: ${testCase.description}`);
                console.log(`     ${error.message}`);
                results.push({ ...testCase, status: 'ERROR', error: error.message });
            }
        });
    });

    console.log('\n═══════════════════════════════');
    console.log(`📊 テスト結果: ${passedTests}/${totalTests} 件成功`);
    console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (passedTests === totalTests) {
        console.log('🎉 全てのテストが成功しました！');
    } else {
        console.log('⚠️ 一部のテストが失敗しました。詳細を確認してください。');
    }

    // テスト後のクリーンアップ
    mockCacheManager.clearAll();

    return {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        results: results
    };
}

// ブラウザ環境での実行用
if (typeof window !== 'undefined') {
    window.runCacheSystemTests = runCacheSystemTests;
    window.mockCacheManager = mockCacheManager;
}

// Node.js環境での実行用
if (typeof module !== 'undefined') {
    module.exports = {
        runCacheSystemTests,
        mockCacheManager,
        cacheSystemTests
    };
}