// 最終更新：2025/05/15/15:05
/**
 * 日時文字列を「yyyy/mm/dd(aaa) hh:mm」形式にフォーマット
 * @param {string} dateString ISO形式の日時文字列
 * @returns {string} フォーマット済み日時文字列
 */
function formatDateTime(dateString) {
  if (!dateString) return '';

  const date = new Date(dateString);
  if (isNaN(date)) return dateString;

  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);

  return `${year}/${month}/${day}(${dayOfWeek}) ${hour}:${minute}`;
}

// Google Apps ScriptのAPI URL
const apiUrl =
  'https://script.google.com/macros/s/AKfycbxk8j0rNhcpkstS_MZM9q2b_j4W1v0bJyKXU5KtS8zd1Jv1wrLm5VoSaydZsOWOxOOnbQ/exec';

// イベントデータ取得と表示処理
fetch(apiUrl)
  .then((res) => res.json())
  .then((data) => {
    // date_remain (remain) の昇順にソート
    data.sort((a, b) => {
      const remainA = a['date_remain'] ?? Infinity;
      const remainB = b['date_remain'] ?? Infinity;
      return remainA - remainB;
    });

    const container = document.getElementById('event-list');
    container.innerHTML = ''; // 既存内容をクリア

    data.forEach((event) => {
      const div = document.createElement('div');
      div.className = 'event-item';

      // --- ここで残り日数の表示 ---
      const remain = event['date_remain'];
if (typeof remain === 'number' && remain !== Infinity) {
  const remainDays = Math.floor(remain); // 小数点以下切り捨て
  const remainText = document.createElement('p');
  remainText.className = 'event-remaining';

  if (remainDays > 0) {
    remainText.textContent = `Days remaining: ${remainDays} day${remainDays === 1 ? '' : 's'}`;
  } else if (remainDays === 0) {
    remainText.textContent = 'Ends today!';
  } else {
    remainText.textContent = 'Event ended';
    remainText.classList.add('ended');
  }

  div.appendChild(remainText);
}
      // banner_urlがある場合はリンク付き画像を作成
      if (event['banner_url']) {
        const linkBanner = document.createElement('a');
        linkBanner.href = event['information_url'] || '#';
        linkBanner.target = '_blank';
        linkBanner.rel = 'noopener noreferrer';

        const img = document.createElement('img');
        img.src = event['banner_url'];
        img.alt = event['title'] || 'Event Banner';
        img.style.width = '100%';
        img.style.borderRadius = '6px 6px 0 0'; // 上の角を丸めるなど調整
        img.style.display = 'block';
        img.style.marginBottom = '0.5rem';
        img.onerror = () => {
          img.style.display = 'none'; // もしくは代替画像に差し替え
        };

        linkBanner.appendChild(img);
        div.appendChild(linkBanner);
      }

      // イベントタイトルにリンクをつける
      const h2 = document.createElement('h2');
      h2.className = 'event-title';

      if (event['information_url']) {
        const linkTitle = document.createElement('a');
        linkTitle.href = event['information_url'];
        linkTitle.target = '_blank';
        linkTitle.rel = 'noopener noreferrer';
        linkTitle.textContent = event['title'] || 'No Title';
        h2.appendChild(linkTitle);
      } else {
        h2.textContent = event['title'] || 'No Title';
      }
      div.appendChild(h2);

      // 詳細情報の追加（generateDetails関数を利用）
      const details = generateDetails(event);
      details.forEach(({ label, value, isHTML }) => {
        if (!value) return;
        const p = document.createElement('p');
        p.className = 'event-detail';
        const spanLabel = document.createElement('span');
        spanLabel.className = 'event-label';

        // innerHTMLを使って <br> を有効にする
        spanLabel.innerHTML = label;

        p.appendChild(spanLabel);

        if (isHTML) {
          const valueSpan = document.createElement('span');
          valueSpan.innerHTML = value;
          p.appendChild(valueSpan);
        } else {
          p.appendChild(document.createTextNode(value));
        }

        div.appendChild(p);
      });

      container.appendChild(div);
    });
  })
  .catch((err) => {
    console.error('Failed to load event data:', err);
    const container = document.getElementById('event-list');
    container.textContent = 'Failed to load event data.';
  });

/**
 * イベント詳細情報を配列で生成
 * isHTML=trueの場合はvalueがHTML文字列として扱われる
 * @param {object} event APIから取得したイベントオブジェクト
 * @returns {Array<{label:string, value:string, isHTML:boolean}>}
 */
function generateDetails(event) {
  const timezone = event['timezone'] || '';
  const start = formatDateTime(event['start_date']);
  const end = formatDateTime(event['end_date']);
  const duration = [start, end].filter(Boolean).join(' ～ ');
  const durationWithTz = timezone ? `${duration} (${timezone})` : duration;
  const remain = event['date_remain'] ?? Infinity;

  return [
  { label: 'Event Duration<br>', value: durationWithTz, isHTML: true },
  {
    label: 'Organized by<br>',
    value: event['organizer_name']
      ? `<a href="https://x.com/${event['organizer_id'] || '#'}" target="_blank" rel="noopener noreferrer">${event['organizer_name']}</a>`
      : '',
    isHTML: true,
  },
  {
    label: 'Hashtag<br>',
    value: event['hashtag']
      ? `<a href="https://x.com/hashtag/${encodeURIComponent(event['hashtag'])}" target="_blank" rel="noopener noreferrer">#${event['hashtag']}</a>`
      : '',
    isHTML: true,
  },
  { label: 'Event Type<br>', value: event['event_type'] || '', isHTML: true },
  { label: 'Songs<br>', value: event['songs'] || '', isHTML: true },
  { label: 'Status<br>', value: event['status'] ? 'Active' : 'Inactive', isHTML: true },
];

}
