// 時間帯監視機能のオフラインテスト

// テスト用の擬似DOM環境構築
function createMockTimeSlotTable() {
    // 既存のテーブルがあれば削除
    const existingTable = document.querySelector('#test-table');
    if (existingTable) existingTable.remove();
    
    const table = document.createElement('table');
    table.id = 'test-table';
    
    // テスト用の時間帯データ
    const timeSlots = [
        { time: '9:00-', status: 'available', icon: 'ico_scale_low.svg' },
        { time: '11:00-', status: 'full', icon: 'calendar_ng.svg' },
        { time: '13:00-', status: 'available', icon: 'ico_scale_high.svg' },
        { time: '15:00-', status: 'selected', icon: 'ico_scale_low.svg' },
        { time: '17:00-', status: 'full', icon: 'calendar_ng.svg' }
    ];
    
    timeSlots.forEach((slot, index) => {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.setAttribute('data-gray-out', '');
        
        const div = document.createElement('div');
        div.setAttribute('role', 'button');
        div.className = 'style_main__button__Z4RWX';
        
        if (slot.status === 'full') {
            div.setAttribute('data-disabled', 'true');
        }
        if (slot.status === 'selected') {
            div.setAttribute('aria-pressed', 'true');
            div.classList.add('style_active__JTpSq');
        } else {
            div.setAttribute('aria-pressed', 'false');
        }
        
        const dl = document.createElement('dl');
        const dt = document.createElement('dt');
        const span = document.createElement('span');
        span.textContent = slot.time;
        dt.appendChild(span);
        
        const dd = document.createElement('dd');
        dd.setAttribute('data-gray-out', '');
        const img = document.createElement('img');
        img.src = `/asset/img/${slot.icon}`;
        img.alt = slot.status === 'full' ? '満員です(予約不可)' : 
                  slot.status === 'available' ? '空いています' : '混雑が予想されます';
        dd.appendChild(img);
        
        dl.appendChild(dt);
        dl.appendChild(dd);
        div.appendChild(dl);
        cell.appendChild(div);
        row.appendChild(cell);
        table.appendChild(row);
    });
    
    document.body.appendChild(table);
    return table;
}

// テスト用の時間帯セレクタ（src/index.jsから移植）
const timeSlotSelectors = {
    timeSlotContainer: "table",
    timeSlotCells: "td[data-gray-out] div[role='button']",
    availableSlots: "td[data-gray-out] div[role='button']:not([data-disabled='true'])",
    fullSlots: "td[data-gray-out] div[role='button'][data-disabled='true']",
    selectedSlot: "td[data-gray-out] div[role='button'][aria-pressed='true']",
    lowIcon: "img[src*='ico_scale_low.svg']",
    highIcon: "img[src*='ico_scale_high.svg']", 
    fullIcon: "img[src*='calendar_ng.svg']"
};

// src/index.jsから必要な関数を移植
function generateUniqueTdSelector(tdElement) {
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    return `table tr:nth-child(${rowIndex + 1}) td:nth-child(${cellIndex + 1})[data-gray-out]`;
}

function getTdPositionInfo(tdElement) {
    const row = tdElement.parentElement;
    const rowIndex = Array.from(row.parentElement.children).indexOf(row);
    const cellIndex = Array.from(row.children).indexOf(tdElement);
    
    return { rowIndex, cellIndex };
}

function findSameTdElement(targetInfo) {
    if (targetInfo.tdSelector) {
        const element = document.querySelector(targetInfo.tdSelector);
        if (element) {
            return element;
        }
    }
    
    if (targetInfo.positionInfo && targetInfo.positionInfo.rowIndex !== undefined && targetInfo.positionInfo.cellIndex !== undefined) {
        const table = document.querySelector(timeSlotSelectors.timeSlotContainer);
        if (table) {
            const rows = table.querySelectorAll('tr');
            if (rows[targetInfo.positionInfo.rowIndex]) {
                const cells = rows[targetInfo.positionInfo.rowIndex].querySelectorAll('td[data-gray-out]');
                if (cells[targetInfo.positionInfo.cellIndex]) {
                    return cells[targetInfo.positionInfo.cellIndex];
                }
            }
        }
    }
    
    return null;
}

