import React, { useState, useMemo } from "react";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { MaterialForecastDrawer } from "../components/MaterialForecastDrawer.jsx";
import { CreatePoDrawer } from "../components/CreatePoDrawer.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { FilterPopoverCheckbox } from "../../../components/molecules/FilterPopoverCheckbox.jsx";
import { MaterialBreakdownDrawer } from "../components/MaterialBreakdownDrawer.jsx";
import { DemandUrgencyDrawer } from "../components/DemandUrgencyDrawer.jsx";
import { formatNumberWithCommas } from "../../../utils/format/formatUtils.js";
import { UnscheduledWoDrawer } from "../components/UnscheduledWoDrawer.jsx";
import { MOCK_MATERIAL_FORECAST_DATA, MOCK_FORECAST_COUNTERS, MOCK_PROCUREMENT_STATUS, MOCK_CUSTOMER_PIC_MAP, MOCK_PRODUCT_SKU_MAP } from "../mock/materialForecastMocks.js";

export const MaterialForecastPage = ({ onNavigate, t, showPoSnackbar }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [createPoMaterial, setCreatePoMaterial] = useState(null);
  const [urgencyDrawerOpen, setUrgencyDrawerOpen] = useState(false);
  const [urgencyDrawerType, setUrgencyDrawerType] = useState(null);
  const [createPoMaterials, setCreatePoMaterials] = useState(null);
  const [unscheduledDrawerOpen, setUnscheduledDrawerOpen] = useState(false);
  const [unscheduledMaterial, setUnscheduledMaterial] = useState(null);

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

  const handleCellClick = (material, weekData) => {
    setSelectedCell({ materialName: material.materialName, sku: material.sku, ...weekData });
    setIsDrawerOpen(true);
  };

  const handleCounterClick = (type) => {
    setUrgencyDrawerType(type);
    setUrgencyDrawerOpen(true);
  };

  const handleMaterialCellClick = (row) => {
    setSelectedMaterial(row);
    setIsBreakdownOpen(true);
  };

  const handleCreatePo = (material) => {
    setCreatePoMaterial(material);
    setIsDrawerOpen(false);
    setIsCreatePoOpen(true);
  };

  const handleBreakdownCreatePo = (material) => {
    setCreatePoMaterial(material);
    setIsBreakdownOpen(false);
    setIsCreatePoOpen(true);
  };

  const handleUrgencyCreatePo = (rows) => {
    setCreatePoMaterials(rows);
    setCreatePoMaterial(rows.length === 1 ? rows[0] : null);
    setUrgencyDrawerOpen(false);
    setIsCreatePoOpen(true);
  };

  const handleCreatePoBack = () => {
    setIsCreatePoOpen(false);
    setCreatePoMaterials(null);
    if (urgencyDrawerType) {
      setUrgencyDrawerOpen(true);
    } else if (selectedMaterial) {
      setIsBreakdownOpen(true);
    } else {
      setIsDrawerOpen(true);
    }
  };

  const handleCreatePoClose = () => {
    setIsCreatePoOpen(false);
    setSelectedMaterial(null);
    setCreatePoMaterials(null);
  };

  const allTimelineColumns = MOCK_MATERIAL_FORECAST_DATA[0]?.timeline.map(t => t.week) || [];
  const timelineColumns = allTimelineColumns.slice(0, forecastWeeks);

  const orderIdOptions = useMemo(() => {
    const ids = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(t => t.workOrders.map(wo => wo.orderId).filter(Boolean))));
    return [...ids].sort().map(v => ({ value: v, label: v }));
  }, []);

  const customerOptions = useMemo(() => {
    const names = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(t => t.workOrders.map(wo => wo.customerName))));
    return [...names].sort().map(v => ({ value: v, label: v, subLabel: MOCK_CUSTOMER_PIC_MAP[v] || "" }));
  }, []);

  const productOptions = useMemo(() => {
    const names = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(t => t.workOrders.map(wo => wo.productName).filter(Boolean))));
    return [...names].sort().map(v => ({ value: v, label: v, subLabel: MOCK_PRODUCT_SKU_MAP[v] || "" }));
  }, []);

  const woIdOptions = useMemo(() => {
    const ids = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(t => t.workOrders.map(wo => wo.id).filter(Boolean))));
    return [...ids].sort().map(v => ({ value: v, label: v }));
  }, []);

  const filteredData = useMemo(() => {
    const nameQ = filterMaterialName.trim().toLowerCase();
    return MOCK_MATERIAL_FORECAST_DATA.filter(row => {
      if (nameQ && !row.materialName.toLowerCase().includes(nameQ) && !row.sku.toLowerCase().includes(nameQ)) return false;
      const allWos = row.timeline.flatMap(t => t.workOrders);
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1 style={{ margin: "0", fontSize: "var(--text-big-title)", fontWeight: "var(--font-weight-bold)" }}>
          {t("sidebar.material_forecast", "Material Planning")}
        </h1>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", flexShrink: 0 }}>
        <ListStatusCounterCard label="Overdue" count={MOCK_FORECAST_COUNTERS.overdue} badgeVariant="red-light" onClick={() => handleCounterClick("Overdue")} />
        <ListStatusCounterCard label="Urgent" count={MOCK_FORECAST_COUNTERS.urgent} badgeVariant="orange-light" onClick={() => handleCounterClick("Urgent")} />
        <ListStatusCounterCard label="This Week" count={MOCK_FORECAST_COUNTERS.thisWeek} badgeVariant="blue-light" onClick={() => handleCounterClick("This Week")} />
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
            {/* Work Order ID — first */}
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

            {/* Planning Range — radio popover */}
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

            {/* Multi-select popovers */}
            {openFilterKey === "woId" && <FilterPopoverCheckbox title="Work Order ID" options={woIdOptions} value={filterWoId} onChange={(v) => { setFilterWoId(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "orderId" && <FilterPopoverCheckbox title="Order ID" options={orderIdOptions} value={filterOrderId} onChange={(v) => { setFilterOrderId(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "customer" && <FilterPopoverCheckbox title="Customer" options={customerOptions} value={filterCustomer} onChange={(v) => { setFilterCustomer(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}
            {openFilterKey === "product" && <FilterPopoverCheckbox title="Product" options={productOptions} value={filterProduct} onChange={(v) => { setFilterProduct(v); setCurrentPage(1); }} onClose={() => setOpenFilterKey(null)} triggerRect={popoverTriggerRect} />}

            {/* Planning Range radio popover */}
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
                  const procBadge = isFirstNegWeek && procStatus.status !== "ok" ? procStatus.status : null;
                  const atRiskCount = procBadge === "overdue" ? procStatus.affectedWoIds.length : 0;

                  return (
                    <div
                      key={tIdx}
                      onClick={() => handleCellClick(row, tData)}
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
                      {procBadge === "overdue" && atRiskCount > 0 && (
                        <div style={{ marginTop: "2px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", background: "var(--status-red-container)", color: "var(--status-red-primary)", fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap" }}>
                            {atRiskCount} WO(s) at risk
                          </span>
                        </div>
                      )}
                      {procBadge === "urgent" && (
                        <div style={{ marginTop: "2px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", background: "var(--status-orange-container, #FFF3E0)", color: "var(--status-orange-primary)", fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap" }}>
                            Urgent · order by {procStatus.orderByDate}
                          </span>
                        </div>
                      )}
                      {procBadge === "this_week" && (
                        <div style={{ marginTop: "2px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", background: "var(--feature-brand-container)", color: "var(--feature-brand-primary)", fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap" }}>
                            Order by {procStatus.orderByDateAvg}
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
        onClose={() => { setUrgencyDrawerOpen(false); setUrgencyDrawerType(null); }}
        statusType={urgencyDrawerType}
        onCreatePo={handleUrgencyCreatePo}
      />

      <MaterialBreakdownDrawer
        isOpen={isBreakdownOpen}
        onClose={() => { setIsBreakdownOpen(false); setSelectedMaterial(null); }}
        materialData={selectedMaterial}
        onCreatePo={handleBreakdownCreatePo}
      />

      <MaterialForecastDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        onCreatePo={handleCreatePo}
        selectedCell={selectedCell}
      />

      <CreatePoDrawer
        isOpen={isCreatePoOpen}
        onClose={handleCreatePoClose}
        onBack={handleCreatePoBack}
        showBack={true}
        initialMaterial={createPoMaterials ? null : createPoMaterial}
        initialMaterials={createPoMaterials}
        showPoSnackbar={showPoSnackbar}
        materialSku={createPoMaterial?.sku}
        urgencyStatus={createPoMaterial?.urgencyStatus || null}
      />
    </div>
  );
};
