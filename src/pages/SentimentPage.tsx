import { useState } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, TrendingUp, TrendingDown, Minus, Globe, MessageSquare } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Cell } from 'recharts';

const SENTIMENT_STOCKS = [
  { symbol: 'AAPL', overall: 'positive', score: 0.72, confidence: 0.89, newsCount: 47, twitterCount: 12400, fearGreed: 68 },
  { symbol: 'NVDA', overall: 'positive', score: 0.88, confidence: 0.93, newsCount: 89, twitterCount: 28700, fearGreed: 81 },
  { symbol: 'TSLA', overall: 'negative', score: -0.34, confidence: 0.76, newsCount: 112, twitterCount: 45200, fearGreed: 41 },
  { symbol: 'META', overall: 'positive', score: 0.54, confidence: 0.81, newsCount: 33, twitterCount: 9800, fearGreed: 65 },
  { symbol: 'MSFT', overall: 'positive', score: 0.61, confidence: 0.87, newsCount: 28, twitterCount: 7300, fearGreed: 70 },
  { symbol: 'AMD', overall: 'negative', score: -0.21, confidence: 0.71, newsCount: 41, twitterCount: 15600, fearGreed: 48 },
];

const TREND_DATA = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(); d.setDate(d.getDate() - (13 - i));
  return {
    date: d.toISOString().split('T')[0].slice(5),
    positive: Math.round(40 + Math.random() * 30),
    negative: Math.round(10 + Math.random() * 25),
    neutral: Math.round(15 + Math.random() * 20),
  };
});

const RADAR_DATA = [
  { subject: 'News', A: 72 }, { subject: 'Twitter', A: 68 }, { subject: 'Reddit', A: 58 },
  { subject: 'Analyst', A: 81 }, { subject: 'Earnings', A: 64 }, { subject: 'Options', A: 55 },
];

export default function SentimentPage() {
  const [selected, setSelected] = useState(SENTIMENT_STOCKS[0]);

  const getSentimentColor = (s: string) => s === 'positive' ? 'text-neon-green' : s === 'negative' ? 'text-red-400' : 'text-gray-400';
  const getSentimentBg = (s: string) => s === 'positive' ? 'bg-neon-green/10 border-neon-green/20' : s === 'negative' ? 'bg-red-400/10 border-red-400/20' : 'bg-gray-400/10 border-gray-400/20';

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-white">Sentiment Analysis</h1>
        <p className="text-gray-400 text-sm mt-1">FinBERT-powered NLP on news, Twitter & Reddit</p>
      </div>

      {/* Sentiment Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {SENTIMENT_STOCKS.map((s, i) => (
          <motion.div
            key={s.symbol}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            onClick={() => setSelected(s)}
            className={`glass-card rounded-xl p-4 cursor-pointer transition ${selected.symbol === s.symbol ? 'border-[#00E5FF]/40 bg-[#00E5FF]/5' : ''}`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-white">{s.symbol}</span>
              {s.overall === 'positive' ? <TrendingUp className="w-4 h-4 text-neon-green" /> : s.overall === 'negative' ? <TrendingDown className="w-4 h-4 text-red-400" /> : <Minus className="w-4 h-4 text-gray-400" />}
            </div>
            <div className={`text-xs font-medium capitalize px-2 py-0.5 rounded border inline-block ${getSentimentBg(s.overall)}`}>
              <span className={getSentimentColor(s.overall)}>{s.overall}</span>
            </div>
            <div className="mt-2 neon-progress">
              <div
                className="neon-progress-bar"
                style={{
                  width: `${Math.abs(s.score) * 100}%`,
                  background: s.overall === 'positive' ? 'linear-gradient(90deg,#00FF88,#00E5FF)' : 'linear-gradient(90deg,#FF4444,#FF0080)',
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Sentiment Trend Chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00E5FF]" />
            Market Sentiment Trend (14 Days)
          </h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={TREND_DATA} barSize={12} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#6b7280', fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: 'rgba(10,15,30,0.95)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="positive" stackId="a" fill="#00FF88" radius={[0, 0, 0, 0]} />
              <Bar dataKey="neutral" stackId="a" fill="#6b7280" />
              <Bar dataKey="negative" stackId="a" fill="#FF4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-6 mt-3 text-xs">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-neon-green" /><span className="text-gray-400">Positive</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-gray-500" /><span className="text-gray-400">Neutral</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm bg-red-400" /><span className="text-gray-400">Negative</span></div>
          </div>
        </div>

        {/* Radar */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#7B2FFF]" />
            {selected.symbol} Sentiment Radar
          </h2>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={RADAR_DATA}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
              <Radar name="Score" dataKey="A" stroke="#00E5FF" fill="#00E5FF" fillOpacity={0.15} />
            </RadarChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">News Articles</span>
              <span className="text-white font-medium">{selected.newsCount}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Twitter Mentions</span>
              <span className="text-white font-medium">{selected.twitterCount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">FinBERT Score</span>
              <span className={`font-bold ${selected.score >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {selected.score >= 0 ? '+' : ''}{(selected.score * 100).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-400">Fear & Greed</span>
              <span className="text-[#00E5FF] font-bold">{selected.fearGreed} / 100</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
