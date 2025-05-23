// イベント関連の定数を定義（例: 新規イベント・緊急イベントの閾値など）
export * from './helpers/constants.js';

// 目次（イベントインデックス）を生成・リンク追加するための関数群
// - createEventIndex()
// - createEventIndexLink()
// - buildEventLink()（内部的に使用）など
export * from './helpers/eventIndex.js';

// イベントの詳細表示要素（detailsタグ）の構築に関する関数群
// - createEventItem()
// - buildRemainText()
// - buildBanner()
// - buildTitle()
// - buildDetails() など
export * from './helpers/eventItem.js';

// イベントの状態判定ロジック（新着・緊急イベントかどうか）を管理
// - isUrgent()
// - isNew() など
export * from './helpers/eventStatus.js';
