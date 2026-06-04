import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/ui/Button';
import { fetchProducts, fetchCategories, updateProductPlatformStatus } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';

// 'mrp' | 'labamu'
const SYNC_PLATFORM = 'mrp';
const SYNC_LABEL = SYNC_PLATFORM === 'labamu' ? 'Sync with Labamu' : 'Sync with MRP';

// ─── Availability Toggle ──────────────────────────────────────────────────────
function AvailabilityToggle({ value, onChange, disabled }) {
  const isOn = value === 'published';
  return (
    <div
      onClick={e => { e.stopPropagation(); if (!disabled) onChange(!isOn); }}
      style={{
        width: '44px', height: '24px', borderRadius: '999px',
        background: isOn ? '#006BFF' : '#D1D5DB',
        position: 'relative', cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background 0.2s', flexShrink: 0,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div style={{
        position: 'absolute', top: '3px',
        left: isOn ? 'calc(100% - 21px)' : '3px',
        width: '18px', height: '18px', borderRadius: '50%',
        background: '#FFFFFF', transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

// ─── Filter pill + popover (design system, multi-select) ─────────────────────
// Only one pill open at a time
let _openPillSetter = null;

function FilterPill({ label, options, selected = [], onToggle, onClearAll, showSearch = true, t }) {
  const [open, setOpen]   = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);
  const count = selected.length;
  const isActive = count > 0;
  const BLUE = '#006BFF';
  const GREY = '#A9A9A9';

  useEffect(() => {
    if (open) _openPillSetter = setOpen;
    return () => { if (_openPillSetter === setOpen) _openPillSetter = null; };
  }, [open]);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) { setOpen(false); setSearch(''); }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleOpen() {
    if (!open && _openPillSetter && _openPillSetter !== setOpen) _openPillSetter(false);
    setOpen(o => !o);
    setSearch('');
  }

  const filtered = showSearch
    ? options.filter(o => o.label.toLowerCase().includes(search.toLowerCase()))
    : options;

  const borderColor = isActive || open ? BLUE : GREY;
  const textColor   = isActive || open ? BLUE : GREY;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Pill trigger */}
      <button onClick={handleOpen} style={{
        display: 'inline-flex', alignItems: 'center', gap: '4px',
        border: `1px solid ${borderColor}`, borderRadius: '8px',
        padding: '6px 8px', background: '#FFFFFF',
        cursor: 'pointer', fontFamily: "'Lato', sans-serif",
        fontSize: '14px', color: textColor, lineHeight: '20px',
        transition: 'border-color 0.15s, color 0.15s',
      }}>
        {isActive && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '16px', height: '16px', borderRadius: '100px',
            background: BLUE, color: '#FFFFFF',
            fontSize: '10px', lineHeight: '16px', flexShrink: 0,
          }}>{count}</span>
        )}
        <span>{label}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path d="M1 1.5L6 6.5L11 1.5" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Popover panel */}
      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 9999,
          background: '#FFFFFF', border: '1px solid #D4D4D4', borderRadius: '12px',
          boxShadow: '4px 4px 12px 0px rgba(0,0,0,0.12)',
          width: '274px', padding: '20px 20px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", lineHeight: '20px' }}>
              {label}
            </span>
            {isActive && (
              <button onClick={() => { onClearAll(); setOpen(false); setSearch(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#D0021B', fontFamily: "'Lato', sans-serif", padding: 0, lineHeight: '18px' }}>
                {t('dashboard:catalog.filter.removeFilter', 'Hapus Filter')}
              </button>
            )}
          </div>

          {/* Search bar — optional */}
          {showSearch && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F4F4F4', borderRadius: '8px', padding: '6px 10px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A9A9A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder={t('dashboard:catalog.filter.searchPlaceholder', 'Cari')} autoFocus
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#282828', width: '100%', fontFamily: "'Lato', sans-serif" }}
              />
            </div>
          )}

          {/* Options — checkbox multi-select */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", padding: '8px 0' }}>
                {t('dashboard:catalog.filter.noResults', 'Tidak ada hasil ditemukan.')}
              </p>
            ) : filtered.map(opt => {
              const isSel = selected.includes(opt.id);
              return (
                <div key={opt.id} onClick={() => onToggle(opt.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}
                >
                  {/* Checkbox */}
                  <div style={{
                    width: '20px', height: '20px', borderRadius: '4px', flexShrink: 0,
                    border: isSel ? 'none' : '1.5px solid #A9A9A9',
                    background: isSel ? BLUE : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxSizing: 'border-box',
                  }}>
                    {isSel && (
                      <svg width="12" height="10" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <span style={{ fontSize: '16px', color: '#282828', fontFamily: "'Lato', sans-serif", lineHeight: '22px' }}>
                    {opt.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty state illustration (magnifying glass + document) ─────────────────
function EmptyIllustration() {
  return (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Document background */}
      <rect x="46" y="30" width="108" height="130" rx="8" fill="#F4F4F4" stroke="#E0E0E0" strokeWidth="1.5"/>
      {/* Document lines */}
      <rect x="62" y="57" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="73" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="89" width="76" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="105" width="50" height="8" rx="4" fill="#ECECEC"/>
      <rect x="62" y="121" width="62" height="8" rx="4" fill="#ECECEC"/>
      {/* Magnifying glass circle */}
      <circle cx="88" cy="108" r="38" fill="white" stroke="#D0D0D0" strokeWidth="3"/>
      <circle cx="88" cy="108" r="28" fill="#F9F9F9" stroke="#D0D0D0" strokeWidth="2"/>
      {/* Magnifying glass handle */}
      <line x1="110" y1="130" x2="130" y2="155" stroke="#C0C0C0" strokeWidth="6" strokeLinecap="round"/>
      {/* Small lines inside magnifier */}
      <rect x="76" y="101" width="24" height="4" rx="2" fill="#D4D4D4"/>
      <rect x="76" y="110" width="18" height="4" rx="2" fill="#D4D4D4"/>
    </svg>
  );
}

// ─── Table empty state cell (spans all columns) ───────────────────────────────
function TableEmptyCell({ colSpan, title, subtitle }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: 'none' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: '64px', paddingBottom: '72px', gap: '20px',
        }}>
          <EmptyIllustration />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '290px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.12px' }}>
              {title}
            </p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 400, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.08px' }}>
              {subtitle}
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Loading state cell ───────────────────────────────────────────────────────
function TableLoadingCell({ colSpan }) {
  return (
    <tr>
      <td colSpan={colSpan} style={{ padding: 0, borderBottom: 'none' }}>
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          paddingTop: '64px', paddingBottom: '72px', gap: '20px',
        }}>
          {/* Three animated blue dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '60px' }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: '14px', height: '14px', borderRadius: '50%', background: '#006BFF',
                animation: `loading-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center', width: '290px', textAlign: 'center' }}>
            <p style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.12px' }}>
              Loading Data
            </p>
            <p style={{ margin: 0, fontSize: '12px', fontWeight: 400, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.08px' }}>
              Please wait a moment
            </p>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─── Sort chevron (design system: single chevron, rotates for asc/desc) ───────
function SortIcon({ column, sortKey, sortDir }) {
  const active = sortKey === column;
  const isAsc = active && sortDir === 'asc';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      marginLeft: '4px', verticalAlign: 'middle', width: '17px', height: '17px', flexShrink: 0,
    }}>
      <svg
        width="10" height="6" viewBox="0 0 10 6" fill="none"
        style={{
          transition: 'transform 0.2s',
          transform: isAsc ? 'rotate(180deg)' : 'rotate(0deg)',
          color: active ? '#006BFF' : '#A9A9A9',
        }}
      >
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

// ─── Format helpers ───────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatSyncDate(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const mon = d.toLocaleDateString('en-GB', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  return `${day} ${mon} ${year} ${time}`;
}

function formatPrice(val) {
  if (val == null) return '-';
  const n = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  return `IDR ${n}`;
}

// ─── Pagination helpers ───────────────────────────────────────────────────────
function buildPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [];
  pages.push(1);
  if (current > 4) pages.push('…');
  for (let p = Math.max(2, current - 1); p <= Math.min(total - 1, current + 1); p++) pages.push(p);
  if (current < total - 3) pages.push('…');
  pages.push(total);
  return pages;
}

// ─── Table cell shared style ──────────────────────────────────────────────────
const TD = {
  padding: '16px 12px',
  borderBottom: '1px solid #D4D4D4',
  fontSize: '14px',
  color: '#282828',
  fontFamily: "'Lato', sans-serif",
};

// ─── Filter option lists ──────────────────────────────────────────────────────
const PLATFORM_OPTIONS = [
  { id: '',              label: 'All' },
  { id: 'published',     label: 'Published' },
  { id: 'not_published', label: 'Not Published' },
];
const SIZE_OPTIONS = [
  { id: '10', label: '10' },
  { id: '25', label: '25' },
  { id: '50', label: '50' },
];

const EMPTY_FILTERS = { platformStatuses: [], categoryIds: [], keyword: '' };

export default function CatalogProducts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [products, setProducts]           = useState([]);
  const [total, setTotal]                 = useState(0);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState(null);
  const [categoryOptions, setCategoryOptions] = useState([{ id: '', label: 'All Category' }]);
  const [filters, setFilters]             = useState(EMPTY_FILTERS);
  const [draftKeyword, setDraftKeyword]   = useState('');
  const keywordTimer                      = useRef(null);
  const [sortKey, setSortKey]             = useState('updated_at');
  const [sortDir, setSortDir]             = useState('desc');
  const [page, setPage]                   = useState(1);
  const [size, setSize]                   = useState(25);
  const [selectedIds, setSelectedIds]     = useState(new Set());
  const [allPagesSelected, setAllPagesSelected] = useState(false);
  const [bulkLoading, setBulkLoading]         = useState(false);
  const [showUnpublishModal, setShowUnpublishModal] = useState(false);
  // ── Sync state machine ──────────────────────────────────────────────────────
  const [syncState, setSyncState]   = useState('idle'); // 'idle'|'syncing'|'failed'|'success'
  const [syncProgress, setSyncProgress] = useState(0);
  const [syncedCount, setSyncedCount]   = useState(0);
  const syncAttemptsRef = useRef(0);
  const headerCheckboxRef                 = useRef(null);
  const [publishedTotal, setPublishedTotal] = useState(null);
  const [categoryMap, setCategoryMap]     = useState({});
  // Dummy initial timestamp — replaced on each sync
  const [lastSync, setLastSync]           = useState('2026-06-01T08:30:00.000Z');

  async function refreshPublishedTotal() {
    try {
      const d = await fetchProducts({ published: true, size: 1 });
      setPublishedTotal(d.meta?.total ?? 0);
    } catch { /* non-critical */ }
  }

  useEffect(() => { refreshPublishedTotal(); }, []);

  useEffect(() => {
    fetchCategories({ size: 100 })
      .then(data => {
        const cats = data.data || [];
        const map = {};
        cats.forEach(c => { map[c.id] = c.name; });
        setCategoryMap(map);
        setCategoryOptions([{ id: '', label: 'All Category' }, ...cats.map(c => ({ id: c.id, label: c.name }))]);
      })
      .catch(() => {});
  }, []);

  const allSelected  = products.length > 0 && products.every(p => selectedIds.has(p.id));
  const someSelected = products.some(p => selectedIds.has(p.id));

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  // Derive API params from multi-select filter arrays
  function platformParams(statuses) {
    if (statuses.length === 1) {
      if (statuses[0] === 'published')     return { published: true };
      if (statuses[0] === 'not_published') return { published: false };
    }
    return {}; // 0 or both selected → no filter
  }

  const loadProducts = useCallback(async () => {
    setSelectedIds(new Set());
    setAllPagesSelected(false);
    setShowUnpublishModal(false);
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        page, size,
        ...platformParams(filters.platformStatuses),
        categoryId: filters.categoryIds[0] || undefined,
        keyword: filters.keyword || undefined,
        sort: `${sortKey}:${sortDir}`,
      });
      setProducts(data.data || []);
      setTotal(data.meta?.total || 0);
    } catch (err) {
      setError(err.message || 'Failed to load products');
      setProducts([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, filters, sortKey, sortDir]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  function handleKeywordInput(e) {
    const val = e.target.value;
    setDraftKeyword(val);
    clearTimeout(keywordTimer.current);
    keywordTimer.current = setTimeout(() => {
      setFilters(prev => ({ ...prev, keyword: val }));
      setPage(1);
    }, 350);
  }

  function handleClearFilters() {
    setFilters(EMPTY_FILTERS);
    setDraftKeyword('');
    setPage(1);
  }

  function handleSort(column) {
    if (sortKey === column) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(column);
      setSortDir('asc');
    }
    setPage(1);
  }

  function handleSizeChange(val) {
    setSize(Number(val));
    setPage(1);
  }

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setAllPagesSelected(false);
    setShowUnpublishModal(false);
    setSelectedIds(allSelected ? new Set() : new Set(products.map(p => p.id)));
  }

  async function handleSelectAllPages() {
    try {
      const data = await fetchProducts({
        page: 1, size: total,
        ...platformParams(filters.platformStatuses),
        categoryId: filters.categoryIds[0] || undefined,
        keyword: filters.keyword || undefined,
      });
      setSelectedIds(new Set((data.data || []).map(p => p.id)));
      setAllPagesSelected(true);
    } catch {
      showSnackbar('Failed to select all products', 'error');
    }
  }

  async function handleToggleAvailability(productId, newValue) {
    const targetStatus = newValue ? 'published' : 'draft';
    try {
      await updateProductPlatformStatus(productId, targetStatus);
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, platform_status: targetStatus } : p));
      await refreshPublishedTotal();
    } catch {
      showSnackbar('Failed to update product status', 'error');
    }
  }

  async function handleBulkToggle(targetStatus) {
    if (bulkLoading || selectedIds.size === 0) return;
    setBulkLoading(true);
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map(id => updateProductPlatformStatus(id, targetStatus)));
      if (targetStatus === 'published') {
        showSnackbar(`${ids.length} product${ids.length > 1 ? 's' : ''} published`, 'green');
      } else {
        showSnackbar(`${ids.length} product${ids.length > 1 ? 's' : ''} unpublished`, 'grey');
      }
      setSelectedIds(new Set());
      await loadProducts();
      await refreshPublishedTotal();
    } catch {
      showSnackbar('Some products failed to update', 'error');
      await loadProducts();
      await refreshPublishedTotal();
    } finally {
      setBulkLoading(false);
    }
  }

  function handleSync() {
    if (syncState === 'syncing') return;
    setSyncState('syncing');
    setSyncProgress(0);

    // Animate progress 0 → 90 over ~2.5s
    let prog = 0;
    const iv = setInterval(() => {
      prog = Math.min(prog + Math.random() * 18 + 5, 90);
      setSyncProgress(Math.round(prog));
      if (prog >= 90) clearInterval(iv);
    }, 280);

    // After 3s: first attempt → fail, subsequent → success
    setTimeout(() => {
      clearInterval(iv);
      setSyncProgress(100);
      const attempt = syncAttemptsRef.current;
      syncAttemptsRef.current += 1;
      if (attempt === 0) {
        setSyncState('failed');
      } else {
        const count = Math.floor(Math.random() * 8) + 3;
        setSyncedCount(count);
        setSyncState('success');
        setLastSync(new Date().toISOString());
      }
    }, 3000);
  }

  const hasActiveFilters = filters.platformStatuses.length > 0 || filters.categoryIds.length > 0 || filters.keyword;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageList = buildPageList(page, totalPages);

  const TH = ({ children, column, extraStyle }) => (
    <th
      onClick={column ? () => handleSort(column) : undefined}
      style={{
        padding: '16px 12px',
        textAlign: 'left',
        fontSize: '14px',
        fontWeight: 700,
        color: '#282828',
        background: '#FFFFFF',
        borderBottom: '1px solid #D4D4D4',
        whiteSpace: 'nowrap',
        cursor: column ? 'pointer' : 'default',
        userSelect: 'none',
        fontFamily: "'Lato', sans-serif",
        ...extraStyle,
      }}
    >
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {children}
        {column && <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div style={{ background: '#F4F4F4', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @keyframes skeleton-pulse { 0%,100%{opacity:1;} 50%{opacity:0.45;} }
        @keyframes loading-dot { 0%,80%,100%{transform:scale(0.6);opacity:0.4;} 40%{transform:scale(1);opacity:1;} }
        @keyframes sync-progress { from{width:0%} }
      `}</style>

      {/* ── Sync banner — sticky just below topbar ─────────────────────────── */}
      {syncState !== 'idle' && (
        <div style={{
          position: 'sticky', top: 0, zIndex: 99,
          background: '#FFFFFF',
          borderTop: '1px solid #E9E9E9',
          borderBottom: syncState === 'failed' ? '1px solid #D0021B' : 'none',
        }}>
          {syncState === 'syncing' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px', position: 'relative' }}>
              <span style={{ fontSize: '12px', color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                Syncing with {SYNC_PLATFORM === 'labamu' ? 'Labamu' : 'MRP'}
              </span>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                {syncProgress}%
              </span>
              {/* Track */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#E9E9E9' }} />
              {/* Fill */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, height: '3px', background: '#006BFF', width: `${syncProgress}%`, transition: 'width 0.28s ease' }} />
            </div>
          )}

          {syncState === 'failed' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" fill="#D0021B"/>
                  <line x1="12" y1="9" x2="12" y2="13" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <line x1="12" y1="17" x2="12.01" y2="17" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span style={{ fontSize: '12px', color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                  Failed to sync with {SYNC_PLATFORM === 'labamu' ? 'Labamu' : 'MRP'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <button onClick={handleSync} style={{
                  height: '33px', padding: '0 12px', borderRadius: '8px',
                  border: '1px solid #006BFF', background: '#FFFFFF',
                  color: '#006BFF', fontSize: '14px', cursor: 'pointer',
                  fontFamily: "'Lato', sans-serif",
                }}>
                  Retry Sync
                </button>
                <button onClick={() => setSyncState('idle')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#282828' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>
          )}

          {syncState === 'success' && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 16px 12px', position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
                  <circle cx="12" cy="12" r="10" fill="#006BFF"/>
                  <path d="M8 12l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span style={{ fontSize: '12px', color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                  Successfully synced with {SYNC_PLATFORM === 'labamu' ? 'Labamu' : 'MRP'} ({syncedCount} new data)
                </span>
              </div>
              <button onClick={() => setSyncState('idle')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center', color: '#282828' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              {/* Full blue bar */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px', background: '#006BFF' }} />
            </div>
          )}
        </div>
      )}

      <div style={{ padding: '24px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828', letterSpacing: '0.18px' }}>
          {t('dashboard:catalog.title', 'Catalog')}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {lastSync && (
            <span style={{ fontSize: '14px', color: '#7E7E7E', whiteSpace: 'nowrap' }}>
              Last Sync {formatSyncDate(lastSync)}
            </span>
          )}
          <Button variant="secondary" onClick={handleSync}
            style={{ height: '33px', padding: '0 12px', fontSize: '14px', borderRadius: '8px' }}>
            {SYNC_LABEL}
          </Button>
          <Button variant="secondary" onClick={() => navigate('/catalog/manage-category')}
            style={{ height: '33px', padding: '0 12px', fontSize: '14px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            leftIcon={
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            }>
            Manage
          </Button>
        </div>
      </div>

      {/* Card — hugs content; table scrolls when rows exceed viewport */}
      <div style={{
        background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* Filter bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: '1px solid #D4D4D4', gap: '12px', flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FilterPill
              label={t('dashboard:catalog.columns.category', 'Category')}
              options={categoryOptions.filter(o => o.id !== '')}
              selected={filters.categoryIds}
              onToggle={id => {
                setFilters(prev => ({
                  ...prev,
                  categoryIds: prev.categoryIds.includes(id)
                    ? prev.categoryIds.filter(x => x !== id)
                    : [...prev.categoryIds, id],
                }));
                setPage(1);
              }}
              onClearAll={() => { setFilters(prev => ({ ...prev, categoryIds: [] })); setPage(1); }}
              showSearch
              t={t}
            />
            <FilterPill
              label={t('dashboard:catalog.columns.platformStatus', 'Availability')}
              options={PLATFORM_OPTIONS.filter(o => o.id !== '')}
              selected={filters.platformStatuses}
              onToggle={id => {
                setFilters(prev => ({
                  ...prev,
                  platformStatuses: prev.platformStatuses.includes(id)
                    ? prev.platformStatuses.filter(x => x !== id)
                    : [...prev.platformStatuses, id],
                }));
                setPage(1);
              }}
              onClearAll={() => { setFilters(prev => ({ ...prev, platformStatuses: [] })); setPage(1); }}
              showSearch={false}
              t={t}
            />
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: '14px', color: '#A9A9A9', padding: 0,
                  fontFamily: "'Lato', sans-serif",
                }}
              >
                {t('dashboard:catalog.filter.removeFilter', 'Hapus Filter')}
              </button>
            )}
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#F4F4F4', borderRadius: '8px',
            padding: '6px 10px', width: '240px', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A9A9A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={draftKeyword}
              onChange={handleKeywordInput}
              placeholder={t('dashboard:catalog.searchPlaceholder', 'Search products…')}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '14px', color: '#282828', width: '100%',
                fontFamily: "'Lato', sans-serif",
              }}
            />
          </div>
        </div>

        {/* No published products warning */}
        {publishedTotal === 0 && !isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A', flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <span style={{ fontSize: '13px', color: '#92400E' }}>
              No products are published. Customers visiting your store won't see any items.
            </span>
          </div>
        )}

        {/* Bulk action bar */}
        {selectedIds.size > 0 && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            padding: '10px 20px', background: '#EFF6FF', borderBottom: '1px solid #DBEAFE', flexShrink: 0,
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#282828' }}>
                {allPagesSelected
                  ? `All ${total} products selected`
                  : `${selectedIds.size} product${selectedIds.size > 1 ? 's' : ''} selected`}
              </span>
              {allSelected && !allPagesSelected && total > products.length && (
                <span style={{ fontSize: '13px', color: '#6B7280', marginLeft: '8px' }}>
                  {'— '}
                  <button
                    onClick={handleSelectAllPages}
                    disabled={bulkLoading}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2563EB', fontSize: '13px', fontWeight: 600, padding: 0, textDecoration: 'underline' }}
                  >
                    Select all {total} products
                  </button>
                </span>
              )}
            </div>
            <Button variant="danger-outline" size="small" disabled={bulkLoading} onClick={() => setShowUnpublishModal(true)}>
              Unpublish
            </Button>
            <Button variant="primary" size="small" disabled={bulkLoading} onClick={() => handleBulkToggle('published')}>
              Publish
            </Button>
          </div>
        )}

        {/* Unpublish confirmation modal — onboarding style */}
        {showUnpublishModal && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }} onClick={() => setShowUnpublishModal(false)}>
            <div style={{
              background: '#FFFFFF', borderRadius: '16px', padding: '20px',
              width: '329px', boxShadow: '0 8px 32px rgba(0,0,0,0.16)',
              fontFamily: "'Lato', sans-serif",
              display: 'flex', flexDirection: 'column', gap: '16px',
            }} onClick={e => e.stopPropagation()}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#282828', letterSpacing: '0.124px', textAlign: 'center' }}>
                Unpublish Products
              </h3>
              <p style={{ margin: 0, fontSize: '12px', fontWeight: 700, color: '#7E7E7E', lineHeight: '18px', letterSpacing: '0.083px', textAlign: 'center' }}>
                Hide {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} from your store? Customers won't be able to see or purchase them.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <button
                  disabled={bulkLoading}
                  onClick={() => { setShowUnpublishModal(false); handleBulkToggle('draft'); }}
                  style={{
                    height: '51px', borderRadius: '12px', border: 'none',
                    background: '#D0021B', color: '#FFFFFF',
                    fontSize: '16px', fontFamily: "'Lato', sans-serif",
                    cursor: bulkLoading ? 'not-allowed' : 'pointer',
                    opacity: bulkLoading ? 0.6 : 1,
                  }}
                >
                  Unpublish
                </button>
                <button
                  disabled={bulkLoading}
                  onClick={() => setShowUnpublishModal(false)}
                  style={{
                    height: '51px', borderRadius: '12px',
                    border: '1px solid #005DE0', background: '#FFFFFF',
                    color: '#005DE0', fontSize: '16px',
                    fontFamily: "'Lato', sans-serif",
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error state */}
        {error && !isLoading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>
              {t('dashboard:catalog.errorTitle', 'Failed to load products')}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{error}</p>
            <Button variant="secondary" size="small" onClick={loadProducts}>
              {t('dashboard:catalog.retry', 'Retry')}
            </Button>
          </div>
        )}

        {/* Table — scrollable when rows exceed available viewport space */}
        {!error && (
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 56px - 48px - 58px - 20px - 61px - 61px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th style={{ ...TD, padding: '16px 12px 16px 20px', width: '44px', fontWeight: 700, borderBottom: '1px solid #D4D4D4' }}>
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      disabled={isLoading || bulkLoading || products.length === 0}
                      style={{ accentColor: '#006BFF', width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                  </th>
                  <TH column="name">{t('dashboard:catalog.columns.name', 'Product Name')}</TH>
                  <TH>{t('dashboard:catalog.columns.sku', 'SKU')}</TH>
                  <TH>{t('dashboard:catalog.columns.category', 'Category')}</TH>
                  <TH column="price">{t('dashboard:catalog.columns.price', 'Price')}</TH>
                  <TH column="updated_at">{t('dashboard:catalog.columns.updatedAt', 'Last Updated')}</TH>
                  <TH extraStyle={{ textAlign: 'right' }}>{t('dashboard:catalog.columns.platformStatus', 'Availability')}</TH>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? <TableLoadingCell colSpan={7} />
                  : products.length === 0
                    ? hasActiveFilters
                      ? <TableEmptyCell colSpan={7}
                          title={t('dashboard:catalog.emptyFiltered', 'No Search Results Found')}
                          subtitle={t('dashboard:catalog.emptyFilteredSub', 'Try searching with a different term, okay?')} />
                      : <TableEmptyCell colSpan={7}
                          title={t('dashboard:catalog.emptyDefault', 'No Products Yet')}
                          subtitle={t('dashboard:catalog.emptyDefaultSub', 'Add your first product to get started')} />
                    : products.map(p => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/catalog/${p.id}`)}
                        style={{ cursor: 'pointer', transition: 'background 0.15s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td
                          style={{ ...TD, padding: '16px 12px 16px 20px', width: '44px' }}
                          onClick={e => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={selectedIds.has(p.id)}
                            onChange={() => toggleSelect(p.id)}
                            disabled={bulkLoading}
                            style={{ accentColor: '#006BFF', width: '15px', height: '15px', cursor: 'pointer' }}
                          />
                        </td>
                        <td style={{ ...TD, fontWeight: 700, maxWidth: '240px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                            {p.name}
                          </div>
                        </td>
                        <td style={TD}>{p.sku || '-'}</td>
                        <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                          {categoryMap[p.category_id] || p.category_id || '-'}
                        </td>
                        <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                          {formatPrice(p.price)}
                        </td>
                        <td style={{ ...TD, whiteSpace: 'nowrap' }}>
                          {formatDate(p.updated_at)}
                        </td>
                        <td style={{ ...TD, textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                            <AvailabilityToggle
                              value={p.platform_status}
                              disabled={bulkLoading}
                              onChange={val => handleToggleAvailability(p.id, val)}
                            />
                          </div>
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Footer — pinned to bottom */}
        {!error && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', height: '60px', borderTop: '1px solid #D4D4D4', gap: '12px',
          }}>
            {/* Left: rows selector + count */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <RowsSelector size={size} options={SIZE_OPTIONS} onChange={handleSizeChange} />
              <span style={{ fontSize: '14px', color: '#282828', opacity: 0.5, whiteSpace: 'nowrap' }}>
                {isLoading ? 'Loading…' : total === 0 ? 'No results' : `from ${total} rows`}
              </span>
            </div>
            {/* Right: page stepper */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <StepBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || isLoading} outlined>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </StepBtn>
              {pageList.map((item, i) =>
                item === '…'
                  ? <span key={`e${i}`} style={{ width: '30px', textAlign: 'center', fontSize: '14px', color: '#282828' }}>...</span>
                  : (
                    <StepBtn key={item} active={item === page} onClick={() => setPage(item)} disabled={isLoading}>
                      {item}
                    </StepBtn>
                  )
              )}
              <StepBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages || isLoading} outlined>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </StepBtn>
            </div>
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

// ─── Design-system page step button (30×30) ──────────────────────────────────
function StepBtn({ children, onClick, disabled, active, outlined }) {
  // Figma: disabled nav btn = #F4F4F4 bg, no border, grey icon
  //        enabled nav btn = white bg, #006BFF border
  //        active page     = #006BFF bg, white text
  const bg = active ? '#006BFF'
    : (outlined && disabled) ? '#F4F4F4'
    : (outlined && !disabled) ? '#FFFFFF'
    : 'transparent';
  const border = (outlined && !disabled) ? '1px solid #006BFF' : 'none';
  const color = active ? '#FFFFFF'
    : (outlined && disabled) ? '#A9A9A9'
    : (outlined && !disabled) ? '#006BFF'
    : '#282828';
  return (
    <button
      onClick={!disabled ? onClick : undefined}
      style={{
        width: '30px', height: '30px', border, borderRadius: '8px', background: bg, color,
        cursor: disabled ? 'default' : 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Lato', sans-serif", fontSize: '14px', fontWeight: 400,
        padding: 0, flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

// ─── Design-system rows-per-page selector ────────────────────────────────────
function RowsSelector({ size, options, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          height: '32px', padding: '0 12px',
          background: '#FFFFFF', border: '1px solid #006BFF', borderRadius: '8px',
          fontSize: '14px', color: '#006BFF', fontFamily: "'Lato', sans-serif",
          cursor: 'pointer',
        }}
      >
        {size}
        <svg width="12" height="7" viewBox="0 0 12 7" fill="none" style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>
          <path d="M1.2 1L6 5.8L10.8 1" stroke="#006BFF" strokeWidth="1.2"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', bottom: '36px', left: 0,
          background: '#FFFFFF', border: '1px solid #E5E7EB',
          borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          zIndex: 9999, overflow: 'hidden', minWidth: '80px',
        }}>
          {options.map(opt => (
            <div
              key={opt.id}
              onClick={() => { onChange(opt.id); setOpen(false); }}
              style={{
                padding: '8px 14px', fontSize: '14px',
                color: String(size) === opt.id ? '#006BFF' : '#282828',
                fontWeight: String(size) === opt.id ? 700 : 400,
                cursor: 'pointer', background: 'transparent',
                fontFamily: "'Lato', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
