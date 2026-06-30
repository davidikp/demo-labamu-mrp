import React, { useState } from "react";
import { FileText, ChevronRight } from "../../../components/icons/Icons.jsx";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { timeAgo } from "../../../components/notification/NotificationBell.jsx";

const Contacts = ({ list }) =>
  (list || []).map((c, i) => (
    <span key={`${c.email}-${i}`} data-no-localize>
      {i > 0 ? ", " : ""}
      {c.name ? `${c.name} <${c.email}>` : c.email}
    </span>
  ));

export const EmailOutboxPage = () => {
  const { emails, language, t } = useNotifications();
  const [selectedId, setSelectedId] = useState(emails[0]?.id || null);
  const selected = emails.find((e) => e.id === selectedId) || emails[0] || null;

  const L = {
    en: { title: "Email Outbox", sub: "Simulated emails sent by the notification system (not actually delivered).", empty: "No emails yet. Trigger an approval action or use Simulate Event.", to: "To", cc: "CC", subject: "Subject" },
    id: { title: "Kotak Keluar Email", sub: "Email simulasi yang dikirim oleh sistem notifikasi (tidak benar-benar terkirim).", empty: "Belum ada email. Lakukan tindakan persetujuan atau gunakan Simulate Event.", to: "Kepada", cc: "CC", subject: "Subjek" },
  }[language === "id" ? "id" : "en"];

  return (
    <div style={{ height: "calc(100vh - 64px)", background: "#F5F6FA", overflow: "hidden", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "28px 32px 16px", flexShrink: 0 }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#1A1D23", margin: 0 }}>{L.title}</h1>
        <p style={{ fontSize: "13px", color: "#6B7280", margin: "6px 0 0" }}>{L.sub}</p>
      </div>

      {emails.length === 0 ? (
        <div style={{ padding: "60px 24px", textAlign: "center", color: "#6B7280" }}>{L.empty}</div>
      ) : (
        <div style={{ display: "flex", gap: "16px", padding: "0 32px 32px", flex: 1, minHeight: 0 }}>
          {/* List */}
          <div style={{ width: "360px", flexShrink: 0, background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflowY: "auto" }}>
            {emails.map((e) => (
              <button
                key={e.id}
                type="button"
                onClick={() => setSelectedId(e.id)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  borderBottom: "1px solid #F0F1F4",
                  background: selected?.id === e.id ? "var(--feature-brand-container-lighter)" : "transparent",
                  padding: "14px 16px",
                  cursor: "pointer",
                  display: "flex",
                  gap: "10px",
                  alignItems: "flex-start",
                }}
              >
                <FileText size={18} color={e.color} style={{ marginTop: "2px", flexShrink: 0 }} />
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "8px" }}>
                    <span data-no-localize style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: e.color }}>{t(e.moduleLabel)}</span>
                    <span data-no-localize style={{ fontSize: "11px", color: "#9CA3AF", whiteSpace: "nowrap" }}>{timeAgo(e.createdAt, language)}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#1A1D23", marginTop: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {t(e.subject)}
                  </div>
                  <div style={{ fontSize: "11px", color: "#6B7280", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    <Contacts list={e.to} />
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Detail */}
          <div style={{ flex: 1, background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflowY: "auto", minWidth: 0 }}>
            {selected ? (
              <div style={{ padding: "24px 28px" }}>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1D23", margin: "0 0 16px" }}>{t(selected.subject)}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "14px 0", borderTop: "1px solid #F0F1F4", borderBottom: "1px solid #F0F1F4", fontSize: "13px", color: "#374151" }}>
                  <div><b style={{ color: "#6B7280" }}>{L.to}: </b><Contacts list={selected.to} /></div>
                  {selected.cc && selected.cc.length > 0 ? (
                    <div><b style={{ color: "#6B7280" }}>{L.cc}: </b><Contacts list={selected.cc} /></div>
                  ) : null}
                </div>
                <p style={{ fontSize: "14px", color: "#1A1D23", lineHeight: 1.6, marginTop: "18px", whiteSpace: "pre-wrap" }}>
                  {t(selected.body)}
                </p>
                {selected.entityRoute ? (
                  <div style={{ marginTop: "18px", display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "13px", fontWeight: 700, color: "var(--feature-brand-primary)" }}>
                    {t(selected.moduleLabel)} {selected.entityId} <ChevronRight size={14} />
                  </div>
                ) : null}
                <div style={{ marginTop: "24px", padding: "12px 14px", background: "#F8F9FB", borderRadius: "10px", fontSize: "11px", color: "#9CA3AF" }} data-no-localize>
                  From: Labamu Manufacturing &lt;no-reply@labamu.com&gt;
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
