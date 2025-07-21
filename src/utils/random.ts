/**
 * ランダム関連のユーティリティ関数
 */

/**
 * 指定範囲内の整数乱数を生成
 * @param min 最小値（含む）
 * @param max 最大値（含む）
 * @returns 乱数
 */
export function getRandomInt(min: number, max: number): number {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * 指定された長さのランダムな整数配列を生成
 * @param length 配列の長さ
 * @param min 最小値（含む）
 * @param max 最大値（含む）
 * @returns ランダムな整数配列
 */
export function generateRandomArray(length: number, min: number, max: number): number[] {
  return Array.from({ length }, () => getRandomInt(min, max));
}

/**
 * 配列をランダムにシャッフル
 * @param array シャッフルする配列
 * @returns シャッフルされた新しい配列
 */
export function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

/**
 * 配列からランダムな要素を取得
 * @param array 配列
 * @returns ランダムな要素
 */
export function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * 指定された確率でtrueを返す
 * @param probability 確率（0-1）
 * @returns boolean
 */
export function randomChance(probability: number): boolean {
  return Math.random() < probability;
}

/**
 * ランダムな遅延時間を生成
 * @param minMs 最小ミリ秒
 * @param maxMs 最大ミリ秒
 * @returns ミリ秒
 */
export function getRandomDelay(minMs: number, maxMs: number): number {
  return getRandomInt(minMs, maxMs);
}
