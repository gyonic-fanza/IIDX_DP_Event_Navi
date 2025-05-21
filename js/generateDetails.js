import { formatDateTime } from './utils.js'; // 日時フォーマット関数を読み込み

/**
 * イベント詳細情報を配列で生成する
 * 各要素は表示ラベル(label)、表示内容(value)、HTML扱いフラグ(isHTML)を持つ
 * @param {object} event APIから取得したイベント情報オブジェクト
 * @returns {Array<{label:string, value:string, isHTML:boolean}>} 詳細情報の配列
 */
export function generateDetails(event) {
  return [
    {
      label: '⏰ Event Duration<br>', // イベント期間ラベル（改行タグ含むHTML）
      // 開始・終了日時をフォーマットし、タイムゾーンも表示。値はHTMLとして扱う
      value:
        event['start_date'] && event['end_date']
          ? `${formatDateTime(event['start_date'])} - ${formatDateTime(event['end_date'])} (${event['timezone'] || ''})`
          : '',
      isHTML: true,
    },
    {
      label: '👤 Organized by<br>', // 主催者名ラベル（HTML）
      // 主催者名があればX（旧Twitter）プロフィールへのリンクを生成。無ければ空文字
      value: event['organizer_name']
        ? `<a href="https://x.com/${encodeURIComponent(event['organizer_id'])}" target="_blank" rel="noopener noreferrer">${event['organizer_name']}</a>`
        : '',
      isHTML: true,
    },
    {
      label: '🏷️ Hashtag<br>', // ハッシュタグラベル（HTML）
      // ハッシュタグがあればXのハッシュタグ検索リンクを生成（先頭#は除去）
      value: event['hashtag']
        ? `<a href="https://x.com/hashtag/${encodeURIComponent(event['hashtag'].replace(/^#/, ''))}" target="_blank" rel="noopener noreferrer">#${event['hashtag'].replace(/^#/, '')}</a>`
        : '',
      isHTML: true,
    },
    {
      label: '🎯 Event Type<br>', // イベントタイプラベル（HTML）
      value: event['event_type'] || '',
      isHTML: true,
    },
    {
      label: '🎵 Songs<br>', // 楽曲リストラベル（HTML）
      // songsが配列ならカンマ区切り文字列に変換。文字列ならそのまま表示
      value: Array.isArray(event['songs']) ? event['songs'].join(', ') : event['songs'] || '',
      isHTML: true,
    },
  ];
}
