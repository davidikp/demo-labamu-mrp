import React, { useEffect, useState } from "react";
import { AddIcon, CloseIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { InputField } from "../../../components/index.js";
import { Table } from "../../../ce-ui";
import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";
import { MaterialComboBox } from "./WorkOrderCreateDrawer.jsx";

let additionalOutputEditRowSeq = 0;
const nextRowId = () => `additional-output-edit-row-${++additionalOutputEditRowSeq}`;

// Standalone drawer for managing a Work Order's Additional Outputs from the
// Detail page's "Additional Output" tab — reuses the same editable table UI
// as WorkOrderCreateDrawer's additional-output section, but scoped only to
// those secondary outputs (the main output is edited via "Edit Work Order").
export const AdditionalOutputEditDrawer = ({ isOpen, onClose, mainOutputMaterialId, additionalOutputs, onSave }) => {
  const [rows, setRows] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      const mapped = (additionalOutputs || []).map((o) => ({
        id: nextRowId(),
        materialId: o.materialId || "",
        materialSearchText: o.name || "",
        quantity: o.qty != null ? String(o.qty) : "",
      }));
      // Same default as the Add Work Order form: opening with nothing saved
      // yet starts with one blank row ready to fill in, instead of an empty
      // table the user has to click "+ Additional Output" to populate.
      setRows(mapped.length ? mapped : [{ id: nextRowId(), materialId: "", materialSearchText: "", quantity: "" }]);
      setErrors({});
    }
  }, [isOpen, additionalOutputs]);

  const allMaterialOptions = MOCK_MATERIALS_DATA.map((m) => ({ id: m.id, name: m.name, sku: m.sku }));

  const addRow = () => {
    setRows((prev) => [...prev, { id: nextRowId(), materialId: "", materialSearchText: "", quantity: "" }]);
  };

  const updateRow = (rowId, patch) => {
    setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...patch } : row)));
  };

  const removeRow = (rowId) => {
    setRows((prev) => prev.filter((row) => row.id !== rowId));
  };

  const validate = () => {
    const newErrors = {};
    rows.forEach((row) => {
      if (!row.materialId) newErrors[`material_${row.id}`] = "Field cannot be empty";
      if (!row.quantity || Number(row.quantity) <= 0) newErrors[`quantity_${row.id}`] = "Field cannot be empty";
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    const outputs = rows.map((row) => {
      const material = MOCK_MATERIALS_DATA.find((m) => m.id === row.materialId);
      return {
        materialId: material?.id,
        name: material?.name,
        sku: material?.sku,
        unit: material?.unit,
        qty: Number(row.quantity),
        isMain: false,
      };
    });
    onSave?.(outputs);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0, 0, 0, 0.28)",
      display: "flex",
      justifyContent: "flex-end",
      zIndex: 13000,
    }}>
      <div style={{ position: "absolute", inset: 0 }} onClick={onClose} />
      <div style={{
        position: "relative",
        width: "640px",
        maxWidth: "calc(100vw - 24px)",
        height: "100vh",
        background: "var(--neutral-surface-primary)",
        boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)",
        display: "flex",
        flexDirection: "column",
      }}>
        {/* Drawer Header */}
        <div style={{
          padding: "20px 24px",
          borderBottom: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--neutral-surface-primary)"
        }}>
          <h2 style={{
            margin: 0,
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)"
          }}>
            Edit Additional Output
          </h2>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
          <style>{`
            .wo-additional-output-edit-table table td { height: auto; vertical-align: top; padding-top: 12px; padding-bottom: 12px; }
            .wo-additional-output-edit-table div[class*="min-h-[60px]"] { display: none; }
          `}</style>
          <div className="wo-additional-output-edit-table">
            <Table
              columns={[
                {
                  key: "output",
                  header: "Additional Output",
                  width: 280,
                  render: (_value, row) => (
                    <div>
                      <MaterialComboBox
                        value={row.materialId}
                        searchText={row.materialSearchText}
                        options={allMaterialOptions.filter(
                          (opt) =>
                            opt.id === row.materialId ||
                            (opt.id !== mainOutputMaterialId &&
                              !rows.some((other) => other.id !== row.id && other.materialId === opt.id))
                        )}
                        hasError={!!errors[`material_${row.id}`]}
                        placeholder="Search material name"
                        onSearchChange={(text) => updateRow(row.id, { materialSearchText: text, materialId: "" })}
                        onSelect={(opt) => updateRow(row.id, { materialId: opt.id, materialSearchText: opt.name })}
                      />
                      {errors[`material_${row.id}`] ? (
                        <span style={{ fontSize: "11px", color: "var(--status-red-primary)" }}>
                          {errors[`material_${row.id}`]}
                        </span>
                      ) : null}
                    </div>
                  ),
                },
                {
                  key: "quantity",
                  header: "Quantity",
                  width: 220,
                  render: (_value, row) => {
                    const rowMaterial = MOCK_MATERIALS_DATA.find((m) => m.id === row.materialId);
                    return (
                      <div>
                        <InputField
                          type="number"
                          value={row.quantity}
                          onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                          placeholder="Enter quantity"
                          errorState={!!errors[`quantity_${row.id}`]}
                          suffix={rowMaterial?.unit || ""}
                        />
                        {errors[`quantity_${row.id}`] ? (
                          <span style={{ fontSize: "11px", color: "var(--status-red-primary)" }}>
                            {errors[`quantity_${row.id}`]}
                          </span>
                        ) : null}
                      </div>
                    );
                  },
                },
                {
                  key: "actions",
                  header: "",
                  align: "center",
                  width: 64,
                  render: (_value, row) => (
                    <div style={{ display: "flex", justifyContent: "center", marginTop: "8px" }}>
                      <IconButton
                        icon={DeleteIcon}
                        variant="danger"
                        size="small"
                        onClick={() => removeRow(row.id)}
                      />
                    </div>
                  ),
                },
              ]}
              data={rows}
              totalRows={rows.length}
              showPagination={false}
              footerTotal=""
              className="!h-auto"
              selectedRowId={null}
            />
          </div>

          <Button
            variant="outlined"
            size="small"
            leftIcon={AddIcon}
            onClick={addRow}
            style={{ alignSelf: "flex-start" }}
          >
            Additional Output
          </Button>
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: "20px 24px",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
          background: "var(--neutral-surface-primary)"
        }}>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
          <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>Save</Button>
        </div>
      </div>
    </div>
  );
};
