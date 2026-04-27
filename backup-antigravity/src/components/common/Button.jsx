import React from "react";

const Button = ({
  variant = "filled",
  size = "small",
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  children,
  onClick,
  className = "",
  style = {},
  disabled = false,
  type = "button",
  ...props
}) => {
  const isFilled = variant === "filled";
  const isDanger = variant === "danger";
  const isGhost = variant === "ghost";
  const isTertiary = variant === "tertiary";
  const isOutlined = !isFilled && !isDanger && !isGhost && !isTertiary;

  const sizeStyles = {
    xlarge: {
      height: "56px",
      padding: "0 24px",
      borderRadius: "var(--radius-button)",
      fontSize: "var(--text-title-2)",
      gap: "8px",
      fontWeight: "var(--font-weight-bold)",
    },
    large: {
      height: "50px",
      padding: "0 24px",
      borderRadius: "var(--radius-button)",
      fontSize: "var(--text-title-2)",
      gap: "8px",
    },
    medium: {
      height: "44px",
      padding: "0 24px",
      borderRadius: "var(--radius-small)",
      fontSize: "var(--text-title-2)",
      gap: "8px",
    },
    small: {
      height: "32px",
      padding: "0 12px",
      borderRadius: "var(--radius-small)",
      fontSize: "var(--text-title-3)",
      gap: "4px",
    },
  }[size];

  let border =
    isFilled || isGhost || isTertiary
      ? "1px solid transparent"
      : "1px solid var(--feature-brand-primary)";
  let bg = isFilled
    ? "var(--feature-brand-primary)"
    : isOutlined
      ? "var(--neutral-surface-primary)"
      : "transparent";
  let textCol = isFilled
    ? "var(--feature-brand-on-primary)"
    : "var(--feature-brand-primary)";

  if (isDanger) {
    border = "1px solid var(--status-red-primary)";
    bg = "transparent";
    textCol = "var(--status-red-primary)";
  }

  if (isGhost) {
    textCol = "var(--neutral-on-surface-secondary)";
  }

  if (disabled) {
    border = "1px solid transparent";
    bg = "var(--neutral-surface-grey-lighter)";
    textCol = "var(--neutral-on-surface-tertiary)";
  }

  const computedPadding = isTertiary
    ? size === "small"
      ? "0 4px"
      : "0 8px"
    : sizeStyles.padding;

  const baseStyles = {
    "--ds-button-border": border,
    "--ds-button-bg": bg,
    "--ds-button-color": textCol,
    "--ds-button-cursor": disabled ? "not-allowed" : "pointer",
    "--ds-button-height": sizeStyles.height,
    "--ds-button-padding": computedPadding,
    "--ds-button-radius": sizeStyles.borderRadius,
    "--ds-button-font-size": sizeStyles.fontSize,
    "--ds-button-gap": sizeStyles.gap,
    "--ds-button-font-weight": isTertiary
      ? "var(--font-weight-bold)"
      : sizeStyles.fontWeight || "var(--font-weight-regular)",
    background: bg,
    boxShadow: "none",
  };

  return (
    <button
      type={type}
      className={`ds-button ${className}`.trim()}
      style={{
        ...baseStyles,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        ...style,
      }}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      onMouseEnter={(e) => {
        if (disabled) return;
        if (isFilled) {
          e.currentTarget.style.background = "#005CE8";
          e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,104,255,0.28)";
        } else if (isDanger) {
          e.currentTarget.style.background = "var(--status-red-container)";
        } else if (isGhost) {
          e.currentTarget.style.background =
            "var(--neutral-surface-grey-lighter)";
          e.currentTarget.style.color = "var(--neutral-on-surface-primary)";
        } else if (isTertiary) {
          e.currentTarget.style.background =
            "var(--feature-brand-container-lighter)";
        } else {
          e.currentTarget.style.background =
            "var(--feature-brand-container-lighter)";
        }
      }}
      onMouseLeave={(e) => {
        if (disabled) return;
        if (isFilled) {
          e.currentTarget.style.background = "var(--feature-brand-primary)";
          e.currentTarget.style.boxShadow = "none";
        } else if (isDanger) {
          e.currentTarget.style.background = "transparent";
        } else if (isGhost) {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--neutral-on-surface-secondary)";
        } else if (isTertiary) {
          e.currentTarget.style.background = "transparent";
        } else {
          e.currentTarget.style.background = "var(--neutral-surface-primary)";
        }
      }}
      {...props}
    >
      {LeftIcon ? (
        <LeftIcon
          size={
            size === "xlarge" || size === "large"
              ? 20
              : size === "medium"
                ? 18
                : 16
          }
        />
      ) : null}
      <span>{children}</span>
      {RightIcon ? (
        <RightIcon
          size={
            size === "xlarge" || size === "large"
              ? 20
              : size === "medium"
                ? 18
                : 16
          }
        />
      ) : null}
    </button>
  );
};

export { Button };
