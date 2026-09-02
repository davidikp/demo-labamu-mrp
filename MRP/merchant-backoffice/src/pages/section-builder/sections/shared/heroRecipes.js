/**
 * @module section-builder/sections/shared/heroRecipes
 * @description Internal visual "recipes" for hero_banner's `split_panel`
 * layout and `overlay_style: 'theme'` overlay — structural measurements,
 * gradient stops, and hero-context typography that are real, deliberate
 * visual decisions but NOT a "useful website-building decision" for a
 * merchant to hand-tune (panel ratio, gradient stop positions, exact radius
 * — see hero_banner/schema.js's field list, which deliberately excludes all
 * of this).
 *
 * This is NOT a second theme system: a recipe is an optional extra key
 * (`heroRecipe`) alongside a template's existing flat `theme.colors` /
 * `theme.typography` / `theme.layout` object (see state/siteTemplates.js) —
 * plain data, resolved the same way any other theme value is (a `theme`
 * prop already threaded through every Renderer), just not surfaced by
 * theme-settings-schema.json's merchant-facing Theme panel groups. It has
 * nothing to do with, and doesn't touch, the unrelated `themes/*.js`
 * 45-slot `--theme-*` CSS-variable system.
 *
 * `DEFAULT_HERO_RECIPE` is what any theme gets — including Xinear and every
 * other existing theme — when it doesn't set its own `heroRecipe`: a
 * reasonable, generic "split panel" look, not Houzez's exact numbers.
 * `HOUZEZ_HERO_RECIPE` carries the golden-reference HouzezPreview.jsx
 * values verbatim and is wired in only via `state/siteTemplates.js`'s
 * houzez template — Renderer.jsx never branches on a theme name.
 */

export const DEFAULT_HERO_RECIPE = {
  splitPanel: {
    heightDesktop: 480,
    heightMobile: 220,
    radiusDesktop: 20,
    radiusMobile: 16,
    contentWidthDesktop: '45%',
    contentWidthMobile: '90%',
    contentPaddingDesktop: '0 64px',
    contentPaddingMobile: '0 24px',
    imageWidthDesktop: '55%',
    imageWidthMobile: '100%',
    // Alpha curve for the surface-color blend painted over the image panel
    // (see colorUtils.buildLinearGradient) — base color is theme.colors.surface.
    blendDesktop: [{ offset: '0%', alpha: 1 }, { offset: '35%', alpha: 1 }, { offset: '75%', alpha: 0 }],
    blendMobile: [{ offset: '0%', alpha: 1 }, { offset: '20%', alpha: 1 }, { offset: '60%', alpha: 0 }],
  },
  overlayTheme: {
    widthDesktop: '60%',
    widthMobile: '100%',
    // Base color is theme.colors.primary.
    desktop: [{ offset: '0%', alpha: 0.85 }, { offset: '100%', alpha: 0 }],
    mobile: [{ offset: '0%', alpha: 0.85 }, { offset: '100%', alpha: 0.7 }],
  },
  // 'background' layout's full-bleed image focal point — 'center' at every
  // breakpoint matches the original hardcoded `bg-center` behavior exactly,
  // so every theme that doesn't set its own recipe (or sets one but leaves
  // this out) sees zero change.
  backgroundPosition: { desktop: 'center', mobile: 'center' },
  // 'cover' — the original, still-default behavior for every theme that
  // doesn't set its own recipe.
  backgroundSize: { desktop: 'cover', mobile: 'cover' },
  typography: {
    // context="hero" — the split_panel Main Hero's heading/subtitle.
    hero: {
      heading: { fontSizeDesktop: '40px', fontSizeMobile: '24px', fontWeight: 700, lineHeight: 1.15, maxWidthDesktop: '480px' },
      subtitle: { fontSizeDesktop: '18px', fontSizeMobile: '14px', lineHeight: 1.4, maxWidthDesktop: '560px' },
    },
    // context="hero_cta" — a 'background'-layout hero used as a branded CTA
    // banner (overlay_style: 'theme'), e.g. the Appointment section.
    heroCta: {
      heading: { fontSizeDesktop: '32px', fontSizeMobile: '32px', fontWeight: 700, lineHeight: 1.2, maxWidthDesktop: '560px' },
      subtitle: { fontSizeDesktop: '16px', fontSizeMobile: '16px', lineHeight: 1.5, maxWidthDesktop: '480px' },
    },
  },
  // No CTA-button geometry override for the generic recipe — ButtonBlock
  // falls back to the theme's ordinary `theme.buttons` config untouched, so
  // no theme sees any button change unless it supplies its own `ctaButton`.
  ctaButton: null,
};

/** Golden-reference HouzezPreview.jsx exact values (all read verbatim —
 * see the file:line references in each field's neighboring comment below). */
