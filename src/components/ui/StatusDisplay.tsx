'use client';

import React from 'react';

interface StatusDisplayProps {
  items: {
    label: string;
    value: string | number;
    color?: string;
  }[];
  className?: string;
}

export default function StatusDisplay({ items, className = '' }: StatusDisplayProps) {
  return (
    <div className={`flex justify-center gap-4 md:gap-8 mb-4 flex-wrap ${className}`}>
      {items.map((item, index) => (
        <div key={index} className="text-lg">
          <span className={`font-bold ${item.color || 'text-blue-600'}`}>
            {item.label}:
          </span>{' '}
          {item.value}
        </div>
      ))}
    </div>
  );
}
