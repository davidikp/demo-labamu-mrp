
import React, { useState, useMemo } from "react";
import { 
  ChevronRight, 
  ChevronLeft,
  Search, 
  Download,
  Building2,
  FileText,
  CreditCard,
  Info
} from "../../../components/icons/Icons.jsx";
const AlertCircle = Info;
import { MOCK_REPORT_POS } from "../mock/reportMocks";
import { formatCurrency } from "../../../utils/format/formatUtils";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { DropdownSelect } from "../../../components/common/DropdownSelect";
import { Button } from "../../../components/common/Button";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter";
import { TableSearchField } from "../../../components/table/TableSearchField";

const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const POReportPage = ({ onNavigate, t }) => {
  const currency = "IDR";
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [poStatusFilter, setPoStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Date filter logic
  const filteredByDate = useMemo(() => {
    const today = new Date();
    let startDate = new Date();

    if (dateFilter === "All Period") return MOCK_REPORT_POS;
    if (dateFilter === "Last 30 Days") startDate.setDate(today.getDate() - 30);
    if (dateFilter === "Last 14 Days") startDate.setDate(today.getDate() - 14);
    if (dateFilter === "Last 7 Days") startDate.setDate(today.getDate() - 7);
    if (dateFilter === "Today") startDate.setHours(0, 0, 0, 0);

    return MOCK_REPORT_POS.filter(po => new Date(po.createdDate) >= startDate);
  }, [dateFilter]);

  // Main filter logic
  const filteredData = useMemo(() => {
    return filteredByDate.filter(po => {
      const matchesVendor = vendorFilter === "all" || po.vendorName === vendorFilter;
      const matchesPoStatus = poStatusFilter === "all" || po.status === poStatusFilter;
      
      const invoicedAmount = po.invoices.reduce((s, i) => s + i.amount, 0);
      const paidAmount = po.invoices.reduce((s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0), 0);
      let paymentStatus = "Unpaid";
      if (paidAmount > 0) {
        paymentStatus = paidAmount >= invoicedAmount && invoicedAmount > 0 ? "Paid" : "Partially Paid";
      }
      const matchesPaymentStatus = paymentStatusFilter === "all" || paymentStatus === paymentStatusFilter;
      
      const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           po.vendorName.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesVendor && matchesPoStatus && matchesPaymentStatus && matchesSearch;
    });
  }, [filteredByDate, vendorFilter, poStatusFilter, paymentStatusFilter, searchQuery]);

  // Summary Metrics
  const metrics = useMemo(() => {
    let totalPoValue = 0;
    let invoicedValue = 0;
    let paidValue = 0;

    filteredData.forEach(po => {
      totalPoValue += po.amount;
      po.invoices.forEach(inv => {
        invoicedValue += inv.amount;
        paidValue += inv.payments.reduce((sum, p) => sum + p.amount, 0);
      });
    });

    return {
      totalCount: filteredData.length,
      totalPoValue,
      invoicedValue,
      outstandingToPay: invoicedValue - paidValue
    };
  }, [filteredData]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Filter options
  const vendors = ["all", ...new Set(MOCK_REPORT_POS.map(po => po.vendorName))];
  const poStatuses = ["all", "Issued", "Revised", "Completed"];
  const paymentStatuses = ["all", "Unpaid", "Partially Paid", "Paid"];

  const tableColumns = [
    { label: "PO No", flex: "1.4" },
    { label: "PO Date", flex: "1.2" },
    { label: "Vendor", flex: "1.8" },
    { label: "PO Value", flex: "1.4" },
    { label: "Invoiced", flex: "1.2" },
    { label: "Paid", flex: "1.2" },
    { label: "Outstanding", flex: "1.4" },
    { label: "Payment Status", flex: "1.4" },
    { label: "PO Status", flex: "1.2" },
  ];

  const handleExport = () => {
    console.log("Exporting data...", filteredData);
    alert("Exporting " + filteredData.length + " POs to Excel...");
  };

  return (
    <div style={{
      flex: 1,
      display: "flex",
      flexDirection: "column",
      background: "var(--neutral-background-primary)",
      height: "100%",
      overflowY: "auto",
      padding: "32px"
    }}>
      {/* Header Section */}
      <div style={{ marginBottom: "24px" }}>
        <div 
          style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "12px", 
            cursor: "pointer",
            marginLeft: "-4px",
            marginBottom: "8px"
          }}
          onClick={() => onNavigate("analytics_procurement_ap_report")}
        >
          <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
          <h1 style={{ 
            margin: 0, 
            fontSize: "var(--text-large-title)", 
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)"
          }}>
            PO Report
          </h1>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
          marginBottom: "24px"
        }}>
          <span 
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate("analytics_procurement_ap_report")}
          >
            Procurement & AP Report
          </span>
          <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>PO Report</span>
        </div>

        {/* Period Filter (Tab Chips) */}
        <div style={{ 
          display: "inline-flex", 
          background: "white", 
          padding: "4px", 
          borderRadius: "100px", 
          border: "1px solid var(--neutral-line-separator-1)",
          gap: "4px" 
        }}>
          {["All Period", "Last 30 Days", "Last 14 Days", "Last 7 Days", "Today"].map(chip => (
            <button
              key={chip}
              onClick={() => { setDateFilter(chip); setCurrentPage(1); }}
              style={{
                padding: "8px 20px",
                borderRadius: "100px",
                border: "none",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                background: dateFilter === chip ? "var(--feature-brand-primary)" : "transparent",
                color: dateFilter === chip ? "white" : "var(--neutral-on-surface-secondary)",
                transition: "all 0.2s ease"
              }}
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {[
          { label: "Total POs", value: metrics.totalCount, icon: <FileText size={20} color="var(--feature-brand-primary)" /> },
          { label: "Total PO Value", value: formatCurrency(metrics.totalPoValue, currency), icon: <Building2 size={20} color="var(--feature-brand-primary)" /> },
          { label: "Invoiced Value", value: formatCurrency(metrics.invoicedValue, currency), icon: <CreditCard size={20} color="var(--feature-brand-primary)" /> },
          { label: "Outstanding to Pay", value: formatCurrency(metrics.outstandingToPay, currency), icon: <AlertCircle size={20} color="var(--status-orange-primary)" /> },
        ].map((card, idx) => (
          <div key={idx} style={{ 
            background: "var(--neutral-surface-primary)", 
            borderRadius: "16px", 
            padding: "20px", 
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}>
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "12px", 
              background: "var(--feature-brand-container-lighter)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center" 
            }}>
              {card.icon}
            </div>
            <div>
              <div style={{ fontSize: "13px", color: "var(--neutral-on-surface-secondary)", marginBottom: "4px" }}>{card.label}</div>
              <div style={{ fontSize: "20px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Table Section */}
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "16px", 
        border: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Filters Header */}
        <div style={{ padding: "16px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--neutral-line-separator-2)" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <DropdownSelect 
              variant="filter"
              fontSize="var(--text-title-3)"
              placeholder="Vendor"
              value={vendorFilter}
              options={vendors.map(v => ({ value: v, label: v === "all" ? "Vendor" : v }))}
              onChange={(val) => { setVendorFilter(val); setCurrentPage(1); }}
            />
            <DropdownSelect 
              variant="filter"
              fontSize="var(--text-title-3)"
              placeholder="PO Status"
              value={poStatusFilter}
              options={poStatuses.map(s => ({ value: s, label: s === "all" ? "PO Status" : s }))}
              onChange={(val) => { setPoStatusFilter(val); setCurrentPage(1); }}
            />
            <DropdownSelect 
              variant="filter"
              fontSize="var(--text-title-3)"
              placeholder="Payment Status"
              value={paymentStatusFilter}
              options={paymentStatuses.map(s => ({ value: s, label: s === "all" ? "Payment Status" : s }))}
              onChange={(val) => { setPaymentStatusFilter(val); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <TableSearchField 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search PO no. or vendor name"
              style={{ width: "320px" }}
            />
            <Button 
              variant="outlined" 
              size="small"
              leftIcon={Download}
              onClick={handleExport}
            >
              Download Excel
            </Button>
          </div>
        </div>

        {/* Table Content */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Header Row */}
          <div style={{ display: "flex", background: "var(--neutral-surface-primary)", borderBottom: "1px solid var(--neutral-line-separator-1)" }}>
            {tableColumns.map((col, idx) => (
              <div key={idx} style={{ 
                flex: col.flex, 
                padding: "0 12px", 
                height: "49px", 
                display: "flex", 
                alignItems: "center" 
              }}>
                <span style={{ 
                  fontSize: "var(--text-title-3)", 
                  fontWeight: "var(--font-weight-bold)", 
                  color: "var(--neutral-on-surface-primary)"
                }}>
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          <div style={{ display: "flex", flexDirection: "column" }}>
            {paginatedData.length > 0 ? paginatedData.map((po, idx) => {
              const invoiced = po.invoices.reduce((s, i) => s + i.amount, 0);
              const paid = po.invoices.reduce((s, i) => s + i.payments.reduce((sp, p) => sp + p.amount, 0), 0);
              const outstanding = invoiced - paid;
              
              let payStatus = "Unpaid";
              let payVariant = "orange-light";
              if (paid > 0) {
                if (paid >= invoiced) { payStatus = "Paid"; payVariant = "green-light"; }
                else { payStatus = "Partially Paid"; payVariant = "blue-light"; }
              }

              let poVariant = "blue";
              if (po.status === "Completed") poVariant = "green";
              if (po.status === "Revised") poVariant = "orange";

              return (
                <div 
                  key={idx} 
                  style={{ 
                    display: "flex", 
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    transition: "background 0.1s ease"
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <div style={cellStyle({ flex: tableColumns[0].flex, fontWeight: "600", color: "var(--feature-brand-primary)" })}>{po.poNumber}</div>
                  <div style={cellStyle({ flex: tableColumns[1].flex })}>{po.createdDate}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex, fontWeight: "500" })}>{po.vendorName}</div>
                  <div style={cellStyle({ flex: tableColumns[3].flex, fontWeight: "500" })}>{formatCurrency(po.amount, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[4].flex })}>{formatCurrency(invoiced, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>{formatCurrency(paid, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>{formatCurrency(outstanding, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[7].flex })}><StatusBadge variant={payVariant}>{payStatus}</StatusBadge></div>
                  <div style={cellStyle({ flex: tableColumns[8].flex })}><StatusBadge variant={poVariant}>{po.status}</StatusBadge></div>
                </div>
              );
            }) : (
              <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "14px" }}>
                No purchase orders found for the selected criteria.
              </div>
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <TablePaginationFooter
          totalRows={filteredData.length}
          rowsPerPage={itemsPerPage}
          onRowsPerPageChange={setItemsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  );
};

export { POReportPage };
