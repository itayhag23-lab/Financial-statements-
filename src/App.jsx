import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
// Privacy/Terms and the Learn library are imported eagerly (not lazy) so they
// can be pre-rendered to static HTML at build time and hydrate without a
// server/client mismatch. They only use deps already in the main bundle, so the
// size cost is negligible. (Prerendering Learn also fixes the hydration crash
// that hit non-prerendered routes: the SPA rewrite serves the homepage's
// prerendered HTML, which then mismatches a client-rendered Learn tree.)
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import LearnPage from './pages/LearnPage';
import LearnArticlePage from './pages/LearnArticlePage';
// Templates + Tools are programmatic-SEO growth pages — eagerly imported (like
// Learn) so they pre-render to static HTML at build time and rank on their own.
import TemplatesPage from './pages/TemplatesPage';
import TemplatePage from './pages/TemplatePage';
import ToolsPage from './pages/ToolsPage';
import ToolPage from './pages/ToolPage';
import TopNav from './components/nav/TopNav';
import { C, FONTS } from './brand/theme';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { page } from './lib/analytics';

const FinancialModelBuilder = lazy(() => import('./FinancialModelBuilder'));
const SharedReport           = lazy(() => import('./pages/SharedReport'));
const AuthPage               = lazy(() => import('./pages/AuthPage'));
const Dashboard              = lazy(() => import('./pages/Dashboard'));

// Captured ONCE at module load — before Supabase's async `detectSessionInUrl`
// clears the auth params from the URL. An OAuth (Google) round-trip lands the
// browser back on the bare origin with either `#access_token=…` (implicit) or
// `?code=…` (PKCE). By the time PostAuthRedirect's effect runs the params are
// already gone, so we snapshot the shape here to know "this page load was a
// sign-in callback" and route accordingly — without bouncing an ordinary
// signed-in visitor off the homepage.
const IS_OAUTH_CALLBACK =
  typeof window !== 'undefined' &&
  (window.location.hash.includes('access_token') ||
   new URLSearchParams(window.location.search).has('code'));

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

// The single source of truth for "where does the user go after signing in."
// After an OAuth round-trip the browser lands back on the bare origin (see
// signInWithGoogle in AuthContext.jsx), and for email sign-in the user is
// still sitting on /auth — either way, once the session resolves this sends
// them to the destination stashed before redirecting to /auth, or to the
// dashboard as a sane default. This used to be duplicated inside AuthPage's
// own effect too; running both raced on the same sessionStorage key, so
// whichever fired second would find it already cleared and forcibly
// re-navigate to a hardcoded fallback, silently undoing the correct
// redirect. Keeping exactly one consumer here fixes that.
function PostAuthRedirect() {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (!user) return;
    let dest;
    try { dest = sessionStorage.getItem('koala:postAuthRedirect'); } catch {}
    if (dest) {
      try { sessionStorage.removeItem('koala:postAuthRedirect'); } catch {}
      navigate(dest, { replace: true });
    } else if (location.pathname === '/auth') {
      // Signed in with nothing stashed to return to (a plain "log in" visit,
      // or arriving already authenticated) — go to the dashboard instead of
      // leaving them stuck looking at the login form.
      navigate('/dashboard', { replace: true });
    } else if (location.pathname === '/' && IS_OAUTH_CALLBACK) {
      // OAuth (Google) lands back on the bare origin. Normally the destination
      // stashed by signInWithGoogle handles the redirect above, but if that
      // sessionStorage entry was lost (incognito, cross-subdomain Site URL,
      // storage cleared) the user would be stranded on the marketing homepage
      // looking "logged in nowhere." IS_OAUTH_CALLBACK — snapshotted at module
      // load before Supabase strips the URL — lets us still route them to the
      // dashboard, WITHOUT redirecting an ordinary signed-in visitor who just
      // navigated to the homepage on purpose.
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate, location.pathname]);
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
        <Route path="/learn"      element={<LearnPage />} />
        <Route path="/learn/:slug" element={<LearnArticlePage />} />
        <Route path="/templates"       element={<TemplatesPage />} />
        <Route path="/templates/:slug" element={<TemplatePage />} />
        <Route path="/tools"           element={<ToolsPage />} />
        <Route path="/tools/:slug"     element={<ToolPage />} />
        <Route path="/app"        element={<AppRoute />} />
        <Route path="/app/:projectId" element={<AppRoute />} />
        <Route path="/r/:shareId" element={<SharedReportRoute />} />
        <Route path="/privacy"    element={<PrivacyPage />} />
        <Route path="/terms"      element={<TermsPage />} />
        <Route path="*"           element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
