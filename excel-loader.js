// Excelファイルを読み込んでJSONに変換する関数

// Excelファイルを読み込む（ファイルパスまたはFileオブジェクト）
async function loadExcelFile(filePathOrFile, sheetName = null) {
    try {
        let arrayBuffer;
        
        if (typeof filePathOrFile === 'string') {
            // ファイルパスの場合（fetchで読み込み）
            const response = await fetch(filePathOrFile);
            arrayBuffer = await response.arrayBuffer();
        } else {
            // Fileオブジェクトの場合（ユーザーが選択したファイル）
            arrayBuffer = await filePathOrFile.arrayBuffer();
        }
        
        // Excelファイルをパース
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        
        // すべてのシート名を返す関数
        const getAllSheetNames = () => workbook.SheetNames;
        
        // 指定されたシートを取得（指定がない場合は最初のシート）
        const targetSheetName = sheetName || workbook.SheetNames[0];
        const worksheet = workbook.Sheets[targetSheetName];
        
        if (!worksheet) {
            throw new Error(`シート "${targetSheetName}" が見つかりません`);
        }
        
        // JSONに変換
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        return {
            data: jsonData,
            sheetNames: getAllSheetNames(),
            currentSheet: targetSheetName
        };
    } catch (error) {
        console.error('Excelファイルの読み込みエラー:', error);
        throw error;
    }
}

// Excelファイルのすべてのシートを読み込む
async function loadAllExcelSheets(filePathOrFile) {
    try {
        let arrayBuffer;
        
        if (typeof filePathOrFile === 'string') {
            const response = await fetch(filePathOrFile);
            arrayBuffer = await response.arrayBuffer();
        } else {
            arrayBuffer = await filePathOrFile.arrayBuffer();
        }
        
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheets = {};
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            sheets[sheetName] = XLSX.utils.sheet_to_json(worksheet);
        });
        
        return {
            sheets: sheets,
            sheetNames: workbook.SheetNames
        };
    } catch (error) {
        console.error('Excelファイルの読み込みエラー:', error);
        throw error;
    }
}

// ファイル選択でExcelファイルを読み込む
function loadExcelFromFileInput(fileInput) {
    return new Promise((resolve, reject) => {
        const file = fileInput.files[0];
        if (!file) {
            reject(new Error('ファイルが選択されていません'));
            return;
        }
        
        if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            reject(new Error('Excelファイル（.xlsx または .xls）を選択してください'));
            return;
        }
        
        loadExcelFile(file)
            .then(resolve)
            .catch(reject);
    });
}

