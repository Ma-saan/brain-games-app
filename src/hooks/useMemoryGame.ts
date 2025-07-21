'use client';

import { useState, useCallback, useEffect } from 'react';
import { useGame } from '@/app/context/GameContext';
import { GameState } from '@/types/game';
import { generateRandomArray } from '@/utils/random';
import { useGameAudio } from '@/hooks/useAudioPlayer';

export interface UseMemoryGameReturn {
  gameState: GameState;
  sequence: number[];
  userSequence: number[];
  score: number;
  level: number;
  highlightedButton: number | null;
  temporaryHighlight: number | null;
  statusMessage: string;
  startGame: () => void;
  handleButtonClick: (buttonNumber: number) => void;
  resetGame: () => void;
}

export function useMemoryGame(): UseMemoryGameReturn {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [sequence, setSequence] = useState<number[]>([]);
  const [userSequence, setUserSequence] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highlightedButton, setHighlightedButton] = useState<number | null>(null);
  const [temporaryHighlight, setTemporaryHighlight] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [isProcessingAnswer, setIsProcessingAnswer] = useState(false);
  const { saveScore } = useGame();

  // 効果音機能を追加
  const { playCorrect, playIncorrect, playStart, playSuccess, playFail, playClick } = useGameAudio();

  const generateSequence = useCallback((length: number) => {
    // 1-9の数字をランダムに生成
    return generateRandomArray(length, 1, 9);
  }, []);

  const showSequence = useCallback(async (seq: number[]) => {
    setGameState('showing');
    setStatusMessage('順番を覚えてください...');
    setHighlightedButton(null);
    setUserSequence([]);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    for (let i = 0; i < seq.length; i++) {
      setHighlightedButton(seq[i]);
      playClick(); // 各ボタンの表示時にクリック音
      await new Promise(resolve => setTimeout(resolve, 600));
      setHighlightedButton(null);
      await new Promise(resolve => setTimeout(resolve, 400));
    }
    
    setGameState('playing');
    setStatusMessage('今度はあなたの番です！同じ順番でクリックしてください');
  }, [playClick]);

  const startGame = useCallback(() => {
    console.log('🎮 記憶ゲーム開始');
    playStart(); // 開始音を再生
    const newSequence = generateSequence(3); // レベル1は3つの数字から
    setSequence(newSequence);
    setUserSequence([]);
    setScore(0);
    setLevel(1);
    showSequence(newSequence);
  }, [generateSequence, showSequence, playStart]);

  const nextLevel = useCallback(() => {
    console.log(`🎮 記憶ゲーム レベル ${level + 1} へ進む`);
    playSuccess(); // レベルアップ時の成功音
    const newSequence = generateSequence(level + 2); // レベル1で3個、レベル2で4個...
    setSequence(newSequence);
    setUserSequence([]);
    showSequence(newSequence);
  }, [level, generateSequence, showSequence, playSuccess]);

  const handleButtonClick = useCallback((buttonNumber: number) => {
    if (gameState !== 'playing' || isProcessingAnswer) return;
    console.log(`🖱️ ボタン ${buttonNumber} がクリックされました`);
    
    // 連打防止
    setIsProcessingAnswer(true);
    
    // 一時的にボタンをハイライト
    setTemporaryHighlight(buttonNumber);
    setTimeout(() => {
      setTemporaryHighlight(null);
    }, 300);

    const newUserSequence = [...userSequence, buttonNumber];
    setUserSequence(newUserSequence);

    // 一定時間後に処理を許可
    setTimeout(() => {
      setIsProcessingAnswer(false);
    }, 300);

    if (buttonNumber !== sequence[newUserSequence.length - 1]) {
      // 間違い時の効果音
      playIncorrect();
      
      console.log('❌ 間違いです！');
      setGameState('finished');
      setStatusMessage(`間違いです！正解は: ${sequence.join(', ')}`);
      
      // ゲーム終了時の失敗音
      setTimeout(() => playFail(), 300);
      
      // スコア保存
      saveScore('memory', score).catch(console.error);
      return;
    }

    // 正解時の効果音
    playCorrect();

    if (newUserSequence.length === sequence.length) {
      // レベルクリア
      const newScore = score + sequence.length * 10;
      console.log(`✅ レベル ${level} クリア！スコア: ${newScore}`);
      setScore(newScore);
      setLevel(level + 1);
      setStatusMessage(`レベル ${level} クリア！`);
      
      setTimeout(() => {
        nextLevel();
      }, 1500);
    }
  }, [gameState, userSequence, sequence, score, level, nextLevel, saveScore, isProcessingAnswer, playCorrect, playIncorrect, playFail]);

  const resetGame = useCallback(() => {
    console.log('🔄 ゲームリセット');
    setGameState('waiting');
    setSequence([]);
    setUserSequence([]);
    setScore(0);
    setLevel(1);
    setHighlightedButton(null);
    setTemporaryHighlight(null);
    setStatusMessage('');
  }, []);

  useEffect(() => {
    // キーボード入力対応
    const handleKeyPress = (event: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      
      const key = event.key;
      if (key >= '1' && key <= '9') {
        handleButtonClick(parseInt(key));
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [gameState, handleButtonClick]);

  return {
    gameState,
    sequence,
    userSequence,
    score,
    level,
    highlightedButton,
    temporaryHighlight,
    statusMessage,
    startGame,
    handleButtonClick,
    resetGame
  };
}