export const HOUZEZ_HERO_RECIPE = {
  splitPanel: {
    heightDesktop: 480, // HouzezPreview.jsx:818
    heightMobile: 160, // :818
    radiusDesktop: 24, // :817
    radiusMobile: 16, // :817
    contentWidthDesktop: '48%', // :827 flex: '0 0 48%'
    contentWidthMobile: '45%', // :827 flex: '0 0 45%'
    contentPaddingDesktop: '0 80px', // :831
    contentPaddingMobile: '0 12px', // :831
    imageWidthDesktop: '60%', // :860
    imageWidthMobile: '70%', // :860
    // linear-gradient(to right, #EDF3F0 0%, #EDF3F0 43%, rgba(237,243,240,0) 85%) — :877-879
    blendDesktop: [{ offset: '0%', alpha: 1 }, { offset: '43%', alpha: 1 }, { offset: '85%', alpha: 0 }],
    // linear-gradient(to right, #EDF3F0 0%, #EDF3F0 32%, rgba(237,243,240,0) 70%) — :877-879
    blendMobile: [{ offset: '0%', alpha: 1 }, { offset: '32%', alpha: 1 }, { offset: '70%', alpha: 0 }],
  },
  overlayTheme: {
    widthDesktop: '60%', // :1080 (appointment overlay width)
    widthMobile: '100%', // :1080
    // linear-gradient(to right, #16894B 0%, #16894B 75%, rgba(22,137,75,0.8) 85%, rgba(22,137,75,0) 100%) — :1083
    desktop: [{ offset: '0%', alpha: 1 }, { offset: '75%', alpha: 1 }, { offset: '85%', alpha: 0.8 }, { offset: '100%', alpha: 0 }],
    // linear-gradient(to right, rgba(22,137,75,0.95) 0%, rgba(22,137,75,0.9) 100%) — :1083
    mobile: [{ offset: '0%', alpha: 0.95 }, { offset: '100%', alpha: 0.9 }],
  },
  // backgroundPosition: isMobile ? 'center' : 'right center' — :1073
  backgroundPosition: { desktop: 'right center', mobile: 'center' },
  // houzez-appointment.png is a pre-composed mockup export — it already
  // bakes in its own green panel + "Book an Appointment!" copy on its left
  // ~43% (a leftover from however the asset was produced), which this
  // section's own real heading/subtext/overlay then render on top of.
  // 'cover' alone (scale ~1.2x at this image's aspect ratio) only crops
  // ~300px off the left edge — not enough to push the panel off-screen.
  // Needs >=176% at this image's aspect ratio/container proportions to
  // fully hide it (620px of a 1440px-wide image, right-anchored) — 190%
  // gives a safety margin while only trimming a modest, acceptable amount
  // off the photo's own top/bottom.
  backgroundSize: { desktop: '190% auto', mobile: 'cover' },
  typography: {
    // Main Hero (split_panel). fontSize 56/18px, fontWeight 800,
    // lineHeight 1.1, maxWidth 500px — :837-844
    hero: {
      heading: { fontSizeDesktop: '56px', fontSizeMobile: '18px', fontWeight: 800, lineHeight: 1.1, maxWidthDesktop: '500px' },
      // fontSize 18/9px, color #4B5563, lineHeight 1.4, maxWidth 600px — :846-854
      subtitle: { fontSizeDesktop: '18px', fontSizeMobile: '9px', color: '#4B5563', lineHeight: 1.4, maxWidthDesktop: '600px' },
    },
    // Appointment CTA (background + overlay_style: 'theme'). No isMobile
    // ternary on font size in the golden reference — same size at every
    // breakpoint. fontSize 40px, fontWeight 700, color #FFFFFF,
    // lineHeight 1.2, maxWidth 600px — :1094
    heroCta: {
      heading: { fontSizeDesktop: '40px', fontSizeMobile: '40px', fontWeight: 700, lineHeight: 1.2, maxWidthDesktop: '600px', color: '#FFFFFF' },
      // fontSize 18px, color #FFFFFF at opacity 0.9, lineHeight 1.5, maxWidth 500px — :1095
      subtitle: { fontSizeDesktop: '18px', fontSizeMobile: '18px', lineHeight: 1.5, maxWidthDesktop: '500px', color: '#FFFFFF', opacity: 0.9 },
    },
  },
  // Appointment CTA button — this exact geometry appears nowhere else in
  // HouzezPreview.jsx (its other buttons are 14px 28px / 8px radius / 15px
  // — a distinct, ordinary "primary" button style already reproduced by
  // theme.buttons/the 'filled' variant), so it stays scoped to the
  // 'hero_cta' context rather than becoming Houzez's global button style.
  // padding '14px 36px', borderRadius '12px', fontWeight 600, fontSize
  // '16px', border 'none', boxShadow '0 4px 12px rgba(0,0,0,0.1)' — :1100
  ctaButton: {
    paddingX: 36, paddingY: 14, radius: 12, fontSize: 16, fontWeight: 600,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', transition: 'all 0.2s ease',
  },
};

/** `theme.heroRecipe` (set only by templates that want a non-default
 * recipe, e.g. Houzez) falling back to the generic default — never a
 * theme-name conditional. */
export function resolveHeroRecipe(theme) {
  return theme?.heroRecipe ?? DEFAULT_HERO_RECIPE;
}
