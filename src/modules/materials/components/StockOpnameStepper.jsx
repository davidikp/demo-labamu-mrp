import React from "react";
import { CheckIcon } from "../../../components/icons/Icons.jsx";

export const UPLOAD_STEPS = [
  { key: "upload", label: "Upload" },
  { key: "mapping", label: "Mapping" },
  { key: "review", label: "Review" },
];

export const Stepper = ({ currentKey, allDone = false }) => {
  const currentIndex = UPLOAD_STEPS.findIndex((s) => s.key === currentKey);
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {UPLOAD_STEPS.map((step, idx) => {
        const isDone = allDone || idx < currentIndex;
        const isActive = !allDone && idx === currentIndex;
        return (
          <React.Fragment key={step.key}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
              <div
                style={{
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "13px",
                  fontWeight: "var(--font-weight-bold)",
                  background: isDone ? "var(--status-green-primary)" : isActive ? "var(--feature-brand-primary)" : "var(--neutral-surface-grey-lighter)",
                  color: isDone || isActive ? "#fff" : "var(--neutral-on-surface-tertiary)",
                }}
              >
                {isDone ? <CheckIcon size={14} color="#fff" /> : idx + 1}
              </div>
              <span style={{ fontSize: "14px", fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-regular)", color: isActive ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)" }}>
                {step.label}
              </span>
            </div>
            {idx < UPLOAD_STEPS.length - 1 && (
              <div style={{ width: "40px", height: "1px", margin: "0 8px", background: isDone ? "var(--status-green-primary)" : "var(--neutral-line-separator-2)" }} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
