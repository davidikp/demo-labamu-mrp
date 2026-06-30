import React, { useState, useMemo } from "react";
import {
  FileText,
  TrendingUp,
  CreditCard,
  CircleDollarSign,
  Download,
} from "lucide-react";
import {
  LocaleProvider,
  Breadcrumbs,
  ChipTabs,
  Table,
  StatusBadge,
  MainBtn,
} from "../../../ce-ui";
import { MOCK_REPORT_POS } from "../mock/reportMocks";
import { formatCurrency } from "../../../utils/format/formatUtils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const formatDate = (iso) => {
  if (!iso) return "-";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// PO status -> ce-ui StatusBadge color
const statusColor = (status) => {
  switch (status) {
    case "Waiting for Approval": return "orange";
    case "Need Revision": return "yellow";
    case "Issued": return "blue";
    case "Completed": return "green";
    case "Canceled": return "red";
    default: return "grey";
  }
};

// Date presets driving the ChipTabs period filter
const PRESETS = [
  { id: "all", label: "All Period" },
  { id: "30", label: "Last 30 Days" },
  { id: "14", label: "Last 14 Days" },
  { id: "7", label: "Last 7 Days" },
  { id: "today", label: "Today" },
];

const presetRange = (id) => {
  if (id === "all") return { start: null, end: null };
  const end = new Date();
  const start = new Date();
  if (id === "today") start.setHours(0, 0, 0, 0);
  else start.setDate(end.getDate() - Number(id));
  return { start, end };
};

// Enrich each PO with the derived monetary fields the table sorts/renders on.
const enrich = (po) => {
  const invoiced = po.invoices.reduce((s, i) => s + i.amount, 0);
  const paid = po.invoices.reduce(
    (s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0),
    0
  );
  return {
    ...po,
    invoiced,
    paid,
    outstanding: invoiced - paid,
    uninvoiced: po.amount - invoiced,
  };
};

