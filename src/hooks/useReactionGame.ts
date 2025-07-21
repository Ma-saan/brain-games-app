'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGame } from '@/app/context/GameContext';
import { GameState } from '@/types/game';
import { getRandomDelay } from '@/utils/random';
import { useGameAudio } from '@/hooks/useAudioPlayer';

export interface UseReactionGameReturn {
  gameState: GameState;
  reactionTime: number | null;
  startGame: () => void;
  handleClick: () => Promise<void>;
  resetGame: () => void;
  gameOverReason: 'time' | 'mistake' | null;
}

export function useReactionGame(): UseReactionGameReturn {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number>(0);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);
  const [gameOverReason, setGameOverReason] = useState<'time' | 'mistake' | null>(null);
  const { saveScore } = useGame();

  // 効果音機能を追加
  const { playCorrect, playIncorrect, playStart, playSuccess, playFail, playClick } = useGameAudio();

  const startGame = useCallback(() => {
    console.log('🎮 リアクションゲーム開始');
    playStart(); // 開始音を再生
    setGameState('ready');
    setReactionTime(null);
    setGameOverReason(null);
    
    const delay = getRandomDelay(1000, 5000); // 1-5秒のランダム待機
    console.log(`⏰ ${delay}ms後に緑になります`);
    const id = setTimeout(() => {
      console.log('🟢 緑になりました！');
      playClick(); // 開始信号音
      setGameState('go');
      setStartTime(Date.now());
    }, delay);
    
    setTimeoutId(id);
  }, [playStart, playClick]);

  const handleClick = useCallback(async () => {
    console.log('🖱️ クリックされました - 現在の状態:', gameState);
    
    if (gameState === 'waiting') {
      // 待機状態でクリックされたらゲーム開始
      startGame();
    } else if (gameState === 'ready') {
      console.log('❌ フライング！');
      playIncorrect(); // フライング時の効果音
      setGameState('too-early');
      setGameOverReason('mistake');
      
      // 失敗音を少し遅れて再生
      setTimeout(() => playFail(), 200);
      
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    } else if (gameState === 'go') {
      const reaction = Date.now() - startTime;
      console.log('⚡ リアクション時間:', reaction + 'ms');
      
      // 反応時間に応じて効果音を選択
      if (reaction < 200) {
        playSuccess(); // 超高速反応（200ms未満）
      } else if (reaction < 400) {
        playCorrect(); // 良い反応（200-400ms）
      } else {
        playClick(); // 普通の反応（400ms以上）
      }
      
      setReactionTime(reaction);
      setGameState('clicked');
      
      // スコア保存
      console.log('💾 スコア保存開始...');
      try {
        const saved = await saveScore('reaction', reaction);
        console.log('✅ スコア保存結果:', saved);
      } catch (error) {
        console.error('❌ スコア保存エラー:', error);
      }
    }
  }, [gameState, startTime, timeoutId, saveScore, startGame, playIncorrect, playFail, playSuccess, playCorrect, playClick]);

  const resetGame = useCallback(() => {
    console.log('🔄 ゲームリセット');
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setGameState('waiting');
    setReactionTime(null);
    setGameOverReason(null);
  }, [timeoutId]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    gameState,
    reactionTime,
    startGame,
    handleClick,
    resetGame,
    gameOverReason
  };
}
