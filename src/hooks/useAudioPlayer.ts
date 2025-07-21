import { useCallback, useEffect, useState } from 'react';
import { audioManager, initializeAudio, SoundType, AudioConfig } from '@/utils/audio';

export interface UseAudioPlayer {
  // 効果音再生
  playSound: (soundType: SoundType) => Promise<void>;
  
  // 設定管理
  config: AudioConfig;
  setVolume: (volume: number) => void;
  setEnabled: (enabled: boolean) => void;
  
  // 初期化状態
  isInitialized: boolean;
}

export const useAudioPlayer = (): UseAudioPlayer => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [config, setConfig] = useState<AudioConfig>(audioManager.getConfig());

  // 効果音再生
  const playSound = useCallback(async (soundType: SoundType): Promise<void> => {
    try {
      if (!isInitialized) {
        await initializeAudio();
        setIsInitialized(true);
      }
      await audioManager.play(soundType);
    } catch (error) {
      console.warn(`Failed to play sound ${soundType}:`, error);
    }
  }, [isInitialized]);

  // 音量設定
  const setVolume = useCallback((volume: number): void => {
    audioManager.setVolume(volume);
    setConfig(audioManager.getConfig());
  }, []);

  // 有効/無効設定
  const setEnabled = useCallback((enabled: boolean): void => {
    audioManager.setEnabled(enabled);
    setConfig(audioManager.getConfig());
  }, []);

  // 初期化処理
  useEffect(() => {
    const initialize = async () => {
      try {
        await initializeAudio();
        setIsInitialized(true);
        setConfig(audioManager.getConfig());
      } catch (error) {
        console.warn('Failed to initialize audio:', error);
      }
    };

    // ユーザーの最初のインタラクション後に初期化
    const handleUserInteraction = () => {
      initialize();
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    if (!isInitialized) {
      document.addEventListener('click', handleUserInteraction, { once: true });
      document.addEventListener('keydown', handleUserInteraction, { once: true });
      document.addEventListener('touchstart', handleUserInteraction, { once: true });
    }

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, [isInitialized]);

  return {
    playSound,
    config,
    setVolume,
    setEnabled,
    isInitialized
  };
};

// ゲーム用の特化したフック
export const useGameAudio = () => {
  const { playSound, config, setVolume, setEnabled, isInitialized } = useAudioPlayer();

  // ゲーム特有の効果音再生
  const playCorrect = useCallback(() => playSound('correct'), [playSound]);
  const playIncorrect = useCallback(() => playSound('incorrect'), [playSound]);
  const playSuccess = useCallback(() => playSound('success'), [playSound]);
  const playFail = useCallback(() => playSound('fail'), [playSound]);
  const playClick = useCallback(() => playSound('click'), [playSound]);
  const playStart = useCallback(() => playSound('start'), [playSound]);

  return {
    // 基本機能
    playSound,
    config,
    setVolume,
    setEnabled,
    isInitialized,
    
    // ゲーム専用の効果音
    playCorrect,
    playIncorrect,
    playSuccess,
    playFail,
    playClick,
    playStart
  };
};
