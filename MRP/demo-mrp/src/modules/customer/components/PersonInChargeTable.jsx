import React from "react";
import { AddIcon, DeleteIcon, Star } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { InputField, PhoneInputField, Tooltip } from "../../../components/index.js";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { Table } from "../../../ce-ui";

// Column headers don't get FormField's own required-asterisk treatment, so
// mirror the same "*Label" look inline for the two mandatory PIC fields.
const requiredHeader = (label) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "2px" }}>
    <span style={{ color: "var(--status-red-primary)", fontWeight: "var(--font-weight-bold)" }}>*</span>
    {label}
  </span>
);

const ROLE_OPTIONS = [
  { value: "Viewer", label: "Viewer" },
  { value: "Approver", label: "Approver" },
];

let picRowSeq = 0;
export const nextPicRowId = () => `pic-row-${Date.now()}-${++picRowSeq}`;

// Reusable "Person In Charge" table used by the customer create/edit page,
// built on the shared ce-ui Table component — mirrors the "Additional
// Output" table pattern from WorkOrderCreateDrawer.jsx (editable cells via
// render functions, no pagination). `readOnly` renders it as a plain
// read-only table (used on the detail page).
export const PersonInChargeTable = ({ pics, onChange, readOnly = false, primaryError, fieldErrors = {} }) => {
  const setPics = (next) => onChange(next);

  const addRow = () => {
    setPics([
      ...pics,
      {
        id: nextPicRowId(),
        primary: pics.length === 0,
        name: "",
        email: "",
        role: "Approver",
        phone: "+62",
      },
    ]);
  };

  const updateRow = (id, patch) => {
    setPics(pics.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const setPrimary = (id) => {
    setPics(pics.map((row) => ({ ...row, primary: row.id === id })));
  };

  const removeRow = (id) => {
    const wasPrimary = pics.find((row) => row.id === id)?.primary;
    const remaining = pics.filter((row) => row.id !== id);
    if (wasPrimary && remaining.length > 0) {
      remaining[0] = { ...remaining[0], primary: true };
    }
    setPics(remaining);
  };

  const columns = [
    ...(readOnly
      ? []
      : [
          {
            key: "primary",
            header: "Primary",
            width: 90,
            render: (_value, row) => (
              <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <input
                  type="checkbox"
                  checked={!!row.primary}
                  onChange={() => setPrimary(row.id)}
                  style={{ width: "18px", height: "18px", cursor: "pointer" }}
                />
              </div>
            ),
          },
        ]),
    {
      key: "name",
      header: readOnly ? "Name" : requiredHeader("Name"),
      width: 200,
      render: (_value, row) =>
        readOnly ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {row.name || "-"}
            {row.primary && (
              <Tooltip content="Primary PIC">
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "20px",
                    height: "20px",
                    borderRadius: "6px",
                    background: "var(--status-yellow-primary)",
                  }}
                >
                  <Star size={12} fill="white" color="white" />
                </span>
              </Tooltip>
            )}
          </span>
        ) : (
          <InputField
            value={row.name}
            onChange={(e) => updateRow(row.id, { name: e.target.value })}
            placeholder="Input Name"
            error={fieldErrors[`${row.id}_name`]}
          />
        ),
    },
    {
      key: "email",
      header: readOnly ? "Email" : requiredHeader("Email"),
      width: 240,
      render: (_value, row) =>
        readOnly ? (
          row.email || "-"
        ) : (
          <InputField
            value={row.email}
            onChange={(e) => updateRow(row.id, { email: e.target.value })}
            placeholder="Input Email"
            error={fieldErrors[`${row.id}_email`]}
          />
        ),
    },
    {
      key: "phone",
      header: "Phone",
      width: 220,
      render: (_value, row) =>
        readOnly ? (
          row.phone || "-"
        ) : (
          <PhoneInputField
            value={row.phone}
            onChange={(val) => updateRow(row.id, { phone: val })}
            error={fieldErrors[`${row.id}_phone`]}
          />
        ),
    },
    {
      key: "role",
      header: "Role",
      width: 160,
      render: (_value, row) =>
        readOnly ? (
          row.role || "-"
        ) : (
          <DropdownSelect
            value={row.role}
            onChange={(val) => updateRow(row.id, { role: val })}
            options={ROLE_OPTIONS}
            placeholder="Select role"
            clearable={false}
          />
        ),
    },
    ...(readOnly
      ? []
      : [
          {
            key: "actions",
            header: "",
            align: "center",
            width: 64,
            render: (_value, row) => (
              <div style={{ height: "48px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconButton
                  icon={DeleteIcon}
                  size="small"
                  // Only tint the icon red when the action is actually
                  // available — IconButton applies `color` unconditionally
                  // via inline style, which would otherwise override the
                  // disabled/greyed-out look with red.
                  color={pics.length === 1 ? undefined : "var(--status-red-primary)"}
                  disabled={pics.length === 1}
                  onClick={() => removeRow(row.id)}
                />
              </div>
            ),
          },
        ]),
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <style>{`
        /* Top-align every cell so a row stays visually aligned across all its
           fields once one of them grows taller from an inline error message
           below it — center-aligned cells would otherwise bob up/down
           relative to their neighbors. Primary/Actions get their own 48px
           centering band (see render fns) to match the ~48px field height. */
        .pic-table table td { height: auto; vertical-align: top; padding-top: 12px; padding-bottom: 12px; }
        .pic-table div[class*="min-h-[60px]"] { display: none; }
      `}</style>
      <div className="pic-table">
        <Table
          columns={columns}
          data={readOnly ? [...pics].sort((a, b) => (b.primary ? 1 : 0) - (a.primary ? 1 : 0)) : pics}
          totalRows={pics.length}
          showPagination={false}
          footerTotal=""
          className="!h-auto"
          selectedRowId={null}
          emptyStateTitle="No person in charge added yet."
        />
      </div>

      {primaryError ? (
        <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{primaryError}</span>
      ) : null}

      {!readOnly && (
        <Button variant="outlined" size="small" leftIcon={AddIcon} onClick={addRow} style={{ alignSelf: "flex-start" }}>
          Add PIC
        </Button>
      )}
    </div>
  );
};
