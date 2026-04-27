import React from "react";
import { ChevronDownIcon } from "../icons/Icons.jsx";

const FilterPill = ({ label, active = false, isOpen = false, count = 0 }) => {
  const isHighlighted = active || isOpen;
  const showCount = active && count > 0;

  return (
    <div
      className="ds-filter-pill"
      style={{
        "--ds-filter-pill-padding": showCount ? "0 14px 0 10px" : "0 16px",
        "--ds-filter-pill-border": isHighlighted
          ? "var(--feature-brand-primary)"
          : "#A9A9A9",
        "--ds-filter-pill-color": isHighlighted
          ? "var(--feature-brand-primary)"
          : "#A9A9A9",
      }}
    >
      {showCount ? <span className="ds-filter-pill__count">{count}</span> : null}
      {label}
      <ChevronDownIcon
        size={16}
        color={
          isHighlighted
            ? "var(--feature-brand-primary)"
            : "var(--neutral-on-surface-tertiary)"
        }
        style={{
          transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.2s ease",
        }}
      />
    </div>
  );
};

export { FilterPill };
