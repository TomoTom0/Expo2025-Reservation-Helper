/**
 * パビリオン統合管理システム
 * パビリオン検索・お気に入り・フィルター・予約実行を統合管理
 */

import { TicketData } from './ticket-manager';

/**
 * パビリオン時間帯情報
 */
export interface PavilionTimeSlot {
    time: string;                 // "10:00"
    endTime?: string;             // "11:00"
    available: boolean;           // 予約可能かどうか
    selected: boolean;            // 選択状態
    capacity?: number;            // 定員
    reserved?: number;            // 予約済み人数
    reservationType: string;      // "1日券", "3日券", "週末券", "月間券"
    timeSlotId?: string;          // 時間帯ID
}

/**
 * パビリオン情報
 */
export interface PavilionData {
    id: string;                   // パビリオンID
    name: string;                 // パビリオン名
    description?: string;         // 説明
    isFavorite: boolean;          // お気に入り状態
    timeSlots: PavilionTimeSlot[]; // 時間帯一覧
    reservationStatus: string;    // 予約状況
    location?: string;            // 場所
    category?: string;            // カテゴリ
    imageUrl?: string;            // 画像URL
    tags?: string[];              // タグ
}

/**
 * 検索フィルター
 */
export interface SearchFilter {
    query: string;                // 検索クエリ
    showAvailableOnly: boolean;   // 空きのみ表示
    category?: string;            // カテゴリフィルター
    reservationType?: string;     // 予約種類フィルター
}

/**
 * 予約リクエスト
 */
export interface ReservationRequest {
    pavilionId: string;
    timeSlotId: string;
    ticketIds: string[];          // 選択チケット
    companions?: number;          // 同行者数
}

/**
 * 予約結果
 */
export interface ReservationResult {
    success: boolean;
    message: string;
    reservationId?: string;
    error?: string;
    details?: {
        pavilionName: string;
        timeSlot: string;
        ticketCount: number;
    };
}

/**
 * パビリオン統合管理システム
 */
export class PavilionManager {
    private pavilions: Map<string, PavilionData> = new Map();
    private selectedTimeSlots: Map<string, PavilionTimeSlot> = new Map();
    private searchFilter: SearchFilter = {
        query: '',
        showAvailableOnly: false
    };
    private favoriteIds: Set<string> = new Set();

    constructor() {
        this.loadFavoritesFromCache();
    }

    /**
     * 現在のページパラメータを取得（調査結果に基づく）
     */
    private getCurrentPageParams() {
        const urlParams = new URLSearchParams(window.location.search);
        return {
            ticketIds: urlParams.get('id')?.split(',') || [],
            lottery: urlParams.get('lottery') || '1',
            entranceDate: urlParams.get('entrance_date') || '',
            eventType: urlParams.get('event_type') || '0',
            screenId: urlParams.get('screen_id') || '108',
            priority: urlParams.get('priority'),
            keyword: urlParams.get('keyword') || '',
            reserveId: urlParams.get('reserve_id') || ''
        };
    }

    /**
     * パビリオン検索・取得
     */
    async searchPavilions(
        query: string = '', 
        ticketIds: string[] = [],
        entranceDate?: string
    ): Promise<PavilionData[]> {
        console.log(`🏛️ パビリオン検索: "${query}" (チケット: ${ticketIds.length}個)`);
        
        try {
            // 調査結果に基づくパビリオン検索API実装
            const params = this.getCurrentPageParams();
            const ticketIdsParam = ticketIds.map(id => `ticket_ids[]=${id}`).join('&');
            const eventNameParam = query ? `&event_name=${encodeURIComponent(query)}` : '';
            const entranceDateParam = `&entrance_date=${entranceDate || params.entranceDate}`;
            const paginationParam = `&count=1&limit=999&event_type=0&next_token=`;
            const apiUrl = `/api/d/events?${ticketIdsParam}${eventNameParam}${entranceDateParam}${paginationParam}&channel=${params.lottery}`;

            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log('🔍 パビリオン検索API応答:', data);

            const pavilions = this.parseSearchResults(data);
            
            // メモリに保存
            for (const pavilion of pavilions) {
                this.pavilions.set(pavilion.id, pavilion);
            }

            console.log(`✅ パビリオン検索完了: ${pavilions.length}個取得`);
            return pavilions;

        } catch (error) {
            console.error('❌ パビリオン検索エラー:', error);
            throw error;
        }
    }

