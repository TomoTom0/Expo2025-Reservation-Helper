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

function getRandomWaitTime(minTime, randomRange, config = entranceReservationConfig) {
    const { randomSettings } = config;
    const actualMinTime = minTime !== undefined ? minTime : randomSettings.minCheckInterval;
    const actualRandomRange = randomRange !== undefined ? randomRange : randomSettings.checkRandomRange;
    return actualMinTime + Math.floor(Math.random() * actualRandomRange);
}

async function waitForElement(selector, timeout = 5000, config = entranceReservationConfig) {
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

async function waitForAnyElement(selectors, timeout = 10000, selectorTexts = {}, config = entranceReservationConfig) {
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

async function clickElement(element, config = entranceReservationConfig) {
    element.click();
    const delay = getRandomWaitTime(config.randomSettings.minClickDelay, config.randomSettings.clickRandomRange, config);
    await new Promise(resolve => setTimeout(resolve, delay));
}

let reservationState = {
    isRunning: false,
    shouldStop: false
};

function createReservationUI() {
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
        if (reservationState.isRunning) return;
        
        reservationState.isRunning = true;
        reservationState.shouldStop = false;
        startButton.disabled = true;
        stopButton.disabled = false;
        startButton.style.background = 'rgb(74, 76, 74)';
        statusDiv.innerText = '予約処理実行中...';
        
        try {
            const result = await entranceReservationHelper();
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
            reservationState.isRunning = false;
            startButton.disabled = false;
            stopButton.disabled = true;
            startButton.style.background = 'rgb(0, 104, 33)';
        }
    });

    stopButton.addEventListener('click', () => {
        reservationState.shouldStop = true;
        statusDiv.innerText = 'キャンセル中...';
        statusDiv.style.color = 'orange';
    });

    controlDiv.appendChild(startButton);
    controlDiv.appendChild(stopButton);
    controlDiv.appendChild(statusDiv);
    targetDiv.appendChild(controlDiv);
    
    console.log('予約制御UIを挿入しました');
}

async function entranceReservationHelper(config = entranceReservationConfig) {
    const { selectors, selectorTexts, timeouts } = config;
    let attempts = 0;
    const maxAttempts = 100;
    
    console.log('入場予約補助機能を開始します...');
    
    while (attempts < maxAttempts && !reservationState.shouldStop) {
        attempts++;
        console.log(`試行回数: ${attempts}`);
        
        const statusDiv = document.getElementById('reservation-status');
        if (statusDiv) {
            statusDiv.innerText = `試行中... (${attempts}回目)`;
        }
        
        try {
            console.log('1. submitボタンを待機中...');
            const submitButton = await waitForElement(selectors.submit, timeouts.waitForSubmit, config);
            
            if (reservationState.shouldStop) break;
            
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
            
            if (reservationState.shouldStop) break;
            
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
            if (reservationState.shouldStop) break;
            await new Promise(resolve => setTimeout(resolve, getRandomWaitTime(config.randomSettings.minRetryDelay, config.randomSettings.retryRandomRange, config)));
        }
    }
    
    if (reservationState.shouldStop) {
        console.log('ユーザーによってキャンセルされました。');
        return { success: false, attempts, cancelled: true };
    }
    
    console.log(`最大試行回数 (${maxAttempts}) に達しました。処理を終了します。`);
    return { success: false, attempts };
}

setTimeout(() => {
    createReservationUI();
}, 1000);

console.log('入場予約補助機能がロードされました。');
console.log('UIボタンを使用するか、手動実行: entranceReservationHelper()');
console.log('設定をカスタマイズするには: entranceReservationHelper(yourConfig)');