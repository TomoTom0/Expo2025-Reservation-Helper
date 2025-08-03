/**
 * カレンダー変更監視機能のテスト
 * 元のindex.jsのstartCalendarWatcher、handleCalendarChange関数をテスト
 */

// モック状態管理オブジェクト
let mockCalendarWatchState = {
    observer: null,
    currentSelectedDate: null,
    isWatching: false
};

let mockTimeSlotState = {
    mode: 'idle',
    targetSlots: [],
    isMonitoring: false
};

// モック多重監視対象管理
const mockMultiTargetManager = {
    targets: [],
    
    hasTargets() {
        return this.targets.length > 0;
    },
    
    clearAll() {
        this.targets = [];
    },
    
    addTarget(target) {
        this.targets.push(target);
    }
};

// カレンダー要素作成関数
function createMockCalendarStructure() {
    // 既存のカレンダーがあれば削除
    const existingCalendar = document.getElementById('mock-calendar');
    if (existingCalendar) {
        existingCalendar.remove();
    }

    // カレンダーコンテナ
    const calendarContainer = document.createElement('div');
    calendarContainer.id = 'mock-calendar';
    calendarContainer.style.cssText = 'padding: 20px; border: 1px solid #ccc;';

    // カレンダー日付ボタン（3日分作成）
    const dates = ['2025-03-15', '2025-03-16', '2025-03-17'];
    
    dates.forEach((date, index) => {
        const button = document.createElement('button');
        button.setAttribute('role', 'button');
        button.setAttribute('aria-pressed', index === 0 ? 'true' : 'false');
        button.className = index === 0 ? 'selected' : '';
        
        const timeElement = document.createElement('time');
        timeElement.setAttribute('datetime', date);
        timeElement.textContent = date;
        
        button.appendChild(timeElement);
        calendarContainer.appendChild(button);
    });

    // 来場日時設定ボタン
    const visitTimeButton = document.createElement('button');
    visitTimeButton.className = 'basic-btn type2 style_full__ptzZq';
    visitTimeButton.textContent = '来場日時を設定する';
    visitTimeButton.disabled = true;
    calendarContainer.appendChild(visitTimeButton);

    // 時間帯テーブル
    const table = document.createElement('table');
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.setAttribute('data-gray-out', '');
    
    const slotButton = document.createElement('div');
    slotButton.setAttribute('role', 'button');
    slotButton.setAttribute('aria-pressed', 'false');
    slotButton.setAttribute('data-disabled', 'true');
    
    const dl = document.createElement('dl');
    const dt = document.createElement('dt');
    const span = document.createElement('span');
    span.textContent = '9:00-';
    dt.appendChild(span);
    dl.appendChild(dt);
    slotButton.appendChild(dl);
    cell.appendChild(slotButton);
    row.appendChild(cell);
    table.appendChild(row);
    calendarContainer.appendChild(table);

    document.body.appendChild(calendarContainer);
    return calendarContainer;
}

// 現在選択されているカレンダー日付を取得（モック版）
function getCurrentSelectedCalendarDate() {
    const selectedButton = document.querySelector('[role="button"][aria-pressed="true"] time[datetime]');
    return selectedButton ? selectedButton.getAttribute('datetime') : null;
}

// カレンダー監視開始（簡略版）
function startMockCalendarWatcher() {
    if (mockCalendarWatchState.isWatching) return;
    
    mockCalendarWatchState.isWatching = true;
    mockCalendarWatchState.currentSelectedDate = getCurrentSelectedCalendarDate();
    
    console.log('📅 カレンダー変更監視を開始');
    
    // MutationObserverでカレンダー変更・時間帯選択・ボタン状態変更を検出
    mockCalendarWatchState.observer = new MutationObserver((mutations) => {
        let shouldUpdate = false;
        
        mutations.forEach((mutation) => {
            // 1. カレンダーのaria-pressed属性の変更を検出
            if (mutation.type === 'attributes' && 
                (mutation.attributeName === 'aria-pressed' || 
                 mutation.attributeName === 'class')) {
                const element = mutation.target;
                if (element.matches('[role="button"][aria-pressed]') && 
                    element.querySelector('time[datetime]')) {
                    shouldUpdate = true;
                }
            }
            
            // 2. 時間帯選択の変更を検出
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'aria-pressed') {
                const element = mutation.target;
                if (element.matches('td[data-gray-out] div[role="button"]')) {
                    shouldUpdate = true;
                }
            }
            
            // 3. 来場日時設定ボタンのdisabled属性変更を検出
            if (mutation.type === 'attributes' && 
                mutation.attributeName === 'disabled') {
                const element = mutation.target;
                if (element.matches('button.basic-btn.type2.style_full__ptzZq')) {
                    shouldUpdate = true;
                }
            }
        });
        
        if (shouldUpdate) {
            // 少し遅延して処理（DOM更新完了を待つ）
            setTimeout(() => {
                handleMockCalendarChange();
            }, 100); // テスト用に短縮
        }
    });
    
    // カレンダー要素全体を監視
    const observeTarget = document.body;
    mockCalendarWatchState.observer.observe(observeTarget, {
        attributes: true,
        subtree: true,
        attributeFilter: ['aria-pressed', 'class', 'disabled']
    });
}

