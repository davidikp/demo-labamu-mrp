
const RAW_MOCK_REPORT_POS = [
  {
    id: "po-1",
    poNumber: "PO-202606-0001",
    vendorName: "PT Sukses Selalu",
    amount: 15000000,
    status: "Issued",
    createdDate: "2026-06-01",
    invoices: [{ id: "inv-1", number: "INV/SS/001", amount: 15000000, dueDate: "2026-06-25", status: "Unpaid", payments: [] }] // Not Due, Open
  },
  {
    id: "po-2",
    poNumber: "PO-202606-0002",
    vendorName: "CV Maju Terus",
    amount: 10000000,
    status: "Issued",
    createdDate: "2026-06-02",
    invoices: [{ id: "inv-2", number: "INV/MT/001", amount: 10000000, dueDate: "2026-06-25", status: "Partially Paid", payments: [{ amount: 5000000, date: "2026-06-05" }] }] // Not Due, Partially Paid
  },
  {
    id: "po-3",
    poNumber: "PO-202606-0003",
    vendorName: "PT Bintang Timur",
    amount: 12000000,
    status: "Completed",
    createdDate: "2026-06-03",
    invoices: [{ id: "inv-3", number: "INV/BT/001", amount: 12000000, dueDate: "2026-06-25", status: "Settled", payments: [{ amount: 12000000, date: "2026-06-05" }] }] // Not Due, Paid
  },
  {
    id: "po-4",
    poNumber: "PO-202605-0004",
    vendorName: "PT Cahaya Abadi",
    amount: 8000000,
    status: "Issued",
    createdDate: "2026-05-10",
    invoices: [{ id: "inv-4", number: "INV/CA/001", amount: 8000000, dueDate: "2026-05-25", status: "Unpaid", payments: [] }] // Late 1-30, Overdue
  },
  {
    id: "po-5",
    poNumber: "PO-202605-0005",
    vendorName: "CV Kayu Makmur",
    amount: 9000000,
    status: "Issued",
    createdDate: "2026-05-11",
    invoices: [{ id: "inv-5", number: "INV/KM/001", amount: 9000000, dueDate: "2026-05-25", status: "Partially Paid", payments: [{ amount: 3000000, date: "2026-05-15" }] }] // Late 1-30, Partially Paid
  },
  {
    id: "po-6",
    poNumber: "PO-202605-0006",
    vendorName: "PT Mitra Sejahtera",
    amount: 6000000,
    status: "Completed",
    createdDate: "2026-05-12",
    invoices: [{ id: "inv-6", number: "INV/MS/001", amount: 6000000, dueDate: "2026-05-25", status: "Settled", payments: [{ amount: 6000000, date: "2026-06-01" }] }] // Late 1-30, Paid
  },
  {
    id: "po-7",
    poNumber: "PO-202604-0007",
    vendorName: "PT Galaksi Jaya",
    amount: 14000000,
    status: "Issued",
    createdDate: "2026-04-05",
    invoices: [{ id: "inv-7", number: "INV/GJ/001", amount: 14000000, dueDate: "2026-04-20", status: "Unpaid", payments: [] }] // Late 31-60, Overdue
  },
  {
    id: "po-8",
    poNumber: "PO-202604-0008",
    vendorName: "Bintang Sejahtera",
    amount: 11000000,
    status: "Issued",
    createdDate: "2026-04-06",
    invoices: [{ id: "inv-8", number: "INV/BS/001", amount: 11000000, dueDate: "2026-04-20", status: "Partially Paid", payments: [{ amount: 5000000, date: "2026-04-10" }] }] // Late 31-60, Partially Paid
  },
  {
    id: "po-9",
    poNumber: "PO-202603-0009",
    vendorName: "PT Sukses Selalu",
    amount: 20000000,
    status: "Issued",
    createdDate: "2026-03-05",
    invoices: [{ id: "inv-9", number: "INV/SS/002", amount: 20000000, dueDate: "2026-03-20", status: "Unpaid", payments: [] }] // Late 61-90, Overdue
  },
  {
    id: "po-10",
    poNumber: "PO-202602-0010",
    vendorName: "CV Maju Terus",
    amount: 25000000,
    status: "Issued",
    createdDate: "2026-02-01",
    invoices: [{ id: "inv-10", number: "INV/MT/002", amount: 25000000, dueDate: "2026-02-15", status: "Unpaid", payments: [] }] // Late 90+, Overdue
  },
  {
    id: "po-11",
    poNumber: "PO-202602-0011",
    vendorName: "PT Bintang Timur",
    amount: 30000000,
    status: "Issued",
    createdDate: "2026-02-02",
    invoices: [{ id: "inv-11", number: "INV/BT/002", amount: 30000000, dueDate: "2026-02-15", status: "Partially Paid", payments: [{ amount: 10000000, date: "2026-03-01" }] }] // Late 90+, Partially Paid
  }
];

export const MOCK_REPORT_POS = RAW_MOCK_REPORT_POS.filter(po => ["Issued", "Completed"].includes(po.status));
