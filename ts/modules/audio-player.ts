/**
 * 音声再生モジュール
 * UserScript環境での音声通知機能を提供
 */

export class AudioPlayer {
    /**
     * 8ビット風成功音を再生
     * 自動予約成功時の通知音として使用
     */
    public static playSuccessSound(): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            
            // 8ビット風のメロディ
            const chiptune = [
                { freq: 523, duration: 100 },   // C5
                { freq: 659, duration: 100 },   // E5
                { freq: 784, duration: 100 },   // G5
                { freq: 1047, duration: 100 },  // C6
                { freq: 1319, duration: 200 },  // E6
                { freq: 1047, duration: 300 }   // C6
            ];
            
            let currentTime = 0;
            chiptune.forEach((note) => {
                setTimeout(() => {
                    const osc = audioContext.createOscillator();
                    const gain = audioContext.createGain();
                    osc.connect(gain);
                    gain.connect(audioContext.destination);
                    
                    osc.type = 'square';  // 8ビット風の矩形波
                    osc.frequency.value = note.freq;
                    
                    // 8ビット風の音量エンベロープ
                    gain.gain.setValueAtTime(0.6, audioContext.currentTime);
                    gain.gain.setValueAtTime(0.6, audioContext.currentTime + (note.duration / 1000) * 0.7);
                    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (note.duration / 1000));
                    
                    osc.start(audioContext.currentTime);
                    osc.stop(audioContext.currentTime + (note.duration / 1000));
                    
                }, currentTime);
                
                currentTime += note.duration + 20;
            });
            
        } catch (error) {
            console.error('Success sound playback failed:', error);
        }
    }

    /**
     * 簡単なビープ音を再生
     * @param frequency 周波数 (Hz)
     * @param duration 持続時間 (ms)
     */
    public static playBeep(frequency: number = 800, duration: number = 200): void {
        try {
            const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            
            // 音量フェードアウト（クリック音を防ぐ）
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration / 1000);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration / 1000);
        } catch (error) {
            console.error('Beep sound playback failed:', error);
        }
    }

    /**
     * Web Audio APIがサポートされているかチェック
     */
    public static isAudioSupported(): boolean {
        return !!(window.AudioContext || (window as any).webkitAudioContext);
    }
}