import React from "react";
import { useTranslation } from "react-i18next";
import "./QrLoading.scss";

const QrLoading: React.FC<{ className?: string }> = ({ className = "" }) => {
  const { t } = useTranslation();

  return (
    <div
      className={`d-flex justify-content-center align-items-center vh-100 ${className}`.trim()}
    >
      <div className="text-center">
        <div
          className="spinner-border text-primary mb-3 km-qr-loading__spinner"
          role="status"
        >
          <span className="visually-hidden">{t("loading")}</span>
        </div>
        <p className="text-muted">{t("loading")}</p>
      </div>
    </div>
  );
};

export default QrLoading;
