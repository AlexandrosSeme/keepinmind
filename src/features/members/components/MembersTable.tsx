import React, { useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { flexRender } from "@tanstack/react-table";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  CreditCard,
  Edit,
  XCircle,
} from "lucide-react";
import { Pagination, SortableHeader, ariaSort } from "@/shared/ui";
import {
  byNumber,
  useClientTable,
  type ClientColumnDef,
  type ClientFilterFn,
} from "@/shared/table/useClientTable";
import { parseGRDate } from "@/shared/lib/date";
import type { Member, MemberStatus } from "../types";
import type { MemberRowActions } from "./memberActions";
import MemberAvatar from "./MemberAvatar";

const PAGE_SIZES = [10, 20, 50];

const StatusMark: React.FC<{ status: MemberStatus; label: string }> = ({
  status,
  label,
}) => {
  if (status === "expired") {
    return <XCircle size={16} className="text-danger flex-shrink-0" aria-label={label} />;
  }
  if (status === "expiring_soon") {
    return <Clock size={16} className="text-warning flex-shrink-0" aria-label={label} />;
  }
  return <CheckCircle2 size={16} className="text-success flex-shrink-0" aria-label={label} />;
};
const STATUS_RANK: Record<MemberStatus, number> = {
  active: 0,
  expiring_soon: 1,
  expired: 2,
};

interface MembersTableProps extends MemberRowActions {
  members: Member[];
  searchTerm: string;
  statusFilter: MemberStatus | "";
}

const memberSearch: ClientFilterFn<Member> = (row, _columnId, filterValue) => {
  const query = String(filterValue).trim().toLowerCase();
  if (!query) return true;
  const member = row.original;
  return (
    member.name.toLowerCase().includes(query) ||
    member.phone.includes(String(filterValue).trim())
  );
};

