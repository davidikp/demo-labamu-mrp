import { defaultsForSchema } from '../sections/schemaDefaults';
import { schemaForType } from '../sections/index';
import { seedBlocks, sectionSupportsBlocks } from '../sections/blockHelpers';
import { blockDef } from '../sections/blocks/registry';
import { defaultTheme, createDefaultGlobals } from './defaultTheme';
import { defaultProductItems } from '../sections/featured_products/schema';
import { HOUZEZ_HERO_RECIPE } from '../sections/shared/heroRecipes';
import { HOUZEZ_FORM_RECIPE } from '../sections/shared/formRecipes';
import { HOUZEZ_NAV_RECIPE } from '../sections/shared/navRecipes';
import { HOUZEZ_HIGH_RISE_PRODUCTS, HOUZEZ_SAFETY_PRODUCTS, HOUZEZ_PRODUCTS } from '../mocks/houzezProducts';

/**
 * @module section-builder/state/siteTemplates
 * @description Business-type "site templates" — each bundles a visual theme
 * (same `{typography, colors}` shape as `sections/themePresets.js`), a
 * header/footer content override, a bundled media library (real,
 * free-license stock photography under public/assets/templates/<id>/), and
 * a default page/section scaffold — reusing only existing section types (no
 * new renderers). Templates are named after business-type flavors purely as
 * a naming convention for the picker UI — this has no relationship to any
 * actual merchant business-type/industry selection elsewhere in the app.
 *
 * Two distinct application modes (see builderReducer.js):
 *  - "seed" (APPLY_SITE_TEMPLATE_SEED): first-ever template pick for a site —
 *    replaces theme, pages, header/footer, AND media library.
 *  - "reskin" (APPLY_SITE_TEMPLATE_RESKIN): switching templates afterwards —
 *    replaces theme.colors/typography only. Page structure, section
 *    arrangement, header/footer content, media, and any section
 *    customization are left untouched.
 *
 * Image fields don't hold a URL — they hold `{ mediaId }`, resolved against
 * the store's mediaLibrary (see ui/fields/imageValue.js). `media(...)` below
 * builds real media-library-shaped records; `image(mediaId)` builds the
 * `{ mediaId }` reference an image field expects.
 */

function defaultSection(id, type, overrides = {}, customBlocks) {
  return {
    id,
    type,
    data: { ...defaultsForSchema(schemaForType(type)), ...overrides },
    ...(customBlocks !== undefined
      ? { blocks: customBlocks }
      : sectionSupportsBlocks(type) ? { blocks: seedBlocks(type) } : {}),
  };
}

function image(mediaId) {
  return { mediaId };
}

/** A hand-authored block with real content, merged over that block type's
 * own field defaults — used where a template needs specific copy in blocks
 * that `seedBlocks`' generic presets wouldn't produce (e.g. a hero banner
 * with no button preset, or a testimonials section with real quotes). */
function block(type, overrides = {}) {
  const def = blockDef(type);
  return { id: crypto.randomUUID(), type, data: { ...defaultsForSchema(def?.fields ?? {}), ...overrides } };
}

/** Photos are free-license stock (Unsplash License / Pexels License — free
 * for commercial use, no attribution required), downloaded once into
 * public/assets/templates/<id>/ rather than hotlinked. */
function media(templateId, entries) {
  return entries.map(({ key, filename, width, height }) => ({
    id: `${templateId}-${key}`,
    filename,
    url: `/assets/templates/${templateId}/${filename}`,
    width,
    height,
    uploadedAt: '2026-01-01T00:00:00.000Z',
  }));
}

