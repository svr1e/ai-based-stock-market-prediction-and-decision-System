import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, TrendingUp, TrendingDown, Minus, ChevronDown, Info } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const MODELS = ['Ensemble', 'LSTM', 'GRU', 'XGBoost', 'Random Forest'];
const TIMEFRAMES = ['1 Day', '7 Days', '30 Days', '90 Days'];

const generatePredictionData = (currentPrice: number, days: number, trend: 'bullish' | 'bearish' | 'sideways') => {
  const data = [];
  let price = currentPrice;
  const trendFactor = trend === 'bullish' ? 0.003 : trend === 'bearish' ? -0.003 : 0.0005;
  const past = 30;

  for (let i = -past; i <= days; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const noise = (Math.random() - 0.48) * price * 0.015;
    price = price + noise + price * trendFactor;
    data.push({
      date: d.toISOString().split('T')[0],
      actual: i <= 0 ? parseFloat(price.toFixed(2)) : undefined,
      predicted: parseFloat(price.toFixed(2)),
    });
  }
  return data;
};

const SHAP_FEATURES = [
  { feature: 'RSI (14)', importance: 0.28, direction: 'positive' },
  { feature: 'MACD Signal', importance: 0.22, direction: 'positive' },
  { feature: 'Volume Trend', importance: 0.18, direction: 'positive' },
  { feature: 'Sentiment Score', importance: 0.15, direction: 'positive' },
  { feature: 'Bollinger Band', importance: 0.10, direction: 'negative' },
  { feature: 'EMA Cross', importance: 0.07, direction: 'negative' },
];

export default function PredictionsPage() {
  const { stocks, selectedSymbol, setSelectedSymbol } = useMarketStore();
  const [model, setModel] = useState('Ensemble');
  const [timeframe, setTimeframe] = useState('7 Days');
  const [isLoading, setIsLoading] = useState(false);

  const stock = stocks.find((s) => s.symbol === selectedSymbol) || stocks[0];
  const days = timeframe === '1 Day' ? 1 : timeframe === '7 Days' ? 7 : timeframe === '30 Days' ? 30 : 90;
  const trend = stock.changePercent > 0 ? 'bullish' : stock.changePercent < -1 ? 'bearish' : 'sideways';
  const predData = generatePredictionData(stock.price, days, trend);
  const predictedPrice = predData[predData.length - 1].predicted;
  const priceChange = ((predictedPrice - stock.price) / stock.price) * 100;
  const confidence = 72 + Math.random() * 20;

  const simulatePredict = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1200);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">AI Predictions</h1>
        <p className="text-gray-400 text-sm mt-1">Multi-model ensemble price forecasting</p>
      </div>

      {/* Controls */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Stock Selector */}
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1.5 block">Stock</label>
            <div className="relative">
              <select
                value={selectedSymbol}
                onChange={(e) => setSelectedSymbol(e.target.value)}
                className="cyber-input appearance-none pr-8 cursor-pointer"
              >
                {stocks.map((s) => (
                  <option key={s.symbol} value={s.symbol} style={{ background: '#0A0F1E' }}>
                    {s.symbol} — {s.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Model */}
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1.5 block">AI Model</label>
            <div className="flex gap-2 flex-wrap">
              {MODELS.map((m) => (
                <button
                  key={m}
                  onClick={() => setModel(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    model === m ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30' : 'bg-white/3 text-gray-400 border border-white/5 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* Timeframe */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Forecast</label>
            <div className="flex gap-2">
              {TIMEFRAMES.map((t) => (
                <button
                  key={t}
                  onClick={() => setTimeframe(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    timeframe === t ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30' : 'bg-white/3 text-gray-400 border border-white/5 hover:text-white'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-end">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={simulatePredict}
              disabled={isLoading}
              className="neon-button px-6 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 disabled:opacity-60"
            >
              {isLoading ? <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" /> : <Brain className="w-4 h-4" />}
              {isLoading ? 'Predicting...' : 'Run Prediction'}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Result Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Current Price', value: formatCurrency(stock.price), sub: stock.symbol },
          {
            label: 'Predicted Price',
            value: formatCurrency(predictedPrice),
            sub: timeframe,
            highlight: true,
          },
          {
            label: 'Expected Change',
            value: `${priceChange >= 0 ? '+' : ''}${priceChange.toFixed(2)}%`,
            sub: trend,
            color: priceChange >= 0 ? 'text-neon-green' : 'text-red-400',
          },
          {
            label: 'Confidence',
            value: `${confidence.toFixed(1)}%`,
            sub: model,
            color: 'text-[#7B2FFF]',
          },
        ].map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`stat-card ${card.highlight ? 'border-[#00E5FF]/30 bg-[#00E5FF]/5' : ''}`}
          >
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">{card.label}</p>
            <p className={`text-xl font-bold font-mono ${card.color || 'text-white'}`}>{card.value}</p>
            <p className="text-[10px] text-gray-500 mt-1 capitalize">{card.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Chart */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-center gap-3 mb-5">
          <h2 className="font-semibold text-white">{stock.symbol} — Price Forecast ({timeframe})</h2>
          <div className="flex items-center gap-4 ml-auto text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#00E5FF]" /><span className="text-gray-400">Actual</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-0.5 bg-[#7B2FFF] border-dashed" style={{ borderTop: '2px dashed #7B2FFF' }} /><span className="text-gray-400">Predicted</span></div>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <AreaChart data={predData}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7B2FFF" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#7B2FFF" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} interval={Math.floor(predData.length / 6)} />
            <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v.toFixed(0)}`} width={55} domain={['auto', 'auto']} />
            <Tooltip
              contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Area type="monotone" dataKey="actual" stroke="#00E5FF" strokeWidth={2} fill="url(#actualGrad)" dot={false} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="#7B2FFF" strokeWidth={2} strokeDasharray="5 4" fill="url(#predGrad)" dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* SHAP Feature Importance */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-2 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#00E5FF]" />
          Explainable AI — SHAP Feature Importance
        </h2>
        <p className="text-xs text-gray-500 mb-5">Why the AI made this prediction</p>
        <div className="space-y-3">
          {SHAP_FEATURES.map((feat, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-gray-400 w-28 flex-shrink-0">{feat.feature}</span>
              <div className="flex-1 neon-progress">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${feat.importance * 100}%` }}
                  transition={{ delay: i * 0.1, duration: 0.6 }}
                  className="h-full rounded-full"
                  style={{
                    background: feat.direction === 'positive'
                      ? 'linear-gradient(90deg, #00FF88, #00E5FF)'
                      : 'linear-gradient(90deg, #FF4444, #FF0080)',
                    boxShadow: feat.direction === 'positive'
                      ? '0 0 8px rgba(0,255,136,0.4)'
                      : '0 0 8px rgba(255,68,68,0.4)',
                  }}
                />
              </div>
              <span className={`text-xs font-mono w-10 text-right ${feat.direction === 'positive' ? 'text-neon-green' : 'text-red-400'}`}>
                {(feat.importance * 100).toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
