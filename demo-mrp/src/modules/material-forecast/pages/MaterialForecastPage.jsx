import React, { useState, useMemo } from "react";
import { CloseIcon, ChevronLeft } from "../../../components/icons/Icons.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { MOCK_PO_TABLE_DATA } from "../../purchase-order/mock/purchaseOrderMocks.js";

const ROW_BORDER = "1px solid var(--neutral-line-separator-1)";

const MOCK_VENDOR_INFO = {
  "PT Mitra Sejahtera":  { phone: "08123456789", email: "contact@mitra.com",        address: "Jl. Sudirman No.1, Jakarta Pusat, 10220" },
  "CV Kayu Makmur":      { phone: "02198765432", email: "info@kayumakmur.co.id",    address: "Jl. Industri No.5, Bekasi, 17530" },
  "Bintang Sejahtera":   { phone: "02155512345", email: "order@bintangsejahtera.id", address: "Jl. Raya Bogor Km.12, Depok, 16436" },
  "PT Cahaya Abadi":     { phone: "02177889900", email: "procurement@cahayaabadi.com", address: "Jl. Gatot Subroto No.88, Jakarta Selatan, 12930" },
};
const SHIP_TO_DEFAULT = { name: "Labamu Manufacturing", phone: "+62 21 555 1234", email: "procurement@labamu.com", address: "Jl. Industri Utama Kav.9, South Tangerang, Banten" };

