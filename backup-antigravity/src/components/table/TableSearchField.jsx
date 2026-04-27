import React, { useState } from "react";
import { SearchIcon } from "../icons/Icons.jsx";

const TableSearchField = ({
  value = "",
  onChange,
  placeholder,
  width = "360px",
  minWidth = "280px",
  fontSize = "var(--text-subtitle-1)",
}) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div
      className="ds-table-search"
      style={{
        "--ds-table-search-width": width,
        "--ds-table-search-min-width": minWidth,
        "--ds-table-search-border": isFocused
          ? "var(--feature-brand-primary)"
          : "transparent",
        "--ds-table-search-shadow": isFocused
          ? "0 0 0 3px rgba(0, 104, 255, 0.08)"
          : "none",
        "--ds-table-search-font-size": fontSize,
      }}
    >
      <SearchIcon
        size={18}
        color="var(--neutral-on-surface-tertiary)"
        className="ds-table-search__icon"
      />
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="ds-table-search__input"
        style={{
          "--ds-table-search-color": value
            ? "var(--neutral-on-surface-primary)"
            : "var(--neutral-on-surface-secondary)",
        }}
      />
    </div>
  );
};

export { TableSearchField };
