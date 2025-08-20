// 【1. 基本機能・ユーティリティ】
// ============================================================================

// スタイルのインポート
import '../styles/main.scss';

// 型定義のインポート
import type { 
    ReservationConfig, 
    ElementSearchResult
} from '../types/index.js';

// SCSSファイルからスタイルが自動的にインポートされるため、insert_style関数は不要

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
const prepare_filter = (val_search: string): { include: RegExp, exclude: RegExp[] | null } => {
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
    const includeTokens: string[] = [];
    const excludeTokens: string[] = [];

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
    type TokenGroup = string | TokenGroup[];
    const processParentheses = (tokens: string[]): TokenGroup[] => {
        const stack: TokenGroup[][] = [[]];
        for (const token of tokens) {
            if (token === '(') {
                stack.push([]);
            } else if (token === ')') {
                if (stack.length > 1) {
                    const group = stack.pop()!;
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
    const buildRegex = (group: TokenGroup[] | TokenGroup): string => {
        if (Array.isArray(group)) {
            const parts: string[] = group.map(item => Array.isArray(item) ? buildRegex(item) : item as string);

            // ORマーカーがあるかチェック
            const orIndex = parts.findIndex((part: string) => part === '\uFFFF');
            if (orIndex > -1) {
                const left: string = buildRegex(parts.slice(0, orIndex));
                const right: string = buildRegex(parts.slice(orIndex + 1));
                return `(?:${left}|${right})`;
            } else {
                // AND条件の場合は順不同でマッチするように変更
                return parts.map((part: string) => `(?=.*${part})`).join('');
            }
        }
        return group as string;
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
const init_page = (): void => {
    // ヘッダーにFAB切替ボタンを追加（DOM構築完了を待つ）
    setTimeout(() => {
        import('./entrance-page-state').then((entrancePageState) => {
            entrancePageState.createFABToggleButton();
        });
    }, 1000);
    
    // すべて読み込みボタンの自動クリック処理
    const load_more_auto = async () => {
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const arr_btn = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        
        console.log(`🔄 load_more_auto実行: もっと見るボタン${arr_btn.length}個`);
        
        if (arr_btn.length > 0) {
            // 件数変化をログ出力
            const beforeCounts = getItemCounts();
            console.log(`📊 クリック前の件数: ${beforeCounts.visible}/${beforeCounts.total}`);
            
            (arr_btn[0] as HTMLElement).click();
            // 件数表示を継続的に更新（読み込み速度に影響しない）
            const updateInterval = setInterval(() => {
                if ((window as any).updatePavilionCounts) {
                    (window as any).updatePavilionCounts();
                }
            }, 200);
            
            setTimeout(() => {
                scrollTo(scrollX, scrollY);
                
                // 件数変化をログ出力
                const afterCounts = getItemCounts();
                console.log(`📊 クリック後の件数: ${afterCounts.visible}/${afterCounts.total}`);
                
                // 次の読み込みを即座に実行
                clearInterval(updateInterval);
                load_more_auto();
            }, 500)
        } else {
            console.log(`✅ load_more_auto完了: もっと見るボタンがありません`);
            // 完了時にも件数表示を更新
            if ((window as any).updatePavilionCounts) {
                (window as any).updatePavilionCounts();
                console.log(`📊 完了時の件数表示を更新`);
            }
        }
    }


    // 件数をカウントする関数
    const getItemCounts = () => {
        const allItems = document.querySelectorAll("div.style_search_item_row__moqWC");
        const visibleItems = document.querySelectorAll("div.style_search_item_row__moqWC:not(.safe-none):not(.ytomo-none):not(.filter-none)");
        return {
            total: allItems.length,
            visible: visibleItems.length
        };
    };

    // 空きありパビリオン数をカウントする関数
    const getAvailableItemCounts = () => {
        const allItems = document.querySelectorAll("div.style_search_item_row__moqWC");
        // 空きありのパビリオン（calendar_none.svgがないもの）
        const availableItems = document.querySelectorAll("div.style_search_item_row__moqWC:not(:has(img[src*=\"/asset/img/calendar_none.svg\"]))");
        return {
            total: allItems.length,
            available: availableItems.length
        };
    };

    // 「空きのみ」ボタンのテキストを更新する関数
    const updateFilterSafeButtonText = () => {
        const filterSafeButtons = document.querySelectorAll("button.btn-filter-safe");
        const counts = getAvailableItemCounts();
        
        filterSafeButtons.forEach((btn) => {
            const button = btn as HTMLButtonElement;
            const baseText = '空きのみ';
            const countText = counts.available.toString();
            // SCSSクラスで数字部分を装飾
            button.innerHTML = `${baseText} <span class="button-count">${countText}</span>`;
        });
    };

    // 「もっと見る」ボタンの存在をチェックする関数
    const hasMoreButton = () => {
        // 全ての「もっと見る」ボタンをチェック（disabled含む）
        const allMoreButtons = document.querySelectorAll("button.style_more_btn__ymb22");
        const enabledMoreButtons = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        
        console.log(`🔍 もっと見るボタンチェック: 全体${allMoreButtons.length}個, 有効${enabledMoreButtons.length}個`);
        allMoreButtons.forEach((btn, index) => {
            console.log(`  ボタン${index + 1}: disabled=${btn.hasAttribute('disabled')}, text="${btn.textContent?.trim()}"`);
        });
        
        // 有効な「もっと見る」ボタンがある場合のみtrue
        return enabledMoreButtons.length > 0;
    };

    // 「すべて読み込み」ボタンの状態を更新する関数
    const updateLoadAllButtonState = () => {
        const loadAllButtons = document.querySelectorAll("button.btn-load-all");
        const hasMore = hasMoreButton();
        const isLoading = document.querySelectorAll("button.btn-load-all.btn-loading").length > 0;
        
        // 状態が変化した時のみログ出力
        const currentState = { hasMore, isLoading, buttonCount: loadAllButtons.length };
        if (JSON.stringify(currentState) !== JSON.stringify((updateLoadAllButtonState as any).lastState)) {
            console.log(`🔧 すべて読み込みボタン状態更新: もっと見るボタン=${hasMore ? 'あり' : 'なし'}, 実行中=${isLoading}`);
            (updateLoadAllButtonState as any).lastState = currentState;
        }
        
        loadAllButtons.forEach((btn) => {
            const button = btn as HTMLButtonElement;
            
            // 実行中の場合は強制的にdisabled状態にする
            if (isLoading) {
                button.disabled = true;
                button.classList.remove("btn-enabled");
                button.classList.add("btn-disabled");
                return;
            }
            
            if (hasMore) {
                button.disabled = false;
                button.classList.remove("btn-done", "btn-disabled", "btn-loading");
                button.classList.add("btn-enabled");
            } else {
                button.disabled = true;
                button.classList.remove("btn-enabled", "btn-loading");
                button.classList.add("btn-done", "btn-disabled");
            }
        });
    };

    // パビリオン用FABボタンを作成する関数
    const createPavilionFAB = () => {
        // 既存のFABがあるかチェック
        const existingFab = document.getElementById('ytomo-pavilion-fab-container');
        if (existingFab) {
            return; // 既に存在する場合は何もしない
        }

        // FABコンテナを作成（右下固定、入場予約FABと同じスタイル）
        const fabContainer = document.createElement('div');
        fabContainer.id = 'ytomo-pavilion-fab-container';
        fabContainer.classList.add('ytomo-pavilion-fab-container', 'ytomo-pavilion-fab');

        // メインFABボタンを作成（入場予約FABと同じスタイル）
        const fabButton = document.createElement('button');
        fabButton.id = 'ytomo-pavilion-fab-button';
        fabButton.classList.add('ext-ytomo', 'ytomo-fab', 'ytomo-fab-enabled');

        // FABボタンの内容構造（縦配置）
        const fabContent = document.createElement('div');
        fabContent.classList.add('ytomo-fab-inner-content');

        // 展開/縮小アイコン（上部）
        const expandIcon = document.createElement('div');
        expandIcon.className = 'pavilion-fab-expand-icon';
        expandIcon.innerHTML = '▲'; // 初期は縮小状態（展開可能）

        // YTomoテキスト（中央）- 小さく控えめに
        const brandText = document.createElement('div');
        brandText.className = 'pavilion-fab-brand-text';
        brandText.innerText = 'YTomo';

        // 件数表示（下部）- 大きく目立つように
        const countsText = document.createElement('div');
        countsText.className = 'pavilion-fab-counts-text';
        countsText.innerText = '0/0'; // 初期値、後で更新

        // DOM構築
        fabContent.appendChild(expandIcon);
        fabContent.appendChild(brandText);
        fabContent.appendChild(countsText);
        fabButton.appendChild(fabContent);
        
        // FABボタンの位置設定はCSSで行う

        // 件数表示を更新する関数（FABボタン内に表示）
        const updateCountsDisplay = () => {
            const counts = getItemCounts();
            const newText = `${counts.visible}/${counts.total}`;
            
            // 件数が変化した時のみログ出力
            if (countsText.innerText !== newText) {
                console.log(`📊 件数表示更新: ${newText}`);
                countsText.innerText = newText;
            }
            
            // 「空きのみ」ボタンのテキストも更新
            updateFilterSafeButtonText();
        };

        // サブアクションボタンコンテナ
        const subActionsContainer = document.createElement('div');
        subActionsContainer.id = 'pavilion-sub-actions';
        subActionsContainer.className = 'pavilion-sub-actions-container';

        // サブアクションボタンの作成
        const createSubButton = (text: string, className: string) => {
            const btn = document.createElement('button');
            btn.classList.add('ext-ytomo', 'fab-sub-btn', 'base-style', className, 'btn-enabled');
            btn.textContent = text;
            
            return btn;
        };

        const btnLoadAll = createSubButton('すべて読み込み', 'btn-load-all');
        const btnFilterSafe = createSubButton('空きのみ', 'btn-filter-safe');
        const btnAlertToCopy = createSubButton('一覧コピー', 'btn-alert-to-copy');
        const btnDayReservation = createSubButton('当日予約', 'btn-day-reservation');

        // DOM構築
        subActionsContainer.appendChild(btnLoadAll);
        subActionsContainer.appendChild(btnFilterSafe);
        subActionsContainer.appendChild(btnAlertToCopy);
        subActionsContainer.appendChild(btnDayReservation);
        
        fabContainer.appendChild(subActionsContainer);
        fabContainer.appendChild(fabButton);

        // FABの開閉制御（デフォルトで展開）
        let isExpanded = true; // デフォルトで展開状態
        
        // 初期状態を展開に設定
        subActionsContainer.classList.add('expanded');
        expandIcon.innerHTML = '▼'; // 展開状態（縮小可能）
        
        fabButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                subActionsContainer.classList.add('expanded');
                expandIcon.innerHTML = '▼'; // 展開状態（縮小可能）
            } else {
                subActionsContainer.classList.remove('expanded');
                expandIcon.innerHTML = '▲'; // 縮小状態（展開可能）
                updateCountsDisplay(); // 閉じる時に件数を更新して表示
            }
        });

        // 初期件数表示
        updateCountsDisplay();

        document.body.appendChild(fabContainer);
        
        // FABに件数更新関数を公開
        (window as any).updatePavilionCounts = updateCountsDisplay;
        
            // DOMの変化を監視してボタンの状態を自動更新
        const observer = new MutationObserver((mutations) => {
            let shouldUpdate = false;
            
            mutations.forEach((mutation) => {
                // 「もっと見る」ボタンの変化を検知
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'disabled' &&
                    mutation.target instanceof Element &&
                    mutation.target.classList.contains('style_more_btn__ymb22')) {
                    shouldUpdate = true;
                    console.log('📍 もっと見るボタンのdisabled属性変化を検知');
                }
                
                // 新しい「もっと見る」ボタンの追加/削除を検知
                if (mutation.type === 'childList') {
                    let shouldUpdateCounts = false;
                    
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            const moreButtons = node.querySelectorAll('button.style_more_btn__ymb22');
                            if (moreButtons.length > 0) {
                                shouldUpdate = true;
                                console.log('📍 新しいもっと見るボタンの追加を検知');
                            }
                            
                            // 検索アイテムの追加を検知
                            const searchItems = node.querySelectorAll('div.style_search_item_row__moqWC');
                            if (searchItems.length > 0) {
                                shouldUpdateCounts = true;
                                console.log('📍 新しい検索アイテムの追加を検知');
                            }
                        }
                    });
                    
                    mutation.removedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            const moreButtons = node.querySelectorAll('button.style_more_btn__ymb22');
                            if (moreButtons.length > 0) {
                                shouldUpdate = true;
                                console.log('📍 もっと見るボタンの削除を検知');
                            }
                        }
                    });
                    
                    if (shouldUpdateCounts) {
                        setTimeout(() => {
                            updateCountsDisplay();
                        }, 100);
                    }
                }
                
                // class属性の変化を検知（フィルタリング用）
                if (mutation.type === 'attributes' && 
                    mutation.attributeName === 'class' &&
                    mutation.target instanceof Element &&
                    mutation.target.classList.contains('style_search_item_row__moqWC')) {
                    setTimeout(() => {
                        updateCountsDisplay();
                    }, 50);
                }
            });
            
            if (shouldUpdate) {
                // 少し遅延を入れてDOM更新完了を待つ
                setTimeout(() => {
                    updateLoadAllButtonState();
                }, 100);
            }
        });
        
        // 監視開始
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['disabled']
        });
        
        // 初期状態で「すべて読み込み」ボタンの状態を設定
        setTimeout(() => {
            updateLoadAllButtonState();
        }, 1000);
    }

    // const refresh_btn_ = () => {

    // }

    // 元の検索入力欄を追加する関数
    const insert_search_input = () => {
        const div_official_search = document.querySelector("div.style_search__7HKSe");
        const div_insert = document.createElement("div");
        div_insert.classList.add("div-flex");

        const input_another_search = document.createElement("input");
        input_another_search.classList.add("ext-tomo");
        input_another_search.classList.add("search");
        input_another_search.setAttribute("type", "text");
        input_another_search.setAttribute("placeholder", "読み込みなし絞込");

        const btn_filter_without_load = document.createElement("button");
        btn_filter_without_load.classList.add("basic-btn", "type2", "no-after", "ext-ytomo", "btn-filter-without-load");
        const span_filter_without_load = document.createElement("span");
        span_filter_without_load.classList.add("ext-ytomo");
        span_filter_without_load.innerText = "絞込";
        btn_filter_without_load.appendChild(span_filter_without_load);

        div_insert.appendChild(input_another_search);
        div_insert.appendChild(btn_filter_without_load);
        if (div_official_search) {
            div_official_search.after(div_insert);
        }
    }

    insert_search_input();
    createPavilionFAB();
    
    // 状態更新関数をグローバルに公開
    // TODO: 適切なmodule構造で置き換えるべき
    (window as any).updateLoadAllButtonState = updateLoadAllButtonState;
    
    // ページ読み込み完了後に状態をチェック（複数回、より頻繁に）
    const checkIntervals = [500, 1000, 2000, 3000, 5000];
    checkIntervals.forEach((delay, index) => {
        setTimeout(() => {
            // 最初と最後のチェックのみログ出力
            if (index === 0 || index === checkIntervals.length - 1) {
                console.log(`🕐 状態チェック${index + 1} (${delay}ms後)`);
            }
            updateLoadAllButtonState();
            // 件数表示も更新
            if ((window as any).updatePavilionCounts) {
                (window as any).updatePavilionCounts();
            }
        }, delay);
    });
    
    // DOM Content Loadedイベント後にもチェック
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('📋 DOMContentLoaded後の状態チェック');
            setTimeout(() => {
                updateLoadAllButtonState();
            }, 100);
        });
    }

    // 独自ボタンのクリックイベントハンドラ
    document.addEventListener("click", (event) => {
        if ((event.target as Element)?.matches?.("button.ext-ytomo, button.ext-ytomo *, button.pavilion-sub-btn, button.pavilion-sub-btn *")) {
            const target = (event.target as Element)?.closest?.("button.ext-ytomo, button.pavilion-sub-btn");
            if (target && target.classList.contains("btn-load-all")) {
                // すべて読み込み
                const button = target as HTMLButtonElement;
                console.log('🚀 すべて読み込み開始');
                console.log(`🔧 クリック対象ボタン:`, button);
                console.log(`🔧 実行前の状態: disabled=${button.disabled}, classes=${button.className}`);
                
                // 既に実行中の場合は何もしない
                if (button.classList.contains("btn-loading")) {
                    console.log('⚠️ すでに実行中のため無視');
                    return;
                }
                
                // 実行中は強制的にdisabled & 専用クラス設定
                button.disabled = true;
                button.classList.remove("btn-enabled");
                button.classList.add("btn-disabled", "btn-loading");
                console.log(`🔧 実行開始時の状態設定完了: disabled=${button.disabled}, classes=${button.className}`);
                console.log(`🔧 実際のHTML disabled属性:`, button.hasAttribute('disabled'));
                console.log(`🔧 computedStyle background:`, window.getComputedStyle(button).backgroundColor);
                
                // 他の「すべて読み込み」ボタンも同時に無効化
                document.querySelectorAll("button.btn-load-all").forEach((btn) => {
                    if (btn !== button) {
                        const otherBtn = btn as HTMLButtonElement;
                        otherBtn.disabled = true;
                        btn.classList.remove("btn-enabled");
                        btn.classList.add("btn-disabled", "btn-loading");
                    }
                });
                
                load_more_auto().then(() => {
                    console.log('✅ すべて読み込み完了');
                    // 全ての「すべて読み込み」ボタンのloading状態を解除
                    document.querySelectorAll("button.btn-load-all").forEach((btn) => {
                        const loadBtn = btn as HTMLButtonElement;
                        btn.classList.remove("btn-loading");
                        // loading解除と同時にdisabledも一旦解除
                        loadBtn.disabled = false;
                    });
                    // 処理完了後に正しい状態をチェック
                    setTimeout(() => {
                        updateLoadAllButtonState();
                    }, 100);
                });
            }
            else if (target && target.classList.contains("btn-filter-safe")) {
                // 空きあり絞り込み
                (target as HTMLButtonElement).disabled = true;
                
                // 現在のフィルター状態を判定（btn-doneクラスの有無で判定）
                const isCurrentlyFiltering = target.classList.contains("btn-done");
                
                // ボタン状態を切り替え
                target.classList.toggle("btn-done");
                
                // 全ての満員パビリオンに対して状態に応じて処理
                document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])")
                .forEach((div) => {
                    if (isCurrentlyFiltering) {
                        // 現在フィルター中 → フィルター解除（表示）
                        div.classList.remove("safe-none");
                    } else {
                        // 現在フィルター無し → フィルター適用（非表示）
                        div.classList.add("safe-none");
                    }
                });

                setTimeout(() => {
                    if (target) {
                        (target as HTMLButtonElement).disabled = false;
                    }
                }, 500)
            }
            else if (target && target.classList.contains("btn-filter-without-load")) {
                // 入力値で絞り込み
                (target as HTMLButtonElement).disabled = true;

                const input_another_search = document.querySelector("input.ext-tomo.search");
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC");

                const val_search = (input_another_search as HTMLInputElement)?.value || '';
                const dic_regex_exp = prepare_filter(val_search);
                if (val_search.length > 0) {
                    arr_div_row.forEach((div) => {
                        div.classList.remove("filter-none");
                        if (!(
                            (dic_regex_exp.include === null || dic_regex_exp.include.test((div as HTMLElement).innerText))
                            && (dic_regex_exp.exclude === null || !dic_regex_exp.exclude.some((d: RegExp) => d.test((div as HTMLElement).innerText)))
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

                if (target) {
                    (target as HTMLButtonElement).disabled = false;
                }
            }
            else if (target && target.classList.contains("btn-alert-to-copy")) {
                // 一覧コピー
                (target as HTMLButtonElement).disabled = true;
                // アラート起動
                // filter-none, ytomo-none, safe-noneを除外して表示
                const arr_div_row = document.querySelectorAll("div.style_search_item_row__moqWC:not(.filter-none):not(.ytomo-none):not(.safe-none)");
                let arr_text: string[] = [];
                // div > button > span のテキストを取得
                arr_div_row.forEach((div) => {
                    const span = div.querySelector("button>span");
                    if (span) {
                        arr_text.push((span as HTMLElement).innerText);
                    }
                })
                const text = arr_text.join("\n");
                try {
                    navigator.clipboard.writeText(text);
                } catch (e) {
                    showErrorMessage('クリップボードエラー', 'クリップボードへのコピーに失敗しました。以下のテキストを手動でコピーしてください:\n\n' + text);
                    // console.error("ytomo extension error", e);
                }
                setTimeout(() => {
                    (target as HTMLButtonElement).disabled = false;
                }, 500)
            }
            else if (target && target.classList.contains("btn-day-reservation")) {
                // 当日予約
                console.log('🎫 当日予約ボタンがクリックされました');
                showDayReservationDialog().catch(error => {
                    console.error('❌ 当日予約ダイアログエラー:', error);
                    showMobileErrorDialog('当日予約エラー', error);
                });
            }
        }
    })
}

// スマホエラー調査用ダイアログ（詳細情報表示）
const showMobileErrorDialog = (title: string, error: any): void => {
    // 既存のエラーダイアログがある場合は削除
    const existingError = document.getElementById('mobile-error-dialog');
    if (existingError) {
        existingError.remove();
    }

    // エラー情報を詳細に収集
    const errorInfo = {
        message: error?.message || String(error),
        stack: error?.stack || 'スタックトレースなし',
        name: error?.name || 'Unknown',
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        isMobile: /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        screen: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        // Chrome拡張環境情報
        chromeAvailable: typeof chrome !== 'undefined',
        chromeRuntimeAvailable: typeof chrome !== 'undefined' && !!chrome.runtime,
        // UserScript環境情報
        gmInfoAvailable: typeof (window as any).GM_info !== 'undefined',
        gmAvailable: typeof GM !== 'undefined',
        gmXmlHttpRequestAvailable: typeof GM_xmlhttpRequest !== 'undefined' || (typeof GM !== 'undefined' && !!GM?.xmlHttpRequest),
        // パフォーマンス情報
        performanceNow: performance.now(),
        // 接続情報
        connectionType: (navigator as any).connection?.effectiveType || 'unknown',
        // メモリ情報（Chrome限定）
        memoryInfo: (performance as any).memory ? {
            used: (performance as any).memory.usedJSHeapSize,
            total: (performance as any).memory.totalJSHeapSize,
            limit: (performance as any).memory.jsHeapSizeLimit
        } : null
    };

    // ダイアログコンテナ
    const dialogOverlay = document.createElement('div');
    dialogOverlay.id = 'mobile-error-dialog';
    dialogOverlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
        box-sizing: border-box;
    `;

    // ダイアログ本体
    const dialog = document.createElement('div');
    dialog.style.cssText = `
        background: white;
        border-radius: 8px;
        padding: 20px;
        max-width: 90%;
        max-height: 80%;
        overflow-y: auto;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;

    // タイトル
    const titleElement = document.createElement('h3');
    titleElement.textContent = `🚨 ${title}`;
    titleElement.style.cssText = `
        margin: 0 0 15px 0;
        color: #d32f2f;
        font-size: 18px;
    `;

    // エラー詳細
    const detailsElement = document.createElement('pre');
    detailsElement.textContent = JSON.stringify(errorInfo, null, 2);
    detailsElement.style.cssText = `
        background: #f5f5f5;
        border: 1px solid #ddd;
        border-radius: 4px;
        padding: 10px;
        font-size: 12px;
        white-space: pre-wrap;
        word-wrap: break-word;
        max-height: 300px;
        overflow-y: auto;
        margin: 10px 0;
    `;

    // ボタン群
    const buttonGroup = document.createElement('div');
    buttonGroup.style.cssText = `
        display: flex;
        gap: 10px;
        margin-top: 15px;
        flex-wrap: wrap;
    `;

    // コピーボタン
    const copyButton = document.createElement('button');
    copyButton.textContent = '📋 エラー情報をコピー';
    copyButton.style.cssText = `
        flex: 1;
        min-width: 120px;
        padding: 10px;
        background: #2196f3;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    copyButton.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(JSON.stringify(errorInfo, null, 2));
            copyButton.textContent = '✅ コピー完了';
            setTimeout(() => {
                copyButton.textContent = '📋 エラー情報をコピー';
            }, 2000);
        } catch {
            // クリップボードAPIが使えない場合
            const textArea = document.createElement('textarea');
            textArea.value = JSON.stringify(errorInfo, null, 2);
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            copyButton.textContent = '✅ コピー完了';
        }
    });

    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.textContent = '❌ 閉じる';
    closeButton.style.cssText = `
        flex: 1;
        min-width: 120px;
        padding: 10px;
        background: #f44336;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
    `;
    closeButton.addEventListener('click', () => {
        dialogOverlay.remove();
    });

    // DOM構築
    buttonGroup.appendChild(copyButton);
    buttonGroup.appendChild(closeButton);
    dialog.appendChild(titleElement);
    dialog.appendChild(detailsElement);
    dialog.appendChild(buttonGroup);
    dialogOverlay.appendChild(dialog);
    document.body.appendChild(dialogOverlay);

    // タップで閉じる
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            dialogOverlay.remove();
        }
    });

    console.log('📱 スマホエラーダイアログ表示:', errorInfo);
};

// エラーメッセージ表示関数
const showErrorMessage = (title: string, message: string): void => {
    // 既存のエラーメッセージがある場合は削除
    const existingError = document.getElementById('ytomo-error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.id = 'ytomo-error-message';
    errorDiv.className = 'ytomo-error-message';
    
    const titleDiv = document.createElement('div');
    titleDiv.className = 'error-title';
    titleDiv.textContent = title;
    
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'error-close-btn';
    closeButton.textContent = '閉じる';
    closeButton.addEventListener('click', () => {
        errorDiv.remove();
    });
    
    errorDiv.appendChild(titleDiv);
    errorDiv.appendChild(messageDiv);
    errorDiv.appendChild(closeButton);
    
    document.body.appendChild(errorDiv);
    
    // 10秒後に自動で消去
    setTimeout(() => {
        if (errorDiv.parentNode) {
            errorDiv.remove();
        }
    }, 10000);
};

// 当日予約機能
interface PavilionData {
    c: string; // パビリオンコード
    n: string; // パビリオン名
    u?: string; // URL
    s: Array<{
        t: string; // 時間 (HHMM)
        s: number; // ステータス (0: 空きあり, 1: 残りわずか, 2: 満席)
    }>;
}

// 当日予約ダイアログ表示関数
const showDayReservationDialog = async (): Promise<void> => {
    console.log('🎫 当日予約ダイアログを表示します');
    
    try {
        // 万博API 全体データを取得（フィルターは表示側で制御）
        const expoData = await fetchAllExpoReservationData();
        createDayReservationDialog(expoData, false); // デフォルトは空きのみモード
    } catch (error) {
        console.error('❌ 万博API データの取得に失敗:', error);
        showMobileErrorDialog('データ取得エラー', error);
    }
};

// 万博API 全体データ取得関数（空きなしも含む）
const fetchAllExpoReservationData = async (): Promise<PavilionData[]> => {
    console.log('🌐 万博API から全体データを取得中...');
    
    try {
        let data: PavilionData[];
        
        // UserScript環境を最優先で判定（GM_infoやGMオブジェクトで確実に識別）
        if (typeof (window as any).GM_info !== 'undefined' || typeof GM !== 'undefined') {
            // UserScript環境: GM_xmlhttpRequestを使用
            data = await new Promise<PavilionData[]>((resolve, reject) => {
                const request = GM_xmlhttpRequest || GM?.xmlHttpRequest;
                if (!request) {
                    reject(new Error('GM_xmlhttpRequest not available'));
                    return;
                }
                
                request({
                    method: 'GET',
                    url: 'https://expo.ebii.net/api/data',
                    onload: (response) => {
                        try {
                            const jsonData = JSON.parse(response.responseText);
                            resolve(jsonData);
                        } catch (e) {
                            reject(new Error('Failed to parse JSON response'));
                        }
                    },
                    onerror: (error) => {
                        reject(new Error(`Request failed: ${error}`));
                    }
                });
            });
        } else if (typeof chrome !== 'undefined' && chrome.runtime) {
            // Chrome拡張機能環境: background scriptを経由
            const response = await new Promise<{success: boolean, data?: PavilionData[], error?: string}>((resolve, reject) => {
                let isResolved = false;
                
                // 10秒タイムアウト
                const timeout = setTimeout(() => {
                    if (!isResolved) {
                        isResolved = true;
                        reject(new Error('Chrome拡張API応答タイムアウト（10秒）- スマホ環境ではUserScript推奨'));
                    }
                }, 10000);
                
                try {
                    chrome.runtime.sendMessage(
                        { action: 'fetchExpoData' },
                        (response) => {
                            if (isResolved) return; // タイムアウト後は無視
                            
                            clearTimeout(timeout);
                            isResolved = true;
                            
                            // Chrome拡張APIエラーをチェック
                            if (chrome.runtime.lastError) {
                                reject(new Error(`Chrome拡張APIエラー: ${chrome.runtime.lastError.message}`));
                                return;
                            }
                            
                            // 応答がundefinedの場合の処理
                            if (!response) {
                                reject(new Error('Chrome拡張APIから応答がありません（スマホ環境の可能性）'));
                                return;
                            }
                            
                            resolve(response);
                        }
                    );
                } catch (error) {
                    if (!isResolved) {
                        clearTimeout(timeout);
                        isResolved = true;
                        reject(new Error(`Chrome拡張API呼び出しエラー: ${error}`));
                    }
                }
            });
            
            if (!response.success || !response.data) {
                const error = new Error(response.error || 'Chrome拡張API呼び出し失敗');
                (error as any).context = {
                    environment: 'chrome-extension',
                    chromeRuntime: !!chrome?.runtime,
                    response: response
                };
                throw error;
            }
            data = response.data;
        } else {
            // サポートされていない環境
            throw new Error('この機能はChrome拡張機能またはUserScript環境でのみ利用可能です');
        }
        
        console.log('✅ 万博API 全体データ取得成功:', data.length, '件のパビリオン');
        
        // 全てのパビリオンを返す（フィルタリングなし）
        return data;
        
    } catch (error) {
        console.error('❌ 万博API 全体データ取得エラー:', error);
        throw error;
    }
};


// 当日予約ダイアログ作成関数
const createDayReservationDialog = (pavilionData: PavilionData[], showAll: boolean = false): void => {
    console.log('🏗️ 当日予約ダイアログを作成中...', pavilionData.length, '件のパビリオン');
    
    // 既存のダイアログがある場合は削除
    const existingDialog = document.getElementById('day-reservation-dialog');
    if (existingDialog) {
        existingDialog.remove();
    }
    
    // ダイアログ全体のコンテナ
    const dialogOverlay = document.createElement('div');
    dialogOverlay.id = 'day-reservation-dialog';
    dialogOverlay.className = 'ytomo-dialog overlay';
    
    // ダイアログコンテンツ
    const dialogContent = document.createElement('div');
    dialogContent.className = 'ytomo-dialog container day-reservation';
    
    // ヘッダー
    const header = document.createElement('div');
    header.className = 'ytomo-dialog header';
    
    // タイトル
    const title = document.createElement('h2');
    title.className = 'ytomo-dialog title';
    title.textContent = '当日予約';
    
    // 更新ボタン（右上）
    const refreshButton = document.createElement('button');
    refreshButton.className = 'ytomo-dialog refresh-button';
    refreshButton.textContent = '🔄';
    refreshButton.title = '更新';
    refreshButton.addEventListener('click', async () => {
        refreshButton.disabled = true;
        refreshButton.textContent = '⏳';
        
        // 選択状態をクリア
        selectedTimes.clear();
        
        // キャッシュもクリア
        import('./pavilion-reservation-cache').then(({ PavilionReservationCache }) => {
            PavilionReservationCache.clearAllReservationData();
        }).catch(error => {
            console.error('❌ キャッシュクリアエラー:', error);
        });
        
        try {
            // 常に全体データを取得してフィルターで制御
            const newData = await fetchAllExpoReservationData();
            dialogOverlay.remove();
            createDayReservationDialog(newData, showAll);
        } catch (error) {
            console.error('❌ データ更新エラー:', error);
            showMobileErrorDialog('更新エラー', error);
        } finally {
            refreshButton.disabled = false;
            refreshButton.textContent = '🔄';
        }
    });
    
    header.appendChild(title);
    header.appendChild(refreshButton);
    
    // 説明文・通知エリア（同じ位置に配置）
    const infoArea = document.createElement('div');
    infoArea.className = 'day-reservation-info-area';
    
    // デフォルトの説明文
    const description = document.createElement('p');
    description.className = 'day-reservation-description';
    description.innerHTML = ``;
    
    // 通知エリア（初期は非表示）
    const notificationArea = document.createElement('div');
    notificationArea.className = 'day-reservation-notification hidden';
    
    infoArea.appendChild(description);
    infoArea.appendChild(notificationArea);
    
    // パビリオンリスト
    const pavilionList = document.createElement('div');
    pavilionList.className = 'pavilion-list';
    
    // パビリオンデータが空の場合
    if (pavilionData.length === 0) {
        const noDataMessage = document.createElement('div');
        noDataMessage.className = 'pavilion-list-empty';
        noDataMessage.textContent = '現在予約可能なパビリオンはありません';
        pavilionList.appendChild(noDataMessage);
    } else {
        // パビリオンリストを作成（フィルター適用）
        const filteredData = showAll ? pavilionData : pavilionData.filter(pavilion => {
            // 空きのみモード: 空きありまたは残りわずかのパビリオンのみ表示
            return pavilion.s.some(slot => slot.s === 0 || slot.s === 1);
        });
        
        if (filteredData.length === 0) {
            const noDataMessage = document.createElement('div');
            noDataMessage.className = 'pavilion-list-empty';
            noDataMessage.textContent = showAll ? 'パビリオンデータがありません' : '現在予約可能なパビリオンはありません';
            pavilionList.appendChild(noDataMessage);
        } else {
            filteredData.forEach(pavilion => {
                const pavilionItem = createPavilionListItem(pavilion, showAll);
                pavilionList.appendChild(pavilionItem);
            });
        }
    }
    
    // ボタングループ
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'ytomo-dialog button-group';
    
    // 閉じるボタン
    const closeButton = document.createElement('button');
    closeButton.className = 'ytomo-dialog secondary-button';
    closeButton.textContent = '閉じる';
    closeButton.addEventListener('click', () => {
        dialogOverlay.remove();
    });
    
    // 右側ボタングループ
    const rightButtonGroup = document.createElement('div');
    rightButtonGroup.className = 'ytomo-dialog right-button-group';
    
    // 空きのみトグルボタン
    const availableOnlyToggle = document.createElement('button');
    availableOnlyToggle.className = `ytomo-dialog available-only-toggle ${!showAll ? 'active' : ''}`;
    availableOnlyToggle.textContent = '空きのみ';
    availableOnlyToggle.title = '空きのあるパビリオンのみ表示';
    
    // 空きのみトグルイベント（フィルター切り替えのみ、データ再取得なし）
    availableOnlyToggle.addEventListener('click', () => {
        const isCurrentlyActive = availableOnlyToggle.classList.contains('active');
        const newShowAll = isCurrentlyActive; // activeの場合は全表示に切り替え
        
        // 選択状態をクリア
        selectedTimes.clear();
        
        // キャッシュもクリア
        import('./pavilion-reservation-cache').then(({ PavilionReservationCache }) => {
            PavilionReservationCache.clearAllReservationData();
        }).catch(error => {
            console.error('❌ キャッシュクリアエラー:', error);
        });
        
        // 既存データでダイアログを再作成（フィルター適用）
        dialogOverlay.remove();
        createDayReservationDialog(pavilionData, newShowAll);
    });
    
    
    // 選択解除ボタン（監視開始の左）- 空きのみOFFの時のみ表示
    const clearSelectionButton = document.createElement('button');
    clearSelectionButton.className = 'ytomo-dialog clear-selection-button';
    clearSelectionButton.textContent = '選択解除';
    clearSelectionButton.title = '全ての監視対象を解除';
    clearSelectionButton.addEventListener('click', async () => {
        try {
            const { MonitoringCacheManager } = await import('./monitoring-cache');
            MonitoringCacheManager.clearTargets();
            
            // 全ての選択状態を解除
            const selectedButtons = document.querySelectorAll('.pavilion-time-slot.selected');
            selectedButtons.forEach(button => {
                button.classList.remove('selected');
            });
            
            // 監視対象数を更新
            updateMonitoringCount();
            
            console.log('🗑️ 全監視対象を解除しました');
        } catch (error) {
            console.error('❌ 選択解除エラー:', error);
        }
    });
    
    // 監視ボタン（右下）- 空きのみOFFの時のみ表示
    const monitorButton = document.createElement('button');
    monitorButton.className = 'ytomo-dialog monitor-button';
    monitorButton.innerHTML = '監視';
    monitorButton.title = 'パビリオン監視を開始';
    monitorButton.addEventListener('click', async () => {
        try {
            const { startPavilionMonitoring, getMonitoringStatus } = await import('./monitoring-service');
            const status = getMonitoringStatus();
            
            if (status.isRunning) {
                // 監視停止
                const { stopPavilionMonitoring } = await import('./monitoring-service');
                stopPavilionMonitoring();
                monitorButton.textContent = '監視開始';
                monitorButton.style.background = '';
                console.log('⏹️ パビリオン監視停止');
            } else {
                // 監視開始
                const success = await startPavilionMonitoring();
                if (success) {
                    monitorButton.textContent = '監視停止';
                    monitorButton.style.background = '#FF6B35';
                    console.log('🚀 パビリオン監視開始');
                } else {
                    alert('監視対象が選択されていません。満員の時間帯を選択してから監視を開始してください。');
                }
            }
        } catch (error) {
            console.error('❌ 監視ボタンエラー:', error);
            alert(`監視処理でエラーが発生しました: ${error}`);
        }
    });
    
    rightButtonGroup.appendChild(availableOnlyToggle);
    // 空きのみOFFの時のみ監視関連ボタンを表示
    if (showAll) {
        rightButtonGroup.appendChild(clearSelectionButton);
        rightButtonGroup.appendChild(monitorButton);
    }
    
    buttonGroup.appendChild(closeButton);
    buttonGroup.appendChild(rightButtonGroup);
    
    // DOM構築
    dialogContent.appendChild(header);
    dialogContent.appendChild(infoArea);
    dialogContent.appendChild(pavilionList);
    dialogContent.appendChild(buttonGroup);
    dialogOverlay.appendChild(dialogContent);
    
    // ダイアログを表示
    document.body.appendChild(dialogOverlay);
    
    // 背景クリックで閉じる
    dialogOverlay.addEventListener('click', (e) => {
        if (e.target === dialogOverlay) {
            dialogOverlay.remove();
        }
    });
    
    // 通知表示機能をグローバルに公開
    (window as any).showReservationNotification = (type: 'success' | 'error' | 'warning' | 'info', message: string, autoHide: boolean = true) => {
        showReservationNotification(notificationArea, description, type, message, autoHide);
    };
    
    console.log('✅ 当日予約ダイアログ表示完了');
};

// 予約結果通知を表示する関数
const showReservationNotification = (
    notificationArea: HTMLElement, 
    description: HTMLElement, 
    type: 'success' | 'error' | 'warning' | 'info',
    message: string,
    autoHide: boolean = true
): void => {
    
    // 通知内容を構築
    const notificationContent = document.createElement('div');
    notificationContent.className = `notification-content ${type}`;
    
    const icon = getNotificationIcon(type);
    const messageElement = document.createElement('span');
    messageElement.className = 'notification-message';
    messageElement.textContent = message;
    
    const closeButton = document.createElement('button');
    closeButton.className = 'notification-close';
    closeButton.innerHTML = '×';
    closeButton.title = '閉じる';
    
    notificationContent.appendChild(document.createTextNode(icon + ' '));
    notificationContent.appendChild(messageElement);
    notificationContent.appendChild(closeButton);
    
    // 通知エリアをクリアして新しい通知を追加
    notificationArea.innerHTML = '';
    notificationArea.appendChild(notificationContent);
    
    // 説明文を非表示にして通知を表示
    description.classList.add('hidden');
    notificationArea.classList.remove('hidden');
    
    // 閉じるボタンの処理
    const hideNotification = () => {
        notificationArea.classList.add('hidden');
        description.classList.remove('hidden');
    };
    
    closeButton.addEventListener('click', hideNotification);
    
    // 自動非表示
    if (autoHide) {
        setTimeout(() => {
            if (!notificationArea.classList.contains('hidden')) {
                hideNotification();
            }
        }, 8000); // 8秒後に自動非表示
    }
};

// 通知タイプに応じたアイコンを取得
const getNotificationIcon = (type: 'success' | 'error' | 'warning' | 'info'): string => {
    switch (type) {
        case 'success': return '✅';
        case 'error': return '❌';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return 'ℹ️';
    }
};

// テスト用のグローバル関数を公開
if (typeof window !== 'undefined') {
    (window as any).testReservationNotification = () => {
        console.log('🧪 通知テスト実行');
        if (typeof (window as any).showReservationNotification === 'function') {
            (window as any).showReservationNotification('success', '予約完了: テストパビリオン 15:00～');
            setTimeout(() => {
                (window as any).showReservationNotification('error', '予約失敗: ネットワークエラー');
            }, 2000);
            setTimeout(() => {
                (window as any).showReservationNotification('warning', 'リダイレクト異常により元のページに復旧しました');
            }, 4000);
            setTimeout(() => {
                (window as any).showReservationNotification('info', '監視成功: 日本館 1300 の空きを検知し予約開始');
            }, 6000);
        } else {
            console.error('❌ 通知関数が利用できません');
        }
    };
};

// パビリオンリストアイテム作成関数
const createPavilionListItem = (pavilion: PavilionData, showAll: boolean = false): HTMLDivElement => {
    const item = document.createElement('div');
    item.className = 'pavilion-item';
    
    // パビリオン情報エリア
    const infoArea = document.createElement('div');
    infoArea.className = 'pavilion-info';
    
    // パビリオン名行（名前 + 選択ボタン）
    const nameRow = document.createElement('div');
    nameRow.className = 'pavilion-name-row';
    
    // 選択ボタン（空きのみOFFの時のみ表示）
    const selectAllButton = document.createElement('button');
    selectAllButton.className = 'pavilion-select-all-btn';
    selectAllButton.textContent = '選択';
    selectAllButton.title = 'このパビリオンの満員時間をすべて監視対象に追加';
    
    // 選択ボタンのクリックイベント
    selectAllButton.addEventListener('click', () => {
        selectAllUnavailableSlots(pavilion, showAll);
    });
    
    // パビリオン名
    const name = document.createElement('div');
    name.className = 'pavilion-name';
    name.textContent = pavilion.n;
    
    // 空きのみOFFの時のみ選択ボタンを表示
    if (showAll) {
        nameRow.appendChild(selectAllButton);
    }
    nameRow.appendChild(name);
    
    // 時間枠情報
    const timeSlots = document.createElement('div');
    timeSlots.className = 'pavilion-time-slots';
    
    // 時間枠を個別のbutton要素で表示
    const allSlots = pavilion.s || [];
    if (allSlots.length > 0) {
        allSlots.forEach(slot => {
            const timeElement = createTimeSlotElement(slot, pavilion, showAll);
            if (timeElement) {
                timeSlots.appendChild(timeElement);
            }
        });
    } else {
        timeSlots.textContent = '時間枠情報なし';
    }
    
    infoArea.appendChild(nameRow);
    infoArea.appendChild(timeSlots);
    
    item.appendChild(infoArea);
    
    return item;
};

// ステータスアイコン取得関数
const getStatusIcon = (status: number): string => {
    return status === 0 ? '🟢' : status === 1 ? '🟡' : '🔴';
};

// 選択状態管理（複数時間選択対応）
const selectedTimes = new Map<string, Set<string>>(); // Map<pavilionCode, Set<timeSlot>>

// デバッグ用: 選択状況を確認
const getSelectedTimes = (): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    selectedTimes.forEach((timeSlots, pavilionCode) => {
        result[pavilionCode] = Array.from(timeSlots);
    });
    return result;
};

// デバッグ用: 選択状況をフォーマットして表示
const logSelectedTimes = (): void => {
    const selections = getSelectedTimes();
    if (Object.keys(selections).length === 0) {
        console.log('📋 時間選択状況: 選択なし');
        return;
    }
    
    console.log('📋 時間選択状況:');
    Object.entries(selections).forEach(([pavilionCode, timeSlots]) => {
        const times = timeSlots.map(slot => `${slot.slice(0, 2)}:${slot.slice(2)}`).join(', ');
        console.log(`  ${pavilionCode}: ${times} (${timeSlots.length}件)`);
    });
};

// キャッシュデバッグ機能
const debugCache = (): void => {
    import('./pavilion-reservation-cache').then(({ PavilionReservationCache }) => {
        PavilionReservationCache.debugLogAllCache();
    }).catch(error => {
        console.error('❌ キャッシュデバッグエラー:', error);
    });
};

// キャッシュクリア機能
const clearCache = (): void => {
    import('./pavilion-reservation-cache').then(({ PavilionReservationCache }) => {
        PavilionReservationCache.clearAllReservationData();
        console.log('🧹 パビリオン予約キャッシュをクリアしました');
    }).catch(error => {
        console.error('❌ キャッシュクリアエラー:', error);
    });
};

// グローバルに公開（デバッグ用）
(window as any).getSelectedTimes = getSelectedTimes;
(window as any).logSelectedTimes = logSelectedTimes;
(window as any).debugCache = debugCache;
(window as any).clearCache = clearCache;

// 時間枠クリック処理（空き/満員に応じた分岐処理）
const handleTimeSlotClick = (pavilionCode: string, timeSlot: string, buttonElement: HTMLElement): void => {
    const pavilionName = buttonElement.dataset['pavilionName'] || pavilionCode;
    const isAvailable = buttonElement.dataset['available'] === 'true';
    
    if (isAvailable) {
        // 空き時間帯: 即時予約実行
        handleImmediateReservation(pavilionCode, pavilionName, timeSlot, buttonElement);
    } else {
        // 満員時間帯: 監視対象選択/解除
        handleMonitoringSelection(pavilionCode, pavilionName, timeSlot, buttonElement);
    }
};

// 即時予約処理
const handleImmediateReservation = async (pavilionCode: string, pavilionName: string, timeSlot: string, buttonElement: HTMLElement): Promise<void> => {
    const timeDisplay = `${timeSlot.slice(0, 2)}:${timeSlot.slice(2)}`;
    
    console.log('🚀 即時予約実行:', pavilionName, timeDisplay);
    
    try {
        // 即時予約機能を使用
        const { executeImmediateReservation } = await import('./immediate-reservation');
        const success = await executeImmediateReservation(pavilionCode, pavilionName, timeSlot, timeDisplay);
        
        if (success) {
            // 成功時の視覚的フィードバック
            buttonElement.style.background = '#4CAF50';
            buttonElement.style.color = 'white';
            setTimeout(() => {
                buttonElement.style.background = '';
                buttonElement.style.color = '';
            }, 2000);
        }
    } catch (error) {
        console.error('❌ 即時予約エラー:', error);
        alert(`予約処理でエラーが発生しました: ${error}`);
    }
};

// 監視対象選択処理
const handleMonitoringSelection = async (pavilionCode: string, pavilionName: string, timeSlot: string, buttonElement: HTMLElement): Promise<void> => {
    try {
        const { MonitoringCacheManager } = await import('./monitoring-cache');
        
        const isCurrentlySelected = buttonElement.classList.contains('selected');
        const success = MonitoringCacheManager.toggleTarget(pavilionCode, timeSlot, pavilionName);
        
        if (success) {
            if (isCurrentlySelected) {
                // 選択解除
                buttonElement.classList.remove('selected');
                console.log(`🗑️ 監視対象解除: ${pavilionName} - ${timeSlot}`);
                console.log(`🔍 選択解除後のクラス: ${buttonElement.className}`);
            } else {
                // 選択追加
                buttonElement.classList.add('selected');
                console.log(`✅ 監視対象追加: ${pavilionName} - ${timeSlot}`);
                console.log(`🔍 選択後のクラス: ${buttonElement.className}`);
                console.log(`🔍 選択後のスタイル: background=${getComputedStyle(buttonElement).backgroundColor}, border=${getComputedStyle(buttonElement).borderColor}`);
            }
            
            // 監視対象数を更新
            updateMonitoringCount();
        }
    } catch (error) {
        console.error('❌ 監視対象選択エラー:', error);
    }
};

// 監視対象数更新
const updateMonitoringCount = async (): Promise<void> => {
    try {
        const { MonitoringCacheManager } = await import('./monitoring-cache');
        const targets = MonitoringCacheManager.getTargets();
        
        // 監視ボタンのテキストを更新
        const monitorButton = document.querySelector('.ytomo-dialog.monitor-button') as HTMLButtonElement;
        if (monitorButton) {
            monitorButton.textContent = targets.length > 0 ? `監視開始 (${targets.length})` : '監視開始';
        }
    } catch (error) {
        console.error('❌ 監視対象数更新エラー:', error);
    }
};

// パビリオンの満員時間をすべて選択
const selectAllUnavailableSlots = async (pavilion: PavilionData, showAll: boolean): Promise<void> => {
    try {
        const { MonitoringCacheManager } = await import('./monitoring-cache');
        
        const allSlots = pavilion.s || [];
        let addedCount = 0;
        
        for (const slot of allSlots) {
            const isAvailable = slot.s === 0 || slot.s === 1;
            
            // 満員時間のみ対象、または空きのみOFFの場合は全表示されている時間を対象
            if (!isAvailable || (showAll && !isAvailable)) {
                const success = MonitoringCacheManager.addTarget(pavilion.c, slot.t, pavilion.n);
                if (success) {
                    addedCount++;
                    
                    // UI上のボタンも選択状態にする
                    const buttons = document.querySelectorAll('.pavilion-time-slot');
                    for (const btn of buttons) {
                        const btnElement = btn as HTMLElement;
                        if (btnElement.dataset['pavilionCode'] === pavilion.c && 
                            btnElement.dataset['timeSlot'] === slot.t) {
                            btnElement.classList.add('selected');
                            break;
                        }
                    }
                }
            }
        }
        
        if (addedCount > 0) {
            console.log(`✅ ${pavilion.n} の満員時間 ${addedCount}件を監視対象に追加`);
            updateMonitoringCount();
        } else {
            console.log(`⚠️ ${pavilion.n} に追加可能な満員時間がありません`);
        }
        
    } catch (error) {
        console.error('❌ 一括選択エラー:', error);
    }
};

// 時間枠要素作成関数
const createTimeSlotElement = (slot: any, pavilion: PavilionData, showAll: boolean): HTMLElement | null => {
    const time = `${slot.t.slice(0, 2)}:${slot.t.slice(2)}`;
    const isAvailable = slot.s === 0 || slot.s === 1;
    
    // 空きのみON かつ 予約不可 → 表示しない
    if (!showAll && !isAvailable) {
        return null;
    }
    
    // 表示される時間枠はすべて選択可能（button要素）
    const button = document.createElement('button');
    button.className = `pavilion-time-slot clickable ${!isAvailable ? 'unavailable' : ''}`;
    button.innerHTML = `${getStatusIcon(slot.s)}${time}`;
    button.dataset['timeSlot'] = slot.t;
    button.dataset['pavilionCode'] = pavilion.c;
    button.dataset['pavilionName'] = pavilion.n;
    button.dataset['available'] = isAvailable.toString();
    
    // クリックイベント追加
    button.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTimeSlotClick(pavilion.c, slot.t, button);
    });
    
    return button;
};

// 予約画面への遷移関数（Phase 3で使用予定）
const navigateToReservation = (pavilion: PavilionData): void => {
    console.log('🎯 予約画面への遷移:', pavilion.n);
    
    // ダイアログを閉じる
    const dialog = document.getElementById('day-reservation-dialog');
    if (dialog) {
        dialog.remove();
    }
    
    // パビリオンコードを使って予約画面に遷移
    // 実際の予約画面のURLパターンを使用
};

// TypeScript unused警告回避のため一時的に使用
void navigateToReservation;

// ページ初期化可能か判定
const judge_init = (): boolean => {
    const cand_btn = document.querySelector("button.style_search_btn__ZuOpx");
    return cand_btn !== null;
}


// 入場予約関連のヘルパー関数
function getRandomWaitTime(minTime: number, randomRange: number, config: ReservationConfig): number {
    const { randomSettings } = config;
    const actualMinTime = minTime !== undefined ? minTime : randomSettings.minCheckInterval;
    const actualRandomRange = randomRange !== undefined ? randomRange : randomSettings.checkRandomRange;
    return actualMinTime + Math.floor(Math.random() * actualRandomRange);
}

async function waitForElement(selector: string, timeout: number = 5000, config: ReservationConfig): Promise<Element> {
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

async function waitForAnyElement(selectors: Record<string, string>, timeout: number = 10000, selectorTexts: Record<string, string> = {}, config: ReservationConfig): Promise<ElementSearchResult> {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkElements = () => {
            for (const [key, selector] of Object.entries(selectors)) {
                const elements = document.querySelectorAll(selector);
                
                for (let i = 0; i < elements.length; i++) {
                    const element = elements[i];
                    if (selectorTexts[key]) {
                        if (element.textContent && element.textContent.includes(selectorTexts[key])) {
                            resolve({ key, element: element as HTMLElement });
                            return;
                        }
                    } else {
                        if (element) {
                            resolve({ key, element: element as HTMLElement });
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

async function clickElement(element: Element, config: ReservationConfig): Promise<void> {
    (element as HTMLElement).click();
    const delay = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
    await new Promise(resolve => setTimeout(resolve, delay));
}

// エクスポート
export {
    prepare_filter, 
    init_page,
    judge_init,
    getRandomWaitTime,
    waitForElement,
    waitForAnyElement,
    clickElement
};

