/**
 * API・データ型定義（現行システムから継承・Vue対応版）
 */

// 現行システムから継承
export interface ScheduleData {
    user_visiting_reservation_id?: number; // 予約ID（新規予約時は-1）
    entrance_date: string;      // 入場日（YYYYMMDD形式）
    use_state: number;          // 利用状態（0:未使用, 1:入場済み, 2:使用済み等）
    gate_type?: number;         // ゲート種別（1:東, 2:西）
    schedule_name?: string;     // スケジュール名
    isEffective?: boolean;      // 有効フラグ（処理時に付与）
    time_start?: string;        // 開始時間
    time_end?: string;          // 終了時間
    reservation_type?: string;  // 予約種別
    selected?: boolean;         // UI選択状態フラグ
    location_index?: number;    // 東西情報（0:東, 1:西）
    
    // パビリオン予約種類情報（入場予約種類ごとに決定）
    pavilionReservationType?: string;  // channel値 (5,4,3,2 -> 1,3,週,月)
    pavilionReservationActive?: boolean; // 現在有効かどうか
    
    // パビリオン予約区分ごとの詳細状況
    pavilionReservationStatus?: {
        [key: string]: {  // '月', '週', '3', '1'
            periodStatus: 'before' | 'active' | 'expired';  // 期限前、期間中、期限切れ
            submissionStatus: 'none' | 'submitted' | 'won';  // なし(落選含む)、提出済み、当選
            winningInfo?: any;  // 当選情報（詳細は後ほど）
        }
    }
    
    // パビリオン予約情報
    pavilionReservationInfo?: any;
}

export interface LotteryCalendarData {
    availableSlots?: string[];
    status?: string;
    lottery_type?: string;
    registration_period?: {
        start: string;
        end: string;
    };
}

export interface TicketData {
    ticket_id: string;          // 公式チケットID
    item_name?: string;         // チケット名（Season Pass等）
    isOwn: boolean;             // 自分のチケットかどうか
    label?: string;             // チケットラベル
    schedules?: ScheduleData[]; // 入場予約情報
}

export interface TimeSlotData {
    time: string;                 // "10:00"
    endTime?: string;             // "11:00"
    available: boolean;           // 予約可能かどうか
    selected: boolean;            // 選択状態
    capacity?: number;            // 定員
    reserved?: number;            // 予約済み人数
    reservationType: string;      // "normal", "lottery", "priority"
    timeSlotId?: string;          // 時間帯ID
    availabilityStatus?: 'available' | 'limited' | 'full';  // 空き状況: 空きあり、残りわずか、満員
    unavailableReason?: number;   // APIから取得した空き状況コード
}

// 後方互換性のため
export type PavilionTimeSlot = TimeSlotData;

export interface PavilionData {
    id: string;                   // パビリオンID
    name: string;                 // パビリオン名
    description?: string;         // 説明
    isFavorite: boolean;          // お気に入り状態
    timeSlots: TimeSlotData[]; // 時間帯一覧
    reservationStatus: string;    // 予約状況
    location?: string;            // 場所
    category?: string;            // カテゴリ
    imageUrl?: string;            // 画像URL
    tags?: string[];              // タグ
    dateStatus?: number;          // パビリオン全体の予約状況（2=満員）
}

// Vue固有の型定義
export interface TimeSlotSelection {
    pavilionId: string;
    pavilionName: string;
    timeSlot: TimeSlotData;
    entranceDate: string;
}

export interface ReservationResult {
    success: boolean;
    message: string;
    data?: any;
    reservationId?: string;
    error?: string;
    failureReason?: '満席' | '無効' | 'その他';
    details?: {
        pavilionName: string;
        timeSlot: string;
        ticketCount: number;
    };
}

// マネージャー型定義（現行システムからの継承）
export interface TicketManagerInterface {
    loadAllTickets(): Promise<TicketData[]>;
    getAllTickets(): TicketData[];
    getSelectedTickets(): TicketData[];
    addTicket(ticketId: string, label?: string, isExternal?: boolean): Promise<void>;
    selectTicket(ticketId: string, selected: boolean): void;
}

export interface PavilionManagerInterface {
    searchPavilions(query: string, ticketIds?: string[], entranceDate?: string): Promise<PavilionData[]>;
    refreshPavilionData(): Promise<PavilionData[]>;
    loadFavoritePavilions?(): Promise<PavilionData[]>;
    selectTimeSlot(pavilionId: string, timeSlot: TimeSlotData): void;
    clearSelectedTimeSlots(): void;
    executeReservation(pavilionId: string, timeSlot: TimeSlotData, entranceDate: string, registeredChannel: string): Promise<ReservationResult>;
    addToFavorites?(pavilionId: string, name: string): void;
    removeFromFavorites?(pavilionId: string): void;
}