'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGame } from '@/app/context/GameContext';
import { GameState } from '@/types/game';
import { getRandomDelay } from '@/utils/random';

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

  const startGame = useCallback(() => {
    console.log('🎮 リアクションゲーム開始');
    setGameState('ready');
    setReactionTime(null);
    setGameOverReason(null);
    
    const delay = getRandomDelay(1000, 5000); // 1-5秒のランダム待機
    console.log(`⏰ ${delay}ms後に緑になります`);
    const id = setTimeout(() => {
      console.log('🟢 緑になりました！');
      setGameState('go');
      setStartTime(Date.now());
    }, delay);
    
    setTimeoutId(id);
  }, []);

  const handleClick = useCallback(async () => {
    console.log('🖱️ クリックされました - 現在の状態:', gameState);
    
    if (gameState === 'waiting') {
      // 待機状態でクリックされたらゲーム開始
      startGame();
    } else if (gameState === 'ready') {
      console.log('❌ フライング！');
      setGameState('too-early');
      setGameOverReason('mistake');
      if (timeoutId) {
        clearTimeout(timeoutId);
        setTimeoutId(null);
      }
    } else if (gameState === 'go') {
      const reaction = Date.now() - startTime;
      console.log('⚡ リアクション時間:', reaction + 'ms');
      
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
  }, [gameState, startTime, timeoutId, saveScore, startGame]);

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
