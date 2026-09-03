import React from "react";

// Accept/Reject result toast on the Customer Portal — green "Quote
// accepted" or dark "Quote rejected", each with an "Okay" dismiss button,
// matching the Figma result states.
export const PortalToast = ({ variant, message, onDismiss }) => (
  <div
    style={{
      position: "fixed",
      top: "20px",
      right: "24px",
      zIndex: 6000,
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "12px 16px",
      borderRadius: "12px",
      background: variant === "success" ? "var(--status-green-primary, #1E8E3E)" : "var(--neutral-on-surface-primary, #1A1D23)",
      color: "#fff",
      boxShadow: "0px 8px 24px rgba(0,0,0,0.22)",
    }}
  >
    <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>{message}</span>
    <button
      type="button"
      onClick={onDismiss}
      style={{
        border: "none",
        background: "rgba(255,255,255,0.16)",
        color: "#fff",
        borderRadius: "8px",
        padding: "6px 14px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
      }}
    >
      Okay
    </button>
  </div>
);
