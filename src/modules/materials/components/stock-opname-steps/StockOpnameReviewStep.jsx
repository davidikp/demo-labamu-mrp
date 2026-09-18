import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { AddIcon, DeleteIcon, CloseIcon, SearchNotFoundIllustration } from "../../../../components/icons/Icons.jsx";
import { Table, EmptyState } from "../../../../ce-ui";
import { Button } from "../../../../components/common/Button.jsx";
import { IconButton } from "../../../../components/common/IconButton.jsx";
import { Checkbox } from "../../../../components/common/Checkbox.jsx";
import { InputField } from "../../../../components/index.js";
import { SearchableFieldSelect } from "./SearchableFieldSelect.jsx";
import { TableSearchField } from "../../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../../components/table/TablePaginationFooter.jsx";
import { getMaterials } from "../../mock/materialsMocks.js";
import { getBatchesForMaterial } from "../../mock/batchesStore.js";
import { getRowErrors, getVariance, hydrateRow, getMaterialSkuError, getBatchError, getCountedQtyError } from "../../mock/stockOpnameValidation.js";
import { StockOpnameNewBatchDrawer } from "../StockOpnameNewBatchDrawer.jsx";

const CREATE_NEW_BATCH = "__create_new_batch__";

// Fixed per-column pixel widths, same convention as
// upload-steps/ReviewStep.jsx's COLUMN_WIDTH — keeps every column aligned
// with its header regardless of cell content. Material SKU is wide enough to
// fit its longest realistic value without the placeholder/filled states
// rendering at visually different widths.
const COLUMN_WIDTH = {
  materialSku: 260,
  materialName: 200,
  batch: 220,
  countedQty: 160,
  initialQty: 130,
  currentQty: 130,
  variance: 100,
};

const stopRowToggle = (e) => e.stopPropagation();

// Every "plain text" column (Material Name / Initial Qty / Current Qty /
// Variance / the delete action) gets this same wrapper so they all line up
// with the ~40px Material SKU/Batch/Counted Qty fields in the same row. The
// table's <td> itself defaults to `vertical-align: middle` (the browser's
// own default, not overridden by ce-ui), so a plain 40px-tall box would get
// centered inside the full row height once another cell's error text makes
// the row taller — the outer box below fills the td's own height and pins
// its content to the top instead, then the inner 40px band centers the
// actual text/button within that top slice, matching the ~40px fields'
// own vertical centering.
const plainCellStyle = { height: "100%", display: "flex", alignItems: "flex-start" };
const plainCellInnerStyle = { height: "40px", width: "100%", display: "flex", alignItems: "center", color: "var(--neutral-on-surface-primary)" };

const withUnit = (value, unit) => (value == null ? "-" : unit ? `${value} ${unit}` : String(value));

