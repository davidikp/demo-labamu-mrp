/**
 * @module section-builder/mocks/houzezProducts
 * @description The single, real source of Houzez's construction-domain
 * products — read verbatim from the golden Houzez storefront's product
 * groups (KRISBOW ladder, DEWALT level kit, safety helmets, etc.), same ids/
 * titles/images/prices `state/siteTemplates.js`'s two `featured_products`
 * sections ("High-Rise Needs" / "Safety Tools") already display. Defined
 * here once and imported by both that seed content and the storefront
 * product-source resolver (`sections/shared/productSource.js`) so there is
 * exactly one Houzez product list, not a second hand-maintained catalog.
 */
export const HOUZEZ_HIGH_RISE_PRODUCTS = [
  { id: 'houzez-prod-ladder', source: 'custom', title: 'KRISBOW Ladder Rolling Multi PRLRM1108 1.1m 4...', image: { mediaId: 'houzez-prod-ladder' }, price: 'Rp 4.200.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-level-kit', source: 'custom', title: 'DEWALT Builders Level Kit DW090PK 1set', image: { mediaId: 'houzez-prod-level-kit' }, price: 'Rp 16.000.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-scaffold-metal', source: 'custom', title: 'METALTECH Portable Scaffold 6-11/64 ft.L Steel...', image: { mediaId: 'houzez-prod-scaffold-metal' }, price: 'Rp 13.885.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-scaffold-tower', source: 'custom', title: 'WERNER Scaffold Tower 75 H, 41D335', image: { mediaId: 'houzez-prod-scaffold-tower' }, price: 'Rp 13.885.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-rammer', source: 'custom', title: 'Hyundai Tamping Rammers HDCR 88H 1pc', image: { mediaId: 'houzez-prod-rammer' }, price: 'Rp 23.330.000' , category: 'High-Rise Needs' },
  { id: 'houzez-prod-ladder-steel', source: 'custom', title: 'Cotterman Rolling Steel Ladder - 450-Lb. Capacit...', image: { mediaId: 'houzez-prod-ladder-steel' }, price: 'Rp 53.196.000' , category: 'High-Rise Needs' },
];

export const HOUZEZ_SAFETY_PRODUCTS = [
  { id: 'houzez-prod-helmet', source: 'custom', title: 'Safety Helmet Construction Helmet Darl...', image: { mediaId: 'houzez-prod-helmet' }, price: 'Rp 723.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-harness', source: 'custom', title: 'Safety Full Body Harness Five Point Construction D...', image: { mediaId: 'houzez-prod-harness' }, price: 'Rp 166.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-gloves', source: 'custom', title: '48-22-8951 CUT 5 Dipped Safety Gloves Size M - 00...', image: { mediaId: 'houzez-prod-gloves' }, price: 'Rp 185.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-lifeline', source: 'custom', title: 'Rebel Self Retracting Lifeline - Stainless Cable...', image: { mediaId: 'houzez-prod-lifeline' }, price: 'Rp 3.023.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-helmet-2', source: 'custom', title: 'Safety Helmet Construction Helmet Darl...', image: { mediaId: 'houzez-prod-helmet-2' }, price: 'Rp 2.100.000' , category: 'Safety Tools' },
  { id: 'houzez-prod-gloves-heavy', source: 'custom', title: 'SARUNG TANGAN SAFETY KONG HEAVY DUTY HIGH...', image: { mediaId: 'houzez-prod-gloves-heavy' }, price: 'Rp 225.000' , category: 'Safety Tools' },
];

/** The full storefront-wide product list for Houzez — everything a
 * storefront feature (RFQ, a future product picker, etc.) should be able to
 * choose from, not just what any one section happens to display. */
export const HOUZEZ_PRODUCTS = [...HOUZEZ_HIGH_RISE_PRODUCTS, ...HOUZEZ_SAFETY_PRODUCTS];
