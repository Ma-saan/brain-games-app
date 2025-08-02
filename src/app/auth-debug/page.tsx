import AuthDebug from '@/components/AuthDebug'
import Link from 'next/link'

export default function AuthDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-purple-800 mb-4">
            🔍 Google認証デバッグツール
          </h1>
          <p className="text-purple-600">
            認証設定の問題を診断・解決するためのツールです
          </p>
        </div>
        
        <AuthDebug />
        
        <div className="mt-8 flex justify-center space-x-4">
          <Link 
            href="/auth-test"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            認証テストページへ →
          </Link>
          <Link 
            href="/"
            className="text-purple-600 hover:text-purple-800 underline"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}
