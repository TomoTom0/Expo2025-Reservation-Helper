// ==UserScript==
// @name         yt-Expo2025-Reservation-Helper
// @namespace    http://staybrowser.com/
// @version      0.3
// @description  help expo2025 ticket site
// @author       TomoTom0 https://github.com/TomoTom0
// @match        https://ticket.expo2025.or.jp/event_search/*
// @grant       none
// @run-at       document-end
// ==/UserScript==

// スタイルを挿入する関数
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

// 検索ワードを正規表現に変換する関数
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

// ページ初期化処理
const init_page = () => {
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
const judge_init = () => {
    const cand_btn = document.querySelector("button.style_search_btn__ZuOpx");
    return cand_btn !== null;
}

// 入場予約ページ初期化可能か判定
const judge_entrance_init = () => {
    const target_div = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
    return target_div !== null;
}

// 入場予約ページ初期化処理
const init_entrance_page = () => {
    insert_style();
    
    // 入場予約機能の設定
    const entranceReservationConfig = {
        selectors: {
            submit: "#__next > div > div > main > div > div.style_main__add_cart_button__DCOw8 > button",
            change: "body > div > div > div > div > div > div > button",
            success: "#reservation_modal_title",
            failure: "#reservation_fail_modal_title",
            close: "body > div.style_buy-modal__1JZtS > div > div > div > div > ul > li > a"
        },
        selectorTexts: {
            change: "来場日時を変更する"
        },
        timeouts: {
            waitForSubmit: 5000,
            waitForResponse: 10000,
            waitForClose: 3000,
            retryInterval: 1000
        },
        randomSettings: {
            minCheckInterval: 500,
            checkRandomRange: 200,
            minClickDelay: 500,
            clickRandomRange: 200,
            minRetryDelay: 1000,
            retryRandomRange: 300
        }
    };

    // 時間帯監視機能の初期化
    setTimeout(async () => {
        await initTimeSlotMonitoring();
        createEntranceReservationUI(entranceReservationConfig);
    }, 1000);
    
    console.log("入場予約機能の初期化完了");
}

// 入場予約関連のヘルパー関数
function getRandomWaitTime(minTime, randomRange, config) {
    const { randomSettings } = config;
    const actualMinTime = minTime !== undefined ? minTime : randomSettings.minCheckInterval;
    const actualRandomRange = randomRange !== undefined ? randomRange : randomSettings.checkRandomRange;
    return actualMinTime + Math.floor(Math.random() * actualRandomRange);
}

async function waitForElement(selector, timeout = 5000, config) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElement = () => {
            const element = document.querySelector(selector);
            if (element) {
                resolve(element);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`要素が見つかりません: ${selector}`));
            } else {
                setTimeout(checkElement, getRandomWaitTime(config.randomSettings.minCheckInterval, config.randomSettings.checkRandomRange, config));
            }
        };
        
        checkElement();
    });
}

async function waitForAnyElement(selectors, timeout = 10000, selectorTexts = {}, config) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElements = () => {
            for (const [key, selector] of Object.entries(selectors)) {
                const elements = document.querySelectorAll(selector);
                
                for (const element of elements) {
                    if (selectorTexts[key]) {
                        if (element.textContent && element.textContent.includes(selectorTexts[key])) {
                            resolve({ key, element });
                            return;
                        }
                    } else {
                        if (element) {
                            resolve({ key, element });
                            return;
                        }
                    }
                }
            }
            
            if (Date.now() - startTime > timeout) {
                reject(new Error(`いずれの要素も見つかりません: ${Object.keys(selectors).join(', ')}`));
            } else {
                setTimeout(checkElements, getRandomWaitTime(config.randomSettings.minCheckInterval, config.randomSettings.checkRandomRange, config));
            }
        };
        
        checkElements();
    });
}

async function clickElement(element, config) {
    element.click();
    const delay = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
    await new Promise(resolve => setTimeout(resolve, delay));
}

let entranceReservationState = {
    isRunning: false,
    shouldStop: false
};

