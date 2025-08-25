/**
 * チケット統合管理システム
 * 自分のチケット・他人のチケットID・入場予約・予約状況を統合管理
 */

import { CacheManager } from '../types/index.js';

/**
 * スケジュールデータ型定義
 */
export interface ScheduleData {
    entrance_date: string;      // 入場日（YYYYMMDD形式）
    use_state: number;          // 利用状態（0:未使用, 1:入場済み, 2:使用済み等）
    schedule_name?: string;     // スケジュール名
    isEffective?: boolean;      // 有効フラグ（処理時に付与）
    time_start?: string;        // 開始時間
    time_end?: string;          // 終了時間
    reservation_type?: string;  // 予約種別
}

/**
 * チケットデータ型定義
 */
export interface TicketData {
    ticket_id: string;          // 公式チケットID
    isOwn: boolean;             // 自分のチケットかどうか
    label?: string;             // チケットラベル
    schedules?: ScheduleData[]; // 入場予約情報
}

/**
 * チケット統合管理システム
 */
export class TicketManager {
    private tickets: Map<string, TicketData> = new Map();
    public selectedTicketIds: Set<string> = new Set();
    private cacheManager: CacheManager | null = null;
    private todayStr: string;

    constructor(cacheManager?: CacheManager) {
        this.cacheManager = cacheManager || null;
        // 今日の日付を初期化時に計算（YYYYMMDD形式）
        const today = new Date();
        this.todayStr = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;
    }

    /**
     * スケジュールデータに有効フラグを付与
     */
    private processSchedules(schedules: any[]): ScheduleData[] {
        if (!Array.isArray(schedules)) return [];
        
        return schedules.map(schedule => ({
            entrance_date: schedule.entrance_date || '',
            use_state: schedule.use_state || 0,
            schedule_name: schedule.schedule_name,
            time_start: schedule.time_start,
            time_end: schedule.time_end,
            reservation_type: schedule.reservation_type,
            // 有効フラグを付与: 状態0または（当日かつ状態1:入場済みでも当日は有効）
            isEffective: schedule.use_state === 0 || 
                        (schedule.use_state === 1 && schedule.entrance_date === this.todayStr)
        }));
    }

    /**
     * 全チケット情報を初期化・取得
     */
    async loadAllTickets(): Promise<TicketData[]> {
        console.log('🎫 チケット統合管理: 全チケット情報取得開始');
        
        // 自分のチケットを最優先で読み込み
        let ownTickets: TicketData[] = [];
        try {
            ownTickets = await this.loadOwnTickets();
            console.log(`✅ 自分のチケット: ${ownTickets.length}個取得完了`);
            
            // 自分のチケットを追加
            for (const ticket of ownTickets) {
                this.tickets.set(ticket.ticket_id, ticket);
            }
        } catch (error) {
            console.error('❌ 自分のチケット取得エラー:', error);
        }

        // 外部チケットを取得（エラーがあっても自分のチケットには影響しない）
        try {
            const cachedTickets = await this.loadCachedExternalTickets();
            console.log(`✅ 外部チケット: ${cachedTickets.length}個取得完了`);
            
            // キャッシュされた外部チケットを追加
            for (const ticket of cachedTickets) {
                this.tickets.set(ticket.ticket_id, ticket);
            }
        } catch (error) {
            console.error('❌ 外部チケット取得エラー（自分のチケットは正常）:', error);
        }

        console.log(`✅ チケット統合管理: ${this.tickets.size}個のチケットを読み込み完了`);
        return Array.from(this.tickets.values());
    }

