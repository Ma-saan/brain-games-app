'use client';

import { useGame } from '../../context/GameContext';
import { useReactionGame } from '@/hooks/useReactionGame';
import GameLayout from '@/components/layout/GameLayout';
import Button from '@/components/ui/Button';
import GameResultDisplay from '@/components/ui/GameResultDisplay';
import GameInstructions from '@/components/ui/GameInstructions';
import { getReactionRating } from '@/utils/format';

export default function ReactionGamePage() {
  const { currentUser } = useGame();
  const {
    gameState,
    reactionTime,
    handleClick,
    resetGame
    // gameOverReasonは未使用なので削除
  } = useReactionGame();

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

  const instructions = [
    '青い画面をクリックしてゲームを開始',
    '画面が赤になったら待機',
    '緑になったら即座にクリック！',
    '早すぎるとフライングになります'
  ];

  return (
    <GameLayout
      title="リアクションテスト"
      subtitle="画面が緑になったら即座にクリック！"
      icon="⚡"
      bgColor="bg-gradient-to-br from-gray-100 to-gray-200"
      textColor="text-gray-800"
    >
      <div className="text-center mb-4">
        <p className="text-sm text-blue-600">現在のユーザー: {currentUser}</p>
      </div>

      <div 
        className={`${getBackgroundColor()} rounded-lg p-16 text-center cursor-pointer transition-colors duration-200 min-h-[300px] flex items-center justify-center`}
        onClick={handleClick}
      >
        <div className="text-white text-2xl font-bold">
          {getMessage()}
        </div>
      </div>

      <div className="text-center mt-8 space-y-4">          
        {(gameState === 'clicked' || gameState === 'too-early') && (
          <Button
            onClick={resetGame}
            variant="success"
            size="large"
          >
            もう一度
          </Button>
        )}

        {reactionTime && gameState === 'clicked' && (
          <GameResultDisplay
            result={{
              score: reactionTime,
              gameOverReason: null
            }}
            onRestart={resetGame}
            getRating={getReactionRating}
          />
        )}
      </div>

      <GameInstructions
        instructions={instructions}
        bgColor="bg-yellow-50"
        textColor="text-yellow-700"
        borderColor="border-yellow-200"
        className="mt-8"
      />
    </GameLayout>
  );
}
