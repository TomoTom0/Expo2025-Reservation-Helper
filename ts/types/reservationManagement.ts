/**
 * 予約ID管理システムの型定義
 */

export interface ReservationManagementData {
  /** チケットID */
  ticketId: string
  /** UI選択状態 */
  isSelected: boolean
  /** ロック状態（変更予約を無効化） */
  isLocked: boolean
  /** ユーザー設定ラベル */
  userLabel: string
  /** 入場日 */
  entranceDate: string
  /** 予約種別 */
  reservationType?: string
  /** 新規予約枠フラグ（通期パスの空き枠） */
  isNewReservationSlot?: boolean
  /** 作成日時 */
  createdAt: number
  /** 最終更新日時 */
  updatedAt: number
}

export interface ReservationManagementStore {
  /** 予約ID -> 管理データ のマッピング */
  reservations: Map<string, ReservationManagementData>
}

export interface ReservationManagementActions {
  /** 予約管理データを設定/更新 */
  setReservationManagement(reservationId: string, data: Partial<ReservationManagementData>): void
  
  /** 予約管理データを取得 */
  getReservationManagement(reservationId: string): ReservationManagementData | undefined
  
  /** チケットIDから関連する予約管理データを取得 */
  getReservationsByTicketId(ticketId: string): ReservationManagementData[]
  
  /** 選択状態を切り替え */
  toggleSelection(reservationId: string): void
  
  /** ロック状態を切り替え */
  toggleLock(reservationId: string): void
  
  /** ラベルを更新 */
  updateLabel(reservationId: string, label: string): void
  
  /** 選択された予約IDのリストを取得 */
  getSelectedReservationIds(): string[]
  
  /** ロックされた予約IDのリストを取得 */
  getLockedReservationIds(): string[]
  
  /** 予約管理データを削除 */
  removeReservationManagement(reservationId: string): void
  
  /** すべての予約管理データをクリア */
  clearAllReservationManagement(): void
}