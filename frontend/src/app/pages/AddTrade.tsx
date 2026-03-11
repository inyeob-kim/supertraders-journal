import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Layout from '../components/Layout';
import { saveTrade } from '../utils/storage';
import { MistakeTag } from '../types/trade';
import { Upload, Check, Image as ImageIcon } from 'lucide-react';

const mistakeTags: MistakeTag[] = ['FOMO', '손절 지연', '추격 매수', '감정 매매', '과신'];

export default function AddTrade() {
  const navigate = useNavigate();
  const [ticker, setTicker] = useState('');
  const [entryPrice, setEntryPrice] = useState('');
  const [exitPrice, setExitPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [memo, setMemo] = useState('');
  const [selectedMistakes, setSelectedMistakes] = useState<MistakeTag[]>([]);
  const [chartImage, setChartImage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Handle clipboard paste
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            const reader = new FileReader();
            reader.onload = (event) => {
              setChartImage(event.target?.result as string);
            };
            reader.readAsDataURL(blob);
          }
        }
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  }, []);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setChartImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const toggleMistake = (tag: MistakeTag) => {
    setSelectedMistakes(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const calculateProfitLoss = () => {
    const entry = parseFloat(entryPrice);
    const exit = parseFloat(exitPrice);
    const qty = parseFloat(quantity) || 1;
    
    if (isNaN(entry) || isNaN(exit)) return 0;
    return (exit - entry) * qty;
  };

  const handleSave = (addAnother = false) => {
    if (!ticker || !entryPrice || !exitPrice) {
      alert('종목 코드, 진입가, 청산가를 입력해주세요');
      return;
    }

    const trade = {
      id: `trade-${Date.now()}`,
      ticker: ticker.toUpperCase(),
      entryPrice: parseFloat(entryPrice),
      exitPrice: parseFloat(exitPrice),
      quantity: quantity ? parseFloat(quantity) : undefined,
      memo: memo || undefined,
      mistakeTags: selectedMistakes,
      chartImage: chartImage || undefined,
      date: new Date().toISOString(),
      profitLoss: calculateProfitLoss(),
    };

    saveTrade(trade);

    if (addAnother) {
      // Reset form
      setTicker('');
      setEntryPrice('');
      setExitPrice('');
      setQuantity('');
      setMemo('');
      setSelectedMistakes([]);
      setChartImage(null);
    } else {
      navigate('/');
    }
  };

  const profitLoss = calculateProfitLoss();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-8">
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 tracking-tight">매매 기록</h1>
          <p className="text-neutral-500 mt-2 text-base">새로운 매매를 기록합니다</p>
        </div>

        <div className="bg-white rounded-2xl border border-neutral-200/80 shadow-sm p-6 md:p-8">
          {/* Trade Details */}
          <div className="space-y-6 mb-8">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">
                종목 코드 *
              </label>
              <input
                type="text"
                value={ticker}
                onChange={(e) => setTicker(e.target.value)}
                placeholder="예: 삼성전자 / AAPL"
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-medium transition-all"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2.5">
                  진입가 *
                </label>
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
                <label className="block text-sm font-semibold text-neutral-700 mb-2.5">
                  청산가 *
                </label>
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">
                수량 (선택)
              </label>
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
              <label className="block text-sm font-semibold text-neutral-700 mb-2.5">
                메모 (선택)
              </label>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="예: 좋은 자리, 확인 후 진입"
                className="w-full px-4 py-3.5 md:py-4 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>

            {/* P/L Preview */}
            {entryPrice && exitPrice && (
              <div className={`p-5 rounded-xl border-2 ${
                profitLoss >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
              }`}>
                <div className="text-sm text-neutral-700 font-semibold mb-1.5">수익/손실</div>
                <div className={`text-3xl font-bold tracking-tight ${
                  profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)}
                </div>
              </div>
            )}
          </div>

          {/* Mistake Tags */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              실수 태그 (선택)
            </label>
            <div className="flex flex-wrap gap-2.5">
              {mistakeTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleMistake(tag)}
                  className={`px-4 py-2.5 md:py-3 rounded-xl border-2 transition-all font-medium ${
                    selectedMistakes.includes(tag)
                      ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20'
                      : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-400 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {selectedMistakes.includes(tag) && (
                      <Check className="w-4 h-4" />
                    )}
                    <span>{tag}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Chart Upload */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-neutral-700 mb-3">
              차트 스크린샷 (선택)
            </label>
            <div
              ref={dropZoneRef}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-10 md:p-14 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-blue-500 bg-blue-50 shadow-lg shadow-blue-500/10'
                  : chartImage
                  ? 'border-green-500 bg-green-50 shadow-md shadow-green-500/10'
                  : 'border-neutral-300 bg-neutral-50 hover:border-neutral-400 hover:bg-neutral-100'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              {chartImage ? (
                <div className="space-y-4">
                  <img
                    src={chartImage}
                    alt="Chart preview"
                    className="max-h-72 mx-auto rounded-xl shadow-lg"
                  />
                  <p className="text-sm text-green-700 font-semibold">
                    차트가 업로드되었습니다
                  </p>
                  <button
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
                  <div>
                    <p className="text-neutral-700 font-semibold text-base">
                      차트 이미지를 붙여넣거나 업로드하세요
                    </p>
                    <p className="text-sm text-neutral-500 mt-2 font-medium">
                      드래그하거나 붙여넣기 (Ctrl+V)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col md:flex-row gap-3">
            <button
              onClick={() => handleSave(false)}
              className="flex-1 px-6 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all font-semibold shadow-lg shadow-blue-600/20 hover:shadow-xl hover:shadow-blue-600/30 active:scale-[0.98]"
            >
              매매 저장
            </button>
            <button
              onClick={() => handleSave(true)}
              className="flex-1 px-6 py-4 bg-white text-neutral-700 border-2 border-neutral-300 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 transition-all font-semibold active:scale-[0.98]"
            >
              저장 후 다음 거래
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}