const MembersTable: React.FC<MembersTableProps> = ({
  members,
  searchTerm,
  statusFilter,
  onView,
  onEdit,
  onToggleCardLost,
  onPhotoClick,
}) => {
  const { t } = useTranslation(["members", "common"]);
  const actionsRef = useRef({
    onView,
    onEdit,
    onToggleCardLost,
    onPhotoClick,
  });
  actionsRef.current = {
    onView,
    onEdit,
    onToggleCardLost,
    onPhotoClick,
  };

  const columns = useMemo<ClientColumnDef<Member>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.name")} />
        ),
        cell: ({ row }) => {
          const member = row.original;
          const statusLabel = t(`common:status.${member.status}`);
          return (
            <div className="d-flex align-items-center min-w-0 w-100">
              <span
                onClick={(event) => {
                  if (member.photo_url) event.stopPropagation();
                }}
              >
                <MemberAvatar
                  member={member}
                  onPhotoClick={(src) => actionsRef.current.onPhotoClick(src)}
                />
              </span>
              <div className="min-w-0">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <span className="d-md-none" title={statusLabel}>
                    <StatusMark status={member.status} label={statusLabel} />
                  </span>
                  <div className="fw-semibold text-dark text-truncate km-page-subtitle">
                    {member.name}
                  </div>
                  {member.card_lost === true && (
                    <AlertTriangle
                      size={14}
                      className="text-danger flex-shrink-0"
                      aria-label={t("common:status.card_lost")}
                    />
                  )}
                </div>
                <div className="d-md-none km-member-meta">
                  <span
                    className="text-muted text-truncate"
                    title={`${member.phone} · ${member.package} · ${member.expiry}`}
                  >
                    {member.phone} · {member.package} · {member.expiry}
                  </span>
                </div>
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: "phone",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.phone")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted km-page-subtitle">{row.original.phone}</span>
        ),
      },
      {
        accessorKey: "package",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.package")} />
        ),
        cell: ({ row }) => (
          <span className="text-muted km-page-subtitle">{row.original.package}</span>
        ),
      },
      {
        accessorKey: "expiry",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.expiry")} />
        ),
        sortingFn: byNumber<Member>(
          (member) => parseGRDate(member.expiry)?.getTime() ?? 0,
        ),
        cell: ({ row }) => (
          <span className="text-muted km-page-subtitle">{row.original.expiry}</span>
        ),
      },
      {
        accessorKey: "status",
        header: ({ column }) => (
          <SortableHeader column={column} label={t("fields.status")} />
        ),
        filterFn: (row, _columnId, value) =>
          value === "" || row.original.status === value,
        sortingFn: byNumber<Member>((member) => STATUS_RANK[member.status]),
        cell: ({ row }) => {
          const label = t(`common:status.${row.original.status}`);
          return (
            <span title={label}>
              <StatusMark status={row.original.status} label={label} />
            </span>
          );
        },
      },
      {
        id: "actions",
        enableSorting: false,
        header: () => (
          <span className="d-none d-md-inline">{t("fields.actions")}</span>
        ),
        cell: ({ row }) => {
          const member = row.original;
          const actions = actionsRef.current;
          return (
            <div
              className="km-row-actions"
              role="group"
              onClick={(event) => event.stopPropagation()}
            >
              <button
                type="button"
                className="btn btn-link btn-sm km-action-link p-0"
                onClick={() => actions.onEdit(member)}
                title={t("common:actions.edit")}
                aria-label={t("common:actions.edit")}
              >
                <Edit size={16} />
              </button>
              <button
                type="button"
                className={`btn btn-link btn-sm km-action-link p-0${
                  member.card_lost === true ? "" : " km-action-danger"
                }`}
                onClick={() => actions.onToggleCardLost(member)}
                title={
                  member.card_lost === true
                    ? t("actions.activateCard")
                    : t("actions.cancelCardLost")
                }
                aria-label={
                  member.card_lost === true
                    ? t("actions.activateCard")
                    : t("actions.cancelCardLost")
                }
              >
                <CreditCard size={16} />
              </button>
            </div>
          );
        },
      },
    ],
    [t],
  );

  const table = useClientTable({
    data: members,
    columns,
    globalFilter: searchTerm,
    globalFilterFn: memberSearch,
    columnFilters: statusFilter
      ? [{ id: "status", value: statusFilter }]
      : [],
  });

  const pageMembers = table.getRowModel().rows.map((row) => row.original);
  const total = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;

  return (
    <>
      <div className="card border-0 shadow-sm km-table-card">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 km-table km-table-rows">
              <thead className="table-light">
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                        {headerGroup.headers.map((header) => {
                      const hide =
                        header.column.id === "phone" ||
                        header.column.id === "package" ||
                        header.column.id === "status"
                          ? "d-none d-md-table-cell"
                          : header.column.id === "expiry"
                            ? "d-none d-lg-table-cell"
                            : "";
                      const edge =
                        header.column.id === "name"
                          ? "ps-3 ps-md-4"
                          : header.column.id === "actions"
                            ? "pe-2 pe-md-4 km-col-actions"
                            : "";
                      return (
                        <th
                          key={header.id}
                          className={`border-0 ${edge} ${hide}`.trim()}
                          aria-sort={ariaSort(header.column)}
                          aria-label={
                            header.column.id === "actions"
                              ? t("fields.actions")
                              : undefined
                          }
                        >
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext(),
                              )}
                        </th>
                      );
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {pageMembers.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="text-center text-muted py-4">
                      {t("page.empty")}
                    </td>
                  </tr>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className={
                        row.original.status === "expired" ? "km-row-expired" : undefined
                      }
                      onClick={() => actionsRef.current.onView(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const hide =
                          cell.column.id === "phone" ||
                          cell.column.id === "package" ||
                          cell.column.id === "status"
                            ? "d-none d-md-table-cell"
                            : cell.column.id === "expiry"
                              ? "d-none d-lg-table-cell"
                              : "";
                        const edge =
                          cell.column.id === "name"
                            ? "ps-3 ps-md-4"
                            : cell.column.id === "actions"
                              ? "pe-2 pe-md-4 km-col-actions"
                              : "";
                        return (
                          <td
                            key={cell.id}
                            className={`${edge} ${hide}`.trim()}
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </td>
                        );
                      })}
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

export default MembersTable;
