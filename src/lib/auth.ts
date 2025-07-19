import { supabase } from './supabase';

export interface AuthUser {
  id: string;
  isAnonymous: boolean;
}

export const getOrCreateAnonymousUser = async (): Promise<AuthUser> => {
  try {
    // 既存のセッションをチェック
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
    }
    
    if (session?.user) {
      return {
        id: session.user.id,
        isAnonymous: session.user.is_anonymous || false
      };
    }
    
    // 匿名ユーザーとしてサインイン
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.error('Anonymous auth error:', authError);
      throw authError;
    }
    
    if (!authData.user) {
      throw new Error('Failed to create anonymous user');
    }
    
    return {
      id: authData.user.id,
      isAnonymous: true
    };
    
  } catch (error) {
    console.error('Error in getOrCreateAnonymousUser:', error);
    throw error;
  }
};

export const getCurrentUserId = async (): Promise<string | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.user?.id || null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};
