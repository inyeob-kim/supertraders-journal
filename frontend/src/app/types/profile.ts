export interface TradingProfile {
  tradingPrinciples: string;
  commonMistakes: string[];
  tradingProcess: string[];
  tradingGoals: {
    dailyMaxLoss: string;
    monthlyTarget: string;
    riskPerTrade: string;
  };
  mindsetReminders: string[];
  todayReminder: string;
}
