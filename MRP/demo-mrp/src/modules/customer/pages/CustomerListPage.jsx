import React, { useEffect, useState } from "react";
import { Settings, AddIcon, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Button } from "../../../components/common/Button.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { MOCK_CUSTOMERS, getScreeningBadgeVariant } from "../mock/customerMocks.js";

const cellStyle = (overrides) => ({
  minWidth: 0,
  minHeight: "56px",
  padding: "8px 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const wrapTextStyle = {
  whiteSpace: "normal",
  overflowWrap: "anywhere",
};

const tableColumns = [
  { label: "Customer Name", key: "name", flex: "1.6" },
  { label: "Customer Email", key: "email", flex: "1.6" },
  { label: "Customer Phone", key: "phone", flex: "1.2" },
  { label: "Customer Country", key: "country", flex: "1" },
  { label: "Screening Status", key: "screeningStatus", flex: "1" },
];

export const CustomerListPage = ({ onNavigate, showSnackbar, t }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);
  const [, forceRefresh] = useState(0);

  const filteredRows = MOCK_CUSTOMERS.filter((row) => {
    const haystack = `${row.name} ${row.email || ""} ${row.phone || ""}`.toLowerCase();
    return !searchQuery || haystack.includes(searchQuery.toLowerCase());
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, rowsPerPage]);

  useEffect(() => {
    setCurrentPage((prev) => Math.min(prev, totalPages));
  }, [totalPages]);

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
        <h1
          style={{
            margin: 0,
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          Customers
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
            Manage
          </Button>
          <Button variant="filled" leftIcon={AddIcon} onClick={() => onNavigate("create")}>
            New Customer
          </Button>
        </div>
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            borderBottom: "1px solid var(--neutral-line-separator-2)",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search customer name..."
            width="360px"
          />
        </div>

        <div style={{ maxHeight: "calc(100vh - 320px)", overflow: "auto", width: "100%" }}>
          <div style={{ minWidth: "900px", width: "100%", display: "flex", flexDirection: "column" }}>
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
              {tableColumns.map((col, idx) => (
                <div
                  key={idx}
                  style={{
                    flex: col.flex,
                    minWidth: 0,
                    minHeight: "49px",
                    padding: "8px 12px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  <span style={wrapTextStyle}>{col.label}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", flex: filteredRows.length === 0 ? 1 : "0 0 auto" }}>
              {visibleRows.map((row) => (
                <div
                  key={row.id}
                  onClick={() => onNavigate("detail", row)}
                  style={{
                    display: "flex",
                    background: "var(--neutral-surface-primary)",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    transition: "background 0.12s ease",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "var(--neutral-surface-primary)")}
                >
                  <div style={cellStyle({ flex: tableColumns[0].flex, color: "var(--feature-brand-primary)" })}>
                    <span style={wrapTextStyle}>{row.name}</span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>
                    <span style={wrapTextStyle}>{row.email || "-"}</span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>
                    <span style={wrapTextStyle}>{row.phone || "-"}</span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>
                    <span style={wrapTextStyle}>{row.country || "-"}</span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>
                    <StatusBadge variant={getScreeningBadgeVariant(row.screeningStatus)}>
                      {row.screeningStatus || "Not Screened"}
                    </StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 ? (
                <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState
                    illustration={<SearchNotFoundIllustration />}
                    title="No customers found"
                    description="Try adjusting your search keywords."
                  />
                </div>
              ) : null}
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
        />
      </div>
    </div>
  );
};