export const SITE_TEMPLATES = [
  {
    id: 'clothing',
    name: 'Clothing',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Lora', heading_size: 'large', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#ffffff', surface: '#f5f2ef', primary: '#1a1a1a', primary_text: '#ffffff',
        accent: '#b08968', accent_text: '#ffffff', text_primary: '#1a1a1a', text_secondary: '#6b6b6b', border: '#e5e0da',
      },
      // Visual-only Product Detail option chips (Size) — presentation only,
      // never affects price/stock/id (see sections/shared/
      // productOptionsConfig.js). Houzez's construction catalog has no such
      // config, so its PDP renders no option selector at all.
      pdpOptions: { groups: [{ id: 'size', label: 'Size', values: ['S', 'M', 'L', 'XL'] }] },
    },
    // Editorial, minimal identity — logo left, nav inline (Renderer.jsx's
    // default layout), plain-text logo.
    header: { layout_variant: 'inline', logo_text: 'Horizon & Co.' },
    // Centered, editorial footer to match the inline header's understated,
    // minimal identity — no link columns competing for attention.
    footer: { layout_variant: 'centered-tagline', tagline: 'Considered essentials, made to last.' },
    media: media('clothing', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 801 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('clothing-home-hero', 'hero_banner', { background_image: image('clothing-hero') }),
          defaultSection('clothing-home-announcement', 'announcement_bar'),
          // Explicit collections list (rather than the "show everything"
          // fallback) so this theme's category row stays exactly what it
          // was before mocks/catalog.json grew Xinear's 6 apparel
          // collections alongside these — unaffected by that addition.
          defaultSection('clothing-home-catalog', 'collection_list', {
            heading: 'Shop by category',
            collections: [
              { id: 'clothing-cat-best-sellers', handle: 'best-sellers' },
              { id: 'clothing-cat-new-arrivals', handle: 'new-arrivals' },
            ],
          }),
          defaultSection('clothing-home-lifestyle', 'image_with_text', { image: image('clothing-secondary'), image_position: 'right' }),
          defaultSection('clothing-home-featured', 'featured_products', { heading: 'New arrivals' }),
          defaultSection('clothing-home-testimonials', 'testimonials'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('clothing-about-brand', 'brand_values', { heading: 'Why shop with us' }),
          defaultSection('clothing-about-team', 'team_about'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [defaultSection('clothing-contact-form', 'contact_form')],
      },
    ],
  },
  {
    id: 'fnb',
    name: 'Food & Beverage',
    theme: {
      typography: { heading_font: 'Cormorant Garamond', body_font: 'Nunito', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        background: '#faf6f0', surface: '#f0e8dc', primary: '#6b4f3b', primary_text: '#ffffff',
        accent: '#b5651d', accent_text: '#ffffff', text_primary: '#3a2e22', text_secondary: '#7a6a58', border: '#e0d3bf',
      },
    },
    // Energetic, layered identity — slim caps nav bar above a big bold
    // logo row (Renderer.jsx's 'stacked-bold' variant).
    header: { layout_variant: 'stacked-bold', logo_text: 'Savor Kitchen' },
    // Full columns footer — layered and generous, matching the stacked-bold
    // header's energetic, content-rich identity.
    footer: { layout_variant: 'columns', tagline: 'Fresh, seasonal, made with care.' },
    media: media('fnb', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 800 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-home-hero', 'hero_banner', { background_image: image('fnb-hero') }),
          defaultSection('fnb-home-announcement', 'announcement_bar'),
          defaultSection('fnb-home-catalog', 'featured_products', { heading: 'Our menu' }),
          defaultSection('fnb-home-interior', 'image_with_text', { image: image('fnb-secondary'), image_position: 'left' }),
          defaultSection('fnb-home-testimonials', 'testimonials'),
          defaultSection('fnb-home-map', 'map_embed'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-about-brand', 'brand_values', { heading: 'Why dine with us' }),
          defaultSection('fnb-about-team', 'team_about'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('fnb-contact-form', 'contact_form'),
          defaultSection('fnb-contact-map', 'map_embed'),
        ],
      },
    ],
  },
  {
    id: 'manufacture',
    name: 'Manufacture',
    theme: {
      typography: { heading_font: 'Montserrat', body_font: 'Inter', heading_size: 'medium', body_size: 'medium', letter_spacing: 'wide', heading_transform: 'none' },
      colors: {
        background: '#ffffff', surface: '#eef2f7', primary: '#1f2a44', primary_text: '#ffffff',
        accent: '#3d6bff', accent_text: '#ffffff', text_primary: '#1a1a1a', text_secondary: '#5c6470', border: '#dbe1ea',
      },
    },
    // Clean, symmetric, corporate identity — nav split left/right around a
    // centered logo (Renderer.jsx's 'centered-split' variant).
    header: { layout_variant: 'centered-split', logo_text: 'Meridian Industrial' },
    // Minimal single-row footer — clean and corporate, matching the
    // centered-split header's symmetric, no-frills identity.
    footer: { layout_variant: 'minimal-bar', tagline: 'Precision manufacturing, built to spec.' },
    media: media('manufacture', [
      { key: 'hero', filename: 'hero.jpg', width: 1600, height: 1067 },
      { key: 'secondary', filename: 'secondary.jpg', width: 1200, height: 817 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('manufacture-home-hero', 'hero_banner', { background_image: image('manufacture-hero') }),
          defaultSection('manufacture-home-brand', 'brand_values', { heading: 'Our capabilities' }),
          defaultSection('manufacture-home-facility', 'image_with_text', { image: image('manufacture-secondary'), image_position: 'right' }),
          defaultSection('manufacture-home-catalog', 'featured_products', { heading: 'Our products' }),
          defaultSection('manufacture-home-logos', 'press_logos'),
          defaultSection('manufacture-home-faq', 'faq_accordion'),
        ],
      },
      {
        id: 'about', name: 'About', type: 'system', slug: '/about', seo: {}, hiddenFromNav: false,
        sections: [
          defaultSection('manufacture-about-team', 'team_about'),
          defaultSection('manufacture-about-faq', 'faq_accordion'),
        ],
      },
      {
        id: 'contact', name: 'Contact', type: 'system', slug: '/contact', seo: {}, hiddenFromNav: false,
        sections: [defaultSection('manufacture-contact-form', 'contact_form', { reply_to_email: '' })],
      },
    ],
  },
  {
    id: 'xinear',
    name: 'Xinear',
    // Sourced from Xinear's real Figma homepage design — a single-page
    // (home-only) clothing storefront. Unlike clothing/fnb/manufacture,
    // there is no about/contact secondary page in the source design, so
    // this template intentionally has only a `home` page — not an
    // oversight, just an honest reflection of the reference scope.
    theme: {
      typography: { heading_font: 'Lato', body_font: 'Lato', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        // accent intentionally equals primary — Xinear's real design is
        // deliberately monochrome/near-black, no separate accent hue.
        background: '#ffffff', surface: '#f4f4f4', primary: '#20201e', primary_text: '#ffffff',
        accent: '#20201e', accent_text: '#ffffff', text_primary: '#1b1916', text_secondary: '#767573', border: '#e8e8e8',
      },
    },
    header: {
      layout_variant: 'centered-nav',
      logo_text: 'Xinear',
      logo_image: image('xinear-logo'),
      show_border: true,
      show_language_switcher: true,
      show_search_icon: false,
      show_cart_icon: true,
    },
    // Content > Menus (US-Content.1) — the header no longer stores its nav
    // inline (see header/schema.js's `nav_menu_ref`); a template instead
    // seeds `menus['main-menu'].items` directly, merged over
    // createDefaultGlobals' auto-derived defaults the same way
    // `header`/`footer` above merge over their own schema defaults (see
    // siteTemplateApply.js and defaultPreviewDataFor below). Every item
    // needs a stable, unique `id` — MenuEditorPopup's reorder controls (and,
    // before this change, RepeaterField's dnd-kit drag handles) both depend
    // on it, and hand-authored template data doesn't get one for free like
    // an item added via "Add item" (crypto.randomUUID()) does.
    menus: {
      'main-menu': {
        items: [
          { id: 'xinear-nav-home', label: 'Home', url: '/' },
          { id: 'xinear-nav-shop', label: 'Shop', url: '/shop' },
          // "Appoinment" is the actual spelling in the Figma source — kept
          // verbatim rather than corrected, since this is real source copy.
          { id: 'xinear-nav-appointment', label: 'Make an Appoinment', url: '/appointment' },
          { id: 'xinear-nav-reviews', label: 'Reviews', url: '/reviews' },
          { id: 'xinear-nav-contact', label: 'Contact Us', url: '/contact' },
          { id: 'xinear-nav-location', label: 'Location', url: '/location' },
          { id: 'xinear-nav-quote', label: 'Request Quote', url: '/quote' },
        ],
      },
    },
    footer: {
      layout_variant: 'columns',
      logo_text: 'Xinear',
      logo_image: image('xinear-logo'),
      show_border: true,
      // Figma's visible footer icon row shows X/Instagram/Facebook/YouTube
      // (4 icons) — LinkedIn's icon component exists in the Figma file (see
      // socialIcons/linkedin.svg) but isn't part of the visible footer
      // instance in the reference screenshot, so it's intentionally left
      // out of Xinear's own social_links here (still available for any
      // future template's footer).
      social_links: [
        { id: 'xinear-social-x', platform: 'x', url: '#' },
        { id: 'xinear-social-instagram', platform: 'instagram', url: '#' },
        { id: 'xinear-social-facebook', platform: 'facebook', url: '#' },
        { id: 'xinear-social-youtube', platform: 'youtube', url: '#' },
      ],
      address_heading: 'Tangerang',
      address_body: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320',
      phone: '0858-3456-0890',
      email: 'xinear@gmail.com',
      link_columns: [
        {
          id: 'xinear-footer-category',
          heading: 'Category',
          links: [
            { id: 'xinear-footer-category-tops', label: 'Tops', url: '/shop' },
            { id: 'xinear-footer-category-bottom', label: 'Bottom', url: '/shop' },
            { id: 'xinear-footer-category-dress', label: 'Dress', url: '/shop' },
            { id: 'xinear-footer-category-shoes', label: 'Shoes', url: '/shop' },
            { id: 'xinear-footer-category-bags', label: 'Bags', url: '/shop' },
            { id: 'xinear-footer-category-parfumes', label: 'Parfumes', url: '/shop' },
          ],
        },
      ],
      copyright_text: '©2024 PT Xinear. All rights reserved.',
      show_social_icons: true,
    },
    media: media('xinear', [
      // logo-mark.svg's real intrinsic size, per its own viewBox/width/
      // height attributes (28x28) — the abstract "X" glyph next to the
      // "Xinear" wordmark in both header and footer.
      { key: 'logo', filename: 'logo-mark.svg', width: 28, height: 28 },
      { key: 'hero', filename: 'hero-banner.png', width: 1440, height: 620 },
      { key: 'appointment', filename: 'appointment-banner.png', width: 1440, height: 331 },
      { key: 'quote', filename: 'quote-banner.png', width: 1440, height: 524 },
      // contact-us.png: a real Figma asset, but contact_form has no image
      // field to attach it to — registered here for completeness/future use
      // only (see contact_form section below).
      { key: 'contact', filename: 'contact-us.png', width: 520, height: 520 },
      // store-map.png: a real Figma asset, but map_embed's Renderer always
      // draws a fixed gray placeholder box (no image field exists) — this
      // asset currently has nowhere to render. Registered for completeness/
      // future use only (see map_embed section below).
      { key: 'map', filename: 'store-map.png', width: 810, height: 320 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          // Figma shows a multi-dot (3-slide) carousel indicator, but only
          // one real slide image exists in the source — the extra slide
          // slots reuse that same asset rather than inventing new imagery,
          // just to reproduce the indicator/carousel behavior faithfully.
          defaultSection(
            'xinear-home-hero',
            'hero_banner',
            {
              background_image: image('xinear-hero'),
              extra_slides: [
                { id: 'xinear-hero-slide-2', image: image('xinear-hero') },
                { id: 'xinear-hero-slide-3', image: image('xinear-hero') },
              ],
              text_alignment: 'left',
              content_position: 'center',
            },
            [
              block('heading', { text: 'Pakain Terbaik Musim Panas' }),
              block('subheading', {
                text: 'Di sini kami akan memberikan berbagai macam produk menarik yang wajib kamu punya untuk musim panas 2024 nanti',
              }),
            ],
          ),
          defaultSection('xinear-home-categories', 'collection_list', {
            show_heading: false, display_style: 'circular',
            collections: [
              { id: 'xinear-cat-tops', handle: 'tops' },
              { id: 'xinear-cat-bottoms', handle: 'bottoms' },
              { id: 'xinear-cat-dresses', handle: 'dresses' },
              { id: 'xinear-cat-shoes', handle: 'shoes' },
              { id: 'xinear-cat-bags', handle: 'bags' },
              { id: 'xinear-cat-perfumes', handle: 'perfumes' },
            ],
          }),
          // Figma shows 5 products per row.
          defaultSection('xinear-home-tops', 'featured_products', {
            heading: 'Tops', columns_desktop: '5',
            products: defaultProductItems(['p5', 'p6', 'p7', 'p8', 'p9']),
          }),
          defaultSection('xinear-home-bottoms', 'featured_products', {
            heading: 'Bottoms', columns_desktop: '5',
            products: defaultProductItems(['p10', 'p11', 'p12', 'p13', 'p14']),
          }),
          defaultSection(
            'xinear-home-appointment',
            'hero_banner',
            {
              background_image: image('xinear-appointment'),
              overlay_opacity: 40,
              text_alignment: 'center',
              content_position: 'center',
            },
            [
              block('heading', { text: 'Book an Appointment!' }),
              block('subheading', {
                text: 'Schedule your visit to our store today! Discover the latest trends and exclusive collections tailored just for you.',
              }),
              block('button', { label: 'Book Now', url: '/appointment' }),
            ],
          ),
          defaultSection(
            'xinear-home-testimonials',
            'testimonials',
            { heading: 'What They Say', columns_desktop: '3' },
            [
              block('quote', {
                quote: 'Great materials and design especially considering the affordable price! I feel like a queen wearing the dresses you guys made! ',
                reviewer_name: 'John Doe',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Great materials and design especially considering the affordable price! I feel like a queen wearing the dresses you guys made! ',
                reviewer_name: 'Angelina CalDRenter',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Great materials and design especially considering the affordable price! I feel like a queen wearing the dresses you guys made! ',
                reviewer_name: 'Nichole Smith',
                star_rating: '5',
              }),
            ],
          ),
          // rating_form's own schema defaults already match Figma's copy —
          // no overrides needed.
          defaultSection('xinear-home-rating', 'rating_form'),
          // Figma shows this as a plain solid-gray banner with no photo —
          // no background_image, color_scheme: 'surface' renders the
          // theme's flat neutral surface color instead.
          defaultSection(
            'xinear-home-waitlist',
            'hero_banner',
            { color_scheme: 'surface', text_alignment: 'center', content_position: 'center' },
            [
              block('heading', { text: 'Join Waitlist' }),
              block('subheading', {
                text: "Can't Find a Slot? Join the waitlist and we'll notify you if an earlier appointment becomes available. Your time matters to us.",
              }),
              block('button', { label: 'Join Now', url: '/waitlist' }),
            ],
          ),
          // Sibling templates (clothing/fnb/manufacture) all seed
          // contact_form with no block overrides, relying on its
          // seedBlocks presets (3 generic form_field blocks) — matched here
          // for consistency rather than hand-authoring a heading/lead-text
          // block pair + custom-labeled Name/Email/Phone/Message fields
          // that no sibling template does either. contact-us.png is
          // registered in media above but unused (no image field exists).
          // Real Figma copy: "Contact Us" heading, lead text, and
          // Name/Email/Phone Number/Message fields (contact-us.png's portrait
          // photo has nowhere to go — contact_form has no image field, see
          // the media() registration below).
          defaultSection(
            'xinear-home-contact',
            'contact_form',
            { reply_to_email: '' },
            [
              block('heading', { text: 'Contact Us' }),
              block('text', { content: 'Contact us For further business inquiries or collaborations' }),
              block('form_field', { label: 'Name', field_type: 'text', required: true }),
              block('form_field', { label: 'Email', field_type: 'email', required: true }),
              block('form_field', { label: 'Phone Number', field_type: 'tel', required: false }),
              block('form_field', { label: 'Message', field_type: 'textarea', required: true }),
            ],
          ),
          defaultSection(
            'xinear-home-map',
            'map_embed',
            { address: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320' },
            [block('heading', { text: 'Visit Our Store!' }), block('text', { content: 'Find and shop your best clothing here' })],
          ),
          // quote_request_form's own schema defaults already match Figma's
          // copy exactly ("Request a Quote" / "Need a custom tailored
          // clothing..." / "Request a Quote" button) — no overrides needed.
          defaultSection('xinear-home-quote', 'quote_request_form'),
        ],
      },
    ],
  },
  {
    id: 'houzez',
    name: 'Houzez',
    // Sourced from Houzez's real Figma design (Labamu E-Commerce MVP 2,
    // node 81:71854 light / 81:72885 dark — see themes/houzez.js for the
    // matching --theme-* color/typography layer) and from the coded
    // reference prototype's own i18n copy (src/locales/en/website.json's
    // template_houzez namespace in ecom-from-bella), reused verbatim as
    // real source content. Like Xinear, this is a single home-page
    // storefront — the reference design has no separate about/contact
    // pages, every section lives on one anchor-navigated homepage.
    theme: {
      typography: { heading_font: 'Lato', body_font: 'Lato', heading_size: 'medium', body_size: 'medium', letter_spacing: 'normal', heading_transform: 'none' },
      colors: {
        // surface matches HouzezPreview.jsx's category-icon-circle background
        // (#EDF3F0) exactly; rating matches its 5-star review color (#FACC15);
        // text_secondary matches #4B5563, used consistently throughout the
        // golden reference as its secondary/supporting-text color (Hero
        // subtitle, Testimonials quote, form labels, Contact/Map/RFQ
        // subtitles, footer contact info, product titles) — all read
        // verbatim from the golden reference, not the Figma export.
        background: '#ffffff', surface: '#edf3f0', primary: '#16894b', primary_text: '#ffffff',
        accent: '#16894b', accent_text: '#ffffff', text_primary: '#1b1916', text_secondary: '#4b5563', border: '#f3f4f6',
        rating: '#facc15',
      },
      // Layout tokens matched to HouzezPreview.jsx (golden reference):
      // maxWidth 1280px + `calc(100% - 80px)` (40px gutter each side desktop,
      // stepping down to 16px on mobile), 12px card radius (product/review
      // cards), a soft card shadow (product-card hover / dropdown shadow
      // family), and 4px image corner radius (the Location map's own
      // radius — set explicitly rather than relying on map_embed's fallback,
      // same reasoning as map_height below) instead of the schema's flat
      // defaults. See shared/themedLayout.js for the concrete px/CSS values
      // these resolve to.
      layout: { container_width: '1280', container_gutter: 'spacious', card_corners: 12, card_shadow: 'subtle', image_corners: 4 },
      // Houzez's ordinary button standard — reused verbatim by Contact,
      // RFQ, and Rating's submit buttons in the golden reference (all three
      // share this exact padding/radius/weight; the Appointment CTA is a
      // deliberately distinct one-off, handled by heroRecipe.ctaButton's
      // override instead of this — font_size here has no effect on it).
      // Full field set (not just the 5 that differ from the default) —
      // `applySiteTemplate`'s seed path clones this object and shallow-
      // replaces `state.theme.buttons` with it wholesale (unlike the
      // preview path's defensive per-group merge in defaultPreviewDataFor
      // below), so a partial object here would silently drop
      // letter_spacing/text_transform/border_width/hover_effect for a real
      // "apply this template" pick, not just the gallery preview.
      buttons: {
        corner_radius: 8, padding_horizontal: 28, padding_vertical: 14, font_weight: '600', font_size: 15,
        letter_spacing: 'normal', text_transform: 'none', border_width: 0, hover_effect: 'darken',
      },
      // Internal visual recipe for hero_banner's 'split_panel' layout and
      // 'theme' overlay — golden-reference exact measurements/gradient
      // stops/hero typography. Not part of theme-settings-schema.json, so
      // it never appears in the merchant-facing Theme panel. See
      // sections/shared/heroRecipes.js.
      heroRecipe: HOUZEZ_HERO_RECIPE,
      // Internal visual recipe for rating_form's 'inline' layout — see
      // sections/shared/formRecipes.js.
      formRecipe: HOUZEZ_FORM_RECIPE,
      // Internal visual recipe for Header's nav link weight (inactive 500 /
      // active 700, not the schema default 400/700) — see
      // sections/shared/navRecipes.js.
      navRecipe: HOUZEZ_NAV_RECIPE,
      // Houzez's own storefront product catalog (construction/safety
      // goods) — resolved by storefront features that need "the current
      // template's products" (currently RFQ's product picker) instead of
      // the generic demo clothing catalog. Same data as the two
      // featured_products sections above (mocks/houzezProducts.js), not a
      // duplicate list. See sections/shared/productSource.js.
      productCatalog: HOUZEZ_PRODUCTS,
    },
    header: {
      layout_variant: 'inline',
      // Explicitly empty, deliberately — same reasoning as footer's logo
      // (houzez-logo.png is already the full icon+wordmark lockup, not a
      // small icon needing a separate text label beside it). Must be an
      // explicit '' rather than just omitting the key: unlike footer's
      // schema (logo_text default ''), header/schema.js's own default is
      // the non-empty 'My Store' fallback, which would otherwise leak
      // through and re-trigger the icon+text branch with the wrong text.
      logo_text: '',
      logo_image: image('houzez-logo'),
      show_border: true,
      // header/schema.js's own default is color_scheme: 'primary' (a solid
      // background fill), but the golden reference's header is white with
      // green used only for the logo/active-nav text, not as a bar fill —
      // explicit override, not a shared-schema default change.
      color_scheme: 'background',
      // Golden reference's nav links are always green (theme primary),
      // active bold / inactive regular — not the section's plain text color.
      nav_color: 'primary',
      show_language_switcher: true,
      // The reference prototype's language pill offers English/Indonesian
      // with real flag icons (flagcdn 'us'/'id' — see schema.js's `flag`
      // field and Renderer.jsx's renderFlag).
      languages: [
        { id: 'houzez-lang-en', code: 'EN', label: 'English', flag: 'us' },
        { id: 'houzez-lang-id', code: 'ID', label: 'Bahasa Indonesia', flag: 'id' },
      ],
      show_search_icon: false,
      // Reference screenshot shows a cart/bag icon in the action cluster —
      // corrects the earlier assumption (drawn from the prototype's
      // BASE_CONFIG.enableCheckout default) that Houzez hides it.
      show_cart_icon: true,
      // Reference nav (Home + 6 feature anchors) collapses into the "⋯"
      // overflow dropdown beyond 5 — matches the prototype's own overflow
      // behavior exactly (see HouzezPreview.jsx's displayedNav/overflowNav).
      nav_overflow_after: 5,
    },
    // Content > Menus (US-Content.1) — see Xinear's own `menus` block above
    // for the full rationale (header no longer stores nav inline).
    menus: {
      'main-menu': {
        items: [
          { id: 'houzez-nav-home', label: 'Home', url: '/' },
          { id: 'houzez-nav-shop', label: 'Shop', url: '/shop' },
          // Editorial Collection List — added so a newly-seeded Houzez site
          // actually exposes the Collection system page in nav (see the new
          // 'houzez-collection-list' page entry below). Placed right after
          // Shop, within `nav_overflow_after`'s first-5-visible window, so it
          // shows directly rather than collapsing into the "⋯" overflow menu.
          { id: 'houzez-nav-collection', label: 'Collection', url: '/collection' },
          { id: 'houzez-nav-appointment', label: 'Appointment', url: '/appointment' },
          { id: 'houzez-nav-reviews', label: 'Reviews', url: '/reviews' },
          { id: 'houzez-nav-contact', label: 'Contact', url: '/contact' },
          { id: 'houzez-nav-location', label: 'Location', url: '/location' },
          { id: 'houzez-nav-quote', label: 'Quote', url: '/quote' },
        ],
      },
    },
    footer: {
      layout_variant: 'columns',
      // No `logo_text` here, deliberately — `houzez-logo.png` is already the
      // full icon+wordmark lockup (matches Header's own logo asset), not a
      // small icon needing a separate text label beside it. Setting
      // logo_text too would (and did) render a redundant second "Houzez"
      // next to a badly-cropped 24x24 square of the lockup image — see
      // footer/Renderer.jsx's renderLogoRow.
      logo_image: image('houzez-logo'),
      show_border: true,
      // footer/schema.js's own default is color_scheme: 'primary' (a solid
      // fill) — golden reference's footer is a plain white background.
      color_scheme: 'background',
      // Golden reference's 3-column footer is ~1.5fr:2fr:1fr
      // (contact:category:social), not equal thirds — see footer/schema.js.
      column_ratio: 'balanced',
      social_links: [
        { id: 'houzez-social-x', platform: 'x', url: '#' },
        { id: 'houzez-social-instagram', platform: 'instagram', url: '#' },
        { id: 'houzez-social-facebook', platform: 'facebook', url: '#' },
        { id: 'houzez-social-youtube', platform: 'youtube', url: '#' },
        { id: 'houzez-social-linkedin', platform: 'linkedin', url: '#' },
      ],
      address_heading: 'Tangerang',
      address_body: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320',
      phone: '0858-3456-0890',
      email: 'houzez@gmail.com',
      link_columns: [
        {
          id: 'houzez-footer-category',
          heading: 'Category',
          // Golden reference splits its 8 category links into two
          // side-by-side 4-item groups, not one long list — see
          // footer/schema.js's link_columns[].links_layout.
          links_layout: '2-column',
          links: [
            { id: 'houzez-footer-category-house', label: 'House Construction', url: '/shop' },
            { id: 'houzez-footer-category-glass', label: 'Glass Pane', url: '/shop' },
            { id: 'houzez-footer-category-safety', label: 'Safety Tools', url: '/shop' },
            { id: 'houzez-footer-category-foundation', label: 'Foundation', url: '/shop' },
            { id: 'houzez-footer-category-paints', label: 'Paints and Flooring', url: '/shop' },
            { id: 'houzez-footer-category-roofing', label: 'Roofing', url: '/shop' },
            { id: 'houzez-footer-category-doors', label: 'Doors and Windows', url: '/shop' },
            { id: 'houzez-footer-category-excavation', label: 'Excavation', url: '/shop' },
          ],
        },
      ],
      // Expected Figma/reference Footer explicitly shows a copyright row —
      // overrides the earlier "golden has no copyright row" assumption
      // (that was drawn from HouzezPreview.jsx's own markup, which the
      // Figma reference takes priority over per this task). Exact text/year
      // as specified by the reference, not the current year.
      copyright_text: '©2024 PT Houzez. All rights reserved.',
      show_social_icons: true,
      // Titled "Follow Us" social column (not a bottom bar) — see
      // footer/schema.js's social_heading field.
      social_heading: 'Follow Us',
      show_copyright: true,
    },
    media: media('houzez', [
      { key: 'logo', filename: 'assets/houzez-logo.png', width: 125, height: 45 },
      { key: 'banner', filename: 'assets/houzez-banner.png', width: 640, height: 419 },
      { key: 'appointment', filename: 'assets/houzez-appointment.png', width: 1440, height: 331 },
      { key: 'contact', filename: 'assets/houzez-contact.png', width: 520, height: 520 },
      // A real Figma/prototype asset, registered for completeness — like
      // Xinear's store-map.png, map_embed's Renderer always draws a Google
      // Maps iframe (or gray placeholder) and has no image field to attach
      // this to, so it currently has nowhere to render.
      { key: 'map', filename: 'assets/houzez-map.png', width: 730, height: 320 },
      // Same story as 'map' — a real asset with no home in
      // quote_request_form's current fixed-field schema (no image field).
      // Will have somewhere to go once quote_request_form grows an RFQ
      // hero/background per the RFQ-modal upgrade plan.
      { key: 'rfq', filename: 'assets/houzez-rfq.png', width: 1920, height: 1080 },
      // 8 category icons for the icon-circle Categories strip (category_grid).
      { key: 'cat-house', filename: 'catalog-categories/house-construction.png', width: 40, height: 40 },
      { key: 'cat-glass', filename: 'catalog-categories/glass-pane.png', width: 40, height: 40 },
      { key: 'cat-safety', filename: 'catalog-categories/safety-tools.png', width: 40, height: 40 },
      { key: 'cat-foundation', filename: 'catalog-categories/foundation.png', width: 40, height: 40 },
      { key: 'cat-paints', filename: 'catalog-categories/paints-and-flooring.png', width: 40, height: 40 },
      { key: 'cat-roofing', filename: 'catalog-categories/roofing.png', width: 40, height: 40 },
      { key: 'cat-doors', filename: 'catalog-categories/doors-and-windows.png', width: 40, height: 40 },
      { key: 'cat-excavation', filename: 'catalog-categories/excavation.png', width: 40, height: 40 },
      // 12 product photos for the two "Product Group" carousels (High-Rise
      // Needs / Safety Tools), real names/prices from the reference
      // prototype's en/website.json template_houzez.products namespace.
      { key: 'prod-ladder', filename: 'catalog/image-2.png', width: 200, height: 200 },
      { key: 'prod-level-kit', filename: 'catalog/image-3.png', width: 200, height: 200 },
      { key: 'prod-scaffold-metal', filename: 'catalog/image-4.png', width: 200, height: 200 },
      { key: 'prod-scaffold-tower', filename: 'catalog/image-5.png', width: 200, height: 200 },
      { key: 'prod-rammer', filename: 'catalog/image-6.png', width: 200, height: 200 },
      { key: 'prod-ladder-steel', filename: 'catalog/image-7.png', width: 200, height: 200 },
      { key: 'prod-helmet', filename: 'catalog/image-8.png', width: 200, height: 200 },
      { key: 'prod-harness', filename: 'catalog/image-9.png', width: 200, height: 200 },
      { key: 'prod-gloves', filename: 'catalog/image-10.png', width: 200, height: 200 },
      { key: 'prod-lifeline', filename: 'catalog/image-11.png', width: 200, height: 200 },
      { key: 'prod-helmet-2', filename: 'catalog/image-12.png', width: 200, height: 200 },
      { key: 'prod-gloves-heavy', filename: 'catalog/image-13.png', width: 200, height: 200 },
    ]),
    pages: [
      {
        id: 'home', name: 'Home', type: 'system', slug: '/', seo: {}, hiddenFromNav: false,
        sections: [
          // 'split_panel' matches the golden reference's framed two-panel
          // hero (content | image, blended into the theme surface color) —
          // see hero_banner/schema.js's layout_variant. The expected Figma
          // reference shows a 3-dot carousel with prev/next arrows — the
          // carousel controls (HeroArrow/HeroDots, Renderer.jsx) are already
          // a generic capability, only gated on `extra_slides` having
          // entries. Houzez has no distinct second/third hero photo asset,
          // so — same convention Xinear's own hero already uses just below
          // — these extra slots reuse the one real banner image rather than
          // inventing new imagery, just to reproduce the carousel behavior
          // faithfully.
          defaultSection(
            'houzez-home-hero',
            'hero_banner',
            {
              background_image: image('houzez-banner'),
              extra_slides: [
                { id: 'houzez-hero-slide-2', image: image('houzez-banner') },
                { id: 'houzez-hero-slide-3', image: image('houzez-banner') },
              ],
              layout_variant: 'split_panel', text_alignment: 'left', content_position: 'center',
            },
            [
              block('heading', { text: 'Create your ideal home with us' }),
              block('subheading', { text: 'Everything you need to build your home, we provide.' }),
            ],
          ),
          // Icon-circle Categories strip — same 8 categories/icons/order as
          // the real design, at Houzez's own 8-column desktop layout.
          defaultSection('houzez-home-categories', 'category_grid', {
            show_heading: false, columns_desktop: '8', columns_mobile: '4',
            items: [
              { id: 'houzez-cat-house', label: 'House Construction', icon_image: image('houzez-cat-house'), url: '/shop' },
              { id: 'houzez-cat-glass', label: 'Glass Pane', icon_image: image('houzez-cat-glass'), url: '/shop' },
              { id: 'houzez-cat-safety', label: 'Safety Tools', icon_image: image('houzez-cat-safety'), url: '/shop' },
              { id: 'houzez-cat-foundation', label: 'Foundation', icon_image: image('houzez-cat-foundation'), url: '/shop' },
              { id: 'houzez-cat-paints', label: 'Paints and Flooring', icon_image: image('houzez-cat-paints'), url: '/shop' },
              { id: 'houzez-cat-roofing', label: 'Roofing', icon_image: image('houzez-cat-roofing'), url: '/shop' },
              { id: 'houzez-cat-doors', label: 'Doors and Windows', icon_image: image('houzez-cat-doors'), url: '/shop' },
              { id: 'houzez-cat-excavation', label: 'Excavation', icon_image: image('houzez-cat-excavation'), url: '/shop' },
            ],
          }),
          // Matches the golden-reference ProductGroup: 6-column desktop grid,
          // horizontal-scroll-snap row on mobile (see featured_products'
          // columns_desktop/mobile_layout options).
          // Product content now lives once in mocks/houzezProducts.js — also
          // the source `theme.productCatalog` resolves for RFQ's product
          // picker (see sections/shared/productSource.js) — instead of a
          // second hand-maintained copy of the same 12 products here.
          defaultSection('houzez-home-highrise', 'featured_products', {
            heading: 'High-Rise Needs', columns_desktop: '6', mobile_layout: 'horizontal_scroll',
            products: HOUZEZ_HIGH_RISE_PRODUCTS,
          }),
          defaultSection('houzez-home-safety', 'featured_products', {
            heading: 'Safety Tools', columns_desktop: '6', mobile_layout: 'horizontal_scroll',
            products: HOUZEZ_SAFETY_PRODUCTS,
          }),
          // A plain 'background' hero_banner with a 'dark' overlay — the
          // expected reference shows the photo plainly visible under a flat
          // dark scrim with centered white text and a solid green CTA, not
          // golden HouzezPreview.jsx's own left-aligned green gradient wash
          // (the reference takes priority over the old implementation on
          // this point). color_scheme: 'primary' gives white heading/
          // subhead text (theme primary_text) without hardcoding a color
          // here; the button's default 'filled' style (no `style` override)
          // resolves to theme primary bg / primary_text — a solid green
          // pill with white text, matching the reference.
          defaultSection(
            'houzez-home-appointment',
            'hero_banner',
            {
              background_image: image('houzez-appointment'), min_height: 400,
              overlay_style: 'dark', overlay_opacity: 45,
              // color_scheme: 'primary' gives white heading/subhead text,
              // but SECTION_CHROME_FIELDS' own padding_top/padding_bottom
              // default (48px) would otherwise reveal that scheme's green
              // background as a solid bar above/below the full-bleed photo
              // — the reference shows the photo running edge-to-edge with
              // no visible gap.
              color_scheme: 'primary', text_alignment: 'center', content_position: 'center',
              padding_top: 0, padding_bottom: 0,
            },
            [
              block('heading', { text: 'Book an Appointment!' }),
              block('subheading', { text: 'Let\u2019s meet and discuss further on your construction needs' }),
              block('button', { label: 'Book Now', url: '/appointment' }),
            ],
          ),
          defaultSection(
            'houzez-home-testimonials',
            'testimonials',
            {
              heading: 'What They Say', columns_desktop: '3',
              // heading_size 'display' reproduces the golden reference's
              // 28px/800/32px-margin section heading exactly (see
              // shared/headingSize.js); card_hierarchy 'name_first' matches
              // its bold-name-above-quote card order.
              heading_size: 'display', card_hierarchy: 'name_first',
              // 80px desktop / 40px mobile section padding, matching
              // HouzezPreview.jsx's `padding: isMobile ? '40px 16px 40px
              // 16px' : '80px 0 40px 0'` (bottom padding is 40px either way,
              // so only padding_top needs to differ by breakpoint).
              padding_top: { $res: true, mobile: 40, desktop: 80 },
            },
            [
              block('quote', {
                quote: 'Worked with Houzez on all my property. Never once I were disappointed because they are bomb',
                reviewer_name: 'John Doe',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Worked with Houzez on all my property. Never once I were disappointed because they are bomb',
                reviewer_name: 'Angelina Carpenter',
                star_rating: '5',
              }),
              block('quote', {
                quote: 'Worked with Houzez on all my property. Never once I were disappointed because they are bomb',
                reviewer_name: 'Nichole Smith',
                star_rating: '5',
              }),
            ],
          ),
          defaultSection('houzez-home-rating', 'rating_form', {
            heading: 'Leave us your thoughts on how do you like our service',
            name_field_label: 'Name', message_field_label: 'Review', button_label: 'Give Rating',
            layout: 'inline',
          }),
          // 'split' layout + image matches the golden reference's
          // form-beside-showroom-photo composition (see contact_form's
          // schema.js). The golden reference's salutation dropdown is only
          // shown when a merchant-config toggle (`requiredFields.salutation`,
          // not modeled in this app) is on — reproduced here as a normal,
          // always-visible 'select' form_field instead of building that
          // conditional-visibility system for one section.
          defaultSection(
            'houzez-home-contact',
            'contact_form',
            { reply_to_email: '', layout: 'split', image: image('houzez-contact') },
            [
              block('heading', { text: 'Contact Us' }),
              block('text', { content: 'Contact us For further business inquiries or collaborations' }),
              block('form_field', { label: 'Salutation', field_type: 'select', options: 'Mr.\nMrs.\nMs.\nDr.', placeholder: 'Select salutation' }),
              block('form_field', { label: 'Name', field_type: 'text', required: true }),
              block('form_field', { label: 'Email', field_type: 'email', required: true }),
              block('form_field', { label: 'Phone Number', field_type: 'tel', required: false }),
              block('form_field', { label: 'Message', field_type: 'textarea', required: true }),
            ],
          ),
          defaultSection(
            'houzez-home-map',
            'map_embed',
            {
              address: 'Alam Sutera, Jl. Jalur Sutera Boulevard No.45, Kunciran, Kec. Pinang, Kota Tangerang, Banten 15320',
              // 360px matches the golden reference's map height exactly
              // (map skin itself stays the Google iframe — an explicit,
              // accepted product decision, not a gap). map_position 'left'
              // and heading_style 'prominent' reproduce its map-first
              // column order and 32px/800 heading treatment.
              map_height: 360, map_position: 'left', heading_style: 'prominent',
            },
            [block('heading', { text: 'Visit Our Showroom!' }), block('text', { content: 'Come see our great craftmanship here.' })],
          ),
          // presentation: 'modal_trigger' — reproduces the golden reference's
          // CTA-opens-a-dialog RFQ experience: this section renders only the
          // button in-flow, and the full structured request (customer info,
          // product line items via a nested Add-Product dialog, attachments,
          // notes) opens in a dialog on click — real add/remove/validate/
          // submit behavior via services/rfqService.js's existing submitRfq,
          // see quote_request_form/Renderer.jsx's RfqModalFlow.
          // Reference shows the RFQ CTA as a full-bleed construction photo
          // with centered white heading/subtext and just the button — no
          // visible form fields (already true of `modal_trigger`). Uses the
          // 'rfq' media asset registered above, previously unused (no field
          // to attach it to before `background_image` existed).
          defaultSection('houzez-home-quote', 'quote_request_form', {
            heading: 'Request a Quote',
            subtext: 'Need an estimation of cost of you build? Drop us your request and we’ll reach you with a quote.',
            button_label: 'Request a Quote',
            presentation: 'modal_trigger',
            background_image: image('houzez-rfq'),
            min_height: 400,
          }),
        ],
      },
      // Editorial Collection List/Detail — Houzez, like every other site
      // template, only hand-authors `home`; Shop/Product Detail reach it
      // purely via mergeRequiredSystemPages (see APPLY_SITE_TEMPLATE_SEED in
      // builderReducer.js and ThemePreview.jsx), which only ever merges
      // REQUIRED_SYSTEM_TYPES ('shop'/'product') — Collection intentionally
      // stays optional (not in that list, see defaultTheme.js), so it is
      // NEVER auto-added to a template's own page roster. Without an
      // explicit entry here, a newly-seeded Houzez site (and the Theme
      // Gallery's read-only "See preview") would never expose `/collection`
      // at all — these two entries are what make Collection reachable for
      // Houzez specifically, matching the approved product decision that it
      // exists by default on new Houzez sites. Same page shape/ids
      // `defaultTheme.js`'s `createDefaultPages()` uses, so both sources
      // stay interchangeable to `pageFillsSystemType`/`matchStorefrontPage`.
      {
        id: 'houzez-collection-list', name: 'Collection', type: 'system', systemType: 'editorial_collection_list', slug: '/collection', seo: {}, hiddenFromNav: false,
        sections: [
          // 'editorial-collection-list-grid' matches
          // EDITORIAL_COLLECTION_LIST_CORE_SECTION_ID (editorial_collection_list/schema.js).
          defaultSection('editorial-collection-list-grid', 'editorial_collection_list', {}),
        ],
      },
      {
        id: 'houzez-collection-detail', name: 'Collection Detail', type: 'system', systemType: 'editorial_collection_detail', slug: '/collection/:slug', seo: {}, hiddenFromNav: true,
        sections: [
          // 'editorial-collection-detail-story' matches
          // EDITORIAL_COLLECTION_DETAIL_CORE_SECTION_ID (editorial_collection_detail/schema.js).
          defaultSection('editorial-collection-detail-story', 'editorial_collection_detail', {}),
        ],
      },
    ],
  },
];

