import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";
import { CheckSquare, Printer, Search, Square, X } from "lucide-react";
import { PageHeader, Pagination } from "@/shared/ui";
import {
  useMemberMutations,
  useMembers,
  useToggleCardLost,
  type Member,
} from "@/features/members";
import MemberPrintCard from "../components/MemberPrintCard";
import "./PrintQRCodesPage.scss";

type CardLostFilter = "all" | "lost" | "active";

const CARDS_PER_PRINTED_PAGE = 6;
/** Cards rendered on screen at once (each card renders a QR code). */
const PAGE_SIZES = [24, 48, 96];
const MAX_SEARCH_RESULTS = 20;

const PrintQRCodesPage: React.FC = () => {
  const { t } = useTranslation("qrCodes");
  const { members } = useMembers();
  const { editMember } = useMemberMutations();
  const toggleCardLost = useToggleCardLost();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [cardLostFilter, setCardLostFilter] = useState<CardLostFilter>("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
  /** While true, every selected card (all pages) is rendered for window.print(). */
  const [printing, setPrinting] = useState(false);

  const sortedMembers = useMemo(
    () => [...members].sort((a, b) => a.id - b.id),
    [members],
  );

  // Preselect the member from `?id=`, otherwise select every card.
  useEffect(() => {
    const memberIdParam = searchParams.get("id");
    const member = memberIdParam
      ? sortedMembers.find((m) => m.id === parseInt(memberIdParam))
      : undefined;

    if (member) {
      setSelectedMember(member);
      setSelectedCards(new Set([member.id]));
    } else {
      setSelectedCards(new Set(sortedMembers.map((m) => m.id)));
    }
  }, [sortedMembers, searchParams]);

  const filteredMembers = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return sortedMembers.filter((m) => {
      const matchesSearch =
        !term ||
        m.name.toLowerCase().includes(term) ||
        m.phone.includes(searchTerm) ||
        m.id.toString().includes(searchTerm);
      const matchesCardFilter =
        cardLostFilter === "all" ||
        (cardLostFilter === "lost"
          ? m.card_lost === true
          : m.card_lost !== true);
      return matchesSearch && matchesCardFilter;
    });
  }, [sortedMembers, searchTerm, cardLostFilter]);

  const membersToDisplay = selectedMember ? [selectedMember] : filteredMembers;
  const membersToPrint = membersToDisplay.filter((m) =>
    selectedCards.has(m.id),
  );

  // Back to the first page whenever the visible set changes.
  useEffect(() => {
    setPage(1);
  }, [searchTerm, cardLostFilter, selectedMember, pageSize]);

  const pageCount = Math.max(1, Math.ceil(membersToDisplay.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageMembers = membersToDisplay.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize,
  );
  const cardsToRender = printing ? membersToPrint : pageMembers;
  /** Position of each card in the print run, for page breaks every 6 cards. */
  const printIndexOf = new Map(membersToPrint.map((m, i) => [m.id, i]));

  // Print once the selected cards of every page are rendered; restore paging afterwards.
  useEffect(() => {
    if (!printing) return;
    const done = () => setPrinting(false);
    window.addEventListener("afterprint", done);
    const timer = window.setTimeout(() => {
      window.print();
      // Some browsers don't fire afterprint; print() blocks until the dialog closes.
      done();
    }, 300);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("afterprint", done);
    };
  }, [printing]);

  const handlePrint = () => {
    if (membersToPrint.length === 0) {
      alert(t("print.noneSelected"));
      return;
    }
    setPrinting(true);
  };

  const handlePrintSingleCard = (member: Member) => {
    setSelectedMember(member);
    setSelectedCards(new Set([member.id]));
    setPrinting(true);
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchTerm("");
    setSelectedCards(new Set([member.id]));
  };

  const handleClearSelection = () => {
    setSelectedMember(null);
    setSelectedCards(new Set(sortedMembers.map((m) => m.id)));
  };

  const toggleCardSelection = (memberId: number) => {
    setSelectedCards((prev) => {
      const next = new Set(prev);
      if (next.has(memberId)) {
        next.delete(memberId);
      } else {
        next.add(memberId);
      }
      return next;
    });
  };

  const handlePrintNewCard = async (member: Member) => {
    if (member.card_lost === true) {
      const confirmMessage = t("print.confirmReactivate", {
        name: member.name,
      });
      if (!window.confirm(confirmMessage)) return;
      const updated = await editMember(member.id, { card_lost: false });
      if (!updated) return;
    }
    navigate(`/print-qr-codes?id=${member.id}`);
  };

  return (
    <div>
      <div className="d-print-none mb-4">
        <PageHeader
          title={t("print.title")}
          actions={
            <>
              <button
                className="btn btn-outline-secondary"
                onClick={() =>
                  setSelectedCards(new Set(membersToDisplay.map((m) => m.id)))
                }
                disabled={membersToDisplay.length === 0}
              >
                <CheckSquare size={18} className="me-2" />
                {t("print.selectAll")}
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSelectedCards(new Set())}
                disabled={membersToDisplay.length === 0}
              >
                <Square size={18} className="me-2" />
                {t("print.deselect")}
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePrint}
                disabled={membersToPrint.length === 0}
              >
                <Printer size={18} className="me-2" />
                {t("print.printCount", { count: membersToPrint.length })}
              </button>
            </>
          }
        />

        <div className="card border-0 shadow-sm mb-3 km-toolbar-card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold">
                  {t("print.searchLabel")}
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("print.searchPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={!!selectedMember}
                  />
                  {selectedMember && (
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={handleClearSelection}
                    >
                      <X size={18} />
                    </button>
                  )}
                </div>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label fw-semibold">
                  {t("print.cardStatus")}
                </label>
                <select
                  className="form-select"
                  value={cardLostFilter}
                  onChange={(e) =>
                    setCardLostFilter(e.target.value as CardLostFilter)
                  }
                  disabled={!!selectedMember}
                >
                  <option value="all">{t("print.filterAll")}</option>
                  <option value="active">{t("print.filterActive")}</option>
                  <option value="lost">{t("print.filterLost")}</option>
                </select>
              </div>
            </div>
            {searchTerm && !selectedMember && (
              <div className="mt-2">
                <small className="text-muted">
                  {t("print.found", { count: filteredMembers.length })}
                </small>
              </div>
            )}
          </div>
        </div>

        {selectedMember && (
          <div className="alert alert-success d-flex justify-content-between align-items-center">
            <div>
              <strong>{t("print.selectedMember")}</strong> {selectedMember.name}{" "}
              (ID: {selectedMember.id})
            </div>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={handleClearSelection}
            >
              <X size={16} className="me-1" />
              {t("print.clear")}
            </button>
          </div>
        )}

        {searchTerm && !selectedMember && filteredMembers.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="mb-2">{t("print.searchResults")}</h6>
              <div className="list-group km-print-search-results">
                {filteredMembers.slice(0, MAX_SEARCH_RESULTS).map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    className="list-group-item list-group-item-action"
                    onClick={() => handleSelectMember(member)}
                  >
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{member.name}</strong>
                        <br />
                        <small className="text-muted">
                          ID: {member.id} • {member.phone}
                        </small>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {filteredMembers.length > MAX_SEARCH_RESULTS && (
                <small className="text-muted d-block mt-2">
                  {t("print.moreResults", {
                    count: filteredMembers.length - MAX_SEARCH_RESULTS,
                  })}
                </small>
              )}
            </div>
          </div>
        )}

        <div className="alert alert-info mb-0">
          <p className="mb-0">
            <strong>{t("print.instructionsTitle")}</strong>{" "}
            {t("print.instructions")}
            <br />
            <small>
              {t("print.totalMembers", { count: sortedMembers.length })} |{" "}
              {t("print.shown", { count: membersToDisplay.length })} |{" "}
              <strong className="text-primary">
                {t("print.selectedForPrint", { count: membersToPrint.length })}
              </strong>{" "}
              |{" "}
              {t("print.lostCount", {
                count: sortedMembers.filter((m) => m.card_lost === true).length,
              })}
            </small>
            {membersToPrint.length > 0 && (
              <span className="d-block mt-2">
                <small className="text-success">
                  <Trans
                    t={t}
                    i18nKey="print.willPrint"
                    count={membersToPrint.length}
                    components={{ strong: <strong /> }}
                  />
                </small>
              </span>
            )}
          </p>
        </div>
      </div>

      {!printing && membersToDisplay.length > pageSize && (
        <Pagination
          className="d-print-none"
          page={currentPage}
          pageSize={pageSize}
          total={membersToDisplay.length}
          onPageChange={setPage}
          pageSizeOptions={PAGE_SIZES}
          onPageSizeChange={setPageSize}
        />
      )}

      <div className="row g-2" id="print-cards">
        {cardsToRender.map((member) => {
          const selected = selectedCards.has(member.id);
          const printIndex = printIndexOf.get(member.id) ?? -1;
          return (
            <MemberPrintCard
              key={member.id}
              member={member}
              selected={selected}
              pageBreak={
                selected &&
                printIndex > 0 &&
                printIndex % CARDS_PER_PRINTED_PAGE === 0
              }
              onToggleSelect={() => toggleCardSelection(member.id)}
              onPrint={() => handlePrintSingleCard(member)}
              onToggleCardLost={() => toggleCardLost(member)}
              onPrintNew={() => handlePrintNewCard(member)}
            />
          );
        })}
      </div>

      {!printing && membersToDisplay.length > pageSize && (
        <Pagination
          className="d-print-none mt-2"
          page={currentPage}
          pageSize={pageSize}
          total={membersToDisplay.length}
          onPageChange={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
};

export default PrintQRCodesPage;
