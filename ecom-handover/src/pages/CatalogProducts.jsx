import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropdown from '../components/ui/Dropdown';
import Button from '../components/ui/Button';
import { fetchProducts, fetchCategories, updateProductPlatformStatus } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';

// ─── Badge configs ────────────────────────────────────────────────────────────
const PLATFORM_BADGE = {
  published: { bg: '#DBEAFE', color: '#2563EB', label: 'Published' },
  draft:     { bg: '#F3F4F6', color: '#6B7280', label: 'Not Published' },
  archived:  { bg: '#F3F4F6', color: '#6B7280', label: 'Not Published' },
};

function Badge({ config, value }) {
  const cfg = config[value] || { bg: '#F3F4F6', color: '#6B7280', label: value };
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

// ─── Skeleton row ─────────────────────────────────────────────────────────────
const SKELETON_WIDTHS = [
  ['60%', '55%', '48%', '42%'],
  ['45%', '65%', '52%', '38%'],
  ['70%', '40%', '58%', '44%'],
  ['55%', '60%', '46%', '50%'],
  ['65%', '45%', '54%', '40%'],
  ['50%', '70%', '44%', '56%'],
  ['58%', '50%', '62%', '36%'],
  ['48%', '55%', '50%', '48%'],
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
      <td style={{ padding: '14px 12px 14px 20px', borderBottom: '1px solid #F3F4F6', width: '40px' }} />
      {cell(w[0], '80px')}
      {cell(w[1], '60px')}
      {cell('72%', '50px')}
      {cell(w[2], '48px')}
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

// ─── Format price ─────────────────────────────────────────────────────────────
function formatPrice(val) {
  if (val == null) return '-';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
}

// ─── Filter option lists ──────────────────────────────────────────────────────
const PLATFORM_OPTIONS = [
  { id: '',              label: 'All' },
  { id: 'published',     label: 'Published' },
  { id: 'not_published', label: 'Not Published' },
];
const SIZE_OPTIONS = [
  { id: '10', label: '10 per page' },
  { id: '25', label: '25 per page' },
  { id: '50', label: '50 per page' },
];

const EMPTY_FILTERS = {
  platformStatus: '',
  categoryId: '',
  keyword: '',
};

export default function CatalogProducts() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  // ── Data state ──────────────────────────────────────────────────────────────
  const [products, setProducts] = useState([]);
  const [total, setTotal]       = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError]         = useState(null);

  // ── Categories for filter dropdown ─────────────────────────────────────────
  const [categoryOptions, setCategoryOptions] = useState([{ id: '', label: 'All Categories' }]);

  // ── Filters ─────────────────────────────────────────────────────────────────
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [draftKeyword, setDraftKeyword] = useState('');
  const keywordTimer = useRef(null);

  // ── Sorting ─────────────────────────────────────────────────────────────────
  const [sortKey, setSortKey] = useState('updated_at');
  const [sortDir, setSortDir] = useState('desc');

  // ── Pagination ──────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  // ── Bulk selection ──────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds]         = useState(new Set());
  const [allPagesSelected, setAllPagesSelected] = useState(false);
  const [bulkLoading, setBulkLoading]           = useState(false);
  const [confirmingUnpublish, setConfirmingUnpublish] = useState(false);
  const headerCheckboxRef = useRef(null);

  // ── Published product count (independent of current filter) ────────────────
  const [publishedTotal, setPublishedTotal] = useState(null);

  // ── Category map: id → name, for display in table ──────────────────────────
  const [categoryMap, setCategoryMap] = useState({});

  async function refreshPublishedTotal() {
    try {
      const d = await fetchProducts({ published: true, size: 1 });
      setPublishedTotal(d.meta?.total ?? 0);
    } catch { /* non-critical */ }
  }

  useEffect(() => { refreshPublishedTotal(); }, []);

  // ── Load categories once ────────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories({ size: 100 })
      .then(data => {
        const cats = (data.data || []);
        const map = {};
        cats.forEach(c => { map[c.id] = c.name; });
        setCategoryMap(map);
        setCategoryOptions([{ id: '', label: 'All Categories' }, ...cats.map(c => ({ id: c.id, label: c.name }))]);
      })
      .catch(() => {}); // non-critical
  }, []);

  // ── Derived selection values ────────────────────────────────────────────────
  const allSelected  = products.length > 0 && products.every(p => selectedIds.has(p.id));
  const someSelected = products.some(p => selectedIds.has(p.id));

  useEffect(() => {
    if (headerCheckboxRef.current) {
      headerCheckboxRef.current.indeterminate = someSelected && !allSelected;
    }
  }, [someSelected, allSelected]);

  // ── Load products ───────────────────────────────────────────────────────────
  const loadProducts = useCallback(async () => {
    setSelectedIds(new Set());
    setAllPagesSelected(false);
    setConfirmingUnpublish(false);
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        page,
        size,
        ...(filters.platformStatus === 'published'     ? { published: true }  : {}),
        ...(filters.platformStatus === 'not_published' ? { published: false } : {}),
        categoryId: filters.categoryId || undefined,
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

  function toggleSelect(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleSelectAll() {
    setAllPagesSelected(false);
    setConfirmingUnpublish(false);
    setSelectedIds(allSelected ? new Set() : new Set(products.map(p => p.id)));
  }

  async function handleSelectAllPages() {
    try {
      const data = await fetchProducts({
        page: 1, size: total,
        ...(filters.platformStatus === 'published'     ? { published: true }  : {}),
        ...(filters.platformStatus === 'not_published' ? { published: false } : {}),
        categoryId: filters.categoryId || undefined,
        keyword: filters.keyword || undefined,
      });
      setSelectedIds(new Set((data.data || []).map(p => p.id)));
      setAllPagesSelected(true);
    } catch {
      showSnackbar('Failed to select all products', 'error');
    }
  }

  async function handleBulkToggle(targetStatus) {
    if (bulkLoading || selectedIds.size === 0) return;
    setBulkLoading(true);
    const ids = [...selectedIds];
    try {
      await Promise.all(ids.map(id => updateProductPlatformStatus(id, targetStatus)));
      const verb = targetStatus === 'published' ? 'published' : 'unpublished';
      showSnackbar(`${ids.length} product${ids.length > 1 ? 's' : ''} ${verb}`, 'success');
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

  const hasActiveFilters = filters.platformStatus || filters.categoryId || filters.keyword;
  const totalPages = Math.max(1, Math.ceil(total / size));
  const fromRow = total === 0 ? 0 : (page - 1) * size + 1;
  const toRow = Math.min(page * size, total);

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
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#1B1B1B' }}>
            {t('dashboard:catalog.title', 'Product Catalog')}
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#6B7280' }}>
            {t('dashboard:catalog.subtitle', 'Manage and view all products in your catalog.')}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="secondary" onClick={() => navigate('/categories')} style={{ padding: '12px 24px', fontSize: '14px' }}>
            Categories
          </Button>
          <Button variant="primary" onClick={() => showSnackbar('Sync from MRP is not available in demo mode', 'grey')} style={{ padding: '12px 24px', fontSize: '14px' }}>
            Sync from MRP
          </Button>
        </div>
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
              options={PLATFORM_OPTIONS}
              selected={filters.platformStatus}
              onSelect={v => handleFilterChange('platformStatus', v)}
              placeholder="Publish Status"
              style={{ height: '36px', minWidth: '152px' }}
            />
            <Dropdown
              options={categoryOptions}
              selected={filters.categoryId}
              onSelect={v => handleFilterChange('categoryId', v)}
              placeholder="All Categories"
              width="auto"
              style={{ height: '36px', minWidth: '160px' }}
            />
            {hasActiveFilters && (
              <Button variant="tertiary" size="small" onClick={handleClearFilters}>
                {t('dashboard:catalog.clearFilters', 'Clear')}
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
              placeholder={t('dashboard:catalog.searchPlaceholder', 'Search by name or SKU…')}
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

        {/* No published products warning */}
        {publishedTotal === 0 && !isLoading && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 20px', background: '#FFFBEB', borderBottom: '1px solid #FDE68A' }}>
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
            padding: '10px 20px', background: '#EFF6FF', borderBottom: '1px solid #DBEAFE',
          }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#1D4ED8' }}>
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
            {confirmingUnpublish ? (
              <>
                <span style={{ fontSize: '13px', color: '#92400E', fontWeight: 500 }}>
                  Hide {selectedIds.size} product{selectedIds.size > 1 ? 's' : ''} from your store?
                </span>
                <Button variant="danger" size="small" disabled={bulkLoading}
                  onClick={() => { setConfirmingUnpublish(false); handleBulkToggle('draft'); }}>
                  Confirm
                </Button>
                <Button variant="secondary" size="small" disabled={bulkLoading}
                  onClick={() => setConfirmingUnpublish(false)}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button variant="primary" size="small" disabled={bulkLoading} onClick={() => handleBulkToggle('published')}>
                  Publish
                </Button>
                <Button variant="secondary" size="small" disabled={bulkLoading} onClick={() => setConfirmingUnpublish(true)}>
                  Unpublish
                </Button>
              </>
            )}
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

        {/* Table */}
        {!error && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
              <thead>
                <tr>
                  <th style={{ padding: '12px 12px 12px 20px', width: '40px', background: '#F9FAFB', borderBottom: '1px solid #E9E9E9' }}>
                    <input
                      ref={headerCheckboxRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={toggleSelectAll}
                      disabled={isLoading || bulkLoading || products.length === 0}
                      style={{ accentColor: '#006BFF', width: '15px', height: '15px', cursor: 'pointer' }}
                    />
                  </th>
                  <Th column="name">{t('dashboard:catalog.columns.name', 'Product Name')}</Th>
                  <Th>{t('dashboard:catalog.columns.sku', 'SKU')}</Th>
                  <Th>{t('dashboard:catalog.columns.category', 'Category')}</Th>
                  <Th column="price" extraStyle={{ textAlign: 'right' }}>
                    {t('dashboard:catalog.columns.price', 'Price')}
                  </Th>
                  <Th>{t('dashboard:catalog.columns.platformStatus', 'Publish Status')}</Th>
                  <Th column="updated_at" extraStyle={{ textAlign: 'right' }}>
                    {t('dashboard:catalog.columns.updatedAt', 'Last Updated')}
                  </Th>
                </tr>
              </thead>
              <tbody>
                {isLoading
                  ? Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} index={i} />)
                  : products.length === 0
                    ? (
                      <tr>
                        <td colSpan={7} style={{ padding: '60px 24px', textAlign: 'center' }}>
                          <div style={{ color: '#9CA3AF', fontSize: '14px' }}>
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ display: 'block', margin: '0 auto 12px', opacity: 0.4 }}>
                              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                            </svg>
                            {hasActiveFilters
                              ? t('dashboard:catalog.emptyFiltered', 'No products match your filters.')
                              : t('dashboard:catalog.emptyDefault', 'No products found.')}
                          </div>
                        </td>
                      </tr>
                    )
                    : products.map(p => (
                      <tr
                        key={p.id}
                        onClick={() => navigate(`/catalog/${p.id}`)}
                        style={{ transition: 'background 0.15s', cursor: 'pointer' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td
                          style={{ padding: '14px 12px 14px 20px', borderBottom: '1px solid #F3F4F6', width: '40px' }}
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
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', fontWeight: 600, color: '#1B1B1B', maxWidth: '240px' }}>
                          <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={p.name}>
                            {p.name}
                          </div>
                          {p.mrp_id && (
                            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>{p.mrp_id}</div>
                          )}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', color: '#4B5563', fontFamily: 'monospace', fontSize: '13px' }}>
                          {p.sku || '-'}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', color: '#4B5563', whiteSpace: 'nowrap' }}>
                          {categoryMap[p.category_id] || p.category_id || '-'}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', color: '#1B1B1B', fontWeight: 500, textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatPrice(p.price)}
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6' }}>
                          <Badge config={PLATFORM_BADGE} value={p.platform_status} />
                        </td>
                        <td style={{ padding: '14px 16px', borderBottom: '1px solid #F3F4F6', color: '#6B7280', fontSize: '13px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                          {formatDate(p.updated_at)}
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
                ? t('dashboard:catalog.pagination.loading', 'Loading…')
                : total === 0
                  ? t('dashboard:catalog.pagination.noResults', 'No results')
                  : `Showing ${fromRow}–${toRow} of ${total} products`
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
