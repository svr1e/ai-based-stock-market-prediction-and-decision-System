import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useMarketStore } from '@/store/marketStore';

export default function DashboardLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { updateStockPrices } = useMarketStore();

  // Simulate live price updates every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      updateStockPrices();
    }, 3000);
    return () => clearInterval(interval);
  }, [updateStockPrices]);

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
