import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, TrendingUp, TrendingDown, PieChart, DollarSign, BarChart2 } from 'lucide-react';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency, formatPercent } from '@/lib/utils';
import {
  PieChart as RechartsPie, Pie, Cell, Tooltip, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, CartesianGrid
} from 'recharts';

const PIE_COLORS = ['#00E5FF', '#7B2FFF', '#00FF88', '#FF6B35', '#FF0080'];

export default function PortfolioPage() {
  const { portfolio, removeHolding, addHolding } = usePortfolioStore();
  const { stocks } = useMarketStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [form, setForm] = useState({ symbol: 'AAPL', quantity: '', avgCost: '' });

  const handleAdd = () => {
    const stock = stocks.find((s) => s.symbol === form.symbol);
    if (!stock || !form.quantity || !form.avgCost) return;
    addHolding({
      symbol: form.symbol,
      name: stock.name,
      quantity: parseFloat(form.quantity),
      avgCost: parseFloat(form.avgCost),
      currentPrice: stock.price,
      sector: stock.sector,
    });
    setShowAddForm(false);
    setForm({ symbol: 'AAPL', quantity: '', avgCost: '' });
  };

  const perfData = portfolio.performanceHistory.slice(-60);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your investments</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAddForm(true)}
          className="neon-button px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Position
        </motion.button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Value', value: formatCurrency(portfolio.totalValue), icon: DollarSign, color: 'text-[#00E5FF]' },
          { label: 'Total P&L', value: `${portfolio.totalPnl >= 0 ? '+' : ''}${formatCurrency(portfolio.totalPnl)}`, icon: TrendingUp, color: portfolio.totalPnl >= 0 ? 'text-neon-green' : 'text-red-400' },
          { label: 'Return', value: formatPercent(portfolio.totalPnlPercent), icon: BarChart2, color: portfolio.totalPnlPercent >= 0 ? 'text-neon-green' : 'text-red-400' },
          { label: 'Day Change', value: `${portfolio.dayPnl >= 0 ? '+' : ''}${formatCurrency(portfolio.dayPnl)}`, icon: TrendingUp, color: portfolio.dayPnl >= 0 ? 'text-neon-green' : 'text-red-400' },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
            <div className="flex items-center gap-2 mb-3">
              <card.icon className={`w-4 h-4 ${card.color}`} />
              <span className="text-xs text-gray-400">{card.label}</span>
            </div>
            <div className={`text-xl font-bold font-mono ${card.color}`}>{card.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Performance Chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-5">Portfolio Growth (60 Days)</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={perfData}>
              <defs>
                <linearGradient id="portGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={9} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`} width={48} />
              <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="#00E5FF" strokeWidth={2} fill="url(#portGrad2)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Allocation Pie */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2"><PieChart className="w-4 h-4 text-[#00E5FF]" />Sector Allocation</h2>
          <ResponsiveContainer width="100%" height={160}>
            <RechartsPie>
              <Pie data={portfolio.sectorAllocation} dataKey="percent" nameKey="sector" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                {portfolio.sectorAllocation.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => `${v.toFixed(1)}%`} contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            </RechartsPie>
          </ResponsiveContainer>
          <div className="space-y-2 mt-3">
            {portfolio.sectorAllocation.map((s, i) => (
              <div key={s.sector} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-xs text-gray-400 flex-1">{s.sector}</span>
                <span className="text-xs font-medium text-white">{s.percent.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Holdings ({portfolio.holdings.length})</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Stock</th>
                <th className="text-right">Qty</th>
                <th className="text-right">Avg Cost</th>
                <th className="text-right">Curr. Price</th>
                <th className="text-right">Value</th>
                <th className="text-right">P&L</th>
                <th className="text-right">Alloc.</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {portfolio.holdings.map((h, i) => (
                <motion.tr key={h.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                  <td>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-white">{h.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-bold text-white">{h.symbol}</div>
                        <div className="text-[10px] text-gray-500">{h.name.split(' ')[0]}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-right text-sm text-gray-300">{h.quantity}</td>
                  <td className="text-right font-mono text-sm text-gray-300">{formatCurrency(h.avgCost)}</td>
                  <td className="text-right font-mono text-sm text-white">{formatCurrency(h.currentPrice)}</td>
                  <td className="text-right font-mono text-sm text-white">{formatCurrency(h.currentValue)}</td>
                  <td className="text-right">
                    <div className={`text-sm font-semibold ${h.pnl >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                      {h.pnl >= 0 ? '+' : ''}{formatCurrency(h.pnl)}
                    </div>
                    <div className={`text-[10px] ${h.pnlPercent >= 0 ? 'text-neon-green/70' : 'text-red-400/70'}`}>
                      {formatPercent(h.pnlPercent)}
                    </div>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <div className="w-12 neon-progress">
                        <div className="neon-progress-bar" style={{ width: `${h.allocation}%` }} />
                      </div>
                      <span className="text-xs text-gray-400">{h.allocation.toFixed(1)}%</span>
                    </div>
                  </td>
                  <td>
                    <button onClick={() => removeHolding(h.id)} className="text-gray-600 hover:text-red-400 transition p-1">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Position Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-5">Add Position</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Stock Symbol</label>
                  <select value={form.symbol} onChange={(e) => setForm({ ...form, symbol: e.target.value })} className="cyber-input">
                    {stocks.map((s) => <option key={s.symbol} value={s.symbol} style={{ background: '#0A0F1E' }}>{s.symbol}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Quantity</label>
                  <input type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} placeholder="e.g. 10" className="cyber-input" />
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Average Cost ($)</label>
                  <input type="number" value={form.avgCost} onChange={(e) => setForm({ ...form, avgCost: e.target.value })} placeholder="e.g. 150.00" className="cyber-input" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddForm(false)} className="outline-neon-button flex-1 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleAdd} className="neon-button flex-1 py-2.5 rounded-xl text-sm font-semibold">Add Position</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
