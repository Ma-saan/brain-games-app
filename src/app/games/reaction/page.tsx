'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGame } from '../../context/GameContext';

export default function ReactionGame() {
  const [gameState, setGameState] = useState<'waiting' | 'ready' | 'go' | 'clicked' | 'too-early'>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const { saveScore } = useGame();

  const startGame = useCallback(() => {
    setGameState('ready');
    setReactionTime(null);
    
    const delay = Math.random() * 4000 + 1000; // 1-5秒のランダム待機
    const id = setTimeout(() => {
      setGameState('go');
      setStartTime(Date.now());
    }, delay);
    
    setTimeoutId(id);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'ready') {
      setGameState('too-early');
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    } else if (gameState === 'go') {
      const reaction = Date.now() - startTime;
      setReactionTime(reaction);
      setGameState('clicked');
      // スコア保存
      saveScore('reaction', reaction).catch(console.error);
    }
  }, [gameState, startTime, timeoutId, saveScore]);

  const resetGame = useCallback(() => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setGameState('waiting');
    setReactionTime(null);
  }, [timeoutId]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  const getBackgroundColor = () => {
    switch (gameState) {
      case 'ready': return 'bg-red-500';
      case 'go': return 'bg-green-500';
      case 'too-early': return 'bg-red-700';
      default: return 'bg-blue-500';
    }
  };

  const getMessage = () => {
    switch (gameState) {
      case 'waiting':
        return 'クリックして開始';
      case 'ready':
        return '待って... 緑になったらクリック！';
      case 'go':
        return '今だ！クリック！';
      case 'clicked':
        return `リアクション時間: ${reactionTime}ms`;
      case 'too-early':
        return 'フライング！早すぎました';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚡ リアクションテスト</h1>
          <p className="text-gray-600">画面が緑になったら即座にクリック！</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div 
            className={`${getBackgroundColor()} rounded-lg p-16 text-center cursor-pointer transition-colors duration-200 min-h-[300px] flex items-center justify-center`}
            onClick={handleClick}
          >
            <div className="text-white text-2xl font-bold">
              {getMessage()}
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          {gameState === 'waiting' && (
            <button
              onClick={startGame}
              className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-lg font-medium"
            >
              ゲーム開始
            </button>
          )}
          
          {(gameState === 'clicked' || gameState === 'too-early') && (
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
            >
              もう一度
            </button>
          )}

          {reactionTime && (
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="text-lg font-bold text-gray-800 mb-2">結果</h3>
              <p className="text-2xl font-bold text-blue-600">{reactionTime}ms</p>
              <p className="text-gray-600 mt-2">
                {reactionTime < 200 ? '🏆 超人的な反応！' :
                 reactionTime < 300 ? '🌟 素晴らしい反応！' :
                 reactionTime < 400 ? '👍 良い反応！' :
                 reactionTime < 500 ? '😊 なかなか良い！' :
                 '💪 練習すればもっと早くなる！'}
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="font-bold text-yellow-800 mb-2">🎯 遊び方</h3>
          <ul className="text-yellow-700 text-sm space-y-1">
            <li>• 「ゲーム開始」ボタンをクリック</li>
            <li>• 画面が赤になったら待機</li>
            <li>• 緑になったら即座にクリック！</li>
            <li>• 早すぎるとフライングになります</li>
          </ul>
        </div>
      </div>
    </div>
  );
}