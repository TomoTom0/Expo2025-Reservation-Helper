


// 型定義のインポート
import type { CacheManager, Dependencies } from '../types/index.js';
import { loggers } from '../utils/logger';
const logger = loggers.automation;

// ============================================================================
// キャッシュ管理機能
const createCacheManager = (_dependencies: Dependencies = {}): CacheManager => {

return {
    // キー生成（URLベース）
    generateKey(suffix: string = ''): string {
        const url = new URL(window.location.href);
        const baseKey = `expo2025_entrance_${url.searchParams.get('reserve_id') || 'default'}`;
        return suffix ? `${baseKey}_${suffix}` : baseKey;
    },
    
    // 空の保存処理
    saveTargetSlots(): void {
        return;
    },
    
    // 後方互換性のため残す
    saveTargetSlot(_slotInfo: any): void {
        this.saveTargetSlots();
    },
    
    // キャッシュ時間帯を読み込み
    loadTargetSlot(): any | null {
        try {
            const data = localStorage.getItem(this.generateKey('target_slot'));
            if (!data) return null;
            
            const parsed = JSON.parse(data);
            // 24時間以内のデータのみ有効
            if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                this.clearTargetSlot();
                return null;
            }
            
            logger.debug('キャッシュから時間帯を読み込み', { timeSlot: parsed.timeSlot });
            return parsed;
        } catch (error) {
            logger.error('キャッシュ読み込みエラー', { error });
            return null;
        }
    },
    
    // 複数キャッシュを読み込み（後方互換性あり）
    loadTargetSlots(): any | null {
        try {
            // 新形式の複数キャッシュを確認
            const newData = localStorage.getItem(this.generateKey('target_slots'));
            if (newData) {
                const parsed = JSON.parse(newData);
                // 24時間以内のデータのみ有効
                if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                    this.clearTargetSlots();
                    return null;
                }
                
                const targetTexts = parsed.targets?.map((t: any) => t.timeSlot).join(', ') || '不明';
                logger.debug('複数キャッシュを読み込み', { targetTexts, count: parsed.targets?.length || 0 });
                return parsed;
            }
            
            // 後方互換性：古い単一キャッシュを確認
            const oldData = this.loadTargetSlot();
            if (oldData) {
                logger.debug('単一キャッシュを複数形式に変換中');
                return {
                    targets: [oldData],
                    selectedDate: oldData.selectedDate,
                    timestamp: oldData.timestamp,
                    url: oldData.url,
                    retryCount: oldData.retryCount
                };
            }
            
            return null;
        } catch (error) {
            logger.error('複数キャッシュ読み込みエラー', { error });
            return null;
        }
    },
    
    // 複数キャッシュをクリア
    clearTargetSlots(): void {
        try {
            localStorage.removeItem(this.generateKey('target_slots'));
            localStorage.removeItem(this.generateKey('target_slot')); // 古い形式もクリア
            logger.debug('複数キャッシュをクリア');
        } catch (error) {
            logger.error('複数キャッシュクリアエラー', { error });
        }
    },
    
    // 後方互換性のため残す
    clearTargetSlot(): void {
        this.clearTargetSlots();
    },
    
    // 試行回数を更新
    updateRetryCount(count: number): void {
        const cached = this.loadTargetSlot();
        if (cached) {
            cached.retryCount = count;
            cached.timestamp = Date.now();
            localStorage.setItem(this.generateKey('target_slot'), JSON.stringify(cached));
        }
    },
    
};
}; // createCacheManager の終了

// エクスポート
export {
    createCacheManager
};

// ============================================================================
