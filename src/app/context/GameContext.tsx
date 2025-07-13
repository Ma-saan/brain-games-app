'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface GameScores {
  reaction: number | null;
  memory: number | null;
  color: number | null;
  math: number | null;
  pattern: number | null;
  typing: number | null;
}

interface UserScores {
  [username: string]: GameScores;
}

interface GameContextType {
  currentUser: string;
  setCurrentUser: (username: string) => void;
  userScores: UserScores;
  saveScore: (game: keyof GameScores, score: number) => void;
  getCurrentUserScores: () => GameScores;
  getBestScore: (game: keyof GameScores) => string;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState('ゲスト');
  const [userScores, setUserScores] = useState<UserScores>({});

  useEffect(() => {
    // ページ読み込み時にlocalStorageから復元
    const savedUser = localStorage.getItem('currentUser');
    const savedScores = localStorage.getItem('brainGameUserScores');
    
    if (savedUser) {
      setCurrentUserState(savedUser);
    }
    
    if (savedScores) {
      setUserScores(JSON.parse(savedScores));
    }
  }, []);

  const setCurrentUser = (username: string) => {
    const user = username.trim() || 'ゲスト';
    setCurrentUserState(user);
    localStorage.setItem('currentUser', user);
    
    // 新しいユーザーの場合、初期スコアを設定
    if (!userScores[user]) {
      const newUserScores = {
        ...userScores,
        [user]: {
          reaction: null,
          memory: null,
          color: null,
          math: null,
          pattern: null,
          typing: null
        }
      };
      setUserScores(newUserScores);
      localStorage.setItem('brainGameUserScores', JSON.stringify(newUserScores));
    }
  };

  const saveScore = (game: keyof GameScores, score: number) => {
    const currentScores = userScores[currentUser] || {
      reaction: null,
      memory: null,
      color: null,
      math: null,
      pattern: null,
      typing: null
    };

    // リアクションテストは小さい方が良いスコア、他は大きい方が良い
    const isBetter = game === 'reaction' 
      ? (!currentScores[game] || score < currentScores[game])
      : (!currentScores[game] || score > currentScores[game]);

    if (isBetter) {
      const newUserScores = {
        ...userScores,
        [currentUser]: {
          ...currentScores,
          [game]: score
        }
      };
      
      setUserScores(newUserScores);
      localStorage.setItem('brainGameUserScores', JSON.stringify(newUserScores));
      return true; // スコア更新された
    }
    
    return false; // スコア更新されなかった
  };

  const getCurrentUserScores = (): GameScores => {
    return userScores[currentUser] || {
      reaction: null,
      memory: null,
      color: null,
      math: null,
      pattern: null,
      typing: null
    };
  };

  const getBestScore = (game: keyof GameScores): string => {
    const score = getCurrentUserScores()[game];
    if (score === null) return '未プレイ';
    
    return game === 'reaction' ? `${score}ms` : `${score}点`;
  };

  return (
    <GameContext.Provider value={{
      currentUser,
      setCurrentUser,
      userScores,
      saveScore,
      getCurrentUserScores,
      getBestScore
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}