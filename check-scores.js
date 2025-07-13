const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://seduzpxbvnydzgnguroe.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlZHV6cHhidm55ZHpnbmd1cm9lIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIzNzQ2NTEsImV4cCI6MjA2Nzk1MDY1MX0.kQcA8RLoe3i0A0L3EWc5KeWCVI0J3f9OmLZMzTJ9nqU';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkScores() {
  const { data, error } = await supabase
    .from('user_scores')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('❌ エラー:', error);
  } else {
    console.log('📊 保存されているスコア:');
    console.table(data);
  }
}

checkScores();