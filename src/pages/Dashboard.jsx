import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Copy, ExternalLink, Clock, TrendingUp,
  ChevronRight, FileText, Sparkles, MessageSquare, AlertTriangle, GraduationCap,
} from 'lucide-react';
import { FONTS, C } from '../brand/theme';
import { Logo } from '../brand/Logo';
import { listProjects, deleteProject, duplicateProject, genId, saveProject } from '../lib/persistence';
import { useAuth, deleteAccount } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ContactForm from '../components/ContactForm';
import PricingModal from '../components/ui/PricingModal';
import UserMenu from '../components/nav/UserMenu';
import { fetchSubscription, isPro } from '../lib/subscription';

const body = { fontFamily: FONTS.body };
const disp = { fontFamily: FONTS.display };

function timeAgo(ts) {
  if (!ts) return '';
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60)    return 'just now';
  if (s < 3600)  return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  if (s < 604800) return `${Math.floor(s / 86400)}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function ProjectCard({ project, onDelete, onDuplicate }) {
  const navigate = useNavigate();
  const [hover, setHover] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const open = () => navigate(`/app/${project.id}`);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmDel(false); }}
      onClick={open}
      role="link"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } }}
      aria-label={`Open ${project.name || 'Untitled Project'}`}
      style={{
        background: hover ? '#F8FAFC' : '#FFFFFF',
        border: `1px solid ${hover ? C.borderSoft : '#E2E8F0'}`,
        borderRadius: 14, padding: '20px 20px 16px',
        transition: 'background 140ms, border-color 140ms, box-shadow 140ms',
        boxShadow: hover ? '0 8px 24px -8px rgba(15,23,42,0.12)' : 'none',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 12,
        cursor: 'pointer',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={17} color="#059669" />
          </span>
          <div style={{ minWidth: 0 }}>
            <div style={{ ...disp, fontSize: 15.5, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 200 }}>
              {project.name || 'Untitled Project'}
            </div>
            <div style={{ ...body, fontSize: 11.5, color: '#64748B', marginTop: 2, display: 'flex', alignItems: 'center', gap: 5 }}>
              <Clock size={10} />
              {timeAgo(project.updatedAt)}
            </div>
          </div>
        </div>
        {/* Action buttons — always visible (not hover-only) so they're tappable
            on touch devices, and the delete is clearly marked in red. */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); onDuplicate(project.id); }}
            title="Duplicate"
            style={{ background: '#F1F5F9', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
          >
            <Copy size={14} />
          </button>
          {confirmDel
            ? <>
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); onDelete(project.id); }}
                  style={{ background: '#EF4444', border: '1px solid #EF4444', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 11.5, fontWeight: 600, ...body }}
                >Delete</button>
                <button
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setConfirmDel(false); }}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#64748B', fontSize: 11.5, ...body }}
                >Cancel</button>
              </>
            : <button
                onClick={e => { e.preventDefault(); e.stopPropagation(); setConfirmDel(true); }}
                title="Delete project"
                style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#EF4444', display: 'flex', alignItems: 'center' }}
              >
                <Trash2 size={14} />
              </button>
          }
        </div>
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {project.currencyKey && (
          <span style={{ ...body, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F0FDF4', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            {project.currencyKey}
          </span>
        )}
        {project.enabledStatements?.cashFlow && (
          <span style={{ ...body, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#EFF6FF', color: '#3B82F6', fontWeight: 500 }}>Cash Flow</span>
        )}
        {project.enabledStatements?.balance && (
          <span style={{ ...body, fontSize: 11, padding: '2px 8px', borderRadius: 20, background: '#F5F3FF', color: '#7C3AED', fontWeight: 500 }}>Balance Sheet</span>
        )}
      </div>

      {/* Open affordance — the whole card is clickable; this is the visual cue.
          Rendered as a span (not a link) to avoid a nested interactive element
          inside the clickable card. */}
      <span
        style={{ ...body, fontSize: 13, fontWeight: 600, color: '#10B981', display: 'flex', alignItems: 'center', gap: 5, marginTop: 'auto' }}
      >
        Open model <ChevronRight size={14} />
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '64px 24px' }}>
      <div style={{ width: 64, height: 64, borderRadius: 18, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
        <FileText size={26} color="#10B981" />
      </div>
      <div style={{ ...disp, fontSize: 20, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>No models yet</div>
      <div style={{ ...body, fontSize: 14, color: '#64748B', maxWidth: 320, margin: '0 auto 24px' }}>
        Create your first financial model: describe your business and AI builds it in under 60 seconds.
      </div>
      <Link
        to="/app?new=ai"
        style={{ ...body, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10B981', color: '#0F172A', textDecoration: 'none', padding: '11px 20px', borderRadius: 10, fontSize: 14, fontWeight: 700 }}
      >
        <Sparkles size={16} /> Create with AI
      </Link>
    </div>
  );
}

export default function Dashboard() {
  const navigate  = useNavigate();
  const user      = useAuth();
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [localCount, setLocalCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState('');
  const [subscription, setSubscription] = useState(null);
  const [showPricing, setShowPricing] = useState(false);

  useEffect(() => {
    // Redirect to auth if not signed in (and supabase is configured)
    if (supabase && user === null) {
      navigate('/auth', { replace: true });
      return;
    }
    if (user === undefined) return; // still loading auth

    loadProjects();
    checkLocalProjects();
    if (supabase) fetchSubscription().then(setSubscription).catch(() => {});
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

  const userEmail   = user?.email || '';

  return (
    <div className="koala-page" style={{ minHeight: '100vh', background: '#F8FAFC', ...body }}>

      {/* Top nav */}
      <div style={{ background: '#FFFFFF', boxShadow: '0 1px 2px rgba(15,23,42,0.08)', position: 'sticky', top: 0, zIndex: 40 }}>
        <div
          className="mx-auto flex items-center justify-between gap-3 px-4 py-3 sm:px-6"
          style={{ maxWidth: 1200 }}
        >
          <Link to="/" className="min-w-0 shrink overflow-hidden" style={{ textDecoration: 'none' }}>
            <span className="hidden sm:inline-flex"><Logo size={38} /></span>
            <span className="inline-flex sm:hidden"><Logo size={30} /></span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              to="/learn"
              aria-label="Learn"
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2"
              style={{ ...body, background: 'none', border: `1px solid ${C.border}`, cursor: 'pointer', fontSize: 13, color: C.ink2, textDecoration: 'none', transition: 'all 200ms ease' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = C.bgWarm; e.currentTarget.style.borderColor = C.borderSoft; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'none'; e.currentTarget.style.borderColor = C.border; }}
            >
              <GraduationCap size={14} /> <span className="hidden sm:inline">Learn</span>
            </Link>
            {supabase && user && !isPro(subscription) && (
              <button
                onClick={() => setShowPricing(true)}
                aria-label="Upgrade to Pro"
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2"
                style={{ ...body, background: '#0F172A', border: '1px solid #0F172A', cursor: 'pointer', fontSize: 13, fontWeight: 600, color: '#FFFFFF', transition: 'all 200ms ease', boxShadow: '0 1px 2px rgba(15,23,42,0.12)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#1E293B'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 16px -4px rgba(15,23,42,0.35)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#0F172A'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(15,23,42,0.12)'; }}
              >
                <Sparkles size={14} color="#10B981" /> <span className="hidden sm:inline">Upgrade to Pro</span>
              </button>
            )}
            <UserMenu
              onFeedbackClick={() => {
                setFeedbackOpen(true);
                requestAnimationFrame(() => {
                  const el = document.getElementById('feedback');
                  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                });
              }}
              onDeleteAccount={() => { setShowDeleteAccount(true); setDeleteConfirm(''); setDeleteError(''); }}
              canDelete={!!(supabase && user)}
            />
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 24px' }}>

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
          <div>
            <h1 style={{ ...disp, fontSize: 26, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.02em' }}>Your models</h1>
            <p style={{ ...body, fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>
              {loading ? 'Loading…' : `${projects.length} ${projects.length === 1 ? 'model' : 'models'}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Link
              to="/app?new=ai"
              style={{ ...body, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#10B981', color: '#0F172A', textDecoration: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 700, whiteSpace: 'nowrap' }}
            >
              <Sparkles size={15} /> New with AI
            </Link>
            <Link
              to="/app?new=manual"
              style={{ ...body, display: 'inline-flex', alignItems: 'center', gap: 8, background: '#0F172A', color: '#fff', textDecoration: 'none', padding: '10px 18px', borderRadius: 10, fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap' }}
            >
              <Plus size={15} /> New model
            </Link>
          </div>
        </div>

        {/* Import local banner */}
        {supabase && user && localCount > 0 && (
          <div style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 12, padding: '14px 18px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ ...body, fontSize: 14, fontWeight: 600, color: '#059669' }}>You have {localCount} model{localCount > 1 ? 's' : ''} saved in this browser</div>
              <div style={{ ...body, fontSize: 13, color: '#64748B', marginTop: 2 }}>Import them to your account so they're available on all your devices.</div>
            </div>
            <button
              onClick={handleImportLocal}
              disabled={importing}
              style={{ ...body, background: '#10B981', color: '#0F172A', border: 'none', borderRadius: 9, padding: '9px 16px', fontSize: 13, fontWeight: 700, cursor: importing ? 'default' : 'pointer', flexShrink: 0 }}
            >
              {importing ? 'Importing…' : 'Import to account'}
            </button>
          </div>
        )}

        {/* Projects grid */}
        {loading ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {[1, 2, 3].map(i => (
              <div key={i} style={{ background: '#F1F5F9', borderRadius: 14, height: 160, animation: 'pulse 1.5s ease-in-out infinite' }} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <EmptyState />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {projects.map(p => (
              <ProjectCard key={p.id} project={p} onDelete={handleDelete} onDuplicate={handleDuplicate} />
            ))}
          </div>
        )}

        {/* Feedback / contact — the last thing on the page, set well below the
            models grid. Collapsed to a slim bar by default so it doesn't
            dominate the dashboard; expands to the full form on click.
            Account deletion now lives in the avatar menu (top-right), so there's
            no separate danger-zone link beneath this. */}
        <div id="feedback" style={{ scrollMarginTop: 80, maxWidth: 560, margin: '80px auto 24px' }}>
          {!feedbackOpen ? (
            <button
              onClick={() => setFeedbackOpen(true)}
              style={{ ...body, width: '100%', display: 'flex', alignItems: 'center', gap: 10, background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12, padding: '12px 16px', cursor: 'pointer', textAlign: 'left' }}
            >
              <div style={{ width: 30, height: 30, borderRadius: 8, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare size={15} color="#059669" />
              </div>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: '#0F172A' }}>Contact &amp; feedback</span>
              <span style={{ fontSize: 12.5, color: '#64748B', marginLeft: 'auto' }}>Found a bug or have an idea? →</span>
            </button>
          ) : (
            <div style={{ background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '22px 22px', boxShadow: '0 8px 24px -16px rgba(15,23,42,0.15)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 9, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <MessageSquare size={16} color="#059669" />
                </div>
                <h2 style={{ ...disp, fontSize: 17, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>Contact &amp; feedback</h2>
                <button
                  onClick={() => setFeedbackOpen(false)}
                  aria-label="Close feedback"
                  style={{ ...body, marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#94A3B8' }}
                >
                  Close
                </button>
              </div>
              <ContactForm theme="light" source="dashboard" defaultEmail={userEmail} onSent={() => setFeedbackOpen(true)} />
            </div>
          )}
        </div>

      </div>

      {/* Delete-account confirmation modal */}
      {showDeleteAccount && (
        <div
          onClick={() => { if (!deletingAccount) setShowDeleteAccount(false); }}
          style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(15,23,42,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ background: '#FFFFFF', borderRadius: 16, width: 'min(440px, 100%)', padding: '26px 24px', boxShadow: '0 32px 64px -16px rgba(15,23,42,0.4)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEF2F2', border: '1px solid #FECACA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <AlertTriangle size={18} color="#EF4444" />
              </div>
              <h2 style={{ ...disp, fontSize: 19, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>Delete your account?</h2>
            </div>
            <p style={{ ...body, fontSize: 13.5, color: '#475569', lineHeight: 1.6, margin: '0 0 16px' }}>
              This permanently deletes your account and <strong>all of your saved models</strong>. This can’t be undone.
              Type <strong>DELETE</strong> below to confirm.
            </p>
            <input
              value={deleteConfirm}
              onChange={e => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              autoFocus
              disabled={deletingAccount}
              style={{ ...body, width: '100%', boxSizing: 'border-box', borderRadius: 10, background: '#FFFFFF', color: '#0F172A', fontSize: 14, padding: '11px 13px', border: '1px solid #E2E8F0', outline: 'none' }}
            />
            {deleteError && (
              <div style={{ ...body, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#DC2626', background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.33)', borderRadius: 9, padding: '9px 12px', marginTop: 12 }}>
                <AlertTriangle size={15} /> {deleteError}
              </div>
            )}
            <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
              <button
                onClick={() => setShowDeleteAccount(false)}
                disabled={deletingAccount}
                style={{ ...body, flex: 1, background: '#F1F5F9', color: '#334155', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: 14, fontWeight: 600, cursor: deletingAccount ? 'default' : 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={deletingAccount || deleteConfirm.trim().toUpperCase() !== 'DELETE'}
                style={{ ...body, flex: 1, background: (deletingAccount || deleteConfirm.trim().toUpperCase() !== 'DELETE') ? '#FCA5A5' : '#EF4444', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 16px', fontSize: 14, fontWeight: 700, cursor: (deletingAccount || deleteConfirm.trim().toUpperCase() !== 'DELETE') ? 'default' : 'pointer' }}
              >
                {deletingAccount ? 'Deleting…' : 'Delete account'}
              </button>
            </div>
          </div>
        </div>
      )}

      <PricingModal open={showPricing} onClose={() => setShowPricing(false)} reason="dashboard" />

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
