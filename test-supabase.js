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
  score INTEGER, -- NULLを許可（初期登録時はnull）
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
      
      // 既存テーブルのscoreカラムがNULLABLEかチェック
      console.log('\n🔍 scoreカラムがNULLABLEか確認中...');
      const { data: nullTestData, error: nullTestError } = await supabase
        .from('user_scores')
        .insert({
          user_name: 'NullTest',
          game_type: 'reaction',
          score: null
        });
        
      if (nullTestError) {
        if (nullTestError.message.includes('null value in column "score"')) {
          console.log('⚠️ scoreカラムがNOT NULLです。以下のSQLを実行してください:');
          console.log('ALTER TABLE user_scores ALTER COLUMN score DROP NOT NULL;');
        } else {
          console.error('❌ NULLテストエラー:', nullTestError);
        }
      } else {
        console.log('✅ scoreカラムはNULLABLEです');
        
        // テストデータを削除
        await supabase
          .from('user_scores')
          .delete()
          .eq('user_name', 'NullTest');
      }
      
      // ユーザー登録テスト
      console.log('\n👤 ユーザー登録テスト中...');
      const gameTypes = ['reaction', 'memory', 'color', 'math', 'pattern', 'typing'];
      const testRecords = gameTypes.map(gameType => ({
        user_name: 'TestUser',
        game_type: gameType,
        score: null
      }));

      const { data: insertData, error: insertError } = await supabase
        .from('user_scores')
        .upsert(testRecords);
        
      if (insertError) {
        console.error('❌ ユーザー登録テストエラー:', insertError);
      } else {
        console.log('✅ ユーザー登録テスト成功');
        
        // 再度全データ確認
        const { data: allData } = await supabase
          .from('user_scores')
          .select('*')
          .order('user_name, game_type');
        console.log('📊 テスト後のレコード:', allData);
      }
    }
  } catch (error) {
    console.error('❌ 接続エラー:', error);
  }
}

testConnection();