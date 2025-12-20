# spec for limit-pacer

## 1. 概要 (Overview)
社内e-learningなどの期限管理・けん制を行うWebアプリケーション。
各メンバーが抱えるタスク（e-learning等）の期限を可視化し、期限間近のものを通知・警告することで未完了を防ぐ。

## 2. ターゲットユーザー (Target Users)
- **メンバー**: 自分のタスクと期限を確認する。完了済みタスクはデフォルト非表示（アコーディオン等で展開）。
- **管理者/マネージャー**: チームメンバーの進捗状況（誰が遅れているか）を一覧で確認し、必要に応じて督促を行う。

## 3. 機能要件 (Functional Requirements)
### 3.1 タスク管理
- タスク登録（タイトル、期限、対象者、URL等）
- タスク一覧表示
- ステータス管理（未着手、進行中、完了）

### 3.2 けん制・通知機能 (Reminders & Alerts)
- 期限前の自動通知（メール/Chatツール連携想定？）
- 期限切れタスクの強調表示（レッドカード表示など）
- ランキングや進捗率の可視化（ゲーム性/プレッシャー）

### 3.3 データモデル (Data Model)
#### メンバー (Members)
- **No**: ID
- **Team**: 所属チーム
- **場所 (Location)**: 勤務地/拠点
- **氏名 (Name)**: メンバー名
- **役柄 (Role)**: 以下のいずれか
    - 全員, 社員, 社員＋AL, 役職者, 主任, リーダー, 担当, BP, 派遣, 準委任

#### タスク (Tasks)
- **登録番号 (Registration No)**: ID
- **内容 (Content)**: タスク名/詳細
- **リンク (Link)**: 参照URL (e-learning等)
- **特記事項 (Notes)**: 補足情報
- **対象 (Target)**: タスクを行うべき対象（役柄やチームで指定想定）
- **期限 (Deadline)**: 完了期限

## 4. 技術スタック & アーキテクチャ (Tech Stack & Architecture)
### 4.1 推奨構成: "Azure Modern Web App" パターン
Azure DevOps (CI/CD) と Azure Static Web Apps (Hosting) を組み合わせた、モダンかつ低コストな構成。

- **Frontend**: Next.js (React) + Tailwind CSS
    - 高いデザイン性とインタラクティブなUIを実現。
    - **Hosting**: **Azure Static Web Apps (Free Tier)**
        - 無料枠があり、SSL対応、カスタムドメイン、Azure AD認証統合が容易。

- **Backend / Database**:
    - **Option A (Easy Admin): SharePoint Lists**
        - データソースとしてSharePointリストを利用（Microsoft Graph API経由）。
        - メリット: 管理画面を作らなくても、SharePoint/Excel上でデータの編集・管理が可能。社内運用に最適。
    - **Option B (Scalable): Azure Functions + Cosmos DB (Free Tier)**
        - より柔軟なロジックが必要な場合。

### 4.2 その他の構成案
- **Power Platform (Power Apps)**:
    - 開発は早いが、デザインの自由度（アニメーションや独自の「けん制」演出）に制約があるため、今回の要件（Wow要素）にはNext.jsの方が適している。

## 5. デプロイフロー (Deployment Flow)
1. Source Code: Azure DevOps Repos (or GitHub)
2. CI/CD: Azure Pipelines
3. Target: Azure Static Web Apps

