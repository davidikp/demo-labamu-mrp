import React, { useEffect, useRef, useState } from "react";
import { AddIcon, Box, Building2, CheckIcon, ChevronDownIcon, ChevronLeftIcon, ChevronUpIcon, CloseIcon, DeleteIcon, DocumentIcon, EditIcon, Info, Minus, Plus } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { Card, DateInputControl, DateRangeInputControl, DocumentTypeBadge, FormField, ImageUploadField, InputField, InputGroup, LabelValue, PhoneInputField, ProgressRing, ProofDocumentList, SectionCard, Tooltip, UploadDescriptionCard, UploadDropzone } from "../components/WorkOrderDetailWidgets.jsx";
import { MOCK_COMPANY } from "../../../data/company.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import { MOCK_PO_TABLE_DATA } from "../../purchase-order/mock/purchaseOrderMocks.js";
import { formatCurrency, formatNumberWithCommas, parseNumberFromCommas } from "../../../utils/format/formatUtils.js";
import { normalizeProofDocuments, createUploadDocumentRecord, validateUploadFile } from "../../../utils/upload/uploadUtils.js";
import { MAX_PROOF_UPLOAD_FILES } from "../../../constants/appConstants.js";
import { buildPoLinkSnapshot } from "../../purchase-order/utils/purchaseOrderDetailUtils.js";
import {
  baseInputBorderColor,
  fieldStyle,
} from "../../purchase-order/styles/purchaseOrderInputStyles.js";

const SearchableVendorSelect = ({
  label,
  required = false,
  value = "",
  options = [],
  placeholder = "Type to search or add vendor",
  emptyMessage = "No vendors found",
  disabled = false,
  onChange,
}) => {
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const inputRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [query, setQuery] = useState(value || "");
  const [popoverPos, setPopoverPos] = useState({
    top: 0,
    left: 0,
    width: 0,
    placement: "bottom",
  });

  const selectedOption =
    options.find((option) => String(option.value) === String(value)) || null;
  const committedValue = selectedOption?.label || value || "";
  const normalizedQuery = query.trim().toLowerCase();
  const filteredOptions = options.filter((option) => {
    if (!normalizedQuery) return true;
    return (
      String(option.label).toLowerCase().includes(normalizedQuery) ||
      String(option.value).toLowerCase().includes(normalizedQuery)
    );
  });

  const closeMenu = () => {
    setIsOpen(false);
    setIsFocused(false);
    setQuery(committedValue);
  };

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = rect.width;
    const estimatedHeight = 280;
    const shouldOpenAbove =
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);

    setPopoverPos({
      left: Math.min(Math.max(8, rect.left), maxLeft),
      top: shouldOpenAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: shouldOpenAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    updatePopoverPosition();

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        menuRef.current?.contains(event.target)
      ) {
        return;
      }
      closeMenu();
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
  }, [isOpen, selectedOption?.label, options.length]);

  useEffect(() => {
    if (!isOpen) {
      setQuery(committedValue);
    }
  }, [committedValue, isOpen]);

  const selectOption = (option) => {
    onChange?.(option.value);
    setQuery(option.label);
    setIsOpen(false);
    setIsFocused(false);
  };

  return (
    <FormField label={label} required={required}>
      <div
        ref={triggerRef}
        style={{ position: "relative", width: "100%" }}
        onClick={() => {
          if (disabled) return;
          inputRef.current?.focus();
        }}
      >
        <input
          ref={inputRef}
          value={isOpen ? query : committedValue}
          onChange={(e) => {
            if (disabled) return;
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (disabled) return;
            setIsFocused(true);
            setIsOpen(true);
            setQuery(committedValue);
          }}
          onClick={() => {
            if (disabled) return;
            setIsFocused(true);
            setIsOpen(true);
          }}
          onBlur={() => {
            if (disabled) return;
            setTimeout(() => {
              if (!menuRef.current?.contains(document.activeElement)) {
                closeMenu();
              }
            }, 120);
          }}
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          style={{
            ...fieldStyle(disabled, !!committedValue || !!query, false),
            borderColor:
              isFocused || isOpen
                ? "var(--feature-brand-primary)"
                : baseInputBorderColor,
            boxShadow:
              isFocused || isOpen
                ? "0 0 0 3px rgba(0, 104, 255, 0.08)"
                : "none",
            padding: "0 48px 0 16px",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            cursor: disabled ? "not-allowed" : "text",
          }}
        />
        <ChevronDownIcon
          size={20}
          color="var(--neutral-on-surface-secondary)"
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
            transition: "transform 0.2s ease",
            pointerEvents: "none",
          }}
        />

        {isOpen && !disabled ? (
          <>
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 10019,
              }}
              onClick={closeMenu}
            />
            <div
              ref={menuRef}
              style={{
                position: "fixed",
                left: `${popoverPos.left}px`,
                top: `${popoverPos.top}px`,
                width: `${popoverPos.width}px`,
                transform:
                  popoverPos.placement === "top" ? "translateY(-100%)" : "none",
                background: "var(--neutral-surface-primary)",
                border: "1px solid var(--neutral-line-separator-1)",
                borderRadius: "12px",
                boxShadow: "0px 8px 20px rgba(27, 27, 27, 0.12)",
                overflow: "hidden",
                zIndex: 10020,
                maxHeight: "280px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ overflowY: "auto" }}>
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option, index) => {
                    const isSelected =
                      String(option.value) === String(value);
                    return (
                      <div
                        key={option.value}
                        onClick={() => selectOption(option)}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--neutral-surface-grey-lighter)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background =
                            "var(--neutral-surface-primary)";
                        }}
                        style={{
                          borderTop:
                            index === 0
                              ? "none"
                              : "1px solid var(--neutral-line-separator-1)",
                          minHeight: "56px",
                          padding: "0 18px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "12px",
                          cursor: "pointer",
                          fontSize: "var(--text-title-2)",
                          color: "var(--neutral-on-surface-primary)",
                          background: "var(--neutral-surface-primary)",
                        }}
                      >
                        <span>{option.label}</span>
                        {isSelected ? (
                          <CheckIcon size={16} color="var(--feature-brand-primary)" />
                        ) : null}
                      </div>
                    );
                  })
                ) : (
                  <div
                    style={{
                      padding: "16px 18px",
                      textAlign: "center",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-tertiary)",
                      background: "var(--neutral-surface-primary)",
                    }}
                  >
                    {emptyMessage}
                  </div>
                )}
              </div>
            </div>
          </>
        ) : null}
      </div>
    </FormField>
  );
};

export const WorkOrderDetailPage = ({ onNavigate, isSidebarCollapsed, initialData }) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };
  const TOTAL_QTY = initialData?.qty || 100;

  const [displayStartDate, setDisplayStartDate] = useState(
    initialData?.statusKey === "not_started" ? "" : initialData?.start || ""
  );
  const [displayEndDate, setDisplayEndDate] = useState(
    initialData?.statusKey === "not_started" ? "" : initialData?.end || ""
  );
  const WORK_ORDER_END_DATE = displayEndDate || "2026-01-08";
  const resolveVendorProgressStatus = (vendor) => {
    const rawStatus =
      vendor?.status === "Received"
        ? "Completed"
        : (vendor?.status === "Waiting" ? "Not Started" : vendor?.status || "Not Started");
    if (vendor?.name === "Internal") return rawStatus;

    const assignedOutput = parseInt(vendor?.output || 0, 10) || 0;
    const receivedOutput = parseInt(vendor?.receivedOutput || 0, 10) || 0;

    if (assignedOutput > 0 && receivedOutput >= assignedOutput)
      return "Completed";
    if (receivedOutput > 0) return "Partially Received";
    if (
      rawStatus === "Completed" ||
      rawStatus === "Partially Received" ||
      rawStatus === "In Progress"
    )
      return rawStatus;
    if (
      vendor?.isPoApproved ||
      vendor?.poStatus === "Issued" ||
      vendor?.poStatus === "Completed"
    )
      return "In Progress";
    return rawStatus;
  };

  const [outsourceSteps, setOutsourceSteps] = useState(
    initialData?.outsourceSteps || []
  );
  const [isReadyModalOpen, setIsReadyModalOpen] = useState(false);
  const [isConfirmReadyModalOpen, setIsConfirmReadyModalOpen] = useState(false);
  const [isManageStageModalOpen, setIsManageStageModalOpen] = useState(false);
  const [selectedStage, setSelectedStage] = useState(null);

  const [isSingleVendorModalOpen, setIsSingleVendorModalOpen] = useState(false);
  const [isCreatePoModalOpen, setIsCreatePoModalOpen] = useState(false);
  const [openPoPopoverVendorId, setOpenPoPopoverVendorId] = useState(null);
  const [poPopoverPosition, setPoPopoverPosition] = useState({
    top: 0,
    left: 0,
    placement: "bottom",
  });
  const [selectedVendorForPoAction, setSelectedVendorForPoAction] =
    useState(null);
  const [isSelectExistingPoModalOpen, setIsSelectExistingPoModalOpen] =
    useState(false);
  const [selectedExistingPoNumber, setSelectedExistingPoNumber] = useState("");
  const [isConfirmRemoveModalOpen, setIsConfirmRemoveModalOpen] =
    useState(false);
  const [vendorToRemove, setVendorToRemove] = useState(null);

  const [singleVendorForm, setSingleVendorForm] = useState({
    id: null,
    name: "",
    output: "",
    date: "",
    poNumber: "",
  });
  const [assignedOutputError, setAssignedOutputError] = useState("");

  const [createPoForm, setCreatePoForm] = useState({
    poDate: new Date().toISOString().split("T")[0],
    deliveryDate: "",
    currency: "IDR",
    unitPrice: "",
    tax: "",
    fees: "",
    notes: "",
    terms: "",
  });

  const [isViewReceiptHistoryModalOpen, setIsViewReceiptHistoryModalOpen] =
    useState(false);
  const [receiptHistoryVendor, setReceiptHistoryVendor] = useState(null);
  const [isViewAttachmentModalOpen, setIsViewAttachmentModalOpen] =
    useState(false);
  const [attachmentToView, setAttachmentToView] = useState(null);

  const [stageStart, setStageStart] = useState(0);
  const [stageProg, setStageProg] = useState(0);
  const [stageOriginalProg, setStageOriginalProg] = useState(0);
  const [stageComp, setStageComp] = useState(0);
  const [stageCompInput, setStageCompInput] = useState("0");
  const [stageProgError, setStageProgError] = useState("");
  const [stageCompError, setStageCompError] = useState("");
  const [stageOriginalComp, setStageOriginalComp] = useState(0);
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState(null);
  const [stageTotalPool, setStageTotalPool] = useState(0);
  const [stageMaxCompletable, setStageMaxCompletable] = useState(0);
  const [
    isManageStageVendorSectionExpanded,
    setIsManageStageVendorSectionExpanded,
  ] = useState(true);

  const [openVendorMenuId, setOpenVendorMenuId] = useState(null);
  const [vendorMenuPosition, setVendorMenuPosition] = useState({
    top: 0,
    right: 0,
    placement: "bottom",
  });

  const getVendorMenuPosition = (triggerRect, menuHeight = 176) => {
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const shouldOpenAbove =
      spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

    return {
      top: shouldOpenAbove ? triggerRect.top - 8 : triggerRect.bottom + 8,
      right: window.innerWidth - triggerRect.right,
      placement: shouldOpenAbove ? "top" : "bottom",
    };
  };

  const getPoPopoverPosition = (triggerRect, menuHeight = 96) => {
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - triggerRect.bottom;
    const spaceAbove = triggerRect.top;
    const shouldOpenAbove =
      spaceBelow < menuHeight + 12 && spaceAbove > spaceBelow;

  return {
    top: shouldOpenAbove ? triggerRect.top - 8 : triggerRect.bottom + 8,
    left: triggerRect.left,
    placement: shouldOpenAbove ? "top" : "bottom",
  };
};

const poReferenceTableFrameStyle = {
  border: "none",
  borderRadius: "0",
  overflow: "hidden",
  width: "100%",
};

const poReferenceTableScrollerStyle = {
  overflowX: "hidden",
  width: "100%",
};

const poReferenceTableInnerStyle = (minWidth = "100%") => ({
  minWidth,
  width: "100%",
  display: "flex",
  flexDirection: "column",
});

const poReferenceTableHeaderRowStyle = (gridTemplateColumns) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "0",
  padding: "0 16px",
  height: "49px",
  alignItems: "center",
  background: "var(--neutral-surface-primary)",
  borderBottom: "1px solid var(--neutral-line-separator-1)",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
});

const poReferenceTableRowStyle = (
  gridTemplateColumns,
  isLast = false,
  overrides = {}
) => ({
  display: "grid",
  gridTemplateColumns,
  gap: "0",
  padding: "0 16px",
  minHeight: "64px",
  alignItems: "center",
  borderBottom: isLast ? "none" : "1px solid var(--neutral-line-separator-1)",
  background: "var(--neutral-surface-primary)",
  ...overrides,
});

const poReferenceTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  ...overrides,
});

const poReferenceTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const poReferenceTableEmptyStateStyle = {
  padding: "32px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
  background: "var(--neutral-surface-primary)",
};

