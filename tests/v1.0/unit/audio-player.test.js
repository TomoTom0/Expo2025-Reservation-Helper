/**
 * AudioPlayer Unit Test
 * 音声再生モジュールの単体テスト
 * 
 * @version v1.0.0
 * @testTarget AudioPlayer (audio-player.ts)
 */

const { TestExports } = require('../../../ts/modules/test-exports');
const { AudioPlayer } = TestExports;

describe('AudioPlayer', () => {
    let mockAudioContext;
    let mockOscillator;
    let mockGain;
    
    beforeEach(() => {
        // Web Audio API mocks
        mockOscillator = {
            type: 'sine',
            frequency: { value: 440 },
            connect: jest.fn(),
            start: jest.fn(),
            stop: jest.fn()
        };
        
        mockGain = {
            gain: {
                setValueAtTime: jest.fn(),
                exponentialRampToValueAtTime: jest.fn()
            },
            connect: jest.fn()
        };
        
        mockAudioContext = {
            currentTime: 1.5, // 固定値でテスト
            destination: { connect: jest.fn() },
            createOscillator: jest.fn(() => mockOscillator),
            createGain: jest.fn(() => mockGain)
        };
        
        // AudioContextをモックで置き換え
        global.AudioContext = jest.fn(() => mockAudioContext);
        global.webkitAudioContext = global.AudioContext;
    });

    describe('isAudioSupported', () => {
        test('AudioContextが利用可能な場合はtrueを返す', () => {
            expect(AudioPlayer.isAudioSupported()).toBe(true);
        });

        test('webkitAudioContextのみ利用可能な場合はtrueを返す', () => {
            delete global.AudioContext;
            global.webkitAudioContext = jest.fn(() => mockAudioContext);
            
            expect(AudioPlayer.isAudioSupported()).toBe(true);
        });

        test('どちらも利用不可な場合はfalseを返す', () => {
            delete global.AudioContext;
            delete global.webkitAudioContext;
            
            expect(AudioPlayer.isAudioSupported()).toBe(false);
        });
    });

    describe('playBeep', () => {
        test('デフォルトパラメータでビープ音を再生', () => {
            AudioPlayer.playBeep();
            
            expect(global.AudioContext).toHaveBeenCalledTimes(1);
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
            expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1);
        });

        test('オシレーターの基本設定が正しく行われる', () => {
            AudioPlayer.playBeep(1000, 500);
            
            expect(mockOscillator.frequency.value).toBe(1000);
            expect(mockOscillator.type).toBe('sine');
            expect(mockOscillator.connect).toHaveBeenCalledWith(mockGain);
        });

        test('ゲインノードの接続とエンベロープ設定', () => {
            AudioPlayer.playBeep(800, 200);
            
            expect(mockGain.connect).toHaveBeenCalledWith(mockAudioContext.destination);
            expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.3, mockAudioContext.currentTime);
            expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.01, mockAudioContext.currentTime + 0.2);
        });

        test('オシレーターの開始・停止が正しく設定される', () => {
            AudioPlayer.playBeep(800, 300);
            
            expect(mockOscillator.start).toHaveBeenCalledWith(mockAudioContext.currentTime);
            expect(mockOscillator.stop).toHaveBeenCalledWith(mockAudioContext.currentTime + 0.3);
        });

        test('カスタム周波数・持続時間での動作', () => {
            const frequency = 1200;
            const duration = 150;
            
            AudioPlayer.playBeep(frequency, duration);
            
            expect(mockOscillator.frequency.value).toBe(frequency);
            expect(mockOscillator.stop).toHaveBeenCalledWith(mockAudioContext.currentTime + duration / 1000);
        });

        test('AudioContext作成エラー時の例外処理', () => {
            global.AudioContext = jest.fn(() => { throw new Error('AudioContext creation failed'); });
            
            // エラーをコンソールに出力しつつも、例外は投げない
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            expect(() => AudioPlayer.playBeep()).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith('Beep sound playback failed:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('playSuccessSound', () => {
        beforeEach(() => {
            // setTimeoutをモック（テスト固有）
            jest.useFakeTimers('modern');
        });

        afterEach(() => {
            // このdescribe内でのみ実タイマーに戻す
            jest.runOnlyPendingTimers();
            jest.useRealTimers();
        });

        test('AudioContextが作成される', () => {
            AudioPlayer.playSuccessSound();
            
            expect(global.AudioContext).toHaveBeenCalledTimes(1);
        });

        test('最初の音符が即座に再生される', () => {
            AudioPlayer.playSuccessSound();
            
            // setTimeout(callback, 0)の実行のため時間を進める
            jest.advanceTimersByTime(0);
            
            // 最初の音符（currentTime=0）が実行される
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
            expect(mockAudioContext.createGain).toHaveBeenCalledTimes(1);
            expect(mockOscillator.type).toBe('square');
            expect(mockOscillator.frequency.value).toBe(523); // C5
        });

        test('ゲインエンベロープが8ビット風に設定される', () => {
            AudioPlayer.playSuccessSound();
            
            // setTimeout(callback, 0)の実行
            jest.advanceTimersByTime(0);
            
            const currentTime = mockAudioContext.currentTime;
            expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.6, currentTime);
            // 100ms * 0.7 = 70ms後に同じ値で維持
            expect(mockGain.gain.setValueAtTime).toHaveBeenCalledWith(0.6, currentTime + 0.07);
            // 100ms後にフェードアウト開始
            expect(mockGain.gain.exponentialRampToValueAtTime).toHaveBeenCalledWith(0.01, currentTime + 0.1);
        });

        test('タイムアウトで順次音符が再生される', () => {
            // 新しいオシレーターを作成する度に異なる周波数を記録
            const frequencies = [];
            mockAudioContext.createOscillator = jest.fn(() => {
                const osc = { ...mockOscillator };
                const originalFreq = osc.frequency;
                osc.frequency = {
                    get value() { return originalFreq.value; },
                    set value(val) { 
                        frequencies.push(val);
                        originalFreq.value = val; 
                    }
                };
                return osc;
            });
            
            AudioPlayer.playSuccessSound();
            
            // 最初の音符（setTimeout(callback, 0)）
            jest.advanceTimersByTime(0);
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
            expect(frequencies[0]).toBe(523); // C5
            
            // 2番目の音符（120ms後）
            jest.advanceTimersByTime(120);
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(2);
            expect(frequencies[1]).toBe(659); // E5
            
            // 3番目の音符（さらに120ms後）
            jest.advanceTimersByTime(120);
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(3);
            expect(frequencies[2]).toBe(784); // G5
        });

        test('全6音符が正しい順序で再生される', () => {
            const frequencies = [];
            const durations = [];
            
            // オシレーターモック改良版
            mockAudioContext.createOscillator = jest.fn(() => {
                const osc = { ...mockOscillator };
                const originalFreq = osc.frequency;
                osc.frequency = {
                    get value() { return originalFreq.value; },
                    set value(val) { 
                        frequencies.push(val);
                        originalFreq.value = val; 
                    }
                };
                osc.stop = jest.fn((time) => {
                    durations.push(time - mockAudioContext.currentTime);
                });
                return osc;
            });
            
            AudioPlayer.playSuccessSound();
            
            // 全音符の再生を進める（各120msずつ）
            for (let i = 0; i < 6; i++) {
                jest.advanceTimersByTime(120);
            }
            
            // 期待される周波数順序
            const expectedFrequencies = [523, 659, 784, 1047, 1319, 1047]; // C5, E5, G5, C6, E6, C6
            expect(frequencies).toEqual(expectedFrequencies);
            
            // 期待される持続時間（浮動小数点の近似比較）
            expect(durations[0]).toBeCloseTo(0.1, 3);   // 100ms
            expect(durations[1]).toBeCloseTo(0.1, 3);   // 100ms
            expect(durations[2]).toBeCloseTo(0.1, 3);   // 100ms
            expect(durations[3]).toBeCloseTo(0.1, 3);   // 100ms
            expect(durations[4]).toBeCloseTo(0.2, 3);   // 200ms
            expect(durations[5]).toBeCloseTo(0.3, 3);   // 300ms
        });

        test('AudioContext作成エラー時の例外処理', () => {
            global.AudioContext = jest.fn(() => { throw new Error('AudioContext not supported'); });
            
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            
            expect(() => AudioPlayer.playSuccessSound()).not.toThrow();
            expect(consoleSpy).toHaveBeenCalledWith('Success sound playback failed:', expect.any(Error));
            
            consoleSpy.mockRestore();
        });
    });

    describe('統合動作テスト', () => {
        test('Web Audio APIサポート確認後にplaySuccessSoundが正常実行される', () => {
            // このテスト専用でフェイクタイマーを設定
            jest.useFakeTimers('modern');
            
            expect(AudioPlayer.isAudioSupported()).toBe(true);
            
            expect(() => AudioPlayer.playSuccessSound()).not.toThrow();
            
            // タイマーを進めて最初の音符を実行
            jest.advanceTimersByTime(0);
            
            expect(mockAudioContext.createOscillator).toHaveBeenCalled();
            expect(mockAudioContext.createGain).toHaveBeenCalled();
            
            // タイマーをクリーンアップ
            jest.runOnlyPendingTimers();
            jest.useRealTimers();
        });

        test('Web Audio API非対応環境でのフォールバック', () => {
            delete global.AudioContext;
            delete global.webkitAudioContext;
            
            expect(AudioPlayer.isAudioSupported()).toBe(false);
            
            // playSuccessSoundは例外を投げずに静かに失敗する
            const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
            expect(() => AudioPlayer.playSuccessSound()).not.toThrow();
            expect(consoleSpy).toHaveBeenCalled();
            
            consoleSpy.mockRestore();
        });

        test('playBeepとplaySuccessSoundの連続実行', () => {
            // このテスト専用でフェイクタイマーを設定
            jest.useFakeTimers('modern');
            
            // playBeepを実行
            AudioPlayer.playBeep(1000, 100);
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1);
            
            // AudioContextをリセット
            mockAudioContext.createOscillator.mockClear();
            mockAudioContext.createGain.mockClear();
            
            // playSuccessSoundを実行
            AudioPlayer.playSuccessSound();
            
            // タイマーを進めて最初の音符を実行
            jest.advanceTimersByTime(0);
            
            expect(mockAudioContext.createOscillator).toHaveBeenCalledTimes(1); // 最初の音符のみ
            
            // タイマーをクリーンアップ
            jest.runOnlyPendingTimers();
            jest.useRealTimers();
        });
    });
});