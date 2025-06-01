// イベントの「新着」「緊急」しきい値を定義した定数
import { URGENT_THRESHOLD_DAYS, NEW_EVENT_THRESHOLD_DAYS } from './constants.js';

// イベントが「新着」か「緊急」かを判定するユーティリティ関数
import { isUrgent, isNew } from './eventStatus.js';

/**
 * イベント目次全体を格納する <nav> 要素を生成する。
 * - class名 `event-index` を持つナビゲーション領域を構築。
 * - 子要素として <div> を内包し、そこに目次リンクを挿入していく前提。
 *
 * @returns {HTMLElement} nav 要素
 */
// renderHelpers.js の createEventIndex
export function createEventIndex() {
  const details = document.createElement('details');
  const summary = document.createElement('summary');
  summary.textContent = '📑 Event Index';
  summary.style.cursor = 'pointer';

  const nav = document.createElement('nav');
  details.appendChild(summary);
  details.appendChild(nav);

  return { wrapper: details, nav }; // ← nav を明示的に返す
}

/**
 * イベント目次リンクを生成して、指定されたコンテナに追加する。
 * - 複数イベントがある場合、リンク間に区切り線（全角縦棒）を挿入。
 *
 * @param {HTMLElement} indexContainer - 目次を格納する親要素
 * @param {Object} event - イベントオブジェクト（title, date, venueなど）
 * @param {string} eventId - DOM上でのアンカーID
 * @param {number} index - イベントの表示順序
 */
export function createEventIndexLink(indexContainer, event, eventId, index) {
  const fragment = document.createDocumentFragment();

  // 2つ目以降のリンクには区切り線を挿入
  if (index > 0) {
    fragment.appendChild(document.createTextNode(' ｜ '));
  }

  // イベントのアンカーリンクを生成し、フラグメントに追加
  const link = buildEventLink(event, eventId);
  fragment.appendChild(link);

  // 完成したリンク要素をコンテナに追加
  indexContainer.appendChild(fragment);
}

/**
 * 単一のイベントリンク（<a>要素）を生成する。
 * - href 属性に該当イベントのアンカーIDを指定。
 * - データ属性としてイベント情報をJSON文字列で格納。
 * - 「緊急」なら⚠️マークを挿入。
 * - 「新着」なら✨マークを先頭に付ける。
 *
 * @param {Object} event - イベントオブジェクト（title, date_remain, update などを含む）
 * @param {string} eventId - 対象のDOMアンカーID
 * @returns {HTMLElement} a 要素
 */
function buildEventLink(event, eventId) {
  const link = document.createElement('a');
  link.href = `#${eventId}`;
  link.textContent = event.title;

  link.dataset.details = JSON.stringify({
    date: event.date,
    venue: event.venue,
    description: event.description,
  });

  // 🔽 終了済みイベントには装飾を適用しない
  const remain = Number(event.date_remain);
  const isEnded = !isNaN(remain) && remain < 0;

  if (!isEnded) {
    if (isUrgent(event)) {
      const cautionMark = '⚠️';
      link.textContent = `${cautionMark}${link.textContent}${cautionMark}`;
      link.classList.add('urgent-event');
    }

    if (isNew(event)) {
      link.classList.add('new-event');
      const newIcon = document.createElement('span');
      newIcon.textContent = '✨';
      link.prepend(newIcon);
    }
  }

  return link;
}
