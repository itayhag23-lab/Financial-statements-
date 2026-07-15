import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import TopNav from '../components/nav/TopNav';
import BuildCTA from '../components/growth/BuildCTA';
import JsonLd, { faqSchema, breadcrumbSchema, softwareApplicationSchema } from '../components/growth/JsonLd';
import { getTemplate, TEMPLATES } from '../lib/templateContent';

const disp = { fontFamily: FONTS.display };
const body = { fontFamily: FONTS.body };
const SITE = 'https://koalastatements.com';

const Wrap = ({ children, style }) => (
  <div style={{ maxWidth: 820, margin: '0 auto', padding: '0 24px', ...style }}>{children}</div>
);

export default function TemplatePage() {
  const { slug } = useParams();
  const t = getTemplate(slug);
  if (!t) return <Navigate to="/templates" replace />;

  const related = TEMPLATES.filter((x) => x.slug !== t.slug).slice(0, 3);

  return (
    <div style={{ minHeight: '100vh', background: C.bg }}>
      <TopNav />
      <JsonLd data={softwareApplicationSchema({
        name: t.title,
        url: `${SITE}/templates/${t.slug}`,
        description: t.metaDescription,
        featureList: t.featureList,
        keywords: t.keywords,
      })} />
      <JsonLd data={faqSchema(t.faqs)} />
      <JsonLd data={breadcrumbSchema([
        { name: 'Home', url: `${SITE}/` },
        { name: 'Templates', url: `${SITE}/templates` },
        { name: t.title, url: `${SITE}/templates/${t.slug}` },
      ])} />

      {/* Breadcrumb */}
      <Wrap style={{ padding: '20px 24px 0' }}>
        <div style={{ ...body, fontSize: 12.5, color: C.muted, display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <Link to="/templates" style={{ color: C.muted, textDecoration: 'none' }}>Templates</Link>
          <ChevronRight size={12} /> <span style={{ color: C.ink2 }}>{t.industry}</span>
        </div>
      </Wrap>

      {/* Hero */}
      <Wrap style={{ padding: '18px 24px 8px' }}>
        <span style={{ ...body, fontSize: 11.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.goldText }}>
          {t.industry} · Financial model
        </span>
        <h1 style={{ ...disp, fontSize: 'clamp(28px, 4.6vw, 40px)', fontWeight: 800, color: C.ink, margin: '10px 0 12px', letterSpacing: '-0.02em', lineHeight: 1.12 }}>
          {t.title}
        </h1>
        <p style={{ ...body, fontSize: 16.5, lineHeight: 1.6, color: C.ink2, margin: '0 0 22px' }}>{t.intro}</p>
        <BuildCTA seed={t.aiSeed} source={`template:${t.slug}`} />
      </Wrap>

      {/* What's included */}
      <Wrap style={{ padding: '36px 24px 0' }}>
        <h2 style={{ ...disp, fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', margin: '0 0 14px' }}>
          What this template builds
        </h2>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {t.included.map((f, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, marginBottom: 11 }}>
              <span style={{ flexShrink: 0, width: 20, height: 20, borderRadius: '50%', background: C.greenSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                <Check size={12} color={C.green} />
              </span>
              <span style={{ ...body, fontSize: 15, lineHeight: 1.5, color: C.ink2 }}>{f}</span>
            </li>
          ))}
        </ul>
      </Wrap>

      {/* Key drivers / benchmarks */}
      <Wrap style={{ padding: '32px 24px 0' }}>
        <h2 style={{ ...disp, fontSize: 20, fontWeight: 700, color: C.ink, letterSpacing: '-0.01em', margin: '0 0 6px' }}>
          Key drivers & benchmarks
        </h2>
        <p style={{ ...body, fontSize: 14, color: C.muted, margin: '0 0 16px' }}>
          The numbers that shape a {t.industry} model — and roughly where healthy businesses land.
        </p>
        <div style={{ border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden', background: C.surface }}>
          {t.drivers.map((d, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr 1.4fr', gap: 12, padding: '13px 16px', borderTop: i ? `1px solid ${C.borderSoft}` : 'none', alignItems: 'baseline' }}>
              <span style={{ ...body, fontSize: 14, fontWeight: 600, color: C.ink }}>{d.label}</span>
              <span style={{ ...disp, fontSize: 14.5, fontWeight: 700, color: C.goldText, fontVariantNumeric: 'tabular-nums' }}>{d.typical}</span>
              <span style={{ ...body, fontSize: 13, color: C.muted }}>{d.note}</span>
            </div>
          ))}
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

      {/* Closing CTA */}
      <Wrap style={{ padding: '28px 24px 12px' }}>
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: '24px 22px' }}>
          <div style={{ ...disp, fontSize: 19, fontWeight: 800, color: C.ink, letterSpacing: '-0.01em', marginBottom: 6 }}>
            Build your {t.industry} model now
          </div>
          <p style={{ ...body, fontSize: 14.5, color: C.ink2, margin: '0 0 18px', lineHeight: 1.55 }}>
            Describe your business in a sentence and AI assembles the full 3-statement model — then edit every assumption yourself.
          </p>
          <BuildCTA seed={t.aiSeed} source={`template-footer:${t.slug}`} />
        </div>
      </Wrap>

      {/* Related */}
      <Wrap style={{ padding: '28px 24px 72px' }}>
        <div style={{ ...body, fontSize: 12, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: C.muted, marginBottom: 12 }}>
          More templates
        </div>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          {related.map((r) => (
            <Link key={r.slug} to={`/templates/${r.slug}`} style={{ ...body, fontSize: 14, fontWeight: 600, color: C.goldText, textDecoration: 'none' }}>
              {r.industry} →
            </Link>
          ))}
        </div>
      </Wrap>
    </div>
  );
}
