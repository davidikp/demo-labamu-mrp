import React from "react";

const ToggleSwitch = ({ checked = false, onChange, disabled = false }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => {
      if (!disabled) onChange?.(!checked);
    }}
    className="ds-toggle"
    style={{
      "--ds-toggle-border": checked
        ? "var(--feature-brand-primary)"
        : "#d9d9d9",
      "--ds-toggle-bg": checked ? "var(--feature-brand-primary)" : "#d9d9d9",
      "--ds-toggle-cursor": disabled ? "not-allowed" : "pointer",
    }}
  >
    <span
      className="ds-toggle__thumb"
      style={{
        "--ds-toggle-thumb-x": checked ? "24px" : "0px",
      }}
    />
  </button>
);

export { ToggleSwitch };
