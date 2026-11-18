import { useEffect, useState } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
  type LegacyRow,
  type LegacyTableOptions,
} from "@tanstack/react-table/legacy";
import type {
  ColumnFiltersState,
  PaginationState,
  RowData,
  SortingState,
} from "@tanstack/react-table";

export type ClientColumnDef<T extends RowData> = LegacyColumnDef<T>;
export type ClientFilterFn<T extends RowData> = NonNullable<
  LegacyTableOptions<T>["globalFilterFn"]
>;

export function byNumber<T extends RowData>(pick: (row: T) => number) {
  return (a: LegacyRow<T>, b: LegacyRow<T>) => pick(a.original) - pick(b.original);
}

export function byText<T extends RowData>(pick: (row: T) => string) {
  return (a: LegacyRow<T>, b: LegacyRow<T>) =>
    pick(a.original).localeCompare(pick(b.original), undefined, {
      sensitivity: "base",
    });
}

interface UseClientTableOptions<T extends RowData> {
  data: T[];
  columns: ClientColumnDef<T>[];
  globalFilter?: string;
  globalFilterFn?: ClientFilterFn<T>;
  columnFilters?: ColumnFiltersState;
  initialPageSize?: number;
}

/** Sort, text filter and pagination for an in-memory list. */
export function useClientTable<T extends RowData>({
  data,
  columns,
  globalFilter = "",
  globalFilterFn,
  columnFilters = [],
  initialPageSize = 20,
}: UseClientTableOptions<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  const filterKey = `${globalFilter}\n${columnFilters
    .map((filter) => `${filter.id}:${String(filter.value)}`)
    .join("|")}`;

  useEffect(() => {
    setPagination((current) =>
      current.pageIndex === 0 ? current : { ...current, pageIndex: 0 },
    );
  }, [filterKey]);

  return useLegacyTable({
    data,
    columns,
    state: { sorting, globalFilter, columnFilters, pagination },
    onSortingChange: setSorting,
    onPaginationChange: setPagination,
    globalFilterFn,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });
}
