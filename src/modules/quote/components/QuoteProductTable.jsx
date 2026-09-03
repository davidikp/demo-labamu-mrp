import React from "react";
import { formatCurrency, getQuoteProductTotal } from "../mock/quoteMocks.js";

// Product list table, extracted from QuoteDetailPage's Products tab so it
// can be shared, unchanged, with the Customer Portal's read view (Figma
// shows the identical table on both surfaces).
export const QuoteProductTable = ({ products = [], currency }) => (
  <div style={{ overflowX: "auto" }}>
    <div style={{ minWidth: "900px", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          display: "flex",
          paddingBottom: "12px",
          borderBottom: "1px solid var(--neutral-line-separator-1)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: "var(--text-title-3)",
        }}
      >
        <div style={{ width: "72px" }}>Image</div>
        <div style={{ flex: "1.6" }}>Product Name</div>
        <div style={{ flex: "1.2" }}>Notes</div>
        <div style={{ flex: "1.2" }}>Attachments</div>
        <div style={{ width: "90px" }}>Qty</div>
        <div style={{ flex: "1" }}>Unit Price</div>
        <div style={{ width: "90px" }}>Discount</div>
        <div style={{ flex: "1" }}>Total Price</div>
      </div>

      {products.length === 0 ? (
        <div style={{ padding: "24px 0", color: "var(--neutral-on-surface-tertiary)" }}>No products added yet.</div>
      ) : (
        products.map((p, idx) => (
          <div
            key={p.id || idx}
            style={{
              display: "flex",
              alignItems: "center",
              padding: "16px 0",
              borderBottom: idx === products.length - 1 ? "none" : "1px solid var(--neutral-line-separator-1)",
              fontSize: "var(--text-title-3)",
            }}
          >
            <div style={{ width: "72px" }}>
              {p.image ? (
                <img src={p.image} alt={p.name} style={{ width: "48px", height: "48px", borderRadius: "8px", objectFit: "cover" }} />
              ) : (
                <div style={{ width: "48px", height: "48px", borderRadius: "8px", background: "var(--neutral-surface-grey-lighter)" }} />
              )}
            </div>
            <div style={{ flex: "1.6", display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ color: "var(--neutral-on-surface-primary)" }}>{p.name}</span>
              <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>{p.sku}</span>
            </div>
            <div style={{ flex: "1.2", color: "var(--neutral-on-surface-secondary)" }}>{p.notes || "—"}</div>
            <div style={{ flex: "1.2", color: "var(--neutral-on-surface-secondary)" }}>{p.attachments || "—"}</div>
            <div style={{ width: "90px" }}>{p.qty} {p.uom || ""}</div>
            <div style={{ flex: "1" }}>{formatCurrency(p.unitPrice, currency)}</div>
            <div style={{ width: "90px" }}>{p.discountPercent ? `${p.discountPercent}%` : "-"}</div>
            <div style={{ flex: "1", fontWeight: "var(--font-weight-bold)" }}>{formatCurrency(getQuoteProductTotal(p), currency)}</div>
          </div>
        ))
      )}
    </div>
  </div>
);
