
const config = window.AppConfig || {};
const dogTag = document.getElementById('dogTag');
const fixedRankOrder = ['AAA', 'AA', 'A', 'B', 'C', 'D', 'E', 'F'];
const fixedLampOrder = ['FULLCOMBO', 'EX-HARD', 'HARD', 'CLEAR', 'EASY', 'ASSIST', 'FAILED', 'NP'];

fetch('./tracker.tsv')
  .then(response => response.text())
  .then(tsv => {
    const lines = tsv.split('\n').filter(l => l.trim());
    const headers = lines[0].split('\t');

    const calculateTotalDJPoints = (mode) => {
      let sum = 0;
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        const idx = headers.indexOf(`${mode} DJ Points`);
        const val = parseFloat(cols[idx]);
        if (!isNaN(val)) sum += val;
      }
      return Math.round(sum * 1000) / 1000;
    };

const totalSP = Math.round(calculateTotalDJPoints('SP'));
const totalDP = Math.round(calculateTotalDJPoints('DP'));
const totalAll = totalSP + totalDP;

    fetch('./tracker.tsv', { method: 'HEAD' })
      .then(headRes => {
        const lastModified = headRes.headers.get('Last-Modified');
        const formattedDate = lastModified
          ? new Date(lastModified).toLocaleString('ja-JP', {
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit'
            })
          : 'N/A';

        if (dogTag && config) {
          dogTag.innerHTML = `
            <h2>${config.djName || 'N/A'}</h2>
            <h3>(INFINITAS ID: ${config.infinitasId || 'N/A'})</h3>
            <div class="id-line">
              SP${config.SPClass || '-'} / DP${config.DPClass || '-'} ,
              DJ Points: ${totalAll.toLocaleString()}
              (SP: ${totalSP.toLocaleString()} / DP: ${totalDP.toLocaleString()})
            </div>
            <div class="id-line">Last-Modified: ${formattedDate}</div>
          `;
        }
      });

/**
 * TSVデータを指定のモードと譜面タイプで表示する。
 * @param {string} mode - 表示モード（例: "dp" や "sp"）
 * @param {string[]} types - 譜面タイプ（例: ["DPA", "DPH", "DPN"]）
 */
const setupViewer = (mode, types) => {
      const tbody = document.querySelector(`#${mode}Table tbody`);
      tbody.innerHTML = '';

      const colIndex = {
        title: headers.indexOf('title'),
        types: types,
        rating: {}, lamp: {}, rank: {}, exscore: {}, miss: {}, notes: {}, djpts: {}
      };

      colIndex.types.forEach(type => {
        colIndex.rating[type] = headers.indexOf(type + ' Rating');
        colIndex.lamp[type] = headers.indexOf(type + ' Lamp');
        colIndex.rank[type] = headers.indexOf(type + ' Letter');
        colIndex.exscore[type] = headers.indexOf(type + ' EX Score');
        colIndex.miss[type] = headers.indexOf(type + ' Miss Count');
        colIndex.notes[type] = headers.indexOf(type + ' Note Count');
        colIndex.djpts[type] = headers.indexOf(type + ' DJ Points');
      });

      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        const title = cols[colIndex.title];
        if (!title) continue;

        colIndex.types.forEach(chart => {
          const rating = parseFloat(cols[colIndex.rating[chart]]);
          if (!isNaN(rating) && rating > 0) {
            appendRow(title, chart, cols, colIndex, mode);
          }
        });
      }

const levelLinks = document.querySelectorAll(`#${mode}LevelLinks .level-link`);
const level12 = document.querySelector(`#${mode}LevelLinks .level-link[data-level="12"]`);
if (level12) {
  const rows = document.querySelectorAll(`#${mode}Table tbody tr`);
  rows.forEach(row => {
    const value = row.children[0].textContent.replace('☆', '');
    row.style.display = (value === '12') ? '' : 'none';
  });

  const levelLinks = document.querySelectorAll(`#${mode}LevelLinks .level-link`);
  levelLinks.forEach(l => l.classList.remove('active'));
  level12.classList.add('active');
}

      const ths = document.querySelectorAll(`#${mode}Table th`);
      ths.forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
          const index = parseInt(th.getAttribute('data-index'));
          const rows = Array.from(document.querySelector(`#${mode}Table tbody`).querySelectorAll('tr'));

          const currentOrder = th.dataset.order || 'asc';
          const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';

          ths.forEach(header => {
            header.classList.remove('active');
            header.dataset.order = '';
            header.textContent = header.textContent.replace(/[▲▼]/g, '').trim();
          });
          th.classList.add('active');
          const directionSymbol = newOrder === 'asc' ? '▲' : '▼';
          th.textContent = `${th.textContent.trim()} ${directionSymbol}`;
          th.dataset.order = newOrder;

          rows.sort((a, b) => {
            let aVal, bVal;

            if (index === 0) {
              aVal = parseInt(a.children[0].textContent.replace('☆', '')) || 0;
              bVal = parseInt(b.children[0].textContent.replace('☆', '')) || 0;
            } else if (index === 1) {
              aVal = a.children[1].textContent.split(' (')[0].toLowerCase();
              bVal = b.children[1].textContent.split(' (')[0].toLowerCase();
            } else if (index === 4) {
              aVal = parseFloat(a.children[4].textContent.replace('%', '')) || 0;
              bVal = parseFloat(b.children[4].textContent.replace('%', '')) || 0;
            } else if (index === 6) {
              aVal = parseInt(a.children[6].dataset.lamporder) || 0;
              bVal = parseInt(b.children[6].dataset.lamporder) || 0;
            } else {
              const aText = a.children[index].textContent.trim();
              const bText = b.children[index].textContent.trim();
              aVal = parseFloat(aText.replace(/[^\d.-]/g, '')) || aText;
              bVal = parseFloat(bText.replace(/[^\d.-]/g, '')) || bText;
            }

            if (aVal < bVal) return newOrder === 'asc' ? -1 : 1;
            if (aVal > bVal) return newOrder === 'asc' ? 1 : -1;
            return 0;
          });

          const tbody = document.querySelector(`#${mode}Table tbody`);
          rows.forEach(row => tbody.appendChild(row));
        });
      });

      const titleHeader = document.querySelector(`#${mode}Table th[data-index="1"]`);
      if (titleHeader) {
        titleHeader.dataset.order = 'desc';
        titleHeader.click();
      }
    };

