import React, { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import Barcode from "react-barcode";
import { useAppData } from "../contexts/AppDataContext";
import { useSearchParams, useNavigate } from "react-router-dom";
import type { Member } from "../types";
import { Printer, Search, X, CheckSquare, Square, CreditCard, AlertTriangle } from "lucide-react";
import gymLogo from "../assets/gym.png";
import "./PrintAllQRCodes.css";

// Helper function to check if member uses barcode (IDs 1001-1005)
const isBarcodeMember = (memberId: number): boolean => {
  return memberId >= 1001 && memberId <= 1005;
};

const PrintAllQRCodes: React.FC = () => {
  const { members, editMember } = useAppData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [sortedMembers, setSortedMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [selectedCards, setSelectedCards] = useState<Set<number>>(new Set());
  const [cardLostFilter, setCardLostFilter] = useState<'all' | 'lost' | 'active'>('all');

  useEffect(() => {
    // Sort members by ID
    const sorted = [...members].sort((a, b) => a.id - b.id);
    setSortedMembers(sorted);
    setFilteredMembers(sorted);
    
    // Check if there's an ID in query params
    const memberIdParam = searchParams.get("id");
    if (memberIdParam) {
      const memberId = parseInt(memberIdParam);
      const member = sorted.find(m => m.id === memberId);
      if (member) {
        setSelectedMember(member);
        setSelectedCards(new Set([member.id]));
        return;
      }
    }
    
    // Select all by default
    setSelectedCards(new Set(sorted.map(m => m.id)));
  }, [members, searchParams]);

  useEffect(() => {
    let filtered = sortedMembers;

    // Apply search filter
    if (searchTerm.trim()) {
      filtered = filtered.filter(
        (member) =>
          member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          member.phone.includes(searchTerm) ||
          member.id.toString().includes(searchTerm)
      );
    }

    // Apply card_lost filter
    if (cardLostFilter === 'lost') {
      filtered = filtered.filter(m => m.card_lost === true);
    } else if (cardLostFilter === 'active') {
      filtered = filtered.filter(m => m.card_lost !== true);
    }

    setFilteredMembers(filtered);
  }, [searchTerm, sortedMembers, cardLostFilter]);

  const handlePrint = () => {
    // Verify that only selected cards will be printed
    const cardsToPrint = membersToDisplay.filter(m => selectedCards.has(m.id));
    if (cardsToPrint.length === 0) {
      alert("Δεν εχετε επιλεξει καμια καρτα για εκτυπωση.");
      return;
    }
    
    // Scroll to first selected card to ensure it's in view before printing
    const firstSelectedId = cardsToPrint[0]?.id;
    if (firstSelectedId) {
      const firstSelectedElement = document.querySelector(`[data-member-id="${firstSelectedId}"]`);
      if (firstSelectedElement) {
        firstSelectedElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        // Wait a bit for scroll, then print
        setTimeout(() => {
          window.print();
        }, 300);
        return;
      }
    }
    
    window.print();
  };

  const handlePrintSingleCard = (member: Member, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection toggle
    
    // Select only this member and print
    setSelectedMember(member);
    setSelectedCards(new Set([member.id]));
    
    // Small delay to ensure state updates, then print
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const handleSelectMember = (member: Member) => {
    setSelectedMember(member);
    setSearchTerm("");
    setSelectedCards(new Set([member.id]));
  };

  const handleClearSelection = () => {
    setSelectedMember(null);
    setSelectedCards(new Set(sortedMembers.map(m => m.id)));
  };

  const toggleCardSelection = (memberId: number) => {
    const newSelected = new Set(selectedCards);
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId);
    } else {
      newSelected.add(memberId);
    }
    setSelectedCards(newSelected);
  };

  const selectAllCards = () => {
    setSelectedCards(new Set(membersToDisplay.map(m => m.id)));
  };

  const deselectAllCards = () => {
    setSelectedCards(new Set());
  };

  const membersToDisplay = selectedMember ? [selectedMember] : filteredMembers;
  const membersToPrint = membersToDisplay.filter(m => selectedCards.has(m.id));

  const handleToggleCardLost = async (member: Member, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection toggle
    
    const isCurrentlyLost = member.card_lost === true;
    const confirmMessage = isCurrentlyLost
      ? `Ειστε σιγουροι οτι θελετε να ενεργοποιησετε την καρτα του ${member.name};`
      : `Ειστε σιγουροι οτι θελετε να ακυρωσετε την καρτα του ${member.name};\n\nΑυτο θα εμποδισει τη χρηση της καρτας μεχρι να εκτυπωθει νεα.`;

    if (window.confirm(confirmMessage)) {
      const updated = await editMember(member.id, {
        card_lost: !isCurrentlyLost,
      });
      if (updated) {
        alert(
          isCurrentlyLost
            ? `Η καρτα του ${member.name} ενεργοποιηθηκε επιτυχως.`
            : `Η καρτα του ${member.name} ακυρωθηκε.`
        );
      }
    }
  };

  const handlePrintNewCard = async (member: Member, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card selection toggle
    
    if (member.card_lost === true) {
      // Ενεργοποιηση της καρτας πρωτα
      const confirmMessage = `Θελετε να ενεργοποιησετε την καρτα του ${member.name} και να εκτυπωσετε νεα καρτα;\n\nΟλα τα δεδομενα του μελους (ονομα, τηλεφωνο, συνδρομη, φωτογραφια) θα παραμεινουν ιδια.`;
      
      if (window.confirm(confirmMessage)) {
        const updated = await editMember(member.id, {
          card_lost: false,
        });
        
        if (updated) {
          // Navigate to print page with this member selected
          navigate(`/print-qr-codes?id=${member.id}`);
        }
      }
    } else {
      // Αν η καρτα ειναι ηδη ενεργη, απλα navigate
      navigate(`/print-qr-codes?id=${member.id}`);
    }
  };

  const generateQRValue = (member: Member): string => {
    return JSON.stringify({
      id: member.id,
      memberId: member.id,
      name: member.name,
      phone: member.phone,
      timestamp: Date.now(),
    });
  };

  return (
    <div>
      {/* Print Controls - Hidden when printing */}
      <div className="d-print-none mb-4">
        <div className="km-page-header">
          <h2 className="km-page-title">Καρτες Μελων</h2>
          <div className="d-flex flex-wrap gap-2">
            <button
              className="btn btn-outline-secondary"
              onClick={selectAllCards}
              disabled={membersToDisplay.length === 0}
            >
              <CheckSquare size={18} className="me-2" />
              Επιλογη Ολων
            </button>
            <button
              className="btn btn-outline-secondary"
              onClick={deselectAllCards}
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
          </div>
        </div>

        {/* Search and Filters */}
        <div className="card border-0 shadow-sm mb-3 km-toolbar-card">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-12 col-md-8">
                <label className="form-label fw-semibold">Αναζητηση Μελους</label>
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
                <label className="form-label fw-semibold">Κατασταση Καρτας</label>
                <select
                  className="form-select"
                  value={cardLostFilter}
                  onChange={(e) => setCardLostFilter(e.target.value as 'all' | 'lost' | 'active')}
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

        {/* Selected Member Info */}
        {selectedMember && (
          <div className="alert alert-success d-flex justify-content-between align-items-center">
            <div>
              <strong>Επιλεγμενο μελος:</strong> {selectedMember.name} (ID: {selectedMember.id})
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

        {/* Search Results - Clickable List */}
        {searchTerm && !selectedMember && filteredMembers.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <h6 className="mb-2">Αποτελεσματα Αναζητησης:</h6>
              <div className="list-group" style={{ maxHeight: "200px", overflowY: "auto" }}>
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
                        <small className="text-muted">ID: {member.id} • {member.phone}</small>
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
            <strong>Οδηγιες:</strong> Επιλεξτε τις καρτες που θελετε να εκτυπωσετε κανοντας κλικ στο checkbox. Αναζητηστε ενα μελος για να φιλτραρετε, η αφηστε κενο για να δειτε ολα.
            <br />
            <small>
              Συνολικα μελη: {sortedMembers.length} | 
              Εμφανιζονται: {membersToDisplay.length} | 
              <strong className="text-primary">Επιλεγμενα για εκτυπωση: {membersToPrint.length}</strong> | 
              Ακυρωμενες: {sortedMembers.filter(m => m.card_lost === true).length}
            </small>
            {membersToPrint.length > 0 && (
              <div className="mt-2">
                <small className="text-success">
                  ✓ Θα εκτυπωθουν <strong>{membersToPrint.length}</strong> {membersToPrint.length === 1 ? 'καρτα' : 'καρτες'} (επιλεξτε οποιεσδηποτε καρτες, ακομα και αυτες που ειναι στο κατω μερος της λιστας)
                </small>
              </div>
            )}
          </p>
        </div>
      </div>

      {/* QR/Barcode Cards Grid - Credit Card Size */}
      <div className="row g-2" id="print-cards">
        {(() => {
          // Pre-calculate selected members to print for page break logic
          const selectedToPrint = membersToDisplay.filter(m => selectedCards.has(m.id));
          
          return membersToDisplay.map((member) => {
            const isBarcode = isBarcodeMember(member.id);
            const qrValue = generateQRValue(member);
            const isSelected = selectedCards.has(member.id);
            const shouldPrint = isSelected;
            
            // Calculate position in selected cards for page breaks
            const currentIndex = selectedToPrint.findIndex(m => m.id === member.id);
            const shouldPageBreak = shouldPrint && currentIndex > 0 && currentIndex % 6 === 0;

            return (
              <div
                key={member.id}
                data-member-id={member.id}
                className={`col-12 col-sm-6 col-md-4 col-lg-3 credit-card-container ${!shouldPrint ? 'd-print-none' : ''} ${shouldPageBreak ? 'page-break-before' : ''}`}
                style={{
                  pageBreakInside: "avoid",
                  breakInside: "avoid",
                }}
              >
              <div 
                className={`credit-card ${isSelected ? 'card-selected' : 'card-unselected'} ${member.card_lost === true ? 'card-lost' : ''}`}
                onClick={() => toggleCardSelection(member.id)}
                style={{ cursor: 'pointer' }}
              >
                {/* Selection Checkbox */}
                <div className="card-checkbox d-print-none">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleCardSelection(member.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="form-check-input"
                    style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                  />
                </div>
                {/* Card Lost Badge */}
                {member.card_lost === true && (
                  <div className="card-lost-badge d-print-none">
                    <AlertTriangle size={14} />
                    <span>ΑΚΥΡΩΜΕΝΗ</span>
                  </div>
                )}
                {/* Card Management Buttons */}
                <div className="card-actions d-print-none" onClick={(e) => e.stopPropagation()}>
                  {/* Print Button - Always visible */}
                  <button
                    className="btn btn-sm btn-primary mb-1"
                    onClick={(e) => handlePrintSingleCard(member, e)}
                    title="Εκτυπωση αυτης της καρτας"
                    style={{ width: '100%' }}
                  >
                    <Printer size={12} className="me-1" />
                    Εκτυπωση
                  </button>
                  
                  {/* Card Status Buttons */}
                  {member.card_lost === true ? (
                    <>
                      <button
                        className="btn btn-sm btn-success mb-1"
                        onClick={(e) => handleToggleCardLost(member, e)}
                        title="Ενεργοποιηση Καρτας"
                        style={{ width: '100%' }}
                      >
                        <CreditCard size={12} className="me-1" />
                        Ενεργοποιηση
                      </button>
                      <button
                        className="btn btn-sm btn-warning"
                        onClick={(e) => handlePrintNewCard(member, e)}
                        title="Εκτυπωση Νεας Καρτας (ενεργοποιει και εκτυπωνει)"
                        style={{ width: '100%' }}
                      >
                        <Printer size={12} className="me-1" />
                        Εκτυπωση Νεας
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={(e) => handleToggleCardLost(member, e)}
                      title="Ακυρωση Καρτας"
                      style={{ width: '100%' }}
                    >
                      <AlertTriangle size={12} className="me-1" />
                      Ακυρωση
                    </button>
                  )}
                </div>
                {/* Card Header with Logo */}
                <div className="card-header-custom">
                  <div className="logo-section">
                    <div className="logo-placeholder">
                      <img 
                        src={gymLogo} 
                        alt="Logo" 
                        className="logo-image"
                        onError={(e) => {
                          // Fallback to SVG if image not found
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback = target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'block';
                        }}
                      />
                      <div className="logo-g" style={{ display: 'none' }}>
                        <svg viewBox="0 0 100 100" width="30" height="30">
                          {/* Yellow outer left part of G */}
                          <path
                            d="M 50 20 A 30 30 0 0 1 20 50 A 30 30 0 0 1 50 80 A 30 30 0 0 1 80 50 L 80 65 L 65 65 L 65 60 L 75 60 L 75 55 A 25 25 0 0 0 50 30 A 25 25 0 0 0 25 50 A 25 25 0 0 0 50 70 A 25 25 0 0 0 75 50 L 80 50 A 30 30 0 0 1 50 80 A 30 30 0 0 1 20 50 A 30 30 0 0 1 50 20 Z"
                            fill="#FFD700"
                          />
                          {/* White inner right part of G */}
                          <path
                            d="M 50 30 A 20 20 0 0 1 70 50 L 70 55 L 60 55 L 60 60 L 70 60 L 70 50 A 20 20 0 0 0 50 70 A 20 20 0 0 0 30 50 A 20 20 0 0 0 50 30 Z"
                            fill="#FFFFFF"
                          />
                          {/* White vertical bar to complete the G */}
                          <rect x="60" y="55" width="10" height="10" fill="#FFFFFF" />
                        </svg>
                      </div>
                    </div>
                    <div className="gym-name">
                      <div className="gym-name-main">COLOSSEUM</div>
                      <div className="gym-name-sub">GYM</div>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="card-body-custom">
                  {/* Member Name */}
                  <div className="member-name">{member.name}</div>

                  {/* QR Code or Barcode */}
                  <div className="code-section">
                    {isBarcode ? (
                      <div className="barcode-container">
                        <Barcode
                          value={member.id.toString()}
                          format="CODE128"
                          width={2}
                          height={40}
                          displayValue={true}
                          fontSize={12}
                          margin={0}
                        />
                      </div>
                    ) : (
                      <div className="qr-container">
                        <QRCodeSVG
                          value={qrValue}
                          size={60}
                          level="H"
                          includeMargin={false}
                        />
                      </div>
                    )}
                  </div>

                  {/* Member Info */}
                  <div className="member-info">
                    <div className="info-row">
                      <span className="info-label">ID:</span>
                      <span className="info-value">{member.id}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Τηλ:</span>
                      <span className="info-value">{member.phone}</span>
                    </div>
                    <div className="info-row">
                      <span className="info-label">Πακετο:</span>
                      <span className="info-value-small">{member.package}</span>
                    </div>
                    <div className="status-badge">
                      <span
                        className={`status-dot ${
                          member.status === "active"
                            ? "status-active"
                            : member.status === "expiring_soon"
                            ? "status-warning"
                            : "status-expired"
                        }`}
                      ></span>
                      <span className="status-text">
                        {member.status === "active"
                          ? "ΕΝΕΡΓΗ"
                          : member.status === "expiring_soon"
                          ? "ΛΗΓΕΙ ΣΟΝΤΟΜΑ"
                          : "ΛΗΓΜΕΝΗ"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
          });
        })()}
      </div>
    </div>
  );
};

export default PrintAllQRCodes;

