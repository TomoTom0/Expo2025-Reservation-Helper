/**
 * コアユーティリティモジュール
 * 基本機能・ユーティリティ関数を提供
 */

// スタイルを挿入する関数
export const insert_style = () => {
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
export const prepare_filter = (val_search) => {
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

// 入場予約関連のヘルパー関数
export function getRandomWaitTime(minTime, randomRange, config) {
    const { randomSettings } = config;
    const actualMinTime = minTime !== undefined ? minTime : randomSettings.minCheckInterval;
    const actualRandomRange = randomRange !== undefined ? randomRange : randomSettings.checkRandomRange;
    return actualMinTime + Math.floor(Math.random() * actualRandomRange);
}

export async function waitForElement(selector, timeout = 5000, config) {
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

export async function waitForAnyElement(selectors, timeout = 10000, selectorTexts = {}, config) {
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

export async function clickElement(element, config) {
    element.click();
    const delay = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
    await new Promise(resolve => setTimeout(resolve, delay));
}

// URL判定とページタイプ識別
export const identify_page_type = (url) => {
    if (url.includes("ticket.expo2025.or.jp/event_search/")) {
        return "pavilion";
    } else if (url.includes("ticket.expo2025.or.jp/ticket_visiting_reservation/")) {
        return "entrance";
    } else {
        return null;
    }
};

// Unit Test用追加の純粋関数
export function extractTimeSlotInfo(text) {
    if (!text || typeof text !== 'string') {
        return null;
    }
    
    const match = text.match(/(\d{1,2}:\d{2})～(\d{1,2}:\d{2})/);
    if (match) {
        return {
            startTime: match[1],
            endTime: match[2],
            fullText: match[0]
        };
    }
    return null;
}

export function generateSelectorForElement(element) {
    if (!element) {
        throw new Error('要素が指定されていません');
    }
    
    let selector = element.tagName.toLowerCase();
    
    if (element.id) {
        selector += `#${element.id}`;
    }
    
    if (element.className) {
        const classes = element.className.split(' ').filter(cls => cls.trim());
        if (classes.length > 0) {
            selector += '.' + classes.join('.');
        }
    }
    
    return selector;
}