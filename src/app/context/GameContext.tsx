'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, UserScore } from '@/lib/supabase';
import { getOrCreateAnonymousUser, getCurrentUserId } from '@/lib/auth';

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
  isReady: boolean;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState('ゲスト');
  const [userScores, setUserScores] = useState<UserScores>({});
  const [isReady, setIsReady] = useState(false);
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      console.log('🔐 匿名認証を初期化中...');
      
      // 匿名認証の初期化
      const authUser = await getOrCreateAnonymousUser();
      setAuthUserId(authUser.id);
      
      console.log('✅ 匿名認証成功:', authUser.id);
      
      // LocalStorageから設定を復元
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUserState(savedUser);
      }
      
      // スコアを読み込み
      await loadAllScores();
      
      setIsReady(true);
      console.log('🎮 ゲーム準備完了');
    } catch (error) {
      console.error('❌ 認証初期化失敗:', error);
      setIsReady(true); // エラーでも画面は表示
    }
  };

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
    }
  };

  const saveScore = async (game: keyof GameScores, score: number): Promise<boolean> => {
    if (!authUserId) {
      console.error('❌ ユーザーが認証されていません');
      return false;
    }

    try {
      console.log(`💾 スコア保存中: ${game} = ${score}`);
      
      // 現在のベストスコアを確認
      const { data: currentScore } = await supabase
        .from('user_scores')
        .select('score')
        .eq('user_id', authUserId)
        .eq('game_type', game)
        .single();

      // より良いスコアかチェック
      const isBetter = game === 'reaction' 
        ? (!currentScore || score < currentScore.score)
        : (!currentScore || score > currentScore.score);

      if (!isBetter) {
        console.log('📊 既存のベストスコアには及ばず');
        return false; // スコア更新されなかった
      }

      // ベストスコア更新
      const { error } = await supabase
        .from('user_scores')
        .upsert({
          user_id: authUserId,
          user_name: currentUser,
          game_type: game,
          score: score
        });

      if (error) {
        console.error('❌ スコア保存エラー:', error);
        return false;
      }

      console.log('✅ ベストスコア更新成功!');
      
      // ローカル状態も更新
      await loadAllScores();
      return true;
      
    } catch (error) {
      console.error('❌ スコア保存エラー:', error);
      return false;
    }
  };

  const loadAllScores = async () => {
    try {
      const { data, error } = await supabase
        .from('user_scores')
        .select('user_name, game_type, score')
        .order('user_name');

      if (error) {
        console.error('❌ スコア読み込みエラー:', error);
        return;
      }

      // データ整形
      const formattedScores: UserScores = {};
      data?.forEach((score) => {
        if (!formattedScores[score.user_name]) {
          formattedScores[score.user_name] = {
            reaction: null, memory: null, color: null,
            math: null, pattern: null, typing: null
          };
        }
        formattedScores[score.user_name][score.game_type as keyof GameScores] = score.score;
      });

      setUserScores(formattedScores);
      
    } catch (error) {
      console.error('❌ スコア読み込みエラー:', error);
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
      loadAllScores,
      isReady
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