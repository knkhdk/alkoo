// Excelファイルを読み込んでJavaScriptデータファイルを生成するスクリプト
const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Excelファイルを読み込む
function loadExcelFile(filePath) {
    const workbook = XLSX.readFile(filePath);
    const sheets = {};
    
    workbook.SheetNames.forEach(sheetName => {
        const worksheet = workbook.Sheets[sheetName];
        sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
    });
    
    return {
        sheets: sheets,
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
    
    // 月の列をソート
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
    }).filter(p => p.name);
    
    return {
        months: sortedMonthColumns,
        participants: participants
    };
}

// 日別Excelデータを変換
function convertDailyExcelData(excelRows, sheetName = null) {
    if (excelRows.length === 0) return null;
    
    const firstRow = excelRows[0];
    const columns = Object.keys(firstRow);
    
    // 除外する列
    const excludeColumns = ['名前', 'name', 'チーム', 'team', '登録名', '結果', '平均'];
    
    // 日付列を特定
    const dateColumns = columns.filter(col => {
        if (excludeColumns.some(exclude => col.includes(exclude))) {
            return false;
        }
        return /^\d+$/.test(col) || 
               col.includes('日') || 
               col.toLowerCase().includes('date') ||
               col.includes('上午/下午') ||
               col.includes('時') ||
               col.includes('分');
    }).sort((a, b) => {
        const numA = parseInt(a);
        const numB = parseInt(b);
        if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
        }
        const indexA = columns.indexOf(a);
        const indexB = columns.indexOf(b);
        return indexA - indexB;
    });
    
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
    let monthName = "11月2025";
    if (sheetName) {
        const monthMatch = sheetName.match(/(\d+)月(\d{4})?/);
        if (monthMatch) {
            const month = monthMatch[1];
            const year = monthMatch[2] || "2025";
            monthName = `${month}月${year}`;
        }
    }
    
    // 日付ラベルを生成
    const maxDays = dateColumns.length;
    const days = Array.from({length: maxDays}, (_, i) => `${i + 1}日`);
    
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
            name: String(row[nameColumn] || '').trim(),
            team: teamColumn ? String(row[teamColumn] || '').trim() : '',
            steps: steps
        };
    }).filter(p => p.name);
    
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
        if (excelResult.sheets[sheetName]) {
            const dailyData = convertDailyExcelData(excelResult.sheets[sheetName], sheetName);
            if (dailyData) {
                allDailyData[dailyData.month] = dailyData;
                console.log(`${dailyData.month}の日別データ: ${dailyData.participants.length}人, ${dailyData.days.length}日`);
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
    
    output += '\n// データをエクスポート（Node.js環境の場合）\n';
    output += 'if (typeof module !== "undefined" && module.exports) {\n';
    output += '  module.exports = { stepData, allDailyDataConverted };\n';
    output += '}\n';
    
    fs.writeFileSync(outputPath, output, 'utf8');
    console.log(`\n✓ データファイルを生成しました: ${outputPath}`);
}

main();

