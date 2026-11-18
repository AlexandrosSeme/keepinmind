import { ChevronDown, ChevronUp, ChevronsUpDown } from "lucide-react";
import type { RowData } from "@tanstack/react-table";
import type { LegacyColumn } from "@tanstack/react-table/legacy";

export function ariaSort(column: {
  getIsSorted: () => false | "asc" | "desc";
  getCanSort: () => boolean;
}): "ascending" | "descending" | "none" | undefined {
  const sorted = column.getIsSorted();
  if (sorted === "asc") return "ascending";
  if (sorted === "desc") return "descending";
  return column.getCanSort() ? "none" : undefined;
}

function SortableHeader<T extends RowData>({
  column,
  label,
}: {
  column: LegacyColumn<T, unknown>;
  label: string;
}) {
  const sorted = column.getIsSorted();
  const Icon =
    sorted === "asc"
      ? ChevronUp
      : sorted === "desc"
        ? ChevronDown
        : ChevronsUpDown;

  return (
    <button
      type="button"
      className={`km-sort${sorted ? " is-sorted" : ""}`}
      onClick={column.getToggleSortingHandler()}
    >
      {label}
      <Icon size={14} aria-hidden />
    </button>
  );
}

export default SortableHeader;
