import React from "react";
import { Button } from "../../../components/common/Button.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";

// Pure, prop-driven decision modal shared by QuoteDetailPage's internal
// review flow (Reject / Ask for Revision / Approve) and the Customer
// Portal's own decision flow (Reject / Request Revision / Accept). Mirrors
// the Purchase Order module's PoActionValidationModals.jsx decision-modal
// block: the owner supplies `meta` (title/helper/mandatory) and `onSubmit`
// (the actual status mutation) — this component only renders the comment
// textarea and validation state.
export const QuoteDecisionModal = ({
  isOpen,
  onClose,
  meta = {},
  comment,
  onCommentChange,
  error,
  onSubmit,
}) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title={meta.title}
    width="440px"
    footer={
      <div style={{ display: "flex", gap: "12px", width: "100%" }}>
        <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={onClose}>
          Back
        </Button>
        <Button variant="filled" size="large" style={{ flex: 1 }} onClick={onSubmit}>
          Submit
        </Button>
      </div>
    }
  >
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
          {meta.mandatory ? (
            <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>*</span>
          ) : null}
          <span
            style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Comment
          </span>
        </div>
        <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
          {comment.length}/400
        </span>
      </div>
      <textarea
        value={comment}
        maxLength={400}
        onChange={onCommentChange}
        placeholder={meta.helper}
        style={{
          minHeight: "120px",
          border: error
            ? "1px solid var(--status-red-primary)"
            : "1px solid var(--neutral-line-separator-2)",
          borderRadius: "12px",
          padding: "12px 16px",
          background: "var(--neutral-surface-primary)",
          fontSize: "var(--text-subtitle-1)",
          color: "var(--neutral-on-surface-primary)",
          width: "100%",
          outline: "none",
          fontFamily: "Lato, sans-serif",
          resize: "vertical",
          boxSizing: "border-box",
        }}
      />
      {error ? (
        <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{error}</span>
      ) : null}
    </div>
  </GeneralModal>
);
