'use client';

import React, { ReactNode } from 'react';
import PageHeader from './PageHeader';

interface GameLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  icon?: string;
  bgColor?: string;
  textColor?: string;
  backUrl?: string;
  backText?: string;
  className?: string;
}

export default function GameLayout({
  children,
  title,
  subtitle,
  icon,
  bgColor = 'bg-gradient-to-br from-blue-50 to-blue-100',
  textColor = 'text-blue-800',
  backUrl = '/',
  backText = 'メインメニューに戻る',
  className = ''
}: GameLayoutProps) {
  return (
    <div className={`min-h-screen ${bgColor} py-8 px-4 ${className}`}>
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title={title}
          subtitle={subtitle}
          icon={icon}
          backUrl={backUrl}
          backText={backText}
          textColor={textColor}
        />
        
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          {children}
        </div>
      </div>
    </div>
  );
}
