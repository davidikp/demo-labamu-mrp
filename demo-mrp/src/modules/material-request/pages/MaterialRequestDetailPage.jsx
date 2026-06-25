import React, { useState } from "react";
import { ChevronLeftIcon, Info } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { Tooltip } from "../../../components/common/Tooltip.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { MaterialPreparationDrawer } from "../components/MaterialPreparationDrawer.jsx";
import {
  getRequest,
  getRequests,
  applyPreparation,
  setRequestStatus,
  REQUEST_STATUS_META,
  ROW_STATUS_META,
} from "../mock/materialRequestMocks.js";

const QTY_TOOLTIPS = {
  requested: "The quantity of material submitted by production",
  fulfillable: "The quantity allocated based on current stock availability",
  shortage: "Unfulfilled quantity due to insufficient stock",
};

const COLS = "48px 1fr 2.2fr 1.2fr 1.4fr 1.2fr 1.3fr";

const tabButtonStyle = (isActive) => ({
  height: "44px",
  padding: "0 24px",
  borderRadius: "100px",
  border: isActive ? "1px solid var(--feature-brand-primary)" : "1px solid transparent",
  background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
  color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
  fontSize: "var(--text-title-2)",
  fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
  cursor: "pointer",
  transition: "all 0.18s ease",
  whiteSpace: "nowrap",
});

const headerCell = (overrides = {}) => ({
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  ...overrides,
});

const bodyCell = (overrides = {}) => ({
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  padding: "16px 12px",
  display: "flex",
  flexDirection: "column",
  justifyContent: "flex-start",
  gap: "4px",
  ...overrides,
});

const InfoLabel = ({ label, tooltip }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
    {label}
    <Tooltip content={tooltip}>
      <Info size={14} color="var(--neutral-on-surface-tertiary)" />
    </Tooltip>
  </span>
);

const InfoField = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
      {label}
    </span>
    <span style={{ fontSize: "var(--text-title-2)", color: "var(--neutral-on-surface-primary)" }}>
      {value}
    </span>
  </div>
);

