// ============ CORE TYPES ============

export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap: number;
  high52w: number;
  low52w: number;
  pe: number;
  eps: number;
  sector: string;
  logo?: string;
  sparkline: number[];
}

export interface OHLCV {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Prediction {
  symbol: string;
  timeframe: '1d' | '7d' | '30d' | '90d';
  model: 'lstm' | 'gru' | 'rf' | 'xgboost' | 'ensemble';
  predictedPrice: number;
  currentPrice: number;
  confidence: number;
  trend: 'bullish' | 'bearish' | 'sideways';
  trendProbability: number;
  createdAt: string;
  explanation: string;
  featureImportance: { feature: string; importance: number }[];
  priceHistory: { date: string; actual?: number; predicted: number }[];
}

export interface TechnicalIndicators {
  rsi: number;
  macd: number;
  macdSignal: number;
  macdHistogram: number;
  ema20: number;
  ema50: number;
  sma200: number;
  bollingerUpper: number;
  bollingerMiddle: number;
  bollingerLower: number;
  atr: number;
  vwap: number;
  adx: number;
  stochRsi: number;
  cci: number;
  obv: number;
}

export interface SentimentData {
  symbol: string;
  overall: 'positive' | 'negative' | 'neutral';
  score: number;
  confidence: number;
  newsCount: number;
  twitterCount: number;
  redditCount: number;
  fearGreedIndex: number;
  fearGreedLabel: string;
  headlines: NewsItem[];
  updatedAt: string;
}

export interface NewsItem {
  id: string;
  title: string;
  source: string;
  url: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  sentimentScore: number;
  publishedAt: string;
  summary: string;
}

export interface PortfolioHolding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  totalCost: number;
  currentValue: number;
  pnl: number;
  pnlPercent: number;
  allocation: number;
  sector: string;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalPnl: number;
  totalPnlPercent: number;
  dayPnl: number;
  dayPnlPercent: number;
  holdings: PortfolioHolding[];
  sectorAllocation: { sector: string; value: number; percent: number }[];
  performanceHistory: { date: string; value: number }[];
}

export interface Recommendation {
  id: string;
  symbol: string;
  name: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  currentPrice: number;
  targetPrice: number;
  stopLoss: number;
  confidence: number;
  timeframe: string;
  reasoning: string[];
  riskLevel: 'low' | 'medium' | 'high';
  expectedReturn: number;
  createdAt: string;
}

export interface RiskAnalysis {
  symbol: string;
  volatility: number;
  beta: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  valueAtRisk: number;
  riskScore: number;
  riskLabel: 'Low' | 'Medium' | 'High' | 'Very High';
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  alertPrice?: number;
  alertType?: 'above' | 'below';
  addedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

export interface Notification {
  id: string;
  type: 'price_alert' | 'prediction' | 'recommendation' | 'system';
  title: string;
  message: string;
  symbol?: string;
  read: boolean;
  createdAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  plan: 'free' | 'pro' | 'enterprise';
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '6M' | '1Y' | 'ALL';
export type ModelType = 'lstm' | 'gru' | 'rf' | 'xgboost' | 'ensemble';
export type PredictionTimeframe = '1d' | '7d' | '30d' | '90d';
export type SentimentLabel = 'positive' | 'negative' | 'neutral';
export type TrendLabel = 'bullish' | 'bearish' | 'sideways';
export type RecommendationAction = 'BUY' | 'SELL' | 'HOLD';
