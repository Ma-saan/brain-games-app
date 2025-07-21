'use client';

import React, { ReactNode } from 'react';

interface GameLayoutProps {
  children: ReactNode;
  bgColor?: string;
  className?: string;
}

export function GameLayout({
  children,
  bgColor = 'bg-gradient-to-br from-blue-50 to-blue-100',
  className = ''
}: GameLayoutProps) {
  return (
    <div className={`min-h-screen ${bgColor} py-8 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {children}
        </div>
      </div>
    </div>
  );
}