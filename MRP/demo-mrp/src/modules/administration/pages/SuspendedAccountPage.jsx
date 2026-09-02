import React from "react";
import { CancelledCircleIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";

const SUPPORT_EMAIL = "cs@labamu.co.id";

// Full-screen takeover shown app-wide whenever the (simulated) manufacturer
// account status is "Suspended" — mirrors the PRD's "Suspended Account
// Experience" requirement: it replaces the entire Manufacturing workspace,
// cannot be dismissed/bypassed by navigation, and only clears on reactivation
// (which, per the PRD, Labamu performs manually after an appeal review — there
// is no in-app path back out).
export const SuspendedAccountPage = ({ suspensionContext }) => {
  const { customerName, quoteNumber } = suspensionContext || {};

  const mailtoHref = quoteNumber
    ? `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(
        `Suspension appeal — Quote ${quoteNumber}`
      )}`
    : `mailto:${SUPPORT_EMAIL}`;

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
        overflowY: "auto",
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
          Your Labamu Manufacturing account is suspended
        </h1>

        <p
          style={{
            margin: 0,
            fontSize: "var(--text-title-3)",
            color: "var(--neutral-on-surface-secondary)",
            lineHeight: 1.6,
          }}
        >
          Customer <strong>{customerName || "-"}</strong> did not pass the sanctions screening for quote{" "}
          <strong>{quoteNumber || "-"}</strong>. As a result, your account has been suspended and access to
          Labamu Manufacturing is temporarily restricted.
        </p>

        <div
          style={{
            width: "100%",
            marginTop: "8px",
            background: "var(--neutral-surface-grey-lighter, #F5F5F7)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "left",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Appeal this suspension
          </span>
          <span
            style={{
              fontSize: "var(--text-body)",
              color: "var(--neutral-on-surface-secondary)",
              lineHeight: 1.6,
            }}
          >
            Contact Labamu Customer Support at{" "}
            <a href={`mailto:${SUPPORT_EMAIL}`} style={{ color: "var(--feature-brand-primary)" }}>
              {SUPPORT_EMAIL}
            </a>{" "}
            to submit an appeal and provide the requested supporting documents. Your account will remain
            suspended while your appeal is being reviewed.
          </span>
        </div>

        <Button
          variant="filled"
          size="large"
          style={{ width: "100%", marginTop: "8px" }}
          onClick={() => {
            window.location.href = mailtoHref;
          }}
        >
          Contact Customer Support
        </Button>
      </div>
    </div>
  );
};
