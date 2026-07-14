import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Download, Wallet, Scale, ArrowLeft, Check } from 'lucide-react';
import { C, FONTS } from '../brand/theme';
import { loadProject, saveProject, getLastActive, genId } from '../lib/persistence';
import { capture } from '../lib/analytics';
import { buildXlsx, STYLE } from '../lib/xlsx';
import {
  CURRENCIES, genLineId, makeDefaultPersonalModel, normalizePersonalModel,
  sumCategory, sumSection, personalTotals, fmtMoney,
} from '../lib/personalStatement';

const clone = (o) => (typeof structuredClone === 'function' ? structuredClone(o) : JSON.parse(JSON.stringify(o)));

// Read ?new / ?kind once at module scope of the render.
function readParam(name) {
  try { return new URLSearchParams(window.location.search || '').get(name); } catch { return null; }
}

export default function PersonalStatement({ projectId }) {
  const navigate = useNavigate();
  const isNewRef = useRef(!projectId && !!readParam('new'));
  const pidRef   = useRef(projectId || (isNewRef.current ? genId() : (getLastActive() || genId())));

  const [model, setModel]           = useState(() => makeDefaultPersonalModel());
  const [name, setName]             = useState('My Financial Statement');
  const [currencyKey, setCurrencyKey] = useState('usd');
  const [tab, setTab]               = useState('networth'); // 'networth' | 'cashflow'
  const [saveStatus, setSaveStatus] = useState('saved');    // 'saved' | 'saving'
  const [loaded, setLoaded]         = useState(false);

  // ── Load existing project (skip for a fresh ?new statement) ────────────────
  const didLoad = useRef(false);
  useEffect(() => {
    if (didLoad.current) return; didLoad.current = true;
    if (isNewRef.current) { setLoaded(true); capture('personal_statement_started'); return; }
    (async () => {
      const doc = await loadProject(pidRef.current);
      if (doc && doc.model && (doc.meta?.kind === 'personal' || doc.model.kind === 'personal')) {
        setModel(normalizePersonalModel(doc.model));
        if (doc.meta?.name) setName(doc.meta.name);
        if (doc.meta?.currencyKey) setCurrencyKey(doc.meta.currencyKey);
      }
      setLoaded(true);
    })();
  }, []);

  // ── Debounced autosave ─────────────────────────────────────────────────────
  const saveTimer = useRef(null);
  useEffect(() => {
    if (!loaded) return;
    setSaveStatus('saving');
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      // sectorKey:'personal' rides the existing projects.sector_key column so the
      // dashboard + dispatcher recognize a personal statement cross-device with
      // no schema migration. kind is the explicit local signal.
      await saveProject(pidRef.current, {
        meta: { name, kind: 'personal', sectorKey: 'personal', currencyKey },
        model,
      });
      setSaveStatus('saved');
    }, 700);
    return () => clearTimeout(saveTimer.current);
  }, [model, name, currencyKey, loaded]);

  const totals = useMemo(() => personalTotals(model), [model]);

  // ── Mutations ──────────────────────────────────────────────────────────────
  const mutate = useCallback((group, side, fn) => {
    setModel((m) => { const c = clone(m); c[group][side] = fn(c[group][side]); return c; });
  }, []);
  const setLineValue = useCallback((group, side, catId, lineId, value) => {
    const v = value === '' ? 0 : Math.max(-1e12, Math.min(1e12, Number(value) || 0));
    mutate(group, side, (cats) => cats.map((c) => c.id !== catId ? c
      : { ...c, lines: c.lines.map((l) => l.id !== lineId ? l : { ...l, value: v }) }));
  }, [mutate]);
  const setLineLabel = useCallback((group, side, catId, lineId, label) => {
    mutate(group, side, (cats) => cats.map((c) => c.id !== catId ? c
      : { ...c, lines: c.lines.map((l) => l.id !== lineId ? l : { ...l, label }) }));
  }, [mutate]);
  const addLine = useCallback((group, side, catId) => {
    mutate(group, side, (cats) => cats.map((c) => c.id !== catId ? c
      : { ...c, lines: [...c.lines, { id: genLineId(), label: '', value: 0 }] }));
  }, [mutate]);
  const deleteLine = useCallback((group, side, catId, lineId) => {
    mutate(group, side, (cats) => cats.map((c) => c.id !== catId ? c
      : { ...c, lines: c.lines.filter((l) => l.id !== lineId) }));
  }, [mutate]);

  // ── Excel export ───────────────────────────────────────────────────────────
  const exportExcel = useCallback(() => {
    const sym = CURRENCIES[currencyKey]?.symbol || '$';
    const sheet = (title, sections, footer) => {
      const out = [];
      out.push({ h: 24, cells: [{ t: 's', v: `${title} · ${name}`, s: STYLE.stmtHeader }, { t: 's', v: '', s: STYLE.stmtHeader }] });
      out.push({ cells: [{ t: 's', v: 'Line Item', s: STYLE.lineItemHeader }, { t: 's', v: `Amount (${sym})`, s: STYLE.periodHeader }] });
      for (const sec of sections) {
        out.push({ cells: [{ t: 's', v: sec.title, s: STYLE.parentLabel }, { t: 'n', v: Math.round(sec.total), s: STYLE.numParent }] });
        for (const cat of sec.cats) {
          for (const l of cat.lines) out.push({ cells: [{ t: 's', v: '   ' + (l.label || '—'), s: STYLE.leafLabel }, { t: 'n', v: Math.round(Number(l.value) || 0), s: STYLE.numLeaf }] });
        }
      }
      out.push({ cells: [{ t: 's', v: footer.label, s: STYLE.computedLabel }, { t: 'n', v: Math.round(footer.value), s: STYLE.numComputed }] });
      return { name: title, ncols: 2, rows: out, col0Width: 46, colWidth: 20 };
    };

    const nw = sheet('Net Worth', [
      { title: 'Total Assets',      total: totals.assets,      cats: model.netWorth.assets },
      { title: 'Total Liabilities', total: totals.liabilities, cats: model.netWorth.liabilities },
    ], { label: 'Net Worth', value: totals.netWorth });
    const cf = sheet('Cash Flow (Monthly)', [
      { title: 'Total Income',   total: totals.income,   cats: model.cashFlow.income },
      { title: 'Total Expenses', total: totals.expenses, cats: model.cashFlow.expenses },
    ], { label: 'Net Monthly Cash Flow', value: totals.netCashFlow });

    const bytes = buildXlsx({ sheets: [nw, cf] });
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (name.replace(/[^a-z0-9]/gi, '-') || 'personal-statement') + '-' + Date.now() + '.xlsx';
    a.click();
    URL.revokeObjectURL(url);
    capture('personal_statement_exported');
  }, [model, totals, name, currencyKey]);

  // ── UI pieces ──────────────────────────────────────────────────────────────
  const money = (v) => fmtMoney(v, currencyKey);
  const sym = CURRENCIES[currencyKey]?.symbol || '$';

  const LineRow = ({ group, side, catId, line }) => (
    <div className="ps-line" style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 0' }}>
      <input
        value={line.label}
        placeholder="Describe this line…"
        onChange={(e) => setLineLabel(group, side, catId, line.id, e.target.value)}
        style={{ flex: 1, border: 'none', background: 'transparent', fontFamily: FONTS.body, fontSize: 13.5, color: C.ink2, padding: '6px 4px', outline: 'none', minWidth: 0 }}
      />
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, background: C.surfaceAlt, border: `1px solid ${C.border}`, borderRadius: 8, padding: '0 8px' }}>
        <span style={{ color: C.faint, fontSize: 12.5, fontFamily: FONTS.num }}>{sym}</span>
        <input
          type="number"
          value={line.value === 0 ? '' : line.value}
          placeholder="0"
          onChange={(e) => setLineValue(group, side, catId, line.id, e.target.value)}
          style={{ width: 96, border: 'none', background: 'transparent', textAlign: 'right', fontFamily: FONTS.num, fontVariantNumeric: 'tabular-nums', fontSize: 13.5, color: C.ink, padding: '7px 2px', outline: 'none' }}
        />
      </div>
      <button
        onClick={() => deleteLine(group, side, catId, line.id)}
        title="Remove line"
        style={{ border: 'none', background: 'transparent', color: C.faint, cursor: 'pointer', padding: 4, borderRadius: 6, display: 'flex', lineHeight: 0 }}
        onMouseEnter={(e) => { e.currentTarget.style.color = C.rust; }}
        onMouseLeave={(e) => { e.currentTarget.style.color = C.faint; }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );

  const Category = ({ group, side, cat }) => (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 4 }}>
        <div className="label-eyebrow" style={{ fontFamily: FONTS.body, letterSpacing: '0.14em', textTransform: 'uppercase', fontSize: 10.5, fontWeight: 600, color: C.muted }}>{cat.label}</div>
        <div style={{ fontFamily: FONTS.num, fontVariantNumeric: 'tabular-nums', fontSize: 12.5, color: C.faint }}>{money(sumCategory(cat))}</div>
      </div>
      {cat.lines.map((l) => <LineRow key={l.id} group={group} side={side} catId={cat.id} line={l} />)}
      <button
        onClick={() => addLine(group, side, cat.id)}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6, border: 'none', background: 'transparent', color: C.green, cursor: 'pointer', fontFamily: FONTS.body, fontSize: 12.5, fontWeight: 500, padding: '3px 4px' }}
      >
        <Plus size={13} /> Add line
      </button>
    </div>
  );

  const Section = ({ title, group, side, total, accent }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '18px 20px', flex: 1, minWidth: 280 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ fontFamily: FONTS.display, fontWeight: 700, fontSize: 16, color: C.ink }}>{title}</div>
        <div style={{ fontFamily: FONTS.num, fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 16, color: accent }}>{money(total)}</div>
      </div>
      {model[group][side].map((cat) => <Category key={cat.id} group={group} side={side} cat={cat} />)}
    </div>
  );

  const SummaryCard = ({ label, display, accent, sub }) => (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: '16px 20px', flex: 1, minWidth: 200 }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 11.5, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: C.muted, marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: FONTS.num, fontVariantNumeric: 'tabular-nums', fontWeight: 700, fontSize: 26, color: accent, letterSpacing: '-0.02em' }}>{display}</div>
      {sub && <div style={{ fontFamily: FONTS.body, fontSize: 12, color: C.faint, marginTop: 4 }}>{sub}</div>}
    </div>
  );

  const TabBtn = ({ id, icon: Icon, label }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 8, padding: '9px 18px', borderRadius: 10, cursor: 'pointer',
        fontFamily: FONTS.body, fontSize: 13.5, fontWeight: 600,
        border: `1px solid ${tab === id ? C.ink : C.border}`,
        background: tab === id ? C.ink : C.surface,
        color: tab === id ? C.surface : C.ink2,
      }}
    >
      <Icon size={15} /> {label}
    </button>
  );

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: FONTS.body }}>
      <style>{`.ps-line .lucide-trash-2{opacity:0;transition:opacity 120ms;} .ps-line:hover .lucide-trash-2{opacity:1;}
        input[type=number]::-webkit-outer-spin-button,input[type=number]::-webkit-inner-spin-button{-webkit-appearance:none;margin:0;}
        input[type=number]{-moz-appearance:textfield;}`}</style>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '28px 20px 80px' }}>
        {/* Masthead */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/dashboard')} title="Back to dashboard"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, borderRadius: 9, padding: '8px 12px', cursor: 'pointer', fontFamily: FONTS.body, fontSize: 13 }}>
            <ArrowLeft size={15} /> Dashboard
          </button>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ flex: 1, minWidth: 200, border: 'none', background: 'transparent', fontFamily: FONTS.display, fontWeight: 700, fontSize: 22, color: C.ink, outline: 'none', letterSpacing: '-0.02em' }}
          />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <select value={currencyKey} onChange={(e) => setCurrencyKey(e.target.value)}
              style={{ border: `1px solid ${C.border}`, background: C.surface, color: C.ink2, borderRadius: 9, padding: '8px 10px', fontFamily: FONTS.body, fontSize: 13, cursor: 'pointer' }}>
              {Object.entries(CURRENCIES).map(([k, c]) => <option key={k} value={k}>{c.symbol} {c.label}</option>)}
            </select>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontFamily: FONTS.body, fontSize: 12, color: saveStatus === 'saved' ? C.green : C.faint }}>
              {saveStatus === 'saved' ? <><Check size={13} /> Saved</> : 'Saving…'}
            </span>
            <button onClick={exportExcel}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: 'none', background: C.ink, color: C.surface, borderRadius: 9, padding: '9px 15px', cursor: 'pointer', fontFamily: FONTS.body, fontSize: 13, fontWeight: 600 }}>
              <Download size={15} /> Excel
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 22 }}>
          <SummaryCard label="Net Worth" display={money(totals.netWorth)} accent={totals.netWorth >= 0 ? C.green : C.rust}
            sub={`${money(totals.assets)} assets · ${money(totals.liabilities)} debts`} />
          <SummaryCard label="Net Monthly Cash Flow" display={money(totals.netCashFlow)} accent={totals.netCashFlow >= 0 ? C.green : C.rust}
            sub={`${money(totals.annualCashFlow)} / year`} />
          <SummaryCard label="Savings Rate" display={`${Math.round(totals.savingsRate * 100)}%`} accent={totals.savingsRate >= 0 ? C.ink : C.rust}
            sub={'of take-home income'} />
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 18 }}>
          <TabBtn id="networth" icon={Scale} label="Net Worth" />
          <TabBtn id="cashflow" icon={Wallet} label="Monthly Cash Flow" />
        </div>

        {/* Statement body */}
        {tab === 'networth' ? (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Section title="Assets" group="netWorth" side="assets" total={totals.assets} accent={C.green} />
              <Section title="Liabilities" group="netWorth" side="liabilities" total={totals.liabilities} accent={C.rust} />
            </div>
            <TotalBanner label="Net Worth = Assets − Liabilities" value={money(totals.netWorth)} positive={totals.netWorth >= 0} />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <Section title="Income" group="cashFlow" side="income" total={totals.income} accent={C.green} />
              <Section title="Expenses" group="cashFlow" side="expenses" total={totals.expenses} accent={C.rust} />
            </div>
            <TotalBanner label="Net Monthly Cash Flow = Income − Expenses" value={money(totals.netCashFlow)} positive={totals.netCashFlow >= 0} />
          </>
        )}
      </div>
    </div>
  );
}

function TotalBanner({ label, value, positive }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginTop: 16, background: positive ? C.greenSoft : C.rustSoft, border: `1px solid ${positive ? 'rgba(4,120,87,0.25)' : 'rgba(220,38,38,0.25)'}`, borderRadius: 14, padding: '16px 22px' }}>
      <div style={{ fontFamily: FONTS.body, fontSize: 14, fontWeight: 600, color: C.ink2 }}>{label}</div>
      <div style={{ fontFamily: FONTS.num, fontVariantNumeric: 'tabular-nums', fontWeight: 800, fontSize: 24, color: positive ? C.green : C.rust, letterSpacing: '-0.02em' }}>{value}</div>
    </div>
  );
}
