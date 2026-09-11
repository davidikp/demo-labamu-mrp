import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { LabelValue } from "../../../components/molecules/LabelValue.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Building2, DownloadIcon } from "../../../components/icons/Icons.jsx";
import {
  MOCK_QUOTES,
  updateQuote,
  appendQuoteActionLog,
  getStatusBadgeVariant,
  subscribeToQuoteSync,
} from "../../quote/mock/quoteMocks.js";
import {
  getCustomerById,
  isScreeningValid,
  updateCustomer as updateCustomerRecord,
  SCREENING_VALIDITY_MONTHS,
} from "../../customer/mock/customerMocks.js";
import { QuoteProductTable } from "../../quote/components/QuoteProductTable.jsx";
import { QuoteTotalsSummary } from "../../quote/components/QuoteTotalsSummary.jsx";
import { QuoteDecisionModal } from "../../quote/components/QuoteDecisionModal.jsx";
import { useQuoteDecisionFlow } from "../../quote/hooks/useQuoteDecisionFlow.js";
import { PortalTopBar } from "../components/PortalTopBar.jsx";
import { PortalPicCard } from "../components/PortalPicCard.jsx";
import { PortalActionsLogTable } from "../components/PortalActionsLogTable.jsx";
import { PortalToast } from "../components/PortalToast.jsx";
import { PortalSimulateScreeningPanel } from "../components/PortalSimulateScreeningPanel.jsx";
import { useIsMobile } from "../../../hooks/useIsMobile.js";
import { usePortalLanguage } from "../hooks/usePortalLanguage.js";

const sectionCardStyle = {
  background: "var(--neutral-surface-primary)",
  borderRadius: "16px",
  border: "1px solid var(--neutral-line-separator-1)",
  overflow: "hidden",
};

const sectionTitle = (title) => (
  <div style={{ padding: "20px 24px 0 24px" }}>
    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>{title}</span>
  </div>
);

// The seller (manufacturer) letterhead shown at the top of the portal quote
// — there's no manufacturer company-profile data source in this app yet, so
// this is static, demo-only content (same convention as the rest of this
// mock data set, e.g. the fictional bank branch addresses in quoteMocks.js).
const SELLER_COMPANY = {
  name: "Labamu Manufacturing",
  address: "Jl. Raya Manufaktur No. 1, Jakarta Selatan, Indonesia 12345",
  phone: "0823813021",
  email: "sales@labamu.co.id",
};

// Reject/Request Revision always require a comment; Accept doesn't — there's
// no internal "Require Comment for Approval" setting to consult from a
// customer-facing surface, so it's kept optional here.
const PORTAL_DECISION_META = {
  reject: { title: "Reject Quote", helper: "Add a reason for rejecting this quote.", mandatory: true },
  revision: { title: "Request Revision", helper: "Add revision notes for the seller.", mandatory: true },
  accept: { title: "Accept Quote", helper: "Add a comment for acceptance if needed.", mandatory: false },
};

const RISK_BADGE_VARIANT = {
  Low: "green",
  Medium: "yellow",
  High: "orange",
  "Very High": "red",
};

// PRD: Customer Portal — Quote Acceptance Sanctions Screening. The Customer
// Portal never runs sanctions screening itself — it only checks whether the
// linked customer already has a valid Passed result (see isScreeningValid in
// customerMocks.js) and blocks Accept Quote with this message otherwise,
// directing the customer back to the Manufacturing administrator.
const SCREENING_BLOCKED_MESSAGE =
  "This quote can’t be accepted right now. Please contact the company that issued the quote for assistance.";

// "YYYY-MM-DD HH:mm" — the format screening dates are stored in.
const nowStamp = () => new Date().toISOString().slice(0, 16).replace("T", " ");

// How long the simulated Accept-Quote processing "runs" behind the loading
// modal — mirrors QuoteDetailPage's Customer Action → Approve loading state
// (SCREENING_DURATION_MS), scaled to the same 2s so both surfaces feel
// consistent.
const ACCEPT_PROCESSING_DURATION_MS = 2000;

