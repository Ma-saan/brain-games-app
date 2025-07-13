const { createClient } = require('@supabase/supabase-js');

// 環境変数から読み込み
const supabaseUrl = 'https://seduzpxbvnydzgnguroe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZHV6cHhidm55ZHpnbmd1cm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzQ2NTEsImV4cCI6MjA2Nzk1MDY1MX0.kQcA8RLoe3i0A0L3EWc5KeWCVI0J3f9OmLZMzTJ9nqU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Supabaseに接続中...');
    
    // テーブル一覧取得でテスト
    const { data, error } = await supabase
      .from('user_scores')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('❌ エラー:', error.message);
      if (error.message.includes('relation "user_scores" does not exist')) {
        console.log('💡 user_scoresテーブルが存在しません。Supabaseで以下のSQLを実行してください:');
        console.log(`
CREATE TABLE user_scores (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL,
  game_type TEXT NOT NULL CHECK (game_type IN ('reaction', 'memory', 'color', 'math', 'pattern', 'typing')),
  score INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_name, game_type)
);

ALTER TABLE user_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Enable read access for all users" ON user_scores FOR SELECT USING (true);
CREATE POLICY "Enable insert access for all users" ON user_scores FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update access for all users" ON user_scores FOR UPDATE USING (true);
        `);
      }
    } else {
      console.log('✅ Supabase接続成功！');
      console.log('📊 現在のレコード数:', data?.length || 0);
    }
  } catch (error) {
    console.error('❌ 接続エラー:', error);
  }
}

testConnection();