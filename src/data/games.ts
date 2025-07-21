import { GameCardInfo } from '@/types/game';

/**
 * ゲームカード情報の定義
 * ホーム画面などで使用
 */
export const GAME_CARDS: GameCardInfo[] = [
  { 
    id: 'reaction', 
    title: '⚡ リアクションテスト', 
    description: '画面が変わったら即座にクリック！',
    color: 'bg-gradient-to-br from-yellow-400 to-orange-500',
    icon: '⚡'
  },
  { 
    id: 'memory', 
    title: '🧠 記憶ゲーム', 
    description: '光る順番を覚えてクリック！',
    color: 'bg-gradient-to-br from-blue-400 to-blue-600',
    icon: '🧠'
  },
  { 
    id: 'color', 
    title: '🎨 色判別', 
    description: '文字の色と内容が一致するかを判断！',
    color: 'bg-gradient-to-br from-purple-400 to-pink-500',
    icon: '🎨'
  },
  { 
    id: 'math', 
    title: '🔢 計算', 
    description: '制限時間内に計算問題を解こう！',
    color: 'bg-gradient-to-br from-green-400 to-green-600',
    icon: '🔢'
  },
  { 
    id: 'pattern', 
    title: '🔍 パターン認識', 
    description: '規則性を見つけて答えを推測！',
    color: 'bg-gradient-to-br from-indigo-400 to-purple-600',
    icon: '🔍'
  },
  { 
    id: 'typing', 
    title: '⌨️ タイピング', 
    description: 'できるだけ早く正確にタイピング！',
    color: 'bg-gradient-to-br from-red-400 to-red-600',
    icon: '⌨️'
  }
];

/**
 * IDからゲームカード情報を取得
 */
export function getGameCardById(id: string): GameCardInfo | undefined {
  return GAME_CARDS.find(game => game.id === id);
}
