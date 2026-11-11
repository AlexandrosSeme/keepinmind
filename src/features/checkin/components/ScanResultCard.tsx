import React from "react";
import { useTranslation } from "react-i18next";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";
import type { ValidationResult } from "../types";

interface ScanResultCardProps {
  result: ValidationResult | null;
  onReset: () => void;
}

const ScanResultCard: React.FC<ScanResultCardProps> = ({ result, onReset }) => {
  const { t } = useTranslation("checkin");

  return (
    <div className="card border-0 shadow-sm">
      <div className="card-body">
        <h5 className="mb-3">{t("result.title")}</h5>

        {!result ? (
          <div className="text-center text-muted py-5">
            <AlertCircle size={48} className="mb-3 opacity-50" />
            <p>{t("result.empty")}</p>
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
                <h6>{t("result.memberDetails")}</h6>
                <div className="border-top pt-3">
                  <div className="mb-2">
                    <small className="text-muted">ID:</small>
                    <p className="mb-0 fw-bold text-primary">
                      #{result.member.id}
                    </p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">{t("result.name")}</small>
                    <p className="mb-0 fw-semibold">{result.member.name}</p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">{t("result.phone")}</small>
                    <p className="mb-0">{result.member.phone}</p>
                  </div>
                  <div className="mb-2">
                    <small className="text-muted">{t("result.package")}</small>
                    <p className="mb-0">{result.member.package}</p>
                  </div>
                  <div>
                    <small className="text-muted">{t("result.expiry")}</small>
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
                {t("result.newScan")}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanResultCard;
