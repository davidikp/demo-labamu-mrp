import React from "react";
import { CancelledCircleIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Full-screen takeover shown app-wide whenever the (simulated) manufacturer
// account status is "Suspended" — mirrors the PRD's "Suspended Account
// Experience" requirement: it replaces the entire Manufacturing workspace,
// cannot be dismissed/bypassed by navigation, and only clears on reactivation.
// There is no real backend/session model in this demo, so reactivation is a
// clearly-labeled simulate-only affordance rather than the real manual-appeal
// workflow described in the PRD.
export const SuspendedAccountPage = ({ suspensionContext, onReactivate }) => {
  const { customerName, quoteNumber } = suspensionContext || {};

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 5000,
        background: "var(--neutral-background-primary, #F5F5F7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
      }}
    >
      <div
        style={{
          maxWidth: "560px",
          width: "100%",
          background: "var(--neutral-surface-primary)",
          borderRadius: "20px",
          border: "1px solid var(--neutral-line-separator-1)",
          boxShadow: "var(--elevation-md, 0px 16px 40px rgba(0,0,0,0.12))",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            background: "var(--status-red-light, #FDEAEA)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CancelledCircleIcon size={32} color="var(--status-red-primary)" />
        </div>

        <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
          Your Labamu Manufacturing account has been suspended
        </h1>

        <p style={{ margin: 0, fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.6 }}>
          Your Labamu Manufacturing account has been suspended following a failed sanctions screening
          {customerName ? <> for customer <strong>{customerName}</strong></> : null}
          {quoteNumber ? <> on Quote <strong>{quoteNumber}</strong></> : null}. Please contact Labamu and
          provide the requested information and supporting documents for review.
        </p>

        <div
          style={{
            width: "100%",
            background: "var(--neutral-surface-grey-lighter, #F5F5F7)",
            borderRadius: "12px",
            padding: "16px 20px",
            textAlign: "left",
            fontSize: "var(--text-body)",
            color: "var(--neutral-on-surface-secondary)",
            lineHeight: 1.6,
          }}
        >
          To submit an appeal, contact Labamu Customer Support at{" "}
          <a href="mailto:cs@labamu.co.id" style={{ color: "var(--feature-brand-primary)" }}>
            cs@labamu.co.id
          </a>{" "}
          and provide the required supporting documents. Your account will remain suspended while the
          appeal is reviewed.
        </div>

        <div
          style={{
            width: "100%",
            marginTop: "8px",
            paddingTop: "20px",
            borderTop: "1px dashed var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
            Demo only — reactivation is normally handled manually by Labamu after an appeal review.
          </span>
          <Button variant="outlined" onClick={onReactivate}>
            Simulate: Appeal Approved → Reactivate Account
          </Button>
        </div>
      </div>
    </div>
  );
};
