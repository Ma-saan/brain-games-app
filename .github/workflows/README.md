# GitHub Actions - Keep-Alive設定ガイド

このワークフローは、Supabase無料プランの自動停止（7日間の非アクティブ）を防ぐために、定期的にサービスにアクセスします。

## 機能

- **自動実行**: 毎週月曜・木曜の午前3時（UTC）= 日本時間 正午に実行
- **手動実行**: GitHubのActionsタブから手動で実行可能
- **対象サービス**:
  - Supabase（データベース）
  - Vercel（ホスティング）※オプション

## 設定手順

### 1. GitHub Secretsの設定

GitHubリポジトリで以下のSecretを設定する必要があります。

1. GitHubリポジトリページを開く
2. **Settings** > **Secrets and variables** > **Actions** に移動
3. **New repository secret** をクリック
4. 以下のSecretを追加:

#### 必須のSecrets

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `SUPABASE_URL` | `https://seduzpxbvnydzgnguroe.supabase.co` | SupabaseプロジェクトのURL |
| `SUPABASE_ANON_KEY` | `.env.local`の`NEXT_PUBLIC_SUPABASE_ANON_KEY`の値 | Supabase匿名キー（公開キー） |

#### オプションのSecrets

| Secret名 | 値 | 説明 |
|---------|-----|------|
| `VERCEL_URL` | `https://your-app.vercel.app` | Vercelの本番URL（設定推奨） |

### 2. ワークフローの有効化

1. このリポジトリをGitHubにプッシュ
2. **Actions** タブに移動
3. 初回はワークフローの有効化が必要な場合があります
4. "I understand my workflows, go ahead and enable them" をクリック

### 3. 動作確認

#### 手動実行でテスト

1. **Actions** タブを開く
2. 左サイドバーから **"Keep Services Alive"** を選択
3. **"Run workflow"** ボタンをクリック
4. **"Run workflow"** を再度クリックして実行
5. 実行ログでステータスを確認

#### 実行ログの確認

- ✅ 成功: 緑色のチェックマーク
- ❌ 失敗: 赤色のバツマーク
- 詳細はログをクリックして確認

## スケジュール詳細

```yaml
# 毎週月曜・木曜の午前3時（UTC）= 日本時間 正午
- cron: '0 3 * * 1,4'
```

- **月曜 12:00（日本時間）**: 週の始まりにチェック
- **木曜 12:00（日本時間）**: 週の途中でチェック
- これにより3～4日ごとにアクセスが発生し、7日間の停止を確実に防ぎます

## トラブルシューティング

### Secretsが正しく設定されているか確認

1. Settings > Secrets and variables > Actions を開く
2. 以下のSecretが表示されているか確認:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `VERCEL_URL`（オプション）

### ワークフローが実行されない場合

- リポジトリがprivateの場合、GitHub Actionsの利用制限を確認
- Actionsタブでワークフローが有効化されているか確認
- ブランチが`main`または`master`であることを確認

### エラーログの確認方法

1. Actionsタブを開く
2. 失敗したワークフロー実行をクリック
3. 各ステップのログを確認
4. エラーメッセージからSecrets設定ミスやAPI接続問題を特定

## コスト

- **GitHub Actions**: 無料（パブリックリポジトリ）、月2,000分まで（プライベートリポジトリ）
- このワークフローは1回あたり約30秒以内に完了するため、月間コストは実質ゼロです

## セキュリティ

- `SUPABASE_ANON_KEY`は公開されても安全なキーです（フロントエンドで使用）
- より高度なセキュリティが必要な場合は、Supabase Row Level Security（RLS）を設定してください

## カスタマイズ

### 実行頻度の変更

`.github/workflows/keep-alive.yml`の`cron`行を編集:

```yaml
# 毎日実行する場合
- cron: '0 3 * * *'

# 2日ごとに実行する場合
- cron: '0 3 */2 * *'
```

### 通知の追加

失敗時にメール通知を受け取りたい場合は、GitHubの通知設定で「Actions」の通知を有効にしてください。

## 参考リンク

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Supabase Free Tier Information](https://supabase.com/pricing)
- [Cron Expression Guide](https://crontab.guru/)
