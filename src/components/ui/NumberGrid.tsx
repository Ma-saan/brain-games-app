'use client';

import React from 'react';

interface NumberGridProps {
  count?: number;
  highlightedNumber: number | null;
  temporaryHighlight: number | null;
  onButtonClick: (number: number) => void;
  disabled?: boolean;
  className?: string;
}

export default function NumberGrid({
  count = 9,
  highlightedNumber,
  temporaryHighlight,
  onButtonClick,
  disabled = false,
  className = ''
}: NumberGridProps) {
  const numbers = Array.from({ length: count }, (_, i) => i + 1);
  
  return (
    <div className={`grid grid-cols-3 gap-3 max-w-xs mx-auto ${className}`}>
      {numbers.map((number) => (
        <button
          key={number}
          className={`
            w-20 h-20 bg-blue-500 text-white text-xl font-bold rounded-lg 
            transition-all duration-200 shadow-lg
            ${highlightedNumber === number ? 'bg-yellow-400 scale-110 shadow-xl' : ''}
            ${temporaryHighlight === number ? 'bg-green-500 scale-110 shadow-xl' : ''}
            ${!disabled ? 'hover:bg-blue-600 cursor-pointer' : 'cursor-not-allowed'}
          `}
          onClick={() => onButtonClick(number)}
          disabled={disabled}
        >
          {number}
        </button>
      ))}
    </div>
  );
}
