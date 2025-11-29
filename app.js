let data = null;
let chart = null;
let dailyData = null;
let dailyChart = null;

// データを直接定義（CORSエラーを回避）
const stepData = {
  "months": [
    "3月2024",
    "４月",
    "5月",
    "6月",
    "7月",
    "8月",
    "9月",
    "10月",
    "11月",
    "12月",
    "1月2025",
    "2月2025",
    "3月2025",
    "4月2025",
    "5月2025",
    "6月2025",
    "7月2025",
    "8月2025",
    "9月2025",
    "10月2025",
    "11月2025"
  ],
  "participants": [
    {
      "name": "加賀藩",
      "steps": [
        null,
        null,
        null,
        8616,
        8744,
        9880,
        3991,
        4830,
        4445,
        4656,
        2493,
        3931,
        3524,
        4182,
        4438,
        6030,
        7175,
        3801,
        3437,
        5720,
        5033
      ]
    },
    {
      "name": "ボブ",
      "steps": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        3735,
        3695,
        2354,
        2433,
        1395,
        null,
        null,
        null,
        null,
        null,
        null,
        4128
      ]
    },
    {
      "name": "元キリギリス",
      "steps": [
        8459,
        8744,
        8766,
        6662,
        6085,
        4125,
        5246,
        9263,
        9257,
        7598,
        5779,
        6554,
        6094,
        6105,
        6574,
        5653,
        4517,
        4280,
        7135,
        10087,
        9446
      ]
    },
    {
      "name": "孫次郎",
      "steps": [
        8220,
        6491,
        7333,
        7354,
        7031,
        7166,
        6984,
        5582,
        5767,
        6684,
        7267,
        7601,
        7089,
        6683,
        7228,
        7689,
        8608,
        8003,
        6937,
        6622,
        6678
      ]
    },
    {
      "name": "すーさん",
      "steps": [
        7748,
        7783,
        7879,
        6150,
        5039,
        6095,
        5703,
        6739,
        5847,
        8110,
        9278,
        10170,
        9301,
        8121,
        6515,
        6322,
        5442,
        5720,
        7986,
        8816,
        12042
      ]
    },
    {
      "name": "見習いのコウキ",
      "steps": [
        12357,
        11359,
        9814,
        9142,
        8897,
        14337,
        14798,
        13002,
        14949,
        17851,
        14706,
        15984,
        13375,
        12497,
        11409,
        14902,
        14662,
        15267,
        11437,
        10942,
        12861
      ]
    },
    {
      "name": "ハッチ",
      "steps": [
        1835,
        null,
        null,
        null,
        1366,
        null,
        null,
        6690,
        3689,
        2061,
        null,
        2162,
        1556,
        3108,
        6217,
        null,
        1011,
        null,
        1706,
        2417,
        2777
      ]
    },
    {
      "name": "すし",
      "steps": [
        9394,
        7085,
        6781,
        4695,
        3065,
        3107,
        1870,
        2130,
        7594,
        8709,
        7983,
        6500,
        8289,
        10147,
        9562,
        8256,
        6604,
        8701,
        6285,
        5676,
        6252
      ]
    },
    {
      "name": "サキ",
      "steps": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        2173,
        2490,
        1819,
        1847,
        2042,
        2250,
        2404,
        2238,
        1999,
        2001,
        2094,
        2365,
        1865
      ]
    },
    {
      "name": "かがやん",
      "steps": [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        6371
      ]
    }
  ]
};

// データを読み込む
function loadData() {
    data = stepData;
    initializeApp();
}

// アプリを初期化
function initializeApp() {
    populateParticipantFilter();
    renderChart();
    renderStats();
    setupEventListeners();
    initializeDailyData();
}

// 参加者フィルターを設定
function populateParticipantFilter() {
    const filter = document.getElementById('participant-filter');
    data.participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant.name;
        option.textContent = participant.name;
        filter.appendChild(option);
    });
}

