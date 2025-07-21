'use client';

import React from 'react';
import Link from 'next/link';
import { GameCardInfo } from '../../../types/game';

interface GameCardProps {
  game: GameCardInfo;
  bestScore: string;
  className?: string;
}

export function GameCard({ game, bestScore, className = '' }: GameCardProps) {
  const { id, title, description, color } = game;
  
  return (
    <Link href={`/games/${id}`}>
      <div className={`
        ${color} text-white p-6 rounded-lg shadow-lg 
        hover:shadow-xl transform hover:-translate-y-1 
        transition-all duration-200 cursor-pointer
        ${className}
      `}>
        <h3 className="text-xl font-bold mb-3">{title}</h3>
        <p className="text-white/90 mb-4">{description}</p>
        <div className="bg-white/20 rounded-lg px-3 py-1 text-sm font-medium">
          ベスト: {bestScore}
        </div>
      </div>
    </Link>
  );
}