import React from "react";
import { ListViewIcon, Upload } from "../../../../components/icons/Icons.jsx";

// First screen of the New Stock Opname wizard — PRD "Start Method" AC 1.
// Picking either card just moves the *local* wizard step; neither creates a
// persistent Stock Opname record yet (that only happens on first Save as
// Draft / Apply for manual, or once a file passes validation for upload).
export const OptionCard = ({ icon: Icon, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "12px",
      padding: "24px",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      background: "var(--neutral-surface-primary)",
      cursor: "pointer",
      textAlign: "center",
      transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = "var(--feature-brand-primary)";
      e.currentTarget.style.boxShadow = "0 0 0 1px var(--feature-brand-primary)";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = "var(--neutral-line-separator-1)";
      e.currentTarget.style.boxShadow = "none";
    }}
  >
    <div
      style={{
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        background: "var(--feature-brand-container-lighter)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Icon size={22} color="var(--feature-brand-primary)" />
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <div style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
        {title}
      </div>
      <div style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", lineHeight: "20px" }}>
        {description}
      </div>
    </div>
  </button>
);

export const StartMethodStep = ({ onSelectManual, onSelectUpload }) => (
  <div style={{ padding: "32px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
    <div>
      <div style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
        How do you want to start this Stock Opname?
      </div>
      <div style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)", marginTop: "4px" }}>
        Both options are equal starting points — pick whichever fits your physical count process.
      </div>
    </div>
    <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
      <OptionCard
        icon={ListViewIcon}
        title="Enter Stock Opname Manually"
        description="Add rows one by one and enter the physical Counted Qty directly in Review Data."
        onClick={onSelectManual}
      />
      <OptionCard
        icon={Upload}
        title="Upload Stock Opname File"
        description="Upload a .csv, .xlsx, or .xls file — map its columns, then review the normalized data."
        onClick={onSelectUpload}
      />
    </div>
  </div>
);
