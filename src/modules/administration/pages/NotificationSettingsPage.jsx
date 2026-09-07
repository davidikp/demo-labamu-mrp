import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { ToggleSwitch } from "../../../components/common/ToggleSwitch.jsx";
import { Tooltip } from "../../../components/atoms/Tooltip.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { ChipTabs } from "../../../ce-ui";
import {
  clearNavigationGuard,
  setNavigationGuard,
} from "../../../utils/navigationGuard.js";
import {
  ALL_NOTIFICATION_RULES,
  DEFAULT_NOTIFICATION_SETTINGS,
  MAX_REMIND_BEFORE_DAYS,
  MIN_REMIND_BEFORE_DAYS,
  NOTIFICATION_GROUPS,
  REMINDER_SUPPORTED_RULE_IDS,
  buildDefaultCompanySettings,
  cloneCompanySettings,
  pickLocalized,
} from "../../../data/notification/notificationDefaults.js";

const cardOuterStyle = {
  border: "1px solid var(--neutral-line-separator-1)",
  borderRadius: "12px",
  padding: "16px 20px",
  display: "flex",
  flexDirection: "column",
  gap: "16px",
};
const cardTopRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  flexWrap: "wrap",
};
const toggleColStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6px",
  minWidth: "64px",
};
// Shared label style for small uppercase meta labels (Permission, In-app, Email).
const metaLabelStyle = {
  fontSize: "12px",
  color: "var(--neutral-on-surface-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

// Darker grey for a locked (disabled + on) toggle so it reads as "on but
// locked", clearly distinct from a disabled-off toggle.
const LOCKED_ON_TOGGLE_CLASS = "!bg-[#9AA0A6]";

const REQUIRED_TOOLTIP = { en: "Required", id: "Wajib" };

// Pseudo-module id for the "All" tab — shows every module's notifications in
// one list, with a big-variant divider + header between each module's group.
const ALL_TAB_ID = "all";
const ALL_TAB_LABEL = { en: "All", id: "Semua" };
// The divider is a normal (non-sticky) element — it scrolls away with the
// previous module's cards instead of following the header. It bleeds
// edge-to-edge past the scroll container's 20px side padding via negative
// margins, so it isn't inset like the notification cards.
const sectionDividerStyle = {
  height: "4px",
  background: "var(--neutral-line-separator-2)",
  margin: "4px -20px",
  flexShrink: 0,
};
// Sticks to the top of the scrollable list (classic sectioned-list header):
// stays pinned while its module's cards scroll past, then the next module's
// header slides up and takes its place once it reaches the top.
const sectionHeaderWrapperStyle = {
  position: "sticky",
  top: 0,
  zIndex: 2,
  background: "var(--neutral-surface-primary)",
  // Bleeds edge-to-edge past the scroll container's 20px side padding (same
  // as the divider) so the white background fully covers that gutter while
  // stuck — otherwise the divider scrolling underneath peeks out at the
  // sides instead of being fully hidden behind the sticky header.
  margin: "0 -20px",
  padding: "0 20px",
};
const sectionHeaderStyle = {
  padding: "8px 0 4px",
  fontSize: "14px",
  fontWeight: "var(--font-weight-bold)",
  color: "var(--neutral-on-surface-secondary)",
  textTransform: "uppercase",
  letterSpacing: "0.02em",
};

// Reminder-timing card chrome (not part of the notification catalog data).
const REMIND_BEFORE_LABEL = { en: "Reminder timing", id: "Waktu pengingat" };
const REMIND_BEFORE_HELPER = {
  en: "Define how long before the {target} the notification should be sent.",
  id: "Tentukan berapa hari sebelum {target} notifikasi akan dikirim.",
};
const REMIND_BEFORE_SEND = { en: "Send", id: "Kirim" };
const REMIND_BEFORE_SUFFIX = {
  en: "days before the {target}",
  id: "hari sebelum {target}",
};
const REMIND_BEFORE_VALIDATION = {
  en: "Remind Day must be between {min}-{max} days",
  id: "Jumlah hari pengingat harus antara {min}-{max} hari",
};
const REMIND_BEFORE_CONFIRMATION = {
  en: "The reminder will be sent {days} days before the {target}.",
  id: "Pengingat akan dikirim {days} hari sebelum {target}.",
};
// Fills {placeholder} tokens in a bilingual template string.
const fillTemplate = (template, values) =>
  Object.entries(values).reduce(
    (str, [key, value]) => str.replaceAll(`{${key}}`, value),
    template
  );

const remindBeforeInvalid = (value) =>
  !Number.isInteger(value) ||
  value < MIN_REMIND_BEFORE_DAYS ||
  value > MAX_REMIND_BEFORE_DAYS;

// Collapse grouped admin toggles (e.g. "Receipt Status Updates") into one row.
const buildDisplayUnits = (items, language) => {
  const units = [];
  const seenGroups = new Set();
  items.forEach((rule) => {
    if (!rule.groupId) {
      units.push({ kind: "rule", key: rule.id, rule, memberIds: [rule.id] });
      return;
    }
    if (seenGroups.has(rule.groupId)) return;
    seenGroups.add(rule.groupId);
    const group = NOTIFICATION_GROUPS[rule.groupId];
    const memberIds = group?.memberIds || [rule.id];
    units.push({
      kind: "group",
      key: rule.groupId,
      memberIds,
      rule: {
        id: rule.groupId,
        name: group?.label ? pickLocalized(group.label, language) : pickLocalized(rule.name, language),
        description: group?.description || {
          en: "Outsourced receipt recorded and fully received updates.",
          id: "Pembaruan saat penerimaan outsource dicatat dan telah diterima sepenuhnya.",
        },
        type: "configurable",
        recipient: rule.recipient,
        permission: rule.permission,
        todo: null,
      },
    });
  });
  return units;
};

const NotificationSettingsPage = ({
  isSidebarCollapsed, // preserved for API compatibility with the shell
  notificationSettings,
  onSaveNotificationSettings,
  language = "en",
}) => {
  const [activeModule, setActiveModule] = useState(ALL_TAB_ID);
  const [searchQuery, setSearchQuery] = useState("");
  const [settings, setSettings] = useState(() =>
    cloneCompanySettings(notificationSettings || buildDefaultCompanySettings())
  );
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    cloneCompanySettings(notificationSettings || buildDefaultCompanySettings())
  );
  const [toastMessage, setToastMessage] = useState("");
  // Pending navigation awaiting discard confirmation: null | {type:"cancel"}
  const [pendingAction, setPendingAction] = useState(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const next = cloneCompanySettings(
      notificationSettings || buildDefaultCompanySettings()
    );
    setSettings(next);
    setSavedSnapshot(cloneCompanySettings(next));
  }, [notificationSettings]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    },
    []
  );

  const showToast = (message) => {
    setToastMessage(message);
    if (toastTimerRef.current) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMessage(""), 3200);
  };

  const isDirty = useMemo(
    () => JSON.stringify(settings) !== JSON.stringify(savedSnapshot),
    [settings, savedSnapshot]
  );

  // Register a navigation guard so leaving Notification Settings with unsaved
  // changes prompts to discard. Switching chip tabs stays internal (not routed
  // through the guard), so drafts persist across modules.
  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
  useEffect(() => {
    const guard = (proceed) => {
      if (!isDirtyRef.current) return true;
      setPendingAction({ type: "leave", proceed });
      return false;
    };
    setNavigationGuard(guard);
    return () => clearNavigationGuard(guard);
  }, []);

  const patchRules = (ids, patch) => {
    setSettings((prev) => {
      const next = { ...prev };
      ids.forEach((id) => {
        next[id] = { ...next[id], ...patch };
      });
      return next;
    });
  };

  const setChannel = (unit, channel, nextValue) => {
    patchRules(unit.memberIds, { [channel]: nextValue });
  };

  const setRemind = (unit, rawValue) => {
    patchRules(unit.memberIds, {
      remindBefore: rawValue === "" ? "" : Number(rawValue),
    });
  };

  const handleSave = () => {
    // Reminder validity is shown inline per input; block the save if anything
    // is still invalid.
    const hasReminderOffender = ALL_NOTIFICATION_RULES.filter((rule) =>
      REMINDER_SUPPORTED_RULE_IDS.has(rule.id)
    ).some((rule) => remindBeforeInvalid(settings[rule.id]?.remindBefore));
    if (hasReminderOffender) return;

    const saved = cloneCompanySettings(settings);
    setSavedSnapshot(saved);
    onSaveNotificationSettings?.(saved);
    showToast("Notification settings saved");
  };

  // Switching module tabs carries the unsaved draft over silently — the
  // discard-changes prompt is reserved for leaving the page entirely (via
  // the navigation guard) or clicking Cancel.
  const requestModule = (id) => {
    if (id === activeModule) return;
    setActiveModule(id);
    setSearchQuery("");
  };

  const requestCancel = () => {
    if (!isDirty) return;
    setPendingAction({ type: "cancel" });
  };

  const confirmDiscard = () => {
    const action = pendingAction;
    setSettings(cloneCompanySettings(savedSnapshot));
    setPendingAction(null);
    if (action?.type === "leave") {
      // Allow the deferred navigation to proceed (component will unmount).
      clearNavigationGuard();
      action.proceed?.();
      return;
    }
    showToast("Changes discarded");
  };

  // Modules sorted ascending by their displayed label — recomputed per
  // language since the EN/ID titles don't share the same alphabetical order.
  const sortedSections = useMemo(
    () =>
      [...DEFAULT_NOTIFICATION_SETTINGS].sort((a, b) =>
        pickLocalized(a.title, language).localeCompare(pickLocalized(b.title, language))
      ),
    [language]
  );

  const chipTabs = useMemo(
    () => [
      {
        id: ALL_TAB_ID,
        label: pickLocalized(ALL_TAB_LABEL, language),
        count: sortedSections.reduce(
          (sum, section) => sum + buildDisplayUnits(section.items, language).length,
          0
        ),
      },
      ...sortedSections.map((section) => ({
        id: section.id,
        label: pickLocalized(section.title, language),
        count: buildDisplayUnits(section.items, language).length,
      })),
    ],
    [sortedSections, language]
  );

  const isAllView = activeModule === ALL_TAB_ID;

  const activeSection = useMemo(
    () =>
      DEFAULT_NOTIFICATION_SETTINGS.find((s) => s.id === activeModule) ||
      DEFAULT_NOTIFICATION_SETTINGS[0],
    [activeModule]
  );

  const renderToggle = (unit, channel) => {
    const primaryId = unit.memberIds[0];
    const state = settings[primaryId] || { inApp: false, email: false };
    const isRequired = unit.kind === "rule" && unit.rule.type === "required";
    if (isRequired) {
      return (
        <Tooltip content={pickLocalized(REQUIRED_TOOLTIP, language)}>
          <span style={{ display: "inline-flex" }}>
            <ToggleSwitch checked disabled className={LOCKED_ON_TOGGLE_CLASS} onChange={() => {}} />
          </span>
        </Tooltip>
      );
    }
    return (
      <ToggleSwitch
        checked={state[channel]}
        onChange={(next) => setChannel(unit, channel, next)}
      />
    );
  };

  const renderRemindBefore = (unit) => {
    const primaryId = unit.memberIds[0];
    if (!REMINDER_SUPPORTED_RULE_IDS.has(primaryId)) return null;
    const value = settings[primaryId]?.remindBefore;
    const invalid = remindBeforeInvalid(value);
    const target = pickLocalized(
      unit.rule.reminderTarget || { en: "target date", id: "tanggal target" },
      language
    );
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "20px",
          padding: "12px 16px",
          borderRadius: "12px",
          border: `1px solid ${
            invalid ? "var(--status-red-primary)" : "var(--neutral-line-separator-1)"
          }`,
          background: "var(--neutral-surface-secondary)",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "2px", flex: "1 1 220px" }}>
          <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}>
            {pickLocalized(REMIND_BEFORE_LABEL, language)}
          </span>
          <span
            style={{
              fontSize: "14px",
              lineHeight: "18px",
              color: "var(--neutral-on-surface-secondary)",
            }}
          >
            {fillTemplate(pickLocalized(REMIND_BEFORE_HELPER, language), { target })}
          </span>
        </div>
        <div
          style={{
            width: "1px",
            alignSelf: "stretch",
            background: "var(--neutral-line-separator-1)",
          }}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: "1 1 280px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
              {pickLocalized(REMIND_BEFORE_SEND, language)}
            </span>
            <input
              type="number"
              min={MIN_REMIND_BEFORE_DAYS}
              max={MAX_REMIND_BEFORE_DAYS}
              step={1}
              value={value ?? ""}
              onChange={(event) => setRemind(unit, event.target.value)}
              onClick={(event) => event.stopPropagation()}
              style={{
                width: "56px",
                height: "34px",
                padding: "0 8px",
                borderRadius: "8px",
                border: `1px solid ${
                  invalid ? "var(--status-red-primary)" : "var(--neutral-line-separator-1)"
                }`,
                fontSize: "var(--text-title-3)",
                textAlign: "center",
                boxSizing: "border-box",
                background: "var(--neutral-surface-primary)",
              }}
            />
            <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)" }}>
              {fillTemplate(pickLocalized(REMIND_BEFORE_SUFFIX, language), { target })}
            </span>
          </div>
          {invalid ? (
            <span
              style={{
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--status-red-primary)",
              }}
            >
              {fillTemplate(pickLocalized(REMIND_BEFORE_VALIDATION, language), {
                min: MIN_REMIND_BEFORE_DAYS,
                max: MAX_REMIND_BEFORE_DAYS,
              })}
            </span>
          ) : (
            <span
              style={{
                fontSize: "12px",
                lineHeight: "16px",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              {fillTemplate(pickLocalized(REMIND_BEFORE_CONFIRMATION, language), {
                days: value ?? MIN_REMIND_BEFORE_DAYS,
                target,
              })}
            </span>
          )}
        </div>
      </div>
    );
  };

  const renderRow = (row) => {
    const isRequired = row.unit.kind === "rule" && row.unit.rule.type === "required";
    return (
      <div key={row.id} style={cardOuterStyle}>
        <div style={cardTopRowStyle}>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", flex: "1 1 320px", minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}>
                {row.name}
              </span>
              {isRequired ? (
                <Tooltip content={pickLocalized(REQUIRED_TOOLTIP, language)}>
                  <StatusBadge variant="blue-light">Required</StatusBadge>
                </Tooltip>
              ) : null}
            </div>
            <span
              style={{
                fontSize: "14px",
                lineHeight: "18px",
                color: "var(--neutral-on-surface-secondary)",
              }}
            >
              {pickLocalized(row.unit.rule.description, language)}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: "140px" }}>
            <span style={metaLabelStyle}>Permission</span>
            <span style={{ fontSize: "var(--text-title-3)" }}>{row.permission || "-"}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
            <div style={toggleColStyle}>
              <span style={metaLabelStyle}>In-app</span>
              {renderToggle(row.unit, "inApp")}
            </div>
            <div style={toggleColStyle}>
              <span style={metaLabelStyle}>Email</span>
              {renderToggle(row.unit, "email")}
            </div>
          </div>
        </div>

        {renderRemindBefore(row.unit)}
      </div>
    );
  };

  const matchesSearch = (unit, q) => {
    if (!q) return true;
    const r = unit.rule;
    return `${pickLocalized(r.name, language)} ${pickLocalized(r.description, language)} ${r.permission || "-"}`
      .toLowerCase()
      .includes(q);
  };

  const rowsForItems = (items, q) =>
    buildDisplayUnits(items, language)
      .filter((unit) => matchesSearch(unit, q))
      .map((unit) => ({
        id: unit.key,
        unit,
        name: pickLocalized(unit.rule.name, language),
        permission: unit.rule.permission,
      }));

  const rows = useMemo(() => {
    if (isAllView) return [];
    const q = searchQuery.trim().toLowerCase();
    return rowsForItems(activeSection.items, q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSection, searchQuery, language, isAllView]);

  // "All" view: one row group per module, in the same ascending order as the
  // tabs, skipping modules with no results so an empty header never appears.
  const groupedRows = useMemo(() => {
    if (!isAllView) return [];
    const q = searchQuery.trim().toLowerCase();
    return sortedSections
      .map((section) => ({ section, rows: rowsForItems(section.items, q) }))
      .filter((group) => group.rows.length > 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAllView, sortedSections, searchQuery, language]);

  return (
    <div
      style={{
        height: "calc(100vh - 64px)",
        padding: "24px 24px 0",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        gap: "20px",
        overflow: "hidden",
        minHeight: 0,
      }}
    >
      {toastMessage ? (
        <div
          style={{
            position: "sticky",
            top: "16px",
            alignSelf: "flex-end",
            background: "var(--status-green-primary)",
            color: "var(--status-green-on-primary)",
            padding: "12px 16px",
            borderRadius: "var(--radius-small)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "var(--elevation-sm)",
            zIndex: 10,
            minWidth: "320px",
            justifyContent: "space-between",
          }}
        >
          <span style={{ fontSize: "var(--text-title-3)" }}>{toastMessage}</span>
          <span
            style={{
              fontWeight: "var(--font-weight-bold)",
              cursor: "pointer",
              fontSize: "var(--text-title-3)",
            }}
            onClick={() => setToastMessage("")}
          >
            Okay
          </span>
        </div>
      ) : null}

      <h1
        style={{
          margin: 0,
          fontSize: "var(--text-large-title)",
          fontWeight: "var(--font-weight-bold)",
        }}
      >
        Company Notification Settings
      </h1>

      {/* Module chip tabs — outside the content card, wrapping instead of scrolling.
          flexShrink:0 keeps this row at its natural (wrapped) height instead of
          being compressed by the flex column, which would otherwise trigger
          ChipTabs' own overflow-x-auto to also scroll vertically (CSS forces a
          "visible" cross-axis to compute as "auto" when the other axis isn't
          visible), clipping the tab rows instead of hugging them. */}
      <div style={{ flexShrink: 0 }}>
        <ChipTabs
          tabs={chipTabs}
          activeTab={activeModule}
          onChange={requestModule}
          className="flex-wrap"
        />
      </div>

      {/* Content card — one card per notification instead of a table row,
          so each item's fields (name, permission, reminder, toggles) sit
          together without needing custom table-column plumbing. */}
      <div
        className="notif-card"
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          // No flex-grow: hug the content when the list is short instead of
          // always stretching to fill the column; flex-shrink stays enabled
          // so a long list is still capped and scrolls internally.
          flex: "0 1 auto",
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 20px 12px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "16px",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>
            <span style={{ fontSize: "16px", fontWeight: "var(--font-weight-bold)" }}>
              {isAllView ? pickLocalized(ALL_TAB_LABEL, language) : pickLocalized(activeSection.title, language)}
            </span>
          </div>
          <TableSearchField
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search notification, description, or permission"
            width="360px"
          />
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "12px",
            padding: "0 20px 20px",
            overflow: "auto",
            minHeight: 0,
            flex: "1 1 auto",
          }}
        >
          {isAllView ? (
            <>
              {groupedRows.map((group, index) => (
                <React.Fragment key={group.section.id}>
                  {index > 0 ? <div style={sectionDividerStyle} /> : null}
                  <div style={sectionHeaderWrapperStyle}>
                    <div style={sectionHeaderStyle}>
                      {pickLocalized(group.section.title, language)}
                    </div>
                  </div>
                  {group.rows.map((row) => renderRow(row))}
                </React.Fragment>
              ))}
              {groupedRows.length === 0 ? (
                <div
                  style={{
                    padding: "32px 0",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-secondary)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  No notifications match your search.
                </div>
              ) : null}
            </>
          ) : (
            <>
              {rows.map((row) => renderRow(row))}
              {rows.length === 0 ? (
                <div
                  style={{
                    padding: "32px 0",
                    textAlign: "center",
                    color: "var(--neutral-on-surface-secondary)",
                    fontSize: "var(--text-title-3)",
                  }}
                >
                  No notifications match your search.
                </div>
              ) : null}
            </>
          )}
        </div>
      </div>

      {/* Footer action bar */}
      <div
        style={{
          position: "sticky",
          bottom: 0,
          marginTop: "auto",
          marginLeft: "-24px",
          marginRight: "-24px",
          padding: "16px 24px",
          background: "var(--neutral-surface-primary)",
          borderTop: "1px solid var(--neutral-line-separator-1)",
          boxShadow: "0 -4px 12px rgba(0,0,0,0.04)",
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: "12px",
          zIndex: 5,
        }}
      >
        <Button variant="outlined" size="large" onClick={requestCancel}>
          Cancel
        </Button>
        <Button variant="filled" size="large" onClick={handleSave}>
          Save Changes
        </Button>
      </div>

      {/* Discard-changes confirmation modal (matches Purchase Order create). */}
      <GeneralModal
        isOpen={pendingAction !== null}
        onClose={() => setPendingAction(null)}
        title="Discard changes?"
        description="Your changes to the company notification settings will be lost if you leave this page."
        hideFooterDivider
        footer={
          <div style={{ display: "flex", gap: "12px", width: "100%", marginTop: "24px" }}>
            <Button
              variant="outlined"
              size="large"
              style={{ width: "100%" }}
              onClick={() => setPendingAction(null)}
            >
              Keep Editing
            </Button>
            <Button
              variant="filled"
              size="large"
              style={{ width: "100%" }}
              onClick={confirmDiscard}
            >
              Yes, Discard
            </Button>
          </div>
        }
      />
    </div>
  );
};

export { NotificationSettingsPage };