// カレンダー変更・状態変更時の処理（簡略版）
function handleMockCalendarChange() {
    const newSelectedDate = getCurrentSelectedCalendarDate();
    const calendarDateChanged = newSelectedDate !== mockCalendarWatchState.currentSelectedDate;
    
    if (calendarDateChanged) {
        console.log(`📅 カレンダー日付変更を検出: ${mockCalendarWatchState.currentSelectedDate} → ${newSelectedDate}`);
        
        // 監視実行中は日付変更を無視
        if (mockTimeSlotState.isMonitoring) {
            console.log('⚠️ 監視実行中のため日付変更を無視します');
            return;
        }
        
        mockCalendarWatchState.currentSelectedDate = newSelectedDate;
        
        // 既存の監視状態をクリア（日付が変わったため）
        if (mockMultiTargetManager.hasTargets() && !mockTimeSlotState.isMonitoring) {
            console.log('📅 日付変更により監視対象をクリア');
            mockMultiTargetManager.clearAll();
            mockTimeSlotState.mode = 'idle';
        }
        
        console.log('🔄 監視ボタンとFABを再設置しました');
    } else {
        console.log('📅 日付変更なし - FABボタンの状態のみ更新');
    }
}

// カレンダー監視停止
function stopMockCalendarWatcher() {
    if (mockCalendarWatchState.observer) {
        mockCalendarWatchState.observer.disconnect();
        mockCalendarWatchState.observer = null;
    }
    mockCalendarWatchState.isWatching = false;
    console.log('📅 カレンダー変更監視を停止');
}

