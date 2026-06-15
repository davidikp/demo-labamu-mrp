import React, { useState, useMemo, useRef, useEffect } from "react";
import { CloseIcon, Info } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { FilterPopoverCheckbox } from "../../../components/molecules/FilterPopoverCheckbox.jsx";
import { DateRangeInputControl } from "../../purchase-order/components/DateRangeInputControl.jsx";
import { MOCK_DEMAND_URGENCY_ROWS, MOCK_CUSTOMER_PIC_MAP, MOCK_PRODUCT_SKU_MAP } from "../mock/materialForecastMocks.js";
import { formatNumberWithCommas } from "../../../utils/format/formatUtils.js";

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

const TITLE_MAP = {
  Overdue:     "Overdue to Order",
  Urgent:      "Urgent to Order",
  "This Week": "Order This Week",
};

const STATUS_FILTER_MAP = {
  Overdue:     "overdue",
  Urgent:      "urgent",
  "This Week": "this_week",
};

const STATUS_BANNER = {
  overdue: {
    bg:        "var(--status-red-container)",
    iconColor: "var(--status-red-primary)",
    title:     "Late PO — Delivery at Risk",
    body:      "The ordering deadline has passed for these work orders. Place purchase orders immediately to reduce potential production delays.",
  },
  urgent: {
    bg:        "var(--status-orange-container, #FFF3E0)",
    iconColor: "var(--status-orange-primary)",
    title:     "Urgent — Order Soon",
    body:      "The ordering window is closing. Place purchase orders now to avoid material delivery delays.",
  },
  this_week: {
    bg:        "var(--feature-brand-container)",
    iconColor: "var(--feature-brand-primary)",
    title:     "Order This Week",
    body:      "Place purchase orders this week to ensure materials arrive before the planned start date.",
  },
};

// ── Column widths ──────────────────────────────────────────────────────────────
const CHECKBOX_W = 44;
const WO_ID_W    = 120;
const ORDER_ID_W = 100;
const MATERIAL_W = 160;
const PRODUCT_W  = 160;
const CUSTOMER_W = 140;
const EST_W      = 100;
const DEMAND_W   = 80;
const NEED_W     = 100;
const ACTION_W   = 110;

const TABLE_MIN_W = CHECKBOX_W + WO_ID_W + ORDER_ID_W + MATERIAL_W + PRODUCT_W + CUSTOMER_W + EST_W + DEMAND_W + NEED_W + ACTION_W;

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

const linkStyle = {
  color: "var(--feature-brand-primary)",
  cursor: "pointer",
  textDecoration: "underline",
  fontSize: "var(--text-title-3)",
};

