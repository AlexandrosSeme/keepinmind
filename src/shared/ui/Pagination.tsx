import React from "react";
import { useTranslation } from "react-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "./Pagination.scss";

export interface PaginationProps {
  /** 1-based current page. */
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  /** When given, shows a page-size selector with these options. */
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
  className?: string;
}

/** Page numbers to show: first, last, current ±1, with gaps marked as null. */
function pageWindow(page: number, pages: number): (number | null)[] {
  const keep = new Set([1, pages, page - 1, page, page + 1]);
  const result: (number | null)[] = [];
  for (let p = 1; p <= pages; p++) {
    if (keep.has(p)) result.push(p);
    else if (result[result.length - 1] !== null) result.push(null);
  }
  return result;
}

const Pagination: React.FC<PaginationProps> = ({
  page,
  pageSize,
  total,
  onPageChange,
  pageSizeOptions,
  onPageSizeChange,
  className = "",
}) => {
  const { t } = useTranslation();
  const pages = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <nav className={`km-pagination ${className}`.trim()} aria-label={t("pagination.label")}>
      <span className="km-pagination__info">
        {t("pagination.showing", { from, to, total })}
      </span>

      <div className="km-pagination__pages">
        <button
          type="button"
          className="km-pagination__btn"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label={t("pagination.previous")}
        >
          <ChevronLeft size={16} />
        </button>
        {pageWindow(page, pages).map((p, i) =>
          p === null ? (
            <span key={`gap-${i}`} className="km-pagination__gap">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              className={`km-pagination__btn${p === page ? " is-active" : ""}`}
              onClick={() => onPageChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          ),
        )}
        <button
          type="button"
          className="km-pagination__btn"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= pages}
          aria-label={t("pagination.next")}
        >
          <ChevronRight size={16} />
        </button>
      </div>

      {pageSizeOptions && onPageSizeChange && (
        <label className="km-pagination__size">
          <span>{t("pagination.perPage")}</span>
          <select
            className="form-select form-select-sm"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
          >
            {pageSizeOptions.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      )}
    </nav>
  );
};

export default Pagination;
