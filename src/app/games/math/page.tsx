'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useGame } from '../../context/GameContext';

export default function MathGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentProblem, setCurrentProblem] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const { saveScore } = useGame();

  const generateProblem = useCallback(() => {
    let a: number, b: number, operation: string, answer: number;
    
    if (level <= 3) {
      // 簡単な加減算
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      operation = Math.random() < 0.5 ? '+' : '-';
      answer = operation === '+' ? a + b : a - b;
      if (answer < 0) {
        [a, b] = [b, a];
        answer = a - b;
      }
    } else if (level <= 6) {
      // 掛け算
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      operation = '×';
      answer = a * b;
    } else {
      // 複雑な計算
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '×'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      
      switch (operation) {
        case '+':
          answer = a + b;
          break;
        case '-':
          answer = a - b;
          break;
        case '×':
          answer = a * b;
          break;
        default:
          answer = a + b;
      }
    }
    
    setCurrentProblem(`${a} ${operation} ${b}`);
    setCorrectAnswer(answer);
  }, [level]);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setUserAnswer('');
    generateProblem();
  }, [generateProblem]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (gameState !== 'playing') return;
    
    const answer = parseInt(userAnswer);
    if (isNaN(answer)) return;
    
    if (answer === correctAnswer) {
      const newScore = score + level * 10;
      setScore(newScore);
      
      // レベルアップ条件
      if (newScore >= level * 50) {
        setLevel(level + 1);
      }
    }
    
    setUserAnswer('');
    generateProblem();
  }, [gameState, userAnswer, correctAnswer, score, level, generateProblem]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setGameState('finished');
      // スコア保存
      saveScore('math', score).catch(console.error);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft, saveScore, score]);

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setUserAnswer('');
    setCurrentProblem('');
  };

  const getRating = (score: number) => {
    if (score >= 500) return '🧮 計算の天才！';
    if (score >= 300) return '🌟 数学マスター！';
    if (score >= 200) return '🏆 素晴らしい計算力！';
    if (score >= 100) return '👍 良い成績です！';
    if (score >= 50) return '😊 頑張りました！';
    return '💪 練習すればもっと良くなる！';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-green-800 mb-2">🔢 計算ゲーム</h1>
          <p className="text-green-600">制限時間内に計算問題を解こう！</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex justify-center gap-8 mb-4">
              <div className="text-lg">
                <span className="font-bold text-green-600">時間:</span> {timeLeft}秒
              </div>
              <div className="text-lg">
                <span className="font-bold text-green-600">レベル:</span> {level}
              </div>
              <div className="text-lg">
                <span className="font-bold text-green-600">スコア:</span> {score}
              </div>
            </div>
          </div>

          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-lg mb-6">60秒間で計算問題を解こう！レベルが上がると問題が難しくなります。</p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
              >
                ゲーム開始
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="text-center">
              <div className="mb-8">
                <div className="text-4xl font-bold text-green-800 mb-6">
                  {currentProblem} = ?
                </div>
              </div>
              
              <form onSubmit={handleSubmit} className="flex justify-center gap-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="px-4 py-3 text-xl border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 w-32 text-center"
                  placeholder="答え"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
                >
                  確認
                </button>
              </form>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-green-800 mb-4">ゲーム終了！</h2>
              <p className="text-3xl font-bold text-green-600 mb-2">{score}点</p>
              <p className="text-lg text-green-700 mb-6">{getRating(score)}</p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
              >
                もう一度
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold text-green-800 mb-2">🎯 遊び方</h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>• 表示される計算問題を解いて答えを入力</li>
            <li>• 正解するとスコアがレベル×10点加算</li>
            <li>• スコアが一定に達するとレベルアップ</li>
            <li>• レベルが上がると問題が難しくなる</li>
          </ul>
        </div>
      </div>
    </div>
  );
}