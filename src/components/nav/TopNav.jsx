import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, LogOut, GraduationCap } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';
import { Logo } from '../../brand/Logo';
import { useAuth, signOut } from '../../contexts/AuthContext';

export default function TopNav() {
  const user     = useAuth();
  const navigate = useNavigate();
  const initial  = user?.email?.[0]?.toUpperCase() || null;

  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
      {/* `min-w-0` + `flex-shrink` on the brand and `flex-shrink-0` on the actions
          guarantee the logo and the user avatar can never collide on a narrow
          (mobile) viewport — the brand text truncates before it overlaps. */}
      <div
        className="mx-auto flex items-center justify-between gap-3 px-4 py-2.5 sm:px-5"
        style={{ maxWidth: 1400 }}
      >
        <Link to="/" className="min-w-0 shrink overflow-hidden" style={{ textDecoration: 'none' }}>
          {/* Smaller mark on phones so the lockup stays clear of the avatar */}
          <span className="hidden sm:inline-flex"><Logo size={34} /></span>
          <span className="inline-flex sm:hidden"><Logo size={28} /></span>
        </Link>

        <div className="flex shrink-0 items-center gap-2.5">
          <Link
            to="/learn"
            aria-label="Learn"
            style={{ fontFamily: FONTS.body, fontSize: 13, color: C.ink2, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
          >
            <GraduationCap size={15} /> <span className="hidden sm:inline">Learn</span>
          </Link>
          <div style={{ width: 1, height: 16, background: C.border }} />
          {user ? (
            <>
              <Link
                to="/dashboard"
                className="hidden sm:inline-flex"
                style={{ fontFamily: FONTS.body, fontSize: 13, color: C.ink2, textDecoration: 'none', alignItems: 'center', gap: 5 }}
              >
                <LayoutDashboard size={14} /> My models
              </Link>
              <div className="hidden sm:block" style={{ width: 1, height: 16, background: C.border }} />
              {/* On mobile the "My models" label collapses to this icon-only link
                  so the row stays compact instead of crowding the avatar. */}
              <Link
                to="/dashboard"
                aria-label="My models"
                className="inline-flex sm:hidden"
                style={{ color: C.ink2, textDecoration: 'none', padding: 4 }}
              >
                <LayoutDashboard size={18} />
              </Link>
              <button
                onClick={async () => { await signOut(); navigate('/auth'); }}
                aria-label="Sign out"
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', padding: 0, flexShrink: 0 }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#059669' }}>
                  {initial}
                </div>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              style={{ fontFamily: FONTS.body, fontSize: 13, color: C.ink2, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <Home size={14} /> Home
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
