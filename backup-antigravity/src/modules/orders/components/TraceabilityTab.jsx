import React, { useState, useMemo, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { 
  Box, 
  SearchIcon, 
  DownloadIcon,
  ChevronDownIcon,
  FileIcon,
  CloseIcon
} from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Checkbox } from "../../../components/common/Checkbox.jsx";
import { FilterPill } from "../../../components/common/FilterPill.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { DropdownSelect } from "../../../components/common/DropdownSelect.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { IconButton } from "../../../components/common/IconButton.jsx";
import { MOCK_TRACEABILITY_DATA } from "../mock/traceabilityMocks.js";

const Tooltip = ({ content, children, style = {}, checkTruncation = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef(null);

  const updateCoords = () => {
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top,
        left: rect.left + rect.width / 2,
      });
    }
  };

  useEffect(() => {
    if (isVisible) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
    }
    return () => {
      window.removeEventListener("scroll", updateCoords, true);
      window.removeEventListener("resize", updateCoords);
    };
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      style={{
        position: "relative",
        display: "inline-block",
        width: "max-content",
        minWidth: 0,
        ...style,
      }}
      onMouseEnter={() => {
        if (!content) return;
        if (checkTruncation && triggerRef.current) {
          const element = triggerRef.current.firstElementChild;
          if (element) {
            const isTruncated =
              element.scrollHeight > element.clientHeight + 1 ||
              element.scrollWidth > element.clientWidth + 1;
            if (!isTruncated) return;
          }
        }
        setIsVisible(true);
      }}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}
      {isVisible &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: coords.top - 8,
              left: coords.left,
              transform: "translate(-50%, -100%)",
              width: "max-content",
              whiteSpace: "nowrap",
              padding: "8px 12px",
              borderRadius: "8px",
              background: "var(--neutral-on-surface-primary)",
              color: "var(--neutral-surface-primary)",
              fontSize: "var(--text-desc)",
              lineHeight: "1.6",
              boxShadow: "var(--elevation-sm)",
              textAlign: "center",
            }}
          >
            {content}
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: "50%", // Match the transform shift
                transform: "translateX(-50%)",
                width: 0,
                height: 0,
                borderLeft: "6px solid transparent",
                borderRight: "6px solid transparent",
                borderTop: "6px solid var(--neutral-on-surface-primary)",
              }}
            />
          </div>,
          document.body
        )}
    </div>
  );
};

const DocumentTypeBadge = ({ fileName = "" }) => {
  const extension = (fileName.split(".").pop() || "PDF").toUpperCase();
  const palette = {
    PDF: { bg: "#E0001B", fold: "#F3A0AA" },
    JPG: { bg: "#FF980C", fold: "#FFD39C" },
    JPEG: { bg: "#FF980C", fold: "#FFD39C" },
    PNG: { bg: "#456FB4", fold: "#A9BDE2" },
  }[extension] || { bg: "#6E90C7", fold: "#A8BFE2" };

  return (
    <div style={{
      width: "36px",
      height: "42px",
      borderRadius: "6px",
      background: palette.bg,
      position: "relative",
      flexShrink: 0,
      display: "flex",
      alignItems: "flex-end",
      justifyContent: "center",
      paddingBottom: "8px",
      boxSizing: "border-box",
      overflow: "hidden",
      clipPath: "polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 0 100%)",
    }}>
      <div style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: 0,
        height: 0,
        borderLeft: "12px solid transparent",
        borderTop: "12px solid " + palette.fold,
      }} />
      <span style={{
        fontSize: "8px",
        fontWeight: "bold",
        color: "#fff",
        lineHeight: 1,
        letterSpacing: "0.1px",
      }}>
        {extension.slice(0, 4)}
      </span>
    </div>
  );
};

