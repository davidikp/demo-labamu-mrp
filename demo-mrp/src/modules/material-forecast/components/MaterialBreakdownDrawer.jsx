import React, { useState, useMemo, useRef, useEffect } from "react";
import { CloseIcon } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { FilterPopoverCheckbox } from "../../../components/molecules/FilterPopoverCheckbox.jsx";
import { DateRangeInputControl } from "../../purchase-order/components/DateRangeInputControl.jsx";
import { MOCK_PROCUREMENT_STATUS, MOCK_CUSTOMER_PIC_MAP } from "../mock/materialForecastMocks.js";

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

// ── Date helpers ───────────────────────────────────────────────────────────────

const getMondayOfCurrentWeek = () => {
  const today = new Date();
  const day = today.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
};

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const getAbsoluteStartDate = (weekOffset, dayOffset) => {
  const monday = getMondayOfCurrentWeek();
  monday.setDate(monday.getDate() + weekOffset * 7 + dayOffset);
  return monday;
};

// ── Urgency computation ────────────────────────────────────────────────────────

const getUrgencyStatus = (woStartDate, needToBuy) => {
  if (needToBuy === 0) return "on_track";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(woStartDate);
  start.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((start - today) / 86400000);
  if (diffDays < 0) return "overdue";
  if (diffDays <= 3) return "urgent";
  if (diffDays <= 7) return "this_week";
  return "on_track";
};

const URGENCY_CONFIG = {
  overdue:   { label: "Overdue",   bg: "var(--status-red-container)",                color: "var(--status-red-primary)" },
  urgent:    { label: "Urgent",    bg: "var(--status-orange-container, #FFF3E0)",     color: "var(--status-orange-primary)" },
  this_week: { label: "This Week", bg: "var(--feature-brand-container)",              color: "var(--feature-brand-primary)" },
  on_track:  { label: "On Track",  bg: "var(--status-green-container, #E8F5E9)",      color: "var(--status-green-primary)" },
};

const URGENCY_ORDER = { overdue: 0, urgent: 1, this_week: 2, on_track: 3 };

// ── Column definitions ─────────────────────────────────────────────────────────

// Fixed pixel widths — same pattern as StockBatchesTab
const WO_ID_W    = 130;
const ORDER_ID_W = 110;
const PRODUCT_W  = 180;
const CUSTOMER_W = 160;
const EST_W      = 120;
const DEMAND_W   = 90;
const NEED_W     = 110;
const URGENCY_W  = 116;
const ACTION_W   = 120;

// Total width of all columns
const TABLE_MIN_W = WO_ID_W + ORDER_ID_W + PRODUCT_W + CUSTOMER_W + EST_W + DEMAND_W + NEED_W + URGENCY_W + ACTION_W;

// ── Sub-components ─────────────────────────────────────────────────────────────

const LabelValue = ({ label, value }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{label}</span>
    <div style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{value}</div>
  </div>
);

const UrgencyBadge = ({ status }) => {
  const cfg = URGENCY_CONFIG[status] || URGENCY_CONFIG.on_track;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "6px",
      background: cfg.bg, color: cfg.color,
      fontSize: "var(--text-body)", fontWeight: "var(--font-weight-semi-bold)", whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
};

// Shared cell style — same height as StockBatchesTab rows
const cellBase = (width, extra = {}) => ({
  width: `${width}px`,
  flexShrink: 0,
  boxSizing: "border-box",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  minHeight: "56px",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...extra,
});

const thBase = (width, extra = {}) => ({
  ...cellBase(width, extra),
  fontSize: "var(--text-body)",
  fontWeight: "var(--font-weight-semi-bold)",
  color: "var(--neutral-on-surface-secondary)",
  minHeight: "44px",
  whiteSpace: "nowrap",
});

