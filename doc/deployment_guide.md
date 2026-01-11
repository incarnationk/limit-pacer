# Deploying Limit Pacer to Azure Static Web Apps

このガイドでは、**Limit Pacer** アプリを **Azure Static Web Apps (ASWA)** にデプロイする手順を説明します。

## 前提条件
- Githubアカウントを持っていること
- Azureアカウント（無料アカウントで可）を持っていること
- 最新のコードがGithubリポジトリにプッシュされていること

## 1. ローカルでの準備 (完了済み)
- `next.config.ts` で `output: 'export'` (静的エクスポート) が設定されています。
- `staticwebapp.config.json` が作成され、SPAリダイレクト設定が完了しています。

以下のコマンドで変更をコミットしてプッシュしてください。

```bash
git add staticwebapp.config.json next.config.ts
git commit -m "chore: Configure for Azure Static Web Apps deployment"
git push
```

## 2. Azure Static Web Apps リソースの作成
1. [Azure Portal](https://portal.azure.com/) にログインします。
2. 検索バーで **"Static Web Apps"** (静的 Web アプリ) を検索しクリエイトします。
3. **基本 (Basics)** タブの設定:
    - **Subscription**: お使いのサブスクリプション
    - **Resource Group**: 新規作成 (例: `rg-limit-pacer`)
    - **Name**: アプリ名 (例: `limit-pacer-web`)
    - **Plan Type**: **Free** (趣味/個人プロジェクト用) を選択
    - **Deployment details**: **GitHub** を選択
4. **GitHub 認証** を行い、以下を選択:
    - Organization: あなたのアカウント
    - Repository: `limit-pacer`
    - Branch: `main`
5. **Build Details**:
    - **Build Presets**: **Next.js** を選択
    - **App location**: `/` (デフォルト)
    - **Api location**: (空白のまま)
    - **Output location**: `out` (※重要: Next.jsのexport出力先はデフォルトで `out` です)
6. 「確認と作成」→「作成」をクリックします。

## 3. デプロイの確認
- 作成が完了すると、自動的にGitHub Actionsがトリガーされ、ビルドとデプロイが始まります。
- GitHubのリポジトリの「Actions」タブで進行状況を確認できます。
- デプロイが完了すると、Azure Portalの **概要** ページに **URL** が表示されます (例: `https://gentle-river-123.azurestaticapps.net`)。

## 4. 認証設定 (重要)
アプリが新しいURLで動くようになったため、認証システム (Entra ID) にこのURLを許可する必要があります。

1. [Azure Portal > Microsoft Entra ID > App registrations](https://portal.azure.com/#view/Microsoft_AAD_IAM/ActiveDirectoryMenuBlade/RegisteredApps) を開きます。
2. `limit-pacer` (作成済みのアプリ登録) を選択します。
3. **Authentication** (認証) メニューを開きます。
4. **Single-page application** の **Redirect URIs** に以下を追加します:
    - `https://<YOUR-NEW-SITE-URL>.azurestaticapps.net`
    - (末尾にスラッシュなし、または必要に応じて記述)
5. **Save** (保存) します。

## 5. 動作確認
- 新しいURLにアクセスし、ログインしてExcelデータが表示されることを確認してください。
