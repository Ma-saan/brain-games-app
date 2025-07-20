import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('🔍 環境変数デバッグ:');
console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined');
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  console.log('💡 以下の内容で .env.local ファイルを作成してください:');
  console.log(`
NEXT_PUBLIC_SUPABASE_URL=https://seduzpxbvnydzgnguroe.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZHV6cHhidm55ZHpnbmd1cm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzQ2NTEsImV4cCI6MjA2Nzk1MDY1MX0.kQcA8RLoe3i0A0L3EWc5KeWCVI0J3f9OmLZMzTJ9nqU
  `);
  throw new Error('Supabase環境変数が設定されていません')
}

// 環境変数の値をトリムして空白文字を除去
const cleanUrl = supabaseUrl.trim()
const cleanKey = supabaseAnonKey.trim()

console.log('✅ Supabaseクライアント作成中...');
console.log('URL:', cleanUrl);
console.log('Key長:', cleanKey.length);

export const supabase = createClient(cleanUrl, cleanKey)

export interface UserScore {
  id?: number
  user_name: string
  game_type: 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing'
  score: number | null  // nullを許可
  created_at?: string
  updated_at?: string
}