import { useState, useEffect, useCallback } from 'react';
import { tradesApi } from '../api/endpoints';
import { mapTradeFromApi } from '../api/trades';
import type { Trade } from '../types/trade';

export interface UseTradesParams {
  page?: number;
  size?: number;
  startDate?: string;
  endDate?: string;
  symbol?: string;
  mistakeTagId?: string;
  sort?: 'newest' | 'oldest';
}

export interface UseTradesResult {
  items: Trade[];
  total: number;
  totalPages: number;
  page: number;
  size: number;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTrades(params: UseTradesParams = {}): UseTradesResult {
  const { page = 1, size = 20, startDate, endDate, symbol, mistakeTagId, sort = 'newest' } = params;
  const [items, setItems] = useState<Trade[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrades = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const pageSize = Math.min(Math.max(1, size), 100);
      const res = await tradesApi.list({
        page,
        size: pageSize,
        start_date: startDate,
        end_date: endDate,
        symbol,
        mistake_tag_id: mistakeTagId,
        sort,
      });
      setItems(res.items.map(mapTradeFromApi));
      setTotal(res.total);
      setTotalPages(res.total_pages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load trades');
      setItems([]);
      setTotal(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, startDate, endDate, symbol, mistakeTagId, sort]);

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  return {
    items,
    total,
    totalPages,
    page,
    size,
    isLoading,
    error,
    refetch: fetchTrades,
  };
}
