import { fetchEventData } from './api.js';

function getQueryParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    animation: params.get('animation') || 'fade',
    interval: parseInt(params.get('interval'), 10) || 5000
  };
}

async function startSlideshow() {
  const { animation, interval } = getQueryParams();
  const events = await fetchEventData('DP');

  const banners = events
    .map(e => e.banner_url?.trim())
    .filter(url => url && !url.toLowerCase().includes('no_image'));

  if (banners.length === 0) return;

  const [imgA, imgB] = [document.getElementById('imgA'), document.getElementById('imgB')];
  let front = imgA;
  let back = imgB;
  let index = 0;

  function showNext() {
    const url = banners[index];
    const tempImg = new Image();

    tempImg.onload = () => {
      back.src = url;
      back.style.zIndex = 1;
      back.style.opacity = 1;

      front.style.zIndex = 0;
      front.style.opacity = 0;

      // 画像入れ替え
      [front, back] = [back, front];
      index = (index + 1) % banners.length;
    };

    tempImg.onerror = () => {
      console.warn('Image failed to load:', url);
      index = (index + 1) % banners.length;
      showNext(); // スキップ
    };

    tempImg.src = url;
  }

  // 初期画像をセット
  front.src = banners[0];
  front.style.opacity = 1;
  index = 1;

  setInterval(showNext, interval);
}

startSlideshow();
