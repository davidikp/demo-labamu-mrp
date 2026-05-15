
export const MOCK_REPORT_POS = [
  {
    id: "po-1",
    poNumber: "PO-202603-0001",
    vendorName: "PT Mitra Sejahtera",
    amount: 15000000,
    status: "Issued",
    createdDate: "2026-03-20",
    invoices: [
      {
        id: "inv-1",
        number: "INV/MS/001",
        amount: 5000000,
        dueDate: "2026-04-15", // Late 1-30 (diffDays ~28)
        status: "Settled",
        payments: [{ amount: 5000000, date: "2026-04-10" }]
      }
    ]
  },
  {
    id: "po-2",
    poNumber: "PO-202603-0002",
    vendorName: "PT Cahaya Abadi",
    amount: 8500000,
    status: "Issued",
    createdDate: "2026-03-21",
    invoices: [
      {
        id: "inv-2",
        number: "INV/CA/001",
        amount: 8500000,
        dueDate: "2026-04-20", // Late 1-30 (diffDays ~23)
        status: "Partially Paid",
        payments: [{ amount: 4000000, date: "2026-04-18" }]
      }
    ]
  },
  {
    id: "po-3",
    poNumber: "PO-202603-0003",
    vendorName: "Bintang Sejahtera",
    amount: 22000000,
    status: "Issued",
    createdDate: "2026-03-22",
    invoices: [
      {
        id: "inv-3",
        number: "INV/BS/001",
        amount: 10000000,
        dueDate: "2026-04-10", // Late 31-60 (diffDays ~33)
        status: "Unpaid",
        payments: []
      }
    ]
  },
  {
    id: "po-4",
    poNumber: "PO-202603-0004",
    vendorName: "CV Kayu Makmur",
    amount: 12000000,
    status: "Completed",
    createdDate: "2026-03-24",
    invoices: [
      {
        id: "inv-4",
        number: "INV/KM/001",
        amount: 12000000,
        dueDate: "2026-05-01", // Late 1-30 (diffDays ~12)
        status: "Settled",
        payments: [{ amount: 12000000, date: "2026-04-22" }]
      }
    ]
  },
  {
    id: "po-6",
    poNumber: "PO-202603-0006",
    vendorName: "PT Mitra Sejahtera",
    amount: 4500000,
    status: "Revised",
    createdDate: "2026-03-26",
    invoices: [
      {
        id: "inv-5",
        number: "INV/MS/002",
        amount: 2000000,
        dueDate: "2026-05-15", // Not Due
        status: "Unpaid",
        payments: []
      }
    ]
  },
  {
    id: "po-7",
    poNumber: "PO-202602-0007",
    vendorName: "PT Galaksi Jaya",
    amount: 9000000,
    status: "Issued",
    createdDate: "2026-02-15",
    invoices: [
      {
        id: "inv-6",
        number: "INV/GJ/001",
        amount: 9000000,
        dueDate: "2026-03-10", // Late 61-90 (diffDays ~64)
        status: "Unpaid",
        payments: []
      }
    ]
  },
  {
    id: "po-8",
    poNumber: "PO-202601-0008",
    vendorName: "CV Maju Terus",
    amount: 18000000,
    status: "Issued",
    createdDate: "2026-01-10",
    invoices: [
      {
        id: "inv-7",
        number: "INV/MT/001",
        amount: 18000000,
        dueDate: "2026-02-05", // Late 90+ (diffDays ~97)
        status: "Unpaid",
        payments: []
      }
    ]
  }
];
