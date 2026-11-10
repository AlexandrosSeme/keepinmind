import React from "react";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { ValidationResult } from "../types";

interface ScanResultCardProps {
  result: ValidationResult | null;
  onReset: () => void;
}

const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onReset }) => (
  <div className="card border-0 shadow-sm">
    <div className="card-body">
      <h5 className="mb-3">Αποτελεσμα Επικυρωσης</h5>

      {!result ? (
        <div className="text-center text-muted py-5">
          <AlertCircle size={48} className="mb-3 opacity-50" />
          <p>Σαρωστε ενα QR code για να δειτε το αποτελεσμα</p>
        </div>
      ) : (
        <div>
          <div
            className={`alert ${result.valid ? "alert-success" : "alert-danger"} d-flex align-items-center`}
            role="alert"
          >
            {result.valid ? (
              <CheckCircle className="me-2" size={24} />
            ) : (
              <XCircle className="me-2" size={24} />
            )}
            <div>
              <strong>{result.message}</strong>
              {result.reason && (
                <div className="small mt-1">{result.reason}</div>
              )}
            </div>
          </div>

          {result.member && (
            <div className="mt-3">
              <h6>Στοιχεια Μελους:</h6>
              <div className="border-top pt-3">
                <div className="mb-2">
                  <small className="text-muted">ID:</small>
                  <p className="mb-0 fw-bold text-primary">
                    #{result.member.id}
                  </p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Ονομα:</small>
                  <p className="mb-0 fw-semibold">{result.member.name}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Τηλεφωνο:</small>
                  <p className="mb-0">{result.member.phone}</p>
                </div>
                <div className="mb-2">
                  <small className="text-muted">Πακετο:</small>
                  <p className="mb-0">{result.member.package}</p>
                </div>
                <div>
                  <small className="text-muted">Ληξη:</small>
                  <p className="mb-0">{result.member.expiry}</p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-3">
            <button
              className="btn btn-outline-secondary w-100"
              onClick={onReset}
            >
              Νεα Σαρωση
            </button>
          </div>
        </div>
      )}
    </div>
  </div>
);

export default ScanResultCard;
