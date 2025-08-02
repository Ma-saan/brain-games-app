import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface UserDisplayInfo {
  displayName: string
  isAuthenticated: boolean
  userId?: string
  email?: string
}

/**
 * 認証済みユーザーの表示名を取得
 * 優先順位: プロフィール設定名 > Googleアカウント名 > メールアドレス
 */
export async function getUserDisplayInfo(): Promise<UserDisplayInfo> {
  try {
    // 現在の認証状態を取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        displayName: 'ゲスト',
        isAuthenticated: false
      }
    }

    // プロフィール情報を取得
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name')
      .eq('id', user.id)
      .single()

    let displayName = 'ユーザー'

    if (!profileError && profile?.display_name) {
      // 1. プロフィールで設定された名前を優先
      displayName = profile.display_name
    } else if (user.user_metadata?.full_name) {
      // 2. Googleアカウントのフルネーム
      displayName = user.user_metadata.full_name
    } else if (user.user_metadata?.name) {
      // 3. Googleアカウントの名前
      displayName = user.user_metadata.name
    } else if (user.email) {
      // 4. メールアドレスの@より前の部分
      displayName = user.email.split('@')[0]
    }

    return {
      displayName,
      isAuthenticated: true,
      userId: user.id,
      email: user.email || undefined
    }

  } catch (error) {
    console.error('❌ ユーザー表示情報取得エラー:', error)
    return {
      displayName: 'ゲスト',
      isAuthenticated: false
    }
  }
}

/**
 * 認証済みユーザーのスコアを適切なテーブルから取得
 */
export async function getAuthenticatedUserScores(userId: string) {
  const { data, error } = await supabase
    .from('auth_user_scores')
    .select('game_type, score')
    .eq('user_id', userId)

  if (error) {
    console.error('❌ 認証ユーザースコア取得エラー:', error)
    return {}
  }

  // ゲームタイプをキーとするオブジェクトに変換
  const scores: { [key: string]: number | null } = {
    reaction: null,
    memory: null,
    color: null,
    math: null,
    pattern: null,
    typing: null
  }

  data?.forEach(score => {
    scores[score.game_type] = score.score
  })

  return scores
}
