import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Clock, ArrowRight, BookOpen } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import { CATEGORIES, ARTICLES, articlesInCategory } from '../lib/learnContent';

// Koala Learn — a reference library, not a marketing page. Modeled on how
// encyclopedic finance references (Investopedia, etc.) present themselves:
// a plain masthead, a search box, and a dense alphabetized-by-topic index of
// short entries — not hero gradients, icon badges, or pill CTAs.

const disp = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };

const Wrap = ({ children, style }) => (
  <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
);

function EntryRow({ a }) {
  return (
    <Link
      to={`/learn/${a.slug}`}
      style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16,
        padding: '16px 0', textDecoration: 'none', borderBottom: `1px solid ${C.borderSoft}`,
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div style={{ ...disp, fontSize: 16, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', marginBottom: 4 }}>{a.title}</div>
        <div style={{ ...body, fontSize: 13.5, lineHeight: 1.5, color: C.ink2, maxWidth: 620 }}>{a.dek}</div>
      </div>
      <div style={{ ...body, fontSize: 12, color: C.muted, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0 }}>
        <Clock size={11} /> {a.readTime} min
      </div>
    </Link>
  );
}

export default function LearnPage() {
  const [query, setQuery] = useState('');
  const featured = ARTICLES.find((a) => a.featured);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return ARTICLES.filter(a => a.title.toLowerCase().includes(q) || a.dek.toLowerCase().includes(q));
  }, [query]);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav />

      {/* Masthead — plain, text-led, no gradient/hero imagery */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <Wrap style={{ padding: '40px 24px 28px' }}>
          <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 10 }}>
            Reference library
          </div>
          <h1 style={{ ...disp, fontSize: 'clamp(28px, 4.4vw, 38px)', fontWeight: 800, color: C.ink, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Financial statements, defined and explained
          </h1>
          <p style={{ ...body, fontSize: 15.5, lineHeight: 1.6, color: C.ink2, maxWidth: 640, margin: '0 0 22px' }}>
            {ARTICLES.length} plain-English entries covering the income statement, balance sheet, cash flow statement,
            and the ratios investors actually look at — written for founders and students, not accountants.
          </p>
          <div style={{ position: 'relative', maxWidth: 440 }}>
            <Search size={16} color={C.faint} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search the library…"
              style={{
                ...body, width: '100%', boxSizing: 'border-box', fontSize: 14, padding: '11px 14px 11px 38px',
                borderRadius: 8, border: `1px solid ${C.border}`, background: C.bg, color: C.ink, outline: 'none',
              }}
            />
          </div>
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
          {/* Start here — a plain reference, not a promo card */}
          {featured && (
            <Wrap style={{ padding: '28px 24px 4px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, borderLeft: `3px solid ${C.goldText}`, paddingLeft: 14 }}>
                <span style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.goldText }}>Start here</span>
              </div>
              <Link to={`/learn/${featured.slug}`} style={{ display: 'block', textDecoration: 'none', borderLeft: `3px solid ${C.goldText}`, paddingLeft: 14, paddingTop: 6, paddingBottom: 18 }}>
                <div style={{ ...disp, fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', marginBottom: 6 }}>{featured.title}</div>
                <div style={{ ...body, fontSize: 14, lineHeight: 1.55, color: C.ink2, maxWidth: 640, marginBottom: 8 }}>{featured.dek}</div>
                <span style={{ ...body, fontSize: 12.5, fontWeight: 600, color: C.goldText, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  Read the entry <ArrowRight size={13} />
                </span>
              </Link>
            </Wrap>
          )}

          {/* Index by topic */}
          {CATEGORIES.map((cat) => {
            const list = articlesInCategory(cat.id);
            return (
              <Wrap key={cat.id} id={cat.id} style={{ padding: '32px 24px 4px', scrollMarginTop: 72 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, borderBottom: `1px solid ${C.border}`, paddingBottom: 10, marginBottom: 4 }}>
                  <h2 style={{ ...disp, fontSize: 19, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', margin: 0 }}>{cat.label}</h2>
                  <span style={{ ...body, fontSize: 12.5, color: C.muted }}>{list.length} entr{list.length === 1 ? 'y' : 'ies'}</span>
                </div>
                <div>{list.map(a => <EntryRow key={a.slug} a={a} />)}</div>
              </Wrap>
            );
          })}
        </>
      )}

      {/* Footer note — modest, no gradient CTA block */}
      <Wrap style={{ padding: '40px 24px 72px' }}>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <BookOpen size={20} color={C.goldText} style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ ...disp, fontSize: 15, fontWeight: 700, color: C.ink }}>Reading is step one.</div>
            <div style={{ ...body, fontSize: 13.5, color: C.ink2 }}>Build your own three-statement model and watch these ideas play out with real numbers.</div>
          </div>
          <Link to="/app" style={{ ...body, fontSize: 13.5, fontWeight: 600, color: C.ink, border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 16px', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Open the model builder →
          </Link>
        </div>
      </Wrap>
    </div>
  );
}
