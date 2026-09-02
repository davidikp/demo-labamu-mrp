// Mock data + in-memory "store" for the Customer module. There is no real
// backend yet — every list/detail/create/edit page in this repo works
// against a mock array plus local state, mirroring the pattern used by
// materials/mock/materialsMocks.js and work-order/mock/workOrderMocks.js.

export const MOCK_CUSTOMER_TAGS = [
  { id: "tag-1", name: "VIP", status: "Active" },
  { id: "tag-2", name: "Wholesale", status: "Active" },
  { id: "tag-3", name: "Retail", status: "Active" },
  { id: "tag-4", name: "Government", status: "Inactive" },
  { id: "tag-5", name: "Export", status: "Active" },
];

let customerTagSeq = MOCK_CUSTOMER_TAGS.length;
export const nextCustomerTagId = () => `tag-${++customerTagSeq}`;

// `phone` fields are a single composed string (e.g. "+62 8409430439"),
// matching the format PhoneInputField reads/emits.
export const MOCK_CUSTOMERS = [
  {
    id: "cust-1",
    name: "PT. Bergerak Maju",
    email: "gerak@mail.com",
    phone: "+62 8409430439",
    country: "Indonesia",
    address: "Jl. Gatot Subroto No. 12, Jakarta Selatan, 12930",
    tags: ["tag-1", "tag-2"],
    screeningStatus: "Passed",
    lastScreenedName: "PT. Bergerak Maju",
    lastScreenedCountry: "Indonesia",
    lastScreenedAt: "2026-08-10 09:24",
    pics: [
      {
        id: "pic-1-1",
        primary: true,
        name: "Untung Prayetno",
        email: "untung.prayetno@cashenable.com",
        role: "Approver",
        phone: "+62 81585848002",
      },
    ],
  },
  {
    id: "cust-2",
    name: "Ideal For Living",
    email: "ideal@ifl.co.kr",
    phone: "+82 888333222",
    country: "South Korea",
    address: "123 Gangnam-daero, Seoul",
    tags: ["tag-3"],
    screeningStatus: "Passed",
    lastScreenedName: "Ideal For Living",
    lastScreenedCountry: "South Korea",
    lastScreenedAt: "2026-07-22 14:02",
    pics: [
      {
        id: "pic-2-1",
        primary: true,
        name: "Revy",
        email: "refi.prathama@cashenable.com",
        role: "Viewer",
        phone: "+62 81221471900",
      },
    ],
  },
  {
    id: "cust-3",
    name: "Apple Inc.",
    email: "apple@mail.com",
    phone: "+62 87789678263",
    country: "United States",
    address: "One Apple Park Way, Cupertino, CA",
    tags: ["tag-5"],
    screeningStatus: "Sanctions Screening Failed",
    lastScreenedName: "Apple Inc.",
    lastScreenedCountry: "United States",
    lastScreenedAt: "2026-08-20 11:15",
    pics: [],
  },
  {
    id: "cust-4",
    name: "Aria",
    email: "aria@mail.com",
    phone: "+62 81234567890",
    country: "Indonesia",
    address: "Tangerang",
    tags: [],
    screeningStatus: "Not Screened",
    lastScreenedName: null,
    lastScreenedCountry: null,
    lastScreenedAt: null,
    pics: [
      { id: "pic-4-1", primary: true, name: "Aria", email: "aria@mail.com", role: "Approver", phone: "+62 81234567890" },
    ],
  },
  {
    id: "cust-5",
    name: "Jane INC.",
    email: "jane@mail.com",
    phone: "+62 81234567890",
    country: "Indonesia",
    address: "Jakarta",
    tags: [],
    screeningStatus: "Not Screened",
    lastScreenedName: null,
    lastScreenedCountry: null,
    lastScreenedAt: null,
    pics: [
      { id: "pic-5-1", primary: true, name: "Jane", email: "jane@mail.com", role: "Approver", phone: "+62 81234567890" },
    ],
  },
  {
    id: "cust-6",
    name: "Untung Prayetno",
    email: "untung.prayetno@cashenable.com",
    phone: "+62 81585848002",
    country: "Indonesia",
    address: "Jakarta Selatan",
    tags: [],
    screeningStatus: "Not Screened",
    lastScreenedName: null,
    lastScreenedCountry: null,
    lastScreenedAt: null,
    pics: [
      { id: "pic-6-1", primary: true, name: "Untung", email: "untung.prayetno@cashenable.com", role: "Approver", phone: "+62 81585848002" },
    ],
  },
  {
    id: "cust-7",
    name: "Aria Dwitolio",
    email: "",
    phone: "+62",
    // Deliberately left blank — this customer demonstrates the "missing
    // country blocks screening" case from the Simulate panel.
    country: "",
    address: "Tangerang",
    tags: [],
    screeningStatus: "Not Screened",
    lastScreenedName: null,
    lastScreenedCountry: null,
    lastScreenedAt: null,
    pics: [],
  },
];

// A Passed result is only reusable while it was screened against the exact
// name + country the customer currently has (PRD: Customer — Country and
// Screening Validity, ACs 4–6).
export const isScreeningValid = (customer) =>
  !!customer &&
  customer.screeningStatus === "Passed" &&
  !!customer.country &&
  customer.lastScreenedName === customer.name &&
  customer.lastScreenedCountry === customer.country;

export const getScreeningBadgeVariant = (screeningStatus) => {
  switch (screeningStatus) {
    case "Passed":
      return "green";
    case "Sanctions Screening Failed":
      return "red";
    default:
      return "grey-light";
  }
};

export const getCustomerById = (id) =>
  MOCK_CUSTOMERS.find((c) => c.id === id) || null;

let customerSeq = MOCK_CUSTOMERS.length;
export const nextCustomerId = () => `cust-${++customerSeq}`;

export const createCustomer = (data) => {
  const record = {
    id: nextCustomerId(),
    screeningStatus: "Not Screened",
    lastScreenedName: null,
    lastScreenedCountry: null,
    lastScreenedAt: null,
    tags: [],
    pics: [],
    ...data,
  };
  MOCK_CUSTOMERS.unshift(record);
  return record;
};

export const updateCustomer = (id, data) => {
  const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
  if (index === -1) return null;
  MOCK_CUSTOMERS[index] = { ...MOCK_CUSTOMERS[index], ...data };
  return MOCK_CUSTOMERS[index];
};

export const deleteCustomer = (id) => {
  const index = MOCK_CUSTOMERS.findIndex((c) => c.id === id);
  if (index === -1) return false;
  MOCK_CUSTOMERS.splice(index, 1);
  return true;
};

export const getCustomerTagLabel = (tagId) =>
  MOCK_CUSTOMER_TAGS.find((t) => t.id === tagId)?.name || tagId;
