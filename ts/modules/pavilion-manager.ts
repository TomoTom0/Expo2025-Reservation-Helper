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
    dateStatus?: number;          // パビリオン全体の予約状況（2=満員）
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
     * 公式API仕様に従ってAPIのURLを構築
     */
    private buildAPIUrl(query: string, ticketIds: string[], entranceDate?: string): string {
        // デフォルト値の設定
        const defaultEntranceDate = entranceDate || new Date(Date.now() + 24 * 60 * 60 * 1000)
            .toISOString().slice(0, 10).replace(/-/g, ''); // 明日の日付
        const defaultChannel = '4'; // fastタイプ
        
        // URLパラメータを構築
        const ticketIdsParam = ticketIds.length > 0 ? 
            ticketIds.map(id => `ticket_ids[]=${id}`).join('&') : '';
        const eventNameParam = query ? `&event_name=${encodeURIComponent(query)}` : '';
        const entranceDateParam = `&entrance_date=${defaultEntranceDate}`;
        const paginationParam = `&count=1&limit=999&event_type=0&next_token=`;
        const channelParam = `&channel=${defaultChannel}`;
        
        return `/api/d/events?${ticketIdsParam}${eventNameParam}${entranceDateParam}${paginationParam}${channelParam}`;
    }


    /**
     * 検索結果をパース（ref/index.jsから復元）
     */
    private parseSearchResults(data: any): PavilionData[] {
        const pavilions: PavilionData[] = [];
        
        try {
            if (data.list && Array.isArray(data.list)) {
                for (const item of data.list) {
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
     * イベント項目をパビリオンデータに変換（ref/index.jsから復元）
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
                tags: item.tags || [],
                dateStatus: item.date_status // パビリオン単位の満員判定用
            };


            return pavilion;
        } catch (error) {
            console.error('❌ イベント項目パースエラー:', error);
            return null;
        }
    }

    /**
     * 時間帯データをパース（ref/index.jsから復元）
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
                    endTime: '',
                    available: false,
                    selected: false,
                    reservationType: '1日券'
                };
            }
        }).filter(slot => slot.time); // 有効な時間帯のみ
    }

    /**
     * 予約状況を判定（ref/index.jsから復元）
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
     * パビリオン検索・取得
     */
    async searchPavilions(
        query: string = '', 
        ticketIds: string[] = [],
        entranceDate?: string
    ): Promise<PavilionData[]> {
        console.log(`🏛️ パビリオン検索: "${query}" (チケット: ${ticketIds.length}個)`);
        console.log(`🔍 検索チケットIDs:`, ticketIds);
        
        try {
            // 公式API仕様に従ってURLパラメータを構築
            const apiUrl = this.buildAPIUrl(query, ticketIds, entranceDate);
            console.log(`🔍 APIエンドポイント:`, apiUrl);
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
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
            // timeSlot.selected = false; // パラメータの直接変更を削除
            console.log(`🕐 時間帯選択解除: ${pavilionId} - ${timeSlot.time}`);
        } else {
            // 新規選択
            this.selectedTimeSlots.set(key, { ...timeSlot, selected: true });
            // timeSlot.selected = true; // パラメータの直接変更を削除
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
        selectedTickets: TicketData[],
        entranceDate: string,
        registeredChannel: string
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
            const timeSlotForAPI = timeSlot.timeSlotId || timeSlot.time;
            console.log('🔍 時間帯データ確認:', { timeSlot, timeSlotForAPI });
            
            const request: ReservationRequest = {
                pavilionId: pavilionId,
                timeSlotId: timeSlotForAPI,
                ticketIds: selectedTickets.map(t => t.ticket_id)
            };

            // 予約API実行
            const result = await this.executeReservationAPI(request, entranceDate, registeredChannel);
            
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
    private async executeReservationAPI(
        request: ReservationRequest, 
        entranceDate: string, 
        registeredChannel: string
    ): Promise<ReservationResult> {
        try {
            const reservationData = {
                ticket_ids: request.ticketIds,
                entrance_date: entranceDate,
                start_time: request.timeSlotId,
                event_code: request.pavilionId,
                registered_channel: registeredChannel
            };

            console.log('🔍 予約APIリクエストデータ:', reservationData);
            console.log('🔍 JSON文字列:', JSON.stringify(reservationData));
            console.log('🔍 request元データ:', request);

            // CSRFトークンを取得
            const getCsrfToken = () => {
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
            };

            const csrfToken = getCsrfToken();
            console.log('🔐 CSRFトークン:', csrfToken);

            const headers: Record<string, string> = {
                'Accept': 'application/json, text/plain, */*',
                'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                'X-Api-Lang': 'ja',
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };

            // CSRFトークンがあれば追加（現在は常にnullのためスキップ）
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
                const errorData = await response.json().catch(() => ({}));
                console.log('🔍 エラーレスポンス詳細:', errorData);
                
                // 422はビジネスロジックエラー（満席、無効な選択等）
                if (response.status === 422 && errorData.error) {
                    const errorName = errorData.error.name || '';
                    
                    // 既知のエラータイプを日本語に変換
                    if (errorName === 'schedule_out_of_stock') {
                        throw new Error('満席');
                    } else if (errorName === 'select_ticket_valid_error') {
                        throw new Error('無効');
                    } else {
                        // その他の場合は英語でそのまま表示
                        throw new Error(errorName || '予約エラー');
                    }
                }
                
                throw new Error(errorData.message || `API Error: ${response.status}`);
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
     * 全パビリオンデータを取得
     */
    getAllPavilions(): PavilionData[] {
        return Array.from(this.pavilions.values());
    }

    /**
     * パビリオンの時間帯情報を取得
     */
    async getPavilionTimeSlots(eventCode: string, ticketIds: string[] = [], entranceDate?: string): Promise<PavilionTimeSlot[]> {
        try {
            // パビリオン詳細APIで時間帯情報を取得
            const ticketIdsParam = ticketIds.length > 0 ? 
                ticketIds.map(id => `ticket_ids[]=${id}`).join('&') : '';
            const entranceDateParam = entranceDate ? `&entrance_date=${entranceDate}` : '';
            const channelParam = `&channel=4`;
            
            const apiUrl = `/api/d/events/${eventCode}?${ticketIdsParam}${entranceDateParam}${channelParam}`;
            
            const response = await fetch(apiUrl, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8,zh-TW;q=0.7,zh;q=0.6',
                    'X-Api-Lang': 'ja',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                credentials: 'include'
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            console.log(`🕐 パビリオン${eventCode}時間帯取得:`, data);
            console.log(`🔍 time_slots確認:`, data.time_slots);
            console.log(`🔍 event_schedules確認:`, data.event_schedules);
            console.log(`🔍 data全体のキー:`, Object.keys(data));

            // event_schedulesオブジェクトから時間帯情報を抽出
            const timeSlots: PavilionTimeSlot[] = [];
            if (data.event_schedules && typeof data.event_schedules === 'object') {
                for (const [time, schedule] of Object.entries(data.event_schedules)) {
                    const scheduleData = schedule as any;
                    
                    // time_statusで空き状況を判定（2=満席、1=空きあり等を想定）
                    const isAvailable = scheduleData.time_status !== 2;
                    
                    timeSlots.push({
                        time: time, // キーが時間（例：1040, 1100）
                        endTime: scheduleData.end_time || '',
                        available: isAvailable,
                        selected: false,
                        capacity: scheduleData.capacity || 0,
                        reserved: scheduleData.reserved || 0,
                        reservationType: scheduleData.reservation_type || '1日券',
                        timeSlotId: scheduleData.schedule_code || time
                    });
                }
            }

            console.log(`✅ パビリオン${eventCode}時間帯取得完了: ${timeSlots.length}件`);
            return timeSlots;

        } catch (error) {
            console.error(`❌ パビリオン${eventCode}時間帯取得エラー:`, error);
            return [];
        }
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