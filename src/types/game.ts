// ゲーム関連の型定義

// ゲームの種類
export type GameType = 'reaction' | 'memory' | 'color' | 'math' | 'pattern' | 'typing';

// ゲームの状態
export type GameState = 'waiting' | 'ready' | 'playing' | 'showing' | 'finished' | 'go' | 'clicked' | 'too-early';

// ゲームごとのスコア情報
export interface GameScores {
  reaction: number | null;
  memory: number | null;
  color: number | null;
  math: number | null;
  pattern: number | null;
  typing: number | null;
}

// ゲームカード情報
export interface GameCardInfo {
  id: GameType;
  title: string;
  description: string;
  color: string;
  icon: string;
}

// ゲーム結果情報
export interface GameResult {
  score: number;
  level?: number;
  gameOverReason?: 'time' | 'mistake' | null;
}

// ゲームの難易度
export type GameDifficulty = 'easy' | 'normal' | 'hard';
