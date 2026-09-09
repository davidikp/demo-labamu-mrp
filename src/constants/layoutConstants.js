// Shared shell layout tokens. These used to be duplicated as raw pixel
// strings across Sidebar.jsx, TopHeader.jsx, App.jsx, and several
// module detail/settings pages that render their own fixed-position
// footers/headers next to the sidebar. Centralizing them here means the
// responsive breakpoint only has to be taught once.

export const SIDEBAR_WIDTH_EXPANDED = 286;
export const SIDEBAR_WIDTH_COLLAPSED = 82;
export const HEADER_HEIGHT = 64;

// Below this viewport width the sidebar becomes an off-canvas drawer
// (hidden by default, toggled via the hamburger button in TopHeader)
// instead of a permanent column that pushes page content over.
export const MOBILE_BREAKPOINT = 768;

/**
 * Left offset (in px, as a CSS string) that fixed-position elements sitting
 * "next to" the sidebar should use — e.g. TopHeader, sticky footers on
 * detail pages. On mobile the sidebar is off-canvas, so content always
 * starts at the left edge regardless of the desktop collapsed/expanded state.
 */
export function getShellLeftOffset(isSidebarCollapsed, isMobile) {
  if (isMobile) return "0px";
  return isSidebarCollapsed
    ? `${SIDEBAR_WIDTH_COLLAPSED}px`
    : `${SIDEBAR_WIDTH_EXPANDED}px`;
}
