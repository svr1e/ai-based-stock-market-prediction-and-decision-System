import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import AppRouter from './router';
import { useAuthStore } from './store/authStore';
import './styles/globals.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const { initialize } = useAuthStore();
  useEffect(() => {
    initialize();
  }, [initialize]);
  return <>{children}</>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppInitializer>
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(10, 15, 30, 0.95)',
              color: '#e2e8f0',
              border: '1px solid rgba(0, 229, 255, 0.2)',
              backdropFilter: 'blur(20px)',
              fontFamily: 'Inter, sans-serif',
              fontSize: '13px',
            },
            success: {
              iconTheme: { primary: '#00FF88', secondary: '#050816' },
            },
            error: {
              iconTheme: { primary: '#FF0080', secondary: '#050816' },
            },
          }}
        />
      </AppInitializer>
    </QueryClientProvider>
  </React.StrictMode>
);
