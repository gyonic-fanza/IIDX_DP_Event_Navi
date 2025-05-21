import { generateDetails } from './generateDetails.js';
import { setFallbackImage } from './utils.js';
import { createEventItem, createEventIndex, createEventIndexLink } from './renderHelpers.js';

/**
 * イベントデータをカテゴリ別に分類し、目次と詳細リストを
 * 指定コンテナにレンダリングする
 * @param {Array} data - APIから取得したイベントデータ配列
 * @param {HTMLElement} container - 描画対象のDOM要素
 */
export function renderEvents(data, container) {
  // 残り日数を数値化して昇順ソート。NaNは末尾に回す
  data.sort((a, b) => {
    const aVal = Number(a.date_remain);
    const bVal = Number(b.date_remain);
    return (isNaN(aVal) ? Infinity : aVal) - (isNaN(bVal) ? Infinity : bVal);
  });

  container.innerHTML = '<hr>';  // 初期化＆区切り挿入

  const indexNav = createEventIndex();
  container.prepend(indexNav);

  const categories = createCategories([
    { key: 'ended', title: '✅ Ended' },
    { key: 'withinWeek', title: '⏳ Within 1 Week' },
    { key: 'overWeek', title: '📅 Over 1 Week' },
    { key: 'upcoming', title: '🚀 Upcoming' },
  ]);

  // 目次にカテゴリ見出しを追加
  const indexContainer = indexNav.firstElementChild;
  Object.values(categories).forEach(({ container }) => indexContainer.appendChild(container));

  // カテゴリ分けロジック
  const getCategoryKey = (event) => {
    const remain = Number(event.date_remain);
    if (event.status === false || event.status === 'false') return 'upcoming';
    if (!isNaN(remain)) {
      if (remain < 0) return 'ended';
      if (remain <= 7) return 'withinWeek';
      return 'overWeek';
    }
    return 'overWeek';
  };

  // イベント振り分け＆目次リンク生成
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

  // 詳細リスト描画（優先順）
  ['ended', 'withinWeek', 'overWeek', 'upcoming'].forEach(key => {
    categories[key].events.forEach(({ event, id }) => {
      const item = createEventItem(event, id, setFallbackImage, generateDetails);
      if (key === 'ended' || key === 'upcoming') item.classList.add('gray-background');
      container.appendChild(item);
    });
  });
}

/** カテゴリオブジェクトを作成 */
function createCategories(defs) {
  const obj = {};
  defs.forEach(({ key, title }) => {
    obj[key] = { container: createCategoryContainer(title), count: 0, events: [] };
  });
  return obj;
}

/** カテゴリ表示用のコンテナ作成 */
function createCategoryContainer(title) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${title} - </strong>`;
  return div;
}
