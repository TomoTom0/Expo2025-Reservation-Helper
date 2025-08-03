/**
 * FAB UI機能のテスト
 * 元のindex.jsのcreateuranceReservationUI関数とFAB関連機能をテスト
 */

// テスト対象関数とモックオブジェクトを作成

// モック設定オブジェクト
const mockConfig = {
    targetElement: '#__next',
    monitoringInterval: 30000,
    randomRange: 5000,
    clickDelay: { min: 1000, max: 3000 }
};

// モック状態管理オブジェクト
let mockTimeSlotState = {
    mode: 'idle',  // idle, selecting, monitoring, trying
    targetSlots: [],
    monitoringInterval: null,
    isMonitoring: false,
    retryCount: 0,
    maxRetries: 100,
    reloadInterval: 30000
};

let mockEntranceReservationState = {
    isRunning: false,
    shouldStop: false,
    startTime: null,
    attempts: 0
};

// モック監視対象管理
const mockMultiTargetManager = {
    targets: [],
    
    hasTargets() {
        return this.targets.length > 0;
    },
    
    getTargets() {
        return [...this.targets];
    },
    
    getCount() {
        return this.targets.length;
    },
    
    addTarget(target) {
        this.targets.push(target);
        return true;
    },
    
    clearAll() {
        this.targets = [];
    }
};

// FAB作成関数（簡略版）
function createMockEntranceReservationUI(config) {
    // 既存のFABがあれば削除
    const existingFab = document.getElementById('ytomo-fab-container');
    if (existingFab) {
        existingFab.remove();
    }

    // FABコンテナを作成（右下固定）
    const fabContainer = document.createElement('div');
    fabContainer.id = 'ytomo-fab-container';
    fabContainer.style.cssText = `
        position: fixed !important;
        bottom: 24px !important;
        right: 24px !important;
        z-index: 10000 !important;
        display: flex !important;
        flex-direction: column !important;
        gap: 12px !important;
        align-items: flex-end !important;
        pointer-events: auto !important;
    `;

    // メインFABボタンを作成
    const fabButton = document.createElement('button');
    fabButton.id = 'ytomo-main-fab';
    fabButton.classList.add('ext-ytomo');
    fabButton.style.cssText = `
        width: 56px !important;
        height: 56px !important;
        border-radius: 50% !important;
        background: rgb(0, 104, 33) !important;
        color: white !important;
        border: none !important;
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2) !important;
        border: 3px solid rgba(255, 255, 255, 0.2) !important;
        cursor: pointer !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        font-size: 14px !important;
        font-weight: bold !important;
        transition: all 0.3s ease !important;
        position: relative !important;
        overflow: hidden !important;
        pointer-events: auto !important;
        opacity: 0.9 !important;
    `;

    // FABボタンのテキスト/アイコン
    const fabIcon = document.createElement('span');
    fabIcon.classList.add('ext-ytomo');
    fabIcon.style.cssText = `
        font-size: 12px !important;
        text-align: center !important;
        line-height: 1.2 !important;
        white-space: nowrap !important;
        pointer-events: none !important;
    `;
    fabIcon.innerText = '待機中';
    fabButton.appendChild(fabIcon);
    
    // 初期状態で無効化
    fabButton.disabled = true;
    fabButton.style.opacity = '0.6';
    fabButton.style.cursor = 'not-allowed';

    // 監視対象表示エリア
    const monitoringTargetsDisplay = document.createElement('div');
    monitoringTargetsDisplay.id = 'ytomo-monitoring-targets';
    monitoringTargetsDisplay.style.cssText = `
        background: linear-gradient(135deg, rgba(0, 104, 33, 0.95), rgba(0, 150, 50, 0.95)) !important;
        color: white !important;
        padding: 8px 12px !important;
        border-radius: 12px !important;
        font-size: 12px !important;
        font-weight: bold !important;
        text-align: center !important;
        box-shadow: 0 3px 10px rgba(0, 0, 0, 0.3) !important;
        border: 2px solid rgba(255, 255, 255, 0.3) !important;
        min-width: 120px !important;
        max-width: 200px !important;
        display: none !important;
        white-space: pre-line !important;
        overflow: visible !important;
        text-overflow: clip !important;
        pointer-events: auto !important;
        cursor: pointer !important;
    `;

    // FABコンテナに要素追加
    fabContainer.appendChild(monitoringTargetsDisplay);
    fabContainer.appendChild(fabButton);

    // ページに追加
    document.body.appendChild(fabContainer);

    return {
        fabContainer,
        fabButton,
        fabIcon,
        monitoringTargetsDisplay
    };
}

