import React, { useEffect, useState } from "react";
import { GeneralModal } from "../../../components/modal/GeneralModal.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { Dropdown } from "../../../ce-ui";
import { FormField } from "../../../components/index.js";

// Same option lists/values as MaterialsListPage's own filters — kept as a
// plain constant here rather than importing that page (which also carries
// page-level state) since only the value lists themselves are shared. Each
// list is headed by an "All ..." option (see ALL_FILTER_VALUE in
// stockOpnameFieldsConfig.js) so the field never looks ambiguously blank —
// picking it clears any specific picks, and picking a specific value clears
// "All" (see handleChange below).
const ALL_FILTER_VALUE = "__all__";
const CATEGORY_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: "All Category" },
  ...["Raw Material", "Chemicals", "Electronics", "Fasteners"].map((v) => ({ value: v, label: v })),
];
const TYPE_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: "All Type" },
  { value: "Raw", label: "Raw Material" },
  { value: "SemiFinished", label: "Semi-Finished Material" },
  { value: "Finished", label: "Finished Material" },
];
const STATUS_OPTIONS = ["Active", "Inactive"].map((v) => ({ value: v, label: v }));
const ABC_OPTIONS = [
  { value: ALL_FILTER_VALUE, label: "All Classification" },
  ...["A", "B", "C"].map((v) => ({ value: v, label: v })),
];

// Status has no "All" option — it keeps its own explicit default (Active
// only) per the original spec, rather than joining the other fields' "All"
// convention.
const emptyFilters = () => ({ category: [ALL_FILTER_VALUE], type: [ALL_FILTER_VALUE], status: ["Active"], abcClassification: [ALL_FILTER_VALUE] });

// Lets the "Download Stock Count Sheet" button (StockOpnameListPage) narrow
// the exported sheet to only the Materials matching these filters, reusing
// the same Category/Type/Status/ABC Classification option lists as
// MaterialsListPage. Status defaults to "Active" pre-checked (PRD default).
export const StockCountSheetFilterModal = ({ isOpen, onClose, onConfirm }) => {
  const [filters, setFilters] = useState(emptyFilters());

  useEffect(() => {
    if (isOpen) setFilters(emptyFilters());
  }, [isOpen]);

  const setValues = (key, values) => setFilters((prev) => ({ ...prev, [key]: values }));

  // Keeps "All ..." and specific picks mutually exclusive for the three
  // fields that offer it: selecting "All" (freshly, not already active)
  // clears everything else; selecting a specific value while "All" was
  // active drops "All"; clearing every specific value falls back to "All"
  // rather than leaving the field looking empty/unselected.
  const handleAllAwareChange = (key, nextValues) =>
    setFilters((prev) => {
      const prevValues = prev[key];
      let next;
      if (nextValues.includes(ALL_FILTER_VALUE) && !prevValues.includes(ALL_FILTER_VALUE)) {
        next = [ALL_FILTER_VALUE];
      } else if (nextValues.length === 0) {
        next = [ALL_FILTER_VALUE];
      } else {
        next = nextValues.filter((v) => v !== ALL_FILTER_VALUE);
      }
      return { ...prev, [key]: next };
    });

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="Download Stock Count Sheet"
      description="Choose which Materials to include in the exported Stock Count Sheet."
      width="520px"
      hideFooterDivider
      footerPaddingTop={24}
      footer={
        <>
          <Button variant="outlined" size="large" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="filled" size="large" onClick={() => onConfirm(filters)} style={{ flex: 1 }}>
            Download
          </Button>
        </>
      }
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <FormField label="Category">
          <Dropdown
            multi
            searchable
            clearable={false}
            placeholder="Select category"
            options={CATEGORY_OPTIONS}
            value={filters.category}
            onChange={(values) => handleAllAwareChange("category", values)}
          />
        </FormField>
        <FormField label="Type">
          <Dropdown
            multi
            clearable={false}
            placeholder="Select type"
            options={TYPE_OPTIONS}
            value={filters.type}
            onChange={(values) => handleAllAwareChange("type", values)}
          />
        </FormField>
        <FormField label="Status">
          <Dropdown
            multi
            clearable={false}
            placeholder="Select status"
            options={STATUS_OPTIONS}
            value={filters.status}
            onChange={(values) => setValues("status", values)}
          />
        </FormField>
        <FormField label="ABC Classification">
          <Dropdown
            multi
            clearable={false}
            placeholder="Select classification"
            options={ABC_OPTIONS}
            value={filters.abcClassification}
            onChange={(values) => handleAllAwareChange("abcClassification", values)}
          />
        </FormField>
      </div>
    </GeneralModal>
  );
};
