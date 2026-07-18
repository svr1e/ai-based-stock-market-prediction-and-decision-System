import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, TrendingUp, Brain, Briefcase, BarChart2,
  Newspaper, Shield, Star, AlertTriangle, GitCompare, Heart,
  MessageSquare, Settings, User, ChevronLeft, Zap, LogOut,
  Activity, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { label: 'Stocks', icon: TrendingUp, path: '/stocks' },
  { label: 'Predictions', icon: Brain, path: '/predictions', badge: 'AI' },
  { label: 'Portfolio', icon: Briefcase, path: '/portfolio' },
  { label: 'Analytics', icon: BarChart2, path: '/analytics' },
  { label: 'Sentiment', icon: Newspaper, path: '/sentiment' },
  { label: 'Risk Analysis', icon: Shield, path: '/risk' },
  { label: 'Recommendations', icon: Star, path: '/recommendations', badge: 'New' },
  { label: 'Crash Detection', icon: AlertTriangle, path: '/crash-detection' },
  { label: 'Comparison', icon: GitCompare, path: '/comparison' },
  { label: 'Watchlist', icon: Heart, path: '/watchlist' },
  { label: 'AI Chatbot', icon: MessageSquare, path: '/chatbot', badge: 'Beta' },
];

const bottomItems = [
  { label: 'Settings', icon: Settings, path: '/settings' },
  { label: 'Profile', icon: User, path: '/profile' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 h-16 border-b border-white/5">
        <AnimatePresence mode="wait">
          {!collapsed ? (
            <motion.div
              key="full-logo"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
                  <Activity className="w-4 h-4 text-black" />
                </div>
                <div className="absolute inset-0 rounded-lg animate-pulse-neon opacity-60" />
              </div>
              <div>
                <span className="font-display font-bold text-white text-lg tracking-tight">Stock</span>
                <span className="font-display font-bold text-[#00E5FF] text-lg tracking-tight">AI</span>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="icon-logo"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center mx-auto"
            >
              <Activity className="w-4 h-4 text-black" />
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          onClick={onToggle}
          className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg hover:bg-white/5 transition-colors"
        >
          <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
            <ChevronLeft className="w-4 h-4 text-gray-400" />
          </motion.div>
        </button>

        <button onClick={onMobileClose} className="lg:hidden text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* AI Badge */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mt-3 mb-2 px-3 py-2 rounded-lg bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/15"
        >
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="text-[11px] font-medium text-[#00E5FF]">AI-Powered Platform</span>
            <span className="ml-auto w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          </div>
        </motion.div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onMobileClose}
              className={({ isActive }) =>
                `sidebar-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="flex-1 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
              {!collapsed && item.badge && (
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/30">
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="mx-4 border-t border-white/5" />

      {/* Bottom Items */}
      <div className="px-3 py-2 space-y-0.5">
        {bottomItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onMobileClose}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span className="flex-1 truncate">{item.label}</span>}
          </NavLink>
        ))}

        <button
          onClick={logout}
          className="sidebar-item w-full text-red-400/70 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span className="flex-1">Logout</span>}
        </button>
      </div>

      {/* User Profile */}
      {!collapsed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mx-4 mb-4 mt-2 p-3 rounded-xl bg-white/3 border border-white/5 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center flex-shrink-0 overflow-hidden">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="text-xs font-bold text-black">
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.displayName || 'User'}
            </p>
            <p className="text-[10px] text-gray-500 truncate">{user?.email}</p>
          </div>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#00E5FF]/15 text-[#00E5FF]">PRO</span>
        </motion.div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden lg:flex flex-col glass-nav border-r border-white/5 h-screen sticky top-0 overflow-hidden"
      >
        <SidebarContent />
      </motion.aside>

      {/* Mobile Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-64 z-50 lg:hidden glass-nav border-r border-white/5"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
