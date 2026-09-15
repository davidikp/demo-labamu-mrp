import React, { useEffect, useRef, useState } from "react";
import { getShellLeftOffset } from "../../../constants/layoutConstants.js";
import { ChevronLeft } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StartMethodStep } from "../components/stock-opname-steps/StartMethodStep.jsx";
import { StockOpnameUploadStep, analyzeStockOpnameFile } from "../components/stock-opname-steps/StockOpnameUploadStep.jsx";
import { StockOpnameMappingStep } from "../components/stock-opname-steps/StockOpnameMappingStep.jsx";
import { StockOpnameReviewStep } from "../components/stock-opname-steps/StockOpnameReviewStep.jsx";
import { BackgroundProcessingScreen } from "../components/BackgroundProcessingScreen.jsx";
import { Stepper } from "../components/StockOpnameStepper.jsx";
import { addStockOpname, updateStockOpname, getStockOpname, SYSTEM_ACTOR_NAME } from "../mock/stockOpnamesStore.js";
import { makeEmptyRow, isRowInvalid } from "../mock/stockOpnameValidation.js";
import { revalidateForApply, applyStockOpnameRows } from "../mock/stockOpnameProcessing.js";
import {
  autoMatchHeaders,
  buildStockOpnameRowsFromMapping,
  REQUIRED_STOCK_OPNAME_FIELD_KEYS,
  NOT_MAPPED,
} from "../mock/stockOpnameFieldsConfig.js";
import { useNotifications } from "../../../context/NotificationContext.jsx";
import { setNavigationGuard, clearNavigationGuard } from "../../../utils/navigationGuard.js";
import { DiscardChangesConfirmModal } from "../components/DiscardChangesConfirmModal.jsx";
import { CancelStockOpnameConfirmModal } from "../components/CancelStockOpnameConfirmModal.jsx";

