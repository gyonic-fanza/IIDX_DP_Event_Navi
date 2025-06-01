import { generateDetails } from './generateDetails.js';
import { setFallbackImage } from './utils.js';
import { createEventItem, createEventIndex, createEventIndexLink } from './renderHelpers.js';
import { toggleAllDetails } from './toggleHelpers.js';

/**
 * イベントカテゴリの定義
 * @type {Array<{key: string, title: string}>}
 */
const CATEGORIES = [
  { key: 'week1', title: '⏳ Within 1 Week' },
  { key: 'overWeek', title: '📅 Over 1 Week' },
  { key: 'upcoming', title: '🚀 Upcoming' },
  { key: 'ended', title: '✅ Ended' },  // ← 最後に移動
];

/**
 * イベントオブジェクトの状態と残り日数からカテゴリを判定する
 * 
 * @param {{ status: boolean|string, date_remain: number|string }} event - イベント情報
 * @returns {string} カテゴリキー ('ended' | 'week1' | 'overWeek' | 'upcoming')
 */
function getCategory(event) {
  const remain = Number(event.date_remain);

  if (!isNaN(remain)) {
    if (remain < 0) return 'ended';
    if (remain <= 7) return 'week1';
    return 'overWeek';
  }

  // date_remain が不明な場合に限り status を参照
  if (event.status === false || event.status === 'false') {
    return 'upcoming';
  }

  return 'overWeek';
}

/**
 * カテゴリタイトルの要素を生成する
 * 
 * @param {string} title - カテゴリの表示タイトル
 * @returns {HTMLDivElement}
 */
function createCategoryTitleElement(title) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${title}</strong> | `;
  return div;
}

/**
 * 「Toggle All」リンクを生成する
 * 
 * @returns {HTMLAnchorElement}
 */
function createToggleAllLink() {
  const link = document.createElement('a');
  link.href = '#';
  link.textContent = 'Toggle All';
  link.className = 'toggle-link';
  link.addEventListener('click', e => {
    e.preventDefault();
    toggleAllDetails();
  });
  return link;
}

/**
 * カテゴリごとの初期オブジェクトを生成
 * 
 * @returns {Object<string, {container: HTMLDivElement, count: number, events: Array}>}
 */
function initializeCategoryContainers() {
  return CATEGORIES.reduce((acc, { key, title }) => {
    acc[key] = {
      container: createCategoryTitleElement(title),
      count: 0,
      events: [],
    };
    return acc;
  }, {});
}

/**
 * イベント一覧をカテゴリ分けして描画する
 * 
 * @param {Array<Object>} events - イベントオブジェクトの配列
 * @param {HTMLElement} container - 描画先のDOM要素
 */
export function renderEvents(events, container) {
  // ソート
  events.sort((a, b) => {
    const aRemain = Number(a.date_remain);
    const bRemain = Number(b.date_remain);
    return (isNaN(aRemain) ? Infinity : aRemain) - (isNaN(bRemain) ? Infinity : bRemain);
  });

  container.innerHTML = '';
  container.appendChild(document.createElement('hr'));

  // 目次とトグルを用意
  const toggleLink = createToggleAllLink();
  const { wrapper: indexDetails, nav: indexNav } = createEventIndex();

  // コンテナを用意して2つ並べる
  const indexContainer = document.createElement('div');
  indexContainer.className = 'event-index-container';
  indexContainer.appendChild(indexDetails);
  indexContainer.appendChild(toggleLink);

  container.prepend(indexContainer);

  // カテゴリ準備
  const categories = initializeCategoryContainers();
  Object.values(categories).forEach(({ container }) => indexNav.appendChild(container));

  // カテゴリ分け
  events.forEach((event, i) => {
    const id = `event-${event.event_no}`;
    const key = getCategory(event);
    const category = categories[key];

    createEventIndexLink(category.container, event, id, category.count);
    category.count++;
    category.events.push({ event, id });
  });

  // 空の非表示
  Object.values(categories).forEach(({ container, count }) => {
    container.style.display = count === 0 ? 'none' : '';
  });

  // 描画（Ended を末尾）
  const fragment = document.createDocumentFragment();
  const categoryOrder = ['week1', 'overWeek', 'upcoming', 'ended'];
  categoryOrder.forEach(key => {
    categories[key].events.forEach(({ event, id }) => {
      const item = createEventItem(event, id, setFallbackImage, generateDetails);
      if (key === 'ended' || key === 'upcoming') {
        item.classList.add('gray-background');
      }
      fragment.appendChild(item);
    });
  });

  container.appendChild(fragment);
}