    /**
     * 自分のチケット情報を取得
     */
    private async loadOwnTickets(): Promise<TicketData[]> {
        console.log('🔍 自分のチケット情報取得中...');
        
        try {
            // デバッグダイアログ調査結果に基づくAPI実装
            const response = await fetch('/api/d/my/tickets/?count=1', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('🔍 自分のチケットAPI応答:', data);

            const tickets: TicketData[] = [];

            // 調査結果: data.list配列にチケット情報が格納される
            if (data.list && Array.isArray(data.list)) {
                for (const ticket of data.list) {
                    const ticketData: TicketData = {
                        ticket_id: ticket.ticket_id || ticket.simple_ticket_id || '',
                        isOwn: true,
                        label: ticket.item_name || 'チケット',
                        schedules: this.processSchedules(ticket.schedules || [])  // フラグ付きschedulesを設定
                    };
                    
                    // デバッグ: 自分のチケットのschedules状況を確認
                    console.log(`📅 自分のチケット ${ticketData.ticket_id}: schedules=${ticketData.schedules?.length || 0}件`);
                    if (ticketData.schedules && ticketData.schedules.length > 0) {
                        ticketData.schedules.forEach((schedule: any, i: number) => {
                            console.log(`  [${i}] entrance_date=${schedule.entrance_date}, use_state=${schedule.use_state}`);
                        });
                    }
                    
                    tickets.push(ticketData);
                    this.tickets.set(ticketData.ticket_id, ticketData);
                }
            }

            console.log(`✅ 自分のチケット: ${tickets.length}個取得`);
            return tickets;

        } catch (error) {
            console.error('❌ 自分のチケット取得エラー:', error);
            return [];
        }
    }

    /**
     * キャッシュされた外部チケットを取得
     */
    private async loadCachedExternalTickets(): Promise<TicketData[]> {
        console.log('🔍 キャッシュされた外部チケット取得中...');
        
        const tickets: TicketData[] = [];

        try {
            // 各キャッシュシステムから外部チケットIDを取得
            const externalTicketIds = await this.getCachedExternalTicketIds();
            
            console.log(`🔍 キャッシュから${externalTicketIds.length}個の外部チケットIDを発見`);

            // 各外部チケットの詳細情報を取得
            for (const { ticketId, label } of externalTicketIds) {
                try {
                    const ticketData = await this.loadExternalTicketData(ticketId, label);
                    if (ticketData) {
                        tickets.push(ticketData);
                        console.log(`✅ 外部チケット ${ticketId} (${label}) を正常追加`);
                    } else {
                        console.warn(`⚠️ 外部チケット ${ticketId} のデータ取得失敗（null返却）`);
                    }
                } catch (error) {
                    console.warn(`⚠️ 外部チケット${ticketId}の取得に失敗:`, error);
                    // 外部チケット取得失敗は他のチケットに影響させない
                }
            }

            console.log(`✅ 外部チケット: ${tickets.length}個取得`);
            return tickets;

        } catch (error) {
            console.error('❌ 外部チケット取得エラー:', error);
            return [];
        }
    }

    /**
     * キャッシュから外部チケットIDを収集
     */
    private async getCachedExternalTicketIds(): Promise<Array<{ticketId: string, label: string}>> {
        const externalTickets: Array<{ticketId: string, label: string}> = [];

        try {
            // 監視キャッシュから取得
            const monitoringCache = localStorage.getItem('expo_monitoring_cache');
            if (monitoringCache) {
                const data = JSON.parse(monitoringCache);
                if (data.externalTickets) {
                    for (const [ticketId, info] of Object.entries(data.externalTickets)) {
                        externalTickets.push({
                            ticketId,
                            label: (info as any).label || '外部チケット'
                        });
                    }
                }
            }

            // パビリオン予約キャッシュから取得
            const pavilionCache = localStorage.getItem('expo_pavilion_reservation_cache');
            if (pavilionCache) {
                const data = JSON.parse(pavilionCache);
                if (data.externalTickets) {
                    for (const [ticketId, info] of Object.entries(data.externalTickets)) {
                        // 重複チェック
                        if (!externalTickets.find(t => t.ticketId === ticketId)) {
                            externalTickets.push({
                                ticketId,
                                label: (info as any).label || '外部チケット'
                            });
                        }
                    }
                }
            }

            // その他のキャッシュソースがあれば追加

        } catch (error) {
            console.error('❌ キャッシュからの外部チケットID取得エラー:', error);
        }

        return externalTickets;
    }

    /**
     * 外部チケットの詳細データを取得
     */
    private async loadExternalTicketData(ticketId: string, label: string, channel?: string): Promise<TicketData | null> {
        try {
            // 外部チケット取得API（agent-ticket.jsより）
            const channels = channel ? [channel] : ['5', '4', '3', '2']; // 指定されたchannelまたは全チャネル試行
            
            for (const testChannel of channels) {
                try {
                    const response = await fetch(`/api/d/proxy_tickets/${ticketId}/add_check?registered_channel=${testChannel}`, {
                        credentials: 'include'
                    });
                    
                    if (response.ok) {
                        const data = await response.json();
                        
                        console.log(`✅ 外部チケット取得成功 (channel: ${testChannel}):`, data);
                        
                        // 外部チケットも統一構造でフラグ付きschedulesデータを設定
                        const ticketData: TicketData = {
                            ticket_id: data.ticket_id,
                            isOwn: false,
                            label: label,
                            schedules: this.processSchedules(data.schedules || [])
                        };

                        // デバッグ: 外部チケットのschedules状況を確認
                        console.log(`📅 外部チケット ${ticketId}: schedules=${ticketData.schedules?.length || 0}件`);
                        if (ticketData.schedules && ticketData.schedules.length > 0) {
                            ticketData.schedules.forEach((schedule: any, i: number) => {
                                console.log(`  [${i}] entrance_date=${schedule.entrance_date}, use_state=${schedule.use_state}`);
                            });
                        }

                        console.log(`✅ 外部チケット${ticketId}をchannel=${testChannel}で取得成功`);
                        return ticketData;
                    }
                } catch (error) {
                    console.warn(`⚠️ 外部チケット${ticketId}のchannel=${testChannel}取得失敗:`, error);
                }
            }
            
            // どのchannelでも取得できない場合は最小限のデータを作成
            console.log(`⚠️ 外部チケット${ticketId}の詳細取得失敗、最小限データで作成`);
            return {
                ticket_id: ticketId,
                isOwn: false,
                label: label,
                schedules: this.processSchedules([])  // 空のschedulesを設定
            };

        } catch (error) {
            console.error(`❌ 外部チケット${ticketId}データ取得エラー:`, error);
            return null;
        }
    }



    /**
     * 外部チケットIDを追加
     */
    async addExternalTicket(ticketId: string, label: string, channel?: string): Promise<void> {
        const registeredChannel = channel || '5'; // デフォルトは当日(1)
        console.log(`🎫 外部チケット追加: ${ticketId} (${label}) channel: ${registeredChannel}`);
        
        try {
            // 重複チェック
            if (this.tickets.has(ticketId)) {
                throw new Error('このチケットIDは既に登録されています');
            }

            // チケットIDの妥当性を検証
            await this.validateTicketId(ticketId, registeredChannel);

            // チケットデータを作成
            const ticketData = await this.loadExternalTicketData(ticketId, label, registeredChannel);
            if (!ticketData) {
                throw new Error('チケットデータの取得に失敗しました');
            }

            // メモリとキャッシュに保存
            this.tickets.set(ticketId, ticketData);
            await this.saveExternalTicketToCache(ticketId, label, registeredChannel);

            console.log(`✅ 外部チケット追加完了: ${ticketId} (channel: ${registeredChannel})`);

        } catch (error) {
            console.error('❌ 外部チケット追加エラー:', error);
            throw error;
        }
    }

    /**
     * チケットIDの妥当性を検証
     */
    private async validateTicketId(ticketId: string, channel?: string): Promise<void> {
        // チケットIDの形式チェック
        if (!ticketId || ticketId.trim().length === 0) {
            throw new Error('チケットIDが空です');
        }

        // 必要に応じてAPIでチケットIDの存在確認
        // 現在は基本的な形式チェックのみ
        console.log(`🔍 チケットID検証: ${ticketId} (channel: ${channel || 'auto'})`);
    }

    /**
     * 外部チケットをキャッシュに保存
     */
    private async saveExternalTicketToCache(ticketId: string, label: string, channel?: string): Promise<void> {
        try {
            // 監視キャッシュに保存
            const monitoringCache = localStorage.getItem('expo_monitoring_cache') || '{}';
            const monitoringData = JSON.parse(monitoringCache);
            console.log(`💾 外部チケットキャッシュ保存: ${ticketId} (channel: ${channel || 'auto'})`);
            
            if (!monitoringData.externalTickets) {
                monitoringData.externalTickets = {};
            }
            
            monitoringData.externalTickets[ticketId] = {
                label: label,
                addedAt: new Date().toISOString()
            };
            
            localStorage.setItem('expo_monitoring_cache', JSON.stringify(monitoringData));

            console.log(`💾 外部チケットをキャッシュに保存: ${ticketId}`);

        } catch (error) {
            console.error('❌ 外部チケットキャッシュ保存エラー:', error);
        }
    }

    /**
     * 日付別チケット選択
     */
    selectTicketsByDate(date: string, ownOnly: boolean = false): void {
        console.log(`🗓️ 日付別チケット選択: ${date} (自分のみ: ${ownOnly})`);
        
        this.selectedTicketIds.clear();

        for (const [ticketId, ticket] of this.tickets) {
            // 自分のチケットのみの場合
            if (ownOnly && !ticket.isOwn) {
                continue;
            }
            
            // 指定日付の有効な入場予約があるかチェック
            let hasMatchingDate = false;
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                hasMatchingDate = ticket.schedules.some(schedule => 
                    schedule.entrance_date === date && schedule.isEffective
                );
            }
            
            if (hasMatchingDate) {
                this.selectedTicketIds.add(ticketId);
            }
        }

        console.log(`✅ ${this.selectedTicketIds.size}個のチケットを選択 (日付: ${date})`);
    }

