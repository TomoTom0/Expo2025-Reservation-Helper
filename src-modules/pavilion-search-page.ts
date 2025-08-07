// 【1. 基本機能・ユーティリティ】
// ============================================================================

// スタイルのインポート
import '../src-styles/main.scss';

// 型定義のインポート
import type { 
    ReservationConfig, 
    ElementSearchResult, 
    Dependencies 
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
            const newText = `${baseText}(${counts.available})`;
            button.textContent = newText;
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
        
        console.log(`🔧 すべて読み込みボタン状態更新: もっと見るボタン=${hasMore ? 'あり' : 'なし'}, 実行中=${isLoading}`);
        
        loadAllButtons.forEach((btn, index) => {
            const button = btn as HTMLButtonElement;
            console.log(`  ボタン${index + 1}: 更新前 disabled=${button.disabled}, classes=${button.className}`);
            
            // 実行中の場合は強制的にdisabled状態にする
            if (isLoading) {
                button.disabled = true;
                button.classList.remove("btn-enabled");
                button.classList.add("btn-disabled");
                console.log(`  → 実行中のため無効化: disabled=${button.disabled}, classes=${button.className}`);
                return;
            }
            
            if (hasMore) {
                button.disabled = false;
                button.classList.remove("btn-done", "btn-disabled", "btn-loading");
                button.classList.add("btn-enabled");
                console.log(`  → 有効化: disabled=${button.disabled}, classes=${button.className}`);
            } else {
                button.disabled = true;
                button.classList.remove("btn-enabled", "btn-loading");
                button.classList.add("btn-done", "btn-disabled");
                console.log(`  → 無効化: disabled=${button.disabled}, classes=${button.className}`);
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
        fabContainer.classList.add('ytomo-pavilion-fab-container');

        // メインFABボタンを作成（入場予約FABと同じスタイル）
        const fabButton = document.createElement('button');
        fabButton.id = 'ytomo-pavilion-fab-button';
        fabButton.classList.add('ext-ytomo', 'ytomo-fab', 'ytomo-fab-enabled');

        // FABボタンの内容構造（縦配置）
        const fabContent = document.createElement('div');
        fabContent.classList.add('ytomo-fab-inner-content');

        // 展開/縮小アイコン（上部）
        const expandIcon = document.createElement('div');
        expandIcon.style.cssText = `
            font-size: 8px !important;
            line-height: 1 !important;
            margin-bottom: 1px !important;
            opacity: 0.8 !important;
        `;
        expandIcon.innerHTML = '▲'; // 初期は縮小状態（展開可能）

        // YTomoテキスト（中央）- 小さく控えめに
        const brandText = document.createElement('div');
        brandText.style.cssText = `
            font-size: 7px !important;
            font-weight: normal !important;
            line-height: 1 !important;
            margin-bottom: 2px !important;
            opacity: 0.7 !important;
        `;
        brandText.innerText = 'YTomo';

        // 件数表示（下部）- 大きく目立つように
        const countsText = document.createElement('div');
        countsText.style.cssText = `
            font-size: 12px !important;
            font-weight: bold !important;
            line-height: 1 !important;
        `;
        countsText.innerText = '0/0'; // 初期値、後で更新

        // DOM構築
        fabContent.appendChild(expandIcon);
        fabContent.appendChild(brandText);
        fabContent.appendChild(countsText);
        fabButton.appendChild(fabContent);
        
        // FABボタンにrelative positionを設定
        fabButton.style.position = 'relative';

        // ホバー効果（入場予約FABと同じ）
        fabButton.addEventListener('mouseenter', () => {
            fabButton.style.transform = 'scale(1.15)';
            fabButton.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.5), 0 4px 12px rgba(0, 0, 0, 0.3)';
            fabButton.style.borderWidth = '4px';
        });
        
        fabButton.addEventListener('mouseleave', () => {
            fabButton.style.transform = 'scale(1.0)';
            fabButton.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.4), 0 2px 8px rgba(0, 0, 0, 0.2)';
            fabButton.style.borderWidth = '3px';
        });

        // 件数表示を更新する関数（FABボタン内に表示）
        const updateCountsDisplay = () => {
            const counts = getItemCounts();
            countsText.innerText = `${counts.visible}/${counts.total}`;
            console.log(`📊 件数表示更新: ${counts.visible}/${counts.total}`);
            
            // 「空きのみ」ボタンのテキストも更新
            updateFilterSafeButtonText();
        };

        // サブアクションボタンコンテナ
        const subActionsContainer = document.createElement('div');
        subActionsContainer.id = 'pavilion-sub-actions';
        subActionsContainer.style.cssText = `
            display: none !important;
            flex-direction: column !important;
            gap: 8px !important;
            align-items: flex-end !important;
            margin-bottom: 8px !important;
        `;

        // サブアクションボタンの作成
        const createSubButton = (text: string, className: string) => {
            const btn = document.createElement('button');
            btn.classList.add('ext-ytomo', 'pavilion-sub-btn', className, 'btn-enabled');
            btn.textContent = text;
            btn.style.cssText = `
                color: white !important;
                border: none !important;
                border-radius: 20px !important;
                padding: 8px 16px !important;
                font-size: 12px !important;
                white-space: nowrap !important;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
                transition: all 0.2s ease !important;
            `;
            
            return btn;
        };

        const btnLoadAll = createSubButton('すべて読み込み', 'btn-load-all');
        const btnFilterSafe = createSubButton('空きのみ', 'btn-filter-safe');
        const btnAlertToCopy = createSubButton('一覧コピー', 'btn-alert-to-copy');

        // DOM構築
        subActionsContainer.appendChild(btnLoadAll);
        subActionsContainer.appendChild(btnFilterSafe);
        subActionsContainer.appendChild(btnAlertToCopy);
        
        fabContainer.appendChild(subActionsContainer);
        fabContainer.appendChild(fabButton);

        // FABの開閉制御（デフォルトで展開）
        let isExpanded = true; // デフォルトで展開状態
        
        // 初期状態を展開に設定
        subActionsContainer.style.display = 'flex';
        expandIcon.innerHTML = '▼'; // 展開状態（縮小可能）
        
        fabButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            isExpanded = !isExpanded;
            
            if (isExpanded) {
                subActionsContainer.style.display = 'flex';
                expandIcon.innerHTML = '▼'; // 展開状態（縮小可能）
            } else {
                subActionsContainer.style.display = 'none';
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
        btn_filter_without_load.style.cssText = `
            height: auto;
            min-height: 40px;
            width: auto;
            min-width: 60px;
            padding: 0px 8px;
            color: white;
            margin: 5px;
            background: rgb(0, 104, 33) !important;
        `;
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
    (window as any).updateLoadAllButtonState = updateLoadAllButtonState;
    
    // ページ読み込み完了後に状態をチェック（複数回、より頻繁に）
    const checkIntervals = [500, 1000, 2000, 3000, 5000];
    checkIntervals.forEach((delay, index) => {
        setTimeout(() => {
            console.log(`🕐 状態チェック${index + 1} (${delay}ms後)`);
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
                
                // 強制的にCSS再適用
                button.style.background = 'rgb(128, 128, 128)';
                button.style.cursor = 'not-allowed';
                console.log(`🔧 強制スタイル適用後:`, button.style.cssText);
                
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
                target.classList.toggle("btn-done");
                document.querySelectorAll("div.style_search_item_row__moqWC:has(img[src*=\"/asset/img/calendar_none.svg\"])"
                ).forEach((div) => {
                    div.classList.toggle("safe-none");
                })

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
                    alert(text);
                    // console.error("ytomo extension error", e);
                    // alert(e);
                }
                setTimeout(() => {
                    (target as HTMLButtonElement).disabled = false;
                }, 500)
            }

        }
    })
}

// ページ初期化可能か判定
const judge_init = (): boolean => {
    const cand_btn = document.querySelector("button.style_search_btn__ZuOpx");
    return cand_btn !== null;
}

// 入場予約ページ初期化可能か判定
const judge_entrance_init = (): boolean => {
    const target_div = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
    return target_div !== null;
}

// 入場予約ページ初期化処理
const init_entrance_page = (dependencies: Dependencies = {}): void => {
    const {
        setPageLoadingStateFn,
        createEntranceReservationUIFn,
        initTimeSlotMonitoringFn,
        restoreFromCacheFn
    } = dependencies;
    
    // ヘッダーにFAB切替ボタンを追加（DOM構築完了を待つ）
    setTimeout(() => {
        import('./entrance-page-state').then((entrancePageState) => {
            entrancePageState.createFABToggleButton();
        });
    }, 1000);
    
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

    // 初期化開始時に即座に読み込み状態を設定
    if (setPageLoadingStateFn) setPageLoadingStateFn(true);
    
    // UIを即座に作成（読み込み状態表示のため）
    if (createEntranceReservationUIFn) createEntranceReservationUIFn(entranceReservationConfig);
    
    // 時間帯監視機能の初期化（動的待機）
    (async () => {
        if (initTimeSlotMonitoringFn) await initTimeSlotMonitoringFn();
        
        // キャッシュからの状態復元（カレンダー読み込み完了後に実行）
        if (restoreFromCacheFn) await restoreFromCacheFn();
        
        // 初期化完了時に読み込み状態を解除
        if (setPageLoadingStateFn) setPageLoadingStateFn(false);
    })();
    
    console.log("入場予約機能の初期化完了");
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
    judge_entrance_init,
    init_entrance_page,
    getRandomWaitTime,
    waitForElement,
    waitForAnyElement,
    clickElement
};

