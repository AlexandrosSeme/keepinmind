import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, QrCode } from "lucide-react";
import { useAppData } from "../contexts/AppDataContext";

const ViewQRCode: React.FC = () => {
  const { members } = useAppData();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMemberId, setSelectedMemberId] = useState<string>("");
  const [manualId, setManualId] = useState<string>("");

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
  );

  const handleViewQR = (memberId: number) => {
    navigate(`/user-qr?id=${memberId}`);
  };

  const handleManualView = () => {
    const id = parseInt(manualId);
    if (isNaN(id) || id <= 0) {
      alert("Παρακαλώ εισάγετε έγκυρο ID μέλους");
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
            Προβολή QR Code Μέλους
          </h2>
        </div>
      </div>

      <div className="row">
        {/* Search and Select Member */}
        <div className="col-12 col-md-6 mb-4">
          <div className="card border-0 shadow-sm">
            <div className="card-body">
              <h5 className="mb-3">Επιλογή Μέλους</h5>

              {/* Search */}
              <div className="mb-3">
                <label className="form-label">Αναζήτηση Μέλους</label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Search size={18} />
                  </span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Αναζήτηση με όνομα ή τηλέφωνο..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {/* Members List */}
              <div
                className="border rounded"
                style={{ maxHeight: "400px", overflowY: "auto" }}
              >
                {filteredMembers.length === 0 ? (
                  <div className="p-3 text-center text-muted">
                    <p className="mb-0">Δεν βρέθηκαν μέλη</p>
                  </div>
                ) : (
                  <div className="list-group list-group-flush">
                    {filteredMembers.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        className={`list-group-item list-group-item-action ${
                          selectedMemberId === member.id.toString()
                            ? "active"
                            : ""
                        }`}
                        onClick={() => {
                          setSelectedMemberId(member.id.toString());
                          handleViewQR(member.id);
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-semibold">{member.name}</div>
                            <small className="text-muted">
                              {member.phone} • {member.package}
                            </small>
                          </div>
                          <QrCode size={20} />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Manual ID Input */}
              <div className="mt-4 pt-3 border-top">
                <label className="form-label">Ή εισάγετε ID μέλους:</label>
                <div className="input-group">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="ID μέλους"
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
                    Προβολή QR
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
              <h5 className="mb-3">Οδηγίες</h5>
              <div className="alert alert-info mb-0">
                <p className="mb-2">
                  <strong>Για τον Admin:</strong>
                </p>
                <ul className="mb-0 ps-3">
                  <li>Επιλέξτε μέλος από τη λίστα ή εισάγετε ID</li>
                  <li>Θα ανοίξει η σελίδα με το QR code του μέλους</li>
                  <li>Μπορείτε να το σαρώσετε με το QR Scanner</li>
                </ul>
              </div>

              <div className="mt-4">
                <h6 className="mb-2">Link για End Users:</h6>
                <div className="alert alert-light border">
                  <code className="small">
                    /my-qr?id=123
                    <br />
                    ή
                    <br />
                    /my-qr?phone=6912345678
                  </code>
                </div>
                <p className="small text-muted mb-0">
                  Στείλτε αυτό το link στους χρήστες για να δουν το QR code τους
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

