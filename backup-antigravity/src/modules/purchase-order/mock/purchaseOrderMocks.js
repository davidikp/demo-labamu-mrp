export const MOCK_PO_TABLE_DATA = [
  {
    poNumber: "PO-202603-0001",
    vendorName: "PT Mitra Sejahtera",
    amount: "IDR 15,000,000",
    createdDate: "2026-03-20",
    status: "Completed",
    statusKey: "completed",
    sBadge: "green",
    invoices: [
      {
        id: "inv-1-1",
        number: "INV/2026/001",
        date: "2026-03-20",
        terms: "30 days",
        dueDate: "2026-04-15",
        amount: 5000000,
        notes: "Initial batch",
        itemLines: [{ id: 1, qty: 33, unit: "Pcs" }]
      },
      {
        id: "inv-1-2",
        number: "INV/2026/002",
        date: "2026-03-25",
        terms: "30 days",
        dueDate: "2026-04-20",
        amount: 10000000,
        notes: "Final batch",
        itemLines: [{ id: 1, qty: 67, unit: "Pcs" }]
      }
    ],
    payments: [
      { id: "pay-1-1", amount: 5000000, date: "2026-04-10", method: "Bank Transfer", invoiceId: "inv-1-1", itemLines: [{ id: 1, qty: 33 }], proof: "transfer-receipt-001.pdf" },
      { id: "pay-1-2", amount: 10000000, date: "2026-04-22", method: "Bank Transfer", invoiceId: "inv-1-2", itemLines: [{ id: 1, qty: 67 }], proof: "transfer-receipt-002.pdf" }
    ]
  },
  {
    poNumber: "PO-202603-0002",
    vendorName: "PT Mitra Sejahtera",
    amount: "IDR 8,500,000",
    createdDate: "2026-03-21",
    status: "Issued",
    statusKey: "issued",
    sBadge: "blue",
    invoices: [
      {
        id: "inv-2-1",
        number: "INV/2026/003",
        date: "2026-03-25",
        terms: "30 days",
        dueDate: "2026-04-20",
        amount: 3500000,
        notes: "Partial delivery",
        itemLines: [{ id: 1, qty: 23, unit: "Pcs" }]
      },
      {
        id: "inv-2-2",
        number: "INV/2026/004",
        date: "2026-04-05",
        terms: "15 days",
        dueDate: "2026-04-20",
        amount: 5000000,
        notes: "Second delivery",
        itemLines: [{ id: 1, qty: 33, unit: "Pcs" }]
      }
    ],
    payments: [
      { id: "pay-2-1", amount: 2000000, date: "2026-04-18", method: "Bank Transfer", invoiceId: "inv-2-1", itemLines: [{ id: 1, qty: 13 }], proof: "payment_proof_partial.pdf" }
    ]
  },
  {
    poNumber: "PO-202603-0003",
    vendorName: "Bintang Sejahtera",
    amount: "IDR 22,000,000",
    createdDate: "2026-03-22",
    status: "Waiting for Approval",
    statusKey: "ready_to_send",
    sBadge: "orange",
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0004",
    vendorName: "PT Cahaya Abadi",
    amount: "IDR 5,250,000",
    createdDate: "2026-03-23",
    status: "Issued",
    statusKey: "issued",
    sBadge: "blue",
    invoices: [
      {
        id: "inv-4-1",
        number: "INV/2026/005",
        date: "2026-04-10",
        terms: "30 days",
        dueDate: "2026-05-10",
        amount: 5250000,
        notes: "Full order invoice",
        itemLines: [{ id: 1, qty: 35, unit: "Pcs" }]
      }
    ],
    payments: []
  },
  {
    poNumber: "PO-202603-0005",
    vendorName: "CV Kayu Makmur",
    amount: "IDR 11,000,000",
    createdDate: "2026-03-24",
    status: "Completed",
    statusKey: "completed",
    sBadge: "green",
    invoices: [
      {
        id: "inv-5-1",
        number: "INV/2026/006",
        date: "2026-03-10",
        terms: "30 days",
        dueDate: "2026-04-05",
        amount: 11000000,
        notes: "Overdue settlement",
        itemLines: [{ id: 1, qty: 73, unit: "Pcs" }]
      }
    ],
    payments: []
  },
  {
    poNumber: "PO-202603-0006",
    vendorName: "PT Sumber Berkah",
    amount: "IDR 7,000,000",
    createdDate: "2026-03-25",
    status: "Canceled",
    statusKey: "rejected",
    sBadge: "red",
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0007",
    vendorName: "CV Maju Terus",
    amount: "IDR 47,325,000",
    createdDate: "2026-03-25",
    status: "Completed",
    statusKey: "completed",
    sBadge: "green",
    subtotal: 42325000,
    tax: 4655750,
    fees: 344250,
    lines: [
      {
        id: 1,
        type: "wo",
        item: "Cabinet Premium",
        code: "CAB-PR-9921",
        desc: "High-end premium cabinet with oak finish and tempered glass shelving.",
        woRef: "WO-2026-03-025-00008",
        qty: 20,
        price: 1500000,
      },
      {
        id: 2,
        type: "material",
        item: "Aluminium Frame Support",
        code: "ALU-SUP-01",
        desc: "Structural aluminium support frame for premium furniture series.",
        woRef: "-",
        qty: 50,
        price: 246500,
      }
    ],
    invoices: [
      {
        id: "inv-7-1",
        number: "INV/2026/010",
        date: "2026-03-20",
        terms: "30 days",
        dueDate: "2026-04-15",
        amount: 15000000,
        notes: "Settled invoice",
        itemLines: [{ id: 1, qty: 10, unit: "Pcs" }]
      },
      {
        id: "inv-7-2",
        number: "INV/2026/011",
        date: "2026-03-25",
        terms: "30 days",
        dueDate: "2026-04-20",
        amount: 12325000,
        notes: "Partially paid overdue",
        itemLines: [{ id: 2, qty: 50, unit: "Sheet" }]
      },
      {
        id: "inv-7-3",
        number: "INV/2026/012",
        date: "2026-04-05",
        terms: "15 days",
        dueDate: "2026-04-20",
        amount: 10000000,
        notes: "Fully overdue",
        itemLines: [{ id: 1, qty: 6, unit: "Pcs" }]
      },
      {
        id: "inv-7-4",
        number: "INV/2026/013",
        date: "2026-04-10",
        terms: "30 days",
        dueDate: "2026-05-10",
        amount: 10000000,
        notes: "Not due yet",
        itemLines: [{ id: 1, qty: 4, unit: "Pcs" }]
      }
    ],
    payments: [
      { id: "pay-7-1", amount: 15000000, date: "2026-04-10", method: "Bank Transfer", invoiceId: "inv-7-1", itemLines: [{ id: 1, qty: 10 }], proof: "payment-proof-inv10.pdf" },
      { id: "pay-7-2", amount: 5000000, date: "2026-04-18", method: "Bank Transfer", invoiceId: "inv-7-2", itemLines: [{ id: 2, qty: 20 }], proof: "receipt-partial-inv11.pdf" }
    ]
  },
  {
    poNumber: "PO-202603-0008",
    vendorName: "PT Mitra Sejahtera",
    amount: "IDR 12,000,000",
    createdDate: "2026-03-26",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey-light",
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0009",
    vendorName: "Bintang Sejahtera",
    amount: "IDR 8,000,000",
    createdDate: "2026-03-27",
    status: "Need Revision",
    statusKey: "need_revision",
    sBadge: "yellow-light",
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0010",
    vendorName: "PT Cahaya Abadi",
    amount: "IDR 15,500,000",
    createdDate: "2026-03-28",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey-light",
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0011",
    vendorName: "CV Kayu Makmur",
    amount: "IDR 9,200,000",
    createdDate: "2026-03-29",
    status: "Need Revision",
    statusKey: "need_revision",
    sBadge: "yellow-light",
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0012",
    vendorName: "PT Sumber Berkah",
    amount: "IDR 6,000,000",
    createdDate: "2026-03-30",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey-light",
    invoices: [],
    payments: []
  },
  {
    poNumber: "PO-202603-0013",
    vendorName: "CV Maju Terus",
    amount: "IDR 25,000,000",
    createdDate: "2026-03-31",
    status: "Draft",
    statusKey: "draft",
    sBadge: "grey-light",
    invoices: [],
    payments: []
  }
];

