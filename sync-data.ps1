# OneDriveからExcelファイルを同期してデータを更新するスクリプト

$OneDrivePath = "D:\OneDrive\CURSOR\Alkoo\step_data.xlsx.xlsx"
$LocalPath = ".\step_data.xlsx.xlsx"

# ファイルの存在確認
if (Test-Path $OneDrivePath) {
    Write-Host "OneDrive上の最新ファイルを検出しました: $OneDrivePath"
    
    # コピー実行
    Copy-Item -Path $OneDrivePath -Destination $LocalPath -Force
    Write-Host "ファイルをコピーしました。"
    
    # ビルド実行
    Write-Host "データ変換処理を実行します..."
    node build-data.js
    
    Write-Host "完了しました。"
} else {
    Write-Host "エラー: OneDrive上のファイルが見つかりません: $OneDrivePath"
    Write-Host "パスを確認してください。"
}

