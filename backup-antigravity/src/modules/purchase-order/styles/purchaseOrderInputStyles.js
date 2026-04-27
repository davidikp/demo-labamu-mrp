export const baseInputBorderColor = "#e9e9e9";

export const inputFrameStyle = (disabled = false, hasError = false) => ({
  border: `1px solid ${
    hasError
      ? "var(--status-red-primary)"
      : disabled
        ? "var(--neutral-line-outline)"
        : baseInputBorderColor
  }`,
  borderRadius: "10px",
  background: disabled
    ? "var(--neutral-surface-grey-lighter)"
    : "var(--neutral-surface-primary)",
  transition: "border-color 0.2s ease, box-shadow 0.2s ease",
  boxSizing: "border-box",
});

export const inputControlStyle = (disabled = false, hasValue = false) => ({
  width: "100%",
  outline: "none",
  fontSize: "var(--text-subtitle-1)",
  color: disabled
    ? "var(--neutral-on-surface-tertiary)"
    : hasValue
      ? "var(--neutral-on-surface-primary)"
      : "var(--neutral-on-surface-tertiary)",
  fontFamily: "Lato, sans-serif",
  boxSizing: "border-box",
});

export const focusInputFrame = (el) => {
  if (!el) return;
  el.style.borderColor = "var(--feature-brand-primary)";
  el.style.boxShadow = "0 0 0 3px rgba(0, 104, 255, 0.08)";
};

export const blurInputFrame = (el, disabled = false, hasError = false) => {
  if (!el) return;
  if (!el) return;
  el.style.borderColor = hasError
    ? "var(--status-red-primary)"
    : disabled
      ? "var(--neutral-line-outline)"
      : baseInputBorderColor;
  el.style.boxShadow = "none";
};

export const fieldStyle = (disabled = false, hasValue = false, hasError = false) => ({
  height: "46px",
  padding: "0 16px",
  width: "100%",
  border: "none",
  background: "transparent",
  ...inputFrameStyle(disabled, hasError),
  ...inputControlStyle(disabled, hasValue),
});