// New Stock Opname wizard shell. The "+ New Stock Opname" choice (manual vs.
// upload) is made in NewStockOpnameModal.jsx on the list page — this page is
// opened already knowing which one via initialData.startMethod, and jumps
// straight to the right step:
//   Manual:  review
//   Upload:  upload -> mapping -> mapping-processing -> review
// The in-page "start" step only shows if the page is reached without a
// startMethod (e.g. a stale/direct navigation).
export const StockOpnameNewPage = ({ onNavigate, showSnackbar, initialData, isSidebarCollapsed, isMobile = false }) => {
  const { resolveTodo } = useNotifications();
  const resumeId = initialData?.resumeStockOpnameId || null;
  const resumeRecord = resumeId ? getStockOpname(resumeId) : null;
  const resumeAtMapping = resumeRecord?.status === "Mapping";
  const resumeAtNormalizing = resumeRecord?.status === "Normalizing Data";

  const resumeAtProcessing = resumeRecord?.status === "Processing";
  // Set when the wizard is opened straight from the New Stock Opname modal's
  // choice (PRD "Start Method" AC 1) — skips the in-page Start Method step
  // entirely and drops the user directly into the chosen flow. Falls back to
  // showing that step itself if the page is somehow reached without one
  // (belt-and-suspenders; the modal is the only entry point in practice).
  const startMethod = !resumeRecord ? initialData?.startMethod || null : null;

  const [step, setStep] = useState(
    resumeRecord
      ? resumeAtMapping
        ? "mapping"
        : resumeAtNormalizing
        ? "mapping-processing"
        : resumeAtProcessing
        ? "processing"
        : "review"
      : startMethod === "manual"
      ? "review"
      : startMethod === "upload"
      ? "upload"
      : "start"
  );
  const [method, setMethod] = useState(resumeRecord?.method || startMethod || null);
  const [editingId, setEditingId] = useState(resumeRecord?.id || null);
  const [fileName, setFileName] = useState(resumeRecord?.sourceFile || "");
  const [parsedHeaders, setParsedHeaders] = useState(resumeRecord?.sourceHeaders || []);
  const [parsedRows, setParsedRows] = useState(resumeRecord?.rawRows || []);
  // Manual entry starts with one empty row already added rather than a blank
  // list — the user can still delete it, but there's no reason to make
  // "+ New Row" the very first click of the flow.
  const [rows, setRows] = useState(() => {
    if (resumeRecord?.rows?.length) return resumeRecord.rows;
    if (!resumeRecord && startMethod === "manual") return [makeEmptyRow()];
    return [];
  });
  const [mapping, setMapping] = useState(() => (resumeAtMapping ? autoMatchHeaders(resumeRecord?.sourceHeaders || []) : {}));
  const [recommendation, setRecommendation] = useState(() => (resumeAtMapping ? autoMatchHeaders(resumeRecord?.sourceHeaders || []) : {}));
  const [selectedFile, setSelectedFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadError, setUploadError] = useState("");

  // Snapshots of the last-saved state, used to detect unsaved edits so
  // leaving the page (via the header back arrow/breadcrumbs, or switching
  // modules from the sidebar) can prompt "Discard changes?" instead of
  // silently losing them — same convention as
  // product-catalog/BulkUploadNewPage.jsx and administration/
  // NotificationSettingsPage.jsx (which also registers the shared
  // navigation guard below for the sidebar-navigation case).
  const [rowsSnapshot, setRowsSnapshot] = useState(() => JSON.stringify(rows));
  const [mappingSnapshot, setMappingSnapshot] = useState(() => JSON.stringify(mapping));
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const pendingNavRef = useRef(null);

  const missingRequired = REQUIRED_STOCK_OPNAME_FIELD_KEYS.filter((key) => !mapping[key] || mapping[key] === NOT_MAPPED);
  const analyzeCancelRef = useRef(null);

  const isDirty =
    step === "upload"
      ? !!selectedFile
      : step === "mapping"
      ? JSON.stringify(mapping) !== mappingSnapshot
      : step === "review"
      ? JSON.stringify(rows) !== rowsSnapshot
      : false;

  // Registers the shared cross-page navigation guard (utils/navigationGuard.js)
  // so switching modules from the sidebar while dirty is deferred until the
  // user confirms — same mechanism NotificationSettingsPage and
  // BulkUploadNewPage already use for their own unsaved-changes cases.
  const isDirtyRef = useRef(false);
  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);
  useEffect(() => {
    const guard = (proceed) => {
      if (!isDirtyRef.current) return true;
      pendingNavRef.current = proceed;
      setShowDiscardConfirm(true);
      return false;
    };
    setNavigationGuard(guard);
    return () => clearNavigationGuard(guard);
  }, []);

  // Same "Discard changes?" prompt for navigation this page itself starts —
  // the header back arrow and breadcrumb links — which isn't routed through
  // the sidebar's navigation guard.
  const requestLeave = (target) => {
    if (!isDirty) {
      onNavigate(target);
      return;
    }
    pendingNavRef.current = () => onNavigate(target);
    setShowDiscardConfirm(true);
  };

  const confirmDiscard = () => {
    const proceed = pendingNavRef.current;
    pendingNavRef.current = null;
    setShowDiscardConfirm(false);
    proceed?.();
  };

  const handleAnalyzeClick = () => {
    if (!selectedFile) {
      setUploadError("Field cannot be empty");
      return;
    }
    setUploadError("");
    setIsAnalyzing(true);
    analyzeCancelRef.current = analyzeStockOpnameFile(
      selectedFile,
      (headers, parsedFileRows, uploadedFileName) => {
        analyzeCancelRef.current = null;
        setIsAnalyzing(false);
        handleAnalyzed(headers, parsedFileRows, uploadedFileName);
      },
      () => {
        analyzeCancelRef.current = null;
        setIsAnalyzing(false);
        showSnackbar?.("No data found in this file", "error");
      }
    );
  };

  const handleSimulateAnalyzeFailure = (type) => {
    analyzeCancelRef.current?.();
    analyzeCancelRef.current = null;
    setIsAnalyzing(false);
    showSnackbar?.(type === "timeout" ? "Failed to validate file" : "No data found in this file", "error");
  };

  // Upload creates the persistent record immediately once the file passes
  // validation (PRD "Upload, Mapping & Normalizing Data" AC 2) — unlike
  // manual, which waits for the first Save as Draft / Apply.
  const handleAnalyzed = (headers, fileRows, uploadedFileName) => {
    const effectiveFileName = uploadedFileName || fileName || "untitled-upload.csv";
    setFileName(effectiveFileName);
    setParsedHeaders(headers);
    setParsedRows(fileRows);

    const record = addStockOpname({
      method: "upload",
      status: "Mapping",
      sourceFile: effectiveFileName,
      totalRows: fileRows.length,
    });
    setEditingId(record.id);

    const matched = autoMatchHeaders(headers);
    setMapping(matched);
    setRecommendation(matched);
    setMappingSnapshot(JSON.stringify(matched));
    setStep("mapping");
  };

  const normalizeTimeoutRef = useRef(null);
  const pendingNormalizationRef = useRef(null);

  const finishNormalization = (recordId, rawRows, mappingUsed, { advanceLocalStep = true } = {}) => {
    const builtRows = buildStockOpnameRowsFromMapping(rawRows, mappingUsed);
    // StockOpnameNotifier (always mounted) watches this Normalizing Data ->
    // Review transition and fires "Stock Opname Ready for Review" on its
    // own — no need to notify from here directly.
    updateStockOpname(recordId, {
      status: "Review",
      rows: builtRows,
      totalRows: builtRows.length,
      logActorName: SYSTEM_ACTOR_NAME,
    });
    if (advanceLocalStep) {
      setRows(builtRows);
      setRowsSnapshot(JSON.stringify(builtRows));
      setStep("review");
    }
    pendingNormalizationRef.current = null;
    normalizeTimeoutRef.current = null;
  };

  const handleConfirmMapping = () => {
    if (missingRequired.length > 0 || !editingId) return;
    updateStockOpname(editingId, { status: "Normalizing Data" });
    setStep("mapping-processing");
    pendingNormalizationRef.current = { recordId: editingId, rawRows: parsedRows, mapping };
    normalizeTimeoutRef.current = setTimeout(() => {
      finishNormalization(editingId, parsedRows, mapping, { advanceLocalStep: false });
    }, 5000);
  };

  // Resuming a draft still "Normalizing Data" restarts the simulated
  // countdown — there's no real backend to resume actual elapsed progress
  // from, matching MaterialUploadNewPage's equivalent behavior.
  useEffect(() => {
    if (resumeAtNormalizing && resumeRecord) {
      pendingNormalizationRef.current = { recordId: resumeRecord.id, rawRows: resumeRecord.rawRows || [], mapping: resumeRecord.mapping || {} };
      normalizeTimeoutRef.current = setTimeout(() => {
        finishNormalization(resumeRecord.id, resumeRecord.rawRows || [], resumeRecord.mapping || {}, { advanceLocalStep: false });
      }, 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAddRow = () => setRows((prev) => [...prev, makeEmptyRow()]);
  const handleDeleteRows = (rowIds) => setRows((prev) => prev.filter((r) => !rowIds.includes(r.__rowId)));

  const handleSaveDraft = () => {
    const payload = { method: method || "manual", status: "Review", rows, totalRows: rows.length };
    const record = editingId ? updateStockOpname(editingId, payload) : addStockOpname(payload);
    setEditingId(record.id);
    setRowsSnapshot(JSON.stringify(rows));
    showSnackbar?.("Stock Opname saved as draft", "success");
    onNavigate("materials_stock-opname-list");
  };

  const canApply = rows.length > 0 && rows.every((r) => !isRowInvalid(r));

  const processTimeoutRef = useRef(null);

  const runProcessing = (recordId, rowsToApply) => {
    const { rows: resultRows, summary } = applyStockOpnameRows(rowsToApply);
    // StockOpnameNotifier fires "Stock Opname Completed" on its own once it
    // sees this Processing -> Completed transition.
    updateStockOpname(recordId, {
      status: "Completed",
      rows: resultRows,
      result: summary,
      logActorName: SYSTEM_ACTOR_NAME,
    });
    processTimeoutRef.current = null;
  };

  // Apply performs one more full validation pass against the *current*
  // store state before committing to Processing (PRD "Apply & Processing"
  // AC 2/3) — Review Data may have gone stale since it was last saved (e.g.
  // another user adjusted the same Batch in the meantime). For a manual
  // Stock Opname that was never saved as a draft, Apply is also what first
  // creates the persistent record (PRD "Start Method" AC 5).
  const handleApply = () => {
    if (!canApply) return;
    const { rows: rehydratedRows, isValid } = revalidateForApply(rows);
    // Apply is the point manual rows' inline field errors start showing —
    // before this they're only reflected in the "need attention" count/
    // disabled Apply button, not painted red on every blank field.
    const shownRows = rehydratedRows.map((r) => ({ ...r, __showErrors: true }));
    setRows(shownRows);
    if (!isValid) {
      showSnackbar?.("Some rows no longer pass validation — please review the highlighted errors.", "error");
      return;
    }

    const appliedAt = new Date().toISOString();
    const payload = { method: method || "manual", status: "Processing", appliedAt, rows: rehydratedRows, totalRows: rehydratedRows.length };
    const record = editingId ? updateStockOpname(editingId, payload) : addStockOpname(payload);
    setEditingId(record.id);
    setRowsSnapshot(JSON.stringify(rehydratedRows));
    // Applying resolves the "Review Stock Opname" Todo this record may have
    // created (upload path's Ready for Review notification).
    resolveTodo("stock_opname", record.id, "stock_opname");
    setStep("processing");
    processTimeoutRef.current = setTimeout(() => runProcessing(record.id, rehydratedRows), 5000);
  };

  // Demo-only: lets the Processing interstitial's "Simulate" control abandon
  // the pending apply and mark the record system-cancelled, mirroring PRD
  // "Notification" AC 3 (Stock Opname is canceled by the system because of
  // an infrastructure/processing failure) — there's no real backend job here
  // to actually fail.
  const handleSimulateProcessingFailure = () => {
    clearTimeout(processTimeoutRef.current);
    processTimeoutRef.current = null;
    // StockOpnameNotifier fires "Stock Opname Canceled" on its own once it
    // sees this Processing -> Cancelled transition.
    updateStockOpname(editingId, {
      status: "Cancelled",
      logActorName: SYSTEM_ACTOR_NAME,
      logTitle: "Stock Opname Canceled",
      logDesc: "The system could not continue processing due to a simulated infrastructure failure. No stock was adjusted.",
    });
    showSnackbar?.("Stock Opname was cancelled by the system.", "error");
    onNavigate("materials_stock-opname-list");
  };

  // Resuming a record still "Processing" (e.g. reopened from the list before
  // this simulated run finishes) restarts the countdown from scratch — same
  // "no real backend to resume actual progress from" caveat as Normalizing
  // Data above.
  useEffect(() => {
    if (resumeAtProcessing && resumeRecord) {
      processTimeoutRef.current = setTimeout(() => runProcessing(resumeRecord.id, resumeRecord.rows || []), 5000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fired from CancelStockOpnameConfirmModal once a reason is confirmed —
  // same "Cancel" -> reason modal -> actually cancel" flow as Bulk Upload's
  // own Mapping/Review Cancel button (MaterialUploadNewPage.handleCancelUpload).
  const handleCancel = (reason) => {
    if (editingId) {
      updateStockOpname(editingId, { status: "Cancelled", logDesc: reason });
      // Cancelling the session resolves any pending "Review Stock Opname" Todo.
      resolveTodo("stock_opname", editingId, "stock_opname");
    }
    onNavigate("materials_stock-opname-list");
  };

  const showFooter = step === "upload" || step === "mapping" || step === "review";

  return (
    <div style={{ height: "calc(100vh - 64px)", padding: "24px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px", overflow: step === "start" ? "auto" : "hidden", paddingBottom: showFooter ? "96px" : "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", marginLeft: "-4px" }} onClick={() => requestLeave("materials_stock-opname-list")}>
            <ChevronLeft size={28} color="var(--neutral-on-surface-primary)" />
            <h1 style={{ margin: 0, fontSize: "var(--text-large-title)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
              Add New Stock Opname
            </h1>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => requestLeave("materials_list")}>Materials</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => requestLeave("materials_stock-opname-list")}>Stock Opname</span>
            <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
            <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Add New Stock Opname</span>
          </div>
        </div>
        {/* Upload's record number lives inside the stepper card below the
            file name instead — this card is only for the manual flow, and
            shows regardless of whether a record exists yet: a manual Stock
            Opname isn't persisted (and so has no Stock Opname No) until the
            first Save as Draft or Apply — see stockOpnamesStore.js. */}
        {method === "manual" && step !== "start" && (
          <div
            style={{
              background: "var(--neutral-surface-primary)",
              borderRadius: "var(--radius-card)",
              border: "1px solid var(--neutral-line-separator-1)",
              padding: "12px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: "2px",
            }}
          >
            <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>Manual Entry</span>
            <span style={{ fontSize: "14px", color: editingId ? "var(--neutral-on-surface-secondary)" : "var(--neutral-on-surface-tertiary)", fontStyle: editingId ? "normal" : "italic" }}>
              {editingId || "Save as draft first to generate a Stock Opname No"}
            </span>
          </div>
        )}
      </div>

      {method === "upload" && step !== "start" && (
        <div style={{ background: "var(--neutral-surface-primary)", borderRadius: "var(--radius-card)", border: "1px solid var(--neutral-line-separator-1)", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px" }}>
          <Stepper currentKey={step === "mapping-processing" ? "mapping" : step} allDone={step === "processing"} />
          {fileName && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: "var(--font-weight-bold)" }}>{fileName}</span>
              {editingId && <span style={{ fontSize: "14px", color: "var(--neutral-on-surface-secondary)" }}>{editingId}</span>}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "var(--radius-card)",
          border: "1px solid var(--neutral-line-separator-1)",
          ...(step === "mapping" || step === "review" ? { flex: 1, minHeight: 0, display: "flex", flexDirection: "column" } : {}),
        }}
      >
        {step === "start" && (
          <StartMethodStep
            onSelectManual={() => {
              setMethod("manual");
              setRows((prev) => {
                const next = prev.length ? prev : [makeEmptyRow()];
                setRowsSnapshot(JSON.stringify(next));
                return next;
              });
              setStep("review");
            }}
            onSelectUpload={() => {
              setMethod("upload");
              setStep("upload");
            }}
          />
        )}
        {step === "upload" && (
          <StockOpnameUploadStep
            selectedFile={selectedFile}
            onFileSelected={(file) => {
              setSelectedFile(file);
              if (file) setUploadError("");
            }}
            isAnalyzing={isAnalyzing}
            error={uploadError}
            onSimulateAnalyzeFailure={handleSimulateAnalyzeFailure}
          />
        )}
        {step === "mapping" && (
          <StockOpnameMappingStep
            headers={parsedHeaders}
            rows={parsedRows}
            mapping={mapping}
            recommendation={recommendation}
            onMappingChange={(key, val) => setMapping((prev) => ({ ...prev, [key]: val }))}
            missingRequired={missingRequired}
          />
        )}
        {step === "mapping-processing" && (
          <BackgroundProcessingScreen
            title="Preparing Your Data for Review"
            message="We're checking your mapped data and getting it ready for review. You can leave this page and we'll notify you when it's ready."
            buttonLabel="Back to Stock Opname List"
            onBackToList={() => onNavigate("materials_stock-opname-list")}
          />
        )}
        {step === "review" && (
          <StockOpnameReviewStep rows={rows} onRowsChange={setRows} onAddRow={handleAddRow} onDeleteRows={handleDeleteRows} />
        )}
        {step === "processing" && (
          <div style={{ position: "relative" }}>
            <BackgroundProcessingScreen
              title="Applying Your Stock Opname"
              message="We're updating your stock based on the final counted quantities. You can leave this page and we'll notify you when it's done."
              buttonLabel="Back to Stock Opname List"
              onBackToList={() => onNavigate("materials_stock-opname-list")}
            />
            <div
              style={{
                position: "absolute",
                bottom: "16px",
                right: "16px",
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: "6px",
                padding: "10px",
                borderRadius: "var(--radius-card)",
                border: "1px dashed var(--neutral-line-separator-2)",
                background: "var(--neutral-surface-grey-lighter)",
              }}
            >
              <span style={{ fontSize: "11px", color: "var(--neutral-on-surface-tertiary)" }}>Demo: simulate a failure</span>
              <Button size="small" variant="outlined" onClick={handleSimulateProcessingFailure}>
                Simulate Processing Failure
              </Button>
            </div>
          </div>
        )}
      </div>

      {showFooter && (
        <div
          style={{
            position: "fixed",
            bottom: 0,
            left: getShellLeftOffset(isSidebarCollapsed, isMobile),
            right: 0,
            transition: "left 0.2s ease",
            background: "var(--neutral-surface-primary)",
            borderTop: "1px solid var(--neutral-line-separator-1)",
            padding: "14px 24px",
            display: "flex",
            justifyContent: step === "upload" ? "flex-end" : "space-between",
            alignItems: "center",
            zIndex: 100,
          }}
        >
          {step === "upload" && (
            <Button variant="filled" size="large" disabled={isAnalyzing} onClick={handleAnalyzeClick}>
              {isAnalyzing ? "Validating..." : "Validate File"}
            </Button>
          )}
          {step === "mapping" && (
            <>
              {/* Upload always creates the record right after the file
                  passes validation, before Mapping is ever reached, so
                  editingId is always set here — unlike Review's manual
                  path below. */}
              <div>
                {editingId && (
                  <Button size="large" variant="tertiary" onClick={() => setShowCancelConfirm(true)} style={{ color: "var(--status-red-primary)" }}>
                    Cancel
                  </Button>
                )}
              </div>
              <Button variant="filled" size="large" disabled={missingRequired.length > 0} onClick={handleConfirmMapping}>
                Confirm Mapping
              </Button>
            </>
          )}
          {step === "review" && (
            <>
              {/* A manual Stock Opname isn't persisted (no Stock Opname No)
                  until the first Save as Draft/Apply — with nothing saved
                  yet, there's nothing for Cancel to actually cancel, so it
                  stays hidden until editingId exists. The wrapping <div>
                  keeps this a two-item flex row either way, so the right-
                  side buttons don't jump to the left edge when it's empty. */}
              <div>
                {editingId && (
                  <Button size="large" variant="tertiary" onClick={() => setShowCancelConfirm(true)} style={{ color: "var(--status-red-primary)" }}>
                    Cancel
                  </Button>
                )}
              </div>
              <div style={{ display: "flex", gap: "12px" }}>
                <Button variant="outlined" size="large" onClick={handleSaveDraft}>Save as Draft</Button>
                <Button variant="filled" size="large" disabled={!canApply} onClick={handleApply}>
                  Apply Stock Opname
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      <DiscardChangesConfirmModal
        isOpen={showDiscardConfirm}
        onClose={() => {
          pendingNavRef.current = null;
          setShowDiscardConfirm(false);
        }}
        onConfirm={confirmDiscard}
      />

      <CancelStockOpnameConfirmModal
        isOpen={showCancelConfirm}
        onClose={() => setShowCancelConfirm(false)}
        onConfirm={handleCancel}
      />
    </div>
  );
};
