import { memo } from 'react';
import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';
import EditableText from '../../ui/EditableText';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { useResponsiveMobile } from '../shared/useResponsiveMobile';

// Google's no-API-key iframe embed (?q=<address>&output=embed) geocodes the
// typed address itself — no lat/lng fields, no backend, no API key. Falls
// back to a plain placeholder when there's no address yet to geocode.
function mapEmbedSrc(address, zoom) {
  if (!address?.trim()) return null;
  return `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=${zoom ?? 14}&output=embed`;
}

function MapEmbedRenderer({ data, blocks = [], theme, mediaLibrary, onEdit, blockCtx, isMobile }) {
  const { t } = useTranslation();
  const mobile = useResponsiveMobile(isMobile);
  const height = mobile ? data.map_height_mobile ?? 250 : data.map_height ?? 400;
  const mapSrc = mapEmbedSrc(data.address, data.zoom_level);
  // theme.layout.image_corners is the existing generic "image corner
  // radius" token (previously unconsumed anywhere) — 4px is the fallback
  // for every theme that doesn't set it, matching this section's prior
  // hardcoded value exactly, so nothing regresses by wiring it in.
  const mapRadius = theme?.layout?.image_corners ?? 4;

  const hasAddressDetails = onEdit || data.address || data.store_hours || data.phone_number;
  const mapLeft = data.map_position === 'left';
  const prominent = data.heading_style === 'prominent';
  // Mobile always stacks text-above-map regardless of `map_position` — only
  // the desktop side differs. Full literal class strings (not string
  // interpolation) so Tailwind's build-time scanner can see both branches.
  const textOrderClass = mapLeft ? 'order-1 md:order-2' : 'order-1 md:order-1';
  const mapOrderClass = mapLeft ? 'order-2 md:order-1' : 'order-2 md:order-2';
  const addressColor = theme?.colors?.text_primary;

  return (
    <StorefrontContainer as="section" theme={theme}>
      <div className="grid grid-cols-1 items-center gap-8 md:gap-16 md:[grid-template-columns:minmax(400px,1.2fr)_minmax(300px,1fr)]">
        <div className={`relative flex w-full flex-col ${prominent ? '' : 'gap-4'} ${textOrderClass}`}>
          <BlockStream
            sectionType="map_embed"
            blocks={blocks}
            theme={theme}
            mediaLibrary={mediaLibrary}
            blockCtx={blockCtx}
            className={prominent ? 'flex flex-col' : 'flex flex-col gap-1'}
            isMobile={isMobile}
            // 'section' is the same opt-in `context` mechanism hero_banner's
            // CTA typography and contact_form's 'themed_form' fields use —
            // a section's own layout choice (`heading_style: 'prominent'`)
            // decides whether its heading/subtitle blocks resolve the
            // bolder content-section typography; the default style never
            // passes it, so every other map_embed section (and every
            // non-Houzez theme) renders exactly as before.
            context={prominent ? 'section' : undefined}
          />
          {data.show_address_text !== false && hasAddressDetails && (
            <div className={`space-y-3 text-sm ${prominent ? '' : 'text-gray-600'}`}>
              <div className="flex items-start gap-2">
                <MapPin size={18} className="mt-0.5 shrink-0" aria-hidden />
                {onEdit ? (
                  <EditableText
                    as="p"
                    multiline
                    style={prominent ? { fontSize: '15px', lineHeight: 1.6, color: addressColor } : undefined}
                    className={prominent && !addressColor ? 'text-gray-900' : undefined}
                    value={data.address}
                    placeholder={t('sectionBuilder:sections.mapEmbed.addressPlaceholder', 'Add your address…')}
                    onCommit={(v) => onEdit('address', v)}
                  />
                ) : (
                  data.address && (
                    <p style={prominent ? { fontSize: '15px', lineHeight: 1.6, color: addressColor } : undefined} className={prominent && !addressColor ? 'text-gray-900' : undefined}>
                      {data.address}
                    </p>
                  )
                )}
              </div>
              {onEdit ? (
                <EditableText
                  as="p"
                  multiline
                  className="whitespace-pre-line"
                  value={data.store_hours}
                  placeholder={t('sectionBuilder:sections.mapEmbed.storeHoursPlaceholder', 'Add store hours…')}
                  onCommit={(v) => onEdit('store_hours', v)}
                />
              ) : (
                data.store_hours && <p className="whitespace-pre-line">{data.store_hours}</p>
              )}
              {onEdit ? (
                <EditableText
                  as="p"
                  value={data.phone_number}
                  placeholder={t('sectionBuilder:sections.mapEmbed.phonePlaceholder', 'Add a phone number…')}
                  onCommit={(v) => onEdit('phone_number', v)}
                />
              ) : (
                data.phone_number && <p>{data.phone_number}</p>
              )}
            </div>
          )}
        </div>
        <div className={`relative w-full overflow-hidden bg-gray-200 ${mapOrderClass}`} style={{ height: `${height}px`, borderRadius: `${mapRadius}px` }}>
          {mapSrc ? (
            <>
              <iframe
                key={mapSrc}
                src={mapSrc}
                title={t('sectionBuilder:sections.mapEmbed.mapAriaLabel')}
                loading="lazy"
                className="h-full w-full border-0"
              />
              {/* In the editor, an iframe would swallow clicks before they
                  reach Canvas.jsx's section-select handler (iframe content is
                  a separate document — clicks inside it never bubble to the
                  parent). This transparent overlay keeps the map visible as a
                  live preview while still letting the merchant click through
                  to select the section; the published storefront (no onEdit)
                  renders the iframe fully interactive/pannable. */}
              {onEdit && <div className="absolute inset-0" aria-hidden="true" />}
            </>
          ) : (
            <div className="flex h-full items-center justify-center gap-1.5 text-sm text-gray-400">
              <MapPin size={16} aria-hidden /> {t('sectionBuilder:sections.mapEmbed.noAddress')}
            </div>
          )}
        </div>
      </div>
    </StorefrontContainer>
  );
}

export default memo(MapEmbedRenderer);
