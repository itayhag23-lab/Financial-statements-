import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, Clock, ArrowRight, BookOpen, Sparkles,
  Compass, Layers, Gauge, GraduationCap,
  Coins, TrendingUp, Scale, Droplets, Link2, Percent, AlertTriangle,
} from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import { CATEGORIES, ARTICLES, articlesInCategory } from '../lib/learnContent';

// Koala Learn — a browsable library of short finance explainers. It stays
// clean and text-led (this is a reference, not a landing page), but leans on
// icon badges, level tags, a topic nav and hover states so it feels alive and
// invites reading rather than reading like a bare directory.

const disp = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };

// Resolve the lucide icon named on each article/category (stored as a string
// in the content library) to its component, with a safe fallback.
const ICONS = {
  Compass, Layers, Gauge, GraduationCap, Coins, TrendingUp, Scale,
  Droplets, Link2, Percent, AlertTriangle, BookOpen,
};
const Icon = ({ name, ...p }) => {
  const Cmp = ICONS[name] || BookOpen;
  return <Cmp {...p} />;
};

// Each category gets an emblem so the index scans visually, not just as text.
const CAT_ICON = { foundations: 'Compass', statements: 'Layers', metrics: 'Gauge', skills: 'GraduationCap' };

// Level → color chip. Keeps the palette on-brand (emerald / blue / amber).
const LEVEL = {
  Beginner:     { fg: '#047857', bg: 'rgba(16,185,129,0.10)' },
  Intermediate: { fg: '#2563EB', bg: 'rgba(37,99,235,0.10)' },
  Advanced:     { fg: '#B45309', bg: 'rgba(217,119,6,0.12)' },
  'All levels': { fg: '#64748B', bg: 'rgba(100,116,139,0.10)' },
};
function LevelTag({ level }) {
  const s = LEVEL[level] || LEVEL['All levels'];
  return (
    <span style={{ ...body, fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: s.fg, background: s.bg, padding: '2px 8px', borderRadius: 20 }}>
      {level}
    </span>
  );
}

const Wrap = ({ children, style, ...rest }) => (
  <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px', ...style }} {...rest}>{children}</div>
);

