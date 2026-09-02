import React, { useEffect, useRef, useState } from "react";
import { CloseIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FormField, InputField } from "../../../components/index.js";
import { MOCK_MATERIALS_DATA } from "../../materials/mock/materialsMocks.js";
import { getBomLinkedToMaterial } from "../../bill-of-materials/mock/bomMocks.js";
import { MaterialComboBox, PRIORITY_OPTIONS } from "./WorkOrderCreateDrawer.jsx";
import { Card, LabelValue } from "./WorkOrderDetailWidgets.jsx";

// Statuses past this point mean production has already started against the
// current main output/quantity, so the target and its schedule are locked.
const LOCKED_STATUS_KEYS = new Set(["ready_to_process", "in_progress"]);

const ORDER_TYPE_OPTIONS = [
  { value: "Internal", label: "Internal" },
  { value: "Customer", label: "Customer" },
  { value: "Forecast", label: "Forecast" },
  { value: "Rework", label: "Rework" },
];

const pluralizeUnit = (unit) => {
  const lower = String(unit || "unit").toLowerCase();
  return lower.endsWith("s") ? lower : `${lower}s`;
};

// Builds the drawer's local form state from the work order's current fields
// (passed down as individual props from WorkOrderDetailPage rather than a
// single record, since that page keeps its data fragmented across several
// useState hooks instead of one source-of-truth object). Additional outputs
// aren't editable here — that lives in the Work Order Detail page's
// "Additional Output" tab — but they're carried through untouched on save so
// editing Main Output/Quantity here doesn't wipe them out.
const buildFormState = ({ orderType, priority, notes, start, end, outputs }) => {
  const list = outputs && outputs.length ? outputs : [];
  const main = list.find((o) => o.isMain) || list[0] || {};
  const rest = list.filter((o) => o !== main);
  return {
    orderType: orderType || "Internal",
    priority: priority || "Medium",
    notes: notes || "",
    start: start || "",
    end: end || "",
    materialId: main.materialId || "",
    materialSearchText: main.name || "",
    quantity: main.qty != null ? String(main.qty) : "",
    additionalOutputs: rest,
  };
};

