import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { getTrades } from '../utils/storage';
import { getProfile } from '../utils/profileStorage';
import { Trade, MistakeTag } from '../types/trade';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Star } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [todayReminder, setTodayReminder] = useState<string>('');
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week');

  useEffect(() => {
    setTrades(getTrades());
    const profile = getProfile();
    setTodayReminder(profile.todayReminder);
  }, []);

  // Calculate date range based on selected filter
  const getFilteredTrades = () => {
    const now = new Date();
    
    switch (timeRange) {
      case 'today': {
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return trades.filter(t => new Date(t.date) >= todayStart);
      }
      case 'week': {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return trades.filter(t => new Date(t.date) >= weekAgo);
      }
      case 'month': {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return trades.filter(t => new Date(t.date) >= monthAgo);
      }
      case 'all':
      default:
        return trades;
    }
  };

  const filteredTrades = getFilteredTrades();
  
  // Calculate stats based on filtered trades
  const totalTrades = filteredTrades.length;
  const winningTrades = filteredTrades.filter(t => t.profitLoss > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPL = filteredTrades.reduce((sum, t) => sum + t.profitLoss, 0);

  // Get recent trades (always from all trades, not filtered)
  const recentTrades = trades.slice(0, 5);

  // Count mistake tags (from all trades)
  const mistakeCount: Record<string, number> = {};
  trades.forEach(trade => {
    trade.mistakeTags.forEach(tag => {
      mistakeCount[tag] = (mistakeCount[tag] || 0) + 1;
    });
  });
  
  const topMistakes = Object.entries(mistakeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">대시보드</h1>
            <p className="text-neutral-500 mt-2 text-base">매매 현황을 확인하세요</p>
          </div>
          <button
            onClick={() => navigate('/add')}
            className="flex items-center gap-2 px-5 md:px-7 py-3 md:py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98] font-medium"
          >
            <Plus className="w-5 h-5" />
            <span className="hidden md:inline">매매 기록</span>
          </button>
        </div>

        {/* Rule of the Day */}
        {todayReminder && (
          <div className="mb-8">
            <div 
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-7 text-white shadow-xl shadow-blue-600/25 cursor-pointer hover:shadow-2xl hover:shadow-blue-600/35 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0">
                  <Star className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h2 className="font-semibold mb-2 text-sm uppercase tracking-wide opacity-90">오늘의 원칙</h2>
                  <p className="text-xl font-medium text-white leading-relaxed">{todayReminder}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Range Filter */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            {(['today', 'week', 'month', 'all'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-xl transition-all font-medium text-sm ${
                  timeRange === range
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                    : 'bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-50'
                }`}
              >
                {range === 'today' ? '오늘' : range === 'week' ? '이번 주' : range === 'month' ? '이번 달' : '전체'}
              </button>
            ))}
          </div>
        </div>

        {/* Weekly Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">총 거래</span>
              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-neutral-900 tracking-tight">{trades.length}</div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">전체 기간</p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">
                {timeRange === 'today' ? '오늘 거래' : timeRange === 'week' ? '주간 거래' : timeRange === 'month' ? '월간 거래' : '총 거래'}
              </span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-neutral-900 tracking-tight">{totalTrades}</div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">
              {timeRange === 'today' ? '오늘' : timeRange === 'week' ? '최근 7일' : timeRange === 'month' ? '최근 30일' : '전체'}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">승률</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                winRate >= 50 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {winRate >= 50 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
            <div className="text-4xl font-bold text-neutral-900 tracking-tight">
              {winRate.toFixed(0)}%
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">
              {winningTrades}/{totalTrades} 승
            </p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">총 수익/손실</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                totalPL >= 0 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {totalPL >= 0 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
            <div className={`text-4xl font-bold tracking-tight ${
              totalPL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ${totalPL >= 0 ? '+' : ''}{totalPL.toFixed(2)}
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">이번 주</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Trades */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-7 py-6 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-lg">최근 매매</h2>
            </div>
            <div className="divide-y divide-neutral-100">
              {recentTrades.length === 0 ? (
                <div className="p-12 text-center text-neutral-500">
                  <p className="text-base">아직 매매 기록이 없습니다. 첫 거래를 추가해보세요!</p>
                </div>
              ) : (
                recentTrades.map((trade) => (
                  <div
                    key={trade.id}
                    onClick={() => navigate(`/trade/${trade.id}`)}
                    className="px-7 py-5 hover:bg-neutral-50/80 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-neutral-900 text-lg">{trade.ticker}</span>
                          <span className="text-sm text-neutral-500 font-medium">
                            {new Date(trade.date).toLocaleDateString('ko-KR', { 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </span>
                        </div>
                        {trade.memo && (
                          <p className="text-sm text-neutral-600 mt-2 line-clamp-1">{trade.memo}</p>
                        )}
                        {trade.mistakeTags.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {trade.mistakeTags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-3 py-1.5 rounded-full bg-red-50 text-red-700 font-medium border border-red-100"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`text-right ml-6 font-bold text-xl ${
                        trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-7 py-6 border-b border-neutral-100">
              <h2 className="font-semibold text-neutral-900 text-lg">주요 실수</h2>
            </div>
            <div className="p-7">
              {topMistakes.length === 0 ? (
                <div className="text-center text-neutral-500 py-8">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
                  <p className="text-sm">아직 태그된 실수가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {topMistakes.map(([tag, count]) => (
                    <div key={tag}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-700 font-medium">{tag}</span>
                        <span className="text-sm font-bold text-neutral-900">{count}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div
                          className="bg-red-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${(count / trades.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}