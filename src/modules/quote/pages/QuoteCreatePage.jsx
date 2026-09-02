import React, { useState } from "react";
import { ChevronLeftIcon, AddIcon, CheckIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { Tooltip } from "../../../components/common/Tooltip.jsx";
import { FormField, InputField, PhoneInputField, UploadDropzone } from "../../../components/index.js";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { Dropdown as CeDropdown } from "../../../ce-ui";
import { COUNTRY_OPTIONS } from "../../../constants/appConstants.js";
import { UploadDescriptionCard } from "../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";
import { PersonInChargeTable, nextPicRowId } from "../../customer/components/PersonInChargeTable.jsx";
import { MOCK_CUSTOMER_TAGS } from "../../customer/mock/customerMocks.js";
import { QuoteProductModal } from "../components/QuoteProductModal.jsx";
import {
  createQuote,
  updateQuote,
  getQuoteProductTotal,
  getQuoteSubtotal,
  MOCK_BANK_ACCOUNTS,
  getBankAccountById,
  PAYMENT_TERMS_OPTIONS,
  INCOTERMS_OPTIONS,
  SHIPPING_METHOD_OPTIONS,
  DISPUTE_RESOLUTION_OPTIONS,
} from "../mock/quoteMocks.js";

const pageSectionStyle = {
  background: "var(--neutral-surface-primary)",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  overflow: "hidden",
};

const sectionBodyStyle = {
  padding: "18px 20px 20px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "20px",
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

// --- Products table (same shape as the CPR materials table) ---------------
const PRODUCTS_TABLE_COLUMNS = "minmax(180px, 1.8fr) 140px 90px minmax(120px, 1fr) 100px minmax(120px, 1fr) 130px";

const tableHeaderRowStyle = {
  display: "grid",
  gridTemplateColumns: PRODUCTS_TABLE_COLUMNS,
  gap: "8px",
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
};

const tableRowStyle = (isLast) => ({
  display: "grid",
  gridTemplateColumns: PRODUCTS_TABLE_COLUMNS,
  gap: "8px",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
});

const rowActionButtonStyle = (color) => ({ color, padding: "0 4px" });

const emptyStateBoxStyle = {
  padding: "40px 24px",
  textAlign: "center",
  color: "var(--neutral-on-surface-tertiary)",
  fontSize: "var(--text-title-3)",
  background: "var(--neutral-surface-primary)",
  border: "1.5px dashed var(--neutral-line-separator-1)",
  borderRadius: "16px",
};

// --- Summary (mirrors the Purchase Order create form's Summary card) ------
const summaryMetricLabelStyle = {
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-secondary)",
};

const summaryMetricValueStyle = {
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-secondary)",
};

const summaryTotalLabelStyle = {
  fontSize: "var(--text-title-1)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
};

const summaryTotalValueStyle = {
  fontSize: "var(--text-title-1)",
  fontWeight: "var(--font-weight-black)",
  color: "var(--neutral-on-surface-primary)",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "20px",
};

const fieldErrorText = (message) =>
  message ? (
    <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{message}</span>
  ) : null;

// The icons module has no info glyph; this inline circle-i matches the ⓘ
// affordance beside each Terms and Conditions label in the design.
const InfoHint = ({ content }) => (
  <Tooltip content={content}>
    <span style={{ display: "inline-flex", cursor: "help", verticalAlign: "middle" }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="var(--neutral-on-surface-tertiary)" strokeWidth="1.2" />
        <path d="M8 7v4" stroke="var(--neutral-on-surface-tertiary)" strokeWidth="1.2" strokeLinecap="round" />
        <circle cx="8" cy="5" r="0.75" fill="var(--neutral-on-surface-tertiary)" />
      </svg>
    </span>
  </Tooltip>
);

// FormField renders `label` as plain text, so a label that needs a trailing
// tooltip is passed through as a node instead.
const labelWithHint = (text, hint) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
    {text}
    <InfoHint content={hint} />
  </span>
);

