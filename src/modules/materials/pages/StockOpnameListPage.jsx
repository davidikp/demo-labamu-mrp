import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AddIcon, ChevronLeft, ChevronDownIcon, Download, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Tooltip } from "../../../components/common/Tooltip.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { getStockOpnames, subscribeStockOpnames, displayStatusLabel } from "../mock/stockOpnamesStore.js";
import { downloadStockCountSheetCsv } from "../mock/stockOpnameFieldsConfig.js";
import { NewStockOpnameModal } from "../components/NewStockOpnameModal.jsx";

const STATUS_VARIANT = {
  Mapping: "orange",
  "Normalizing Data": "yellow",
  Review: "grey",
  Processing: "blue",
  Completed: "green",
  Cancelled: "red",
};

// Statuses whose Stock Opname No should route back into the in-progress
// wizard rather than the read-only Result page (PRD "List & Entry Point" AC
// 5). "Processing" is NOT included — it opens the Result page in its own
// loading state (AC 6), same as Completed/Cancelled.
const IN_PROGRESS_STATUSES = new Set(["Mapping", "Normalizing Data", "Review"]);

// Only wraps in a Tooltip when the text is actually clipped by its own
// ellipsis — comparing scrollWidth (the text's full rendered width) against
// clientWidth (what's actually visible). Re-measures on resize since the
// Source File column's width can change with the viewport.
const TruncatedText = ({ text }) => {
  const ref = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useLayoutEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (el) setIsTruncated(el.scrollWidth > el.clientWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [text]);

  const span = (
    <span ref={ref} style={{ display: "block", width: "100%", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
      {text}
    </span>
  );

  return isTruncated ? (
    <Tooltip content={text} className="w-full min-w-0">
      {span}
    </Tooltip>
  ) : (
    span
  );
};

const formatDate = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    const datePart = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
    const timePart = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
    return `${datePart}; ${timePart}`;
  } catch {
    return iso;
  }
};

