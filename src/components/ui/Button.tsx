'use client';

import React from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'outline';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  fullWidth?: boolean;
  size?: 'small' | 'medium' | 'large' | 'sm';
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled = false,
  fullWidth = false,
  size = 'medium',
  className = '',
  type = 'button',
}: ButtonProps) {
  // 基本スタイル
  const baseStyle = 'rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-opacity-50';
  
  // サイズスタイル
  const sizeStyles = {
    small: 'px-3 py-1.5 text-sm',
    sm: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-6 py-3 text-lg',
  } as const;
  
  // カラーバリエーション
  const variantStyles = {
    primary: 'bg-blue-500 hover:bg-blue-600 text-white focus:ring-blue-300',
    secondary: 'bg-gray-500 hover:bg-gray-600 text-white focus:ring-gray-300',
    success: 'bg-green-500 hover:bg-green-600 text-white focus:ring-green-300',
    danger: 'bg-red-500 hover:bg-red-600 text-white focus:ring-red-300',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white focus:ring-yellow-300',
    info: 'bg-purple-500 hover:bg-purple-600 text-white focus:ring-purple-300',
    outline: 'bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-300',
  };
  
  // 無効化スタイル
  const disabledStyle = 'opacity-50 cursor-not-allowed';
  
  // 幅スタイル
  const widthStyle = fullWidth ? 'w-full' : '';
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${baseStyle}
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        ${disabled ? disabledStyle : ''}
        ${widthStyle}
        ${className}
      `}
    >
      {children}
    </button>
  );
}