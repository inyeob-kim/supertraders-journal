/**
 * Backend API endpoint functions. No UI; used by hooks only.
 */
import { api } from './client';
import type {
  UserMe,
  UserProfileResponse,
  UserProfileUpsertRequest,
  SymbolSearchItem,
  FavoriteSymbolResponse,
  TradeListItemResponse,
  TradeDetailResponse,
  TradeCreateRequest,
  TradeUpdateRequest,
  PaginatedTradesResponse,
  DashboardSummaryResponse,
  MistakeTagItem,
} from './types';

export const usersApi = {
  getMe: () => api.get<UserMe>('/users/me'),
};

export const profileApi = {
  get: () => api.get<UserProfileResponse>('/users/profile'),
  patch: (body: UserProfileUpsertRequest) => api.patch<UserProfileResponse>('/users/profile', body),
};

export const symbolsApi = {
  search: (params: { q?: string; market?: string; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params.q) sp.set('q', params.q);
    if (params.market) sp.set('market', params.market);
    if (params.limit != null) sp.set('limit', String(params.limit));
    const query = sp.toString();
    return api.get<SymbolSearchItem[]>(`/symbols/${query ? `?${query}` : ''}`);
  },
  getFavorites: () => api.get<FavoriteSymbolResponse[]>('/symbols/favorites'),
  addFavorite: (symbolId: string) => api.post<FavoriteSymbolResponse>(`/symbols/favorites/${symbolId}`),
  removeFavorite: (symbolId: string) => api.delete(`/symbols/favorites/${symbolId}`),
};

export const tradesApi = {
  list: (params?: {
    page?: number;
    size?: number;
    start_date?: string;
    end_date?: string;
    symbol?: string;
    mistake_tag_id?: string;
    sort?: string;
  }) => {
    const sp = new URLSearchParams();
    if (params) {
      if (params.page != null) sp.set('page', String(params.page));
      if (params.size != null) sp.set('size', String(params.size));
      if (params.start_date) sp.set('start_date', params.start_date);
      if (params.end_date) sp.set('end_date', params.end_date);
      if (params.symbol) sp.set('symbol', params.symbol);
      if (params.mistake_tag_id) sp.set('mistake_tag_id', params.mistake_tag_id);
      if (params.sort) sp.set('sort', params.sort);
    }
    const query = sp.toString();
    return api.get<PaginatedTradesResponse>(`/trades/${query ? `?${query}` : ''}`);
  },
  get: (tradeId: string) => api.get<TradeDetailResponse>(`/trades/${tradeId}`),
  create: (body: TradeCreateRequest) => api.post<TradeDetailResponse>('/trades/', body),
  update: (tradeId: string, body: TradeUpdateRequest) =>
    api.patch<TradeDetailResponse>(`/trades/${tradeId}`, body),
  delete: (tradeId: string) => api.delete(`/trades/${tradeId}`),
};

export const dashboardApi = {
  getSummary: (range: 'today' | 'week' | 'month' | 'all') =>
    api.get<DashboardSummaryResponse>(`/dashboard/summary?range=${range}`),
};

export const mistakeTagsApi = {
  list: () => api.get<MistakeTagItem[]>('/mistake-tags'),
};
