
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
        dueDate: "2026-04-15",
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
        dueDate: "2026-04-20",
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
        dueDate: "2026-04-10", // Overdue
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
        dueDate: "2026-05-01",
        status: "Settled",
        payments: [{ amount: 12000000, date: "2026-04-22" }]
      }
    ]
  },
  {
    id: "po-5",
    poNumber: "PO-202603-0005",
    vendorName: "PT Sumber Berkah",
    amount: 7000000,
    status: "Issued",
    createdDate: "2026-03-25",
    invoices: [] // PO with no invoice
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
        dueDate: "2026-05-15",
        status: "Unpaid",
        payments: []
      }
    ]
  }
];
