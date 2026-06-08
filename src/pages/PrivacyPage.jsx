import React from 'react';
import { Link } from 'react-router-dom';
import { FONTS } from '../brand/theme';
import { Logo } from '../brand/Logo';

const S = {
  page:   { minHeight: '100vh', background: '#F8FAFC', fontFamily: FONTS.body, color: '#0F172A' },
  nav:    { background: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  wrap:   { maxWidth: 740, margin: '0 auto', padding: '52px 24px 80px' },
  h1:     { fontFamily: FONTS.display, fontSize: 34, fontWeight: 700, color: '#0F172A', marginBottom: 6, letterSpacing: '-0.02em' },
  meta:   { fontSize: 13.5, color: '#64748B', marginBottom: 44 },
  h2:     { fontFamily: FONTS.display, fontSize: 19, fontWeight: 700, color: '#0F172A', margin: '38px 0 10px', letterSpacing: '-0.01em' },
  p:      { fontSize: 14.5, lineHeight: 1.75, color: '#334155', marginBottom: 14 },
  ul:     { fontSize: 14.5, lineHeight: 1.75, color: '#334155', paddingLeft: 22, marginBottom: 14 },
  hr:     { border: 'none', borderTop: '1px solid #E2E8F0', margin: '40px 0' },
  badge:  { display: 'inline-block', background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600, marginBottom: 24 },
};

export default function PrivacyPage() {
  return (
    <div className="koala-page" style={S.page}>
      <nav style={S.nav}>
        <Link to="/" style={{ textDecoration: 'none' }}><Logo size={26} /></Link>
        <Link to="/" style={{ fontFamily: FONTS.body, fontSize: 13, color: '#64748B', textDecoration: 'none' }}>← Back to home</Link>
      </nav>

      <div style={S.wrap}>
        <div style={S.badge}>Legal</div>
        <h1 style={S.h1}>Privacy Policy</h1>
        <p style={S.meta}>Effective date: June 2026 · Last updated: June 2026</p>
        <hr style={S.hr} />

        <p style={S.p}>Koala Statements ("we", "us", "our") is committed to protecting your privacy. This policy explains what data we collect, how we use it, and what rights you have.</p>

        <h2 style={S.h2}>1. Data we collect</h2>
        <p style={S.p}><strong>Account data:</strong> When you create an account we collect your email address and, if you sign in with Google, your name and profile picture.</p>
        <p style={S.p}><strong>Financial model data:</strong> The numbers, assumptions, and structure of financial models you create and save in the app. This data belongs to you.</p>
        <p style={S.p}><strong>AI inputs:</strong> When you use the AI advisor, your prompts are sent to Google Gemini to generate a response. We do not store AI prompts independently beyond what is saved in your model.</p>
        <p style={S.p}><strong>Usage analytics:</strong> We use PostHog to collect aggregated, anonymized analytics (page views, feature usage). No financial values are collected by analytics.</p>
        <p style={S.p}><strong>Support communications:</strong> If you contact us by email, we retain that correspondence.</p>

        <h2 style={S.h2}>2. How we use your data</h2>
        <ul style={S.ul}>
          <li>To provide and improve the service</li>
          <li>To send transactional emails (welcome, account notices)</li>
          <li>To analyze aggregate usage patterns and improve the product</li>
          <li>To respond to support requests</li>
        </ul>
        <p style={S.p}>We do not sell your data. We do not use your financial model content to train AI models.</p>

        <h2 style={S.h2}>3. Third-party services</h2>
        <ul style={S.ul}>
          <li><strong>Supabase</strong> — authentication and database storage (servers in EU and US)</li>
          <li><strong>Google Gemini API</strong> — AI advisor inference (inputs processed by Google)</li>
          <li><strong>PostHog</strong> — product analytics (anonymized)</li>
          <li><strong>Resend</strong> — transactional email delivery</li>
          <li><strong>Vercel</strong> — application hosting and edge infrastructure</li>
        </ul>

        <h2 style={S.h2}>4. Data retention</h2>
        <p style={S.p}>Your account and model data is retained for as long as your account is active. Share links expire 90 days after creation and stop resolving after that point.</p>
        <p style={S.p}>Self-serve account deletion and data export inside the app are on our roadmap but not yet built. Until then, requests are handled manually as described below.</p>

        <h2 style={S.h2}>5. Your rights</h2>
        <p style={S.p}>You have the right to access, correct, export, or delete your personal data at any time. To exercise these rights, email <strong>hello@koalastatements.com</strong> from your account address — we will export or permanently delete your account and associated data (including saved models and shares) within 30 days and confirm by email when it's done.</p>
        <p style={S.p}>If you are in the EU, you may also lodge a complaint with your local data protection authority.</p>

        <h2 style={S.h2}>6. Cookies</h2>
        <p style={S.p}>We use functional cookies for authentication (Supabase session) and, if you consent, analytics cookies from PostHog. You can disable cookies in your browser settings; this may prevent you from signing in.</p>

        <h2 style={S.h2}>7. Security</h2>
        <p style={S.p}>Data is encrypted in transit (TLS) and at rest. Authentication is handled by Supabase, which is SOC 2 Type II certified. Database row-level security policies ensure no user can read another user's saved projects.</p>
        <p style={S.p}><strong>Shared models:</strong> When you create a public share link, only the read-only summary shown on that page (headline figures and a display name) is stored in the public record — never your full editable model or the description you typed when building it. Share links use unguessable random IDs, so they can only be reached by people you give the link to.</p>
        <p style={S.p}>Koala Statements itself is an early-stage product and has not (yet) completed third-party certifications such as SOC 2 or ISO 27001. We rely on the certified infrastructure of our vendors (Supabase, Vercel) and will pursue our own audits as the company grows.</p>

        <h2 style={S.h2}>8. Changes to this policy</h2>
        <p style={S.p}>We may update this policy from time to time. We will notify you by email or in-app notice when material changes occur.</p>

        <hr style={S.hr} />
        <p style={{ ...S.p, color: '#94A3B8' }}>Questions? Contact us at <a href="mailto:hello@koalastatements.com" style={{ color: '#10B981' }}>hello@koalastatements.com</a></p>
      </div>
    </div>
  );
}
