import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { getTrades } from '../utils/storage';
import { Trade, MistakeTag } from '../types/trade';
import { Search, Filter, Calendar } from 'lucide-react';

const mistakeTags: MistakeTag[] = ['FOMO', '손절 지연', '추격 매수', '감정 매매', '과신'];

export default function TradeHistory() {
  const navigate = useNavigate();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<MistakeTag[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('all');

  useEffect(() => {
    setTrades(getTrades());
  }, []);

  const toggleTag = (tag: MistakeTag) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const filteredTrades = trades.filter(trade => {
    // Search filter
    if (searchTerm && !trade.ticker.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Tag filter
    if (selectedTags.length > 0 && !selectedTags.some(tag => trade.mistakeTags.includes(tag))) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const tradeDate = new Date(trade.date);
      const now = new Date();
      const daysAgo = dateFilter === 'week' ? 7 : 30;
      const cutoff = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
      
      if (tradeDate < cutoff) {
        return false;
      }
    }

    return true;
  });

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">매매 내역</h1>
          <p className="text-neutral-500 mt-2 text-base">모든 거래 기록을 확인하세요</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-5 md:p-6 mb-6">
          {/* Search */}
          <div className="mb-5">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="종목 코드로 검색..."
                className="w-full pl-12 pr-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium transition-all"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-semibold text-neutral-700">기간</span>
            </div>
            <div className="flex gap-2.5">
              {(['all', 'week', 'month'] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setDateFilter(period)}
                  className={`px-4 py-2.5 rounded-xl transition-all font-medium ${
                    dateFilter === period
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {period === 'all' ? '전체' : period === 'week' ? '최근 1주' : '최근 1개월'}
                </button>
              ))}
            </div>
          </div>

          {/* Mistake Tags Filter */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Filter className="w-4 h-4 text-neutral-600" />
              <span className="text-sm font-semibold text-neutral-700">실수로 필터</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {mistakeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3.5 py-2 rounded-xl text-sm transition-all font-medium ${
                    selectedTags.includes(tag)
                      ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                      : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm overflow-hidden">
          <div className="px-6 md:px-7 py-5 border-b border-neutral-100">
            <h2 className="font-bold text-neutral-900 text-lg">
              {filteredTrades.length}건의 거래
            </h2>
          </div>

          {filteredTrades.length === 0 ? (
            <div className="p-16 text-center text-neutral-500">
              <p className="text-base">필터 조건에 맞는 거래가 없습니다</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {filteredTrades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => navigate(`/trade/${trade.id}`)}
                  className="px-6 md:px-7 py-5 hover:bg-neutral-50/80 cursor-pointer transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-bold text-neutral-900 text-lg">{trade.ticker}</span>
                        <span className="text-sm text-neutral-500 font-medium">
                          {new Date(trade.date).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-neutral-600 mb-3">
                        <span className="font-medium">진입: ${trade.entryPrice.toFixed(2)}</span>
                        <span className="font-medium">청산: ${trade.exitPrice.toFixed(2)}</span>
                      </div>

                      {trade.memo && (
                        <p className="text-sm text-neutral-600 mb-3 line-clamp-2">{trade.memo}</p>
                      )}

                      {trade.mistakeTags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
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

                    <div className={`text-right font-bold text-xl flex-shrink-0 ${
                      trade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {trade.profitLoss >= 0 ? '+' : ''}${trade.profitLoss.toFixed(2)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}