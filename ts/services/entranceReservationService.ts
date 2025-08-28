/**
 * 入場予約API統合サービス
 * verified-api-analysis.mdの実証結果を基に実装
 */

import { loggers } from '@/utils/logger'

const logger = loggers.entranceReservation

export interface EntranceScheduleData {
  year: string
  month: string
  states: {
    [date: string]: {
      [gate: string]: {
        [time: string]: {
          schedule_name: string
          time_state: number  // 0:空き, 1:残り少ない, 2:満席, 4:利用不可
        }
      }
      date_state: number  // 1:通常営業, 2:特別状態
    }
  }
}

export interface UserReservationData {
  user_visiting_reservation_id: number
  use_state: number              // 0:未使用, 1:使用済み
  entrance_date: string          // YYYYMMDD形式
  gate_type: number              // 1:東, 2:西
  schedule_name: string          // 時間帯（例: "11:00-"）
}

export interface TicketData {
  ticket_id: string
  item_name: string
  schedules: UserReservationData[]
}

/**
 * 入場予約スケジュール取得（月単位）
 * GET /api/d/schedules/{year}/{month}
 */
export async function getEntranceSchedules(
  year: number, 
  month: number, 
  ticketIds?: string[]
): Promise<EntranceScheduleData> {
  logger.info('入場スケジュール取得開始', { year, month, ticketIds: ticketIds?.length })
  
  let url = `/api/d/schedules/${year}/${month}`
  
  // ticket_ids[]パラメータ追加（実証結果では効果なしだが、仕様通り実装）
  if (ticketIds && ticketIds.length > 0) {
    const params = new URLSearchParams()
    ticketIds.forEach(id => params.append('ticket_ids[]', id))
    url += `?${params.toString()}`
  }
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'X-Api-Lang': 'ja'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    logger.info('入場スケジュール取得完了', { 
      year, 
      month, 
      dataSize: JSON.stringify(data).length,
      datesCount: Object.keys(data.states || {}).length 
    })
    
    return data
  } catch (error) {
    logger.error('入場スケジュール取得エラー', { year, month, error })
    throw error
  }
}

/**
 * 既存入場予約取得
 * GET /api/d/my/tickets/?count=1
 */
export async function getUserReservations(): Promise<TicketData[]> {
  logger.info('ユーザー入場予約取得開始')
  
  try {
    const response = await fetch('/api/d/my/tickets/?count=1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'X-Api-Lang': 'ja'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    logger.info('ユーザー入場予約取得完了', { 
      ticketsCount: data.list?.length || 0,
      totalReservations: data.list?.reduce((sum: number, ticket: any) => 
        sum + (ticket.schedules?.length || 0), 0) || 0
    })
    
    return data.list || []
  } catch (error) {
    logger.error('ユーザー入場予約取得エラー', error)
    throw error
  }
}

/**
 * 入場予約作成
 * POST /api/d/user_visiting_reservations
 */
export async function createReservation(params: {
  ticket_ids: string[]
  start_time: string     // HHMM形式
  gate_type: string      // "1":東, "2":西
  entrance_date: string  // YYYYMMDD形式
}): Promise<{ user_visiting_reservation_ids: number[] }> {
  logger.info('入場予約作成開始', params)
  
  try {
    const response = await fetch('/api/d/user_visiting_reservations', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'X-Api-Lang': 'ja'
      },
      credentials: 'include',
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    logger.info('入場予約作成完了', { 
      ...params,
      reservationIds: data.user_visiting_reservation_ids 
    })
    
    return data
  } catch (error) {
    logger.error('入場予約作成エラー', { params, error })
    throw error
  }
}

/**
 * 入場予約変更申請
 * PUT /api/d/user_visiting_reservations
 */
export async function updateReservation(params: {
  user_visiting_reservation_ids: number[]
  start_time: string     // HHMM形式
  gate_type: string      // "1":東, "2":西
  entrance_date: string  // YYYYMMDD形式
}): Promise<{ doing: boolean }> {
  logger.info('入場予約変更申請開始', params)
  
  try {
    const response = await fetch('/api/d/user_visiting_reservations', {
      method: 'PUT',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'X-Api-Lang': 'ja'
      },
      credentials: 'include',
      body: JSON.stringify(params)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    logger.info('入場予約変更申請完了', { 
      ...params,
      doing: data.doing 
    })
    
    return data
  } catch (error) {
    logger.error('入場予約変更申請エラー', { params, error })
    throw error
  }
}

/**
 * 入場予約削除
 * DELETE /api/d/user_visiting_reservations/{id}
 */
export async function deleteReservation(reservationId: number): Promise<{ doing: boolean }> {
  logger.info('入場予約削除開始', { reservationId })
  
  try {
    const response = await fetch(`/api/d/user_visiting_reservations/${reservationId}`, {
      method: 'DELETE',
      headers: {
        'Accept': 'application/json',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'X-Api-Lang': 'ja'
      },
      credentials: 'include'
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`API Error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`)
    }

    const data = await response.json()
    logger.info('入場予約削除完了', { 
      reservationId,
      doing: data.doing 
    })
    
    return data
  } catch (error) {
    logger.error('入場予約削除エラー', { reservationId, error })
    throw error
  }
}

/**
 * 予約可能性バリデーション
 * POST /api/d/user_visiting_reservations (validate_only: 1)
 */
export async function validateReservation(ticketIds: string[]): Promise<boolean> {
  logger.info('予約可能性バリデーション開始', { ticketIds })
  
  try {
    const response = await fetch('/api/d/user_visiting_reservations', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'ja,en-US;q=0.9,en;q=0.8',
        'X-Api-Lang': 'ja'
      },
      credentials: 'include',
      body: JSON.stringify({
        ticket_ids: ticketIds,
        validate_only: 1
      })
    })

    const isValid = response.ok
    logger.info('予約可能性バリデーション完了', { 
      ticketIds,
      isValid,
      status: response.status 
    })
    
    return isValid
  } catch (error) {
    logger.error('予約可能性バリデーションエラー', { ticketIds, error })
    return false
  }
}

/**
 * 時間帯状態の解釈
 */
export function getTimeStateDescription(timeState: number): string {
  switch (timeState) {
    case 0: return '空きあり'
    case 1: return '残り少ない'
    case 2: return '満席'
    case 4: return '利用不可'
    default: return '不明'
  }
}

/**
 * 時間帯状態のCSS状態クラス
 */
export function getTimeStateClass(timeState: number): string {
  switch (timeState) {
    case 0: return 'low'     // 薄い青
    case 1: return 'high'    // 橙
    case 2: return 'full'    // 赤
    case 4: return 'disabled'// グレー
    default: return 'unknown'
  }
}