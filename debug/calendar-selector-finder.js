// カレンダーセレクタ特定スクリプト
// Developer Consoleに貼り付けて実行してください

console.log('🔍 カレンダーセレクタ特定スクリプト実行中...');

// 1. カレンダーテーブルを特定
function findCalendarTable() {
    console.log('\n📋 カレンダーテーブル候補:');
    
    const candidates = [
        'table',
        '[class*="calendar"]',
        '[class*="table"]'
    ];
    
    candidates.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, i) => {
            const hasTimeElements = el.querySelectorAll('time[datetime]').length;
            if (hasTimeElements > 0) {
                console.log(`✅ ${selector}[${i}]: ${el.className} (time要素: ${hasTimeElements}個)`);
                console.log(`   outerHTML: ${el.outerHTML.substring(0, 100)}...`);
            }
        });
    });
}

// 2. 選択中の日付要素を特定
function findSelectedDate() {
    console.log('\n📅 選択中の日付候補:');
    
    const candidates = [
        '[aria-pressed="true"]',
        '[class*="selector_date"]',
        '[class*="selected"]',
        '[class*="active"]'
    ];
    
    candidates.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el, i) => {
            const timeEl = el.querySelector('time[datetime]');
            if (timeEl) {
                const datetime = timeEl.getAttribute('datetime');
                console.log(`✅ ${selector}[${i}]: ${el.className}`);
                console.log(`   日付: ${datetime}`);
                console.log(`   outerHTML: ${el.outerHTML.substring(0, 150)}...`);
            }
        });
    });
}

// 3. 全ての日付要素を一覧表示
function findAllDateElements() {
    console.log('\n📆 全日付要素:');
    
    const timeElements = document.querySelectorAll('time[datetime]');
    timeElements.forEach((el, i) => {
        if (i < 10) { // 最初の10個のみ表示
            const datetime = el.getAttribute('datetime');
            const parent = el.closest('div[role="button"]');
            const isSelected = parent?.getAttribute('aria-pressed') === 'true';
            const isDisabled = parent?.getAttribute('tabindex') === '-1';
            
            console.log(`[${i}] ${datetime}: ${isSelected ? '選択中' : ''}${isDisabled ? '無効' : '有効'}`);
            console.log(`    親クラス: ${parent?.className || 'なし'}`);
            
            if (isSelected) {
                console.log(`    🎯 選択中の要素: ${parent?.outerHTML.substring(0, 200)}...`);
            }
        }
    });
}

// 4. 推奨セレクタを生成
function generateRecommendedSelectors() {
    console.log('\n🎯 推奨セレクタ:');
    
    // カレンダーテーブル
    const table = document.querySelector('table:has(time[datetime])');
    if (table) {
        console.log(`カレンダーテーブル: table:has(time[datetime])`);
        console.log(`または: .${table.className.split(' ')[0]}`);
    }
    
    // 選択中の日付
    const selected = document.querySelector('[aria-pressed="true"] time[datetime]');
    if (selected) {
        const parent = selected.closest('div[role="button"]');
        const uniqueClass = Array.from(parent.classList).find(cls => cls.includes('selector_date') || cls.includes('selected'));
        if (uniqueClass) {
            console.log(`選択中日付: .${uniqueClass} time[datetime]`);
        }
        console.log(`汎用選択中日付: [aria-pressed="true"] time[datetime]`);
    }
    
    // 任意の日付
    console.log(`任意の日付: time[datetime]`);
    console.log(`日付ボタン: div[role="button"]:has(time[datetime])`);
    
    // クリック可能判定
    console.log(`クリック可能判定: div[role="button"][tabindex="0"]`);
    console.log(`クリック不可判定: div[role="button"][tabindex="-1"]`);
}

// 5. セレクタテスト関数
function testSelector(selector, description) {
    console.log(`\n🧪 テスト: ${description}`);
    console.log(`セレクタ: ${selector}`);
    
    try {
        const elements = document.querySelectorAll(selector);
        console.log(`結果: ${elements.length}個の要素が見つかりました`);
        
        if (elements.length > 0 && elements.length <= 3) {
            elements.forEach((el, i) => {
                console.log(`  [${i}] ${el.tagName} ${el.className}`);
                if (el.textContent) {
                    console.log(`      テキスト: ${el.textContent.trim().substring(0, 50)}`);
                }
            });
        }
    } catch (error) {
        console.log(`❌ エラー: ${error.message}`);
    }
}

// メイン実行
console.log('='.repeat(60));
findCalendarTable();
findSelectedDate();
findAllDateElements();
generateRecommendedSelectors();

console.log('\n='.repeat(60));
console.log('🧪 セレクタテスト実行中...');

// 各セレクタをテスト
testSelector('table:has(time[datetime])', 'カレンダーテーブル（構造ベース）');
testSelector('[class*="calendar_table"]', 'カレンダーテーブル（部分一致）');
testSelector('[aria-pressed="true"] time[datetime]', '選択中の日付（属性ベース）');
testSelector('[class*="selector_date"] time[datetime]', '選択中の日付（クラス部分一致）');
testSelector('time[datetime="2025-08-03"]', '特定日付（8/3）');
testSelector('div[role="button"][tabindex="0"]', 'クリック可能な日付ボタン');

console.log('\n✅ スクリプト実行完了！');
console.log('推奨セレクタを使用してコードを更新してください。');