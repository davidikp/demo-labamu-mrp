import React from "react";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";

// PIC card used on the Customer Portal (Figma shows cards, not a table, with
// an "Approver" badge on PICs that have that role) — a small standalone
// component rather than a PersonInChargeTable card-mode variant, since that
// table has no card layout today and retrofitting one would be a bigger
// change than this component is worth.
export const PortalPicCard = ({ pic }) => (
  <div
    style={{
      border: "1px solid var(--neutral-line-separator-1)",
      borderRadius: "12px",
      padding: "16px",
      display: "flex",
      flexDirection: "column",
      gap: "6px",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
      <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
        {pic.name || "-"}
      </span>
      {pic.role === "Approver" ? (
        <StatusBadge variant="orange-light">Approver</StatusBadge>
      ) : null}
    </div>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
      {pic.phone || "-"}
    </span>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
      {pic.email || "-"}
    </span>
  </div>
);
