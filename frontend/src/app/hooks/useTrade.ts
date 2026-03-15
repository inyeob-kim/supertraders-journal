import { useState, useEffect, useCallback } from 'react';
import { tradesApi } from '../api/endpoints';
import { mapTradeFromApi } from '../api/trades';
import type { Trade } from '../types/trade';

export function useTrade(tradeId: string | undefined): {
  trade: Trade | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  updateTrade: (updates: Partial<Trade>) => Promise<void>;
  deleteTrade: () => Promise<void>;
} {
  const [trade, setTrade] = useState<Trade | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrade = useCallback(async () => {
    if (!tradeId) {
      setTrade(null);
      setIsLoading(false);
      return;
    }
    setError(null);
    setIsLoading(true);
    try {
      const res = await tradesApi.get(tradeId);
      setTrade(mapTradeFromApi(res));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trade');
      setTrade(null);
    } finally {
      setIsLoading(false);
    }
  }, [tradeId]);

  useEffect(() => {
    fetchTrade();
  }, [fetchTrade]);

  const updateTrade = useCallback(
    async (updates: Partial<Trade>) => {
      if (!tradeId || !trade) return;
      const exitPrice =
        updates.exitPrice !== undefined
          ? updates.exitPrice === 0 && trade.tradeStatus === 'OPEN'
            ? null
            : updates.exitPrice
          : undefined;
      const res = await tradesApi.update(tradeId, {
        trade_date: updates.date,
        trade_direction: updates.tradeDirection,
        market_type: updates.marketType,
        entry_price: updates.entryPrice,
        exit_price: exitPrice,
        quantity: updates.quantity,
        strategy_tags: updates.strategyTags,
        entry_reason: updates.entryReason,
        exit_reason: updates.exitReason,
        trade_reflection: updates.tradeReflection,
        memo: updates.memo,
        mistake_tag_ids: updates.mistakeTagIds ?? trade.mistakeTagIds,
        chart_image_url: updates.chartImage,
      });
      setTrade(mapTradeFromApi(res));
    },
    [tradeId, trade]
  );

  const deleteTrade = useCallback(async () => {
    if (!tradeId) return;
    await tradesApi.delete(tradeId);
    setTrade(null);
  }, [tradeId]);

  return {
    trade,
    isLoading,
    error,
    refetch: fetchTrade,
    updateTrade,
    deleteTrade,
  };
}
