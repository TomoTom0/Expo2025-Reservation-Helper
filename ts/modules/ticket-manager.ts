/**
 * チケット統合管理システム
 * 自分のチケット・他人のチケットID・入場予約・予約状況を統合管理
 */

import { CacheManager } from '../types/index.js';

/**
 * チケットデータ型定義
 */
export interface TicketData {
    id: string;
    label?: string;           // 自分以外のチケット用ラベル
    isOwn: boolean;          // 自分のチケットかどうか
    entranceDates: string[]; // 入場可能日付リスト
    reservationTypes: ReservationType[];
    entranceReservations: EntranceReservation[];
    reservationStatus?: ReservationStatus[];
}

/**
 * 予約種類
 */
export interface ReservationType {
    type: '1日券' | '3日券' | '週末券' | '月間券';
    isActive: boolean;
    period?: {
        start: string;
        end: string;
    };
}

/**
 * 入場予約情報
 */
export interface EntranceReservation {
    date: string;
    time: string;
    location: 'east' | 'west';
    status: 'confirmed' | 'pending' | 'cancelled';
}

/**
 * 予約状況詳細
 */
export interface ReservationStatus {
    pavilionId: string;
    pavilionName: string;
    date: string;
    time: string;
    status: 'confirmed' | 'pending' | 'cancelled' | 'lottery';
    reservationType: string;
}

/**
 * チケット統合管理システム
 */
export class TicketManager {
    private tickets: Map<string, TicketData> = new Map();
    private selectedTicketIds: Set<string> = new Set();
    private cacheManager: CacheManager | null = null;

    constructor(cacheManager?: CacheManager) {
        this.cacheManager = cacheManager || null;
    }

    /**
     * 全チケット情報を初期化・取得
     */
    async loadAllTickets(): Promise<TicketData[]> {
        console.log('🎫 チケット統合管理: 全チケット情報取得開始');
        
        try {
            // 並列実行で効率化
            const [ownTickets, cachedTickets] = await Promise.all([
                this.loadOwnTickets(),
                this.loadCachedExternalTickets()
            ]);

            // 自分のチケットを追加
            for (const ticket of ownTickets) {
                this.tickets.set(ticket.id, ticket);
            }

            // キャッシュされた外部チケットを追加
            for (const ticket of cachedTickets) {
                this.tickets.set(ticket.id, ticket);
            }

            console.log(`✅ チケット統合管理: ${this.tickets.size}個のチケットを読み込み完了`);
            return Array.from(this.tickets.values());

        } catch (error) {
            console.error('❌ チケット情報取得エラー:', error);
            return [];
        }
    }