// Read-mostly Customer Portal view of a quote (see /portal/quote/:quoteNo),
// rendered shell-less (no sidebar/top-header) from App.jsx before the
// authenticated app shell mounts. `role` drives whether the Accept/Reject/
// Request Revision action bar shows ("approver") or the page is fully
// read-only with just Download + an Actions log ("viewer"). There's no real
// customer auth in this demo, so the role is switchable live from the
// portal's own top bar (see PortalTopBar) rather than fixed by the link —
// `initialRole` just seeds it (e.g. from a ?role= query param, if a caller
// wants to link straight to one variant).
export const CustomerPortalQuotePage = ({ quoteNo, initialRole = "approver" }) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const labelGridColumns = (desktopCount) => (isMobile ? "1fr" : `repeat(${desktopCount}, 1fr)`);
  const [quoteData, setQuoteData] = useState(() => MOCK_QUOTES.find((q) => q.quoteNo === quoteNo) || null);
  const [toast, setToast] = useState(null);
  const [role, setRole] = useState(initialRole);
  const portalRootRef = useRef(null);
  const [portalLanguage, setPortalLanguage] = usePortalLanguage(portalRootRef);

  useEffect(
    () =>
      subscribeToQuoteSync((updated) => {
        if (updated.quoteNo === quoteNo) setQuoteData(updated);
      }),
    [quoteNo]
  );

  const {
    isDecisionModalOpen,
    decisionType,
    decisionComment,
    setDecisionComment,
    decisionError,
    setDecisionError,
    getDecisionMeta,
    openDecisionModal,
    closeDecisionModal,
  } = useQuoteDecisionFlow({ getMeta: (type) => PORTAL_DECISION_META[type] });

  const actingPic = useMemo(() => {
    const pics = quoteData?.pics || [];
    return pics.find((p) => p.role === "Approver") || pics[0] || null;
  }, [quoteData]);

  // Bumped after every Simulate-panel mutation to the linked customer record
  // so `linkedCustomer` re-reads fresh state (customer mocks live outside
  // React state, in the shared MOCK_CUSTOMERS array) — mirrors the same
  // pattern QuoteDetailPage uses for the MRP Portal's own Simulate panel.
  const [customerVersion, setCustomerVersion] = useState(0);
  const [armedScenario, setArmedScenario] = useState(null);
  const [isScreeningBlockedOpen, setIsScreeningBlockedOpen] = useState(false);
  // Simulated processing state behind a blocking loading modal, shown after
  // the customer submits Accept Quote — mirrors QuoteDetailPage's Customer
  // Action → Approve loading modal.
  const [isAcceptProcessing, setIsAcceptProcessing] = useState(false);
  const acceptTimerRef = useRef(null);

  useEffect(
    () => () => {
      if (acceptTimerRef.current) clearTimeout(acceptTimerRef.current);
    },
    []
  );

  const linkedCustomer = useMemo(
    () => getCustomerById(quoteData?.customerId),
    [quoteData?.customerId, customerVersion]
  );

  if (!quoteData) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: "var(--text-title-2)" }}>Quote not found.</span>
      </div>
    );
  }

  // Simulate panel: checking a scenario only sets up the linked customer's
  // screening state — it does NOT run screening itself. Per the PRD, the
  // Customer Portal never calls Sanctions.io; Accept Quote just evaluates
  // whatever state is already on the customer record.
  const handleToggleScenario = (scenarioKey) => {
    if (!linkedCustomer) return;

    // Clicking the already-armed scenario disarms it (unchecks).
    if (armedScenario === scenarioKey) {
      setArmedScenario(null);
      return;
    }

    const fallbackCountry = linkedCustomer.country || "Indonesia";

    switch (scenarioKey) {
      case "valid_passed":
        updateCustomerRecord(linkedCustomer.id, {
          country: fallbackCountry,
          screeningStatus: "Passed",
          lastScreenedName: linkedCustomer.name,
          lastScreenedCountry: fallbackCountry,
          lastScreenedAt: nowStamp(),
        });
        break;
      case "never_screened":
        updateCustomerRecord(linkedCustomer.id, {
          country: fallbackCountry,
          screeningStatus: "Not Screened",
          lastScreenedName: null,
          lastScreenedCountry: null,
          lastScreenedAt: null,
        });
        break;
      case "missing_country":
        updateCustomerRecord(linkedCustomer.id, { country: "" });
        break;
      case "stale_passed":
        updateCustomerRecord(linkedCustomer.id, {
          country: fallbackCountry,
          screeningStatus: "Passed",
          // Recent, so the *only* reason this result is invalid is the name
          // change — not expiry.
          lastScreenedName: `${linkedCustomer.name} (Old Name Ltd)`,
          lastScreenedCountry: fallbackCountry,
          lastScreenedAt: nowStamp(),
        });
        break;
      case "expired_passed": {
        // A Passed result screened against the *current* name/country, but
        // backdated beyond the validity window.
        const expiredAt = new Date();
        expiredAt.setMonth(expiredAt.getMonth() - (SCREENING_VALIDITY_MONTHS + 2));
        updateCustomerRecord(linkedCustomer.id, {
          country: fallbackCountry,
          screeningStatus: "Passed",
          lastScreenedName: linkedCustomer.name,
          lastScreenedCountry: fallbackCountry,
          lastScreenedAt: expiredAt.toISOString().slice(0, 16).replace("T", " "),
        });
        break;
      }
      default:
        break;
    }
    setCustomerVersion((v) => v + 1);
    setArmedScenario(scenarioKey);
  };

  const handleResetScenario = () => {
    if (!linkedCustomer) return;
    updateCustomerRecord(linkedCustomer.id, {
      screeningStatus: "Not Screened",
      lastScreenedName: null,
      lastScreenedCountry: null,
      lastScreenedAt: null,
    });
    setCustomerVersion((v) => v + 1);
    setArmedScenario(null);
  };

  // PRD: Customer Portal — Quote Acceptance Sanctions Screening. Accept
  // Quote only proceeds when the linked customer already has a valid Passed
  // result; otherwise acceptance is blocked and the customer is told to
  // contact the Manufacturing administrator (screening itself is never
  // initiated from the Customer Portal). The eligibility check runs behind a
  // blocking loading modal (mirrors QuoteDetailPage's Customer Action →
  // Approve loading state) so clicking Accept Quote always shows visible
  // processing before either the decision modal or the blocked modal opens.
  const handleAcceptClick = () => {
    setIsAcceptProcessing(true);
    acceptTimerRef.current = setTimeout(() => {
      acceptTimerRef.current = null;
      setIsAcceptProcessing(false);
      if (!isScreeningValid(linkedCustomer)) {
        setIsScreeningBlockedOpen(true);
        return;
      }
      openDecisionModal("accept");
    }, ACCEPT_PROCESSING_DURATION_MS);
  };

  const handleSubmitDecision = () => {
    const trimmedComment = decisionComment.trim();
    if (getDecisionMeta().mandatory && !trimmedComment) {
      setDecisionError("Field cannot be empty");
      return;
    }
    const picEmail = actingPic?.email || quoteData.customer?.email || "-";

    if (decisionType === "reject") {
      updateQuote(quoteData.quoteNo, {
        status: "Rejected",
        sBadge: getStatusBadgeVariant("Rejected"),
        customerApprovalStatus: "Rejected",
        rejectedBy: actingPic?.name || "Customer",
        rejectedMessage: trimmedComment,
      });
      // Append the log entry after the status patch and use its return value
      // (not the earlier status-patch one) so the local state picks up both
      // the new status AND the new actionLogs entry in one go.
      const updated = appendQuoteActionLog(quoteData.quoteNo, { picEmail, action: "Rejected" });
      setQuoteData(updated);
      closeDecisionModal();
      setToast({ variant: "reject", message: "Quote rejected" });
      return;
    }

    if (decisionType === "revision") {
      updateQuote(quoteData.quoteNo, {
        status: "Need Revision",
        sBadge: getStatusBadgeVariant("Need Revision"),
        customerApprovalStatus: "Need Revision",
        revisionMessage: trimmedComment,
      });
      appendQuoteActionLog(quoteData.quoteNo, { picEmail, action: "Revision Requested" });
      closeDecisionModal();
      navigate(`/portal/quote/${quoteData.quoteNo}/revision-requested`);
      return;
    }

    if (decisionType === "accept") {
      // The processing loading modal already ran once, in handleAcceptClick,
      // to check eligibility before this decision modal was even opened — so
      // submitting here (eligibility already confirmed) applies immediately.
      updateQuote(quoteData.quoteNo, {
        status: "Approved",
        sBadge: getStatusBadgeVariant("Approved"),
        customerApprovalStatus: "Approved",
        approvalComment: trimmedComment,
      });
      const updated = appendQuoteActionLog(quoteData.quoteNo, { picEmail, action: "Accepted" });
      setQuoteData(updated);
      closeDecisionModal();
      setToast({ variant: "success", message: "Quote accepted" });
    }
  };

  const isPending = quoteData.customerApprovalStatus === "Pending";
  const canAct = role === "approver" && isPending;
  // Figma distinguishes the header badge wording per role while pending
  // ("Pending" for the approver, "Waiting Approval" for a viewer); once
  // resolved both roles see the same label, with "Approved" shown as
  // "Accepted" on this customer-facing surface only (the rest of the app
  // keeps one canonical "Approved" status vocabulary).
  const headerStatusLabel = isPending
    ? role === "viewer"
      ? "Waiting Approval"
      : "Pending"
    : quoteData.status === "Approved"
    ? "Accepted"
    : quoteData.status;
  const headerStatusVariant = isPending ? "yellow-light" : quoteData.sBadge || getStatusBadgeVariant(quoteData.status);

  const products = quoteData.products || [];

  return (
    <div
      ref={portalRootRef}
      style={{ minHeight: "100vh", background: "var(--neutral-background-primary, #F5F5F7)", overflowX: "hidden" }}
    >
      <PortalTopBar
        email={actingPic?.email || quoteData.customer?.email || "dev@mail.com"}
        role={role}
        onRoleChange={setRole}
        language={portalLanguage}
        onLanguageChange={setPortalLanguage}
      />

      {toast ? (
        <PortalToast variant={toast.variant} message={toast.message} onDismiss={() => setToast(null)} />
      ) : null}

      <div
        style={{
          maxWidth: "1080px",
          margin: "0 auto",
          padding: isMobile ? "16px 16px 100px 16px" : "24px 24px 100px 24px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
          QUOTE
        </h1>

        <div style={sectionCardStyle}>
          <div style={{ padding: "20px 24px", display: "flex", flexDirection: isMobile ? "column" : "row", justifyContent: "space-between", alignItems: isMobile ? "stretch" : "flex-start", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: "16px", minWidth: 0 }}>
              <div
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "var(--feature-brand-container, #E8F0FF)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Building2 size={26} color="var(--feature-brand-primary)" />
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                  {SELLER_COMPANY.name}
                </span>
                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.5 }}>
                  {SELLER_COMPANY.address}
                </span>
                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                  {SELLER_COMPANY.phone} | {SELLER_COMPANY.email}
                </span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: isMobile ? "flex-start" : "flex-end", gap: "8px", flexShrink: isMobile ? 1 : 0, minWidth: 0 }}>
              <span
                style={{
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                  whiteSpace: isMobile ? "normal" : "nowrap",
                  wordBreak: isMobile ? "break-word" : "normal",
                  textAlign: isMobile ? "left" : "right",
                }}
              >
                #{quoteData.quoteNo}
              </span>
              <StatusBadge variant={headerStatusVariant}>{headerStatusLabel}</StatusBadge>
            </div>
          </div>
          <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />
          <div style={{ padding: "20px 24px", display: "grid", gridTemplateColumns: labelGridColumns(4), gap: "24px" }}>
            <LabelValue label="Issued By" value={quoteData.createdBy || "-"} />
            <LabelValue label="Issued On" value={quoteData.createdAt || "-"} />
            <LabelValue label="Valid Until" value={quoteData.validUntil || "-"} />
            <LabelValue
              label="Down Payment"
              value={quoteData.downPaymentPercent != null ? `${quoteData.downPaymentPercent}%` : "-"}
            />
          </div>
        </div>

        <div style={sectionCardStyle}>
          {sectionTitle("Customer Information")}
          <div style={{ padding: "20px 24px 24px 24px", display: "grid", gridTemplateColumns: labelGridColumns(4), gap: "24px" }}>
            <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              {quoteData.customer?.name || quoteData.customerName || "-"}
            </span>
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
              {quoteData.customer?.phone || "-"}
              <span style={{ color: "var(--neutral-line-separator-2)", margin: "0 8px" }}>|</span>
              {quoteData.customer?.email || "-"}
            </span>
            <span style={{ gridColumn: isMobile ? "auto" : "3 / span 2", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
              {quoteData.customer?.address || "-"}
            </span>
          </div>

          <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />

          {sectionTitle("PIC Information")}
          <div
            style={{
              padding: "20px 24px 24px 24px",
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}
          >
            {(quoteData.pics || []).length === 0 ? (
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>No PIC added yet.</span>
            ) : (
              quoteData.pics.map((pic) => <PortalPicCard key={pic.id} pic={pic} />)
            )}
          </div>
        </div>

        <div style={sectionCardStyle}>
          {sectionTitle("Attachment")}
          <div style={{ padding: "20px 24px 24px 24px" }}>
            {(!quoteData.attachments || quoteData.attachments.length === 0) ? (
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>No attachments found.</span>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {quoteData.attachments.map((a, idx) => (
                  <span
                    key={idx}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "999px",
                      border: "1px solid var(--neutral-line-separator-1)",
                      fontSize: "var(--text-body)",
                    }}
                  >
                    {a.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={sectionCardStyle}>
          {sectionTitle("Product List")}
          <div style={{ padding: "20px 24px 24px 24px" }}>
            <QuoteProductTable products={products} currency={quoteData.currency} />
          </div>

          <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />

          <div style={{ padding: "20px 24px 24px 24px" }}>
            <QuoteTotalsSummary
              products={products}
              currency={quoteData.currency}
              taxRatePercent={quoteData.taxRatePercent}
              shippingFee={quoteData.shippingFee}
              otherFee={quoteData.otherFee}
            />
          </div>
        </div>

        <div style={sectionCardStyle}>
          {sectionTitle("Terms and Conditions")}
          <div style={{ padding: "20px 24px 24px 24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: labelGridColumns(4), gap: "24px" }}>
              <LabelValue label="Payment Terms" value={quoteData.terms?.paymentTerms || "-"} />
              <LabelValue label="Incoterms" value={quoteData.terms?.incoterms || "-"} />
              <LabelValue label="Shipping Method" value={quoteData.terms?.shippingMethod || "-"} />
              <LabelValue label="Estimated Delivery" value={quoteData.terms?.estimatedDelivery || "-"} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: labelGridColumns(4), gap: "24px" }}>
              <LabelValue
                label="Risk Level"
                value={quoteData.terms?.riskLevel || "-"}
                badge={
                  quoteData.terms?.riskLevel
                    ? { variant: RISK_BADGE_VARIANT[quoteData.terms.riskLevel] || "grey", text: quoteData.terms.riskLevel }
                    : undefined
                }
              />
              <LabelValue label="Dispute Resolution Method" value={quoteData.terms?.disputeResolutionMethod || "-"} />
            </div>
            {quoteData.terms?.forceMajeure ? (
              <LabelValue label="Force Majeure" value={quoteData.terms.forceMajeure} />
            ) : null}
            {quoteData.terms?.latePaymentPenalties ? (
              <LabelValue label="Late Payment Penalties" value={quoteData.terms.latePaymentPenalties} />
            ) : null}
            {quoteData.terms?.performanceGuarantees ? (
              <LabelValue label="Performance Guarantees" value={quoteData.terms.performanceGuarantees} />
            ) : null}
            {quoteData.terms?.governingLaw ? (
              <LabelValue label="Governing Law" value={quoteData.terms.governingLaw} />
            ) : null}
          </div>
        </div>

        {!canAct ? <PortalActionsLogTable actionLogs={quoteData.actionLogs || []} /> : null}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          padding: isMobile ? "12px 16px" : "16px 24px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: isMobile ? "8px" : "12px",
          rowGap: "8px",
          width: isMobile ? "100%" : "auto",
          boxSizing: "border-box",
          zIndex: 100,
        }}
      >
        <Button variant="outlined" size="medium" leftIcon={DownloadIcon} onClick={() => {}} style={isMobile ? { flex: 1 } : undefined}>
          Download
        </Button>
        {canAct ? (
          <>
            <Button variant="danger" size="medium" onClick={() => openDecisionModal("reject")} style={isMobile ? { flex: 1 } : undefined}>
              Reject Quote
            </Button>
            <Button variant="outlined" size="medium" onClick={() => openDecisionModal("revision")} style={isMobile ? { flex: 1 } : undefined}>
              Request Revision
            </Button>
            <Button variant="filled" size="medium" onClick={handleAcceptClick} style={isMobile ? { flex: 1 } : undefined}>
              Accept Quote
            </Button>
          </>
        ) : null}
      </div>

      {canAct ? (
        <PortalSimulateScreeningPanel
          customer={linkedCustomer}
          armedScenario={armedScenario}
          onToggleScenario={handleToggleScenario}
          onReset={handleResetScenario}
          // Lift clear of the fixed action footer, which is always present
          // whenever this panel renders (both gated on `canAct`).
          // On mobile the footer wraps its 4 buttons onto two rows, so it's
          // taller than the desktop single-row footer this offset was tuned
          // for — lift the Simulate trigger clear of that extra row.
          bottomOffset={isMobile ? 156 : 88}
        />
      ) : null}

      <QuoteDecisionModal
        isOpen={isDecisionModalOpen}
        onClose={closeDecisionModal}
        meta={getDecisionMeta()}
        comment={decisionComment}
        onCommentChange={(e) => {
          setDecisionComment(e.target.value);
          if (decisionError) setDecisionError("");
        }}
        error={decisionError}
        onSubmit={handleSubmitDecision}
      />

      <GeneralModal
        isOpen={isScreeningBlockedOpen}
        onClose={() => setIsScreeningBlockedOpen(false)}
        title="Unable to Accept Quote"
        description={SCREENING_BLOCKED_MESSAGE}
        width="440px"
        hideFooterDivider
        footerPaddingTop={24}
        footer={
          <Button variant="filled" size="large" style={{ width: "100%" }} onClick={() => setIsScreeningBlockedOpen(false)}>
            Understood
          </Button>
        }
      />

      <GeneralModal isOpen={isAcceptProcessing} onClose={() => {}} width="400px">
        {/* No title/description props on purpose: GeneralModal only renders
            its close "X" alongside a header, so leaving them off keeps this
            modal non-dismissible while the (simulated) acceptance is
            processing — mirrors QuoteDetailPage's Customer Action → Approve
            loading modal. */}
        <style>{`@keyframes portalAcceptSpin { to { transform: rotate(360deg); } }`}</style>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "16px",
            padding: "12px 8px 4px 8px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              border: "3px solid var(--neutral-line-separator-1)",
              borderTopColor: "var(--feature-brand-primary)",
              animation: "portalAcceptSpin 0.8s linear infinite",
            }}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "var(--text-title-1)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Accepting your quote
            </span>
            <span
              style={{
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-secondary)",
                lineHeight: 1.6,
              }}
            >
              This may take a moment. Please keep this page open.
            </span>
          </div>
        </div>
      </GeneralModal>
    </div>
  );
};
