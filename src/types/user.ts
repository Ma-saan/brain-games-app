// ユーザー関連の型定義

import { GameScores } from './game';

// ユーザースコア情報
export interface UserScores {
  [username: string]: GameScores;
}

// ユーザー情報
export interface UserInfo {
  username: string;
  createdAt: string;
  lastActive: string;
}

// Supabaseユーザースコアレコード
export interface UserScoreRecord {
  id?: number;
  user_name: string;
  game_type: string;
  score: number | null;
  created_at?: string;
  updated_at?: string;
}