const chartLabels = {
  'DPN': 'NORMAL', 'DPH': 'HYPER', 'DPA': 'ANOTHER', 'DPL': 'LEGGENDARIA',
  'SPB': 'BEGINNER', // ← これを追加
  'SPN': 'NORMAL', 'SPH': 'HYPER', 'SPA': 'ANOTHER', 'SPL': 'LEGGENDARIA'
};

    const getLampLabel = code => {
      const cleaned = (code || '').trim().toUpperCase().replace(/[\s　]/g, '');
      const map = {
        'FC': 'FULLCOMBO', 'EX': 'EX-HARD', 'HC': 'HARD', 'NC': 'CLEAR',
        'EC': 'EASY', 'AC': 'ASSIST', 'F': 'FAILED', 'NP': ''
      };
      return map[cleaned] ?? '';
    };

    const getLampInfo = code => {
      const cleaned = (code || '').trim().toUpperCase().replace(/[\s　]/g, '');
      const map = {
        'FC': ['FULLCOMBO', 7], 'EX': ['EX-HARD', 6], 'HC': ['HARD', 5], 'NC': ['CLEAR', 4],
        'EC': ['EASY', 3], 'AC': ['ASSIST', 2], 'F': ['FAILED', 1], 'NP': ['', 0]
      };
      return map[cleaned] ?? ['', 0];
    };
/**
 * スコアとノーツ数からランクの判定詳細を生成。
 * @param {string} rank - 判定ランク
 * @param {number} score - EXスコア
 * @param {number} notes - ノート数
 * @returns {[string, string, string]} - [ランク, スコア率%, 判定詳細]
 */
const getScoreRankLabel = (rank, score, notes) => {
      if (!notes || isNaN(notes) || notes === 0 || !rank) return [rank || '', '0.00%', '(F + 0)'];
      const maxScore = notes * 2;
      const rate = score / maxScore;
      const ratePercent = (rate * 100).toFixed(2);

      const baseTable = [
        { label: 'MAX', rate: 1.0 }, { label: 'AAA', rate: 0.88888 }, { label: 'AA', rate: 0.77777 },
        { label: 'A', rate: 0.66666 }, { label: 'B', rate: 0.55555 }, { label: 'C', rate: 0.44444 },
        { label: 'D', rate: 0.33333 }, { label: 'E', rate: 0.22222 }, { label: 'F', rate: 0.0 }
      ];

      const rankIndex = baseTable.findIndex(entry => entry.label === rank);
      if (rankIndex === -1) return [rank, `${ratePercent}%`, `(${rank} ±0)`];

      const currBaseScore = Math.floor(maxScore * baseTable[rankIndex].rate);
      const nextBaseScore = rankIndex > 0 ? Math.ceil(maxScore * baseTable[rankIndex - 1].rate) : null;

      const diffFromCurrent = score - currBaseScore;
      const diffToNext = nextBaseScore !== null ? nextBaseScore - score : Infinity;

      let label = rank;
      let diff = diffFromCurrent;
      if (nextBaseScore !== null && Math.abs(diffToNext) < Math.abs(diffFromCurrent)) {
        label = baseTable[rankIndex - 1].label;
        diff = -diffToNext;
      }

      const diffStr = diff === 0 ? '+ 0' : (diff > 0 ? `+ ${diff}` : `- ${Math.abs(diff)}`);
      return [rank, `${ratePercent}%`, `(${label} ${diffStr})`];
    };
