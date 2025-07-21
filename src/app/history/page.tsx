'use client';

import Link from 'next/link';
import { useGame } from '../context/GameContext';

export default function HistoryPage() {
  const { userScores } = useGame();
  
  const gameNames = {
    reaction: '⚡ リアクションテスト',
    memory: '🧠 記憶ゲーム',
    color: '🎨 色判別',
    math: '🔢 計算',
    pattern: '🔍 パターン認識',
    typing: '⌨️ タイピング'
  };

  const hasAnyScores = Object.keys(userScores).length > 0 && 
    Object.values(userScores).some(scores => 
      Object.values(scores).some(score => score !== null)
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">📊 ユーザー履歴</h1>
          <p className="text-blue-600">全ユーザーのスコア履歴を確認できます</p>
        </div>

        {!hasAnyScores ? (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <div className="text-center text-gray-500">
              <p className="text-lg mb-4">まだ履歴がありません</p>
              <p className="text-sm">ゲームをプレイしてスコアを記録しましょう！</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(userScores).map(([username, scores]) => {
              const hasScores = Object.values(scores).some(score => score !== null);
              if (!hasScores) return null;

              return (
                <div key={username} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">👤 {username}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(scores).map(([gameId, score]) => {
                      if (score === null) return null;
                      
                      return (
                        <div key={gameId} className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm text-blue-600 mb-1">
                            {gameNames[gameId as keyof typeof gameNames]}
                          </div>
                          <div className="text-lg font-bold text-blue-800">
                            {gameId === 'reaction' ? `${score}ms` : `${score}点`}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">💡 ヒント</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• ユーザー名を設定してゲームをプレイすると履歴が保存されます</li>
            <li>• 各ゲームのベストスコアが記録されます</li>
            <li>• 複数のユーザーでスコアを競い合えます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}