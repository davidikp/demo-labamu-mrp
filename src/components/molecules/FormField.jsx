import React from "react";

export const FormField = ({
  label,
  required = false,
  children,
  error,
  helperText,
  headerRight,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "4px",
      width: "100%",
    }}
  >
    {label || headerRight ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          {required ? (
            <span style={{ fontSize: "14px", lineHeight: "20px", fontWeight: "bold", color: "var(--status-red-primary)" }}>*</span>
          ) : null}
          {label && (
            <span style={{ fontSize: "12px", lineHeight: "20px", color: "var(--neutral-on-surface-primary)" }}>
              {label}
            </span>
          )}
        </div>
        {headerRight && (
          <span style={{ color: "var(--neutral-on-surface-tertiary)", fontSize: "12px" }}>
            {headerRight}
          </span>
        )}
      </div>
    ) : null}
    {children}
    {error ? (
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--status-red-primary)",
          marginTop: "0px",
        }}
      >
        {error}
      </span>
    ) : null}
    {!error && helperText ? (
      <span
        style={{
          fontSize: "var(--text-body)",
          // Matches ce-ui TextField's own helper-text color (text-lb-on-surface-3)
          // so a FormField-wrapped field (e.g. Customer Tag/Phone) reads the
          // same as one routed through ce-ui's TextField (e.g. Customer Email).
          color: "#9CA3AF",
          marginTop: "0px",
        }}
      >
        {helperText}
      </span>
    ) : null}
  </div>
);
