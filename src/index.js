// ==UserScript==
// @name         ytomo
// @namespace    http://staybrowser.com/
// @version      0.1
// @description  help expo2025 ticket site
// @author       ytomo
// @match        https://ticket.expo2025.or.jp/event_search/*
// @grant       none
// @run-at       document-end
// ==/UserScript==


const init_page = () => {
    
    const load_more_auto = () => {
        const arr_btn = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        if (arr_btn.length > 0) {
            arr_btn[0].click();
            setTimeout(() => {
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
        btn.classList.add("ext_ytomo");

        btn.style.height = "auto";
        btn.style.minHeight = "40px";
        btn.style.width = "auto";
        btn.style.minWidth = "60px";
        btn.style.padding = "0px 8px";
        btn.style.background = "rgb(0, 104, 33)";
        btn.style.color = "white";


        return btn;
    }

    const btn_official_search = document.querySelector("button.style_search_btn__ZuOpx");

    const btn_load_all = get_btn_style();
    btn_load_all.classList.add("btn-load-all");
    const span_load_all = document.createElement("span");
    span_load_all.classList.add("ext_ytomo");
    span_load_all.innerText = "すべて読み込み";
    btn_load_all.appendChild(span_load_all);


    const btn_filter_safe = get_btn_style();
    btn_filter_safe.classList.add("btn-filter-safe");
    const span_filter_safe = document.createElement("span");
    span_filter_safe.classList.add("ext_ytomo");
    span_filter_safe.innerText = "空きのみ";
    btn_filter_safe.appendChild(span_filter_safe);

    const btn_filter_without_load = get_btn_style();
    btn_filter_without_load.classList.add("btn-filter-without-load");
    const span_filter_without_load = document.createElement("span");
    span_filter_without_load.classList.add("ext_ytomo");
    span_filter_without_load.innerText = "絞り込み";
    btn_filter_without_load.appendChild(span_filter_without_load);

    btn_official_search.after(btn_filter_safe);
    btn_official_search.after(btn_load_all);
    btn_official_search.after(btn_filter_without_load);


    const style = document.createElement("style");
    style.innerHTML = `
        button.ext_ytomo {
            height: 40px;
            width: auto;
            min-width: 60px;
            padding: 0px 8px;
            background: rgb(0, 104, 33);
            color: white;
        }
            button.no-after.ext_ytomo:after {
                background: transparent none repeat 0 0 / auto auto padding-box border-box scroll;
            }
        .ext_ytomo:hover {
            background: rgb(0, 104, 33);
        }

        .ytomo-none {
            display: none;
        }
    `;
    document.head.appendChild(style);

    document.addEventListener("click", (event) => {
        if (event.target.matches("button.ext_ytomo, button.ext_ytomo *")) {
            // event.preventDefault()
            // event.stopPropagation()
            const target = event.target.closest("button.ext_ytomo");
            if (target.classList.contains("btn-load-all")) {
                target.disabled = true;
                // すべて読み込み
                load_more_auto();
                setTimeout(() => {
                    target.disabled = false;
                }, 500)
            }
            else if (target.classList.contains("btn-filter-safe")) {
                target.disabled = true;
                // 空きあり絞り込み
                document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])"
                    ).forEach((div) => {
                        div.classList.toggle("ytomo-none");
                    })
                
                setTimeout(() => {
                    target.disabled = false;
                }, 500)
            }
            else if (target.classList.contains("btn-filter-without-load")) {
                target.disabled = true;

                const input_official_search = document.querySelector("input[aria-labelledby='event_search_input']");
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC");

                const val_search = input_official_search.value;
                if (val_search.length > 0) {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("ytomo-none");
                        if (!div.innerText.includes(val_search)) {
                            div.classList.add("ytomo-none");
                        }
                    })
                }
                else {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("ytomo-none");
                    })
                }
                
                setTimeout(() => {
                    target.disabled = false;
                }, 500)
            }
        }
    })
}



// document.addEventListener("DOMContentLoaded", function() {
//     init_page();
//     console.log("ytomo extension loaded");
// })

// https://ticket.expo2025.or.jp/event_search/

const url = window.location.href;

alert(url.includes("ticket.expo2025.or.jp/event_search/"));

try {
if (url.includes("ticket.expo2025.or.jp/event_search/")) {
    init_page();
    console.log("ytomo extension loaded");
}
}
catch (e) {
    console.error("ytomo extension error", e);
    alert(e);
}