const [isUploadProofModalOpen, setIsUploadProofModalOpen] = useState(false);
  const [selectedVendorForProof, setSelectedVendorForProof] = useState(null);
  const [proofDate, setProofDate] = useState("");
  const [proofDocuments, setProofDocuments] = useState([]);
  const [proofUploadError, setProofUploadError] = useState("");
  const [proofDescriptionErrors, setProofDescriptionErrors] = useState({});
  const [proofAmount, setProofAmount] = useState("");
  const [proofNote, setProofNote] = useState("");

  const [woStatus, setWoStatus] = useState(
    initialData?.statusKey || "not_started"
  );
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [readyStartDate, setReadyStartDate] = useState("");
  const [readyEndDate, setReadyEndDate] = useState("");

  useEffect(() => {
    if (showSuccessToast) {
      const timer = setTimeout(() => {
        setShowSuccessToast(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessToast]);

  const [vendors, setVendors] = useState(() => {
    const initList = initialData?.vendors || [];
    return initList.map((v) => ({
      ...v,
      receivedOutput:
        v.status === "Completed" || v.status === "Received"
          ? parseInt(v.output, 10)
          : v.receivedOutput || 0,
      status: v.status === "Waiting" ? "Not Started" : resolveVendorProgressStatus(v),
      receipts: (
        v.receipts ||
        (v.attachment
          ? [
            {
              amount: v.receivedOutput || parseInt(v.output, 10),
              date: v.receivedDate,
              attachment: v.attachment,
            },
          ]
          : [])
      ).map((receipt, index) => ({
        ...receipt,
        attachments: normalizeProofDocuments(
          receipt.attachments || receipt.proofDocuments,
          receipt.attachment
        ),
        attachment:
          receipt.attachment ||
          normalizeProofDocuments(
            receipt.attachments || receipt.proofDocuments,
            receipt.attachment
          )[0]?.name ||
          "",
        id: receipt.id || `vendor-receipt-${v.id}-${index}`,
      })),
    }));
  });

  const [routingStages, setRoutingStages] = useState(
    initialData?.routingStages || [
      {
        step: 1,
        route: "Production Stage Firstahnders and Quality Control",
        op: "Cutting and Everything Else That Follows",
        prog: 0,
        comp: 0,
      },
      { step: 2, route: "Production Logistics", op: "Advanced Assembly", prog: 0, comp: 0 },
      { step: 3, route: "Cat / Finishing", op: "Premium Painting", prog: 0, comp: 0 },
      { step: 4, route: "Cat / Finishing", op: "High Gloss Polishing", prog: 0, comp: 0 },
      { step: 5, route: "Production Shipping", op: "Final Packing", prog: 0, comp: 0 },
    ]
  );
  const [routingUpdates, setRoutingUpdates] = useState(
    initialData?.routingUpdates || []
  );
  const [isRoutingUpdatesExpanded, setIsRoutingUpdatesExpanded] = useState(false);

  useEffect(() => {
    const currentTotalVendorReceived = vendors
      .filter((v) => v.name !== "Internal")
      .reduce((acc, v) => acc + (parseInt(v.receivedOutput, 10) || 0), 0);

    const hasStages = routingStages.length > 0;
    const allStagesCompleted =
      hasStages &&
      routingStages.every((stage) => {
        const isHybridStage = outsourceSteps.includes(stage.step);
        const vendorCompleted = isHybridStage ? currentTotalVendorReceived : 0;
        return (stage.comp || 0) + vendorCompleted >= TOTAL_QTY;
      });

    if (allStagesCompleted && woStatus !== "completed") {
      setWoStatus("completed");
    }
  }, [routingStages, outsourceSteps, vendors, TOTAL_QTY, woStatus]);

  const internalVendor = vendors.find((v) => v.name === "Internal");
  const internalOut = parseInt(internalVendor?.output || 0, 10) || 0;

  const totalVendorOutput = vendors.reduce(
    (sum, v) => sum + (parseInt(v.output, 10) || 0),
    0
  );
  const externalOut = totalVendorOutput - internalOut;

  const isVendorsValid = vendors.every(
    (v) =>
      v.name &&
      v.name.trim() !== "" &&
      v.output !== "" &&
      v.date &&
      v.date.trim() !== ""
  );

  const totalVendorReceived = vendors
    .filter((v) => v.name !== "Internal")
    .reduce((acc, v) => acc + (parseInt(v.receivedOutput, 10) || 0), 0);

  const internalStatusInfo = (() => {
    if (internalOut === 0)
      return { text: "Not Started", variant: "grey-light" };
    const maxStep = outsourceSteps.length > 0 ? Math.max(...outsourceSteps) : 0;
    const lastStage = routingStages.find((r) => r.step === maxStep);
    const internalReceived =
      parseInt(internalVendor?.receivedOutput || 0, 10) || 0;

    if (internalReceived >= internalOut && internalOut > 0)
      return { text: "Completed", variant: "green-light" };

    const hasProgress = outsourceSteps.some((step) => {
      const r = routingStages.find((x) => x.step === step);
      return r && ((r.prog || 0) > 0 || (r.comp || 0) > 0);
    });

    if (hasProgress || internalReceived > 0)
      return { text: "In Progress", variant: "yellow-light" };

    return { text: "Not Started", variant: "grey-light" };
  })();

  const stagesWithTotals = routingStages.map((row) => {
    const isHybrid = outsourceSteps.includes(row.step);
    const vendorComp = isHybrid ? totalVendorReceived : 0;
    return {
      ...row,
      vendorComp,
      totalComp: (row.comp || 0) + vendorComp,
    };
  });

  let firstOutsourceStart = 0;
  let isFirstOutsourceCompleted = false;
  if (outsourceSteps.length > 0) {
    const minStep = Math.min(...outsourceSteps);
    const rowIndex = stagesWithTotals.findIndex((r) => r.step === minStep);
    if (rowIndex !== -1) {
      const row = stagesWithTotals[rowIndex];
      const stepTotalPool =
        row.step === 1
          ? TOTAL_QTY
          : stagesWithTotals[rowIndex - 1]?.totalComp || 0;
      firstOutsourceStart = Math.max(
        0,
        stepTotalPool - (row.prog || 0) - (row.totalComp || 0)
      );

      if ((row.totalComp || 0) >= TOTAL_QTY) {
        isFirstOutsourceCompleted = true;
      }
    }
  }

  const handleOutsourceToggle = (step) => {
    if (outsourceSteps.includes(step)) {
      setOutsourceSteps(outsourceSteps.filter((s) => s !== step));
    } else {
      setOutsourceSteps([...outsourceSteps, step]);
    }
  };

  const handleOpenAddVendor = () => {
    setSingleVendorForm({
      id: null,
      name: "",
      output: "",
      date: "",
      poNumber: "",
    });
    setAssignedOutputError("");
    setIsSingleVendorModalOpen(true);
  };

  const handleEditVendor = (vendor) => {
    setSingleVendorForm({
      ...vendor,
      poNumber: vendor.poNumber || "",
      lockedVendorName: true,
    });
    setAssignedOutputError("");
    setIsSingleVendorModalOpen(true);
  };

  const promptRemoveVendor = (vendor) => {
    setVendorToRemove(vendor);
    setIsConfirmRemoveModalOpen(true);
  };

  const executeRemoveVendor = () => {
    if (vendorToRemove) {
      setVendors(vendors.filter((v) => v.id !== vendorToRemove.id));
      setToastMessage("Vendor successfully removed");
      setShowSuccessToast(true);
    }
    setIsConfirmRemoveModalOpen(false);
    setVendorToRemove(null);
  };

  const handleSaveSingleVendor = () => {
    setAssignedOutputError("");
    if (editingInternalVendor) {
      const proposedOutput = parseInt(singleVendorForm.output, 10) || 0;
      if (proposedOutput < editingInternalMinimumOutput) {
        setAssignedOutputError(internalAssignedOutputErrorMessage);
        return;
      }
    }

    const fallbackVendorDate =
      singleVendorForm.date || expectedDeliveryDate || WORK_ORDER_END_DATE;
    const normalizedForm = { ...singleVendorForm, date: fallbackVendorDate };

    let finalVendors;
    if (normalizedForm.id) {
      finalVendors = vendors.map((v) => {
        if (v.id === normalizedForm.id) {
          const updatedVendor = {
            ...v,
            ...normalizedForm,
            status: resolveVendorProgressStatus({ ...v, ...normalizedForm }),
          };

          // Link logic: update PO line qty if PO exists
          if (updatedVendor.poNumber && updatedVendor.poDetailData) {
            const nextOutput = parseInt(updatedVendor.output, 10) || 0;
            const updatedPo = { ...updatedVendor.poDetailData };
            if (updatedPo.formData && updatedPo.formData.lines) {
              updatedPo.formData.lines = updatedPo.formData.lines.map((line) => {
                if (line.type === "wo" || line.woRef === initialData?.wo) {
                  return { ...line, qty: nextOutput };
                }
                return line;
              });

              // Recalculate PO total amount
              const lineTotal = updatedPo.formData.lines.reduce(
                (sum, line) => sum + (line.qty * line.price),
                0
              );
              const feeTotal = (updatedPo.formData.feeLines || []).reduce(
                (sum, fee) => sum + (parseInt(fee.amount, 10) || 0),
                0
              );
              const subtotal = lineTotal + feeTotal;
              const taxAmount = subtotal * (updatedPo.formData.tax / 100);
              updatedPo.amount = formatCurrency(subtotal + taxAmount);
              updatedVendor.poDetailData = updatedPo;
            }
          }
          return updatedVendor;
        }
        return v;
      });
    } else {
      finalVendors = [
        ...vendors,
        {
          ...normalizedForm,
          id: Date.now() + Math.random(),
          status:
            normalizedForm.name === "Internal" ? "Not Started" : "Not Started",
          receivedOutput: 0,
          isPoApproved: false,
          receipts: [],
        },
      ].map((vendor) =>
        vendor.name === "Internal"
          ? vendor
          : { ...vendor, status: resolveVendorProgressStatus(vendor) }
      );
    }

    setVendors(finalVendors);
    setIsSingleVendorModalOpen(false);
    setToastMessage("Vendor assignment successfully saved");
    setShowSuccessToast(true);
  };

  const handleOpenPoAction = (vendor) => {
    setSelectedVendorForPoAction(vendor);
    setSelectedExistingPoNumber("");
    setOpenVendorMenuId(null);
    setOpenPoPopoverVendorId(
      openPoPopoverVendorId === vendor.id ? null : vendor.id
    );
  };

  const formatRoutingStageOperationName = (step) => {
    const matchedStage = routingStages.find(
      (stage) => Number(stage.step) === Number(step)
    );
    return matchedStage?.op || matchedStage?.operation || `routing step ${step}`;
  };

  const buildOutsourceStageDescription = (steps = []) => {
    const normalizedSteps = Array.from(
      new Set(
        (steps || [])
          .map((step) => Number(step))
          .filter((step) => Number.isFinite(step))
      )
    ).sort((a, b) => a - b);

    if (normalizedSteps.length === 0) return "";
    const stageLabels = normalizedSteps.map((step) => {
      return formatRoutingStageOperationName(step);
    });
    return ` including ${stageLabels.join(", ")}`;
  };

  const buildDummyPoDetailData = (poNumber, vendor) => {
    const linkedPoDetail = vendor?.poDetailData || null;
    const basePo =
      linkedPoDetail ||
      MOCK_PO_TABLE_DATA.find((po) => po.poNumber === poNumber) || {
        poNumber,
        vendorName: vendor?.name || "Vendor",
        amount: formatCurrency(
          (parseInt(vendor?.output || 0, 10) || 0) * 250000
        ),
        createdDate: "2026-03-31",
        status: "Draft",
        statusKey: "draft",
        sBadge: "grey-light",
      };

    const vendorDetails = MOCK_VENDORS.find(
      (v) => v.name === (vendor?.name || basePo.vendorName)
    );
    const vendorOutput = parseInt(vendor?.output || 0, 10) || 0;
    const vendorReceivedOutput = Math.min(
      parseInt(vendor?.receivedOutput || 0, 10) || 0,
      vendorOutput || Number.MAX_SAFE_INTEGER
    );
    const isVendorReceiptCompleted =
      vendorOutput > 0 && vendorReceivedOutput >= vendorOutput;
    const resolvedStatus =
      vendor?.poStatus ||
      (isVendorReceiptCompleted
        ? "Completed"
        : vendor?.isPoApproved
          ? "Issued"
          : basePo.status);
    const resolvedBadge =
      vendor?.poBadge ||
      (isVendorReceiptCompleted
        ? "green"
        : vendor?.isPoApproved
          ? "blue"
          : basePo.sBadge);
    const resolvedStatusKey =
      vendor?.poStatusKey ||
      (isVendorReceiptCompleted
        ? "completed"
        : vendor?.isPoApproved
          ? "issued"
          : basePo.statusKey);
    const lineDescription = `Generated from ${initialData?.wo || "work order"
      }${buildOutsourceStageDescription(outsourceSteps)}`;
    const receiptLogs = (vendor?.receipts || []).map((receipt, index) => ({
      id: `receipt-log-${poNumber}-${index}`,
      receiptNumber:
        receipt.receiptNumber || `RCPT-${String(index + 1).padStart(4, "0")}`,
      date: receipt.date || "-",
      time: receipt.time || "10:24",
      receivedBy: receipt.receivedBy || "Natasha Smith",
      proofDocuments: normalizeProofDocuments(
        receipt.attachments || receipt.proofDocuments,
        receipt.attachment
      ),
      notes: receipt.note || "-",
      items: [
        {
          id: `line-${poNumber}`,
          item: initialData?.product || "Cabinet Premium",
          code: initialData?.sku || "CAB-PR-9921",
          receivedNow: Number(receipt.amount) || 0,
        },
      ],
    }));
    const baseFormData = linkedPoDetail?.formData || basePo.formData || {};
    const resolvedVendorDetails = {
      phone:
        baseFormData.vendorDetails?.phone ||
        vendorDetails?.phone ||
        "08123456789",
      email:
        baseFormData.vendorDetails?.email ||
        vendorDetails?.email ||
        "vendor@email.com",
      address:
        baseFormData.vendorDetails?.address ||
        vendorDetails?.address ||
        "Vendor address",
    };
    const resolvedShipTo = {
      name: baseFormData.shipTo?.name || MOCK_COMPANY.name,
      phone: baseFormData.shipTo?.phone || MOCK_COMPANY.phone,
      email: baseFormData.shipTo?.email || MOCK_COMPANY.email,
      address: baseFormData.shipTo?.address || MOCK_COMPANY.address,
    };
    const resolvedLines =
      baseFormData.lines && baseFormData.lines.length > 0
        ? baseFormData.lines
        : [
            {
              id: `line-${poNumber}`,
              type: "wo",
              item: initialData?.product || "Cabinet Premium",
              code: initialData?.sku || "CAB-PR-9921",
              desc: lineDescription,
              woRef: initialData?.wo || "-",
              qty: vendorOutput || 1,
              receivedQty: vendorReceivedOutput,
              price: 250000,
              sourceWorkOrderLineId: `generated-work-order-line-${poNumber}`,
            },
          ];
    const resolvedFeeLines =
      baseFormData.feeLines && baseFormData.feeLines.length > 0
        ? baseFormData.feeLines
        : [{ id: "fee-1", name: "Delivery Fee", amount: 150000 }];
    const resolvedReceiptLogs =
      baseFormData.receiptLogs && baseFormData.receiptLogs.length > 0
        ? baseFormData.receiptLogs
        : receiptLogs;

    return {
      ...basePo,
      status: resolvedStatus,
      sBadge: resolvedBadge,
      statusKey: resolvedStatusKey,
      formData: {
        ...baseFormData,
        vendorName: baseFormData.vendorName || vendor?.name || basePo.vendorName,
        vendorDetails: resolvedVendorDetails,
        poDate: baseFormData.poDate || basePo.createdDate || "2026-03-31",
        deliveryDate: baseFormData.deliveryDate || vendor?.date || "2026-04-10",
        currency: baseFormData.currency || "IDR",
        createdBy: baseFormData.createdBy || basePo.createdBy || "Joko",
        lines: resolvedLines,
        receiptLogs: resolvedReceiptLogs,
        tax: baseFormData.tax ?? 11,
        feeLines: resolvedFeeLines,
        notes:
          baseFormData.notes ||
          "Dummy PO detail generated from outsource detail table click.",
        terms:
          baseFormData.terms || "Payment within 30 days from invoice date.",
        shipTo: resolvedShipTo,
      },
    };
  };

  const handleCreatePoFromVendor = () => {
    if (!selectedVendorForPoAction) return;

    const workOrderReturnData = {
      ...initialData,
      vendors,
      routingStages,
      outsourceSteps,
      statusKey: woStatus,
      status:
        woStatus === "not_started"
          ? "Not Started"
          : woStatus === "ready_to_process"
            ? "Ready to Process"
            : woStatus === "in_progress"
              ? "In Progress"
              : woStatus === "completed"
                ? "Completed"
                : initialData?.status,
      sBadge:
        woStatus === "not_started"
          ? "grey"
          : woStatus === "ready_to_process"
            ? "blue"
            : woStatus === "in_progress"
              ? "yellow"
              : woStatus === "completed"
                ? "green"
                : initialData?.sBadge,
      start: displayStartDate,
      end: displayEndDate,
    };

    setOpenPoPopoverVendorId(null);
    setOpenVendorMenuId(null);
    scrollToTop();
    onNavigate("create", {
      source: "work_order_vendor_assignment",
      vendorData: {
        ...selectedVendorForPoAction,
        ...(MOCK_VENDORS.find(v => v.id === selectedVendorForPoAction.id || v.name === selectedVendorForPoAction.name) || {})
      },
      assignedOutput: selectedVendorForPoAction.output,
      workOrder: {
        wo: initialData?.wo,
        product: initialData?.product,
        sku: initialData?.sku,
        image: initialData?.image || "",
      },
      poNumber: selectedVendorForPoAction.poNumber || "",
      returnTo: {
        view: "detail",
        data: workOrderReturnData,
      },
    });
  };

  const handleOpenSelectExistingPo = () => {
    setOpenPoPopoverVendorId(null);
    setSelectedExistingPoNumber("");
    setIsSelectExistingPoModalOpen(true);
  };

  const renderPoPreviewField = (label, value, fullWidth = false) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        minWidth: 0,
        gridColumn: fullWidth ? "1 / -1" : "auto",
      }}
    >
      <span
        style={{
          fontSize: "var(--text-desc)",
          color: "var(--neutral-on-surface-tertiary)",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: "var(--text-title-3)",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--neutral-on-surface-primary)",
          wordBreak: "break-word",
          whiteSpace: "pre-line",
          overflowWrap: "anywhere",
        }}
      >
        {value === null || value === undefined || value === "" ? "-" : value}
      </span>
    </div>
  );

  const renderPoPreviewContent = (poDetail) => {
    if (!poDetail) return null;
    const formData = poDetail.formData || {};
    const lines = formData.lines || [];
    const feeLines = formData.feeLines || [];
    const currency = formData.currency || "IDR";
    const subtotal = lines.reduce((sum, line) => {
      const qty = parseFloat(line.qty) || 0;
      const price = parseFloat(line.price) || 0;
      return sum + qty * price;
    }, 0);
    const feeTotal = feeLines.reduce((sum, fee) => {
      return sum + (parseFloat(fee.amount) || 0);
    }, 0);
    const taxRate = Number(formData.tax) || 0;
    const taxAmount = (subtotal * taxRate) / 100;
    const total = subtotal + feeTotal + taxAmount;

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "4px",
              minWidth: 0,
            }}
          >
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
                wordBreak: "break-word",
              }}
            >
              {poDetail.poNumber}
            </span>
            <span
              style={{
                fontSize: "var(--text-body)",
                color: "var(--neutral-on-surface-tertiary)",
              }}
            >
              {poDetail.vendorName}
            </span>
          </div>
          <StatusBadge variant={poDetail.sBadge}>{poDetail.status}</StatusBadge>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Purchase Order Information
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField(
              "PO Date",
              formData.poDate || poDetail.createdDate || "-"
            )}
            {renderPoPreviewField("Expected Delivery Date", formData.deliveryDate || "-")}
            {renderPoPreviewField("Currency", formData.currency || "IDR")}
            {renderPoPreviewField("Created By", formData.createdBy || "Joko")}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Vendor Information
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField("Vendor Name", formData.vendorName || poDetail.vendorName)}
            {renderPoPreviewField("Phone Number", formData.vendorDetails?.phone || "-")}
            {renderPoPreviewField(
              "Email address",
              formData.vendorDetails?.email || "-",
              true
            )}
            {renderPoPreviewField(
              "Address",
              formData.vendorDetails?.address || "-",
              true
            )}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Ship To
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField("Recipient Name", formData.shipTo?.name || "-")}
            {renderPoPreviewField("Phone Number", formData.shipTo?.phone || "-")}
            {renderPoPreviewField("Email", formData.shipTo?.email || "-")}
            {renderPoPreviewField("Address", formData.shipTo?.address || "-", true)}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Purchase Order Lines
          </span>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {lines.map((line, idx) => {
              const lineSubtotal =
                (parseFloat(line.qty) || 0) * (parseFloat(line.price) || 0);
              const quantityLabel =
                line.type === "material" && line.uom
                  ? `${Number(line.qty) || 0} ${line.uom}`
                  : `${Number(line.qty) || 0} pcs`;

              return (
                <div
                  key={line.id || idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "14px",
                    padding: "14px",
                    borderRadius: "12px",
                    border: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                    minWidth: 0,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                        minWidth: 0,
                      }}
                    >
                      <span
                        style={{
                          fontSize: "var(--text-title-3)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                          wordBreak: "break-word",
                        }}
                      >
                        {line.item || "-"}
                      </span>
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--neutral-on-surface-tertiary)",
                          wordBreak: "break-word",
                        }}
                      >
                        {line.code || "-"}
                      </span>
                    </div>
                    <StatusBadge
                      variant={
                        line.type === "wo"
                          ? "blue-light"
                          : line.type === "material"
                            ? "yellow-light"
                            : "grey-light"
                      }
                    >
                      {line.type === "wo"
                        ? "WO"
                        : line.type === "material"
                          ? "Material"
                          : "Manual"}
                    </StatusBadge>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "16px",
                    }}
                  >
                    {renderPoPreviewField("Description", line.desc || "-", true)}
                    {renderPoPreviewField("WO Ref", line.woRef || "-")}
                    {renderPoPreviewField("Quantity", quantityLabel)}
                    {renderPoPreviewField(
                      "Unit Price",
                      formatCurrency(line.price || 0, currency)
                    )}
                    {renderPoPreviewField(
                      "Subtotal",
                      formatCurrency(lineSubtotal, currency)
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Summary
          </span>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                Subtotal
              </span>
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                {formatCurrency(subtotal, currency)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                Tax ({taxRate}%)
              </span>
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                {formatCurrency(taxAmount, currency)}
              </span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span style={{ color: "var(--neutral-on-surface-secondary)" }}>
                Fees
              </span>
              <span style={{ fontWeight: "var(--font-weight-bold)" }}>
                {formatCurrency(feeTotal, currency)}
              </span>
            </div>
            <div
              style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }}
            />
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                gap: "12px",
                fontSize: "var(--text-title-1)",
                fontWeight: "var(--font-weight-black)",
              }}
            >
              <span>Total</span>
              <span>{formatCurrency(total, currency)}</span>
            </div>
          </div>
        </div>

        <div
          style={{
            background: "var(--neutral-surface-primary)",
            padding: "16px",
            borderRadius: "12px",
            border: "1px solid var(--neutral-line-separator-1)",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <span
            style={{
              fontSize: "var(--text-body)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            Notes & Terms
          </span>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
              gap: "16px",
            }}
          >
            {renderPoPreviewField("Notes", formData.notes || "-", true)}
            {renderPoPreviewField("Terms", formData.terms || "-", true)}
          </div>
        </div>
      </div>
    );
  };

  const selectedPoDetail = selectedExistingPoNumber
    ? buildDummyPoDetailData(
        selectedExistingPoNumber,
        selectedVendorForPoAction || {}
      )
    : null;

  const handleAttachExistingPo = () => {
    if (!selectedVendorForPoAction || !selectedExistingPoNumber) return;
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id !== selectedVendorForPoAction.id) return v;
        const selectedPo = MOCK_PO_TABLE_DATA.find(
          (po) => po.poNumber === selectedExistingPoNumber
        );
        const poDetailData = buildPoLinkSnapshot(
          buildDummyPoDetailData(selectedExistingPoNumber, {
            ...v,
            poNumber: selectedExistingPoNumber,
          })
        );
        const nextVendor = {
          ...v,
          poNumber: selectedExistingPoNumber,
          isPoApproved:
            selectedPo?.statusKey === "issued" ||
            selectedPo?.statusKey === "completed",
          poStatus: poDetailData.status,
          poBadge: poDetailData.sBadge,
          poStatusKey: poDetailData.statusKey,
          poDetailData,
        };
        return {
          ...nextVendor,
          status: resolveVendorProgressStatus(nextVendor),
        };
      })
    );
    setIsSelectExistingPoModalOpen(false);
    setSelectedVendorForPoAction(null);
    setSelectedExistingPoNumber("");
    setToastMessage("Purchase order successfully assigned");
    setShowSuccessToast(true);
  };

  const handleSaveNewPo = () => {
    const generatedPo = `PO-202603-${Math.floor(1000 + Math.random() * 9000)}`;

    const newVendorAssignment = {
      ...singleVendorForm,
      id: Date.now() + Math.random(),
      poNumber: generatedPo,
      status: "Not Started",
      receivedOutput: 0,
      isPoApproved: false,
      receipts: [],
    };

    let updatedVendors = vendors.filter((v) => v.id !== singleVendorForm.id);
    updatedVendors.push(newVendorAssignment);

    const newInternal = updatedVendors.find((v) => v.name === "Internal");
    const newInternalOut = parseInt(newInternal?.output || 0, 10) || 0;
    const maxStep = outsourceSteps.length > 0 ? Math.max(...outsourceSteps) : 0;
    const lastStage = routingStages.find((r) => r.step === maxStep);

    setVendors(
      updatedVendors.map((v) => {
        if (v.name === "Internal") {
          if (
            newInternalOut > 0 &&
            lastStage &&
            (lastStage.comp || 0) >= newInternalOut
          ) {
            return {
              ...v,
              receivedDate:
                v.receivedDate || new Date().toISOString().split("T")[0],
            };
          } else {
            return { ...v, receivedDate: "" };
          }
        }
        return v;
      })
    );

    setIsCreatePoModalOpen(false);
    setToastMessage(
      "Purchase order successfully created"
    );
    setShowSuccessToast(true);
  };

  const handleVendorProofFilesSelected = (files) => {
    const incomingFiles = Array.from(files || []);
    if (incomingFiles.length === 0) return;

    let nextError = "";
    setProofDocuments((prev) => {
      const nextDocuments = [...prev];
      incomingFiles.forEach((file) => {
        if (nextDocuments.length >= MAX_PROOF_UPLOAD_FILES) {
          nextError = "Max 3 files, 25MB each";
          return;
        }
        const validationMessage = validateUploadFile(file);
        if (validationMessage) {
          nextError = validationMessage;
          return;
        }
        nextDocuments.push(
          createUploadDocumentRecord(file, { description: "" })
        );
      });
      return nextDocuments;
    });
    setProofDescriptionErrors({});
    setProofUploadError(nextError);
  };

  const updateVendorProofDescription = (docId, value) => {
    setProofDocuments((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, description: value } : doc
      )
    );
    setProofUploadError("");
    setProofDescriptionErrors((prev) => ({ ...prev, [docId]: "" }));
  };

  const removeVendorProofDocument = (docId) => {
    setProofDocuments((prev) => prev.filter((doc) => doc.id !== docId));
    setProofDescriptionErrors((prev) => {
      const next = { ...prev };
      delete next[docId];
      return next;
    });
    setProofUploadError("");
  };

  const handleReceiveVendor = () => {
    const normalizedProofDocuments = proofDocuments.map((doc) => ({
      ...doc,
      description: (doc.description || "").trim(),
    }));
    const nextDescriptionErrors = {};

    if (!isInternalProof) {
      if (normalizedProofDocuments.length === 0) {
        setProofUploadError("Upload at least one proof document");
        return;
      }

      normalizedProofDocuments.forEach((doc) => {
        if (!doc.description)
          nextDescriptionErrors[doc.id] = "Description is required";
      });

      if (Object.keys(nextDescriptionErrors).length > 0) {
        setProofDescriptionErrors(nextDescriptionErrors);
        setProofUploadError("Add description for each proof document");
        return;
      }
    }

    setVendors(
      vendors.map((v) => {
        if (v.id === selectedVendorForProof) {
          const addedAmount = parseInt(proofAmount, 10) || 0;
          const newReceipt = {
            amount: addedAmount,
            date: proofDate,
            attachment:
              normalizedProofDocuments[0]?.name || "No Document Provided",
            attachments: normalizedProofDocuments,
            note: proofNote || "-",
          };
          const updatedReceipts = [...(v.receipts || []), newReceipt];
          const newTotalReceived = updatedReceipts.reduce(
            (sum, r) => sum + r.amount,
            0
          );
          const targetOutput = parseInt(v.output, 10) || 0;
          const isFullyReceived =
            newTotalReceived >= targetOutput && targetOutput > 0;
          const newStatus = isFullyReceived
            ? "Completed"
            : "Partially Received";

          return {
            ...v,
            receivedOutput: newTotalReceived,
            status: newStatus,
            receipts: updatedReceipts,
            receivedDate: isFullyReceived ? proofDate : "",
          };
        }
        return v;
      })
    );
    setIsUploadProofModalOpen(false);
    setProofDocuments([]);
    setProofUploadError("");
    setProofDescriptionErrors({});
    setProofAmount("");
    setProofDate("");
    setProofNote("");
    setToastMessage("Vendor output successfully received");
    setShowSuccessToast(true);
  };

  useEffect(() => {
    const internal = vendors.find((v) => v.name === "Internal");
    if (!internal || internalOut === 0 || outsourceSteps.length === 0) return;

    const maxStep = Math.max(...outsourceSteps);
    const lastStage = routingStages.find((r) => r.step === maxStep);
    const completedAtLastStage = parseInt(lastStage?.comp || 0, 10) || 0;
    const targetReceived = Math.min(internalOut, completedAtLastStage);
    const currentReceived = parseInt(internal.receivedOutput || 0, 10) || 0;

    if (targetReceived <= currentReceived) return;

    const delta = targetReceived - currentReceived;
    const today = new Date().toISOString().split("T")[0];

    setVendors((prev) =>
      prev.map((v) => {
        if (v.name !== "Internal") return v;
        const assignedOutput = parseInt(v.output, 10) || 0;
        const isFullyReceived =
          targetReceived >= assignedOutput && assignedOutput > 0;
        return {
          ...v,
          receivedOutput: targetReceived,
          receivedDate: isFullyReceived ? today : "",
          status: isFullyReceived ? "Completed" : "Partially Received",
          receipts: [
            ...(v.receipts || []),
            {
              amount: delta,
              date: today,
              attachment: "Internal routing completion",
              note: "Work Order-recorded from internal routing completion.",
            },
          ],
        };
      })
    );
  }, [routingStages, outsourceSteps, internalOut]);

  const renderAllocationBar = (currentTotalOutput, variant = "full") => {
    const percentage = Math.min((currentTotalOutput / TOTAL_QTY) * 100, 100);
    const isExceeded = currentTotalOutput > TOTAL_QTY;
    const isFull = currentTotalOutput === TOTAL_QTY;
    const color = isExceeded
      ? "var(--status-red-primary)"
      : isFull
        ? "var(--status-green-primary)"
        : "var(--feature-brand-primary)";

    if (variant === "mini") {
      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "6px",
            width: "260px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: "var(--text-body)",
            }}
          >
            <span
              style={{
                color: isExceeded
                  ? "var(--status-red-primary)"
                  : "var(--neutral-on-surface-secondary)",
              }}
            >
              {isExceeded ? "Exceeds req. qty" : "Total Assigned Output"}
            </span>
            <span
              style={{
                fontWeight: "var(--font-weight-bold)",
                color: isExceeded
                  ? "var(--status-red-primary)"
                  : "var(--neutral-on-surface-primary)",
              }}
            >
              {currentTotalOutput} / {TOTAL_QTY} pcs
            </span>
          </div>
          <div
            style={{
              height: "6px",
              background: "var(--neutral-line-separator-2)",
              borderRadius: "3px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${percentage}%`,
                background: color,
                transition: "all 0.3s ease",
              }}
            />
          </div>
        </div>
      );
    }
    return null;
  };

  const selectedVendorObj = vendors.find(
    (v) => v.id === selectedVendorForProof
  );
  const isInternalProof = selectedVendorObj?.name === "Internal";
  const selectedVendorDetails =
    MOCK_VENDORS.find((v) => v.name === singleVendorForm.name) || {};
  const vendorNameOptions = (() => {
    const baseNames = ["Internal", ...MOCK_VENDORS.map((vendor) => vendor.name)];
    const uniqueNames = Array.from(
      new Set(baseNames.filter((name) => !!name && String(name).trim() !== ""))
    );

    return uniqueNames
      .filter((name) => {
        if (name === singleVendorForm.name) return true;
        return !vendors.some(
          (vendor) =>
            vendor.name === name &&
            vendor.id !== singleVendorForm.id &&
            !vendor.isPoApproved
        );
      })
      .map((name) => ({ value: name, label: name }));
  })();
  const editingInternalVendor =
    !!singleVendorForm.id && singleVendorForm.name === "Internal";
  const editingInternalReceivedOutput = editingInternalVendor
    ? vendors.find((v) => v.id === singleVendorForm.id)?.receivedOutput || 0
    : 0;
  const editingInternalProcessedOutput = editingInternalVendor
    ? routingStages
      .filter((s) => outsourceSteps.includes(s.step))
      .reduce((maxProcessed, stage) => {
        const processedCount =
          (parseInt(stage.prog || 0, 10) || 0) +
          (parseInt(stage.comp || 0, 10) || 0);
        return Math.max(maxProcessed, processedCount);
      }, 0)
    : 0;
  const editingInternalMinimumOutput = Math.max(
    editingInternalReceivedOutput,
    editingInternalProcessedOutput
  );
  const internalAssignedOutputErrorMessage = `Minimum is ${editingInternalMinimumOutput} pcs due to existing progress.`;
  const selectedStageData = selectedStage
    ? stagesWithTotals.find(
      (stage) => Number(stage.step) === Number(selectedStage.step)
    ) || selectedStage
    : null;
  const isSelectedStageOutsourced =
    !!selectedStageData && outsourceSteps.includes(selectedStageData.step);
  const selectedStageIndex = selectedStageData
    ? stagesWithTotals.findIndex(
      (stage) => Number(stage.step) === Number(selectedStageData.step)
    )
    : -1;
  const selectedStageAvailablePool =
    selectedStageIndex === -1
      ? 0
      : selectedStageIndex === 0
        ? TOTAL_QTY
        : stagesWithTotals[selectedStageIndex - 1]?.totalComp || 0;
  const selectedStageVendorCompleted = selectedStageData?.vendorComp || 0;
  const selectedStageYetToStart = Math.max(
    0,
    selectedStageAvailablePool -
    (stageProg || 0) -
    ((stageComp || 0) + selectedStageVendorCompleted)
  );
  const internalProgressCapacity = Math.max(0, stageTotalPool - stageComp);
  const internalCompletionCapacity = Math.max(0, stageTotalPool);
  const stepperActionButtonBaseStyle = {
    width: "50px",
    height: "50px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    boxSizing: "border-box",
  };
  const getVendorStatusMeta = (vendor) => {
    if (vendor?.name === "Internal") {
      return {
        text: internalStatusInfo.text,
        variant: internalStatusInfo.variant,
      };
    }

    const resolvedVendorStatus = resolveVendorProgressStatus(vendor);
    return {
      text: resolvedVendorStatus,
      variant:
        resolvedVendorStatus === "Completed"
          ? "green-light"
          : resolvedVendorStatus === "Partially Received"
            ? "blue-light"
            : resolvedVendorStatus === "In Progress"
               ? "yellow-light"
               : "grey-light",
    };
  };
  const poOptions =
    singleVendorForm.name && singleVendorForm.name !== "Internal"
      ? MOCK_PO_TABLE_DATA.filter(
          (po) =>
            po.vendorName === singleVendorForm.name &&
            (po.statusKey === "draft" || po.statusKey === "need_revision")
        ).map((po) => ({ value: po.poNumber, label: po.poNumber }))
      : [];

  const selectedVendorPoDetail = singleVendorForm.poNumber
    ? buildDummyPoDetailData(singleVendorForm.poNumber, singleVendorForm)
    : null;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        position: "relative",
      }}
    >
      {showSuccessToast ? (
        <div
          style={{
            position: "fixed",
            top: "84px",
            right: "24px",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            minWidth: "350px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--text-title-3)" }}>
            {toastMessage}
          </span>
          <span
            style={{
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
            onClick={() => setShowSuccessToast(false)}
          >
            Okay
          </span>
        </div>
      ) : null}

      <div
        style={{
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: woStatus === "not_started" ? "100px" : "24px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "8px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                cursor: "pointer",
                marginLeft: "-4px",
              }}
              onClick={() => {
                if (initialData?.returnTo) {
                  onNavigate(
                    `purchase_order_${initialData.returnTo.view}`,
                    initialData.returnTo.data
                  );
                } else {
                  onNavigate("list");
                }
              }}
            >
              <ChevronLeftIcon
                size={28}
                color="var(--neutral-on-surface-primary)"
              />
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--text-large-title)",
                  fontWeight: "var(--font-weight-bold)",
                }}
              >
                Work Order Detail
              </h1>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "var(--text-title-3)",
              }}
            >
              <span
                style={{
                  color: "var(--neutral-on-surface-secondary)",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (initialData?.returnTo) {
                    onNavigate(
                      `purchase_order_${initialData.returnTo.view}`,
                      initialData.returnTo.data
                    );
                  } else {
                    onNavigate("list");
                  }
                }}
              >
                Work Order
              </span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
                /
              </span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
                Work Order Detail
              </span>
            </div>
          </div>
          <Button variant="outlined">Edit Work Order</Button>
        </div>

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              {initialData?.wo || "WO-2294824-20251109-00001"}
            </span>
            {woStatus === "not_started" ? (
              <StatusBadge variant="grey">Not Started</StatusBadge>
            ) : null}
            {woStatus === "ready_to_process" ? (
              <StatusBadge variant="blue">Ready to Process</StatusBadge>
            ) : null}
            {woStatus === "in_progress" ? (
              <StatusBadge variant="yellow">In Progress</StatusBadge>
            ) : null}
            {woStatus === "completed" ? (
              <StatusBadge variant="green">Completed</StatusBadge>
            ) : null}
          </div>
          <div
            style={{ borderTop: "1px solid var(--neutral-line-separator-1)" }}
          />
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "24px",
            }}
          >
            <LabelValue
              label="Order Number"
              value={initialData?.ord || "ORD-248824-20251109-00001"}
            />
            <LabelValue
              label="Planned Start - End Date"
              value={
                woStatus === "not_started"
                  ? "-"
                  : displayStartDate && displayEndDate
                  ? `${displayStartDate} - ${displayEndDate}`
                  : "Not Set"
              }
            />
            <LabelValue
              label="Actual Start - End Date"
              value={
                woStatus === "not_started"
                  ? "-"
                  : `${displayStartDate || "-"} - Not Defined`
              }
            />
            <LabelValue
              label="Priority"
              value={initialData?.priority || "Medium"}
              badge={{
                variant: initialData?.pBadge || "yellow-light",
                text: initialData?.priority || "Medium",
              }}
            />

            <LabelValue label="Created On" value={`2025-12-08; 15:00`} />
            <LabelValue label="Notes" value="-" />
          </div>
        </Card>

        <Card style={{ gap: "16px" }}>
          <span
            style={{
              fontSize: "var(--text-title-2)",
              fontWeight: "var(--font-weight-bold)",
            }}
          >
            Target Product
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "24px",
              padding: "20px 24px",
              borderRadius: "16px",
              border: "1px solid var(--neutral-line-separator-1)",
              background: "var(--neutral-surface-primary)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  width: "72px",
                  height: "72px",
                  borderRadius: "16px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  background: "var(--neutral-surface-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Box size={28} color="var(--neutral-on-surface-tertiary)" />
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    lineHeight: "26px",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {initialData?.product || "Wooden Chair"}
                </span>
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  SKU: {initialData?.sku || "CH-WD-23948"}
                </span>
              </div>
            </div>
            <span
              style={{
                fontSize: "var(--text-big-title)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
                whiteSpace: "nowrap",
              }}
            >
              {TOTAL_QTY} pcs
            </span>
          </div>
        </Card>

        <Card>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "8px" }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Bill of Material
                </span>
                <StatusBadge variant="blue-light">Material Request</StatusBadge>
              </div>
              <span
                style={{
                  fontSize: "var(--text-title-3)",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                {initialData?.product || "Wooden Chair"} Classic Model BOM
              </span>
            </div>
            {woStatus !== "not_started" ? (
              <Button variant="outlined" leftIcon={AddIcon}>
                Request Material
              </Button>
            ) : null}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                fontWeight: "var(--font-weight-bold)",
                fontSize: "var(--text-title-3)",
              }}
            >
              <div style={{ width: "40px" }}>No</div>
              <div style={{ flex: "1.5" }}>Material</div>
              <div style={{ flex: "1" }}>Required Qty</div>
              <div style={{ flex: "1" }}>Requested Qty</div>
              <div style={{ flex: "1" }}>Received Qty</div>
            </div>
            {[
              {
                id: 1,
                name: "Wooden Plank",
                sku: "WOD-023UDISJJDS",
                req: "50 pcs",
                reqst: "0 pcs",
                rec: "0 pcs",
              },
              {
                id: 2,
                name: "Paint",
                sku: "PAI-WIQIFQJFJSA",
                req: "5 liter",
                reqst: "0 liter",
                rec: "0 liter",
              },
              {
                id: 3,
                name: "Nail",
                sku: "NAI-9AIF0U092F",
                req: "10 box",
                reqst: "0 box",
                rec: "0 box",
              },
            ].map((row, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  padding: "16px 0",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div style={{ width: "40px" }}>{row.id}</div>
                <div
                  style={{
                    flex: "1.5",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span>{row.name}</span>
                  <span
                    style={{
                      fontSize: "var(--text-desc)",
                      color: "var(--neutral-on-surface-tertiary)",
                    }}
                  >
                    {row.sku}
                  </span>
                </div>
                <div style={{ flex: "1" }}>{row.req}</div>
                <div style={{ flex: "1" }}>{row.reqst}</div>
                <div style={{ flex: "1" }}>{row.rec}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span
              style={{
                fontSize: "var(--text-title-2)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Routing Stages
            </span>
            {woStatus === "not_started" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-small)",
                  background: "var(--feature-brand-container-darker)",
                  border: "1px solid var(--feature-brand-container-darker)",
                }}
              >
                <Info
                  size={16}
                  strokeWidth={2.1}
                  color="var(--feature-brand-primary)"
                  style={{ flexShrink: 0, marginTop: "2px" }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "20px",
                      letterSpacing: "0.0962px",
                    }}
                  >
                    You can now allow outsourcing for selected stages.
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-regular)",
                      color: "var(--neutral-on-surface-primary)",
                      lineHeight: "20px",
                      letterSpacing: "0.0962px",
                    }}
                  >
                    Each selected stage can be handled by external vendors or
                    together with your internal team.
                  </span>
                </div>

              </div>
            ) : null}

            {routingUpdates && routingUpdates.length > 0 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: routingUpdates.length === 1 ? "0" : "12px",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-small)",
                  background: "var(--feature-brand-container-darker)",
                  border: "1px solid var(--feature-brand-container-darker)",
                  marginTop: "12px",
                }}
              >
                {routingUpdates.length === 1 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Info
                      size={16}
                      strokeWidth={2.1}
                      color="var(--feature-brand-primary)"
                      style={{ flexShrink: 0 }}
                    />
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-regular)",
                        color: "var(--neutral-on-surface-primary)",
                        lineHeight: "20px",
                      }}
                    >
                      Work order was automatically updated on {routingUpdates[0].timestamp} to match receipt {routingUpdates[0].poNumber} from {routingUpdates[0].vendorName} for {routingUpdates[0].qty} pcs.
                    </span>
                  </div>
                ) : (
                  <>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <Info
                        size={16}
                        strokeWidth={2.1}
                        color="var(--feature-brand-primary)"
                        style={{ flexShrink: 0 }}
                      />
                      <span
                        style={{
                          fontSize: "var(--text-title-3)",
                          fontWeight: "var(--font-weight-bold)",
                          color: "var(--neutral-on-surface-primary)",
                          lineHeight: "20px",
                        }}
                      >
                        Routing updates ({routingUpdates.length})
                      </span>
                    </div>
                    <div 
                      style={{ 
                        display: "flex", 
                        flexDirection: "column", 
                        gap: "8px", 
                        paddingLeft: "26px",
                        maxHeight: isRoutingUpdatesExpanded ? "154px" : "none",
                        overflowY: isRoutingUpdatesExpanded ? "auto" : "visible"
                      }}
                    >
                      {(isRoutingUpdatesExpanded ? routingUpdates : routingUpdates.slice(0, 3)).map((update, idx) => (
                        <div key={idx} style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                            Auto Adjusted to {update.qty} pcs
                          </span>
                          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                            · {update.timestamp}
                          </span>
                          <span style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-secondary)" }}>
                            (Based on receipt {update.poNumber} from {update.vendorName})
                          </span>
                        </div>
                      ))}
                    </div>
                    {routingUpdates.length > 3 && (
                      <div style={{ marginLeft: "22px", marginTop: "4px" }}>
                        <Button
                          variant="tertiary"
                          size="small"
                          rightIcon={isRoutingUpdatesExpanded ? ChevronUpIcon : ChevronDownIcon}
                          onClick={() => setIsRoutingUpdatesExpanded(!isRoutingUpdatesExpanded)}
                        >
                          {isRoutingUpdatesExpanded 
                            ? "View Less" 
                            : `View All ${routingUpdates.length} Updates`}
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div
            key={`routing-table-${woStatus}`}
            style={{ display: "flex", flexDirection: "column" }}
          >
            {woStatus === "not_started" ? (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "140px 60px 1.5fr 1.5fr 1fr 1fr 1fr",
                    columnGap: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <div style={{ textAlign: "center" }}>Allow Outsourcing</div>
                  <div style={{ paddingLeft: "8px" }}>Step</div>
                  <div>Routing</div>
                  <div>Operation</div>
                  <div>Yet to Start</div>
                  <div>In Progress</div>
                  <div>Completed</div>
                </div>
                {stagesWithTotals.map((row, i) => {
                  const stepTotalPool = row.step === 1 ? TOTAL_QTY : 0;
                  const start = Math.max(
                    0,
                    stepTotalPool - (row.prog || 0) - (row.totalComp || 0)
                  );
                  const isChecked = outsourceSteps.includes(row.step);
                  let isDisabled = false;

                  if (outsourceSteps.length > 0) {
                    const min = Math.min(...outsourceSteps);
                    const max = Math.max(...outsourceSteps);

                    if (isChecked) {
                      if (row.step !== min && row.step !== max)
                        isDisabled = true;
                    } else {
                      if (row.step !== min - 1 && row.step !== max + 1)
                        isDisabled = true;
                    }
                  }

                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "140px 60px 1.5fr 1.5fr 1fr 1fr 1fr",
                        columnGap: "16px",
                        alignItems: "center",
                        padding: "16px 0",
                        borderBottom: "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                        }}
                      >
                        <Checkbox
                          checked={isChecked}
                          disabled={isDisabled}
                          onChange={() => handleOutsourceToggle(row.step)}
                        />
                      </div>
                      <div>{row.step}</div>
                      <div style={{ minWidth: 0 }}>
                        <Tooltip content={row.route} style={{ width: "100%", display: "flex", minWidth: 0 }} showOnlyIfTruncated={true}>
                          <span
                            style={{
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                            }}
                          >
                            {row.route}
                          </span>
                        </Tooltip>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Tooltip content={row.op} style={{ width: "100%", display: "flex", minWidth: 0 }} showOnlyIfTruncated={true}>
                          <span
                            style={{
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                            }}
                          >
                            {row.op}
                          </span>
                        </Tooltip>
                      </div>
                      <div>{start}</div>
                      <div>{row.prog || 0}</div>
                      <div>{row.totalComp || 0}</div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1.5fr 1.5fr 1fr 1fr 1fr 2fr",
                    columnGap: "16px",
                    paddingBottom: "12px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  <div>Step</div>
                  <div>Routing</div>
                  <div>Operation</div>
                  <div>Yet to Start</div>
                  <div>In Progress</div>
                  <div>Completed</div>
                  <div>Progress</div>
                </div>
                {stagesWithTotals.map((row, i) => {
                  const stepTotalPool =
                    row.step === 1
                      ? TOTAL_QTY
                      : stagesWithTotals[i - 1].totalComp;
                  const start = Math.max(
                    0,
                    stepTotalPool - (row.prog || 0) - (row.totalComp || 0)
                  );

                  const isHybrid = outsourceSteps.includes(row.step);
                  const progressTarget = isHybrid ? internalOut : TOTAL_QTY;

                  const internalRemaining = Math.max(
                    0,
                    progressTarget - (row.comp || 0) - (row.prog || 0)
                  );
                  const internalStart = Math.min(internalRemaining, start);

                  const progress =
                    Math.min(
                      100,
                      Math.round(((row.totalComp || 0) / TOTAL_QTY) * 100)
                    ) || 0;

                  const isUnlocked =
                    row.step === 1 ||
                    (i > 0 && (stagesWithTotals[i - 1]?.totalComp || 0) > 0);

                  const canManage = internalStart > 0 || (row.prog || 0) > 0;

                  return (
                    <div
                      key={i}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "60px 1.5fr 1.5fr 1fr 1fr 1fr 2fr",
                        columnGap: "16px",
                        alignItems: "center",
                        padding: "16px 0",
                        borderBottom: "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                        color: !isUnlocked
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--neutral-on-surface-primary)",
                      }}
                    >
                      <div>{row.step}</div>
                      <div
                        style={{
                          minWidth: 0,
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "flex-start",
                          gap: "4px",
                        }}
                      >
                        <Tooltip content={row.route} style={{ width: "100%", display: "flex", minWidth: 0 }} showOnlyIfTruncated={true}>
                          <span
                            style={{
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              lineHeight: "1.2",
                              width: "100%",
                            }}
                          >
                            {row.route}
                          </span>
                        </Tooltip>
                        {isHybrid && externalOut > 0 ? (
                          <StatusBadge
                            variant={
                              internalOut === 0 ? "orange-light" : "blue-light"
                            }
                          >
                            {internalOut === 0 ? "Outsourced" : "Hybrid"}
                          </StatusBadge>
                        ) : null}
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <Tooltip content={row.op} style={{ width: "100%", display: "flex", minWidth: 0 }} showOnlyIfTruncated={true}>
                          <span
                            style={{
                              display: "block",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              width: "100%",
                            }}
                          >
                            {row.op}
                          </span>
                        </Tooltip>
                      </div>
                      <div>{start}</div>
                      <div>{row.prog || 0}</div>
                      <div>{row.totalComp || 0}</div>
                      <div
                        style={{
                          flex: "2",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                        }}
                      >
                        <ProgressRing
                          percentage={progress}
                          color={
                            !isUnlocked
                              ? "var(--neutral-on-surface-tertiary)"
                              : "inherit"
                          }
                        />
                        {!isUnlocked ? (
                          <span
                            style={{
                              color: "var(--neutral-on-surface-tertiary)",
                              fontSize: "var(--text-body)",
                              textAlign: "right",
                              lineHeight: "1.2",
                            }}
                          >
                            Waiting for items
                          </span>
                        ) : canManage ? (
                          <Button
                            variant="outlined"
                            size="small"
                            leftIcon={EditIcon}
                            style={{ width: "100px", flexShrink: 0 }}
                            onClick={() => {
                              setSelectedStage(row);
                              setStageStart(internalStart);
                              setStageProg(row.prog || 0);
                              setStageOriginalProg(row.prog || 0);
                              setStageComp(row.comp || 0);
                              setStageOriginalComp(row.comp || 0);
                              setExpectedDeliveryDate(
                                row.expectedDeliveryDate || row.date || null
                              );
                              setStageTotalPool(
                                (row.comp || 0) +
                                (row.prog || 0) +
                                internalStart
                              );
                              setStageMaxCompletable(
                                (row.comp || 0) +
                                (row.prog || 0) +
                                internalStart
                              );
                              setStageCompInput(String(row.comp || 0));
                              setStageProgError("");
                              setStageCompError("");
                              setIsManageStageVendorSectionExpanded(true);
                              setIsManageStageModalOpen(true);
                            }}
                          >
                            Manage
                          </Button>
                        ) : (
                          <span
                            style={{
                              color: "var(--neutral-on-surface-tertiary)",
                              fontSize: "var(--text-body)",
                              textAlign: "right",
                              lineHeight: "1.2",
                            }}
                          >
                            {(row.totalComp || 0) >= TOTAL_QTY
                              ? "Completed"
                              : "Waiting for items"}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>

        {outsourceSteps.length > 0 && woStatus !== "not_started" ? (
          <Card>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div
                style={{ display: "flex", alignItems: "center", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  Outsource Detail
                </span>
              </div>
              <Button
                variant="outlined"
                size="small"
                leftIcon={AddIcon}
                onClick={handleOpenAddVendor}
                disabled={isFirstOutsourceCompleted}
              >
                Assign Vendor
              </Button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: "-4px",
              }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "4px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  Allow Outsourced Stages
                </span>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "2px",
                    fontSize: "var(--text-title-3)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  {outsourceSteps.map((stepId) => {
                    const st = routingStages.find((s) => s.step === stepId);
                    if (!st) return null;
                    return (
                      <span key={stepId}>
                        Step {st.step}: {st.route} - {st.op}
                      </span>
                    );
                  })}
                </div>
              </div>

              {renderAllocationBar(totalVendorOutput, "mini")}
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: "8px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  paddingBottom: "12px",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  fontWeight: "var(--font-weight-bold)",
                  fontSize: "var(--text-title-3)",
                }}
              >
                <div style={{ flex: "1.35" }}>Vendor Name</div>
                <div style={{ flex: "1.55" }}>Purchase Order</div>
                <div style={{ flex: "1" }}>Assigned Output</div>
                <div style={{ flex: "1" }}>Received Output</div>
                <div style={{ flex: "1.1" }}>Status</div>
                <div style={{ width: "140px" }}></div>
              </div>
              {vendors.length === 0 ? (
                <div
                  style={{
                    padding: "40px 24px",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    No vendor assigned yet
                  </span>
                  <span
                    style={{
                      color: "var(--neutral-on-surface-secondary)",
                      fontSize: "var(--text-body)",
                      width: "80vw",
                      maxWidth: "1600px",
                      lineHeight: "1.5",
                    }}
                  >
                    Add a vendor to assign outsourced output. You can also add
                    Internal from the Add Vendor modal.
                  </span>
                </div>
              ) : (
                vendors.map((vendor, i) => {
                  const isInternal = vendor.name === "Internal";
                  const resolvedVendorStatus = isInternal
                    ? internalStatusInfo.text
                    : resolveVendorProgressStatus(vendor);
                  const isCompleted = resolvedVendorStatus === "Completed";
                  const isPoApproved = vendor.isPoApproved;
                  const isVendorInProgress =
                    resolvedVendorStatus === "In Progress";
                  const showEditVendorAction =
                    isInternal || (!isVendorInProgress && !isPoApproved);
                  const showRemoveVendorAction =
                    !isVendorInProgress &&
                    !(
                      isInternal &&
                      internalStatusInfo.text === "In Progress"
                    ) &&
                    !isCompleted &&
                    ((vendor.receivedOutput || 0) === 0 || isInternal) &&
                    (isInternal || !isPoApproved);
                  const showReceiptHistoryAction =
                    (vendor.receipts && vendor.receipts.length > 0) ||
                    (isVendorInProgress && !isInternal);

                  return (
                    <div
                      key={vendor.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 0",
                        borderBottom:
                          i === vendors.length - 1
                            ? "none"
                            : "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                      }}
                    >
                      <div style={{ flex: "1.35" }}>
                        {vendor.name || "Internal"}
                      </div>

                      <div
                        style={{
                          flex: "1.55",
                          display: "flex",
                          alignItems: "center",
                          gap: "6px",
                          position: "relative",
                        }}
                      >
                        {!isInternal ? (
                          vendor.poNumber ? (
                            <>
                              <span
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenVendorMenuId(null);
                                  setOpenPoPopoverVendorId(null);
                                  setSelectedVendorForPoAction(vendor);
                                  scrollToTop();
                                  onNavigate("po_detail", {
                                    ...buildDummyPoDetailData(
                                      vendor.poNumber,
                                      vendor
                                    ),
                                    from: "work_order_detail",
                                    returnTo: {
                                      view: "detail",
                                      data: {
                                        ...initialData,
                                        vendors,
                                        routingStages,
                                        outsourceSteps,
                                        statusKey: woStatus,
                                        start: displayStartDate,
                                        end: displayEndDate,
                                      },
                                    },
                                  });
                                }}
                                style={{
                                  color: "var(--feature-brand-primary)",
                                  cursor: "pointer",
                                  textDecoration: "underline",
                                }}
                              >
                                {vendor.poNumber}
                              </span>
                              {isPoApproved ? (
                                <Tooltip content="PO Approved">
                                  <div
                                    style={{
                                      width: "16px",
                                      height: "16px",
                                      borderRadius: "50%",
                                      background: "var(--status-green-primary)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <CheckIcon size={10} color="white" />
                                  </div>
                                </Tooltip>
                              ) : null}
                            </>
                          ) : (
                            <>
                              <Button
                                variant="tertiary"
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPoPopoverPosition(
                                    getPoPopoverPosition(
                                      e.currentTarget.getBoundingClientRect()
                                    )
                                  );
                                  handleOpenPoAction(vendor);
                                }}
                                style={{
                                  padding: 0,
                                  margin: 0,
                                  height: "auto",
                                  minHeight: "unset",
                                }}
                              >
                                Add Purchase Order
                              </Button>

                              {openPoPopoverVendorId === vendor.id &&
                                selectedVendorForPoAction?.id === vendor.id ? (
                                <>
                                  <div
                                    style={{
                                      position: "fixed",
                                      inset: 0,
                                      zIndex: 90,
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setOpenPoPopoverVendorId(null);
                                    }}
                                  />
                                  <div
                                    style={{
                                      position: "fixed",
                                      top: `${poPopoverPosition.top}px`,
                                      left: `${poPopoverPosition.left}px`,
                                      transform:
                                        poPopoverPosition.placement === "top"
                                          ? "translateY(-100%)"
                                          : "none",
                                      background:
                                        "var(--neutral-surface-primary)",
                                      borderRadius: "var(--radius-small)",
                                      boxShadow: "var(--elevation-sm)",
                                      border:
                                        "1px solid var(--neutral-line-separator-1)",
                                      zIndex: 101,
                                      display: "flex",
                                      flexDirection: "column",
                                      minWidth: "180px",
                                      padding: "4px 0",
                                    }}
                                  >
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCreatePoFromVendor();
                                      }}
                                      onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "var(--neutral-surface-grey-lighter)")
                                      }
                                      onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "transparent")
                                      }
                                      style={{
                                        padding: "12px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        cursor: "pointer",
                                        fontSize: "var(--text-title-3)",
                                        color:
                                          "var(--neutral-on-surface-primary)",
                                      }}
                                    >
                                      <AddIcon size={16} /> Create New PO
                                    </div>
                                    <div
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleOpenSelectExistingPo();
                                      }}
                                      onMouseEnter={(e) =>
                                      (e.currentTarget.style.background =
                                        "var(--neutral-surface-grey-lighter)")
                                      }
                                      onMouseLeave={(e) =>
                                      (e.currentTarget.style.background =
                                        "transparent")
                                      }
                                      style={{
                                        padding: "12px 16px",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "8px",
                                        cursor: "pointer",
                                        fontSize: "var(--text-title-3)",
                                        color:
                                          "var(--neutral-on-surface-primary)",
                                        borderTop:
                                          "1px solid var(--neutral-line-separator-1)",
                                      }}
                                    >
                                      <DocumentIcon size={16} /> Select Existing
                                      PO
                                    </div>
                                  </div>
                                </>
                              ) : null}
                            </>
                          )
                        ) : (
                          "-"
                        )}
                      </div>

                      <div style={{ flex: "1" }}>{vendor.output} pcs</div>
                      <div style={{ flex: "1" }}>
                        {vendor.receivedOutput || 0} pcs
                      </div>
                      <div style={{ flex: "1.1" }}>
                        {isInternal ? (
                          <StatusBadge variant={internalStatusInfo.variant}>
                            {internalStatusInfo.text}
                          </StatusBadge>
                        ) : (
                          <StatusBadge
                            variant={
                              resolvedVendorStatus === "Completed"
                                ? "green-light"
                                : resolvedVendorStatus === "Partially Received"
                                  ? "blue-light"
                                  : resolvedVendorStatus === "In Progress"
                                    ? "orange-light"
                                    : "grey-light"
                            }
                          >
                            {resolvedVendorStatus}
                          </StatusBadge>
                        )}
                      </div>

                      <div
                        style={{
                          width: "140px",
                          display: "flex",
                          justifyContent: "flex-end",
                          alignItems: "center",
                          gap: "8px",
                        }}
                      >
                        {showEditVendorAction ? (
                          <Tooltip content="Edit Details">
                            <IconButton
                              icon={EditIcon}
                              size="small"
                              title="Edit Details"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditVendor(vendor);
                              }}
                            />
                          </Tooltip>
                        ) : null}

                        {showRemoveVendorAction ? (
                          <Tooltip content="Remove Assignment">
                            <IconButton
                              icon={DeleteIcon}
                              size="small"
                              title="Remove Assignment"
                              color="var(--status-red-primary)"
                              hoverBackground="#FAE6E8"
                              onClick={(e) => {
                                e.stopPropagation();
                                promptRemoveVendor(vendor);
                              }}
                            />
                          </Tooltip>
                        ) : null}

                        {showReceiptHistoryAction ? (
                          <Tooltip content="Receipt History">
                            <IconButton
                              icon={DocumentIcon}
                              size="small"
                              title="Receipt History"
                              color="var(--feature-brand-primary)"
                              hoverBackground="var(--feature-brand-container-lighter)"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReceiptHistoryVendor(vendor);
                                setIsViewReceiptHistoryModalOpen(true);
                              }}
                            />
                          </Tooltip>
                        ) : null}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>
        ) : null}
      </div>

      {woStatus === "not_started" ? (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: isSidebarCollapsed ? "82px" : "286px",
            transition: "left 0.2s ease",
            right: 0,
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            padding: "12px 24px",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          <Button
            variant="filled"
            size="medium"
            onClick={() => {
              setReadyStartDate(displayStartDate || "");
              setReadyEndDate(displayEndDate || "");
              setIsReadyModalOpen(true);
            }}
          >
            Ready to Process
          </Button>
        </div>
      ) : null}

      <GeneralModal
        isOpen={isConfirmRemoveModalOpen && !!vendorToRemove}
        onClose={() => setIsConfirmRemoveModalOpen(false)}
        title="Remove Assignment"
        width="400px"
        description="Are you sure you want to remove this assignment? This action will unassign the vendor from this stage."
        footer={
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={executeRemoveVendor}
            >
              Yes, Remove
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsConfirmRemoveModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        }
      />

      <GeneralModal
        isOpen={isReadyModalOpen}
        onClose={() => setIsReadyModalOpen(false)}
        title="Set Planned Date"
        width="400px"
        footer={
          <div style={{ display: "flex", flexDirection: "column", gap: "12px", width: "100%" }}>
            <Button
              variant="filled"
              size="large"
              disabled={!readyStartDate || !readyEndDate}
              style={{ width: "100%" }}
              onClick={() => {
                setIsReadyModalOpen(false);
                setIsConfirmReadyModalOpen(true);
              }}
            >
              Continue
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsReadyModalOpen(false)}
            >
              Cancel
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Planned Start Date
              </span>
            </div>
            <DateInputControl
              value={readyStartDate}
              onChange={(e) => setReadyStartDate(e.target.value)}
            />
          </div>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "8px" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "2px",
                fontSize: "var(--text-body)",
                fontWeight: "var(--font-weight-regular)",
              }}
            >
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                Planned Finish Date
              </span>
            </div>
            <DateInputControl
              value={readyEndDate}
              onChange={(e) => setReadyEndDate(e.target.value)}
            />
          </div>
        </div>
      </GeneralModal>

      <GeneralModal
        isOpen={isConfirmReadyModalOpen}
        onClose={() => setIsConfirmReadyModalOpen(false)}
        title="Confirm Action"
        description={<>Are you sure you want to proceed? <strong>You cannot change the outsourced steps later</strong> after the work order is marked as ready to process.</>}
        footer={
          <>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setIsConfirmReadyModalOpen(false);
                setDisplayStartDate(readyStartDate);
                setDisplayEndDate(readyEndDate);
                setWoStatus("ready_to_process");
                setVendors((prev) => prev);
                setToastMessage("Work order status successfully changed");
                setShowSuccessToast(true);
              }}
            >
              Yes, Proceed
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setIsConfirmReadyModalOpen(false)}
            >
              Cancel
            </Button>
          </>
        }
      />

      {isManageStageModalOpen && selectedStage ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "680px",
              maxWidth: "calc(100vw - 32px)",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              padding: "64px 32px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
              maxHeight: "90vh",
              overflow: "hidden",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => setIsManageStageModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px" }}
              color="var(--neutral-on-surface-primary)"
            />

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                flexShrink: 0,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Manage Routing
              </h2>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-secondary)",
                }}
              >
                Operation: {selectedStageData?.op || selectedStage?.op}
              </span>
            </div>

            <div
              style={{
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  background: "var(--feature-brand-container-lighter)",
                  borderRadius: "var(--radius-small)",
                  padding: "12px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "8px",
                  color: "var(--feature-brand-primary)",
                }}
              >
                <Info size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--text-body)",
                    lineHeight: "1.5",
                  }}
                >
                  Item must be completed in the previous step to become available
                  in the next one. Once Completed, items are locked and cannot be
                  reverted.
                </p>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "12px" }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Internal Progress
                </span>

                <div
                  style={{
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "var(--radius-small)",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      Yet to Start
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-desc)",
                        color: "var(--neutral-on-surface-tertiary)",
                      }}
                    >
                      Available Pool: {stageStart}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: "20px",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    {stageStart}
                  </span>
                </div>

                <div
                  style={{
                    border: "1px solid var(--neutral-line-separator-1)",
                    borderRadius: "var(--radius-small)",
                    padding: "12px 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    In Progress
                  </span>
                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                  >
                    <button
                      disabled={stageProg <= 0}
                      onClick={() => {
                        if (stageProgError) setStageProgError("");
                        setStageProg((prev) => {
                          const next = Math.max(0, prev - 1);
                          setStageMaxCompletable(stageOriginalComp + next);
                          return next;
                        });
                        setStageStart((prev) => prev + 1);
                      }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-small)",
                        background:
                          stageProg <= 0
                            ? "var(--neutral-surface-grey-lighter)"
                            : "transparent",
                        border:
                          stageProg <= 0
                            ? "1px solid transparent"
                            : "1px solid var(--feature-brand-primary)",
                        cursor: stageProg <= 0 ? "not-allowed" : "pointer",
                        opacity: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Minus
                        size={16}
                        color={
                          stageProg <= 0
                            ? "var(--neutral-on-surface-tertiary)"
                            : "var(--feature-brand-primary)"
                        }
                      />
                    </button>
                    <input
                      type="text"
                      value={stageProg === 0 ? "" : formatNumberWithCommas(stageProg)}
                      placeholder="0"
                      onChange={(e) => {
                        let raw = String(e.target.value || "").replace(/,/g, "").replace(/\D/g, "");
                        if (raw.length > 1) {
                          raw = raw.replace(/^0+/, "");
                          if (raw === "") raw = "0";
                        }

                        const nextProg = raw === "" ? 0 : parseInt(raw, 10);
                        if (Number.isNaN(nextProg)) return;

                        if (stageProgError) setStageProgError("");
                        const maxProg = Math.max(0, stageTotalPool - stageComp);
                        const clampedProg = Math.max(
                          0,
                          Math.min(nextProg, maxProg)
                        );
                        const nextStart = Math.max(
                          0,
                          stageTotalPool - stageComp - clampedProg
                        );
                        setStageProg(clampedProg);
                        setStageStart(nextStart);
                        setStageMaxCompletable(
                          stageOriginalComp + clampedProg + nextStart
                        );
                      }}
                      style={{
                        width: "56px",
                        height: "32px",
                        textAlign: "center",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: "var(--font-weight-bold)",
                        color:
                          stageProg === 0
                            ? "var(--neutral-on-surface-tertiary)"
                            : "var(--neutral-on-surface-primary)",
                        border: stageProgError
                          ? "1px solid var(--status-red-primary)"
                          : "1px solid var(--neutral-line-separator-1)",
                        borderRadius: "var(--radius-small)",
                        outline: "none",
                        background: "var(--neutral-surface-primary)",
                        transition: "border-color 0.2s",
                      }}
                      onFocus={(e) =>
                        (e.target.style.borderColor = stageProgError
                          ? "var(--status-red-primary)"
                          : "var(--feature-brand-primary)")}
                      onBlur={(e) =>
                        (e.target.style.borderColor = stageProgError
                          ? "var(--status-red-primary)"
                          : "var(--neutral-line-separator-1)")}
                    />
                    <button
                      disabled={stageStart === 0}
                      onClick={() => {
                        if (stageProgError) setStageProgError("");
                        const nextProg = stageProg + 1;
                        const nextStart = Math.max(0, stageStart - 1);
                        setStageProg(nextProg);
                        setStageStart(nextStart);
                        setStageMaxCompletable(
                          stageOriginalComp + nextProg + nextStart
                        );
                      }}
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "var(--radius-small)",
                        background:
                          stageStart === 0
                            ? "var(--neutral-surface-grey-lighter)"
                            : "var(--feature-brand-primary)",
                        border: "1px solid var(--neutral-line-separator-1)",
                        cursor: stageStart === 0 ? "not-allowed" : "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease",
                      }}
                    >
                      <Plus
                        size={16}
                        color={
                          stageStart === 0
                            ? "var(--neutral-on-surface-tertiary)"
                            : "var(--neutral-surface-primary)"
                        }
                      />
                    </button>
                  </div>
                </div>
                {stageProgError ? (
                  <span
                    style={{
                      marginTop: "-4px",
                      fontSize: "var(--text-body)",
                      color: "var(--status-red-primary)",
                    }}
                  >
                    {stageProgError}
                  </span>
                ) : null}
              </div>

              <div
                style={{
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "var(--radius-small)",
                  padding: "12px 16px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span
                  style={{
                    fontSize: "var(--text-title-3)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Completed
                </span>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <button
                    disabled={stageComp <= stageOriginalComp}
                    onClick={() => {
                      const nextComp = stageComp - 1;
                      const nextStart = stageStart + 1;
                      setStageComp(nextComp);
                      setStageStart(nextStart);
                      setStageCompInput(String(nextComp));
                      setStageMaxCompletable(
                        stageOriginalComp + nextStart + stageProg
                      );
                      setStageCompError("");
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "var(--radius-small)",
                      background:
                        stageComp <= stageOriginalComp
                          ? "var(--neutral-surface-grey-lighter)"
                          : "transparent",
                      border:
                        stageComp <= stageOriginalComp
                          ? "1px solid transparent"
                          : "1px solid var(--feature-brand-primary)",
                      cursor:
                        stageComp <= stageOriginalComp
                          ? "not-allowed"
                          : "pointer",
                      opacity: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Minus
                      size={16}
                      color={
                        stageComp <= stageOriginalComp
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--feature-brand-primary)"
                      }
                    />
                  </button>
                  <input
                    type="text"
                    value={stageCompInput === "0" ? "" : formatNumberWithCommas(stageCompInput)}
                    placeholder="0"
                    onChange={(e) => {
                      let raw = String(e.target.value || "").replace(/,/g, "").replace(/\D/g, "");
                      if (raw.length > 1) {
                        raw = raw.replace(/^0+/, "");
                        if (raw === "") raw = "0";
                      }

                      setStageCompInput(raw);
                      if (stageCompError) setStageCompError("");

                      const nextComp = raw === "" ? 0 : parseInt(raw, 10);
                      if (!Number.isNaN(nextComp)) {
                        const totalAvailablePool = stageTotalPool;
                        const clampedComp = Math.max(
                          stageOriginalComp,
                          Math.min(nextComp, totalAvailablePool)
                        );
                        setStageComp(clampedComp);
                        const remainder = Math.max(
                          0,
                          totalAvailablePool - clampedComp
                        );
                        const nextProg = Math.min(stageProg, remainder);
                        const nextStart = Math.max(0, remainder - nextProg);
                        setStageProg(nextProg);
                        setStageStart(nextStart);
                      }
                    }}
                    style={{
                      width: "56px",
                      height: "32px",
                      textAlign: "center",
                      fontSize: "var(--text-subtitle-1)",
                      fontWeight: "var(--font-weight-bold)",
                      color:
                        stageCompInput === "" || stageCompInput === "0"
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--neutral-on-surface-primary)",
                      border: stageCompError
                        ? "1px solid var(--status-red-primary)"
                        : "1px solid var(--neutral-line-separator-1)",
                      borderRadius: "var(--radius-small)",
                      outline: "none",
                      background: "var(--neutral-surface-primary)",
                      transition: "border-color 0.2s",
                    }}
                    onFocus={(e) =>
                      (e.target.style.borderColor = stageCompError
                        ? "var(--status-red-primary)"
                        : "var(--feature-brand-primary)")}
                    onBlur={(e) =>
                      (e.target.style.borderColor = stageCompError
                        ? "var(--status-red-primary)"
                        : "var(--neutral-line-separator-1)")}
                  />
                  <button
                    disabled={stageStart === 0 && stageProg === 0}
                    onClick={() => {
                      const nextComp = stageComp + 1;
                      const shouldUseYetToStart = stageStart > 0;
                      const nextStart = shouldUseYetToStart
                        ? stageStart - 1
                        : stageStart;
                      const nextProg = shouldUseYetToStart
                        ? stageProg
                        : Math.max(0, stageProg - 1);
                      setStageComp(nextComp);
                      setStageStart(nextStart);
                      setStageProg(nextProg);
                      setStageCompInput(String(nextComp));
                      setStageMaxCompletable(
                        stageOriginalComp + nextStart + nextProg
                      );
                      setStageCompError("");
                    }}
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "var(--radius-small)",
                      background:
                        stageStart === 0 && stageProg === 0
                          ? "var(--neutral-surface-grey-lighter)"
                          : "var(--feature-brand-primary)",
                      border: "1px solid var(--neutral-line-separator-1)",
                      cursor:
                        stageStart === 0 && stageProg === 0
                          ? "not-allowed"
                          : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <Plus
                      size={16}
                      color={
                        stageStart === 0 && stageProg === 0
                          ? "var(--neutral-on-surface-tertiary)"
                          : "var(--neutral-surface-primary)"
                      }
                    />
                  </button>
                </div>
              </div>

              {stageCompError ? (
                <span
                  style={{
                    marginTop: "-4px",
                    fontSize: "var(--text-body)",
                    color: "var(--status-red-primary)",
                  }}
                >
                  {stageCompError}
                </span>
              ) : null}

              {isSelectedStageOutsourced ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setIsManageStageVendorSectionExpanded((prev) => !prev)
                    }
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      cursor: "pointer",
                      width: "100%",
                      gap: "12px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-title-2)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      Assigned Vendors ({vendors.length})
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: "var(--neutral-line-separator-1)",
                      }}
                    />
                    <ChevronDownIcon
                      size={18}
                      color="var(--neutral-on-surface-secondary)"
                      style={{
                        transform: isManageStageVendorSectionExpanded
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.2s ease",
                      }}
                    />
                  </button>
                  {isManageStageVendorSectionExpanded ? (
                    <div style={poReferenceTableFrameStyle}>
                        <div
                          style={{
                            ...poReferenceTableScrollerStyle,
                          }}
                        >
                        <div style={poReferenceTableInnerStyle("100%")}>
                          <div
                            style={{
                              ...poReferenceTableHeaderRowStyle(
                                "1.4fr 1fr 1fr 1.1fr"
                              ),
                              position: "sticky",
                              top: 0,
                              zIndex: 2,
                            }}
                          >
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Vendor Name
                            </div>
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Assigned Output
                            </div>
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Received Output
                            </div>
                            <div style={poReferenceTableHeaderCellStyle()}>
                              Status
                            </div>
                          </div>
                          {(vendors.length > 0 ? vendors : []).map(
                            (vendor, idx) => {
                              const vendorStatusMeta = getVendorStatusMeta(vendor);
                              return (
                                <div
                                  key={vendor.id}
                                  style={poReferenceTableRowStyle(
                                    "1.4fr 1fr 1fr 1.1fr",
                                    idx === vendors.length - 1
                                  )}
                                >
                                  <div
                                    style={poReferenceTableCellStyle({
                                      minWidth: 0,
                                    })}
                                  >
                                    <span
                                      style={{
                                        display: "block",
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                      }}
                                    >
                                      {vendor.name}
                                    </span>
                                  </div>
                                  <div style={poReferenceTableCellStyle()}>
                                    {vendor.output || 0} pcs
                                  </div>
                                  <div style={poReferenceTableCellStyle()}>
                                    {vendor.receivedOutput || 0} pcs
                                  </div>
                                  <div style={poReferenceTableCellStyle()}>
                                    <StatusBadge variant={vendorStatusMeta.variant}>
                                      {vendorStatusMeta.text}
                                    </StatusBadge>
                                  </div>
                                </div>
                              );
                            }
                          )}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div style={{ marginTop: "8px", flexShrink: 0 }}>
              <Button
                variant="filled"
                size="large"
                style={{ width: "100%" }}
                onClick={() => {
                  const minComp = stageOriginalComp;
                  const sanitizedCompInput =
                    stageCompInput === "" ? 0 : parseInt(stageCompInput, 10);
                  const maxComp = stageTotalPool;

                  if (Number.isNaN(sanitizedCompInput)) {
                    setStageCompError(
                      "Completed value must be a valid number."
                    );
                    return;
                  }

                  if (sanitizedCompInput < minComp) {
                    setStageCompError(
                      `Completed value cannot be lower than ${minComp}.`
                    );
                    return;
                  }

                  if (sanitizedCompInput > maxComp) {
                    setStageCompError(
                      `Completed value cannot be higher than ${maxComp}.`
                    );
                    return;
                  }


                  const finalStageComp = sanitizedCompInput;
                  const finalStageProg = Math.max(
                    0,
                    Math.min(stageProg, stageTotalPool - finalStageComp)
                  );

                  setRoutingStages((prev) =>
                    prev.map((r) =>
                      r.step === selectedStageData?.step
                        ? { ...r, prog: finalStageProg, comp: finalStageComp }
                        : r
                    )
                  );
                  setStageComp(finalStageComp);
                  setStageProg(finalStageProg);
                  setStageCompInput(String(finalStageComp));
                  setStageProgError("");
                  setStageCompError("");
                  setIsManageStageModalOpen(false);
                  if (woStatus === "ready_to_process") {
                    setWoStatus("in_progress");
                  }

                  setToastMessage("Routing stage successfully updated");
                  setShowSuccessToast(true);
                }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <GeneralModal
        isOpen={isSelectExistingPoModalOpen}
        onClose={() => setIsSelectExistingPoModalOpen(false)}
        title="Select Existing Purchase Order"
        width={selectedExistingPoNumber ? "1000px" : "480px"}
        transition="width 0.3s ease"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            width: "100%",
            height: "600px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: selectedExistingPoNumber ? "0 0 456px" : "1",
              padding: "8px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              overflow: "hidden",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-tertiary)",
                }}
              >
                Vendor
              </span>
              <span
                style={{
                  fontSize: "var(--text-title-2)",
                  fontWeight: "bold",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                {selectedVendorForPoAction?.name}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <label
                style={{
                  fontSize: "var(--text-body)",
                  fontWeight: "var(--font-weight-regular)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                <span style={{ color: "var(--status-red-primary)" }}>*</span> Purchase Order
              </label>
              <DropdownSelect
                value={selectedExistingPoNumber}
                onChange={(nextValue) => setSelectedExistingPoNumber(nextValue)}
                placeholder="Select purchase order"
                options={MOCK_PO_TABLE_DATA.filter(
                  (po) =>
                    po.vendorName === selectedVendorForPoAction?.name &&
                    !["issued", "completed"].includes(po.statusKey)
                ).map((po) => ({
                  value: po.poNumber,
                  label: `${po.poNumber} (${po.status})`,
                }))}
              />
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "auto",
                paddingTop: "24px",
              }}
            >
              <Button
                variant="outlined"
                size="large"
                style={{ flex: 1 }}
                onClick={() => setIsSelectExistingPoModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                style={{ flex: 1 }}
                disabled={!selectedExistingPoNumber}
                onClick={handleAttachExistingPo}
              >
                Assign PO
              </Button>
            </div>
          </div>

          {selectedExistingPoNumber && (
            <div
              style={{
                flex: "1",
                background: "var(--neutral-surface-grey-lighter)",
                borderLeft: "1px solid var(--neutral-line-separator-1)",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: "24px 32px",
                  borderBottom: "1px solid var(--neutral-line-separator-1)",
                  background: "var(--neutral-surface-primary)",
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  Purchase Order Preview
                </h3>
              </div>

              <div
                style={{
                  padding: "24px 32px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "24px",
                  overflowY: "auto",
                  flex: 1,
                }}
              >
                {renderPoPreviewContent(selectedPoDetail)}
              </div>
            </div>
          )}
        </div>

      </GeneralModal>
      {isSingleVendorModalOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: singleVendorForm.poNumber ? "900px" : "450px",
              maxWidth: "calc(100vw - 32px)",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              display: "flex",
              flexDirection: "row",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
              overflow: "hidden",
              maxHeight: "90vh",
              transition: "width 0.3s ease",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => {
                setAssignedOutputError("");
                setIsSingleVendorModalOpen(false);
              }}
              style={{ position: "absolute", top: "16px", right: "16px", zIndex: 2 }}
              color="var(--neutral-on-surface-primary)"
            />
            <div
              style={{
                flex: "1",
                padding: "64px 32px 32px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                overflowY: "auto",
              }}
            >
              <div
                style={{
                  position: "relative",
                  minHeight: "40px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: "var(--text-headline)",
                    fontWeight: "var(--font-weight-bold)",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-primary)",
                  }}
                >
                  {singleVendorForm.id
                    ? "Edit Assigned Vendor"
                    : "Add Assigned Vendor"}
                </h2>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <SearchableVendorSelect
                  label="Vendor Name"
                  required
                  value={singleVendorForm.name}
                  disabled={!!singleVendorForm.lockedVendorName}
                  placeholder="Type to search or add vendor"
                  options={vendorNameOptions}
                  onChange={(nextValue) =>
                    setSingleVendorForm({
                      ...singleVendorForm,
                      name: nextValue,
                      poNumber: "",
                      poDetailData: null,
                    })
                  }
                />



                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--font-weight-regular)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span
                        style={{ color: "var(--neutral-on-surface-primary)" }}
                      >
                        Assigned Output
                      </span>
                    </div>
                    <StatusBadge variant="blue-light">
                      {`Available: ${Math.max(
                        0,
                        TOTAL_QTY -
                        vendors
                          .filter((v) => v.id !== singleVendorForm.id)
                          .reduce(
                            (sum, v) => sum + (parseInt(v.output, 10) || 0),
                            0
                          )
                      )} pcs`}
                    </StatusBadge>
                  </div>
                  {(() => {
                    const availableQty = Math.max(
                      0,
                      TOTAL_QTY -
                      vendors
                        .filter((v) => v.id !== singleVendorForm.id)
                        .reduce(
                          (sum, v) => sum + (parseInt(v.output, 10) || 0),
                          0
                        )
                    );
                    const isExceedingTotal = (parseInt(singleVendorForm.output, 10) || 0) > availableQty;

                    return (
                      <>
                        <InputGroup
                          type="number"
                          value={singleVendorForm.output}
                          onChange={(e) => {
                            const val = e.target.value;
                            if (val === "") {
                              if (assignedOutputError) setAssignedOutputError("");
                              setSingleVendorForm({
                                ...singleVendorForm,
                                output: "",
                              });
                            } else {
                              const numValue = parseInt(val, 10);
                              if (!isNaN(numValue) && numValue >= 0) {
                                if (
                                  editingInternalVendor &&
                                  numValue < editingInternalMinimumOutput
                                ) {
                                  setAssignedOutputError(
                                    internalAssignedOutputErrorMessage
                                  );
                                } else if (assignedOutputError) {
                                  setAssignedOutputError("");
                                }
                                setSingleVendorForm((prev) => {
                                  const nextOutput = numValue.toString();
                                  const nextPoDetailData = prev.poNumber
                                    ? buildPoLinkSnapshot(
                                        buildDummyPoDetailData(prev.poNumber, {
                                          ...prev,
                                          output: nextOutput,
                                          poDetailData: null,
                                        })
                                      )
                                    : null;
                                  return {
                                    ...prev,
                                    output: nextOutput,
                                    poDetailData: nextPoDetailData,
                                  };
                                });
                              }
                            }
                          }}
                          placeholder="0"
                          suffix="pcs"
                          hasError={!!assignedOutputError || isExceedingTotal}
                        />
                        {(assignedOutputError || isExceedingTotal) && (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {isExceedingTotal
                              ? `Exceeds available quantity (${availableQty} pcs).`
                              : assignedOutputError}
                          </span>
                        )}
                      </>
                    );
                  })()}
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <SearchableVendorSelect
                      label="Purchase Order (Optional)"
                      value={singleVendorForm.poNumber}
                      placeholder="Select PO"
                      emptyMessage="No Editable Purchase Order Found"
                      disabled={singleVendorForm.name === "Internal"}
                      options={poOptions}
                      onChange={(nextPoNumber) => {
                        const selectedPo = MOCK_PO_TABLE_DATA.find(
                          (po) => po.poNumber === nextPoNumber
                        );
                        const poDetailData = nextPoNumber
                          ? buildPoLinkSnapshot(
                              buildDummyPoDetailData(nextPoNumber, {
                                ...singleVendorForm,
                                poNumber: nextPoNumber,
                                poDetailData: null,
                              })
                            )
                          : null;
                        setSingleVendorForm({
                          ...singleVendorForm,
                          poNumber: nextPoNumber,
                          isPoApproved:
                            selectedPo?.statusKey === "issued" ||
                            selectedPo?.statusKey === "completed",
                          poStatus: poDetailData?.status,
                          poBadge: poDetailData?.sBadge,
                          poStatusKey: poDetailData?.statusKey,
                          poDetailData,
                        });
                      }}
                    />
                    {singleVendorForm.poNumber &&
                      singleVendorForm.status === "Not Started" && (
                        <Button
                          variant="tertiary"
                          style={{
                            padding: "4px 8px",
                            fontSize: "var(--text-desc)",
                            marginTop: "24px",
                            color: "var(--status-red-primary)",
                          }}
                          onClick={() =>
                            setSingleVendorForm({
                              ...singleVendorForm,
                              poNumber: "",
                              isPoApproved: false,
                              poStatus: null,
                              poBadge: null,
                              poStatusKey: null,
                              poDetailData: null,
                            })
                          }
                        >
                          Remove Selection
                        </Button>
                      )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      padding: "12px 14px",
                      background: "var(--feature-brand-container-lighter)",
                      borderRadius: "10px",
                      border: "1px solid var(--feature-brand-container)",
                    }}
                  >
                    <Info
                      size={16}
                      color="var(--feature-brand-primary)"
                      style={{ flexShrink: 0, marginTop: "2px" }}
                    />
                    <span
                      style={{
                        fontSize: "var(--text-desc)",
                        color: "var(--feature-brand-on-container)",
                        lineHeight: "1.5",
                      }}
                    >
                      Select an existing PO if it is already known. If left empty,
                      you can add the PO later.
                    </span>
                  </div>
                </div>
              </div>



              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "auto",
                  paddingTop: "12px",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={() => {
                    setAssignedOutputError("");
                    setIsSingleVendorModalOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={handleSaveSingleVendor}
                  disabled={(() => {
                    const currentOtherTotal = vendors
                      .filter((v) => v.id !== singleVendorForm.id)
                      .reduce(
                        (sum, v) => sum + (parseInt(v.output, 10) || 0),
                        0
                      );
                    const proposedTotal =
                      currentOtherTotal +
                      (parseInt(singleVendorForm.output, 10) || 0);
                    return (
                      !singleVendorForm.name ||
                      !singleVendorForm.output ||
                      proposedTotal > TOTAL_QTY ||
                      !!assignedOutputError
                    );
                  })()}
                >
                  Save
                </Button>
              </div>
            </div>

            {singleVendorForm.poNumber && (
              <div
                style={{
                  flex: "1",
                  background: "var(--neutral-surface-grey-lighter)",
                  borderLeft: "1px solid var(--neutral-line-separator-1)",
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "24px 32px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    background: "var(--neutral-surface-primary)",
                  }}
                >
                  <h3
                    style={{
                      margin: 0,
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Purchase Order Preview
                  </h3>
                </div>

                <div
                  style={{
                    padding: "24px 32px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "24px",
                    overflowY: "auto",
                    flex: 1,
                  }}
                >
                  {renderPoPreviewContent(selectedVendorPoDetail)}
                </div>
              </div>
            )}

          </div>
        </div>
      ) : null}

      {isCreatePoModalOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "900px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              display: "flex",
              overflow: "hidden",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
              maxHeight: "90vh",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => setIsCreatePoModalOpen(false)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                zIndex: 10,
              }}
              color="var(--neutral-on-surface-primary)"
            />

            <div
              style={{
                flex: "1.5",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
              }}
            >
              <h2
                style={{
                  margin: "0 0 8px 0",
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Create Purchase Order
              </h2>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-secondary)",
                  marginBottom: "24px",
                }}
              >
                Fill in the details to generate a PO for the outsourced item.
              </span>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                  flex: 1,
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <InputField
                    label="PO Date"
                    type="date"
                    value={createPoForm.poDate}
                    onChange={(e) =>
                      setCreatePoForm({
                        ...createPoForm,
                        poDate: e.target.value,
                      })
                    }
                    required
                  />
                  <InputField
                    label="Expected Delivery Date"
                    type="date"
                    value={createPoForm.deliveryDate}
                    onChange={(e) =>
                      setCreatePoForm({
                        ...createPoForm,
                        deliveryDate: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "2px",
                        fontSize: "var(--text-body)",
                        fontWeight: "var(--font-weight-regular)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span
                        style={{ color: "var(--neutral-on-surface-primary)" }}
                      >
                        Currency
                      </span>
                    </div>
                    <div style={{ position: "relative", width: "100%" }}>
                      <DropdownSelect
                        value={createPoForm.currency}
                        onChange={(nextValue) =>
                          setCreatePoForm({
                            ...createPoForm,
                            currency: nextValue,
                          })
                        }
                        options={[
                          { value: "IDR", label: "IDR - Indonesian Rupiah" },
                          { value: "USD", label: "USD - US Dollar" },
                        ]}
                      />
                    </div>
                  </div>
                  <InputField
                    label="Unit Price"
                    type="number"
                    placeholder="0"
                    value={createPoForm.unitPrice}
                    onChange={(e) =>
                      setCreatePoForm({
                        ...createPoForm,
                        unitPrice: e.target.value,
                      })
                    }
                    required
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <InputField
                    label="Tax (%)"
                    type="number"
                    placeholder="0"
                    value={createPoForm.tax}
                    onChange={(e) =>
                      setCreatePoForm({ ...createPoForm, tax: e.target.value })
                    }
                  />
                  <InputField
                    label="Additional Fees"
                    type="number"
                    placeholder="0"
                    value={createPoForm.fees}
                    onChange={(e) =>
                      setCreatePoForm({ ...createPoForm, fees: e.target.value })
                    }
                  />
                </div>
                <InputField
                  label="Notes"
                  multiline
                  placeholder="Delivery notes..."
                  value={createPoForm.notes}
                  onChange={(e) =>
                    setCreatePoForm({ ...createPoForm, notes: e.target.value })
                  }
                />
                <InputField
                  label="Terms"
                  multiline
                  placeholder="Payment terms..."
                  value={createPoForm.terms}
                  onChange={(e) =>
                    setCreatePoForm({ ...createPoForm, terms: e.target.value })
                  }
                />
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "24px",
                  paddingTop: "24px",
                  borderTop: "1px solid var(--neutral-line-separator-1)",
                }}
              >
                <Button
                  variant="outlined"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={() => setIsCreatePoModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="filled"
                  size="large"
                  style={{ flex: 1 }}
                  onClick={handleSaveNewPo}
                  disabled={
                    !createPoForm.poDate ||
                    !createPoForm.deliveryDate ||
                    !createPoForm.unitPrice
                  }
                >
                  Save Purchase Order
                </Button>
              </div>
            </div>

            <div
              style={{
                flex: "1",
                background: "var(--neutral-surface-grey-lighter)",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                overflowY: "auto",
                borderLeft: "1px solid var(--neutral-line-separator-1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <DocumentIcon
                  size={20}
                  color="var(--neutral-on-surface-primary)"
                />
                <span
                  style={{
                    fontSize: "var(--text-title-2)",
                    fontWeight: "var(--font-weight-bold)",
                  }}
                >
                  {initialData?.wo || "WO-2294824-20251109-00001"}
                </span>
              </div>

              <Card style={{ padding: "16px", gap: "12px", boxShadow: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    paddingBottom: "12px",
                  }}
                >
                  <Building2
                    size={16}
                    color="var(--neutral-on-surface-tertiary)"
                  />
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Vendor Information
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--feature-brand-primary)",
                    }}
                  >
                    {singleVendorForm.name}
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {selectedVendorDetails.email || "-"} •{" "}
                    {selectedVendorDetails.phone || "-"}
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--neutral-on-surface-primary)",
                    background: "var(--neutral-surface-grey-lighter)",
                    padding: "8px",
                    borderRadius: "4px",
                  }}
                >
                  {selectedVendorDetails.address || "-"}
                </div>
              </Card>

              <Card style={{ padding: "16px", gap: "12px", boxShadow: "none" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    borderBottom: "1px solid var(--neutral-line-separator-1)",
                    paddingBottom: "12px",
                  }}
                >
                  <Info size={16} color="var(--neutral-on-surface-tertiary)" />
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Order Information
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "16px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Est. Received Date
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {singleVendorForm.date || "No Date Set"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Product
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      {initialData?.product || "Wooden Chair"}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "4px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      Assigned Output
                    </span>
                    <span
                      style={{
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--feature-brand-primary)",
                      }}
                    >
                      {singleVendorForm.output} pcs
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      ) : null}

      {isUploadProofModalOpen ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              width: "400px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => {
                setIsUploadProofModalOpen(false);
                setProofDocuments([]);
                setProofUploadError("");
                setProofDescriptionErrors({});
                setProofAmount("");
                setProofDate("");
                setProofNote("");
              }}
              style={{ position: "absolute", top: "16px", right: "16px" }}
              color="var(--neutral-on-surface-primary)"
            />

            <h2
              style={{
                margin: "0",
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              Receive Vendor Output
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--font-weight-regular)",
                  }}
                >
                  <span style={{ color: "var(--status-red-primary)" }}>*</span>
                  <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                    Received Quantity
                  </span>
                </div>
                <InputGroup
                  type="number"
                  value={proofAmount}
                  onChange={(e) => setProofAmount(e.target.value)}
                  placeholder="0"
                  max={
                    (selectedVendorObj?.output || 0) -
                    (selectedVendorObj?.receivedOutput || 0)
                  }
                  suffix="pcs"
                />
                <span
                  style={{
                    fontSize: "var(--text-desc)",
                    color: "var(--neutral-on-surface-secondary)",
                  }}
                >
                  Remaining to receive:{" "}
                  {(selectedVendorObj?.output || 0) -
                    (selectedVendorObj?.receivedOutput || 0)}{" "}
                  pcs
                </span>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--font-weight-regular)",
                  }}
                >
                  <span style={{ color: "var(--status-red-primary)" }}>*</span>
                  <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                    Received Date
                  </span>
                </div>
                <DateInputControl
                  value={proofDate}
                  onChange={(e) => setProofDate(e.target.value)}
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2px",
                    fontSize: "var(--text-body)",
                    fontWeight: "var(--font-weight-regular)",
                  }}
                >
                  <span style={{ color: "var(--neutral-on-surface-primary)" }}>
                    Notes
                  </span>
                </div>
                <textarea
                  value={proofNote}
                  onChange={(e) => setProofNote(e.target.value)}
                  placeholder="Add note for this receipt"
                  style={{
                    minHeight: "88px",
                    padding: "12px 16px",
                    width: "100%",
                    resize: "vertical",
                    ...inputFrameStyle(false, false),
                    ...inputControlStyle(false, !!proofNote),
                  }}
                  onFocus={(e) => focusInputFrame(e.currentTarget)}
                  onBlur={(e) => blurInputFrame(e.currentTarget, false, false)}
                />
              </div>

              {!isInternalProof ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "2px",
                      fontSize: "var(--text-body)",
                      fontWeight: "var(--font-weight-regular)",
                    }}
                  >
                    <span style={{ color: "var(--status-red-primary)" }}>
                      *
                    </span>
                    <span
                      style={{ color: "var(--neutral-on-surface-primary)" }}
                    >
                      Upload Proof Document
                    </span>
                  </div>
                  <UploadDropzone
                    maxFiles={MAX_PROOF_UPLOAD_FILES}
                    multiple
                    error={proofUploadError}
                    onFilesSelected={handleVendorProofFilesSelected}
                  />
                  {proofDocuments.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px",
                      }}
                    >
                      {proofDocuments.map((doc) => (
                        <UploadDescriptionCard
                          key={doc.id}
                          file={doc}
                          descriptionRequired
                          descriptionError={proofDescriptionErrors[doc.id]}
                          onDescriptionChange={(value) =>
                            updateVendorProofDescription(doc.id, value)
                          }
                          onRemove={() => removeVendorProofDocument(doc.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                  {proofUploadError ? (
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--status-red-primary)",
                      }}
                    >
                      {proofUploadError}
                    </span>
                  ) : null}
                </div>
              ) : null}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "8px" }}>
              <Button
                variant="outlined"
                size="large"
                style={{ flex: 1 }}
                onClick={() => {
                  setIsUploadProofModalOpen(false);
                  setProofDocuments([]);
                  setProofUploadError("");
                  setProofDescriptionErrors({});
                  setProofAmount("");
                  setProofDate("");
                  setProofNote("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                onClick={handleReceiveVendor}
                disabled={
                  isInternalProof
                    ? !proofDate
                    : !proofDate ||
                    proofDocuments.length === 0 ||
                    proofDocuments.some(
                      (doc) => !(doc.description || "").trim()
                    ) ||
                    !proofAmount ||
                    parseInt(proofAmount, 10) <= 0 ||
                    parseInt(proofAmount, 10) >
                    (selectedVendorObj?.output || 0) -
                    (selectedVendorObj?.receivedOutput || 0)
                }
                style={{ flex: 1 }}
              >
                Update
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {isViewReceiptHistoryModalOpen && receiptHistoryVendor ? (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
            <div
              style={{
              width:
                receiptHistoryVendor.name === "Internal" ? "520px" : "760px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              padding: "64px 32px 32px",
              display: "flex",
              flexDirection: "column",
              gap: "24px",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            <IconButton
              icon={CloseIcon}
              size="large"
              onClick={() => setIsViewReceiptHistoryModalOpen(false)}
              style={{ position: "absolute", top: "16px", right: "16px" }}
              color="var(--neutral-on-surface-primary)"
            />
            <div
              style={{
                position: "relative",
                minHeight: "40px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "4px",
              }}
            >
              <h2
                style={{
                  margin: "0",
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                  textAlign: "center",
                }}
              >
                Receipt History
              </h2>
              <span
                style={{
                  fontSize: "var(--text-body)",
                  color: "var(--neutral-on-surface-secondary)",
                  textAlign: "center",
                }}
              >
                {receiptHistoryVendor.name}
              </span>
            </div>

            <div style={poReferenceTableFrameStyle}>
              <div
                style={{
                  ...poReferenceTableScrollerStyle,
                  maxHeight: "300px",
                  overflowY: "auto",
                }}
              >
                <div
                  style={poReferenceTableInnerStyle(
                    receiptHistoryVendor.name &&
                      receiptHistoryVendor.name !== "Internal"
                      ? "720px"
                      : "360px"
                  )}
                >
                  <div
                    style={poReferenceTableHeaderRowStyle(
                      receiptHistoryVendor.name &&
                        receiptHistoryVendor.name !== "Internal"
                        ? "1fr 1fr 1.3fr 1.5fr"
                        : "1fr 1fr"
                    )}
                  >
                    <div style={poReferenceTableHeaderCellStyle()}>Date</div>
                    <div style={poReferenceTableHeaderCellStyle()}>
                      Quantity
                    </div>
                    {!receiptHistoryVendor.name ||
                      receiptHistoryVendor.name !== "Internal" ? (
                      <div style={poReferenceTableHeaderCellStyle()}>Note</div>
                    ) : null}
                    {!receiptHistoryVendor.name ||
                      receiptHistoryVendor.name !== "Internal" ? (
                      <div style={poReferenceTableHeaderCellStyle()}>
                        Document
                      </div>
                    ) : null}
                  </div>
                  {receiptHistoryVendor.receipts?.map((r, i) => (
                    <div
                      key={i}
                      style={poReferenceTableRowStyle(
                        receiptHistoryVendor.name &&
                          receiptHistoryVendor.name !== "Internal"
                          ? "1fr 1fr 1.3fr 1.5fr"
                          : "1fr 1fr",
                        i === receiptHistoryVendor.receipts.length - 1
                      )}
                    >
                      <div style={poReferenceTableCellStyle()}>{r.date}</div>
                      <div
                        style={poReferenceTableCellStyle({
                          fontWeight: "var(--font-weight-bold)",
                        })}
                      >
                        {r.amount} pcs
                      </div>
                      {!receiptHistoryVendor.name ||
                        receiptHistoryVendor.name !== "Internal" ? (
                        <div style={poReferenceTableCellStyle()}>
                          {r.note || "-"}
                        </div>
                      ) : null}
                      {!receiptHistoryVendor.name ||
                        receiptHistoryVendor.name !== "Internal" ? (
                        <div
                          style={poReferenceTableCellStyle({
                            alignItems: "flex-start",
                            padding: "12px 0",
                          })}
                        >
                          <ProofDocumentList
                            documents={
                              r.attachments ||
                              r.proofDocuments ||
                              normalizeProofDocuments([], r.attachment)
                            }
                            onDocumentClick={(doc) => {
                              setToastMessage(
                                `${doc?.name || "Document"} opened`
                              );
                              setShowSuccessToast(true);
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
                  {!receiptHistoryVendor.receipts ||
                    receiptHistoryVendor.receipts.length === 0 ? (
                    <div style={poReferenceTableEmptyStateStyle}>
                      No receipts found.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <Button
                variant="filled"
                size="medium"
                onClick={() => setIsViewReceiptHistoryModalOpen(false)}
                style={{ width: "100%" }}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
