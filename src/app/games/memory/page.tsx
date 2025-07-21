'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGame } from '../../context/GameContext';

export default function MemoryGame() {
  const [gameState, setGameState] = useState<'waiting' | 'showing' | 'playing' | 'finished'>('waiting');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highlightedButton, setHighlightedButton] = useState<number | null>(null);
  const [temporaryHighlight, setTemporaryHighlight] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const { saveScore } = useGame();

  const generateSequence = useCallback((length: number) => {
    const newSequence = [];
    for (let i = 0; i < length; i++) {
      newSequence.push(Math.floor(Math.random() * 9) + 1); // 1-9の数字
    }
    return newSequence;
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    setGameState('showing');
    setStatusMessage('順番を覚えてください...');
    setHighlightedButton(null);
    setUserSequence([]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (let i = 0; i < seq.length; i++) {
      setHighlightedButton(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 600));
      setHighlightedButton(null);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setGameState('playing');
    setStatusMessage('今度はあなたの番です！同じ順番でクリックしてください');
  }, []);

  const startGame = useCallback(() => {
    const newSequence = generateSequence(3);
    setSequence(newSequence);
    setUserSequence([]);
    setScore(0);
    setLevel(1);
    showSequence(newSequence);
  }, [generateSequence, showSequence]);

  const nextLevel = useCallback(() => {
    const newSequence = generateSequence(level + 2); // レベル1で3個、レベル2で4個...
    setSequence(newSequence);
    setUserSequence([]);
    showSequence(newSequence);
  }, [level, generateSequence, showSequence]);

  const handleButtonClick = useCallback((buttonNumber: number) => {
    if (gameState !== 'playing') return;

    // 一時的に押されたボタンをハイライト
    setTemporaryHighlight(buttonNumber);
    setTimeout(() => {
      setTemporaryHighlight(null);
    }, 300); // 300ミリ秒後にハイライトを消す

    const newUserSequence = [...userSequence, buttonNumber];
    setUserSequence(newUserSequence);

    if (buttonNumber !== sequence[newUserSequence.length - 1]) {
      // 間違い
      setGameState('finished');
      setStatusMessage(`間違いです！正解は: ${sequence.join(', ')}`);
      // スコア保存
      saveScore('memory', score).catch(console.error);
      return;
    }

    if (newUserSequence.length === sequence.length) {
      // レベルクリア
      const newScore = score + sequence.length * 10;
      setScore(newScore);
      setLevel(level + 1);
      setStatusMessage(`レベル ${level} クリア！`);
      
      setTimeout(() => {
        nextLevel();
      }, 1500);
    }
  }, [gameState, userSequence, sequence, score, level, nextLevel, saveScore]);

  // キーボード入力対応
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const key = event.key;
      if (key >= '1' && key <= '9') {
        handleButtonClick(parseInt(key));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleButtonClick]);

  const resetGame = () => {
    setGameState('waiting');
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setLevel(1);
    setHighlightedButton(null);
    setTemporaryHighlight(null);
    setStatusMessage('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">🧠 記憶ゲーム</h1>
          <p className="text-blue-600">光った順番を覚えて、同じ順番でクリック（またはキーボード入力）してください！</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-lg">
                <span className="font-bold text-blue-600">レベル:</span> {level}
              </div>
              <div className="text-lg">
                <span className="font-bold text-blue-600">スコア:</span> {score}
              </div>
            </div>
            
            <div className="text-lg mb-6 min-h-[3rem] flex items-center justify-center">
              {gameState === 'waiting' && 'ゲームを開始してください'}
              {statusMessage && statusMessage}
            </div>
          </div>

          {/* 3x3グリッド */}
          <div className="grid grid-cols-3 gap-3 max-w-xs mx-auto mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
              <button
                key={number}
                className={`
                  w-20 h-20 bg-blue-500 text-white text-xl font-bold rounded-lg transition-all duration-200 shadow-lg
                  ${highlightedButton === number ? 'bg-yellow-400 scale-110 shadow-xl' : ''}
                  ${temporaryHighlight === number ? 'bg-green-500 scale-110 shadow-xl' : ''}
                  ${gameState === 'playing' ? 'hover:bg-blue-600 cursor-pointer' : 'cursor-not-allowed'}
                `}
                onClick={() => handleButtonClick(number)}
                disabled={gameState !== 'playing'}
              >
                {number}
              </button>
            ))}
          </div>

          {/* 現在の入力状況 */}
          {gameState === 'playing' && (
            <div className="text-center mb-4">
              <p className="text-sm text-gray-600 mb-2">入力済み:</p>
              <div className="text-lg font-mono">
                {userSequence.join(' → ')}
                {userSequence.length < sequence.length && ' → ?'}
              </div>
            </div>
          )}
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
          
          {gameState === 'finished' && (
            <div>
              <p className="text-lg font-bold mb-4">
                最終スコア: {score}点　到達レベル: {level}
              </p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
              >
                もう一度
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">🎯 遊び方</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• 光る数字ボタンの順番を覚える</li>
            <li>• 覚えた順番通りにボタンをクリック（または1-9キーを押す）</li>
            <li>• 正解するとレベルアップ（順番が長くなる）</li>
            <li>• 間違えるとゲーム終了</li>
          </ul>
        </div>
      </div>
    </div>
  );
}