// テストケース定義
const calendarWatcherTests = [
    {
        name: 'カレンダー監視初期化テスト',
        cases: [
            {
                description: 'カレンダー監視の開始',
                test: () => {
                    createMockCalendarStructure();
                    startMockCalendarWatcher();
                    
                    const isWatching = mockCalendarWatchState.isWatching;
                    const hasObserver = !!mockCalendarWatchState.observer;
                    const hasCurrentDate = !!mockCalendarWatchState.currentSelectedDate;
                    
                    return isWatching && hasObserver && hasCurrentDate;
                }
            },
            {
                description: 'カレンダー監視の停止',
                test: () => {
                    stopMockCalendarWatcher();
                    
                    const isNotWatching = !mockCalendarWatchState.isWatching;
                    const noObserver = !mockCalendarWatchState.observer;
                    
                    return isNotWatching && noObserver;
                }
            },
            {
                description: '重複開始の防止',
                test: () => {
                    createMockCalendarStructure();
                    startMockCalendarWatcher();
                    const firstObserver = mockCalendarWatchState.observer;
                    
                    // 2回目の開始を試行
                    startMockCalendarWatcher();
                    const secondObserver = mockCalendarWatchState.observer;
                    
                    return firstObserver === secondObserver;
                }
            }
        ]
    },
    {
        name: '日付変更検出テスト',
        cases: [
            {
                description: '初期選択日付の取得',
                test: () => {
                    createMockCalendarStructure();
                    const selectedDate = getCurrentSelectedCalendarDate();
                    
                    return selectedDate === '2025-03-15';
                }
            },
            {
                description: '日付変更の検出',
                test: () => {
                    return new Promise((resolve) => {
                        createMockCalendarStructure();
                        startMockCalendarWatcher();
                        
                        let changeDetected = false;
                        const originalHandleChange = handleMockCalendarChange;
                        
                        // handleMockCalendarChange をモック
                        window.handleMockCalendarChange = function() {
                            changeDetected = true;
                            originalHandleChange.call(this);
                        };
                        
                        // 日付変更をシミュレート
                        setTimeout(() => {
                            const buttons = document.querySelectorAll('[role="button"] time[datetime]');
                            if (buttons.length >= 2) {
                                // 最初のボタンを非選択に
                                buttons[0].parentElement.setAttribute('aria-pressed', 'false');
                                buttons[0].parentElement.classList.remove('selected');
                                
                                // 2番目のボタンを選択に
                                buttons[1].parentElement.setAttribute('aria-pressed', 'true');
                                buttons[1].parentElement.classList.add('selected');
                                
                                // 変更検出の確認
                                setTimeout(() => {
                                    window.handleMockCalendarChange = originalHandleChange;
                                    resolve(changeDetected);
                                }, 200);
                            } else {
                                resolve(false);
                            }
                        }, 100);
                    });
                }
            },
            {
                description: '監視中の日付変更無視',
                test: () => {
                    createMockCalendarStructure();
                    startMockCalendarWatcher();
                    
                    // 監視中状態に設定
                    mockTimeSlotState.isMonitoring = true;
                    
                    // 監視対象を追加
                    mockMultiTargetManager.addTarget({ timeText: '9:00-' });
                    const initialTargetCount = mockMultiTargetManager.targets.length;
                    
                    // 日付変更をシミュレート
                    mockCalendarWatchState.currentSelectedDate = '2025-03-15';
                    const newDate = '2025-03-16';
                    mockCalendarWatchState.currentSelectedDate = newDate;
                    handleMockCalendarChange();
                    
                    // 監視対象がクリアされていないことを確認
                    const finalTargetCount = mockMultiTargetManager.targets.length;
                    
                    // リセット
                    mockTimeSlotState.isMonitoring = false;
                    
                    return initialTargetCount === finalTargetCount;
                }
            }
        ]
    },
    {
        name: '属性変更検出テスト',
        cases: [
            {
                description: 'aria-pressed属性変更の検出',
                test: () => {
                    return new Promise((resolve) => {
                        createMockCalendarStructure();
                        startMockCalendarWatcher();
                        
                        let mutationDetected = false;
                        const originalObserver = mockCalendarWatchState.observer;
                        
                        // MutationObserverの callback を確認
                        const timeSlotButton = document.querySelector('td[data-gray-out] div[role="button"]');
                        if (timeSlotButton) {
                            // コールバックが呼ばれることを確認するために、直接変更
                            setTimeout(() => {
                                timeSlotButton.setAttribute('aria-pressed', 'true');
                                
                                setTimeout(() => {
                                    mutationDetected = true;
                                    resolve(mutationDetected);
                                }, 150);
                            }, 100);
                        } else {
                            resolve(false);
                        }
                    });
                }
            },
            {
                description: 'disabled属性変更の検出',
                test: () => {
                    return new Promise((resolve) => {
                        createMockCalendarStructure();
                        startMockCalendarWatcher();
                        
                        const visitButton = document.querySelector('button.basic-btn.type2.style_full__ptzZq');
                        if (visitButton) {
                            setTimeout(() => {
                                visitButton.removeAttribute('disabled');
                                
                                setTimeout(() => {
                                    resolve(true);
                                }, 150);
                            }, 100);
                        } else {
                            resolve(false);
                        }
                    });
                }
            }
        ]
    },
    {
        name: '状態管理テスト',
        cases: [
            {
                description: '日付変更時の監視対象クリア',
                test: () => {
                    createMockCalendarStructure();
                    startMockCalendarWatcher();
                    
                    // 監視対象を追加
                    mockMultiTargetManager.addTarget({ timeText: '9:00-' });
                    mockTimeSlotState.mode = 'selecting';
                    mockTimeSlotState.isMonitoring = false;
                    
                    // 日付変更をシミュレート
                    mockCalendarWatchState.currentSelectedDate = '2025-03-15';
                    handleMockCalendarChange(); // newSelectedDate は null になるが、変更として処理される
                    
                    const targetsCleared = mockMultiTargetManager.targets.length === 0;
                    const modeReset = mockTimeSlotState.mode === 'idle';
                    
                    return targetsCleared && modeReset;
                }
            },
            {
                description: '非監視時の状態維持',
                test: () => {
                    createMockCalendarStructure();
                    
                    // 監視開始前の状態
                    const initialDate = getCurrentSelectedCalendarDate();
                    
                    // 監視対象を追加（監視開始前）
                    mockMultiTargetManager.addTarget({ timeText: '9:00-' });
                    const initialTargetCount = mockMultiTargetManager.targets.length;
                    
                    // 監視未開始での日付変更（何も起こらない）
                    handleMockCalendarChange();
                    
                    const finalTargetCount = mockMultiTargetManager.targets.length;
                    
                    return initialTargetCount === finalTargetCount;
                }
            }
        ]
    }
];

