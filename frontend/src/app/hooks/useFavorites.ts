import { useState, useEffect, useCallback } from 'react';
import { symbolsApi } from '../api/endpoints';
import type { FavoriteSymbolResponse } from '../api/types';

export function useFavorites(): {
  favorites: FavoriteSymbolResponse[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addFavorite: (symbolId: string) => Promise<void>;
  removeFavorite: (symbolId: string) => Promise<void>;
} {
  const [favorites, setFavorites] = useState<FavoriteSymbolResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    setError(null);
    setIsLoading(true);
    try {
      const data = await symbolsApi.getFavorites();
      setFavorites(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  const addFavorite = useCallback(
    async (symbolId: string) => {
      await symbolsApi.addFavorite(symbolId);
      await refetch();
    },
    [refetch]
  );

  const removeFavorite = useCallback(
    async (symbolId: string) => {
      await symbolsApi.removeFavorite(symbolId);
      await refetch();
    },
    [refetch]
  );

  return {
    favorites,
    isLoading,
    error,
    refetch,
    addFavorite,
    removeFavorite,
  };
}
