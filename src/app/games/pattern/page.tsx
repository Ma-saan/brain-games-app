'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';

export default function PatternGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [patterns, setPatterns] = useState<Array<{
    sequence: number[];
    options: number[];
    correct: number;
  }>>([]);

  const generatePatterns = useCallback(() => {
    const newPatterns = [];
    
    for (let i = 0; i < 10; i++) {
      let sequence: number[], correct: number;
      
      if (i < 3) {
        // 簡単な等差数列
        const start = Math.floor(Math.random() * 10) + 1;
        const diff = Math.floor(Math.random() * 5) + 1;
        sequence = [start, start + diff, start + 2 * diff, start + 3 * diff];
        correct = start + 4 * diff;
      } else if (i < 6) {
        // 等比数列
        const start = Math.floor(Math.random() * 5) + 1;
        const ratio = Math.floor(Math.random() * 3) + 2;
        sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
        correct = start * Math.pow(ratio, 4);
      } else {
        // より複雑なパターン
        const patterns = [
          // フィボナッチ風
          () => {
            const seq = [1, 1];
            for (let j = 2; j < 4; j++) {
              seq.push(seq[j-1] + seq[j-2]);
            }
            return { sequence: seq, correct: seq[2] + seq[3] };
          },
          // 平方数
          () => {
            const seq = [1, 4, 9, 16];
            return { sequence: seq, correct: 25 };
          },
          // 交互パターン
          () => {
            const base = Math.floor(Math.random() * 10) + 1;
            const seq = [base, base + 2, base + 1, base + 3];
            return { sequence: seq, correct: base + 2 };
          }
        ];
        
        const patternFunc = patterns[Math.floor(Math.random() * patterns.length)];
        const result = patternFunc();
        sequence = result.sequence;
        correct = result.correct;
      }
      
      // 選択肢を生成
      const options = [correct];
      while (options.length < 4) {
        const option = correct + Math.floor(Math.random() * 21) - 10;
        if (option > 0 && !options.includes(option)) {
          options.push(option);
        }
      }
      
      // シャッフル
      for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
      }
      
      newPatterns.push({ sequence, options, correct });
    }
    
    return newPatterns;
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setCurrentQuestion(0);
    setPatterns(generatePatterns());
  }, [generatePatterns]);

  const handleAnswer = useCallback((answer: number) => {
    if (gameState !== 'playing') return;
    
    const isCorrect = answer === patterns[currentQuestion].correct;
    if (isCorrect) {
      setScore(score + 10);
    }
    
    if (currentQuestion < patterns.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setGameState('finished');
    }
  }, [gameState, patterns, currentQuestion, score]);

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setCurrentQuestion(0);
    setPatterns([]);
  };

  const getRating = (score: number) => {
    if (score >= 90) return '🧠 パターン認識の天才！';
    if (score >= 80) return '🌟 素晴らしい論理思考力！';
    if (score >= 70) return '🏆 優秀な分析能力！';
    if (score >= 60) return '👍 良い観察力です！';
    if (score >= 50) return '😊 頑張りました！';
    return '💪 練習すればもっと良くなる！';
  };

  const currentPattern = patterns[currentQuestion];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-indigo-800 mb-2">🔍 パターン認識ゲーム</h1>
          <p className="text-indigo-600">規則性を見つけて答えを推測！</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-lg mb-6">数列のパターンを見つけて、次の数字を当てよう！</p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-lg font-medium"
              >
                ゲーム開始
              </button>
            </div>
          )}

          {gameState === 'playing' && currentPattern && (
            <div className="text-center">
              <div className="mb-6">
                <div className="text-lg font-bold text-indigo-600 mb-4">
                  問題 {currentQuestion + 1} / {patterns.length}
                </div>
                <div className="text-lg mb-2">スコア: {score}点</div>
              </div>
              
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-4">次の数列の規則性を見つけて、?の数字を選んでください</p>
                <div className="text-3xl font-bold text-indigo-800 mb-6">
                  {currentPattern.sequence.join(', ')}, ?
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {currentPattern.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    className="px-6 py-4 bg-indigo-100 text-indigo-800 rounded-lg hover:bg-indigo-200 transition-colors text-xl font-medium border-2 border-indigo-200 hover:border-indigo-400"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-indigo-800 mb-4">ゲーム終了！</h2>
              <p className="text-3xl font-bold text-indigo-600 mb-2">{score}点 / 100点</p>
              <p className="text-lg text-indigo-700 mb-2">正答率: {(score / 100 * 100).toFixed(0)}%</p>
              <p className="text-lg text-indigo-700 mb-6">{getRating(score)}</p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
              >
                もう一度
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <h3 className="font-bold text-indigo-800 mb-2">🎯 遊び方</h3>
          <ul className="text-indigo-700 text-sm space-y-1">
            <li>• 数列の規則性（パターン）を見つける</li>
            <li>• 等差数列、等比数列、特殊な数列など様々</li>
            <li>• 4つの選択肢から正しい答えを選ぶ</li>
            <li>• 全10問で論理思考力をテスト</li>
          </ul>
        </div>
      </div>
    </div>
  );
}