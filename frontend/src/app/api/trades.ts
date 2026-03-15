/**
 * Map API trade shape to frontend Trade type so existing UI stays unchanged.
 */
import type { Trade } from '../types/trade';
import type { TradeListItemResponse, TradeDetailResponse } from './types';

function mapMistakeTags(tags: { label_ko: string }[]): string[] {
  return tags.map((t) => t.label_ko);
}

function toNum(v: unknown): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export function mapTradeFromApi(item: TradeListItemResponse | TradeDetailResponse): Trade {
  const entry = toNum(item.entry_price);
  const exit = item.exit_price != null && item.exit_price !== '' ? toNum(item.exit_price) : undefined;
  const qty = toNum(item.quantity) || 1;
  const pnl =
    item.pnl_amount != null && item.pnl_amount !== ''
      ? toNum(item.pnl_amount)
      : exit != null
        ? (exit - entry) * qty
        : 0;
  return {
    id: item.id,
    ticker: item.symbol_snapshot,
    market: item.market_snapshot ?? undefined,
    tradeDirection: item.trade_direction ?? undefined,
    marketType: item.market_type ?? undefined,
    tradeStatus: item.trade_status ?? undefined,
    entryPrice: entry,
    exitPrice: exit ?? 0,
    quantity: item.quantity != null ? toNum(item.quantity) : undefined,
    entryReason: item.entry_reason ?? undefined,
    exitReason: item.exit_reason ?? undefined,
    tradeReflection: item.trade_reflection ?? undefined,
    strategyTags: item.strategy_tags ?? undefined,
    memo: item.memo ?? undefined,
    mistakeTags: mapMistakeTags(item.mistake_tags),
    mistakeTagIds: item.mistake_tags.map((t) => t.id),
    chartImage: item.chart_image_url ?? undefined,
    date: item.trade_date,
    profitLoss: pnl,
  };
}
