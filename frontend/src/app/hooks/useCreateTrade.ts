import { useState, useCallback } from 'react';
import { tradesApi } from '../api/endpoints';
import { mapTradeFromApi } from '../api/trades';
import type { Trade } from '../types/trade';
import type { TradeCreateRequest } from '../api/types';

export function useCreateTrade(): {
  createTrade: (payload: TradeCreateRequest) => Promise<Trade | null>;
  isLoading: boolean;
  error: string | null;
  resetError: () => void;
} {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTrade = useCallback(async (payload: TradeCreateRequest): Promise<Trade | null> => {
    setError(null);
    setIsLoading(true);
    try {
      const res = await tradesApi.create(payload);
      return mapTradeFromApi(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to create trade');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const resetError = useCallback(() => setError(null), []);

  return { createTrade, isLoading, error, resetError };
}
