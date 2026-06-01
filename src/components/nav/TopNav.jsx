import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { C, FONTS } from '../../brand/theme';
import { Logo } from '../../brand/Logo';

// Slim brand bar shown above the builder on /app.
export default function TopNav() {
  return (
    <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link to="/" style={{ textDecoration: 'none' }}><Logo size={26} /></Link>
        <Link to="/" style={{ fontFamily: FONTS.body, fontSize: 13, color: C.ink2, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Home size={14} /> Home
        </Link>
      </div>
    </div>
  );
}
