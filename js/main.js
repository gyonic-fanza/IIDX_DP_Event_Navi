import { fetchEventData } from './api.js';      // イベントデータ取得API関数
import { renderEvents } from './renderEvents.js'; // イベント描画関数

/**
 * DOM読み込み完了後にイベント一覧を取得し描画する処理を実行
 */
document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('event-list'); // イベント表示用コンテナ取得

  try {
    // APIからイベントデータを取得（非同期）
    const data = await fetchEventData();

    // 取得したイベントデータを画面に描画
    renderEvents(data, container);
  } catch (err) {
    // エラー発生時のログ出力
    console.error('Failed to load event data:', err);

    // ユーザーに読み込み失敗を表示
    container.textContent = 'Failed to load event data.';
  }
});
