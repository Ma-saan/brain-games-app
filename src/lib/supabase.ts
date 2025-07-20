import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://seduzpxbvnydzgnguroe.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZHV6cHhidm55ZHpnbmd1cm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzQ2NTEsImV4cCI6MjA2Nzk1MDY1MX0.kQcA8RLoe3i0A0L3EWc5KeWCVI0J3f9OmLZMzTJ9nqU'

export const supabase = createClient(supabaseUrl.trim(), supabaseAnonKey.trim())

export interface UserScore {
  id?: number
  user_name: string
  game_type: 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing'
  score: number | null
  created_at?: string
  updated_at?: string
}