import React, { useEffect, useState } from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Same "confirm with a required reason" pattern as CancelStockOpnameConfirmModal
// — pre-fills the reason with "Stock Opname {stockOpnameNo}" so most users can
// just confirm as-is. The confirmed reason is threaded through to
// applyStockOpnameRows and becomes the `reason` on every Stock Transaction
// Apply creates (see stockOpnameProcessing.js).
export const ApplyStockOpnameConfirmModal = ({ isOpen, onClose, onConfirm, stockOpnameNo }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason(stockOpnameNo ? `Stock Opname ${stockOpnameNo}` : "");
      setError("");
    }
  }, [isOpen, stockOpnameNo]);

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError("Field cannot be empty");
      return;
    }
    onConfirm(reason.trim());
    onClose();
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Apply this Stock Opname?"
      description="Stock quantities will be adjusted based on the counted quantities. This action cannot be undone."
      width="560px"
      hideFooterDivider
      footerPaddingTop={24}
      footer={
        <>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
            Keep Editing
          </Button>
          <Button variant="filled" size="large" onClick={handleConfirm} style={{ flex: 1 }}>
            Yes, Apply
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "var(--status-red-primary)" }}>*</span>
            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>
              Reason
            </span>
          </div>
          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
            {reason.length}/400
          </span>
        </div>
        <textarea
          value={reason}
          maxLength={400}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError("");
          }}
          placeholder="Add a reason for applying this Stock Opname."
          style={{
            minHeight: "120px",
            border: error ? "1px solid var(--status-red-primary)" : "1px solid var(--neutral-line-separator-2)",
            borderRadius: "12px",
            padding: "12px 16px",
            background: "var(--neutral-surface-primary)",
            fontSize: "var(--text-subtitle-1)",
            color: "var(--neutral-on-surface-primary)",
            width: "100%",
            outline: "none",
            fontFamily: "inherit",
            resize: "vertical",
            boxSizing: "border-box",
          }}
        />
        {error && <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{error}</span>}
      </div>
    </GeneralModal>
  );
};
