// 【1. 基本機能・ユーティリティ】
// ============================================================================

// スタイルのインポート
import '../styles/main.scss';

// 型定義のインポート
import type { 
    ReservationConfig, 
    ElementSearchResult
} from '../types/index.js';

import { loggers } from '../utils/logger';
const logger = loggers.pavilions;

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
    
    // すべて読み込みボタンの自動クリック処理
    const load_more_auto = async () => {
        const scrollX = window.scrollX;
        const scrollY = window.scrollY;
        const arr_btn = document.querySelectorAll("button.style_more_btn__ymb22:not([disabled])");
        
        logger.info('load_more_auto実行', { buttonCount: arr_btn.length });
        
        if (arr_btn.length > 0) {
            // 件数変化をログ出力
            const beforeCounts = getItemCounts();
            logger.debug('クリック前の件数', { visible: beforeCounts.visible, total: beforeCounts.total });
            
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
                logger.debug('クリック後の件数', { visible: afterCounts.visible, total: afterCounts.total });
                
                // 次の読み込みを即座に実行
                clearInterval(updateInterval);
                load_more_auto();
            }, 500)
        } else {
            logger.info('load_more_auto完了: もっと見るボタンがありません');
            // 完了時にも件数表示を更新
            if ((window as any).updatePavilionCounts) {
                (window as any).updatePavilionCounts();
                logger.debug('完了時の件数表示を更新');
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
        
        logger.debug('もっと見るボタンチェック', { total: allMoreButtons.length, enabled: enabledMoreButtons.length });
        allMoreButtons.forEach((btn, index) => {
            logger.debug('ボタン詳細', { index: index + 1, disabled: btn.hasAttribute('disabled'), text: btn.textContent?.trim() });
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
            logger.debug('すべて読み込みボタン状態更新', { hasMore, isLoading });
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
                logger.debug('件数表示更新', { newText });
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
                    logger.debug('もっと見るボタンのdisabled属性変化を検知');
                }
                
                // 新しい「もっと見る」ボタンの追加/削除を検知
                if (mutation.type === 'childList') {
                    let shouldUpdateCounts = false;
                    
                    mutation.addedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            const moreButtons = node.querySelectorAll('button.style_more_btn__ymb22');
                            if (moreButtons.length > 0) {
                                shouldUpdate = true;
                                logger.debug('新しいもっと見るボタンの追加を検知');
                            }
                            
                            // 検索アイテムの追加を検知
                            const searchItems = node.querySelectorAll('div.style_search_item_row__moqWC');
                            if (searchItems.length > 0) {
                                shouldUpdateCounts = true;
                                logger.debug('新しい検索アイテムの追加を検知');
                            }
                        }
                    });
                    
                    mutation.removedNodes.forEach((node) => {
                        if (node instanceof Element) {
                            const moreButtons = node.querySelectorAll('button.style_more_btn__ymb22');
                            if (moreButtons.length > 0) {
                                shouldUpdate = true;
                                logger.debug('もっと見るボタンの削除を検知');
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
                logger.debug('状態チェック', { index: index + 1, delayMs: delay });
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
            logger.info('DOMContentLoaded後の状態チェック');
            setTimeout(() => {
                updateLoadAllButtonState();
                // 失敗した予約の通知をチェック（ページ読み込み時）
                checkAndShowFailedReservationNotification();
            }, 100);
        });
    } else {
        // DOMが既に読み込まれている場合は即座に実行
        setTimeout(() => {
            updateLoadAllButtonState();
            // 失敗した予約の通知をチェック（ページ読み込み時）
            checkAndShowFailedReservationNotification();
        }, 100);
    }

    // 独自ボタンのクリックイベントハンドラ
    document.addEventListener("click", (event) => {
        if ((event.target as Element)?.matches?.("button.ext-ytomo, button.ext-ytomo *, button.pavilion-sub-btn, button.pavilion-sub-btn *")) {
            const target = (event.target as Element)?.closest?.("button.ext-ytomo, button.pavilion-sub-btn");
            if (target && target.classList.contains("btn-load-all")) {
                // すべて読み込み
                const button = target as HTMLButtonElement;
                logger.info('すべて読み込み開始');
                logger.debug('クリック対象ボタン', button);
                logger.debug('実行前の状態', { disabled: button.disabled, classes: button.className });
                
                // 既に実行中の場合は何もしない
                if (button.classList.contains("btn-loading")) {
                    logger.warn('すでに実行中のため無視');
                    return;
                }
                
                // 実行中は強制的にdisabled & 専用クラス設定
                button.disabled = true;
                button.classList.remove("btn-enabled");
                button.classList.add("btn-disabled", "btn-loading");
                logger.debug('実行開始時の状態設定完了', { disabled: button.disabled, classes: button.className });
                logger.debug('実際のHTML disabled属性', { hasDisabledAttr: button.hasAttribute('disabled') });
                logger.debug('computedStyle background', { backgroundColor: window.getComputedStyle(button).backgroundColor });
                
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
                    logger.info('すべて読み込み完了');
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
                // 当日予約ダイアログは削除済み - メインダイアログを使用
                logger.info('メインダイアログに統一済み');
            }
        }
    })
}


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

// 当日予約ダイアログは削除済み - メインダイアログに統一



// 当日予約ダイアログ作成関数は削除済み - メインダイアログに統一

// 予約結果通知を表示する関数（他モジュールから使用されているため残す）
// @ts-ignore
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
        logger.debug('通知テスト実行');
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
            logger.error('通知関数が利用できません');
        }
    };
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
        logger.debug('時間選択状況: 選択なし');
        return;
    }
    
    logger.debug('時間選択状況', {
        selections: Object.entries(selections).reduce((acc, [pavilionCode, timeSlots]) => {
            const times = timeSlots.map(slot => `${slot.slice(0, 2)}:${slot.slice(2)}`).join(', ');
            acc[pavilionCode] = { times, count: timeSlots.length };
            return acc;
        }, {} as Record<string, { times: string; count: number }>)
    });
};

