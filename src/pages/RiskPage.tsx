import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, TrendingDown, TrendingUp, AlertTriangle, BarChart2 } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { useMarketStore } from '@/store/marketStore';
import { formatPercent } from '@/lib/utils';

const generateRiskData = (symbol: string) => {
  const seed = symbol.charCodeAt(0);
  return {
    symbol,
    volatility: 15 + (seed % 40),
    beta: 0.6 + (seed % 15) / 10,
    sharpeRatio: 0.8 + (seed % 20) / 10,
    sortinoRatio: 1.1 + (seed % 18) / 10,
    maxDrawdown: -(5 + seed % 35),
    valueAtRisk: -(1 + seed % 8),
    riskScore: 20 + seed % 70,
    riskLabel: seed % 4 === 0 ? 'Very High' : seed % 3 === 0 ? 'High' : seed % 2 === 0 ? 'Medium' : 'Low',
  };
};

const riskLabelColor = (label: string) => {
  const map: Record<string, string> = { Low: 'text-neon-green', Medium: 'text-[#00E5FF]', High: 'text-neon-orange', 'Very High': 'text-red-400' };
  return map[label] || 'text-gray-400';
};

export default function RiskPage() {
  const { stocks } = useMarketStore();
  const [selected, setSelected] = useState('AAPL');

  const risk = generateRiskData(selected);
  const radarData = [
    { subject: 'Volatility', A: risk.volatility },
    { subject: 'Beta', A: risk.beta * 50 },
    { subject: 'Max DD', A: Math.abs(risk.maxDrawdown) },
    { subject: 'VaR', A: Math.abs(risk.valueAtRisk) * 8 },
    { subject: 'Risk Score', A: risk.riskScore },
  ];

  const compareData = stocks.slice(0, 8).map((s) => {
    const r = generateRiskData(s.symbol);
    return { symbol: s.symbol, risk: r.riskScore, sharpe: r.sharpeRatio };
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Risk Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">Volatility, Sharpe ratio, drawdown & VaR analysis</p>
      </div>

      {/* Stock Selector */}
      <div className="flex flex-wrap gap-2">
        {stocks.slice(0, 8).map((s) => (
          <button
            key={s.symbol}
            onClick={() => setSelected(s.symbol)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${selected === s.symbol ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30' : 'bg-white/3 text-gray-400 border border-white/5 hover:text-white'}`}
          >
            {s.symbol}
          </button>
        ))}
      </div>

      {/* Risk Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: 'Risk Score', value: `${risk.riskScore}/100`, sub: risk.riskLabel, color: riskLabelColor(risk.riskLabel) },
          { label: 'Volatility', value: `${risk.volatility.toFixed(1)}%`, sub: 'Annualized', color: 'text-white' },
          { label: 'Beta', value: risk.beta.toFixed(2), sub: 'vs S&P 500', color: 'text-white' },
          { label: 'Sharpe Ratio', value: risk.sharpeRatio.toFixed(2), sub: 'Risk-adj return', color: risk.sharpeRatio > 1 ? 'text-neon-green' : 'text-neon-orange' },
          { label: 'Sortino Ratio', value: risk.sortinoRatio.toFixed(2), sub: 'Downside risk', color: risk.sortinoRatio > 1 ? 'text-neon-green' : 'text-neon-orange' },
          { label: 'Max Drawdown', value: `${risk.maxDrawdown.toFixed(1)}%`, sub: '52-week', color: 'text-red-400' },
        ].map((m, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }} className="stat-card">
            <div className="text-xs text-gray-400 mb-2">{m.label}</div>
            <div className={`text-xl font-bold font-mono ${m.color}`}>{m.value}</div>
            <div className="text-[10px] text-gray-500 mt-1">{m.sub}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Risk Radar */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4">{selected} Risk Profile</h2>
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 11 }} />
              <Radar name="Risk" dataKey="A" stroke="#FF4444" fill="#FF4444" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Compare Risk Scores */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-5">Risk Score Comparison</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={compareData} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="symbol" tick={{ fill: '#9ca3af', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#9ca3af', fontSize: 10 }} tickLine={false} axisLine={false} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="risk" radius={[4, 4, 0, 0]}>
                {compareData.map((entry, i) => (
                  <Bar key={i} dataKey="risk" fill={entry.risk > 60 ? '#FF4444' : entry.risk > 40 ? '#FF6B35' : '#00E5FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* VaR Explanation */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-neon-orange" />
          Value at Risk (VaR) — {selected}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { conf: '95%', var: (risk.valueAtRisk * 0.8).toFixed(2), desc: '1 in 20 chance of losing more' },
            { conf: '99%', var: risk.valueAtRisk.toFixed(2), desc: '1 in 100 chance of losing more' },
            { conf: '99.9%', var: (risk.valueAtRisk * 1.3).toFixed(2), desc: 'Extreme tail risk scenario' },
          ].map((v) => (
            <div key={v.conf} className="p-4 rounded-xl bg-red-500/5 border border-red-500/15">
              <div className="text-xs text-gray-500 mb-1">Confidence: {v.conf}</div>
              <div className="text-xl font-bold font-mono text-red-400">{v.var}%</div>
              <div className="text-xs text-gray-500 mt-1">{v.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
