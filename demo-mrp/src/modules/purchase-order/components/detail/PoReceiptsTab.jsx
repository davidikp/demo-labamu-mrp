import React from "react";
import {
  Info,
  ImageAssetIcon,
  HelpCircle,
} from "../../../../components/icons/Icons.jsx";
import {
  MOCK_WO_TABLE_DATA,
} from "../../../../modules/work-order/mock/workOrderMocks.js";
import {
  MOCK_MATERIALS_DATA,
} from "../../../../modules/materials/mock/materialsMocks.js";
import {
  getImageUploadPreviewUrl,
  normalizeProofDocuments,
} from "../../../../utils/upload/uploadUtils.js";
import {
  inputFrameStyle,
  inputControlStyle,
  focusInputFrame,
  blurInputFrame,
} from "../../../purchase-order/styles/purchaseOrderInputStyles.js";
import {
  Button,
  StatusBadge,
  Tooltip,
  ProofDocumentList,
  poReferenceTableFrameStyle,
  poReferenceTableScrollerStyle,
  poReferenceTableInnerStyle,
  poReferenceTableHeaderRowStyle,
  poReferenceTableRowStyle,
  poReferenceTableHeaderCellStyle,
  poReferenceTableCellStyle,
} from "./shared/PoDetailSharedComponents.jsx";

