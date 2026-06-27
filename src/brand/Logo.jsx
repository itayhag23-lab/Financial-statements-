import React from 'react';
import { C, FONTS } from './theme';

// Illustrated koala mascot mark.
export function KoalaMark({ size = 30 }) {
  return (
    <img src="/koala-mascot.png" alt="" width={size} height={size} style={{ display: 'block', objectFit: 'contain' }} />
  );
}

export function Logo({ size = 30, color = C.ink, accent = C.gold, showText = true, textColor }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <KoalaMark size={size * 1.5} />
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
