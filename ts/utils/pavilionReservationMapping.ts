/**
 * パビリオン予約種類のマッピング定義
 */

export interface PavilionReservationTypeInfo {
  channel: string;    // '5', '4', '3', '2'
  shortName: string;  // '1', '3', '週', '月'
  longName: string;   // '当日', '3日前', '7日前', '2か月前'
}

// パビリオン予約種類マッピング辞書
export const PAVILION_RESERVATION_TYPES: { [key: string]: PavilionReservationTypeInfo } = {
  '5': {
    channel: '5',
    shortName: '1',
    longName: '当日'
  },
  '4': {
    channel: '4',
    shortName: '3',
    longName: '3日前'
  },
  '3': {
    channel: '3',
    shortName: '週',
    longName: '7日前'
  },
  '2': {
    channel: '2',
    shortName: '月',
    longName: '2か月前'
  }
}

// reverse mapping: shortName -> channel
export const SHORT_NAME_TO_CHANNEL: { [key: string]: string } = {
  '1': '5',
  '3': '4',
  '週': '3',
  '月': '2'
}

/**
 * channelからshortNameを取得
 */
export function getShortNameFromChannel(channel: string): string {
  return PAVILION_RESERVATION_TYPES[channel]?.shortName || channel
}

/**
 * channelからlongNameを取得
 */
export function getLongNameFromChannel(channel: string): string {
  return PAVILION_RESERVATION_TYPES[channel]?.longName || channel
}

/**
 * shortNameからchannelを取得
 */
export function getChannelFromShortName(shortName: string): string {
  return SHORT_NAME_TO_CHANNEL[shortName] || shortName
}

/**
 * shortNameからlongNameを取得
 */
export function getLongNameFromShortName(shortName: string): string {
  const channel = getChannelFromShortName(shortName)
  return getLongNameFromChannel(channel)
}

/**
 * channelから完全な情報を取得
 */
export function getPavilionReservationTypeInfo(channel: string): PavilionReservationTypeInfo | null {
  return PAVILION_RESERVATION_TYPES[channel] || null
}

/**
 * 全ての予約種類情報を取得
 */
export function getAllPavilionReservationTypes(): PavilionReservationTypeInfo[] {
  return Object.values(PAVILION_RESERVATION_TYPES)
}