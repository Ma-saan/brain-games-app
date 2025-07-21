'use client';

import React from 'react';

interface GameInstructionsProps {
  title?: string;
  instructions: string[];
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  titleColor?: string;
  className?: string;
}

export function GameInstructions({
  title = '🎯 遊び方',
  instructions,
  bgColor = 'bg-blue-50',
  textColor = 'text-blue-700',
  borderColor = 'border-blue-200',
  titleColor,
  className = ''
}: GameInstructionsProps) {
  const titleColorClass = titleColor || textColor.replace('700', '800');
  
  return (
    <div className={`${bgColor} border ${borderColor} rounded-lg p-4 ${className}`}>
      <h3 className={`font-bold ${titleColorClass} mb-2`}>{title}</h3>
      <ul className={`${textColor} text-sm space-y-1`}>
        {instructions.map((instruction, index) => (
          <li key={index}>• {instruction}</li>
        ))}
      </ul>
    </div>
  );
}