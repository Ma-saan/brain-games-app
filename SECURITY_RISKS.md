# セキュリティリスク調査レポート

調査日: 2026-02-21
対象ブランチ: `claude/research-security-risks-GfPUP`

---

## エグゼクティブサマリー

Brain Games App のコードベースを調査した結果、**深刻度：重大（Critical）** を含む複数のセキュリティリスクを確認した。特に API 認証情報のハードコーディングと、本番環境に残留するデバッグ用ページは即時対応が必要である。

---

## リスク一覧

| # | 深刻度 | 種別 | 該当ファイル |
|---|--------|------|------------|
| 1 | 重大 (Critical) | APIキーのハードコーディング | `check-scores.js`, `test-supabase.js` |
| 2 | 高 (High) | デバッグページの本番残留 | `src/app/debug/`, `src/app/auth-debug/`, `src/app/test-supabase/` |
| 3 | 高 (High) | 過剰な RLS ポリシー | Supabase `user_scores` テーブル |
| 4 | 高 (High) | 機密情報のクライアント露出 | `src/components/AuthDebug.tsx`, `src/app/debug/page.tsx` |
| 5 | 中 (Medium) | セキュリティヘッダー未設定 | `next.config.ts` |
| 6 | 中 (Medium) | ゲストユーザーなりすまし | `src/app/context/GameContext.tsx` |
| 7 | 中 (Medium) | アバター URL の未検証使用 | `src/components/auth/NicknameSetup.tsx`, `src/app/profile/page.tsx` |
| 8 | 中 (Medium) | `any` 型の使用（プロジェクトルール違反） | `src/components/AuthDebug.tsx`, `src/app/history/page.tsx` |
| 9 | 低 (Low) | 過剰な console.log 出力 | 複数ファイル |

---

## 詳細説明

### 1. [重大] APIキーのハードコーディング

**ファイル:** `check-scores.js`, `test-supabase.js`

Supabase の接続 URL と Anon Key が JavaScript ファイルにハードコーディングされており、**git で管理されている**。

```js
// check-scores.js / test-supabase.js
const supabaseUrl = 'https://seduzpxbvnydzgnguroe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

**リスク:**
- git の履歴に認証情報が永続的に残る
- GitHub 等のリモートリポジトリが公開されている場合、誰でも API キーを取得可能
- `git log` で過去のコミットからも取得できる

**対策:**
- これらのファイルから認証情報を削除し、環境変数（`.env.local`）から読み込む
- git 履歴から認証情報を削除する（`git filter-branch` または BFG Repo Cleaner）
- Supabase ダッシュボードで API キーをローテーションする

---

### 2. [高] デバッグページの本番残留

**ファイル:**
- `src/app/debug/page.tsx`
- `src/app/auth-debug/page.tsx`（`/auth-debug`）
- `src/app/auth-test/page.tsx`（`/auth-test`）
- `src/app/test-supabase/page.tsx`（`/test-supabase`）

これらのページは認証チェックなしで誰でもアクセス可能。

**`/test-supabase` が特に危険:**
- データベースへの接続テストを任意のユーザーが実行できる
- 全スコアデータ（全ユーザー）を閲覧できる
- テストデータの挿入・操作が可能

```tsx
// src/app/test-supabase/page.tsx
const checkAllScores = async () => {
  const { data } = await supabase.from('user_scores').select('*')...
  // 全データを画面表示
};
```

**`/auth-debug` も危険:**
- Supabase URL、設定情報、Google 認証コールバック URL を画面に表示
- 攻撃者がシステム構成を把握するための情報源になる

**対策:**
- これらのページをすべて削除する（または環境変数 `NODE_ENV` で本番環境に非公開にする）
- 少なくとも管理者認証を追加する

---

### 3. [高] 過剰な RLS ポリシー

**対象:** Supabase `user_scores` テーブル

`test-supabase.js` に記載された RLS 設定では、全操作（SELECT / INSERT / UPDATE / DELETE）が認証なしで全ユーザーに許可されている。

```sql
-- test-supabase.js に記載された設定
CREATE POLICY "Enable read access for all users" ON user_scores FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON user_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON user_scores FOR UPDATE USING (true);
CREATE POLICY "Enable delete access for all users" ON user_scores FOR DELETE USING (true);
```

**リスク:**
- 任意のユーザーが他のユーザーのスコアを書き換え・削除できる
- ゲストユーザーがランキングを不正操作できる
- データの完全性が保証されない

**対策:**
- UPDATE / DELETE は `user_name = current_setting('app.username')` など適切な条件を追加する
- ゲストスコアの上書きは username ベースではなくセッション管理を導入する

---

### 4. [高] 機密情報のクライアント露出

**ファイル:** `src/components/AuthDebug.tsx`, `src/app/debug/page.tsx`

```tsx
// src/app/debug/page.tsx:11
<p><strong>Supabase URL:</strong> {supabaseUrl || '❌ 未設定'}</p>

