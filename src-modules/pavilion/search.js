/**
 * パビリオン検索機能モジュール
 * パビリオン予約サイトでの検索・フィルタリング機能を提供
 */

import { insert_style, prepare_filter } from '../core/utils.js';

// ページ初期化処理
export const init_page = () => {
    // すべて読み込みボタンの自動クリック処理
    const load_more_auto = async () => {
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const arr_btn = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        if (arr_btn.length > 0) {
            arr_btn[0].click();
            setTimeout(() => {
                scrollTo(scrollX, scrollY);
                load_more_auto();
            }, 500)
        } else {
            console.log("No more load more button");
        }
    }

    // ボタンのスタイルを生成する関数
    const get_btn_style = () => {
        const btn = document.createElement("button")
        btn.classList.add("basic-btn");
        btn.classList.add("type2");
        btn.classList.add("no-after");
        btn.classList.add("ext-ytomo");

        btn.style.height = "auto";
        btn.style.minHeight = "40px";
        btn.style.width = "auto";
        btn.style.minWidth = "60px";
        btn.style.padding = "0px 8px";
        // btn.style.background = "rgb(0, 104, 33)";
        btn.style.color = "white";
        btn.style.margin = "5px";

        return btn;
    }

    // 独自ボタン群を挿入する関数
    const insert_button = () => {
        // const btn_official_search = document.querySelector("button.style_search_btn__ZuOpx");
        const div_official_search = document.querySelector("div.style_search__7HKSe");
        const div_insert = document.createElement("div");
        div_insert.classList.add("div-flex");
        const div_insert2 = document.createElement("div");
        div_insert2.classList.add("div-flex");

        const btn_load_all = get_btn_style();
        btn_load_all.classList.add("btn-load-all");
        const span_load_all = document.createElement("span");
        span_load_all.classList.add("ext-ytomo");
        span_load_all.innerText = "すべて読み込み";
        btn_load_all.appendChild(span_load_all);


        const btn_filter_safe = get_btn_style();
        btn_filter_safe.classList.add("btn-filter-safe");
        const span_filter_safe = document.createElement("span");
        span_filter_safe.classList.add("ext-ytomo");
        span_filter_safe.innerText = "空きのみ";
        btn_filter_safe.appendChild(span_filter_safe);

        const btn_filter_without_load = get_btn_style();
        btn_filter_without_load.classList.add("btn-filter-without-load");
        const span_filter_without_load = document.createElement("span");
        span_filter_without_load.classList.add("ext-ytomo");
        span_filter_without_load.innerText = "絞込";
        btn_filter_without_load.appendChild(span_filter_without_load);

        const input_another_search = document.createElement("input");
        input_another_search.classList.add("ext-tomo");
        input_another_search.classList.add("search");
        input_another_search.setAttribute("type", "text");
        input_another_search.setAttribute("placeholder", "読み込みなし絞込");

        const btn_alert_to_copy = get_btn_style();
        btn_alert_to_copy.classList.add("btn-alert-to-copy");
        const span_alert_to_copy = document.createElement("span");
        span_alert_to_copy.classList.add("ext-ytomo");
        span_alert_to_copy.innerText = "一覧コピー";
        btn_alert_to_copy.appendChild(span_alert_to_copy);

        // btn_official_search.after(btn_filter_safe);
        // btn_official_search.after(btn_load_all);
        // btn_official_search.after(btn_filter_without_load);
        div_insert.appendChild(input_another_search);
        div_insert.appendChild(btn_filter_without_load);
        div_insert2.appendChild(btn_load_all);
        div_insert2.appendChild(btn_filter_safe);
        div_insert2.appendChild(btn_alert_to_copy);
        div_official_search.after(div_insert);
        div_official_search.after(div_insert2);

    }

    // const refresh_btn_ = () => {

    // }

    insert_style();
    insert_button();

    // 独自ボタンのクリックイベントハンドラ
    document.addEventListener("click", (event) => {
        if (event.target.matches("button.ext-ytomo, button.ext-ytomo *")) {
            // event.preventDefault()
            // event.stopPropagation()
            const target = event.target.closest("button.ext-ytomo");
            if (target.classList.contains("btn-load-all")) {
                // すべて読み込み
                target.disabled = true;
                load_more_auto().then(() => {
                    target.disabled = false;
                    target.classList.toggle("btn-done");

                });
            }
            else if (target.classList.contains("btn-filter-safe")) {
                // 空きあり絞り込み
                target.disabled = true;
                target.classList.toggle("btn-done");
                document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])"
                ).forEach((div) => {
                    div.classList.toggle("safe-none");
                })

                setTimeout(() => {
                    target.disabled = false;
                }, 500)
            }
            else if (target.classList.contains("btn-filter-without-load")) {
                // 入力値で絞り込み
                target.disabled = true;

                const input_another_search = document.querySelector("input.ext-tomo.search");
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC");

                const val_search = input_another_search.value;
                const dic_regex_exp = prepare_filter(val_search);
                if (val_search.length > 0) {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("filter-none");
                        if (!(
                            (dic_regex_exp.include === null || dic_regex_exp.include.test(div.innerText))
                            && (dic_regex_exp.exclude === null || !dic_regex_exp.exclude.some(d => d.test(div.innerText)))
                        )
                        ) {
                            div.classList.add("filter-none");
                        }
                    })
                }
                else {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("filter-none");
                    })
                }

                // setTimeout(() => {
                target.disabled = false;
                // }, 500)
            }
            else if (target.classList.contains("btn-alert-to-copy")) {
                // 一覧コピー
                target.disabled = true;
                // アラート起動
                // filter-none, ytomo-none, safe-noneを除外して表示
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC:not(.filter-none):not(.ytomo-none):not(.safe-none)");
                let arr_text = [];
                // div > button > span のテキストを取得
                arr_div_row.forEach((div) => {
                    const span = div.querySelector("button>span");
                    if (span) {
                        arr_text.push(span.innerText);
                    }
                })
                const text = arr_text.join("\n");
                try {
                    navigator.clipboard.writeText(text);
                } catch (e) {
                    alert(text);
                    // console.error("ytomo extension error", e);
                    // alert(e);
                }
                setTimeout(() => {
                    target.disabled = false;
                }, 500)
            }

        }
    })
}

// ページ初期化可能か判定
export const judge_init = () => {
    const cand_btn = document.querySelector("button.style_search_btn__ZuOpx");
    return cand_btn !== null;
}