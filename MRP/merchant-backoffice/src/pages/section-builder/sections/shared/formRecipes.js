/**
 * @module section-builder/sections/shared/formRecipes
 * @description Internal visual recipe for storefront form sections that
 * offer a semantic `layout` choice beyond a generic stacked default (e.g.
 * rating_form's `layout: 'inline'`) — field geometry and a column ratio a
 * theme wants for that layout, kept out of the merchant-facing schema for
 * the same reason heroRecipes.js keeps split_panel's geometry internal:
 * these are real visual decisions, not a "useful website-building decision"
 * for a merchant to hand-tune field-by-field.
 *
 * Deliberately separate from heroRecipes.js: this shape (field height/
 * radius/border, label size, inline column ratio) has nothing to do with a
 * hero banner, and it's plausibly reusable by other storefront forms
 * (contact_form/quote_request_form already hardcode near-identical field
 * styling independently) — unlike hero-specific values, this isn't
 * conceptually Hero-scoped, so it doesn't belong nested under `heroRecipe`.
 * Only `rating_form` consumes it today; wiring in contact_form/
 * quote_request_form is a follow-up, not part of this task.
 */

export const DEFAULT_FORM_RECIPE = {
  field: { height: 44, radius: 8, fontSize: 14, borderColor: undefined },
  label: { fontSize: 12, color: undefined },
  starSize: 22,
  inlineColumns: '1fr 1fr 1fr',
  inlineGap: 16,
};

/** Golden-reference HouzezPreview.jsx's 3-column Name | Review | Rating
 * form (HouzezPreview.jsx:1130-1155), read verbatim. */
export const HOUZEZ_FORM_RECIPE = {
  // height 48px, padding '0 16px', border 1px #E5E7EB, borderRadius 8px,
  // fontSize 14px — :1135
  field: { height: 48, radius: 8, fontSize: 14, borderColor: '#E5E7EB' },
  // fontSize 12px, color #4B5563 — :1134
  label: { fontSize: 12, color: '#4B5563' },
  // star width/height 28px — :1145
  starSize: 28,
  // gridTemplateColumns: '1fr 2fr 1fr' (Review gets double width) — :1132
  inlineColumns: '1fr 2fr 1fr',
  inlineGap: 16,
};

/** `theme.formRecipe` (set only by templates that want a non-default
 * recipe, e.g. Houzez) falling back to the generic default — never a
 * theme-name conditional. */
export function resolveFormRecipe(theme) {
  return theme?.formRecipe ?? DEFAULT_FORM_RECIPE;
}
