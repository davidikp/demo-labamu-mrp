import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchProductById, fetchCategories, updateProductPlatformStatus } from '../services/catalogService';
import { useSnackbar } from '../contexts/SnackbarContext';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatPrice(val) {
  if (val == null) return '-';
  const n = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(val);
  return `IDR ${n}`;
}

function formatPriceByCurrency(val, currency) {
  if (val == null) return '-';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency', currency: currency || 'IDR',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(val);
  } catch {
    return `${currency} ${val}`;
  }
}

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Availability toggle (matches Figma toggle card style) ───────────────────
function ToggleCard({ title, subtitle, on, onClick, loading }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '12px',
      padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.096px' }}>
          {title}
        </span>
        {/* Toggle */}
        <div
          onClick={!loading ? onClick : undefined}
          style={{
            width: '44px', height: '24px', borderRadius: '999px',
            background: on ? '#006BFF' : '#D1D5DB',
            position: 'relative', cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s', flexShrink: 0,
            opacity: loading ? 0.5 : 1,
          }}
        >
          <div style={{
            position: 'absolute', top: '3px',
            left: on ? 'calc(100% - 21px)' : '3px',
            width: '18px', height: '18px', borderRadius: '50%',
            background: '#FFFFFF', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </div>
      </div>
      <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", lineHeight: '20px', letterSpacing: '0.096px' }}>
        {subtitle}
      </p>
    </div>
  );
}

// ─── Detail row ───────────────────────────────────────────────────────────────
function DetailRow({ label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
      <div style={{ width: '120px', flexShrink: 0, fontSize: '14px', color: '#A9A9A9', fontFamily: "'Lato', sans-serif", letterSpacing: '0.096px' }}>
        {label}
      </div>
      <div style={{ fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", flex: 1, letterSpacing: '0.096px' }}>
        {value || '-'}
      </div>
    </div>
  );
}

// ─── Loading state ────────────────────────────────────────────────────────────
function LoadingState() {
  const bar = (w, h = '14px') => (
    <div style={{ height: h, width: w, background: '#E9E9E9', borderRadius: '6px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
  );
  return (
    <div style={{ display: 'flex', gap: '24px', padding: '24px' }}>
      <div style={{ width: '280px', flexShrink: 0 }}>
        <div style={{ width: '100%', aspectRatio: '1', borderRadius: '12px', background: '#E9E9E9', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '8px' }}>
        {bar('28%', '20px')}
        {bar('72%', '28px')}
        {bar('40%', '14px')}
        {bar('30%', '20px')}
        {[0,1,2,3,4].map(i => <div key={i} style={{ display: 'flex', gap: '16px' }}>{bar('30%')}{bar('50%')}</div>)}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();

  const [product, setProduct]         = useState(null);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [imgError, setImgError]       = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isToggling, setIsToggling]   = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true); setError(null); setImgError(false); setActiveImage(0);
      try {
        const res = await fetchProductById(id);
        setProduct(res.data);
        if (res.data?.category_id) {
          const catRes = await fetchCategories({ status: 'ACTIVE', size: 100 });
          const cat = (catRes.data || []).find(c => c.id === res.data.category_id);
          setCategoryName(cat?.name || res.data.category_id || '');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  async function handleTogglePublish() {
    if (isToggling || !product) return;
    const newStatus = product.platform_status === 'published' ? 'draft' : 'published';
    const prev = product.platform_status;
    setProduct(p => ({ ...p, platform_status: newStatus }));
    setIsToggling(true);
    try {
      const res = await updateProductPlatformStatus(product.id, newStatus);
      setProduct(res.data ?? res);
    } catch {
      setProduct(p => ({ ...p, platform_status: prev }));
      showSnackbar('Failed to update product status', 'error');
    } finally {
      setIsToggling(false);
    }
  }

  const images = product?.image_attached || [];
  const activeUrl = images[activeImage]?.document_public_url || images[activeImage]?.url || '';
  const isPublished = product?.platform_status === 'published';

  return (
    <div style={{ padding: '24px', background: '#F4F4F4', fontFamily: "'Lato', sans-serif" }}>
      <style>{`
        @keyframes skeleton-pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes loading-dot { 0%,80%,100% { transform:scale(0.6); opacity:0.4; } 40% { transform:scale(1); opacity:1; } }
      `}</style>

      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <button onClick={() => navigate('/catalog')} style={{
              background: 'none', border: 'none', cursor: 'pointer', padding: '2px',
              display: 'flex', alignItems: 'center', color: '#282828',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <h1 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828', letterSpacing: '0.18px' }}>
              Catalog Detail
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', paddingLeft: '24px', fontSize: '14px', color: '#7E7E7E' }}>
            <Link to="/catalog" style={{ color: '#7E7E7E', textDecoration: 'none' }}
              onMouseEnter={e => e.currentTarget.style.color = '#282828'}
              onMouseLeave={e => e.currentTarget.style.color = '#7E7E7E'}>
              Catalog
            </Link>
            <span>/</span>
            <span>{loading ? '…' : (product?.name || 'Product')}</span>
          </div>
        </div>

        {/* Share Product Link button */}
        {!loading && product && (
          <button
            onClick={() => {
              navigator.clipboard?.writeText(window.location.href).catch(() => {});
              showSnackbar('Product link copied to clipboard', 'success');
            }}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              height: '33px', padding: '0 12px', borderRadius: '8px',
              border: '1px solid #006BFF', background: '#FFFFFF',
              color: '#006BFF', fontSize: '14px', cursor: 'pointer',
              fontFamily: "'Lato', sans-serif", flexShrink: 0,
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Share Product Link
          </button>
        )}

      </div>

      {/* ── Error state ───────────────────────────────────────────────────────── */}
      {error && !loading && (
        <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '64px', textAlign: 'center' }}>
          <p style={{ margin: '0 0 4px', fontSize: '16px', color: '#D0021B' }}>Failed to load product</p>
          <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#7E7E7E' }}>{error}</p>
          <button onClick={() => navigate('/catalog')} style={{
            border: 'none', background: 'none', color: '#006BFF', cursor: 'pointer', fontSize: '14px', fontFamily: "'Lato', sans-serif",
          }}>← Back to Catalog</button>
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────────────────────── */}
      {!error && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>

          {/* Left column: main card */}
          <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', overflow: 'hidden' }}>
              {loading ? <LoadingState /> : !product ? (
                <div style={{ padding: '64px', textAlign: 'center' }}>
                  <p style={{ margin: '0 0 16px', fontSize: '16px', color: '#7E7E7E' }}>Product not found</p>
                  <button onClick={() => navigate('/catalog')} style={{ border: 'none', background: 'none', color: '#006BFF', cursor: 'pointer', fontSize: '14px', fontFamily: "'Lato', sans-serif" }}>← Back to Catalog</button>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '24px', padding: '20px' }}>

                  {/* Image gallery */}
                  <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Main image */}
                    <div style={{ width: '100%', aspectRatio: '1', borderRadius: '14px', overflow: 'hidden', background: '#F4F4F4' }}>
                      {!imgError && activeUrl ? (
                        <img src={activeUrl} alt={product.name} onError={() => setImgError(true)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                        />
                      ) : (
                        <div style={{
                          width: '100%', height: '100%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#A9A9A9', fontSize: '20px', fontWeight: 700,
                          fontFamily: "'Lato', sans-serif",
                        }}>
                          {product.sku}
                        </div>
                      )}
                    </div>
                    {/* Thumbnails */}
                    {images.length > 1 && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {images.map((img, i) => {
                          const thumb = img.document_public_url || img.url || '';
                          return (
                            <div key={i} onClick={() => { setActiveImage(i); setImgError(false); }}
                              style={{
                                width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden',
                                border: activeImage === i ? '2px solid #A9A9A9' : '1px solid #F4F4F4',
                                cursor: 'pointer', background: '#F4F4F4', flexShrink: 0,
                              }}>
                              <img src={thumb} alt={`${product.name} ${i + 1}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: activeImage === i ? 0.5 : 0.9 }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Product info */}
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '16px' }}>

                    {/* Category chip + meta */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      {categoryName && (
                        <span style={{
                          background: '#F4F4F4', borderRadius: '8px', padding: '4px 12px',
                          fontSize: '14px', fontWeight: 700, color: '#282828',
                          fontFamily: "'Lato', sans-serif", whiteSpace: 'nowrap',
                        }}>
                          {categoryName}
                        </span>
                      )}
                    </div>

                    {/* Name + IDs */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <h2 style={{ margin: 0, fontSize: '26px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", letterSpacing: '0.18px', lineHeight: 1.3 }}>
                        {product.name}
                      </h2>
                      {product.description && (
                        <p style={{ margin: 0, fontSize: '14px', color: '#7E7E7E', fontFamily: "'Lato', sans-serif", lineHeight: '20px', letterSpacing: '0.096px' }}>
                          {product.description}
                        </p>
                      )}
                    </div>

                    {/* Price */}
                    <p style={{ margin: 0, fontSize: '16px', color: '#282828', fontFamily: "'Lato', sans-serif", lineHeight: '22px', letterSpacing: '0.11px' }}>
                      {formatPrice(product.selling_price ?? product.price)}
                    </p>

                    {/* Divider */}
                    <div style={{ height: '1px', background: '#E9E9E9' }} />

                    {/* Detail rows */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {[
                        ['SKU',          product.sku],
                        ['Category',     categoryName],
                        ['Material',     product.primary_material],
                        ['Weight',       product.gross_weight ? `${product.gross_weight} kg` : null],
                        ['Lead Time',    product.lead_time],
                        ['Source',       'Standard Catalog'],
                        ['Created',      formatDate(product.created_at)],
                        ['Last Updated', formatDate(product.updated_at)],
                        ['Last Synced',  product.synced_at ? formatDate(product.synced_at) : '01 Jun 2026'],
                      ].filter(([, v]) => v).map(([label, value]) => (
                        <DetailRow key={label} label={label} value={value} />
                      ))}
                    </div>

                  </div>
                </div>
              )}
            </div>

            {/* Sales Price List — separate card */}
            {!loading && product?.sales_price?.length > 0 && (
              <div style={{ background: '#FFFFFF', borderRadius: '12px', border: '1px solid #E9E9E9', padding: '20px' }}>
                <p style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif" }}>
                  Sales Price List
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th style={{ padding: '8px 0', textAlign: 'left', fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", borderBottom: '1px solid #D4D4D4' }}>Currency</th>
                      <th style={{ padding: '8px 0', textAlign: 'right', fontSize: '14px', fontWeight: 700, color: '#282828', fontFamily: "'Lato', sans-serif", borderBottom: '1px solid #D4D4D4' }}>Price</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.sales_price.map((item, i) => (
                      <tr key={i}>
                        <td style={{ padding: '12px 0', fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", borderBottom: '1px solid #F4F4F4' }}>{item.currency_code}</td>
                        <td style={{ padding: '12px 0', textAlign: 'right', fontSize: '14px', color: '#282828', fontFamily: "'Lato', sans-serif", borderBottom: '1px solid #F4F4F4' }}>
                          {formatPriceByCurrency(item.price, item.currency_code)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right column: publish controls */}
          <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '12px' }}>

            {/* Show on Store toggle card */}
            {!loading && product && (
              <ToggleCard
                title="Show on Store"
                subtitle="Display this product on your online catalog"
                on={isPublished}
                onClick={handleTogglePublish}
                loading={isToggling}
              />
            )}

            {/* Loading skeleton for right panel */}
            {loading && [0, 1].map(i => (
              <div key={i} style={{ background: '#FFFFFF', border: '1px solid #E9E9E9', borderRadius: '12px', padding: '16px', height: '80px', animation: 'skeleton-pulse 1.4s ease-in-out infinite' }} />
            ))}
          </div>

        </div>
      )}
    </div>
  );
}
