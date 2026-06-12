import React, { useState, useMemo } from "react";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { MaterialForecastDrawer } from "../components/MaterialForecastDrawer.jsx";
import { CreatePoDrawer } from "../components/CreatePoDrawer.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { MultiSelectDropdown } from "../../../components/common/MultiSelectDropdown.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { MOCK_MATERIAL_FORECAST_DATA, MOCK_FORECAST_COUNTERS, MOCK_PROCUREMENT_STATUS } from "../mock/materialForecastMocks.js";

export const MaterialForecastPage = ({ onNavigate, t, showPoSnackbar }) => {
  const [selectedCell, setSelectedCell] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isCreatePoOpen, setIsCreatePoOpen] = useState(false);
  const [createPoMaterial, setCreatePoMaterial] = useState(null);

  const [filterWoId, setFilterWoId] = useState("");
  const [filterOrderId, setFilterOrderId] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleCellClick = (material, weekData) => {
    setSelectedCell({ materialName: material.materialName, sku: material.sku, ...weekData });
    setIsDrawerOpen(true);
  };

  const handleCounterClick = (type) => {
    onNavigate("/material-forecast/counter_detail", { title: type });
  };

  const handleCreatePo = (material) => {
    setCreatePoMaterial(material);
    setIsDrawerOpen(false);
    setIsCreatePoOpen(true);
  };

  const handleCreatePoBack = () => {
    setIsCreatePoOpen(false);
    setIsDrawerOpen(true);
  };

  const handleCreatePoClose = () => {
    setIsCreatePoOpen(false);
  };

  const timelineColumns = MOCK_MATERIAL_FORECAST_DATA[0]?.timeline.map(t => t.week) || [];

  const orderIdOptions = useMemo(() => {
    const ids = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(t => t.workOrders.map(wo => wo.orderId).filter(Boolean))));
    return [...ids].sort().map(v => ({ value: v, label: v }));
  }, []);

  const customerOptions = useMemo(() => {
    const names = new Set(MOCK_MATERIAL_FORECAST_DATA.flatMap(r => r.timeline.flatMap(t => t.workOrders.map(wo => wo.customerName))));
    return [...names].sort().map(v => ({ value: v, label: v }));
  }, []);

  const filteredData = useMemo(() => {
    const woIdQ = filterWoId.trim().toLowerCase();
    return MOCK_MATERIAL_FORECAST_DATA.filter(row => {
      const allWos = row.timeline.flatMap(t => t.workOrders);
      if (woIdQ && !allWos.some(wo => wo.id.toLowerCase().includes(woIdQ))) return false;
      if (filterOrderId.length > 0 && !allWos.some(wo => filterOrderId.includes(wo.orderId))) return false;
      if (filterCustomer.length > 0 && !allWos.some(wo => filterCustomer.includes(wo.customerName))) return false;
      return true;
    });
  }, [filterWoId, filterOrderId, filterCustomer]);

  const totalPages = Math.max(1, Math.ceil(filteredData.length / rowsPerPage));
  const pagedData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const hasActiveFilters = filterOrderId.length > 0 || filterCustomer.length > 0;

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
          {t("sidebar.material_forecast", "Material Forecast")}
        </h1>
      </div>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", flexShrink: 0 }}>
        <ListStatusCounterCard label="Incoming PO" count={MOCK_FORECAST_COUNTERS.incomingPo} badgeVariant="blue-light" onClick={() => handleCounterClick("Incoming PO")} />
        <ListStatusCounterCard label="Overdue" count={MOCK_FORECAST_COUNTERS.overdue} badgeVariant="red-light" onClick={() => handleCounterClick("Overdue")} />
        <ListStatusCounterCard label="Urgent" count={MOCK_FORECAST_COUNTERS.urgent} badgeVariant="orange-light" onClick={() => handleCounterClick("Urgent")} />
        <ListStatusCounterCard label="This Week" count={MOCK_FORECAST_COUNTERS.thisWeek} badgeVariant="green-light" onClick={() => handleCounterClick("This Week")} />
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
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <MultiSelectDropdown
              placeholder="Order ID"
              value={filterOrderId}
              options={orderIdOptions}
              onChange={(v) => { setFilterOrderId(v); setCurrentPage(1); }}
              searchable={true}
            />
            <MultiSelectDropdown
              placeholder="Customer"
              value={filterCustomer}
              options={customerOptions}
              onChange={(v) => { setFilterCustomer(v); setCurrentPage(1); }}
              searchable={true}
            />
          </div>
          <TableSearchField
            value={filterWoId}
            onChange={(e) => { setFilterWoId(e.target.value); setCurrentPage(1); }}
            placeholder="Search Work Order ID..."
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
              <div style={{ width: "280px", padding: "16px 12px 16px 24px", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", position: "sticky", left: 0, background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 21, color: "var(--neutral-on-surface-primary)" }}>
                Material
              </div>
              <div style={{ width: "140px", padding: "16px 12px", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", position: "sticky", left: "280px", background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 21, color: "var(--neutral-on-surface-primary)" }}>
                On-Hand Stock
              </div>
              <div style={{ width: "140px", padding: "16px 12px", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", position: "sticky", left: "420px", background: "var(--neutral-surface-primary)", borderRight: "2px solid var(--neutral-line-separator-2)", zIndex: 21, color: "var(--neutral-on-surface-primary)" }}>
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
                  onClick={() => handleCellClick(row, { week: "Material Detail", demand: "-", endStock: "-" })}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "var(--neutral-surface-primary)"; }}
                  style={{ width: "280px", padding: "16px 12px 16px 24px", position: "sticky", left: 0, background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center", cursor: "pointer", transition: "background 0.2s ease" }}
                >
                  <span style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{row.materialName}</span>
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>{row.sku}</span>
                </div>
                <div style={{ width: "140px", padding: "16px 12px", position: "sticky", left: "280px", background: "var(--neutral-surface-primary)", borderRight: "1px solid var(--neutral-line-separator-1)", zIndex: 10, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{row.onHandStock}</span>
                  <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", marginTop: "4px" }}>+ {row.incomingPoStock || 0} incoming PO</span>
                </div>
                <div style={{ width: "140px", padding: "16px 12px", position: "sticky", left: "420px", background: "var(--neutral-surface-primary)", borderRight: "2px solid var(--neutral-line-separator-2)", zIndex: 10, display: "flex", alignItems: "center", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                  {row.unscheduled}
                </div>
                {row.timeline.map((tData, tIdx) => {
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
                        <span style={{ fontWeight: "var(--font-weight-semi-bold)", color: "var(--neutral-on-surface-primary)" }}>{tData.demand}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-body)" }}>
                        <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>End Stock</span>
                        <span style={{ fontWeight: "var(--font-weight-bold)", color: tData.endStock < 0 ? "var(--status-red-primary)" : "var(--status-green-primary)" }}>{tData.endStock}</span>
                      </div>
                      {slippedWos.length > 0 && (
                        <div style={{ marginTop: "2px" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 6px", borderRadius: "4px", background: "var(--status-red-container)", color: "var(--status-red-primary)", fontSize: "10px", fontWeight: "700", whiteSpace: "nowrap" }}>
                            {slippedWos.length} WO(s) slipped
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
        initialMaterial={createPoMaterial}
        showPoSnackbar={showPoSnackbar}
      />
    </div>
  );
};