// 時間帯監視機能の状態管理
let timeSlotState = {
    mode: 'idle',  // idle, selecting, monitoring, trying
    targetSlot: null,  // 選択対象の時間帯情報
    monitoringInterval: null,  // 監視用インターバル
    isMonitoring: false,
    retryCount: 0,
    maxRetries: 100,
    reloadInterval: 30000  // 30秒間隔
};

// 時間帯セレクタ定義（実際のページ構造に合わせて修正）
const timeSlotSelectors = {
    // 時間帯選択エリア
    timeSlotContainer: "table",
    timeSlotCells: "td div[role='button']",
    
    // 状態判定
    availableSlots: "td div[role='button']:not([data-disabled='true'])",
    fullSlots: "td div[role='button'][data-disabled='true']",
    selectedSlot: "td div[role='button'][aria-pressed='true']",
    
    // アイコン判定
    lowIcon: "img[src*='ico_scale_low.svg']",
    highIcon: "img[src*='ico_scale_high.svg']", 
    fullIcon: "img[src*='calendar_ng.svg']"
};

// 時間帯監視機能の初期化
async function initTimeSlotMonitoring() {
    console.log('時間帯監視機能を初期化中...');
    
    // カレンダーの存在確認
    const hasCalendar = await waitForCalendar();
    if (!hasCalendar) {
        console.log('カレンダーが見つかりません');
        return;
    }
    
    // DOM変化監視を開始（時間帯テーブルの動的生成を検出）
    startTimeSlotTableObserver();
    
    console.log('時間帯監視機能の初期化完了（カレンダー監視中）');
}

// カレンダーの動的待機
async function waitForCalendar(timeout = 10000) {
    const startTime = Date.now();
    const checkInterval = 500;
    
    console.log('カレンダーの出現を待機中...');
    
    while (Date.now() - startTime < timeout) {
        const calendar = document.querySelector('.style_main__calendar__HRSsz');
        if (calendar) {
            console.log('カレンダーを検出しました');
            return true;
        }
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    console.log('カレンダーの待機がタイムアウトしました');
    return false;
}

// 時間帯テーブルの動的生成を監視
function startTimeSlotTableObserver() {
    console.log('時間帯テーブルの動的生成監視を開始');
    
    // MutationObserverで DOM変化を監視（強化版）
    const observer = new MutationObserver((mutations) => {
        let shouldCheck = false;
        
        mutations.forEach((mutation) => {
            // 様々な変更タイプに対応
            if (mutation.type === 'childList' || 
                mutation.type === 'attributes' || 
                mutation.type === 'characterData') {
                shouldCheck = true;
            }
        });
        
        if (shouldCheck) {
            // デバウンス処理（連続した変更を1回にまとめる）
            clearTimeout(window.timeSlotCheckTimeout);
            window.timeSlotCheckTimeout = setTimeout(() => {
                console.log('🔍 DOM変化を検出、時間帯テーブルをチェック中...');
                const hasTimeSlot = checkTimeSlotTableExists();
                if (hasTimeSlot) {
                    console.log('🎯 時間帯テーブルが動的に生成されました！');
                    
                    setTimeout(() => {
                        analyzeAndAddMonitorButtons();
                    }, 300);
                    
                    observer.disconnect();
                }
            }, 100);
        }
    });
    
    // より広範囲で監視
    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeOldValue: true,
        characterData: true,
        characterDataOldValue: true
    });
    
    // 定期的なポーリングも併用（フォールバック）
    const pollingInterval = setInterval(() => {
        if (checkTimeSlotTableExists()) {
            console.log('📡 定期チェックで時間帯テーブルを検出');
            analyzeAndAddMonitorButtons();
            clearInterval(pollingInterval);
            observer.disconnect();
        }
    }, 2000);
    
    // 30秒後にポーリング停止
    setTimeout(() => {
        clearInterval(pollingInterval);
    }, 30000);
    
    // 初回チェック
    setTimeout(() => {
        if (checkTimeSlotTableExists()) {
            console.log('既存の時間帯テーブルを検出');
            analyzeAndAddMonitorButtons();
            observer.disconnect();
            clearInterval(pollingInterval);
        }
    }, 1000);
}

