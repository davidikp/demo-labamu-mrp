import React, { useState, useEffect } from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";

// Same "cancel with required reason" flow as materials/components/
// CancelUploadConfirmModal.jsx (Bulk Upload's own Mapping/Review Cancel
// button) — reused here for Stock Opname's Mapping/Review Cancel button
// instead of jumping straight to Cancelled. The reason becomes the "Stock
// Opname Cancelled" activity log's description (see
// StockOpnameNewPage.handleCancel).
export const CancelStockOpnameConfirmModal = ({ isOpen, onClose, onConfirm }) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
      setError("");
    }
  }, [isOpen]);

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
      title="Cancel this Stock Opname?"
      description="You won’t be able to continue this Stock Opname. It will remain in the Stock Opname list with a Cancelled status."
      width="560px"
      hideFooterDivider
      footerPaddingTop={24}
      footer={
        <>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
            Keep Editing
          </Button>
          <Button variant="danger-filled" size="large" onClick={handleConfirm} style={{ flex: 1 }}>
            Yes, Cancel
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: "var(--status-red-primary)" }}>*</span>
            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)" }}>
              Cancellation Reason
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
          placeholder="Add a reason for canceling this Stock Opname."
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
