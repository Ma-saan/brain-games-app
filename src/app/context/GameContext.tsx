'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase, AuthUserScore } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';

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
  isAuthenticated: boolean;
  authUserScores: GameScores;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUserState] = useState('ゲスト');
  const [userScores, setUserScores] = useState<UserScores>({});
  const [authUserScores, setAuthUserScores] = useState<GameScores>({
    reaction: null, memory: null, color: null,
    math: null, pattern: null, typing: null
  });
  const [isReady, setIsReady] = useState(false);
  const { user, profile, isAuthenticated, loading: authLoading } = useAuth();

  // 認証ユーザーのスコアを読み込み
  const loadAuthUserScores = useCallback(async () => {
    if (!user?.id) {
      setAuthUserScores({
        reaction: null, memory: null, color: null,
        math: null, pattern: null, typing: null
      });
      return;
    }

    try {
      const { data, error } = await supabase
        .from('auth_user_scores')
        .select('game_type, score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ 認証ユーザーのスコア読み込みエラー:', error);
        return;
      }

      // ゲームタイプ別にベストスコアを取得
      const scores: GameScores = {
        reaction: null, memory: null, color: null,
        math: null, pattern: null, typing: null
      };

      data?.forEach((record) => {
        const gameType = record.game_type as keyof GameScores;
        const currentBest = scores[gameType];
        const newScore = record.score;

        if (newScore !== null) {
          if (gameType === 'reaction') {
            // 反応速度は低い方が良い
            if (currentBest === null || newScore < currentBest) {
              scores[gameType] = newScore;
            }
          } else {
            // その他は高い方が良い
            if (currentBest === null || newScore > currentBest) {
              scores[gameType] = newScore;
            }
          }
        }
      });

      setAuthUserScores(scores);
      console.log('📊 認証ユーザーのスコア読み込み完了:', scores);
    } catch (error) {
      console.error('❌ 認証ユーザーのスコア読み込みエラー:', error);
    }
  }, [user?.id]);

  const loadAllScores = useCallback(async () => {
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
      console.log('📊 スコア読み込み完了:', formattedScores);
      
    } catch (error) {
      console.error('❌ スコア読み込みエラー:', error);
    }
  }, []);

  const initializeApp = useCallback(async () => {
    try {
      console.log('🚀 アプリ初期化中...');
      
      // 認証状態の確認を待つ
      if (authLoading) {
        console.log('⏳ 認証状態確認中...');
        return;
      }
      
      // LocalStorageから設定を復元（クライアントサイドのみ）
      if (typeof window !== 'undefined' && !isAuthenticated) {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          console.log('📱 LocalStorageからユーザー復元:', savedUser);
          setCurrentUserState(savedUser);
        }
      }
      
      // スコアを読み込み
      await loadAllScores();
      
      // 認証ユーザーのスコアも読み込み
      if (isAuthenticated) {
        await loadAuthUserScores();
      }
      
      setIsReady(true);
      console.log('✅ アプリ初期化完了');
    } catch (error) {
      console.error('❌ 初期化失敗:', error);
      setIsReady(true); // エラーでも画面は表示
    }
  }, [loadAllScores, loadAuthUserScores, isAuthenticated, authLoading]);

  useEffect(() => {
    initializeApp();
  }, [initializeApp]);

  // 認証状態の変更を監視してスコアを再読み込み
  useEffect(() => {
    if (!authLoading && isReady) {
      if (isAuthenticated) {
        loadAuthUserScores();
      }
    }
  }, [isAuthenticated, authLoading, isReady, loadAuthUserScores]);

  const registerUserInDatabase = async (username: string) => {
    console.log('🗃️ Supabaseにユーザー登録開始:', username);
    
    try {
      // 既存ユーザーかチェック
      const { data: existingUser, error: checkError } = await supabase
        .from('user_scores')
        .select('user_name')
        .eq('user_name', username)
        .limit(1);

      if (checkError) {
        console.error('❌ ユーザー存在確認エラー:', checkError);
        return false;
      }

      if (existingUser && existingUser.length > 0) {
        console.log('👤 既存ユーザーです:', username);
        return true;
      }

      // 新規ユーザーの場合、全ゲーム分の初期レコードを作成
      const gameTypes: Array<keyof GameScores> = ['reaction', 'memory', 'color', 'math', 'pattern', 'typing'];
      console.log('🆕 新規ユーザー登録:', username);
      
      const initialRecords = gameTypes.map(gameType => ({
        user_name: username,
        game_type: gameType,
        score: null // 初期状態はnull
      }));

      console.log('📝 作成するレコード:', initialRecords);

      const { data, error } = await supabase
        .from('user_scores')
        .insert(initialRecords);

      if (error) {
        console.error('❌ ユーザー登録エラー:', error);
        return false;
      }

      console.log('✅ ユーザー登録成功!', data);
      console.log(`🎉 ${username} が Supabase に登録されました！`);
      
      // スコアを再読み込み
      await loadAllScores();
      
      return true;
      
    } catch (error) {
      console.error('❌ ユーザー登録処理エラー:', error);
      return false;
    }
  };

  const setCurrentUser = async (username: string) => {
    const user = username.trim() || 'ゲスト';
    console.log('👤 ユーザー設定開始:', user);
    
    setCurrentUserState(user);
    console.log('✅ ユーザー状態更新:', user);
    
    // LocalStorageに保存（クライアントサイドのみ）
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentUser', user);
      console.log('💾 LocalStorageに保存:', user);
    }
    
    // ゲストユーザー以外はSupabaseに登録
    if (user !== 'ゲスト') {
      const registered = await registerUserInDatabase(user);
      if (registered) {
        console.log('🎯 ユーザー登録処理完了:', user);
      } else {
        console.error('⚠️ ユーザー登録に失敗しました:', user);
      }
    }
    
    // ローカル状態の初期スコア設定
    console.log('📊 現在のuserScores:', userScores);
    if (!userScores[user]) {
      console.log('🆕 ローカル初期スコア作成:', user);
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
      console.log('✅ 新しいuserScores:', newUserScores);
    } else {
      console.log('👤 既存ユーザー:', user, userScores[user]);
    }
  };

  const saveScore = async (game: keyof GameScores, score: number): Promise<boolean> => {
    console.log(`💾 スコア保存開始: ${isAuthenticated ? 'Auth User' : currentUser} - ${game} = ${score}`);
    
    if (isAuthenticated && user?.id) {
      return await saveAuthUserScore(game, score);
    } else {
      return await saveGuestUserScore(game, score);
    }
  };

  const saveAuthUserScore = async (game: keyof GameScores, score: number): Promise<boolean> => {
    if (!user?.id) return false;

    try {
      // 認証ユーザーのスコアはauth_user_scoresテーブルに保存
      const { error } = await supabase
        .from('auth_user_scores')
        .insert({
          user_id: user.id,
          game_type: game,
          score: score
        });

      if (error) {
        console.error('❌ 認証ユーザーのスコア保存エラー:', error);
        return false;
      }

      console.log('✅ 認証ユーザーのスコア保存成功!', {
        userId: user.id,
        game: game,
        score: score
      });
      
      // ローカル状態も更新
      await loadAuthUserScores();
      return true;
      
    } catch (error) {
      console.error('❌ 認証ユーザーのスコア保存処理エラー:', error);
      return false;
    }
  };

  const saveGuestUserScore = async (game: keyof GameScores, score: number): Promise<boolean> => {
    try {
      console.log(`🔍 現在のベストスコア確認中: ${game}`);
      
      // 現在のベストスコアを確認
      const { data: scoreData, error: fetchError } = await supabase
        .from('user_scores')
        .select('score')
        .eq('user_name', currentUser)
        .eq('game_type', game)
        .limit(1);

      if (fetchError) {
        console.error('❌ スコア取得エラー:', fetchError);
        return false;
      }

      const currentScore = scoreData && scoreData.length > 0 ? scoreData[0] : null;
      console.log('📊 既存スコア:', currentScore);

      // より良いスコアかチェック
      const isBetter = game === 'reaction' 
        ? (!currentScore?.score || score < currentScore.score)
        : (!currentScore?.score || score > currentScore.score);

      console.log('🏆 より良いスコア？:', isBetter, {
        gameType: game,
        newScore: score,
        currentBest: currentScore?.score,
        isReactionGame: game === 'reaction'
      });

      if (!isBetter) {
        console.log('📊 既存のベストスコアには及ばず');
        return false;
      }

      // ベストスコア更新
      console.log('💾 Supabaseにスコア更新中...');
      const { error: updateError } = await supabase
        .from('user_scores')
        .update({
          score: score,
          updated_at: new Date().toISOString()
        })
        .eq('user_name', currentUser)
        .eq('game_type', game);

      if (updateError) {
        console.error('❌ スコア保存エラー:', updateError);
        return false;
      }

      console.log('✅ ベストスコア更新成功!', {
        user: currentUser,
        game: game,
        newScore: score,
        previousScore: currentScore?.score
      });
      
      // ローカル状態も更新
      await loadAllScores();
      return true;
      
    } catch (error) {
      console.error('❌ スコア保存処理エラー:', error);
      return false;
    }
  };

  const getCurrentUserScores = (): GameScores => {
    if (isAuthenticated) {
      console.log('📊 認証ユーザーのスコア取得:', authUserScores);
      return authUserScores;
    } else {
      const scores = userScores[currentUser] || {
        reaction: null,
        memory: null,
        color: null,
        math: null,
        pattern: null,
        typing: null
      };
      console.log('📊 ゲストユーザーのスコア取得:', currentUser, scores);
      return scores;
    }
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
      isReady,
      isAuthenticated,
      authUserScores
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