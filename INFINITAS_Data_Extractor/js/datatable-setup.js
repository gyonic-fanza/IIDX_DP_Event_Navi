function createTableHeader(columns) {
  const thead = $('#csvTable thead').empty();
  const tfoot = $('#csvTable tfoot').empty();
  const headerRow = $('<tr></tr>');
  const filterRow = $('<tr></tr>');
  const footerRow = $('<tr></tr>');

  columns.forEach(col => {
    headerRow.append(`<th>${col.title}</th>`);
    if (dropdownFilterCols.includes(col.title)) {
      filterRow.append(`<th><select><option value="">All</option></select></th>`);
    } else {
      filterRow.append('<th></th>');
    }
    footerRow.append('<th></th>');
  });

  thead.append(headerRow, filterRow);
  tfoot.append(footerRow);
}

function applyFilters(api, columns) {
  api.columns().every(function (colIndex) {
    const column = this;
    const headerText = column.header().textContent;
    const headerCell = $(column.header()).closest('table').find('thead tr:eq(1) th').eq(colIndex);

    if (dropdownFilterCols.includes(headerText)) {
      const select = $('select', headerCell).off().on('change', function () {
        const val = $.fn.dataTable.util.escapeRegex($(this).val());
        column.search(val ? `^${val}$` : '', true, false).draw();
      });

      const uniqueValues = new Set();
      column.data().each(value => {
        if (value && value.trim()) uniqueValues.add(value.trim());
      });

      Array.from(uniqueValues).sort().forEach(d => {
        select.append(`<option value="${d}">${d}</option>`);
      });
    }
  });
}

function loadData(playType) {
  const csvUrl = urls[playType];

  Papa.parse(csvUrl, {
    download: true,
    header: true,
    skipEmptyLines: true,
    complete: function (results) {
      const rawData = results.data;

      // 除外列に「バージョン」追加
      const excludedColumns = ["最終プレイ日時", "プレイ回数", "バージョン"];

      const validData = rawData.map(row => {
        excludedColumns.forEach(col => delete row[col]);
        return row;
      }).filter(row => row && Object.values(row).some(val => val));

const desiredOrder = ["レベル", "曲名", "難易度", "クリアタイプ", "DJレベル", "スコア", "ミスカウント"];
const allKeys = Object.keys(validData[0]);

const columns = desiredOrder
  .filter(key => allKeys.includes(key))
  .map(key => ({ title: key, data: key }))
  .concat(
    allKeys
      .filter(key => !desiredOrder.includes(key))
      .map(key => ({ title: key, data: key }))
  );

      createTableHeader(columns);

      if ($.fn.DataTable.isDataTable('#csvTable')) {
        $('#csvTable').DataTable().destroy();
      }

      const table = $('#csvTable').DataTable({
        data: validData,
        columns: columns,
        responsive: true,
        pageLength: 50,
        orderCellsTop: true,
        language: {
          url: "https://cdn.datatables.net/plug-ins/1.13.4/i18n/en-GB.json"
        },
        rowCallback: function (row, data) {
          const level = data["難易度"];
          if (!level) return;

          const levelClassMap = {
            "BEGINNER": "diff-beginner",
            "NORMAL": "diff-normal",
            "HYPER": "diff-hyper",
            "ANOTHER": "diff-another",
            "LEGGENDARIA": "diff-legg"
          };

          const className = levelClassMap[level.trim().toUpperCase()];
          if (className) $(row).addClass(className);
        },
        footerCallback: function (row, data, start, end, display) {
          const api = this.api();
          const footerCells = $(api.table().footer()).find('th');

          // クリアタイプのカウント
          const clearColIndex = api.columns().header().toArray().findIndex(th => $(th).text().trim() === "クリアタイプ");
          if (clearColIndex >= 0) {
            const clears = api.column(clearColIndex, { search: 'applied' }).data().toArray();
            const clearCounts = {};
            clears.forEach(c => {
              if (c) clearCounts[c] = (clearCounts[c] || 0) + 1;
            });
            const summary = Object.entries(clearCounts).map(([k, v]) => `${k}: ${v}`).join("<br>");
            footerCells.eq(clearColIndex).html(summary);
          }

          // DJレベルのカウント
          const djLevelColIndex = api.columns().header().toArray().findIndex(th => $(th).text().trim() === "DJレベル");
          if (djLevelColIndex >= 0) {
            const djLevels = api.column(djLevelColIndex, { search: 'applied' }).data().toArray();
            const djCounts = {};
            djLevels.forEach(lv => {
              if (lv) djCounts[lv] = (djCounts[lv] || 0) + 1;
            });
            const summary = Object.entries(djCounts).map(([k, v]) => `${k}: ${v}`).join("<br>");
            footerCells.eq(djLevelColIndex).html(summary);
          }
        },
        initComplete: function () {
          applyFilters(this.api(), columns);
        }
      });
    }
  });
}
