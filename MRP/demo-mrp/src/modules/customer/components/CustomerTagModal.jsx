import React, { useEffect, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { FormField, InputField } from "../../../components/index.js";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";

const RadioGroup = ({ options, value, onChange }) => (
  <div style={{ display: "flex", gap: "24px" }}>
    {options.map((opt) => (
      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
        <div
          onClick={() => onChange(opt.value)}
          style={{
            width: "20px",
            height: "20px",
            borderRadius: "50%",
            border: `2px solid ${value === opt.value ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-2)"}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {value === opt.value && (
            <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "var(--feature-brand-primary)" }} />
          )}
        </div>
        <span style={{ fontSize: "var(--text-subtitle-1)", color: "var(--neutral-on-surface-primary)" }}>
          {opt.label}
        </span>
      </label>
    ))}
  </div>
);

// Add/Edit modal for a Customer Tag — mirrors the Add/Edit Category modal
// pattern from MaterialManagePage.jsx.
export const CustomerTagModal = ({ isOpen, mode = "Add", initialTag, onClose, onSave }) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active");
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setName(initialTag?.name || "");
      setStatus(initialTag?.status || "Active");
      setError(null);
    }
  }, [isOpen, initialTag]);

  const handleSave = () => {
    if (!name.trim()) {
      setError("Field cannot be empty");
      return;
    }
    onSave({ name: name.trim(), status });
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "Add" ? "Add Customer Tag" : "Edit Customer Tag"}
      width="480px"
      footer={
        <div style={{ display: "flex", gap: "12px", width: "100%" }}>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>
            Save
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        <InputField
          label="Tag Name"
          required
          showCounter
          error={error}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (e.target.value.trim()) setError(null);
          }}
          placeholder="Enter tag name"
          maxLength={100}
        />

        <FormField label="Status">
          <RadioGroup
            options={[
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
            value={status}
            onChange={setStatus}
          />
        </FormField>
      </div>
    </GeneralModal>
  );
};