const POReportPage = ({ onNavigate }) => {
  const currency = "IDR";
  const [preset, setPreset] = useState("30");
  const [vendorFilter, setVendorFilter] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [sort, setSort] = useState({ key: "createdDate", direction: "asc" });

  const { start: startDate, end: endDate } = useMemo(() => presetRange(preset), [preset]);

  const enriched = useMemo(() => MOCK_REPORT_POS.map(enrich), []);

  // Filter (date -> vendor -> status -> search) then sort.
  const filteredData = useMemo(() => {
    let result = enriched.filter((po) => {
      const inDate =
        !startDate || !endDate
          ? true
          : (() => {
              const d = new Date(po.createdDate);
              return d >= startDate && d <= endDate;
            })();
      const matchesVendor =
        vendorFilter.length === 0 || vendorFilter.includes(po.vendorName);
      const matchesStatus = statusFilter === "all" || po.status === statusFilter;
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        po.poNumber.toLowerCase().includes(q) ||
        po.vendorName.toLowerCase().includes(q);
      return inDate && matchesVendor && matchesStatus && matchesSearch;
    });

    if (sort.key && sort.direction) {
      result = [...result].sort((a, b) => {
        let aVal = a[sort.key];
        let bVal = b[sort.key];
        if (typeof aVal === "string") aVal = aVal.toLowerCase();
        if (typeof bVal === "string") bVal = bVal.toLowerCase();
        if (aVal < bVal) return sort.direction === "asc" ? -1 : 1;
        if (aVal > bVal) return sort.direction === "asc" ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [enriched, startDate, endDate, vendorFilter, statusFilter, searchQuery, sort]);

  const metrics = useMemo(() => {
    return filteredData.reduce(
      (acc, po) => {
        acc.totalCount += 1;
        acc.totalPoValue += po.amount;
        acc.paidValue += po.paid;
        acc.outstandingToPay += po.outstanding;
        return acc;
      },
      { totalCount: 0, totalPoValue: 0, paidValue: 0, outstandingToPay: 0 }
    );
  }, [filteredData]);

  const paginatedData = useMemo(
    () =>
      filteredData.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
      ),
    [filteredData, currentPage, itemsPerPage]
  );

  const vendorOptions = useMemo(
    () =>
      [...new Set(MOCK_REPORT_POS.map((po) => po.vendorName))].map((v) => ({
        value: v,
        label: v,
      })),
    []
  );

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "Issued", label: "Issued" },
    { value: "Completed", label: "Completed" },
  ];

  const moneyCell = (v) => (
    <span style={{ fontVariantNumeric: "tabular-nums" }}>
      {formatCurrency(v, currency)}
    </span>
  );

  const columns = [
    {
      key: "poNumber",
      header: "PO No",
      width: 180,
      render: (v, row) => (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <span style={{ color: "var(--lb-brand)", fontWeight: 700 }}>{v}</span>
          {row.version > 1 && (
            <StatusBadge color="grey" tone="soft" label={`V ${row.version}.0`} />
          )}
        </div>
      ),
    },
    { key: "createdDate", header: "PO Date", sortable: true, width: 130, render: (v) => formatDate(v) },
    { key: "vendorName", header: "Vendor", width: 200 },
    { key: "amount", header: "PO Value", sortable: true, align: "right", width: 150, render: moneyCell },
    { key: "invoiced", header: "Vendor Invoice", sortable: true, align: "right", width: 150, render: moneyCell },
    { key: "paid", header: "Paid Amount", sortable: true, align: "right", width: 150, render: moneyCell },
    {
      key: "outstanding",
      header: "Outstanding",
      sortable: true,
      align: "right",
      width: 150,
      tooltip: "Amount that has not been paid from the vendor invoice",
      render: moneyCell,
    },
    {
      key: "uninvoiced",
      header: "Uninvoiced Amount",
      sortable: true,
      align: "right",
      width: 170,
      tooltip: "Difference between the purchase order value and vendor invoice value",
      render: moneyCell,
    },
    {
      key: "status",
      header: "PO Status",
      width: 140,
      render: (v) => <StatusBadge color={statusColor(v)} tone="soft" label={v} />,
    },
  ];

  const summaryCards = [
    { label: "Total Orders", value: metrics.totalCount, icon: FileText },
    { label: "Total Order Value", value: formatCurrency(metrics.totalPoValue, currency), icon: TrendingUp },
    { label: "Total Paid Value", value: formatCurrency(metrics.paidValue, currency), icon: CreditCard },
    { label: "Total Outstanding Value", value: formatCurrency(metrics.outstandingToPay, currency), icon: CircleDollarSign },
  ];

  const handleExport = () => {
    alert("Exporting " + filteredData.length + " POs to Excel...");
  };

  const goToParent = () => onNavigate("analytics_procurement_ap_report");

  return (
    <LocaleProvider locale="en">
      <div
        style={{
          height: "calc(100vh - 64px)",
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          background: "var(--neutral-background-primary)",
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Header: ce-ui Breadcrumbs (back + crumb + active period) */}
        <div>
          <Breadcrumbs
            title="PO Report"
            titleOnBreadcrumb="PO Report"
            breadcrumbs={[{ name: "Procurement & AP Report", onClick: goToParent }]}
            dateRange={
              preset === "all"
                ? {}
                : { from: startDate, to: endDate }
            }
            onBack={goToParent}
          />

          {/* Period presets: ce-ui ChipTabs */}
          <div style={{ marginTop: "20px" }}>
            <ChipTabs
              tabs={PRESETS}
              activeTab={preset}
              onChange={(id) => {
                setPreset(id);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>

        {/* Summary cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "24px",
            flexShrink: 0,
          }}
        >
          {summaryCards.map((card, idx) => {
            const Icon = card.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "var(--neutral-surface-primary)",
                  borderRadius: "16px",
                  padding: "20px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  minHeight: "92px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <div style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", fontWeight: 500 }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--neutral-on-surface-primary)" }}>
                    {card.value}
                  </div>
                </div>
                <div
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "#F5F5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={18} color="var(--neutral-on-surface-secondary)" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Table: ce-ui Table with built-in filters, sort, pagination, footer */}
        <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Table
            columns={columns}
            data={paginatedData}
            totalRows={filteredData.length}
            page={currentPage}
            perPage={itemsPerPage}
            onPageChange={setCurrentPage}
            sortKey={sort.key}
            sortDirection={sort.direction}
            onSortChange={(key, direction) => setSort({ key, direction })}
            filters={{
              multiSelect: {
                label: "Vendor",
                searchable: true,
                options: vendorOptions,
                values: vendorFilter,
                onChange: (v) => {
                  setVendorFilter(v);
                  setCurrentPage(1);
                },
              },
              singleSelect: {
                label: "PO Status",
                options: statusOptions,
                value: statusFilter,
                allValue: "all",
                onChange: (v) => {
                  setStatusFilter(v);
                  setCurrentPage(1);
                },
              },
              search: {
                value: searchQuery,
                onChange: (v) => {
                  setSearchQuery(v);
                  setCurrentPage(1);
                },
                placeholder: "Search PO number",
              },
              rowsPerPage: {
                options: [25, 50, 100],
                onChange: (n) => {
                  setItemsPerPage(n);
                  setCurrentPage(1);
                },
              },
            }}
            footerStart={
              <MainBtn
                variant="secondary"
                size="sm"
                label="Download"
                leftIcon={<Download size={16} />}
                onClick={handleExport}
              />
            }
            emptyStateTitle="No purchase orders found"
            emptyStateDescription="No purchase orders match the selected criteria."
          />
        </div>
      </div>
    </LocaleProvider>
  );
};

export { POReportPage };
