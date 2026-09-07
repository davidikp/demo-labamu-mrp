import React from "react";

// Floating "Customer Portal" launcher, rendered on the Quote Detail page
// right above SimulateScreeningPanel's own trigger. Opens the portal in a
// new tab (window.open) to simulate an external customer following a real
// link — the Approver/Viewer role toggle lives inside the Customer Portal
// page itself (there's no real customer auth in this demo), not here, so
// switching roles doesn't require reopening the tab.
export const CustomerPortalLauncher = ({ quoteNo, bottomOffset = 88 }) => {
  const handleOpenPortal = () => {
    window.open(`/portal/quote/${quoteNo}`, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      type="button"
      onClick={handleOpenPortal}
      style={{
        position: "fixed",
        bottom: `${bottomOffset}px`,
        right: "24px",
        zIndex: 9500,
        background: "var(--feature-brand-primary, #0068FF)",
        color: "#fff",
        border: "none",
        borderRadius: "999px",
        padding: "12px 18px",
        fontSize: "13px",
        fontWeight: 700,
        cursor: "pointer",
        whiteSpace: "nowrap",
        boxShadow: "0px 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      Customer Portal
    </button>
  );
};
