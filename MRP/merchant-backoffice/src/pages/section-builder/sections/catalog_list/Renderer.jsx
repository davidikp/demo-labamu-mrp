import { memo, useMemo, useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { resolveStorefrontProducts, buildProductPath } from '../shared/productSource';
import { ASPECT_RATIO_CLASS } from '../shared/imageAspectRatio';

/**
 * @module section-builder/sections/catalog_list/Renderer
 * @description Shop system page's functional product grid — search,
 * single-select category filter, price range filter, sort, and pagination,
 * reproducing the golden reference's (ecom-from-bella ShopPage.jsx) visual
 * language and interaction model while sourcing data ONLY through
 * `resolveStorefrontProducts(theme)` (never a direct mocks/catalog.json
 * import) and reusing this codebase's own theme tokens (StorefrontContainer,
 * themedCardStyle, ASPECT_RATIO_CLASS) instead of a Shop-specific token set
 * or Houzez-only hardcoded Rupiah formatting.
 *
 * Sort semantics: the normalized product shape (productSource.js) has no
 * date-like field (no createdAt/updatedAt anywhere in the catalog
 * fixtures), so 'newest'/'oldest' use the resolved products array's own
 * order as a documented, stable proxy for chronology — 'newest' = later in
 * the array (mirrors catalog_list's pre-Phase-2 shim, which treated a
 * higher array index as more recently added), 'oldest' = the reverse. No
 * fabricated timestamps are introduced.
 */

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

const COLS_CLASS = { 2: 'grid-cols-2', 3: 'grid-cols-2 grid-cols-3', 4: 'grid-cols-2 grid-cols-4' };

/** Desktop/tablet/mobile column class, resolved off the builder's canonical
 * `breakpoint` signal (themes/breakpoints.js) when it's explicitly known
 * (builder canvas, PreviewLive — see Canvas.jsx), falling back to Tailwind
 * responsive classes only for a real, un-framed browser viewport (the
 * eventual published storefront) where there is no such signal. Tablet is a
 * deliberate distinct 3-column tier — the golden reference only ever shows
 * 2 or 4, but Phase 2 explicitly calls for a middle tier. */
/** Golden (`ShopPage.jsx`) grid uses an inline `gap: isMobile ? '12px' : '24px'`
 * (binary, no tablet tier). Reproduced here off the same canonical
 * `breakpoint` signal used for column count above, rather than Tailwind
 * `md:` classes, so the gap tracks Canvas's simulated device width exactly
 * the same way column count does. Golden has no tablet tier of its own —
 * 768px/tablet is a deliberate, documented in-between value (16px) rather
 * than a golden-matched one: 1440px desktop → 24px, 768px tablet → 16px,
 * 390px mobile → 12px.
 */
function resolveGridGapPx(breakpoint, isMobile) {
  if (breakpoint === 'mobile') return 12;
  if (breakpoint === 'tablet') return 16;
  if (breakpoint === 'desktop' || breakpoint === 'largeDesktop' || breakpoint === 'fit') return 24;
  // No explicit breakpoint (real browser viewport) — fall back to the
  // isMobile flag golden itself uses (binary).
  return isMobile ? 12 : 24;
}

function resolveGridColsClass(breakpoint, columnsDesktop) {
  const desktopCols = [2, 3, 4].includes(columnsDesktop) ? columnsDesktop : 4;
  if (breakpoint === 'mobile') return 'grid-cols-2';
  if (breakpoint === 'tablet') return 'grid-cols-3';
  if (breakpoint === 'desktop' || breakpoint === 'largeDesktop' || breakpoint === 'fit') {
    return `grid-cols-${desktopCols}`;
  }
  // No explicit breakpoint (real browser viewport) — Tailwind fallback.
  const tabletClass = 'md:grid-cols-3';
  const desktopClass = `lg:grid-cols-${desktopCols}`;
  return `grid-cols-2 ${tabletClass} ${desktopClass}`;
}

function formatPrice(product) {
  if (typeof product.price === 'string' && product.price.trim()) return product.price;
  if (typeof product.price === 'number') return `$${product.price.toFixed(2)}`;
  return '';
}

function deriveCategories(products) {
  const seen = new Set();
  const categories = [];
  for (const product of products) {
    const category = product.category;
    if (!category || seen.has(category)) continue;
    seen.add(category);
    categories.push(category);
  }
  return categories;
}

/** Golden reference (`ShopPage.jsx`'s `ProductCard`) renders a flat card —
 * square 1:1 image with no rounded corners, no border, no shadow, image
 * gap-then-name-then-price with no card padding box — a deliberately
 * different, flatter treatment than this codebase's other product-bearing
 * sections (which use the theme's `card_corners`/`card_shadow` tokens via
 * `themedCardStyle`). Shop intentionally does NOT apply `themedCardStyle`
 * here to match golden's flat look exactly, rather than inventing a
 * Shop-specific token set or forcing golden's flat look onto the shared
 * token (which other sections still legitimately want to keep using). */
function ProductGridCard({ product, aspectClass, onNavigate }) {
  const { t } = useTranslation();
  const soldOut = product.stock === 0;
  const handleClick = onNavigate ? () => onNavigate(buildProductPath(product.handle)) : undefined;

  return (
    <div
      onClick={handleClick}
      style={{ cursor: handleClick ? 'pointer' : 'default' }}
      className="flex flex-col text-left"
    >
      <div className={`relative mb-2.5 flex items-center justify-center overflow-hidden bg-gray-100 text-gray-300 ${aspectClass}`}>
        {product.image ? (
          <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          t('sectionBuilder:sections.common.noImage')
        )}
        {soldOut && (
          <span className="absolute right-2 top-2 rounded bg-gray-900/80 px-2 py-0.5 text-[11px] font-medium text-white">
            {t('sectionBuilder:sections.common.soldOut', 'Sold out')}
          </span>
        )}
      </div>
      <p
        className="mb-1 overflow-hidden text-sm text-gray-900"
        style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', lineHeight: 1.4 }}
      >
        {product.name}
      </p>
      <p className="text-[15px] font-bold text-gray-900">
        {soldOut ? <span className="text-sm font-medium text-gray-400">{t('sectionBuilder:sections.common.soldOut', 'Sold out')}</span> : formatPrice(product)}
      </p>
    </div>
  );
}

/** Golden's `CategorySidebar` is a collapsible "All Categories" header (bold,
 * with a left accent bar + chevron) followed by an indented flat list of
 * category rows, the active one bold/dark and inactive ones grey with a
 * hover tint. Reproduced with Tailwind utility classes instead of golden's
 * inline styles/JS hover handlers (this codebase's convention), keeping the
 * same row padding rhythm, weight/color contrast, and hover tint. */
function CategoryFilter({ categories, selected, onSelect }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(true);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between border-l-2 border-l-[var(--sb-accent,#006BFF)] py-2 pl-3 pr-1">
        <button
          type="button"
          onClick={() => onSelect('all')}
          className={`text-left text-sm ${selected === 'all' ? 'font-bold text-gray-900' : 'text-gray-900'}`}
        >
          {t('sectionBuilder:sections.catalogList.allCategories', 'All Categories')}
        </button>
        <button
          type="button"
          aria-label={t('sectionBuilder:sections.catalogList.toggleCategories', 'Toggle categories')}
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="text-gray-500"
        >
          {open ? '▾' : '▴'}
        </button>
      </div>
      {open && (
        <div className="flex flex-col pb-2">
          <button
            type="button"
            onClick={() => onSelect('all')}
            className={`rounded px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${selected === 'all' ? 'font-bold text-gray-900' : 'text-gray-500'}`}
          >
            {t('sectionBuilder:sections.catalogList.all', 'All')}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => onSelect(category)}
              className={`rounded px-3 py-1.5 text-left text-sm hover:bg-gray-50 ${selected === category ? 'font-bold text-gray-900' : 'text-gray-500'}`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/** Golden's `PriceInput` is a plain min/max number-input pair (not a
 * slider), one bordered box per bound, 40px tall. Reproduced as-is; the
 * "Rp" currency-prefix chrome golden hardcodes is deliberately dropped here
 * since this component also renders Xinear's USD catalog — a fixed "Rp"
 * label would misrepresent a non-Houzez storefront's currency. */
function PriceFilter({ min, max, onChange }) {
  const { t } = useTranslation();
  return (
    <div>
      <div className="mb-2 flex items-center justify-between border-l-2 border-l-[var(--sb-accent,#006BFF)] py-2 pl-3 pr-1 text-sm font-bold text-gray-900">
        {t('sectionBuilder:sections.catalogList.priceFilter', 'Price Filter')}
      </div>
      <div className="flex flex-col gap-2.5 pl-3">
        <input
          type="number"
          placeholder={t('sectionBuilder:sections.catalogList.lowestPrice', 'Lowest Price')}
          value={min}
          onChange={(e) => onChange({ min: e.target.value, max })}
          className="h-10 rounded-none border border-gray-200 px-2.5 text-sm"
        />
        <input
          type="number"
          placeholder={t('sectionBuilder:sections.catalogList.highestPrice', 'Highest Price')}
          value={max}
          onChange={(e) => onChange({ min, max: e.target.value })}
          className="h-10 rounded-none border border-gray-200 px-2.5 text-sm"
        />
      </div>
    </div>
  );
}

function buildPages(current, total) {
  if (total <= 1) return [1];
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, total, current - 1, current, current + 1].filter((p) => p >= 1 && p <= total));
  const sorted = [...set].sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i += 1) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…');
    result.push(sorted[i]);
  }
  return result;
}

function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  const pages = buildPages(currentPage, totalPages);
  return (
    <div className="mt-8 flex items-center justify-center gap-1">
      <button type="button" disabled={currentPage <= 1} onClick={() => onPageChange(currentPage - 1)} className="flex h-9 w-9 items-center justify-center rounded text-sm disabled:opacity-30" aria-label="Previous page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
      </button>
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`el-${i}`} className="w-9 text-center text-sm text-gray-500">…</span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onPageChange(p)}
            className={`flex h-9 w-9 items-center justify-center rounded text-sm ${p === currentPage ? 'border border-gray-900 font-bold text-gray-900' : 'text-gray-500 hover:underline'}`}
          >
            {p}
          </button>
        )
      )}
      <button type="button" disabled={currentPage >= totalPages} onClick={() => onPageChange(currentPage + 1)} className="flex h-9 w-9 items-center justify-center rounded text-sm disabled:opacity-30" aria-label="Next page">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6" /></svg>
      </button>
    </div>
  );
}

