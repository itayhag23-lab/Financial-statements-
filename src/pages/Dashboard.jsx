import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus, Trash2, Copy, ExternalLink, Clock, TrendingUp,
  LogOut, User, ChevronRight, FileText, Sparkles, MessageSquare,
} from 'lucide-react';
import { FONTS, C } from '../brand/theme';
import { Logo } from '../brand/Logo';
import { listProjects, deleteProject, duplicateProject, genId, saveProject } from '../lib/persistence';
import { useAuth, signOut } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import ContactForm from '../components/ContactForm';

const body = { fontFamily: FONTS.body };
const disp = { fontFamily: FONTS.display };

const SECTOR_EMOJI = {
  saas:'💻', ecommerce:'🛒', restaurant:'🍽️', retail:'🏪', coffee:'☕',
  healthcare:'🏥', fintech:'💳', realEstate:'🏠', manufacturing:'🏭',
  consulting:'💼', education:'📚', media:'🎬', logistics:'🚛', other:'📊',
};

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
  const [hover, setHover] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => { setHover(false); setConfirmDel(false); }}
      style={{
        background: hover ? '#F8FAFC' : '#FFFFFF',
        border: `1px solid ${hover ? C.borderSoft : '#E2E8F0'}`,
        borderRadius: 14, padding: '20px 20px 16px',
        transition: 'background 140ms, border-color 140ms, box-shadow 140ms',
        boxShadow: hover ? '0 8px 24px -8px rgba(15,23,42,0.12)' : 'none',
        position: 'relative', display: 'flex', flexDirection: 'column', gap: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          <span style={{ fontSize: 26, lineHeight: 1, flexShrink: 0 }}>
            {SECTOR_EMOJI[project.sectorKey] || '📊'}
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
            onClick={e => { e.preventDefault(); onDuplicate(project.id); }}
            title="Duplicate"
            style={{ background: '#F1F5F9', border: 'none', borderRadius: 7, padding: '6px 8px', cursor: 'pointer', color: '#64748B', display: 'flex', alignItems: 'center' }}
          >
            <Copy size={14} />
          </button>
          {confirmDel
            ? <>
                <button
                  onClick={e => { e.preventDefault(); onDelete(project.id); }}
                  style={{ background: '#EF4444', border: '1px solid #EF4444', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#fff', fontSize: 11.5, fontWeight: 600, ...body }}
                >Delete</button>
                <button
                  onClick={e => { e.preventDefault(); setConfirmDel(false); }}
                  style={{ background: '#F1F5F9', border: 'none', borderRadius: 7, padding: '6px 10px', cursor: 'pointer', color: '#64748B', fontSize: 11.5, ...body }}
                >Cancel</button>
              </>
            : <button
                onClick={e => { e.preventDefault(); setConfirmDel(true); }}
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

      {/* Open link */}
      <Link
        to={`/app/${project.id}`}
        style={{ ...body, fontSize: 13, fontWeight: 600, color: '#10B981', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 5, marginTop: 'auto' }}
      >
        Open model <ChevronRight size={14} />
      </Link>
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
        Create your first financial model — describe your business and AI builds it in under 60 seconds.
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

  const userInitial = user?.email?.[0]?.toUpperCase() || '?';
  const userEmail   = user?.email || '';

  return (
    <div className="koala-page" style={{ minHeight: '100vh', background: '#F8FAFC', ...body }}>

      {/* Top nav — the brand can shrink/truncate and the action buttons collapse
          to icon-only on phones, so the row can never overflow and overlap the
          avatar (the bug this layout previously had on narrow viewports). */}
      <div style={{ background: '#FFFFFF', borderBottom: '1px solid #E2E8F0', position: 'sticky', top: 0, zIndex: 40 }}>
        <div
          className="mx-auto flex items-center justify-between gap-3 px-4 py-2.5 sm:px-6"
          style={{ maxWidth: 1200 }}
        >
          <Link to="/" className="min-w-0 shrink overflow-hidden" style={{ textDecoration: 'none' }}>
            <span className="hidden sm:inline-flex"><Logo size={26} /></span>
            <span className="inline-flex sm:hidden"><Logo size={22} /></span>
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* User badge — email only appears once there's room for it */}
            <div className="flex items-center gap-2">
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span style={{ ...body, fontSize: 13, fontWeight: 700, color: '#059669' }}>{userInitial}</span>
              </div>
              <span className="hidden min-w-0 truncate md:block" style={{ ...body, fontSize: 13, color: '#334155', maxWidth: 200 }}>{userEmail}</span>
            </div>
            <button
              onClick={() => {
                const el = document.getElementById('feedback');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              aria-label="Feedback"
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 sm:px-3"
              style={{ ...body, background: 'none', border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: 13, color: '#64748B' }}
            >
              <MessageSquare size={14} /> <span className="hidden sm:inline">Feedback</span>
            </button>
            <button
              onClick={async () => { await signOut(); navigate('/auth', { replace: true }); }}
              aria-label="Sign out"
              className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 sm:px-3"
              style={{ ...body, background: 'none', border: '1px solid #E2E8F0', cursor: 'pointer', fontSize: 13, color: '#64748B' }}
            >
              <LogOut size={14} /> <span className="hidden sm:inline">Sign out</span>
            </button>
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

        {/* Feedback / contact */}
        <div id="feedback" style={{ marginTop: 48, scrollMarginTop: 80 }}>
          <div style={{ maxWidth: 560, margin: '0 auto', background: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 16, padding: '28px 26px', boxShadow: '0 8px 24px -16px rgba(15,23,42,0.15)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.22)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <MessageSquare size={17} color="#059669" />
              </div>
              <h2 style={{ ...disp, fontSize: 20, fontWeight: 700, color: '#0F172A', margin: 0, letterSpacing: '-0.01em' }}>Contact &amp; feedback</h2>
            </div>
            <p style={{ ...body, fontSize: 13.5, color: '#64748B', margin: '4px 0 18px' }}>
              Found a bug or have an idea? We’d love to hear from you — we usually reply within a day.
            </p>
            <ContactForm theme="light" source="dashboard" defaultEmail={userEmail} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
      `}</style>
    </div>
  );
}
