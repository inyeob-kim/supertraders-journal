/**
 * API response/request types aligned with backend. Used by api/ and hooks.
 */

export interface UserMe {
  id: string;
  firebase_uid: string;
  email: string | null;
  display_name: string | null;
  photo_url: string | null;
  provider: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfileResponse {
  id: string;
  user_id: string;
  trading_principles: string | null;
  mindset_quotes: string | null;
  daily_max_loss_pct: number | null;
  monthly_target_return_pct: number | null;
  risk_per_trade_pct: number | null;
  rule_of_the_day: string | null;
  common_mistakes: string[] | null;
  trading_process: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UserProfileUpsertRequest {
  trading_principles?: string | null;
  mindset_quotes?: string | null;
  daily_max_loss_pct?: number | null;
  monthly_target_return_pct?: number | null;
  risk_per_trade_pct?: number | null;
  rule_of_the_day?: string | null;
  common_mistakes?: string[] | null;
  trading_process?: string[] | null;
}

export interface MistakeTagItem {
  id: string;
  code: string;
  label_ko: string;
}

export interface SymbolSearchItem {
  id: string;
  symbol: string;
  name_kr: string | null;
  name_en: string | null;
  market: string;
  exchange: string | null;
}

export interface FavoriteSymbolResponse {
  id: string;
  symbol_id: string;
  symbol: string;
  name_kr: string | null;
  name_en: string | null;
  market: string;
  exchange: string | null;
  created_at: string;
}

export interface MistakeTagRef {
  id: string;
  code: string;
  label_ko: string;
}

export interface TradeListItemResponse {
  id: string;
  symbol_snapshot: string;
  symbol_name_snapshot: string | null;
  market_snapshot: string | null;
  trade_date: string;
  trade_direction?: string;
  market_type?: string;
  trade_status?: string;
  entry_price: number;
  exit_price: number | null;
  quantity: number | null;
  pnl_amount: number | null;
  pnl_pct: number | null;
  entry_reason?: string | null;
  exit_reason?: string | null;
  trade_reflection?: string | null;
  strategy_tags?: string[] | null;
  memo: string | null;
  mistake_tags: MistakeTagRef[];
  chart_image_url: string | null;
  created_at: string;
}

export interface TradeDetailResponse extends TradeListItemResponse {
  user_id: string;
  symbol_id: string;
  market_snapshot: string | null;
  exchange_snapshot: string | null;
  chart_image_path: string | null;
  entry_at: string | null;
  exit_at: string | null;
  updated_at: string;
}

export type TradeDirection = 'LONG' | 'SHORT';
export type MarketType = 'US_STOCK' | 'KOREA_STOCK' | 'CRYPTO';

export interface TradeCreateRequest {
  symbol_id: string;
  trade_date: string;
  trade_direction: TradeDirection;
  market_type: MarketType;
  entry_price: number;
  exit_price?: number | null;
  quantity?: number | null;
  strategy_tags?: string[] | null;
  entry_reason?: string | null;
  exit_reason?: string | null;
  trade_reflection?: string | null;
  memo?: string | null;
  mistake_tag_ids?: string[] | null;
  chart_image_url?: string | null;
  chart_image_path?: string | null;
  entry_at?: string | null;
  exit_at?: string | null;
}

export interface TradeUpdateRequest {
  trade_date?: string;
  trade_direction?: string;
  market_type?: string;
  entry_price?: number;
  exit_price?: number | null;
  quantity?: number | null;
  strategy_tags?: string[] | null;
  entry_reason?: string | null;
  exit_reason?: string | null;
  trade_reflection?: string | null;
  memo?: string | null;
  mistake_tag_ids?: string[] | null;
  chart_image_url?: string | null;
  chart_image_path?: string | null;
  entry_at?: string | null;
  exit_at?: string | null;
}

export interface PaginatedTradesResponse {
  items: TradeListItemResponse[];
  page: number;
  size: number;
  total: number;
  total_pages: number;
}

export interface DashboardSummaryResponse {
  range: string;
  summary: {
    total_trades: number;
    win_rate: number;
    total_pnl_amount: number;
    total_pnl_amount_krw?: number;
    total_pnl_amount_usd?: number;
    trade_count_krw?: number;
    trade_count_usd?: number;
  };
  recent_trades: TradeListItemResponse[];
  mistake_stats: Array<{
    mistake_tag_id: string;
    code: string;
    label_ko: string;
    count: number;
    percentage: number;
  }>;
  rule_of_the_day: string | null;
  trading_principles?: string | null;
  trading_process?: string[] | null;
}