// src/components/AuthDebug.tsx:29-30
supabase: {
  url: supabaseUrl,       // URLをそのまま表示
  keyLength: supabaseKey?.length  // キー長を開示
},
auth: {
  userId: user?.id,       // ユーザーIDを表示
  userEmail: user?.email  // メールアドレスを表示
}
```

**リスク:**
- Supabase の接続 URL が攻撃者に知られる
- ユーザー ID やメールアドレスが第三者に露出する

**対策:**
- デバッグページを削除する
- 表示する場合も `NODE_ENV === 'development'` の時のみに限定する

---

### 5. [中] セキュリティヘッダー未設定

**ファイル:** `next.config.ts`

```ts
// 現状：セキュリティヘッダーが一切設定されていない
const nextConfig: NextConfig = {
  // WSL環境でのアクセスを可能にする設定
};
```

以下のヘッダーが未設定:
- `Content-Security-Policy (CSP)` — XSS 対策
- `X-Frame-Options` — クリックジャッキング対策
- `X-Content-Type-Options` — MIME スニッフィング対策
- `Referrer-Policy` — リファラー情報漏洩対策
- `Permissions-Policy` — 不要なブラウザ機能の制限
- `Strict-Transport-Security (HSTS)` — HTTPS 強制

**対策:** `next.config.ts` に `headers()` 関数でセキュリティヘッダーを追加する。

---

### 6. [中] ゲストユーザーなりすまし

**ファイル:** `src/app/context/GameContext.tsx`

ゲストユーザーの username は任意の文字列を設定でき、サーバー側で一意性・正当性の検証がない。

```ts
// src/app/context/GameContext.tsx:266-268
const setCurrentUser = async (username: string) => {
  const user = username.trim() || 'ゲスト';
  // username の検証なし → 他のゲストユーザーの名前で登録できる
```

**リスク:**
- 他のゲストユーザーの名前をそのまま入力すれば、そのユーザーとして行動できる
- ランキングでの identity なりすまし
- 他のゲストのスコアが RLS が緩いため上書き可能

**対策:**
- ゲストユーザー向けにセッション ID またはブラウザフィンガープリントを活用した識別子を導入する

---

### 7. [中] アバター URL の未検証使用

**ファイル:** `src/components/auth/NicknameSetup.tsx:66`, `src/app/profile/page.tsx:168`

```tsx
// src/components/auth/NicknameSetup.tsx
<img
  src={user.user_metadata.avatar_url}  // URLの検証なし
  alt="Avatar"
  ...
/>
```

**リスク:**
- Google OAuth から取得した `avatar_url` が悪意あるドメインを指している場合、プライバシーリークやトラッキングに利用される可能性がある
- 将来的に OAuth プロバイダが変わった場合の対策がない

**対策:**
- Next.js の `<Image>` コンポーネントを使用し、`next.config.ts` で許可ドメインを制限する

---

### 8. [中] `any` 型の使用（プロジェクトルール違反）

**ファイル:** `src/components/AuthDebug.tsx:7`, `src/app/history/page.tsx:72`

```ts
// src/components/AuthDebug.tsx
const [debugInfo, setDebugInfo] = useState<any>(null)  // any 禁止

// src/app/history/page.tsx
authScoresWithProfiles.forEach((scoreData: any) => {  // any 禁止
```

CLAUDE.md で `any` 型は禁止とされている。型安全性の欠如はランタイムエラーやデータ改ざんの検知漏れにつながる。

---

### 9. [低] 過剰な console.log 出力

**ファイル:** `src/app/context/GameContext.tsx`, `src/hooks/useAuth.ts`, その他

```ts
// 例: useAuth.ts
console.log('🔐 useAuth: getInitialAuth開始')
console.log('🔐 useAuth: セッション検出、プロフィール取得中...')
// ユーザーID、スコアデータ等が含まれる
```

**リスク:**
- ブラウザの開発者ツールで認証状態やユーザー情報が誰でも閲覧できる
- 本番環境での過剰なログはパフォーマンスにも影響する

**対策:**
- `console.log` を削除するか、`process.env.NODE_ENV === 'development'` 条件でのみ出力する

---

## 優先対応順序

| 優先度 | アクション |
|--------|-----------|
| 🔴 即時 | `check-scores.js` / `test-supabase.js` から認証情報を削除し、Supabase API キーをローテーション |
| 🔴 即時 | デバッグ用ページ（`/debug`, `/auth-debug`, `/test-supabase`）を削除または保護 |
| 🟠 早急 | `user_scores` テーブルの RLS ポリシーを最小権限に見直し |
| 🟠 早急 | `next.config.ts` にセキュリティヘッダーを追加 |
| 🟡 推奨 | アバター画像を `next/image` に移行し許可ドメインを制限 |
| 🟡 推奨 | ゲストユーザーの識別方法を改善 |
| 🟢 改善 | `any` 型を適切な型定義に置き換え |
| 🟢 改善 | 本番環境での `console.log` を抑制 |
