'use client';

import React from 'react';
import { GameResult } from '@/types/game';
import Button from './Button';

interface GameResultDisplayProps {
  result: GameResult;
  onRestart: () => void;
  getRating?: (score: number) => string;
  gameSpecificContent?: React.ReactNode;
  className?: string;
}

export default function GameResultDisplay({
  result,
  onRestart,
  getRating,
  gameSpecificContent,
  className = ''
}: GameResultDisplayProps) {
  const { score, level, gameOverReason } = result;

  const getGameOverText = () => {
    if (gameOverReason === 'time') {
      return '時間切れ！';
    } else if (gameOverReason === 'mistake') {
      return '間違えました！';
    }
    return 'ゲーム終了！';
  };

  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-2xl font-bold text-purple-800 mb-4">{getGameOverText()}</h2>
      
      <div className="mb-4">
        <p className="text-3xl font-bold text-purple-600 mb-2">
          {level ? `レベル ${level} - ` : ''}{score}{typeof score === 'number' && (score < 100 ? '点' : 'ms')}
        </p>
        
        {getRating && (
          <p className="text-lg text-purple-700 mb-6">{getRating(score)}</p>
        )}
      </div>
      
      {gameSpecificContent}
      
      <Button 
        onClick={onRestart}
        variant="success"
        size="large"
      >
        もう一度
      </Button>
    </div>
  );
}
