import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import Layout from '../components/Layout';
import { useTrade } from '../hooks/useTrade';
import type { Trade, MistakeTag } from '../types/trade';
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
import { ArrowLeft, Edit2, Trash2, Calendar, TrendingUp, TrendingDown, Upload, ImageIcon } from 'lucide-react';

export default function TradeDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { trade, isLoading, error, updateTrade, deleteTrade, refetch } = useTrade(id);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTrade, setEditedTrade] = useState<Trade | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const chartFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (trade) setEditedTrade(trade);
  }, [trade]);

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
    const profitLoss = (editedTrade.exitPrice - editedTrade.entryPrice) * (editedTrade.quantity || 1);
    await updateTrade({
      ...editedTrade,
      profitLoss,
      mistakeTagIds: editedTrade.mistakeTagIds ?? trade.mistakeTagIds,
    });
    setIsEditing(false);
    refetch();
  };

  const toggleMistake = (tag: MistakeTag) => {
    if (!isEditing || !editedTrade) return;
    setEditedTrade({
      ...editedTrade,
      mistakeTags: editedTrade.mistakeTags.includes(tag)
        ? editedTrade.mistakeTags.filter((t) => t !== tag)
        : [...editedTrade.mistakeTags, tag],
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
                <div className={`text-right ${displayTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  <div className="flex items-center gap-2 justify-end mb-1">
                    {displayTrade.profitLoss >= 0 ? (
                      <TrendingUp className="w-5 h-5" />
                    ) : (
                      <TrendingDown className="w-5 h-5" />
                    )}
                  </div>
                  <div className="text-3xl font-semibold">
                    {displayTrade.profitLoss >= 0 ? '+' : ''}{formatCurrency(displayTrade.profitLoss, displayTrade.market)}
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
                      value={editedTrade.exitPrice}
                      onChange={(e) =>
                        setEditedTrade({ ...editedTrade, exitPrice: parseFloat(e.target.value) || 0 })
                      }
                      className="text-2xl font-semibold text-neutral-900 border-b-2 border-blue-500 focus:outline-none w-full"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-neutral-900">
                      {formatCurrency(displayTrade.exitPrice, displayTrade.market)}
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
                      displayTrade.profitLoss >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {displayTrade.profitLoss >= 0 ? '+' : ''}
                    {(
                      ((displayTrade.exitPrice - displayTrade.entryPrice) / displayTrade.entryPrice) *
                      100
                    ).toFixed(2)}
                    %
                  </div>
                </div>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-neutral-600 mb-2">메모</label>
                {isEditing ? (
                  <textarea
                    value={editedTrade.memo || ''}
                    onChange={(e) => setEditedTrade({ ...editedTrade, memo: e.target.value })}
                    className="w-full p-3 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                ) : (
                  <p className="text-neutral-700">{displayTrade.memo || '-'}</p>
                )}
              </div>
              {displayTrade.mistakeTags.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-neutral-600 mb-3">실수 태그</label>
                  <div className="flex flex-wrap gap-2">
                    {displayTrade.mistakeTags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-2 rounded-lg bg-red-50 text-red-700 border border-red-200"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
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
                      <img
                        src={editedTrade.chartImage}
                        alt="Chart preview"
                        className="w-full max-h-72 object-contain mx-auto rounded-lg border border-neutral-200"
                      />
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
                            setEditedTrade((prev) => (prev ? { ...prev, chartImage: undefined } : prev))
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
                <img
                  src={displayTrade.chartImage}
                  alt="Trade chart"
                  className="w-full rounded-lg border border-neutral-200"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
