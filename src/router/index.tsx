import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageLoader from '@/components/ui/PageLoader';

// Lazy-loaded pages
const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('@/pages/ForgotPasswordPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const StocksPage = lazy(() => import('@/pages/StocksPage'));
const PredictionsPage = lazy(() => import('@/pages/PredictionsPage'));
const PortfolioPage = lazy(() => import('@/pages/PortfolioPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SentimentPage = lazy(() => import('@/pages/SentimentPage'));
const RiskPage = lazy(() => import('@/pages/RiskPage'));
const RecommendationsPage = lazy(() => import('@/pages/RecommendationsPage'));
const CrashDetectionPage = lazy(() => import('@/pages/CrashDetectionPage'));
const ComparisonPage = lazy(() => import('@/pages/ComparisonPage'));
const WatchlistPage = lazy(() => import('@/pages/WatchlistPage'));
const ChatbotPage = lazy(() => import('@/pages/ChatbotPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <PageLoader />;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuthStore();
  if (loading) return <PageLoader />;
  if (user) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

          {/* Protected Dashboard Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="stocks" element={<StocksPage />} />
            <Route path="predictions" element={<PredictionsPage />} />
            <Route path="portfolio" element={<PortfolioPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="sentiment" element={<SentimentPage />} />
            <Route path="risk" element={<RiskPage />} />
            <Route path="recommendations" element={<RecommendationsPage />} />
            <Route path="crash-detection" element={<CrashDetectionPage />} />
            <Route path="comparison" element={<ComparisonPage />} />
            <Route path="watchlist" element={<WatchlistPage />} />
            <Route path="chatbot" element={<ChatbotPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
