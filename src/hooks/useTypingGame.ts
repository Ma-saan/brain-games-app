import { useState, useEffect, useCallback } from 'react';
import { GameState } from '@/types/game';
import { getRandomElement } from '@/utils/random';
import { useGameAudio } from '@/hooks/useAudioPlayer';

interface TypingGameState {
  gameState: GameState;
  score: number;
  timeLeft: number;
  currentWord: string;
  userInput: string;
  completedWords: number;
  totalChars: number;
  correctChars: number;
}

interface TypingGameActions {
  startGame: () => void;
  handleInputChange: (value: string) => void;
  resetGame: () => void;
}

interface TypingStats {
  wpm: number;
  accuracy: number;
}

const GAME_DURATION = 60; // 60秒
const POINTS_PER_CHAR = 10; // 文字あたりの点数

const WORD_LIST = [
  'apple', 'banana', 'orange', 'grape', 'lemon',
  'computer', 'keyboard', 'mouse', 'screen', 'window',
  'programming', 'javascript', 'react', 'next', 'typescript',
  'hello', 'world', 'game', 'typing', 'speed',
  'quick', 'brown', 'fox', 'jumps', 'over',
  'lazy', 'dog', 'pack', 'quiz', 'five',
  'amazing', 'wonderful', 'fantastic', 'brilliant', 'excellent'
];

export const useTypingGame = (saveScore?: (game: 'typing', score: number) => Promise<boolean>) => {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [currentWord, setCurrentWord] = useState('');
  const [userInput, setUserInput] = useState('');
  const [completedWords, setCompletedWords] = useState(0);
  const [totalChars, setTotalChars] = useState(0);
  const [correctChars, setCorrectChars] = useState(0);

  // 効果音機能を追加
  const { playCorrect, playIncorrect, playStart, playSuccess, playFail, playClick } = useGameAudio();

  // ランダムな単語を取得
  const getRandomWord = useCallback(() => {
    return getRandomElement(WORD_LIST);
  }, []);

  // ゲーム開始
  const startGame = useCallback(() => {
    playStart(); // 開始音を再生
    setGameState('playing');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setUserInput('');
    setCompletedWords(0);
    setTotalChars(0);
    setCorrectChars(0);
    setCurrentWord(getRandomWord());
  }, [getRandomWord, playStart]);

  // 入力処理
  const handleInputChange = useCallback((value: string) => {
    // 文字入力時のクリック音（少し控えめに）
    if (value.length > userInput.length) {
      playClick();
    }
    
    setUserInput(value);
    
    if (value === currentWord) {
      // 単語完成時の正解音
      playCorrect();
      
      const wordScore = currentWord.length * POINTS_PER_CHAR;
      setScore(prevScore => prevScore + wordScore);
      setCompletedWords(prevCompleted => prevCompleted + 1);
      setCorrectChars(prevCorrect => prevCorrect + currentWord.length);
      setTotalChars(prevTotal => prevTotal + currentWord.length);
      
      // 次の単語
      setUserInput('');
      setCurrentWord(getRandomWord());
    } else if (value.length === currentWord.length && value !== currentWord) {
      // 単語の長さに達したが間違っている場合
      playIncorrect();
    }
  }, [currentWord, getRandomWord, userInput.length, playCorrect, playIncorrect, playClick]);

  // ゲームリセット
  const resetGame = useCallback(() => {
    setGameState('waiting');
    setScore(0);
    setTimeLeft(GAME_DURATION);
    setUserInput('');
    setCurrentWord('');
    setCompletedWords(0);
    setTotalChars(0);
    setCorrectChars(0);
  }, []);

  // 統計計算
  const getStats = useCallback((): TypingStats => {
    const timeElapsed = (GAME_DURATION - timeLeft) / 60;
    const wpm = timeElapsed > 0 ? Math.round(completedWords / timeElapsed) : 0;
    const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    
    return { wpm, accuracy };
  }, [timeLeft, completedWords, totalChars, correctChars]);

  // 単語の文字色分け用のデータを生成
  const getCharacterData = useCallback(() => {
    return currentWord.split('').map((char, index) => {
      let status: 'pending' | 'correct' | 'incorrect' | 'current' = 'pending';
      
      if (index < userInput.length) {
        status = userInput[index] === char ? 'correct' : 'incorrect';
      } else if (index === userInput.length) {
        status = 'current';
      }
      
      return { char, status };
    });
  }, [currentWord, userInput]);

  // 時間管理
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing' && timeLeft > 0) {
      timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameState === 'playing') {
      // 最終的な統計を計算
      setTotalChars(prevTotal => prevTotal + userInput.length);
      let finalCorrectChars = correctChars;
      
      // 現在入力中の文字の正確性をチェック
      for (let i = 0; i < userInput.length && i < currentWord.length; i++) {
        if (userInput[i] === currentWord[i]) {
          finalCorrectChars++;
        }
      }
      setCorrectChars(finalCorrectChars);
      
      setGameState('finished');
      
      // ゲーム終了時の効果音（WPMとaccuracyに応じて）
      const stats = getStats();
      if (stats.wpm >= 40 && stats.accuracy >= 90) {
        playSuccess(); // 高パフォーマンス時は成功音
      } else {
        playFail(); // 低パフォーマンス時は失敗音
      }
      
      // スコア保存
      if (saveScore) {
        saveScore('typing', score).catch(console.error);
      }
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [gameState, timeLeft, userInput, currentWord, correctChars, score, saveScore, getStats, playSuccess, playFail]);

  const state: TypingGameState = {
    gameState,
    score,
    timeLeft,
    currentWord,
    userInput,
    completedWords,
    totalChars,
    correctChars
  };

  const actions: TypingGameActions = {
    startGame,
    handleInputChange,
    resetGame
  };

  return {
    ...state,
    ...actions,
    getStats,
    getCharacterData
  };
};
