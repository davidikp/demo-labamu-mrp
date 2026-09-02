// Mock data + in-memory "store" for the Quote module. There is no real
// backend yet — list/detail/create pages all work against this array plus
// local component state, mirroring the pattern used by
// customer/mock/customerMocks.js and orders/mock/orderMocks.js. Each record
// carries both the list-page columns and the richer detail-page sections
// (customer info, PICs, products, bank account, terms) in one object, same
// as MOCK_CUSTOMERS.

const LOREM_ADDITIONAL = `What is Lorem Ipsum?
Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.

Why do we use it?
It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.`;

export const MOCK_QUOTES = [
  {
    id: "quo-1",
    quoteNo: "QUO-3BD4D6DA-20260216-000001",
    rfqNo: "RFQ-3BD4D6DA-20260216-000002",
    customerId: "cust-4",
    customerName: "Aria",
    createdBy: "Patrick Star",
    createdAt: "2026-02-16",
    status: "Issued",
    sBadge: "orange",
    currency: "IDR",
    downPaymentPercent: 10,
    validUntil: "2026-03-11",
    customerApprovalStatus: "Pending",
    customer: {
      name: "Aria",
      email: "",
      phone: "+62",
      address: "Tangerang",
      tags: [],
    },
    pics: [
      { id: "quo-1-pic-1", primary: true, name: "Aria", email: "aria@mail.com", phone: "+6281234567890", role: "Approver" },
      { id: "quo-1-pic-2", primary: false, name: "Dwi", email: "dwi@mail.com", phone: "+6281234567890", role: "Approver" },
      { id: "quo-1-pic-3", primary: false, name: "Tolio", email: "tolio@mail.com", phone: "+6281234567890", role: "Viewer" },
    ],
    products: [
      {
        id: "quo-1-prod-1",
        image: null,
        name: "Kursi",
        sku: "PROD-3BD4D6DA-000004",
        notes: "",
        attachments: "",
        qty: 1,
        uom: "pcs",
        unitPrice: 300000,
        discountPercent: 50,
      },
    ],
    taxRatePercent: 0,
    shippingFee: 0,
    otherFee: 0,
    attachments: [],
    bankAccount: {
      accountName: "PT. Rajawali Citra",
      accountNumber: "42396439123",
      bankName: "BCA",
      currencies: "IDR",
      swiftCode: "CITIUS33XXX",
      branch: "Setiabudi One",
      branchAddress: "Plaza Setiabudi, Gd.Setiabudi Atrium Lt.1, Jl. H. R. Rasuna Said No.Kav.62 Suite 101 A, Kuningan, Daerah Khusus Ibukota Jakarta 12920",
    },
    terms: {
      paymentTerms: "Net 90",
      incoterms: "",
      shippingMethod: "",
      estimatedDelivery: "",
      riskLevel: "Low",
      disputeResolutionMethod: "",
      governingLaw: "",
      forceMajeure: "",
      latePaymentPenalties: "",
      performanceGuarantees: "",
      additional: LOREM_ADDITIONAL,
    },
  },
  {
    id: "quo-2",
    quoteNo: "QUO-3BD4D6DA-20260430-000001",
    rfqNo: "",
    customerId: "cust-7",
    customerName: "Aria Dwitolio",
    createdBy: "Patrick Star",
    createdAt: "2026-04-30",
    status: "Draft",
    sBadge: "grey",
    currency: "IDR",
    downPaymentPercent: 10,
    validUntil: "2026-05-30",
    customerApprovalStatus: "Pending",
    customer: { name: "Aria Dwitolio", email: "", phone: "+62", address: "-", tags: [] },
    pics: [
      { id: "quo-2-pic-1", primary: true, name: "Aria Dwitolio", email: "aria.dwitolio@mail.com", phone: "+6281234567890", role: "Approver" },
    ],
    products: [],
    taxRatePercent: 0,
    shippingFee: 0,
    otherFee: 0,
    attachments: [],
    bankAccount: {},
    terms: {},
  },
  {
    id: "quo-3",
    quoteNo: "QUO-3BD4D6DA-20260216-000002",
    rfqNo: "RFQ-3BD4D6DA-20260216-000004",
    customerId: "cust-4",
    customerName: "Aria",
    createdBy: "Patrick Star",
    createdAt: "2026-02-16",
    status: "Approved",
    sBadge: "green",
    currency: "IDR",
    downPaymentPercent: 10,
    validUntil: "2026-03-11",
    customerApprovalStatus: "Approved",
    customer: { name: "Aria", email: "aria@mail.com", phone: "+6281234567890", address: "Tangerang", tags: [] },
    pics: [
      { id: "quo-3-pic-1", primary: true, name: "Aria", email: "aria@mail.com", phone: "+6281234567890", role: "Approver" },
    ],
    products: [
      { id: "quo-3-prod-1", image: null, name: "Meja Kerja", sku: "PROD-3BD4D6DA-000005", notes: "", attachments: "", qty: 2, uom: "pcs", unitPrice: 850000, discountPercent: 0 },
    ],
    taxRatePercent: 0,
    shippingFee: 0,
    otherFee: 0,
    attachments: [],
    bankAccount: {
      accountName: "PT. Rajawali Citra",
      accountNumber: "42396439123",
      bankName: "BCA",
      currencies: "IDR",
      swiftCode: "CITIUS33XXX",
      branch: "Setiabudi One",
      branchAddress: "Plaza Setiabudi, Gd.Setiabudi Atrium Lt.1, Jl. H. R. Rasuna Said No.Kav.62 Suite 101 A, Kuningan, Daerah Khusus Ibukota Jakarta 12920",
    },
    terms: { paymentTerms: "Net 30", incoterms: "", shippingMethod: "", estimatedDelivery: "", riskLevel: "Low" },
  },
  {
    id: "quo-4",
    quoteNo: "QUO-3BD4D6DA-20251105-000001",
    rfqNo: "",
    customerId: "cust-5",
    customerName: "Jane INC.",
    createdBy: "Patrick Star",
    createdAt: "2025-11-05",
    status: "Approved",
    sBadge: "green",
    currency: "IDR",
    downPaymentPercent: 20,
    validUntil: "2025-12-05",
    customerApprovalStatus: "Approved",
    customer: { name: "Jane INC.", email: "jane@mail.com", phone: "+6281234567890", address: "Jakarta", tags: [] },
    pics: [{ id: "quo-4-pic-1", primary: true, name: "Jane", email: "jane@mail.com", phone: "+6281234567890", role: "Approver" }],
    products: [{ id: "quo-4-prod-1", image: null, name: "Lemari Arsip", sku: "PROD-3BD4D6DA-000006", notes: "", attachments: "", qty: 3, uom: "pcs", unitPrice: 1200000, discountPercent: 10 }],
    taxRatePercent: 0,
    shippingFee: 50000,
    otherFee: 0,
    attachments: [],
    bankAccount: {},
    terms: {},
  },
  {
    id: "quo-5",
    quoteNo: "QUO-3BD4D6DA-20260319-000001",
    rfqNo: "",
    customerId: "cust-6",
    customerName: "Untung Prayetno",
    createdBy: "Patrick Star",
    createdAt: "2026-03-19",
    status: "Rejected",
    sBadge: "red",
    currency: "IDR",
    downPaymentPercent: 10,
    validUntil: "2026-04-19",
    customerApprovalStatus: "Rejected",
    customer: { name: "Untung Prayetno", email: "untung.prayetno@cashenable.com", phone: "+6281585848002", address: "Jakarta Selatan", tags: [] },
    pics: [{ id: "quo-5-pic-1", primary: true, name: "Untung", email: "untung.prayetno@cashenable.com", phone: "+6281585848002", role: "Approver" }],
    products: [{ id: "quo-5-prod-1", image: null, name: "Rak Besi", sku: "PROD-3BD4D6DA-000007", notes: "", attachments: "", qty: 1, uom: "pcs", unitPrice: 450000, discountPercent: 0 }],
    taxRatePercent: 0,
    shippingFee: 0,
    otherFee: 0,
    rejectedMessage: "Price exceeds approved budget.",
    attachments: [],
    bankAccount: {},
    terms: {},
  },
  {
    id: "quo-6",
    quoteNo: "QUO-3BD4D6DA-20260326-000001",
    rfqNo: "",
    customerId: "cust-1",
    customerName: "PT. Bergerak Maju",
    createdBy: "Patrick Star",
    createdAt: "2026-03-26",
    status: "Need Revision",
    sBadge: "yellow",
    currency: "IDR",
    downPaymentPercent: 10,
    validUntil: "2026-04-26",
    customerApprovalStatus: "Need Revision",
    customer: { name: "PT. Bergerak Maju", email: "gerak@mail.com", phone: "+628409430439", address: "Jakarta Selatan", tags: [] },
    pics: [{ id: "quo-6-pic-1", primary: true, name: "Untung Prayetno", email: "untung.prayetno@cashenable.com", phone: "+6281585848002", role: "Approver" }],
    products: [{ id: "quo-6-prod-1", image: null, name: "Kursi Kantor", sku: "PROD-3BD4D6DA-000008", notes: "", attachments: "", qty: 5, uom: "pcs", unitPrice: 500000, discountPercent: 5 }],
    taxRatePercent: 0,
    shippingFee: 0,
    otherFee: 0,
    revisionMessage: "Please recalculate the discount for bulk quantity.",
    attachments: [],
    bankAccount: {},
    terms: {},
  },
  {
    id: "quo-7",
    quoteNo: "QUO-3BD4D6DA-20260324-000001",
    rfqNo: "",
    customerId: "cust-7",
    customerName: "Aria Dwitolio",
    createdBy: "Patrick Star",
    createdAt: "2026-03-24",
    status: "Submitted",
    sBadge: "blue",
    currency: "IDR",
    downPaymentPercent: 10,
    validUntil: "2026-04-24",
    customerApprovalStatus: "Pending",
    customer: { name: "Aria Dwitolio", email: "", phone: "+62", address: "Tangerang", tags: [] },
    pics: [
      { id: "quo-7-pic-1", primary: true, name: "Aria Dwitolio", email: "aria.dwitolio@mail.com", phone: "+6281234567890", role: "Approver" },
    ],
    products: [{ id: "quo-7-prod-1", image: null, name: "Sofa Tamu", sku: "PROD-3BD4D6DA-000009", notes: "", attachments: "", qty: 1, uom: "set", unitPrice: 3500000, discountPercent: 0 }],
    taxRatePercent: 0,
    shippingFee: 0,
    otherFee: 0,
    attachments: [],
    bankAccount: {},
    terms: {},
  },
];

