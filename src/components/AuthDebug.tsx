'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AuthDebug() {
  const [debugInfo, setDebugInfo] = useState<any>(null)

  const checkAuthConfig = async () => {
    try {
      // 現在のURL情報
      const currentUrl = window.location.origin
      const redirectUrl = `${currentUrl}/auth-test`
      
      // Supabase設定確認
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      // 認証状態確認
      const { data: { user } } = await supabase.auth.getUser()
      
      setDebugInfo({
        environment: {
          currentUrl,
          redirectUrl,
          nodeEnv: process.env.NODE_ENV
        },
        supabase: {
          url: supabaseUrl,
          hasKey: !!supabaseKey,
          keyLength: supabaseKey?.length
        },
        auth: {
          isLoggedIn: !!user,
          userId: user?.id,
          userEmail: user?.email
        },
        expectedConfig: {
          supabaseSiteUrl: currentUrl,
          supabaseRedirectUrls: [
            currentUrl,
            `${currentUrl}/auth-test`
          ],
          googleCallbackUrl: `${supabaseUrl}/auth/v1/callback`
        }
      })
    } catch (error) {
      // TypeScriptエラー修正：型安全なエラーハンドリング
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setDebugInfo({ error: errorMessage })
    }
  }

  const testGoogleAuth = async () => {
    try {
      console.log('🧪 テスト用Google認証開始')
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth-test`,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account'
          }
        }
      })
      
      if (error) {
        console.error('❌ 認証エラー:', error)
        alert(`認証エラー: ${error.message}`)
      } else {
        console.log('✅ 認証リクエスト送信:', data)
      }
    } catch (err) {
      console.error('❌ 予期しないエラー:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      alert(`予期しないエラー: ${errorMessage}`)
    }
  }

  return (
    <div className="p-6 bg-white border rounded-lg shadow-sm max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">🔍 Google認証設定デバッグ</h2>
      
      <div className="space-y-4">
        <button
          onClick={checkAuthConfig}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
        >
          設定情報を確認
        </button>
        
        <button
          onClick={testGoogleAuth}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition ml-2"
        >
          Google認証テスト
        </button>
      </div>

      {debugInfo && (
        <div className="mt-6 p-4 bg-gray-50 rounded border">
          <h3 className="font-semibold mb-2">📊 デバッグ情報</h3>
          <pre className="text-xs overflow-auto bg-white p-3 rounded border">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
          
          {debugInfo.expectedConfig && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
              <h4 className="font-semibold text-yellow-800 mb-2">⚙️ 必要な設定</h4>
              <div className="text-sm space-y-2">
                <div>
                  <strong>Supabase Site URL:</strong>
                  <code className="ml-2 bg-yellow-100 px-1 rounded">{debugInfo.expectedConfig.supabaseSiteUrl}</code>
                </div>
                <div>
                  <strong>Supabase Redirect URLs:</strong>
                  <ul className="ml-4 mt-1">
                    {debugInfo.expectedConfig.supabaseRedirectUrls.map((url: string, i: number) => (
                      <li key={i}>
                        <code className="bg-yellow-100 px-1 rounded">{url}</code>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <strong>Google Callback URL:</strong>
                  <code className="ml-2 bg-yellow-100 px-1 rounded">{debugInfo.expectedConfig.googleCallbackUrl}</code>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded text-sm">
        <h4 className="font-semibold text-blue-800 mb-2">💡 使い方</h4>
        <ol className="space-y-1 text-blue-700">
          <li>1. 「設定情報を確認」で現在の設定を表示</li>
          <li>2. 表示された「必要な設定」をSupabase/Googleに反映</li>
          <li>3. 「Google認証テスト」で動作確認</li>
        </ol>
      </div>
    </div>
  )
}
