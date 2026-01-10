# SharePoint リスト作成手順 (SharePoint List Setup Guide)

`limit-pacer` で使用するデータを格納するために、以下の2つのリストを SharePoint サイト上に作成してください。

## 1. SharePoint サイトの作成 (Create Site)
まだリストを作成するサイトがない場合は、以下の手順で新規作成してください。

1. [Microsoft 365 ポータル](https://www.office.com/) にログインし、アプリランチャーから **SharePoint** を開きます。
2. 左上の **「+ サイトの作成 (Create site)」** をクリックします。
3. **「チーム サイト (Team site)」** を選択します。
   - ※「コミュニケーション サイト」でも動作しますが、権限管理の観点でチームサイトを推奨します。
4. **サイト名** を入力します (例: `limit-pacer-dev`)。
5. **「次へ」** > **「完了」** をクリックして作成します。
6. 作成完了後、ブラウザのアドレスバーに表示されている **URL** を控えておいてください。
   - 例: `https://yourtenant.sharepoint.com/sites/limit-pacer-dev`

---

## 2. リスト作成: `LimitPacer_Members`
メンバー情報を管理するリストです。

1. **"新規 (New)"** > **"リスト (List)"** > **"空白のリスト (Blank list)"** を選択。
2. 名前: `LimitPacer_Members`
3. 以下の列を追加・設定してください：

| 列名 (Column) | 種類 (Type) | 設定/備考 (Settings) |
|---|---|---|
| **Title** (デフォルト) | テキスト | **「氏名」**として使用します。(例: 山田 太郎) |
| **Team** | 選択肢 (Choice) | チーム名を入力 (例: Development, Sales, HR) |
| **Role** | 選択肢 (Choice) | 役柄を入力 (例: 社員, リーダー, 主任...) |
| **EntraID** | テキスト | (任意) メールアドレス。ログインユーザーとの紐づけに使用します。 |

---

## 3. リスト作成: `LimitPacer_Tasks`
タスク情報を管理するリストです。

1. **"新規"** > **"リスト"** > **"空白のリスト"** を選択。
2. 名前: `LimitPacer_Tasks`
3. 以下の列を追加・設定してください：

| 列名 (Column) | 種類 (Type) | 設定/備考 (Settings) |
|---|---|---|
| **Title** (デフォルト) | テキスト | **「タスク内容」**として使用します。(例: 年末調整) |
| **Deadline** | 日付と時刻 | **「期限」**。日付のみでOKです。 |
| **TargetRole** | 選択肢 (Choice) | 対象の役柄 (例: 全メンバー, 社員, リーダー...) |
| **TargetTeam** | 選択肢 (Choice) | 対象のチーム (必要な場合)。空欄なら全チーム対象などのルールに使用。 |
| **LinkURL** | ハイパーリンク | タスクへのリンクURL。 |
| **CompletedBy** | ユーザー (Person) | **重要:「複数選択を許可 (Allow multiple selections)」** にチェックを入れてください。<br>完了したユーザーをここに記録します。 |

---

## 完了後の作業
リスト作成が完了したら、**「SharePoint サイトの URL」** を教えてください。
アプリ側でそのサイトに接続する設定を行います。
