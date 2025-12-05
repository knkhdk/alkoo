// Excelファイルを読み込んでJavaScriptデータファイルを生成するスクリプト
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excelファイルを読み込む
function loadExcelFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheets = {};
    const rawSheets = {}; // ワークシートオブジェクトそのものを保持
    
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        rawSheets[sheetName] = worksheet;
        sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    });
    
    return {
        sheets: sheets,
        rawSheets: rawSheets,
        sheetNames: workbook.SheetNames
    };
}

// 月別Excelデータを変換
function convertMonthlyExcelData(excelRows) {
    if (excelRows.length === 0) return null;
    
    const firstRow = excelRows[0];
    const columns = Object.keys(firstRow);
    
    // 月の列を特定（"3月2024", "4月"など）
    const monthColumns = columns.filter(col => 
        col.includes('月') || col.toLowerCase().includes('month')
    );
    
    // 参加者名の列を特定（"名前", "name", "参加者"など）
    const nameColumn = columns.find(col => 
        col.includes('名前') || col.toLowerCase().includes('name') || col.includes('参加者') || col.includes('登録名')
    ) || columns[0];
    
    // 月の列をソート（Excelの列順序を維持する場合はソートしない）
    // Excelの列が時系列順（左から右）に並んでいることを前提とする
    const sortedMonthColumns = monthColumns;
    
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
    }).filter(p => p.name);
    
    return {
        months: sortedMonthColumns,
        participants: participants
    };
}

// 日別Excelデータを変換（配列の配列として処理）
function convertDailyExcelData(worksheet, sheetName = null) {
    // ヘッダー行を含めて配列として読み込む（header: 1）
    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    if (!rawData || rawData.length === 0) return null;

    const headerRow = rawData[0];
    const dataRows = rawData.slice(1);
    
    // 除外する列名
    const excludeColumns = ['名前', 'name', 'チーム', 'team', '登録名', '結果', '平均'];
    
    // 日付列のインデックスを特定
    const dateColumnIndices = headerRow.map((col, index) => {
        if (col === undefined || col === null) return null;
        const colStr = String(col).trim();
        
        // 除外キーワードが含まれるかチェック
        if (excludeColumns.some(exclude => colStr.includes(exclude))) {
            return null;
        }

        // 数字（シリアル値含む）、または日付らしい形式
        // 45000などのシリアル値も数値として検知される
        if (typeof col === 'number' || /^\d+$/.test(colStr) || /^\d+日$/.test(colStr) || 
            colStr.toLowerCase().includes('date') || 
            colStr.includes('上午/下午') || 
            colStr.includes('時') || colStr.includes('分')) {
            return { index, value: col };
        }
        return null;
    }).filter(item => item !== null);

    // ソートロジック
    dateColumnIndices.sort((a, b) => {
        // 数値（シリアル値）同士の比較
        if (typeof a.value === 'number' && typeof b.value === 'number') {
            return a.value - b.value;
        }
        
        // 文字列から数値を抽出して比較
        const extractNum = (val) => {
            if (typeof val === 'number') return val;
            const match = String(val).match(/(\d+)/);
            return match ? parseInt(match[1]) : null;
        };
        
        const numA = extractNum(a.value);
        const numB = extractNum(b.value);
        
        if (numA !== null && numB !== null) {
            return numA - numB;
        }
        
        return a.index - b.index;
    });
    
    // 名前とチームの列インデックスを特定
    let nameIndex = -1;
    let teamIndex = -1;
    
    headerRow.forEach((col, index) => {
        if (!col) return;
        const colStr = String(col).toLowerCase();
        if (colStr.includes('名前') || colStr.includes('name')) nameIndex = index;
        if (colStr.includes('チーム') || colStr.includes('team')) teamIndex = index;
    });
    
    if (nameIndex === -1) {
        console.error(`名前列が見つかりません (Sheet: ${sheetName})`);
        return null;
    }
    
    // シート名から月を特定
    let monthName = "11月2025";
    if (sheetName) {
        const monthMatch = sheetName.match(/(\d+)月(\d{4})?/);
        if (monthMatch) {
            const month = monthMatch[1];
            const year = monthMatch[2] || "2025";
            monthName = `${month}月${year}`;
        }
    }
    
    // 日付ラベルを生成（列数分だけ1日、2日...とする）
    // シリアル値から正しい日付を生成することも可能だが、現状は連番で対応
    const maxDays = dateColumnIndices.length;
    const days = Array.from({length: maxDays}, (_, i) => `${i + 1}日`);
    
    // 参加者データを構築
    const participants = dataRows.map(row => {
        const name = row[nameIndex];
        if (!name) return null;

        const steps = dateColumnIndices.map(colInfo => {
            const value = row[colInfo.index];
            if (value === null || value === undefined || value === '' || (typeof value === 'number' && isNaN(value))) {
                return null;
            }
            return Math.round(Number(value));
        });
        
        return {
            name: String(name).trim(),
            team: (teamIndex !== -1 && row[teamIndex]) ? String(row[teamIndex]).trim() : '',
            steps: steps
        };
    }).filter(p => p !== null);
    
    return {
        month: monthName,
        days: days,
        participants: participants
    };
}

