import React from 'react';
import { C, FONTS } from './theme';

// Minimal geometric koala mark — clean, professional, no emoji.
export function KoalaMark({ size = 28, color = C.ink, accent = C.gold }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      {/* ears */}
      <circle cx="11" cy="14" r="8" fill={color} />
      <circle cx="37" cy="14" r="8" fill={color} />
      <circle cx="11" cy="14" r="3.4" fill={accent} />
      <circle cx="37" cy="14" r="3.4" fill={accent} />
      {/* head */}
      <circle cx="24" cy="27" r="15" fill={color} />
      {/* eyes */}
      <circle cx="18.5" cy="25" r="2.1" fill={C.surface} />
      <circle cx="29.5" cy="25" r="2.1" fill={C.surface} />
      {/* nose */}
      <ellipse cx="24" cy="31.5" rx="4.2" ry="5" fill={accent} />
    </svg>
  );
}

export function Logo({ size = 28, color = C.ink, accent = C.gold, showText = true, textColor }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9 }}>
      <KoalaMark size={size} color={color} accent={accent} />
      {showText && (
        <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: FONTS.display, fontWeight: 600, fontSize: size * 0.72, color: textColor || color, letterSpacing: '-0.01em' }}>
            Koala
          </span>
          <span style={{ fontFamily: FONTS.body, fontWeight: 500, fontSize: size * 0.34, color: accent, letterSpacing: '0.22em', textTransform: 'uppercase', marginTop: 2 }}>
            Statements
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
