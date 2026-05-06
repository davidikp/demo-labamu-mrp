import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { 
  ChevronLeftIcon, EditIcon, Box, ChevronDownIcon, ChevronUpIcon, 
  UploadIcon, DownloadIcon, Trash2, MoreVerticalIcon, FileIcon, 
  ImageAssetIcon, ListViewIcon, GridViewIcon, SearchIcon, CloseIcon,
  Pencil, DeleteIcon, CloudUploadIcon, Info, TrendingUp, ChevronRightIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { DocumentTypeBadge } from "../../../modules/purchase-order/components/DocumentTypeBadge.jsx";
import { 
  FILE_DESCRIPTION_MAX_LENGTH, 
  MAX_PROOF_UPLOAD_FILES 
} from "../../../constants/appConstants.js";
import { 
  validateUploadFile,
  createUploadDocumentRecord 
} from "../../../utils/upload/uploadUtils.js";
import { MOCK_WO_TABLE_DATA } from "../../work-order/mock/workOrderMocks.js";
import { MOCK_ORDER_MATERIALS_DATA } from "../mock/orderMocks.js";


// Mock Data for Attachments (Updated to match PO screenshot)
const MOCK_ATTACHMENTS_DATA = [
  { id: 1, name: "invoice-march-2026.pdf", documentType: "invoice", uploadedBy: "Joko", date: "Mar 20, 2026", size: "2.4 MB", type: "pdf", meta: "Uploaded by Joko on Mar 20, 2026" },
  { id: 2, name: "delivery-note-batch-14.pdf", documentType: "delivery_note", uploadedBy: "Natasha Smith", date: "Mar 20, 2026", size: "1.1 MB", type: "pdf", meta: "Uploaded by Natasha Smith on Mar 20, 2026" },
  { id: 3, name: "vendor-quotation.pdf", documentType: "quotation_vendor", uploadedBy: "Joko", date: "Mar 19, 2026", size: "860 KB", type: "pdf", meta: "Uploaded by Joko on Mar 19, 2026" },
  { id: 4, name: "packing-list-wood-frame.png", documentType: "packing_list", uploadedBy: "Natasha Smith", date: "Mar 18, 2026", size: "540 KB", type: "image", meta: "Uploaded by Natasha Smith on Mar 18, 2026" },
  { id: 5, name: "manual-x200.pdf", documentType: "other", uploadedBy: "Admin", date: "Mar 15, 2026", size: "15.2 MB", type: "pdf", meta: "Uploaded by Admin on Mar 15, 2026" },
];

const MOCK_INVOICES_DATA = [
  { id: 1, invNo: "INV-2026-001", type: "Down Payment", issueDate: "Mar 01, 2026", dueDate: "Mar 15, 2026", totalDue: 5000000, status: "Paid", sBadge: "green" },
  { id: 2, invNo: "INV-2026-002", type: "Remaining Payment", issueDate: "Mar 10, 2026", dueDate: "Mar 24, 2026", totalDue: 12500000, status: "Issued", sBadge: "blue" },
  { id: 3, invNo: "INV-2026-003", type: "Down Payment", issueDate: "Mar 15, 2026", dueDate: "Mar 29, 2026", totalDue: 3000000, status: "Need Revision", sBadge: "orange" },
  { id: 4, invNo: "INV-2026-004", type: "Down Payment", issueDate: "Mar 18, 2026", dueDate: "Apr 01, 2026", totalDue: 4500000, status: "Void", sBadge: "grey" },
  { id: 5, invNo: "INV-2026-005", type: "Remaining Payment", issueDate: "Mar 20, 2026", dueDate: "Apr 03, 2026", totalDue: 8000000, status: "Canceled", sBadge: "red" },
  { id: 6, invNo: "INV-2026-006", type: "Down Payment", issueDate: "Mar 22, 2026", dueDate: "Apr 05, 2026", totalDue: 2000000, status: "Paid", sBadge: "green" },
];

const Tooltip = ({ content, children, style = {}, checkTruncation = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      style={{
        position: "relative",
        display: "inline-block",
        width: "max-content",
        minWidth: 0,
        ...style,
      }}
      onMouseEnter={() => {
        if (checkTruncation && triggerRef.current) {
          const element = triggerRef.current.firstElementChild;
          if (element) {
            const isTruncated =
              element.scrollHeight > element.clientHeight + 1 ||
              element.scrollWidth > element.clientWidth + 1;
            if (!isTruncated) return;
          }
        }
        setIsVisible(true);
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top - 8,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              width: "max-content",
              maxWidth: "400px",
              zIndex: 20001,
              whiteSpace: "normal",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--neutral-on-surface-primary)",
              color: "var(--neutral-surface-primary)",
              fontSize: "var(--text-desc)",
              lineHeight: "1.6",
              boxShadow: "var(--elevation-sm)",
              textAlign: "left",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid var(--neutral-on-surface-primary)",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

const UploadDropzone = ({
  accept,
  multiple = false,
  maxFiles = 1,
  disabled = false,
  error = "",
  maxText,
  allowedText,
  onFilesSelected,
}) => {
  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []);
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  return (
    <label
      onDragOver={(e) => {
        if (disabled) return;
        e.preventDefault();
      }}
      onDrop={(e) => {
        if (disabled) return;
        e.preventDefault();
        handleIncomingFiles(e.dataTransfer?.files);
      }}
      style={{
        width: "100%",
        minHeight: "168px",
        borderRadius: "24px",
        border: `2px dashed ${disabled
            ? "var(--neutral-line-separator-1)"
            : error
              ? "var(--status-red-primary)"
              : "var(--feature-brand-primary)"
          }`,
        background: disabled
          ? "var(--neutral-surface-grey-lighter)"
          : "var(--neutral-surface-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "24px",
        textAlign: "center",
        boxSizing: "border-box",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: 1,
      }}
    >
      <CloudUploadIcon
        size={40}
        color={
          disabled
            ? "var(--neutral-on-surface-tertiary)"
            : error
              ? "var(--status-red-primary)"
              : "var(--feature-brand-primary)"
        }
      />
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "#A9A9A9",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        {maxText ||
          (maxFiles === 1 ? "Max 1 file, 25MB each" : "Max 3 files, 25MB each")}
      </span>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "#A9A9A9",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        {allowedText}
      </span>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: disabled
            ? "var(--neutral-on-surface-tertiary)"
            : "var(--neutral-on-surface-primary)",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        Drag file or{" "}
        <span
          style={{
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : "var(--feature-brand-primary)",
          }}
        >
          browse file
        </span>
      </span>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );
};

const UploadDescriptionCard = ({
  file,
  onRemove,
  onDescriptionChange,
  descriptionRequired = false,
  descriptionError = "",
  hideDescriptionField = false,
}) => (
  <div
    style={{
      border: "1px solid var(--neutral-line-separator-1)",
      borderRadius: "24px",
      padding: "20px 24px",
      display: "flex",
      flexDirection: "column",
      gap: "18px",
      background: "var(--neutral-surface-primary)",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          minWidth: 0,
        }}
      >
        <DocumentTypeBadge fileName={file?.name} type={file?.type} />
        <span
          style={{
            fontSize: "var(--text-title-3)",
            lineHeight: "20px",
            letterSpacing: "0.09625px",
            fontWeight: "var(--font-weight-regular)",
            color: "var(--neutral-on-surface-primary)",
            minWidth: 0,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {file?.name || "-"}
        </span>
      </div>
      {onRemove ? (
        <Button variant="danger" size="small" onClick={onRemove}>
          Remove
        </Button>
      ) : null}
    </div>

    {!hideDescriptionField ? (
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: "var(--text-body)", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>
            File Description {descriptionRequired && <span style={{ color: "var(--status-red-primary)" }}>*</span>}
          </span>
          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
            {(file?.description || "").length}/{FILE_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <input 
          type="text"
          value={file?.description || ""}
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          placeholder="Enter File Description"
          style={{
            height: "48px",
            border: descriptionError ? "1px solid var(--status-red-primary)" : "1px solid var(--neutral-line-separator-1)",
            borderRadius: "8px",
            padding: "0 16px",
            fontSize: "var(--text-subtitle-1)",
            color: "var(--neutral-on-surface-primary)",
            outline: "none"
          }}
        />
        {descriptionError && <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>{descriptionError}</span>}
      </div>
    ) : null}
  </div>
);

const LabelValue = ({ label, value, badge, gridColumn, isClickable, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn }}>
      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {badge ? (
          <StatusBadge variant={badge.variant}>{badge.text}</StatusBadge>
        ) : (
          <span 
            onClick={isClickable ? onClick : undefined}
            onMouseEnter={() => isClickable && setIsHovered(true)}
            onMouseLeave={() => isClickable && setIsHovered(false)}
            style={{ 
              fontSize: "var(--text-title-3)", 
              fontWeight: "var(--font-weight-bold)", 
              color: isClickable ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
              cursor: isClickable ? "pointer" : "default",
              textDecoration: isClickable && isHovered ? "underline" : "none"
            }}
          >
            {value || "-"}
          </span>
        )}
      </div>
    </div>
  );
};

const tabButtonStyle = (isActive) => ({
  height: "48px",
  padding: "0 28px",
  borderRadius: "100px",
  border: isActive
    ? "1px solid var(--feature-brand-primary)"
    : "1px solid var(--neutral-line-separator-1)",
  background: isActive ? "#EAF1FF" : "var(--neutral-surface-primary)",
  color: isActive ? "var(--feature-brand-primary)" : "#7F7F7F",
  fontSize: "var(--text-title-2)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
  transition: "all 0.18s ease",
  boxShadow: "none",
});

const WorkOrderTab = ({ orderNo, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);

  const [hoveredSku, setHoveredSku] = useState(null);
  const [hoveredWo, setHoveredWo] = useState(null);

  let rawData = MOCK_WO_TABLE_DATA.filter(wo => wo.ord === orderNo);
  if (rawData.length === 0) {
    rawData = MOCK_WO_TABLE_DATA.slice(0, 15).map(wo => ({
      ...wo,
      ord: orderNo
    }));
  }

  const filteredData = React.useMemo(() => {
    let result = [...rawData];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(wo => 
        wo.wo.toLowerCase().includes(q) ||
        wo.product.toLowerCase().includes(q) ||
        wo.sku.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter(wo => statusFilter.includes(wo.status));
    }
    return result;
  }, [rawData, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const visibleData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const statusOptions = [...new Set(rawData.map(wo => wo.status))];

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStatus = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const gridTemplate = "2.5fr 1.5fr 0.8fr 1.1fr 1.1fr 1.1fr";
  const rowHeight = 64; 
  const maxBodyHeight = rowHeight * 5; 

  return (
    <div style={{ width: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div onClick={handleFilterToggle}>
            <FilterPill label="Status" count={statusFilter.length} active={statusFilter.length > 0} isOpen={isFilterOpen} />
          </div>
          {isFilterOpen && (
            <>
              {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsFilterOpen(false)} />, document.body)}
              {createPortal(
                <div style={{
                  position: "fixed",
                  top: `${filterTriggerRect.bottom + 8}px`,
                  left: `${filterTriggerRect.left}px`,
                  width: "240px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  padding: "16px",
                  zIndex: 14001,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Status</span>
                    <button onClick={() => { setStatusFilter([]); setIsFilterOpen(false); }} style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Remove Filter</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {statusOptions.map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                        <Checkbox checked={statusFilter.includes(opt)} onChange={() => toggleStatus(opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>,
                document.body
              )}
            </>
          )}
        </div>
        <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search WO Number, Product, SKU" width="320px" />
      </div>
      <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "1000px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
            <div style={{ padding: "16px 12px 16px 24px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>WO Number</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Product</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>WO Qty</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Planned Start</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Planned End</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Status</div>
          </div>
          <div style={{ display: "block", maxHeight: `${maxBodyHeight}px`, overflowY: "auto", width: "100%" }}>
            {visibleData.length > 0 ? visibleData.map((wo, idx) => (
              <div key={idx} style={{ display: "grid", gridTemplateColumns: gridTemplate, height: `${rowHeight}px`, alignItems: "center", borderBottom: "1px solid var(--neutral-line-separator-1)", transition: "background 0.2s ease", cursor: "default", width: "100%" }}>
                <div style={{ padding: "0 12px 0 24px", overflow: "hidden", display: "flex" }}>
                  <Tooltip content={wo.wo} checkTruncation={true} style={{ width: "100%" }}>
                    <span 
                      onClick={(e) => { e.stopPropagation(); onNavigate("wo_detail", { woNo: wo.wo }); }} 
                      onMouseEnter={() => setHoveredWo(`${wo.wo}-${idx}`)} 
                      onMouseLeave={() => setHoveredWo(null)} 
                      style={{ 
                        fontSize: "var(--text-title-3)", 
                        fontWeight: "var(--font-weight-bold)", 
                        color: "var(--feature-brand-primary)", 
                        cursor: "pointer", 
                        textDecoration: hoveredWo === `${wo.wo}-${idx}` ? "underline" : "none", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        display: "block"
                      }}
                    >
                      {wo.wo}
                    </span>
                  </Tooltip>
                </div>
                <div style={{ padding: "0 12px", display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Box size={20} color="var(--neutral-on-surface-tertiary)" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", minWidth: 0, width: "100%" }}>
                    <Tooltip content={wo.product} checkTruncation={true} style={{ width: "100%" }}>
                      <span style={{ 
                        fontSize: "var(--text-title-3)", 
                        fontWeight: "var(--font-weight-bold)", 
                        color: "var(--neutral-on-surface-primary)", 
                        whiteSpace: "nowrap", 
                        overflow: "hidden", 
                        textOverflow: "ellipsis",
                        display: "block"
                      }}>
                        {wo.product}
                      </span>
                    </Tooltip>
                    <span onClick={(e) => { e.stopPropagation(); onNavigate("product_detail", { sku: wo.sku }); }} onMouseEnter={() => setHoveredSku(`${wo.wo}-${idx}`)} onMouseLeave={() => setHoveredSku(null)} style={{ fontSize: "var(--text-body)", color: "var(--feature-brand-primary)", cursor: "pointer", textDecoration: hoveredSku === `${wo.wo}-${idx}` ? "underline" : "none" }}>{wo.sku}</span>
                  </div>
                </div>
                <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{wo.qty}</div>
                <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{wo.start || "-"}</div>
                <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{wo.end || "-"}</div>
                <div style={{ padding: "0 12px" }}><StatusBadge variant={wo.sBadge}>{wo.status}</StatusBadge></div>
              </div>
            )) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No results found.</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 4px" }}>
        <TablePaginationFooter currentPage={currentPage} totalPages={totalPages} rowsPerPage={rowsPerPage} totalRows={filteredData.length} onPageChange={setCurrentPage} onRowsPerPageChange={setRowsPerPage} />
      </div>
    </div>
  );
};

const InvoicesTab = ({ onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);

  const [hoveredInv, setHoveredInv] = useState(null);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val).replace("Rp", "Rp ");
  };

  const filteredData = React.useMemo(() => {
    let result = [...MOCK_INVOICES_DATA];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(inv => inv.invNo.toLowerCase().includes(q));
    }
    if (statusFilter.length > 0) {
      result = result.filter(inv => statusFilter.includes(inv.status));
    }
    return result;
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const visibleData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const statusOptions = ["Paid", "Issued", "Void", "Canceled", "Need Revision"];

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStatus = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const gridTemplate = "2fr 1.5fr 1.2fr 1.2fr 1.5fr 1.2fr";
  const rowHeight = 64;
  const maxBodyHeight = rowHeight * 5;

  return (
    <div style={{ width: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div onClick={handleFilterToggle}>
            <FilterPill label="Status" count={statusFilter.length} active={statusFilter.length > 0} isOpen={isFilterOpen} />
          </div>
          {isFilterOpen && (
            <>
              {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsFilterOpen(false)} />, document.body)}
              {createPortal(
                <div style={{
                  position: "fixed",
                  top: `${filterTriggerRect.bottom + 8}px`,
                  left: `${filterTriggerRect.left}px`,
                  width: "240px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  padding: "16px",
                  zIndex: 14001,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Status</span>
                    <button onClick={() => { setStatusFilter([]); setIsFilterOpen(false); }} style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Remove Filter</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {statusOptions.map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                        <Checkbox checked={statusFilter.includes(opt)} onChange={() => toggleStatus(opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>,
                document.body
              )}
            </>
          )}
        </div>
        <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Invoice Number" width="320px" />
      </div>
      <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />
      <div style={{ width: "100%", overflowX: "auto" }}>
        <div style={{ minWidth: "1000px", width: "100%" }}>
          <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
            <div style={{ padding: "16px 12px 16px 24px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Invoice Number</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Type</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Issue Date</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Due Date</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Total Due</div>
            <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Status</div>
          </div>
          <div style={{ display: "block", maxHeight: `${maxBodyHeight}px`, overflowY: "auto", width: "100%" }}>
            {visibleData.length > 0 ? visibleData.map((inv, idx) => {
              const [isRowHovered, setIsRowHovered] = useState(false);
              return (
                <div 
                  key={idx} 
                  onClick={() => onNavigate("invoice_detail", { invNo: inv.invNo })}
                  onMouseEnter={() => setIsRowHovered(true)}
                  onMouseLeave={() => setIsRowHovered(false)}
                  style={{ 
                    display: "grid", 
                    gridTemplateColumns: gridTemplate, 
                    height: `${rowHeight}px`, 
                    alignItems: "center", 
                    borderBottom: "1px solid var(--neutral-line-separator-1)", 
                    transition: "background 0.2s ease", 
                    cursor: "pointer", 
                    width: "100%",
                    background: isRowHovered ? "var(--neutral-surface-grey-lighter)" : "transparent"
                  }}
                >
                  <div style={{ padding: "0 12px 0 24px", overflow: "hidden" }}>
                    <span onMouseEnter={() => setHoveredInv(inv.id)} onMouseLeave={() => setHoveredInv(null)} style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)", cursor: "pointer", textDecoration: hoveredInv === inv.id ? "underline" : "none", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{inv.invNo}</span>
                  </div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{inv.type}</div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{inv.issueDate}</div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{inv.dueDate}</div>
                  <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(inv.totalDue)}</div>
                  <div style={{ padding: "0 12px" }}><StatusBadge variant={inv.sBadge}>{inv.status}</StatusBadge></div>
                </div>
              );
            }) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No results found.</div>}
          </div>
        </div>
      </div>
      <div style={{ padding: "0 4px" }}>
        <TablePaginationFooter currentPage={currentPage} totalPages={totalPages} rowsPerPage={rowsPerPage} totalRows={filteredData.length} onPageChange={setCurrentPage} onRowsPerPageChange={setRowsPerPage} />
      </div>
    </div>
  );
};

const AttachmentsTab = ({ onNavigate }) => {
  const [view, setView] = useState("list");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);

  // Modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Modal Form States
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [uploadDocType, setUploadDocType] = useState("other");
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadError, setUploadError] = useState("");

  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editType, setEditType] = useState("other");

  const filteredData = React.useMemo(() => {
    let result = [...MOCK_ATTACHMENTS_DATA];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(doc => (doc.title || doc.name).toLowerCase().includes(q));
    }
    if (typeFilter.length > 0) {
      result = result.filter(doc => typeFilter.includes(doc.documentType));
    }
    return result;
  }, [searchQuery, typeFilter]);

  const documentTypeOptions = [
    { value: "invoice", label: "Invoice" },
    { value: "delivery_note", label: "Delivery Note" },
    { value: "packing_list", label: "Packing List" },
    { value: "quotation_vendor", label: "Quotation (Vendor)" },
    { value: "contract_agreement", label: "Contract / Agreement" },
    { value: "other", label: "Other" },
  ];

  const getDocumentTypeLabel = (type) => documentTypeOptions.find(opt => opt.value === type)?.label || "Other";

  const getDocumentPreview = (doc, compact = false) => {
    const radius = compact ? "12px" : "0px";
    if (doc.type === "image" && doc.previewUrl) {
      return <img src={doc.previewUrl} alt={doc.name} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: radius, display: "block" }} />;
    }
    if (doc.type === "image") {
      return (
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(180deg, #CFE1FF 0%, #F6E6C9 100%)", borderRadius: radius, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", left: compact ? "18px" : "56px", bottom: compact ? "11px" : "34px", width: compact ? "18px" : "50px", height: compact ? "14px" : "34px", background: "#6E9FD8", transform: "skewX(-18deg)", borderRadius: "4px" }} />
        </div>
      );
    }
    return (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: radius }}>
        <DocumentTypeBadge fileName={doc.name} type={doc.type} size="preview" />
      </div>
    );
  };

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const resetUploadState = () => {
    setUploadDocType("other");
    setUploadFile(null);
    setUploadDescription("");
    setUploadError("");
  };

  const gridTemplate = "2.2fr 1fr 1.2fr 1fr 0.9fr 132px";
  const rowHeight = 72;

  return (
    <div style={{ width: "100%", background: "var(--neutral-surface-primary)", display: "flex", flexDirection: "column" }}>
      {/* Header Section */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <div onClick={handleFilterToggle}>
            <FilterPill label="Document Type" count={typeFilter.length} active={typeFilter.length > 0} isOpen={isFilterOpen} />
          </div>
          {isFilterOpen && (
            <>
              {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsFilterOpen(false)} />, document.body)}
              {createPortal(
                <div style={{
                  position: "fixed",
                  top: `${filterTriggerRect.bottom + 8}px`,
                  left: `${filterTriggerRect.left}px`,
                  width: "240px",
                  background: "var(--neutral-surface-primary)",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "16px",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                  padding: "16px",
                  zIndex: 14001,
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Document Type</span>
                    <button onClick={() => setTypeFilter([])} style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Remove Filter</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {documentTypeOptions.map(opt => (
                      <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                        <Checkbox checked={typeFilter.includes(opt.value)} onChange={() => setTypeFilter(prev => prev.includes(opt.value) ? prev.filter(p => p !== opt.value) : [...prev, opt.value])} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>,
                document.body
              )}
            </>
          )}
        </div>
        
        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
          <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search documents" width="320px" />
          <div style={{ display: "flex", border: "1px solid var(--neutral-line-separator-1)", borderRadius: "12px", overflow: "hidden", background: "white" }}>
            <button onClick={() => setView("list")} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: view === "list" ? "#EAF1FF" : "white", cursor: "pointer" }}>
              <ListViewIcon size={18} color={view === "list" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"} />
            </button>
            <button onClick={() => setView("grid")} style={{ width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", border: "none", borderLeft: "1px solid var(--neutral-line-separator-1)", background: view === "grid" ? "#EAF1FF" : "white", cursor: "pointer" }}>
              <GridViewIcon size={18} color={view === "grid" ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-tertiary)"} />
            </button>
          </div>
          <Button variant="filled" leftIcon={UploadIcon} onClick={() => { resetUploadState(); setShowUploadModal(true); }}>Upload</Button>
        </div>
      </div>

      <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />

      {/* Content Area */}
      <div style={{ padding: "0" }}>
        {view === "list" ? (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <div style={{ minWidth: "1000px", width: "100%" }}>
              <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
                <div style={{ padding: "16px 12px 16px 24px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Name</div>
                <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Document Type</div>
                <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Uploaded By</div>
                <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Date Modified</div>
                <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>File Size</div>
                <div style={{ padding: "16px 24px 16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", textAlign: "right" }}>Action</div>
              </div>
              <div style={{ display: "block", maxHeight: "360px", overflowY: "auto", width: "100%" }}>
                {filteredData.length > 0 ? filteredData.map((doc, idx) => (
                  <div key={idx} style={{ display: "grid", gridTemplateColumns: gridTemplate, height: `${rowHeight}px`, alignItems: "center", borderBottom: "1px solid var(--neutral-line-separator-1)", transition: "background 0.2s ease", cursor: "pointer", width: "100%", background: "white" }}>
                    <div style={{ padding: "0 12px 0 24px", display: "flex", alignItems: "center", gap: "12px", overflow: "hidden" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "12px", flexShrink: 0, overflow: "hidden" }}>{getDocumentPreview(doc, true)}</div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.title || doc.name.split('.')[0]}</span>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</span>
                      </div>
                    </div>
                    <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>{getDocumentTypeLabel(doc.documentType)}</div>
                    <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{doc.uploadedBy}</div>
                    <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{doc.date}</div>
                    <div style={{ padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>{doc.size}</div>
                    <div style={{ padding: "0 24px 0 12px", display: "flex", justifyContent: "flex-end", gap: "6px" }}>
                      <Tooltip content="Download"><IconButton icon={DownloadIcon} size="small" onClick={() => {}} /></Tooltip>
                      <Tooltip content="Edit"><IconButton icon={EditIcon} size="small" onClick={() => { setSelectedDocId(doc.id); setEditName(doc.title || doc.name.split('.')[0]); setEditDescription(doc.description || ""); setEditType(doc.documentType); setShowEditModal(true); }} /></Tooltip>
                      <Tooltip content="Delete"><IconButton icon={DeleteIcon} size="small" color="var(--status-red-primary)" hoverBackground="#FAE6E8" onClick={() => { setSelectedDocId(doc.id); setShowDeleteModal(true); }} /></Tooltip>
                    </div>
                  </div>
                )) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No documents added</div>}
              </div>
            </div>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px", padding: "20px 24px", maxHeight: "450px", overflowY: "auto" }}>
            {filteredData.length > 0 ? filteredData.map((doc) => (
              <div key={doc.id} style={{ border: "1px solid var(--neutral-line-separator-1)", borderRadius: "16px", background: "var(--neutral-surface-primary)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <div style={{ height: "152px", overflow: "hidden" }}>{getDocumentPreview(doc, false)}</div>
                <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", lineHeight: "1.5", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.title || doc.name.split('.')[0]}</span>
                      <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)", lineHeight: "1.4", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{doc.name}</span>
                    </div>
                    <IconButton icon={MoreVerticalIcon} size="small" color="var(--neutral-on-surface-secondary)" onClick={() => {}} />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Document Type: {getDocumentTypeLabel(doc.documentType)}</span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Uploaded by: {doc.uploadedBy}</span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>Date modified: {doc.date}</span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-secondary)" }}>File size: {doc.size}</span>
                  </div>
                </div>
              </div>
            )) : <div style={{ gridColumn: "1 / -1", padding: "48px 24px", textAlign: "center", color: "var(--neutral-on-surface-secondary)" }}>No documents added</div>}
          </div>
        )}
      </div>

      {/* Modals - REPLICATED FROM PO DETAIL */}
      <GeneralModal
        isOpen={showUploadModal}
        onClose={() => { setShowUploadModal(false); resetUploadState(); }}
        title="Upload Document"
        width="640px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={() => { setShowUploadModal(false); resetUploadState(); }}>Cancel</Button>
            <Button variant="filled" size="large" style={{ flex: 1 }} disabled={!uploadDocType || !uploadFile} onClick={() => setShowUploadModal(false)}>Upload</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "var(--text-body)" }}>
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>Document Type</span>
            </div>
            <DropdownSelect value={uploadDocType} onChange={setUploadDocType} options={documentTypeOptions} borderRadius="12px" />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "var(--text-body)" }}>
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>Document Upload</span>
            </div>
            <UploadDropzone maxFiles={1} disabled={!!uploadFile} onFilesSelected={(files) => { setUploadFile(files[0]); setUploadError(validateUploadFile(files[0])); }} error={uploadError} />
          </div>
          {uploadFile && <UploadDescriptionCard file={{...uploadFile, description: uploadDescription}} onRemove={resetUploadState} onDescriptionChange={setUploadDescription} />}
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Document"
        width="640px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button variant="outlined" size="large" style={{ flex: 1 }} onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="filled" size="large" style={{ flex: 1 }} disabled={!editName.trim()} onClick={() => setShowEditModal(false)}>Save</Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>Document Name</span>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Enter document name" style={{ height: "48px", border: "1px solid var(--neutral-line-separator-1)", borderRadius: "8px", padding: "0 16px", outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)" }}>File Description</span>
              <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>{editDescription.length}/{FILE_DESCRIPTION_MAX_LENGTH}</span>
            </div>
            <input type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} placeholder="Enter File Description" maxLength={FILE_DESCRIPTION_MAX_LENGTH} style={{ height: "48px", border: "1px solid var(--neutral-line-separator-1)", borderRadius: "8px", padding: "0 16px", outline: "none" }} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "var(--text-body)" }}>
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>Document Type</span>
            </div>
            <DropdownSelect value={editType} onChange={setEditType} options={documentTypeOptions} borderRadius="12px" />
          </div>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Document?"
        width="376px"
        centeredHeader
        description="This document will be permanently removed from the order."
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button variant="filled" size="large" style={{ width: "100%" }} onClick={() => setShowDeleteModal(false)}>Yes, Delete</Button>
            <Button variant="outlined" size="large" style={{ width: "100%" }} onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          </div>
        }
      />
    </div>
  );
};

const MaterialsTab = ({ orderNo, onNavigate }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);
  const [showBreakdownDrawer, setShowBreakdownDrawer] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [drawerTab, setDrawerTab] = useState("Calculation");
  const [expandedDemand, setExpandedDemand] = useState(false);
  const [expandedIncomingPO, setExpandedIncomingPO] = useState(false);

  const [hoveredSku, setHoveredSku] = useState(null);

  const metrics = useMemo(() => {
    return {
      totalMaterials: MOCK_ORDER_MATERIALS_DATA.length,
      shortageItems: MOCK_ORDER_MATERIALS_DATA.filter(m => m.status === "Shortage").length,
      totalShortageQty: MOCK_ORDER_MATERIALS_DATA.filter(m => m.status === "Shortage").reduce((acc, m) => acc + (m.demand - m.received), 0),
      incomingPoQty: 120 // Mock value
    };
  }, []);

  const filteredData = useMemo(() => {
    let result = [...MOCK_ORDER_MATERIALS_DATA];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(m => 
        m.name.toLowerCase().includes(q) ||
        m.sku.toLowerCase().includes(q)
      );
    }
    if (statusFilter.length > 0) {
      result = result.filter(m => statusFilter.includes(m.status));
    }
    return result;
  }, [searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const visibleData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const statusOptions = ["Shortage", "Covered"];

  const handleFilterToggle = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setFilterTriggerRect(rect);
    setIsFilterOpen(!isFilterOpen);
  };

  const toggleStatus = (status) => {
    setStatusFilter(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const handleRowClick = (material) => {
    setSelectedMaterial(material);
    setShowBreakdownDrawer(true);
  };

  const gridTemplate = "2fr 2fr 1.5fr 1fr 1fr";
  const rowHeight = 72;

  return (
    <div style={{ width: "100%", background: "var(--neutral-background-primary)", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Counter Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
        {[
          { label: "Total Materials", value: metrics.totalMaterials, icon: <Box /> },
          { label: "Shortage Items", value: metrics.shortageItems, icon: <Info /> },
          { label: "Total Shortage Qty", value: metrics.totalShortageQty, icon: <TrendingUp /> },
          { label: "Incoming PO Qty", value: metrics.incomingPoQty, icon: <UploadIcon /> }
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
        borderRadius: "var(--radius-card)", 
        border: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        {/* Filters & Search */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <div onClick={handleFilterToggle}>
              <FilterPill label="Status" count={statusFilter.length} active={statusFilter.length > 0} isOpen={isFilterOpen} />
            </div>
            {isFilterOpen && (
              <>
                {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsFilterOpen(false)} />, document.body)}
                {createPortal(
                  <div style={{
                    position: "fixed",
                    top: `${filterTriggerRect.bottom + 8}px`,
                    left: `${filterTriggerRect.left}px`,
                    width: "240px",
                    background: "var(--neutral-surface-primary)",
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "16px",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                    padding: "16px",
                    zIndex: 14001,
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>Status</span>
                      <button onClick={() => { setStatusFilter([]); setIsFilterOpen(false); }} style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}>Remove Filter</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {statusOptions.map(opt => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                          <Checkbox checked={statusFilter.includes(opt)} onChange={() => toggleStatus(opt)} />
                          {opt}
                        </label>
                      ))}
                    </div>
                  </div>,
                  document.body
                )}
              </>
            )}
          </div>
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <TableSearchField value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search Material Name, SKU" width="320px" />
          </div>
        </div>

        <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />

        {/* Table Body */}
        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "1000px", width: "100%" }}>
            <div style={{ display: "grid", gridTemplateColumns: gridTemplate, borderBottom: "1px solid var(--neutral-line-separator-1)", background: "var(--neutral-surface-primary)", alignItems: "center" }}>
              <div style={{ padding: "16px 12px 16px 24px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Material</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Used In</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Progress</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Available Stock</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Status</div>
            </div>
            <div>
              {visibleData.length > 0 ? visibleData.map((m, idx) => {
                const [isRowHovered, setIsRowHovered] = useState(false);
                return (
                  <div 
                    key={idx} 
                    onClick={() => handleRowClick(m)}
                    onMouseEnter={() => setIsRowHovered(true)}
                    onMouseLeave={() => setIsRowHovered(false)}
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: gridTemplate, 
                      minHeight: `${rowHeight}px`, 
                      alignItems: "center", 
                      borderBottom: "1px solid var(--neutral-line-separator-1)", 
                      transition: "background 0.2s ease", 
                      cursor: "pointer", 
                      width: "100%",
                      background: isRowHovered ? "var(--neutral-surface-grey-lighter)" : "transparent"
                    }}
                  >
                    <div style={{ padding: "12px 12px 12px 24px", display: "flex", alignItems: "center", gap: "12px" }}>
                      <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Box size={20} color="var(--neutral-on-surface-tertiary)" />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.name}</span>
                        <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{m.sku}</span>
                      </div>
                    </div>
                    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      {m.usedIn.map((use, uIdx) => (
                        <div key={uIdx} style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                          {use.product} <span style={{ color: "var(--neutral-on-surface-tertiary)", fontWeight: "var(--font-weight-regular)" }}>({use.wo})</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ padding: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ height: "8px", background: "#F5F5F5", borderRadius: "100px", overflow: "hidden", width: "100%" }}>
                        <div style={{
                          height: "100%",
                          width: `${(m.received / m.demand) * 100}%`,
                          background: "#52BD44",
                          borderRadius: "100px",
                        }} />
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "4px" }}>
                        <div>
                          <div style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "2px" }}>Received</div>
                          <div style={{ fontSize: "12px", fontWeight: "var(--font-weight-bold)", color: "#52BD44" }}>{m.received} {m.uom}</div>
                        </div>
                        <div style={{ textAlign: "center" }}>
                          <div style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "2px" }}>Remaining</div>
                          <div style={{ fontSize: "12px", fontWeight: "var(--font-weight-bold)", color: m.remaining > 0 ? "var(--status-red-primary)" : "var(--neutral-on-surface-primary)" }}>{m.remaining} {m.uom}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: "10px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "2px" }}>Demand</div>
                          <div style={{ fontSize: "12px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>{m.demand} {m.uom}</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ padding: "12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-regular)", color: "var(--neutral-on-surface-primary)" }}>{m.availableStock} {m.uom}</div>
                    <div style={{ padding: "12px" }}>
                      <StatusBadge variant={m.sVariant}>
                        {m.status === "Shortage" ? `${m.status}: ${m.remaining} ${m.uom}` : m.status}
                      </StatusBadge>
                    </div>
                  </div>
                );
              }) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No results found.</div>}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 4px" }}>
          <TablePaginationFooter 
            currentPage={currentPage} 
            totalPages={totalPages} 
            rowsPerPage={rowsPerPage} 
            totalRows={filteredData.length} 
            onPageChange={setCurrentPage} 
            onRowsPerPageChange={setRowsPerPage}
            renderLeftActions={() => (
              <Button variant="outlined" size="small" leftIcon={DownloadIcon} onClick={() => {}}>Download</Button>
            )}
          />
        </div>
      </div>

      {/* Breakdown Drawer Placeholder */}
      {showBreakdownDrawer && selectedMaterial && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", justifyContent: "flex-end", zIndex: 20000 }} onClick={() => setShowBreakdownDrawer(false)}>
          <div style={{ position: "absolute", inset: 0 }} onClick={() => setShowBreakdownDrawer(false)} />
          <div style={{ width: "800px", height: "100%", background: "var(--neutral-surface-primary)", position: "relative", display: "flex", flexDirection: "column", animation: "slideInRight 0.3s ease-out" }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: "20px 24px", borderBottom: "1px solid var(--neutral-line-separator-1)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0, fontSize: "var(--text-title-1)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Material Breakdown</h2>
              <IconButton icon={CloseIcon} onClick={() => setShowBreakdownDrawer(false)} size="small" color="var(--neutral-on-surface-primary)" />
            </div>
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Box size={24} color="var(--neutral-on-surface-tertiary)" />
                  </div>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontSize: "var(--text-title-3)", fontWeight: "bold" }}>{selectedMaterial.name}</span>
                    <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-tertiary)" }}>{selectedMaterial.sku}</span>
                  </div>
                </div>
                <StatusBadge variant={selectedMaterial.sVariant}>
                  {selectedMaterial.status === "Shortage" ? `${selectedMaterial.status}: ${selectedMaterial.remaining} ${selectedMaterial.uom}` : selectedMaterial.status}
                </StatusBadge>
              </div>

              {/* Tabs */}
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                {["Calculation", "Used In"].map(tab => (
                  <button 
                    key={tab}
                    onClick={() => setDrawerTab(tab)}
                    style={{
                      ...tabButtonStyle(drawerTab === tab),
                      height: "36px",
                      padding: "0 16px",
                      fontSize: "14px"
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div>
                {drawerTab === "Calculation" ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div 
                            style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                            onClick={() => setExpandedDemand(!expandedDemand)}
                          >
                            {expandedDemand ? <ChevronDownIcon size={16} color="var(--neutral-on-surface-tertiary)" /> : <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />}
                          </div>
                          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Demand</span>
                        </div>
                        <span style={{ fontWeight: "bold" }}>
                          {Math.max(selectedMaterial.demandBreakdown?.bom || 0, selectedMaterial.demandBreakdown?.wo || 0)} {selectedMaterial.uom}
                        </span>
                      </div>
                      {expandedDemand && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Required in BOM</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {selectedMaterial.demandBreakdown?.bom >= (selectedMaterial.demandBreakdown?.wo || 0) && (
                                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}>Marked as demand (largest)</span>
                              )}
                              <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>{selectedMaterial.demandBreakdown?.bom || 0} {selectedMaterial.uom}</span>
                            </div>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Requested in WO</span>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              {selectedMaterial.demandBreakdown?.wo > (selectedMaterial.demandBreakdown?.bom || 0) && (
                                <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", fontStyle: "italic" }}>Marked as demand (largest)</span>
                              )}
                              <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>{selectedMaterial.demandBreakdown?.wo || 0} {selectedMaterial.uom}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "var(--neutral-on-surface-secondary)", marginLeft: "24px" }}>Received by Production</span>
                      <span style={{ fontWeight: "bold" }}>{selectedMaterial.received} {selectedMaterial.uom}</span>
                    </div>
                    <div style={{ position: "relative", height: "1px", background: "var(--neutral-line-separator-1)", margin: "8px 0" }}>
                      <span style={{ position: "absolute", right: "-12px", top: "-11px", fontWeight: "bold", fontSize: "20px", lineHeight: "1" }}>-</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "var(--neutral-on-surface-secondary)", marginLeft: "24px" }}>Remaining</span>
                      <span style={{ fontWeight: "bold" }}>{selectedMaterial.remaining} {selectedMaterial.uom}</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "var(--neutral-on-surface-secondary)", marginLeft: "24px" }}>Available Stock</span>
                      <span style={{ fontWeight: "bold" }}>{selectedMaterial.availableStock} {selectedMaterial.uom}</span>
                    </div>
                    <div style={{ position: "relative", height: "1px", background: "var(--neutral-line-separator-1)", margin: "8px 0" }}>
                      <span style={{ position: "absolute", right: "-12px", top: "-11px", fontWeight: "bold", fontSize: "20px", lineHeight: "1" }}>-</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                      <span style={{ color: "var(--neutral-on-surface-secondary)", marginLeft: "24px" }}>Shortage</span>
                      <span style={{ fontWeight: "bold", color: selectedMaterial.remaining - selectedMaterial.availableStock > 0 ? "var(--status-red-primary)" : "var(--status-green-primary)" }}>
                        {selectedMaterial.remaining - selectedMaterial.availableStock} {selectedMaterial.uom}
                      </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          {selectedMaterial.incomingPOBreakdown?.length > 0 ? (
                            <div 
                              style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                              onClick={() => setExpandedIncomingPO(!expandedIncomingPO)}
                            >
                              {expandedIncomingPO ? <ChevronDownIcon size={16} color="var(--neutral-on-surface-tertiary)" /> : <ChevronRightIcon size={16} color="var(--neutral-on-surface-tertiary)" />}
                            </div>
                          ) : (
                            <div style={{ width: "16px" }} />
                          )}
                          <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Incoming PO</span>
                        </div>
                        <span style={{ fontWeight: "bold", color: "var(--feature-brand-primary)" }}>
                          {(selectedMaterial.incomingPOBreakdown || []).reduce((acc, po) => acc + po.qty, 0)} {selectedMaterial.uom}
                        </span>
                      </div>
                      {expandedIncomingPO && selectedMaterial.incomingPOBreakdown?.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "32px" }}>
                          {selectedMaterial.incomingPOBreakdown.map((po, idx) => (
                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>{po.poNo}</span>
                              <span style={{ fontWeight: "bold", color: "var(--neutral-on-surface-secondary)" }}>{po.qty} {selectedMaterial.uom}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {/* Table Header */}
                    <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr", borderBottom: "1px solid var(--neutral-line-separator-1)", padding: "12px 0", gap: "16px" }}>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Work Order No</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Product</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Required in BOM</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Requested in WO</div>
                      <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "bold" }}>Received</div>
                    </div>
                    {/* Table Body */}
                    {selectedMaterial.usedIn.map((use, idx) => (
                      <div key={idx} style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr 1fr 1fr 1fr", borderBottom: "1px solid var(--neutral-line-separator-1)", padding: "16px 0", gap: "16px", alignItems: "center" }}>
                        <div 
                          style={{ fontSize: "14px", fontWeight: "bold", color: "var(--feature-brand-primary)", cursor: "pointer", transition: "text-decoration 0.2s" }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                        >
                          {use.wo}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <div style={{ width: "32px", height: "32px", borderRadius: "4px", background: "var(--neutral-surface-grey-lighter)", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                            {use.image ? <img src={use.image} alt={use.product} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Box size={16} color="var(--neutral-on-surface-tertiary)" />}
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                            <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{use.product}</span>
                            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>{use.productSku}</span>
                          </div>
                        </div>
                        <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>{use.bom} {selectedMaterial.uom}</div>
                        <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>{use.woQty} {selectedMaterial.uom}</div>
                        <div style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)", fontWeight: "normal" }}>{use.received} {selectedMaterial.uom}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export const OrderDetailPage = ({ onNavigate, initialData = {} }) => {
  const [activeTab, setActiveTab] = useState("work-orders");

  const orderData = initialData;
  const shipmentCode = orderData.shipmentCode || `SHP-${orderData.orderNo?.split('-').slice(1).join('-') || "202604-001"}`;

  const tabs = [
    { key: "work-orders", label: "Work Orders" },
    { key: "materials", label: "Materials" },
    { key: "traceability", label: "Traceability" },
    { key: "invoices", label: "Invoices" },
    { key: "attachments", label: "Attachments" },
    { key: "logs", label: "Logs" },
  ];

  const handleBackNavigation = () => onNavigate("list");

  return (
    <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header & Breadcrumb */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div 
            style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: "8px", 
              cursor: "pointer",
              marginLeft: "-4px" 
            }}
            onClick={handleBackNavigation}
          >
            <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ 
              margin: 0, 
              fontSize: "var(--text-large-title)", 
              fontWeight: "var(--font-weight-bold)" 
            }}>
              Order Detail
            </h1>
          </div>
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "8px", 
            fontSize: "var(--text-title-3)",
            marginLeft: "32px" 
          }}>
            <span 
              onClick={handleBackNavigation} 
              style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }}
            >
              Orders
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>Order Detail</span>
          </div>
        </div>
        <Button variant="outlined" leftIcon={EditIcon} onClick={() => {}}>
          Edit Order
        </Button>
      </div>

      {/* Order Information Section */}
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "var(--radius-card)", 
        border: "1px solid var(--neutral-line-separator-1)",
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          padding: "24px 24px 16px 24px" 
        }}>
          <span style={{ 
            fontSize: "var(--text-headline)", 
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)"
          }}>
            {orderData.orderNo || "ORD-000000"}
          </span>
          <StatusBadge variant={orderData.sBadge || "grey"}>{orderData.status || "Draft"}</StatusBadge>
        </div>
        
        <div style={{ margin: "0 24px", height: "1px", background: "var(--neutral-line-separator-1)" }} />

        <div style={{ 
          padding: "24px",
          display: "grid", 
          gridTemplateColumns: "repeat(4, 1fr)", 
          gap: "24px 32px" 
        }}>
          {/* Row 1 */}
          <LabelValue 
            label="Quote No" 
            value={orderData.quoteNo} 
            isClickable={true} 
            onClick={() => onNavigate("quote_detail", { quoteNo: orderData.quoteNo })} 
          />
          <LabelValue label="Purchase Order No" value={orderData.poNo || "-"} />
          <LabelValue label="Created By" value={orderData.createdBy} />
          <LabelValue label="Priority" badge={{ text: orderData.priority, variant: orderData.pVariant }} />

          {/* Row 2 */}
          <LabelValue label="Planned Start Date" value={orderData.plannedStart} />
          <LabelValue label="Planned End Date" value={orderData.plannedEnd} />
          <LabelValue label="Actual Start Date" value={orderData.actualStart || "-"} />
          <LabelValue label="Actual End Date" value={orderData.actualEnd || "-"} />

          {/* Row 3 */}
          <LabelValue label="Customer Name" value={orderData.customerName} />
          <LabelValue 
            label="Shipment Code" 
            value={shipmentCode} 
            isClickable={true} 
            onClick={() => onNavigate("shipment_detail", { shipmentCode })} 
          />
          <LabelValue label="Remarks" value={orderData.remarks || "-"} gridColumn="span 2" />
        </div>
      </div>

      {/* Tab Chips */}
      <div style={{ 
        display: "flex", 
        gap: "12px", 
        alignItems: "center" 
      }}>
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            style={tabButtonStyle(activeTab === tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ 
        background: activeTab === "materials" ? "transparent" : "var(--neutral-surface-primary)", 
        borderRadius: activeTab === "materials" ? "0" : "var(--radius-card)", 
        border: activeTab === "materials" ? "none" : "1px solid var(--neutral-line-separator-1)",
        overflow: "hidden"
      }}>
        {activeTab === "work-orders" && (
          <WorkOrderTab orderNo={orderData.orderNo} onNavigate={onNavigate} />
        )}
        {activeTab === "materials" && (
          <MaterialsTab orderNo={orderData.orderNo} onNavigate={onNavigate} />
        )}
        {activeTab === "traceability" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--neutral-on-surface-tertiary)" }}>
            Traceability Content (Coming Soon)
          </div>
        )}
        {activeTab === "invoices" && (
          <InvoicesTab onNavigate={onNavigate} />
        )}
        {activeTab === "attachments" && (
          <AttachmentsTab onNavigate={onNavigate} />
        )}
        {activeTab === "logs" && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "300px", color: "var(--neutral-on-surface-tertiary)" }}>
            Logs Content (Coming Soon)
          </div>
        )}
      </div>
    </div>
  );
};
