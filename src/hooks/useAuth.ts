import { useState, useEffect } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, Profile } from '@/lib/supabase'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true,
    isAuthenticated: false
  })

  useEffect(() => {
    // 初回の認証状態取得
    const getInitialAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false
          })
        }
      } catch (error) {
        console.error('認証状態の取得に失敗:', error)
        setState({
          user: null,
          profile: null,
          session: null,
          loading: false,
          isAuthenticated: false
        })
      }
    }

    getInitialAuth()

    // 認証状態の変更を監視
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session)
        
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            session,
            loading: false,
            isAuthenticated: true
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            loading: false,
            isAuthenticated: false
          })
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // プロフィール情報を取得
  const fetchProfile = async (userId: string): Promise<Profile | null> => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.log('プロフィールが見つかりません:', error.message)
        return null
      }

      return profile
    } catch (error) {
      console.error('プロフィール取得エラー:', error)
      return null
    }
  }

  // Google認証でログイン
  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}`
        }
      })

      if (error) {
        console.error('ログインエラー:', error.message)
        throw error
      }
    } catch (error) {
      console.error('Google認証に失敗:', error)
      throw error
    }
  }

  // ログアウト
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('ログアウトエラー:', error.message)
        throw error
      }
    } catch (error) {
      console.error('ログアウトに失敗:', error)
      throw error
    }
  }

  // プロフィール作成
  const createProfile = async (displayName: string): Promise<Profile | null> => {
    if (!state.user) {
      throw new Error('ユーザーがログインしていません')
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert({
          id: state.user.id,
          display_name: displayName
        })
        .select()
        .single()

      if (error) {
        console.error('プロフィール作成エラー:', error.message)
        throw error
      }

      // 状態を更新
      setState(prev => ({
        ...prev,
        profile
      }))

      return profile
    } catch (error) {
      console.error('プロフィール作成に失敗:', error)
      throw error
    }
  }

  // プロフィール更新
  const updateProfile = async (displayName: string): Promise<Profile | null> => {
    if (!state.user) {
      throw new Error('ユーザーがログインしていません')
    }

    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .update({ display_name: displayName })
        .eq('id', state.user.id)
        .select()
        .single()

      if (error) {
        console.error('プロフィール更新エラー:', error.message)
        throw error
      }

      // 状態を更新
      setState(prev => ({
        ...prev,
        profile
      }))

      return profile
    } catch (error) {
      console.error('プロフィール更新に失敗:', error)
      throw error
    }
  }

  // 初回登録かどうかを判定（プロフィールが存在しない）
  const isFirstTimeUser = state.isAuthenticated && !state.profile

  return {
    ...state,
    isFirstTimeUser,
    signInWithGoogle,
    signOut,
    createProfile,
    updateProfile,
    refreshProfile: () => state.user ? fetchProfile(state.user.id) : null
  }
}