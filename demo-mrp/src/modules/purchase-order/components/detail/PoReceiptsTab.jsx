import React from "react";
import {
  Info,
  ImageAssetIcon,
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
                      "70px minmax(200px, 1.5fr) minmax(200px, 2.5fr) 100px 100px 100px 100px 110px",
                      "8px"
                    )}
                  >
                    <div style={poReferenceTableHeaderCellStyle()}>Type</div>
                    <div style={poReferenceTableHeaderCellStyle()}>Item</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Description
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>WO Ref</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Ordered Qty
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Received Qty
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Remaining Qty
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
                        "70px minmax(200px, 1.5fr) minmax(200px, 2.5fr) 100px 100px 100px 100px 110px",
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
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={displayValue(line.item)}
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
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                            title={displayValue(line.code)}
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
                        <Tooltip
                          content={line.desc}
                          style={{ display: "block", width: "100%" }}
                          checkTruncation={true}
                        >
                          <span
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              lineHeight: "1.4",
                              wordBreak: "break-word",
                            }}
                          >
                            {displayValue(line.desc)}
                          </span>
                        </Tooltip>
                      </div>
                      <div style={poReferenceTableCellStyle({ minWidth: 0 })}>
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
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
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
                          title={displayValue(line.woRef)}
                        >
                          {displayValue(line.woRef)}
                        </span>
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        {line.orderedQty}
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        {line.receivedQty}
                      </div>
                      <div style={poReferenceTableCellStyle()}>
                        {remainingQty}
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
                      "1.2fr 1fr 1.4fr 1fr 1.3fr 1.1fr 1.4fr 1.6fr",
                      "8px"
                    )}
                  >
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receipt Date & Time
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Receipt Number
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Item Name
                    </div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      SKU / Code
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
                        "1.2fr 1fr 1.4fr 1fr 1.3fr 1.1fr 1.4fr 1.6fr",
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
