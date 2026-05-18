import { useState, useMemo, useCallback, useEffect } from "react";
import { formatIsoDateString } from "../../../utils/date/dateUtils";

export const usePoInvoices = ({
  initialInvoices = [],
  initialPayments = [],
  initialLogs = [],
  mockLines = [],
  currency = "IDR",
  poTotal = 0,
  poNumber = "",
  vendorName = "",
} = {}) => {
  // --- Core Data State ---
  const [invoices, setInvoices] = useState(initialInvoices);
  const [payments, setPayments] = useState(initialPayments);
  const [invoicePaymentLogs, setInvoicePaymentLogs] = useState(initialLogs);

  // Sync with initial props
  useEffect(() => {
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setInvoicePaymentLogs(initialLogs);
  }, [initialInvoices, initialPayments, initialLogs]);

  // --- UI State ---
  const [invoiceSearch, setInvoiceSearch] = useState("");
  const [invoiceRowsPerPage, setInvoiceRowsPerPage] = useState(25);
  const [invoiceCurrentPage, setInvoiceCurrentPage] = useState(1);
  const [activeInvoiceTab, setActiveInvoiceTab] = useState("Details");
  const [expandedInvoiceItems, setExpandedInvoiceItems] = useState([]);
  const [expandedInvoicePayments, setExpandedInvoicePayments] = useState([]);

  // Modals & Drawers
  const [showInvoiceDetailDrawer, setShowInvoiceDetailDrawer] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState(null);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [selectedInvoiceForHistory, setSelectedInvoiceForHistory] = useState(null);
  const [showAddInvoiceDrawer, setShowAddInvoiceDrawer] = useState(false);
  const [showAddPaymentDrawer, setShowAddPaymentDrawer] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] = useState(null);
  const [showDeleteInvoiceConfirm, setShowDeleteInvoiceConfirm] = useState(false);
  const [showVoidConfirmModal, setShowVoidConfirmModal] = useState(false);
  const [paymentToVoid, setPaymentToVoid] = useState(null);

  // Form States
  const [addInvoiceFormData, setAddInvoiceFormData] = useState({
    number: "",
    date: formatIsoDateString(new Date()),
    termsValue: "30",
    termsUnit: "Days",
    amount: "",
    notes: "",
    attachments: [],
    itemLines: [{ id: "", qty: "", ocrRef: "" }],
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [paymentFormData, setPaymentFormData] = useState({
    date: formatIsoDateString(new Date()),
    amount: "",
    method: "Bank Transfer",
    notes: "",
    attachments: [],
  });
  const [formErrors, setFormErrors] = useState({});
  const [paymentFormErrors, setPaymentFormErrors] = useState({});
  const [isEditingInvoice, setIsEditingInvoice] = useState(false);
  const [autoPrefillInvoice, setAutoPrefillInvoice] = useState(false);
  const [autoPrefillPayment, setAutoPrefillPayment] = useState(false);

  // --- Helpers ---
  const getInvoiceMetrics = useCallback((invoice) => {
    if (!invoice) return { paid: 0, outstanding: 0, total: 0, payments: [], status: "Draft", isOverdue: false };
    const invPayments = payments
      .filter((p) => p.invoiceId === invoice.id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const paid = invPayments.filter(p => !p.isVoid).reduce((sum, p) => sum + (p.amount || 0), 0);
    const total = invoice.amount || 0;
    const outstanding = Math.max(total - paid, 0);
    const isOverdue = new Date(invoice.dueDate) < new Date() && outstanding > 0;
    
    let status = "Open";
    if (outstanding <= 0 && total > 0) status = "Settled";
    else if (paid > 0) status = "Partially Paid";
    
    return { paid, outstanding, total, payments: invPayments, status, isOverdue };
  }, [payments]);

  const getAgingStatus = useCallback((dueDate, outstanding) => {
    if (outstanding <= 0) return { text: "Settled", variant: "green-light" };
    const today = new Date();
    const due = new Date(dueDate);
    if (due >= today) return { text: "Not Due", variant: "grey-light" };

    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 30) return { text: "Late 1-30", variant: "blue-light" };
    if (diffDays <= 60) return { text: "Late 31-60", variant: "yellow-light" };
    if (diffDays <= 90) return { text: "Late 61-90", variant: "orange-light" };
    return { text: "Late 90+", variant: "red-light" };
  }, []);

  const getInvoiceStatus = useCallback((invoice, metrics) => {
    const { paid, outstanding } = metrics;
    const isOverdue = new Date(invoice.dueDate) < new Date();

    if (outstanding <= 0) return { text: "Paid", variant: "green-light" };
    if (paid > 0) {
      if (isOverdue) return { text: "Overdue", variant: "red-light" };
      return { text: "Partially Paid", variant: "blue-light" };
    }
    if (isOverdue) return { text: "Overdue", variant: "red-light" };
    return { text: "Open", variant: "blue-light" };
  }, []);

  const addInvoicePaymentLog = useCallback((title, desc) => {
    const now = new Date();
    const formattedDate = now.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).replace(",", "");

    setInvoicePaymentLogs(prev => [
      {
        name: "Natasha Smith",
        email: "natasha.smith@company.com",
        title,
        desc,
        timestamp: formattedDate,
      },
      ...prev,
    ]);
  }, []);

  // --- Derived State ---
  const totalInvoiced = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + (inv.amount || 0), 0);
  }, [invoices]);

  const totalPaid = useMemo(() => {
    return payments.filter(p => !p.isVoid).reduce((sum, pay) => sum + (pay.amount || 0), 0);
  }, [payments]);

  const outstandingAmount = useMemo(() => Math.max(totalInvoiced - totalPaid, 0), [totalInvoiced, totalPaid]);
  const paidRatio = useMemo(() => totalInvoiced > 0 ? Math.min(totalPaid / totalInvoiced, 1) : 0, [totalPaid, totalInvoiced]);

  const overdueAmount = useMemo(() => {
    const today = new Date();
    return invoices.reduce((sum, inv) => {
      const { outstanding } = getInvoiceMetrics(inv);
      const dueDate = new Date(inv.dueDate);
      const isOverdue = dueDate < today && outstanding > 0;
      return isOverdue ? sum + outstanding : sum;
    }, 0);
  }, [invoices, getInvoiceMetrics]);

  const poInvoicedRatio = useMemo(() => poTotal > 0 ? Math.min(totalInvoiced / poTotal, 1) : 0, [totalInvoiced, poTotal]);
  const poGap = useMemo(() => Math.max(poTotal - totalInvoiced, 0), [poTotal, totalInvoiced]);

  const calculatedDueDate = useMemo(() => {
    if (!addInvoiceFormData.date) return "-";
    const date = new Date(addInvoiceFormData.date);
    const val = parseInt(addInvoiceFormData.termsValue) || 0;
    if (addInvoiceFormData.termsUnit === "Days") {
      date.setDate(date.getDate() + val);
    } else {
      date.setMonth(date.getMonth() + val);
    }
    return formatIsoDateString(date);
  }, [addInvoiceFormData.date, addInvoiceFormData.termsValue, addInvoiceFormData.termsUnit]);

  // --- Handlers ---
  const simulateInvoiceOcr = useCallback((file) => {
    if (!autoPrefillInvoice) return;
    setTimeout(() => {
      const line1 = mockLines[0];
      const line2 = mockLines[1];
      setAddInvoiceFormData((prev) => ({
        ...prev,
        number: "INV/2026/04/0024",
        date: formatIsoDateString(new Date()),
        amount: "2500000",
        itemLines: [
          { id: line1?.id || line1?.item || "", qty: "50", ocrRef: "WOODEN CHAIR FRAME" },
          { id: line2?.id || line2?.item || "", qty: "20", ocrRef: "ALUMINIUM SHEET 2MM" }
        ]
      }));
    }, 1200);
  }, [autoPrefillInvoice, mockLines]);

  const simulatePaymentOcr = useCallback((file) => {
    if (!autoPrefillPayment) return;
    setTimeout(() => {
      setPaymentFormData((prev) => ({
        ...prev,
        date: formatIsoDateString(new Date()),
        amount: "1500000",
        method: "Bank Transfer",
      }));
    }, 1200);
  }, [autoPrefillPayment]);

  const handleEditInvoice = useCallback(() => {
    const inv = selectedInvoiceForDetail;
    if (!inv) return;
    setIsEditingInvoice(true);
    setAddInvoiceFormData({
      id: inv.id,
      number: inv.number,
      date: inv.date,
      termsValue: "30",
      termsUnit: "Days",
      amount: String(inv.amount),
      notes: inv.notes || "",
      attachments: inv.attachments || [],
      itemLines: (inv.itemLines || []).length > 0 ? inv.itemLines : [{ id: "", qty: "", ocrRef: "" }],
      bankName: inv.bankDetails?.bankName || "",
      accountNumber: inv.bankDetails?.accountNumber || "",
      accountName: inv.bankDetails?.accountName || "",
    });
    setShowAddInvoiceDrawer(true);
  }, [selectedInvoiceForDetail]);

  const handleAddInvoice = useCallback(() => {
    let hasError = false;
    const nextErrors = {};
    if (!addInvoiceFormData.number) { nextErrors.number = "Field cannot be empty"; hasError = true; }
    if (!addInvoiceFormData.amount) { nextErrors.amount = "Field cannot be empty"; hasError = true; }
    
    const itemLineErrors = addInvoiceFormData.itemLines.map((il) => {
      const err = {};
      if (!il.id) { err.id = "Item required"; hasError = true; }
      if (!il.qty) { err.qty = "Qty required"; hasError = true; }
      return err;
    });
    if (hasError) {
      setFormErrors({ ...nextErrors, itemLines: itemLineErrors });
      return;
    }

    if (isEditingInvoice) {
      setInvoices((prev) =>
        prev.map((inv) =>
          inv.id === addInvoiceFormData.id
            ? {
                ...inv,
                number: addInvoiceFormData.number,
                date: addInvoiceFormData.date,
                dueDate: calculatedDueDate,
                amount: parseFloat(addInvoiceFormData.amount) || 0,
                notes: addInvoiceFormData.notes,
                attachments: addInvoiceFormData.attachments,
                itemLines: addInvoiceFormData.itemLines,
                bankDetails: {
                  bankName: addInvoiceFormData.bankName,
                  accountNumber: addInvoiceFormData.accountNumber,
                  accountName: addInvoiceFormData.accountName,
                },
              }
            : inv
        )
      );
      addInvoicePaymentLog("Invoice Updated", `Invoice #${addInvoiceFormData.number} details were updated.`);
    } else {
      const newInvoice = {
        id: `inv-${Date.now()}`,
        number: addInvoiceFormData.number,
        date: addInvoiceFormData.date,
        dueDate: calculatedDueDate,
        amount: parseFloat(addInvoiceFormData.amount) || 0,
        status: "Open",
        notes: addInvoiceFormData.notes,
        attachments: addInvoiceFormData.attachments,
        itemLines: addInvoiceFormData.itemLines,
        bankDetails: {
          bankName: addInvoiceFormData.bankName,
          accountNumber: addInvoiceFormData.accountNumber,
          accountName: addInvoiceFormData.accountName,
        },
      };
      setInvoices((prev) => [newInvoice, ...prev]);
      addInvoicePaymentLog("Invoice Added", `New invoice #${addInvoiceFormData.number} for ${currency} ${parseFloat(addInvoiceFormData.amount).toLocaleString()} was added.`);
    }

    setShowAddInvoiceDrawer(false);
    setIsEditingInvoice(false);
    setFormErrors({});
  }, [addInvoiceFormData, isEditingInvoice, calculatedDueDate, currency, addInvoicePaymentLog]);

  const handleDeleteInvoice = useCallback(() => {
    if (!selectedInvoiceForDetail) return;
    const invNumber = selectedInvoiceForDetail.number;
    setInvoices((prev) => prev.filter((i) => i.id !== selectedInvoiceForDetail.id));
    setPayments((prev) => prev.filter((p) => p.invoiceId !== selectedInvoiceForDetail.id));
    addInvoicePaymentLog("Invoice Deleted", `Invoice #${invNumber} and its associated payments were removed.`);
    setShowDeleteInvoiceConfirm(false);
    setShowInvoiceDetailDrawer(false);
  }, [selectedInvoiceForDetail, addInvoicePaymentLog]);

  const handleAddPayment = useCallback(() => {
    let hasError = false;
    const nextErrors = {};
    if (!paymentFormData.amount) { nextErrors.amount = "Field cannot be empty"; hasError = true; }
    if (selectedInvoiceForPayment) {
      const outstanding = getInvoiceMetrics(selectedInvoiceForPayment).outstanding;
      if (parseFloat(paymentFormData.amount) > outstanding) {
        nextErrors.amount = "Payment exceeds outstanding balance";
        hasError = true;
      }
    }

    if (hasError) {
      setPaymentFormErrors(nextErrors);
      return;
    }

    const newPayment = {
      id: `pay-${Date.now()}`,
      invoiceId: selectedInvoiceForPayment?.id,
      invoiceNumber: selectedInvoiceForPayment?.number,
      amount: parseFloat(paymentFormData.amount) || 0,
      date: paymentFormData.date,
      method: paymentFormData.method,
      notes: paymentFormData.notes,
      attachments: paymentFormData.attachments,
      createdAt: new Date().toISOString(),
      isVoid: false,
    };

    setPayments((prev) => [newPayment, ...prev]);
    addInvoicePaymentLog("Payment Added", `Payment of ${currency} ${parseFloat(paymentFormData.amount).toLocaleString()} added to Invoice #${selectedInvoiceForPayment?.number}.`);
    setShowAddPaymentDrawer(false);
    setPaymentFormErrors({});
  }, [paymentFormData, selectedInvoiceForPayment, getInvoiceMetrics, currency, addInvoicePaymentLog]);

  const handleVoidPayment = useCallback(() => {
    if (!paymentToVoid) return;
    const associatedInv = invoices.find(i => i.id === paymentToVoid.invoiceId);
    setPayments(prev => prev.map(p => p.id === paymentToVoid.id ? { ...p, isVoid: true, voidedAt: new Date().toISOString() } : p));
    addInvoicePaymentLog("Payment Voided", `Payment of ${currency} ${paymentToVoid.amount.toLocaleString()} for Invoice #${associatedInv?.number || "Unknown"} was voided.`);
    setShowVoidConfirmModal(false);
    setPaymentToVoid(null);
  }, [paymentToVoid, invoices, currency, addInvoicePaymentLog]);

  return {
    // Data State
    invoices,
    setInvoices,
    payments,
    setPayments,
    invoicePaymentLogs,
    setInvoicePaymentLogs,

    // UI State
    invoiceSearch,
    setInvoiceSearch,
    invoiceRowsPerPage,
    setInvoiceRowsPerPage,
    invoiceCurrentPage,
    setInvoiceCurrentPage,
    activeInvoiceTab,
    setActiveInvoiceTab,
    expandedInvoiceItems,
    setExpandedInvoiceItems,
    expandedInvoicePayments,
    setExpandedInvoicePayments,

    // Modals
    showInvoiceDetailDrawer,
    setShowInvoiceDetailDrawer,
    selectedInvoiceForDetail,
    setSelectedInvoiceForDetail,
    showPaymentHistoryModal,
    setShowPaymentHistoryModal,
    selectedInvoiceForHistory,
    setSelectedInvoiceForHistory,
    showAddInvoiceDrawer,
    setShowAddInvoiceDrawer,
    showAddPaymentDrawer,
    setShowAddPaymentDrawer,
    selectedInvoiceForPayment,
    setSelectedInvoiceForPayment,
    showDeleteInvoiceConfirm,
    setShowDeleteInvoiceConfirm,
    showVoidConfirmModal,
    setShowVoidConfirmModal,
    paymentToVoid,
    setPaymentToVoid,

    // Forms
    addInvoiceFormData,
    setAddInvoiceFormData,
    paymentFormData,
    setPaymentFormData,
    formErrors,
    setFormErrors,
    paymentFormErrors,
    setPaymentFormErrors,
    isEditingInvoice,
    setIsEditingInvoice,
    autoPrefillInvoice,
    setAutoPrefillInvoice,
    autoPrefillPayment,
    setAutoPrefillPayment,

    // Helpers
    getInvoiceMetrics,
    getAgingStatus,
    getInvoiceStatus,
    addInvoicePaymentLog,

    // Derived State
    totalInvoiced,
    totalPaid,
    outstandingAmount,
    paidRatio,
    overdueAmount,
    poInvoicedRatio,
    poGap,
    calculatedDueDate,

    // Handlers
    simulateInvoiceOcr,
    simulatePaymentOcr,
    handleEditInvoice,
    handleAddInvoice,
    handleDeleteInvoice,
    handleAddPayment,
    handleVoidPayment,
  };
};
