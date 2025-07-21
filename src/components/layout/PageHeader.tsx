'use client';

import React from 'react';
import Link from 'next/link';

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: string;
  backText?: string;
  textColor?: string;
}

export function PageHeader({
  title,
  description,
  backLink = '/',
  backText = '← メインメニューに戻る',
  textColor = 'text-blue-800'
}: PageHeaderProps) {
  return (
    <div className="text-center mb-8">
      <Link href={backLink} className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
        {backText}
      </Link>
      <h1 className={`text-3xl font-bold ${textColor} mb-2`}>
        {title}
      </h1>
      {description && <p className={`${textColor.replace('800', '600')}`}>{description}</p>}
    </div>
  );
}