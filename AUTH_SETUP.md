# Google認証設定チェックリスト

## 🔧 Supabase Dashboard設定

### Authentication > URL Configuration
- [ ] **Site URL**: 
  - 開発環境: `http://localhost:3000`
  - 本番環境: `https://your-app.vercel.app`

- [ ] **Redirect URLs** (以下をすべて追加):
  ```
  http://localhost:3000
  http://localhost:3000/auth-test
  https://your-app.vercel.app
  https://your-app.vercel.app/auth-test
  ```

### Authentication > Providers > Google
- [ ] **Enable Google provider**: チェック済み
- [ ] **Client ID**: Google Cloud Consoleで取得
- [ ] **Client Secret**: Google Cloud Consoleで取得

## 🔧 Google Cloud Console設定

### OAuth 2.0 クライアント ID
- [ ] **Authorized JavaScript origins**:
  ```
  http://localhost:3000
  https://your-app.vercel.app
  ```

- [ ] **Authorized redirect URIs**:
  ```
  https://seduzpxbvnydzgnguroe.supabase.co/auth/v1/callback
  ```

## 🔧 プロジェクト設定

### .env.local ファイル
- [ ] **NEXT_PUBLIC_SUPABASE_URL**: 正しく設定
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**: 正しく設定
- [ ] **NEXT_PUBLIC_SITE_URL**: 環境に応じて設定

### package.json の依存関係
- [ ] **@supabase/supabase-js**: インストール済み

## 🧪 テスト手順

1. [ ] ローカル環境でテスト: `http://localhost:3000/auth-test`
2. [ ] Google認証ボタンをクリック
3. [ ] Googleアカウントを選択
4. [ ] アプリへの認証を許可
5. [ ] `/auth-test`ページに戻ることを確認
6. [ ] ユーザー情報が表示されることを確認

## ❌ よくあるエラーと対処法

### "ローカルホストに接続できません"
- **原因**: Supabaseの Site URL が間違っている
- **対処**: Site URL を正しく設定

### "redirect_uri_mismatch"
- **原因**: Google Cloud Console の redirect URI が間違っている
- **対処**: Supabase の callback URL を正しく設定

### "Invalid login credentials"
- **原因**: Google OAuth 設定が不完全
- **対処**: Client ID/Secret を再確認

## 🚀 デプロイ時の注意

1. Vercelにデプロイ後、本番URLを取得
2. Supabase の Site URL を本番URLに更新
3. Google Cloud Console の origins/redirect URIs に本番URLを追加
4. 環境変数 `NEXT_PUBLIC_SITE_URL` を本番URLに更新
