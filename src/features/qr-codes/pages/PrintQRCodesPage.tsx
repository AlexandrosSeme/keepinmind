import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckSquare, Printer, Search, Square, X } from "lucide-react";
import { PageHeader } from "@/shared/ui";
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

const PrintQRCodesPage: React.FC = () => {
  const { members } = useMembers();
  const { editMember } = useMemberMutations();
  const toggleCardLost = useToggleCardLost();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [cardLostFilter, setCardLostFilter] = useState<CardLostFilter>("all");

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

  const handlePrint = () => {
    if (membersToPrint.length === 0) {
      alert("Δεν εχετε επιλεξει καμια καρτα για εκτυπωση.");
      return;
    }

    const firstCard = document.querySelector(
      `[data-member-id="${membersToPrint[0].id}"]`,
    );
    if (firstCard) {
      firstCard.scrollIntoView({ behavior: "smooth", block: "nearest" });
      setTimeout(() => window.print(), 300);
      return;
    }
    window.print();
  };

  const handlePrintSingleCard = (member: Member) => {
    setSelectedMember(member);
    setSelectedCards(new Set([member.id]));
    // Let the selection render before opening the print dialog.
    setTimeout(() => window.print(), 100);
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
      const confirmMessage = `Θελετε να ενεργοποιησετε την καρτα του ${member.name} και να εκτυπωσετε νεα καρτα;\n\nΟλα τα δεδομενα του μελους (ονομα, τηλεφωνο, συνδρομη, φωτογραφια) θα παραμεινουν ιδια.`;
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
          title="Καρτες Μελων"
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
                Επιλογη Ολων
              </button>
              <button
                className="btn btn-outline-secondary"
                onClick={() => setSelectedCards(new Set())}
                disabled={membersToDisplay.length === 0}
              >
                <Square size={18} className="me-2" />
                Αποεπιλογη
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePrint}
                disabled={membersToPrint.length === 0}
              >
                <Printer size={18} className="me-2" />
                Εκτυπωση ({membersToPrint.length})
              </button>
            </>
          }
        />

        <div className="card border-0 shadow-sm mb-3 km-toolbar-card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold">
                  Αναζητηση Μελους
                </label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Αναζητηση με ονομα, τηλεφωνο η ID..."
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
                  Κατασταση Καρτας
                </label>
                <select
                  className="form-select"
                  value={cardLostFilter}
                  onChange={(e) =>
                    setCardLostFilter(e.target.value as CardLostFilter)
                  }
                  disabled={!!selectedMember}
                >
                  <option value="all">Ολες οι Καρτες</option>
                  <option value="active">Ενεργες Καρτες</option>
                  <option value="lost">Ακυρωμενες Καρτες</option>
                </select>
              </div>
            </div>
            {searchTerm && !selectedMember && (
              <div className="mt-2">
                <small className="text-muted">
                  Βρεθηκαν {filteredMembers.length} μελη
                </small>
              </div>
            )}
          </div>
        </div>

        {selectedMember && (
          <div className="alert alert-success d-flex justify-content-between align-items-center">
            <div>
              <strong>Επιλεγμενο μελος:</strong> {selectedMember.name} (ID:{" "}
              {selectedMember.id})
            </div>
            <button
              className="btn btn-sm btn-outline-success"
              onClick={handleClearSelection}
            >
              <X size={16} className="me-1" />
              Καθαρισμος
            </button>
          </div>
        )}

        {searchTerm && !selectedMember && filteredMembers.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="mb-2">Αποτελεσματα Αναζητησης:</h6>
              <div className="list-group km-print-search-results">
                {filteredMembers.map((member) => (
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
            </div>
          </div>
        )}

        <div className="alert alert-info mb-0">
          <p className="mb-0">
            <strong>Οδηγιες:</strong> Επιλεξτε τις καρτες που θελετε να
            εκτυπωσετε κανοντας κλικ στο checkbox. Αναζητηστε ενα μελος για να
            φιλτραρετε, η αφηστε κενο για να δειτε ολα.
            <br />
            <small>
              Συνολικα μελη: {sortedMembers.length} | Εμφανιζονται:{" "}
              {membersToDisplay.length} |{" "}
              <strong className="text-primary">
                Επιλεγμενα για εκτυπωση: {membersToPrint.length}
              </strong>{" "}
              | Ακυρωμενες:{" "}
              {sortedMembers.filter((m) => m.card_lost === true).length}
            </small>
            {membersToPrint.length > 0 && (
              <span className="d-block mt-2">
                <small className="text-success">
                  ✓ Θα εκτυπωθουν <strong>{membersToPrint.length}</strong>{" "}
                  {membersToPrint.length === 1 ? "καρτα" : "καρτες"} (επιλεξτε
                  οποιεσδηποτε καρτες, ακομα και αυτες που ειναι στο κατω μερος
                  της λιστας)
                </small>
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="row g-2" id="print-cards">
        {membersToDisplay.map((member) => {
          const selected = selectedCards.has(member.id);
          const printIndex = membersToPrint.findIndex(
            (m) => m.id === member.id,
          );
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
    </div>
  );
};

export default PrintQRCodesPage;
