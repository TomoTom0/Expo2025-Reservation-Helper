
```js
const dic_selector = {
    submit: "#__next > div > div > main > div > div.style_main__add_cart_button__DCOw8 > button",
    change: "body > div > div > div > div > div > div > button",
    success: "#reservation_modal_title",
    failure: "#reservation_fail_modal_title",
    close: "body > div.style_buy-modal__1JZtS > div > div > div > div > ul > li > a"
}

const dic_selector_text = {
    change: "来場日時を変更する"
}
```

上記のセレクタに基づいて繰り返し実行する。
ただしchangeのみセレクタに加えてtextContentの一致まで確認する

1. submitの存在を待って、submitを押下
2. change、success, failureのいずれかが存在するまで待機。changeが存在すればchangeを押下して、successまたはfailureが存在するまで待機。
3. successが存在すれば、繰り返し終了。failureが存在すれば、closeの存在を確認して、closeボタンを押下して、1に戻る。

## 注意点

- BANされないように、各待機時間(要素確認の時間単位)は最低500msとする。さらに、固定で一定のランダム性を持たせる。
- 画面内にボタンを追加して、「繰り返し予約try」と「繰り返しキャンセル」ができるようにする。
- ボタンは以下のdivの中に配置する (`#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR`)。また、ボタンのデザインはsrc/index.jsを参照。


