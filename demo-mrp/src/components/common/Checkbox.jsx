import React from "react";
import { CheckIcon } from "../icons/Icons.jsx";

const Checkbox = ({ checked, disabled, onChange }) => {
  return (
    <div
      onClick={(event) => {
        event.stopPropagation();
        if (!disabled) onChange(!checked);
      }}
      className="ds-checkbox"
      style={{
        "--ds-checkbox-cursor": disabled ? "not-allowed" : "pointer",
        "--ds-checkbox-bg": disabled
          ? "var(--neutral-surface-grey-lighter)"
          : checked
            ? "var(--feature-brand-primary)"
            : "transparent",
        "--ds-checkbox-border": disabled
          ? "var(--neutral-line-outline)"
          : checked
            ? "var(--feature-brand-primary)"
            : "var(--neutral-line-outline)",
      }}
    >
      {checked ? (
        <CheckIcon
          size={14}
          color={
            disabled
              ? "var(--neutral-on-surface-tertiary)"
              : "var(--feature-brand-on-primary)"
          }
        />
      ) : null}
    </div>
  );
};

export { Checkbox };