// 時間帯テーブルの動的待機
async function waitForTimeSlotTable(timeout = 10000) {
    const startTime = Date.now();
    const checkInterval = 500;
    
    console.log('時間帯テーブルの出現を待機中...');
    
    while (Date.now() - startTime < timeout) {
        if (checkTimeSlotTableExists()) {
            console.log('時間帯テーブルを検出しました');
            return true;
        }
        
        // ランダム待機時間で次のチェック
        const waitTime = checkInterval + Math.floor(Math.random() * 200);
        await new Promise(resolve => setTimeout(resolve, waitTime));
    }
    
    console.log(`時間帯テーブルの待機がタイムアウトしました (${timeout}ms)`);
    return false;
}

// 時間帯テーブルの存在確認
function checkTimeSlotTableExists() {
    // 実際の時間帯要素をチェック（時間を含むもの）
    const allElements = document.querySelectorAll(timeSlotSelectors.timeSlotCells);
    const actualTimeSlots = [];
    
    allElements.forEach(el => {
        const text = el.textContent?.trim();
        // 時間帯の形式をチェック（例: "9:00-", "11:00-", "13時"など）
        if (text && (text.includes(':') && text.includes('-') || text.includes('時'))) {
            actualTimeSlots.push(el);
        }
    });
    
    if (actualTimeSlots.length > 0) {
        console.log(`✅ 実際の時間帯要素を${actualTimeSlots.length}個検出`);
        
        // 時間帯要素の詳細を表示
        for (let i = 0; i < Math.min(3, actualTimeSlots.length); i++) {
            const el = actualTimeSlots[i];
            const text = el.textContent?.trim();
            const disabled = el.getAttribute('data-disabled');
            const pressed = el.getAttribute('aria-pressed');
            
            console.log(`  時間帯[${i}]: "${text}" disabled="${disabled}" pressed="${pressed}"`);
            
            // 満員アイコンのチェック
            const hasFullIcon = el.querySelector('img[src*="calendar_ng.svg"]');
            if (hasFullIcon) {
                console.log(`    ⚠️ 満員時間帯: ${text}`);
            }
        }
        
        return true;
    }
    
    console.log('❌ 実際の時間帯要素が見つかりません（カレンダー日付のみ）');
    return false;
}

// 時間帯分析とボタン追加のメイン処理
function analyzeAndAddMonitorButtons() {
    const analysis = analyzeTimeSlots();
    console.log('時間帯分析結果:', analysis);
    
    // 満員時間帯にボタンを追加
    if (analysis.full.length > 0) {
        addMonitorButtonsToFullSlots(analysis.full);
    } else {
        console.log('現在満員の時間帯はありません');
    }
}

// 全時間帯の状態分析
function analyzeTimeSlots() {
    const available = [];
    const full = [];
    const selected = [];
    
    // 全ての時間帯要素を取得し、時間形式のもののみをフィルタ
    const allElements = document.querySelectorAll(timeSlotSelectors.timeSlotCells);
    
    allElements.forEach(element => {
        const text = element.textContent?.trim();
        // 時間帯の形式をチェック
        if (text && (text.includes(':') && text.includes('-') || text.includes('時'))) {
            const timeInfo = extractTimeSlotInfo(element);
            if (timeInfo) {
                if (timeInfo.status === 'full') {
                    full.push(timeInfo);
                } else if (timeInfo.status === 'selected') {
                    selected.push(timeInfo);
                } else {
                    available.push(timeInfo);
                }
            }
        }
    });
    
    return { available, full, selected };
}

// 時間帯要素から情報を抽出
function extractTimeSlotInfo(buttonElement) {
    const tdElement = buttonElement.closest('td');
    if (!tdElement) return null;
    
    // 時間テキストを取得
    const timeSpan = buttonElement.querySelector('dt span');
    const timeText = timeSpan ? timeSpan.textContent.trim() : '';
    
    // アイコンの種類を判定
    let iconType = 'unknown';
    if (buttonElement.querySelector(timeSlotSelectors.fullIcon.replace('img', ''))) {
        iconType = 'full';
    } else if (buttonElement.querySelector(timeSlotSelectors.highIcon.replace('img', ''))) {
        iconType = 'high';
    } else if (buttonElement.querySelector(timeSlotSelectors.lowIcon.replace('img', ''))) {
        iconType = 'low';
    }
    
    // 状態を判定
    let status = 'unknown';
    if (buttonElement.hasAttribute('data-disabled')) {
        status = 'full';
    } else if (buttonElement.classList.contains('style_active__JTpSq')) {
        status = 'selected';
    } else {
        status = 'available';
    }
    
    return {
        element: buttonElement,
        tdElement: tdElement,
        timeText: timeText,
        status: status,
        iconType: iconType,
        selector: generateSelectorForElement(buttonElement)
    };
}

