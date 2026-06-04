import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchCategories, fetchProducts } from '../services/catalogService';

// ─── Status badge — Solid variant (design system) ────────────────────────────
const STATUS_BADGE = {
  ACTIVE:   { bg: '#54A73F', label: 'Active' },
  INACTIVE: { bg: '#A9A9A9', label: 'Inactive' },
};

function Badge({ value }) {
  const cfg = STATUS_BADGE[value] || { bg: '#A9A9A9', label: value };
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      background: cfg.bg, color: '#FFFFFF',
      borderRadius: '4px', padding: '2px 8px',
      fontSize: '14px', fontWeight: 400, whiteSpace: 'nowrap',
      fontFamily: "'Lato', sans-serif", lineHeight: '20px',
      letterSpacing: '0.096px',
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Filter pill (inline, matches catalog page) ───────────────────────────────
let _openPillSetter = null;

function FilterPill({ label, options, selected = [], onToggle, onClearAll, showSearch = true, t }) {
  const [open, setOpen]     = useState(false);
  const [search, setSearch] = useState('');
  const ref    = useRef(null);
  const count  = selected.length;
  const isActive = count > 0;
  const BLUE = '#006BFF', GREY = '#A9A9A9';

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
            background: BLUE, color: '#FFFFFF', fontSize: '10px', lineHeight: '16px', flexShrink: 0,
          }}>{count}</span>
        )}
        <span>{label}</span>
        <svg width="12" height="8" viewBox="0 0 12 8" fill="none"
          style={{ transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', flexShrink: 0 }}>
          <path d="M1 1.5L6 6.5L11 1.5" stroke={textColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 9999,
          background: '#FFFFFF', border: '1px solid #D4D4D4', borderRadius: '12px',
          boxShadow: '4px 4px 12px 0px rgba(0,0,0,0.12)',
          width: '274px', padding: '20px 20px 16px 20px',
          display: 'flex', flexDirection: 'column', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif" }}>
              {label}
            </span>
            {isActive && (
              <button onClick={() => { onClearAll(); setOpen(false); setSearch(''); }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', color: '#D0021B', fontFamily: "'Lato', sans-serif", padding: 0 }}>
                {t('dashboard:catalog.filter.removeFilter', 'Hapus Filter')}
              </button>
            )}
          </div>

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

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filtered.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", padding: '8px 0' }}>
                {t('dashboard:catalog.filter.noResults', 'Tidak ada hasil ditemukan.')}
              </p>
            ) : filtered.map(opt => {
              const isSel = selected.includes(opt.id);
              return (
                <div key={opt.id} onClick={() => onToggle(opt.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 0', cursor: 'pointer' }}>
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

// ─── Sort chevron ─────────────────────────────────────────────────────────────
function SortIcon({ column, sortKey, sortDir }) {
  const active = sortKey === column;
  const isAsc  = active && sortDir === 'asc';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginLeft: '4px', width: '17px', height: '17px', flexShrink: 0 }}>
      <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
        style={{ transition: 'transform 0.2s', transform: isAsc ? 'rotate(180deg)' : 'none', color: active ? '#006BFF' : '#A9A9A9' }}>
        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </span>
  );
}

// ─── Format date ──────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return '-';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
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

// ─── Design-system page step button (30×30) ──────────────────────────────────
function StepBtn({ children, onClick, disabled, active, outlined }) {
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
    <button onClick={!disabled ? onClick : undefined} style={{
      width: '30px', height: '30px', border, borderRadius: '8px', background: bg, color,
      cursor: disabled ? 'default' : 'pointer',
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Lato', sans-serif", fontSize: '14px', fontWeight: 400,
      padding: 0, flexShrink: 0,
    }}>{children}</button>
  );
}

// ─── Rows-per-page selector ───────────────────────────────────────────────────
const SIZE_OPTIONS = [
  { id: '10', label: '10' },
  { id: '25', label: '25' },
  { id: '50', label: '50' },
];

function RowsSelector({ size, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        height: '32px', padding: '0 12px',
        background: '#FFFFFF', border: '1px solid #006BFF', borderRadius: '8px',
        fontSize: '14px', color: '#006BFF', fontFamily: "'Lato', sans-serif", cursor: 'pointer',
      }}>
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
          {SIZE_OPTIONS.map(opt => (
            <div key={opt.id} onClick={() => { onChange(opt.id); setOpen(false); }}
              style={{
                padding: '8px 14px', fontSize: '14px',
                color: String(size) === opt.id ? '#006BFF' : '#282828',
                fontWeight: String(size) === opt.id ? 700 : 400,
                cursor: 'pointer', background: 'transparent',
                fontFamily: "'Lato', sans-serif",
              }}
              onMouseEnter={e => e.currentTarget.style.background = '#F4F4F4'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >{opt.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Table cell shared style ──────────────────────────────────────────────────
const TD = {
  padding: '16px 12px',
  borderBottom: '1px solid #D4D4D4',
  fontSize: '14px',
  color: '#282828',
  fontFamily: "'Lato', sans-serif",
};

// ─── Filter options ───────────────────────────────────────────────────────────
const STATUS_FILTER_OPTIONS = [
  { id: 'ACTIVE',   label: 'Active' },
  { id: 'INACTIVE', label: 'Inactive' },
];

const EMPTY_FILTERS = { statuses: [], keyword: '' };

export default function CatalogCategories() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [categories, setCategories]   = useState([]);
  const [total, setTotal]             = useState(0);
  const [isLoading, setIsLoading]     = useState(true);
  const [error, setError]             = useState(null);
  const [productCounts, setProductCounts] = useState({});
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [draftKeyword, setDraftKeyword] = useState('');
  const keywordTimer                  = useRef(null);
  const [sortKey, setSortKey]         = useState('updated_at');
  const [sortDir, setSortDir]         = useState('desc');
  const [page, setPage]               = useState(1);
  const [size, setSize]               = useState(10);

  useEffect(() => {
    fetchProducts({ size: 100 }).then(res => {
      const counts = {};
      (res.data || []).forEach(p => { counts[p.category_id] = (counts[p.category_id] || 0) + 1; });
      setProductCounts(counts);
    }).catch(() => {});
  }, []);

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const statusParam = filters.statuses.length === 1 ? filters.statuses[0] : undefined;
      const data = await fetchCategories({
        page, size,
        status:  statusParam,
        keyword: filters.keyword || undefined,
        sort:    `${sortKey}:${sortDir}`,
      });
      setCategories(data.data || []);
      setTotal(data.meta?.total ?? 0);
    } catch (err) {
      setError(err.message || 'Failed to load categories');
      setCategories([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [page, size, filters, sortKey, sortDir]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

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

  const hasActiveFilters = filters.statuses.length > 0 || filters.keyword;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const pageList   = buildPageList(page, totalPages);

  const TH = ({ children, column, extraStyle }) => (
    <th onClick={column ? () => handleSort(column) : undefined} style={{
      padding: '16px 12px', textAlign: 'left',
      fontSize: '14px', fontWeight: 700, color: '#282828',
      background: '#FFFFFF', borderBottom: '1px solid #D4D4D4',
      whiteSpace: 'nowrap', cursor: column ? 'pointer' : 'default',
      userSelect: 'none', fontFamily: "'Lato', sans-serif",
      ...extraStyle,
    }}>
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>
        {children}
        {column && <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />}
      </span>
    </th>
  );

  return (
    <div style={{ background: '#F4F4F4', padding: '24px', fontFamily: "'Lato', sans-serif" }}>

      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          {/* Title row with back chevron */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={() => navigate('/catalog')}
              style={{
                background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
                display: 'flex', alignItems: 'center', color: '#282828',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828', letterSpacing: '0.18px' }}>
              {t('dashboard:categories.title', 'Manage Category')}
            </h1>
          </div>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', paddingLeft: '24px', fontSize: '14px', color: '#7E7E7E' }}>
            <Link to="/catalog" style={{ color: '#7E7E7E', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#282828'}
              onMouseLeave={e => e.currentTarget.style.color = '#7E7E7E'}>
              Catalog
            </Link>
            <span>/</span>
            <span>Manage Category</span>
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Filter bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '12px 20px', borderBottom: '1px solid #D4D4D4', gap: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FilterPill
              label={t('dashboard:categories.columns.status', 'Status')}
              options={STATUS_FILTER_OPTIONS}
              selected={filters.statuses}
              onToggle={id => {
                setFilters(prev => ({
                  ...prev,
                  statuses: prev.statuses.includes(id)
                    ? prev.statuses.filter(x => x !== id)
                    : [...prev.statuses, id],
                }));
                setPage(1);
              }}
              onClearAll={() => { setFilters(prev => ({ ...prev, statuses: [] })); setPage(1); }}
              showSearch={false}
              t={t}
            />
            {hasActiveFilters && (
              <button onClick={handleClearFilters} style={{
                background: 'none', border: 'none', cursor: 'pointer',
                fontSize: '14px', color: '#A9A9A9', padding: 0,
                fontFamily: "'Lato', sans-serif",
              }}>
                {t('dashboard:catalog.filter.removeFilter', 'Hapus Filter')}
              </button>
            )}
          </div>

          {/* Search bar */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            background: '#F4F4F4', borderRadius: '8px',
            padding: '6px 10px', width: '240px', flexShrink: 0,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#A9A9A9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input type="text" value={draftKeyword} onChange={handleKeywordInput}
              placeholder={t('dashboard:categories.searchPlaceholder', 'Search categories…')}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: '14px', color: '#282828', width: '100%',
                fontFamily: "'Lato', sans-serif",
              }}
            />
          </div>
        </div>

        {/* Error state */}
        {error && !isLoading && (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ fontSize: '15px', fontWeight: 600, color: '#EF4444', marginBottom: '8px' }}>
              {t('dashboard:categories.errorTitle', 'Failed to load categories')}
            </p>
            <p style={{ fontSize: '13px', color: '#6B7280', marginBottom: '16px' }}>{error}</p>
            <button onClick={loadCategories} style={{
              padding: '6px 16px', border: '1px solid #006BFF', borderRadius: '8px',
              background: '#FFFFFF', color: '#006BFF', cursor: 'pointer',
              fontSize: '13px', fontFamily: "'Lato', sans-serif",
            }}>
              {t('dashboard:categories.retry', 'Retry')}
            </button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 56px - 48px - 78px - 20px - 61px - 61px)', overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <TH column="name">{t('dashboard:categories.columns.name', 'Category Name')}</TH>
                  <TH>{t('dashboard:categories.columns.description', 'Description')}</TH>
                  <TH>{t('dashboard:categories.columns.totalProducts', 'Total Products')}</TH>
                  <TH column="status">{t('dashboard:categories.columns.status', 'Status')}</TH>
                  <TH column="updated_at">{t('dashboard:categories.columns.updatedAt', 'Last Updated')}</TH>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 0, borderBottom: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '64px', paddingBottom: '72px', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', height: '60px' }}>
                          {[0, 1, 2].map(i => (
                            <div key={i} style={{
                              width: '14px', height: '14px', borderRadius: '50%', background: '#006BFF',
                              animation: `loading-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                            }} />
                          ))}
                        </div>
                        <div style={{ textAlign: 'center' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif" }}>Loading Data</p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#282828', fontFamily: "'Lato', sans-serif" }}>Please wait a moment</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ padding: 0, borderBottom: 'none' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: '64px', paddingBottom: '72px', gap: '20px' }}>
                        <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
                          <rect x="46" y="30" width="108" height="130" rx="8" fill="#F4F4F4" stroke="#E0E0E0" strokeWidth="1.5" strokeDasharray="6 4"/>
                          <rect x="62" y="57" width="76" height="8" rx="4" fill="#ECECEC"/>
                          <rect x="62" y="73" width="76" height="8" rx="4" fill="#ECECEC"/>
                          <rect x="62" y="89" width="76" height="8" rx="4" fill="#ECECEC"/>
                          <rect x="62" y="105" width="50" height="8" rx="4" fill="#ECECEC"/>
                          <rect x="62" y="121" width="62" height="8" rx="4" fill="#ECECEC"/>
                          <circle cx="88" cy="108" r="38" fill="white" stroke="#D0D0D0" strokeWidth="3"/>
                          <circle cx="88" cy="108" r="28" fill="#F9F9F9" stroke="#D0D0D0" strokeWidth="2"/>
                          <line x1="110" y1="130" x2="130" y2="155" stroke="#C0C0C0" strokeWidth="6" strokeLinecap="round"/>
                          <rect x="76" y="101" width="24" height="4" rx="2" fill="#D4D4D4"/>
                          <rect x="76" y="110" width="18" height="4" rx="2" fill="#D4D4D4"/>
                        </svg>
                        <div style={{ textAlign: 'center', width: '290px' }}>
                          <p style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                            {hasActiveFilters
                              ? t('dashboard:categories.emptyFiltered', 'No Search Results Found')
                              : t('dashboard:categories.emptyDefault', 'No Categories Yet')}
                          </p>
                          <p style={{ margin: 0, fontSize: '12px', color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                            {hasActiveFilters
                              ? t('dashboard:categories.emptyFilteredSub', 'Try searching with a different term, okay?')
                              : t('dashboard:categories.emptyDefaultSub', 'Add your first category to get started')}
                          </p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : categories.map(cat => (
                  <tr key={cat.id} style={{ transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = '#F5F5F5'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ ...TD, fontWeight: 700 }}>{cat.name}</td>
                    <td style={{ ...TD, color: '#282828', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cat.description}>
                      {cat.description || '-'}
                    </td>
                    <td style={TD}>{productCounts[cat.id] || 0}</td>
                    <td style={TD}><Badge value={cat.status} /></td>
                    <td style={{ ...TD, whiteSpace: 'nowrap' }}>{formatDate(cat.updated_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer */}
        {!error && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 20px', height: '60px', borderTop: '1px solid #D4D4D4', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <RowsSelector size={size} onChange={val => { setSize(Number(val)); setPage(1); }} />
              <span style={{ fontSize: '14px', color: '#282828', opacity: 0.5, whiteSpace: 'nowrap' }}>
                {isLoading ? 'Loading…' : total === 0 ? 'No results' : `from ${total} rows`}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <StepBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1 || isLoading} outlined>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </StepBtn>
              {pageList.map((item, i) =>
                item === '…'
                  ? <span key={`e${i}`} style={{ width: '30px', textAlign: 'center', fontSize: '14px', color: '#282828' }}>...</span>
                  : <StepBtn key={item} active={item === page} onClick={() => setPage(item)} disabled={isLoading}>{item}</StepBtn>
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

      <style>{`
        @keyframes loading-dot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
