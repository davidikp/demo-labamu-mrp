
import React, { useState, useMemo, useEffect } from "react";
import { 
  ChevronRight, 
  ChevronLeft,
  Search, 
  Download,
  Building2,
  FileText,
  CreditCard,
  Info,
  Calendar,
  TrendingUp,
  CircleDollarSign
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

const tabButtonStyle = (isActive) => ({
  padding: "8px 24px",
  borderRadius: "100px",
  border: isActive ? "1px solid var(--feature-brand-primary)" : "1px solid var(--neutral-line-separator-1)",
  background: isActive ? "var(--feature-brand-container-lighter)" : "white",
  color: isActive ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-secondary)",
  fontSize: "14px",
  fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-semibold)",
  cursor: "pointer",
  transition: "all 0.2s ease",
  height: "44px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap"
});

const DateRangePicker = ({ startDate, endDate, onSelect, onClose }) => {
  const pickerRef = React.useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);
  
  const formatDateISO = (date) => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  };

  const isInRange = (date) => {
    if (!startDate || !endDate) return false;
    return date > startDate && date < endDate;
  };

  const handleDateClick = (date) => {
    if (typeof onSelect !== 'function') return;
    
    if (!startDate || (startDate && endDate)) {
      onSelect(date, null);
    } else {
      if (date < startDate) {
        onSelect(date, startDate);
      } else {
        onSelect(startDate, date);
      }
    }
  };

  const renderDay = (day, month, year, isGrey = false) => {
    const date = new Date(year, month, day);
    const start = isSameDay(date, startDate);
    const end = isSameDay(date, endDate);
    const range = isInRange(date);
    
    return (
      <div 
        key={`${month}-${day}-${year}`}
        onClick={() => !isGrey && handleDateClick(date)}
        style={{
          height: "40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          cursor: isGrey ? "default" : "pointer"
        }}
      >
        {/* Range Background Pill */}
        {(range || start || end) && (
          <div style={{
            position: "absolute",
            left: "0",
            right: "0",
            top: "4px",
            bottom: "4px",
            background: "var(--feature-brand-container-lighter)",
            zIndex: 0,
            borderRadius: start ? "16px 0 0 16px" : (end ? "0 16px 16px 0" : "0")
          }} />
        )}
        
        {/* Date Circle/Text */}
        <div style={{
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "13px",
          zIndex: 1,
          background: (start || end) ? "var(--feature-brand-primary)" : "transparent",
          color: (start || end) ? "white" : (isGrey ? "var(--neutral-on-surface-tertiary)" : "var(--neutral-on-surface-primary)"),
          opacity: isGrey ? 0.3 : 1,
          fontWeight: (start || end || range) ? "bold" : "500",
          transition: "all 0.2s ease"
        }}>
          {day}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={pickerRef}
      style={{
        position: "absolute",
        top: "calc(100% + 12px)",
        left: 0,
        zIndex: 100,
        background: "white",
        borderRadius: "16px",
        border: "1px solid var(--neutral-line-separator-1)",
        boxShadow: "0 12px 48px rgba(0,0,0,0.15)",
        padding: "24px",
        display: "flex",
        flexDirection: "column",
        gap: "28px",
        minWidth: "660px"
      }}
    >
      <div style={{ display: "flex", gap: "40px" }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <ChevronLeft size={18} style={{ cursor: "pointer" }} />
            <span style={{ fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>APR 2026</span>
            <div style={{ width: 18 }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <span key={d} style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", paddingBottom: "12px" }}>{d}</span>
            ))}
            {[29, 30, 31].map(d => renderDay(d, 2, 2026, true))}
            {[...Array(30)].map((_, i) => renderDay(i + 1, 3, 2026))}
            {[1, 2].map(d => renderDay(d, 4, 2026, true))}
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ width: 18 }} />
            <span style={{ fontWeight: "700", fontSize: "14px", letterSpacing: "0.5px" }}>MAY 2026</span>
            <ChevronRight size={18} style={{ cursor: "pointer" }} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", textAlign: "center" }}>
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
              <span key={d} style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", paddingBottom: "12px" }}>{d}</span>
            ))}
            {[26, 27, 28, 29, 30].map(d => renderDay(d, 3, 2026, true))}
            {[...Array(31)].map((_, i) => renderDay(i + 1, 4, 2026))}
          </div>
        </div>
      </div>

      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        borderTop: "1px solid var(--neutral-line-separator-1)",
        paddingTop: "24px"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "420px",
          height: "48px",
          borderRadius: "10px",
          border: "1px solid var(--feature-brand-primary)",
          display: "flex",
          alignItems: "center",
          padding: "0 16px",
          justifyContent: "space-between",
          background: "white",
          boxShadow: "0 2px 8px rgba(0,107,255,0.08)",
          cursor: "pointer"
        }} onClick={() => { if (startDate && endDate) onClose(); }}>
          <span style={{ fontSize: "14px", fontWeight: "500", color: "var(--neutral-on-surface-primary)" }}>
            {startDate ? formatDateISO(startDate) : "Select Start"} - {endDate ? formatDateISO(endDate) : "Select End"}
          </span>
          <Calendar size={18} color="var(--neutral-on-surface-secondary)" />
        </div>
      </div>
    </div>
  );
};

