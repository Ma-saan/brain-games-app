'use client';

import { useMemoryGame } from '../../../hooks/useMemoryGame';
import { GameLayout } from '../../../components/layout/GameLayout';
import { StatusDisplay } from '../../../components/ui/StatusDisplay';
import { Button } from '../../../components/ui/Button';
import NumberGrid from '../../../components/ui/NumberGrid';
import { GameInstructions } from '../../../components/ui/GameInstructions';
import { getMemoryRating } from '../../../utils/format';
import { PageHeader } from '../../../components/layout/PageHeader';

export default function MemoryGamePage() {
  const { 
    gameState,
    sequence,
    userSequence,
    score,
    level,
    highlightedButton,
    temporaryHighlight,
    statusMessage,
    startGame,
    handleButtonClick,
    resetGame
  } = useMemoryGame();

  const instructions = [
    '光る数字ボタンの順番を覚える',
    '覚えた順番通りにボタンをクリック（または1-9キーを押す）',
    '正解するとレベルアップ（順番が長くなる）',
    '間違えるとゲーム終了'
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="🧠 記憶ゲーム"
          description="光った順番を覚えて、同じ順番でクリック（またはキーボード入力）してください！"
          backLink="/"
        />

        <GameLayout>
          <div className="text-center mb-6">
            <StatusDisplay
              items={[
                { label: 'レベル', value: level.toString(), color: 'text-blue-600' },
                { label: 'スコア', value: score.toString(), color: 'text-blue-600' }
              ]}
            />
            
            <div className="text-lg mb-6 min-h-[3rem] flex items-center justify-center">
              {gameState === 'waiting' && 'ゲームを開始してください'}
              {statusMessage && statusMessage}
            </div>
          </div>

          {/* 3x3グリッド */}
          <NumberGrid
            highlightedNumber={highlightedButton}
            temporaryHighlight={temporaryHighlight}
            onButtonClick={handleButtonClick}
            disabled={gameState !== 'playing'}
            className="mb-6"
          />

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

          <div className="text-center space-y-4 mt-8">
            {gameState === 'waiting' && (
              <Button
                onClick={startGame}
                variant="primary"
                size="large"
              >
                ゲーム開始
              </Button>
            )}
            
            {gameState === 'finished' && (
              <div>
                <p className="text-lg font-bold mb-4">
                  最終スコア: {score}点　到達レベル: {level}
                </p>
                <p className="text-lg text-blue-700 mb-6">{getMemoryRating(score)}</p>
                <Button
                  onClick={resetGame}
                  variant="success"
                  size="large"
                >
                  もう一度
                </Button>
              </div>
            )}
          </div>
        </GameLayout>

        <GameInstructions
          instructions={instructions}
          bgColor="bg-blue-50"
          textColor="text-blue-700"
          borderColor="border-blue-200"
          className="mt-8"
        />
      </div>
    </div>
  );
}