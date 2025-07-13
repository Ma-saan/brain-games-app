'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestSupabasePage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testConnection = async () => {
    setLoading(true);
    setResult('テスト中...');
    
    try {
      console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
      console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
      
      // 1. 接続テスト
      const { error: healthError } = await supabase
        .from('user_scores')
        .select('count', { count: 'exact', head: true });
      
      if (healthError) {
        throw new Error(`接続エラー: ${healthError.message}`);
      }
      
      setResult(prev => prev + '\n✅ Supabase接続成功');
      
      // 2. テストデータ挿入
      const testUser = `test_user_${Date.now()}`;
      const { data: insertData, error: insertError } = await supabase
        .from('user_scores')
        .insert({
          user_name: testUser,
          game_type: 'memory',
          score: 100
        })
        .select();
      
      if (insertError) {
        throw new Error(`挿入エラー: ${insertError.message}`);
      }
      
      setResult(prev => prev + '\n✅ データ挿入成功');
      setResult(prev => prev + `\n挿入されたデータ: ${JSON.stringify(insertData)}`);
      
      // 3. データ取得テスト
      const { data: selectData, error: selectError } = await supabase
        .from('user_scores')
        .select('*')
        .eq('user_name', testUser);
      
      if (selectError) {
        throw new Error(`取得エラー: ${selectError.message}`);
      }
      
      setResult(prev => prev + '\n✅ データ取得成功');
      setResult(prev => prev + `\n取得データ: ${JSON.stringify(selectData)}`);
      
    } catch (error) {
      console.error('Supabaseテストエラー:', error);
      setResult(prev => prev + `\n❌ エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const checkAllScores = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('user_scores')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        throw new Error(error.message);
      }
      
      setResult(`📊 全スコアデータ (${data?.length || 0}件):\n${JSON.stringify(data, null, 2)}`);
    } catch (error) {
      setResult(`❌ エラー: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">Supabase接続テスト</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">環境変数確認</h2>
          <div className="space-y-2 text-sm">
            <p><strong>SUPABASE_URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL || '❌ 未設定'}</p>
            <p><strong>SUPABASE_KEY:</strong> {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定'}</p>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={testConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
            >
              {loading ? '実行中...' : '接続テスト'}
            </button>
            
            <button
              onClick={checkAllScores}
              disabled={loading}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400"
            >
              {loading ? '実行中...' : '全データ確認'}
            </button>
          </div>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">実行結果:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result || 'ボタンをクリックしてテストを実行'}</pre>
          </div>
        </div>
      </div>
    </div>
  );
}