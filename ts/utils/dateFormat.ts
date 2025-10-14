/**
 * 日付フォーマット用ユーティリティ関数
 */

/**
 * 日付を表示用形式（M月D日）でフォーマット
 * @param date - フォーマットする日付
 * @returns MM月DD日形式の文字列
 */
export const formatDateForDisplay = (date: Date): string => {
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

/**
 * 日付を表示用形式（M/D）でフォーマット
 * @param date - フォーマットする日付
 * @returns MM/DD形式の文字列
 */
export const formatDateSlash = (date: Date): string => {
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}