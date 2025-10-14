/**
 * チケット種別判定ユーティリティ
 */

import type { TicketData } from '../types/api'

/**
 * 通期パスかどうかを判定
 * @param ticket チケットデータ
 * @returns 通期パスの場合true
 */
export function isSeasonPass(ticket: TicketData): boolean {
  return ticket.label === '通期パス'
}

/**
 * 指定したチケットタイプかどうかを判定
 * @param ticket チケットデータ
 * @param ticketType チケットタイプ
 * @returns 指定したタイプの場合true
 */
export function isTicketType(ticket: TicketData, ticketType: string): boolean {
  return ticket.label === ticketType
}