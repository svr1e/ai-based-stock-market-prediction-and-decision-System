import { motion } from 'framer-motion';
import { AlertTriangle, Activity, TrendingDown, Zap, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ScatterChart, Scatter, ZAxis, ReferenceLine } from 'recharts';

const generateVolatilityData = () =>
  Array.from({ length: 60 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (59 - i));
    const isAnomaly = [12, 28, 45, 52].includes(i);
    return {
      date: d.toISOString().split('T')[0].slice(5),
      volatility: isAnomaly ? 3.5 + Math.random() * 2 : 0.5 + Math.random() * 1.5,
      anomaly: isAnomaly,
    };
  });

const ANOMALY_EVENTS = [
  { date: '2026-05-14', type: 'Flash Crash', severity: 'critical', drop: -8.4, duration: '23 min', symbol: 'TSLA', desc: 'Isolation Forest detected sudden selling pressure — 3σ below normal volatility baseline.' },
  { date: '2026-06-02', type: 'High Volatility', severity: 'warning', drop: -4.1, duration: '2.5 hrs', symbol: 'NVDA', desc: 'Post-earnings volatility spike detected. Volume 4.2x above 30-day average.' },
  { date: '2026-06-19', type: 'Anomalous Volume', severity: 'info', drop: 0, duration: '45 min', symbol: 'AAPL', desc: 'Unusual options activity detected before product announcement.' },
  { date: '2026-07-08', type: 'Flash Crash', severity: 'warning', drop: -3.7, duration: '8 min', symbol: 'AMD', desc: 'Algorithm-triggered selling cascade. Markets stabilized after circuit breaker.' },
];

const severityConfig = {
  critical: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/25', icon: '🚨' },
  warning: { color: 'text-neon-orange', bg: 'bg-neon-orange/10 border-neon-orange/25', icon: '⚠️' },
  info: { color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10 border-[#00E5FF]/25', icon: 'ℹ️' },
};

export default function CrashDetectionPage() {
  const volData = generateVolatilityData();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Market Crash Detection</h1>
        <p className="text-gray-400 text-sm mt-1">Isolation Forest anomaly detection for flash crashes & volatility spikes</p>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'System Status', value: 'Active', sub: 'Monitoring 50 stocks', color: 'text-neon-green', icon: <Shield className="w-5 h-5 text-neon-green" /> },
          { label: 'Anomalies Detected', value: '4', sub: 'Last 60 days', color: 'text-neon-orange', icon: <AlertTriangle className="w-5 h-5 text-neon-orange" /> },
          { label: 'Market Volatility', value: 'Moderate', sub: 'VIX-equivalent: 18.4', color: 'text-[#00E5FF]', icon: <Activity className="w-5 h-5 text-[#00E5FF]" /> },
          { label: 'Flash Crash Risk', value: 'Low', sub: 'Score: 22 / 100', color: 'text-neon-green', icon: <Zap className="w-5 h-5 text-neon-green" /> },
        ].map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="stat-card">
            <div className="flex items-center gap-2 mb-3">{card.icon}<span className="text-xs text-gray-400">{card.label}</span></div>
            <div className={`text-xl font-bold ${card.color}`}>{card.value}</div>
            <div className="text-[10px] text-gray-500 mt-1">{card.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Volatility Chart */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#00E5FF]" />
          Volatility Monitor (60 Days) — Isolation Forest
        </h2>
        <p className="text-xs text-gray-500 mb-5">Red spikes indicate anomaly events detected by the model</p>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={volData}>
            <defs>
              <linearGradient id="volGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={9} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
            <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
            <ReferenceLine y={2.5} stroke="rgba(255,68,68,0.4)" strokeDasharray="5 3" label={{ value: 'Anomaly Threshold', fill: '#ff4444', fontSize: 9 }} />
            <Area
              type="monotone"
              dataKey="volatility"
              stroke="#00E5FF"
              strokeWidth={2}
              fill="url(#volGrad)"
              dot={(props: any) => {
                if (props.payload.anomaly) {
                  return <circle key={props.key} cx={props.cx} cy={props.cy} r={5} fill="#FF4444" stroke="#FF4444" strokeWidth={2} opacity={0.9} />;
                }
                return <g key={props.key} />;
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly Events */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-white/5 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-neon-orange" />
          <h2 className="font-semibold text-white">Detected Anomaly Events</h2>
        </div>
        <div className="divide-y divide-white/5">
          {ANOMALY_EVENTS.map((event, i) => {
            const cfg = severityConfig[event.severity as keyof typeof severityConfig];
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className={`p-4 flex items-start gap-4 border-l-2 ${event.severity === 'critical' ? 'border-l-red-500' : event.severity === 'warning' ? 'border-l-neon-orange' : 'border-l-[#00E5FF]'}`}
              >
                <span className="text-xl flex-shrink-0">{cfg.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="font-semibold text-white text-sm">{event.type}</span>
                    <span className="cyber-tag py-0">{event.symbol}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded border ${cfg.bg} ${cfg.color} font-bold uppercase`}>{event.severity}</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{event.desc}</p>
                  <div className="flex flex-wrap gap-4 text-[10px] text-gray-600">
                    <span>📅 {event.date}</span>
                    <span>⏱️ Duration: {event.duration}</span>
                    {event.drop !== 0 && <span className="text-red-400">📉 Drop: {event.drop}%</span>}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