// テーブルをレンダリング
function renderTable(filteredParticipant = 'all') {
    const tbody = document.querySelector('#data-table tbody');
    const thead = document.querySelector('#data-table thead tr');
    
    // ヘッダーをクリアして再構築
    thead.innerHTML = '<th>参加者</th>';
    data.months.forEach(month => {
        const th = document.createElement('th');
        th.textContent = month;
        thead.appendChild(th);
    });

    // ボディをクリア
    tbody.innerHTML = '';

    // 参加者データを表示
    data.participants.forEach(participant => {
        if (filteredParticipant !== 'all' && participant.name !== filteredParticipant) {
            return;
        }

        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = participant.name;
        tr.appendChild(nameTd);

        participant.steps.forEach(step => {
            const td = document.createElement('td');
            const span = document.createElement('span');
            if (step === null) {
                span.textContent = '-';
                span.className = 'step-value null';
            } else {
                span.textContent = step.toLocaleString();
                span.className = 'step-value';
            }
            td.appendChild(span);
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// グラフをレンダリング
function renderChart(filteredParticipant = 'all') {
    const ctx = document.getElementById('steps-chart');
    
    // 既存のチャートを破棄
    if (chart) {
        chart.destroy();
    }

    const participantsToShow = filteredParticipant === 'all' 
        ? data.participants 
        : data.participants.filter(p => p.name === filteredParticipant);

    const datasets = participantsToShow.map((participant, index) => {
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)'
        ];

        return {
            label: participant.name,
            data: participant.steps.map(step => step === null ? null : step),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.months,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return value === null ? 'データなし' : context.dataset.label + ': ' + value.toLocaleString() + '歩';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '歩数'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '月'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 統計情報をレンダリング
function renderStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';

    data.participants.forEach(participant => {
        const stats = calculateStats(participant);
        const card = document.createElement('div');
        card.className = 'stat-card';
        
        card.innerHTML = `
            <h3>${participant.name}</h3>
            <div class="stat-item">
                <span class="stat-label">合計歩数:</span>
                <span class="stat-value">${stats.total.toLocaleString()}歩</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">平均歩数:</span>
                <span class="stat-value">${stats.average.toLocaleString()}歩</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最大歩数:</span>
                <span class="stat-value">${stats.max.toLocaleString()}歩</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最小歩数:</span>
                <span class="stat-value">${stats.min.toLocaleString()}歩</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">データ数:</span>
                <span class="stat-value">${stats.count}ヶ月</span>
            </div>
        `;
        
        container.appendChild(card);
    });
}

// 統計を計算
function calculateStats(participant) {
    const validSteps = participant.steps.filter(step => step !== null);
    
    if (validSteps.length === 0) {
        return {
            total: 0,
            average: 0,
            max: 0,
            min: 0,
            count: 0
        };
    }

    const total = validSteps.reduce((sum, step) => sum + step, 0);
    const average = Math.round(total / validSteps.length);
    const max = Math.max(...validSteps);
    const min = Math.min(...validSteps);

    return {
        total,
        average,
        max,
        min,
        count: validSteps.length
    };
}

// イベントリスナーを設定
function setupEventListeners() {
    // ビュー切り替え
    document.getElementById('table-view-btn').addEventListener('click', () => {
        switchView('table');
    });

    document.getElementById('chart-view-btn').addEventListener('click', () => {
        switchView('chart');
    });

    // フィルター変更
    document.getElementById('participant-filter').addEventListener('change', (e) => {
        const selected = e.target.value;
        renderTable(selected);
        renderChart(selected);
    });
}

// ビューを切り替え
function switchView(view) {
    const tableView = document.getElementById('table-view');
    const chartView = document.getElementById('chart-view');
    const tableBtn = document.getElementById('table-view-btn');
    const chartBtn = document.getElementById('chart-view-btn');

    if (view === 'table') {
        tableView.classList.add('active');
        chartView.classList.remove('active');
        tableBtn.classList.add('active');
        chartBtn.classList.remove('active');
    } else {
        chartView.classList.add('active');
        tableView.classList.remove('active');
        chartBtn.classList.add('active');
        tableBtn.classList.remove('active');
        const selected = document.getElementById('participant-filter').value;
        renderChart(selected);
    }
}

// 11月の日別データ
const novemberDailyData = [
  {
    "チーム": "うさぎさんチーム",
    "名前": "見習いのコウキ",
    "登録名": 11814.0,
    "45962": 18257.0, "45963": 16943.0, "45964": 16058.0, "45965": 14825.0, "45966": 14359.0,
    "45967": 14359, "45968": 14767.0, "45969": 13714.0, "45970": 14713.0, "45971": 14407.0,
    "45972": 14224.0, "45973": 13899.0, "45974": 13899.0, "45975": 13899.0, "45976": 13899.0,
    "45977": 13899.0, "45978": 13549.0, "45979": 13549.0, "45980": 13220.0, "45981": 13215.0,
    "45982": 13215.0, "45983": 13215.0, "45984": 13917.0, "45985": 13917.0, "45986": 13917.0,
    "45987": 12938.0, "45988": 12938, "45989": 12861, "45990": NaN, "45991": NaN,
    "結果": 12861
  },
  {
    "チーム": "かめさんチーム",
    "名前": "すーさん",
    "登録名": 16931.0,
    "45962": 12495.0, "45963": 15490.0, "45964": 13468.0, "45965": 14517.0, "45966": 13999.0,
    "45967": 13999, "45968": 12400.0, "45969": 11935.0, "45970": 12777.0, "45971": 12815.0,
    "45972": 13404.0, "45973": 12940.0, "45974": 12940.0, "45975": 12940.0, "45976": 12940.0,
    "45977": 12940.0, "45978": 12256.0, "45979": 12256.0, "45980": 11604.0, "45981": 11848.0,
    "45982": 11848.0, "45983": 11848.0, "45984": 11959.0, "45985": 11959.0, "45986": 11959.0,
    "45987": 11994.0, "45988": 11994, "45989": 12042, "45990": NaN, "45991": NaN,
    "結果": 12042
  },
  {
    "チーム": "うさぎさんチーム",
    "名前": "元キリギリス",
    "登録名": 10325.0,
    "45962": 10604.0, "45963": 8690.0, "45964": 8515.0, "45965": 9132.0, "45966": 9749.0,
    "45967": 9749, "45968": 10442.0, "45969": 9566.0, "45970": 10253.0, "45971": 10418.0,
    "45972": 10573.0, "45973": 10639.0, "45974": 10639.0, "45975": 10639.0, "45976": 10639.0,
    "45977": 10639.0, "45978": 10037.0, "45979": 10037.0, "45980": 10265.0, "45981": 10554.0,
    "45982": 10554.0, "45983": 10554.0, "45984": 10116.0, "45985": 10116.0, "45986": 10116.0,
    "45987": 9657.0, "45988": 9657, "45989": 9446, "45990": NaN, "45991": NaN,
    "結果": 9446
  },
  {
    "チーム": "かめさんチーム",
    "名前": "孫次郎",
    "登録名": 11460.0,
    "45962": 9617.0, "45963": 10117.0, "45964": 8054.0, "45965": 8315.0, "45966": 7363.0,
    "45967": 7363, "45968": 6860.0, "45969": 6695.0, "45970": 6814.0, "45971": 6339.0,
    "45972": 7153.0, "45973": 6714.0, "45974": 6714.0, "45975": 6714.0, "45976": 6714.0,
    "45977": 6714.0, "45978": 6164.0, "45979": 6164.0, "45980": 6323.0, "45981": 6200.0,
    "45982": 6200.0, "45983": 6200.0, "45984": 6847.0, "45985": 6847.0, "45986": 6847.0,
    "45987": 6702.0, "45988": 6702, "45989": 6678, "45990": NaN, "45991": NaN,
    "結果": 6678
  },
  {
    "チーム": "かめさんチーム",
    "名前": "すし",
    "登録名": NaN,
    "45962": NaN, "45963": NaN, "45964": 3606.0, "45965": 5593.0, "45966": 4990.0,
    "45967": 4990, "45968": 5464.0, "45969": 5294.0, "45970": 5810.0, "45971": 5713.0,
    "45972": 6091.0, "45973": 6187.0, "45974": 6187.0, "45975": 6187.0, "45976": 6187.0,
    "45977": 6187.0, "45978": 6145.0, "45979": 6145.0, "45980": 6484.0, "45981": 6484.0,
    "45982": 6484.0, "45983": 6484.0, "45984": 6484.0, "45985": 6484.0, "45986": 6484.0,
    "45987": 6484.0, "45988": 6484, "45989": 6252, "45990": NaN, "45991": NaN,
    "結果": 6252
  },
  {
    "チーム": "うさぎさんチーム",
    "名前": "加賀藩",
    "登録名": NaN,
    "45962": NaN, "45963": NaN, "45964": 2771.0, "45965": 4031.0, "45966": 4592.0,
    "45967": 4592, "45968": 5550.0, "45969": 3739.0, "45970": 4627.0, "45971": 4865.0,
    "45972": 5200.0, "45973": 5877.0, "45974": 5877.0, "45975": 5877.0, "45976": 5877.0,
    "45977": 5877.0, "45978": 5217.0, "45979": 5217.0, "45980": 5410.0, "45981": 5334.0,
    "45982": 5334.0, "45983": 5334.0, "45984": 5775.0, "45985": 5775.0, "45986": 5775.0,
    "45987": 5107.0, "45988": 5107, "45989": 5033, "45990": NaN, "45991": NaN,
    "結果": 5033
  },
  {
    "チーム": "かめさんチーム",
    "名前": "ボブ",
    "登録名": 0.0,
    "45962": NaN, "45963": NaN, "45964": NaN, "45965": NaN, "45966": NaN,
    "45967": 0, "45968": NaN, "45969": NaN, "45970": NaN, "45971": NaN,
    "45972": NaN, "45973": NaN, "45974": NaN, "45975": NaN, "45976": NaN,
    "45977": NaN, "45978": 3392.0, "45979": 3392.0, "45980": 3315.0, "45981": 3394.0,
    "45982": 3394.0, "45983": 3394.0, "45984": 3245.0, "45985": 3245.0, "45986": 3245.0,
    "45987": 3227.0, "45988": 3227, "45989": 4128, "45990": NaN, "45991": NaN,
    "結果": 4128
  },
  {
    "チーム": "うさぎさんチーム",
    "名前": "ハッチ",
    "登録名": 6754.0,
    "45962": 6754.0, "45963": 4673.0, "45964": 4673.0, "45965": 4673.0, "45966": 4673.0,
    "45967": 4673, "45968": 4673.0, "45969": 4673.0, "45970": 4673.0, "45971": 4673.0,
    "45972": 4673.0, "45973": 4673.0, "45974": 4673.0, "45975": 4673.0, "45976": 4673.0,
    "45977": 4673.0, "45978": 2777.0, "45979": 2777.0, "45980": 2777.0, "45981": 2777.0,
    "45982": 2777.0, "45983": 2777.0, "45984": 2777.0, "45985": 2777.0, "45986": 2777.0,
    "45987": 2777.0, "45988": 2777, "45989": 2777, "45990": NaN, "45991": NaN,
    "結果": 2777
  },
  {
    "チーム": "かめさんチーム",
    "名前": "サキ",
    "登録名": 3466.0,
    "45962": 2448.0, "45963": 1844.0, "45964": 1693.0, "45965": 2054.0, "45966": 1924.0,
    "45967": 1924, "45968": 1767.0, "45969": 1691.0, "45970": 1745.0, "45971": 1738.0,
    "45972": 1818.0, "45973": 1784.0, "45974": 1784.0, "45975": 1784.0, "45976": 1784.0,
    "45977": 1784.0, "45978": 1841.0, "45979": 1841.0, "45980": 1871.0, "45981": 1826.0,
    "45982": 1826.0, "45983": 1826.0, "45984": 1893.0, "45985": 1893.0, "45986": 1893.0,
    "45987": 1842.0, "45988": 1842, "45989": 1865, "45990": NaN, "45991": NaN,
    "結果": 1865
  },
  {
    "チーム": "うさぎさんチーム",
    "名前": "かがやん",
    "登録名": 0.0,
    "45962": NaN, "45963": NaN, "45964": NaN, "45965": NaN, "45966": NaN,
    "45967": 0, "45968": NaN, "45969": NaN, "45970": NaN, "45971": NaN,
    "45972": NaN, "45973": NaN, "45974": NaN, "45975": NaN, "45976": NaN,
    "45977": NaN, "45978": NaN, "45979": NaN, "45980": NaN, "45981": NaN,
    "45982": NaN, "45983": NaN, "45984": NaN, "45985": NaN, "45986": NaN,
    "45987": NaN, "45988": 6371, "45989": 6371, "45990": NaN, "45991": NaN,
    "結果": 6371
  }
];

// 日別データを変換する関数（45962-45991を1-30日に変換）
function convertDailyData(rawData) {
  const days = Array.from({length: 30}, (_, i) => `${i + 1}日`);
  const startDateKey = 45962; // 11月1日に対応するキー
  
  const participants = rawData.map(person => {
    const steps = [];
    for (let i = 0; i < 30; i++) {
      const dateKey = String(startDateKey + i);
      const value = person[dateKey];
      // NaNやnullをnullに変換
      if (value === null || value === undefined || (typeof value === 'number' && isNaN(value))) {
        steps.push(null);
      } else {
        steps.push(Math.round(value));
      }
    }
    return {
      name: person["名前"],
      steps: steps
    };
  });

  return {
    month: "11月2025",
    days: days,
    participants: participants
  };
}

// 11月の日別データ
const dailyStepData = convertDailyData(novemberDailyData);

// 日別データを初期化
function initializeDailyData() {
    dailyData = dailyStepData;
    if (dailyData.participants.length > 0) {
        populateDailyParticipantFilter();
        renderDailyChart();
        setupDailyEventListeners();
    } else {
        // データがない場合はセクションを非表示
        document.getElementById('daily-section').style.display = 'none';
    }
}

// 日別データの参加者フィルターを設定
function populateDailyParticipantFilter() {
    const filter = document.getElementById('daily-participant-filter');
    filter.innerHTML = '<option value="all">すべて表示</option>';
    dailyData.participants.forEach(participant => {
        const option = document.createElement('option');
        option.value = participant.name;
        option.textContent = participant.name;
        filter.appendChild(option);
    });
}

// 日別データのテーブルをレンダリング
function renderDailyTable(filteredParticipant = 'all') {
    const tbody = document.querySelector('#daily-data-table tbody');
    const thead = document.querySelector('#daily-data-table thead tr');
    
    // ヘッダーをクリアして再構築
    thead.innerHTML = '<th>参加者</th>';
    dailyData.days.forEach(day => {
        const th = document.createElement('th');
        th.textContent = day;
        thead.appendChild(th);
    });

    // ボディをクリア
    tbody.innerHTML = '';

    // 参加者データを表示
    dailyData.participants.forEach(participant => {
        if (filteredParticipant !== 'all' && participant.name !== filteredParticipant) {
            return;
        }

        const tr = document.createElement('tr');
        const nameTd = document.createElement('td');
        nameTd.textContent = participant.name;
        tr.appendChild(nameTd);

        participant.steps.forEach(step => {
            const td = document.createElement('td');
            const span = document.createElement('span');
            if (step === null || step === undefined) {
                span.textContent = '-';
                span.className = 'step-value null';
            } else {
                span.textContent = step.toLocaleString();
                span.className = 'step-value';
            }
            td.appendChild(span);
            tr.appendChild(td);
        });

        tbody.appendChild(tr);
    });
}

// 日別データのグラフをレンダリング
function renderDailyChart(filteredParticipant = 'all') {
    const ctx = document.getElementById('daily-steps-chart');
    
    // 既存のチャートを破棄
    if (dailyChart) {
        dailyChart.destroy();
    }

    const participantsToShow = filteredParticipant === 'all' 
        ? dailyData.participants 
        : dailyData.participants.filter(p => p.name === filteredParticipant);

    const datasets = participantsToShow.map((participant, index) => {
        const colors = [
            'rgba(102, 126, 234, 0.8)',
            'rgba(118, 75, 162, 0.8)',
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)',
            'rgba(153, 102, 255, 0.8)',
            'rgba(255, 159, 64, 0.8)',
            'rgba(199, 199, 199, 0.8)',
            'rgba(83, 102, 255, 0.8)',
            'rgba(255, 99, 255, 0.8)'
        ];

        return {
            label: participant.name,
            data: participant.steps.map(step => step === null || step === undefined ? null : step),
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
            borderWidth: 2,
            fill: false,
            tension: 0.4,
            pointRadius: 3,
            pointHoverRadius: 5
        };
    });

    dailyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dailyData.days,
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return value === null ? 'データなし' : context.dataset.label + ': ' + value.toLocaleString() + '歩';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '歩数'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString();
                        }
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: '日'
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            }
        }
    });
}

