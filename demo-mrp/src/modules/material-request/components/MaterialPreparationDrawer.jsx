import React, { useEffect, useState } from "react";
import { CloseIcon, Info, AddIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { InputField } from "../../../components/molecules/InputField.jsx";
import { ROW_STATUS_META, deriveRowStatusKey, totalAvailable } from "../mock/materialRequestMocks.js";

const thStyle = (overrides = {}) => ({
  padding: "16px 12px",
  textAlign: "left",
  fontWeight: "var(--font-weight-bold)",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  whiteSpace: "nowrap",
  background: "var(--neutral-surface-primary)",
  position: "sticky",
  top: 0,
  zIndex: 5,
  // keeps the header separator visible while the body scrolls under it
  boxShadow: "inset 0 -1px 0 var(--neutral-line-separator-1)",
  ...overrides,
});

const tdStyle = (overrides = {}) => ({
  padding: "16px 12px",
  verticalAlign: "top",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

// Distribute the requested qty across available batches (used to prefill).
const prefillLines = (it) => {
  let remaining = it.requestedQty;
  const lines = [];
  for (const b of it.availableBatches) {
    if (remaining <= 0) break;
    const take = Math.min(b.available, remaining);
    lines.push({ batch: b.batch, qty: take });
    remaining -= take;
  }
  return lines;
};

export const MaterialPreparationDrawer = ({ isOpen, onClose, items = [], onConfirm }) => {
  const [rows, setRows] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [step, setStep] = useState("edit"); // "edit" | "review"

  useEffect(() => {
    if (!isOpen) return;
    setSubmitted(false);
    setStep("edit");
    setRows(items.map((it) => ({ lines: prefillLines(it), reason: "" })));
  }, [isOpen, items]);

  const readOnly = step === "review";

  const updateRow = (idx, patch) =>
    setRows((prev) => prev.map((r, i) => (i === idx ? { ...r, ...patch } : r)));

  const updateLine = (rowIdx, lineIdx, patch) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIdx
          ? { ...r, lines: r.lines.map((l, j) => (j === lineIdx ? { ...l, ...patch } : l)) }
          : r
      )
    );

  const addLine = (rowIdx, firstUnusedBatch) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIdx ? { ...r, lines: [...r.lines, { batch: firstUnusedBatch, qty: 0 }] } : r
      )
    );

  const removeLine = (rowIdx, lineIdx) =>
    setRows((prev) =>
      prev.map((r, i) =>
        i === rowIdx ? { ...r, lines: r.lines.filter((_, j) => j !== lineIdx) } : r
      )
    );

  const computed = items.map((it, idx) => {
    const row = rows[idx] || { lines: [], reason: "" };
    const total = row.lines.reduce((sum, l) => sum + (Number(l.qty) || 0), 0);
    const shortageQty = Math.max(it.requestedQty - total, 0);
    const rowStatusKey = deriveRowStatusKey(it.requestedQty, total);
    return { ...row, total, shortageQty, rowStatusKey, needsReason: shortageQty > 0 };
  });

  const hasInvalid = computed.some((c) => c.needsReason && !c.reason.trim());

  const handleReview = () => {
    if (hasInvalid) {
      setSubmitted(true);
      return;
    }
    setStep("review");
  };

  const handleConfirm = () => {
    if (hasInvalid) {
      setSubmitted(true);
      return;
    }
    const preparedItems = computed.map((c) => ({
      fulfillableQty: c.total,
      shortageQty: c.shortageQty,
      reason: c.reason.trim(),
      batches: c.lines
        .filter((l) => l.batch && Number(l.qty) > 0)
        .map((l) => ({ batch: l.batch, qty: Number(l.qty) })),
    }));
    onConfirm(preparedItems);
  };

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          zIndex: 6000,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      />
      <div
        style={{
          position: "fixed",
          top: 0,
          // Animate via `right` (not `transform`) — a transformed ancestor would
          // break the fixed-positioned dropdown menus rendered inside the drawer.
          right: isOpen ? "0" : "-1220px",
          height: "100vh",
          width: "1200px",
          maxWidth: "100vw",
          background: "var(--neutral-surface-primary)",
          zIndex: 6001,
          boxShadow: "var(--elevation-sm)",
          transition: "right 0.28s ease",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "24px",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "16px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)" }}>
              Material Preparation
            </h2>
            <p style={{ margin: 0, fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
              By continuing, you confirm the allocated materials and will begin preparing items as shown
            </p>
          </div>
          <IconButton
            icon={CloseIcon}
            size="large"
            onClick={onClose}
            color="var(--neutral-on-surface-primary)"
          />
        </div>

        {/* Body (single scroll container so the sticky header tracks vertical scroll) */}
        <div style={{ flex: 1, overflow: "auto", padding: "0 24px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <th style={thStyle({ width: "44px" })}>No</th>
                <th style={thStyle({ width: "84px" })}>Type</th>
                <th style={thStyle({ width: "280px" })}>Material</th>
                <th style={thStyle({ width: "120px" })}>Requested Qty</th>
                <th style={thStyle({ width: "356px" })}>Fulfillable Qty</th>
                <th style={thStyle({ width: "96px" })}>Shortage Qty</th>
                <th style={thStyle({ width: "120px" })}>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => {
                const c = computed[idx] || { lines: [], reason: "" };
                const meta = ROW_STATUS_META[c.rowStatusKey] || ROW_STATUS_META.not_started;
                const stock = totalAvailable(it.availableBatches);
                const isNonBom = it.type === "Non-BOM";
                const reasonError = submitted && c.needsReason && !c.reason.trim();
                const usedBatches = c.lines.map((l) => l.batch);
                const unusedBatches = it.availableBatches.filter((b) => !usedBatches.includes(b.batch));
                return (
                  <React.Fragment key={idx}>
                    <tr style={{ borderBottom: isNonBom ? "none" : "1px solid var(--neutral-line-separator-1)" }}>
                      <td style={tdStyle({ color: "var(--neutral-on-surface-secondary)" })}>{idx + 1}</td>
                      <td style={tdStyle()}>
                        <StatusBadge variant={it.type === "BOM" ? "blue-light" : "grey-light"}>
                          {it.type}
                        </StatusBadge>
                      </td>
                      <td style={tdStyle()}>
                        <div style={{ fontWeight: "var(--font-weight-semi-bold)" }}>{it.name}</div>
                        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>
                          {it.sku}
                        </div>
                      </td>
                      <td style={tdStyle()}>
                        {it.requestedQty} {it.unit}
                      </td>
                      <td style={tdStyle()}>
                        {readOnly ? (
                          /* ---- Review (view-only) ---- */
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            {c.total > 0 ? (
                              <>
                                <span style={{ color: "var(--status-green-primary)" }}>
                                  {c.total} {it.unit}
                                </span>
                                {c.lines
                                  .filter((l) => l.batch && Number(l.qty) > 0)
                                  .map((l, i) => (
                                    <span
                                      key={i}
                                      style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}
                                    >
                                      {l.batch}:{" "}
                                      <b style={{ color: "var(--neutral-on-surface-primary)" }}>
                                        {l.qty} {it.unit}
                                      </b>
                                    </span>
                                  ))}
                              </>
                            ) : (
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>-</span>
                            )}
                            {c.needsReason && c.reason && (
                              <div
                                style={{
                                  marginTop: "8px",
                                  fontSize: "var(--text-body)",
                                  color: "var(--neutral-on-surface-secondary)",
                                }}
                              >
                                <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                                  Shortage Reason:{" "}
                                </span>
                                {c.reason}
                              </div>
                            )}
                          </div>
                        ) : (
                          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {stock <= 0 ? (
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>No stock available</span>
                            ) : (
                              <>
                            {c.lines.map((line, lineIdx) => {
                              const batchMeta = it.availableBatches.find((b) => b.batch === line.batch);
                              const lineMax = batchMeta?.available ?? 0;
                              // options = this line's batch + any batches not used elsewhere
                              const options = it.availableBatches
                                .filter((b) => b.batch === line.batch || !usedBatches.includes(b.batch))
                                .map((b) => ({ value: b.batch, label: `${b.batch} (${b.available} ${it.unit})` }));
                              return (
                                <div key={lineIdx} style={{ display: "flex", alignItems: "center", gap: "8px", minWidth: 0 }}>
                                  <div style={{ flex: 1, minWidth: 0 }}>
                                    <DropdownSelect
                                      value={line.batch}
                                      onChange={(val) => {
                                        const max = it.availableBatches.find((b) => b.batch === val)?.available ?? 0;
                                        updateLine(idx, lineIdx, { batch: val, qty: Math.min(Number(line.qty) || 0, max) });
                                      }}
                                      options={options}
                                      placeholder="Select batch"
                                      fieldHeight="48px"
                                      fontSize="var(--text-title-3)"
                                    />
                                  </div>
                                  <div style={{ width: "112px", flexShrink: 0 }}>
                                    <InputField
                                      type="number"
                                      value={String(line.qty ?? "")}
                                      onChange={(e) => {
                                        const next = Math.max(0, Math.min(Number(e.target.value) || 0, lineMax));
                                        updateLine(idx, lineIdx, { qty: next });
                                      }}
                                      placeholder="Qty"
                                      suffix={it.unit}
                                    />
                                  </div>
                                  <IconButton
                                    icon={DeleteIcon}
                                    size="large"
                                    onClick={() => removeLine(idx, lineIdx)}
                                    color="var(--status-red-primary)"
                                  />
                                </div>
                              );
                            })}

                            {unusedBatches.length > 0 && (
                              <Button
                                variant="tertiary"
                                size="sm"
                                leftIcon={AddIcon}
                                disabled={c.shortageQty <= 0}
                                onClick={() => addLine(idx, unusedBatches[0].batch)}
                                style={{ alignSelf: "flex-start" }}
                              >
                                Add Batch
                              </Button>
                            )}
                              </>
                            )}

                            {c.needsReason && (
                              <div style={{ marginTop: "10px" }}>
                                <InputField
                                  label="Shortage Reason"
                                  required
                                  multiline
                                  maxLength={400}
                                  headerRight={`${c.reason.length}/400`}
                                  value={c.reason}
                                  onChange={(e) => updateRow(idx, { reason: e.target.value })}
                                  placeholder="Explain why the request cannot be fully fulfilled"
                                  error={reasonError ? "Field cannot be empty" : undefined}
                                />
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                      <td style={tdStyle()}>
                        {c.shortageQty > 0 ? (
                          <span style={{ color: "var(--status-red-primary)" }}>
                            {c.shortageQty} {it.unit}
                          </span>
                        ) : (
                          <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                            0 {it.unit}
                          </span>
                        )}
                      </td>
                      <td style={tdStyle()}>
                        <StatusBadge variant={`${meta.badge}-light`}>{meta.label}</StatusBadge>
                      </td>
                    </tr>
                    {isNonBom && it.justification && (
                      <tr style={{ borderBottom: "1px solid var(--neutral-line-separator-1)" }}>
                        <td colSpan={7} style={{ padding: "0 16px 16px 16px" }}>
                          <div
                            style={{
                              display: "flex",
                              gap: "10px",
                              alignItems: "flex-start",
                              padding: "12px 14px",
                              background: "var(--feature-brand-container-lighter)",
                              borderRadius: "var(--radius-md)",
                            }}
                          >
                            <Info size={16} color="var(--feature-brand-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                              <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                                Requester Justification
                              </span>
                              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.6 }}>
                                {it.justification}
                              </span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            boxShadow: "var(--elevation-sticky)",
            display: "flex",
            gap: "12px",
          }}
        >
          {readOnly ? (
            <>
              <Button variant="outlined" size="xl" onClick={() => setStep("edit")} style={{ flex: 1 }}>
                Back
              </Button>
              <Button size="xl" onClick={handleConfirm} style={{ flex: 1 }}>
                Start Preparing
              </Button>
            </>
          ) : (
            <Button size="xl" onClick={handleReview} style={{ width: "100%" }}>
              Review Material Preparation
            </Button>
          )}
        </div>
      </div>
    </>
  );
};
