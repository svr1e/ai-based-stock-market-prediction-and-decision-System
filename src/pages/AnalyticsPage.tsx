import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, TrendingUp, Activity, Zap } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, LineChart, Line, ReferenceLine } from 'recharts';

const generateIndicatorData = (basePrice: number, days = 60) => {
  const data = [];
  let price = basePrice;
  let obv = 1000000;
  for (let i = 0; i < days; i++) {
    const d = new Date(); d.setDate(d.getDate() - (days - i));
    const change = (Math.random() - 0.48) * price * 0.02;
    price = Math.max(1, price + change);
    const rsi = 30 + Math.random() * 40;
    const macd = (Math.random() - 0.5) * 4;
    obv += change > 0 ? Math.random() * 500000 : -Math.random() * 500000;
    data.push({
      date: d.toISOString().split('T')[0].slice(5),
      price: parseFloat(price.toFixed(2)),
      rsi: parseFloat(rsi.toFixed(2)),
      macd: parseFloat(macd.toFixed(3)),
      signal: parseFloat((macd * 0.85).toFixed(3)),
      volume: Math.round(10000000 + Math.random() * 40000000),
      obv: Math.round(obv),
    });
  }
  return data;
};

export default function AnalyticsPage() {
  const { stocks, selectedSymbol } = useMarketStore();
  const stock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const data = generateIndicatorData(stock.price);
  const lastRSI = data[data.length - 1]?.rsi || 50;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Technical Analytics</h1>
        <p className="text-gray-400 text-sm mt-1">RSI, MACD, Volume, OBV indicators for {stock.symbol}</p>
      </div>

      {/* Indicator Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'RSI (14)', value: lastRSI.toFixed(1), status: lastRSI > 70 ? 'Overbought' : lastRSI < 30 ? 'Oversold' : 'Neutral', color: lastRSI > 70 ? 'text-red-400' : lastRSI < 30 ? 'text-neon-green' : 'text-[#00E5FF]' },
          { label: 'MACD', value: data[data.length - 1]?.macd.toFixed(3), status: (data[data.length - 1]?.macd || 0) > 0 ? 'Bullish' : 'Bearish', color: (data[data.length - 1]?.macd || 0) > 0 ? 'text-neon-green' : 'text-red-400' },
          { label: 'EMA 20', value: `$${(stock.price * 0.98).toFixed(2)}`, status: 'Price above EMA', color: 'text-neon-green' },
          { label: 'Bollinger', value: 'Mid Band', status: 'Normal range', color: 'text-[#00E5FF]' },
        ].map((ind, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
            <div className="text-xs text-gray-400 mb-2">{ind.label}</div>
            <div className={`text-xl font-bold font-mono ${ind.color}`}>{ind.value}</div>
            <div className="text-[10px] text-gray-500 mt-1">{ind.status}</div>
          </motion.div>
        ))}
      </div>

      {/* Price Chart */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00E5FF]" />
          Price History (60 Days)
        </h2>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={data}>
            <defs>
              <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={9} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={['auto', 'auto']} tickFormatter={(v) => `$${v.toFixed(0)}`} width={50} />
            <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <Area type="monotone" dataKey="price" stroke="#00E5FF" strokeWidth={2} fill="url(#priceGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* RSI */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-5">RSI (14)</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={9} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <ReferenceLine y={70} stroke="rgba(255,68,68,0.5)" strokeDasharray="4 3" />
              <ReferenceLine y={30} stroke="rgba(0,255,136,0.5)" strokeDasharray="4 3" />
              <Line type="monotone" dataKey="rsi" stroke="#7B2FFF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* MACD */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-5">MACD</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={data.slice(-30)} barSize={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
              <Bar dataKey="macd" radius={[2, 2, 0, 0]}>
                {data.slice(-30).map((entry, i) => (
                  <Bar key={i} dataKey="macd" fill={entry.macd >= 0 ? '#00FF88' : '#FF4444'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#7B2FFF]" />
          Volume Analysis
        </h2>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data.slice(-30)} barSize={10}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1e6).toFixed(0)}M`} width={40} />
            <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} formatter={(v: any) => `${(v / 1e6).toFixed(1)}M`} />
            <Bar dataKey="volume" fill="#7B2FFF" opacity={0.7} radius={[2, 2, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
