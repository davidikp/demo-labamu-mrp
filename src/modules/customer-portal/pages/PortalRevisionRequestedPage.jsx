import React from "react";
import { BrandLogoLockup, HourglassIcon } from "../../../components/icons/Icons.jsx";

// Standalone full-screen confirmation shown after a customer submits a
// Request Revision decision in the Customer Portal — mirrors
// SuspendedAccountPage.jsx's fixed-inset/centered-card takeover pattern, but
// on its own blue background per the Figma reference, with no top bar and no
// quote content (the customer's turn is over until the seller responds).
export const PortalRevisionRequestedPage = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      zIndex: 5000,
      background: "var(--feature-brand-primary, #0068FF)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      overflowY: "auto",
    }}
  >
    <div
      style={{
        maxWidth: "420px",
        width: "100%",
        background: "#fff",
        borderRadius: "20px",
        boxShadow: "0px 24px 60px rgba(0,0,0,0.25)",
        padding: "40px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: "16px",
      }}
    >
      <BrandLogoLockup width={140} />

      <div
        style={{
          width: "88px",
          height: "88px",
          borderRadius: "50%",
          background: "var(--neutral-surface-grey-lighter, #F5F5F7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "8px",
        }}
      >
        <HourglassIcon size={40} color="var(--neutral-on-surface-secondary)" />
      </div>

      <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
        Revision Requested
      </h1>

      <p
        style={{
          margin: 0,
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
          lineHeight: 1.6,
        }}
      >
        You've submitted a revision request. Please wait while the seller reviews your changes.
      </p>
    </div>
  </div>
);
