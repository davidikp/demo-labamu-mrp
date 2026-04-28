import React, { useState, useEffect, useRef } from "react";
import {
  Bell,
  Box,
  BrandLogoIcon,
  BrandLogoLockup,
  Building2,
  Calendar,
  CalendarIcon,
  Check,
  CheckIcon,
  ChevronDown,
  ChevronDownIcon,
  ChevronLeft,
  ChevronLeftIcon,
  ChevronRight,
  ChevronRightIcon,
  CloudUploadIcon,
  CreditCard,
  DashboardIcon,
  DeleteIcon,
  Download,
  DownloadIcon,
  EditIcon,
  File,
  FileIcon,
  FileImage,
  FileText,
  FinancingIcon,
  GridViewIcon,
  HelpCircle,
  ImageAssetIcon,
  Info,
  LayoutGrid,
  List,
  ListViewIcon,
  ManufacturingIcon,
  Minus,
  MoreVertical,
  MoreVerticalIcon,
  NotificationIcon,
  Pencil,
  Pickaxe,
  Plus,
  ProductIcon,
  ResourcesIcon,
  RoleIcon,
  RoutingIcon,
  SalesIcon,
  Search,
  SearchIcon,
  Settings,
  TeamIcon,
  Trash2,
  Upload,
  UploadIcon,
  User,
  UserGuideIcon,
  UserIcon,
  Users,
  WorkOrderIcon,
  Wrench,
  X,
  AddIcon,
  AnalyticsIcon,
  BillOfMaterialsIcon,
  DocumentIcon,
  CloseIcon,
} from "../../../components/icons/Icons.jsx";
import {
  ALLOWED_DOCUMENT_EXTENSIONS,
  ALLOWED_IMAGE_EXTENSIONS,
  COUNTRY_CODE_OPTIONS,
  DATE_PICKER_MONTHS,
  DATE_PICKER_POPOVER_WIDTH,
  DATE_PICKER_WEEKDAYS,
  FILE_DESCRIPTION_MAX_LENGTH,
  LANGUAGE_OPTIONS,
  MAX_PROOF_UPLOAD_FILES,
  UPLOAD_MAX_FILE_SIZE_BYTES,
} from "../../../constants/appConstants.js";
import {
  DEFAULT_NOTIFICATION_CENTER_PREFERENCES,
  DEFAULT_NOTIFICATION_SETTINGS,
  cloneNotificationSettings,
} from "../../../data/notification/notificationDefaults.js";
import {
  NOTIFICATION_CATEGORY_OPTIONS,
  NOTIFICATION_DELIVERY_OPTIONS,
} from "../../../data/notification/notificationOptions.js";
import { DEFAULT_SYSTEM_NOTIFICATIONS } from "../../../data/notification/systemNotifications.js";
import { MOCK_COMPANY } from "../../../data/company.js";
import { MOCK_VENDORS } from "../../../data/vendors.js";
import {
  MOCK_ADMIN_GROUPS,
  MOCK_ADMIN_ROLES,
  MOCK_ADMIN_USERS,
} from "../../../modules/administration/mock/adminUsers.js";
import {
  MOCK_WO_LINES,
  MOCK_WO_TABLE_DATA,
} from "../../../modules/work-order/mock/workOrderMocks.js";
import { MOCK_MATERIALS_DATA } from "../../../modules/materials/mock/materialsMocks.js";
import {
  MOCK_ACTIVITIES,
  MOCK_PO_DOCUMENTS,
  MOCK_PO_TABLE_DATA,
} from "../../../modules/purchase-order/mock/purchaseOrderMocks.js";
import { MOCK_STOCK_BATCHES } from "../../../modules/materials/mock/batchesMocks.js";
import { PurchaseOrderListPage } from "../../../modules/purchase-order/pages/PurchaseOrderListPage.jsx";
import { PurchaseOrderSettingsPage } from "../../../modules/purchase-order/pages/PurchaseOrderSettingsPage.jsx";
import {
  baseInputBorderColor,
  blurInputFrame,
  fieldStyle,
  focusInputFrame,
  inputControlStyle,
  inputFrameStyle,
} from "../../../modules/purchase-order/styles/purchaseOrderInputStyles.js";
import { DocumentTypeBadge } from "../../../modules/purchase-order/components/DocumentTypeBadge.jsx";
import { buildPoLinkSnapshot } from "../../../modules/purchase-order/utils/purchaseOrderDetailUtils.js";
import {
  formatCurrency,
  formatNumberWithCommas,
  parseNumberFromCommas,
} from "../../../utils/format/formatUtils.js";
import {
  buildCalendarDays,
  formatIsoDateString,
  padDateUnit,
  parseIsoDateString,
} from "../../../utils/date/dateUtils.js";
import {
  createImageUploadRecord,
  createSyntheticInputEvent,
  createUploadDocumentRecord,
  formatUploadFileSize,
  getDocumentPrimaryLabel,
  getDocumentSecondaryLabel,
  getFileExtension,
  getImageUploadName,
  getImageUploadPreviewUrl,
  getUploadDocumentKind,
  normalizeProofDocuments,
  validateUploadFile,
} from "../../../utils/upload/uploadUtils.js";
import { getEnabledNotificationRuleIds } from "../../../utils/notification/notificationUtils.js";
import {
  applyDomLocalization,
  getTranslation,
  LOCALIZABLE_ATTRIBUTES,
} from "../../../utils/localization/localizationUtils.js";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { ListStatusCounterCard } from "../../../components/common/ListStatusCounterCard.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Sidebar } from "../../../components/layout/Sidebar.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";

const Tooltip = ({ content, children }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible ? (
        <div
          style={{
            position: "absolute",
            bottom: "100%",
            left: "50%",
            transform: "translateX(-50%)",
            marginBottom: "8px",
            width: "80vw",
            maxWidth: "1600px",
            width: "max-content",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "var(--neutral-on-surface-primary)",
            color: "var(--neutral-surface-primary)",
            fontSize: "var(--text-desc)",
            lineHeight: "1.6",
            boxShadow: "var(--elevation-sm)",
            zIndex: 1000,
            textAlign: "center",
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
        </div>
      ) : null}
    </div>
  );
};

const LabelValue = ({ label, value, badge }) => {
  const displayValue =
    typeof value === "object" && value !== null ? JSON.stringify(value) : value;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {badge ? (
          <StatusBadge variant={badge.variant}>{badge.text}</StatusBadge>
        ) : (
          <span
            style={{
              fontSize: "var(--text-title-3)",
              fontWeight: "var(--font-weight-bold)",
              color: "var(--neutral-on-surface-primary)",
            }}
          >
            {displayValue}
          </span>
        )}
      </div>
    </div>
  );
};

