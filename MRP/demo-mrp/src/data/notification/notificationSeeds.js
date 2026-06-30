// Comprehensive mock seed data — one entry per notification trigger in the
// catalog, so every notification + Todo + email can be reviewed on load.
//
// Each entry: { module, trigger, ctx }.
//   - For "submitted" events, `submitterName` is another teammate (the current
//     user receives it as a configured approver).
//   - For outcome events, omit `submitterName` so it defaults to the current
//     user (they are the latest submitter and the recipient).
//   - Customer / material-request names, reasons and notes are sample values.
//
// The NotificationSeeder injects the current user as the personal recipient
// (submitter / PIC / requester / preparer / WO creator) and a staggered
// timestamp, then builds the records directly (bypassing the 60s dedupe).

export const SEED_NOTIFICATION_EVENTS = [
  // ---- RFQ ----
  { module: "rfq", trigger: "submitted", ctx: { entityId: "RFQ-202606-001", submitterName: "Budi Santoso" } },
  { module: "rfq", trigger: "one_approved", ctx: { entityId: "RFQ-202606-002", approverName: "Joko" } },
  { module: "rfq", trigger: "all_approved", ctx: { entityId: "RFQ-202606-003" } },
  { module: "rfq", trigger: "rejected", ctx: { entityId: "RFQ-202606-004", approverName: "Joko", reason: "Supplier list incomplete — add at least 2 more vendors" } },
  { module: "rfq", trigger: "need_revision", ctx: { entityId: "RFQ-202606-005", approverName: "Joko", note: "Update the target delivery date to next month" } },

  // ---- Quote (internal approval) ----
  { module: "quote", trigger: "submitted", ctx: { entityId: "QUO-202606-001", submitterName: "Sarah Johnson" } },
  { module: "quote", trigger: "one_approved", ctx: { entityId: "QUO-202606-002", approverName: "Joko" } },
  { module: "quote", trigger: "all_approved", ctx: { entityId: "QUO-202606-003" } },
  { module: "quote", trigger: "rejected", ctx: { entityId: "QUO-202606-004", approverName: "Joko", reason: "Margin is below the approved threshold" } },
  { module: "quote", trigger: "need_revision", ctx: { entityId: "QUO-202606-005", approverName: "Joko", note: "Add the payment terms and T&C section" } },

  // ---- Quote (customer approval, any-one-wins) ----
  { module: "quote", trigger: "customer_approved", ctx: { entityId: "QUO-202606-010", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech" } },
  { module: "quote", trigger: "customer_rejected", ctx: { entityId: "QUO-202606-011", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", reason: "Budget not approved this quarter" } },
  { module: "quote", trigger: "customer_revision", ctx: { entityId: "QUO-202606-012", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", note: "Please reduce the quantity to 80 units" } },

  // ---- Order ----
  { module: "order", trigger: "submitted", ctx: { entityId: "ORD-202606-001", submitterName: "Sarah Johnson" } },
  { module: "order", trigger: "one_approved", ctx: { entityId: "ORD-202606-002", approverName: "Joko" } },
  { module: "order", trigger: "all_approved", ctx: { entityId: "ORD-202606-003" } },
  { module: "order", trigger: "rejected", ctx: { entityId: "ORD-202606-004", approverName: "Joko", reason: "Customer credit is on hold" } },
  { module: "order", trigger: "need_revision", ctx: { entityId: "ORD-202606-005", approverName: "Joko", note: "Confirm the planned start date with production" } },

  // ---- Purchase Order ----
  { module: "purchase_order", trigger: "submitted", ctx: { entityId: "PO-202606-001", submitterName: "Budi Santoso" } },
  { module: "purchase_order", trigger: "one_approved", ctx: { entityId: "PO-202606-002", approverName: "Joko" } },
  { module: "purchase_order", trigger: "all_approved", ctx: { entityId: "PO-202606-003" } },
  { module: "purchase_order", trigger: "wo_cross_module", ctx: { entityId: "PO-202606-003", workOrderNo: "WO-202606-0001" } },
  { module: "purchase_order", trigger: "rejected", ctx: { entityId: "PO-202606-004", approverName: "Joko", reason: "Vendor quotation has expired" } },
  { module: "purchase_order", trigger: "need_revision", ctx: { entityId: "PO-202606-005", approverName: "Joko", note: "Re-check unit prices against the latest RFQ" } },

  // ---- Custom Product Request ----
  { module: "custom_product_request", trigger: "submitted", ctx: { entityId: "CPR-202606-001", submitterName: "Sarah Johnson" } },
  { module: "custom_product_request", trigger: "one_approved", ctx: { entityId: "CPR-202606-002", approverName: "Joko" } },
  { module: "custom_product_request", trigger: "all_approved", ctx: { entityId: "CPR-202606-003" } },
  { module: "custom_product_request", trigger: "rejected", ctx: { entityId: "CPR-202606-004", approverName: "Joko", reason: "Design is not feasible with current tooling" } },
  { module: "custom_product_request", trigger: "need_revision", ctx: { entityId: "CPR-202606-005", approverName: "Joko", note: "Provide the material spec sheet" } },

  // ---- Invoice (customer approval + payment proof) ----
  { module: "invoice", trigger: "customer_approved", ctx: { entityId: "INV-202606-001", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech" } },
  { module: "invoice", trigger: "customer_rejected", ctx: { entityId: "INV-202606-002", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", reason: "Amount does not match the PO" } },
  { module: "invoice", trigger: "customer_revision", ctx: { entityId: "INV-202606-003", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech", note: "Please split this into two invoices" } },
  { module: "invoice", trigger: "proof_uploaded", ctx: { entityId: "INV-202606-004", customerPicName: "Andi Wijaya", customerCompany: "PT Global Tech" } },
  { module: "invoice", trigger: "proof_rejected", ctx: { entityId: "INV-202606-005", customerPicName: "Andi Wijaya", customerEmail: "andi.wijaya@globaltech.com", reason: "The proof is blurry and the amount is unreadable" } },

  // ---- Material Request ----
  { module: "material_request", trigger: "transfer_started", ctx: { entityId: "MR-202606-001", preparerName: "Joko", workOrderNo: "WO-202606-0001" } },
  { module: "material_request", trigger: "receipt_confirmed", ctx: { entityId: "MR-202606-002", requesterName: "Joko" } },
  { module: "material_request", trigger: "receipt_rejected", ctx: { entityId: "MR-202606-003", requesterName: "Joko", reason: "Quantity received is short by 5 units" } },
  { module: "material_request", trigger: "cancelled_by_preparer", ctx: { entityId: "MR-202606-004", preparerName: "Joko" } },
];