const TERMS_TOOLTIPS = {
  paymentTerms:
    "Specify the payment schedule and conditions agreed between buyer and seller (e.g., Net 30, Net 60, Net 90, COD, etc).",
  incoterms:
    "Choose the international trade term that defines delivery point, risk transfer, and cost responsibility (e.g., FOB, CIF, EXW).",
  riskLevel:
    "Indicates the level of risk for the buyer or seller based on the selected Incoterms (risk transfers according to delivery terms).",
  shippingMethod:
    "Select the mode of transportation for goods delivery (e.g., Air Freight, Sea Freight, Land Courier).",
  estimatedDelivery: "Enter the estimated time frame for delivery or completion after order confirmation.",
  disputeResolutionMethod:
    "Define the agreed process to resolve disputes, such as arbitration, mediation, or court settlement.",
  governingLaw: "Indicate the legal jurisdiction or country law that governs the agreement.",
  forceMajeure:
    "Include a clause to protect both parties if contract obligations cannot be met due to events beyond control (e.g., natural disasters, war).",
  latePaymentPenalties: "Apply financial penalties or interest charges when payment is delayed beyond the agreed term.",
  performanceGuarantees: "Require the supplier to provide assurance of product quality or project completion as agreed.",
};

// Each clause checkbox reveals its own text area, so the quote records the
// actual wording rather than just "included".
const CLAUSE_FIELDS = [
  {
    key: "forceMajeure",
    label: "Include Force Majeure Clause",
    placeholder: "Enter force majeure clause",
  },
  {
    key: "latePaymentPenalties",
    label: "Include Late Payment Penalties",
    placeholder: "Enter late payment penalties",
  },
  {
    key: "performanceGuarantees",
    label: "Include Performance Guarantees",
    placeholder: "Enter performance guarantees",
  },
];

const CURRENCY_OPTIONS = [
  { value: "IDR", label: "IDR - Indonesia Rupiah" },
  { value: "USD", label: "USD - US Dollar" },
];

const toOptions = (values) => values.map((v) => ({ value: v, label: v }));

const STEPS = [
  { key: "details", label: "Quote & Customer" },
  { key: "products", label: "Products" },
  { key: "attachments", label: "Attachments & Bank" },
  { key: "terms", label: "Terms & Conditions" },
];

// Free-jump stepper: clicking any circle navigates there directly; Next/Submit
// are the only actions gated by per-step required-field validation.
const Stepper = ({ currentStep, onStepClick, isStepValid }) => (
  <div style={{ display: "flex", alignItems: "flex-start" }}>
    {STEPS.map((step, idx) => {
      const isActive = idx === currentStep;
      const isComplete = !isActive && isStepValid(idx);
      const circleColor = isActive || isComplete ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)";
      return (
        <React.Fragment key={step.key}>
          <div
            onClick={() => onStepClick(idx)}
            style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", cursor: "pointer", flexShrink: 0 }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: isActive
                  ? "var(--feature-brand-primary)"
                  : isComplete
                  ? "var(--feature-brand-container-lighter)"
                  : "var(--neutral-surface-primary)",
                border: `1.5px solid ${circleColor}`,
                color: isActive ? "#fff" : isComplete ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--text-title-3)",
                boxSizing: "border-box",
              }}
            >
              {isComplete ? <CheckIcon size={16} color="var(--feature-brand-primary)" /> : idx + 1}
            </div>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-medium)",
                color: isActive ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-secondary)",
                whiteSpace: "nowrap",
              }}
            >
              {step.label}
            </span>
          </div>
          {idx < STEPS.length - 1 ? (
            <div
              style={{
                flex: 1,
                height: "1.5px",
                marginTop: "15px",
                marginLeft: "8px",
                marginRight: "8px",
                background: isComplete ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)",
              }}
            />
          ) : null}
        </React.Fragment>
      );
    })}
  </div>
);

const EMPTY_TERMS = {
  paymentTerms: "",
  incoterms: "",
  shippingMethod: "",
  estimatedDelivery: "",
  riskLevel: "",
  disputeResolutionMethod: "",
  governingLaw: "",
  forceMajeure: "",
  latePaymentPenalties: "",
  performanceGuarantees: "",
  additional: "",
};

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  customerPhone: "+62",
  customerCountry: "",
  customerAddress: "",
  customerTags: [],
  currency: "IDR",
  downPaymentPercent: 10,
  validUntil: "",
  taxRatePercent: 11,
  shippingFee: 0,
  otherFee: 0,
  bankAccountId: "",
};

