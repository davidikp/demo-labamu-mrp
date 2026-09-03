import { useCallback, useState } from "react";

// Shared decision-modal mechanics for the Quote module, mirroring the
// Purchase Order module's usePoDecisionFlow.js pattern. Two different
// callers reuse this: QuoteDetailPage's internal review flow (Submitted →
// Reject / Ask for Revision / Approve) and the Customer Portal (Reject /
// Request Revision / Accept) — each has its own copy and mandatory-comment
// rules, so `getMeta(type)` is injected rather than hardcoded like the PO
// version. The owner (caller) still supplies the actual mutation logic via
// its own `onSubmit`/`handleSubmitDecision` — this hook only owns the modal's
// open/close/comment/error state.
export const useQuoteDecisionFlow = ({ getMeta }) => {
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState("");

  const getDecisionMeta = useCallback(
    () => getMeta?.(decisionType) || {},
    [decisionType, getMeta]
  );

  const openDecisionModal = useCallback((type) => {
    setDecisionType(type);
    setDecisionComment("");
    setDecisionError("");
    setIsDecisionModalOpen(true);
  }, []);

  const closeDecisionModal = useCallback(() => {
    setIsDecisionModalOpen(false);
    setDecisionType(null);
    setDecisionComment("");
    setDecisionError("");
  }, []);

  return {
    isDecisionModalOpen,
    decisionType,
    decisionComment,
    setDecisionComment,
    decisionError,
    setDecisionError,
    getDecisionMeta,
    openDecisionModal,
    closeDecisionModal,
  };
};
