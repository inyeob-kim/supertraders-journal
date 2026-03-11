import { Trade } from '../types/trade';

const STORAGE_KEY = 'trading_journal_trades';

export const getTrades = (): Trade[] => {
  if (typeof window === 'undefined') return [];
  
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    // Initialize with some mock data
    const mockTrades = generateMockTrades();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockTrades));
    return mockTrades;
  }
  
  return JSON.parse(stored);
};

export const saveTrade = (trade: Trade): void => {
  const trades = getTrades();
  trades.unshift(trade); // Add to beginning
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
};

export const updateTrade = (id: string, updatedTrade: Trade): void => {
  const trades = getTrades();
  const index = trades.findIndex(t => t.id === id);
  if (index !== -1) {
    trades[index] = updatedTrade;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trades));
  }
};

export const deleteTrade = (id: string): void => {
  const trades = getTrades();
  const filtered = trades.filter(t => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

function generateMockTrades(): Trade[] {
  const tickers = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMD', 'SPY', 'QQQ'];
  const mistakes = ['FOMO', 'late stop loss', 'chasing', 'emotional trade', 'overconfidence'];
  const memos = [
    'Good entry, waited for confirmation',
    'Should have taken profit earlier',
    'Followed the plan',
    'Got stopped out, but right call',
    'Held too long',
    'Perfect setup',
    'Rushed the entry',
    'Good risk/reward',
  ];

  const trades: Trade[] = [];
  const now = new Date();

  for (let i = 0; i < 12; i++) {
    const ticker = tickers[Math.floor(Math.random() * tickers.length)];
    const entryPrice = 100 + Math.random() * 200;
    const exitPrice = entryPrice + (Math.random() - 0.4) * 20;
    const quantity = Math.floor(Math.random() * 50) + 10;
    const profitLoss = (exitPrice - entryPrice) * quantity;
    
    const date = new Date(now);
    date.setDate(date.getDate() - i * 2);
    
    const hasMistakes = Math.random() > 0.6;
    const mistakeTags = hasMistakes 
      ? [mistakes[Math.floor(Math.random() * mistakes.length)] as any]
      : [];

    trades.push({
      id: `trade-${i + 1}`,
      ticker,
      entryPrice: parseFloat(entryPrice.toFixed(2)),
      exitPrice: parseFloat(exitPrice.toFixed(2)),
      quantity,
      memo: memos[Math.floor(Math.random() * memos.length)],
      mistakeTags,
      date: date.toISOString(),
      profitLoss: parseFloat(profitLoss.toFixed(2)),
    });
  }

  return trades;
}