function extractTdStatus(tdElement) {
    if (!tdElement) return null;
    
    const buttonDiv = tdElement.querySelector('div[role="button"]');
    if (!buttonDiv) return null;
    
    const timeSpan = buttonDiv.querySelector('dt span');
    const timeText = timeSpan ? timeSpan.textContent.trim() : '';
    
    // 満員判定
    const isDisabled = buttonDiv.hasAttribute('data-disabled') && buttonDiv.getAttribute('data-disabled') === 'true';
    const hasFullIcon = buttonDiv.querySelector(timeSlotSelectors.fullIcon);
    const isFull = isDisabled && hasFullIcon;
    
    // 利用可能判定
    const hasLowIcon = buttonDiv.querySelector(timeSlotSelectors.lowIcon);
    const hasHighIcon = buttonDiv.querySelector(timeSlotSelectors.highIcon);
    const isAvailable = !isDisabled && (hasLowIcon || hasHighIcon);
    
    // 選択済み判定
    const isSelected = buttonDiv.getAttribute('aria-pressed') === 'true';
    
    let status = 'unknown';
    if (isFull) status = 'full';
    else if (isSelected) status = 'selected';
    else if (isAvailable) status = 'available';
    
    return {
        timeText,
        status,
        isFull,
        isAvailable,
        isSelected,
        element: tdElement,
        buttonDiv
    };
}

// テスト実行関数群
function testSelectorAccuracy() {
    console.log('🔍 セレクタ精度テスト開始');
    let passCount = 0;
    let totalCount = 0;
    
    // テーブル作成
    const table = createMockTimeSlotTable();
    
    // 1. 基本セレクタテスト
    totalCount++;
    const allCells = document.querySelectorAll(timeSlotSelectors.timeSlotCells);
    if (allCells.length === 5) {
        console.log('✅ 基本セレクタ: 5個の時間帯セルを正確に検出');
        passCount++;
    } else {
        console.log(`❌ 基本セレクタ: 期待5個、実際${allCells.length}個`);
    }
    
    // 2. 満員セレクタテスト
    totalCount++;
    const fullSlots = document.querySelectorAll(timeSlotSelectors.fullSlots);
    if (fullSlots.length === 2) {
        console.log('✅ 満員セレクタ: 2個の満員スロットを正確に検出');
        passCount++;
    } else {
        console.log(`❌ 満員セレクタ: 期待2個、実際${fullSlots.length}個`);
    }
    
    // 3. 利用可能セレクタテスト
    totalCount++;
    const availableSlots = document.querySelectorAll(timeSlotSelectors.availableSlots);
    if (availableSlots.length === 3) { // available(2) + selected(1)
        console.log('✅ 利用可能セレクタ: 3個の利用可能スロットを正確に検出');
        passCount++;
    } else {
        console.log(`❌ 利用可能セレクタ: 期待3個、実際${availableSlots.length}個`);
    }
    
    // 4. 選択済みセレクタテスト
    totalCount++;
    const selectedSlots = document.querySelectorAll(timeSlotSelectors.selectedSlot);
    if (selectedSlots.length === 1) {
        console.log('✅ 選択済みセレクタ: 1個の選択済みスロットを正確に検出');
        passCount++;
    } else {
        console.log(`❌ 選択済みセレクタ: 期待1個、実際${selectedSlots.length}個`);
    }
    
    table.remove();
    console.log(`セレクタ精度テスト完了: ${passCount}/${totalCount} 成功`);
    return { passCount, totalCount };
}

