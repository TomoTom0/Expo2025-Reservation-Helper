/**
 * パビリオン検索機能のテスト
 * 元のindex.jsのprepare_filter関数をテスト
 */

// テスト対象関数を抽出（元のindex.jsより）
const prepare_filter = (val_search) => {
    // 空の検索文字列の場合は全てにマッチする正規表現を返す
    if (!val_search.trim()) {
        return { include: /(?:)/, exclude: null };
    }

    // OR条件を一時的に特別なマーカーに置換（後で処理するため）
    const orReplaced = val_search.replace(/(?:\s+|^)(or|OR)(?:\s+|$)/g, ' \uFFFF ');

    // フレーズ検索（引用符で囲まれた部分）を抽出
    const phraseMatches = orReplaced.match(/"[^"]*"/g) || [];
    let remainingStr = orReplaced;
    const phrases = phraseMatches.map(phrase => {
        remainingStr = remainingStr.replace(phrase, '');
        return phrase.slice(1, -1).replace(/\*/g, '.*');
    });

    // 残りの部分から通常の単語とマイナス検索を抽出
    const tokens = remainingStr.split(/\s+/).filter(token => token);
    const includeTokens = [];
    const excludeTokens = [];

    tokens.forEach(token => {
        if (token === '\uFFFF') {
            // ORマーカー
            includeTokens.push(token);
        } else if (token.startsWith('-')) {
            // マイナス検索
            const cleaned = token.slice(1).replace(/\*/g, '.*');
            if (cleaned) excludeTokens.push(cleaned);
        } else {
            // 通常の検索
            const cleaned = token.replace(/\*/g, '.*');
            if (cleaned) includeTokens.push(cleaned);
        }
    });

    // フレーズをincludeTokensに追加
    phrases.forEach(phrase => {
        includeTokens.push(phrase);
    });

    // 括弧の処理（簡易的な実装）
    const processParentheses = (tokens) => {
        const stack = [[]];
        for (const token of tokens) {
            if (token === '(') {
                stack.push([]);
            } else if (token === ')') {
                if (stack.length > 1) {
                    const group = stack.pop();
                    stack[stack.length - 1].push(group);
                }
            } else {
                stack[stack.length - 1].push(token);
            }
        }
        return stack[0];
    };

    const groupedIncludes = processParentheses(includeTokens);

    // 正規表現の構築（順不同対応版）
    const buildRegex = (group) => {
        if (Array.isArray(group)) {
            const parts = group.map(item => Array.isArray(item) ? buildRegex(item) : item);

            // ORマーカーがあるかチェック
            const orIndex = parts.findIndex(part => part === '\uFFFF');
            if (orIndex > -1) {
                const left = buildRegex(parts.slice(0, orIndex));
                const right = buildRegex(parts.slice(orIndex + 1));
                return `(?:${left}|${right})`;
            } else {
                // AND条件の場合は順不同でマッチするように変更
                return parts.map(part => `(?=.*${part})`).join('');
            }
        }
        return group;
    };

    const includePattern = buildRegex(groupedIncludes)
        .replace(/\uFFFF/g, '|')
        .replace(/\.\*/g, '[\\s\\S]*');

    // Safari対応：除外条件を別々にチェックする方式に変更
    const excludePatterns = excludeTokens.map(token =>
        new RegExp(token.replace(/\.\*/g, '[\\s\\S]*'), 'i')
    );

    return {
        include: new RegExp(includePattern, 'i'),
        exclude: excludePatterns.length > 0 ? excludePatterns : null
    };
};

