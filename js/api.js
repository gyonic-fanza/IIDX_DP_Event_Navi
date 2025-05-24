/**
 * プレイタイプに応じたAPI URLを返す
 * @param {'SP' | 'DP'} playType - プレイタイプ（SP または DP）
 * @returns {string} APIエンドポイントURL
 */
function getApiUrl(playType) {
  if (playType === 'DP') {
    return 'https://script.google.com/macros/s/AKfycbwXdi6579nNuECiGZt2Foe3XQV-VpsmkATh8_nGrikbNNFr0pvR8kxoUIhFNLzUlTHrog/exec';
  } else if (playType === 'SP') {
    return 'https://script.google.com/macros/s/AKfycbyQWSH4Ln5r7a7QLKzT5LoZmlUF8qQfNGQl7pPnon-tVKjedw3ykSUarQZeXTmCQAIkkQ/exec'; // ← SP用URLに置き換えてください
  } else {
    throw new Error('Invalid play type');
  }
}

/**
 * APIからイベントデータを非同期取得する
 * @param {'SP' | 'DP'} playType - プレイタイプ（SP または DP）
 * @returns {Promise<object[]>} イベント情報の配列
 * @throws レスポンスが正常でない場合や通信エラーがあれば例外を投げる
 */
export async function fetchEventData(playType = 'DP') {
  const url = getApiUrl(playType);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}
