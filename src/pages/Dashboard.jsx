import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Copy, Clock, TrendingUp,
  LogOut, FileText, Sparkles, MessageSquare, AlertTriangle,
  ArrowRight, Layers,
} from 'lucide-react';
import { FONTS } from '../brand/theme';
import { Logo } from '../brand/Logo';
import { listProjects, deleteProject, duplicateProject, genId, saveProject } from '../lib/persistence';
import { useAuth, signOut, deleteAccount } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ContactForm from '../components/ContactForm';

// ── Palette — aligned to the redesigned landing page. One emerald accent on a
// clean light base. Emerald *text/icons on white* use accentDeep (#047857) for
// AA contrast; the bright accent (#10B981) is reserved for dots/dark surfaces.
const P = {
  bg:         '#FFFFFF',
  bgSoft:     '#F7F8FA',
  bgMint:     '#EFFBF5',
  accentSoft: '#ECFDF5',
  border:     '#E5E7EB',
  borderFaint:'#EEF0F3',
  ink:        '#0F172A',
  ink2:       '#334155',
  muted:      '#64748B',
  faint:      '#94A3B8',
  accent:     '#10B981',
  accentMid:  '#059669',
  accentDeep: '#047857',
  blue:       '#3B82F6',
  violet:     '#7C3AED',
  red:        '#EF4444',
};

const body = { fontFamily: FONTS.body };
const disp = { fontFamily: FONTS.display };
const mono = { fontFamily: FONTS.num };

// Detects viewport width for responsive inline styles. Starts `false` (desktop)
// so the first client render matches pre-rendered HTML — the real value is set
// in the effect after mount, keeping hydration free of mismatches.
function useIsMobile(bp = 640) {
  const [mob, setMob] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(`(max-width: ${bp}px)`);
    setMob(mq.matches);
    const fn = e => setMob(e.matches);
    mq.addEventListener('change', fn);
    return () => mq.removeEventListener('change', fn);
  }, [bp]);
  return mob;
}

// Returns [isHovered, eventProps] for inline-style hover effects.
function useHover() {
  const [hov, setHov] = useState(false);
  return [hov, { onMouseEnter: () => setHov(true), onMouseLeave: () => setHov(false) }];
}

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// House CTA — emerald (primary) or ink (secondary) pill Link, matching the
// landing PillLink treatment (white text, hover lift + soft shadow).
function ActionLink({ to, tone = 'primary', icon: Icon, children, mob }) {
  const [hov, hp] = useHover();
  const tones = {
    primary: {
      color: '#FFFFFF', background: hov ? P.accentMid : P.accentDeep,
      boxShadow: hov ? '0 10px 24px -8px rgba(4,120,87,0.45)' : '0 1px 2px rgba(15,23,42,0.08)',
    },
    ink: {
      color: '#FFFFFF', background: hov ? '#1E293B' : P.ink,
      boxShadow: hov ? '0 10px 24px -10px rgba(15,23,42,0.4)' : '0 1px 2px rgba(15,23,42,0.08)',
    },
  };
  return (
    <Link
      to={to} {...hp}
      style={{
        ...body, fontSize: 14.5, fontWeight: 600, padding: mob ? '11px 18px' : '12px 22px',
        borderRadius: 999, textDecoration: 'none', display: 'inline-flex', alignItems: 'center',
        justifyContent: 'center', gap: 8, whiteSpace: 'nowrap', flex: mob ? 1 : 'initial',
        transform: hov ? 'translateY(-1px)' : 'translateY(0)',
        transition: 'transform 160ms ease, box-shadow 160ms ease, background 160ms ease',
        ...tones[tone],
      }}
    >
      {Icon && <Icon size={16} />} {children}
    </Link>
  );
}

