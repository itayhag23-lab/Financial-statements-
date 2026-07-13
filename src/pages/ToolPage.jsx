import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import BuildCTA from '../components/growth/BuildCTA';
import JsonLd, { faqSchema, breadcrumbSchema } from '../components/growth/JsonLd';
import { getTool, TOOLS } from '../lib/toolsContent';
import RunwayCalculator from '../components/tools/RunwayCalculator';
import BurnRateCalculator from '../components/tools/BurnRateCalculator';
import LtvCacCalculator from '../components/tools/LtvCacCalculator';

const disp = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };
const SITE = 'https://koalastatements.com';

const CALCULATORS = {
  RunwayCalculator,
  BurnRateCalculator,
  LtvCacCalculator,
};

const Wrap = ({ children, style }) => (
  <div style={{ maxWidth: 760, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
);

export default function ToolPage() {
  const { slug } = useParams();
  const t = getTool(slug);
  if (!t) return <Navigate to="/tools" replace />;

  const Calc = CALCULATORS[t.component];
  const related = TOOLS.filter((x) => x.slug !== t.slug);

  // A sensible AI seed so the "turn this into a full model" CTA lands in the builder ready to go.
  const seed =
    'Build a complete 3-statement financial model for my startup. Start from reasonable assumptions for revenue growth, gross margin, operating expenses, and cash so I can see runway and profitability, then I will adjust the numbers.';

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav />
      <JsonLd data={faqSchema(t.faqs)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: `${SITE}/` },
        { name: 'Tools', url: `${SITE}/tools` },
        { name: t.name, url: `${SITE}/tools/${t.slug}` },
      ])} />

      {/* Breadcrumb */}
      <Wrap style={{ padding: '20px 24px 0' }}>
        <div style={{ ...body, fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link to="/tools" style={{ color: C.muted, textDecoration: 'none' }}>Tools</Link>
          <ChevronRight size={12} /> <span style={{ color: C.ink2 }}>{t.name}</span>
        </div>
      </Wrap>

      {/* Hero */}
      <Wrap style={{ padding: '18px 24px 8px' }}>
        <h1 style={{ ...disp, fontSize: 'clamp(27px, 4.4vw, 38px)', fontWeight: 800, color: C.ink, margin: '0 0 12px', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
          {t.name}
        </h1>
        <p style={{ ...body, fontSize: 16.5, lineHeight: 1.6, color: C.ink2, margin: 0 }}>{t.intro}</p>
      </Wrap>

      {/* Calculator */}
      <Wrap style={{ padding: '24px 24px 0' }}>
        <div style={{ background: C.bgWarm, border: `1px solid ${C.border}`, borderRadius: 18, padding: '22px 22px' }}>
          {Calc ? <Calc /> : null}
        </div>
        {t.formula && (
          <div style={{ ...body, fontSize: 13, color: C.muted, marginTop: 14, padding: '10px 14px', background: C.surfaceAlt, border: `1px solid ${C.borderSoft}`, borderRadius: 10 }}>
            <strong style={{ color: C.ink2 }}>Formula:</strong> {t.formula}
          </div>
        )}
      </Wrap>

      {/* Turn it into a model */}
      <Wrap style={{ padding: '32px 24px 0' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 22px' }}>
          <div style={{ ...disp, fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em', marginBottom: 6 }}>
            Want the full picture?
          </div>
          <p style={{ ...body, fontSize: 14.5, color: C.ink2, margin: '0 0 18px', lineHeight: 1.55 }}>
            A single number is a snapshot. Build a complete 3-statement model to see how runway and profit change
            as you grow — described in a sentence, assembled by AI, editable line by line.
          </p>
          <BuildCTA seed={seed} primaryLabel="Build a full model with AI" source={`tool:${t.slug}`} />
        </div>
      </Wrap>

      {/* FAQ */}
      {t.faqs?.length > 0 && (
        <Wrap style={{ padding: '32px 24px 0' }}>
          <h2 style={{ ...disp, fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', margin: '0 0 14px' }}>
            Frequently asked
          </h2>
          {t.faqs.map((f, i) => (
            <div key={i} style={{ marginBottom: 18 }}>
              <div style={{ ...disp, fontSize: 15.5, fontWeight: 700, color: C.ink, marginBottom: 5 }}>{f.q}</div>
              <div style={{ ...body, fontSize: 14.5, lineHeight: 1.6, color: C.ink2 }}>{f.a}</div>
            </div>
          ))}
        </Wrap>
      )}

      {/* Related tools */}
      <Wrap style={{ padding: '28px 24px 72px' }}>
        <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
          More calculators
        </div>
        <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
          {related.map((r) => (
            <Link key={r.slug} to={`/tools/${r.slug}`} style={{ ...body, fontSize: 14, fontWeight: 600, color: C.goldText, textDecoration: 'none' }}>
              {r.name} →
            </Link>
          ))}
        </div>
      </Wrap>
    </div>
  );
}
