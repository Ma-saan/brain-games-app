'use client';

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug情報</h1>
      <div className="space-y-2">
        <p><strong>Supabase URL:</strong> {supabaseUrl || '❌ 未設定'}</p>
        <p><strong>Supabase Key:</strong> {supabaseKey ? '✅ 設定済み' : '❌ 未設定'}</p>
        <p><strong>Node環境:</strong> {process.env.NODE_ENV}</p>
      </div>
    </div>
  );
}