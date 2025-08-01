'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { NicknameSetup } from '@/components/auth/NicknameSetup'

export default function SetupPage() {
  const { isAuthenticated, isFirstTimeUser, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      // 認証されていない場合はホームページにリダイレクト
      if (!isAuthenticated) {
        router.push('/')
        return
      }

      // 既にプロフィールが設定済みの場合はホームページにリダイレクト
      if (!isFirstTimeUser) {
        router.push('/')
        return
      }
    }
  }, [isAuthenticated, isFirstTimeUser, loading, router])

  const handleSetupComplete = () => {
    // セットアップ完了後はホームページにリダイレクト
    router.push('/')
  }

  const handleSkip = () => {
    // スキップした場合もホームページにリダイレクト
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <p className="mt-2 text-green-600">読み込み中...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated || !isFirstTimeUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-green-800 mb-2">
            🎉 アカウント作成完了！
          </h1>
          <p className="text-green-600">
            脳トレゲームへようこそ！<br />
            最初にプロフィールを設定しましょう。
          </p>
        </div>

        <NicknameSetup 
          onComplete={handleSetupComplete}
          onSkip={handleSkip}
        />

        <div className="mt-8 text-center">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-medium text-green-800 mb-2">
              🎯 認証ユーザーの特典
            </h3>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• スコアの永続保存</li>
              <li>• ゲーム統計の表示</li>
              <li>• ランキング参加</li>
              <li>• プロフィール管理</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}