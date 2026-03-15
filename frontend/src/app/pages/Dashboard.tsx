import { useState } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { useDashboardSummary, type DashboardRange } from '../hooks/useDashboardSummary';
import { formatCurrency, getMarketFlag, getMarketLabel } from '../utils/format';
import { Plus, TrendingUp, TrendingDown, AlertCircle, Star } from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState<DashboardRange>('week');
  const { data, isLoading, error, refetch } = useDashboardSummary(timeRange);

  if (isLoading && !data) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-neutral-200 rounded w-48" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 bg-neutral-200 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error && !data) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700">
            <p>{error}</p>
            <button
              onClick={() => refetch()}
              className="mt-4 px-4 py-2 bg-red-100 rounded-lg hover:bg-red-200"
            >
              다시 시도
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const summary = data?.summary ?? {
    total_trades: 0,
    win_rate: 0,
    total_pnl_amount: 0,
    total_pnl_amount_krw: 0,
    total_pnl_amount_usd: 0,
    trade_count_krw: 0,
    trade_count_usd: 0,
  };
  const recentTrades = data?.recentTrades ?? [];
  const topMistakes = (data?.mistakeStats ?? []).slice(0, 3);
  const todayReminder = data?.ruleOfTheDay ?? '';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-10">
          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">총 거래</span>
              <div className="w-10 h-10 rounded-xl bg-neutral-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neutral-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-neutral-900 tracking-tight">{summary.total_trades}</div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">선택 기간</p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">승률</span>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                summary.win_rate >= 50 ? 'bg-green-50' : 'bg-red-50'
              }`}>
                {summary.win_rate >= 50 ? (
                  <TrendingUp className="w-5 h-5 text-green-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
            </div>
            <div className="text-4xl font-bold text-neutral-900 tracking-tight">
              {summary.win_rate.toFixed(0)}%
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium" />
          </div>

          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">총 수익/손실</span>
              <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-neutral-500" />
              </div>
            </div>
            <div className="space-y-2">
              {summary.trade_count_krw > 0 && (
                <div className={`text-xl md:text-2xl font-bold tracking-tight ${
                  summary.total_pnl_amount_krw >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  한국: {summary.total_pnl_amount_krw >= 0 ? '+' : ''}{formatCurrency(summary.total_pnl_amount_krw, 'KR')}
                </div>
              )}
              {summary.trade_count_usd > 0 && (
                <div className={`text-xl md:text-2xl font-bold tracking-tight ${
                  summary.total_pnl_amount_usd >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  미국: {summary.total_pnl_amount_usd >= 0 ? '+' : ''}{formatCurrency(summary.total_pnl_amount_usd, 'US')}
                </div>
              )}
              {summary.trade_count_krw === 0 && summary.trade_count_usd === 0 && (
                <div className="text-neutral-500 text-lg">매매 내역 없음</div>
              )}
            </div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">선택 기간</p>
          </div>

          <div className="bg-white rounded-2xl p-7 border border-neutral-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <span className="text-neutral-600 text-sm font-medium">최근 매매</span>
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
            </div>
            <div className="text-4xl font-bold text-neutral-900 tracking-tight">{recentTrades.length}</div>
            <p className="text-xs text-neutral-500 mt-2 font-medium">최대 5건</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                          <span className="text-xl leading-none" title={getMarketLabel(trade.market)} aria-label={getMarketLabel(trade.market)}>
                            {getMarketFlag(trade.market)}
                          </span>
                          <span className="font-bold text-neutral-900 text-lg">{trade.ticker}</span>
                          <span className="text-sm text-neutral-500 font-medium">
                            {new Date(trade.date).toLocaleDateString('ko-KR', {
                              month: 'short',
                              day: 'numeric',
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
                        {trade.profitLoss >= 0 ? '+' : ''}{formatCurrency(trade.profitLoss, trade.market)}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

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
                  {topMistakes.map(({ label_ko, count, percentage }) => (
                    <div key={label_ko}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-neutral-700 font-medium">{label_ko}</span>
                        <span className="text-sm font-bold text-neutral-900">{count}</span>
                      </div>
                      <div className="w-full bg-neutral-100 rounded-full h-2.5">
                        <div
                          className="bg-red-500 h-2.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
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
