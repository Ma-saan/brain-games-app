import { useState, useCallback } from 'react';
import { GameState } from '../types/game';
import { shuffleArray } from '../utils/random';

interface Pattern {
  sequence: number[];
  options: number[];
  correct: number;
}

interface PatternGameState {
  gameState: GameState;
  score: number;
  currentQuestion: number;
  totalQuestions: number;
  currentPattern: Pattern | null;
}

interface PatternGameActions {
  startGame: () => void;
  handleAnswer: (answer: number) => void;
  resetGame: () => void;
}

const TOTAL_QUESTIONS = 10;
const POINTS_PER_CORRECT = 10;

export const usePatternGame = (saveScore?: (game: 'pattern', score: number) => Promise<boolean>) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [score, setScore] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [patterns, setPatterns] = useState<Pattern[]>([]);

  // パターン生成関数群
  const generateArithmeticSequence = useCallback(() => {
    const start = Math.floor(Math.random() * 10) + 1;
    const diff = Math.floor(Math.random() * 5) + 1;
    const sequence = [start, start + diff, start + 2 * diff, start + 3 * diff];
    const correct = start + 4 * diff;
    return { sequence, correct };
  }, []);

  const generateGeometricSequence = useCallback(() => {
    const start = Math.floor(Math.random() * 5) + 1;
    const ratio = Math.floor(Math.random() * 3) + 2;
    const sequence = [start, start * ratio, start * ratio * ratio, start * ratio * ratio * ratio];
    const correct = start * Math.pow(ratio, 4);
    return { sequence, correct };
  }, []);

  const generateFibonacciSequence = useCallback(() => {
    const seq = [1, 1];
    for (let j = 2; j < 4; j++) {
      seq.push(seq[j-1] + seq[j-2]);
    }
    const correct = seq[2] + seq[3];
    return { sequence: seq, correct };
  }, []);

  const generateSquareSequence = useCallback(() => {
    const sequence = [1, 4, 9, 16];
    const correct = 25;
    return { sequence, correct };
  }, []);

  const generateAlternatingSequence = useCallback(() => {
    const base = Math.floor(Math.random() * 10) + 1;
    const sequence = [base, base + 2, base + 1, base + 3];
    const correct = base + 2;
    return { sequence, correct };
  }, []);

  // 選択肢生成
  const generateOptions = useCallback((correct: number): number[] => {
    const options = [correct];
    while (options.length < 4) {
      const option = correct + Math.floor(Math.random() * 21) - 10;
      if (option > 0 && !options.includes(option)) {
        options.push(option);
      }
    }
    return shuffleArray(options);
  }, []);

  // 全パターンを生成
  const generateAllPatterns = useCallback((): Pattern[] => {
    const newPatterns: Pattern[] = [];
    
    for (let i = 0; i < TOTAL_QUESTIONS; i++) {
      let sequenceData: { sequence: number[]; correct: number };
      
      if (i < 3) {
        // 簡単な等差数列
        sequenceData = generateArithmeticSequence();
      } else if (i < 6) {
        // 等比数列
        sequenceData = generateGeometricSequence();
      } else {
        // より複雑なパターン
        const complexPatterns = [
          generateFibonacciSequence,
          generateSquareSequence,
          generateAlternatingSequence
        ];
        
        const patternFunc = complexPatterns[Math.floor(Math.random() * complexPatterns.length)];
        sequenceData = patternFunc();
      }
      
      const options = generateOptions(sequenceData.correct);
      
      newPatterns.push({
        sequence: sequenceData.sequence,
        options,
        correct: sequenceData.correct
      });
    }
    
    return newPatterns;
  }, [generateArithmeticSequence, generateGeometricSequence, generateFibonacciSequence, generateSquareSequence, generateAlternatingSequence, generateOptions]);

  // ゲーム開始
  const startGame = useCallback(() => {
    const newPatterns = generateAllPatterns();
    setGameState('playing');
    setScore(0);
    setCurrentQuestion(0);
    setPatterns(newPatterns);
  }, [generateAllPatterns]);

  // 回答処理
  const handleAnswer = useCallback((answer: number) => {
    if (gameState !== 'playing' || !patterns[currentQuestion]) return;
    
    const isCorrect = answer === patterns[currentQuestion].correct;
    if (isCorrect) {
      setScore(prevScore => prevScore + POINTS_PER_CORRECT);
    }
    
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion(prevQuestion => prevQuestion + 1);
    } else {
      setGameState('finished');
      // スコア保存
      if (saveScore) {
        const finalScore = score + (isCorrect ? POINTS_PER_CORRECT : 0);
        saveScore('pattern', finalScore).catch(console.error);
      }
    }
  }, [gameState, patterns, currentQuestion, score, saveScore]);

  // ゲームリセット
  const resetGame = useCallback(() => {
    setGameState('waiting');
    setScore(0);
    setCurrentQuestion(0);
    setPatterns([]);
  }, []);

  const state: PatternGameState = {
    gameState,
    score,
    currentQuestion,
    totalQuestions: TOTAL_QUESTIONS,
    currentPattern: patterns[currentQuestion] || null
  };

  const actions: PatternGameActions = {
    startGame,
    handleAnswer,
    resetGame
  };

  return { ...state, ...actions };
};