import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Menu, TrendingUp, TrendingDown, Clock, X, CheckCheck } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Link } from 'react-router-dom';

function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="hidden md:flex items-center gap-2 text-xs font-mono">
      <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
      <span className="text-gray-400">
        {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })}
      </span>
      <span className="text-gray-600">UTC</span>
    </div>
  );
}

interface NavbarProps {
  onMenuToggle: () => void;
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const { stocks, notifications, markNotificationRead, markAllNotificationsRead, isMarketOpen } = useMarketStore();
  const { user } = useAuthStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const topMovers = stocks.slice(0, 6);
  const filtered = searchQuery
    ? stocks.filter((s) => s.symbol.includes(searchQuery.toUpperCase()) || s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <header className="glass-nav sticky top-0 z-30 h-16 flex items-center px-4 md:px-6 gap-4">
      {/* Mobile Menu */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition"
      >
        <Menu className="w-5 h-5 text-gray-400" />
      </button>

      {/* Market Status */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/3 border border-white/5">
        <div className={`w-2 h-2 rounded-full ${isMarketOpen ? 'bg-neon-green animate-pulse' : 'bg-red-500'}`} />
        <span className="text-xs font-medium text-gray-300">
          {isMarketOpen ? 'Market Open' : 'Market Closed'}
        </span>
      </div>

      {/* Ticker */}
      <div className="flex-1 overflow-hidden hidden lg:block">
        <div className="ticker-wrap">
          <div className="ticker-content flex items-center gap-6">
            {[...topMovers, ...topMovers].map((stock, i) => (
              <div key={i} className="flex items-center gap-2 text-xs whitespace-nowrap">
                <span className="font-mono font-bold text-white">{stock.symbol}</span>
                <span className="text-gray-400">{formatCurrency(stock.price)}</span>
                <span className={stock.changePercent >= 0 ? 'text-neon-green' : 'text-red-400'}>
                  {formatPercent(stock.changePercent)}
                </span>
                {stock.changePercent >= 0 ? (
                  <TrendingUp className="w-3 h-3 text-neon-green" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        <LiveClock />

        {/* Search */}
        <div className="relative">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition text-gray-400 hover:text-white"
          >
            <Search className="w-4 h-4" />
          </button>
          <AnimatePresence>
            {searchOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-80 glass rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="p-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <input
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search stocks (AAPL, Tesla...)"
                      className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
                    />
                    <button onClick={() => { setSearchOpen(false); setSearchQuery(''); }}>
                      <X className="w-4 h-4 text-gray-500 hover:text-gray-300" />
                    </button>
                  </div>
                </div>
                {filtered.length > 0 && (
                  <div className="max-h-64 overflow-y-auto">
                    {filtered.map((stock) => (
                      <div
                        key={stock.symbol}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/3 cursor-pointer transition"
                        onClick={() => setSearchOpen(false)}
                      >
                        <div>
                          <div className="text-sm font-semibold text-white">{stock.symbol}</div>
                          <div className="text-xs text-gray-500 truncate max-w-[180px]">{stock.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-mono text-white">{formatCurrency(stock.price)}</div>
                          <div className={`text-xs ${stock.changePercent >= 0 ? 'text-neon-green' : 'text-red-400'}`}>
                            {formatPercent(stock.changePercent)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searchQuery && filtered.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">No results for "{searchQuery}"</div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-white/5 transition text-gray-400 hover:text-white"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#00E5FF] text-black text-[9px] font-bold flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-12 w-80 glass rounded-xl border border-white/10 overflow-hidden"
              >
                <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  <button
                    onClick={markAllNotificationsRead}
                    className="flex items-center gap-1 text-xs text-[#00E5FF] hover:text-cyan-300"
                  >
                    <CheckCheck className="w-3 h-3" />
                    Mark all read
                  </button>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-white/3">
                  {notifications.map((notif) => (
                    <div
                      key={notif.id}
                      onClick={() => markNotificationRead(notif.id)}
                      className={`px-4 py-3 cursor-pointer hover:bg-white/3 transition ${!notif.read ? 'bg-cyan-500/5' : ''}`}
                    >
                      <div className="flex items-start gap-2">
                        {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] mt-1.5 flex-shrink-0" />}
                        <div className={!notif.read ? '' : 'ml-3.5'}>
                          <p className="text-xs font-semibold text-white">{notif.title}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{notif.message}</p>
                          <p className="text-[10px] text-gray-600 mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* User Avatar */}
        <Link to="/profile">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center overflow-hidden cursor-pointer ring-2 ring-[#00E5FF]/20 hover:ring-[#00E5FF]/50 transition">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-black">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
