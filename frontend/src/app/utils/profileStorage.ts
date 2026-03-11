import { TradingProfile } from '../types/profile';

const PROFILE_STORAGE_KEY = 'trading_journal_profile';

const defaultProfile: TradingProfile = {
  tradingPrinciples: `- 항상 손절가를 지킨다
- 무분별한 추격 매수 금지
- 자본 보호가 최우선
- 계획을 준수한다`,
  commonMistakes: ['FOMO', '손절 지연', '추격 매수', '감정 매매', '과신'],
  tradingGoals: {
    dailyMaxLoss: '-2%',
    monthlyTarget: '5%',
    riskPerTrade: '1%',
  },
  mindsetReminders: [
    '시장은 자만을 응징한다.',
    '손실은 빠르게 정리한다.',
    '리스크를 존중한다.',
  ],
  todayReminder: '손절가를 지켜라.',
};

export const getProfile = (): TradingProfile => {
  if (typeof window === 'undefined') return defaultProfile;
  
  const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(defaultProfile));
    return defaultProfile;
  }
  
  return JSON.parse(stored);
};

export const saveProfile = (profile: TradingProfile): void => {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
};