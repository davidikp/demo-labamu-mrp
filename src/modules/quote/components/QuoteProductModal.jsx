import React, { useState } from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormField, InputField, UploadDropzone } from "../../../components/index.js";
import { UploadDescriptionCard } from "../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";
import { SearchableSelectField } from "../../bill-of-materials/components/SearchableSelectField.jsx";
import { MOCK_PRODUCTS_DATA } from "../../product-catalog/mock/productsMocks.js";
import { getQuoteProductTotal } from "../mock/quoteMocks.js";

const PRODUCT_OPTIONS = MOCK_PRODUCTS_DATA.map((p) => ({ value: p.id, label: `${p.name} (${p.sku})` }));

const MAX_LINE_ATTACHMENTS = 3;
const MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024;

let lineAttachmentSeq = 0;
const nextLineAttachmentId = () => `quo-line-att-${Date.now()}-${++lineAttachmentSeq}`;

const readOnlyFieldStyle = {
  minHeight: "48px",
  display: "flex",
  alignItems: "center",
  padding: "0 14px",
  borderRadius: "10px",
  background: "var(--neutral-surface-secondary)",
  border: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-subtitle-1)",
  color: "var(--neutral-on-surface-tertiary)",
  boxSizing: "border-box",
};

/**
 * Add/Edit a single quote product line. Mirrors the Custom Product Request
 * material flow (BOM's MaterialLineModal): the parent owns the line array and
 * opens this modal with `initialLine` for an edit, `null` for a new line.
 */
export const QuoteProductModal = ({ isOpen, onClose, onSave, initialLine, currency = "IDR" }) => {
  const [productId, setProductId] = useState(initialLine?.productId || "");
  const [qty, setQty] = useState(initialLine?.qty ?? 1);
  const [unitPrice, setUnitPrice] = useState(initialLine?.unitPrice ?? 0);
  const [discountPercent, setDiscountPercent] = useState(initialLine?.discountPercent ?? 0);
  const [notes, setNotes] = useState(initialLine?.notes || "");
  const [attachments, setAttachments] = useState(() =>
    (initialLine?.attachments || []).map((a) =>
      typeof a === "string" ? { id: nextLineAttachmentId(), name: a } : { id: nextLineAttachmentId(), ...a }
    )
  );
  const [errors, setErrors] = useState({});

  const selectedProduct = MOCK_PRODUCTS_DATA.find((p) => p.id === productId);

  // Picking a catalogue product seeds the price from the catalogue; the author
  // can still type over it for a quote-specific price.
  const handleProductChange = (nextId) => {
    setProductId(nextId);
    const product = MOCK_PRODUCTS_DATA.find((p) => p.id === nextId);
    if (product) setUnitPrice(product.price ?? 0);
  };

  const addAttachments = (files) => {
    setAttachments((prev) => {
      const room = MAX_LINE_ATTACHMENTS - prev.length;
      if (room <= 0) return prev;
      const accepted = files
        .filter((file) => file.size <= MAX_ATTACHMENT_BYTES)
        .slice(0, room)
        .map((file) => ({ id: nextLineAttachmentId(), name: file.name, size: file.size }));
      return [...prev, ...accepted];
    });
  };

  const totalPrice = getQuoteProductTotal({
    qty: Number(qty) || 0,
    unitPrice: Number(unitPrice) || 0,
    discountPercent: Number(discountPercent) || 0,
  });

  const money = (value) => `${currency} ${Math.round(value).toLocaleString("en-US")}`;

  const handleSave = () => {
    const nextErrors = {};
    if (!(Number(qty) > 0)) nextErrors.qty = "Quantity must be above 0";
    if (!(Number(unitPrice) >= 0) || unitPrice === "") nextErrors.unitPrice = "Field cannot be empty";
    const discount = Number(discountPercent) || 0;
    if (discount < 0 || discount > 100) nextErrors.discountPercent = "Must be between 0 and 100";
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }
    onSave({
      productId,
      name: selectedProduct?.name || "",
      sku: selectedProduct?.sku || "",
      uom: selectedProduct?.unit || "pcs",
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      discountPercent: discount,
      notes,
      attachments: attachments.map(({ name, size }) => ({ name, size })),
    });
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title={initialLine ? "Edit Product in Quote" : "Add Product to Quote"}
      width="640px"
      footer={
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
          <Button variant="filled" size="large" onClick={handleSave} style={{ width: "100%" }}>
            {initialLine ? "Save Product" : "Add Product"}
          </Button>
          <Button variant="outlined" size="large" onClick={onClose} style={{ width: "100%" }}>
            Cancel
          </Button>
        </div>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <SearchableSelectField
            label="Product"
            value={productId}
            onChange={handleProductChange}
            options={PRODUCT_OPTIONS}
            placeholder="Search or select..."
          />
          <InputField
            label="Quantity"
            required
            type="number"
            value={qty}
            onChange={(e) => setQty(e.target.value)}
            placeholder="1"
            error={errors.qty}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <InputField
            label="Unit Price"
            required
            type="number"
            prefix={currency}
            value={unitPrice}
            onChange={(e) => setUnitPrice(e.target.value)}
            error={errors.unitPrice}
          />
          <InputField
            label="Discount Percentage"
            type="number"
            suffix="%"
            value={discountPercent}
            onChange={(e) => setDiscountPercent(e.target.value)}
            error={errors.discountPercent}
          />
        </div>

        <FormField label="Total Price">
          <div style={readOnlyFieldStyle}>{money(totalPrice)}</div>
        </FormField>

        <InputField
          label="Notes"
          multiline
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Enter notes (optional)"
          maxLength={500}
          showCounter
        />

        <FormField label="Attachments">
          <UploadDropzone
            multiple
            accept="*"
            maxFiles={MAX_LINE_ATTACHMENTS}
            maxText={`Max ${MAX_LINE_ATTACHMENTS} files, 30MB each`}
            allowedText="Accepts any file type"
            disabled={attachments.length >= MAX_LINE_ATTACHMENTS}
            onFilesSelected={addAttachments}
          />
        </FormField>

        {attachments.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {attachments.map((file) => (
              <UploadDescriptionCard
                key={file.id}
                file={file}
                hideDescriptionField
                onRemove={() => setAttachments((prev) => prev.filter((a) => a.id !== file.id))}
              />
            ))}
          </div>
        ) : null}
      </div>
    </GeneralModal>
  );
};