// テストケース定義
const pavilionSearchTests = [
    {
        name: '基本検索テスト',
        cases: [
            {
                input: '',
                expected: { shouldMatchAll: true },
                description: '空文字列は全てにマッチ'
            },
            {
                input: 'パビリオン',
                testText: 'トヨタパビリオン',
                expected: { shouldMatch: true },
                description: '単一単語の部分マッチ'
            },
            {
                input: 'パビリオン',
                testText: 'レストラン',
                expected: { shouldMatch: false },
                description: '単一単語の非マッチ'
            }
        ]
    },
    {
        name: 'AND検索テスト',
        cases: [
            {
                input: 'トヨタ パビリオン',
                testText: 'トヨタ・モビリティ・パビリオン',
                expected: { shouldMatch: true },
                description: 'AND検索（順不同）マッチ'
            },
            {
                input: 'パビリオン トヨタ',
                testText: 'トヨタ・モビリティ・パビリオン',
                expected: { shouldMatch: true },
                description: 'AND検索（順序逆）マッチ'
            },
            {
                input: 'トヨタ 日本',
                testText: 'トヨタ・モビリティ・パビリオン',
                expected: { shouldMatch: false },
                description: 'AND検索の非マッチ'
            }
        ]
    },
    {
        name: 'OR検索テスト',
        cases: [
            {
                input: 'トヨタ OR 日本',
                testText: 'トヨタ・モビリティ・パビリオン',
                expected: { shouldMatch: true },
                description: 'OR検索の左側マッチ'
            },
            {
                input: 'トヨタ OR 日本',
                testText: '日本館',
                expected: { shouldMatch: true },
                description: 'OR検索の右側マッチ'
            },
            {
                input: 'トヨタ OR 日本',
                testText: 'サウジアラビア館',
                expected: { shouldMatch: false },
                description: 'OR検索の非マッチ'
            }
        ]
    },
    {
        name: 'マイナス検索テスト',
        cases: [
            {
                input: 'パビリオン -トヨタ',
                testText: '日本館パビリオン',
                expected: { shouldMatch: true },
                description: 'マイナス検索（除外対象なし）'
            },
            {
                input: 'パビリオン -トヨタ',
                testText: 'トヨタ・パビリオン',
                expected: { shouldMatch: false },
                description: 'マイナス検索（除外対象あり）'
            }
        ]
    },
    {
        name: 'フレーズ検索テスト',
        cases: [
            {
                input: '"トヨタ モビリティ"',
                testText: 'トヨタ モビリティ パビリオン',
                expected: { shouldMatch: true },
                description: 'フレーズ検索マッチ'
            },
            {
                input: '"トヨタ モビリティ"',
                testText: 'トヨタ・パビリオン・モビリティ',
                expected: { shouldMatch: false },
                description: 'フレーズ検索非マッチ（順序不一致）'
            }
        ]
    },
    {
        name: 'ワイルドカード検索テスト',
        cases: [
            {
                input: 'トヨタ*パビリオン',
                testText: 'トヨタ・モビリティ・パビリオン',
                expected: { shouldMatch: true },
                description: 'ワイルドカードマッチ'
            },
            {
                input: '*館',
                testText: '日本館',
                expected: { shouldMatch: true },
                description: '前方ワイルドカード'
            }
        ]
    }
];

// テスト実行関数
function runPavilionSearchTests() {
    let totalTests = 0;
    let passedTests = 0;
    const results = [];

    console.log('🏛️ パビリオン検索機能テスト開始');
    console.log('═══════════════════════════════');

    pavilionSearchTests.forEach(testSuite => {
        console.log(`\n📋 ${testSuite.name}`);
        console.log('─'.repeat(30));

        testSuite.cases.forEach(testCase => {
            totalTests++;
            
            try {
                const filter = prepare_filter(testCase.input);
                let passed = false;

                if (testCase.expected.shouldMatchAll) {
                    // 空文字列テスト
                    passed = filter.include.test('') && filter.include.test('任意のテキスト');
                } else if (testCase.expected.shouldMatch !== undefined) {
                    // 通常のマッチテスト
                    const includeMatch = filter.include.test(testCase.testText);
                    let excludeMatch = false;
                    
                    if (filter.exclude) {
                        excludeMatch = filter.exclude.some(regex => regex.test(testCase.testText));
                    }
                    
                    const finalMatch = includeMatch && !excludeMatch;
                    passed = finalMatch === testCase.expected.shouldMatch;
                }

                if (passed) {
                    passedTests++;
                    console.log(`  ✅ ${testCase.description}`);
                    results.push({ ...testCase, status: 'PASS' });
                } else {
                    console.log(`  ❌ ${testCase.description}`);
                    console.log(`     入力: "${testCase.input}"`);
                    if (testCase.testText) {
                        console.log(`     テスト文字列: "${testCase.testText}"`);
                    }
                    console.log(`     期待: ${JSON.stringify(testCase.expected)}`);
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

    return {
        total: totalTests,
        passed: passedTests,
        failed: totalTests - passedTests,
        results: results
    };
}

// ブラウザ環境での実行用
if (typeof window !== 'undefined') {
    window.runPavilionSearchTests = runPavilionSearchTests;
    window.prepare_filter = prepare_filter;
}

// Node.js環境での実行用
if (typeof module !== 'undefined') {
    module.exports = {
        runPavilionSearchTests,
        prepare_filter,
        pavilionSearchTests
    };
}