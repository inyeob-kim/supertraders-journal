/**
 * Currency and number formatting. Pure functions only (no side effects).
 * Used by pages/components for display; market determines KRW vs USD.
 */
import type { Trade } from '../types/trade';

/** Market codes treated as Korean (display in KRW). */
const KR_MARKETS = ['KR', 'KRX', 'KOSPI', 'KOSDAQ'];

export function isKoreanMarket(market: string | null | undefined): boolean {
  if (!market || typeof market !== 'string') return false;
  const upper = market.toUpperCase();
  return KR_MARKETS.some((m) => upper === m || upper.startsWith(m));
}

/** Emoji flag for market (한국 🇰🇷 / 미국 🇺🇸). For use in lists and grids. */
export function getMarketFlag(market: string | null | undefined): string {
  return isKoreanMarket(market) ? '🇰🇷' : '🇺🇸';
}

/** Short label for market (for tooltip/accessibility). */
export function getMarketLabel(market: string | null | undefined): string {
  return isKoreanMarket(market) ? '한국' : '미국';
}

/**
 * Format amount for display: KRW (₩, no decimals) or USD ($, 2 decimals).
 * Does not add + sign; caller may prefix for P/L.
 */
export function formatCurrency(
  amount: number,
  market: string | null | undefined
): string {
  if (isKoreanMarket(market)) {
    return `₩${amount.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}`;
  }
  return `$${amount.toFixed(2)}`;
}

/** Summary per market for review/aggregate views. */
export interface MarketPnlSummary {
  total: number;
  avgWin: number;
  avgLoss: number;
  tradeCount: number;
}

/**
 * Split trades by market (KRW vs USD) and compute total P/L, avg win, avg loss per market.
 * Pure function for use in Review page.
 */
export function getMarketPnlSummaries(trades: Trade[]): {
  krw: MarketPnlSummary;
  usd: MarketPnlSummary;
} {
  const krwTrades = trades.filter((t) => isKoreanMarket(t.market));
  const usdTrades = trades.filter((t) => !isKoreanMarket(t.market));

  const toSummary = (list: Trade[]): MarketPnlSummary => {
    const total = list.reduce((s, t) => s + t.profitLoss, 0);
    const wins = list.filter((t) => t.profitLoss > 0);
    const losses = list.filter((t) => t.profitLoss < 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.profitLoss, 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + t.profitLoss, 0) / losses.length : 0;
    return { total, avgWin, avgLoss, tradeCount: list.length };
  };

  return { krw: toSummary(krwTrades), usd: toSummary(usdTrades) };
}