function testElementIdentification() {
    console.log('🎯 要素特定機能テスト開始');
    let passCount = 0;
    let totalCount = 0;
    
    // テーブル作成
    const table = createMockTimeSlotTable();
    
    // 1. 一意セレクタ生成テスト
    totalCount++;
    const firstCell = table.querySelector('td[data-gray-out]');
    const uniqueSelector = generateUniqueTdSelector(firstCell);
    if (uniqueSelector.includes('tr:nth-child(1)') && uniqueSelector.includes('td:nth-child(1)')) {
        console.log('✅ 一意セレクタ生成: 正しい形式で生成');
        passCount++;
    } else {
        console.log(`❌ 一意セレクタ生成: 予期しない形式 "${uniqueSelector}"`);
    }
    
    // 2. 位置情報取得テスト
    totalCount++;
    const positionInfo = getTdPositionInfo(firstCell);
    if (positionInfo.rowIndex === 0 && positionInfo.cellIndex === 0) {
        console.log('✅ 位置情報取得: 正しい位置情報を取得');
        passCount++;
    } else {
        console.log(`❌ 位置情報取得: 期待(0,0)、実際(${positionInfo.rowIndex},${positionInfo.cellIndex})`);
    }
    
    // 3. 同一要素検索テスト
    totalCount++;
    const targetInfo = {
        timeText: '9:00-',
        tdSelector: uniqueSelector,
        positionInfo: positionInfo
    };
    const foundElement = findSameTdElement(targetInfo);
    if (foundElement === firstCell) {
        console.log('✅ 同一要素検索: セレクタ経由で正しい要素を発見');
        passCount++;
    } else {
        console.log('❌ 同一要素検索: セレクタ経由で要素を発見できない');
    }
    
    // 4. セレクタ削除後の位置情報フォールバック
    totalCount++;
    const targetInfoFallback = {
        timeText: '9:00-',
        tdSelector: 'invalid-selector',
        positionInfo: positionInfo
    };
    const foundElementFallback = findSameTdElement(targetInfoFallback);
    if (foundElementFallback === firstCell) {
        console.log('✅ フォールバック検索: 位置情報経由で正しい要素を発見');
        passCount++;
    } else {
        console.log('❌ フォールバック検索: 位置情報経由で要素を発見できない');
    }
    
    table.remove();
    console.log(`要素特定機能テスト完了: ${passCount}/${totalCount} 成功`);
    return { passCount, totalCount };
}

function testStatusDetection() {
    console.log('📊 状態判定機能テスト開始');
    let passCount = 0;
    let totalCount = 0;
    
    // テーブル作成
    const table = createMockTimeSlotTable();
    const cells = Array.from(table.querySelectorAll('td[data-gray-out]'));
    
    // 期待される状態
    const expectedStates = ['available', 'full', 'available', 'selected', 'full'];
    
    cells.forEach((cell, index) => {
        totalCount++;
        const status = extractTdStatus(cell);
        const expected = expectedStates[index];
        
        if (status && status.status === expected) {
            console.log(`✅ ${status.timeText}: ${expected}状態を正確に判定`);
            passCount++;
        } else {
            console.log(`❌ ${status?.timeText || 'unknown'}: 期待${expected}、実際${status?.status || 'null'}`);
        }
    });
    
    table.remove();
    console.log(`状態判定機能テスト完了: ${passCount}/${totalCount} 成功`);
    return { passCount, totalCount };
}

