import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FileText } from "../../../components/icons/Icons.jsx";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { timeAgo } from "../../../components/notification/NotificationBell.jsx";
import emailBanner from "../../../assets/email-banner.svg";

// Design tokens from the Labamu email template (Figma: MRP / Quote Link).
const EMAIL_FONT =
  "'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
const BRAND_BLUE = "#006BFF";
const INK = "#282828";
const MUTED = "#535353";
const HAIRLINE = "#E9E9E9";

// "11 Nov 2025" style date for the email summary.
const fmtDate = (iso, lang) => {
  try {
    return new Date(iso).toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "";
  }
};

// Quote validity window — issued date + 14 days.
const addDays = (iso, n) => {
  try {
    const d = new Date(iso);
    d.setDate(d.getDate() + n);
    return d.toISOString();
  } catch {
    return iso;
  }
};

const Contacts = ({ list }) =>
  (list || []).map((c, i) => (
    <span key={`${c.email}-${i}`} data-no-localize>
      {i > 0 ? ", " : ""}
      {c.name ? `${c.name} <${c.email}>` : c.email}
    </span>
  ));

// Circular social badges recreated inline (lucide ships no brand marks).
const SocialBadge = ({ children }) => (
  <span
    style={{
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      background: BRAND_BLUE,
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      color: "#fff",
    }}
  >
    {children}
  </span>
);

const SocialIcons = () => (
  <div style={{ display: "flex", gap: "12px" }}>
    <SocialBadge>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5H16.7V3.6c-.3 0-1.3-.1-2.45-.1-2.42 0-4.08 1.48-4.08 4.2v2.2H7.4V13h2.77v8h3.33z" />
      </svg>
    </SocialBadge>
    <SocialBadge>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="3.5" />
        <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
      </svg>
    </SocialBadge>
    <SocialBadge>
      <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M22 8.2s-.2-1.5-.8-2.1c-.8-.85-1.7-.85-2.1-.9C16.2 5 12 5 12 5h-.02s-4.18 0-7.08.2c-.4.05-1.3.05-2.1.9C2.2 6.7 2 8.2 2 8.2S1.8 9.95 1.8 11.7v1.6c0 1.75.2 3.5.2 3.5s.2 1.5.8 2.1c.8.85 1.85.83 2.3.92C6.7 20 12 20 12 20s4.2-.01 7.1-.21c.4-.05 1.3-.05 2.1-.9.6-.6.8-2.1.8-2.1s.2-1.75.2-3.5v-1.6c0-1.75-.2-3.5-.2-3.5zM9.9 15V9.3l5.4 2.85L9.9 15z" />
      </svg>
    </SocialBadge>
  </div>
);

