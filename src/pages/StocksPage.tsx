import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Search, TrendingUp, TrendingDown, Filter, ChevronDown } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';

const SECTORS = ['All', 'Technology', 'Financial', 'Automotive', 'Media', 'E-Commerce', 'Crypto/Finance'];

export default function StocksPage() {
  const { stocks, setSelectedSymbol } = useMarketStore();
  const [search, setSearch] = useState('');
  const [sector, setSector] = useState('All');
  const [sortBy, setSortBy] = useState<'changePercent' | 'price' | 'marketCap' | 'volume'>('changePercent');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = stocks
    .filter((s) =>
      (sector === 'All' || s.sector === sector) &&
      (s.symbol.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const v = sortDir === 'desc' ? b[sortBy] - a[sortBy] : a[sortBy] - b[sortBy];
      return v;
    });

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'));
    else { setSortBy(col); setSortDir('desc'); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Stocks</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time market data with AI signals</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search stocks..."
            className="cyber-input pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {SECTORS.map((s) => (
            <button
              key={s}
              onClick={() => setSector(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                sector === s
                  ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30'
                  : 'bg-white/3 text-gray-400 border border-white/5 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right cursor-pointer hover:text-[#00E5FF]" onClick={() => toggleSort('price')}>Price</th>
                <th className="text-right cursor-pointer hover:text-[#00E5FF]" onClick={() => toggleSort('changePercent')}>Change</th>
                <th className="hidden md:table-cell text-right cursor-pointer hover:text-[#00E5FF]" onClick={() => toggleSort('volume')}>Volume</th>
                <th className="hidden lg:table-cell text-right cursor-pointer hover:text-[#00E5FF]" onClick={() => toggleSort('marketCap')}>Mkt Cap</th>
                <th className="hidden lg:table-cell text-right">P/E</th>
                <th className="hidden xl:table-cell">7D Chart</th>
                <th className="text-center">Signal</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((stock, i) => {
                const bullish = stock.changePercent >= 0;
                const signal = stock.changePercent > 1.5 ? 'BUY' : stock.changePercent < -1.5 ? 'SELL' : 'HOLD';
                return (
                  <motion.tr
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="cursor-pointer"
                    onClick={() => setSelectedSymbol(stock.symbol)}
                  >
                    <td>
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-[10px] font-bold text-white">{stock.symbol.slice(0, 2)}</span>
                        </div>
                        <div>
                          <div className="text-sm font-bold text-white">{stock.symbol}</div>
                          <div className="text-[10px] text-gray-500 max-w-[120px] truncate">{stock.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-mono text-sm text-white">{formatCurrency(stock.price)}</td>
                    <td className="text-right">
                      <div className={`flex items-center justify-end gap-1 text-sm font-semibold ${bullish ? 'text-neon-green' : 'text-red-400'}`}>
                        {bullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {formatPercent(stock.changePercent)}
                      </div>
                      <div className={`text-[10px] ${bullish ? 'text-neon-green/60' : 'text-red-400/60'}`}>
                        {bullish ? '+' : ''}{formatCurrency(stock.change)}
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-right text-xs text-gray-400 font-mono">
                      {formatNumber(stock.volume)}
                    </td>
                    <td className="hidden lg:table-cell text-right text-xs text-gray-400 font-mono">
                      ${formatNumber(stock.marketCap)}
                    </td>
                    <td className="hidden lg:table-cell text-right text-xs text-gray-400">{stock.pe.toFixed(1)}</td>
                    <td className="hidden xl:table-cell w-24">
                      <ResponsiveContainer width="100%" height={36}>
                        <AreaChart data={stock.sparkline.map((v, i) => ({ v, i }))}>
                          <Area type="monotone" dataKey="v" stroke={bullish ? '#00FF88' : '#FF4444'} strokeWidth={1.5} fill={bullish ? 'rgba(0,255,136,0.06)' : 'rgba(255,68,68,0.06)'} dot={false} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </td>
                    <td className="text-center">
                      <span className={signal === 'BUY' ? 'badge-buy' : signal === 'SELL' ? 'badge-sell' : 'badge-hold'}>
                        {signal}
                      </span>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
