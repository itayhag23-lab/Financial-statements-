// Koala Statements — persistence layer.
// localStorage is always used as the fast cache / offline layer.
// When Supabase is configured and the user is signed in, everything is
// also synced to the cloud so models survive browser clears and work
// across devices. Share links become truly cross-device when Supabase
// is active.

import { supabase } from './supabase';

const PREFIX   = 'koala:v1';
const IDX_KEY  = `${PREFIX}:projects`;
const LAST_KEY = `${PREFIX}:lastActive`;
const TOUR_KEY = `${PREFIX}:tourSeen`;
const STMT_KEY = `${PREFIX}:statements101Seen`;
const projKey  = (id) => `${PREFIX}:project:${id}`;
const shareKey = (id) => `${PREFIX}:share:${id}`;

function safeGet(k) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
}
function safeSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
}
function safeDel(k) { try { localStorage.removeItem(k); } catch {} }

export function genId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  // Fallback for environments without Web Crypto — not security-sensitive, extremely rare today.
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export function getLastActive() { return safeGet(LAST_KEY); }
export function setLastActive(id) { safeSet(LAST_KEY, id); }

// First-run product tour: a single per-browser flag so the guided walkthrough
// shows once and can still be replayed on demand via the "Take a tour" button.
export function hasSeenTour() { return safeGet(TOUR_KEY) === true; }
export function markTourSeen() { safeSet(TOUR_KEY, true); }

// "Statements 101" macro primer — shown once before the mechanics tour.
export function hasSeenStatements101() { return safeGet(STMT_KEY) === true; }
export function markStatements101Seen() { safeSet(STMT_KEY, true); }

async function getSession() {
  if (!supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch { return null; }
}

// ── Projects ─────────────────────────────────────────────────────────────────

export async function saveProject(id, doc) {
  // 1. Write to localStorage first (instant, offline-safe)
  const idx  = safeGet(IDX_KEY) || {};
  const prev = idx[id] || {};
  const meta = {
    ...(doc.meta || {}),
    id,
    createdAt: prev.createdAt || Date.now(),
    updatedAt: Date.now(),
  };
  idx[id] = meta;
  safeSet(IDX_KEY, idx);
  safeSet(projKey(id), { version: 1, meta, model: doc.model, wizardAnswers: doc.wizardAnswers || null });
  setLastActive(id);

  // 2. Sync to Supabase when logged in
  const session = await getSession();
  if (session?.user) {
    try {
      await supabase.from('projects').upsert({
        id,
        user_id:            session.user.id,
        name:               doc.meta?.name || 'Untitled',
        sector_key:         doc.meta?.sectorKey || null,
        region_key:         doc.meta?.regionKey || null,
        currency_key:       doc.meta?.currencyKey || 'usd',
        model_json:         doc.model || {},
        wizard_answers:     doc.wizardAnswers || null,
        enabled_statements: doc.meta?.enabledStatements || null,
        updated_at:         new Date().toISOString(),
      });
    } catch (e) {
      console.warn('[koala] cloud save failed, localStorage only:', e.message);
    }
  }

  return meta;
}

export async function loadProject(id) {
  if (!id) return null;

  // Try cloud first — may have fresher data from another device
  const session = await getSession();
  if (session?.user) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .eq('user_id', session.user.id)
        .single();
      if (!error && data) {
        const doc = {
          version: 1,
          meta: {
            id,
            name:               data.name,
            sectorKey:          data.sector_key,
            regionKey:          data.region_key,
            currencyKey:        data.currency_key,
            enabledStatements:  data.enabled_statements,
            createdAt:          new Date(data.created_at).getTime(),
            updatedAt:          new Date(data.updated_at).getTime(),
          },
          model:        data.model_json,
          wizardAnswers: data.wizard_answers,
        };
        safeSet(projKey(id), doc); // refresh local cache
        return doc;
      }
    } catch (e) {
      console.warn('[koala] cloud load failed, using local cache:', e.message);
    }
  }

  return safeGet(projKey(id));
}

export async function listProjects() {
  const session = await getSession();
  if (session?.user) {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('id, name, sector_key, region_key, currency_key, enabled_statements, created_at, updated_at')
        .eq('user_id', session.user.id)
        .order('updated_at', { ascending: false });
      if (!error && data) {
        return data.map(p => ({
          id:                 p.id,
          name:               p.name,
          sectorKey:          p.sector_key,
          regionKey:          p.region_key,
          currencyKey:        p.currency_key,
          enabledStatements:  p.enabled_statements,
          createdAt:          new Date(p.created_at).getTime(),
          updatedAt:          new Date(p.updated_at).getTime(),
        }));
      }
    } catch (e) {
      console.warn('[koala] cloud list failed, using local index:', e.message);
    }
  }

  const idx = safeGet(IDX_KEY) || {};
  return Object.values(idx).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export async function deleteProject(id) {
  const idx = safeGet(IDX_KEY) || {};
  delete idx[id];
  safeSet(IDX_KEY, idx);
  safeDel(projKey(id));
  if (getLastActive() === id) safeDel(LAST_KEY);

  const session = await getSession();
  if (session?.user) {
    try {
      await supabase.from('projects').delete().eq('id', id).eq('user_id', session.user.id);
    } catch (e) {
      console.warn('[koala] cloud delete failed:', e.message);
    }
  }
}

export async function duplicateProject(id) {
  const doc = await loadProject(id);
  if (!doc) return null;
  const newId = genId();
  await saveProject(newId, {
    meta: { ...(doc.meta || {}), name: `${doc.meta?.name || 'Project'} (copy)` },
    model: doc.model,
    wizardAnswers: doc.wizardAnswers,
  });
  return newId;
}

// ── Share links ───────────────────────────────────────────────────────────────

export async function saveShare(id, doc) {
  const payload = { ...doc, sharedAt: Date.now() };
  try { localStorage.setItem(shareKey(id), JSON.stringify(payload)); } catch {}

  const session = await getSession();
  try {
    await supabase?.from('shares').upsert({
      id,
      user_id:       session?.user?.id || null,
      snapshot_json: doc.snapshot || {},
      meta_json:     doc.meta || {},
      model_json:    doc.model || null,
      wizard_answers: doc.wizardAnswers || null,
    });
  } catch (e) {
    console.warn('[koala] cloud share save failed, localStorage only:', e.message);
  }

  return true;
}

export async function loadShare(id) {
  if (!id) return null;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('shares')
        .select('*')
        .eq('id', id)
        .gt('expires_at', new Date().toISOString())
        .single();
      if (!error && data) {
        return {
          meta:         data.meta_json || {},
          model:        data.model_json || null,
          wizardAnswers: data.wizard_answers || null,
          snapshot:     data.snapshot_json || {},
          sharedAt:     new Date(data.created_at).getTime(),
        };
      }
    } catch (e) {
      console.warn('[koala] cloud share load failed, trying localStorage:', e.message);
    }
  }

  return safeGet(shareKey(id));
}
