import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import BlockStream from '../../ui/BlockStream';
import StorefrontContainer from '../../ui/primitives/StorefrontContainer';
import { resolveMedia } from '../../ui/fields/imageValue';
import { resolveColor } from '../../ui/fields/colorValue';
import { themedButtonStyle } from '../shared/themedButtonStyle';

// TODO(backend): submission, email notification, and rate limiting (US-9.1's
// AC) need a real endpoint — this renders the form fields only.
function ContactFormRenderer({ data, blocks = [], theme, mediaLibrary, blockCtx }) {
  const { t } = useTranslation();
  const isSplit = data.layout === 'split';
  const image = isSplit ? resolveMedia(data.image, mediaLibrary) : null;
  const buttonStyle = themedButtonStyle(theme.buttons, {
    primary: resolveColor({ slot: 'primary' }, theme.colors),
    primaryText: resolveColor({ slot: 'primary_text' }, theme.colors),
  });

  const form = (
    <div className={isSplit ? 'space-y-5' : 'relative max-w-md space-y-3'}>
      <BlockStream
        sectionType="contact_form"
        blocks={blocks}
        theme={theme}
        mediaLibrary={mediaLibrary}
        blockCtx={blockCtx}
        className={isSplit ? 'flex flex-col gap-5' : 'flex flex-col gap-3'}
        // 'themed_form' is the same opt-in `context` mechanism hero_banner's
        // CTA typography uses (see blockRenderers.jsx) — a section's own
        // layout choice (here, 'split') decides whether its blocks resolve
        // recipe-driven styling; the default 'form_only' layout never passes
        // it, so it renders exactly as before.
        context={isSplit ? 'themed_form' : undefined}
      />
      <span className="inline-block text-sm" style={buttonStyle}>{t('sectionBuilder:sections.contactForm.sendButton')}</span>
    </div>
  );

  if (!isSplit) {
    return <StorefrontContainer as="section" theme={theme}>{form}</StorefrontContainer>;
  }

  return (
    <StorefrontContainer as="section" theme={theme}>
      <div className="grid grid-cols-1 items-center gap-8 md:gap-16 md:[grid-template-columns:minmax(400px,1fr)_minmax(500px,1fr)]">
        {form}
        <div className="aspect-square w-full overflow-hidden rounded-2xl md:aspect-auto md:h-[600px]">
          {image ? (
            <img src={image.url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-100 text-sm text-gray-300">{t('sectionBuilder:sections.common.noImage')}</div>
          )}
        </div>
      </div>
    </StorefrontContainer>
  );
}

export default memo(ContactFormRenderer);
