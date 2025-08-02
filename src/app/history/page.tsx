'use client';

import Link from 'next/link';
import { useGame } from '../context/GameContext';
import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface AllUserScore {
  username: string;
  gameType: string;
  score: number;
  isAuth: boolean;
}

export default function HistoryPage() {
  const { userScores, currentUser, getCurrentUserScores, isAuthenticated } = useGame();
  const { user, profile, getDisplayName } = useAuth();
  const [activeTab, setActiveTab] = useState<'personal' | 'rankings'>('personal');
  const [allScores, setAllScores] = useState<AllUserScore[]>([]);
  
  const gameNames = {
    reaction: '⚡ リアクションテスト',
    memory: '🧠 記憶ゲーム',
    color: '🎨 色判別',
    math: '🔢 計算',
    pattern: '🔍 パターン認識',
    typing: '⌨️ タイピング'
  };

  const currentUserScores = getCurrentUserScores();

  // 全ユーザーのスコアを統合して取得
  useEffect(() => {
    const loadAllScores = async () => {
      try {
        const allUserScores: AllUserScore[] = [];

        // ゲストユーザーのスコアを取得
        const { data: guestScores, error: guestError } = await supabase
          .from('user_scores')
          .select('user_name, game_type, score')
          .not('score', 'is', null);

        if (guestError) {
          console.error('ゲストスコア取得エラー:', guestError);
        } else {
          guestScores?.forEach(score => {
            allUserScores.push({
              username: score.user_name,
              gameType: score.game_type,
              score: score.score,
              isAuth: false
            });
          });
        }

        // 認証ユーザーのスコアを取得（JOINを使わずに別々に取得）
        const { data: authScores, error: authError } = await supabase
          .from('auth_user_scores')
          .select('user_id, game_type, score')
          .not('score', 'is', null);

        if (authError) {
          console.error('認証ユーザースコア取得エラー:', authError);
        } else if (authScores && authScores.length > 0) {
          // ユニークなuser_idを取得
          const userIds = [...new Set(authScores.map(score => score.user_id))];
          
          // プロフィール情報とauth.usersの情報を取得
          const { data: profiles, error: profileError } = await supabase
            .from('profiles')
            .select('id, display_name')
            .in('id', userIds);

          if (profileError) {
            console.error('プロフィール取得エラー:', profileError);
          }

          // auth.usersのuser_metadataも取得
          const { data: authUsers, error: authUsersError } = await supabase.auth.admin.listUsers();
          
          if (authUsersError) {
            console.error('認証ユーザー取得エラー:', authUsersError);
          }

          // プロフィール情報とスコアを結合
          const profileMap = new Map(profiles?.map(p => [p.id, p.display_name]) || []);
          const authUserMap = new Map(authUsers?.users?.map(u => [u.id, u]) || []);
          
          authScores.forEach(score => {
            let displayName = profileMap.get(score.user_id);
            
            // プロフィール名がない場合、Googleアカウント名を使用
            if (!displayName) {
              const authUser = authUserMap.get(score.user_id);
              if (authUser?.user_metadata?.full_name) {
                displayName = authUser.user_metadata.full_name;
              } else if (authUser?.user_metadata?.name) {
                displayName = authUser.user_metadata.name;
              } else if (authUser?.email) {
                displayName = authUser.email.split('@')[0];
              } else {
                displayName = 'ユーザー';
              }
            }
            
            if (displayName) {
              allUserScores.push({
                username: displayName,
                gameType: score.game_type,
                score: score.score!,
                isAuth: true
              });
            }
          });
        }

        setAllScores(allUserScores);
      } catch (error) {
        console.error('スコア統合取得エラー:', error);
      }
    };

    loadAllScores();
  }, []);

  // 各ゲームの統合ランキングを生成
  const generateRankings = () => {
    const rankings: { [gameId: string]: Array<{ username: string; score: number; rank: number; isAuth: boolean }> } = {};
    
    Object.keys(gameNames).forEach(gameId => {
      const gameScores: Array<{ username: string; score: number; isAuth: boolean }> = [];
      
      // 統合スコアからゲーム別に最高スコアを取得
      const userBestScores: { [username: string]: { score: number; isAuth: boolean } } = {};
      
      allScores.forEach(scoreData => {
        if (scoreData.gameType === gameId) {
          const currentBest = userBestScores[scoreData.username];
          
          if (!currentBest) {
            userBestScores[scoreData.username] = {
              score: scoreData.score,
              isAuth: scoreData.isAuth
            };
          } else {
            // ベストスコアを更新するかどうか判定
            const isBetter = gameId === 'reaction' 
              ? scoreData.score < currentBest.score
              : scoreData.score > currentBest.score;
              
            if (isBetter) {
              userBestScores[scoreData.username] = {
                score: scoreData.score,
                isAuth: scoreData.isAuth
              };
            }
          }
        }
      });
      
      // ベストスコアを配列に変換
      Object.entries(userBestScores).forEach(([username, data]) => {
        gameScores.push({
          username,
          score: data.score,
          isAuth: data.isAuth
        });
      });
      
      // スコアでソート（リアクションテストは小さい方が良い、その他は大きい方が良い）
      gameScores.sort((a, b) => {
        if (gameId === 'reaction') {
          return a.score - b.score; // 昇順
        } else {
          return b.score - a.score; // 降順
        }
      });
      
      // ランク付け
      rankings[gameId] = gameScores.map((item, index) => ({
        ...item,
        rank: index + 1
      }));
    });
    
    return rankings;
  };

  const rankings = generateRankings();

  const hasPersonalScores = Object.values(currentUserScores).some(score => score !== null);

  const formatScore = (gameId: string, score: number) => {
    return gameId === 'reaction' ? `${score}ms` : `${score}点`;
  };

  const getUserRank = (gameId: string, score: number | null) => {
    if (score === null) return '-';
    const gameRanking = rankings[gameId];
    // 修正：getDisplayName()を使用して適切な表示名を取得
    const currentUserName = isAuthenticated ? getDisplayName() : currentUser;
    const userRank = gameRanking.find(item => item.username === currentUserName && item.score === score);
    return userRank ? `${userRank.rank}位` : '-';
  };

  // 修正：getDisplayName()を使用して適切な表示名を取得
  const currentUserName = isAuthenticated ? getDisplayName() : currentUser;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
            ← メインメニューに戻る
          </Link>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">📊 スコア履歴</h1>
          <p className="text-blue-600">あなたのスコアとランキングを確認できます</p>
        </div>

        {/* タブ切り替え */}
        <div className="flex justify-center mb-6">
          <div className="bg-white rounded-lg shadow-lg p-1 flex">
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'personal'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-500 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab('personal')}
            >
              👤 マイスコア
            </button>
            <button
              className={`px-6 py-2 rounded-md transition-colors ${
                activeTab === 'rankings'
                  ? 'bg-blue-500 text-white'
                  : 'text-blue-500 hover:bg-blue-50'
              }`}
              onClick={() => setActiveTab('rankings')}
            >
              🏆 ランキング
            </button>
          </div>
        </div>

        {/* 現在のユーザー表示 */}
        <div className="text-center mb-6">
          <div className="bg-white rounded-lg shadow-lg px-4 py-2 inline-block">
            <span className="text-blue-600 text-sm">現在のユーザー: </span>
            <span className="font-bold text-blue-800">{currentUserName}</span>
            {isAuthenticated && (
              <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                認証済み
              </span>
            )}
          </div>
        </div>

        {activeTab === 'personal' ? (
          /* 個人スコア表示 */
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
                👤 {currentUserName} のスコア
              </h2>
              
              {!hasPersonalScores ? (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-lg mb-4">まだスコアがありません</p>
                  <p className="text-sm">ゲームをプレイしてスコアを記録しましょう！</p>
                  <Link 
                    href="/" 
                    className="inline-block mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    ゲームをプレイする
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(currentUserScores).map(([gameId, score]) => (
                    <div key={gameId} className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <div className="text-sm text-blue-600 mb-2">
                        {gameNames[gameId as keyof typeof gameNames]}
                      </div>
                      <div className="text-xl font-bold text-blue-800 mb-1">
                        {score !== null ? formatScore(gameId, score) : '未プレイ'}
                      </div>
                      <div className="text-sm text-blue-500">
                        ランク: {getUserRank(gameId, score)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ベストスコア統計 */}
            {hasPersonalScores && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-xl font-bold text-blue-800 mb-4">📈 統計情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-green-50 rounded-lg p-4 text-center">
                    <div className="text-green-600 text-sm mb-1">プレイしたゲーム</div>
                    <div className="text-2xl font-bold text-green-800">
                      {Object.values(currentUserScores).filter(score => score !== null).length}
                    </div>
                    <div className="text-green-600 text-xs">/ 6 ゲーム</div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 text-center">
                    <div className="text-yellow-600 text-sm mb-1">トップ3入り</div>
                    <div className="text-2xl font-bold text-yellow-800">
                      {Object.keys(gameNames).filter(gameId => {
                        const score = currentUserScores[gameId as keyof typeof gameNames];
                        if (score === null) return false;
                        const userRank = rankings[gameId]?.find(item => 
                          item.username === currentUserName && item.score === score
                        );
                        return userRank && userRank.rank <= 3;
                      }).length}
                    </div>
                    <div className="text-yellow-600 text-xs">回</div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4 text-center">
                    <div className="text-purple-600 text-sm mb-1">1位獲得</div>
                    <div className="text-2xl font-bold text-purple-800">
                      {Object.keys(gameNames).filter(gameId => {
                        const score = currentUserScores[gameId as keyof typeof gameNames];
                        if (score === null) return false;
                        const userRank = rankings[gameId]?.find(item => 
                          item.username === currentUserName && item.score === score
                        );
                        return userRank && userRank.rank === 1;
                      }).length}
                    </div>
                    <div className="text-purple-600 text-xs">回</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* ランキング表示 */
          <div className="space-y-6">
            {Object.entries(gameNames).map(([gameId, gameName]) => {
              const gameRanking = rankings[gameId];
              
              return (
                <div key={gameId} className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-xl font-bold text-blue-800 mb-4">
                    {gameName} ランキング
                  </h3>
                  
                  {gameRanking.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      <p>まだスコアがありません</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {gameRanking.slice(0, 10).map((item, index) => {
                        const isCurrentUser = item.username === currentUserName;
                        const rankColor = index === 0 ? 'text-yellow-600' : 
                                        index === 1 ? 'text-gray-500' : 
                                        index === 2 ? 'text-orange-600' : 'text-blue-600';
                        const rankEmoji = index === 0 ? '🥇' : 
                                        index === 1 ? '🥈' : 
                                        index === 2 ? '🥉' : '🏅';
                        
                        return (
                          <div 
                            key={`${item.username}-${item.score}`}
                            className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                              isCurrentUser 
                                ? 'bg-blue-100 border-2 border-blue-300' 
                                : 'bg-gray-50 hover:bg-gray-100'
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`font-bold text-lg ${rankColor}`}>
                                {rankEmoji} {item.rank}位
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className={`font-medium ${isCurrentUser ? 'text-blue-800' : 'text-gray-800'}`}>
                                  {item.username}
                                  {isCurrentUser && <span className="text-blue-600 text-sm ml-2">(あなた)</span>}
                                </div>
                                {item.isAuth && (
                                  <span className="px-1.5 py-0.5 bg-green-100 text-green-600 text-xs rounded-full">
                                    認証
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className={`font-bold text-lg ${isCurrentUser ? 'text-blue-800' : 'text-gray-700'}`}>
                              {formatScore(gameId, item.score)}
                            </div>
                          </div>
                        );
                      })}
                      
                      {gameRanking.length > 10 && (
                        <div className="text-center pt-2">
                          <span className="text-gray-500 text-sm">
                            他 {gameRanking.length - 10} 人のプレイヤー
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-bold text-blue-800 mb-2">💡 ヒント</h3>
          <ul className="text-blue-700 text-sm space-y-1">
            <li>• マイスコアタブで自分の成績と順位を確認できます</li>
            <li>• ランキングタブで各ゲームの上位プレイヤーを見ることができます</li>
            <li>• より良いスコアを出すとランキングが更新されます</li>
            <li>• リアクションテストは時間が短いほど高順位です</li>
            <li>• 認証ユーザーとゲストユーザーの統合ランキングです</li>
            <li>• 認証済みのユーザーには「認証」バッジが表示されます</li>
            <li>• Google認証でログインすると、設定した名前またはGoogleアカウント名が表示されます</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
