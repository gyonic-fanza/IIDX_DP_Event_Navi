/**
 * ISO形式の日時文字列を
 * 「yyyy/mm/dd(曜日) hh:mm」形式に変換する関数
 * @param {string} dateString ISO形式の日時文字列
 * @returns {string} フォーマット済み日時文字列（不正な日付はそのまま返す）
 */
function formatDateTime(dateString) {
  // 引数が空文字またはnullの場合は空文字を返す
  if (!dateString) return '';

  // Dateオブジェクトに変換
  const date = new Date(dateString);

  // 不正な日付の場合は元の文字列をそのまま返す
  if (isNaN(date)) return dateString;

  // 曜日の配列（日曜始まり）
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // 年、月、日、曜日、時間、分を取得し、2桁表記に整形
  const year = date.getFullYear();
  const month = ('0' + (date.getMonth() + 1)).slice(-2);
  const day = ('0' + date.getDate()).slice(-2);
  const dayOfWeek = daysOfWeek[date.getDay()];
  const hour = ('0' + date.getHours()).slice(-2);
  const minute = ('0' + date.getMinutes()).slice(-2);

  // フォーマット済みの日時文字列を返す
  return `${year}/${month}/${day}(${dayOfWeek}) ${hour}:${minute}`;
}

// Google Apps Script のAPIエンドポイントURL
const apiUrl =
  'https://script.google.com/macros/s/AKfycbxk8j0rNhcpkstS_MZM9q2b_j4W1v0bJyKXU5KtS8zd1Jv1wrLm5VoSaydZsOWOxOOnbQ/exec';

/**
 * イベントデータを取得し、
 * 指定のコンテナに表示する処理
 */
fetch(apiUrl)
  .then((res) => res.json()) // レスポンスをJSONとしてパース
  .then((data) => {
    // date_remain（残り日数）が存在しない場合はInfinity（無限大）として扱い昇順ソート
    data.sort((a, b) => {
      const remainA = a['date_remain'] ?? Infinity;
      const remainB = b['date_remain'] ?? Infinity;
      return remainA - remainB;
    });

    // 表示先コンテナ要素を取得
    const container = document.getElementById('event-list');

    // コンテナ内を初期化（以前の表示をクリア）
    container.innerHTML = '';

    // 取得した各イベントデータを順に処理
    data.forEach((event) => {
      // イベント全体を囲むdiv要素を作成しクラスを付与
      const div = document.createElement('div');
      div.className = 'event-item';

      // --- 残り日数の表示 ---
      const remain = event['date_remain'];
      if (typeof remain === 'number' && remain !== Infinity) {
        // 小数点以下を切り捨てて整数日数に変換
        const remainDays = Math.floor(remain);

        // 残り日数表示用の<p>要素を作成しクラス付与
        const remainText = document.createElement('p');
        remainText.className = 'event-remaining';

        // 残り日数に応じて文言を設定
        if (remainDays > 0) {
          remainText.textContent = `Days remaining: ${remainDays} day${remainDays === 1 ? '' : 's'}`;
        } else if (remainDays === 0) {
          remainText.textContent = 'Ends today!';
        } else {
          remainText.textContent = 'Event ended';
          // 終了イベント用のスタイルクラスを追加
          remainText.classList.add('ended');
        }

        // 残り日数表示をイベントdivに追加
        div.appendChild(remainText);
      }

      // --- バナー画像の表示 ---
      // バナー画像をリンクで囲む（情報URLがあればリンク先に設定）
      const linkBanner = document.createElement('a');
      linkBanner.href = event['information_url'] || '#';
      linkBanner.target = '_blank';
      linkBanner.rel = 'noopener noreferrer';

      // 画像要素を作成
      const img = document.createElement('img');
      img.src = event['banner_url'] || './no_image.png';
      img.alt = event['title'] || 'Event Banner';
      // スタイル調整
      img.style.width = '100%';
      img.style.borderRadius = '6px 6px 0 0';
      img.style.display = 'block';
      img.style.marginBottom = '0.5rem';

      // 画像読み込みエラー時の代替処理
      img.onerror = () => setFallbackImage(img, event['title'] || 'Event Banner');

      // 画像をリンク要素に追加し、イベントdivに追加
      linkBanner.appendChild(img);
      div.appendChild(linkBanner);

      // --- イベントタイトルの表示 ---
      const h2 = document.createElement('h2');
      h2.className = 'event-title';

      // 情報URLがあればタイトルをリンクで囲む
      if (event['information_url']) {
        const linkTitle = document.createElement('a');
        linkTitle.href = event['information_url'];
        linkTitle.target = '_blank';
        linkTitle.rel = 'noopener noreferrer';
        linkTitle.textContent = event['title'] || 'No Title';
        h2.appendChild(linkTitle);
      } else {
        // URLがなければテキストのみ表示
        h2.textContent = event['title'] || 'No Title';
      }
      div.appendChild(h2);

      // --- イベント詳細情報の生成と表示 ---
      const details = generateDetails(event);

      // 詳細情報配列の各要素を<p>要素として出力
      details.forEach(({ label, value, isHTML }) => {
        // 空の値は表示しない
        if (!value) return;

        // 詳細用<p>要素を作成しクラス付与
        const p = document.createElement('p');
        p.className = 'event-detail';

        // ラベル用の<span>要素を作成
        const spanLabel = document.createElement('span');
        spanLabel.className = 'event-label';

        // ラベルはHTMLを含む可能性があるためinnerHTMLでセット
        spanLabel.innerHTML = label;
        p.appendChild(spanLabel);

        if (isHTML) {
          // 値がHTMLの場合はinnerHTMLでセット
          const valueSpan = document.createElement('span');
          valueSpan.innerHTML = value;
          p.appendChild(valueSpan);
        } else {
          // テキストとして追加
          p.appendChild(document.createTextNode(value));
        }

        // イベントdivに詳細情報を追加
        div.appendChild(p);
      });

      // 最後にイベントdivをコンテナに追加
      container.appendChild(div);
    });
  })
  .catch((err) => {
    // エラー発生時の処理
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
  // タイムゾーン情報
  const timezone = event['timezone'] || '';

  // 開始日時と終了日時をフォーマット
  const start = formatDateTime(event['start_date']);
  const end = formatDateTime(event['end_date']);

  // 「開始日時 - 終了日時」の形式にまとめる。空文字は除外
  const duration = [start, end].filter(Boolean).join(' - ');

  // タイムゾーンがあれば括弧付きで付加
  const durationWithTz = timezone ? `${duration} (${timezone})` : duration;

  // 残り日数（未定義ならInfinityとして扱う）
  const remain = event['date_remain'] ?? Infinity;

  return [
    {
      label: '⏰ Event Duration<br>',
      value: durationWithTz,
      isHTML: true,
    },
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
    {
      label: '🎯 Event Type<br>',
      value: event['event_type'] || '',
      isHTML: true,
    },
    {
      label: '🎵 Songs<br>',
      value: event['songs'] || '',
      isHTML: true,
    },
  ];
}

/**
 * バナー画像読み込み失敗時に代替画像を設定する関数
 * （実装は必要に応じて追加してください）
 * @param {HTMLImageElement} img 画像要素
 * @param {string} altText 代替テキスト
 */
function setFallbackImage(img, altText) {
  // 例：代替画像URLを指定する
  img.src = 'path/to/fallback-image.png';
  img.alt = altText + ' (image not available)';
}