// ── Est. Start Date popover ────────────────────────────────────────────────────
const toISO = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const StartDatePopover = ({ dateFilterType, setDateFilterType, customDateRange, setCustomDateRange, onClose }) => {
  const ref = useRef(null);
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onClose]);

  return (
    <div ref={ref} style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, width: "300px", background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", padding: "16px", display: "flex", flexDirection: "column", gap: "16px", zIndex: 100000 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Est. Start</span>
        <button onClick={() => { setDateFilterType("all"); setCustomDateRange({ start: "", end: "" }); onClose(); }} style={{ background: "none", border: "none", padding: 0, color: "var(--status-red-primary)", cursor: "pointer", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)" }}>Remove Filter</button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {[{ key: "all", label: "All" }, { key: "last7", label: "Last 7 days" }, { key: "last30", label: "Last 30 days" }, { key: "next7", label: "Next 7 days" }, { key: "next30", label: "Next 30 days" }, { key: "custom", label: "Custom date" }].map((opt) => (
          <label key={opt.key} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "var(--text-title-3)" }}>
            <input type="radio" checked={dateFilterType === opt.key} onChange={() => setDateFilterType(opt.key)} />
            <span>{opt.label}</span>
          </label>
        ))}
        {dateFilterType === "custom" && <DateRangeInputControl value={customDateRange} onChange={(e) => setCustomDateRange(e.target.value)} fieldHeight="40px" fontSize="14px" />}
      </div>
    </div>
  );
};

// ── Main component ─────────────────────────────────────────────────────────────

const linkStyle = {
  color: "var(--feature-brand-primary)",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: "var(--text-title-3)",
};

