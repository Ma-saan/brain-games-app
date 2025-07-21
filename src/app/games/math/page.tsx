'use client';

import { useGame } from '../../context/GameContext';
import { useMathGame } from '@/hooks/useMathGame';
import { PageHeader } from '@/components/layout/PageHeader';
import { GameLayout } from '@/components/layout/GameLayout';
import { Button } from '@/components/ui/Button';
import { StatusDisplay } from '@/components/ui/StatusDisplay';
import { GameResultDisplay } from '@/components/ui/GameResultDisplay';
import { GameInstructions } from '@/components/ui/GameInstructions';

export default function MathGame() {
  const { saveScore } = useGame();
  const {
    gameState,
    score,
    level,
    timeLeft,
    currentProblem,
    userAnswer,
    startGame,
    submitAnswer,
    setUserAnswer,
    resetGame
  } = useMathGame(saveScore);

  const getRating = (score: number) => {
    if (score >= 500) return '🧮 計算の天才！';
    if (score >= 300) return '🌟 数学マスター！';
    if (score >= 200) return '🏆 素晴らしい計算力！';
    if (score >= 100) return '👍 良い成績です！';
    if (score >= 50) return '😊 頑張りました！';
    return '💪 練習すればもっと良くなる！';
  };

  const statusItems = [
    { label: '時間', value: `${timeLeft}秒` },
    { label: 'レベル', value: level.toString() },
    { label: 'スコア', value: score.toString() }
  ];

  const instructions = [
    '表示される計算問題を解いて答えを入力',
    '正解するとスコアがレベル×10点加算',
    'スコアが一定に達するとレベルアップ',
    'レベルが上がると問題が難しくなる'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-green-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="🔢 計算ゲーム"
          description="制限時間内に計算問題を解こう！"
          backLink="/"
        />

        <GameLayout>
          <StatusDisplay items={statusItems} />

          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-lg mb-6">60秒間で計算問題を解こう！レベルが上がると問題が難しくなります。</p>
              <Button
                onClick={startGame}
                variant="primary"
                size="large"
                className="bg-green-500 hover:bg-green-600"
              >
                ゲーム開始
              </Button>
            </div>
          )}

          {gameState === 'playing' && (
            <div className="text-center">
              <div className="mb-8">
                <div className="text-4xl font-bold text-green-800 mb-6">
                  {currentProblem.question} = ?
                </div>
              </div>
              
              <form onSubmit={submitAnswer} className="flex justify-center gap-4">
                <input
                  type="number"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="px-4 py-3 text-xl border-2 border-green-300 rounded-lg focus:outline-none focus:border-green-500 w-32 text-center"
                  placeholder="答え"
                  autoFocus
                />
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="bg-green-500 hover:bg-green-600"
                >
                  確認
                </Button>
              </form>
            </div>
          )}

          {gameState === 'finished' && (
            <GameResultDisplay
              title="ゲーム終了！"
              score={score}
              rating={getRating(score)}
              onRestart={resetGame}
              restartButtonColor="bg-green-500 hover:bg-green-600"
            />
          )}
        </GameLayout>

        <GameInstructions
          title="🎯 遊び方"
          instructions={instructions}
          bgColor="bg-green-50"
          borderColor="border-green-200"
          textColor="text-green-700"
          titleColor="text-green-800"
        />
      </div>
    </div>
  );
}