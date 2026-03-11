import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import Layout from '../components/Layout';
import { getTrades, deleteTrade, updateTrade } from '../utils/storage';
import { Trade, MistakeTag } from '../types/trade';
import { ArrowLeft, Edit2, Trash2, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

const mistakeTags: MistakeTag[] = ['FOMO', '손절 지연', '추격 매수', '감정 매매', '과신'];

export default function TradeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrade, setEditedTrade] = useState<Trade | null>(null);

  useEffect(() => {
    const trades = getTrades();
    const foundTrade = trades.find(t => t.id === id);
    if (foundTrade) {
      setTrade(foundTrade);
      setEditedTrade(foundTrade);
    }
  }, [id]);

  if (!trade || !editedTrade) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <p className="text-neutral-600">거래를 찾을 수 없습니다</p>
        </div>
      </Layout>
    );
  }

  const handleDelete = () => {
    if (window.confirm('정말로 이 거래를 삭제하시겠습니까?')) {
      deleteTrade(trade.id);
      navigate('/history');
    }
  };

  const handleSave = () => {
    const profitLoss = (editedTrade.exitPrice - editedTrade.entryPrice) * (editedTrade.quantity || 1);
    const updatedTrade = {
      ...editedTrade,
      profitLoss,
    };
    updateTrade(trade.id, updatedTrade);
    setTrade(updatedTrade);
    setIsEditing(false);
  };

  const toggleMistake = (tag: MistakeTag) => {
    if (!isEditing) return;
    
    setEditedTrade(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        mistakeTags: prev.mistakeTags.includes(tag)
          ? prev.mistakeTags.filter(t => t !== tag)
          : [...prev.mistakeTags, tag]
      };
    });
  };

  const displayTrade = isEditing ? editedTrade : trade;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-neutral-600 hover:text-neutral-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>뒤로</span>
          </button>
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  <span>수정</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>삭제</span>
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => {
                    setEditedTrade(trade);
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  저장
                </button>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          {/* Main Card */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            {/* Header */}
            <div className="p-6 md:p-8 border-b border-neutral-200">
              <div className="flex items-start justify-between mb-4">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedTrade.ticker}
                    onChange={(e) => setEditedTrade({ ...editedTrade, ticker: e.target.value.toUpperCase() })}
                    className="text-3xl font-semibold text-neutral-900 border-b-2 border-blue-500 focus:outline-none"
                  />
                ) : (
                  <h1 className="text-3xl font-semibold text-neutral-900">{displayTrade.ticker}</h1>
                )}
                <div className={`text-right ${
                  displayTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  <div className="flex items-center gap-2 justify-end mb-1">
                    {displayTrade.profitLoss >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-3xl font-semibold">
                    {displayTrade.profitLoss >= 0 ? '+' : ''}${displayTrade.profitLoss.toFixed(2)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(displayTrade.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
            </div>

            {/* Trade Details */}
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    진입가
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedTrade.entryPrice}
                      onChange={(e) => setEditedTrade({ ...editedTrade, entryPrice: parseFloat(e.target.value) || 0 })}
                      className="text-2xl font-semibold text-neutral-900 border-b-2 border-blue-500 focus:outline-none w-full"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-neutral-900">
                      ${displayTrade.entryPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    청산가
                  </label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedTrade.exitPrice}
                      onChange={(e) => setEditedTrade({ ...editedTrade, exitPrice: parseFloat(e.target.value) || 0 })}
                      className="text-2xl font-semibold text-neutral-900 border-b-2 border-blue-500 focus:outline-none w-full"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-neutral-900">
                      ${displayTrade.exitPrice.toFixed(2)}
                    </div>
                  )}
                </div>

                {displayTrade.quantity && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">
                      수량
                    </label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        value={editedTrade.quantity || ''}
                        onChange={(e) => setEditedTrade({ ...editedTrade, quantity: parseFloat(e.target.value) || undefined })}
                        className="text-2xl font-semibold text-neutral-900 border-b-2 border-blue-500 focus:outline-none w-full"
                      />
                    ) : (
                      <div className="text-2xl font-semibold text-neutral-900">
                        {displayTrade.quantity}
                      </div>
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    변동률
                  </label>
                  <div className={`text-2xl font-semibold ${
                    displayTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {displayTrade.profitLoss >= 0 ? '+' : ''}
                    {((displayTrade.exitPrice - displayTrade.entryPrice) / displayTrade.entryPrice * 100).toFixed(2)}%
                  </div>
                </div>
              </div>

              {displayTrade.memo && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-600 mb-2">
                    메모
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedTrade.memo || ''}
                      onChange={(e) => setEditedTrade({ ...editedTrade, memo: e.target.value })}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  ) : (
                    <p className="text-neutral-700">{displayTrade.memo}</p>
                  )}
                </div>
              )}

              {(displayTrade.mistakeTags.length > 0 || isEditing) && (
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-3">
                    실수 태그
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {isEditing ? (
                      mistakeTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() => toggleMistake(tag)}
                          className={`px-3 py-2 rounded-lg transition-colors ${
                            editedTrade.mistakeTags.includes(tag)
                              ? 'bg-red-500 text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))
                    ) : (
                      displayTrade.mistakeTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200"
                        >
                          {tag}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chart Image */}
          {displayTrade.chartImage && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">차트 스크린샷</h2>
              <img
                src={displayTrade.chartImage}
                alt="Trade chart"
                className="w-full rounded-lg border border-neutral-200"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}