import { create } from 'zustand';
import type { Portfolio, PortfolioHolding } from '@/types';

const generatePortfolioHistory = () => {
  const history = [];
  const startValue = 85000;
  let value = startValue;
  for (let i = 180; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    value = value * (1 + (Math.random() - 0.46) * 0.015);
    history.push({ date: date.toISOString().split('T')[0], value: parseFloat(value.toFixed(2)) });
  }
  return history;
};

const MOCK_HOLDINGS: PortfolioHolding[] = [
  { id: '1', symbol: 'AAPL', name: 'Apple Inc.', quantity: 50, avgCost: 165.20, currentPrice: 189.43, totalCost: 8260, currentValue: 9471.50, pnl: 1211.50, pnlPercent: 14.66, allocation: 21.2, sector: 'Technology' },
  { id: '2', symbol: 'NVDA', name: 'NVIDIA Corp.', quantity: 10, avgCost: 720.00, currentPrice: 875.22, totalCost: 7200, currentValue: 8752.20, pnl: 1552.20, pnlPercent: 21.56, allocation: 19.6, sector: 'Technology' },
  { id: '3', symbol: 'MSFT', name: 'Microsoft Corp.', quantity: 20, avgCost: 380.50, currentPrice: 414.28, totalCost: 7610, currentValue: 8285.60, pnl: 675.60, pnlPercent: 8.88, allocation: 18.5, sector: 'Technology' },
  { id: '4', symbol: 'TSLA', name: 'Tesla Inc.', quantity: 30, avgCost: 260.00, currentPrice: 234.56, totalCost: 7800, currentValue: 7036.80, pnl: -763.20, pnlPercent: -9.78, allocation: 15.7, sector: 'Automotive' },
  { id: '5', symbol: 'META', name: 'Meta Platforms', quantity: 12, avgCost: 460.00, currentPrice: 516.72, totalCost: 5520, currentValue: 6200.64, pnl: 680.64, pnlPercent: 12.33, allocation: 13.9, sector: 'Technology' },
  { id: '6', symbol: 'JPM', name: 'JPMorgan Chase', quantity: 25, avgCost: 195.00, currentPrice: 206.54, totalCost: 4875, currentValue: 5163.50, pnl: 288.50, pnlPercent: 5.92, allocation: 11.5, sector: 'Financial' },
];

const totalCost = MOCK_HOLDINGS.reduce((sum, h) => sum + h.totalCost, 0);
const totalValue = MOCK_HOLDINGS.reduce((sum, h) => sum + h.currentValue, 0);
const totalPnl = totalValue - totalCost;

const MOCK_PORTFOLIO: Portfolio = {
  totalValue,
  totalCost,
  totalPnl,
  totalPnlPercent: (totalPnl / totalCost) * 100,
  dayPnl: 847.32,
  dayPnlPercent: 1.93,
  holdings: MOCK_HOLDINGS,
  sectorAllocation: [
    { sector: 'Technology', value: 32709.94, percent: 73.1 },
    { sector: 'Automotive', value: 7036.80, percent: 15.7 },
    { sector: 'Financial', value: 5163.50, percent: 11.5 },
  ],
  performanceHistory: generatePortfolioHistory(),
};

interface PortfolioState {
  portfolio: Portfolio;
  addHolding: (holding: Omit<PortfolioHolding, 'id' | 'totalCost' | 'currentValue' | 'pnl' | 'pnlPercent' | 'allocation'>) => void;
  removeHolding: (id: string) => void;
  updatePrices: (prices: Record<string, number>) => void;
}

export const usePortfolioStore = create<PortfolioState>()((set) => ({
  portfolio: MOCK_PORTFOLIO,

  addHolding: (holding) =>
    set((state) => {
      const currentValue = holding.currentPrice * holding.quantity;
      const totalCost = holding.avgCost * holding.quantity;
      const pnl = currentValue - totalCost;
      const newHolding: PortfolioHolding = {
        ...holding,
        id: Math.random().toString(36).slice(2),
        currentValue,
        totalCost,
        pnl,
        pnlPercent: (pnl / totalCost) * 100,
        allocation: 0,
      };
      const updatedHoldings = [...state.portfolio.holdings, newHolding];
      const newTotal = updatedHoldings.reduce((s, h) => s + h.currentValue, 0);
      const withAllocation = updatedHoldings.map((h) => ({
        ...h,
        allocation: (h.currentValue / newTotal) * 100,
      }));
      return {
        portfolio: {
          ...state.portfolio,
          holdings: withAllocation,
          totalValue: newTotal,
        },
      };
    }),

  removeHolding: (id) =>
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        holdings: state.portfolio.holdings.filter((h) => h.id !== id),
      },
    })),

  updatePrices: (prices) =>
    set((state) => ({
      portfolio: {
        ...state.portfolio,
        holdings: state.portfolio.holdings.map((h) =>
          prices[h.symbol]
            ? { ...h, currentPrice: prices[h.symbol], currentValue: prices[h.symbol] * h.quantity }
            : h
        ),
      },
    })),
}));