const BatchDocumentsModal = ({ isOpen, onClose, attachments = [], batchNo }) => {
  if (!isOpen) return null;
  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Documents for Batch ${batchNo}`}
      width="800px"
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "2fr 1fr 1fr 100px", 
          padding: "16px 24px", 
          borderBottom: "1px solid var(--neutral-line-separator-1)",
          background: "var(--neutral-surface-primary)",
          fontWeight: "var(--font-weight-bold)",
          fontSize: "13px",
          color: "var(--neutral-on-surface-primary)"
        }}>
          <span>Name</span>
          <span>File Type</span>
          <span>File Size</span>
          <span style={{ textAlign: "right" }}>Action</span>
        </div>
        <div style={{ maxHeight: "400px", overflowY: "auto" }}>
          {attachments.map((att, i) => {
            const fileName = att.file?.name || "document.pdf";
            const size = att.file?.size ? (att.file.size / 1024 / 1024).toFixed(2) + " MB" : "1.2 MB";
            return (
              <div key={i} style={{ 
                display: "grid", 
                gridTemplateColumns: "2fr 1fr 1fr 100px", 
                padding: "16px 24px", 
                borderBottom: "1px solid var(--neutral-line-separator-1)",
                alignItems: "center",
                fontSize: "14px"
              }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "4px", minWidth: 0 }}>
                  <span style={{ 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap", 
                    color: "var(--neutral-on-surface-primary)",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "14px"
                  }}>
                    {att.description || "No description"}
                  </span>
                  <span style={{ 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap", 
                    color: "var(--neutral-on-surface-secondary)",
                    fontSize: "12px"
                  }}>
                    {fileName}
                  </span>
                </div>
                <div>
                  <DocumentTypeBadge fileName={fileName} />
                </div>
                <span style={{ color: "var(--neutral-on-surface-primary)" }}>{size}</span>
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button 
                    variant="tertiary" 
                    size="small" 
                    leftIcon={DownloadIcon}
                    onClick={() => {}}
                    style={{ color: "var(--feature-brand-primary)", fontWeight: "bold" }}
                  >
                    Download
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </GeneralModal>
  );
};

const TableAttachmentCard = ({ attachments = [], batchNo }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!attachments || attachments.length === 0) {
    return <span style={{ fontSize: "var(--text-body)", color: "var(--neutral-on-surface-tertiary)" }}>No documents added</span>;
  }

  const visibleAttachments = attachments.slice(0, 2);
  const remainingCount = attachments.length - 2;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", width: "100%", padding: "8px 0" }}>
        {visibleAttachments.map((att, i) => (
          <div key={att.id || i} style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            width: "100%",
            minWidth: 0
          }}>
            <DocumentTypeBadge fileName={att.file?.name || "proof.pdf"} />
            <div style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
              minWidth: 0,
              flex: 1
            }}>
              <span style={{
                fontSize: "var(--text-title-3)",
                fontWeight: "var(--font-weight-bold)",
                color: "var(--feature-brand-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {att.description || "Proof Document"}
              </span>
              <span style={{
                fontSize: "12px",
                color: "var(--feature-brand-primary)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis"
              }}>
                {att.file?.name || "receipt-proof-completed.pdf"}
              </span>
            </div>
          </div>
        ))}
        {remainingCount > 0 && (
          <Button 
            variant="tertiary"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            style={{
              padding: "4px 8px",
              height: "28px",
              marginTop: "4px",
              fontSize: "12px",
              fontWeight: "bold",
              color: "var(--feature-brand-primary)"
            }}
          >
            + {remainingCount} more
          </Button>
        )}
      </div>
      <BatchDocumentsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        attachments={attachments}
        batchNo={batchNo}
      />
    </>
  );
};

const MOCK_LINKED_INVOICES = [
  { id: "INV-20240401", invoiceNo: "INV-20240401", date: "2024-04-01", status: "Unpaid", amount: "IDR 45.000.000", vendor: "Mitra Perkasa", dueDate: "2024-05-01" },
  { id: "INV-20240405", invoiceNo: "INV-20240405", date: "2024-04-05", status: "Paid", amount: "IDR 12.500.000", vendor: "Mitra Perkasa", dueDate: "2024-05-05" },
];

const InvoicePreview = ({ invoice }) => {
  if (!invoice) return null;

  return (
    <div style={{ width: "440px", background: "#F9FAFB", borderLeft: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column" }}>
      <div style={{ padding: "40px 24px 20px", display: "flex", alignItems: "center", background: "white", flexShrink: 0 }}>
        <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Invoice Preview</span>
      </div>
      
      <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px", overflowY: "auto", flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <span style={{ fontSize: "18px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{invoice.invoiceNo}</span>
            <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-tertiary)" }}>{invoice.vendor}</span>
          </div>
          <StatusBadge variant={invoice.status === "Paid" ? "green" : "grey"}>
            {invoice.status}
          </StatusBadge>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Invoice Information</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Invoice Date</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{invoice.date}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Due Date</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{invoice.dueDate}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Amount</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{invoice.amount}</span>
            </div>
          </div>
        </div>

        <div style={{ background: "white", padding: "20px", borderRadius: "16px", border: "1px solid var(--neutral-line-separator-1)", display: "flex", flexDirection: "column", gap: "20px" }}>
          <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Vendor Information</span>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Vendor Name</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{invoice.vendor}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>Email address</span>
              <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>billing@mitra.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AddBatchToInvoiceModal = ({ isOpen, onClose, batches, showSnackbar }) => {
  const [selectedInvoice, setSelectedInvoice] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState([]);
  const [showDocError, setShowDocError] = useState(false);
  const [showInvoiceError, setShowInvoiceError] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const allDocuments = useMemo(() => {
    if (!batches || batches.length === 0) return [];
    return batches.flatMap(b => (b.documents || []).map(d => ({ 
      ...d, 
      batchNo: b.batchNo, 
      materialName: b.material.name 
    })));
  }, [batches]);

  useEffect(() => {
    if (allDocuments.length > 0) {
      setSelectedDocIds(allDocuments.map(doc => doc.id));
    }
    setSelectedInvoice("");
    setShowDocError(false);
    setShowInvoiceError(false);
  }, [allDocuments]);

  useEffect(() => {
    if (selectedDocIds.length > 0) {
      setShowDocError(false);
    }
  }, [selectedDocIds]);

  if (!batches || batches.length === 0) return null;

  const invoiceOptions = MOCK_LINKED_INVOICES.map(inv => ({ value: inv.id, label: inv.invoiceNo }));
  const activeInvoice = MOCK_LINKED_INVOICES.find(inv => inv.id === selectedInvoice);

  const handleFinalSubmit = () => {
    showSnackbar?.("Document successfully linked to invoice", "success");
    onClose();
  };

  const checkAndSubmit = () => {
    let hasError = false;
    if (!selectedInvoice) {
      setShowInvoiceError(true);
      hasError = true;
    }
    if (selectedDocIds.length === 0) {
      setShowDocError(true);
      hasError = true;
    }

    if (!hasError) {
      const alreadyLinkedDocs = allDocuments.filter(doc => 
        selectedDocIds.includes(doc.id) && 
        selectedInvoice === "INV-20240401" && (doc.id === "doc1" || doc.id === "doc2")
      );

      if (alreadyLinkedDocs.length > 0) {
        setShowConfirmModal(true);
      } else {
        handleFinalSubmit();
      }
    }
  };

  return (
    <GeneralModal 
      isOpen={isOpen} 
      onClose={onClose} 
      width={selectedInvoice ? "1080px" : "640px"}
      noPadding={true}
    >
      <div style={{ display: "flex", height: "80vh" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "64px 24px 24px", background: "white", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <span style={{ fontSize: "20px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Add Batch Documents to Invoice</span>
          </div>

          <div style={{ flex: 1, padding: "24px", display: "flex", flexDirection: "column", gap: "24px", overflowY: "auto" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-primary)" }}>
                <span style={{ color: "var(--status-red-primary)" }}>*</span> Invoice
              </span>
              <DropdownSelect 
                value={selectedInvoice}
                onChange={(val) => {
                  setSelectedInvoice(val);
                  setShowInvoiceError(false);
                }}
                options={invoiceOptions}
                placeholder="Select Invoice"
                fieldHeight="44px"
                borderRadius="12px"
                showDivider={true}
                hasError={showInvoiceError}
              />
              {showInvoiceError && (
                <span style={{ color: "var(--status-red-primary)", fontSize: "12px", marginTop: "4px" }}>
                  Field cannot be empty
                </span>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "48px 1.5fr 1.5fr 1fr", 
                borderBottom: "1px solid var(--neutral-line-separator-1)", 
                padding: "12px 0",
                alignItems: "center"
              }}>
                <div style={{ display: "flex", justifyContent: "center" }}>
                  <Checkbox 
                    checked={selectedDocIds.length === allDocuments.length && allDocuments.length > 0} 
                    onChange={() => {
                      if (selectedDocIds.length === allDocuments.length) setSelectedDocIds([]);
                      else setSelectedDocIds(allDocuments.map(d => d.id));
                    }} 
                  />
                </div>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Document</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Batch</span>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>Status</span>
              </div>
              
              <div style={{ display: "flex", flexDirection: "column" }}>
                {allDocuments.map(doc => {
                  const isLinked = selectedInvoice === "INV-20240401" && (doc.id === "doc1" || doc.id === "doc2"); // Simulated linkage
                  return (
                    <div key={doc.id} style={{ 
                      display: "grid", 
                      gridTemplateColumns: "48px 1.5fr 1.5fr 1fr", 
                      padding: "16px 0", 
                      borderBottom: "1px solid var(--neutral-line-separator-1)", 
                      alignItems: "center" 
                    }}>
                      <div style={{ display: "flex", justifyContent: "center" }}>
                        <Checkbox 
                          checked={selectedDocIds.includes(doc.id)} 
                          onChange={() => {
                            setSelectedDocIds(prev => prev.includes(doc.id) ? prev.filter(id => id !== doc.id) : [...prev, doc.id]);
                          }} 
                        />
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{doc.description || doc.file?.name}</span>
                        <span style={{ fontSize: "12px", color: "var(--feature-brand-primary)" }}>{doc.file?.name}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{doc.batchNo}</span>
                        <span style={{ fontSize: "12px", color: "var(--neutral-on-surface-tertiary)" }}>{doc.materialName}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <StatusBadge variant={isLinked ? "green" : "grey"}>
                          {isLinked ? "Linked" : "Not Linked"}
                        </StatusBadge>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div style={{ padding: "0 24px 24px", background: "white", display: "flex", flexDirection: "column", gap: "16px", flexShrink: 0 }}>
            {showDocError && (
              <div style={{ 
                display: "flex",
                justifyContent: "center"
              }}>
                <span style={{ color: "var(--status-red-primary)", fontSize: "13px", fontWeight: "bold" }}>
                  Select at least one document before submitting
                </span>
              </div>
            )}
            <div style={{ display: "flex", gap: "12px" }}>
              <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>Cancel</Button>
              <Button 
                variant="filled" 
                size="large" 
                onClick={checkAndSubmit} 
                style={{ flex: 1 }}
              >
                Submit
              </Button>
            </div>
          </div>
        </div>

        {selectedInvoice && <InvoicePreview invoice={activeInvoice} />}
      </div>

      <GeneralModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Documents Already Linked"
        description="Some documents are already linked to this invoice. You can skip them or replace the existing ones."
        width="480px"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", padding: "0 24px 16px", marginTop: "12px" }}>
          <Button 
            variant="filled" 
            size="large" 
            onClick={() => {
              setShowConfirmModal(false);
              handleFinalSubmit();
            }}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Skip Duplicates
          </Button>
          <Button 
            variant="outlined" 
            size="large" 
            onClick={() => {
              setShowConfirmModal(false);
              handleFinalSubmit();
            }}
            style={{ width: "100%", justifyContent: "center" }}
          >
            Overwrite Documents
          </Button>
        </div>
      </GeneralModal>
    </GeneralModal>
  );
};

export const TraceabilityTab = ({ onNavigate, showSnackbar }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [selectedRowIds, setSelectedRowIds] = useState([]);
  
  const [materialFilter, setMaterialFilter] = useState([]);
  const [productFilter, setProductFilter] = useState([]);
  const [openFilterKey, setOpenFilterKey] = useState(null); // 'material' | 'product' | null
  const [filterTriggerRect, setFilterTriggerRect] = useState(null);
  
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [downloadTriggerRect, setDownloadTriggerRect] = useState(null);

  const [isBulkDownloadOpen, setIsBulkDownloadOpen] = useState(false);
  const [bulkDownloadTriggerRect, setBulkDownloadTriggerRect] = useState(null);

  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedBatches, setSelectedBatches] = useState([]);

  const materialOptions = useMemo(() => {
    return [...new Set(MOCK_TRACEABILITY_DATA.map(item => item.material.name))];
  }, []);

  const productOptions = useMemo(() => {
    return [...new Set(MOCK_TRACEABILITY_DATA.map(item => item.product.name))];
  }, []);

  const filteredData = useMemo(() => {
    let result = [...MOCK_TRACEABILITY_DATA];
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.batchNo.toLowerCase().includes(q) ||
        item.material.name.toLowerCase().includes(q) ||
        item.material.sku.toLowerCase().includes(q) ||
        item.workOrderNo.toLowerCase().includes(q) ||
        item.product.name.toLowerCase().includes(q) ||
        item.product.sku.toLowerCase().includes(q)
      );
    }

    if (materialFilter.length > 0) {
      result = result.filter(item => materialFilter.includes(item.material.name));
    }

    if (productFilter.length > 0) {
      result = result.filter(item => productFilter.includes(item.product.name));
    }

    return result;
  }, [searchQuery, materialFilter, productFilter]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const visibleData = filteredData.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const gridTemplate = "48px 1fr 1.5fr 1fr 1.5fr 0.8fr 1.5fr 1.2fr";
  const rowHeight = 72;

  return (
    <div style={{ width: "100%", background: "var(--neutral-background-primary)", display: "flex", flexDirection: "column", gap: "24px" }}>
      <div style={{ 
        background: "var(--neutral-surface-primary)", 
        borderRadius: "var(--radius-card)", 
        border: "1px solid var(--neutral-line-separator-1)",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 24px", gap: "16px" }}>
          {selectedRowIds.length > 0 ? (
            <div style={{ 
              flex: 1, 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              background: "rgba(0, 107, 255, 0.05)",
              borderRadius: "var(--radius-card)",
              padding: "8px 16px 8px 12px",
              height: "44px"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div 
                  onClick={() => setSelectedRowIds([])}
                  style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "24px", height: "24px" }}
                >
                  <CloseIcon size={18} color="var(--neutral-on-surface-primary)" />
                </div>
                <span style={{ fontSize: "14px", fontWeight: "bold", color: "var(--neutral-on-surface-primary)" }}>{selectedRowIds.length} selected</span>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ position: "relative" }}>
                  <Button 
                    variant="outlined" 
                    size="small" 
                    leftIcon={DownloadIcon} 
                    rightIcon={ChevronDownIcon}
                    onClick={(e) => {
                      setBulkDownloadTriggerRect(e.currentTarget.getBoundingClientRect());
                      setIsBulkDownloadOpen(!isBulkDownloadOpen);
                    }}
                  >
                    Download
                  </Button>
                  {isBulkDownloadOpen && (
                    <>
                      {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsBulkDownloadOpen(false)} />, document.body)}
                      {createPortal(
                        <div style={{
                          position: "fixed",
                          top: `${bulkDownloadTriggerRect.bottom + 8}px`,
                          left: `${bulkDownloadTriggerRect.left}px`,
                          width: "240px",
                          background: "var(--neutral-surface-primary)",
                          border: "1px solid var(--neutral-line-separator-1)",
                          borderRadius: "12px",
                          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                          padding: "8px",
                          zIndex: 14001,
                          display: "flex",
                          flexDirection: "column",
                          gap: "4px"
                        }}>
                          <button 
                            onClick={() => setIsBulkDownloadOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              padding: "10px 12px",
                              border: "none",
                              background: "transparent",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "var(--neutral-on-surface-primary)",
                              transition: "background 0.2s",
                              width: "100%",
                              textAlign: "left"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#F5F5F5"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            Download Data as Excel
                          </button>
                          <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", margin: "0 4px" }} />
                          <button 
                            onClick={() => setIsBulkDownloadOpen(false)}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "flex-start",
                              padding: "10px 12px",
                              border: "none",
                              background: "transparent",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "14px",
                              color: "var(--neutral-on-surface-primary)",
                              transition: "background 0.2s",
                              width: "100%",
                              textAlign: "left"
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = "#F5F5F5"}
                            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                          >
                            Download Documents as ZIP
                          </button>
                        </div>,
                        document.body
                      )}
                    </>
                  )}
                </div>

                <Button 
                  variant="filled" 
                  size="small" 
                  onClick={() => {
                    const batches = MOCK_TRACEABILITY_DATA.filter(b => selectedRowIds.includes(b.id));
                    setSelectedBatches(batches);
                    setIsInvoiceModalOpen(true);
                  }}
                >
                  Add to Invoice
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <div onClick={(e) => {
                  setFilterTriggerRect(e.currentTarget.getBoundingClientRect());
                  setOpenFilterKey(prev => prev === 'material' ? null : 'material');
                }}>
                  <FilterPill 
                    label="Material" 
                    count={materialFilter.length} 
                    active={materialFilter.length > 0} 
                    isOpen={openFilterKey === 'material'} 
                  />
                </div>
                <div onClick={(e) => {
                  setFilterTriggerRect(e.currentTarget.getBoundingClientRect());
                  setOpenFilterKey(prev => prev === 'product' ? null : 'product');
                }}>
                  <FilterPill 
                    label="Product" 
                    count={productFilter.length} 
                    active={productFilter.length > 0} 
                    isOpen={openFilterKey === 'product'} 
                  />
                </div>

                {openFilterKey && (
                  <>
                    {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setOpenFilterKey(null)} />, document.body)}
                    {createPortal(
                      <div style={{
                        position: "fixed",
                        top: `${filterTriggerRect.bottom + 8}px`,
                        left: `${filterTriggerRect.left}px`,
                        width: "240px",
                        background: "var(--neutral-surface-primary)",
                        border: "1px solid var(--neutral-line-separator-1)",
                        borderRadius: "16px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        padding: "16px",
                        zIndex: 14001,
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <span style={{ fontSize: "var(--text-title-2)", fontWeight: "var(--font-weight-bold)" }}>
                            {openFilterKey === 'material' ? 'Material' : 'Product'}
                          </span>
                          <button 
                            onClick={() => { 
                              if (openFilterKey === 'material') setMaterialFilter([]);
                              else setProductFilter([]);
                              setOpenFilterKey(null); 
                            }} 
                            style={{ background: "none", border: "none", color: "var(--status-red-primary)", cursor: "pointer", fontSize: "12px", fontWeight: "bold" }}
                          >
                            Remove Filter
                          </button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {(openFilterKey === 'material' ? materialOptions : productOptions).map(opt => (
                            <label key={opt} style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer", fontSize: "13px" }}>
                              <Checkbox 
                                checked={(openFilterKey === 'material' ? materialFilter : productFilter).includes(opt)} 
                                onChange={() => {
                                  const setter = openFilterKey === 'material' ? setMaterialFilter : setProductFilter;
                                  const filter = openFilterKey === 'material' ? materialFilter : productFilter;
                                  setter(prev => prev.includes(opt) ? prev.filter(v => v !== opt) : [...prev, opt]);
                                }} 
                              />
                              {opt}
                            </label>
                          ))}
                        </div>
                      </div>,
                      document.body
                    )}
                  </>
                )}
              </div>
              <TableSearchField 
                value={searchQuery} 
                onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search Batch No, Material, WO, Product" 
                width="360px" 
              />
            </>
          )}
        </div>

        <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", width: "100%" }} />

        <div style={{ width: "100%", overflowX: "auto" }}>
          <div style={{ minWidth: "1100px", width: "100%" }}>
            <div style={{ 
              display: "grid", 
              gridTemplateColumns: gridTemplate, 
              borderBottom: "1px solid var(--neutral-line-separator-1)", 
              background: "var(--neutral-surface-primary)", 
              alignItems: "center" 
            }}>
              <div style={{ padding: "16px 12px 16px 24px", display: "flex", justifyContent: "center" }}>
                <Checkbox 
                  checked={selectedRowIds.length === visibleData.length && visibleData.length > 0} 
                  onChange={() => {
                    if (selectedRowIds.length === visibleData.length) {
                      setSelectedRowIds([]);
                    } else {
                      setSelectedRowIds(visibleData.map(m => m.id));
                    }
                  }} 
                />
              </div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Batch Number</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Material</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Work Order No</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Product</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Received</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Documents</div>
              <div style={{ padding: "16px 12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Action</div>
            </div>
            <div>
              {visibleData.length > 0 ? visibleData.map((item, idx) => {
                return (
                  <div 
                    key={item.id} 
                    style={{ 
                      display: "grid", 
                      gridTemplateColumns: gridTemplate, 
                      minHeight: `${rowHeight}px`, 
                      alignItems: "center", 
                      borderBottom: "1px solid var(--neutral-line-separator-1)", 
                      transition: "background 0.2s ease", 
                      width: "100%",
                      background: "transparent"
                    }}
                  >
                    <div 
                      style={{ padding: "12px 12px 12px 24px", display: "flex", justifyContent: "center" }}
                    >
                      <Checkbox 
                        checked={selectedRowIds.includes(item.id)} 
                        onChange={() => {
                          setSelectedRowIds(prev => 
                            prev.includes(item.id) ? prev.filter(id => id !== item.id) : [...prev, item.id]
                          );
                        }} 
                      />
                    </div>
                    
                    <div style={{ padding: "12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)" }}>
                      <span 
                        style={{ cursor: "pointer", transition: "text-decoration 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                        onClick={() => {}}
                      >
                        {item.batchNo}
                      </span>
                    </div>

                    <div style={{ padding: "12px", display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.material.name}</span>
                        <span 
                          style={{ fontSize: "var(--text-body)", color: "var(--feature-brand-primary)", cursor: "pointer", transition: "text-decoration 0.2s", width: "max-content" }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                          onClick={() => onNavigate?.("material_detail", { material: item.material })}
                        >
                          {item.material.sku}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: "12px", fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--feature-brand-primary)" }}>
                      <span 
                        style={{ cursor: "pointer", transition: "text-decoration 0.2s" }}
                        onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                        onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                        onClick={() => {}}
                      >
                        {item.workOrderNo}
                      </span>
                    </div>

                    <div style={{ padding: "12px", display: "flex", alignItems: "center", gap: "12px", minWidth: 0 }}>
                      <div style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                        <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.product.name}</span>
                        <span 
                          style={{ fontSize: "var(--text-body)", color: "var(--feature-brand-primary)", cursor: "pointer", transition: "text-decoration 0.2s", width: "max-content" }}
                          onMouseEnter={(e) => e.currentTarget.style.textDecoration = "underline"}
                          onMouseLeave={(e) => e.currentTarget.style.textDecoration = "none"}
                          onClick={() => {}}
                        >
                          {item.product.sku}
                        </span>
                      </div>
                    </div>

                    <div style={{ padding: "12px", fontSize: "var(--text-title-3)", color: "var(--neutral-on-surface-primary)" }}>
                      {item.received}
                    </div>

                    <div style={{ padding: "12px" }}>
                      <TableAttachmentCard attachments={item.documents} batchNo={item.batchNo} />
                    </div>

                     <div style={{ padding: "12px" }}>
                      <Tooltip content={(!item.documents || item.documents.length === 0) ? "Batch has no documents" : ""}>
                        <Button 
                          variant="outlined" 
                          size="small" 
                          disabled={!item.documents || item.documents.length === 0}
                          onClick={() => {
                            setSelectedBatches([item]);
                            setIsInvoiceModalOpen(true);
                          }}
                        >
                          Add to Invoice
                        </Button>
                      </Tooltip>
                    </div>
                  </div>
                );
              }) : <div style={{ padding: "40px", textAlign: "center", color: "var(--neutral-on-surface-tertiary)" }}>No results found.</div>}
            </div>
          </div>
        </div>
        <div style={{ padding: "0 4px" }}>
          <TablePaginationFooter 
            currentPage={currentPage} 
            totalPages={totalPages} 
            rowsPerPage={rowsPerPage} 
            totalRows={filteredData.length} 
            onPageChange={setCurrentPage} 
            onRowsPerPageChange={setRowsPerPage}
            renderLeftActions={() => (
              <div style={{ position: "relative" }}>
                <Button 
                  variant="outlined" 
                  size="small" 
                  leftIcon={DownloadIcon} 
                  rightIcon={ChevronDownIcon}
                  onClick={(e) => {
                    setDownloadTriggerRect(e.currentTarget.getBoundingClientRect());
                    setIsDownloadOpen(!isDownloadOpen);
                  }}
                >
                  Download
                </Button>
                {isDownloadOpen && (
                  <>
                    {createPortal(<div style={{ position: "fixed", inset: 0, zIndex: 14000 }} onClick={() => setIsDownloadOpen(false)} />, document.body)}
                    {createPortal(
                      <div style={{
                        position: "fixed",
                        top: `${downloadTriggerRect.top - 100}px`, // Open upwards
                        left: `${downloadTriggerRect.left}px`,
                        width: "240px",
                        background: "var(--neutral-surface-primary)",
                        border: "1px solid var(--neutral-line-separator-1)",
                        borderRadius: "12px",
                        boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                        padding: "8px",
                        zIndex: 14001,
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px"
                      }}>
                        <button 
                          onClick={() => setIsDownloadOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            padding: "10px 12px",
                            border: "none",
                            background: "transparent",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "var(--neutral-on-surface-primary)",
                            transition: "background 0.2s",
                            width: "100%",
                            textAlign: "left"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#F5F5F5"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          Download Data as Excel
                        </button>
                        <div style={{ height: "1px", background: "var(--neutral-line-separator-1)", margin: "0 4px" }} />
                        <button 
                          onClick={() => setIsDownloadOpen(false)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            padding: "10px 12px",
                            border: "none",
                            background: "transparent",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "14px",
                            color: "var(--neutral-on-surface-primary)",
                            transition: "background 0.2s",
                            width: "100%",
                            textAlign: "left"
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = "#F5F5F5"}
                          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                        >
                          Download Documents as ZIP
                        </button>
                      </div>,
                      document.body
                    )}
                  </>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <AddBatchToInvoiceModal 
        isOpen={isInvoiceModalOpen} 
        onClose={() => setIsInvoiceModalOpen(false)} 
        batches={selectedBatches} 
        showSnackbar={showSnackbar}
      />
    </div>
  );
};
