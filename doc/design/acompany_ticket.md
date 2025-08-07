
以下のようなURLで、「他の方がお持ちのチケットもまとめて申し込む（チケットIDを入力）」の操作を行う処理があるが、これは以下の点で不便だ

同行者追加画面

https://ticket.expo2025.or.jp/agent_ticket/?lottery=4&screen_id=018

## 問題点

毎回チケットIDを一枚ずつ入力する必要がある
以前の入力は残っていないし、
ブラウザの更新や戻るボタンでまとめ入力状態は解除される


## 解決策

https://ticket.expo2025.or.jp/ticket_selection/?lottery=4&screen_id=018

上記のチケット選択画面で以下のボタンを押下して同行者追加画面に遷移できる

```
<a class="basic-btn type1" tabindex="0"><span data-message-code="SW_GP_DL_108_0042" class="style_renderer__ip0Pm">
他の方がお持ちのチケットも<br>まとめて申し込む<br>（チケットIDを入力）</span></a>
```

このチケット選択画面の時点で複数のチケットIDを入力または選択してまとめて入力ボタンを押下すると、「同行者追加画面への遷移->チケットID入力->追加ボタン押下->チケット選択画面に戻ってきて、次のサイクル」というようにワンクリックでまとめて入力できるようにしたい。

### 詳細

#### チケット選択画面

まずは右下のfabからボタンを押下してダイアログを開く。

そこではチケットIDをラベル付きで複数入力できる。
過去に入力したチケットIDも表示されている。
選択して削除することもできる。

そこで複数のチケットIDを選択して「同行者追加」ボタンを押下すると、
まとめて同行者追加処理が実行される。

#### 同行者追加画面

同行者追加画面に遷移済みの前提。

まずはチケットID入力欄に チケットIDを入力し、追加ボタンを押下する。

```
<input id="agent_ticket_id_register" class="style_main__register_input__wHzkJ" placeholder="チケットIDを入力" aria-label="チケットIDを入力" maxlength="10" value="">

<button class="basic-btn type2 style_main__register_btn__FHBxM"><span data-message-code="SW_GP_DL_167_0202" class="style_renderer__ip0Pm">追加</span></button>
```

しばらく動的待機する。

たとえば下記のメッセージはエラーの場合だ。

```
<p data-message-code="CMN_ERR_VALIDATE_0153" class="style_renderer__ip0Pm style_main__error_message__oE5HC">チケットID・XXXXXCJF3Mは空き枠先着を申込可能な来場日時予約が無いため追加できません。</p>

<p data-message-code="CMN_ERR_VALIDATE_0101" class="style_renderer__ip0Pm style_main__error_message__oE5HC">チケットID・XXXXXJNH47は無効なチケットです。</p>

```

有効な場合は下記のように出る

```
<div><h1 class="style_main__head__LLhtg"><span data-message-code="SW_GP_DL_167_0301" class="style_renderer__ip0Pm">追加するチケット</span></h1><span data-message-code="SW_GP_DL_167_0303" class="style_renderer__ip0Pm">2枚のチケットを追加します</span></div>


<div class="style_main__card_wrap___hMHv tickets-type1"><div class="style_main__ticket_card__3ZVML"><div class="group1 style_content__JWbnm"><div class="fig-ticket style_image_area__rluEA"><img src="https://ticket.expo2025.or.jp/tickethub_file/images/0433/00433/0010/0/item_large_image/d477b10309c43041f70a54c08d751e48516b.gif" alt="通期パス"></div><label class="texts style_text_area__Msfzl"><div class="style_agent_ticket__rVdUM"><span data-message-code="SW_GP_DL_108_0041" class="style_renderer__ip0Pm">追加チケット</span></div><span class="type style_labeled_block__uTa7c">通期パス</span><span class="age style_labeled_block__uTa7c">大人（満18歳以上）</span></label></div><dl class="style_detail__Y9amN"><div><dt>チケットID</dt><dd>XXXXXCJF3M</dd></div><div><dt class="style_visiting_date__Jih1c undefined">来場日時</dt><dd class="style_visiting_date__Jih1c"><span><span data-message-code="SW_GP_DL_108_9000" class="style_renderer__ip0Pm">未設定</span></span></dd></div></dl></div></div>

```

そして追加ボタンが有効なって押下できる

```
<button class="basic-btn type2 "><span data-message-code="SW_GP_DL_167_0401" class="style_renderer__ip0Pm">チケット選択画面<br>に追加する</span></button>
```

押下後はチケット選択画面に戻る。

## 注意点

各画面や処理後は動的待機をする必要がある。
基本的に処理結果の要素や次の処理に必要なボタンを条件とすればいい。

## チケット選択画面のチケット

以下を参考に日付情報の参照と選択状態の切り替えを行う

```
<ul class="tickets-type1 with-check no-arrow " data-list-type="myticket_send"><li class="item style_item___UCBs"><label class="check-type1"><input id="ticket_3bebi5uetti_0" type="checkbox" tabindex="0"><span class="check-text"></span></label><div class="col3"><div class="group1 style_content__JWbnm"><div class="fig-ticket style_image_area__rluEA" data-has-checkbox="true"><img src="https://ticket.expo2025.or.jp/tickethub_file/images/0433/00433/0010/0/item_large_image/d477b10309c43041f70a54c08d751e48516b.gif" alt="通期パス"></div><label for="ticket_3bebi5uetti_0" class="texts style_text_area__Msfzl" data-has-checkbox="true"><span class="type style_labeled_block__uTa7c">通期パス</span><span class="age style_labeled_block__uTa7c">大人（満18歳以上）</span></label></div><dl class="style_detail__Y9amN"><div><dt>チケットID</dt><dd>XXXXXZ9PC6</dd></div><div><dt class="style_visiting_date__Jih1c undefined">来場日時</dt><dd class="style_visiting_date__Jih1c"><span>2025年8月17日(日) 10:00-</span></dd></div></dl></div></li></ul>
```
