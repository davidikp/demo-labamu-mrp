// Apply Stock Opname — the "Processing" backend step (PRD "Apply &
// Processing" AC 2, 4, 7, 8). Runs final validation against the latest
// batchesStore/materialsMocks state, then for each still-valid row either
// adjusts an existing Batch's current stock to Counted Qty or creates the
// pending New Batch (always Status = Received, Initial Qty = Counted Qty).
// Rows that fail re-validation are left untouched and reported "Not Applied"
// rather than aborting the whole run.
import { addBatch, updateBatch } from "./batchesStore.js";
import { getRowErrors, hydrateRow } from "./stockOpnameValidation.js";

const generateBatchId = () => `batch-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Same "BN-yyyymmdd-###" scheme StockBatchesTab.jsx's Add Batch drawer uses,
// so a Stock Opname-created Batch No looks indistinguishable from a manually
// added one.
const generateBatchNo = () =>
  `BN-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(Math.floor(Math.random() * 1000)).padStart(3, "0")}`;

// Re-runs Review Data's row validation against current store state (rows may
// have gone stale while the Stock Opname sat in Review) — PRD AC 2/3: if
// anything now fails, Apply is rejected and nothing is adjusted.
export const revalidateForApply = (rows) => {
  const rehydrated = rows.map((row) => hydrateRow(row));
  const errorsByRow = rehydrated.map((row) => getRowErrors(row));
  return { rows: rehydrated, isValid: errorsByRow.every((errors) => errors.length === 0) };
};

// Applies every row and returns { rows: [{...row, result}], summary }.
// Rows are re-validated one more time here (belt-and-suspenders — the caller
// is expected to have already called revalidateForApply and blocked Apply on
// failure) so a row that somehow still fails is skipped as "Not Applied"
// instead of throwing.
export const applyStockOpnameRows = (rows) => {
  const materials = getMaterials();
  const summary = { totalRows: rows.length, adjusted: 0, newBatch: 0, noChange: 0, notApplied: 0 };

  const resultRows = rows.map((row) => {
    const hydrated = hydrateRow(row);
    const errors = getRowErrors(hydrated);
    if (errors.length > 0) {
      summary.notApplied += 1;
      return { ...hydrated, beforeQty: hydrated.currentQty, result: "Not Applied" };
    }

    const countedQty = Number(hydrated.countedQty);

    if (hydrated.pendingBatch) {
      // Spread the drawer-collected fields (cost/dates/vendor/attachments/
      // notes) first, then override the system-decided ones so a stray field
      // on pendingBatch can never win — a Stock Opname New Batch always uses
      // Status = Received and Initial/Current Qty = Counted Qty.
      const newBatch = {
        ...hydrated.pendingBatch,
        id: generateBatchId(),
        materialId: hydrated.materialId,
        batchNo: generateBatchNo(),
        reservedQty: 0,
        initialQty: countedQty,
        currentQty: countedQty,
        status: "Received",
      };
      addBatch(newBatch);
      summary.newBatch += 1;
      return { ...hydrated, batchId: newBatch.id, batchNo: newBatch.batchNo, initialQty: countedQty, currentQty: countedQty, beforeQty: 0, result: "New Batch" };
    }

    const beforeQty = hydrated.currentQty;
    if (countedQty === beforeQty) {
      summary.noChange += 1;
      return { ...hydrated, beforeQty, result: "No Change" };
    }

    updateBatch(hydrated.batchId, { currentQty: countedQty });
    summary.adjusted += 1;
    return { ...hydrated, beforeQty, currentQty: countedQty, result: "Adjusted" };
  });

  return { rows: resultRows, summary };
};
