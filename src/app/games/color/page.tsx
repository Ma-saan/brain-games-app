'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGame } from '../../context/GameContext';

export default function ColorGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'time' | 'mistake' | null>(null);
  const { saveScore } = useGame();


  const generateQuestion = useCallback(() => {
    const words = ['赤', '青', '緑', '黄', '紫', '黒'];
    const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-black'];
    
    const wordIndex = Math.floor(Math.random() * words.length);
    const colorIndex = Math.floor(Math.random() * colors.length);
    
    setCurrentWord(words[wordIndex]);
    setCurrentColor(colors[colorIndex]);
    setIsCorrect(wordIndex === colorIndex);
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setGameOverReason(null);
    generateQuestion();
  }, [generateQuestion]);

  const handleAnswer = useCallback((userAnswer: boolean) => {
    if (gameState !== 'playing' || isProcessingAnswer) return;

    // 連打防止のため回答処理中フラグを立てる
    setIsProcessingAnswer(true);

    const isAnswerCorrect = userAnswer === isCorrect;
    
    if (isAnswerCorrect) {
      setScore(prevScore => prevScore + 1);
      // 正解の場合は次の問題へ
      generateQuestion();
      // 少し遅延して回答処理フラグを解除（連打防止）
      setTimeout(() => {
        setIsProcessingAnswer(false);
      }, 300);
    } else {
      // 間違えたら終了
      setGameState('finished');
      setGameOverReason('mistake');
      // スコア保存
      saveScore('color', score).catch(console.error);
    }
  }, [gameState, isCorrect, isProcessingAnswer, score, generateQuestion, saveScore]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('finished');
      setGameOverReason('time');
      // スコア保存
      saveScore('color', score).catch(console.error);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft, saveScore, score]);

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(30);
    setCurrentWord('');
    setCurrentColor('');
    setGameOverReason(null);
  };

  const getRating = (score: number) => {
    if (score >= 25) return '🏆 色判別マスター！';
    if (score >= 20) return '🌟 素晴らしい集中力！';
    if (score >= 15) return '👍 なかなか良い成績！';
    if (score >= 10) return '😊 頑張りました！';
    if (score >= 5) return '💪 練習すればもっと良くなる！';
    return '🤔 もう一度チャレンジ！';
  };

  const getGameOverText = () => {
    if (gameOverReason === 'time') {
      return '時間切れ！';
    } else if (gameOverReason === 'mistake') {
      return '間違えました！';
    }
    return 'ゲーム終了！';
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-purple-800 mb-2">🎨 色判別ゲーム</h1>
          <p className="text-purple-600">文字の色と内容が一致するかを判断！</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-lg">
                <span className="font-bold text-purple-600">時間:</span> {timeLeft}秒
              </div>
              <div className="text-lg">
                <span className="font-bold text-purple-600">スコア:</span> {score}
              </div>
            </div>
          </div>

          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-lg mb-6">
                文字の色と内容が一致するかを判断しよう！<br />
                <span className="text-red-600 font-bold">間違えたらゲームオーバー！</span> かつ <span className="text-blue-600 font-bold">制限時間は30秒！</span>
              </p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors text-lg font-medium"
              >
                ゲーム開始
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="text-center">
              <div className="mb-8">
                <div className={`text-6xl font-bold ${currentColor} mb-6`}>
                  {currentWord}
                </div>
                <p className="text-lg text-gray-600 mb-6">文字の色と内容は一致していますか？</p>
              </div>
              
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => handleAnswer(true)}
                  disabled={isProcessingAnswer}
                  className={`px-8 py-4 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-xl font-medium ${isProcessingAnswer ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  ⭕ はい
                </button>
                <button
                  onClick={() => handleAnswer(false)}
                  disabled={isProcessingAnswer}
                  className={`px-8 py-4 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-xl font-medium ${isProcessingAnswer ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  ❌ いいえ
                </button>
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-purple-800 mb-4">{getGameOverText()}</h2>
              <p className="text-3xl font-bold text-purple-600 mb-2">{score}問正解</p>
              <p className="text-lg text-purple-700 mb-6">{getRating(score)}</p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
              >
                もう一度
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h3 className="font-bold text-purple-800 mb-2">🎯 遊び方</h3>
          <ul className="text-purple-700 text-sm space-y-1">
            <li>• 表示される文字の「色」と「内容」を確認</li>
            <li>• 一致していれば「はい」、違えば「いいえ」をクリック</li>
            <li>• 例：赤い色の「赤」→一致、青い色の「赤」→不一致</li>
            <li>• <span className="font-bold">制限時間30秒以内</span>にできるだけ多く正解しよう！</li>
            <li>• <span className="font-bold">1回でも間違えるとゲームオーバー</span>になるので注意！</li>
          </ul>
        </div>
      </div>
    </div>
  );
}