let productRowSeq = 0;
const nextProductRowId = () => `quo-prod-${Date.now()}-${++productRowSeq}`;

let attachmentSeq = 0;
const nextAttachmentId = () => `quo-att-${Date.now()}-${++attachmentSeq}`;

const MAX_ATTACHMENTS = 10;
const MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024;

export const QuoteCreatePage = ({ onNavigate, showSnackbar, isSidebarCollapsed, initialData }) => {
  // App.jsx's route resolver falls back to a placeholder `{ id: "create", ... }`
  // object as `location.state` whenever the URL has no real state (e.g. a
  // fresh "New Quote" navigation) — checking `.quoteNo` (always present on a
  // real quote record) avoids misreading that placeholder as edit mode.
  const isEditMode = !!initialData?.quoteNo;

  const [currentStep, setCurrentStep] = useState(0);
  const [stepErrors, setStepErrors] = useState({});
  const [productModal, setProductModal] = useState(null);

  const [form, setForm] = useState(() =>
    isEditMode
      ? {
          customerName: initialData.customer?.name || initialData.customerName || "",
          customerEmail: initialData.customer?.email || "",
          customerPhone: initialData.customer?.phone || "+62",
          customerCountry: initialData.customer?.country || "",
          customerAddress: initialData.customer?.address || "",
          customerTags: initialData.customer?.tags || [],
          currency: initialData.currency || "IDR",
          downPaymentPercent: initialData.downPaymentPercent ?? 10,
          validUntil: initialData.validUntil || "",
          taxRatePercent: initialData.taxRatePercent ?? 11,
          shippingFee: initialData.shippingFee ?? 0,
          otherFee: initialData.otherFee ?? 0,
          // Existing quotes embed the bank account rather than referencing one;
          // match it back to the catalogue by account number.
          bankAccountId:
            MOCK_BANK_ACCOUNTS.find((b) => b.accountNumber === initialData.bankAccount?.accountNumber)?.id || "",
        }
      : EMPTY_FORM
  );
  const [terms, setTerms] = useState(() => (isEditMode ? { ...EMPTY_TERMS, ...initialData.terms } : EMPTY_TERMS));
  // Clause text lives in `terms`; the checkbox only controls whether the field
  // is shown, so an existing quote with clause text starts ticked.
  const [clauseEnabled, setClauseEnabled] = useState(() =>
    CLAUSE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: !!(isEditMode && initialData.terms?.[key]) }), {})
  );
  const [pics, setPics] = useState(() =>
    isEditMode && initialData.pics?.length
      ? initialData.pics
      : [{ id: nextPicRowId(), primary: true, name: "", email: "", role: "Approver", phone: "+62" }]
  );
  const [products, setProducts] = useState(() =>
    isEditMode && initialData.products?.length
      ? initialData.products.map((p) => ({ id: p.id || nextProductRowId(), ...p }))
      : []
  );
  const [attachments, setAttachments] = useState(() =>
    isEditMode && initialData.attachments?.length
      ? initialData.attachments.map((a) =>
          typeof a === "string" ? { id: nextAttachmentId(), name: a } : { id: nextAttachmentId(), ...a }
        )
      : []
  );

  const setField = (patch) => setForm((prev) => ({ ...prev, ...patch }));
  const setTerm = (patch) => setTerms((prev) => ({ ...prev, ...patch }));

  const tagOptions = MOCK_CUSTOMER_TAGS.filter((tag) => tag.status === "Active").map((tag) => ({
    value: tag.id,
    label: tag.name,
  }));

  const saveProductLine = (line) => {
    setProducts((prev) =>
      productModal?.index != null
        ? prev.map((row, idx) => (idx === productModal.index ? { ...row, ...line } : row))
        : [...prev, { id: nextProductRowId(), ...line }]
    );
    setProductModal(null);
  };

  const removeProduct = (index) => setProducts((prev) => prev.filter((_, idx) => idx !== index));

  const addAttachments = (files) => {
    setAttachments((prev) => {
      const room = MAX_ATTACHMENTS - prev.length;
      if (room <= 0) {
        showSnackbar?.(`Maximum ${MAX_ATTACHMENTS} files`, "error");
        return prev;
      }
      const accepted = [];
      let rejected = 0;
      files.forEach((file) => {
        if (file.size > MAX_ATTACHMENT_BYTES) rejected += 1;
        else if (accepted.length < room) accepted.push({ id: nextAttachmentId(), name: file.name, size: file.size });
      });
      if (rejected > 0) showSnackbar?.(`${rejected} file(s) exceed the 30MB limit`, "error");
      return [...prev, ...accepted];
    });
  };

  const removeAttachment = (id) => setAttachments((prev) => prev.filter((a) => a.id !== id));

  const selectedBank = getBankAccountById(form.bankAccountId);
  // Non-blocking: the quote can still be submitted, the note just flags that the
  // chosen account does not list the quote's currency.
  const bankCurrencyMismatch =
    selectedBank &&
    !selectedBank.currencies
      .split(",")
      .map((c) => c.trim().toUpperCase())
      .includes(form.currency.toUpperCase());

  const subtotal = getQuoteSubtotal(products);
  const taxTotal = subtotal * ((parseFloat(form.taxRatePercent) || 0) / 100);
  const total = subtotal + taxTotal + (parseFloat(form.shippingFee) || 0) + (parseFloat(form.otherFee) || 0);

  const money = (value) => `${form.currency} ${Math.round(value).toLocaleString("en-US")}`;

  // Required-field checks per step, keyed by field name for inline error text.
  const validateDetailsStep = () => {
    const errors = {};
    if (!form.currency) errors.currency = "Field cannot be empty";
    if (!form.validUntil) errors.validUntil = "Field cannot be empty";
    if (!form.customerName.trim()) errors.customerName = "Field cannot be empty";
    if (!form.customerCountry) errors.customerCountry = "Field cannot be empty";
    if (!form.customerAddress.trim()) errors.customerAddress = "Field cannot be empty";
    return errors;
  };

  const validateProductsStep = () => {
    const errors = {};
    if (products.length === 0) errors.products = "Add at least one product";
    return errors;
  };

  const validateBankStep = () => {
    const errors = {};
    if (!form.bankAccountId) errors.bankAccountId = "Field cannot be empty";
    return errors;
  };

  const validateTermsStep = () => {
    const errors = {};
    if (!terms.paymentTerms) errors.paymentTerms = "Field cannot be empty";
    CLAUSE_FIELDS.forEach(({ key }) => {
      if (clauseEnabled[key] && !String(terms[key] || "").trim()) errors[key] = "Field cannot be empty";
    });
    return errors;
  };

  const stepValidators = [validateDetailsStep, validateProductsStep, validateBankStep, validateTermsStep];
  const isStepValid = (idx) => Object.keys(stepValidators[idx]()).length === 0;

  const goToStep = (idx) => {
    setStepErrors({});
    setCurrentStep(idx);
  };

  const handleNext = () => {
    const errors = stepValidators[currentStep]();
    if (Object.keys(errors).length > 0) {
      setStepErrors(errors);
      return;
    }
    setStepErrors({});
    setCurrentStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const handlePrevious = () => {
    setStepErrors({});
    setCurrentStep((s) => Math.max(s - 1, 0));
  };

  const buildPayload = () => ({
    customerName: form.customerName,
    currency: form.currency,
    downPaymentPercent: parseFloat(form.downPaymentPercent) || 0,
    validUntil: form.validUntil,
    customer: {
      ...(isEditMode ? initialData.customer : {}),
      name: form.customerName,
      email: form.customerEmail,
      phone: form.customerPhone,
      country: form.customerCountry,
      address: form.customerAddress,
      tags: form.customerTags,
    },
    pics,
    products,
    taxRatePercent: parseFloat(form.taxRatePercent) || 0,
    shippingFee: parseFloat(form.shippingFee) || 0,
    otherFee: parseFloat(form.otherFee) || 0,
    attachments: attachments.map(({ name, size }) => ({ name, size })),
    bankAccount: selectedBank ? { ...selectedBank } : {},
    terms: {
      ...terms,
      // An unticked clause is stored empty regardless of any text left behind.
      ...CLAUSE_FIELDS.reduce((acc, { key }) => ({ ...acc, [key]: clauseEnabled[key] ? terms[key] : "" }), {}),
    },
  });

  const persist = (status, successMessage) => {
    const payload = buildPayload();
    if (isEditMode) {
      const updated = updateQuote(initialData.quoteNo, payload);
      showSnackbar?.(successMessage, "success");
      onNavigate("detail", updated);
    } else {
      const created = createQuote({
        quoteNo: `QUO-DRAFT-${Date.now()}`,
        createdBy: "Patrick Star",
        createdAt: new Date().toISOString().slice(0, 10),
        status,
        sBadge: "grey",
        customerApprovalStatus: "Pending",
        ...payload,
      });
      showSnackbar?.(successMessage, "success");
      onNavigate("detail", created);
    }
  };

  // Drafts skip validation entirely — a half-filled quote is a valid draft.
  const handleSaveDraft = () =>
    persist("Draft", isEditMode ? "Quote draft successfully updated" : "Quote draft successfully saved");

  const handleSubmit = () => {
    for (let i = 0; i < STEPS.length; i += 1) {
      const errors = stepValidators[i]();
      if (Object.keys(errors).length > 0) {
        setCurrentStep(i);
        setStepErrors(errors);
        return;
      }
    }
    setStepErrors({});
    persist("Draft", isEditMode ? "Quote successfully updated" : "Quote successfully created");
  };

  const handleCancel = () => {
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
      {/* Scoped to the trigger box only (2 levels via direct-child
          combinators) — a plain descendant selector would also match each
          selected tag's own "Remove" button, blowing it up to 48px. Copied
          from CustomerCreatePage, where the same Customer Tag field lives. */}
      <style>{`
        .customer-tag-dropdown > div > div[role="button"] { min-height: 48px; }
        .customer-tag-dropdown > div > div[role="button"] > span.text-lb-on-surface-3 { font-size: 16px; line-height: 22px; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }} onClick={handleCancel}>
          <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
            {isEditMode ? "Edit Quote" : "Create Quote"}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
          <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
            Quotes
          </span>
          <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>{isEditMode ? "Edit Quote" : "Create Quote"}</span>
        </div>
      </div>

      <div style={{ ...pageSectionStyle, padding: "20px 24px" }}>
        <Stepper currentStep={currentStep} onStepClick={goToStep} isStepValid={isStepValid} />
      </div>

      {currentStep === 0 ? (
        <>
          <div style={pageSectionStyle}>
            {sectionHeader("Quote Details")}
            <div style={sectionBodyStyle}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <FormField label="Currency" required error={stepErrors.currency}>
                    <DropdownSelect
                      value={form.currency}
                      onChange={(val) => setField({ currency: val })}
                      options={CURRENCY_OPTIONS}
                      hasError={!!stepErrors.currency}
                      clearable={false}
                    />
                  </FormField>
                </div>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Down Payment Percentage"
                    type="number"
                    suffix="%"
                    value={form.downPaymentPercent}
                    onChange={(e) => setField({ downPaymentPercent: e.target.value })}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Valid Until"
                    type="date"
                    required
                    placeholder="Enter date"
                    value={form.validUntil}
                    onChange={(val) => setField({ validUntil: typeof val === "string" ? val : val?.target?.value || "" })}
                    error={stepErrors.validUntil}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information — same field set and layout as the Customer
              creation form (modules/customer/pages/CustomerCreatePage.jsx). */}
          <div style={pageSectionStyle}>
            {sectionHeader("Customer Information")}
            <div style={sectionBodyStyle}>
              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Customer Name"
                    required
                    value={form.customerName}
                    onChange={(e) => setField({ customerName: e.target.value })}
                    placeholder="e.g. PT ABC Manufacturing"
                    error={stepErrors.customerName}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Customer Email"
                    type="email"
                    value={form.customerEmail}
                    onChange={(e) => setField({ customerEmail: e.target.value })}
                    placeholder="customer@example.com"
                    helperText="Use official company email address"
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <PhoneInputField
                    label="Customer Phone"
                    value={form.customerPhone}
                    onChange={(val) => setField({ customerPhone: val })}
                    helperText="Use main office/HQ phone number"
                    shellStyle={{ minHeight: "48px" }}
                  />
                </div>
              </div>

              <div style={{ display: "flex", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <FormField label="Customer Tag" helperText="Max 5 tags">
                    <CeDropdown
                      multi
                      searchable
                      size="lg"
                      className="customer-tag-dropdown"
                      placeholder="Select customer tags"
                      options={tagOptions}
                      value={form.customerTags}
                      onChange={(vals) => setField({ customerTags: vals.slice(0, 5) })}
                    />
                  </FormField>
                </div>
                <div style={{ flex: 1 }}>
                  <FormField label="Customer Country" required error={stepErrors.customerCountry}>
                    <DropdownSelect
                      value={form.customerCountry}
                      onChange={(val) => setField({ customerCountry: val })}
                      options={COUNTRY_OPTIONS.map((c) => ({ value: c.value, label: `${c.flag} ${c.label}` }))}
                      placeholder="Select customer country"
                      hasError={!!stepErrors.customerCountry}
                      searchable
                    />
                  </FormField>
                </div>
                <div style={{ flex: 1 }}>
                  <InputField
                    label="Customer Address"
                    required
                    multiline
                    showCounter
                    maxLength={400}
                    value={form.customerAddress}
                    onChange={(e) => setField({ customerAddress: e.target.value })}
                    placeholder="Enter registered company address"
                    error={stepErrors.customerAddress}
                  />
                  {/* Rendered manually rather than via `helperText` — ce-ui gives a
                      multiline field the same 4px gap as a single-line one, which
                      reads as a much bigger gap under a textarea. */}
                  {!stepErrors.customerAddress ? (
                    <span style={{ display: "block", marginTop: "4px", fontSize: "var(--text-body)", color: "#9CA3AF" }}>
                      Will be used for document purposes
                    </span>
                  ) : null}
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
        </>
      ) : null}

      {currentStep === 1 ? (
        <>
          <div style={pageSectionStyle}>
            {sectionHeader(
              "Products",
              <Button variant="tertiary" size="small" leftIcon={AddIcon} onClick={() => setProductModal({ index: null })}>
                Add Product
              </Button>
            )}
            <div style={{ padding: "18px 20px 20px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
              {fieldErrorText(stepErrors.products)}
              {products.length ? (
                <div style={{ overflowX: "auto", width: "100%" }}>
                  <div style={{ minWidth: "900px" }}>
                    <div style={tableHeaderRowStyle}>
                      <span>Product Name</span>
                      <span>SKU</span>
                      <span>Qty</span>
                      <span>Unit Price</span>
                      <span>Discount</span>
                      <span>Total Price</span>
                      <span style={{ textAlign: "right" }}>Actions</span>
                    </div>
                    {products.map((row, idx) => (
                      <div key={row.id} style={tableRowStyle(idx === products.length - 1)}>
                        <span>{row.name || "-"}</span>
                        <span>{row.sku || "-"}</span>
                        <span>{`${row.qty} ${row.uom || ""}`.trim()}</span>
                        <span>{money(row.unitPrice)}</span>
                        <span>{`${row.discountPercent || 0}%`}</span>
                        <span>{money(getQuoteProductTotal(row))}</span>
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <Button
                            variant="tertiary"
                            size="small"
                            style={rowActionButtonStyle("var(--feature-brand-primary)")}
                            onClick={() => setProductModal({ index: idx })}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="tertiary"
                            size="small"
                            style={rowActionButtonStyle("var(--status-red-primary)")}
                            onClick={() => removeProduct(idx)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div style={emptyStateBoxStyle}>No products added yet. Click "Add Product" to get started.</div>
              )}
            </div>
          </div>

          {/* Total Amount — same card as the Purchase Order create form's Summary. */}
          <div style={pageSectionStyle}>
            {sectionHeader("Total Amount")}
            <div style={{ padding: "20px 20px 24px 20px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={summaryRowStyle}>
                <span style={summaryMetricLabelStyle}>Subtotal</span>
                <span style={summaryMetricValueStyle}>{money(subtotal)}</span>
              </div>

              <div style={summaryRowStyle}>
                <div style={{ display: "flex", alignItems: "center", gap: "16px", flex: 1, minWidth: 0 }}>
                  <span style={summaryMetricLabelStyle}>Tax</span>
                  <div style={{ width: "170px", flexShrink: 0 }}>
                    <InputField
                      type="number"
                      suffix="%"
                      placeholder="11"
                      value={form.taxRatePercent}
                      onChange={(e) => setField({ taxRatePercent: e.target.value })}
                    />
                  </div>
                </div>
                <span style={summaryMetricValueStyle}>{money(taxTotal)}</span>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryMetricLabelStyle}>Shipping Fee</span>
                <div style={{ width: "320px", flexShrink: 0 }}>
                  <InputField
                    type="number"
                    prefix={form.currency}
                    placeholder="Enter amount"
                    value={form.shippingFee}
                    onChange={(e) => setField({ shippingFee: e.target.value })}
                  />
                </div>
              </div>

              <div style={summaryRowStyle}>
                <span style={summaryMetricLabelStyle}>Other Fee</span>
                <div style={{ width: "320px", flexShrink: 0 }}>
                  <InputField
                    type="number"
                    prefix={form.currency}
                    placeholder="Enter amount"
                    value={form.otherFee}
                    onChange={(e) => setField({ otherFee: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }} />

              <div style={summaryRowStyle}>
                <span style={summaryTotalLabelStyle}>Total</span>
                <span style={summaryTotalValueStyle}>{money(total)}</span>
              </div>
            </div>
          </div>
        </>
      ) : null}

      {currentStep === 2 ? (
        <>
          {/* Attachments — same dropzone + file card as the Purchase Order
              document upload (PoDocumentModals / UploadDescriptionCard). */}
          <div style={pageSectionStyle}>
            {sectionHeader("Attachments")}
            <div style={sectionBodyStyle}>
              <FormField label="Upload Documents" helperText={`Max ${MAX_ATTACHMENTS} files, 30MB each`}>
                <UploadDropzone
                  multiple
                  accept="*"
                  maxFiles={MAX_ATTACHMENTS}
                  maxText={`Max ${MAX_ATTACHMENTS} files, 30MB each`}
                  allowedText="Accepts any file type"
                  disabled={attachments.length >= MAX_ATTACHMENTS}
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
                      onRemove={() => removeAttachment(file.id)}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader("Bank Account")}
            <div style={sectionBodyStyle}>
              <FormField
                label="Bank Account"
                required
                error={stepErrors.bankAccountId}
                helperText={
                  bankCurrencyMismatch ? `Selected bank account is not supported for ${form.currency} currency` : undefined
                }
              >
                <DropdownSelect
                  value={form.bankAccountId}
                  onChange={(val) => setField({ bankAccountId: val })}
                  options={MOCK_BANK_ACCOUNTS.map((b) => ({ value: b.id, label: `${b.bankName} - ${b.accountName}` }))}
                  placeholder="Select bank account"
                  hasError={!!stepErrors.bankAccountId}
                />
              </FormField>

              {selectedBank ? (
                <div
                  style={{
                    background: "var(--neutral-surface-secondary)",
                    borderRadius: "12px",
                    padding: "20px 24px",
                    display: "grid",
                    gridTemplateColumns: "200px 1fr",
                    rowGap: "14px",
                    columnGap: "16px",
                    fontSize: "var(--text-body)",
                  }}
                >
                  {[
                    ["Account Name", selectedBank.accountName],
                    ["Account Number", selectedBank.accountNumber],
                    ["Bank Name", selectedBank.bankName],
                    ["Supported Currencies", selectedBank.currencies],
                    ["SWIFT Code", selectedBank.swiftCode],
                    ["Branch", selectedBank.branch],
                    ["Branch Address", selectedBank.branchAddress],
                  ].map(([label, value]) => (
                    <React.Fragment key={label}>
                      <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>{label}:</span>
                      <span style={{ color: "var(--neutral-on-surface-primary)" }}>{value || "-"}</span>
                    </React.Fragment>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </>
      ) : null}

      {currentStep === 3 ? (
        <div style={pageSectionStyle}>
          {sectionHeader("Terms and Conditions")}
          <div style={sectionBodyStyle}>
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <FormField
                  label={labelWithHint("Payment Terms", TERMS_TOOLTIPS.paymentTerms)}
                  required
                  error={stepErrors.paymentTerms}
                >
                  <DropdownSelect
                    value={terms.paymentTerms}
                    onChange={(val) => setTerm({ paymentTerms: val })}
                    options={toOptions(PAYMENT_TERMS_OPTIONS)}
                    placeholder="Select payment terms"
                    hasError={!!stepErrors.paymentTerms}
                  />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <FormField label={labelWithHint("Incoterms", TERMS_TOOLTIPS.incoterms)}>
                  <DropdownSelect
                    value={terms.incoterms}
                    onChange={(val) => setTerm({ incoterms: val })}
                    options={toOptions(INCOTERMS_OPTIONS)}
                    placeholder="Select incoterms"
                  />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                {/* Risk Level is derived from the selected Incoterms / screening
                    result rather than entered here, so it stays read-only. */}
                <FormField label={labelWithHint("Risk Level", TERMS_TOOLTIPS.riskLevel)}>
                  <DropdownSelect value={terms.riskLevel} onChange={() => {}} options={[]} placeholder="-" disabled />
                </FormField>
              </div>
            </div>

            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <FormField label={labelWithHint("Shipping Method", TERMS_TOOLTIPS.shippingMethod)}>
                  <DropdownSelect
                    value={terms.shippingMethod}
                    onChange={(val) => setTerm({ shippingMethod: val })}
                    options={toOptions(SHIPPING_METHOD_OPTIONS)}
                    placeholder="Select shipping method"
                  />
                </FormField>
              </div>
              <div style={{ flex: 1 }}>
                <InputField
                  label={labelWithHint("Estimated Delivery", TERMS_TOOLTIPS.estimatedDelivery)}
                  value={terms.estimatedDelivery}
                  onChange={(e) => setTerm({ estimatedDelivery: e.target.value })}
                  placeholder="e.g., 2-3 weeks"
                />
              </div>
              <div style={{ flex: 1 }}>
                <FormField label={labelWithHint("Dispute Resolution Method", TERMS_TOOLTIPS.disputeResolutionMethod)}>
                  <DropdownSelect
                    value={terms.disputeResolutionMethod}
                    onChange={(val) => setTerm({ disputeResolutionMethod: val })}
                    options={toOptions(DISPUTE_RESOLUTION_OPTIONS)}
                    placeholder="Select dispute resolution method"
                  />
                </FormField>
              </div>
            </div>

            <InputField
              label={labelWithHint("Governing Law", TERMS_TOOLTIPS.governingLaw)}
              multiline
              showCounter
              maxLength={5000}
              value={terms.governingLaw}
              onChange={(e) => setTerm({ governingLaw: e.target.value })}
              placeholder="Enter governing law"
            />

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {CLAUSE_FIELDS.map(({ key, label, placeholder }) => (
                <div key={key} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Checkbox
                      checked={!!clauseEnabled[key]}
                      onChange={(checked) => setClauseEnabled((prev) => ({ ...prev, [key]: checked }))}
                    />
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{label}</span>
                    <InfoHint content={TERMS_TOOLTIPS[key]} />
                  </div>
                  {clauseEnabled[key] ? (
                    <InputField
                      multiline
                      showCounter
                      maxLength={2000}
                      value={terms[key] || ""}
                      onChange={(e) => setTerm({ [key]: e.target.value })}
                      placeholder={placeholder}
                      error={stepErrors[key]}
                    />
                  ) : null}
                </div>
              ))}
            </div>

            <InputField
              label="Additional"
              multiline
              showCounter
              maxLength={5000}
              value={terms.additional}
              onChange={(e) => setTerm({ additional: e.target.value })}
              placeholder="Enter additional"
            />
          </div>
        </div>
      ) : null}

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
        <Button size="large" variant="tertiary" onClick={handleCancel} style={{ color: "var(--status-red-primary)" }}>
          Cancel
        </Button>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button size="large" variant="outlined" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          {currentStep > 0 ? (
            <Button size="large" variant="outlined" onClick={handlePrevious}>
              Previous Step
            </Button>
          ) : null}
          {currentStep < STEPS.length - 1 ? (
            <Button size="large" variant="filled" onClick={handleNext}>
              Next Step
            </Button>
          ) : (
            <Button size="large" variant="filled" onClick={handleSubmit}>
              Submit
            </Button>
          )}
        </div>
      </div>

      {productModal ? (
        <QuoteProductModal
          isOpen
          onClose={() => setProductModal(null)}
          onSave={saveProductLine}
          initialLine={productModal.index != null ? products[productModal.index] : null}
          currency={form.currency}
        />
      ) : null}
    </div>
  );
};
