import React, { useState } from "react";
import { X } from "../../../components/icons/Icons.jsx";

// Bottom-right "Simulate" panel scoped to the Customer Portal — mirrors
// SimulateScreeningPanel.jsx (used on the MRP Portal's Quote Detail page)
// but for the *Customer Portal's* own screening rule (PRD: Customer Portal —
// Quote Acceptance Sanctions Screening): unlike the MRP Portal, the Customer
// Portal never calls Sanctions.io itself — Accept Quote only checks whether
// a valid Passed result already exists for the customer's current name and
// country, and blocks acceptance (directing the customer to the
// Manufacturing administrator) otherwise. Checking a scenario here directly
// arms the linked customer's mock screening state so Accept Quote's
// eligibility check has something real to evaluate.
const SCENARIOS = [
  { key: "valid_passed", label: "Valid Passed result → Accept allowed" },
  { key: "never_screened", label: "Never screened → Accept blocked" },
  { key: "missing_country", label: "Missing country → Accept blocked" },
  { key: "stale_passed", label: "Stale Passed (name/country changed) → Accept blocked" },
  { key: "expired_passed", label: "Passed but expired (>3 months) → Accept blocked" },
];

export const PortalSimulateScreeningPanel = ({ customer, armedScenario, onToggleScenario, onReset, bottomOffset = 24 }) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          data-no-localize
          style={{
            position: "fixed",
            bottom: `${bottomOffset}px`,
            right: "24px",
            zIndex: 9000,
            background: "var(--neutral-on-surface-primary, #1A1D23)",
            color: "#fff",
            border: "none",
            borderRadius: "999px",
            padding: "12px 18px",
            fontSize: "13px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0px 8px 24px rgba(0,0,0,0.25)",
          }}
        >
          ⚡ Simulate Screening
        </button>
      ) : null}

      {open ? (
        <div
          style={{
            position: "fixed",
            bottom: `${bottomOffset}px`,
            right: "24px",
            zIndex: 9001,
            width: "360px",
            maxHeight: "70vh",
            background: "#fff",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            boxShadow: "0px 16px 40px rgba(0,0,0,0.22)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "16px 18px", borderBottom: "1px solid #F0F1F4", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "15px", fontWeight: 700, color: "#1A1D23" }}>Simulate Screening</div>
              <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>
                {customer ? `Customer: ${customer.name}` : "No customer linked to this quote"}
              </div>
              {customer ? (
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  Check a scenario, then use Accept Quote to see the result.
                </div>
              ) : null}
            </div>
            <button type="button" onClick={() => setOpen(false)} style={{ border: "none", background: "transparent", cursor: "pointer", color: "#6B7280", flexShrink: 0 }}>
              <X size={18} />
            </button>
          </div>

          <div style={{ overflowY: "auto", padding: "8px 18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "8px 0" }}>
              {SCENARIOS.map((scenario) => {
                const checked = armedScenario === scenario.key;
                return (
                  <label
                    key={scenario.key}
                    data-no-localize
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 6px",
                      borderRadius: "8px",
                      fontSize: "12px",
                      color: customer ? "#374151" : "#C1C5CB",
                      cursor: customer ? "pointer" : "not-allowed",
                      background: checked ? "#EEF2FF" : "transparent",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      disabled={!customer}
                      onChange={() => onToggleScenario?.(scenario.key)}
                      style={{ width: "16px", height: "16px", cursor: customer ? "pointer" : "not-allowed", flexShrink: 0 }}
                    />
                    {scenario.label}
                  </label>
                );
              })}
            </div>
          </div>

          <div style={{ padding: "10px 18px", borderTop: "1px solid #F0F1F4" }}>
            <button
              type="button"
              disabled={!customer}
              onClick={() => onReset?.()}
              style={{
                width: "100%",
                border: "1px solid #E5E7EB",
                background: "#fff",
                borderRadius: "8px",
                padding: "8px 10px",
                fontSize: "12px",
                color: customer ? "#374151" : "#C1C5CB",
                cursor: customer ? "pointer" : "not-allowed",
              }}
            >
              Reset customer to Not Screened
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
};
