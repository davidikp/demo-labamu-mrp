import React, { useState } from "react";
import { ChevronLeftIcon, AddIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormField, InputField, PhoneInputField } from "../../../components/index.js";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { PersonInChargeTable, nextPicRowId } from "../../customer/components/PersonInChargeTable.jsx";
import { createQuote, updateQuote, getQuoteProductTotal, getQuoteSubtotal } from "../mock/quoteMocks.js";

const pageSectionStyle = {
  background: "var(--neutral-surface-primary)",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  overflow: "hidden",
};

const sectionHeader = (title, right) => (
  <div
    style={{
      padding: "18px 20px 0 20px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "12px",
      position: "relative",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <div
        style={{
          width: "6px",
          height: "24px",
          borderRadius: "0 4px 4px 0",
          background: "var(--feature-brand-primary)",
          position: "absolute",
          left: 0,
          top: "18px",
        }}
      />
      <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
        {title}
      </span>
    </div>
    {right || null}
  </div>
);

const CURRENCY_OPTIONS = [
  { value: "IDR", label: "IDR" },
  { value: "USD", label: "USD" },
];

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  customerPhone: "+62",
  customerAddress: "",
  rfqNo: "",
  currency: "IDR",
  downPaymentPercent: 10,
  validUntil: "",
};

let productRowSeq = 0;
const nextProductRowId = () => `quo-prod-${Date.now()}-${++productRowSeq}`;

export const QuoteCreatePage = ({ onNavigate, showSnackbar, isSidebarCollapsed, initialData }) => {
  // App.jsx's route resolver falls back to a placeholder `{ id: "create", ... }`
  // object as `location.state` whenever the URL has no real state (e.g. a
  // fresh "New Quote" navigation) — checking `.quoteNo` (always present on a
  // real quote record) avoids misreading that placeholder as edit mode.
  const isEditMode = !!initialData?.quoteNo;

  const [form, setForm] = useState(() =>
    isEditMode
      ? {
          customerName: initialData.customer?.name || initialData.customerName || "",
          customerEmail: initialData.customer?.email || "",
          customerPhone: initialData.customer?.phone || "+62",
          customerAddress: initialData.customer?.address || "",
          rfqNo: initialData.rfqNo || "",
          currency: initialData.currency || "IDR",
          downPaymentPercent: initialData.downPaymentPercent ?? 10,
          validUntil: initialData.validUntil || "",
        }
      : EMPTY_FORM
  );
  const [pics, setPics] = useState(() =>
    isEditMode && initialData.pics?.length
      ? initialData.pics
      : [{ id: nextPicRowId(), primary: true, name: "", email: "", role: "Approver", phone: "+62" }]
  );
  const [products, setProducts] = useState(() =>
    isEditMode && initialData.products?.length
      ? initialData.products
      : [{ id: nextProductRowId(), name: "", sku: "", qty: 1, uom: "pcs", unitPrice: 0, discountPercent: 0, notes: "" }]
  );
  const [errors, setErrors] = useState({});

  const updateProduct = (id, patch) => {
    setProducts((prev) => prev.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  };

  const addProduct = () => {
    setProducts((prev) => [
      ...prev,
      { id: nextProductRowId(), name: "", sku: "", qty: 1, uom: "pcs", unitPrice: 0, discountPercent: 0, notes: "" },
    ]);
  };

  const removeProduct = (id) => {
    setProducts((prev) => (prev.length === 1 ? prev : prev.filter((row) => row.id !== id)));
  };

  const subtotal = getQuoteSubtotal(products);

  const validate = () => {
    const newErrors = {};
    if (!form.customerName.trim()) newErrors.customerName = "Field cannot be empty";
    if (!products.some((p) => p.name.trim())) newErrors.products = "Add at least one product";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = {
      rfqNo: form.rfqNo,
      customerName: form.customerName,
      currency: form.currency,
      downPaymentPercent: form.downPaymentPercent,
      validUntil: form.validUntil,
      customer: {
        ...(isEditMode ? initialData.customer : {}),
        name: form.customerName,
        email: form.customerEmail,
        phone: form.customerPhone,
        address: form.customerAddress,
        tags: isEditMode ? initialData.customer?.tags || [] : [],
      },
      pics,
      products: products.filter((p) => p.name.trim()),
    };

    if (isEditMode) {
      const updated = updateQuote(initialData.quoteNo, payload);
      showSnackbar?.("Quote successfully updated", "success");
      onNavigate("detail", updated);
    } else {
      const created = createQuote({
        quoteNo: `QUO-DRAFT-${Date.now()}`,
        createdBy: "Patrick Star",
        createdAt: new Date().toISOString().slice(0, 10),
        status: "Draft",
        sBadge: "grey",
        customerApprovalStatus: "Pending",
        ...payload,
      });
      showSnackbar?.("Quote successfully created", "success");
      onNavigate("detail", created);
    }
  };

  const handleBack = () => {
    if (isEditMode) onNavigate("detail", initialData);
    else onNavigate("list");
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        background: "var(--neutral-background-primary)",
        height: "100%",
        overflowY: "auto",
        padding: "24px",
        paddingBottom: "96px",
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }} onClick={handleBack}>
          <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
            {isEditMode ? "Edit Quote" : "Add New Quote"}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
          <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
            Quotes
          </span>
          <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
            {isEditMode ? "Edit Quote" : "Add New Quote"}
          </span>
        </div>
      </div>

      <div style={pageSectionStyle}>
        {sectionHeader("Customer Information")}
        <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <InputField
                label="Customer Name"
                required
                value={form.customerName}
                onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                placeholder="Enter customer name"
                error={errors.customerName}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputField
                label="Customer Email"
                type="email"
                value={form.customerEmail}
                onChange={(e) => setForm({ ...form, customerEmail: e.target.value })}
                placeholder="customer@example.com"
              />
            </div>
            <div style={{ flex: 1 }}>
              <PhoneInputField
                label="Customer Phone"
                value={form.customerPhone}
                onChange={(val) => setForm({ ...form, customerPhone: val })}
              />
            </div>
          </div>
          <InputField
            label="Customer Address"
            multiline
            value={form.customerAddress}
            onChange={(e) => setForm({ ...form, customerAddress: e.target.value })}
            placeholder="Enter customer address"
          />
        </div>
      </div>

      <div style={pageSectionStyle}>
        {sectionHeader("Quote Information")}
        <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <InputField
                label="RFQ No"
                value={form.rfqNo}
                onChange={(e) => setForm({ ...form, rfqNo: e.target.value })}
                placeholder="Enter RFQ number"
              />
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Currency">
                <DropdownSelect
                  value={form.currency}
                  onChange={(val) => setForm({ ...form, currency: val })}
                  options={CURRENCY_OPTIONS}
                  clearable={false}
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <InputField
                label="Down Payment (%)"
                type="number"
                value={form.downPaymentPercent}
                onChange={(e) => setForm({ ...form, downPaymentPercent: Number(e.target.value) })}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputField
                label="Valid Until"
                type="date"
                value={form.validUntil}
                onChange={(e) => setForm({ ...form, validUntil: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div style={pageSectionStyle}>
        {sectionHeader("Person In Charge")}
        <div style={{ padding: "18px 20px 20px 20px" }}>
          <PersonInChargeTable pics={pics} onChange={setPics} />
        </div>
      </div>

      <div style={pageSectionStyle}>
        {sectionHeader("Products")}
        <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "16px" }}>
          {errors.products ? (
            <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{errors.products}</span>
          ) : null}
          {products.map((row) => (
            <div key={row.id} style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
              <div style={{ flex: 2 }}>
                <InputField
                  label="Product Name"
                  value={row.name}
                  onChange={(e) => updateProduct(row.id, { name: e.target.value })}
                  placeholder="Enter product name"
                />
              </div>
              <div style={{ flex: 1 }}>
                <InputField
                  label="Qty"
                  type="number"
                  value={row.qty}
                  onChange={(e) => updateProduct(row.id, { qty: Number(e.target.value) })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <InputField
                  label="Unit Price"
                  type="number"
                  value={row.unitPrice}
                  onChange={(e) => updateProduct(row.id, { unitPrice: Number(e.target.value) })}
                />
              </div>
              <div style={{ flex: 1 }}>
                <InputField
                  label="Discount (%)"
                  type="number"
                  value={row.discountPercent}
                  onChange={(e) => updateProduct(row.id, { discountPercent: Number(e.target.value) })}
                />
              </div>
              <div style={{ paddingBottom: "10px" }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => removeProduct(row.id)}
                  disabled={products.length === 1}
                  style={{ color: products.length === 1 ? undefined : "var(--status-red-primary)" }}
                >
                  <DeleteIcon size={16} />
                </Button>
              </div>
            </div>
          ))}
          <Button variant="outlined" size="small" leftIcon={AddIcon} onClick={addProduct} style={{ alignSelf: "flex-start" }}>
            Add Product
          </Button>
          <div style={{ display: "flex", justifyContent: "flex-end", fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
            Subtotal: {form.currency} {subtotal.toLocaleString("en-US")}
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: isSidebarCollapsed ? "82px" : "286px",
          right: 0,
          transition: "left 0.2s ease",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <Button size="large" variant="tertiary" onClick={handleBack} style={{ color: "var(--status-red-primary)" }}>
          Cancel
        </Button>
        <Button size="large" variant="filled" onClick={handleSave}>
          {isEditMode ? "Save Changes" : "Save"}
        </Button>
      </div>
    </div>
  );
};
