import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, TrendingDown, Brain, Shield, BarChart2,
  Newspaper, Star, ArrowUpRight, ArrowDownRight, RefreshCw, Zap
} from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { usePortfolioStore } from '@/store/portfolioStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatPercent, formatNumber } from '@/lib/utils';
import StatCard from '@/components/cards/StatCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import CountUp from 'react-countup';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass rounded-lg px-3 py-2 border border-white/10 text-xs">
        <p className="text-gray-400 mb-1">{label}</p>
        <p className="text-[#00E5FF] font-bold">{formatCurrency(payload[0].value)}</p>
      </div>
    );
  }
  return null;
};

function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  return (
    <ResponsiveContainer width="100%" height={40}>
      <AreaChart data={data.map((v, i) => ({ v, i }))}>
        <Area
          type="monotone"
          dataKey="v"
          stroke={positive ? '#00FF88' : '#FF4444'}
          strokeWidth={1.5}
          fill={positive ? 'rgba(0,255,136,0.08)' : 'rgba(255,68,68,0.08)'}
          dot={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

const MOCK_PREDICTIONS = [
  { symbol: 'NVDA', action: 'BUY', confidence: 89, price: 875.22, target: 950.00, model: 'LSTM' },
  { symbol: 'AAPL', action: 'HOLD', confidence: 72, price: 189.43, target: 195.00, model: 'XGBoost' },
  { symbol: 'TSLA', action: 'SELL', confidence: 81, price: 234.56, target: 210.00, model: 'GRU' },
  { symbol: 'META', action: 'BUY', confidence: 76, price: 516.72, target: 560.00, model: 'Ensemble' },
];

const MOCK_NEWS = [
  { title: 'NVIDIA hits record-high GPU demand amid AI boom', sentiment: 'positive', time: '2m ago', symbol: 'NVDA' },
  { title: 'Apple faces headwinds in China market expansion', sentiment: 'negative', time: '18m ago', symbol: 'AAPL' },
  { title: 'Fed signals potential rate cuts in Q1 2027', sentiment: 'positive', time: '45m ago', symbol: 'MARKET' },
  { title: 'Tesla EV delivery numbers beat estimates by 12%', sentiment: 'positive', time: '1h ago', symbol: 'TSLA' },
  { title: 'Meta AI investment raises profitability concerns', sentiment: 'negative', time: '2h ago', symbol: 'META' },
];

const SECTOR_DATA = [
  { sector: 'Technology', change: 2.34 },
  { sector: 'Financial', change: 0.87 },
  { sector: 'Healthcare', change: -0.43 },
  { sector: 'Energy', change: 1.21 },
  { sector: 'Consumer', change: -0.78 },
  { sector: 'Automotive', change: -1.92 },
];

export default function DashboardPage() {
  const { stocks } = useMarketStore();
  const { portfolio } = usePortfolioStore();
  const { user } = useAuthStore();

  const topGainers = [...stocks].sort((a, b) => b.changePercent - a.changePercent).slice(0, 5);
  const topLosers = [...stocks].sort((a, b) => a.changePercent - b.changePercent).slice(0, 5);

  const portfolioData = portfolio.performanceHistory.slice(-30);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div>
          <h1 className="font-display text-2xl font-bold text-white">
            Welcome back, {user?.displayName?.split(' ')[0] || 'Trader'} 👋
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-neon-green/10 border border-neon-green/20">
            <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
            <span className="text-xs font-medium text-neon-green">Markets Open</span>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:text-white hover:bg-white/8 transition">
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </motion.div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          title="Portfolio Value"
          value={<CountUp end={portfolio.totalValue} prefix="$" decimals={0} separator="," duration={1.5} />}
          change={portfolio.dayPnlPercent}
          changeLabel="today"
          icon={<DollarSign className="w-5 h-5" />}
          iconColor="text-[#00E5FF]"
          delay={0}
          className="col-span-2 xl:col-span-1"
        />
        <StatCard
          title="Today's P&L"
          value={<span className={portfolio.dayPnl >= 0 ? 'text-neon-green' : 'text-red-400'}>{portfolio.dayPnl >= 0 ? '+' : ''}{formatCurrency(portfolio.dayPnl)}</span>}
          change={portfolio.dayPnlPercent}
          icon={portfolio.dayPnl >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
          iconColor={portfolio.dayPnl >= 0 ? 'text-neon-green' : 'text-red-400'}
          delay={0.05}
        />
        <StatCard
          title="AI Confidence"
          value="84.2%"
          subtitle="Avg across predictions"
          change={2.1}
          changeLabel="vs yesterday"
          icon={<Brain className="w-5 h-5" />}
          iconColor="text-[#7B2FFF]"
          delay={0.1}
        />
        <StatCard
          title="Sentiment"
          value="Bullish"
          subtitle="Fear & Greed: 68"
          change={4.5}
          changeLabel="score"
          icon={<Newspaper className="w-5 h-5" />}
          iconColor="text-neon-green"
          delay={0.15}
        />
        <StatCard
          title="Risk Score"
          value="Medium"
          subtitle="Score: 52 / 100"
          icon={<Shield className="w-5 h-5" />}
          iconColor="text-neon-orange"
          delay={0.2}
        />
        <StatCard
          title="Invest. Score"
          value="8.4 / 10"
          subtitle="Overall portfolio rating"
          change={0.6}
          icon={<Star className="w-5 h-5" />}
          iconColor="text-[#00E5FF]"
          delay={0.25}
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Portfolio Chart */}
        <div className="xl:col-span-2 glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-semibold text-white">Portfolio Performance</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 30 days</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-neon-green">
                +{formatPercent(portfolio.totalPnlPercent)}
              </span>
              <span className="text-xs text-gray-500">overall</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="portfolioGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => v.slice(5)}
                interval={5}
              />
              <YAxis
                tick={{ fill: '#6b7280', fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}K`}
                width={50}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#00E5FF"
                strokeWidth={2}
                fill="url(#portfolioGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* AI Predictions */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-5">
            <Brain className="w-4 h-4 text-[#7B2FFF]" />
            <h2 className="font-semibold text-white">AI Predictions</h2>
            <span className="ml-auto text-[9px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">LIVE</span>
          </div>
          <div className="space-y-3">
            {MOCK_PREDICTIONS.map((pred) => (
              <div key={pred.symbol} className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/5 hover:border-white/10 transition">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold text-white">{pred.symbol}</span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      pred.action === 'BUY' ? 'badge-buy' : pred.action === 'SELL' ? 'badge-sell' : 'badge-hold'
                    }`}>
                      {pred.action}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 neon-progress">
                      <div
                        className="neon-progress-bar"
                        style={{ width: `${pred.confidence}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-[#00E5FF]">{pred.confidence}%</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-xs font-mono text-white">${pred.target.toFixed(0)}</div>
                  <div className="text-[9px] text-gray-500">{pred.model}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Gainers / Losers */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-neon-green" />
            Top Gainers
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">Price</th>
                <th className="text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {topGainers.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <div className="font-semibold text-white text-xs">{stock.symbol}</div>
                    <div className="text-[10px] text-gray-500 truncate max-w-[80px]">{stock.name.split(' ')[0]}</div>
                  </td>
                  <td className="text-right font-mono text-xs text-white">{formatCurrency(stock.price)}</td>
                  <td className="text-right">
                    <span className="text-xs font-semibold text-neon-green flex items-center justify-end gap-0.5">
                      <ArrowUpRight className="w-3 h-3" />
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top Losers */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-400" />
            Top Losers
          </h2>
          <table className="data-table">
            <thead>
              <tr>
                <th>Symbol</th>
                <th className="text-right">Price</th>
                <th className="text-right">Change</th>
              </tr>
            </thead>
            <tbody>
              {topLosers.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <div className="font-semibold text-white text-xs">{stock.symbol}</div>
                    <div className="text-[10px] text-gray-500 truncate max-w-[80px]">{stock.name.split(' ')[0]}</div>
                  </td>
                  <td className="text-right font-mono text-xs text-white">{formatCurrency(stock.price)}</td>
                  <td className="text-right">
                    <span className="text-xs font-semibold text-red-400 flex items-center justify-end gap-0.5">
                      <ArrowDownRight className="w-3 h-3" />
                      {Math.abs(stock.changePercent).toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* News Feed */}
        <div className="glass-card rounded-2xl p-5">
          <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#00E5FF]" />
            Market News
          </h2>
          <div className="space-y-3">
            {MOCK_NEWS.map((news, i) => (
              <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-lg hover:bg-white/3 transition cursor-pointer group">
                <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${
                  news.sentiment === 'positive' ? 'bg-neon-green' : 'bg-red-400'
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-300 leading-snug group-hover:text-white transition line-clamp-2">
                    {news.title}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-gray-600">{news.time}</span>
                    <span className="cyber-tag py-0 px-1.5 text-[9px]">{news.symbol}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Sector Heatmap */}
      <div className="glass-card rounded-2xl p-5">
        <h2 className="font-semibold text-white mb-5 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-[#00E5FF]" />
          Sector Performance
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {SECTOR_DATA.map((sector) => (
            <div
              key={sector.sector}
              className="flex flex-col items-center justify-center p-3 rounded-xl border transition"
              style={{
                backgroundColor: sector.change >= 0
                  ? `rgba(0,255,136,${Math.min(0.2, Math.abs(sector.change) * 0.06)})`
                  : `rgba(255,68,68,${Math.min(0.2, Math.abs(sector.change) * 0.06)})`,
                borderColor: sector.change >= 0
                  ? `rgba(0,255,136,${Math.min(0.3, Math.abs(sector.change) * 0.1)})`
                  : `rgba(255,68,68,${Math.min(0.3, Math.abs(sector.change) * 0.1)})`,
              }}
            >
              <span className="text-[10px] text-gray-400 text-center leading-tight mb-1">{sector.sector}</span>
              <span className={`text-sm font-bold ${sector.change >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