function testMonitoringTargetStorage() {
    console.log('💾 監視対象保存機能テスト開始');
    let passCount = 0;
    let totalCount = 0;
    
    // テーブル作成
    const table = createMockTimeSlotTable();
    const fullCell = table.querySelectorAll('td[data-gray-out]')[1]; // 11:00- (満員)
    
    // 1. 完全な監視対象情報作成テスト
    totalCount++;
    const status = extractTdStatus(fullCell);
    const targetSlotInfo = {
        ...status,
        tdSelector: generateUniqueTdSelector(fullCell),
        positionInfo: getTdPositionInfo(fullCell)
    };
    
    if (targetSlotInfo.timeText === '11:00-' && 
        targetSlotInfo.status === 'full' &&
        targetSlotInfo.tdSelector && 
        targetSlotInfo.positionInfo) {
        console.log('✅ 監視対象情報作成: 完全な情報セットを作成');
        passCount++;
    } else {
        console.log('❌ 監視対象情報作成: 情報が不完全');
    }
    
    // 2. 復元機能テスト
    totalCount++;
    
    // テーブルを再作成（ページリロードをシミュレート）
    table.remove();
    const newTable = createMockTimeSlotTable();
    
    // 保存した情報で要素を再検索
    const restoredElement = findSameTdElement(targetSlotInfo);
    const restoredStatus = extractTdStatus(restoredElement);
    
    if (restoredStatus && 
        restoredStatus.timeText === '11:00-' && 
        restoredStatus.status === 'full') {
        console.log('✅ 監視対象復元: リロード後に正しい要素を復元');
        passCount++;
    } else {
        console.log('❌ 監視対象復元: リロード後の復元に失敗');
    }
    
    newTable.remove();
    console.log(`監視対象保存機能テスト完了: ${passCount}/${totalCount} 成功`);
    return { passCount, totalCount };
}

function testStateChangeDetection() {
    console.log('🔄 状態変化検出テスト開始');
    let passCount = 0;
    let totalCount = 0;
    
    // 初期テーブル作成
    const table = createMockTimeSlotTable();
    const targetCell = table.querySelectorAll('td[data-gray-out]')[1]; // 11:00- (満員)
    
    // 監視対象情報を保存
    const targetInfo = {
        timeText: '11:00-',
        tdSelector: generateUniqueTdSelector(targetCell),
        positionInfo: getTdPositionInfo(targetCell)
    };
    
    // 1. 満員状態の確認
    totalCount++;
    let currentStatus = extractTdStatus(findSameTdElement(targetInfo));
    if (currentStatus && currentStatus.status === 'full') {
        console.log('✅ 初期状態: 満員状態を正確に検出');
        passCount++;
    } else {
        console.log('❌ 初期状態: 満員状態の検出に失敗');
    }
    
    // 2. 状態変化をシミュレート（満員→利用可能）
    const buttonDiv = targetCell.querySelector('div[role="button"]');
    buttonDiv.removeAttribute('data-disabled');
    const img = buttonDiv.querySelector('img');
    img.src = '/asset/img/ico_scale_low.svg';
    img.alt = '空いています';
    
    // 3. 変化後の状態確認
    totalCount++;
    currentStatus = extractTdStatus(findSameTdElement(targetInfo));
    if (currentStatus && currentStatus.status === 'available') {
        console.log('✅ 状態変化検出: 満員→利用可能の変化を正確に検出');
        passCount++;
    } else {
        console.log('❌ 状態変化検出: 状態変化の検出に失敗');
    }
    
    table.remove();
    console.log(`状態変化検出テスト完了: ${passCount}/${totalCount} 成功`);
    return { passCount, totalCount };
}

// メインテスト実行関数
function runTimeSlotMonitoringTests() {
    console.log('🎡 時間帯監視機能オフラインテスト開始\n');
    console.log('='.repeat(50));
    
    const results = {
        selector: testSelectorAccuracy(),
        identification: testElementIdentification(),
        status: testStatusDetection(),
        storage: testMonitoringTargetStorage(),
        stateChange: testStateChangeDetection()
    };
    
    // 総合結果
    const totalPass = Object.values(results).reduce((sum, r) => sum + r.passCount, 0);
    const totalTests = Object.values(results).reduce((sum, r) => sum + r.totalCount, 0);
    const successRate = ((totalPass / totalTests) * 100).toFixed(1);
    
    console.log('='.repeat(50));
    console.log(`📊 総合結果: ${totalPass}/${totalTests} 成功 (${successRate}%)`);
    
    if (successRate >= 90) {
        console.log('🎉 優秀！監視機能は期待通りに動作します');
    } else if (successRate >= 70) {
        console.log('⚠️  一部問題がありますが基本機能は動作します');
    } else {
        console.log('❌ 重大な問題があります。修正が必要です');
    }
    
    return { passCount: totalPass, totalCount: totalTests, results };
}