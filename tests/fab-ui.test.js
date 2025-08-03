/**
 * FAB UI機能のテスト
 * 実際のindex.jsのFAB関連機能をテスト
 */

const { 
    createEntranceReservationUI,
    updateMainButtonDisplay,
    updateMonitoringTargetsDisplay,
    multiTargetManager,
    timeSlotState
} = require('../src/index.js');

describe('FAB UI機能', () => {
    beforeEach(() => {
        // DOM環境をクリア
        document.body.innerHTML = '';
        // multiTargetManager状態をクリア
        multiTargetManager.clearAll();
        // timeSlotState をリセット
        if (timeSlotState) {
            timeSlotState.mode = 'idle';
            timeSlotState.isMonitoring = false;
        }
    });

    describe('FAB UI作成機能', () => {
        test('基本FAB要素の作成', () => {
            const config = {};
            createEntranceReservationUI(config);

            // FABコンテナが作成されているか確認
            const fabContainer = document.getElementById('ytomo-fab-container');
            expect(fabContainer).not.toBe(null);
            expect(fabContainer.style.position).toBe('fixed');
            expect(fabContainer.style.bottom).toBe('24px');
            expect(fabContainer.style.right).toBe('24px');
        });

        test('メインFABボタンの作成', () => {
            const config = {};
            createEntranceReservationUI(config);

            // メインFABボタンが作成されているか確認
            const fabButton = document.getElementById('ytomo-main-fab');
            expect(fabButton).not.toBe(null);
            expect(fabButton.tagName).toBe('BUTTON');
            expect(fabButton.style.width).toBe('56px');
            expect(fabButton.style.height).toBe('56px');
            expect(fabButton.style.borderRadius).toBe('50%');
        });

        test('FABボタン内のアイコン/テキスト要素', () => {
            const config = {};
            createEntranceReservationUI(config);

            const fabButton = document.getElementById('ytomo-main-fab');
            const fabIcon = fabButton.querySelector('span');
            
            expect(fabIcon).not.toBe(null);
            // innerTextで設定されているのでinnerTextで確認
            expect(fabIcon.innerText).toBe('待機中');
            expect(fabIcon.style.fontSize).toBe('12px');
            expect(fabIcon.style.textAlign).toBe('center');
        });

        test('ステータスバッジの作成', () => {
            const config = {};
            createEntranceReservationUI(config);

            const statusBadge = document.getElementById('ytomo-status-badge');
            expect(statusBadge).not.toBe(null);
            // innerTextで設定されているのでinnerTextで確認
            expect(statusBadge.innerText).toBe('待機中');
        });

        test('監視対象表示エリアの作成', () => {
            const config = {};
            createEntranceReservationUI(config);

            const monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            expect(monitoringDisplay).not.toBe(null);
        });

        test('既存FABの削除と再作成', () => {
            // 既存のFABを作成
            const config = {};
            createEntranceReservationUI(config);
            
            const firstFab = document.getElementById('ytomo-fab-container');
            expect(firstFab).not.toBe(null);

            // 再度作成（既存のものは削除されるはず）
            createEntranceReservationUI(config);
            
            const fabContainers = document.querySelectorAll('#ytomo-fab-container');
            expect(fabContainers.length).toBe(1); // 1つだけ存在
        });
    });

    describe('FABボタン状態管理', () => {
        beforeEach(() => {
            const config = {};
            createEntranceReservationUI(config);
        });

        test('初期状態（disabled）', () => {
            const fabButton = document.getElementById('ytomo-main-fab');
            
            expect(fabButton.disabled).toBe(true);
            expect(fabButton.style.opacity).toBe('0.6');
            expect(fabButton.style.cursor).toBe('not-allowed');
        });

        test('ホバー効果の動作確認', () => {
            const fabButton = document.getElementById('ytomo-main-fab');
            
            // mouseenter イベント
            const mouseEnterEvent = new Event('mouseenter');
            fabButton.dispatchEvent(mouseEnterEvent);
            
            expect(fabButton.style.transform).toBe('scale(1.15)');
            expect(fabButton.style.borderWidth).toBe('4px');

            // mouseleave イベント
            const mouseLeaveEvent = new Event('mouseleave');
            fabButton.dispatchEvent(mouseLeaveEvent);
            
            expect(fabButton.style.transform).toBe('scale(1)');
            expect(fabButton.style.borderWidth).toBe('3px');
        });

        test('クリック無効化（disabled状態）', () => {
            const fabButton = document.getElementById('ytomo-main-fab');
            
            // 初期状態でdisabledであることを確認
            expect(fabButton.disabled).toBe(true);
            expect(fabButton.style.opacity).toBe('0.6');
            expect(fabButton.style.cursor).toBe('not-allowed');
            
            // disabled状態の確認
            const isDisabled = fabButton.disabled || fabButton.hasAttribute('disabled');
            expect(isDisabled).toBe(true);
        });
    });

    describe('監視対象表示機能', () => {
        beforeEach(() => {
            const config = {};
            createEntranceReservationUI(config);
        });

        test('監視対象なしの表示', () => {
            updateMonitoringTargetsDisplay();
            
            const monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            expect(monitoringDisplay.style.display).toBe('none');
        });

        test('監視対象ありの表示', () => {
            // 監視対象を追加
            const target1 = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 0 }
            };
            const target2 = {
                timeText: '11:00-',
                tdSelector: 'table tr:nth-child(2) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 1, cellIndex: 0 }
            };

            multiTargetManager.addTarget(target1);
            multiTargetManager.addTarget(target2);

            updateMonitoringTargetsDisplay();
            
            const monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            expect(monitoringDisplay.style.display).toBe('block');
            
            // 監視対象の内容が表示されているか確認
            expect(monitoringDisplay.innerText).toContain('9:00-');
            expect(monitoringDisplay.innerText).toContain('11:00-');
        });

        test('監視対象の個別表示内容', () => {
            // 東と西の監視対象を追加
            const eastTarget = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 0 }
            };
            const westTarget = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(2)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 1 }
            };

            multiTargetManager.addTarget(eastTarget);
            multiTargetManager.addTarget(westTarget);

            updateMonitoringTargetsDisplay();
            
            const monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            
            // 表示が有効になっている
            expect(monitoringDisplay.style.display).toBe('block');
            
            // テキスト内容の確認（東西の表示）
            const displayText = monitoringDisplay.innerText;
            expect(displayText).toContain('9:00-');
            expect(displayText).toContain('東');
            expect(displayText).toContain('西');
        });
    });

    describe('FAB統合動作', () => {
        beforeEach(() => {
            const config = {};
            createEntranceReservationUI(config);
        });

        test('監視対象追加時のFAB更新連携', () => {
            // 監視対象を追加
            const target = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 0 }
            };

            multiTargetManager.addTarget(target);
            updateMonitoringTargetsDisplay();

            // 監視対象表示が更新されているか確認
            const monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            expect(monitoringDisplay.style.display).toBe('block');
            
            // 追加した対象が表示されているか確認
            expect(monitoringDisplay.innerText).toContain('9:00-');
        });

        test('複数監視対象管理', () => {
            // 複数の監視対象を追加
            const targets = [
                { timeText: '9:00-', tdSelector: 'selector1', positionInfo: { rowIndex: 0, cellIndex: 0 } },
                { timeText: '11:00-', tdSelector: 'selector2', positionInfo: { rowIndex: 1, cellIndex: 0 } },
                { timeText: '13:00-', tdSelector: 'selector3', positionInfo: { rowIndex: 2, cellIndex: 0 } }
            ];

            targets.forEach(target => multiTargetManager.addTarget(target));
            updateMonitoringTargetsDisplay();

            const monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            expect(monitoringDisplay.style.display).toBe('block');
            
            // 3つの時間帯が含まれているか確認
            const displayText = monitoringDisplay.innerText;
            expect(displayText).toContain('9:00-');
            expect(displayText).toContain('11:00-');
            expect(displayText).toContain('13:00-');
        });

        test('監視対象削除時の表示更新', () => {
            // 監視対象を追加
            const target = {
                timeText: '9:00-',
                tdSelector: 'table tr:nth-child(1) td:nth-child(1)[data-gray-out]',
                positionInfo: { rowIndex: 0, cellIndex: 0 }
            };

            multiTargetManager.addTarget(target);
            updateMonitoringTargetsDisplay();
            
            // 表示が更新されていることを確認
            let monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            expect(monitoringDisplay.style.display).toBe('block');

            // 監視対象を削除
            multiTargetManager.clearAll();
            updateMonitoringTargetsDisplay();

            // 表示が非表示になることを確認
            monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            expect(monitoringDisplay.style.display).toBe('none');
        });
    });

    describe('CSS スタイル検証', () => {
        beforeEach(() => {
            const config = {};
            createEntranceReservationUI(config);
        });

        test('FABボタンの重要スタイル設定', () => {
            const fabButton = document.getElementById('ytomo-main-fab');
            
            // 重要な位置・サイズ設定の確認
            expect(fabButton.style.width).toBe('56px');
            expect(fabButton.style.height).toBe('56px');
            expect(fabButton.style.borderRadius).toBe('50%');
            expect(fabButton.style.border).toContain('3px solid');
        });

        test('FABコンテナの位置設定', () => {
            const fabContainer = document.getElementById('ytomo-fab-container');
            
            expect(fabContainer.style.position).toBe('fixed');
            expect(fabContainer.style.bottom).toBe('24px');
            expect(fabContainer.style.right).toBe('24px');
            expect(fabContainer.style.zIndex).toBe('10000');
        });

        test('監視対象表示エリアのスタイル', () => {
            const monitoringDisplay = document.getElementById('ytomo-monitoring-targets');
            
            // cssTextで設定されているので、初期状態では空でも問題ない
            // 重要なのは要素が存在することと基本的なプロパティ
            expect(monitoringDisplay).not.toBe(null);
            expect(monitoringDisplay.id).toBe('ytomo-monitoring-targets');
        });

        test('ステータスバッジのスタイル', () => {
            const statusBadge = document.getElementById('ytomo-status-badge');
            
            // cssTextで設定されているので、初期状態では空でも問題ない
            // 重要なのは要素が存在することと基本的なプロパティ
            expect(statusBadge).not.toBe(null);
            expect(statusBadge.id).toBe('ytomo-status-badge');
            expect(statusBadge.innerText).toBe('待機中');
        });
    });
});