    /**
     * 検索結果をパース
     */
    private parseSearchResults(data: any): PavilionData[] {
        const pavilions: PavilionData[] = [];
        
        try {
            if (data.results && Array.isArray(data.results)) {
                for (const item of data.results) {
                    const pavilion = this.parseEventItem(item);
                    if (pavilion) {
                        pavilions.push(pavilion);
                    }
                }
            }
        } catch (error) {
            console.error('❌ 検索結果パースエラー:', error);
        }

        return pavilions;
    }

    /**
     * イベント項目をパビリオンデータに変換
     */
    private parseEventItem(item: any): PavilionData | null {
        try {
            const pavilionId = item.event_code || item.id;
            if (!pavilionId) return null;

            const pavilion: PavilionData = {
                id: pavilionId,
                name: item.event_name || item.name || 'Unknown',
                description: item.description || '',
                isFavorite: this.favoriteIds.has(pavilionId),
                timeSlots: this.parseTimeSlots(item.time_slots || []),
                reservationStatus: this.determineReservationStatus(item),
                location: item.location || '',
                category: item.category || '',
                imageUrl: item.image_url || '',
                tags: item.tags || []
            };

            return pavilion;

        } catch (error) {
            console.error('❌ イベント項目パースエラー:', error);
            return null;
        }
    }

    /**
     * 時間帯データをパース
     */
    private parseTimeSlots(timeSlots: any[]): PavilionTimeSlot[] {
        return timeSlots.map(slot => {
            try {
                return {
                    time: slot.start_time || slot.time || '',
                    endTime: slot.end_time || '',
                    available: slot.available !== false && slot.status !== 'full',
                    selected: false,
                    capacity: slot.capacity || 0,
                    reserved: slot.reserved || 0,
                    reservationType: slot.reservation_type || '1日券',
                    timeSlotId: slot.id || slot.time_slot_id || ''
                };
            } catch (error) {
                console.warn('⚠️ 時間帯パースエラー:', error);
                return {
                    time: '',
                    available: false,
                    selected: false,
                    reservationType: '1日券'
                };
            }
        }).filter(slot => slot.time); // 有効な時間帯のみ
    }

    /**
     * 予約状況を判定
     */
    private determineReservationStatus(item: any): string {
        if (item.reservation_status) {
            return item.reservation_status;
        }
        
        // 時間帯の状況から判定
        const timeSlots = item.time_slots || [];
        const availableSlots = timeSlots.filter((slot: any) => slot.available !== false);
        
        if (availableSlots.length === 0) {
            return 'full';
        } else if (availableSlots.length < timeSlots.length / 2) {
            return 'limited';
        } else {
            return 'available';
        }
    }

    /**
     * お気に入りパビリオンを読み込み
     */
    async loadFavoritePavilions(): Promise<PavilionData[]> {
        console.log('⭐ お気に入りパビリオン読み込み');
        
        const favoriteIds = Array.from(this.favoriteIds);
        if (favoriteIds.length === 0) {
            console.log('⭐ お気に入りパビリオンはありません');
            return [];
        }

        try {
            // お気に入りIDでパビリオン詳細を取得
            const pavilions: PavilionData[] = [];
            
            for (const pavilionId of favoriteIds) {
                try {
                    const pavilion = await this.loadPavilionDetail(pavilionId);
                    if (pavilion) {
                        pavilion.isFavorite = true;
                        pavilions.push(pavilion);
                        this.pavilions.set(pavilionId, pavilion);
                    }
                } catch (error) {
                    console.warn(`⚠️ お気に入りパビリオン${pavilionId}の取得に失敗:`, error);
                }
            }

            console.log(`✅ お気に入りパビリオン: ${pavilions.length}個読み込み完了`);
            return pavilions;

        } catch (error) {
            console.error('❌ お気に入りパビリオン読み込みエラー:', error);
            return [];
        }
    }

