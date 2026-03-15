/** Mistake tag label (from backend label_ko or code). */
export type MistakeTag = string;

export interface Trade {
  id: string;
  ticker: string;
  /** Market code for currency display (e.g. KR → ₩, US → $) */
  market?: string | null;
  tradeDirection?: string;
  marketType?: string;
  /** OPEN = 미청산, CLOSED = 청산됨 */
  tradeStatus?: string;
  entryPrice: number;
  exitPrice: number;
  quantity?: number;
  entryReason?: string;
  exitReason?: string;
  tradeReflection?: string;
  strategyTags?: string[];
  memo?: string;
  mistakeTags: string[];
  mistakeTagIds?: string[];
  chartImage?: string | null;
  date: string;
  profitLoss: number;
}
