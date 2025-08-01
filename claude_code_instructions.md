# 🧠 Brain Games App - Google認証実装プロジェクト

## 📊 プロジェクト概要

脳トレーニングゲーム集アプリにGoogle認証機能を追加し、ユーザー管理を強化するプロジェクト。

### 🎯 要件定義
- **既存データ**: 履歴として残し、Google認証で新しくスタート
- **ユーザー情報**: 初回ログイン時にニックネーム設定 + プロフィール画面で変更可能
- **スコア公開**: 全ユーザーのスコアが見える（現在と同じ）
- **ゲスト利用**: 遊べるがスコア保存は認証必要
- **テストデータ**: 本番では削除

### 🏗️ 技術スタック
- **フロントエンド**: Next.js 15.3.5 + TypeScript + Tailwind CSS
- **バックエンド**: Supabase (Auth + Database)
- **認証**: Google OAuth 2.0
- **デプロイ**: Vercel

---

## ✅ 完了済み作業

### Phase 1: データベース設計 ✅
- **実行日**: 2025-08-01
- **マイグレーション**: `add_google_auth_tables`

**作成されたテーブル:**
```sql
-- プロフィールテーブル（auth.usersと1:1関係）
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);

-- 認証ユーザー用スコアテーブル
CREATE TABLE auth_user_scores (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('reaction', 'memory', 'color', 'math', 'pattern', 'typing')),
  score INTEGER,
  created_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT timezone('utc', now()) NOT NULL
);
```

**RLSポリシー設定済み:**
- 全ユーザーのスコア表示可能
- 自分のプロフィール/スコアのみ編集可能
- 新規ユーザー登録時の自動プロフィール作成トリガー

### Phase 2: Google認証設定 🔄
**Google Cloud Console設定 ✅**
- プロジェクト作成済み
- OAuth 2.0 クライアント設定済み
- 正しいリダイレクトURI設定済み

**セキュリティ対応 ✅**
- 環境変数対応: `src/lib/supabase.ts`
- `.env.local`での機密情報管理
- `.gitignore`でのファイル除外設定

**Supabase Dashboard設定 🔄**
- 設定方法提示済み、ユーザー確認待ち
- テストコンポーネント作成済み: `src/components/AuthTest.tsx`
- テストページ作成済み: `src/app/auth-test/page.tsx`

---

## 🚧 残りの作業（Claude Code実装対象）

### Phase 3: フロントエンド実装 ⏳

#### 3.1 認証コンポーネント群
**作成が必要なファイル:**

```typescript
// src/components/auth/AuthButton.tsx
// ログイン/ログアウトボタンコンポーネント
// - Google認証のログイン処理
// - ログアウト処理
// - 認証状態に応じた表示切り替え
// - Tailwind CSSでのスタイリング
```

```typescript
// src/components/auth/UserProfile.tsx
// ユーザープロフィール表示・編集コンポーネント
// - 現在のユーザー情報表示
// - ニックネーム編集機能
// - アバター表示（Googleプロフィール画像）
```

```typescript
// src/hooks/useAuth.ts
// 認証状態管理カスタムフック
// - 認証状態の監視
// - ユーザー情報の取得・更新
// - ログイン/ログアウト処理の抽象化
// - プロフィール情報の管理
```

#### 3.2 初回登録フロー
```typescript
// src/components/auth/NicknameSetup.tsx
// 初回ログイン時のニックネーム設定
// - 初回ログイン検知
// - ニックネーム入力フォーム
// - プロフィール作成処理
// - バリデーション（文字数制限など）
```

```typescript
// src/app/setup/page.tsx
// 初回セットアップページ
// - ウェルカムメッセージ
// - ニックネーム設定UI
// - セットアップ完了後のリダイレクト
```

#### 3.3 プロフィール画面
```typescript
// src/app/profile/page.tsx
// プロフィール管理ページ
// - ユーザー情報表示
// - ニックネーム変更機能
// - アカウント情報表示
// - ログアウト機能
// - スコア履歴表示
```

#### 3.4 認証統合
**修正が必要なファイル:**
- `src/app/page.tsx`: 認証ボタンの追加、ゲスト/認証モードの区別
- `src/app/context/GameContext.tsx`: 認証ユーザー対応、スコア保存ロジック
- ゲーム関連コンポーネント: スコア保存の認証チェック

### Phase 4: 最終調整 ⏳

#### 4.1 スコア表示統合
- 既存`user_scores`と新規`auth_user_scores`の統合表示
- 履歴ページでの区別表示（ゲストデータ vs 認証データ）

#### 4.2 ゲスト/認証モード切り替え
- ゲームプレイ時の認証状態チェック
- スコア保存時の認証確認
- 「ログインしてスコアを保存しますか？」的なUX

#### 4.3 テストデータ削除
- 本番環境での`user_scores`内のテストデータ削除
- 開発環境との区別

---

## 🔧 環境変数設定

