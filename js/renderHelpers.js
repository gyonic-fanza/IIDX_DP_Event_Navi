/**
 * 目次のnav要素とその内部コンテナを生成する関数
 * @returns {HTMLElement} 作成したnav要素（目次用）
 */
export function createEventIndex() {
  const nav = document.createElement('nav');
  nav.className = 'event-index';

  const container = document.createElement('div');
  nav.appendChild(container);

  return nav;
}

/**
 * 目次リンクを指定のコンテナに追加する関数
 * @param {HTMLElement} indexContainer 目次のリンクをまとめるdiv要素
 * @param {Object} event イベントオブジェクト
 * @param {string} eventId イベントの一意識別ID
 * @param {number} index イベントの連番インデックス（0始まり）
 */
export function createEventIndexLink(indexContainer, event, eventId, index) {
  const fragment = document.createDocumentFragment();

  if (index > 0) {
    fragment.appendChild(document.createTextNode(' ｜ '));
  }

  const link = document.createElement('a');
  link.href = `#${eventId}`;
  link.textContent = event.title;
  link.dataset.details = JSON.stringify({
    date: event.date,
    venue: event.venue,
    description: event.description,
  });

  // 残り日数3日未満の警告マーク
  if (typeof event.date_remain === 'number' && event.date_remain < 3) {
    const cautionMark = '⚠️';
    link.textContent = `${cautionMark}${link.textContent}${cautionMark}`;
    link.classList.add('urgent-event');
  }

  // 更新から3日以内は新着マークを追加
  if (event.update) {
    const updatedDate = new Date(event.update);
    const now = Date.now();
    const diffDays = (now - updatedDate.getTime()) / (1000 * 60 * 60 * 24);

    if (diffDays <= 3) {
      link.classList.add('new-event');
      const newIcon = document.createElement('span');
      newIcon.textContent = '✨';
      link.prepend(newIcon);
    }
  }

  fragment.appendChild(link);
  indexContainer.appendChild(fragment);
}

/**
 * 単一のイベント要素（div）を生成し返す関数
 * @param {Object} event イベントデータオブジェクト
 * @param {string} eventId 要素のIDとして使う一意識別子
 * @param {function} setFallbackImage 画像読み込み失敗時に呼ぶ関数
 * @param {function} generateDetails イベント詳細情報の配列を返す関数
 * @returns {HTMLElement} イベント表示用div要素
 */
export function createEventItem(event, eventId, setFallbackImage, generateDetails) {
  const div = document.createElement('div');
  div.className = 'event-item';
  div.id = eventId;

  // 残り日数や状態のテキスト表示
  const remainText = document.createElement('p');
  remainText.className = 'event-remaining';

  const remain = event.date_remain;
  const status = event.status;

  if (status === false || status === 'false') {
    remainText.textContent = 'Upcoming';
  } else if (typeof remain === 'number' && remain !== Infinity) {
    const days = Math.floor(remain);
    if (days > 0) {
      remainText.textContent = `Days remaining: ${days} day${days === 1 ? '' : 's'}`;
    } else if (days === 0) {
      remainText.textContent = 'Ends today!';
    } else {
      remainText.textContent = 'Event ended';
      remainText.classList.add('ended');
    }
  }
  div.appendChild(remainText);

  // バナー画像とリンク
  const bannerLink = document.createElement('a');
  bannerLink.href = event.information_url || '#';
  bannerLink.target = '_blank';
  bannerLink.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.src = event.banner_url;
  img.alt = event.title || 'Event Banner';
  img.style.cssText = `
    width: 100%;
    border-radius: 6px 6px 0 0;
    display: block;
    margin-bottom: 0.5rem;
  `;
  img.onerror = () => setFallbackImage(img, event.title || 'Event Banner');

  bannerLink.appendChild(img);
  div.appendChild(bannerLink);

  // タイトル見出し
  const h2 = document.createElement('h2');
  h2.className = 'event-title';

  if (event.information_url) {
    const linkTitle = document.createElement('a');
    linkTitle.href = event.information_url;
    linkTitle.target = '_blank';
    linkTitle.rel = 'noopener noreferrer';
    linkTitle.textContent = event.title || 'No Title';
    h2.appendChild(linkTitle);
  } else {
    h2.textContent = event.title || 'No Title';
  }
  div.appendChild(h2);

  // 詳細情報の表示
  const details = generateDetails(event);
  const detailsFragment = document.createDocumentFragment();

  details.forEach(({ label, value, isHTML }) => {
    if (!value) return;

    const p = document.createElement('p');
    p.className = 'event-detail';

    const spanLabel = document.createElement('span');
    spanLabel.className = 'event-label';
    spanLabel.innerHTML = label;

    p.appendChild(spanLabel);

    if (isHTML) {
      const spanValue = document.createElement('span');
      spanValue.innerHTML = value;
      p.appendChild(spanValue);
    } else {
      p.appendChild(document.createTextNode(value));
    }

    detailsFragment.appendChild(p);
  });

  div.appendChild(detailsFragment);

  return div;
}
