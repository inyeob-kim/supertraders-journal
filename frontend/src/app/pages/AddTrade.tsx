import { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { useSymbolSearch } from '../hooks/useSymbolSearch';
import { useCreateTrade } from '../hooks/useCreateTrade';
import { mistakeTagsApi } from '../api/endpoints';
import type { SymbolSearchItem, MistakeTagItem } from '../api/types';
import type { TradeDirection, MarketType } from '../api/types';
import { formatCurrency } from '../utils/format';
import { Upload, ImageIcon, X } from 'lucide-react';

const TRADE_DIRECTIONS: { value: TradeDirection; label: string }[] = [
  { value: 'LONG', label: '롱' },
  { value: 'SHORT', label: '숏' },
];

const MARKET_TYPES: { value: MarketType; label: string }[] = [
  { value: 'US_STOCK', label: '미국주식' },
  { value: 'KOREA_STOCK', label: '한국주식' },
  { value: 'CRYPTO', label: '코인' },
];

const STRATEGY_OPTIONS = [
  { value: 'BREAKOUT', label: '돌파' },
  { value: 'PULLBACK', label: '눌림목' },
  { value: 'SUPPORT_BOUNCE', label: '지지 반등' },
  { value: 'MOMENTUM', label: '모멘텀' },
  { value: 'SWING', label: '스윙' },
  { value: 'DAY_TRADE', label: '데이 트레이드' },
  { value: 'SCALP', label: '스캘핑' },
  { value: 'NEWS_PLAY', label: '뉴스 플레이' },
];

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function computePnL(
  entryStr: string,
  exitStr: string,
  qtyStr: string,
  direction: TradeDirection
): { pnl: number; pnlPercent: number } | null {
  const entry = parseFloat(entryStr);
  const exit = exitStr.trim() === '' ? null : parseFloat(exitStr);
  const qty = parseFloat(qtyStr) || 1;
  if (isNaN(entry) || entry <= 0) return null;
  if (exit === null) return null;
  if (isNaN(exit)) return null;
  const priceDiff = exit - entry;
  const pnl = direction === 'LONG' ? priceDiff * qty : -priceDiff * qty;
  const pnlPercent = direction === 'LONG' ? (priceDiff / entry) * 100 : -(priceDiff / entry) * 100;
  return { pnl, pnlPercent };
}

export default function AddTrade() {
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolSearchItem | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [tradeDate, setTradeDate] = useState(todayISO());
  const [tradeDirection, setTradeDirection] = useState<TradeDirection>('LONG');
  const [marketType, setMarketType] = useState<MarketType>('US_STOCK');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [strategyTags, setStrategyTags] = useState<string[]>([]);
  const [mistakeTagIds, setMistakeTagIds] = useState<string[]>([]);
  const [mistakeTagList, setMistakeTagList] = useState<MistakeTagItem[]>([]);
  const [entryReason, setEntryReason] = useState('');
  const [exitReason, setExitReason] = useState('');
  const [tradeReflection, setTradeReflection] = useState('');
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { results, isLoading: searchLoading, search } = useSymbolSearch();
  const { createTrade, isLoading: createLoading, error: createError, resetError } = useCreateTrade();

  useEffect(() => {
    mistakeTagsApi.list().then((list) => setMistakeTagList(list)).catch(() => {});
  }, []);

  useEffect(() => {
    if (!searchInput.trim()) return;
    const t = setTimeout(() => search(searchInput, undefined, 15), 200);
    return () => clearTimeout(t);
  }, [searchInput, search]);

  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (ev) => setChartImage(ev.target?.result as string);
            reader.readAsDataURL(blob);
          }
          break;
        }
      }
    };
    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === 'dragenter' || e.type === 'dragover');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setChartImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const pnlResult = useMemo(
    () => computePnL(entryPrice, exitPrice, quantity, tradeDirection),
    [entryPrice, exitPrice, quantity, tradeDirection]
  );

  const totalInvestment = useMemo(() => {
    const entry = parseFloat(entryPrice);
    const qty = parseFloat(quantity) || 1;
    if (isNaN(entry) || entry <= 0) return null;
    return entry * qty;
  }, [entryPrice, quantity]);

  const handleSave = async (addAnother: boolean) => {
    resetError();
    if (!selectedSymbol) {
      alert('종목을 검색하여 선택해주세요.');
      return;
    }
    const entry = parseFloat(entryPrice);
    if (isNaN(entry)) {
      alert('진입가를 입력해주세요.');
      return;
    }
    const exitVal = exitPrice.trim() === '' ? null : parseFloat(exitPrice);
    if (exitVal !== null && isNaN(exitVal)) {
      alert('청산가를 올바르게 입력하거나 비워두세요 (미청산).');
      return;
    }

    const created = await createTrade({
      symbol_id: selectedSymbol.id,
      trade_date: tradeDate,
      trade_direction: tradeDirection,
      market_type: marketType,
      entry_price: entry,
      exit_price: exitVal ?? undefined,
      quantity: quantity ? parseFloat(quantity) : undefined,
      strategy_tags: strategyTags.length > 0 ? strategyTags : undefined,
      mistake_tag_ids: mistakeTagIds.length > 0 ? mistakeTagIds : undefined,
      entry_reason: entryReason || undefined,
      exit_reason: exitReason || undefined,
      trade_reflection: tradeReflection || undefined,
      chart_image_url: chartImage || undefined,
    });

    if (!created) return;

    if (addAnother) {
      setSelectedSymbol(null);
      setSearchInput('');
      setTradeDate(todayISO());
      setTradeDirection('LONG');
      setMarketType('US_STOCK');
      setEntryPrice('');
      setExitPrice('');
      setQuantity('');
      setStrategyTags([]);
      setMistakeTagIds([]);
      setEntryReason('');
      setExitReason('');
      setTradeReflection('');
      setChartImage(null);
    } else {
      navigate('/');
    }
  };

  const toggleStrategy = (value: string) => {
    setStrategyTags((prev) =>
      prev.includes(value) ? prev.filter((s) => s !== value) : [...prev, value]
    );
  };

  const toggleMistakeTag = (tagId: string) => {
    setMistakeTagIds((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const marketForCurrency = selectedSymbol?.market ?? (marketType === 'KOREA_STOCK' ? 'KR' : 'US');

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">매매 기록</h1>
          <p className="text-neutral-500 mt-2 text-base">새로운 매매를 기록합니다</p>
        </div>

        {createError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {createError}
          </div>
        )}

        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 md:p-8">
          <div className="space-y-6 mb-8">
            <div className="relative">
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">종목 *</label>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => {
                  setSearchInput(e.target.value);
                  setShowDropdown(true);
                  if (!e.target.value) setSelectedSymbol(null);
                }}
                onFocus={() => setShowDropdown(true)}
                onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                placeholder="종목 코드 또는 이름 검색 (예: AAPL, 삼성전자)"
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
              />
              {showDropdown && (searchInput.trim() || results.length > 0) && (
                <div className="absolute z-10 top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {searchLoading ? (
                    <div className="p-4 text-neutral-500">검색 중...</div>
                  ) : results.length === 0 ? (
                    <div className="p-4 text-neutral-500">검색 결과가 없습니다</div>
                  ) : (
                    results.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => {
                          setSelectedSymbol(s);
                          setSearchInput(s.symbol);
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-neutral-50 flex justify-between items-center"
                      >
                        <span className="font-medium">{s.symbol}</span>
                        <span className="text-sm text-neutral-500">
                          {s.name_kr || s.name_en || ''} · {s.market}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {selectedSymbol && (
                <div className="mt-2 flex items-center gap-2 text-sm text-green-700 font-medium">
                  선택: {selectedSymbol.symbol} {selectedSymbol.name_kr || selectedSymbol.name_en}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">거래 방향 *</label>
              <select
                value={tradeDirection}
                onChange={(e) => setTradeDirection(e.target.value as TradeDirection)}
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
              >
                {TRADE_DIRECTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">시장 구분 *</label>
              <select
                value={marketType}
                onChange={(e) => setMarketType(e.target.value as MarketType)}
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
              >
                {MARKET_TYPES.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">거래일 *</label>
              <input
                type="date"
                value={tradeDate}
                onChange={(e) => setTradeDate(e.target.value)}
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2.5">진입가 *</label>
                <input
                  type="number"
                  step="0.01"
                  value={entryPrice}
                  onChange={(e) => setEntryPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2.5">청산가 (미청산이면 비우기)</label>
                <input
                  type="number"
                  step="0.01"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="0.00 또는 비움"
                  className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">수량 (선택)</label>
              <input
                type="number"
                step="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="예: 100"
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
              />
            </div>

            {/* Trade summary box */}
            <div className="p-5 rounded-xl border-2 border-neutral-200 bg-neutral-50/80">
              <div className="text-sm font-semibold text-neutral-700 mb-3">거래 요약</div>
              <div className="space-y-2">
                {totalInvestment != null && (
                  <div className="flex justify-between items-center">
                    <span className="text-neutral-600">총 투자금</span>
                    <span className="font-semibold text-neutral-900">
                      {formatCurrency(totalInvestment, marketForCurrency)}
                    </span>
                  </div>
                )}
                {pnlResult !== null ? (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">손익</span>
                      <span
                        className={`font-bold ${
                          pnlResult.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {pnlResult.pnl >= 0 ? '+' : ''}
                        {formatCurrency(pnlResult.pnl, marketForCurrency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-neutral-600">수익률</span>
                      <span
                        className={`font-bold ${
                          pnlResult.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {pnlResult.pnlPercent >= 0 ? '+' : ''}
                        {pnlResult.pnlPercent.toFixed(2)}%
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="text-neutral-500 font-medium">미청산 포지션 (청산가 입력 시 자동 계산)</div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">전략 태그 (복수 선택)</label>
              <div className="flex flex-wrap gap-2">
                {STRATEGY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => toggleStrategy(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      strategyTags.includes(opt.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {strategyTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {strategyTags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
                    >
                      {STRATEGY_OPTIONS.find((o) => o.value === tag)?.label ?? tag}
                      <button
                        type="button"
                        onClick={() => setStrategyTags((p) => p.filter((s) => s !== tag))}
                        className="hover:opacity-70"
                        aria-label="제거"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {mistakeTagList.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2.5">실수 태그 (복수 선택)</label>
                <p className="text-xs text-neutral-500 mb-2">이번 매매에서 했던 실수가 있다면 선택하세요</p>
                <div className="flex flex-wrap gap-2">
                  {mistakeTagList.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleMistakeTag(tag.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        mistakeTagIds.includes(tag.id)
                          ? 'bg-red-100 text-red-800 border border-red-200'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200'
                      }`}
                    >
                      {tag.label_ko}
                    </button>
                  ))}
                </div>
                {mistakeTagIds.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {mistakeTagIds.map((id) => {
                      const tag = mistakeTagList.find((t) => t.id === id);
                      return tag ? (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-lg text-sm font-medium border border-red-100"
                        >
                          {tag.label_ko}
                          <button
                            type="button"
                            onClick={() => setMistakeTagIds((p) => p.filter((x) => x !== id))}
                            className="hover:opacity-70"
                            aria-label="제거"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">진입 근거</label>
              <textarea
                value={entryReason}
                onChange={(e) => setEntryReason(e.target.value)}
                placeholder="예: 돌파 후 거래량 증가 확인"
                rows={3}
                className="w-full px-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">청산 근거</label>
              <textarea
                value={exitReason}
                onChange={(e) => setExitReason(e.target.value)}
                placeholder="예: 목표가 도달 후 분할 청산"
                rows={3}
                className="w-full px-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">복기 / 느낀점</label>
              <textarea
                value={tradeReflection}
                onChange={(e) => setTradeReflection(e.target.value)}
                placeholder="예: 진입 타이밍은 좋았지만 익절이 너무 빨랐다"
                rows={3}
                className="w-full px-4 py-3.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-y"
              />
            </div>

            {entryPrice && (
              <div
                className={`p-5 rounded-xl border-2 ${
                  pnlResult !== null
                    ? pnlResult.pnl >= 0
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <div className="text-sm text-neutral-700 font-semibold mb-1.5">
                  {pnlResult !== null ? '손익' : '미청산 포지션'}
                </div>
                {pnlResult !== null ? (
                  <div
                    className={`text-3xl font-bold tracking-tight ${
                      pnlResult.pnl >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {pnlResult.pnl >= 0 ? '+' : ''}
                    {formatCurrency(pnlResult.pnl, marketForCurrency)}
                  </div>
                ) : (
                  <div className="text-amber-700 font-medium">청산가를 입력하면 손익이 계산됩니다</div>
                )}
                {pnlResult !== null && (
                  <div
                    className={`mt-1 text-lg font-semibold ${
                      pnlResult.pnlPercent >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    수익률: {pnlResult.pnlPercent >= 0 ? '+' : ''}
                    {pnlResult.pnlPercent.toFixed(2)}%
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mb-8">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">차트 스크린샷 (선택)</label>
            <div
              ref={dropZoneRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50'
                  : chartImage
                    ? 'border-green-500 bg-green-50'
                    : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                className="hidden"
              />
              {chartImage ? (
                <div className="space-y-4">
                  <img src={chartImage} alt="차트 미리보기" className="max-h-72 mx-auto rounded-xl shadow-lg" />
                  <p className="text-sm text-green-700 font-semibold">차트가 업로드되었습니다</p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setChartImage(null);
                    }}
                    className="text-sm text-neutral-600 hover:text-neutral-900 underline font-medium"
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-center">
                    {dragActive ? (
                      <Upload className="w-14 h-14 text-blue-500" />
                    ) : (
                      <ImageIcon className="w-14 h-14 text-neutral-400" />
                    )}
                  </div>
                  <p className="text-neutral-700 font-semibold text-base">
                    차트 이미지를 붙여넣거나 업로드하세요
                  </p>
                  <p className="text-sm text-neutral-500 mt-2 font-medium">드래그하거나 붙여넣기 (Ctrl+V)</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => handleSave(false)}
              disabled={createLoading}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createLoading ? '저장 중...' : '매매 저장'}
            </button>
            <button
              onClick={() => handleSave(true)}
              disabled={createLoading}
              className="flex-1 px-6 py-4 bg-white text-neutral-700 border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              저장 후 다음 거래
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