// Edit drawer for an existing Work Order — mirrors WorkOrderCreateDrawer's
// layout (Information / Order Type / Priority / Planned dates / Target
// Output / Notes) so the two flows read consistently, but pre-fills from the
// current record and reports changes back via onSave rather than calling
// createWorkOrder.
export const WorkOrderEditDrawer = ({ isOpen, onClose, workOrder, onSave }) => {
  const [formData, setFormData] = useState(() => buildFormState(workOrder || {}));
  const [errors, setErrors] = useState({});
  const [outputError, setOutputError] = useState("");
  const outputErrorRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setFormData(buildFormState(workOrder || {}));
      setErrors({});
      setOutputError("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const isLocked = LOCKED_STATUS_KEYS.has(workOrder?.statusKey);
  const isCustomerOrder = workOrder?.fulfillmentType === "CustomerOrder";

  const eligibleMaterials = MOCK_MATERIALS_DATA.filter((m) => !!getBomLinkedToMaterial(m.id));
  const materialOptions = eligibleMaterials.map((m) => ({ id: m.id, name: m.name, sku: m.sku }));

  const mainMaterialUnit = eligibleMaterials.find((m) => m.id === formData.materialId)?.unit || "";
  const linkedBom = getBomLinkedToMaterial(formData.materialId);

  const totalOutputQty =
    (Number(formData.quantity) || 0) +
    formData.additionalOutputs.reduce((sum, row) => sum + (Number(row.qty) || 0), 0);

  const validate = () => {
    const newErrors = {};
    if (!isCustomerOrder) {
      if (!formData.materialId) newErrors.materialId = "Field cannot be empty";
      if (!formData.quantity || Number(formData.quantity) <= 0) newErrors.quantity = "Field cannot be empty";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    if (!isCustomerOrder && workOrder?.processedQty > totalOutputQty) {
      setOutputError(
        `Total output cannot be less than the processed routing quantity (${workOrder.processedQty} ${pluralizeUnit(workOrder.processedUnit)}).`
      );
      requestAnimationFrame(() => {
        outputErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }
    setOutputError("");

    if (isCustomerOrder) {
      onSave?.({
        orderType: formData.orderType,
        priority: formData.priority,
        notes: formData.notes,
        start: formData.start,
        end: formData.end,
      });
      onClose();
      return;
    }

    const material = eligibleMaterials.find((m) => m.id === formData.materialId);

    const outputs = [
      {
        materialId: material?.id,
        name: material?.name,
        sku: material?.sku,
        unit: material?.unit,
        qty: Number(formData.quantity),
        isMain: true,
      },
      ...formData.additionalOutputs,
    ];

    onSave?.({
      orderType: formData.orderType,
      priority: formData.priority,
      notes: formData.notes,
      start: formData.start,
      end: formData.end,
      product: material?.name,
      sku: material?.sku,
      qty: Number(formData.quantity),
      bomId: linkedBom?.id || null,
      outputs,
    });
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
            Edit Work Order
          </h2>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Drawer Body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <Card style={{ padding: "16px", boxShadow: "none", border: "1px solid var(--neutral-line-separator-1)", flex: 1 }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
                <LabelValue label="Work Order Number" value={workOrder?.wo || "-"} />
                <LabelValue label="Order Number" value={workOrder?.ord || "-"} />
                <LabelValue
                  label="Target Type"
                  value={workOrder?.targetType === "Product" ? "Product" : "Material"}
                />
                <LabelValue
                  label="Fulfillment Type"
                  value={workOrder?.fulfillmentType === "StockBuild" ? "Stock Build" : "Customer Order"}
                />
              </div>
            </Card>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <FormField label="Order Type" required>
                <DropdownSelect
                  showDivider
                  value={formData.orderType}
                  onChange={(val) => setFormData({ ...formData, orderType: val })}
                  options={ORDER_TYPE_OPTIONS}
                  placeholder="Select order type"
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Priority" required>
                <DropdownSelect
                  showDivider
                  value={formData.priority}
                  onChange={(val) => setFormData({ ...formData, priority: val })}
                  options={PRIORITY_OPTIONS}
                  placeholder="Select priority"
                />
              </FormField>
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <FormField label="Planned Start Date">
                <InputField
                  type="date"
                  value={formData.start}
                  onChange={(e) => setFormData({ ...formData, start: e.target.value })}
                  disabled={isLocked}
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Planned End Date">
                <InputField
                  type="date"
                  value={formData.end}
                  onChange={(e) => setFormData({ ...formData, end: e.target.value })}
                  disabled={isLocked}
                />
              </FormField>
            </div>
          </div>

          {!isCustomerOrder && (
          <>
          <div ref={outputErrorRef} style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <FormField label="Main Output" required error={errors.materialId}>
                <MaterialComboBox
                  value={formData.materialId}
                  searchText={formData.materialSearchText}
                  options={materialOptions}
                  hasError={!!errors.materialId}
                  disabled={isLocked}
                  placeholder="Search material name"
                  onSearchChange={(text) =>
                    setFormData((prev) => ({ ...prev, materialSearchText: text, materialId: "" }))
                  }
                  onSelect={(opt) =>
                    setFormData((prev) => ({ ...prev, materialId: opt.id, materialSearchText: opt.name }))
                  }
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Quantity" required error={errors.quantity}>
                <InputField
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Enter quantity"
                  errorState={!!errors.quantity}
                  suffix={mainMaterialUnit}
                />
              </FormField>
            </div>
          </div>
          {outputError ? (
            <span style={{ fontSize: "12px", color: "var(--status-red-primary)" }}>{outputError}</span>
          ) : null}

          </>
          )}

          <InputField
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Add notes (optional)"
            multiline
            maxLength={400}
            showCounter
          />
        </div>

        {/* Drawer Footer */}
        <div style={{
          padding: "16px 24px",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "var(--neutral-surface-primary)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
            <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
            <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>Save</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
