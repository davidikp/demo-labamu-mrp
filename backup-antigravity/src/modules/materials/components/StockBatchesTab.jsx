import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  SearchIcon, 
  ChevronDownIcon, 
  AddIcon,
  EditIcon,
  Trash2 as DisposeIcon,
  FileText as AttachmentIcon,
  Info,
  CloseIcon,
  Trash2,
  CalendarIcon,
  UploadIcon,
  CheckIcon,
  CloudUploadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CopyIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { MOCK_STOCK_BATCHES } from "../mock/batchesMocks.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import { 
  parseIsoDateString, 
  formatIsoDateString, 
  buildCalendarDays 
} from "../../../utils/date/dateUtils.js";
import { 
  DATE_PICKER_MONTHS, 
  DATE_PICKER_POPOVER_WIDTH,
  DATE_PICKER_WEEKDAYS
} from "../../../constants/appConstants.js";

const FormField = ({ label, required = false, children, error, headerRight }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%" }}>
    {label && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "2px", fontSize: "var(--text-body)", fontWeight: "var(--font-weight-regular)" }}>
          {required && <span style={{ color: "var(--status-red-primary)" }}>*</span>}
          <span style={{ color: "var(--neutral-on-surface-primary)" }}>{label}</span>
        </div>
        {headerRight && (
          <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
            {headerRight}
          </span>
        )}
      </div>
    )}
    {children}
    {error && <span style={{ fontSize: "var(--text-desc)", color: "var(--status-red-primary)" }}>{error}</span>}
  </div>
);

const Tooltip = ({ content, children }) => {
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
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center"
      }}
      onMouseEnter={() => setIsVisible(true)}
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
              zIndex: 10001,
              whiteSpace: "normal",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--neutral-on-surface-primary)",
              color: "var(--neutral-surface-primary)",
              fontSize: "var(--text-desc)",
              lineHeight: "1.6",
              boxShadow: "var(--elevation-sm)",
              textAlign: "left",
              pointerEvents: "none",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%",
                transform: "translateX(-50%)",
                borderWidth: "6px",
                borderStyle: "solid",
                borderColor:
                  "var(--neutral-on-surface-primary) transparent transparent transparent",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

const InputField = ({ label, required, type = "text", placeholder, value, onChange, prefix, suffix, error, icon: Icon, headerRight, ...rest }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <FormField label={label} required={required} error={error} headerRight={headerRight}>
      <div style={{ 
        display: "flex", 
        alignItems: "center", 
        height: "48px", 
        border: `1px solid ${error ? "var(--status-red-primary)" : isFocused ? "var(--feature-brand-primary)" : "#e9e9e9"}`, 
        borderRadius: "10px",
        background: "var(--neutral-surface-primary)",
        padding: "0 16px",
        gap: "8px",
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        boxShadow: isFocused ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none"
      }}>
        {prefix && <span style={{ color: "var(--neutral-on-surface-secondary)", fontSize: "var(--text-subtitle-1)" }}>{prefix}</span>}
        <input 
          type={type}
          value={value}
          onChange={onChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          style={{ 
            flex: 1, 
            border: "none", 
            outline: "none", 
            fontSize: "var(--text-subtitle-1)", 
            background: "transparent",
            color: "var(--neutral-on-surface-primary)",
            width: "100%"
          }}
          {...rest}
        />
        {suffix && <span style={{ color: "var(--neutral-on-surface-secondary)", fontSize: "var(--text-subtitle-1)" }}>{suffix}</span>}
        {Icon && <Icon size={20} color="var(--neutral-on-surface-tertiary)" />}
      </div>
    </FormField>
  );
};

const DocumentTypeBadge = ({ fileName = "" }) => {
  const extension = (fileName.split(".").pop() || "PDF").toUpperCase();
  const palette = {
    PDF: { bg: "#E0001B", fold: "#F3A0AA" },
    JPG: { bg: "#FF980C", fold: "#FFD39C" },
    JPEG: { bg: "#FF980C", fold: "#FFD39C" },
    PNG: { bg: "#456FB4", fold: "#A9BDE2" },
  }[extension] || { bg: "#6E90C7", fold: "#A8BFE2" };

  return (
    <div style={{
      width: "36px",
      height: "42px",
      borderRadius: "6px",
      background: palette.bg,
      position: "relative",
      flexShrink: 0,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      paddingBottom: "8px",
      boxSizing: "border-box",
      overflow: "hidden",
      clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeft: "12px solid transparent",
        borderTop: "12px solid " + palette.fold,
      }} />
      <span style={{
        fontSize: "8px",
        fontWeight: "bold",
        color: "#fff",
        lineHeight: 1,
        letterSpacing: "0.1px",
      }}>
        {extension.slice(0, 4)}
      </span>
    </div>
  );
};