export const MOCK_ACTIVITIES = [
  {
    date: "2026-03-22 10:30",
    user: "Natasha Smith",
    action: "Approved Purchase Order",
  },
  {
    date: "2026-03-21 14:00",
    user: "Joko",
    action: "Submitted Purchase Order for Approval",
  },
  {
    date: "2026-03-21 13:45",
    user: "Joko",
    action: "Created Purchase Order Draft",
  },
];

export const MOCK_PO_DOCUMENTS = [
  {
    id: "doc-1",
    name: "invoice-march-2026.pdf",
    description: "March invoice",
    meta: "Uploaded by Joko on Mar 20, 2026",
    type: "pdf",
    documentType: "invoice",
    size: "2.4 MB",
  },
  {
    id: "doc-2",
    name: "delivery-note-batch-14.pdf",
    description: "Delivery note for batch 14",
    meta: "Uploaded by Natasha Smith on Mar 20, 2026",
    type: "pdf",
    documentType: "delivery_note",
    size: "1.1 MB",
  },
  {
    id: "doc-3",
    name: "vendor-quotation.pdf",
    description: "Vendor quotation comparison",
    meta: "Uploaded by Joko on Mar 19, 2026",
    type: "pdf",
    documentType: "quotation_vendor",
    size: "860 KB",
  },
  {
    id: "doc-4",
    name: "packing-list-wood-frame.png",
    description: "Packing list for wood frame order",
    meta: "Uploaded by Natasha Smith on Mar 18, 2026",
    type: "image",
    documentType: "packing_list",
    size: "540 KB",
  },
];
