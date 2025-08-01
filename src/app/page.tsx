'use client';

import { useState } from 'react';
import Link from "next/link";
import { useGame } from './context/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { GameCard } from '@/components/ui/GameCard';
import { Button } from '@/components/ui/Button';
import { AuthButton } from '@/components/auth/AuthButton';
import { NicknameSetup } from '@/components/auth/NicknameSetup';
import { GAME_CARDS } from '@/data/games';

export default function Home() {
  const [username, setUsername] = useState('');
  const { currentUser, setCurrentUser, getBestScore, isReady } = useGame();
  const { isAuthenticated, isFirstTimeUser, loading: authLoading } = useAuth();

  // 初期化中はローディング表示
  if (!isReady || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="mt-4">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  // 初回ユーザーのニックネーム設定画面
  if (isFirstTimeUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
        <NicknameSetup 
          onComplete={() => {
            // プロフィール作成完了後、画面をリフレッシュ
            window.location.reload();
          }}
        />
      </div>
    );
  }

  const handleSetUser = () => {
    console.log('🔘 設定ボタンがクリックされました');
    console.log('📝 入力されたユーザー名:', `"${username}"`);
    
    if (username.trim()) {
      const trimmedUsername = username.trim();
      console.log('✅ ユーザー名設定開始:', trimmedUsername);
      setCurrentUser(trimmedUsername);
      setUsername('');
      console.log('🗑️ 入力フィールドをクリア');
    } else {
      console.log('⚠️ ユーザー名が空です');
      alert('ユーザー名を入力してください');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      console.log('⌨️ Enterキーが押されました');
      handleSetUser();
    }
  };

  console.log('🏠 Home画面レンダリング - 現在のユーザー:', currentUser);

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
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-wrap items-center gap-4 justify-center">
            {/* 認証状態に応じた表示 */}
            {isAuthenticated ? (
              <>
                <AuthButton />
                <Link href="/profile">
                  <Button variant="info">
                    👤 プロフィール
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <label htmlFor="username" className="text-green-800 font-medium">
                  👤 ユーザー名 (ゲスト):
                </label>
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    console.log('📝 入力変更:', e.target.value);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder="名前を入力してください"
                  maxLength={20}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <Button 
                  onClick={handleSetUser}
                  variant="success"
                >
                  設定
                </Button>
                <div className="text-sm text-gray-600 hidden md:block">
                  または
                </div>
                <AuthButton />
              </>
            )}
            
            <Link href="/history">
              <Button variant="info">
                📊 履歴
              </Button>
            </Link>
          </div>
          
          {/* ユーザー情報表示 */}
          <div id="current-user" className="text-center mt-4">
            {isAuthenticated ? (
              <div className="text-green-800">
                <span className="font-bold">認証ユーザーとしてログイン中</span>
                <p className="text-sm text-gray-600 mt-1">
                  スコアが自動保存されます
                </p>
              </div>
            ) : (
              <div className="text-green-800">
                <span className="font-bold">現在のユーザー (ゲスト): {currentUser}</span>
                <p className="text-sm text-gray-600 mt-1">
                  ログインするとスコアが永続保存されます
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {GAME_CARDS.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              bestScore={getBestScore(game.id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}