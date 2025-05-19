// ==UserScript==
// @name         yt_Expo2025_preserve
// @namespace    http://staybrowser.com/
// @version      0.2
// @description  help expo2025 ticket site
// @author       ytomo
// @match        https://ticket.expo2025.or.jp/event_search/*
// @grant       none
// @run-at       document-end
// ==/UserScript==

const insert_style = () => {
    const style = document.createElement("style");
        style.innerHTML = `
button.ext-ytomo {
    height: 40px;
    width: auto;
    min-width: 60px;
    padding: 0px 8px;
    background: rgb(0, 104, 33) !important;
    color: white;
}
button.no-after.ext-ytomo:after {
    background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;
}
button.ext-ytomo.btn-done {
    background: rgb(74, 76, 74) !important;
}
.ext-ytomo:hover {
    background: rgb(2, 134, 43);
}

.safe-none, .ytomo-none, .filter-none {
    display: none;
}

div.div-flex {
    display: flex;
    justify-content: center;
    margin: 5px;
}

input.ext-tomo.search {
    height: 50px;
    min-width: 200px;
    max-width: min(300px, 100%);
    font-family: quicksand;
    font-size: 16px;
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
    border: 1px solid #222426;
    border-radius: 25px;
    box-shadow: 0 1px 0 0 #ccc;
    padding: 0 0 0 10px;
    flex: 1 1;
}
    `;
    document.head.appendChild(style);
}

// val_searchには以下の3種類に大別されるワードが含まれる
// 1. 通常の文字列
// 2. マイナス検索用文字列 (`-`から始まる)
// 3. phrase検索用文字列 (`"`で囲まれた文字列)

// また、*は0文字以上のワイルドカードとして扱う

// 区切り文字は以下の通り
// 1. 全角スペース, 半角スペース: ANDの意味
// 2. or, OR (前後に全角または半角の空白を伴う): ORの意味

// また、ANDやORを組み合わせる場合、半角括弧でその範囲を明示的にできる


const prepare_filter = (val_search) => {
    // 空の検索文字列の場合は全てにマッチする正規表現を返す
    if (!val_search.trim()) {
        return { include: /(?:)/, exclude: null };
    }

    // OR条件を一時的に特別なマーカーに置換（後で処理するため）
    const orReplaced = val_search.replace(/(?:\s+|^)(or|OR)(?:\s+|$)/g, ' \uFFFF ');

    // フレーズ検索（引用符で囲まれた部分）を抽出
    const phraseMatches = orReplaced.match(/"[^"]*"/g) || [];
    let remainingStr = orReplaced;
    const phrases = phraseMatches.map(phrase => {
        remainingStr = remainingStr.replace(phrase, '');
        return phrase.slice(1, -1).replace(/\*/g, '.*');
    });

    // 残りの部分から通常の単語とマイナス検索を抽出
    const tokens = remainingStr.split(/\s+/).filter(token => token);
    const includeTokens = [];
    const excludeTokens = [];

    tokens.forEach(token => {
        if (token === '\uFFFF') {
            // ORマーカー
            includeTokens.push(token);
        } else if (token.startsWith('-')) {
            // マイナス検索
            const cleaned = token.slice(1).replace(/\*/g, '.*');
            if (cleaned) excludeTokens.push(cleaned);
        } else {
            // 通常の検索
            const cleaned = token.replace(/\*/g, '.*');
            if (cleaned) includeTokens.push(cleaned);
        }
    });

    // フレーズをincludeTokensに追加
    phrases.forEach(phrase => {
        includeTokens.push(phrase);
    });

    // 括弧の処理（簡易的な実装）
    const processParentheses = (tokens) => {
        const stack = [[]];
        for (const token of tokens) {
            if (token === '(') {
                stack.push([]);
            } else if (token === ')') {
                if (stack.length > 1) {
                    const group = stack.pop();
                    stack[stack.length - 1].push(group);
                }
            } else {
                stack[stack.length - 1].push(token);
            }
        }
        return stack[0];
    };

    const groupedIncludes = processParentheses(includeTokens);

    // 正規表現の構築（順不同対応版）
    const buildRegex = (group) => {
        if (Array.isArray(group)) {
            const parts = group.map(item => Array.isArray(item) ? buildRegex(item) : item);
            
            // ORマーカーがあるかチェック
            const orIndex = parts.findIndex(part => part === '\uFFFF');
            if (orIndex > -1) {
                const left = buildRegex(parts.slice(0, orIndex));
                const right = buildRegex(parts.slice(orIndex + 1));
                return `(?:${left}|${right})`;
            } else {
                // AND条件の場合は順不同でマッチするように変更
                return parts.map(part => `(?=.*${part})`).join('');
            }
        }
        return group;
    };

    const includePattern = buildRegex(groupedIncludes)
        .replace(/\uFFFF/g, '|')
        .replace(/\.\*/g, '[\\s\\S]*');

    // Safari対応：除外条件を別々にチェックする方式に変更
    const excludePatterns = excludeTokens.map(token => 
        new RegExp(token.replace(/\.\*/g, '[\\s\\S]*'), 'i')
    );

    return {
        include: new RegExp(includePattern, 'i'),
        exclude: excludePatterns.length > 0 ? excludePatterns : null
    };
};