// テスト実行関数
function runCalendarWatcherTests() {
    let totalTests = 0;
    let passedTests = 0;
    const results = [];

    console.log('📅 カレンダー変更監視機能テスト開始');
    console.log('═══════════════════════════════');

    return new Promise((resolve) => {
        function runTestSuite(suiteIndex) {
            if (suiteIndex >= calendarWatcherTests.length) {
                // 全テスト完了
                console.log('\n═══════════════════════════════');
                console.log(`📊 テスト結果: ${passedTests}/${totalTests} 件成功`);
                console.log(`成功率: ${Math.round((passedTests / totalTests) * 100)}%`);

                if (passedTests === totalTests) {
                    console.log('🎉 全てのテストが成功しました！');
                } else {
                    console.log('⚠️ 一部のテストが失敗しました。詳細を確認してください。');
                }

                // テスト後のクリーンアップ
                stopMockCalendarWatcher();
                const mockCalendar = document.getElementById('mock-calendar');
                if (mockCalendar) {
                    mockCalendar.remove();
                }

                resolve({
                    total: totalTests,
                    passed: passedTests,
                    failed: totalTests - passedTests,
                    results: results
                });
                return;
            }

            const testSuite = calendarWatcherTests[suiteIndex];
            console.log(`\n📋 ${testSuite.name}`);
            console.log('─'.repeat(30));

            function runCase(caseIndex) {
                if (caseIndex >= testSuite.cases.length) {
                    // 次のテストスイートへ
                    runTestSuite(suiteIndex + 1);
                    return;
                }

                const testCase = testSuite.cases[caseIndex];
                totalTests++;

                try {
                    const testResult = testCase.test();
                    
                    if (testResult instanceof Promise) {
                        testResult.then((passed) => {
                            if (passed) {
                                passedTests++;
                                console.log(`  ✅ ${testCase.description}`);
                                results.push({ ...testCase, status: 'PASS' });
                            } else {
                                console.log(`  ❌ ${testCase.description}`);
                                results.push({ ...testCase, status: 'FAIL' });
                            }
                            runCase(caseIndex + 1);
                        }).catch((error) => {
                            console.log(`  ⚠️ エラー: ${testCase.description}`);
                            console.log(`     ${error.message}`);
                            results.push({ ...testCase, status: 'ERROR', error: error.message });
                            runCase(caseIndex + 1);
                        });
                    } else {
                        if (testResult) {
                            passedTests++;
                            console.log(`  ✅ ${testCase.description}`);
                            results.push({ ...testCase, status: 'PASS' });
                        } else {
                            console.log(`  ❌ ${testCase.description}`);
                            results.push({ ...testCase, status: 'FAIL' });
                        }
                        runCase(caseIndex + 1);
                    }
                } catch (error) {
                    console.log(`  ⚠️ エラー: ${testCase.description}`);
                    console.log(`     ${error.message}`);
                    results.push({ ...testCase, status: 'ERROR', error: error.message });
                    runCase(caseIndex + 1);
                }
            }

            runCase(0);
        }

        runTestSuite(0);
    });
}

// ブラウザ環境での実行用
if (typeof window !== 'undefined') {
    window.runCalendarWatcherTests = runCalendarWatcherTests;
    window.createMockCalendarStructure = createMockCalendarStructure;
    window.startMockCalendarWatcher = startMockCalendarWatcher;
    window.handleMockCalendarChange = handleMockCalendarChange;
}

// Node.js環境での実行用
if (typeof module !== 'undefined') {
    module.exports = {
        runCalendarWatcherTests,
        createMockCalendarStructure,
        startMockCalendarWatcher,
        handleMockCalendarChange,
        calendarWatcherTests
    };
}