// 要素のセレクタを生成（フォールバック用）
function generateSelectorForElement(element) {
    const timeSpan = element.querySelector('dt span');
    const timeText = timeSpan ? timeSpan.textContent.trim() : '';
    return `td[data-gray-out] div[role='button'] dt span:contains('${timeText}')`;
}

// 満員時間帯にモニタリングボタンを追加
function addMonitorButtonsToFullSlots(fullSlots) {
    fullSlots.forEach(slotInfo => {
        createMonitorButton(slotInfo);
    });
}

// 個別監視ボタンの作成
function createMonitorButton(slotInfo) {
    const { element, timeText } = slotInfo;
    
    // dt要素を探す
    const dtElement = element.querySelector('dt');
    if (!dtElement) {
        console.log(`dt要素が見つかりません: ${timeText}`);
        return;
    }
    
    // 既にボタンが存在するかチェック
    const existingButton = dtElement.querySelector('.monitor-btn');
    if (existingButton) {
        console.log(`監視ボタンは既に存在します: ${timeText}`);
        return;
    }
    
    // 監視ボタンを作成
    const monitorButton = document.createElement('button');
    monitorButton.classList.add('ext-ytomo', 'monitor-btn');
    monitorButton.setAttribute('data-target-time', timeText);
    monitorButton.style.cssText = `
        height: auto;
        min-height: 20px;
        width: auto;
        min-width: 35px;
        padding: 1px 4px;
        background: rgb(255, 140, 0);
        color: white;
        margin-left: 8px;
        font-size: 10px;
        border: none;
        border-radius: 2px;
        cursor: pointer;
        display: inline-block;
        vertical-align: middle;
    `;
    
    // ボタンテキストとイベントリスナー
    const buttonSpan = document.createElement('span');
    buttonSpan.classList.add('ext-ytomo');
    buttonSpan.innerText = '📡監視';
    monitorButton.appendChild(buttonSpan);
    
    // クリックイベント
    monitorButton.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        handleMonitorButtonClick(slotInfo, monitorButton);
    });
    
    // dt要素内に追加（spanの後）
    dtElement.appendChild(monitorButton);
    
    console.log(`監視ボタンを追加しました: ${timeText}`);
}

// 監視ボタンクリック処理
function handleMonitorButtonClick(slotInfo, buttonElement) {
    console.log(`監視ボタンがクリックされました: ${slotInfo.timeText}`);
    
    // 既に他の時間帯が選択されている場合はリセット
    if (timeSlotState.targetSlot && timeSlotState.targetSlot.timeText !== slotInfo.timeText) {
        resetPreviousSelection();
    }
    
    // 選択状態を設定
    timeSlotState.targetSlot = slotInfo;
    timeSlotState.mode = 'selecting';
    
    // ボタンの表示を変更
    const buttonSpan = buttonElement.querySelector('span');
    buttonSpan.innerText = '✅選択中';
    buttonElement.style.background = 'rgb(0, 104, 33)';
    buttonElement.disabled = true;
    
    // 他の監視ボタンを無効化
    disableOtherMonitorButtons(slotInfo.timeText);
    
    // メインボタンの表示を更新
    updateMainButtonDisplay();
    
    console.log(`時間帯 ${slotInfo.timeText} を監視対象に設定しました`);
}

// 前の選択をリセット
function resetPreviousSelection() {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        const span = button.querySelector('span');
        if (span && span.innerText === '✅選択中') {
            span.innerText = '📡監視';
            button.style.background = 'rgb(255, 140, 0)';
            button.style.opacity = '1';
            button.disabled = false;
        }
    });
}

