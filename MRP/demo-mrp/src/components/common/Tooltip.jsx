import React from "react";
import { Tooltip as CeTooltip } from "../../ce-ui";

/**
 * Tooltip — adapter over the ce-ui Tooltip.
 * Legacy API: { content, children }. ce-ui adds optional `placement`.
 */
const Tooltip = ({ content, children, placement = "top" }) => (
  <CeTooltip content={content} placement={placement}>
    {children}
  </CeTooltip>
);

export { Tooltip };
