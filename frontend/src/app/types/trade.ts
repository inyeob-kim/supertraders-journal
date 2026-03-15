/** Mistake tag label (from backend label_ko or code). */
export type MistakeTag = string;

export interface Trade {
  id: string;
  ticker: string;
  /** Market code for currency display (e.g. KR → ₩, US → $) */
  market?: string | null;
  entryPrice: number;
  exitPrice: number;
  quantity?: number;
  memo?: string;
  mistakeTags: string[];
  /** Backend mistake_tag ids for PATCH */
  mistakeTagIds?: string[];
  chartImage?: string;
  date: string;
  profitLoss: number;
}
