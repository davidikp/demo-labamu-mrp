import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { fetchCategories, fetchProducts } from '../services/catalogService';

// ─── Badge config ─────────────────────────────────────────────────────────────
const STATUS_BADGE = {
  ACTIVE:   { bg: '#DCFCE7', color: '#166534', label: 'Active' },
  INACTIVE: { bg: '#FEE2E2', color: '#991B1B', label: 'Inactive' },
};

function Badge({ value }) {
  const cfg = STATUS_BADGE[value] || { bg: '#F3F4F6', color: '#6B7280', label: value };
  return (
    <span style={{
      display: 'inline-block',
      background: cfg.bg,
      color: cfg.color,
      borderRadius: '999px',
      padding: '3px 10px',
      fontSize: '12px',
      fontWeight: 600,
      whiteSpace: 'nowrap',
    }}>
      {cfg.label}
    </span>
  );
}

// ─── Skeleton row (5 columns) ─────────────────────────────────────────────────
const SKELETON_WIDTHS = [
  ['60%', '55%', '30%', '42%'],
  ['45%', '65%', '25%', '38%'],
  ['70%', '40%', '35%', '44%'],
  ['55%', '60%', '28%', '50%'],
  ['65%', '45%', '32%', '40%'],
];

function SkeletonRow({ index }) {
  const w = SKELETON_WIDTHS[index % SKELETON_WIDTHS.length];
  const cell = (width, minW = '60px') => (
    <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ height: '14px', background: '#E9E9E9', borderRadius: '6px', width, minWidth: minW, animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
    </td>
  );
  const badge = () => (
    <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
      <div style={{ height: '22px', background: '#E9E9E9', borderRadius: '999px', width: '64px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
    </td>
  );
  return (
    <tr>
      {cell(w[0], '80px')}
      {cell(w[1], '100px')}
      {cell(w[2], '40px')}
      {badge()}
      {cell(w[3], '72px')}
    </tr>
  );
}

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ column, sortKey, sortDir }) {
  const active = sortKey === column;
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', marginLeft: '4px', verticalAlign: 'middle', lineHeight: 1 }}>
      <svg width="8" height="5" viewBox="0 0 8 5" style={{ display: 'block', color: active && sortDir === 'asc' ? '#006BFF' : '#D1D5DB' }}>
        <path d="M4 0L8 5H0L4 0Z" fill="currentColor" />
      </svg>
      <svg width="8" height="5" viewBox="0 0 8 5" style={{ display: 'block', marginTop: '2px', color: active && sortDir === 'desc' ? '#006BFF' : '#D1D5DB' }}>
        <path d="M4 5L0 0H8L4 5Z" fill="currentColor" />
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

// ─── Filter option lists ──────────────────────────────────────────────────────
const STATUS_OPTIONS = [
  { id: '', label: 'All' },
  { id: 'ACTIVE', label: 'ACTIVE' },
  { id: 'INACTIVE', label: 'INACTIVE' },
];

const SIZE_OPTIONS = [
  { id: '10', label: '10 per page' },
  { id: '25', label: '25 per page' },
  { id: '50', label: '50 per page' },
];

const EMPTY_FILTERS = {
  status:  '',
  keyword: '',
};

export default function CatalogCategories() {
  const { t } = useTranslation();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([]);
  const [total, setTotal]           = useState(0);
  const [isLoading, setIsLoading]   = useState(true);
  const [error, setError]           = useState(null);

  // ── Product counts (computed client-side from fetchProducts) ────────────────
  const [productCounts, setProductCounts] = useState({});

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filters, setFilters]         = useState(EMPTY_FILTERS);
  const [draftKeyword, setDraftKeyword] = useState('');
  const keywordTimer = useRef(null);

  // ── Sorting ─────────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // ── Load product counts once on mount ──────────────────────────────────────
  useEffect(() => {
    fetchProducts({ size: 100 }).then(res => {
      const counts = {};
      (res.data || []).forEach(p => {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });
      setProductCounts(counts);
    }).catch(() => {});
  }, []);

  // ── Load categories ─────────────────────────────────────────────────────────
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCategories({
        page, size,
        status:  filters.status  || undefined,
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

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleFilterChange(key, value) {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
  }

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

  const hasActiveFilters = filters.status || filters.keyword;
  const totalPages = Math.max(1, Math.ceil(total / size));

  // ── Sort th helper ────────────────────────────────────────────────────────
  const Th = ({ children, column, extraStyle }) => (
    <th
      onClick={column ? () => handleSort(column) : undefined}
      style={{
        padding: '12px 16px',
        textAlign: 'left',
        fontSize: '12px',
        fontWeight: 600,
        color: '#6B7280',
        background: '#F9FAFB',
        borderBottom: '1px solid #E9E9E9',
        whiteSpace: 'nowrap',
        cursor: column ? 'pointer' : 'default',
        userSelect: 'none',
        ...extraStyle,
      }}
    >
      {children}
      {column && <SortIcon column={column} sortKey={sortKey} sortDir={sortDir} />}
    </th>
  );

  return (
    <div style={{ background: '#F4F4F4', minHeight: '100vh', padding: '24px', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
      `}</style>

      {/* Page header */}
      <div style={{ marginBottom: '20px' }}>
        <PageHeader
          title={t('dashboard:categories.title', 'Product Categories')}
          backPath="/catalog"
          breadcrumbs={[
            { label: 'Catalog', path: '/catalog' },
            { label: 'Categories' },
          ]}
        />
      </div>

      {/* Card */}
      <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden' }}>

        {/* Filter bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #F3F4F6', gap: '12px',
        }}>
          {/* Left: filters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Dropdown
              options={STATUS_OPTIONS}
              selected={filters.status}
              onSelect={v => handleFilterChange('status', v)}
              placeholder="All Status"
              style={{ height: '36px', minWidth: '148px' }}
            />
            {hasActiveFilters && (
              <Button variant="tertiary" size="small" onClick={handleClearFilters}>
                {t('dashboard:categories.clearFilters', 'Clear')}
              </Button>
            )}
          </div>

          {/* Right: search */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF"
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            >
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              value={draftKeyword}
              onChange={handleKeywordInput}
              placeholder={t('dashboard:categories.searchPlaceholder', 'Search categories…')}
              style={{
                paddingLeft: '36px', paddingRight: '12px',
                height: '36px', width: '240px',
                border: '1px solid #E9E9E9', borderRadius: '8px',
                fontSize: '14px', fontWeight: 400, color: '#1B1B1B',
                outline: 'none', fontFamily: "'Lato', sans-serif",
                background: '#FAFAFA',
              }}
              onFocus={e => { e.target.style.borderColor = '#006BFF'; e.target.style.background = '#FFFFFF'; }}
              onBlur={e => { e.target.style.borderColor = '#E9E9E9'; e.target.style.background = '#FAFAFA'; }}
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
            <Button variant="secondary" size="small" onClick={loadCategories}>
              {t('dashboard:categories.retry', 'Retry')}
            </Button>
          </div>
        )}

        {/* Table */}
        {!error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <Th column="name">{t('dashboard:categories.columns.name', 'Category Name')}</Th>
                  <Th>{t('dashboard:categories.columns.description', 'Description')}</Th>
                  <Th>{t('dashboard:categories.columns.totalProducts', 'Total Products')}</Th>
                  <Th column="status">{t('dashboard:categories.columns.status', 'Status')}</Th>
                  <Th column="updated_at">{t('dashboard:categories.columns.updatedAt', 'Last Updated')}</Th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 5 }, (_, i) => <SkeletonRow key={i} index={i} />)
                  : categories.length === 0
                    ? (
                      <tr>
                        <td colSpan={5} style={{ padding: '60px 24px', textAlign: 'center' }}>
                          <div style={{ color: '#9CA3AF', fontSize: '14px' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }}>
                              <path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z"/>
                            </svg>
                            {hasActiveFilters
                              ? t('dashboard:categories.emptyFiltered', 'No categories match your filters.')
                              : t('dashboard:categories.emptyDefault', 'No categories found.')}
                          </div>
                        </td>
                      </tr>
                    )
                    : categories.map(cat => (
                      <tr key={cat.id}>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontWeight: 600, color: '#1B1B1B' }}>
                          {cat.name}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', color: '#6B7280', maxWidth: '400px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={cat.description}>
                          {cat.description || '-'}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontWeight: 500, color: '#1B1B1B' }}>
                          {productCounts[cat.id] || 0}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                          <Badge value={cat.status} />
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', color: '#6B7280', fontSize: '13px', whiteSpace: 'nowrap' }}>
                          {formatDate(cat.updated_at)}
                        </td>
                      </tr>
                    ))
                }
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!error && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px', borderTop: '1px solid #F3F4F6', flexWrap: 'wrap', gap: '12px',
          }}>
            {/* Left: summary */}
            <div style={{ fontSize: '13px', color: '#6B7280' }}>
              {isLoading
                ? t('dashboard:categories.pagination.loading', 'Loading…')
                : total === 0
                  ? t('dashboard:categories.pagination.noResults', 'No results')
                  : `Total Categories: ${total}`
              }
            </div>

            {/* Right: size picker + prev/next */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Dropdown
                options={SIZE_OPTIONS}
                selected={String(size)}
                onSelect={handleSizeChange}
                style={{ height: '34px', minWidth: '128px' }}
              />
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1 || isLoading}
                style={{
                  height: '34px', minWidth: '34px', border: '1px solid #E9E9E9', borderRadius: '8px',
                  background: page <= 1 || isLoading ? '#F9FAFB' : '#FFFFFF',
                  color: page <= 1 || isLoading ? '#D1D5DB' : '#374151',
                  cursor: page <= 1 || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Lato', sans-serif", fontSize: '13px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <span style={{ fontSize: '13px', color: '#374151', minWidth: '72px', textAlign: 'center' }}>
                {isLoading ? '—' : `${page} / ${totalPages}`}
              </span>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages || isLoading}
                style={{
                  height: '34px', minWidth: '34px', border: '1px solid #E9E9E9', borderRadius: '8px',
                  background: page >= totalPages || isLoading ? '#F9FAFB' : '#FFFFFF',
                  color: page >= totalPages || isLoading ? '#D1D5DB' : '#374151',
                  cursor: page >= totalPages || isLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Lato', sans-serif", fontSize: '13px',
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
