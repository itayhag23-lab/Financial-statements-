import React from 'react';
import { C, FONTS } from './theme';

// Illustrated koala mascot mark. `badge` wraps it in a soft rounded tile.
export function KoalaMark({ size = 30, badge = false }) {
  const mark = (
    <img src="/koala-mascot.png" alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />
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
      <KoalaMark size={size} badge={badge} />
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
