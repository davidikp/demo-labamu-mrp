
import React, { useState, useMemo } from "react";
import { 
  ChevronLeft,
  ChevronRight,
  Search, 
  Download,
  FileText,
  Info,
  Building2,
  CreditCard,
  Calendar,
  CheckCircleIcon
} from "../../../components/icons/Icons.jsx";
import { MOCK_REPORT_POS } from "../mock/reportMocks";
import { formatCurrency } from "../../../utils/format/formatUtils";
import { StatusBadge } from "../../../components/common/StatusBadge";
import { DropdownSelect } from "../../../components/common/DropdownSelect";
import { Button } from "../../../components/common/Button";
import { TableSearchField } from "../../../components/table/TableSearchField";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter";

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

const APAgingReportPage = ({ onNavigate, t }) => {
  const currency = "IDR";
  const [agingBucketFilter, setAgingBucketFilter] = useState("all");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  const today = new Date();

  // Flatten all invoices with metadata
  const allInvoices = useMemo(() => {
    const list = [];
    MOCK_REPORT_POS.forEach(po => {
      po.invoices.forEach(inv => {
        const paidAmount = inv.payments.reduce((sum, p) => sum + p.amount, 0);
        const outstanding = inv.amount - paidAmount;
        
        const dueDate = new Date(inv.dueDate);
        const diffTime = today - dueDate;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        let agingBucket = "Not Due";
        if (diffDays > 90) agingBucket = "90+";
        else if (diffDays > 60) agingBucket = "61-90";
        else if (diffDays > 30) agingBucket = "31-60";
        else if (diffDays > 0) agingBucket = "1-30";

        let status = "Unpaid";
        if (paidAmount > 0) {
          status = paidAmount >= inv.amount ? "Paid" : "Partially Paid";
        }

        list.push({
          ...inv,
          poNumber: po.poNumber,
          vendorName: po.vendorName,
          paidAmount,
          outstanding,
          agingBucket,
          status,
          overdueDays: diffDays > 0 ? diffDays : 0
        });
      });
    });
    return list;
  }, []);

  // Filter Logic
  const filteredData = useMemo(() => {
    return allInvoices.filter(inv => {
      const matchesAging = agingBucketFilter === "all" || inv.agingBucket === agingBucketFilter;
      const matchesVendor = vendorFilter === "all" || inv.vendorName === vendorFilter;
      
      let matchesStatus = true;
      if (paymentStatusFilter === "Unpaid + Partial") {
        matchesStatus = inv.status === "Unpaid" || inv.status === "Partially Paid";
      } else if (paymentStatusFilter !== "all") {
        matchesStatus = inv.status === paymentStatusFilter;
      }

      const matchesSearch = inv.number.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           inv.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           inv.poNumber.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesAging && matchesVendor && matchesStatus && matchesSearch;
    });
  }, [allInvoices, agingBucketFilter, vendorFilter, paymentStatusFilter, searchQuery]);

  // Sorting: Highest overdue first, then highest outstanding
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (b.overdueDays !== a.overdueDays) return b.overdueDays - a.overdueDays;
      return b.outstanding - a.outstanding;
    });
  }, [filteredData]);

  // Summary Metrics (based on ALL unpaid/partial invoices)
  const summary = useMemo(() => {
    return allInvoices.reduce((acc, curr) => {
      if (curr.status === "Paid") return acc;
      
      if (curr.agingBucket === "Not Due") acc.notDue += curr.outstanding;
      else if (curr.agingBucket === "1-30") acc.late1_30 += curr.outstanding;
      else if (curr.agingBucket === "31-60") acc.late31_60 += curr.outstanding;
      else acc.lateOver60 += curr.outstanding; // 61-90 and 90+
      
      return acc;
    }, { notDue: 0, late1_30: 0, late31_60: 0, lateOver60: 0 });
  }, [allInvoices]);

  // Pagination
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const tableColumns = [
    { label: "Vendor", flex: "1.8" },
    { label: "PO No", flex: "1.2" },
    { label: "Inv No", flex: "1.4" },
    { label: "Inv Date", flex: "1.2" },
    { label: "Due Date", flex: "1.6" },
    { label: "Inv Amount", flex: "1.4" },
    { label: "Paid Amount", flex: "1.4" },
    { label: "Outstanding", flex: "1.4" },
    { label: "Status", flex: "1.2" },
  ];

  const handleExport = () => {
    alert(`Exporting ${sortedData.length} invoices to Excel...`);
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
      <div style={{ marginBottom: "32px" }}>
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
            AP Aging (Payables Due)
          </h1>
        </div>
        
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)"
        }}>
          <span 
            style={{ cursor: "pointer" }}
            onClick={() => onNavigate("analytics_procurement_ap_report")}
          >
            Procurement & AP Report
          </span>
          <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>AP Aging</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px", marginBottom: "32px" }}>
        {[
          { label: "Not Due", value: summary.notDue, icon: CheckCircleIcon },
          { label: "Late 1–30", value: summary.late1_30, icon: Calendar },
          { label: "31–60", value: summary.late31_60, icon: Calendar },
          { label: "Over 60 Days", value: summary.lateOver60, icon: Info, isCritical: true },
        ].map((card, idx) => (
          <div 
            key={idx}
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "16px",
              padding: "20px",
              border: "1px solid var(--neutral-line-separator-1)",
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}
          >
            <div style={{ 
              width: "48px", 
              height: "48px", 
              borderRadius: "12px", 
              background: card.isCritical ? "var(--status-red-container)" : "var(--feature-brand-container-lighter)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}>
              <card.icon size={22} color={card.isCritical ? "var(--status-red-primary)" : "var(--feature-brand-primary)"} />
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-secondary)", fontWeight: "500" }}>
                {card.label}
              </span>
              <div style={{ fontSize: "20px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                {formatCurrency(card.value, currency)}
              </div>
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
              placeholder="Aging Bucket"
              value={agingBucketFilter}
              options={[
                { value: "all", label: "Aging Bucket" },
                { value: "Not Due", label: "Not Due" },
                { value: "1-30", label: "1-30 Days" },
                { value: "31-60", label: "31-60 Days" },
                { value: "61-90", label: "61-90 Days" },
                { value: "90+", label: "90+ Days" }
              ]}
              onChange={(val) => { setAgingBucketFilter(val); setCurrentPage(1); }}
            />
            <DropdownSelect 
              variant="filter"
              fontSize="var(--text-title-3)"
              placeholder="Vendor"
              value={vendorFilter}
              options={["all", ...new Set(allInvoices.map(inv => inv.vendorName))].map(v => ({ value: v, label: v === "all" ? "Vendor" : v }))}
              onChange={(val) => { setVendorFilter(val); setCurrentPage(1); }}
            />
            <DropdownSelect 
              variant="filter"
              fontSize="var(--text-title-3)"
              placeholder="Status"
              value={paymentStatusFilter}
              options={[
                { value: "Unpaid + Partial", label: "Unpaid + Partial" },
                { value: "Unpaid", label: "Unpaid" },
                { value: "Partially Paid", label: "Partially Paid" },
                { value: "Paid", label: "Paid" },
                { value: "all", label: "Show All" }
              ]}
              onChange={(val) => { setPaymentStatusFilter(val); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <TableSearchField 
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="Search invoice no. or vendor"
              style={{ width: "280px" }}
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
            {paginatedData.length > 0 ? paginatedData.map((inv, idx) => {
              let statusVariant = "red-light";
              if (inv.status === "Paid") statusVariant = "green-light";
              if (inv.status === "Partially Paid") statusVariant = "blue-light";

              const isOverdue = inv.overdueDays > 0 && inv.status !== "Paid";

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
                  <div style={cellStyle({ flex: tableColumns[0].flex, fontWeight: "600" })}>{inv.vendorName}</div>
                  <div style={cellStyle({ flex: tableColumns[1].flex, color: "var(--feature-brand-primary)", fontWeight: "500" })}>{inv.poNumber}</div>
                  <div style={cellStyle({ flex: tableColumns[2].flex, fontWeight: "600" })}>{inv.number}</div>
                  <div style={cellStyle({ flex: tableColumns[3].flex })}>{inv.date}</div>
                  <div style={cellStyle({ flex: tableColumns[4].flex, color: isOverdue ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)", fontWeight: isOverdue ? "700" : "400", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" })}>
                    <div>{inv.dueDate}</div>
                    {isOverdue && <div style={{ fontSize: "11px", fontWeight: "600" }}>({inv.overdueDays}d overdue)</div>}
                  </div>
                  <div style={cellStyle({ flex: tableColumns[5].flex })}>{formatCurrency(inv.amount, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[6].flex })}>{formatCurrency(inv.paidAmount, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[7].flex, fontWeight: "700", color: isOverdue ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)" })}>{formatCurrency(inv.outstanding, currency)}</div>
                  <div style={cellStyle({ flex: tableColumns[8].flex })}><StatusBadge variant={statusVariant}>{inv.status}</StatusBadge></div>
                </div>
              );
            }) : (
              <div style={{ padding: "64px 24px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)", fontSize: "14px" }}>
                No invoices found for the selected criteria.
              </div>
            )}
          </div>
        </div>

        {/* Pagination Footer */}
        <TablePaginationFooter
          totalRows={sortedData.length}
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

export { APAgingReportPage };
