// URL判定ロジックのオフラインテスト

// テスト対象関数（index.jsから抜粋）
const identify_page_type = (url) => {
    if (url.includes("ticket.expo2025.or.jp/event_search/")) {
        return "pavilion_reservation";
    } else if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
        return "entrance_reservation";
    }
    return null;
}

// テストケース
const testCases = [
    {
        name: "パビリオン予約URL - 基本",
        url: "https://ticket.expo2025.or.jp/event_search/",
        expected: "pavilion_reservation"
    },
    {
        name: "パビリオン予約URL - パラメータ付き",
        url: "https://ticket.expo2025.or.jp/event_search/123?param=value",
        expected: "pavilion_reservation"
    },
    {
        name: "入場予約URL - 基本",
        url: "https://ticket.expo2025.or.jp/ticket_visiting_reservation/",
        expected: "entrance_reservation"
    },
    {
        name: "入場予約URL - 複雑なパラメータ",
        url: "https://ticket.expo2025.or.jp/ticket_visiting_reservation/?screen_id=018%2C019&id=NCSQCZ9PC6&reserve_id=6267808&type=change",
        expected: "entrance_reservation"
    },
    {
        name: "関係ないURL",
        url: "https://example.com/",
        expected: null
    },
    {
        name: "万博サイトの別ページ",
        url: "https://ticket.expo2025.or.jp/other_page/",
        expected: null
    }
];

// テスト実行関数
function runUrlDetectionTests() {
    console.log("=== URL判定ロジック テスト開始 ===");
    
    let passCount = 0;
    let failCount = 0;
    
    testCases.forEach((testCase, index) => {
        const result = identify_page_type(testCase.url);
        const passed = result === testCase.expected;
        
        console.log(`テスト ${index + 1}: ${testCase.name}`);
        console.log(`  URL: ${testCase.url}`);
        console.log(`  期待値: ${testCase.expected}`);
        console.log(`  実際値: ${result}`);
        console.log(`  結果: ${passed ? '✅ PASS' : '❌ FAIL'}`);
        console.log('');
        
        if (passed) {
            passCount++;
        } else {
            failCount++;
        }
    });
    
    console.log("=== テスト結果 ===");
    console.log(`✅ 成功: ${passCount}`);
    console.log(`❌ 失敗: ${failCount}`);
    console.log(`📊 成功率: ${((passCount / testCases.length) * 100).toFixed(1)}%`);
    
    return { passCount, failCount, total: testCases.length };
}

// Node.js環境で直接実行する場合
if (typeof require !== 'undefined' && require.main === module) {
    console.log("URL判定テスト - 直接実行モード\n");
    runUrlDetectionTests();
} else {
    console.log("URL判定テストが読み込まれました。");
    console.log("実行するには: runUrlDetectionTests()");
}