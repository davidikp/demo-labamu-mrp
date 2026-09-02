import React, { useState } from "react";
import { ChevronLeftIcon, EditIcon, DeleteIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { LabelValue } from "../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";
import { PersonInChargeTable } from "../components/PersonInChargeTable.jsx";
import { Tooltip } from "../../../components/index.js";
import { Info } from "../../../components/icons/Icons.jsx";
import {
  deleteCustomer,
  getCustomerTagLabel,
  getScreeningBadgeVariant,
  getEffectiveScreeningStatus,
  getScreeningStatusLabel,
  isScreeningExpired,
} from "../mock/customerMocks.js";

// Plain bold section title (no blue accent bar) — matches "Vendor
// Information"/"Recipient Information" on PurchaseOrderDetailPage, as
// distinct from the accent-bar `sectionHeader` used on the create page.
const plainSectionCardStyle = {
  background: "var(--neutral-surface-primary)",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  overflow: "hidden",
};

const plainSectionTitle = (title) => (
  <div style={{ padding: "24px 24px 0 24px", display: "flex", alignItems: "center", gap: "10px" }}>
    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>{title}</span>
  </div>
);

export const CustomerDetailPage = ({ customer, onNavigate, showSnackbar, t }) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  if (!customer) {
    return (
      <div style={{ padding: "24px" }}>
        <span>Customer not found.</span>
      </div>
    );
  }

  const effectiveScreeningStatus = getEffectiveScreeningStatus(customer);
  const screeningExpired = isScreeningExpired(customer);

  const handleDelete = () => {
    deleteCustomer(customer.id);
    setIsDeleteModalOpen(false);
    showSnackbar?.("Customer successfully deleted", "success");
    onNavigate("list");
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
        boxSizing: "border-box",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={() => onNavigate("list")}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              Customer Detail
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
              Customers
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Customer Detail</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            variant="outlined"
            leftIcon={DeleteIcon}
            onClick={() => setIsDeleteModalOpen(true)}
            style={{ borderColor: "var(--status-red-primary)", color: "var(--status-red-primary)" }}
          >
            Delete
          </Button>
          <Button variant="outlined" leftIcon={EditIcon} onClick={() => onNavigate("create", customer)}>
            Edit
          </Button>
        </div>
      </div>

      {/* Merges what were separate "Screening Status" and "Customer
          Information" cards into one, matching PoDetailHeader's top
          info-card: primary identity text + status badge inline at the top,
          divider, then the rest of the fields in a grid below. */}
      <div style={plainSectionCardStyle}>
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            {customer.name}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
              {`Last screened: ${customer.lastScreenedAt || "-"}`}
            </span>
            {/* An expired Passed result still shows the date it was screened,
                so explain why the status next to it reads Not Screened. */}
            {screeningExpired ? (
              <Tooltip content="Screening expired. A new screening will run on the next quote approval.">
                <span style={{ display: "inline-flex", alignItems: "center", cursor: "help" }}>
                  <Info size={16} color="var(--neutral-on-surface-tertiary)" />
                </span>
              </Tooltip>
            ) : null}
            <StatusBadge variant={getScreeningBadgeVariant(effectiveScreeningStatus)}>
              {getScreeningStatusLabel(effectiveScreeningStatus)}
            </StatusBadge>
          </div>
        </div>

        <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />

        <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
            <LabelValue label="Customer Email" value={customer.email || "-"} />
            <LabelValue label="Customer Phone" value={customer.phone || "-"} />
            <LabelValue
              label="Customer Tag"
              value={customer.tags?.length ? customer.tags.map(getCustomerTagLabel).join(", ") : "-"}
            />
            <LabelValue label="Customer Country" value={customer.country || "-"} />
          </div>
          <LabelValue label="Customer Address" value={customer.address || "-"} />
        </div>
      </div>

      <div style={plainSectionCardStyle}>
        {plainSectionTitle("Person In Charge")}
        <div style={{ padding: "20px 24px 24px 24px" }}>
          <PersonInChargeTable pics={customer.pics || []} onChange={() => {}} readOnly />
        </div>
      </div>

      <GeneralModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Customer?"
        width="440px"
        hideFooterDivider
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" onClick={() => setIsDeleteModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button
              variant="filled"
              size="large"
              onClick={handleDelete}
              style={{ flex: 1, background: "var(--status-red-primary)" }}
            >
              Delete
            </Button>
          </div>
        }
      >
        <span style={{ display: "block", textAlign: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
          Are you sure you want to delete "{customer.name}"? This action cannot be undone.
        </span>
      </GeneralModal>
    </div>
  );
};