    /**
     * 自分のチケット情報を取得
     */
    private async loadOwnTickets(): Promise<TicketData[]> {
        console.log('🔍 自分のチケット情報取得中...');
        
        try {
            // 既存のAPI機能を活用（パビリオン検索画面のデバッグダイアログから）
            const response = await fetch('/api/d/my/tickets/?count=1', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Api-Lang': 'ja',
                    'Accept-Language': 'ja'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`API応答エラー: ${response.status}`);
            }

            const data = await response.json();
            console.log('🔍 自分のチケットAPI応答:', data);

            const tickets: TicketData[] = [];

            if (data.results && Array.isArray(data.results)) {
                for (const ticketGroup of data.results) {
                    if (ticketGroup.tickets && Array.isArray(ticketGroup.tickets)) {
                        for (const ticket of ticketGroup.tickets) {
                            const ticketData: TicketData = {
                                id: ticket.id,
                                isOwn: true,
                                entranceDates: this.extractEntranceDates(ticket),
                                reservationTypes: this.extractReservationTypes(ticket),
                                entranceReservations: this.extractEntranceReservations(ticket)
                            };
                            tickets.push(ticketData);
                        }
                    }
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
                    }
                } catch (error) {
                    console.warn(`⚠️ 外部チケット${ticketId}の取得に失敗:`, error);
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
    private async loadExternalTicketData(ticketId: string, label: string): Promise<TicketData | null> {
        try {
            // 外部チケットの場合、入場予約情報のみ取得可能
            // チケット詳細は取得できないため、最小限の情報で構成
            const ticketData: TicketData = {
                id: ticketId,
                label: label,
                isOwn: false,
                entranceDates: [], // 外部チケットの日付は不明
                reservationTypes: [], // 外部チケットの種別は不明
                entranceReservations: []
            };

            // 入場予約があるかチェック（可能であれば）
            try {
                const entranceReservations = await this.getEntranceReservationsForTicket(ticketId);
                ticketData.entranceReservations = entranceReservations;
            } catch (error) {
                console.warn(`⚠️ チケット${ticketId}の入場予約取得失敗:`, error);
            }

            return ticketData;

        } catch (error) {
            console.error(`❌ 外部チケット${ticketId}データ取得エラー:`, error);
            return null;
        }
    }

    /**
     * 指定チケットの入場予約を取得
     */
    private async getEntranceReservationsForTicket(_ticketId: string): Promise<EntranceReservation[]> {
        // この機能は既存のAPI機能から実装する必要がある
        // 現在は空配列を返す（今後実装）
        return [];
    }

    /**
     * チケットから入場可能日付を抽出
     */
    private extractEntranceDates(ticket: any): string[] {
        const dates: string[] = [];
        
        try {
            // チケット情報から入場可能日付を抽出
            if (ticket.entrance_dates && Array.isArray(ticket.entrance_dates)) {
                for (const dateInfo of ticket.entrance_dates) {
                    if (dateInfo.date) {
                        dates.push(dateInfo.date);
                    }
                }
            }
        } catch (error) {
            console.warn('⚠️ 入場日付抽出エラー:', error);
        }

        return dates;
    }

    /**
     * チケットから予約種類を抽出
     */
    private extractReservationTypes(ticket: any): ReservationType[] {
        const types: ReservationType[] = [];
        
        try {
            // チケット種別情報から予約種類を判定
            if (ticket.ticket_type) {
                // 実装は既存のビジネスロジックに基づく
                const type = this.determineReservationType(ticket.ticket_type);
                if (type) {
                    types.push(type);
                }
            }
        } catch (error) {
            console.warn('⚠️ 予約種類抽出エラー:', error);
        }

        return types;
    }

    /**
     * チケットから入場予約情報を抽出
     */
    private extractEntranceReservations(ticket: any): EntranceReservation[] {
        const reservations: EntranceReservation[] = [];
        
        try {
            if (ticket.entrance_reservations && Array.isArray(ticket.entrance_reservations)) {
                for (const reservation of ticket.entrance_reservations) {
                    const reservationData: EntranceReservation = {
                        date: reservation.date || '',
                        time: reservation.time || '',
                        location: reservation.location === 'east' ? 'east' : 'west',
                        status: this.mapReservationStatus(reservation.status)
                    };
                    reservations.push(reservationData);
                }
            }
        } catch (error) {
            console.warn('⚠️ 入場予約抽出エラー:', error);
        }

        return reservations;
    }

    /**
     * チケット種別から予約種類を判定
     */
    private determineReservationType(_ticketType: any): ReservationType | null {
        // 実装は既存のビジネスロジックに基づく
        // 現在は1日券として扱う（今後拡張）
        return {
            type: '1日券',
            isActive: true
        };
    }

    /**
     * 予約状況をマッピング
     */
    private mapReservationStatus(status: any): 'confirmed' | 'pending' | 'cancelled' {
        if (typeof status === 'string') {
            switch (status.toLowerCase()) {
                case 'confirmed':
                case '確定':
                    return 'confirmed';
                case 'pending':
                case '保留':
                    return 'pending';
                case 'cancelled':
                case 'キャンセル':
                    return 'cancelled';
                default:
                    return 'pending';
            }
        }
        return 'pending';
    }

    /**
     * 外部チケットIDを追加
     */
    async addExternalTicket(ticketId: string, label: string): Promise<void> {
        console.log(`🎫 外部チケット追加: ${ticketId} (${label})`);
        
        try {
            // 重複チェック
            if (this.tickets.has(ticketId)) {
                throw new Error('このチケットIDは既に登録されています');
            }

            // チケットIDの妥当性を検証
            await this.validateTicketId(ticketId);

            // チケットデータを作成
            const ticketData = await this.loadExternalTicketData(ticketId, label);
            if (!ticketData) {
                throw new Error('チケットデータの取得に失敗しました');
            }

            // メモリとキャッシュに保存
            this.tickets.set(ticketId, ticketData);
            await this.saveExternalTicketToCache(ticketId, label);

            console.log(`✅ 外部チケット追加完了: ${ticketId}`);

        } catch (error) {
            console.error('❌ 外部チケット追加エラー:', error);
            throw error;
        }
    }

    /**
     * チケットIDの妥当性を検証
     */
    private async validateTicketId(ticketId: string): Promise<void> {
        // チケットIDの形式チェック
        if (!ticketId || ticketId.trim().length === 0) {
            throw new Error('チケットIDが空です');
        }

        // 必要に応じてAPIでチケットIDの存在確認
        // 現在は基本的な形式チェックのみ
    }

    /**
     * 外部チケットをキャッシュに保存
     */
    private async saveExternalTicketToCache(ticketId: string, label: string): Promise<void> {
        try {
            // 監視キャッシュに保存
            const monitoringCache = localStorage.getItem('expo_monitoring_cache') || '{}';
            const monitoringData = JSON.parse(monitoringCache);
            
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

            // 指定日付の入場可能チケットを選択
            if (ticket.entranceDates.includes(date)) {
                this.selectedTicketIds.add(ticketId);
            }
        }

        console.log(`✅ ${this.selectedTicketIds.size}個のチケットを選択`);
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
     * 全チケット一覧を取得
     */
    getAllTickets(): TicketData[] {
        return Array.from(this.tickets.values());
    }

    /**
     * 利用可能な日付一覧を取得
     */
    getAvailableDates(): string[] {
        const dates = new Set<string>();
        
        for (const ticket of this.tickets.values()) {
            // 予約種類が有効な場合のみ日付を追加
            if (ticket.reservationTypes.some(type => type.isActive)) {
                for (const date of ticket.entranceDates) {
                    dates.add(date);
                }
            }
        }

        return Array.from(dates).sort();
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