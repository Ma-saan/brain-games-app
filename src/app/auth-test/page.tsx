import AuthTest from '@/components/AuthTest'

export default function AuthTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-4">
            🔐 Google認証テスト
          </h1>
          <p className="text-blue-600">
            Supabase Dashboard設定の動作確認
          </p>
        </div>
        
        <AuthTest />
        
        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            ← ホームに戻る
          </a>
        </div>
      </div>
    </div>
  )
}
