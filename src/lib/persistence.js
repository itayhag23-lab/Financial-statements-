// Koala Statements — localStorage persistence.
// One index key + one key per project doc, so a single large model never
// blocks the whole store. All access is guarded for private-mode / quota.

const PREFIX = 'koala:v1';
const IDX_KEY = `${PREFIX}:projects`;
const LAST_KEY = `${PREFIX}:lastActive`;
const projKey = (id) => `${PREFIX}:project:${id}`;

function safeGet(k) {
  try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch { return null; }
}
function safeSet(k, v) {
  try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { return false; }
}
function safeDel(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } }

export function genId() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

// Returns project metadata records, newest first.
export function listProjects() {
  const idx = safeGet(IDX_KEY) || {};
  return Object.values(idx).sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
}

export function getLastActive() { return safeGet(LAST_KEY); }
export function setLastActive(id) { safeSet(LAST_KEY, id); }

export function loadProject(id) { return id ? safeGet(projKey(id)) : null; }

// doc = { meta:{name,sectorKey,regionKey,currencyKey,enabledStatements}, model, wizardAnswers }
export function saveProject(id, doc) {
  const idx = safeGet(IDX_KEY) || {};
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
  return meta;
}

export function deleteProject(id) {
  const idx = safeGet(IDX_KEY) || {};
  delete idx[id];
  safeSet(IDX_KEY, idx);
  safeDel(projKey(id));
  if (getLastActive() === id) safeDel(LAST_KEY);
}

// ── Share links (localStorage-based, same device) ──────────────────────────
const shareKey = (id) => `${PREFIX}:share:${id}`;

export function saveShare(id, doc) {
  try {
    localStorage.setItem(shareKey(id), JSON.stringify({ ...doc, sharedAt: Date.now() }));
    return true;
  } catch { return false; }
}

export function loadShare(id) { return id ? safeGet(shareKey(id)) : null; }

export function duplicateProject(id) {
  const doc = loadProject(id);
  if (!doc) return null;
  const newId = genId();
  saveProject(newId, {
    meta: { ...(doc.meta || {}), name: `${doc.meta?.name || 'Project'} (copy)` },
    model: doc.model,
    wizardAnswers: doc.wizardAnswers,
  });
  return newId;
}
