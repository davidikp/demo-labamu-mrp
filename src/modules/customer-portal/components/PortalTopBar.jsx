import React from "react";
import { BrandLogoLockup, LogOutIcon } from "../../../components/icons/Icons.jsx";

// Standalone top bar for Customer Portal pages — intentionally not the
// app's own TopHeader (no sidebar/notification-bell dependencies), just the
// Labamu logo plus the (mock) signed-in customer email and a logout icon,
// matching the Figma reference. Sticky so it stays visible while the (often
// long) quote content scrolls underneath it.
export const PortalTopBar = ({ email = "dev@mail.com" }) => (
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
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>{email}</span>
      <LogOutIcon size={18} color="var(--neutral-on-surface-secondary)" />
    </div>
  </div>
);
