'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { supabase, AuthUserScore } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { formatScore } from '@/utils/format'

interface GameStats {
  gameType: string
  gameTitle: string
  bestScore: number | null
  totalGames: number
  averageScore: number | null
}

export default function ProfilePage() {
  const { user, profile, isAuthenticated, loading, updateProfile, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editedName, setEditedName] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)
  const [gameStats, setGameStats] = useState<GameStats[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  // 認証されていない場合はログインページにリダイレクト
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/'
    }
  }, [isAuthenticated, loading])

  // ゲーム統計の取得
  useEffect(() => {
    if (user?.id) {
      fetchGameStats()
    }
  }, [user?.id])

  const fetchGameStats = async () => {
    if (!user?.id) return

    try {
      const { data: scores, error } = await supabase
        .from('auth_user_scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('スコア取得エラー:', error)
        return
      }

      // ゲームタイプ別に統計を計算
      const gameTypes = [
        { id: 'reaction', title: '反応速度' },
        { id: 'memory', title: '記憶力' },
        { id: 'color', title: '色判断' },
        { id: 'math', title: '計算力' },
        { id: 'pattern', title: 'パターン認識' },
        { id: 'typing', title: 'タイピング' }
      ]

      const stats: GameStats[] = gameTypes.map(gameType => {
        const gameScores = scores.filter(score => score.game_type === gameType.id)
        const validScores = gameScores.filter(score => score.score !== null)
        
        return {
          gameType: gameType.id,
          gameTitle: gameType.title,
          bestScore: validScores.length > 0 
            ? Math.max(...validScores.map(s => s.score!)) 
            : null,
          totalGames: gameScores.length,
          averageScore: validScores.length > 0
            ? Math.round(validScores.reduce((sum, s) => sum + s.score!, 0) / validScores.length)
            : null
        }
      })

      setGameStats(stats)
    } catch (error) {
      console.error('統計取得に失敗:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const handleEditStart = () => {
    setEditedName(profile?.display_name || '')
    setIsEditing(true)
  }

  const handleEditCancel = () => {
    setIsEditing(false)
    setEditedName('')
  }

  const handleEditSave = async () => {
    if (!editedName.trim()) {
      alert('ニックネームを入力してください')
      return
    }

    if (editedName.trim().length < 2) {
      alert('ニックネームは2文字以上で入力してください')
      return
    }

    if (editedName.trim().length > 20) {
      alert('ニックネームは20文字以内で入力してください')
      return
    }

    setIsUpdating(true)
    try {
      await updateProfile(editedName.trim())
      setIsEditing(false)
      setEditedName('')
    } catch (error) {
      console.error('プロフィール更新エラー:', error)
      alert('プロフィールの更新に失敗しました')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    if (confirm('ログアウトしますか？')) {
      await signOut()
    }
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

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-green-800">👤 プロフィール</h1>
          <Link href="/">
            <Button variant="outline">
              🏠 ホームに戻る
            </Button>
          </Link>
        </div>

        {/* プロフィール情報 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center space-x-6">
            {/* アバター */}
            {user.user_metadata?.avatar_url && (
              <img
                src={user.user_metadata.avatar_url}
                alt="プロフィール画像"
                className="w-20 h-20 rounded-full"
              />
            )}

            {/* ユーザー情報 */}
            <div className="flex-1">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ニックネーム
                </label>
                {isEditing ? (
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                      maxLength={20}
                    />
                    <Button
                      onClick={handleEditSave}
                      disabled={isUpdating}
                      size="sm"
                      variant="success"
                    >
                      {isUpdating ? '保存中...' : '保存'}
                    </Button>
                    <Button
                      onClick={handleEditCancel}
                      disabled={isUpdating}
                      size="sm"
                      variant="outline"
                    >
                      キャンセル
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-medium text-gray-900">
                      {profile?.display_name || 'ニックネーム未設定'}
                    </span>
                    <Button
                      onClick={handleEditStart}
                      size="sm"
                      variant="outline"
                    >
                      編集
                    </Button>
                  </div>
                )}
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <span className="text-gray-900">{user.email}</span>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  登録日
                </label>
                <span className="text-gray-900">
                  {new Date(user.created_at).toLocaleDateString('ja-JP')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ゲーム統計 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">📊 ゲーム統計</h2>
          
          {statsLoading ? (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
              <p className="mt-2 text-gray-600">統計を読み込み中...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {gameStats.map(stat => (
                <div key={stat.gameType} className="border rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 mb-2">{stat.gameTitle}</h3>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>プレイ回数: {stat.totalGames}回</div>
                    <div>
                      ベストスコア: {stat.bestScore ? formatScore(stat.bestScore, stat.gameType) : '記録なし'}
                    </div>
                    <div>
                      平均スコア: {stat.averageScore ? formatScore(stat.averageScore, stat.gameType) : '記録なし'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* アクションボタン */}
        <div className="flex justify-center space-x-4">
          <Link href="/history">
            <Button variant="info">
              📊 スコア履歴を見る
            </Button>
          </Link>
          <Button onClick={handleSignOut} variant="outline">
            ログアウト
          </Button>
        </div>
      </div>
    </div>
  )
}