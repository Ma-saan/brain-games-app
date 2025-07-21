import { useState, useEffect, useCallback } from 'react';
import { GameState } from '../types/game';

interface MathProblem {
  question: string;
  answer: number;
}

interface MathGameState {
  gameState: GameState;
  score: number;
  level: number;
  timeLeft: number;
  currentProblem: MathProblem;
  userAnswer: string;
}

interface MathGameActions {
  startGame: () => void;
  submitAnswer: (e: React.FormEvent) => void;
  setUserAnswer: (answer: string) => void;
  resetGame: () => void;
}

const GAME_DURATION = 60; // 60秒
const LEVEL_UP_MULTIPLIER = 50; // レベル × 50点でレベルアップ
const SCORE_PER_CORRECT = 10; // 正解時の基本点数

export const useMathGame = (saveScore?: (game: 'math', score: number) => Promise<boolean>) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentProblem, setCurrentProblem] = useState<MathProblem>({ question: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');

  // 問題生成関数
  const generateProblem = useCallback((gameLevel: number): MathProblem => {
    let a: number, b: number, operation: string, answer: number;
    
    if (gameLevel <= 3) {
      // 簡単な加減算
      a = Math.floor(Math.random() * 20) + 1;
      b = Math.floor(Math.random() * 20) + 1;
      operation = Math.random() < 0.5 ? '+' : '-';
      answer = operation === '+' ? a + b : a - b;
      if (answer < 0) {
        [a, b] = [b, a];
        answer = a - b;
      }
    } else if (gameLevel <= 6) {
      // 掛け算
      a = Math.floor(Math.random() * 12) + 1;
      b = Math.floor(Math.random() * 12) + 1;
      operation = '×';
      answer = a * b;
    } else {
      // 複雑な計算
      a = Math.floor(Math.random() * 50) + 10;
      b = Math.floor(Math.random() * 20) + 1;
      const ops = ['+', '-', '×'];
      operation = ops[Math.floor(Math.random() * ops.length)];
      
      switch (operation) {
        case '+':
          answer = a + b;
          break;
        case '-':
          answer = a - b;
          break;
        case '×':
          answer = a * b;
          break;
        default:
          answer = a + b;
      }
    }
    
    return {
      question: `${a} ${operation} ${b}`,
      answer
    };
  }, []);

  // ゲーム開始
  const startGame = useCallback(() => {
    setGameState('playing');
    setScore(0);
    setLevel(1);
    setTimeLeft(GAME_DURATION);
    setUserAnswer('');
    setCurrentProblem(generateProblem(1));
  }, [generateProblem]);

  // 回答処理
  const submitAnswer = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    if (gameState !== 'playing') return;
    
    const answer = parseInt(userAnswer);
    if (isNaN(answer)) return;
    
    if (answer === currentProblem.answer) {
      const newScore = score + level * SCORE_PER_CORRECT;
      setScore(newScore);
      
      // レベルアップ条件チェック
      if (newScore >= level * LEVEL_UP_MULTIPLIER) {
        setLevel(prevLevel => prevLevel + 1);
      }
    }
    
    setUserAnswer('');
    setCurrentProblem(generateProblem(level));
  }, [gameState, userAnswer, currentProblem.answer, score, level, generateProblem]);

  // ゲームリセット
  const resetGame = useCallback(() => {
    setGameState('waiting');
    setScore(0);
    setLevel(1);
    setTimeLeft(GAME_DURATION);
    setUserAnswer('');
    setCurrentProblem({ question: '', answer: 0 });
  }, []);

  // 時間管理
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      setGameState('finished');
      // スコア保存
      if (saveScore) {
        saveScore('math', score).catch(console.error);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft, saveScore, score]);

  const state: MathGameState = {
    gameState,
    score,
    level,
    timeLeft,
    currentProblem,
    userAnswer
  };

  const actions: MathGameActions = {
    startGame,
    submitAnswer,
    setUserAnswer,
    resetGame
  };

  return { ...state, ...actions };
};