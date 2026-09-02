import React, { useEffect, useState } from "react";
import { ChevronDownIcon, Settings, AddIcon, SearchNotFoundIllustration } from "../../../components/icons/Icons.jsx";
import { EmptyState } from "../../../ce-ui";
import { Button } from "../../../components/common/Button.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { MOCK_QUOTES } from "../mock/quoteMocks.js";
import { cellStyle } from "../utils/quoteTableUtils.js";

export const QuoteListPage = ({ onNavigate, t }) => {
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [filterStatuses, setFilterStatuses] = useState([]);
  const [filterCustomer, setFilterCustomer] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const tableColumns = [
    { label: "Quote No", key: "quoteNo", flex: "1.6", sortable: true },
    { label: "RFQ No", key: "rfqNo", flex: "1.6", sortable: true },
    { label: "Customer Name", key: "customerName", flex: "1.2", sortable: true },
    { label: "Created By", key: "createdBy", flex: "1", sortable: true },
    { label: "Created At", key: "createdAt", flex: "1", sortable: true },
    { label: "Status", key: "status", flex: "1", sortable: false },
  ];

  const statusCards = [
    { key: "Draft", label: "Draft", activeColor: "grey-light" },
    { key: "Submitted", label: "Submitted", activeColor: "blue-light" },
    { key: "Issued", label: "Issued", activeColor: "orange-light" },
    { key: "Approved", label: "Approved", activeColor: "green-light" },
    { key: "Rejected", label: "Rejected", activeColor: "red-light" },
    { key: "Need Revision", label: "Need Revision", activeColor: "yellow-light" },
  ];

  const statusCounts = statusCards.reduce((acc, card) => {
    acc[card.key] = MOCK_QUOTES.filter((row) => row.status === card.key).length;
    return acc;
  }, {});

  const toggleSort = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const toggleFilterStatus = (status) => {
    setFilterStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const filteredRows = MOCK_QUOTES.filter((row) => {
    const matchesStatusFilter =
      filterStatuses.length === 0 || filterStatuses.includes(row.status);
    const matchesSearch =
      !searchQuery ||
      row.quoteNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.rfqNo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (row.customerName || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCustomer =
      !filterCustomer || filterCustomer === "all" || row.customerName === filterCustomer;

    return matchesStatusFilter && matchesSearch && matchesCustomer;
  }).sort((a, b) => {
    const direction = sortDirection === "asc" ? 1 : -1;
    if (!a[sortBy] || !b[sortBy]) return 0;
    return a[sortBy].localeCompare(b[sortBy]) * direction;
  });

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const visibleRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatuses, filterCustomer, searchQuery, rowsPerPage]);

  const customers = Array.from(new Set(MOCK_QUOTES.map((r) => r.customerName)));

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
            margin: "0",
            fontSize: "var(--text-big-title)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          Quotes
        </h1>
        <div style={{ display: "flex", gap: "12px" }}>
          <Button variant="outlined" leftIcon={Settings} onClick={() => onNavigate("settings")}>
            Settings
          </Button>
          <Button variant="filled" leftIcon={AddIcon} onClick={() => onNavigate("create")}>
            New Quote
          </Button>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "16px",
          flexShrink: 0,
        }}
      >
        {statusCards.map((card) => (
          <ListStatusCounterCard
            key={card.key}
            label={card.label}
            count={statusCounts[card.key] || 0}
            badgeVariant={card.activeColor}
            active={filterStatuses.includes(card.key)}
            onClick={() => toggleFilterStatus(card.key)}
          />
        ))}
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
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              flexWrap: "wrap",
              position: "relative",
            }}
          >
            <FilterMenu
              label="Customer"
              options={customers.map((c) => ({ value: c, label: c }))}
              value={filterCustomer}
              onChange={setFilterCustomer}
              allValue="all"
            />
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quote number, RFQ number, or customer"
            width="360px"
          />
        </div>

        <div
          style={{
            maxHeight: "calc(100vh - 380px)",
            overflowX: "auto",
            overflowY: "auto",
            width: "100%",
          }}
        >
          <div style={{ minWidth: "1000px", width: "100%", display: "flex", flexDirection: "column" }}>
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
                  onClick={() => (col.sortable ? toggleSort(col.key) : undefined)}
                  style={{
                    flex: col.flex,
                    minWidth: 0,
                    height: "49px",
                    padding: "0 12px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                >
                  <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {col.label}
                  </span>
                  {col.sortable && (
                    <ChevronDownIcon
                      size={14}
                      color={sortBy === col.key ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"}
                      style={{
                        transform: sortBy === col.key && sortDirection === "asc" ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    />
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              {visibleRows.map((row, rIdx) => (
                <div
                  key={rIdx}
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
                    {row.quoteNo}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>{row.rfqNo || "-"}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex })}>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {row.customerName}
                    </span>
                  </div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>{row.createdBy}</div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>{row.createdAt}</div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>
                    <StatusBadge variant={row.sBadge || "grey"}>{row.status}</StatusBadge>
                  </div>
                </div>
              ))}

              {filteredRows.length === 0 && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <EmptyState
                    illustration={<SearchNotFoundIllustration />}
                    title="No quotes found"
                    description="Try adjusting your filters or search keywords."
                  />
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
        />
      </div>
    </div>
  );
};
