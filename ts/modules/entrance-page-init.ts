// ============================================================================
// 【入場予約画面初期化】
// ============================================================================

// 型定義のインポート
import type { Dependencies } from '../types/index.js';

// 入場予約ページ初期化可能か判定
export const judge_entrance_init = (): boolean => {
    const target_div = document.querySelector('#__next > div > div > main > div > div.style_main__prev_button__gJ5ZR');
    return target_div !== null;
}

// 入場予約ページ初期化処理
export const init_entrance_page = (dependencies: Dependencies = {}): void => {
    const {
        setPageLoadingStateFn,
        createEntranceReservationUIFn,
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
    
    // 時間帯テーブル初期化（動的待機）
    (async () => {
        
        // キャッシュからの状態復元（カレンダー読み込み完了後に実行）
        if (restoreFromCacheFn) await restoreFromCacheFn();
        
        // キャッシュ復元後にカレンダー変更を開始
        const { startCalendarWatcher } = await import('./entrance-page-fab');
        startCalendarWatcher();
        
        // 初期化完了時に読み込み状態を解除
        if (setPageLoadingStateFn) setPageLoadingStateFn(false);
    })();
    
    console.log("入場予約機能の初期化完了");
}