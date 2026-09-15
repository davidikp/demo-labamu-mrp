import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, Info, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge, LabelValue } from "../../../components/index.js";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { Table, EmptyState } from "../../../ce-ui";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { BackgroundProcessingScreen } from "../components/BackgroundProcessingScreen.jsx";
import { Stepper } from "../components/StockOpnameStepper.jsx";
import { getStockOpname, subscribeStockOpnames, updateStockOpname, SYSTEM_ACTOR_NAME, displayStatusLabel } from "../mock/stockOpnamesStore.js";
import { applyStockOpnameRows } from "../mock/stockOpnameProcessing.js";

const STATUS_VARIANT = { Processing: "blue", Completed: "green", Cancelled: "red" };
const RESULT_VARIANT = { Adjusted: "blue-light", "New Batch": "green-light", "No Change": "grey-light", "Not Applied": "red-light" };

// Same 4-card set as the summary tiles, restyled as clickable filter chips —
// same component/convention as WorkOrderListPage's own status filter row.
const RESULT_CARDS = [
  { key: "Adjusted", label: "Adjusted", badgeVariant: "blue-light" },
  { key: "New Batch", label: "New Batch", badgeVariant: "green-light" },
  { key: "No Change", label: "No Change", badgeVariant: "grey-light" },
  { key: "Not Applied", label: "Not Applied", badgeVariant: "red-light" },
];

const formatDateTime = (iso) => {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}; ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return iso;
  }
};

// No horizontal padding here — the ce-ui Table already puts px-4 on both th
// and td, so adding more here (beyond the vertical spacing the .so-result-
// table CSS override expects) would offset a cell's content from its
// header, since inline style always wins over the CSS override's own rule.
const cellStyle = { padding: "8px 0", fontSize: "var(--text-title-3)", display: "flex", alignItems: "center" };

