import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';
import { capture } from '../../lib/analytics';

// The conversion surface shared by every template and tool page. The primary
// button stashes an AI "seed" description in sessionStorage and deep-links to
// the builder's AI flow (/app?new=ai reads it on open); the secondary link
// starts a blank model for free. sessionStorage survives the sign-in redirect,
// so the seed is still there when the user lands back in the builder.
export default function BuildCTA({ seed, primaryLabel = 'Build this model with AI', source }) {
  const navigate = useNavigate();

  const start = () => {
    try { if (seed) sessionStorage.setItem('koala:aiSeed', seed); } catch {}
    capture('build_cta_click', { source: source || 'growth' });
    navigate('/app?new=ai');
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 14 }}>
      <button
        onClick={start}
        style={{
          fontFamily: FONTS.body, display: 'inline-flex', alignItems: 'center', gap: 8,
          background: '#0F172A', color: '#fff', border: '1px solid #0F172A', borderRadius: 12,
          padding: '13px 22px', fontSize: 15, fontWeight: 700, cursor: 'pointer',
          boxShadow: '0 1px 2px rgba(15,23,42,0.12)', transition: 'all 200ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 20px -6px rgba(15,23,42,0.35)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.12)'; }}
      >
        <Sparkles size={16} color={C.gold} /> {primaryLabel} <ArrowRight size={15} />
      </button>
      <Link
        to="/app?new=manual"
        onClick={() => capture('build_cta_click', { source: source || 'growth', variant: 'blank' })}
        style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: C.ink2, textDecoration: 'none' }}
      >
        or start a blank model →
      </Link>
    </div>
  );
}