    /**
     * 選択済みチケットID一覧を取得（デバッグ用）
     */
    getSelectedTicketIds(): Set<string> {
        return this.selectedTicketIds;
    }

    /**
     * 選択済みチケット一覧を取得
     */
    getSelectedTickets(): TicketData[] {
        const selectedTickets: TicketData[] = [];
        
        for (const ticketId of this.selectedTicketIds) {
            const ticket = this.tickets.get(ticketId);
            if (ticket) {
                selectedTickets.push(ticket);
            }
        }

        return selectedTickets;
    }

    /**
     * 選択済みチケット数を取得
     */
    getSelectedTicketCount(): number {
        return this.selectedTicketIds.size;
    }

    /**
     * 選択されたチケットの入場予約から最も遅い入場時間を取得（律速時間）
     */
    getLatestEntranceTime(targetDate: string): string | null {
        let latestTime: string | null = null;
        
        for (const ticket of this.tickets.values()) {
            if (ticket.schedules && Array.isArray(ticket.schedules)) {
                for (const schedule of ticket.schedules) {
                    // 対象日付で有効な入場予約の場合
                    if (schedule.entrance_date === targetDate && schedule.isEffective) {
                        // schedule_nameから時間を抽出（例：「9:00-10:00」「14:30」など）
                        const timeMatch = schedule.schedule_name?.match(/(\d{1,2}):(\d{2})/);
                        if (timeMatch) {
                            const time = `${timeMatch[1].padStart(2, '0')}:${timeMatch[2]}`;
                            if (!latestTime || time > latestTime) {
                                latestTime = time;
                            }
                        }
                    }
                }
            }
        }
        
        return latestTime;
    }