const FormField = ({
  label,
  required = false,
  children,
  error,
  helperText,
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      gap: "8px",
      width: "100%",
    }}
  >
    {label ? (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "2px",
          fontSize: "var(--text-body)",
          fontWeight: "var(--font-weight-regular)",
        }}
      >
        {required ? (
          <span style={{ color: "var(--status-red-primary)" }}>*</span>
        ) : null}
        <span style={{ color: "var(--neutral-on-surface-primary)" }}>
          {label}
        </span>
      </div>
    ) : null}
    {children}
    {error ? (
      <span
        style={{
          fontSize: "var(--text-body)",
          color: "var(--status-red-primary)",
        }}
      >
        {error}
      </span>
    ) : null}
    {!error && helperText ? (
      <span
        style={{
          fontSize: "var(--text-desc)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {helperText}
      </span>
    ) : null}
  </div>
);

const UnifiedInputShell = ({
  children,
  disabled = false,
  hasError = false,
  style = {},
  onFocus,
  onBlur,
}) => (
  <div
    style={{
      minHeight: "46px",
      height: "auto",
      width: "100%",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: `1px solid ${hasError
          ? "var(--status-red-primary)"
          : disabled
            ? "var(--neutral-line-outline)"
            : baseInputBorderColor
        }`,
      borderRadius: "10px",
      background: disabled
        ? "var(--neutral-surface-grey-lighter)"
        : "var(--neutral-surface-primary)",
      padding: "0 16px",
      transition: "border-color 0.2s ease, box-shadow 0.2s ease",
      boxSizing: "border-box",
      overflow: "visible",
      ...style,
    }}
    onFocus={onFocus}
    onBlur={onBlur}
  >
    {children}
  </div>
);

const PhoneInputField = ({
  label,
  required = false,
  value = "",
  onChange,
  disabled,
  error,
  helperText,
}) => {
  const normalizePhoneValue = (input) => {
    if (!input) return { countryCode: "+62", number: "" };
    const matched = COUNTRY_CODE_OPTIONS.find(
      (opt) => input.startsWith(`${opt.code} `) || input === opt.code
    );
    if (matched) {
      const nextNumber = input
        .replace(`${matched.code} `, "")
        .replace(matched.code, "")
        .trim();
      return { countryCode: matched.code, number: nextNumber };
    }
    return { countryCode: "+62", number: input.trim() };
  };

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [popoverPos, setPopoverPos] = useState({ top: 0, left: 0, width: 300, placement: "bottom" });
  const parsedValue = normalizePhoneValue(value);
  const selectedOption =
    COUNTRY_CODE_OPTIONS.find((opt) => opt.code === parsedValue.countryCode) ||
    COUNTRY_CODE_OPTIONS[0];
  const filteredOptions = COUNTRY_CODE_OPTIONS.filter((opt) => {
    const q = search.toLowerCase();
    return (
      opt.code.toLowerCase().includes(q) || opt.label.toLowerCase().includes(q)
    );
  });

  const emitChange = (nextCountryCode, nextNumber) => {
    const composed = nextNumber?.trim()
      ? `${nextCountryCode} ${nextNumber.trim()}`
      : nextCountryCode;
    onChange?.(composed);
  };

  const updatePopoverPosition = (el) => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const estimatedHeight = 400;
    const padding = 12;
    const openAbove = 
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    
    setPopoverPos({
      top: openAbove ? rect.top - estimatedHeight - padding : rect.bottom + padding,
      left: Math.min(rect.left, window.innerWidth - 316),
      width: Math.min(300, window.innerWidth - 32),
      placement: openAbove ? "top" : "bottom",
    });
  };

  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <UnifiedInputShell
        disabled={disabled}
        hasError={!!error}
        style={{ position: "relative", zIndex: isOpen ? 200 : "auto" }}
        onFocus={(e) => focusInputFrame(e.currentTarget)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) {
            blurInputFrame(e.currentTarget, !!disabled, !!error);
          }
        }}
      >
        <div style={{ position: "relative", flexShrink: 0 }}>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              if (disabled) return;
              const nextOpen = !isOpen;
              if (nextOpen) updatePopoverPosition(e.currentTarget);
              setIsOpen(nextOpen);
            }}
            style={{
              background: "transparent",
              border: "none",
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: disabled ? "not-allowed" : "pointer",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-primary)",
              fontSize: "var(--text-subtitle-1)",
              fontFamily: "Lato, sans-serif",
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: "18px", lineHeight: 1 }}>
              {selectedOption.flag}
            </span>
            <span style={{ whiteSpace: "nowrap" }}>{selectedOption.code}</span>
            <ChevronDownIcon
              size={18}
              color="var(--neutral-on-surface-secondary)"
              style={{
                transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            />
          </button>

          {isOpen && !disabled ? (
            <>
              <div
                style={{ position: "fixed", inset: 0, zIndex: 9998 }}
                onClick={() => {
                  setIsOpen(false);
                  setSearch("");
                }}
              />
              <div
                style={{
                  position: "fixed",
                  top: `${popoverPos.top}px`,
                  left: `${popoverPos.left}px`,
                  width: `${popoverPos.width}px`,
                  maxHeight: "400px",
                  display: "flex",
                  flexDirection: "column",
                  background: "var(--neutral-surface-primary)",
                  border: `1px solid ${baseInputBorderColor}`,
                  borderRadius: "16px",
                  boxShadow: "0px 8px 24px rgba(0, 0, 0, 0.12)",
                  zIndex: 9999,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    padding: "16px 20px",
                    borderBottom: `1px solid ${baseInputBorderColor}`,
                  }}
                >
                  <TableSearchField
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search country or code..."
                    width="100%"
                    minWidth="0"
                    fontSize="14px"
                  />
                </div>
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  {filteredOptions.map((opt, index) => (
                    <div
                      key={opt.code}
                      onClick={() => {
                        emitChange(opt.code, parsedValue.number);
                        setIsOpen(false);
                        setSearch("");
                      }}
                      onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "var(--neutral-surface-grey-lighter)")
                      }
                      onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "var(--neutral-surface-primary)")
                      }
                      style={{
                        borderTop:
                          index === 0
                            ? "none"
                            : `1px solid ${baseInputBorderColor}`,
                        padding: "12px 20px",
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        cursor: "pointer",
                      }}
                    >
                      <span style={{ fontSize: "20px", lineHeight: 1 }}>
                        {opt.flag}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--neutral-on-surface-primary)",
                          minWidth: "44px",
                        }}
                      >
                        {opt.code}
                      </span>
                      <span
                        style={{
                          fontSize: "14px",
                          color: "var(--neutral-on-surface-secondary)",
                        }}
                      >
                        {opt.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : null}
        </div>
        <input
          type="text"
          placeholder="Input phone number"
          value={parsedValue.number}
          onChange={(e) => {
            let nextValue = e.target.value;
            if (nextValue.startsWith("0")) {
              nextValue = nextValue.slice(1);
            }
            emitChange(selectedOption.code, nextValue);
          }}
          disabled={disabled}
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            padding: 0,
            background: "transparent",
            fontSize: "var(--text-subtitle-1)",
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : parsedValue.number
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            fontFamily: "Lato, sans-serif",
          }}
        />
      </UnifiedInputShell>
    </FormField>
  );
};

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
  const [viewDate, setViewDate] = useState(
    selectedDate || parseIsoDateString(todayIso) || new Date()
  );
  const [popoverPos, setPopoverPos] = useState({
    top: 0,
    left: 0,
    width: 360,
    placement: "bottom",
  });
  const [selectionMode, setSelectionMode] = useState("days"); // "days", "months", "years"

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = Math.max(
      360,
      Math.min(DATE_PICKER_POPOVER_WIDTH, window.innerWidth - 16)
    );
    const estimatedHeight = 360;
    const openAbove =
      window.innerHeight - rect.bottom < estimatedHeight + 16 &&
      rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const leftAlign = rect.left;
    const left = Math.min(Math.max(8, leftAlign), maxLeft);
    setPopoverPos({
      left,
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: openAbove ? "top" : "bottom",
    });
  };

  useEffect(() => {
    if (!isOpen) return;
    updatePopoverPosition();

    const handlePointerDown = (event) => {
      if (
        triggerRef.current?.contains(event.target) ||
        popoverRef.current?.contains(event.target)
      ) {
        return;
      }
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
          border: `1px solid ${
            hasError
              ? "var(--status-red-primary)"
              : isOpen
                ? "var(--feature-brand-primary)"
                : disabled
                  ? "var(--neutral-line-outline)"
                  : baseInputBorderColor
          }`,
          borderRadius,
          background: disabled
            ? "var(--neutral-surface-grey-lighter)"
            : "var(--neutral-surface-primary)",
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
        <span
          style={{
            fontSize,
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : value
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {value || placeholder}
        </span>
        <CalendarIcon
          size={18}
          color={
            disabled
              ? "var(--neutral-line-outline)"
              : "var(--neutral-on-surface-secondary)"
          }
        />
      </button>

      {isOpen ? (
        <div
          ref={popoverRef}
          style={{
            position: "fixed",
            top: `${popoverPos.top}px`,
            left: `${popoverPos.left}px`,
            width: `${popoverPos.width}px`,
            transform:
              popoverPos.placement === "top" ? "translateY(-100%)" : "none",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-2)",
            borderRadius: "12px",
            boxShadow: "0px 6px 15px -2px rgba(16, 24, 40, 0.08)",
            padding: "20px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 10020,
          }}
        >
          {selectionMode === "days" ? (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  margin: "4px 8px 8px",
                  border: "1px solid var(--neutral-line-separator-1)",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-primary)",
                }}
              >
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1)
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronLeftIcon size={18} color="var(--neutral-on-surface-secondary)" />
                </button>
                <div style={{ display: "flex", gap: "48px", alignItems: "center" }}>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("months")}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {monthLabel.substring(0, 3).toUpperCase()}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectionMode("years")}
                    style={{
                      border: "none",
                      background: "transparent",
                      fontSize: "var(--text-title-2)",
                      fontWeight: "var(--font-weight-bold)",
                      color: "var(--neutral-on-surface-primary)",
                      cursor: "pointer",
                      padding: "4px 8px",
                      borderRadius: "4px"
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    {yearLabel}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setViewDate(
                      new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1)
                    )
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    padding: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  <ChevronRightIcon
                    size={18}
                    color="var(--neutral-on-surface-secondary)"
                  />
                </button>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  rowGap: "8px",
                  columnGap: "16px",
                  paddingTop: "4px",
                }}
              >
                {DATE_PICKER_WEEKDAYS.map((weekday) => (
                  <div
                    key={weekday}
                    style={{
                      display: "flex",
                      justifyContent: "center",
                      padding: "8px 0",
                      fontSize: "var(--text-title-3)",
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {weekday}
                  </div>
                ))}
              </div>

              <div
                style={{
                  height: "4px",
                  background: "var(--neutral-surface-grey-lighter)",
                  width: "100%",
                }}
              />

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
                  rowGap: "8px",
                  columnGap: "16px",
                }}
              >
                {calendarDays.map((day) => {
                  const isSelected = day.iso === value;
                  const isToday = day.iso === todayIso;
                  
                  return (
                    <button
                      key={day.iso}
                      type="button"
                      onClick={() => {
                        onChange?.(createSyntheticInputEvent(day.iso));
                        setIsOpen(false);
                      }}
                      style={{
                        width: "34px",
                        height: "34px",
                        margin: "0 auto",
                        border: "none",
                        borderRadius: "999px",
                        background: isSelected
                          ? "var(--feature-brand-primary)"
                          : isToday
                            ? "var(--feature-brand-container)"
                            : "transparent",
                        color: isSelected
                          ? "var(--feature-brand-on-primary)"
                          : isToday
                            ? "var(--feature-brand-primary)"
                            : day.isCurrentMonth
                              ? "var(--neutral-on-surface-primary)"
                              : "var(--neutral-line-separator-2)",
                        fontSize: "var(--text-subtitle-1)",
                        fontWeight: isToday || isSelected ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                        cursor: "pointer",
                        position: "relative",
                      }}
                    >
                      {day.day}
                      {isToday && !isSelected && (
                        <div 
                          style={{
                            position: "absolute",
                            bottom: "4px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: "var(--feature-brand-primary)"
                          }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </>
          ) : selectionMode === "months" ? (
            <div style={{ padding: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {DATE_PICKER_MONTHS.map((m, idx) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(viewDate.getFullYear(), idx, 1));
                      setSelectionMode("days");
                    }}
                    style={{
                      padding: "12px 8px",
                      border: "none",
                      borderRadius: "8px",
                      background: viewDate.getMonth() === idx ? "var(--feature-brand-primary)" : "transparent",
                      color: viewDate.getMonth() === idx ? "var(--feature-brand-on-primary)" : "var(--neutral-on-surface-primary)",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ padding: "8px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                {Array.from({ length: 12 }, (_, i) => viewDate.getFullYear() - 5 + i).map(y => (
                  <button
                    key={y}
                    type="button"
                    onClick={() => {
                      setViewDate(new Date(y, viewDate.getMonth(), 1));
                      setSelectionMode("days");
                    }}
                    style={{
                      padding: "12px 8px",
                      border: "none",
                      borderRadius: "8px",
                      background: viewDate.getFullYear() === y ? "var(--feature-brand-primary)" : "transparent",
                      color: viewDate.getFullYear() === y ? "var(--feature-brand-on-primary)" : "var(--neutral-on-surface-primary)",
                      fontSize: "var(--text-title-3)",
                      fontWeight: "500",
                      cursor: "pointer"
                    }}
                  >
                    {y}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </>
  );
};

const DateRangeInputControl = ({
  value = { start: "", end: "" },
  onChange,
  disabled = false,
  hasError = false,
  placeholder = "yyyy-mm-dd - yyyy-mm-dd",
  fieldHeight = "48px",
  borderRadius = "10px",
  fontSize = "var(--text-subtitle-1)",
  style = {},
}) => {
  const triggerRef = useRef(null);
  const popoverRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const startObj = value.start ? parseIsoDateString(value.start) : null;
  const [viewDate, setViewDate] = useState(startObj || new Date());
  const [selecting, setSelecting] = useState("start");

  const [popoverPos, setPopoverPos] = useState({
    top: 0, left: 0, width: 660, placement: "bottom",
  });

  const updatePopoverPosition = () => {
    if (!triggerRef.current || typeof window === "undefined") return;
    const rect = triggerRef.current.getBoundingClientRect();
    const width = 660;
    const estimatedHeight = 360;
    const openAbove = window.innerHeight - rect.bottom < estimatedHeight + 16 && rect.top > estimatedHeight + 16;
    const maxLeft = Math.max(8, window.innerWidth - width - 8);
    const centeredLeft = rect.left + rect.width / 2 - width / 2;
    const left = Math.min(Math.max(8, centeredLeft), maxLeft);
    setPopoverPos({
      left,
      top: openAbove ? rect.top - 8 : rect.bottom + 8,
      width,
      placement: openAbove ? "top" : "bottom",
    });
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

  const nextMonthView = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1);
  const calendars = [
    { date: viewDate, days: buildCalendarDays(viewDate) },
    { date: nextMonthView, days: buildCalendarDays(nextMonthView) }
  ];

  const displayValue = value.start && value.end ? `${value.start} - ${value.end}` : value.start ? `${value.start} - ...` : "";

  const renderMonth = (monthDate, days, isFirst) => {
    const monthLabel = DATE_PICKER_MONTHS[monthDate.getMonth()];
    const yearLabel = monthDate.getFullYear();

    return (
      <div style={{ flex: 1, minWidth: "280px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", padding: "0 4px" }}>
          {isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronLeftIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
          <span style={{ fontWeight: "bold", fontSize: "16px", textTransform: "uppercase", letterSpacing: "1px" }}>{monthLabel} {yearLabel}</span>
          {!isFirst ? (
            <button type="button" onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))} style={{ border: "none", background: "transparent", cursor: "pointer", padding: "4px" }}><ChevronRightIcon size={20} /></button>
          ) : <div style={{ width: 28 }} />}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0", textAlign: "center", fontSize: "13px", color: "var(--neutral-on-surface-tertiary)", marginBottom: "8px" }}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} style={{ paddingBottom: "8px" }}>{d}</div>)}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0" }}>
          {days.map(day => {
            const inMonth = day.isCurrentMonth;
            const isStart = inMonth && day.iso === value.start;
            const isEnd = inMonth && day.iso === value.end;
            const inRange = inMonth && value.start && value.end && day.iso > value.start && day.iso < value.end;
            
            let borderRadiusStyle = "0";
            if (isStart && isEnd) borderRadiusStyle = "99px";
            else if (isStart) borderRadiusStyle = "99px 0 0 99px";
            else if (isEnd) borderRadiusStyle = "0 99px 99px 0";
            else if (!inRange) borderRadiusStyle = "99px";

            return (
              <button
                key={day.iso}
                type="button"
                onClick={() => {
                  if (!inMonth) return;
                  if (selecting === "start") {
                    onChange?.({ target: { value: { start: day.iso, end: "" } } });
                    setSelecting("end");
                  } else {
                    const range = day.iso < value.start ? { start: day.iso, end: value.start } : { start: value.start, end: day.iso };
                    onChange?.({ target: { value: range } });
                    setIsOpen(false);
                  }
                }}
                style={{
                  height: "40px",
                  border: "none",
                  borderRadius: borderRadiusStyle,
                  background: (isStart || isEnd) ? "var(--feature-brand-primary)" : inRange ? "var(--feature-brand-container-lighter)" : "transparent",
                  color: (isStart || isEnd) ? "#fff" : inMonth ? (inRange ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)") : "var(--neutral-line-separator-2)",
                  cursor: inMonth ? "pointer" : "default",
                  fontSize: "14px",
                  position: "relative",
                  fontWeight: (isStart || isEnd) ? "bold" : "normal",
                  transition: "background 0.2s"
                }}
              >
                {day.day}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setIsOpen((prev) => !prev);
          setSelecting("start");
        }}
        style={{
          width: "100%",
          height: fieldHeight,
          border: `1px solid ${hasError ? "var(--status-red-primary)" : isOpen ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
          borderRadius,
          background: "var(--neutral-surface-primary)",
          padding: "0 16px",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px",
          cursor: "pointer", textAlign: "left",
          ...style,
        }}
      >
        <span style={{ fontSize, color: value.start ? "var(--neutral-on-surface-primary)" : "var(--neutral-on-surface-tertiary)" }}>
          {displayValue || placeholder}
        </span>
        <CalendarIcon size={18} color="var(--neutral-on-surface-secondary)" />
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
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "16px",
            boxShadow: "var(--elevation-lg)",
            padding: "24px",
            zIndex: 10020,
            display: "flex",
            gap: "24px"
          }}
        >
          {calendars.map((cal, idx) => (
            <React.Fragment key={idx}>
              {renderMonth(cal.date, cal.days, idx === 0)}
              {idx === 0 && <div style={{ width: "1px", background: "var(--neutral-line-separator-2)", margin: "0 8px" }} />}
            </React.Fragment>
          ))}
        </div>
      )}
    </>
  );
};

function isRangePart(s, e) { return s || e; }

const InputField = ({
  label,
  required,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled,
  icon: Icon,
  max,
  maxLength,
  showCounter,
  multiline = false,
  error,
  helperText,
  ...rest
}) => (
  <FormField
    label={label}
    required={required}
    error={error}
    helperText={helperText}
  >
    <div style={{ position: "relative", width: "100%" }}>
      {multiline ? (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          disabled={disabled}
          maxLength={maxLength}
          {...rest}
          style={{
            minHeight: "100px",
            padding: showCounter ? "12px 16px 32px 16px" : "12px 16px",
            width: "100%",
            resize: "vertical",
            border: "1px solid transparent",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            ...inputFrameStyle(disabled, !!error),
            ...inputControlStyle(disabled, !!value),
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) => blurInputFrame(e.currentTarget, disabled, !!error)}
        />
      ) : type === "date" ? (
        <DateInputControl
          value={value}
          onChange={onChange}
          disabled={disabled}
          hasError={!!error}
          placeholder={placeholder || "yyyy-mm-dd"}
        />
      ) : (
        <input
          type={type === "number" ? "text" : type}
          placeholder={placeholder}
          value={type === "number" ? formatNumberWithCommas(value) : value}
          onChange={(e) => {
            if (type === "number") {
              const raw = parseNumberFromCommas(e.target.value);
              if (raw === "" || !isNaN(raw) || raw === "-") {
                onChange?.({
                  ...e,
                  target: { ...e.target, value: raw },
                });
              }
            } else {
              onChange?.(e);
            }
          }}
          disabled={disabled}
          max={max}
          maxLength={maxLength}
          {...rest}
          style={{
            height: "48px",
            padding: Icon ? "0 40px 0 16px" : showCounter ? "0 60px 0 16px" : "0 16px",
            border: "1px solid transparent",
            background: disabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            ...inputFrameStyle(disabled, !!error),
            ...inputControlStyle(disabled, !!value),
            cursor: disabled ? "not-allowed" : "text",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) => blurInputFrame(e.currentTarget, disabled, !!error)}
        />
      )}
      {showCounter && maxLength && (
        <div
          style={{
            position: "absolute",
            right: "12px",
            bottom: multiline ? "12px" : "50%",
            transform: multiline ? "none" : "translateY(50%)",
            fontSize: "12px",
            color: "var(--neutral-on-surface-tertiary)",
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {String(value || "").length}/{maxLength}
        </div>
      )}
      {Icon && type !== "date" ? (
        <Icon
          size={20}
          color={
            disabled
              ? "var(--neutral-line-outline)"
              : "var(--neutral-on-surface-tertiary)"
          }
          style={{
            position: "absolute",
            right: "16px",
            top: "50%",
            transform: "translateY(-50%)",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  </FormField>
);

const openDocumentLink = (doc, fallbackHandler) => {
  if (doc?.previewUrl && typeof window !== "undefined") {
    window.open(doc.previewUrl, "_blank", "noopener,noreferrer");
    return;
  }
  fallbackHandler?.(doc);
};

const UploadDropzone = ({
  multiple = false,
  accept = ".pdf,.jpg,.jpeg,.png,.webp",
  maxFiles = 1,
  maxText,
  allowedText = "Allowed formats (PDF, JPG, JPEG, PNG, WebP)",
  disabled = false,
  error = "",
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
        border: `2px dashed ${error ? "var(--status-red-primary)" : "var(--feature-brand-primary)"
          }`,
        background: "var(--neutral-surface-primary)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "24px",
        textAlign: "center",
        boxSizing: "border-box",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.55 : 1,
      }}
    >
      <CloudUploadIcon
        size={40}
        color={
          error ? "var(--status-red-primary)" : "var(--feature-brand-primary)"
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
          color: "var(--neutral-on-surface-primary)",
          lineHeight: "18px",
          letterSpacing: "0.0825px",
        }}
      >
        Drag file or{" "}
        <span style={{ color: "var(--feature-brand-primary)" }}>
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
              gap: "2px",
              fontSize: "var(--text-title-2)",
            }}
          >
            {descriptionRequired ? (
              <span style={{ color: "var(--status-red-primary)" }}>*</span>
            ) : null}
            <span style={{ color: "var(--neutral-on-surface-primary)" }}>
              File Description
            </span>
          </div>
          <span
            style={{
              fontSize: "var(--text-title-2)",
              color: "var(--neutral-on-surface-tertiary)",
            }}
          >
            {(file?.description || "").length}/{FILE_DESCRIPTION_MAX_LENGTH}
          </span>
        </div>
        <input
          type="text"
          value={file?.description || ""}
          maxLength={FILE_DESCRIPTION_MAX_LENGTH}
          placeholder="Enter File Description"
          onChange={(e) => onDescriptionChange?.(e.target.value)}
          style={{
            height: "48px",
            padding: "0 16px",
            width: "100%",
            ...inputFrameStyle(false, !!descriptionError),
            ...inputControlStyle(false, !!file?.description),
            background: "var(--neutral-surface-primary)",
          }}
          onFocus={(e) => focusInputFrame(e.currentTarget)}
          onBlur={(e) =>
            blurInputFrame(e.currentTarget, false, !!descriptionError)
          }
        />
        {descriptionError ? (
          <span
            style={{
              fontSize: "var(--text-body)",
              color: "var(--status-red-primary)",
            }}
          >
            {descriptionError}
          </span>
        ) : null}
      </div>
    ) : null}
  </div>
);

const ImageUploadField = ({
  label = "Images",
  images = [],
  maxFiles = 1,
  disabled = false,
  error = "",
  helperText = "",
  onFilesSelected,
  onRemove,
}) => {
  const normalizedImages = images
    .map((image) => createImageUploadRecord(image))
    .filter(Boolean)
    .slice(0, maxFiles);
  const canAddMore = !disabled && normalizedImages.length < maxFiles;

  const handleIncomingFiles = (fileList) => {
    if (disabled) return;
    const nextFiles = Array.from(fileList || []).slice(
      0,
      Math.max(0, maxFiles - normalizedImages.length)
    );
    if (nextFiles.length === 0) return;
    onFilesSelected?.(nextFiles);
  };

  const renderEmptyTile = () => (
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
        width: "120px",
        height: "120px",
        borderRadius: "12px",
        border: `1px dashed ${error ? "var(--status-red-primary)" : "#A9A9A9"}`,
        background: "var(--neutral-surface-primary)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: disabled ? "not-allowed" : "pointer",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: "36px",
          height: "36px",
          borderRadius: "999px",
          background: "var(--neutral-surface-grey-lighter)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AddIcon size={20} color="var(--neutral-on-surface-tertiary)" />
      </div>
      <input
        type="file"
        accept=".jpg,.jpeg,.png,.webp"
        multiple={maxFiles > 1}
        disabled={disabled}
        style={{ display: "none" }}
        onChange={(e) => {
          handleIncomingFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </label>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        {label}
      </span>

      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        {normalizedImages.map((image, index) => {
          const previewUrl = getImageUploadPreviewUrl(image);
          const imageName = getImageUploadName(image);
          return (
            <div
              key={image.id || `${imageName}-${index}`}
              style={{
                position: "relative",
                width: "120px",
                height: "120px",
                borderRadius: "12px",
                border:
                  index === 0
                    ? "2px solid var(--feature-brand-primary)"
                    : "1px solid var(--neutral-line-separator-2)",
                padding: "4px",
                background: "var(--neutral-surface-primary)",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "12px",
                  background: "var(--neutral-surface-grey-lighter)",
                  overflow: "hidden",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={imageName}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span
                    style={{
                      padding: "0 10px",
                      textAlign: "center",
                      fontSize: "var(--text-body)",
                      color: "var(--neutral-on-surface-secondary)",
                      lineHeight: "18px",
                      wordBreak: "break-word",
                    }}
                  >
                    {imageName || "Image"}
                  </span>
                )}
              </div>
              {!disabled ? (
                <button
                  type="button"
                  onClick={() => onRemove?.(image)}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    right: "-10px",
                    width: "28px",
                    height: "28px",
                    borderRadius: "999px",
                    border: "1px solid var(--status-red-primary)",
                    background: "var(--neutral-surface-primary)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    padding: 0,
                  }}
                >
                  <CloseIcon size={14} color="var(--status-red-primary)" />
                </button>
              ) : null}
            </div>
          );
        })}

        {canAddMore ? renderEmptyTile() : null}
      </div>

      {error ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--status-red-primary)",
          }}
        >
          {error}
        </span>
      ) : null}

      {helperText ? (
        <span
          style={{
            fontSize: "var(--text-body)",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

const ProofDocumentList = ({ documents = [], onDocumentClick }) => {
  const normalizedDocuments = normalizeProofDocuments(documents);

  if (normalizedDocuments.length === 0) {
    return (
      <span
        style={{
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-secondary)",
        }}
      >
        -
      </span>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        gap: "8px",
      }}
    >
      {normalizedDocuments.map((doc, index) => (
        <div
          key={doc.id || `${doc.name}-${index}`}
          style={{ display: "flex", alignItems: "center", gap: "12px" }}
        >
          <DocumentTypeBadge
            fileName={doc.name}
            type={doc.type}
            size="compact"
          />
          <button
            type="button"
            onClick={() => openDocumentLink(doc, onDocumentClick)}
            style={{
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              alignItems: "flex-start",
              background: "transparent",
              border: "none",
              padding: 0,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <span
              style={{
                fontSize: "var(--text-title-3)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--feature-brand-primary)",
                lineHeight: "20px",
                letterSpacing: "0.09625px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {getDocumentPrimaryLabel(doc)}
            </span>
            <span
              style={{
                fontSize: "var(--text-body)",
                color: "var(--feature-brand-primary)",
                lineHeight: "18px",
                letterSpacing: "0.0825px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {doc.name}
            </span>
          </button>
        </div>
      ))}
    </div>
  );
};

const InputGroup = ({
  label,
  required = false,
  prefix,
  suffix,
  value,
  onChange,
  placeholder,
  disabled = false,
  type = "text",
  hasError = false,
  error,
  helperText,
  inputStyle = {},
  containerStyle = {},
  prefixStyle = {},
  suffixStyle = {},
  ...rest
}) => {
  return (
    <FormField
      label={label}
      required={required}
      error={error}
      helperText={helperText}
    >
      <UnifiedInputShell
        disabled={disabled}
        hasError={hasError || !!error}
        style={containerStyle}
        onFocus={(e) => focusInputFrame(e.currentTarget)}
        onBlur={(e) =>
          blurInputFrame(e.currentTarget, disabled, hasError || !!error)
        }
      >
        {prefix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...prefixStyle,
            }}
          >
            {prefix}
          </span>
        ) : null}

        <input
          type={type === "number" ? "text" : type}
          value={type === "number" ? formatNumberWithCommas(value) : value}
          onChange={(e) => {
            if (type === "number") {
              const rawValue = parseNumberFromCommas(e.target.value);
              if (rawValue === "" || !isNaN(rawValue) || rawValue === "-") {
                onChange({ ...e, target: { ...e.target, value: rawValue } });
              }
            } else {
              onChange(e);
            }
          }}
          placeholder={placeholder}
          disabled={disabled}
          {...rest}
          style={{
            flex: 1,
            height: "100%",
            minWidth: 0,
            border: "none",
            outline: "none",
            background: "transparent",
            padding: 0,
            fontSize: "var(--text-subtitle-1)",
            color: disabled
              ? "var(--neutral-on-surface-tertiary)"
              : value
                ? "var(--neutral-on-surface-primary)"
                : "var(--neutral-on-surface-tertiary)",
            fontFamily: "Lato, sans-serif",
            boxSizing: "border-box",
            ...inputStyle,
          }}
        />

        {suffix ? (
          <span
            style={{
              fontSize: "var(--text-subtitle-1)",
              color: disabled
                ? "var(--neutral-on-surface-tertiary)"
                : "var(--neutral-on-surface-secondary)",
              whiteSpace: "nowrap",
              flexShrink: 0,
              ...suffixStyle,
            }}
          >
            {suffix}
          </span>
        ) : null}
      </UnifiedInputShell>
    </FormField>
  );
};

const SectionCard = ({ title, children, rightAction }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    }}
  >
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "4px",
            height: "20px",
            background: "var(--feature-brand-primary)",
            borderRadius: "2px",
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {title}
        </h2>
      </div>
      {rightAction ? <div>{rightAction}</div> : null}
    </div>
    {children}
  </div>
);

const Card = ({ children, style = {} }) => (
  <div
    style={{
      background: "var(--neutral-surface-primary)",
      borderRadius: "var(--radius-card)",
      border: "1px solid var(--neutral-line-separator-1)",
      padding: "24px",
      display: "flex",
      flexDirection: "column",
      gap: "20px",
      ...style,
    }}
  >
    {children}
  </div>
);

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

const systemTableShellStyle = {
  display: "flex",
  flexDirection: "column",
  border: "1px solid var(--neutral-line-separator-1)",
  borderRadius: "12px",
  overflow: "hidden",
  background: "var(--neutral-surface-primary)",
};

const systemTableHeaderCellStyle = (overrides = {}) => ({
  minWidth: 0,
  height: "49px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

const systemTableCellStyle = (overrides = {}) => ({
  minWidth: 0,
  minHeight: "56px",
  display: "flex",
  alignItems: "center",
  padding: "0 12px",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  boxSizing: "border-box",
  ...overrides,
});

const systemTableEmptyStateStyle = {
  padding: "32px 24px",
  textAlign: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-tertiary)",
};

const poReferenceTableFrameStyle = {
  border: "none",
  borderRadius: "0",
  overflow: "hidden",
  width: "100%",
};

const poReferenceTableScrollerStyle = {
  overflowX: "auto",
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

const tabButtonStyle = (isActive) => ({
  height: "40px",
  padding: "0 18px",
  borderRadius: "100px",
  border: isActive
    ? "1px solid var(--feature-brand-primary)"
    : "1px solid transparent",
  background: isActive
    ? "var(--neutral-surface-primary)"
    : "rgba(255,255,255,0.56)",
  color: isActive
    ? "var(--feature-brand-primary)"
    : "var(--neutral-on-surface-secondary)",
  fontSize: "var(--text-title-3)",
  fontWeight: isActive
    ? "var(--font-weight-bold)"
    : "var(--font-weight-regular)",
  cursor: "pointer",
});

const summaryMetricLabelStyle = {
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-secondary)",
};

const summaryMetricValueStyle = {
  fontSize: "var(--text-title-3)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-secondary)",
};

const summaryTotalLabelStyle = {
  fontSize: "var(--text-title-1)",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-primary)",
};

const summaryTotalValueStyle = {
  fontSize: "var(--text-title-1)",
  fontWeight: "var(--font-weight-black)",
  color: "var(--neutral-on-surface-primary)",
};


export const PurchaseOrderCreatePage = ({
  onNavigate,
  isSidebarCollapsed = false,
  initialData,
  poApprovalSettings,
  showPoSnackbar,
}) => {
  const scrollToTop = () => {
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const navigateWithReset = (cb, ...args) => {
    scrollToTop();
    cb(...args);
  };
  const pageTopRef = useRef(null);
  const navigateBackWithoutPrompt = () => {
    if (initialData?.source === "work_order_vendor_assignment") {
      if (initialData?.returnTo) {
        onNavigate(
          initialData.returnTo.view || "detail",
          initialData.returnTo.data
        );
        return;
      }
      onNavigate("list");
      return;
    }
    if (
      initialData?.source === "edit_purchase_order" &&
      initialData?.poNumber
    ) {
      onNavigate("po_detail", {
        ...buildPoPayload("Draft", "grey-light"),
        poNumber: initialData.poNumber,
      });
      return;
    }
    onNavigate("list");
  };

  const handleBackNavigation = () => {
    if (isFormDirty) {
      setShowDiscardChangesModal(true);
      return;
    }
    navigateBackWithoutPrompt();
  };

  const isFromWorkOrderAssignment =
    initialData?.source === "work_order_vendor_assignment";
  const isEditMode = initialData?.source === "edit_purchase_order";
  const isReviseMode = initialData?.source === "revise_purchase_order";
  const editFormData = initialData?.formData || null;
  const prefilledVendor = initialData?.vendorData || null;
  const linkedWorkOrder =
    initialData?.workOrder ||
    (initialData?.returnTo?.data
      ? {
        wo: initialData.returnTo.data.wo,
        product: initialData.returnTo.data.product,
        sku: initialData.returnTo.data.sku,
        image: initialData.returnTo.data.image || "",
      }
      : null);
  const linkedOutsourceSteps =
    initialData?.outsourceSteps ||
    initialData?.returnTo?.data?.outsourceSteps ||
    [];
  const linkedRoutingStages =
    initialData?.routingStages ||
    initialData?.returnTo?.data?.routingStages ||
    [
      { step: 1, op: "Cutting" },
      { step: 2, op: "Furniture Making" },
      { step: 3, op: "Assemble" },
      { step: 4, op: "Paint" },
      { step: 5, op: "Polish" },
      { step: 6, op: "Packing" },
    ];
    const buildLinkedWorkOrderDescription = (
      workOrderNo,
      steps = [],
      stageRows = []
    ) => {
      const normalizedSteps = Array.from(
        new Set(
          (steps || [])
            .map((step) => Number(step))
            .filter((step) => Number.isFinite(step))
        )
      ).sort((a, b) => a - b);
      const baseDescription = `Generated from ${workOrderNo || "work order"}. It covers these routing stages:`;

      if (normalizedSteps.length === 0) return `Generated from ${workOrderNo || "work order"}.`;

      const stageLabels = normalizedSteps.map((step) => {
        const matchedStage = (stageRows || []).find(
          (stage) => Number(stage.step) === step
        );
        const operationName = matchedStage?.op || matchedStage?.operation;
        return operationName ? operationName : `routing step ${step}`;
      });
      const stackedLabels = stageLabels.map((label) => `- ${label}`).join("\n");
      return `${baseDescription}\n${stackedLabels}`;
    };
  const generatedWorkOrderDescription = buildLinkedWorkOrderDescription(
    linkedWorkOrder?.wo,
    linkedOutsourceSteps,
    linkedRoutingStages
  );
  const getWorkOrderSourceId = (line) =>
    line?.sourceWorkOrderLineId || line?.id || "";
  const linkedAssignedOutput =
    parseInt(
      initialData?.assignedOutput ||
      editFormData?.lines?.find((line) => line.type === "wo")?.qty ||
      0,
      10
    ) || 0;

  const [vendorSearch, setVendorSearch] = useState(
    editFormData?.vendorName || prefilledVendor?.name || ""
  );
  const [vendorDetails, setVendorDetails] = useState({
    phone: editFormData?.vendorDetails?.phone || prefilledVendor?.phone || "",
    email: editFormData?.vendorDetails?.email || prefilledVendor?.email || "",
    address:
      editFormData?.vendorDetails?.address || prefilledVendor?.address || "",
  });
  const [isVendorLocked, setIsVendorLocked] = useState(
    (!!prefilledVendor && isFromWorkOrderAssignment) ||
    ((isEditMode || isReviseMode) && MOCK_VENDORS.some((v) => v.name === editFormData?.vendorName))
  );
  const [showVendorSuggestions, setShowVendorSuggestions] = useState(false);
  const [isVendorFieldFocused, setIsVendorFieldFocused] = useState(false);
  const [productModalImages, setProductModalImages] = useState([]);
  const [shipToInfo, setShipToInfo] = useState(
    editFormData?.shipTo || {
      name: "",
      phone: "",
      email: "",
      address: "",
    }
  );
  const [poDate, setPoDate] = useState(
    editFormData?.poDate ||
    initialData?.createdDate ||
    new Date().toISOString().split("T")[0]
  );
  const [deliveryDate, setDeliveryDate] = useState(
    editFormData?.deliveryDate || initialData?.expectedDeliveryDate || ""
  );
  const [currency, setCurrency] = useState(editFormData?.currency || "IDR");
  const [notes, setNotes] = useState(editFormData?.notes || "");
  const [terms, setTerms] = useState(editFormData?.terms || "");
  const [tax, setTax] = useState(String(editFormData?.tax ?? 11));
  const [feeLines, setFeeLines] = useState(
    editFormData?.feeLines?.length
      ? editFormData.feeLines
      : [{ id: "fee-1", name: "", amount: "" }]
  );
  const [formErrors, setFormErrors] = useState({});
  const [showEmptyDraftModal, setShowEmptyDraftModal] = useState(false);
  const [showSubmitConfirmModal, setShowSubmitConfirmModal] = useState(false);
  const [revisionReason, setRevisionReason] = useState("");
  const [revisionReasonError, setRevisionReasonError] = useState("");
  const [showDiscardChangesModal, setShowDiscardChangesModal] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [isVendorEditingEnabled, setIsVendorEditingEnabled] = useState(false);
  const [showVendorEditConfirm, setShowVendorEditConfirm] = useState(false);
  const [productLineType, setProductLineType] = useState("manual");
  const [productModalForm, setProductModalForm] = useState({
    manualName: "",
    manualCode: "",
    manualDesc: "",
    manualQty: "",
    manualPrice: "",
    selectedWorkOrderLineId: "",
    selectedMaterialLineId: "",
  });
  const [productModalFieldErrors, setProductModalFieldErrors] = useState({});
  const [productModalError, setProductModalError] = useState("");
  const [editingLineId, setEditingLineId] = useState(null);

  const [lines, setLines] = useState(() => {
    if (editFormData?.lines?.length) return editFormData.lines;
    if (isFromWorkOrderAssignment) {
      return [
        {
          id: 1,
          type: "wo",
          item: linkedWorkOrder?.product || "Cabinet Premium",
          code: linkedWorkOrder?.sku || "-",
          desc: generatedWorkOrderDescription,
          qty: linkedAssignedOutput,
          price: 250000,
          woRef: linkedWorkOrder?.wo || "-",
          lockedFromWorkOrder: true,
          sourceWorkOrderLineId: "generated-work-order-line",
        },
      ];
    }
    return [];
  });

  const editingLine = editingLineId
    ? lines.find((line) => line.id === editingLineId) || null
    : null;
  const isEditingLockedWorkOrderLine = !!editingLine?.lockedFromWorkOrder;

  const vendorSuggestions = MOCK_VENDORS.filter((vendor) =>
    vendor.name.toLowerCase().includes(vendorSearch.toLowerCase())
  );
  const vendorHasExactMatch = MOCK_VENDORS.some(
    (vendor) => vendor.name.toLowerCase() === vendorSearch.trim().toLowerCase()
  );
  const selectedVendorRecord =
    MOCK_VENDORS.find(
      (vendor) =>
        vendor.name.toLowerCase() === vendorSearch.trim().toLowerCase()
    ) ||
    prefilledVendor ||
    null;
  const hasLinkedWorkOrder = !!(
    linkedWorkOrder?.wo || linkedWorkOrder?.product
  );
  const generatedWorkOrderLine = hasLinkedWorkOrder
    ? {
      id: "generated-work-order-line",
      sourceWorkOrderLineId: "generated-work-order-line",
      vendorId:
        selectedVendorRecord?.id || prefilledVendor?.id || "generated-vendor",
      item: linkedWorkOrder?.product || "Cabinet Premium",
      code: linkedWorkOrder?.sku || "-",
      desc: generatedWorkOrderDescription,
      woRef: linkedWorkOrder?.wo || "-",
      qty: linkedAssignedOutput,
      price: 250000,
      image: linkedWorkOrder?.image || null,
    }
    : null;
  const vendorSpecificWorkOrderLines = selectedVendorRecord
    ? MOCK_WO_LINES.filter((line) => line.vendorId === selectedVendorRecord.id)
    : [];
  const preservedWorkOrderLines = lines
    .filter((line) => line.type === "wo")
    .map((line) => ({
      ...line,
      sourceWorkOrderLineId: getWorkOrderSourceId(line),
      vendorId:
        selectedVendorRecord?.id || prefilledVendor?.id || "preserved-vendor",
      image:
        line.image ||
        linkedWorkOrder?.image ||
        null,
    }));
  const availableWorkOrderLines = [];
  [
    ...(generatedWorkOrderLine ? [generatedWorkOrderLine] : []),
    ...vendorSpecificWorkOrderLines,
    ...preservedWorkOrderLines,
  ].forEach((line) => {
    const sourceId = getWorkOrderSourceId(line);
    if (
      !sourceId ||
      availableWorkOrderLines.some(
        (entry) => getWorkOrderSourceId(entry) === sourceId
      )
    )
      return;
    availableWorkOrderLines.push({
      ...line,
      sourceWorkOrderLineId: sourceId,
    });
  });
  const availableMaterialLines = MOCK_MATERIALS_DATA.map((m) => ({
    id: m.id,
    item: m.name,
    code: m.sku,
    price: m.averageCost,
    uom: m.unit,
    desc: m.description,
    image: m.image,
  }));
  const selectedMaterialLine = productModalForm.selectedMaterialLineId
    ? availableMaterialLines.find(
      (line) => line.id === productModalForm.selectedMaterialLineId
    ) || null
    : null;

  const subtotal = lines.reduce(
    (acc, line) =>
      acc + (parseFloat(line.qty) || 0) * (parseFloat(line.price) || 0),
    0
  );
  const hasPrefilledDraftContent =
    isFromWorkOrderAssignment &&
    (!!vendorSearch.trim() ||
      !!deliveryDate ||
      !!poDate ||
      lines.length > 0 ||
      !!vendorDetails.phone.trim() ||
      !!vendorDetails.email.trim() ||
      !!vendorDetails.address.trim());
  const taxAmount = subtotal * ((parseFloat(tax) || 0) / 100);
  const activeFeeLines = feeLines.filter(
    (fee) => fee.name.trim() || (parseFloat(fee.amount) || 0) > 0
  );
  const feesAmount = feeLines.reduce(
    (acc, fee) => acc + (parseFloat(fee.amount) || 0),
    0
  );
  const total = subtotal + taxAmount + feesAmount;

  const buildFormDirtySnapshot = () => ({
    vendorSearch: vendorSearch.trim(),
    vendorDetails: {
      phone: vendorDetails.phone.trim(),
      email: vendorDetails.email.trim(),
      address: vendorDetails.address.trim(),
    },
    shipToInfo: {
      name: shipToInfo.name.trim(),
      phone: shipToInfo.phone.trim(),
      email: shipToInfo.email.trim(),
      address: shipToInfo.address.trim(),
    },
    poDate: poDate || "",
    deliveryDate: deliveryDate || "",
    currency: currency || "",
    notes: notes.trim(),
    terms: terms.trim(),
    tax: String(tax || ""),
    feeLines: feeLines.map((fee) => ({
      id: fee.id,
      name: fee.name.trim(),
      amount: String(fee.amount || ""),
    })),
    lines: lines.map((line) => ({
      id: line.id,
      type: line.type,
      item: line.item || "",
      code: line.code || "",
      desc: line.desc || "",
      woRef: line.woRef || "-",
      qty: Number(line.qty) || 0,
      price: Number(line.price) || 0,
      image: line.image || "",
      uom: line.uom || "",
      lockedFromWorkOrder: !!line.lockedFromWorkOrder,
      sourceWorkOrderLineId: line.sourceWorkOrderLineId || "",
      sourceMaterialLineId: line.sourceMaterialLineId || "",
    })),
  });

  const initialDirtySnapshotRef = React.useRef(null);
  if (initialDirtySnapshotRef.current === null) {
    initialDirtySnapshotRef.current = JSON.stringify(buildFormDirtySnapshot());
  }

  const isFormDirty =
    JSON.stringify(buildFormDirtySnapshot()) !==
    initialDirtySnapshotRef.current;

  const validateMandatoryFields = () => {
    const nextErrors = {};
    if (!vendorSearch.trim()) nextErrors.vendor = "Field cannot be empty";
    if (!poDate) nextErrors.poDate = "Field cannot be empty";
    if (!currency) nextErrors.currency = "Field cannot be empty";
    if (!lines.length) nextErrors.lines = "Add at least one product line";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const buildPoPayload = (status, badge) => ({
    poNumber:
      initialData?.poNumber ||
      `PO-202603-${String(Math.floor(1000 + Math.random() * 9000))}`,
    vendorName: vendorSearch || "-",
    amount: formatCurrency(total),
    createdDate: poDate,
    status,
    statusKey:
      status === "Draft"
        ? "draft"
        : status === "Waiting for Approval"
          ? "ready_to_send"
          : "issued",
    sBadge: badge,
    ...(initialData?.from ? { from: initialData.from } : {}),
    ...(initialData?.returnTo ? { returnTo: initialData.returnTo } : {}),
    formData: {
      vendorName: vendorSearch,
      vendorDetails,
      poDate,
      deliveryDate,
      currency,
      lines,
      tax: parseFloat(tax) || 0,
      feeLines,
      notes,
      terms,
      shipTo: shipToInfo,
    },
  });

  const handleVendorInputChange = (value) => {
    setVendorSearch(value);
    setShowVendorSuggestions(true);

    const trimmedValue = value.trim();
    const exactMatch = MOCK_VENDORS.find(
      (vendor) => vendor.name.toLowerCase() === trimmedValue.toLowerCase()
    );

    if (!trimmedValue) {
      setVendorDetails({ phone: "", email: "", address: "" });
      setIsVendorLocked(false);
      return;
    }

    if (exactMatch) {
      setVendorDetails({
        phone: exactMatch.phone,
        email: exactMatch.email,
        address: exactMatch.address,
      });
      setIsVendorLocked(true);
      return;
    }

    setVendorDetails((prev) => {
      const hasLockedVendorData = prev.phone || prev.email || prev.address;
      return hasLockedVendorData ? { phone: "", email: "", address: "" } : prev;
    });
    setIsVendorLocked(false);
  };

  const handleAddNewVendorOption = () => {
    const trimmedValue = vendorSearch.trim();
    if (!trimmedValue) return;
    setVendorSearch(trimmedValue);
    setVendorDetails({ phone: "", email: "", address: "" });
    setIsVendorLocked(false);
    setIsVendorFieldFocused(false);
    setShowVendorSuggestions(false);
  };

  const handleSelectVendorSuggestion = (vendor) => {
    setVendorSearch(vendor.name);
    setVendorDetails({
      phone: vendor.phone,
      email: vendor.email,
      address: vendor.address,
    });
    setIsVendorLocked(true);
    setIsVendorFieldFocused(false);
    setShowVendorSuggestions(false);
  };

  const handleUseCompanyDetail = () => {
    setShipToInfo({
      name: MOCK_COMPANY.name,
      phone: MOCK_COMPANY.phone,
      email: MOCK_COMPANY.email,
      address: MOCK_COMPANY.address,
    });
  };

  const handleAddFeeLine = () => {
    if (feeLines.length < 5) {
      setFeeLines((prev) => [
        ...prev,
        { id: `fee-${Date.now()}`, name: "", amount: "" },
      ]);
    }
  };
  const handleFeeChange = (feeId, key, value) =>
    setFeeLines((prev) =>
      prev.map((fee) => (fee.id === feeId ? { ...fee, [key]: value } : fee))
    );
  const handleRemoveFeeLine = (feeId) =>
    setFeeLines((prev) =>
      prev.length === 1
        ? [{ id: "fee-1", name: "", amount: "" }]
        : prev.filter((fee) => fee.id !== feeId)
    );

  const openAddProductModal = () => {
    setEditingLineId(null);
    setProductLineType("manual");
    setProductModalForm({
      manualName: "",
      manualCode: "",
      manualDesc: "",
      manualQty: "",
      manualPrice: "",
      selectedWorkOrderLineId: "",
      selectedMaterialLineId: "",
    });
    setProductModalImages([]);
    setProductModalFieldErrors({});
    setProductModalError("");
    setShowAddProductModal(true);
  };

  const handleEditVendorClick = () => {
    const hasWoLines = lines.some((line) => line.type === "wo");
    if (hasWoLines) {
      setShowVendorEditConfirm(true);
    } else {
      setIsVendorEditingEnabled(true);
    }
  };

  const handleConfirmVendorEdit = () => {
    setLines(lines.filter((line) => line.type !== "wo"));
    setIsVendorEditingEnabled(true);
    setShowVendorEditConfirm(false);
  };

  const handleEditLine = (line) => {
    setEditingLineId(line.id);
    const isWo = line.type === "wo";
    const isMaterial = line.type === "material";
    const matchedWorkOrderLine = isWo
      ? availableWorkOrderLines.find(
        (wo) =>
          (line.sourceWorkOrderLineId &&
            getWorkOrderSourceId(wo) === line.sourceWorkOrderLineId) ||
          (wo.item === line.item && wo.woRef === line.woRef)
      )
      : null;
    const matchedMaterialLine = isMaterial
      ? availableMaterialLines.find(
        (material) =>
          (line.sourceMaterialLineId && material.id === line.sourceMaterialLineId) ||
          (material.item === line.item && material.code === line.code)
      )
      : null;
    const fallbackGeneratedLineId =
      line.lockedFromWorkOrder && generatedWorkOrderLine
        ? getWorkOrderSourceId(generatedWorkOrderLine)
        : "";

    setProductLineType(isWo ? "wo" : isMaterial ? "material" : "manual");
    setProductModalForm({
      manualName: line.item || "",
      manualCode: line.code || "",
      manualDesc: line.desc || "",
      manualQty: line.qty ? String(line.qty) : "",
      manualPrice: line.price ? String(line.price) : "",
      selectedWorkOrderLineId: isWo
        ? getWorkOrderSourceId(matchedWorkOrderLine) ||
        line.sourceWorkOrderLineId ||
        fallbackGeneratedLineId
        : "",
      selectedMaterialLineId: isMaterial
        ? matchedMaterialLine?.id || line.sourceMaterialLineId || ""
        : "",
    });
    setProductModalImages(
      line.image
        ? [createImageUploadRecord(line.image)]
        : line.lockedFromWorkOrder && generatedWorkOrderLine?.image
          ? [createImageUploadRecord(generatedWorkOrderLine.image)]
          : matchedMaterialLine?.image
            ? [createImageUploadRecord(matchedMaterialLine.image)]
          : []
    );
    setProductModalFieldErrors({});
    setProductModalError("");
    setShowAddProductModal(true);
  };

  const handleSaveProductLine = () => {
    if (productLineType === "manual") {
      const nextErrors = {};
      if (!productModalForm.manualName.trim())
        nextErrors.manualName = "Field cannot be empty";
      if (!productModalForm.manualQty || parseInt(productModalForm.manualQty, 10) <= 0)
        nextErrors.manualQty = "Quantity must be greater than 0";
      if (!productModalForm.manualPrice)
        nextErrors.manualPrice = "Field cannot be empty";
      setProductModalFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0) return;

      const nextLine = {
        id: editingLineId || `manual-${Date.now()}`,
        type: "manual",
        item: productModalForm.manualName,
        code: productModalForm.manualCode || "-",
        desc: productModalForm.manualDesc || "-",
        woRef: "-",
        qty: parseInt(productModalForm.manualQty, 10) || 0,
        price: parseInt(productModalForm.manualPrice, 10) || 0,
        image: productModalImages[0] || null,
        uom: "",
        lockedFromWorkOrder: false,
        sourceWorkOrderLineId: "",
        sourceMaterialLineId: "",
      };

      setLines((prev) =>
        editingLineId
          ? prev.map((line) =>
            line.id === editingLineId ? { ...line, ...nextLine } : line
          )
          : [...prev, nextLine]
      );
      setShowAddProductModal(false);
      setEditingLineId(null);
      setProductModalFieldErrors({});
      return;
    }

    if (productLineType === "material") {
      const targetLine = availableMaterialLines.find(
        (line) => line.id === productModalForm.selectedMaterialLineId
      );
      const nextErrors = {};
      if (!productModalForm.selectedMaterialLineId)
        nextErrors.selectedMaterialLineId = "Field cannot be empty";
      if (!productModalForm.manualPrice)
        nextErrors.manualPrice = "Field cannot be empty";
      if (!productModalForm.manualQty || parseInt(productModalForm.manualQty, 10) <= 0)
        nextErrors.manualQty = "Quantity must be greater than 0";
      if (!productModalForm.manualPrice)
        nextErrors.manualPrice = "Field cannot be empty";
      setProductModalFieldErrors(nextErrors);
      if (Object.keys(nextErrors).length > 0 || !targetLine) return;

      const nextLine = {
        id: editingLineId || `material-${Date.now()}`,
        type: "material",
        item: targetLine.item,
        code: targetLine.code,
        desc: productModalForm.manualDesc || targetLine.desc,
        woRef: "-",
        qty: parseInt(productModalForm.manualQty, 10) || targetLine.qty,
        price: parseInt(productModalForm.manualPrice, 10) || targetLine.price,
        image: productModalImages[0] || (targetLine.image ? createImageUploadRecord(targetLine.image) : null),
        uom: targetLine.uom || "",
        lockedFromWorkOrder: false,
        sourceWorkOrderLineId: "",
        sourceMaterialLineId: targetLine.id,
      };

      setLines((prev) =>
        editingLineId
          ? prev.map((line) =>
            line.id === editingLineId ? { ...line, ...nextLine } : line
          )
          : [...prev, nextLine]
      );
      setShowAddProductModal(false);
      setEditingLineId(null);
      setProductModalFieldErrors({});
      return;
    }


    const targetLine = availableWorkOrderLines.find(
      (line) =>
        getWorkOrderSourceId(line) === productModalForm.selectedWorkOrderLineId
    );
    const nextErrors = {};
    if (!productModalForm.selectedWorkOrderLineId)
      nextErrors.selectedWorkOrderLineId = "Field cannot be empty";
    if (!productModalForm.manualPrice)
      nextErrors.manualPrice = "Field cannot be empty";
    if (!productModalForm.manualQty || parseInt(productModalForm.manualQty, 10) <= 0)
      nextErrors.manualQty = "Quantity must be greater than 0";
    if (!productModalForm.manualPrice)
      nextErrors.manualPrice = "Field cannot be empty";
    setProductModalFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0 || !targetLine) return;

    const nextLine = {
      id: editingLineId || `wo-${Date.now()}`,
      type: "wo",
      item: targetLine.item,
      code: targetLine.code,
      desc: productModalForm.manualDesc || targetLine.desc,
      woRef: targetLine.woRef,
      qty: parseInt(productModalForm.manualQty, 10) || targetLine.qty,
      price: parseInt(productModalForm.manualPrice, 10) || targetLine.price,
      image: productModalImages[0] || (targetLine.image ? createImageUploadRecord(targetLine.image) : null),
      uom: "",
      lockedFromWorkOrder: editingLineId
        ? lines.find((line) => line.id === editingLineId)?.lockedFromWorkOrder
        : false,
      sourceWorkOrderLineId: getWorkOrderSourceId(targetLine),
      sourceMaterialLineId: "",
    };

    setLines((prev) =>
      editingLineId
        ? prev.map((line) =>
          line.id === editingLineId ? { ...line, ...nextLine } : line
        )
        : [...prev, nextLine]
    );
    setShowAddProductModal(false);
    setEditingLineId(null);
    setProductModalFieldErrors({});
  };

  const handleRemoveLine = (lineId) =>
    setLines((prev) =>
      prev.filter((line) => line.id !== lineId || line.lockedFromWorkOrder)
    );

  const handleSaveDraft = () => {
    if (!isEditMode && !isFormDirty && !hasPrefilledDraftContent) {
      setShowEmptyDraftModal(true);
      return;
    }

    if (pageTopRef.current) {
      pageTopRef.current.scrollIntoView({ behavior: "auto", block: "start" });
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }

    const payload = {
      ...buildPoPayload(
        isEditMode || isReviseMode ? (initialData?.status || "Draft") : "Draft",
        isEditMode || isReviseMode ? (initialData?.sBadge || "grey-light") : "grey-light"
      ),
      showDraftToast: true,
    };
    const poLinkSnapshot = buildPoLinkSnapshot(payload);

    // Persist to global mock data
    const existingIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === payload.poNumber);
    if (existingIndex !== -1) {
      MOCK_PO_TABLE_DATA[existingIndex] = payload;
    } else {
      MOCK_PO_TABLE_DATA.push(payload);
    }

    if (
      initialData?.source === "work_order_vendor_assignment" &&
      initialData?.returnTo?.data
    ) {
      const targetPoNumber = payload.poNumber;
      const updatedReturnData = {
        ...initialData.returnTo.data,
        vendors: (initialData.returnTo.data.vendors || []).map((vendor) => {
          const isTargetVendor =
            vendor.name === vendorSearch ||
            vendor.poNumber === initialData?.poNumber;
          if (!isTargetVendor) return vendor;
          return {
            ...vendor,
            poNumber: targetPoNumber,
            isPoApproved: false,
            poStatus: payload.status,
            poBadge: payload.sBadge,
            poStatusKey: payload.statusKey,
            poDetailData: poLinkSnapshot,
          };
        }),
      };

      payload.from = "work_order_detail";
      payload.returnTo = {
        ...initialData.returnTo,
        data: updatedReturnData,
      };
    }

    scrollToTop();
    onNavigate("po_detail", payload);
  };

  const handleSubmitClick = () => {
    if (!validateMandatoryFields()) return;
    if (isReviseMode) {
      setRevisionReason("");
      setRevisionReasonError("");
    }
    setShowSubmitConfirmModal(true);
  };

  const syncPoToStockBatches = (poPayload) => {
    const { formData, poNumber } = poPayload;
    const { lines, vendorName, poDate, deliveryDate } = formData;

    lines.forEach((line) => {
      // Find matching material
      const material = MOCK_MATERIALS_DATA.find(
        (m) => m.sku === line.code || m.name === line.item
      );
      if (!material) return;

      const batchId = `batch-${poNumber}-${line.id}`;
      // Create new batch (action is always 'issue' for direct submit)
      const newBatch = {
        id: batchId,
        materialId: material.id,
        batchNo: `BN-${poNumber.replace("PO-", "")}-${line.id}`,
        initialQty: Number(line.qty) || 0,
        currentQty: 0,
        reservedQty: 0,
        costPerUnit: Number(line.price) || 0,
        purchaseDate: poDate,
        expectedDate: deliveryDate,
        receivedDate: "",
        storageLocation: "",
        vendor: vendorName,
        status: "Requested",
        attachments: 0,
      };
      const existing = MOCK_STOCK_BATCHES.find((b) => b.id === batchId);
      if (!existing) {
        MOCK_STOCK_BATCHES.push(newBatch);
      }
    });
  };

  const handleConfirmSubmit = () => {
    const approvalOn = !!poApprovalSettings?.isApprovalActive;
    const nextStatus = approvalOn ? "Waiting for Approval" : "Issued";
    const nextBadge = approvalOn ? "orange" : "blue";
    const payload = buildPoPayload(nextStatus, nextBadge);
    const poLinkSnapshot = buildPoLinkSnapshot(payload);

    if (nextStatus === "Issued") {
      syncPoToStockBatches(payload);
    }

    if (isReviseMode) {
      const existingPo = MOCK_PO_TABLE_DATA.find(p => p.poNumber === payload.poNumber);
      if (existingPo) {
        if (!existingPo.versions) {
          existingPo.versions = [
            { 
              version: 1, 
              date: existingPo.createdDate || existingPo.poDate || new Date().toISOString().split("T")[0],
              data: { ...existingPo, versions: undefined } 
            }
          ];
        }
        const nextVersionNumber = existingPo.versions.length + 1;
        const newVersionEntry = {
          version: nextVersionNumber,
          date: new Date().toISOString().split("T")[0],
          data: { ...payload }
        };
        existingPo.versions.push(newVersionEntry);
        payload.currentVersion = nextVersionNumber;
        payload.versions = existingPo.versions;
        payload.revisionReason = revisionReason;

        // Add to activity log
        if (!payload.receiptLogs) payload.receiptLogs = [];
        const now = new Date();
        const yyyy = now.getFullYear();
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");
        const hh = String(now.getHours()).padStart(2, "0");
        const min = String(now.getMinutes()).padStart(2, "0");
        const formattedTimestamp = `${yyyy}-${mm}-${dd} at ${hh}:${min}`;

        payload.receiptLogs.unshift({
          name: "Joko",
          email: "joko@company.com",
          title: `Purchase Order Revised to Version ${nextVersionNumber}.0`,
          desc: revisionReason,
          timestamp: formattedTimestamp
        });
      }
      if (showPoSnackbar) {
        showPoSnackbar("Purchase order successfully submitted", "success");
      }
    }

    // Persist to global mock data
    const existingIndex = MOCK_PO_TABLE_DATA.findIndex(p => p.poNumber === payload.poNumber);
    if (existingIndex !== -1) {
      MOCK_PO_TABLE_DATA[existingIndex] = payload;
    } else {
      MOCK_PO_TABLE_DATA.push(payload);
    }

    if (
      initialData?.source === "work_order_vendor_assignment" &&
      initialData?.returnTo?.data
    ) {
      const targetPoNumber = payload.poNumber;
      const updatedReturnData = {
        ...initialData.returnTo.data,
        vendors: (initialData.returnTo.data.vendors || []).map((vendor) => {
          const isTargetVendor =
            vendor.name === vendorSearch ||
            vendor.poNumber === initialData?.poNumber;
          if (!isTargetVendor) return vendor;
          return {
            ...vendor,
            poNumber: targetPoNumber,
            isPoApproved: !approvalOn,
            poStatus: payload.status,
            poBadge: payload.sBadge,
            poStatusKey: payload.statusKey,
            poDetailData: poLinkSnapshot,
          };
        }),
      };

      payload.from = "work_order_detail";
      payload.returnTo = {
        ...initialData.returnTo,
        data: updatedReturnData,
      };
    }

    scrollToTop();
    onNavigate("po_detail", payload);
  };

  const pageSectionStyle = {
    background: "var(--neutral-surface-primary)",
    borderRadius: "16px",
    border: "1px solid var(--neutral-line-separator-1)",
    overflow: "hidden",
  };

  const sectionHeader = (title, right) => (
    <div
      style={{
        padding: "18px 20px 0 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "12px",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        <div
          style={{
            width: "6px",
            height: "24px",
            borderRadius: "0 4px 4px 0",
            background: "var(--feature-brand-primary)",
            position: "absolute",
            left: 0,
            top: "18px",
          }}
        />
        <span
          style={{
            fontSize: "var(--text-title-1)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {title}
        </span>
      </div>
      {right || null}
    </div>
  );

  const fieldLabelCol = (label, desc, required = false) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        paddingTop: "8px",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", gap: "4px" }}>
        {required ? (
          <span
            style={{
              color: "var(--status-red-primary)",
              fontSize: "var(--text-title-3)",
            }}
          >
            *
          </span>
        ) : null}
        <span
          style={{
            fontSize: "var(--text-title-3)",
            color: "var(--neutral-on-surface-primary)",
            fontWeight: "var(--font-weight-bold)",
          }}
        >
          {label}
        </span>
      </div>
    </div>
  );

  const rowWrapStyle = {
    display: "grid",
    gridTemplateColumns: "220px minmax(0, 1fr)",
    gap: "20px",
    alignItems: "start",
  };
  const compactGridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: "16px",
  };
  const currencyPrefixLabel = currency === "USD" ? "USD" : "IDR";

  const handleAddProductImages = (files) => {
    const nextFile = Array.from(files || [])[0];
    if (!nextFile) return;
    const validationMessage = validateUploadFile(
      nextFile,
      ALLOWED_IMAGE_EXTENSIONS,
      UPLOAD_MAX_FILE_SIZE_BYTES,
      "Allowed formats (JPG, JPEG, PNG, WebP)"
    );
    if (validationMessage) {
      setProductModalError(validationMessage);
      return;
    }
    setProductModalError("");
    setProductModalImages([createImageUploadRecord(nextFile)]);
  };

  const handleRemoveProductImage = (imageToRemove) => {
    const imageName = getImageUploadName(imageToRemove);
    setProductModalImages((prev) =>
      prev.filter((item) => getImageUploadName(item) !== imageName)
    );
    setProductModalError("");
  };

  const renderProductImageUploader = (disabled = false, helperTextOverride = "") => {
    const helperText = helperTextOverride || (disabled
      ? "Image is taken from the selected work order."
      : "Allowed formats (JPG, JPEG, PNG, WebP), Max size 25MB per file");

    return (
      <ImageUploadField
        label="Images"
        images={productModalImages}
        maxFiles={1}
        disabled={disabled}
        error={productModalError}
        helperText={helperText}
        onFilesSelected={handleAddProductImages}
        onRemove={handleRemoveProductImage}
      />
    );
  };

  return (
    <div
      ref={pageTopRef}
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "calc(100vh - 64px)",
        background: "#F5F5F7",
        position: "relative",
      }}
    >
      <div
        style={{
          padding: "24px",
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
          paddingBottom: "108px",
          background: "#F5F5F7",
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
            onClick={handleBackNavigation}
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
                color: "var(--neutral-on-surface-primary)",
              }}
            >
              {isReviseMode ? "Revise Purchase Order" : isEditMode ? "Edit Purchase Order" : "Add New Purchase Order"}
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
              onClick={handleBackNavigation}
            >
              Purchase Order
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              /
            </span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>
              {isReviseMode ? "Revise Purchase Order" : isEditMode ? "Edit Purchase Order" : "Add New Purchase Order"}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={pageSectionStyle}>
            {sectionHeader(
              "Vendor Information",
              (isEditMode || isReviseMode) && initialData?.status === "Draft" && !isVendorEditingEnabled && (
                <Button
                  variant="tertiary"
                  size="small"
                  onClick={handleEditVendorClick}
                  leftIcon={EditIcon}
                  style={{ padding: "0 8px", height: "32px", fontWeight: "var(--font-weight-bold)" }}
                >
                  Edit
                </Button>
              )
            )}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Vendor Name",
                  "Select an existing vendor or add a new one.",
                  true
                )}
                <div style={{ position: "relative" }}>
                  <div style={{ position: "relative" }}>
                    <input
                      value={vendorSearch}
                      onChange={(e) => handleVendorInputChange(e.target.value)}
                      onFocus={() => {
                        if (!isFromWorkOrderAssignment) {
                          setIsVendorFieldFocused(true);
                          setShowVendorSuggestions(true);
                        }
                      }}
                      onClick={() => {
                        if (!isFromWorkOrderAssignment) {
                          setIsVendorFieldFocused(true);
                          setShowVendorSuggestions(true);
                        }
                      }}
                      disabled={isFromWorkOrderAssignment || isEditMode || isReviseMode ? !isVendorEditingEnabled : false}
                      onBlur={() => {
                        setTimeout(() => {
                          setIsVendorFieldFocused(false);
                        }, 120);
                      }}
                      placeholder="Type to search or add vendor"
                      maxLength={40}
                      style={{
                        ...fieldStyle(
                          isFromWorkOrderAssignment || (isEditMode && !isVendorEditingEnabled),
                          !!vendorSearch,
                          false
                        ),
                        borderColor: isVendorFieldFocused
                          ? "var(--feature-brand-primary)"
                          : baseInputBorderColor,
                        padding: "0 80px 0 16px",
                        background: (isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled
                          ? "var(--neutral-surface-grey-lighter)"
                          : "var(--neutral-surface-primary)",
                        cursor: (isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled
                          ? "not-allowed"
                          : "text",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        right: "48px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: "12px",
                        color: "var(--neutral-on-surface-tertiary)",
                        pointerEvents: "none",
                      }}
                    >
                      {vendorSearch.length}/40
                    </div>
                    <ChevronDownIcon
                      size={20}
                      color="var(--neutral-on-surface-secondary)"
                      style={{
                        position: "absolute",
                        right: "16px",
                        top: "50%",
                        transform: `translateY(-50%) ${showVendorSuggestions
                            ? "rotate(180deg)"
                            : "rotate(0deg)"
                          }`,
                        transition: "transform 0.2s ease",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                  {showVendorSuggestions && !isFromWorkOrderAssignment ? (
                    <>
                      <div
                        style={{ position: "fixed", inset: 0, zIndex: 29 }}
                        onClick={() => {
                          setShowVendorSuggestions(false);
                          setIsVendorFieldFocused(false);
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          top: "52px",
                          left: 0,
                          right: 0,
                          background: "var(--neutral-surface-primary)",
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "16px",
                          boxShadow: "0px 8px 20px rgba(27, 27, 27, 0.12)",
                          overflow: "hidden",
                          zIndex: 30,
                        }}
                      >
                        {vendorSuggestions.length > 0
                          ? vendorSuggestions.map((vendor, index) => (
                            <div
                              key={vendor.id}
                              onClick={() =>
                                handleSelectVendorSuggestion(vendor)
                              }
                              style={{
                                minHeight: "56px",
                                padding: "0 18px",
                                cursor: "pointer",
                                borderBottom:
                                  "1px solid var(--neutral-line-separator-1)",
                                display: "flex",
                                alignItems: "center",
                                fontSize: "var(--text-title-2)",
                                color: "var(--neutral-on-surface-primary)",
                                background: "var(--neutral-surface-primary)",
                              }}
                              onMouseEnter={(e) =>
                              (e.currentTarget.style.background =
                                "var(--neutral-surface-grey-lighter)")
                              }
                              onMouseLeave={(e) =>
                              (e.currentTarget.style.background =
                                "var(--neutral-surface-primary)")
                              }
                            >
                              {vendor.name}
                            </div>
                          ))
                          : null}
                        {!vendorHasExactMatch && vendorSearch.trim() ? (
                          <div
                            onClick={handleAddNewVendorOption}
                            style={{
                              minHeight: "48px",
                              padding: "0 18px",
                              display: "flex",
                              alignItems: "center",
                              fontSize: "var(--text-title-2)",
                              color: "var(--feature-brand-primary)",
                              cursor: "pointer",
                              background: "var(--neutral-surface-primary)",
                            }}
                            onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--feature-brand-container-lighter)")
                            }
                            onMouseLeave={(e) =>
                            (e.currentTarget.style.background =
                              "var(--neutral-surface-primary)")
                            }
                          >
                            + Add "{vendorSearch.trim()}" as new vendor
                          </div>
                        ) : null}
                      </div>
                    </>
                  ) : null}
                  {formErrors.vendor ? (
                    <span
                      style={{
                        marginTop: "6px",
                        display: "block",
                        fontSize: "var(--text-body)",
                        color: "var(--status-red-primary)",
                      }}
                    >
                      {formErrors.vendor}
                    </span>
                  ) : null}
                </div>
              </div>

              <div style={rowWrapStyle}>
                {fieldLabelCol("Phone Number")}
                <PhoneInputField
                  value={vendorDetails.phone}
                  onChange={(nextValue) =>
                    setVendorDetails({ ...vendorDetails, phone: nextValue })
                  }
                  disabled={(isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled}
                />
              </div>

              <div style={rowWrapStyle}>
                {fieldLabelCol("Email")}
                <InputField
                  value={vendorDetails.email}
                  onChange={(e) =>
                    setVendorDetails({
                      ...vendorDetails,
                      email: e.target.value,
                    })
                  }
                  disabled={(isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled}
                  placeholder="Input email"
                />
              </div>

              <div style={rowWrapStyle}>
                {fieldLabelCol("Address")}
                <InputField
                  multiline
                  value={vendorDetails.address}
                  maxLength={400}
                  showCounter
                  onChange={(e) =>
                    setVendorDetails({
                      ...vendorDetails,
                      address: e.target.value,
                    })
                  }
                  disabled={(isFromWorkOrderAssignment || isEditMode || isReviseMode) && !isVendorEditingEnabled}
                  placeholder="Input vendor address"
                />
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader("Purchase Order Information")}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Purchase Order Date",
                  "The date when this purchase order is created.",
                  true
                )}
                <div>
                  <InputField
                    type="date"
                    value={poDate}
                    onChange={(e) => setPoDate(e.target.value)}
                  />
                  {formErrors.poDate ? (
                    <span
                      style={{
                        marginTop: "6px",
                        display: "block",
                        fontSize: "var(--text-body)",
                        color: "var(--status-red-primary)",
                      }}
                    >
                      {formErrors.poDate}
                    </span>
                  ) : null}
                </div>
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Expected Delivery Date",
                  "Estimated receiving date from the vendor."
                )}
                <InputField
                  type="date"
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Currency",
                  "Used for all prices in this purchase order.",
                  true
                )}
                <div>
                  <DropdownSelect
                    value={currency}
                    onChange={(nextValue) => setCurrency(nextValue)}
                    options={[
                      { value: "IDR", label: "IDR · Indonesian Rupiah" },
                      { value: "USD", label: "USD · US Dollar" },
                    ]}
                  />
                  {formErrors.currency ? (
                    <span
                      style={{
                        marginTop: "6px",
                        display: "block",
                        fontSize: "var(--text-body)",
                        color: "var(--status-red-primary)",
                      }}
                    >
                      {formErrors.currency}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader(
              "Recipient Information",
              <Button
                variant="tertiary"
                size="small"
                onClick={handleUseCompanyDetail}
              >
                Use Company Detail
              </Button>
            )}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Recipient Name",
                  "The recipient name for this delivery."
                )}
                <InputField
                  value={shipToInfo.name}
                  maxLength={40}
                  showCounter
                  onChange={(e) =>
                    setShipToInfo({ ...shipToInfo, name: e.target.value })
                  }
                  placeholder="Input recipient name"
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol("Phone Number")}
                <PhoneInputField
                  value={shipToInfo.phone}
                  onChange={(nextValue) =>
                    setShipToInfo({ ...shipToInfo, phone: nextValue })
                  }
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol("Email")}
                <InputField
                  value={shipToInfo.email}
                  onChange={(e) =>
                    setShipToInfo({ ...shipToInfo, email: e.target.value })
                  }
                  placeholder="Input email"
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Address",
                  "The destination address for the order."
                )}
                <InputField
                  multiline
                  maxLength={400}
                  showCounter
                  value={shipToInfo.address}
                  onChange={(e) =>
                    setShipToInfo({ ...shipToInfo, address: e.target.value })
                  }
                  placeholder="Input address"
                />
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader(
              "Purchase Order Lines",
              <Button
                variant="tertiary"
                size="small"
                leftIcon={AddIcon}
                onClick={openAddProductModal}
              >
                Add PO Line
              </Button>
            )}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div
                style={{
                  border: "none",
                  borderRadius: "0",
                  overflow: "hidden",
                  width: "100%",
                }}
              >
                <div style={{ overflowX: "auto", width: "100%" }}>
                  <div
                    style={{
                      minWidth: "1466px",
                      width: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "84px 112px minmax(220px, 1.5fr) minmax(180px, 1fr) minmax(220px, 1.4fr) 110px 160px 200px 180px",
                        gap: "0",
                        width: "100%",
                        minWidth: "1466px",
                        height: "49px",
                        alignItems: "center",
                        background: "var(--neutral-surface-primary)",
                        borderBottom:
                          "1px solid var(--neutral-line-separator-1)",
                        fontSize: "var(--text-title-3)",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--neutral-on-surface-primary)",
                      }}
                    >
                      <span style={{ paddingLeft: "16px" }}>Type</span>
                      <span>Image</span>
                      <span>Name</span>
                      <span>SKU</span>
                      <span>Description</span>
                      <span style={{ textAlign: "left" }}>Qty</span>
                      <span style={{ textAlign: "right" }}>Unit Price</span>
                      <span style={{ textAlign: "right" }}>Subtotal</span>
                      <span style={{ textAlign: "right", paddingRight: "16px" }}>Action</span>
                    </div>

                      {lines.length > 0 ? (
                      lines.map((line, idx) => {
                        const isLockedWorkOrderLine =
                          !!line.lockedFromWorkOrder;
                        const lineSubtotal =
                          (parseFloat(line.qty) || 0) *
                          (parseFloat(line.price) || 0);
                        const quantityLabel =
                          line.type === "material" && line.uom
                            ? `${formatNumberWithCommas(line.qty) || 0} ${line.uom}`
                            : `${formatNumberWithCommas(line.qty) || 0}`;
                        return (
                          <div
                            key={line.id}
                            style={{
                              display: "grid",
                              gridTemplateColumns:
                                "84px 112px minmax(220px, 1.5fr) minmax(180px, 1fr) minmax(220px, 1.4fr) 110px 160px 200px 180px",
                              gap: "0",
                              width: "100%",
                              minWidth: "1466px",
                              minHeight: "64px",
                              alignItems: "center",
                              borderBottom:
                                idx === lines.length - 1
                                  ? "none"
                                  : "1px solid var(--neutral-line-separator-1)",
                              background: "var(--neutral-surface-primary)",
                            }}
                          >
                            <div style={{ paddingLeft: "16px" }}>
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
                              style={{ display: "flex", alignItems: "center" }}
                            >
                              <div
                                style={{
                                  width: "56px",
                                  height: "56px",
                                  borderRadius: "12px",
                                  background:
                                    "var(--neutral-surface-grey-lighter)",
                                  border:
                                    "1px solid var(--neutral-line-separator-1)",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  flexShrink: 0,
                                  overflow: "hidden",
                                }}
                              >
                                {line.image && getImageUploadPreviewUrl(line.image) ? (
                                  <img
                                    src={getImageUploadPreviewUrl(line.image)}
                                    alt={line.item}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <ImageAssetIcon
                                    size={20}
                                    color="var(--neutral-on-surface-tertiary)"
                                  />
                                )}
                              </div>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  fontWeight: "var(--font-weight-bold)",
                                  color: "var(--neutral-on-surface-primary)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={line.item}
                              >
                                {line.item}
                              </span>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-secondary)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={line.code}
                              >
                                {line.code}
                              </span>
                            </div>
                            <div style={{ minWidth: 0 }}>
                              <span
                                style={{
                                  display: "block",
                                  fontSize: "var(--text-title-3)",
                                  color: "var(--neutral-on-surface-secondary)",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                                title={line.desc || "-"}
                              >
                                {line.desc || "-"}
                              </span>
                            </div>
                            <span
                              style={{
                                textAlign: "left",
                                fontSize: "var(--text-title-3)",
                                color: "var(--neutral-on-surface-primary)",
                              }}
                              title={quantityLabel}
                            >
                              {quantityLabel}
                            </span>
                            <span
                              style={{
                                textAlign: "right",
                                fontSize: "var(--text-title-3)",
                                color: "var(--neutral-on-surface-primary)",
                              }}
                            >
                              {formatCurrency(line.price, currency)}
                            </span>
                            <span
                              style={{
                                textAlign: "right",
                                fontSize: "var(--text-title-3)",
                                fontWeight: "var(--font-weight-bold)",
                                color: "var(--neutral-on-surface-primary)",
                              }}
                            >
                              {formatCurrency(lineSubtotal, currency)}
                            </span>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "flex-end",
                                gap: "8px",
                                paddingRight: "16px",
                              }}
                            >
                              <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => handleEditLine(line)}
                                disabled={isReviseMode && line.type === "wo"}
                                style={{ 
                                  color: (isReviseMode && line.type === "wo") 
                                    ? "var(--neutral-on-surface-tertiary)" 
                                    : "var(--feature-brand-primary)", 
                                  padding: "0 4px" 
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                variant="tertiary"
                                size="small"
                                onClick={() => handleRemoveLine(line.id)}
                                disabled={isLockedWorkOrderLine || (isReviseMode && line.type === "wo")}
                                style={{ 
                                  color: (isLockedWorkOrderLine || (isReviseMode && line.type === "wo")) 
                                    ? "var(--neutral-on-surface-tertiary)" 
                                    : "var(--status-red-primary)",
                                  padding: "0 4px"
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div
                        style={{
                          padding: "32px",
                          textAlign: "center",
                          color: "var(--neutral-on-surface-tertiary)",
                          fontSize: "var(--text-title-3)",
                          background: "var(--neutral-surface-primary)",
                        }}
                      >
                        No purchase order lines added yet. Click “Add PO Line”
                        to get started.
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {formErrors.lines ? (
                <span
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--status-red-primary)",
                  }}
                >
                  {formErrors.lines}
                </span>
              ) : null}
            </div>
          </div>

          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              border: "1px solid var(--neutral-line-separator-1)",
              overflow: "hidden",
            }}
          >
            {sectionHeader(
              "Summary",
              <ChevronDownIcon
                size={20}
                color="var(--neutral-on-surface-primary)"
                style={{ transform: "rotate(180deg)" }}
              />
            )}

            <div
              style={{
                padding: "20px 20px 24px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span style={summaryMetricLabelStyle}>Subtotal</span>
                <span style={summaryMetricValueStyle}>
                  {formatCurrency(subtotal, currency)}
                </span>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "16px",
                    flex: 1,
                    minWidth: 0,
                  }}
                >
                  <span style={summaryMetricLabelStyle}>Tax</span>
                  <div style={{ width: "170px", flexShrink: 0 }}>
                    <InputGroup
                      type="number"
                      value={tax}
                      onChange={(e) => setTax(e.target.value)}
                      placeholder="11"
                      suffix="%"
                      containerStyle={{ width: "100%" }}
                    />
                  </div>
                </div>
                <span style={summaryMetricValueStyle}>
                  {formatCurrency(taxAmount, currency)}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {feeLines.map((fee) => (
                  <div
                    key={fee.id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "minmax(0, 1fr) 320px 32px",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <InputField
                      placeholder="Fee Name"
                      value={fee.name}
                      maxLength={40}
                      showCounter
                      onChange={(e) =>
                        handleFeeChange(
                          fee.id,
                          "name",
                          e.target.value
                        )
                      }
                    />
                    <InputGroup
                      type="number"
                      value={fee.amount}
                      onChange={(e) =>
                        handleFeeChange(fee.id, "amount", e.target.value)
                      }
                      placeholder="0"
                      prefix={currencyPrefixLabel}
                      inputStyle={{ textAlign: "right" }}
                      containerStyle={{ width: "100%" }}
                      style={{ width: "100%" }}
                    />
                    {feeLines.length === 1 ? (
                      <IconButton
                        icon={DeleteIcon}
                        size="small"
                        disabled
                        color="var(--status-red-primary)"
                        style={{ justifySelf: "end" }}
                        aria-label="Remove Fee"
                      />
                    ) : (
                      <Tooltip content="Remove Fee">
                        <IconButton
                          icon={DeleteIcon}
                          size="small"
                          onClick={() => handleRemoveFeeLine(fee.id)}
                          color="var(--status-red-primary)"
                          hoverBackground="#FAE6E8"
                          style={{ justifySelf: "end" }}
                          aria-label="Remove Fee"
                        />
                      </Tooltip>
                    )}
                  </div>
                ))}

                {feeLines.length < 5 && (
                  <Button
                    variant="tertiary"
                    size="small"
                    leftIcon={AddIcon}
                    onClick={handleAddFeeLine}
                    style={{ alignSelf: "flex-start", padding: 0 }}
                  >
                    Add Fee
                  </Button>
                )}
              </div>

              <div
                style={{
                  borderTop: "1px solid var(--neutral-line-separator-1)",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "16px",
                }}
              >
                <span style={summaryTotalLabelStyle}>Total</span>
                <span style={summaryTotalValueStyle}>
                  {formatCurrency(total, currency)}
                </span>
              </div>
            </div>
          </div>

          <div style={pageSectionStyle}>
            {sectionHeader("Notes & Terms")}
            <div
              style={{
                padding: "18px 20px 20px 20px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <div style={rowWrapStyle}>
                {fieldLabelCol("Notes", "Additional notes for the vendor.")}
                <InputField
                  multiline
                  value={notes}
                  maxLength={1000}
                  showCounter
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Input notes"
                />
              </div>
              <div style={rowWrapStyle}>
                {fieldLabelCol(
                  "Terms",
                  "Terms and conditions related to this order."
                )}
                <InputField
                  multiline
                  value={terms}
                  maxLength={5000}
                  showCounter
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="Input terms"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: isSidebarCollapsed ? "82px" : "286px",
          right: 0,
          transition: "left 0.2s ease",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          padding: "14px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 100,
        }}
      >
        <Button
          size="medium"
          variant="tertiary"
          onClick={handleBackNavigation}
          style={{ color: "var(--status-red-primary)" }}
        >
          Cancel
        </Button>
        <div style={{ display: "flex", gap: "12px" }}>
          {!isReviseMode && (
            <Button size="medium" variant="outlined" onClick={handleSaveDraft}>
              {isEditMode ? "Save Changes" : "Save as Draft"}
            </Button>
          )}
          <Button size="medium" variant="filled" onClick={handleSubmitClick}>
            Submit PO
          </Button>
        </div>
      </div>

      {showAddProductModal ? (
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
              width: "80vw",
              maxWidth: "1600px",
              maxHeight: "88vh",
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              position: "relative",
              boxShadow: "var(--elevation-sm)",
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
              <IconButton
                icon={CloseIcon}
                size="large"
                onClick={() => setShowAddProductModal(false)}
                style={{ position: "absolute", top: "-8px", right: 0 }}
                color="var(--neutral-on-surface-primary)"
              />
              <h2
                style={{
                  margin: 0,
                  fontSize: "var(--text-headline)",
                  fontWeight: "var(--font-weight-bold)",
                  textAlign: "center",
                }}
              >
                {editingLineId
                  ? "Edit Purchase Order Line"
                  : "Add Purchase Order Line"}
              </h2>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "20px",
                overflowY: "auto",
                paddingRight: "4px",
                minHeight: 0,
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "4px" }}
                >
                  <span
                    style={{
                      color: "var(--status-red-primary)",
                      fontSize: "var(--text-title-3)",
                    }}
                  >
                    *
                  </span>
                  <span
                    style={{
                      fontSize: "var(--text-title-3)",
                      fontWeight: "var(--font-weight-regular)",
                      color: "var(--neutral-on-surface-primary)",
                    }}
                  >
                    Purchase Order Line Type
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                    gap: "16px",
                  }}
                >
                  {[
                    {
                      key: "manual",
                      title: "Manual",
                      desc: "Add a product line manually by filling in the product details.",
                    },
                    {
                      key: "material",
                      title: "Material",
                      desc: "Select a material and adjust the editable fields as needed.",
                    },
                    {
                      key: "wo",
                      title: "Work Order",
                      desc: "Use an available work order line and adjust the editable fields as needed.",
                    },
                  ].map((option) => (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => {
                        if (!isEditingLockedWorkOrderLine) {
                          setProductLineType(option.key);
                          setProductModalForm({
                            manualName: "",
                            manualCode: "",
                            manualDesc: "",
                            manualQty: "",
                            manualPrice: "",
                            selectedWorkOrderLineId: "",
                            selectedMaterialLineId: "",
                          });
                          setProductModalImages([]);
                          setProductModalFieldErrors({});
                          setProductModalError("");
                        }
                      }}
                      disabled={isEditingLockedWorkOrderLine}
                      style={{
                        border:
                          productLineType === option.key
                            ? "2px solid var(--feature-brand-primary)"
                            : "1px solid var(--neutral-line-separator-2)",
                        borderRadius: "24px",
                        background:
                          productLineType === option.key
                            ? "var(--feature-brand-container-lighter)"
                            : "var(--neutral-surface-primary)",
                        padding: "22px 24px",
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "14px",
                        cursor: isEditingLockedWorkOrderLine
                          ? "not-allowed"
                          : "pointer",
                        textAlign: "left",
                      }}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border:
                            productLineType === option.key
                              ? "2px solid var(--feature-brand-primary)"
                              : "2px solid var(--neutral-line-separator-2)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: "2px",
                        }}
                      >
                        {productLineType === option.key ? (
                          <div
                            style={{
                              width: "10px",
                              height: "10px",
                              borderRadius: "50%",
                              background: "var(--feature-brand-primary)",
                            }}
                          />
                        ) : null}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "16px",
                            fontWeight: "var(--font-weight-bold)",
                            color: "var(--neutral-on-surface-primary)",
                          }}
                        >
                          {option.title}
                        </span>
                        <span
                          style={{
                            fontSize: "14px",
                            color: "var(--neutral-on-surface-secondary)",
                            lineHeight: "1.5",
                          }}
                        >
                          {option.desc}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {productLineType === "manual" ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "16px",
                  }}
                >
                  <div style={{ gridColumn: "1 / -1" }}>
                    {renderProductImageUploader(false)}
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <InputField
                      label="Name"
                      required
                      value={productModalForm.manualName}
                      maxLength={100}
                      showCounter
                      onChange={(e) => {
                        setProductModalForm({
                          ...productModalForm,
                          manualName: e.target.value,
                        });
                        if (productModalFieldErrors.manualName)
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            manualName: "",
                          }));
                      }}
                      placeholder="Enter name"
                    />
                    {productModalFieldErrors.manualName ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.manualName}
                      </span>
                    ) : null}
                  </div>
                  <InputField
                    label="SKU / Code"
                    value={productModalForm.manualCode}
                    onChange={(e) =>
                      setProductModalForm({
                        ...productModalForm,
                        manualCode: e.target.value,
                      })
                    }
                    placeholder="Enter code"
                  />
                  <div>
                    <InputField
                      label="Quantity"
                      required
                      type="number"
                      value={productModalForm.manualQty}
                      onChange={(e) => {
                        setProductModalForm({
                          ...productModalForm,
                          manualQty: e.target.value,
                        });
                        if (productModalFieldErrors.manualQty)
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            manualQty: "",
                          }));
                      }}
                      placeholder="0"
                    />
                    {productModalFieldErrors.manualQty ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.manualQty}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <InputField
                      label="Description"
                      multiline
                      value={productModalForm.manualDesc}
                      maxLength={1000}
                      showCounter
                      onChange={(e) =>
                        setProductModalForm({
                          ...productModalForm,
                          manualDesc: e.target.value,
                        })
                      }
                      placeholder="Enter description"
                    />
                  </div>
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "var(--text-body)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span>Unit Price</span>
                    </div>
                    <InputGroup
                      type="number"
                      value={productModalForm.manualPrice}
                      onChange={(e) => {
                        setProductModalForm({
                          ...productModalForm,
                          manualPrice: e.target.value,
                        });
                        if (productModalFieldErrors.manualPrice)
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            manualPrice: "",
                          }));
                      }}
                      placeholder="0"
                      prefix={currencyPrefixLabel}
                      hasError={!!productModalFieldErrors.manualPrice}
                    />
                    {productModalFieldErrors.manualPrice ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.manualPrice}
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : productLineType === "material" ? (
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
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "var(--text-body)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span>Material</span>
                    </div>
                    <DropdownSelect
                      value={productModalForm.selectedMaterialLineId}
                      hasError={
                        !!productModalFieldErrors.selectedMaterialLineId
                      }
                      onChange={(selectedId) => {
                        const targetLine = availableMaterialLines.find(
                          (line) => line.id === selectedId
                        );
                        setProductModalForm({
                          ...productModalForm,
                          selectedMaterialLineId: selectedId,
                          manualName: targetLine?.item || "",
                          manualCode: targetLine?.code || "",
                          manualDesc: targetLine?.desc || "",
                          manualQty: "",
                          manualPrice: targetLine ? String(targetLine.price) : "",
                        });
                        setProductModalImages(
                          targetLine?.image
                            ? [createImageUploadRecord(targetLine.image)]
                            : []
                        );
                        if (
                          productModalFieldErrors.selectedMaterialLineId ||
                          productModalFieldErrors.manualPrice
                        ) {
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            selectedMaterialLineId: "",
                            manualPrice: "",
                          }));
                        }
                      }}
                      searchable
                      searchPlaceholder="Search material..."
                      placeholder="Select material"
                      showDivider
                      options={availableMaterialLines.map((line) => ({
                        value: line.id,
                        label: line.item,
                        code: line.code
                      }))}
                      renderOption={(option) => (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{option.label}</span>
                          <span style={{ color: "var(--neutral-on-surface-tertiary)", flexShrink: 0 }}>·</span>
                          <span style={{ color: "var(--neutral-on-surface-tertiary)", flexShrink: 0 }}>{option.code}</span>
                        </div>
                      )}
                    />
                    {productModalFieldErrors.selectedMaterialLineId ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.selectedMaterialLineId}
                      </span>
                    ) : null}
                  </div>
                  {availableMaterialLines.length === 0 ? (
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      No materials available.
                    </span>
                  ) : null}
                  {productModalForm.selectedMaterialLineId ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <div style={{ gridColumn: "1 / -1" }}>
                        {renderProductImageUploader(
                          false
                        )}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Name"
                          value={productModalForm.manualName}
                          maxLength={100}
                          showCounter
                          disabled
                        />
                      </div>
                      <InputField
                        label="SKU / Code"
                        value={productModalForm.manualCode}
                        disabled
                      />
                      <div>
                        <InputGroup
                          label="Quantity"
                          required
                          type="number"
                          value={productModalForm.manualQty}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualQty: e.target.value,
                            });
                            if (productModalFieldErrors.manualQty)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualQty: "",
                              }));
                          }}
                          placeholder="0"
                          suffix={selectedMaterialLine?.uom || ""}
                          hasError={!!productModalFieldErrors.manualQty}
                        />
                        {productModalFieldErrors.manualQty ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualQty}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Description"
                          multiline
                          value={productModalForm.manualDesc}
                          maxLength={1000}
                          showCounter
                          onChange={(e) =>
                            setProductModalForm({
                              ...productModalForm,
                              manualDesc: e.target.value,
                            })
                          }
                          placeholder="Enter description"
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "var(--text-body)",
                          }}
                        >
                          <span style={{ color: "var(--status-red-primary)" }}>
                            *
                          </span>
                          <span>Unit Price</span>
                        </div>
                        <InputGroup
                          type="number"
                          value={productModalForm.manualPrice}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualPrice: e.target.value,
                            });
                            if (productModalFieldErrors.manualPrice)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualPrice: "",
                              }));
                          }}
                          placeholder="0"
                          prefix={currencyPrefixLabel}
                          hasError={!!productModalFieldErrors.manualPrice}
                        />
                        {productModalFieldErrors.manualPrice ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualPrice}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
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
                      gap: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                        fontSize: "var(--text-body)",
                      }}
                    >
                      <span style={{ color: "var(--status-red-primary)" }}>
                        *
                      </span>
                      <span>Work Order</span>
                    </div>
                    <DropdownSelect
                      value={productModalForm.selectedWorkOrderLineId}
                      disabled={isEditingLockedWorkOrderLine}
                      hasError={!!productModalFieldErrors.selectedWorkOrderLineId}
                      onChange={(selectedId) => {
                        const targetLine = availableWorkOrderLines.find(
                          (line) => getWorkOrderSourceId(line) === selectedId
                        );
                        setProductModalForm({
                          ...productModalForm,
                          selectedWorkOrderLineId: selectedId,
                          manualName: targetLine?.item || "",
                          manualCode: targetLine?.code || "",
                          manualDesc: targetLine?.outsourceSteps?.length
                            ? buildLinkedWorkOrderDescription(
                              targetLine.woRef,
                              targetLine.outsourceSteps,
                              linkedRoutingStages // Pass current context stages or fallback
                            )
                            : targetLine?.desc || "",
                          manualQty: targetLine ? String(targetLine.qty) : "",
                          manualPrice: "",
                        });
                        setProductModalImages(
                          targetLine?.image
                            ? [createImageUploadRecord(targetLine.image)]
                            : []
                        );
                        if (productModalFieldErrors.selectedWorkOrderLineId)
                          setProductModalFieldErrors((prev) => ({
                            ...prev,
                            selectedWorkOrderLineId: "",
                          }));
                      }}
                      searchable
                      searchPlaceholder="Search work order..."
                      placeholder="Select work order"
                      showDivider
                      options={availableWorkOrderLines.map((line) => ({
                        value: getWorkOrderSourceId(line),
                        label: line.item,
                        woRef: line.woRef
                      }))}
                      renderOption={(option) => (
                        <div style={{ display: "flex", alignItems: "center", gap: "6px", overflow: "hidden" }}>
                          <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{option.label}</span>
                          <span style={{ color: "var(--neutral-on-surface-tertiary)", flexShrink: 0 }}>·</span>
                          <span style={{ color: "var(--neutral-on-surface-tertiary)", flexShrink: 0 }}>{option.woRef}</span>
                        </div>
                      )}
                    />
                    {productModalFieldErrors.selectedWorkOrderLineId ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--status-red-primary)",
                        }}
                      >
                        {productModalFieldErrors.selectedWorkOrderLineId}
                      </span>
                    ) : null}
                    {isEditingLockedWorkOrderLine ? (
                      <span
                        style={{
                          fontSize: "var(--text-body)",
                          color: "var(--neutral-on-surface-secondary)",
                        }}
                      >
                        This item is linked to a work order and cannot be
                        changed.
                      </span>
                    ) : null}
                  </div>
                  {availableWorkOrderLines.length === 0 ? (
                    <span
                      style={{
                        fontSize: "var(--text-body)",
                        color: "var(--neutral-on-surface-secondary)",
                      }}
                    >
                      No work orders available for the selected vendor.
                    </span>
                  ) : null}
                  {productModalForm.selectedWorkOrderLineId ? (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "16px",
                      }}
                    >
                      <div style={{ gridColumn: "1 / -1" }}>
                        {renderProductImageUploader(false)}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Name"
                          value={productModalForm.manualName}
                          maxLength={100}
                          showCounter
                          disabled
                        />
                      </div>
                      <InputField
                        label="SKU / Code"
                        value={productModalForm.manualCode}
                        disabled
                      />
                      <div>
                        <InputField
                          label="Quantity"
                          required
                          type="number"
                          value={productModalForm.manualQty}
                          disabled={productLineType === "wo"}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualQty: e.target.value,
                            });
                            if (productModalFieldErrors.manualQty)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualQty: "",
                              }));
                          }}
                          placeholder="0"
                        />
                        {productModalFieldErrors.manualQty ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualQty}
                          </span>
                        ) : null}
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <InputField
                          label="Description"
                          multiline
                          value={productModalForm.manualDesc}
                          maxLength={1000}
                          showCounter
                          onChange={(e) =>
                            setProductModalForm({
                              ...productModalForm,
                              manualDesc: e.target.value,
                            })
                          }
                          placeholder="Enter description"
                        />
                      </div>
                      <div
                        style={{
                          gridColumn: "1 / -1",
                          display: "flex",
                          flexDirection: "column",
                          gap: "8px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "var(--text-body)",
                          }}
                        >
                          <span style={{ color: "var(--status-red-primary)" }}>
                            *
                          </span>
                          <span>Unit Price</span>
                        </div>
                        <InputGroup
                          type="number"
                          value={productModalForm.manualPrice}
                          onChange={(e) => {
                            setProductModalForm({
                              ...productModalForm,
                              manualPrice: e.target.value,
                            });
                            if (productModalFieldErrors.manualPrice)
                              setProductModalFieldErrors((prev) => ({
                                ...prev,
                                manualPrice: "",
                              }));
                          }}
                          placeholder="0"
                          prefix={currencyPrefixLabel}
                          hasError={!!productModalFieldErrors.manualPrice}
                        />
                        {productModalFieldErrors.manualPrice ? (
                          <span
                            style={{
                              fontSize: "var(--text-body)",
                              color: "var(--status-red-primary)",
                            }}
                          >
                            {productModalFieldErrors.manualPrice}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              )}

              {productModalError ? (
                <span
                  style={{
                    fontSize: "var(--text-body)",
                    color: "var(--status-red-primary)",
                  }}
                >
                  {productModalError}
                </span>
              ) : null}
            </div>
            <div style={{ display: "flex", gap: "12px", flexShrink: 0 }}>
              <Button
                variant="outlined"
                size="large"
                style={{ flex: 1 }}
                onClick={() => {
                  setShowAddProductModal(false);
                  setEditingLineId(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                size="large"
                style={{ flex: 1 }}
                onClick={handleSaveProductLine}
              >
                {editingLineId ? "Save Changes" : "Add PO Line"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {showEmptyDraftModal ? (
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
              width: "420px",
              background: "var(--neutral-surface-primary)",
              borderRadius: "24px",
              padding: "64px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              boxShadow: "var(--elevation-sm)",
            }}
          >
            <h2
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: "var(--text-headline)",
                fontWeight: "var(--font-weight-bold)",
              }}
            >
              Save as Draft?
            </h2>
            <p
              style={{
                margin: 0,
                textAlign: "center",
                fontSize: "var(--text-title-3)",
                color: "var(--neutral-on-surface-secondary)",
                lineHeight: "1.6",
              }}
            >
              Fill at least one field in the form to proceed.
            </p>
            <Button
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowEmptyDraftModal(false)}
            >
              Okay
            </Button>
          </div>
        </div>
      ) : null}

      <GeneralModal
        isOpen={showSubmitConfirmModal}
        onClose={() => setShowSubmitConfirmModal(false)}
        title={isReviseMode ? "Confirm Revision" : "Submit PO?"}
        width={isReviseMode ? "480px" : "376px"}
        description={
          isReviseMode
            ? "Are you sure you want to revise this purchase order? Please provide a reason below."
            : poApprovalSettings?.isApprovalActive
              ? "This PO will be submitted for approval."
              : "This PO will be automatically approved upon submission."
        }
        footer={
          <>
            <Button
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                if (isReviseMode && !revisionReason.trim()) {
                  setRevisionReasonError("Reason is mandatory");
                  return;
                }
                handleConfirmSubmit();
              }}
            >
              {isReviseMode ? "Confirm Revision" : "Yes, Submit"}
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowSubmitConfirmModal(false)}
            >
              {isReviseMode ? "Cancel" : "Keep Editing"}
            </Button>
          </>
        }
      >
        {isReviseMode && (
          <div style={{ marginTop: "16px" }}>
            <FormField label="Reason" required error={revisionReasonError}>
              <textarea
                value={revisionReason}
                onChange={(e) => {
                  setRevisionReason(e.target.value);
                  if (e.target.value.trim()) setRevisionReasonError("");
                }}
                placeholder="Input revision reason"
                style={{
                  width: "100%",
                  height: "100px",
                  padding: "12px 16px",
                  borderRadius: "10px",
                  border: `1px solid ${revisionReasonError ? "var(--status-red-primary)" : "var(--neutral-line-outline)"}`,
                  outline: "none",
                  fontSize: "var(--text-subtitle-1)",
                  fontFamily: "Lato, sans-serif",
                  resize: "none",
                  boxSizing: "border-box"
                }}
              />
            </FormField>
          </div>
        )}
      </GeneralModal>

      <GeneralModal
        isOpen={showDiscardChangesModal}
        onClose={() => setShowDiscardChangesModal(false)}
        title="Discard changes?"
        footer={
          <>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={() => {
                setShowDiscardChangesModal(false);
                navigateBackWithoutPrompt();
              }}
            >
              Yes, Discard
            </Button>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setShowDiscardChangesModal(false)}
            >
              Keep Editing
            </Button>
          </>
        }
      ></GeneralModal>
      {showVendorEditConfirm && (
        <GeneralModal
          isOpen={showVendorEditConfirm}
          onClose={() => setShowVendorEditConfirm(false)}
          title="Confirm Edit Vendor"
          width="376px"
          description="Editing the vendor information will remove all linked work order lines in this purchase order. Are you sure you want to proceed?"
          footer={
            <>
              <Button
                size="large"
                style={{ width: "100%" }}
                onClick={handleConfirmVendorEdit}
              >
                Yes, Proceed
              </Button>
              <Button
                variant="outlined"
                size="large"
                style={{ width: "100%" }}
                onClick={() => setShowVendorEditConfirm(false)}
              >
                Cancel
              </Button>
            </>
          }
        />
      )}
    </div>
  );
};
