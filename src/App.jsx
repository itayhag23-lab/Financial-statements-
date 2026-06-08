import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TopNav from './components/nav/TopNav';
import { C, FONTS } from './brand/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { page } from './lib/analytics';

const FinancialModelBuilder = lazy(() => import('./FinancialModelBuilder'));
const SharedReport           = lazy(() => import('./pages/SharedReport'));
const AuthPage               = lazy(() => import('./pages/AuthPage'));
const Dashboard              = lazy(() => import('./pages/Dashboard'));
const PrivacyPage            = lazy(() => import('./pages/PrivacyPage'));
const TermsPage              = lazy(() => import('./pages/TermsPage'));

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, color: C.muted, fontSize: 14 }}>
      Loading…
    </div>
  );
}

function AppRoute() {
  const { projectId } = useParams();
  return (
    <Suspense fallback={<Loading />}>
      <TopNav />
      <FinancialModelBuilder projectId={projectId} />
    </Suspense>
  );
}

function SharedReportRoute() {
  return (
    <Suspense fallback={<Loading />}>
      <SharedReport />
    </Suspense>
  );
}

function PageTracker() {
  const location = useLocation();
  useEffect(() => { page(location.pathname); }, [location.pathname]);
  return null;
}

// Handles the return trip from an OAuth provider (e.g. Google). Supabase only
// honours the `redirectTo` we request if that exact URL is in the project's
// Redirect URLs allow-list; otherwise it silently falls back to the Site URL
// (the landing page). Either way the OAuth response lands with the session
// tokens in the URL (`#access_token=…` for implicit, `?code=…` for PKCE).
// We detect that on first render and, once the session is established, forward
// the user to the dashboard — so sign-in works regardless of the allow-list.
function OAuthRedirectHandler() {
  const user = useAuth();
  const navigate = useNavigate();
  const isOAuthReturn = useRef(
    typeof window !== 'undefined' && (
      window.location.hash.includes('access_token') ||
      new URLSearchParams(window.location.search).has('code')
    )
  );

  useEffect(() => {
    if (isOAuthReturn.current && user) {
      isOAuthReturn.current = false;
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <PageTracker />
      <OAuthRedirectHandler />
      <Routes>
        <Route path="/"           element={<LandingPage />} />
        <Route path="/auth"       element={<Suspense fallback={<Loading />}><AuthPage /></Suspense>} />
        <Route path="/dashboard"  element={<Suspense fallback={<Loading />}><Dashboard /></Suspense>} />
        <Route path="/app"        element={<AppRoute />} />
        <Route path="/app/:projectId" element={<AppRoute />} />
        <Route path="/r/:shareId" element={<SharedReportRoute />} />
        <Route path="/privacy"    element={<Suspense fallback={<Loading />}><PrivacyPage /></Suspense>} />
        <Route path="/terms"      element={<Suspense fallback={<Loading />}><TermsPage /></Suspense>} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
