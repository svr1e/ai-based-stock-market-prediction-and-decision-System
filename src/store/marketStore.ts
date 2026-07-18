import { create } from 'zustand';
import type { StockQuote, WatchlistItem, Notification } from '@/types';
import { generateSparklineData } from '@/lib/utils';

const MOCK_STOCKS: StockQuote[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 189.43, change: 2.34, changePercent: 1.25, volume: 58_340_000, marketCap: 2.95e12, high52w: 199.62, low52w: 143.90, pe: 29.4, eps: 6.44, sector: 'Technology', sparkline: generateSparklineData(189) },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 414.28, change: -1.82, changePercent: -0.44, volume: 19_820_000, marketCap: 3.08e12, high52w: 430.82, low52w: 309.45, pe: 35.2, eps: 11.77, sector: 'Technology', sparkline: generateSparklineData(414) },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 176.54, change: 3.21, changePercent: 1.85, volume: 23_100_000, marketCap: 2.2e12, high52w: 193.31, low52w: 120.21, pe: 25.8, eps: 6.84, sector: 'Technology', sparkline: generateSparklineData(176) },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.22, change: 18.64, changePercent: 2.17, volume: 42_700_000, marketCap: 2.16e12, high52w: 974.00, low52w: 393.28, pe: 70.3, eps: 12.45, sector: 'Technology', sparkline: generateSparklineData(875) },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 234.56, change: -5.43, changePercent: -2.27, volume: 87_600_000, marketCap: 7.47e11, high52w: 299.29, low52w: 152.37, pe: 60.1, eps: 3.91, sector: 'Automotive', sparkline: generateSparklineData(234) },
  { symbol: 'META', name: 'Meta Platforms', price: 516.72, change: 8.94, changePercent: 1.76, volume: 15_430_000, marketCap: 1.31e12, high52w: 544.55, low52w: 279.40, pe: 26.3, eps: 19.64, sector: 'Technology', sparkline: generateSparklineData(516) },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 193.67, change: 1.23, changePercent: 0.64, volume: 31_200_000, marketCap: 2.02e12, high52w: 201.20, low52w: 118.35, pe: 42.6, eps: 4.55, sector: 'E-Commerce', sparkline: generateSparklineData(193) },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 687.34, change: 12.45, changePercent: 1.84, volume: 4_100_000, marketCap: 2.98e11, high52w: 700.99, low52w: 344.73, pe: 38.7, eps: 17.76, sector: 'Media', sparkline: generateSparklineData(687) },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 162.43, change: -3.12, changePercent: -1.89, volume: 52_800_000, marketCap: 2.62e11, high52w: 227.30, low52w: 96.96, pe: 43.2, eps: 3.76, sector: 'Technology', sparkline: generateSparklineData(162) },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 206.54, change: 0.87, changePercent: 0.42, volume: 9_800_000, marketCap: 5.96e11, high52w: 220.82, low52w: 135.19, pe: 12.1, eps: 17.07, sector: 'Financial', sparkline: generateSparklineData(206) },
  { symbol: 'GS', name: 'Goldman Sachs', price: 487.23, change: 4.32, changePercent: 0.89, volume: 2_900_000, marketCap: 1.6e11, high52w: 519.45, low52w: 295.84, pe: 15.3, eps: 31.84, sector: 'Financial', sparkline: generateSparklineData(487) },
  { symbol: 'COIN', name: 'Coinbase Global', price: 223.45, change: -8.67, changePercent: -3.73, volume: 11_200_000, marketCap: 5.49e10, high52w: 283.67, low52w: 60.38, pe: 42.0, eps: 5.32, sector: 'Crypto/Finance', sparkline: generateSparklineData(223) },
];

const MOCK_WATCHLIST: WatchlistItem[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 189.43, change: 2.34, changePercent: 1.25, alertPrice: 200, alertType: 'above', addedAt: new Date().toISOString() },
  { id: '2', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 875.22, change: 18.64, changePercent: 2.17, addedAt: new Date().toISOString() },
  { id: '3', symbol: 'TSLA', name: 'Tesla Inc.', price: 234.56, change: -5.43, changePercent: -2.27, alertPrice: 220, alertType: 'below', addedAt: new Date().toISOString() },
];

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: '1', type: 'price_alert', title: 'AAPL Price Alert', message: 'Apple Inc. crossed $189', symbol: 'AAPL', read: false, createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: '2', type: 'prediction', title: 'New AI Prediction', message: 'NVDA: Bullish signal with 89% confidence', symbol: 'NVDA', read: false, createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: '3', type: 'recommendation', title: 'Buy Signal', message: 'META: Strong buy recommendation generated', symbol: 'META', read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', type: 'system', title: 'Market Opens', message: 'US Markets are now open. Good luck trading!', read: true, createdAt: new Date(Date.now() - 172800000).toISOString() },
];

interface MarketState {
  stocks: StockQuote[];
  watchlist: WatchlistItem[];
  notifications: Notification[];
  selectedSymbol: string;
  isMarketOpen: boolean;
  setSelectedSymbol: (symbol: string) => void;
  addToWatchlist: (item: WatchlistItem) => void;
  removeFromWatchlist: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  updateStockPrices: () => void;
}

export const useMarketStore = create<MarketState>()((set, get) => ({
  stocks: MOCK_STOCKS,
  watchlist: MOCK_WATCHLIST,
  notifications: MOCK_NOTIFICATIONS,
  selectedSymbol: 'AAPL',
  isMarketOpen: true,

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

  addToWatchlist: (item) =>
    set((state) => ({
      watchlist: [...state.watchlist.filter((w) => w.symbol !== item.symbol), item],
    })),

  removeFromWatchlist: (id) =>
    set((state) => ({ watchlist: state.watchlist.filter((w) => w.id !== id) })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllNotificationsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),

  updateStockPrices: () =>
    set((state) => ({
      stocks: state.stocks.map((stock) => {
        const change = (Math.random() - 0.49) * stock.price * 0.005;
        const newPrice = Math.max(1, stock.price + change);
        const newChangePercent = ((newPrice - (stock.price - stock.change)) / (stock.price - stock.change)) * 100;
        return {
          ...stock,
          price: parseFloat(newPrice.toFixed(2)),
          change: parseFloat((newPrice - (stock.price - stock.change)).toFixed(2)),
          changePercent: parseFloat(newChangePercent.toFixed(2)),
          sparkline: [...stock.sparkline.slice(1), newPrice],
        };
      }),
    })),
}));
