import React from "react";
import { GeneralModal } from "../../../../../components/modal/GeneralModal.jsx";
import { Info } from "../../../../../components/icons/Icons.jsx";
import {
  Button,
  InputField,
  UploadDropzone,
  UploadDescriptionCard,
} from "../shared/PoDetailSharedComponents.jsx";

const PoReceiptModals = ({
  // Adjust WO Modal Props
  showAdjustWoModal,
  setShowAdjustWoModal,
  handleContinueFromAdjustWo,

  // Confirm Receipt Modal Props
  showConfirmReceiptModal,
  setShowConfirmReceiptModal,
  showAutoAdjustWoMessage,
  receiptReceivedBy,
  setReceiptReceivedBy,
  receiptNotes,
  setReceiptNotes,
  handleSubmitReceipt,
  receiptProofDocuments,
  setReceiptProofDocuments,
  receiptProofUploadError,
  setReceiptProofUploadError,
  receiptProofDescriptionErrors,
  setReceiptProofDescriptionErrors,
  MAX_PROOF_UPLOAD_FILES,
  handleReceiptProofFilesSelected,
  updateReceiptProofDescription,
  removeReceiptProofDocument,
}) => {
  return (
    <>
      {/* Adjust WO Modal */}
      <GeneralModal
        isOpen={showAdjustWoModal}
        onClose={() => setShowAdjustWoModal(false)}
        title="Adjust Related Work Order?"
        width="480px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => setShowAdjustWoModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              onClick={handleContinueFromAdjustWo}
            >
              Continue
            </Button>
          </div>
        }
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-regular)",
              color: "var(--neutral-on-surface-secondary)",
              lineHeight: "24px",
            }}
          >
            The related work order does not yet reflect the quantity required
            for this receipt. If you continue, the system will automatically
            update the routing quantity to match this receipt.
          </span>
        </div>
      </GeneralModal>

      {/* Confirm Receipt Modal */}
      <GeneralModal
        isOpen={showConfirmReceiptModal}
        onClose={() => {
          setShowConfirmReceiptModal(false);
          setReceiptProofDocuments([]);
          setReceiptProofUploadError("");
          setReceiptProofDescriptionErrors({});
          setReceiptNotes("");
        }}
        title="Confirm Receipt"
        width="680px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ flex: 1 }}
              onClick={() => {
                setShowConfirmReceiptModal(false);
                setReceiptProofDocuments([]);
                setReceiptProofUploadError("");
                setReceiptProofDescriptionErrors({});
                setReceiptNotes("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ flex: 1 }}
              disabled={false}
              onClick={handleSubmitReceipt}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {showAutoAdjustWoMessage && (
            <div
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "8px",
                background: "var(--feature-brand-container-darker)",
                border: "1px solid var(--feature-brand-container-darker)",
              }}
            >
              <Info
                size={16}
                strokeWidth={2.1}
                color="var(--feature-brand-primary)"
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-regular)",
                  color: "var(--neutral-on-surface-primary)",
                  lineHeight: "20px",
                }}
              >
                The related work order will be automatically updated to match
                this receipt.
              </span>
            </div>
          )}
          <InputField
            label="Received By"
            required
            value={receiptReceivedBy}
            onChange={(e) => setReceiptReceivedBy(e.target.value)}
            placeholder="Enter receiver name"
          />
          <InputField
            label="Notes"
            multiline
            placeholder="Add note for this receipt"
            value={receiptNotes}
            onChange={(e) => setReceiptNotes(e.target.value.slice(0, 1000))}
            maxLength={1000}
            headerRight={`${receiptNotes.length}/1000`}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Upload Proof Document
              </span>
            </div>
            <UploadDropzone
              maxFiles={MAX_PROOF_UPLOAD_FILES}
              multiple
              disabled={receiptProofDocuments.length >= MAX_PROOF_UPLOAD_FILES}
              error={receiptProofUploadError}
              onFilesSelected={handleReceiptProofFilesSelected}
            />
            {receiptProofDocuments.length > 0 && (
              <div
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {receiptProofDocuments.map((doc) => (
                  <UploadDescriptionCard
                    key={doc.id}
                    file={doc}
                    descriptionRequired
                    descriptionError={receiptProofDescriptionErrors[doc.id]}
                    onDescriptionChange={(value) =>
                      updateReceiptProofDescription(doc.id, value)
                    }
                    onRemove={() => removeReceiptProofDocument(doc.id)}
                  />
                ))}
              </div>
            )}
            {receiptProofUploadError && (
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--status-red-primary)",
                }}
              >
                {receiptProofUploadError}
              </span>
            )}
          </div>
        </div>
      </GeneralModal>
    </>
  );
};

export default PoReceiptModals;
