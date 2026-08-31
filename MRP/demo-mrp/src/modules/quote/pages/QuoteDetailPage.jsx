import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDownIcon,
  ChevronLeftIcon,
  DownloadIcon,
  EditIcon,
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ChipTabBar } from "../../../components/molecules/ChipTabBar.jsx";
import { LabelValue } from "../../purchase-order/components/detail/shared/PoDetailSharedComponents.jsx";
import { PersonInChargeTable } from "../../customer/components/PersonInChargeTable.jsx";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { FormField } from "../../../components/index.js";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { COUNTRY_OPTIONS } from "../../../constants/appConstants.js";
import {
  MOCK_QUOTES,
  updateQuote,
  getQuoteProductTotal,
  getQuoteSubtotal,
} from "../mock/quoteMocks.js";
import {
  getCustomerById,
  isScreeningValid,
  getScreeningBadgeVariant,
  updateCustomer as updateCustomerRecord,
} from "../../customer/mock/customerMocks.js";
import { SimulateScreeningPanel } from "../components/SimulateScreeningPanel.jsx";

const sectionCardStyle = {
  background: "var(--neutral-surface-primary)",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  overflow: "hidden",
};

const sectionTitle = (title) => (
  <div style={{ padding: "20px 24px 0 24px" }}>
    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
      {title}
    </span>
  </div>
);

const formatCurrency = (value, currency = "IDR") =>
  `${currency} ${Number(value || 0).toLocaleString("en-US")}`;

const CUSTOMER_ACTION_OPTIONS = [
  { key: "approve", label: "Approve" },
  { key: "reject", label: "Mark as Rejected" },
  { key: "revision", label: "Request Revision" },
];

// Maps a Simulate-panel scenario to what the (mocked) Sanctions.io call
// returns for it. Scenarios not listed (missing country / valid reuse)
// resolve before a screening call would even happen, so no forced result.
const SCENARIO_FORCED_RESULT = {
  never_screened_passed: "Passed",
  never_screened_failed: "Failed",
  never_screened_error: "TechnicalError",
  stale_passed: "Passed",
  stale_failed: "Failed",
};

const getStatusBadgeVariant = (status) => {
  switch (status) {
    case "Approved":
      return "green";
    case "Issued":
      return "orange";
    case "Submitted":
      return "blue";
    case "Rejected":
      return "red";
    case "Need Revision":
      return "yellow";
    default:
      return "grey";
  }
};

// Bilingual snackbar copy for the Customer Action → Approve sanctions
// screening gate.
const SCREENING_MESSAGES = {
  no_customer: {
    en: "No customer is linked to this quote. Add a customer before approving.",
    id: "Belum ada pelanggan yang terhubung ke penawaran ini. Tambahkan pelanggan sebelum menyetujui.",
  },
  already_failed: {
    en: "This customer did not pass sanctions screening. The account remains suspended.",
    id: "Pelanggan ini tidak lolos pemeriksaan sanksi. Akun tetap ditangguhkan.",
  },
  passed: {
    en: "Quote successfully approved. Sanctions screening passed.",
    id: "Penawaran berhasil disetujui. Pelanggan lolos pemeriksaan sanksi.",
  },
  failed: {
    en: "Sanctions screening failed. The quote was rejected and the customer account was suspended.",
    id: "Pemeriksaan sanksi gagal. Penawaran ditolak dan akun pelanggan ditangguhkan.",
  },
  technical_error: {
    en: "Failed to complete sanctions screening. Try approving the quote again.",
    id: "Pemeriksaan sanksi belum dapat diselesaikan. Coba setujui penawaran lagi.",
  },
  country_saved: {
    en: "Customer country saved. Continuing sanctions screening.",
    id: "Negara pelanggan tersimpan. Melanjutkan pemeriksaan sanksi.",
  },
};

// Copy for the "Add Customer Country" modal that opens inline from the
// Approve gate — lets the user complete the missing field without leaving
// the Quote Detail page (PRD: country must be selected and saved before
// screening can start).
const COUNTRY_MODAL_COPY = {
  title: { en: "Add Customer Country", id: "Tambahkan Negara Pelanggan" },
  description: {
    en: "Sanctions screening requires the customer's country. Select it below to continue.",
    id: "Pemeriksaan sanksi memerlukan negara pelanggan. Pilih di bawah ini untuk melanjutkan.",
  },
  fieldLabel: { en: "Customer Country", id: "Negara Pelanggan" },
  placeholder: { en: "Select customer country", id: "Pilih negara pelanggan" },
  required: { en: "Field cannot be empty", id: "Kolom tidak boleh kosong" },
  cancel: { en: "Cancel", id: "Batal" },
  save: { en: "Save & Continue", id: "Simpan & Lanjutkan" },
};

