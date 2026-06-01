import React from 'react';
import { C, FONTS } from './theme';

// Refined, minimal koala mark drawn with smooth paths (no stacked circles).
// `badge` wraps it in a soft rounded "app icon" tile for a premium feel.
export function KoalaMark({ size = 30, color = C.ink, accent = C.gold, badge = false }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      {/* ears */}
      <circle cx="16" cy="20" r="10" fill={color} />
      <circle cx="48" cy="20" r="10" fill={color} />
      <circle cx="16" cy="20" r="4.6" fill={accent} opacity="0.9" />
      <circle cx="48" cy="20" r="4.6" fill={accent} opacity="0.9" />
      {/* head */}
      <path d="M32 14c11.6 0 19 8.2 19 19.5C51 46 42.6 54 32 54S13 46 13 33.5C13 22.2 20.4 14 32 14Z" fill={color} />
      {/* eyes */}
      <circle cx="24" cy="31" r="2.6" fill={C.surface} />
      <circle cx="40" cy="31" r="2.6" fill={C.surface} />
      {/* signature koala nose — soft spade shape */}
      <path d="M32 33c4.8 0 7.4 2.9 7 6.4-.4 3.4-4 6.6-7 8.6-3-2-6.6-5.2-7-8.6-.4-3.5 2.2-6.4 7-6.4Z" fill={accent} />
    </svg>
  );
  if (!badge) return mark;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: size * 1.32, height: size * 1.32, borderRadius: size * 0.34, background: C.bgWarm, border: `1px solid ${C.border}` }}>
      {mark}
    </span>
  );
}

export function Logo({ size = 30, color = C.ink, accent = C.gold, showText = true, textColor, badge = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 11 }}>
      <KoalaMark size={size} color={color} accent={accent} badge={badge} />
      {showText && (
        <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: size * 0.66, color: textColor || color, letterSpacing: '-0.03em' }}>
            Koala
          </span>
          <span style={{ fontFamily: FONTS.body, fontWeight: 600, fontSize: size * 0.3, color: accent, letterSpacing: '0.24em', textTransform: 'uppercase', marginTop: 3 }}>
            Statements
          </span>
        </span>
      )}
    </span>
  );
}

export default Logo;
