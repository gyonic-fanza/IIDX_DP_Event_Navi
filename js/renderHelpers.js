const NEW_EVENT_THRESHOLD_DAYS = 3;
const URGENT_THRESHOLD_DAYS = 3;

/**
 * nav要素（目次）を生成
 * @returns {HTMLElement}
 */
export function createEventIndex() {
  const nav = document.createElement('nav');
  nav.className = 'event-index';

  const container = document.createElement('div');
  nav.appendChild(container);

  return nav;
}

/**
 * 目次リンクを追加
 */
export function createEventIndexLink(indexContainer, event, eventId, index) {
  const fragment = document.createDocumentFragment();

  if (index > 0) {
    fragment.appendChild(document.createTextNode(' ｜ '));
  }

  const link = buildEventLink(event, eventId);
  fragment.appendChild(link);

  indexContainer.appendChild(fragment);
}

/**
 * イベントリンク要素を生成
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

  return link;
}

function isUrgent(event) {
  return typeof event.date_remain === 'number' && event.date_remain < URGENT_THRESHOLD_DAYS;
}

function isNew(event) {
  if (!event.update) return false;
  const updatedDate = new Date(event.update);
  const now = Date.now();
  const diffDays = (now - updatedDate.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= NEW_EVENT_THRESHOLD_DAYS;
}

/**
 * イベント要素（details）を生成
 */
export function createEventItem(event, eventId, setFallbackImage, generateDetails) {
  const wrapper = document.createElement('details');
  wrapper.className = 'event-details';
  wrapper.open = true;
  wrapper.id = eventId;

  const summary = document.createElement('summary');
  summary.textContent = event.title || 'No Title';
  summary.style.fontWeight = 'bold';
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

function buildRemainText(event) {
  const p = document.createElement('p');
  p.className = 'event-remaining';

  const remain = event.date_remain;
  const status = event.status;

  if (status === false || status === 'false') {
    p.textContent = 'Upcoming';
  } else if (typeof remain === 'number' && remain !== Infinity) {
    const days = Math.floor(remain);
    if (days > 0) {
      p.textContent = `Days remaining: ${days} day${days === 1 ? '' : 's'}`;
    } else if (days === 0) {
      p.textContent = 'Ends today!';
    } else {
      p.textContent = 'Event ended';
      p.classList.add('ended');
    }
  }

  return p;
}

function buildBanner(event, setFallbackImage) {
  const link = document.createElement('a');
  link.href = event.information_url || '#';
  link.target = '_blank';
  link.rel = 'noopener noreferrer';

  const img = document.createElement('img');
  img.src = event.banner_url;
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

function buildDetails(event, generateDetails) {
  const fragment = document.createDocumentFragment();
  const details = generateDetails(event);

  details.forEach(({ label, value, isHTML }) => {
    if (!value) return;

    const p = document.createElement('p');
    p.className = 'event-detail';
    p[isHTML ? 'innerHTML' : 'textContent'] = isHTML
      ? `<strong>${label}:</strong> ${value}`
      : `${label}: ${value}`;

    fragment.appendChild(p);
  });

  return fragment;
}
