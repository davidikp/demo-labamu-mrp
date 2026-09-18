// Stock Opname mock store — module-level array + pub-sub subscribe pattern,
// mirroring materialUploadsStore.js's shape but with its own ID namespace
// ("SO-" instead of "BUM-") and its own status lifecycle:
//   Upload path:  Mapping -> Normalizing Data -> Review -> Processing -> Completed
//   Manual path:                       Review -> Processing -> Completed
//   Cancelled can happen any time before Processing starts.
//
// A manual Stock Opname is NOT added to this store until the user's first
// "Save as Draft" or "Apply Stock Opname" click (see PRD "Start Method" AC 2,
// 4, 5, 8) — until then it only exists as local component state on the New
// Stock Opname page. Records created from an upload, by contrast, are added
// immediately once the file passes validation and Mapping starts.
import { CURRENT_USER, NOTIFICATION_USERS } from "../../../data/notification/notificationConfig.js";
import { hydrateRow } from "./stockOpnameValidation.js";

// IDs are date-scoped — "SO-[yyyymmdd]-0001" — sequence restarts at 0001 each
// day, based on the record's created date.
const formatDateForId = (isoString) => {
  const d = new Date(isoString);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
};

const nextId = (createdAt) => {
  const prefix = `SO-${formatDateForId(createdAt)}-`;
  const countToday = stockOpnames.filter((s) => s.id.startsWith(prefix)).length;
  return `${prefix}${String(countToday + 1).padStart(4, "0")}`;
};

// ── Activity log helpers — same shape as materialUploadsStore.js ───────────
const USER_EMAIL_BY_NAME = new Map(NOTIFICATION_USERS.map((u) => [u.name, u.email]));

// Sentinel actor name for status changes the system makes on its own (e.g. a
// background timer completing after the user navigated away) rather than
// something a person clicked.
export const SYSTEM_ACTOR_NAME = "System";

const actorForName = (name) => {
  if (name === SYSTEM_ACTOR_NAME) return { name: SYSTEM_ACTOR_NAME, email: null };
  return {
    name: name || CURRENT_USER.name,
    email: USER_EMAIL_BY_NAME.get(name) || CURRENT_USER.email,
  };
};

const makeLog = (actor, title, desc, timestamp) => ({
  name: actor.name,
  email: actor.email,
  title,
  desc,
  timestamp: timestamp || new Date().toISOString(),
});

// Default copy for each status a record can land on — used whenever
// `updateStockOpname` sees `patch.status` differ from the current one.
// `patch.logDesc`/`patch.logTitle` can override copy for a specific
// transition (e.g. a system-simulated processing failure).
export const STATUS_LOG_COPY = {
  Mapping: { title: "Mapping Started", desc: "Uploaded columns are ready to be mapped." },
  // No entry for "Normalizing Data" on purpose — unlike Bulk Upload, Stock
  // Opname's PRD says Normalizing Data "is not shown as a separate user
  // step" (see updateStockOpname below, which skips logging this
  // transition entirely rather than falling back to a generic status-change
  // line).
  Review: { title: "Ready for Review", desc: "Data is ready for review." },
  Processing: { title: "Apply Started", desc: "Stock adjustments are being applied in the background." },
  Completed: { title: "Completed", desc: "Stock adjustments were applied successfully." },
  Cancelled: { title: "Cancelled", desc: "This Stock Opname was cancelled and no stock was adjusted." },
};

// Display-only relabeling for the two backend-sounding statuses — the
// underlying status value stays "Normalizing Data"/"Processing" everywhere
// else (routing, STATUS_LOG_COPY lookups, filtering); only what's shown to
// the user in a status badge changes.
const STATUS_DISPLAY_LABEL = {
  "Normalizing Data": "Preparing",
  Processing: "Applying",
};
export const displayStatusLabel = (status) => STATUS_DISPLAY_LABEL[status] || status;

// Demo-only: a finished (Completed/Cancelled) record's rows are historical —
// they're never re-validated or edited again, just displayed on
// StockOpnameResultPage — so these are built directly in the same shape
// applyStockOpnameRows returns, rather than run through hydrateRow.
const resultRow = (rowId, { materialSku, materialName, batchNo, initialQty, beforeQty, countedQty, result }) => ({
  __rowId: rowId,
  materialSku,
  materialName,
  batchNo,
  initialQty,
  beforeQty,
  countedQty,
  result,
});