### ローカル開発環境
`.env.local`ファイルに以下の環境変数を設定：

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://seduzpxbvnydzgnguroe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[実際のキーは別途確認]

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=[実際のClient IDは別途確認]
GOOGLE_CLIENT_SECRET=[実際のClient Secretは別途確認]
```

### 型定義（既に追加済み）
```typescript
// src/lib/supabase.ts
export interface AuthUserScore {
  id?: number
  user_id: string
  game_type: 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing'
  score: number | null
  created_at?: string
  updated_at?: string
}

export interface Profile {
  id: string
  display_name: string
  created_at?: string
  updated_at?: string
}
```

---

## 📋 重要なAPI呼び出し例

### 認証関連
```typescript
// Google認証
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}`
  }
})

// ログアウト
const { error } = await supabase.auth.signOut()

// ユーザー情報取得
const { data: { user } } = await supabase.auth.getUser()

// 認証状態の監視
const { data: { subscription } } = supabase.auth.onAuthStateChange(
  (event, session) => {
    console.log('Auth event:', event, session)
    // 認証状態の変更処理
  }
)
```

### プロフィール操作
```typescript
// プロフィール取得
const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single()

// ニックネーム更新
const { error } = await supabase
  .from('profiles')
  .update({ display_name: nickname })
  .eq('id', user.id)

// プロフィール作成（フォールバック用）
const { error } = await supabase
  .from('profiles')
  .insert({
    id: user.id,
    display_name: nickname
  })
```

### スコア操作
```typescript
// 認証ユーザーのスコア保存
const { error } = await supabase
  .from('auth_user_scores')
  .insert({
    user_id: user.id,
    game_type: gameType,
    score: score
  })

// 認証ユーザーのスコア取得
const { data: authScores } = await supabase
  .from('auth_user_scores')
  .select('*, profiles(display_name)')
  .eq('user_id', user.id)
  .order('created_at', { ascending: false })

// 統合スコア表示（既存 + 認証ユーザー）
const { data: guestScores } = await supabase
  .from('user_scores')
  .select('*')
  .order('created_at', { ascending: false })

const { data: authScores } = await supabase
  .from('auth_user_scores')
  .select('*, profiles(display_name)')
  .order('created_at', { ascending: false })
```

---

## 🚀 実装優先度

### High Priority (すぐに必要)
1. **useAuth カスタムフック** - 認証状態管理の基盤
2. **AuthButton コンポーネント** - ログイン/ログアウト機能
3. **NicknameSetup コンポーネント** - 初回登録フロー
4. **ホームページ統合** - 既存UIに認証ボタンを追加

### Medium Priority
1. **Profile ページ** - プロフィール管理
2. **Setup ページ** - 初回セットアップ画面
3. **スコア統合表示** - 履歴データの統合
4. **GameContext 修正** - 認証ユーザー対応

### Low Priority
1. **テストデータ削除**
2. **最終調整・最適化**
3. **エラーハンドリング強化**
4. **UX改善**

---

## 💡 実装のヒント

### 認証フロー設計
1. **ルートガード**: 認証が必要なページへのアクセス制御
2. **リダイレクト処理**: ログイン後の適切なページ遷移
3. **初回登録検知**: プロフィールの存在チェック
4. **エラーハンドリング**: 認証失敗時の適切な処理

### UI/UX考慮点
1. **ローディング状態**: 認証状態確認中の表示
2. **ゲストユーザー配慮**: 認証なしでも基本機能は利用可能
3. **移行促進**: ゲストユーザーに認証のメリットを伝える
4. **レスポンシブ対応**: モバイルでも使いやすいUI

### パフォーマンス
1. **認証状態キャッシュ**: 不要なAPI呼び出しを削減
2. **条件付きレンダリング**: 認証状態に応じた効率的な描画
3. **バンドルサイズ**: 認証関連コードの最適化

---

## 🧪 テスト要項

### 認証機能テスト
1. **Google認証テスト**: `http://localhost:3000/auth-test`
2. **ログイン/ログアウト動作確認**
3. **プロフィール作成/更新確認**
4. **スコア保存/表示確認**

### 統合テスト
1. **ゲスト→認証ユーザー移行**
2. **既存データとの共存確認**
3. **セキュリティポリシー確認**
4. **レスポンシブ動作確認**

---

## ⚠️ 注意事項

### セキュリティ
- 認証情報は環境変数で管理（既に対応済み）
- RLSポリシーの確認（既に設定済み）
- XSS/CSRF対策の実装

### UX考慮点
- ゲストユーザーへの配慮
- 既存ユーザーへの移行説明
- エラーメッセージの分かりやすさ

### 既存機能との互換性
- 既存のGameContextとの統合
- 現在のユーザー名入力機能との共存
- 既存のスコア表示機能の拡張

---

## 📞 サポート情報

**プロジェクトURL**: https://github.com/Ma-saan/brain-games-app
**Supabase URL**: https://seduzpxbvnydzgnguroe.supabase.co
**テストURL**: http://localhost:3000/auth-test

**Claude Code作業開始前に確認が必要な場合は、いつでも相談してください。**