const TableAttachmentCard = ({ attachments = [] }) => {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", padding: "8px 0" }}>
      {attachments.map((att, i) => (
        <div key={att.id || i} style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          width: "100%",
          minWidth: 0
        }}>
          <DocumentTypeBadge fileName={att.file?.name || "proof.pdf"} />
          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            minWidth: 0,
            flex: 1
          }}>
            <span style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--feature-brand-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {att.description || "Proof Document"}
            </span>
            <span style={{
              fontSize: "12px",
              color: "var(--feature-brand-primary)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}>
              {att.file?.name || "receipt-proof-completed.pdf"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

const FileCard = ({ attachment, onRemove, onDescriptionChange }) => (
  <div style={{
    border: "1px solid var(--neutral-line-separator-1)",
    borderRadius: "24px",
    padding: "20px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
    background: "var(--neutral-surface-primary)",
  }}>
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "16px", minWidth: 0 }}>
        <DocumentTypeBadge fileName={attachment.file.name} />
        <span style={{
          fontSize: "var(--text-title-3)",
          fontWeight: "var(--font-weight-regular)",
          color: "var(--neutral-on-surface-primary)",
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap"
        }}>
          {attachment.file.name}
        </span>
      </div>
      <Button variant="danger" size="small" onClick={onRemove} style={{ padding: "0 16px" }}>Remove</Button>
    </div>
    
    <InputField 
      label="File Description"
      required
      placeholder="Enter File Description"
      value={attachment.description}
      onChange={(e) => onDescriptionChange(e.target.value)}
      maxLength={40}
      headerRight={`${attachment.description.length}/40`}
    />
  </div>
);



const DateInputControl = ({
  value = "",
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const todayIso = formatIsoDateString(new Date());
  const selectedDate = parseIsoDateString(value);
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(selectedDate || new Date());
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 360, placement: "bottom" });
  const [selectionMode, setSelectionMode] = useState("days");

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 360;
    const estimatedHeight = 360;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const leftAlign = rect.left;
    const left = Math.min(Math.max(8, leftAlign), maxLeft);
    setPopoverPos({ left, top: openAbove ? rect.top - 8 : rect.bottom + 8, width, placement: openAbove ? "top" : "bottom" });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();
    const handlePointerDown = (event) => {
      if (triggerRef.current?.contains(event.target) || popoverRef.current?.contains(event.target)) return;
      setIsOpen(false);
    };
    const handleViewportChange = () => updatePopoverPosition();
    document.addEventListener("mousedown", handlePointerDown);
    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen]);

  const calendarDays = buildCalendarDays(viewDate);
  const monthLabel = DATE_PICKER_MONTHS[viewDate.getMonth()];
  const yearLabel = viewDate.getFullYear();

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setViewDate(selectedDate || new Date());
          setIsOpen((prev) => !prev);
        }}
        style={{
          width: "100%",
          height: fieldHeight,
          border: `1px solid ${hasError ? "var(--status-red-primary)" : isOpen ? "var(--feature-brand-primary)" : "#e9e9e9"}`,
          borderRadius,
          background: disabled ? "var(--neutral-surface-grey-lighter)" : "var(--neutral-surface-primary)",
          boxShadow: isOpen ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
          padding: "0 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          cursor: disabled ? "not-allowed" : "pointer",
          textAlign: "left",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
          ...style,
        }}
      >
        <span style={{ fontSize, color: disabled ? "var(--neutral-on-surface-tertiary)" : value ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)" }}>
          {value || placeholder}
        </span>
        <CalendarIcon size={18} color={disabled ? "var(--neutral-line-outline)" : "var(--neutral-on-surface-secondary)"} />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            transform: popoverPos.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-2)",
            borderRadius: "12px",
            boxShadow: "0px 6px 15px -2px rgba(16, 24, 40, 0.08)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 13020,
          }}
        >
          {selectionMode === "days" ? (
            <>
              <div style={{ 
                display: "flex", 
                alignItems: "center", 
                justifyContent: "space-between", 
                padding: "12px 16px",
                margin: "4px 8px 8px",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "12px",
                background: "var(--neutral-surface-primary)"
              }}>
                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ border: "none", background: "transparent", padding: "4px", cursor: "pointer", display: "flex" }}>
                  <ChevronLeftIcon size={18} color="var(--neutral-on-surface-secondary)" />
                </button>
                <div style={{ display: "flex", gap: "48px", alignItems: "center" }}>
                   <span onClick={() => setSelectionMode("months")} style={{ fontWeight: "bold", cursor: "pointer", fontSize: "var(--text-title-2)" }}>{monthLabel.substring(0, 3).toUpperCase()}</span>
                   <span onClick={() => setSelectionMode("years")} style={{ fontWeight: "bold", cursor: "pointer", fontSize: "var(--text-title-2)" }}>{yearLabel}</span>
                </div>
                <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ border: "none", background: "transparent", padding: "4px", cursor: "pointer", display: "flex" }}>
                  <ChevronRightIcon size={18} color="var(--neutral-on-surface-secondary)" />
                </button>
              </div>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))", 
                rowGap: "8px",
                columnGap: "16px",
                paddingTop: "4px"
              }}>
                {DATE_PICKER_WEEKDAYS.map(weekday => (
                  <div key={weekday} style={{ display: "flex", justifyContent: "center", padding: "8px 0", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                    {weekday}
                  </div>
                ))}
              </div>
              <div style={{ height: "4px", background: "var(--neutral-surface-grey-lighter)", width: "100%" }} />
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(7, minmax(0, 1fr))", 
                rowGap: "8px",
                columnGap: "16px",
                paddingTop: "8px"
              }}>
                {calendarDays.map(day => {
                  const isSelected = day.iso === value;
                  const isToday = day.iso === todayIso;
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => {
                        onChange?.({ target: { value: day.iso } });
                        setIsOpen(false);
                      }}
                      style={{
                        width: "34px",
                        height: "34px",
                        margin: "0 auto",
                        border: "none",
                        borderRadius: "50%",
                        background: isSelected ? "var(--feature-brand-primary)" : isToday ? "var(--feature-brand-container)" : "transparent",
                        color: isSelected ? "white" : isToday ? "var(--feature-brand-primary)" : day.isCurrentMonth ? "var(--neutral-on-surface-primary)" : "var(--neutral-line-separator-2)",
                        cursor: "pointer",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: isToday || isSelected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                    >
                      {day.day}
                      {isToday && !isSelected && (
                        <div style={{ position: "absolute", bottom: "4px", left: "50%", transform: "translateX(-50%)", width: "4px", height: "4px", borderRadius: "50%", background: "var(--feature-brand-primary)" }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : selectionMode === "months" ? (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "8px" }}>
                {DATE_PICKER_MONTHS.map((m, idx) => (
                  <button key={m} onClick={() => { setViewDate(new Date(viewDate.getFullYear(), idx, 1)); setSelectionMode("days"); }} style={{ padding: "12px 8px", border: "none", borderRadius: "8px", background: viewDate.getMonth() === idx ? "var(--feature-brand-primary)" : "transparent", color: viewDate.getMonth() === idx ? "white" : "inherit", cursor: "pointer", fontSize: "13px" }}>{m}</button>
                ))}
             </div>
          ) : (
             <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", padding: "8px" }}>
                {Array.from({ length: 12 }, (_, i) => viewDate.getFullYear() - 5 + i).map(y => (
                   <button key={y} onClick={() => { setViewDate(new Date(y, viewDate.getMonth(), 1)); setSelectionMode("days"); }} style={{ padding: "12px 8px", border: "none", borderRadius: "8px", background: viewDate.getFullYear() === y ? "var(--feature-brand-primary)" : "transparent", color: viewDate.getFullYear() === y ? "white" : "inherit", cursor: "pointer", fontSize: "13px" }}>{y}</button>
                ))}
             </div>
          )}
        </div>
      )}
    </>
  );
};

