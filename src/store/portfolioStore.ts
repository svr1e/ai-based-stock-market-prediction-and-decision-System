import { create } from 'zustand';
import type { Portfolio, PortfolioHolding } from '@/types';
import { api } from '@/lib/api';

const EMPTY_PORTFOLIO: Portfolio = {
  totalValue: 0,
  totalCost: 0,
  totalPnl: 0,
  totalPnlPercent: 0,
  dayPnl: 0,
  dayPnlPercent: 0,
  holdings: [],
  sectorAllocation: [],
  performanceHistory: [],
};

function calculateSectors(holdings: PortfolioHolding[]) {
  const total = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  if (total === 0) return [];
  const map: Record<string, number> = {};
  for (const h of holdings) {
    const sec = h.sector || 'Technology';
    map[sec] = (map[sec] || 0) + h.currentValue;
  }
  return Object.entries(map).map(([sector, value]) => ({
    sector,
    value: parseFloat(value.toFixed(2)),
    percent: parseFloat(((value / total) * 100).toFixed(1)),
  }));
}

interface PortfolioState {
  portfolio: Portfolio;
  fetchPortfolio: () => Promise<void>;
  addHolding: (holding: Omit<PortfolioHolding, 'id' | 'totalCost' | 'currentValue' | 'pnl' | 'pnlPercent' | 'allocation'>) => Promise<void>;
  removeHolding: (id: string) => Promise<void>;
  updatePrices: (prices: Record<string, number>) => void;
}

export const usePortfolioStore = create<PortfolioState>()((set, get) => ({
  portfolio: EMPTY_PORTFOLIO,

  fetchPortfolio: async () => {
    try {
      const res = await api.get('/portfolio/');
      if (res.data) {
        const rawHoldings = res.data.holdings || [];
        const totalValue = res.data.total_value || 0;
        const totalCost = res.data.total_cost || 0;
        const totalPnl = res.data.total_pnl || 0;
        const totalPnlPercent = res.data.total_pnl_percent || 0;

        const holdings: PortfolioHolding[] = rawHoldings.map((h: any) => ({
          id: h.id || h._id,
          symbol: h.symbol,
          name: h.name || h.symbol,
          quantity: h.quantity,
          avgCost: h.avg_cost || h.avgCost || 0,
          currentPrice: h.current_price || h.currentPrice || 0,
          totalCost: h.total_cost || h.totalCost || 0,
          currentValue: h.current_value || h.currentValue || 0,
          pnl: h.pnl || 0,
          pnlPercent: h.pnl_percent || h.pnlPercent || 0,
          allocation: totalValue > 0 ? ((h.current_value || h.currentValue || 0) / totalValue) * 100 : 0,
          sector: h.sector || 'Technology',
        }));

        set({
          portfolio: {
            totalValue,
            totalCost,
            totalPnl,
            totalPnlPercent,
            dayPnl: 0,
            dayPnlPercent: 0,
            holdings,
            sectorAllocation: calculateSectors(holdings),
            performanceHistory: [],
          },
        });
      }
    } catch (e) {
      console.warn("Failed to fetch portfolio from API", e);
    }
  },

  addHolding: async (holding) => {
    const currentValue = holding.currentPrice * holding.quantity;
    const totalCost = holding.avgCost * holding.quantity;
    const pnl = currentValue - totalCost;

    try {
      await api.post('/portfolio/holdings', {
        symbol: holding.symbol,
        name: holding.name,
        quantity: holding.quantity,
        avg_cost: holding.avgCost,
        current_price: holding.currentPrice,
        sector: holding.sector,
      });
    } catch (e) {
      console.warn("Failed to save holding to backend, updating local state", e);
    }

    set((state) => {
      const newHolding: PortfolioHolding = {
        ...holding,
        id: Math.random().toString(36).slice(2),
        currentValue: parseFloat(currentValue.toFixed(2)),
        totalCost: parseFloat(totalCost.toFixed(2)),
        pnl: parseFloat(pnl.toFixed(2)),
        pnlPercent: totalCost > 0 ? parseFloat(((pnl / totalCost) * 100).toFixed(2)) : 0,
        allocation: 0,
      };

      const updatedHoldings = [...state.portfolio.holdings, newHolding];
      const newTotalValue = updatedHoldings.reduce((s, h) => s + h.currentValue, 0);
      const newTotalCost = updatedHoldings.reduce((s, h) => s + h.totalCost, 0);
      const newTotalPnl = newTotalValue - newTotalCost;
      const newTotalPnlPercent = newTotalCost > 0 ? (newTotalPnl / newTotalCost) * 100 : 0;

      const withAllocation = updatedHoldings.map((h) => ({
        ...h,
        allocation: newTotalValue > 0 ? parseFloat(((h.currentValue / newTotalValue) * 100).toFixed(1)) : 0,
      }));

      return {
        portfolio: {
          ...state.portfolio,
          totalValue: parseFloat(newTotalValue.toFixed(2)),
          totalCost: parseFloat(newTotalCost.toFixed(2)),
          totalPnl: parseFloat(newTotalPnl.toFixed(2)),
          totalPnlPercent: parseFloat(newTotalPnlPercent.toFixed(2)),
          holdings: withAllocation,
          sectorAllocation: calculateSectors(withAllocation),
        },
      };
    });
  },

  removeHolding: async (id) => {
    try {
      await api.delete(`/portfolio/holdings/${id}`);
    } catch (e) {
      console.warn("Failed to remove holding from backend", e);
    }

    set((state) => {
      const updatedHoldings = state.portfolio.holdings.filter((h) => h.id !== id);
      const newTotalValue = updatedHoldings.reduce((s, h) => s + h.currentValue, 0);
      const newTotalCost = updatedHoldings.reduce((s, h) => s + h.totalCost, 0);
      const newTotalPnl = newTotalValue - newTotalCost;
      const newTotalPnlPercent = newTotalCost > 0 ? (newTotalPnl / newTotalCost) * 100 : 0;

      return {
        portfolio: {
          ...state.portfolio,
          totalValue: parseFloat(newTotalValue.toFixed(2)),
          totalCost: parseFloat(newTotalCost.toFixed(2)),
          totalPnl: parseFloat(newTotalPnl.toFixed(2)),
          totalPnlPercent: parseFloat(newTotalPnlPercent.toFixed(2)),
          holdings: updatedHoldings,
          sectorAllocation: calculateSectors(updatedHoldings),
        },
      };
    });
  },

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
