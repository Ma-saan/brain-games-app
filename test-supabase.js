const { createClient } = require('@supabase/supabase-js');

// 環境変数から読み込み
const supabaseUrl = 'https://seduzpxbvnydzgnguroe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZHV6cHhidm55ZHpnbmd1cm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzQ2NTEsImV4cCI6MjA2Nzk1MDY1MX0.kQcA8RLoe3i0A0L3EWc5KeWCVI0J3f9OmLZMzTJ9nqU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  try {
    console.log('Supabaseに接続中...');
    
    // テーブル確認
    const { data, error } = await supabase
      .from('user_scores')
      .select('*');
    
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
CREATE POLICY "Enable delete access for all users" ON user_scores FOR DELETE USING (true);
        `);
      }
    } else {
      console.log('✅ Supabase接続成功！');
      console.log('📊 現在のレコード:', data);
      
      // テストデータ挿入
      console.log('\n💾 テストデータ挿入中...');
      const { data: insertData, error: insertError } = await supabase
        .from('user_scores')
        .upsert({
          user_name: 'TestUser',
          game_type: 'reaction',
          score: 350
        });
        
      if (insertError) {
        console.error('❌ 挿入エラー:', insertError);
      } else {
        console.log('✅ テストデータ挿入成功');
        
        // 再度全データ確認
        const { data: allData } = await supabase
          .from('user_scores')
          .select('*');
        console.log('📊 更新後のレコード:', allData);
      }
    }
  } catch (error) {
    console.error('❌ 接続エラー:', error);
  }
}

testConnection();