import { useState } from 'react';
import { motion } from 'framer-motion';
import { GitCompare, Plus, X, TrendingUp, TrendingDown } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

const COLORS = ['#00E5FF', '#7B2FFF', '#00FF88', '#FF6B35'];

const generateCompareData = (symbols: string[], days = 30) => {
  const data = [];
  const prices: Record<string, number> = {};
  symbols.forEach((s, i) => { prices[s] = 100; });
  for (let i = 0; i < days; i++) {
    const d = new Date(); d.setDate(d.getDate() - (days - i));
    const entry: any = { date: d.toISOString().split('T')[0].slice(5) };
    symbols.forEach((s, idx) => {
      prices[s] = prices[s] * (1 + (Math.random() - (idx % 2 === 0 ? 0.47 : 0.49)) * 0.025);
      entry[s] = parseFloat(prices[s].toFixed(2));
    });
    data.push(entry);
  }
  return data;
};

export default function ComparisonPage() {
  const { stocks } = useMarketStore();
  const [selected, setSelected] = useState(['AAPL', 'NVDA', 'TSLA']);
  const [addSymbol, setAddSymbol] = useState('MSFT');

  const compareData = generateCompareData(selected);

  const addStock = () => {
    if (!selected.includes(addSymbol) && selected.length < 4) {
      setSelected([...selected, addSymbol]);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Stock Comparison</h1>
        <p className="text-gray-400 text-sm mt-1">Compare up to 4 stocks across returns, indicators & risk</p>
      </div>

      {/* Selector */}
      <div className="glass-card rounded-2xl p-4">
        <div className="flex flex-wrap gap-3 items-center">
          {selected.map((s, i) => (
            <div key={s} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border" style={{ borderColor: COLORS[i] + '40', background: COLORS[i] + '10' }}>
              <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i] }} />
              <span className="text-sm font-semibold text-white">{s}</span>
              <button onClick={() => setSelected(selected.filter((x) => x !== s))} className="text-gray-500 hover:text-red-400 transition">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {selected.length < 4 && (
            <div className="flex items-center gap-2">
              <select value={addSymbol} onChange={(e) => setAddSymbol(e.target.value)} className="cyber-input py-1.5 text-sm w-36">
                {stocks.filter((s) => !selected.includes(s.symbol)).map((s) => (
                  <option key={s.symbol} value={s.symbol} style={{ background: '#0A0F1E' }}>{s.symbol}</option>
                ))}
              </select>
              <button onClick={addStock} className="neon-button px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Normalized Return Chart */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-5">Normalized Return (30 Days, Base 100)</h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={compareData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#9ca3af' }} />
            {selected.map((s, i) => (
              <Line key={s} type="monotone" dataKey={s} stroke={COLORS[i]} strokeWidth={2} dot={false} />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Comparison Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5">
          <h2 className="font-semibold text-white">Side-by-Side Metrics</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Metric</th>
                {selected.map((s, i) => (
                  <th key={s} className="text-right" style={{ color: COLORS[i] }}>{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {['Price', 'Day Change', 'Market Cap', 'P/E Ratio', '52W High', '52W Low'].map((metric) => (
                <tr key={metric}>
                  <td className="text-gray-400 text-xs">{metric}</td>
                  {selected.map((sym) => {
                    const stock = stocks.find((s) => s.symbol === sym);
                    if (!stock) return <td key={sym} />;
                    let val = '';
                    let className = 'text-white';
                    if (metric === 'Price') val = formatCurrency(stock.price);
                    if (metric === 'Day Change') { val = formatPercent(stock.changePercent); className = stock.changePercent >= 0 ? 'text-neon-green' : 'text-red-400'; }
                    if (metric === 'Market Cap') val = `$${(stock.marketCap / 1e9).toFixed(0)}B`;
                    if (metric === 'P/E Ratio') val = stock.pe.toFixed(1);
                    if (metric === '52W High') val = formatCurrency(stock.high52w);
                    if (metric === '52W Low') val = formatCurrency(stock.low52w);
                    return <td key={sym} className={`text-right font-mono text-sm ${className}`}>{val}</td>;
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
