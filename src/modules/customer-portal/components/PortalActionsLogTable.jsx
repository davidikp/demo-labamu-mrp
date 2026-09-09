import React from "react";
import { useIsMobile } from "../../../hooks/useIsMobile.js";

// "Actions" history table on the Customer Portal (PIC email / Action / Time),
// fed by the quote's real, persisted `actionLogs` array (see
// appendQuoteActionLog in quoteMocks.js) rather than the main app's
// synthesized-on-the-fly Activity Logs.
export const PortalActionsLogTable = ({ actionLogs = [] }) => {
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        borderRadius: "16px",
        border: "1px solid var(--neutral-line-separator-1)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px 24px 0 24px" }}>
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Actions</span>
      </div>
      <div style={{ padding: "20px 24px 24px 24px" }}>
        {!isMobile ? (
          <div
            style={{
              display: "flex",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              fontWeight: "var(--font-weight-bold)",
              fontSize: "var(--text-title-3)",
            }}
          >
            <div style={{ flex: "1.4" }}>PIC</div>
            <div style={{ flex: "1" }}>Action</div>
            <div style={{ width: "190px" }}>Time</div>
          </div>
        ) : null}
        {actionLogs.length === 0 ? (
          <div style={{ padding: "24px 0", color: "var(--neutral-on-surface-tertiary)" }}>No actions yet.</div>
        ) : (
          actionLogs.map((log, idx) =>
            isMobile ? (
              <div
                key={log.id || idx}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  padding: "14px 0",
                  borderBottom: idx === actionLogs.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                  <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{log.action}</span>
                  <span style={{ color: "var(--neutral-on-surface-secondary)", flexShrink: 0 }}>{log.timestamp}</span>
                </div>
                <span style={{ color: "var(--neutral-on-surface-primary)" }}>{log.picEmail}</span>
              </div>
            ) : (
              <div
                key={log.id || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "14px 0",
                  borderBottom: idx === actionLogs.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div style={{ flex: "1.4", color: "var(--neutral-on-surface-primary)" }}>{log.picEmail}</div>
                <div style={{ flex: "1", color: "var(--neutral-on-surface-primary)" }}>{log.action}</div>
                <div style={{ width: "190px", color: "var(--neutral-on-surface-secondary)" }}>{log.timestamp}</div>
              </div>
            )
          )
        )}
      </div>
    </div>
  );
};
