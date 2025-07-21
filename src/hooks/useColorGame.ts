'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGame } from '@/app/context/GameContext';
import { GameState } from '@/types/game';
import { getRandomInt } from '@/utils/random';
import { useGameAudio } from '@/hooks/useAudioPlayer';

export interface UseColorGameReturn {
  gameState: GameState;
  score: number;
  timeLeft: number;
  currentWord: string;
  currentColor: string;
  isCorrect: boolean;
  isProcessingAnswer: boolean;
  gameOverReason: 'time' | 'mistake' | null;
  startGame: () => void;
  handleAnswer: (userAnswer: boolean) => void;
  resetGame: () => void;
}

export function useColorGame(): UseColorGameReturn {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [currentWord, setCurrentWord] = useState('');
  const [currentColor, setCurrentColor] = useState('');
  const [isCorrect, setIsCorrect] = useState(false);
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<'time' | 'mistake' | null>(null);
  const { saveScore } = useGame();

  // 効果音機能を追加
  const { playCorrect, playIncorrect, playStart, playSuccess, playFail } = useGameAudio();

  const generateQuestion = useCallback(() => {
    const words = ['赤', '青', '緑', '黄', '紫', '黒'];
    const colors = ['text-red-500', 'text-blue-500', 'text-green-500', 'text-yellow-500', 'text-purple-500', 'text-black'];
    
    const wordIndex = getRandomInt(0, words.length - 1);
    const colorIndex = getRandomInt(0, colors.length - 1);
    
    setCurrentWord(words[wordIndex]);
    setCurrentColor(colors[colorIndex]);
    setIsCorrect(wordIndex === colorIndex);
  }, []);

  const startGame = useCallback(() => {
    console.log('🎮 色判別ゲーム開始');
    playStart(); // 開始音を再生
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setGameOverReason(null);
    generateQuestion();
  }, [generateQuestion, playStart]);

  const handleAnswer = useCallback((userAnswer: boolean) => {
    if (gameState !== 'playing' || isProcessingAnswer) return;
    console.log(`🖱️ 回答: ${userAnswer ? 'はい' : 'いいえ'}`);

    // 連打防止のため回答処理中フラグを立てる
    setIsProcessingAnswer(true);

    const isAnswerCorrect = userAnswer === isCorrect;
    
    if (isAnswerCorrect) {
      // 正解時の効果音
      playCorrect();
      
      setScore(prevScore => prevScore + 1);
      console.log('✅ 正解！スコア:', score + 1);
      // 正解の場合は次の問題へ
      generateQuestion();
      // 少し遅延して回答処理フラグを解除（連打防止）
      setTimeout(() => {
        setIsProcessingAnswer(false);
      }, 300);
    } else {
      // 不正解時の効果音
      playIncorrect();
      
      // 間違えたら終了
      console.log('❌ 不正解！ゲーム終了');
      setGameState('finished');
      setGameOverReason('mistake');
      
      // ゲーム終了時の効果音
      setTimeout(() => playFail(), 200);
      
      // スコア保存
      saveScore('color', score).catch(console.error);
    }
  }, [gameState, isCorrect, isProcessingAnswer, score, generateQuestion, saveScore, playCorrect, playIncorrect, playFail]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (gameState === 'playing' && timeLeft === 0) {
      setGameState('finished');
      setGameOverReason('time');
      
      // 時間切れ時の効果音（スコアに応じて）
      if (score >= 10) {
        playSuccess(); // 高スコア時は成功音
      } else {
        playFail(); // 低スコア時は失敗音
      }
      
      // スコア保存
      saveScore('color', score).catch(console.error);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft, saveScore, score, playSuccess, playFail]);

  const resetGame = useCallback(() => {
    console.log('🔄 ゲームリセット');
    setGameState('waiting');
    setScore(0);
    setTimeLeft(30);
    setCurrentWord('');
    setCurrentColor('');
    setGameOverReason(null);
  }, []);

  return {
    gameState,
    score,
    timeLeft,
    currentWord,
    currentColor,
    isCorrect,
    isProcessingAnswer,
    gameOverReason,
    startGame,
    handleAnswer,
    resetGame
  };
}