export const MaterialBreakdownDrawer = ({ isOpen, onClose, materialData, onCreatePo }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterProduct, setFilterProduct] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState([]);
  const [filterOrderId, setFilterOrderId] = useState([]);
  const [filterUrgency, setFilterUrgency] = useState([]);
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const scrollerRef = useRef(null);
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false });

  // Track horizontal scroll for sticky column shadows
  useEffect(() => {
    const handleScroll = () => {
      if (!scrollerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setScrollShadows({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 2,
      });
    };
    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener("scroll", handleScroll);
      handleScroll();
    }
    return () => scroller?.removeEventListener("scroll", handleScroll);
  }, [isOpen, materialData]);

  const allRows = useMemo(() => {
    if (!materialData) return [];
    const rows = [];
    materialData.timeline.forEach((weekData) => {
      weekData.workOrders.forEach((wo) => {
        const allocated = materialData.timeline.reduce((sum, wd) =>
          sum + wd.batches.reduce((bSum, batch) => {
            const c = batch.consumptions.find((x) => x.woId === wo.id);
            return bSum + (c ? c.qty : 0);
          }, 0)
        , 0);
        const demand = wo.qty;
        const needToBuy = Math.max(0, demand - allocated);
        const woStartDate = getAbsoluteStartDate(weekData.weekOffset, wo.estimatedStartDayOffset);
        const urgencyStatus = getUrgencyStatus(woStartDate, needToBuy);
        rows.push({
          woId: wo.id,
          orderId: wo.orderId || "—",
          productName: wo.productName,
          customerName: wo.customerName,
          sku: materialData.sku,
          estStart: fmtDate(woStartDate),
          demand,
          needToBuy,
          urgencyStatus,
        });
      });
    });
    rows.sort((a, b) => URGENCY_ORDER[a.urgencyStatus] - URGENCY_ORDER[b.urgencyStatus]);
    return rows;
  }, [materialData]);

  const productOptions = useMemo(() => {
    const names = [...new Set(allRows.map((r) => r.productName))].sort();
    return names.map((v) => ({ value: v, label: v }));
  }, [allRows]);

  const customerOptions = useMemo(() => {
    const names = [...new Set(allRows.map((r) => r.customerName))].sort();
    return names.map((v) => ({ value: v, label: v }));
  }, [allRows]);

  const orderIdOptions = useMemo(() => {
    const ids = [...new Set(allRows.map((r) => r.orderId).filter((id) => id && id !== "—"))].sort();
    return ids.map((v) => ({ value: v, label: v }));
  }, [allRows]);

  const urgencyOptions = [
    { value: "overdue",   label: "Overdue" },
    { value: "urgent",    label: "Urgent" },
    { value: "this_week", label: "This Week" },
    { value: "on_track",  label: "On Track" },
  ];

  const filteredRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return allRows.filter((r) => {
      if (q && !r.woId.toLowerCase().includes(q)) return false;
      if (filterProduct.length > 0 && !filterProduct.includes(r.productName)) return false;
      if (filterCustomer.length > 0 && !filterCustomer.includes(r.customerName)) return false;
      if (filterOrderId.length > 0 && !filterOrderId.includes(r.orderId)) return false;
      if (filterUrgency.length > 0 && !filterUrgency.includes(r.urgencyStatus)) return false;
      if (dateFilterType !== "all") {
        const d = new Date(r.estStart); d.setHours(0, 0, 0, 0);
        if (isNaN(d.getTime())) return false;
        const iso = toISO(d);
        if (dateFilterType === "last7") { const c = new Date(now); c.setDate(now.getDate() - 7); if (d < c || d > now) return false; }
        else if (dateFilterType === "last30") { const c = new Date(now); c.setDate(now.getDate() - 30); if (d < c || d > now) return false; }
        else if (dateFilterType === "next7") { const c = new Date(now); c.setDate(now.getDate() + 7); if (d < now || d > c) return false; }
        else if (dateFilterType === "next30") { const c = new Date(now); c.setDate(now.getDate() + 30); if (d < now || d > c) return false; }
        else if (dateFilterType === "custom" && customDateRange.start && customDateRange.end) {
          if (iso < customDateRange.start || iso > customDateRange.end) return false;
        }
      }
      return true;
    });
  }, [allRows, searchQuery, filterProduct, filterCustomer, filterOrderId, filterUrgency, dateFilterType, customDateRange]);

  const hasActiveFilters = filterProduct.length > 0 || filterCustomer.length > 0 || filterOrderId.length > 0 || filterUrgency.length > 0;

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const pagedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const handleClose = () => {
    setSearchQuery("");
    setFilterProduct([]);
    setFilterCustomer([]);
    setFilterOrderId([]);
    setFilterUrgency([]);
    setOpenFilterKey(null);
    setCurrentPage(1);
    setDateFilterType("all");
    setCustomDateRange({ start: "", end: "" });
    setShowDatePopover(false);
    onClose();
  };

  if (!materialData) return null;

  const leftShadow  = scrollShadows.left  ? "4px 0 8px -4px rgba(0,0,0,0.12)"  : "none";
  const rightShadow = scrollShadows.right ? "-4px 0 8px -4px rgba(0,0,0,0.12)" : "none";

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)",
          zIndex: 20000,
          opacity: isOpen ? 1 : 0,
          transition: "opacity 0.2s ease-in-out",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={handleClose}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "fixed", top: 0, right: 0,
          width: "900px", height: "100%",
          background: "var(--neutral-surface-primary)",
          display: "flex", flexDirection: "column",
          zIndex: 20001,
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          boxShadow: "-4px 0 16px rgba(0,0,0,0.12)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "24px",
          borderBottom: ROW_BORDER,
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexShrink: 0,
        }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
            Planning Breakdown
          </span>
          <IconButton icon={CloseIcon} onClick={handleClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Info section */}
        <div style={{ padding: "16px 24px", flexShrink: 0 }}>
          <div style={{
            padding: "16px", borderRadius: "var(--radius-card)", border: ROW_BORDER,
            display: "flex", gap: "24px",
          }}>
            <LabelValue label="Material Name" value={materialData.materialName} />
            <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Material SKU</span>
              <span
                onClick={() => window.open(`/materials/${materialData.sku}`, "_blank")}
                style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)", textDecoration: "underline", cursor: "pointer" }}
              >
                {materialData.sku}
              </span>
            </div>
            <LabelValue label="On-Hand Stock" value={materialData.onHandStock.toLocaleString()} />
            <LabelValue label="Incoming PO" value={(materialData.incomingPoStock || 0).toLocaleString()} />
          </div>
        </div>

        {/* Search & filter bar — filters left, search right */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "0 24px 12px", flexShrink: 0, borderBottom: ROW_BORDER }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {[
              { key: "orderId",  label: "Order ID", value: filterOrderId,  options: orderIdOptions,  onChange: setFilterOrderId  },
              { key: "product",  label: "Product",  value: filterProduct,  options: productOptions,  onChange: setFilterProduct  },
              { key: "customer", label: "Customer", value: filterCustomer, options: customerOptions, onChange: setFilterCustomer },
            ].map(({ key, label, value, options, onChange }) => (
              <div
                key={key}
                onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === key ? null : key); }}
              >
                <FilterPill label={label} active={value.length > 0} isOpen={openFilterKey === key} count={value.length} />
              </div>
            ))}

            {openFilterKey === "orderId"  && <FilterPopoverCheckbox title="Order ID" options={orderIdOptions}  value={filterOrderId}  onChange={(v) => { setFilterOrderId(v);  setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "product"  && <FilterPopoverCheckbox title="Product"  options={productOptions}  value={filterProduct}  onChange={(v) => { setFilterProduct(v);  setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "customer" && <FilterPopoverCheckbox title="Customer" options={customerOptions} value={filterCustomer} onChange={(v) => { setFilterCustomer(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "urgency"  && <FilterPopoverCheckbox title="Urgency"  options={urgencyOptions}  value={filterUrgency}  onChange={(v) => { setFilterUrgency(v);  setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} searchable={false} />}

            {/* Est. Start */}
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowDatePopover((p) => !p)}>
                <FilterPill label="Est. Start" active={dateFilterType !== "all"} isOpen={showDatePopover} count={dateFilterType !== "all" ? 1 : 0} />
              </div>
              {showDatePopover && (
                <StartDatePopover
                  dateFilterType={dateFilterType}
                  setDateFilterType={(v) => { setDateFilterType(v); setCurrentPage(1); }}
                  customDateRange={customDateRange}
                  setCustomDateRange={setCustomDateRange}
                  onClose={() => setShowDatePopover(false)}
                />
              )}
            </div>

            {/* Urgency — last */}
            <div onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === "urgency" ? null : "urgency"); }}>
              <FilterPill label="Urgency" active={filterUrgency.length > 0} isOpen={openFilterKey === "urgency"} count={filterUrgency.length} />
            </div>
          </div>
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search WO ID..."
            width="230px"
          />
        </div>

        {/* Table — horizontally scrollable */}
        <div
          ref={scrollerRef}
          style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "auto" }}
        >
          <div style={{ minWidth: `${TABLE_MIN_W}px`, display: "inline-flex", flexDirection: "column", width: "100%" }}>

            {/* Table header */}
            <div style={{
              display: "flex",
              borderBottom: ROW_BORDER,
              position: "sticky", top: 0, zIndex: 3,
              background: "var(--neutral-surface-primary)",
            }}>
              {/* WO ID — sticky left */}
              <div style={{
                ...thBase(WO_ID_W, { paddingLeft: "24px" }),
                position: "sticky", left: 0, zIndex: 4,
                background: "var(--neutral-surface-primary)",
                boxShadow: leftShadow, transition: "box-shadow 0.2s ease",
              }}>WO ID</div>

              <div style={thBase(ORDER_ID_W)}>Order ID</div>
              <div style={thBase(PRODUCT_W)}>Product</div>
              <div style={thBase(CUSTOMER_W)}>Customer</div>
              <div style={thBase(EST_W)}>Est. Start</div>
              <div style={thBase(DEMAND_W)}>Demand</div>
              <div style={thBase(NEED_W)}>Need to Buy</div>

              {/* Urgency — sticky right (behind Action) */}
              <div style={{
                ...thBase(URGENCY_W),
                position: "sticky", right: ACTION_W, zIndex: 4,
                background: "var(--neutral-surface-primary)",
                boxShadow: rightShadow, transition: "box-shadow 0.2s ease",
              }}>Urgency</div>

              {/* Action — sticky rightmost */}
              <div style={{
                ...thBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }),
                position: "sticky", right: 0, zIndex: 4,
                background: "var(--neutral-surface-primary)",
              }}>Action</div>
            </div>

            {/* Table body */}
            {pagedRows.length === 0 && filteredRows.length === 0 ? (
              <div style={{
                padding: "48px 0", textAlign: "center",
                color: "var(--neutral-on-surface-tertiary)",
                fontSize: "var(--text-title-3)",
              }}>
                No work orders match the current filters.
              </div>
            ) : pagedRows.map((row, idx) => (
              <div
                key={`${row.woId}-${idx}`}
                style={{
                  display: "flex",
                  borderBottom: ROW_BORDER,
                  background: "var(--neutral-surface-primary)",
                }}
              >
                {/* WO ID — sticky left, clickable */}
                <div style={{
                  ...cellBase(WO_ID_W, { paddingLeft: "24px" }),
                  position: "sticky", left: 0, zIndex: 2,
                  background: "inherit",
                  boxShadow: leftShadow, transition: "box-shadow 0.2s ease",
                  alignSelf: "stretch",
                }}>
                  <span
                    style={linkStyle}
                    onClick={() => window.open(`/work-order/${row.woId}`, "_blank")}
                  >
                    {row.woId}
                  </span>
                </div>

                {/* Order ID — clickable */}
                <div style={cellBase(ORDER_ID_W)}>
                  <span
                    style={linkStyle}
                    onClick={() => window.open(`/sales-order/${row.orderId}`, "_blank")}
                  >
                    {row.orderId}
                  </span>
                </div>

                {/* Product + SKU secondary */}
                <div style={{ ...cellBase(PRODUCT_W), flexDirection: "column", alignItems: "flex-start", gap: "2px", paddingTop: "10px", paddingBottom: "10px" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    {row.productName}
                  </span>
                  <span
                    style={{ ...linkStyle, fontSize: "var(--text-body)" }}
                    onClick={() => window.open(`/materials/${row.sku}`, "_blank")}
                  >
                    {row.sku}
                  </span>
                </div>

                <div style={{ ...cellBase(CUSTOMER_W), flexDirection: "column", alignItems: "flex-start", gap: "2px", paddingTop: "10px", paddingBottom: "10px" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    {row.customerName}
                  </span>
                  {MOCK_CUSTOMER_PIC_MAP[row.customerName] && (
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>
                      {MOCK_CUSTOMER_PIC_MAP[row.customerName]}
                    </span>
                  )}
                </div>

                <div style={cellBase(EST_W)}>{row.estStart}</div>

                <div style={cellBase(DEMAND_W, { fontWeight: "var(--font-weight-semi-bold)" })}>
                  {row.demand.toLocaleString()}
                </div>

                <div style={cellBase(NEED_W, {
                  fontWeight: "var(--font-weight-bold)",
                  color: row.needToBuy > 0 ? "var(--status-red-primary)" : "var(--neutral-on-surface-secondary)",
                })}>
                  {row.needToBuy.toLocaleString()}
                </div>

                {/* Urgency — sticky right (behind Action) */}
                <div style={{
                  ...cellBase(URGENCY_W),
                  position: "sticky", right: ACTION_W, zIndex: 2,
                  background: "inherit",
                  boxShadow: rightShadow, transition: "box-shadow 0.2s ease",
                  alignSelf: "stretch",
                }}>
                  <UrgencyBadge status={row.urgencyStatus} />
                </div>

                {/* Action — sticky rightmost */}
                <div style={{
                  ...cellBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }),
                  position: "sticky", right: 0, zIndex: 2,
                  background: "inherit",
                  alignSelf: "stretch",
                }}>
                  <Button
                    variant="secondary"
                    size="small"
                    disabled={row.needToBuy === 0}
                    onClick={() => onCreatePo({
                      materialName: materialData.materialName,
                      sku: materialData.sku,
                      needToBuy: row.needToBuy,
                      urgencyStatus: row.urgencyStatus,
                    })}
                  >
                    Create PO
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: ROW_BORDER, flexShrink: 0 }}>
          <TablePaginationFooter
            totalRows={filteredRows.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>
    </>
  );
};