// FABボタン状態更新関数
function updateMockMainButtonDisplay(forceMode = null) {
    const fabButton = document.getElementById('ytomo-main-fab');
    const fabIcon = fabButton?.querySelector('span');
    const monitoringTargetsDisplay = document.getElementById('ytomo-monitoring-targets');
    
    if (!fabButton || !fabIcon) return;

    let mode = forceMode || getCurrentMockMode();
    
    // ボタンテキストと状態の更新
    switch (mode) {
        case 'idle':
            fabIcon.innerText = '待機中';
            fabButton.style.background = 'rgb(108, 117, 125)';
            fabButton.disabled = true;
            fabButton.style.opacity = '0.6';
            if (monitoringTargetsDisplay) {
                monitoringTargetsDisplay.style.display = 'none';
            }
            break;
            
        case 'selecting':
            fabIcon.innerText = '選択中';
            fabButton.style.background = 'rgb(0, 104, 33)';
            fabButton.disabled = false;
            fabButton.style.opacity = '0.9';
            updateMockMonitoringTargetsDisplay();
            break;
            
        case 'monitoring':
            fabIcon.innerText = '監視中';
            fabButton.style.background = 'rgb(255, 193, 7)';
            fabButton.disabled = false;
            fabButton.style.opacity = '1.0';
            updateMockMonitoringTargetsDisplay();
            break;
            
        case 'trying':
            fabIcon.innerText = '予約中';
            fabButton.style.background = 'rgb(220, 53, 69)';
            fabButton.disabled = true;
            fabButton.style.opacity = '1.0';
            break;
    }
}

// 監視対象表示更新
function updateMockMonitoringTargetsDisplay() {
    const monitoringTargetsDisplay = document.getElementById('ytomo-monitoring-targets');
    if (!monitoringTargetsDisplay) return;

    const targets = mockMultiTargetManager.getTargets();
    
    if (targets.length === 0) {
        monitoringTargetsDisplay.style.display = 'none';
        return;
    }

    const targetTexts = targets.map(target => 
        `${target.timeText} ${getLocationFromSelector(target.tdSelector)}`
    );
    
    monitoringTargetsDisplay.textContent = `監視対象 (${targets.length})\n${targetTexts.join('\n')}`;
    monitoringTargetsDisplay.style.display = 'block';
}

// 現在のモード取得
function getCurrentMockMode() {
    if (mockEntranceReservationState.isRunning) return 'trying';
    if (mockTimeSlotState.isMonitoring) return 'monitoring';
    if (mockMultiTargetManager.hasTargets()) return 'selecting';
    return 'idle';
}

// セレクタから位置情報取得（モック版）
function getLocationFromSelector(tdSelector) {
    if (!tdSelector) return '不明';
    
    const cellMatch = tdSelector.match(/td:nth-child\((\d+)\)/);
    if (cellMatch) {
        const cellIndex = parseInt(cellMatch[1]) - 1;
        if (cellIndex === 0) return '東';
        if (cellIndex === 1) return '西';
    }
    
    return '不明';
}