// Small emerald-tinted square that carries the article's own icon.
function IconBadge({ name, size = 18, box = 40 }) {
  return (
    <span style={{ width: box, height: box, borderRadius: 10, background: 'rgba(16,185,129,0.09)', border: '1px solid rgba(16,185,129,0.20)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
      <Icon name={name} size={size} color="#059669" />
    </span>
  );
}

function EntryRow({ a }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={`/learn/${a.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 14,
        padding: '16px 12px', margin: '0 -12px', borderRadius: 12,
        textDecoration: 'none', transition: 'background 140ms',
        background: hover ? '#F8FAFC' : 'transparent',
      }}
    >
      <IconBadge name={a.icon} />
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
          <span style={{ ...disp, fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>{a.title}</span>
          <LevelTag level={a.level} />
        </div>
        <div style={{ ...body, fontSize: 13.5, lineHeight: 1.5, color: C.ink2, maxWidth: 640 }}>{a.dek}</div>
      </div>
      <div style={{ ...body, fontSize: 12, color: C.muted, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0, paddingTop: 2 }}>
        <Clock size={11} /> {a.readTime} min
        <ArrowRight size={13} color={hover ? C.goldText : 'transparent'} style={{ transition: 'color 140ms, transform 140ms', transform: hover ? 'translateX(2px)' : 'none' }} />
      </div>
    </Link>
  );
}

export default function LearnPage() {
  const [query, setQuery] = useState('');
  const featured = ARTICLES.find((a) => a.featured);

  const avgRead = useMemo(
    () => Math.round(ARTICLES.reduce((s, a) => s + (a.readTime || 0), 0) / Math.max(1, ARTICLES.length)),
    []
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ARTICLES.filter(a => a.title.toLowerCase().includes(q) || a.dek.toLowerCase().includes(q));
  }, [query]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav />

      {/* Masthead — text-led, but with a stat strip and topic nav so it reads
          as a living library, not a bare page. */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <Wrap style={{ padding: '44px 24px 30px' }}>
          <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.goldText, marginBottom: 12, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <BookOpen size={13} /> Koala Learn
          </div>
          <h1 style={{ ...disp, fontSize: 'clamp(28px, 4.4vw, 40px)', fontWeight: 800, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
            Financial statements, finally made simple
          </h1>
          <p style={{ ...body, fontSize: 16, lineHeight: 1.6, color: C.ink2, maxWidth: 640, margin: '0 0 20px' }}>
            {ARTICLES.length} plain-English guides to the income statement, balance sheet, cash flow statement,
            and the ratios investors actually look at — written for founders and students, not accountants.
          </p>

          {/* Stat strip */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginBottom: 22 }}>
            {[
              { n: ARTICLES.length, l: 'guides' },
              { n: CATEGORIES.length, l: 'topics' },
              { n: `~${avgRead}`, l: 'min avg read' },
            ].map((s, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                <span style={{ ...disp, fontSize: 20, fontWeight: 800, color: C.ink }}>{s.n}</span>
                <span style={{ ...body, fontSize: 13, color: C.muted }}>{s.l}</span>
              </div>
            ))}
          </div>

          {/* Search */}
          <div style={{ position: 'relative', maxWidth: 460 }}>
            <Search size={16} color={C.faint} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search the library…"
              style={{
                ...body, width: '100%', boxSizing: 'border-box', fontSize: 14.5, padding: '12px 14px 12px 40px',
                borderRadius: 10, border: `1px solid ${C.border}`, background: C.bg, color: C.ink, outline: 'none',
              }}
            />
          </div>

          {/* Topic quick-nav — jumps to each category section */}
          {!filtered && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 18 }}>
              {CATEGORIES.map(cat => (
                <a
                  key={cat.id}
                  href={`#${cat.id}`}
                  style={{ ...body, display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: C.ink2, textDecoration: 'none', background: C.bg, border: `1px solid ${C.border}`, borderRadius: 20, padding: '7px 14px' }}
                >
                  <Icon name={CAT_ICON[cat.id]} size={13} color={C.goldText} /> {cat.label}
                </a>
              ))}
            </div>
          )}
        </Wrap>
      </div>

      {/* Search results override the category index while active */}
      {filtered ? (
        <Wrap style={{ padding: '28px 24px 80px' }}>
          <div style={{ ...body, fontSize: 13, color: C.muted, marginBottom: 4 }}>
            {filtered.length} result{filtered.length === 1 ? '' : 's'} for “{query}”
          </div>
          {filtered.length === 0 ? (
            <div style={{ ...body, fontSize: 14, color: C.muted, padding: '32px 0' }}>No entries match that search.</div>
          ) : (
            <div>{filtered.map(a => <EntryRow key={a.slug} a={a} />)}</div>
          )}
        </Wrap>
      ) : (
        <>
          {/* Start here — an inviting featured card, not a bare link */}
          {featured && (
            <Wrap style={{ padding: '30px 24px 8px' }}>
              <Link
                to={`/learn/${featured.slug}`}
                style={{
                  display: 'block', textDecoration: 'none', position: 'relative',
                  borderRadius: 16, padding: '24px 26px',
                  background: 'linear-gradient(135deg, rgba(16,185,129,0.07), rgba(37,99,235,0.05))',
                  border: '1px solid rgba(16,185,129,0.22)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <Sparkles size={14} color={C.goldText} />
                  <span style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.goldText }}>Start here</span>
                </div>
                <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                  <IconBadge name={featured.icon} size={24} box={52} />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ ...disp, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.015em', marginBottom: 6, lineHeight: 1.2 }}>{featured.title}</div>
                    <div style={{ ...body, fontSize: 14.5, lineHeight: 1.55, color: C.ink2, maxWidth: 620, marginBottom: 14 }}>{featured.dek}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                      <span style={{ ...body, fontSize: 13.5, fontWeight: 700, color: '#fff', background: C.ink, borderRadius: 9, padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        Start reading <ArrowRight size={14} />
                      </span>
                      <span style={{ ...body, fontSize: 12.5, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <Clock size={12} /> {featured.readTime} min read
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </Wrap>
          )}

          {/* Index by topic — each section headed by its emblem + blurb */}
          {CATEGORIES.map((cat) => {
            const list = articlesInCategory(cat.id);
            return (
              <Wrap key={cat.id} id={cat.id} style={{ padding: '34px 24px 4px', scrollMarginTop: 72 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 13, borderBottom: `1px solid ${C.border}`, paddingBottom: 14, marginBottom: 4 }}>
                  <IconBadge name={CAT_ICON[cat.id]} size={19} box={42} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                      <h2 style={{ ...disp, fontSize: 20, fontWeight: 800, color: C.ink, letterSpacing: '-0.015em', margin: 0 }}>{cat.label}</h2>
                      <span style={{ ...body, fontSize: 12.5, color: C.muted }}>{list.length} entr{list.length === 1 ? 'y' : 'ies'}</span>
                    </div>
                    {cat.blurb && <div style={{ ...body, fontSize: 13.5, color: C.ink2, marginTop: 3 }}>{cat.blurb}</div>}
                  </div>
                </div>
                <div>{list.map(a => <EntryRow key={a.slug} a={a} />)}</div>
              </Wrap>
            );
          })}
        </>
      )}

      {/* Footer CTA — a warm nudge from reading to building */}
      <Wrap style={{ padding: '44px 24px 76px' }}>
        <div style={{ borderRadius: 14, padding: '24px 26px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', background: 'linear-gradient(135deg, rgba(16,185,129,0.08), rgba(37,99,235,0.05))', border: '1px solid rgba(16,185,129,0.22)' }}>
          <IconBadge name="TrendingUp" size={20} box={46} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ ...disp, fontSize: 16.5, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em' }}>Reading is step one.</div>
            <div style={{ ...body, fontSize: 13.5, color: C.ink2, marginTop: 2 }}>Build your own three-statement model and watch these ideas play out with real numbers.</div>
          </div>
          <Link to="/app" style={{ ...body, fontSize: 14, fontWeight: 700, color: '#fff', background: C.ink, borderRadius: 10, padding: '11px 20px', textDecoration: 'none', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            Open the model builder <ArrowRight size={15} />
          </Link>
        </div>
      </Wrap>
    </div>
  );
}
