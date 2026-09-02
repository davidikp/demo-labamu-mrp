import React, { useState } from "react";
import { ChevronLeftIcon, EditIcon, SearchIcon, AddIcon } from "../../../components/icons/Icons.jsx";
import { Button } from "../../../components/common/Button.jsx";
import { StatusBadge } from "../../../components/common/StatusBadge.jsx";
import { FilterMenu } from "../../../components/molecules/FilterMenu.jsx";
import { TableSearchField } from "../../../components/table/TableSearchField.jsx";
import { TablePaginationFooter } from "../../../components/table/TablePaginationFooter.jsx";
import { ChipTabBar } from "../../../components/molecules/ChipTabBar.jsx";
import { CustomerTagModal } from "../components/CustomerTagModal.jsx";
import { MOCK_CUSTOMER_TAGS, nextCustomerTagId } from "../mock/customerMocks.js";

const cellStyle = (overrides) => ({
  minWidth: 0,
  height: "56px",
  padding: "0 12px",
  display: "flex",
  alignItems: "center",
  fontSize: "var(--text-title-3)",
  color: "var(--neutral-on-surface-primary)",
  ...overrides,
});

const columns = [
  { label: "Customer Tag Name", flex: "2" },
  { label: "Status", flex: "1" },
  { label: "", flex: "1" },
];

export const CustomerManagePage = ({ onNavigate, showSnackbar, t }) => {
  const [tags, setTags] = useState(MOCK_CUSTOMER_TAGS);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [currentPage, setCurrentPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("Add");
  const [selectedTag, setSelectedTag] = useState(null);

  const filteredTags = tags.filter((tag) => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(tag.status);
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredTags.length / rowsPerPage));
  const paginatedTags = filteredTags.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);

  const openAddModal = () => {
    setModalMode("Add");
    setSelectedTag(null);
    setIsModalOpen(true);
  };

  const openEditModal = (tag) => {
    setModalMode("Edit");
    setSelectedTag(tag);
    setIsModalOpen(true);
  };

  const handleSave = (form) => {
    if (modalMode === "Add") {
      setTags((prev) => [{ id: nextCustomerTagId(), name: form.name, status: form.status }, ...prev]);
      showSnackbar?.("Customer tag successfully added", "success");
    } else {
      setTags((prev) => prev.map((t) => (t.id === selectedTag.id ? { ...t, ...form } : t)));
      showSnackbar?.("Customer tag successfully updated", "success");
    }
    setIsModalOpen(false);
  };

  return (
    <div
      style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        background: "var(--neutral-background-primary)",
        height: "100%",
        overflowY: "auto",
        padding: "24px",
      }}
    >
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <div
              style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", marginLeft: "-4px" }}
              onClick={() => onNavigate("list")}
            >
              <ChevronLeftIcon size={28} color="var(--neutral-on-surface-primary)" />
              <h1
                style={{
                  margin: 0,
                  fontSize: "var(--text-large-title)",
                  fontWeight: "var(--font-weight-bold)",
                  color: "var(--neutral-on-surface-primary)",
                }}
              >
                Manage Customer
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-title-3)", marginLeft: "32px" }}>
              <span style={{ color: "var(--neutral-on-surface-secondary)", cursor: "pointer" }} onClick={() => onNavigate("list")}>
                Customers
              </span>
              <span style={{ color: "var(--neutral-on-surface-tertiary)" }}>/</span>
              <span style={{ color: "var(--neutral-on-surface-secondary)" }}>Manage Customer</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <Button variant="outlined" leftIcon={AddIcon} onClick={openAddModal}>
              New Tag
            </Button>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        {/* Section selector matches MaterialManagePage's Category/UOM
            ChipTabBar — a single always-active chip since there's only one
            entity type here today (room to add more tag-like categories
            later without changing this pattern). */}
        <ChipTabBar tabs={[{ id: "customer_tag", label: "Customer Tag" }]} activeTab="customer_tag" onChange={() => {}} />
      </div>

      <div
        style={{
          background: "var(--neutral-surface-primary)",
          borderRadius: "16px",
          border: "1px solid var(--neutral-line-separator-1)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid var(--neutral-line-separator-2)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px", position: "relative" }}>
            <FilterMenu
              label="Status"
              multiple
              searchable={false}
              options={["Active", "Inactive"].map((o) => ({ value: o, label: o }))}
              values={statusFilter}
              onChangeMultiple={setStatusFilter}
            />
          </div>

          <TableSearchField
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search customer tag..."
            style={{ width: "320px" }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", background: "var(--neutral-surface-primary)", borderBottom: "1px solid var(--neutral-line-separator-1)" }}>
            {columns.map((col, idx) => (
              <div key={idx} style={{ flex: col.flex, padding: "0 12px", height: "49px", display: "flex", alignItems: "center" }}>
                <span style={{ fontSize: "var(--text-title-3)", fontWeight: "var(--font-weight-bold)", color: "var(--neutral-on-surface-primary)" }}>
                  {col.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            {paginatedTags.length > 0 ? (
              paginatedTags.map((row) => (
                <div key={row.id} style={{ display: "flex", borderBottom: "1px solid var(--neutral-line-separator-1)" }}>
                  <div style={cellStyle({ flex: columns[0].flex })}>{row.name}</div>
                  <div style={cellStyle({ flex: columns[1].flex })}>
                    <StatusBadge variant={row.status === "Active" ? "green" : "grey"}>{row.status}</StatusBadge>
                  </div>
                  <div style={cellStyle({ flex: columns[2].flex, justifyContent: "flex-end" })}>
                    <Button variant="outlined" leftIcon={EditIcon} onClick={() => openEditModal(row)}>
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div
                style={{
                  padding: "64px 24px",
                  textAlign: "center",
                  color: "var(--neutral-on-surface-tertiary)",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "12px",
                }}
              >
                <SearchIcon size={48} />
                <span>No results found.</span>
              </div>
            )}
          </div>
        </div>

        <TablePaginationFooter
          totalRows={filteredTags.length}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={setRowsPerPage}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      <CustomerTagModal
        isOpen={isModalOpen}
        mode={modalMode}
        initialTag={selectedTag}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
};
