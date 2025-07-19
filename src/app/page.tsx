'use client';

import { useState } from 'react';
import Link from "next/link";
import { useGame } from './context/GameContext';

export default function Home() {
  const [username, setUsername] = useState('');
  const { currentUser, setCurrentUser, getBestScore, isReady } = useGame();

  // 初期化中はローディング表示
  if (!isReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl text-green-600 mb-4">🔐 安全な環境を準備中...</div>
          <div className="text-lg text-green-500">匿名認証を初期化しています</div>
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const handleSetUser = () => {
    if (username.trim()) {
      setCurrentUser(username.trim());
      setUsername('');
    } else {
      alert('ユーザー名を入力してください');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSetUser();
    }
  };

  const games = [
    { 
      id: 'reaction' as const, 
      title: '⚡ リアクションテスト', 
      description: '画面が変わったら即座にクリック！',
      color: 'bg-gradient-to-br from-yellow-400 to-orange-500'
    },
    { 
      id: 'memory' as const, 
      title: '🧠 記憶ゲーム', 
      description: '光る順番を覚えてクリック！',
      color: 'bg-gradient-to-br from-blue-400 to-blue-600'
    },
    { 
      id: 'color' as const, 
      title: '🎨 色判別', 
      description: '文字の色と内容が一致するかを判断！',
      color: 'bg-gradient-to-br from-purple-400 to-pink-500'
    },
    { 
      id: 'math' as const, 
      title: '🔢 計算', 
      description: '制限時間内に計算問題を解こう！',
      color: 'bg-gradient-to-br from-green-400 to-green-600'
    },
    { 
      id: 'pattern' as const, 
      title: '🔍 パターン認識', 
      description: '規則性を見つけて答えを推測！',
      color: 'bg-gradient-to-br from-indigo-400 to-purple-600'
    },
    { 
      id: 'typing' as const, 
      title: '⌨️ タイピング', 
      description: 'できるだけ早く正確にタイピング！',
      color: 'bg-gradient-to-br from-red-400 to-red-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-800 mb-4">
            🧠 脳トレミニゲーム集
          </h1>
          <p className="text-green-600 text-lg">
            様々なゲームで脳を鍛えよう！
          </p>
          <div className="text-sm text-green-500 mt-2">
            🔒 安全な匿名認証で保護されています
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 justify-center">
            <label htmlFor="username" className="text-green-800 font-medium">
              👤 ユーザー名:
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="名前を入力してください"
              maxLength={20}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <button 
              onClick={handleSetUser}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              設定
            </button>
            <Link href="/history">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                📊 履歴
              </button>
            </Link>
          </div>
          <div id="current-user" className="text-center mt-4 font-bold text-green-800">
            現在のユーザー: {currentUser}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {games.map((game) => (
            <Link key={game.id} href={`/games/${game.id}`}>
              <div className={`${game.color} text-white p-6 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 cursor-pointer`}>
                <h3 className="text-xl font-bold mb-3">{game.title}</h3>
                <p className="text-white/90 mb-4">{game.description}</p>
                <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-medium">
                  ベスト: {getBestScore(game.id)}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
