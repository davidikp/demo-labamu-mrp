// =============================
// MATERIAL REQUEST — MOCK STORE
// =============================
// A module-level mutable store so status changes persist across navigation
// for the session (resets on reload), consistent with the rest of the app.

// Request status -> { label, statusKey, badge (solid), badgeVariant (soft, for counters) }
export const REQUEST_STATUS_META = {
  new_request: { label: "New Request", badge: "blue", badgeVariant: "blue-light" },
  preparing: { label: "Preparing", badge: "yellow", badgeVariant: "yellow-light" },
  transferring: { label: "Transferring", badge: "orange", badgeVariant: "orange-light" },
  completed: { label: "Completed", badge: "green", badgeVariant: "green-light" },
  canceled: { label: "Canceled", badge: "red", badgeVariant: "red-light" },
};

export const ROW_STATUS_META = {
  not_started: { label: "Not Started", badge: "grey" },
  available: { label: "Available", badge: "green" },
  partially_available: { label: "Partially Available", badge: "orange" },
  not_available: { label: "Not Available", badge: "red" },
};

// Derive a per-row status key from a fulfillment result.
export const deriveRowStatusKey = (requestedQty, fulfillableQty) => {
  if (!fulfillableQty || fulfillableQty <= 0) return "not_available";
  if (fulfillableQty >= requestedQty) return "available";
  return "partially_available";
};

export const totalAvailable = (batches = []) =>
  batches.reduce((sum, b) => sum + (b.available || 0), 0);

const makeItem = (overrides) => ({
  type: "BOM",
  name: "",
  sku: "",
  requestedQty: 0,
  unit: "pcs",
  // Stock currently on hand for this material, per batch.
  availableBatches: [],
  // For Non-BOM items: the reason the requester submitted this material.
  justification: "",
  // Set once the request has been prepared. null = not prepared yet.
  allocation: null,
  ...overrides,
});

// Build an allocation result (used to seed already-prepared requests).
const buildAllocation = (requestedQty, fulfillableQty, batches = [], reason = "") => ({
  fulfillableQty,
  shortageQty: Math.max(requestedQty - fulfillableQty, 0),
  batches,
  reason,
  rowStatusKey: deriveRowStatusKey(requestedQty, fulfillableQty),
});

// The canonical sample item set referenced in the brief / screenshots.
const sampleItems = () => [
  makeItem({
    type: "BOM",
    name: "Wooden Plank with With Black Striped Leopard",
    sku: "WOD-023UDISJJDS",
    requestedQty: 50,
    unit: "pcs",
    availableBatches: [
      { batch: "BAT-260126-000001", available: 45 },
      { batch: "BAT-260126-000002", available: 5 },
      { batch: "BAT-260126-000003", available: 30 },
      { batch: "BAT-260126-000008", available: 25 },
    ],
    // Requested quantity exceeded the remaining BOM quantity (entered in the Work Order).
    exceedingReason: "Material wastage",
    exceedingNotes: "Around 5 pcs are expected to be lost during cutting and shaping.",
  }),
  makeItem({
    type: "BOM",
    name: "Paint",
    sku: "PAI-WIQIFQJFJSA",
    requestedQty: 5,
    unit: "liter",
    availableBatches: [
      { batch: "BAT-260126-000002", available: 2 },
      { batch: "BAT-260126-000007", available: 1 },
    ],
  }),
  makeItem({
    type: "Non-BOM",
    name: "Nail Box with 1000000 pcs nails per bpx",
    sku: "NAI-9AIF0U092F",
    requestedQty: 10,
    unit: "box",
    availableBatches: [],
    // Request reason + notes (entered in the Work Order for Non-BOM materials).
    requestReason: "Packaging change",
    requestNotes:
      "Requested for additional reinforcement not covered by the BOM. Needed to complete the custom packaging for this work order.",
    justification:
      "Requested for additional reinforcement not covered by the BOM. Needed to complete the custom packaging for this work order.",
  }),
];

// Seed an item set with allocations as if it had already been prepared.
const prepared = (items) =>
  items.map((it) => {
    const stock = totalAvailable(it.availableBatches);
    const fulfillable = Math.min(it.requestedQty, stock);
    const batches = it.availableBatches
      .reduce(
        (acc, b) => {
          if (acc.remaining <= 0) return acc;
          const take = Math.min(b.available, acc.remaining);
          acc.list.push({ batch: b.batch, qty: take });
          acc.remaining -= take;
          return acc;
        },
        { remaining: fulfillable, list: [] }
      )
      .list;
    const reason =
      fulfillable < it.requestedQty ? "Insufficient stock available at preparation time." : "";
    return { ...it, allocation: buildAllocation(it.requestedQty, fulfillable, batches, reason) };
  });

