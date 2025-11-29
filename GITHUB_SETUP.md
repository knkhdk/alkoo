# GitHub Pages公開手順

このプロジェクトをGitHub Pagesで公開する手順です。

## 前提条件

- GitHubアカウントを持っていること
- Gitがインストールされていること

## 手順

### 1. GitHubでリポジトリを作成

1. [GitHub](https://github.com)にログイン
2. 右上の「+」ボタンをクリック → 「New repository」を選択
3. リポジトリ名を入力（例: `step-data-visualization`）
4. 「Public」を選択（GitHub Pagesは無料プランでもPublicリポジトリで利用可能）
5. 「Initialize this repository with a README」は**チェックしない**（既にREADME.mdがあるため）
6. 「Create repository」をクリック

### 2. ローカルリポジトリをGitHubに接続

GitHubでリポジトリを作成すると、表示されるコマンドを実行します。例：

```bash
git remote add origin https://github.com/[あなたのユーザー名]/[リポジトリ名].git
git branch -M main
git push -u origin main
```

**注意**: 初回のプッシュ時、GitHubの認証情報が求められる場合があります。
- Personal Access Tokenを使用する必要がある場合があります
- または、GitHub CLI (`gh`) を使用することもできます

### 3. GitHub Pagesを有効化

1. GitHubリポジトリのページで「Settings」タブをクリック
2. 左側のメニューから「Pages」を選択
3. 「Source」セクションで：
   - Branch: `main` を選択
   - Folder: `/ (root)` を選択
4. 「Save」をクリック

### 4. アクセス

数分後（通常1-2分）、以下のURLでアクセスできます：

```
https://[あなたのユーザー名].github.io/[リポジトリ名]/
```

例: `https://username.github.io/step-data-visualization/`

## データの更新方法

データを更新する場合：

1. `step_data_final.json` を更新
2. `app.js` の `stepData` オブジェクトも更新（CORSエラー回避のため）
3. 変更をコミットしてプッシュ：

```bash
git add .
git commit -m "データを更新"
git push
```

GitHub Pagesは自動的に更新されます（数分かかる場合があります）。

## トラブルシューティング

### 認証エラーが発生する場合

GitHubは2021年8月からパスワード認証を廃止しています。以下のいずれかを使用してください：

1. **Personal Access Token (PAT)**
   - GitHub Settings > Developer settings > Personal access tokens > Tokens (classic)
   - 新しいトークンを生成し、パスワードの代わりに使用

2. **GitHub CLI**
   ```bash
   gh auth login
   ```

3. **SSH鍵**
   - SSH鍵を設定して、SSH URLを使用

### ページが表示されない場合

- GitHub Pagesの設定を確認
- リポジトリがPublicになっているか確認
- 数分待ってから再度アクセス
- ブラウザのキャッシュをクリア

## 参考リンク

- [GitHub Pages公式ドキュメント](https://docs.github.com/ja/pages)
- [Personal Access Tokenの作成方法](https://docs.github.com/ja/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)

