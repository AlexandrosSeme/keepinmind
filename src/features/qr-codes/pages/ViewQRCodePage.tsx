import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, QrCode, ScanLine } from "lucide-react";
import { useMembers } from "@/features/members";
import { isBarcodeMember } from "../lib";
import "./ViewQRCodePage.scss";

const ViewQRCode: React.FC = () => {
  const { members } = useMembers();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [manualId, setManualId] = useState<string>("");

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.id.toString().includes(searchTerm),
  );

  const handleViewQR = (memberId: number) => {
    navigate(`/user-qr?id=${memberId}`);
  };

  const handleManualView = () => {
    const id = parseInt(manualId);
    if (isNaN(id) || id <= 0) {
      alert("Παρακαλω εισαγετε εγκυρο ID μελους");
      return;
    }
    navigate(`/user-qr?id=${id}`);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h2 className="mb-4">
            <QrCode className="me-2" size={28} />
            Προβολη QR Code Μελους
          </h2>
        </div>
      </div>

      <div className="row">
        {/* Search and Select Member */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Επιλογη Μελους</h5>

              {/* Search */}
              <div className="mb-3">
                <label className="form-label">Αναζητηση Μελους</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Αναζητηση με ονομα η τηλεφωνο..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Members List */}
              <div className="border rounded km-view-qr__list">
                {filteredMembers.length === 0 ? (
                  <div className="p-3 text-center text-muted">
                    <p className="mb-0">Δεν βρεθηκαν μελη</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {filteredMembers.map((member) => {
                      const isBarcode = isBarcodeMember(member.id);
                      return (
                        <button
                          key={member.id}
                          type="button"
                          className={`list-group-item list-group-item-action ${
                            selectedMemberId === member.id.toString()
                              ? "active"
                              : ""
                          } ${isBarcode ? "border-start border-3 border-info" : ""}`}
                          onClick={() => {
                            setSelectedMemberId(member.id.toString());
                            handleViewQR(member.id);
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center">
                            <div className="flex-grow-1">
                              <div className="d-flex align-items-center gap-2">
                                <div className="fw-semibold">{member.name}</div>
                                {isBarcode && (
                                  <span className="badge bg-info text-dark">
                                    <ScanLine size={12} className="me-1" />
                                    Barcode
                                  </span>
                                )}
                              </div>
                              <small className="text-muted d-block">
                                {member.phone} • {member.package}
                              </small>
                              {isBarcode && (
                                <small className="text-info d-block mt-1">
                                  <strong>Barcode ID:</strong> {member.id}
                                </small>
                              )}
                            </div>
                            {isBarcode ? (
                              <ScanLine size={20} className="text-info" />
                            ) : (
                              <QrCode size={20} />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Manual ID Input */}
              <div className="mt-4 pt-3 border-top">
                <label className="form-label">Η εισαγετε ID μελους:</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID μελους"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        handleManualView();
                      }
                    }}
                  />
                  <button
                    className="btn btn-primary"
                    type="button"
                    onClick={handleManualView}
                  >
                    Προβολη QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Οδηγιες</h5>
              <div className="alert alert-info mb-0">
                <p className="mb-2">
                  <strong>Για τον Admin:</strong>
                </p>
                <ul className="mb-0 ps-3">
                  <li>Επιλεξτε μελος απο τη λιστα η εισαγετε ID</li>
                  <li>Θα ανοιξει η σελιδα με το QR code του μελους</li>
                  <li>Μπορειτε να το σαρωσετε με το QR Scanner</li>
                </ul>
              </div>

              <div className="mt-4">
                <h6 className="mb-2">Link για End Users:</h6>
                <div className="alert alert-light border">
                  <code className="small">
                    /my-qr?id=123
                    <br />
                    η
                    <br />
                    /my-qr?phone=6912345678
                  </code>
                </div>
                <p className="small text-muted mb-0">
                  Στειλτε αυτο το link στους χρηστες για να δουν το QR code τους
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewQRCode;