/** Golden's `MobileShopHeader` replaces the desktop sidebar with a
 * category-selector row (tap the current category name to open a dropdown
 * of all categories) plus a chip row (sort chip, price-filter chip) that
 * each open their own small disclosure panel — not the desktop sidebar
 * simply stacked above the grid. Reproduced here with the same
 * trigger-button + disclosure-panel shape (icon+label chip, bordered pill,
 * outside-click-to-close), using this codebase's category/sort state
 * directly instead of golden's internal duplicate state. */
function MobileFilterBar({ categories, selected, onCategorySelect, priceMin, priceMax, onPriceChange, sort, onSortChange }) {
  const { t } = useTranslation();
  const [catOpen, setCatOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const [priceOpen, setPriceOpen] = useState(false);
  const catRef = useRef(null);
  const sortRef = useRef(null);

  const allWithAll = [{ id: 'all', label: t('sectionBuilder:sections.catalogList.all', 'All') }, ...categories.map((c) => ({ id: c, label: c }))];
  const activeCat = allWithAll.find((c) => c.id === selected)?.label || allWithAll[0].label;
  const activeSort = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];

  useEffect(() => {
    function handler(e) {
      if (catRef.current && !catRef.current.contains(e.target)) setCatOpen(false);
      if (sortRef.current && !sortRef.current.contains(e.target)) setSortOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="mb-3">
      <div ref={catRef} className="relative mb-3 text-center">
        <span className="text-sm text-gray-600">{t('sectionBuilder:sections.catalogList.category', 'Category')} </span>
        <button
          type="button"
          onClick={() => { setCatOpen((o) => !o); setSortOpen(false); setPriceOpen(false); }}
          className="inline-flex items-center gap-1 text-sm font-bold text-gray-900"
        >
          {activeCat} <span aria-hidden="true">{catOpen ? '▴' : '▾'}</span>
        </button>
        {catOpen && (
          <div className="absolute left-1/2 top-full z-20 min-w-[180px] -translate-x-1/2 border border-gray-200 bg-white py-1 shadow-lg">
            {allWithAll.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => { onCategorySelect(cat.id); setCatOpen(false); }}
                className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${cat.id === selected ? 'font-bold text-gray-900' : 'text-gray-700'}`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="mb-3 border-t border-gray-200" />

      <div className="mb-3 flex gap-2">
        <div ref={sortRef} className="relative">
          <button
            type="button"
            onClick={() => { setSortOpen((o) => !o); setPriceOpen(false); setCatOpen(false); }}
            className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-900"
          >
            {activeSort.label} <span aria-hidden="true">{sortOpen ? '▴' : '▾'}</span>
          </button>
          {sortOpen && (
            <div className="absolute left-0 top-full z-20 min-w-[180px] border border-gray-200 bg-white py-1 shadow-lg">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onSortChange(opt.value); setSortOpen(false); }}
                  className={`block w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 ${opt.value === sort ? 'font-bold text-gray-900' : 'text-gray-700'}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => { setPriceOpen((o) => !o); setSortOpen(false); setCatOpen(false); }}
          aria-expanded={priceOpen}
          className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-[13px] text-gray-900"
        >
          {t('sectionBuilder:sections.catalogList.priceFilter', 'Price Filter')} <span aria-hidden="true">{priceOpen ? '▴' : '▾'}</span>
        </button>
      </div>

      {priceOpen && (
        <div className="mb-4 flex flex-col gap-2.5">
          <input
            type="number"
            placeholder={t('sectionBuilder:sections.catalogList.lowestPrice', 'Lowest Price')}
            value={priceMin}
            onChange={(e) => onPriceChange({ min: e.target.value, max: priceMax })}
            className="h-10 rounded-none border border-gray-200 px-2.5 text-sm"
          />
          <input
            type="number"
            placeholder={t('sectionBuilder:sections.catalogList.highestPrice', 'Highest Price')}
            value={priceMax}
            onChange={(e) => onPriceChange({ min: priceMin, max: e.target.value })}
            className="h-10 rounded-none border border-gray-200 px-2.5 text-sm"
          />
        </div>
      )}
    </div>
  );
}

function CatalogListRenderer({ data, onEdit, theme, isMobile, breakpoint, onNavigate }) {
  const { t } = useTranslation();
  const allProducts = useMemo(() => resolveStorefrontProducts(theme), [theme]);
  const categories = useMemo(() => deriveCategories(allProducts), [allProducts]);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const columnsDesktop = Number(data.columns_desktop) || 4;
  const pageSize = Number(data.page_size) || 16;
  const gridColsClass = resolveGridColsClass(breakpoint, columnsDesktop);
  const gridGapPx = resolveGridGapPx(breakpoint, isMobile);
  const aspectClass = ASPECT_RATIO_CLASS.square;
  const resolvedIsMobile = breakpoint ? breakpoint === 'mobile' : !!isMobile;

  const filteredSorted = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = allProducts.filter((product) => {
      if (category !== 'all' && product.category !== category) return false;
      if (priceMin !== '' && (product.priceValue == null || product.priceValue < Number(priceMin))) return false;
      if (priceMax !== '' && (product.priceValue == null || product.priceValue > Number(priceMax))) return false;
      if (term) {
        const haystack = `${product.name} ${product.category ?? ''} ${product.description ?? ''}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
    // Preserve source order + index for the newest/oldest proxy before any
    // further sort mutates order.
    result = result.map((product, index) => ({ product, sourceIndex: index }));
    result.sort((a, b) => {
      switch (sort) {
        case 'oldest':
          return a.sourceIndex - b.sourceIndex;
        case 'price-asc':
          return (a.product.priceValue ?? 0) - (b.product.priceValue ?? 0);
        case 'price-desc':
          return (b.product.priceValue ?? 0) - (a.product.priceValue ?? 0);
        case 'newest':
        default:
          return b.sourceIndex - a.sourceIndex;
      }
    });
    return result.map((r) => r.product);
  }, [allProducts, search, category, priceMin, priceMax, sort]);

  const total = filteredSorted.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedProducts = filteredSorted.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const resetPage = () => setPage(1);
  const hasActiveFilters = search.trim() !== '' || category !== 'all' || priceMin !== '' || priceMax !== '';

  const handleReset = () => {
    setSearch('');
    setCategory('all');
    setPriceMin('');
    setPriceMax('');
    setPage(1);
  };

  return (
    <section>
      <StorefrontContainer theme={theme} maxWidth>
        {onEdit ? (
          <EditableText as="h2" className="mb-6 text-2xl font-bold" value={data.heading} placeholder="Shop" onCommit={(v) => onEdit('heading', v)} />
        ) : (
          <h2 className="mb-6 text-2xl font-bold">{data.heading || 'Shop'}</h2>
        )}

        {allProducts.length === 0 ? (
          <div className="py-20 text-center">
            <p className="mb-1 text-sm font-bold text-gray-700">{t('sectionBuilder:sections.catalogList.catalogEmpty', 'Catalog not available')}</p>
            <p className="text-sm text-gray-400">{t('sectionBuilder:sections.catalogList.catalogEmptyBody', "This seller doesn't have any products listed at the moment.")}</p>
          </div>
        ) : (
          <div className={`flex gap-8 ${resolvedIsMobile ? 'flex-col' : 'flex-row'}`}>
            {/* Desktop/tablet: golden's ~240px CategorySidebar column. Tablet
                (no golden tier to match) reuses this same sidebar rather than
                the mobile chip chrome — at 768px there's still enough width
                for it to read cleanly, unlike at 390px. */}
            {!resolvedIsMobile && (
              <aside className="flex w-60 flex-none flex-col gap-4 pt-2">
                <CategoryFilter categories={categories} selected={category} onSelect={(c) => { setCategory(c); resetPage(); }} />
                <PriceFilter min={priceMin} max={priceMax} onChange={({ min, max }) => { setPriceMin(min); setPriceMax(max); resetPage(); }} />
              </aside>
            )}

            <div className="flex flex-1 flex-col">
              {resolvedIsMobile && (
                <MobileFilterBar
                  categories={categories}
                  selected={category}
                  onCategorySelect={(c) => { setCategory(c); resetPage(); }}
                  priceMin={priceMin}
                  priceMax={priceMax}
                  onPriceChange={({ min, max }) => { setPriceMin(min); setPriceMax(max); resetPage(); }}
                  sort={sort}
                  onSortChange={(v) => { setSort(v); resetPage(); }}
                />
              )}

              {/* Toolbar: golden's ShopTopBar is count-left / sort-right; the
                  search box (this codebase's Phase 2 addition, absent from
                  golden) sits directly to the left of sort on desktop so the
                  row still reads left-to-right as
                  count -> search -> sort, and stacks above both on mobile. */}
              <div className={`mb-4 flex gap-3 ${resolvedIsMobile ? 'flex-col' : 'flex-row items-center justify-between'}`}>
                <p className="text-xs text-gray-500">
                  {total === 0 ? t('sectionBuilder:sections.catalogList.noneFound', 'No products found') : t('sectionBuilder:sections.catalogList.count', '{{count}} products', { count: total })}
                </p>
                <div className={`flex gap-3 ${resolvedIsMobile ? 'flex-col' : 'flex-row items-center'}`}>
                  <input
                    type="search"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); resetPage(); }}
                    placeholder={t('sectionBuilder:sections.catalogList.searchPlaceholder', 'Search products')}
                    aria-label={t('sectionBuilder:sections.catalogList.searchPlaceholder', 'Search products')}
                    className="h-9 rounded border border-gray-200 px-3 text-sm md:max-w-xs"
                  />
                  <select
                    value={sort}
                    onChange={(e) => { setSort(e.target.value); resetPage(); }}
                    aria-label={t('sectionBuilder:sections.catalogList.sortBy', 'Sort by')}
                    className="h-9 rounded border border-gray-200 px-2 text-sm"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {!resolvedIsMobile && <div className="mb-6 border-t border-gray-200" />}

              {pagedProducts.length === 0 ? (
                <div className="py-16 text-center">
                  <p className="mb-3 text-sm text-gray-400">
                    {hasActiveFilters
                      ? t('sectionBuilder:sections.catalogList.noResults', 'No products match your search or filters.')
                      : t('sectionBuilder:sections.catalogList.noneFound', 'No products found')}
                  </p>
                  {hasActiveFilters && (
                    <button type="button" onClick={handleReset} className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700">
                      {t('sectionBuilder:sections.catalogList.resetFilters', 'Reset filters')}
                    </button>
                  )}
                </div>
              ) : (
                <div
                  className={`grid ${gridColsClass}`}
                  style={{ gap: `${gridGapPx}px` }}
                  data-testid="catalog-grid"
                >
                  {pagedProducts.map((product) => (
                    <ProductGridCard key={product.id} product={product} aspectClass={aspectClass} onNavigate={onNavigate} />
                  ))}
                </div>
              )}

              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </div>
        )}
      </StorefrontContainer>
    </section>
  );
}

export default memo(CatalogListRenderer);