// 日別データのイベントリスナーを設定
function setupDailyEventListeners() {
    // ビュー切り替え
    document.getElementById('daily-table-view-btn').addEventListener('click', () => {
        switchDailyView('table');
    });

    document.getElementById('daily-chart-view-btn').addEventListener('click', () => {
        switchDailyView('chart');
    });

    // フィルター変更
    document.getElementById('daily-participant-filter').addEventListener('change', (e) => {
        const selected = e.target.value;
        renderDailyTable(selected);
        renderDailyChart(selected);
    });
}

// 日別データのビューを切り替え
function switchDailyView(view) {
    const tableView = document.getElementById('daily-table-view');
    const chartView = document.getElementById('daily-chart-view');
    const tableBtn = document.getElementById('daily-table-view-btn');
    const chartBtn = document.getElementById('daily-chart-view-btn');

    if (view === 'table') {
        tableView.classList.add('active');
        chartView.classList.remove('active');
        tableBtn.classList.add('active');
        chartBtn.classList.remove('active');
    } else {
        chartView.classList.add('active');
        tableView.classList.remove('active');
        chartBtn.classList.add('active');
        tableBtn.classList.remove('active');
        const selected = document.getElementById('daily-participant-filter').value;
        renderDailyChart(selected);
    }
}

// ページ読み込み時にデータを読み込む
loadData();