export const EmailOutboxPage = () => {
  const { emails, language, t } = useNotifications();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState(emails[0]?.id || null);
  const selected = emails.find((e) => e.id === selectedId) || emails[0] || null;

  const L = {
    en: { title: "Email Outbox", sub: "Simulated emails sent by the notification system (not actually delivered).", empty: "No emails yet. Trigger an approval action or use Simulate Event.", to: "To", cc: "CC", from: "From", subject: "Subject", view: "View", help: "Need help? Feel free to reach out to your Labamu PIC for assistance.", summary: "Summary", number: "Number", issued: "Issued Date", validUntil: "Valid Until", paymentTerm: "Payment Term", paymentTermValue: "30 Days", notes: "Notes", quoteNote: "Dear Buyer, we encourage you to accept this offer promptly to secure the best deal available. Your timely response will ensure you don't miss out on this opportunity!" },
    id: { title: "Kotak Keluar Email", sub: "Email simulasi yang dikirim oleh sistem notifikasi (tidak benar-benar terkirim).", empty: "Belum ada email. Lakukan tindakan persetujuan atau gunakan Simulate Event.", to: "Kepada", cc: "CC", from: "Dari", subject: "Subjek", view: "Lihat", help: "Butuh bantuan? Silakan hubungi PIC Labamu Anda untuk bantuan.", summary: "Ringkasan", number: "Nomor", issued: "Tanggal Terbit", validUntil: "Berlaku Hingga", paymentTerm: "Termin Pembayaran", paymentTermValue: "30 Hari", notes: "Catatan", quoteNote: "Yth. Pembeli, kami mendorong Anda untuk menerima penawaran ini segera guna mendapatkan penawaran terbaik. Tanggapan tepat waktu Anda memastikan Anda tidak melewatkan kesempatan ini!" },
  }[language === "id" ? "id" : "en"];

  // Body emails follow a "Hi {name}, {message}" shape — the greeting becomes
  // the bold title and the remaining message becomes the Notes content.
  const emailBody = selected ? t(selected.body) || "" : "";
  const commaIdx = emailBody.indexOf(",");
  const greeting = commaIdx > -1 ? emailBody.slice(0, commaIdx).trim() : emailBody;
  const notesText = commaIdx > -1 ? emailBody.slice(commaIdx + 1).trim() : "";

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

          {/* Detail — branded email preview */}
          <div style={{ flex: 1, background: "#fff", border: "1px solid #E5E7EB", borderRadius: "16px", overflowY: "auto", minWidth: 0 }}>
            {selected ? (
              <div style={{ padding: "24px 28px" }}>
                {/* Email header (unchanged structure): subject, to, cc, from */}
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#1A1D23", margin: "0 0 16px" }}>{t(selected.subject)}</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px", padding: "14px 0", borderTop: "1px solid #F0F1F4", borderBottom: "1px solid #F0F1F4", fontSize: "13px", color: "#374151" }}>
                  <div><b style={{ color: "#6B7280" }}>{L.to}: </b><Contacts list={selected.to} /></div>
                  {selected.cc && selected.cc.length > 0 ? (
                    <div><b style={{ color: "#6B7280" }}>{L.cc}: </b><Contacts list={selected.cc} /></div>
                  ) : null}
                  <div data-no-localize><b style={{ color: "#6B7280" }}>{L.from}: </b>Labamu Manufacturing &lt;no-reply@labamu.com&gt;</div>
                </div>

                {/* Email body — branded Labamu template */}
                <div style={{ marginTop: "18px" }}>
                  <div
                    style={{
                      maxWidth: "600px",
                      margin: "0 auto",
                      background: "#fff",
                      border: `1px solid ${HAIRLINE}`,
                      borderRadius: "24px",
                      overflow: "hidden",
                      fontFamily: EMAIL_FONT,
                    }}
                  >
                    {/* Header banner */}
                    <img src={emailBanner} alt="" style={{ display: "block", width: "100%", height: "auto" }} />

                    {/* Content */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "32px", alignItems: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "20px", alignItems: "center", width: "100%", maxWidth: "536px", paddingTop: "32px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "center", textAlign: "center" }}>
                          <h3 style={{ fontSize: "24px", fontWeight: 700, lineHeight: "34px", letterSpacing: "0.1375px", color: "#000", margin: 0 }}>
                            {greeting}
                          </h3>
                          <p style={{ fontSize: "14px", lineHeight: "20px", letterSpacing: "0.096px", color: INK, margin: 0, whiteSpace: "pre-wrap" }}>
                            {notesText}
                          </p>
                        </div>

                        {selected.entityRoute ? (
                          <button
                            type="button"
                            onClick={() => navigate(selected.entityRoute)}
                            style={{
                              background: BRAND_BLUE,
                              color: "#fff",
                              border: "none",
                              borderRadius: "8px",
                              padding: "8px 12px",
                              fontFamily: EMAIL_FONT,
                              fontSize: "14px",
                              lineHeight: "20px",
                              letterSpacing: "0.096px",
                              cursor: "pointer",
                            }}
                          >
                            {selected.cta ? t(selected.cta) : `${L.view} ${t(selected.moduleLabel)}`}
                          </button>
                        ) : null}

                        {/* Summary + Notes card */}
                        <div style={{ border: `1px solid ${HAIRLINE}`, borderRadius: "12px", padding: "32px", width: "100%", display: "flex", flexDirection: "column", gap: "16px", boxSizing: "border-box" }}>
                          <p style={{ fontSize: "16px", fontWeight: 700, lineHeight: "22px", letterSpacing: "0.11px", color: "#000", margin: 0 }}>
                            {t(selected.moduleLabel)} {L.summary}
                          </p>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "14px", lineHeight: "20px", letterSpacing: "0.096px", color: INK }}>
                            {selected.entityId ? (
                              <p style={{ margin: 0 }} data-no-localize>{t(selected.moduleLabel)} {L.number}: {selected.entityId}</p>
                            ) : null}
                            <p style={{ margin: 0 }}>{L.issued}: <span data-no-localize>{fmtDate(selected.createdAt, language)}</span></p>
                            {selected.module === "quote" ? (
                              <p style={{ margin: 0 }}>{L.validUntil}: <span data-no-localize>{fmtDate(addDays(selected.createdAt, 14), language)}</span></p>
                            ) : null}
                            {selected.module === "invoice" ? (
                              <p style={{ margin: 0 }}>{L.paymentTerm}: <span data-no-localize>{L.paymentTermValue}</span></p>
                            ) : null}
                          </div>
                          {selected.module === "quote" || selected.module === "invoice" ? (
                            <>
                              <div style={{ height: "1px", width: "100%", background: HAIRLINE }} />
                              <p style={{ fontSize: "16px", fontWeight: 700, lineHeight: "22px", letterSpacing: "0.11px", color: "#000", margin: 0 }}>
                                {L.notes}
                              </p>
                              <p style={{ fontSize: "14px", lineHeight: "20px", letterSpacing: "0.096px", color: INK, margin: 0 }}>
                                {selected.module === "quote" ? L.quoteNote : "-"}
                              </p>
                            </>
                          ) : null}
                        </div>
                      </div>

                      {/* Footer */}
                      <div style={{ display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", width: "100%" }}>
                        <p style={{ fontSize: "14px", lineHeight: "20px", letterSpacing: "0.096px", color: INK, textAlign: "center", margin: 0, maxWidth: "475px" }}>
                          {L.help}
                        </p>
                        <div style={{ background: "rgba(230,240,255,0.5)", padding: "24px", width: "100%", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "24px", alignItems: "center", justifyContent: "center" }}>
                          <SocialIcons />
                          <p data-no-localize style={{ fontSize: "12px", lineHeight: "18px", letterSpacing: "0.0825px", color: MUTED, margin: 0 }}>
                            © 2024 PT Labamu Sejahtera Indonesia
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
