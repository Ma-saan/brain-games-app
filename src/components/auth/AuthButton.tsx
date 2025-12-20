'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

export const AuthButton = () => {
  const { isAuthenticated, user, profile, loading, signInWithGoogle, signOut } = useAuth()
  const [isLoading, setIsLoading] = useState(false)

  const handleSignIn = async () => {
    setIsLoading(true)
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error('ログインに失敗しました:', error)
      // エラーメッセージを表示するToastやModalの実装は後回し
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
    } catch (error) {
      console.error('ログアウトに失敗しました:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 認証状態の読み込み中
  if (loading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-sm text-gray-600">読み込み中...</span>
      </div>
    )
  }

  // ログイン済みの場合
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center space-x-4">
        {/* ユーザー情報表示 */}
        <div className="flex items-center space-x-2">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="text-sm">
            <p className="font-medium text-gray-900">
              {profile?.display_name || user.user_metadata?.full_name || 'ユーザー'}
            </p>
          </div>
        </div>

        {/* ログアウトボタン */}
        <Button
          onClick={handleSignOut}
          disabled={isLoading}
          variant="outline"
          size="sm"
          className="text-sm"
        >
          {isLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
              <span>ログアウト中...</span>
            </div>
          ) : (
            'ログアウト'
          )}
        </Button>
      </div>
    )
  }

  // 未ログインの場合
  return (
    <Button
      onClick={handleSignIn}
      disabled={isLoading}
      className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition-colors duration-200 flex items-center space-x-2"
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>ログイン中...</span>
        </div>
      ) : (
        <>
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Googleでログイン</span>
        </>
      )}
    </Button>
  )
}