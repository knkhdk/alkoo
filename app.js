let data = null;
let chart = null;

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
    renderTable();
    renderStats();
    setupEventListeners();
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

// ページ読み込み時にデータを読み込む
loadData();

