/**
 * カレンダー変更監視のテスト
 * 実際のindex.jsのカレンダー関連機能をテスト
 */

const { 
    startCalendarWatcher,
    handleCalendarChange,
    getCurrentSelectedCalendarDate,
    calendarWatchState,
    multiTargetManager
} = require('../src/index.js');

describe('カレンダー変更監視機能', () => {
    beforeEach(() => {
        // DOM環境をクリア
        document.body.innerHTML = '';
        // 状態をリセット
        if (calendarWatchState) {
            calendarWatchState.isWatching = false;
            calendarWatchState.currentSelectedDate = null;
            if (calendarWatchState.observer) {
                calendarWatchState.observer.disconnect();
                calendarWatchState.observer = null;
            }
        }
        multiTargetManager.clearAll();
    });

    describe('カレンダー日付取得機能', () => {
        test('選択されたカレンダー日付の取得（aria-pressed）', () => {
            // カレンダー構造を作成
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            
            const dateButton = document.createElement('button');
            dateButton.setAttribute('aria-pressed', 'true');
            
            const timeElement = document.createElement('time');
            timeElement.setAttribute('datetime', '2025-03-15');
            timeElement.textContent = '15';
            
            dateButton.appendChild(timeElement);
            calendar.appendChild(dateButton);
            document.body.appendChild(calendar);
            
            const selectedDate = getCurrentSelectedCalendarDate();
            expect(selectedDate).toBe('2025-03-15');
        });

        test('選択されたカレンダー日付の取得（class selector）', () => {
            // 別のセレクタパターン
            const calendar = document.createElement('div');
            
            const dateElement = document.createElement('div');
            dateElement.setAttribute('class', 'selector_date active');
            
            const timeElement = document.createElement('time');
            timeElement.setAttribute('datetime', '2025-03-20');
            timeElement.textContent = '20';
            
            dateElement.appendChild(timeElement);
            calendar.appendChild(dateElement);
            document.body.appendChild(calendar);
            
            const selectedDate = getCurrentSelectedCalendarDate();
            expect(selectedDate).toBe('2025-03-20');
        });

        test('カレンダー日付が選択されていない場合', () => {
            // 空のDOMでテスト
            const selectedDate = getCurrentSelectedCalendarDate();
            expect(selectedDate).toBe(null);
        });

        test('無効なdatetime属性の場合', () => {
            const calendar = document.createElement('div');
            const dateButton = document.createElement('button');
            dateButton.setAttribute('aria-pressed', 'true');
            
            const timeElement = document.createElement('time');
            timeElement.setAttribute('datetime', 'invalid-date');
            
            dateButton.appendChild(timeElement);
            calendar.appendChild(dateButton);
            document.body.appendChild(calendar);
            
            const selectedDate = getCurrentSelectedCalendarDate();
            // 実装では属性値をそのまま返すため、バリデーションは行わない
            expect(selectedDate).toBe('invalid-date');
        });
    });

    describe('カレンダー監視開始機能', () => {
        test('カレンダー監視の開始', () => {
            // カレンダー要素を設置
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            document.body.appendChild(calendar);

            startCalendarWatcher();
            
            expect(calendarWatchState.isWatching).toBe(true);
            expect(calendarWatchState.observer).not.toBe(null);
        });

        test('重複する監視開始の防止', () => {
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            document.body.appendChild(calendar);

            // 最初の監視開始
            startCalendarWatcher();
            const firstObserver = calendarWatchState.observer;
            
            // 2回目の監視開始（無視されるはず）
            startCalendarWatcher();
            const secondObserver = calendarWatchState.observer;
            
            // 同じObserverインスタンスが保持される
            expect(firstObserver).toBe(secondObserver);
            expect(calendarWatchState.isWatching).toBe(true);
        });

        test('監視対象要素がない場合', () => {
            // カレンダー要素なしで監視開始
            startCalendarWatcher();
            
            // 監視は開始されるが、対象がないので正常動作
            expect(calendarWatchState.isWatching).toBe(true);
        });
    });

    describe('カレンダー変更処理', () => {
        beforeEach(() => {
            // テスト用カレンダー構造を設置
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            
            const dateButton1 = document.createElement('button');
            dateButton1.setAttribute('aria-pressed', 'false');
            const time1 = document.createElement('time');
            time1.setAttribute('datetime', '2025-03-15');
            dateButton1.appendChild(time1);
            
            const dateButton2 = document.createElement('button');
            dateButton2.setAttribute('aria-pressed', 'false');
            const time2 = document.createElement('time');
            time2.setAttribute('datetime', '2025-03-16');
            dateButton2.appendChild(time2);
            
            calendar.appendChild(dateButton1);
            calendar.appendChild(dateButton2);
            document.body.appendChild(calendar);
        });

        test('カレンダー日付変更の検出', () => {
            // 初期状態設定
            calendarWatchState.currentSelectedDate = '2025-03-15';
            
            // 日付を変更（aria-pressedを変更）
            const dateButtons = document.querySelectorAll('button[aria-pressed]');
            dateButtons[0].setAttribute('aria-pressed', 'false');
            dateButtons[1].setAttribute('aria-pressed', 'true');
            
            handleCalendarChange();
            
            // 現在の選択日付が更新される
            expect(calendarWatchState.currentSelectedDate).toBe('2025-03-16');
        });

        test('同じ日付での変更処理（変更なし）', () => {
            // 同じ日付で初期化
            calendarWatchState.currentSelectedDate = '2025-03-15';
            
            // 同じ日付のまま処理
            const dateButtons = document.querySelectorAll('button[aria-pressed]');
            dateButtons[0].setAttribute('aria-pressed', 'true');
            
            const initialDate = calendarWatchState.currentSelectedDate;
            handleCalendarChange();
            
            // 日付は変更されない
            expect(calendarWatchState.currentSelectedDate).toBe(initialDate);
        });
    });

    describe('MutationObserver統合', () => {
        test('DOM変更の検出機能', () => {
            // カレンダー要素を設置
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            document.body.appendChild(calendar);

            // 監視開始
            startCalendarWatcher();
            
            // MutationObserverが設定されている
            expect(calendarWatchState.observer).toBeInstanceOf(MutationObserver);
            expect(calendarWatchState.isWatching).toBe(true);
        });

        test('監視の停止', () => {
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            document.body.appendChild(calendar);

            startCalendarWatcher();
            expect(calendarWatchState.isWatching).toBe(true);
            
            // 手動で監視停止
            if (calendarWatchState.observer) {
                calendarWatchState.observer.disconnect();
                calendarWatchState.observer = null;
                calendarWatchState.isWatching = false;
            }
            
            expect(calendarWatchState.isWatching).toBe(false);
            expect(calendarWatchState.observer).toBe(null);
        });
    });

    describe('状態管理', () => {
        test('calendarWatchStateの初期化', () => {
            // 初期状態の確認
            expect(calendarWatchState).toBeDefined();
            expect(calendarWatchState.isWatching).toBe(false);
            expect(calendarWatchState.currentSelectedDate).toBe(null);
            expect(calendarWatchState.observer).toBe(null);
        });

        test('監視状態の管理', () => {
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            
            const dateButton = document.createElement('button');
            dateButton.setAttribute('aria-pressed', 'true');
            const timeElement = document.createElement('time');
            timeElement.setAttribute('datetime', '2025-03-15');
            dateButton.appendChild(timeElement);
            calendar.appendChild(dateButton);
            document.body.appendChild(calendar);

            // 監視開始前
            expect(calendarWatchState.isWatching).toBe(false);
            
            // 監視開始
            startCalendarWatcher();
            expect(calendarWatchState.isWatching).toBe(true);
            expect(calendarWatchState.currentSelectedDate).toBe('2025-03-15');
        });
    });

    describe('エラーハンドリング', () => {
        test('不正なDOM構造での日付取得', () => {
            // timeElementがないボタン
            const calendar = document.createElement('div');
            const dateButton = document.createElement('button');
            dateButton.setAttribute('aria-pressed', 'true');
            // time要素なし
            
            calendar.appendChild(dateButton);
            document.body.appendChild(calendar);
            
            const selectedDate = getCurrentSelectedCalendarDate();
            expect(selectedDate).toBe(null);
        });

        test('複数のaria-pressed="true"要素', () => {
            // 複数選択状態（本来は発生しないはずだが）
            const calendar = document.createElement('div');
            
            const dateButton1 = document.createElement('button');
            dateButton1.setAttribute('aria-pressed', 'true');
            const time1 = document.createElement('time');
            time1.setAttribute('datetime', '2025-03-15');
            dateButton1.appendChild(time1);
            
            const dateButton2 = document.createElement('button');
            dateButton2.setAttribute('aria-pressed', 'true');
            const time2 = document.createElement('time');
            time2.setAttribute('datetime', '2025-03-16');
            dateButton2.appendChild(time2);
            
            calendar.appendChild(dateButton1);
            calendar.appendChild(dateButton2);
            document.body.appendChild(calendar);
            
            // 最初に見つかった要素の日付が返される
            const selectedDate = getCurrentSelectedCalendarDate();
            expect(selectedDate).toBe('2025-03-15');
        });
    });

    describe('統合テスト', () => {
        test('カレンダー監視→日付変更→処理実行の一連の流れ', () => {
            // カレンダー構造を作成
            const calendar = document.createElement('div');
            calendar.setAttribute('role', 'grid');
            
            const dateButton = document.createElement('button');
            dateButton.setAttribute('aria-pressed', 'true');
            const timeElement = document.createElement('time');
            timeElement.setAttribute('datetime', '2025-03-15');
            dateButton.appendChild(timeElement);
            
            calendar.appendChild(dateButton);
            document.body.appendChild(calendar);
            
            // 1. 監視開始
            startCalendarWatcher();
            expect(calendarWatchState.isWatching).toBe(true);
            expect(calendarWatchState.currentSelectedDate).toBe('2025-03-15');
            
            // 2. 日付変更
            dateButton.setAttribute('aria-pressed', 'false');
            timeElement.setAttribute('datetime', '2025-03-16');
            dateButton.setAttribute('aria-pressed', 'true');
            
            // 3. 変更処理実行
            handleCalendarChange();
            expect(calendarWatchState.currentSelectedDate).toBe('2025-03-16');
            
            // 4. 現在選択されている日付の確認
            const currentDate = getCurrentSelectedCalendarDate();
            expect(currentDate).toBe('2025-03-16');
        });
    });
});