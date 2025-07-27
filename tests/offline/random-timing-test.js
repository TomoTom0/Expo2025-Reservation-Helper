// ランダム待機時間生成のオフラインテスト

// テスト対象関数（index.jsから抜粋）
function getRandomWaitTime(minTime, randomRange, config) {
    const defaultConfig = {
        randomSettings: {
            minCheckInterval: 500,
            checkRandomRange: 200
        }
    };
    
    const actualConfig = config || defaultConfig;
    const { randomSettings } = actualConfig;
    const actualMinTime = minTime !== undefined ? minTime : randomSettings.minCheckInterval;
    const actualRandomRange = randomRange !== undefined ? randomRange : randomSettings.checkRandomRange;
    return actualMinTime + Math.floor(Math.random() * actualRandomRange);
}

// テスト用設定
const testConfig = {
    randomSettings: {
        minCheckInterval: 500,
        checkRandomRange: 200,
        minClickDelay: 500,
        clickRandomRange: 200,
        minRetryDelay: 1000,
        retryRandomRange: 300
    }
};

// テスト実行関数
function runRandomTimingTests() {
    console.log("=== ランダム待機時間テスト開始 ===");
    
    const tests = [
        {
            name: "デフォルト設定テスト",
            minTime: undefined,
            randomRange: undefined,
            expectedMin: 500,
            expectedMax: 700,
            iterations: 100
        },
        {
            name: "カスタム設定テスト",
            minTime: 1000,
            randomRange: 500,
            expectedMin: 1000,
            expectedMax: 1500,
            iterations: 100
        },
        {
            name: "最小値のみ指定",
            minTime: 200,
            randomRange: undefined,
            expectedMin: 200,
            expectedMax: 400,
            iterations: 50
        }
    ];
    
    tests.forEach((test, index) => {
        console.log(`\nテスト ${index + 1}: ${test.name}`);
        console.log(`  最小時間: ${test.minTime ?? 'デフォルト'}`);
        console.log(`  ランダム範囲: ${test.randomRange ?? 'デフォルト'}`);
        
        const results = [];
        for (let i = 0; i < test.iterations; i++) {
            const result = getRandomWaitTime(test.minTime, test.randomRange, testConfig);
            results.push(result);
        }
        
        const min = Math.min(...results);
        const max = Math.max(...results);
        const avg = results.reduce((a, b) => a + b, 0) / results.length;
        
        const minOk = min >= test.expectedMin;
        const maxOk = max < test.expectedMax;
        const rangeOk = minOk && maxOk;
        
        console.log(`  実際の範囲: ${min}ms ～ ${max}ms`);
        console.log(`  期待範囲: ${test.expectedMin}ms ～ ${test.expectedMax - 1}ms`);
        console.log(`  平均: ${avg.toFixed(1)}ms`);
        console.log(`  結果: ${rangeOk ? '✅ PASS' : '❌ FAIL'}`);
        
        if (!minOk) console.log(`    ⚠️ 最小値エラー: ${min} < ${test.expectedMin}`);
        if (!maxOk) console.log(`    ⚠️ 最大値エラー: ${max} >= ${test.expectedMax}`);
    });
}

// BAN対策の待機時間分布確認
function analyzeBanProtection() {
    console.log("\n=== BAN対策分析 ===");
    
    const samples = 1000;
    const checkIntervals = [];
    const clickDelays = [];
    const retryDelays = [];
    
    for (let i = 0; i < samples; i++) {
        checkIntervals.push(getRandomWaitTime(
            testConfig.randomSettings.minCheckInterval,
            testConfig.randomSettings.checkRandomRange,
            testConfig
        ));
        
        clickDelays.push(getRandomWaitTime(
            testConfig.randomSettings.minClickDelay,
            testConfig.randomSettings.clickRandomRange,
            testConfig
        ));
        
        retryDelays.push(getRandomWaitTime(
            testConfig.randomSettings.minRetryDelay,
            testConfig.randomSettings.retryRandomRange,
            testConfig
        ));
    }
    
    const analyzeArray = (arr, name) => {
        const min = Math.min(...arr);
        const max = Math.max(...arr);
        const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
        const median = arr.sort((a, b) => a - b)[Math.floor(arr.length / 2)];
        
        console.log(`${name}:`);
        console.log(`  範囲: ${min}ms ～ ${max}ms`);
        console.log(`  平均: ${avg.toFixed(1)}ms`);
        console.log(`  中央値: ${median}ms`);
    };
    
    analyzeArray(checkIntervals, "要素チェック間隔");
    analyzeArray(clickDelays, "クリック後遅延");
    analyzeArray(retryDelays, "リトライ遅延");
}

// Node.js環境で直接実行する場合
if (typeof require !== 'undefined' && require.main === module) {
    console.log("ランダム待機時間テスト - 直接実行モード\n");
    runRandomTimingTests();
    analyzeBanProtection();
} else {
    console.log("ランダム待機時間テストが読み込まれました。");
    console.log("実行するには:");
    console.log("  runRandomTimingTests() - 基本テスト");
    console.log("  analyzeBanProtection() - BAN対策分析");
}