import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles, ArrowRight, Clock, Compass, Coins, TrendingUp, Scale, Droplets,
  Link2, Percent, Gauge, AlertTriangle, BookOpen,
} from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import { CATEGORIES, ARTICLES, articlesInCategory } from '../lib/learnContent';

// Koala Learn — the library hub. Instead of one long scroll, this is a browsable
// directory: a featured "start here" article, then articles grouped by category
// as cards. Each card links to its own article page (/learn/:slug).

const ICONS = { Compass, Coins, TrendingUp, Scale, Droplets, Link2, Percent, Gauge, AlertTriangle, BookOpen };

const Wrap = ({ children, style }) => (
  <div style={{ maxWidth: 1080, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
);

function ArticleCard({ a }) {
  const Icon = ICONS[a.icon] || BookOpen;
  return (
    <Link to={`/learn/${a.slug}`} style={{ display: 'flex', flexDirection: 'column', background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '20px 20px 18px', textDecoration: 'none', height: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ width: 34, height: 34, borderRadius: 9, background: C.goldSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.goldText, flexShrink: 0 }}>
          <Icon size={17} />
        </div>
        <span style={{ fontFamily: FONTS.body, fontSize: 11.5, fontWeight: 600, color: C.muted, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} /> {a.readTime} min · {a.level}
        </span>
      </div>
      <div style={{ fontFamily: FONTS.display, fontSize: 17, fontWeight: 700, color: C.ink, lineHeight: 1.25, marginBottom: 8 }}>{a.title}</div>
      <div style={{ fontFamily: FONTS.body, fontSize: 13.5, lineHeight: 1.55, color: C.ink2, flex: 1 }}>{a.dek}</div>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 14, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 600, color: C.goldText }}>Read article <ArrowRight size={13} /></div>
    </Link>
  );
}

export default function LearnPage() {
  const featured = ARTICLES.find((a) => a.featured);
  const FeaturedIcon = featured ? (ICONS[featured.icon] || BookOpen) : BookOpen;

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav />

      {/* Hero */}
      <div style={{ background: C.ink, color: C.surface }}>
        <Wrap style={{ padding: '52px 24px 44px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 700, color: C.ink, background: C.gold, borderRadius: 999, padding: '6px 13px', marginBottom: 20 }}>
            <Sparkles size={14} /> Free learning library
          </div>
          <h1 style={{ fontFamily: FONTS.display, fontSize: 'clamp(32px, 6vw, 52px)', fontWeight: 800, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05, maxWidth: 760 }}>
            Learn to read financial statements, one clear article at a time.
          </h1>
          <p style={{ fontFamily: FONTS.body, fontSize: 18, lineHeight: 1.6, color: 'rgba(255,255,255,0.72)', maxWidth: 620, marginTop: 18 }}>
            A plain-English library for founders, students, and anyone who wants the money side to finally make sense. Browse by topic, or start with the foundations and work up.
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 20, marginTop: 26, fontFamily: FONTS.body, fontSize: 13.5, color: 'rgba(255,255,255,0.6)' }}>
            <span><strong style={{ color: C.surface }}>{ARTICLES.length}</strong> articles</span>
            <span><strong style={{ color: C.surface }}>{CATEGORIES.length}</strong> topics</span>
            <span>Every term defined in plain English</span>
          </div>
        </Wrap>
      </div>

      {/* Featured "start here" */}
      {featured && (
        <Wrap style={{ padding: '36px 24px 8px' }}>
          <Link to={`/learn/${featured.slug}`} style={{ display: 'block', textDecoration: 'none' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 18, overflow: 'hidden' }}>
              <div style={{ padding: '26px 26px 24px' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: FONTS.body, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.goldText, background: C.goldSoft, borderRadius: 999, padding: '5px 12px', marginBottom: 16 }}>
                  <Compass size={13} /> Start here
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: C.ink, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.gold, flexShrink: 0 }}>
                    <FeaturedIcon size={22} />
                  </div>
                  <div>
                    <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(20px, 3.4vw, 26px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', lineHeight: 1.15, margin: '0 0 8px' }}>{featured.title}</h2>
                    <p style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.6, color: C.ink2, margin: '0 0 12px', maxWidth: 640 }}>{featured.dek}</p>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600, color: C.goldText }}>
                      <Clock size={13} /> {featured.readTime} min read · Read the foundation <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </Wrap>
      )}

      {/* Browse by category */}
      {CATEGORIES.map((cat, i) => {
        // Show every article under its category (including the featured one, so
        // the section stays complete when someone jumps to it via anchor).
        const list = articlesInCategory(cat.id);
        return (
          <Wrap key={cat.id} id={cat.id} style={{ padding: i === 0 ? '40px 24px 8px' : '32px 24px 8px', scrollMarginTop: 72 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', marginBottom: 4 }}>
              <div>
                <div style={{ fontFamily: FONTS.body, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.goldText, marginBottom: 6 }}>{cat.tagline}</div>
                <h2 style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 3.6vw, 28px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em', margin: 0 }}>{cat.label}</h2>
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 13, color: C.muted }}>{list.length} article{list.length === 1 ? '' : 's'}</div>
            </div>
            <p style={{ fontFamily: FONTS.body, fontSize: 15, lineHeight: 1.6, color: C.ink2, margin: '0 0 20px', maxWidth: 640 }}>{cat.blurb}</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {list.map((a) => <ArticleCard key={a.slug} a={a} />)}
            </div>
          </Wrap>
        );
      })}

      {/* CTA */}
      <Wrap style={{ padding: '40px 24px 72px' }}>
        <div style={{ background: C.gold, borderRadius: 18, padding: '32px 26px', textAlign: 'center' }}>
          <div style={{ fontFamily: FONTS.display, fontSize: 'clamp(22px, 4vw, 30px)', fontWeight: 800, color: C.ink, letterSpacing: '-0.02em' }}>Reading is step one. Building is where it clicks.</div>
          <p style={{ fontFamily: FONTS.body, fontSize: 15.5, color: 'rgba(15,23,42,0.72)', maxWidth: 480, margin: '10px auto 20px' }}>
            Turn these ideas into your own three linked statements and watch the numbers move in real time.
          </p>
          <Link to="/app" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: FONTS.body, fontSize: 15, fontWeight: 700, color: C.surface, background: C.ink, textDecoration: 'none', padding: '13px 26px', borderRadius: 12 }}>
            Open the model builder <ArrowRight size={17} />
          </Link>
        </div>
      </Wrap>
    </div>
  );
}
