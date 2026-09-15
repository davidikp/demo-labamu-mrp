import React from "react";
import { Table } from "../../../../ce-ui";
import { Info } from "../../../../components/icons/Icons.jsx";
import { StatusBadge } from "../../../../components/common/StatusBadge.jsx";
import { DropdownSelect } from "../../../../components/common/DropdownSelect.jsx";
import { STOCK_OPNAME_FIELDS_CONFIG, NOT_MAPPED } from "../../mock/stockOpnameFieldsConfig.js";

// Stock Opname's own Mapping step — same table-of-target-fields pattern as
// materials/upload-steps/MappingStep.jsx, scoped to the three fields the PRD
// requires (Material SKU, Batch, Counted Quantity). Kept as a separate file
// per this module's "new files, same conventions" scope.
export const StockOpnameMappingStep = ({ headers, rows = [], mapping, recommendation, onMappingChange, missingRequired = [] }) => {
  const headerOptions = [
    { value: NOT_MAPPED, label: "— Not mapped —" },
    ...headers.map((h) => ({ value: h, label: h })),
  ];

  const data = STOCK_OPNAME_FIELDS_CONFIG.map((field) => ({ id: field.key, field }));

  const getSampleValue = (sourceColumn) => {
    if (!sourceColumn || sourceColumn === NOT_MAPPED) return "—";
    const sampleRow = rows.find((r) => r[sourceColumn] != null && String(r[sourceColumn]).trim() !== "");
    const value = sampleRow ? sampleRow[sourceColumn] : rows[0]?.[sourceColumn];
    return value != null && String(value).trim() !== "" ? String(value) : "—";
  };

  const columns = [
    {
      key: "field",
      header: "Stock Opname Field",
      width: 260,
      render: (_, row) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "12px 0" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-title-3)" }}>{row.field.label}</span>
            {row.field.required && <StatusBadge variant="blue-light">Required</StatusBadge>}
          </div>
        </div>
      ),
    },
    {
      key: "sourceColumn",
      header: "Source Column",
      render: (_, row) => {
        const mappedValue = mapping[row.field.key] ?? NOT_MAPPED;
        const isMissing = missingRequired.includes(row.field.key);
        return (
          <div style={{ padding: "8px 0" }} className={mappedValue === NOT_MAPPED ? "not-mapped-select" : undefined}>
            <DropdownSelect
              value={mappedValue}
              options={headerOptions}
              onChange={(val) => onMappingChange(row.field.key, val === "" ? NOT_MAPPED : val)}
              hasError={isMissing}
              errorText={isMissing ? "Field cannot be empty" : undefined}
              placeholder="— Not mapped —"
            />
          </div>
        );
      },
    },
    {
      key: "example",
      header: "Example Value",
      width: 200,
      render: (_, row) => {
        const mappedValue = mapping[row.field.key] ?? NOT_MAPPED;
        return (
          <div style={{ padding: "12px 0" }}>
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>{getSampleValue(mappedValue)}</span>
          </div>
        );
      },
    },
    {
      key: "recommendation",
      header: "AI Recommendation",
      width: 240,
      render: (_, row) => {
        const recommended = recommendation[row.field.key] ?? NOT_MAPPED;
        return (
          <div style={{ padding: "12px 0" }}>
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              {recommended === NOT_MAPPED ? "No match found" : `Matched to "${recommended}"`}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "24px 0", flex: 1, minHeight: 0 }}>
      <style>{`
        .so-mapping-table > div:last-child { display: none; }
        .so-mapping-table th, .so-mapping-table td { height: auto !important; vertical-align: top !important; }
        .so-mapping-table th {
          padding-top: 12px !important;
          padding-bottom: 12px !important;
          border-bottom: none !important;
          box-shadow: inset 0 -1px 0 var(--neutral-line-separator-2);
        }
        .not-mapped-select [role="button"] span.text-ellipsis {
          color: var(--neutral-on-surface-tertiary) !important;
        }
      `}</style>
      <div
        style={{
          background: "var(--feature-brand-container-lighter)",
          borderRadius: "12px",
          padding: "16px 20px",
          margin: "0 24px",
          display: "flex",
          gap: "16px",
          alignItems: "flex-start",
        }}
      >
        <div style={{ marginTop: "2px" }}>
          <Info size={20} color="var(--feature-brand-primary)" />
        </div>
        <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
          Your file columns have been mapped automatically. Review the mappings before continuing.
        </span>
      </div>

      <div style={{ height: "calc(100vh - 480px)", minHeight: "280px" }}>
        <Table className="so-mapping-table" columns={columns} data={data} showPagination={false} selectedRowId={null} />
      </div>
    </div>
  );
};
