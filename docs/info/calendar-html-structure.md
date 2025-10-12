# カレンダーHTML構造

## 実際のカレンダーHTML構造（8/3選択時）

```html
<div class="style_flex_col__b_c_X">
  <div class="style_header__KIQKN">
    <button type="button" disabled="" class="style_stepper_button__N7zDX style_reverse__wQRyF style_stepper_button_disabled__ucTNk">
      <img alt="1か月前に戻る" src="/asset/img/arrow_02.svg">
    </button>
    <span class="style_year_month__iqQQH">2025年8月</span>
    <button type="button" class="style_stepper_button__N7zDX">
      <img alt="1か月先に進む" src="/asset/img/arrow_01.svg">
    </button>
  </div>
  <table class="style_calendar_table__Pme8d">
    <thead>
      <tr>
        <th class="style_sunday__5kXt5">日</th>
        <th>月</th>
        <th>火</th>
        <th>水</th>
        <th>木</th>
        <th>金</th>
        <th class="style_saturday__oQGKi">土</th>
      </tr>
    </thead>
    <tbody>
      <!-- 8/3が選択されている例 -->
      <tr>
        <td>
          <div tabindex="0" role="button" aria-pressed="true" class="style_button_default__89Pu_ style_selector_item__9RWJw style_calendar_selector_date__JYr66" data-day="日" data-color-type="sunday" data-selector-key="1_0">
            <time datetime="2025-08-03" class="style_day__vxUk6 style_sunday__5kXt5">3</time>
            <div class="style_status_icon__s8OTA">
              <div class="style_calendar_icon__hLBes">
                <img alt="空いています" src="/asset/img/ico_scale_high.svg">
              </div>
            </div>
          </div>
        </td>
        <!-- 他の日付... -->
      </tr>
    </tbody>
  </table>
</div>
```

## 重要なセレクタ情報

### カレンダーテーブル
- `.style_calendar_table__Pme8d`

### 選択中の日付
- `aria-pressed="true"` + `.style_calendar_selector_date__JYr66` クラス

### 日付要素
- `time[datetime="YYYY-MM-DD"]` 
- 例: `time[datetime="2025-08-03"]`

### クリック可能な日付ボタン
- `div[role="button"]` (tdの直下)
- `aria-pressed="false|true"`
- `tabindex="0"` (クリック可能)
- `tabindex="-1"` (無効)

### 現在選択中の日付取得
```javascript
// 選択中の日付
document.querySelector('[aria-pressed="true"].style_calendar_selector_date__JYr66 time[datetime]')

// または
document.querySelector('.style_calendar_selector_date__JYr66 time[datetime]')
```

### 指定日付のクリック
```javascript
// 日付要素を見つける
const timeElement = document.querySelector(`time[datetime="${targetDate}"]`);
// その親のボタンをクリック
const buttonElement = timeElement.closest('div[role="button"]');
buttonElement.click();
```