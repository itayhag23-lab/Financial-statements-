import React, { Suspense, lazy, useEffect } from 'react';
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

// After an OAuth round-trip the browser may land on the homepage (depending on
// Supabase's Site URL config). Once the session resolves, send the user to the
// destination we stashed before redirecting.
function PostAuthRedirect() {
  const user = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!user) return;
    let dest;
    try { dest = sessionStorage.getItem('koala:postAuthRedirect'); } catch {}
    if (dest) {
      try { sessionStorage.removeItem('koala:postAuthRedirect'); } catch {}
      navigate(dest, { replace: true });
    }
  }, [user, navigate]);
  return null;
}

export default function App() {
  return (
    <AuthProvider>
      <PageTracker />
      <PostAuthRedirect />
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