// Editable Stock Opname Review Data grid — PRD "Review Data & Validation" AC
// 1, 2, 3, 5, 6, 7, plus "New Batch Handling" AC 1-7 (the "+ Create New
// Batch" / "Review Batch" drawer flow). Built on the same ce-ui `Table` +
// toolbar + TablePaginationFooter structure as the Bulk Upload wizard's own
// Review step (upload-steps/ReviewStep.jsx).
export const StockOpnameReviewStep = forwardRef(({ rows, onRowsChange, onAddRow, onDeleteRows }, ref) => {
  const [showNeedAttentionOnly, setShowNeedAttentionOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [batchDrawerRowId, setBatchDrawerRowId] = useState(null);
  // Separate from batchDrawerRowId (which drives the create/edit-pending
  // drawer) — this one opens the same drawer read-only against a row's
  // already-resolved existing Batch.
  const [reviewBatchRowId, setReviewBatchRowId] = useState(null);

  const materials = getMaterials();
  const materialOptions = materials.map((m) => ({
    value: m.id,
    // Field text shows the SKU alone once selected (matching the Batch
    // field's convention) — the name still shows in the dropdown row via
    // secondaryText, and in the read-only Material Name column.
    label: m.sku,
    sku: m.sku,
    primaryText: m.sku,
    secondaryText: m.name,
  }));

  const rowsWithErrors = rows.map((row) => ({ row, errors: getRowErrors(row) }));
  const attentionCount = rowsWithErrors.filter((r) => r.errors.length > 0).length;

  const filteredRows = rowsWithErrors.filter(({ row, errors }) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || [row.materialSku, row.materialName, row.batchNo].some((v) => String(v || "").toLowerCase().includes(query));
    const matchesAttentionFilter = !showNeedAttentionOnly || errors.length > 0;
    return matchesSearch && matchesAttentionFilter;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const visibleRows = filteredRows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, showNeedAttentionOnly]);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // Lets StockOpnameNewPage's Apply button (always enabled — PRD-adjacent
  // demo behavior: clicking Apply with invalid data should surface exactly
  // where the problem is rather than just staying disabled) jump straight to
  // the first invalid row instead of leaving the user to hunt for it across
  // pages/filters. Clears search + the Need Attention toggle first since
  // either could otherwise hide the very row being scrolled to.
  useImperativeHandle(ref, () => ({
    scrollToFirstInvalidRow: () => {
      const firstInvalid = rowsWithErrors.find((r) => r.errors.length > 0);
      if (!firstInvalid) return;
      setSearchQuery("");
      setShowNeedAttentionOnly(false);
      const idx = rows.findIndex((r) => r.__rowId === firstInvalid.row.__rowId);
      if (idx >= 0) setCurrentPage(Math.floor(idx / rowsPerPage) + 1);
      // Two rAFs: one for the state updates above to flush and re-render,
      // one more for the resulting page's rows to actually paint before the
      // target row's DOM node can be found.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          document.getElementById(`so-review-row-${firstInvalid.row.__rowId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      });
    },
  }));

  // Per-field (not per-row) "has this been touched" tracking — showing a
  // field's own inline error live once *that* field has been edited, rather
  // than the whole row's errors the moment any one field changes. Without
  // this, picking a Material SKU on a brand-new "+ New Row" would instantly
  // paint the still-untouched Batch/Counted Qty fields red too, which is
  // exactly the noise makeEmptyRow's own __showErrors: false was meant to
  // avoid. `row.__showErrors` (set wholesale on resume/Apply — see
  // StockOpnameNewPage) still overrides this per-field gate everywhere, for
  // reviewing pre-existing data or a failed Apply attempt.
  const isFieldTouched = (row, field) => row.__showErrors || !!row.__touched?.[field];

  const updateRow = (rowId, patch, touchedField) => {
    onRowsChange(rows.map((r) => {
      if (r.__rowId !== rowId) return r;
      const touched = touchedField ? { ...r.__touched, [touchedField]: true } : r.__touched;
      return hydrateRow({ ...r, ...patch, __touched: touched });
    }));
  };

  const deleteRows = (ids) => {
    onDeleteRows(ids);
    setSelectedIds((prev) => prev.filter((id) => !ids.includes(id)));
  };

  const handleAddRow = () => {
    onAddRow();
    setSearchQuery("");
    setShowNeedAttentionOnly(false);
    setCurrentPage(1);
  };

  const data = visibleRows.map(({ row, errors }) => ({ ...row, id: row.__rowId, __errors: errors }));

  const columns = [
    {
      key: "materialSku",
      header: "* Material SKU",
      width: COLUMN_WIDTH.materialSku,
      render: (_, row) => {
        const skuError = isFieldTouched(row, "materialSku") ? getMaterialSkuError(row) : null;
        return (
          <div id={`so-review-row-${row.__rowId}`} onClick={stopRowToggle} onMouseDown={stopRowToggle}>
            <SearchableFieldSelect
              value={row.materialId}
              onChange={(materialId) =>
                updateRow(
                  row.__rowId,
                  {
                    materialId: materialId || null,
                    materialSku: materialId ? materials.find((m) => m.id === materialId)?.sku || "" : "",
                    batchId: null,
                    pendingBatch: null,
                  },
                  "materialSku"
                )
              }
              options={materialOptions}
              placeholder="Search by SKU or name"
              hasError={!!skuError}
              errorText={skuError || undefined}
            />
          </div>
        );
      },
    },
    {
      key: "materialName",
      header: "Material Name",
      width: COLUMN_WIDTH.materialName,
      // System-derived from Material SKU — read-only, never a text field
      // (PRD System Rules).
      render: (_, row) => <div style={plainCellStyle}><div style={plainCellInnerStyle}>{row.materialName || "-"}</div></div>,
    },
    {
      key: "batch",
      header: "* Batch Number",
      tooltip: "The specific batch being counted. Select an existing batch or create a new one if it doesn't exist yet.",
      width: COLUMN_WIDTH.batch,
      render: (_, row) => {
        if (row.pendingBatch) {
          // Styled like SearchableFieldSelect's own filled state (same
          // height/border/font) so a pending Batch reads as "a value is
          // selected here" rather than plain text — the "x" clears it back
          // to an empty Batch field the user can search again. Editing the
          // pending Batch's details now lives in the actions column's
          // "Edit Batch" button, next to Delete, like every other row.
          const incomplete = !row.pendingBatch.purchaseDate;
          return (
            <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    width: "100%",
                    height: "40px",
                    display: "flex",
                    alignItems: "center",
                    padding: "0 36px 0 12px",
                    borderRadius: "8px",
                    border: `1px solid ${incomplete ? "var(--status-red-primary)" : "var(--neutral-line-separator-2)"}`,
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-primary)",
                    fontStyle: "italic",
                    background: "var(--neutral-surface-primary)",
                    boxSizing: "border-box",
                  }}
                >
                  New Batch (Pending)
                </div>
                <span
                  role="button"
                  tabIndex={-1}
                  onClick={() => updateRow(row.__rowId, { pendingBatch: null, batchId: null }, "batch")}
                  style={{ position: "absolute", right: "12px", top: "20px", transform: "translateY(-50%)", display: "flex", cursor: "pointer" }}
                  aria-label="Cancel pending batch"
                >
                  <CloseIcon size={14} color="var(--neutral-on-surface-tertiary)" />
                </span>
              </div>
              {incomplete && (
                <span style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "var(--status-red-primary)" }}>New Batch information is incomplete.</span>
              )}
            </div>
          );
        }
        const material = materials.find((m) => m.id === row.materialId);
        const batchOptions = row.materialId
          ? [
              ...getBatchesForMaterial(row.materialId).map((b) => ({
                value: b.id,
                label: b.batchNo,
                primaryText: b.batchNo,
                secondaryText: `Current: ${withUnit(b.currentQty, material?.unit)}`,
              })),
              { value: CREATE_NEW_BATCH, label: "+ Create New Batch", primaryText: "+ Create New Batch", isAction: true },
            ]
          : [];
        const batchError = isFieldTouched(row, "batch") ? getBatchError(row) : null;
        return (
          <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
            <SearchableFieldSelect
              value={row.batchId}
              onChange={(val) => {
                if (val === CREATE_NEW_BATCH) {
                  setBatchDrawerRowId(row.__rowId);
                } else {
                  updateRow(row.__rowId, { batchId: val || null }, "batch");
                }
              }}
              options={batchOptions}
              placeholder={row.materialId ? "Search by Batch ID" : "Select Material SKU first"}
              disabled={!row.materialId}
              hasError={!!batchError}
              errorText={batchError || undefined}
            />
          </div>
        );
      },
    },
    {
      key: "initialQty",
      header: "Initial Qty",
      tooltip: "The original quantity recorded when this batch was first created.",
      width: COLUMN_WIDTH.initialQty,
      render: (_, row) => <div style={plainCellStyle}><div style={plainCellInnerStyle}>{withUnit(row.initialQty, row.unit)}</div></div>,
    },
    {
      key: "currentQty",
      header: "Current Qty",
      tooltip: "The system's stock quantity for this batch before this Stock Opname is applied.",
      width: COLUMN_WIDTH.currentQty,
      render: (_, row) => <div style={plainCellStyle}><div style={plainCellInnerStyle}>{withUnit(row.currentQty, row.unit)}</div></div>,
    },
    {
      key: "countedQty",
      header: "* Counted Qty",
      tooltip: "The actual physical quantity counted during the stock check.",
      width: COLUMN_WIDTH.countedQty,
      render: (_, row) => {
        const countedError = isFieldTouched(row, "countedQty") ? getCountedQtyError(row) : null;
        return (
          <div onClick={stopRowToggle} onMouseDown={stopRowToggle}>
            <InputField
              type="number"
              size="md"
              value={row.countedQty}
              placeholder="0"
              suffix={row.unit || undefined}
              onChange={(e) => updateRow(row.__rowId, { countedQty: e.target.value }, "countedQty")}
              errorText={countedError}
            />
          </div>
        );
      },
    },
    {
      key: "variance",
      header: "Variance",
      tooltip: "The difference between Counted Qty and Current Qty.",
      width: COLUMN_WIDTH.variance,
      render: (_, row) => {
        const variance = getVariance(row);
        const color = variance == null ? "var(--neutral-on-surface-tertiary)" : variance === 0 ? "var(--neutral-on-surface-primary)" : variance > 0 ? "var(--status-green-primary)" : "var(--status-red-primary)";
        const text = variance == null ? "-" : withUnit(variance > 0 ? `+${variance}` : variance, row.unit);
        return <div style={plainCellStyle}><div style={{ ...plainCellInnerStyle, fontWeight: "var(--font-weight-bold)", color }}>{text}</div></div>;
      },
    },
    {
      key: "__actions",
      header: "",
      width: 180,
      render: (_, row) => (
        <div style={plainCellStyle}>
          <div onClick={stopRowToggle} onMouseDown={stopRowToggle} style={{ ...plainCellInnerStyle, justifyContent: "flex-end", gap: "4px" }}>
            {row.pendingBatch ? (
              <Button variant="tertiary" onClick={() => setBatchDrawerRowId(row.__rowId)}>Edit Batch</Button>
            ) : (
              row.batchId && (
                <Button variant="tertiary" onClick={() => setReviewBatchRowId(row.__rowId)}>
                  Review Batch
                </Button>
              )
            )}
            <IconButton icon={DeleteIcon} size="small" color="var(--status-red-primary)" onClick={() => deleteRows([row.__rowId])} />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "0", flex: 1, minHeight: 0 }}>
      <style>{`
        .so-review-table table { table-layout: fixed; width: max-content; min-width: 100%; }
        .so-review-table th, .so-review-table td { height: auto !important; overflow: hidden; vertical-align: top; display: table-cell !important; }
        .so-review-table td > div { padding: 8px 0; }
        .so-review-table td:first-child, .so-review-table td:last-child {
          vertical-align: top !important;
          text-align: center !important;
        }
        .so-review-table td:first-child { padding-top: 16px !important; }
        .so-review-table th {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          border-bottom: none !important;
          box-shadow: inset 0 -1px 0 var(--neutral-line-separator-2);
        }
        .so-review-table { border-radius: var(--radius-card) var(--radius-card) 0 0 !important; }
        .so-review-table > div:last-child { display: none; }
      `}</style>

      <div style={{ flex: 1, minHeight: "320px", display: "flex", flexDirection: "column" }}>
        <Table
          className="so-review-table flex-1 min-h-0"
          columns={columns}
          data={data}
          selectable
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          totalRows={filteredRows.length}
          page={safePage}
          perPage={rowsPerPage}
          onPageChange={setCurrentPage}
          emptyState={
            <EmptyState
              illustration={<SearchNotFoundIllustration />}
              title="No rows found"
              description="Try adjusting your search or the needs-attention filter."
            />
          }
          toolbar={
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", gap: "12px", flexWrap: "wrap" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "14px" }}>
                  <Checkbox checked={showNeedAttentionOnly} onChange={(checked) => setShowNeedAttentionOnly(checked)} />
                  Show only need attention data{attentionCount > 0 ? ` (${attentionCount})` : ""}
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by SKU, Name, or Batch" width="280px" />
                  <Button variant="outlined" leftIcon={AddIcon} onClick={handleAddRow}>New Row</Button>
                </div>
              </div>

              {selectedIds.length > 0 && (
                <div
                  style={{
                    margin: "12px -20px -12px",
                    padding: "12px 20px",
                    background: "var(--feature-brand-container)",
                    borderTop: "1px solid var(--neutral-line-separator-2)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                    {`${selectedIds.length} Selected`}
                  </span>
                  <Button variant="outlined" leftIcon={DeleteIcon} onClick={() => deleteRows(selectedIds)} style={{ borderColor: "var(--status-red-primary)", color: "var(--status-red-primary)" }}>
                    Delete
                  </Button>
                </div>
              )}
            </div>
          }
        />
        {filteredRows.length > 0 && (
          <TablePaginationFooter
            totalRows={filteredRows.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            style={{
              background: "var(--neutral-surface-primary)",
              borderBottomLeftRadius: "var(--radius-card)",
              borderBottomRightRadius: "var(--radius-card)",
              border: "1px solid var(--neutral-line-separator-1)",
              borderTop: "none",
            }}
          />
        )}
      </div>

      {batchDrawerRowId && (() => {
        const activeRow = rows.find((r) => r.__rowId === batchDrawerRowId);
        const activeMaterial = materials.find((m) => m.id === activeRow?.materialId);
        return (
          <StockOpnameNewBatchDrawer
            isOpen
            onClose={() => setBatchDrawerRowId(null)}
            materialUnit={activeMaterial?.unit}
            countedQty={activeRow?.countedQty}
            initialPendingBatch={activeRow?.pendingBatch}
            onSave={(pendingBatch) => {
              updateRow(batchDrawerRowId, { batchId: null, pendingBatch }, "batch");
              setBatchDrawerRowId(null);
            }}
          />
        );
      })()}

      {reviewBatchRowId && (() => {
        const activeRow = rows.find((r) => r.__rowId === reviewBatchRowId);
        const activeMaterial = materials.find((m) => m.id === activeRow?.materialId);
        const activeBatch = activeRow?.materialId
          ? getBatchesForMaterial(activeRow.materialId).find((b) => b.id === activeRow.batchId)
          : null;
        return (
          <StockOpnameNewBatchDrawer
            isOpen
            readOnly
            viewBatch={activeBatch}
            materialName={activeMaterial?.name}
            materialSku={activeMaterial?.sku}
            onClose={() => setReviewBatchRowId(null)}
            materialUnit={activeMaterial?.unit}
          />
        );
      })()}
    </div>
  );
});