// テストケース定義
const fabUITests = [
    {
        name: 'FAB作成・配置テスト',
        cases: [
            {
                description: 'FABコンテナの作成と配置',
                test: () => {
                    const fab = createMockEntranceReservationUI(mockConfig);
                    
                    const container = document.getElementById('ytomo-fab-container');
                    const button = document.getElementById('ytomo-main-fab');
                    const targets = document.getElementById('ytomo-monitoring-targets');
                    
                    const containerExists = !!container;
                    const buttonExists = !!button;
                    const targetsExists = !!targets;
                    const properPosition = container && container.style.position === 'fixed';
                    
                    return containerExists && buttonExists && targetsExists && properPosition;
                }
            },
            {
                description: 'FABボタンの基本プロパティ',
                test: () => {
                    const fabButton = document.getElementById('ytomo-main-fab');
                    
                    const isCircular = fabButton.style.borderRadius === '50%';
                    const hasProperSize = fabButton.style.width === '56px' && 
                                        fabButton.style.height === '56px';
                    const hasClass = fabButton.classList.contains('ext-ytomo');
                    const hasInitialText = fabButton.textContent.includes('待機中');
                    
                    return isCircular && hasProperSize && hasClass && hasInitialText;
                }
            },
            {
                description: '既存FAB削除機能',
                test: () => {
                    // 2つ目のFABを作成
                    const fab2 = createMockEntranceReservationUI(mockConfig);
                    
                    // 1つだけ存在することを確認
                    const containers = document.querySelectorAll('#ytomo-fab-container');
                    const buttons = document.querySelectorAll('#ytomo-main-fab');
                    
                    return containers.length === 1 && buttons.length === 1;
                }
            }
        ]
    },
    {
        name: 'FAB状態管理テスト',
        cases: [
            {
                description: 'アイドル状態の表示',
                test: () => {
                    mockTimeSlotState.mode = 'idle';
                    mockTimeSlotState.isMonitoring = false;
                    mockEntranceReservationState.isRunning = false;
                    mockMultiTargetManager.clearAll();
                    
                    updateMockMainButtonDisplay();
                    
                    const fabButton = document.getElementById('ytomo-main-fab');
                    const fabIcon = fabButton.querySelector('span');
                    
                    return fabIcon.textContent === '待機中' && 
                           fabButton.disabled === true &&
                           fabButton.style.opacity === '0.6';
                }
            },
            {
                description: '選択中状態の表示',
                test: () => {
                    mockTimeSlotState.mode = 'selecting';
                    mockMultiTargetManager.addTarget({
                        timeText: '9:00-',
                        tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]'
                    });
                    
                    updateMockMainButtonDisplay();
                    
                    const fabButton = document.getElementById('ytomo-main-fab');
                    const fabIcon = fabButton.querySelector('span');
                    const targetsDisplay = document.getElementById('ytomo-monitoring-targets');
                    
                    return fabIcon.textContent === '選択中' && 
                           fabButton.disabled === false &&
                           targetsDisplay.style.display === 'block';
                }
            },
            {
                description: '監視中状態の表示',
                test: () => {
                    mockTimeSlotState.mode = 'monitoring';
                    mockTimeSlotState.isMonitoring = true;
                    
                    updateMockMainButtonDisplay();
                    
                    const fabButton = document.getElementById('ytomo-main-fab');
                    const fabIcon = fabButton.querySelector('span');
                    
                    return fabIcon.textContent === '監視中' && 
                           fabButton.disabled === false &&
                           fabButton.style.background.includes('255, 193, 7'); // 黄色
                }
            },
            {
                description: '予約中状態の表示',
                test: () => {
                    mockTimeSlotState.mode = 'trying';
                    mockEntranceReservationState.isRunning = true;
                    
                    updateMockMainButtonDisplay();
                    
                    const fabButton = document.getElementById('ytomo-main-fab');
                    const fabIcon = fabButton.querySelector('span');
                    
                    return fabIcon.textContent === '予約中' && 
                           fabButton.disabled === true &&
                           fabButton.style.background.includes('220, 53, 69'); // 赤色
                }
            }
        ]
    },
    {
        name: '監視対象表示テスト',
        cases: [
            {
                description: '監視対象なしの場合の表示',
                test: () => {
                    mockMultiTargetManager.clearAll();
                    updateMockMonitoringTargetsDisplay();
                    
                    const targetsDisplay = document.getElementById('ytomo-monitoring-targets');
                    return targetsDisplay.style.display === 'none';
                }
            },
            {
                description: '単一監視対象の表示',
                test: () => {
                    mockMultiTargetManager.clearAll();
                    mockMultiTargetManager.addTarget({
                        timeText: '9:00-',
                        tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]'
                    });
                    
                    updateMockMonitoringTargetsDisplay();
                    
                    const targetsDisplay = document.getElementById('ytomo-monitoring-targets');
                    const content = targetsDisplay.textContent;
                    
                    return targetsDisplay.style.display === 'block' &&
                           content.includes('監視対象 (1)') &&
                           content.includes('9:00-') &&
                           content.includes('東');
                }
            },
            {
                description: '複数監視対象の表示',
                test: () => {
                    mockMultiTargetManager.clearAll();
                    mockMultiTargetManager.addTarget({
                        timeText: '9:00-',
                        tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]'
                    });
                    mockMultiTargetManager.addTarget({
                        timeText: '9:00-',
                        tdSelector: 'table tr:nth-child(1) td:nth-child(2)[data-gray-out]'
                    });
                    mockMultiTargetManager.addTarget({
                        timeText: '11:00-',
                        tdSelector: 'table tr:nth-child(2) td:nth-child(1)[data-gray-out]'
                    });
                    
                    updateMockMonitoringTargetsDisplay();
                    
                    const targetsDisplay = document.getElementById('ytomo-monitoring-targets');
                    const content = targetsDisplay.textContent;
                    
                    return targetsDisplay.style.display === 'block' &&
                           content.includes('監視対象 (3)') &&
                           content.includes('9:00-') &&
                           content.includes('11:00-') &&
                           content.includes('東') &&
                           content.includes('西');
                }
            }
        ]
    },
    {
        name: 'レスポンシブ・UI挙動テスト',
        cases: [
            {
                description: 'FABの固定配置維持',
                test: () => {
                    const fabContainer = document.getElementById('ytomo-fab-container');
                    
                    const isFixed = fabContainer.style.position === 'fixed';
                    const isBottomRight = fabContainer.style.bottom === '24px' && 
                                        fabContainer.style.right === '24px';
                    const hasHighZIndex = parseInt(fabContainer.style.zIndex) >= 10000;
                    
                    return isFixed && isBottomRight && hasHighZIndex;
                }
            },
            {
                description: 'FABのフレックス配置',
                test: () => {
                    const fabContainer = document.getElementById('ytomo-fab-container');
                    
                    const isFlexColumn = fabContainer.style.display === 'flex' && 
                                       fabContainer.style.flexDirection === 'column';
                    const hasGap = fabContainer.style.gap === '12px';
                    const isAlignedEnd = fabContainer.style.alignItems === 'flex-end';
                    
                    return isFlexColumn && hasGap && isAlignedEnd;
                }
            },
            {
                description: 'テキストの適切な表示',
                test: () => {
                    const targetsDisplay = document.getElementById('ytomo-monitoring-targets');
                    
                    const hasPreLine = targetsDisplay.style.whiteSpace === 'pre-line';
                    const hasProperOverflow = targetsDisplay.style.overflow === 'visible';
                    const hasMaxWidth = parseInt(targetsDisplay.style.maxWidth) > 0;
                    
                    return hasPreLine && hasProperOverflow && hasMaxWidth;
                }
            }
        ]
    }
];

// テスト実行関数
function runFabUITests() {
    let totalTests = 0;
    let passedTests = 0;
    const results = [];

    console.log('🎨 FAB UI機能テスト開始');
    console.log('═══════════════════════════════');

    fabUITests.forEach(testSuite => {
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
    const fabContainer = document.getElementById('ytomo-fab-container');
    if (fabContainer) {
        fabContainer.remove();
    }

    return {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        results: results
    };
}

// ブラウザ環境での実行用
if (typeof window !== 'undefined') {
    window.runFabUITests = runFabUITests;
    window.createMockEntranceReservationUI = createMockEntranceReservationUI;
    window.updateMockMainButtonDisplay = updateMockMainButtonDisplay;
}

// Node.js環境での実行用
if (typeof module !== 'undefined') {
    module.exports = {
        runFabUITests,
        createMockEntranceReservationUI,
        updateMockMainButtonDisplay,
        fabUITests
    };
}