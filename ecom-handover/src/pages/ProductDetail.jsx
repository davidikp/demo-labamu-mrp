import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import PageHeader from '../components/ui/PageHeader';
import { fetchProductById, fetchCategories, updateProductPlatformStatus } from '../services/catalogService';

// ─── Badge / formatter constants ──────────────────────────────────────────────
const PLATFORM_BADGE = {
  published: { bg: '#DBEAFE', color: '#2563EB', label: 'Published' },
  draft:     { bg: '#F3F4F6', color: '#6B7280', label: 'Not Published' },
  archived:  { bg: '#F3F4F6', color: '#6B7280', label: 'Not Published' },
};

function formatPrice(val) {
  if (val == null) return '-';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(val);
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
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

// ─── Shared style tokens ──────────────────────────────────────────────────────
const LABEL_STYLE = {
  fontSize: '11px', color: '#9CA3AF',
  textTransform: 'uppercase', letterSpacing: '0.5px',
  marginBottom: '4px',
};

const DIVIDER_STYLE = { height: '1px', background: '#F3F4F6', margin: '20px 0' };

// ─── Toggle row ───────────────────────────────────────────────────────────────
function ToggleRow({ title, subtitle, on, onClick, loading }) {
  return (
    <div
      style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
    >
      <div>
        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1B1B1B' }}>{title}</div>
        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px', maxWidth: '180px' }}>
          {subtitle}
        </div>
      </div>
      <div style={{
        position: 'relative', flexShrink: 0,
        width: '44px', height: '24px', borderRadius: '12px',
        background: on ? '#006BFF' : '#E5E7EB',
        opacity: loading ? 0.6 : 1,
        transition: 'background 0.2s, opacity 0.2s',
      }}>
        <div style={{
          position: 'absolute', top: '2px',
          [on ? 'right' : 'left']: '2px',
          width: '20px', height: '20px',
          borderRadius: '50%', background: '#FFFFFF',
          transition: 'left 0.2s, right 0.2s',
        }} />
      </div>
    </div>
  );
}

// ─── Loading skeleton ─────────────────────────────────────────────────────────
function LoadingSkeleton({ isNarrow }) {
  const bar = (w, h = '14px', mb = '12px') => (
    <div style={{
      height: h, width: w, background: '#E9E9E9', borderRadius: '6px',
      animation: 'skeleton-pulse 1.4s ease-in-out infinite', marginBottom: mb,
    }} />
  );

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: isNarrow ? '1fr' : '360px 1fr 280px',
      minHeight: '500px',
    }}>
      <div style={{ padding: '24px', borderRight: isNarrow ? 'none' : '1px solid #F3F4F6' }}>
        <div style={{
          width: '100%', aspectRatio: '1', borderRadius: '8px',
          background: '#E9E9E9', animation: 'skeleton-pulse 1.4s ease-in-out infinite',
        }} />
      </div>
      <div style={{ padding: '32px', borderRight: isNarrow ? 'none' : '1px solid #F3F4F6' }}>
        {bar('28%', '20px', '14px')}
        {bar('72%', '22px', '8px')}
        {bar('38%', '14px', '6px')}
        {bar('22%', '12px', '24px')}
        {bar('52%', '18px', '12px')}
        {bar('88%', '14px', '0')}
      </div>
      <div style={{ padding: '24px', background: '#FAFAFA' }}>
        {bar('60%', '14px', '16px')}
        {bar('80%', '28px', '20px')}
        {bar('45%', '14px', '0')}
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct]           = useState(null);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [activeImage, setActiveImage]   = useState(0);
  const [imgError, setImgError]         = useState(false);
  const [categoryName, setCategoryName] = useState('');
  const [isToggling, setIsToggling]     = useState(false);

  const isNarrow = window.innerWidth < 1100;

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      setImgError(false);
      setActiveImage(0);
      try {
        const res = await fetchProductById(id);
        setProduct(res.data);
        if (res.data) {
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
    } finally {
      setIsToggling(false);
    }
  }

  // ── Card inner content ─────────────────────────────────────────────────────
  function renderCardContent() {
    if (loading) return <LoadingSkeleton isNarrow={isNarrow} />;

    if (error) {
      return (
        <div style={{ padding: '64px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#D0021B', margin: '0 0 4px' }}>
            Failed to load product
          </p>
          <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>{error}</p>
          <Button variant="tertiary" size="small" onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </div>
      );
    }

    if (!product) {
      return (
        <div style={{ padding: '64px', textAlign: 'center' }}>
          <p style={{ fontSize: '16px', color: '#6B7280', margin: '0 0 20px' }}>
            Product not found
          </p>
          <Button variant="tertiary" size="small" onClick={() => navigate('/catalog')}>
            Back to Catalog
          </Button>
        </div>
      );
    }

    const images = product.image_attached || [];
    const activeUrl = images[activeImage]?.document_public_url || images[activeImage]?.url || '';
    const badge = PLATFORM_BADGE[product.platform_status] || PLATFORM_BADGE.draft;
    const isPublished = product.platform_status === 'published';

    return (
      <div style={{
        display: 'grid',
        gridTemplateColumns: isNarrow ? '1fr' : '360px 1fr 280px',
        minHeight: '500px',
      }}>

        {/* ── LEFT: Images ──────────────────────────────────────────────────── */}
        <div style={{
          padding: '24px',
          borderRight: isNarrow ? 'none' : '1px solid #F3F4F6',
          borderBottom: isNarrow ? '1px solid #F3F4F6' : 'none',
        }}>
          {!imgError && activeUrl ? (
            <img
              src={activeUrl}
              alt={product.name}
              onError={() => setImgError(true)}
              style={{
                width: '100%', aspectRatio: '1', borderRadius: '8px',
                objectFit: 'cover', display: 'block', background: '#F9FAFB',
              }}
            />
          ) : (
            <div style={{
              width: '100%', aspectRatio: '1', borderRadius: '8px',
              background: '#F9FAFB', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              color: '#D1D5DB', fontSize: '16px', fontWeight: 600,
            }}>
              {product.sku}
            </div>
          )}

          {images.length > 1 && (
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
              {images.map((img, i) => {
                const thumbUrl = img.document_public_url || img.url || '';
                return (
                  <img
                    key={i}
                    src={thumbUrl}
                    alt={`${product.name} ${i + 1}`}
                    onClick={() => { setActiveImage(i); setImgError(false); }}
                    style={{
                      width: '64px', height: '64px', borderRadius: '6px',
                      objectFit: 'cover', cursor: 'pointer',
                      border: activeImage === i ? '2px solid #006BFF' : '2px solid transparent',
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ── MIDDLE: Product info ───────────────────────────────────────────── */}
        <div style={{
          padding: '32px',
          borderRight: isNarrow ? 'none' : '1px solid #F3F4F6',
          borderBottom: isNarrow ? '1px solid #F3F4F6' : 'none',
        }}>
          {/* Identity */}
          <span style={{
            display: 'inline-block', background: '#F3F4F6', color: '#4B5563',
            fontSize: '12px', fontWeight: 600, padding: '4px 12px', borderRadius: '999px',
          }}>
            {categoryName}
          </span>
          <div style={{ fontSize: '22px', fontWeight: 700, color: '#1B1B1B', marginTop: '10px', lineHeight: 1.3 }}>
            {product.name}
          </div>
          <div style={{ fontSize: '14px', color: '#9CA3AF', marginTop: '4px' }}>{product.sku}</div>
          <div style={{ fontSize: '12px', color: '#D1D5DB', marginTop: '2px' }}>{product.mrp_id}</div>

          <div style={DIVIDER_STYLE} />

          {/* Pricing row */}
          <div style={{ display: 'flex', gap: '40px' }}>
            <div>
              <div style={LABEL_STYLE}>Selling Price</div>
              <div style={{ fontSize: '22px', fontWeight: 700, color: '#1B1B1B' }}>
                {formatPrice(product.selling_price ?? product.price)}
              </div>
            </div>
            <div>
              <div style={LABEL_STYLE}>Lead Time</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: '#1B1B1B' }}>
                {product.lead_time || '-'}
              </div>
            </div>
          </div>

          <div style={DIVIDER_STYLE} />

          {/* Detail rows */}
          {[
            ['Category',     categoryName],
            ['Material',     product.primary_material || '-'],
            ['Weight',       product.gross_weight ? `${product.gross_weight} kg` : '-'],
            ['Source',       'Standard Catalog'],
            ['Created',      formatDate(product.created_at)],
            ['Last Updated', formatDate(product.updated_at)],
            ['Last Synced',  product.synced_at ? formatDate(product.synced_at) : 'Never'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', marginBottom: '12px' }}>
              <div style={{ width: '140px', fontSize: '13px', color: '#9CA3AF', flexShrink: 0 }}>
                {label}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 500, color: '#1B1B1B', flex: 1 }}>
                {value}
              </div>
            </div>
          ))}

          <div style={DIVIDER_STYLE} />

          {/* Description */}
          <div style={LABEL_STYLE}>Description</div>
          <div style={{ fontSize: '14px', color: '#4B5563', lineHeight: 1.7 }}>
            {product.description}
          </div>

          {/* Sales price table */}
          {product.sales_price?.length > 0 && (
            <>
              <div style={{ ...DIVIDER_STYLE, margin: '24px 0' }} />
              <div style={{ ...LABEL_STYLE, marginBottom: '12px' }}>Sales Price List</div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                <thead>
                  <tr style={{ background: '#F9FAFB' }}>
                    <th style={{ padding: '8px 12px', textAlign: 'left', color: '#9CA3AF', fontSize: '12px', fontWeight: 600 }}>
                      Currency
                    </th>
                    <th style={{ padding: '8px 12px', textAlign: 'right', color: '#9CA3AF', fontSize: '12px', fontWeight: 600 }}>
                      Price
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {product.sales_price.map((item, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid #F9FAFB' }}>
                      <td style={{ padding: '8px 12px', color: '#4B5563' }}>{item.currency_code}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 600, color: '#1B1B1B' }}>
                        {formatPriceByCurrency(item.price, item.currency_code)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        {/* ── RIGHT: Publish controls ────────────────────────────────────────── */}
        <div style={{ padding: '24px', background: '#FAFAFA' }}>
          <div style={{
            fontSize: '13px', fontWeight: 700, color: '#6B7280',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '20px',
          }}>
            Publish Controls
          </div>

          <div style={{ marginBottom: '20px' }}>
            <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '6px' }}>
              Publish Status
            </div>
            <span style={{
              padding: '6px 16px', borderRadius: '999px',
              fontSize: '13px', fontWeight: 600, display: 'inline-block',
              background: badge.bg, color: badge.color,
            }}>
              {badge.label}
            </span>
          </div>

          <div style={{ height: '1px', background: '#E9E9E9', margin: '0 0 20px 0' }} />

          <ToggleRow
            title="Show on Store"
            subtitle="Display this product on your online catalog"
            on={isPublished}
            onClick={handleTogglePublish}
            loading={isToggling}
          />

        </div>

      </div>
    );
  }

  return (
    <div style={{
      padding: '24px 32px', background: '#F4F4F4',
      fontFamily: "'Lato', sans-serif", minHeight: '100vh',
    }}>
      <style>{`
        @keyframes skeleton-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <PageHeader
          title="Product Detail"
          backPath="/catalog"
          breadcrumbs={[
            { label: 'Catalog', path: '/catalog' },
            { label: product?.name || (loading ? '…' : 'Product') },
          ]}
        />
      </div>

      {/* Main card */}
      <div style={{
        background: '#FFFFFF', borderRadius: '12px',
        border: '1px solid #E9E9E9', overflow: 'hidden',
      }}>
        {renderCardContent()}
      </div>
    </div>
  );
}
