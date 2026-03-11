export type MistakeTag = 'FOMO' | 'late stop loss' | 'chasing' | 'emotional trade' | 'overconfidence';

export interface Trade {
  id: string;
  ticker: string;
  entryPrice: number;
  exitPrice: number;
  quantity?: number;
  memo?: string;
  mistakeTags: MistakeTag[];
  chartImage?: string;
  date: string;
  profitLoss: number;
}
