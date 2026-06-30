import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton } from "../atoms/IconButton.jsx";
import { Button } from "../common/Button.jsx";
import { Bell, Trash2, ChevronRight } from "../icons/Icons.jsx";
import { ChipTabs } from "../../ce-ui";
import { useNotifications } from "../../context/NotificationContext.jsx";

export const timeAgo = (iso, language = "en") => {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  const diff = Math.max(0, Date.now() - then);
  const mins = Math.floor(diff / 60000);
  const labels =
    language === "id"
      ? { now: "Baru saja", m: "mnt lalu", h: "jam lalu", d: "hari lalu" }
      : { now: "Just now", m: "m ago", h: "h ago", d: "d ago" };
  if (mins < 1) return labels.now;
  if (mins < 60) return `${mins}${language === "id" ? " " : ""}${labels.m}`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}${language === "id" ? " " : ""}${labels.h}`;
  const days = Math.floor(hrs / 24);
  return `${days}${language === "id" ? " " : ""}${labels.d}`;
};

export const NotificationBell = () => {
  const navigate = useNavigate();
  const {
    language,
    notifications,
    unreadCount,
    markRead,
    markAllRead,
    deleteNotification,
    t,
  } = useNotifications();

  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const bellRef = useRef(null);
  const panelRef = useRef(null);
  const [pos, setPos] = useState({ top: 72, left: 0 });

  const updatePos = () => {
    if (!bellRef.current || typeof window === "undefined") return;
    const rect = bellRef.current.getBoundingClientRect();
    const width = Math.min(420, window.innerWidth - 32);
    setPos({
      top: rect.bottom + 12,
      left: Math.min(Math.max(16, rect.right - width), window.innerWidth - width - 16),
    });
  };

  useEffect(() => {
    if (!open) return undefined;
    updatePos();
    const onDown = (e) => {
      if (bellRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onMove = () => updatePos();
    document.addEventListener("mousedown", onDown);
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  }, [open]);

  const handleOpenItem = (item) => {
    markRead(item.id);
    if (item.entityRoute) navigate(item.entityRoute);
    setOpen(false);
  };

  const L = {
    en: { title: "Notification", markAll: "Mark all as read", empty: "You're all caught up.", emptyTitle: "No notifications" },
    id: { title: "Notifikasi", markAll: "Tandai semua dibaca", empty: "Anda sudah selesai.", emptyTitle: "Tidak ada notifikasi" },
  }[language === "id" ? "id" : "en"];

  // Group notifications by module (newest-first preserved) to drive the filter
  // chips, then show a flat list filtered to the active chip.
  const groups = [];
  const groupIndex = new Map();
  notifications.forEach((item) => {
    let g = groupIndex.get(item.module);
    if (!g) {
      g = { module: item.module, label: item.moduleLabel, color: item.color, items: [] };
      groupIndex.set(item.module, g);
      groups.push(g);
    }
    g.items.push(item);
  });

  const allLabel = language === "id" ? "Semua" : "All";
  const tabs = [
    { id: "all", label: allLabel, count: notifications.length },
    ...groups.map((g) => ({ id: g.module, label: t(g.label), count: g.items.length })),
  ];
  const effectiveTab = activeTab !== "all" && groupIndex.has(activeTab) ? activeTab : "all";
  const visibleNotifications =
    effectiveTab === "all" ? notifications : groupIndex.get(effectiveTab).items;

  // Bucket the (chip-filtered) list by day: Today / Yesterday / This Week / Earlier.
  const dayLabels = {
    en: { today: "Today", yesterday: "Yesterday", week: "This Week", earlier: "Earlier" },
    id: { today: "Hari Ini", yesterday: "Kemarin", week: "Minggu Ini", earlier: "Sebelumnya" },
  }[language === "id" ? "id" : "en"];
  const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const todayStart = startOfDay(Date.now());
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 6 * 86400000;
  const bucketOf = (iso) => {
    const ts = new Date(iso).getTime();
    if (ts >= todayStart) return "today";
    if (ts >= yesterdayStart) return "yesterday";
    if (ts >= weekStart) return "week";
    return "earlier";
  };
  const dayBuckets = [];
  const bucketIndex = new Map();
  visibleNotifications.forEach((item) => {
    const key = bucketOf(item.createdAt);
    let b = bucketIndex.get(key);
    if (!b) {
      b = { key, label: dayLabels[key], items: [] };
      bucketIndex.set(key, b);
    }
    b.items.push(item);
  });
  const orderedBuckets = ["today", "yesterday", "week", "earlier"]
    .map((k) => bucketIndex.get(k))
    .filter(Boolean);

  const renderItem = (item) => (
    <div
      key={item.id}
      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--neutral-surface-grey-lighter)")}
      onMouseLeave={(e) => (e.currentTarget.style.background = item.unread ? "var(--feature-brand-container-lighter)" : "transparent")}
      style={{
        display: "flex",
        gap: "10px",
        padding: "14px 18px",
        borderBottom: "1px solid var(--neutral-line-separator-1)",
        background: item.unread ? "var(--feature-brand-container-lighter)" : "transparent",
        cursor: "pointer",
      }}
      onClick={() => handleOpenItem(item)}
    >
      {item.unread ? (
        <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--feature-brand-primary)", marginTop: "6px", flexShrink: 0 }} />
      ) : (
        <span style={{ width: "8px", flexShrink: 0 }} />
      )}
      <div style={{ minWidth: 0, flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "space-between" }}>
          <span
            data-no-localize
            style={{
              fontSize: "10px",
              fontWeight: 700,
              letterSpacing: "0.02em",
              textTransform: "uppercase",
              color: item.color,
              background: `${item.color}1A`,
              padding: "2px 8px",
              borderRadius: "6px",
              whiteSpace: "nowrap",
            }}
          >
            {t(item.moduleLabel)}
          </span>
          <span data-no-localize style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)", whiteSpace: "nowrap", flexShrink: 0 }}>
            {timeAgo(item.createdAt, language)}
          </span>
        </div>
        <span style={{ fontSize: "13px", fontWeight: item.unread ? 700 : 600, color: "var(--neutral-on-surface-primary)", lineHeight: 1.35 }}>
          {t(item.title)}
        </span>
        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-secondary)", lineHeight: 1.4 }}>
          {t(item.body)}
        </span>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "2px" }}>
          <span
            style={{ display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "12px", fontWeight: 700, color: "var(--feature-brand-primary)" }}
            onClick={(e) => { e.stopPropagation(); handleOpenItem(item); }}
          >
            {t(item.cta)} <ChevronRight size={13} />
          </span>
          <button
            type="button"
            title="Delete"
            onClick={(e) => { e.stopPropagation(); deleteNotification(item.id); }}
            style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--neutral-on-surface-tertiary)", padding: "2px", display: "inline-flex" }}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div style={{ position: "relative", display: "inline-flex" }}>
        <IconButton
          ref={bellRef}
          icon={Bell}
          size="small"
          title={L.title}
          color="var(--neutral-on-surface-primary)"
          onClick={() => setOpen((p) => !p)}
        />
        {unreadCount > 0 ? (
          <div
            data-no-localize
            style={{
              position: "absolute",
              top: "-4px",
              right: "-6px",
              minWidth: "20px",
              height: "20px",
              padding: "0 6px",
              borderRadius: "999px",
              background: "var(--status-orange-primary)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "10px",
              fontWeight: 700,
              border: "2px solid var(--neutral-surface-primary)",
              boxSizing: "border-box",
              pointerEvents: "none",
            }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        ) : null}
      </div>

      {open ? (
        <div
          ref={panelRef}
          style={{
            position: "fixed",
            top: `${pos.top}px`,
            left: `${pos.left}px`,
            width: "420px",
            maxWidth: "calc(100vw - 32px)",
            maxHeight: "78vh",
            background: "var(--neutral-surface-primary)",
            border: "1px solid var(--neutral-line-separator-1)",
            borderRadius: "16px",
            boxShadow: "0px 16px 40px rgba(17, 24, 39, 0.18)",
            zIndex: 120,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "18px 20px 14px",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              borderBottom: "1px solid var(--neutral-line-separator-1)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--neutral-on-surface-primary)" }}>
                  {L.title}
                </span>
                {unreadCount > 0 ? (
                  <span
                    data-no-localize
                    style={{
                      minWidth: "24px",
                      height: "24px",
                      padding: "0 8px",
                      borderRadius: "8px",
                      background: "var(--status-orange-primary)",
                      color: "#fff",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "12px",
                      fontWeight: 700,
                    }}
                  >
                    {unreadCount}
                  </span>
                ) : null}
              </div>
              <Button variant="tertiary" size="small" onClick={markAllRead} disabled={unreadCount === 0}>
                {L.markAll}
              </Button>
            </div>
            {notifications.length > 0 ? (
              <ChipTabs tabs={tabs} activeTab={effectiveTab} onChange={setActiveTab} size="sm" />
            ) : null}
          </div>

          <div style={{ flex: "1 1 auto", overflowY: "auto", minHeight: 0 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: "48px 24px", textAlign: "center", display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--neutral-on-surface-primary)" }}>
                  {L.emptyTitle}
                </span>
                <span style={{ fontSize: "13px", color: "var(--neutral-on-surface-secondary)" }}>{L.empty}</span>
              </div>
            ) : (
              orderedBuckets.map((bucket) => (
                <div key={bucket.key}>
                  <div
                    style={{
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      padding: "10px 18px 6px",
                      background: "var(--neutral-surface-primary)",
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "var(--neutral-on-surface-secondary)",
                    }}
                  >
                    {bucket.label}
                  </div>
                  {bucket.items.map((item) => renderItem(item))}
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </>
  );
};
