/**
 * 正確な仕様に基づいた完全予約フローのシナリオテスト
 */

const { 
    generateUniqueTdSelector,
    getTdPositionInfo,
    findSameTdElement,
    extractTdStatus,
    timeSlotSelectors,
    multiTargetManager,
    checkTimeSlotTableExistsSync,
    validatePageLoaded,
    checkVisitTimeButtonState,
    canStartReservation
} = require('../dist/test-exports-real.js');

describe('完全予約フローシナリオテスト', () => {
    beforeEach(() => {
        // DOM環境をクリア
        document.body.innerHTML = '';
        // 状態をクリア
        multiTargetManager.clearAll();
        
        // モック関数をリセット
        jest.clearAllMocks();
        
        // 実際の稼働サイト構造に基づくHTML設定
        document.body.innerHTML = `
            <div id="__next">
                <div class="calendar-container">
                    <table class="calendar_table">
                        <tr><td><time datetime="2025-04-20">20</time></td></tr>
                    </table>
                </div>
                <table class="time-slot-table">
                    <tr>
                        <td data-gray-out="true" class="east-slot">
                            <div role="button" data-disabled="true">
                                <dl>
                                    <dt><span>9:00-</span></dt>
                                </dl>
                                <img src="/calendar_ng.svg">
                            </div>
                        </td>
                        <td data-gray-out="true" class="west-slot">
                            <div role="button" data-disabled="true">
                                <dl>
                                    <dt><span>9:00-</span></dt>
                                </dl>
                                <img src="/calendar_ng.svg">
                            </div>
                        </td>
                    </tr>
                    <tr>
                        <td data-gray-out="true" class="east-slot">
                            <div role="button" data-disabled="true">
                                <dl>
                                    <dt><span>10:00-</span></dt>
                                </dl>
                                <img src="/calendar_ng.svg">
                            </div>
                        </td>
                        <td data-gray-out="true" class="west-slot">
                            <div role="button" data-disabled="true">
                                <dl>
                                    <dt><span>10:00-</span></dt>
                                </dl>
                                <img src="/calendar_ng.svg">
                            </div>
                        </td>
                    </tr>
                </table>
                <button class="basic-btn type2 style_full__ptzZq">来場日時設定</button>
            </div>
        `;
    });

    describe('シナリオ1: 即座に利用可能な時間帯での完全予約フロー', () => {
        test('東9:00-が利用可能な状態での即座予約', async () => {
            // 1. ページ初期化
            expect(validatePageLoaded()).toBe(true);
            expect(checkTimeSlotTableExistsSync()).toBe(true);
            
            // 2. 時間帯状態の確認
            const eastSlot = document.querySelector('.time-slot-table tr:first-child td:first-child');
            const westSlot = document.querySelector('.time-slot-table tr:first-child td:last-child');
            
            // デバッグ: 要素の存在確認  
            console.log('🔍 eastSlot:', eastSlot);
            console.log('🔍 eastSlot.innerHTML:', eastSlot ? eastSlot.innerHTML : 'null');
            const eastButton = eastSlot ? eastSlot.querySelector('div[role="button"]') : null;
            console.log('🔍 eastButton:', eastButton);
            console.log('🔍 eastButton.innerHTML:', eastButton ? eastButton.innerHTML : 'null');
            const timeSpan = eastButton ? eastButton.querySelector('dt span') : null;
            console.log('🔍 timeSpan:', timeSpan);
            console.log('🔍 timeSpan textContent:', timeSpan ? timeSpan.textContent : 'null');
            
            expect(eastSlot).not.toBe(null);
            expect(westSlot).not.toBe(null);
            
            // 東9:00-を利用可能状態に変更
            const eastButtonElement = eastSlot.querySelector('div[role="button"]');
            console.log('eastButtonElement:', eastButtonElement);
            expect(eastButtonElement).not.toBe(null);
            
            eastButtonElement.setAttribute('data-disabled', 'false');
            eastButtonElement.querySelector('img').src = '/ico_scale_low.svg';
            
            // 3. 時間帯分析
            const eastStatus = extractTdStatus(eastSlot);
            const westStatus = extractTdStatus(westSlot);
            
            expect(eastStatus.timeText).toBe('9:00-');
            expect(eastStatus.status).toBe('available');
            expect(eastStatus.isAvailable).toBe(true);
            
            expect(westStatus.timeText).toBe('9:00-');
            expect(westStatus.status).toBe('full');
            expect(westStatus.isFull).toBe(true);
            
            // 4. セレクタ生成と東西判定
            const eastSelector = generateUniqueTdSelector(eastSlot);
            const westSelector = generateUniqueTdSelector(westSlot);
            
            // nth-child(1) = 東、nth-child(2) = 西
            expect(eastSelector).toContain('nth-child(1)');
            expect(westSelector).toContain('nth-child(2)');
            
            // 5. 位置情報の取得
            const eastPosition = getTdPositionInfo(eastSlot);
            const westPosition = getTdPositionInfo(westSlot);
            
            expect(eastPosition.rowIndex).toBe(0);
            expect(eastPosition.cellIndex).toBe(0);
            expect(westPosition.rowIndex).toBe(0);
            expect(westPosition.cellIndex).toBe(1);
            
            // 6. 予約開始可能性チェック
            // 東9:00-が選択された状態をシミュレート
            eastButtonElement.setAttribute('aria-pressed', 'true');
            eastButtonElement.classList.add('selected');
            
            // デバッグ: canStartReservation の詳細チェック
            console.log('=== canStartReservation デバッグ ===');
            console.log('checkTimeSlotTableExistsSync():', checkTimeSlotTableExistsSync());
            console.log('validatePageLoaded():', validatePageLoaded());
            console.log('checkVisitTimeButtonState():', checkVisitTimeButtonState());
            
            const result = canStartReservation();
            console.log('canStartReservation() result:', result);
            expect(result).toBe(true);
        });
    });

    describe('シナリオ2: 複数監視から自動予約への完全フロー', () => {
        test('東西複数時間帯の監視設定と優先度管理', () => {
            // 全ての時間帯を満員状態に設定
            const allSlots = document.querySelectorAll('td[data-gray-out]');
            allSlots.forEach(slot => {
                const button = slot.querySelector('[role="button"]');
                button.setAttribute('data-disabled', 'true');
                const img = slot.querySelector('img');
                img.src = '/calendar_ng.svg';
            });
            
            // 1. 第1希望：東9:00-の監視開始
            const east9Slot = document.querySelector('.time-slot-table tr:first-child td:first-child');
            const east9Selector = generateUniqueTdSelector(east9Slot);
            const east9Status = extractTdStatus(east9Slot);
            
            const east9Target = {
                timeText: east9Status.timeText,
                tdSelector: east9Selector,
                positionInfo: getTdPositionInfo(east9Slot),
                status: east9Status
            };
            
            const added1 = multiTargetManager.addTarget(east9Target);
            expect(added1).toBe(true);
            
            // 2. 第2希望：西10:00-の監視開始
            const west10Slot = document.querySelector('.time-slot-table tr:last-child td:last-child');
            const west10Selector = generateUniqueTdSelector(west10Slot);
            const west10Status = extractTdStatus(west10Slot);
            
            const west10Target = {
                timeText: west10Status.timeText,
                tdSelector: west10Selector,
                positionInfo: getTdPositionInfo(west10Slot),
                status: west10Status
            };
            
            const added2 = multiTargetManager.addTarget(west10Target);
            expect(added2).toBe(true);
            
            // 3. 監視対象の確認
            const targets = multiTargetManager.getTargets();
            expect(targets).toHaveLength(2);
            
            // 優先度確認（追加順）
            expect(targets[0].timeText).toBe('9:00-');
            expect(targets[0].tdSelector).toContain('nth-child(1)'); // 東
            expect(targets[1].timeText).toBe('10:00-');
            expect(targets[1].tdSelector).toContain('nth-child(2)'); // 西
            
            // 4. 東西判定のテスト
            const location1 = multiTargetManager.getLocationFromSelector(targets[0].tdSelector);
            const location2 = multiTargetManager.getLocationFromSelector(targets[1].tdSelector);
            
            expect(location1).toBe('東');
            expect(location2).toBe('西');
            
            // 5. 選択状態の確認
            expect(multiTargetManager.isSelected('9:00-', east9Selector)).toBe(true);
            expect(multiTargetManager.isSelected('10:00-', west10Selector)).toBe(true);
            
            // 6. 次の監視対象取得（優先度順）
            const currentTargets = multiTargetManager.getTargets();
            const nextTarget = currentTargets[0]; // 最高優先度（最初）のターゲット
            expect(nextTarget.timeText).toBe('9:00-');
            expect(nextTarget.tdSelector).toBe(east9Selector);
        });

        test('監視中時間帯の状態変化検出と自動処理', () => {
            // 初期状態：全て満員
            const east9Slot = document.querySelector('.time-slot-table tr:first-child td:first-child');
            const west10Slot = document.querySelector('.time-slot-table tr:last-child td:last-child');
            
            // 監視対象に追加
            const east9Selector = generateUniqueTdSelector(east9Slot);
            const west10Selector = generateUniqueTdSelector(west10Slot);
            
            multiTargetManager.addTarget({
                timeText: '9:00-',
                tdSelector: east9Selector,
                positionInfo: getTdPositionInfo(east9Slot),
                status: extractTdStatus(east9Slot)
            });
            
            multiTargetManager.addTarget({
                timeText: '10:00-',
                tdSelector: west10Selector,
                positionInfo: getTdPositionInfo(west10Slot),
                status: extractTdStatus(west10Slot)
            });
            
            // 状態変化：西10:00-が利用可能になる
            const west10Button = west10Slot.querySelector('[role="button"]');
            west10Button.setAttribute('data-disabled', 'false');
            west10Button.querySelector('img').src = '/ico_scale_low.svg';
            
            // 状態変化後の検証
            const updatedStatus = extractTdStatus(west10Slot);
            expect(updatedStatus.status).toBe('available');
            expect(updatedStatus.isAvailable).toBe(true);
            
            // 優先度2の西10:00-が利用可能になったことを確認
            const targets = multiTargetManager.getTargets();
            const targetToProcess = targets.find(t => 
                t.timeText === '10:00-' && t.tdSelector === west10Selector
            );
            
            expect(targetToProcess).toBeDefined();
            
            // 自動予約処理対象として特定されることを確認
            const availableTarget = targets.find(target => {
                const element = findSameTdElement(target);
                if (element) {
                    const currentStatus = extractTdStatus(element);
                    return currentStatus && currentStatus.isAvailable;
                }
                return false;
            });
            
            expect(availableTarget).toBeDefined();
            expect(availableTarget.timeText).toBe('10:00-');
            
            // 西10:00-が選択されることを確認
            const location = multiTargetManager.getLocationFromSelector(availableTarget.tdSelector);
            expect(location).toBe('西');
        });
    });

    describe('シナリオ3: 状態復元の完全フロー', () => {
        test('複数監視状態のキャッシュと復元', () => {
            // 1. 複数監視状態を作成
            const targets = [
                {
                    timeText: '9:00-',
                    tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                    positionInfo: { row: 0, col: 0 },
                    status: { isFull: true, isAvailable: false, status: 'full' }
                },
                {
                    timeText: '10:00-',
                    tdSelector: 'table tr:nth-child(2) td:nth-child(2)[data-gray-out]',
                    positionInfo: { row: 1, col: 1 },
                    status: { isFull: true, isAvailable: false, status: 'full' }
                },
                {
                    timeText: '11:00-',
                    tdSelector: 'table tr:nth-child(3) td:nth-child(1)[data-gray-out]',
                    positionInfo: { row: 2, col: 0 },
                    status: { isFull: true, isAvailable: false, status: 'full' }
                }
            ];
            
            // 2. 監視対象に追加
            targets.forEach(target => {
                const added = multiTargetManager.addTarget(target);
                expect(added).toBe(true);
            });
            
            // 3. 状態確認
            const currentTargets = multiTargetManager.getTargets();
            expect(currentTargets).toHaveLength(3);
            
            // 4. 東西判定の確認
            const locations = currentTargets.map(target => 
                multiTargetManager.getLocationFromSelector(target.tdSelector)
            );
            expect(locations).toEqual(['東', '西', '東']);
            
            // 5. 優先度順の確認
            expect(currentTargets[0].timeText).toBe('9:00-');  // 優先度1: 東9:00-
            expect(currentTargets[1].timeText).toBe('10:00-'); // 優先度2: 西10:00-
            expect(currentTargets[2].timeText).toBe('11:00-'); // 優先度3: 東11:00-
            
            // 6. 復元シミュレーション（状態クリア後の復元）
            const backupTargets = [...currentTargets];
            multiTargetManager.clearAll();
            expect(multiTargetManager.getTargets()).toHaveLength(0);
            
            // 7. 状態復元
            backupTargets.forEach(target => {
                multiTargetManager.addTarget(target);
            });
            
            // 8. 復元後の確認
            const restoredTargets = multiTargetManager.getTargets();
            expect(restoredTargets).toHaveLength(3);
            expect(restoredTargets[0].timeText).toBe('9:00-');
            expect(restoredTargets[1].timeText).toBe('10:00-');
            expect(restoredTargets[2].timeText).toBe('11:00-');
            
            // 9. 東西判定も正しく復元されることを確認
            const restoredLocations = restoredTargets.map(target => 
                multiTargetManager.getLocationFromSelector(target.tdSelector)
            );
            expect(restoredLocations).toEqual(['東', '西', '東']);
        });

        test('部分的な状態変化後の復元', () => {
            // 1. 初期監視状態
            const initialTargets = [
                {
                    timeText: '9:00-',
                    tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                    positionInfo: { row: 0, col: 0 }
                },
                {
                    timeText: '10:00-',
                    tdSelector: 'table tr:nth-child(2) td:nth-child(2)[data-gray-out]',
                    positionInfo: { row: 1, col: 1 }
                }
            ];
            
            initialTargets.forEach(target => multiTargetManager.addTarget(target));
            
            // 2. 一部監視対象を削除（予約成功をシミュレート）
            const removedTarget = multiTargetManager.getTargets()[0];
            const removed = multiTargetManager.removeTarget(removedTarget.timeText, removedTarget.tdSelector);
            expect(removed).toBe(true);
            
            // 3. 残った監視対象の確認
            const remainingTargets = multiTargetManager.getTargets();
            expect(remainingTargets).toHaveLength(1);
            expect(remainingTargets[0].timeText).toBe('10:00-');
            
            // 西10:00-が残っていることを確認
            const location = multiTargetManager.getLocationFromSelector(remainingTargets[0].tdSelector);
            expect(location).toBe('西');
            
            // 4. 新しい監視対象を追加
            const newTarget = {
                timeText: '11:00-',
                tdSelector: 'table tr:nth-child(3) td:nth-child(1)[data-gray-out]',
                positionInfo: { row: 2, col: 0 }
            };
            
            multiTargetManager.addTarget(newTarget);
            
            // 5. 最終状態の確認
            const finalTargets = multiTargetManager.getTargets();
            expect(finalTargets).toHaveLength(2);
            
            // 優先度が正しく調整されることを確認
            expect(finalTargets[0].timeText).toBe('10:00-'); // 元の優先度2が優先度1に
            expect(finalTargets[1].timeText).toBe('11:00-'); // 新規追加が優先度2に
            
            const finalLocations = finalTargets.map(target => 
                multiTargetManager.getLocationFromSelector(target.tdSelector)
            );
            expect(finalLocations).toEqual(['西', '東']);
        });
    });
});