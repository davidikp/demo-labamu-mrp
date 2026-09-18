import React, { useEffect, useState } from "react";
import { CloseIcon, CloudUploadIcon, FileIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { DocumentTypeBadge } from "./StockBatchesTab.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FormField, InputField } from "../../../components/index.js";
import { TextField } from "../../../ce-ui";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import { DateInputControl } from "./StockBatchesTab.jsx";

// Same layout as the shared LabelValue, but lets the "Review Batch" view
// de-emphasize the lower fields (Cost per Unit onward) while keeping the
// top identity fields (Material/Batch/Qty) bold.
const ReadOnlyField = ({ label, value, bold = false }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{label}</span>
    <span style={{ fontSize: "var(--text-title-3)", fontWeight: bold ? "var(--font-weight-bold)" : "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
      {value}
    </span>
  </div>
);

const withUnitText = (value, unit) => (value == null || value === "" ? "-" : unit ? `${value} ${unit}` : String(value));

const formatReadOnlyDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
};

const emptyPendingBatch = () => ({
  costPerUnit: "",
  purchaseDate: "",
  expiryDate: "",
  expectedDate: "",
  receivedDate: "",
  storageLocation: "",
  vendor: "",
  attachments: [],
  notes: "",
});

// "+ Create New Batch" drawer for a Stock Opname Review row (PRD "New Batch
// Handling" AC 2-7). Trimmed down from StockBatchesTab.jsx's Add Batch
// drawer: Initial Quantity always mirrors the row's latest Counted Qty and
// is read-only, and Status isn't shown at all — a Batch created through
// Stock Opname always lands as "Received" once Apply actually creates it
// (System Rules). Nothing here touches batchesStore — the drawer only
// returns pending data the row holds locally until Apply.
//
// Also doubles as the read-only "Review Batch" view for a row's already-
// resolved existing Batch (viewBatch set, readOnly true) — same layout,
// but every field is disabled, Vendor/Notes render as plain text instead of
// editable controls, and the footer is just a single Close button. Batch
// No/Current Qty/Status only render in that mode since a pending Batch
// doesn't have them yet.
export const StockOpnameNewBatchDrawer = ({ isOpen, onClose, onSave, materialUnit, materialName, materialSku, countedQty, initialPendingBatch, readOnly = false, viewBatch = null }) => {
  const [form, setForm] = useState(emptyPendingBatch());
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const seed = readOnly && viewBatch ? viewBatch : initialPendingBatch;
      setForm(seed ? { ...emptyPendingBatch(), ...seed } : emptyPendingBatch());
      setErrors({});
    }
  }, [isOpen, initialPendingBatch, readOnly, viewBatch]);

  if (!isOpen) return null;

  const title = readOnly ? "Review Batch" : initialPendingBatch ? "Edit New Batch" : "Create New Batch";

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setForm((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...files.map((file) => ({ file, description: "" }))],
    }));
  };

  const removeFile = (idx) => setForm((prev) => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }));

  // Required-field check mirrors the Add Batch drawer's own (Purchase Date
  // is required there too) — PRD AC 6: incomplete pending Batch info keeps
  // the row invalid/Need Attention until this passes.
  const validate = () => {
    const next = {};
    if (!form.purchaseDate) next.purchaseDate = "This field cannot be empty";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form });
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.28)", display: "flex", justifyContent: "flex-end", zIndex: 14000 }}>
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />
      <div style={{ position: "relative", width: "480px", maxWidth: "calc(100vw - 24px)", height: "100vh", background: "var(--neutral-surface-primary)", boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--neutral-line-separator-1)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ margin: 0, fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            {title}
          </h2>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          {readOnly && viewBatch ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px 16px",
              }}
            >
              <ReadOnlyField label="Material Name" value={materialName || "-"} bold />
              <ReadOnlyField label="Material SKU" value={materialSku || "-"} bold />
              <ReadOnlyField label="Batch No" value={viewBatch.batchNo} bold />
              <ReadOnlyField label="Status" value={viewBatch.status} bold />
              <ReadOnlyField label="Initial Quantity" value={withUnitText(viewBatch.initialQty, materialUnit)} bold />
              <ReadOnlyField label="Current Qty" value={withUnitText(viewBatch.currentQty, materialUnit)} bold />
              <ReadOnlyField label="Cost per Unit" value={viewBatch.costPerUnit != null && viewBatch.costPerUnit !== "" ? `IDR ${viewBatch.costPerUnit}` : "-"} />
              <ReadOnlyField label="Purchase Date" value={formatReadOnlyDate(viewBatch.purchaseDate)} />
              <ReadOnlyField label="Expected Date" value={formatReadOnlyDate(viewBatch.expectedDate)} />
              <ReadOnlyField label="Received Date" value={formatReadOnlyDate(viewBatch.receivedDate)} />
              <ReadOnlyField label="Expiry Date" value={formatReadOnlyDate(viewBatch.expiryDate)} />
              <ReadOnlyField label="Storage Location" value={viewBatch.storageLocation || "-"} />
              <ReadOnlyField label="Vendor" value={viewBatch.vendor || "-"} />
              <ReadOnlyField label="Notes" value={viewBatch.notes || "-"} />

              <div style={{ gridColumn: "1 / -1", display: "flex", flexDirection: "column", gap: "8px" }}>
                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Attachments</span>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {(!viewBatch.attachments || viewBatch.attachments.length === 0) && (
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>No attachments.</span>
                  )}
                  {(viewBatch.attachments || []).map((att, idx) => (
                    <div key={`${att.file?.name}-${idx}`} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "8px 12px", border: "1px solid var(--neutral-line-separator-1)", borderRadius: "8px" }}>
                      <DocumentTypeBadge fileName={att.file?.name || "document.pdf"} />
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {att.description || "Proof Document"}
                        </span>
                        <span style={{ fontSize: "12px", color: "var(--feature-brand-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {att.file?.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              <InputField
                label="Initial Quantity"
                type="text"
                value={String(countedQty ?? 0)}
                disabled
                suffix={materialUnit || "Pcs"}
                helperText="Always follows the row's latest Counted Qty until Apply."
              />

              <InputField
                label="Cost per Unit"
                type="text"
                value={form.costPerUnit}
                onChange={(e) => setForm({ ...form, costPerUnit: e.target.value.replace(/[^0-9]/g, "") })}
                placeholder="0"
                prefix="IDR"
              />

              <FormField label="Purchase Date" required error={errors.purchaseDate}>
                <DateInputControl
                  value={form.purchaseDate}
                  onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })}
                  hasError={!!errors.purchaseDate}
                  maxDate={new Date().toISOString().split("T")[0]}
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Expiry Date">
                  <DateInputControl value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} />
                </FormField>
                <FormField label="Expected Date">
                  <DateInputControl value={form.expectedDate} onChange={(e) => setForm({ ...form, expectedDate: e.target.value })} />
                </FormField>
              </div>

              <FormField label="Received Date">
                <DateInputControl value={form.receivedDate} onChange={(e) => setForm({ ...form, receivedDate: e.target.value })} />
              </FormField>

              <InputField
                label="Storage Location"
                value={form.storageLocation}
                onChange={(e) => setForm({ ...form, storageLocation: e.target.value })}
                placeholder="Enter storage location"
              />

              <FormField label="Vendor">
                <DropdownSelect
                  value={form.vendor}
                  onChange={(val) => setForm({ ...form, vendor: val })}
                  options={MOCK_VENDORS.map((v) => ({ value: v.name, label: v.name }))}
                  placeholder="Select vendor"
                  searchable
                  hideSearchIcon
                />
              </FormField>

              <TextField
                label="Notes"
                multiline
                rows={3}
                showCount
                maxLength={400}
                placeholder="Add notes..."
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />

              <FormField label="Attachments">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "140px",
                      borderRadius: "16px",
                      border: "2px dashed var(--feature-brand-primary)",
                      padding: "20px",
                      textAlign: "center",
                      cursor: "pointer",
                      gap: "8px",
                    }}
                  >
                    <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} />
                    <CloudUploadIcon size={32} color="var(--feature-brand-primary)" />
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>
                      Drag file or <span style={{ color: "var(--feature-brand-primary)" }}>browse file</span>
                    </span>
                  </label>
                  {form.attachments.map((att, idx) => (
                    <div key={`${att.file?.name}-${idx}`} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 12px", border: "1px solid var(--neutral-line-separator-1)", borderRadius: "8px" }}>
                      <FileIcon size={16} color="var(--neutral-on-surface-secondary)" />
                      <span style={{ flex: 1, fontSize: "var(--text-title-3)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{att.file?.name}</span>
                      <IconButton icon={DeleteIcon} onClick={() => removeFile(idx)} size="small" color="var(--status-red-primary)" />
                    </div>
                  ))}
                </div>
              </FormField>
            </>
          )}
        </div>

        {!readOnly && (
          <div style={{ padding: "20px 24px", borderTop: "1px solid var(--neutral-line-separator-1)", display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>Save</Button>
          </div>
        )}
      </div>
    </div>
  );
};
