import React from "react";
import { CloudUploadIcon } from "../../../../components/icons/Icons.jsx";
import { Button } from "../../../../components/common/Button.jsx";
import { DocumentUploadField } from "../../../../ce-ui";
import { STOCK_OPNAME_FIELDS_CONFIG } from "../../mock/stockOpnameFieldsConfig.js";
import { dedupeHeaders } from "../upload-steps/UploadStep.jsx";

// Naive CSV line/field splitter — duplicated from upload-steps/UploadStep.jsx
// on purpose (Stock Opname keeps its own upload-step files rather than
// sharing the Bulk Upload wizard's components).
const parseCsvLine = (line) => {
  const cells = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current.trim());
  return cells;
};

const parseCsvText = (text) => {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = dedupeHeaders(parseCsvLine(lines[0]));
  const rows = lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const row = {};
    headers.forEach((h, idx) => {
      row[h] = cells[idx] ?? "";
    });
    return row;
  });
  return { headers, rows };
};

// .xlsx/.xls can't be parsed client-side without a library, so we simulate a
// plausible parsed result built from the Stock Opname field examples, same
// approach as UploadStep.jsx's buildSimulatedXlsxData.
const buildSimulatedXlsxData = () => {
  const headers = STOCK_OPNAME_FIELDS_CONFIG.map((f) => f.label);
  const rows = Array.from({ length: 6 }).map(() => {
    const row = {};
    STOCK_OPNAME_FIELDS_CONFIG.forEach((f) => {
      row[f.label] = f.example;
    });
    return row;
  });
  return { headers, rows };
};

// Runs the (simulated, ~3.5s) file analysis/validation and calls back with
// (headers, rows, fileName), or `onEmpty()` when a CSV genuinely has no data
// rows. Returns a `cancel()` function so a pending analysis can be abandoned.
export const analyzeStockOpnameFile = (file, onDone, onEmpty) => {
  const isCsv = /\.csv$/i.test(file.name);
  let cancelled = false;

  const timeoutId = setTimeout(() => {
    if (isCsv) {
      const reader = new FileReader();
      reader.onload = () => {
        if (cancelled) return;
        const { headers, rows } = parseCsvText(String(reader.result || ""));
        if (rows.length === 0) {
          onEmpty?.();
        } else {
          onDone(headers, rows, file.name);
        }
      };
      reader.onerror = () => {
        if (cancelled) return;
        const { headers, rows } = buildSimulatedXlsxData();
        onDone(headers, rows, file.name);
      };
      reader.readAsText(file);
    } else {
      const { headers, rows } = buildSimulatedXlsxData();
      onDone(headers, rows, file.name);
    }
  }, 3500);

  return () => {
    cancelled = true;
    clearTimeout(timeoutId);
  };
};

export const StockOpnameUploadStep = ({ selectedFile, onFileSelected, isAnalyzing, error, onSimulateAnalyzeFailure }) => {
  if (isAnalyzing) {
    return (
      <div style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "16px", padding: "80px 24px", minHeight: "420px" }}>
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "var(--feature-brand-container-lighter)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          <CloudUploadIcon size={32} color="var(--feature-brand-primary)" />
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: "50%",
              border: "3px solid var(--neutral-line-separator-2)",
              borderTopColor: "var(--feature-brand-primary)",
              animation: "so-spin 1s linear infinite",
            }}
          />
        </div>
        <style>{`@keyframes so-spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", textAlign: "center" }}>
          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
            Validating your file...
          </span>
          <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", maxWidth: "360px" }}>
            We're reading your file and getting it ready for column mapping. This usually takes a few seconds.
          </span>
        </div>

        {onSimulateAnalyzeFailure && (
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
              padding: "10px",
              borderRadius: "var(--radius-card)",
              border: "1px dashed var(--neutral-line-separator-2)",
              background: "var(--neutral-surface-grey-lighter)",
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Demo: simulate a failure</span>
            <div style={{ display: "flex", gap: "8px" }}>
              <Button size="small" variant="outlined" onClick={() => onSimulateAnalyzeFailure("timeout")}>
                Simulate Timeout
              </Button>
              <Button size="small" variant="outlined" onClick={() => onSimulateAnalyzeFailure("empty")}>
                Simulate Empty File
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const uploadedDocs = selectedFile
    ? [{ id: "so-upload-file", file: selectedFile, name: selectedFile.name, description: "" }]
    : [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px", padding: "24px", width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Upload Stock Opname File
          </span>
          <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>
            Upload your physical count file. For easier mapping, use the Stock Count Sheet downloaded from the Stock Opname list.
          </span>
        </div>
      </div>

      <DocumentUploadField
        files={uploadedDocs}
        maxFiles={1}
        maxSizeMB={25}
        accept=".csv,.xlsx,.xls"
        showDescription={false}
        formatsHint="Allowed formats (.csv, .xlsx, .xls)"
        error={error}
        onAdd={(files) => files[0] && onFileSelected(files[0])}
        onRemove={() => onFileSelected(null)}
      />
    </div>
  );
};
