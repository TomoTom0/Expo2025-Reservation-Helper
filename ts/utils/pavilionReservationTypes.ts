/**
 * パビリオン予約種類・有効期間判定ユーティリティ
 */

import { getShortNameFromChannel, getLongNameFromChannel } from './pavilionReservationMapping'

export interface PavilionReservationType {
  type: string;        // '1', '3', '週', '月'
  channel: string;     // '5', '4', '3', '2'
  isActive: boolean;   // 現在有効かどうか
}

export interface PavilionReservationAllStatus {
  [key: string]: {  // '月', '週', '3', '1'
    type: string;
    channel: string;
    periodStatus: 'before' | 'active' | 'expired';
    submissionStatus: 'none' | 'submitted' | 'won';
    winningInfo?: any;
  }
}

/**
 * 入場日付に基づいてパビリオン予約種類を判定
 * doc/design/main-dialog.mdの情報に基づく
 * 
 * 2か月前予約 (月): 3か月前 - 2か月と1日前23:59
 * 7日前予約 (週): 1か月前 - 8日前23:59
 * 3日前予約 (3): 3日前0時 - 1日前9時
 * 当日予約 (1): 当日
 */
export function determinePavilionReservationType(entranceDate: string): PavilionReservationType {
  const now = new Date()
  const entrance = parseEntranceDate(entranceDate)
  
  // 現在時刻から各予約期間の開始・終了時刻を計算
  const reservationPeriods = calculateReservationPeriods(entrance, now)
  
  // 現在有効な予約種類を判定
  const activeType = findActiveReservationType(reservationPeriods, now)
  
  if (activeType) {
    return activeType
  }
  
  // 有効な予約種類がない場合、直後に有効となる種類を取得
  const nextActiveType = findNextActiveReservationType(reservationPeriods, now)
  
  return nextActiveType || {
    type: '1',
    channel: '5', 
    isActive: false
  }
}

/**
 * 入場日付に基づいて全ての予約区分の状況を取得
 */
export function getAllPavilionReservationStatus(entranceDate: string): PavilionReservationAllStatus {
  const now = new Date()
  const entrance = parseEntranceDate(entranceDate)
  
  // 現在時刻から各予約期間の開始・終了時刻を計算
  const reservationPeriods = calculateReservationPeriods(entrance, now)
  
  const allStatus: PavilionReservationAllStatus = {}
  
  for (const period of reservationPeriods) {
    let periodStatus: 'before' | 'active' | 'expired'
    
    if (now < period.start) {
      periodStatus = 'before'
    } else if (now >= period.start && now <= period.end) {
      periodStatus = 'active'
    } else {
      periodStatus = 'expired'
    }
    
    allStatus[period.type] = {
      type: period.type,
      channel: period.channel,
      periodStatus,
      submissionStatus: 'none', // 後でAPI取得により更新
      winningInfo: undefined
    }
  }
  
  return allStatus
}

/**
 * 入場日付文字列をDateオブジェクトに変換
 */
function parseEntranceDate(entranceDate: string): Date {
  // YYYYMMDD形式を想定
  if (/^\d{8}$/.test(entranceDate)) {
    const year = parseInt(entranceDate.substring(0, 4))
    const month = parseInt(entranceDate.substring(4, 6)) - 1 // monthは0ベース
    const day = parseInt(entranceDate.substring(6, 8))
    return new Date(year, month, day)
  }
  
  // その他の形式もサポート
  return new Date(entranceDate)
}

/**
 * 各予約種類の有効期間を計算
 */
function calculateReservationPeriods(entrance: Date, now: Date) {
  const periods = []
  
  // 2か月前予約 (月): 3か月前 - 2か月と1日前23:59
  const monthStart = new Date(entrance)
  monthStart.setMonth(monthStart.getMonth() - 3)
  const monthEnd = new Date(entrance)
  monthEnd.setMonth(monthEnd.getMonth() - 2)
  monthEnd.setDate(monthEnd.getDate() - 1)
  monthEnd.setHours(23, 59, 59, 999)
  
  periods.push({
    type: getShortNameFromChannel('2'), // '月'
    channel: '2',
    start: monthStart,
    end: monthEnd,
    isActive: now >= monthStart && now <= monthEnd
  })
  
  // 7日前予約 (週): 1か月前 - 8日前23:59
  const weekStart = new Date(entrance)
  weekStart.setMonth(weekStart.getMonth() - 1)
  const weekEnd = new Date(entrance)
  weekEnd.setDate(weekEnd.getDate() - 8)
  weekEnd.setHours(23, 59, 59, 999)
  
  periods.push({
    type: getShortNameFromChannel('3'), // '週'
    channel: '3',
    start: weekStart,
    end: weekEnd,
    isActive: now >= weekStart && now <= weekEnd
  })
  
  // 3日前予約 (3): 3日前0時 - 1日前9時
  const threeDayStart = new Date(entrance)
  threeDayStart.setDate(threeDayStart.getDate() - 3)
  threeDayStart.setHours(0, 0, 0, 0)
  const threeDayEnd = new Date(entrance)
  threeDayEnd.setDate(threeDayEnd.getDate() - 1)
  threeDayEnd.setHours(9, 0, 0, 0)
  
  periods.push({
    type: getShortNameFromChannel('4'), // '3'
    channel: '4',
    start: threeDayStart,
    end: threeDayEnd,
    isActive: now >= threeDayStart && now <= threeDayEnd
  })
  
  // 当日予約 (1): 当日
  const todayStart = new Date(entrance)
  todayStart.setHours(0, 0, 0, 0)
  const todayEnd = new Date(entrance)
  todayEnd.setHours(23, 59, 59, 999)
  
  periods.push({
    type: getShortNameFromChannel('5'), // '1'
    channel: '5',
    start: todayStart,
    end: todayEnd,
    isActive: now >= todayStart && now <= todayEnd
  })
  
  return periods
}

/**
 * 現在有効な予約種類を探す
 */
function findActiveReservationType(periods: any[], now: Date): PavilionReservationType | null {
  for (const period of periods) {
    if (period.isActive) {
      return {
        type: period.type,
        channel: period.channel,
        isActive: true
      }
    }
  }
  return null
}

/**
 * 直後に有効となる予約種類を探す
 */
function findNextActiveReservationType(periods: any[], now: Date): PavilionReservationType | null {
  // 現在時刻以降に開始する期間を探す
  const futurePeriods = periods
    .filter(period => period.start > now)
    .sort((a, b) => a.start.getTime() - b.start.getTime())
  
  if (futurePeriods.length > 0) {
    const next = futurePeriods[0]
    return {
      type: next.type,
      channel: next.channel,
      isActive: false
    }
  }
  
  return null
}