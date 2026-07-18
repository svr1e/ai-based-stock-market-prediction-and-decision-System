import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, Trash2, Bell, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useMarketStore } from '@/store/marketStore';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function WatchlistPage() {
  const { stocks, watchlist, addToWatchlist, removeFromWatchlist } = useMarketStore();
  const [showAdd, setShowAdd] = useState(false);
  const [alertSymbol, setAlertSymbol] = useState('');
  const [alertPrice, setAlertPrice] = useState('');
  const [alertType, setAlertType] = useState<'above' | 'below'>('above');

  const handleAdd = () => {
    const stock = stocks.find((s) => s.symbol === alertSymbol);
    if (!stock) return;
    addToWatchlist({
      id: Date.now().toString(),
      symbol: stock.symbol,
      name: stock.name,
      price: stock.price,
      change: stock.change,
      changePercent: stock.changePercent,
      alertPrice: alertPrice ? parseFloat(alertPrice) : undefined,
      alertType: alertPrice ? alertType : undefined,
      addedAt: new Date().toISOString(),
    });
    setShowAdd(false);
    setAlertPrice('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-white">Watchlist</h1>
          <p className="text-gray-400 text-sm mt-1">Track your favorite stocks with price alerts</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => setShowAdd(true)}
          className="neon-button px-5 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Stock
        </motion.button>
      </div>

      {watchlist.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">Your watchlist is empty</p>
          <p className="text-gray-600 text-sm mt-1">Add stocks to track them here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {watchlist.map((item, i) => {
              const liveStock = stocks.find((s) => s.symbol === item.symbol);
              const price = liveStock?.price || item.price;
              const change = liveStock?.changePercent || item.changePercent;
              const bullish = change >= 0;
              const alertTriggered = item.alertPrice && (item.alertType === 'above' ? price >= item.alertPrice : price <= item.alertPrice);

              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.08 }}
                  className={`glass-card rounded-2xl p-5 ${alertTriggered ? 'border-neon-orange/40 bg-neon-orange/5' : ''}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{item.symbol.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-bold text-white">{item.symbol}</div>
                        <div className="text-xs text-gray-500 truncate max-w-[120px]">{item.name}</div>
                      </div>
                    </div>
                    <button onClick={() => removeFromWatchlist(item.id)} className="text-gray-600 hover:text-red-400 transition p-1">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-end justify-between mb-3">
                    <div>
                      <div className="text-2xl font-bold font-mono text-white">{formatCurrency(price)}</div>
                      <div className={`flex items-center gap-1 text-sm font-semibold mt-0.5 ${bullish ? 'text-neon-green' : 'text-red-400'}`}>
                        {bullish ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {formatPercent(change)}
                      </div>
                    </div>
                  </div>

                  {item.alertPrice && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs ${alertTriggered ? 'bg-neon-orange/15 border border-neon-orange/30 text-neon-orange' : 'bg-white/3 border border-white/5 text-gray-400'}`}>
                      <Bell className="w-3.5 h-3.5" />
                      Alert {item.alertType === 'above' ? '↑' : '↓'} {formatCurrency(item.alertPrice)}
                      {alertTriggered && <span className="ml-auto font-bold">🔔 TRIGGERED</span>}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAdd(false)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              onClick={(e) => e.stopPropagation()}
              className="glass rounded-2xl p-6 w-full max-w-sm border border-white/10"
            >
              <h3 className="text-lg font-bold text-white mb-5">Add to Watchlist</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Stock</label>
                  <select value={alertSymbol} onChange={(e) => setAlertSymbol(e.target.value)} className="cyber-input">
                    <option value="" style={{ background: '#0A0F1E' }}>Select symbol...</option>
                    {stocks.map((s) => <option key={s.symbol} value={s.symbol} style={{ background: '#0A0F1E' }}>{s.symbol} — {s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-400 block mb-1.5">Price Alert (optional)</label>
                  <div className="flex gap-2">
                    <select value={alertType} onChange={(e) => setAlertType(e.target.value as any)} className="cyber-input w-24">
                      <option value="above" style={{ background: '#0A0F1E' }}>Above</option>
                      <option value="below" style={{ background: '#0A0F1E' }}>Below</option>
                    </select>
                    <input type="number" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} placeholder="Price" className="cyber-input flex-1" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAdd(false)} className="outline-neon-button flex-1 py-2.5 rounded-xl text-sm font-semibold">Cancel</button>
                <button onClick={handleAdd} disabled={!alertSymbol} className="neon-button flex-1 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">Add</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
