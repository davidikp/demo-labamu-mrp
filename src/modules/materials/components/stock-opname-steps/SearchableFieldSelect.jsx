import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, CloseIcon } from "../../../../components/icons/Icons.jsx";

// Type-to-search combobox where the selected value stays visible (and
// editable) directly in the field, instead of collapsing to a separate
// "closed select" display — same interaction as the Vendor Name field in
// Purchase Order > Add New Purchase Order (PurchaseOrderCreatePage.jsx),
// reused here for Material SKU / Batch since that's the exact pattern
// requested: search in the field, click a suggestion and it stays put, left
// -aligned suggestion rows, a working clear button that never overlaps text.
//
// The suggestion panel is portaled to document.body and positioned from the
// input's own bounding rect (like ce-ui's Dropdown does) rather than
// `position: absolute` inside the field — the Review table scrolls both
// ways, and an absolutely-positioned panel gets clipped by that scroll
// container instead of floating above it.
//
// Unlike the Vendor field, there's no "add as new" option here — Material
// SKU/Batch must resolve to an existing option, so typing something that
// doesn't get clicked reverts to the last confirmed selection on blur.
export const SearchableFieldSelect = ({
  value,
  options,
  onChange,
  placeholder = "Search...",
  disabled = false,
  hasError = false,
  errorText,
  renderSecondary,
}) => {
  const selectedOption = options.find((o) => String(o.value) === String(value)) || null;
  const [searchText, setSearchText] = useState(selectedOption?.label || "");
  const [isOpen, setIsOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [menuRect, setMenuRect] = useState(null);
  const blurTimeoutRef = useRef(null);
  const wrapperRef = useRef(null);
  const menuRef = useRef(null);

  // Keep the field's text in sync when the selection changes from outside
  // (e.g. Material SKU changed resets Batch's value to null elsewhere).
  useEffect(() => {
    setSearchText(selectedOption?.label || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => () => clearTimeout(blurTimeoutRef.current), []);

  // Track the field's on-screen position while the menu is open so the
  // portaled panel follows it through scrolling/resizing. Flips to open
  // upward (anchored above the field) when there isn't enough room below in
  // the viewport but there is above — same idea as a native <select> —
  // instead of letting the panel get cropped by the window edge.
  useLayoutEffect(() => {
    if (!isOpen || typeof window === "undefined") return undefined;
    const PREFERRED_MAX_HEIGHT = 280;
    const MIN_HEIGHT = 120;
    const updateRect = () => {
      const rect = wrapperRef.current?.getBoundingClientRect();
      if (!rect) return;
      const spaceBelow = window.innerHeight - rect.bottom - 4;
      const spaceAbove = rect.top - 4;
      const openUp = spaceBelow < Math.min(PREFERRED_MAX_HEIGHT, MIN_HEIGHT + 40) && spaceAbove > spaceBelow;
      const maxHeight = Math.min(PREFERRED_MAX_HEIGHT, Math.max(MIN_HEIGHT, openUp ? spaceAbove : spaceBelow));
      setMenuRect({
        left: rect.left,
        width: rect.width,
        maxHeight,
        openUp,
        top: openUp ? null : rect.bottom + 4,
        bottom: openUp ? window.innerHeight - rect.top + 4 : null,
      });
    };
    updateRect();
    window.addEventListener("scroll", updateRect, true);
    window.addEventListener("resize", updateRect);
    return () => {
      window.removeEventListener("scroll", updateRect, true);
      window.removeEventListener("resize", updateRect);
    };
  }, [isOpen]);

  // Action rows (e.g. "+ Create New Batch") are kept out of the filtered/
  // scrollable list and always shown in their own sticky footer instead —
  // they're not something to search for, and shouldn't disappear or have
  // to be scrolled past to reach once the list of real options gets long.
  const selectableOptions = options.filter((o) => !o.isAction);
  const actionOptions = options.filter((o) => o.isAction);
  const filtered = searchText.trim()
    ? selectableOptions.filter((o) => [o.label, o.primaryText, o.secondaryText].some((v) => String(v || "").toLowerCase().includes(searchText.toLowerCase())))
    : selectableOptions;

  const handleSelect = (option) => {
    onChange(option.value);
    // An action row (e.g. "+ Create New Batch") doesn't become the field's
    // displayed value — it triggers a side effect (opening a drawer) in the
    // parent instead, so the text reverts to whatever's actually selected.
    setSearchText(option.isAction ? selectedOption?.label || "" : option.label);
    setIsOpen(false);
    setIsFocused(false);
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange(null);
    setSearchText("");
  };

  const openField = () => {
    if (disabled) return;
    setIsFocused(true);
    setIsOpen(true);
  };

  const closeAndRevert = () => {
    setIsFocused(false);
    setIsOpen(false);
    // Typing without clicking a suggestion doesn't count as a selection —
    // snap the visible text back to whatever is actually selected.
    setSearchText(selectedOption?.label || "");
  };

  return (
    <div ref={wrapperRef} style={{ position: "relative" }}>
      <input
        value={searchText}
        disabled={disabled}
        placeholder={placeholder}
        onFocus={openField}
        onClick={openField}
        onChange={(e) => {
          setSearchText(e.target.value);
          setIsOpen(true);
        }}
        onBlur={() => {
          // Delay so a suggestion's onClick still fires before the field
          // reverts (same 120ms pattern as the Vendor Name field).
          blurTimeoutRef.current = setTimeout(closeAndRevert, 120);
        }}
        style={{
          width: "100%",
          height: "40px",
          padding: value ? "0 60px 0 12px" : "0 36px 0 12px",
          borderRadius: "8px",
          border: `1px solid ${hasError ? "var(--status-red-primary)" : isFocused ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-2)"}`,
          fontSize: "var(--text-title-3)",
          color: "var(--neutral-on-surface-primary)",
          background: disabled ? "var(--neutral-surface-grey-lighter)" : "var(--neutral-surface-primary)",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
      {!!value && !disabled && (
        <span
          role="button"
          tabIndex={-1}
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleClear}
          // top is fixed to the input's own half-height (40px / 2), not a
          // "50%" of the wrapper — the wrapper also stacks errorText below
          // the input, and a multi-line message would otherwise pull this
          // icon down with it instead of keeping it centered on the input.
          style={{ position: "absolute", right: "32px", top: "20px", transform: "translateY(-50%)", display: "flex", cursor: "pointer" }}
          aria-label="Clear"
        >
          <CloseIcon size={14} color="var(--neutral-on-surface-tertiary)" />
        </span>
      )}
      <ChevronDownIcon
        size={16}
        color="var(--neutral-on-surface-secondary)"
        style={{
          position: "absolute",
          right: "12px",
          top: "20px",
          transform: `translateY(-50%) ${isOpen ? "rotate(180deg)" : "rotate(0deg)"}`,
          transition: "transform 0.2s ease",
          pointerEvents: "none",
        }}
      />

      {errorText && <span style={{ display: "block", marginTop: "4px", fontSize: "12px", color: "var(--status-red-primary)" }}>{errorText}</span>}

      {isOpen && !disabled && menuRect && typeof document !== "undefined" && createPortal(
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 14999 }} onMouseDown={(e) => e.preventDefault()} onClick={closeAndRevert} />
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              ...(menuRect.openUp ? { bottom: menuRect.bottom } : { top: menuRect.top }),
              left: menuRect.left,
              width: menuRect.width,
              minWidth: "260px",
              maxHeight: `${menuRect.maxHeight}px`,
              display: "flex",
              flexDirection: "column",
              background: "var(--neutral-surface-primary)",
              border: "1px solid var(--neutral-line-separator-1)",
              borderRadius: "12px",
              boxShadow: "0px 8px 20px rgba(27, 27, 27, 0.12)",
              zIndex: 15000,
            }}
          >
            <div style={{ overflowY: "auto", padding: "4px" }}>
              {filtered.length > 0 ? (
                filtered.map((option) => (
                  <div
                    key={option.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "8px",
                      cursor: "pointer",
                      textAlign: "left",
                      background: String(option.value) === String(value) ? "var(--feature-brand-container-lighter)" : "transparent",
                    }}
                    onMouseEnter={(e) => { if (String(option.value) !== String(value)) e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                    onMouseLeave={(e) => { if (String(option.value) !== String(value)) e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)", fontWeight: "var(--font-weight-regular)", textAlign: "left" }}>
                      {option.primaryText || option.label}
                    </div>
                    {(option.secondaryText || renderSecondary) && (
                      <div style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)", textAlign: "left" }}>
                        {renderSecondary ? renderSecondary(option) : option.secondaryText}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style={{ padding: "12px", textAlign: "center", fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>No matches found.</div>
              )}
            </div>

            {actionOptions.length > 0 && (
              <div style={{ flexShrink: 0, borderTop: "1px solid var(--neutral-line-separator-1)", padding: "4px" }}>
                {actionOptions.map((option) => (
                  <div
                    key={option.value}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => handleSelect(option)}
                    style={{ padding: "8px 12px", borderRadius: "8px", cursor: "pointer", textAlign: "left", background: "transparent" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                  >
                    <div style={{ fontSize: "var(--text-title-3)", color: "var(--feature-brand-primary)", fontWeight: "var(--font-weight-bold)", textAlign: "left" }}>
                      {option.primaryText || option.label}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </div>
  );
};
