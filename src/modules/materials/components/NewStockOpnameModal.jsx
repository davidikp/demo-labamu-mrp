import React from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { ListViewIcon, Upload } from "../../../components/icons/Icons.jsx";
import { OptionCard } from "./stock-opname-steps/StartMethodStep.jsx";

// "+ New Stock Opname" entry point — PRD "Start Method" AC 1: a modal choice
// between the two start methods, replacing what used to be a full page step.
// Picking either option just closes the modal and navigates straight into
// the New Stock Opname page already on the right path; neither creates a
// persistent Stock Opname record yet (that still only happens on first Save
// as Draft / Apply for manual, or once an uploaded file passes validation).
export const NewStockOpnameModal = ({ isOpen, onClose, onSelectManual, onSelectUpload }) => (
  <GeneralModal
    isOpen={isOpen}
    onClose={onClose}
    title="How Do You Want to Add Your Stock Count?"
    description="Choose how you want to enter your physical stock count"
    width="720px"
  >
    <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", padding: "4px 0 8px" }}>
      <OptionCard
        icon={ListViewIcon}
        title="Enter Manually"
        description="Add items and enter their counted quantities directly"
        onClick={onSelectManual}
      />
      <OptionCard
        icon={Upload}
        title="Upload a File"
        description="Upload a CSV or Excel file, then review the imported data"
        onClick={onSelectUpload}
      />
    </div>
  </GeneralModal>
);
