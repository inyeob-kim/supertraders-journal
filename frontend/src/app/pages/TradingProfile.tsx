import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useProfile } from '../hooks/useProfile';
import { mistakeTagsApi } from '../api/endpoints';
import type { TradingProfile } from '../types/profile';
import type { MistakeTagItem } from '../api/types';
import { Lightbulb, Target, AlertTriangle, BookOpen, Star, X, Plus, Edit2, Check } from 'lucide-react';

export default function TradingProfilePage() {
  const { profile: fetchedProfile, isLoading, error, updateProfile, refetch } = useProfile();
  const [profile, setProfile] = useState<TradingProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newMistake, setNewMistake] = useState('');
  const [newReminder, setNewReminder] = useState('');
  const [mistakeTagList, setMistakeTagList] = useState<MistakeTagItem[]>([]);

  useEffect(() => {
    if (fetchedProfile) setProfile(fetchedProfile);
  }, [fetchedProfile]);

  useEffect(() => {
    mistakeTagsApi
      .list()
      .then((list) => setMistakeTagList(list))
      .catch(() => setMistakeTagList([]));
  }, []);

  if (isLoading && !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <p className="text-neutral-600">로딩 중...</p>
        </div>
      </Layout>
    );
  }

  if (error && !profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <p className="text-red-600">{error}</p>
          <button onClick={() => refetch()} className="mt-4 underline">다시 시도</button>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <p className="text-neutral-600">프로필을 불러올 수 없습니다</p>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    await updateProfile(profile);
    setIsEditing(false);
  };

  const addMistake = () => {
    if (newMistake.trim() && !profile.commonMistakes.includes(newMistake.trim())) {
      setProfile({
        ...profile,
        commonMistakes: [...profile.commonMistakes, newMistake.trim()],
      });
      setNewMistake('');
    }
  };

  const addMistakeFromPill = (label: string) => {
    if (label && !profile.commonMistakes.includes(label)) {
      setProfile({
        ...profile,
        commonMistakes: [...profile.commonMistakes, label],
      });
    }
  };

  const removeMistake = (mistake: string) => {
    setProfile({
      ...profile,
      commonMistakes: profile.commonMistakes.filter(m => m !== mistake),
    });
  };

  const addReminder = () => {
    if (newReminder.trim()) {
      setProfile({
        ...profile,
        mindsetReminders: [...profile.mindsetReminders, newReminder.trim()],
      });
      setNewReminder('');
    }
  };

  const removeReminder = (index: number) => {
    setProfile({
      ...profile,
      mindsetReminders: profile.mindsetReminders.filter((_, i) => i !== index),
    });
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-neutral-900">매매 원칙</h1>
            <p className="text-neutral-600 mt-1">나만의 매매 규칙과 마인드셋</p>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <Edit2 className="w-4 h-4" />
              <span className="hidden md:inline">수정</span>
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => {
                  refetch();
                  setIsEditing(false);
                }}
                className="px-4 py-2 text-neutral-700 border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Check className="w-4 h-4" />
                <span>저장</span>
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {/* Today's Reminder - Highlight Card */}
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 md:p-8 text-white shadow-lg">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                <Star className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold mb-2">오늘의 원칙</h2>
                {isEditing ? (
                  <input
                    type="text"
                    value={profile.todayReminder}
                    onChange={(e) => setProfile({ ...profile, todayReminder: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                    placeholder="오늘의 매매 원칙을 입력하세요..."
                  />
                ) : (
                  <p className="text-lg">{profile.todayReminder}</p>
                )}
              </div>
            </div>
          </div>

          {/* Trading Principles */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-neutral-700" />
                <h2 className="font-semibold text-neutral-900">나의 매매 규칙</h2>
              </div>
            </div>
            <div className="p-6">
              {isEditing ? (
                <textarea
                  value={profile.tradingPrinciples}
                  onChange={(e) => setProfile({ ...profile, tradingPrinciples: e.target.value })}
                  rows={8}
                  className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="- 항상 손절가를 지킨다&#10;- 무분별한 추격 매수 금지&#10;- 자본 보호가 최우선&#10;- 계획을 준수한다"
                />
              ) : (
                <div className="prose prose-neutral max-w-none">
                  <pre className="whitespace-pre-wrap text-neutral-700 font-sans text-base leading-relaxed">
                    {profile.tradingPrinciples}
                  </pre>
                </div>
              )}
            </div>
          </div>

          {/* Trading Goals */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-neutral-700" />
                <h2 className="font-semibold text-neutral-900">매매 목표</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    일일 최대 손실
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.tradingGoals.dailyMaxLoss}
                      onChange={(e) => setProfile({
                        ...profile,
                        tradingGoals: { ...profile.tradingGoals, dailyMaxLoss: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="-2%"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-red-600">
                      {profile.tradingGoals.dailyMaxLoss}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    월간 목표 수익률
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.tradingGoals.monthlyTarget}
                      onChange={(e) => setProfile({
                        ...profile,
                        tradingGoals: { ...profile.tradingGoals, monthlyTarget: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="5%"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-green-600">
                      {profile.tradingGoals.monthlyTarget}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    거래당 리스크
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.tradingGoals.riskPerTrade}
                      onChange={(e) => setProfile({
                        ...profile,
                        tradingGoals: { ...profile.tradingGoals, riskPerTrade: e.target.value }
                      })}
                      className="w-full px-4 py-3 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="1%"
                    />
                  ) : (
                    <div className="text-2xl font-semibold text-neutral-900">
                      {profile.tradingGoals.riskPerTrade}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Common Mistakes */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-neutral-700" />
                <h2 className="font-semibold text-neutral-900">피해야 할 실수</h2>
              </div>
            </div>
            <div className="p-6">
              {isEditing && mistakeTagList.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-neutral-600 mb-2">대표적인 실수 (클릭하여 추가)</p>
                  <div className="flex flex-wrap gap-2">
                    {mistakeTagList.map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => addMistakeFromPill(tag.label_ko)}
                        disabled={profile.commonMistakes.includes(tag.label_ko)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                          profile.commonMistakes.includes(tag.label_ko)
                            ? 'bg-red-100 text-red-800 border border-red-200 cursor-default'
                            : 'bg-neutral-100 text-neutral-700 border border-neutral-200 hover:bg-neutral-200 hover:border-neutral-300 cursor-pointer'
                        }`}
                      >
                        {tag.label_ko}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2 mb-4">
                {profile.commonMistakes.map((mistake) => (
                  <span
                    key={mistake}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-red-50 text-red-700 border border-red-200 text-sm font-medium"
                  >
                    {mistake}
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => removeMistake(mistake)}
                        className="hover:bg-red-100 rounded-full p-0.5 transition-colors"
                        aria-label="삭제"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </span>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMistake}
                    onChange={(e) => setNewMistake(e.target.value)}
                    onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addMistake();
                    }
                  }}
                    placeholder="직접 입력하여 추가..."
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addMistake}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>추가</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mindset Reminders */}
          <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
            <div className="p-6 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-neutral-700" />
                <h2 className="font-semibold text-neutral-900">마인드셋 리마인더</h2>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3 mb-4">
                {profile.mindsetReminders.map((reminder, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 rounded-xl bg-neutral-50 border border-neutral-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-semibold text-blue-700">{index + 1}</span>
                    </div>
                    <p className="flex-1 text-neutral-700 leading-relaxed">{reminder}</p>
                    {isEditing && (
                      <button
                        onClick={() => removeReminder(index)}
                        className="hover:bg-neutral-200 rounded p-1 transition-colors flex-shrink-0"
                      >
                        <X className="w-4 h-4 text-neutral-600" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {isEditing && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newReminder}
                    onChange={(e) => setNewReminder(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addReminder()}
                    placeholder="새로운 마인드셋 추가..."
                    className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={addReminder}
                    className="flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    <span>추가</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}