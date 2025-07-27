
入場予約で繰り返しtryを行う前に、実際には下記のようなtd要素をクリックして選択してから実行する。

```html
<td data-gray-out=""><div role="button" class="style_main__button__Z4RWX" aria-pressed="false"><dl><dt><span>9:00-</span></dt><dd data-gray-out=""><img src="/asset/img/ico_scale_low.svg" alt="混雑が予想されます"></dd></dl></div></td>

<td data-gray-out=""><div role="button" class="style_main__button__Z4RWX style_active__JTpSq" aria-pressed="true"><dl><dt><span>11:00-</span></dt><dd data-gray-out=""><img src="/asset/img/ico_scale_high.svg" alt="空いています"></dd></dl></div></td>
```

ただし、タイミングによってはそのtd要素が満員として選択できない状態の下記になることもある。

```html
<td data-gray-out=""><div role="button" class="style_main__button__Z4RWX" data-disabled="true" aria-pressed="false"><dl><dt><span>9:00-</span></dt><dd data-gray-out=""><img src="/asset/img/calendar_ng.svg" alt="満員です(予約不可)"></dd></dl></div></td>
```

その場合、一定時間ごとにページを再読み込みして選択できる状態になるまで待機する必要がある。

つまり、追加の事前試行としては、満員である対象時間td要素を何らかの方法で指定してから繰り返しtryボタン(この際、ボタンの表示が繰り返し読み込みand tryなどに変わる)を押下すると、現在の実行内容を拡張機能のキャッシュなどに保存してからページを一定時間ごとに再読み込みして、選択できる状態になるまで繰り返し、選択できる状態になったらクリック選択して、
それ以降は通常と同じ繰り返しtryを行う。




