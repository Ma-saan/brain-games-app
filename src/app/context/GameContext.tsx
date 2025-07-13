'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UserScore } from '@/lib/supabase';

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
  saveScore: (game: keyof GameScores, score: number) => Promise<boolean>;
  getCurrentUserScores: () => GameScores;
  getBestScore: (game: keyof GameScores) => string;
  loadAllScores: () => Promise<void>;
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

    // Supabaseからスコアを読み込み
    loadAllScores();
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

  const saveScore = async (game: keyof GameScores, score: number): Promise<boolean> => {
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

    if (!isBetter) {
      return false; // スコア更新されなかった
    }

    try {
      // Supabaseにスコアを保存（upsert: 存在すれば更新、なければ作成）
      const { error } = await supabase
        .from('user_scores')
        .upsert({
          user_name: currentUser,
          game_type: game,
          score: score
        }, {
          onConflict: 'user_name,game_type'
        });

      if (error) {
        console.error('Error saving score:', error);
        // Supabaseでエラーが発生した場合はLocalStorageにフォールバック
        const newUserScores = {
          ...userScores,
          [currentUser]: {
            ...currentScores,
            [game]: score
          }
        };
        setUserScores(newUserScores);
        localStorage.setItem('brainGameUserScores', JSON.stringify(newUserScores));
        return true;
      }

      // 成功した場合、ローカル状態も更新
      const newUserScores = {
        ...userScores,
        [currentUser]: {
          ...currentScores,
          [game]: score
        }
      };
      setUserScores(newUserScores);
      localStorage.setItem('brainGameUserScores', JSON.stringify(newUserScores));
      
      return true;
    } catch (error) {
      console.error('Error saving score:', error);
      // エラー時はLocalStorageにフォールバック
      const newUserScores = {
        ...userScores,
        [currentUser]: {
          ...currentScores,
          [game]: score
        }
      };
      setUserScores(newUserScores);
      localStorage.setItem('brainGameUserScores', JSON.stringify(newUserScores));
      return true;
    }
  };

  const loadAllScores = async () => {
    try {
      const { data: scores, error } = await supabase
        .from('user_scores')
        .select('*');

      if (error) {
        console.error('Error loading scores:', error);
        return;
      }

      // Supabaseのデータを内部形式に変換
      const formattedScores: UserScores = {};
      
      scores?.forEach((score: UserScore) => {
        if (!formattedScores[score.user_name]) {
          formattedScores[score.user_name] = {
            reaction: null,
            memory: null,
            color: null,
            math: null,
            pattern: null,
            typing: null
          };
        }
        formattedScores[score.user_name][score.game_type] = score.score;
      });

      // LocalStorageのデータとマージ
      const localScores = JSON.parse(localStorage.getItem('brainGameUserScores') || '{}');
      const mergedScores = { ...localScores, ...formattedScores };
      
      setUserScores(mergedScores);
      localStorage.setItem('brainGameUserScores', JSON.stringify(mergedScores));
    } catch (error) {
      console.error('Error loading scores from Supabase:', error);
    }
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
      getBestScore,
      loadAllScores
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