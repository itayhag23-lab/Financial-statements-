import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import TopNav from './components/nav/TopNav';
import { C, FONTS } from './brand/theme';

// The builder and shared report are lazy-loaded — landing page stays light.
const FinancialModelBuilder = lazy(() => import('./FinancialModelBuilder'));
const SharedReport = lazy(() => import('./pages/SharedReport'));

function Loading() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: FONTS.body, color: C.muted, fontSize: 14 }}>
      Loading your studio…
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/app" element={<AppRoute />} />
      <Route path="/app/:projectId" element={<AppRoute />} />
      <Route path="/r/:shareId" element={<SharedReportRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
