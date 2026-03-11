export interface TradingProfile {
  tradingPrinciples: string;
  commonMistakes: string[];
  tradingGoals: {
    dailyMaxLoss: string;
    monthlyTarget: string;
    riskPerTrade: string;
  };
  mindsetReminders: string[];
  todayReminder: string;
}
