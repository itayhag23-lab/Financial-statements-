import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LayoutTemplate } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import JsonLd, { breadcrumbSchema } from '../components/growth/JsonLd';
import { TEMPLATES } from '../lib/templateContent';

const disp = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };
const SITE = 'https://koalastatements.com';

const Wrap = ({ children, style }) => (
  <div style={{ maxWidth: 980, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
);

function TemplateCard({ t }) {
  const [hover, setHover] = React.useState(false);
  return (
    <Link
      to={`/templates/${t.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', flexDirection: 'column', gap: 8, textDecoration: 'none',
        background: C.surface, border: `1px solid ${hover ? C.gold : C.border}`, borderRadius: 14,
        padding: '20px 20px', transition: 'border-color 140ms ease, box-shadow 140ms ease, transform 140ms ease',
        boxShadow: hover ? '0 10px 28px -12px rgba(15,23,42,0.18)' : 'none',
        transform: hover ? 'translateY(-2px)' : 'none',
      }}
    >
      <span style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.goldText }}>
        {t.industry}
      </span>
      <span style={{ ...disp, fontSize: 18, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em' }}>{t.title}</span>
      <span style={{ ...body, fontSize: 13.5, lineHeight: 1.5, color: C.ink2 }}>{t.tagline}</span>
      <span style={{ ...body, fontSize: 13, fontWeight: 600, color: hover ? C.goldText : C.muted, display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 4, transition: 'color 140ms ease' }}>
        View template <ArrowRight size={13} style={{ transform: hover ? 'translateX(3px)' : 'none', transition: 'transform 140ms ease' }} />
      </span>
    </Link>
  );
}

export default function TemplatesPage() {
  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: `${SITE}/` },
        { name: 'Templates', url: `${SITE}/templates` },
      ])} />

      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
        <Wrap style={{ padding: '40px 24px 28px' }}>
          <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: C.muted, marginBottom: 10, display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            <LayoutTemplate size={14} /> Model templates
          </div>
          <h1 style={{ ...disp, fontSize: 'clamp(28px, 4.4vw, 38px)', fontWeight: 800, color: C.ink, margin: '0 0 10px', letterSpacing: '-0.02em', lineHeight: 1.15 }}>
            Financial statement templates, by industry
          </h1>
          <p style={{ ...body, fontSize: 15.5, lineHeight: 1.6, color: C.ink2, maxWidth: 640, margin: 0 }}>
            Start from a financial statement template built for your business or situation. Pick one, see the
            drivers and benchmarks that matter, then let AI assemble a complete, investor-ready 3-statement
            model in about 60 seconds — free.
          </p>
        </Wrap>
      </div>

      <Wrap style={{ padding: '28px 24px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {TEMPLATES.map((t) => <TemplateCard key={t.slug} t={t} />)}
        </div>

        <div style={{ marginTop: 40, display: 'flex', gap: 20, flexWrap: 'wrap', ...body, fontSize: 13.5 }}>
          <Link to="/tools" style={{ color: C.goldText, fontWeight: 600, textDecoration: 'none' }}>Free finance calculators →</Link>
          <Link to="/learn" style={{ color: C.goldText, fontWeight: 600, textDecoration: 'none' }}>Learn financial statements →</Link>
        </div>
      </Wrap>
    </div>
  );
}
