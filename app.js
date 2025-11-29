let data = null;
let chart = null;
let dailyData = null;
let dailyChart = null;
let teamComparisonChart = null;
let allDailyData = {}; // 複数月の日別データを保持 { "11月2025": {...}, "12月2025": {...} }

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
    setupEventListeners();
    initializeDailyData();
    // 日別データ初期化後に統計情報を表示（ランキング計算のため）
    renderStats();
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

// 11月の平均歩数ランキングを計算
function calculateNovemberRanking() {
    if (!dailyData || !dailyData.participants) {
        return {};
    }

    // 各参加者の11月の平均歩数を計算
    const novemberAverages = dailyData.participants.map(participant => {
        const validSteps = participant.steps.filter(step => step !== null && step !== undefined);
        const average = validSteps.length > 0 
            ? Math.round(validSteps.reduce((sum, step) => sum + step, 0) / validSteps.length)
            : 0;
        return {
            name: participant.name,
            average: average
        };
    });

    // 平均歩数でソート（降順）
    novemberAverages.sort((a, b) => b.average - a.average);

    // 1位から5位までのランキングを作成
    const ranking = {};
    novemberAverages.slice(0, 5).forEach((item, index) => {
        ranking[item.name] = index + 1;
    });

    return ranking;
}

// 統計情報をレンダリング
function renderStats() {
    const container = document.getElementById('stats-container');
    container.innerHTML = '';

    // 11月のランキングを取得
    const novemberRanking = calculateNovemberRanking();
    
    // 11月の平均歩数を取得してソート用のデータを作成
    const participantsWithNovemberAverage = data.participants.map(participant => {
        let novemberAverage = 0;
        if (dailyData && dailyData.participants) {
            const dailyParticipant = dailyData.participants.find(p => p.name === participant.name);
            if (dailyParticipant) {
                const validSteps = dailyParticipant.steps.filter(step => step !== null && step !== undefined);
                if (validSteps.length > 0) {
                    novemberAverage = Math.round(validSteps.reduce((sum, step) => sum + step, 0) / validSteps.length);
                }
            }
        }
        return {
            participant: participant,
            novemberAverage: novemberAverage
        };
    });
    
    // 11月の平均歩数でソート（降順）
    participantsWithNovemberAverage.sort((a, b) => b.novemberAverage - a.novemberAverage);

    // ランキングアイコンのHTMLを生成
    function getRankingIcon(rank) {
        const icons = {
            1: '🥇',
            2: '🥈',
            3: '🥉',
            4: '4️⃣',
            5: '5️⃣'
        };
        return icons[rank] || '';
    }

    participantsWithNovemberAverage.forEach(({ participant, novemberAverage }) => {
        const stats = calculateStats(participant);
        const rank = novemberRanking[participant.name];
        const rankingIcon = rank ? getRankingIcon(rank) : '';
        
        const card = document.createElement('div');
        card.className = 'stat-card';
        
        card.innerHTML = `
            <h3>${participant.name}${rankingIcon ? ' ' + rankingIcon : ''}</h3>
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
      team: person["チーム"],
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
let dailyStepData = convertDailyData(novemberDailyData);

// 日別データを初期化
function initializeDailyData() {
    // 初期データをallDailyDataに追加
    if (dailyStepData && dailyStepData.participants.length > 0) {
        allDailyData[dailyStepData.month] = dailyStepData;
    }
    
    // 利用可能な月があれば、最初の月を表示
    const availableMonths = Object.keys(allDailyData);
    if (availableMonths.length > 0) {
        const defaultMonth = availableMonths[availableMonths.length - 1]; // 最新の月
        dailyData = allDailyData[defaultMonth];
        
        updateMonthSelectors();
        selectDailyMonth(defaultMonth);
        selectTeamMonth(defaultMonth);
        setupDailyEventListeners();
    } else {
        // データがない場合はセクションを非表示
        document.getElementById('daily-section').style.display = 'none';
        document.getElementById('team-comparison-section').style.display = 'none';
    }
}

// チーム平均値比較グラフをレンダリング
function renderTeamComparisonChart() {
    const ctx = document.getElementById('team-comparison-chart');
    
    if (!dailyData || !dailyData.participants || dailyData.participants.length === 0) {
        console.warn('日別データがありません。チーム比較グラフを描画できません。');
        return;
    }
    
    // 既存のチャートを破棄
    if (teamComparisonChart) {
        teamComparisonChart.destroy();
    }

    // チームごとにデータをグループ化
    const teams = {};
    dailyData.participants.forEach(participant => {
        // チーム情報がない場合はスキップ
        if (!participant.team || participant.team.trim() === '') {
            console.warn(`参加者 "${participant.name}" にチーム情報がありません`);
            return;
        }
        
        if (!teams[participant.team]) {
            teams[participant.team] = [];
        }
        teams[participant.team].push(participant);
    });

    console.log('チームグループ:', Object.keys(teams));
    console.log('各チームの参加者数:', Object.keys(teams).map(team => `${team}: ${teams[team].length}人`));
    console.log('dailyData.days:', dailyData.days);
    console.log('dailyData.days.length:', dailyData.days ? dailyData.days.length : 0);

    // 日数が30日固定ではなく、実際の日数を使用
    // 参加者のステップ配列の長さから日数を取得（days配列が空の場合のフォールバック）
    let dayCount = dailyData.days ? dailyData.days.length : 0;
    if (dayCount === 0 && dailyData.participants.length > 0) {
        // days配列が空の場合は、最初の参加者のステップ配列の長さを使用
        dayCount = dailyData.participants[0].steps ? dailyData.participants[0].steps.length : 0;
        console.log(`days配列が空のため、参加者のステップ配列から日数を取得: ${dayCount}日`);
    }
    
    if (dayCount === 0) {
        console.error('日数が0です。データが正しく読み込まれていません。');
        return;
    }

    // チームごとの日別平均値を計算
    const teamAverages = {};
    Object.keys(teams).forEach(teamName => {
        const teamMembers = teams[teamName];
        const dailyAverages = [];
        
        for (let day = 0; day < dayCount; day++) {
            let sum = 0;
            let count = 0;
            
            teamMembers.forEach(member => {
                if (member.steps && member.steps[day] !== null && member.steps[day] !== undefined) {
                    sum += member.steps[day];
                    count++;
                }
            });
            
            dailyAverages.push(count > 0 ? Math.round(sum / count) : null);
        }
        
        teamAverages[teamName] = dailyAverages;
    });

    console.log('チーム平均値:', Object.keys(teamAverages).map(team => `${team}: ${teamAverages[team].filter(v => v !== null).length}日分のデータ`));

    // データセットを作成
    const datasets = Object.keys(teamAverages).map((teamName, index) => {
        const colors = [
            'rgba(102, 126, 234, 0.8)',  // うさぎさんチーム用
            'rgba(118, 75, 162, 0.8)'    // かめさんチーム用
        ];
        
        return {
            label: teamName,
            data: teamAverages[teamName],
            borderColor: colors[index % colors.length],
            backgroundColor: colors[index % colors.length].replace('0.8', '0.2'),
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });

    if (datasets.length === 0) {
        console.error('チームデータが見つかりません。チーム情報が正しく読み込まれているか確認してください。');
        return;
    }

    console.log(`チーム比較グラフを描画します（${datasets.length}チーム）`);

    teamComparisonChart = new Chart(ctx, {
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
                            size: 14,
                            weight: 'bold'
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return value === null ? 'データなし' : context.dataset.label + ': ' + value.toLocaleString() + '歩（平均）';
                        }
                    }
                },
                title: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: '平均歩数',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
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
                        text: '日',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
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
    
    // 月選択変更
    const dailyMonthSelect = document.getElementById('daily-month-select');
    if (dailyMonthSelect) {
        dailyMonthSelect.addEventListener('change', (e) => {
            const selectedMonth = e.target.value;
            if (selectedMonth) {
                selectDailyMonth(selectedMonth);
            }
        });
    }
    
    // チーム比較の月選択変更
    const teamMonthSelect = document.getElementById('team-month-select');
    if (teamMonthSelect) {
        teamMonthSelect.addEventListener('change', (e) => {
            const selectedMonth = e.target.value;
            if (selectedMonth) {
                selectTeamMonth(selectedMonth);
            }
        });
    }
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

// Excelファイル読み込み機能
function setupExcelFileLoader() {
    const fileInput = document.getElementById('excel-file-input');
    const fileStatus = document.getElementById('file-status');
    
    if (!fileInput) return;
    
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.log('ファイルが選択されていません');
            return;
        }
        
        console.log('ファイルが選択されました:', file.name, file.size, 'bytes');
        fileStatus.textContent = '読み込み中...';
        
        try {
            // すべてのシートを読み込む
            console.log('Excelファイルを読み込み中...');
            const result = await loadAllExcelSheets(file);
            
            console.log('✓ Excelファイルの読み込みが完了しました');
            console.log('シート数:', result.sheetNames.length);
            console.log('シート名:', result.sheetNames);
            
            fileStatus.textContent = `✓ ${file.name} を読み込みました（${result.sheetNames.length}シート）`;
            fileStatus.style.color = '#4caf50';
            
            // すべてのシートの内容をコンソールに表示
            console.log('=== Excelファイルの内容 ===');
            result.sheetNames.forEach(sheetName => {
                console.log(`\n--- シート: ${sheetName} ---`);
                console.log('データ件数:', result.sheets[sheetName].length);
                if (result.sheets[sheetName].length > 0) {
                    console.log('最初の行:', result.sheets[sheetName][0]);
                    console.log('列名:', Object.keys(result.sheets[sheetName][0] || {}));
                }
            });
            
            // Excelデータを処理して表示に反映
            console.log('データを処理中...');
            processExcelData(result);
            console.log('✓ データ処理が完了しました');
            
        } catch (error) {
            fileStatus.textContent = `✗ エラー: ${error.message}`;
            fileStatus.style.color = '#f44336';
            console.error('Excelファイル読み込みエラー:', error);
            console.error('エラーの詳細:', error.stack);
        }
    });
}

// Excelデータを処理して表示に反映
function processExcelData(excelResult) {
    const fileStatus = document.getElementById('file-status');
    
    try {
        // シート名から月別と日別を識別
        // シート名に「月別」「日別」「daily」「monthly」などのキーワードが含まれているか確認
        let monthlySheetName = null;
        let dailySheetName = null;
        
        excelResult.sheetNames.forEach(sheetName => {
            const lowerName = sheetName.toLowerCase();
            if (lowerName.includes('月別') || lowerName.includes('monthly') || lowerName.includes('month')) {
                monthlySheetName = sheetName;
            } else if (lowerName.includes('日別') || lowerName.includes('daily') || lowerName.includes('day') || lowerName.includes('11月')) {
                dailySheetName = sheetName;
            }
        });
        
        // シート名が特定できない場合は、最初のシートを月別、2番目を日別として扱う
        if (!monthlySheetName && excelResult.sheetNames.length > 0) {
            monthlySheetName = excelResult.sheetNames[0];
        }
        if (!dailySheetName && excelResult.sheetNames.length > 1) {
            dailySheetName = excelResult.sheetNames[1];
        }
        
        console.log('月別シート:', monthlySheetName);
        console.log('日別シート:', dailySheetName);
        
        // 月別データを処理
        if (monthlySheetName && excelResult.sheets[monthlySheetName]) {
            try {
                const monthlyData = convertMonthlyExcelData(excelResult.sheets[monthlySheetName]);
                if (monthlyData && monthlyData.participants && monthlyData.participants.length > 0) {
                    data = monthlyData;
                    // 表示を更新
                    populateParticipantFilter();
                    renderChart();
                    console.log(`月別データを更新しました（参加者数: ${monthlyData.participants.length}, 月数: ${monthlyData.months.length}）`);
                } else {
                    console.warn('月別データの変換に失敗しました');
                }
            } catch (error) {
                console.error('月別データ処理エラー:', error);
            }
        } else {
            console.warn('月別シートが見つかりませんでした');
        }
        
        // 日別データを処理（複数の月のシートを処理）
        // 月別シート以外のすべてのシートを日別データとして扱う
        const dailySheetNames = new Set(); // 重複を防ぐためにSetを使用
        
        excelResult.sheetNames.forEach(sheetName => {
            // 月別シートでない場合
            if (sheetName !== monthlySheetName) {
                dailySheetNames.add(sheetName);
            }
        });
        
        console.log('日別シート:', Array.from(dailySheetNames));
        
        // 各日別シートを処理
        Array.from(dailySheetNames).forEach(sheetName => {
            if (excelResult.sheets[sheetName]) {
                try {
                    const dailyData = convertDailyExcelData(excelResult.sheets[sheetName], sheetName);
                    if (dailyData && dailyData.participants && dailyData.participants.length > 0) {
                        allDailyData[dailyData.month] = dailyData;
                        console.log(`${dailyData.month}の日別データを読み込みました（参加者数: ${dailyData.participants.length}）`);
                    } else {
                        console.warn(`${sheetName}のデータ変換に失敗しました`);
                    }
                } catch (error) {
                    console.error(`${sheetName}の処理エラー:`, error);
                }
            }
        });
        
        // 月選択ドロップダウンを更新
        updateMonthSelectors();
        
        // 最初の月のデータを表示（または最後に選択した月）
        const availableMonths = Object.keys(allDailyData);
        if (availableMonths.length > 0) {
            const defaultMonth = availableMonths[availableMonths.length - 1]; // 最新の月
            console.log(`デフォルト月を選択: ${defaultMonth}`);
            
            // 日別データを先に選択（dailyDataを設定）
            selectDailyMonth(defaultMonth);
            
            // その後、チーム比較グラフを描画（dailyDataが正しく設定された後）
            selectTeamMonth(defaultMonth);
        } else {
            console.warn('日別データが見つかりませんでした');
        }
        
        // 統計情報を更新（月別データと日別データの両方が更新された後）
        renderStats(); // ランキングを再計算
        
        const monthlyInfo = data ? `月別: ${data.participants.length}人` : '月別: なし';
        const dailyInfo = availableMonths.length > 0 ? `日別: ${availableMonths.length}ヶ月` : '日別: なし';
        fileStatus.textContent = `✓ データを読み込み、表示を更新しました（${monthlyInfo}, ${dailyInfo}）`;
        fileStatus.style.color = '#4caf50';
        
    } catch (error) {
        console.error('Excelデータ処理エラー:', error);
        fileStatus.textContent = `✗ データ処理エラー: ${error.message}`;
        fileStatus.style.color = '#f44336';
    }
}

// 月別Excelデータを変換
function convertMonthlyExcelData(excelRows) {
    try {
        // 最初の行から列名を取得
        if (excelRows.length === 0) return null;
        
        const firstRow = excelRows[0];
        const columns = Object.keys(firstRow);
        
        // 月の列を特定（"3月2024", "4月"など）
        const monthColumns = columns.filter(col => 
            col.includes('月') || col.toLowerCase().includes('month')
        );
        
        // 参加者名の列を特定（"名前", "name", "参加者"など）
        const nameColumn = columns.find(col => 
            col.includes('名前') || col.toLowerCase().includes('name') || col.includes('参加者')
        ) || columns[0];
        
        // 月の列をソート（最初の列が最初の月）
        const sortedMonthColumns = monthColumns.sort();
        
        // 参加者データを構築
        const participants = excelRows.map(row => {
            const steps = sortedMonthColumns.map(col => {
                const value = row[col];
                if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
                    return null;
                }
                return Math.round(Number(value));
            });
            
            return {
                name: String(row[nameColumn] || ''),
                steps: steps
            };
        }).filter(p => p.name); // 名前が空の行を除外
        
        return {
            months: sortedMonthColumns,
            participants: participants
        };
    } catch (error) {
        console.error('月別データ変換エラー:', error);
        return null;
    }
}

// 日別Excelデータを変換
function convertDailyExcelData(excelRows, sheetName = null) {
    try {
        if (excelRows.length === 0) return null;
        
        const firstRow = excelRows[0];
        const columns = Object.keys(firstRow);
        
        // 日付列を特定（数値キー、日付形式、または「上午/下午」形式）
        const excludeColumns = ['名前', 'name', 'チーム', 'team', '登録名', '結果', '平均'];
        
        const dateColumns = columns.filter(col => {
            // 除外する列をスキップ
            if (excludeColumns.some(exclude => col.includes(exclude))) {
                return false;
            }
            
            // 数値キー（45962など）、日付形式、または「上午/下午」形式
            return /^\d+$/.test(col) || 
                   col.includes('日') || 
                   col.toLowerCase().includes('date') ||
                   col.includes('上午/下午') ||
                   col.includes('時') ||
                   col.includes('分');
        }).sort((a, b) => {
            // 「上午/下午」形式の場合は、列の順序を保持（Excelの列順序）
            // 数値キーの場合は数値としてソート
            const numA = parseInt(a);
            const numB = parseInt(b);
            if (!isNaN(numA) && !isNaN(numB)) {
                return numA - numB;
            }
            // 列のインデックスでソート（元の順序を保持）
            const indexA = columns.indexOf(a);
            const indexB = columns.indexOf(b);
            return indexA - indexB;
        });
        
        console.log('日付列として識別された列:', dateColumns);
        console.log('日付列数:', dateColumns.length);
        
        // 名前とチームの列を特定
        const nameColumn = columns.find(col => 
            col.includes('名前') || col.toLowerCase().includes('name')
        );
        const teamColumn = columns.find(col => 
            col.includes('チーム') || col.toLowerCase().includes('team')
        );
        
        if (!nameColumn) {
            console.error('名前列が見つかりません');
            return null;
        }
        
        // シート名から月を特定
        let monthName = "11月2025"; // デフォルト
        if (sheetName) {
            // シート名に月が含まれている場合（例: "11月", "12月", "11月2025"）
            const monthMatch = sheetName.match(/(\d+)月(\d{4})?/);
            if (monthMatch) {
                const month = monthMatch[1];
                const year = monthMatch[2] || "2025";
                monthName = `${month}月${year}`;
            }
        }
        
        // 日付ラベルを生成（1日から30日まで、または31日まで）
        const maxDays = dateColumns.length;
        const days = Array.from({length: maxDays}, (_, i) => `${i + 1}日`);
        
        console.log(`日付ラベルを生成: ${maxDays}日分`);
        console.log('日付列:', dateColumns.slice(0, 5), '...', dateColumns.slice(-5));
        
        // 参加者データを構築
        const participants = excelRows.map(row => {
            const steps = dateColumns.map(col => {
                const value = row[col];
                if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
                    return null;
                }
                return Math.round(Number(value));
            });
            
            return {
                name: String(row[nameColumn] || ''),
                team: teamColumn ? String(row[teamColumn] || '') : '',
                steps: steps
            };
        }).filter(p => p.name); // 名前が空の行を除外
        
        console.log(`参加者データを構築: ${participants.length}人`);
        if (participants.length > 0) {
            console.log(`各参加者のステップ数:`, participants.map(p => `${p.name}: ${p.steps.filter(s => s !== null).length}日分`));
        }
        
        return {
            month: monthName,
            days: days,
            participants: participants
        };
    } catch (error) {
        console.error('日別データ変換エラー:', error);
        return null;
    }
}

// 月選択ドロップダウンを更新
function updateMonthSelectors() {
    const dailyMonthSelect = document.getElementById('daily-month-select');
    const teamMonthSelect = document.getElementById('team-month-select');
    
    const availableMonths = Object.keys(allDailyData).sort();
    
    // 日別データの月選択を更新
    if (dailyMonthSelect) {
        dailyMonthSelect.innerHTML = '<option value="">月を選択</option>';
        availableMonths.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            dailyMonthSelect.appendChild(option);
        });
    }
    
    // チーム比較の月選択を更新
    if (teamMonthSelect) {
        teamMonthSelect.innerHTML = '<option value="">月を選択</option>';
        availableMonths.forEach(month => {
            const option = document.createElement('option');
            option.value = month;
            option.textContent = month;
            teamMonthSelect.appendChild(option);
        });
    }
}

// 日別データの月を選択
function selectDailyMonth(month) {
    if (!allDailyData[month]) return;
    
    dailyData = allDailyData[month];
    dailyStepData = dailyData;
    
    const dailyMonthSelect = document.getElementById('daily-month-select');
    if (dailyMonthSelect) {
        dailyMonthSelect.value = month;
    }
    
    // 表示を更新
    populateDailyParticipantFilter();
    renderDailyChart();
    
    // セクションのタイトルを更新
    const dailySectionTitle = document.querySelector('#daily-section h2');
    if (dailySectionTitle) {
        dailySectionTitle.textContent = `${month}の日別データ`;
    }
}

// チーム比較の月を選択
function selectTeamMonth(month) {
    if (!allDailyData[month]) {
        console.warn(`月 "${month}" のデータが見つかりません`);
        return;
    }
    
    const teamMonthSelect = document.getElementById('team-month-select');
    if (teamMonthSelect) {
        teamMonthSelect.value = month;
    }
    
    // dailyDataが既に正しい月に設定されている場合はそのまま使用
    // そうでない場合は一時的に変更
    const targetData = allDailyData[month];
    const originalDailyData = dailyData;
    
    // dailyDataが正しく設定されていない場合のみ変更
    if (!dailyData || dailyData.month !== month) {
        dailyData = targetData;
    }
    
    console.log(`チーム比較グラフを描画中（${month}）`);
    console.log('日別データ:', dailyData);
    console.log('日数:', dailyData.days ? dailyData.days.length : 0);
    console.log('参加者数:', dailyData.participants ? dailyData.participants.length : 0);
    if (dailyData.participants) {
        console.log('参加者のチーム情報:', dailyData.participants.map(p => `${p.name}: ${p.team || 'なし'}`));
    }
    
    renderTeamComparisonChart();
    
    // 元のdailyDataに戻す（ただし、selectDailyMonthで既に設定されている場合はそのまま）
    if (originalDailyData && originalDailyData.month !== month) {
        dailyData = originalDailyData;
    }
    
    // セクションのタイトルを更新
    const teamSectionTitle = document.querySelector('#team-comparison-section h2');
    if (teamSectionTitle) {
        teamSectionTitle.textContent = `チーム平均値比較（${month}）`;
    }
}

// ページ読み込み時にデータを読み込む
loadData();

// Excelファイル読み込み機能を設定
if (typeof loadAllExcelSheets !== 'undefined') {
    setupExcelFileLoader();
}

