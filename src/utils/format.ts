/**
 * フォーマット関連のユーティリティ関数
 */

/**
 * ミリ秒を「〇〇ms」形式に変換
 * @param ms ミリ秒
 * @returns フォーマットされた文字列
 */
export function formatMilliseconds(ms: number | null): string {
  if (ms === null) return '未プレイ';
  return `${ms}ms`;
}

/**
 * スコアを「〇〇点」形式に変換
 * @param score スコア
 * @param gameType ゲームタイプ（オプション）
 * @returns フォーマットされた文字列
 */
export function formatScore(score: number | null, gameType?: string): string {
  if (score === null) return '未プレイ';
  
  if (gameType === 'reaction') {
    return `${score}ms`;
  }
  
  return `${score}点`;
}

/**
 * リアクションゲームの評価を取得
 * @param score ミリ秒
 * @returns 評価文字列
 */
export function getReactionRating(score: number): string {
  if (score < 200) return '🏆 超人的な反応！';
  if (score < 300) return '🌟 素晴らしい反応！';
  if (score < 400) return '👍 良い反応！';
  if (score < 500) return '😊 なかなか良い！';
  return '💪 練習すればもっと早くなる！';
}

/**
 * 記憶ゲームの評価を取得
 * @param score スコア
 * @returns 評価文字列
 */
export function getMemoryRating(score: number): string {
  if (score >= 100) return '🏆 記憶の達人！';
  if (score >= 80) return '🌟 素晴らしい記憶力！';
  if (score >= 60) return '👍 良い記憶力！';
  if (score >= 40) return '😊 なかなか良い！';
  return '💪 練習すればもっと良くなる！';
}

/**
 * 色判別ゲームの評価を取得
 * @param score スコア
 * @returns 評価文字列
 */
export function getColorRating(score: number): string {
  if (score >= 25) return '🏆 色判別マスター！';
  if (score >= 20) return '🌟 素晴らしい集中力！';
  if (score >= 15) return '👍 なかなか良い成績！';
  if (score >= 10) return '😊 頑張りました！';
  if (score >= 5) return '💪 練習すればもっと良くなる！';
  return '🤔 もう一度チャレンジ！';
}

/**
 * 秒を「〇〇秒」形式に変換
 * @param seconds 秒
 * @returns フォーマットされた文字列
 */
export function formatSeconds(seconds: number): string {
  return `${seconds}秒`;
}
