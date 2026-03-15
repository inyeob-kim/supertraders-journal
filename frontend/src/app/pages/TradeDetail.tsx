import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router';
import Layout from '../components/Layout';
import { useTrade } from '../hooks/useTrade';
import { mistakeTagsApi } from '../api/endpoints';
import type { Trade, MistakeTag } from '../types/trade';
import type { TradeDirection, MarketType } from '../api/types';
import type { MistakeTagItem } from '../api/types';
import { formatCurrency } from '../utils/format';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import { ArrowLeft, Edit2, Trash2, Calendar, TrendingUp, TrendingDown, Upload, ImageIcon, X } from 'lucide-react';

const TRADE_DIRECTION_LABELS: Record<string, string> = { LONG: '롱', SHORT: '숏' };
const MARKET_TYPE_LABELS: Record<string, string> = {
  US_STOCK: '미국주식',
  KOREA_STOCK: '한국주식',
  CRYPTO: '코인',
};
const STRATEGY_OPTIONS: { value: string; label: string }[] = [
  { value: 'BREAKOUT', label: '돌파' },
  { value: 'PULLBACK', label: '눌림목' },
  { value: 'SUPPORT_BOUNCE', label: '지지 반등' },
  { value: 'MOMENTUM', label: '모멘텀' },
  { value: 'SWING', label: '스윙' },
  { value: 'DAY_TRADE', label: '데이 트레이드' },
  { value: 'SCALP', label: '스캘핑' },
  { value: 'NEWS_PLAY', label: '뉴스 플레이' },
];

