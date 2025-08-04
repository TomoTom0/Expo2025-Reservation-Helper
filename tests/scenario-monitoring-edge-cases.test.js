/**
 * 監視機能のエッジケースとタイミングに関するシナリオテスト
 */

const { 
    generateUniqueTdSelector,
    getTdPositionInfo,
    findSameTdElement,
    extractTdStatus,
    multiTargetManager
} = require('../dist/test-exports-real.js');

describe('監視機能エッジケースシナリオテスト', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
        multiTargetManager.clearAll();
        jest.clearAllMocks();
        
        // より複雑な時間帯テーブルを設定（6時間帯 x 東西）
        document.body.innerHTML = `
            <div id="__next">
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
                    <tr>
                        <td data-gray-out="true" class="east-slot">
                            <div role="button" data-disabled="true">
                                <dl>
                                    <dt><span>11:00-</span></dt>
                                </dl>
                                <img src="/calendar_ng.svg">
                            </div>
                        </td>
                        <td data-gray-out="true" class="west-slot">
                            <div role="button" data-disabled="true">
                                <dl>
                                    <dt><span>11:00-</span></dt>
                                </dl>
                                <img src="/calendar_ng.svg">
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        `;
    });

    describe('シナリオ4: 最大監視対象数での複雑な優先度管理', () => {
        test('6つの時間帯全てを監視する複雑なケース', () => {
            // 全ての時間帯（東西各3つ = 計6つ）を監視対象に追加
            const allSlots = document.querySelectorAll('td[data-gray-out]');
            const expectedOrder = [];
            
            // 1. 全監視対象を順次追加
            allSlots.forEach((slot, index) => {
                const selector = generateUniqueTdSelector(slot);
                const status = extractTdStatus(slot);
                const position = getTdPositionInfo(slot);
                const location = multiTargetManager.getLocationFromSelector(selector);
                
                const target = {
                    timeText: status.timeText,
                    tdSelector: selector,
                    positionInfo: position,
                    status: status
                };
                
                const added = multiTargetManager.addTarget(target);
                expect(added).toBe(true);
                
                expectedOrder.push(`${location}${status.timeText}`);
            });
            
            // 2. 監視対象数の確認
            const targets = multiTargetManager.getTargets();
            expect(targets).toHaveLength(6);
            
            // 3. 東西の正しい判定
            const locations = targets.map(target => 
                multiTargetManager.getLocationFromSelector(target.tdSelector)
            );
            expect(locations).toEqual(['東', '西', '東', '西', '東', '西']);
            
            // 4. 時間帯の正しい順序
            const times = targets.map(target => target.timeText);
            expect(times).toEqual(['9:00-', '9:00-', '10:00-', '10:00-', '11:00-', '11:00-']);
            
            // 5. 優先度順の完全確認
            targets.forEach((target, index) => {
                const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
                const displayText = `${location}${target.timeText}`;
                expect(displayText).toBe(expectedOrder[index]);
            });
        });

        test('同じ時間帯の東西監視での重複チェック', () => {
            const eastSlot = document.querySelector('tr:first-child td:first-child');
            const westSlot = document.querySelector('tr:first-child td:last-child');
            
            // 1. 東9:00-を追加
            const eastTarget = {
                timeText: '9:00-',
                tdSelector: generateUniqueTdSelector(eastSlot),
                positionInfo: getTdPositionInfo(eastSlot)
            };
            
            const added1 = multiTargetManager.addTarget(eastTarget);
            expect(added1).toBe(true);
            
            // 2. 西9:00-を追加（同じ時間だが異なる位置）
            const westTarget = {
                timeText: '9:00-',
                tdSelector: generateUniqueTdSelector(westSlot),
                positionInfo: getTdPositionInfo(westSlot)
            };
            
            const added2 = multiTargetManager.addTarget(westTarget);
            expect(added2).toBe(true);
            
            // 3. 両方とも追加されることを確認（時間は同じだがセレクタが異なる）
            const targets = multiTargetManager.getTargets();
            expect(targets).toHaveLength(2);
            
            // 4. 東西の区別が正しいことを確認
            const eastLocation = multiTargetManager.getLocationFromSelector(targets[0].tdSelector);
            const westLocation = multiTargetManager.getLocationFromSelector(targets[1].tdSelector);
            
            expect(eastLocation).toBe('東');
            expect(westLocation).toBe('西');
            
            // 5. 同一要素の重複追加はできないことを確認
            const duplicateEast = multiTargetManager.addTarget(eastTarget);
            expect(duplicateEast).toBe(false);
            expect(multiTargetManager.getTargets()).toHaveLength(2);
        });
    });

    describe('シナリオ5: 動的状態変化の高速検出', () => {
        test('短時間での複数状態変化に対する正確な検出', () => {
            // 1. 初期状態：全て満員で監視中
            const slots = document.querySelectorAll('td[data-gray-out]');
            const monitoredTargets = [];
            
            // 最初の4つを監視対象に
            for (let i = 0; i < 4; i++) {
                const slot = slots[i];
                const target = {
                    timeText: extractTdStatus(slot).timeText,
                    tdSelector: generateUniqueTdSelector(slot),
                    positionInfo: getTdPositionInfo(slot)
                };
                multiTargetManager.addTarget(target);
                monitoredTargets.push({ slot, target });
            }
            
            expect(multiTargetManager.getTargets()).toHaveLength(4);
            
            // 2. 状態変化1：東9:00-が利用可能に
            const east9Button = monitoredTargets[0].slot.querySelector('[role="button"]');
            east9Button.setAttribute('data-disabled', 'false');
            east9Button.querySelector('img').src = '/ico_scale_low.svg';
            
            // 検出確認
            const east9Status = extractTdStatus(monitoredTargets[0].slot);
            expect(east9Status.status).toBe('available');
            
            // 3. 状態変化2：すぐに西9:00-も利用可能に
            const west9Button = monitoredTargets[1].slot.querySelector('[role="button"]');
            west9Button.setAttribute('data-disabled', 'false');
            west9Button.querySelector('img').src = '/ico_scale_high.svg';
            
            // 検出確認
            const west9Status = extractTdStatus(monitoredTargets[1].slot);
            expect(west9Status.status).toBe('available');
            
            // 4. 優先度順の処理対象選択テスト
            const targets = multiTargetManager.getTargets();
            const availableTargets = targets.filter(target => {
                const element = findSameTdElement(target);
                if (element) {
                    const currentStatus = extractTdStatus(element);
                    return currentStatus && currentStatus.isAvailable;
                }
                return false;
            });
            
            expect(availableTargets).toHaveLength(2);
            
            // 最高優先度（最初に追加された東9:00-）が選択されるべき
            const firstAvailable = availableTargets[0];
            const location = multiTargetManager.getLocationFromSelector(firstAvailable.tdSelector);
            expect(location).toBe('東');
            expect(firstAvailable.timeText).toBe('9:00-');
        });

        test('状態変化の連鎖的処理（一つ成功後の次の処理）', () => {
            // 1. 複数監視設定
            const slots = Array.from(document.querySelectorAll('td[data-gray-out]'));
            slots.forEach(slot => {
                const target = {
                    timeText: extractTdStatus(slot).timeText,
                    tdSelector: generateUniqueTdSelector(slot),
                    positionInfo: getTdPositionInfo(slot)
                };
                multiTargetManager.addTarget(target);
            });
            
            // 2. 最高優先度（東9:00-）が利用可能になる
            const firstSlot = slots[0];
            const firstButton = firstSlot.querySelector('[role="button"]');
            firstButton.setAttribute('data-disabled', 'false');
            firstButton.querySelector('img').src = '/ico_scale_low.svg';
            
            // 3. 処理完了をシミュレート（監視対象から削除）
            const firstTarget = multiTargetManager.getTargets()[0];
            const removed = multiTargetManager.removeTarget(firstTarget.timeText, firstTarget.tdSelector);
            expect(removed).toBe(true);
            
            // 4. 残りの監視対象確認
            const remainingTargets = multiTargetManager.getTargets();
            expect(remainingTargets).toHaveLength(5);
            
            // 新しい最高優先度が西9:00-になることを確認
            const newFirstTarget = remainingTargets[0];
            const newLocation = multiTargetManager.getLocationFromSelector(newFirstTarget.tdSelector);
            expect(newLocation).toBe('西');
            expect(newFirstTarget.timeText).toBe('9:00-');
            
            // 5. さらに西9:00-も利用可能になり処理される
            const secondSlot = slots[1];
            const secondButton = secondSlot.querySelector('[role="button"]');
            secondButton.setAttribute('data-disabled', 'false');
            secondButton.querySelector('img').src = '/ico_scale_high.svg';
            
            // 処理完了をシミュレート
            const secondRemove = multiTargetManager.removeTarget(newFirstTarget.timeText, newFirstTarget.tdSelector);
            expect(secondRemove).toBe(true);
            
            // 6. 最終状態確認
            const finalTargets = multiTargetManager.getTargets();
            expect(finalTargets).toHaveLength(4);
            
            // 次の優先度は東10:00-になるべき
            const thirdTarget = finalTargets[0];
            const thirdLocation = multiTargetManager.getLocationFromSelector(thirdTarget.tdSelector);
            expect(thirdLocation).toBe('東');
            expect(thirdTarget.timeText).toBe('10:00-');
        });
    });

    describe('シナリオ6: 大量データと パフォーマンス', () => {
        test('大量の時間帯での効率的な検索と管理', () => {
            // 1. 大量の時間帯を動的に生成（12時間帯 x 東西 = 24個）
            const timeSlots = [];
            for (let hour = 9; hour <= 20; hour++) {
                timeSlots.push(`${hour}:00-`);
            }
            
            // DOM構造を動的に拡張
            const tableBody = document.querySelector('.time-slot-table');
            timeSlots.forEach(timeText => {
                const row = document.createElement('tr');
                
                // 東側
                const eastCell = document.createElement('td');
                eastCell.setAttribute('data-gray-out', 'true');
                eastCell.className = 'east-slot';
                eastCell.innerHTML = `
                    <div role="button" data-disabled="true">
                        <dl>
                            <dt><span>${timeText}</span></dt>
                        </dl>
                        <img src="/calendar_ng.svg">
                    </div>
                `;
                
                // 西側
                const westCell = document.createElement('td');
                westCell.setAttribute('data-gray-out', 'true');
                westCell.className = 'west-slot';
                westCell.innerHTML = `
                    <div role="button" data-disabled="true">
                        <dl>
                            <dt><span>${timeText}</span></dt>
                        </dl>
                        <img src="/calendar_ng.svg">
                    </div>
                `;
                
                row.appendChild(eastCell);
                row.appendChild(westCell);
                tableBody.appendChild(row);
            });
            
            // 2. 全時間帯を監視対象に追加（パフォーマンステスト）
            const startTime = Date.now();
            
            const allSlots = document.querySelectorAll('td[data-gray-out]');
            allSlots.forEach(slot => {
                const target = {
                    timeText: extractTdStatus(slot).timeText,
                    tdSelector: generateUniqueTdSelector(slot),
                    positionInfo: getTdPositionInfo(slot)
                };
                multiTargetManager.addTarget(target);
            });
            
            const addTime = Date.now() - startTime;
            
            // 3. 全監視対象の管理確認
            const targets = multiTargetManager.getTargets();
            expect(targets.length).toBeGreaterThan(20); // 最低20個以上
            
            // 4. 検索パフォーマンステスト
            const searchStartTime = Date.now();
            
            // 各時間帯の東西を正しく判定できるかテスト
            const locationCounts = { '東': 0, '西': 0, '不明': 0 };
            targets.forEach(target => {
                const location = multiTargetManager.getLocationFromSelector(target.tdSelector);
                locationCounts[location] = (locationCounts[location] || 0) + 1;
            });
            
            const searchTime = Date.now() - searchStartTime;
            
            // 5. 結果の妥当性確認
            expect(locationCounts['東']).toBeGreaterThan(10);
            expect(locationCounts['西']).toBeGreaterThan(10);
            expect(locationCounts['不明']).toBe(0);
            
            // 東と西の数が同じであることを確認
            expect(locationCounts['東']).toBe(locationCounts['西']);
            
            // 6. パフォーマンス要件
            expect(addTime).toBeLessThan(1000); // 1秒以内で全追加
            expect(searchTime).toBeLessThan(100); // 100ms以内で全検索
            
            console.log(`パフォーマンス結果: 追加=${addTime}ms, 検索=${searchTime}ms, 対象数=${targets.length}`);
        });

        test('頻繁な状態変化での安定性テスト', () => {
            // 1. 中規模の監視設定（6つの時間帯）
            const slots = document.querySelectorAll('td[data-gray-out]');
            slots.forEach(slot => {
                const target = {
                    timeText: extractTdStatus(slot).timeText,
                    tdSelector: generateUniqueTdSelector(slot),
                    positionInfo: getTdPositionInfo(slot)
                };
                multiTargetManager.addTarget(target);
            });
            
            // 2. 連続的な状態変化をシミュレート（100回）
            const changeCount = 100;
            const startTime = Date.now();
            
            for (let i = 0; i < changeCount; i++) {
                // ランダムな時間帯を選択
                const randomSlot = slots[i % slots.length];
                const button = randomSlot.querySelector('[role="button"]');
                
                // 満員⇔利用可能を交互に切り替え
                if (i % 2 === 0) {
                    button.setAttribute('data-disabled', 'false');
                    button.querySelector('img').src = '/ico_scale_low.svg';
                } else {
                    button.setAttribute('data-disabled', 'true');
                    button.querySelector('img').src = '/calendar_ng.svg';
                }
                
                // 状態抽出テスト
                const status = extractTdStatus(randomSlot);
                expect(status).not.toBe(null);
                expect(['full', 'available', 'selected', 'unknown']).toContain(status.status);
            }
            
            const totalTime = Date.now() - startTime;
            
            // 3. 最終状態の一貫性確認
            const finalTargets = multiTargetManager.getTargets();
            expect(finalTargets).toHaveLength(6);
            
            // 全ての監視対象が正しい構造を維持
            finalTargets.forEach(target => {
                expect(target.timeText).toMatch(/^\d{1,2}:00-$/);
                expect(target.tdSelector).toContain('[data-gray-out]');
                expect(['東', '西']).toContain(
                    multiTargetManager.getLocationFromSelector(target.tdSelector)
                );
            });
            
            // 4. パフォーマンス要件
            expect(totalTime).toBeLessThan(500); // 500ms以内で100回の状態変化処理
            
            console.log(`安定性テスト結果: ${changeCount}回の状態変化を${totalTime}msで処理`);
        });
    });
});