// Ghost app-bar button (Feedback / Sign out) — icon-only on phones.
function AppBarButton({ onClick, ariaLabel, icon: Icon, label }) {
  const [hov, hp] = useHover();
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      {...hp}
      className="koala-appbar-btn flex shrink-0 items-center gap-1.5 px-2.5 py-2 sm:px-3.5"
      style={{
        ...body, background: hov ? P.bgSoft : P.bg, border: `1px solid ${P.border}`,
        borderRadius: 999, cursor: 'pointer', fontSize: 13.5, fontWeight: 500,
        color: P.ink2, minHeight: 40,
        boxShadow: hov ? '0 6px 16px -10px rgba(15,23,42,0.2)' : 'none',
        transition: 'background 140ms, box-shadow 140ms',
      }}
    >
      <Icon size={15} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function StatTile({ icon: Icon, label, value, first }) {
  return (
    <div style={{
      padding: '18px 20px', flex: 1, minWidth: 0,
      borderLeft: first ? 'none' : `1px solid ${P.borderFaint}`,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, background: P.accentSoft, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={15} color={P.accentDeep} />
        </span>
        <span style={{ ...body, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: P.muted, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
      </div>
      <div style={{ ...mono, fontSize: 24, fontWeight: 600, color: P.ink, letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    </div>
  );
}

function ProjectCard({ project, onDelete, onDuplicate }) {
  const [hover, setHover] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmDel(false); }}
      style={{
        background: P.bg,
        border: `1px solid ${hover ? '#D7DCE3' : P.borderFaint}`,
        borderRadius: 16, padding: '20px 20px 18px',
        transition: 'border-color 220ms, box-shadow 220ms, transform 220ms',
        transform: hover ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: hover ? '0 18px 40px -22px rgba(15,23,42,0.22)' : '0 1px 2px rgba(15,23,42,0.04)',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 14,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <span style={{ width: 42, height: 42, borderRadius: 12, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={19} color={P.accentDeep} />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...disp, fontSize: 16, fontWeight: 700, color: P.ink, letterSpacing: '-0.015em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 190 }}>
              {project.name || 'Untitled Project'}
            </div>
            <div style={{ ...body, fontSize: 12, color: P.muted, marginTop: 3, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={11} />
              {timeAgo(project.updatedAt)}
            </div>
          </div>
        </div>
        {/* Action buttons — always visible (not hover-only) so they're tappable
            on touch devices, and the delete is clearly marked in red. */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={e => { e.preventDefault(); onDuplicate(project.id); }}
            title="Duplicate"
            aria-label="Duplicate model"
            style={{ background: P.bgSoft, border: `1px solid ${P.borderFaint}`, borderRadius: 9, padding: '7px 9px', cursor: 'pointer', color: P.muted, display: 'flex', alignItems: 'center' }}
          >
            <Copy size={14} />
          </button>
          {confirmDel
            ? <>
                <button
                  onClick={e => { e.preventDefault(); onDelete(project.id); }}
                  style={{ background: P.red, border: `1px solid ${P.red}`, borderRadius: 9, padding: '7px 11px', cursor: 'pointer', color: '#fff', fontSize: 12, fontWeight: 600, ...body }}
                >Delete</button>
                <button
                  onClick={e => { e.preventDefault(); setConfirmDel(false); }}
                  style={{ background: P.bgSoft, border: `1px solid ${P.borderFaint}`, borderRadius: 9, padding: '7px 11px', cursor: 'pointer', color: P.ink2, fontSize: 12, ...body }}
                >Cancel</button>
              </>
            : <button
                onClick={e => { e.preventDefault(); setConfirmDel(true); }}
                title="Delete project"
                aria-label="Delete model"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 9, padding: '7px 9px', cursor: 'pointer', color: P.red, display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={14} />
              </button>
          }
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {project.currencyKey && (
          <span style={{ ...body, fontSize: 11, padding: '3px 9px', borderRadius: 20, background: P.accentSoft, color: P.accentDeep, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {project.currencyKey}
          </span>
        )}
        {project.enabledStatements?.cashFlow && (
          <span style={{ ...body, fontSize: 11, padding: '3px 9px', borderRadius: 20, background: '#EFF6FF', color: '#2563EB', fontWeight: 500 }}>Cash Flow</span>
        )}
        {project.enabledStatements?.balance && (
          <span style={{ ...body, fontSize: 11, padding: '3px 9px', borderRadius: 20, background: '#F5F3FF', color: P.violet, fontWeight: 500 }}>Balance Sheet</span>
        )}
      </div>

      {/* Open link */}
      <Link
        to={`/app/${project.id}`}
        style={{ ...body, fontSize: 13.5, fontWeight: 600, color: P.accentDeep, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 'auto', paddingTop: 4 }}
      >
        Open model
        <ArrowRight size={15} style={{ transform: hover ? 'translateX(3px)' : 'translateX(0)', transition: 'transform 200ms ease' }} />
      </Link>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '72px 24px',
      background: P.bg, border: `1px solid ${P.borderFaint}`, borderRadius: 20,
      boxShadow: '0 1px 2px rgba(15,23,42,0.04)',
    }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 22px' }}>
        <Sparkles size={26} color={P.accentDeep} />
      </div>
      <div style={{ ...disp, fontSize: 22, fontWeight: 800, color: P.ink, marginBottom: 10, letterSpacing: '-0.02em' }}>Build your first model</div>
      <div style={{ ...body, fontSize: 15, lineHeight: 1.6, color: P.muted, maxWidth: 380, margin: '0 auto 26px' }}>
        Describe your business in plain English and Koala builds a fully-linked 3-statement model in under 60 seconds.
      </div>
      <ActionLink to="/app?new=ai" tone="primary" icon={Sparkles}>Create with AI</ActionLink>
    </div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const user      = useAuth();
  const mob       = useIsMobile(640);
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [localCount, setLocalCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');

  useEffect(() => {
    // Redirect to auth if not signed in (and supabase is configured)
    if (supabase && user === null) {
      navigate('/auth', { replace: true });
      return;
    }
    if (user === undefined) return; // still loading auth

    loadProjects();
    checkLocalProjects();
  }, [user]); // eslint-disable-line

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const list = await listProjects();
      setProjects(list);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkLocalProjects = () => {
    try {
      const idx = JSON.parse(localStorage.getItem('koala:v1:projects') || '{}');
      setLocalCount(Object.keys(idx).length);
    } catch {}
  };

  const handleDelete = useCallback(async (id) => {
    await deleteProject(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  const handleDuplicate = useCallback(async (id) => {
    const newId = await duplicateProject(id);
    if (newId) await loadProjects();
  }, [loadProjects]);

  const handleImportLocal = useCallback(async () => {
    setImporting(true);
    try {
      const idx = JSON.parse(localStorage.getItem('koala:v1:projects') || '{}');
      for (const [id, meta] of Object.entries(idx)) {
        try {
          const raw = localStorage.getItem(`koala:v1:project:${id}`);
          if (!raw) continue;
          const doc = JSON.parse(raw);
          await saveProject(id, { meta: doc.meta, model: doc.model, wizardAnswers: doc.wizardAnswers });
        } catch {}
      }
      await loadProjects();
      setLocalCount(0);
    } finally {
      setImporting(false);
    }
  }, [loadProjects]);

  const handleDeleteAccount = useCallback(async () => {
    setDeleteError('');
    setDeletingAccount(true);
    try {
      await deleteAccount();
      navigate('/', { replace: true });
    } catch (e) {
      setDeleteError(e.message || 'Could not delete your account. Please try again.');
      setDeletingAccount(false);
    }
  }, [navigate]);

  const userInitial = user?.email?.[0]?.toUpperCase() || '?';
  const userEmail   = user?.email || '';

  // ── Derived summary figures — only from data we actually have (projects). ──
  const statementsEnabled = projects.reduce(
    (n, p) => n + (p.enabledStatements ? Object.values(p.enabledStatements).filter(Boolean).length : 0),
    0,
  );
  const lastEditedTs = projects.reduce((max, p) => Math.max(max, p.updatedAt || 0), 0);
  const lastEditedLabel = lastEditedTs ? timeAgo(lastEditedTs) : '—';

  return (
    <div className="koala-page" style={{ minHeight: '100vh', background: P.bgSoft, ...body, color: P.ink, overflowX: 'hidden' }}>

      {/* Top nav — sticky app bar consistent with the landing nav. The brand can
          shrink/truncate and the action buttons collapse to icon-only on phones,
          so the row can never overflow and overlap the avatar. */}
      <header style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(16px)', borderBottom: `1px solid ${P.borderFaint}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div
          className="mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
          style={{ maxWidth: 1200 }}
        >
          <Link to="/" className="min-w-0 shrink overflow-hidden" style={{ textDecoration: 'none' }}>
            <span className="hidden sm:inline-flex"><Logo size={28} accent={P.accentDeep} /></span>
            <span className="inline-flex sm:hidden"><Logo size={22} accent={P.accentDeep} /></span>
          </Link>

          <div className="koala-appbar flex shrink-0 items-center gap-2 sm:gap-3">
            {/* User badge — email only appears once there's room for it */}
            <div className="flex items-center gap-2">
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: P.accentSoft, border: `1px solid rgba(4,120,87,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ ...body, fontSize: 13.5, fontWeight: 700, color: P.accentDeep }}>{userInitial}</span>
              </div>
              <span className="hidden min-w-0 truncate md:block" style={{ ...body, fontSize: 13, color: P.ink2, maxWidth: 200 }}>{userEmail}</span>
            </div>
            <AppBarButton
              onClick={() => {
                setFeedbackOpen(true);
                requestAnimationFrame(() => {
                  const el = document.getElementById('feedback');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
              }}
              ariaLabel="Feedback"
              icon={MessageSquare}
              label="Feedback"
            />
            <AppBarButton
              onClick={async () => { await signOut(); navigate('/auth', { replace: true }); }}
              ariaLabel="Sign out"
              icon={LogOut}
              label="Sign out"
            />
          </div>
        </div>
      </header>

      {/* Main */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: mob ? '28px 20px 56px' : '44px 24px 72px' }}>

        {/* Header / hero row */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 18 }}>
          <div>
            <div style={{ ...body, fontSize: 12.5, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: P.accentDeep, marginBottom: 10 }}>Workspace</div>
            <h1 style={{ ...disp, fontSize: mob ? 30 : 38, fontWeight: 800, color: P.ink, margin: 0, letterSpacing: '-0.03em', lineHeight: 1.05 }}>Your models</h1>
            <p style={{ ...body, fontSize: 15, color: P.muted, margin: '10px 0 0', lineHeight: 1.5 }}>
              {loading
                ? 'Loading your saved financial models…'
                : projects.length === 0
                  ? 'Your saved financial models will live here.'
                  : `${projects.length} ${projects.length === 1 ? 'model' : 'models'} saved to your account.`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, width: mob ? '100%' : 'auto' }}>
            <ActionLink to="/app?new=ai" tone="primary" icon={Sparkles} mob={mob}>New with AI</ActionLink>
            <ActionLink to="/app?new=manual" tone="ink" icon={Plus} mob={mob}>New model</ActionLink>
          </div>
        </div>

        {/* Summary stats strip — computed only from the projects array. */}
        {!loading && projects.length > 0 && (
          <div style={{
            display: 'flex', flexWrap: 'wrap',
            background: P.bg, border: `1px solid ${P.borderFaint}`, borderRadius: 16,
            boxShadow: '0 1px 2px rgba(15,23,42,0.04)', overflow: 'hidden', marginBottom: 28,
          }}>
            <StatTile icon={Layers} label="Total models" value={projects.length} first />
            <StatTile icon={FileText} label="Statements enabled" value={statementsEnabled} />
            <StatTile icon={Clock} label="Last edited" value={lastEditedLabel} />
          </div>
        )}

        {/* Import local banner */}
        {supabase && user && localCount > 0 && (
          <div style={{ background: P.bgMint, border: `1px solid rgba(4,120,87,0.18)`, borderRadius: 16, padding: '16px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ width: 40, height: 40, borderRadius: 11, background: P.bg, border: `1px solid rgba(4,120,87,0.18)`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={18} color={P.accentDeep} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...body, fontSize: 14.5, fontWeight: 700, color: P.ink }}>You have {localCount} model{localCount > 1 ? 's' : ''} saved in this browser</div>
              <div style={{ ...body, fontSize: 13.5, color: P.muted, marginTop: 2, lineHeight: 1.5 }}>Import them to your account so they're available on all your devices.</div>
            </div>
            <button
              onClick={handleImportLocal}
              disabled={importing}
              style={{ ...body, background: importing ? P.accentMid : P.accentDeep, color: '#fff', border: 'none', borderRadius: 999, padding: '10px 20px', fontSize: 13.5, fontWeight: 600, cursor: importing ? 'default' : 'pointer', flexShrink: 0, boxShadow: '0 1px 2px rgba(15,23,42,0.08)' }}
            >
              {importing ? 'Importing…' : 'Import to account'}
            </button>
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: P.bg, border: `1px solid ${P.borderFaint}`, borderRadius: 16, height: 168, padding: 20, boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 18 }}>
                  <div className="koala-skel" style={{ width: 42, height: 42, borderRadius: 12 }} />
                  <div style={{ flex: 1 }}>
                    <div className="koala-skel" style={{ width: '65%', height: 13, borderRadius: 6, marginBottom: 8 }} />
                    <div className="koala-skel" style={{ width: '40%', height: 10, borderRadius: 6 }} />
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <div className="koala-skel" style={{ width: 54, height: 20, borderRadius: 20 }} />
                  <div className="koala-skel" style={{ width: 74, height: 20, borderRadius: 20 }} />
                </div>
              </div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        )}

        {/* Feedback / contact — collapsed to a slim bar by default so it doesn't
            dominate the dashboard; expands to the full form on click. */}
        <div id="feedback" style={{ marginTop: 48, scrollMarginTop: 80, maxWidth: 560, margin: '48px auto 0' }}>
          {!feedbackOpen ? (
            <button
              onClick={() => setFeedbackOpen(true)}
              style={{ ...body, width: '100%', display: 'flex', alignItems: 'center', gap: 12, background: P.bg, border: `1px solid ${P.borderFaint}`, borderRadius: 14, padding: '14px 18px', cursor: 'pointer', textAlign: 'left', boxShadow: '0 1px 2px rgba(15,23,42,0.04)' }}
            >
              <div style={{ width: 34, height: 34, borderRadius: 10, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare size={16} color={P.accentDeep} />
              </div>
              <span style={{ ...body, fontSize: 14, fontWeight: 600, color: P.ink }}>Contact &amp; feedback</span>
              <span style={{ ...body, fontSize: 13, color: P.muted, marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 6 }}>Found a bug or have an idea? <ArrowRight size={14} /></span>
            </button>
          ) : (
            <div style={{ background: P.bg, border: `1px solid ${P.borderFaint}`, borderRadius: 16, padding: '24px 22px', boxShadow: '0 18px 40px -22px rgba(15,23,42,0.22)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{ width: 34, height: 34, borderRadius: 10, background: P.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={17} color={P.accentDeep} />
                </div>
                <h2 style={{ ...disp, fontSize: 18, fontWeight: 700, color: P.ink, margin: 0, letterSpacing: '-0.015em' }}>Contact &amp; feedback</h2>
                <button
                  onClick={() => setFeedbackOpen(false)}
                  aria-label="Close feedback"
                  style={{ ...body, marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500, color: P.faint }}
                >
                  Close
                </button>
              </div>
              <ContactForm theme="light" source="dashboard" defaultEmail={userEmail} onSent={() => setFeedbackOpen(true)} />
            </div>
          )}
        </div>

        {/* Danger zone — permanent account deletion */}
        {supabase && user && (
          <div style={{ maxWidth: 560, margin: '20px auto 0', textAlign: 'center' }}>
            <button
              onClick={() => { setShowDeleteAccount(true); setDeleteConfirm(''); setDeleteError(''); }}
              style={{ ...body, background: 'none', border: 'none', cursor: 'pointer', fontSize: 12.5, color: '#DC2626', fontWeight: 600 }}
            >
              Delete my account
            </button>
          </div>
        )}
      </div>

      {/* Delete-account confirmation modal */}
      {showDeleteAccount && (
        <div
          onClick={() => { if (!deletingAccount) setShowDeleteAccount(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,23,42,0.55)', backdropFilter: 'blur(2px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: P.bg, borderRadius: 20, width: 'min(440px, 100%)', padding: '28px 26px', boxShadow: '0 40px 90px -28px rgba(15,23,42,0.5)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={19} color={P.red} />
              </div>
              <h2 style={{ ...disp, fontSize: 20, fontWeight: 800, color: P.ink, margin: 0, letterSpacing: '-0.02em' }}>Delete your account?</h2>
            </div>
            <p style={{ ...body, fontSize: 14, color: P.ink2, lineHeight: 1.6, margin: '0 0 18px' }}>
              This permanently deletes your account and <strong>all of your saved models</strong>. This can’t be undone.
              Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoFocus
              disabled={deletingAccount}
              style={{ ...body, width: '100%', boxSizing: 'border-box', borderRadius: 11, background: P.bg, color: P.ink, fontSize: 14, padding: '12px 14px', border: `1px solid ${P.border}`, outline: 'none' }}
            />
            {deleteError && (
              <div style={{ ...body, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.33)', borderRadius: 10, padding: '10px 12px', marginTop: 12 }}>
                <AlertTriangle size={15} /> {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button
                onClick={() => setShowDeleteAccount(false)}
                disabled={deletingAccount}
                style={{ ...body, flex: 1, background: P.bgSoft, color: P.ink2, border: `1px solid ${P.border}`, borderRadius: 11, padding: '12px 16px', fontSize: 14, fontWeight: 600, cursor: deletingAccount ? 'default' : 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirm.trim().toUpperCase() !== 'DELETE'}
                style={{ ...body, flex: 1, background: (deletingAccount || deleteConfirm.trim().toUpperCase() !== 'DELETE') ? '#FCA5A5' : P.red, color: '#fff', border: 'none', borderRadius: 11, padding: '12px 16px', fontSize: 14, fontWeight: 700, cursor: (deletingAccount || deleteConfirm.trim().toUpperCase() !== 'DELETE') ? 'default' : 'pointer' }}
              >
                {deletingAccount ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        html, body, #root { max-width: 100vw; }
        .koala-skel {
          background: linear-gradient(90deg, #EEF1F5 25%, #F6F8FA 37%, #EEF1F5 63%);
          background-size: 400% 100%;
          animation: koalaShimmer 1.4s ease-in-out infinite;
        }
        @keyframes koalaShimmer { 0% { background-position: 100% 0; } 100% { background-position: -100% 0; } }
        @media (max-width: 640px) {
          .koala-appbar button, .koala-appbar a { min-height: 44px; }
          .koala-appbar-btn { min-height: 44px; }
        }
      `}</style>
    </div>
  );
}
