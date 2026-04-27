export const MOCK_STOCK_BATCHES = [
  {
    id: "batch-001",
    materialId: "mat-001",
    batchNo: "BN-202403-001",
    initialQty: 100,
    currentQty: 85,
    reservedQty: 5,
    costPerUnit: 450000,
    purchaseDate: "2024-03-01",
    expiryDate: "2025-03-01",
    expectedDate: "2024-03-05",
    receivedDate: "2024-03-05",
    storageLocation: "Warehouse A",
    vendor: "Aluminium Corp",
    attachments: [
      { id: "att-1", file: { name: "receipt-proof-completed.pdf" }, description: "Proof Document" },
      { id: "att-2", file: { name: "packing-list.pdf" }, description: "Packing List" }
    ],
    status: "Received"
  },
  {
    id: "batch-002",
    materialId: "mat-001",
    batchNo: "BN-202403-002",
    initialQty: 50,
    currentQty: 50,
    reservedQty: 0,
    costPerUnit: 460000,
    purchaseDate: "2024-03-10",
    expiryDate: "2025-03-10",
    expectedDate: "2024-03-15",
    receivedDate: "2024-03-14",
    storageLocation: "Warehouse B",
    vendor: "Global Metal",
    attachments: [
      { id: "att-3", file: { name: "receipt-proof-completed.pdf" }, description: "Proof Document" }
    ],
    status: "Requested"
  },
  {
    id: "batch-003",
    materialId: "mat-002",
    batchNo: "BN-202403-003",
    initialQty: 200,
    currentQty: 0,
    reservedQty: 0,
    costPerUnit: 120000,
    purchaseDate: "2024-02-01",
    expiryDate: "2024-12-01",
    expectedDate: "2024-02-10",
    receivedDate: "2024-02-10",
    storageLocation: "Warehouse A",
    vendor: "Steel Works",
    attachments: [],
    status: "Delayed"
  }
];
