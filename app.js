let data = null;
let chart = null;
let dailyData = null;
let dailyChart = null;
let teamComparisonChart = null;
let allDailyData = {}; // 複数月の日別データを保持 { "11月2025": {...}, "12月2025": {...} }

// データはdata.jsから読み込まれます
// stepDataとallDailyDataConvertedがdata.jsで定義されている必要があります

// フォールバックデータ（data.jsが読み込まれない場合のデフォルト）
// 実際のデータはdata.jsから読み込まれます
const stepDataFallback = {
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
    // data.jsから読み込まれたデータを使用
    // data.jsが読み込まれている場合は、グローバル変数stepDataが定義されている
    if (typeof window !== 'undefined' && typeof window.stepData !== 'undefined') {
        data = window.stepData;
    } else if (typeof stepData !== 'undefined') {
        data = stepData;
    } else {
        console.warn('stepDataが定義されていません。フォールバックデータを使用します。');
        console.warn('build-data.jsを実行してdata.jsを生成してください。');
        data = stepDataFallback;
    }
    
    // 日別データを初期化
    if (typeof window !== 'undefined' && typeof window.allDailyDataConverted !== 'undefined') {
        allDailyData = window.allDailyDataConverted;
    } else if (typeof allDailyDataConverted !== 'undefined') {
        allDailyData = allDailyDataConverted;
    } else {
        console.warn('allDailyDataConvertedが定義されていません。日別データが読み込まれません。');
    }
    
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

    // チームアイコンを取得する関数
    function getTeamIcon(teamName) {
        if (!teamName) return '';
        if (teamName.includes('北')) return '北チーム';
        if (teamName.includes('南')) return '南チーム';
        if (teamName.includes('うさぎ')) return 'うさぎさんチーム';
        if (teamName.includes('かめ')) return 'かめさんチーム';
        return teamName;
    }

    participantsWithNovemberAverage.forEach(({ participant, novemberAverage }) => {
        const stats = calculateStats(participant);
        const rank = novemberRanking[participant.name];
        const rankingIcon = rank ? getRankingIcon(rank) : '';
        
        // チーム情報を取得
        let teamIcon = '';
        let teamClass = '';
        if (dailyData && dailyData.participants) {
            const dailyParticipant = dailyData.participants.find(p => p.name === participant.name);
            if (dailyParticipant && dailyParticipant.team) {
                teamIcon = getTeamIcon(dailyParticipant.team);
                
                // チームクラスを設定
                if (dailyParticipant.team.includes('北')) {
                    teamClass = 'team-north';
                } else if (dailyParticipant.team.includes('南')) {
                    teamClass = 'team-south';
                } else if (dailyParticipant.team.includes('うさぎ')) {
                    teamClass = 'team-rabbit';
                } else if (dailyParticipant.team.includes('かめ')) {
                    teamClass = 'team-turtle';
                }
            }
        }
        
        const card = document.createElement('div');
        card.className = 'stat-card';
        
        const teamHtml = teamIcon ? `<span class="${teamClass}">${teamIcon}</span> ` : '';
        
        card.innerHTML = `
            <h3>${teamHtml}${participant.name}${rankingIcon ? ' ' + rankingIcon : ''}</h3>
            <div class="stat-item">
                <span class="stat-label">全期間平均:</span>
                <span class="stat-value">${stats.average.toLocaleString()}歩/日</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">月平均合計:</span>
                <span class="stat-value">${stats.total.toLocaleString()}歩</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最高月平均:</span>
                <span class="stat-value">${stats.max.toLocaleString()}歩/日</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">最低月平均:</span>
                <span class="stat-value">${stats.min.toLocaleString()}歩/日</span>
            </div>
            <div class="stat-item">
                <span class="stat-label">記録月数:</span>
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

// 日別データはdata.jsから読み込まれます（allDailyDataConverted）
// この定義は削除されました

// 日別データを初期化
function initializeDailyData() {
    // allDailyDataはloadData()で既に設定されている
    
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
        // チームごとの色設定
        let borderColor = 'rgba(75, 192, 192, 0.8)'; // デフォルト（緑系）
        
        if (teamName.includes('うさぎ')) {
            borderColor = 'rgba(102, 126, 234, 0.8)'; // 青紫
        } else if (teamName.includes('かめ')) {
            borderColor = 'rgba(118, 75, 162, 0.8)'; // 紫
        } else if (teamName.includes('北')) {
            borderColor = 'rgba(54, 162, 235, 0.8)'; // 青（寒色）
        } else if (teamName.includes('南')) {
            borderColor = 'rgba(255, 99, 132, 0.8)'; // 赤（暖色）
        } else {
            // その他のチームはインデックスに基づいて色を決定
            const defaultColors = [
                'rgba(255, 159, 64, 0.8)', // オレンジ
                'rgba(153, 102, 255, 0.8)', // 紫
                'rgba(255, 205, 86, 0.8)', // 黄色
                'rgba(201, 203, 207, 0.8)' // グレー
            ];
            borderColor = defaultColors[index % defaultColors.length];
        }
        
        return {
            label: teamName,
            data: teamAverages[teamName],
            borderColor: borderColor,
            backgroundColor: borderColor.replace('0.8', '0.2'),
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

// Excel読み込み機能は削除されました
// データはbuild-data.jsで生成されたdata.jsから読み込まれます

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
// data.jsが読み込まれた後に実行されるように、DOMContentLoadedイベントを使用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // data.jsが読み込まれるまで少し待つ
        setTimeout(() => {
            loadData();
        }, 100);
    });
} else {
    // 既に読み込み完了している場合
    setTimeout(() => {
        loadData();
    }, 100);
}