export function siteTemplateById(id) {
  return SITE_TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Builds an illustrative preview (header/footer/sections/theme/media) from a
 * template's own default data — never a merchant's real content. Shared by
 * ThemeGallery's inactive-card previews and the standalone theme preview
 * route (ThemePreview.jsx) so both render exactly the same "what this theme
 * looks like out of the box" data from one source of truth.
 */
export function defaultPreviewDataFor(template) {
  const globals = createDefaultGlobals(template.pages);
  // Per-group shallow merge (not a flat `{...defaultTheme, ...template.theme}`):
  // a template overriding e.g. `theme.layout.container_width` should only
  // override that one field, not silently drop every other layout default
  // (section_spacing, section_padding, image_corners, ...) the template
  // doesn't mention.
  const theme = {
    ...defaultTheme,
    ...template.theme,
    typography: { ...defaultTheme.typography, ...template.theme?.typography },
    colors: { ...defaultTheme.colors, ...template.theme?.colors },
    buttons: { ...defaultTheme.buttons, ...template.theme?.buttons },
    layout: { ...defaultTheme.layout, ...template.theme?.layout },
    product_cards: { ...defaultTheme.product_cards, ...template.theme?.product_cards },
  };
  const header = { ...globals.header, data: { ...globals.header.data, ...template.header } };
  const footer = { ...globals.footer, data: { ...globals.footer.data, ...template.footer } };
  // Content > Menus (US-Content.1) — a template's own `menus` (if any)
  // overrides createDefaultGlobals' page-roster-derived defaults per menu,
  // same "template wins, else the generic default" merge header/footer just
  // used above.
  const menus = {
    'main-menu': { ...globals.menus['main-menu'], ...template.menus?.['main-menu'] },
    'footer-menu': { ...globals.menus['footer-menu'], ...template.menus?.['footer-menu'] },
  };
  return { header, footer, menus, sections: template.pages[0]?.sections ?? [], theme, mediaLibrary: template.media };
}