// キャッシュデバッグ機能
const debugCache = (): void => {
    import('./pavilion-reservation-cache').then(({ PavilionReservationCache }) => {
        PavilionReservationCache.debugLogAllCache();
    }).catch(error => {
        logger.error('キャッシュデバッグエラー', error);
    });
};

// キャッシュクリア機能
const clearCache = (): void => {
    import('./pavilion-reservation-cache').then(({ PavilionReservationCache }) => {
        PavilionReservationCache.clearAllReservationData();
        logger.info('パビリオン予約キャッシュをクリアしました');
    }).catch(error => {
        logger.error('キャッシュクリアエラー', error);
    });
};

// グローバルに公開（デバッグ用）
(window as any).getSelectedTimes = getSelectedTimes;
(window as any).logSelectedTimes = logSelectedTimes;
(window as any).debugCache = debugCache;
(window as any).clearCache = clearCache;




// 予約画面への遷移関数（Phase 3で使用予定）
const navigateToReservation = (pavilion: PavilionData): void => {
    logger.info('予約画面への遷移', { pavilionName: pavilion.n });
    
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

// 失敗した予約の通知をチェックして表示
const checkAndShowFailedReservationNotification = async (): Promise<void> => {
    try {
        // sessionStorageから失敗情報をチェック（異常リダイレクト用）
        const failureInfoStr = sessionStorage.getItem('expo_reservation_failure');
        if (failureInfoStr) {
            const failureInfo = JSON.parse(failureInfoStr);
            
            // グローバル通知システムで表示
            if (typeof (window as any).showReservationNotification === 'function') {
                (window as any).showReservationNotification(
                    'error',
                    `予約に失敗しました: ${failureInfo.pavilionName} ${failureInfo.timeDisplay}～（${failureInfo.reason}）`,
                    false // 自動非表示しない
                );
                logger.warn('異常リダイレクトによる失敗通知を表示しました');
            }
            
            // 表示完了後、sessionStorageをクリア
            sessionStorage.removeItem('expo_reservation_failure');
            return;
        }
        
        // 従来の失敗予約チェック（その他のエラー用）
        const { PavilionReservationCache } = await import('./pavilion-reservation-cache');
        const allData = PavilionReservationCache.getAllReservationData();
        
        // 失敗状態の予約を検索
        const failedReservations = Object.values(allData).filter(data => data.status === 'failed');
        
        if (failedReservations.length > 0) {
            // 最新の失敗予約を表示
            const latestFailed = failedReservations.sort((a, b) => b.timestamp - a.timestamp)[0];
            
            // グローバル通知システムで表示
            if (typeof (window as any).showReservationNotification === 'function') {
                (window as any).showReservationNotification(
                    'error',
                    `予約に失敗しました: ${latestFailed.pavilionName} ${latestFailed.selectedTimeDisplay}～`,
                    false // 自動非表示しない
                );
                logger.warn('失敗した予約の通知を表示しました');
            }
            
            // 通知を表示した予約データを削除（重複表示を防ぐ）
            PavilionReservationCache.removeReservationData(latestFailed.pavilionCode, latestFailed.selectedTimeSlot);
        }
    } catch (error) {
        logger.error('失敗予約通知チェックエラー', error);
    }
};

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

