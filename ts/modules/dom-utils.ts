/**
 * DOM操作ユーティリティモジュール
 * 万博予約ページでの自動操作に必要なDOM操作を提供
 */

// DOM操作の結果
export interface DOMOperationResult {
    success: boolean;
    element?: HTMLElement;
    error?: string;
}

// 時間選択の結果
export interface TimeSelectionResult {
    success: boolean;
    selectedTime?: string;
    availableOptions?: string[];
    error?: string;
}

export class DOMUtils {
    /**
     * 要素が表示されるまで待機
     */
    async waitForElement(
        selector: string, 
        timeout: number = 10000,
        checkVisibility: boolean = true
    ): Promise<DOMOperationResult> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const element = document.querySelector(selector) as HTMLElement;
            
            if (element) {
                // 可視性チェック
                if (!checkVisibility || this.isElementVisible(element)) {
                    return {
                        success: true,
                        element
                    };
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return {
            success: false,
            error: `要素が見つかりません: ${selector} (${timeout}ms)`
        };
    }

    /**
     * 複数要素が表示されるまで待機
     */
    async waitForElements(
        selectors: string[], 
        timeout: number = 10000
    ): Promise<DOMOperationResult> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const results = selectors.map(selector => {
                const element = document.querySelector(selector);
                return element && this.isElementVisible(element as HTMLElement);
            });
            
            if (results.every(result => result)) {
                return { success: true };
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return {
            success: false,
            error: `一部の要素が見つかりません: ${selectors.join(', ')}`
        };
    }

    /**
     * 要素の可視性をチェック
     */
    private isElementVisible(element: HTMLElement): boolean {
        const style = window.getComputedStyle(element);
        return style.display !== 'none' && 
               style.visibility !== 'hidden' && 
               style.opacity !== '0' &&
               element.offsetWidth > 0 && 
               element.offsetHeight > 0;
    }

    /**
     * 指定時間の時間枠を選択
     */
    async selectTimeSlot(timeSlot: string): Promise<TimeSelectionResult> {
        try {
            // 時間ラジオボタンを取得
            const radioButtons = document.querySelectorAll('input[type="radio"][name="date_picker"]') as NodeListOf<HTMLInputElement>;
            
            if (radioButtons.length === 0) {
                return {
                    success: false,
                    error: '時間選択ラジオボタンが見つかりません'
                };
            }

            // 利用可能な時間オプションを収集
            const availableOptions: string[] = [];
            let targetRadio: HTMLInputElement | null = null;

            for (const radio of radioButtons) {
                const value = radio.value;
                availableOptions.push(value);
                
                // 指定時間と一致するかチェック
                if (value === timeSlot) {
                    targetRadio = radio;
                }
            }

            if (!targetRadio) {
                return {
                    success: false,
                    error: `指定時間が見つかりません: ${timeSlot}`,
                    availableOptions
                };
            }

            // ラジオボタンが無効でないかチェック
            if (targetRadio.disabled) {
                return {
                    success: false,
                    error: `指定時間は選択できません: ${timeSlot}`,
                    availableOptions
                };
            }

            // ラジオボタンを選択
            targetRadio.checked = true;
            
            // changeイベントを発火
            const changeEvent = new Event('change', { bubbles: true });
            targetRadio.dispatchEvent(changeEvent);
            
            // clickイベントも発火（一部サイトで必要）
            const clickEvent = new Event('click', { bubbles: true });
            targetRadio.dispatchEvent(clickEvent);

            console.log(`⏰ 時間選択完了: ${timeSlot}`);
            
            return {
                success: true,
                selectedTime: timeSlot,
                availableOptions
            };

        } catch (error) {
            return {
                success: false,
                error: `時間選択エラー: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * 申込ボタンをクリック
     */
    async clickSubmitButton(): Promise<DOMOperationResult> {
        try {
            // 複数の可能なセレクタを試行
            const selectors = [
                '.basic-btn.type2',
                'button[class*="reservation_next_link"]',
                '.style_reservation_next_link__7gOxy',
                'button:contains("申込")',
                'button:contains("次へ")'
            ];

            for (const selector of selectors) {
                const button = document.querySelector(selector) as HTMLButtonElement;
                
                if (button && this.isElementVisible(button) && !button.disabled) {
                    // スクロールして表示
                    button.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // 少し待機してからクリック
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    button.click();
                    
                    console.log(`🔘 申込ボタンクリック: ${selector}`);
                    
                    return {
                        success: true,
                        element: button
                    };
                }
            }

            return {
                success: false,
                error: '申込ボタンが見つからないか、クリックできません'
            };

        } catch (error) {
            return {
                success: false,
                error: `申込ボタンクリックエラー: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    /**
     * ページの読み込み完了をチェック
     */
    async checkPageReady(expectedSelectors: string[] = [], timeout: number = 10000): Promise<boolean> {
        // document.readyStateチェック
        if (document.readyState !== 'complete') {
            await new Promise(resolve => {
                if (document.readyState === 'complete') {
                    resolve(void 0);
                } else {
                    window.addEventListener('load', () => resolve(void 0), { once: true });
                }
            });
        }

        // 特定の要素が存在するかチェック
        if (expectedSelectors.length > 0) {
            const result = await this.waitForElements(expectedSelectors, timeout);
            return result.success;
        }

        return true;
    }

    /**
     * ページタイトルの変更を待機
     */
    async waitForTitleChange(expectedTitle: string | RegExp, timeout: number = 10000): Promise<boolean> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const currentTitle = document.title;
            
            if (typeof expectedTitle === 'string') {
                if (currentTitle.includes(expectedTitle)) {
                    return true;
                }
            } else {
                if (expectedTitle.test(currentTitle)) {
                    return true;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return false;
    }

    /**
     * URLの変更を待機
     */
    async waitForUrlChange(expectedUrl: string | RegExp, timeout: number = 10000): Promise<boolean> {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            const currentUrl = window.location.href;
            
            if (typeof expectedUrl === 'string') {
                if (currentUrl.includes(expectedUrl)) {
                    return true;
                }
            } else {
                if (expectedUrl.test(currentUrl)) {
                    return true;
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 200));
        }
        
        return false;
    }

    /**
     * 要素にテキストが含まれているかチェック
     */
    checkElementContainsText(element: HTMLElement, text: string): boolean {
        return element.textContent?.includes(text) ?? false;
    }

    /**
     * フォームの入力状態をチェック
     */
    checkFormValid(formSelector: string): boolean {
        const form = document.querySelector(formSelector) as HTMLFormElement;
        return form ? form.checkValidity() : false;
    }

    /**
     * エラーメッセージの存在をチェック
     */
    checkForErrorMessages(): string[] {
        const errorSelectors = [
            '.error-message',
            '.alert-danger',
            '.validation-error',
            '[class*="error"]',
            '[class*="invalid"]'
        ];

        const errors: string[] = [];
        
        errorSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                const text = element.textContent?.trim();
                if (text) {
                    errors.push(text);
                }
            });
        });

        return errors;
    }

    /**
     * ページのスクリーンショット情報を取得（デバッグ用）
     */
    getPageDebugInfo(): Record<string, any> {
        return {
            url: window.location.href,
            title: document.title,
            readyState: document.readyState,
            timeRadios: document.querySelectorAll('input[type="radio"][name="date_picker"]').length,
            submitButtons: document.querySelectorAll('.basic-btn, button').length,
            errors: this.checkForErrorMessages(),
            timestamp: new Date().toISOString()
        };
    }
}

// シングルトンインスタンス
let domUtilsInstance: DOMUtils | null = null;

/**
 * DOMUtilsのシングルトンインスタンスを取得
 */
export function getDOMUtils(): DOMUtils {
    if (!domUtilsInstance) {
        domUtilsInstance = new DOMUtils();
    }
    return domUtilsInstance;
}