// メイン処理
function main() {
    const excelFilePath = path.join(__dirname, 'step_data.xlsx.xlsx');
    
    if (!fs.existsSync(excelFilePath)) {
        console.error(`Excelファイルが見つかりません: ${excelFilePath}`);
        process.exit(1);
    }
    
    console.log('Excelファイルを読み込み中...');
    const excelResult = loadExcelFile(excelFilePath);
    console.log(`シート数: ${excelResult.sheetNames.length}`);
    console.log(`シート名: ${excelResult.sheetNames.join(', ')}`);
    
    // シート名から月別と日別を識別
    let monthlySheetName = null;
    const dailySheetNames = [];
    
    excelResult.sheetNames.forEach(sheetName => {
        const lowerName = sheetName.toLowerCase();
        if (lowerName.includes('月別') || lowerName.includes('monthly') || lowerName.includes('data')) {
            monthlySheetName = sheetName;
        } else if (lowerName.includes('日別') || lowerName.includes('daily') || 
                   /^\d+月/.test(sheetName)) {
            dailySheetNames.push(sheetName);
        }
    });
    
    // 月別シートが特定できない場合は最初のシートを月別として扱う
    if (!monthlySheetName && excelResult.sheetNames.length > 0) {
        monthlySheetName = excelResult.sheetNames[0];
    }
    
    // 日別シートが特定できない場合は、月別以外のすべてを日別として扱う
    if (dailySheetNames.length === 0 && monthlySheetName) {
        excelResult.sheetNames.forEach(sheetName => {
            if (sheetName !== monthlySheetName) {
                dailySheetNames.push(sheetName);
            }
        });
    }
    
    console.log(`月別シート: ${monthlySheetName}`);
    console.log(`日別シート: ${dailySheetNames.join(', ')}`);
    
    // 月別データを処理
    let monthlyData = null;
    if (monthlySheetName && excelResult.sheets[monthlySheetName]) {
        monthlyData = convertMonthlyExcelData(excelResult.sheets[monthlySheetName]);
        if (monthlyData) {
            console.log(`月別データ: ${monthlyData.participants.length}人, ${monthlyData.months.length}ヶ月`);
        }
    }
    
    // 日別データを処理
    const allDailyData = {};
    dailySheetNames.forEach(sheetName => {
        if (excelResult.rawSheets[sheetName]) {
            // 修正: rawSheets (ワークシートオブジェクト) を渡す
            const dailyData = convertDailyExcelData(excelResult.rawSheets[sheetName], sheetName);
            if (dailyData) {
                allDailyData[dailyData.month] = dailyData;
                console.log(`${dailyData.month}の日別データ: ${dailyData.participants.length}人, ${dailyData.days.length}日`);
                
                // 警告: 日数が極端に少ない場合
                if (dailyData.days.length < 20) {
                    console.warn(`\x1b[33m[警告] ${dailyData.month} のデータが ${dailyData.days.length}日分しか検出されませんでした。Excelの列名形式を確認してください。\x1b[0m`);
                }
            }
        }
    });
    
    // JavaScriptファイルを生成
    const outputPath = path.join(__dirname, 'data.js');
    let output = '// このファイルは自動生成されます。手動で編集しないでください。\n';
    output += '// Excelファイルを更新したら、build-data.jsを実行して再生成してください。\n\n';
    
    // 月別データ
    if (monthlyData) {
        output += '// 月別データ\n';
        output += 'const stepData = ' + JSON.stringify(monthlyData, null, 2) + ';\n\n';
    }
    
    // 日別データ
    if (Object.keys(allDailyData).length > 0) {
        output += '// 日別データ（変換済み）\n';
        output += 'const allDailyDataConverted = ' + JSON.stringify(allDailyData, null, 2) + ';\n';
    }
    
    output += '\n// ブラウザ環境でグローバル変数として設定\n';
    output += 'if (typeof window !== "undefined") {\n';
    output += '  window.stepData = stepData;\n';
    output += '  window.allDailyDataConverted = allDailyDataConverted;\n';
    output += '}\n\n';
    output += '// データをエクスポート（Node.js環境の場合）\n';
    output += 'if (typeof module !== "undefined" && module.exports) {\n';
    output += '  module.exports = { stepData, allDailyDataConverted };\n';
    output += '}\n';
    
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`\n✓ データファイルを生成しました: ${outputPath}`);
}

main();