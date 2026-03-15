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
  const exit = toNum(item.exit_price);
  const qty = toNum(item.quantity) || 1;
  const pnl =
    item.pnl_amount != null && item.pnl_amount !== ''
      ? toNum(item.pnl_amount)
      : (exit - entry) * qty;
  return {
    id: item.id,
    ticker: item.symbol_snapshot,
    market: item.market_snapshot ?? undefined,
    entryPrice: entry,
    exitPrice: exit,
    quantity: item.quantity != null ? toNum(item.quantity) : undefined,
    memo: item.memo ?? undefined,
    mistakeTags: mapMistakeTags(item.mistake_tags),
    mistakeTagIds: item.mistake_tags.map((t) => t.id),
    chartImage: item.chart_image_url ?? undefined,
    date: item.trade_date,
    profitLoss: pnl,
  };
}
