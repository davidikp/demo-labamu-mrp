import React, { useState } from "react";
import { LabamuLogo } from "../../../ce-ui";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Public, unauthenticated "Input WhatsApp Number" login screen. Rendered as
// the background surface behind the suspended-account modal (per the PRD's
// Suspended Account Experience: a failed-sanctions-screening account is
// signed out, landing back here, with the suspension explained in a modal on
// top instead of the ordinary login flow).
export const LoginPage = ({ onLogin }) => {
  const [phone, setPhone] = useState("");
  const [agreed, setAgreed] = useState(false);

  const canSubmit = agreed && phone.trim().length > 0;

  // Decorative rounded squares scattered over the brand-blue backdrop, per
  // the reference login screen — purely visual, sits behind the card.
  const decorativeSquares = [
    { top: "-6%", left: "-8%", size: "260px", rotate: "18deg" },
    { top: "8%", left: "22%", size: "160px", rotate: "-12deg" },
    { top: "-4%", right: "6%", size: "220px", rotate: "-15deg" },
    { top: "38%", right: "-6%", size: "240px", rotate: "20deg" },
    { bottom: "-8%", left: "-6%", size: "260px", rotate: "-16deg" },
    { bottom: "10%", left: "30%", size: "150px", rotate: "14deg" },
    { bottom: "-10%", right: "10%", size: "280px", rotate: "12deg" },
  ];

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "var(--feature-brand-primary, #3B63F0)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        overflow: "hidden",
      }}
    >
      {decorativeSquares.map((sq, i) => (
        <div
          key={i}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: sq.top,
            bottom: sq.bottom,
            left: sq.left,
            right: sq.right,
            width: sq.size,
            height: sq.size,
            borderRadius: "48px",
            background: "rgba(255, 255, 255, 0.08)",
            transform: `rotate(${sq.rotate})`,
            pointerEvents: "none",
          }}
        />
      ))}

      <div
        style={{
          position: "relative",
          maxWidth: "440px",
          width: "100%",
          background: "var(--neutral-surface-primary, #FFFFFF)",
          borderRadius: "24px",
          boxShadow: "var(--elevation-lg, 0px 24px 48px rgba(0,0,0,0.24))",
          padding: "40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: "8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <LabamuLogo width={32} height={32} />
          <div style={{ textAlign: "left" }}>
            <div style={{ fontSize: "22px", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)" }}>
              Labamu
            </div>
            <div style={{ fontSize: "11px", fontWeight: "var(--font-weight-bold)", fontStyle: "italic", color: "var(--neutral-on-surface-primary)" }}>
              #Growth Simplified
            </div>
          </div>
        </div>

        <h1 style={{ margin: 0, fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)" }}>
          Input WhatsApp Number
        </h1>
        <p style={{ margin: "0 0 16px", fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
          The OTP code will be sent to your WhatsApp number
        </p>

        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            paddingBottom: "8px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "20px", lineHeight: 1 }}>🇮🇩</span>
            <span style={{ fontSize: "var(--text-body)" }}>+62</span>
          </div>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="8123-4567-8901"
            style={{
              flex: 1,
              border: "none",
              outline: "none",
              fontSize: "var(--text-body)",
              color: "var(--neutral-on-surface-primary)",
              background: "transparent",
            }}
          />
        </div>

        <label
          style={{
            width: "100%",
            display: "flex",
            alignItems: "flex-start",
            gap: "8px",
            marginTop: "24px",
            textAlign: "left",
            fontSize: "var(--text-body-small)",
            color: "var(--neutral-on-surface-primary)",
            cursor: "pointer",
          }}
        >
          <Checkbox checked={agreed} onChange={setAgreed} style={{ marginTop: "2px" }} />
          <span>
            I agree to Labamu's{" "}
            <a href="#" style={{ color: "var(--feature-brand-primary)" }} onClick={(e) => e.preventDefault()}>
              Terms &amp; Conditions
            </a>{" "}
            and{" "}
            <a href="#" style={{ color: "var(--feature-brand-primary)" }} onClick={(e) => e.preventDefault()}>
              Privacy Policy
            </a>
          </span>
        </label>

        <Button
          variant="filled"
          size="large"
          disabled={!canSubmit}
          style={{ width: "100%", marginTop: "16px" }}
          onClick={() => onLogin && onLogin()}
        >
          Login
        </Button>

        <div style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", margin: "16px 0" }}>
          <div style={{ flex: 1, height: "1px", background: "var(--neutral-line-separator-1)" }} />
          <span style={{ fontSize: "var(--text-body-small)", color: "var(--neutral-on-surface-secondary)" }}>Or</span>
          <div style={{ flex: 1, height: "1px", background: "var(--neutral-line-separator-1)" }} />
        </div>

        <button
          type="button"
          onClick={() => onLogin && onLogin()}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            color: "var(--feature-brand-primary)",
            fontWeight: "var(--font-weight-bold)",
            fontSize: "var(--text-body)",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path d="m3.5 6 8.5 7 8.5-7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Login with Email
        </button>
      </div>
    </div>
  );
};
