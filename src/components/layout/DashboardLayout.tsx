import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useMarketStore } from '@/store/marketStore';
import { usePortfolioStore } from '@/store/portfolioStore';

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const fetchLiveStocks = useMarketStore((s) => s.fetchLiveStocks);
  const fetchPortfolio = usePortfolioStore((s) => s.fetchPortfolio);

  // Fetch live market data & portfolio once on layout mount
  useEffect(() => {
    fetchLiveStocks();
    fetchPortfolio();
  }, [fetchLiveStocks, fetchPortfolio]);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050816]">
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed((c) => !c)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <Navbar onMenuToggle={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
