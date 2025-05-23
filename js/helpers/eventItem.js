/**
 * @typedef {Object} EventData
 * @property {string} title
 * @property {string} [organizer_name]
 * @property {boolean|string|number} status
 * @property {number} date_remain
 * @property {string} [banner_url]
 * @property {string} [information_url]
 */

/**
 * 詳細情報アイテム
 * @typedef {Object} DetailItem
 * @property {string} label
 * @property {string} value
 * @property {boolean} [isHTML]
 */

/**
 * イベント情報を表示する <details> 要素を生成する。
 *
 * @param {EventData} event - イベントデータ
 * @param {string} eventId - DOM上のID属性値
 * @param {(img: HTMLImageElement, alt: string) => void} setFallbackImage - 画像読み込み失敗時の代替処理関数
 * @param {(event: EventData) => DetailItem[]} generateDetails - 詳細情報を生成する関数
 * @returns {HTMLElement} <details> 要素
 */
export function createEventItem(event, eventId, setFallbackImage, generateDetails) {
  const wrapper = document.createElement('details');
  wrapper.className = 'event-details';
  wrapper.open = true;
  wrapper.id = eventId;

  const summary = document.createElement('summary');
  summary.className = 'event-summary';

  const titleSpan = document.createElement('span');
  titleSpan.textContent = event.title || 'No Title';
  titleSpan.className = 'event-summary-title';
  summary.appendChild(titleSpan);

  if (event.organizer_name) {
    const organizerSpan = document.createElement('span');
    organizerSpan.textContent = ` (by ${event.organizer_name})`;
    organizerSpan.className = 'event-organizer';
    summary.appendChild(organizerSpan);
  }

  wrapper.appendChild(summary);

  const inner = document.createElement('div');
  inner.className = 'event-item-inner';

  inner.appendChild(buildRemainText(event));
  inner.appendChild(buildBanner(event, setFallbackImage));
  inner.appendChild(buildTitle(event));
  inner.appendChild(buildDetails(event, generateDetails));

  wrapper.appendChild(inner);
  return wrapper;
}

/**
 * イベントの残り日数を表示する要素を生成する。
 *
 * @param {EventData} event
 * @returns {HTMLElement} 残り日数表示用要素（div）
 */
function buildRemainText(event) {
  const div = document.createElement('div');
  div.className = 'event-remaining';

  const remain = event.date_remain;
  const status = event.status;

  if (status === false || status === 'false') {
    div.textContent = 'Upcoming';
  } else if (typeof remain === 'number' && remain !== Infinity) {
    const days = Math.floor(remain);
    if (days > 0) {
      const span = document.createElement('span');
      span.textContent = days.toString();
      span.className = 'highlight-number';
      div.appendChild(span);
      div.append(` day${days === 1 ? '' : 's'} left`);
    } else if (days === 0) {
      div.textContent = 'Ends today';
    } else {
      div.textContent = 'Ended';
      div.classList.add('ended');
    }
  }

  return div;
}

/**
 * イベントのバナー画像リンクを生成する。
 *
 * @param {EventData} event
 * @param {(img: HTMLImageElement, alt: string) => void} setFallbackImage
 * @returns {HTMLElement} <a> 要素
 */
function buildBanner(event, setFallbackImage) {
  const link = document.createElement('a');
  link.href = event.information_url || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.src = event.banner_url || '';
  img.alt = event.title || 'Event Banner';
  img.style.cssText = `
    width: 100%;
    border-radius: 6px 6px 0 0;
    display: block;
    margin-bottom: 0.5rem;
  `;

  img.onerror = () => setFallbackImage(img, img.alt);

  link.appendChild(img);
  return link;
}

/**
 * イベントタイトルを <h2> 要素として生成する。
 *
 * @param {EventData} event
 * @returns {HTMLElement}
 */
function buildTitle(event) {
  const h2 = document.createElement('h2');
  h2.className = 'event-title';

  if (event.information_url) {
    const a = document.createElement('a');
    a.href = event.information_url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.textContent = event.title || 'No Title';
    h2.appendChild(a);
  } else {
    h2.textContent = event.title || 'No Title';
  }

  return h2;
}

/**
 * イベント詳細情報をDocumentFragmentで構築する。
 *
 * @param {EventData} event
 * @param {(event: EventData) => DetailItem[]} generateDetails
 * @returns {DocumentFragment}
 */
function buildDetails(event, generateDetails) {
  const fragment = document.createDocumentFragment();
  const details = generateDetails(event);

  details.forEach(({ label, value, isHTML }) => {
    // 0や空文字は許容し、null/undefinedを弾く
    if (value === null || value === undefined) return;

    const div = document.createElement('div');
    div.className = 'event-detail';

    if (isHTML) {
      div.innerHTML = `<strong>${label}:</strong> ${value}`;
    } else {
      div.textContent = `${label}: ${value}`;
    }

    fragment.appendChild(div);
  });

  return fragment;
}
