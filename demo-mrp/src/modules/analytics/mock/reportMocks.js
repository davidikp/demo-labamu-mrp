
export const MOCK_REPORT_POS = [
  // 1. Open / Not Due
  {
    id: "po-open",
    poNumber: "PO-202606-0001",
    vendorName: "PT Baru Buka",
    amount: 10000000,
    status: "Issued",
    createdDate: "2026-06-01",
    invoices: [
      {
        id: "inv-open",
        number: "INV/BB/001",
        amount: 10000000,
        dueDate: "2026-06-25", // Not due
        status: "Unpaid",
        payments: []
      }
    ]
  },
  // 2. Partially Paid / Not Due
  {
    id: "po-partial",
    poNumber: "PO-202606-0002",
    vendorName: "CV Sebagian",
    amount: 20000000,
    status: "Issued",
    createdDate: "2026-06-02",
    invoices: [
      {
        id: "inv-partial",
        number: "INV/CS/001",
        amount: 20000000,
        dueDate: "2026-06-28", // Not due
        status: "Partially Paid",
        payments: [{ amount: 5000000, date: "2026-06-05" }]
      }
    ]
  },
  // 3. Paid / Not Due
  {
    id: "po-paid",
    poNumber: "PO-202606-0003",
    vendorName: "PT Lunas",
    amount: 15000000,
    status: "Completed",
    createdDate: "2026-05-20",
    invoices: [
      {
        id: "inv-paid",
        number: "INV/PL/001",
        amount: 15000000,
        dueDate: "2026-06-15", // Not due, but Paid
        status: "Settled",
        payments: [{ amount: 15000000, date: "2026-06-01" }]
      }
    ]
  },
  // 4. Overdue / Late 1-30
  {
    id: "po-late1",
    poNumber: "PO-202605-0001",
    vendorName: "PT Telat Dikit",
    amount: 12000000,
    status: "Issued",
    createdDate: "2026-05-01",
    invoices: [
      {
        id: "inv-late1",
        number: "INV/TD/001",
        amount: 12000000,
        dueDate: "2026-05-25", // Late ~16 days
        status: "Unpaid",
        payments: []
      }
    ]
  },
  // 5. Overdue / Late 31-60
  {
    id: "po-late2",
    poNumber: "PO-202604-0001",
    vendorName: "CV Lumayan Telat",
    amount: 18000000,
    status: "Issued",
    createdDate: "2026-04-01",
    invoices: [
      {
        id: "inv-late2",
        number: "INV/LT/001",
        amount: 18000000,
        dueDate: "2026-04-20", // Late ~51 days
        status: "Unpaid",
        payments: []
      }
    ]
  },
  // 6. Overdue / Late 61-90 (Partially Paid)
  {
    id: "po-late3",
    poNumber: "PO-202603-0001",
    vendorName: "PT Telat Banget",
    amount: 25000000,
    status: "Issued",
    createdDate: "2026-03-01",
    invoices: [
      {
        id: "inv-late3",
        number: "INV/TB/001",
        amount: 25000000,
        dueDate: "2026-03-25", // Late ~77 days
        status: "Partially Paid",
        payments: [{ amount: 10000000, date: "2026-04-01" }]
      }
    ]
  },
  // 7. Overdue / Late 90+
  {
    id: "po-late4",
    poNumber: "PO-202602-0001",
    vendorName: "CV Parah",
    amount: 30000000,
    status: "Issued",
    createdDate: "2026-02-01",
    invoices: [
      {
        id: "inv-late4",
        number: "INV/CP/001",
        amount: 30000000,
        dueDate: "2026-02-25", // Late ~105 days
        status: "Unpaid",
        payments: []
      }
    ]
  }
].filter(po => ["Issued", "Completed"].includes(po.status));
