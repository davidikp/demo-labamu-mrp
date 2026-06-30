import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { StatusBadge, FilterPill, SearchBar, LocaleProvider } from "../../ce-ui";
import { Button } from "../common/Button.jsx";
import { TablePaginationFooter } from "../table/TablePaginationFooter.jsx";
import { useNotifications } from "../../context/NotificationContext.jsx";
import { timeAgo } from "./NotificationBell.jsx";

const STATUS_COLOR = {
  approval: "orange",
  revision: "yellow",
  proof: "blue",
  receipt: "green",
};

// Column layout shared by the header and rows.
const GRID = "minmax(300px, 2fr) 200px 190px 110px 120px";

export const TodoPanel = () => {
  const navigate = useNavigate();
  const { todoItems, language, t } = useNotifications();

  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState([]); // empty = all
  const [statusFilter, setStatusFilter] = useState([]); // empty = all
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);

  const L = {
    en: { title: "Need To Do", module: "Module", status: "Status", allModule: "All Modules", allStatus: "All Status", search: "Search to-do", colItem: "Item", colModule: "Module", colStatus: "Status", colWhen: "When", colAction: "Action", empty: "You are all caught up — no actions needed right now." },
    id: { title: "Perlu Dikerjakan", module: "Modul", status: "Status", allModule: "Semua Modul", allStatus: "Semua Status", search: "Cari tugas", colItem: "Item", colModule: "Modul", colStatus: "Status", colWhen: "Waktu", colAction: "Tindakan", empty: "Anda sudah selesai — tidak ada tindakan yang diperlukan saat ini." },
  }[language === "id" ? "id" : "en"];

  // Filter option lists (multi-select; empty selection = all).
  const moduleOptions = [];
  const statusOptions = [];
  const seenMod = new Set();
  const seenStatus = new Set();
  todoItems.forEach((i) => {
    if (!seenMod.has(i.module)) { seenMod.add(i.module); moduleOptions.push({ value: i.module, label: t(i.moduleLabel) }); }
    if (i.todo && !seenStatus.has(i.todo.type)) { seenStatus.add(i.todo.type); statusOptions.push({ value: i.todo.type, label: t(i.todo.tag) }); }
  });

  const q = search.trim().toLowerCase();
  const rows = todoItems
    .filter((i) => moduleFilter.length === 0 || moduleFilter.includes(i.module))
    .filter((i) => statusFilter.length === 0 || statusFilter.includes(i.todo?.type))
    .filter((i) => !q || `${i.entityId} ${t(i.title)} ${t(i.body)}`.toLowerCase().includes(q));

  const totalPages = Math.max(1, Math.ceil(rows.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const pageRows = rows.slice((currentPage - 1) * perPage, currentPage * perPage);

  // "Our style" table header: bold, dark, 14px.
  const headCell = { fontSize: "14px", fontWeight: 700, color: "var(--neutral-on-surface-primary, #1A1D23)", lineHeight: "20px" };

  return (
    <LocaleProvider locale={language === "id" ? "id" : "en"}>
      <div style={{ background: "#fff", borderRadius: "16px", border: "1px solid #E5E7EB", display: "flex", flexDirection: "column", flex: 1, width: "100%", height: "100%", minHeight: 0 }}>
        {/* Title */}
        <div style={{ flexShrink: 0, padding: "20px 24px 0", display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "#1A1D23" }}>{L.title}</span>
          {todoItems.length > 0 ? (
            <span
              data-no-localize
              style={{
                minWidth: "24px", height: "24px", padding: "0 8px", borderRadius: "999px",
                background: "var(--status-orange-primary)", color: "#fff",
                display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700,
              }}
            >
              {todoItems.length}
            </span>
          ) : null}
        </div>

        {/* Search & filter */}
        <div style={{ flexShrink: 0, padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <FilterPill label={L.module} options={moduleOptions} multiple searchable={false} values={moduleFilter} onChangeMultiple={(v) => { setModuleFilter(v); setPage(1); }} size="sm" />
            <FilterPill label={L.status} options={statusOptions} multiple searchable={false} values={statusFilter} onChangeMultiple={(v) => { setStatusFilter(v); setPage(1); }} size="sm" />
          </div>
          <div style={{ width: "320px", maxWidth: "100%" }}>
            <SearchBar value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder={L.search} onClear={() => { setSearch(""); setPage(1); }} />
          </div>
        </div>

        {/* Table — scrolls internally once the section is pinned to the top */}
        <div style={{ flex: "1 1 auto", minHeight: 0, overflow: "auto" }}>
          <div style={{ minWidth: "920px" }}>
            {/* Header */}
            <div style={{ position: "sticky", top: 0, zIndex: 1, background: "#fff", display: "grid", gridTemplateColumns: GRID, gap: "12px", padding: "14px 24px", borderBottom: "1px solid #E5E7EB" }}>
              <span style={headCell}>{L.colItem}</span>
              <span style={headCell}>{L.colModule}</span>
              <span style={headCell}>{L.colStatus}</span>
              <span style={headCell}>{L.colWhen}</span>
              <span style={headCell}>{L.colAction}</span>
            </div>

            {/* Rows */}
            {pageRows.length === 0 ? (
              <div style={{ padding: "36px 24px", textAlign: "center", color: "#6B7280", fontSize: "14px" }}>{L.empty}</div>
            ) : (
              pageRows.map((i) => (
                <div key={i.id} style={{ display: "grid", gridTemplateColumns: GRID, gap: "12px", padding: "16px 24px", borderBottom: "1px solid #F4F5F7", alignItems: "start" }}>
                  <div style={{ minWidth: 0, display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span data-no-localize style={{ fontSize: "13px", fontWeight: 700, color: "#1A1D23" }}>{i.entityId}</span>
                    <span style={{ fontSize: "12px", color: "#6B7280", lineHeight: 1.45 }}>{t(i.body)}</span>
                  </div>
                  <div style={{ fontSize: "13px", color: "#374151", whiteSpace: "nowrap", alignSelf: "center" }}>{t(i.moduleLabel)}</div>
                  <div style={{ alignSelf: "center" }}>
                    <StatusBadge color={STATUS_COLOR[i.todo.type] || "blue"} tone="soft" label={t(i.todo.tag)} />
                  </div>
                  <div data-no-localize style={{ fontSize: "12px", color: "#9CA3AF", whiteSpace: "nowrap", alignSelf: "center" }}>{timeAgo(i.createdAt, language)}</div>
                  <div style={{ alignSelf: "center", display: "flex", justifyContent: "flex-start" }}>
                    <Button variant="outlined" size="small" onClick={() => i.entityRoute && navigate(i.entityRoute)}>
                      {t(i.todo.action)}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pagination footer */}
        {rows.length > 0 ? (
          <div style={{ flexShrink: 0, borderTop: "1px solid #E5E7EB" }}>
            <TablePaginationFooter
              totalRows={rows.length}
              rowsPerPage={perPage}
              onRowsPerPageChange={(n) => { setPerPage(n); setPage(1); }}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </div>
        ) : null}
      </div>
    </LocaleProvider>
  );
};
