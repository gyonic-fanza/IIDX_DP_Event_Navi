import { fetchEventData } from './api.js';
import { renderEvents } from './renderEvents.js';

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('event-list');
  const playType = document.body.dataset.playtype || 'DP'; // デフォルトはDP

  try {
    const data = await fetchEventData(playType); // SP or DPを渡す
    renderEvents(data, container);
  } catch (err) {
    console.error('Failed to load event data:', err);
    container.textContent = 'Failed to load event data.';
  }
});
