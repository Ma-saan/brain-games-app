'use client';

import { useState, useEffect } from 'react';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';

interface AudioSettingsProps {
  className?: string;
}

export const AudioSettings: React.FC<AudioSettingsProps> = ({ className = '' }) => {
  const { config, setVolume, setEnabled, playSound } = useAudioPlayer();
  const [localVolume, setLocalVolume] = useState(config.volume);

  useEffect(() => {
    setLocalVolume(config.volume);
  }, [config.volume]);

  const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(event.target.value);
    setLocalVolume(newVolume);
    setVolume(newVolume);
  };

  const handleEnabledToggle = () => {
    setEnabled(!config.enabled);
  };

  const testSound = (soundType: 'correct' | 'incorrect' | 'success' | 'fail' | 'click' | 'start') => {
    playSound(soundType);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>
      <h3 className="text-lg font-semibold mb-4 text-gray-800">音量設定</h3>
      
      {/* 効果音有効/無効 */}
      <div className="mb-6">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={config.enabled}
            onChange={handleEnabledToggle}
            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
          <span className="ml-2 text-sm font-medium text-gray-700">
            効果音を有効にする
          </span>
        </label>
      </div>

      {/* 音量スライダー */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          音量レベル: {Math.round(localVolume * 100)}%
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={localVolume}
          onChange={handleVolumeChange}
          disabled={!config.enabled}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: config.enabled 
              ? `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${localVolume * 100}%, #e5e7eb ${localVolume * 100}%, #e5e7eb 100%)`
              : '#e5e7eb'
          }}
        />
      </div>

      {/* テスト音 */}
      {config.enabled && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">効果音のテスト</h4>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => testSound('correct')}
              className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              正解音
            </button>
            <button
              onClick={() => testSound('incorrect')}
              className="px-3 py-2 text-xs bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
            >
              不正解音
            </button>
            <button
              onClick={() => testSound('success')}
              className="px-3 py-2 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              成功音
            </button>
            <button
              onClick={() => testSound('fail')}
              className="px-3 py-2 text-xs bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              失敗音
            </button>
            <button
              onClick={() => testSound('start')}
              className="px-3 py-2 text-xs bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
            >
              開始音
            </button>
            <button
              onClick={() => testSound('click')}
              className="px-3 py-2 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 transition-colors"
            >
              クリック音
            </button>
          </div>
        </div>
      )}

      {!config.enabled && (
        <p className="text-sm text-gray-500 italic">
          効果音を有効にすると、テスト音も利用できます。
        </p>
      )}
    </div>
  );
};