export const StockOpnameListPage = ({ onNavigate }) => {
  const [records, setRecords] = useState(getStockOpnames());
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState({ status: [] });
  const [createdByFilters, setCreatedByFilters] = useState([]);
  const [dateFilterType, setDateFilterType] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState(null);
  const [customDateTo, setCustomDateTo] = useState(null);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortDirection, setSortDirection] = useState(null); // null | "asc" | "desc"
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  useEffect(() => subscribeStockOpnames(setRecords), []);

  const openNewStockOpname = (startMethod) => {
    setIsNewModalOpen(false);
    onNavigate("materials_stock-opname-new", { startMethod });
  };

  const toggleCreatedAtSort = () => {
    setSortDirection((prev) => (prev === "desc" ? "asc" : prev === "asc" ? null : "desc"));
  };

  // Same "Last 7 days / Last 30 days / custom range" convention as
  // MaterialRequestListPage's own "Requested Date" filter.
  const createdByOptions = Array.from(new Set(records.map((r) => r.createdBy).filter(Boolean)));
  const matchesDateFilter = (isoValue) => {
    if (dateFilterType === "all") return true;
    const rowDate = new Date(isoValue);
    if (Number.isNaN(rowDate.getTime())) return false;
    const now = new Date();
    if (dateFilterType === "last7" || dateFilterType === "last30") {
      const start = new Date(now);
      start.setDate(now.getDate() - (dateFilterType === "last7" ? 7 : 30));
      return rowDate >= start && rowDate <= now;
    }
    if (dateFilterType === "__custom__" && customDateFrom && customDateTo) {
      return rowDate >= customDateFrom && rowDate <= customDateTo;
    }
    return true;
  };

  const filteredRows = records
    .filter((row) => {
      const matchesSearch = !searchQuery || row.id.toLowerCase().includes(searchQuery.toLowerCase()) || (row.sourceFile || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = activeFilters.status.length === 0 || activeFilters.status.includes(row.status);
      const matchesCreatedBy = createdByFilters.length === 0 || createdByFilters.includes(row.createdBy);
      const matchesDate = matchesDateFilter(row.createdAt);
      return matchesSearch && matchesStatus && matchesCreatedBy && matchesDate;
    })
    .sort((a, b) => {
      if (!sortDirection) return 0;
      const diff = new Date(a.createdAt) - new Date(b.createdAt);
      return sortDirection === "asc" ? diff : -diff;
    });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, activeFilters, createdByFilters, dateFilterType, customDateFrom, customDateTo]);

  const tableColumns = [
    { label: "Stock Opname No", key: "id", flex: "1.4" },
    { label: "Source File", key: "sourceFile", flex: "1.4" },
    { label: "Stock Opname By", key: "createdBy", flex: "1.6" },
    { label: "Stock Opname Time", key: "createdAt", flex: "1.6", sortable: true },
    { label: "Total Data", key: "totalRows", flex: "1" },
    { label: "Status", key: "status", flex: "1.4", minWidth: "160px" },
  ];

  const openRecord = (row) => {
    if (IN_PROGRESS_STATUSES.has(row.status)) {
      onNavigate("materials_stock-opname-new", { resumeStockOpnameId: row.id });
    } else {
      // Processing / Completed / Cancelled all open the same result/detail
      // page — it renders a loading state itself while Processing.
      onNavigate("materials_stock-opname-result", { stockOpnameId: row.id });
    }
  };

  return (
    <div style={{ height: "calc(100vh - 64px)", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px", overflow: "hidden", minHeight: 0 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div
            style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }}
            onClick={() => onNavigate("materials_list")}
          >
            <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              Stock Opname
            </h1>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("materials_list")}>
              Materials
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Stock Opname</span>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Download} onClick={downloadStockCountSheetCsv}>
            Download Stock Count Sheet
          </Button>
          <Button variant="filled" leftIcon={AddIcon} onClick={() => setIsNewModalOpen(true)}>
            New Stock Opname
          </Button>
        </div>
      </div>

      <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--neutral-line-separator-2)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <FilterMenu
              label="Status"
              multiple
              searchable={false}
              options={["Mapping", "Normalizing Data", "Review", "Processing", "Completed", "Cancelled"].map((s) => ({ value: s, label: displayStatusLabel(s) }))}
              values={activeFilters.status}
              onChangeMultiple={(values) => setActiveFilters((prev) => ({ ...prev, status: values }))}
            />
            <FilterMenu
              label="Stock Opname By"
              multiple
              searchable
              options={createdByOptions.map((name) => ({ value: name, label: name }))}
              values={createdByFilters}
              onChangeMultiple={setCreatedByFilters}
            />
            <FilterMenu
              label="Stock Opname Time"
              searchable={false}
              options={[
                { value: "last7", label: "Last 7 days" },
                { value: "last30", label: "Last 30 days" },
              ]}
              value={dateFilterType}
              onChange={setDateFilterType}
              allValue="all"
              customDateEnabled
              customDateFrom={customDateFrom}
              customDateTo={customDateTo}
              onCustomDateChange={(from, to) => {
                setCustomDateFrom(from);
                setCustomDateTo(to);
              }}
            />
          </div>
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Stock Opname No or Source File"
            width="360px"
          />
        </div>

        <div style={{ maxHeight: "calc(100vh - 300px)", overflowY: "auto", overflowX: "auto", width: "100%" }}>
          <div style={{ minWidth: "1080px", width: "100%", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", borderBottom: "1px solid var(--neutral-line-separator-1)", position: "sticky", top: 0, background: "var(--neutral-surface-primary)", zIndex: 20 }}>
              {tableColumns.map((col, idx) => (
                <div
                  key={idx}
                  onClick={col.sortable ? toggleCreatedAtSort : undefined}
                  style={{
                    flex: col.flex,
                    minWidth: col.minWidth,
                    flexShrink: col.minWidth ? 0 : undefined,
                    padding: "16px 12px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    whiteSpace: "nowrap",
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    cursor: col.sortable ? "pointer" : "default",
                    userSelect: col.sortable ? "none" : undefined,
                  }}
                >
                  {col.label}
                  {col.sortable && (
                    <ChevronDownIcon
                      size={14}
                      color={sortDirection ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                      style={{ transform: sortDirection === "asc" ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => openRecord(row)}
                  style={{ display: "flex", borderBottom: "1px solid var(--neutral-line-separator-1)", alignItems: "center", cursor: "pointer" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={{ flex: tableColumns[0].flex, minWidth: 0, padding: "12px", fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.id}</div>
                  <div style={{ flex: tableColumns[1].flex, minWidth: 0, padding: "12px", fontSize: "var(--text-title-3)", overflow: "hidden" }}>
                    {row.sourceFile ? <TruncatedText text={row.sourceFile} /> : "-"}
                  </div>
                  <div style={{ flex: tableColumns[2].flex, minWidth: 0, padding: "12px", fontSize: "var(--text-title-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{row.createdBy}</div>
                  <div style={{ flex: tableColumns[3].flex, minWidth: 0, padding: "12px", fontSize: "var(--text-title-3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{formatDate(row.createdAt)}</div>
                  <div style={{ flex: tableColumns[4].flex, minWidth: 0, padding: "12px", fontSize: "var(--text-title-3)" }}>{row.totalRows}</div>
                  <div style={{ flex: tableColumns[5].flex, minWidth: tableColumns[5].minWidth, flexShrink: 0, padding: "12px", whiteSpace: "nowrap", overflow: "hidden" }}>
                    <StatusBadge variant={STATUS_VARIANT[row.status] || "grey"}>{displayStatusLabel(row.status)}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState illustration={<SearchNotFoundIllustration />} title="No Stock Opname records found" description="Try adjusting your filters or search keywords." />
                </div>
              )}
            </div>
          </div>
        </div>

        <TablePaginationFooter
          totalRows={filteredRows.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          style={{ background: "var(--neutral-surface-primary)", borderBottomLeftRadius: "var(--radius-card)", borderBottomRightRadius: "var(--radius-card)" }}
        />
      </div>

      <NewStockOpnameModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSelectManual={() => openNewStockOpname("manual")}
        onSelectUpload={() => openNewStockOpname("upload")}
      />
    </div>
  );
};
