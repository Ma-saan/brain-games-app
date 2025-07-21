'use client';

import { useGame } from '../../context/GameContext';
import { usePatternGame } from '../../../hooks/usePatternGame';
import { PageHeader } from '../../../components/layout/PageHeader';
import { GameLayout } from '../../../components/layout/GameLayout';
import { Button } from '../../../components/ui/Button';
import { StatusDisplay } from '../../../components/ui/StatusDisplay';
import { GameResultDisplay } from '../../../components/ui/GameResultDisplay';
import { GameInstructions } from '../../../components/ui/GameInstructions';

export default function PatternGame() {
  const { saveScore } = useGame();
  const {
    gameState,
    score,
    currentQuestion,
    totalQuestions,
    currentPattern,
    startGame,
    handleAnswer,
    resetGame
  } = usePatternGame(saveScore);

  const getRating = (score: number) => {
    if (score >= 90) return '🧠 パターン認識の天才！';
    if (score >= 80) return '🌟 素晴らしい論理思考力！';
    if (score >= 70) return '🏆 優秀な分析能力！';
    if (score >= 60) return '👍 良い観察力です！';
    if (score >= 50) return '😊 頑張りました！';
    return '💪 練習すればもっと良くなる！';
  };

  const statusItems = [
    { label: '問題', value: `${currentQuestion + 1} / ${totalQuestions}` },
    { label: 'スコア', value: `${score}点` }
  ];

  const instructions = [
    '数列の規則性（パターン）を見つける',
    '等差数列、等比数列、特殊な数列など様々',
    '4つの選択肢から正しい答えを選ぶ',
    '全10問で論理思考力をテスト'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="🔍 パターン認識ゲーム"
          description="規則性を見つけて答えを推測！"
          backLink="/"
        />

        <GameLayout>
          {gameState === 'waiting' && (
            <div className="text-center">
              <p className="text-lg mb-6">数列のパターンを見つけて、次の数字を当てよう！</p>
              <Button
                onClick={startGame}
                variant="primary"
                size="large"
                className="bg-indigo-500 hover:bg-indigo-600"
              >
                ゲーム開始
              </Button>
            </div>
          )}

          {gameState === 'playing' && currentPattern && (
            <div className="text-center">
              <StatusDisplay items={statusItems} />
              
              <div className="mb-8">
                <p className="text-lg text-gray-600 mb-4">次の数列の規則性を見つけて、?の数字を選んでください</p>
                <div className="text-3xl font-bold text-indigo-800 mb-6">
                  {currentPattern.sequence.join(', ')}, ?
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                {currentPattern.options.map((option, index) => (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(option)}
                    variant="secondary"
                    size="large"
                    className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border-2 border-indigo-200 hover:border-indigo-400 text-xl font-medium"
                  >
                    {option}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {gameState === 'finished' && (
            <GameResultDisplay
              title="ゲーム終了！"
              score={score}
              maxScore={100}
              additionalInfo={`正答率: ${(score / 100 * 100).toFixed(0)}%`}
              rating={getRating(score)}
              onRestart={resetGame}
              restartButtonColor="bg-green-500 hover:bg-green-600"
            />
          )}
        </GameLayout>

        <GameInstructions
          title="🎯 遊び方"
          instructions={instructions}
          bgColor="bg-indigo-50"
          borderColor="border-indigo-200"
          textColor="text-indigo-700"
          titleColor="text-indigo-800"
        />
      </div>
    </div>
  );
}