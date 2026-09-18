// Stock Opname field config + Stock Count Sheet export — sibling to
// materialFieldsConfig.js, kept in its own file per Stock Opname's "new
// files, same conventions" scope.
import { getMaterials } from "./materialsMocks.js";
import { getBatches } from "./batchesStore.js";
import { findMaterialBySku, hydrateRow, makeEmptyRow } from "./stockOpnameValidation.js";

// Target fields Mapping asks the user to confirm for an uploaded file —
// mirrors MATERIAL_FIELDS_CONFIG's shape but only the three fields the PRD
// requires (Material SKU, Batch, Counted Quantity). `synonyms` are lowercase,
// normalized (no spaces/punctuation) alternate header spellings used for
// fuzzy auto-matching, same convention as MATERIAL_FIELDS_CONFIG.
export const STOCK_OPNAME_FIELDS_CONFIG = [
  {
    key: "materialSku",
    label: "Material SKU",
    required: true,
    example: "ALU-SH-2MM",
    synonyms: ["materialsku", "sku", "code", "materialcode", "itemcode"],
  },
  {
    key: "batch",
    label: "Batch",
    required: true,
    example: "BN-202403-001",
    synonyms: ["batch", "batchno", "batchnumber", "lot", "lotno"],
  },
  {
    key: "countedQty",
    label: "Counted Quantity",
    required: true,
    example: "42",
    synonyms: ["countedqty", "countedquantity", "countqty", "physicalqty", "actualqty"],
  },
];

export const REQUIRED_STOCK_OPNAME_FIELD_KEYS = STOCK_OPNAME_FIELDS_CONFIG.filter((f) => f.required).map((f) => f.key);

export const NOT_MAPPED = "__not_mapped__";

const normalizeHeader = (s) => String(s || "").toLowerCase().replace(/[^a-z0-9]/g, "");

// Fuzzy-matches each target field against the parsed file's headers using
// synonym/label equality or substring containment on normalized strings —
// same algorithm as materialFieldsConfig.js's autoMatchHeaders.
export const autoMatchHeaders = (headers) => {
  const normalizedHeaders = (headers || []).map((h) => ({ raw: h, norm: normalizeHeader(h) }));
  const result = {};

  STOCK_OPNAME_FIELDS_CONFIG.forEach((field) => {
    const candidates = [normalizeHeader(field.label), ...field.synonyms.map(normalizeHeader)];
    let bestMatch = null;

    for (const h of normalizedHeaders) {
      if (candidates.includes(h.norm)) {
        bestMatch = h.raw;
        break;
      }
    }
    if (!bestMatch) {
      for (const h of normalizedHeaders) {
        if (candidates.some((c) => c && (h.norm.includes(c) || c.includes(h.norm)))) {
          bestMatch = h.raw;
          break;
        }
      }
    }
    result[field.key] = bestMatch || NOT_MAPPED;
  });

  return result;
};

// Turns raw uploaded rows + confirmed column mapping into Stock Opname
// Review rows — the "Normalizing Data" backend step (PRD "Upload, Mapping &
// Normalizing Data" AC 6-8): matches Material SKU and Batch against current
// Labamu records, loads Initial/Current Qty for a matched Batch, and leaves
// unmatched Material SKU/Batch for the user to resolve in Review (System
// Rule: original uploaded values are retained for the row's error context).
export const buildStockOpnameRowsFromMapping = (rawRows, mapping) => {
  const batches = getBatches();

  return (rawRows || []).map((rawRow) => {
    const rawSku = mapping.materialSku !== NOT_MAPPED ? rawRow[mapping.materialSku] : "";
    const rawBatch = mapping.batch !== NOT_MAPPED ? rawRow[mapping.batch] : "";
    const rawCountedQty = mapping.countedQty !== NOT_MAPPED ? rawRow[mapping.countedQty] : "";

    const material = findMaterialBySku(rawSku);
    const batch = material
      ? batches.find((b) => b.materialId === material.id && b.batchNo?.toLowerCase() === String(rawBatch || "").toLowerCase())
      : null;

    const row = {
      ...makeEmptyRow(),
      materialId: material?.id || null,
      materialSku: String(rawSku || "").trim(),
      batchId: batch?.id || null,
      batchNo: batch ? batch.batchNo : String(rawBatch || "").trim(),
      countedQty: String(rawCountedQty ?? "").trim(),
      // Rows built from an uploaded file are already fully populated (or
      // deliberately not — a value that failed to match, or was missing in
      // the file) — surface inline field errors immediately instead of
      // waiting for Apply, unlike a manual "+ New Row" which starts blank.
      __showErrors: true,
    };
    return hydrateRow(row);
  });
};

const formatSnapshotTimestamp = (d) => {
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const csvEscape = (value) => {
  const str = String(value ?? "");
  return /[",\n]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
};

// Triggers a browser download of a CSV snapshot of current stock, one row
// per Material SKU + Batch combination, with Counted Qty and Notes left
// blank for the user to fill in during physical counting (PRD "Stock Count
// Sheet" AC 2-5). Same Blob/object-URL technique as
// materialFieldsConfig.js's downloadMaterialTemplateCsv — no new dependency.
// `filters` (all optional arrays, matching MaterialsListPage's own filter
// values) narrow the sheet down to the Materials matching every non-empty
// filter before its Batches are included.
const ALL_FILTER_VALUE = "__all__";
// A field holding just ["__all__"] (the modal's "All ..." option) means the
// same thing as an empty array here — no filter on that field.
const isUnfiltered = (values) => values.length === 0 || values.includes(ALL_FILTER_VALUE);

export const downloadStockCountSheetCsv = (filters = {}) => {
  const { category = [], type = [], status = [], abcClassification = [] } = filters;
  const materials = getMaterials().filter((m) => {
    const matchesCategory = isUnfiltered(category) || category.includes(m.category);
    const matchesType = isUnfiltered(type) || type.includes(m.type);
    const matchesStatus = isUnfiltered(status) || status.includes(m.status);
    const matchesAbc = isUnfiltered(abcClassification) || abcClassification.includes(m.abcClassification);
    return matchesCategory && matchesType && matchesStatus && matchesAbc;
  });
  const materialById = new Map(materials.map((m) => [m.id, m]));
  const batches = getBatches().filter((b) => b.status !== "Disposed" && materialById.has(b.materialId));

  const snapshotTime = formatSnapshotTimestamp(new Date());
  const headers = [
    "Material SKU",
    "Material Name",
    "Batch",
    "Initial Qty",
    "Current Qty",
    "Unit of Measurement",
    "Storage Location",
    "Counted Qty",
    "Notes",
  ];

  const rows = batches.map((batch) => {
    const material = materialById.get(batch.materialId);
    return [
      material?.sku || "",
      material?.name || "",
      batch.batchNo || "",
      batch.initialQty ?? "",
      batch.currentQty ?? "",
      material?.unit || "",
      batch.storageLocation || "",
      "",
      "",
    ];
  });

  const lines = [
    `Stock Snapshot Time,${csvEscape(snapshotTime)}`,
    headers.map(csvEscape).join(","),
    ...rows.map((r) => r.map(csvEscape).join(",")),
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `stock_opname_count_sheet_${snapshotTime.replace(/[: ]/g, "-")}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
