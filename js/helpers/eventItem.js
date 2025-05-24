/**
 * @typedef {Object} EventData
 * @property {string} title
 * @property {string} [organizer_name]
 * @property {boolean|string|number} status
 * @property {number} date_remain
 * @property {string} [banner_url]
 * @property {string} [information_url]
 * @property {string|number} event_no
 */

/**
 * @typedef {Object} DetailItem
 * @property {string} label
 * @property {string} value
 * @property {boolean} [isHTML]
 */

/**
 * イベント情報を表示する <details> 要素を生成する。
 *
 * @param {EventData} event - イベントデータ
 * @param {string} eventId - チェックボックス状態保持のためのID（通常 event_no 由来）
 * @param {(img: HTMLImageElement, alt: string) => void} setFallbackImage - バナー画像の代替処理
 * @param {(event: EventData) => DetailItem[]} generateDetails - 詳細データを生成する関数
 * @returns {HTMLElement} 生成された <details> 要素
 */
export function createEventItem(event, eventId, setFallbackImage, generateDetails) {
  const wrapper = document.createElement('details');
  wrapper.className = 'event-details';
  wrapper.open = true;
  wrapper.id = eventId;

  const summary = document.createElement('summary');
  summary.className = 'event-summary';

  // ✅ チェックボックス
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.className = 'event-checkbox';
  if (getCheckboxCookie(eventId) === 'true') {
    checkbox.checked = true;
  }
  checkbox.addEventListener('change', () => {
    setCheckboxCookie(eventId, checkbox.checked);
  });
  summary.appendChild(checkbox);

  // ✅ タイトル
  const titleSpan = document.createElement('span');
  titleSpan.className = 'event-summary-title';
  titleSpan.textContent = event.title || 'No Title';
  summary.appendChild(titleSpan);

  // ✅ 主催者
  if (event.organizer_name) {
    const organizerSpan = document.createElement('span');
    organizerSpan.className = 'event-organizer';
    organizerSpan.textContent = ` (by ${event.organizer_name})`;
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
 * 残り日数の表示を生成。
 * 
 * @param {EventData} event 
 * @returns {HTMLElement}
 */
function buildRemainText(event) {
  const div = document.createElement('div');
  div.className = 'event-remaining';

  const { date_remain: remain, status } = event;

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
 * バナー画像リンク生成。
 * 
 * @param {EventData} event 
 * @param {(img: HTMLImageElement, alt: string) => void} setFallbackImage 
 * @returns {HTMLElement}
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
 * タイトル表示（<h2>）を生成。
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
 * 詳細情報を生成。
 * 
 * @param {EventData} event 
 * @param {(event: EventData) => DetailItem[]} generateDetails 
 * @returns {DocumentFragment}
 */
function buildDetails(event, generateDetails) {
  const fragment = document.createDocumentFragment();
  const details = generateDetails(event);

  for (const { label, value, isHTML } of details) {
    if (!value) continue;

    const div = document.createElement('div');
    div.className = 'event-detail';

    if (isHTML) {
      div.innerHTML = `<strong>${label}:</strong> ${value}`;
    } else {
      div.textContent = `${label}: ${value}`;
    }

    fragment.appendChild(div);
  }

  return fragment;
}

/**
 * チェックボックス状態をCookieに保存。
 * 
 * @param {string} eventId 
 * @param {boolean} checked 
 */
function setCheckboxCookie(eventId, checked) {
  const days = 365;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(eventId)}=${checked}; expires=${expires}; path=/`;
}

/**
 * チェックボックス状態をCookieから取得。
 * 
 * @param {string} eventId 
 * @returns {string | undefined}
 */
function getCheckboxCookie(eventId) {
  const cookies = document.cookie.split('; ').reduce((acc, pair) => {
    const [key, value] = pair.split('=');
    acc[decodeURIComponent(key)] = value;
    return acc;
  }, {});
  return cookies[eventId];
}
