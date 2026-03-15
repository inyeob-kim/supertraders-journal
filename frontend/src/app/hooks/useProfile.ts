import { useState, useEffect, useCallback } from 'react';
import { profileApi } from '../api/endpoints';
import type { UserProfileResponse, UserProfileUpsertRequest } from '../api/types';
import type { TradingProfile } from '../types/profile';
import { ApiError } from '../api/client';

function mapProfileFromApi(p: UserProfileResponse): TradingProfile {
  return {
    tradingPrinciples: p.trading_principles ?? '',
    commonMistakes: p.common_mistakes ?? [],
    tradingProcess: p.trading_process ?? [],
    tradingGoals: {
      dailyMaxLoss: p.daily_max_loss_pct != null ? `${p.daily_max_loss_pct}%` : '',
      monthlyTarget: p.monthly_target_return_pct != null ? `${p.monthly_target_return_pct}%` : '',
      riskPerTrade: p.risk_per_trade_pct != null ? `${p.risk_per_trade_pct}%` : '',
    },
    mindsetReminders: p.mindset_quotes ? p.mindset_quotes.split('\n').filter(Boolean) : [],
    todayReminder: p.rule_of_the_day ?? '',
  };
}

export function useProfile(): {
  profile: TradingProfile | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateProfile: (updates: Partial<TradingProfile>) => Promise<void>;
} {
  const [profile, setProfile] = useState<TradingProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await profileApi.get();
      setProfile(mapProfileFromApi(res));
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setProfile({
          tradingPrinciples: '',
          commonMistakes: [],
          tradingProcess: [],
          tradingGoals: { dailyMaxLoss: '', monthlyTarget: '', riskPerTrade: '' },
          mindsetReminders: [],
          todayReminder: '',
        });
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load profile');
        setProfile(null);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const updateProfile = useCallback(async (updates: Partial<TradingProfile>) => {
    const body: UserProfileUpsertRequest = {};
    if (updates.tradingPrinciples !== undefined) body.trading_principles = updates.tradingPrinciples;
    if (updates.todayReminder !== undefined) body.rule_of_the_day = updates.todayReminder;
    if (updates.commonMistakes !== undefined) body.common_mistakes = updates.commonMistakes;
    if (updates.tradingProcess !== undefined) body.trading_process = updates.tradingProcess;
    if (updates.mindsetReminders !== undefined)
      body.mindset_quotes = updates.mindsetReminders.join('\n') || null;
    if (updates.tradingGoals) {
      if (updates.tradingGoals.dailyMaxLoss !== undefined)
        body.daily_max_loss_pct = parsePct(updates.tradingGoals.dailyMaxLoss);
      if (updates.tradingGoals.monthlyTarget !== undefined)
        body.monthly_target_return_pct = parsePct(updates.tradingGoals.monthlyTarget);
      if (updates.tradingGoals.riskPerTrade !== undefined)
        body.risk_per_trade_pct = parsePct(updates.tradingGoals.riskPerTrade);
    }
    const res = await profileApi.patch(body);
    setProfile(mapProfileFromApi(res));
  }, []);

  return {
    profile,
    isLoading,
    error,
    refetch: fetchProfile,
    updateProfile,
  };
}

function parsePct(s: string): number | null {
  const n = parseFloat(s.replace(/[%\s]/g, ''));
  return isNaN(n) ? null : n;
}
