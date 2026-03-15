import { Trade } from '../types/trade';

const STORAGE_KEY = 'trading_journal_trades';

export const getTrades = (): Trade[] => {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

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
