import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { getTrades } from '../utils/storage';
import { Trade } from '../types/trade';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, TrendingDown, Target, AlertCircle } from 'lucide-react';

export default function Review() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    setTrades(getTrades());
  }, []);

  // Calculate stats
  const totalTrades = trades.length;
  const winningTrades = trades.filter(t => t.profitLoss > 0).length;
  const losingTrades = trades.filter(t => t.profitLoss < 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPL = trades.reduce((sum, t) => sum + t.profitLoss, 0);
  const avgWin = winningTrades > 0 
    ? trades.filter(t => t.profitLoss > 0).reduce((sum, t) => sum + t.profitLoss, 0) / winningTrades
    : 0;
  const avgLoss = losingTrades > 0
    ? trades.filter(t => t.profitLoss < 0).reduce((sum, t) => sum + t.profitLoss, 0) / losingTrades
    : 0;

  // Count mistake tags
  const mistakeCount: Record<string, number> = {};
  trades.forEach(trade => {
    trade.mistakeTags.forEach(tag => {
      mistakeCount[tag] = (mistakeCount[tag] || 0) + 1;
    });
  });
  
  const topMistakes = Object.entries(mistakeCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // Prepare chart data - cumulative P/L over time
  const sortedTrades = [...trades].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  let cumulativePL = 0;
  const chartData = sortedTrades.map((trade, index) => {
    cumulativePL += trade.profitLoss;
    return {
      date: new Date(trade.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      pl: parseFloat(cumulativePL.toFixed(2)),
      trade: index + 1,
    };
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">리뷰 및 분석</h1>
          <p className="text-neutral-500 mt-2 text-base">매매 성과를 분석하세요</p>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
          <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-xs md:text-sm font-medium">총 거래</span>
              <Target className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">{totalTrades}</div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-xs md:text-sm font-medium">승률</span>
              {winRate >= 50 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className={`text-3xl md:text-4xl font-bold tracking-tight ${
              winRate >= 50 ? 'text-green-600' : 'text-neutral-900'
            }`}>
              {winRate.toFixed(1)}%
            </div>
            <p className="text-xs text-neutral-500 mt-1.5 font-medium">{winningTrades}승 / {losingTrades}패</p>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-xs md:text-sm font-medium">총 수익/손실</span>
              {totalPL >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
            <div className={`text-2xl md:text-3xl font-bold tracking-tight ${
              totalPL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-neutral-600 text-xs md:text-sm font-medium">평균 수익/손실</span>
              <AlertCircle className="w-4 h-4 text-neutral-400" />
            </div>
            <div className="text-lg md:text-xl font-bold text-green-600 tracking-tight">
              +${avgWin.toFixed(2)}
            </div>
            <div className="text-lg md:text-xl font-bold text-red-600 tracking-tight">
              ${avgLoss.toFixed(2)}
            </div>
          </div>
        </div>

        {/* P/L Chart */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 md:p-8 mb-8">
          <h2 className="font-bold text-neutral-900 mb-6 text-lg">누적 수익/손실 추이</h2>
          {chartData.length > 0 ? (
            <div className="h-64 md:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px', fontWeight: 500 }}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600,
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    }}
                    formatter={(value: any) => [`$${value.toFixed(2)}`, 'P/L']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pl" 
                    stroke="#2563eb" 
                    strokeWidth={3}
                    dot={{ fill: '#2563eb', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-neutral-500">
              <p className="text-base">표시할 거래가 없습니다</p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Common Mistakes */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-7 py-6 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900 text-lg">가장 흔한 실수</h2>
            </div>
            <div className="p-7">
              {topMistakes.length === 0 ? (
                <div className="text-center py-10 text-neutral-500">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3 text-neutral-400" />
                  <p className="text-sm">아직 실수 태그가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {topMistakes.map(([tag, count]) => (
                    <div key={tag}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-neutral-700">{tag}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-neutral-600 font-medium">{count} 번</span>
                          <span className="text-sm text-neutral-500 font-medium">
                            ({((count / totalTrades) * 100).toFixed(0)}%)
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div
                          className="bg-red-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${(count / totalTrades) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Recent Notes */}
          <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
            <div className="px-7 py-6 border-b border-neutral-100">
              <h2 className="font-bold text-neutral-900 text-lg">최근 메모</h2>
            </div>
            <div className="p-7">
              {trades.filter(t => t.memo).length === 0 ? (
                <div className="text-center py-10 text-neutral-500">
                  <p className="text-sm">메모가 있는 거래가 없습니다</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trades
                    .filter(t => t.memo)
                    .slice(0, 5)
                    .map((trade) => (
                      <div key={trade.id} className="border-l-4 border-blue-500 pl-4 py-2 bg-neutral-50 rounded-r-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-bold text-neutral-900">{trade.ticker}</span>
                          <span className="text-xs text-neutral-500 font-medium">
                            {new Date(trade.date).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <p className="text-sm text-neutral-600 line-clamp-2">{trade.memo}</p>
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