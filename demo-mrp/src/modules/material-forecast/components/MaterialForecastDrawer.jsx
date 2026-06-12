import React, { useState, useEffect } from "react";
import { CloseIcon, ChevronDownIcon, ChevronRightIcon, Info } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { MOCK_PROCUREMENT_STATUS } from "../mock/materialForecastMocks.js";

// ── Date helpers ───────────────────────────────────────────────────────────────

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];

const getMondayOfCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const getISOWeekNumber = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d - week1) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

const fmtShort = (d) => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
const fmtHeader = (d) => `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()}`;

const getWeekDates = (weekOffset) => {
  const monday = getMondayOfCurrentWeek();
  monday.setDate(monday.getDate() + (weekOffset || 0) * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
};

const computeDailyData = (demand, endStock, workOrders, purchaseOrders) => {
  // Build daily demand map from WOs (keyed by day offset)
  const dailyDemand = Array(7).fill(0);
  if (workOrders && workOrders.length > 0) {
    workOrders.forEach(wo => {
      const d = wo.estimatedStartDayOffset;
      if (d >= 0 && d < 7) dailyDemand[d] += (wo.qty || 0);
    });
  } else {
    const total = parseInt(demand, 10) || 0;
    const daily = Math.floor(total / 7);
    const rem = total % 7;
    for (let i = 0; i < 7; i++) dailyDemand[i] = daily + (i === 0 ? rem : 0);
  }

  // Build daily incoming stock map: PO arriving on day X adds its qty on day X+1
  const dailyIncoming = Array(7).fill(0);
  if (purchaseOrders && purchaseOrders.length > 0) {
    purchaseOrders.forEach(po => {
      const arrDay = po.estimatedArrivalDayOffset;
      if (arrDay != null && arrDay >= 0 && arrDay < 6) {
        dailyIncoming[arrDay + 1] += (po.qty || 0);
      }
    });
  }

  const woTotal = dailyDemand.reduce((s, d) => s + d, 0);
  let stock = (parseInt(endStock, 10) || 0) + woTotal;
  return Array.from({ length: 7 }, (_, i) => {
    stock += dailyIncoming[i];
    stock -= dailyDemand[i];
    return { demand: dailyDemand[i], stock };
  });
};

// ── Layout constants ───────────────────────────────────────────────────────────

const LABEL_W = 230;
const DATE_W = 108;

// ── Design-system link style (matches WorkOrderDetailPage PO value links) ─────

const LinkText = ({ children, href }) => (
  <span
    onClick={() => window.open(href, "_blank")}
    style={{
      color: "var(--feature-brand-primary)",
      cursor: "pointer",
      textDecoration: "underline",
      fontSize: "var(--text-title-3)",
    }}
  >
    {children}
  </span>
);

// ── Sub-components ─────────────────────────────────────────────────────────────

const LabelValue = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{label}</span>
    <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{value}</div>
  </div>
);

const Tag = ({ children, bg, color }) => (
  <div style={{
    padding: "3px 6px",
    borderRadius: "4px",
    background: bg,
    color: color,
    fontSize: "11px",
    fontWeight: "600",
    whiteSpace: "nowrap",
    lineHeight: "1.5",
    textAlign: "center",
  }}>
    {children}
  </div>
);

const ChevronBtn = ({ expanded, onClick }) => (
  <button
    onClick={onClick}
    style={{
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "2px",
      color: "var(--neutral-on-surface-secondary)",
      flexShrink: 0,
      display: "flex",
      alignItems: "center",
    }}
  >
    {expanded ? <ChevronDownIcon size={14} /> : <ChevronRightIcon size={14} />}
  </button>
);

// ── Table cell styles (aligned with poReferenceTable* design system) ───────────

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

const labelCellStyle = (paddingLeft = "12px") => ({
  width: LABEL_W,
  flexShrink: 0,
  borderRight: ROW_BORDER,
  padding: `0 12px 0 ${paddingLeft}`,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  gap: "4px",
  minHeight: "49px",
});

const dateCellStyle = (extra = {}, isLast = false) => ({
  width: DATE_W,
  flexShrink: 0,
  borderRight: isLast ? "none" : ROW_BORDER,
  padding: "8px 4px",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: "3px",
  boxSizing: "border-box",
  ...extra,
});

// ── Rows ───────────────────────────────────────────────────────────────────────