export const MaterialRequestDetailPage = ({ onNavigate, initialData, requestId, showSnackbar }) => {
  const resolved =
    (initialData && initialData.items ? initialData : null) ||
    getRequest(initialData?.id || requestId) ||
    null;

  const [request, setRequest] = useState(resolved);
  const [activeTab, setActiveTab] = useState("requested_material");
  const [isPrepDrawerOpen, setIsPrepDrawerOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  if (!request) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ color: "var(--neutral-on-surface-tertiary)" }}>Request not found.</p>
        <Button onClick={() => onNavigate("list")}>Back to Material Request</Button>
      </div>
    );
  }

  const statusMeta = REQUEST_STATUS_META[request.status] || REQUEST_STATUS_META.new_request;
  const isNewRequest = request.status === "new_request";

  // Other requests sharing the same work order.
  const relatedRequests = getRequests().filter(
    (r) => r.workOrderNo === request.workOrderNo && r.id !== request.id
  );

  const handleStartPreparing = (preparedItems) => {
    const updated = applyPreparation(request.id, preparedItems);
    setRequest({ ...updated });
    setIsPrepDrawerOpen(false);
    showSnackbar("Status successfully changed to Preparing", "success");
  };

  const handleConfirmTransfer = () => {
    const updated = setRequestStatus(
      request.id,
      "transferring",
      "Status changed to Transferring"
    );
    setRequest({ ...updated });
    setIsTransferModalOpen(false);
    showSnackbar("Request successfully confirmed", "success");
  };

  const handleConfirmCancel = () => {
    const updated = setRequestStatus(request.id, "canceled", "Request Canceled");
    setRequest({ ...updated });
    setIsCancelModalOpen(false);
    showSnackbar("Request successfully canceled", "success");
  };

  const renderRequestedMaterialTable = () => (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        border: "1px solid var(--neutral-line-separator-1)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
      }}
    >
      <div style={{ padding: "20px 24px 8px" }}>
        <h3 style={{ margin: 0, fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
          Requested Material
        </h3>
      </div>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: "880px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: COLS,
              height: "48px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
            }}
          >
            <div style={headerCell()}>No</div>
            <div style={headerCell()}>Type</div>
            <div style={headerCell()}>Material</div>
            <div style={headerCell()}>
              <InfoLabel label="Requested Qty" tooltip={QTY_TOOLTIPS.requested} />
            </div>
            <div style={headerCell()}>
              <InfoLabel label="Fulfillable Qty" tooltip={QTY_TOOLTIPS.fulfillable} />
            </div>
            <div style={headerCell()}>
              <InfoLabel label="Shortage Qty" tooltip={QTY_TOOLTIPS.shortage} />
            </div>
            <div style={headerCell()}>Status</div>
          </div>

          {request.items.map((item, idx) => {
            const alloc = isNewRequest ? null : item.allocation;
            const rowMeta =
              ROW_STATUS_META[alloc?.rowStatusKey] || ROW_STATUS_META.not_started;
            const hasFulfillable = alloc && alloc.fulfillableQty > 0;
            return (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: COLS,
                  borderBottom:
                    idx < request.items.length - 1
                      ? "1px solid var(--neutral-line-separator-1)"
                      : "none",
                }}
              >
                <div style={bodyCell({ color: "var(--neutral-on-surface-secondary)" })}>
                  {idx + 1}
                </div>
                <div style={bodyCell()}>
                  <StatusBadge
                    variant={item.type === "BOM" ? "blue-light" : "grey-light"}
                    style={{ alignSelf: "flex-start" }}
                  >
                    {item.type}
                  </StatusBadge>
                </div>
                <div style={bodyCell()}>
                  <span style={{ fontWeight: "var(--font-weight-semi-bold)" }}>{item.name}</span>
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {item.sku}
                  </span>
                </div>
                <div style={bodyCell()}>
                  <span>
                    {item.requestedQty} {item.unit}
                  </span>
                  {(item.exceedingReason || item.requestReason) && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      <div>
                        <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                          {item.exceedingReason ? "Exceeding Reason: " : "Request Reason: "}
                        </span>
                        {item.exceedingReason || item.requestReason}
                      </div>
                      {(item.exceedingNotes || item.requestNotes) && (
                        <div style={{ marginTop: "2px" }}>
                          <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                            Notes:{" "}
                          </span>
                          {item.exceedingNotes || item.requestNotes}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <div style={bodyCell()}>
                  {!alloc || !hasFulfillable ? (
                    <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>-</span>
                  ) : (
                    <>
                      <span style={{ color: "var(--status-green-primary)" }}>
                        {alloc.fulfillableQty} {item.unit}
                      </span>
                      {alloc.batches?.map((b) => (
                        <span
                          key={b.batch}
                          style={{
                            fontSize: "var(--text-body)",
                            color: "var(--neutral-on-surface-secondary)",
                          }}
                        >
                          {b.batch}:{" "}
                          <b style={{ color: "var(--neutral-on-surface-primary)" }}>
                            {b.qty} {item.unit}
                          </b>
                        </span>
                      ))}
                    </>
                  )}
                  {alloc?.reason && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      <span style={{ fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                        Shortage Reason:{" "}
                      </span>
                      {alloc.reason}
                    </div>
                  )}
                </div>
                <div style={bodyCell()}>
                  {!alloc || alloc.shortageQty <= 0 ? (
                    <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>-</span>
                  ) : (
                    <span style={{ color: "var(--status-red-primary)" }}>
                      {alloc.shortageQty} {item.unit}
                    </span>
                  )}
                </div>
                <div style={bodyCell()}>
                  <StatusBadge variant={`${rowMeta.badge}-light`} style={{ alignSelf: "flex-start" }}>
                    {rowMeta.label}
                  </StatusBadge>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderRelatedRequest = () => (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        border: "1px solid var(--neutral-line-separator-1)",
        borderRadius: "var(--radius-card)",
        overflow: "hidden",
      }}
    >
      {relatedRequests.length === 0 ? (
        <div
          style={{
            padding: "48px",
            textAlign: "center",
            color: "var(--neutral-on-surface-tertiary)",
            fontSize: "var(--text-title-3)",
          }}
        >
          No related requests for this work order.
        </div>
      ) : (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1.2fr 1.4fr 1fr",
              height: "48px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
            }}
          >
            <div style={headerCell()}>Request ID</div>
            <div style={headerCell()}>Requested By</div>
            <div style={headerCell()}>Requested Date</div>
            <div style={headerCell()}>Status</div>
          </div>
          {relatedRequests.map((r, idx) => {
            const meta = REQUEST_STATUS_META[r.status];
            return (
              <div
                key={r.id}
                onClick={() => onNavigate("detail", r)}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.2fr 1.2fr 1.4fr 1fr",
                  borderBottom:
                    idx < relatedRequests.length - 1
                      ? "1px solid var(--neutral-line-separator-1)"
                      : "none",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <div style={bodyCell({ color: "var(--feature-brand-primary)" })}>{r.requestId}</div>
                <div style={bodyCell()}>{r.requestedBy}</div>
                <div style={bodyCell()}>{r.requestedDate}</div>
                <div style={bodyCell()}>
                  <StatusBadge variant={meta?.badge || "grey"} style={{ alignSelf: "flex-start" }}>
                    {meta?.label}
                  </StatusBadge>
                </div>
              </div>
            );
          })}
        </>
      )}
    </div>
  );

  const renderLogs = () => (
    <div
      style={{
        background: "var(--neutral-surface-primary)",
        border: "1px solid var(--neutral-line-separator-1)",
        borderRadius: "var(--radius-card)",
        padding: "24px",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        {request.logs.map((log, idx) => {
          const meta = REQUEST_STATUS_META[log.statusKey] || REQUEST_STATUS_META.new_request;
          const isLast = idx === request.logs.length - 1;
          return (
            <div key={idx} style={{ display: "flex", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <span
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: "var(--feature-brand-primary)",
                    marginTop: "4px",
                    flexShrink: 0,
                  }}
                />
                {!isLast && (
                  <span
                    style={{
                      width: "2px",
                      flex: 1,
                      minHeight: "32px",
                      background: "var(--neutral-line-separator-2)",
                    }}
                  />
                )}
              </div>
              <div style={{ paddingBottom: isLast ? 0 : "24px", display: "flex", flexDirection: "column", gap: "4px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)" }}>
                    {log.title}
                  </span>
                  <StatusBadge variant={`${meta.badge}-light`}>{meta.label}</StatusBadge>
                </div>
                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
                  {log.by} • {log.timestamp}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const hasFooter = isNewRequest || request.status === "preparing";

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", gap: "8px", flexShrink: 0 }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={() => onNavigate("list")}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)" }}>
              Request Detail
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
              Material Request
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Request Detail</span>
          </div>
        </div>

        {/* Request Information */}
        <div
          style={{
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "var(--radius-card)",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ margin: 0, fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)" }}>
              {request.id}
            </h2>
            <StatusBadge variant={statusMeta.badge}>{statusMeta.label}</StatusBadge>
          </div>
          <div style={{ height: "1px", background: "var(--neutral-line-separator-1)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px" }}>
            <InfoField label="Work Order" value={request.workOrderNo} />
            <InfoField label="Requested By" value={request.requestedBy} />
            <InfoField label="Requested Date" value={request.requestedDate} />
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexShrink: 0 }}>
          <button type="button" style={tabButtonStyle(activeTab === "requested_material")} onClick={() => setActiveTab("requested_material")}>
            Requested Material
          </button>
          <button type="button" style={tabButtonStyle(activeTab === "related_request")} onClick={() => setActiveTab("related_request")}>
            Related Request
          </button>
          <button type="button" style={tabButtonStyle(activeTab === "logs")} onClick={() => setActiveTab("logs")}>
            Logs
          </button>
        </div>

        {/* Tab content */}
        <div style={{ flexShrink: 0 }}>
          {activeTab === "requested_material" && renderRequestedMaterialTable()}
          {activeTab === "related_request" && renderRelatedRequest()}
          {activeTab === "logs" && renderLogs()}
        </div>
      </div>

      {/* Footer */}
      {hasFooter && (
        <div
          style={{
            flexShrink: 0,
            padding: "16px 24px",
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            boxShadow: "var(--elevation-sticky)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {isNewRequest && (
            <Button variant="danger" size="lg" onClick={() => setIsCancelModalOpen(true)}>
              Cancel Request
            </Button>
          )}
          {isNewRequest ? (
            <Button size="lg" onClick={() => setIsPrepDrawerOpen(true)}>
              Start Preparation
            </Button>
          ) : (
            <Button size="lg" onClick={() => setIsTransferModalOpen(true)}>
              Start Transfer
            </Button>
          )}
        </div>
      )}

      {/* Preparation drawer */}
      <MaterialPreparationDrawer
        isOpen={isPrepDrawerOpen}
        onClose={() => setIsPrepDrawerOpen(false)}
        items={request.items}
        onConfirm={handleStartPreparing}
      />

      {/* Start Transfer confirmation */}
      <GeneralModal
        isOpen={isTransferModalOpen}
        onClose={() => setIsTransferModalOpen(false)}
        title="Start Transferring?"
        description="The requestor will need to confirm once they have received the allocated materials"
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button size="lg" onClick={handleConfirmTransfer} style={{ width: "100%" }}>
              Yes, Transfer
            </Button>
            <Button variant="outlined" size="lg" onClick={() => setIsTransferModalOpen(false)} style={{ width: "100%" }}>
              Cancel
            </Button>
          </div>
        }
      />

      {/* Cancel Request confirmation */}
      <GeneralModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        title="Cancel Request?"
        description="This will cancel the material request. This action cannot be undone."
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button variant="danger-filled" size="lg" onClick={handleConfirmCancel} style={{ width: "100%" }}>
              Yes, Cancel Request
            </Button>
            <Button variant="outlined" size="lg" onClick={() => setIsCancelModalOpen(false)} style={{ width: "100%" }}>
              Back
            </Button>
          </div>
        }
      />
    </div>
  );
};
