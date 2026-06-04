import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, LayoutDashboard, LogOut } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';
import { Logo } from '../../brand/Logo';
import { useAuth, signOut } from '../../contexts/AuthContext';

export default function TopNav() {
  const user     = useAuth();
  const navigate = useNavigate();
  const initial  = user?.email?.[0]?.toUpperCase() || null;

  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <Link to="/" style={{ textDecoration: 'none' }}><Logo size={26} /></Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <>
              <Link
                to="/dashboard"
                style={{ fontFamily: FONTS.body, fontSize: 13, color: C.ink2, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 5 }}
              >
                <LayoutDashboard size={14} /> My models
              </Link>
              <div style={{ width: 1, height: 16, background: C.border }} />
              <button
                onClick={async () => { await signOut(); navigate('/auth'); }}
                style={{ fontFamily: FONTS.body, fontSize: 13, color: C.muted, background: 'none', border: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, padding: 0 }}
              >
                <div style={{ width: 26, height: 26, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#059669' }}>
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