const INITIAL_REQUESTS = [
  {
    id: "REQ-929E92E9",
    requestId: "REQ0129031",
    requestedDate: "12/02/2025; 15:00",
    requestedDateRaw: "2025-12-09",
    requestedBy: "Anna Jones",
    workOrderNo: "WO-248824-20251109-00001",
    workOrderShort: "WO092309091",
    status: "new_request",
    items: sampleItems(),
    logs: [
      {
        statusKey: "new_request",
        title: "Request Created",
        by: "Anna Jones",
        timestamp: "2025-12-09; 15:00",
      },
    ],
  },
  {
    id: "REQ-7A41C2B0",
    requestId: "REQ0129030",
    requestedDate: "10/02/2025; 15:00",
    requestedDateRaw: "2025-10-02",
    requestedBy: "Richard Mille",
    workOrderNo: "WO-248824-20251109-00001",
    workOrderShort: "WO092309091",
    status: "preparing",
    items: prepared(sampleItems()),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Richard Mille", timestamp: "2025-10-02; 15:00" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-10-02; 16:10" },
    ],
  },
  {
    id: "REQ-55D9E1F4",
    requestId: "REQ0129029",
    requestedDate: "08/02/2025; 15:00",
    requestedDateRaw: "2025-08-02",
    requestedBy: "Abigail Husni",
    workOrderNo: "WO-248824-20251109-00002",
    workOrderShort: "WO092309091",
    status: "transferring",
    items: prepared(sampleItems()),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Abigail Husni", timestamp: "2025-08-02; 15:00" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-08-02; 15:40" },
      { statusKey: "transferring", title: "Status changed to Transferring", by: "Natasha Smith", timestamp: "2025-08-02; 16:05" },
    ],
  },
  {
    id: "REQ-31B0A7C8",
    requestId: "REQ0129028",
    requestedDate: "08/02/2025; 15:00",
    requestedDateRaw: "2025-08-02",
    requestedBy: "Zoe Adams",
    workOrderNo: "WO-248824-20251108-00003",
    workOrderShort: "WO092309091",
    status: "completed",
    items: sampleItems().map((it) => ({
      ...it,
      // Completed request was fully fulfilled.
      allocation: buildAllocation(
        it.requestedQty,
        it.requestedQty,
        it.availableBatches.length
          ? [{ batch: it.availableBatches[0].batch, qty: it.requestedQty }]
          : [{ batch: "BAT-260126-000003", qty: it.requestedQty }]
      ),
    })),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Zoe Adams", timestamp: "2025-08-02; 15:00" },
      { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: "2025-08-02; 15:20" },
      { statusKey: "transferring", title: "Status changed to Transferring", by: "Natasha Smith", timestamp: "2025-08-02; 15:50" },
      { statusKey: "completed", title: "Materials received — Completed", by: "Zoe Adams", timestamp: "2025-08-03; 09:15" },
    ],
  },
  {
    id: "REQ-9C2F6D31",
    requestId: "REQ0129027",
    requestedDate: "08/02/2025; 15:00",
    requestedDateRaw: "2025-08-02",
    requestedBy: "Zoe Adams",
    workOrderNo: "WO-248824-20251108-00004",
    workOrderShort: "WO092309091",
    status: "canceled",
    items: sampleItems(),
    logs: [
      { statusKey: "new_request", title: "Request Created", by: "Zoe Adams", timestamp: "2025-08-02; 15:00" },
      { statusKey: "canceled", title: "Request Canceled", by: "Natasha Smith", timestamp: "2025-08-02; 17:30" },
    ],
  },
];

// In-memory store (mutated during the session).
let requests = INITIAL_REQUESTS.map((r) => ({ ...r }));

export const getRequests = () => requests;

export const getRequest = (id) => requests.find((r) => r.id === id) || null;

const nowStamp = () => {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}; ${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

// Apply the prepared allocations (from the preparation drawer) and move to Preparing.
// preparedItems is aligned by index to request.items.
export const applyPreparation = (id, preparedItems = []) => {
  requests = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          status: "preparing",
          items: r.items.map((it, idx) => {
            const p = preparedItems[idx];
            if (!p) return it;
            return {
              ...it,
              allocation: buildAllocation(it.requestedQty, p.fulfillableQty, p.batches, p.reason),
            };
          }),
          logs: [
            ...r.logs,
            { statusKey: "preparing", title: "Status changed to Preparing", by: "Natasha Smith", timestamp: nowStamp() },
          ],
        }
      : r
  );
  return getRequest(id);
};

export const setRequestStatus = (id, statusKey, logTitle) => {
  requests = requests.map((r) =>
    r.id === id
      ? {
          ...r,
          status: statusKey,
          logs: logTitle
            ? [...r.logs, { statusKey, title: logTitle, by: "Natasha Smith", timestamp: nowStamp() }]
            : r.logs,
        }
      : r
  );
  return getRequest(id);
};
