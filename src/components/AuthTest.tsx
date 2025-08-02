'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export default function AuthTest() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // 現在の認証状態を取得
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (err) {
        setError(err instanceof Error ? err.message : '認証状態の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }

    getUser()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('Auth event:', event, session)
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      
      console.log('🚀 Google認証開始')
      
      // 現在のURLを基準にリダイレクト先を決定
      const baseUrl = window.location.origin
      const redirectTo = `${baseUrl}/auth-test`
      
      console.log('リダイレクト先:', redirectTo)
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        }
      })
      
      if (error) throw error
      
      console.log('✅ 認証リクエスト成功:', data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログインに失敗しました')
      console.error('❌ Google sign in error:', err)
    }
  }

  const signOut = async () => {
    try {
      setError(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ログアウトに失敗しました')
    }
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg">
        <p>認証状態を確認中...</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm">
      <h2 className="text-xl font-bold mb-4">🧪 Google認証テスト（修正版）</h2>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <strong>エラー:</strong> {error}
        </div>
      )}

      {user ? (
        <div className="space-y-4">
          <div className="p-4 bg-green-100 border border-green-400 rounded">
            <h3 className="font-semibold text-green-800">✅ ログイン成功！</h3>
            <div className="mt-2 text-sm">
              <p><strong>ユーザーID:</strong> {user.id}</p>
              <p><strong>メール:</strong> {user.email}</p>
              <p><strong>名前:</strong> {user.user_metadata?.name || user.user_metadata?.full_name || '未設定'}</p>
              <p><strong>プロバイダー:</strong> {user.app_metadata?.provider}</p>
              <p><strong>作成日:</strong> {new Date(user.created_at).toLocaleString()}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-600">ログインしていません</p>
          <button
            onClick={signInWithGoogle}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Googleでログイン
          </button>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
            <h4 className="font-semibold mb-2 text-blue-800">🔧 修正内容</h4>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>✅ 動的リダイレクトURL設定</li>
              <li>✅ 適切なGoogle OAuth設定</li>
              <li>✅ エラーハンドリング強化</li>
            </ul>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-xs text-gray-500 space-y-1">
        <p><strong>認証フロー:</strong></p>
        <p>1. Google認証 → 2. Supabaseコールback → 3. /auth-test</p>
        <p><strong>Supabaseコールバック:</strong> https://seduzpxbvnydzgnguroe.supabase.co/auth/v1/callback</p>
      </div>
    </div>
  )
}
