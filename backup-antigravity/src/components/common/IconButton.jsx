import React from "react";

const IconButton = React.forwardRef(
  (
    {
      icon: Icon,
      onClick,
      size = "medium",
      disabled = false,
      color = "var(--feature-brand-primary)",
      hoverBackground = "var(--neutral-surface-grey-lighter)",
      style = {},
      title,
      type = "button",
      ...props
    },
    ref
  ) => {
    const sizeMap = {
      xs: { button: 18, icon: 12, radius: 4 },
      small: { button: 32, icon: 16, radius: 8 },
      medium: { button: 44, icon: 18, radius: 8 },
      large: { button: 50, icon: 20, radius: 12 },
      xlarge: { button: 56, icon: 20, radius: 12 },
    }[size];

    return (
      <button
        ref={ref}
        type={type}
        title={title}
        className="ds-icon-button"
        onClick={disabled ? undefined : onClick}
        disabled={disabled}
        style={{
          "--ds-icon-button-size": `${sizeMap.button}px`,
          "--ds-icon-button-radius": `${sizeMap.radius}px`,
          "--ds-icon-button-bg": disabled
            ? "var(--neutral-surface-grey-lighter)"
            : "transparent",
          "--ds-icon-button-cursor": disabled ? "not-allowed" : "pointer",
          ...style,
        }}
        onMouseEnter={(e) => {
          if (disabled) return;
          e.currentTarget.style.background = hoverBackground;
        }}
        onMouseLeave={(e) => {
          if (disabled) return;
          e.currentTarget.style.background = "transparent";
        }}
        {...props}
      >
        <Icon
          size={sizeMap.icon}
          color={disabled ? "var(--neutral-on-surface-tertiary)" : color}
        />
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

export { IconButton };