// Internal review decision modal (Submitted → Reject / Ask for Revision /
// Approve), mirroring the Purchase Order module's decision-modal pattern
// (usePoDecisionFlow.js / PoActionValidationModals.jsx): Reject and Ask for
// Revision always require a comment; Approve requires one only when Quote
// Settings' "Require Comment for Approval" is on.
const INTERNAL_DECISION_META = {
  reject: {
    title: "Reject Quote",
    helper: "Add a reason for rejecting this quote.",
  },
  revision: {
    title: "Ask for Revision",
    helper: "Add revision notes for the requester.",
  },
  approve: {
    title: "Approve Quote",
    helper: "Add a comment for approval if needed.",
  },
};

export const QuoteDetailPage = ({
  onNavigate,
  initialData,
  showSnackbar,
  isSidebarCollapsed,
  quoteApprovalSettings,
  onSuspendAccount,
  language,
}) => {
  const sm = (key) => SCREENING_MESSAGES[key]?.[language === "id" ? "id" : "en"] || "";
  const cm = (key) => COUNTRY_MODAL_COPY[key]?.[language === "id" ? "id" : "en"] || "";

  const [activeTab, setActiveTab] = useState("customer_info");
  const [quoteData, setQuoteData] = useState(initialData || {});
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);
  // Bumped after every mutation to the linked customer record so the
  // Simulate panel + screening checks re-read fresh state (customer mocks
  // live outside React state, in the shared MOCK_CUSTOMERS array).
  const [customerVersion, setCustomerVersion] = useState(0);
  // Currently "armed" Simulate scenario key (or null) — set by checking a box
  // in the Simulate panel, consumed by the next Customer Action → Approve.
  const [armedScenario, setArmedScenario] = useState(null);
  // Inline "Add Customer Country" modal state, opened from the Approve gate
  // when the linked customer has no country yet. `pendingForcedResult`
  // remembers what the in-flight Approve click should resume with (e.g. a
  // Simulate-armed outcome) once the country is saved.
  const [isCountryModalOpen, setIsCountryModalOpen] = useState(false);
  const [countryModalValue, setCountryModalValue] = useState("");
  const [countryModalError, setCountryModalError] = useState("");
  const [pendingForcedResult, setPendingForcedResult] = useState(undefined);
  // Internal review decision modal (Submitted status footer).
  const [isDecisionModalOpen, setIsDecisionModalOpen] = useState(false);
  const [decisionType, setDecisionType] = useState(null);
  const [decisionComment, setDecisionComment] = useState("");
  const [decisionError, setDecisionError] = useState("");
  const { notify, currentUser: notifUser } = useNotifications();

  useEffect(() => {
    if (initialData) setQuoteData(initialData);
  }, [initialData]);

  const linkedCustomer = useMemo(
    () => getCustomerById(quoteData.customerId),
    [quoteData.customerId, customerVersion]
  );

  if (!quoteData?.quoteNo) {
    return (
      <div style={{ padding: "24px" }}>
        <span>Quote not found.</span>
      </div>
    );
  }

  const approvalEnabled = quoteApprovalSettings?.isApprovalActive || false;

  const applyUpdate = (patch) => {
    const updated = updateQuote(quoteData.quoteNo, patch);
    setQuoteData((prev) => ({ ...prev, ...patch }));
    return updated;
  };

  const handleCustomerAction = (nextApprovalStatus) => {
    const sBadge = getStatusBadgeVariant(nextApprovalStatus);
    applyUpdate({
      customerApprovalStatus: nextApprovalStatus,
      status: nextApprovalStatus,
      sBadge,
    });
    setIsActionMenuOpen(false);
    showSnackbar?.("Quote status successfully updated", "success");
  };

  // Sanctions Screening gate for Customer Action → Approve (PRD: MRP Portal —
  // Quote Approval Sanctions Screening). `forcedResult` lets the Simulate
  // panel deterministically pick what the (mocked) Sanctions.io call returns
  // for a customer who needs (re-)screening; the plain Approve button omits
  // it, which defaults to "Passed" so day-to-day demoing isn't blocked.
  const finalizeApproval = () => {
    const sBadge = getStatusBadgeVariant("Approved");
    applyUpdate({ status: "Approved", customerApprovalStatus: "Approved", sBadge });
    setIsActionMenuOpen(false);
    showSnackbar?.(sm("passed"), "success");
  };

  const handleScreeningFailed = (customer) => {
    updateCustomerRecord(customer.id, { screeningStatus: "Sanctions Screening Failed" });
    setCustomerVersion((v) => v + 1);

    const sBadge = getStatusBadgeVariant("Rejected");
    applyUpdate({
      status: "Rejected",
      customerApprovalStatus: "Rejected",
      sBadge,
      rejectedBy: "System",
      rejectedMessage: "Quote automatically rejected because the customer failed sanctions screening.",
    });
    setIsActionMenuOpen(false);

    notify("compliance", "account_suspended", {
      entityId: quoteData.quoteNo,
      number: quoteData.quoteNo,
      customerName: customer.name,
      requesterUser: notifUser,
    });

    onSuspendAccount?.({ customerName: customer.name, quoteNumber: quoteData.quoteNo });
    showSnackbar?.(sm("failed"), "error");
  };

  const runScreeningCheck = (forcedResult) => {
    const customer = getCustomerById(quoteData.customerId);
    if (!customer) {
      showSnackbar?.(sm("no_customer"), "error");
      return;
    }
    if (customer.screeningStatus === "Sanctions Screening Failed") {
      showSnackbar?.(sm("already_failed"), "error");
      return;
    }
    if (!customer.country) {
      // Open the inline "Add Customer Country" modal instead of just
      // blocking — the user fills it in and saves without leaving the
      // Quote Detail page, then screening resumes automatically.
      setPendingForcedResult(forcedResult);
      setCountryModalValue("");
      setCountryModalError("");
      setIsCountryModalOpen(true);
      return;
    }
    if (isScreeningValid(customer)) {
      finalizeApproval();
      return;
    }

    // Customer has never been screened, or the previous Passed result is
    // stale (name/country changed since) — this is the actual screening
    // trigger point. `forcedResult` simulates what Sanctions.io returns.
    const result = forcedResult || "Passed";
    if (result === "TechnicalError") {
      showSnackbar?.(sm("technical_error"), "error");
      return;
    }
    if (result === "Failed") {
      handleScreeningFailed(customer);
      return;
    }

    updateCustomerRecord(customer.id, {
      screeningStatus: "Passed",
      lastScreenedName: customer.name,
      lastScreenedCountry: customer.country,
      lastScreenedAt: new Date().toISOString().slice(0, 16).replace("T", " "),
    });
    setCustomerVersion((v) => v + 1);
    finalizeApproval();
  };

  const handleSaveCustomerCountry = () => {
    if (!countryModalValue) {
      setCountryModalError(cm("required"));
      return;
    }
    const customer = getCustomerById(quoteData.customerId);
    if (!customer) return;

    updateCustomerRecord(customer.id, { country: countryModalValue });
    setCustomerVersion((v) => v + 1);
    setIsCountryModalOpen(false);
    showSnackbar?.(sm("country_saved"), "success");

    // Country is saved — resume the screening check right where it left
    // off, using whatever forced result the in-flight Approve click carried.
    runScreeningCheck(pendingForcedResult);
    setPendingForcedResult(undefined);
  };

  const handleCustomerActionSelect = (key) => {
    if (key === "approve") {
      const forcedResult = SCENARIO_FORCED_RESULT[armedScenario];
      runScreeningCheck(forcedResult);
      // The armed scenario is a one-shot setup for the next Approve click —
      // consume it regardless of outcome (blocked/passed/failed/error).
      setArmedScenario(null);
      return;
    }
    if (key === "reject") {
      handleCustomerAction("Rejected");
      return;
    }
    if (key === "revision") {
      handleCustomerAction("Need Revision");
    }
  };

  // Simulate panel: checking a scenario only sets up the linked customer's
  // screening precondition and arms the (mocked) Sanctions.io result that
  // Customer Action → Approve will use next — it does NOT trigger approval
  // itself. This keeps the real Approve click as the single trigger point,
  // matching the PRD ("MRP Portal entry point is Customer Action > Approve").
  const handleToggleScenario = (scenarioKey) => {
    const customer = getCustomerById(quoteData.customerId);
    if (!customer) return;

    // Clicking the already-armed scenario disarms it (unchecks).
    if (armedScenario === scenarioKey) {
      setArmedScenario(null);
      return;
    }

    const fallbackCountry = customer.country || "Indonesia";

    switch (scenarioKey) {
      case "never_screened_passed":
      case "never_screened_failed":
      case "never_screened_error":
        updateCustomerRecord(customer.id, {
          country: fallbackCountry,
          screeningStatus: "Not Screened",
          lastScreenedName: null,
          lastScreenedCountry: null,
        });
        break;
      case "stale_passed":
      case "stale_failed":
        updateCustomerRecord(customer.id, {
          country: fallbackCountry,
          screeningStatus: "Passed",
          lastScreenedName: `${customer.name} (Old Name Ltd)`,
          lastScreenedCountry: fallbackCountry,
        });
        break;
      case "missing_country":
        updateCustomerRecord(customer.id, { country: "" });
        break;
      case "valid_passed_reuse":
        updateCustomerRecord(customer.id, {
          country: fallbackCountry,
          screeningStatus: "Passed",
          lastScreenedName: customer.name,
          lastScreenedCountry: fallbackCountry,
        });
        break;
      default:
        break;
    }
    setCustomerVersion((v) => v + 1);
    setArmedScenario(scenarioKey);
  };

  const handleResetScenario = () => {
    const customer = getCustomerById(quoteData.customerId);
    if (!customer) return;
    updateCustomerRecord(customer.id, {
      screeningStatus: "Not Screened",
      lastScreenedName: null,
      lastScreenedCountry: null,
      lastScreenedAt: null,
    });
    setCustomerVersion((v) => v + 1);
    setArmedScenario(null);
    showSnackbar?.("Customer screening state reset.", "success");
  };

  const handleSendToCustomer = () => {
    // Quote is already Issued by the time this footer button is reachable —
    // this simulates (re)sending the document, not a status transition.
    showSnackbar?.("Quote successfully sent to customer", "success");
  };

  const handleDownload = () => {
    showSnackbar?.("Preparing quote download...", "success");
  };

  const handleEditQuote = () => onNavigate("create", quoteData);

  const handleSubmitQuote = () => {
    applyUpdate({ status: "Submitted", sBadge: getStatusBadgeVariant("Submitted") });
    notify("quote", "submitted", {
      entityId: quoteData.quoteNo,
      submitterUser: notifUser,
    });
    showSnackbar?.("Quote submitted for approval.", "success");
  };

  // Internal review decision modal (Submitted → Reject / Ask for Revision /
  // Approve). Reject/Ask for Revision always require a comment; Approve's
  // comment requirement follows Quote Settings' "Require Comment for
  // Approval" toggle.
  const isDecisionCommentMandatory =
    decisionType === "reject" || decisionType === "revision"
      ? true
      : !!(quoteApprovalSettings?.isApprovalActive && quoteApprovalSettings?.requireComment);

  const getDecisionMeta = () => ({
    ...(INTERNAL_DECISION_META[decisionType] || {}),
    mandatory: isDecisionCommentMandatory,
  });

  const openDecisionModal = (type) => {
    setDecisionType(type);
    setDecisionComment("");
    setDecisionError("");
    setIsDecisionModalOpen(true);
  };

  const closeDecisionModal = () => {
    setIsDecisionModalOpen(false);
    setDecisionType(null);
    setDecisionComment("");
    setDecisionError("");
  };

  const handleSubmitDecision = () => {
    const trimmedComment = decisionComment.trim();
    if (isDecisionCommentMandatory && !trimmedComment) {
      setDecisionError("Field cannot be empty");
      return;
    }

    if (decisionType === "reject") {
      applyUpdate({
        status: "Rejected",
        sBadge: getStatusBadgeVariant("Rejected"),
        rejectedBy: notifUser.name,
        rejectedMessage: trimmedComment,
      });
      notify("quote", "rejected", {
        entityId: quoteData.quoteNo,
        approverName: notifUser.name,
        reason: trimmedComment,
        submitterUser: notifUser,
      });
      showSnackbar?.("Quote successfully rejected", "success");
    } else if (decisionType === "revision") {
      applyUpdate({
        status: "Need Revision",
        sBadge: getStatusBadgeVariant("Need Revision"),
        revisionMessage: trimmedComment,
      });
      notify("quote", "need_revision", {
        entityId: quoteData.quoteNo,
        approverName: notifUser.name,
        note: trimmedComment,
        submitterUser: notifUser,
      });
      showSnackbar?.("Revision requested", "success");
    } else if (decisionType === "approve") {
      applyUpdate({
        status: "Issued",
        sBadge: getStatusBadgeVariant("Issued"),
        approvalComment: trimmedComment,
      });
      notify("quote", "all_approved", {
        entityId: quoteData.quoteNo,
        submitterUser: notifUser,
      });
      showSnackbar?.("Quote approved and issued to customer", "success");
    }

    closeDecisionModal();
  };

  const products = quoteData.products || [];
  const subtotal = getQuoteSubtotal(products);
  const taxAmount = subtotal * ((quoteData.taxRatePercent || 0) / 100);
  const total = subtotal + taxAmount + (quoteData.shippingFee || 0) + (quoteData.otherFee || 0);

  const dynamicActivityLogs = useMemo(() => {
    const logs = [];

    if (quoteData.status === "Approved") {
      logs.push({ name: "System", email: "-", title: "Approved", timestamp: `${quoteData.createdAt || "-"} at 14:00` });
    }
    if (quoteData.status === "Rejected") {
      logs.push({
        name: quoteData.rejectedBy || "System",
        email: "-",
        title: "Rejected",
        desc: quoteData.rejectedMessage || "",
        timestamp: `${quoteData.createdAt || "-"} at 14:00`,
      });
    }
    if (quoteData.status === "Need Revision") {
      logs.push({
        name: "System",
        email: "-",
        title: "Need Revision",
        desc: quoteData.revisionMessage || "",
        timestamp: `${quoteData.createdAt || "-"} at 14:00`,
      });
    }
    if (quoteData.status === "Issued" || quoteData.status === "Approved") {
      logs.push({
        name: notifUser?.name || "User",
        email: "-",
        title: "Approved",
        desc: quoteData.approvalComment || "",
        timestamp: `${quoteData.createdAt || "-"} at 11:00`,
      });
    }
    if (quoteData.status === "Issued" || quoteData.status === "Approved" || quoteData.status === "Rejected" || quoteData.status === "Need Revision") {
      logs.push({ name: quoteData.createdBy || "User", email: "-", title: "Sent to Customer", timestamp: `${quoteData.createdAt || "-"} at 10:00` });
    }
    if (quoteData.status !== "Draft") {
      logs.push({ name: quoteData.createdBy || "User", email: "-", title: "Submitted for Approval", timestamp: `${quoteData.createdAt || "-"} at 09:30` });
    }
    logs.push({ name: quoteData.createdBy || "User", email: "-", title: "Created", timestamp: `${quoteData.createdAt || "-"} at 09:00` });

    return logs;
  }, [quoteData]);

  const tabs = [
    { key: "customer_info", label: "Customer Info" },
    { key: "products", label: "Products" },
    { key: "attachments", label: "Attachments" },
    { key: "bank_account", label: "Bank Account" },
    { key: "terms", label: "Terms and Conditions" },
    { key: "logs", label: "Logs" },
  ];

  const handleBackNavigation = () => onNavigate("list");

  // Status-driven action layout:
  //   Draft / Rejected / Need Revision → header "Edit Quote", footer "Submit"
  //   Submitted                        → header "Download", footer Reject /
  //                                      Ask for Revision / Approve
  //   Issued                           → header "Download" + "Customer
  //                                      Action", footer "Send to Customer"
  //   Approved                         → header "Download" only, no footer
  const status = quoteData.status;
  const isEditableStatus =
    status === "Draft" || status === "Rejected" || status === "Need Revision";
  const isSubmittedStatus = status === "Submitted";
  const isIssuedStatus = status === "Issued";

  return (
    <div style={{ padding: "24px 24px 100px 24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={handleBackNavigation}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              Quote Detail
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span onClick={handleBackNavigation} style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}>
              Quotes
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Quote Detail</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          {isEditableStatus ? (
            <Button variant="outlined" leftIcon={EditIcon} onClick={handleEditQuote}>
              Edit Quote
            </Button>
          ) : (
            <Button variant="outlined" leftIcon={DownloadIcon} onClick={handleDownload}>
              Download
            </Button>
          )}

          {isIssuedStatus ? (
            <div style={{ position: "relative" }}>
              <Button variant="outlined" rightIcon={ChevronDownIcon} onClick={() => setIsActionMenuOpen((prev) => !prev)}>
                Customer Action
              </Button>
              {isActionMenuOpen ? (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 998 }} onClick={() => setIsActionMenuOpen(false)} />
                  <div
                    style={{
                      position: "absolute",
                      top: "calc(100% + 8px)",
                      right: 0,
                      minWidth: "200px",
                      background: "var(--neutral-surface-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "12px",
                      boxShadow: "var(--elevation-sm)",
                      overflow: "hidden",
                      zIndex: 999,
                    }}
                  >
                    {CUSTOMER_ACTION_OPTIONS.map((opt) => (
                      <div
                        key={opt.key}
                        onClick={() => handleCustomerActionSelect(opt.key)}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                        style={{ padding: "12px 16px", cursor: "pointer", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}
                      >
                        {opt.label}
                      </div>
                    ))}
                  </div>
                </>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div style={sectionCardStyle}>
        <div style={{ padding: "20px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            {quoteData.quoteNo}
          </span>
          <StatusBadge variant={quoteData.sBadge || "grey"}>{quoteData.status}</StatusBadge>
        </div>
        <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />
        <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
          <LabelValue label="RFQ No" value={quoteData.rfqNo || "-"} />
          <LabelValue label="Currency" value={quoteData.currency || "-"} />
          <LabelValue label="Down Payment" value={quoteData.downPaymentPercent != null ? `${quoteData.downPaymentPercent}%` : "-"} />
          <LabelValue label="Valid Until" value={quoteData.validUntil || "-"} />
          <LabelValue label="Created By" value={quoteData.createdBy || "-"} />
          <LabelValue label="Created Date" value={quoteData.createdAt || "-"} />
          <LabelValue
            label="Customer Approval Status"
            badge={{
              variant:
                quoteData.customerApprovalStatus === "Approved"
                  ? "green"
                  : quoteData.customerApprovalStatus === "Rejected"
                  ? "red"
                  : quoteData.customerApprovalStatus === "Need Revision"
                  ? "yellow"
                  : "yellow-light",
              text: quoteData.customerApprovalStatus || "Pending",
            }}
          />
        </div>
      </div>

      <ChipTabBar
        tabs={tabs.map((t) => ({ id: t.key, label: t.label }))}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {activeTab === "customer_info" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={sectionCardStyle}>
            {sectionTitle("Customer Information")}
            <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <LabelValue label="Customer Name" value={quoteData.customer?.name || quoteData.customerName || "-"} />
                <LabelValue label="Email" value={quoteData.customer?.email || "-"} />
                <LabelValue label="Customer Phone" value={quoteData.customer?.phone || "-"} />
              </div>
              <LabelValue label="Customer Address" value={quoteData.customer?.address || "-"} />
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <LabelValue label="Customer Tags" value={quoteData.customer?.tags?.length ? quoteData.customer.tags.join(", ") : "-"} />
                <LabelValue label="Customer Country" value={linkedCustomer?.country || "-"} />
                <LabelValue
                  label="Sanctions Screening Status"
                  badge={{
                    variant: getScreeningBadgeVariant(linkedCustomer?.screeningStatus),
                    text: linkedCustomer?.screeningStatus || "Not Screened",
                  }}
                />
              </div>
            </div>

            <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />

            {sectionTitle("Person In Charge")}
            <div style={{ padding: "20px 24px 24px 24px" }}>
              <PersonInChargeTable pics={quoteData.pics || []} onChange={() => {}} readOnly />
            </div>
          </div>
        </div>
      )}

      {activeTab === "products" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={sectionCardStyle}>
            {sectionTitle("Products")}
            <div style={{ padding: "20px 24px 24px 24px", overflowX: "auto" }}>
              <div style={{ minWidth: "900px", display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "flex",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <div style={{ width: "72px" }}>Image</div>
                  <div style={{ flex: "1.6" }}>Product Name</div>
                  <div style={{ flex: "1.2" }}>Notes</div>
                  <div style={{ flex: "1.2" }}>Attachments</div>
                  <div style={{ width: "90px" }}>Qty</div>
                  <div style={{ flex: "1" }}>Unit Price</div>
                  <div style={{ width: "90px" }}>Discount</div>
                  <div style={{ flex: "1" }}>Total Price</div>
                </div>

                {products.length === 0 ? (
                  <div style={{ padding: "24px 0", color: "var(--neutral-on-surface-tertiary)" }}>No products added yet.</div>
                ) : (
                  products.map((p, idx) => (
                    <div
                      key={p.id || idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 0",
                        borderBottom: idx === products.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      <div style={{ width: "72px" }}>
                        {p.image ? (
                          <img src={p.image} alt={p.name} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
                        ) : (
                          <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)" }} />
                        )}
                      </div>
                      <div style={{ flex: "1.6", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ color: "var(--neutral-on-surface-primary)" }}>{p.name}</span>
                        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{p.sku}</span>
                      </div>
                      <div style={{ flex: "1.2", color: "var(--neutral-on-surface-secondary)" }}>{p.notes || "—"}</div>
                      <div style={{ flex: "1.2", color: "var(--neutral-on-surface-secondary)" }}>{p.attachments || "—"}</div>
                      <div style={{ width: "90px" }}>{p.qty} {p.uom || ""}</div>
                      <div style={{ flex: "1" }}>{formatCurrency(p.unitPrice, quoteData.currency)}</div>
                      <div style={{ width: "90px" }}>{p.discountPercent ? `${p.discountPercent}%` : "-"}</div>
                      <div style={{ flex: "1", fontWeight: "var(--font-weight-bold)" }}>{formatCurrency(getQuoteProductTotal(p), quoteData.currency)}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div style={sectionCardStyle}>
            {sectionTitle("Total Amount")}
            <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, quoteData.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
                <span>Tax Rate ({quoteData.taxRatePercent || 0}%)</span>
                <span>{formatCurrency(taxAmount, quoteData.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
                <span>Shipping Fee</span>
                <span>{formatCurrency(quoteData.shippingFee, quoteData.currency)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
                <span>Other Fee</span>
                <span>{formatCurrency(quoteData.otherFee, quoteData.currency)}</span>
              </div>
              <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)", margin: "4px 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-1)" }}>
                <span>Total</span>
                <span style={{ color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(total, quoteData.currency)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "attachments" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={sectionCardStyle}>
            {sectionTitle("Attachments")}
            <div style={{ padding: "20px 24px 24px 24px" }}>
              {(!quoteData.attachments || quoteData.attachments.length === 0) ? (
                <div
                  style={{
                    padding: "48px 24px",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-tertiary)",
                    fontSize: "var(--text-title-3)",
                    background: "var(--neutral-surface-primary)",
                    border: "1.5px dashed var(--neutral-line-separator-1)",
                    borderRadius: "16px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "120px",
                  }}
                >
                  No attachments found.
                </div>
              ) : (
                quoteData.attachments.map((a, idx) => <div key={idx}>{a.name}</div>)
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "bank_account" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={sectionCardStyle}>
            {sectionTitle("Bank Account")}
            <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <LabelValue label="Account Name" value={quoteData.bankAccount?.accountName || "-"} />
                <LabelValue label="Account Number" value={quoteData.bankAccount?.accountNumber || "-"} />
                <LabelValue label="Bank Name" value={quoteData.bankAccount?.bankName || "-"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <LabelValue label="Supported Currencies" value={quoteData.bankAccount?.currencies || "-"} />
                <LabelValue label="SWIFT Code" value={quoteData.bankAccount?.swiftCode || "-"} />
                <LabelValue label="Branch" value={quoteData.bankAccount?.branch || "-"} />
              </div>
              <LabelValue label="Branch Address" value={quoteData.bankAccount?.branchAddress || "-"} />
            </div>
          </div>
        </div>
      )}

      {activeTab === "terms" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={sectionCardStyle}>
            {sectionTitle("Terms and Conditions")}
            <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <LabelValue label="Payment Terms" value={quoteData.terms?.paymentTerms || "-"} />
                <LabelValue label="Incoterms" value={quoteData.terms?.incoterms || "-"} />
                <LabelValue label="Shipping Method" value={quoteData.terms?.shippingMethod || "-"} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
                <LabelValue label="Estimated Delivery" value={quoteData.terms?.estimatedDelivery || "-"} />
                <LabelValue label="Risk Level" value={quoteData.terms?.riskLevel || "-"} />
                <LabelValue label="Dispute Resolution Method" value={quoteData.terms?.disputeResolutionMethod || "-"} />
              </div>
              <LabelValue label="Governing Law" value={quoteData.terms?.governingLaw || "-"} />
              <LabelValue label="Force Majeure" value={quoteData.terms?.forceMajeure || "-"} />
              <LabelValue label="Late Payment Penalties" value={quoteData.terms?.latePaymentPenalties || "-"} />
              <LabelValue label="Performance Guarantees" value={quoteData.terms?.performanceGuarantees || "-"} />
              {quoteData.terms?.additional ? (
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>Additional</span>
                  <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", whiteSpace: "pre-wrap", lineHeight: "1.6" }}>
                    {quoteData.terms.additional}
                  </span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {activeTab === "logs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {approvalEnabled ? (
            <div style={sectionCardStyle}>
              {sectionTitle("Approval Logs")}
              <div style={{ padding: "24px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "28px" }}>
                  <LabelValue label="Requested By" value={quoteData.createdBy || "-"} />
                  <LabelValue label="Requested At" value={quoteData.createdAt || "-"} />
                </div>
                <div
                  style={{
                    display: "flex",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <div style={{ flex: "1.1" }}>Approvers</div>
                  <div style={{ width: "140px" }}>Status</div>
                  <div style={{ flex: "2.4" }}>Comments</div>
                </div>
                {(quoteApprovalSettings?.approvers || []).map((approver, idx, arr) => (
                  <div
                    key={approver.id || idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "18px 0 10px 0",
                      fontSize: "var(--text-title-3)",
                      borderBottom: idx === arr.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                    }}
                  >
                    <div style={{ flex: "1.1" }}>{approver.name}</div>
                    <div style={{ width: "140px" }}>
                      <StatusBadge variant={quoteData.customerApprovalStatus === "Approved" ? "green" : quoteData.customerApprovalStatus === "Rejected" ? "red" : "grey-light"}>
                        {quoteData.customerApprovalStatus || "Pending"}
                      </StatusBadge>
                    </div>
                    <div style={{ flex: "2.4", color: "var(--neutral-on-surface-secondary)" }}>
                      {quoteData.revisionMessage || quoteData.rejectedMessage || "-"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div style={sectionCardStyle}>
            {sectionTitle("Activity Logs")}
            <div style={{ padding: "24px" }}>
              <div
                style={{
                  display: "flex",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  fontWeight: "var(--font-weight-bold)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div style={{ flex: "1.1" }}>Name</div>
                <div style={{ flex: "1.9" }}>Email</div>
                <div style={{ flex: "2.8" }}>Activity</div>
                <div style={{ width: "190px" }}>Timestamp</div>
              </div>
              {dynamicActivityLogs.map((log, idx, arr) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    padding: "16px 0",
                    borderBottom: idx === arr.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <div style={{ flex: "1.1", color: "var(--neutral-on-surface-primary)" }}>{log.name}</div>
                  <div style={{ flex: "1.9", color: "var(--neutral-on-surface-primary)" }}>{log.email}</div>
                  <div style={{ flex: "2.8", display: "flex", flexDirection: "column", gap: log.desc ? "6px" : "0" }}>
                    <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{log.title}</span>
                    {log.desc ? <span style={{ color: "var(--neutral-on-surface-secondary)", lineHeight: "1.5" }}>{log.desc}</span> : null}
                  </div>
                  <div style={{ width: "190px", color: "var(--neutral-on-surface-secondary)" }}>{log.timestamp}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {isEditableStatus || isSubmittedStatus || isIssuedStatus ? (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: isSidebarCollapsed ? "82px" : "286px",
            right: 0,
            transition: "left 0.2s ease",
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <div style={{ display: "flex", gap: "16px" }}>
            {isEditableStatus ? (
              <Button size="medium" variant="filled" onClick={handleSubmitQuote}>
                Submit
              </Button>
            ) : null}
            {isSubmittedStatus ? (
              <>
                <Button size="medium" variant="danger" onClick={() => openDecisionModal("reject")}>
                  Reject
                </Button>
                <Button size="medium" variant="outlined" onClick={() => openDecisionModal("revision")}>
                  Ask for Revision
                </Button>
                <Button size="medium" variant="filled" onClick={() => openDecisionModal("approve")}>
                  Approve
                </Button>
              </>
            ) : null}
            {isIssuedStatus ? (
              <Button size="medium" variant="filled" onClick={handleSendToCustomer}>
                Send to Customer
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      <GeneralModal
        isOpen={isDecisionModalOpen}
        onClose={closeDecisionModal}
        title={getDecisionMeta().title}
        width="440px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={closeDecisionModal}>
              Back
            </Button>
            <Button variant="filled" size="large" style={{ flex: 1 }} onClick={handleSubmitDecision}>
              Submit
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              {getDecisionMeta().mandatory ? (
                <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>*</span>
              ) : null}
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Comment
              </span>
            </div>
            <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
              {decisionComment.length}/400
            </span>
          </div>
          <textarea
            value={decisionComment}
            maxLength={400}
            onChange={(e) => {
              setDecisionComment(e.target.value);
              if (decisionError) setDecisionError("");
            }}
            placeholder={getDecisionMeta().helper}
            style={{
              minHeight: "120px",
              border: decisionError
                ? "1px solid var(--status-red-primary)"
                : "1px solid var(--neutral-line-separator-2)",
              borderRadius: "12px",
              padding: "12px 16px",
              background: "var(--neutral-surface-primary)",
              fontSize: "var(--text-subtitle-1)",
              color: "var(--neutral-on-surface-primary)",
              width: "100%",
              outline: "none",
              fontFamily: "Lato, sans-serif",
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />
          {decisionError ? (
            <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{decisionError}</span>
          ) : null}
        </div>
      </GeneralModal>

      <SimulateScreeningPanel
        customer={linkedCustomer}
        armedScenario={armedScenario}
        onToggleScenario={handleToggleScenario}
        onReset={handleResetScenario}
        // Lift clear of the fixed action footer when one is present.
        bottomOffset={isEditableStatus || isSubmittedStatus || isIssuedStatus ? 88 : 24}
      />

      <GeneralModal
        isOpen={isCountryModalOpen}
        onClose={() => setIsCountryModalOpen(false)}
        title={cm("title")}
        description={cm("description")}
        footer={
          <>
            <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={() => setIsCountryModalOpen(false)}>
              {cm("cancel")}
            </Button>
            <Button variant="filled" size="large" style={{ width: "100%" }} onClick={handleSaveCustomerCountry}>
              {cm("save")}
            </Button>
          </>
        }
      >
        <FormField label={cm("fieldLabel")} required error={countryModalError}>
          <DropdownSelect
            value={countryModalValue}
            onChange={(val) => {
              setCountryModalValue(val);
              setCountryModalError("");
            }}
            options={COUNTRY_OPTIONS.map((c) => ({ value: c.value, label: `${c.flag} ${c.label}` }))}
            placeholder={cm("placeholder")}
            hasError={!!countryModalError}
            searchable
          />
        </FormField>
      </GeneralModal>
    </div>
  );
};
