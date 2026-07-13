import React from 'react';
import { Link } from 'react-router-dom';
import { Home, LayoutDashboard, GraduationCap } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';
import { Logo } from '../../brand/Logo';
import UserMenu from './UserMenu';
import { useAuth } from '../../contexts/AuthContext';

export default function TopNav() {
  const user = useAuth();

  const body = { fontFamily: FONTS.body };

  return (
    <div style={{ background: C.surface, boxShadow: '0 1px 2px rgba(15,23,42,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
      <div
        className="mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
        style={{ maxWidth: 1200 }}
      >
        <Link to="/" className="min-w-0 shrink overflow-hidden" style={{ textDecoration: 'none' }}>
          <span className="hidden sm:inline-flex"><Logo size={38} /></span>
          <span className="inline-flex sm:hidden"><Logo size={30} /></span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            to="/learn"
            aria-label="Learn"
            className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2"
            style={{ ...body, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, color: C.ink2, textDecoration: 'none', transition: 'all 200ms ease' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = C.bgWarm; e.currentTarget.style.borderColor = C.borderSoft; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.border; }}
          >
            <GraduationCap size={14} /> <span className="hidden sm:inline">Learn</span>
          </Link>
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2"
                style={{ ...body, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, color: C.ink2, textDecoration: 'none', transition: 'all 200ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.bgWarm; e.currentTarget.style.borderColor = C.borderSoft; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.border; }}
              >
                <LayoutDashboard size={14} /> My models
              </Link>
              <Link
                to="/dashboard"
                aria-label="My models"
                className="inline-flex sm:hidden shrink-0 items-center justify-center rounded-lg p-2"
                style={{ ...body, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, color: C.ink2, textDecoration: 'none', transition: 'all 200ms ease' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = C.bgWarm; e.currentTarget.style.borderColor = C.borderSoft; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.border; }}
              >
                <LayoutDashboard size={16} />
              </Link>
              <UserMenu />
            </>
          ) : (
            <Link
              to="/auth"
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2"
              style={{ ...body, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, color: C.ink2, textDecoration: 'none', transition: 'all 200ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.bgWarm; e.currentTarget.style.borderColor = C.borderSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.border; }}
            >
              <Home size={14} /> Sign in
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
