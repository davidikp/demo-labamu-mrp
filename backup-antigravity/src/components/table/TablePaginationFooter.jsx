import React from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "../icons/Icons.jsx";
import { DropdownSelect } from "../common/DropdownSelect.jsx";

const TABLE_ROWS_PER_PAGE_OPTIONS = [10, 25, 50];
const baseInputBorderColor = "#e9e9e9";

const TablePaginationFooter = ({
  totalRows,
  rowsPerPage,
  onRowsPerPageChange,
  currentPage,
  totalPages,
  onPageChange,
  renderLeftActions,
}) => {
  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div className="ds-table-pagination">
      <div className="ds-table-pagination__rows">
        {renderLeftActions && (
          <>
            {renderLeftActions()}
            <div style={{ width: "1px", height: "24px", background: "#e9e9e9", margin: "0 8px 0 4px" }} />
          </>
        )}
        <div className="ds-table-pagination__rows-select">
          <DropdownSelect
            value={rowsPerPage}
            onChange={(nextValue) => onRowsPerPageChange(Number(nextValue))}
            options={TABLE_ROWS_PER_PAGE_OPTIONS.map((option) => ({
              value: option,
              label: String(option),
            }))}
            fieldHeight="40px"
            borderRadius="12px"
            fontSize="var(--text-title-2)"
            optionFontSize="var(--text-title-3)"
            menuWidth={112}
            showSelectedCheck={false}
            style={{ height: "40px" }}
          />
        </div>
        <span
          style={{
            fontSize: "var(--text-title-2)",
            color: "var(--neutral-on-surface-secondary)",
          }}
        >{`from ${totalRows} rows`}</span>
      </div>

      <div className="ds-table-pagination__pages">
        <button
          type="button"
          onClick={() => !isPrevDisabled && onPageChange(currentPage - 1)}
          disabled={isPrevDisabled}
          className="ds-icon-button"
          style={{
            "--ds-icon-button-size": "40px",
            "--ds-icon-button-radius": "12px",
            "--ds-icon-button-bg": isPrevDisabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            "--ds-icon-button-cursor": isPrevDisabled
              ? "not-allowed"
              : "pointer",
            border: `1px solid ${
              isPrevDisabled ? "transparent" : baseInputBorderColor
            }`,
          }}
        >
          <ChevronLeftIcon
            size={18}
            color="var(--neutral-on-surface-secondary)"
          />
        </button>
        <div className="ds-table-pagination__page-number">{currentPage}</div>
        <button
          type="button"
          onClick={() => !isNextDisabled && onPageChange(currentPage + 1)}
          disabled={isNextDisabled}
          className="ds-icon-button"
          style={{
            "--ds-icon-button-size": "40px",
            "--ds-icon-button-radius": "12px",
            "--ds-icon-button-bg": isNextDisabled
              ? "var(--neutral-surface-grey-lighter)"
              : "var(--neutral-surface-primary)",
            "--ds-icon-button-cursor": isNextDisabled
              ? "not-allowed"
              : "pointer",
            border: `1px solid ${
              isNextDisabled ? "transparent" : baseInputBorderColor
            }`,
          }}
        >
          <ChevronRightIcon
            size={18}
            color="var(--neutral-on-surface-secondary)"
          />
        </button>
      </div>
    </div>
  );
};

export { TablePaginationFooter };
