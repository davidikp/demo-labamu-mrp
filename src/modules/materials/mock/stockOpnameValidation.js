// Row model + validation rules for Stock Opname Review Data — shared by the
// manual-entry path and (from Phase 3 on) the upload/normalize path, so both
// produce rows in the same shape and get the same validation.
import { getMaterials } from "./materialsMocks.js";
import { getBatchesForMaterial } from "./batchesStore.js";
import { getRequests } from "../../material-request/mock/materialRequestMocks.js";

let rowSeq = 0;
export const makeEmptyRow = () => ({
  __rowId: `so-row-${Date.now()}-${++rowSeq}`,
  materialId: null,
  materialSku: "",
  materialName: "",
  batchId: null,
  batchNo: "",
  pendingBatch: null, // set once "New Batch Handling" (Phase 5) is wired up
  initialQty: null,
  currentQty: null,
  countedQty: "",
  // A freshly added manual row starts blank on purpose — showing every
  // field as an inline red error the instant it appears would be noise, not
  // help. Inline field errors only start showing once there's something to
  // react to: a row normalized from an uploaded file (already populated,
  // possibly with values that didn't match), or a manual row after the user
  // has attempted Apply. buildStockOpnameRowsFromMapping and Apply both flip
  // this to true; getRowErrors/isRowInvalid (used for the "need attention"
  // count and the Apply gate) are unaffected — they always see the real
  // validation state regardless of this flag.
  __showErrors: false,
});

export const findMaterialBySku = (sku) =>
  getMaterials().find((m) => m.sku.toLowerCase() === String(sku || "").toLowerCase()) || null;

// Sums quantity already committed by Material Request items in "transferring"
// status against a given Batch — used so Counted Qty can't be entered lower
// than stock that's already been promised out (PRD Review Data AC 5 / System
// Rules). Matches on the batch's Batch No against each allocation entry's
// `batch` reference.
export const getCommittedTransferringQty = (batchNo) => {
  if (!batchNo) return 0;
  let total = 0;
  for (const request of getRequests()) {
    if (request.status !== "transferring") continue;
    for (const item of request.items || []) {
      for (const alloc of item.allocation?.batches || []) {
        if (alloc.batch === batchNo) total += alloc.used || 0;
      }
    }
  }
  return total;
};

export const getVariance = (row) => {
  const counted = Number(row.countedQty);
  const current = Number(row.currentQty);
  if (!Number.isFinite(counted) || !Number.isFinite(current)) return null;
  return counted - current;
};

// Field-level error getters — each returns a single human-readable string
// (or null when that field is fine) for exactly the field named. These back
// both getRowErrors below and the Review grid's inline per-field messages,
// so the wording only lives in one place.
//
// "Field cannot be empty" is this app's standard empty-required-field
// message (see e.g. the Upload step's file field) — used here whenever the
// raw value (typed manually, or come from the uploaded file) is missing
// outright, as opposed to present but unresolved.
export const getMaterialSkuError = (row) => {
  if (!row.materialSku) return "Field cannot be empty";
  if (!row.materialId) return `Material SKU “${row.materialSku}” not found. Select another SKU.`;
  return null;
};

export const getBatchError = (row) => {
  if (row.pendingBatch) {
    // New Batch info was started but Purchase Date (required, same as the
    // regular Add Batch drawer) was never filled in — PRD "New Batch
    // Handling" AC 6: incomplete pending Batch info keeps the row invalid.
    return row.pendingBatch.purchaseDate ? null : "New Batch information is incomplete — open Review Batch to finish it.";
  }
  if (row.batchId) return null;
  if (!row.batchNo) return "Field cannot be empty";
  // Shown even when Material SKU itself didn't match — the row still keeps
  // whatever raw Batch value it had (typed or from the file), so it gets
  // its own "not found" message rather than being silently skipped.
  return `Batch “${row.batchNo}” not found. Select another batch or create a new one.`;
};

export const getCountedQtyError = (row) => {
  const raw = row.countedQty;
  if (raw === "" || raw === null || raw === undefined) return "Field cannot be empty";
  const counted = Number(raw);
  if (!Number.isFinite(counted)) return "Counted Qty must be a number.";
  if (counted < 0) return "Counted Qty cannot be negative.";
  if (row.batchId && Number.isFinite(row.initialQty) && counted > row.initialQty) {
    return "Counted Qty cannot exceed Initial Qty.";
  }
  if (row.batchId) {
    const committed = getCommittedTransferringQty(row.batchNo);
    if (committed > 0 && counted < committed) {
      return `Counted Qty cannot be lower than the ${committed} unit(s) already committed to a Transferring Material Request.`;
    }
  }
  return null;
};

// Returns an array of human-readable validation error strings for a row —
// empty array means the row is valid. Mirrors PRD "Review Data & Validation"
// AC 2/3/5/6. Always reflects the row's real validity regardless of whether
// its inline field errors are currently being displayed (see __showErrors
// on makeEmptyRow) — this drives the "need attention" count and the Apply
// gate, neither of which should be fooled by a row that just hasn't shown
// its errors yet.
export const getRowErrors = (row) => {
  // Batch is validated regardless of whether Material SKU itself resolved —
  // an unmatched/empty raw Batch value gets its own error either way.
  const errors = [getMaterialSkuError(row), getBatchError(row), getCountedQtyError(row)].filter(Boolean);
  return errors;
};

export const isRowInvalid = (row) => getRowErrors(row).length > 0;

// Populates materialName/batchNo/initialQty/currentQty on a row once
// materialId/batchId are set — the single place both the manual Review grid
// and (later) the upload normalization pass should call so Material Name
// stays system-derived, never hand-typed (PRD System Rules).
export const hydrateRow = (row) => {
  const material = row.materialId ? getMaterials().find((m) => m.id === row.materialId) : null;
  const batches = row.materialId ? getBatchesForMaterial(row.materialId) : [];
  const batch = row.batchId ? batches.find((b) => b.id === row.batchId) : null;
  return {
    ...row,
    materialName: material?.name || "",
    unit: material?.unit || "",
    batchNo: batch?.batchNo || row.batchNo || "",
    initialQty: batch ? batch.initialQty : row.pendingBatch ? Number(row.countedQty) || 0 : null,
    currentQty: batch ? batch.currentQty : row.pendingBatch ? 0 : null,
  };
};
