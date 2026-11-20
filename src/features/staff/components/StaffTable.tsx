import React, { useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import { Edit, Search, Trash2, UserCog } from "lucide-react";
import { IconAvatar, Pagination, SortableHeader, ariaSort } from "@/shared/ui";
import { personNameMatches, surnameFirst } from "@/shared/lib/personName";
import {
  byNumber,
  bySurname,
  byText,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import { intlLocale } from "@/shared/i18n";
import type { StaffUser } from "@/features/auth";

const PAGE_SIZES = [10, 20, 50];

export interface StaffRow extends StaffUser {
  isSelf: boolean;
  canManage: boolean;
}

const staffSearch: ClientFilterFn<StaffRow> = (row, _columnId, filterValue) => {
  const query = String(filterValue).trim().toLowerCase();
  if (!query) return true;
  const user = row.original;
  return (
    personNameMatches(user.fullName || "", query) ||
    user.email.toLowerCase().includes(query)
  );
};

interface StaffTableProps {
  users: StaffRow[];
  onEdit: (user: StaffRow) => void;
  onDelete: (user: StaffRow) => void;
}

const formatDate = (iso: string | null) =>
  iso
    ? new Date(iso).toLocaleString(intlLocale(), {
        dateStyle: "short",
        timeStyle: "short",
      })
    : "—";

const StaffTable: React.FC<StaffTableProps> = ({ users, onEdit, onDelete }) => {
  const { t } = useTranslation(["staff", "auth", "common"]);
  const actionsRef = useRef({ onEdit, onDelete });
  actionsRef.current = { onEdit, onDelete };
  const [searchTerm, setSearchTerm] = useState("");

  const columns = useMemo<ClientColumnDef<StaffRow>[]>(
    () => [
      {
        id: "fullName",
        accessorFn: (user) => user.fullName || user.email,
        sortFn: bySurname<StaffRow>((user) => user.fullName || user.email),
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.fullName")} />
        ),
        cell: ({ row }) => {
          const user = row.original;
          return (
            <div className="d-flex align-items-center">
              <IconAvatar className="me-3">
                <UserCog size={18} />
              </IconAvatar>
              <div className="min-w-0">
                <div className="fw-semibold text-dark">
                  {surnameFirst(user.fullName || user.email)}
                  {user.isSelf && (
                    <span className="text-muted fw-normal ms-1">
                      ({t("table.you")})
                    </span>
                  )}
                </div>
                <small className="text-muted">{user.email}</small>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "role",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.role")} />
        ),
        sortFn: byText<StaffRow>((user) => t(`auth:roles.${user.role}`)),
        cell: ({ row }) => t(`auth:roles.${row.original.role}`),
      },
      {
        accessorKey: "lastSignInAt",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.lastSignIn")} />
        ),
        sortFn: byNumber<StaffRow>((user) =>
          user.lastSignInAt ? Date.parse(user.lastSignInAt) : 0,
        ),
        cell: ({ row }) => (
          <span className="text-muted">
            {formatDate(row.original.lastSignInAt)}
          </span>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => t("table.actions"),
        cell: ({ row }) => {
          const user = row.original;
          const actions = actionsRef.current;
          return (
            <div className="d-flex align-items-center gap-3">
              {(user.canManage || user.isSelf) && (
                <button
                  type="button"
                  className="btn btn-link btn-sm km-action-link p-0"
                  onClick={() => actions.onEdit(user)}
                  title={t("common:actions.edit")}
                  aria-label={t("common:actions.edit")}
                >
                  <Edit size={16} />
                </button>
              )}
              {user.canManage && (
                <button
                  type="button"
                  className="btn btn-link btn-sm km-action-link km-action-danger p-0"
                  onClick={() => actions.onDelete(user)}
                  title={t("common:actions.delete")}
                  aria-label={t("common:actions.delete")}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          );
        },
      },
    ],
    [t],
  );

  const table = useClientTable({
    data: users,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: staffSearch,
    initialSorting: [{ id: "fullName", desc: false }],
  });

  const rows = table.getRowModel().rows;
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
      <div className="card border-0 shadow-sm mb-4 km-toolbar-card">
        <div className="card-body">
          <div className="position-relative">
            <Search
              size={16}
              className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"
            />
            <input
              type="search"
              className="form-control ps-5"
              placeholder={t("page.searchPlaceholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label={t("common:actions.search")}
            />
          </div>
        </div>
      </div>

      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table">
              <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className={`border-0 ${
                          header.column.id === "fullName"
                            ? "ps-4"
                            : header.column.id === "actions"
                              ? "pe-4"
                              : ""
                        }`}
                        aria-sort={ariaSort(header.column)}
                      >
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center text-muted py-5">
                      {t("table.empty")}
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className={
                            cell.column.id === "fullName"
                              ? "ps-4"
                              : cell.column.id === "actions"
                                ? "pe-4"
                                : undefined
                          }
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Pagination
        className="mt-3"
        page={pageIndex + 1}
        pageSize={pageSize}
        total={total}
        pageSizeOptions={PAGE_SIZES}
        onPageChange={(page) => table.setPageIndex(page - 1)}
        onPageSizeChange={(size) => table.setPageSize(size)}
      />
    </>
  );
};

export default StaffTable;