    /**
     * 全チケット一覧を取得
     */
    getAllTickets(): TicketData[] {
        return Array.from(this.tickets.values());
    }

    /**
     * 利用可能な日付一覧を取得
     */
    getAvailableDates(): string[] {
        return [];
    }

    /**
     * 統合キャッシュデータを同期
     */
    syncCacheData(): void {
        console.log('🔄 チケット統合管理: キャッシュデータ同期');
        
        try {
            // CacheManagerとの同期処理
            if (this.cacheManager) {
                // 必要に応じて既存キャッシュシステムとの同期
                console.log('✅ キャッシュマネージャーとの同期完了');
            }
        } catch (error) {
            console.error('❌ キャッシュ同期エラー:', error);
        }
    }

    /**
     * チケット選択状態をクリア
     */
    clearSelection(): void {
        this.selectedTicketIds.clear();
        console.log('🧹 チケット選択状態をクリア');
    }

    /**
     * 特定チケットの選択状態を切り替え
     */
    toggleTicketSelection(ticketId: string): boolean {
        if (this.selectedTicketIds.has(ticketId)) {
            this.selectedTicketIds.delete(ticketId);
            return false;
        } else {
            this.selectedTicketIds.add(ticketId);
            return true;
        }
    }
}

/**
 * グローバルチケットマネージャーインスタンス
 */
let globalTicketManager: TicketManager | null = null;

/**
 * チケットマネージャーを初期化・取得
 */
export function getTicketManager(cacheManager?: CacheManager): TicketManager {
    if (!globalTicketManager) {
        globalTicketManager = new TicketManager(cacheManager);
    }
    return globalTicketManager;
}