'use client';

import React from 'react';
import { Button } from './Button';

interface GameResultDisplayProps {
  title: string;
  score: number;
  maxScore?: number;
  additionalInfo?: string;
  rating: string;
  onRestart: () => void;
  restartButtonColor?: string;
  gameSpecificContent?: React.ReactNode;
  className?: string;
}

export function GameResultDisplay({
  title,
  score,
  maxScore,
  additionalInfo,
  rating,
  onRestart,
  restartButtonColor = 'bg-green-500 hover:bg-green-600',
  gameSpecificContent,
  className = ''
}: GameResultDisplayProps) {
  return (
    <div className={`text-center ${className}`}>
      <h2 className="text-2xl font-bold text-purple-800 mb-4">{title}</h2>
      
      <div className="mb-4">
        <p className="text-3xl font-bold text-purple-600 mb-2">
          {score}点{maxScore ? ` / ${maxScore}点` : ''}
        </p>
        
        {additionalInfo && (
          <p className="text-lg text-purple-700 mb-2">{additionalInfo}</p>
        )}
        
        <p className="text-lg text-purple-700 mb-6">{rating}</p>
      </div>
      
      {gameSpecificContent}
      
      <Button 
        onClick={onRestart}
        variant="success"
        size="large"
        className={restartButtonColor}
      >
        もう一度
      </Button>
    </div>
  );
}