// ── Date helpers ───────────────────────────────────────────────────────────────
const parseShortDate = (str) => {
  if (!str) return null;
  const d = new Date(`${str} ${new Date().getFullYear()}`);
  return isNaN(d.getTime()) ? null : d;
};
const toISO = (d) => {
  if (!d) return "";
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const fmtWoStartDate = (str) => {
  if (!str) return str;
  const d = parseShortDate(str);
  return d ? toISO(d) : str;
};

// ── Est. Start Date popover ────────────────────────────────────────────────────
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
        <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Est. Start Date</span>
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
export const DemandUrgencyDrawer = ({ isOpen, onClose, statusType, onCreatePo }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [orderIdFilter, setOrderIdFilter] = useState([]);
  const [materialFilter, setMaterialFilter] = useState([]);
  const [productFilter, setProductFilter] = useState([]);
  const [customerFilter, setCustomerFilter] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateRange, setCustomDateRange] = useState({ start: "", end: "" });
  const [showDatePopover, setShowDatePopover] = useState(false);
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  const scrollerRef = useRef(null);
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false });

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setScrollShadows({ left: scrollLeft > 0, right: scrollLeft < scrollWidth - clientWidth - 2 });
    };
    const scroller = scrollerRef.current;
    if (scroller) { scroller.addEventListener("scroll", handleScroll); handleScroll(); }
    return () => scroller?.removeEventListener("scroll", handleScroll);
  }, [isOpen, statusType]);

  const pageTitle = TITLE_MAP[statusType] || statusType;
  const statusKey = STATUS_FILTER_MAP[statusType];

  const sourceRows = useMemo(() =>
    MOCK_DEMAND_URGENCY_ROWS.filter((r) => r.status === statusKey),
  [statusKey]);

  const orderIdOptions = useMemo(() => [...new Set(sourceRows.map((r) => r.orderId).filter(Boolean))].sort().map((v) => ({ value: v, label: v })), [sourceRows]);
  const materialOptions = useMemo(() => {
    const seen = new Map();
    sourceRows.forEach((r) => { if (!seen.has(r.materialName)) seen.set(r.materialName, r.sku); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, sku]) => ({ value: name, label: name, subLabel: sku }));
  }, [sourceRows]);
  const productOptions = useMemo(() => {
    const seen = new Map();
    sourceRows.forEach((r) => { if (!seen.has(r.productName)) seen.set(r.productName, MOCK_PRODUCT_SKU_MAP[r.productName] || ""); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, sku]) => ({ value: name, label: name, subLabel: sku || undefined }));
  }, [sourceRows]);
  const customerOptions = useMemo(() => {
    const seen = new Map();
    sourceRows.forEach((r) => { if (!seen.has(r.customer)) seen.set(r.customer, MOCK_CUSTOMER_PIC_MAP[r.customer] || ""); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0])).map(([name, pic]) => ({ value: name, label: name, subLabel: pic || undefined }));
  }, [sourceRows]);

  const dateFilterActive = dateFilterType !== "all";

  const filteredRows = useMemo(() => {
    const now = new Date(); now.setHours(0, 0, 0, 0);
    return sourceRows.filter((row) => {
      if (searchQuery && !row.woId.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (orderIdFilter.length > 0 && !orderIdFilter.includes(row.orderId)) return false;
      if (materialFilter.length > 0 && !materialFilter.includes(row.materialName)) return false;
      if (productFilter.length > 0 && !productFilter.includes(row.productName)) return false;
      if (customerFilter.length > 0 && !customerFilter.includes(row.customer)) return false;
      if (dateFilterType !== "all") {
        const startDate = parseShortDate(row.woStartDate);
        if (!startDate) return false;
        const isoStart = toISO(startDate);

        if (dateFilterType === "last7") { const c = new Date(now); c.setDate(now.getDate() - 7); if (startDate < c || startDate > now) return false; }
        else if (dateFilterType === "last30") { const c = new Date(now); c.setDate(now.getDate() - 30); if (startDate < c || startDate > now) return false; }
        else if (dateFilterType === "next7") { const c = new Date(now); c.setDate(now.getDate() + 7); if (startDate < now || startDate > c) return false; }
        else if (dateFilterType === "next30") { const c = new Date(now); c.setDate(now.getDate() + 30); if (startDate < now || startDate > c) return false; }
        else if (dateFilterType === "custom" && customDateRange.start && customDateRange.end) {
          if (isoStart < customDateRange.start || isoStart > customDateRange.end) return false;
        }
      }
      return true;
    });
  }, [sourceRows, searchQuery, orderIdFilter, materialFilter, productFilter, customerFilter, dateFilterType, customDateRange]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const pagedRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const allPagedSelectable = pagedRows.filter((r) => r.needToBuy > 0);
  const allPagedSelected = allPagedSelectable.length > 0 && allPagedSelectable.every((r) => selectedIds.includes(r.id));
  const somePagedSelected = allPagedSelectable.some((r) => selectedIds.includes(r.id));

  const toggleRow = (id) => {
    setSelectedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  };

  const toggleAll = () => {
    if (allPagedSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allPagedSelectable.find((r) => r.id === id)));
    } else {
      const toAdd = allPagedSelectable.map((r) => r.id).filter((id) => !selectedIds.includes(id));
      setSelectedIds((prev) => [...prev, ...toAdd]);
    }
  };

  const handleClose = () => {
    setSearchQuery(""); setOrderIdFilter([]); setMaterialFilter([]); setProductFilter([]); setCustomerFilter([]);
    setDateFilterType("all"); setCustomDateRange({ start: "", end: "" }); setOpenFilterKey(null); setCurrentPage(1);
    setSelectedIds([]);
    onClose();
  };

  const buildPoRow = (row) => ({
    woId: row.woId,
    demandQty: row.demandQty,
    materialName: row.materialName,
    sku: row.sku,
    needToBuy: row.needToBuy,
    urgencyStatus: row.status,
  });

  const handleSingleCreatePo = (row) => {
    setSelectedIds([]);
    onCreatePo([buildPoRow(row)]);
  };

  const handleBulkCreatePo = () => {
    const selected = filteredRows.filter((r) => selectedIds.includes(r.id));
    setSelectedIds([]);
    onCreatePo(selected.map(buildPoRow));
  };

  const leftShadow  = scrollShadows.left  ? "4px 0 8px -4px rgba(0,0,0,0.12)"  : "none";
  const rightShadow = scrollShadows.right ? "-4px 0 8px -4px rgba(0,0,0,0.12)" : "none";

  const filterDefs = [
    { key: "orderId",  label: "Order ID", value: orderIdFilter,  options: orderIdOptions,  onChange: setOrderIdFilter  },
    { key: "material", label: "Material", value: materialFilter, options: materialOptions, onChange: setMaterialFilter },
    { key: "customer", label: "Customer", value: customerFilter, options: customerOptions, onChange: setCustomerFilter },
    { key: "product",  label: "Product",  value: productFilter,  options: productOptions,  onChange: setProductFilter  },
  ];

  return (
    <>
      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 20000, opacity: isOpen ? 1 : 0, transition: "opacity 0.2s ease-in-out", pointerEvents: isOpen ? "auto" : "none" }} onClick={handleClose} />

      {/* Drawer panel */}
      <div
        style={{ position: "fixed", top: 0, right: 0, width: "900px", height: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column", zIndex: 20001, transform: isOpen ? "translateX(0)" : "translateX(100%)", transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)", boxShadow: "-4px 0 16px rgba(0,0,0,0.12)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ padding: "24px", borderBottom: ROW_BORDER, display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{pageTitle}</span>
          <IconButton icon={CloseIcon} onClick={handleClose} size="small" color="var(--neutral-on-surface-primary)" />
        </div>

        {/* Section banner */}
        {STATUS_BANNER[statusKey] && (() => {
          const { bg, iconColor, title, body } = STATUS_BANNER[statusKey];
          return (
            <div style={{ padding: "16px 24px 0", flexShrink: 0 }}>
              <div style={{ background: bg, borderRadius: "12px", padding: "16px 20px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  <Info size={20} color={iconColor} />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-semi-bold)", color: iconColor }}>{title}</span>
                  <span style={{ fontSize: "var(--text-body)", color: iconColor, lineHeight: "1.6" }}>{body}</span>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Filter bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", padding: "16px 24px 12px", borderBottom: ROW_BORDER, flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {filterDefs.map(({ key, label, value, options, onChange }) => (
              <div key={key} onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === key ? null : key); }}>
                <FilterPill label={label} active={value.length > 0} isOpen={openFilterKey === key} count={value.length} />
              </div>
            ))}
            {filterDefs.map(({ key, label, value, options, onChange }) =>
              openFilterKey === key ? (
                <FilterPopoverCheckbox key={key} title={label} options={options} value={value} onChange={(v) => { onChange(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />
              ) : null
            )}

            {/* Est. Start Date */}
            <div style={{ position: "relative" }}>
              <div onClick={() => setShowDatePopover((p) => !p)}>
                <FilterPill label="Est. Start Date" active={dateFilterActive} isOpen={showDatePopover} count={dateFilterActive ? 1 : 0} />
              </div>
              {showDatePopover && <StartDatePopover dateFilterType={dateFilterType} setDateFilterType={(v) => { setDateFilterType(v); setCurrentPage(1); }} customDateRange={customDateRange} setCustomDateRange={setCustomDateRange} onClose={() => setShowDatePopover(false)} />}
            </div>
          </div>
          <TableSearchField value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} placeholder="Search WO ID..." width="200px" />
        </div>

        {/* Selection action bar */}
        {selectedIds.length > 0 && (
          <div style={{ padding: "10px 24px", borderBottom: ROW_BORDER, background: "var(--feature-brand-container)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)", fontWeight: "var(--font-weight-semi-bold)" }}>
              {selectedIds.length} row{selectedIds.length !== 1 ? "s" : ""} selected
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Button variant="tertiary" size="small" onClick={() => setSelectedIds([])}>Clear</Button>
              <Button variant="filled" size="small" onClick={handleBulkCreatePo}>
                Create PO for Selected
              </Button>
            </div>
          </div>
        )}

        {/* Table */}
        <div ref={scrollerRef} style={{ flex: 1, minHeight: 0, overflowX: "auto", overflowY: "auto" }}>
          <div style={{ minWidth: `${TABLE_MIN_W}px`, display: "inline-flex", flexDirection: "column", width: "100%" }}>

            {/* Header */}
            <div style={{ display: "flex", borderBottom: ROW_BORDER, position: "sticky", top: 0, zIndex: 3, background: "var(--neutral-surface-primary)" }}>
              {/* Checkbox header — sticky leftmost */}
              <div style={{ ...thBase(CHECKBOX_W, { padding: "0 12px", justifyContent: "center" }), position: "sticky", left: 0, zIndex: 4, background: "var(--neutral-surface-primary)" }}>
                <input
                  type="checkbox"
                  checked={allPagedSelected}
                  ref={(el) => { if (el) el.indeterminate = somePagedSelected && !allPagedSelected; }}
                  onChange={toggleAll}
                  style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "var(--feature-brand-primary)" }}
                />
              </div>
              <div style={{ ...thBase(WO_ID_W), position: "sticky", left: `${CHECKBOX_W}px`, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: leftShadow, transition: "box-shadow 0.2s ease" }}>WO ID</div>
              <div style={thBase(ORDER_ID_W)}>Order ID</div>
              <div style={thBase(MATERIAL_W)}>Material</div>
              <div style={thBase(PRODUCT_W)}>Product</div>
              <div style={thBase(CUSTOMER_W)}>Customer</div>
              <div style={thBase(EST_W)}>Est. Start</div>
              <div style={thBase(DEMAND_W)}>Demand</div>
              <div style={thBase(NEED_W)}>Need to Buy</div>
              <div style={{ ...thBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 4, background: "var(--neutral-surface-primary)", boxShadow: rightShadow, transition: "box-shadow 0.2s ease" }}>Action</div>
            </div>

            {/* Body */}
            {filteredRows.length === 0 ? (
              <div style={{ padding: "48px 0", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                No demand rows found.
              </div>
            ) : pagedRows.map((row) => {
              const isSelected = selectedIds.includes(row.id);
              return (
                <div key={row.id} style={{ display: "flex", borderBottom: ROW_BORDER, background: isSelected ? "var(--feature-brand-container)" : "var(--neutral-surface-primary)" }}>
                  {/* Checkbox — sticky leftmost */}
                  <div style={{ ...cellBase(CHECKBOX_W, { padding: "0 12px", justifyContent: "center" }), position: "sticky", left: 0, zIndex: 2, background: "inherit", alignSelf: "stretch" }}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(row.id)}
                      disabled={row.needToBuy === 0}
                      style={{ width: "16px", height: "16px", cursor: row.needToBuy === 0 ? "not-allowed" : "pointer", accentColor: "var(--feature-brand-primary)", opacity: row.needToBuy === 0 ? 0.4 : 1 }}
                    />
                  </div>

                  {/* WO ID — sticky left */}
                  <div style={{ ...cellBase(WO_ID_W), position: "sticky", left: `${CHECKBOX_W}px`, zIndex: 2, background: "inherit", boxShadow: leftShadow, transition: "box-shadow 0.2s ease", alignSelf: "stretch" }}>
                    <span style={linkStyle} onClick={() => window.open(`/work-order/${row.woId}`, "_blank")}>{row.woId}</span>
                  </div>

                  {/* Order ID */}
                  <div style={cellBase(ORDER_ID_W)}>
                    <span style={linkStyle} onClick={() => window.open(`/sales-order/${row.orderId}`, "_blank")}>{row.orderId}</span>
                  </div>

                  {/* Material + SKU */}
                  <div style={{ ...cellBase(MATERIAL_W), flexDirection: "column", alignItems: "flex-start", gap: "2px", paddingTop: "10px", paddingBottom: "10px" }}>
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{row.materialName}</span>
                    <span style={{ ...linkStyle, fontSize: "var(--text-body)" }} onClick={() => window.open(`/materials/${row.sku}`, "_blank")}>{row.sku}</span>
                  </div>

                  {/* Product + SKU */}
                  <div style={{ ...cellBase(PRODUCT_W), flexDirection: "column", alignItems: "flex-start", gap: "2px", paddingTop: "10px", paddingBottom: "10px" }}>
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{row.productName}</span>
                    {MOCK_PRODUCT_SKU_MAP[row.productName] && (
                      <span style={{ ...linkStyle, fontSize: "var(--text-body)" }} onClick={() => window.open(`/products/${MOCK_PRODUCT_SKU_MAP[row.productName]}`, "_blank")}>{MOCK_PRODUCT_SKU_MAP[row.productName]}</span>
                    )}
                  </div>

                  {/* Customer + PIC */}
                  <div style={{ ...cellBase(CUSTOMER_W), flexDirection: "column", alignItems: "flex-start", gap: "2px", paddingTop: "10px", paddingBottom: "10px" }}>
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{row.customer}</span>
                    {MOCK_CUSTOMER_PIC_MAP[row.customer] && (
                      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", width: "100%" }}>{MOCK_CUSTOMER_PIC_MAP[row.customer]}</span>
                    )}
                  </div>

                  {/* Est. Start */}
                  <div style={cellBase(EST_W)}>{fmtWoStartDate(row.woStartDate)}</div>

                  {/* Demand */}
                  <div style={cellBase(DEMAND_W, { fontWeight: "var(--font-weight-semi-bold)" })}>{formatNumberWithCommas(row.demandQty)} pcs</div>

                  {/* Need to Buy */}
                  <div style={cellBase(NEED_W, { fontWeight: "var(--font-weight-bold)", color: row.needToBuy > 0 ? "var(--status-red-primary)" : "var(--neutral-on-surface-secondary)" })}>
                    {row.needToBuy > 0 ? `${formatNumberWithCommas(row.needToBuy)} pcs` : "Covered"}
                  </div>

                  {/* Action — sticky right */}
                  <div style={{ ...cellBase(ACTION_W, { paddingRight: "24px", justifyContent: "center" }), position: "sticky", right: 0, zIndex: 2, background: "inherit", alignSelf: "stretch", boxShadow: rightShadow, transition: "box-shadow 0.2s ease" }}>
                    <Button
                      variant="secondary"
                      size="small"
                      disabled={row.needToBuy === 0}
                      onClick={() => handleSingleCreatePo(row)}
                    >
                      Create PO
                    </Button>
                  </div>
                </div>
              );
            })}
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
