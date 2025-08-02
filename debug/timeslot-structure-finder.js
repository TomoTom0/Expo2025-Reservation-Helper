// 時間帯テーブル構造確認スクリプト
// Developer Consoleに貼り付けて実行してください

console.log('🔍 時間帯テーブル構造確認スクリプト実行中...');

// 1. 時間帯テーブルの基本構造を確認
function analyzeTimeSlotTable() {
    console.log('\n📋 時間帯テーブル構造分析:');
    
    const tables = document.querySelectorAll('table');
    const timeSlotTable = Array.from(tables).find(table => 
        table.querySelectorAll('td[data-gray-out]').length > 0
    );
    
    if (!timeSlotTable) {
        console.log('❌ 時間帯テーブルが見つかりません');
        return null;
    }
    
    console.log(`✅ 時間帯テーブルを発見: ${timeSlotTable.className}`);
    
    const rows = timeSlotTable.querySelectorAll('tr');
    console.log(`📊 テーブル行数: ${rows.length}`);
    
    rows.forEach((row, rowIndex) => {
        const cells = row.querySelectorAll('td[data-gray-out]');
        if (cells.length > 0) {
            console.log(`  行[${rowIndex}]: ${cells.length}個のセル`);
            
            cells.forEach((cell, cellIndex) => {
                const timeSpan = cell.querySelector('dt span');
                const timeText = timeSpan?.textContent?.trim();
                if (timeText) {
                    console.log(`    セル[${cellIndex}]: ${timeText}`);
                }
            });
        }
    });
    
    return timeSlotTable;
}

// 2. 同じ時間の複数セル（東西）があるかを確認
function checkEastWestStructure() {
    console.log('\n🗺️ 東西構造確認:');
    
    const allCells = document.querySelectorAll('td[data-gray-out]');
    const timeGroups = {};
    
    allCells.forEach((cell, index) => {
        const timeSpan = cell.querySelector('dt span');
        const timeText = timeSpan?.textContent?.trim();
        
        if (timeText) {
            if (!timeGroups[timeText]) {
                timeGroups[timeText] = [];
            }
            
            const tdSelector = generateUniqueTdSelector(cell);
            timeGroups[timeText].push({
                index,
                cell,
                tdSelector,
                rowIndex: Array.from(cell.parentElement.parentElement.children).indexOf(cell.parentElement),
                cellIndex: Array.from(cell.parentElement.children).indexOf(cell)
            });
        }
    });
    
    console.log('時間別セル数:');
    Object.entries(timeGroups).forEach(([time, cells]) => {
        if (cells.length > 1) {
            console.log(`🔄 ${time}: ${cells.length}個のセル（東西あり）`);
            cells.forEach((cellInfo, i) => {
                console.log(`    [${i}]: 行${cellInfo.rowIndex} 列${cellInfo.cellIndex} (推定: ${i === 0 ? '東' : '西'})`);
                console.log(`        セレクタ: ${cellInfo.tdSelector}`);
            });
        } else {
            console.log(`📍 ${time}: 1個のセル`);
        }
    });
    
    return timeGroups;
}

// 3. 現在のURLから東西判定
function analyzeCurrentLocation() {
    console.log('\n🗺️ 現在の場所判定:');
    
    const url = window.location.href;
    console.log(`URL: ${url}`);
    
    let urlLocation = '不明';
    if (url.includes('osaka-east') || url.includes('east')) {
        urlLocation = '東';
    } else if (url.includes('osaka-west') || url.includes('west')) {
        urlLocation = '西';
    }
    
    console.log(`URL判定: ${urlLocation}`);
    
    // ページ内要素からの判定
    const eastIndicators = document.querySelectorAll('[class*="east"], [id*="east"], [data-area="east"]');
    const westIndicators = document.querySelectorAll('[class*="west"], [id*="west"], [data-area="west"]');
    
    console.log(`東の要素: ${eastIndicators.length}個`);
    console.log(`西の要素: ${westIndicators.length}個`);
    
    if (eastIndicators.length > 0) {
        console.log('要素判定: 東');
    } else if (westIndicators.length > 0) {
        console.log('要素判定: 西');
    } else {
        console.log('要素判定: 不明');
    }
}

// 4. 実際の構造を確認
function confirmActualStructure() {
    console.log('\n🎯 実際の構造確認:');
    
    // パビリオンの東西別時間帯があるか、それとも全時間帯が一つのテーブルか
    const allTimeTexts = Array.from(document.querySelectorAll('td[data-gray-out] dt span'))
        .map(span => span.textContent.trim())
        .filter(text => text.includes(':') || text.includes('時'));
    
    const uniqueTimes = [...new Set(allTimeTexts)];
    
    console.log(`全時間帯数: ${allTimeTexts.length}`);
    console.log(`ユニーク時間数: ${uniqueTimes.length}`);
    
    if (allTimeTexts.length > uniqueTimes.length) {
        console.log('🔄 同じ時間が複数存在 → 東西別の可能性あり');
        console.log('時間別出現回数:');
        uniqueTimes.forEach(time => {
            const count = allTimeTexts.filter(t => t === time).length;
            if (count > 1) {
                console.log(`  ${time}: ${count}回`);
            }
        });
    } else {
        console.log('📍 各時間は1回ずつ → 単一会場の可能性');
    }
}

// セレクタ生成関数
function generateUniqueTdSelector(tdElement) {
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    return `table tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})[data-gray-out]`;
}

// メイン実行
console.log('='.repeat(60));
analyzeTimeSlotTable();
checkEastWestStructure();
analyzeCurrentLocation();
confirmActualStructure();

console.log('\n='.repeat(60));
console.log('✅ 時間帯テーブル構造確認完了！');
console.log('結果に基づいて東西判定ロジックを修正してください。');