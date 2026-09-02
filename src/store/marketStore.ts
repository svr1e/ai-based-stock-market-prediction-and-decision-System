import { create } from 'zustand';
import type { StockQuote, WatchlistItem, Notification } from '@/types';
import { generateSparklineData } from '@/lib/utils';
import { api } from '@/lib/api';

const MOCK_STOCKS: StockQuote[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', price: 326.77, change: 1.64, changePercent: 0.50, volume: 58_340_000, marketCap: 2.95e12, high52w: 350.00, low52w: 220.00, pe: 29.4, eps: 6.44, sector: 'Technology', sparkline: generateSparklineData(326) },
  { symbol: 'MSFT', name: 'Microsoft Corp.', price: 496.33, change: -4.69, changePercent: -0.94, volume: 19_820_000, marketCap: 3.08e12, high52w: 520.00, low52w: 380.00, pe: 35.2, eps: 11.77, sector: 'Technology', sparkline: generateSparklineData(496) },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 337.32, change: 2.30, changePercent: 0.69, volume: 23_100_000, marketCap: 2.2e12, high52w: 360.00, low52w: 240.00, pe: 25.8, eps: 6.84, sector: 'Technology', sparkline: generateSparklineData(337) },
  { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 225.96, change: 8.52, changePercent: 3.92, volume: 42_700_000, marketCap: 2.16e12, high52w: 250.00, low52w: 120.00, pe: 70.3, eps: 12.45, sector: 'Technology', sparkline: generateSparklineData(225) },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 353.93, change: -2.16, changePercent: -0.61, volume: 87_600_000, marketCap: 7.47e11, high52w: 390.00, low52w: 210.00, pe: 60.1, eps: 3.91, sector: 'Automotive', sparkline: generateSparklineData(353) },
  { symbol: 'META', name: 'Meta Platforms', price: 594.85, change: 16.31, changePercent: 2.82, volume: 15_430_000, marketCap: 1.31e12, high52w: 620.00, low52w: 420.00, pe: 26.3, eps: 19.64, sector: 'Technology', sparkline: generateSparklineData(594) },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 255.44, change: 0.52, changePercent: 0.20, volume: 31_200_000, marketCap: 2.02e12, high52w: 280.00, low52w: 170.00, pe: 42.6, eps: 4.55, sector: 'E-Commerce', sparkline: generateSparklineData(255) },
  { symbol: 'NFLX', name: 'Netflix Inc.', price: 82.46, change: 1.65, changePercent: 2.04, volume: 4_100_000, marketCap: 2.98e11, high52w: 95.00, low52w: 60.00, pe: 38.7, eps: 17.76, sector: 'Media', sparkline: generateSparklineData(82) },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 459.45, change: -0.16, changePercent: -0.03, volume: 52_800_000, marketCap: 2.62e11, high52w: 490.00, low52w: 310.00, pe: 43.2, eps: 3.76, sector: 'Technology', sparkline: generateSparklineData(459) },
  { symbol: 'JPM', name: 'JPMorgan Chase', price: 358.18, change: 3.23, changePercent: 0.91, volume: 9_800_000, marketCap: 5.96e11, high52w: 380.00, low52w: 250.00, pe: 12.1, eps: 17.07, sector: 'Financial', sparkline: generateSparklineData(358) },
  { symbol: 'GS', name: 'Goldman Sachs', price: 487.23, change: 4.32, changePercent: 0.89, volume: 2_900_000, marketCap: 1.6e11, high52w: 519.45, low52w: 295.84, pe: 15.3, eps: 31.84, sector: 'Financial', sparkline: generateSparklineData(487) },
  { symbol: 'COIN', name: 'Coinbase Global', price: 223.45, change: -8.67, changePercent: -3.73, volume: 11_200_000, marketCap: 5.49e10, high52w: 283.67, low52w: 60.38, pe: 42.0, eps: 5.32, sector: 'Crypto/Finance', sparkline: generateSparklineData(223) },
];

const MOCK_WATCHLIST: WatchlistItem[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', price: 326.77, change: 1.64, changePercent: 0.50, alertPrice: 340, alertType: 'above', addedAt: new Date().toISOString() },
  { id: '2', symbol: 'NVDA', name: 'NVIDIA Corp.', price: 225.96, change: 8.52, changePercent: 3.92, addedAt: new Date().toISOString() },
  { id: '3', symbol: 'TSLA', name: 'Tesla Inc.', price: 353.93, change: -2.16, changePercent: -0.61, alertPrice: 340, alertType: 'below', addedAt: new Date().toISOString() },
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
  fetchLiveStocks: () => Promise<void>;
}

export const useMarketStore = create<MarketState>()((set, get) => ({
  stocks: MOCK_STOCKS,
  watchlist: MOCK_WATCHLIST,
  notifications: MOCK_NOTIFICATIONS,
  selectedSymbol: 'AAPL',
  isMarketOpen: true,

  setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }),

  fetchLiveStocks: async () => {
    try {
      const res = await api.get('/stocks/');
      if (res.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
        const liveStocks: StockQuote[] = res.data.data.map((item: any) => ({
          symbol: item.symbol,
          name: item.name,
          price: item.price,
          change: item.change,
          changePercent: item.change_percent,
          volume: item.volume,
          marketCap: item.market_cap,
          pe: item.pe || 25,
          eps: item.eps || 5,
          high52w: item.high_52w,
          low52w: item.low_52w,
          sector: item.sector,
          sparkline: generateSparklineData(item.price),
        }));
        set({ stocks: liveStocks });
      }
    } catch (e) {
      console.warn("Failed to fetch live stocks from backend API", e);
    }
  },

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
