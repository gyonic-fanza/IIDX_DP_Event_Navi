import { generateDetails } from './generateDetails.js';
import { setFallbackImage } from './utils.js';
import { createEventItem, createEventIndex, createEventIndexLink } from './renderHelpers.js';
import { toggleAllDetails } from './toggleHelpers.js';

const CATEGORIES = [
  { key: 'ended', title: '✅ Ended' },
  { key: 'week1', title: '⏳ Within 1 Week' },
  { key: 'overWeek', title: '📅 Over 1 Week' },
  { key: 'upcoming', title: '🚀 Upcoming' },
];

/**
 * イベントオブジェクトの状態と残り日数から
 * 適切なカテゴリキーを判定する関数
 * 
 * @param {Object} event - イベント情報
 * @returns {string} カテゴリキー ('ended', 'week1', 'overWeek', 'upcoming')
 */
function getCategory(event) {
  if (event.status === false || event.status === 'false') return 'upcoming';

  const remain = Number(event.date_remain);
  if (isNaN(remain)) return 'overWeek';  // 数値変換できなければ「1週間超過」扱い
  if (remain < 0) return 'ended';        // 残り日数がマイナスなら終了済み
  if (remain <= 7) return 'week1';       // 7日以内なら1週間以内カテゴリ
  return 'overWeek';                     // それ以外は1週間超過カテゴリ
}

/**
 * カテゴリタイトル用のDOM要素を作成する関数
 * 
 * @param {string} title - カテゴリの表示タイトル
 * @returns {HTMLElement} カテゴリタイトルの<div>要素
 */
function createCategoryTitleElement(title) {
  const div = document.createElement('div');
  div.innerHTML = `<strong>${title} || </strong>`;
  return div;
}

/**
 * 「Toggle All」リンクを生成し、クリック時に全イベント詳細の
 * 展開・折りたたみを切り替えるイベントリスナーを設定する関数
 * 
 * @returns {HTMLAnchorElement} トグルリンク要素
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
 * CATEGORIES配列を元にカテゴリごとの初期情報を保持するオブジェクトを生成する関数
 * 各カテゴリにはタイトルコンテナ、イベント数カウント、イベント配列を持たせる
 * 
 * @returns {Object} カテゴリキーをプロパティに持つ初期カテゴリオブジェクト
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
 * メイン関数。渡されたイベントリストをソートし、
 * カテゴリ別に分類、DOMに描画する。
 * イベントのインデックスナビ、トグルリンクも併せて生成し、
 * 「ended」「upcoming」カテゴリのイベントはグレー背景に設定する。
 * 
 * @param {Array} events - 描画対象のイベント配列
 * @param {HTMLElement} container - 描画先のDOM要素
 */
export function renderEvents(events, container) {
  // date_remainを基準に昇順ソート（数値化できないものは末尾へ）
  events.sort((a, b) => {
    const aVal = Number(a.date_remain);
    const bVal = Number(b.date_remain);
    return (isNaN(aVal) ? Infinity : aVal) - (isNaN(bVal) ? Infinity : bVal);
  });

  // コンテナ初期化
  container.innerHTML = '';
  container.appendChild(document.createElement('hr'));

  // インデックスナビ生成＆先頭に配置
  const indexNav = createEventIndex();
  container.prepend(indexNav);
  const indexWrapper = indexNav.firstElementChild;

  // カテゴリごとの初期化
  const categories = initializeCategoryContainers();

  // 全詳細表示・非表示切替リンクを作成し、インデックスの次に挿入
  const toggleLink = createToggleAllLink();
  container.insertBefore(toggleLink, indexNav.nextSibling);

  // カテゴリタイトルをインデックスナビに追加
  Object.values(categories).forEach(({ container }) => indexWrapper.appendChild(container));

  // イベントをカテゴリ別に分類しつつ、インデックスリンクも生成
  events.forEach((event, i) => {
    const id = `event-${i}`;
    const categoryKey = getCategory(event);
    const category = categories[categoryKey];
    createEventIndexLink(category.container, event, id, category.count);
    category.count++;
    category.events.push({ event, id });
  });

  // イベントが0件のカテゴリタイトルは非表示にする
  Object.values(categories).forEach(({ container, count }) => {
    container.style.display = count === 0 ? 'none' : '';
  });

  // カテゴリ順にイベントアイテムを作成し、一括でDOMに追加
  const fragment = document.createDocumentFragment();
  CATEGORIES.forEach(({ key }) => {
    categories[key].events.forEach(({ event, id }) => {
      const item = createEventItem(event, id, setFallbackImage, generateDetails);
      // 終了済みと今後のカテゴリはグレー背景で区別
      if (key === 'ended' || key === 'upcoming') item.classList.add('gray-background');
      fragment.appendChild(item);
    });
  });

  container.appendChild(fragment);
}
