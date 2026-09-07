import React from "react";
import { CancelledCircleIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";

const SUPPORT_EMAIL = "cs@labamu.co.id";

// Suspended-account modal shown over the login page whenever the (simulated)
// manufacturer account status is "Suspended" — mirrors the PRD's "Suspended
// Account Experience" requirement. The account is signed out automatically,
// so the surface behind this modal is the login page; closing the modal just
// reveals that login page, and attempting to log back into the same account
// re-opens this modal instead of letting the login succeed.
export const SuspendedAccountPage = ({ suspensionContext, onClose }) => {
  const { quoteNumber } = suspensionContext || {};

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
        background: "rgba(15, 17, 21, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
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
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "none",
            borderRadius: "50%",
            color: "var(--neutral-on-surface-secondary)",
            cursor: "pointer",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M12 4L4 12M4 4l8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>

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
          Your account has been suspended due to an issue identified during sanctions screening. Access to Labamu
          Manufacturing is temporarily restricted.
        </p>

        <div
          style={{
            width: "100%",
            marginTop: "8px",
            background: "var(--neutral-surface-grey-lighter, #F5F5F7)",
            borderRadius: "12px",
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
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
