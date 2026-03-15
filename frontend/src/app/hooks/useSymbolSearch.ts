import { useState, useCallback } from 'react';
import { symbolsApi } from '../api/endpoints';
import type { SymbolSearchItem } from '../api/types';

export function useSymbolSearch(): {
  results: SymbolSearchItem[];
  isLoading: boolean;
  error: string | null;
  search: (q: string, market?: string, limit?: number) => Promise<void>;
} {
  const [results, setResults] = useState<SymbolSearchItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (q: string, market?: string, limit = 10) => {
    setError(null);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const data = await symbolsApi.search({ q: q.trim(), market, limit });
      setResults(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { results, isLoading, error, search };
}