export const StockBatchesTab = ({ 
  materialId, 
  localBatches, 
  setLocalBatches, 
  setLocalTransactions, 
  showSnackbar 
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showEmptyBatches, setShowEmptyBatches] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    location: [],
    status: [],
    vendor: [],
    expiration: []
  });
  const [openFilterKey, setOpenFilterKey] = useState(null);
  const [popoverTriggerRect, setPopoverTriggerRect] = useState(null);
  
  // localBatches and localTransactions are now passed as props
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [successToastMessage, setSuccessToastMessage] = useState("Batch successfully saved");
  const [drawerMode, setDrawerMode] = useState(null); // 'add' | 'edit' | null
  const [formData, setFormData] = useState({
    id: null,
    quantity: "",
    costPerPcs: "",
    purchaseDate: "",
    expiryDate: "",
    expectedDate: "",
    status: "Requested",
    receivedDate: "",
    storageLocation: "",
    vendor: "",
    attachments: []
  });
  const [errors, setErrors] = useState({});
  
  // Dispose Modal State
  const [showDisposeModal, setShowDisposeModal] = useState(false);
  const [batchToDispose, setBatchToDispose] = useState(null);
  const [disposalReason, setDisposalReason] = useState("");
  const [disposeError, setDisposeError] = useState("");

  const scrollerRef = useRef(null);
  const [scrollShadows, setScrollShadows] = useState({ left: false, right: false });

  const closeDrawer = () => {
    setDrawerMode(null);
    setFormData({
      id: null,
      quantity: "",
      costPerPcs: "",
      purchaseDate: "",
      expiryDate: "",
      expectedDate: "",
      status: "Requested",
      receivedDate: "",
      storageLocation: "",
      vendor: "",
      attachments: []
    });
    setErrors({});
  };

  const openAddDrawer = () => setDrawerMode("add");

  const openDisposeModal = (batch) => {
    setBatchToDispose(batch);
    setDisposalReason("");
    setDisposeError("");
    setShowDisposeModal(true);
  };

  const handleDispose = () => {
    if (!disposalReason.trim()) {
      setDisposeError("Reason is required");
      return;
    }

    if (batchToDispose) {
      // 1. Update batch quantity to 0
      setLocalBatches(prev => prev.map(b => 
        b.id === batchToDispose.id 
          ? { ...b, currentQty: 0, status: "Disposed" } 
          : b
      ));

      // 2. Add transaction record
      const now = new Date();
      const newTransaction = {
        id: `tx-dispose-${Date.now()}`,
        materialId: materialId,
        date: now.toISOString(),
        batchNo: batchToDispose.batchNo,
        type: "Write Off",
        quantity: -batchToDispose.currentQty,
        unit: "pcs", 
        workOrder: null,
        product: "-",
        reason: disposalReason,
        actionBy: "Admin User"
      };

      if (setLocalTransactions) {
        setLocalTransactions(prev => [newTransaction, ...prev]);
      }

      // 3. Close modal and show snackbar
      setShowDisposeModal(false);
      setBatchToDispose(null);
      setDisposalReason("");
      
      if (showSnackbar) {
        showSnackbar("Batch successfully disposed", "black");
      } else {
        setSuccessToastMessage("Batch successfully disposed");
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 3000);
      }
    }
  };

  const openEditDrawer = (batch) => {
    setFormData({
      id: batch.id,
      quantity: (batch.currentQty || batch.initialQty || "").toString(),
      costPerPcs: (batch.costPerUnit || "").toString(),
      purchaseDate: batch.purchaseDate || "",
      expiryDate: batch.expiryDate || "",
      expectedDate: batch.expectedDate || "",
      status: batch.status || "Requested",
      receivedDate: batch.receivedDate || "",
      storageLocation: batch.storageLocation || "",
      vendor: batch.vendor || "",
      attachments: Array.isArray(batch.attachments) ? batch.attachments : []
    });
    setDrawerMode("edit");
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.quantity) newErrors.quantity = "This field cannot be empty";
    if (!formData.purchaseDate) newErrors.purchaseDate = "This field cannot be empty";
    if (formData.status === "Received" && !formData.receivedDate) {
      newErrors.receivedDate = "This field cannot be empty";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (validate()) {
      const newBatch = {
        id: formData.id || `batch-${Date.now()}`,
        materialId,
        batchNo: formData.id ? localBatches.find(b => b.id === formData.id)?.batchNo : `BN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
        initialQty: parseInt(formData.quantity.replace(/,/g, ''), 10),
        currentQty: parseInt(formData.quantity.replace(/,/g, ''), 10),
        reservedQty: 0,
        costPerUnit: parseInt(formData.costPerPcs.replace(/,/g, ''), 10),
        purchaseDate: formData.purchaseDate,
        expiryDate: formData.expiryDate,
        expectedDate: formData.expectedDate,
        receivedDate: formData.receivedDate,
        storageLocation: formData.storageLocation,
        vendor: formData.vendor,
        attachments: formData.attachments,
        status: formData.status
      };

      if (drawerMode === "add") {
        setLocalBatches(prev => [newBatch, ...prev]);
      } else {
        setLocalBatches(prev => prev.map(b => b.id === formData.id ? newBatch : b));
      }

      setShowSuccessToast(false);
      setSuccessToastMessage("Batch successfully saved");
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
      closeDrawer();
    }
  };

  const handleFileChange = (e) => {
    const rawFiles = Array.from(e.target.files);
    const MAX_SIZE = 30 * 1024 * 1024;
    
    const validFiles = [];
    for (const f of rawFiles) {
      if (f.size > MAX_SIZE) {
        alert(`File ${f.name} exceeds 30MB limit`);
      } else {
        validFiles.push({ file: f, description: "" });
      }
    }

    if (validFiles.length === 0) return;

    if (formData.attachments.length + validFiles.length > 3) {
      alert("Max 3 files allowed");
      return;
    }
    setFormData({...formData, attachments: [...formData.attachments, ...validFiles]});
  };

  const removeFile = (index) => {
    setFormData({...formData, attachments: formData.attachments.filter((_, i) => i !== index)});
  };

  const updateAttachmentDescription = (index, description) => {
    const updated = [...formData.attachments];
    updated[index] = { ...updated[index], description };
    setFormData({ ...formData, attachments: updated });
  };

  const handleFilterClick = (key, e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverTriggerRect(rect);
    setOpenFilterKey(prev => prev === key ? null : key);
  };

  const toggleFilterValue = (key, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }));
  };

  const getFilterOptions = (key) => {
    const allBatches = MOCK_STOCK_BATCHES.filter(b => b.materialId === materialId);
    switch (key) {
      case "location":
        return [...new Set(allBatches.map(b => b.storageLocation).filter(Boolean))];
      case "status":
        return [...new Set(allBatches.map(b => b.status).filter(Boolean))];
      case "vendor":
        return [...new Set(allBatches.map(b => b.vendor).filter(Boolean))];
      case "expiration":
        return ["Active", "Expiring Soon", "Expired"];
      default:
        return [];
    }
  };

  const batches = React.useMemo(() => {
    let result = localBatches.filter(b => b.materialId === materialId);

    // Search filter
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => 
        b.batchNo.toLowerCase().includes(q) || 
        (b.vendor && b.vendor.toLowerCase().includes(q)) ||
        (b.storageLocation && b.storageLocation.toLowerCase().includes(q))
      );
    }

    // Show Empty Batches toggle
    if (!showEmptyBatches) {
      result = result.filter(b => b.currentQty > 0 || b.status === 'Requested' || b.status === 'Delayed');
    }

    // Advanced filters
    if (activeFilters.location.length > 0) {
      result = result.filter(b => activeFilters.location.includes(b.storageLocation));
    }
    if (activeFilters.status.length > 0) {
      result = result.filter(b => activeFilters.status.includes(b.status));
    }
    if (activeFilters.vendor.length > 0) {
      result = result.filter(b => activeFilters.vendor.includes(b.vendor));
    }
    // Note: expiration status filter would require date logic, leaving as placeholder for now or mapping specific labels

    return result;
  }, [materialId, searchQuery, showEmptyBatches, activeFilters, localBatches]);

  useEffect(() => {
    const handleScroll = () => {
      if (!scrollerRef.current) return;
      const { scrollLeft, scrollWidth, clientWidth } = scrollerRef.current;
      setScrollShadows({
        left: scrollLeft > 0,
        right: scrollLeft < scrollWidth - clientWidth - 2
      });
    };

    const scroller = scrollerRef.current;
    if (scroller) {
      scroller.addEventListener("scroll", handleScroll);
      handleScroll(); // Initial check
    }
    return () => scroller?.removeEventListener("scroll", handleScroll);
  }, [batches]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(val);
  };

  const formatNumber = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const num = val.toString().replace(/[^0-9]/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const handleNumberInput = (val, field) => {
    const numericValue = val.replace(/,/g, "").replace(/[^0-9]/g, "");
    setFormData(prev => ({ ...prev, [field]: numericValue }));
  };

  const columns = [
    { label: "Batch No", key: "batchNo", width: "160px" },
    { label: "Initial Qty", key: "initialQty", width: "100px" },
    { label: "Current Qty", key: "currentQty", width: "100px" },
    { label: "Reserved Qty", key: "reservedQty", width: "120px" },
    { label: "Cost per Unit", key: "costPerUnit", width: "140px" },
    { label: "Purchase Date", key: "purchaseDate", width: "130px" },
    { label: "Expiry Date", key: "expiryDate", width: "130px" },
    { label: "Expected Date", key: "expectedDate", width: "130px" },
    { label: "Received Date", key: "receivedDate", width: "130px" },
    { label: "Storage Location", key: "storageLocation", width: "160px" },
    { label: "Vendor", key: "vendor", width: "160px" },
    { label: "Attachments", key: "attachments", width: "240px" },
    { label: "Status", key: "status", width: "100px" },
    { label: "Actions", key: "actions", width: "100px", sticky: true }
  ];

  return (
    <div style={{ 
      background: "var(--neutral-surface-primary)", 
      borderRadius: "16px", 
      border: "1px solid var(--neutral-line-separator-1)",
      overflow: "hidden",
      display: "flex", 
      flexDirection: "column", 
    }}>
      {/* Header Section */}
      <div style={{ 
        display: "flex", 
        flexDirection: "column",
        gap: "12px",
        padding: "20px 24px"
      }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          gap: "16px", 
          flexWrap: "wrap"
        }}>
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flex: 1, position: "relative" }}>
            <div onClick={(e) => handleFilterClick("status", e)}>
              <FilterPill label="Batch Status" count={activeFilters.status.length} active={activeFilters.status.length > 0} isOpen={openFilterKey === "status"} />
            </div>
            <div onClick={(e) => handleFilterClick("vendor", e)}>
              <FilterPill label="Vendor" count={activeFilters.vendor.length} active={activeFilters.vendor.length > 0} isOpen={openFilterKey === "vendor"} />
            </div>
            <div onClick={(e) => handleFilterClick("expiration", e)}>
              <FilterPill label="Expiration Status" count={activeFilters.expiration.length} active={activeFilters.expiration.length > 0} isOpen={openFilterKey === "expiration"} />
            </div>

            {openFilterKey && (
              <>
                {createPortal(
                  <div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setOpenFilterKey(null)} />,
                  document.body
                )}
                {createPortal(
                  <div style={{
                    position: "fixed",
                    top: popoverTriggerRect ? `${popoverTriggerRect.bottom + 8}px` : "200px",
                    left: popoverTriggerRect ? `${popoverTriggerRect.left}px` : "24px",
                    width: "280px",
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
                      <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                        {openFilterKey === "status" ? "Batch Status" : 
                         openFilterKey === "vendor" ? "Vendor" : "Expiration Status"}
                      </span>
                      <button 
                        onClick={() => {
                          setActiveFilters(prev => ({ ...prev, [openFilterKey]: [] }));
                          setOpenFilterKey(null);
                        }}
                        style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                      >
                        Remove Filter
                      </button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {getFilterOptions(openFilterKey).length > 0 ? getFilterOptions(openFilterKey).map(opt => (
                        <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                          <Checkbox 
                            checked={activeFilters[openFilterKey].includes(opt)} 
                            onChange={() => toggleFilterValue(openFilterKey, opt)} 
                          />
                          {opt}
                        </label>
                      )) : (
                        <div style={{ padding: "12px", textAlign: "center", fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>
                          No options available
                        </div>
                      )}
                    </div>
                  </div>,
                  document.body
                )}
              </>
            )}
          </div>
          
          <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
            <TableSearchField 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Batch No, Storage Loc"
              width="240px"
            />
            <Button 
              variant="filled" 
              leftIcon={AddIcon}
              onClick={openAddDrawer}
            >
              Add Batch
            </Button>
          </div>
        </div>

        <div 
          style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", width: "fit-content" }}
          onClick={() => setShowEmptyBatches(!showEmptyBatches)}
        >
          <Checkbox 
            checked={showEmptyBatches} 
            onChange={setShowEmptyBatches} 
          />
          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
            Show Empty Batches
          </span>
        </div>
      </div>

      <div
        style={{
          height: "1px",
          background: "var(--neutral-line-separator-1)",
          width: "100%",
        }}
      />

      {/* Table Section */}
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        overflow: "hidden",
        display: "flex",
        flexDirection: "column"
      }}>
        <div ref={scrollerRef} style={{ overflowX: "auto" }}>
          {/* Scroller Wrapper */}
          <div style={{ 
            minWidth: "1780px", 
            display: "inline-flex", 
            flexDirection: "column",
            background: "var(--neutral-surface-primary)"
          }}>
            {/* Header */}
            <div style={{ 
              display: "flex", 
              background: "var(--neutral-surface-primary)",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
              width: "100%"
            }}>
              {columns.map((col, idx) => {
                const isStickyLeft = idx === 0;
                const isStickyRightStatus = col.key === "status";
                const isStickyRightActions = col.key === "actions";
                
                return (
                  <div key={col.key} style={{ 
                    width: isStickyLeft ? "184px" : isStickyRightActions ? "140px" : isStickyRightStatus ? "96px" : col.width, 
                    padding: isStickyLeft ? "16px 12px 16px 24px" : isStickyRightActions ? "16px 24px 16px 12px" : "16px 12px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: isStickyRightActions ? "center" : "flex-start",
                    gap: "4px",
                    position: (isStickyLeft || isStickyRightStatus || isStickyRightActions) ? "sticky" : "static",
                    left: isStickyLeft ? 0 : "auto",
                    right: isStickyRightActions ? 0 : isStickyRightStatus ? "140px" : "auto",
                    background: "var(--neutral-surface-primary)",
                    zIndex: (isStickyLeft || isStickyRightStatus || isStickyRightActions) ? 2 : 1,
                    boxSizing: "border-box",
                    flexShrink: 0,
                    boxShadow: (isStickyLeft && scrollShadows.left) 
                      ? "4px 0 8px -4px rgba(0,0,0,0.12)" 
                      : (isStickyRightStatus && scrollShadows.right)
                      ? "-4px 0 8px -4px rgba(0,0,0,0.12)"
                      : "none",
                    transition: "box-shadow 0.2s ease",
                    alignSelf: (isStickyLeft || isStickyRightStatus || isStickyRightActions) ? "stretch" : "auto",
                  }}>
                    {col.label}
                  </div>
                );
              })}
            </div>

            {/* Body */}
            <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {batches.length > 0 ? batches.map((row, rowIdx) => (
                <div 
                  key={row.id} 
                  style={{ 
                    display: "flex", 
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    minHeight: "64px",
                    alignItems: "center",
                    transition: "background 0.12s ease",
                    cursor: "pointer",
                    width: "100%"
                  }}
                >
                  {/* Batch No (Sticky Left) */}
                  <div 
                    style={{ 
                      width: "184px", 
                      padding: "0 12px 0 24px", 
                      fontSize: "var(--text-title-3)", 
                      fontWeight: "var(--font-weight-bold)", 
                      color: "var(--neutral-on-surface-primary)",
                      position: "sticky",
                      left: 0,
                      background: "inherit",
                      zIndex: 2,
                      height: "auto",
                      alignSelf: "stretch",
                      display: "flex",
                      alignItems: "center",
                      boxSizing: "border-box",
                      flexShrink: 0,
                      boxShadow: scrollShadows.left ? "4px 0 8px -4px rgba(0,0,0,0.12)" : "none",
                      transition: "box-shadow 0.2s ease",
                      minWidth: 0
                    }}>
                    <Tooltip content={row.batchNo}>
                      <div style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%"
                      }}>
                        {row.batchNo}
                      </div>
                    </Tooltip>
                  </div>
                  
                  <div style={{ width: columns[1].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.initialQty?.toLocaleString('en-US') || 0}</div>
                  <div style={{ width: columns[2].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.currentQty?.toLocaleString('en-US') || 0}</div>
                  <div style={{ width: columns[3].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.reservedQty?.toLocaleString('en-US') || 0}</div>
                  <div style={{ width: columns[4].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{formatCurrency(row.costPerUnit)}</div>
                  <div style={{ width: columns[5].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.purchaseDate || "-"}</div>
                  <div style={{ width: columns[6].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.expiryDate || "-"}</div>
                  <div style={{ width: columns[7].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.expectedDate || "-"}</div>
                  <div style={{ width: columns[8].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.receivedDate || "-"}</div>
                  <div style={{ width: columns[9].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.storageLocation || "-"}</div>
                  <div style={{ width: columns[10].width, padding: "0 12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", flexShrink: 0 }}>{row.vendor}</div>
                  
                  {/* Attachments */}
                  <div style={{ 
                    width: columns[11].width, 
                    padding: "0 12px",
                    display: "flex", 
                    alignItems: "center", 
                    flexShrink: 0
                  }}>
                    {row.attachments?.length > 0 ? (
                      <TableAttachmentCard attachments={row.attachments} />
                    ) : (
                      <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>-</span>
                    )}
                  </div>
                  
                  {/* Status (Sticky Right) */}
                  <div style={{ 
                    width: "96px", 
                    padding: "0 12px",
                    position: "sticky",
                    right: "140px",
                    background: "var(--neutral-surface-primary)",
                    zIndex: 2,
                    height: "auto",
                    alignSelf: "stretch",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    boxSizing: "border-box",
                    flexShrink: 0,
                    boxShadow: scrollShadows.right ? "-4px 0 8px -4px rgba(0,0,0,0.12)" : "none",
                    transition: "box-shadow 0.2s ease"
                  }}>
                    <StatusBadge variant={
                      row.status === "Received" ? "green-light" : 
                      row.status === "Delayed" ? "red" : 
                      row.status === "Requested" ? "blue-light" : 
                      row.status === "Disposed" ? "grey-light" :
                      "grey"
                    }>
                      {row.status}
                    </StatusBadge>
                  </div>

                  {/* Actions (Sticky Right) */}
                  <div style={{ 
                    width: "140px", 
                    padding: "0 24px 0 12px", 
                    display: "flex", 
                    gap: "8px",
                    position: "sticky",
                    right: 0,
                    background: "var(--neutral-surface-primary)",
                    zIndex: 2,
                    height: "auto",
                    alignSelf: "stretch",
                    alignItems: "center",
                    justifyContent: "center",
                    boxSizing: "border-box",
                    flexShrink: 0
                  }}>
                    <Tooltip content="Edit">
                      <IconButton 
                        icon={EditIcon} 
                        onClick={() => openEditDrawer(row)} 
                        size="small" 
                        color="var(--feature-brand-primary)" 
                      />
                    </Tooltip>
                    <Tooltip content="Dispose">
                      <IconButton 
                        icon={DisposeIcon} 
                        onClick={() => openDisposeModal(row)} 
                        size="small" 
                        color="var(--status-red-primary)" 
                      />
                    </Tooltip>
                  </div>
                </div>
              )) : (
                <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>
                  No batches found.
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 4px" }}>
          <TablePaginationFooter 
            currentPage={1}
            totalPages={1}
            rowsPerPage={25}
            totalRows={batches.length}
            onPageChange={() => {}}
            onRowsPerPageChange={() => {}}
          />
        </div>
      </div>


      {/* Drawer Modal */}
      {drawerMode && (
        <div style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0, 0, 0, 0.28)",
          display: "flex",
          justifyContent: "flex-end",
          zIndex: 13000,
        }}>
          <div style={{ position: "absolute", inset: 0 }} onClick={closeDrawer} />
          <div style={{
            position: "relative",
            width: "520px",
            maxWidth: "calc(100vw - 24px)",
            height: "100vh",
            background: "var(--neutral-surface-primary)",
            boxShadow: "-12px 0 32px rgba(0, 0, 0, 0.08)",
            display: "flex",
            flexDirection: "column",
          }}>
            {/* Drawer Header */}
            <div style={{ 
              padding: "20px 24px", 
              borderBottom: "1px solid var(--neutral-line-separator-1)", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between", 
              background: "var(--neutral-surface-primary)" 
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <h2 style={{ 
                  margin: 0, 
                  fontSize: "var(--text-title-1)", 
                  fontWeight: "var(--font-weight-bold)", 
                  color: "var(--neutral-on-surface-primary)" 
                }}>
                  {drawerMode === "add" ? "Add Stock Batch" : "Edit Stock Batch"}
                </h2>
              </div>
              <IconButton icon={CloseIcon} onClick={closeDrawer} size="small" color="var(--neutral-on-surface-primary)" />
            </div>

            {/* Drawer Body */}
            <div style={{ flex: 1, overflowY: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <InputField 
                label="Quantity" 
                required 
                type="text"
                value={formatNumber(formData.quantity)}
                onChange={(e) => handleNumberInput(e.target.value, "quantity")}
                placeholder="0"
                suffix="Pcs"
                error={errors.quantity}
              />
              
              <InputField 
                label="Cost/Pcs" 
                type="text"
                value={formatNumber(formData.costPerPcs)}
                onChange={(e) => handleNumberInput(e.target.value, "costPerPcs")}
                placeholder="0"
                prefix="IDR"
              />

              <FormField label="Purchase Date" required error={errors.purchaseDate}>
                <DateInputControl 
                  value={formData.purchaseDate}
                  onChange={(e) => setFormData({...formData, purchaseDate: e.target.value})}
                  hasError={!!errors.purchaseDate}
                />
              </FormField>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <FormField label="Expiry Date">
                  <DateInputControl 
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                  />
                </FormField>
                <FormField label="Expected Date">
                  <DateInputControl 
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({...formData, expectedDate: e.target.value})}
                  />
                </FormField>
              </div>

              <FormField label="Status">
                <DropdownSelect 
                  value={formData.status}
                  onChange={(val) => setFormData({...formData, status: val})}
                  options={[
                    { value: "Requested", label: "Requested" },
                    { value: "Received", label: "Received" }
                  ]}
                />
              </FormField>

              {formData.status === "Received" && (
                <FormField label="Received Date" required error={errors.receivedDate}>
                  <DateInputControl 
                    value={formData.receivedDate}
                    onChange={(e) => setFormData({...formData, receivedDate: e.target.value})}
                    hasError={!!errors.receivedDate}
                  />
                </FormField>
              )}

              <InputField 
                label="Storage Location" 
                value={formData.storageLocation}
                onChange={(e) => setFormData({...formData, storageLocation: e.target.value})}
                placeholder="Enter storage location"
              />

              <FormField label="Vendor">
                <DropdownSelect 
                  value={formData.vendor}
                  onChange={(val) => setFormData({...formData, vendor: val})}
                  options={MOCK_VENDORS.map(v => ({ value: v.name, label: v.name }))}
                  placeholder="Select vendor"
                  searchable
                  hideSearchIcon
                />
              </FormField>

              {/* Attachments Section */}
              <FormField label="Attachments">
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  <label style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    minHeight: "168px",
                    borderRadius: "24px",
                    border: "2px dashed var(--feature-brand-primary)",
                    background: "var(--neutral-surface-primary)",
                    padding: "24px",
                    textAlign: "center",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    gap: "8px"
                  }}>
                    <input type="file" multiple onChange={handleFileChange} style={{ display: "none" }} />
                    <CloudUploadIcon size={40} color="var(--feature-brand-primary)" />
                    <span style={{ fontSize: "var(--text-body)", color: "#A9A9A9", lineHeight: "18px" }}>
                      Max 3 files, 30MB each
                    </span>
                    <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-primary)", lineHeight: "18px" }}>
                      Drag file or <span style={{ color: "var(--feature-brand-primary)" }}>browse file</span>
                    </span>
                  </label>

                  {/* File List */}
                  {formData.attachments.map((attachment, idx) => (
                    <FileCard 
                      key={`${attachment.file.name}-${idx}`} 
                      attachment={attachment} 
                      onRemove={() => removeFile(idx)}
                      onDescriptionChange={(desc) => updateAttachmentDescription(idx, desc)}
                    />
                  ))}
                </div>
              </FormField>
            </div>

            {/* Drawer Footer */}
            <div style={{
              padding: "20px 24px",
              borderTop: "1px solid var(--neutral-line-separator-1)",
              display: "flex",
              justifyContent: "space-between",
              gap: "12px",
              background: "var(--neutral-surface-primary)"
            }}>
              <Button variant="outlined" size="large" onClick={closeDrawer} style={{ flex: 1 }}>Cancel</Button>
              <Button variant="filled" size="large" onClick={handleSave} style={{ flex: 1 }}>
                {drawerMode === "add" ? "Save" : "Save Changes"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {showSuccessToast && (
        <div style={{
          position: "fixed",
          bottom: "24px",
          left: "50%",
          transform: "translateX(-50%)",
          background: "var(--neutral-on-surface-primary)",
          color: "var(--neutral-surface-primary)",
          padding: "12px 24px",
          borderRadius: "8px",
          boxShadow: "var(--elevation-sm)",
          zIndex: 20000,
          display: "flex",
          alignItems: "center",
          gap: "12px",
          fontSize: "var(--text-body)",
          fontWeight: "var(--font-weight-bold)"
        }}>
          <CheckIcon size={20} color="var(--status-green-primary)" />
          {successToastMessage}
        </div>
      )}
      {/* Dispose Confirmation Modal */}
      <GeneralModal
        isOpen={showDisposeModal}
        onClose={() => setShowDisposeModal(false)}
        title="Dispose Batch?"
        description={`This will permanently remove ${batchToDispose?.batchNo || ""} from inventory.`}
        width="440px"
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%" }}>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => setShowDisposeModal(false)} 
              style={{ flex: 1 }}
            >
              Back
            </Button>
            <Button 
              variant="filled" 
              size="large"
              onClick={handleDispose} 
              style={{ flex: 1 }}
            >
              Submit
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {batchToDispose?.reservedQty > 0 && (
            <div style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "12px",
              padding: "16px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              border: "1px solid var(--neutral-line-separator-1)"
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                  It affects 1 ongoing material request.
                </span>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                  <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                    Request ID: MR-202403-042
                  </span>
                  <Button 
                    variant="tertiary" 
                    size="small" 
                    leftIcon={CopyIcon}
                    onClick={() => {
                      navigator.clipboard.writeText("MR-202403-042");
                      alert("Request ID copied to clipboard");
                    }}
                    style={{ color: "var(--feature-brand-primary)", padding: "0 8px", height: "28px" }}
                  >
                    Copy
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ color: "var(--status-red-primary)", fontSize: "var(--text-body)" }}>*</span>
                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                  Reason
                </span>
              </div>
              <span style={{ fontSize: "var(--text-desc)", color: "var(--neutral-on-surface-tertiary)" }}>
                {disposalReason.length}/400
              </span>
            </div>
            <textarea
              value={disposalReason}
              onChange={(e) => {
                const val = e.target.value.slice(0, 400);
                setDisposalReason(val);
                if (val.trim()) setDisposeError("");
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "var(--feature-brand-primary)";
                e.target.style.boxShadow = "0 0 0 3px rgba(0, 104, 255, 0.08)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = disposeError ? "var(--status-red-primary)" : "var(--neutral-line-separator-2)";
                e.target.style.boxShadow = "none";
              }}
              placeholder="Input disposal reason"
              maxLength={400}
              style={{
                width: "100%",
                minHeight: "120px",
                borderRadius: "12px",
                border: disposeError ? "1px solid var(--status-red-primary)" : "1px solid var(--neutral-line-separator-2)",
                padding: "12px 16px",
                fontSize: "var(--text-subtitle-1)",
                outline: "none",
                resize: "none",
                boxSizing: "border-box",
                background: "var(--neutral-surface-primary)",
                color: "var(--neutral-on-surface-primary)",
                fontFamily: "Lato, sans-serif",
                transition: "border-color 0.2s ease, box-shadow 0.2s ease"
              }}
            />
            {disposeError && (
              <span style={{ fontSize: "var(--text-body)", color: "var(--status-red-primary)" }}>
                {disposeError}
              </span>
            )}
          </div>
        </div>
      </GeneralModal>
    </div>
  );
};