let quoteSeq = MOCK_QUOTES.length;
export const nextQuoteId = () => `quo-${++quoteSeq}`;

export const createQuote = (data) => {
  const record = {
    id: nextQuoteId(),
    status: "Draft",
    sBadge: "grey",
    customerApprovalStatus: "Pending",
    tags: [],
    pics: [],
    products: [],
    attachments: [],
    taxRatePercent: 0,
    shippingFee: 0,
    otherFee: 0,
    bankAccount: {},
    terms: {},
    ...data,
  };
  MOCK_QUOTES.unshift(record);
  return record;
};

export const updateQuote = (quoteNo, data) => {
  const index = MOCK_QUOTES.findIndex((q) => q.quoteNo === quoteNo);
  if (index === -1) return null;
  MOCK_QUOTES[index] = { ...MOCK_QUOTES[index], ...data };
  return MOCK_QUOTES[index];
};

export const deleteQuote = (quoteNo) => {
  const index = MOCK_QUOTES.findIndex((q) => q.quoteNo === quoteNo);
  if (index === -1) return false;
  MOCK_QUOTES.splice(index, 1);
  return true;
};

export const getQuoteProductTotal = (product) => {
  const gross = (product.qty || 0) * (product.unitPrice || 0);
  const discount = gross * ((product.discountPercent || 0) / 100);
  return gross - discount;
};