const HeaderRow = ({ dates }) => (
  <div style={{ display: "flex", background: "var(--neutral-surface-primary)", borderBottom: ROW_BORDER, position: "sticky", top: 0, zIndex: 2 }}>
    <div style={{ width: LABEL_W, flexShrink: 0, borderRight: ROW_BORDER, minHeight: "49px", boxSizing: "border-box" }} />
    {dates.map((d, i) => (
      <div
        key={i}
        style={{
          ...dateCellStyle({
            minHeight: "49px",
            fontSize: "var(--text-title-3)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
            textAlign: "center",
          }, i === 6),
        }}
      >
        {fmtHeader(d)}
      </div>
    ))}
  </div>
);

const DemandRow = ({ dailyData, weeklyDemand, expanded, onToggle }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle(), minHeight: "64px" }}>
      <ChevronBtn expanded={expanded} onClick={onToggle} />
      <div>
        <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Demand</div>
        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>Total: {weeklyDemand}</div>
      </div>
    </div>
    {dailyData.map((row, i) => (
      <div key={i} style={dateCellStyle({ minHeight: "64px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }, i === 6)}>
        {row.demand}
      </div>
    ))}
  </div>
);

const WoSubRow = ({ wo, hasBatch, shortfall }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle("44px"), minHeight: "64px", alignItems: "flex-start", paddingTop: "12px", paddingBottom: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>
          {wo.productName}
        </span>
        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{wo.customerName}</span>
        <LinkText href={`/work-order/${wo.id}`}>{wo.id}</LinkText>
        {wo.isSlipped && wo.originalEstimatedStartDate && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
            Slipped {wo.slippedDays}d, Originally: {wo.originalEstimatedStartDate}
          </span>
        )}
      </div>
    </div>
    {Array.from({ length: 7 }, (_, i) => (
      <div key={i} style={dateCellStyle({ minHeight: "64px" }, i === 6)}>
        {wo.estimatedStartDayOffset === i && (
          <>
            <Tag
              bg={wo.isSlipped ? "var(--status-red-container)" : "var(--status-green-container)"}
              color={wo.isSlipped ? "var(--status-red-primary)" : "var(--status-green-primary)"}
            >
              <div>{wo.isSlipped ? "Carried Over" : "Est. Start"}</div>
              <div>{wo.qty} pcs</div>
            </Tag>
            {!hasBatch && (
              <span style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic", textAlign: "center" }}>
                No batch assigned
              </span>
            )}
            {hasBatch && shortfall > 0 && (
              <span style={{ fontSize: "10px", color: "var(--status-red-primary)", textAlign: "center" }}>
                {shortfall} pcs not covered
              </span>
            )}
          </>
        )}
      </div>
    ))}
  </div>
);

const StockRow = ({ dailyData, initialStock, expanded, onToggle }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle(), minHeight: "64px" }}>
      <ChevronBtn expanded={expanded} onClick={onToggle} />
      <div>
        <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Stock</div>
        <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "2px" }}>Initial: {initialStock}</div>
      </div>
    </div>
    {dailyData.map((row, i) => (
      <div key={i} style={dateCellStyle({ minHeight: "64px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: row.stock < 0 ? "var(--status-red-primary)" : "var(--status-green-primary)" }, i === 6)}>
        {row.stock}
      </div>
    ))}
  </div>
);

const BatchSubRow = ({ batch }) => (
  <div style={{ display: "flex", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", minHeight: "64px" }}>
    <div style={{ ...labelCellStyle("44px"), minHeight: "64px", alignItems: "flex-start", paddingTop: "12px", paddingBottom: "12px" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
        <LinkText href={`/batch/${batch.batchId}`}>{batch.batchId}</LinkText>
        {batch.totalStock != null && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
            Initial: {batch.totalStock} pcs
            {(!batch.consumptions || batch.consumptions.length === 0) && !batch.poId && (
              <span style={{ color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}> · No WO assigned</span>
            )}
          </span>
        )}
        {batch.poId && (
          <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
            +{batch.poQty} from{" "}
            <LinkText href={`/purchase-order/${batch.poId}`}>{batch.poId}</LinkText>
          </span>
        )}
      </div>
    </div>
    {Array.from({ length: 7 }, (_, i) => {
      const consumed = (batch.consumptions || []).filter(c => c.dayOffset === i);
      const isArrival = batch.poEstimatedArrivalDayOffset === i;
      return (
        <div key={i} style={dateCellStyle({ minHeight: "64px" }, i === 6)}>
          {isArrival && (
            <Tag bg="var(--status-green-container)" color="var(--status-green-primary)">
              <div>Est. Arrival</div>
              {batch.poQty != null && <div>{batch.poQty} pcs</div>}
            </Tag>
          )}
          {consumed.map((c, ci) => (
            <Tag key={ci} bg="#FFF3E0" color="var(--status-orange-primary)">
              <div>{c.qty} pcs</div>
              <div>{c.woId}</div>
            </Tag>
          ))}
        </div>
      );
    })}
  </div>
);

// ── Main component ─────────────────────────────────────────────────────────────

export const MaterialForecastDrawer = ({ isOpen, onClose, onCreatePo, selectedCell }) => {
  const [demandExpanded, setDemandExpanded] = useState(false);
  const [stockExpanded, setStockExpanded] = useState(false);

  useEffect(() => {
    setDemandExpanded(false);
    setStockExpanded(false);
  }, [selectedCell?.sku, selectedCell?.weekOffset]);

  if (!isOpen || !selectedCell) return null;

  const isMaterialDetail = selectedCell.week === "Material Detail";
  const dates = getWeekDates(selectedCell.weekOffset);
  const weekNumber = getISOWeekNumber(dates[0]);
  const year = dates[0].getFullYear();
  const rangeLabel = `${fmtShort(dates[0])} – ${fmtShort(dates[6])}, ${year}`;

  const workOrders = selectedCell.workOrders || [];
  const batches = selectedCell.batches || [];
  const purchaseOrders = selectedCell.purchaseOrders || [];

  const weeklyDemand = workOrders.length > 0
    ? workOrders.reduce((s, wo) => s + (wo.qty || 0), 0)
    : (parseInt(selectedCell.demand, 10) || 0);
  const endStock = parseInt(selectedCell.endStock, 10) || 0;
  const initialStock = endStock + weeklyDemand;
  const dailyData = computeDailyData(selectedCell.demand, selectedCell.endStock, workOrders, purchaseOrders);

  const woIdsWithBatch = new Set(batches.flatMap(b => (b.consumptions || []).map(c => c.woId)));
  // Sum covered qty per WO across all batch consumptions
  const woCoveredQty = {};
  batches.forEach(b => (b.consumptions || []).forEach(c => {
    woCoveredQty[c.woId] = (woCoveredQty[c.woId] || 0) + c.qty;
  }));
  const stockSubRows = batches;

  const hasNegativeStock = endStock < 0 || dailyData.some(r => r.stock < 0);
  const tableMinWidth = LABEL_W + 7 * DATE_W;

  const procStatus = MOCK_PROCUREMENT_STATUS[selectedCell.sku];
  const isFirstNegWeek = procStatus && selectedCell.weekOffset === procStatus.firstNegativeWeekOffset;
  const showOverdueAlert  = isFirstNegWeek && procStatus.status === "overdue"    && procStatus.affectedWoIds.length > 0;
  const showUrgentAlert   = isFirstNegWeek && procStatus.status === "urgent";
  const showThisWeekAlert = isFirstNegWeek && procStatus.status === "this_week";
  const showConsequenceAlert = showOverdueAlert || showUrgentAlert || showThisWeekAlert;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.28)",
        display: "flex",
        justifyContent: "flex-end",
        zIndex: 20000,
        opacity: isOpen ? 1 : 0,
        transition: "opacity 0.2s ease-in-out",
        pointerEvents: isOpen ? "auto" : "none",
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: "relative",
          width: "1040px",
          background: "var(--neutral-surface-primary)",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: ROW_BORDER, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Forecast Breakdown
          </span>
          <IconButton icon={CloseIcon} onClick={onClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Info row — outside scroll container so it's always visible */}
        <div style={{ padding: "16px 24px", flexShrink: 0 }}>
          <div style={{ padding: "16px", borderRadius: "var(--radius-card)", border: ROW_BORDER, display: "flex", gap: "24px" }}>
            <LabelValue label="Material Name" value={selectedCell.materialName} />
            <LabelValue
              label="Material SKU"
              value={<LinkText href={`/materials/${selectedCell.sku}`}>{selectedCell.sku}</LinkText>}
            />
            <LabelValue label="Week" value={`W${weekNumber}`} />
            <LabelValue label="Date Range" value={rangeLabel} />
          </div>
        </div>

        {/* Procurement alert — shown on first negative stock week */}
        {showConsequenceAlert && (() => {
          let bg, iconColor, title, body;

          if (showOverdueAlert) {
            bg        = "var(--status-red-container)";
            iconColor = "var(--status-red-primary)";
            title     = "Late PO — Delivery at Risk";
            body = (
              <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)", lineHeight: "1.6" }}>
                Ordering now will delay{" "}
                <strong>{procStatus.affectedWoIds.join(", ")}</strong>{" "}
                by an estimated <strong>{procStatus.delayDays} day{procStatus.delayDays !== 1 ? "s" : ""}</strong> due to fastest vendor lead time of{" "}
                <strong>{procStatus.fastestLeadTimeDays} days ({procStatus.fastestVendor})</strong>.
              </span>
            );
          } else if (showUrgentAlert) {
            bg        = "var(--status-orange-container, #FFF3E0)";
            iconColor = "var(--status-orange-primary)";
            title     = "Urgent — Order Window Closing";
            body = (
              <span style={{ fontSize: "var(--text-body)", color: "var(--status-orange-primary)", lineHeight: "1.6" }}>
                Only <strong>{procStatus.bufferDays} day{procStatus.bufferDays !== 1 ? "s" : ""}</strong> left to order on time.
                Place this PO by <strong>{procStatus.orderByDate}</strong> using the fastest vendor{" "}
                <strong>{procStatus.fastestVendor}</strong> (lead time: {procStatus.fastestLeadTimeDays} days).
                Missing this window means stock arrives after demand on <strong>{procStatus.demandDate}</strong>.
              </span>
            );
          } else {
            bg        = "var(--feature-brand-container)";
            iconColor = "var(--feature-brand-primary)";
            title     = "Order This Week";
            body = (
              <span style={{ fontSize: "var(--text-body)", color: "var(--feature-brand-primary)", lineHeight: "1.6" }}>
                Place this PO by <strong>{procStatus.orderByDateAvg}</strong> to meet demand on{" "}
                <strong>{procStatus.demandDate}</strong>.
                Average vendor lead time is <strong>{procStatus.avgLeadTimeDays} days</strong>.
                Ordering from <strong>{procStatus.fastestVendor}</strong> ({procStatus.fastestLeadTimeDays} days) gives{" "}
                the most buffer.
              </span>
            );
          }

          return (
            <div style={{ padding: "0 24px 12px", flexShrink: 0 }}>
              <div style={{
                width: "100%", background: bg, borderRadius: "12px",
                padding: "16px 20px", display: "flex", gap: "16px",
                alignItems: "flex-start", boxSizing: "border-box",
              }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <Info size={20} color={iconColor} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)", color: iconColor }}>
                    {title}
                  </span>
                  {body}
                </div>
              </div>
            </div>
          );
        })()}

        {/* Scrollable table area — date header sticky at top: 0 of this container */}
        <div style={{ flex: 1, minHeight: 0, overflow: "auto", padding: "0 24px 24px" }}>
          {!isMaterialDetail && (
            <div style={{ minWidth: `${tableMinWidth}px` }}>
              <HeaderRow dates={dates} />

              <DemandRow
                dailyData={dailyData}
                weeklyDemand={weeklyDemand}
                expanded={demandExpanded}
                onToggle={() => setDemandExpanded(v => !v)}
              />
              {demandExpanded && workOrders.map((wo) => {
                const covered = woCoveredQty[wo.id] || 0;
                const shortfall = woIdsWithBatch.has(wo.id) ? Math.max(0, wo.qty - covered) : 0;
                return <WoSubRow key={wo.id} wo={wo} hasBatch={woIdsWithBatch.has(wo.id)} shortfall={shortfall} />;
              })}

              <StockRow
                dailyData={dailyData}
                initialStock={initialStock}
                expanded={stockExpanded}
                onToggle={() => setStockExpanded(v => !v)}
              />
              {stockExpanded && stockSubRows.map((batch) => (
                <BatchSubRow key={batch.batchId} batch={batch} />
              ))}
            </div>
          )}

          {isMaterialDetail && (
            <div style={{ padding: "24px", display: "flex", flex: 1, alignItems: "center", justifyContent: "center", color: "var(--neutral-on-surface-secondary)" }}>
              Detail view for specific material will be defined later.
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: "16px 24px", borderTop: ROW_BORDER, flexShrink: 0 }}>
          <Button
            variant="filled"
            size="large"
            disabled={!hasNegativeStock}
            style={{ width: "100%" }}
            onClick={() => onCreatePo && onCreatePo({
              materialName: selectedCell.materialName,
              sku: selectedCell.sku,
              needToBuy: selectedCell.endStock < 0 ? Math.abs(selectedCell.endStock) : 0,
            })}
          >
            Create PO
          </Button>
        </div>
      </div>
    </div>
  );
};