const POReportPage = ({ onNavigate, t }) => {
  const currency = "IDR";
  const [dateFilter, setDateFilter] = useState("Last 30 Days");
  const [vendorFilter, setVendorFilter] = useState("all");
  const [poStatusFilter, setPoStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());

  const getActiveRangeLabel = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const format = (d) => `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    
    if (dateFilter === "All Period") return "All Period";
    if (!startDate || !endDate) return "";
    return `${format(startDate)} - ${format(endDate)}`;
  };

  const handlePresetClick = (preset) => {
    const today = new Date();
    let start = new Date();
    
    if (preset === "Today") {
      start.setHours(0,0,0,0);
    } else if (preset === "Last 7 Days") {
      start.setDate(today.getDate() - 7);
    } else if (preset === "Last 14 Days") {
      start.setDate(today.getDate() - 14);
    } else if (preset === "Last 30 Days") {
      start.setDate(today.getDate() - 30);
    } else if (preset === "All Period") {
      setDateFilter("All Period");
      setCurrentPage(1);
      setShowDatePicker(false);
      return;
    }
    
    setStartDate(start);
    setEndDate(today);
    setDateFilter(preset);
    setCurrentPage(1);
    setShowDatePicker(false);
  };

  // Date filter logic
  const filteredByDate = useMemo(() => {
    if (dateFilter === "All Period") return MOCK_REPORT_POS;
    if (!startDate || !endDate) return MOCK_REPORT_POS;

    return MOCK_REPORT_POS.filter(po => {
      const poDate = new Date(po.createdDate);
      return poDate >= startDate && poDate <= endDate;
    });
  }, [dateFilter, startDate, endDate]);

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
            color: "var(--neutral-on-surface-primary)",
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>
            PO Report
            <span style={{ 
              fontSize: "16px", 
              fontWeight: "500", 
              color: "var(--neutral-on-surface-secondary)" 
            }}>
              ({getActiveRangeLabel()})
            </span>
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
        <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: (showDatePicker || dateFilter === "Custom") ? "var(--feature-brand-primary)" : "white",
              border: "1px solid " + ((showDatePicker || dateFilter === "Custom") ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: (showDatePicker || dateFilter === "Custom") ? "white" : "var(--neutral-on-surface-secondary)",
              transition: "all 0.2s ease"
            }}
            onClick={() => setShowDatePicker(!showDatePicker)}
          >
            <Calendar size={18} />
          </button>

          {["All Period", "Last 30 Days", "Last 14 Days", "Last 7 Days", "Today"].map(chip => (
            <button
              key={chip}
              onClick={() => handlePresetClick(chip)}
              style={tabButtonStyle(dateFilter === chip && !showDatePicker)}
            >
              {chip}
            </button>
          ))}

          {showDatePicker && (
            <DateRangePicker 
              startDate={startDate}
              endDate={endDate}
              onSelect={(s, e) => {
                setStartDate(s);
                setEndDate(e);
                if (s && e) setDateFilter("Custom");
              }}
              onClose={() => setShowDatePicker(false)}
            />
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "24px", marginBottom: "32px" }}>
        {[
          { label: "Total Orders", value: metrics.totalCount, icon: <FileText /> },
          { label: "Total Order Value", value: formatCurrency(metrics.totalOrderValue || metrics.totalPoValue, currency), icon: <TrendingUp /> },
          { label: "Total Paid Value", value: formatCurrency(metrics.totalPaidValue || metrics.invoicedValue, currency), icon: <CreditCard /> },
          { label: "Total Outstanding Value", value: formatCurrency(metrics.totalOutstandingValue || metrics.outstandingToPay, currency), icon: <CircleDollarSign /> },
        ].map((card, idx) => (
          <div key={idx} style={{ 
            background: "var(--neutral-surface-primary)", 
            borderRadius: "16px", 
            padding: "20px", 
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            minHeight: "92px"
          }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", fontWeight: "500" }}>{card.label}</div>
              <div style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{card.value}</div>
            </div>
            <div style={{ 
              width: "36px", 
              height: "36px", 
              borderRadius: "50%", 
              background: "#F5F5F5", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              flexShrink: 0
            }}>
              {React.cloneElement(card.icon, { size: 18, color: "var(--neutral-on-surface-secondary)" })}
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
          renderLeftActions={() => (
            <Button 
              variant="outlined" 
              size="small"
              leftIcon={Download}
              onClick={handleExport}
              style={{ height: "40px", borderRadius: "12px", padding: "0 16px" }}
            >
              Download
            </Button>
          )}
        />
      </div>
    </div>
  );
};

export { POReportPage };