export const getQuoteSubtotal = (products = []) =>
  products.reduce((sum, p) => sum + getQuoteProductTotal(p), 0);

// --- Create/Edit form option sources -------------------------------------
// The bank accounts a quote can be issued against. `currencies` is the
// comma-separated list the detail page already renders as "Supported
// Currencies"; the create form compares the quote currency against it to warn
// (non-blocking) about a mismatch.
export const MOCK_BANK_ACCOUNTS = [
  {
    id: "bank-1",
    accountName: "PT. Rajawali Citra",
    accountNumber: "42396439123",
    bankName: "BCA",
    currencies: "IDR",
    swiftCode: "CITIUS33XXX",
    branch: "Setiabudi One",
    branchAddress:
      "Plaza Setiabudi, Gd.Setiabudi Atrium Lt.1, Jl. H. R. Rasuna Said No.Kav.62 Suite 101 A, Kuningan, Daerah Khusus Ibukota Jakarta 12920",
  },
  {
    id: "bank-2",
    accountName: "PT. Rajawali Citra",
    accountNumber: "8820045511",
    bankName: "Mandiri",
    currencies: "IDR, USD",
    swiftCode: "BMRIIDJA",
    branch: "Sudirman",
    branchAddress: "Wisma Mandiri I, Jl. M.H. Thamrin No.5, Jakarta Pusat 10340",
  },
  {
    id: "bank-3",
    accountName: "Rajawali Citra International",
    accountNumber: "0091223344",
    bankName: "Citibank",
    currencies: "USD",
    swiftCode: "CITIUS33XXX",
    branch: "Jakarta Branch",
    branchAddress: "Citibank Tower, Jl. Jend. Sudirman Kav.54-55, Jakarta 12190",
  },
];

export const getBankAccountById = (id) => MOCK_BANK_ACCOUNTS.find((b) => b.id === id) || null;

export const PAYMENT_TERMS_OPTIONS = ["Net 15", "Net 30", "Net 60", "Net 90", "Cash on Delivery", "Advance Payment"];
export const INCOTERMS_OPTIONS = ["EXW", "FOB", "CIF", "CFR", "DAP", "DDP"];
export const SHIPPING_METHOD_OPTIONS = ["Sea Freight", "Air Freight", "Land Freight", "Courier", "Customer Pickup"];
export const DISPUTE_RESOLUTION_OPTIONS = ["Arbitration", "Mediation", "Litigation", "Negotiation"];
