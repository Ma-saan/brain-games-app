import { createClient } from '@supabase/supabase-js'

// 環境変数から読み込み（より安全）
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 環境変数が設定されていない場合のフォールバック（開発用）
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase環境変数が設定されていません。.env.localファイルを確認してください。')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface UserScore {
  id?: number
  user_name: string
  game_type: 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing'
  score: number | null
  created_at?: string
  updated_at?: string
}

// 認証ユーザー用のスコア型定義
export interface AuthUserScore {
  id?: number
  user_id: string
  game_type: 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing'
  score: number | null
  created_at?: string
  updated_at?: string
}

// プロフィール型定義
export interface Profile {
  id: string
  display_name: string
  created_at?: string
  updated_at?: string
}
