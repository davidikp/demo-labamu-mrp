import { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Share2 } from 'lucide-react';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';
import { resolveStorefrontProducts, buildProductPath } from '../shared/productSource';
import { resolvePdpOptionGroups } from '../shared/productOptionsConfig';
import { useStorefrontCart } from '../shared/storefrontCartContext';
import { useSnackbar } from '../../../../contexts/SnackbarContext';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';

/** Other Picks' column count, resolved off the builder's canonical
 * `breakpoint` signal (themes/breakpoints.js) the same way catalog_list's
 * grid does (see catalog_list/Renderer.jsx's `resolveGridColsClass`) —
 * desktop 4 columns (matches the Figma "Catalog Detail" reference exactly),
 * tablet a deliberate 3-column middle tier, mobile 2. Falls back to
 * Tailwind responsive classes only for a real, un-framed browser viewport
 * (the eventual published storefront) where there is no explicit signal.
 */
function resolveRelatedColsClass(breakpoint) {
  if (breakpoint === 'mobile') return 'grid-cols-2';
  if (breakpoint === 'tablet') return 'grid-cols-3';
  if (breakpoint === 'desktop' || breakpoint === 'largeDesktop' || breakpoint === 'fit') return 'grid-cols-4';
  return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4';
}

/**
 * @module section-builder/sections/product_detail/Renderer
 * @description The storefront's functional Product Detail Page — gallery,
 * title/price, availability, description, visual-only options, quantity,
 * Add to Cart, and related products. `product` is resolved by the caller
 * (PreviewLive.jsx / ThemePreview.jsx) from the route's `:handle` via
 * `resolveStorefrontProductByHandle` and passed in as a prop; when no
 * `product` prop is given at all (the interactive builder canvas editing
 * the Product system page in the abstract, with no specific handle in the
 * URL), this falls back to the current theme's first real product purely
 * so there is something to preview/style against — that fallback is never
 * used on the real routed PreviewLive/ThemePreview path, which always
 * either has a real resolved product or renders a Not Found state instead
 * of this component (see those files).
 */
