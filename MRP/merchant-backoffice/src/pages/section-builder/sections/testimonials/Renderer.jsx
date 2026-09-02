import { memo } from 'react';
import { Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EditableText from '../../ui/EditableText';
import BlockBoundary from '../../ui/BlockBoundary';
import BlockStream from '../../ui/BlockStream';
import AddBlockControl from '../../ui/AddBlockControl';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { HEADING_SIZE_CLASS, DISPLAY_HEADING_CLASS } from '../shared/headingSize';
import { themedCardStyle } from '../shared/themedLayout';

const COLS_CLASS = { '2': 'sm:grid-cols-2', '3': 'sm:grid-cols-3' };
// Default falls back to the previous hardcoded value (a universally-recognised
// rating color) when a theme doesn't set `colors.rating` — themes opt into a
// different star color (e.g. Houzez's golden-reference #FACC15) via that
// token instead of this default ever changing globally.
const DEFAULT_STAR_COLOR = '#F59E0B';

function TestimonialsRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx }) {
  const { t } = useTranslation();
  const colsClass = COLS_CLASS[data.columns_desktop] ?? COLS_CLASS['3'];
  const starColor = theme?.colors?.rating ?? DEFAULT_STAR_COLOR;
  const quotes = blocks.filter((b) => b.type === 'quote');
  const genericBlocks = blocks.filter((b) => b.type !== 'quote');
  const isDisplayHeading = data.heading_size === 'display';
  // 'display' swaps in its own weight/leading wholesale (see headingSize.js)
  // instead of composing with the shared `font-semibold` + size-class idiom
  // every other heading_size step uses — and gets golden's 32px bottom
  // margin (mb-8) instead of the shared mb-6, scoped to this section only.
  const headingClass = isDisplayHeading
    ? `mb-8 ${DISPLAY_HEADING_CLASS} text-gray-900`
    : `mb-6 font-semibold text-gray-900 ${HEADING_SIZE_CLASS[data.heading_size] ?? HEADING_SIZE_CLASS.medium}`;
  // Only the radius comes from the theme's card recipe — `card_shadow` is a
  // hover-affordance token meant for clickable product cards (see
  // shared/ProductCard.jsx), not a resting testimonial card; applying it
  // here unconditionally doesn't match any theme's actual card design
  // (the golden reference's testimonial cards have a border only, no shadow).
  const { borderRadius } = themedCardStyle(theme?.layout);
  const nameFirst = data.card_hierarchy === 'name_first';
  const bodyColor = theme?.colors?.text_secondary;

  return (
    <StorefrontContainer as="section" theme={theme}>
      {data.show_heading !== false &&
        (onEdit ? (
          <EditableText
            as="h2"
            className={headingClass}
            value={data.heading}
            placeholder={t('sectionBuilder:sections.testimonials.defaultHeading')}
            onCommit={(v) => onEdit('heading', v)}
          />
        ) : (
          <h2 className={headingClass}>{data.heading || t('sectionBuilder:sections.testimonials.defaultHeading')}</h2>
        ))}

      {(genericBlocks.length > 0 || blockCtx) && (
        <BlockStream sectionType="testimonials" blocks={genericBlocks} theme={theme} mediaLibrary={mediaLibrary} blockCtx={blockCtx} hideAdd className="mb-6 flex flex-col gap-3" />
      )}

      {quotes.length === 0 && !blockCtx ? (
        <p className="text-sm text-gray-400">{t('sectionBuilder:sections.testimonials.emptyState')}</p>
      ) : (
        <div className={`grid grid-cols-1 gap-6 ${colsClass}`}>
          {quotes.map((b) => {
            const nameEl = blockCtx ? (
              <EditableText
                className={nameFirst ? 'mb-3 block text-base font-bold' : 'text-xs font-medium text-gray-500'}
                style={nameFirst ? { color: theme?.colors?.text_primary } : undefined}
                value={b.data?.reviewer_name}
                placeholder={t('sectionBuilder:sections.testimonials.defaultAuthor')}
                onCommit={(v) => blockCtx.onEdit(b.id, 'reviewer_name', v)}
              />
            ) : (
              <p
                className={nameFirst ? 'mb-3 text-base font-bold' : 'text-xs font-medium text-gray-500'}
                style={nameFirst ? { color: theme?.colors?.text_primary } : undefined}
              >
                {b.data?.reviewer_name || t('sectionBuilder:sections.testimonials.defaultAuthor')}
              </p>
            );
            const quoteEl = blockCtx ? (
              <EditableText
                as="p"
                multiline
                className="mb-2 text-sm text-gray-700"
                style={{ color: bodyColor }}
                value={b.data?.quote}
                placeholder={t('sectionBuilder:sections.testimonials.defaultQuote')}
                onCommit={(v) => blockCtx.onEdit(b.id, 'quote', v)}
              />
            ) : (
              <p className="mb-2 text-sm text-gray-700" style={{ color: bodyColor }}>
                "{b.data?.quote || t('sectionBuilder:sections.testimonials.defaultQuote')}"
              </p>
            );
            return (
              <BlockBoundary
                key={b.id}
                selected={blockCtx?.selectedBlockId === b.id}
                onSelect={blockCtx ? () => blockCtx.onSelect(b.id) : undefined}
                label={t('sectionBuilder:sections.testimonials.blockLabel', 'Testimonial')}
              >
                <div className="h-full border border-gray-200 bg-white p-6" style={{ borderRadius }}>
                  <div className="mb-4 flex gap-1" style={{ color: starColor }}>
                    {Array.from({ length: Number(b.data?.star_rating ?? 5) }).map((_, i) => (
                      <Star key={i} size={24} fill={starColor} stroke={starColor} />
                    ))}
                  </div>
                  {nameFirst ? (
                    <>
                      {nameEl}
                      {quoteEl}
                    </>
                  ) : (
                    <>
                      {quoteEl}
                      {nameEl}
                    </>
                  )}
                </div>
              </BlockBoundary>
            );
          })}
        </div>
      )}

      {blockCtx && (blockCtx.selectedBlockId || blockCtx.sectionActive) && !blockCtx.atMax && (
        <div className="mt-4"><AddBlockControl sectionType="testimonials" atMax={false} onAdd={(ty) => blockCtx.onAdd(ty)} variant="canvas" /></div>
      )}
    </StorefrontContainer>
  );
}

export default memo(TestimonialsRenderer);
