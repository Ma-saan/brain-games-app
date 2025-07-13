'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

export default function TypingGame() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [completedWords, setCompletedWords] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);


  const getRandomWord = useCallback(() => {
    const words = [
      'apple', 'banana', 'orange', 'grape', 'lemon',
      'computer', 'keyboard', 'mouse', 'screen', 'window',
      'programming', 'javascript', 'react', 'next', 'typescript',
      'hello', 'world', 'game', 'typing', 'speed',
      'quick', 'brown', 'fox', 'jumps', 'over',
      'lazy', 'dog', 'pack', 'quiz', 'five',
      'amazing', 'wonderful', 'fantastic', 'brilliant', 'excellent'
    ];
    return words[Math.floor(Math.random() * words.length)];
  }, []);

  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setUserInput('');
    setCompletedWords(0);
    setTotalChars(0);
    setCorrectChars(0);
    setCurrentWord(getRandomWord());
  }, [getRandomWord]);

  const handleInputChange = useCallback((value: string) => {
    setUserInput(value);
    
    if (value === currentWord) {
      // 単語完成
      const wordScore = currentWord.length * 10;
      setScore(score + wordScore);
      setCompletedWords(completedWords + 1);
      setCorrectChars(correctChars + currentWord.length);
      setTotalChars(totalChars + currentWord.length);
      
      // 次の単語
      setUserInput('');
      setCurrentWord(getRandomWord());
    }
  }, [currentWord, score, completedWords, correctChars, totalChars, getRandomWord]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      // 最終的な統計を計算
      setTotalChars(totalChars + userInput.length);
      let finalCorrectChars = correctChars;
      for (let i = 0; i < userInput.length && i < currentWord.length; i++) {
        if (userInput[i] === currentWord[i]) {
          finalCorrectChars++;
        }
      }
      setCorrectChars(finalCorrectChars);
      setGameState('finished');
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft, totalChars, userInput, currentWord, correctChars]);

  const resetGame = () => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(60);
    setUserInput('');
    setCurrentWord('');
    setCompletedWords(0);
    setTotalChars(0);
    setCorrectChars(0);
  };

  const getAccuracy = () => {
    return totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
  };

  const getWPM = () => {
    const timeElapsed = (60 - timeLeft) / 60;
    return timeElapsed > 0 ? Math.round(completedWords / timeElapsed) : 0;
  };

  const getRating = (score: number, accuracy: number) => {
    if (score >= 2000 && accuracy >= 95) return '⌨️ タイピングマスター！';
    if (score >= 1500 && accuracy >= 90) return '🌟 素晴らしいスキル！';
    if (score >= 1000 && accuracy >= 85) return '🏆 優秀なタイピング！';
    if (score >= 500 && accuracy >= 80) return '👍 良いペースです！';
    if (score >= 200) return '😊 頑張りました！';
    return '💪 練習すればもっと速くなる！';
  };

  const renderWord = () => {
    return currentWord.split('').map((char, index) => {
      let className = 'text-gray-400';
      
      if (index < userInput.length) {
        className = userInput[index] === char ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
      } else if (index === userInput.length) {
        className = 'text-gray-800 bg-blue-200';
      }
      
      return (
        <span key={index} className={`${className} px-1 rounded`}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-red-800 mb-2">⌨️ タイピングゲーム</h1>
          <p className="text-red-600">できるだけ早く正確にタイピング！</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="text-center mb-6">
            <div className="flex justify-center gap-8 mb-4 text-sm">
              <div>
                <span className="font-bold text-red-600">時間:</span> {timeLeft}秒
              </div>
              <div>
                <span className="font-bold text-red-600">完了:</span> {completedWords}語
              </div>
              <div>
                <span className="font-bold text-red-600">スコア:</span> {score}
              </div>
              {gameState === 'playing' && (
                <>
                  <div>
                    <span className="font-bold text-red-600">WPM:</span> {getWPM()}
                  </div>
                  <div>
                    <span className="font-bold text-red-600">正確性:</span> {getAccuracy()}%
                  </div>
                </>
              )}
            </div>
          </div>

          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-lg mb-6">60秒間でできるだけ多くの単語をタイピングしよう！</p>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-lg font-medium"
              >
                ゲーム開始
              </button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="text-center">
              <div className="mb-8">
                <div className="text-4xl font-mono font-bold mb-6 p-4 bg-gray-50 rounded-lg">
                  {renderWord()}
                </div>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => handleInputChange(e.target.value)}
                  className="px-4 py-3 text-xl border-2 border-red-300 rounded-lg focus:outline-none focus:border-red-500 w-80 text-center font-mono"
                  placeholder="ここにタイプ"
                  autoFocus
                />
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-800 mb-4">ゲーム終了！</h2>
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-6">
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{score}</div>
                  <div className="text-sm text-red-700">スコア</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{completedWords}</div>
                  <div className="text-sm text-red-700">完了語数</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{getWPM()}</div>
                  <div className="text-sm text-red-700">WPM</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{getAccuracy()}%</div>
                  <div className="text-sm text-red-700">正確性</div>
                </div>
              </div>
              <p className="text-lg text-red-700 mb-6">{getRating(score, getAccuracy())}</p>
              <button
                onClick={resetGame}
                className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-lg font-medium"
              >
                もう一度
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="font-bold text-red-800 mb-2">🎯 遊び方</h3>
          <ul className="text-red-700 text-sm space-y-1">
            <li>• 表示される英単語を正確にタイピング</li>
            <li>• 完了すると次の単語が表示される</li>
            <li>• スコア = 完了した文字数 × 10点</li>
            <li>• WPM（Words Per Minute）と正確性も測定</li>
          </ul>
        </div>
      </div>
    </div>
  );
}