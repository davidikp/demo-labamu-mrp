import React, { useEffect, useRef, useState } from "react";
import { ChevronDownIcon, CheckIcon } from "../../../components/icons/Icons.jsx";
import { LANGUAGE_OPTIONS } from "../../../constants/appConstants.js";

// Compact EN/ID language switcher for the Customer Portal's own top bar —
// same LANGUAGE_OPTIONS as the main app's Sidebar switcher, but a smaller
// horizontal-header footprint (flag + short label + chevron, menu opens
// downward since this lives at the top of the page rather than the bottom).
export const PortalLanguageSelector = ({ language, onLanguageChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const activeLanguage =
    LANGUAGE_OPTIONS.find((option) => option.id === language) || LANGUAGE_OPTIONS[0];

  return (
    <div ref={containerRef} style={{ position: "relative", flexShrink: 0 }}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        style={{
          height: "36px",
          border: `1px solid ${isOpen ? "var(--feature-brand-primary)" : "var(--neutral-line-separator-1)"}`,
          borderRadius: "999px",
          padding: "0 10px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          cursor: "pointer",
          background: "var(--neutral-surface-primary)",
          boxShadow: isOpen ? "0 0 0 3px rgba(0, 104, 255, 0.08)" : "none",
          transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        }}
      >
        <span style={{ fontSize: "16px", lineHeight: 1 }}>{activeLanguage.flag}</span>
        <span
          style={{
            fontSize: "var(--text-title-3)",
            fontWeight: "var(--font-weight-bold)",
            color: "var(--neutral-on-surface-primary)",
          }}
        >
          {activeLanguage.shortLabel}
        </span>
        <ChevronDownIcon
          size={16}
          color="var(--neutral-on-surface-secondary)"
          style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}
        />
      </button>

      {isOpen ? (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            minWidth: "180px",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "12px",
            boxShadow: "0px 4px 12px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
            padding: "4px",
            zIndex: 300,
          }}
        >
          {LANGUAGE_OPTIONS.map((option) => {
            const isActive = option.id === language;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onLanguageChange?.(option.id);
                  setIsOpen(false);
                }}
                style={{
                  width: "100%",
                  minHeight: "38px",
                  border: "none",
                  borderRadius: "8px",
                  background: isActive ? "var(--feature-brand-container-lighter)" : "transparent",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                <span style={{ fontSize: "14px" }}>{option.flag}</span>
                <span
                  style={{
                    flex: 1,
                    textAlign: "left",
                    fontSize: "var(--text-body)",
                    fontWeight: isActive ? "var(--font-weight-bold)" : "var(--font-weight-regular)",
                    color: isActive ? "var(--feature-brand-primary)" : "var(--neutral-on-surface-primary)",
                  }}
                >
                  {option.label}
                </span>
                {isActive ? <CheckIcon size={14} color="var(--feature-brand-primary)" /> : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
};
