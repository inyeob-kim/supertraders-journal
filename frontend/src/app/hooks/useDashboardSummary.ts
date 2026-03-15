import { useState, useEffect, useCallback } from 'react';
import { dashboardApi } from '../api/endpoints';
import type { DashboardSummaryResponse } from '../api/types';
import { mapTradeFromApi } from '../api/trades';
import type { Trade } from '../types/trade';

export type DashboardRange = 'today' | 'week' | 'month' | 'all';

export interface DashboardSummaryState {
  range: string;
  summary: {
    total_trades: number;
    win_rate: number;
    total_pnl_amount: number;
    total_pnl_amount_krw: number;
    total_pnl_amount_usd: number;
    trade_count_krw: number;
    trade_count_usd: number;
  };
  recentTrades: Trade[];
  mistakeStats: Array<{ label_ko: string; count: number; percentage: number }>;
  ruleOfTheDay: string | null;
}

export function useDashboardSummary(
  range: DashboardRange = 'week'
): {
  data: DashboardSummaryState | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [data, setData] = useState<DashboardSummaryState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const res: DashboardSummaryResponse = await dashboardApi.getSummary(range);
      const totalPnl = Number(res.summary?.total_pnl_amount);
      const winRate = Number(res.summary?.win_rate);
      const totalTrades = Number(res.summary?.total_trades) || 0;
      const totalPnlKrw = Number(res.summary?.total_pnl_amount_krw);
      const totalPnlUsd = Number(res.summary?.total_pnl_amount_usd);
      const tradeCountKrw = Number(res.summary?.trade_count_krw) || 0;
      const tradeCountUsd = Number(res.summary?.trade_count_usd) || 0;
      setData({
        range: res.range,
        summary: {
          total_trades: totalTrades,
          win_rate: Number.isFinite(winRate) ? winRate : 0,
          total_pnl_amount: Number.isFinite(totalPnl) ? totalPnl : 0,
          total_pnl_amount_krw: Number.isFinite(totalPnlKrw) ? totalPnlKrw : 0,
          total_pnl_amount_usd: Number.isFinite(totalPnlUsd) ? totalPnlUsd : 0,
          trade_count_krw: tradeCountKrw,
          trade_count_usd: tradeCountUsd,
        },
        recentTrades: res.recent_trades.map(mapTradeFromApi),
        mistakeStats: res.mistake_stats.map((s) => ({
          label_ko: s.label_ko,
          count: s.count,
          percentage: s.percentage,
        })),
        ruleOfTheDay: res.rule_of_the_day,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load dashboard');
      setData(null);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  return { data, isLoading, error, refetch: fetchSummary };
}
