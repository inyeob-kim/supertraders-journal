import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { useSymbolSearch } from '../hooks/useSymbolSearch';
import { useCreateTrade } from '../hooks/useCreateTrade';
import type { SymbolSearchItem } from '../api/types';
import { formatCurrency } from '../utils/format';
import { Upload, ImageIcon } from 'lucide-react';

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function AddTrade() {
  const navigate = useNavigate();
  const [selectedSymbol, setSelectedSymbol] = useState<SymbolSearchItem | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [tradeDate, setTradeDate] = useState(todayISO());
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [memo, setMemo] = useState('');
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const { results, isLoading: searchLoading, search } = useSymbolSearch();
  const { createTrade, isLoading: createLoading, error: createError, resetError } = useCreateTrade();

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

  const handleSave = async (addAnother: boolean) => {
    resetError();
    if (!selectedSymbol) {
      alert('종목을 검색하여 선택해주세요.');
      return;
    }
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    if (isNaN(entry) || isNaN(exit)) {
      alert('진입가와 청산가를 입력해주세요.');
      return;
    }

    const created = await createTrade({
      symbol_id: selectedSymbol.id,
      trade_date: tradeDate,
      entry_price: entry,
      exit_price: exit,
      quantity: quantity ? parseFloat(quantity) : undefined,
      memo: memo || undefined,
      chart_image_url: chartImage || undefined,
    });

    if (!created) return;

    if (addAnother) {
      setSelectedSymbol(null);
      setSearchInput('');
      setTradeDate(todayISO());
      setEntryPrice('');
      setExitPrice('');
      setQuantity('');
      setMemo('');
      setChartImage(null);
    } else {
      navigate('/');
    }
  };

  const profitLoss =
    entryPrice && exitPrice
      ? (parseFloat(exitPrice) - parseFloat(entryPrice)) * (parseFloat(quantity) || 1)
      : 0;

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
                <label className="block text-sm font-semibold text-neutral-700 mb-2.5">청산가 *</label>
                <input
                  type="number"
                  step="0.01"
                  value={exitPrice}
                  onChange={(e) => setExitPrice(e.target.value)}
                  placeholder="0.00"
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
                placeholder="e.g., 100"
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">메모 (선택)</label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 좋은 자리, 확인 후 진입"
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {entryPrice && exitPrice && (
              <div
                className={`p-5 rounded-xl border-2 ${
                  profitLoss >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="text-sm text-neutral-700 font-semibold mb-1.5">수익/손실</div>
                <div
                  className={`text-3xl font-bold tracking-tight ${
                    profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss, selectedSymbol?.market)}
                </div>
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
                  <img src={chartImage} alt="Chart preview" className="max-h-72 mx-auto rounded-xl shadow-lg" />
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
