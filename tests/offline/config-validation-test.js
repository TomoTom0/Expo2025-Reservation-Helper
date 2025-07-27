// 設定オブジェクトの構造検証テスト

// テスト対象設定（index.jsから抜粋）
const entranceReservationConfig = {
    selectors: {
        submit: "#__next > div > div > main > div > div.style_main__add_cart_button__DCOw8 > button",
        change: "body > div > div > div > div > div > div > button",
        success: "#reservation_modal_title",
        failure: "#reservation_fail_modal_title",
        close: "body > div.style_buy-modal__1JZtS > div > div > div > div > ul > li > a"
    },
    selectorTexts: {
        change: "来場日時を変更する"
    },
    timeouts: {
        waitForSubmit: 5000,
        waitForResponse: 10000,
        waitForClose: 3000,
        retryInterval: 1000
    },
    randomSettings: {
        minCheckInterval: 500,
        checkRandomRange: 200,
        minClickDelay: 500,
        clickRandomRange: 200,
        minRetryDelay: 1000,
        retryRandomRange: 300
    }
};

// 必須フィールドの定義
const requiredStructure = {
    selectors: ['submit', 'change', 'success', 'failure', 'close'],
    selectorTexts: ['change'],
    timeouts: ['waitForSubmit', 'waitForResponse', 'waitForClose', 'retryInterval'],
    randomSettings: ['minCheckInterval', 'checkRandomRange', 'minClickDelay', 'clickRandomRange', 'minRetryDelay', 'retryRandomRange']
};

// 検証関数
function validateConfigStructure(config) {
    console.log("=== 設定構造検証テスト ===");
    
    let errors = [];
    let warnings = [];
    
    // トップレベルセクションの存在確認
    for (const section of Object.keys(requiredStructure)) {
        if (!config[section]) {
            errors.push(`必須セクション '${section}' が見つかりません`);
            continue;
        }
        
        // 各セクション内のフィールド確認
        for (const field of requiredStructure[section]) {
            if (config[section][field] === undefined) {
                errors.push(`必須フィールド '${section}.${field}' が見つかりません`);
            }
        }
    }
    
    // セレクタの妥当性チェック
    if (config.selectors) {
        for (const [key, selector] of Object.entries(config.selectors)) {
            if (typeof selector !== 'string' || selector.trim() === '') {
                errors.push(`セレクタ '${key}' が空文字列または無効です`);
            }
            
            // CSS セレクタの基本的な妥当性チェック
            if (!selector.match(/^[#.]?[\w\-\[\]="':,\s>\+~\(\)]+$/)) {
                warnings.push(`セレクタ '${key}' の形式が疑わしいです: ${selector}`);
            }
        }
    }
    
    // タイムアウト値の妥当性チェック
    if (config.timeouts) {
        for (const [key, timeout] of Object.entries(config.timeouts)) {
            if (typeof timeout !== 'number' || timeout <= 0) {
                errors.push(`タイムアウト '${key}' が無効な値です: ${timeout}`);
            }
            
            if (timeout < 1000) {
                warnings.push(`タイムアウト '${key}' が短すぎる可能性があります: ${timeout}ms`);
            }
            
            if (timeout > 30000) {
                warnings.push(`タイムアウト '${key}' が長すぎる可能性があります: ${timeout}ms`);
            }
        }
    }
    
    // ランダム設定の妥当性チェック
    if (config.randomSettings) {
        for (const [key, value] of Object.entries(config.randomSettings)) {
            if (typeof value !== 'number' || value < 0) {
                errors.push(`ランダム設定 '${key}' が無効な値です: ${value}`);
            }
            
            if (key.includes('min') && value < 100) {
                warnings.push(`最小値 '${key}' が小さすぎる可能性があります: ${value}ms`);
            }
        }
        
        // BAN対策の有効性チェック
        const minInterval = config.randomSettings.minCheckInterval;
        if (minInterval < 500) {
            warnings.push(`要素チェック間隔が短すぎます（BAN対策不十分）: ${minInterval}ms`);
        }
    }
    
    // 結果表示
    console.log(`\n検証結果:`);
    console.log(`✅ エラー: ${errors.length}件`);
    console.log(`⚠️ 警告: ${warnings.length}件`);
    
    if (errors.length > 0) {
        console.log(`\n❌ エラー詳細:`);
        errors.forEach(error => console.log(`  - ${error}`));
    }
    
    if (warnings.length > 0) {
        console.log(`\n⚠️ 警告詳細:`);
        warnings.forEach(warning => console.log(`  - ${warning}`));
    }
    
    const isValid = errors.length === 0;
    console.log(`\n総合判定: ${isValid ? '✅ 有効' : '❌ 無効'}`);
    
    return {
        isValid,
        errors,
        warnings
    };
}

// セレクタの詳細分析
function analyzeSelectors(config) {
    console.log("\n=== セレクタ詳細分析 ===");
    
    if (!config.selectors) {
        console.log("セレクタ設定が見つかりません");
        return;
    }
    
    for (const [key, selector] of Object.entries(config.selectors)) {
        console.log(`\n${key}:`);
        console.log(`  セレクタ: ${selector}`);
        
        // セレクタの複雑さ分析
        const complexity = {
            hasId: selector.includes('#'),
            hasClass: selector.includes('.'),
            hasAttribute: selector.includes('['),
            hasDescendant: selector.includes(' '),
            hasChild: selector.includes('>'),
            depth: selector.split(/[\s>]/).length
        };
        
        console.log(`  特徴:`);
        console.log(`    ID指定: ${complexity.hasId ? 'あり' : 'なし'}`);
        console.log(`    クラス指定: ${complexity.hasClass ? 'あり' : 'なし'}`);
        console.log(`    属性指定: ${complexity.hasAttribute ? 'あり' : 'なし'}`);
        console.log(`    階層の深さ: ${complexity.depth}`);
        
        // 安定性評価
        let stability = 'high';
        if (complexity.depth > 5) stability = 'low';
        else if (complexity.depth > 3) stability = 'medium';
        
        console.log(`    安定性予測: ${stability}`);
    }
}

// メイン実行関数
function runConfigValidationTests() {
    console.log("設定検証テストが開始されました\n");
    
    const validation = validateConfigStructure(entranceReservationConfig);
    analyzeSelectors(entranceReservationConfig);
    
    return validation;
}

// Node.js環境で直接実行する場合
if (typeof require !== 'undefined' && require.main === module) {
    console.log("設定検証テスト - 直接実行モード\n");
    runConfigValidationTests();
} else {
    console.log("設定検証テストが読み込まれました。");
    console.log("実行するには: runConfigValidationTests()");
}