// Completed/Cancelled/Processing detail — PRD "Result & Cancellation" AC
// 1-10. Result Data is always read-only here (no edit affordances), and this
// same page is also what a "Processing" Stock Opname No opens into, showing
// its own loading state until the run finishes (AC 6). Header/info-card/
// cancelled-banner layout mirrors PurchaseOrderDetailPage's own
// PoDetailHeader for visual consistency across detail pages.
export const StockOpnameResultPage = ({ onNavigate, showSnackbar, initialData }) => {
  const stockOpnameId = initialData?.stockOpnameId || null;
  const [record, setRecord] = useState(() => (stockOpnameId ? getStockOpname(stockOpnameId) : null));
  const [resultFilters, setResultFilters] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!stockOpnameId) return undefined;
    return subscribeStockOpnames((all) => setRecord(all.find((r) => r.id === stockOpnameId) || null));
  }, [stockOpnameId]);

  // Resilience for a "Processing" record reached directly from the list
  // (reload, or a seeded demo record) rather than right after clicking Apply
  // on the wizard — that page's own in-memory timer wouldn't exist yet, so
  // this page takes over running the simulated completion itself. Guarded so
  // it only ever schedules once per mount.
  const hasScheduledRef = useRef(false);
  const processTimeoutRef = useRef(null);
  useEffect(() => {
    if (record?.status === "Processing" && !hasScheduledRef.current) {
      hasScheduledRef.current = true;
      processTimeoutRef.current = setTimeout(() => {
        const { rows: resultRows, summary } = applyStockOpnameRows(record.rows || []);
        // StockOpnameNotifier fires "Stock Opname Completed" on its own once
        // it sees this Processing -> Completed transition.
        updateStockOpname(record.id, {
          status: "Completed",
          rows: resultRows,
          result: summary,
          logActorName: SYSTEM_ACTOR_NAME,
        });
      }, 5000);
      return () => clearTimeout(processTimeoutRef.current);
    }
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [record?.status]);

  // Demo-only: mirrors StockOpnameNewPage's own "Simulate Processing Failure"
  // control for a Processing record reached directly from the list, where
  // that page's in-memory timer never ran — see the scheduling effect above.
  const handleSimulateProcessingFailure = () => {
    clearTimeout(processTimeoutRef.current);
    processTimeoutRef.current = null;
    updateStockOpname(record.id, {
      status: "Cancelled",
      logActorName: SYSTEM_ACTOR_NAME,
      logTitle: "Stock Opname Canceled",
      logDesc: "The system could not continue processing due to a simulated infrastructure failure. No stock was adjusted.",
    });
    showSnackbar?.("Stock Opname was cancelled by the system.", "error");
    onNavigate("materials_stock-opname-list");
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [resultFilters, searchQuery]);

  if (!record) {
    return (
      <div style={{ padding: "24px" }}>
        <Button variant="tertiary" leftIcon={ChevronLeft} onClick={() => onNavigate("materials_stock-opname-list")}>Back to Stock Opname List</Button>
        <div style={{ marginTop: "40px", textAlign: "center", color: "var(--neutral-on-surface-secondary)" }}>Stock Opname record not found.</div>
      </div>
    );
  }

  // Cancelled Stock Opname never ran Processing, so every row is Not Applied
  // by definition (PRD "Result & Cancellation" AC 9), regardless of whatever
  // the row's own `result` field (if any, from a previous Apply attempt)
  // says — this is the single place that "effective" result is decided, so
  // both the filter cards' counts and the table's badges agree with it.
  const effectiveResult = (row) => (record.status === "Cancelled" ? "Not Applied" : row.result || "Not Applied");

  const allRows = record.rows || [];
  const resultCounts = RESULT_CARDS.reduce((acc, card) => {
    acc[card.key] = allRows.filter((row) => effectiveResult(row) === card.key).length;
    return acc;
  }, {});
  const filteredRows = allRows.filter((row) => {
    const matchesResult = resultFilters.length === 0 || resultFilters.includes(effectiveResult(row));
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch = !query || [row.materialSku, row.materialName, row.batchNo].some((v) => String(v || "").toLowerCase().includes(query));
    return matchesResult && matchesSearch;
  });
  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  // The reason typed into CancelStockOpnameConfirmModal is stored as the
  // "Stock Opname Cancelled" activity log's own description (see
  // StockOpnameNewPage.handleCancel) rather than a separate field — this is
  // the one place that needs to look it up, by finding that log entry.
  const cancelledReason = [...(record.logs || [])].reverse().find((l) => l.title === "Stock Opname Cancelled")?.desc
    || "This Stock Opname was cancelled and no stock was adjusted.";

  const columns = [
    { key: "materialSku", header: "Material SKU", width: 180, render: (_, row) => <div style={cellStyle}>{row.materialSku || "-"}</div> },
    { key: "materialName", header: "Material Name", width: 220, render: (_, row) => <div style={cellStyle}>{row.materialName || "-"}</div> },
    { key: "batch", header: "Batch", width: 180, render: (_, row) => <div style={cellStyle}>{row.batchNo || (row.pendingBatch ? "New Batch (Pending)" : "-")}</div> },
    { key: "initialQty", header: "Initial Qty", width: 110, render: (_, row) => <div style={cellStyle}>{row.initialQty ?? "-"}</div> },
    { key: "beforeQty", header: "Before Qty", width: 110, render: (_, row) => <div style={cellStyle}>{row.beforeQty ?? "-"}</div> },
    { key: "countedQty", header: "Counted Qty", width: 120, render: (_, row) => <div style={cellStyle}>{row.countedQty ?? "-"}</div> },
    {
      key: "variance",
      header: "Variance",
      width: 100,
      render: (_, row) => {
        const variance = Number.isFinite(Number(row.countedQty)) && Number.isFinite(row.beforeQty) ? Number(row.countedQty) - row.beforeQty : null;
        return <div style={{ ...cellStyle, fontWeight: "var(--font-weight-bold)" }}>{variance == null ? "-" : variance > 0 ? `+${variance}` : variance}</div>;
      },
    },
    {
      key: "result",
      header: "Result",
      width: 140,
      render: (_, row) => {
        const result = effectiveResult(row);
        return (
          <div style={cellStyle}>
            <StatusBadge variant={RESULT_VARIANT[result] || "grey"}>{result}</StatusBadge>
          </div>
        );
      },
    },
  ];

  const data = visibleRows.map((row) => ({ ...row, id: row.__rowId }));

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }} onClick={() => onNavigate("materials_stock-opname-list")}>
            <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              Stock Opname Detail
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("materials_list")}>Materials</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("materials_stock-opname-list")}>Stock Opname</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Stock Opname Detail</span>
          </div>
        </div>
        {record.status === "Processing" && !record.sourceFile && (
          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--neutral-line-separator-1)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Manual Entry</span>
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>{record.id}</span>
          </div>
        )}
      </div>

      {record.status === "Cancelled" && (
        <div
          style={{
            border: "1px solid #E04B45",
            background: "#F8E6E8",
            borderRadius: "16px",
            padding: "20px 24px",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <Info size={16} strokeWidth={2.1} color="var(--status-red-primary)" style={{ flexShrink: 0, marginTop: "2px" }} />
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              Stock Opname Cancelled
            </span>
            <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", lineHeight: "1.6" }}>
              {cancelledReason}
            </span>
          </div>
        </div>
      )}

      {record.status === "Processing" ? (
        record.sourceFile && (
          <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
            <Stepper currentKey="review" allDone />
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}>{record.sourceFile}</span>
              <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>{record.id}</span>
            </div>
          </div>
        )
      ) : (
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)" }}>
          <div style={{ padding: "20px 24px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "var(--text-headline)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              {record.id}
            </span>
            <StatusBadge variant={STATUS_VARIANT[record.status] || "grey"}>{displayStatusLabel(record.status)}</StatusBadge>
          </div>
          <div style={{ margin: "0 24px", borderTop: "1px solid var(--neutral-line-separator-1)" }} />
          <div style={{ padding: "16px 24px", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "24px" }}>
            <LabelValue label="Stock Opname By" value={record.createdBy} />
            <LabelValue label="Source File" value={record.sourceFile || "-"} />
            <LabelValue label="Stock Opname Time" value={formatDateTime(record.createdAt)} />
            <LabelValue label="Applied At" value={formatDateTime(record.appliedAt)} />
            <LabelValue label="Total Data" value={record.totalRows} />
          </div>
        </div>
      )}

      {record.status === "Processing" && (
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", position: "relative" }}>
          <BackgroundProcessingScreen
            title="Applying Your Stock Opname"
            message="We're updating your stock based on the final counted quantities. You can leave this page and we'll notify you when it's done."
            buttonLabel="Back to Stock Opname List"
            onBackToList={() => onNavigate("materials_stock-opname-list")}
          />
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "6px",
              padding: "10px",
              borderRadius: "var(--radius-card)",
              border: "1px dashed var(--neutral-line-separator-2)",
              background: "var(--neutral-surface-grey-lighter)",
            }}
          >
            <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Demo: simulate a failure</span>
            <Button size="small" variant="outlined" onClick={handleSimulateProcessingFailure}>
              Simulate Processing Failure
            </Button>
          </div>
        </div>
      )}

      {(record.status === "Completed" || record.status === "Cancelled") && record.result && (
        <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {RESULT_CARDS.map((card) => (
            <ListStatusCounterCard
              key={card.key}
              label={card.label}
              count={resultCounts[card.key] || 0}
              badgeVariant={card.badgeVariant}
              active={resultFilters.includes(card.key)}
              onClick={() =>
                setResultFilters((prev) =>
                  prev.includes(card.key) ? prev.filter((k) => k !== card.key) : [...prev, card.key]
                )
              }
            />
          ))}
        </div>
      )}

      {(record.status === "Completed" || record.status === "Cancelled") && (
        <div style={{ maxHeight: "560px", minHeight: "320px", display: "flex", flexDirection: "column" }}>
          {/* A bounded card with its own internal scrollbar — same idea as
              the Dashboard's "Need To Do" panel — rather than an unbounded
              flex:1 region: the page itself keeps scrolling normally (root
              is no longer overflow: hidden), and naturally stops once
              everything, table included, has scrolled into view. */}
          {/* Same header/cell alignment fix + built-in-footer hide as
              StockOpnameReviewStep's own table — the ce-ui Table forces
              `vertical-align: top` on every cell and ships its own footer,
              which would otherwise show up twice alongside
              TablePaginationFooter below. Unlike that editable grid (which
              deliberately scrolls horizontally to keep its form fields at a
              fixed width), this table's columns are read-only text, so it
              skips `table-layout: fixed` entirely — with every column
              declaring a `width`, "fixed" would honor those as literal px
              floors and let the table grow past its container (forcing a
              horizontal scrollbar) whenever they summed to more than
              whatever room the sidebar left. Default `table-layout: auto`
              treats those widths as hints instead, so the table always
              stays within its container — wrapping cell text like a long
              Material Name onto more lines rather than ever overflowing. */}
          <style>{`
            .so-result-table table { width: 100%; }
            .so-result-table th, .so-result-table td { height: auto !important; overflow: hidden; vertical-align: top; display: table-cell !important; }
            .so-result-table td > div { padding: 8px 0; }
            .so-result-table th { padding-top: 12px !important; padding-bottom: 12px !important; border-bottom: none !important; box-shadow: inset 0 -1px 0 var(--neutral-line-separator-2); }
            .so-result-table { border-radius: var(--radius-card) var(--radius-card) 0 0 !important; }
            .so-result-table > div:last-child { display: none; }
          `}</style>
          <Table
            className="so-result-table flex-1 min-h-0"
            columns={columns}
            data={data}
            totalRows={filteredRows.length}
            page={currentPage}
            perPage={rowsPerPage}
            onPageChange={setCurrentPage}
            emptyState={
              <EmptyState
                illustration={<SearchNotFoundIllustration />}
                title="No rows found"
                description="Try adjusting the search or result filter."
              />
            }
            toolbar={
              <div style={{ display: "flex", justifyContent: "flex-end", width: "100%" }}>
                <TableSearchField
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by Material SKU, Name, or Batch"
                  width="320px"
                />
              </div>
            }
          />
          {filteredRows.length > 0 && (
            <TablePaginationFooter
              totalRows={filteredRows.length}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(n) => { setRowsPerPage(n); setCurrentPage(1); }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              style={{
                background: "var(--neutral-surface-primary)",
                borderBottomLeftRadius: "var(--radius-card)",
                borderBottomRightRadius: "var(--radius-card)",
                border: "1px solid var(--neutral-line-separator-1)",
                borderTop: "none",
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};