const SEED_STOCK_OPNAMES = [
  {
    id: "SO-20260901-0001",
    method: "upload",
    createdAt: "2026-09-01T08:30:00Z",
    createdBy: CURRENT_USER.name,
    appliedAt: "2026-09-01T08:45:00Z",
    sourceFile: "stock_opname_sep_week1.xlsx",
    totalRows: 18,
    status: "Completed",
    rows: [
      // Adjusted (12) — Counted Qty differed from the Batch's stock at the
      // time this ran, so its current quantity was updated to match.
      resultRow("so-completed-row-1", { materialSku: "ALU-SH-2MM", materialName: "Aluminium Sheet 2mm", batchNo: "BN-202403-001", initialQty: 100, beforeQty: 85, countedQty: 80, result: "Adjusted" }),
      resultRow("so-completed-row-2", { materialSku: "ALU-SH-2MM", materialName: "Aluminium Sheet 2mm", batchNo: "BN-202405-004", initialQty: 150, beforeQty: 150, countedQty: 145, result: "Adjusted" }),
      resultRow("so-completed-row-3", { materialSku: "STL-PIPE-05", materialName: "Steel Pipe 1/2 inch", batchNo: "BN-202603-006", initialQty: 100, beforeQty: 40, countedQty: 42, result: "Adjusted" }),
      resultRow("so-completed-row-4", { materialSku: "STL-PIPE-05", materialName: "Steel Pipe 1/2 inch", batchNo: "BAT-260501-000008", initialQty: 45, beforeQty: 45, countedQty: 40, result: "Adjusted" }),
      resultRow("so-completed-row-5", { materialSku: "PLAS-HDPE-GR", materialName: "Plastic Granules HDPE", batchNo: "BAT-260501-000009", initialQty: 1200, beforeQty: 1200, countedQty: 1150, result: "Adjusted" }),
      resultRow("so-completed-row-6", { materialSku: "FAST-M6-HEX", materialName: "M6 Hex Bolt", batchNo: "BAT-260501-000010", initialQty: 5000, beforeQty: 5000, countedQty: 4950, result: "Adjusted" }),
      resultRow("so-completed-row-7", { materialSku: "GLU-5KG-009", materialName: "Wood Glue 5kg", batchNo: "BAT-260501-000011", initialQty: 30, beforeQty: 30, countedQty: 28, result: "Adjusted" }),
      resultRow("so-completed-row-8", { materialSku: "STL-BOLT-M8", materialName: "Steel Bolt M8", batchNo: "BAT-260501-000012", initialQty: 120, beforeQty: 120, countedQty: 118, result: "Adjusted" }),
      resultRow("so-completed-row-9", { materialSku: "MTL-002", materialName: "Aluminum Tube 50mm", batchNo: "BAT-260501-000013", initialQty: 40, beforeQty: 40, countedQty: 38, result: "Adjusted" }),
      resultRow("so-completed-row-10", { materialSku: "VEN-TEAK-12", materialName: "Teak Veneer Sheet", batchNo: "BAT-260501-000001", initialQty: 500, beforeQty: 500, countedQty: 495, result: "Adjusted" }),
      resultRow("so-completed-row-11", { materialSku: "VEN-TEAK-12", materialName: "Teak Veneer Sheet", batchNo: "BAT-260501-000002", initialQty: 250, beforeQty: 250, countedQty: 245, result: "Adjusted" }),
      resultRow("so-completed-row-12", { materialSku: "FOM-ROL-04", materialName: "Foam Padding Roll", batchNo: "BAT-260501-000003", initialQty: 300, beforeQty: 300, countedQty: 290, result: "Adjusted" }),
      // New Batch (2) — no existing Batch matched, so Apply created one from
      // scratch with Initial/Current Qty = Counted Qty.
      resultRow("so-completed-row-13", { materialSku: "PLY-18-001", materialName: "Plywood Board 18mm", batchNo: "BN-20260901-101", initialQty: 60, beforeQty: 0, countedQty: 60, result: "New Batch" }),
      resultRow("so-completed-row-14", { materialSku: "MRB-ITL-CAR-01", materialName: "Imported Italian Carrara Marble Countertop Slab, Premium Polished Finish", batchNo: "BN-20260901-102", initialQty: 10, beforeQty: 0, countedQty: 10, result: "New Batch" }),
      // No Change (3) — Counted Qty matched the Batch's stock exactly.
      resultRow("so-completed-row-15", { materialSku: "ALU-SH-2MM", materialName: "Aluminium Sheet 2mm", batchNo: "BN-202405-005", initialQty: 80, beforeQty: 80, countedQty: 80, result: "No Change" }),
      resultRow("so-completed-row-16", { materialSku: "ALU-SH-2MM", materialName: "Aluminium Sheet 2mm", batchNo: "BN-202604-007", initialQty: 60, beforeQty: 60, countedQty: 60, result: "No Change" }),
      resultRow("so-completed-row-17", { materialSku: "MTL-001", materialName: "Steel Plate 2mm", batchNo: "BAT-260501-000006", initialQty: 150, beforeQty: 150, countedQty: 150, result: "No Change" }),
      // Not Applied (1) — its Batch value never matched, so this row was
      // skipped rather than aborting the whole run.
      resultRow("so-completed-row-18", { materialSku: "STL-PIPE-05", materialName: "Steel Pipe 1/2 inch", batchNo: "BN-UNKNOWN-999", initialQty: null, beforeQty: null, countedQty: "30", result: "Not Applied" }),
    ],
    result: { totalRows: 18, adjusted: 12, newBatch: 2, noChange: 3, notApplied: 1 },
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload Created", "File \"stock_opname_sep_week1.xlsx\" was uploaded.", "2026-09-01T08:30:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Mapping Started", "Uploaded columns are ready to be mapped.", "2026-09-01T08:30:30Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Ready for Review", "Data is ready for review.", "2026-09-01T08:32:20Z"),
      makeLog(actorForName(CURRENT_USER.name), "Apply Started", "Stock adjustments are being applied in the background.", "2026-09-01T08:44:00Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Completed", "Stock adjustments were applied successfully.", "2026-09-01T08:45:00Z"),
    ],
  },
  {
    id: "SO-20260905-0001",
    method: "manual",
    createdAt: "2026-09-05T10:00:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    appliedAt: null,
    sourceFile: null,
    totalRows: 6,
    status: "Review",
    rows: [
      hydrateRow({ __rowId: "so-manual-905-row-1", materialId: "mat-001", materialSku: "ALU-SH-2MM", batchId: "batch-001", batchNo: "BN-202403-001", pendingBatch: null, countedQty: "82" }),
      hydrateRow({ __rowId: "so-manual-905-row-2", materialId: "mat-001", materialSku: "ALU-SH-2MM", batchId: "batch-004", batchNo: "BN-202405-004", pendingBatch: null, countedQty: "148" }),
      hydrateRow({ __rowId: "so-manual-905-row-3", materialId: "mat-002", materialSku: "STL-PIPE-05", batchId: "batch-003", batchNo: "BN-202403-003", pendingBatch: null, countedQty: "36" }),
      hydrateRow({ __rowId: "so-manual-905-row-4", materialId: "mat-002", materialSku: "STL-PIPE-05", batchId: "batch-006", batchNo: "BN-202603-006", pendingBatch: null, countedQty: "40" }),
      hydrateRow({ __rowId: "so-manual-905-row-5", materialId: "mat-003", materialSku: "PLAS-HDPE-GR", batchId: "batch-016", batchNo: "BAT-260501-000009", pendingBatch: null, countedQty: "1180" }),
      hydrateRow({ __rowId: "so-manual-905-row-6", materialId: "mat-005", materialSku: "FAST-M6-HEX", batchId: "batch-017", batchNo: "BAT-260501-000010", pendingBatch: null, countedQty: "4900" }),
    ],
    result: null,
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Created", "Manual Stock Opname was saved as draft (6 rows).", "2026-09-05T10:00:00Z"),
    ],
  },
  // Demo-only: an upload-originated draft that's already normalized and
  // parked in Review, one row per inline field-error variant, so every
  // message can be seen without having to hand-craft a bad file — its rows
  // are always __showErrors: true, same as a real mapping run (see
  // buildStockOpnameRowsFromMapping).
  {
    id: "SO-20260906-0001",
    method: "upload",
    createdAt: "2026-09-06T09:00:00Z",
    createdBy: CURRENT_USER.name,
    appliedAt: null,
    sourceFile: "warehouse_recount_demo.csv",
    totalRows: 4,
    status: "Review",
    rows: [
      // Material SKU not found -> Batch not found too (its own raw value,
      // even though the material never resolved).
      hydrateRow({
        __rowId: "so-demo-row-1",
        materialId: null,
        materialSku: "XYZ-999-NOTFOUND",
        batchId: null,
        batchNo: "BN-UNKNOWN-001",
        pendingBatch: null,
        countedQty: "50",
        __showErrors: true,
      }),
      // Material SKU + Batch both blank in the source file.
      hydrateRow({
        __rowId: "so-demo-row-2",
        materialId: null,
        materialSku: "",
        batchId: null,
        batchNo: "",
        pendingBatch: null,
        countedQty: "",
        __showErrors: true,
      }),
      // Material SKU matched, but its Batch value didn't match any existing
      // Batch for that Material.
      hydrateRow({
        __rowId: "so-demo-row-3",
        materialId: "mat-001",
        materialSku: "ALU-SH-2MM",
        batchId: null,
        batchNo: "BN-UNKNOWN-002",
        pendingBatch: null,
        countedQty: "80",
        __showErrors: true,
      }),
      // Material SKU + Batch both matched, but Counted Qty was left blank
      // in the source file.
      hydrateRow({
        __rowId: "so-demo-row-4",
        materialId: "mat-001",
        materialSku: "ALU-SH-2MM",
        batchId: "batch-001",
        batchNo: "BN-202403-001",
        pendingBatch: null,
        countedQty: "",
        __showErrors: true,
      }),
    ],
    result: null,
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Upload Created", "File \"warehouse_recount_demo.csv\" was uploaded.", "2026-09-06T09:00:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Mapping Started", "Uploaded columns are ready to be mapped.", "2026-09-06T09:00:30Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Ready for Review", "Data is ready for review.", "2026-09-06T09:02:20Z"),
    ],
  },
  {
    id: "SO-20260908-0001",
    method: "upload",
    createdAt: "2026-09-08T14:12:00Z",
    createdBy: NOTIFICATION_USERS[2].name,
    appliedAt: null,
    sourceFile: "warehouse_b_counting_sheet.csv",
    totalRows: 24,
    status: "Normalizing Data",
    rows: [],
    result: null,
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Upload Created", "File \"warehouse_b_counting_sheet.csv\" was uploaded.", "2026-09-08T14:12:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[2].name), "Mapping Started", "Uploaded columns are ready to be mapped.", "2026-09-08T14:12:30Z"),
    ],
  },
  {
    id: "SO-20260910-0001",
    method: "upload",
    createdAt: "2026-09-10T09:05:00Z",
    createdBy: NOTIFICATION_USERS[3].name,
    appliedAt: null,
    sourceFile: "components_recount.xlsx",
    totalRows: 9,
    status: "Mapping",
    // Lets the Mapping step's own auto-match run when this record is
    // reopened (StockOpnameNewPage seeds parsedHeaders/parsedRows from
    // these on resume) — header spellings are close-but-not-exact synonyms
    // on purpose, so the "AI Recommendation" column has real fuzzy matches
    // to show instead of "No match found" for every field.
    sourceHeaders: ["SKU", "Batch No", "Actual Qty"],
    rawRows: [
      { "SKU": "ALU-SH-2MM", "Batch No": "BN-202403-001", "Actual Qty": "82" },
      { "SKU": "STL-PIPE-05", "Batch No": "BN-202403-003", "Actual Qty": "36" },
      { "SKU": "PLAS-HDPE-GR", "Batch No": "BAT-260501-000009", "Actual Qty": "1180" },
      { "SKU": "FAST-M6-HEX", "Batch No": "BAT-260501-000010", "Actual Qty": "4900" },
      { "SKU": "PLY-18-001", "Batch No": "BAT-260501-000005", "Actual Qty": "58" },
      { "SKU": "GLU-5KG-009", "Batch No": "BAT-260501-000011", "Actual Qty": "28" },
      { "SKU": "VEN-TEAK-12", "Batch No": "BAT-260501-000001", "Actual Qty": "495" },
      { "SKU": "FOM-ROL-04", "Batch No": "BAT-260501-000003", "Actual Qty": "290" },
      { "SKU": "STL-BOLT-M8", "Batch No": "BAT-260501-000012", "Actual Qty": "118" },
    ],
    rows: [],
    result: null,
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Upload Created", "File \"components_recount.xlsx\" was uploaded.", "2026-09-10T09:05:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[3].name), "Mapping Started", "Uploaded columns are ready to be mapped.", "2026-09-10T09:05:30Z"),
    ],
  },
  {
    id: "SO-20260912-0001",
    method: "manual",
    createdAt: "2026-09-12T13:00:00Z",
    createdBy: CURRENT_USER.name,
    appliedAt: "2026-09-12T13:20:00Z",
    sourceFile: null,
    totalRows: 4,
    status: "Processing",
    rows: [],
    result: null,
    logs: [
      makeLog(actorForName(CURRENT_USER.name), "Created", "Manual Stock Opname was saved as draft (4 rows).", "2026-09-12T13:00:00Z"),
      makeLog(actorForName(CURRENT_USER.name), "Apply Started", "Stock adjustments are being applied in the background.", "2026-09-12T13:20:00Z"),
    ],
  },
  {
    id: "SO-20260913-0001",
    method: "upload",
    createdAt: "2026-09-13T10:30:00Z",
    createdBy: NOTIFICATION_USERS[0].name,
    appliedAt: "2026-09-13T10:45:00Z",
    sourceFile: "warehouse_c_recount.xlsx",
    totalRows: 12,
    status: "Processing",
    rows: [],
    result: null,
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[0].name), "Upload Created", "File \"warehouse_c_recount.xlsx\" was uploaded.", "2026-09-13T10:30:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[0].name), "Mapping Started", "Uploaded columns are ready to be mapped.", "2026-09-13T10:30:30Z"),
      makeLog(actorForName(NOTIFICATION_USERS[0].name), "Review Started", "Normalized rows are ready to be reviewed.", "2026-09-13T10:35:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[0].name), "Apply Started", "Stock adjustments are being applied in the background.", "2026-09-13T10:45:00Z"),
    ],
  },
  {
    id: "SO-20260803-0001",
    method: "upload",
    createdAt: "2026-08-03T11:00:00Z",
    createdBy: NOTIFICATION_USERS[1].name,
    appliedAt: null,
    sourceFile: "aug_recount_cancelled.csv",
    totalRows: 10,
    status: "Cancelled",
    // Cancelled before Apply ever ran, so nothing here has a real `result` —
    // StockOpnameResultPage always renders every row of a Cancelled record
    // as "Not Applied" regardless of this field (see its own comment).
    rows: [
      resultRow("so-cancelled-row-1", { materialSku: "ALU-SH-2MM", materialName: "Aluminium Sheet 2mm", batchNo: "BN-202403-001", initialQty: 100, beforeQty: 85, countedQty: "82" }),
      resultRow("so-cancelled-row-2", { materialSku: "ALU-SH-2MM", materialName: "Aluminium Sheet 2mm", batchNo: "BN-202405-004", initialQty: 150, beforeQty: 150, countedQty: "150" }),
      resultRow("so-cancelled-row-3", { materialSku: "STL-PIPE-05", materialName: "Steel Pipe 1/2 inch", batchNo: "BN-202603-006", initialQty: 100, beforeQty: 40, countedQty: "38" }),
      resultRow("so-cancelled-row-4", { materialSku: "STL-PIPE-05", materialName: "Steel Pipe 1/2 inch", batchNo: "BAT-260501-000008", initialQty: 45, beforeQty: 45, countedQty: "44" }),
      resultRow("so-cancelled-row-5", { materialSku: "PLAS-HDPE-GR", materialName: "Plastic Granules HDPE", batchNo: "BAT-260501-000009", initialQty: 1200, beforeQty: 1200, countedQty: "1180" }),
      resultRow("so-cancelled-row-6", { materialSku: "FAST-M6-HEX", materialName: "M6 Hex Bolt", batchNo: "BAT-260501-000010", initialQty: 5000, beforeQty: 5000, countedQty: "4900" }),
      resultRow("so-cancelled-row-7", { materialSku: "GLU-5KG-009", materialName: "Wood Glue 5kg", batchNo: "BAT-260501-000011", initialQty: 30, beforeQty: 30, countedQty: "30" }),
      resultRow("so-cancelled-row-8", { materialSku: "STL-BOLT-M8", materialName: "Steel Bolt M8", batchNo: "BAT-260501-000012", initialQty: 120, beforeQty: 120, countedQty: "115" }),
      resultRow("so-cancelled-row-9", { materialSku: "MTL-002", materialName: "Aluminum Tube 50mm", batchNo: "BAT-260501-000013", initialQty: 40, beforeQty: 40, countedQty: "40" }),
      resultRow("so-cancelled-row-10", { materialSku: "VEN-TEAK-12", materialName: "Teak Veneer Sheet", batchNo: "BAT-260501-000001", initialQty: 500, beforeQty: 500, countedQty: "480" }),
    ],
    result: null,
    logs: [
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Upload Created", "File \"aug_recount_cancelled.csv\" was uploaded.", "2026-08-03T11:00:00Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Mapping Started", "Uploaded columns are ready to be mapped.", "2026-08-03T11:00:30Z"),
      makeLog(actorForName(SYSTEM_ACTOR_NAME), "Ready for Review", "Data is ready for review.", "2026-08-03T11:02:20Z"),
      makeLog(actorForName(NOTIFICATION_USERS[1].name), "Cancelled", "This Stock Opname was cancelled and no stock was adjusted.", "2026-08-03T11:10:00Z"),
    ],
  },
];

