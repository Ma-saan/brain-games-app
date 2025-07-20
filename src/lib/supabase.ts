import { createClient } from '@supabase/supabase-js'

// 一時的にハードコードで確認
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seduzpxbvnydzgnguroe.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZHV6cHhidm55ZHpnbmd1cm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzQ2NTEsImV4cCI6MjA2Nzk1MDY1MX0.kQcA8RLoe3i0A0L3EWc5KeWCVI0J3f9OmLZMzTJ9nqU'

console.log('🔍 環境変数デバッグ:');
console.log('環境変数URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'あり' : 'なし');
console.log('環境変数Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'あり' : 'なし');
console.log('使用URL:', supabaseUrl);
console.log('使用Key長:', supabaseAnonKey.length);

// 環境変数の値をトリムして空白文字を除去
const cleanUrl = supabaseUrl.trim()
const cleanKey = supabaseAnonKey.trim()

console.log('✅ Supabaseクライアント作成中...');

export const supabase = createClient(cleanUrl, cleanKey)

export interface UserScore {
  id?: number
  user_name: string
  game_type: 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing'
  score: number | null  // nullを許可
  created_at?: string
  updated_at?: string
}