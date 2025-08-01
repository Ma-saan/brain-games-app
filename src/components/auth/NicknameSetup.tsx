'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/Button'

interface NicknameSetupProps {
  onComplete?: () => void
  onSkip?: () => void
}

export const NicknameSetup = ({ onComplete, onSkip }: NicknameSetupProps) => {
  const { user, createProfile } = useAuth()
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!nickname.trim()) {
      setError('ニックネームを入力してください')
      return
    }

    if (nickname.trim().length < 2) {
      setError('ニックネームは2文字以上で入力してください')
      return
    }

    if (nickname.trim().length > 20) {
      setError('ニックネームは20文字以内で入力してください')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await createProfile(nickname.trim())
      onComplete?.()
    } catch (error) {
      console.error('プロフィール作成エラー:', error)
      setError('プロフィールの作成に失敗しました。もう一度お試しください。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ようこそ！
        </h2>
        <p className="text-gray-600">
          ゲームで使用するニックネームを設定してください
        </p>
      </div>

      {/* ユーザー情報表示 */}
      {user && (
        <div className="flex items-center justify-center mb-6">
          {user.user_metadata?.avatar_url && (
            <img
              src={user.user_metadata.avatar_url}
              alt="Avatar"
              className="w-16 h-16 rounded-full mr-4"
            />
          )}
          <div>
            <p className="font-medium text-gray-900">
              {user.user_metadata?.full_name}
            </p>
            <p className="text-sm text-gray-500">
              {user.email}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-2">
            ニックネーム
          </label>
          <input
            type="text"
            id="nickname"
            value={nickname}
            onChange={(e) => {
              setNickname(e.target.value)
              setError(null)
            }}
            placeholder="ゲームで表示される名前"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            maxLength={20}
            disabled={isLoading}
          />
          <p className="mt-1 text-xs text-gray-500">
            2〜20文字で入力してください
          </p>
        </div>

        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
            {error}
          </div>
        )}

        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={isLoading || !nickname.trim()}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>設定中...</span>
              </div>
            ) : (
              '設定して始める'
            )}
          </Button>

          {onSkip && (
            <Button
              type="button"
              onClick={onSkip}
              disabled={isLoading}
              variant="outline"
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
            >
              後で設定
            </Button>
          )}
        </div>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          ニックネームはいつでもプロフィール画面で変更できます
        </p>
      </div>
    </div>
  )
}