const getClearBonus = lamp => {
  switch (lamp) {
    case 'FULLCOMBO': return 30;
    case 'EX-HARD': return 25;
    case 'HARD': return 20;
    case 'CLEAR': return 15;
    case 'EASY': return 10;
    default: return 0;
  }
};
const getLevelBonus = rank => {
  switch (rank) {
    case 'AAA': return 20;
    case 'AA': return 15;
    case 'A': return 10;
    default: return 0;
  }
};
/**
 * テーブルに1行を追加する。
 * @param {string} title - 楽曲タイトル
 * @param {string} chart - 譜面種別コード
 * @param {string[]} cols - TSVデータの行をタブで分割した配列
 * @param {Object} colIndex - 各列インデックス情報
 * @param {string} mode - 表示モード（例: "dp" や "sp"）
 */
const appendRow = (title, chart, cols, colIndex, mode) => {
      const tbody = document.querySelector(`#${mode}Table tbody`);
      const score = parseInt(cols[colIndex.exscore[chart]]) || 0;
      const noteCount = parseInt(cols[colIndex.notes[chart]]) || 0;
      const lampRaw = (cols[colIndex.lamp[chart]] || '').trim();
      const lamp = getLampLabel(lampRaw);
      const rankRaw = cols[colIndex.rank[chart]] || '';
      const ratingRaw = cols[colIndex.rating[chart]] || '';
      const rating = ratingRaw ? `☆${ratingRaw}` : '';
      const chartLabel = chartLabels[chart] || chart;

      let scoreText = '', rankLabel = '', ratePercent = '', scoreDetail = '';
      if (score > 0) {
        [rankLabel, ratePercent, scoreDetail] = getScoreRankLabel(rankRaw, score, noteCount);
        scoreText = `${score}`;
      }

      const [lampLabel, lampOrderVal] = getLampInfo(lampRaw);
const totalDJPointsIndex = headers.indexOf(`${mode.toUpperCase()} DJ Points`);
const chartDJPointsIndex = colIndex.djpts[chart];
const totalDJPoints = parseFloat(cols[totalDJPointsIndex]);
const chartDJPoints = chartDJPointsIndex !== -1 ? parseFloat(cols[chartDJPointsIndex]) : NaN;
const isEvalChart = ['SPB','SPN','SPH','SPA','SPL','DPN','DPH','DPA','DPL'].includes(chart);
let effectiveDJPoints = chartDJPoints;
if (isNaN(effectiveDJPoints) && score > 0) {
  const clearBonus = getClearBonus(lamp);
  const levelBonus = getLevelBonus(rankRaw);
  effectiveDJPoints = (score * (100 + clearBonus + levelBonus)) / 10000;
  effectiveDJPoints = Math.round(effectiveDJPoints * 1000) / 1000;
}

const round3 = val => Math.round(val * 1000) / 1000;

const isMatchingDJPoints =
  isEvalChart &&
  !isNaN(effectiveDJPoints) &&
  !isNaN(totalDJPoints) &&
  round3(effectiveDJPoints) === round3(totalDJPoints);

const tr = document.createElement('tr');
let missRaw = (cols[colIndex.miss[chart]] || '').trim();
const missCount = (missRaw === '-' || missRaw === '') ? '' : parseInt(missRaw);
tr.innerHTML = `
  <td>${rating}</td>
  <td class="title-cell${isMatchingDJPoints ? ' djpoint-match' : ''}">${title} <span class="chart ${chartLabel}">(${chartLabel})</span></td>
  <td class="rank ${rankLabel}">${scoreText}</td>
  <td class="rank ${rankLabel}">${rankLabel}</td>
  <td class="rank ${rankLabel}">${ratePercent}</td>
  <td class="rank ${rankLabel}">${scoreDetail}</td>
  <td class="lamp ${lamp}" data-lamporder="${lampOrderVal}">${lampLabel}</td>
  <td class="miss">${missCount}</td>
`;
      tbody.appendChild(tr);
    };

    setupViewer('dp', ['DPL', 'DPA', 'DPH', 'DPN']);
    document.getElementById('spView').classList.add('hidden');
