import React from "react";

const StatusBadge = ({ variant = "grey", children }) => {
  const getColors = () => {
    switch (variant) {
      case "blue":
        return {
          bg: "var(--feature-brand-primary)",
          color: "var(--feature-brand-on-primary)",
        };
      case "green":
        return {
          bg: "var(--status-green-primary)",
          color: "var(--status-green-on-primary)",
        };
      case "yellow":
        return {
          bg: "var(--status-yellow-primary)",
          color: "var(--status-yellow-on-primary)",
        };
      case "orange":
        return {
          bg: "var(--status-orange-primary)",
          color: "var(--status-orange-on-primary)",
        };
      case "red":
        return {
          bg: "var(--status-red-primary)",
          color: "var(--status-red-on-primary)",
        };
      case "blue-light":
        return { bg: "#E6F0FF", color: "#005DE0" };
      case "grey-light":
        return { bg: "var(--neutral-line-separator-1)", color: "#535353" };
      case "yellow-light":
        return { bg: "#FEFAE8", color: "#E0B20C" };
      case "green-light":
        return { bg: "#EEF6EC", color: "#52A33E" };
      case "red-light":
        return { bg: "#FAE6E8", color: "var(--status-red-primary)" };
      case "orange-light":
        return {
          bg: "var(--status-orange-container)",
          color: "var(--status-orange-on-container)",
        };
      case "grey":
      default:
        return {
          bg: "var(--neutral-on-surface-tertiary)",
          color: "var(--status-grey-on-primary)",
        };
    }
  };

  const { bg, color } = getColors();

  return (
    <div
      className="ds-badge"
      style={{
        "--ds-badge-bg": bg,
        "--ds-badge-color": color,
      }}
    >
      {children}
    </div>
  );
};

export { StatusBadge };
