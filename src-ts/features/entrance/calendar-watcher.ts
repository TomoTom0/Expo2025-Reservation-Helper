/**
 * カレンダー変更監視クラス
 */

import type { CalendarWatchState } from '@/types';

export interface CalendarChangeCallbacks {
  onCalendarDateChange: (oldDate: string | null, newDate: string | null) => void;
  onTimeSlotChange: () => void;
  onVisitTimeButtonChange: () => void;
}

export class CalendarWatcher {
  private state: CalendarWatchState;
  private callbacks: CalendarChangeCallbacks;

  constructor(callbacks: CalendarChangeCallbacks) {
    this.state = {
      isWatching: false,
      currentDate: null,
      observerId: null
    };
    this.callbacks = callbacks;
  }

  /**
   * カレンダー監視開始
   */
  startWatching(): void {
    if (this.state.isWatching) return;

    this.state.isWatching = true;
    this.state.currentDate = this.getCurrentSelectedCalendarDate();

    console.log('📅 カレンダー変更監視を開始');

    // MutationObserverでカレンダー変更・時間帯選択・ボタン状態変更を検出
    const observer = new MutationObserver((mutations) => {
      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        // 1. カレンダーのaria-pressed属性の変更を検出
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'aria-pressed' || 
             mutation.attributeName === 'class')) {
          const element = mutation.target as HTMLElement;
          if (element.matches('[role="button"][aria-pressed]') && 
              element.querySelector('time[datetime]')) {
            shouldUpdate = true;
          }
        }

        // 2. 時間帯選択の変更を検出
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'aria-pressed') {
          const element = mutation.target as HTMLElement;
          if (element.matches('td[data-gray-out] div[role="button"]')) {
            shouldUpdate = true;
          }
        }

        // 3. 来場日時設定ボタンのdisabled属性変更を検出
        if (mutation.type === 'attributes' && 
            mutation.attributeName === 'disabled') {
          const element = mutation.target as HTMLElement;
          if (element.matches('button.basic-btn.type2.style_full__ptzZq')) {
            shouldUpdate = true;
          }
        }
      });

      if (shouldUpdate) {
        // 少し遅延して処理（DOM更新完了を待つ）
        setTimeout(() => {
          this.handleCalendarChange();
        }, 500);
      }
    });

    // カレンダー要素全体を監視
    const observeTarget = document.body;
    observer.observe(observeTarget, {
      attributes: true,
      subtree: true,
      attributeFilter: ['aria-pressed', 'class', 'disabled']
    });

    this.state.observerId = observer as any;
  }

  /**
   * カレンダー監視停止
   */
  stopWatching(): void {
    if (this.state.observerId) {
      (this.state.observerId as MutationObserver).disconnect();
      this.state.observerId = null;
    }
    this.state.isWatching = false;
  }

  /**
   * カレンダー変更・状態変更時の処理
   */
  private handleCalendarChange(): void {
    const newSelectedDate = this.getCurrentSelectedCalendarDate();
    const calendarDateChanged = newSelectedDate !== this.state.currentDate;

    if (calendarDateChanged) {
      console.log(`📅 カレンダー日付変更を検出: ${this.state.currentDate} → ${newSelectedDate}`);
      
      const oldDate = this.state.currentDate;
      this.state.currentDate = newSelectedDate;
      
      // カレンダー日付変更コールバック実行
      this.callbacks.onCalendarDateChange(oldDate, newSelectedDate);
    } else {
      // 日付は変わっていない - 時間帯選択やボタン状態の変更
      console.log('📅 日付変更なし - 状態変更のみ');
      this.callbacks.onTimeSlotChange();
    }
  }

  /**
   * 現在選択されているカレンダー日付を取得
   */
  private getCurrentSelectedCalendarDate(): string | null {
    try {
      // aria-pressed="true" のカレンダーボタンを探す
      const selectedButton = document.querySelector('[role="button"][aria-pressed="true"] time[datetime]') as HTMLTimeElement;
      
      if (selectedButton) {
        const datetime = selectedButton.getAttribute('datetime');
        if (datetime) {
          // datetime属性から日付部分を抽出 (例: "2025-01-15" -> "2025-01-15")
          return datetime.split('T')[0] || datetime;
        }
      }

      // フォールバック: class="selected" などでも探してみる
      const selectedByClass = document.querySelector('.selected time[datetime], .active time[datetime]') as HTMLTimeElement;
      if (selectedByClass) {
        const datetime = selectedByClass.getAttribute('datetime');
        if (datetime) {
          return datetime.split('T')[0] || datetime;
        }
      }

      return null;
    } catch (error) {
      console.warn('カレンダー日付取得エラー:', error);
      return null;
    }
  }

  /**
   * 現在の監視状態を取得
   */
  getState(): CalendarWatchState {
    return { ...this.state };
  }
}