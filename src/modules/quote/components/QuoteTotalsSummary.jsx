import React from "react";
import { formatCurrency, getQuoteSubtotal } from "../mock/quoteMocks.js";

// Subtotal/Tax/Shipping/Other Fee/Total block, extracted from
// QuoteDetailPage's Products tab so it can be shared, unchanged, with the
// Customer Portal's read view.
export const QuoteTotalsSummary = ({ products = [], currency, taxRatePercent = 0, shippingFee = 0, otherFee = 0 }) => {
  const subtotal = getQuoteSubtotal(products);
  const taxAmount = subtotal * ((taxRatePercent || 0) / 100);
  const total = subtotal + taxAmount + (shippingFee || 0) + (otherFee || 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal, currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
        <span>Tax Rate ({taxRatePercent || 0}%)</span>
        <span>{formatCurrency(taxAmount, currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
        <span>Shipping Fee</span>
        <span>{formatCurrency(shippingFee, currency)}</span>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", color: "var(--neutral-on-surface-secondary)", fontSize: "14px" }}>
        <span>Other Fee</span>
        <span>{formatCurrency(otherFee, currency)}</span>
      </div>
      <div style={{ borderTop: "1px solid var(--neutral-line-separator-1)", margin: "4px 0" }} />
      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: "var(--font-weight-bold)", fontSize: "var(--text-title-1)" }}>
        <span>Total</span>
        <span style={{ color: "var(--neutral-on-surface-primary)" }}>{formatCurrency(total, currency)}</span>
      </div>
    </div>
  );
};
