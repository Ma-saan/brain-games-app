'use client';

import Link from 'next/link';
import { useTypingGame } from '../../../hooks/useTypingGame';
import { PageHeader } from '../../../components/layout/PageHeader';
import { GameLayout } from '../../../components/layout/GameLayout';
import { Button } from '../../../components/ui/Button';
import { StatusDisplay } from '../../../components/ui/StatusDisplay';
import { GameResultDisplay } from '../../../components/ui/GameResultDisplay';
import { GameInstructions } from '../../../components/ui/GameInstructions';

export default function TypingGame() {
  const {
    gameState,
    score,
    timeLeft,
    completedWords,
    userInput,
    startGame,
    handleInputChange,
    resetGame,
    getStats,
    getCharacterData
  } = useTypingGame();

  const { wpm, accuracy } = getStats();

  const getRating = (score: number, accuracy: number) => {
    if (score >= 2000 && accuracy >= 95) return '⌨️ タイピングマスター！';
    if (score >= 1500 && accuracy >= 90) return '🌟 素晴らしいスキル！';
    if (score >= 1000 && accuracy >= 85) return '🏆 優秀なタイピング！';
    if (score >= 500 && accuracy >= 80) return '👍 良いペースです！';
    if (score >= 200) return '😊 頑張りました！';
    return '💪 練習すればもっと速くなる！';
  };

  // 文字色分けロジック
  const renderWord = () => {
    const characterData = getCharacterData();
    
    return characterData.map(({ char, status }, index) => {
      let className = '';
      
      switch (status) {
        case 'correct':
          className = 'text-green-600 bg-green-100';
          break;
        case 'incorrect':
          className = 'text-red-600 bg-red-100';
          break;
        case 'current':
          className = 'text-gray-800 bg-blue-200';
          break;
        default:
          className = 'text-gray-400';
      }
      
      return (
        <span key={index} className={`${className} px-1 rounded`}>
          {char}
        </span>
      );
    });
  };

  const statusItems = [
    { label: '時間', value: `${timeLeft}秒` },
    { label: '完了', value: `${completedWords}語` },
    { label: 'スコア', value: score.toString() },
    ...(gameState === 'playing' ? [
      { label: 'WPM', value: wpm.toString() },
      { label: '正確性', value: `${accuracy}%` }
    ] : [])
  ];

  const instructions = [
    '表示される英単語を正確にタイピング',
    '完了すると次の単語が表示される',
    'スコア = 完了した文字数 × 10点',
    'WPM（Words Per Minute）と正確性も測定'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="⌨️ タイピングゲーム"
          description="できるだけ早く正確にタイピング！"
          backLink="/"
        />

        <GameLayout>
          <StatusDisplay items={statusItems} />

          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-lg mb-6">60秒間でできるだけ多くの単語をタイピングしよう！</p>
              <Button
                onClick={startGame}
                variant="primary"
                size="large"
                className="bg-red-500 hover:bg-red-600"
              >
                ゲーム開始
              </Button>
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
                  <div className="text-2xl font-bold text-red-600">{wpm}</div>
                  <div className="text-sm text-red-700">WPM</div>
                </div>
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{accuracy}%</div>
                  <div className="text-sm text-red-700">正確性</div>
                </div>
              </div>
              <p className="text-lg text-red-700 mb-6">{getRating(score, accuracy)}</p>
              <Button
                onClick={resetGame}
                variant="primary"
                size="large"
                className="bg-green-500 hover:bg-green-600"
              >
                もう一度
              </Button>
            </div>
          )}
        </GameLayout>

        <GameInstructions
          title="🎯 遊び方"
          instructions={instructions}
          bgColor="bg-red-50"
          borderColor="border-red-200"
          textColor="text-red-700"
          titleColor="text-red-800"
        />
      </div>
    </div>
  );
}