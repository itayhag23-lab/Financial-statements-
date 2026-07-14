import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import {
  ChevronRight, ArrowRight, ArrowLeft, Clock, Lightbulb, AlertTriangle,
  CheckCircle2, ListChecks,
} from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import StatementViz from '../components/ui/StatementViz';
import JsonLd, { breadcrumbSchema } from '../components/growth/JsonLd';
import { getArticle, categoryLabel, ARTICLES_BY_SLUG } from '../lib/learnContent';

const SITE = 'https://koalastatements.com';
const MONTHS = { january:0,february:1,march:2,april:3,may:4,june:5,july:6,august:7,september:8,october:9,november:10,december:11 };

// Articles carry a human "updated" (e.g. "July 2026"); turn it into an ISO date
// for Article schema. Returns undefined if it can't be parsed (schema omits it).
function isoFromUpdated(u) {
  const m = String(u || '').trim().match(/([A-Za-z]+)\s+(\d{4})/);
  if (!m) return undefined;
  const mi = MONTHS[m[1].toLowerCase()];
  if (mi == null) return undefined;
  return `${m[2]}-${String(mi + 1).padStart(2, '0')}-01`;
}

// Article + BreadcrumbList structured data. Rendered into the page markup (it
// pre-renders via react-dom/server), so Google can understand and index each
// Learn article faster and qualify it for rich results.
function articleSchema(article) {
  const url = `${SITE}/learn/${article.slug}`;
  const iso = isoFromUpdated(article.updated);
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.dek,
    ...(iso ? { datePublished: iso, dateModified: iso } : {}),
    author: { '@type': 'Organization', name: 'Koala Statements', url: `${SITE}/` },
    publisher: { '@type': 'Organization', name: 'Koala Statements', logo: { '@type': 'ImageObject', url: `${SITE}/og-image.png` } },
    image: `${SITE}/og-image.png`,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    ...(article.readTime ? { timeRequired: `PT${article.readTime}M` } : {}),
    articleSection: categoryLabel(article.category),
    inLanguage: 'en',
  };
}

// Individual Learn article. Investopedia-style layout: breadcrumb, a boxed
// "Key takeaways" summary up top, a sticky table-of-contents rail (with
// scroll-spy) on the side, the sectioned body, then related reading.

// ── Inline formatter: turns **bold** and *italic* spans into React nodes ─────
function fmt(text) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let last = 0, m, k = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(<strong key={k++} style={{ color: C.ink, fontWeight: 700 }}>{tok.slice(2, -2)}</strong>);
    else out.push(<em key={k++}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

// ── Block renderers ─────────────────────────────────────────────────────────
const para = { fontFamily: FONTS.body, fontSize: 16, lineHeight: 1.72, color: C.ink2, margin: '0 0 16px' };

function Callout({ tone = 'idea', title, children }) {
  const tones = {
    idea: { border: `${C.gold}55`, bg: C.goldSoft, color: C.goldText, Icon: Lightbulb },
    warn: { border: `${C.rust}44`, bg: C.rustSoft, color: C.rust, Icon: AlertTriangle },
    tip:  { border: `${C.blue}44`, bg: C.blueSoft, color: C.blue, Icon: CheckCircle2 },
  };
  const t = tones[tone] || tones.idea;
  const { Icon } = t;
  return (
    <div style={{ border: `1px solid ${t.border}`, background: t.bg, borderRadius: 8, padding: '16px 20px', margin: '4px 0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.display, fontSize: 14.5, fontWeight: 700, color: t.color, marginBottom: 8 }}>
        <Icon size={16} /> {title}
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.65, color: C.ink }}>{children}</div>
    </div>
  );
}

function MiniStatement({ title, rows }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, margin: '4px 0 20px', maxWidth: 520, overflow: 'hidden' }}>
      <div style={{ padding: '10px 18px', borderBottom: `1px solid ${C.border}`, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted }}>{title}</div>
      <div style={{ padding: '8px 0' }}>
        {rows.map(([label, value, opts = {}], i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16, padding: `5px 18px 5px ${18 + (opts.indent ? 16 : 0)}px`, borderTop: opts.rule ? `1px solid ${C.border}` : 'none', marginTop: opts.rule ? 4 : 0, paddingTop: opts.rule ? 9 : 5 }}>
            <span style={{ fontFamily: FONTS.body, fontSize: 13.5, color: opts.bold ? C.ink : C.ink2, fontWeight: opts.bold ? 700 : 400 }}>
              {label}{opts.note && <span style={{ color: C.faint, fontWeight: 400 }}> · {opts.note}</span>}
            </span>
            <span className="ff-num" style={{ fontSize: 13, fontWeight: opts.bold ? 700 : 500, color: opts.neg ? C.rust : (opts.bold ? C.ink : C.ink2), whiteSpace: 'nowrap' }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function Block({ b }) {
  switch (b.t) {
    case 'p':
      return <p style={para}>{fmt(b.c)}</p>;
    case 'ul':
      return (
        <ul style={{ ...para, paddingLeft: 22 }}>
          {b.items.map((it, i) => <li key={i} style={{ marginBottom: 9 }}>{fmt(it)}</li>)}
        </ul>
      );
    case 'ol':
      return (
        <ol style={{ ...para, paddingLeft: 22 }}>
          {b.items.map((it, i) => <li key={i} style={{ marginBottom: 9 }}>{fmt(it)}</li>)}
        </ol>
      );
    case 'callout':
      return <Callout tone={b.tone} title={b.title}>{fmt(b.c)}</Callout>;
    case 'statement':
      return <MiniStatement title={b.title} rows={b.rows} />;
    case 'viz':
      return <div style={{ margin: '4px 0 20px' }}><StatementViz type={b.viz} accent={b.viz === 'balance' ? C.blue : b.viz === 'cashflow' ? C.gold : C.green} /></div>;
    default:
      return null;
  }
}

// ── Sticky TOC with scroll-spy ──────────────────────────────────────────────
function useScrollSpy(ids) {
  const [active, setActive] = useState(ids[0]);
  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-72px 0px -60% 0px', threshold: 0 }
    );
    ids.forEach((id) => { const el = document.getElementById('sec-' + id); if (el) obs.observe(el); });
    return () => obs.disconnect();
  }, [ids.join('|')]); // eslint-disable-line
  return active;
}

