// 閾値を定義した定数をインポート
import { URGENT_THRESHOLD_DAYS, NEW_EVENT_THRESHOLD_DAYS } from './constants.js';

/**
 * 指定されたイベントが「緊急」かどうかを判定する
 * 
 * 緊急とは、イベントの残り日数が URGENT_THRESHOLD_DAYS 未満である場合を指す。
 * @param {Object} event - イベントオブジェクト
 * @returns {boolean} - 緊急なら true、そうでなければ false
 */
export function isUrgent(event) {
  // date_remain が数値かつ閾値より小さいかをチェック
  return typeof event.date_remain === 'number' && event.date_remain < URGENT_THRESHOLD_DAYS;
}

/**
 * 指定されたイベントが「新着」かどうかを判定する
 * 
 * 新着とは、最終更新日（event.update）が現在日時から NEW_EVENT_THRESHOLD_DAYS 日以内である場合を指す。
 * @param {Object} event - イベントオブジェクト
 * @returns {boolean} - 新着なら true、そうでなければ false
 */
export function isNew(event) {
  // update プロパティが存在しなければ新着とはみなさない
  if (!event.update) return false;

  // update を Date オブジェクトに変換
  const updatedDate = new Date(event.update);

  // 現在日時との差分（日数）を算出
  const now = Date.now();
  const diffDays = (now - updatedDate.getTime()) / (1000 * 60 * 60 * 24);

  // 差分が閾値以内なら新着と判定
  return diffDays <= NEW_EVENT_THRESHOLD_DAYS;
}