export default function TradeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const openInEditMode = searchParams.get('edit') === '1';
  const { trade, isLoading, error, updateTrade, deleteTrade, refetch } = useTrade(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrade, setEditedTrade] = useState<Trade | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [mistakeTagList, setMistakeTagList] = useState<MistakeTagItem[]>([]);
  const [chartLightboxUrl, setChartLightboxUrl] = useState<string | null>(null);
  const chartFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    mistakeTagsApi.list().then((list) => setMistakeTagList(list)).catch(() => {});
  }, []);

  useEffect(() => {
    if (trade) {
      setEditedTrade(trade);
    }
  }, [trade]);

  useEffect(() => {
    if (trade && openInEditMode) setIsEditing(true);
  }, [trade?.id, openInEditMode]);

  useEffect(() => {
    if (chartLightboxUrl) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [chartLightboxUrl]);

  useEffect(() => {
    if (!isEditing) return;
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (ev) => {
              const url = ev.target?.result as string;
              if (url) setEditedTrade((prev) => (prev ? { ...prev, chartImage: url } : prev));
            };
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, [isEditing]);

  const handleDelete = async () => {
    if (!trade) return;
    await deleteTrade();
    setDeleteModalOpen(false);
    navigate('/history');
  };

  const handleSave = async () => {
    if (!editedTrade || !trade) return;
    const isOpen = trade.tradeStatus === 'OPEN' && (editedTrade.exitPrice === 0 || editedTrade.exitPrice === undefined);
    const profitLoss = isOpen
      ? 0
      : (editedTrade.exitPrice - editedTrade.entryPrice) * (editedTrade.quantity || 1);
    await updateTrade({
      ...editedTrade,
      profitLoss,
      mistakeTagIds: editedTrade.mistakeTagIds ?? trade.mistakeTagIds,
    });
    setIsEditing(false);
    refetch();
  };

  const toggleMistakeById = (tagId: string) => {
    if (!isEditing || !editedTrade) return;
    const currentIds = editedTrade.mistakeTagIds ?? [];
    const tag = mistakeTagList.find((t) => t.id === tagId);
    const nextIds = currentIds.includes(tagId)
      ? currentIds.filter((id) => id !== tagId)
      : [...currentIds, tagId];
    const nextLabels = nextIds
      .map((id) => mistakeTagList.find((t) => t.id === id)?.label_ko)
      .filter(Boolean) as string[];
    setEditedTrade({
      ...editedTrade,
      mistakeTagIds: nextIds,
      mistakeTags: nextLabels,
    });
  };

  const handleChartFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) setEditedTrade((prev) => (prev ? { ...prev, chartImage: url } : prev));
    };
    reader.readAsDataURL(file);
  };

  const handleChartDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleChartDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleChartFile(file);
  };

  if (isLoading && !trade) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <p className="text-neutral-600">로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (error && !trade) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <p className="text-red-600">{error}</p>
          <button onClick={() => refetch()} className="mt-4 underline">
            다시 시도
          </button>
        </div>
      </Layout>
    );
  }

  if (!trade || !editedTrade) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <p className="text-neutral-600">거래를 찾을 수 없습니다</p>
        </div>
      </Layout>
    );
  }

  const displayTrade = isEditing ? editedTrade : trade;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
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
                <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
                  <button
                    onClick={() => setDeleteModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>삭제</span>
                  </button>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>거래 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        정말로 이 거래를 삭제하시겠습니까? 삭제된 내용은 복구할 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <button
                        type="button"
                        onClick={handleDelete}
                        className="inline-flex items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                      >
                        삭제
                      </button>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
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
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-neutral-200">
              <div className="flex items-start justify-between mb-4">
                <h1 className="text-3xl font-semibold text-neutral-900">{displayTrade.ticker}</h1>
                <div
                  className={`text-right ${
                    displayTrade.tradeStatus === 'OPEN'
                      ? 'text-amber-600'
                      : displayTrade.profitLoss >= 0
                        ? 'text-green-600'
                        : 'text-red-600'
                  }`}
                >
                  <div className="flex items-center gap-2 justify-end mb-1">
                    {displayTrade.tradeStatus === 'OPEN' ? null : displayTrade.profitLoss >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-3xl font-semibold">
                    {displayTrade.tradeStatus === 'OPEN'
                      ? '미청산'
                      : `${displayTrade.profitLoss >= 0 ? '+' : ''}${formatCurrency(displayTrade.profitLoss, displayTrade.market)}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Calendar className="w-4 h-4" />
                <span>
                  {new Date(displayTrade.date).toLocaleDateString('ko-KR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 mt-3 text-sm">
                <div>
                  <span className="text-neutral-500">거래 방향</span>
                  <span className="ml-2 font-medium text-neutral-800">
                    {isEditing ? (
                      <select
                        value={editedTrade.tradeDirection ?? 'LONG'}
                        onChange={(e) =>
                          setEditedTrade({
                            ...editedTrade,
                            tradeDirection: e.target.value as TradeDirection,
                          })
                        }
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="LONG">롱</option>
                        <option value="SHORT">숏</option>
                      </select>
                    ) : (
                      TRADE_DIRECTION_LABELS[displayTrade.tradeDirection ?? 'LONG'] ?? displayTrade.tradeDirection
                    )}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500">시장 구분</span>
                  <span className="ml-2 font-medium text-neutral-800">
                    {isEditing ? (
                      <select
                        value={editedTrade.marketType ?? 'US_STOCK'}
                        onChange={(e) =>
                          setEditedTrade({
                            ...editedTrade,
                            marketType: e.target.value as MarketType,
                          })
                        }
                        className="border border-neutral-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="US_STOCK">미국주식</option>
                        <option value="KOREA_STOCK">한국주식</option>
                        <option value="CRYPTO">코인</option>
                      </select>
                    ) : (
                      MARKET_TYPE_LABELS[displayTrade.marketType ?? 'US_STOCK'] ?? displayTrade.marketType
                    )}
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">진입가</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedTrade.entryPrice}
                      onChange={(e) =>
                        setEditedTrade({ ...editedTrade, entryPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="text-2xl font-semibold text-neutral-900 border-b-2 border-blue-500 focus:outline-none w-full"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-neutral-900">
                      {formatCurrency(displayTrade.entryPrice, displayTrade.market)}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-2">청산가</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={editedTrade.exitPrice || ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setEditedTrade({
                          ...editedTrade,
                          exitPrice: v === '' ? 0 : parseFloat(v) || 0,
                        });
                      }}
                      placeholder="미청산이면 비움"
                      className="text-2xl font-semibold text-neutral-900 border-b-2 border-blue-500 focus:outline-none w-full"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-neutral-900">
                      {displayTrade.tradeStatus === 'OPEN' ? '미청산' : formatCurrency(displayTrade.exitPrice, displayTrade.market)}
                    </div>
                  )}
                </div>
                {(displayTrade.quantity != null || isEditing) && (
                  <div>
                    <label className="block text-sm font-medium text-neutral-600 mb-2">수량</label>
                    {isEditing ? (
                      <input
                        type="number"
                        step="1"
                        value={editedTrade.quantity ?? ''}
                        onChange={(e) =>
                          setEditedTrade({
                            ...editedTrade,
                            quantity: parseFloat(e.target.value) || undefined,
                          })
                        }
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
                  <label className="block text-sm font-medium text-neutral-600 mb-2">변동률</label>
                  <div
                    className={`text-2xl font-semibold ${
                      displayTrade.tradeStatus === 'OPEN'
                        ? 'text-amber-600'
                        : displayTrade.profitLoss >= 0
                          ? 'text-green-600'
                          : 'text-red-600'
                    }`}
                  >
                    {displayTrade.tradeStatus === 'OPEN'
                      ? '미청산'
                      : `${displayTrade.profitLoss >= 0 ? '+' : ''}${(
                          ((displayTrade.exitPrice - displayTrade.entryPrice) / displayTrade.entryPrice) *
                          100
                        ).toFixed(2)}%`}
                  </div>
                </div>
              </div>

              {(displayTrade.strategyTags?.length ?? 0) > 0 || isEditing ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-600 mb-2">전략 태그</label>
                  {isEditing ? (
                    <div className="flex flex-wrap gap-2">
                      {STRATEGY_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            const current = editedTrade.strategyTags ?? [];
                            const next = current.includes(opt.value)
                              ? current.filter((s) => s !== opt.value)
                              : [...current, opt.value];
                            setEditedTrade({ ...editedTrade, strategyTags: next });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            (editedTrade.strategyTags ?? []).includes(opt.value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(displayTrade.strategyTags ?? []).map((code) => (
                        <span
                          key={code}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-800 text-sm font-medium border border-blue-100"
                        >
                          {STRATEGY_OPTIONS.find((o) => o.value === code)?.label ?? code}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-600 mb-2">진입 근거</label>
                {isEditing ? (
                  <textarea
                    value={editedTrade.entryReason || ''}
                    onChange={(e) => setEditedTrade({ ...editedTrade, entryReason: e.target.value })}
                    placeholder="예: 돌파 후 거래량 증가 확인"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                ) : (
                  <p className="text-neutral-700 whitespace-pre-wrap">{displayTrade.entryReason || '-'}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-600 mb-2">청산 근거</label>
                {isEditing ? (
                  <textarea
                    value={editedTrade.exitReason || ''}
                    onChange={(e) => setEditedTrade({ ...editedTrade, exitReason: e.target.value })}
                    placeholder="예: 목표가 도달 후 분할 청산"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                ) : (
                  <p className="text-neutral-700 whitespace-pre-wrap">{displayTrade.exitReason || '-'}</p>
                )}
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-600 mb-2">복기 / 느낀점</label>
                {isEditing ? (
                  <textarea
                    value={editedTrade.tradeReflection || ''}
                    onChange={(e) => setEditedTrade({ ...editedTrade, tradeReflection: e.target.value })}
                    placeholder="예: 진입 타이밍은 좋았지만 익절이 너무 빨랐다"
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-neutral-700 whitespace-pre-wrap">{displayTrade.tradeReflection || '-'}</p>
                )}
              </div>
              {(displayTrade.memo != null && displayTrade.memo !== '') || isEditing ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-600 mb-2">기타 메모</label>
                  {isEditing ? (
                    <textarea
                      value={editedTrade.memo || ''}
                      onChange={(e) => setEditedTrade({ ...editedTrade, memo: e.target.value })}
                      className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  ) : (
                    <p className="text-neutral-700 whitespace-pre-wrap">{displayTrade.memo}</p>
                  )}
                </div>
              ) : null}
              {(mistakeTagList.length > 0 || displayTrade.mistakeTags?.length > 0 || isEditing) && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-neutral-600 mb-2">실수 태그</label>
                  {isEditing && mistakeTagList.length > 0 ? (
                    <>
                      <p className="text-xs text-neutral-500 mb-2">클릭하여 추가/제거</p>
                      <div className="flex flex-wrap gap-2 mb-2">
                        {mistakeTagList.map((tag) => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => toggleMistakeById(tag.id)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                              (editedTrade.mistakeTagIds ?? []).includes(tag.id)
                                ? 'bg-red-100 text-red-800 border border-red-200'
                                : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200'
                            }`}
                          >
                            {tag.label_ko}
                          </button>
                        ))}
                      </div>
                      {(editedTrade.mistakeTagIds ?? []).length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {(editedTrade.mistakeTagIds ?? []).map((tagId) => {
                            const tag = mistakeTagList.find((t) => t.id === tagId);
                            return tag ? (
                              <span
                                key={tagId}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium"
                              >
                                {tag.label_ko}
                                <button
                                  type="button"
                                  onClick={() => toggleMistakeById(tagId)}
                                  className="hover:bg-red-100 rounded p-0.5"
                                  aria-label="제거"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {(displayTrade.mistakeTags ?? []).length > 0 ? (
                        displayTrade.mistakeTags!.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200 text-sm font-medium"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-neutral-500 text-sm">선택된 실수 없음</span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          {(isEditing || displayTrade.chartImage) && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 md:p-8">
              <h2 className="text-lg font-semibold text-neutral-900 mb-4">차트 스크린샷</h2>
              {isEditing ? (
                <>
                  {editedTrade.chartImage ? (
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => setChartLightboxUrl(editedTrade.chartImage ?? null)}
                        className="block w-full text-left rounded-lg border border-neutral-200 overflow-hidden hover:ring-2 hover:ring-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <img
                          src={editedTrade.chartImage}
                          alt="차트 미리보기"
                          className="w-full max-h-72 object-contain mx-auto cursor-pointer"
                        />
                      </button>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => chartFileInputRef.current?.click()}
                          className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm font-medium"
                        >
                          변경
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setEditedTrade((prev) => (prev ? { ...prev, chartImage: null } : prev))
                          }
                          className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                        >
                          삭제
                        </button>
                      </div>
                      <input
                        ref={chartFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleChartFile(e.target.files[0])}
                      />
                    </div>
                  ) : (
                    <div
                      onDragEnter={handleChartDrag}
                      onDragLeave={handleChartDrag}
                      onDragOver={handleChartDrag}
                      onDrop={handleChartDrop}
                      onClick={() => chartFileInputRef.current?.click()}
                      className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100'
                      }`}
                    >
                      <input
                        ref={chartFileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && handleChartFile(e.target.files[0])}
                      />
                      <div className="flex justify-center">
                        {dragActive ? (
                          <Upload className="w-12 h-12 text-blue-500" />
                        ) : (
                          <ImageIcon className="w-12 h-12 text-neutral-400" />
                        )}
                      </div>
                      <p className="text-neutral-700 font-medium mt-2">차트 이미지를 붙여넣거나 업로드하세요</p>
                      <p className="text-sm text-neutral-500 mt-1">드래그하거나 클릭, 붙여넣기 (Ctrl+V)</p>
                    </div>
                  )}
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setChartLightboxUrl(displayTrade.chartImage ?? null)}
                  className="block w-full text-left rounded-lg border border-neutral-200 overflow-hidden hover:ring-2 hover:ring-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <img
                    src={displayTrade.chartImage}
                    alt="거래 차트"
                    className="w-full rounded-lg cursor-pointer"
                  />
                </button>
              )}
            </div>
          )}

          {chartLightboxUrl && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80"
              onClick={() => setChartLightboxUrl(null)}
              role="dialog"
              aria-modal="true"
              aria-label="차트 확대 보기"
            >
              <button
                type="button"
                onClick={() => setChartLightboxUrl(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="닫기"
              >
                <X className="w-6 h-6" />
              </button>
              <img
                src={chartLightboxUrl}
                alt="차트 확대"
                className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
