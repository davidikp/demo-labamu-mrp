import React, { useState } from "react";
import { 
  CloseIcon,
  CloudUploadIcon,
  DeleteIcon,
  Box,
  AddIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import {
  baseInputBorderColor,
  inputControlStyle,
  inputFrameStyle,
  focusInputFrame,
  blurInputFrame
} from "../../purchase-order/styles/purchaseOrderInputStyles.js";

const FormField = ({ label, required = false, children, error, helperText, headerRight }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
    {(label || headerRight) && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-regular)" }}>
          {required && <span style={{ color: "var(--status-red-primary)" }}>*</span>}
          {label && <span style={{ color: "var(--neutral-on-surface-primary)" }}>{label}</span>}
        </div>
        {headerRight && (
          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
            {headerRight}
          </span>
        )}
      </div>
    )}
    {children}
    {error && <span style={{ fontSize: "var(--text-desc)", color: "var(--status-red-primary)" }}>{error}</span>}
    {helperText && !error && (
      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
        {helperText}
      </span>
    )}
  </div>
);

const InputField = ({ value, onChange, placeholder, disabled, type = "text", maxLength, showCounter, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ 
      position: "relative", 
      width: "100%",
      display: "flex",
      alignItems: "center",
      height: "48px",
      padding: "0 16px",
      borderRadius: "10px",
      border: `1px solid ${error ? "var(--status-red-primary)" : isFocused ? "var(--feature-brand-primary)" : "#e9e9e9"}`,
      background: disabled ? "var(--neutral-surface-grey-lighter)" : "var(--neutral-surface-primary)",
      boxShadow: error ? "0 0 0 3px rgba(255, 91, 91, 0.08)" : isFocused ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      boxSizing: "border-box"
    }}>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          flex: 1,
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "var(--text-subtitle-1)",
          color: disabled ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-primary)",
          width: "100%",
          paddingRight: showCounter ? "44px" : "0",
          ...props.style
        }}
        {...props}
      />
      {showCounter && maxLength && (
        <div style={{
          position: "absolute",
          right: "12px",
          top: "50%",
          transform: "translateY(-50%)",
          fontSize: "12px",
          color: "var(--neutral-on-surface-tertiary)",
          pointerEvents: "none"
        }}>
          {String(value || "").length}/{maxLength}
        </div>
      )}
    </div>
  );
};

const TextAreaField = ({ value, onChange, placeholder, disabled, maxLength, showCounter, error, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div style={{ 
      position: "relative", 
      width: "100%",
      display: "flex",
      flexDirection: "column",
      borderRadius: "10px",
      border: `1px solid ${error ? "var(--status-red-primary)" : isFocused ? "var(--feature-brand-primary)" : "#e9e9e9"}`,
      background: disabled ? "var(--neutral-surface-grey-lighter)" : "var(--neutral-surface-primary)",
      boxShadow: error ? "0 0 0 3px rgba(255, 91, 91, 0.08)" : isFocused ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      boxSizing: "border-box",
      padding: "12px 16px"
    }}>
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        maxLength={maxLength}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        style={{
          minHeight: "120px",
          width: "100%",
          border: "none",
          outline: "none",
          background: "transparent",
          fontSize: "var(--text-subtitle-1)",
          color: disabled ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-primary)",
          resize: "none",
          fontFamily: "inherit",
          paddingBottom: showCounter ? "20px" : "0",
          ...props.style
        }}
        {...props}
      />
      {showCounter && maxLength && (
        <div style={{
          position: "absolute",
          right: "12px",
          bottom: "8px",
          fontSize: "12px",
          color: "var(--neutral-on-surface-tertiary)",
          pointerEvents: "none"
        }}>
          {String(value || "").length}/{maxLength}
        </div>
      )}
    </div>
  );
};

