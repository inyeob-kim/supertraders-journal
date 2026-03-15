import { TradingProfile } from '../types/profile';

const PROFILE_STORAGE_KEY = 'trading_journal_profile';

const defaultProfile: TradingProfile = {
  tradingPrinciples: '',
  commonMistakes: [],
  tradingGoals: {
    dailyMaxLoss: '',
    monthlyTarget: '',
    riskPerTrade: '',
  },
  mindsetReminders: [],
  todayReminder: '',
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