setupViewer('sp', ['SPL', 'SPA', 'SPH', 'SPN', 'SPB']);
  })
  .catch(err => {
    document.body.insertAdjacentHTML('beforeend', `<p style="color:red;">tracker.tsv を読み込めませんでした。</p>`);
    console.error(err);
  });

const tabLinks = document.querySelectorAll('.tab-link');
const views = document.querySelectorAll('.mode-view');
tabLinks.forEach(tab => {
  tab.addEventListener('click', () => {
    tabLinks.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    views.forEach(view => view.classList.add('hidden'));
    const target = tab.dataset.target;
    document.getElementById(`${target}View`).classList.remove('hidden');
  });
});

document.querySelectorAll('.level-filter').forEach(filter => {
  filter.querySelectorAll('.level-link').forEach(link => {
    link.addEventListener('click', () => {
      const level = link.dataset.level;
      const mode = filter.id.replace('LevelLinks', '');
      const rows = document.querySelectorAll(`#${mode}Table tbody tr`);
      const tableEl = document.getElementById(`${mode}Table`);
      const statsEl = document.getElementById(`${mode}Stats`);

      filter.querySelectorAll('.level-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');

if (level === 'stats') {
  tableEl.classList.add('hidden');
  statsEl.classList.remove('hidden');

  const levelMap = {}; // { '9': { rank: {}, lamp: {} }, ... }
  const allRanks = new Set();
  const allLamps = new Set();

rows.forEach(row => {
  const levelText = row.children[0].textContent.trim(); // "☆9"
  const levelNum = levelText.replace('☆', '');
  if (!levelNum) return;

  if (!levelMap[levelNum]) {
    levelMap[levelNum] = { rank: {}, lamp: {} };
  }

let rank = row.children[3].textContent.trim();
if (!rank) rank = 'F'; // 空欄ならF扱い
const rankKey = rank;
  levelMap[levelNum].rank[rankKey] = (levelMap[levelNum].rank[rankKey] || 0) + 1;
  allRanks.add(rankKey);

  const lamp = row.children[6].textContent.trim();
  const lampKey = lamp || 'NP';
  levelMap[levelNum].lamp[lampKey] = (levelMap[levelNum].lamp[lampKey] || 0) + 1;
  allLamps.add(lampKey);
});

const createSummaryTable = (fixedKeys, accessor, classPrefix) => {
  const levels = Object.keys(levelMap).sort((a, b) => parseInt(a) - parseInt(b));
  const colTotals = {};
  let grandTotal = 0;

  let html = `<table><thead><tr><th>☆</th>`;
fixedKeys.forEach(k => {
const label = (k === 'NP') ? 'NOPLAY' : k;
const className = `${classPrefix} ${k}`;
html += `<th class="${className}">${label}</th>`;
});
  html += `<th>Total</th></tr></thead><tbody>`;

  levels.forEach(level => {
    html += `<tr><td>☆${level}</td>`;
    let rowTotal = 0;
    fixedKeys.forEach(k => {
      const val = levelMap[level][accessor][k] || 0;
      rowTotal += val;
      colTotals[k] = (colTotals[k] || 0) + val;
      const style = val === 0 ? ' class="zero-cell"' : '';
      html += `<td${style}>${val}</td>`;
    });
    html += `<td>${rowTotal}</td></tr>`;
    grandTotal += rowTotal;
  });

  html += `<tr><td><strong>Total</strong></td>`;
  fixedKeys.forEach(k => {
    const val = colTotals[k] || 0;
    const style = val === 0 ? ' class="zero-cell"' : '';
    html += `<td${style}><strong>${val}</strong></td>`;
  });
  html += `<td><strong>${grandTotal}</strong></td></tr></tbody></table>`;
  return html;
};

statsEl.innerHTML = `
  <div class="stats-section">
    ${createSummaryTable(fixedRankOrder, 'rank', 'rank')}
    ${createSummaryTable(fixedLampOrder, 'lamp', 'lamp')}
  </div>
`;
  return;
}
else {
  tableEl.classList.remove('hidden');
  statsEl.classList.add('hidden');


  rows.forEach(row => {
    const levelText = row.children[0].textContent.trim(); // "☆12"
    const levelNum = levelText.replace('☆', '');
    row.style.display = (!level || levelNum === level) ? '' : 'none';
  });
}

    });
  });
});