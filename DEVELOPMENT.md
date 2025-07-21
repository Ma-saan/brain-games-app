# 🚀 開発ガイド - デプロイエラー回避

## ⚠️ コミット前の必須チェック

```bash
# 全てのチェックを一度に実行
npm run deploy-check

# 個別チェック
npm run type-check  # TypeScript型チェック
npm run lint        # ESLintチェック  
npm run build       # ビルドテスト
```

## 🔧 よくあるエラーと対策

### TypeScriptエラー
- `any`型は避ける → 適切な型定義を使用
- 未使用の変数 → 削除するか`_variable`形式に変更
- 型不一致 → インターフェースを正しく定義

### ESLintエラー  
- `console.log`は開発時のみ許可済み
- 重要でないルールは警告レベルに緩和済み

### importエラー
- パスの確認：`@/components/...`形式を使用
- ファイルの存在確認

## ✅ 推奨ワークフロー

1. コードを書く
2. `npm run deploy-check` 実行
3. エラーがあれば修正
4. エラーがなければコミット・プッシュ

## 🛠️ VS Code設定

- ESLintの自動修正が有効
- 保存時の自動フォーマット
- TypeScriptの厳密チェック

## 📞 問題が解決しない場合

1. `node_modules`を削除して`npm install`
2. TypeScriptキャッシュをクリア
3. 該当エラーをGoogle検索またはClaude相談

**これで毎回のデプロイエラーが大幅に減るはずです！** 🎉
