import React, { useState } from "react";

// Floating "Customer Portal" launcher, rendered on the Quote Detail page
// right above SimulateScreeningPanel's own trigger. There is no real
// customer auth in this demo, so a small Approver/Viewer toggle lets you
// preview both portal experiences; the portal itself is opened in a new tab
// (window.open) to simulate an external customer following a real link.
export const CustomerPortalLauncher = ({ quoteNo, bottomOffset = 88 }) => {
  const [role, setRole] = useState("approver");

  const handleOpenPortal = () => {
    window.open(`/portal/quote/${quoteNo}?role=${role}`, "_blank", "noopener,noreferrer");
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: `${bottomOffset}px`,
        right: "24px",
        zIndex: 9500,
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "#fff",
        border: "1px solid #E5E7EB",
        borderRadius: "999px",
        padding: "6px",
        boxShadow: "0px 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <div style={{ display: "flex", background: "#F5F5F7", borderRadius: "999px", padding: "2px" }}>
        {["approver", "viewer"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => setRole(option)}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "capitalize",
              cursor: "pointer",
              background: role === option ? "var(--neutral-on-surface-primary, #1A1D23)" : "transparent",
              color: role === option ? "#fff" : "#6B7280",
              transition: "background 0.15s ease",
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={handleOpenPortal}
        style={{
          background: "var(--feature-brand-primary, #0068FF)",
          color: "#fff",
          border: "none",
          borderRadius: "999px",
          padding: "10px 16px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        Customer Portal
      </button>
    </div>
  );
};
