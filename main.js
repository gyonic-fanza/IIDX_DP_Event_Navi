// 最終更新：2025/05/15/15:05

/**
 * ISO形式の日時文字列を
 * 「yyyy/mm/dd(曜日) hh:mm」形式に変換する関数
 * @param {string} dateString ISO形式の日時文字列
 * @returns {string} フォーマット済み日時文字列（不正な日付はそのまま返す）
 */
function formatDateTime(dateString) {
  // 引数が空なら空文字を返す
  if (!dateString) return '';

  // Dateオブジェクトに変換
  const date = new Date(dateString);

  // 不正な日付の場合は元の文字列を返す
  if (isNaN(date)) return dateString;

  // 曜日の配列（日曜始まり）
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 年、月、日、曜日、時間、分をそれぞれ取得し、2桁表記に整形
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);

  // フォーマット済み文字列を返す
  return `${year}/${month}/${day}(${dayOfWeek}) ${hour}:${minute}`;
}

// Google Apps Script のAPI URL
const apiUrl =
  'https://script.google.com/macros/s/AKfycbxk8j0rNhcpkstS_MZM9q2b_j4W1v0bJyKXU5KtS8zd1Jv1wrLm5VoSaydZsOWOxOOnbQ/exec';

/**
 * イベントデータを取得し、
 * 指定のコンテナに表示する処理
 */
fetch(apiUrl)
  .then((res) => res.json()) // JSONとしてレスポンスを取得
  .then((data) => {
    // date_remain（残り日数）が存在しない場合は無限大にして昇順ソート
    data.sort((a, b) => {
      const remainA = a['date_remain'] ?? Infinity;
      const remainB = b['date_remain'] ?? Infinity;
      return remainA - remainB;
    });

    // 表示先コンテナを取得
    const container = document.getElementById('event-list');

    // コンテナの中身を一旦クリア
    container.innerHTML = '';

    // 取得データを1件ずつ処理
    data.forEach((event) => {
      // イベント全体を囲むdiv要素を作成しクラス付与
      const div = document.createElement('div');
      div.className = 'event-item';

      // --- 残り日数の表示処理 ---
      const remain = event['date_remain'];
      if (typeof remain === 'number' && remain !== Infinity) {
        // 小数点以下を切り捨てて整数日数に
        const remainDays = Math.floor(remain);

        // 表示用の<p>要素作成
        const remainText = document.createElement('p');
        remainText.className = 'event-remaining';

        // 残り日数に応じて文言を変える
        if (remainDays > 0) {
          remainText.textContent = `Days remaining: ${remainDays} day${remainDays === 1 ? '' : 's'}`;
        } else if (remainDays === 0) {
          remainText.textContent = 'Ends today!';
        } else {
          remainText.textContent = 'Event ended';
          remainText.classList.add('ended'); // CSSで見た目変更用のクラス追加
        }

        // divに残り日数の<p>を追加
        div.appendChild(remainText);
      }

      // --- バナー画像の表示 ---
      if (event['banner_url']) {
        // バナーがリンク付きならaタグを作成
        const linkBanner = document.createElement('a');
        linkBanner.href = event['information_url'] || '#';
        linkBanner.target = '_blank';
        linkBanner.rel = 'noopener noreferrer';

        // img要素を作成して属性を設定
        const img = document.createElement('img');
        img.src = event['banner_url'];
        img.alt = event['title'] || 'Event Banner';
        img.style.width = '100%';
        img.style.borderRadius = '6px 6px 0 0'; // 上側の角を丸く
        img.style.display = 'block';
        img.style.marginBottom = '0.5rem';

        // 画像読み込みエラー時は非表示にする
        img.onerror = () => {
          img.src = './no_image.png';
          img.alt = event['title'] || 'Event Banner';
          img.style.width = '100%';
          img.style.borderRadius = '6px 6px 0 0'; // 上側の角を丸く
          img.style.display = 'block';
          img.style.marginBottom = '0.5rem';
        };

        // aタグ内にimgを入れてdivに追加
        linkBanner.appendChild(img);
        div.appendChild(linkBanner);
      }

      // --- イベントタイトルの表示 ---
      const h2 = document.createElement('h2');
      h2.className = 'event-title';

      // タイトルにリンクがあればaタグで囲む
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

      // --- イベント詳細情報を生成・表示 ---
      const details = generateDetails(event);

      // details配列の各要素（label, value, isHTML）を<p>要素として出力
      details.forEach(({ label, value, isHTML }) => {
        if (!value) return; // 空文字は表示しない

        const p = document.createElement('p');
        p.className = 'event-detail';

        const spanLabel = document.createElement('span');
        spanLabel.className = 'event-label';

        // labelはHTMLを含む場合があるためinnerHTMLでセット
        spanLabel.innerHTML = label;

        p.appendChild(spanLabel);

        if (isHTML) {
          // valueにHTMLが含まれる場合はinnerHTMLでセット
          const valueSpan = document.createElement('span');
          valueSpan.innerHTML = value;
          p.appendChild(valueSpan);
        } else {
          // 通常テキストとして追加
          p.appendChild(document.createTextNode(value));
        }

        div.appendChild(p);
      });

      // 最後にコンテナにイベントdivを追加
      container.appendChild(div);
    });
  })
  .catch((err) => {
    // エラー発生時はコンソールに出力し、画面にもメッセージ表示
    console.error('Failed to load event data:', err);
    const container = document.getElementById('event-list');
    container.textContent = 'Failed to load event data.';
  });

/**
 * イベント詳細情報の配列を生成する関数
 * 各要素はlabel（表示ラベル）、value（値）、isHTML（valueがHTMLかどうか）を持つ
 * @param {object} event APIから取得したイベントオブジェクト
 * @returns {Array<{label:string, value:string, isHTML:boolean}>} 詳細情報配列
 */
function generateDetails(event) {
  const timezone = event['timezone'] || '';
  // 開始日時と終了日時をフォーマット
  const start = formatDateTime(event['start_date']);
  const end = formatDateTime(event['end_date']);

  // 開始～終了 の形式にまとめる。空でないものだけつなぐ
  const duration = [start, end].filter(Boolean).join(' ～ ');
  // タイムゾーン情報があれば括弧付きで付加
  const durationWithTz = timezone ? `${duration} (${timezone})` : duration;

  // 残り日数（未定義ならInfinity）
  const remain = event['date_remain'] ?? Infinity;

  return [
    { label: '⏰ Event Duration<br>', value: durationWithTz, isHTML: true },
    {
      label: '👤 Organized by<br>',
      value: event['organizer_name']
        ? `<a href="https://x.com/${event['organizer_id'] || '#'}" target="_blank" rel="noopener noreferrer">${event['organizer_name']}</a>`
        : '',
      isHTML: true,
    },
    {
      label: '🏷️ Hashtag<br>',
      value: event['hashtag']
        ? `<a href="https://x.com/hashtag/${encodeURIComponent(event['hashtag'])}" target="_blank" rel="noopener noreferrer">#${event['hashtag']}</a>`
        : '',
      isHTML: true,
    },
    { label: '🎯 Event Type<br>', value: event['event_type'] || '', isHTML: true },
    { label: '🎵 Songs<br>', value: event['songs'] || '', isHTML: true },
    { label: '📌 Status<br>', value: event['status'] ? 'Active' : 'Inactive', isHTML: true },
  ];
}