// 他の監視ボタンを無効化
function disableOtherMonitorButtons(selectedTime) {
    const allMonitorButtons = document.querySelectorAll('.monitor-btn');
    allMonitorButtons.forEach(button => {
        const targetTime = button.getAttribute('data-target-time');
        if (targetTime !== selectedTime) {
            button.style.opacity = '0.5';
            button.style.cursor = 'not-allowed';
            button.disabled = true;
        }
    });
}

// メインボタンの表示更新
function updateMainButtonDisplay() {
    const mainButton = document.querySelector('#entrance-reservation-controls button');
    if (mainButton && timeSlotState.targetSlot) {
        const span = mainButton.querySelector('span');
        if (span) {
            span.innerText = '繰り返し読み込みand try';
        }
    }
}

function createEntranceReservationUI(config) {
    const targetDiv = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
    if (!targetDiv) {
        console.error('UI挿入対象のdivが見つかりません');
        return;
    }

    const controlDiv = document.createElement('div');
    controlDiv.style.display = 'flex';
    controlDiv.style.gap = '10px';
    controlDiv.style.margin = '10px 0';
    controlDiv.id = 'entrance-reservation-controls';

    const startButton = document.createElement('button');
    startButton.classList.add('basic-btn', 'type2', 'no-after', 'ext-ytomo');
    startButton.style.height = 'auto';
    startButton.style.minHeight = '40px';
    startButton.style.width = 'auto';
    startButton.style.minWidth = '60px';
    startButton.style.padding = '0px 8px';
    startButton.style.background = 'rgb(0, 104, 33)';
    startButton.style.color = 'white';
    startButton.style.margin = '5px';
    
    const startSpan = document.createElement('span');
    startSpan.classList.add('ext-ytomo');
    startSpan.innerText = '繰り返し予約try';
    startButton.appendChild(startSpan);

    const stopButton = document.createElement('button');
    stopButton.classList.add('basic-btn', 'type2', 'no-after', 'ext-ytomo');
    stopButton.style.height = 'auto';
    stopButton.style.minHeight = '40px';
    stopButton.style.width = 'auto';
    stopButton.style.minWidth = '60px';
    stopButton.style.padding = '0px 8px';
    stopButton.style.background = 'rgb(74, 76, 74)';
    stopButton.style.color = 'white';
    stopButton.style.margin = '5px';
    stopButton.disabled = true;
    
    const stopSpan = document.createElement('span');
    stopSpan.classList.add('ext-ytomo');
    stopSpan.innerText = '繰り返しキャンセル';
    stopButton.appendChild(stopSpan);

    const statusDiv = document.createElement('div');
    statusDiv.style.padding = '5px';
    statusDiv.style.fontSize = '14px';
    statusDiv.style.color = '#666';
    statusDiv.id = 'reservation-status';
    statusDiv.innerText = '待機中';

    startButton.addEventListener('click', async () => {
        if (entranceReservationState.isRunning) return;
        
        entranceReservationState.isRunning = true;
        entranceReservationState.shouldStop = false;
        startButton.disabled = true;
        stopButton.disabled = false;
        startButton.style.background = 'rgb(74, 76, 74)';
        statusDiv.innerText = '予約処理実行中...';
        
        try {
            const result = await entranceReservationHelper(config);
            if (result.success) {
                statusDiv.innerText = `🎉 予約成功！(${result.attempts}回試行)`;
                statusDiv.style.color = 'green';
            } else {
                statusDiv.innerText = `予約失敗 (${result.attempts}回試行)`;
                statusDiv.style.color = 'red';
            }
        } catch (error) {
            console.error('予約処理エラー:', error);
            statusDiv.innerText = `エラー: ${error.message}`;
            statusDiv.style.color = 'red';
        } finally {
            entranceReservationState.isRunning = false;
            startButton.disabled = false;
            stopButton.disabled = true;
            startButton.style.background = 'rgb(0, 104, 33)';
        }
    });

    stopButton.addEventListener('click', () => {
        entranceReservationState.shouldStop = true;
        statusDiv.innerText = 'キャンセル中...';
        statusDiv.style.color = 'orange';
    });

    controlDiv.appendChild(startButton);
    controlDiv.appendChild(stopButton);
    controlDiv.appendChild(statusDiv);
    targetDiv.appendChild(controlDiv);
    
    console.log('入場予約制御UIを挿入しました');
}

