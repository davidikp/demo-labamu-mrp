import React from "react";
import { Tooltip as CeTooltip } from "../../ce-ui";

export const Tooltip = ({ content, children, placement = "top", className }) => (
  <CeTooltip content={content} placement={placement} className={className}>
    {children}
  </CeTooltip>
);
