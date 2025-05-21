/**
 * バナー画像読み込み失敗時に代替画像を設定する関数
 * @param {HTMLImageElement} img - 画像要素
 * @param {string} altText - 代替テキスト
 */
export function setFallbackImage(img, altText) {
    // 画像が読み込めなかった場合の代替画像URLを設定
    img.src = './no_image.jpg'; // 代替画像のパス
    // 代替テキストを設定し、画像非表示時の説明を補足
    img.alt = `${altText} (image not available)`;
  }
  
  /**
   * ISO形式の日時文字列を
   * 「yyyy/mm/dd(曜日) hh:mm」形式に変換する関数
   * @param {string} dateString - ISO形式の日時文字列
   * @returns {string} フォーマット済み日時文字列（無効な日付の場合は入力値をそのまま返す）
   */
  export function formatDateTime(dateString) {
    if (!dateString) return ''; // 空文字やnullは空文字で返す（無効な日時対応）
  
    const date = new Date(dateString);
  
    // Dateオブジェクトが無効（NaN）なら元の文字列を返す
    if (isNaN(date)) return dateString;
  
    // 曜日名配列（日曜始まり）
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
    // 各要素を2桁表記に整形するヘルパー関数
    const pad2 = (num) => num.toString().padStart(2, '0');
  
    // 年・月・日・曜日・時・分を取得しフォーマット
    const year = date.getFullYear();
    const month = pad2(date.getMonth() + 1); // 月は0始まりなので+1
    const day = pad2(date.getDate());
    const dayOfWeek = daysOfWeek[date.getDay()];
    const hour = pad2(date.getHours());
    const minute = pad2(date.getMinutes());
  
    // 「yyyy/mm/dd(曜日) hh:mm」形式で返す
    return `${year}/${month}/${day}(${dayOfWeek}) ${hour}:${minute}`;
  }
  