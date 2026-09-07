import React from "react";
import { BrandLogoLockup, LogOutIcon } from "../../../components/icons/Icons.jsx";

// Standalone top bar for Customer Portal pages — intentionally not the
// app's own TopHeader (no sidebar/notification-bell dependencies), just the
// Labamu logo, a demo-only Approver/Viewer role toggle (there's no real
// customer auth in this demo), the (mock) signed-in customer email, and a
// logout icon, matching the Figma reference. Sticky so it stays visible
// while the (often long) quote content scrolls underneath it.
export const PortalTopBar = ({ email = "dev@mail.com", role = "approver", onRoleChange }) => (
  <div
    style={{
      position: "sticky",
      top: 0,
      zIndex: 200,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 32px",
      borderBottom: "1px solid var(--neutral-line-separator-1)",
      background: "var(--neutral-surface-primary)",
    }}
  >
    <BrandLogoLockup width={140} />
    <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
      <div style={{ display: "flex", background: "var(--neutral-surface-grey-lighter, #F5F5F7)", borderRadius: "999px", padding: "2px" }}>
        {["approver", "viewer"].map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onRoleChange?.(option)}
            style={{
              border: "none",
              borderRadius: "999px",
              padding: "6px 12px",
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "capitalize",
              cursor: "pointer",
              background: role === option ? "var(--neutral-on-surface-primary, #1A1D23)" : "transparent",
              color: role === option ? "#fff" : "var(--neutral-on-surface-secondary, #6B7280)",
              transition: "background 0.15s ease",
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>{email}</span>
        <LogOutIcon size={18} color="var(--neutral-on-surface-secondary)" />
      </div>
    </div>
  </div>
);