let stockOpnames = SEED_STOCK_OPNAMES.map((s) => ({ ...s }));
const listeners = new Set();

const notify = () => listeners.forEach((fn) => fn(stockOpnames));

export const getStockOpnames = () => stockOpnames;

export const getStockOpname = (id) => stockOpnames.find((s) => s.id === id) || null;

export const subscribeStockOpnames = (fn) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

// Creates the persistent record. Called on: valid file upload (Mapping),
// first Save as Draft on a manual Stock Opname (Review), or first Apply on a
// manual Stock Opname that skipped Save as Draft (Processing) — see PRD
// "Start Method" ACs 2/4/5.
export const addStockOpname = (data) => {
  const actor = actorForName(data.createdBy);
  const createdAt = new Date().toISOString();
  const record = {
    id: nextId(createdAt),
    method: data.method || "manual",
    createdAt,
    createdBy: data.createdBy || CURRENT_USER.name,
    appliedAt: data.appliedAt || null,
    sourceFile: data.sourceFile || null,
    totalRows: data.totalRows || 0,
    status: data.status || "Review",
    rows: data.rows || [],
    mapping: data.mapping || null,
    result: data.result || null,
    logs: [
      makeLog(
        actor,
        data.method === "upload" ? "Upload Created" : "Created",
        data.method === "upload"
          ? `File "${data.sourceFile || "untitled.csv"}" was uploaded.`
          : `Manual Stock Opname was saved as draft (${data.totalRows || 0} rows).`
      ),
    ],
  };
  const initialCopy = STATUS_LOG_COPY[record.status];
  if (initialCopy) {
    record.logs.push(makeLog(actor, initialCopy.title, initialCopy.desc));
  }
  stockOpnames = [record, ...stockOpnames];
  notify();
  return record;
};

export const updateStockOpname = (id, patch) => {
  const { logActorName, logTitle, logDesc, ...rest } = patch;
  stockOpnames = stockOpnames.map((s) => {
    if (s.id !== id) return s;
    const next = { ...s, ...rest, id: s.id };
    if (rest.status && rest.status !== s.status && rest.status !== "Normalizing Data") {
      const copy = STATUS_LOG_COPY[rest.status];
      const actor = actorForName(logActorName || CURRENT_USER.name);
      const log = makeLog(actor, logTitle || copy?.title || `Status Changed To "${rest.status}"`, logDesc || copy?.desc);
      next.logs = [...(s.logs || []), log];
    }
    return next;
  });
  notify();
  return getStockOpname(id);
};
