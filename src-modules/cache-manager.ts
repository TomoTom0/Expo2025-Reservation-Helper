// entrance-page-stateからのimport
// import { timeSlotState } from './entrance-page-state'; // 統合により不要


// unified-stateからの直接インポート
import { entranceReservationStateManager } from './entrance-reservation-state-manager';

// 型定義のインポート
import type { CacheManager, Dependencies } from '../types/index.js';

// ============================================================================
// キャッシュ管理機能
const createCacheManager = (dependencies: Dependencies = {}): CacheManager => {
const { getCurrentSelectedCalendarDateFn } = dependencies;

return {
    // キー生成（URLベース）
    generateKey(suffix: string = ''): string {
        const url = new URL(window.location.href);
        const baseKey = `expo2025_entrance_${url.searchParams.get('reserve_id') || 'default'}`;
        return suffix ? `${baseKey}_${suffix}` : baseKey;
    },
    
    // 複数監視対象を保存
    saveTargetSlots(): void {
        try {
            if (!entranceReservationStateManager) return;
            
            const targets = entranceReservationStateManager.getMonitoringTargets();
            if (targets.length === 0) return;
            
            // 現在選択されているカレンダー日付を取得
            const selectedCalendarDate = getCurrentSelectedCalendarDateFn ? getCurrentSelectedCalendarDateFn() : null;
            
            const data = {
                targets: targets.map((target: any) => ({
                    timeSlot: target.timeSlot,    // 復元時と統一（timeText→timeSlot）
                    tdSelector: target.selector,
                    positionInfo: target.positionInfo || {},
                    status: target.status || 'unknown',
                    locationIndex: target.locationIndex
                })),
                selectedDate: selectedCalendarDate,
                timestamp: Date.now(),
                url: window.location.href,
                retryCount: entranceReservationStateManager.getRetryCount() || 0
            };
            
            localStorage.setItem(this.generateKey('target_slots'), JSON.stringify(data));
            const targetTexts = targets.map((t: any) => t.timeSlot).join(', ');
            console.log(`✅ 複数監視対象をキャッシュに保存: ${targetTexts} (${targets.length}個)`);
        } catch (error) {
            console.error('❌ 複数監視対象保存エラー:', error);
        }
    },
    
    // 後方互換性のため残す
    saveTargetSlot(_slotInfo: any): void {
        this.saveTargetSlots();
    },
    
    // 監視対象時間帯を読み込み
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
            
            console.log('📖 キャッシュから監視対象時間帯を読み込み:', parsed.timeSlot);
            return parsed;
        } catch (error) {
            console.error('❌ キャッシュ読み込みエラー:', error);
            return null;
        }
    },
    
    // 複数監視対象を読み込み（後方互換性あり）
    loadTargetSlots(): any | null {
        try {
            // 新形式の複数対象キャッシュを確認
            const newData = localStorage.getItem(this.generateKey('target_slots'));
            if (newData) {
                const parsed = JSON.parse(newData);
                // 24時間以内のデータのみ有効
                if (Date.now() - parsed.timestamp > 24 * 60 * 60 * 1000) {
                    this.clearTargetSlots();
                    return null;
                }
                
                const targetTexts = parsed.targets?.map((t: any) => t.timeSlot).join(', ') || '不明';
                console.log(`📖 複数監視対象キャッシュを読み込み: ${targetTexts} (${parsed.targets?.length || 0}個)`);
                return parsed;
            }
            
            // 後方互換性：古い単一対象キャッシュを確認
            const oldData = this.loadTargetSlot();
            if (oldData) {
                console.log('📖 単一対象キャッシュを複数対象形式に変換中...');
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
            console.error('❌ 複数監視対象読み込みエラー:', error);
            return null;
        }
    },
    
    // 複数監視対象をクリア
    clearTargetSlots(): void {
        try {
            localStorage.removeItem(this.generateKey('target_slots'));
            localStorage.removeItem(this.generateKey('target_slot')); // 古い形式もクリア
            console.log('🗑️ 複数監視対象キャッシュをクリア');
        } catch (error) {
            console.error('❌ 複数監視対象クリアエラー:', error);
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
    
    // 監視継続フラグを設定（リロード前に呼び出し）
    setMonitoringFlag(isActive: boolean = true): void {
        try {
            const data = {
                isMonitoring: isActive,
                timestamp: Date.now()
            };
            const key = 'expo2025_monitoring_flag';
            localStorage.setItem(key, JSON.stringify(data));
            console.log(`🏃 監視継続フラグを設定: ${isActive}`);
            console.log(`🔑 フラグ保存キー: ${key}`);
            console.log(`💾 フラグ保存データ: ${JSON.stringify(data)}`);
            
            // 保存確認
            const saved = localStorage.getItem(key);
            console.log(`✅ フラグ保存確認: ${saved ? '成功' : '失敗'}`);
        } catch (error) {
            console.error('❌ 監視フラグ設定エラー:', error);
        }
    },
    
    // 監視継続フラグを取得し、即座にfalseに設定（暴走防止）
    getAndClearMonitoringFlag(): boolean {
        try {
            const key = 'expo2025_monitoring_flag';
            const data = localStorage.getItem(key);
            console.log(`🔑 フラグ取得キー: ${key}`);
            console.log(`📥 フラグ取得データ: ${data || 'null'}`);
            
            if (!data) {
                console.log('❌ 監視継続フラグが見つかりません');
                return false;
            }
            
            const parsed = JSON.parse(data);
            // 60秒以内のフラグのみ有効（リロード直後でないと無効）
            // リロード間隔が30秒 + ランダム5秒 + ページロード時間 + 初期化時間を考慮
            const isRecent = Date.now() - parsed.timestamp < 60 * 1000;
            const shouldContinue = isRecent && parsed.isMonitoring;
            
            // フラグを即座にクリア（暴走防止）
            this.clearMonitoringFlag();
            
            const timeDiff = (Date.now() - parsed.timestamp) / 1000;
            console.log(`🔍 監視継続フラグチェック: ${shouldContinue} (recent: ${isRecent}, flag: ${parsed.isMonitoring}, 経過時間: ${timeDiff.toFixed(1)}秒)`);
            console.log(`📅 フラグ設定時刻: ${new Date(parsed.timestamp).toLocaleTimeString()}, 現在時刻: ${new Date().toLocaleTimeString()}`);
            return shouldContinue;
        } catch (error) {
            console.error('❌ 監視フラグ取得エラー:', error);
            return false;
        }
    },
    
    // 監視継続フラグをクリア
    clearMonitoringFlag(): void {
        try {
            localStorage.removeItem('expo2025_monitoring_flag');
            console.log('🗑️ 監視継続フラグをクリア');
        } catch (error) {
            console.error('❌ 監視フラグクリアエラー:', error);
        }
    }
};
}; // createCacheManager の終了

// エクスポート
export {
    createCacheManager
};

// ============================================================================
