import React, { useState } from "react";
import { ChevronLeftIcon, AddIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FormField, InputField, PhoneInputField } from "../../../components/index.js";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { Dropdown as CeDropdown } from "../../../ce-ui";
import { PersonInChargeTable, nextPicRowId } from "../components/PersonInChargeTable.jsx";
import { CustomerTagModal } from "../components/CustomerTagModal.jsx";
import { COUNTRY_OPTIONS } from "../../../constants/appConstants.js";
import { MOCK_CUSTOMER_TAGS, nextCustomerTagId, createCustomer, updateCustomer } from "../mock/customerMocks.js";

// Same "blue accent bar + title" section header used by PurchaseOrderCreatePage
// (the `sectionHeader`/`pageSectionStyle` local helpers there) — the accent
// bar sits flush left with no padding, absolutely positioned against the
// section's own left edge rather than inline with the padded content.
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
      <span
        style={{
          fontSize: "var(--text-title-1)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--neutral-on-surface-primary)",
        }}
      >
        {title}
      </span>
    </div>
    {right || null}
  </div>
);

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "+62",
  tags: [],
  country: "",
  address: "",
};

// Used for both "New Customer" (no initialData) and "Edit Customer"
// (initialData = the customer record being edited) — same component per the
// user's requirement that Edit reuses this page pre-filled.
export const CustomerCreatePage = ({ onNavigate, showSnackbar, t, initialData, isSidebarCollapsed }) => {
  // App.jsx's route resolver falls back to a placeholder `{ id: "create", ... }`
  // object as `location.state` whenever the URL has no real state (e.g. a
  // fresh "New Customer" navigation) — checking `.name` (always present on a
  // real customer record) avoids misreading that placeholder as edit mode.
  const isEditMode = !!initialData?.name;

  const [form, setForm] = useState(() =>
    isEditMode
      ? {
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "+62",
          tags: initialData.tags || [],
          country: initialData.country || "",
          address: initialData.address || "",
        }
      : EMPTY_FORM
  );
  const [pics, setPics] = useState(() =>
    isEditMode && initialData.pics?.length
      ? initialData.pics
      : [{ id: nextPicRowId(), primary: true, name: "", email: "", role: "Approver", phone: "+62" }]
  );
  const [errors, setErrors] = useState({});

  const [tags, setTags] = useState(MOCK_CUSTOMER_TAGS);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);

  const activeTagOptions = tags
    .filter((tag) => tag.status === "Active")
    .map((tag) => ({ value: tag.id, label: tag.name }));

  const handleAddTag = ({ name, status }) => {
    const newTag = { id: nextCustomerTagId(), name, status };
    setTags((prev) => [...prev, newTag]);
    // Only auto-select it as one of this customer's tags when it's usable —
    // the picker's own option list already excludes Inactive tags, so an
    // Inactive one shouldn't land in the selection either.
    if (status === "Active") {
      setForm((prev) => ({ ...prev, tags: [...prev.tags, newTag.id] }));
    }
    setIsTagModalOpen(false);
    showSnackbar?.("Customer tag successfully added", "success");
  };

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Field cannot be empty";
    if (!form.country) newErrors.country = "Field cannot be empty";
    if (!form.address.trim()) newErrors.address = "Field cannot be empty";

    // Every PIC row's Name/Email/Phone are mandatory, not just the Primary
    // row's — adding a row is itself a commitment to fill it in.
    if (!pics.some((row) => row.primary)) {
      newErrors.picPrimary = "Field cannot be empty";
    }
    const picErrors = {};
    pics.forEach((row) => {
      if (!row.name?.trim()) picErrors[`${row.id}_name`] = "Field cannot be empty";
      if (!row.email?.trim()) picErrors[`${row.id}_email`] = "Field cannot be empty";
      if (!row.phone?.replace(/^\+\d+\s*/, "").trim()) picErrors[`${row.id}_phone`] = "Field cannot be empty";
    });
    if (Object.keys(picErrors).length > 0) newErrors.pic = picErrors;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;

    const payload = { ...form, pics };

    if (isEditMode) {
      const updated = updateCustomer(initialData.id, payload);
      showSnackbar?.("Customer successfully updated", "success");
      onNavigate("detail", updated);
    } else {
      const created = createCustomer(payload);
      showSnackbar?.("Customer successfully created", "success");
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
        // Leaves room for the fixed footer so it never overlaps the last section.
        paddingBottom: "96px",
        boxSizing: "border-box",
      }}
    >
      {/* Scoped to the trigger box only (2 levels via direct-child
          combinators) — a plain descendant selector would also match each
          selected tag's own "Remove" button, which carries the same
          role="button" attribute a few levels deeper, blowing it up to 48px
          and causing the overlapping/oversized hover state on the chip's X.
          The placeholder-text override compensates for another ce-ui
          Dropdown quirk: its empty-multi-select placeholder is hardcoded to
          14px regardless of `size`, unlike the single-select trigger text
          (16px at size="lg"). */}
      <style>{`
        .customer-tag-dropdown > div > div[role="button"] { min-height: 48px; }
        .customer-tag-dropdown > div > div[role="button"] > span.text-lb-on-surface-3 { font-size: 16px; line-height: 22px; }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }} onClick={handleBack}>
          <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
            {isEditMode ? "Edit Customer" : "Add New Customer"}
          </h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
          <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
            Customers
          </span>
          <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
            {isEditMode ? "Edit Customer" : "Add New Customer"}
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
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. PT ABC Manufacturing"
                error={errors.name}
              />
            </div>
            <div style={{ flex: 1 }}>
              <InputField
                label="Customer Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="customer@example.com"
                helperText="Use official company email address"
              />
            </div>
            <div style={{ flex: 1 }}>
              <PhoneInputField
                label="Customer Phone"
                value={form.phone}
                onChange={(val) => setForm({ ...form, phone: val })}
                helperText="Use main office/HQ phone number"
                shellStyle={{ minHeight: "48px" }}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <FormField label="Customer Tag" helperText="Max 5 tags">
                {/* The ce-ui Dropdown's multi-select trigger is hardcoded to
                    min-h-10 regardless of `size`, so it renders shorter than
                    the single-select Country field next to it (size="lg" ->
                    h-12) — force the same 48px minimum height to match.
                    `searchable` here only adds a search box inside the
                    popover (multi-select mode has no inline-typing-in-trigger
                    like the single-select Category field in the CPR page —
                    that's a limitation of the underlying component), but it's
                    still real search capability so it stays on. */}
                <CeDropdown
                  multi
                  searchable
                  size="lg"
                  className="customer-tag-dropdown"
                  placeholder="Select customer tags"
                  options={activeTagOptions}
                  value={form.tags}
                  onChange={(vals) => setForm({ ...form, tags: vals })}
                  footer={
                    <Button
                      variant="tertiary"
                      size="small"
                      leftIcon={AddIcon}
                      style={{ width: "100%", justifyContent: "flex-start" }}
                      onClick={() => setIsTagModalOpen(true)}
                    >
                      Add new customer tag
                    </Button>
                  }
                />
              </FormField>
            </div>
            <div style={{ flex: 1 }}>
              <FormField label="Customer Country" required error={errors.country}>
                <DropdownSelect
                  value={form.country}
                  onChange={(val) => setForm({ ...form, country: val })}
                  options={COUNTRY_OPTIONS.map((c) => ({ value: c.value, label: `${c.flag} ${c.label}` }))}
                  placeholder="Select customer country"
                  hasError={!!errors.country}
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
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Enter registered company address"
                error={errors.address}
              />
              {/* Rendered manually instead of via InputField's `helperText`
                  prop: ce-ui's TextField gives a multiline field the same 4px
                  gap as a single-line one, but the textarea's own empty space
                  above its bottom border reads as a much bigger gap visually
                  — this gives explicit, guaranteed 4px spacing regardless. */}
              {!errors.address ? (
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
          <PersonInChargeTable
            pics={pics}
            onChange={setPics}
            primaryError={errors.picPrimary}
            fieldErrors={errors.pic || {}}
          />
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

      <CustomerTagModal
        isOpen={isTagModalOpen}
        mode="Add"
        onClose={() => setIsTagModalOpen(false)}
        onSave={handleAddTag}
      />
    </div>
  );
};