const ImageUpload = ({ value, onChange, disabled }) => {
  const [preview, setPreview] = useState(value);

  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const file = fileList[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const renderEmptyTile = () => (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        handleIncomingFiles(e.dataTransfer?.files);
      }}
      style={{
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: `1px dashed #A9A9A9`,
        background: "var(--neutral-surface-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-grey-lighter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" />
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
        {preview ? (
          <div style={{ position: "relative", width: "120px", height: "120px" }}>
            <div style={{
              width: "120px",
              height: "120px",
              borderRadius: "16px",
              border: "2px solid var(--feature-brand-primary)",
              padding: "4px",
              boxSizing: "border-box"
            }}>
              <div style={{
                width: "100%",
                height: "100%",
                borderRadius: "12px",
                overflow: "hidden"
              }}>
                <img src={preview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
            </div>
            {!disabled && (
              <button
                onClick={() => { setPreview(null); onChange(null); }}
                style={{
                  position: "absolute",
                  top: "-10px",
                  right: "-10px",
                  width: "28px",
                  height: "28px",
                  borderRadius: "50%",
                  background: "#FFF",
                  border: "1px solid var(--status-red-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  padding: 0,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  zIndex: 2
                }}
              >
                <CloseIcon size={16} color="var(--status-red-primary)" />
              </button>
            )}
          </div>
        ) : renderEmptyTile()}
      </div>
      
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
          Allowed formats (JPG, JPEG, PNG, WebP), Max size 25MB per file
        </span>
      </div>
    </div>
  );
};

export const MaterialCreateDrawer = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState({
    image: initialData?.image || null,
    name: initialData?.name || "",
    sku: initialData?.sku || "",
    category: initialData?.category || "",
    abcClassification: initialData?.abcClassification || "",
    materialType: initialData?.type || "", // Mapping 'type' from data to 'materialType' in form
    uom: initialData?.unit || "",
    stockRisk: initialData?.stockRisk?.toString() || "0",
    description: initialData?.description || ""
  });

  // Re-initialize form when initialData changes or drawer opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        image: initialData?.image || null,
        name: initialData?.name || "",
        sku: initialData?.sku || "",
        category: initialData?.category || "",
        abcClassification: initialData?.abcClassification || "",
        materialType: initialData?.type || "",
        uom: initialData?.unit || "",
        stockRisk: initialData?.stockRisk?.toString() || "0",
        description: initialData?.description || ""
      });
      setErrors({});
    }
  }, [isOpen, initialData]);

  const [errors, setErrors] = useState({});

  // Dynamic options
  const [categories, setCategories] = useState(["Raw Material", "Chemicals", "Electronics", "Fasteners"]);
  const [uoms, setUoms] = useState(["pcs", "kg", "grams", "liters", "meters"]);

  // Modal states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isUomModalOpen, setIsUomModalOpen] = useState(false);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [uomForm, setUomForm] = useState({ name: "", alias: "" });
  const [categoryErrors, setCategoryErrors] = useState({});
  const [uomErrors, setUomErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Field cannot be empty";
    if (!formData.category) newErrors.category = "Field cannot be empty";
    if (!formData.abcClassification) newErrors.abcClassification = "Field cannot be empty";
    if (!formData.materialType) newErrors.materialType = "Field cannot be empty";
    if (!formData.uom) newErrors.uom = "Field cannot be empty";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      onSave?.(formData);
      onClose();
    }
  };

  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSaveCategory = () => {
    const newName = categoryForm.name.trim();
    if (!newName) {
      setCategoryErrors({ name: "Field cannot be empty" });
      return;
    }
    
    if (!categories.includes(newName)) {
      setCategories(prev => [newName, ...prev]);
    }
    
    handleFieldChange("category", newName);
    setIsCategoryModalOpen(false);
    setCategoryForm({ name: "", description: "" });
    setCategoryErrors({});
  };

  const handleSaveUom = () => {
    const newName = uomForm.name.trim();
    if (!newName) {
      setUomErrors({ name: "Field cannot be empty" });
      return;
    }

    if (!uoms.includes(newName)) {
      setUoms(prev => [newName, ...prev]);
    }

    handleFieldChange("uom", newName);
    setIsUomModalOpen(false);
    setUomForm({ name: "", alias: "" });
    setUomErrors({});
  };

  const formatNumber = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const num = val.toString().replace(/[^0-9]/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleNumberInput = (val, field) => {
    const numericValue = val.replace(/,/g, "").replace(/[^0-9]/g, "");
    handleFieldChange(field, numericValue);
  };

  if (!isOpen) return null;

  return (
    <>
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
          width: "520px",
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
              {initialData ? "Edit Material" : "Add New Material"}
            </h2>
            <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
          </div>

          {/* Drawer Body */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <FormField label="Material Image">
              <ImageUpload value={formData.image} onChange={(val) => handleFieldChange("image", val)} />
            </FormField>

            <FormField label="Material Name" required error={errors.name}>
              <InputField 
                value={formData.name} 
                onChange={(e) => handleFieldChange("name", e.target.value)} 
                placeholder="Input material name"
                maxLength={100}
                showCounter
                error={errors.name}
              />
            </FormField>

            <FormField label="SKU" helperText="Auto-generated if empty">
              <InputField 
                value={formData.sku} 
                onChange={(e) => handleFieldChange("sku", e.target.value)} 
                placeholder="Input SKU"
              />
            </FormField>

            <FormField label="Category" required error={errors.category}>
              <DropdownSelect 
                searchable 
                showDivider
                maxOptionsVisible={3}
                value={formData.category}
                onChange={(val) => handleFieldChange("category", val)}
                options={categories}
                placeholder="Select category"
                hasError={!!errors.category}
                footer={
                  <Button 
                    variant="tertiary" 
                    leftIcon={AddIcon} 
                    onClick={() => setIsCategoryModalOpen(true)}
                    style={{ width: "100%", justifyContent: "flex-start", height: "32px" }}
                  >
                    Add Category
                  </Button>
                }
              />
            </FormField>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FormField label="ABC Classification" required error={errors.abcClassification}>
                <DropdownSelect 
                  showDivider
                  value={formData.abcClassification}
                  onChange={(val) => handleFieldChange("abcClassification", val)}
                  options={[
                    { value: "A", label: "A - High Value" },
                    { value: "B", label: "B - Medium Value" },
                    { value: "C", label: "C - Low Value" }
                  ]}
                  placeholder="Select classification"
                  hasError={!!errors.abcClassification}
                />
              </FormField>

              <FormField label="Material Type" required error={errors.materialType}>
                <DropdownSelect 
                  showDivider
                  value={formData.materialType}
                  onChange={(val) => handleFieldChange("materialType", val)}
                  options={[
                    { value: "Raw", label: "Raw Material" },
                    { value: "Component", label: "Semi-Finished Material" },
                    { value: "Consumable", label: "Finished Material" }
                  ]}
                  placeholder="Select material type"
                  hasError={!!errors.materialType}
                />
              </FormField>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FormField label="Unit of Measurement (UOM)" required error={errors.uom}>
                <DropdownSelect 
                  searchable
                  showDivider
                  maxOptionsVisible={3}
                  value={formData.uom}
                  onChange={(val) => handleFieldChange("uom", val)}
                  options={uoms}
                  placeholder="Select UOM"
                  hasError={!!errors.uom}
                  footer={
                    <Button 
                      variant="tertiary" 
                      leftIcon={AddIcon} 
                      onClick={() => setIsUomModalOpen(true)}
                      style={{ width: "100%", justifyContent: "flex-start", height: "32px" }}
                    >
                      Add Unit of Measurement
                    </Button>
                  }
                />
              </FormField>

              <FormField label="Stock Risk" helperText="Enter running low threshold value">
                <InputField 
                  value={formatNumber(formData.stockRisk)}
                  onChange={(e) => handleNumberInput(e.target.value, "stockRisk")}
                  placeholder="0"
                />
              </FormField>
            </div>

            <FormField label="Description">
              <TextAreaField 
                value={formData.description}
                onChange={(e) => handleFieldChange("description", e.target.value)}
                placeholder="Input material description"
                maxLength={1000}
                showCounter
              />
            </FormField>
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

      {/* Modals */}
      <GeneralModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Category"
        width="480px"
        zIndex={16000}
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsCategoryModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="filled" size="large" onClick={handleSaveCategory} style={{ flex: 1 }}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <FormField label="Name" required headerRight={`${categoryForm.name.length}/100`} error={categoryErrors.name}>
            <InputField 
              value={categoryForm.name}
              onChange={(e) => {
                setCategoryForm({ ...categoryForm, name: e.target.value });
                if (e.target.value.trim()) setCategoryErrors({});
              }}
              placeholder="Enter category name"
              maxLength={100}
              error={categoryErrors.name}
            />
          </FormField>
          <FormField label="Description" headerRight={`${categoryForm.description.length}/1000`}>
            <TextAreaField 
              value={categoryForm.description}
              onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
              placeholder="Enter category description"
              maxLength={1000}
            />
          </FormField>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={isUomModalOpen}
        onClose={() => setIsUomModalOpen(false)}
        title="Add Unit of Measurement"
        width="480px"
        zIndex={16000}
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsUomModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="filled" size="large" onClick={handleSaveUom} style={{ flex: 1 }}>
              Save
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <FormField label="Name" required headerRight={`${uomForm.name.length}/100`} error={uomErrors.name}>
            <InputField 
              value={uomForm.name}
              onChange={(e) => {
                setUomForm({ ...uomForm, name: e.target.value });
                if (e.target.value.trim()) setUomErrors({});
              }}
              placeholder="e.g. Kilogram, Piece, Meter"
              maxLength={100}
              error={uomErrors.name}
            />
          </FormField>
          <FormField label="Vendor Alias" headerRight={`${uomForm.alias.length}/100`}>
            <InputField 
              value={uomForm.alias}
              onChange={(e) => setUomForm({ ...uomForm, alias: e.target.value })}
              placeholder="e.g. kg, pcs, m"
              maxLength={100}
            />
          </FormField>
        </div>
      </GeneralModal>
    </>
  );
};
