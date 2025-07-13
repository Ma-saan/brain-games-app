import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase環境変数が設定されていません')
}

// 環境変数の値をトリムして空白文字を除去
const cleanUrl = supabaseUrl.trim()
const cleanKey = supabaseAnonKey.trim()

export const supabase = createClient(cleanUrl, cleanKey)

export interface UserScore {
  id?: number
  user_name: string
  game_type: 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing'
  score: number
  created_at?: string
  updated_at?: string
}