const SelectExistingPoDrawer = ({ isOpen, onClose, onBack }) => {
  const [vendorName, setVendorName] = useState("");
  const [poNumber, setPoNumber] = useState("");

  const vendorOptions = [...new Set(
    MOCK_PO_TABLE_DATA.filter(po => ["draft", "need_revision"].includes(po.statusKey)).map(po => po.vendorName)
  )].sort().map(v => ({ value: v, label: v }));

  const poOptions = vendorName
    ? MOCK_PO_TABLE_DATA.filter(po => po.vendorName === vendorName && ["draft", "need_revision"].includes(po.statusKey))
        .map(po => ({ value: po.poNumber, label: `${po.poNumber} (${po.status})` }))
    : [];

  const selectedPo = poNumber ? MOCK_PO_TABLE_DATA.find(po => po.poNumber === poNumber) : null;

  const handleClose = () => { setVendorName(""); setPoNumber(""); onClose(); };
  const handleBack = () => { setVendorName(""); setPoNumber(""); onBack?.(); };

  if (!isOpen) return null;

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", zIndex: 22000 }} onClick={handleBack} />
      <div style={{
        position: "fixed", top: 0, right: 0, height: "100%",
        width: selectedPo ? "900px" : "540px",
        background: "var(--neutral-surface-primary)",
        display: "flex", flexDirection: "row",
        zIndex: 22001,
        transition: "width 0.3s ease",
        boxShadow: "-4px 0 16px rgba(0,0,0,0.12)",
      }}>
        {/* Main form panel */}
        <div style={{ width: selectedPo ? "540px" : "100%", display: "flex", flexDirection: "column", borderRight: selectedPo ? ROW_BORDER : "none" }}>
          {/* Header */}
          <div style={{ padding: "20px 24px", borderBottom: ROW_BORDER, display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
            <IconButton icon={ChevronLeft} onClick={handleBack} size="small" color="var(--neutral-on-surface-primary)" />
            <span style={{ fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              Select Existing Purchase Order
            </span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                <span style={{ color: "var(--status-red-primary)" }}>*</span> Vendor
              </label>
              <DropdownSelect value={vendorName} onChange={(v) => { setVendorName(v); setPoNumber(""); }} placeholder="Select vendor" options={vendorOptions} />
            </div>
            {vendorName && (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                <label style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                  <span style={{ color: "var(--status-red-primary)" }}>*</span> Purchase Order
                </label>
                <DropdownSelect value={poNumber} onChange={setPoNumber} placeholder="Select purchase order" options={poOptions} />
              </div>
            )}
          </div>

          {/* Footer */}
          <div style={{ padding: "16px 24px", borderTop: ROW_BORDER, display: "flex", gap: "12px", flexShrink: 0 }}>
            <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={handleClose}>Cancel</Button>
            <Button variant="filled" size="large" style={{ flex: 1 }} disabled={!poNumber} onClick={handleClose}>Assign PO</Button>
          </div>
        </div>

        {/* PO Preview panel */}
        {selectedPo && (
          <div style={{ flex: 1, background: "var(--neutral-surface-grey-lighter)", display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>
            <div style={{ padding: "20px 32px", minHeight: "73px", borderBottom: ROW_BORDER, background: "var(--neutral-surface-primary)", display: "flex", alignItems: "center", flexShrink: 0 }}>
              <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Preview</span>
            </div>
            <div style={{ padding: "24px 32px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", flex: 1 }}>
              {/* PO header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{selectedPo.poNumber}</div>
                  <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", marginTop: "4px" }}>{selectedPo.vendorName}</div>
                </div>
                <StatusBadge variant={selectedPo.sBadge}>{selectedPo.status}</StatusBadge>
              </div>
              {/* PO Information */}
              <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Information</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                  {[["PO Date", selectedPo.createdDate || "-"], ["Expected Delivery Date", selectedPo.expectedDeliveryDate || "-"], ["Currency", "IDR"], ["Created By", selectedPo.createdBy || "Joko"]].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                      <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Vendor Information */}
              {(() => {
                const vi = MOCK_VENDOR_INFO[selectedPo.vendorName];
                if (!vi) return null;
                return (
                  <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Vendor Information</span>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                      {[["Vendor Name", selectedPo.vendorName], ["Phone Number", vi.phone], ["Email address", vi.email], ["Address", vi.address]].map(([label, val]) => (
                        <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                          <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
              {/* Ship To */}
              <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Ship To</span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "16px" }}>
                  {[["Recipient Name", SHIP_TO_DEFAULT.name], ["Phone Number", SHIP_TO_DEFAULT.phone], ["Email", SHIP_TO_DEFAULT.email], ["Address", SHIP_TO_DEFAULT.address]].map(([label, val]) => (
                    <div key={label} style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                      <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line", overflowWrap: "anywhere" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Purchase Order Lines + Summary + Notes & Terms */}
              {selectedPo.lines?.length > 0 && (() => {
                const fmt = (n) => `IDR ${Number(n).toLocaleString("id-ID")}`;
                const subtotal = selectedPo.subtotal || selectedPo.lines.reduce((s, l) => s + (l.qty || 0) * (l.price || 0), 0);
                const taxRate = selectedPo.taxRate ?? 11;
                const taxAmount = Math.round(subtotal * taxRate / 100);
                const feeAmount = selectedPo.feeAmount || 0;
                const total = subtotal + taxAmount + feeAmount;
                return (
                  <>
                    <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Purchase Order Lines</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {selectedPo.lines.map((line, i) => {
                          const lineSubtotal = (line.qty || 0) * (line.price || 0);
                          return (
                            <div key={i} style={{ border: ROW_BORDER, borderRadius: "12px", padding: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word" }}>{line.item || "-"}</span>
                                <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{line.code}</span>
                              </div>
                              {line.desc && (
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                  <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Description</span>
                                  <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line" }}>{line.desc}</span>
                                </div>
                              )}
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                {line.woRef && line.woRef !== "-" && <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>WO Ref</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{line.woRef}</span></div>}
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Quantity</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{line.qty} pcs</span></div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Unit Price</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{fmt(line.price)}</span></div>
                                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}><span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Subtotal</span><span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{fmt(lineSubtotal)}</span></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    {/* Summary */}
                    <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Summary</span>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {[["Subtotal", fmt(subtotal)], [`Tax (${taxRate}%)`, fmt(taxAmount)], ["Fees", fmt(feeAmount)]].map(([label, val]) => (
                          <div key={label} style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>{label}</span>
                            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{val}</span>
                          </div>
                        ))}
                        <div style={{ display: "flex", justifyContent: "space-between", borderTop: ROW_BORDER, paddingTop: "8px", marginTop: "4px" }}>
                          <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Total</span>
                          <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{fmt(total)}</span>
                        </div>
                      </div>
                    </div>
                    {/* Notes & Terms */}
                    {(selectedPo.notes || selectedPo.paymentTerms) && (
                      <div style={{ background: "var(--neutral-surface-primary)", border: ROW_BORDER, borderRadius: "12px", padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Notes & Terms</span>
                        {selectedPo.notes && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Notes</span>
                            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line" }}>{selectedPo.notes}</span>
                          </div>
                        )}
                        {selectedPo.paymentTerms && (
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>Terms</span>
                            <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", wordBreak: "break-word", whiteSpace: "pre-line" }}>{selectedPo.paymentTerms}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </>
  );
};
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { MaterialForecastDrawer } from "../components/MaterialForecastDrawer.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { FilterPopoverCheckbox } from "../../../components/molecules/FilterPopoverCheckbox.jsx";
import { MaterialBreakdownDrawer } from "../components/MaterialBreakdownDrawer.jsx";
import { DemandUrgencyDrawer } from "../components/DemandUrgencyDrawer.jsx";
import { MaterialsToBuyDrawer } from "../components/MaterialsToBuyDrawer.jsx";
import { formatNumberWithCommas } from "../../../utils/format/formatUtils.js";
import { UnscheduledWoDrawer } from "../components/UnscheduledWoDrawer.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Settings } from "../../../components/icons/Icons.jsx";
import {
  MOCK_MATERIAL_FORECAST_DATA,
  MOCK_PROCUREMENT_STATUS,
  MOCK_CUSTOMER_PIC_MAP,
  MOCK_PRODUCT_SKU_MAP,
  MOCK_DEMAND_URGENCY_ROWS,
  MOCK_UNSCHEDULED_WO_ROWS,
} from "../mock/materialForecastMocks.js";

export const MaterialForecastPage = ({ onNavigate, t, showPoSnackbar, materialPlanningSettings }) => {
  const urgencyDaysInAdvance = materialPlanningSettings?.urgencyDaysInAdvance ?? 5;

  const [selectedCell, setSelectedCell] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectExistingPoOpen, setSelectExistingPoOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [urgencyDrawerOpen, setUrgencyDrawerOpen] = useState(false);
  const [urgencyDrawerMode, setUrgencyDrawerMode] = useState(null); // "urgentToBuy" | "delayedWo" | "unscheduledWo"
  const [unscheduledDrawerOpen, setUnscheduledDrawerOpen] = useState(false);
  const [unscheduledMaterial, setUnscheduledMaterial] = useState(null);
  const [materialsToBuyOpen, setMaterialsToBuyOpen] = useState(false);

  const [filterMaterialName, setFilterMaterialName] = useState("");
  const [filterOrderId, setFilterOrderId] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState([]);
  const [filterProduct, setFilterProduct] = useState([]);
  const [filterWoId, setFilterWoId] = useState([]);
  const [forecastWeeks, setForecastWeeks] = useState(12);
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // ── Dynamic counters ───────────────────────────────────────────────────────
  const counters = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const parseDate = (str) => {
      if (!str) return null;
      const d = new Date(`${str} ${today.getFullYear()}`);
      return isNaN(d.getTime()) ? null : d;
    };
    const urgentToBuy = MOCK_DEMAND_URGENCY_ROWS.filter(r => {
      if (r.needToBuy <= 0 || r.isDelayed) return false;
      const d = parseDate(r.woStartDate);
      if (!d) return false;
      d.setHours(0, 0, 0, 0);
      return (d - today) / 86400000 <= urgencyDaysInAdvance;
    }).length;
    const delayedWo = MOCK_DEMAND_URGENCY_ROWS.filter(r => r.isDelayed).length;
    const unscheduledWo = MOCK_UNSCHEDULED_WO_ROWS.length;
    const materialsToBuy = new Set(
      MOCK_DEMAND_URGENCY_ROWS.filter(r => r.needToBuy > 0).map(r => r.sku)
    ).size;
    return { urgentToBuy, delayedWo, unscheduledWo, materialsToBuy };
  }, [urgencyDaysInAdvance]);

  const handleCounterClick = (mode) => {
    if (mode === "materialsToBuy") {
      setMaterialsToBuyOpen(true);
    } else {
      setUrgencyDrawerMode(mode);
      setUrgencyDrawerOpen(true);
    }
  };

  const handleMaterialCellClick = (row) => {
    setSelectedMaterial(row);
    setIsBreakdownOpen(true);
  };

  const navigateToCreatePo = (materials) => {
    onNavigate("purchase_order_create", {
      materials: materials.map(m => ({
        name: m.materialName || m.name || m.item || "Material",
        sku: m.sku || m.code || "-",
        purchaseQty: m.needToBuy || m.qty || 1,
      })),
      returnTo: { view: "list" },
    });
  };

  const handleCreatePo = (material) => {
    setIsDrawerOpen(false);
    navigateToCreatePo([material]);
  };

  const handleForecastSelectExistingPo = () => {
    setIsDrawerOpen(false);
    setSelectExistingPoOpen(true);
  };

  const handleBreakdownCreatePo = (material) => {
    setIsBreakdownOpen(false);
    navigateToCreatePo([material]);
  };

  const handleUrgencyCreatePo = (rows) => {
    setUrgencyDrawerOpen(false);
    navigateToCreatePo(Array.isArray(rows) ? rows : [rows]);
  };

  const handleMaterialsToBuyCreatePo = (rows) => {
    setMaterialsToBuyOpen(false);
    navigateToCreatePo(Array.isArray(rows) ? rows : [rows]);
  };

  const allTimelineColumns = MOCK_MATERIAL_FORECAST_DATA[0]?.timeline.map(tw => tw.week) || [];
  const timelineColumns = allTimelineColumns.slice(0, forecastWeeks);

  const orderIdOptions = useMemo(() => {
    const ids = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(tw => tw.workOrders.map(wo => wo.orderId).filter(Boolean))));
    return [...ids].sort().map(v => ({ value: v, label: v }));
  }, []);

  const customerOptions = useMemo(() => {
    const names = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(tw => tw.workOrders.map(wo => wo.customerName))));
    return [...names].sort().map(v => ({ value: v, label: v, subLabel: MOCK_CUSTOMER_PIC_MAP[v] || "" }));
  }, []);

  const productOptions = useMemo(() => {
    const names = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(tw => tw.workOrders.map(wo => wo.productName).filter(Boolean))));
    return [...names].sort().map(v => ({ value: v, label: v, subLabel: MOCK_PRODUCT_SKU_MAP[v] || "" }));
  }, []);

  const woIdOptions = useMemo(() => {
    const ids = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(tw => tw.workOrders.map(wo => wo.id).filter(Boolean))));
    return [...ids].sort().map(v => ({ value: v, label: v }));
  }, []);

  const filteredData = useMemo(() => {
    const nameQ = filterMaterialName.trim().toLowerCase();
    return MOCK_MATERIAL_FORECAST_DATA.filter(row => {
      if (nameQ && !row.materialName.toLowerCase().includes(nameQ) && !row.sku.toLowerCase().includes(nameQ)) return false;
      const allWos = row.timeline.flatMap(tw => tw.workOrders);
      if (filterOrderId.length > 0 && !allWos.some(wo => filterOrderId.includes(wo.orderId))) return false;
      if (filterCustomer.length > 0 && !allWos.some(wo => filterCustomer.includes(wo.customerName))) return false;
      if (filterProduct.length > 0 && !allWos.some(wo => filterProduct.includes(wo.productName))) return false;
      if (filterWoId.length > 0 && !allWos.some(wo => filterWoId.includes(wo.id))) return false;
      return true;
    });
  }, [filterMaterialName, filterOrderId, filterCustomer, filterProduct, filterWoId]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const pagedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const planningRangeOptions = [
    { value: 4,  label: "Next 4 Weeks" },
    { value: 8,  label: "Next 8 Weeks" },
    { value: 12, label: "Next 12 Weeks" },
    { value: 24, label: "Next 24 Weeks" },
  ];

  const hasActiveFilters = filterOrderId.length > 0 || filterCustomer.length > 0 || filterProduct.length > 0 || filterWoId.length > 0;

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        padding: "24px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "24px",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {/* Page header with settings button */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: "0", fontSize: "var(--text-big-title)", fontWeight: "var(--font-weight-bold)" }}>
          {t("sidebar.material_forecast", "Material Planning")}
        </h1>
        <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
          Settings
        </Button>
      </div>

      {/* Counter cards — 4 new types */}
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", flexShrink: 0 }}>
        <ListStatusCounterCard
          label="Urgent to Buy"
          count={counters.urgentToBuy}
          badgeVariant="red-light"
          onClick={() => handleCounterClick("urgentToBuy")}
        />
        <ListStatusCounterCard
          label="Delayed WO"
          count={counters.delayedWo}
          badgeVariant="grey-light"
          onClick={() => handleCounterClick("delayedWo")}
        />
        <ListStatusCounterCard
          label="Unscheduled WO"
          count={counters.unscheduledWo}
          badgeVariant="blue-light"
          onClick={() => handleCounterClick("unscheduledWo")}
        />
        <ListStatusCounterCard
          label="Materials to Buy"
          count={counters.materialsToBuy}
          badgeVariant="orange-light"
          onClick={() => handleCounterClick("materialsToBuy")}
        />
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          flex: 1,
          overflow: "hidden",
        }}
      >
        {/* Filter bar */}
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          padding: "16px 24px",
          borderBottom: hasActiveFilters ? "none" : "1px solid var(--neutral-line-separator-1)",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap", position: "relative" }}>
            {[
              { key: "woId",    label: "Work Order ID", value: filterWoId,    options: woIdOptions,    onChange: (v) => { setFilterWoId(v);    setCurrentPage(1); } },
              { key: "orderId", label: "Order ID",      value: filterOrderId, options: orderIdOptions, onChange: (v) => { setFilterOrderId(v); setCurrentPage(1); } },
              { key: "customer",label: "Customer",      value: filterCustomer,options: customerOptions, onChange: (v) => { setFilterCustomer(v);setCurrentPage(1); } },
              { key: "product", label: "Product",       value: filterProduct, options: productOptions, onChange: (v) => { setFilterProduct(v); setCurrentPage(1); } },
            ].map(({ key, label, value, options, onChange }) => (
              <div
                key={key}
                onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === key ? null : key); }}
              >
                <FilterPill label={label} active={value.length > 0} isOpen={openFilterKey === key} count={value.length} />
              </div>
            ))}

            <div
              onClick={(e) => { const rect = e.currentTarget.getBoundingClientRect(); setPopoverTriggerRect(rect); setOpenFilterKey((prev) => prev === "planningRange" ? null : "planningRange"); }}
            >
              <FilterPill
                label={planningRangeOptions.find(o => o.value === forecastWeeks)?.label || "Planning Range"}
                active={true}
                isOpen={openFilterKey === "planningRange"}
                count={0}
              />
            </div>

            {openFilterKey === "woId" && <FilterPopoverCheckbox title="Work Order ID" options={woIdOptions} value={filterWoId} onChange={(v) => { setFilterWoId(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "orderId" && <FilterPopoverCheckbox title="Order ID" options={orderIdOptions} value={filterOrderId} onChange={(v) => { setFilterOrderId(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "customer" && <FilterPopoverCheckbox title="Customer" options={customerOptions} value={filterCustomer} onChange={(v) => { setFilterCustomer(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "product" && <FilterPopoverCheckbox title="Product" options={productOptions} value={filterProduct} onChange={(v) => { setFilterProduct(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}

            {openFilterKey === "planningRange" && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 9998 }} onClick={() => setOpenFilterKey(null)} />
                <div style={{ position: "fixed", top: popoverTriggerRect ? popoverTriggerRect.bottom + 8 : 200, left: popoverTriggerRect ? popoverTriggerRect.left : 0, width: "220px", background: "var(--neutral-surface-primary)", border: "1px solid var(--neutral-line-separator-1)", borderRadius: "var(--radius-card)", boxShadow: "var(--elevation-sm)", padding: "16px", display: "flex", flexDirection: "column", gap: "16px", zIndex: 9999 }}>
                  <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Planning Range</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {planningRangeOptions.map((opt) => (
                      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", fontSize: "var(--text-title-3)" }}>
                        <input type="radio" checked={forecastWeeks === opt.value} onChange={() => { setForecastWeeks(opt.value); setOpenFilterKey(null); }} />
                        <span>{opt.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
          <TableSearchField
            value={filterMaterialName}
            onChange={(e) => { setFilterMaterialName(e.target.value); setCurrentPage(1); }}
            placeholder="Search material name or SKU..."
            width="260px"
          />
        </div>

        {/* Active filter pills */}
        {hasActiveFilters && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "8px 24px 12px",
            flexWrap: "wrap",
            borderBottom: "1px solid var(--neutral-line-separator-1)",
            flexShrink: 0,
          }}>
            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Active filters:</span>
            {filterOrderId.map(id => (
              <FilterPill key={`oid-${id}`} label={id} active={true} onRemove={() => setFilterOrderId(prev => prev.filter(x => x !== id))} />
            ))}
            {filterCustomer.map(c => (
              <FilterPill key={`cust-${c}`} label={c} active={true} onRemove={() => setFilterCustomer(prev => prev.filter(x => x !== c))} />
            ))}
            {filterProduct.map(p => (
              <FilterPill key={`prod-${p}`} label={p} active={true} onRemove={() => setFilterProduct(prev => prev.filter(x => x !== p))} />
            ))}
            {filterWoId.map(id => (
              <FilterPill key={`wo-${id}`} label={id} active={true} onRemove={() => setFilterWoId(prev => prev.filter(x => x !== id))} />
            ))}
          </div>
        )}

        <div style={{ overflowX: "auto", overflowY: "auto", flex: 1, position: "relative" }}>
          <div style={{ minWidth: "max-content", display: "flex", flexDirection: "column" }}>
            {/* Table Header */}
            <div
              style={{
                display: "flex",
                background: "var(--neutral-surface-primary)",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                position: "sticky",
                top: 0,
                zIndex: 20,
              }}
            >
              <div style={{ width: "240px", padding: "16px 12px 16px 24px", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", position: "sticky", left: 0, background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 21, color: "var(--neutral-on-surface-primary)" }}>
                Material
              </div>
              <div style={{ width: "140px", padding: "16px 12px", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", position: "sticky", left: "240px", background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 21, color: "var(--neutral-on-surface-primary)" }}>
                On-Hand Stock
              </div>
              <div style={{ width: "120px", padding: "16px 12px", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", position: "sticky", left: "380px", background: "var(--neutral-surface-primary)", borderRight: "2px solid var(--neutral-line-separator-2)", zIndex: 21, color: "var(--neutral-on-surface-primary)" }}>
                Unscheduled
              </div>
              {timelineColumns.map((col, idx) => (
                <div key={idx} style={{ width: "180px", padding: "16px", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", textAlign: "center", borderRight: "1px solid var(--neutral-line-separator-1)", color: "var(--neutral-on-surface-primary)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{col.split(' ')[0]}</div>
                    <div style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)", fontWeight: "var(--font-weight-regular)", marginLeft: "8px" }}>{col.substring(col.indexOf('(')).replace(/[()]/g, '')}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Table Body */}
            {pagedData.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "var(--text-title-3)" }}>
                No materials match the current filters.
              </div>
            ) : pagedData.map((row, rIdx) => (
              <div key={rIdx} style={{ display: "flex", borderBottom: "1px solid var(--neutral-line-separator-1)", minHeight: "64px" }}>
                <div
                  onClick={() => handleMaterialCellClick(row)}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-surface-primary)"; }}
                  style={{ width: "240px", padding: "16px 12px 16px 24px", position: "sticky", left: 0, background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center", cursor: "pointer", transition: "background 0.2s ease" }}
                >
                  <span style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{row.materialName}</span>
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>{row.sku}</span>
                </div>
                <div style={{ width: "140px", padding: "16px 12px", position: "sticky", left: "240px", background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{formatNumberWithCommas(row.onHandStock)}</span>
                  {!!row.incomingPoStock && (
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "4px" }}>+ {formatNumberWithCommas(row.incomingPoStock)} incoming PO</span>
                  )}
                </div>
                <div
                  onClick={() => { if (row.unscheduled > 0) { setUnscheduledMaterial(row); setUnscheduledDrawerOpen(true); } }}
                  onMouseEnter={(e) => { if (row.unscheduled > 0) e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-surface-primary)"; }}
                  style={{ width: "120px", padding: "16px 12px", position: "sticky", left: "380px", background: "var(--neutral-surface-primary)", borderRight: "2px solid var(--neutral-line-separator-2)", zIndex: 10, display: "flex", alignItems: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", cursor: row.unscheduled > 0 ? "pointer" : "default", transition: "background 0.2s ease" }}
                >
                  {formatNumberWithCommas(row.unscheduled)}
                </div>
                {row.timeline.slice(0, forecastWeeks).map((tData, tIdx) => {
                  const procStatus = MOCK_PROCUREMENT_STATUS[row.sku];
                  const slippedWos = tData.workOrders.filter(wo => wo.isSlipped);
                  const isFirstNegWeek = procStatus && tData.weekOffset === procStatus.firstNegativeWeekOffset;
                  const isUrgentToBuy = isFirstNegWeek && procStatus.status !== "ok" && procStatus.daysUntilDemand <= urgencyDaysInAdvance;

                  return (
                    <div
                      key={tIdx}
                      onClick={() => { setSelectedCell({ materialName: row.materialName, sku: row.sku, ...tData }); setIsDrawerOpen(true); }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-surface-primary)"; }}
                      style={{ width: "180px", padding: "12px 16px", borderRight: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", justifyContent: "center", gap: "4px", cursor: "pointer", transition: "background 0.2s ease", background: "var(--neutral-surface-primary)" }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body)" }}>
                        <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Demand</span>
                        <span style={{ fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>{formatNumberWithCommas(tData.demand)}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body)" }}>
                        <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>End Stock</span>
                        <span style={{ fontWeight: "var(--font-weight-bold)", color: tData.endStock < 0 ? "var(--status-red-primary)" : "var(--status-green-primary)" }}>{formatNumberWithCommas(tData.endStock)}</span>
                      </div>
                      {slippedWos.length > 0 && (
                        <div style={{ marginTop: "2px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", background: "#F3F4F6", color: "#525252", fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap" }}>
                            {slippedWos.length} WO(s) delayed
                          </span>
                        </div>
                      )}
                      {isUrgentToBuy && (
                        <div style={{ marginTop: "2px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", background: "var(--status-red-container)", color: "var(--status-red-primary)", fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap" }}>
                            Urgent to Buy
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)", flexShrink: 0 }}>
          <TablePaginationFooter
            totalRows={filteredData.length}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      <UnscheduledWoDrawer
        isOpen={unscheduledDrawerOpen}
        onClose={() => { setUnscheduledDrawerOpen(false); setUnscheduledMaterial(null); }}
        materialData={unscheduledMaterial}
      />

      <DemandUrgencyDrawer
        isOpen={urgencyDrawerOpen}
        onClose={() => { setUrgencyDrawerOpen(false); setUrgencyDrawerMode(null); }}
        filterMode={urgencyDrawerMode}
        urgencyDaysInAdvance={urgencyDaysInAdvance}
        onCreatePo={handleUrgencyCreatePo}
      />

      <MaterialsToBuyDrawer
        isOpen={materialsToBuyOpen}
        onClose={() => setMaterialsToBuyOpen(false)}
        urgencyDaysInAdvance={urgencyDaysInAdvance}
        onCreatePo={handleMaterialsToBuyCreatePo}
      />

      <MaterialBreakdownDrawer
        isOpen={isBreakdownOpen}
        onClose={() => { setIsBreakdownOpen(false); setSelectedMaterial(null); }}
        materialData={selectedMaterial}
        onCreatePo={handleBreakdownCreatePo}
        urgencyDaysInAdvance={urgencyDaysInAdvance}
      />

      <MaterialForecastDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreatePo={handleCreatePo}
        onSelectExistingPo={handleForecastSelectExistingPo}
        selectedCell={selectedCell}
        urgencyDaysInAdvance={urgencyDaysInAdvance}
      />

      <SelectExistingPoDrawer
        isOpen={selectExistingPoOpen}
        onClose={() => setSelectExistingPoOpen(false)}
        onBack={() => { setSelectExistingPoOpen(false); setIsDrawerOpen(true); }}
      />

    </div>
  );
};
