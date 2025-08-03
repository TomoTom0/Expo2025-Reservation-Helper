/**
 * 時間帯監視システムのテスト
 * 実際のindex.jsの時間帯関連関数をテスト
 */

const { 
    generateUniqueTdSelector,
    getTdPositionInfo,
    findSameTdElement,
    extractTdStatus,
    timeSlotSelectors,
    multiTargetManager
} = require('../src/index.js');

describe('時間帯監視システム', () => {
    beforeEach(() => {
        // DOM環境をクリア
        document.body.innerHTML = '';
        // multiTargetManager状態をクリア
        multiTargetManager.clearAll();
    });

    describe('要素セレクタ生成', () => {
        test('td要素からの一意セレクタ生成', () => {
            // テーブル構造を作成
            const table = document.createElement('table');
            const row1 = document.createElement('tr');
            const row2 = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            const cell3 = document.createElement('td');
            
            cell1.setAttribute('data-gray-out', '');
            cell2.setAttribute('data-gray-out', '');
            cell3.setAttribute('data-gray-out', '');
            
            row1.appendChild(cell1);
            row1.appendChild(cell2);
            row2.appendChild(cell3);
            table.appendChild(row1);
            table.appendChild(row2);
            document.body.appendChild(table);
            
            // セレクタ生成テスト
            expect(generateUniqueTdSelector(cell1)).toBe('table tr:nth-child(1) td:nth-child(1)[data-gray-out]');
            expect(generateUniqueTdSelector(cell2)).toBe('table tr:nth-child(1) td:nth-child(2)[data-gray-out]');
            expect(generateUniqueTdSelector(cell3)).toBe('table tr:nth-child(2) td:nth-child(1)[data-gray-out]');
        });

        test('td要素の位置情報取得', () => {
            const table = document.createElement('table');
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            const cell2 = document.createElement('td');
            
            row.appendChild(cell1);
            row.appendChild(cell2);
            table.appendChild(row);
            document.body.appendChild(table);
            
            expect(getTdPositionInfo(cell1)).toEqual({ rowIndex: 0, cellIndex: 0 });
            expect(getTdPositionInfo(cell2)).toEqual({ rowIndex: 0, cellIndex: 1 });
        });
    });

    describe('要素検索機能', () => {
        test('セレクタによる要素検索', () => {
            const table = document.createElement('table');
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('data-gray-out', '');
            
            row.appendChild(cell);
            table.appendChild(row);
            document.body.appendChild(table);
            
            const targetInfo = {
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]'
            };
            
            const foundElement = findSameTdElement(targetInfo);
            expect(foundElement).toBe(cell);
        });

        test('位置情報による要素検索（フォールバック）', () => {
            const table = document.createElement('table');
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('data-gray-out', '');
            
            row.appendChild(cell);
            table.appendChild(row);
            document.body.appendChild(table);
            
            const targetInfo = {
                tdSelector: 'invalid-selector', // 無効なセレクタ
                positionInfo: { rowIndex: 0, cellIndex: 0 }
            };
            
            const foundElement = findSameTdElement(targetInfo);
            expect(foundElement).toBe(cell);
        });

        test('要素が見つからない場合', () => {
            const targetInfo = {
                tdSelector: 'table tr:nth-child(999) td:nth-child(999)[data-gray-out]',
                positionInfo: { rowIndex: 999, cellIndex: 999 }
            };
            
            const foundElement = findSameTdElement(targetInfo);
            expect(foundElement).toBe(null);
        });
    });

    describe('時間帯状態抽出', () => {
        test('満員状態の正しい判定', () => {
            const td = document.createElement('td');
            td.setAttribute('data-gray-out', '');
            
            const button = document.createElement('div');
            button.setAttribute('role', 'button');
            button.setAttribute('data-disabled', 'true');
            
            const dl = document.createElement('dl');
            const dt = document.createElement('dt');
            const span = document.createElement('span');
            span.textContent = '9:00-';
            dt.appendChild(span);
            
            const dd = document.createElement('dd');
            const img = document.createElement('img');
            img.src = '/asset/img/calendar_ng.svg';
            img.alt = '満員です(予約不可)';
            dd.appendChild(img);
            
            dl.appendChild(dt);
            dl.appendChild(dd);
            button.appendChild(dl);
            td.appendChild(button);
            
            const status = extractTdStatus(td);
            
            expect(status).not.toBe(null);
            expect(status.timeText).toBe('9:00-');
            expect(status.status).toBe('full');
            // isFullは hasFullIcon && isDisabled の結果なので、
            // hasFullIconが要素を返している場合、truthy値となる
            expect(status.isFull).toBeTruthy();
            expect(status.isAvailable).toBe(false);
            expect(status.isSelected).toBe(false);
        });

        test('利用可能状態の正しい判定', () => {
            const td = document.createElement('td');
            td.setAttribute('data-gray-out', '');
            
            const button = document.createElement('div');
            button.setAttribute('role', 'button');
            // data-disabled属性なし（利用可能）
            
            const dl = document.createElement('dl');
            const dt = document.createElement('dt');
            const span = document.createElement('span');
            span.textContent = '10:00-';
            dt.appendChild(span);
            
            const dd = document.createElement('dd');
            const img = document.createElement('img');
            img.src = '/asset/img/ico_scale_low.svg';
            img.alt = '空いています';
            dd.appendChild(img);
            
            dl.appendChild(dt);
            dl.appendChild(dd);
            button.appendChild(dl);
            td.appendChild(button);
            
            const status = extractTdStatus(td);
            
            expect(status).not.toBe(null);
            expect(status.timeText).toBe('10:00-');
            expect(status.status).toBe('available');
            expect(status.isFull).toBe(false);
            // isAvailableは !isDisabled && (hasLowIcon || hasHighIcon) の結果
            expect(status.isAvailable).toBeTruthy();
            expect(status.isSelected).toBe(false);
        });

        test('選択済み状態の正しい判定', () => {
            const td = document.createElement('td');
            td.setAttribute('data-gray-out', '');
            
            const button = document.createElement('div');
            button.setAttribute('role', 'button');
            button.setAttribute('aria-pressed', 'true');
            
            const dl = document.createElement('dl');
            const dt = document.createElement('dt');
            const span = document.createElement('span');
            span.textContent = '11:00-';
            dt.appendChild(span);
            dl.appendChild(dt);
            button.appendChild(dl);
            td.appendChild(button);
            
            const status = extractTdStatus(td);
            
            expect(status).not.toBe(null);
            expect(status.timeText).toBe('11:00-');
            expect(status.status).toBe('selected');
            expect(status.isSelected).toBe(true);
        });

        test('不正な要素の場合null返却', () => {
            expect(extractTdStatus(null)).toBe(null);
            
            const emptyTd = document.createElement('td');
            expect(extractTdStatus(emptyTd)).toBe(null);
        });
    });

    describe('複数監視対象管理', () => {
        test('監視対象の追加・重複チェック', () => {
            const slotInfo1 = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]'
            };
            
            const slotInfo2 = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(2)[data-gray-out]'
            };
            
            // 初回追加は成功
            expect(multiTargetManager.addTarget(slotInfo1)).toBe(true);
            expect(multiTargetManager.getCount()).toBe(1);
            
            // 同じ時間だが異なる位置（東西）は追加可能
            expect(multiTargetManager.addTarget(slotInfo2)).toBe(true);
            expect(multiTargetManager.getCount()).toBe(2);
            
            // 同じものを再度追加は失敗
            expect(multiTargetManager.addTarget(slotInfo1)).toBe(false);
            expect(multiTargetManager.getCount()).toBe(2);
        });

        test('監視対象の削除', () => {
            const slotInfo = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]'
            };
            
            multiTargetManager.addTarget(slotInfo);
            expect(multiTargetManager.getCount()).toBe(1);
            
            const removed = multiTargetManager.removeTarget(slotInfo.timeText, slotInfo.tdSelector);
            expect(removed).toBe(true);
            expect(multiTargetManager.getCount()).toBe(0);
            
            // 存在しないものの削除は失敗
            const removedAgain = multiTargetManager.removeTarget(slotInfo.timeText, slotInfo.tdSelector);
            expect(removedAgain).toBe(false);
        });

        test('監視対象の選択状態確認', () => {
            const slotInfo = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]'
            };
            
            expect(multiTargetManager.isSelected(slotInfo.timeText, slotInfo.tdSelector)).toBe(false);
            
            multiTargetManager.addTarget(slotInfo);
            expect(multiTargetManager.isSelected(slotInfo.timeText, slotInfo.tdSelector)).toBe(true);
        });

        test('全監視対象のクリア', () => {
            const slotInfo1 = { timeText: '9:00-', tdSelector: 'selector1' };
            const slotInfo2 = { timeText: '10:00-', tdSelector: 'selector2' };
            
            multiTargetManager.addTarget(slotInfo1);
            multiTargetManager.addTarget(slotInfo2);
            expect(multiTargetManager.getCount()).toBe(2);
            
            multiTargetManager.clearAll();
            expect(multiTargetManager.getCount()).toBe(0);
            expect(multiTargetManager.hasTargets()).toBe(false);
        });

        test('位置情報（東西）の取得', () => {
            const eastSelector = 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]';
            const westSelector = 'table tr:nth-child(1) td:nth-child(2)[data-gray-out]';
            const unknownSelector = 'invalid-selector';
            
            expect(multiTargetManager.getLocationFromSelector(eastSelector)).toBe('東');
            expect(multiTargetManager.getLocationFromSelector(westSelector)).toBe('西');
            expect(multiTargetManager.getLocationFromSelector(unknownSelector)).toBe('不明');
        });
    });

    describe('セレクタ定義の確認', () => {
        test('timeSlotSelectors定数の存在', () => {
            expect(timeSlotSelectors).toBeDefined();
            expect(timeSlotSelectors.timeSlotContainer).toBe('table');
            expect(timeSlotSelectors.timeSlotCells).toBe('td[data-gray-out] div[role=\'button\']');
            expect(timeSlotSelectors.fullIcon).toContain('calendar_ng.svg');
            expect(timeSlotSelectors.lowIcon).toContain('ico_scale_low.svg');
            expect(timeSlotSelectors.highIcon).toContain('ico_scale_high.svg');
        });
    });

    describe('統合テスト', () => {
        test('要素作成→セレクタ生成→検索→状態抽出の一連の流れ', () => {
            // DOM構造作成
            const table = document.createElement('table');
            const row = document.createElement('tr');
            const cell = document.createElement('td');
            cell.setAttribute('data-gray-out', '');
            
            const button = document.createElement('div');
            button.setAttribute('role', 'button');
            button.setAttribute('data-disabled', 'true');
            
            const dl = document.createElement('dl');
            const dt = document.createElement('dt');
            const span = document.createElement('span');
            span.textContent = '13:00-';
            dt.appendChild(span);
            
            const dd = document.createElement('dd');
            const img = document.createElement('img');
            img.src = '/asset/img/calendar_ng.svg';
            dd.appendChild(img);
            
            dl.appendChild(dt);
            dl.appendChild(dd);
            button.appendChild(dl);
            cell.appendChild(button);
            row.appendChild(cell);
            table.appendChild(row);
            document.body.appendChild(table);
            
            // 1. セレクタ生成
            const tdSelector = generateUniqueTdSelector(cell);
            const positionInfo = getTdPositionInfo(cell);
            
            // 2. 監視対象として追加
            const slotInfo = {
                timeText: '13:00-',
                tdSelector: tdSelector,
                positionInfo: positionInfo
            };
            
            multiTargetManager.addTarget(slotInfo);
            
            // 3. 要素検索
            const foundElement = findSameTdElement(slotInfo);
            expect(foundElement).toBe(cell);
            
            // 4. 状態抽出
            const status = extractTdStatus(foundElement);
            expect(status.timeText).toBe('13:00-');
            expect(status.status).toBe('full');
            
            // 5. 管理状態確認
            expect(multiTargetManager.isSelected('13:00-', tdSelector)).toBe(true);
            expect(multiTargetManager.getCount()).toBe(1);
        });
    });
});