function RelatedCard({ slug }) {
  const a = ARTICLES_BY_SLUG[slug];
  if (!a) return null;
  return (
    <Link to={`/learn/${a.slug}`} style={{ display: 'block', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 8, padding: '16px 18px', textDecoration: 'none' }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: C.goldText, marginBottom: 6 }}>{categoryLabel(a.category)}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: 15.5, fontWeight: 700, color: C.ink, lineHeight: 1.25, marginBottom: 6 }}>{a.title}</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13, lineHeight: 1.5, color: C.ink2 }}>{a.dek}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 10, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: C.goldText }}>Read <ArrowRight size={13} /></div>
    </Link>
  );
}

export default function LearnArticlePage() {
  const { slug } = useParams();
  const article = getArticle(slug);
  const topRef = useRef(null);

  // Reset scroll to top whenever the article changes (SPA navigation).
  useEffect(() => { window.scrollTo(0, 0); }, [slug]);

  const sectionIds = (article?.sections || []).map((s) => s.id);
  const active = useScrollSpy(sectionIds);

  if (!article) return <Navigate to="/learn" replace />;

  return (
    <div style={{ minHeight: '100vh', background: C.bg }} ref={topRef}>
      <JsonLd data={articleSchema(article)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Learn', url: `${SITE}/learn` },
        { name: categoryLabel(article.category), url: `${SITE}/learn#${article.category}` },
        { name: article.title, url: `${SITE}/learn/${article.slug}` },
      ])} />
      <TopNav />

      <div style={{ maxWidth: 1120, margin: '0 auto', padding: '0 24px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', fontFamily: FONTS.body, fontSize: 13, color: C.muted, padding: '22px 0 8px' }}>
          <Link to="/learn" style={{ color: C.muted, textDecoration: 'none' }}>Learn</Link>
          <ChevronRight size={13} />
          <Link to={`/learn#${article.category}`} style={{ color: C.muted, textDecoration: 'none' }}>{categoryLabel(article.category)}</Link>
          <ChevronRight size={13} />
          <span style={{ color: C.ink2 }}>{article.title}</span>
        </nav>

        {/* Header */}
        <header style={{ padding: '14px 0 8px', maxWidth: 760 }}>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 'clamp(28px, 5vw, 42px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.025em', lineHeight: 1.1, margin: '0 0 14px' }}>{article.title}</h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 18, lineHeight: 1.6, color: C.ink2, margin: '0 0 16px' }}>{article.dek}</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', fontFamily: FONTS.body, fontSize: 13, color: C.muted }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><Clock size={13} /> {article.readTime} min read</span>
            <span style={{ width: 1, height: 12, background: C.border }} />
            <span>{article.level}</span>
            <span style={{ width: 1, height: 12, background: C.border }} />
            <span>Updated {article.updated}</span>
          </div>
        </header>

        {/* Two-column: body + sticky TOC */}
        <div className="koala-learn-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 40, padding: '28px 0 8px', alignItems: 'start' }}>
          {/* Main column */}
          <div style={{ maxWidth: 760, minWidth: 0 }}>
            {/* Key takeaways */}
            <div style={{ background: C.bgWarm, border: `1px solid ${C.border}`, borderLeft: `3px solid ${C.ink}`, borderRadius: 4, padding: '18px 22px', marginBottom: 34 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.ink, marginBottom: 14 }}>
                <ListChecks size={15} /> Key takeaways
              </div>
              {article.takeaways.map((t, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < article.takeaways.length - 1 ? 11 : 0 }}>
                  <CheckCircle2 size={16} color={C.ink2} style={{ flexShrink: 0, marginTop: 2 }} />
                  <span style={{ fontFamily: FONTS.body, fontSize: 14.5, lineHeight: 1.55, color: C.ink2 }}>{t}</span>
                </div>
              ))}
            </div>

            {/* Sections */}
            {article.sections.map((s) => (
              <section key={s.id} id={'sec-' + s.id} style={{ scrollMarginTop: 76, marginBottom: 30 }}>
                <h2 style={{ fontFamily: FONTS.display, fontSize: 24, fontWeight: 800, color: C.ink, letterSpacing: '-0.015em', margin: '0 0 14px' }}>{s.title}</h2>
                {s.blocks.map((b, i) => <Block key={i} b={b} />)}
              </section>
            ))}

            {/* Practice CTA */}
            <div style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              <div style={{ flex: 1, minWidth: 200 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 15.5, fontWeight: 700, color: C.ink, marginBottom: 4 }}>See it in a real model</div>
                <p style={{ fontFamily: FONTS.body, fontSize: 13.5, color: C.ink2, margin: 0 }}>Build one and watch the numbers move.</p>
              </div>
              <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600, color: C.ink, background: C.bg, border: `1px solid ${C.border}`, textDecoration: 'none', padding: '10px 18px', borderRadius: 8, whiteSpace: 'nowrap' }}>Open the builder <ArrowRight size={14} /></Link>
            </div>
          </div>

          {/* Sticky TOC rail */}
          <aside className="koala-learn-toc" style={{ display: 'none' }}>
            <div style={{ position: 'sticky', top: 84 }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>On this page</div>
              <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, borderLeft: `2px solid ${C.border}` }}>
                {article.sections.map((s) => {
                  const on = active === s.id;
                  return (
                    <a key={s.id} href={'#sec-' + s.id}
                      style={{ fontFamily: FONTS.body, fontSize: 13, lineHeight: 1.4, color: on ? C.ink : C.muted, fontWeight: on ? 600 : 400, textDecoration: 'none', padding: '5px 0 5px 14px', marginLeft: -2, borderLeft: `2px solid ${on ? C.ink : 'transparent'}` }}>
                      {s.title}
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        </div>

        {/* Related reading */}
        {article.related?.length > 0 && (
          <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 24, padding: '36px 0 8px' }}>
            <h2 style={{ fontFamily: FONTS.display, fontSize: 22, fontWeight: 800, color: C.ink, letterSpacing: '-0.015em', margin: '0 0 18px' }}>Related reading</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 14 }}>
              {article.related.map((r) => <RelatedCard key={r} slug={r} />)}
            </div>
          </div>
        )}

        {/* Back to library */}
        <div style={{ padding: '32px 0 72px' }}>
          <Link to="/learn" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: C.ink2, textDecoration: 'none' }}>
            <ArrowLeft size={15} /> Back to the Learn library
          </Link>
        </div>
      </div>

      {/* Two-column layout kicks in on wider screens */}
      <style>{`
        @media (min-width: 960px) {
          .koala-learn-grid { grid-template-columns: minmax(0, 1fr) 220px !important; }
          .koala-learn-toc { display: block !important; }
        }
      `}</style>
    </div>
  );
}