function ProductDetailRenderer({ data, theme, product: productProp, mediaLibrary, onEdit, isMobile, breakpoint, onNavigate }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  // Canonical breakpoint signal wins when known (builder canvas / PreviewLive
  // simulate device width, not a real browser viewport — see
  // useResponsiveMobile.js and catalog_list/Renderer.jsx's identical
  // pattern), falling back to the binary `mobile` flag for a real,
  // un-framed browser viewport where there is no such signal.
  const resolvedIsMobile = breakpoint ? breakpoint === 'mobile' : mobile;
  const { addItem } = useStorefrontCart();
  const snackbar = useSnackbar();

  const allProducts = useMemo(() => resolveStorefrontProducts(theme, mediaLibrary), [theme, mediaLibrary]);
  const product = productProp ?? allProducts[0] ?? null;

  const images = product?.images?.length ? product.images : product?.image ? [product.image] : [];
  const hasMultipleImages = images.length > 1;

  const optionGroups = useMemo(() => resolvePdpOptionGroups(theme), [theme]);

  // Gallery selection / options / quantity all need to reset whenever the
  // product itself changes (a different handle navigated to) — otherwise a
  // stale image index, a stale option pick, or a stale quantity from the
  // previous product could carry over. Rather than a `useEffect` that
  // fires an extra render after the product changes, this follows React's
  // documented "adjusting state during render" pattern: compare against a
  // ref of the last-seen handle right here, in the render body, and reset
  // synchronously if it changed — one render, no cascading effect.
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState(() =>
    Object.fromEntries(optionGroups.map((g) => [g.id, g.values[0]]))
  );
  const [quantity, setQuantity] = useState(1);
  const [lastHandle, setLastHandle] = useState(product?.handle);
  if (product?.handle !== lastHandle) {
    setLastHandle(product?.handle);
    setSelectedImage(0);
    setSelectedOptions(Object.fromEntries(optionGroups.map((g) => [g.id, g.values[0]])));
    setQuantity(1);
  }

  const stockIsNumeric = typeof product?.stock === 'number';
  const soldOut = stockIsNumeric ? product.stock <= 0 : product?.stock === 0;
  const maxQty = stockIsNumeric ? Math.max(product.stock, 0) : Infinity;

  const related = useMemo(() => {
    if (!product) return [];
    const others = allProducts.filter((p) => p.handle !== product.handle);
    const sameCategory = others.filter((p) => p.category && p.category === product.category);
    const rest = others.filter((p) => !(p.category && p.category === product.category));
    return [...sameCategory, ...rest].slice(0, 4);
  }, [allProducts, product]);

  if (!product) {
    return (
      <section className="px-6 py-16 text-center text-sm text-gray-500">
        {t('sectionBuilder:sections.common.noImage', 'No product available')}
      </section>
    );
  }

  const formattedPrice = typeof product.price === 'string' ? product.price : `$${Number(product.price ?? 0).toFixed(2)}`;
  const formattedCompareAt =
    typeof product.compareAtPrice === 'number'
      ? `$${product.compareAtPrice.toFixed(2)}`
      : typeof product.compareAtPrice === 'string'
        ? product.compareAtPrice
        : null;

  // Subtotal = quantity × unit price, formatted to match `formattedPrice`'s
  // own currency shape (a Rupiah-formatted theme like Houzez keeps its
  // "Rp"-prefixed grouped-thousands look for the subtotal too, not a stray
  // "$"). Uses `priceValue` (the numeric normalization productSource.js
  // already computes for every product, string-priced or not) so the
  // arithmetic is always a real number, never string concatenation.
  const unitPrice = typeof product.priceValue === 'number' ? product.priceValue : Number(product.price ?? 0);
  const currencyPrefixMatch = typeof product.price === 'string' ? product.price.match(/^\D*/) : null;
  const formatCurrency = (amount) =>
    currencyPrefixMatch ? `${currencyPrefixMatch[0]}${Math.round(amount).toLocaleString('id-ID')}` : `$${amount.toFixed(2)}`;
  const formattedSubtotal = formatCurrency(unitPrice * quantity);

  const handleQuantityChange = (delta) => {
    setQuantity((q) => Math.min(maxQty, Math.max(1, q + delta)));
  };

  const handleAddToCart = () => {
    if (soldOut) return;
    addItem({
      productId: product.id,
      handle: product.handle,
      name: product.name,
      image: product.image,
      price: product.priceValue ?? product.price,
      quantity,
      options: selectedOptions,
      stock: stockIsNumeric ? product.stock : null,
    });
    snackbar?.showSnackbar?.(t('sectionBuilder:sections.productDetail.addedToCart', '{{name}} added to cart', { name: product.name }), 'green');
  };

  const handleNavigate = (path) => {
    if (!onNavigate) return; // inert in the interactive builder
    onNavigate(path);
  };

  const relatedColsClass = resolveRelatedColsClass(breakpoint);

  return (
    <section className="bg-white">
      <StorefrontContainer theme={theme} maxWidth>
        {/* Breadcrumb: Home > {category} > {product name} */}
        <p className="mb-4 text-xs text-gray-500">
          <button
            type="button"
            onClick={() => handleNavigate('/')}
            className={onNavigate ? 'cursor-pointer hover:underline' : 'cursor-default'}
          >
            {t('sectionBuilder:sections.productDetail.home', 'Home')}
          </button>
          {product.category && (
            <>
              <span className="mx-1.5">›</span>
              <button
                type="button"
                onClick={() => handleNavigate('/shop')}
                className={onNavigate ? 'cursor-pointer hover:underline' : 'cursor-default'}
              >
                {product.category}
              </button>
            </>
          )}
          <span className="mx-1.5">›</span>
          <span className="text-gray-700">{product.name}</span>
        </p>

        <div className={`flex gap-10 ${resolvedIsMobile ? 'flex-col' : 'flex-row'}`}>
          {/* Gallery */}
          <div className={`flex flex-col gap-4 ${resolvedIsMobile ? 'w-full' : 'flex-1'}`}>
            <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              {images[selectedImage] ? (
                <img src={images[selectedImage]} alt={product.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-gray-300">
                  {t('sectionBuilder:sections.common.noImage')}
                </div>
              )}
            </div>
            {hasMultipleImages && (
              <div className={`flex gap-4 ${resolvedIsMobile ? 'overflow-x-auto' : ''}`}>
                {images.map((img, i) => {
                  const selected = i === selectedImage;
                  return (
                    <button
                      key={img + i}
                      type="button"
                      onClick={() => setSelectedImage(i)}
                      className={`aspect-square overflow-hidden rounded-xl bg-gray-100 ${
                        resolvedIsMobile ? 'w-16 shrink-0' : 'flex-1'
                      } ${selected ? 'border-2 p-[5px]' : ''}`}
                      style={selected ? { borderColor: resolveColor({ slot: 'primary' }, theme?.colors) } : undefined}
                      aria-label={t('sectionBuilder:sections.productDetail.viewImage', 'View image {{n}}', { n: i + 1 })}
                      aria-current={selected}
                    >
                      <img src={img} alt="" className="h-full w-full rounded-lg object-cover" />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Info panel */}
          <div className={`flex flex-col gap-10 ${resolvedIsMobile ? 'w-full' : 'flex-1'}`}>
            <div className="flex flex-col gap-7">
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-2xl font-medium">{product.name}</h2>
                  <Share2
                    size={18}
                    className={`mt-1 shrink-0 text-gray-400 ${onNavigate ? 'cursor-pointer hover:text-gray-600' : ''}`}
                    aria-label={t('sectionBuilder:sections.productDetail.share', 'Share')}
                  />
                </div>
                <p className="text-xl font-bold">
                  {formattedPrice}
                  {formattedCompareAt && <span className="ml-2 text-sm font-normal text-gray-400 line-through">{formattedCompareAt}</span>}
                </p>
              </div>

              {data.show_category !== false && product.category && (
                <p className="text-sm text-gray-500">{product.category}</p>
              )}

              <p className={`text-sm font-medium ${soldOut ? 'text-red-500' : 'text-green-600'}`}>
                {soldOut
                  ? t('sectionBuilder:sections.common.soldOut', 'Sold out')
                  : t('sectionBuilder:sections.productDetail.inStock', 'In stock')}
              </p>

              <div className="w-full border-t border-gray-200" />

              {/* Visual-only options — presentation only, never affect price/
                  stock/id/image. See productOptionsConfig.js. */}
              {optionGroups.map((group) => (
                <div key={group.id} className="flex flex-col gap-1.5">
                  <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">{group.label}</span>
                  <div className="flex flex-wrap gap-2">
                    {group.values.map((value) => {
                      const selected = selectedOptions[group.id] === value;
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setSelectedOptions((prev) => ({ ...prev, [group.id]: value }))}
                          aria-pressed={selected}
                          className={`rounded-md border px-3 py-1 text-sm ${
                            selected ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-300 text-gray-700'
                          }`}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              <div className={`flex w-full items-start justify-between gap-4 ${resolvedIsMobile ? 'flex-col' : 'flex-row'}`}>
                <div className={`flex flex-col gap-1.5 ${soldOut ? 'opacity-40' : ''}`}>
                  <div className="flex w-fit items-center gap-3 text-sm">
                    <button
                      type="button"
                      disabled={soldOut || quantity <= 1}
                      onClick={() => handleQuantityChange(-1)}
                      aria-label={t('sectionBuilder:sections.productDetail.decreaseQuantity', 'Decrease quantity')}
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 text-gray-600 disabled:opacity-40"
                    >
                      −
                    </button>
                    <span className="w-4 text-center font-medium">{quantity}</span>
                    <button
                      type="button"
                      disabled={soldOut || quantity >= maxQty}
                      onClick={() => handleQuantityChange(1)}
                      aria-label={t('sectionBuilder:sections.productDetail.increaseQuantity', 'Increase quantity')}
                      className="flex h-8 w-8 items-center justify-center rounded-full text-white disabled:opacity-40"
                      style={{ backgroundColor: resolveColor({ slot: 'primary' }, theme?.colors) }}
                    >
                      +
                    </button>
                  </div>
                  {stockIsNumeric && (
                    <span className="text-xs text-gray-500">
                      {product.stock} {t('sectionBuilder:sections.productDetail.stockAvailable', 'Stock Available')}
                    </span>
                  )}
                </div>

                <div className={`flex flex-col gap-0.5 ${resolvedIsMobile ? 'items-start text-left' : 'items-end text-right'}`}>
                  <span className="text-xs text-gray-500">{t('sectionBuilder:sections.productDetail.subtotal', 'Subtotal')}</span>
                  <span className="text-xl font-bold">{formattedSubtotal}</span>
                </div>
              </div>

              <div className="flex w-full gap-2">
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={handleAddToCart}
                  style={themedButtonStyle(theme?.buttons, {
                    variant: 'outline',
                    primary: resolveColor({ slot: 'primary' }, theme?.colors),
                    primaryText: resolveColor({ slot: 'primary_text' }, theme?.colors),
                  })}
                  className="flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {t('sectionBuilder:sections.productDetail.buyNow', 'Buy Now')}
                </button>
                <button
                  type="button"
                  disabled={soldOut}
                  onClick={handleAddToCart}
                  style={themedButtonStyle(theme?.buttons, {
                    primary: resolveColor({ slot: 'primary' }, theme?.colors),
                    primaryText: resolveColor({ slot: 'primary_text' }, theme?.colors),
                  })}
                  className="flex-1 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {soldOut ? t('sectionBuilder:sections.common.soldOut', 'Sold out') : t('sectionBuilder:sections.productDetail.addToCart', 'Add to cart')}
                </button>
              </div>
            </div>

            {product.description && (
              <div className="flex flex-col gap-4">
                <span
                  className="w-fit border-b-4 pb-3 text-sm font-semibold"
                  style={{ borderColor: resolveColor({ slot: 'primary' }, theme?.colors) }}
                >
                  {t('sectionBuilder:sections.productDetail.description', 'Description')}
                </span>
                <p className="text-sm opacity-80">{product.description}</p>
              </div>
            )}
          </div>
        </div>

        {data.show_related_products !== false && related.length > 0 && (
          <div className="mt-10 flex flex-col gap-6 border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between gap-4">
              {onEdit ? (
                <EditableText
                  as="h3"
                  className="text-lg font-bold"
                  value={data.related_heading}
                  placeholder={t('sectionBuilder:sections.productDetail.otherPicks', 'Other picks')}
                  onCommit={(v) => onEdit('related_heading', v)}
                />
              ) : (
                <h3 className="text-lg font-bold">{data.related_heading || t('sectionBuilder:sections.productDetail.otherPicks', 'Other picks')}</h3>
              )}
              <button
                type="button"
                onClick={() => handleNavigate('/shop')}
                className={`shrink-0 text-sm font-semibold ${onNavigate ? 'cursor-pointer hover:underline' : 'cursor-default'}`}
                style={{ color: resolveColor({ slot: 'primary' }, theme?.colors) }}
              >
                {t('sectionBuilder:sections.productDetail.seeAll', 'See All →')}
              </button>
            </div>
            <div className={`grid gap-4 ${relatedColsClass}`} data-testid="pdp-related-grid">
              {related.map((p) => {
                const relatedImages = p.images?.length ? p.images : p.image ? [p.image] : [];
                return (
                  <div
                    key={p.id}
                    onClick={() => handleNavigate(buildProductPath(p.handle))}
                    style={{ cursor: onNavigate ? 'pointer' : 'default' }}
                    className="flex flex-col gap-2"
                  >
                    <div className="relative aspect-[308/340] w-full overflow-hidden rounded-xl bg-gray-100">
                      {relatedImages[0] ? (
                        <img src={relatedImages[0]} alt={p.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xs text-gray-300">
                          {t('sectionBuilder:sections.common.noImage')}
                        </div>
                      )}
                      {relatedImages.length > 1 && (
                        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-1">
                          {relatedImages.map((img, i) => (
                            <span
                              key={img + i}
                              className={`rounded-full shadow-[0_0_4px_rgba(0,0,0,0.5)] ring-1 ring-white ${
                                i === 0 ? 'h-2.5 w-2.5' : 'h-1.5 w-1.5 bg-white'
                              }`}
                              style={i === 0 ? { backgroundColor: resolveColor({ slot: 'primary' }, theme?.colors) } : undefined}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <span
                      className="line-clamp-2 text-sm font-medium"
                      style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.4 }}
                    >
                      {p.name}
                    </span>
                    <span className="text-sm font-bold text-gray-900">{typeof p.price === 'string' ? p.price : `$${Number(p.price ?? 0).toFixed(2)}`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </StorefrontContainer>
    </section>
  );
}

export default memo(ProductDetailRenderer);