    /**
     * パビリオン詳細情報を取得
     */
    private async loadPavilionDetail(pavilionId: string): Promise<PavilionData | null> {
        try {
            const response = await fetch(`/api/d/events/${pavilionId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-Api-Lang': 'ja',
                    'Accept-Language': 'ja'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`パビリオン詳細APIエラー: ${response.status}`);
            }

            const data = await response.json();
            return this.parseEventItem(data);

        } catch (error) {
            console.error(`❌ パビリオン詳細取得エラー (${pavilionId}):`, error);
            return null;
        }
    }

    /**
     * データを再取得
     */
    async refreshPavilionData(): Promise<PavilionData[]> {
        console.log('🔄 パビリオンデータ再取得');
        
        // 最後の検索条件で再検索
        return await this.searchPavilions(
            this.searchFilter.query,
            [], // チケットIDは外部から指定
            undefined // 入場日も外部から指定
        );
    }

    /**
     * 空き時間帯のみフィルター
     */
    filterAvailableOnly(pavilions: PavilionData[]): PavilionData[] {
        return pavilions.map(pavilion => {
            const availableTimeSlots = pavilion.timeSlots.filter(slot => slot.available);
            
            if (availableTimeSlots.length === 0) {
                // 空き時間帯がない場合は除外
                return null;
            }

            return {
                ...pavilion,
                timeSlots: availableTimeSlots
            };
        }).filter(pavilion => pavilion !== null) as PavilionData[];
    }

    /**
     * お気に入りに追加
     */
    addToFavorites(pavilionId: string, name: string): void {
        console.log(`⭐ お気に入り追加: ${name} (${pavilionId})`);
        
        this.favoriteIds.add(pavilionId);
        
        // パビリオンデータが存在する場合は更新
        const pavilion = this.pavilions.get(pavilionId);
        if (pavilion) {
            pavilion.isFavorite = true;
        }

        // キャッシュに保存
        this.saveFavoritesToCache();
    }

    /**
     * お気に入りから削除
     */
    removeFromFavorites(pavilionId: string): void {
        console.log(`⭐ お気に入り削除: ${pavilionId}`);
        
        this.favoriteIds.delete(pavilionId);
        
        // パビリオンデータが存在する場合は更新
        const pavilion = this.pavilions.get(pavilionId);
        if (pavilion) {
            pavilion.isFavorite = false;
        }

        // キャッシュに保存
        this.saveFavoritesToCache();
    }

    /**
     * 時間帯選択
     */
    selectTimeSlot(pavilionId: string, timeSlot: PavilionTimeSlot): void {
        console.log(`🕐 時間帯選択: ${pavilionId} - ${timeSlot.time}`);
        
        const key = `${pavilionId}:${timeSlot.time}`;
        
        // 既に選択済みの場合は選択解除
        if (this.selectedTimeSlots.has(key)) {
            this.selectedTimeSlots.delete(key);
            timeSlot.selected = false;
            console.log(`🕐 時間帯選択解除: ${pavilionId} - ${timeSlot.time}`);
        } else {
            // 新規選択
            this.selectedTimeSlots.set(key, { ...timeSlot, selected: true });
            timeSlot.selected = true;
        }
    }

    /**
     * 選択済み時間帯を取得
     */
    getSelectedTimeSlots(): Array<{ pavilionId: string; timeSlot: PavilionTimeSlot }> {
        const selected: Array<{ pavilionId: string; timeSlot: PavilionTimeSlot }> = [];
        
        for (const [key, timeSlot] of this.selectedTimeSlots) {
            const [pavilionId] = key.split(':');
            selected.push({ pavilionId, timeSlot });
        }

        return selected;
    }

    /**
     * パビリオン予約実行
     */
    async makeReservation(
        pavilionId: string, 
        timeSlot: PavilionTimeSlot,
        selectedTickets: TicketData[]
    ): Promise<ReservationResult> {
        console.log(`🎯 予約実行開始: ${pavilionId} - ${timeSlot.time}`);
        
        try {
            const pavilion = this.pavilions.get(pavilionId);
            if (!pavilion) {
                throw new Error('パビリオン情報が見つかりません');
            }

            if (selectedTickets.length === 0) {
                throw new Error('チケットが選択されていません');
            }

            // 予約リクエストを構築
            const request: ReservationRequest = {
                pavilionId: pavilionId,
                timeSlotId: timeSlot.timeSlotId || timeSlot.time,
                ticketIds: selectedTickets.map(t => t.id),
                companions: selectedTickets.length - 1
            };

            // 予約API実行
            const result = await this.executeReservationAPI(request);
            
            if (result.success) {
                // 成功時は選択状態をクリア
                this.clearSelectedTimeSlots();
                
                console.log(`✅ 予約成功: ${pavilion.name} - ${timeSlot.time}`);
            } else {
                console.log(`❌ 予約失敗: ${result.message}`);
            }

            return {
                ...result,
                details: {
                    pavilionName: pavilion.name,
                    timeSlot: timeSlot.time,
                    ticketCount: selectedTickets.length
                }
            };

        } catch (error) {
            console.error('❌ 予約実行エラー:', error);
            return {
                success: false,
                message: `予約に失敗しました: ${error}`,
                error: String(error)
            };
        }
    }

    /**
     * 予約API実行
     */
    private async executeReservationAPI(request: ReservationRequest): Promise<ReservationResult> {
        try {
            // 調査結果に基づく予約API実装
            const params = this.getCurrentPageParams();
            const reservationData = {
                ticket_ids: request.ticketIds,
                entrance_date: params.entranceDate,
                start_time: request.timeSlotId, // 時間帯ID（例：1000）
                event_code: request.pavilionId,
                registered_channel: params.lottery
            };

            // CSRFトークン取得
            const csrfToken = this.getCsrfToken();
            const headers: Record<string, string> = {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                'X-Api-Lang': 'ja',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            if (csrfToken) {
                headers['X-CSRF-TOKEN'] = csrfToken;
            }

            const response = await fetch('/api/d/user_event_reservations', {
                method: 'POST',
                headers,
                credentials: 'same-origin',
                body: JSON.stringify(reservationData)
            });

            if (!response.ok) {
                let errorBody = '';
                try {
                    errorBody = await response.text();
                } catch (e) {
                    // エラーレスポンス読み取り失敗は無視
                }
                throw new Error(`API Error: ${response.status} ${response.statusText}\n${errorBody}`);
            }

            const data = await response.json();
            
            return {
                success: true,
                message: '予約が完了しました',
                reservationId: data.reservation_id || data.id,
                details: {
                    pavilionName: request.pavilionId,
                    timeSlot: request.timeSlotId,
                    ticketCount: request.ticketIds.length
                }
            };

        } catch (error) {
            return {
                success: false,
                message: `予約に失敗しました: ${error}`,
                error: String(error)
            };
        }
    }

    /**
     * CSRFトークンを取得（調査結果に基づく）
     */
    private getCsrfToken(): string | null {
        // metaタグから取得
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            return csrfMeta.getAttribute('content');
        }
        
        // クッキーから取得
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'csrftoken' || name === '_token' || name === 'XSRF-TOKEN') {
                return decodeURIComponent(value);
            }
        }
        return null;
    }

    /**
     * 選択済み時間帯をクリア
     */
    clearSelectedTimeSlots(): void {
        this.selectedTimeSlots.clear();
        
        // パビリオンデータの選択状態もクリア
        for (const pavilion of this.pavilions.values()) {
            for (const timeSlot of pavilion.timeSlots) {
                timeSlot.selected = false;
            }
        }
        
        console.log('🧹 選択済み時間帯をクリア');
    }

    /**
     * 検索フィルターを更新
     */
    updateSearchFilter(filter: Partial<SearchFilter>): void {
        this.searchFilter = { ...this.searchFilter, ...filter };
        console.log('🔍 検索フィルター更新:', this.searchFilter);
    }

    /**
     * お気に入りをキャッシュから読み込み
     */
    private loadFavoritesFromCache(): void {
        try {
            const favorites = localStorage.getItem('expo_favorite_pavilions');
            if (favorites) {
                const data = JSON.parse(favorites);
                if (Array.isArray(data)) {
                    this.favoriteIds = new Set(data);
                    console.log(`💾 お気に入り読み込み: ${this.favoriteIds.size}個`);
                }
            }
        } catch (error) {
            console.error('❌ お気に入り読み込みエラー:', error);
        }
    }

    /**
     * お気に入りをキャッシュに保存
     */
    private saveFavoritesToCache(): void {
        try {
            const favorites = Array.from(this.favoriteIds);
            localStorage.setItem('expo_favorite_pavilions', JSON.stringify(favorites));
            console.log(`💾 お気に入り保存: ${favorites.length}個`);
        } catch (error) {
            console.error('❌ お気に入り保存エラー:', error);
        }
    }

    /**
     * 現在のデータ状況を取得
     */
    getStatus(): {
        pavilionCount: number;
        selectedCount: number;
        favoriteCount: number;
    } {
        return {
            pavilionCount: this.pavilions.size,
            selectedCount: this.selectedTimeSlots.size,
            favoriteCount: this.favoriteIds.size
        };
    }
}

/**
 * グローバルパビリオンマネージャーインスタンス
 */
let globalPavilionManager: PavilionManager | null = null;

/**
 * パビリオンマネージャーを初期化・取得
 */
export function getPavilionManager(): PavilionManager {
    if (!globalPavilionManager) {
        globalPavilionManager = new PavilionManager();
    }
    return globalPavilionManager;
}