// const filter_div = (div, regex_exp) => {
//     // 

// }

const init_page = () => {
    
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

    document.addEventListener("click", (event) => {
        if (event.target.matches("button.ext-ytomo, button.ext-ytomo *")) {
            // event.preventDefault()
            // event.stopPropagation()
            const target = event.target.closest("button.ext-ytomo");
            if (target.classList.contains("btn-load-all")) {
                target.disabled = true;
                // すべて読み込み
                load_more_auto().then(()=>{
                    target.disabled = false;
                    target.classList.toggle("btn-done");

                });
                // setTimeout(() => {
                //     target.disabled = false;
                // }, 500)
            }
            else if (target.classList.contains("btn-filter-safe")) {
                target.disabled = true;
                // 空きあり絞り込み
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
                target.disabled = true;

                // const input_official_search = document.querySelector("input[aria-labelledby='event_search_input']");
                const input_another_search = document.querySelector("input.ext-tomo.search");
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC");

                const val_search = input_another_search.value;
                const dic_regex_exp = prepare_filter(val_search);
                if (val_search.length > 0) {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("filter-none");
                        if (!(
                            (dic_regex_exp.include===null || dic_regex_exp.include.test(div.innerText))
                            && (dic_regex_exp.exclude===null || !dic_regex_exp.exclude.some(d=>d.test(div.innerText)))
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

const judge_init = () => {
    const cand_btn = document.querySelector("button.style_search_btn__ZuOpx");
    return cand_btn !== null;
}

// document.addEventListener("DOMContentLoaded", function() {
//     init_page();
//     console.log("ytomo extension loaded");
// })

// https://ticket.expo2025.or.jp/event_search/


// alert(url.includes("ticket.expo2025.or.jp/event_search/"));

const trigger_init = (url_record) => {
    if (url_record.includes("ticket.expo2025.or.jp/event_search/")) {
        const interval_judge = setInterval(() => {
            if (judge_init()) {
                clearInterval(interval_judge);
                init_page();
                console.log("ytomo extension loaded");
            }
        }, 500);
            console.log("ytomo extension loaded");
        }
}

try {

// urlの変更をMutationObserverで監視する


const url = window.location.href;
trigger_init(url);

let url_record = url;
const observer = new MutationObserver(() => {
    const new_url = window.location.href;
    if (new_url !== url_record) {
        url_record = new_url;
        trigger_init(url_record);
    }
});
observer.observe(document, {
    childList: true,
    subtree: true
});


// if (url.includes("ticket.expo2025.or.jp/event_search/")) {
//     // init_page();
//     console.log("ytomo extension loaded");
// }
}
catch (e) {
    console.error("ytomo extension error", e);
    alert(e);
}
