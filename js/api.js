// Google Apps ScriptのAPIエンドポイントURL
// このURLにGETリクエストを送り、イベントデータをJSON形式で取得する
const apiUrl =
  'https://script.google.com/macros/s/AKfycbxk8j0rNhcpkstS_MZM9q2b_j4W1v0bJyKXU5KtS8zd1Jv1wrLm5VoSaydZsOWOxOOnbQ/exec';

/**
 * APIからイベントデータを非同期取得する
 * fetchでapiUrlにリクエストを送り、JSONとしてパースして返却する
 * @returns {Promise<object[]>} イベント情報の配列
 * @throws レスポンスが正常でない場合や通信エラーがあれば例外を投げる
 */
export async function fetchEventData() {
  const res = await fetch(apiUrl);
  if (!res.ok) throw new Error('Network response was not ok');
  return res.json();
}
