import { motion } from 'framer-motion';
import { Star, TrendingUp, TrendingDown, Minus, Brain, AlertCircle, CheckCircle } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency } from '@/lib/utils';

const RECOMMENDATIONS = [
  { symbol: 'NVDA', name: 'NVIDIA Corp.', action: 'BUY' as const, price: 875.22, target: 1050.00, stopLoss: 820.00, confidence: 89, timeframe: '30 Days', riskLevel: 'medium' as const, expectedReturn: 19.97, reasoning: ['LSTM model shows strong bullish momentum', 'RSI at 61 — room to run before overbought', 'Positive FinBERT score +0.88 on AI-related news', 'Volume breakout above 90-day average by 145%'] },
  { symbol: 'META', name: 'Meta Platforms', action: 'BUY' as const, price: 516.72, target: 590.00, stopLoss: 490.00, confidence: 76, timeframe: '30 Days', riskLevel: 'low' as const, expectedReturn: 14.19, reasoning: ['GRU predicts strong upward trend', 'MACD shows bullish crossover', 'Positive sentiment surge from AI announcements', 'Strong earnings beat last quarter'] },
  { symbol: 'TSLA', name: 'Tesla Inc.', action: 'SELL' as const, price: 234.56, target: 195.00, stopLoss: 252.00, confidence: 81, timeframe: '14 Days', riskLevel: 'high' as const, expectedReturn: -16.84, reasoning: ['Bearish RSI divergence detected', 'FinBERT score -0.34 due to delivery miss news', 'Death cross pattern forming on daily chart', 'Increased competition from BYD and Rivian'] },
  { symbol: 'AAPL', name: 'Apple Inc.', action: 'HOLD' as const, price: 189.43, target: 200.00, stopLoss: 178.00, confidence: 72, timeframe: '30 Days', riskLevel: 'low' as const, expectedReturn: 5.58, reasoning: ['Consolidation phase after recent 10% run', 'Mixed sentiment around iPhone 17 cycle', 'Strong support at $182 level', 'Await Q4 earnings catalyst'] },
];

const ActionIcon = ({ action }: { action: string }) => {
  if (action === 'BUY') return <TrendingUp className="w-5 h-5 text-neon-green" />;
  if (action === 'SELL') return <TrendingDown className="w-5 h-5 text-red-400" />;
  return <Minus className="w-5 h-5 text-neon-orange" />;
};

const riskColor: Record<string, string> = {
  low: 'text-neon-green bg-neon-green/10 border-neon-green/20',
  medium: 'text-neon-orange bg-neon-orange/10 border-neon-orange/20',
  high: 'text-red-400 bg-red-400/10 border-red-400/20',
};

export default function RecommendationsPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">AI Recommendations</h1>
        <p className="text-gray-400 text-sm mt-1">Buy, Sell & Hold signals powered by ensemble AI models</p>
      </div>

      {/* Summary Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-wrap gap-4">
        {[
          { label: 'Buy Signals', count: 2, color: 'text-neon-green', bg: 'bg-neon-green/10' },
          { label: 'Sell Signals', count: 1, color: 'text-red-400', bg: 'bg-red-400/10' },
          { label: 'Hold Signals', count: 1, color: 'text-neon-orange', bg: 'bg-neon-orange/10' },
          { label: 'Avg Confidence', count: '79%', color: 'text-[#00E5FF]', bg: 'bg-[#00E5FF]/10' },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${s.bg}`}>
            <span className={`text-2xl font-black ${s.color}`}>{s.count}</span>
            <span className="text-xs text-gray-400">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Recommendation Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {RECOMMENDATIONS.map((rec, i) => (
          <motion.div
            key={rec.symbol}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-2xl p-5"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{rec.symbol.slice(0, 2)}</span>
                </div>
                <div>
                  <div className="text-base font-bold text-white">{rec.symbol}</div>
                  <div className="text-xs text-gray-500">{rec.name}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ActionIcon action={rec.action} />
                <span className={rec.action === 'BUY' ? 'badge-buy' : rec.action === 'SELL' ? 'badge-sell' : 'badge-hold'} style={{ fontSize: 12, padding: '3px 10px' }}>
                  {rec.action}
                </span>
              </div>
            </div>

            {/* Price Targets */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-white/3 border border-white/5">
                <div className="text-[10px] text-gray-500 mb-1">Current</div>
                <div className="text-sm font-mono font-bold text-white">{formatCurrency(rec.price)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-[#00E5FF]/5 border border-[#00E5FF]/15">
                <div className="text-[10px] text-[#00E5FF] mb-1">Target</div>
                <div className="text-sm font-mono font-bold text-[#00E5FF]">{formatCurrency(rec.target)}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-red-500/5 border border-red-500/15">
                <div className="text-[10px] text-red-400 mb-1">Stop Loss</div>
                <div className="text-sm font-mono font-bold text-red-400">{formatCurrency(rec.stopLoss)}</div>
              </div>
            </div>

            {/* Confidence Bar */}
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs text-gray-400">AI Confidence</span>
              <div className="flex-1 neon-progress">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${rec.confidence}%` }}
                  transition={{ delay: i * 0.1 + 0.3, duration: 0.8 }}
                  className="neon-progress-bar"
                />
              </div>
              <span className="text-xs font-bold text-[#00E5FF]">{rec.confidence}%</span>
            </div>

            {/* Meta */}
            <div className="flex items-center gap-3 mb-4 text-xs">
              <span className={`px-2 py-0.5 rounded border capitalize ${riskColor[rec.riskLevel]}`}>{rec.riskLevel} risk</span>
              <span className="text-gray-500">{rec.timeframe}</span>
              <span className={`ml-auto font-bold ${rec.expectedReturn >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {rec.expectedReturn >= 0 ? '+' : ''}{rec.expectedReturn.toFixed(2)}% expected
              </span>
            </div>

            {/* Reasoning */}
            <div className="space-y-1.5">
              <div className="text-[10px] text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <Brain className="w-3 h-3" /> AI Reasoning
              </div>
              {rec.reasoning.map((r, j) => (
                <div key={j} className="flex items-start gap-2 text-xs text-gray-400">
                  <CheckCircle className="w-3 h-3 text-[#00E5FF] flex-shrink-0 mt-0.5" />
                  {r}
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
