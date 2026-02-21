# Brain Games App - Claude作業ガイド

## プロジェクト概要

脳トレーニングゲーム集アプリ。ゲスト・認証ユーザーどちらでもプレイ可能。
認証ユーザーはスコアが保存され、履歴・プロフィール管理ができる。

詳細な仕様は [SPEC.md](./SPEC.md) を参照。

---

## 技術スタック

| 分類 | 技術 |
|------|------|
| フロントエンド | Next.js 15 (App Router) + TypeScript + Tailwind CSS v4 |
| バックエンド | Supabase (Database + Auth) |
| 認証 | Google OAuth 2.0（Supabase経由） |
| デプロイ | Vercel |

---

## ディレクトリ構成

```
src/
├── app/           # ページ（App Router）
│   ├── games/     # 各ゲームページ
│   ├── history/   # スコア履歴
│   ├── profile/   # プロフィール管理
│   └── context/   # GameContext（グローバル状態）
├── components/
│   ├── auth/      # 認証関連コンポーネント
│   ├── layout/    # ヘッダー・レイアウト
│   └── ui/        # 汎用UIコンポーネント
├── hooks/         # ゲームごとのカスタムフック
├── lib/           # Supabaseクライアント
├── types/         # TypeScript型定義
└── utils/         # ユーティリティ関数
```

---

## 開発ルール

### 作業前
- **実装前に変更計画を日本語で説明**してから作業を開始する

### コード品質
- TypeScriptの **`any` 型は禁止**。適切な型を定義する
- コミット前に `npm run lint` を実行してエラーがないことを確認する

### ファイル操作
- **ファイルやディレクトリを削除する前に必ず確認**を取る

---

## 開発コマンド

```bash
npm run dev          # 開発サーバー起動
npm run lint         # コードチェック
npm run type-check   # 型チェック
npm run build        # 本番ビルド
```