async function entranceReservationHelper(config) {
    const { selectors, selectorTexts, timeouts } = config;
    let attempts = 0;
    const maxAttempts = 100;
    
    console.log('入場予約補助機能を開始します...');
    
    while (attempts < maxAttempts && !entranceReservationState.shouldStop) {
        attempts++;
        console.log(`試行回数: ${attempts}`);
        
        const statusDiv = document.getElementById('reservation-status');
        if (statusDiv) {
            statusDiv.innerText = `試行中... (${attempts}回目)`;
        }
        
        try {
            console.log('1. submitボタンを待機中...');
            const submitButton = await waitForElement(selectors.submit, timeouts.waitForSubmit, config);
            
            if (entranceReservationState.shouldStop) break;
            
            console.log('submitボタンが見つかりました。クリックします。');
            await clickElement(submitButton, config);
            
            console.log('2. レスポンスを待機中...');
            const responseSelectors = {
                change: selectors.change,
                success: selectors.success,
                failure: selectors.failure
            };
            
            const response = await waitForAnyElement(responseSelectors, timeouts.waitForResponse, selectorTexts, config);
            console.log(`レスポンス検出: ${response.key}`);
            
            if (entranceReservationState.shouldStop) break;
            
            if (response.key === 'change') {
                console.log('changeボタンをクリックします。');
                await clickElement(response.element, config);
                
                console.log('success/failureを待機中...');
                const finalSelectors = {
                    success: selectors.success,
                    failure: selectors.failure
                };
                
                const finalResponse = await waitForAnyElement(finalSelectors, timeouts.waitForResponse, selectorTexts, config);
                console.log(`最終レスポンス検出: ${finalResponse.key}`);
                
                if (finalResponse.key === 'success') {
                    console.log('🎉 予約成功！処理を終了します。');
                    return { success: true, attempts };
                } else {
                    console.log('予約失敗。closeボタンをクリックして再試行します。');
                    const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                    await clickElement(closeButton, config);
                    await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
                }
            } else if (response.key === 'success') {
                console.log('🎉 予約成功！処理を終了します。');
                return { success: true, attempts };
            } else if (response.key === 'failure') {
                console.log('予約失敗。closeボタンをクリックして再試行します。');
                const closeButton = await waitForElement(selectors.close, timeouts.waitForClose, config);
                await clickElement(closeButton, config);
                await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
            }
            
        } catch (error) {
            console.error(`エラーが発生しました (試行 ${attempts}):`, error.message);
            if (entranceReservationState.shouldStop) break;
            await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
        }
    }
    
    if (entranceReservationState.shouldStop) {
        console.log('ユーザーによってキャンセルされました。');
        return { success: false, attempts, cancelled: true };
    }
    
    console.log(`最大試行回数 (${maxAttempts}) に達しました。処理を終了します。`);
    return { success: false, attempts };
}

// URL判定とページタイプ識別
const identify_page_type = (url) => {
    if (url.includes("ticket.expo2025.or.jp/event_search/")) {
        return "pavilion_reservation";
    } else if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
        return "entrance_reservation";
    }
    return null;
}

// ページ遷移時の初期化トリガー
const trigger_init = (url_record) => {
    const page_type = identify_page_type(url_record);
    
    if (page_type === "pavilion_reservation") {
        const interval_judge = setInterval(() => {
            if (judge_init()) {
                clearInterval(interval_judge);
                init_page();
                console.log("ytomo extension loaded (pavilion reservation)");
            }
        }, 500);
    } else if (page_type === "entrance_reservation") {
        const interval_judge = setInterval(() => {
            if (judge_entrance_init()) {
                clearInterval(interval_judge);
                init_entrance_page();
                console.log("ytomo extension loaded (entrance reservation)");
            }
        }, 500);
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
}
catch (e) {
    // エラー時の処理
    console.error("ytomo extension error", e);
    // alert(e);
}
