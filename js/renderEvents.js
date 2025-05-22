import { generateDetails } from './generateDetails.js';
import { setFallbackImage } from './utils.js';
import { createEventItem, createEventIndex, createEventIndexLink } from './renderHelpers.js';

const CATEGORY_DEFS = [
  { key: 'ended', title: '✅ Ended' },
  { key: 'withinWeek', title: '⏳ Within 1 Week' },
  { key: 'overWeek', title: '📅 Over 1 Week' },
  { key: 'upcoming', title: '🚀 Upcoming' },
];

/**
 * イベントのカテゴリを判定
 * @param {object} event
 * @returns {string} カテゴリキー
 */
function getCategoryKey(event) {
  if (event.status === false || event.status === 'false') return 'upcoming';

  const remain = Number(event.date_remain);
  if (isNaN(remain)) return 'overWeek';
  if (remain < 0) return 'ended';
  if (remain <= 7) return 'withinWeek';
  return 'overWeek';
}

/**
 * カテゴリ用オブジェクトを初期化
 * @returns {object} カテゴリオブジェクト（キーはカテゴリ名）
 */
function createCategories() {
  return CATEGORY_DEFS.reduce((acc, { key, title }) => {
    acc[key] = {
      container: createCategoryContainer(title),
      count: 0,
      events: [],
    };
    return acc;
  }, {});
}

/**
 * カテゴリタイトルのDOMコンテナを作成
 * @param {string} title 
 * @returns {HTMLElement}
 */
function createCategoryContainer(title) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${title} - </strong>`;
  return div;
}

/**
 * イベント一覧を描画するメイン関数
 * @param {Array} data イベントデータ配列
 * @param {HTMLElement} container 描画先コンテナ
 */
export function renderEvents(data, container) {
  // 日数の昇順にソート（NaNは末尾）
  data.sort((a, b) => {
    const aVal = Number(a.date_remain);
    const bVal = Number(b.date_remain);
    return (isNaN(aVal) ? Infinity : aVal) - (isNaN(bVal) ? Infinity : bVal);
  });

  // コンテナ初期化と目次作成
  container.innerHTML = '<hr>';
  const indexNav = createEventIndex();
  container.prepend(indexNav);

  const categories = createCategories();

  // 目次内のカテゴリコンテナを一括追加
  const indexContainer = indexNav.firstElementChild;
  Object.values(categories).forEach(({ container }) => {
    indexContainer.appendChild(container);
  });

  // イベントをカテゴリに振り分け、目次リンクを作成
  data.forEach((event, i) => {
    const id = `event-${i}`;
    const key = getCategoryKey(event);
    const category = categories[key];

    createEventIndexLink(category.container, event, id, category.count);

    category.count++;
    category.events.push({ event, id });
  });

  // 空カテゴリは非表示に
  Object.values(categories).forEach(({ container, count }) => {
    container.style.display = count === 0 ? 'none' : '';
  });

  // 詳細イベントリストはDocumentFragmentでまとめて作成
  const eventItemsFragment = document.createDocumentFragment();

  // 優先順でカテゴリ内イベントを描画
  CATEGORY_DEFS.forEach(({ key }) => {
    categories[key].events.forEach(({ event, id }) => {
      const item = createEventItem(event, id, setFallbackImage, generateDetails);
      if (key === 'ended' || key === 'upcoming') {
        item.classList.add('gray-background');
      }
      eventItemsFragment.appendChild(item);
    });
  });

  // 一括でDOMに追加し描画を最適化
  container.appendChild(eventItemsFragment);
}
