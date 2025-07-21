'use client';

import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: string;
  backUrl?: string;
  backText?: string;
  textColor?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon = '',
  backUrl = '/',
  backText = 'メインメニューに戻る',
  textColor = 'text-blue-800'
}: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <Link href={backUrl} className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
        ← {backText}
      </Link>
      <h1 className={`text-3xl font-bold ${textColor} mb-2`}>
        {icon} {title}
      </h1>
      {subtitle && <p className={`${textColor.replace('800', '600')}`}>{subtitle}</p>}
    </div>
  );
}