const PoReceiptsTab = ({
  // Data
  receiptLines,
  receiptErrors,
  groupedReceiptLogs,
  canConfirmReceipt,
  initialData,
  // Handlers
  handleReceiptConfirmClick,
  updateReceiptLine,
  onNavigate,
  showToast,
  // Helpers
  displayValue,
}) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px 24px 0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Receipt
          </span>
          <Button
            variant="filled"
            onClick={handleReceiptConfirmClick}
            disabled={!canConfirmReceipt}
          >
            Confirm Receipt
          </Button>
        </div>
        <div
          style={{
            padding: "20px 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {!canConfirmReceipt ? (
            <div
              style={{
                marginBottom: "16px",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
                padding: "12px 16px",
                borderRadius: "12px",
                background: "var(--feature-brand-container-lighter)",
                border: "1px solid var(--feature-brand-container-darker)",
              }}
            >
              <Info
                size={16}
                strokeWidth={2.1}
                color="var(--feature-brand-primary)"
                style={{ flexShrink: 0, marginTop: "2px" }}
              />
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  color: "var(--feature-brand-primary)",
                  lineHeight: "1.5",
                }}
              >
                Receipt confirmation is only available when the purchase order
                status is Issued.
              </span>
            </div>
          ) : null}
          {receiptErrors._global ? (
            <span
              style={{
                marginBottom: "16px",
                fontSize: "var(--text-body)",
                color: "var(--status-red-primary)",
              }}
            >
              {receiptErrors._global}
            </span>
          ) : null}
          <div style={poReferenceTableFrameStyle}>
            <div
              style={{
                ...poReferenceTableScrollerStyle,
                overflowX: receiptLines.length > 0 ? "auto" : "hidden",
              }}
            >
              <div style={poReferenceTableInnerStyle("100%")}>
                {receiptLines.length > 0 && (
                  <div
                    style={poReferenceTableHeaderRowStyle(
                      "80px minmax(160px, 1.4fr) minmax(180px, 1.8fr) minmax(160px, 1.5fr) minmax(150px, 1.3fr) 85px",
                      "8px"
                    )}
                  >
                    <div style={poReferenceTableHeaderCellStyle()}>Type</div>
                    <div style={poReferenceTableHeaderCellStyle()}>Item</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Description
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>WO Ref & Assignment</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receipt Progress
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receive Now
                    </div>
                  </div>
                )}
                {receiptLines.map((line, idx) => {
                  const remainingQty = Math.max(
                    line.orderedQty - line.receivedQty,
                    0
                  );
                  const lineTypeLabel =
                    line.type === "wo"
                      ? "WO"
                      : line.type === "material"
                      ? "Material"
                      : "Manual";
                  const lineTypeVariant =
                    line.type === "wo"
                      ? "blue-light"
                      : line.type === "material"
                      ? "yellow-light"
                      : "grey-light";
                  return (
                    <div
                      key={line.id}
                      style={poReferenceTableRowStyle(
                        "80px minmax(160px, 1.4fr) minmax(180px, 1.8fr) minmax(160px, 1.5fr) minmax(150px, 1.3fr) 85px",
                        idx === receiptLines.length - 1,
                        { minHeight: "64px", gap: "8px" }
                      )}
                    >
                      <div style={poReferenceTableCellStyle()}>
                        <StatusBadge variant={lineTypeVariant}>
                          {lineTypeLabel}
                        </StatusBadge>
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          minWidth: 0,
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "8px 0",
                        })}
                      >
                        <div
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "8px",
                            background: "var(--neutral-surface-grey-lighter)",
                            border: "1px solid var(--neutral-line-separator-1)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                            overflow: "hidden",
                          }}
                        >
                          {line.image && getImageUploadPreviewUrl(line.image) ? (
                            <img
                              src={getImageUploadPreviewUrl(line.image)}
                              alt={line.item}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <ImageAssetIcon
                              size={20}
                              color="var(--neutral-on-surface-tertiary)"
                            />
                          )}
                        </div>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "2px",
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              fontWeight: "var(--font-weight-bold)",
                              color: "var(--neutral-on-surface-primary)",
                              wordBreak: "break-word",
                            }}
                          >
                            {displayValue(line.item)}
                          </span>
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              color:
                                line.type === "manual"
                                  ? "var(--neutral-on-surface-secondary)"
                                  : "var(--feature-brand-primary)",
                              textDecoration:
                                line.type === "manual" ? "none" : "underline",
                              cursor:
                                line.type === "manual" ? "default" : "pointer",
                              wordBreak: "break-word",
                            }}
                            onClick={() => {
                              if (line.type === "manual") return;
                              const materialData =
                                MOCK_MATERIALS_DATA.find(
                                  (m) => m.sku === line.code
                                ) || {
                                  id: `mock-${line.code}`,
                                  name: line.item,
                                  sku: line.code,
                                  description: line.desc || "-",
                                  category: line.type === 'wo' ? "Work Order" : "Raw Material",
                                  status: "Active",
                                  type: line.type === 'wo' ? "Component" : "Raw",
                                  unit: "Pcs",
                                  onHandStock: 0,
                                  averageCost: line.price || 0
                                };
                              onNavigate("materials_detail", {
                                ...materialData,
                                from: "purchase_order_detail",
                                returnTo: {
                                  view: "purchase_order_detail",
                                  data: initialData,
                                },
                              });
                            }}
                          >
                            {displayValue(line.code)}
                          </span>
                        </div>
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          minWidth: 0,
                          color: "var(--neutral-on-surface-secondary)",
                        })}
                      >
                          <span
                            style={{
                              display: "block",
                              fontSize: "var(--text-title-3)",
                              color: "var(--neutral-on-surface-secondary)",
                              lineHeight: "1.4",
                              wordBreak: "break-word",
                              whiteSpace: "pre-wrap"
                            }}
                          >
                            {displayValue(line.desc)}
                          </span>
                      </div>
                      <div style={poReferenceTableCellStyle({ minWidth: 0, padding: "12px 0", flexDirection: "column", alignItems: "flex-start", gap: "4px" })}>
                        <span
                          onClick={() => {
                            if (!line.woRef || line.woRef === "-") return;
                            const woData = MOCK_WO_TABLE_DATA.find(
                              (w) => w.wo === line.woRef
                            );
                            if (woData) {
                              onNavigate("work_order_detail", {
                                ...woData,
                                from: "purchase_order_detail",
                                returnTo: {
                                  view: "detail",
                                  data: initialData,
                                },
                              });
                            }
                          }}
                          style={{
                            display: "block",
                            width: "100%",
                            whiteSpace: "normal",
                            wordBreak: "break-all",
                            color:
                              line.woRef && line.woRef !== "-"
                                ? "var(--feature-brand-primary)"
                                : "inherit",
                            textDecoration:
                              line.woRef && line.woRef !== "-"
                                ? "underline"
                                : "none",
                            cursor:
                              line.woRef && line.woRef !== "-"
                                ? "pointer"
                                : "default",
                          }}
                        >
                          {displayValue(line.woRef)}
                        </span>
                        {line.assignmentId && line.assignmentId !== "-" && (
                          <div style={{ marginTop: "4px", width: "100%", lineHeight: "1.4" }}>
                            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", whiteSpace: "normal", wordBreak: "break-word" }}>
                              Assignment: <span style={{ color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}>{line.assignmentId}</span>
                            </span>
                            {line.outsourceSteps && line.outsourceSteps.length > 0 && (
                              <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px", verticalAlign: "-2px" }}>
                              <Tooltip 
                                content={
                                  <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                                    {line.outsourceSteps.map(step => {
                                      const woData = MOCK_WO_TABLE_DATA.find(w => w.wo === line.woRef);
                                      const stage = woData?.routingStages?.find(s => s.step === step);
                                      return <div key={step}>Step {step}: {stage ? `${stage.route} - ${stage.op}` : "Unknown Stage"}</div>;
                                    })}
                                  </div>
                                } 
                                position="top"
                              >
                                <div style={{ display: "flex", alignItems: "center" }}>
                                  <HelpCircle size={14} color="var(--neutral-on-surface-tertiary)" style={{ cursor: "pointer" }} />
                                </div>
                              </Tooltip>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div style={poReferenceTableCellStyle({ minWidth: 0, paddingRight: "16px" })}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "6px", width: "100%" }}>
                          <div
                            style={{
                              height: "6px",
                              background: "var(--neutral-surface-grey-lighter)",
                              borderRadius: "3px",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                height: "100%",
                                background: "var(--status-green-primary)",
                                width: `${Math.min(100, (((line.receivedQty || 0) / (line.orderedQty || 1)) * 100))}%`,
                                transition: "width 0.3s ease",
                                borderRadius: "3px",
                              }}
                            />
                          </div>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              color: "var(--neutral-on-surface-tertiary)",
                              width: "100%",
                            }}
                          >
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
                              <span style={{ fontSize: "10px" }}>Received</span>
                              <span style={{ color: "var(--status-green-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{line.receivedQty || 0}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "center", flex: 1 }}>
                              <span style={{ fontSize: "10px" }}>Remaining</span>
                              <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{remainingQty}</span>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "2px", alignItems: "flex-end", flex: 1 }}>
                              <span style={{ fontSize: "10px" }}>Ordered</span>
                              <span style={{ color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-bold)", fontSize: "11px" }}>{line.orderedQty || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                            width: "100%",
                            padding: "9px 0",
                          }}
                        >
                          <input
                            type="number"
                            min="0"
                            placeholder="0"
                            value={line.receiveNow}
                            onChange={(e) =>
                              updateReceiptLine(line.id, e.target.value)
                            }
                            style={{
                              height: "46px",
                              border: "1px solid transparent",
                              background:
                                remainingQty === 0 || !canConfirmReceipt
                                  ? "var(--neutral-surface-grey-lighter)"
                                  : "var(--neutral-surface-primary)",
                              ...inputFrameStyle(
                                remainingQty === 0 || !canConfirmReceipt,
                                !!receiptErrors[line.id]
                              ),
                              ...inputControlStyle(
                                remainingQty === 0 || !canConfirmReceipt,
                                !!line.receiveNow
                              ),
                              padding: "0 14px",
                              cursor: !canConfirmReceipt
                                ? "not-allowed"
                                : "text",
                            }}
                            disabled={remainingQty === 0 || !canConfirmReceipt}
                            onFocus={(e) => focusInputFrame(e.currentTarget)}
                            onBlur={(e) =>
                              blurInputFrame(
                                e.currentTarget,
                                remainingQty === 0 || !canConfirmReceipt,
                                !!receiptErrors[line.id]
                              )
                            }
                          />
                          {receiptErrors[line.id] ? (
                            <span
                              style={{
                                fontSize: "var(--text-body)",
                                color: "var(--status-red-primary)",
                              }}
                            >
                              {receiptErrors[line.id]}
                            </span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {receiptLines.length === 0 && (
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
                    No purchase order lines added.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "24px 24px 0 24px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Receipt Logs
          </span>
        </div>
        <div
          style={{
            padding: "20px 24px 24px 24px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={poReferenceTableFrameStyle}>
            <div style={poReferenceTableScrollerStyle}>
              <div
                style={poReferenceTableInnerStyle(
                  groupedReceiptLogs.length > 0 ? "1400px" : "100%"
                )}
              >
                {groupedReceiptLogs.length > 0 && (
                  <div
                    style={poReferenceTableHeaderRowStyle(
                      "1.2fr 1fr 1.4fr 1fr 1.2fr 1.2fr 0.9fr 1.1fr 1.4fr 1.6fr",
                      "8px"
                    )}
                  >
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receipt Date & Time
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receipt No
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Item Name
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      SKU / Code
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      WO Ref
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Assignment ID
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Received Qty
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Received By
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>Notes</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Proof Document
                    </div>
                  </div>
                )}
                {groupedReceiptLogs.length > 0 ? (
                  groupedReceiptLogs.map((log, idx) => (
                    <div
                      key={log.id}
                      style={poReferenceTableRowStyle(
                        "1.2fr 1fr 1.4fr 1fr 1.2fr 1.2fr 0.9fr 1.1fr 1.4fr 1.6fr",
                        idx === groupedReceiptLogs.length - 1,
                        { alignItems: "start", gap: "8px" }
                      )}
                    >
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        {log.date} · {log.time}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        {log.receiptNumber || "-"}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => (
                          <span
                            key={`${log.id}-item-${item.id || itemIndex}`}
                            style={{
                              fontSize: "var(--text-title-3)",
                              lineHeight: "20px",
                              letterSpacing: "0.09625px",
                              fontWeight: "var(--font-weight-bold)",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {item.item || "-"}
                          </span>
                        ))}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => (
                          <span
                            key={`${log.id}-code-${item.id || itemIndex}`}
                            style={{
                              fontSize: "var(--text-title-3)",
                              lineHeight: "20px",
                              letterSpacing: "0.09625px",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {item.code || "-"}
                          </span>
                        ))}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => {
                          const rLine = receiptLines.find(l => l.code === item.code && l.item === item.item) || {};
                          const woRef = item.woRef || rLine.woRef || "-";
                          return (
                            <div
                              key={`${log.id}-woref-${item.id || itemIndex}`}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                minHeight: "20px",
                              }}
                            >
                              <span
                                onClick={() => {
                                  if (woRef === "-") return;
                                  const woData = MOCK_WO_TABLE_DATA.find(
                                    (w) => w.wo === woRef
                                  );
                                  if (woData) {
                                    onNavigate("work_order_detail", {
                                      ...woData,
                                      from: "purchase_order_detail",
                                      returnTo: {
                                        view: "detail",
                                        data: initialData,
                                      },
                                    });
                                  }
                                }}
                                style={{
                                  fontSize: "var(--text-title-3)",
                                  lineHeight: "20px",
                                  color: woRef !== "-" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                                  textDecoration: woRef !== "-" ? "underline" : "none",
                                  cursor: woRef !== "-" ? "pointer" : "default",
                                  wordBreak: "break-word",
                                }}
                              >
                                {woRef}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => {
                          const rLine = receiptLines.find(l => l.code === item.code && l.item === item.item) || {};
                          const assignmentId = item.assignmentId || rLine.assignmentId || "-";
                          const outsourceSteps = item.outsourceSteps || rLine.outsourceSteps || [];
                          const woRef = item.woRef || rLine.woRef || "-";
                          return (
                            <div
                              key={`${log.id}-assign-${item.id || itemIndex}`}
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "4px",
                                minHeight: "20px",
                              }}
                            >
                              {assignmentId !== "-" ? (
                                <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)", lineHeight: "20px" }}>
                                  <span style={{ color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}>{assignmentId}</span>
                                  {outsourceSteps.length > 0 && (
                                    <span style={{ display: "inline-flex", alignItems: "center", marginLeft: "4px", verticalAlign: "-2px" }}>
                                      <Tooltip 
                                        content={
                                          <div style={{ display: "flex", flexDirection: "column", gap: "4px", textAlign: "left" }}>
                                            {outsourceSteps.map(step => {
                                              const woData = MOCK_WO_TABLE_DATA.find(w => w.wo === woRef);
                                              const stage = woData?.routingStages?.find(s => s.step === step);
                                              return <div key={step}>Step {step}: {stage ? `${stage.route} - ${stage.op}` : "Unknown Stage"}</div>;
                                            })}
                                          </div>
                                        } 
                                        position="top"
                                      >
                                        <div style={{ display: "flex", alignItems: "center" }}>
                                          <HelpCircle size={14} color="var(--neutral-on-surface-tertiary)" style={{ cursor: "pointer" }} />
                                        </div>
                                      </Tooltip>
                                    </span>
                                  )}
                                </span>
                              ) : (
                                <span style={{ fontSize: "var(--text-title-3)", lineHeight: "20px" }}>-</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          flexDirection: "column",
                          gap: "10px",
                        })}
                      >
                        {(log.items || []).map((item, itemIndex) => (
                          <span
                            key={`${log.id}-qty-${item.id || itemIndex}`}
                            style={{
                              fontSize: "var(--text-title-3)",
                              lineHeight: "20px",
                              letterSpacing: "0.09625px",
                              color: "var(--neutral-on-surface-primary)",
                            }}
                          >
                            {item.receivedNow || 0} pcs
                          </span>
                        ))}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        {log.receivedBy || "-"}
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                          width: "100%",
                          overflow: "hidden",
                        })}
                      >
                        <Tooltip
                          content={log.notes || "-"}
                          position="top"
                          style={{ display: "block", width: "100%" }}
                          checkTruncation={true}
                        >
                          <span
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              fontSize: "var(--text-title-3)",
                              color: "var(--neutral-on-surface-primary)",
                              lineHeight: "1.4",
                              wordBreak: "break-word",
                            }}
                          >
                            {log.notes || "-"}
                          </span>
                        </Tooltip>
                      </div>
                      <div
                        style={poReferenceTableCellStyle({
                          alignItems: "flex-start",
                          padding: "12px 0",
                        })}
                      >
                        <ProofDocumentList
                          documents={
                            log.proofDocuments ||
                            log.attachments ||
                            normalizeProofDocuments([], log.proof)
                          }
                        onDocumentClick={(doc) => {
                          showToast(`${doc?.name || "Document"} opened`);
                        }}
                        />
                      </div>
                    </div>
                  ))
                ) : (
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
                    No receipt history yet.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PoReceiptsTab;
